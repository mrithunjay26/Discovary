"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { CartesianGrid, ReferenceArea, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  Car,
  Gem,
  Fingerprint,
  Clock,
  Store,
  Check,
  X,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Video,
  Eye,
  MapPin,
  FileText,
  Gavel,
} from "lucide-react";
import { CASES, DETECTIVES, SERIES, fmtDate, fmtTime, linkedCases, matchesForCase, money, nearestCandidate, pairSimilarity, prioritize, seriesExplanation, similarityScore, type BurglaryCase } from "@/lib/data";
import { useStore } from "@/lib/store";
import { CHART, Panel, PriorityBadge, ScoreBar, ScoreRing, StatusBadge, tooltipStyle } from "@/components/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const WINDOWS = { A: [13, 16.2], B: [1, 4.5], C: [9.5, 11.5] } as const;
const hourOf = (t: string) => { const [h, m] = t.split(":").map(Number); return h + m / 60; };

const STEPS = [
  "Parsing incident narrative (NLP entity extraction)",
  "Extracting MO features: entry, tool marks, time, targets",
  "Comparing against 2,184 burglary reports (18 months)",
  "Clustering by time, location and MO similarity",
  "Querying LeadsOnline for reported property",
  "Writing lead summary and explanation",
];

export default function CaseDetail({ id }: { id: number }) {
  const { cases } = useStore();
  const bc = cases.find((c) => c.id === id);
  if (!bc) notFound();
  return <CaseView key={bc.id} bc={bc} />;
}

