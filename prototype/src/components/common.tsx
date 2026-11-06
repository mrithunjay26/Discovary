import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/data";

const STATUS_STYLE: Record<Status, string> = {
  New: "bg-slate-500/15 text-slate-300 ring-slate-400/25",
  "AI Analyzed": "bg-indigo-500/15 text-indigo-300 ring-indigo-400/25",
  "Lead Generated": "bg-blue-500/15 text-blue-300 ring-blue-400/30",
  "Under Review": "bg-amber-500/15 text-amber-300 ring-amber-400/25",
  "Lead Approved": "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
  Cleared: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Inactive: "bg-zinc-600/20 text-zinc-400 ring-zinc-500/20",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", STATUS_STYLE[status], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

export function scoreTone(score: number) {
  if (score >= 70) return { text: "text-emerald-300", bar: "bg-emerald-400", ring: "#34d399" };
  if (score >= 45) return { text: "text-blue-300", bar: "bg-blue-400", ring: "#60a5fa" };
  if (score >= 30) return { text: "text-amber-300", bar: "bg-amber-400", ring: "#fbbf24" };
  return { text: "text-slate-400", bar: "bg-slate-500", ring: "#64748b" };
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const t = scoreTone(score);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("w-7 text-right font-mono text-xs tabular-nums", t.text)}>{score}</span>
    </div>
  );
}

export function ScoreRing({ score, size = 112, label }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const t = scoreTone(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.07)" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.ring}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 6px ${t.ring}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums">{score}%</span>
        {label && <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</span>}
      </div>
    </div>
  );
}

const PRIORITY_STYLE: Record<Priority, string> = {
  High: "bg-red-500/15 text-red-300 ring-red-400/30",
  Medium: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Low: "bg-slate-500/15 text-slate-300 ring-slate-400/25",
};

export function PriorityBadge({ p }: { p: Priority }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", PRIORITY_STYLE[p])}>
      {p}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        {eyebrow && <div className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ className, children, title, action, subtitle }: { className?: string; children: React.ReactNode; title?: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-xl border bg-card/70 backdrop-blur-sm", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export const CHART = {
  blue: "#3b82f6",
  blueSoft: "#60a5fa",
  cyan: "#22d3ee",
  slate: "#64748b",
  amber: "#f59e0b",
  green: "#34d399",
  red: "#f87171",
  grid: "rgba(148,163,184,0.10)",
  axis: "#8b9bb4",
};

export const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.2 0.03 258)",
    border: "1px solid rgba(148,163,184,.2)",
    borderRadius: 8,
    fontSize: 12,
    color: "#e2e8f0",
  },
  labelStyle: { color: "#94a3b8" },
  itemStyle: { color: "#e2e8f0" },
  cursor: { fill: "rgba(59,130,246,.08)" },
};
