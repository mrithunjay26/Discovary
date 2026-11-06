// Drives the 75-second demo path (docs/demo-script.md), checks every number and outcome,
// and saves screenshots. With --video it also records a silent 1920×1080 video for the deck.
//
// Usage (app must be running, e.g. `npm run build && npm run start`):
//   node scripts/record-demo.mjs                 # verify + screenshots → demo-output/
//   node scripts/record-demo.mjs --video         # also record demo-output/*.webm (paced for voiceover)
//   BASE_URL=http://localhost:3000 OUT=/tmp/out node scripts/record-demo.mjs
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve(process.env.OUT ?? "demo-output");
const VIDEO = process.argv.includes("--video");
const pause = (ms) => new Promise((r) => setTimeout(r, VIDEO ? ms : Math.min(ms, 250)));
mkdirSync(OUT, { recursive: true });

const failures = [];
const expect = async (page, text, where = "page") => {
  const ok = await page.getByText(text, { exact: false }).first().isVisible().catch(() => false);
  console.log(`${ok ? "✓" : "✗"} ${where}: "${text}"`);
  if (!ok) failures.push(`${where}: ${text}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: VIDEO ? 1 : 2,
  ...(VIDEO ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}),
});
const page = await context.newPage();
if (VIDEO) {
  await page.addInitScript(() => {
    addEventListener("DOMContentLoaded", () => {
      const dot = document.createElement("div");
      dot.style.cssText = "position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #fff;background:rgba(59,130,246,.45);pointer-events:none;transition:left .35s ease,top .35s ease,transform .15s;left:-50px;top:-50px";
      document.body.appendChild(dot);
      addEventListener("mousemove", (e) => { dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px"; }, true);
      addEventListener("mousedown", () => (dot.style.transform = "scale(.6)"), true);
      addEventListener("mouseup", () => (dot.style.transform = "scale(1)"), true);
    });
  });
}
const scrollBy = (y) => page.evaluate((dy) => window.scrollBy({ top: dy, behavior: "smooth" }), y);
let n = 0;
const shot = async (name, fullPage = false) => page.screenshot({ path: path.join(OUT, `${String(++n).padStart(2, "0")}-${name}.png`), fullPage });

// 0:00 Lead Search
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await expect(page, "First-48-Hour", "search");
await shot("lead-search");
await page.mouse.move(700, 280);
await pause(7500);

// 0:08 Detective enters items only
await page.getByText("Fill demo items").click();
await pause(9500);
await shot("items-entered");

// 0:18 Query Guard blocks a case number
const model = page.getByTestId("model-0");
await model.fill("");
await model.pressSequentially("Case 1044", { delay: VIDEO ? 110 : 5 });
const guardAlert = page.getByRole("alert").filter({ hasText: "Blocked by Query Guard" });
await guardAlert.waitFor();
await expect(page, "Blocked by Query Guard", "guard");
await pause(4500);
await shot("guard-blocked");
await guardAlert.getByText("Undo").click();
await pause(1500);

// 0:26 Retrieval workflow
await page.getByRole("button", { name: "Search public sources" }).click();
await pause(2600);
await shot("workflow-running");
await page.getByTestId("hero-lead").waitFor({ timeout: 20000 });
await pause(7500);

// 0:42 Lead package
await expect(page, "First-48-Hour Lead Package", "package");
const hero = page.getByTestId("hero-lead");
const heroText = await hero.innerText();
const heroOk = /87\s*\/100/.test(heroText) && heroText.includes("2 days after") && heroText.includes("1.2 mi");
console.log(`${heroOk ? "✓" : "✗"} hero lead: 87/100, 2 days after, 1.2 mi`);
if (!heroOk) failures.push("hero lead content");
await expect(page, "Too broad to rank", "package");
await expect(page, "No match found", "package");
await expect(page, "Page 2 of 2 timed out", "coverage");
await hero.hover();
await shot("lead-package");
await shot("lead-package-full", true);
if (VIDEO) {
  await pause(5500);
  await scrollBy(760);
  await pause(6500);
  await scrollBy(-760);
  await pause(2500);
}

// 0:58 Detective decides → audit log
await hero.getByRole("button", { name: "Export to case file" }).click();
await pause(2500);
await shot("lead-exported");
await page.getByRole("link", { name: "View audit log" }).click();
await page.waitForURL("**/audit");
await expect(page, "Lead exported to case file", "audit");
await expect(page, "Query blocked", "audit");
await expect(page, "Search run", "audit");
await pause(5000);
await shot("audit-log");

// 1:06 Honest impact
await page.getByRole("link", { name: "Impact (honest math)" }).first().click();
await page.waitForURL("**/impact");
for (const t of ["937.5", "$65,625", "$50,625", "1.7% of $3.05M", "13.8%", "9.5 months", "132%", "Not met"]) await expect(page, t, "impact @2.5h");
await pause(9000);
await shot("impact-team-input");
if (!VIDEO) {
  await page.getByRole("button", { name: "10", exact: true }).click();
  await expect(page, "16.3%", "impact @10h");
  await shot("impact-10h");
  await page.getByRole("button", { name: "18", exact: true }).click();
  for (const t of ["15.0% of $3.05M", "18.9%", "$457,500"]) await expect(page, t, "impact @18h");
  await shot("impact-18h");

  // Phase 2 concept screens carry the banner
  await page.goto(BASE + "/phase2", { waitUntil: "networkidle" });
  await expect(page, "Phase 2 concept: not part of the pilot", "phase2");
  await shot("phase2-dashboard");
  await page.goto(BASE + "/cases/1044", { waitUntil: "networkidle" });
  await page.getByText("AI Findings").waitFor({ timeout: 15000 });
  await expect(page, "Phase 2 concept: not part of the pilot", "phase2 case");
  await shot("phase2-case-1044");
}

await context.close();
await browser.close();

if (VIDEO) {
  const webm = readdirSync(OUT).filter((f) => f.endsWith(".webm")).map((f) => path.join(OUT, f));
  const latest = webm.sort().at(-1);
  if (latest) renameSync(latest, path.join(OUT, "cascadeai-demo.webm"));
  console.log("video:", path.join(OUT, "cascadeai-demo.webm"));
}
console.log(failures.length ? `\n${failures.length} check(s) FAILED:\n- ${failures.join("\n- ")}` : `\nAll checks passed. Output: ${OUT}`);
process.exit(failures.length ? 1 : 0);
