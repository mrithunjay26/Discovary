"""Synthetic benchmark on the planted scenarios S1-S3.

Prints recall@10 and the number of false positives shown. The listings and images are
planted fake data, so these numbers say nothing about real-world performance.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from search.config import DATA, load_config  # noqa: E402
from search.matcher import Index, score_all, search  # noqa: E402
from search.scenarios import SCENARIOS, query_of  # noqa: E402

LABEL = "Synthetic benchmark. Not evidence of real-world performance."


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    cfg = load_config()
    index = Index(DATA)
    planted = json.loads((DATA / "scenarios.json").read_text(encoding="utf-8"))
    print(LABEL)
    print(f"Config {cfg['version']} · threshold {cfg['threshold']} · embedder {index.meta['embedder']}\n")

    # S1: planted true matches should be ranked; decoys and everything else are false positives.
    r = search(query_of("S1"), index, cfg)
    truth = set(planted["S1"]["true_matches"])
    top10 = set(r.listing_ids[:10])
    print(f"{SCENARIOS['S1']['label']}: outcome={r.outcome}, shown={len(r.leads)}")
    print(f"   recall@10 = {len(truth & top10)}/{len(truth)} = {len(truth & top10) / len(truth):.2f}")
    print(f"   false positives shown = {len(set(r.listing_ids) - truth)}")

    # S2: the common model should trigger the 'too many to rank' state (nothing ranked).
    r = search(query_of("S2"), index, cfg)
    print(f"{SCENARIOS['S2']['label']}: outcome={r.outcome}, listings above threshold={len(r.leads)} (max_ranked={cfg['max_ranked']})")
    print("   ranked results shown = 0 (unranked list only)" if r.outcome == "too_many" else f"   unexpected: {r.message}")

    # S3: nothing should be shown.
    r = search(query_of("S3"), index, cfg)
    print(f"{SCENARIOS['S3']['label']}: outcome={r.outcome}, false positives shown = {len(r.leads)}")

    # Score margins behind the frozen threshold (how it was calibrated).
    s1 = score_all(query_of("S1"), index, cfg)
    s3 = score_all(query_of("S3"), index, cfg)
    min_true = min(l.final_score for l in s1 if l.id in truth)
    max_other = max([l.final_score for l in s1 if l.id not in truth] + [l.final_score for l in s3])
    print(f"\nMargins: lowest S1 true match {min_true:.3f} · highest non-match in S1/S3 {max_other:.3f} · threshold {cfg['threshold']}")
    print(LABEL)


if __name__ == "__main__":
    main()
