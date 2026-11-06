# CascadeAI Proposal V6 (team document, markdown copy)

> Converted from `CascadeAI_Proposal_V6.docx` (Nov 6, 2026). This is the current team proposal and the source of truth for the pitch. Numbers are mirrored in `CLAUDE.md` → Numbers. The appendix flowchart is a swimlane diagram: (1) the detective self-reports items inside department systems → (2) public-data search inside AWS GovCloud → (3) the detective's review and decision.

# CascadeAI: First-48-Hour Evidence Discovery Platform

**AWS GovCloud-Hosted Public-Photo Search for Burglary Follow-Up**

*Cracking the Burglary Backlog | Group 5 | Recommendation to the Chief of Police and the City Council Public Safety Committee*

## Executive Summary

Cascade City clears about 13% of its 10,000 annual burglaries, matching the national rate for 2022 (Council on Criminal Justice, 2024). The binding constraint is Stage 6, Detective Follow-Up: detectives are scarce, and each case takes about 90 minutes of detective analysis.

CascadeAI is a detective-initiated search tool:
1. The detective self-reports a few structured details about the items taken in a burglary.
2. CascadeAI searches public online listings and compares the public photographs in those listings with public product images.
3. It returns a First-48-Hour Lead Package of possible matches, each linked to its public source.

The key design decision is security. CascadeAI never connects to, stores, or searches Cascade City's case data. Police data stays in the department's own CJIS-compliant systems. The tool works only from the minimal query the detective types and from public information.

CascadeAI is retrieval-only. It writes no text, makes no guesses, and does not change its behavior based on what users do, so it cannot invent a lead. It does not identify suspects, establish probable cause, recommend arrests, or determine guilt. A human makes every decision.

### Honest bottom line

- **Savings.** The team's input is 2.5 detective-hours saved per detective per 40-hour week, at $70 per hour. On that basis CascadeAI frees about 940 detective hours a year: $65,625 gross and $50,625 net of a $15,000 running cost, or 1.7% of the $3.05M baseline.
- **Clearance.** Reinvested at the department's average yield, those hours move clearance from 13.0% to about 13.8%.
- **The Chief's asks.** Neither is met. Reaching about 16% clearance would take roughly 10 saved hours per detective per week, and a 15% net cost cut would take roughly 18. We show the math instead of claiming more.
- **Cost.** The design is lean: a $40,000 build and $15,000 per year to run, with payback in about 9.5 months and a 3-year ROI of about 132%.

## The Bottleneck: Stage 6, Detective Follow-Up

Using the baseline figures from the case brief ($50/hour officer, $70/hour detective):

| Task | Time per case | Role | Cost per case | Share of cost |
|---|---|---|---|---|
| Intake | 15 min | Officer | $12.50 | 4.1% |
| Report writing | 60 min | Officer | $50.00 | 16.4% |
| Video review | 120 min | Officer | $100.00 | 32.8% |
| Evidence processing | 45 min | Officer | $37.50 | 12.3% |
| Detective analysis | 90 min | Detective | $105.00 | 34.4% |
| **Total** | **330 min** | | **$305.00** | **100%** |

Annual baseline: 10,000 cases × $305 = $3.05M. Detective analysis alone is 10,000 × 1.5 hours = 15,000 detective hours per year.

Why Detective Follow-Up matters most:
- It is the only stage where work turns into clearances. Stages 1 to 5 produce inputs; Stage 6 produces outcomes.
- Detectives are the scarcest and most expensive resource: 27% of case minutes but 34% of case cost.
- Video review (Stage 5) is the largest single cost line. But AI help there would mean moving raw case video into cloud tools, which conflicts with our security principle, and the most obvious AI use (facial recognition) is banned.

A burglary is a break-in to a home or business to commit a crime (Council on Criminal Justice, 2024). The case brief notes that stolen items resurface for sale but nobody connects them back to the case (Stage 7). That property is one trail a detective can follow without touching case data.

One limit to state clearly: a public listing is not proof of a burglary. It is a lead to the property only. Establishing the entry and the offender still requires detective work.

## Our Solution

### What it does

CascadeAI is a retrieval system, not a generative one. It takes a short structured description of the items taken and finds public listings that fit that description. It then compares the public photographs in those listings with public product images for the reported make and model. Every result links to the underlying public listing so the detective can verify it.

### Who uses it and what changes day to day

Only detectives use CascadeAI. Officers have no new tasks and no new clicks.

