import pytest

from search.input_check import BLOCK_MESSAGE, check_keywords

MAX = 60


@pytest.mark.parametrize("text,reason", [
    ("contact jo.smith@example.com", "email"),
    ("call 206-555-0147", "phone"),
    ("call (206) 555 0147", "phone"),
    ("taken from 1420 Maple Ave", "street address"),
    ("near 88 N 45th St", "street address"),
    ("seen on 300 Lakeview Blvd", "street address"),
    ("case #4417", "case number"),
    ("ref CC-2026-004417", "case number"),
    ("report 24-118832", "case number"),
    ("serial C02XK8J9JGH5", "serial-like string"),
    ("x" * (MAX + 1), f"over {MAX} characters"),
])
def test_blocks_each_pattern(text, reason):
    r = check_keywords(text, MAX)
    assert not r.ok
    assert reason in r.reasons
    assert r.message == BLOCK_MESSAGE


@pytest.mark.parametrize("text", ["", "sticker on lid", "engraved initials on back", "vega15 charger", "DR 20 with two batteries", "black case, cracked corner"])
def test_passes_clean_item_details(text):
    assert check_keywords(text, MAX).ok
