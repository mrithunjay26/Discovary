"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Flame, Gauge, Snowflake, UserPlus, Check, ArrowRight, Sparkles } from "lucide-react";
import { SERIES, fmtDate, prioritize, type BurglaryCase, type Priority } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PageHeader, StatusBadge } from "@/components/common";
import { cn } from "@/lib/utils";

const COLS: { p: Priority; icon: typeof Flame; tone: string; ring: string; blurb: string }[] = [
  { p: "High", icon: Flame, tone: "text-red-300", ring: "border-red-400/30", blurb: "Work today. Linked series and/or a live property lead." },
  { p: "Medium", icon: Gauge, tone: "text-amber-300", ring: "border-amber-400/30", blurb: "Work this week. Some evidence, no strong lead yet." },
  { p: "Low", icon: Snowflake, tone: "text-slate-300", ring: "border-slate-400/20", blurb: "Monitor. AI keeps watching for new links." },
];

export default function QueuePage() {
  const { cases } = useStore();
  const ranked = useMemo(
    () =>
      cases
        .filter((c) => c.status !== "Cleared" && c.status !== "Inactive")
        .map((c) => ({ c, p: prioritize(c) }))
        .sort((a, b) => b.p.score - a.p.score),
    [cases],
  );
  const high = ranked.filter((r) => r.p.priority === "High");
  const seriesCount = new Set(high.map((h) => h.c.series).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Step 5 · AI creates lead"
        title="AI Prioritization Queue"
        description="Every open case is scored on linked cases, property leads, evidence, suspect vehicle and recency. Each ranking comes with a plain-language reason a sergeant can audit."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/[0.07] p-4 md:flex-row md:items-center">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-blue-50">
          <span className="font-semibold">AI recommendation:</span> focus 3 detectives on the {high.length} high-priority cases. They make up {seriesCount} active series and{" "}
          {Math.round((high.length / Math.max(ranked.length, 1)) * 100)}% of the open queue, and hold most of the recoverable property value.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLS.map((col) => {
          const items = ranked.filter((r) => r.p.priority === col.p);
          return (
            <div key={col.p} className={cn("flex flex-col rounded-xl border bg-card/50", col.ring)}>
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <col.icon className={cn("size-4", col.tone)} />
                <h2 className={cn("text-sm font-semibold", col.tone)}>{col.p} Priority</h2>
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 font-mono text-xs">{items.length}</span>
              </div>
              <p className="px-4 pt-3 text-xs text-muted-foreground">{col.blurb}</p>
              <div className="space-y-2 p-3">
                {items.map(({ c, p }, i) => (
                  <QueueCard key={c.id} c={c} p={p} rank={ranked.findIndex((r) => r.c.id === c.id) + 1} defaultOpen={col.p === "High" && i === 0} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueueCard({ c, p, rank, defaultOpen }: { c: BurglaryCase; p: ReturnType<typeof prioritize>; rank: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const { assign } = useStore();
  const mine = c.detective === "Det. K. Nguyen";
  return (
    <div className={cn("rounded-lg border bg-background/40 transition-colors", open && "border-primary/40 bg-primary/[0.04]")}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 p-3 text-left">
        <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">#{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-medium text-primary">Case {c.id}</span>
            <span className="text-xs text-muted-foreground">{c.neighborhood} · {fmtDate(c.date)}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/85">{p.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-lg leading-none font-semibold tabular-nums">{p.score}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="fade-up space-y-3 border-t px-3 pt-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status} />
            {c.series && <span className="rounded px-1.5 py-0.5 text-[11px]" style={{ background: SERIES[c.series].color + "22", color: SERIES[c.series].color }}>{SERIES[c.series].name}</span>}
          </div>
          <div>
            <div className="mb-1.5 text-[11px] text-muted-foreground uppercase">Why this ranking</div>
            <ul className="space-y-1">
              {p.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-xs"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] text-muted-foreground uppercase">Score breakdown</div>
            <div className="space-y-1.5">
              {p.factors.map((f) => (
                <div key={f.label} className="grid grid-cols-[1fr_80px_28px] items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">{f.label}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-primary" style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
                  <span className="text-right font-mono">{f.points}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => assign(c.id, "Det. K. Nguyen")}
              disabled={mine}
              className={cn("inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium", mine ? "bg-emerald-500/15 text-emerald-300" : "bg-primary text-primary-foreground hover:bg-primary/85")}
            >
              {mine ? <><Check className="size-3.5" /> Assigned to you</> : <><UserPlus className="size-3.5" /> Assign to me</>}
            </button>
            <Link href={`/cases/${c.id}#review`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs hover:bg-white/5">
              Review lead <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
