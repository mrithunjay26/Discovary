"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderSearch,
  BrainCircuit,
  Store,
  ListOrdered,
  Map,
  TrendingUp,
  Radar,
  RotateCcw,
  ChevronRight,
  ScanSearch,
  ScrollText,
  Construction,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { RULES_VERSION, SOURCES } from "@/lib/listings";

type NavItem = { href: string; label: string; icon: typeof Radar; match?: (p: string) => boolean };

const PILOT_NAV: NavItem[] = [
  { href: "/", label: "Lead Search", icon: ScanSearch },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
  { href: "/impact", label: "Impact (honest math)", icon: TrendingUp },
];

const PHASE2_NAV: NavItem[] = [
  { href: "/phase2", label: "Concept dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Burglary cases", icon: FolderSearch },
  { href: "/cases/1044", label: "Case linking", icon: BrainCircuit, match: (p) => /^\/cases\/\d+/.test(p) },
  { href: "/leadsonline", label: "Dealer records", icon: Store },
  { href: "/queue", label: "Prioritization", icon: ListOrdered },
  { href: "/map", label: "Geographic view", icon: Map },
];

const isPhase2 = (p: string) => /^\/(phase2|cases|leadsonline|queue|map)(\/|$)/.test(p);

export const STORY = [
  { n: 1, label: "Case enters system", href: "/cases" },
  { n: 2, label: "Links related reports", href: "/cases/1044" },
  { n: 3, label: "Series on the map", href: "/map" },
  { n: 4, label: "Dealer records", href: "/leadsonline" },
  { n: 5, label: "Ranked lead", href: "/queue" },
  { n: 6, label: "Detective reviews", href: "/cases/1044#review" },
];

function currentStep(path: string) {
  if (path === "/cases") return 1;
  if (/^\/cases\/\d+/.test(path)) return 2;
  if (path === "/map") return 3;
  if (path === "/leadsonline") return 4;
  if (path === "/queue") return 5;
  return 0;
}

function NavLink({ n, path }: { n: NavItem; path: string }) {
  const active = n.match ? n.match(path) : path === n.href;
  return (
    <Link
      href={n.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active ? "bg-sidebar-accent text-white ring-1 ring-primary/30" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white",
      )}
    >
      <n.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-primary/80")} />
      {n.label}
      {active && <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { reset } = useStore();
  const phase2 = isPhase2(path);
  const step = currentStep(path);
  const next = STORY.find((s) => s.n === step + 1);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/40 glow-blue">
            <Radar className="size-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">CascadeAI</div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">First-48-Hour Discovery</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          <div className="px-2 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-primary/80 uppercase">Pilot · Phase 1</div>
          {PILOT_NAV.map((n) => (
            <NavLink key={n.href} n={n} path={path} />
          ))}
          <div className="px-2 pt-5 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-amber-300/70 uppercase">Phase 2 concept · not in pilot</div>
          {PHASE2_NAV.map((n) => (
            <NavLink key={n.href} n={n} path={path} />
          ))}
        </nav>
        <div className="m-3 rounded-lg border bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            No case data in CascadeAI
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Fixed ranking rules {RULES_VERSION} &middot; {SOURCES.length} public sources (synthetic) &middot; AWS GovCloud (demo)
          </p>
          <button onClick={reset} className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            <RotateCcw className="size-3" /> Reset demo state
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 md:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Radar className="size-5 text-primary" />
              <span className="text-sm font-semibold">CascadeAI</span>
            </div>
            <span className="hidden rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200 md:inline">
              Prototype &middot; all data synthetic &middot; Cascade City is fictional
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">Burglary Unit &middot; Det. K. Nguyen (synthetic)</span>
              <div className="grid size-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary ring-1 ring-primary/40">KN</div>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {[...PILOT_NAV, ...PHASE2_NAV].map((n) => {
              const active = n.match ? n.match(path) : path === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("shrink-0 rounded-md px-2.5 py-1 text-xs", active ? "bg-primary/20 text-white" : "text-muted-foreground")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          {phase2 && (
            <div className="flex items-start gap-2 border-t border-amber-400/30 bg-amber-500/[0.08] px-4 py-2 text-xs text-amber-100 md:px-6">
              <Construction className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
              <span>
                <span className="font-semibold">Phase 2 concept: not part of the pilot.</span> In-CJIS case linking would run inside the department&apos;s own
                CJIS environment, only after Phase 1 results, a separate CJIS approval, validation on solved cases and its own randomized pilot. All data is
                synthetic and illustrative; no numbers here are projections.
              </span>
            </div>
          )}
        </header>

        <main className={cn("bg-grid flex-1 px-4 pt-6 md:px-6", phase2 ? "pb-28" : "pb-10")}>{children}</main>

        {/* Story bar: Phase 2 concept walkthrough only */}
        {phase2 && (
          <div className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background/90 backdrop-blur-md lg:left-64">
            <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
              <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.18em] text-amber-300 uppercase md:inline">Phase 2 concept flow</span>
              <ol className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                {STORY.map((s, i) => {
                  const done = step > 0 && s.n < step;
                  const active = s.n === step;
                  return (
                    <li key={s.n} className="flex shrink-0 items-center gap-1">
                      <Link
                        href={s.href}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
                          active ? "bg-primary text-primary-foreground shadow-[0_0_16px_-2px] shadow-primary" : done ? "bg-primary/15 text-blue-200" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                      >
                        <span className={cn("grid size-4 place-items-center rounded-full font-mono text-[10px]", active ? "bg-white/20" : "bg-white/5")}>{s.n}</span>
                        {s.label}
                      </Link>
                      {i < STORY.length - 1 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                    </li>
                  );
                })}
              </ol>
              {next && step > 0 ? (
                <Link href={next.href} className="hidden shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85 sm:inline-flex">
                  Next: {next.label} <ChevronRight className="size-3.5" />
                </Link>
              ) : step === 0 ? (
                <Link href="/cases" className="hidden shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85 sm:inline-flex">
                  Start concept walkthrough <ChevronRight className="size-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
