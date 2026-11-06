"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, Laptop, Watch, Gem, Bike, Wrench, Gamepad2, RefreshCw, ShieldAlert, Lock, Check, X, UserRound, ArrowRight } from "lucide-react";
import { PAWN_MATCHES, fmtDate, getCase, linkedCases, money, type MatchStatus, type PawnMatch } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PageHeader, Panel, ScoreBar, ScoreRing } from "@/components/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON: Record<string, typeof Laptop> = {
  "MacBook Pro": Laptop,
  "MacBook Air": Laptop,
  "Apple Watch": Watch,
  "Jewelry Item": Gem,
  "E-bike": Bike,
  "Tool set": Wrench,
  "Game console": Gamepad2,
};

const STATUS_STYLE: Record<MatchStatus, string> = {
  New: "text-slate-300 bg-slate-500/15",
  "Hold Requested": "text-amber-300 bg-amber-500/15",
  Confirmed: "text-emerald-300 bg-emerald-500/15",
  Dismissed: "text-zinc-400 bg-zinc-500/15 line-through",
};

export default function Page() {
  return (
    <Suspense>
      <LeadsOnline />
    </Suspense>
  );
}

function LeadsOnline() {
  const params = useSearchParams();
  const caseParam = Number(params.get("case")) || 1044;
  const focus = getCase(caseParam) ?? getCase(1044)!;
  const focusIds = new Set([focus.id, ...linkedCases(focus).map((c) => c.id)]);
  const featured = PAWN_MATCHES.filter((m) => focusIds.has(m.caseId)).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  const [filter, setFilter] = useState<"all" | "high">("all");
  const [syncing, setSyncing] = useState(false);
  const all = PAWN_MATCHES.filter((m) => filter === "all" || m.confidence >= 75).sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Step 4 · AI checks LeadsOnline"
        title="Possible Property Matches"
        description="Stolen items from linked cases are automatically compared against pawn and second-hand dealer transactions. Detectives see only matches worth a phone call."
      >
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5"
          onClick={() => {
            setSyncing(true);
            setTimeout(() => setSyncing(false), 1600);
          }}
        >
          <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} /> {syncing ? "Syncing…" : "Sync now"}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card/70 px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2 font-medium text-emerald-300"><span className="size-2 rounded-full bg-emerald-400" /> LeadsOnline connected (mock)</span>
        <span className="text-muted-foreground"><span className="font-mono text-foreground">1,248</span> transactions scanned (24h)</span>
        <span className="text-muted-foreground"><span className="font-mono text-foreground">14</span> dealers in jurisdiction</span>
        <span className="text-muted-foreground"><span className="font-mono text-foreground">{PAWN_MATCHES.length}</span> active matches</span>
        <span className="text-muted-foreground">Last sync: <span className="text-foreground">{syncing ? "now" : "4 min ago"}</span></span>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          Top matches for <Link href={`/cases/${focus.id}`} className="font-mono text-primary hover:underline">Case #{focus.id}</Link>
          <span className="text-muted-foreground"> and {focusIds.size - 1} linked cases</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {featured.map((m, i) => (
          <MatchCard key={m.id} m={m} delay={i * 120} />
        ))}
        {!featured.length && <p className="text-sm text-muted-foreground">No property matches for this case yet.</p>}
      </div>

      {focus.series === "A" && (
        <div className="fade-up flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-4 md:flex-row md:items-center">
          <ShieldAlert className="size-6 shrink-0 text-amber-300" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-amber-100">Seller network detected</div>
            <div className="text-amber-100/70">The same seller ID appears on LO-88213 (MacBook Pro) and LO-88107 (Apple Watch), and is registered to a silver 2010 Honda Civic. Partial plate &ldquo;BXK&rdquo; matches doorbell footage from Case #1157.</div>
          </div>
          <Link href="/queue" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>Create lead <ArrowRight className="size-3.5" /></Link>
        </div>
      )}

      <Panel
        title="All active matches"
        subtitle="Across every open burglary case"
        action={
          <div className="flex gap-1 rounded-lg bg-muted p-0.5 text-xs">
            {(["all", "high"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-2.5 py-1", filter === f ? "bg-background text-foreground" : "text-muted-foreground")}>
                {f === "all" ? "All" : "≥ 75% confidence"}
              </button>
            ))}
          </div>
        }
      >
        <MatchTable rows={all} />
      </Panel>
    </div>
  );
}

function useMatch(id: string) {
  const { matchStatus, setMatch } = useStore();
  return [matchStatus[id] ?? "New", (s: MatchStatus) => setMatch(id, s)] as const;
}

