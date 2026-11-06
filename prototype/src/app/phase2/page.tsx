"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FileInput,
  ScanText,
  Link2,
  Store,
  Sparkles,
  UserCheck,
  BadgeCheck,
  Play,
  ArrowRight,
  ShieldAlert,
  Percent,
  FolderOpen,
    CheckCircle2,
  Loader2,
} from "lucide-react";
import { MONTHLY, YTD_CLEARED, YTD_TOTAL, prioritize, SERIES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { CHART, PageHeader, Panel, PriorityBadge, StatusBadge, tooltipStyle } from "@/components/common";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const PIPELINE = [
  { icon: FileInput, title: "Case enters system", log: "RMS ingest: Case #1044 — residential burglary, Wallingford (4500 blk Wallingford Ave N)" },
  { icon: ScanText, title: "AI analyzes report", log: "NLP extraction: entry=rear window (pried, ~1/2″ tool) · time=1:00–4:10 PM · items=jewelry, laptop · vehicle=silver sedan" },
  { icon: Link2, title: "Links related cases", log: "Similarity search over 2,184 synthetic reports → 5 candidate links (1098, 1121, 1133, 1157, 1162) · weighted by distance + timing (strongest signals in linkage research)" },
  { icon: Store, title: "Checks dealer records", log: "Authorized dealer-record query (LeadsOnline-style, synthetic): 3 property matches across the series" },
  { icon: Sparkles, title: "Creates lead", log: "Lead generated with cited sources. Seller details only through legal process; no seller profiles." },
  { icon: UserCheck, title: "Detective reviews", log: "Routed to Det. K. Nguyen · priority HIGH · awaiting human review (AI never acts on its own)" },
  { icon: BadgeCheck, title: "Cases cleared on evidence", log: "Each linked case is cleared only if charged on its own evidence (UCR counts offenses individually)" },
];

export default function Dashboard() {
  const { cases, leadsApproved, activity } = useStore();
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = () => {
    if (timer.current) clearInterval(timer.current);
    setStage(0);
    setRunning(true);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      if (i >= PIPELINE.length) {
        clearInterval(timer.current!);
        setRunning(false);
        return;
      }
      setStage(i);
    }, 1100);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const rate = ((YTD_CLEARED / YTD_TOTAL) * 100).toFixed(1);
  const active = cases.filter((c) => c.status !== "Cleared" && c.status !== "Inactive").length;
  const leads = cases
    .filter((c) => c.status === "Lead Generated" || c.status === "Under Review")
    .map((c) => ({ c, p: prioritize(c) }))
    .sort((a, b) => b.p.score - a.p.score)
    .slice(0, 5);

  const entryCounts = Object.entries(
    cases.reduce<Record<string, number>>((acc, c) => ((acc[c.entry] = (acc[c.entry] ?? 0) + 1), acc), {}),
  )
    .map(([entry, count]) => ({ entry, count }))
    .sort((a, b) => b.count - a.count);

  const kpis = [
    { label: "Total burglaries (YTD)", value: YTD_TOTAL.toLocaleString(), sub: "Jan – Oct 2026, citywide", icon: ShieldAlert, href: "/cases" },
    { label: "Clearance rate", value: `${rate}%`, sub: "Synthetic · national 2022: 13%", icon: Percent, href: "/cases" },
    { label: "Active investigations", value: (366 + active).toString(), sub: `${active} in Burglary Unit queue`, icon: FolderOpen, href: "/queue" },
    { label: "AI-generated leads", value: (147 + leadsApproved).toString(), sub: `${leadsApproved} approved this session`, icon: Sparkles, href: "/queue", accent: true },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Phase 2 concept · Command Dashboard · synthetic data"
        title={<>In-CJIS Case Linking <span className="text-primary text-glow">(Phase 2 concept)</span></>}
        description="Roadmap only, not in the pilot. Inside the department's CJIS environment, this would link related reports, check authorized dealer records, and hand detectives a ranked, sourced lead. Gated by Phase 1 results, a separate CJIS approval and its own randomized pilot."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
          <span className="size-1.5 rounded-full bg-amber-400" /> Concept &middot; synthetic data
        </span>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40",
              k.accent && "border-primary/40 glow-blue",
            )}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {k.label}
              <k.icon className="size-4 text-primary/80" />
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums md:text-3xl">{k.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* Pipeline hero */}
      <Panel
        title="How a lead is born — Case #1044"
        subtitle="Concept walkthrough on a synthetic report"
        action={
          <button onClick={run} disabled={running} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            {stage < 0 ? "Run live analysis" : running ? "Analyzing…" : "Replay"}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {PIPELINE.map((s, i) => {
            const state = stage < 0 ? "idle" : i < stage || (!running && i <= stage) ? "done" : i === stage ? "active" : "idle";
            return (
              <div
                key={s.title}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all duration-500",
                  state === "active" && "scanline border-primary/60 bg-primary/10 glow-blue",
                  state === "done" && "border-primary/30 bg-primary/5",
                  state === "idle" && "opacity-60",
                )}
              >
                <div className={cn("grid size-10 place-items-center rounded-full ring-1 transition-colors", state === "idle" ? "bg-white/5 ring-white/10" : "bg-primary/20 ring-primary/50")}>
                  {state === "done" ? <CheckCircle2 className="size-5 text-primary" /> : <s.icon className={cn("size-5", state === "active" ? "text-primary" : "text-muted-foreground")} />}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">STEP {i + 1}</div>
                <div className="text-xs leading-tight font-medium">{s.title}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 min-h-[120px] rounded-lg border bg-black/30 p-3 font-mono text-xs">
          {stage < 0 ? (
            <div className="text-muted-foreground">
              <span className="text-primary">$</span> cascade-ai --watch rms-feed &nbsp;
              <span className="animate-pulse">█</span>
              <div className="mt-2">Press <span className="text-foreground">Run live analysis</span> to process Case #1044.</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {PIPELINE.slice(0, stage + 1).map((s, i) => (
                <div key={i} className="fade-up flex gap-2">
                  <span className="shrink-0 text-muted-foreground">[{String(14 + i).padStart(2, "0")}:{String(2 + i * 3).padStart(2, "0")}:{String(11 + i * 7).padStart(2, "0")}]</span>
                  <span className={i === stage && running ? "text-blue-300" : "text-slate-300"}>{s.log}</span>
                </div>
              ))}
              {!running && stage === PIPELINE.length - 1 && (
                <div className="fade-up flex flex-wrap gap-2 pt-2 font-sans">
                  <Link href="/cases/1044" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
                    Open AI lead for #1044 <ArrowRight className="size-3.5" />
                  </Link>
                  <Link href="/leadsonline" className={buttonVariants({ size: "sm", variant: "outline" })}>View pawn matches</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Monthly burglaries vs. clearance rate" subtitle="Synthetic, illustrative counts. No Phase 2 results exist.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="l" stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" domain={[10, 17]} unit="%" stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar yAxisId="l" dataKey="burglaries" name="Burglaries" fill={CHART.blue} fillOpacity={0.55} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="l" dataKey="cleared" name="Cleared" fill={CHART.green} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                <Line yAxisId="r" dataKey="rate" name="Clearance %" stroke={CHART.amber} strokeWidth={2.5} dot={{ r: 3, fill: CHART.amber }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Entry methods" subtitle="Last 30 unit cases">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entryCounts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="entry" width={130} stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" name="Cases" fill={CHART.blueSoft} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Top AI-generated leads" subtitle="Ranked by the prioritization model" action={<Link href="/queue" className="text-xs text-primary hover:underline">Open queue &rarr;</Link>}>
          <div className="divide-y">
            {leads.map(({ c, p }) => (
              <Link key={c.id} href={`/cases/${c.id}`} className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-16 shrink-0 font-mono text-sm text-primary">#{c.id}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{c.neighborhood}</span>
                    {c.series && (
                      <span className="rounded px-1.5 text-[11px]" style={{ background: SERIES[c.series].color + "22", color: SERIES[c.series].color }}>
                        {SERIES[c.series].name}
                      </span>
                    )}
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriorityBadge p={p.priority} />
                  <span className="font-mono text-[11px] text-muted-foreground">score {p.score}</span>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Activity" subtitle="AI and detective actions">
          <ul className="space-y-3 text-xs">
            {[
              ...activity.map((a) => ({ k: `u${a.id}`, t: a.at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), text: a.text, tone: a.tone })),
              { k: "s1", t: "11:42 AM", text: "AI linked new report #1165 to South End Forced-Door Series (85%)", tone: "ai" as const },
              { k: "s2", t: "10:18 AM", text: "Dealer record: MacBook Pro at Sound Pawn Brokers resembles item in #1162 (94)", tone: "ai" as const },
              { k: "s3", t: "9:51 AM", text: "Det. M. Brooks requested property hold LO-87990 (e-bike)", tone: "detective" as const },
              { k: "s4", t: "9:15 AM", text: "Case #1170 ingested from RMS — analysis complete, no series match", tone: "ai" as const },
              { k: "s5", t: "Yesterday", text: "Case #1049 closed by detective in RMS — property returned", tone: "success" as const },
            ]
              .slice(0, 8)
              .map((a) => (
                <li key={a.k} className="fade-up flex gap-2.5">
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", a.tone === "ai" ? "bg-primary" : a.tone === "success" ? "bg-emerald-400" : "bg-amber-400")} />
                  <div>
                    <div className="text-foreground/90">{a.text}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.t}</div>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
