# TraceBack: Property Lead Finder

A local prototype for a case competition set in the fictional **Cascade City**. A burglary detective describes stolen items with a short structured form. TraceBack searches a **synthetic** set of resale listings and compares each listing photo with the official product photo. It returns a **Property Lead Package** of possible matches, each with a link, saved photo, price, date and templated match factors.

It is **retrieval only**. It never generates text, never guesses, never reads case files, and never learns from use. A listing match is a lead, not proof.

> **PROTOTYPE. Synthetic data only.** All brands, models, listings, sources, regions and images are invented. Nothing here reflects any real department, marketplace or person.

## Hard rules (enforced in code and tests)

| Rule | Where it is enforced |
|---|---|
| No LLM or generative model, no AI API calls, no network calls at query time | `tests/test_rules.py` statically checks imports; the app never loads a model and only reads the prebuilt index |
| The only model is pretrained `clip-ViT-B-32` (sentence-transformers), used as released | `search/embedder.py`; runs once at index-build time |
| Synthetic data only, fictional brands, nothing downloaded or scraped | `scripts/generate_data.py` |
| No face detection or recognition | Only item photos are compared; no face model exists in the code |
| No feedback or rating UI; the tool never adapts | `config.yaml` is loaded once into a read-only mapping; tests check the app has no feedback widgets |
| Match factors are templates filled from computed numbers | `search/matcher.py` (`_factors`) |
| Never reads case files; the only input is the structured form | The form has dropdowns plus one 60-character keyword field, checked by `search/input_check.py` |

## Setup and run

Requires Python 3.11. Setup downloads the CLIP weights once; after that everything works offline.

```bash
./setup.sh                          # venv + CPU PyTorch + dependencies + CLIP weights
source .venv/bin/activate           # Windows Git Bash: source .venv/Scripts/activate
python scripts/generate_data.py     # synthetic catalog, images and ~390 listings (seeded)
python scripts/build_index.py       # normalize, dedupe, embed, store
streamlit run app.py                # http://localhost:8501
```

Optional:

```bash
pytest                              # full test suite
python scripts/evaluate.py          # synthetic benchmark (recall@10, false positives)
```

If CLIP cannot load (for example no internet on first run), the index is built with a color-histogram embedder. The app then shows the banner: "Fallback embedder in use: results are for UI demo only." You can force it with `TRACEBACK_EMBEDDER=histogram`.

## How it works

1. **Form.** The detective enters category, brand, model, color, region, a date window (max 90 days) and up to 60 characters of item keywords. There is no free-text narrative field.
2. **Input check.** Before any search runs, the keywords are blocked if they contain an email, phone number, street address, case number, serial-like string, or more than 60 characters. Blocked text is never searched or logged.
3. **Filters.** Region and date window, relative to the fixed `demo_today` in `config.yaml`.
4. **Scoring.** `final = 0.4 × text_score + 0.6 × image_score`.
   - `text_score`: rapidfuzz on brand, model, color and keywords against the rule-normalized listing text. A missing or different model number is penalized.
   - `image_score`: cosine similarity between the listing photo and the model's official photos, using the best angle.
5. **Outcomes.**
   - Nothing above the frozen threshold: **"No match found."** Weaker guesses are never shown.
   - 1 to 25 above the threshold: ranked leads, best first.
   - More than 25: **"Too many similar listings to rank reliably."** The listings are shown unranked, newest first, with a suggestion to narrow the filters.
6. **Duplicates.** At index time, a repost is collapsed into the earliest listing when the photo is near-identical (cosine ≥ 0.95), the normalized title matches (rapidfuzz ratio ≥ 90) and the price is within 5%. The lead card shows "Also posted" for each collapsed repost.
7. **Audit.** Every search is written to a SQLite log. For blocked attempts, only the timestamp and detective ID are recorded.

Same query, config and index always give the same result.

## Synthetic benchmark

Output of `python scripts/evaluate.py` with CLIP (synthetic benchmark, not evidence of real-world performance):

| Scenario | Result |
|---|---|
| S1 | 3 ranked leads · recall@10 = 3/3 · 0 false positives shown |
| S2 | 32 listings above threshold (more than 25) → "too many to rank", nothing ranked |
| S3 | "No match found" · 0 false positives shown |

