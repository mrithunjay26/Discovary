# CascadeAI: First-48-Hour Evidence Discovery (prototype)

Case-competition prototype for **Proposal V6** (`../docs/proposal-v6.md`). It is a detective-initiated, case-data-free, retrieval-only search over public listings. **All data is synthetic**: sources use reserved `.example` domains, and every listing, price and person is invented. Cascade City is fictional.

## Run

```bash
npm install
npm run build && npm run start   # http://localhost:3000 (use the production build for recording)
```

## Phase 1: pilot product (the demo)

| Route | What it shows |
|---|---|
| `/` **Lead Search** | Swimlanes (department system → CascadeAI in GovCloud → detective decides), the structured item form with the **Query Guard** (blocks case numbers, names, addresses, narratives), the animated 5-step **retrieval workflow**, and the **First-48-Hour Lead Package**. The package shows: a match score of 87/100 for the MacBook, "too broad to rank" for the chain, "no match found" for the ring, and a coverage report with one partial source. |
| `/audit` | Audit log of every query, block, saved-copy view and export (no case data). |
| `/impact` | Proposal V6 numbers, plus a "hours saved per detective per week" slider that reproduces V6's "what would have to be true" table. |

Logic and data:
- `src/lib/listings.ts`: catalog, synthetic sources and listings, the guard, and fixed ranking rules v1.0 (threshold 70).
- `src/lib/numbers.ts`: V6 numbers, mirroring `../CLAUDE.md` → Numbers.

No LLM, no API key, no network. The workflow is deterministic, so every take is identical (fixed demo clock: Sat Aug 8, 2026, 9:41 AM).

## Phase 2: concept only (banner-labeled, not in the pilot)

These routes show in-CJIS case linking as a roadmap: `/phase2`, `/cases`, `/cases/[id]`, `/leadsonline`, `/queue`, `/map`. The mock data is in `src/lib/data.ts`. Nothing on these screens is a projection.

## Demo script and recording

- The shot list with voiceover is in `../docs/demo-script.md`.
- To verify the whole demo path and save screenshots, run `node scripts/record-demo.mjs`. It exits non-zero if any number or outcome is off.
- To record a silent 1920×1080 video paced for the voiceover, run `node scripts/record-demo.mjs --video`. The video lands in `demo-output/`, which is gitignored.
- Use **Reset demo state** (sidebar) between manual takes.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Recharts · lucide-react
