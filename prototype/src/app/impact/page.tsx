"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { ArrowRight, TrendingUp, TrendingDown, BadgeCheck, Users, Sparkles } from "lucide-react";
import { CLEARANCE_PROJECTION, IMPACT, LABOR_BREAKDOWN, SOLVED_SOURCES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { CHART, PageHeader, Panel, tooltipStyle } from "@/components/common";

export default function ImpactPage() {
  const { casesClearedInDemo, leadsApproved } = useStore();
  const current = (IMPACT.annualBurglaries * IMPACT.currentRate) / 100;
  const projected = current + IMPACT.additionalSolved;
  const hoursSaved = Math.round((IMPACT.hoursPerCaseBefore - IMPACT.hoursPerCaseAfter) * IMPACT.annualBurglaries);
  const solvedData = [
    { name: "Current", base: current, linking: 0, pawn: 0, priority: 0 },
    { name: "With CascadeAI", base: current, linking: SOLVED_SOURCES[0].cases, pawn: SOLVED_SOURCES[1].cases, priority: SOLVED_SOURCES[2].cases },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Step 7 · More cases solved"
        title="Executive Impact"
        description={`Projected annual impact of AI-assisted burglary investigation across ~${IMPACT.annualBurglaries.toLocaleString()} reported burglaries per year.`}
      />

      {/* Headline */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 to-card/70 p-5 glow-blue md:col-span-2">
          <div className="text-xs text-muted-foreground uppercase">Clearance rate</div>
          <div className="mt-3 flex items-end gap-5">
            <div>
              <div className="text-[11px] text-muted-foreground">Current</div>
              <div className="font-mono text-5xl font-semibold text-slate-300 tabular-nums">{IMPACT.currentRate}%</div>
            </div>
            <ArrowRight className="mb-3 size-8 text-primary" />
            <div>
              <div className="text-[11px] text-blue-200">Projected</div>
              <div className="font-mono text-5xl font-semibold text-white text-glow tabular-nums">{IMPACT.projectedRate}%</div>
            </div>
            <div className="mb-2 ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-sm text-emerald-300">
              <TrendingUp className="size-4" /> +{(((IMPACT.projectedRate - IMPACT.currentRate) / IMPACT.currentRate) * 100).toFixed(0)}% relative
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card/70 p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase">Additional solved <BadgeCheck className="size-4 text-emerald-400" /></div>
          <div className="mt-3 font-mono text-5xl font-semibold text-emerald-300 tabular-nums">+{IMPACT.additionalSolved}</div>
          <div className="mt-1 text-xs text-muted-foreground">burglaries per year ({current.toLocaleString()} &rarr; {projected.toLocaleString()})</div>
        </div>
        <div className="rounded-xl border bg-card/70 p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase">Labor per case <TrendingDown className="size-4 text-primary" /></div>
          <div className="mt-3 font-mono text-5xl font-semibold text-blue-200 tabular-nums">-{IMPACT.laborReduction}%</div>
          <div className="mt-1 text-xs text-muted-foreground">{IMPACT.hoursPerCaseBefore} &rarr; {IMPACT.hoursPerCaseAfter} hrs · ~{hoursSaved.toLocaleString()} hrs/yr freed</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Clearance rate projection" subtitle="Quarterly, with AI rollout in Q3 2026">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CLEARANCE_PROJECTION} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="q" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[11, 17]} unit="%" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine x="Q3 '26" stroke={CHART.cyan} strokeDasharray="4 4" label={{ value: "AI rollout", fill: CHART.cyan, fontSize: 11, position: "insideTopRight" }} />
                <Line dataKey="current" name="Without AI (trend)" stroke={CHART.slate} strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line dataKey="projected" name="With CascadeAI" stroke={CHART.blue} strokeWidth={3} dot={{ r: 4, fill: CHART.blue }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Burglaries solved per year" subtitle="Where the additional 300 clearances come from">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solvedData} margin={{ top: 20, right: 16, left: -4, bottom: 0 }} barSize={70}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="base" stackId="a" name="Baseline clearances" fill={CHART.slate} />
                <Bar dataKey="linking" stackId="a" name="Series linking" fill={CHART.blue} />
                <Bar dataKey="pawn" stackId="a" name="Pawn matches" fill={CHART.cyan} />
                <Bar dataKey="priority" stackId="a" name="Prioritization" fill={CHART.green} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="name" position="top" fill="#e2e8f0" fontSize={12} formatter={(n) => (n === "Current" ? current.toLocaleString() : projected.toLocaleString())} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Detective hours per case" subtitle={`Before vs. after AI (${IMPACT.hoursPerCaseBefore} → ${IMPACT.hoursPerCaseAfter} hrs)`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LABOR_BREAKDOWN} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="task" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis unit="h" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => `${v} hrs`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="before" name="Before" fill={CHART.slate} radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" name="With CascadeAI" fill={CHART.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sources of improvement" subtitle="Additional clearances per year, by AI capability">
          <div className="space-y-4 py-2">
            {SOLVED_SOURCES.map((s, i) => (
              <div key={s.source}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{s.source}</span>
                  <span className="font-mono text-lg" style={{ color: [CHART.blue, CHART.cyan, CHART.green][i] }}>+{s.cases}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(s.cases / IMPACT.additionalSolved) * 100}%`, background: [CHART.blue, CHART.cyan, CHART.green][i] }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.detail}</div>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-lg border bg-white/[0.02] p-3 text-sm">
              <Users className="size-5 text-primary" />
              <span>~{hoursSaved.toLocaleString()} hours/yr freed &asymp; <span className="font-semibold">{Math.round(hoursSaved / 2080)} full-time detectives</span> reassigned to active casework.</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/[0.06] p-4 md:flex-row md:items-center">
        <Sparkles className="size-5 shrink-0 text-emerald-300" />
        <div className="flex-1 text-sm">
          <span className="font-medium text-emerald-100">This demo session: </span>
          <span className="text-emerald-100/75">
            {leadsApproved} AI lead{leadsApproved === 1 ? "" : "s"} approved, {casesClearedInDemo} burglar{casesClearedInDemo === 1 ? "y" : "ies"} cleared.
            {casesClearedInDemo > 1 && ` One arrest closed ${casesClearedInDemo} reports, which is how series linking drives the projected gain.`}
            {casesClearedInDemo === 0 && " Approve the lead on Case #1044 and record an arrest to see linked cases clear together."}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Assumptions (illustrative): {IMPACT.annualBurglaries.toLocaleString()} burglaries/yr; baseline clearance {IMPACT.currentRate}%; projection based on pilot-unit performance. All figures are mock data for demonstration.
      </p>
    </div>
  );
}
