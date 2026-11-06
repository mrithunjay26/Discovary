// Phase 1 (pilot product, Proposal V6): public-listing search.
// ALL data here is synthetic. Sources use reserved ".example" domains; listings, prices and photos are invented.
// CascadeAI never receives case data: inputs are structured item descriptors only.

export const DEMO_NOW = new Date("2026-08-08T09:41:00"); // fixed demo clock: within 48 h of the Aug 6 burglary
export const RULES_VERSION = "v1.0";
export const THRESHOLD = 70; // fixed match threshold (0–100); below it → "no match found"

// ---------- Fixed ranking rules v1.0 (changed only by reviewed, versioned releases) ----------
export const WEIGHTS = { visual: 0.5, model: 0.2, color: 0.1, date: 0.1, region: 0.1 } as const;

export type Category = "Laptop" | "Jewelry" | "Watch" | "Phone" | "Bicycle" | "Tools" | "Camera";
export const CATEGORIES: Category[] = ["Laptop", "Jewelry", "Watch", "Phone", "Bicycle", "Tools", "Camera"];

export type Region = "Cascade City · North" | "Cascade City · Central" | "Cascade City · South" | "Cascade City · West" | "Cascade City · citywide";
export const REGIONS: Region[] = ["Cascade City · North", "Cascade City · Central", "Cascade City · South", "Cascade City · West", "Cascade City · citywide"];
const ADJACENT: Record<string, string[]> = {
  "Cascade City · North": ["Cascade City · Central", "Cascade City · West"],
  "Cascade City · Central": ["Cascade City · North", "Cascade City · South", "Cascade City · West"],
  "Cascade City · South": ["Cascade City · Central"],
  "Cascade City · West": ["Cascade City · North", "Cascade City · Central"],
};

export interface Product {
  id: string;
  category: Category;
  name: string; // as shown in the public product catalog
  aliases: string[]; // exact model text matches (normalized)
  family: string[]; // same product family (partial text match)
  colors: string[];
  note?: string;
}

// Public product catalog (item names only; images are placeholders).
export const CATALOG: Product[] = [
  { id: "mbp14", category: "Laptop", name: "Apple MacBook Pro 14-inch", aliases: ["macbook pro 14", "mbp 14"], family: ["macbook", "apple laptop"], colors: ["Silver", "Space Black"] },
  { id: "mba13", category: "Laptop", name: "Apple MacBook Air 13-inch", aliases: ["macbook air 13", "mba 13"], family: ["macbook", "apple laptop"], colors: ["Silver", "Midnight", "Starlight"] },
  { id: "xps13", category: "Laptop", name: "Dell XPS 13", aliases: ["xps 13"], family: ["dell xps", "dell laptop"], colors: ["Platinum", "Graphite"] },
  { id: "gold-chain", category: "Jewelry", name: "Gold chain necklace", aliases: ["gold chain"], family: ["chain", "necklace"], colors: ["Gold"], note: "Common item: many listings look alike" },
  { id: "deco-ring", category: "Jewelry", name: "Antique diamond ring (Art Deco style)", aliases: ["antique diamond ring", "art deco diamond ring", "art deco ring"], family: ["diamond ring", "ring"], colors: ["Platinum", "White gold", "Yellow gold"] },
  { id: "aw-ultra2", category: "Watch", name: "Apple Watch Ultra 2", aliases: ["apple watch ultra 2", "watch ultra 2"], family: ["apple watch"], colors: ["Natural titanium", "Black titanium"] },
  { id: "iphone16pro", category: "Phone", name: "Apple iPhone 16 Pro", aliases: ["iphone 16 pro"], family: ["iphone"], colors: ["Natural", "Black", "White", "Desert"] },
  { id: "trek-fx3", category: "Bicycle", name: "Trek FX 3 hybrid bike", aliases: ["trek fx 3", "fx 3"], family: ["trek"], colors: ["Blue", "Black", "Gray"] },
  { id: "m18-kit", category: "Tools", name: "Milwaukee M18 combo kit", aliases: ["milwaukee m18", "m18 combo"], family: ["milwaukee"], colors: ["Red"] },
  { id: "sony-a7iv", category: "Camera", name: "Sony Alpha 7 IV", aliases: ["sony a7 iv", "alpha 7 iv", "a7 iv", "a7iv"], family: ["sony alpha", "sony camera"], colors: ["Black"] },
];
export const getProduct = (id: string) => CATALOG.find((p) => p.id === id);

// ---------- Public sources (synthetic) ----------
export interface Source {
  id: string;
  name: string;
  kind: string;
  domain: string;
  scanned: number; // listings in the date window scanned this run
  status: "complete" | "partial";
  at: string; // capture time (demo clock)
  gap?: string;
}