function CaseView({ bc }: { bc: BurglaryCase }) {
  const store = useStore();
  const [step, setStep] = useState(store.analyzed[bc.id] ? STEPS.length : 0);

  useEffect(() => {
    if (step >= STEPS.length) {
      if (!store.analyzed[bc.id]) store.markAnalyzed(bc.id);
      if (typeof window !== "undefined" && window.location.hash === "#review") {
        setTimeout(() => document.getElementById("review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 2 ? 900 : 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, bc.id]);

  const done = step >= STEPS.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Link href="/cases" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All cases
      </Link>

      <CaseHeader bc={bc} onRerun={() => setStep(0)} analyzing={!done} />

      {!done ? <Analyzing step={step} bc={bc} /> : <Findings bc={bc} />}
    </div>
  );
}

function CaseHeader({ bc, onRerun, analyzing }: { bc: BurglaryCase; onRerun: () => void; analyzing: boolean }) {
  const p = prioritize(bc);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card/70 p-5 md:flex-row md:items-center">
      <div className="flex-1 space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Step 2 · AI Lead Generation</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold tracking-tight">Case #{bc.id}</h1>
          <StatusBadge status={bc.status} />
          <PriorityBadge p={p.priority} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{bc.block}, {bc.neighborhood}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{fmtDate(bc.date)} · ~{fmtTime(bc.time)}</span>
          <span>Entry: <span className="text-foreground">{bc.entry}</span></span>
          <span>Assigned: <span className="text-foreground">{bc.detective ?? "Unassigned"}</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(bc.id)} onValueChange={(v) => v && router.push(`/cases/${v}`)}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CASES.map((c) => <SelectItem key={c.id} value={String(c.id)}>#{c.id} · {c.neighborhood}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="lg" onClick={onRerun} disabled={analyzing} className="gap-1.5">
          <RefreshCw className={cn("size-3.5", analyzing && "animate-spin")} /> Re-run AI
        </Button>
      </div>
    </div>
  );
}

function Analyzing({ step, bc }: { step: number; bc: BurglaryCase }) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel className="scanline relative overflow-hidden lg:col-span-3" title={<span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI is analyzing Case #{bc.id}</span>} subtitle="Typical runtime: 4 seconds. Manual equivalent: ~6 detective hours.">
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-3 text-sm transition-opacity", i > step && "opacity-35")}>
              {i < step ? <CheckCircle2 className="size-4 text-primary" /> : i === step ? <Loader2 className="size-4 animate-spin text-primary" /> : <span className="size-4 rounded-full border" />}
              <span className={i === step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
              {i === 2 && i <= step && <span className="ml-auto font-mono text-xs text-muted-foreground">{i < step ? "2,184 / 2,184" : "1,312 / 2,184"}</span>}
            </li>
          ))}
        </ol>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
      </Panel>
      <Panel className="lg:col-span-2" title={<span className="inline-flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /> Original report narrative</span>}>
        <p className="text-sm leading-relaxed text-foreground/85">{bc.narrative}</p>
      </Panel>
    </div>
  );
}

function Findings({ bc }: { bc: BurglaryCase }) {
  const links = linkedCases(bc);
  const sim = similarityScore(bc);
  const matches = matchesForCase(bc);
  const s = bc.series ? SERIES[bc.series] : null;
  const group = [bc, ...links];
  const p = prioritize(bc);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Similarity */}
        <Panel className="fade-up lg:col-span-3" title="Similarity score">
          <div className="flex flex-col items-center gap-3 py-2">
            <ScoreRing score={sim} size={140} label={s ? "series match" : "nearest match"} />
            {s ? (
              <div className="text-center">
                <div className="text-sm font-medium" style={{ color: s.color }}>{s.name}</div>
                <div className="text-xs text-muted-foreground">{group.length} cases · {s.dayPattern} · {s.timeWindow}</div>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">Below the 70% series threshold</div>
            )}
          </div>
        </Panel>

        {/* Explanation */}
        <Panel className="fade-up lg:col-span-9" title={<span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI Findings</span>} action={<span className="font-mono text-[11px] text-muted-foreground">model v2.4 · confidence {s ? "high" : "low"}</span>}>
          {s ? (
            <div className="space-y-4">
              <blockquote className="rounded-lg border-l-2 border-primary bg-primary/[0.07] px-4 py-3 text-base leading-relaxed text-blue-50">
                &ldquo;{seriesExplanation(bc)}&rdquo;
              </blockquote>
              <ul className="grid gap-2 text-sm text-foreground/85 md:grid-cols-2">
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />Tool impression (~1/2&Prime; flat pry) matches across {group.filter((g) => g.pointOfEntry === bc.pointOfEntry).length} reports.</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />All locations fall within a {bc.series === "A" ? "2.4" : bc.series === "B" ? "3.1" : "2.7"} mi radius, consistent with a single offender&apos;s comfort zone.</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{s.vehicle.split(",")[0]} reported in {group.filter((g) => g.vehicle).length} of {group.length} cases.</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{matches.length ? `${matches.length} possible pawn matches for series property; ${matches.filter((m) => m.confidence >= 75).length} above 75% confidence.` : "No pawn matches yet; watch list active."}</li>
              </ul>
              <div className="rounded-lg border bg-white/[0.02] px-4 py-3 text-sm">
                <span className="font-medium text-foreground">Recommended next action: </span>
                <span className="text-muted-foreground">
                  {matches[0] ? `Request a 30-day hold on ${matches[0].id} (${matches[0].reportedItem}, ${matches[0].shop}) and obtain the seller record. ` : ""}
                  Run the vehicle description against ALPR hits within 1 mile of each scene during the {s.timeWindow} window.
                </span>
              </div>
            </div>
          ) : (
            <NoSeries bc={bc} />
          )}
        </Panel>
      </div>

      {s && (
        <>
          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="fade-up lg:col-span-5" title="Linked cases" subtitle="Ranked by pairwise similarity to this case">
              <div className="space-y-2">
                {links
                  .sort((a, b) => pairSimilarity(bc, b) - pairSimilarity(bc, a))
                  .map((l) => (
                    <Link key={l.id} href={`/cases/${l.id}`} className="group flex items-center gap-3 rounded-lg border bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5">
                      <span className="font-mono text-sm text-primary">#{l.id}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">{l.neighborhood} <span className="text-muted-foreground">· {fmtDate(l.date)} · {fmtTime(l.time)}</span></div>
                        <div className="truncate text-[11px] text-muted-foreground">{l.items.map((i) => i.name).join(", ")}</div>
                      </div>
                      <ScoreBar score={pairSimilarity(bc, l)} />
                    </Link>
                  ))}
              </div>
            </Panel>

            <Panel className="fade-up lg:col-span-7" title="Feature comparison" subtitle="What the model matched on">
              <FeatureMatrix bc={bc} group={group} />
            </Panel>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Panel className="fade-up" title={<span className="inline-flex items-center gap-2"><Fingerprint className="size-4 text-primary" />Shared MO</span>}>
              <ul className="space-y-2 text-sm">
                {s.mo.map((m) => (
                  <li key={m} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: s.color }} />{m}</li>
                ))}
              </ul>
            </Panel>
            <Panel className="fade-up" title={<span className="inline-flex items-center gap-2"><Gem className="size-4 text-primary" />Shared stolen items</span>}>
              <SharedItems group={group} />
            </Panel>
            <Panel className="fade-up" title={<span className="inline-flex items-center gap-2"><Car className="size-4 text-primary" />Shared vehicle descriptions</span>}>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border p-3" style={{ borderColor: s.color + "55", background: s.color + "10" }}>
                  <div className="font-medium">{s.vehicle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Sources: {s.vehicleSource}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((g) => (
                    <span key={g.id} className={cn("rounded px-1.5 py-0.5 font-mono text-[11px]", g.vehicle ? "bg-primary/15 text-blue-200" : "bg-white/5 text-muted-foreground line-through")}>#{g.id}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Seen in {group.filter((g) => g.vehicle).length} of {group.length} reports. Strikethrough = no vehicle reported.</p>
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="fade-up lg:col-span-7" title="Time-of-day fingerprint" subtitle={`Every unit case plotted by date and hour. Shaded band = series window (${s.timeWindow}).`}>
              <TimeChart bc={bc} />
            </Panel>
            <Panel className="fade-up lg:col-span-5" title={<span className="inline-flex items-center gap-2"><Store className="size-4 text-primary" />LeadsOnline property matches</span>} action={<Link href={`/leadsonline?case=${bc.id}`} className="text-xs text-primary hover:underline">Details &rarr;</Link>}>
              {matches.length ? (
                <div className="space-y-2">
                  {matches.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border bg-white/[0.02] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{m.item} <span className="font-normal text-muted-foreground">· from #{m.caseId}</span></div>
                        <div className="text-[11px] text-muted-foreground">{m.shop} · listed {fmtDate(m.dateListed)}</div>
                      </div>
                      <ScoreBar score={m.confidence} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No matches yet. Items added to the 90-day watch list.</p>
              )}
            </Panel>
          </div>
        </>
      )}

      <Review bc={bc} group={group} priority={p} />
    </div>
  );
}

function NoSeries({ bc }: { bc: BurglaryCase }) {
  const n = nearestCandidate(bc);
  return (
    <div className="space-y-3">
      <blockquote className="rounded-lg border-l-2 border-slate-500 bg-white/[0.03] px-4 py-3 text-base leading-relaxed">
        &ldquo;No high-confidence series match. Case #{bc.id} appears to be an isolated incident: the nearest candidate, #{n?.other.id} ({n?.score}%), differs by {n?.diffs.join(", ") || "minor details"}.&rdquo;
      </blockquote>
      <div className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-lg border p-3"><Video className="mb-1 size-4 text-primary" />{bc.evidence.video ? "Video available: request enhancement and canvass for additional cameras." : "No video: canvass for doorbell cameras on the block."}</div>
        <div className="rounded-lg border p-3"><Fingerprint className="mb-1 size-4 text-primary" />{bc.evidence.prints ? "Prints collected: queue for AFIS comparison." : "No forensic evidence collected."}</div>
        <div className="rounded-lg border p-3"><Eye className="mb-1 size-4 text-primary" />{bc.evidence.witness ? "Witness on file: schedule follow-up interview." : "No witness. Items added to LeadsOnline watch list."}</div>
      </div>
    </div>
  );
}

function FeatureMatrix({ bc, group }: { bc: BurglaryCase; group: BurglaryCase[] }) {
  const w = WINDOWS[bc.series!];
  const cats = new Set(bc.items.map((i) => i.category));
  const features = [
    { label: "Time window", test: (g: BurglaryCase) => hourOf(g.time) >= w[0] && hourOf(g.time) <= w[1] },
    { label: "Entry method", test: (g: BurglaryCase) => g.entry === bc.entry },
    { label: "Point of entry", test: (g: BurglaryCase) => g.pointOfEntry === bc.pointOfEntry },
    { label: "Target property", test: (g: BurglaryCase) => g.items.some((i) => cats.has(i.category)) },
    { label: "Suspect vehicle", test: (g: BurglaryCase) => !!g.vehicle },
    { label: "Video / witness", test: (g: BurglaryCase) => g.evidence.video || g.evidence.witness },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-muted-foreground uppercase">
            <th className="py-2 pr-3 text-left font-medium">Feature</th>
            {group.map((g) => (
              <th key={g.id} className={cn("px-2 py-2 text-center font-mono font-medium", g.id === bc.id && "text-primary")}>#{g.id}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.label} className="border-t">
              <td className="py-2 pr-3 text-muted-foreground">{f.label}</td>
              {group.map((g) => (
                <td key={g.id} className="px-2 py-2 text-center">
                  {f.test(g) ? <span className="inline-grid size-5 place-items-center rounded bg-primary/20"><Check className="size-3.5 text-primary" /></span> : <span className="inline-grid size-5 place-items-center rounded bg-white/5"><X className="size-3 text-muted-foreground" /></span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SharedItems({ group }: { group: BurglaryCase[] }) {
  const cats = useMemo(() => {
    const m = new Map<string, { count: number; value: number; names: string[] }>();
    for (const g of group) {
      const seen = new Set<string>();
      for (const i of g.items) {
        const e = m.get(i.category) ?? { count: 0, value: 0, names: [] };
        if (!seen.has(i.category)) e.count++;
        seen.add(i.category);
        e.value += i.value;
        e.names.push(i.name);
        m.set(i.category, e);
      }
    }
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [group]);
  const total = group.reduce((s, g) => s + g.items.reduce((t, i) => t + i.value, 0), 0);
  return (
    <div className="space-y-3">
      {cats.map(([cat, e]) => (
        <div key={cat}>
          <div className="flex justify-between text-sm">
            <span>{cat}</span>
            <span className="font-mono text-xs text-muted-foreground">{e.count}/{group.length} cases · {money(e.value)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(e.count / group.length) * 100}%` }} />
          </div>
          <div className="mt-1 truncate text-[11px] text-muted-foreground">{e.names.join(", ")}</div>
        </div>
      ))}
      <div className="border-t pt-2 text-xs text-muted-foreground">Total series loss: <span className="font-mono text-foreground">{money(total)}</span></div>
    </div>
  );
}

function TimeChart({ bc }: { bc: BurglaryCase }) {
  const w = WINDOWS[bc.series!];
  const toPt = (c: BurglaryCase) => ({ x: new Date(c.date).getTime(), y: +hourOf(c.time).toFixed(2), id: c.id, hood: c.neighborhood });
  const inSeries = CASES.filter((c) => c.series === bc.series).map(toPt);
  const others = CASES.filter((c) => c.series !== bc.series).map(toPt);
  const color = SERIES[bc.series!].color;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} />
          <XAxis type="number" dataKey="x" domain={["dataMin - 86400000", "dataMax + 86400000"]} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey="y" domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} tickFormatter={(v) => (v === 0 || v === 24 ? "12a" : v === 12 ? "12p" : v < 12 ? `${v}a` : `${v - 12}p`)} stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} reversed />
          <ZAxis range={[60, 60]} />
          <ReferenceArea y1={w[0]} y2={w[1]} fill={color} fillOpacity={0.12} stroke={color} strokeOpacity={0.3} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ stroke: "rgba(148,163,184,.3)" }}
            content={({ payload }) => {
              const d = payload?.[0]?.payload as { id: number; hood: string; y: number } | undefined;
              if (!d) return null;
              return <div className="rounded-md border bg-popover px-2 py-1 text-xs">#{d.id} · {d.hood} · {fmtTime(`${Math.floor(d.y)}:${String(Math.round((d.y % 1) * 60)).padStart(2, "0")}`)}</div>;
            }}
          />
          <Scatter data={others} fill={CHART.slate} fillOpacity={0.5} />
          <Scatter data={inSeries} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function Review({ bc, group, priority }: { bc: BurglaryCase; group: BurglaryCase[]; priority: ReturnType<typeof prioritize> }) {
  const store = useStore();
  const [det, setDet] = useState(bc.detective ?? DETECTIVES[0]);
  const [note, setNote] = useState("");
  const approved = bc.status === "Lead Approved";
  const cleared = bc.status === "Cleared";
  const openInGroup = group.filter((g) => store.cases.find((c) => c.id === g.id)?.status !== "Cleared");

  return (
    <section id="review" className="scroll-mt-20 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-card/70 p-5">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex-1 space-y-2">
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">Step 6 · Detective review</div>
          <h2 className="text-lg font-semibold">Review the AI lead</h2>
          <p className="text-sm text-muted-foreground">{priority.summary}</p>
          <p className="text-xs text-muted-foreground">The AI recommends; a detective decides. Every action is logged for audit and court disclosure.</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Investigator notes (optional)…"
            className="mt-2 h-20 w-full resize-none rounded-lg border bg-background/50 p-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>
        <div className="w-full space-y-3 lg:w-80">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Assign to</div>
            <Select value={det} onValueChange={(v) => { if (v) { setDet(v); store.assign(bc.id, v); } }}>
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{DETECTIVES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {cleared ? (
            <div className="fade-up space-y-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              <div className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4" /> Cleared by arrest</div>
              <p className="text-xs text-emerald-200/80">{group.length > 1 ? `One arrest closed ${group.length} burglary reports in this series.` : "Case closed."}</p>
              <Link href="/impact" className={cn(buttonVariants({ size: "sm" }), "w-full gap-1")}>See the impact <ArrowRight className="size-3.5" /></Link>
            </div>
          ) : approved ? (
            <div className="fade-up space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">
                <CheckCircle2 className="size-4" /> Lead approved · assigned to {det}
              </div>
              <Button
                size="lg"
                className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/85"
                onClick={() => {
                  openInGroup.forEach((g) => store.setStatus(g.id, "Cleared", `Case #${g.id} cleared by arrest (series ${bc.series ?? "n/a"})`));
                }}
              >
                <Gavel className="size-4" /> Record arrest &amp; clear {openInGroup.length > 1 ? `${openInGroup.length} linked cases` : "case"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Button size="lg" className="gap-1.5" onClick={() => store.setStatus(bc.id, "Lead Approved", `Det. approved AI lead for #${bc.id}${note ? `: “${note}”` : ""}`)}>
                <Check className="size-4" /> Approve lead
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="lg" className="gap-1.5" onClick={() => store.setStatus(bc.id, "Under Review", `More info requested on #${bc.id}`)}>
                  <HelpCircle className="size-4" /> More info
                </Button>
                <Button variant="outline" size="lg" className="gap-1.5 text-red-300" onClick={() => store.setStatus(bc.id, "AI Analyzed", `AI lead for #${bc.id} dismissed${note ? `: “${note}”` : ""}`)}>
                  <X className="size-4" /> Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
