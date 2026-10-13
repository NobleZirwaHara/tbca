TBCA · AIIM Botswana Country Pack BW-1.0

AIIM Botswana Country Pack — Issue BW-1.0

Challenge of DZ-1.0 · Master Prompt and Subsequent Prompts · Executed Botswana Deep Catalogue · 18 Sectors · 16 Administrative Units with Census 2022 Populations · 83 Pinned Towns and Council Points · 321-Template Sweep from US$200,000 · Freshness-Gated Tiers · Citizen-Reserved Flag · Tornado and Equity IRR · Diamond-Downturn Re-tiering · English and Setswana · CPDS-1.2 Semantic Validator

# Document Control

| Item | Entry |
| :-: | :-: |
| Document ID | TBCA-AIIM-BW-1.0 |
| Reproduces and extends | Issues 2.0/2.1, MW-1.0, GH-1.0, NG-1.0, EG-1.0, MA-1.0, the model pack ZA-1.0 and DZ-1.0, for Botswana. Nothing is removed. The weaknesses found in DZ-1.0 are fixed (Part 0) |
| Companion file | TBCA\_AIIM\_Botswana\_Deep\_Registers\_BW-1.0.xlsx |
| Issue date | 09 October 2026 |
| Prepared by | Opus 5.5 (Max) for The Business Clinic.Africa |
| Geography data | 16 first-level units (10 districts and 6 city/town councils) with points and Wikidata IDs, and 79 towns with points: countries-states-cities-database (ODbL 1.0, dr5hn). Council seats re-assigned to their city/town council. Populations: Census 2022 (Statistics Botswana; 8 rural districts via a table citing the census). Four councils have no dataset town and get a council point |
| Exchange rates | P13.84/US$ (9 Oct 2026) and R1.207 per pula (7 Oct 2026); crawling peg, 50 % rand / 50 % SDR, −2.76 % a year (BW-MAC-F9 to F11) |

## Interpretation Control

| Marker | Meaning |
| :-: | :-: |
| Evidence grade 3 / 2 / 1 | 3 official sources: Statistics Botswana, Bank of Botswana, ministries and Parliament, BURS, BITC, SEZA, IMF and World Bank, or a newspaper quoting a named official with figures. 2 credible secondary source. 1 headline only, or internally inconsistent |
| Verification | 18 facts (≈14 % of sector and macro facts) were drawn by a seeded random sample, stratified one per sector (seed 2026), and re-fetched independently (Part I-5). 14 were confirmed; 4 were partly confirmed and have been corrected |
| Score | E + D + P\* + (4 − R), maximum 12. P\* is 1 without a policy instrument. A needs a score of 11 or more, E = 3, a fresh fact (dated on or after 9 April 2025, i.e. ≤18 months old; macro facts count only for the finance sector) and RA ≥ 10 (the template survives its sector’s shock adjustment). A+ needs RA ≥ 11. Robust means a score of 12 |
| RA | Score − ⌈shock ÷ 3⌉. Each sector’s shock rationale cites at least one fact ID (validator) |
| Citizen-reserved | A sourced flag on each template whose activity is reserved for citizens or citizen-owned companies (Industrial Development Act and Trade Act reservations, 35 reserved service sectors; BW-MAC-F21, F23). Foreign investors enter these only through a citizen partner or as a supplier |
| FX earner | An explicit field on each template (not a keyword guess). FX earners earn US$ or rand; the others earn pula, which is fully convertible (no exchange controls since 1999, BW-MAC-F19) but crawls down 2.76 % a year against the basket |
| Ranked lead score | RA + M (urban templates only: place with ≥30,000 people, Census 2022 for councils) + H (hotspot) + F (sector fit: ≥2 matching tags) − G (export templates more than 250 km from a border gateway). Ties go to the town with more matching tags, then to the larger population. There is no rotation. Top 10 places per template, at most 2 per administrative unit |
| Ticket bands | S US$0.2–1 m · M 1–5 m · L 5–50 m · XL \>50 m (S ≈ P2.8–13.8 m) |

# PART 0 — Challenge of the previous response (Algeria DZ-1.0) and what BW-1.0 does differently

| \# | Weakness in DZ-1.0 | Why it matters | Fix implemented in BW-1.0 | Where |
| :-: | :-: | :-: | :-: | :-: |
| U1 | The concentration fix was partly manufactured. DZ cut top-1 concentration from 41 % to 6 % with a rotation tie-break: equal-scoring towns took turns at \#1 | Diversity created by rotation is arbitrary; it does not tell an investor where demand is | No rotation. Ties go to fit, then to Census 2022 population. Concentration is reported both ways: 46 % without rotation vs 19 % with it. Concentration rises, and that is the honest picture: Gaborone and its commuter belt hold about 37 % of Botswana’s people | Part G-1; OS-61 |
| U2 | Tier A was 37 % of the DZ sweep | Too many “best” opportunities stops being a signal, and some rested on old facts | Two gates. Freshness: Tier A needs a fact ≤18 months old, and macro facts only count for finance templates. Shock: Tier A needs RA ≥ 10. Tier A share before the gates 43 %, after 26 %. (Freshness alone removed few templates, because most Botswana facts are 2026 vintage; the shock gate does most of the work) | Parts G, K-2; OS-73 |
| U3 | Unit economics were single-point | One IRR hides which assumption kills the deal | A tornado for each pack: price, volume (using the variable-cost share) and capex, each ±20 % | Part H-1c; OS-74 |
| U4 | The verification sample was hand-picked | Picking easy facts flatters the confirmation rate | A seeded, stratified random sample (one fact per sector, seed 2026), 18 facts. 4 were partly confirmed and corrected in the pack | Part I-5; OS-77 |
| U5 | Hotspots fell back to the wilaya capital when a name did not match | A pin in the wrong town misleads a site visit | 100 % exact match required, enforced by the validator (42/42) | Part D-3 |
| U6 | The FX-earner flag was a keyword heuristic | Keyword matching misclassifies | An explicit field on all 321 templates | Parts F, G |
| U7 | The ownership regime was \[VERIFY\] | Investors cannot rely on an unsourced rule | A sourced citizen-reserved flag (BW-MAC-F20, F21, F23) and a citizen-partner next action | Parts F, G; OS-66 |
| U8 | Envelopes split each band midpoint equally across ranked places | A village got the same share as a city | Envelope weighted by lead score × population | Part G-5; OS-72 |
| U9 | No gaps were closed during the work | A register that only grows is not managed | A closed-gap ledger (5 gaps closed during this issue) beside the open register | Part I-2b; OS-78 |
| U10 | The regulatory-change register had no impact score | A list of changes does not say who wins or loses | Impact direction and number of templates affected for each change | Part I-4 |
| U11 | No country-level downside case | Algeria’s hydrocarbon risk was described, not tested | Diamond-downturn re-tiering: the diamond shock weight is doubled and every template re-scored | Part H-6; OS-76 |
| U12 | Port distance is meaningless for a landlocked country | Botswana trades through borders, not ports | Gateway distance: haversine to 6 border gateways (Kazungula, Tlokweng, Ramatlabama, Mamuno, Ramokgwebana, Martin’s Drift) \[COMPUTED\]; penalty for export templates \>250 km away | Parts D, G; OS-68 |
| U13 | The validator checked structure only | A pack can pass structural checks and still be wrong | Semantic checks: freshness gate applied, envelope total equals the Tier A total, unique fact IDs, valid URLs, exact hotspot matches, stratified sample | Part K-2; OS-80 |
| U14 | Financing was ignored | Most investors borrow; project IRR is not equity IRR | Equity IRR with 50 % debt at prime (7.19 %) + 3 pp over 7 years \[PROPOSED terms\] | Part H-1c; OS-75 |
| U15 | Next actions did not say whom to call | “Obtain procurement calendar” without a name stalls | Institution to call on every hotspot lead | Part G-6; OS-79 |

Self-challenge — limits BW-1.0 still has.

The corporate tax rate is unconfirmed. The 2026/27 budget proposes a rise from 22 %; KPMG reads 23.5 %, PwC and RSM read 25 % (K-11, DG-01). Unit economics use 22 % and show the effect.

The 24 % state stake text in the Mines and Minerals Act amendment is not loaded (K-06, DG-02).

The full citizen-reserved licence list is not loaded (DG-03); the flag uses the sourced categories.

The Gaborone Dam level is stale (February 2025; the WUC page needs JavaScript) (DG-04).

Setswana product names are not validated (DG-14).

8 district populations come through a table citing the census, not directly from Statistics Botswana.

Exchange rates are grade 2 (market data rather than the Bank of Botswana’s daily fixing).

The dataset gives Gaborone 647 people; the census figure (246,325) is used (K-17).

# PART A — Why Botswana is different: a small, diamond-dependent, well-rated economy hit by a diamond slump, now tightening and opening to citizen-led diversification

Macro picture (sourced).

Growth: GDP fell 2.8 % in 2024 and 0.7 % in 2025. Q2 2026 rebounded 8.7 % y/y on diamond mining (+94.7 %), but non-mining GDP fell 0.2 % (BW-MAC-F1 to F3). The Ministry of Finance projects 3.1 % for 2026 (MAC-F4).

Inflation and rates: inflation reached 10.7 % in May–June 2026 and was 9.3 % in August, against a 3–6 % target. The Bank of Botswana raised the policy rate by 200 bp to 5.5 % on 30 April 2026 and has held it since (MAC-F6 to F8).

Currency: P13.84/US$ and R1.21 per pula. The crawl was speeded up to −2.76 % a year in July 2025; the basket is now 50 % rand / 50 % SDR (MAC-F9 to F11). There are no exchange controls (MAC-F19).

Reserves: US$4.16 bn at end-June 2026 (MAC-F12).

Public finances: the 2026/27 budget tabled an 8.9 % of GDP deficit; it was revised to 3.1 % in September 2026 on a larger Bank of Botswana transfer. Debt is 33 % of GDP and the statutory ceiling was raised to 60 % (MAC-F13 to F15). S\&P rates Botswana BBB-, negative outlook (MAC-F27).

Jobs: unemployment is 21.0 %, youth 28.9 % (MAC-F16).

Dependence: diamonds were 72.6 % of 2025 exports, about a third of revenue and three-quarters of FX receipts (TRD-F2, MAC-F25). SACU receipts (P26.79 bn) are now the largest single revenue line (TRD-F3).

Politics: the UDC government took office on 1 November 2024, ending 58 years of BDP rule (MAC-F24).

Seven engines.

Diamonds, re-based.

Debswana output fell 54.6 % in Q4 2025 as De Beers cut supply.

The 2025 sales agreement raises the Okavango Diamond Company’s share of Debswana output from 30 % to 50 %.

Botswana holds pre-emption options in the De Beers sale (MIN-F1, F2, F5, F6).

The copper belt.

Motheo and Khoemacau produced about 83,000 t of payable copper in 11 months of 2025.

MMG approved a US$900 m Khoemacau expansion to 130,000 tpa (MIN-F3, F4).

Power self-sufficiency.

Imports are about 35 % of demand. The target is 72 % local generation.

104 MW of solar is operating; Jwaneng and Mmadinare add 100 MW each.

The Mmamabula coal IPP delivers 300 MW by Q1 2027. The renewables target was raised to 50 % by 2030 (ENR-F1 to F4, GRN-F1).

Agriculture under stress.

The herd fell 6.1 % to 1.64 m cattle. The EU suspended Botswana beef over FMD in April 2026, and the UK restricted it.

Horticulture import restrictions were reinstated in December 2025, creating protected demand for local growers (AGR-F1 to F3, TRD-F4).

Tourism. Arrivals rose 29.6 % to 1.53 m in 2024; direct tourism GDP is P9.8 bn (TOU-F1, F3).

Corridors. The Kazungula Bridge Authority is launched, and the 430 km Mosetse–Kazungula–Livingstone railway is being prepared (TRN-F3, F4).

Capital pools. BPOPF holds P128 bn. The stock exchange passed P1 trn of market cap. A fintech sandbox opened in March 2026 (FIN-F4 to F6).

The binding constraint. It is a combination of three things:

diamond dependence for exports, revenue and FX;

dependence on South Africa for power, imports and the rand leg of the currency basket;

citizen-preference rules that reserve activities and procurement for citizens, which shape how a foreigner can enter.

How Botswana compares. Of the eight countries, Botswana has the strongest institutions and fewest currency frictions but the narrowest export base. The opportunities are in replacing imports (power, food, fish, services), supplying copper and solar build-outs, and partnering with citizen firms.

## A-1 Dated cross-country benchmark (eight AIIM packs)

| Metric | Malawi | Ghana | Nigeria | Egypt | Morocco | South Africa | Algeria | Botswana BW-1.0 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| As-of dates | Q1–May 2026 | Sep–Oct 2026 | Jun–Aug 2026 | Aug–Oct 2026 | Aug–Sep 2026 | Aug–Oct 2026 | Jan–Sep 2026 | Aug–Oct 2026 |
| Policy rate | 24 % | 14 % | see NG-1.0 | 19 % / 20 % | 2.25 % | 7.25 % | 2.50 % | 5.5 % (+200 bp Apr 2026) |
| Inflation (latest) | 24.3 % | 5.2 % | 15.39 % | 14.5 % | 0.3 % avg | 4.4 % | 4.0 % (Mar 2026) | 9.3 % (Aug 2026) |
| Growth | — | 6.0 % (Q2 2026) | — | 5.1 % (FY25/26) | 4.4 % (2026f) | 1.1 % (2025) | 3.9 % (2025) | −0.7 % (2025); +8.7 % Q2 2026 |
| Unemployment | n/a | n/a | n/a | n/a | 9.5 % | 33.6 % | 12.7 % | 21.0 % (youth 28.9 %) |
| FX regime | Official vs parallel | Market | Market | Flexible | Basket peg | Free float | Managed + parallel | Crawling peg (50 % ZAR / 50 % SDR) |
| Sweep templates | 176 | 220 | 249 | 263 | 273 | 300 | 312 | 321 |
| Tier A share | n/a | 38 % | 22 % | 31 % | 29 % | 18 % | 37 % | 26 % after freshness gate (A+ 28, A 58); 43 % before |
| Binding constraint | Forex | Fiscal/energy | Insecurity | Shock exposure | Water + EU demand | State capacity | Hydrocarbons + convertibility | Diamonds + SA dependence + citizen rules |

Earlier packs’ values are as reported in each pack and are not re-verified here.

## A-2 Macro fact base