1. The detective works the case in the department's own system, exactly as today.
2. The detective opens CascadeAI and self-reports the items in a short structured form: category, brand and model, color, approximate date window, and city or region. The form blocks names, addresses, case numbers, and free-text narratives.
3. CascadeAI searches public listings and returns the First-48-Hour Lead Package within minutes.
4. The detective reviews each lead against its public source, then follows up through normal legal process or sets it aside.

What changes: the detective stops running the same manual searches across several sites and starts from a sourced list of possible matches. Nothing the detective does in CascadeAI changes how it behaves.

### First-48-Hour Lead Package

| Component | What the detective sees |
|---|---|
| Possible listing matches | Public listings whose details and photographs resemble the reported items, with price and date posted |
| Match factors | What matched: brand and model text, visual similarity to the public product image, color, listing date, region |
| Source reference | Direct link, a saved copy of the public listing photo, and a capture timestamp for every lead |
| Search coverage | Which public sources were searched and when, so gaps are visible |
| Plain "no match" result | If nothing clears a fixed threshold, CascadeAI says so instead of guessing |

Where it works best: distinctive or uncommon items, such as a specific model, a recognizable jewelry design, or branded tools. For common items many listings look alike. In that case CascadeAI narrows by region and date window and tells the detective the results are too broad to rank, rather than implying precision it does not have.

### What CascadeAI does not do

| CascadeAI does NOT | Instead, CascadeAI |
|---|---|
| Read, store, or search case data | Searches public sources only |
| Generate text, summaries, or guesses | Retrieves existing public listings and photos |
| Learn from or adapt to user input | Uses a fixed ranking that changes only through reviewed, versioned releases |
| Identify suspects or link sellers to burglaries | Surfaces listings that resemble reported items |
| Use facial recognition or analyze people | Compares item appearance only |
| Recommend arrests or establish probable cause | Shows detectives where to start looking |
| Predict where crime will occur | Works one case at a time, at the detective's request |
| Replace detectives | Gives detectives time back for investigation |

## Security and Reliability

A key reason CascadeAI does not search any case data is security. Police data must stay in systems that meet the FBI's CJIS Security Policy, and case files cannot go into outside tools. We designed around that rule instead of working around it.

**CascadeAI receives:**
- Structured item descriptors typed by the detective.
- Approximate date window and city or region.
- Detective user ID (for audit logging).
- Public listings and public product images.

**CascadeAI never receives:**
- Case files, narratives, or witness statements.
- Victim, witness, or suspect names and addresses.
- Case numbers or links to department records.
- Photos, video, or evidence files from any case.
- Connections to RMS, CAD, evidence, or video systems.

The application is hosted in AWS GovCloud (US) and is designed to support CJIS Security Policy requirements:
- Encryption in transit and at rest.
- Multi-factor authentication and role-based access control for detectives only.
- Audit logging of every query and every result returned.
- Administrative access limited to vetted U.S. persons.
- Geographically redundant infrastructure for availability.

Before launch, the department's security and CJIS compliance staff confirm the design.

### Built so it cannot hallucinate

- Retrieval only: every output is an existing public listing with its link and saved photo.
- No generated text: match factors are read from listing fields, not written by a model.
- No learning from input: the tool does not collect ratings or feedback and does not adapt its ranking to user behavior. Changes come only through reviewed, versioned releases.
- Fixed match threshold: below it, the result is "no match found."
- The detective checks each lead against its source before acting on it.

The trade-off is deliberate. Because CascadeAI cannot read case data, it cannot link our own burglaries to each other or find patterns across our case files. We accept that limit in exchange for a much smaller breach risk and a faster path to approval.

## Cost-Benefit Analysis

All figures use the case brief's baseline and the team's inputs. Where we had to add an assumption, we label it. The pilot exists to replace assumptions with measured values.

### Lean cost design

CascadeAI is cheap to build and run for four reasons:
- It needs no integration with the department's case systems.
- It runs on pay-per-use managed services in GovCloud.
- It uses an off-the-shelf image-comparison model with no custom training.
- It works only from public data.

The figures below are planning placeholders that the tech team will confirm.

| Cost item | Amount |
|---|---|
| Build: application and photo-comparison development | $25,000 |
| Build: security and CJIS review and documentation | $8,000 |
| Build: detective training and HR coordination | $5,000 |
| Build: contingency | $2,000 |
| **Total build (one time)** | **$40,000** |
| Run: GovCloud hosting and storage | $6,000 per year |
| Run: public listing data access | $4,000 per year |
| Run: maintenance, support, and audits | $5,000 per year |
| **Total running cost** | **$15,000 per year** |

### Inputs