The threshold of **0.83** was calibrated once on the planted scenarios and then frozen. It is the midpoint between the lowest S1 true match (0.868) and the highest look-alike decoy (0.795). The highest S3 listing scores 0.592. The reasoning is recorded as a comment in `config.yaml`.

## Project structure

```
app.py                  Streamlit app (pages: Search, Audit log, About)
config.yaml             versioned settings: weights, frozen threshold, limits, demo anchor date
requirements.txt        dependencies (setup.sh installs CPU PyTorch first)
setup.sh                venv + install + one-time CLIP download
prompt.md               the build prompt this prototype was made from
search/
  config.py             loads config.yaml once, read-only
  embedder.py           CLIP wrapper + color-histogram fallback, embed_images(paths)
  normalize.py          rule-based text cleanup and alias expansion
  input_check.py        blocks personal and case details
  matcher.py            filters, scoring, outcome logic, templated match factors
  audit.py              SQLite audit log
  scenarios.py          demo scenario form values S1-S4
scripts/
  generate_data.py      catalog, listings and images (seeded, offline)
  build_index.py        normalize, dedupe, embed, capture, store
  evaluate.py           synthetic benchmark
data/                   generated (git-ignored); put licensed photos in data/raw_images/<category>/ to use them
tests/                  pytest suite
```

## Demo scenarios

Each sidebar button fills the form and runs the search, so the demo needs no typing.

| Button | Query | Expected result |
|---|---|---|
| **S1 · Distinctive laptop** | Corvane Vega 15, black, Northside, 30 days | 3 ranked leads. The 4 look-alike Vega 13 decoys are excluded, and a repost of one match is collapsed into it. |
| **S2 · Common tablet** | Pebblo Tab 10, white, Eastside, 30 days | "Too many similar listings to rank reliably." |
| **S3 · Camera, no match** | Optiva Snapline X, silver, Downtown, 30 days | "No match found." (The model is listed in other regions and outside the window.) |
| **S4 · Blocked input** | Keywords contain a street address and phone number | Blocked before any search |

### 30-second demo script

1. **(0–10 s) S1.** "A detective describes a stolen laptop. TraceBack finds three listings and puts each saved photo next to the official one, with a link, price, date and match factors. The look-alike sibling model is not shown."
2. **(10–17 s) S2.** "For a very common tablet, it refuses to rank 40-plus look-alikes and asks the detective to narrow the search."
3. **(17–24 s) S4.** "Personal or case details, like an address or phone number, are blocked before any search runs."
4. **(24–30 s) Audit log.** "Every search is logged with who ran it, the query, the config version and the results. The blocked text was never saved."

### 90-second demo script

1. **(0–10 s) Banner and sidebar.** "Synthetic data only, retrieval only. The detective ID stands in for MFA and role-based access."
2. **(10–35 s) S1.** Walk through one lead card: the saved listing photo next to the official reference photo, price, date, source and link, and the templated factors line ("Matched: brand and model text 0.92, visual similarity 0.81, black, posted 4 days ago, Northside."). Point out "Also posted" (a collapsed duplicate) and the search coverage box.
3. **(35–50 s) S2.** The too-many state: the count, the unranked list sorted by date, and the suggestion to narrow.
4. **(50–60 s) S3.** "No match found. It does not show weaker guesses."
5. **(60–70 s) S4.** The blocked message.
6. **(70–80 s) Audit log.** Every search, plus a blocked attempt with no text stored.
7. **(80–90 s) About page.** The five steps, what it does not do, and the limitations. "The detective checks every lead and decides."

## Limitations

- **Synthetic data and images.** Listings, sources, brands and photos are generated. The images are simple drawings with the model name on them, which is much easier than real photos.
- **No real hosting.** The app runs locally. A deployment would need a CJIS-compliant environment.
- **No real authentication.** The detective ID dropdown is a stand-in for MFA and role-based access.
- **The image model can confuse look-alike models.** Sibling products with similar shape and color score close together; text and the model-number rule do much of the separating.
- **Accuracy numbers come from planted fake data.** `scripts/evaluate.py` measures the planted scenarios only. It is not evidence of real-world performance.
- **No real marketplace access has been tested.** Real sources would raise legal, terms-of-service and data-retention questions that this prototype does not address.
- **The threshold is calibrated on three scenarios.** It would need recalibration and a proper validation set before any real use.
