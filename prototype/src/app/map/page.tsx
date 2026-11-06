"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, Play, Pause, Crosshair, ArrowRight, MapPin } from "lucide-react";
import { SERIES, fmtDate, fmtTime, type BurglaryCase, type SeriesId } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PageHeader, Panel, StatusBadge } from "@/components/common";
import { cn } from "@/lib/utils";

// Mock projection over a simplified Seattle-area frame
const LAT0 = 47.72, LAT1 = 47.53, LNG0 = -122.43, LNG1 = -122.25;
const W = 600, H = 940;
const px = (lat: number, lng: number): [number, number] => [((lng - LNG0) / (LNG1 - LNG0)) * W, ((LAT0 - lat) / (LAT0 - LAT1)) * H];
const poly = (pts: [number, number][]) => pts.map(([la, ln]) => px(la, ln).map((v) => v.toFixed(1)).join(",")).join(" ");

const SOUND: [number, number][] = [[47.72, -122.43], [47.72, -122.385], [47.7, -122.39], [47.685, -122.405], [47.668, -122.41], [47.66, -122.422], [47.645, -122.418], [47.632, -122.414], [47.625, -122.39], [47.62, -122.37], [47.615, -122.355], [47.605, -122.34], [47.595, -122.345], [47.59, -122.36], [47.585, -122.38], [47.58, -122.405], [47.57, -122.415], [47.55, -122.405], [47.53, -122.4], [47.53, -122.43]];
const LAKE_WA: [number, number][] = [[47.72, -122.275], [47.7, -122.27], [47.68, -122.265], [47.66, -122.27], [47.645, -122.278], [47.63, -122.28], [47.61, -122.283], [47.59, -122.285], [47.575, -122.278], [47.56, -122.27], [47.545, -122.262], [47.53, -122.258], [47.53, -122.25], [47.72, -122.25]];
const LAKE_UNION: [number, number][] = [[47.645, -122.345], [47.646, -122.333], [47.64, -122.325], [47.63, -122.33], [47.625, -122.337], [47.632, -122.345]];
const UNION_BAY: [number, number][] = [[47.655, -122.29], [47.652, -122.275], [47.645, -122.28], [47.647, -122.295]];
const CANAL: [number, number][] = [[47.666, -122.405], [47.663, -122.385], [47.656, -122.37], [47.649, -122.355], [47.645, -122.343]];
const CUT: [number, number][] = [[47.643, -122.326], [47.647, -122.31], [47.65, -122.295]];
const DUWAMISH: [number, number][] = [[47.59, -122.352], [47.57, -122.345], [47.55, -122.33], [47.53, -122.315]];
const I5: [number, number][] = [[47.72, -122.323], [47.69, -122.322], [47.66, -122.321], [47.65, -122.322], [47.63, -122.327], [47.61, -122.33], [47.595, -122.322], [47.58, -122.32], [47.56, -122.315], [47.53, -122.29]];

const HOODS: [string, number, number][] = [
  ["Ballard", 47.676, -122.39], ["Fremont", 47.66, -122.36], ["Wallingford", 47.658, -122.336], ["Green Lake", 47.69, -122.34], ["U District", 47.667, -122.3], ["Ravenna", 47.682, -122.3],
  ["Northgate", 47.71, -122.33], ["Magnolia", 47.648, -122.395], ["Queen Anne", 47.632, -122.37], ["Capitol Hill", 47.62, -122.31], ["Beacon Hill", 47.575, -122.322], ["Rainier Valley", 47.545, -122.293],
  ["Columbia City", 47.562, -122.3], ["West Seattle", 47.56, -122.395], ["Delridge", 47.538, -122.363],
];

function hull(points: [number, number][]) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [], upper: [number, number][] = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of [...p].reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Pad hull outward from centroid so the group outline wraps the markers
function padded(pts: [number, number][], pad = 22) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map(([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return [x + ((x - cx) / d) * pad, y + ((y - cy) / d) * pad] as [number, number]; });
}

const START = new Date("2026-08-01").getTime();
const END = new Date("2026-11-05").getTime();
const DAY = 86400000;