| Input | Value | Source |
|---|---|---|
| Annual burglary cases | 10,000 | Case brief |
| Detective cost | $70 per hour | Case brief |
| Detective analysis per case | 1.5 hours (15,000 hours per year) | Case brief |
| Baseline clearance | 13% (1,300 cases) | Case brief; Council on Criminal Justice (2024) |
| Time saved by CascadeAI | 2.5 hours per detective per week | Team input |
| Detective work week | 40 hours | Assumption (standard full-time week) |
| Build and running cost | $40,000 and $15,000 per year | Placeholder; tech team to confirm |

### Savings math

| Step | Calculation | Result |
|---|---|---|
| Share of detective time freed | 2.5 ÷ 40 | 6.25% |
| Detective hours freed per year | 15,000 × 6.25% | 937.5 hours |
| Gross annual savings | 937.5 × $70 | $65,625 |
| Net annual savings | $65,625 − $15,000 | $50,625 |
| Net savings vs. $3.05M baseline | $50,625 ÷ $3,050,000 | 1.7% |
| Payback on the build | $40,000 ÷ $50,625 | about 9.5 months |
| 3-year benefit | 3 × $65,625 | $196,875 |
| 3-year cost | $40,000 + 3 × $15,000 | $85,000 |
| 3-year ROI | ($196,875 − $85,000) ÷ $85,000 | about 132% |

Averaged over three years, net savings are about $37,300 per year, or 1.2% of the baseline.

### What would have to be true to hit the targets

| Hours saved per detective per week | Hours freed per year | Net annual savings | Net % of $3.05M | Clearance rate | Payback | Chief's asks met |
|---|---|---|---|---|---|---|
| 1.25 | 469 | $17,813 | 0.6% | 13.4% | 2.2 years | None |
| 2.5 (team input) | 938 | $50,625 | 1.7% | 13.8% | 9.5 months | None |
| 5 | 1,875 | $116,250 | 3.8% | 14.6% | 4.1 months | None |
| 10 | 3,750 | $247,500 | 8.1% | 16.3% | 1.9 months | Clearance |
| 12.5 (2.5 hrs a day) | 4,688 | $313,125 | 10.3% | 17.1% | 1.5 months | Clearance |
| 18 | 6,750 | $457,500 | 15.0% | 18.9% | 1.0 month | Both |

At the team's input, neither ask is met, and we are saying so up front. A 15% net cut ($457,500) would need about 18 saved hours per detective per week, which is 45% of a detective's time. That is more than a search tool can credibly deliver.

### Honest limits of this estimate

- Freed hours are capacity, not cash, unless the department avoids overtime or a new hire.
- The time saved must be net of the time detectives spend verifying leads. The pilot measures it that way.
- Intangible benefits are not counted: less tedious searching for detectives, faster answers for victims, and public trust from a transparent, case-data-free design.
- HR coordination (training schedules and consultation with labor representatives) is required before launch. Its cost is included in the build placeholder.

## Clearance Logic

CascadeAI can move clearance through two paths. We quantify only the first, because we have no baseline for the second.

### Path 1: time returned to detectives (counted)

We assume freed detective hours earn the department's average yield. That is likely optimistic, since extra hours usually earn less than average, so treat the result as an upper-end estimate.

| Step | Calculation | Result |
|---|---|---|
| Baseline cleared cases | 10,000 × 13% | 1,300 |
| Baseline yield | 1,300 ÷ 15,000 detective hours | 0.087 cleared cases per hour |
| Hours freed | 15,000 × (2.5 ÷ 40) | 937.5 hours |
| Additional clearances | 937.5 × 0.087 | about 81 |
| New clearance rate | 1,381 ÷ 10,000 | 13.8% (+6.3% relative) |
| Chief's ask (+25% relative) | 13% × 1.25 | 16.25% (1,625 cases) |
| Gap to the ask | 1,625 − 1,381 | about 244 cases |
| Hours needed to close it | 325 ÷ 0.087 | 3,750 hours (25% of detective time, or 10 hours per detective per week) |

### Path 2: direct leads from photo-matched listings (not counted)

A confirmed match could give a detective a lead that would not otherwise surface in time. We do not put a number on this because no baseline exists for how often a public listing leads to a clearance. Measuring it is part of the pilot, and we will report it whichever way it comes out.

## Pilot Plan

### First 90 days