export const SOURCES: Source[] = [
  { id: "soundswap", name: "SoundSwap", kind: "Online marketplace", domain: "soundswap.example", scanned: 412, status: "complete", at: "09:41:03" },
  { id: "classifieds", name: "Cascade Classifieds", kind: "Classified ads", domain: "cascadeclassifieds.example", scanned: 288, status: "complete", at: "09:41:04" },
  { id: "harborline", name: "Harborline Pawn · public storefront", kind: "Pawn shop web storefront", domain: "harborlinepawn.example", scanned: 61, status: "partial", at: "09:41:05", gap: "Page 2 of 2 timed out (source rate limit). About 60 listings not searched; automatic retry at 10:11." },
];
export const getSource = (id: string) => SOURCES.find((s) => s.id === id)!;

// ---------- Listings (synthetic) ----------
export interface Listing {
  id: string;
  sourceId: string;
  category: Category;
  title: string;
  color: string;
  posted: string; // ISO local datetime
  region: Region;
  miFromCenter: number; // distance from the center of the search region, from the listing's public neighborhood
  price: number;
  visual: number; // photo similarity vs the public product image (0–1), from the off-the-shelf image model
}

const L = (x: Listing) => x;

const BASE_LISTINGS: Listing[] = [
  // MacBook Pro 14 (hero)
  L({ id: "SS-48213", sourceId: "soundswap", category: "Laptop", title: "MacBook Pro 14 inch, silver, like new", color: "Silver", posted: "2026-08-08T08:12", region: "Cascade City · North", miFromCenter: 1.2, price: 650, visual: 0.74 }),
  L({ id: "CC-20931", sourceId: "classifieds", category: "Laptop", title: "Apple MacBook Pro 14 in, silver, charger included", color: "Silver", posted: "2026-08-07T19:40", region: "Cascade City · Central", miFromCenter: 3.4, price: 1100, visual: 0.52 }),
  L({ id: "HP-7714", sourceId: "harborline", category: "Laptop", title: "Apple laptop 14 in (silver)", color: "Silver", posted: "2026-08-07T12:05", region: "Cascade City · West", miFromCenter: 4.1, price: 780, visual: 0.58 }),
  L({ id: "SS-48190", sourceId: "soundswap", category: "Laptop", title: "MacBook Pro 16, space black", color: "Space Black", posted: "2026-08-07T09:30", region: "Cascade City · North", miFromCenter: 0.8, price: 1400, visual: 0.45 }),
  L({ id: "CC-20877", sourceId: "classifieds", category: "Laptop", title: "MacBook Air 13 silver, barely used", color: "Silver", posted: "2026-08-06T21:15", region: "Cascade City · North", miFromCenter: 2.0, price: 540, visual: 0.4 }),
  L({ id: "SS-47522", sourceId: "soundswap", category: "Laptop", title: "MacBook Pro 14 silver, M3", color: "Silver", posted: "2026-07-28T17:00", region: "Cascade City · North", miFromCenter: 1.6, price: 990, visual: 0.8 }), // posted before the date window → excluded
  // Antique diamond ring: nothing clears the threshold
  L({ id: "CC-20902", sourceId: "classifieds", category: "Jewelry", title: "Vintage diamond ring, size 6", color: "White gold", posted: "2026-08-07T14:22", region: "Cascade City · Central", miFromCenter: 2.9, price: 1200, visual: 0.38 }),
  L({ id: "SS-48201", sourceId: "soundswap", category: "Jewelry", title: "Diamond solitaire ring 1 ct", color: "Yellow gold", posted: "2026-08-08T07:45", region: "Cascade City · North", miFromCenter: 1.9, price: 1600, visual: 0.34 }),
  L({ id: "HP-7702", sourceId: "harborline", category: "Jewelry", title: "Art deco style ring (costume)", color: "Platinum", posted: "2026-08-06T16:10", region: "Cascade City · South", miFromCenter: 6.3, price: 85, visual: 0.41 }),
];

