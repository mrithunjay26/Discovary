"""Builds the search index from data/listings.csv and data/catalog.yaml.

1. Normalize listing text with rules (lowercase, abbreviations, aliases, keyword extraction).
2. Embed every listing photo and every official reference photo once.
3. Collapse duplicate reposts (near-identical photo + similar normalized title + same price); keep the earliest.
4. Save a copy of each listing photo to data/captured/ with a capture timestamp.
"""
from __future__ import annotations

import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from rapidfuzz import fuzz

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from search.config import DATA, load_config  # noqa: E402
from search.embedder import get_embedder  # noqa: E402
from search.normalize import Normalizer, load_catalog  # noqa: E402


def main() -> None:
    cfg = load_config()
    catalog = load_catalog(DATA / "catalog.yaml")
    norm = Normalizer(catalog)
    df = pd.read_csv(DATA / "listings.csv", dtype=str)
    df["price"] = df["price"].astype(int)

    # 1. rule-based normalization
    df["norm_title"] = df["title"].map(norm.clean)
    df["norm_text"] = (df["title"] + " " + df["description"]).map(norm.clean)
    ext = df["norm_text"].map(norm.extract).apply(pd.Series)
    df[["ext_brand", "ext_model", "ext_color", "ext_category"]] = ext[["brand", "model", "color", "category"]]

    # 2. embeddings (the only model step; runs once here, never at query time)
    emb = get_embedder(allow_download=True)
    print(f"Embedding {len(df)} listing photos with {emb.name} ...")
    vecs = emb.embed_images([str(ROOT / p) for p in df["photo_path"]])
    refs = pd.DataFrame([{"model_key": m["key"], "angle": i, "path": p}
                         for m in catalog for i, p in enumerate(m["reference_images"])])
    ref_vecs = emb.embed_images([str(ROOT / p) for p in refs["path"]])

    # 3. duplicates: earliest listing kept, later reposts collapsed into it
    order = df.sort_values(["date_posted", "id"]).index.to_list()
    sims = vecs @ vecs.T
    dup_of: dict[int, int] = {}
    kept: list[int] = []
    for i in order:
        for k in kept:
            same_price = abs(df.at[i, "price"] - df.at[k, "price"]) <= df.at[k, "price"] * cfg["dedupe_price_pct"] / 100
            if (sims[i, k] >= cfg["dedupe_image_sim"] and same_price
                    and fuzz.ratio(df.at[i, "norm_title"], df.at[k, "norm_title"]) >= cfg["dedupe_text_sim"]):
                dup_of[i] = k
                break
        else:
            kept.append(i)
    also = {k: [] for k in kept}
    for i, k in dup_of.items():
        also[k].append({"id": df.at[i, "id"], "source": df.at[i, "source"], "url": df.at[i, "url"], "date_posted": df.at[i, "date_posted"]})
    df["also_posted"] = [json.dumps(also.get(i, [])) for i in df.index]

    # 4. captured copies with a capture timestamp
    cap_dir = DATA / "captured"
    shutil.rmtree(cap_dir, ignore_errors=True)
    cap_dir.mkdir(parents=True)
    captured_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    df["captured_path"] = ""
    df["captured_at"] = captured_at
    for i in df.index:
        dst = cap_dir / f"{df.at[i, 'id']}.jpg"
        shutil.copyfile(ROOT / df.at[i, "photo_path"], dst)
        df.at[i, "captured_path"] = dst.relative_to(ROOT).as_posix()

    keep_idx = sorted(kept)
    out = df.loc[keep_idx].reset_index(drop=True)
    out.to_parquet(DATA / "index.parquet", index=False)
    np.save(DATA / "listing_vecs.npy", vecs[keep_idx])
    refs.to_parquet(DATA / "refs.parquet", index=False)
    np.save(DATA / "ref_vecs.npy", ref_vecs)
    pd.DataFrame([{"duplicate_id": df.at[i, "id"], "kept_id": df.at[k, "id"]} for i, k in dup_of.items()]).to_csv(DATA / "duplicates.csv", index=False)
    meta = {
        "embedder": emb.name, "built_at": captured_at, "config_version": cfg["version"],
        "n_listings_raw": len(df), "n_indexed": len(out), "n_duplicates_collapsed": len(dup_of),
        "sources": sorted(df["source"].unique().tolist()),
    }
    (DATA / "index_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"Indexed {len(out)} listings ({len(dup_of)} duplicate reposts collapsed). Embedder: {emb.name}.")


if __name__ == "__main__":
    main()
