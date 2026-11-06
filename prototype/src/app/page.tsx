"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Globe,
  Images,
  ListOrdered,
  PackageCheck,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Laptop,
  Gem,
  Watch,
  Smartphone,
  Bike,
  Wrench,
  Camera,
  Plus,
  X,
  Undo2,
  FileDown,
  EyeOff,
  ExternalLink,
  Ban,
  Building2,
  Cloud,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Info,
} from "lucide-react";
import {
  CATALOG,
  CATEGORIES,
  DEMO_QUERY,
  REGIONS,
  RULES_VERSION,
  SOURCES,
  THRESHOLD,
  WEIGHTS,
  fmtDay,
  fmtStamp,
  guardModelField,
  runSearch,
  type Category,
  type ItemResult,
  type Query,
  type QueryItem,
  type Region,
  type Scored,
  type SearchResult,
} from "@/lib/listings";
import { useStore } from "@/lib/store";
import { PageHeader, Panel, ScoreRing } from "@/components/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CAT_ICON: Record<Category, typeof Laptop> = { Laptop, Jewelry: Gem, Watch, Phone: Smartphone, Bicycle: Bike, Tools: Wrench, Camera };
const GENERIC_COLORS = ["Silver", "Black", "Gold", "White", "Gray", "Blue", "Red", "Platinum", "Yellow gold", "White gold"];
const BLOCKING = new Set(["case-number", "address", "email", "phone", "person", "narrative"]);

type Phase = "form" | "running" | "done";

export default function LeadSearchPage() {
  const { nonce } = useStore();
  return <LeadSearch key={nonce} />;
}