| ID | Item | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MAC-F1 | Real GDP growth 2024 | \-2.8% (revised; IMF Article IV: -3%) | [Statistics Botswana via Reuters/BusinessDay; IMF PR 25/317](https://www.businessday.co.za/world/africa/2026-03-31-mining-slump-a-major-reason-for-botswanas-shrinking-economy/) | 2026-03-31 | 3 |
| BW-MAC-F2 | Real GDP growth 2025 | \-0.7% (Q4 2025 -5.4% y/y; mining value added -47% in Q4) | [Statistics Botswana via Reuters/BusinessDay](https://www.businessday.co.za/world/africa/2026-03-31-mining-slump-a-major-reason-for-botswanas-shrinking-economy/) | 2026-03-31 | 3 |
| BW-MAC-F3 | Real GDP growth Q2 2026 | \+8.7% y/y (Q1 2026 +3.5%); mining +81.7%, diamond mining +94.7%; non-mining GDP -0.2%; nominal Q2 GDP P70,039.7m | [Statistics Botswana GDP Q2 2026](https://www.statsbots.org.bw/sites/default/files/Gross%20Domestic%20Product%20Second%20Quarter%20Of%202026.pdf) | 2026-09 | 3 |
| BW-MAC-F4 | GDP growth forecast 2026 | \+3.1% (Ministry of Finance projection; 2025 projected -0.4% at the time) | [Bank of Botswana MPC statement 26 Feb 2026](https://www.bankofbotswana.bw/sites/default/files/press-release-files/Monetary%20Policy%20Committee%20Decision%20-%2026%20February%202026.pdf) | 2026-02-26 | 3 |
| BW-MAC-F5 | IMF medium-term view | 2025 contraction \~1%; growth could recover to \>4% medium term with reforms; FY2024/25 deficit 7.1% of GDP; debt \>30% of GDP; reserves \~5 months imports | [IMF Press Release 25/317 (2025 Article IV mission, Edouard Martin)](https://www.imf.org/en/news/articles/2025/09/26/pr-25317-botswana-imf-staff-completes-2025-article-iv-mission-to-botswana) | 2025-09-26 | 3 |
| BW-MAC-F6 | Headline inflation (latest) | 9.3% y/y Aug 2026 (9.4% Jul; 10.7% May-Jun; 10.3% Apr; 4.2% Mar); transport 19.7%; target 3-6% | [Bank of Botswana / Statistics Botswana CPI](https://bankofbotswana.bw/latest-news?page=0) | 2026-09-16 | 3 |
| BW-MAC-F7 | Inflation forecast | BoB MPC: avg 7.9% in 2026, 4.9% in 2027; above target until Q1 2027 (fuel prices, electricity tariffs) | [Trading Economics reporting BoB MPC 27 Aug 2026](https://tradingeconomics.com/botswana/interest-rate/news/578724) | 2026-08-27 | 3 |
| BW-MAC-F8 | Monetary Policy Rate | 5.5% (held 18 Jun & 27 Aug 2026; +200bp from 3.5% on 30 Apr 2026); SDF/SCF +/-100bp around MoPR (2.5%/4.5% when MoPR was 3.5%) | [Bank of Botswana](https://www.capmad.com/post/bank-of-botswana-keeps-policy-rate-at-55-as-inflation-holds-at-94) | 2026-08-27 | 3 |
| BW-MAC-F9 | Pula per US$ | 13.8408 BWP per USD (9 Oct 2026); BoB end-Jun 2026 month-end mid 0.0704 USD per BWP (\~14.20 BWP/USD) | [Wise mid-market; Bank of Botswana June 2026 statement](https://wise.com/au/currency-converter/usd-to-bwp-rate/history) | 2026-10-09 | 2 |
| BW-MAC-F10 | Pula vs ZAR | 1 BWP = 1.20664 ZAR (7 Oct 2026) (\~0.829 BWP per ZAR); BoB: pula -1.1% vs ZAR in Aug 2026, -7.2% y/y; +1.9% y/y vs USD and SDR | [Wise; Bank of Botswana news 3 Sep 2026](https://wise.com/au/currency-converter/bwp-to-zar-rate/history) | 2026-10-07 | 2 |
| BW-MAC-F11 | Pula crawl & basket | Downward crawl 2.76% p.a. (since Jul 2025, from 1.51%); basket 50% ZAR / 50% SDR (was 45/55 in 2024) | [Ministry of Finance 31 Dec 2025 release via Pow Rocket Press; Business Weekly](https://powrocket.beehiiv.com/p/the-new-pula-exchange-policy) | 2026-01-02 | 2 |
| BW-MAC-F12 | Foreign exchange reserves | P59.117bn / US$4.162bn end-Jun 2026; P47.4bn at Dec 2025 = 5.5 months import cover (BoB CFO Daniel Loeto) | [Bank of Botswana June 2026 statement; DailyNews 29 Jun 2026](https://bankofbotswana.bw/sites/default/files/publications/June%202026%20Monthly%20and%20Annual%20Financial%20Statements.pdf) | 2026-06-30 | 3 |
| BW-MAC-F13 | Budget 2026/27 (as tabled) | Revenue & grants P77.22bn; expenditure & net lending P103.58bn; deficit P26.35bn (8.9% of GDP); 2025/26 revised deficit P25.48bn; 2024/25 outturn deficit P19.01bn | [PwC Budget 2026/27 summary; Reuters (8.9%)](https://www.pwc.com/bw/en/assets/pdf/botswana-budget-2026-27.pdf) | 2026-02-09 | 3 |
| BW-MAC-F14 | Revised 2026/27 deficit | Cut to P9.26bn (3.1% of GDP) from P26.35bn (8.9%), on larger BoB transfer (Finance Minister Ndaba Gaolathe) | [Reuters via Polity.org.za](https://www.polity.org.za/article/botswana-sharply-reduces-budget-deficit-forecast-on-revenue-boost-from-central-bank-2026-09-22) | 2026-09-22 | 3 |
| BW-MAC-F15 | Public debt | 33% of GDP in 2025/26 (19.7% in 2022/23); domestic P56.06bn, external P27.88bn; statutory ceiling raised from 40% to 60% of GDP in Mar 2026 | [DailyNews/BOPA (Parliament)](https://dailynews.gov.bw/news-detail/92706) | 2026-08-13 | 3 |
| BW-MAC-F16 | Unemployment (latest) | 21.0% overall (BMTHS 2024/25, Nov 2024-Nov 2025); youth 15-35 28.9%; labour force 1,018,099; employed 804,663. Earlier QMTS Q1 2024: 27.6% | [Statistics Botswana BMTHS 2024/25 Stats Brief](https://statsbots.org.bw/sites/default/files/Botswana%20Multitopic%20Household%20Survey%20Stats%20Brief%202025.pdf) | 2026-03 | 3 |
| BW-MAC-F17 | Population Census 2022 | 2,359,609 | [Statistics Botswana](https://www.statsbots.org.bw/2022-population-and-housing-census-preliminary-results) | 2022 | 3 |
| BW-MAC-F18 | Corporate income tax | Standard 22% (2026/27 budget proposes increase - KPMG reads 23.5%, PwC/RSM read 25%; confirm enacted bill); approved manufacturing 15%; IFSC approved services 15%; dividend WHT 10%; VAT 14% with narrower zero-rating; top PIT surcharge +2.5% above P400,000 | [KPMG Tax News Flash; PwC Budget summary](https://kpmg.com/kpmg-us/content/dam/kpmg/taxnewsflash/pdf/2026/02/tnf-botswana-feb-10-2026.pdf) | 2026-02-10 | 2 |
| BW-MAC-F19 | Exchange controls | All remaining exchange control regulations abolished February 1999 | [IMF Public Information Notice 99/105](https://www.imf.org/external/np/sec/pn/1999/pn99105.htm) | 1999 | 3 |
| BW-MAC-F20 | Economic Inclusion Act | Act 26 of 2021 (Cap 28:05), commenced 20 Apr 2022: Economic Empowerment Office, ‘targeted citizens’, localisation, procurement/tendering preferences, anti-fronting (NB: it is a 2021 Act, not 2025) | [Botswana Laws (consolidated statutes)](https://botswanalaws.com/consolidated-statutes/principle-legislation/economic-inclusion-act) | 2022-04-20 | 3 |
| BW-MAC-F21 | Citizen-reserved activities | Effective 1 Jun 2020 (Industrial Development Act / Trade Act): manufacturing reserved e.g. bread & confectionery, ice, meat processing, peanut butter, bottled water, sour milk, sorghum; trading reserved e.g. general dealer, fresh produce, car wash, cleaning, funeral parlour, hair & beauty, takeaway, imported pre-owned motor dealer, internet cafe | [RSM Botswana](https://www.rsm.global/botswana/node/59) | 2020-06-01 | 2 |
| BW-MAC-F22 | Citizen procurement preferences | PPA 2001 s.74 reserved schemes for citizen contractors; 100% youth-owned firms get 50% discount on tender/registration fees; EDD local-goods preference (Minister Wynter Mmolotsi in Parliament) | [DailyNews/BOPA](https://dailynews.gov.bw/news-detail/92272) | 2026-07-16 | 3 |
| BW-MAC-F23 | Citizen reservation in services | 35 service sectors restricted to citizen-owned businesses; CEE law to require foreign firms to outsource \>=50% of services/projects to citizen-owned firms | [US Commerce Country Commercial Guide](https://www.trade.gov/country-commercial-guides/botswana-market-challenges) | 2026 | 2 |
| BW-MAC-F24 | 2024 political change | Oct 2024 election: UDC 36 of 61 elected seats, BDP 4 (ending rule since 1966); Duma Boko took office 1 Nov 2024; UDC pledged 450-500k jobs over 5 yrs, higher minimum wage, new De Beers sales pact | [African Business](https://african.business/2024/11/politics/how-will-duma-bokos-historic-win-change-botswana) | 2024-11 | 2 |
| BW-MAC-F25 | Diamond dependence | Diamonds \~1/3 of national revenue and \~3/4 of FX receipts; revenue \~23% of GDP (historic \~40%); tax/GDP 13.4% | [Reuters via BusinessDay; PwC budget summary](https://www.businessday.co.za/world/africa/2026-03-31-mining-slump-a-major-reason-for-botswanas-shrinking-economy/) | 2026-03-31 | 3 |
| BW-MAC-F26 | Debswana output 2025 (to Nov) | 14,143,511 carats produced (16,338,000 prior yr); 18,119,562 carats sold for US$1,780,645,444 | [MME Committee of Supply speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-MAC-F27 | Sovereign rating | S\&P BBB-/A-3, negative outlook (affirmed 11 Sep 2026) | [Bank of Botswana news listing](https://bankofbotswana.bw/latest-news?page=0) | 2026-09-11 | 3 |

# PART B — Master Prompt and Subsequent Prompts (Botswana)

## B1. Master Prompt MP-AIIM-BW-1.0 (copy as one block)

ROLE. You are the AIIM Botswana Chief Information Architect, Opportunity Scout and Engagement Manager for TBCA, working to top-tier consultancy standards.

CHALLENGE FIRST. Critique DZ-1.0 and fix each weakness. State the limits that remain.

OBJECTIVE. Reproduce all prior issues for Botswana, losing nothing. Cover: - all 16 administrative units with Census 2022 population; - pinned towns with border-gateway distances; - every institution (BITC, SEZA, CEDA, BDC, NDB, BPC, WUC, Botswana Oil, BERA, Debswana, ODC, BMC, CMS, BOCRA, BURS, Bank of Botswana, NBFIRA, PPRA, Statistics Botswana); - every product in English and Setswana; - every shock, policy instrument, citizen-reserved activity, permit and regulatory change; - every value-chain gap, turned into opportunities from US$200,000.

SCORING. Make scores traceable. Gate Tier A on E = 3 and freshness. Use a shock matrix whose rationales cite evidence, RA, A+, robustness, and a diamond-downturn re-tiering.

LEADS. Separate hotspot leads (exact place match, next action with the institution to call) from demand-weighted ranked leads (no rotation; concentration reported both ways) and from coverage. Weight envelopes by lead score × population.

REALISM. Use after-tax IRR, a tornado, an equity IRR with debt, an explicit FX-earner flag and a sourced citizen-reserved flag, precedents with status.

QUALITY. Meet the ≥55 % grade-3 target; re-verify ≥12 % of facts by seeded stratified random sample; keep conflict, open-gap and closed-gap registers; run the CPDS-1.2 validator with semantic checks.

OUTPUTS. (1) The prompt pack. (2) The Botswana Deep Catalogue. (3) The Deep Registers workbook.

## B2. Subsequent prompts BW-P0 to BW-P56

| Prompt | Name | Task | Acceptance |
| :-: | :-: | :-: | :-: |
| BW-P0 | Challenge | Critique DZ-1.0 | ≥15 weaknesses, each fixed |
| BW-P1 | Carry-over | Prior structures | Nothing dropped |
| BW-P2 | Macro | Growth, inflation, MoPR, pula crawl, reserves, budget, debt, jobs | Dated, graded |
| BW-P3 | Thesis | Engines and constraint | Evidence-based |
| BW-P4 | Benchmark | 8 countries, dated | Dates present |
| BW-P5 | Institutions | Role table | ≥50 |
| BW-P6 | Units | 16 units with census population | 16/16 |
| BW-P7 | Towns | Points, population, gateway distance | 83 pinned |
| BW-P8 | Gateways | 6 border gateways | Distances computed |
| BW-P9 | Hotspots | Named sites with status, exact match | 100 % |
| BW-P10 | One-stop shop | Features | ≥80 |
| BW-P11 | Chains | IQ/TQ for Botswana | All rows |
| BW-P12 | Products | English/Setswana, HS | ≥50 |
| BW-P13 to BW-P30 | Sectors (×18) | ≥3 graded facts each | All 18 |
| BW-P31 | Policy instruments | Register | ≥40 |
| BW-P32 | Sweep | Templates | ≥320; S ≥50 % |
| BW-P33 | Scoring | Caps, tiers, A+, robustness | Shown |
| BW-P34 | Freshness gate | Per template | Before/after reported |
| BW-P35 | Citizen-reserved flag | Per template, sourced | 321/321 |
| BW-P36 | FX-earner flag | Explicit field | 321/321 |
| BW-P37 | Shock matrix | Rationale cites facts | Validator pass |
| BW-P38 | Diamond downturn | Re-tiering | Reported |
| BW-P39 | Precedents | With status | ≥15 |
| BW-P40 | Hotspot leads | Institution to call | All |
| BW-P41 | Ranked leads | Demand-weighted; no rotation | Concentration both ways |
| BW-P42 | Investment envelopes | Lead score × population | Sum check |
| BW-P43 | Top-30 | Diversified | ≤3 per sector |
| BW-P44 | Unit economics | After-tax IRR, tornado, equity IRR | 14 packs |
| BW-P45 | FX | Pula, rand, crawl scenarios | Sourced |
| BW-P46 | Conflicts | All known | Logged |
| BW-P47 | Open gaps | Weighted, closure plan | All |
| BW-P48 | Closed gaps | Ledger | ≥5 |
| BW-P49 | Verification | Seeded stratified sample | ≥12 % |
| BW-P50 | Permits and citizen rules | 18 sectors | 18/18 |
| BW-P51 | Regulatory changes | Impact-scored | ≥12 |
| BW-P52 | Premium | Products | ≥17 |
| BW-P53 | 90-day plan | KPIs | Measurable |
| BW-P54 | CPDS-1.2 | Standard | Updated |
| BW-P55 | Validator | Structural + semantic | Run in pack |
| BW-P56 | QA | Acceptance | Pass or logged |

## B3. Policy instruments (P can only exceed 1 when one of these is linked)

| Code | Instrument | Templates using it |
| :-: | :-: | :-: |
| IRP | Integrated Resource Plan: renewables 50 % by 2030 — ENR-F3, GRN-F1 | 11 |
| IPPSOLAR | Solar IPP programme (Jwaneng, Mmadinare, Ghanzi, Lobatse; 50 MW BESS) — GRN-F2, ENR-F6 | 6 |
| MMAMABULA | 600 MW Mmamabula coal IPP — ENR-F4 | 1 |
| FUELRES | Strategic fuel reserves to 60 days; Francistown and Ghanzi depots — OGS-F2 | 3 |
| FUELPRICE | BERA fuel-price regime — OGS-F4, OGS-F5 | 2 |
| CBM | Coal-bed methane licensing — OGS-F6 | 4 |
| DEBSALES | Botswana–De Beers 2025 agreement (ODC 30 % → 40 % → 50 %) — MIN-F5 | 6 |
| COPPER | Kalahari Copper Belt expansions — MIN-F3, MIN-F4 | 14 |
| BENEF | Diamond beneficiation and sightholder licensing — MFG-F5 | 3 |
| FMDCTRL | FMD control and EU/UK zone re-listing — AGR-F2, AGR-F3 | 6 |
| HERD5M | National herd target of 5 m cattle — AGR-F4 | 5 |
| HORTBAN | Horticulture import restrictions (Dec 2025) — TRD-F4 | 8 |
| AQUA | Fisheries permits and aquaculture development — BLU-F2, BLU-F4 | 11 |
| VELD | Veld-product (phane) permits — FOR-F1, FOR-F2 | 5 |
| SEZ | SEZA zones incl. Lobatse Meat & Leather City — MFG-F3 | 5 |
| BITC | BITC investment facilitation — MFG-F2 | 1 |
| WATERDEV | Water & Human Settlement development budget; NSC 2.2 — WSW-F2, WSW-F3 | 10 |
| LBWT | Lesotho–Botswana Water Transfer — WSW-F5 | 2 |
| ROADS | Roads programme P3.02 bn — CRE-F3 | 6 |
| MKLRAIL | Mosetse–Kazungula–Livingstone rail — TRN-F4 | 2 |
| KAZUNGULA | Kazungula Bridge Authority; 24-hour OSBP — TRN-F3 | 6 |
| AIRBW | Air Botswana restructuring — TRN-F5 | 2 |
| G5 | BTC 5G and network capex — ICT-F4 | 1 |
| FIBRE | BoFiNet local-access fibre — ICT-F5 | 1 |
| SANDBOX | Bank of Botswana fintech sandbox — FIN-F6 | 7 |
| HOUSING | Social housing P702.96 m — CRE-F4 | 4 |
| DEVBUD | Development budget P23.38 bn — CRE-F2 | 3 |
| MEDS | Medicine-shortage emergency; CMS reform — HLT-F2, HLT-F3 | 6 |
| PHARMA | Local pharma manufacturing incentives (in design) — HLT-F4 | 2 |
| DTEF | Tertiary sponsorship (44,506 students) — EDU-F2 | 4 |
| TVET | Rapid Skills Development / TVET satellites — EDU-F6 | 13 |
| BQA | BQA accreditation — EDU-F4 | 2 |
| EIA | Economic Inclusion Act 2021 (targeted citizens, localisation, preferences) — MAC-F20 | 3 |
| CITRES | Citizen-reserved activities (Jun 2020 list; 35 service sectors) — MAC-F21, MAC-F23 | 10 |
| PPREF | Citizen procurement preferences (PPA s.74; youth fee discounts) — MAC-F22 | 6 |
| AFCFTA | AfCFTA — TRD-F5 | 4 |
| AGOA | AGOA to 31 Dec 2026 — TRD-F6 | 1 |
| GCF | Green Climate Fund portfolio — GRN-F4 | 5 |
| ART6 | Article 6 carbon framework (pending) — GRN-F5 | 1 |
| H2 | Green hydrogen feasibility study — GRN-F3 | 2 |
| CREATIVE | National Creative Industry Expansion Programme; Film Commission — CSP-F4 | 3 |
| IFSC | IFSC 15 % tax regime — CSP-F6 | 3 |
| BPO | BPO investment (CCI Global) — CSP-F5 | 2 |
| EVENTS | International event hosting — CSP-F1 | 6 |

# PART C — AIIM Botswana as a One-Stop Shop \[PROPOSED\]

The features from DZ-1.0 are rebuilt for Botswana (pula/rand view, citizen-reserved filter, corridor distance). OS-73 to OS-80 are new. That makes 80 features in total.

| \# | Feature | User problem it solves | How it works in AIIM Botswana | Gate |
| :-: | :-: | :-: | :-: | :-: |
| OS-01 | Ticket-Size Opportunity Marketplace | Small investors cannot find deals | Band, unit, town, persona, citizen-reserved flag, FX flag, freshness-gated tier | Free browse |
| OS-02 | Invest-in-a-Box packs | First-time investors | S-band packs with tornado and equity IRR | Paid pack |
| OS-03 | District and Town Profiles | National data hides local opportunity | 16 admin units with Census 2022 population; 83 pinned towns/points | Free/paid |
| OS-04 | Pula Crawl Navigator | Crawling peg vs rand | Scenarios for crawl and rand moves | Free/paid |
| OS-05 | Land and Site Concierge | Tribal, state and freehold land | Land-board and SEZ routes | Paid |
| OS-06 | BITC One-Stop Pathway | Approvals | BITC service-centre sequence | Free summary |
| OS-07 | Verified Opportunity Badge | Phantom deals | Field verification and title check | Paid |
| OS-08 | Co-investment Syndicate Rooms | Small tickets | Pooling with escrow | Paid |
| OS-09 | Diaspora Desk | Batswana abroad | Curated S-band deals | Paid |
| OS-10 | Anchor-Project Supplier Map | SMEs miss procurement | Khoemacau, Mmamabula, solar IPPs, depots, NSC, roads, Kazungula | Free/paid |
| OS-11 | Commodity Price Board | Price opacity | Cattle, vegetables, phane, fuel | Free |
| OS-12 | Landed-Cost and Netback Calculator | Landlocked corridors | Walvis Bay/Durban, borders, SACU | Paid |
| OS-13 | English/Setswana interface | Language | Bilingual UI | Included |
| OS-14 | Citizen Partner Matchmaker | Reserved activities and preferences | Vetted citizen partners and JV structuring | Paid |
| OS-15 | Finance Finder | Capital | Banks, CEDA, BDC, NDB, DFIs, GCF | Paid |
| OS-16 | Escrow and Milestones | Remote trust | Milestone release | Fee |
| OS-17 | Drought and FMD Alerts | Water and disease shocks | Dam levels, FMD zones | Free |
| OS-18 | Aftercare Desk | Post-investment issues | BITC aftercare | Free |
| OS-19 | Policy Watch | Rule changes | Alerts and re-scoring | Paid |
| OS-20 | Impact and ESG Matcher | Impact metrics | Youth jobs, water, renewables | Free/paid |
| OS-21 | Data Rooms | Documents | NDA rooms | Paid |
| OS-22 | Field Scouts | Data gaps | Scouts in 16 units | Internal |
| OS-23 | Business-plan Generator | Bankable plans | After-tax, tornado, equity IRR | Paid |
| OS-24 | Trade Window | Rules of origin | SACU, SADC, AfCFTA, EPA, AGOA | Paid |
| OS-25 | Incentive Estimator | Incentive uncertainty | 15 % manufacturing/IFSC; SEZ | Paid |
| OS-26 | SEZ Desk | Zone entry | Lobatse, Selebi Phikwe, SSKIA zones | Paid |
| OS-27 | Export Compliance Desk | Beef re-listing | BAITS, EU/UK requirements | Paid |
| OS-28 | Solar and Storage Desk | IRP 50 % target | IPP pipeline, mine PPAs | Paid |
| OS-29 | Water Supplier Desk | WUC programmes | Network and O\&M contracts | Paid |
| OS-30 | Health Supply-Chain Desk | Medicine shortages | CMS reform contracts | Paid |
| OS-31 | Import-Substitution Radar | SA dependence | Import lines vs local capacity | Free/paid |
| OS-32 | Town Pinning | Sites can’t be found | Town point → locality (DG) → P1 | Included |
| OS-33 | Title Search | Land disputes | Land-board and deeds searches | Paid |
| OS-34 | Water-Stress Overlay | Drought | Dams, NSC, boreholes | Free/paid |
| OS-35 | Skills Partnership Desk | Youth unemployment 28.9 % | TVET, DTEF, BQA partners | Paid |
| OS-36 | Corridor Window | Landlocked logistics | Kazungula, Trans-Kalahari, North-South | Paid |
| OS-37 | Shock-Exposure Simulator | Shocks differ by sector | Diamonds, SA, fiscal, water, FMD, rates | Free/paid |
| OS-38 | Traceable Scoring View | Opaque scores | Fact, instrument, freshness gate | Free |
| OS-39 | Capacity and Incumbent Check | Gap may be filled | Named incumbents | Paid |
| OS-40 | Precedent Deal Register | Unrealistic tickets | Sourced deals with status | Paid |
| OS-41 | SOE Partner Map | BPC, WUC, Debswana, ODC, BMC | Entry points | Paid |
| OS-42 | Monetary Monitor | Rate shock (+200 bp) | MoPR, inflation, crawl | Free/paid |
| OS-43 | Corridor and Rail Tracker | Transit volumes | Rail tonnes, border flows | Free |
| OS-44 | Diamond Cycle Tracker | Revenue swings | Debswana output, ODC sales | Paid |
| OS-45 | Gazetteer and Arithmetic QA Flags | Dataset errors | E.g. Gaborone population 647 in dataset | Included |
| OS-46 | Data-Gap Board (closed and open) | Gaps never close | Closure log + open gaps with plan | Free |
| OS-47 | Tourism Capacity Planner | Arrivals +29.6 % | Beds vs demand | Paid |
| OS-48 | Bilingual Market Names | Search mismatch | English/Setswana search | Included |
| OS-49 | Regulatory-Change Monitor (impact-scored) | Rule changes | \+ / − impact and templates affected | Included |
| OS-50 | Grant and Subsidy Calculator | Incentives | CEDA, GCF, sandbox | Free |
| OS-51 | Licence Pathway | New entrants | Permit sequence by sector | Paid |
| OS-52 | Value-Capture Desk | Raw exports | Diamonds, copper, beef, phane | Paid |
| OS-53 | Event Supplier Map | Events | Relays legacy, conferences | Free/paid |
| OS-54 | Lead Tracker | Leads go stale | Next action, institution to call, owner, date | Included |
| OS-55 | Cross-Country Benchmark (dated) | Comparison | Eight AIIM countries | Free |
| OS-56 | Time-to-Revenue Filter | Patience | Explicit per template | Free |
| OS-57 | Ownership Navigator | Citizen rules | Reserved activities, preferences, mining stake | Paid |
| OS-58 | Permit Pathway | Approval risk | Issuer, permit, time | Paid |
| OS-59 | Regulatory Watch | Policy reversals | Horticulture bans, beef suspension, tax | Free/paid |
| OS-60 | Public-Payment Risk Overlay | Arrears (e.g. US$75 m to private health providers) | Payment-risk flags | Free/paid |
| OS-61 | Ranked Town Leads (demand-weighted) | Coverage is not signal | Census-weighted, corridor-aware, no rotation | Included |
| OS-62 | Investor Persona Filter | One list for all | SME, DFI, corporate, fund, trader, diaspora | Free |
| OS-63 | Robustness Badge | Fragile scores | Score 12 Tier A | Included |
| OS-64 | CPDS Validator | Replication | Automated CPDS-1.2 checks | Internal |
| OS-65 | Dual-Currency View (pula/rand) | Rand-linked costs | Values in BWP, USD and ZAR | Included |
| OS-66 | Citizen-Reserved Filter | Foreigners blocked from reserved lines | Explicit flag per template | Free |
| OS-67 | New-Policy Early-Mover Desk | New government (2024) | Policy shifts and new programmes | Paid |
| OS-68 | Corridor-Distance Score | Landlocked | Distance to 6 gateways \[COMPUTED\] | Included |
| OS-69 | Verification Log Viewer | Trust | Random second-pass checks | Free |
| OS-70 | Import-Restriction Planner | Horticulture bans | Product list and status | Paid |
| OS-71 | Repatriation Note | No exchange controls | Simple repatriation; tax only | Free |
| OS-72 | Investment Envelope (demand-weighted) | Where money goes | Envelope weighted by lead score × population | Free |
| OS-73 | Freshness-Gated Tiering | Old facts inflate tiers | Tier A needs a fact ≤18 months old | Included |
| OS-74 | Tornado Sensitivity | Single-point plans | Price, volume, capex ±20 % IRR swing | Included |
| OS-75 | Equity-IRR Calculator | Financing ignored | 50 % debt at prime + 3 pp | Included |
| OS-76 | Diamond-Downturn Re-tiering | Country-level shock | Re-scores all templates under a diamond downturn | Free |
| OS-77 | Random Verification Sampler | Hand-picked checks | Seeded, stratified sample per sector | Internal |
| OS-78 | Gap-Closure Ledger | Gaps never closed | Gaps closed during this issue | Free |
| OS-79 | Institution-to-Call Directory | Next actions vague | Named institution per hotspot lead | Included |
| OS-80 | Semantic Validator Checks | Structural QA only | Freshness, gate, envelope sums, duplicates | Internal |

# PART D — Botswana Geography: 16 Units with Census 2022 Populations, 83 Pinned Places, 6 Border Gateways, Hotspots, Institutions

Units. Botswana’s first level has 10 districts and 6 city/town councils (Gaborone, Francistown, Lobatse, Selebi Phikwe, Jwaneng, Sowa Town). Census 2022 counts 2,359,609 people (BW-MAC-F17); the 16 units below sum to 2,350,961 because Orapa (8,648) is administered separately. Below L1, sub-districts and localities are not loaded (DG-13); towns stand in for them.

## D-1 Units

| Code | Unit | Kind | Population (Census 2022) | Share | Point | Places | Templates | Tier A | Envelope US$ m (weighted) \[COMPUTED\] |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| CE | Central | district | 652,085 | 27.7 % | \-21.479, 26.215 | 33 | 135 | 42 | 7.5 |
| KW | Kweneng | district | 387,983 | 16.5 % | \-23.903, 24.921 | 13 | 137 | 33 | 5.6 |
| GA | Gaborone | city | 246,325 | 10.5 % | \-24.658, 25.912 | 1 | 181 | 51 | 24.7 |
| SO | Southern | district | 221,928 | 9.4 % | \-24.8, 24.58 | 4 | 95 | 26 | 2.7 |
| NW | North-West | district | 198,436 | 8.4 % | \-19.389, 23.268 | 5 | 142 | 39 | 6.3 |
| KL | Kgatleng | district | 121,882 | 5.2 % | \-24.134, 26.418 | 4 | 106 | 28 | 1.5 |
| SE | South-East | district | 111,440 | 4.7 % | \-24.656, 26.058 | 5 | 129 | 28 | 1.9 |
| FR | Francistown | city | 103,417 | 4.4 % | \-21.174, 27.512 | 1 | 185 | 51 | 9.5 |
| NE | North-East | district | 69,352 | 2.9 % | \-21.024, 27.515 | 4 | 112 | 34 | 0.3 |
| KG | Kgalagadi | district | 58,857 | 2.5 % | \-24.849, 21.788 | 6 | 106 | 31 | 0.4 |
| GH | Ghanzi | district | 56,555 | 2.4 % | \-21.697, 21.646 | 2 | 132 | 42 | 1.4 |
| SP | Selibe Phikwe | town | 42,488 | 1.8 % | \-21.976, 27.84 | 1 | 56 | 10 | 0.9 |
| LO | Lobatse | town | 29,772 | 1.3 % | \-25.217, 25.667 | 1 | 59 | 13 | 0.6 |
| CH | Chobe | district | 28,743 | 1.2 % | \-18.5, 25.0 | 1 | 68 | 14 | 0.0 |
| JW | Jwaneng | town | 18,784 | 0.8 % | \-24.602, 24.728 | 1 | 22 | 7 | 0.3 |
| ST | Sowa Town | town | 2,914 | 0.1 % | \-20.564, 26.224 | 1 | 32 | 6 | 0.0 |
| Total | 2,350,961 | 100 % | 83 | 64 |  |  |  |  |  |

## D-2 Border gateways (Botswana has no sea port) \[COMPUTED\]

Each place is assigned to its nearest gateway by straight-line (haversine) distance. Gateways are proxied by the nearest dataset town. Road distance is longer.

| Gateway | Places nearest | Mean distance km |
| :-: | :-: | :-: |
| Kazungula Bridge OSBP (proxy: Kasane) | 3 | 150 |
| Tlokweng Gate (proxy: Tlokweng) | 21 | 48 |
| Ramatlabama/Pioneer Gate (proxy: Lobatse) | 10 | 127 |
| Mamuno / Trans-Kalahari (proxy: Ghanzi) | 10 | 195 |
| Ramokgwebana (proxy: Francistown) | 20 | 121 |
| Martin’s Drift (proxy: Machaneng) | 19 | 73 |

Places more than 250 km from any gateway: Gweta (261), Hukuntsi (256), Lehututu (253), Maun (265), Mopipi (273), Rakops (291), Shakawe (356), Tshabong (336).

## D-3 Places (L3) — the 40 largest (all 83 are in BW\_Towns)

| Place | Unit | Kind | Lat, lon | Population | Nearest gateway | km |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Gaborone | Gaborone | town | \-24.762, 25.799 | 246,325 | Tlokweng Gate | 20 |
| Francistown (council point) | Francistown | council point | \-21.174, 27.512 | 103,417 | Ramokgwebana | 0 |
| Mogoditshane | Kweneng | town | \-24.627, 25.866 | 88,098 | Tlokweng Gate | 12 |
| Maun | North-West | town | \-19.983, 23.417 | 85,350 | Mamuno / Trans-Kalahari | 265 |
| Molepolole | Kweneng | town | \-24.407, 25.495 | 67,598 | Tlokweng Gate | 56 |
| Tlokweng | South-East | town | \-24.669, 25.971 | 55,508 | Tlokweng Gate | 0 |
| Palapye | Central | town | \-22.546, 27.125 | 52,636 | Martin’s Drift | 80 |
| Mahalapye | Central | town | \-23.104, 26.814 | 48,431 | Martin’s Drift | 70 |
| Kanye | Southern | town | \-24.967, 25.333 | 48,028 | Ramatlabama/Pioneer Gate | 44 |
| Serowe | Central | town | \-22.388, 26.711 | 47,447 | Martin’s Drift | 119 |
| Mochudi | Kgatleng | town | \-24.417, 26.15 | 44,339 | Tlokweng Gate | 33 |
| Selibe Phikwe (council point) | Selibe Phikwe | council point | \-21.976, 27.84 | 42,488 | Ramokgwebana | 95 |
| Letlhakane | Central | town | \-21.415, 25.593 | 36,404 | Ramokgwebana | 201 |
| Ramotswa | South-East | town | \-24.872, 25.87 | 33,271 | Tlokweng Gate | 25 |
| Lobatse (council point) | Lobatse | council point | \-25.217, 25.667 | 29,772 | Ramatlabama/Pioneer Gate | 0 |
| Mmopone | Kweneng | town | \-24.567, 25.874 | 25,460 | Tlokweng Gate | 15 |
| Thamaga | Kweneng | town | \-24.67, 25.54 | 25,300 | Tlokweng Gate | 44 |
| Mosopa | Southern | town | \-24.772, 25.422 | 23,858 | Ramatlabama/Pioneer Gate | 55 |
| Tonota | Central | town | \-21.442, 27.462 | 23,296 | Ramokgwebana | 30 |
| Bobonong | Central | town | \-21.966, 28.436 | 21,216 | Ramokgwebana | 130 |
| Gabane | Kweneng | town | \-24.667, 25.782 | 20,018 | Tlokweng Gate | 19 |
| Ghanzi | Ghanzi | town | \-21.698, 21.646 | 19,012 | Mamuno / Trans-Kalahari | 0 |
| Jwaneng (council point) | Jwaneng | council point | \-24.602, 24.728 | 18,784 | Ramatlabama/Pioneer Gate | 117 |
| Janeng | South-East | town | \-25.417, 25.55 | 16,853 | Ramatlabama/Pioneer Gate | 25 |
| Kopong | South-East | town | \-24.483, 25.883 | 13,823 | Tlokweng Gate | 23 |
| Tshabong | Kgalagadi | town | \-26.05, 22.45 | 11,651 | Ramatlabama/Pioneer Gate | 336 |
| Metsemotlhaba | Kweneng | town | \-24.551, 25.803 | 11,617 | Tlokweng Gate | 21 |
| Shakawe | North-West | town | \-18.365, 21.842 | 10,589 | Kazungula Bridge OSBP | 356 |
| Bokaa | Kgatleng | town | \-24.45, 26.017 | 9,146 | Tlokweng Gate | 25 |
| Orapa | Central | town | \-21.311, 25.376 | 8,648 | Ramokgwebana | 222 |
| Letlhakeng | Kweneng | town | \-24.094, 25.03 | 8,343 | Tlokweng Gate | 115 |
| Nata | Central | town | \-20.217, 26.183 | 7,779 | Ramokgwebana | 174 |
| Otse | South-East | town | \-25.017, 25.733 | 6,986 | Ramatlabama/Pioneer Gate | 23 |
| Kang | Kgalagadi | town | \-23.675, 22.788 | 6,764 | Mamuno / Trans-Kalahari | 249 |
| Sefophe | Central | town | \-22.183, 27.967 | 6,001 | Ramokgwebana | 122 |
| Masunga | North-East | town | \-20.625, 27.449 | 5,696 | Ramokgwebana | 61 |
| Gweta | Central | town | \-20.183, 25.233 | 5,303 | Ramokgwebana | 261 |
| Hukuntsi | Kgalagadi | town | \-23.999, 21.78 | 5,224 | Mamuno / Trans-Kalahari | 256 |
| Lenchwe Le Tau | Kweneng | town | \-24.383, 25.85 | 4,992 | Tlokweng Gate | 34 |
| Mathambgwane | Central | town | \-20.991, 27.332 | 4,675 | Ramokgwebana | 28 |

Population is the Census 2022 council figure for council seats and council points, and the dataset figure for other towns.

## D-4 Named evidence hotspots with status (42/42 exact place matches)

| Hotspot | Place | Unit | Status | Evidence (grade) | Institution to call |
| :-: | :-: | :-: | :-: | :-: | :-: |
| Debswana Jwaneng mine | Jwaneng (council point) | Jwaneng | Operating — output cut | BW-MIN-F1 (3) | Mine procurement office (Debswana, MMG, Sandfire) |
| Debswana Orapa mine | Orapa | Central | Operating — output cut | BW-MIN-F1 (3) | Mine procurement office (Debswana, MMG, Sandfire) |
| Letlhakane / Karowe (Lucara) diamond cluster | Letlhakane | Central | Operating | BW-MIN-F1 (3) | Mine procurement office (Debswana, MMG, Sandfire) |
| Khoemacau copper expansion (US$900 m) \[proxy town\] | Sehithwa | North-West | Expansion approved | BW-MIN-F4 (3) | Mine procurement office (Debswana, MMG, Sandfire) |
| Motheo copper mine (Sandfire) | Ghanzi | Ghanzi | Operating | BW-MIN-F3 (3) | Mine procurement office (Debswana, MMG, Sandfire) |
| Morupule A/B power and coal mine | Palapye | Central | Operating — one unit | BW-ENR-F1 (3) | BPC procurement / IPP unit |
| Mmamabula 600 MW coal IPP \[proxy town\] | Mahalapye | Central | Under construction | BW-ENR-F4 (3) | BPC procurement / IPP unit |
| Jwaneng 100 MW solar | Jwaneng (council point) | Jwaneng | Commissioning | BW-ENR-F6 (2) | BPC procurement / IPP unit |
| Mmadinare 100 MW solar \[proxy: Selebi Phikwe\] | Selibe Phikwe (council point) | Selibe Phikwe | Under construction | BW-GRN-F2 (3) | MME renewables unit |
| Tlou Lesedi CBM (first gas sales) \[proxy town\] | Serowe | Central | Early production | BW-OGS-F6 (2) | Botswana Oil |
| Francistown fuel depot expansion | Francistown (council point) | Francistown | Under construction | BW-OGS-F2 (3) | Botswana Oil |
| Ghanzi 30 Ml fuel depot | Ghanzi | Ghanzi | Planned | BW-OGS-F2 (3) | Botswana Oil |
| Lobatse Meat & Leather City SEZ | Lobatse (council point) | Lobatse | Operating — expanding | BW-MFG-F3 (3) | SEZA / BITC |
| BMC Lobatse beef chain | Lobatse (council point) | Lobatse | Operating — EU suspended | BW-AGR-F5 (2) | DVS district office; BMC |
| FMD outbreak zone, Barolong \[proxy town\] | Kanye | Southern | Outbreak — export suspension | BW-AGR-F2 (3) | DVS district office; BMC |
| Pandamatenga commercial farms | Pandamatenga | North-West | Operating | BW-AGR-F4 (3) | DVS district office; BMC |
| Okavango Delta tourism (Maun gateway) | Maun | North-West | Operating | BW-TOU-F1 (3) | BTO |
| Chobe tourism (Kasane) | Kasane | Chobe | Operating | BW-TOU-F2 (3) | BTO |
| Kazungula Bridge OSBP (24-hour move) | Kasane | Chobe | Operating — expanding | BW-TRN-F3 (3) | Kazungula Bridge Authority / Botswana Railways |
| Mosetse–Kazungula–Livingstone rail | Mosetse | Central | Studies to end-2026 | BW-TRN-F4 (2) | Kazungula Bridge Authority / Botswana Railways |
| SSKIA Gaborone airport | Gaborone | Gaborone | Operating | BW-TRN-F2 (3) | Kazungula Bridge Authority / Botswana Railways |
| Francistown rail hub | Francistown (council point) | Francistown | Operating | BW-TRN-F1 (3) | Kazungula Bridge Authority / Botswana Railways |
| NSC 2.2 / Mmamashia treatment plant | Gaborone | Gaborone | Substantially complete | BW-WSW-F3 (3) | WUC procurement |
| Gaborone Dam | Gaborone | Gaborone | Operating — volatile | BW-WSW-F4 (3) | WUC procurement |
| Lesotho–Botswana water transfer (feasibility) | Lobatse (council point) | Lobatse | Feasibility | BW-WSW-F5 (3) | WUC procurement |
| BTC 5G launch (Gaborone) | Gaborone | Gaborone | Launching Oct 2026 | BW-ICT-F4 (2) | BTC / BoFiNet |
| BoFiNet local-access fibre (Ramotswa) | Ramotswa | South-East | Operating | BW-ICT-F5 (2) | BTC / BoFiNet |
| BoFiNet local-access fibre (Thamaga) | Thamaga | Kweneng | Operating | BW-ICT-F5 (2) | BTC / BoFiNet |
| Botswana Stock Exchange | Gaborone | Gaborone | Operating | BW-FIN-F4 (3) | Bank of Botswana sandbox team |
| Okavango Diamond Company sales | Gaborone | Gaborone | Operating | BW-MFG-F4 (3) | SEZA / BITC |
| Diamond cutting and polishing cluster | Gaborone | Gaborone | Operating — shrinking | BW-MFG-F5 (2) | SEZA / BITC |
| National Stadium (World Athletics Relays 2026) | Gaborone | Gaborone | Event held 2026 — legacy | BW-CSP-F1 (3) | Ministry of Sport and Arts |
| Sir Ketumile Masire Teaching Hospital | Gaborone | Gaborone | Transition to public | BW-HLT-F6 (3) | CMS / Ministry of Health |
| Kazungula TVET satellite centre | Kasane | Chobe | Planned 2026/27 | BW-EDU-F6 (3) | MoHE / BQA |
| Phane harvesting (Tshimoyapula area) \[proxy town\] | Serowe | Central | Seasonal | BW-FOR-F2 (3) | DFRR district office |
| Chobe forest reserves | Kasane | Chobe | Gazetted | BW-FOR-F3 (3) | DFRR district office |
| Okavango panhandle fishery | Shakawe | North-West | Operating | BW-BLU-F3 (3) | Department of Wildlife and National Parks (fisheries) |
| Francistown–Nata road reconstruction | Nata | Central | Under way | BW-CRE-F3 (3) | PPRA-registered procuring entity; BHC |
| Palapye–Martin’s Drift road reconstruction | Palapye | Central | Under way | BW-CRE-F3 (3) | PPRA-registered procuring entity; BHC |
| Social housing (Gaborone) | Gaborone | Gaborone | Funded 2026/27 | BW-CRE-F4 (3) | PPRA-registered procuring entity; BHC |
| Mogoditshane–Gaborone growth corridor housing | Mogoditshane | Kweneng | Operating | BW-CRE-F5 (3) | PPRA-registered procuring entity; BHC |
| Gaborone private hospitals and medical aid | Gaborone | Gaborone | Operating | BW-HLT-F6 (3) | CMS / Ministry of Health |

## D-5 Institutions

| Role | Botswana institution |
| :-: | :-: |
| Investment promotion | BITC (Botswana Investment and Trade Centre) |
| Special economic zones | SEZA |
| Citizen empowerment | Economic Empowerment Office (Economic Inclusion Act 2021); CEDA (finance) |
| Central bank | Bank of Botswana |
| Finance | Ministry of Finance; BURS (tax and customs) |
| Statistics | Statistics Botswana |
| Procurement | PPRA (Public Procurement Regulatory Authority) \[VERIFY name\] |
| Minerals and energy | Ministry of Minerals and Energy |
| Diamonds | Debswana (50:50 GoB–De Beers); Okavango Diamond Company; DTC Botswana; Diamond Hub |
| Mining companies | Sandfire (Motheo); MMG (Khoemacau); Lucara (Karowe); Morupule Coal Mine |
| Electricity | Botswana Power Corporation (BPC) |
| Energy regulator | BERA (Botswana Energy Regulatory Authority) |
| Fuels | Botswana Oil Ltd |
| Water | Water Utilities Corporation; Department of Water and Sanitation |
| Agriculture | Ministry of Lands and Agriculture; BMC (Botswana Meat Commission); Department of Veterinary Services |
| Fisheries and forestry | Ministry of Environment and Tourism; Department of Forestry and Range Resources |
| Tourism | Botswana Tourism Organisation (BTO) |
| Transport | Ministry of Transport and Infrastructure; Botswana Railways; Air Botswana; CAAB; Kazungula Bridge Authority |
| Telecoms | BOCRA; BTC; Mascom; Orange; BoFiNet |
| Housing | Botswana Housing Corporation |
| Health | Ministry of Health; Central Medical Stores; BOMRA (medicines regulator) |
| Education | Ministry of Higher Education; BQA; HRDC; DTEF |
| Capital markets | Botswana Stock Exchange; NBFIRA |
| Pensions | BPOPF; NBFIRA |
| Development finance | CEDA; NDB; BDC; Botswana Development Corporation |
| Export credit | BEDIA \[VERIFY\]; Export Credit Insurance (BECI) |
| Standards | BOBS (Botswana Bureau of Standards) |
| Competition | Competition and Consumer Authority |
| Courts | High Court; Industrial Court |
| Land | Land Boards; Department of Lands |
| Climate | Department of Meteorological Services; Climate Change unit \[VERIFY\] |
| Sport and arts | Ministry of Sport and Arts; Botswana National Sport Commission; Film Commission |
| Local government | District councils; city/town councils (Gaborone, Francistown, Lobatse, Selebi Phikwe, Jwaneng, Sowa) |
| Customs union | SACU |
| Regional | SADC Secretariat (Gaborone) |
| Innovation | Botswana Digital & Innovation Hub |
| Skills | Botswana Training Authority successor (BQA) \[VERIFY\]; brigades/TVET colleges |
| Labour | Ministry of Labour and Home Affairs |
| Rural | Local Enterprise Authority (LEA) |
| Leather/meat SEZ | Lobatse Meat & Leather City (SEZA) |
| Diamond regulation | Diamond Hub; Kimberley Process office \[VERIFY\] |
| Meat regulation | Meat Industry Regulatory Authority \[VERIFY status\] |
| Tourism training | Botswana Tourism Organisation academy \[VERIFY\] |
| Air navigation | CAAB |
| Roads | Roads Department |
| Mining regulation | Department of Mines |
| Geoscience | Botswana Geoscience Institute |
| Water regulation | Water Resources Board \[VERIFY\] |
| Investment protection | Investment promotion law and BITs \[VERIFY\] |
| Diaspora | Ministry of International Relations (diaspora desk) \[VERIFY\] |

# PART E — Botswana Product, Species and Mineral Register (English and Setswana)

These are additions to the 85 Issue 2.0 commodities, which all stay in the workbook. Setswana names are to be validated (DG-14).

## Minerals

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Rough diamonds (gem) | Diamane | 7102.31 | MIN | 72.6 % of 2025 exports |
| Industrial diamonds | Diamane tsa madirelo | 7102.21 | MIN | \[VERIFY share\] |
| Polished diamonds | Diamane e e kgabisitsweng | 7102.39 | MFG | Beneficiation |
| Copper concentrate | Kopore | 2603.00 | MIN | Motheo 45,379 t; Khoemacau 37,468 t (to Nov 2025) |
| Silver (in concentrate) | Selefera | 2616.10 | MIN | \>4 Moz from Khoemacau expansion |
| Coal | Malatlha | 2701.12 | MIN | Morupule 2.2 Mt |
| Soda ash | Soda ash | 2836.20 | MIN | Sowa \[VERIFY data\] |
| Salt | Letswai | 2501.00 | MIN | Sowa \[VERIFY data\] |
| Nickel (care and maintenance) | Nikele | 2604.00 | MIN | BCL closed \[VERIFY\] |
| Gold | Gauta | 7108.12 | MIN | Small-scale \[VERIFY\] |
| Coal-bed methane | Gase | 2711.21 | OGS | Tlou first sales 2026 |
| Aggregates and sand | Motlhaba | 2517.10 | CRE | Construction input |
| Polished jewellery | Dikgabisa | 7113.19 | MFG | Tourist retail |

## Fish

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Tilapia (three-spot, Okavango) | Tlhapi | 0302.71 | BLU | Local catch |
| Sharptooth catfish | Tlhapi ya Nnyelele \[VERIFY\] | 0302.72 | BLU | Okavango |
| Tigerfish (sport) | Tlhapi ya nkwe \[VERIFY\] | 0302.89 | BLU | Angling tourism |
| Bream (Oreochromis) | Tlhapi | 0302.71 | BLU | Aquaculture |
| Frozen hake (imported) | Tlhapi e e gatsetsweng | 0303.66 | BLU | Import substitution target |
| Canned fish (imported) | Tlhapi ya mo thineng | 1604.13 | BLU | Imports \>90 % |
| Fish feed | Dijo tsa ditlhapi | 2309.90 | BLU | Aquaculture input |
| Fingerlings | Ditlhapinyana | 0301.99 | BLU | Hatchery |
| Mopane worms (phane) | Phane | 0410.90 | FOR | Export permit P2,200 |
| Dried fish | Tlhapi e e omisitsweng | 0305.59 | BLU | Trade with Zambia/Namibia \[VERIFY\] |

## Agriculture

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Beef | Nama ya kgomo | 0201.30 | AGR | EU/UK suspended (FMD) |
| Live cattle | Dikgomo | 0102.29 | AGR | P523 m exports (2024) |
| Goats | Dipudi | 0104.20 | AGR | 1.27 m |
| Sorghum | Mabele | 1007.90 | AGR | Citizen-reserved milling |
| Maize | Mmidi | 1005.90 | AGR | Pandamatenga |
| Tomatoes | Ditamati | 0702.00 | AGR | Import restriction |
| Potatoes | Ditapole | 0701.90 | AGR | Import restriction |
| Onions | Dieie | 0703.10 | AGR | Import restriction |
| Hides and skins | Matlalo | 4101.20 | AGR | Lobatse leather |
| Milk | Mashi | 0401.10 | AGR | Sour milk citizen-reserved |
| Poultry | Dikoko | 0207.11 | AGR | Domestic |
| Game meat | Nama ya diphologolo | 0208.90 | AGR | Value chain |

## Forest

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Marula | Morula | 2009.89 | FOR | Veld product |
| Devil’s claw | Sengaparile | 1211.90 | FOR | Veld product |
| Firewood | Dikgong | 4401.11 | FOR | 29.7 % of households |
| Timber (imported) | Ditlhare | 4407.11 | FOR | HS44 imports US$66.3 m (2023) |
| Mopane wood | Mophane | 4403.99 | FOR | Fuelwood |

## Energy

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Electricity | Motlakase | 2716.00 | ENR | Imports ≈35–43 % |
| Diesel | Diesele | 2710.19 | OGS | 55 % of fuel use |
| Solar modules | Diphanele tsa letsatsi | 8541.43 | ENR | 104 MW operating |

## Industry

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Car wiring harnesses | Megala ya dikoloi | 8544.30 | MFG | Lobatse SEZ (303 jobs) |
| Leather goods | Dilwana tsa letlalo | 4202.21 | MFG | Lobatse SEZ |
| Bottled water | Metsi a mo dibotlolong | 2201.10 | MFG | Citizen-reserved |
| Bread and confectionery | Borotho | 1905.90 | MFG | Citizen-reserved |
| Peanut butter | Botoro jwa ditloomo | 2008.11 | MFG | Citizen-reserved |
| Ice | Kgapetla | 2201.90 | MFG | Citizen-reserved |
| Animal feed | Dijo tsa diphologolo | 2309.90 | AGR | Herd rebuild |

## Services

| Product | Setswana \[VERIFY\] | HS 2022 | Sector | Botswana note |
| :-: | :-: | :-: | :-: | :-: |
| Tourism (safari) | Bojanala | — | TOU | P9.2 bn inbound spend (2024) |
| BPO / customer service | Ditirelo tsa BPO | — | CSP | CCI Global deal |
| Financial services (IFSC) | Ditirelo tsa madi | — | FIN | 15 % tax regime |
| Education services | Thuto | — | EDU | 60,287 tertiary students |
| Logistics (Kazungula corridor) | Dipalangwang | — | TRN | 400 → 1,000 trucks/day capacity |

# PART F — 18 Sector Worked Examples for Botswana (Investor and Trader)

Each sector section has the same parts:

Scenarios

Graded facts

Investor chain

Trader chain

Map stack

Levels

Extras

Anchors

Sweep with freshness gate, citizen-reserved flag, FX-earner flag, persona and time to revenue

Products

Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

## E1. Energy & Power (ENR)

(a) Scenarios

Investor: solar IPPs, storage and mine power as BPC imports ≈35–43 % of supply

Trader: PV kit, inverters, batteries

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ENR-F1 | Electricity demand and import share | Imports account for approximately 35% of national electricity demand; peak demand about 700 MW; annual consumption approx. 4,800 GWh; effective base load from Morupule A and B averages 400 MW (510 MW peak day). Target: local generation to meet at least 72% of demand on a sustained basis (Minister Bogolo Kenewendo, Committee of Supply, 4 Mar 2026) | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-ENR-F2 | Generation vs imports, 2025 (Statistics Botswana) | 2025 annual: local generation 2,515,250 MWh; imports 1,863,853 MWh (+34.6% y/y); distribution 4,379,103 MWh (-9.0%) -\> imports \~42.6% of distributed power (derived). Q4 2025: local generation 751,514 MWh (-11.6% y/y), of which Morupule A and B coal 716,520 MWh (95.3%), solar 33,989 MWh (4.5%); imports 313,630 MWh (-12.1% y/y) | [Statistics Botswana - Electricity Generation and Distribution Stats Brief Q4 2025](https://statsbots.org.bw/sites/default/files/Electricity%20Generation%20and%20%20Distribution%20Q4%202025.pdf) | 2026-04 | 3 |
| BW-ENR-F3 | Solar build-out and IRP renewables target | 104 MW of grid-connected solar PV in commercial operation; 100 MW Jwaneng solar expected at commercial operation July 2026 (with 100 MW Mmadinare); IRP revised to raise renewables from 30% to 50% of the energy mix by 2030; BESS of 50 MW (25 MW Mmadinare + 25 MW Jwaneng) at tender preparation | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-ENR-F4 | Mmamabula coal IPP and BPC budget support | 600 MW Mmamabula coal-fired IPP: Phase 1 to deliver 300 MW by Q1 2027. 2026/27 development budget P5,226,626,959 of which electricity P4,823,726,959 (92%), including Botswana Power Corporation support of P3bn; \~P2.8bn (94%) of 2025/26 development spend went to electricity imports | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-ENR-F5 | Eskom debt and 1.5 GW renewables tender | Minister Kenewendo briefed lawmakers: debt to Eskom risen to P2.6bn; Botswana seeking 200 MW supply from South Africa; only one Morupule B (600 MW) unit generating; peak demand about 640 MW; 50 MW solar installation operating; tender for 1.5 GW renewable energy issued (Apr 2025) | [Mining Weekly (Bloomberg)](https://www.miningweekly.com/article/botswana-seeks-new-eskom-power-deal-as-supply-crisis-deepens-2025-04-01) | 2025-04-01 | 3 |
| BW-ENR-F6 | Jwaneng 100 MW solar IPP | Jwaneng 100 MW solar project with 132 kV substation/grid link; built by China Harbour Engineering, China International Water & Electric and Niu Energy; 25-year PPA with BPC signed Aug 2024 | [YourBotswana](https://yourbotswana.com/jwaneng-solar-plant-marks-milestone-in-botswanas-clean-energy-transition/) | 2026-05-31 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Demand | Peak ≈700 MW; 4,800 GWh/yr; imports ≈35 % | Card | F1 | BPC; MME |
| 2 | Supply | 2025 local 2,515 GWh vs imports 1,864 GWh | Chart | F2 | Statistics Botswana |
| 3 | Pipeline | 104 MW solar operating; Jwaneng + Mmadinare 100 MW each | Pins | F3, F6 | MME |
| 4 | Baseload | Mmamabula 300 MW by Q1 2027 | Pin | F4 | MME |
| 5 | Risk | Eskom debt P2.6 bn; one Morupule B unit | Alert | F5 | Bloomberg |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | PV, inverters, batteries | Cards | HS 8541/8507 | BURS |
| 2 | Imports | From SA (SACU) | Route | TRD-F2 | BURS |
| 3 | Standards | BOBS | Brief | — | BOBS |
| 4 | Pricing | Pula crawl | Card | FIN-F2 | BoB |
| 5 | Buyers | Mines, malls, BPC | List | F1 | BPC |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Power plants | L0–L5 | Pin (MW) | Status |
| Transmission | L0–L2 | Line | kV |
| Solar sites | L1–L4 | Pin | Status |
| Off-grid villages | L1–L3 | Point | Access |
| Imports interconnectors | L0 | Line | MW |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Power plants; Transmission; Imports interconnectors |
| L1 District / city or town council | Power plants; Transmission; Solar sites; Off-grid villages |
| L2 Sub-district \[not loaded\] | Power plants; Transmission; Solar sites; Off-grid villages |
| L3 Town / village | Power plants; Solar sites; Off-grid villages |
| L4 Ward / plot | Power plants; Solar sites |
| L5 Site | Power plants |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| BPC procurement calendar | Supplier timing |
| Mine power demand | Captive PPAs |
| Tariff path | C\&I solar economics |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ENR-A01 | Solar EPC subcontracting | BW-GRN-F2 | Jwaneng, Selebi Phikwe | Contractor | M (US$1–5 m) |
| BW-ENR-A02 | Mine solar-plus-storage | BW-MIN-F4 | Ghanzi, North-West | IPP | L (US$5–50 m) |
| BW-ENR-A03 | C\&I rooftop | BW-ENR-F1 | Gaborone, Francistown | ESCO | S (US$0.2–1 m) |
| BW-ENR-A04 | Mmamabula subcontracts | BW-ENR-F4 | Central | Contractor | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 21 templates (sector shock index 5/12; 6 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ENR-S02 | Solar O\&M for IPP plants | S | BW-GRN-F2 (3, 2026-03-04) | 3 | IPPSOLAR (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-ENR-S03 | C\&I rooftop solar for mines and malls (imports ≈35 %) | S | BW-ENR-F1 (3, 2026-03-04) | 3 | IRP (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-ENR-S12 | Solar installer training | S | BW-ENR-F3 (3, 2026-03-04) | 3 | TVET (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-ENR-S14 | Solar water heaters for households | S | BW-ENR-F3 (3, 2026-03-04) | 3 | IRP (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-ENR-S19 | Solar-diesel hybrids for safari lodges | S | BW-ENR-F3 (3, 2026-03-04) | 3 | IRP (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-ENR-S20 | Rural electrification connections contracting | S | BW-ENR-F4 (3, 2026-03-04) | 3 | IRP (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-ENR-S01 | Solar EPC subcontracting (Jwaneng, Mmadinare follow-ons) | M | BW-GRN-F2 (3, 2026-03-04) | 3 | IPPSOLAR (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-ENR-S04 | Battery storage integrator (50 MW BESS programme) | M | BW-GRN-F2 (3, 2026-03-04) | 3 | IPPSOLAR (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 9–18 months |
| BW-ENR-S06 | Mini-grids for remote villages | S | BW-ENR-F3 (3, 2026-03-04) | 3 | IRP (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | DFI | 6–12 months |
| BW-ENR-S07 | Mmamabula IPP construction subcontracts | M | BW-ENR-F4 (3, 2026-03-04) | 3 | MMAMABULA (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-ENR-S09 | Grid substation and line contracting | M | BW-ENR-F4 (3, 2026-03-04) | 3 | IRP (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-ENR-S16 | Solar-plus-storage for mines (diesel displacement) | L | BW-MIN-F4 (3, 2025-12-29) | 3 | IRP (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | INF | 18–30 months |
| BW-ENR-S05 | Solar-pumping for cattle posts and farms | S | BW-ENR-F1 (3, 2026-03-04) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-ENR-S10 | Energy-efficiency retrofits (buildings) | S | BW-ENR-F1 (3, 2026-03-04) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-ENR-S11 | Utility-scale solar IPP (1.5 GW renewables tender) | XL | BW-ENR-F5 (3, 2025-04-01) | 3 | IRP (3) | 10 | B | 8 | No | No | INF | 36–48 months |
| BW-ENR-S15 | Power-trading and wheeling advisory (SAPP) | S | BW-ENR-F5 (3, 2025-04-01) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-ENR-S17 | Electrical contractors’ equipment hire | S | BW-ENR-F4 (3, 2026-03-04) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-ENR-S18 | Transformer refurbishment workshop | S | BW-ENR-F2 (3, 2026-04) | 3 | — (1) | 10 | B | 8 | No | No | SME | 3–6 months |
| BW-ENR-S21 | Grid-stabilisation and power-quality services | S | BW-ENR-F2 (3, 2026-04) | 3 | — (1) | 10 | B | 8 | No | No | SME | 3–6 months |
| BW-ENR-S08 | Power-plant maintenance services (Morupule) | M | BW-ENR-F1 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 3–9 months |
| BW-ENR-S13 | Smart meters and loss reduction (BPC) | M | BW-ENR-F4 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 6–12 months |

(j) Botswana products in scope: Electricity (Motlakase, 2716.00); Solar modules (Diphanele tsa letsatsi, 8541.43)

Issue 2.0 asset types carried over: Hydropower (large, run-of-river, small/mini, pumped storage); Solar PV (utility, C\&I, rooftop) and hybrids; Onshore wind; Gas-to-power (OCGT/CCGT/engines) and LNG-to-power; Coal and clean-coal conversion / repurposing; Biomass, biogas and waste-to-energy; Battery energy storage (BESS); Transmission and interconnectors (ITP); Distribution, municipal utilities and mini-grids; Green hydrogen and derivatives (ammonia, e-fuels); Clean cooking and LPG

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 1; SA dependence (power, imports, rand) 2; Fiscal squeeze 1; Water & drought 0; Livestock disease (FMD) 0; Inflation & rates 1 (index 5/12) |
| Why (evidence-cited) | Power imports ≈35 % and Eskom debt (ENR-F1, ENR-F5); BPC funded by budget (ENR-F4) |
| Diamond downturn | Tier A 6 → A+ 0, A 6, downgraded 0 |
| Citizen-reserved templates | 0 of 21 (BW-MAC-F21, F23) |
| Permits | Generation licence; PPA; EIA — BERA; BPC; DEA; 6–18 months \[VERIFY\] |
| Regulatory changes | R-10 Renewables target raised (+) |
| Institution to call | BPC procurement / IPP unit |
| Verification owner | BPC; MME; BERA |

## E2. Fuels, Strategic Reserves & Coal-bed Methane (OGS)

(a) Scenarios

Investor: fuel depots, storage operations and CBM

Trader: diesel, LPG, lubricants

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-OGS-F1 | Fuel consumption and ADNOC G2G supply | Botswana consumes about 1.3 billion litres of petroleum products annually (diesel 55%, petrol under 45%). G2G contract with ADNOC for supply of 10 million litres per month; Botswana Oil at advanced stage to source bulk products from the Sultanate of Oman | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-OGS-F2 | Strategic fuel reserves and depot build-out | Current strategic stock cover 15 days; to rise to 60 days on completion of Francistown depot expansion (+98 million litres) and new 30 million litre Ghanzi depot by end-2027; Tshele Hills to add 187 million litres; 2026/27 National Oil Security development allocation P300,000,000 | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-OGS-F3 | March 2026 fuel supply shock (Hormuz) | As at 26 Mar 2026: strategic stocks 10.56 days, commercial stocks 24.1 days; government strategic storage 62.5 million litres; Brent averaged US$69.37/bbl in Feb 2026 vs US$97.23/bbl by 26 Mar (peak US$119.50 on 9 Mar); diesel product price US$91.18 -\> US$173.93/bbl (+91%); National Petroleum Fund ‘not in a position to cushion pump prices any longer’ | [Ministry of Minerals and Energy - Fuel Supply Status Update (Minister Kenewendo)](https://botswanaspeaks.gov.bw/media/STATEMENTS/Fuel%20Supply%20Update%20-%2026%20March%202026.pdf) | 2026-03-26 | 3 |
| BW-OGS-F4 | BERA pump price increase, Mar 2026 | Effective 00:01 Sat 28 Mar 2026: Unleaded Petrol 95 +505 thebe/litre; Diesel 50ppm +877 thebe/litre; Illuminating Paraffin +1,055 thebe/litre; international refined prices Feb-\>Mar: petrol +59.7%, diesel +90.8%, paraffin +110.9% | [Botswana Energy Regulatory Authority (BERA) press release](https://www.bera.co.bw/downloads/Petroleum/Press%20Release%20-%20FUEL%20PRICES%20ADJUSTMENT%20Mar.26/Press%20Release%20-%20FUEL%20PRICES%20ADJUSTMENT%20Mar.26%20\(part%201\)%20-%20signed.pdf) | 2026-03-28 | 3 |
| BW-OGS-F5 | BERA pump price cut, Jul 2026 | Effective 7 Jul 2026: ULP95 -231 thebe to P18.21/litre; Diesel 50ppm -412 thebe to P20.93/litre; Illuminating paraffin -533 thebe to P18.33/litre | [Daily News (BOPA) citing BERA](https://dailynews.gov.bw/news-detail/92117) | 2026-07-06 | 3 |
| BW-OGS-F6 | Coal-bed methane: Tlou Lesedi first monetisation | Quarter to 31 Mar 2026: Tlou Energy’s Lesedi CBM project made first commercial gas sales (to Kala Data Centre); grid substation \~90% complete, completion deferred pending funding; cash A$117,000 at 31 Mar 2026; loan facility raised to A$10m (A$5.6m drawn). Project holds 10 MW BERA generation licence / BPC PPA | [AfricanFinancials (summary of Tlou Energy quarterly report)](https://africanfinancials.com/document/bw-tlou-2026-ir-q3/) | 2026-04-24 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Consumption | 1.3 bn litres/yr (diesel 55 %) | Card | F1 | MME |
| 2 | Reserves | 15 days → 60 days (depots) | Card | F2 | MME |
| 3 | Shock | Stocks 10.56 days in Mar 2026 | Alert | F3 | MME |
| 4 | Prices | \+505/+877 thebe (Mar) then cuts (Jul) | Chart | F4, F5 | BERA |
| 5 | CBM | Lesedi first gas sales | Pin | F6 | Tlou |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Diesel, petrol, LPG | Cards | HS 2710/2711 | BURS |
| 2 | Supply | ADNOC G2G 10 Ml/month | Brief | F1 | Botswana Oil |
| 3 | Routes | Durban, Walvis Bay | Route | — | — |
| 4 | Licences | BERA licences | Brief | — | BERA |
| 5 | Citizen rules | Filling stations \[VERIFY reserved\] | Brief | MAC-F23 | Trade Act |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Depots | L1–L5 | Pin | Ml |
| Filling stations | L2–L4 | Point | Density |
| Fuel routes | L0–L1 | Line | Volume |
| CBM licences | L1–L3 | Polygon | Holder |
| Stock days | L0 | Card | Days |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Fuel routes; Stock days |
| L1 District / city or town council | Depots; Fuel routes; CBM licences |
| L2 Sub-district \[not loaded\] | Depots; Filling stations; CBM licences |
| L3 Town / village | Depots; Filling stations; CBM licences |
| L4 Ward / plot | Depots; Filling stations |
| L5 Site | Depots |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Depot tender calendar | Contracting |
| Stock-day alerts | Supply risk |
| CBM offtake | Gas-to-power |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-OGS-A01 | Depot construction | BW-OGS-F2 | Francistown, Ghanzi | Contractor | M (US$1–5 m) |
| BW-OGS-A02 | Fuel haulage | BW-OGS-F1 | Corridors | Haulier | M (US$1–5 m) |
| BW-OGS-A03 | LPG distribution | BW-OGS-FOR-F4 | Rural districts | Distributor | S (US$0.2–1 m) |
| BW-OGS-A04 | CBM services | BW-OGS-F6 | Central | Service | S (US$0.2–1 m) |

(i) Traceable, freshness-gated sweep — 16 templates (sector shock index 4/12; 4 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-OGS-S03 | Fuel-quality testing laboratory | S | BW-OGS-F4 (3, 2026-03-28) | 3 | FUELPRICE (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-OGS-S15 | Fuel retail payment and loyalty platforms | S | BW-OGS-F5 (3, 2026-07-06) | 3 | FUELPRICE (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-OGS-S16 | Fuel tank and pipework installation | S | BW-OGS-F2 (3, 2026-03-04) | 3 | FUELRES (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-OGS-S01 | Fuel depot construction subcontracts (Francistown, Ghanzi) | M | BW-OGS-F2 (3, 2026-03-04) | 3 | FUELRES (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-OGS-S08 | Strategic storage operation contracts | M | BW-OGS-F2 (3, 2026-03-04) | 3 | FUELRES (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | INF | 12–18 months |
| BW-OGS-S04 | LPG distribution in rural villages (34.9 % of households cook with LPG) | S | BW-FOR-F4 (3, 2024-06) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-OGS-S05 | Fleet fuel-management and hedging advisory | S | BW-OGS-F3 (3, 2026-03-26) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-OGS-S09 | Filling stations in growth villages \[citizen-reserved, VERIFY\] | S | BW-OGS-F1 (3, 2026-03-04) | 3 | CITRES (1) | 10 | B | 8 | Yes | No | SME | 6–12 months |
| BW-OGS-S02 | Fuel road haulage (Durban/Walvis to depots) | M | BW-OGS-F1 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | No | TRD | 3–9 months |
| BW-OGS-S06 | CBM field services (Lesedi) | S | BW-OGS-F6 (2, 2026-04-24) | 2 | CBM (3) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-OGS-S10 | Lubricants blending and distribution | S | BW-OGS-F1 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-OGS-S13 | Rail-fuel logistics (rail sidings at depots) | S | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-OGS-S07 | Gas-to-power small units for data centres and industry | M | BW-OGS-F6 (2, 2026-04-24) | 2 | CBM (3) | 8 | C | 6 | No | No | CORP | 18–24 months |
| BW-OGS-S11 | Used-oil recycling | S | BW-OGS-F1 (3, 2026-03-04) | 2 | — (1) | 8 | C | 6 | No | No | SME | 9–12 months |
| BW-OGS-S12 | Biodiesel from used cooking oil | S | BW-OGS-F3 (3, 2026-03-26) | 2 | — (1) | 8 | C | 6 | No | No | SME | 9–12 months |
| BW-OGS-S14 | CBM exploration JV | L | BW-OGS-F6 (2, 2026-04-24) | 2 | CBM (3) | 8 | C | 6 | No | No | CORP | 36–48 months |

(j) Botswana products in scope: Coal-bed methane (Gase, 2711.21); Diesel (Diesele, 2710.19)

Issue 2.0 asset types carried over: Upstream exploration and production; Gas processing, pipelines and LNG import; Refining, storage terminals and depots; Fuel and LPG retail and distribution

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 2; Fiscal squeeze 1; Water & drought 0; Livestock disease (FMD) 0; Inflation & rates 1 (index 4/12) |
| Why (evidence-cited) | All fuel imported (OGS-F1); price shocks (OGS-F3, OGS-F4) |
| Diamond downturn | Tier A 3 → A+ 0, A 3, downgraded 0 |
| Citizen-reserved templates | 1 of 16 (BW-MAC-F21, F23) |
| Permits | Fuel licences (wholesale/retail); depot permits — BERA; 3–9 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | Botswana Oil |
| Verification owner | Botswana Oil; BERA |

## E3. Diamonds, Copper & Mining (MIN)

(a) Scenarios

Investor: copper-belt services and construction; diamond-cycle cost services

Trader: copper concentrate, rough diamonds (ODC)

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MIN-F1 | Debswana production and sales to Nov 2025 | As at end-November 2025 Debswana produced 14,143,511 carats and sold 18,119,562 carats valued at US$1,780,645,444; Karowe (Lucara) produced 338,090 ct and sold 257,041 ct; Okavango Diamond Company sold US$457m of carats in 2025 vs US$425m in 2024 | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-MIN-F2 | Mining production index Q4 2025 | Q4 2025 diamond production 1,970 thousand carats vs 4,338 thousand in Q4 2024 (-54.6%); copper in concentrate 13,088 t (+8.1% y/y); total mining index 40.9 (-44.7% y/y); annual 2025 mining index 67.1, down 13.4% from 77.5 in 2024 | [Statistics Botswana - Index of the Physical Volume of Mining Production Q4 2025](https://www.statsbots.org.bw/sites/default/files/Index%20of%20the%20Physical%20Volume%20Of%20Mining%20Production%20fourth%20Quarter%202025%20Stats%20Brief.pdf) | 2026-03 | 3 |
| BW-MIN-F3 | Copper output: Motheo and Khoemacau | Payable copper in concentrate to November 2025: Motheo (Sandfire) 45,379 t (vs 45,276 t); Khoemacau (MMG) 37,468 t (vs 35,879 t); Kopano 7,246 t (vs 8,938 t); Morupule Coal Mine 2,200,597 t coal | [Parliament of Botswana - Ministry of Minerals and Energy Committee of Supply Speech 2026/27](https://www.parliament.gov.bw/documents/BUDGET-2026-27-MARCH---Ministry-of-Minerals-and-Energy-Committee-of-Supply-Final-Speech_12_59_20_04_08_2026.pdf) | 2026-03-04 | 3 |
| BW-MIN-F4 | Khoemacau expansion approved | MMG approved Khoemacau expansion: capex approx. US$900m (incl. pre-2026 spend); target 130,000 tpa copper in concentrate plus \>4 Moz silver; milling capacity \>8.0 Mtpa (new 4.5 Mtpa plant); first concentrate from expansion expected H1 2028 | [MMG Limited announcement](https://www.mmg.com/wp-content/uploads/2025/12/e_2025-12-29_VA_Khoemacau-Expansion-Project-Approved.pdf) | 2025-12-29 | 3 |
| BW-MIN-F5 | Botswana-De Beers sales agreement 2025 | Signed 27 Feb 2025: 10-year sales agreement (extendable 5 years); Okavango Diamond Company share of Debswana output 30% for first 5 years, 40% next 5, 50% in extension; Debswana mining licences extended 25 years (Aug 2029-Jul 2054); De Beers upfront BWP 1bn (c. US$75m) to Diamonds for Development Fund | [Government of Botswana & De Beers Group joint announcement (via Malay Mail/Media OutReach)](https://www.malaymail.com/news/money/mediaoutreach/2025/02/27/government-of-the-republic-of-botswana-and-de-beers-group-confirm-diamond-partnership-for-the-next-generation/363918) | 2025-02-27 | 3 |
| BW-MIN-F6 | De Beers sale: Botswana pre-emption options | Botswana owns 15% of De Beers; Anglo American chose Global Diamond Consortium as preferred bidder; Minister Moeti Mohwasa told parliament Botswana weighing right of first refusal (alone/with bidder/third party); sale likely concluded in Q4 2026 subject to Botswana approval | [Engineering News (Reuters)](https://www.engineeringnews.co.za/article/botswana-says-anglo-picks-de-beers-buyer-weighs-options-for-optimal-structure-2026-07-17) | 2026-07-17 | 3 |
| BW-MIN-F7 | De Beers 2025 output and 2026 guidance | De Beers 2025 production 21.66m carats (vs 24.71m in 2024); Botswana Q4 2025 output 1.9m ct (-56%); 2026 guidance cut to 21-26m ct (from 26-29m); FY2025 average realised price -7% to US$142/ct | [Mining Weekly](https://www.miningweekly.com/article/de-beers-cuts-2026-guidance-amid-market-challenges-lower-2025-output-2026-02-05) | 2026-02-05 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Diamonds | Debswana 14.1 m ct to Nov 2025; Q4 −54.6 % | Chart | F1, F2 | MME; Statistics Botswana |
| 2 | Copper | Motheo 45,379 t; Khoemacau 37,468 t | Card | F3 | MME |
| 3 | Expansion | Khoemacau US$900 m to 130,000 tpa | Pin | F4 | MMG |
| 4 | Sales deal | ODC 30 % → 50 % of Debswana output | Brief | F5 | GoB/De Beers |
| 5 | Ownership | 15 % of De Beers; pre-emption options | Brief | F6 | Reuters |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Rough diamonds, copper | Cards | HS 7102/2603 | BURS |
| 2 | Markets | UAE, India, China | Map | TRD-F2 | Statistics Botswana |
| 3 | Routes | Walvis Bay, Durban | Route | — | — |
| 4 | Sales | ODC auctions | Calendar | MFG-F4 | ODC |
| 5 | Licences | Mines and Minerals Act | Brief | — | Department of Mines |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Mines | L1–L5 | Pin | Output |
| Copper belt | L1–L3 | Polygon | Projects |
| Licences | L1–L4 | Polygon | Holder |
| Haul routes | L0–L2 | Line | Trucks |
| Mining towns | L2–L3 | Point | Population |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Haul routes |
| L1 District / city or town council | Mines; Copper belt; Licences; Haul routes |
| L2 Sub-district \[not loaded\] | Mines; Copper belt; Licences; Haul routes; Mining towns |
| L3 Town / village | Mines; Copper belt; Licences; Mining towns |
| L4 Ward / plot | Mines; Licences |
| L5 Site | Mines |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Mine procurement plans | Supplier entry |
| Diamond cycle indicators | Timing |
| Water and power at mines | Constraints |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MIN-A01 | Copper services | BW-MIN-F3 | Ghanzi, North-West | Service | M (US$1–5 m) |
| BW-MIN-A02 | Khoemacau subcontracts | BW-MIN-F4 | North-West | Contractor | M (US$1–5 m) |
| BW-MIN-A03 | Assay laboratory | BW-MIN-F4 | Ghanzi | Lab | S (US$0.2–1 m) |
| BW-MIN-A04 | Diamond tender services | BW-MIN-F5 | Gaborone | Service | S (US$0.2–1 m) |

(i) Traceable, freshness-gated sweep — 22 templates (sector shock index 6/12; 8 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MIN-S01 | Copper-mine contract services (Motheo, Khoemacau) | M | BW-MIN-F3 (3, 2026-03-04) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | CORP | 3–9 months |
| BW-MIN-S03 | Mining equipment rebuild and component exchange | S | BW-MIN-F3 (3, 2026-03-04) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-MIN-S04 | Assay and metallurgical laboratory (copper belt) | S | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-MIN-S05 | Mine camp catering and facility management | S | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-MIN-S09 | Diamond security and logistics | S | BW-MIN-F1 (3, 2026-03-04) | 3 | DEBSALES (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-MIN-S14 | Mining skills academy | S | BW-MIN-F4 (3, 2025-12-29) | 3 | TVET (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-MIN-S16 | Drone survey and geophysics | S | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-MIN-S18 | Quarry and aggregates (construction) | S | BW-CRE-F3 (3, 2026-02-09) | 3 | ROADS (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-MIN-S21 | Citizen-supplier development for mines (localisation) | S | BW-MAC-F20 (3, 2022-04-20) | 3 | EIA (3) | 12 | B (gated: stale fact) | 10 | No | No | SME | 1–6 months |
| BW-MIN-S02 | Khoemacau expansion construction subcontracts (US$900 m) | M | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-MIN-S06 | Copper-concentrate haulage to Walvis Bay | M | BW-MIN-F3 (3, 2026-03-04) | 3 | COPPER (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | TRD | 3–9 months |
| BW-MIN-S07 | Diamond-mine cost-reduction services (output −54.6 % Q4 2025) | S | BW-MIN-F2 (3, 2026-03) | 3 | DEBSALES (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | SME | 3–9 months |
| BW-MIN-S08 | Rough-diamond tender and auction services (ODC volumes) | S | BW-MIN-F5 (3, 2025-02-27) | 3 | DEBSALES (3) | 11 | B (gated: stale fact) | 9 | No | Yes | SME | 3–6 months |
| BW-MIN-S19 | Mine water treatment and recycling | S | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | SME | 9–18 months |
| BW-MIN-S20 | Explosives and blasting services | S | BW-MIN-F3 (3, 2026-03-04) | 3 | COPPER (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-MIN-S10 | Copper exploration junior (Kalahari Copper Belt) | M | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 10 | B | 8 | No | No | CORP | 24–48 months |
| BW-MIN-S11 | Silver/copper by-product recovery | M | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 10 | B | 8 | No | Yes | CORP | 24–36 months |
| BW-MIN-S13 | Coal haulage and blending (Morupule 2.2 Mt) | S | BW-MIN-F3 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | No | SME | 3–6 months |
| BW-MIN-S15 | Copper smelter / SX-EW plant | XL | BW-MIN-F4 (3, 2025-12-29) | 2 | COPPER (3) | 9 | B | 7 | No | Yes | INF | 36–48 months |
| BW-MIN-S22 | Diamond-tailings re-treatment (if economic) | M | BW-MIN-F2 (3, 2026-03) | 2 | DEBSALES (3) | 9 | B | 7 | No | Yes | CORP | 18–24 months |
| BW-MIN-S12 | Mine rehabilitation and closure (Selebi Phikwe legacy) | S | BW-MIN-F2 (3, 2026-03) | 2 | — (1) | 8 | C | 6 | No | No | SME | 3–9 months |
| BW-MIN-S17 | Soda ash and salt downstream products | S | BW-MIN-F2 (3, 2026-03) | 1 | — (1) | 7 | C | 5 | No | No | SME | 9–12 months |

(j) Botswana products in scope: Rough diamonds (gem) (Diamane, 7102.31); Industrial diamonds (Diamane tsa madirelo, 7102.21); Copper concentrate (Kopore, 2603.00); Silver (in concentrate) (Selefera, 2616.10); Coal (Malatlha, 2701.12); Soda ash (Soda ash, 2836.20); Salt (Letswai, 2501.00); Nickel (care and maintenance) (Nikele, 2604.00); Gold (Gauta, 7108.12)

Issue 2.0 asset types carried over: Precious metals (gold, PGMs); Base metals (copper, nickel, zinc, iron ore, manganese, chrome); Battery and critical minerals (lithium, graphite, rare earths, vanadium, cobalt); Coal; Industrial minerals and construction materials; Diamonds and gemstones; Artisanal and small-scale mining (ASM)

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 2; SA dependence (power, imports, rand) 1; Fiscal squeeze 1; Water & drought 1; Livestock disease (FMD) 0; Inflation & rates 1 (index 6/12) |
| Why (evidence-cited) | Diamond output −54.6 % (MIN-F2); copper offsets (MIN-F3); power/water inputs (ENR-F1) |
| Diamond downturn | Tier A 8 → A+ 0, A 0, downgraded 8 |
| Citizen-reserved templates | 0 of 22 (BW-MAC-F21, F23) |
| Permits | Prospecting/mining licence; EIA — Department of Mines; DEA; 6–24 months \[VERIFY\] |
| Regulatory changes | R-05 De Beers sales agreement (+) |
| Institution to call | Mine procurement office (Debswana, MMG, Sandfire) |
| Verification owner | MME; Department of Mines |

## E4. Livestock, Beef & Horticulture (AGR)

(a) Scenarios

Investor: FMD control, feedlots, horticulture under import restrictions

Trader: beef (when re-listed), goats, vegetables

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-AGR-F1 | National herd (Agricultural Census 2025) | Cattle 1,638,543 (traditional 1,182,804; commercial 455,739), down 6.1% from 1,744,166 in 2015 census; goats 1,271,407 (+5.5%); sheep 323,279 (+33.3%); reference period Oct 2024-Sep 2025 | [Statistics Botswana - Agricultural Census Stats Brief 2025 (Livestock Sector)](https://www.statsbots.org.bw/sites/default/files/Agricultural%20Census%20Stats%20Brief%202025%20-Livestock%20Sector.pdf) | 2026-09 | 3 |
| BW-AGR-F2 | EU suspends all Botswana beef (FMD) | Commission Implementing Regulation (EU) 2026/914 of 21 Apr 2026 suspended zones BW-1, BW-2, BW-3 and BW-5 (the remaining authorised zones) after FMD outbreak confirmed 1 Apr 2026 in Barolong; no beef slaughtered/certified after 1 Apr 2026 may enter EU; earlier-certified consignments allowed until 29 Jun 2026 | [AGRINFO (EU) - Foot and mouth: suspension of beef from Botswana](https://agrinfo.eu/book-of-reports/foot-and-mouth-suspension-of-beef-from-botswana/) | 2026-05-01 | 3 |
| BW-AGR-F3 | UK restricts Botswana fresh beef | FMD confirmed in Zone 6b (suspected in Zone 3c); GB set closing date of 30 Dec 2025 on Botswana bovine fresh meat listings, effective 4 Feb 2026 (incl. beef re-routed via SA cold stores) | [UK Government (APHA/Defra) OVS note](https://www.gov.uk/government/publications/official-veterinary-surgeon-ovs-notes/4-february-2026-outbreak-of-foot-and-mouth-disease-in-botswana) | 2026-02-04 | 3 |
| BW-AGR-F4 | Agriculture GDP share, herd target, food imports | Agriculture contributes less than 2% of GDP; cattle population fell from 2.2m (2011) to 1.7m (2025), government target 5m within five years; food & beverage imports US$86m (P1,256.3m) in May 2025 = 15.4% of total imports | [US International Trade Administration - Botswana Country Commercial Guide (Agricultural Sectors)](https://www.trade.gov/country-commercial-guides/botswana-agricultural-sectors) | 2025-12-08 | 3 |
| BW-AGR-F5 | Beef and live cattle export values | BMC beef exports approx. P2.36bn over 2020-2025 (Ministry of Lands and Agriculture); meat & meat-product exports P404m in 2024 (P312m in 2023); live cattle exports P523m in 2024 (P648m in 2023); WOAH suspended FMD-free status of several zones from 31 Mar 2026 | [YourBotswana](https://yourbotswana.com/?p=21248) | 2026-09-02 | 2 |
| BW-AGR-F6 | Domestic beef consumption | Acting Minister of Lands and Agriculture Dr Edwin Dikoloti (Parliament): domestic consumption 27,154.6 t (135,773 cattle) in 2022 and 39,577 t (197,885 cattle) in 2024; value P989.4m in 2024; EU exports about 9,000 t boneless beef per year | [YourBotswana](https://yourbotswana.com/botswanas-beef-production-exceeds-domestic-demand/) | 2025-12-14 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Herd | 1.64 m cattle (−6.1 %) | Card | F1 | Statistics Botswana |
| 2 | Exports | EU suspension (Apr 2026); UK restriction | Alert | F2, F3 | EU; UK |
| 3 | Targets | 5 m cattle target | Card | F4 | ITA |
| 4 | Trade | Live cattle P523 m (2024) | Chart | F5 | Ministry |
| 5 | Domestic | Beef consumption P989 m | Card | F6 | Parliament |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Beef, cattle, vegetables | Cards | HS | BURS |
| 2 | Restrictions | Horticulture imports (Dec 2025) | Brief | TRD-F4 | Ministry |
| 3 | Zones | FMD zones | Map | F2 | DVS |
| 4 | Buyers | BMC, retailers | List | — | BMC |
| 5 | Citizen rules | Sorghum milling, sour milk reserved | Brief | MAC-F21 | Trade Act |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| FMD zones | L1–L3 | Polygon | Status |
| Cattle posts | L2–L4 | Point | Density |
| Abattoirs | L2–L5 | Pin | Approval |
| Horticulture farms | L2–L4 | Pin | Crop |
| Pandamatenga | L2–L4 | Polygon | Grain |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | — |
| L1 District / city or town council | FMD zones |
| L2 Sub-district \[not loaded\] | FMD zones; Cattle posts; Abattoirs; Horticulture farms; Pandamatenga |
| L3 Town / village | FMD zones; Cattle posts; Abattoirs; Horticulture farms; Pandamatenga |
| L4 Ward / plot | Cattle posts; Abattoirs; Horticulture farms; Pandamatenga |
| L5 Site | Abattoirs |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Zone re-listing timeline | Export recovery |
| Horticulture gaps by crop | Import substitution |
| Water for irrigation | Feasibility |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-AGR-A01 | FMD vet services | BW-AGR-F2 | Southern, North-East | Service | S (US$0.2–1 m) |
| BW-AGR-A02 | Feedlots | BW-AGR-F4 | Central, Kgalagadi | Operator | M (US$1–5 m) |
| BW-AGR-A03 | Greenhouse vegetables | BW-TRD-F4 | Peri-urban | Grower | S (US$0.2–1 m) |
| BW-AGR-A04 | Grain storage | BW-AGR-F4 | Pandamatenga | Operator | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 27 templates (sector shock index 6/12; 6 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-AGR-S01 | FMD vaccination and cold-chain vet services | S | BW-AGR-F2 (3, 2026-05-01) | 3 | FMDCTRL (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-AGR-S02 | Livestock traceability (BAITS) services and tags | S | BW-AGR-F3 (3, 2026-02-04) | 3 | FMDCTRL (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-AGR-S04 | Fodder and silage production | S | BW-AGR-F1 (3, 2026-09) | 3 | HERD5M (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-AGR-S16 | Hides and skins collection for Lobatse leather | S | BW-MFG-F3 (3, 2026-05-28) | 3 | SEZ (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-AGR-S23 | Veterinary laboratory services (FMD testing) | S | BW-AGR-F3 (3, 2026-02-04) | 3 | FMDCTRL (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-AGR-S24 | Cattle-post water and fencing contracting | S | BW-AGR-F4 (3, 2025-12-08) | 3 | HERD5M (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-AGR-S27 | Beef export certification and compliance desk | S | BW-AGR-F2 (3, 2026-05-01) | 3 | FMDCTRL (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-AGR-S03 | Feedlot for herd rebuild (5 m target) | M | BW-AGR-F4 (3, 2025-12-08) | 3 | HERD5M (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 9–18 months |
| BW-AGR-S09 | Sorghum milling \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 6–12 months |
| BW-AGR-S10 | Sour milk and dairy processing \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 6–12 months |
| BW-AGR-S15 | Drip irrigation and borehole solar | S | BW-TRD-F4 (2, 2025-12-11) | 3 | HORTBAN (3) | 11 | B | 9 | No | No | SME | 1–6 months |
| BW-AGR-S19 | Hydroponics near Gaborone | S | BW-TRD-F4 (2, 2025-12-11) | 3 | HORTBAN (3) | 11 | B | 9 | No | No | DIA | 6–12 months |
| BW-AGR-S20 | Animal feed mill | M | BW-AGR-F1 (3, 2026-09) | 3 | HERD5M (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 12–18 months |
| BW-AGR-S26 | Fresh-produce cold stores (import substitution) | S | BW-TRD-F4 (2, 2025-12-11) | 3 | HORTBAN (3) | 11 | B | 9 | No | No | SME | 6–12 months |
| BW-AGR-S06 | Greenhouse tomatoes and vegetables (import restriction) | S | BW-TRD-F4 (2, 2025-12-11) | 3 | HORTBAN (3) | 10 | B | 8 | Yes | No | SME | 6–12 months |
| BW-AGR-S07 | Potato and onion storage and packing | S | BW-TRD-F4 (2, 2025-12-11) | 3 | HORTBAN (3) | 10 | B | 8 | No | No | SME | 6–12 months |
| BW-AGR-S11 | Abattoir upgrades for EU re-listing | M | BW-AGR-F2 (3, 2026-05-01) | 3 | FMDCTRL (3) | 10 | B | 8 | No | Yes | CORP | 12–24 months |
| BW-AGR-S14 | Agri-input distribution (seed, feed, vet) | S | BW-AGR-F1 (3, 2026-09) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-AGR-S22 | Goat-milk and cheese products | S | BW-AGR-F1 (3, 2026-09) | 3 | — (1) | 10 | B | 8 | No | No | SME | 6–12 months |
| BW-AGR-S05 | Small-stock (goats) aggregation and export | S | BW-AGR-F1 (3, 2026-09) | 3 | AFCFTA (1) | 9 | B | 7 | No | Yes | TRD | 3–9 months |
| BW-AGR-S08 | Pandamatenga grain drying and storage | M | BW-AGR-F4 (3, 2025-12-08) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 9–18 months |
| BW-AGR-S13 | Poultry broiler integration | M | BW-AGR-F4 (3, 2025-12-08) | 3 | — (1) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-AGR-S18 | Agri-finance and insurance for farmers | S | BW-AGR-F1 (3, 2026-09) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 6–12 months |
| BW-AGR-S25 | Fruit orchards (citrus, mango) in the north-east | S | BW-TRD-F4 (2, 2025-12-11) | 2 | HORTBAN (3) | 9 | B | 7 | No | No | SME | 18–36 months |
| BW-AGR-S12 | Domestic beef value-added (P989 m consumption) | S | BW-AGR-F6 (2, 2025-12-14) | 2 | — (1) | 8 | C | 6 | No | No | SME | 6–12 months |
| BW-AGR-S21 | Ostrich and game-meat value chain | S | BW-AGR-F1 (3, 2026-09) | 2 | — (1) | 8 | C | 6 | No | Yes | SME | 9–12 months |
| BW-AGR-S17 | Live-cattle export logistics | S | BW-AGR-F5 (2, 2026-09-02) | 2 | — (1) | 7 | C | 5 | No | Yes | TRD | 3–6 months |

(j) Botswana products in scope: Beef (Nama ya kgomo, 0201.30); Live cattle (Dikgomo, 0102.29); Goats (Dipudi, 0104.20); Sorghum (Mabele, 1007.90); Maize (Mmidi, 1005.90); Tomatoes (Ditamati, 0702.00); Potatoes (Ditapole, 0701.90); Onions (Dieie, 0703.10); Hides and skins (Matlalo, 4101.20); Milk (Mashi, 0401.10); Poultry (Dikoko, 0207.11); Game meat (Nama ya diphologolo, 0208.90); Animal feed (Dijo tsa diphologolo, 2309.90)

Issue 2.0 asset types carried over: Grains and oilseeds (maize, wheat, soya, sunflower, sorghum); Pulses (dry beans, pigeon peas, chickpeas, cowpeas, lentils); Horticulture (citrus, subtropical, deciduous, vegetables); Sugar and sugarcane; Wine, spirits and beverages; Nuts (macadamia, pecan, cashew, groundnuts); Cash crops (tobacco, tea, coffee, cotton); Irrigation development; Inputs (seed, fertiliser, agrochemicals, mechanisation); Agro-processing and food manufacturing

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 1; Fiscal squeeze 0; Water & drought 2; Livestock disease (FMD) 2; Inflation & rates 1 (index 6/12) |
| Why (evidence-cited) | FMD suspensions (AGR-F2, AGR-F3); drought (WSW-F4) |
| Diamond downturn | Tier A 7 → A+ 0, A 7, downgraded 0 |
| Citizen-reserved templates | 3 of 27 (BW-MAC-F21, F23) |
| Permits | Land-board allocation; vet permits; import/export permits — Land boards; DVS; 1–6 months \[VERIFY\] |
| Regulatory changes | R-02 Horticulture import restriction reinstated (+ growers / − traders), R-03 EU beef suspension (−), R-04 UK beef restriction (−) |
| Institution to call | DVS district office; BMC |
| Verification owner | Ministry of Lands and Agriculture; DVS |

## E5. Fisheries & Aquaculture (BLU)

(a) Scenarios

Investor: aquaculture to replace \>90 % fish imports

Trader: frozen fish imports, feed

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-BLU-F1 | Fish consumption vs local production | Botswana consumes 4,000 metric tons of fish a year but produces 201 metric tons locally; balance imported | [US International Trade Administration - Botswana Country Commercial Guide (Agricultural Sectors)](https://www.trade.gov/country-commercial-guides/botswana-agricultural-sectors) | 2025-12-08 | 3 |
| BW-BLU-F2 | Fishing permits and closed season (Parliament) | Minister of Environment and Tourism Wynter Mmolotsi: closed season January-February; subsistence limit 10 fish per day with traditional gear; permit suspension (from 2020) lifted after 2023 legislative amendment - permits resumed for Shashe, Tati and Motloutse rivers | [Daily News (BOPA)](https://dailynews.gov.bw/news-detail/90320) | 2026-03-02 | 3 |
| BW-BLU-F3 | Okavango share of capture fishery (FAO baseline) | Okavango Delta supplied about 80% of national catches (reservoirs \~20%); fish imports 4,900 t vs production 112 t (2003); per capita supply 2.8 kg/yr; aquaculture at ‘infantile stage’; \~3,000 primary-sector fishers (2006) | [FAO Fishery Country Profile - Botswana](https://www.fao.org/fishery/docs/DOCUMENT/fcp/en/FI_CP_BW.pdf) | 2007-04 | 3 |
| BW-BLU-F4 | Fish import dependence (industry) | Botswana imports more than 90% of fish consumed (Seloilwe Seloilwe, Aquaculture Consultancy Botswana); fish farmers produce under 500 tonnes a year (Botswana Fish Farmers Association) | [Daily News (BOPA)](https://dailynews.gov.bw/news-detail/93020) | 2026-08-31 | 2 |
| BW-BLU-F5 | Aquaculture output trend | Aquaculture output \~20 t (2017), \~35 t (2019), 146 t (2020), 172 t (2021) (FAO data); combined capture + aquaculture \~550 t/yr vs estimated demand \~5,000 t, shortfall \~4,450 t imported | [Frontiers in Sustainable Food Systems (peer-reviewed)](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2026.1817357/full) | 2026-05-08 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Gap | 4,000 t consumed vs 201 t produced | Card | F1 | ITA |
| 2 | Rules | Closed season; permits | Brief | F2 | MET |
| 3 | Base | Okavango ≈80 % of catch | Card | F3 | FAO |
| 4 | Imports | \>90 % imported | Card | F4 | Industry |
| 5 | Trend | Aquaculture 172 t (2021) | Chart | F5 | FAO via Frontiers |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Frozen fish, canned fish | Cards | HS 03/16 | BURS |
| 2 | Sources | SA, Namibia | Map | — | — |
| 3 | Licences | Permits | Brief | F2 | MET |
| 4 | Cold chain | Distributors | List | — | — |
| 5 | Prices | Retail | Card | — | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Okavango fishery | L1–L3 | Polygon | Catch |
| Fish farms | L2–L5 | Pin | Output |
| Dams | L2–L4 | Pin | Cage potential |
| Cold stores | L2–L4 | Point | Capacity |
| Markets | L2–L3 | Point | Demand |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | — |
| L1 District / city or town council | Okavango fishery |
| L2 Sub-district \[not loaded\] | Okavango fishery; Fish farms; Dams; Cold stores; Markets |
| L3 Town / village | Okavango fishery; Fish farms; Dams; Cold stores; Markets |
| L4 Ward / plot | Fish farms; Dams; Cold stores |
| L5 Site | Fish farms |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Feed cost | Margins |
| Water rights for ponds | Siting |
| Import volumes by product | Substitution |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-BLU-A01 | Tilapia farms | BW-BLU-F1 | Peri-urban Gaborone | Farmer | S (US$0.2–1 m) |
| BW-BLU-A02 | Hatchery | BW-BLU-F5 | South-East | Grower | S (US$0.2–1 m) |
| BW-BLU-A03 | Community processing | BW-BLU-F3 | Shakawe | Cooperative | S (US$0.2–1 m) |
| BW-BLU-A04 | Fish-feed | BW-BLU-F5 | Gaborone | Manufacturer | S (US$0.2–1 m) |

(i) Traceable, freshness-gated sweep — 15 templates (sector shock index 4/12; 4 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-BLU-S07 | Angling tourism (tigerfish) | S | BW-BLU-F2 (3, 2026-03-02) | 3 | AQUA (3) | 12 | A (robust) | 10 | No | Yes | SME | 3–6 months |
| BW-BLU-S14 | Fish smoking and drying units | S | BW-BLU-F3 (3, 2007-04) | 3 | AQUA (3) | 12 | B (gated: stale fact) | 10 | No | No | DFI | 3–6 months |
| BW-BLU-S01 | Tilapia aquaculture farms (imports \>90 %) | S | BW-BLU-F1 (3, 2025-12-08) | 3 | AQUA (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | SME | 9–18 months |
| BW-BLU-S05 | Okavango community fisheries processing | S | BW-BLU-F3 (3, 2007-04) | 3 | AQUA (3) | 11 | B (gated: stale fact) | 9 | No | No | DFI | 6–12 months |
| BW-BLU-S13 | Dam-based cage culture (reservoirs) | S | BW-BLU-F3 (3, 2007-04) | 3 | AQUA (3) | 11 | B (gated: stale fact) | 9 | No | No | SME | 12–18 months |
| BW-BLU-S04 | Fish cold-chain distribution | S | BW-BLU-F1 (3, 2025-12-08) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-BLU-S08 | Aquaculture training and extension | S | BW-BLU-F4 (2, 2026-08-31) | 2 | AQUA (3) | 10 | B | 8 | No | No | DFI | 3–6 months |
| BW-BLU-S09 | Fish retail kiosks in towns | S | BW-BLU-F1 (3, 2025-12-08) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-BLU-S11 | Pond construction services | S | BW-BLU-F4 (2, 2026-08-31) | 2 | AQUA (3) | 10 | B | 8 | No | No | SME | 3–6 months |
| BW-BLU-S12 | Fish import consolidation from Namibia/SA | S | BW-BLU-F1 (3, 2025-12-08) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-BLU-S02 | Fish hatchery and fingerlings | S | BW-BLU-F5 (2, 2026-05-08) | 2 | AQUA (3) | 9 | B | 7 | No | No | SME | 9–12 months |
| BW-BLU-S03 | Fish-feed manufacturing | S | BW-BLU-F5 (2, 2026-05-08) | 2 | AQUA (3) | 9 | B | 7 | No | No | SME | 12–18 months |
| BW-BLU-S10 | Aquaponics with horticulture | S | BW-BLU-F5 (2, 2026-05-08) | 2 | HORTBAN (3) | 9 | B | 7 | No | No | DIA | 9–12 months |
| BW-BLU-S15 | Fish-farm finance (cooperatives) | S | BW-BLU-F4 (2, 2026-08-31) | 2 | AQUA (3) | 9 | B | 7 | No | No | DFI | 6–12 months |
| BW-BLU-S06 | Recirculating aquaculture near Gaborone | M | BW-BLU-F4 (2, 2026-08-31) | 2 | AQUA (3) | 8 | C | 6 | No | No | CORP | 18–24 months |

(j) Botswana products in scope: Tilapia (three-spot, Okavango) (Tlhapi, 0302.71); Sharptooth catfish (Tlhapi ya Nnyelele \[VERIFY\], 0302.72); Tigerfish (sport) (Tlhapi ya nkwe \[VERIFY\], 0302.89); Bream (Oreochromis) (Tlhapi, 0302.71); Frozen hake (imported) (Tlhapi e e gatsetsweng, 0303.66); Canned fish (imported) (Tlhapi ya mo thineng, 1604.13); Fish feed (Dijo tsa ditlhapi, 2309.90); Fingerlings (Ditlhapinyana, 0301.99); Dried fish (Tlhapi e e omisitsweng, 0305.59)

Issue 2.0 asset types carried over: Beef, small stock and feedlots; Dairy; Poultry and eggs; Wild-capture fisheries; Aquaculture and mariculture; Marine services (ship repair, bunkering)

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 1; Fiscal squeeze 0; Water & drought 2; Livestock disease (FMD) 0; Inflation & rates 1 (index 4/12) |
| Why (evidence-cited) | Imports from SA (BLU-F4); water (WSW-F4) |
| Diamond downturn | Tier A 1 → A+ 0, A 1, downgraded 0 |
| Citizen-reserved templates | 0 of 15 (BW-MAC-F21, F23) |
| Permits | Fishing permits; aquaculture approval — Ministry of Environment and Tourism; 1–6 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | Department of Wildlife and National Parks (fisheries) |
| Verification owner | Ministry of Environment and Tourism |

## E6. Forestry & Veld Products (FOR)

(a) Scenarios

Investor: veld products (phane, marula), clean cooking, eco-concessions

Trader: phane exports, timber imports

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-FOR-F1 | Phane (mophane worm) export permit | Minister Wynter Mmolotsi (Parliament): phane exporters pay P2,200 per consignment for an export permit, plus phytosanitary certificate; seasonal harvesting permits via Forest and Range Resources district offices; quotas in some areas; cites Forestry Act, 2025 | [Daily News (BOPA)](https://dailynews.gov.bw/news-detail/90914) | 2026-04-08 | 3 |
| BW-FOR-F2 | Phane permit tiers and harvest activity | Dept of Forestry and Range Resources (Serowe district): permit fees P110 dealers, P2,200 exporters/foreigners, P5 citizen subsistence harvesters; over 3,000 harvesters near Tshimoyapula and Serule (Apr 2026 season) | [Daily News (BOPA)](https://dailynews.gov.bw/news-detail/91117) | 2026-04-22 | 3 |
| BW-FOR-F3 | Gazetted forest reserves (Chobe region) | Six forest reserves total 4,372.64 km2 (\~0.8% of land area): Chobe 1,740.31 km2, Sibuyu 1,175.00, Maikaelelo 625.00, Kasane Extension 475.00, Kazuma 225.47, Kasane 131.86; non-timber forest products valued at about P65m/yr (Taylor 1998) | [Statistics Botswana (CSO) - Forestry Statistics](https://www.statsbots.org.bw/sites/default/files/publications/Forestry%20Statistics.pdf) | 2004-08 | 3 |
| BW-FOR-F4 | Fuelwood dependence (Census 2022) | 29.7% of households use firewood/wood as principal cooking fuel (towns & cities 3.2%, urban villages 15.3%, rural 64.7%); LPG 34.88%; grid electricity 25.30%; coal/charcoal 0.44% | [Statistics Botswana - 2022 PHC: Utilisation of green energy among households](https://www.statsbots.org.bw/STATSEVENTS/sites/default/files/2024-06/Utilisation%20of%20green%20energy%20among%20households%20in%20Botswana%202022%20PHC.pdf) | 2024-06 | 3 |
| BW-FOR-F5 | Timber and wood product imports | Botswana imports of HS44 (wood, articles of wood, charcoal): US$96.2m (2021), US$148.6m (2022), US$66.3m (2023); South Africa 86% (US$57m) in 2023. South Africa’s HS44 exports to Botswana US$68.63m in 2025 (UN Comtrade via Trading Economics) | [TrendEconomy (UN Comtrade)](https://trendeconomy.com/data/h2/Botswana/44) | 2024 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Phane | Export permit P2,200 | Brief | F1 | MET |
| 2 | Harvest | \>3,000 harvesters (Serowe area) | Card | F2 | DFRR |
| 3 | Reserves | 4,372.64 km² (Chobe area) | Polygon | F3 | Statistics Botswana |
| 4 | Fuelwood | 29.7 % of households | Choropleth | F4 | Census 2022 |
| 5 | Imports | HS44 US$66.3 m (2023) | Chart | F5 | UN Comtrade |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Phane, marula, devil’s claw | Cards | HS | BURS |
| 2 | Markets | SA, Zimbabwe, EU (cosmetics) | Map | — | — |
| 3 | Permits | DFRR | Brief | F2 | DFRR |
| 4 | Certification | Organic/fair trade \[VERIFY\] | Brief | — | — |
| 5 | Imports | Timber from SA | Route | F5 | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Forest reserves | L1–L3 | Polygon | Area |
| Harvest areas | L2–L4 | Heat | Season |
| Fuelwood use | L1–L2 | Choropleth | % |
| Processing | L2–L5 | Pin | Capacity |
| Fire risk | L1–L3 | Heat | Season |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | — |
| L1 District / city or town council | Forest reserves; Fuelwood use; Fire risk |
| L2 Sub-district \[not loaded\] | Forest reserves; Harvest areas; Fuelwood use; Processing; Fire risk |
| L3 Town / village | Forest reserves; Harvest areas; Processing; Fire risk |
| L4 Ward / plot | Harvest areas; Processing |
| L5 Site | Processing |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Permit volumes | Supply |
| Export prices | Margins |
| Concession calls | Entry |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-FOR-A01 | Phane processing | BW-FOR-F1 | Central | Processor | S (US$0.2–1 m) |
| BW-FOR-A02 | Marula products | BW-FOR-F3 | North-East | Processor | S (US$0.2–1 m) |
| BW-FOR-A03 | Clean cooking | BW-FOR-F4 | Rural districts | Distributor | S (US$0.2–1 m) |
| BW-FOR-A04 | Eco-concessions | BW-FOR-F3 | Chobe | Operator | S (US$0.2–1 m) |

(i) Traceable, freshness-gated sweep — 14 templates (sector shock index 2/12; 2 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-FOR-S01 | Phane processing and export packing | S | BW-FOR-F1 (3, 2026-04-08) | 3 | VELD (3) | 12 | A+ (robust) | 11 | No | Yes | SME | 3–6 months |
| BW-FOR-S09 | Rangeland restoration (GCF FP158) | S | BW-GRN-F4 (3, 2026-10-09) | 3 | GCF (3) | 12 | A+ (robust) | 11 | No | No | DFI | 3–9 months |
| BW-FOR-S10 | Veld-product cooperative finance | S | BW-FOR-F2 (3, 2026-04-22) | 3 | VELD (3) | 12 | A+ (robust) | 11 | No | No | DFI | 3–6 months |
| BW-FOR-S13 | Phane farming and drying technology | S | BW-FOR-F2 (3, 2026-04-22) | 3 | VELD (3) | 11 | A | 10 | No | No | SME | 6–12 months |
| BW-FOR-S02 | Marula oil and cosmetics | S | BW-FOR-F3 (3, 2004-08) | 2 | VELD (3) | 10 | B | 9 | No | Yes | SME | 6–12 months |
| BW-FOR-S03 | Devil’s claw sustainable harvest and export | S | BW-FOR-F3 (3, 2004-08) | 2 | VELD (3) | 10 | B | 9 | No | Yes | DFI | 3–9 months |
| BW-FOR-S04 | LPG and clean-cookstove substitution for firewood | S | BW-FOR-F4 (3, 2024-06) | 3 | — (1) | 10 | B | 9 | No | No | DFI | 1–6 months |
| BW-FOR-S08 | Woodlots and briquettes | S | BW-FOR-F4 (3, 2024-06) | 3 | — (1) | 10 | B | 9 | No | No | SME | 9–18 months |
| BW-FOR-S12 | Fire management for forest reserves | S | BW-FOR-F3 (3, 2004-08) | 3 | — (1) | 10 | B | 9 | No | No | SME | 3–6 months |
| BW-FOR-S14 | Woodcraft and curios for tourism | S | BW-FOR-F3 (3, 2004-08) | 3 | — (1) | 10 | B | 9 | No | Yes | SME | 3–6 months |
| BW-FOR-S07 | Chobe forest-reserve eco-tourism concessions | S | BW-FOR-F3 (3, 2004-08) | 3 | — (1) | 9 | B | 8 | No | Yes | SME | 9–12 months |
| BW-FOR-S11 | Charcoal from bush-encroacher clearing | S | BW-FOR-F4 (3, 2024-06) | 3 | — (1) | 9 | B | 8 | No | No | SME | 6–12 months |
| BW-FOR-S05 | Timber yards and treated poles (imports US$66 m) | S | BW-FOR-F5 (2, 2024) | 2 | — (1) | 8 | C | 7 | No | No | TRD | 1–6 months |
| BW-FOR-S06 | Furniture manufacturing (local timber substitution) | S | BW-FOR-F5 (2, 2024) | 2 | — (1) | 7 | C | 6 | No | No | SME | 6–12 months |

(j) Botswana products in scope: Mopane worms (phane) (Phane, 0410.90); Marula (Morula, 2009.89); Devil’s claw (Sengaparile, 1211.90); Firewood (Dikgong, 4401.11); Timber (imported) (Ditlhare, 4407.11); Mopane wood (Mophane, 4403.99)

Issue 2.0 asset types carried over: Plantation forestry; Sawmilling, panels, poles; Pulp, paper and bio-products

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 0; Fiscal squeeze 0; Water & drought 2; Livestock disease (FMD) 0; Inflation & rates 0 (index 2/12) |
| Why (evidence-cited) | Rain-dependent veld products (FOR-F2); drought (WSW-F4) |
| Diamond downturn | Tier A 4 → A+ 3, A 1, downgraded 0 |
| Citizen-reserved templates | 0 of 14 (BW-MAC-F21, F23) |
| Permits | Harvesting and export permits (phane P2,200) — DFRR; Days–weeks |
| Regulatory changes | — |
| Institution to call | DFRR district office |
| Verification owner | DFRR |

## E7. Manufacturing, SEZs & Beneficiation (MFG)

(a) Scenarios

Investor: SEZ manufacturing (Lobatse), beneficiation, mining consumables

Trader: components, packaging, jewellery

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MFG-F1 | Manufacturing share of real GDP and growth, 2025 | Manufacturing = 5.7% of GDP in 2025 (5.8% in Q4 2025); real value added +1.9% in 2025 and +6.5% y/y in Q4 2025 (overall real GDP -0.7% in 2025) | [Statistics Botswana, Gross Domestic Product Q4 2025](https://statsbots.org.bw/sites/default/files/publications/Gross%20Domestic%20Product%20Fourth%20Quarter%202025.pdf) | 2026-03 | 3 |
| BW-MFG-F2 | BITC investment facilitated, FY2025 | FDI attracted P5.52bn vs P5bn target; total investment facilitation P14.882bn vs P13.6bn target; direct investment & expansions P9.062bn vs P8.6bn; tourism leading FDI sector, then energy, services, mining, manufacturing, agribusiness | [Mmegi (reporting BITC results)](https://www.mmegi.bw/business/fdi-surpasses-target-as-tourism-leads/news) | 2026-09-25 | 2 |
| BW-MFG-F3 | Lobatse Meat & Leather City SEZ licensed investment | SEZA has licensed 3 investors totalling P437.1m; operating car-harness manufacturer invested P89.3m and created 303 jobs; 2 further investors (abattoir, leather plant, tannery) to invest P347.8m and create 122 jobs; phase 1 services 100 ha | [Daily News (BOPA) - Lobatse Mayor Aron Ganakgomo, council report on SEZA](https://dailynews.gov.bw/news-detail/91631) | 2026-05-28 | 3 |
| BW-MFG-F4 | Okavango Diamond Company sales and Debswana allocation | ODC sold about 3 million carats in 2025 from over 4 million carats allocated; Debswana allocation rose to 30% from 25% (to reach 40% at end of 10-year deal); plans \~50% of allocation by value via contracts; contracted customers rose from avg 14 (Nov-Dec 2025 pilot) to 32 | [Reuters via Mining Weekly - ODC acting MD Lipalese Makepe](https://www.miningweekly.com/article/botswanas-state-owned-diamond-company-turns-to-contract-sales-to-manage-tough-market-2026-02-11) | 2026-02-11 | 3 |
| BW-MFG-F5 | Diamond cutting & polishing workforce / beneficiation | About 3,250 workers across 16 cutting & polishing factories (2011 baseline); US$550m annual rough diamond sales linked to over 6,000 indirect jobs; 20-30 new factory licences issued as sightholder numbers boomed (2023); BDMA: ‘The industry doubled, but the workforce remained the same’ | [Business Weekly & Review - BDMA President Siddarth Gothi](https://businessweekly.co.bw/news/an-unskilled-and-unproductive-workforce-threaten-diamond-beneficiation) | 2025-05-07 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Size | Manufacturing 5.7 % of GDP; +1.9 % (2025) | Card | F1 | Statistics Botswana |
| 2 | Investment | BITC P14.9 bn facilitated (FY2025) | Card | F2 | BITC |
| 3 | SEZ | Lobatse P437.1 m licensed; 303 jobs | Pin | F3 | SEZA |
| 4 | Diamonds | ODC 3 m ct sold (2025) | Card | F4 | ODC |
| 5 | Beneficiation | 16 factories (2011 baseline) | Card | F5 | BW\&R |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Harnesses, leather, jewellery | Cards | HS | BURS |
| 2 | Markets | SACU, AGOA, EU | Map | TRD-F6 | — |
| 3 | Citizen rules | Reserved manufacturing list | Brief | MAC-F21 | Trade Act |
| 4 | Tax | Manufacturing 15 % | Card | CSP-F6 | KPMG |
| 5 | Standards | BOBS | Brief | — | BOBS |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| SEZs | L1–L4 | Polygon | Occupancy |
| Factories | L2–L5 | Pin | Jobs |
| Industrial land | L2–L4 | Polygon | Availability |
| Logistics | L0–L2 | Line | Corridors |
| Labour pools | L1–L2 | Choropleth | Unemployment |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Logistics |
| L1 District / city or town council | SEZs; Logistics; Labour pools |
| L2 Sub-district \[not loaded\] | SEZs; Factories; Industrial land; Logistics; Labour pools |
| L3 Town / village | SEZs; Factories; Industrial land |
| L4 Ward / plot | SEZs; Factories; Industrial land |
| L5 Site | Factories |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Citizen-reserved list | Entry eligibility |
| SEZ incentives | Returns |
| ODC supply allocation | Beneficiation feedstock |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MFG-A01 | Lobatse SEZ | BW-MFG-F3 | Lobatse | Manufacturer | M (US$1–5 m) |
| BW-MFG-A02 | Cutting and polishing | BW-MFG-F4 | Gaborone | Manufacturer | M (US$1–5 m) |
| BW-MFG-A03 | Mining consumables | BW-MIN-F4 | Francistown | Manufacturer | M (US$1–5 m) |
| BW-MFG-A04 | Reserved food lines (citizens) | BW-MAC-F21 | Districts | Processor | S (US$0.2–1 m) |

(i) Traceable, freshness-gated sweep — 23 templates (sector shock index 6/12; 7 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-MFG-S01 | Automotive harness and component plants (Lobatse SEZ) | M | BW-MFG-F3 (3, 2026-05-28) | 3 | SEZ (3) | 12 | A (robust) | 10 | No | Yes | CORP | 9–18 months |
| BW-MFG-S10 | Construction products (blocks, pavers) | S | BW-CRE-F3 (3, 2026-02-09) | 3 | ROADS (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-MFG-S14 | Textiles and uniforms for public sector | S | BW-MFG-F1 (3, 2026-03) | 3 | PPREF (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-MFG-S21 | Animal-feed pelleting | S | BW-AGR-F1 (3, 2026-09) | 3 | HERD5M (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-MFG-S22 | Steel fabrication for mines and construction | S | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 12 | A (robust) | 10 | No | No | SME | 6–12 months |
| BW-MFG-S02 | Tannery and leather goods (Lobatse) | M | BW-MFG-F3 (3, 2026-05-28) | 3 | SEZ (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | CORP | 12–18 months |
| BW-MFG-S03 | Diamond cutting and polishing (ODC supply rising) | M | BW-MFG-F4 (3, 2026-02-11) | 3 | BENEF (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | CORP | 9–18 months |
| BW-MFG-S05 | Bread and confectionery bakery \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 3–6 months |
| BW-MFG-S06 | Bottled water plant \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 6–12 months |
| BW-MFG-S07 | Peanut butter and spreads \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 6–12 months |
| BW-MFG-S11 | Mining consumables (grinding media, liners) | M | BW-MIN-F4 (3, 2025-12-29) | 3 | COPPER (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 12–18 months |
| BW-MFG-S19 | Meat processing and canning (export) | M | BW-MFG-F3 (3, 2026-05-28) | 3 | SEZ (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | CORP | 12–18 months |
| BW-MFG-S20 | Ice manufacturing \[citizen-reserved\] | S | BW-MAC-F21 (2, 2020-06-01) | 3 | CITRES (3) | 11 | B | 9 | Yes | No | SME | 3–6 months |
| BW-MFG-S09 | Packaging (corrugated, plastics) | S | BW-MFG-F1 (3, 2026-03) | 3 | — (1) | 10 | B | 8 | No | No | SME | 6–12 months |
| BW-MFG-S15 | Industrial maintenance services | S | BW-MFG-F1 (3, 2026-03) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-MFG-S23 | BITC-facilitated investor aftercare services | S | BW-MFG-F2 (2, 2026-09-25) | 2 | BITC (3) | 10 | B | 8 | No | No | SME | 1–6 months |
| BW-MFG-S04 | Jewellery manufacturing and retail | S | BW-MFG-F5 (2, 2025-05-07) | 2 | BENEF (3) | 9 | B | 7 | No | Yes | SME | 6–12 months |
| BW-MFG-S08 | Contract manufacturing for SACU market | S | BW-MFG-F1 (3, 2026-03) | 3 | — (1) | 9 | B | 7 | No | Yes | SME | 6–12 months |
| BW-MFG-S12 | Solar module and BESS assembly | M | BW-GRN-F2 (3, 2026-03-04) | 2 | IPPSOLAR (3) | 9 | B | 7 | No | No | CORP | 18–24 months |
| BW-MFG-S17 | Selebi Phikwe SEZ light industry | S | BW-MFG-F2 (2, 2026-09-25) | 2 | SEZ (3) | 9 | B | 7 | No | No | SME | 9–18 months |
| BW-MFG-S18 | Food processing for export (SACU, AfCFTA) | S | BW-TRD-F5 (2, 2023-02-21) | 2 | AFCFTA (3) | 9 | B | 7 | No | Yes | SME | 9–12 months |
| BW-MFG-S13 | Pharmaceutical generics plant | M | BW-HLT-F4 (2, 2026-02-20) | 2 | PHARMA (3) | 8 | C | 6 | No | No | CORP | 18–24 months |
| BW-MFG-S16 | Soda-ash-based chemicals | M | BW-MFG-F1 (3, 2026-03) | 2 | — (1) | 7 | C | 5 | No | Yes | CORP | 18–24 months |

(j) Botswana products in scope: Polished diamonds (Diamane e e kgabisitsweng, 7102.39); Car wiring harnesses (Megala ya dikoloi, 8544.30); Leather goods (Dilwana tsa letlalo, 4202.21); Bottled water (Metsi a mo dibotlolong, 2201.10); Bread and confectionery (Borotho, 1905.90); Peanut butter (Botoro jwa ditloomo, 2008.11); Ice (Kgapetla, 2201.90); Polished jewellery (Dikgabisa, 7113.19)

Issue 2.0 asset types carried over: Automotive and components; Food and beverage processing; Chemicals, plastics and packaging; Steel and metal fabrication; Textiles, clothing, leather, footwear; Cement and building materials; Industrial parks and SEZ development

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 1; SA dependence (power, imports, rand) 2; Fiscal squeeze 1; Water & drought 0; Livestock disease (FMD) 1; Inflation & rates 1 (index 6/12) |
| Why (evidence-cited) | SA inputs and SACU (TRD-F2); diamonds feed beneficiation (MFG-F4); leather depends on beef (AGR-F2) |
| Diamond downturn | Tier A 5 → A+ 0, A 0, downgraded 5 |
| Citizen-reserved templates | 4 of 23 (BW-MAC-F21, F23) |
| Permits | Manufacturing licence (reserved lines for citizens); SEZ licence — Ministry of Trade; SEZA; 1–6 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | SEZA / BITC |
| Verification owner | BITC; SEZA |

## E8. Water, Sanitation & Waste (WSW)

(a) Scenarios

Investor: network rehabilitation, treatment O\&M, reuse

Trader: pipes, meters, tanks

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-WSW-F1 | Water & electricity real value added, 2025 | Water & Electricity contracted 16.6% in 2025 (Q4 2025: -1.3%); share of GDP 1.3% in 2025 (1.6% in Q4) | [Statistics Botswana, Gross Domestic Product Q4 2025](https://statsbots.org.bw/sites/default/files/publications/Gross%20Domestic%20Product%20Fourth%20Quarter%202025.pdf) | 2026-03 | 3 |
| BW-WSW-F2 | Ministry of Water & Human Settlement budget 2026/27 | Total proposed P4,093,517,315 (development P3,622,651,375; recurrent P470,865,940) vs P3,310,135,818 in 2025/26; Water Supply & Sanitation Networks P2,097,611,107 (57.9% of dev); Water Supply Pipelines P1,154,484,109 (31.9%) | [Ministry of Water & Human Settlement, Committee of Supply statement 2026/27 (Minister Onneetse Ramogapi)](https://botswanaspeaks.gov.bw/media/COMMITTEE%20OF%20SUPPPLY%20SPEECHES/MWHS_COSS%202026%20Parliament.pdf) | 2026-03 | 3 |
| BW-WSW-F3 | North-South Carrier 2.2 progress | About P408.2m spent on NSC 2.2 in 2025/26; project ‘substantially complete’; Mmamashia Water Treatment Plant at 99.5% (due Mar 2026); Tswapong South Phase 1 at 97% (due May 2026); Molepolole WWTP at 87% (due Oct 2026) | [Ministry of Water & Human Settlement, Committee of Supply statement 2026/27](https://botswanaspeaks.gov.bw/media/COMMITTEE%20OF%20SUPPPLY%20SPEECHES/MWHS_COSS%202026%20Parliament.pdf) | 2026-03 | 3 |
| BW-WSW-F4 | Gaborone Dam level swing (drought to spill) | Gaborone Dam at 102.72% and spilling into Notwane River (peak 105.19%) on 23 Feb 2025, up from ‘critically low’ 36% reported 12 Jan 2025 | [Water Utilities Corporation & National Flood Disaster Response Technical Committee joint release (Daily News)](https://dailynews.gov.bw/news-detail/84783) | 2025-02-23 | 3 |
| BW-WSW-F5 | Lesotho-Botswana Water Transfer preparation | SADC PPDF approved US$1.83m to advance the project (ESIA + feasibility); scheme spans more than 700 km from Lesotho highlands via South Africa; ESIA and finance/legal/institutional studies under way (2027 completion stated by MWHS is not on the cited page — corrected after second-pass check) | [SADC Secretariat press release](https://www.sadc.int/latest-news/sadc-ppdf-approves-us183-million-landmark-lesotho-botswana-water-transfer-project) | 2026-02-11 | 3 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Sector | Water & electricity −16.6 % (2025) | Card | F1 | Statistics Botswana |
| 2 | Budget | P4.09 bn ministry budget; P2.1 bn networks | Card | F2 | MWHS |
| 3 | NSC 2.2 | Mmamashia 99.5 % | Pin | F3 | MWHS |
| 4 | Dams | Gaborone Dam 36 % → 102.7 % (2025) | Chart | F4 | WUC |
| 5 | Transfer | Lesotho–Botswana US$1.83 m PPDF | Brief | F5 | SADC |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Pipes, meters, tanks | Cards | HS | BURS |
| 2 | Buyer | WUC | List | — | WUC |
| 3 | Procurement | PPRA; citizen preferences | Brief | MAC-F22 | PPRA |
| 4 | Standards | BOBS | Brief | — | BOBS |
| 5 | Imports | From SA | Route | — | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Dams | L1–L5 | Pin | Level |
| Pipelines (NSC) | L0–L2 | Line | Flow |
| Treatment works | L2–L5 | Pin | Capacity |
| Village schemes | L2–L4 | Point | Status |
| Wastewater | L2–L4 | Pin | Reuse |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Pipelines (NSC) |
| L1 District / city or town council | Dams; Pipelines (NSC) |
| L2 Sub-district \[not loaded\] | Dams; Pipelines (NSC); Treatment works; Village schemes; Wastewater |
| L3 Town / village | Dams; Treatment works; Village schemes; Wastewater |
| L4 Ward / plot | Dams; Treatment works; Village schemes; Wastewater |
| L5 Site | Dams; Treatment works |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| WUC tender calendar | Contracting |
| Losses by network | Leak business |
| Reuse permits | Agri reuse |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-WSW-A01 | Network rehabilitation | BW-WSW-F2 | Gaborone, Francistown | Contractor | M (US$1–5 m) |
| BW-WSW-A02 | Treatment O\&M | BW-WSW-F3 | Gaborone | Operator | M (US$1–5 m) |
| BW-WSW-A03 | Village boreholes | BW-WSW-F2 | Districts | Contractor | S (US$0.2–1 m) |
| BW-WSW-A04 | Reuse | BW-WSW-F2 | Peri-urban | BOO | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 18 templates (sector shock index 4/12; 4 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-WSW-S02 | Leak detection and non-revenue water services | S | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-WSW-S03 | Water-treatment O\&M (Mmamashia, NSC) | M | BW-WSW-F3 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | CORP | 6–12 months |
| BW-WSW-S04 | Boreholes and village water schemes | S | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-WSW-S06 | Water meters and billing | S | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | SME | 3–9 months |
| BW-WSW-S10 | Water-quality laboratory | S | BW-WSW-F3 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-WSW-S12 | Sanitation (on-site systems) for villages | S | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | DFI | 3–6 months |
| BW-WSW-S15 | Water-sector skills training | S | BW-WSW-F3 (3, 2026-03) | 3 | TVET (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-WSW-S17 | Pump and pipeline maintenance (NSC) | S | BW-WSW-F3 (3, 2026-03) | 3 | WATERDEV (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-WSW-S01 | Water network rehabilitation (P2.1 bn programme) | M | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-WSW-S05 | Wastewater reuse for agriculture | M | BW-WSW-F2 (3, 2026-03) | 3 | WATERDEV (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | DFI | 18–24 months |
| BW-WSW-S08 | Lesotho–Botswana transfer studies and engineering | S | BW-WSW-F5 (3, 2026-02-11) | 3 | LBWT (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | SME | 3–9 months |
| BW-WSW-S09 | Pipe and tank manufacturing | M | BW-WSW-F3 (3, 2026-03) | 3 | WATERDEV (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 12–18 months |
| BW-WSW-S07 | Rainwater harvesting systems | S | BW-WSW-F4 (3, 2025-02-23) | 3 | — (1) | 10 | B | 8 | No | No | TRD | 1–6 months |
| BW-WSW-S14 | Bulk water transfer BOT (Lesotho–Botswana) | XL | BW-WSW-F5 (3, 2026-02-11) | 3 | LBWT (3) | 10 | B | 8 | No | No | INF | 36–48 months |
| BW-WSW-S16 | Water-tanker and bulk-water delivery | S | BW-WSW-F4 (3, 2025-02-23) | 3 | — (1) | 10 | B | 8 | No | No | SME | 1–3 months |
| BW-WSW-S11 | Solid-waste collection and recycling | S | BW-WSW-F2 (3, 2026-03) | 3 | — (1) | 9 | B | 7 | No | No | SME | 3–9 months |
| BW-WSW-S18 | Industrial water reuse for mines | M | BW-WSW-F1 (3, 2026-03) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 12–18 months |
| BW-WSW-S13 | Desalination of brackish groundwater (Kgalagadi) | S | BW-WSW-F1 (3, 2026-03) | 2 | — (1) | 8 | C | 6 | No | No | DFI | 12–18 months |

Issue 2.0 asset types carried over: Bulk water and dams; Water and wastewater treatment; Desalination; Non-revenue water and metering; Solid waste and recycling

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 0; Fiscal squeeze 2; Water & drought 2; Livestock disease (FMD) 0; Inflation & rates 0 (index 4/12) |
| Why (evidence-cited) | Budget-funded (WSW-F2); dam volatility (WSW-F4) |
| Diamond downturn | Tier A 8 → A+ 0, A 8, downgraded 0 |
| Citizen-reserved templates | 0 of 18 (BW-MAC-F21, F23) |
| Permits | Water rights; WUC contracts — Water Resources Board; WUC; 3–12 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | WUC procurement |
| Verification owner | WUC; MWHS |

## E9. Transport, Corridors & Logistics (TRN)

(a) Scenarios

Investor: Kazungula corridor logistics, rail and border services

Trader: forwarding, bonded transit

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-TRN-F1 | Rail freight volume and revenue, Q3 2025 | 242,067 net tonnes moved by rail in Q3 2025 (+12.7% q/q from 214,854); rail freight revenue P60.5m (+13.8% from P53.2m) | [Statistics Botswana, Transport & Infrastructure Stats Brief Q3 2025](https://www.statsbots.org.bw/sites/default/files/Transport%20and%20Infrastructure%20Stats%20brief%20Quarter%203%2C%202025.pdf) | 2026-01 | 3 |
| BW-TRN-F2 | Air passenger movements, Q3 2025 | Air passenger movements 273,560 in Q3 2025 (+11.9% from 244,424); aircraft movements 26,453 (+10.7%); SSKIA 117,687 passengers = 43.0% of total | [Statistics Botswana, Transport & Infrastructure Stats Brief Q3 2025](https://www.statsbots.org.bw/sites/default/files/Transport%20and%20Infrastructure%20Stats%20brief%20Quarter%203%2C%202025.pdf) | 2026-01 | 3 |
| BW-TRN-F3 | Kazungula Bridge / One Stop Border Post | Kazungula Bridge Authority launched jointly by Presidents Boko and Hichilema; OSBP to move to 24-hour operation; truck traffic cited as able to rise from 400 to 1,000 a day | [Daily News (BOPA) - Presidents Duma Boko & Hakainde Hichilema](https://dailynews.gov.bw/news-detail/90239) | 2026-02-24 | 3 |
| BW-TRN-F4 | Mosetse-Kazungula-Livingstone (MKL) rail | \~430 km line (365 km Botswana: Mosetse to Kazungula Bridge; 65 km Zambia to Livingstone); governments directed all outstanding studies finalised by end-2026; bridge has pre-installed rail deck. 2026/27 budget supports MKL and Mmamabula-Lephalale lines (no amounts) | [Railmarket.com](https://railmarket.com/news/infrastructure/54194-zambia-and-botswana-fast-track-430-km-mkl-rail-project) | 2026-04-06 | 2 |
| BW-TRN-F5 | Air Botswana fleet and route cuts | Fleet of 6 aircraft (E170 and ERJ145 grounded); Gaborone-Durban carried 3,432 passengers before closing 5 Oct 2025; Gaborone-Windhoek 3,061 before closing 15 Aug 2025; \~P355.9m invested in fleet renewal over five years; 11 pilots resigned Jan-Jun 2026 | [Daily News (BOPA) - Minister of Transport & Infrastructure Noah Salakae in Parliament](https://dailynews.gov.bw/news-detail/92571) | 2026-08-05 | 3 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Rail | 242,067 t (Q3 2025); revenue P60.5 m | Chart | F1 | Statistics Botswana |
| 2 | Air | 273,560 passengers (Q3 2025) | Chart | F2 | Statistics Botswana |
| 3 | Kazungula | 24-hour OSBP; 400 → 1,000 trucks/day | Pin | F3 | Presidency |
| 4 | Rail project | MKL 430 km studies to end-2026 | Line | F4 | Railmarket |
| 5 | Airline | Air Botswana 6 aircraft; route cuts | Alert | F5 | Ministry |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Corridors | Trans-Kalahari, North-South, Kazungula | Route | F3 | SADC |
| 2 | Borders | OSBPs | Pin | F3 | — |
| 3 | Customs | BURS/SACU | Brief | TRD-F3 | BURS |
| 4 | Ports | Walvis Bay, Durban | Route | — | — |
| 5 | Insurance | Cargo | Brief | — | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Corridors | L0–L1 | Line | Trucks |
| Border posts | L1–L4 | Pin | Dwell time |
| Rail network | L0–L2 | Line | Tonnes |
| Airports | L1–L4 | Pin | Passengers |
| Dry ports | L2–L4 | Pin | Capacity |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Corridors; Rail network |
| L1 District / city or town council | Corridors; Border posts; Rail network; Airports |
| L2 Sub-district \[not loaded\] | Border posts; Rail network; Airports; Dry ports |
| L3 Town / village | Border posts; Airports; Dry ports |
| L4 Ward / plot | Border posts; Airports; Dry ports |
| L5 Site | — |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Border dwell times | Pricing |
| Transit volumes to Zambia/DRC | Hub sizing |
| Air route gaps | Charter opportunity |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-TRN-A01 | Kazungula hub | BW-TRN-F3 | Kasane | Operator | M (US$1–5 m) |
| BW-TRN-A02 | Truck stops | BW-TRN-F3 | Corridors | Operator | S (US$0.2–1 m) |
| BW-TRN-A03 | Rail sidings | BW-TRN-F1 | Francistown | Logistics | S (US$0.2–1 m) |
| BW-TRN-A04 | Charter airline | BW-TRN-F5 | Gaborone, Maun | Operator | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 22 templates (sector shock index 4/12; 5 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-TRN-S02 | Truck stops and services on Kazungula corridor | S | BW-TRN-F3 (3, 2026-02-24) | 3 | KAZUNGULA (3) | 12 | A (robust) | 10 | No | Yes | SME | 6–12 months |
| BW-TRN-S03 | Clearing and forwarding at border posts | S | BW-TRN-F3 (3, 2026-02-24) | 3 | KAZUNGULA (3) | 12 | A (robust) | 10 | No | Yes | SME | 1–6 months |
| BW-TRN-S11 | Driver and logistics training | S | BW-TRN-F1 (3, 2026-01) | 3 | TVET (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-TRN-S20 | Border-post services (forex, retail, parking) | S | BW-TRN-F3 (3, 2026-02-24) | 3 | KAZUNGULA (3) | 12 | A (robust) | 10 | No | Yes | SME | 3–6 months |
| BW-TRN-S01 | Kazungula corridor logistics hub (24-hour OSBP) | M | BW-TRN-F3 (3, 2026-02-24) | 3 | KAZUNGULA (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | CORP | 9–18 months |
| BW-TRN-S12 | Road maintenance contracting | M | BW-CRE-F3 (3, 2026-02-09) | 3 | ROADS (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | No | CORP | 6–12 months |
| BW-TRN-S19 | Bonded trucking for transit cargo (Zambia, DRC) | M | BW-TRN-F3 (3, 2026-02-24) | 3 | KAZUNGULA (3) | 11 | B (gated: shock (RA \< 10)) | 9 | No | Yes | TRD | 3–9 months |
| BW-TRN-S06 | Regional airline services / charter (Air Botswana cuts) | M | BW-TRN-F5 (3, 2026-08-05) | 3 | AIRBW (3) | 10 | B | 8 | No | Yes | CORP | 12–18 months |
| BW-TRN-S09 | Cold-chain trucking (beef, produce) | S | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 10 | B | 8 | No | No | SME | 3–6 months |
| BW-TRN-S10 | Fleet telematics and route software | S | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 10 | B | 8 | No | No | SME | 3–6 months |
| BW-TRN-S14 | Air-cargo handling for perishables and diamonds | S | BW-TRN-F2 (3, 2026-01) | 3 | — (1) | 10 | B | 8 | No | Yes | SME | 6–12 months |
| BW-TRN-S17 | Tourism transfers (Maun, Kasane) | S | BW-TOU-F2 (3, 2026-08) | 3 | — (1) | 10 | B | 8 | No | Yes | SME | 3–6 months |
| BW-TRN-S22 | Air Botswana fleet leasing partnerships | M | BW-TRN-F5 (3, 2026-08-05) | 3 | AIRBW (3) | 10 | B | 8 | No | No | INF | 9–18 months |
| BW-TRN-S04 | Rail freight services and sidings | S | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-TRN-S07 | Aircraft maintenance and ground handling | S | BW-TRN-F2 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | SME | 6–12 months |
| BW-TRN-S08 | Dry port and bonded warehousing (Gaborone, Francistown) | M | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 12–18 months |
| BW-TRN-S15 | Walvis Bay corridor freight brokerage | S | BW-MIN-F3 (3, 2026-03-04) | 3 | — (1) | 9 | B | 7 | No | Yes | TRD | 1–6 months |
| BW-TRN-S16 | Rail rolling-stock maintenance | M | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 9–18 months |
| BW-TRN-S21 | Rail-freight terminal at Francistown | M | BW-TRN-F1 (3, 2026-01) | 3 | — (1) | 9 | B | 7 | No | No | CORP | 12–18 months |
| BW-TRN-S05 | MKL rail studies and early works | M | BW-TRN-F4 (2, 2026-04-06) | 2 | MKLRAIL (3) | 8 | C | 6 | No | No | CORP | 18–36 months |
| BW-TRN-S13 | Urban bus and taxi fleet finance | S | BW-TRN-F2 (3, 2026-01) | 2 | — (1) | 8 | C | 6 | No | No | SME | 3–9 months |
| BW-TRN-S18 | Kazungula bridge rail deck integration | L | BW-TRN-F4 (2, 2026-04-06) | 2 | MKLRAIL (3) | 8 | C | 6 | No | No | INF | 24–36 months |

(j) Botswana products in scope: Logistics (Kazungula corridor) (Dipalangwang, —)

Issue 2.0 asset types carried over: Roads (national, provincial, district, municipal); Rail freight and passenger; Ports and terminals; Airports and air cargo; Logistics parks, dry ports, warehousing; Urban public transport

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 1; SA dependence (power, imports, rand) 1; Fiscal squeeze 1; Water & drought 0; Livestock disease (FMD) 0; Inflation & rates 1 (index 4/12) |
| Why (evidence-cited) | Transit and mining freight (TRN-F1); Air Botswana fiscal support (TRN-F5) |
| Diamond downturn | Tier A 4 → A+ 0, A 4, downgraded 0 |
| Citizen-reserved templates | 0 of 22 (BW-MAC-F21, F23) |
| Permits | Road transport permits; operator licences — Department of Road Transport and Safety; 1–3 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | Kazungula Bridge Authority / Botswana Railways |
| Verification owner | MTI; Kazungula Bridge Authority |

## E10. Digital, Mobile Money & 5G (ICT)

(a) Scenarios

Investor: 5G towers, fibre, mobile-money services, BPO

Trader: devices, networking kit

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ICT-F1 | Mobile cellular subscriptions, Q1 2025 | 4,195,416 mobile cellular subscriptions in Q1 2025 (+1.5% q/q from 4,134,666; -5.2% y/y from 4,425,582) | [Statistics Botswana, ICT Stats Brief Q1 2025](https://statsbots.org.bw/sites/default/files/Botswana%20Information%20%26%20Communication%20Technology%20Stats%20Brief%20Q1%202025.pdf) | 2025-10 | 3 |
| BW-ICT-F2 | Internet subscriptions, Q1 2025 | Total internet subscriptions 3,178,217 (-0.9% q/q, +4.1% y/y); mobile internet 2,985,563; fixed internet 192,654 (+34.1% y/y) | [Statistics Botswana, ICT Stats Brief Q1 2025](https://statsbots.org.bw/sites/default/files/Botswana%20Information%20%26%20Communication%20Technology%20Stats%20Brief%20Q1%202025.pdf) | 2025-10 | 3 |
| BW-ICT-F3 | Mobile money subscriptions, Q1 2025 | 1,187,241 mobile money subscriptions in Q1 2025 (-0.7% q/q from 1,195,601; +4.5% y/y from 1,136,023) | [Statistics Botswana, ICT Stats Brief Q1 2025](https://statsbots.org.bw/sites/default/files/Botswana%20Information%20%26%20Communication%20Technology%20Stats%20Brief%20Q1%202025.pdf) | 2025-10 | 3 |
| BW-ICT-F4 | 5G rollout and operator capex | BTC to launch 5G in selected Gaborone areas in Oct 2026 with \>P240m 2026/27 capex (5G, 4G, capacity) after \>P225.5m in 2025/26; upgrades at 599 sites; 97% population coverage for 2G and 4G; Mascom and Orange launched commercial 5G in 2022 | [TechAfrica News - BTC CEO Jurgen Peschel](https://techafricanews.com/2026/08/31/btc-sets-october-target-for-5g-commercial-launch-in-botswana/) | 2026-08-31 | 2 |
| BW-ICT-F5 | BoFiNet local-access fibre rollout | P43m project extended fibre to Moshupa, Ramotswa/Taung and Thamaga, connecting 191 customers (68/66/57) and creating 210 construction jobs | [TechAfrica News](https://techafricanews.com/2026/08/14/bofinet-completes-p43m-fibre-project-connects-three-botswana-villages/) | 2026-08-14 | 2 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Mobile | 4.2 m subscriptions | Card | F1 | Statistics Botswana |
| 2 | Internet | 3.18 m; fixed +34 % | Card | F2 | Statistics Botswana |
| 3 | Mobile money | 1.19 m subscriptions | Card | F3 | Statistics Botswana |
| 4 | 5G | BTC launch Oct 2026; P240 m capex | Pin | F4 | BTC |
| 5 | Fibre | BoFiNet P43 m local access | Pin | F5 | BoFiNet |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Devices, network gear | Cards | HS 85 | BURS |
| 2 | Licences | BOCRA | Brief | — | BOCRA |
| 3 | Payments | Mobile money | Card | F3 | BoB |
| 4 | Sandbox | BoB sandbox | Brief | FIN-F6 | BoB |
| 5 | Imports | From SA | Route | — | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Coverage | L1–L3 | Choropleth | 2G/4G/5G |
| Fibre | L2–L4 | Line | Customers |
| Towers | L2–L5 | Pin | Sites |
| Agents | L2–L4 | Point | Density |
| Data centres | L2–L5 | Pin | MW |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | — |
| L1 District / city or town council | Coverage |
| L2 Sub-district \[not loaded\] | Coverage; Fibre; Towers; Agents; Data centres |
| L3 Town / village | Coverage; Fibre; Towers; Agents; Data centres |
| L4 Ward / plot | Fibre; Towers; Agents; Data centres |
| L5 Site | Towers; Data centres |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| BTC site list | Tower services |
| Sandbox cohort | Fintech entry |
| Village connectivity gaps | ISP siting |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ICT-A01 | 5G towers | BW-ICT-F4 | Gaborone | Towerco | M (US$1–5 m) |
| BW-ICT-A02 | Fibre contractors | BW-ICT-F5 | South-East, Kweneng | Contractor | S (US$0.2–1 m) |
| BW-ICT-A03 | Mobile-money agents | BW-ICT-F3 | Districts | Fintech | S (US$0.2–1 m) |
| BW-ICT-A04 | BPO seats | BW-CSP-F5 | Gaborone | Operator | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 17 templates (sector shock index 2/12; 2 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-ICT-S07 | Cybersecurity for banks and SOEs | S | BW-FIN-F6 (3, 2026-03-04) | 3 | SANDBOX (3) | 12 | A+ (robust) | 11 | No | No | SME | 1–6 months |
| BW-ICT-S10 | ICT skills bootcamps (youth unemployment 28.9 %) | S | BW-EDU-F5 (3, 2026-03) | 3 | TVET (3) | 12 | A+ (robust) | 11 | No | No | SME | 1–6 months |
| BW-ICT-S14 | Digital ID and KYC services | S | BW-FIN-F6 (3, 2026-03-04) | 3 | SANDBOX (3) | 12 | A+ (robust) | 11 | No | No | SME | 3–6 months |
| BW-ICT-S16 | E-government payment integration | S | BW-ICT-F3 (3, 2025-10) | 3 | SANDBOX (3) | 12 | A+ (robust) | 11 | No | No | SME | 3–6 months |
| BW-ICT-S03 | Mobile-money agents and merchant services | S | BW-ICT-F3 (3, 2025-10) | 3 | SANDBOX (3) | 11 | A | 10 | No | No | SME | 3–6 months |
| BW-ICT-S02 | Fibre local-access contracting (BoFiNet) | S | BW-ICT-F5 (2, 2026-08-14) | 2 | FIBRE (3) | 10 | B | 9 | No | No | SME | 1–6 months |
| BW-ICT-S06 | Govtech e-services integrator | S | BW-ICT-F2 (3, 2025-10) | 3 | — (1) | 10 | B | 9 | No | No | SME | 3–9 months |
| BW-ICT-S08 | Software studio (IFSC 15 %) | S | BW-CSP-F6 (2, 2026-02-10) | 2 | IFSC (3) | 10 | B | 9 | No | Yes | SME | 3–6 months |
| BW-ICT-S09 | Device retail and repair | S | BW-ICT-F1 (3, 2025-10) | 3 | — (1) | 10 | B | 9 | No | No | SME | 1–6 months |
| BW-ICT-S13 | IoT for mines and utilities | S | BW-MIN-F4 (3, 2025-12-29) | 3 | — (1) | 10 | B | 9 | No | No | SME | 3–9 months |
| BW-ICT-S01 | 5G and tower services (BTC capex P240 m) | M | BW-ICT-F4 (2, 2026-08-31) | 2 | G5 (3) | 9 | B | 8 | No | No | CORP | 9–18 months |
| BW-ICT-S05 | Fixed-wireless ISP for villages | S | BW-ICT-F2 (3, 2025-10) | 3 | — (1) | 9 | B | 8 | No | No | SME | 6–12 months |
| BW-ICT-S11 | Agritech platforms (livestock, markets) | S | BW-AGR-F1 (3, 2026-09) | 3 | — (1) | 9 | B | 8 | No | No | SME | 3–9 months |
| BW-ICT-S12 | Call centre / BPO seats | M | BW-CSP-F5 (2, 2025-03-18) | 2 | BPO (3) | 9 | B | 8 | No | Yes | CORP | 3–9 months |
| BW-ICT-S15 | Mining and tourism connectivity (satellite + LTE) | S | BW-ICT-F2 (3, 2025-10) | 3 | — (1) | 9 | B | 8 | No | No | SME | 3–9 months |
| BW-ICT-S17 | Data-centre power from CBM (Kala) | S | BW-OGS-F6 (2, 2026-04-24) | 2 | CBM (3) | 9 | B | 8 | No | No | SME | 9–18 months |
| BW-ICT-S04 | Data-centre and cloud services | M | BW-OGS-F6 (2, 2026-04-24) | 2 | — (1) | 6 | C | 5 | No | No | INF | 18–24 months |

Issue 2.0 asset types carried over: Fibre (backbone, metro, FTTH); Mobile towers and rural coverage; Data centres and cloud; Submarine cables and landing stations; Digital services, BPO and software; E-commerce and digital payments platforms

(k) Shock rationale, diamond downturn, citizen rules, permits and regulatory changes

| Focus | Botswana-specific |
| :-: | :-: |
| Shock profile | Diamond market 0; SA dependence (power, imports, rand) 1; Fiscal squeeze 0; Water & drought 0; Livestock disease (FMD) 0; Inflation & rates 1 (index 2/12) |
| Why (evidence-cited) | Imported equipment (ICT-F4); consumer spending under 9.3 % inflation (MAC-F6) |
| Diamond downturn | Tier A 5 → A+ 4, A 1, downgraded 0 |
| Citizen-reserved templates | 0 of 17 (BW-MAC-F21, F23) |
| Permits | BOCRA licences — BOCRA; 1–6 months \[VERIFY\] |
| Regulatory changes | — |
| Institution to call | BTC / BoFiNet |
| Verification owner | BOCRA; BTC; BoFiNet |

## E11. Construction, Roads & Housing (CRE)

(a) Scenarios

Investor: roads, social housing, citizen-contractor finance

Trader: building materials, aggregates

(b) Graded fact base — Botswana

| ID | Fact | Value | Source | Date | Grade |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-CRE-F1 | Construction share of GDP and growth, 2025 | Construction = 12.0% of GDP in 2025 (12.1% in Q4); real value added -0.8% in 2025 and -2.3% y/y in Q4 2025 | [Statistics Botswana, Gross Domestic Product Q4 2025](https://statsbots.org.bw/sites/default/files/publications/Gross%20Domestic%20Product%20Fourth%20Quarter%202025.pdf) | 2026-03 | 3 |
| BW-CRE-F2 | Government development budget 2026/27 | Development expenditure P23.38bn (P0.37bn / 1.57% below P23.75bn in 2025/26); total expenditure & net lending P103.58bn; overall deficit P26.35bn = 8.9% of GDP; maintenance P1.85bn | [Ministry of Finance, 2026 Budget Speech](https://www.gov.bw/sites/default/files/2026-02/2026%20Budget%20Speech.pdf) | 2026-02-09 | 3 |
| BW-CRE-F3 | Road construction pipeline 2026/27 | P3.02bn earmarked for ongoing roads projects (incl. Francistown-Nata 200 km and Palapye-Martins Drift 111 km reconstruction); Transport & Infrastructure development budget P3.86bn (16.52%) | [Ministry of Finance, 2026 Budget Speech](https://www.gov.bw/sites/default/files/2026-02/2026%20Budget%20Speech.pdf) | 2026-02-09 | 3 |
| BW-CRE-F4 | Social housing allocation 2026/27 | P702.96m earmarked for social housing projects (incl. Bonno schemes) within Water & Human Settlement P3.62bn (15.50%) development vote | [Ministry of Finance, 2026 Budget Speech](https://www.gov.bw/sites/default/files/2026-02/2026%20Budget%20Speech.pdf) | 2026-02-09 | 3 |
| BW-CRE-F5 | Botswana Housing Corporation results FY2024/25 | Revenue P740m (P525m prior year); unaudited loss before tax \~P102m; 776 of 1,023 targeted commercial & social units delivered in 2024/25; rental portfolio 9,761 properties; vacancy cut to 0.67% from 1.8% | [Botswana Housing Corporation Annual Report 2024/25 (BSE disclosure)](https://apis.bse.co.bw/storage/disclosures/07/2026/7060.pdf) | 2026-07 | 3 |

(c) Investor chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Size | Construction 12.0 % of GDP; −0.8 % | Card | F1 | Statistics Botswana |
| 2 | Budget | Development P23.38 bn | Card | F2 | MoF |
| 3 | Roads | P3.02 bn ongoing roads | Line | F3 | MoF |
| 4 | Housing | Social housing P702.96 m | Card | F4 | MoF |
| 5 | BHC | 776 units; revenue P740 m | Card | F5 | BHC |

(d) Trader chain answered

| \# | Question | Information types | Map behaviour | Evidence | Institution / role |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | Products | Cement, steel, aggregates | Cards | HS | BURS |
| 2 | Procurement | Citizen preferences | Brief | MAC-F22 | PPRA |
| 3 | Ownership | 35 reserved service sectors | Brief | MAC-F23 | — |
| 4 | Imports | From SA | Route | — | — |
| 5 | Prices | Building costs \[VERIFY\] | Card | — | — |

(e) Map stack

| Layer | Levels | Geometry | Illumination |
| :-: | :-: | :-: | :-: |
| Road projects | L0–L2 | Line | Status |
| Housing projects | L2–L5 | Pin | Units |
| Quarries | L2–L5 | Pin | Permits |
| Public buildings | L2–L5 | Pin | Budget |
| Land | L2–L4 | Polygon | Availability |

(f) What shows at each level

| Level | Layers |
| :-: | :-: |
| L0 Country | Road projects |
| L1 District / city or town council | Road projects |
| L2 Sub-district \[not loaded\] | Road projects; Housing projects; Quarries; Public buildings; Land |
| L3 Town / village | Housing projects; Quarries; Public buildings; Land |
| L4 Ward / plot | Housing projects; Quarries; Public buildings; Land |
| L5 Site | Housing projects; Quarries; Public buildings |

(g) Additional information types

| Information type | Why |
| :-: | :-: |
| Tender pipeline | Contracting |
| Citizen JV rules | Foreign entry |
| Land allocation | Housing |

(h) Anchor opportunities

| Opp ID | Opportunity | Evidence | Placement | Model | Band |
| :-: | :-: | :-: | :-: | :-: | :-: |
| BW-CRE-A01 | Road subcontracts | BW-CRE-F3 | Central | Contractor | M (US$1–5 m) |
| BW-CRE-A02 | Social housing | BW-CRE-F4 | Gaborone, Francistown | Contractor | M (US$1–5 m) |
| BW-CRE-A03 | Citizen-contractor finance | BW-MAC-F22 | National | Fintech | S (US$0.2–1 m) |
| BW-CRE-A04 | Student housing | BW-EDU-F3 | Gaborone | Developer | M (US$1–5 m) |

(i) Traceable, freshness-gated sweep — 18 templates (sector shock index 6/12; 7 in the diamond downturn)

| Opp ID | Opportunity | Band | Evidence (E, date) | D | Policy (P\*) | Score | Tier | RA | Citizen-reserved | FX earner | Persona | Time to revenue |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BW-CRE-S06 | Facility management for public buildings | S | BW-CRE-F2 (3, 2026-02-09) | 3 | DEVBUD (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-CRE-S08 | Engineering and QS consultancy | S | BW-CRE-F2 (3, 2026-02-09) | 3 | DEVBUD (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-CRE-S09 | Construction equipment rental | S | BW-CRE-F3 (3, 2026-02-09) | 3 | ROADS (3) | 12 | A (robust) | 10 | No | No | SME | 3–6 months |
| BW-CRE-S12 | Construction artisan training | S | BW-CRE-F1 (3, 2026-03) | 3 | TVET (3) | 12 | A (robust) | 10 | No | No | SME | 1–6 months |
| BW-CRE-S15 | Road-construction materials testing |  |  |  |  |  |  |  |  |  |  |  |
