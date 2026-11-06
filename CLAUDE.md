# CLAUDE.md — Discovary / CascadeAI

Case competition project: **"Cracking the Burglary Backlog"** (Group 5). We are consultants for the fictional Cascade City Police Department (pop. ~750k, Seattle-sized), with AI-on-Cloud as tech partner.

**Deadline: deck due Friday 1:00 PM** (share with the organizer). 10-min pitch = 7 min present (incl. demo) + 3 min Q&A. Deck < 10 slides. A 60–90 s **recorded** demo in the deck is the safest option.

Source material (newest first):
- `docs/proposal-v6.md`: **current team proposal (V6)**. This is the source of truth for the pitch.
- `docs/research-brief.md`: cited research for every slide, plus Q&A ammunition.
- `docs/demo-script.md`: the 75 s recorded-demo shot list, slide outline, and Q&A prep.
- `docs/case-brief.md`: the competition brief, baseline data, and judging rubric.
- `docs/project-plan.md`: the **earlier** 5-agent plan, superseded by V6. It is now the basis for the Phase 2 concept only.

## What we're building

**CascadeAI: First-48-Hour Evidence Discovery.** It is a detective-initiated, **case-data-free**, **retrieval-only** search over **public listings**, hosted in AWS GovCloud. Bottleneck: **Stage 6, Detective Follow-Up**. The property trail (Stage 7) is the one trail a detective can follow without touching case data.

How it works:
- The detective types a few structured item details: category, brand/model, color, date window, region.
- CascadeAI searches public listings and compares listing photos with public product images, using item appearance only.
- It returns a **First-48-Hour Lead Package**. Each lead has its source link, a saved photo, a capture timestamp, its match factors, and a search-coverage report. If nothing clears the fixed threshold, it says **"no match found"**. If results are too similar to rank, it says **"too broad to rank"**.

What CascadeAI never does:
- Read, store or search case data.
- Generate text.
- Learn from users.
- Link sellers to burglaries.
- Analyze people.
- Predict crime.

A human makes every decision.

**Workflow in the prototype.** These are fixed, auditable retrieval steps: deterministic code, no LLM.
1. Query Guard
2. Source Search (one per public source)
3. Photo Compare
4. Rank (fixed rules v1.0, threshold 0.70)
5. Package Builder

**Phase 2 concept (roadmap only, not in pilot, not costed).** In-CJIS case linking: series detection, property matching against authorized dealer records, and prioritization. It is gated by four things:
1. Phase 1 results.
2. A separate CJIS approval.
3. Retrospective validation on solved series.
4. Its own randomized pilot.

Its job in the pitch is to explain how the department could ever reach the "10 h/week" row below. It is **never** added to the headline numbers.

### Prototype "hero" screen (must match the deck)

Phase 1 Lead Search (`/`). The detective enters the items from a Wallingford burglary. **No case number, names or address** are entered; the Query Guard blocks them. Results:
- **MacBook Pro 14″ (silver)**: lead with **match score 87/100** (resemblance, not proof). Listed **2 days** after the date window opened, **~1.2 mi** from the search-region center, with source link, saved photo and timestamp.
- **Gold chain necklace**: **too broad to rank** (many near-identical listings).
- **Antique diamond ring**: **no match found** above the threshold.
- The coverage report shows one source with partial results.
- The detective exports the package to the case file in the department's own system, or sets the lead aside. Actions are logged and never change ranking.

Demo story arc: the detective works the case in the department's system → enters items in CascadeAI (guard blocks case data) → the workflow searches public sources → compares item photos → ranks with fixed rules → lead package → detective decides → audit log → honest impact.

### Existing prototype code

The working Next.js prototype lives in **`prototype/`** (Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui on Base UI, Recharts). Run it with `cd prototype && npm install && npm run dev`.

Phase 1 (pilot) routes:
- `/`: Lead Search.
- `/audit`: Audit Log.
- `/impact`: V6 numbers plus the "what would have to be true" slider.
- Data and logic: `src/lib/listings.ts` and `src/lib/numbers.ts`.

Phase 2 concept routes (banner-labeled): `/phase2`, `/cases`, `/cases/[id]`, `/leadsonline`, `/queue`, `/map`. Their mock data is in `src/lib/data.ts`. Known Phase 2 gaps, acceptable for a concept:
- Case #1044 links to 1098/1121/1133/1157/1162, not the old plan's 1098/1121/1185.
- There is no Forcible/Unlawful/Attempted classification output.

## Rules of the room (hard constraints — never violate)

- **No facial recognition.** Assume banned. Don't show or imply it anywhere.
- **CJIS.** Police data stays in CJIS-compliant systems. Never suggest pasting case files into a public chatbot.
- **People decide.** AI sorts, flags, summarizes, suggests. A human makes every decision that affects a person (no arrests, warrants, probable cause, guilt, charges).
- **Adoption.** Don't add clicks. The tool should cut steps from a detective's day.
- **Claims need proof.** Cite Adams et al., 2024: an RCT with 85 officers found an AI report-writing tool did *not* significantly reduce time, despite vendor claims. Every savings claim needs a way to measure it.
- **Public or synthetic data only.** No real personal or case data. data.seattle.gov is allowed. All names, shops, plates, sources and cases in the demo must be clearly fictional.
- **Cite sources.** Don't claim the case data reflects any real department. National 13% clearance (2022) vs 23% (1964) comes from the Council on Criminal Justice.
- **Model inputs exclude** race, ethnicity, gender and facial recognition. Phase 1 inputs are item descriptors only.

