# TraceBack prototype: prompt for Claude Code

Paste everything below the line into Claude Code in an empty project folder.

---

Build a local, demo-ready prototype called **TraceBack (Property Lead Finder)** for a case competition set in the fictional "Cascade City." It is a **retrieval-only lead finder for stolen burglary property**. A detective fills in a short structured form describing items taken. The tool searches a **synthetic** set of public-style resale listings, compares each listing photo with the official product photo for the queried make and model, and returns a **Property Lead Package** of possible matches, each with a link, saved photo, price, date, and templated match factors. It never generates text and never guesses.

This is a prototype for a 30-second to 90-second recorded demo. It does not need to be production ready. Keep the code small, readable, and deterministic.

## HARD RULES (enforce in code, README, and tests)

1. No LLM or generative model anywhere. No AI API calls. No network calls at query time.
2. The only model is a pretrained image-embedding model used as released: `clip-ViT-B-32` via `sentence-transformers`. No training or fine-tuning. Weights download once on first setup, then the app works fully offline.
3. Synthetic data only. No scraping, no real brands, no real personal or case data. Invent fictional brands and models.
4. No face detection or recognition. Compare item appearance only.
5. No feedback, rating, or "was this useful" UI anywhere. The tool must not learn from or adapt to user input. Weights and the threshold live in a versioned `config.yaml` and never change at runtime.
6. Match factors are templated strings filled from computed fields (text score, image score, color, region, date). Nothing is written by a model.
7. The tool never connects to or reads any case file or record. Its only input is the structured form below.

## PRIORITIES (if time runs short, cut from the bottom)

- **P0 (must work for the demo):** data generation, index build, search form, input check, matching, the three result states, Lead Package UI, demo scenario buttons.
- **P1:** audit log and the Audit log page, About page.
- **P2:** evaluation script, full test suite, README polish.

Build P0 first and run it end to end before starting P1.

## STACK AND SETUP

- Python 3.11, Streamlit, pandas, numpy, Pillow, rapidfuzz, PyYAML, sqlite3 (standard library), sentence-transformers, pytest.
- Provide `requirements.txt` and a `setup.sh` that creates a venv and installs everything. Prefer the CPU build of PyTorch to keep install fast.
- Put embedding behind a small interface (`embedder.py` with `embed_images(paths) -> np.ndarray`) so the model can be swapped later.
- Fallback: if CLIP cannot load (for example no internet on first run), use a color-histogram embedder and show a visible banner in the UI: "Fallback embedder in use: results are for UI demo only."

## PROJECT STRUCTURE

```
traceback/
  app.py                  # Streamlit app (pages: Search, Audit log, About)
  config.yaml             # versioned settings (weights, threshold, limits, demo anchor date)
  requirements.txt
  setup.sh
  README.md
  search/
    embedder.py           # CLIP wrapper + histogram fallback
    normalize.py          # rule-based text cleanup, alias expansion
    input_check.py        # blocks personal / case details
    matcher.py            # filters, scoring, outcome logic
    audit.py              # SQLite audit log
  scripts/
    generate_data.py      # catalog, listings, images (seeded)
    build_index.py        # normalize, dedupe, embed, store
    evaluate.py           # synthetic benchmark
  data/                   # generated: catalog.yaml, listings.csv, images/, captured/, index files
  tests/
```

## DATA (scripts/generate_data.py, fixed random seed)

**Catalog (`data/catalog.yaml`):** about 12 fictional product models across burglary-typical categories (laptop, game console, camera, power tool, bicycle, pendant necklace, tablet, headphones). Each entry: category, fictional brand, model, aliases (for example "vega15", "vega 15 laptop"), 2 to 3 official reference image paths (different angles).

**Images:**
- If the user placed freely licensed or public-domain photos in `data/raw_images/<category>/`, use them. Otherwise generate simple, clearly synthetic drawn placeholders with Pillow: a distinct silhouette per category, a distinct color per model, and the model name drawn on it so the image model can tell models apart. Print a notice saying images are synthetic.
- Never download anything from the internet in this script.
- Listing photos are augmented versions of reference images (rotate, crop, blur, brightness, background change) so they look "messy" compared with the clean official photo.

**Listings (about 400, `data/listings.csv`):** across 3 fictional sources ("MarketA", "MarketB", "ResaleC") and 4 regions ("Northside", "Eastside", "Downtown", "Southside"). Fields: id, title, messy description (abbreviations, typos, "like new", "obo"), price, date posted, region, source, fake URL, photo path. Dates spread over the last 120 days **relative to a fixed anchor date `demo_today` in `config.yaml`**, so the demo is reproducible on any real date. Include deliberate duplicates (same item reposted on different sources).

**Planted demo scenarios (deterministic):**
- **S1 Distinctive:** laptop, a fictional brand and model, black, Northside, last 30 days. Plant 3 true matches plus 4 decoys of a look-alike sibling model. Expected: 3 ranked leads.
- **S2 Common:** tablet, a very common fictional model, plant 40+ similar listings in Eastside in the last 30 days. Expected: "Too many similar listings to rank."
- **S3 No match:** camera, a fictional model with zero planted listings in the queried region and window. Expected: "No match found."
- **S4 Blocked input:** keywords contain a street address or phone number. Expected: blocked before any search.

## INDEX BUILD (scripts/build_index.py)