function MatchCard({ m, delay }: { m: PawnMatch; delay: number }) {
  const [status, set] = useMatch(m.id);
  const Icon = ICON[m.item] ?? Store;
  const reported = getCase(m.caseId)!.items.find((i) => i.name === m.reportedItem);
  return (
    <div className="fade-up flex flex-col rounded-xl border bg-card/70 p-4 transition-colors hover:border-primary/40" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-3">
        <div className="grid size-11 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold">{m.item}</div>
          <div className="text-xs text-muted-foreground">Reported: {m.reportedItem} · <Link href={`/cases/${m.caseId}`} className="text-primary hover:underline">#{m.caseId}</Link></div>
        </div>
        <ScoreRing score={m.confidence} size={76} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[11px] text-muted-foreground uppercase">Pawn shop</dt>
          <dd className="font-medium">{m.shop}</dd>
          <dd className="text-xs text-muted-foreground">{m.shopArea}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground uppercase">Date listed</dt>
          <dd className="font-medium">{fmtDate(m.dateListed)}</dd>
          <dd className="text-xs text-muted-foreground">Ticket {m.id}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground uppercase">Listed price</dt>
          <dd className="font-mono">{money(m.price)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground uppercase">Reported value</dt>
          <dd className="font-mono">{reported ? money(reported.value) : "-"}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-1.5">
        <div className="text-[11px] text-muted-foreground uppercase">Why it matched</div>
        {m.basis.map((b) => (
          <div key={b} className="flex items-start gap-2 text-xs"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{b}</div>
        ))}
        <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground"><UserRound className="mt-0.5 size-3.5 shrink-0" />{m.sellerNote}</div>
      </div>

      <div className="mt-auto pt-4">
        {status === "New" ? (
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" className="col-span-2 gap-1" onClick={() => set("Hold Requested")}><Lock className="size-3.5" /> Request hold</Button>
            <Button size="sm" variant="outline" onClick={() => set("Dismissed")}>Dismiss</Button>
          </div>
        ) : status === "Hold Requested" ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 rounded-md bg-amber-500/10 px-2 py-1.5 text-center text-xs text-amber-200">30-day hold requested · dealer notified</div>
            <Button size="sm" className="col-span-2 gap-1 bg-emerald-600 text-white hover:bg-emerald-600/85" onClick={() => set("Confirmed")}><Check className="size-3.5" /> Victim confirmed</Button>
            <Button size="sm" variant="outline" onClick={() => set("New")}>Undo</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className={cn("rounded px-2 py-1 text-xs", STATUS_STYLE[status])}>{status === "Confirmed" ? "Property identified by victim" : "Dismissed"}</span>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => set("New")}>Undo</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchTable({ rows }: { rows: PawnMatch[] }) {
  const { matchStatus, setMatch } = useStore();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] text-muted-foreground uppercase">
          <tr className="text-left">
            <th className="py-2 pr-3 font-medium">Ticket</th>
            <th className="py-2 pr-3 font-medium">Item</th>
            <th className="py-2 pr-3 font-medium">Case</th>
            <th className="py-2 pr-3 font-medium">Pawn shop</th>
            <th className="py-2 pr-3 font-medium">Date listed</th>
            <th className="py-2 pr-3 font-medium">Confidence</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const st = matchStatus[m.id] ?? "New";
            return (
              <tr key={m.id} className="border-t hover:bg-white/[0.02]">
                <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                <td className="py-2.5 pr-3">{m.reportedItem}</td>
                <td className="py-2.5 pr-3"><Link href={`/cases/${m.caseId}`} className="font-mono text-primary hover:underline">#{m.caseId}</Link></td>
                <td className="py-2.5 pr-3">{m.shop}<div className="text-[11px] text-muted-foreground">{m.shopArea}</div></td>
                <td className="py-2.5 pr-3">{fmtDate(m.dateListed)}</td>
                <td className="py-2.5 pr-3"><ScoreBar score={m.confidence} /></td>
                <td className="py-2.5 pr-3"><span className={cn("rounded px-2 py-0.5 text-xs", STATUS_STYLE[st])}>{st}</span></td>
                <td className="py-2.5 text-right">
                  {st === "New" && (
                    <button onClick={() => setMatch(m.id, "Hold Requested")} className="text-xs text-primary hover:underline">Request hold</button>
                  )}
                  {st !== "New" && <button onClick={() => setMatch(m.id, "New")} className="text-xs text-muted-foreground hover:text-foreground"><X className="inline size-3" /> Reset</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
