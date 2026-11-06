"""Demo scenario form values. The sidebar buttons fill the search form with these."""

SCENARIOS = {
    "S1": {"label": "S1 · Distinctive laptop", "category": "laptop", "brand": "Corvane", "model": "Vega 15",
           "color": "black", "region": "Northside", "window_days": 30, "keywords": ""},
    "S2": {"label": "S2 · Common tablet", "category": "tablet", "brand": "Pebblo", "model": "Tab 10",
           "color": "white", "region": "Eastside", "window_days": 30, "keywords": ""},
    "S3": {"label": "S3 · Camera, no match", "category": "camera", "brand": "Optiva", "model": "Snapline X",
           "color": "silver", "region": "Downtown", "window_days": 30, "keywords": ""},
    "S4": {"label": "S4 · Blocked input", "category": "laptop", "brand": "Corvane", "model": "Vega 15",
           "color": "black", "region": "Northside", "window_days": 30,
           "keywords": "taken from 1420 Maple Ave, call 206-555-0147"},
}

FORM_FIELDS = ("category", "brand", "model", "color", "region", "window_days", "keywords")


def query_of(key: str) -> dict:
    return {k: SCENARIOS[key][k] for k in FORM_FIELDS}