## Numbers (single source of truth — keep deck, demo and talk consistent)

These come from Proposal V6. The math was checked: every row of the table below reproduces from the formulas. `prototype/src/lib/numbers.ts` must mirror this section.

**Baseline (given):**
- 10,000 burglaries/yr · 13% clearance = 1,300 solved · officer $50/h · detective $70/h.
- Per case: intake 15 min, report 60, video 120, evidence 45 (officer) + detective analysis 90 = 330 min.
- Cost per case: 4 officer-h × $50 + 1.5 detective-h × $70 = **$305**, so **$3.05M/yr**.
- Detective analysis = 15,000 h/yr. A 15% net cut = **$457,500/yr after solution costs**.

**Costs (planning placeholders; the tech team confirms):**
- Build **$40,000**: app + photo comparison $25,000; security/CJIS review $8,000; training + HR coordination $5,000; contingency $2,000.
- Run **$15,000/yr**: GovCloud hosting + storage $6,000; public-listing data access $4,000; maintenance, support, audits $5,000.

**Savings** (team input: **2.5 h saved per detective per 40-h week**):
- 2.5 ÷ 40 = 6.25% of detective time → 15,000 × 6.25% = **937.5 h/yr** freed.
- Gross 937.5 × $70 = **$65,625/yr**. Net of run cost = **$50,625/yr = 1.7%** of $3.05M.
- Payback $40,000 ÷ $50,625 ≈ **9.5 months**.
- 3-yr benefit $196,875 vs 3-yr cost $85,000 → **ROI ≈ 132%**.
- Averaged over 3 years, net ≈ $37,300/yr (1.2%).

**Clearance** (path 1 only: freed hours earn the average yield, 1,300 ÷ 15,000 = 0.087 cleared/h; this is an upper-end estimate):
- +81 → 1,381 → **13.8%** (+6.3% relative).
- The Chief's ask is 16.25% (1,625). The gap is 244 cases, which needs 3,750 h = **10 h/detective/week**.
- A 15% net cost cut needs **18 h/detective/week**.
- Path 2 (direct leads from matched listings) is **not counted**: there is no baseline. The pilot measures it.

**What would have to be true** (`hours = 15,000 × h/40`; `net = hours × 70 − 15,000`; `clearance = (1,300 + hours × 1,300/15,000)/10,000`; `payback = 40,000/net`):

| h saved/detective/week | h freed/yr | Net/yr | Net % | Clearance | Payback | Asks met |
|---|---|---|---|---|---|---|
| 1.25 | 469 | $17,813 | 0.6% | 13.4% | 2.2 yr | None |
| **2.5 (team input)** | **938** | **$50,625** | **1.7%** | **13.8%** | **9.5 mo** | **None** |
| 5 | 1,875 | $116,250 | 3.8% | 14.6% | 4.1 mo | None |
| 10 | 3,750 | $247,500 | 8.1% | 16.3% | 1.9 mo | Clearance |
| 12.5 | 4,688 | $313,125 | 10.3% | 17.1% | 1.5 mo | Clearance |
| 18 | 6,750 | $457,500 | 15.0% | 18.9% | 1.0 mo | Both |

**Sensitivity** (derived, for Q&A; not a headline): public-listing data access is the most fragile cost line. Net savings hit $0 if data access costs **≥ $54,625/yr** ($65,625 − $6,000 − $5,000). Real authorized-data subscriptions (e.g. LeadsOnline) range from about $3.3k/yr for small agencies to about $58k/yr for a larger city.

**Honest bottom line:** at the team's input, **neither of the Chief's asks is met**, and we say so up front. Freed hours are capacity, not cash, unless the department avoids overtime or a hire.

**Superseded:** the old 5-agent numbers are no longer used anywhere: +300 solved → 16%, −20% detective time = $210,000, −10 min video = $83,350, gross $293,350. They remain in `docs/project-plan.md` only as history.

## Judging (100 + 5 bonus)

Impact 30 · Feasibility 25 · Cost-effectiveness 20 · Ethics & trust 15 · Presentation 10.
Bonus +1 each: working prototype, AI beyond obvious automation, creativity, community-centered approach, unusually honest and measured claims.
Buyers: the Chief cares about clearance, the Council about cost, the community about trust.

## Team ownership

- Hook: *unassigned*
- Bottleneck (Stage 6): Marlin
- Solution: Jay
- Cost-benefit: Mooyoun, Anthony, Sharon
- Clearance logic: *unassigned*
- Pilot plan (90 days / 1 year): Marlin
- Ethics slide: *unassigned*

## Working conventions for Claude

- Time is short: favor working, demo-able features over polish. Don't expand scope beyond V6 + the labeled Phase 2 concept.
- Any number shown in UI or slides must trace back to the "Numbers" section. If a number changes, update this file first.
- Label all demo data as synthetic/mock in the UI. Phase 2 screens must carry the "concept, not in pilot" banner.
- Next.js in the prototype is v16 and has breaking changes vs older versions. Read `node_modules/next/dist/docs/` before using unfamiliar APIs. `useSearchParams` / `usePathname` need `<Suspense>` or static params, or the build fails.
- Verify with `npm run build` before declaring done. Live demos fail, so make sure the recorded demo path works.