function LeadSearch() {
  const store = useStore();
  const [phase, setPhase] = useState<Phase>(store.lastQuery ? "done" : "form");
  const [step, setStep] = useState(store.lastQuery ? STEP_COUNT : 0);
  const [draft, setDraft] = useState<Query>(() => store.lastQuery ?? { items: [blankItem("i1")], from: "2026-08-06", to: "2026-08-08", region: "Cascade City · North" });
  const result = useMemo(() => (store.lastQuery ? runSearch(store.lastQuery) : null), [store.lastQuery]);

  useEffect(() => {
    if (phase !== "running") return;
    if (step >= STEP_COUNT) {
      const t = setTimeout(() => setPhase("done"), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step >= 1 && step <= 3 ? 850 : 700);
    return () => clearTimeout(t);
  }, [phase, step]);

  const start = () => {
    const q: Query = { ...draft, items: draft.items.map((i) => ({ ...i })) };
    const r = runSearch(q);
    store.addAudit({
      action: "Search run",
      query: `${q.items.map((i) => `${i.category} · ${guardName(i)} · ${i.color}`).join(" | ")} · ${fmtDay(q.from)}–${fmtDay(q.to)} · ${q.region}`,
      result: `${r.totalLeads} lead${r.totalLeads === 1 ? "" : "s"} · ${r.items.filter((i) => i.outcome === "too-broad").length} too broad · ${r.items.filter((i) => i.outcome === "no-match").length} no match · ${SOURCES.length} sources (${SOURCES.filter((s) => s.status === "partial").length} partial)`,
    });
    store.setLastQuery(q);
    setStep(0);
    setPhase("running");
  };

  const newSearch = () => {
    store.setLastQuery(null);
    setPhase("form");
    setStep(0);
  };

  const lane = phase === "form" ? 0 : phase === "running" ? 1 : 2;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Phase 1 · pilot product · demo clock Sat, Aug 8 2026, 9:41 AM"
        title={<>First-48-Hour <span className="text-primary text-glow">Lead Search</span></>}
        description="The detective enters only the stolen items. CascadeAI searches public listings, compares listing photos with public product images, and returns sourced possible matches. It never sees case data, writes no text and learns nothing from users. A human decides."
      >
        {phase === "done" && (
          <Button variant="outline" size="lg" className="gap-1.5" onClick={newSearch}>
            <RotateCcw className="size-3.5" /> New search
          </Button>
        )}
      </PageHeader>

      <Swimlanes active={lane} />

      {phase === "form" && <QueryForm draft={draft} setDraft={setDraft} onSearch={start} />}
      {phase !== "form" && result && store.lastQuery && (
        <div className="grid gap-4 xl:grid-cols-12">
          <div className={cn("space-y-4", phase === "done" ? "xl:col-span-8" : "xl:col-span-7")}>
            {phase === "running" ? <QueryEcho q={store.lastQuery} /> : <LeadPackage result={result} q={store.lastQuery} />}
          </div>
          <div className={cn("space-y-4", phase === "done" ? "xl:col-span-4" : "xl:col-span-5")}>
            <AgentTrace step={step} result={result} q={store.lastQuery} compact={phase === "done"} />
            {phase === "done" && <Coverage result={result} />}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Why the property trail: stolen items resurface for sale, but nationally under 5% of stolen electronics value and about 2% of stolen jewelry value is recovered
        (FBI UCR data, as analyzed by ValuePenguin and Statista). All sources, listings, prices and people in this prototype are synthetic; sources use reserved .example domains.
      </p>
    </div>
  );
}

const blankItem = (key: string): QueryItem => ({ key, category: "Laptop", modelText: "", color: "" });
const guardName = (i: QueryItem) => {
  const g = guardModelField(i.modelText, i.category);
  return g.ok ? g.product.name : i.modelText;
};

// ---------------- Swimlanes (V6 flowchart) ----------------

function Swimlanes({ active }: { active: number }) {
  const lanes = [
    { icon: Building2, title: "Department systems (CJIS)", body: "The detective works the case in the records system, exactly as today. CascadeAI has no connection to it." },
    { icon: Cloud, title: "CascadeAI · AWS GovCloud", body: "Item descriptors in, public listings out. Fixed, logged retrieval steps. No case data, no generated text." },
    { icon: UserCheck, title: "Detective decides", body: "Verifies each lead against its public source, then exports it to the case file or sets it aside." },
  ];
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {lanes.map((l, i) => (
        <div
          key={l.title}
          className={cn(
            "relative rounded-xl border p-3 transition-all duration-500",
            i === active ? "border-primary/50 bg-primary/[0.08] glow-blue" : "bg-card/50 opacity-70",
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <l.icon className={cn("size-4", i === active ? "text-primary" : "text-muted-foreground")} />
            {l.title}
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">LANE {i + 1}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{l.body}</p>
          {i < 2 && <ArrowRight className="absolute top-1/2 -right-3 z-10 hidden size-4 -translate-y-1/2 text-muted-foreground md:block" />}
        </div>
      ))}
    </div>
  );
}

// ---------------- Query form with Query Guard ----------------

const fieldCls = "h-9 w-full rounded-lg border bg-background/60 px-2.5 text-sm outline-none focus:border-primary/60";

function QueryForm({ draft, setDraft, onSearch }: { draft: Query; setDraft: (q: Query) => void; onSearch: () => void }) {
  const store = useStore();
  const lastValid = useRef<Record<string, string>>({});
  const guards = draft.items.map((i) => guardModelField(i.modelText, i.category));
  const ready = draft.items.length > 0 && guards.every((g) => g.ok) && draft.items.every((i) => i.color) && draft.from <= draft.to;

  const update = (key: string, patch: Partial<QueryItem>) => {
    const items = draft.items.map((i) => (i.key === key ? { ...i, ...patch } : i));
    const before = draft.items.find((i) => i.key === key)!;
    const after = items.find((i) => i.key === key)!;
    const gBefore = guardModelField(before.modelText, before.category);
    const gAfter = guardModelField(after.modelText, after.category);
    if (gBefore.ok) lastValid.current[key] = before.modelText;
    if (gAfter.ok) lastValid.current[key] = after.modelText;
    const wasBlocked = !gBefore.ok && BLOCKING.has(gBefore.kind);
    // Log once per blocked attempt (not per keystroke). The blocked text itself is never stored.
    if (!wasBlocked && !gAfter.ok && BLOCKING.has(gAfter.kind)) {
      store.addAudit({ action: "Query blocked", query: `${after.category} model field rejected: ${gAfter.kind.replace("-", " ")} (blocked text is not stored)`, result: "Nothing searched" });
    }
    setDraft({ ...draft, items });
  };

  return (
    <Panel
      title={<span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-400" /> Items taken (structured fields only)</span>}
      subtitle="No case numbers, names, addresses or narratives. The Query Guard blocks them before anything leaves the form."
      action={
        <button onClick={() => setDraft({ ...DEMO_QUERY, items: DEMO_QUERY.items.map((i) => ({ ...i })) })} className="rounded-md border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground">
          Fill demo items
        </button>
      }
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[150px_1fr_170px_32px] gap-2 px-1 text-[11px] text-muted-foreground uppercase md:grid">
          <span>Category</span>
          <span>Brand &amp; model (public product catalog)</span>
          <span>Color</span>
          <span />
        </div>
        {draft.items.map((it, idx) => {
          const g = guards[idx];
          const blocked = !g.ok && BLOCKING.has(g.kind);
          const colors = g.ok ? g.product.colors : GENERIC_COLORS;
          const Icon = CAT_ICON[it.category];
          return (
            <div key={it.key} className="space-y-1.5">
              <div className="grid gap-2 md:grid-cols-[150px_1fr_170px_32px]">
                <div className="relative">
                  <Icon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select aria-label={`Item ${idx + 1} category`} value={it.category} onChange={(e) => update(it.key, { category: e.target.value as Category, modelText: "", color: "" })} className={cn(fieldCls, "pl-8")}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <input
                  aria-label={`Item ${idx + 1} brand and model`}
                  data-testid={`model-${idx}`}
                  list={`catalog-${it.key}`}
                  value={it.modelText}
                  placeholder="e.g. MacBook Pro 14"
                  onChange={(e) => update(it.key, { modelText: e.target.value })}
                  className={cn(fieldCls, blocked && "border-red-400/70 bg-red-500/10", g.ok && "border-emerald-400/40")}
                />
                <datalist id={`catalog-${it.key}`}>
                  {CATALOG.filter((p) => p.category === it.category).map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                <select aria-label={`Item ${idx + 1} color`} value={it.color} onChange={(e) => update(it.key, { color: e.target.value })} className={fieldCls}>
                  <option value="">Color…</option>
                  {colors.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <button
                  aria-label="Remove item"
                  onClick={() => setDraft({ ...draft, items: draft.items.filter((i) => i.key !== it.key) })}
                  disabled={draft.items.length === 1}
                  className="grid h-9 place-items-center rounded-lg border text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <X className="size-4" />
                </button>
              </div>
              {blocked && (
                <div className="fade-up flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100" role="alert">
                  <Ban className="mt-0.5 size-3.5 shrink-0 text-red-300" />
                  <span className="flex-1">
                    <span className="font-semibold">Blocked by Query Guard.</span> {g.reason} This attempt is logged; the blocked text is not stored.
                  </span>
                  <button onClick={() => update(it.key, { modelText: lastValid.current[it.key] ?? "" })} className="inline-flex items-center gap-1 rounded border border-red-300/40 px-2 py-0.5 text-red-100 hover:bg-red-500/20">
                    <Undo2 className="size-3" /> Undo
                  </button>
                </div>
              )}
              {!g.ok && g.kind === "unknown-product" && <p className="px-1 text-[11px] text-amber-200/80">{g.reason}</p>}
              {g.ok && <p className="px-1 text-[11px] text-emerald-300/80">✓ Catalog match: {g.product.name}{g.product.note ? ` · ${g.product.note}` : ""}</p>}
            </div>
          );
        })}

        {draft.items.length < 3 && (
          <button onClick={() => setDraft({ ...draft, items: [...draft.items, blankItem(`i${Date.now()}`)] })} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="size-3.5" /> Add item
          </button>
        )}

        <div className="grid gap-2 border-t pt-3 md:grid-cols-[1fr_1fr_1.4fr]">
          <label className="space-y-1 text-[11px] text-muted-foreground uppercase">
            Date window from
            <input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={fieldCls} />
          </label>
          <label className="space-y-1 text-[11px] text-muted-foreground uppercase">
            to
            <input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={fieldCls} />
          </label>
          <label className="space-y-1 text-[11px] text-muted-foreground uppercase">
            City / region (no addresses)
            <select value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value as Region })} className={fieldCls}>
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t pt-3 md:flex-row md:items-center">
          <p className="flex-1 text-xs text-muted-foreground">
            CascadeAI receives only these descriptors and your user ID (for the audit log). Ranking uses fixed rules {RULES_VERSION}; nothing you do changes it.
          </p>
          <Button size="lg" className="gap-1.5" disabled={!ready} onClick={onSearch}>
            <Search className="size-4" /> Search public sources
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function QueryEcho({ q }: { q: Query }) {
  return (
    <Panel title="Query sent to CascadeAI" subtitle="This is everything CascadeAI receives: item descriptors, date window, region, user ID.">
      <div className="space-y-2 font-mono text-xs">
        {q.items.map((i, n) => (
          <div key={i.key} className="rounded-md border bg-black/30 px-3 py-2">
            item[{n}] = {"{"} category: &quot;{i.category}&quot;, model: &quot;{guardName(i)}&quot;, color: &quot;{i.color}&quot; {"}"}
          </div>
        ))}
        <div className="rounded-md border bg-black/30 px-3 py-2">
          window = {q.from} → {q.to} · region = &quot;{q.region}&quot; · case_number = <span className="text-red-300">not accepted</span>
        </div>
      </div>
    </Panel>
  );
}

// ---------------- Agent trace (deterministic workflow) ----------------

const STEP_COUNT = 7;

type TraceStep = { icon: typeof Laptop; agent: string; tool: string; detail: string; warn?: boolean };

function traceSteps(r: SearchResult, q: Query): TraceStep[] {
  const partial = SOURCES.filter((s) => s.status === "partial").length;
  const tooBroad = r.items.filter((i) => i.outcome === "too-broad").length;
  const noMatch = r.items.filter((i) => i.outcome === "no-match").length;
  return [
    { icon: ShieldCheck, agent: "Query Guard", tool: "schema + pattern check", detail: `${q.items.length} items · structured fields only · 0 case numbers, names or addresses accepted` },
    ...SOURCES.map((s) => ({
      icon: Globe,
      agent: `Search · ${s.name}`,
      tool: `${s.domain} (read-only)`,
      detail: `${s.scanned} listings in window scanned → ${r.perSource[s.id]} candidates${s.status === "partial" ? " · PARTIAL: page 2 timed out" : ""}`,
      warn: s.status === "partial",
    })),
    { icon: Images, agent: "Photo Compare", tool: "off-the-shelf image model", detail: `${r.compared} listing photos vs. public product images · item appearance only · no face detection` },
    { icon: ListOrdered, agent: `Rank · fixed rules ${RULES_VERSION}`, tool: `threshold ${THRESHOLD}`, detail: `${r.totalLeads} leads · ${tooBroad} too broad · ${noMatch} no match · ${r.totalBelow} below threshold · ${r.totalExcluded} excluded (posted before window)` },
    { icon: PackageCheck, agent: "Package Builder", tool: "saved copies + timestamps", detail: `Links, saved photos, capture times, match factors · coverage report (${partial} partial source)` },
  ];
}

function AgentTrace({ step, result, q, compact }: { step: number; result: SearchResult; q: Query; compact: boolean }) {
  const steps = traceSteps(result, q);
  return (
    <Panel
      className={cn(!compact && "scanline relative overflow-hidden")}
      title={<span className="inline-flex items-center gap-2"><Search className="size-4 text-primary" /> Retrieval workflow</span>}
      subtitle="Five fixed steps; each has one job and one tool, and its inputs and outputs are logged. No generated text."
    >
      <ol className="space-y-2.5">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "idle";
          return (
            <li key={s.agent} className={cn("flex gap-3 transition-opacity", state === "idle" && "opacity-35")}>
              <div className="mt-0.5">
                {state === "done" ? (
                  s.warn ? <AlertTriangle className="size-4 text-amber-300" /> : <CheckCircle2 className="size-4 text-primary" />
                ) : state === "active" ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <s.icon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className={state === "active" ? "text-foreground" : "text-foreground/90"}>{s.agent}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{s.tool}</span>
                </div>
                {state === "done" && <div className={cn("fade-up text-xs", s.warn ? "text-amber-200/90" : "text-muted-foreground")}>{s.detail}</div>}
              </div>
            </li>
          );
        })}
      </ol>
      {!compact && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(Math.min(step, STEP_COUNT) / STEP_COUNT) * 100}%` }} />
        </div>
      )}
    </Panel>
  );
}

// ---------------- Lead package ----------------

function LeadPackage({ result, q }: { result: SearchResult; q: Query }) {
  return (
    <div className="space-y-4">
      <div className="fade-up flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-primary/30 bg-primary/[0.07] px-4 py-3 text-sm">
        <PackageCheck className="size-5 text-primary" />
        <span className="font-semibold">First-48-Hour Lead Package</span>
        <span className="text-muted-foreground">
          {fmtDay(q.from)} – {fmtDay(q.to)} · {q.region} · {result.totalLeads} possible matches across {q.items.length} items
        </span>
        <span className="ml-auto text-xs text-muted-foreground">Possible matches are resemblances, not proof.</span>
      </div>
      {result.items.map((ir, i) => (
        <ItemBlock key={ir.item.key} ir={ir} n={i + 1} delay={i * 140} />
      ))}
      <p className="text-[11px] text-muted-foreground">
        Fixed ranking rules {RULES_VERSION}: photo {WEIGHTS.visual * 100} · model text {WEIGHTS.model * 100} · color {WEIGHTS.color * 100} · date {WEIGHTS.date * 100} · region {WEIGHTS.region * 100} points; threshold {THRESHOLD}.
        Rules change only through reviewed, versioned releases, never because of detective actions.
      </p>
    </div>
  );
}

function ItemBlock({ ir, n, delay }: { ir: ItemResult; n: number; delay: number }) {
  const Icon = CAT_ICON[ir.item.category];
  const badge =
    ir.outcome === "leads"
      ? { text: `${ir.leads.length} possible match${ir.leads.length === 1 ? "" : "es"}`, cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" }
      : ir.outcome === "too-broad"
        ? { text: "Too broad to rank", cls: "bg-amber-500/15 text-amber-300 ring-amber-400/30" }
        : { text: "No match found", cls: "bg-slate-500/15 text-slate-300 ring-slate-400/25" };
  return (
    <section className="fade-up space-y-2" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-wrap items-center gap-2 px-1">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-semibold">
          Item {n}: {ir.product.name}
        </span>
        <span className="text-xs text-muted-foreground">· {ir.item.color}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", badge.cls)}>{badge.text}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {ir.candidates} candidates · {ir.below} below threshold (not shown)
          {ir.excluded ? ` · ${ir.excluded} excluded: posted before the date window` : ""}
        </span>
      </div>
      {ir.outcome === "leads" && ir.leads.map((s, i) => <LeadCard key={s.listing.id} s={s} hero={i === 0} />)}
      {ir.outcome === "too-broad" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[0.06] p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-300" />
          <p className="text-amber-50/90">
            <span className="font-semibold">Too broad to rank.</span> {ir.above} listings clear the threshold with near-identical scores ({ir.scoreRange?.[0]}–{ir.scoreRange?.[1]}).
            Common items look alike, so CascadeAI won&apos;t imply precision it doesn&apos;t have. Narrow the date window or add a distinguishing brand to rank.
          </p>
        </div>
      )}
      {ir.outcome === "no-match" && (
        <div className="flex items-start gap-3 rounded-xl border bg-white/[0.02] p-4 text-sm">
          <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">No match found</span> above the fixed threshold ({THRESHOLD}). {ir.below} candidates scored lower and are not shown.
            CascadeAI says so instead of guessing. Coverage: {SOURCES.length} sources searched, {SOURCES.filter((s) => s.status === "partial").length} partial (see coverage report).
          </p>
        </div>
      )}
    </section>
  );
}

function LeadCard({ s, hero }: { s: Scored; hero: boolean }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const status = store.leadStatus[s.listing.id];
  const Icon = CAT_ICON[s.listing.category];
  const url = `https://${s.source.domain}/l/${s.listing.id.toLowerCase()}`;
  const captured = `Aug 8, 2026, ${s.source.at.replace(/^0/, "")} AM`;
  return (
    <div
      data-testid={hero ? "hero-lead" : undefined}
      className={cn("rounded-xl border bg-card/70 p-4 transition-colors", hero && "border-primary/40", status === "set-aside" && "opacity-60")}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Photos */}
        <div className="flex shrink-0 gap-2">
          <PhotoTile icon={Icon} label="Listing photo" sub="saved copy · synthetic" />
          <PhotoTile icon={Icon} label="Public product image" sub="placeholder" muted />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="text-base font-semibold">&ldquo;{s.listing.title}&rdquo;</div>
            <div className="text-xs text-muted-foreground">
              {s.source.name} · {s.source.kind} · listing {s.listing.id}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>
              Posted <span className="text-foreground">{fmtStamp(s.listing.posted)}</span>{" "}
              <span className="text-primary">({s.daysAfterWindowOpened} day{s.daysAfterWindowOpened === 1 ? "" : "s"} after the window opened)</span>
            </span>
            <span>
              ~<span className="text-foreground">{s.listing.miFromCenter} mi</span> from search-region center
            </span>
            <span>
              Price <span className="font-mono text-foreground">${s.listing.price.toLocaleString("en-US")}</span>
            </span>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {s.factors.map((f) => (
                <tr key={f.key} className="border-t border-white/5">
                  <td className="py-1 pr-2 text-muted-foreground">{f.label}</td>
                  <td className="py-1 pr-2">{f.value}</td>
                  <td className="py-1 text-right font-mono text-muted-foreground">
                    +{f.points} / {WEIGHTS[f.key] * 100}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono">
              <ExternalLink className="size-3" /> {url}
            </span>
            <span>Saved copy captured {captured}</span>
          </div>
          {open && (
            <div className="fade-up rounded-lg border bg-black/30 p-3 text-xs text-muted-foreground">
              <div className="mb-1 font-medium text-foreground">Saved copy of the public listing (as captured)</div>
              Title, photo, price and posted time exactly as shown on {s.source.domain} at capture. Retained only as long as the audit policy requires. The seller&apos;s
              identity is not collected; CascadeAI builds no seller profiles. Any follow-up goes through normal legal process.
            </div>
          )}
        </div>

        {/* Score + actions */}
        <div className="flex shrink-0 flex-col items-center gap-2 lg:w-44">
          <ScoreRing score={s.score} size={hero ? 112 : 96} label="score" suffix="/100" />
          <span className="text-center text-[11px] text-muted-foreground">Match score · resemblance, not proof</span>
          {status ? (
            <div className="w-full space-y-1 text-center">
              <span className={cn("block rounded-md px-2 py-1 text-xs", status === "exported" ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/15 text-zinc-300")}>
                {status === "exported" ? "Exported to case file" : "Set aside"}
              </span>
              <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => store.setLeadStatus(s.listing.id, null)}>
                Undo
              </button>
            </div>
          ) : (
            <div className="grid w-full gap-1.5">
              <Button size="sm" className="gap-1" onClick={() => store.setLeadStatus(s.listing.id, "exported", s.score)}>
                <FileDown className="size-3.5" /> Export to case file
              </Button>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!open) store.addAudit({ action: "Saved copy opened", query: "—", result: `Lead ${s.listing.id} (score ${s.score})` });
                    setOpen(!open);
                  }}
                >
                  {open ? "Hide" : "Source"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => store.setLeadStatus(s.listing.id, "set-aside", s.score)}>
                  Set aside
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {status === "exported" && (
        <p className="fade-up mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/[0.06] px-3 py-2 text-xs text-emerald-100/90">
          Lead package exported. The detective attaches it to the case in the department&apos;s records system; CascadeAI keeps no link to the case.{" "}
          <Link href="/audit" className="underline">
            View audit log
          </Link>
        </p>
      )}
    </div>
  );
}

function PhotoTile({ icon: Icon, label, sub, muted }: { icon: typeof Laptop; label: string; sub: string; muted?: boolean }) {
  return (
    <div className={cn("grid h-28 w-28 place-items-center rounded-lg border text-center", muted ? "border-dashed bg-white/[0.02]" : "bg-gradient-to-br from-slate-700/40 to-slate-900/60")}>
      <div className="space-y-1 px-1">
        <Icon className={cn("mx-auto size-9", muted ? "text-muted-foreground" : "text-slate-200")} strokeWidth={1.25} />
        <div className="text-[10px] leading-tight text-foreground/80">{label}</div>
        <div className="text-[9px] leading-tight text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ---------------- Coverage ----------------

function Coverage({ result }: { result: SearchResult }) {
  return (
    <Panel title="Search coverage" subtitle="Which public sources were searched, and when, so gaps are visible.">
      <ul className="space-y-2.5">
        {SOURCES.map((s) => (
          <li key={s.id} className="text-xs">
            <div className="flex items-center gap-2">
              {s.status === "complete" ? <CheckCircle2 className="size-3.5 text-emerald-400" /> : <ShieldAlert className="size-3.5 text-amber-300" />}
              <span className="font-medium text-foreground">{s.name}</span>
              <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[10px] uppercase", s.status === "complete" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/15 text-amber-200")}>{s.status}</span>
            </div>
            <div className="mt-0.5 pl-5 text-muted-foreground">
              {s.domain} · searched 9:41 AM · {s.scanned} scanned · {result.perSource[s.id]} candidates
            </div>
            {s.gap && <div className="mt-0.5 pl-5 text-amber-200/80">{s.gap}</div>}
          </li>
        ))}
      </ul>
      <Link href="/audit" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full gap-1")}>
        Open audit log <ArrowRight className="size-3.5" />
      </Link>
    </Panel>
  );
}
