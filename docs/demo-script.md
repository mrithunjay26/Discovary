# Demo script, slide outline and Q&A prep

**Pitch:** 7 min (including the demo) + 3 min Q&A. Deck < 10 slides. Use the **recorded** demo (live demos fail).

All demo data is **synthetic**: sources, listings, detectives, prices. Every number on a slide comes from `CLAUDE.md` → Numbers. The evidence behind each claim is in `docs/research-brief.md`.

---

## 1. The 75-second recorded demo

**Setup:** `cd prototype && npm run build && npm run start` → http://localhost:3000. Browser at 1920×1080, 100% zoom. Click **Reset demo state** (sidebar) before every take. The app uses a fixed demo clock (Sat Aug 8, 2026, 09:41), so every take looks identical.

A silent screen recording of the exact click path below, with a visible cursor, can be made with `cd prototype && node scripts/record-demo.mjs --video` (needs the app running). Without `--video`, the script checks every number and outcome and saves screenshots. Record the voiceover separately and lay it over the video.

The recording is **~73 s**, timed to this table. If the voiceover runs long, hold the last frame (Impact) in the video editor.

| Time | Screen / action | Voiceover (about 3 words per second) |
|---|---|---|
| 0:00–0:08 | **Lead Search** page (`/`), with the swimlane strip at the top | "Thursday afternoon, a home in Cascade City is burglarized: a laptop, a necklace, a ring. Nationally, less than five percent of stolen electronics value is ever recovered." |
| 0:08–0:18 | Click **Fill demo items** | "The detective works the case in the department's own records system, as today. CascadeAI never sees it. The detective enters only the items: category, model, color, date window, region." |
| 0:18–0:24 | Type `Case 1044` in the MacBook's model field → **red guard message** → **Undo** | "Case numbers, names and addresses are blocked, so police data stays in CJIS systems." |
| 0:24–0:38 | Click **Search public sources**. The **retrieval workflow** runs (~6 s), then the package appears. | "A fixed, auditable workflow searches three public sources and compares listing photos with the public product image: item appearance only, no faces. It ranks with fixed, versioned rules. Nothing is generated. One source returns partial results, and the report says so." |
| 0:38–0:54 | The **87** MacBook card (0:38), then a scroll to the **too broad** necklace and **no match** ring (0:44), then back up | "A MacBook Pro listed two days after the burglary, about 1.2 miles away. Match score 87, a resemblance, not proof, with its link, a saved photo and a timestamp. The necklace is too common to rank. The ring has no match, and CascadeAI says so instead of guessing." |
| 0:54–1:02 | **Export to case file** → **Audit Log** | "The detective decides: export to the case file, or set it aside. Every query and result is logged, with no case data." |
| 1:02–1:13 | **Impact** (2.5 h/week) | "Our honest math: about 940 detective hours a year, $50,600 net, clearance from 13 to 13.8 percent. That doesn't meet the Chief's asks, and a randomized pilot will tell us the real number." |

To convert the recording for PowerPoint or Google Slides, run: `ffmpeg -i demo-output/cascadeai-demo.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart cascadeai-demo.mp4`

**Backup:** take screenshots of each step (the recording script also saves them) and put them on a hidden backup slide.

---

## 2. Slide outline (9 slides, 7:00)