- **Scope:** one burglary investigation unit, detectives only.
- **Weeks 1 to 2:** security and CJIS review by the department's security staff, plus HR and labor coordination before launch.
- **Training:** one 60-minute session and a one-page guide. Training and demos use synthetic or public data only.
- **Design:** cases are randomly assigned to use CascadeAI or the usual process, so the comparison is fair.
- **The one metric that proves it works:** detective hours per week spent on external property cross-referencing, tool cases vs. usual-process cases, net of time spent verifying leads. Success means at least 2.5 hours saved per detective per week, which is the figure our cost model assumes.
- **Supporting measures** come from sources outside the tool: adoption from audit logs (searches run and leads opened), and clearances from the department's own records. Clearance is not expected to show a reliable change in 90 days. CascadeAI collects no ratings or feedback from users.
- **Go/no-go rule:** expand only if the measured saving reaches 2.5 hours per detective per week. If not, we redesign or stop, and we report the result either way.

### How we will measure whether it works

A pre-registered randomized trial with 85 officers found that an AI report-writing tool did not significantly reduce report-writing time, despite vendor claims (Adams et al., 2024). We take that as a warning. We use:
- A control group.
- Independent timing logs rather than impressions.
- Metrics fixed before launch.

We also publish null results.

### By one year

- Expand to all burglary units in two waves after a go decision.
- Track clearance against the prior-year baseline and the control cases.
- Quarterly review of audit logs and bias checks, reported to the Council's public safety committee.
- Re-run this cost-benefit model with measured values and report whether the 15% and 16% targets are realistic.

## Ethics and Trust

| Concern | How we address it |
|---|---|
| Bias | Matching uses item attributes only: no person, neighborhood, or demographic data. Quarterly audits check whether follow-ups concentrate unevenly by area. |
| Privacy | No case data enters the cloud tool. Queries are structured, so names, addresses, and narratives are blocked. Listing photos can show people or home interiors, so CascadeAI compares item appearance only, uses no face detection or recognition, and keeps saved photos only as long as the audit policy requires. We do not build seller profiles. |
| False positives | A listing match is a resemblance, not proof. Match factors are shown, the detective verifies every lead against its source, and a listing never identifies a suspect. An innocent reseller must not be treated as a suspect because of a match. |
| Over-policing risk | CascadeAI is not predictive. It does not rank neighborhoods or people and does not guide patrols, so there is no feedback loop from past patrol patterns. It works one case at a time, only when a detective asks. |
| Human in the loop | Humans decide probable cause, warrants, arrests, and charges. CascadeAI only retrieves and sorts public information. |
| Transparency and reliability | Every lead carries its source, timestamp, and match factors. Every query is logged. The tool generates no text and learns nothing from user input. No facial recognition is used. |

## Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Savings smaller than modeled | Misses cost targets | Randomized pilot, go/no-go rule, and honest reporting of results |
| Irrelevant or look-alike results | Detective time wasted | Show match factors and sources; say when results are too broad to rank |
| Low detective adoption | Benefits not realized | Detective-only tool, one short form, no officer work, 60-minute training |
| Case details typed into the query by mistake | CJIS exposure | Structured fields only, input blocking, user warnings, audit logs |
| Photos show private people or interiors | Privacy harm | Item-only comparison, no face detection, limited retention |
| Credential compromise | Unauthorized access | MFA and role-based access control |
| Public sources restrict automated access | Fewer leads | Use authorized data access; report search coverage so gaps are visible |
| Over-reliance on matches | Reduced detective judgment | Human verification required; matches never treated as evidence on their own |
| Service outage | Reduced availability | GovCloud redundancy; detectives can still search manually |

## Sources and Notes

- Council on Criminal Justice (2024). Burglary fact sheet: burglary clearance fell from 23% in 1964 to 13% in 2022, and burglary involves entering a home or business to commit a crime. https://counciloncj.org/wp-content/uploads/2024/07/burglary-fact-sheet.pdf
- Adams, I. T., Barter, M., McLean, K., Boehme, H. M., & Geary, I. A. (2024). No man's hand: Artificial intelligence does not improve police report writing speed. *Journal of Experimental Criminology*. https://doi.org/10.1007/s11292-024-09644-7
- Case brief: annual volume, baseline clearance, task times, hourly costs, and the Chief's asks (hypothetical data).
- Team inputs: 2.5 hours saved per detective. Our additions: a 40-hour week, and placeholder build and running costs awaiting tech team evaluation.
- Cascade City is fictional. This proposal uses no real personal or case data.

**Final recommendation:** CascadeAI is not an AI detective. It is a secure, low-cost, detective-initiated search tool that stays away from case data, generates nothing, and returns a modest, measurable amount of detective time. It does not by itself meet the Chief's asks, and we prove its value in a controlled pilot before the city commits to a full rollout.