export default function MapPage() {
  const { cases } = useStore();
  const [layers, setLayers] = useState({ heat: true, hotspots: true, groups: true, cases: true, labels: true });
  const [focus, setFocus] = useState<SeriesId | null>(null);
  const [selected, setSelected] = useState<BurglaryCase | null>(cases.find((c) => c.id === 1044) ?? null);
  const [cutoff, setCutoff] = useState(END);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    raf.current = setInterval(() => {
      setCutoff((c) => {
        if (c >= END) { setPlaying(false); return END; }
        return Math.min(END, c + 3 * DAY);
      });
    }, 90);
    return () => { if (raf.current) clearInterval(raf.current); };
  }, [playing]);

  const visible = useMemo(() => cases.filter((c) => new Date(c.date).getTime() <= cutoff), [cases, cutoff]);

  const groups = useMemo(
    () =>
      (Object.keys(SERIES) as SeriesId[]).map((sid) => {
        const members = visible.filter((c) => c.series === sid).sort((a, b) => a.date.localeCompare(b.date));
        const pts = members.map((m) => px(m.lat, m.lng));
        return { sid, members, pts, hull: pts.length >= 3 ? padded(hull(pts)) : pts };
      }),
    [visible],
  );

  // Hotspots: points with the most neighbors within ~1.3 km
  const hotspots = useMemo(() => {
    const scored = visible.map((c) => ({ c, n: visible.filter((o) => Math.hypot((o.lat - c.lat) * 111, (o.lng - c.lng) * 75) < 1.6).length }));
    const picks: typeof scored = [];
    for (const s of scored.sort((a, b) => b.n - a.n)) {
      if (s.n < 3) break;
      if (picks.every((p) => Math.hypot((p.c.lat - s.c.lat) * 111, (p.c.lng - s.c.lng) * 75) > 2.5)) picks.push(s);
      if (picks.length === 4) break;
    }
    return picks;
  }, [visible]);

  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));
  const dim = (c: BurglaryCase) => focus && c.series !== focus;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Step 3 · AI links related cases"
        title="Geographic View"
        description="Linked cases cluster in space as well as MO. Outlines show each AI-detected series; heat shows burglary density. Press play to watch the series emerge over time."
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-xl border bg-[oklch(0.17_0.03_255)] lg:col-span-8">
          {/* Toolbar */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 rounded-lg border bg-background/80 p-1 text-xs backdrop-blur">
            <Layers className="m-1 size-3.5 text-muted-foreground" />
            {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
              <button key={k} onClick={() => toggle(k)} className={cn("rounded-md px-2 py-1 capitalize", layers[k] ? "bg-primary/20 text-blue-100" : "text-muted-foreground hover:text-foreground")}>
                {k === "groups" ? "Linked groups" : k}
              </button>
            ))}
          </div>
          <div className="absolute top-3 right-3 z-10 rounded-md border bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">MOCK GEOGRAPHY · NOT TO SCALE</div>

          <svg viewBox={`0 0 ${W} ${H}`} className="block h-[640px] w-full md:h-[760px]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="heat">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#2563eb" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </radialGradient>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0H0V30" fill="none" stroke="rgba(148,163,184,.05)" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid)" />
            {/* Water */}
            <g fill="oklch(0.22 0.05 245)" stroke="rgba(96,165,250,.18)">
              <polygon points={poly(SOUND)} />
              <polygon points={poly(LAKE_WA)} />
              <polygon points={poly(LAKE_UNION)} />
              <polygon points={poly(UNION_BAY)} />
              <ellipse cx={px(47.6795, -122.3405)[0]} cy={px(47.6795, -122.3405)[1]} rx={22} ry={30} />
            </g>
            <g fill="none" stroke="oklch(0.22 0.05 245)" strokeLinecap="round">
              <polyline points={poly(CANAL)} strokeWidth={7} />
              <polyline points={poly(CUT)} strokeWidth={5} />
              <polyline points={poly(DUWAMISH)} strokeWidth={6} />
            </g>
            <polyline points={poly(I5)} fill="none" stroke="rgba(148,163,184,.16)" strokeWidth={3} strokeDasharray="10 6" />
            <text x={px(47.715, -122.326)[0] + 6} y={px(47.715, -122.326)[1]} fill="rgba(148,163,184,.35)" fontSize={10}>I-5</text>
            <text x={18} y={px(47.6, 0)[1]} fill="rgba(96,165,250,.35)" fontSize={12} fontStyle="italic">Puget Sound</text>
            <text x={W - 70} y={px(47.62, 0)[1]} fill="rgba(96,165,250,.35)" fontSize={12} fontStyle="italic" transform={`rotate(90 ${W - 70} ${px(47.62, 0)[1]})`}>Lake Washington</text>

            {layers.labels && HOODS.map(([n, la, ln]) => {
              const [x, y] = px(la, ln);
              return <text key={n} x={x} y={y} textAnchor="middle" fill="rgba(203,213,225,.32)" fontSize={11} letterSpacing={1.2} style={{ textTransform: "uppercase" }}>{n}</text>;
            })}

            {layers.heat && (
              <g style={{ mixBlendMode: "screen" }}>
                {visible.map((c) => { const [x, y] = px(c.lat, c.lng); return <circle key={c.id} cx={x} cy={y} r={60} fill="url(#heat)" />; })}
              </g>
            )}

            {layers.groups && groups.map((g) => {
              const s = SERIES[g.sid];
              const faded = focus && focus !== g.sid;
              if (g.pts.length < 2) return null;
              return (
                <g key={g.sid} opacity={faded ? 0.15 : 1} className="transition-opacity">
                  {g.hull.length >= 3 && <polygon points={g.hull.map((p) => p.join(",")).join(" ")} fill={s.color} fillOpacity={0.08} stroke={s.color} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="5 4" strokeLinejoin="round" />}
                  <polyline points={g.pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={s.color} strokeOpacity={0.55} strokeWidth={1.5} />
                </g>
              );
            })}

            {layers.hotspots && hotspots.map((h) => {
              const [x, y] = px(h.c.lat, h.c.lng);
              return (
                <g key={h.c.id} pointerEvents="none">
                  <circle cx={x} cy={y} r={6} fill="none" stroke="#f87171" strokeWidth={2} className="pulse-ring" />
                  <circle cx={x} cy={y} r={34} fill="none" stroke="#f87171" strokeOpacity={0.5} strokeDasharray="2 4" />
                  <rect x={x + 30} y={y - 30} width={92} height={20} rx={4} fill="rgba(127,29,29,.75)" stroke="rgba(248,113,113,.5)" />
                  <text x={x + 76} y={y - 16} textAnchor="middle" fontSize={10} fill="#fecaca" fontWeight={600}>HOTSPOT · {h.n} cases</text>
                </g>
              );
            })}

            {layers.cases && visible.map((c) => {
              const [x, y] = px(c.lat, c.lng);
              const color = c.series ? SERIES[c.series].color : "#94a3b8";
              const sel = selected?.id === c.id;
              const fresh = cutoff - new Date(c.date).getTime() < 6 * DAY && cutoff < END;
              return (
                <g key={c.id} onClick={() => setSelected(c)} className="cursor-pointer" opacity={dim(c) ? 0.25 : 1}>
                  {(sel || fresh) && <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={2} className="pulse-ring" />}
                  <circle cx={x} cy={y} r={sel ? 8 : 6} fill={color} stroke="#0b1220" strokeWidth={2} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
                  {c.status === "Cleared" && <circle cx={x} cy={y} r={11} fill="none" stroke="#34d399" strokeWidth={1.5} />}
                  {(sel || c.series) && <text x={x + 10} y={y + 4} fontSize={10} fill="rgba(226,232,240,.8)" fontFamily="var(--font-geist-mono)">{c.id}</text>}
                </g>
              );
            })}
          </svg>

          {/* Timeline */}
          <div className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-lg border bg-background/85 px-3 py-2 backdrop-blur">
            <button
              onClick={() => { if (cutoff >= END) setCutoff(START); setPlaying((p) => !p); }}
              className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <input type="range" min={START} max={END} step={DAY} value={cutoff} onChange={(e) => { setPlaying(false); setCutoff(Number(e.target.value)); }} className="flex-1 accent-blue-500" />
            <span className="w-28 text-right font-mono text-xs">{new Date(cutoff).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{visible.length} cases</span>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Panel title="Linked-case groups" subtitle="Click to isolate a series on the map">
            <div className="space-y-2">
              {groups.map((g) => {
                const s = SERIES[g.sid];
                const on = focus === g.sid;
                return (
                  <button key={g.sid} onClick={() => setFocus(on ? null : g.sid)} className={cn("w-full rounded-lg border p-3 text-left transition-colors", on ? "bg-white/[0.05]" : "hover:bg-white/[0.03]")} style={{ borderColor: on ? s.color : undefined }}>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{g.members.length}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.timeWindow} · {s.mo[1]}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {g.members.map((m) => <span key={m.id} className="rounded bg-white/5 px-1.5 font-mono text-[10px]">#{m.id}</span>)}
                    </div>
                  </button>
                );
              })}
              {focus && <button onClick={() => setFocus(null)} className="text-xs text-primary hover:underline">Show all series</button>}
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><Crosshair className="size-4 text-primary" />Selected case</span>}>
            {selected ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg text-primary">#{selected.id}</span>
                  <StatusBadge status={cases.find((c) => c.id === selected.id)!.status} />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />{selected.block}, {selected.neighborhood}</div>
                <div className="text-muted-foreground">{fmtDate(selected.date)} · {fmtTime(selected.time)} · {selected.entry}</div>
                <div className="text-xs">{selected.items.map((i) => i.name).join(", ")}</div>
                {selected.series ? (
                  <div className="rounded-md px-2 py-1.5 text-xs" style={{ background: SERIES[selected.series].color + "18", color: SERIES[selected.series].color }}>
                    Member of {SERIES[selected.series].name}
                  </div>
                ) : (
                  <div className="rounded-md bg-white/5 px-2 py-1.5 text-xs text-muted-foreground">No series link</div>
                )}
                <Link href={`/cases/${selected.id}`} className="inline-flex items-center gap-1 pt-1 text-xs text-primary hover:underline">Open AI lead <ArrowRight className="size-3" /></Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click a marker on the map.</p>
            )}
          </Panel>

          <Panel title="Legend">
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-400" /> Unlinked case</li>
              <li className="flex items-center gap-2"><span className="size-2.5 rounded-full ring-2 ring-emerald-400" /> Cleared</li>
              <li className="flex items-center gap-2"><span className="size-2.5 rounded-full border-2 border-dashed border-red-400" /> Hotspot (3+ cases within 1.6 km)</li>
              <li className="flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-blue-400" /> Series boundary &amp; sequence</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