| # | Slide | Owner | Time | Key content (numbers from CLAUDE.md) |
|---|---|---|---|---|
| 1 | **Hook** | *unassigned* | 0:30 | Laptop stolen Thursday, listed Saturday, nobody connects it. 13% clearance (2022) vs 23% (1964) (CCJ). < 5% of stolen electronics value recovered (FBI UCR data, secondary analysis). |
| 2 | **Bottleneck: Stage 6** | Marlin | 0:45 | 15,000 detective h/yr; 27% of minutes but 34% of cost; the only stage that produces clearances. RAND 1975: leads early matter more than more search hours. The property trail is the one you can follow without case data. |
| 3 | **Solution + data boundary** | Jay | 1:00 | V6 swimlane (department system → CascadeAI in GovCloud on public data → detective decides). "Receives / never receives" table. Five fixed steps: Guard → Search → Photo compare → Rank v1.0 → Package. |
| 4 | **Demo (video)** | Jay | 1:15 | The 75 s recording above. |
| 5 | **Cost-benefit** | Mooyoun, Anthony, Sharon | 1:00 | Build $40k, run $15k/yr. 937.5 h → $65,625 gross → **$50,625 net (1.7%)**. Payback ~9.5 months, 3-yr ROI ~132%. Capacity, not cash. Most fragile line is data access (break-even $54,625/yr). |
| 6 | **Clearance logic: what would have to be true** | *unassigned* | 0:45 | +81 → **13.8%** (upper end). Ask = 16.25%, which needs 10 h/week. A 15% net cut needs 18 h/week. Show the V6 table (or the Impact slider screenshot). **Neither ask met at 2.5 h; we say so.** |
| 7 | **Pilot** | Marlin | 0:45 | One unit, 90 days, cases randomly assigned (copying Adams et al. 2024's RCT design). One metric: detective hours on external property cross-referencing, net of verification. Go/no-go at ≥ 2.5 h/week. Publish nulls. |
| 8 | **Ethics** | *unassigned* | 0:30 | No case data, no faces, no seller profiles, not predictive (contrast: Geolitica burglary predictions 0.1% hit rate, The Markup 2023). Resemblance ≠ proof; humans decide. Quarterly audit by area. |
| 9 | **Recommendation + Phase 2 roadmap** | Jay / all | 0:30 | Fund the $40k pilot. Phase 2 (in-CJIS case linking) is the research-backed path to the 10 h/week row: distance + timing classified 86% of burglary pairs vs 58% for MO alone (Markson 2010). Gated by Phase 1 results, CJIS approval and its own pilot. **Not in our numbers.** |

**Speaker rule:** never present a Phase 2 number as a projection. If asked, say "that's what the Phase 2 pilot would measure."

---

## 3. How this maps to judging (100 + 5)

| Category | Where we score it |
|---|---|
| Impact (30) | Slides 2, 5, 6: the right bottleneck, the math shown, and a clear "what would have to be true" path. |
| Feasibility (25) | $40k build, no RMS integration, GovCloud, 60-minute training, risks with fixes (V6 risk table), go/no-go rule. |
| Cost-effectiveness (20) | Every assumption labeled, ROI/payback shown, running costs included, data-access sensitivity disclosed. |
| Ethics & trust (15) | Case-data-free design, no faces, not predictive, audit log on screen, resemblance ≠ proof. |
| Presentation (10) | One story (Thursday → Saturday), one demo, one honest table. |
| **Bonus** | Working prototype (+1). AI beyond obvious automation: item-level visual matching with coverage-aware, threshold-honest retrieval (+1). Creativity: designing *around* CJIS instead of through it (+1). Community-centered: faster answers for victims, no seller profiling (+1). Unusually honest claims: "neither ask is met", plus the break-even disclosure (+1). |

---

## 4. Q&A prep (likely questions, short answers)

1. **"Neither of the Chief's asks is met. Why fund it?"** It's a $40,000 bet with a ~9.5-month payback at our input, and a randomized pilot with a go/no-go rule decides whether it scales. We'd rather show 1.7% we can measure than 15% we can't. The table shows exactly what would have to be true to hit the targets.
2. **"How do you know it saves 2.5 hours a week?"** We don't yet; it's a team input. That's why the pilot uses random assignment and independent timing logs. An RCT of an AI report tool with 85 officers found no time saving despite vendor claims (Adams et al. 2024), so we test before we scale.
3. **"Why not use an LLM / generative AI?"** Generated text can be wrong, and in policing a wrong lead harms people. Every CascadeAI output is an existing public listing with a link, a saved photo and a timestamp. There's nothing to hallucinate.
4. **"Isn't re-typing the items an extra step?"** It's five fields, about 30 seconds. It replaces repeating the same search across several sites. The pilot measures net time, including verification.
5. **"What about common items, like a gold chain?"** The tool says "too broad to rank" instead of pretending. It works best on distinctive items: specific models, recognizable jewelry, branded tools. The pilot reports results by item category.
6. **"Can you legally search those marketplaces?"** Only through authorized data access. Where a source restricts automated access, the coverage report shows the gap. Data access is our most fragile cost line: at ≥ $54,625/yr net savings fall to zero. Real authorized-data subscriptions run from ~$3.3k/yr to ~$58k/yr.
7. **"Why not link cases? That's where clearance is."** The research agrees linking works. Distance and timing classified 86% of burglary pairs correctly (Markson 2010), and linkage models reach AUC 0.90 (Tonkin 2019). But it needs case data, so it belongs inside CJIS as Phase 2, after Phase 1 proves out and with its own approval and pilot.
8. **"What about an innocent person selling a used laptop?"** A match is a resemblance, not proof. We build no seller profiles, and a listing never identifies a suspect. The detective verifies through normal legal process.
9. **"Listing photos show people and homes. Facial recognition?"** None. The comparison is item appearance only: no face detection or recognition, and saved photos are kept only as long as audit policy requires.
10. **"Bias and over-policing?"** CascadeAI isn't predictive. It works one case at a time, on request, and ranks items, not people or neighborhoods. Contrast: The Markup found a predictive policing tool's burglary predictions matched a later crime 0.1% of the time. Quarterly audits check whether follow-ups concentrate by area.
11. **"How will you know the false-positive rate?"** From outcomes in the department's own records (property confirmed, or not), not from user ratings. The tool never learns from clicks, so the measurement can't be gamed.
12. **"If no case data goes in, why GovCloud?"** Queries, detective IDs and audit logs are still law-enforcement information. GovCloud with MFA, RBAC, encryption and audit logging supports CJIS requirements and speeds approval.
13. **"13.8% assumes average yield. Isn't that optimistic?"** Yes, and we label it an upper end. RAND (1975) found extra investigative effort adds less than average. Path 2 (direct leads) isn't counted until the pilot measures it.
