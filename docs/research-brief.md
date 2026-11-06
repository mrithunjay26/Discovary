# Research brief: CascadeAI (Group 5)

This is cited evidence for each slide, plus Q&A material. Numbers that appear on slides must still come from `CLAUDE.md` → Numbers. This file explains **why** those numbers and design choices hold up.

**Wording rule:** say "national data" or "research shows", never "Cascade City's data shows". Cascade City is fictional (case brief). Items marked *(secondary)* come from an analysis of FBI data, not the FBI's own text. Cite them as "FBI UCR data, as analyzed by …".

---

## 1. Hook: the problem in numbers

| Fact | Source | How to say it |
|---|---|---|
| Burglary clearance fell from **23% (1964) to 13% (2022)**. Since 1966, fewer than 1 in 5 reported burglaries has been cleared. | Council on Criminal Justice, *Burglary fact sheet* (2024): https://counciloncj.org/wp-content/uploads/2024/07/burglary-fact-sheet.pdf | "Nationally, 87 of every 100 reported burglaries go unsolved." |
| Only about **43%** of burglary/trespass victimizations are reported to police (2023). | BJS, *Property Crime 2023* fact sheet: https://bjs.ojp.gov/document/PropertyCrime_2023.pdf | Context only. BJS groups trespass with burglary, so don't call it "burglary-only". |
| Stolen property is rarely recovered: about **2% of stolen jewelry value** (2023: ~$1.79B stolen, ~$37M recovered) and **< 5% of electronics value** (2008–2018). | FBI UCR *Property Stolen and Recovered*, via Statista (https://www.statista.com/statistics/252440/property-stolen-and-recovered-in-the-us-by-type-and-value) and ValuePenguin (https://www.valuepenguin.com/burglaries-decrease-thieves-continue-find-value-in-stolen-goods) *(secondary)* | "Items resurface for sale, but almost none find their way home." This ties to the brief's Stage 7 pain point. |
| Average loss per burglary: **$2,799** (2018). | FBI, *Crime in the U.S. 2018*, Burglary: https://ucr.fbi.gov/crime-in-the-u.s/2018/crime-in-the-u.s.-2018/topic-pages/burglary.pdf/at_download/file | Use the FBI's 2018 figure. The common "$2,661 (2019)" number appears only in secondary sites. |

Suggested hook: *"A laptop is stolen on Tuesday. By Thursday it's listed for sale 1.2 miles away. Nobody connects it back. Nationally, less than 5% of stolen electronics value is ever recovered."* The demo shows the "Thursday" moment, with synthetic data.

## 2. Bottleneck: why Stage 6, and why the property trail

| Fact | Source | Use |
|---|---|---|
| Detective analysis is 90 min/case = 15,000 h/yr, which is 27% of case minutes but 34% of case cost. | Case brief; V6 table | The scarce, expensive resource. |
| The RAND study of the criminal investigation process found that traditional investigative effort has little effect on whether cases get solved. Most solved cases come from information available early. | Greenwood & Petersilia, RAND R-1776 (1975): https://www.rand.org/pubs/reports/R1776.html | Detectives need **leads early** (the "first 48 hours"), not more hours of manual searching. This is also why V6 calls the "average yield" assumption optimistic. |
| Solvability sets the potential for detection; resource inputs decide whether it's realized, especially in high-solvability cases. | Coupe (2016), *Policing & Society*: https://www.repository.cam.ac.uk/handle/1810/246599 | Freed hours matter most when aimed at cases with leads. A property match *is* a lead. |
| Pawnshops are a convenient outlet for stolen goods, but stolen items are "invisible" in the daily flow of second-hand merchandise. Better monitoring improves recovery. | Fass & Francis (2004), *J. Research in Crime & Delinquency* 41(2): https://www.ojp.gov/ncjrs/virtual-library/abstracts/where-have-all-hot-goods-gone-role-pawnshops | This is exactly the needle-in-a-haystack problem a fixed, sourced search helps with. |
| Officer-time AI claims often fail under test (see §5). | Adams et al. (2024) | Why we didn't pick report writing (Stage 3). |
| Video review (Stage 5) is the biggest cost line, but AI there means moving raw case video to the cloud, and facial recognition is banned. | V6; case brief rules | Pre-empts "why not video?" |

## 3. Solution: design choices backed by evidence

| Design choice | Why (evidence) |
|---|---|
| **No case data in the tool** | The CJIS Security Policy keeps police data in compliant systems (case brief). The smaller data surface means a smaller breach risk and faster approval (V6). |
| **Retrieval-only, no generated text** | Every lead is an existing listing with its link, a saved photo and a timestamp, so there is nothing to hallucinate. Contrast this with vendor claims like Söze's "81 years of detective work in 30 hours" (Avon & Somerset trial, 2024), which were reported **without** accuracy figures. |
| **Fixed, versioned ranking that doesn't learn from users** | No feedback loop, and ranking stays reproducible for court disclosure and audit. |
| **"Too broad to rank" and "no match found"** | Honest about base rates: most stolen goods are never matched (FBI recovery data, §1). Common items look alike, so saying "too broad" beats false precision. |
| **Search-coverage report** | Fass & Francis: stolen goods hide in normal resale flow. Showing which sources were and were not searched tells the detective what a "no match" really means. |
| **Item-only photo comparison, no face detection** | The brief bans facial recognition. Listing photos can show people and home interiors (V6 privacy row). |

## 4. Cost-benefit: what to say about the numbers

- Official numbers are in V6 / `CLAUDE.md`: build $40k, run $15k/yr, 937.5 h freed, **$50,625 net (1.7%)**, payback ~9.5 months, 3-yr ROI ~132%.
- **The most fragile line is data access ($4k/yr placeholder).** Authorized access to resale data can cost far more. Public council records show LeadsOnline subscriptions of about **$3.3k/yr** (small city), **$7.2k/yr** (Ingham County, MI, 2022), and up to **$174.6k over 3 years** (a larger city's general-fund authorization). Net savings fall to **$0 if data access reaches ≥ $54,625/yr**. Say this before a judge does.
- Freed hours are **capacity, not cash**, unless they avoid overtime or a hire. Seattle-sized departments have reported deep detective shortfalls. SPD said it lost 525 officers since 2020 and has about 30% fewer detectives able to do follow-up (SPD statement, reported in local news). This is context for why capacity matters. Never say it describes Cascade City.
- Inference cost isn't a factor: Phase 1 uses an off-the-shelf image-comparison model, not an LLM.

## 5. Clearance logic and measurement

| Fact | Source | Use |
|---|---|---|
| Pre-registered RCT: 85 officers, 755 reports. AI-assisted report writing (Axon Draft One) **did not significantly reduce writing time**, despite marketing claims. | Adams, Barter, McLean, Boehme & Geary (2024), *J. Experimental Criminology*: https://doi.org/10.1007/s11292-024-09644-7 | Our pilot copies the method: random assignment, independent timing logs, pre-registered metrics, publish nulls. |
| A follow-up found officers *liked* the tool, but liking ≠ time saved. | Boehme et al. (2025), same journal | This is why we don't collect satisfaction ratings as proof. Audit logs plus timing logs are the evidence. |
| UCR counts **offenses** cleared, not people arrested. An offense is cleared when someone is arrested, charged with **that** offense, and turned over for prosecution. | FBI UCR, *Clearances*: https://ucr.fbi.gov/crime-in-the-u.s/2016/crime-in-the-u.s.-2016/topic-pages/clearances.pdf | A property lead helps clearance only if it leads to a charge on that case. That's why V6 doesn't count Path 2 until the pilot measures it. |
| V6's yield assumption (0.087 cleared/detective-hour) assigns all clearances to detective time. RAND (1975) suggests many clearances come from early information instead. | RAND 1975 | This is why 13.8% is an **upper-end** estimate. |

## 6. Pilot

- **One proving metric:** detective hours per week on external property cross-referencing, net of verification time, in randomized tool vs. usual-process cases. Go/no-go is ≥ 2.5 h/detective/week (V6).
- **Retrospective check before go-live (suggested, no cost):** run the tool on a sample of last year's *closed* burglaries where property was later recovered. Did it surface the listing within 48 h? This gives a recall estimate without touching live cases.

## 7. Ethics

| Risk | Evidence | Our answer |
|---|---|---|
| Predictive tools that send patrols where police already were | The Markup (2023) found Geolitica (PredPol) predictions in Plainfield, NJ, matched a later-reported crime **< 0.5%** of the time, and **0.1%** for burglary: https://themarkup.org/prediction-bias/2023/10/02/predictive-policing-software-terrible-at-predicting-crimes | CascadeAI isn't predictive. It runs one case at a time, at a detective's request, and ranks items, not places or people. |
| Evidence-availability bias | Smart-home device ownership in the highest-income households is **more than double** that of lower-income households (NPD Group via CE Pro): https://www.cepro.com/business-support/research/npd-group-smart-home-device-ownership-rate | Phase 1 ignores camera/evidence data entirely. Any Phase 2 prioritization must cap the weight of private-camera evidence and audit priority by area. |
| Innocent resellers | V6 | A match is a resemblance, not proof. There are no seller profiles, and the detective verifies through legal process. |
| Privacy in listing photos | V6 | Item-only comparison, no face detection, limited retention. |

## 8. Phase 2 roadmap: why in-CJIS case linking is the right next step (not costed)

This is the research answer to "how would you ever reach the 10 h/week row?" Present it only as a gated roadmap.

| Finding | Source |
|---|---|
| Geographic + temporal proximity correctly classified **86%** of burglary pairs (same vs. different serial offender). Modus operandi alone managed **58%**. | Markson, Woodhams & Bond (2010), *J. Investigative Psychology & Offender Profiling*: https://research.birmingham.ac.uk/en/publications/linking-serial-residential-burglary-comparing-the-utility-of-modu |
| Inter-crime distance was the single most effective linking feature for both residential and commercial burglary. | Bennell & Jones (2005): https://carleton.ca/policeresearchlab/wp-content/uploads/BetweenaROCandahardplaceamethodforlinkingserialburretrieved_2022-01-02.pdf |
| Logistic-regression linkage reached **AUC 0.903** for residential burglary (n = 180). | Tonkin, Lemeire, Santtila & Winter (2019), via Tonkin & Woodhams |
| Near-repeat burglaries cluster within about **1–2 blocks and 1–2 weeks**, and detected near-repeat pairs are much more likely to share an offender. | Bowers & Johnson (2005); Bernasco (2008), *European J. Criminology* 5(4): https://journals.sagepub.com/doi/full/10.1177/1477370808095124. Caveat: Bernasco notes this may be overestimated, because police pursue such pairs. |
| Burglars travel about **1.6–1.9 miles** on average from home to offense. | Rhodes & Conly (1981), DC: 1.62 mi; Wiles & Costello (2000), Sheffield: 1.88 mi |
| Washington dealers must furnish transaction records to police on request and report suspected stolen property. Some WA cities require electronic reporting via LeadsOnline. | RCW 19.60.040: https://lawfilesext.leg.wa.gov/Law/RCW/RCW%20%2019%20%20TITLE/RCW%20%2019%20.%2060%20%20CHAPTER/RCW%20%2019%20.%2060%20.040.htm; Longview ordinance 5.64 |
| If Phase 2 ever used an LLM, Claude on Amazon Bedrock in AWS GovCloud is FedRAMP High / DoD IL4-5 authorized. CJIS still needs department confirmation. | https://www.anthropic.com/news/claude-in-amazon-bedrock-fedramp-high |

**Phase 2 gates:**
1. Phase 1 go decision.
2. Separate CJIS approval.
3. Retrospective validation on the department's own *solved* series (the Markson design: linked vs. unlinked pairs).
4. Its own randomized pilot.
5. Each linked case cleared only on its own evidence (UCR).

**No Phase 2 numbers go in the headline.**

## 9. What we could not verify (don't claim these)

- A US median burglar travel distance. Only means are available, plus one Danish median of 4.7 km.
- The exact AUC values in Markson (2010) and Bennell & Jones (2005). Use the accuracy figures above.
- The share of stolen goods sold via pawnshops vs. online marketplaces.
- A current Seattle burglary clearance rate or count. data.seattle.gov (SPD Crime Data, `tazs-3rd5`) is allowed but wasn't pulled for this deck.