// Gold chain necklace: a common item. 23 listings clear the threshold with near-identical scores, plus 4 below.
const CHAIN_TITLES = ["14k gold chain 20 in", "Gold chain necklace, rope style", "Gold chain, Cuban link", "Gold chain 18 in, box style", "Gold chain, figaro", "Solid gold chain 22 in"];
const SRC_CYCLE = ["soundswap", "classifieds", "harborline"] as const;
const CHAIN_LISTINGS: Listing[] = Array.from({ length: 27 }, (_, i) => {
  const below = i >= 23;
  const adjacent = i % 3 === 0;
  return L({
    id: `${["SS", "CC", "HP"][i % 3]}-${30100 + i * 7}`,
    sourceId: SRC_CYCLE[i % 3],
    category: "Jewelry",
    title: CHAIN_TITLES[i % CHAIN_TITLES.length],
    color: "Gold",
    posted: `2026-08-0${6 + (i % 3)}T${String(9 + (i % 9)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    region: adjacent ? "Cascade City · Central" : "Cascade City · North",
    miFromCenter: +(0.6 + ((i * 17) % 40) / 10).toFixed(1),
    price: 120 + ((i * 37) % 400),
    visual: below ? 0.22 + (i % 4) * 0.02 : adjacent ? 0.56 + ((i * 7) % 5) / 100 : 0.5 + ((i * 7) % 11) / 100,
  });
});

export const LISTINGS: Listing[] = [...BASE_LISTINGS, ...CHAIN_LISTINGS];

// ---------- Query Guard ----------
export type GuardKind = "case-number" | "address" | "email" | "phone" | "person" | "narrative" | "unknown-product" | "empty";
export type GuardResult = { ok: true; product: Product } | { ok: false; kind: GuardKind; reason: string };

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function guardModelField(text: string, category: Category): GuardResult {
  const t = text.trim();
  if (!t) return { ok: false, kind: "empty", reason: "Pick a model from the public product catalog." };
  if (/\b(case|report|incident|cad|rms|go)\b\s*(no\.?|number|#)?\s*\d+/i.test(t) || /#\s*\d{3,}/.test(t) || /\b\d{2}-\d{4,}\b/.test(t) || /\b\d{4,}\b/.test(t))
    return { ok: false, kind: "case-number", reason: "Looks like a case or report number. CascadeAI can't accept case numbers; keep case data in the department's records system." };
  if (/\S+@\S+\.\S+/.test(t)) return { ok: false, kind: "email", reason: "Looks like an email address. Personal contact details can't be entered." };
  if (/(\d{3}[\s.-]?){2}\d{4}/.test(t)) return { ok: false, kind: "phone", reason: "Looks like a phone number. Personal contact details can't be entered." };
  if (/\b\d{1,5}\s+[a-z0-9.\s]{1,30}\b(st|street|ave|avenue|rd|road|blvd|way|dr|drive|ln|lane|ct|court|pl|place)\b/i.test(t))
    return { ok: false, kind: "address", reason: "Looks like a street address. Addresses can't be entered; use the region picker." };
  if (/\b(mr|mrs|ms|miss|dr)\.?\s+[a-z]/i.test(t) || /\b(victim|suspect|owner|witness|neighbor|son|daughter|husband|wife)\b/i.test(t))
    return { ok: false, kind: "person", reason: "Looks like a reference to a person. Names and people can't be entered; describe the item only." };
  if (t.split(/\s+/).length > 8) return { ok: false, kind: "narrative", reason: "Free-text descriptions aren't accepted. Use the structured fields." };
  const n = ` ${norm(t)} `;
  const inCat = CATALOG.filter((p) => p.category === category);
  const hit = inCat.find((p) => [p.name, ...p.aliases].some((a) => n.includes(` ${norm(a)} `) || norm(p.name) === norm(t)));
  if (!hit) return { ok: false, kind: "unknown-product", reason: `Not in the public ${category.toLowerCase()} catalog. Pick a suggestion.` };
  return { ok: true, product: hit };
}

// ---------- Search + fixed ranking ----------
export interface QueryItem {
  key: string;
  category: Category;
  modelText: string;
  color: string;
}
export interface Query {
  items: QueryItem[];
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  region: Region;
}

export type ModelMatch = "exact" | "family" | "none";
export interface Factor {
  key: keyof typeof WEIGHTS;
  label: string;
  value: string;
  credit: number; // 0–1
  points: number; // contribution to the 0–100 score
}
export interface Scored {
  listing: Listing;
  source: Source;
  score: number;
  factors: Factor[];
  daysAfterWindowOpened: number;
}
export type Outcome = "leads" | "too-broad" | "no-match";
export interface ItemResult {
  item: QueryItem;
  product: Product;
  candidates: number;
  leads: Scored[];
  above: number;
  below: number;
  excluded: number; // posted before the date window: can't be the stolen item
  outcome: Outcome;
  scoreRange?: [number, number];
}
export interface SearchResult {
  items: ItemResult[];
  perSource: Record<string, number>; // candidates retrieved per source
  compared: number; // listing photos compared
  totalLeads: number;
  totalBelow: number;
  totalExcluded: number;
}

const DAY = 86_400_000;
const day = (d: string) => new Date(d + "T00:00:00").getTime();

function modelMatch(title: string, p: Product): ModelMatch {
  const n = ` ${norm(title)} `;
  if (p.aliases.some((a) => n.includes(` ${norm(a)} `))) return "exact";
  if (p.family.some((f) => n.includes(` ${norm(f)} `))) return "family";
  return "none";
}

export function scoreListing(l: Listing, item: QueryItem, p: Product, q: Query): Scored | "excluded" {
  const posted = new Date(l.posted).getTime();
  const from = day(q.from);
  const toEnd = day(q.to) + DAY;
  if (posted < from) return "excluded";
  const mm = modelMatch(l.title, p);
  const dateCredit = posted < toEnd ? 1 : posted < toEnd + 7 * DAY ? 0.5 : 0;
  const regionCredit = q.region === "Cascade City · citywide" || l.region === q.region ? 1 : ADJACENT[q.region]?.includes(l.region) ? 0.5 : 0;
  const parts: Omit<Factor, "points">[] = [
    { key: "model", label: "Brand / model text", value: mm === "exact" ? "Exact model" : mm === "family" ? "Same product family" : "No match", credit: mm === "exact" ? 1 : mm === "family" ? 0.5 : 0 },
    { key: "visual", label: "Photo vs. public product image", value: `Similarity ${l.visual.toFixed(2)}`, credit: l.visual },
    { key: "color", label: "Color", value: l.color === item.color ? `${l.color} (matches)` : `${l.color} (reported ${item.color})`, credit: l.color === item.color ? 1 : 0 },
    { key: "date", label: "Listing date", value: dateCredit === 1 ? "Inside the date window" : dateCredit ? "Within 7 days after window" : "Outside window", credit: dateCredit },
    { key: "region", label: "Region", value: regionCredit === 1 ? "Inside search region" : regionCredit ? "Adjacent region" : "Outside region", credit: regionCredit },
  ];
  const factors = parts.map((f) => ({ ...f, points: Math.round(f.credit * WEIGHTS[f.key] * 1000) / 10 }));
  const score = Math.round(parts.reduce((s, f) => s + f.credit * WEIGHTS[f.key], 0) * 100);
  return { listing: l, source: getSource(l.sourceId), score, factors, daysAfterWindowOpened: Math.floor((posted - from) / DAY) };
}

const TOO_BROAD_MIN = 8; // at least 8 listings above threshold…
const TOO_BROAD_SPREAD = 6; // …within 6 points of each other → too broad to rank

export function runSearch(q: Query): SearchResult {
  const perSource: Record<string, number> = Object.fromEntries(SOURCES.map((s) => [s.id, 0]));
  let compared = 0;
  const items: ItemResult[] = [];
  for (const item of q.items) {
    const g = guardModelField(item.modelText, item.category);
    if (!g.ok) continue;
    const p = g.product;
    const pool = LISTINGS.filter((l) => l.category === item.category && modelMatch(l.title, p) !== "none");
    let excluded = 0;
    const scored: Scored[] = [];
    for (const l of pool) {
      perSource[l.sourceId]++;
      const s = scoreListing(l, item, p, q);
      if (s === "excluded") excluded++;
      else {
        compared++;
        scored.push(s);
      }
    }
    scored.sort((a, b) => b.score - a.score);
    const above = scored.filter((s) => s.score >= THRESHOLD);
    const below = scored.length - above.length;
    let outcome: Outcome = above.length ? "leads" : "no-match";
    if (above.length >= TOO_BROAD_MIN && above[0].score - above[TOO_BROAD_MIN - 1].score <= TOO_BROAD_SPREAD) outcome = "too-broad";
    items.push({
      item,
      product: p,
      candidates: pool.length,
      leads: outcome === "leads" ? above : [],
      above: above.length,
      below,
      excluded,
      outcome,
      scoreRange: above.length ? [above[above.length - 1].score, above[0].score] : undefined,
    });
  }
  return {
    items,
    perSource,
    compared,
    totalLeads: items.reduce((s, i) => s + i.leads.length, 0),
    totalBelow: items.reduce((s, i) => s + i.below, 0),
    totalExcluded: items.reduce((s, i) => s + i.excluded, 0),
  };
}

// The three items from the demo burglary, as a detective would enter them (no case number, names or address).
export const DEMO_QUERY: Query = {
  items: [
    { key: "i1", category: "Laptop", modelText: "MacBook Pro 14", color: "Silver" },
    { key: "i2", category: "Jewelry", modelText: "Gold chain necklace", color: "Gold" },
    { key: "i3", category: "Jewelry", modelText: "Antique diamond ring", color: "Platinum" },
  ],
  from: "2026-08-06",
  to: "2026-08-08",
  region: "Cascade City · North",
};

export const fmtDay = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const fmtStamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
