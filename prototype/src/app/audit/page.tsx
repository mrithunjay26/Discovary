"use client";

import { ScrollText, ShieldCheck, Ban, Search, FileDown, EyeOff, Eye } from "lucide-react";
import { SEEDED_AUDIT, useStore, type AuditAction } from "@/lib/store";
import { PageHeader, Panel } from "@/components/common";
import { cn } from "@/lib/utils";

const ACTION_STYLE: Record<AuditAction, { icon: typeof Search; cls: string }> = {
  "Search run": { icon: Search, cls: "text-blue-300 bg-blue-500/10" },
  "Query blocked": { icon: Ban, cls: "text-red-300 bg-red-500/10" },
  "Saved copy opened": { icon: Eye, cls: "text-slate-300 bg-slate-500/10" },
  "Lead exported to case file": { icon: FileDown, cls: "text-emerald-300 bg-emerald-500/10" },
  "Lead set aside": { icon: EyeOff, cls: "text-zinc-300 bg-zinc-500/10" },
};

export default function AuditPage() {
  const { audit } = useStore();
  const rows = [...audit, ...SEEDED_AUDIT];
  const searches = rows.filter((r) => r.action === "Search run").length;
  const blocked = rows.filter((r) => r.action === "Query blocked").length;
  const exported = rows.filter((r) => r.action === "Lead exported to case file").length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Phase 1 · pilot product · every query and result is logged"
        title="Audit Log"
        description="Who searched, for what items, which sources answered, what came back, and what the detective did. These logs, not user ratings, are the pilot's adoption measure. They are reviewed quarterly and reported to the Council's public safety committee."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Searches run" value={searches} />
        <Stat label="Queries blocked by guard" value={blocked} tone="text-red-300" />
        <Stat label="Leads exported to case files" value={exported} tone="text-emerald-300" />
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/[0.06] p-4 text-xs text-emerald-100/90">
          <ShieldCheck className="size-5 shrink-0 text-emerald-300" />
          Audit rows never contain case numbers, names, addresses or narratives, because the form cannot accept them.
        </div>
      </div>

      <Panel title={<span className="inline-flex items-center gap-2"><ScrollText className="size-4 text-primary" /> Activity</span>} subtitle="Newest first. Entries from this session appear at the top; older rows are synthetic examples.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-muted-foreground uppercase">
              <tr className="text-left">
                <th className="py-2 pr-3 font-medium">Time</th>
                <th className="py-2 pr-3 font-medium">User</th>
                <th className="py-2 pr-3 font-medium">Action</th>
                <th className="py-2 pr-3 font-medium">Query (descriptors only)</th>
                <th className="py-2 pr-3 font-medium">Result</th>
                <th className="py-2 font-medium">Rules</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = ACTION_STYLE[r.action];
                return (
                  <tr key={r.id} className={cn("border-t align-top", r.id > 0 && "bg-primary/[0.04]")}>
                    <td className="py-2.5 pr-3 font-mono text-xs whitespace-nowrap text-muted-foreground">{r.at}</td>
                    <td className="py-2.5 pr-3 text-xs whitespace-nowrap">{r.user}</td>
                    <td className="py-2.5 pr-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs whitespace-nowrap", st.cls)}>
                        <st.icon className="size-3" /> {r.action}
                      </span>
                    </td>
                    <td className="max-w-md py-2.5 pr-3 text-xs text-foreground/85">{r.query}</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{r.result}</td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{r.rules}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="What the logs prove">
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>Adoption: searches run and leads opened per detective (pilot supporting measure).</li>
            <li>Guard effectiveness: blocked attempts, without storing the blocked text.</li>
            <li>Coverage: which sources answered, and which were partial.</li>
          </ul>
        </Panel>
        <Panel title="What they don't do">
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>No ratings or feedback are collected, and no action changes ranking.</li>
            <li>No seller profiles. A listing never identifies a suspect.</li>
            <li>Time saved is measured with independent timing logs in the randomized pilot, not from this log.</li>
          </ul>
        </Panel>
        <Panel title="Quarterly review">
          <p className="text-xs text-muted-foreground">
            The department&apos;s security staff and the Council&apos;s public safety committee review the logs every quarter, including a check of whether follow-ups
            concentrate unevenly by area.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card/70 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums", tone)}>{value}</div>
    </div>
  );
}
