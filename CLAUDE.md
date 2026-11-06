# CLAUDE.md — Discovary / CascadeAI

Case competition project: **"Cracking the Burglary Backlog"** (Group 5). We are consultants for the fictional Cascade City Police Department (pop. ~750k, Seattle-sized), with AI-on-Cloud as tech partner.

**Deadline: deck due Friday 1:00 PM** (share with the organizer). 10-min pitch = 7 min present (incl. demo) + 3 min Q&A. Deck < 10 slides. A 60–90 s **recorded** demo in the deck is the safest option.

Full source material:
- `docs/case-brief.md` — the competition brief, baseline data, judging rubric
- `docs/project-plan.md` — our team's plan (bottleneck, agents, math, ethics, pilot)

## What we're building

**CascadeAI Lead Generation Platform**, focused on **Stage 6: Detective Follow-Up** (cross-referencing, pattern finding, case linking, property matching, prioritization). It generates *leads*; it never makes decisions about people.

Five agents:
1. **Classification** — Forcible Entry / Unlawful Entry / Attempted Forcible Entry; extracts entry method, time, location, stolen property, vehicle.
2. **Case-Linking** — similarity matching → burglary series (e.g. 1044, 1098, 1121: rear-window entry, afternoon, jewelry).
3. **Property Recovery** — searches synthetic LeadsOnline-style pawn records (e.g. MacBook Pro pawned 2 days later, 1.2 mi away).
4. **Prioritization** — High / Medium / Low from linked cases, property leads, available evidence.
5. **Explainability** — every recommendation lists its evidence ("Same entry method, same neighborhood, similar theft pattern, property match found").

### Prototype "hero" screen (must match the deck)

Detective opens **Case #1044** and sees:
- Classification: **Forcible Entry**
- Linked cases: **1098, 1121, 1185**
- Property match: **Pawned MacBook Pro**, confidence **87%**
- Priority: **HIGH**
- Reason: **4 related burglaries and 1 potential property recovery lead**
- Detective decides whether to investigate (approve / more info / dismiss). AI never acts on its own.

Demo story arc: case enters → AI analyzes → AI links cases → AI checks LeadsOnline → AI creates lead → detective reviews → more cases solved.

### Existing prototype code

The working Next.js prototype lives in **`prototype/`** (Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui on Base UI, Recharts). Run it with `cd prototype && npm install && npm run dev`. Mock data lives in `prototype/src/lib/data.ts`. Before demoing, align it with this plan. Known differences:
- Linked cases there are 1098, 1121, 1133, 1157, 1162 (plan says 1098, 1121, 1185). Similarity is 89% and the MacBook match is 94% (plan says 87%).
- No Classification agent output (Forcible / Unlawful / Attempted) yet.
- No distance-from-scene field ("1.2 miles away") on pawn matches.
- The Impact page uses "22 → 18.7 hrs/case, −15% labor". That conflicts with the brief's 330 min/case baseline and our 20% detective-time assumption. Rebuild it from the numbers below.

## Rules of the room (hard constraints — never violate)

- **No facial recognition.** Assume banned. Don't show or imply it anywhere.
- **CJIS.** Police data stays in CJIS-compliant systems. Never suggest pasting case files into a public chatbot.
- **People decide.** AI sorts, flags, summarizes, suggests. A human makes every decision that affects a person (no arrests, warrants, probable cause, guilt, charges).
- **Adoption.** Don't add clicks. The tool should cut steps from a detective's day.
- **Claims need proof.** Cite Adams et al., 2024: an RCT with 85 officers found an AI report-writing tool did *not* significantly reduce time, despite vendor claims. Every savings claim needs a way to measure it.
- **Public or synthetic data only.** No real personal or case data. data.seattle.gov is allowed. All names, shops, plates and cases in the demo must be clearly fictional.
- **Cite sources.** Don't claim the case data reflects any real department. National 13% clearance (2022) vs 23% (1964) comes from the Council on Criminal Justice.
- **Model inputs exclude** race, ethnicity, gender and facial recognition. Inputs are burglary characteristics, evidence metadata and property info only.

## Numbers (single source of truth — keep deck, demo and talk consistent)

Baseline (given): 10,000 burglaries/yr · 13% clearance = 1,300 solved · officer $50/h · detective $70/h.
Per case: intake 15 min, report 60, video 120, evidence 45 (officer) + detective analysis 90 = 330 min.
Cost per case: 4 officer-h × $50 + 1.5 detective-h × $70 = **$305**, so **$3.05M/yr**. A 15% net cut = **~$457,500/yr after solution costs**.

Clearance: +300 solved → 1,600 / 10,000 = **16%** (= 25% relative improvement, meets the Chief's ask).

Savings (our assumptions):
- Detective analysis −20%: 18 min × 10,000 = 3,000 h × $70 = **$210,000**
- Less video / duplicate work: 10 min × 10,000 = 1,667 officer-h × $50 = **~$83,350**
- **Gross ≈ $293,350/yr ≈ 9.6% of $3.05M** — *before* cloud/licensing costs.

**Honest bottom line:** gross savings are below the $457.5k net target even before costs. So we meet the clearance goal and only partly meet the cost goal. Say this plainly; judges reward honest math. Still TODO: cloud + licensing + build + training costs, net savings, payback period, ROI.

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

- Time is short: favor working, demo-able features over polish. Don't expand scope beyond the plan.
- Any number shown in UI or slides must trace back to the "Numbers" section. If a number changes, update this file first.
- Label all demo data as synthetic/mock in the UI.
- Next.js in the prototype is v16 and has breaking changes vs older versions. Read `node_modules/next/dist/docs/` before using unfamiliar APIs. `useSearchParams` / `usePathname` need `<Suspense>` or static params, or the build fails.
- Verify with `npm run build` before declaring done. Live demos fail, so make sure the recorded demo path works.
