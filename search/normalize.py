"""Rule-based text cleanup for messy listing text. No model is involved.

Steps: lowercase, strip punctuation, expand abbreviations, expand catalog aliases to the
canonical model name, then extract brand, model, color and category from keyword lists.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml
from rapidfuzz import fuzz, process

ABBREVIATIONS = {
    "blk": "black", "slvr": "silver", "slv": "silver", "wht": "white", "blu": "blue",
    "gry": "gray", "grey": "gray", "ylw": "yellow", "grn": "green", "gld": "gold",
    "lptp": "laptop", "w/": "with", "grt": "great", "gud": "good", "cond": "condition",
    "obo": "or best offer", "hdphn": "headphones", "hdphns": "headphones", "cam": "camera",
}
COLORS = ["black", "silver", "white", "blue", "red", "gray", "yellow", "green", "gold"]
CATEGORY_WORDS = {
    "laptop": ["laptop", "notebook"],
    "tablet": ["tablet"],
    "camera": ["camera"],
    "game console": ["console", "gaming"],
    "power tool": ["drill", "driver"],
    "bicycle": ["bike", "bicycle", "29er"],
    "pendant necklace": ["necklace", "pendant", "chain"],
    "headphones": ["headphones", "headset"],
}


def load_catalog(path: str | Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)["models"]


def _basic(text: str) -> str:
    text = (text or "").lower().replace("w/", " with ")
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    words = [ABBREVIATIONS.get(w, w) for w in text.split()]
    return " ".join(words)


class Normalizer:
    def __init__(self, catalog: list[dict]):
        self.catalog = catalog
        self.brands = sorted({m["brand"].lower() for m in catalog})
        # alias -> canonical model text, longest alias first so "vega 15 laptop" wins over "vega15"
        pairs = []
        for m in catalog:
            canon = m["model"].lower()
            for a in m.get("aliases", []):
                a = _basic(a)
                # keep the brand if the alias carried it ("corvane v15" -> "corvane vega 15")
                pairs.append((a, f"{m['brand'].lower()} {canon}" if m["brand"].lower() in a.split() else canon))
        self.aliases = sorted(pairs, key=lambda p: -len(p[0]))

    def clean(self, text: str) -> str:
        t = f" {_basic(text)} "
        for alias, canon in self.aliases:
            t = re.sub(rf"(?<= ){re.escape(alias)}(?= )", canon, t)
        return re.sub(r"\s+", " ", t).strip()

    def extract(self, cleaned: str) -> dict:
        tokens = cleaned.split()
        brand = None
        for tok in tokens:
            hit = process.extractOne(tok, self.brands, scorer=fuzz.ratio, score_cutoff=80)
            if hit:
                brand = hit[0]
                break
        model = None
        padded = f" {cleaned} "
        for m in sorted(self.catalog, key=lambda m: -len(m["model"])):
            if f" {m['model'].lower()} " in padded and (brand is None or m["brand"].lower() == brand):
                model = m
                break
        color = next((c for c in COLORS if c in tokens), None)
        category = model["category"] if model else next(
            (cat for cat, words in CATEGORY_WORDS.items() if any(w in tokens for w in words)), None)
        return {
            "brand": model["brand"].lower() if model else brand,
            "model": model["model"].lower() if model else None,
            "color": color,
            "category": category,
        }
