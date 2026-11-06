from search.matcher import MSG_NONE, MSG_TOO_MANY, search
from search.scenarios import query_of


def test_s1_returns_planted_true_matches(index, cfg, planted):
    r = search(query_of("S1"), index, cfg)
    assert r.outcome == "ranked"
    assert set(r.listing_ids) == set(planted["S1"]["true_matches"])
    assert not set(r.listing_ids) & set(planted["S1"]["decoys"])


def test_s2_too_many_to_rank(index, cfg):
    r = search(query_of("S2"), index, cfg)
    assert r.outcome == "too_many"
    assert r.message == MSG_TOO_MANY
    assert len(r.leads) > cfg["max_ranked"]
    dates = [l.date_posted for l in r.leads]
    assert dates == sorted(dates, reverse=True)  # unranked, newest first


def test_s3_no_match(index, cfg):
    r = search(query_of("S3"), index, cfg)
    assert r.outcome == "none"
    assert r.message == MSG_NONE
    assert r.leads == ()


def test_deterministic(index, cfg):
    for key in ("S1", "S2", "S3"):
        a, b = search(query_of(key), index, cfg), search(query_of(key), index, cfg)
        assert a == b


def test_factors_are_templated(index, cfg):
    for lead in search(query_of("S1"), index, cfg).leads:
        assert lead.factors.startswith("Matched: brand and model text ")
        assert f"{lead.text_score:.2f}" in lead.factors and f"{lead.image_score:.2f}" in lead.factors
        assert lead.region in lead.factors


def test_window_capped_at_max(index, cfg):
    q = query_of("S1") | {"window_days": 500}
    r = search(q, index, cfg)
    assert r.window_start >= "2026-08-03"  # demo_today minus max_window_days


def test_duplicates_collapsed(index, planted):
    ids = set(index.listings["id"])
    repost = planted["S1"]["repost_of_true_match"]
    assert repost not in ids
    kept = index.listings.set_index("id").loc[planted["S1"]["true_matches"][1], "also_posted"]
    assert repost in kept
    assert index.meta["n_duplicates_collapsed"] >= 10