1. Normalize listing text with rules only: lowercase, expand aliases from the catalog, extract brand, model, and color from keyword lists, assign category.
2. Remove duplicates (near-identical image embeddings plus similar normalized text). Keep the earliest listing and record the duplicates it collapsed.
3. Embed every listing photo and every official reference image once. Store vectors with listing fields (parquet plus a numpy file, or SQLite).
4. Save a copy of each listing photo to `data/captured/` with a capture timestamp stored in the index.

## CONFIG (config.yaml)

```yaml
version: "1.0.0"
demo_today: "2026-11-01"      # fixed anchor so the demo is reproducible
w_text: 0.4
w_img: 0.6
threshold: 0.0                # calibrate once on S1 to S3, write the value here, then freeze
max_ranked: 25
max_window_days: 90
max_keywords_chars: 60
```

Calibrate the threshold once using the planted scenarios (so S1 returns its true matches and S3 returns nothing), write it into the config with a comment explaining how, and treat it as frozen.

## MATCHING (search/matcher.py)

1. Hard filters: region and date window (relative to `demo_today`).
2. For each remaining listing: `text_score` (0 to 1) from rapidfuzz on brand, model, and keywords against normalized listing title and description. `image_score` (0 to 1) from cosine similarity between the listing photo vector and the queried model's official reference vectors (use the best angle). `final = w_text * text_score + w_img * image_score`.
3. Keep listings with `final >= threshold`.
4. Outcomes:
   - 0 above threshold: show **"No match found."** Do not show weaker guesses.
   - 1 to `max_ranked`: ranked leads, best first.
   - More than `max_ranked`: show **"Too many similar listings to rank reliably."** Show the count, an unranked list sorted by date, and a suggestion to narrow filters.
5. Same query plus same config and index must give identical results.

## APP (app.py, Streamlit)

**Top banner (always visible):** "PROTOTYPE. Synthetic data only. Retrieval only: no case data, no text generation, no learning. A listing match is a lead, not proof."

**Sidebar:**
- Detective ID dropdown labeled "stand-in for MFA and role-based access."
- "Demo scenarios" buttons: S1, S2, S3, S4. Each fills the form with the scenario's values (S4 fills the keywords with an address) so the demo needs no typing.
- Current config version and embedder in use (CLIP or fallback).

**Search page form (structured only):** category, brand, model (filtered by brand), color, region, date window in days (max 90), and one optional "keywords" field (max 60 characters). No free-text narrative field anywhere.

**Input check (search/input_check.py) runs BEFORE any search.** Block emails, phone numbers, street addresses (number plus street-type words such as St, Ave, Rd, Blvd, Dr, Ln, Way), case-number patterns (for example letters and digits with dashes or "case #"), serial-number-like long alphanumeric strings, and anything over the length limit. Show a clear message ("Personal or case details are not allowed here. Use item details only."). Do not run the search. Do not log the blocked text.

**Results (Property Lead Package):**
- Header: number of leads, the outcome message for the three states, and the query summary.
- Each lead card: saved listing photo next to the official reference photo, title, price, date posted, source, link (fake URL), capture timestamp, and templated match factors: text score, image similarity, color, date window, region. Example: "Matched: brand and model text 0.92, visual similarity 0.81, black, posted 4 days ago, Northside."
- **Search coverage box:** which synthetic sources were searched and when.
- No rating buttons, no feedback of any kind.

**Audit log page:** table of every search (see below), newest first.

**About page:** the five-step plain-language explanation (form, approved sources, photo and text comparison, Property Lead Package, detective checks and decides), a "what it does not do" list (does not prove an item is the stolen one, does not identify suspects, does not link burglaries, does not use case data, no face recognition), and a short Limitations section.

## AUDIT LOG (search/audit.py)

SQLite table: timestamp, demo detective ID, structured query (JSON), config version, embedder used, number of results, outcome (ranked, too_many, none), listing IDs returned. Never log blocked input text; log only that a blocked attempt occurred (timestamp and detective ID).

## EVALUATION (scripts/evaluate.py)

Run S1 to S3 and print recall@10 and the number of false positives shown. Label the output: "Synthetic benchmark. Not evidence of real-world performance."

## TESTS (pytest)

- Input check blocks each pattern (email, phone, street address, case number, serial-like string, over-length) and passes clean item input.
- Determinism: same query and config give identical results.
- S1 returns its planted true matches; S2 returns the too-many state; S3 returns the no-match state.
- Duplicate listings are collapsed.
- Static checks: no import of any LLM or AI client library, and no network library (`requests`, `httpx`, `urllib`, `socket`) used in `search/`.
- No UI code path collects ratings or feedback, and config values do not change after startup.
- Blocked input is not written to the audit log.

## README

Include: setup and run commands, the project structure, a **30-second demo script** and a **90-second demo script** using the sidebar scenario buttons (see below), and a plain Limitations section: synthetic data and images, no real hosting, no real authentication, image model can confuse look-alike models, accuracy numbers come from planted fake data, and no real marketplace access has been tested.

Demo order for the 30-second version: S1 (ranked leads) then S2 (too many to rank) then S4 (blocked input) then open the Audit log. The 90-second version adds S3 (no match) and the About page.

## DEFINITION OF DONE

- `./setup.sh` then the data, index, and run commands work from a clean checkout and are printed at the end.
- S1 to S4 behave as specified using only the sidebar buttons.
- `pytest` passes.
- The app works with the internet disconnected after setup.
- The banner, disclaimers, and limitations are visible in the UI and README.

Build in phases: finish and run P0, then P1, then P2. Run the tests after each phase and fix failures before moving on. At the end, print the exact commands to launch the app.
