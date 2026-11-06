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
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Command Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Burglary Cases", icon: FolderSearch },
  { href: "/cases/1044", label: "AI Lead Generation", icon: BrainCircuit, match: (p: string) => /^\/cases\/\d+/.test(p) },
  { href: "/leadsonline", label: "LeadsOnline Matches", icon: Store },
  { href: "/queue", label: "Prioritization Queue", icon: ListOrdered },
  { href: "/map", label: "Geographic View", icon: Map },
  { href: "/impact", label: "Executive Impact", icon: TrendingUp },
];

export const STORY = [
  { n: 1, label: "Case enters system", href: "/cases" },
  { n: 2, label: "AI analyzes reports", href: "/cases/1044" },
  { n: 3, label: "AI links related cases", href: "/map" },
  { n: 4, label: "AI checks LeadsOnline", href: "/leadsonline" },
  { n: 5, label: "AI creates lead", href: "/queue" },
  { n: 6, label: "Detective reviews", href: "/cases/1044#review" },
  { n: 7, label: "More cases solved", href: "/impact" },
];

function currentStep(path: string) {
  if (path === "/cases") return 1;
  if (/^\/cases\/\d+/.test(path)) return 2;
  if (path === "/map") return 3;
  if (path === "/leadsonline") return 4;
  if (path === "/queue") return 5;
  if (path === "/impact") return 7;
  return 0;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { reset, activity } = useStore();
  const step = currentStep(path);
  const next = STORY.find((s) => s.n === (step === 2 ? 3 : step + 1));

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
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Investigations</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          <div className="px-2 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">Operations</div>
          {NAV.map((n) => {
            const active = n.match ? n.match(path) : path === n.href;
            return (
              <Link
                key={n.href}
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
          })}
        </nav>
        <div className="m-3 rounded-lg border bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            AI engine online
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Model v2.4 &middot; 2,184 reports indexed &middot; LeadsOnline sync 4 min ago</p>
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
            <div className="hidden h-8 max-w-md flex-1 items-center gap-2 rounded-lg border bg-card/60 px-3 text-sm text-muted-foreground md:flex">
              <Search className="size-4" />
              <span>Search cases, MO, items, plates&hellip;</span>
              <kbd className="ml-auto rounded border px-1.5 font-mono text-[10px]">/</kbd>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">North Precinct &middot; Burglary Unit</span>
              <div className="relative">
                <Bell className="size-4 text-muted-foreground" />
                {activity.length > 0 && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />}
              </div>
              <div className="grid size-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary ring-1 ring-primary/40">KN</div>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {NAV.map((n) => {
              const active = n.match ? n.match(path) : path === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("shrink-0 rounded-md px-2.5 py-1 text-xs", active ? "bg-primary/20 text-white" : "text-muted-foreground")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="bg-grid flex-1 px-4 pt-6 pb-28 md:px-6">{children}</main>

        {/* Story bar */}
        <div className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background/90 backdrop-blur-md lg:left-64">
          <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
            <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.18em] text-primary uppercase md:inline">Investigation flow</span>
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
            {next && step > 0 && step < 7 ? (
              <Link href={next.href} className="hidden shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85 sm:inline-flex">
                Next: {next.label} <ChevronRight className="size-3.5" />
              </Link>
            ) : step === 0 ? (
              <Link href="/cases" className="hidden shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85 sm:inline-flex">
                Start walkthrough <ChevronRight className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
