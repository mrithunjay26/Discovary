"""Filters, scoring and outcome logic. Deterministic: same query + config + index = same result.

final = w_text * text_score + w_img * image_score
  text_score  rapidfuzz on brand, model, color and keywords against normalized listing text
  image_score cosine similarity of the listing photo to the queried model's official photos (best angle)
Match factors are templated strings filled from these computed fields. Nothing is written by a model.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import date, timedelta
from pathlib import Path
from typing import Mapping

import numpy as np
import pandas as pd
from rapidfuzz import fuzz

from .config import DATA
from .normalize import Normalizer, load_catalog

MSG_NONE = "No match found."
MSG_TOO_MANY = "Too many similar listings to rank reliably."


@dataclass(frozen=True)
class Lead:
    id: str
    title: str
    description: str
    price: int
    date_posted: str
    region: str
    source: str
    url: str
    captured_path: str
    captured_at: str
    reference_path: str
    text_score: float
    image_score: float
    final_score: float
    days_ago: int
    factors: str
    also_posted: tuple = ()


@dataclass(frozen=True)
class SearchResult:
    outcome: str                  # "ranked" | "too_many" | "none"
    message: str
    leads: tuple[Lead, ...]       # ranked best first, or (too_many) unranked newest first
    n_in_window: int
    window_start: str
    window_end: str
    query: Mapping = field(default_factory=dict)

    @property
    def listing_ids(self) -> list[str]:
        return [lead.id for lead in self.leads]


class Index:
    def __init__(self, data_dir: Path = DATA):
        self.listings = pd.read_parquet(data_dir / "index.parquet")
        self.vecs = np.load(data_dir / "listing_vecs.npy")
        self.refs = pd.read_parquet(data_dir / "refs.parquet")
        self.ref_vecs = np.load(data_dir / "ref_vecs.npy")
        self.meta = json.loads((data_dir / "index_meta.json").read_text(encoding="utf-8"))
        self.catalog = load_catalog(data_dir / "catalog.yaml")
        self.norm = Normalizer(self.catalog)

    def model_entry(self, brand: str, model: str) -> dict:
        for m in self.catalog:
            if m["brand"] == brand and m["model"] == model:
                return m
        raise KeyError(f"{brand} {model} is not in the catalog")


def _digits(s: str) -> set[str]:
    return set(re.findall(r"\d+", s))


def text_score(q: Mapping, norm: Normalizer, listing_text: str, listing_color: str | None) -> tuple[float, bool | None]:
    """Weighted rapidfuzz score in 0..1, plus whether the color matched (None = color not stated)."""
    brand = norm.clean(q["brand"])
    model = norm.clean(q["model"])
    parts = [(0.3, fuzz.partial_ratio(brand, listing_text) / 100)]
    m = fuzz.partial_ratio(model, listing_text) / 100
    if _digits(model) - _digits(listing_text):  # rule: a model number that is missing or different
        m *= 0.6
    parts.append((0.5, m))
    color_ok = None
    if q.get("color") and q["color"] != "any":
        color_ok = None if listing_color is None else listing_color == q["color"]
        parts.append((0.1, 0.5 if color_ok is None else float(color_ok)))
    if q.get("keywords"):
        parts.append((0.1, fuzz.token_set_ratio(norm.clean(q["keywords"]), listing_text) / 100))
    total = sum(w for w, _ in parts)
    return sum(w * s for w, s in parts) / total, color_ok


def _factors(text: float, img: float, color_ok: bool | None, q: Mapping, listing_color: str | None, days: int, region: str) -> str:
    if color_ok is None:
        color = "color not stated in listing" if q.get("color") not in (None, "any") else "any color"
    elif color_ok:
        color = q["color"]
    else:
        color = f"color differs (listing says {listing_color})"
    posted = "posted today" if days == 0 else f"posted {days} day{'s' if days != 1 else ''} ago"
    return f"Matched: brand and model text {text:.2f}, visual similarity {img:.2f}, {color}, {posted}, {region}."


def search(q: Mapping, index: Index, cfg: Mapping) -> SearchResult:
    today = date.fromisoformat(cfg["demo_today"])
    window = max(1, min(int(q["window_days"]), int(cfg["max_window_days"])))
    start = today - timedelta(days=window)
    df = index.listings
    posted = pd.to_datetime(df["date_posted"]).dt.date

    # 1. hard filters: region and date window
    mask = (df["region"] == q["region"]) & (posted >= start) & (posted <= today)
    cand = np.flatnonzero(mask.to_numpy())

    # 2. scoring
    entry = index.model_entry(q["brand"], q["model"])
    ref_rows = index.refs.index[index.refs["model_key"] == entry["key"]].to_numpy()
    sims = index.vecs[cand] @ index.ref_vecs[ref_rows].T if len(cand) else np.zeros((0, len(ref_rows)))
    scored = []
    for j, i in enumerate(cand):
        row = df.iloc[i]
        color = row["ext_color"] if isinstance(row["ext_color"], str) else None
        t, color_ok = text_score(q, index.norm, row["norm_text"], color)
        best = int(np.argmax(sims[j]))
        img = float(max(0.0, sims[j, best]))
        final = cfg["w_text"] * t + cfg["w_img"] * img
        days = (today - posted.iloc[i]).days
        scored.append(Lead(
            id=row["id"], title=row["title"], description=row["description"], price=int(row["price"]),
            date_posted=row["date_posted"], region=row["region"], source=row["source"], url=row["url"],
            captured_path=row["captured_path"], captured_at=row["captured_at"],
            reference_path=index.refs.at[ref_rows[best], "path"],
            text_score=round(t, 4), image_score=round(img, 4), final_score=round(final, 4), days_ago=days,
            factors=_factors(t, img, color_ok, q, color, days, row["region"]),
            also_posted=tuple(json.loads(row["also_posted"])),
        ))

    # 3. threshold, 4. outcomes
    above = [s for s in scored if s.final_score >= cfg["threshold"]]
    common = dict(n_in_window=len(cand), window_start=start.isoformat(), window_end=today.isoformat(), query=dict(q))
    if not above:
        return SearchResult("none", MSG_NONE, (), **common)
    if len(above) > cfg["max_ranked"]:
        unranked = sorted(above, key=lambda s: (s.date_posted, s.id), reverse=True)
        return SearchResult("too_many", MSG_TOO_MANY, tuple(unranked), **common)
    ranked = sorted(above, key=lambda s: (-s.final_score, s.id))
    n = len(ranked)
    return SearchResult("ranked", f"{n} possible lead{'s' if n != 1 else ''} found, ranked best first.", tuple(ranked), **common)


def score_all(q: Mapping, index: Index, cfg: Mapping) -> list[Lead]:
    """Every in-window listing with its score, ignoring the threshold. Used only for calibration."""
    loose = dict(cfg) | {"threshold": -1.0, "max_ranked": 10**9}
    return list(search(q, index, loose).leads)
