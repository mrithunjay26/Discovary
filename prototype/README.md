# CascadeAI Investigations

Hackathon prototype: AI-generated leads for burglary detectives. All data is fictional mock data (`src/lib/data.ts`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Demo script (follow the "Investigation flow" bar at the bottom)

1. **Dashboard** – press *Run live analysis* to watch Case #1044 go through the pipeline.
2. **Cases** (`/cases`) – 30 cases; search, filter, sort; click a row.
3. **AI Lead Generation** (`/cases/1044`) – analysis animation, similarity score, linked cases, shared MO / items / vehicle, plain-language explanation.
4. **Geographic View** (`/map`) – heat, hotspots, series outlines; press play to watch series emerge.
5. **LeadsOnline** (`/leadsonline`) – MacBook Pro, Apple Watch, jewelry matches; request holds.
6. **Prioritization Queue** (`/queue`) – High / Medium / Low with reasons and score breakdown.
7. **Detective review** (`/cases/1044#review`) – approve the lead, then *Record arrest* to clear all 6 linked cases.
8. **Executive Impact** (`/impact`) – 13% → 16% clearance, +300 solved, −15% labor.

Demo state (approvals, holds, clearances) is shared across pages; use *Reset demo state* in the sidebar.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Recharts · lucide-react
