"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, XCircle, Scale, Construction, Clock, DollarSign, Percent, BadgeCheck, CalendarClock, TrendingUp } from "lucide-react";
import {
  BASELINE,
  BUILD_COSTS,
  BUILD_TOTAL,
  DATA_ACCESS_BREAK_EVEN,
  HOURS_PER_WEEK_FOR_CLEARANCE_ASK,
  HOURS_PER_WEEK_FOR_COST_ASK,
  RUN_COSTS,
  RUN_TOTAL,
  SCENARIO_ROWS,
  TEAM_INPUT_HOURS,
  YIELD_PER_HOUR,
  asksMet,
  clearanceRate,
  extraClearances,
  fmtPayback,
  grossSavings,
  hoursFreed,
  netSavings,
  paybackMonths,
  pct,
  pctOfBaseline,
  roi3yr,
  threeYearBenefit,
  threeYearCost,
  usd,
} from "@/lib/numbers";
import { CHART, PageHeader, Panel, tooltipStyle } from "@/components/common";
import { cn } from "@/lib/utils";

const fmtHours = (h: number) => h.toLocaleString("en-US", { maximumFractionDigits: 1 });

export default function ImpactPage() {
  const [h, setH] = useState(TEAM_INPUT_HOURS);
  const asks = asksMet(h);
  const curve = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const x = (i + 1) * 0.5;
        return { h: x, clearance: +(clearanceRate(x) * 100).toFixed(2), netCut: +(pctOfBaseline(x) * 100).toFixed(2) };
      }),
    [],
  );

  const tiles = [
    { label: "Detective hours freed / yr", value: fmtHours(hoursFreed(h)), sub: `${h} h ÷ ${40} h week × ${BASELINE.detectiveHours.toLocaleString()} h`, icon: Clock },
    { label: "Gross savings / yr", value: usd(grossSavings(h)), sub: `at $${BASELINE.detectiveRate}/h (capacity, not cash)`, icon: DollarSign },
    { label: "Net savings / yr", value: usd(netSavings(h)), sub: `${pct(pctOfBaseline(h))} of $3.05M · after ${usd(RUN_TOTAL)} run cost`, icon: Percent, accent: true },
    { label: "Clearance rate", value: pct(clearanceRate(h)), sub: `+${Math.round(extraClearances(h))} cases (upper-end estimate)`, icon: BadgeCheck, accent: true },
    { label: "Payback on the build", value: fmtPayback(paybackMonths(h)), sub: `${usd(BUILD_TOTAL)} build`, icon: CalendarClock },
    { label: "3-year ROI", value: pct(roi3yr(h), 0), sub: `${usd(threeYearBenefit(h))} benefit vs ${usd(threeYearCost)} cost`, icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Phase 1 · Proposal V6 numbers · every figure traces to CLAUDE.md"
        title="Impact: the honest math"
        description="At the team's input of 2.5 hours saved per detective per week, CascadeAI does not meet either of the Chief's asks. Move the slider to see what would have to be true. The randomized pilot measures the real number."
      />

      {/* Slider */}
      <Panel title={<span className="inline-flex items-center gap-2"><Scale className="size-4 text-primary" /> Hours saved per detective per 40-hour week</span>} subtitle="Team input is 2.5 h. The pilot's go/no-go rule: expand only if the measured saving reaches 2.5 h, net of verification time.">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="font-mono text-4xl font-semibold tabular-nums md:w-36">
            {h}
            <span className="text-base text-muted-foreground"> h/wk</span>
          </div>
          <div className="flex-1 space-y-2">
            <input aria-label="Hours saved per detective per week" type="range" min={0.5} max={20} step={0.25} value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full accent-[oklch(0.66_0.17_252)]" />
            <div className="flex flex-wrap gap-1.5">
              {SCENARIO_ROWS.map((r) => (
                <button key={r} onClick={() => setH(r)} className={cn("rounded-md border px-2 py-0.5 font-mono text-xs", r === h ? "border-primary bg-primary/20 text-white" : "text-muted-foreground hover:text-foreground")}>
                  {r}
                  {r === TEAM_INPUT_HOURS ? " (team input)" : ""}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5 md:w-72">
            <AskBadge met={asks.clearance} label={`Clearance +25% (to ${pct(BASELINE.clearanceAsk, 2)})`} />
            <AskBadge met={asks.cost} label={`Labor cost −15% net (${usd(BASELINE.netCutTarget)})`} />
          </div>
        </div>
      </Panel>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className={cn("rounded-xl border bg-card/70 p-4", t.accent && "border-primary/40")}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {t.label}
              <t.icon className="size-4 text-primary/80" />
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">{t.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="What would have to be true" subtitle={`Clearance ask needs ${HOURS_PER_WEEK_FOR_CLEARANCE_ASK} h/week; a 15% net cut needs ${HOURS_PER_WEEK_FOR_COST_ASK} h/week (45% of a detective's time).`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="h" type="number" domain={[0.5, 20]} ticks={[2.5, 5, 10, 15, 20]} unit="h" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[-2, 20]} ticks={[0, 5, 10, 15, 20]} unit="%" stroke={CHART.axis} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} labelFormatter={(v) => `${v} h saved / detective / week`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={16.25} stroke={CHART.green} strokeDasharray="4 4" label={{ value: "Clearance ask 16.25%", fill: CHART.green, fontSize: 10, position: "insideTopRight" }} />
                <ReferenceLine y={15} stroke={CHART.amber} strokeDasharray="4 4" label={{ value: "Cost ask 15% net", fill: CHART.amber, fontSize: 10, position: "insideBottomRight" }} />
                <ReferenceLine x={h} stroke={CHART.cyan} />
                <Line dataKey="clearance" name="Clearance rate" stroke={CHART.blue} strokeWidth={2.5} dot={false} />
                <Line dataKey="netCut" name="Net labor-cost cut" stroke={CHART.amber} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="mt-3 w-full text-xs">
            <thead className="text-[10px] text-muted-foreground uppercase">
              <tr className="text-left">
                <th className="py-1.5 pr-2 font-medium">h/wk</th>
                <th className="py-1.5 pr-2 font-medium">h freed/yr</th>
                <th className="py-1.5 pr-2 font-medium">Net/yr</th>
                <th className="py-1.5 pr-2 font-medium">Net %</th>
                <th className="py-1.5 pr-2 font-medium">Clearance</th>
                <th className="py-1.5 pr-2 font-medium">Payback</th>
                <th className="py-1.5 font-medium">Asks met</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {SCENARIO_ROWS.map((r) => (
                <tr key={r} onClick={() => setH(r)} className={cn("cursor-pointer border-t", r === h && "bg-primary/15", r === TEAM_INPUT_HOURS && "font-semibold")}>
                  <td className="py-1.5 pr-2">{r}{r === TEAM_INPUT_HOURS ? "*" : ""}</td>
                  <td className="py-1.5 pr-2">{Math.round(hoursFreed(r)).toLocaleString()}</td>
                  <td className="py-1.5 pr-2">{usd(netSavings(r))}</td>
                  <td className="py-1.5 pr-2">{pct(pctOfBaseline(r))}</td>
                  <td className="py-1.5 pr-2">{pct(clearanceRate(r))}</td>
                  <td className="py-1.5 pr-2">{fmtPayback(paybackMonths(r))}</td>
                  <td className="py-1.5">{asksMet(r).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-muted-foreground">* Team input. Same table as Proposal V6.</p>
        </Panel>

        <div className="space-y-4">
          <Panel title="Lean cost design" subtitle="Planning placeholders; the tech team confirms.">
            <div className="grid gap-4 md:grid-cols-2">
              <CostList title="Build (one time)" rows={BUILD_COSTS} total={BUILD_TOTAL} />
              <CostList title="Run (per year)" rows={RUN_COSTS} total={RUN_TOTAL} />
            </div>
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/[0.06] p-2.5 text-[11px] text-amber-100/90">
              Most fragile line: public-listing data access. At the team input, net savings reach $0 if data access costs ≥ {usd(DATA_ACCESS_BREAK_EVEN)}/yr.
              Authorized resale-data subscriptions range from about $3.3k/yr (small agency) to about $58k/yr (larger city).
            </p>
          </Panel>

          <Panel title="Clearance logic" subtitle="Two paths. Only the first is counted.">
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Path 1 (counted): time returned to detectives.</span> Freed hours earn the average yield of{" "}
                {BASELINE.cleared.toLocaleString()} ÷ {BASELINE.detectiveHours.toLocaleString()} = {YIELD_PER_HOUR.toFixed(3)} cleared cases per hour. That is an upper-end
                estimate: research since RAND (1975) finds extra investigative effort usually adds less than average.
              </li>
              <li>
                <span className="font-medium text-foreground">Path 2 (not counted): direct leads from matched listings.</span> There is no baseline for how often a public
                listing leads to a clearance, and a case is cleared only when someone is charged with that offense (FBI UCR). The pilot measures it and reports either way.
              </li>
            </ol>
          </Panel>

          <Panel title="Honest limits">
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Freed hours are capacity, not cash, unless the department avoids overtime or a new hire.</li>
              <li>Time saved must be net of the time detectives spend verifying leads; the pilot measures it that way.</li>
              <li>
                Claims need proof: a pre-registered RCT with 85 officers found an AI report-writing tool did not significantly reduce writing time, despite vendor claims
                (Adams et al., 2024). So our pilot is randomized too.
              </li>
              <li>Not counted: less tedious searching, faster answers for victims, and public trust from a case-data-free design.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[0.05] p-4 md:flex-row md:items-start">
        <Construction className="size-5 shrink-0 text-amber-300" />
        <div className="flex-1 space-y-1 text-sm">
          <div className="font-medium text-amber-100">Phase 2 concept (roadmap, not in these numbers): in-CJIS case linking</div>
          <p className="text-xs text-amber-100/75">
            Reaching the {HOURS_PER_WEEK_FOR_CLEARANCE_ASK} h/week row would take more than a property search. Linkage research points to the next lever: geographic and
            temporal proximity correctly classified 86% of burglary pairs vs 58% for MO alone (Markson et al., 2010), and statistical linkage reached AUC 0.90 for residential
            burglary (Tonkin et al., 2019). Linking needs case data, so it belongs inside the department&apos;s CJIS environment. It would come only after Phase 1 results, a
            separate CJIS approval, validation on solved series, and its own randomized pilot. It is not costed and adds nothing to the figures above.
          </p>
        </div>
        <Link href="/phase2" className="shrink-0 text-xs text-amber-200 underline">
          View concept screens
        </Link>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Sources: case brief (baseline, hypothetical data); Proposal V6 (team input, cost placeholders); Council on Criminal Justice (2024) burglary fact sheet (13% in 2022,
        23% in 1964); Adams et al. (2024) J. Experimental Criminology; Greenwood &amp; Petersilia, RAND R-1776 (1975); FBI UCR clearance definitions; Markson, Woodhams &amp; Bond
        (2010); Tonkin et al. (2019). LeadsOnline price range from public council agendas. Cascade City is fictional, and no figure here reflects a real department.
      </p>
    </div>
  );
}

function AskBadge({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs", met ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/[0.07] text-red-200")}>
      {met ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
      <span className="flex-1">{label}</span>
      <span className="font-semibold">{met ? "Met" : "Not met"}</span>
    </div>
  );
}

function CostList({ title, rows, total }: { title: string; rows: { item: string; amount: number }[]; total: number }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] text-muted-foreground uppercase">{title}</div>
      <ul className="space-y-1 text-xs">
        {rows.map((r) => (
          <li key={r.item} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{r.item}</span>
            <span className="font-mono">{usd(r.amount)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-2 border-t pt-1 font-medium">
          <span>Total</span>
          <span className="font-mono">{usd(total)}</span>
        </li>
      </ul>
    </div>
  );
}
