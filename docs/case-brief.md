# Case Brief — Cracking the Burglary Backlog (Group 5)

## Role
Consulting team for the **Cascade City Police Department** (fictional West Coast city, ~750,000 people, Seattle-sized), with **AI-on-Cloud** as technology partner. Deliver a recommendation to the Chief of Police and the City Council's public safety committee in under 24 hours.

## Situation
Property crime is most of Cascade City's reported crime, and burglary is where the department lags most. Nationally only 13% of burglaries were cleared in 2022, down from 23% in 1964 (Council on Criminal Justice). Pressures: rising property crime, constrained budgets, too few detectives.

## The Chief's asks (within the rollout window)
1. Raise burglary clearance by **25% relative** (13% → ~16%).
2. Cut investigative labor costs by **15%, net** of the solution's build and run costs.

These are asks, not pass/fail lines. If honest math lands short, say so and show what is realistic.

## Workflow stages
| Stage | What happens | Pain point |
|---|---|---|
| 1. 911 intake | Call taken, report entered, priority set | Manual entry, inconsistent categorization |
| 2. Patrol response | Travel, secure scene, initial interviews | No context on nearby incidents |
| 3. Report writing | Narratives, evidence, witness statements | Paperwork consumes officer time |
| 4. Evidence processing | Photos, footage, stolen item cataloging | Slow, manual, inconsistent tagging |
| 5. Video review | Doorbell, security, traffic footage | Hours of footage per case |
| 6. Detective follow-up | Cross-referencing, pattern finding, linking cases | Too few detectives, too many cases |
| 7. Stolen property recovery | Tracking items via pawn shops, resale sites, marketplaces | Items resurface but nobody connects them |

Upstream option (predictive patrol) is allowed, but it must show clearance/cost impact and avoid the feedback loop that over-flags historically over-patrolled neighborhoods. *(We chose Stage 6.)*

## Baseline data (hypothetical — state any added assumptions)
- 10,000 burglary cases/yr; 13% clearance
- Officer $50/h; detective $70/h

| Task | Time/case | Role |
|---|---|---|
| Intake | 15 min | Officer |
| Report writing | 60 min | Officer |
| Video review | 120 min | Officer |
| Evidence processing | 45 min | Officer |
| Detective analysis | 90 min | Detective |
| **Total** | **330 min (5.5 h)** | |

Cost per case: 4 officer-h × $50 = $200 + 1.5 detective-h × $70 = $105 → **$305/case, $3.05M/yr**. A 15% net cut ≈ **$457,500/yr after solution costs**.

## Rules of the room
- No facial recognition (assume banned).
- Police data must stay in FBI CJIS-compliant systems. No case files in public chatbots.
- People decide. AI sorts, flags, summarizes, suggests; a human makes every decision affecting a person.
- Officers must actually use it. Extra clicks won't survive, so plan for adoption.
- Claims need proof: in a 2024 RCT with 85 officers, an AI report-writing tool did not significantly reduce report-writing time despite vendor claims (Adams et al., 2024). Explain how you'd measure yours.
- Public or synthetic data only (data.seattle.gov is allowed). Never real personal or case data.
- Cite sources. Don't claim the case data reflects any real department.

## Deliverables
Deck (< 10 slides recommended), **due Friday 1:00 PM**, plus a 10-minute pitch (7 min present incl. demo + 3 min Q&A). Cover:
- Hook — *needs owner*
- Bottleneck: where time and money go, why it matters most — **Marlin**
- Solution: what it does, who uses it, what changes day to day — **Jay**
- Cost-benefit: time saved/case, annual savings, build + run costs, payback, ROI, 15% net target or why not — **Mooyoun, Anthony, Sharon**
- Clearance logic: how it moves clearance toward +25% (logic, not just the claim) — *needs owner*
- Pilot plan: 90 days and 1 year, scope, training, the one proving metric — **Marlin**
- Ethics (one slide): bias, privacy, false positives, over-policing, human in the loop — *needs owner*
- Working prototype/demo strongly encouraged (+1 bonus). Mockups alone don't count. A 60–90 s recorded demo inside the deck is safest.

Questions to start with: Where does an hour of officer/detective time produce the least value today? What would have to be true for a detective to close twice as many cases?

## Judging (100 + up to 5 bonus)
| Category | Pts | Looking for |
|---|---|---|
| Impact | 30 | Right bottleneck; credible clearance and cost path; math-backed numbers |
| Feasibility | 25 | Fits budget/staffing; realistic tech; clear pilot; risks with fixes |
| Cost-effectiveness | 20 | Stated assumptions; transparent ROI and payback; running costs included |
| Ethics & trust | 15 | Bias, privacy, oversight, transparency, over-policing risk |
| Presentation | 10 | Clear story, clean visuals, strong Q&A, persuasive recommendation |

Bonus (+1 each, max +5): working prototype, AI beyond obvious automation, exceptional creativity, community-centered approach, unusually honest and well-measured claims.

Judge tips: show your math; be honest about AI's limits (accuracy, false positives, human checkpoints); don't automate judgment; think about the buyer (Chief: clearance; Council: cost; community: trust).

## Logistics
Submit slides to the organizer by Friday 1:00 PM. AI tools are allowed and encouraged, with public/made-up data only. Prize: 3 months of AI-on-Cloud platform access + $50 AWS credits per member.
