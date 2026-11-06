"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ChevronDown, ChevronUp, Search, Sparkles, Link2, Video, Fingerprint, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, ScoreBar, StatusBadge } from "@/components/common";
import { fmtDate, fmtTime, SERIES, STATUSES, type BurglaryCase } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type SortKey = "id" | "date" | "neighborhood" | "entry" | "solvability" | "status";

export default function CasesPage() {
  const { cases } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hood, setHood] = useState("All neighborhoods");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });

  const hoods = useMemo(() => ["All neighborhoods", ...Array.from(new Set(cases.map((c) => c.neighborhood))).sort()], [cases]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return cases
      .filter((c) => hood === "All neighborhoods" || c.neighborhood === hood)
      .filter((c) => status === "All statuses" || c.status === status)
      .filter(
        (c) =>
          !t ||
          String(c.id).includes(t) ||
          c.neighborhood.toLowerCase().includes(t) ||
          c.entry.toLowerCase().includes(t) ||
          c.items.some((i) => i.name.toLowerCase().includes(t)) ||
          (c.vehicle ?? "").toLowerCase().includes(t),
      )
      .sort((a, b) => {
        const av = a[sort.key] as string | number;
        const bv = b[sort.key] as string | number;
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
  }, [cases, q, hood, status, sort]);

  const toggle = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : key === "solvability" || key === "date" ? -1 : 1 }));

  const newCount = cases.filter((c) => c.status === "New").length;
  const linked = cases.filter((c) => c.series).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Step 1 · Case enters system"
        title="Burglary Cases"
        description="Every report from the records system is ingested within minutes. The AI reads the narrative, extracts the MO and scores solvability before a detective ever opens the file."
      >
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg border bg-card/60 px-3 py-1.5"><span className="font-mono text-foreground">{cases.length}</span> <span className="text-muted-foreground">cases</span></span>
          <span className="rounded-lg border bg-card/60 px-3 py-1.5"><span className="font-mono text-foreground">{newCount}</span> <span className="text-muted-foreground">new today/this week</span></span>
          <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-blue-200"><Link2 className="mr-1 inline size-3" /><span className="font-mono">{linked}</span> linked to a series</span>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, item, entry, vehicle…" className="h-9 pl-8" />
        </div>
        <Select value={hood} onValueChange={(v) => setHood(v ?? "All neighborhoods")}>
          <SelectTrigger className="h-9 min-w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {hoods.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "All statuses")}>
          <SelectTrigger className="h-9 min-w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All statuses", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground md:ml-auto">
          Showing {rows.length} of {cases.length} · click a row to open the AI lead
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card/70">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th sort={sort} onSort={toggle} k="id" className="pl-4">Case ID</Th>
              <Th sort={sort} onSort={toggle} k="date">Date</Th>
              <Th sort={sort} onSort={toggle} k="neighborhood">Neighborhood</Th>
              <Th sort={sort} onSort={toggle} k="entry">Entry Method</Th>
              <TableHead className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Stolen Items</TableHead>
              <Th sort={sort} onSort={toggle} k="solvability">AI Solvability</Th>
              <Th sort={sort} onSort={toggle} k="status">Status</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <Row key={c.id} c={c} onOpen={() => router.push(`/cases/${c.id}`)} />
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No cases match these filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Th({ k, children, className, sort, onSort }: { k: SortKey; children: React.ReactNode; className?: string; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void }) {
  return (
    <TableHead className={className}>
      <button onClick={() => onSort(k)} className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">
        {children}
        {sort.key === k ? sort.dir === 1 ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" /> : <ArrowDownUp className="size-3 opacity-40" />}
      </button>
    </TableHead>
  );
}

function Row({ c, onOpen }: { c: BurglaryCase; onOpen: () => void }) {
  return (
    <TableRow onClick={onOpen} className={cn("cursor-pointer", c.id === 1044 && "bg-primary/[0.06]")}>
      <TableCell className="pl-4">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-primary">#{c.id}</span>
          {c.series && <span title={SERIES[c.series].name} className="size-2 rounded-full" style={{ background: SERIES[c.series].color, boxShadow: `0 0 8px ${SERIES[c.series].color}` }} />}
          {c.id === 1044 && <Sparkles className="size-3.5 text-primary" />}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{fmtDate(c.date)}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{fmtTime(c.time)}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{c.neighborhood}</div>
        <div className="text-[11px] text-muted-foreground">{c.block}</div>
      </TableCell>
      <TableCell className="text-sm">{c.entry}</TableCell>
      <TableCell>
        <div className="flex max-w-xs flex-wrap gap-1">
          {c.items.map((i) => (
            <span key={i.name} className="rounded border bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-foreground/85">{i.name}</span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <ScoreBar score={c.solvability} />
        <div className="mt-1 flex gap-1.5 text-muted-foreground">
          {c.evidence.video && <Video className="size-3" aria-label="video" />}
          {c.evidence.prints && <Fingerprint className="size-3" aria-label="prints" />}
          {c.evidence.witness && <Eye className="size-3" aria-label="witness" />}
        </div>
      </TableCell>
      <TableCell><StatusBadge status={c.status} /></TableCell>
    </TableRow>
  );
}
