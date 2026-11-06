# Claude Code session log: CascadeAI prototype + repo setup

Session with Claude Code (Opus 5.5) on Nov 5, 2026. This is a cleaned-up record of the conversation: prompts are condensed and long tool output is left out. Expand each section to read it.

<details>
<summary><strong>1. Prompt: build the "CascadeAI Investigations" prototype</strong></summary>

**Request (condensed):** Build a Next.js + TypeScript + Tailwind + shadcn/ui + Recharts prototype using realistic mock data. It should have:
1. Dashboard: total burglaries, clearance rate, active investigations, AI leads, labor hours saved.
2. Burglary cases table with 30 mock cases (ID, date, neighborhood, entry method, stolen items, AI solvability score, status).
3. AI Lead Generation page per case: similarity score, linked cases, shared MO, items and vehicles, with a generated explanation (e.g. *"Cases 1044, 1098, and 1121 likely belong to the same burglary series because…"*).
4. LeadsOnline mock screen: MacBook Pro, Apple Watch and jewelry matches with pawn shop, date listed and confidence.
5. Prioritization queue (High / Medium / Low with reasons).
6. Geographic view: clusters, hotspots, linked-case groups.
7. Executive Impact: 13% → 16% clearance, +300 solved, −15% labor, with charts.

Design: dark police command-center look, blue accents. It should tell the story *case enters → AI analyzes → links → checks LeadsOnline → creates lead → detective reviews → more cases solved*.

</details>

<details>
<summary><strong>2. Claude: what was built</strong></summary>

Built in `prototype/` (originally `C:\Users\marli\cascadeai-investigations`). It passes TypeScript, ESLint and `next build`, and every route loads.

- **Story bar** on every page walks through the 7 steps, with a "Next" button.
- **Dashboard:** KPIs, a "Run live analysis" animation of the pipeline for Case #1044 with a log feed, monthly trend and entry-method charts, top AI leads, activity feed.
- **Cases** (`/cases`): 30 mock cases; search, filters, sortable columns; click a row to open it.
- **AI Lead Generation** (`/cases/[id]`): analysis animation; similarity ring; linked cases; feature comparison grid; shared MO, items and vehicle; time-of-day chart; pawn matches; detective review panel (approve / more info / dismiss → record arrest clears all linked cases).
- **LeadsOnline** (`/leadsonline`): three featured matches with hold → confirm flow, seller-network alert, full match table.
- **Queue** (`/queue`): High / Medium / Low columns, each with plain-language reasons and a score breakdown.
- **Map** (`/map`): stylized Seattle-area SVG with heat layer, hotspots, series outlines, layer toggles, timeline playback.
- **Impact** (`/impact`): clearance projection, solved per year by source, hours per case before/after, sources of improvement.

Demo state is shared across pages (React context); "Reset demo state" is in the sidebar. All data is fictional.

Notes:
- Next.js 16 needed static params for `/cases/[id]`, because `usePathname` outside `<Suspense>` fails at prerender.
- shadcn now uses Base UI (`render` prop instead of `asChild`).

</details>

<details>
<summary><strong>3. Prompt: clone the team repo</strong></summary>

"git clone https://github.com/mrithunjay26/Discovary into my downloads folder"

**Claude:** Cloned to `Downloads/Discovary`. It had one commit with a README: "An AI tool for detectives and case work."

</details>

<details>
<summary><strong>4. Prompt: add CLAUDE.md using the team plan + case brief</strong></summary>

The team plan (Stage 6 Detective Follow-Up, 5 agents, clearance and cost math, CJIS/ethics, pilot plan) and the competition brief were provided. They are saved as `docs/project-plan.md` and `docs/case-brief.md`.

**Claude added:**
- `CLAUDE.md`: project context, demo screen spec, rules of the room as hard constraints, one shared set of numbers, judging rubric, slide owners, working conventions.
- `docs/project-plan.md`, `docs/case-brief.md`, `.gitignore`.

**Flagged:**
1. Gross savings are about $293k/yr (about 9.6% of $3.05M), below the ~$457.5k 15% net target even before cloud and licensing costs. We meet clearance but only partly meet cost, and should say so honestly.
2. The prototype doesn't match the plan yet: it links #1044 to 1098/1121/1133/1157/1162 (plan: 1098/1121/1185), shows a 94% MacBook match (plan: 87%), has no Forcible / Unlawful / Attempted classification, and its Impact labor numbers conflict with the 330 min/case baseline.
3. Hook, clearance logic and ethics slides have no owner.

</details>

<details>
<summary><strong>5. Prompt: share this chat on GitHub + commit everything to a branch</strong></summary>

**Claude:** Wrote this file (`docs/claude-chat.md`) using collapsible `<details>` sections, copied the prototype into `prototype/`, and committed everything on a new branch.

</details>

## Next steps
- [ ] Align the prototype with the plan (Case #1044 screen, Classification agent, 87% match, 1.2 mi distance, Impact numbers).
- [ ] Cost-benefit team: add build, cloud, licensing and training costs → net savings, payback, ROI.
- [ ] Assign owners for the hook, clearance logic and ethics slides.
- [ ] Record the 60–90 s demo.

### Run the prototype
```bash
cd prototype
npm install
npm run dev   # http://localhost:3000
```
