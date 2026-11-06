// Single source for every number shown in the UI. Mirrors CLAUDE.md → "Numbers" (Proposal V6).
// If a number changes, change CLAUDE.md first, then this file.

export const BASELINE = {
  burglaries: 10_000,
  clearanceRate: 0.13,
  cleared: 1_300,
  officerRate: 50,
  detectiveRate: 70,
  costPerCase: 305,
  annualCost: 3_050_000,
  detectiveHours: 15_000, // 90 min × 10,000 cases
  netCutTarget: 457_500, // 15% of $3.05M
  clearanceAsk: 0.1625, // 13% × 1.25
};

export const BUILD_COSTS = [
  { item: "Application and photo-comparison development", amount: 25_000 },
  { item: "Security and CJIS review and documentation", amount: 8_000 },
  { item: "Detective training and HR coordination", amount: 5_000 },
  { item: "Contingency", amount: 2_000 },
];

export const RUN_COSTS = [
  { item: "GovCloud hosting and storage", amount: 6_000 },
  { item: "Public-listing data access", amount: 4_000 },
  { item: "Maintenance, support and audits", amount: 5_000 },
];

export const BUILD_TOTAL = BUILD_COSTS.reduce((s, c) => s + c.amount, 0); // 40,000
export const RUN_TOTAL = RUN_COSTS.reduce((s, c) => s + c.amount, 0); // 15,000

export const TEAM_INPUT_HOURS = 2.5; // hours saved per detective per 40-hour week (team input)
export const WORK_WEEK = 40;
export const YIELD_PER_HOUR = BASELINE.cleared / BASELINE.detectiveHours; // ≈ 0.087 cleared per detective-hour

export const hoursFreed = (h: number) => BASELINE.detectiveHours * (h / WORK_WEEK);
export const grossSavings = (h: number) => hoursFreed(h) * BASELINE.detectiveRate;
export const netSavings = (h: number) => grossSavings(h) - RUN_TOTAL;
export const pctOfBaseline = (h: number) => netSavings(h) / BASELINE.annualCost;
export const extraClearances = (h: number) => hoursFreed(h) * YIELD_PER_HOUR;
export const clearanceRate = (h: number) => (BASELINE.cleared + extraClearances(h)) / BASELINE.burglaries;
export const paybackMonths = (h: number) => (netSavings(h) > 0 ? (BUILD_TOTAL / netSavings(h)) * 12 : Infinity);
export const threeYearBenefit = (h: number) => 3 * grossSavings(h);
export const threeYearCost = BUILD_TOTAL + 3 * RUN_TOTAL; // 85,000
export const roi3yr = (h: number) => (threeYearBenefit(h) - threeYearCost) / threeYearCost;

// Rounded to the precision V6 reports (16.25% shows as 16.3% and counts as meeting the ask).
export const asksMet = (h: number) => {
  const clearance = clearanceRate(h) >= BASELINE.clearanceAsk - 1e-9;
  const cost = netSavings(h) >= BASELINE.netCutTarget - 1e-6;
  return { clearance, cost, label: clearance && cost ? "Both" : clearance ? "Clearance" : cost ? "Cost" : "None" };
};

// Rows of V6's "What would have to be true" table.
export const SCENARIO_ROWS = [1.25, 2.5, 5, 10, 12.5, 18];

// Hours needed to close the clearance gap: (1,625 − 1,300) ÷ yield = 3,750 h = 10 h/detective/week.
export const HOURS_FOR_CLEARANCE_ASK = (BASELINE.burglaries * BASELINE.clearanceAsk - BASELINE.cleared) / YIELD_PER_HOUR;
export const HOURS_PER_WEEK_FOR_CLEARANCE_ASK = (HOURS_FOR_CLEARANCE_ASK / BASELINE.detectiveHours) * WORK_WEEK; // 10
export const HOURS_PER_WEEK_FOR_COST_ASK = 18; // V6: 18 h/week → $457,500 net

// Sensitivity (derived, Q&A only): data-access cost at which net savings reach $0 at the team input.
export const DATA_ACCESS_BREAK_EVEN =
  grossSavings(TEAM_INPUT_HOURS) - RUN_COSTS.filter((c) => c.item !== "Public-listing data access").reduce((s, c) => s + c.amount, 0); // 54,625

export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
export const fmtPayback = (months: number) =>
  !isFinite(months) ? "never" : months >= 12 ? `${(months / 12).toFixed(1)} years` : `${months.toFixed(1)} month${months.toFixed(1) === "1.0" ? "" : "s"}`;
