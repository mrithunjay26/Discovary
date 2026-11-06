# CascadeAI — Team Project Plan

> **Status: superseded by Proposal V6** (`docs/proposal-v6.md`), the current pitch: a case-data-free public-listing search. This 5-agent plan is kept only as the basis for the clearly labeled **Phase 2 concept** (in-CJIS case linking), and its numbers (+300 solved, $293,350 gross) are no longer used. See `CLAUDE.md` → Numbers.

## Section 1: Bottleneck we picked — Stage 6: Detective Follow-Up

Detective follow-up has the most leverage because this stage handles:
- Cross-referencing cases
- Finding burglary patterns
- Identifying repeat offenders
- Connecting stolen property to crimes
- Deciding where detectives spend their limited time

Today this work is largely manual. Detectives must search previous reports, compare burglary methods, look for geographic patterns, search stolen property databases, and prioritize which cases deserve attention.

With 10,000 burglary cases a year and limited detective staffing, valuable connections between cases are often missed. Unlike report-writing or intake automation, improving detective follow-up directly affects both **clearance rate** and **investigative labor cost**.

## Section 2: Proposed solution — CascadeAI Lead Generation Platform

A CJIS-compliant AI-on-Cloud system that generates investigative leads for detectives. It does **not** determine guilt, probable cause, arrests, warrants, or charging decisions. Humans remain responsible for every investigative decision.

**Inputs:** burglary reports, historical burglary cases, evidence metadata, public crime data, synthetic LeadsOnline transaction data.

- **Agent 1 — Burglary Classification:** classifies reports as Forcible Entry / Unlawful Entry / Attempted Forcible Entry. Extracts entry method, time of offense, location, stolen property, vehicle descriptions.
- **Agent 2 — Case-Linking:** similarity matching to find potentially related burglaries. Example: cases 1044, 1098 and 1121 share rear-window entry, afternoon timing and jewelry theft, so they may be one series.
- **Agent 3 — Property Recovery:** searches LeadsOnline-style records. Example: Case 1044, stolen MacBook Pro → pawned MacBook Pro listed 2 days later, 1.2 miles away.
- **Agent 4 — Prioritization:** ranks High / Medium / Low based on linked cases, property recovery opportunities and available evidence.
- **Agent 5 — Explainability:** every recommendation includes evidence ("Recommended because: same entry method, same neighborhood, similar theft pattern, stolen property match found").

## Section 3: Prototype — Detective dashboard

Detective opens **Case #1044**. The system displays:
- Classification: Forcible Entry
- Linked cases: 1098, 1121, 1185
- Property match: Pawned MacBook Pro
- Confidence: 87%
- Priority: HIGH
- Reason: 4 related burglaries and 1 potential property recovery lead

The detective decides whether to investigate further.

## Section 4: Clearance logic

Current: 10,000 burglaries × 13% = 1,300 solved.

Assumption: detectives spend significant time searching for links between cases and reviewing low-value cases. CascadeAI surfaces burglary series, repeat MOs and stolen-property matches that may otherwise be overlooked.

Conservative improvement: +300 solved → 1,600 / 10,000 = **16%**, which meets the Chief's goal of a ~25% relative improvement.

## Section 5: Cost savings

- Baseline detective analysis: 90 min × 10,000 cases = 15,000 h × $70 = $1,050,000/yr
- Assumption: AI cuts detective analysis time by 20% → 18 min/case → 3,000 h × $70 = **$210,000**
- Additional: prioritization cuts unnecessary video review and duplicate work by 10 min/case → 1,667 officer-h × $50 ≈ **$83,000**
- **Combined gross ≈ $293,000**

Next: estimate cloud and licensing costs and check whether we reach the 15% net target (~$457,500). If not, say so honestly: the plan partly meets the cost target while meeting the clearance goal. Judges prefer honest math.

## Section 6: CJIS, ethics, and human oversight

**CJIS:** CJIS-compliant cloud storage, role-based access control, encryption at rest and in transit, audit logging of every AI recommendation.

**Human in the loop:** AI cannot make arrests, request warrants, establish probable cause, determine guilt or file charges. AI only sorts, links, prioritizes and explains. Humans make every decision.

**Bias mitigation:** the model never uses race, ethnicity, gender or facial recognition. Recommendations rely only on burglary characteristics, evidence metadata and property recovery information.

## Section 7: Pilot plan

**First 90 days:** pilot with one burglary unit. Measure detective time per case, number of AI leads reviewed, cases linked by AI, and property matches found. **Success metric:** average detective follow-up time drops by at least 15%.

**One year:** expand to all burglary investigations. Measure clearance rate, cost per solved burglary, detective workload and user adoption. **Primary KPI:** burglary clearance rises from 13% toward 16%.
