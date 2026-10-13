# Table of Contents

# Document Control

| **Item**                   | **Entry**                                                                                                                                                                                                                                      |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Document ID                | TBCA-AIIM-INFO-CAT-2.0                                                                                                                                                                                                                         |
| Supersedes                 | TBCA-AIIM-INFO-CAT-1.0 (09 Oct 2026, Issue 1.0)                                                                                                                                                                                                |
| Issue / status             | Issue 2.0 — Controlled draft for Board, Product and Data Bank review                                                                                                                                                                           |
| Issue date                 | 09 October 2026                                                                                                                                                                                                                                |
| Prepared by                | Opus 5.5 (Max) for The Business Clinic.Africa                                                                                                                                                                                                  |
| Model country              | **South Africa (ZAF)** — every information type is defined first against South African institutions and data, then replicated to the other 53 countries through the role-based replication table (Part B3)                                     |
| First replication instance | **Malawi (MWI)** — used for the pigeon-pea worked example because South Africa is not a commercial pigeon-pea producer, and as the second instance for roads                                                                                   |
| Companion files            | `TBCA_AIIM_Deep_Registers_2.0.xlsx` (information-type register, investor and trader chains by asset and commodity, opportunity register, commodity/HS register, map-layer register, replication template, 54-country activation list, sources) |
| Companion documents        | TBCA AIIM Data Bank Blueprint v1.0; AIIM Transaction Ecosystem Blueprint v1.0; TBCA-AIIM-INFO-CAT-1.0                                                                                                                                          |

## Interpretation Control

| **Marker**        | **Meaning**                                                                                                                                                                                                                         |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **\[MAP\]**       | Drawn on the AIIM map (pin, peg, line, polygon, raster, flow, label) in the free orientation layer at the stated precision                                                                                                          |
| **\[BRIEF\]**     | Carried in a Premium Brief or Embedded Service; may be referenced from the map                                                                                                                                                      |
| **\[MAP+BRIEF\]** | Summary/locator on the map; full record, model or evidence in a Brief                                                                                                                                                               |
| **\[SOURCED\]**   | A value taken from a cited public source on or before 09 Oct 2026; the source and its date are given beside it. Sourced values are evidence for design and illustration and must be re-verified by the Data Bank before publication |
| **\[COMPUTED\]**  | Derived by Opus 5.5 from sourced values; the method is stated                                                                                                                                                                       |
| **\[VERIFY\]**    | Must be confirmed at onboarding                                                                                                                                                                                                     |
| **\[PROPOSED\]**  | TBCA design choice in this document                                                                                                                                                                                                 |
| **Conflict**      | Two sources disagree; both are shown and the Data Bank conflict rule applies (do not average)                                                                                                                                       |

**What “50× deeper” means in this issue.** Issue 1.0 named information
*types* at sector level. Issue 2.0 goes down four further levels:

1.  To the individual **asset type and commodity**: 97 investable asset
    types and 85 traded commodities.
2.  To the full **must-find chains**: a 45-question investor chain and a
    40-question trader chain applied to every asset and commodity.
3.  To **real sourced values** for the two worked examples.
4.  To the **opportunity level**: value-chain gaps converted into
    opportunity records that seed every country’s and every sector’s
    Opportunities list.

The Excel companion holds the full cross-product, many thousands of
rows, so the document stays readable. \# PART A — South Africa as the
Model Country Pack

## A1. Why South Africa is the model

South Africa has the most complete public information structure on the
continent for the AIIM use-case:

- **Boundaries and statistics:** a three-tier municipal system with
  published boundaries (Municipal Demarcation Board, Stats SA).
- **Land:** a national cadastre and deeds system (Chief
  Surveyor-General, Deeds Offices).
- **Environment:** a national environmental screening tool (DFFE).
- **Roads:** a national roads agency with network, condition and project
  disclosures (SANRAL), plus provincial and municipal road asset
  management systems.
- **Grain markets:** a commodity derivatives exchange (JSE/SAFEX) and
  grain-information service (SAGIS) with stock and price data.
- **Energy:** a published grid-connection capacity assessment and an IPP
  procurement office.
- **Trade:** a full customs tariff book (SARS) and an exchange-control
  manual (SARB).

AIIM therefore defines each information type, its map behaviour and its
brief placement **once, against South African institutions**. Every
other country is then filled by *role*, not by name. Example: “Crop
estimates” is the Crop Estimates Committee in South Africa and the
Ministry of Agriculture’s crop estimates in Malawi.

## A2. Replication method (54-country roll-out)

| **Step** | **Action**                                                                                                                                | **Output**                   |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| R1       | Freeze the SA pack: all information types, layers, briefs and opportunity templates with SA sources                                       | ZAF pack v1                  |
| R2       | For each target country, fill the role-based institution table (B3)                                                                       | Country institution map      |
| R3       | Fill the administrative crosswalk (ADM1–ADM3, settlements) and boundary source                                                            | Country geography pack       |
| R4       | For each information type, find the country source in the order: sovereign → regional body → international → TBCA field data; grade A/B/C | Country source map           |
| R5       | Mark each information type as Available / Partial / Not available (coverage score)                                                        | Coverage dashboard           |
| R6       | Seed the country Opportunities list from the opportunity templates (Part F/G gaps) wherever the gap is confirmed by local evidence        | Country opportunity register |
| R7       | Pass the country activation gate (Transaction Blueprint): source quality, legal, support                                                  | Country live                 |

Order of activation follows the Transaction Blueprint: South Africa MVP
→ regional packs → 54-country activation.

# PART B — Master Prompt and Subsequent Prompts (Issue 2.0)

## B1. Master Prompt MP-AIIM-INFO-2.0 (copy as one block)

> **ROLE.** You are the AIIM Chief Information Architect and Engagement
> Manager for The Business Clinic.Africa (TBCA). You work to the
> analytical standard of a top-tier strategy consultancy: answer first,
> issue-tree structured, mutually exclusive and collectively exhaustive,
> every number sourced or its method stated.
>
> **OBJECTIVE.** For every investable asset type and every traded
> commodity in all 18 AIIM sectors, specify **every information type**
> an actual or potential investor or trader must find to reach an
> investment or trade decision. For each, specify how the AIIM map shows
> it at Country, Region/Province, District, City, Municipality, Town and
> Site level. Also specify what is held in Premium Briefs and Embedded
> Services, written to near-feasibility depth.
>
> **MODEL COUNTRY.** Define everything first for **South Africa** using
> South African institutions and datasets. Then express each source as a
> *role* so that the same information type can be filled in each of the
> other 53 countries. Use Malawi as the first replication test.
>
> **DEPTH TESTS (apply to every asset and commodity).** (a) The
> **45-question Investor Chain** (IQ01–IQ45) and the **40-question
> Trader Chain** (TQ01–TQ40) are answered with named information types,
> a map behaviour and a source role. (b) **Connection infrastructure**
> is illuminated: grid, roads, rail, ports, pipelines, water, fibre, and
> the nodes that transform scale (substations, silos, terminals). (c)
> **Value-chain gap scan:** every missing or under-served node becomes
> an **Opportunity record**, written into the Opportunities list of the
> sector and of each country where the gap is evidenced. (d) A **Premium
> Report** table of contents at near-feasibility depth: market, demand
> model, competition, site, technical, cost, financial model, funding,
> regulation, risk, ESG, implementation, with named exhibits.
>
> **EVIDENCE.** Use real public data where it exists and cite it with
> date. Mark \[SOURCED\], \[COMPUTED\], \[VERIFY\] and \[PROPOSED\].
> Show conflicts; never average them. Never invent coordinates,
> quantities or prices.
>
> **OUTPUTS.** (1) Updated master and subsequent prompts. (2) SA model
> and replication table. (3) Worked Example 1: pigeon-pea export trade,
> all trader questions with real data and the value-chain opportunity
> list. (4) Worked Example 2: road infrastructure investment, with real
> network data by surface and level, projects, tolling, costs per km,
> terrain risk, bridges, extra map layers and a feasibility-grade
> premium report. (5) The same chain for every asset type in the 18
> sectors. (6) The same chain for every traded commodity group. (7)
> Opportunity register. (8) Registers in Excel.

## B2. Subsequent prompts (P0–P30)

| **Prompt** | **Name**                              | **Task**                                                                                                              | **Output**             | **Acceptance test**                                 |
|------------|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------|
| P0         | Frame lock                            | Restate scope, adopt Issue 1.0 skeleton, list deltas                                                                  | Delta list             | Every Issue 1.0 section mapped                      |
| P1         | SA model institutions                 | Fill role → SA institution → data product for every role                                                              | Role table             | ≥30 roles                                           |
| P2         | Replication template                  | Express each role generically; fill Malawi as test                                                                    | Replication table      | Malawi row for every role                           |
| P3         | 54-country list                       | ISO3, name, AU region, activation wave                                                                                | Country list           | 54 rows                                             |
| P4         | Investor Chain                        | Write IQ01–IQ45 with tag, map behaviour, SA anchor                                                                    | Chain table            | Covers decision from sector to site visit           |
| P5         | Trader Chain                          | Write TQ01–TQ40 likewise                                                                                              | Chain table            | Covers HS code to landed cost and payment           |
| P6         | Geography and surface classes         | Six levels; road surface classes; km aggregation rules                                                                | Level and class tables | Any km figure reproducible at every level           |
| P7         | Worked Example 1 — data               | Research real pigeon-pea data (production, districts, prices, exports, destination policy, exchange, licences, forex) | Sourced fact table     | Every value dated and cited                         |
| P8         | Worked Example 1 — chain              | Answer the user’s 15 items plus TQ01–TQ40                                                                             | Trader journey         | Every item answered or \[VERIFY\]                   |
| P9         | Worked Example 1 — gaps               | Value-chain map; each gap → opportunity record                                                                        | Opportunity list       | ≥20 opportunities with map placement                |
| P10        | Worked Example 2 — data               | Research real road data for SA and Malawi                                                                             | Sourced fact table     | Network by class/surface; projects; tolls; costs    |
| P11        | Worked Example 2 — map                | Layers for surface, level, projects, tolls, bridges, terrain, extras                                                  | Layer table            | All user items (i)–(xi) covered                     |
| P12        | Worked Example 2 — opportunities      | Road value-chain gaps → opportunity records                                                                           | Opportunity list       | ≥20                                                 |
| P13        | Feasibility-grade report architecture | Generic chapter and exhibit standard                                                                                  | Report standard        | ≥15 chapters; named exhibits                        |
| P14        | Road report                           | Apply P13 to roads                                                                                                    | Road report ToC        | Traffic, toll, cost, risk, financial model chapters |
| P15        | Commodity report                      | Apply P13 to a commodity trade                                                                                        | Trade report ToC       | Supply, price, logistics, compliance, margin        |
| P16–P24    | Sector sheets 1–18                    | For each asset type: chain specifics, map layers, gap opportunities, report specifics, SA anchors                     | Sector sheets          | All 18 sectors                                      |
| P25        | Commodity sheets                      | For each commodity: HS, SA anchor, specific items, gap opportunities                                                  | Commodity sheets       | ≥80 commodities                                     |
| P26        | Opportunity register                  | Combine all gaps into a country × sector seeding register                                                             | Register               | Each row has trigger evidence                       |
| P27        | Information-type register             | Cross-product asset × chain question                                                                                  | Register               | No asset without full chain                         |
| P28        | Map-layer register                    | All layers with geometry, level, security, source role                                                                | Register               | Every \[MAP\] item drawable                         |
| P29        | Controls                              | Precision, security, freshness, conflict                                                                              | Control table          | Consistent with Data Bank                           |
| P30        | Assembly and QA                       | Checklist, open decisions                                                                                             | Final pack             | All tests pass or logged                            |

# PART C — Worked Example 1: A Trader Buying and Exporting Pigeon Peas

**Set-up.** South Africa is the template, but it is not a commercial
pigeon-pea producer. So this example uses the **South African trader
chain and institutions as the template**, and **Malawi as the live
instance**. Malawi is the world’s second-largest producer and the
country of the NIIP workbook in the project. Every South African anchor
is shown beside the Malawi instance so the same screen works in any of
the 54 countries.

## C1. Sourced fact base (Malawi instance)

| **\#** | **Fact**                                            | **Value**                                                                                                                                                           | **Status / source**                                                                                                                                                            |
|--------|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| F1     | National production 2024                            | 473,662 t; ranked \#2 globally (10.17 % world share)                                                                                                                | \[SOURCED\] FAO data via Tridge, Malawi pigeon peas page (accessed Oct 2026)                                                                                                   |
| F2     | National production 2020                            | 424,033 t                                                                                                                                                           | \[SOURCED\] same                                                                                                                                                               |
| F3     | Chiradzulu District production 2024/25              | 17,265 t (down from 26,245 t in 2023/24)                                                                                                                            | \[SOURCED\] MBC, 10 Apr 2025, quoting Chiradzulu Agribusiness Officer. Nation Online (4 Jun 2025) reports the same figures without naming a district — treat as district-level |
| F4     | Government minimum farm-gate price                  | K1,100/kg (2024/25 season)                                                                                                                                          | \[SOURCED\] MBC, 10 Apr 2025                                                                                                                                                   |
| F5     | Government minimum farm-gate price (current season) | K1,500/kg                                                                                                                                                           | \[SOURCED\] Nation Online, “Vendors ignore farm gate prices”, 20 Jul 2026                                                                                                      |
| F6     | Vendor (agent) price observed                       | ≈K900/kg, about 40 % below the minimum, at Migowi and Chiringa trading centres, Phalombe District                                                                   | \[SOURCED\] Nation Online, 20 Jul 2026                                                                                                                                         |
| F7     | Farm-gate price, FAOSTAT                            | US\$0.59/kg (≈K611/kg), January 2024                                                                                                                                | \[SOURCED\] Selina Wamucii summary of FAOSTAT                                                                                                                                  |
| F8     | Export unit value 2024                              | US\$1.65/kg (≈K1,704/kg)                                                                                                                                            | \[SOURCED\] Selina Wamucii summary of UN Comtrade                                                                                                                              |
| F9     | Reported export transaction prices                  | US\$0.42–1.10/kg (2024); US\$0.43–1.08/kg (2025)                                                                                                                    | \[SOURCED\] Tridge transaction data                                                                                                                                            |
| F10    | Exports 2022                                        | **Conflict:** 69,151 t (Ministry of Trade and Industry) vs 52,000 t worth US\$13.65 m (Indian High Commission data)                                                 | \[SOURCED\] Nation Online 4 Jun 2025; Milling MEA                                                                                                                              |
| F11    | Export value 2023                                   | **Conflict:** US\$49.29 m (Indian High Commission data, Nation Online) vs US\$31.6 m (Tridge/HS 071360)                                                             | \[SOURCED\]; Data Bank conflict rule applies                                                                                                                                   |
| F12    | Export destinations                                 | India, United Arab Emirates (top market in 2022 per MoIT), Mozambique, China                                                                                        | \[SOURCED\] Tridge; Milling MEA                                                                                                                                                |
| F13    | India–Malawi MoU                                    | MoU (2021) for 50,000 t/yr imports through 2025-26                                                                                                                  | \[SOURCED\] DGFT notifications as reported by taxguru/Food Business MEA                                                                                                        |
| F14    | India import policy for tur (HS 0713 60 00)         | “Free” import category extended to **31 Mar 2027** (DGFT Notification 72/2025-26, 31 Mar 2026)                                                                      | \[SOURCED\] JV Agro summary — \[VERIFY\] against DGFT text                                                                                                                     |
| F15    | India minimum support price for tur                 | ₹8,000 per quintal                                                                                                                                                  | \[SOURCED\] JV Agro — \[VERIFY\] season                                                                                                                                        |
| F16    | India tur imports 2024                              | 12.33 lakh t (1.233 Mt) — record                                                                                                                                    | \[SOURCED\] JV Agro                                                                                                                                                            |
| F17    | Harvest season                                      | Main harvest May–July; season April–September                                                                                                                       | \[SOURCED\] FAO GIEWS crop calendar via Selina Wamucii                                                                                                                         |
| F18    | Commodity exchange listing                          | AHCX trades pigeon peas (grades 1–3) with electronic warehouse receipts usable as collateral                                                                        | \[SOURCED\] AHCX “in brief”                                                                                                                                                    |
| F19    | State buyer                                         | ADMARC buying rice, pigeon peas and beans (2026)                                                                                                                    | \[SOURCED\] Nation Online, 20 Jul 2026                                                                                                                                         |
| F20    | Export licensing                                    | Control of Goods (Import and Export Licence) (Amendment) Regulations 2024, GN 50, Gazette 23 Aug 2024: pigeon peas added to the licensed-goods schedules            | \[SOURCED\] Ministry of Trade portal — confirm which schedule is export \[VERIFY\]                                                                                             |
| F21    | Forex conversion rule                               | RBM reduced the share of export proceeds exporters must convert to Kwacha from **30 % to 25 %** (Governor’s letter, 25 Mar 2025); TT verification added for imports | \[SOURCED\] MCCCI, 27 Mar 2025 — confirm current directive \[VERIFY\]                                                                                                          |
| F22    | Export finance                                      | Export Development Fund; Agriculture Commercialisation Project; local banks                                                                                         | \[SOURCED\] Milling MEA                                                                                                                                                        |
| F23    | Market structure (historic)                         | ≈90 % exported via large traders (mainly to India); ≈10 % processed/consumed locally; storage weakness limits direct smallholder export                             | \[SOURCED\] CISANET position paper (2019)                                                                                                                                      |
| F24    | HS code                                             | 0713.60 — dried, shelled pigeon peas (*Cajanus cajan*)                                                                                                              | \[SOURCED\] HS nomenclature; India tariff line 0713 60 00                                                                                                                      |

\[COMPUTED\] Chiradzulu’s 17,265 t is ≈3.6 % of the 2024 national figure
(F3 ÷ F1). The district-level series is the AIIM requirement; national
totals alone do not tell a trader where to buy.

## C2. The trader’s questions answered (user items (i)–(xv) mapped to AIIM)

| **User item**                              | **AIIM answer — information types**                                                                                                                                           | **Map behaviour**                                                                | **Malawi instance (sourced)**                                                                                                     | **South African template anchor**           |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| \(i\) Possible quantities (actual)         | National production by season; production by district (EPA level where available); marketed surplus; stocks in certified warehouses; exports to date; India quota utilisation | District bubbles sized by tonnes, coloured by year-on-year change; season slider | 473,662 t national (2024); Chiradzulu 17,265 t (2024/25)                                                                          | CEC production estimates; SAGIS stocks      |
| \(ii\) Which district and town             | Production by ADM2; trading centres (ADM3/settlement) where bulking happens                                                                                                   | Drill: Southern Region → Phalombe → Migowi / Chiringa trading centres            | Phalombe (Migowi, Chiringa); Chiradzulu                                                                                           | CEC by district; municipal main places      |
| \(iii\) Location                           | Coordinates of trading centres, ADMARC depots, AHCX-certified warehouses, cleaning plants, border posts                                                                       | Pins with precision class; site cards                                            | Locations to be geocoded by Data Bank \[VERIFY\]                                                                                  | Silo registry; SAFEX delivery points        |
| \(iv\) Local prices plus agent prices      | Minimum farm-gate price; observed vendor price; ADMARC price; AHCX traded price; export unit value                                                                            | Two price chips per market pin (farm-gate / agent) with spread %                 | Minimum K1,500/kg; vendor ≈K900/kg (Jul 2026)                                                                                     | NAMC price reports; JSE/SAFEX               |
| \(v\) Trade corridors                      | Road/rail routes to Nacala (Mozambique), Beira (Mozambique), Dar es Salaam (Tanzania); border posts; transit time and cost per segment                                        | Animated corridors; border hexagons; cost/time chips                             | Southern districts → Muloza/Mulanje border into Mozambique; Nacala corridor rail; Beira via Mwanza/Tete; Dar es Salaam via Songwe | Transnet corridors; BMA border posts        |
| \(vi\) HS code and product information     | HS 0713.60; national tariff line; grades 1–3; moisture, admixture, aflatoxin limits; varieties; packing                                                                       | Product card                                                                     | 0713.60; AHCX grades 1–3                                                                                                          | SARS Tariff Book; APS Act grade regulations |
| \(vii\) Tariffs and taxes                  | Export duty/levy (if any); VAT treatment of exports; destination import duty; port/handling charges                                                                           | Destination country fill by duty rate                                            | India: “free” import category to 31 Mar 2027 (F14)                                                                                | SARS; destination tariff sources            |
| \(viii\) Auction market availability       | Exchange listing, trading days, last price, volume, warehouse receipt availability                                                                                            | Exchange pin + calendar                                                          | AHCX lists pigeon peas grades 1–3                                                                                                 | JSE Commodity Derivatives                   |
| \(ix\) National commodity trading entity   | Exchange(s), state buyer, strategic reserve, farmer association                                                                                                               | Party pins                                                                       | AHCX; ACE; ADMARC; Nandolo Farmers Association of Malawi; Legumes Development Trust                                               | JSE; NAMC; industry organisations           |
| \(x\) Export regulations                   | Licensing schedule, quotas, bans, minimum export price rules, quality/phytosanitary certification                                                                             | Restriction hatch when a ban or quota applies                                    | Control of Goods Regulations 2024 (F20)                                                                                           | ITAC; Dept of Agriculture                   |
| \(xi\) Licences and permits                | Exporter registration; export licence; phytosanitary certificate; certificate of origin; fumigation; customs registration                                                     | Issuing-office pins                                                              | MoIT licence; MRA customs; plant protection; Malawi Bureau of Standards                                                           | SARS customs code; PPECB/APSA; ITAC         |
| \(xii\) — (numbering in request)           | Covered under (xi) and (xiii)                                                                                                                                                 | —                                                                                | —                                                                                                                                 | —                                           |
| \(xiii\) Central bank forex rules          | Repatriation period, conversion share, retention in FCDA, documentation (CD1/export declaration)                                                                              | Brief only                                                                       | 25 % conversion (from 30 %), Mar 2025 (F21)                                                                                       | SARB Currency and Exchanges Manual          |
| \(xiv\) More information (Opus 5.5)        | See C3                                                                                                                                                                        | —                                                                                | —                                                                                                                                 | —                                           |
| \(xv\) Opportunities from value-chain gaps | See C4 — each gap becomes an opportunity record in the Malawi AGR Opportunities list and the template for all countries                                                       | Gold diamonds at the node where the gap sits                                     | —                                                                                                                                 | —                                           |

## C3. Additional information a pigeon-pea trader needs (proposed by Opus 5.5)

| **\#** | **Information type**                                                               | **Why it matters**                                              | **Tag**   |
|--------|------------------------------------------------------------------------------------|-----------------------------------------------------------------|-----------|
| X1     | India quota/MoU utilisation to date, and permit allocation per exporter            | Determines whether a cargo can enter India under the MoU window | BRIEF     |
| X2     | Indian wholesale tur prices (Mumbai/Chennai), MSP and domestic crop outlook        | Netback anchor; Indian crop size drives import demand           | BRIEF     |
| X3     | Competing origins: Mozambique, Tanzania, Myanmar — volumes, prices, harvest timing | Price competition and shipment window                           | MAP+BRIEF |
| X4     | Quality testing labs (aflatoxin, moisture, pesticide residues)                     | Rejection risk                                                  | MAP       |
| X5     | Cleaning/grading capacity in each district                                         | Export grade needs cleaning                                     | MAP       |
| X6     | Fumigation and container stuffing points (inland and at port)                      | Phytosanitary requirement                                       | MAP       |
| X7     | Bag supply (jute/PP), weighbridges, scales certified by standards body             | Weight disputes                                                 | MAP       |
| X8     | Road condition and rainy-season passability to trading centres                     | Collection logistics                                            | MAP       |
| X9     | Rail wagon availability on Nacala line; container availability                     | Corridor capacity                                               | MAP+BRIEF |
| X10    | Transit costs and border clearance times by corridor                               | Landed-cost model                                               | MAP+BRIEF |
| X11    | Exchange rates: official and market spread                                         | Price competitiveness and margin                                | BRIEF     |
| X12    | Side-selling and contract enforcement record                                       | Counterparty risk                                               | BRIEF     |
| X13    | Farmer organisations and aggregators with volumes                                  | Direct sourcing                                                 | MAP       |
| X14    | Seasonal price curve (harvest low → lean-season high)                              | Storage arbitrage                                               | BRIEF     |
| X15    | Domestic processors (dhal, snacks) and demand                                      | Alternative market                                              | MAP+BRIEF |
| X16    | Policy event log: export bans, minimum price enforcement, quota changes            | Policy risk                                                     | MAP+BRIEF |
| X17    | Insurance for goods in storage and in transit                                      | Loss cover                                                      | BRIEF     |
| X18    | Contract forms (e.g. GAFTA-type pulse contracts) and arbitration                   | Dispute resolution                                              | BRIEF     |
| X19    | Transport operators and freight rates per tonne-km                                 | Cost                                                            | MAP+BRIEF |
| X20    | Traceability and sustainability buyer requirements                                 | Access to premium buyers                                        | BRIEF     |
| X21    | Sanctions/KYC on counterparties                                                    | Compliance                                                      | BRIEF     |
| X22    | Climate and pest outlook for the next crop                                         | Forward supply                                                  | MAP       |

## C4. Value-chain gap scan → Opportunity records (seed every country with pulses)

Value chain: **Seed → Production → Harvest/threshing → Bulking (trading
centres) → Cleaning/grading → Storage → Finance → Exchange/sale →
Processing (dhal) → Logistics/corridor → Export → Destination
distribution.**

| **Opp. ID** | **Opportunity**                                            | **Gap evidenced by**                                     | **Map placement**                   | **Investment model**                            | **Indicative scale \[PROPOSED band\]** |
|-------------|------------------------------------------------------------|----------------------------------------------------------|-------------------------------------|-------------------------------------------------|----------------------------------------|
| PP-01       | Certified warehouses in producing districts                | Storage weakness (F23); vendor discounts at harvest (F6) | Diamond at district trading centres | Build-operate warehouse; exchange certification | 5–20 kt per site                       |
| PP-02       | Warehouse-receipt financing facility                       | AHCX e-receipts usable as collateral (F18)               | Diamond at certified warehouses     | Bank/fund facility; collateral manager          | Revolving facility                     |
| PP-03       | Collateral management services                             | Required for receipt finance                             | Linked to PP-01                     | Service company                                 | Fee-based                              |
| PP-04       | Cleaning, grading and sorting plants                       | Grade 1 export standard; rejections                      | Diamond near bulking hubs           | Plant + toll-cleaning                           | 2–10 t/h                               |
| PP-05       | Dhal (split) milling for export and domestic market        | 10 % local processing (F23); India buys split product    | Diamond near corridor               | Processing plant                                | 20–50 t/day                            |
| PP-06       | Aggregation centres with weighbridges and certified scales | Vendor price gap (F6)                                    | Trading centres                     | Cooperative-linked                              | Per centre                             |
| PP-07       | Price information service (SMS/app) for farmers            | Lack of market information (Milling MEA)                 | Country level                       | Subscription/donor                              | National                               |
| PP-08       | Forward contracts and out-grower schemes                   | Supply volatility (F3)                                   | Production districts                | Exporter-led                                    | Contracted hectares                    |
| PP-09       | Improved seed multiplication                               | High-yield varieties adoption                            | Research stations/seed farms        | Seed company                                    | Seed t                                 |
| PP-10       | Mechanised threshing and drying services                   | Post-harvest loss                                        | Village clusters                    | Service hubs                                    | Per hub                                |
| PP-11       | Aflatoxin and residue testing laboratory                   | Rejection risk                                           | Regional hub                        | Accredited lab                                  | 1 lab per region                       |
| PP-12       | Fumigation and inland container stuffing depots            | Phytosanitary; container availability                    | Rail/road junctions                 | ICD operator                                    | Per depot                              |
| PP-13       | Export consolidation hub on Nacala/Beira corridors         | Corridor costs                                           | Corridor node                       | Logistics park                                  | Hub                                    |
| PP-14       | Market diversification to UAE/China/regional buyers        | India dependence (F12, F13)                              | Destination flows                   | Trading house                                   | Volume                                 |
| PP-15       | Pulse-based protein foods (snacks, flour, school feeding)  | Domestic demand                                          | Urban centres                       | Food processor                                  | Plant                                  |
| PP-16       | Animal feed from pulse by-products                         | Cleaning/milling by-products                             | Near PP-04/PP-05                    | Feed mill add-on                                | Plant                                  |
| PP-17       | Crop insurance (index-based)                               | Production swings (F3)                                   | Production districts                | Insurer + reinsurer                             | Portfolio                              |
| PP-18       | Export trade-finance and pre-shipment facility             | EDF and banks (F22)                                      | Lilongwe/Blantyre                   | Fund/bank                                       | Facility                               |
| PP-19       | Traceability and quality certification platform            | Premium buyers’ requirements                             | Country                             | Platform                                        | Subscription                           |
| PP-20       | Transport fleet / freight marketplace                      | Feeder logistics                                         | Districts                           | Platform/fleet                                  | Trucks                                 |
| PP-21       | Bag and packaging manufacturing                            | Packaging demand                                         | Industrial areas                    | Manufacturing                                   | Plant                                  |
| PP-22       | Hedging/forward pricing on exchange                        | Price risk                                               | Exchange                            | Exchange product                                | Contract                               |
| PP-23       | Strategic aggregation partnership with state buyer         | Minimum price enforcement (F5–F6)                        | ADMARC depots                       | PPP/service contract                            | Depots                                 |
| PP-24       | Solar dryers and storage for small traders                 | Quality and moisture                                     | Trading centres                     | Asset finance                                   | Units                                  |

**Rule for the Opportunities list.** Each PP record is stored once as a
**template**. It is instantiated as a live record in a country ×
district only when the gap is evidenced there by source data or field
verification. Malawi’s southern districts are first; Mozambique,
Tanzania and Kenya follow for pulses.

## C5. Pigeon-pea map stack (what the trader sees)

| **Layer**                            | **Level** | **Geometry**       | **Content**                                   |
|--------------------------------------|-----------|--------------------|-----------------------------------------------|
| Production by district               | L1–L2     | Bubble/choropleth  | Tonnes by season; change %                    |
| Trading centres and markets          | L3–L4     | Pins + price chips | Farm-gate, vendor, ADMARC, exchange prices    |
| Warehouses (certified / uncertified) | L4–L5     | Squares            | Capacity, receipt eligibility                 |
| Cleaning/processing plants           | L4–L5     | Squares            | Capacity t/h                                  |
| Labs and fumigation points           | L4        | Pins               | Accreditation                                 |
| Corridors and borders                | L0–L2     | Lines + hexagons   | Times, costs, hours                           |
| Ports (Nacala, Beira, Dar es Salaam) | L0        | Hexagons           | Dwell, container availability                 |
| Destination flows                    | L0        | Arrows             | Volume/value by destination                   |
| Opportunity diamonds PP-01…PP-24     | L2–L5     | Gold diamonds      | Linked to records                             |
| Risk overlays                        | L1–L5     | Rasters/triangles  | Drought, floods, road washouts, policy events |

## C6. Pigeon-pea Premium Brief (feasibility-grade table of contents)

1.  **Answer first:** buy/no-buy recommendation, target volume, window,
    corridor and expected margin range.
2.  **Situation.** Supply: national and district production (5 seasons),
    yield trends, area and varieties.
3.  **Complication.** Policy and market risks: Indian policy history,
    minimum prices, export licensing.
4.  **Demand.** India import demand model (MSP, domestic crop, import
    policy), UAE/China/regional demand.
5.  **Price.** Farm-gate → vendor → exchange → FOB → CIF price stack;
    seasonal curve; basis analysis.
6.  **Sourcing plan.** Districts and trading centres ranked by volume,
    price, road access and storage.
7.  **Quality.** Grades, rejection causes, testing protocol, cleaning
    losses.
8.  **Logistics.** Corridor comparison (Nacala/Beira/Dar) in cost/tonne,
    days, reliability and risk; container vs break-bulk.
9.  **Compliance.** Licences, SPS, origin, documents checklist,
    timeline.
10. **Finance and forex.** Pre-finance, receipt finance, LC structure,
    conversion rules, hedging.
11. **Unit economics.** Landed cost and netback model with sensitivities
    (price ±20 %, FX ±15 %, freight ±25 %).
12. **Counterparties.** Aggregators, warehouses, forwarders, buyers (KYC
    status).
13. **Risk register and mitigants.**
14. **Implementation plan.** 90-day procurement calendar.
15. **Annexes.** Data tables, sources, contacts, contract templates.

Exhibits (minimum 25): production map; price-spread waterfall; seasonal
price curve; corridor cost bars; landed-cost waterfall; sensitivity
tornado; policy timeline; competitor-origin calendar; quality-loss
funnel; finance structure diagram; and others. \# PART D — Worked
Example 2: An Investor in Road Infrastructure

## D1. Sourced fact base — South Africa (model)

| **\#** | **Fact**                                      | **Value**                                                                                                                                                                                                                  | **Status / source**                                                                                |
|--------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| R1     | Total road network                            | ≈750,000 km (incl. 131,919 km unproclaimed)                                                                                                                                                                                | \[SOURCED\] GTAC “Provincial Roads in South Africa” report (published Nov 2024; 2017 network data) |
| R2     | Paved vs gravel (proclaimed)                  | Paved 163,472 km; gravel 454,609 km                                                                                                                                                                                        | \[SOURCED\] same                                                                                   |
| R3     | By authority                                  | SANRAL 22,197 km (all paved); Provinces 222,677 km (48,945 paved / 173,732 gravel); Metros 66,143 km (51,682 / 14,461); District municipalities 307,064 km (40,648 / 266,416); Unproclaimed 131,919 km (surface uncertain) | \[SOURCED\] same (2017)                                                                            |
| R4     | SANRAL network now                            | 27,478 km, valued at R780 bn; ≈10 % tolled                                                                                                                                                                                 | \[SOURCED\] SANRAL Annual Report FY2024/25 presentation to Parliament, 8 Oct 2025                  |
| R5     | SANRAL condition FY2024/25                    | Overall Condition Index 64.45 (target ≥70); smooth travel exposure 94.70 %; bridge condition exposure 89.10 % (target ≥90 %)                                                                                               | \[SOURCED\] same                                                                                   |
| R6     | SANRAL toll revenue FY2024/25                 | R4.908 bn                                                                                                                                                                                                                  | \[SOURCED\] same                                                                                   |
| R7     | SANRAL capital expenditure FY2024/25          | R18.526 bn                                                                                                                                                                                                                 | \[SOURCED\] same (note internal inconsistencies flagged in source)                                 |
| R8     | Major projects                                | N2 Wild Coast Road R28 bn (incl. Msikaba and Mtentu mega-bridges); Mtentu Bridge R4.05 bn; R573 Moloto Road R11.5 bn; Huguenot Tunnel upgrade R4.5 bn                                                                      | \[SOURCED\] same                                                                                   |
| R9     | Provincial roads condition                    | Paved: 32.2 % poor/very poor; gravel: 55.6 % poor/very poor; gravel backlog 96,703 km                                                                                                                                      | \[SOURCED\] GTAC report                                                                            |
| R10    | Cost per km — project budgets                 | R27 m/km (R573 Moloto) to R212.7 m/km (N1 Old Oak–Koelenhof); N7 R87.5 m/km; R52 R33.6 m/km; R56 Matatiele R30.8 m/km; N2 KwaBhaca–Ngcweleni R30.5 m/km                                                                    | \[SOURCED\] TopAuto, 5 Sep 2024, citing SANRAL CEO (budget ÷ length)                               |
| R11    | Maintenance cost                              | ≈R5,000–R50,000 per km per year depending on road type                                                                                                                                                                     | \[SOURCED\] GTAC report                                                                            |
| R12    | Cost of deferral                              | Reconstruction ≈3× maintenance on average; SANRAL estimates 6× after 3 years of neglect and up to 18× after 5 years                                                                                                        | \[SOURCED\] GTAC report                                                                            |
| R13    | Gauteng e-tolls                               | Open-road tolling switched off at midnight 11 Apr 2024                                                                                                                                                                     | \[SOURCED\] SAnews                                                                                 |
| R14    | Provincial paved/gravel km by province (2017) | See D3 table                                                                                                                                                                                                               | \[SOURCED\] GTAC report                                                                            |

## D2. Sourced fact base — Malawi (replication instance)

| **\#** | **Fact**                           | **Value**                                                                                                                                                                                           | **Source**                                                 |
|--------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| M1     | Classified network                 | 15,451 km; paved 4,312 km (28 %); unpaved 11,139 km (mostly earth standard)                                                                                                                         | \[SOURCED\] Roads Fund Administration “Road Networks” page |
| M2     | By class (paved / unpaved / total) | Main 2,976 / 381 / 3,357; Secondary 513 / 2,612 / 3,125; Tertiary 44 / 4,077 / 4,121; District 8 / 3,492 / 3,500; Urban 771 / 577 / 1,348                                                           | \[SOURCED\] same                                           |
| M3     | Responsibility                     | Roads Authority: main, secondary, tertiary (10,603 km); Local authorities: district and urban (4,848 km)                                                                                            | \[SOURCED\] same                                           |
| M4     | Toll plazas                        | Chingeni (Ntcheu) and Kalinyeke (Dedza) on the Lilongwe–Blantyre M1                                                                                                                                 | \[SOURCED\] Maravi Express (2026)                          |
| M5     | Toll revenue                       | ≈K1.8 bn (Jan–Mar 2026); K1.77 bn (Apr–Jun 2026, +56 % y/y) while traffic fell 22 %                                                                                                                 | \[SOURCED\] same                                           |
| M6     | Planned toll gates                 | RFA plans four additional toll gates in FY2026/27                                                                                                                                                   | \[SOURCED\] same — locations \[VERIFY\]                    |
| M7     | M1 rehabilitation programme        | ≈347 km; EUR 191 m programme (EIB EUR 95.5 m loan; EU EUR 43.1 m grant; Government EUR 20 m; World Bank finances Karonga–Songwe)                                                                    | \[SOURCED\] EIB press release, 9 Sep 2022                  |
| M8     | Implied programme cost per km      | ≈EUR 0.55 m/km (EUR 191 m ÷ 347 km)                                                                                                                                                                 | \[COMPUTED\] — programme cost, not unit construction cost  |
| M9     | Cyclone Freddy damage (2023)       | Over 40 bridges and 44 roads damaged across 15 southern districts; named bridges include Mukumba (Mangochi–Makanjira road) and Makande-Mwitere, Nankhumwa, Zalewa and Nkalo (Luchenza Municipality) | \[SOURCED\] Zodiak Online                                  |

## D3. Network by surface and level — how the map shows it (user item ii)

**Surface classes \[PROPOSED\].** These are harmonised across 54
countries and mapped from national classes and OSM `surface`/`highway`
tags:

| **AIIM class**                         | **Includes**                    | **Line style**                    | **Colour**                  |
|----------------------------------------|---------------------------------|-----------------------------------|-----------------------------|
| S1 Paved — asphalt/concrete            | Asphalt, concrete, block        | Solid, weight by functional class | Black with gold edge (TBCA) |
| S2 Paved — surface-treated (chip seal) | Surface dressing, otta seal     | Solid, thinner                    | Dark grey                   |
| S3 Gravel (engineered)                 | Formed, drained, wearing course | Dashed                            | Brown                       |
| S4 Earth / “dust” road                 | Unformed or bladed earth        | Dotted                            | Light tan                   |
| S5 Track / footpath / unproclaimed     | Informal access                 | Fine dotted                       | Pale grey                   |

**Kilometre roll-up rule.** Each road segment carries `surface_class`,
`functional_class`, `authority`, `condition_index`, `length_km` and ADM
codes. Totals at any level are the sum of segment lengths clipped to the
boundary, so national, provincial, district, municipal, city and town
figures always reconcile.

**South Africa — provincial roads by province (2017)** \[SOURCED GTAC\]

| **Province**  | **Paved km** | **Gravel km** | **Total km** | **Paved share \[COMPUTED\]** |
|---------------|--------------|---------------|--------------|------------------------------|
| Eastern Cape  | 3,781        | 37,468        | 41,249       | 9.2 %                        |
| Free State    | 6,371        | 39,149        | 45,520       | 14.0 %                       |
| Gauteng       | 3,685        | 1,359         | 5,044        | 73.1 %                       |
| KwaZulu-Natal | 8,128        | 24,505        | 32,633       | 24.9 %                       |
| Limpopo       | 5,974        | 14,286        | 20,260       | 29.5 %                       |
| Mpumalanga    | 5,459        | 8,396         | 13,855       | 39.4 %                       |
| North West    | 5,125        | 14,660        | 19,785       | 25.9 %                       |
| Northern Cape | 3,602        | 23,747        | 27,349       | 13.2 %                       |
| Western Cape  | 6,820        | 10,162        | 16,982       | 40.2 %                       |
| **Total**     | **48,945**   | **173,732**   | **222,677**  | **22.0 %**                   |

**Display by level (what the investor sees)**

| **Level**                 | **Shown on map**                                                                | **Summary panel**                                                                                                          | **SA source**              | **Malawi source**           |
|---------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------|-----------------------------|
| \(a\) National            | Full network by surface class; national routes numbered; toll roads highlighted | km by surface × authority; condition; toll km                                                                              | SANRAL; GTAC/RISFSA data   | RFA network table (M1–M3)   |
| \(b\) Regional/provincial | Provincial network; route numbers                                               | Province table above; condition distribution; backlog                                                                      | Provincial RAMS            | RA regional data \[VERIFY\] |
| \(c\) District            | District roads; access to towns; bridges                                        | km by surface; % of population within 2 km of an all-season road (Rural Access Index) \[COMPUTED from WorldPop + network\] | District municipality RAMS | District councils / RA      |
| \(d\) City/metro          | Urban arterials, collectors; congestion                                         | km by surface; pothole/condition index                                                                                     | Metro RAMS                 | City councils               |
| \(e\) Town                | Town streets; links to trunk network                                            | km paved vs unpaved within town boundary                                                                                   | Local municipality RAMS    | Town councils               |
| Site                      | Access road to project; bridge crossings                                        | Gap length to paved road                                                                                                   | Segment data               | Segment data                |

## D4. Map layers for road investors (user items i–x)

| **User item**                                      | **Layer**                                                                       | **Geometry / illumination**                                                           | **Attributes**                                                           |
|----------------------------------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| \(i\) Road network illuminated                     | National network by functional and surface class                                | Glow on hover; selected route lights end-to-end with km counter                       | Route no., class, surface, lanes, AADT, condition, authority             |
| \(ii\) Tar vs gravel vs dust with km at all levels | Surface-class styling (D3) + roll-up panel                                      | Toggle each class; km update by boundary                                              | `length_km` by class                                                     |
| \(iii\) Major projects (existing/potential)        | Project lines (status colour) and quarry/material sources supporting them       | Dashed for planned, pulsing for tender                                                | Budget, length, funder, contractor, stage                                |
| \(v\) Possible e-toll/toll locations (opportunity) | Candidate toll sites from siting model (D6)                                     | Gold diamond on segment; catchment of alternative routes                              | AADT, heavy-vehicle %, alternative route length, willingness-to-pay band |
| \(vii\) Cost per km                                | Cost chip on project lines; benchmark panel                                     | Colour scale by R/km                                                                  | Budget ÷ length; benchmark range by road type                            |
| \(viii\) Terrain and topography (risk)             | Slope raster, elevation profile, geology, flood lines, landslide susceptibility | Profile along selected route                                                          | Max grade, cut/fill estimate class, flood crossings                      |
| \(ix\) Actual and possible bridges (opportunity)   | Existing bridges (condition), damaged/washed-away bridges, missing crossings    | Bridge pegs coloured by condition; red for damaged; gold diamond for missing crossing | Span, type, condition index, load limit, year                            |
| \(x\) More map information (Opus 5.5)              | See D5                                                                          | —                                                                                     | —                                                                        |

## D5. Additional map information for road investors (proposed)

| **\#** | **Layer**                                                        | **Purpose**                          |
|--------|------------------------------------------------------------------|--------------------------------------|
| RX1    | Traffic counts (AADT) and heavy-vehicle share by segment         | Demand and toll revenue base         |
| RX2    | Freight flows (origin–destination) by corridor                   | Justify upgrades and tolls           |
| RX3    | Road condition index (VCI/OCI) by segment                        | Rehabilitation need                  |
| RX4    | Accident blackspots                                              | Safety investment case               |
| RX5    | Weighbridges and overload incidence                              | Pavement damage drivers              |
| RX6    | Rainfall intensity and climate projections                       | Drainage design and resilience       |
| RX7    | Rural Access Index and unconnected settlements                   | Social case and funding eligibility  |
| RX8    | Land use and land value along corridors                          | Land-value capture                   |
| RX9    | Quarries, borrow pits, asphalt and bitumen plants, cement plants | Construction cost and supply         |
| RX10   | Contractor depots and CIDB-graded contractors nearby             | Delivery capacity                    |
| RX11   | Protected areas, wetlands, heritage sites along alignments       | Permitting risk                      |
| RX12   | Rail lines and ports                                             | Modal competition/complementarity    |
| RX13   | Fuel stations, truck stops, rest areas                           | Service-area opportunities           |
| RX14   | Border posts and queue times                                     | Corridor bottlenecks                 |
| RX15   | Planned developments (SEZs, mines, housing)                      | Future traffic generators            |
| RX16   | Utility services in road reserve (fibre, pipelines, power)       | Relocation cost; co-location revenue |
| RX17   | Population growth and urban expansion                            | Long-term demand                     |
| RX18   | Crime/security incidents on routes                               | Operating risk                       |
| RX19   | Toll plaza locations and tariffs (existing)                      | Network effects and competition      |
| RX20   | Funding sources by project (fiscus, toll, DFI, PPP)              | Financing precedents                 |

## D6. Toll siting method (user item v) \[PROPOSED\]

Candidate segments are scored on:

- AADT above a threshold;
- heavy-vehicle share;
- the absence of a reasonable free alternative (or a deliberate parallel
  free route);
- new capacity or a significant upgrade being delivered;
- willingness to pay from surveys;
- collection-cost ratio below a threshold;
- legal tolling authority;
- political acceptability.

**South African lesson.** Gauteng’s open-road e-tolling was switched off
on 11 April 2024 (R13) after sustained non-payment and public
opposition. AIIM therefore labels open-road tolling on existing urban
freeways as **high acceptance risk**. It ranks these opportunities
higher:

- conventional plaza tolls on new or upgraded inter-urban capacity;
- toll bridges;
- heavy-vehicle charging.

In Malawi, toll revenue rose 56 % while traffic fell (M5), and the RFA
plans four more gates (M6). These are real AIIM opportunities:
operations and maintenance concessions, plaza construction and
electronic collection systems.

## D7. Road value-chain gaps → Opportunity records

| **Opp. ID** | **Opportunity**                                                | **Evidence trigger**                        | **Map placement**               | **Model**               |
|-------------|----------------------------------------------------------------|---------------------------------------------|---------------------------------|-------------------------|
| RD-01       | Toll-road concession (new or upgraded inter-urban road)        | AADT and alternative-route test             | Candidate segment               | DBFOM toll PPP          |
| RD-02       | Toll bridge                                                    | Missing crossing with high detour           | River crossing                  | BOT                     |
| RD-03       | Toll plaza construction and electronic toll collection systems | Planned gates (M6)                          | Plaza sites                     | EPC + O&M               |
| RD-04       | Bridge replacement/reconstruction programme                    | Damaged bridges (M9); bridge condition (R5) | Bridge pegs                     | Availability PPP or EPC |
| RD-05       | Performance-based road maintenance contracts (OPRC)            | Gravel backlog (R9)                         | Road segments in poor condition | Output-based contract   |
| RD-06       | Gravel-to-paved upgrading programmes                           | Gravel share (R2, M1)                       | Gravel segments by priority     | EPC; DFI funded         |
| RD-07       | Low-volume sealed roads (otta seal)                            | Rural access gaps                           | Rural segments                  | Labour-based contracts  |
| RD-08       | Quarry and aggregates supply                                   | Projects pipeline (R8, M7)                  | Quarry sites near projects      | Quarry concession       |
| RD-09       | Asphalt plants and bitumen storage/import terminals            | Paving demand                               | Plants near corridors; ports    | Industrial              |
| RD-10       | Weighbridges and weigh-in-motion                               | Overloading damage                          | Corridor nodes                  | PPP/concession          |
| RD-11       | Truck stops and roadside service areas                         | Corridor freight                            | Corridor nodes                  | Concession/lease        |
| RD-12       | Logistics parks at interchanges                                | Freight flows                               | Interchanges                    | Land development        |
| RD-13       | Fibre and utilities in road reserve                            | Rights-of-way                               | Road reserve                    | Lease of reserve        |
| RD-14       | EV and alternative-fuel charging corridors                     | Transport transition                        | Service areas                   | Charge-point operator   |
| RD-15       | Road safety technology (cameras, signage)                      | Blackspots                                  | Blackspots                      | Service contract        |
| RD-16       | Road asset management system and data services                 | Data gaps                                   | National                        | SaaS/service            |
| RD-17       | Materials testing laboratories                                 | Quality control                             | Regional                        | Lab                     |
| RD-18       | Plant and equipment leasing                                    | Contractor capacity                         | Regional depots                 | Leasing                 |
| RD-19       | Land-value capture around new interchanges                     | Land use change                             | Interchange catchments          | Municipal JV            |
| RD-20       | Billboard and advertising concessions in road reserve          | High-AADT segments                          | Segments                        | Concession              |
| RD-21       | Climate-resilience upgrades (drainage, culverts)               | Flood exposure (RX6)                        | Flood crossings                 | Programme contracts     |
| RD-22       | Urban pothole and resurfacing programmes                       | City condition                              | Metro segments                  | Framework contracts     |
| RD-23       | Road-construction skills/academy                               | Contractor development                      | Regional                        | Training PPP            |
| RD-24       | Bus rapid transit and freight lanes                            | Urban congestion                            | Urban corridors                 | PPP                     |

## D8. Road investment Premium Report — feasibility-grade table of contents

1.  **Executive summary (answer first).** Recommendation, project
    definition, investment ask, IRR/NPV band, key risks, decision
    required.
2.  **Strategic context.** National transport plan, corridor role,
    government priority, funding environment.
3.  **Network diagnosis.** Section-level condition, capacity, surface
    class, bridge inventory, safety; the “case for action”.
4.  **Traffic and demand study.** Classified counts, AADT by vehicle
    class, O–D survey, growth model (GDP elasticity, generated/diverted
    traffic), scenarios to 30 years.
5.  **Willingness to pay and toll design** (if tolled).
    Stated-preference survey, value of time, tariff by class, diversion
    curve, leakage, collection technology, enforcement.
6.  **Alignment and engineering options.** Route options, geometric
    standard, pavement design (by traffic loading), structures,
    drainage, climate resilience.
7.  **Terrain, geotechnical and materials.** Topography, soils, borrow
    pits and quarries, haul distances.
8.  **Cost estimate.** Bill-of-quantities-level estimate by element
    (earthworks, layers, surfacing, structures, drainage, road
    furniture); unit rates benchmarked to precedents (R10, M8);
    contingency; escalation; lifecycle maintenance (R11–R12).
9.  **Economic appraisal.** Vehicle operating cost savings, time
    savings, accident reduction, EIRR/BCR (HDM-4-type analysis).
10. **Financial model.** Revenue (tolls or availability payments), opex,
    lifecycle capex, financing structure, DSCR/LLCR, equity IRR,
    sensitivities (traffic −20 %, cost +25 %, delay 12 months, FX).
11. **Procurement and PPP structuring.** Value-for-money test, risk
    allocation matrix, contract form (DBFOM/OPRC/EPC), payment
    mechanism, termination and compensation.
12. **Legal and regulatory.** Tolling authority, expropriation/land
    acquisition, environmental authorisation, permits.
13. **Environmental and social.** Screening, resettlement, community
    engagement, labour-based components, gender and safety.
14. **Risk register.** Probability × impact; mitigants; residual risk;
    lender view.
15. **Funding plan.** Fiscus, DFIs, commercial lenders, guarantees,
    climate finance; precedent terms.
16. **Implementation plan.** Critical path, procurement timeline,
    governance, PMU.
17. **Annexes.** Traffic data, cost tables, maps, survey instruments,
    model outputs.

**Minimum exhibit set (40):**

- **Network and context:** network map by surface; condition heatmap;
  AADT bar by segment; O–D desire lines; growth fan chart.
- **Engineering and cost:** alignment options matrix; elevation profile;
  cost per km benchmark chart; cost-element waterfall; lifecycle cost
  curve.
- **Demand and tolling:** diversion curve; toll-revenue ramp-up.
- **Economics and finance:** economic benefits stack; financial model
  summary; DSCR chart; sensitivity tornado; scenario table.
- **Risk and delivery:** risk heat map; procurement timeline (Gantt);
  funding structure diagram.
- The remaining exhibits are the detail charts behind each of these. \#
  PART E — Feasibility-Grade Premium Report Standard (applies to every
  sector and commodity)

The standard below is TBCA’s house standard for “almost feasibility”
Premium Reports. It follows the working conventions of top-tier strategy
consultancies:

- **Answer-first pyramid:** the recommendation leads and every section
  supports it.
- **Issue tree:** the decision question is broken into mutually
  exclusive, collectively exhaustive sub-questions.
- **Hypothesis-driven analysis:** each chapter tests a stated
  hypothesis.
- **One message per exhibit:** every exhibit carries an action title,
  source and date.
- **Explicit uncertainty:** ranges, scenarios and sensitivities rather
  than single numbers.

It is a pre-feasibility product. It does not replace bankable
engineering, legal or audit sign-off. Every report states this in its
scope box.

| **Ch.** | **Chapter**                           | **Questions answered**                                      | **Mandatory analyses / exhibits**                                                                |
|---------|---------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| 0       | Scope and reliance box                | What is and is not covered; data date; grades               | Scope table; evidence-grade summary                                                              |
| 1       | Executive summary                     | Should the client proceed, how, with what return and risk?  | Recommendation; three key reasons; risk/return chart; next steps                                 |
| 2       | Situation – Complication – Resolution | Why now?                                                    | SCR narrative; timeline of triggers                                                              |
| 3       | Market sizing                         | How large is the addressable market?                        | Top-down and bottom-up sizing reconciled; TAM/SAM/SOM                                            |
| 4       | Demand model                          | What drives demand and how will it evolve?                  | Driver tree; regression/elasticity; 3 scenarios over asset life                                  |
| 5       | Supply and competition                | Who serves the market; where are the gaps?                  | Supply curve/cost curve; competitor map; market shares                                           |
| 6       | Pricing and revenue                   | What price/tariff can be realised?                          | Price stack; regulated tariff path; willingness-to-pay                                           |
| 7       | Site and location                     | Where exactly, and why there?                               | Site scoring matrix; map set; constraints overlay                                                |
| 8       | Technical concept                     | What is built and how?                                      | Options matrix; capacity sizing; technology risk                                                 |
| 9       | Connection infrastructure             | How does it connect (grid, road, water, rail, port, fibre)? | Connection Finder outputs; upgrade cost and timing                                               |
| 10      | Capex and opex                        | What will it cost?                                          | Cost breakdown; benchmark comparison; contingency; escalation                                    |
| 11      | Financial model                       | Does it pay?                                                | Three-statement summary; IRR/NPV; DSCR; payback; sensitivity tornado; scenario table; break-even |
| 12      | Economic and social value             | What are the wider benefits?                                | Jobs; local content; EIRR where relevant                                                         |
| 13      | Funding and structuring               | Who funds it and on what terms?                             | Capital stack; funder long-list matched; guarantee options                                       |
| 14      | Legal, regulatory and permitting      | What permissions; how long?                                 | Pathway Gantt; licence register; incentive eligibility                                           |
| 15      | ESG and climate                       | What are the E&S and climate risks?                         | Screening; physical climate risk; transition risk; lender standards gap                          |
| 16      | Risk register                         | What can go wrong and how is it mitigated?                  | Heat map; allocation matrix; residual risk                                                       |
| 17      | Implementation                        | How do we execute?                                          | Critical path; 100-day plan; governance                                                          |
| 18      | Annexes                               | Data, sources, assumptions                                  | Assumption book; source list with grades                                                         |

**Exhibit rules.** Every exhibit has an action title stating the “so
what”, plus source, date and evidence grade. Maps use the AIIM
symbology. Numbers are ranges unless sourced.

**Report family by depth \[PROPOSED\].**

| **Level** | **Name**               | **Depth**                                                   |
|-----------|------------------------|-------------------------------------------------------------|
| L1        | Snapshot               | 2–4 pages; chapters 1, 3, 7, 16 only                        |
| L2        | Opportunity Brief      | 10–20 pages; chapters 1–7, 14, 16                           |
| L3        | Pre-feasibility Report | 40–80 pages; all chapters with indicative models            |
| L4        | Investor Pack          | L3 plus data room, financial model file and advisor session |

# PART F — All 18 Sectors: Asset-Level Deep Catalogue

**How to read.** Each sector opens with its South African model anchors,
regulation, connection infrastructure, risks and investment models. Each
**asset type** then lists the *asset-specific* information an investor
must find. These add to the universal **Investor Chain IQ01–IQ45**
(Annex 1), which applies in full to every asset. The asset entry also
lists its map layers, its value-chain gap **opportunities** (each with
an ID that seeds the Opportunity Register for every country where the
gap is evidenced) and the special analyses its Premium Report adds to
the Part E standard. The full asset × question cross-product is in the
Excel register, sheet `Investor_InfoTypes`.

## F1. Energy & Power (ENR)

| **Item**                                            | **Content**                                                                                                                                                                                                                                 |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Transmission/distribution grid: lines by voltage, substations (step-up/step-down), connection points                                                                                                                                        |
| South African model anchors (data and institutions) | Eskom/NTCSA Transmission Development Plan and Generation Connection Capacity Assessment (GCCA); NERSA licences and tariff decisions; IPP Office REIPPPP/BESIPPPP/RMIPPPP bid windows; DMRE Integrated Resource Plan (IRP); SAPP market data |
| Regulation and licensing (SA model)                 | Electricity Regulation Act (and amendments); NERSA generation/trading licences or registration; Grid Code and connection rules; National Environmental Management Act EIA; National Water Act (hydro/cooling water); Wheeling frameworks    |
| Key risks                                           | Grid connection capacity constraints; Curtailment; Offtaker credit; Tariff/currency mismatch; Construction cost; Land and community; Climate/resource variability                                                                           |
| Investment models                                   | IPP with PPA (public procurement); Private wheeling/C&I PPA; Embedded generation; BOT/concession; Transmission IPP (ITP); Mini-grid concession; Equity in operating IPPs                                                                    |
| Asset types covered                                 | 11                                                                                                                                                                                                                                          |

### ENR-A01 Hydropower (large, run-of-river, small/mini, pumped storage)

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                                                                                                                                                                                          |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | River flow series and flow-duration curve; Gross head at intake–powerhouse; Catchment area and rainfall; Sediment yield; Reservoir inundation footprint at full supply level; Environmental flow requirement; Upstream/downstream cascade and water users; Transboundary basin agreements; Dam safety classification; Geology along waterway/tunnel |
| Map layers \[MAP\]                               | Rivers by stream order with flow gauges; Catchments and sub-catchments; Dam walls and reservoirs; Potential sites from master plans (diamonds); Elevation profile along river; Inundation polygon with affected roads/settlements; Heavy-haul route port→site                                                                                       |
| Gap opportunities → Opportunities list           | **ENR-A01-O01** Small hydro IPP on irrigation canals/dams; **ENR-A01-O02** Rehabilitation and uprating of old stations; **ENR-A01-O03** Pumped-storage development rights; **ENR-A01-O04** Floating solar on reservoirs; **ENR-A01-O05** Hydrological monitoring network (data service); **ENR-A01-O06** Sediment flushing/dredging services        |
| Premium Report special analyses (adds to Part E) | Hydrological yield simulation (P50/P90 energy); Head/flow optimisation and installed-capacity sizing; Reservoir operation and multi-purpose trade-offs; Geotechnical risk register; Resettlement action plan cost                                                                                                                                   |

### ENR-A02 Solar PV (utility, C&I, rooftop) and hybrids

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                                                                                                                          |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | GHI/DNI at site (kWh/m²/yr); Specific yield (kWh/kWp); Land slope and orientation; Soiling and dust; Grid hosting capacity at nearest substation; Wheeling availability; C&I load profiles of nearby offtakers                                                                      |
| Map layers \[MAP\]                               | Solar irradiation raster; Substations with available capacity (GCCA); Flat land parcels \>X ha within N km of substation; C&I load clusters (mines, malls, factories); REIPPPP and private project pins by bid window                                                               |
| Gap opportunities → Opportunities list           | **ENR-A02-O01** C&I solar-as-a-service for agri and mines; **ENR-A02-O02** Solar + battery for municipalities; **ENR-A02-O03** Agrivoltaics; **ENR-A02-O04** Module/racking assembly; **ENR-A02-O05** O&M and module-cleaning services; **ENR-A02-O06** Second-life battery storage |
| Premium Report special analyses (adds to Part E) | Energy yield P50/P90; LCOE vs grid tariff path; Curtailment simulation; Offtaker credit scoring; Wheeling cost stack                                                                                                                                                                |

### ENR-A03 Onshore wind

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                                        |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Mean wind speed at hub height; Wind rose and turbulence; Aviation, radar and bird/bat constraints; Noise setback from dwellings; Turbine transport route limits                                   |
| Map layers \[MAP\]                               | Wind speed raster at 100 m; Renewable Energy Development Zones (REDZ); Bird/bat sensitivity layers; Radar and airport exclusion zones; Abnormal-load routes                                       |
| Gap opportunities → Opportunities list           | **ENR-A03-O01** Tower and blade manufacturing/localisation; **ENR-A03-O02** Crane and heavy-lift services; **ENR-A03-O03** Repowering of early wind farms; **ENR-A03-O04** Wind + storage hybrids |
| Premium Report special analyses (adds to Part E) | Wind resource assessment from met-mast data; Wake losses and layout; Avian impact cost of mitigation                                                                                              |

### ENR-A04 Gas-to-power (OCGT/CCGT/engines) and LNG-to-power

| **Dimension**                                    | **Asset-specific content**                                                                                                            |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Gas source and contract (pipeline/LNG); Gas price indexation; Cooling water; Air quality headroom; Port/FSRU location                 |
| Map layers \[MAP\]                               | Gas pipelines and tie-in points; LNG terminal/FSRU candidate sites; Air quality priority areas                                        |
| Gap opportunities → Opportunities list           | **ENR-A04-O01** LNG import terminal and regas; **ENR-A04-O02** Gas distribution to industry; **ENR-A04-O03** Small-scale LNG trucking |
| Premium Report special analyses (adds to Part E) | Fuel supply security analysis; Dispatch and capacity factor modelling                                                                 |

### ENR-A05 Coal and clean-coal conversion / repurposing

| **Dimension**                                    | **Asset-specific content**                                                                                                           |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Station age and decommissioning date; Just transition plans; Ash and water liabilities                                               |
| Map layers \[MAP\]                               | Coal stations with decommissioning year; Mines supplying stations; Just Energy Transition project sites                              |
| Gap opportunities → Opportunities list           | **ENR-A05-O01** Repurposing sites for renewables + storage; **ENR-A05-O02** Ash beneficiation; **ENR-A05-O03** Mine-land reclamation |
| Premium Report special analyses (adds to Part E) | Repurposing options appraisal; Liability and transition cost model                                                                   |

### ENR-A06 Biomass, biogas and waste-to-energy

| **Dimension**                                    | **Asset-specific content**                                                                                                                               |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Feedstock availability within radius; Feedstock price and seasonality; Gate fees for waste                                                               |
| Map layers \[MAP\]                               | Agri-residue density; Sugar mills/sawmills; Landfills and abattoirs                                                                                      |
| Gap opportunities → Opportunities list           | **ENR-A06-O01** Bagasse co-generation at sugar mills; **ENR-A06-O02** Landfill gas; **ENR-A06-O03** Abattoir/dairy biogas; **ENR-A06-O04** Pellet plants |
| Premium Report special analyses (adds to Part E) | Feedstock supply curve; Gate-fee and tariff stack                                                                                                        |

### ENR-A07 Battery energy storage (BESS)

| **Dimension**                                    | **Asset-specific content**                                                                                                  |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Grid services market rules; Substation constraints; Time-of-use spreads                                                     |
| Map layers \[MAP\]                               | Constrained grid nodes; Large load centres                                                                                  |
| Gap opportunities → Opportunities list           | **ENR-A07-O01** Utility-scale BESS IPP; **ENR-A07-O02** Behind-the-meter storage for C&I; **ENR-A07-O03** Battery recycling |
| Premium Report special analyses (adds to Part E) | Revenue stacking model; Degradation and augmentation schedule                                                               |

### ENR-A08 Transmission and interconnectors (ITP)

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                      |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Transmission Development Plan corridors; Line routes and servitudes; Interconnector capacity and pool rules                                                                     |
| Map layers \[MAP\]                               | Existing/planned lines by voltage and year; Strategic transmission corridors; Cross-border interconnectors                                                                      |
| Gap opportunities → Opportunities list           | **ENR-A08-O01** Independent transmission projects; **ENR-A08-O02** Substation EPC/BOT; **ENR-A08-O03** Servitude acquisition services; **ENR-A08-O04** Line inspection by drone |
| Premium Report special analyses (adds to Part E) | Corridor routing least-cost; Availability-payment model                                                                                                                         |

### ENR-A09 Distribution, municipal utilities and mini-grids

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                                                             |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Municipal electricity debt and losses; Non-technical losses; Unelectrified settlements                                                                                                                                 |
| Map layers \[MAP\]                               | Electrification rate by municipality; Unserved settlements; Mini-grid concession areas                                                                                                                                 |
| Gap opportunities → Opportunities list           | **ENR-A09-O01** Smart metering and revenue protection; **ENR-A09-O02** Municipal distribution concessions; **ENR-A09-O03** Mini-grids for remote settlements; **ENR-A09-O04** Off-grid solar home systems distribution |
| Premium Report special analyses (adds to Part E) | Loss-reduction business case; Willingness/ability to pay survey                                                                                                                                                        |

### ENR-A10 Green hydrogen and derivatives (ammonia, e-fuels)

| **Dimension**                                    | **Asset-specific content**                                                                                                |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Renewable resource co-location; Water (desalination) availability; Port export capacity; Offtake agreements               |
| Map layers \[MAP\]                               | Hydrogen valleys/hubs; Port sites (e.g. SEZ zones); Desalination candidate sites                                          |
| Gap opportunities → Opportunities list           | **ENR-A10-O01** Electrolyser assembly; **ENR-A10-O02** Ammonia export terminal; **ENR-A10-O03** Desalination for industry |
| Premium Report special analyses (adds to Part E) | LCOH model; Export market and certification (RFNBO) analysis                                                              |

### ENR-A11 Clean cooking and LPG

| **Dimension**                                    | **Asset-specific content**                                                                    |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Household fuel use; LPG import and storage; Distribution network                              |
| Map layers \[MAP\]                               | Household fuel-use choropleth; LPG depots                                                     |
| Gap opportunities → Opportunities list           | **ENR-A11-O01** LPG cylinder distribution; **ENR-A11-O02** Improved cookstove carbon projects |
| Premium Report special analyses (adds to Part E) | Household demand model                                                                        |

## F2. Oil, Gas & Petroleum (OGS)

| **Item**                                            | **Content**                                                                                                                                                                                      |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Pipelines, marine terminals, depots, road/rail tanker routes                                                                                                                                     |
| South African model anchors (data and institutions) | Petroleum Agency SA (PASA) licence maps; PetroSA; DMRE/DMPR fuel price adjustments; Transnet Pipelines (NMPP); SAPIA statistics                                                                  |
| Regulation and licensing (SA model)                 | Upstream Petroleum Resources Development Act; Petroleum Products Act (licensing of wholesale/retail/manufacture); Gas Act and NERSA gas licences; Petroleum Pipelines Act; NEMA EIA, air quality |
| Key risks                                           | Fiscal/regulatory change; Litigation on exploration; Price volatility; Import dependence; Security/theft                                                                                         |
| Investment models                                   | Exploration right/farm-in; PSA/JV with NOC; Terminal BOO; Retail franchise; Gas aggregation                                                                                                      |
| Asset types covered                                 | 4                                                                                                                                                                                                |

### OGS-A01 Upstream exploration and production

| **Dimension**                                    | **Asset-specific content**                                                                                                                               |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Licence block status and holders; Seismic coverage; Discoveries and resource class; Fiscal terms                                                         |
| Map layers \[MAP\]                               | Licence blocks by status; Wells and discoveries; Marine protected areas overlap                                                                          |
| Gap opportunities → Opportunities list           | **OGS-A01-O01** Seismic data reprocessing services; **OGS-A01-O02** Supply-base services; **OGS-A01-O03** Local content services (fabrication, catering) |
| Premium Report special analyses (adds to Part E) | Prospectivity screening; Fiscal model (NPV/government take)                                                                                              |

### OGS-A02 Gas processing, pipelines and LNG import

| **Dimension**                                    | **Asset-specific content**                                                                                                           |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Gas demand clusters; Pipeline capacity and tariffs; Port FSRU sites                                                                  |
| Map layers \[MAP\]                               | Gas pipelines; Industrial gas users; Candidate LNG berths                                                                            |
| Gap opportunities → Opportunities list           | **OGS-A02-O01** LNG import terminal; **OGS-A02-O02** Gas distribution networks; **OGS-A02-O03** Virtual pipelines (CNG/LNG trucking) |
| Premium Report special analyses (adds to Part E) | Gas demand aggregation study; Netback analysis                                                                                       |

### OGS-A03 Refining, storage terminals and depots

| **Dimension**                                    | **Asset-specific content**                                                                                                             |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Refinery status and capacity; Storage capacity by product; Import parity price                                                         |
| Map layers \[MAP\]                               | Refineries (operating/mothballed); Tank farms and depots; Product pipelines                                                            |
| Gap opportunities → Opportunities list           | **OGS-A03-O01** Independent storage terminals; **OGS-A03-O02** Strategic stock facilities; **OGS-A03-O03** Refinery restart/conversion |
| Premium Report special analyses (adds to Part E) | Product supply-demand balance; Terminal throughput economics                                                                           |

### OGS-A04 Fuel and LPG retail and distribution

| **Dimension**                                    | **Asset-specific content**                                                                                                                    |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Retail site density; Regulated margins; Licensing of sites                                                                                    |
| Map layers \[MAP\]                               | Fuel stations by brand; Underserved towns and corridors                                                                                       |
| Gap opportunities → Opportunities list           | **OGS-A04-O01** Truck-stop fuel and service centres; **OGS-A04-O02** LPG distribution in townships; **OGS-A04-O03** EV + fuel hybrid stations |
| Premium Report special analyses (adds to Part E) | Site catchment and volume model                                                                                                               |

## F3. Mining & Minerals (MIN)

| **Item**                                            | **Content**                                                                                                                                                                 |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Power, water, rail/road to port, processing plants                                                                                                                          |
| South African model anchors (data and institutions) | DMPR/DMRE SAMRAD (mineral rights); Council for Geoscience maps; Minerals Council SA statistics; Transnet Freight Rail ore lines; Stats SA mining production                 |
| Regulation and licensing (SA model)                 | MPRDA (prospecting/mining rights); Mining Charter; Mine Health and Safety Act; NEMA/NEMWA (tailings, residue); Royalty Act; Export controls on specific minerals \[VERIFY\] |
| Key risks                                           | Rail and port capacity; Power supply; Illegal mining; Community conflict; Commodity prices; Regulatory delays in rights                                                     |
| Investment models                                   | Prospecting right acquisition; Earn-in/JV; Royalty/streaming; Toll processing; Rail/port co-investment                                                                      |
| Asset types covered                                 | 7                                                                                                                                                                           |

### MIN-A01 Precious metals (gold, PGMs)

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                   |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Reserves and resources (SAMREC); Mine depth and life; Tailings retreatment potential                                                                                         |
| Map layers \[MAP\]                               | Mining rights polygons; Shafts and plants; Tailings storage facilities                                                                                                       |
| Gap opportunities → Opportunities list           | **MIN-A01-O01** Tailings retreatment; **MIN-A01-O02** Mine-water treatment; **MIN-A01-O03** Refining/beneficiation of PGMs; **MIN-A01-O04** Fuel-cell/catalyst manufacturing |
| Premium Report special analyses (adds to Part E) | Resource-to-reserve conversion review; Mine plan and cost curve position                                                                                                     |

### MIN-A02 Base metals (copper, nickel, zinc, iron ore, manganese, chrome)

| **Dimension**                                    | **Asset-specific content**                                                                                                                          |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Grade/tonnage; Logistics cost per tonne to port; Processing route                                                                                   |
| Map layers \[MAP\]                               | Deposits and mines; Ore rail lines and ports; Smelters                                                                                              |
| Gap opportunities → Opportunities list           | **MIN-A02-O01** Ferrochrome/ferromanganese smelting with own power; **MIN-A02-O02** Rail wagon leasing; **MIN-A02-O03** Port bulk terminal capacity |
| Premium Report special analyses (adds to Part E) | Logistics cost model mine-to-ship; Price deck and sensitivity                                                                                       |

### MIN-A03 Battery and critical minerals (lithium, graphite, rare earths, vanadium, cobalt)

| **Dimension**                                    | **Asset-specific content**                                                                                                      |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Deposit maturity; Offtake/partnership agreements; Beneficiation requirements                                                    |
| Map layers \[MAP\]                               | Critical-mineral occurrences; Pilot/processing plants                                                                           |
| Gap opportunities → Opportunities list           | **MIN-A03-O01** Precursor and cathode materials plants; **MIN-A03-O02** Battery assembly; **MIN-A03-O03** Rare-earth separation |
| Premium Report special analyses (adds to Part E) | Supply-chain positioning study; Offtake market mapping                                                                          |

### MIN-A04 Coal

| **Dimension**                                    | **Asset-specific content**                          |
|--------------------------------------------------|-----------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Quality; Rail allocation; Transition policy         |
| Map layers \[MAP\]                               | Coal mines; Coal rail line and terminal             |
| Gap opportunities → Opportunities list           | **MIN-A04-O01** Rehabilitation and land repurposing |
| Premium Report special analyses (adds to Part E) | Transition risk analysis                            |

### MIN-A05 Industrial minerals and construction materials

| **Dimension**                                    | **Asset-specific content**                                                                              |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Quarry permits; Market radius                                                                           |
| Map layers \[MAP\]                               | Quarries and borrow pits; Cement plants                                                                 |
| Gap opportunities → Opportunities list           | **MIN-A05-O01** Aggregate supply for road programmes; **MIN-A05-O02** Lime and dolomite for agriculture |
| Premium Report special analyses (adds to Part E) | Market radius and transport cost model                                                                  |

### MIN-A06 Diamonds and gemstones

| **Dimension**                                    | **Asset-specific content**                                                     |
|--------------------------------------------------|--------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Licences; Beneficiation obligations; Kimberley Process                         |
| Map layers \[MAP\]                               | Diamond mining areas; Cutting/polishing centres                                |
| Gap opportunities → Opportunities list           | **MIN-A06-O01** Cutting and polishing; **MIN-A06-O02** Jewellery manufacturing |
| Premium Report special analyses (adds to Part E) | Valuation and sales channel review                                             |

### MIN-A07 Artisanal and small-scale mining (ASM)

| **Dimension**                                    | **Asset-specific content**                                                                                                            |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | ASM zones; Cooperative registration                                                                                                   |
| Map layers \[MAP\]                               | ASM areas                                                                                                                             |
| Gap opportunities → Opportunities list           | **MIN-A07-O01** ASM formalisation services; **MIN-A07-O02** Buying centres with traceability; **MIN-A07-O03** Mercury-free processing |
| Premium Report special analyses (adds to Part E) | Formalisation business model                                                                                                          |

## F4. Agriculture & Agro-processing (AGR)

| **Item**                                            | **Content**                                                                                                                                                                                                                                                            |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Feeder roads, irrigation, silos/warehouses, processing, markets and export corridors                                                                                                                                                                                   |
| South African model anchors (data and institutions) | Crop Estimates Committee (CEC); SAGIS (grain information); NAMC market reports; JSE Commodity Derivatives; Dept of Agriculture (APSA, plant health); ARC soil and climate data; Land Bank                                                                              |
| Regulation and licensing (SA model)                 | Agricultural Product Standards Act; Plant Improvement Act / Plant Breeders’ Rights; Fertilisers, Farm Feeds Act (Act 36); Marketing of Agricultural Products Act (statutory levies); Water use licences; Subdivision of Agricultural Land Act \[VERIFY repeal status\] |
| Key risks                                           | Drought/climate; Price volatility; Logistics and port delays; Land reform uncertainty; Theft; Input costs (FX-linked)                                                                                                                                                  |
| Investment models                                   | Commercial farm; Out-grower/contract farming; Aggregation and storage; Processing plant; Irrigation scheme partnership; Agri-funds                                                                                                                                     |
| Asset types covered                                 | 10                                                                                                                                                                                                                                                                     |

### AGR-A01 Grains and oilseeds (maize, wheat, soya, sunflower, sorghum)

| **Dimension**                                    | **Asset-specific content**                                                                                                                       |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Hectares planted and production by district (CEC); Silo stocks (SAGIS); SAFEX prices and basis by silo; Import/export parity                     |
| Map layers \[MAP\]                               | Production by district; Silo network with capacity; Rail sidings at silos; SAFEX delivery points                                                 |
| Gap opportunities → Opportunities list           | **AGR-A01-O01** Silo bags/new storage; **AGR-A01-O02** Grain receipt financing; **AGR-A01-O03** Soya crushing; **AGR-A01-O04** Animal feed mills |
| Premium Report special analyses (adds to Part E) | Supply-demand balance and parity model; Location differential analysis                                                                           |

### AGR-A02 Pulses (dry beans, pigeon peas, chickpeas, cowpeas, lentils)

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                   |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Production and marketed surplus; Grading and cleaning capacity; Export quotas/MoUs in destination; Domestic consumption                                                      |
| Map layers \[MAP\]                               | Production districts; Aggregation and cleaning plants; Export routes                                                                                                         |
| Gap opportunities → Opportunities list           | **AGR-A02-O01** Cleaning/grading/sorting plants; **AGR-A02-O02** Dhal/split milling; **AGR-A02-O03** Certified warehouses with receipts; **AGR-A02-O04** Seed multiplication |
| Premium Report special analyses (adds to Part E) | Export parity vs domestic parity; Processing margin model                                                                                                                    |

### AGR-A03 Horticulture (citrus, subtropical, deciduous, vegetables)

| **Dimension**                                    | **Asset-specific content**                                                                                                                                                                    |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Hectares and volumes by region; Export protocols by market; Cold chain capacity; Pack-house capacity                                                                                          |
| Map layers \[MAP\]                               | Orchards/production clusters; Pack-houses and cold stores; Reefer ports and berths; Airports with perishable cargo                                                                            |
| Gap opportunities → Opportunities list           | **AGR-A03-O01** Cold stores and pack-houses; **AGR-A03-O02** Reefer container depots; **AGR-A03-O03** Juice/concentrate processing; **AGR-A03-O04** Market diversification consolidation hubs |
| Premium Report special analyses (adds to Part E) | Market access matrix; Cold chain cost-to-serve                                                                                                                                                |

### AGR-A04 Sugar and sugarcane

| **Dimension**                                    | **Asset-specific content**                                                                       |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Mill capacity; Cane supply area; Tariff protection                                               |
| Map layers \[MAP\]                               | Sugar mills and cane areas                                                                       |
| Gap opportunities → Opportunities list           | **AGR-A04-O01** Bagasse co-generation; **AGR-A04-O02** Ethanol; **AGR-A04-O03** Specialty sugars |
| Premium Report special analyses (adds to Part E) | Cane supply and mill economics                                                                   |

### AGR-A05 Wine, spirits and beverages

| **Dimension**                                    | **Asset-specific content**                                               |
|--------------------------------------------------|--------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Vineyard area; Export volumes by market                                  |
| Map layers \[MAP\]                               | Wine regions and wineries                                                |
| Gap opportunities → Opportunities list           | **AGR-A05-O01** Bulk-to-bottled conversion; **AGR-A05-O02** Wine tourism |
| Premium Report special analyses (adds to Part E) | Brand/market entry study                                                 |

### AGR-A06 Nuts (macadamia, pecan, cashew, groundnuts)

| **Dimension**                                    | **Asset-specific content**                                                           |
|--------------------------------------------------|--------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Orchard age profile; Cracking capacity                                               |
| Map layers \[MAP\]                               | Orchards; Cracking plants                                                            |
| Gap opportunities → Opportunities list           | **AGR-A06-O01** Cracking and processing; **AGR-A06-O02** Nut-based consumer products |
| Premium Report special analyses (adds to Part E) | Price cycle analysis                                                                 |

### AGR-A07 Cash crops (tobacco, tea, coffee, cotton)

| **Dimension**                                    | **Asset-specific content**                                                                |
|--------------------------------------------------|-------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Auction volumes and prices; Grower registration                                           |
| Map layers \[MAP\]                               | Estates and auction floors; Ginneries                                                     |
| Gap opportunities → Opportunities list           | **AGR-A07-O01** Value-addition (spinning, blending); **AGR-A07-O02** Crop diversification |
| Premium Report special analyses (adds to Part E) | Auction price analysis                                                                    |

### AGR-A08 Irrigation development

| **Dimension**                                    | **Asset-specific content**                                                                                                           |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Irrigable land; Water allocation; Scheme condition                                                                                   |
| Map layers \[MAP\]                               | Irrigation schemes; Canals and dams; Groundwater potential                                                                           |
| Gap opportunities → Opportunities list           | **AGR-A08-O01** Irrigation scheme revitalisation PPP; **AGR-A08-O02** Centre-pivot financing; **AGR-A08-O03** Solar irrigation pumps |
| Premium Report special analyses (adds to Part E) | Water balance and crop-mix economics                                                                                                 |

### AGR-A09 Inputs (seed, fertiliser, agrochemicals, mechanisation)

| **Dimension**                                    | **Asset-specific content**                                                                                              |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Input demand by district; Dealer network                                                                                |
| Map layers \[MAP\]                               | Input dealers and blending plants                                                                                       |
| Gap opportunities → Opportunities list           | **AGR-A09-O01** Fertiliser blending; **AGR-A09-O02** Mechanisation service hubs; **AGR-A09-O03** Seed processing plants |
| Premium Report special analyses (adds to Part E) | Input demand model                                                                                                      |

### AGR-A10 Agro-processing and food manufacturing

| **Dimension**                                    | **Asset-specific content**                                                                                      |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Raw-material supply radius; Food safety certification                                                           |
| Map layers \[MAP\]                               | Processing plants; Raw-material zones                                                                           |
| Gap opportunities → Opportunities list           | **AGR-A10-O01** Agri-parks processing; **AGR-A10-O02** Drying and dehydration; **AGR-A10-O03** Packaging plants |
| Premium Report special analyses (adds to Part E) | Plant feasibility with supply curve                                                                             |

## F5. Livestock, Fisheries & Blue Economy (BLU)

| **Item**                                            | **Content**                                                                                                                                                             |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Stock routes, quarantine/vet stations, abattoirs, cold chain, harbours                                                                                                  |
| South African model anchors (data and institutions) | Dept of Agriculture Veterinary Services (disease control areas); RMIS (Red Meat Industry Services); DFFE Fisheries (rights allocation); Operation Phakisa ocean economy |
| Regulation and licensing (SA model)                 | Animal Diseases Act; Meat Safety Act; Marine Living Resources Act (fishing rights); Aquaculture permits; Export establishment approvals                                 |
| Key risks                                           | FMD outbreaks and trade bans; Drought; Fishing quota allocation; Stock theft                                                                                            |
| Investment models                                   | Feedlot + abattoir; Contract rearing; Aquaculture farm; Fishing JV with rights holder                                                                                   |
| Asset types covered                                 | 6                                                                                                                                                                       |

### BLU-A01 Beef, small stock and feedlots

| **Dimension**                                    | **Asset-specific content**                                                                                                                                               |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Herd size by district; Disease control zones; Export-approved abattoirs                                                                                                  |
| Map layers \[MAP\]                               | Livestock density; FMD control areas; Abattoirs and feedlots                                                                                                             |
| Gap opportunities → Opportunities list           | **BLU-A01-O01** Export-certified abattoir; **BLU-A01-O02** Feedlot expansion; **BLU-A01-O03** Hides and leather tanning; **BLU-A01-O04** Livestock auctions digitisation |
| Premium Report special analyses (adds to Part E) | Market access by disease status; Feedlot margin model                                                                                                                    |

### BLU-A02 Dairy

| **Dimension**                                    | **Asset-specific content**                               |
|--------------------------------------------------|----------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Milk production by region; Processing capacity           |
| Map layers \[MAP\]                               | Dairy farms and processors                               |
| Gap opportunities → Opportunities list           | **BLU-A02-O01** UHT/powder plant; **BLU-A02-O02** Cheese |
| Premium Report special analyses (adds to Part E) | Milk supply curve                                        |

### BLU-A03 Poultry and eggs

| **Dimension**                                    | **Asset-specific content**                                           |
|--------------------------------------------------|----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Broiler production; Feed cost; Avian influenza zones                 |
| Map layers \[MAP\]                               | Poultry farms and abattoirs; Feed mills                              |
| Gap opportunities → Opportunities list           | **BLU-A03-O01** Integrated broiler units; **BLU-A03-O02** Hatcheries |
| Premium Report special analyses (adds to Part E) | Feed-cost sensitivity                                                |

### BLU-A04 Wild-capture fisheries

| **Dimension**                                    | **Asset-specific content**                                                        |
|--------------------------------------------------|-----------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | TAC/quotas; Rights holders; Landings                                              |
| Map layers \[MAP\]                               | Fishing zones; Harbours and landing sites; Processing plants                      |
| Gap opportunities → Opportunities list           | **BLU-A04-O01** Harbour cold storage; **BLU-A04-O02** Value-added fish processing |
| Premium Report special analyses (adds to Part E) | Rights and catch economics                                                        |

### BLU-A05 Aquaculture and mariculture

| **Dimension**                                    | **Asset-specific content**                                                                                 |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Site suitability (temperature, salinity); Permits                                                          |
| Map layers \[MAP\]                               | Aquaculture development zones; Hatcheries                                                                  |
| Gap opportunities → Opportunities list           | **BLU-A05-O01** Abalone/oyster/finfish farms; **BLU-A05-O02** Fish feed plants; **BLU-A05-O03** Hatcheries |
| Premium Report special analyses (adds to Part E) | Biological and growth model                                                                                |

### BLU-A06 Marine services (ship repair, bunkering)

| **Dimension**                                    | **Asset-specific content**                                                     |
|--------------------------------------------------|--------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Port facilities                                                                |
| Map layers \[MAP\]                               | Dry docks, repair yards                                                        |
| Gap opportunities → Opportunities list           | **BLU-A06-O01** Ship repair concessions; **BLU-A06-O02** Offshore supply bases |
| Premium Report special analyses (adds to Part E) | Market demand for vessel repair                                                |

## F6. Forestry & Timber (FOR)

| **Item**                                            | **Content**                                                                                   |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Forest roads, mills, rail/port                                                                |
| South African model anchors (data and institutions) | DFFE forestry statistics; Forestry SA; State plantation leases (e.g. Komatiland)              |
| Regulation and licensing (SA model)                 | National Forests Act (licensing); Water use (stream-flow reduction activity); Fire management |
| Key risks                                           | Fire; Pests; Water licensing for afforestation; Theft                                         |
| Investment models                                   | Plantation lease; Integrated plantation-mill; Timber processing                               |
| Asset types covered                                 | 3                                                                                             |

### FOR-A01 Plantation forestry

| **Dimension**                                    | **Asset-specific content**                                                             |
|--------------------------------------------------|----------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Area by species and age class; Stream-flow reduction licences                          |
| Map layers \[MAP\]                               | Plantations; Fire history                                                              |
| Gap opportunities → Opportunities list           | **FOR-A01-O01** New afforestation (licensed); **FOR-A01-O02** Fire management services |
| Premium Report special analyses (adds to Part E) | Growth and yield model                                                                 |

### FOR-A02 Sawmilling, panels, poles

| **Dimension**                                    | **Asset-specific content**                                           |
|--------------------------------------------------|----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Log supply; Product demand                                           |
| Map layers \[MAP\]                               | Mills                                                                |
| Gap opportunities → Opportunities list           | **FOR-A02-O01** Engineered wood (CLT); **FOR-A02-O02** Treated poles |
| Premium Report special analyses (adds to Part E) | Log-supply security analysis                                         |

### FOR-A03 Pulp, paper and bio-products

| **Dimension**                                    | **Asset-specific content**                    |
|--------------------------------------------------|-----------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Fibre supply; Water                           |
| Map layers \[MAP\]                               | Pulp mills                                    |
| Gap opportunities → Opportunities list           | **FOR-A03-O01** Dissolving pulp, biochemicals |
| Premium Report special analyses (adds to Part E) | Product-market study                          |

## F7. Manufacturing & Industrial (MFG)

| **Item**                                            | **Content**                                                                                                                           |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Industrial power, gas, water/effluent, rail sidings, ports, fibre                                                                     |
| South African model anchors (data and institutions) | dtic incentives and SEZ programme; IDC sector funding; Stats SA manufacturing production; Industrial Policy (Master Plans per sector) |
| Regulation and licensing (SA model)                 | Special Economic Zones Act; NRCS compulsory specifications; SABS standards; Customs rebates (e.g. Schedule 3/4); Air quality licences |
| Key risks                                           | Power reliability; Logistics costs; Import competition; Labour relations                                                              |
| Investment models                                   | Greenfield in SEZ; Acquisition; Contract manufacturing; JV                                                                            |
| Asset types covered                                 | 7                                                                                                                                     |

### MFG-A01 Automotive and components

| **Dimension**                                    | **Asset-specific content**                                            |
|--------------------------------------------------|-----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | OEM plants; Localisation targets; APDP incentives                     |
| Map layers \[MAP\]                               | OEM plants; Supplier parks                                            |
| Gap opportunities → Opportunities list           | **MFG-A01-O01** Component localisation; **MFG-A01-O02** EV components |
| Premium Report special analyses (adds to Part E) | Supplier-gap analysis                                                 |

### MFG-A02 Food and beverage processing

| **Dimension**                                    | **Asset-specific content**                |
|--------------------------------------------------|-------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Raw-material supply; Retail demand        |
| Map layers \[MAP\]                               | Food plants; Retail DCs                   |
| Gap opportunities → Opportunities list           | **MFG-A02-O01** Import substitution lines |
| Premium Report special analyses (adds to Part E) | Demand and price model                    |

### MFG-A03 Chemicals, plastics and packaging

| **Dimension**                                    | **Asset-specific content**                                                   |
|--------------------------------------------------|------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Feedstock; Regulation                                                        |
| Map layers \[MAP\]                               | Chemical clusters                                                            |
| Gap opportunities → Opportunities list           | **MFG-A03-O01** Recycled-resin plants; **MFG-A03-O02** Packaging for exports |
| Premium Report special analyses (adds to Part E) | Feedstock economics                                                          |

### MFG-A04 Steel and metal fabrication

| **Dimension**                                    | **Asset-specific content**                                                 |
|--------------------------------------------------|----------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Scrap and ore supply; Import tariffs                                       |
| Map layers \[MAP\]                               | Mills, fabricators                                                         |
| Gap opportunities → Opportunities list           | **MFG-A04-O01** Mini-mills; **MFG-A04-O02** Fabrication for infrastructure |
| Premium Report special analyses (adds to Part E) | Cost curve                                                                 |

### MFG-A05 Textiles, clothing, leather, footwear

| **Dimension**                                    | **Asset-specific content**                        |
|--------------------------------------------------|---------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Fabric supply; Trade preferences                  |
| Map layers \[MAP\]                               | Clothing clusters                                 |
| Gap opportunities → Opportunities list           | **MFG-A05-O01** Cut-make-trim for regional retail |
| Premium Report special analyses (adds to Part E) | Landed cost vs imports                            |

### MFG-A06 Cement and building materials

| **Dimension**                                    | **Asset-specific content**                                            |
|--------------------------------------------------|-----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Capacity utilisation; Demand pipeline                                 |
| Map layers \[MAP\]                               | Cement plants; Quarries                                               |
| Gap opportunities → Opportunities list           | **MFG-A06-O01** Blended cements; **MFG-A06-O02** Bricks/blocks plants |
| Premium Report special analyses (adds to Part E) | Regional supply-demand                                                |

### MFG-A07 Industrial parks and SEZ development

| **Dimension**                                    | **Asset-specific content**                                                    |
|--------------------------------------------------|-------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Occupancy; Bulk services                                                      |
| Map layers \[MAP\]                               | SEZ boundaries; Available plots                                               |
| Gap opportunities → Opportunities list           | **MFG-A07-O01** Private SEZ operator; **MFG-A07-O02** Build-to-suit factories |
| Premium Report special analyses (adds to Part E) | Park financial model                                                          |

## F8. Water, Sanitation & Waste (WSW)

| **Item**                                            | **Content**                                                                                                          |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Raw water sources, bulk mains, treatment works, sewer, landfills                                                     |
| South African model anchors (data and institutions) | DWS Blue Drop/Green Drop/No Drop reports; Water boards (e.g. Rand Water); WARMS; Municipal financial data (Treasury) |
| Regulation and licensing (SA model)                 | National Water Act; Water Services Act; NEMWA; Municipal PPP regulations                                             |
| Key risks                                           | Municipal payment; Tariff politics; Drought; Infrastructure decay                                                    |
| Investment models                                   | BOT desal/WWTP; NRW performance contracts; Waste concessions                                                         |
| Asset types covered                                 | 5                                                                                                                    |

### WSW-A01 Bulk water and dams

| **Dimension**                                    | **Asset-specific content**              |
|--------------------------------------------------|-----------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Yield and allocation; Scheme status     |
| Map layers \[MAP\]                               | Dams and transfer schemes               |
| Gap opportunities → Opportunities list           | **WSW-A01-O01** Off-budget bulk schemes |
| Premium Report special analyses (adds to Part E) | Yield and demand model                  |

### WSW-A02 Water and wastewater treatment

| **Dimension**                                    | **Asset-specific content**                                                              |
|--------------------------------------------------|-----------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Blue/Green Drop scores; Plant capacity and compliance                                   |
| Map layers \[MAP\]                               | Treatment works coloured by compliance                                                  |
| Gap opportunities → Opportunities list           | **WSW-A02-O01** WWTP refurbishment and operation contracts; **WSW-A02-O02** Water reuse |
| Premium Report special analyses (adds to Part E) | Performance-contract design                                                             |

### WSW-A03 Desalination

| **Dimension**                                    | **Asset-specific content** |
|--------------------------------------------------|----------------------------|
| Must-find (in addition to IQ01–IQ45)             | Coastal sites; Energy cost |
| Map layers \[MAP\]                               | Candidate sites            |
| Gap opportunities → Opportunities list           | **WSW-A03-O01** Desal PPP  |
| Premium Report special analyses (adds to Part E) | Cost per m³ model          |

### WSW-A04 Non-revenue water and metering

| **Dimension**                                    | **Asset-specific content**                                     |
|--------------------------------------------------|----------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | NRW %; Billing efficiency                                      |
| Map layers \[MAP\]                               | NRW by municipality                                            |
| Gap opportunities → Opportunities list           | **WSW-A04-O01** Smart metering; **WSW-A04-O02** Leak detection |
| Premium Report special analyses (adds to Part E) | Shared-savings model                                           |

### WSW-A05 Solid waste and recycling

| **Dimension**                                    | **Asset-specific content**                                                                               |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Waste volumes; Landfill airspace                                                                         |
| Map layers \[MAP\]                               | Landfills, MRFs                                                                                          |
| Gap opportunities → Opportunities list           | **WSW-A05-O01** MRFs and recycling plants; **WSW-A05-O02** Waste-to-energy; **WSW-A05-O03** Landfill gas |
| Premium Report special analyses (adds to Part E) | Waste flow and gate-fee model                                                                            |

## F9. Transport & Logistics (TRN)

| **Item**                                            | **Content**                                                                                                                                                        |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | This sector is the connection layer: roads, rail, ports, airports, logistics nodes                                                                                 |
| South African model anchors (data and institutions) | SANRAL network and projects; Provincial road departments (RAMS); Municipal RAMS; Transnet (TFR, TNPA, TPT); ACSA; Ports Regulator; Freight Logistics Roadmap / NLC |
| Regulation and licensing (SA model)                 | SANRAL Act; National Land Transport Act; National Ports Act; PFMA/MFMA PPP regulations; Road traffic and axle-load regulations                                     |
| Key risks                                           | Traffic risk; Toll acceptance; Maintenance funding; Theft and vandalism; Climate damage                                                                            |
| Investment models                                   | Toll concession; Availability PPP; Port terminal concession; Rail third-party access; Logistics park                                                               |
| Asset types covered                                 | 6                                                                                                                                                                  |

### TRN-A01 Roads (national, provincial, district, municipal)

| **Dimension**                                    | **Asset-specific content**                            |
|--------------------------------------------------|-------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | See Worked Example 2 — full chain                     |
| Map layers \[MAP\]                               | See Worked Example 2                                  |
| Gap opportunities → Opportunities list           | **TRN-A01-O01** See Worked Example 2 opportunity list |
| Premium Report special analyses (adds to Part E) | See Worked Example 2 report architecture              |

### TRN-A02 Rail freight and passenger

| **Dimension**                                    | **Asset-specific content**                                                                                                     |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Line status and axle load; Third-party access slots; Rolling stock availability                                                |
| Map layers \[MAP\]                               | Rail lines by status; Sidings and terminals                                                                                    |
| Gap opportunities → Opportunities list           | **TRN-A02-O01** Private rail operators on access slots; **TRN-A02-O02** Branch-line concessions; **TRN-A02-O03** Wagon leasing |
| Premium Report special analyses (adds to Part E) | Traffic and access-tariff model                                                                                                |

### TRN-A03 Ports and terminals

| **Dimension**                                    | **Asset-specific content**                                                                                      |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Throughput and capacity; Dwell times; Concession terms                                                          |
| Map layers \[MAP\]                               | Ports, terminals, berths; Back-of-port logistics                                                                |
| Gap opportunities → Opportunities list           | **TRN-A03-O01** Terminal concessions; **TRN-A03-O02** Truck staging areas; **TRN-A03-O03** Port digital systems |
| Premium Report special analyses (adds to Part E) | Capacity-demand model                                                                                           |

### TRN-A04 Airports and air cargo

| **Dimension**                                    | **Asset-specific content**                                                                                        |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Passenger/cargo volumes; Slot capacity                                                                            |
| Map layers \[MAP\]                               | Airports by category                                                                                              |
| Gap opportunities → Opportunities list           | **TRN-A04-O01** Air cargo terminals; **TRN-A04-O02** MRO facilities; **TRN-A04-O03** Regional airport concessions |
| Premium Report special analyses (adds to Part E) | Traffic forecast                                                                                                  |

### TRN-A05 Logistics parks, dry ports, warehousing

| **Dimension**                                    | **Asset-specific content**                                                                       |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Demand by corridor; Land at junctions                                                            |
| Map layers \[MAP\]                               | ICDs, logistics parks                                                                            |
| Gap opportunities → Opportunities list           | **TRN-A05-O01** Inland ports; **TRN-A05-O02** Bonded warehouses; **TRN-A05-O03** Cold chain hubs |
| Premium Report special analyses (adds to Part E) | Location optimisation                                                                            |

### TRN-A06 Urban public transport

| **Dimension**                                    | **Asset-specific content**                                              |
|--------------------------------------------------|-------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Ridership; Subsidy                                                      |
| Map layers \[MAP\]                               | BRT/rail routes                                                         |
| Gap opportunities → Opportunities list           | **TRN-A06-O01** Bus fleet electrification; **TRN-A06-O02** Fare systems |
| Premium Report special analyses (adds to Part E) | Ridership model                                                         |

## F10. ICT, Digital & Telecoms (ICT)

| **Item**                                            | **Content**                                                                                                         |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Fibre backbone, submarine cables/landing stations, PoPs, IXPs, data centres                                         |
| South African model anchors (data and institutions) | ICASA licensing and spectrum; Operators’ coverage maps; SA Connect; NAPAfrica and other IXP data                    |
| Regulation and licensing (SA model)                 | Electronic Communications Act; POPIA (data protection); Rapid deployment / rights-of-way policy; Spectrum licensing |
| Key risks                                           | Load-shedding/power; Vandalism/cable theft; Licence fees; FX on capacity                                            |
| Investment models                                   | Towerco; Open-access fibre; Colocation data centre; USF-backed rollout                                              |
| Asset types covered                                 | 6                                                                                                                   |

### ICT-A01 Fibre (backbone, metro, FTTH)

| **Dimension**                                    | **Asset-specific content**                                                           |
|--------------------------------------------------|--------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Homes passed; Wayleave fees; Open-access status                                      |
| Map layers \[MAP\]                               | Fibre routes (generalised); Unconnected towns                                        |
| Gap opportunities → Opportunities list           | **ICT-A01-O01** FTTH in secondary towns; **ICT-A01-O02** Fibre in road/rail reserves |
| Premium Report special analyses (adds to Part E) | Take-up and ARPU model                                                               |

### ICT-A02 Mobile towers and rural coverage

| **Dimension**                                    | **Asset-specific content**                                              |
|--------------------------------------------------|-------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Coverage gaps; Site rental                                              |
| Map layers \[MAP\]                               | Coverage raster; Gap settlements                                        |
| Gap opportunities → Opportunities list           | **ICT-A02-O01** Rural towerco; **ICT-A02-O02** Neutral-host small cells |
| Premium Report special analyses (adds to Part E) | Coverage-gap economics                                                  |

### ICT-A03 Data centres and cloud

| **Dimension**                                    | **Asset-specific content**                                                                   |
|--------------------------------------------------|----------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Power availability and price; Latency; Land                                                  |
| Map layers \[MAP\]                               | Data centres (S2); Substations near metros                                                   |
| Gap opportunities → Opportunities list           | **ICT-A03-O01** Edge data centres in secondary cities; **ICT-A03-O02** Renewable-powered DCs |
| Premium Report special analyses (adds to Part E) | Demand (MW) forecast                                                                         |

### ICT-A04 Submarine cables and landing stations

| **Dimension**                                    | **Asset-specific content**                 |
|--------------------------------------------------|--------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Capacity; Landing points                   |
| Map layers \[MAP\]                               | Cables and landing stations                |
| Gap opportunities → Opportunities list           | **ICT-A04-O01** Landing-station colocation |
| Premium Report special analyses (adds to Part E) | Capacity pricing                           |

### ICT-A05 Digital services, BPO and software

| **Dimension**                                    | **Asset-specific content**                      |
|--------------------------------------------------|-------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Talent pool; Language skills; Incentives (BPS)  |
| Map layers \[MAP\]                               | BPO clusters                                    |
| Gap opportunities → Opportunities list           | **ICT-A05-O01** BPO centres in secondary cities |
| Premium Report special analyses (adds to Part E) | Cost-to-serve benchmark                         |

### ICT-A06 E-commerce and digital payments platforms

| **Dimension**                                    | **Asset-specific content**                      |
|--------------------------------------------------|-------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Online penetration; Delivery coverage           |
| Map layers \[MAP\]                               | Fulfilment coverage                             |
| Gap opportunities → Opportunities list           | **ICT-A06-O01** Last-mile networks in townships |
| Premium Report special analyses (adds to Part E) | Unit economics                                  |

## F11. Construction, Real Estate & Housing (CRE)

| **Item**                                            | **Content**                                                                                      |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Bulk services: water, sewer, power, roads                                                        |
| South African model anchors (data and institutions) | Housing Development Agency; Deeds Office; Municipal SDFs/valuation rolls; SAPOA/IPD data; CIDB   |
| Regulation and licensing (SA model)                 | SPLUMA; Housing Act; Sectional Titles Act; NHBRC registration; Building regulations (SANS 10400) |
| Key risks                                           | Bulk-service capacity; Approval delays; Land invasions; Affordability                            |
| Investment models                                   | Developer–funder JV; Land-for-equity; REIT; Rent-to-own                                          |
| Asset types covered                                 | 5                                                                                                |

### CRE-A01 Affordable and social housing

| **Dimension**                                    | **Asset-specific content**                                                                                                          |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Housing backlog by municipality; Subsidy instruments (FLISP etc.); Bulk capacity                                                    |
| Map layers \[MAP\]                               | Backlog choropleth; Housing projects; Well-located land parcels                                                                     |
| Gap opportunities → Opportunities list           | **CRE-A01-O01** Affordable rental; **CRE-A01-O02** Building-material supply hubs; **CRE-A01-O03** Alternative building technologies |
| Premium Report special analyses (adds to Part E) | Affordability and absorption model                                                                                                  |

### CRE-A02 Commercial property (retail, office, mixed-use)

| **Dimension**                                    | **Asset-specific content**                                                                 |
|--------------------------------------------------|--------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Rentals and vacancies; Footfall                                                            |
| Map layers \[MAP\]                               | Malls, office nodes                                                                        |
| Gap opportunities → Opportunities list           | **CRE-A02-O01** Township retail centres; **CRE-A02-O02** Office-to-residential conversions |
| Premium Report special analyses (adds to Part E) | Catchment spend model                                                                      |

### CRE-A03 Industrial and logistics property

| **Dimension**                                    | **Asset-specific content**               |
|--------------------------------------------------|------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Rents, vacancy by node                   |
| Map layers \[MAP\]                               | Industrial nodes                         |
| Gap opportunities → Opportunities list           | **CRE-A03-O01** Build-to-suit warehouses |
| Premium Report special analyses (adds to Part E) | Demand by node                           |

### CRE-A04 Student and specialised housing

| **Dimension**                                    | **Asset-specific content**            |
|--------------------------------------------------|---------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Bed shortfall by campus               |
| Map layers \[MAP\]                               | Campuses with bed gap                 |
| Gap opportunities → Opportunities list           | **CRE-A04-O01** PBSA developments     |
| Premium Report special analyses (adds to Part E) | Occupancy and NSFAS-linked rent model |

### CRE-A05 Construction services and materials supply

| **Dimension**                                    | **Asset-specific content**                                    |
|--------------------------------------------------|---------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Pipeline of public projects; Contractor grading               |
| Map layers \[MAP\]                               | Project pipeline                                              |
| Gap opportunities → Opportunities list           | **CRE-A05-O01** Plant hire; **CRE-A05-O02** Precast factories |
| Premium Report special analyses (adds to Part E) | Pipeline capture analysis                                     |

## F12. Tourism & Hospitality (TOU)

| **Item**                                            | **Content**                                                                                                |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Air routes, roads to attractions, utilities at remote sites                                                |
| South African model anchors (data and institutions) | SA Tourism statistics; Stats SA tourism accommodation survey; SANParks concession programme; TGCSA grading |
| Regulation and licensing (SA model)                 | Tourism Act; SANParks/provincial concession rules; Liquor licensing; Visa regime                           |
| Key risks                                           | Safety perception; Air access; Seasonality; Climate                                                        |
| Investment models                                   | Concession; Management contract; Franchise; Sale-leaseback                                                 |
| Asset types covered                                 | 4                                                                                                          |

### TOU-A01 Hotels and resorts

| **Dimension**                                    | **Asset-specific content**                                   |
|--------------------------------------------------|--------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Occupancy, ADR, RevPAR; Pipeline                             |
| Map layers \[MAP\]                               | Hotels by grade; Demand generators                           |
| Gap opportunities → Opportunities list           | **TOU-A01-O01** Mid-scale branded hotels in secondary cities |
| Premium Report special analyses (adds to Part E) | Hotel feasibility (RevPAR model)                             |

### TOU-A02 Wildlife and nature concessions

| **Dimension**                                    | **Asset-specific content**                                                 |
|--------------------------------------------------|----------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Concession tenders; Bed limits                                             |
| Map layers \[MAP\]                               | Parks, concession areas                                                    |
| Gap opportunities → Opportunities list           | **TOU-A02-O01** Lodge concessions; **TOU-A02-O02** Community conservancies |
| Premium Report special analyses (adds to Part E) | Concession financial model                                                 |

### TOU-A03 Coastal, heritage and cultural tourism

| **Dimension**                                    | **Asset-specific content**                      |
|--------------------------------------------------|-------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Visitor numbers                                 |
| Map layers \[MAP\]                               | Attractions                                     |
| Gap opportunities → Opportunities list           | **TOU-A03-O01** Heritage precinct redevelopment |
| Premium Report special analyses (adds to Part E) | Visitor demand model                            |

### TOU-A04 MICE and events

| **Dimension**                                    | **Asset-specific content**     |
|--------------------------------------------------|--------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Venue capacity                 |
| Map layers \[MAP\]                               | Convention centres             |
| Gap opportunities → Opportunities list           | **TOU-A04-O01** Venue upgrades |
| Premium Report special analyses (adds to Part E) | Event calendar economics       |

## F13. Health & Pharmaceuticals (HLT)

| **Item**                                            | **Content**                                                                                                        |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Referral networks, cold chain, reliable power/water                                                                |
| South African model anchors (data and institutions) | SAHPRA registers; DoH facility lists; Council for Medical Schemes data; NHI implementation                         |
| Regulation and licensing (SA model)                 | Medicines and Related Substances Act; National Health Act (facility licensing); NHI Act; Pricing regulations (SEP) |
| Key risks                                           | NHI policy uncertainty; Skills shortages; Regulatory timelines                                                     |
| Investment models                                   | Hospital PPP; Private hospital; Contract manufacturing; Diagnostics network                                        |
| Asset types covered                                 | 4                                                                                                                  |

### HLT-A01 Hospitals, clinics and diagnostics

| **Dimension**                                    | **Asset-specific content**                                                                |
|--------------------------------------------------|-------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Beds per population; Insurance coverage; Travel time to care                              |
| Map layers \[MAP\]                               | Facilities by type; Access isochrones                                                     |
| Gap opportunities → Opportunities list           | **HLT-A01-O01** Day hospitals; **HLT-A01-O02** Diagnostic labs/imaging in secondary towns |
| Premium Report special analyses (adds to Part E) | Demand and payer-mix model                                                                |

### HLT-A02 Pharmaceutical and vaccine manufacturing

| **Dimension**                                    | **Asset-specific content**                                                                  |
|--------------------------------------------------|---------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Registered products; Tender demand; GMP status                                              |
| Map layers \[MAP\]                               | Plants                                                                                      |
| Gap opportunities → Opportunities list           | **HLT-A02-O01** API and fill-finish; **HLT-A02-O02** Regional supply for pooled procurement |
| Premium Report special analyses (adds to Part E) | Tender-volume market sizing                                                                 |

### HLT-A03 Medical devices and consumables

| **Dimension**                                    | **Asset-specific content**                      |
|--------------------------------------------------|-------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Import dependence                               |
| Map layers \[MAP\]                               | Distributors                                    |
| Gap opportunities → Opportunities list           | **HLT-A03-O01** Local consumables manufacturing |
| Premium Report special analyses (adds to Part E) | Import substitution analysis                    |

### HLT-A04 Health tech and telemedicine

| **Dimension**                                    | **Asset-specific content**            |
|--------------------------------------------------|---------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Connectivity; Regulation              |
| Map layers \[MAP\]                               | Underserved areas                     |
| Gap opportunities → Opportunities list           | **HLT-A04-O01** Telemedicine networks |
| Premium Report special analyses (adds to Part E) | Adoption model                        |

## F14. Education & Skills (EDU)

| **Item**                                            | **Content**                                                                                                          |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Transport routes, connectivity, power                                                                                |
| South African model anchors (data and institutions) | DBE/DHET data (EMIS, HEMIS); SETAs; QCTO                                                                             |
| Regulation and licensing (SA model)                 | South African Schools Act (independent school registration); Higher Education Act (private HEIs); QCTO accreditation |
| Key risks                                           | Affordability; Accreditation                                                                                         |
| Investment models                                   | School chains; PPP schools; PBSA; Corporate academies                                                                |
| Asset types covered                                 | 3                                                                                                                    |

### EDU-A01 Independent schools

| **Dimension**                                    | **Asset-specific content**                |
|--------------------------------------------------|-------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Enrolment gaps; Fee bands                 |
| Map layers \[MAP\]                               | Schools; School-age population            |
| Gap opportunities → Opportunities list           | **EDU-A01-O01** Low/mid-fee school chains |
| Premium Report special analyses (adds to Part E) | Enrolment ramp model                      |

### EDU-A02 Higher education and TVET

| **Dimension**                                    | **Asset-specific content**                    |
|--------------------------------------------------|-----------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Programme demand; Accreditation               |
| Map layers \[MAP\]                               | Campuses                                      |
| Gap opportunities → Opportunities list           | **EDU-A02-O01** Private TVET in scarce skills |
| Premium Report special analyses (adds to Part E) | Skills demand mapping                         |

### EDU-A03 Ed-tech

| **Dimension**                                    | **Asset-specific content**         |
|--------------------------------------------------|------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Device and data access             |
| Map layers \[MAP\]                               | Connectivity                       |
| Gap opportunities → Opportunities list           | **EDU-A03-O01** Learning platforms |
| Premium Report special analyses (adds to Part E) | Adoption model                     |

## F15. Financial Services & Fintech (FIN)

| **Item**                                            | **Content**                                                                                  |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Payment rails, branch/agent networks                                                         |
| South African model anchors (data and institutions) | SARB Prudential Authority; FSCA; JSE; FinScope surveys                                       |
| Regulation and licensing (SA model)                 | Banks Act; Financial Sector Regulation Act; Insurance Act; National Payment System Act; FICA |
| Key risks                                           | Regulatory change; Cyber; Sovereign exposure                                                 |
| Investment models                                   | Licence/greenfield; Acquisition; Platform partnership                                        |
| Asset types covered                                 | 4                                                                                            |

### FIN-A01 Banking and lending (incl. SME and agri finance)

| **Dimension**                                    | **Asset-specific content**                                                                                                    |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Credit gaps by segment                                                                                                        |
| Map layers \[MAP\]                               | Branch/agent density                                                                                                          |
| Gap opportunities → Opportunities list           | **FIN-A01-O01** SME lending platforms; **FIN-A01-O02** Warehouse-receipt finance; **FIN-A01-O03** Asset finance for equipment |
| Premium Report special analyses (adds to Part E) | Credit-gap sizing                                                                                                             |

### FIN-A02 Insurance and risk transfer

| **Dimension**                                    | **Asset-specific content**                                                 |
|--------------------------------------------------|----------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Penetration                                                                |
| Map layers \[MAP\]                               | —                                                                          |
| Gap opportunities → Opportunities list           | **FIN-A02-O01** Index-based crop insurance; **FIN-A02-O02** Microinsurance |
| Premium Report special analyses (adds to Part E) | Product-market fit                                                         |

### FIN-A03 Payments and fintech

| **Dimension**                                    | **Asset-specific content**                                                             |
|--------------------------------------------------|----------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Mobile money usage; Interoperability                                                   |
| Map layers \[MAP\]                               | Agent networks                                                                         |
| Gap opportunities → Opportunities list           | **FIN-A03-O01** Cross-border payments; **FIN-A03-O02** Merchant acquiring in townships |
| Premium Report special analyses (adds to Part E) | Unit economics                                                                         |

### FIN-A04 Capital markets and funds

| **Dimension**                                    | **Asset-specific content**                                             |
|--------------------------------------------------|------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Listings; Pension allocations                                          |
| Map layers \[MAP\]                               | Exchanges                                                              |
| Gap opportunities → Opportunities list           | **FIN-A04-O01** Infrastructure debt funds; **FIN-A04-O02** Green bonds |
| Premium Report special analyses (adds to Part E) | Investor demand analysis                                               |

## F16. Trade, Distribution & Retail (TRD)

| **Item**                                            | **Content**                                                                                           |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Distribution routes, DCs, wholesale markets                                                           |
| South African model anchors (data and institutions) | Stats SA retail/wholesale trade sales; Fresh produce markets; Competition Commission market inquiries |
| Regulation and licensing (SA model)                 | Business licensing; Consumer Protection Act; Liquor/tobacco licensing; Import permits (ITAC)          |
| Key risks                                           | Informal competition; Crime; Consumer spend                                                           |
| Investment models                                   | Distribution JV; Franchise; Acquisition                                                               |
| Asset types covered                                 | 4                                                                                                     |

### TRD-A01 Wholesale and FMCG distribution

| **Dimension**                                    | **Asset-specific content**                 |
|--------------------------------------------------|--------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Outlet density; Route-to-market costs      |
| Map layers \[MAP\]                               | Wholesalers, DCs                           |
| Gap opportunities → Opportunities list           | **TRD-A01-O01** Township distribution hubs |
| Premium Report special analyses (adds to Part E) | Route-to-market model                      |

### TRD-A02 Modern retail and malls

| **Dimension**                                    | **Asset-specific content**                                |
|--------------------------------------------------|-----------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Spend per capita                                          |
| Map layers \[MAP\]                               | Retail centres                                            |
| Gap opportunities → Opportunities list           | **TRD-A02-O01** Convenience formats in under-served towns |
| Premium Report special analyses (adds to Part E) | Catchment model                                           |

### TRD-A03 Fresh produce markets

| **Dimension**                                    | **Asset-specific content**               |
|--------------------------------------------------|------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Throughput; Market fees                  |
| Map layers \[MAP\]                               | Municipal fresh produce markets          |
| Gap opportunities → Opportunities list           | **TRD-A03-O01** Market modernisation PPP |
| Premium Report special analyses (adds to Part E) | Throughput model                         |

### TRD-A04 Commodity trading and export houses

| **Dimension**                                    | **Asset-specific content**                           |
|--------------------------------------------------|------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | See Part F trade sheets                              |
| Map layers \[MAP\]                               | Trade flows                                          |
| Gap opportunities → Opportunities list           | **TRD-A04-O01** Aggregation and export consolidation |
| Premium Report special analyses (adds to Part E) | Margin model                                         |

## F17. Green Economy, Climate & Carbon (GRN)

| **Item**                                            | **Content**                                                                                                  |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Registries, MRV networks, project boundaries                                                                 |
| South African model anchors (data and institutions) | Carbon Tax Act offsets; DFFE climate change response; JET Investment Plan; Registries (Verra, Gold Standard) |
| Regulation and licensing (SA model)                 | Climate Change Act 2024; Carbon Tax Act and offset regulations; Article 6 arrangements \[VERIFY\]            |
| Key risks                                           | Integrity/credibility; Policy shifts; Price volatility                                                       |
| Investment models                                   | Project developer equity; Offtake/pre-purchase; Results-based finance                                        |
| Asset types covered                                 | 4                                                                                                            |

### GRN-A01 Carbon projects (nature-based and engineered)

| **Dimension**                                    | **Asset-specific content**                                                                                        |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Methodologies; Baselines; Buyer demand                                                                            |
| Map layers \[MAP\]                               | Registered projects                                                                                               |
| Gap opportunities → Opportunities list           | **GRN-A01-O01** Grassland/rangeland carbon; **GRN-A01-O02** Methane capture; **GRN-A01-O03** Cookstove programmes |
| Premium Report special analyses (adds to Part E) | Credit yield and price model                                                                                      |

### GRN-A02 Climate adaptation infrastructure

| **Dimension**                                    | **Asset-specific content**                                         |
|--------------------------------------------------|--------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Hazard exposure                                                    |
| Map layers \[MAP\]                               | Hazard hotspots                                                    |
| Gap opportunities → Opportunities list           | **GRN-A02-O01** Flood defences; **GRN-A02-O02** Drought resilience |
| Premium Report special analyses (adds to Part E) | Avoided-loss analysis                                              |

### GRN-A03 Circular economy and recycling

| **Dimension**                                    | **Asset-specific content**                  |
|--------------------------------------------------|---------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Waste streams                               |
| Map layers \[MAP\]                               | Material recovery facilities                |
| Gap opportunities → Opportunities list           | **GRN-A03-O01** EPR-linked recycling plants |
| Premium Report special analyses (adds to Part E) | Material flow analysis                      |

### GRN-A04 Green finance (bonds, transition funds)

| **Dimension**                                    | **Asset-specific content**          |
|--------------------------------------------------|-------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Taxonomy eligibility                |
| Map layers \[MAP\]                               | —                                   |
| Gap opportunities → Opportunities list           | **GRN-A04-O01** Green bond advisory |
| Premium Report special analyses (adds to Part E) | Taxonomy alignment                  |

## F18. Creative, Sports & Professional Services (CSP)

| **Item**                                            | **Content**                                                           |
|-----------------------------------------------------|-----------------------------------------------------------------------|
| Connection infrastructure to illuminate             | Broadband, transport, venues                                          |
| South African model anchors (data and institutions) | dtic film incentives; SA Sports Confederation; Stats SA services data |
| Regulation and licensing (SA model)                 | Copyright Act; Film rebate rules; Work permits                        |
| Key risks                                           | Piracy; Event security; Irregular revenue                             |
| Investment models                                   | Studio development; IP funds; Venue concessions                       |
| Asset types covered                                 | 4                                                                     |

### CSP-A01 Film, TV and studios

| **Dimension**                                    | **Asset-specific content**                                             |
|--------------------------------------------------|------------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Production spend; Incentive rules                                      |
| Map layers \[MAP\]                               | Studios and locations                                                  |
| Gap opportunities → Opportunities list           | **CSP-A01-O01** Studio complexes; **CSP-A01-O02** Post-production hubs |
| Premium Report special analyses (adds to Part E) | Incentive-adjusted cost model                                          |

### CSP-A02 Music, events and live entertainment

| **Dimension**                                    | **Asset-specific content**                                           |
|--------------------------------------------------|----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Venue capacity; Event calendar                                       |
| Map layers \[MAP\]                               | Venues                                                               |
| Gap opportunities → Opportunities list           | **CSP-A02-O01** Mid-size venues; **CSP-A02-O02** Ticketing platforms |
| Premium Report special analyses (adds to Part E) | Event economics                                                      |

### CSP-A03 Sports facilities and academies

| **Dimension**                                    | **Asset-specific content**                                            |
|--------------------------------------------------|-----------------------------------------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Facility gaps                                                         |
| Map layers \[MAP\]                               | Stadiums                                                              |
| Gap opportunities → Opportunities list           | **CSP-A03-O01** Stadium concessions; **CSP-A03-O02** Sports academies |
| Premium Report special analyses (adds to Part E) | Utilisation model                                                     |

### CSP-A04 Professional and business services

| **Dimension**                                    | **Asset-specific content**              |
|--------------------------------------------------|-----------------------------------------|
| Must-find (in addition to IQ01–IQ45)             | Skills availability                     |
| Map layers \[MAP\]                               | Service clusters                        |
| Gap opportunities → Opportunities list           | **CSP-A04-O01** Shared-services centres |
| Premium Report special analyses (adds to Part E) | Cost benchmark                          |

# PART G — All Traded Commodities: Trader Deep Catalogue

Every commodity takes the universal **Trader Chain TQ01–TQ40** (Annex 2)
in full. The tables below add each commodity’s HS code, its South
African model anchor and its commodity-specific must-find items. Each
commodity group then lists the value-chain gap opportunities, which are
instantiated per producing country. Pigeon peas are worked in full in
Part C. The commodity × question cross-product is in sheet
`Trader_InfoTypes`.

## G1. Grains & cereals

| **Commodity**        | **HS 2022** | **Sector** | **SA model anchor**                             | **Commodity-specific must-find**                                |
|----------------------|-------------|------------|-------------------------------------------------|-----------------------------------------------------------------|
| Maize (white/yellow) | 1005.90     | AGR        | Major SA crop; SAFEX contracts; SAGIS stocks    | Grade (WM1/YM1 etc.); SAFEX basis to silo; Import/export parity |
| Wheat                | 1001.99     | AGR        | SA net importer; variable import duty mechanism | Protein grade; Import tariff formula                            |
| Rice (milled)        | 1006.30     | AGR        | SA importer                                     | Broken %; Origin competitiveness                                |
| Sorghum              | 1007.90     | AGR        | SA niche; brewing demand                        | Tannin content                                                  |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-GC-O01** Certified warehouses;
**TRD-GC-O02** Warehouse-receipt financing; **TRD-GC-O03**
Cleaning/drying/grading plants; **TRD-GC-O04** Milling; **TRD-GC-O05**
Feed mills; **TRD-GC-O06** Mycotoxin testing labs; **TRD-GC-O07**
Rail-linked silo terminals; **TRD-GC-O08** Market information service;
**TRD-GC-O09** Crop insurance

## G2. Pulses & oilseeds

| **Commodity**                | **HS 2022** | **Sector** | **SA model anchor**                                                              | **Commodity-specific must-find**                           |
|------------------------------|-------------|------------|----------------------------------------------------------------------------------|------------------------------------------------------------|
| Pigeon peas (dried, shelled) | 0713.60     | AGR        | Not a commercial SA crop — SA template used; Malawi instance in Worked Example 1 | Destination quota/MoU; Grade 1–3; Aflatoxin/moisture       |
| Dry beans (Phaseolus)        | 0713.33     | AGR        | SA producer and importer (Dry Bean Producers’ Organisation)                      | Variety (red speckled, small white); Canning-quality specs |
| Chickpeas                    | 0713.20     | AGR        | Emerging SA crop                                                                 | Kabuli/desi grade                                          |
| Cowpeas                      | 0713.35     | AGR        | Minor                                                                            | Grade                                                      |
| Lentils                      | 0713.40     | AGR        | Importer                                                                         | Grade                                                      |
| Soybeans                     | 1201.90     | AGR        | Major SA crop; SAFEX contract                                                    | Oil/protein content; Crush margin                          |
| Sunflower seed               | 1206.00     | AGR        | Major SA crop; SAFEX contract                                                    | Oil content                                                |
| Groundnuts (shelled)         | 1202.42     | AGR        | SA producer                                                                      | Aflatoxin (EU limits); Count size                          |
| Sesame                       | 1207.40     | AGR        | Minor                                                                            | Purity                                                     |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-PO-O01** Cleaning, grading and sorting
plants; **TRD-PO-O02** Certified warehouses; **TRD-PO-O03**
Warehouse-receipt financing; **TRD-PO-O04** Dhal/split milling;
**TRD-PO-O05** Oil crushing; **TRD-PO-O06** Seed multiplication;
**TRD-PO-O07** Fumigation and containerisation services; **TRD-PO-O08**
Export consolidation hub; **TRD-PO-O09** Domestic protein foods

## G3. Cash & plantation crops

| **Commodity**                                   | **HS 2022** | **Sector** | **SA model anchor**                 | **Commodity-specific must-find**  |
|-------------------------------------------------|-------------|------------|-------------------------------------|-----------------------------------|
| Tobacco (unmanufactured, partly/wholly stemmed) | 2401.20     | AGR        | Small SA crop                       | Auction/contract system; Grade    |
| Tea (black)                                     | 0902.40     | AGR        | Minor SA; Malawi/Kenya majors       | Auction (e.g. Mombasa/Limbe)      |
| Rooibos/herbal tea                              | 1211.90     | AGR        | SA geographic indication            | GI compliance                     |
| Coffee (green, not decaf)                       | 0901.11     | AGR        | Minor SA                            | Cupping score; Certification      |
| Cocoa beans                                     | 1801.00     | AGR        | Not SA                              | EUDR traceability                 |
| Cotton (raw)                                    | 5201.00     | AGR        | SA small producer                   | Staple length; Ginning out-turn   |
| Raw cane sugar                                  | 1701.14     | AGR        | SA producer; SACU tariff protection | Polarisation; Preferential quotas |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-CPC-O01** Primary processing (roasting,
ginning, blending); **TRD-CPC-O02** Auction/exchange digitisation;
**TRD-CPC-O03** Certification services; **TRD-CPC-O04** Grower finance;
**TRD-CPC-O05** Traceability systems; **TRD-CPC-O06** Value-added
consumer brands

## G4. Horticulture & fruit

| **Commodity**         | **HS 2022** | **Sector** | **SA model anchor**             | **Commodity-specific must-find**   |
|-----------------------|-------------|------------|---------------------------------|------------------------------------|
| Oranges               | 0805.10     | AGR        | SA major exporter (CGA)         | CBS/FCM protocols; Cold-treatment  |
| Mandarins/soft citrus | 0805.21     | AGR        | SA major exporter               | Protocols                          |
| Lemons                | 0805.50     | AGR        | SA major exporter               | Protocols                          |
| Table grapes          | 0806.10     | AGR        | SA major exporter               | Window and market                  |
| Apples                | 0808.10     | AGR        | SA major exporter               | Cold-chain; Asian protocols        |
| Pears                 | 0808.30     | AGR        | SA exporter                     | Protocols                          |
| Avocados              | 0804.40     | AGR        | SA exporter                     | Ripening/sea-freight protocols     |
| Wine (bottled)        | 2204.21     | AGR        | SA major exporter (Wines of SA) | Excise; Labelling; Bulk vs bottled |
| Cut flowers (roses)   | 0603.11     | AGR        | Minor SA; Kenya/Ethiopia majors | Air freight capacity               |
| Potatoes              | 0701.90     | AGR        | SA producer                     | Seed certification                 |
| Onions                | 0703.10     | AGR        | SA producer                     | Storage                            |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-HF-O01** Pack-houses; **TRD-HF-O02**
Cold stores; **TRD-HF-O03** Reefer depots; **TRD-HF-O04** Processing
(juice, dried, frozen); **TRD-HF-O05** Consolidation hubs at
ports/airports; **TRD-HF-O06** Cold-chain trucking; **TRD-HF-O07**
Market-access protocol facilitation

## G5. Nuts

| **Commodity**        | **HS 2022** | **Sector** | **SA model anchor**                     | **Commodity-specific must-find**     |
|----------------------|-------------|------------|-----------------------------------------|--------------------------------------|
| Macadamia (in shell) | 0802.61     | AGR        | SA leading global producer              | Kernel recovery; China market access |
| Macadamia (shelled)  | 0802.62     | AGR        | SA exporter                             | Style grading                        |
| Pecans (in shell)    | 0802.90     | AGR        | SA exporter                             | China market                         |
| Cashew (in shell)    | 0801.31     | AGR        | Not SA; Tanzania/Mozambique/West Africa | KOR (out-turn); Export levy          |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-N-O01** Cracking/processing plants;
**TRD-N-O02** Drying facilities; **TRD-N-O03** Kernel grading;
**TRD-N-O04** Consumer brands

## G6. Livestock & meat

| **Commodity**              | **HS 2022** | **Sector** | **SA model anchor**               | **Commodity-specific must-find**                |
|----------------------------|-------------|------------|-----------------------------------|-------------------------------------------------|
| Beef (frozen boneless)     | 0202.30     | BLU        | SA exporter subject to FMD status | Export establishment approval; Halal            |
| Live cattle                | 0102.29     | BLU        | SA                                | Movement permits                                |
| Mutton/lamb                | 0204.42     | BLU        | SA                                | Karoo GI                                        |
| Wool (greasy)              | 5101.11     | BLU        | SA major exporter                 | Micron grade; Auction (Port Elizabeth/Gqeberha) |
| Mohair                     | 5102.19     | BLU        | SA global leader                  | Auction                                         |
| Hides and skins            | 4101.50     | BLU        | SA                                | Grading                                         |
| Poultry meat (frozen cuts) | 0207.14     | BLU        | SA importer; anti-dumping duties  | AI status; Duties                               |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-LM-O01** Export abattoirs;
**TRD-LM-O02** Feedlots; **TRD-LM-O03** Quarantine stations;
**TRD-LM-O04** Cold chain; **TRD-LM-O05** Tanneries; **TRD-LM-O06**
Rendering plants

## G7. Fish & seafood

| **Commodity**         | **HS 2022** | **Sector** | **SA model anchor**           | **Commodity-specific must-find** |
|-----------------------|-------------|------------|-------------------------------|----------------------------------|
| Hake (frozen fillets) | 0304.74     | BLU        | SA MSC-certified fishery      | MSC certification                |
| Abalone               | 0307.82     | BLU        | SA aquaculture/export permits | CITES/permits                    |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-FS-O01** Cold stores at landing sites;
**TRD-FS-O02** Processing plants; **TRD-FS-O03** Feed mills;
**TRD-FS-O04** Hatcheries

## G8. Forest products

| **Commodity**            | **HS 2022** | **Sector** | **SA model anchor** | **Commodity-specific must-find** |
|--------------------------|-------------|------------|---------------------|----------------------------------|
| Sawn timber (coniferous) | 4407.11     | FOR        | SA producer         | Grade stamping                   |
| Wood chips               | 4401.22     | FOR        | SA exporter         | Fibre quality                    |
| Dissolving pulp          | 4702.00     | FOR        | SA exporter         | Specs                            |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-FP-O01** Sawmills/engineered wood;
**TRD-FP-O02** Treatment plants; **TRD-FP-O03** Pellet/biomass;
**TRD-FP-O04** Chain-of-custody certification

## G9. Energy commodities

| **Commodity**              | **HS 2022** | **Sector** | **SA model anchor**              | **Commodity-specific must-find** |
|----------------------------|-------------|------------|----------------------------------|----------------------------------|
| Crude oil                  | 2709.00     | OGS        | SA importer                      | Assay; Freight                   |
| Diesel/petrol (light oils) | 2710.12     | OGS        | SA importer                      | Basic Fuel Price; Specs (50ppm)  |
| LNG                        | 2711.11     | OGS        | SA prospective importer          | Regas capacity                   |
| LPG (propane)              | 2711.12     | OGS        | SA importer                      | Cylinder regulations             |
| Thermal coal (bituminous)  | 2701.12     | MIN        | SA major exporter (Richards Bay) | CV/ash/sulphur; RBCT allocation  |
| Electricity (cross-border) | 2716.00     | ENR        | SAPP trading                     | Pool price; Wheeling             |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-EC-O01** Storage terminals;
**TRD-EC-O02** Blending; **TRD-EC-O03** Distribution; **TRD-EC-O04** LPG
filling; **TRD-EC-O05** Testing/quality labs

## G10. Metals & ores

| **Commodity**                | **HS 2022** | **Sector** | **SA model anchor**                              | **Commodity-specific must-find**       |
|------------------------------|-------------|------------|--------------------------------------------------|----------------------------------------|
| Iron ore (non-agglomerated)  | 2601.11     | MIN        | SA exporter (Saldanha line)                      | Fe %; Rail allocation                  |
| Manganese ore                | 2602.00     | MIN        | SA world’s largest reserves                      | Mn %; Port capacity                    |
| Chromium ore                 | 2610.00     | MIN        | SA major producer                                | Cr2O3 %; Export levy debate \[VERIFY\] |
| Ferrochrome (high-carbon)    | 7202.41     | MIN        | SA producer                                      | Power tariff                           |
| Copper ores and concentrates | 2603.00     | MIN        | DRC/Zambia majors; SA transit/smelting           | Cu %; Transit corridors                |
| Refined copper cathodes      | 7403.11     | MIN        | DRC/Zambia exports via SA/Namibia/Tanzania ports | LME grade A                            |
| Aluminium (unwrought)        | 7601.10     | MFG        | SA smelter                                       | Power contract                         |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-MO-O01** Concentrators; **TRD-MO-O02**
Smelters/refineries; **TRD-MO-O03** Bulk terminals; **TRD-MO-O04** Rail
wagon leasing; **TRD-MO-O05** Assay labs; **TRD-MO-O06** Tailings
retreatment

## G11. Critical minerals

| **Commodity**                   | **HS 2022** | **Sector** | **SA model anchor**                                 | **Commodity-specific must-find**       |
|---------------------------------|-------------|------------|-----------------------------------------------------|----------------------------------------|
| Lithium (spodumene concentrate) | 2530.90     | MIN        | Zimbabwe/Namibia majors \[VERIFY HS for spodumene\] | Li2O %; Export restrictions on raw ore |
| Lithium carbonate               | 2836.91     | MIN        | Processing opportunity                              | Battery grade                          |
| Natural graphite                | 2504.10     | MIN        | Mozambique/Tanzania/Madagascar                      | Flake size, C %                        |
| Cobalt (mattes/intermediates)   | 8105.20     | MIN        | DRC major                                           | Due diligence                          |
| Vanadium pentoxide              | 2825.30     | MIN        | SA producer                                         | Purity                                 |
| Rare-earth compounds            | 2846.90     | MIN        | SA/Malawi/Tanzania projects                         | Separation route                       |
| Platinum (unwrought/powder)     | 7110.11     | MIN        | SA world’s largest producer                         | LPPM good delivery                     |
| Palladium (unwrought)           | 7110.21     | MIN        | SA major producer                                   | LPPM                                   |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-CM-O01** Beneficiation plants;
**TRD-CM-O02** Precursor chemicals; **TRD-CM-O03** Traceability;
**TRD-CM-O04** Bulk export terminals

## G12. Gems & precious

| **Commodity**                       | **HS 2022** | **Sector** | **SA model anchor**        | **Commodity-specific must-find**            |
|-------------------------------------|-------------|------------|----------------------------|---------------------------------------------|
| Gold (non-monetary, unwrought)      | 7108.12     | MIN        | SA producer; Rand Refinery | LBMA good delivery; Export permits (SADPMR) |
| Diamonds (non-industrial, unworked) | 7102.31     | MIN        | SA/Botswana/Namibia/Angola | Kimberley Process; State diamond trader     |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-GP-O01** Cutting/polishing;
**TRD-GP-O02** Refining; **TRD-GP-O03** Vaulting and logistics;
**TRD-GP-O04** Certification labs

## G13. Industrial minerals & materials

| **Commodity**            | **HS 2022** | **Sector** | **SA model anchor**               | **Commodity-specific must-find** |
|--------------------------|-------------|------------|-----------------------------------|----------------------------------|
| Portland cement          | 2523.29     | MFG        | SA producer; anti-dumping history | SANS 50197 compliance            |
| Clinker                  | 2523.10     | MFG        | Import/export                     | Specs                            |
| Phosphate rock           | 2510.10     | MIN        | SA producer (Phalaborwa)          | P2O5 %                           |
| Titanium ores (ilmenite) | 2614.00     | MIN        | SA producer                       | TiO2 %                           |
| Zircon                   | 2615.10     | MIN        | SA producer                       | ZrO2 %                           |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-IMM-O01** Quarries; **TRD-IMM-O02**
Grinding/bagging; **TRD-IMM-O03** Bulk transport; **TRD-IMM-O04**
Blended products

## G14. Inputs

| **Commodity**                | **HS 2022** | **Sector** | **SA model anchor**       | **Commodity-specific must-find** |
|------------------------------|-------------|------------|---------------------------|----------------------------------|
| Urea                         | 3102.10     | AGR        | SA importer               | N %; Import parity               |
| DAP (diammonium phosphate)   | 3105.30     | AGR        | SA importer/producer      | Grade                            |
| Agrochemicals (insecticides) | 3808.91     | AGR        | Registration under Act 36 | Product registration             |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-I-O01** Blending plants; **TRD-I-O02**
Bulk import terminals; **TRD-I-O03** Retail dealer networks;
**TRD-I-O04** Soil testing

## G15. Manufactured goods

| **Commodity**                 | **HS 2022** | **Sector** | **SA model anchor**                | **Commodity-specific must-find** |
|-------------------------------|-------------|------------|------------------------------------|----------------------------------|
| Passenger vehicles            | 8703.23     | MFG        | SA exporter (APDP)                 | Homologation; RoO                |
| Pharmaceuticals (dosage form) | 3004.90     | HLT        | SAHPRA                             | Registration; Price regulation   |
| Apparel (cotton T-shirts)     | 6109.10     | MFG        | SA/Lesotho/Eswatini/Kenya/Ethiopia | Fabric RoO; AGOA \[VERIFY\]      |
| Steel (flat-rolled, coated)   | 7210.49     | MFG        | SA producer                        | Safeguards/anti-dumping          |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-MG-O01** Component localisation;
**TRD-MG-O02** Bonded warehouses; **TRD-MG-O03** Regional distribution
centres

## G16. Services & environmental

| **Commodity**                  | **HS 2022**     | **Sector** | **SA model anchor**                  | **Commodity-specific must-find**   |
|--------------------------------|-----------------|------------|--------------------------------------|------------------------------------|
| Carbon credits                 | n/a (not goods) | GRN        | Carbon Tax offsets; voluntary market | Registry; Corresponding adjustment |
| Logistics and freight services | n/a (services)  | TRN        | Services schedules                   | Licensing of foreign providers     |
| Tourism services               | n/a (services)  | TOU        | Visa regime                          | Air access                         |

**Value-chain gap opportunities (template, instantiate per producing
country and commodity):** **TRD-SE-O01** Registries/MRV; **TRD-SE-O02**
Service hubs; **TRD-SE-O03** Trade facilitation services \# PART I —
Opportunity Seeding, Controls and Acceptance (P26–P30)

## I1. How opportunities enter each country’s and each sector’s Opportunities list

| **Rule**         | **Requirement**                                                                                                                                                                                 |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Template first   | Every gap opportunity (PP-, RD-, {SECTOR}-Axx-Oyy, TRD-…) exists once as a template in the Opportunity Register                                                                                 |
| Evidence trigger | A template becomes a live country record only when its trigger is evidenced (e.g. storage deficit, vendor price discount, damaged bridge, gravel backlog) by sourced data or field verification |
| Placement        | Live records are pinned at the node where the gap sits (district, corridor node, segment, site) with precision class                                                                            |
| Dual listing     | Each live record appears in the country Opportunities list **and** the sector Opportunities list, with filters by asset type and value-chain node                                               |
| Sizing           | Size bands are \[PROPOSED\] until a Premium Report or owner data supplies a figure                                                                                                              |
| Status           | Template → Evidenced → Verified → Investor-ready (concept/PFS available) → In transaction → Closed                                                                                              |
| Linkage          | Each opportunity links to the projects, funders and investors it matches (matching engine ES-08)                                                                                                |

## I2. Counts delivered in Issue 2.0

| **Item**                                                | **Count**                                                                      |
|---------------------------------------------------------|--------------------------------------------------------------------------------|
| Sectors                                                 | 18                                                                             |
| Investable asset types with deep sheets                 | 97                                                                             |
| Traded commodities with HS codes                        | 85 (plus services and carbon)                                                  |
| Investor chain questions                                | 45 (applied to every asset → 4,600 register rows incl. asset-specific)         |
| Trader chain questions                                  | 40 (applied to every commodity → 3,523 register rows incl. commodity-specific) |
| Opportunity records (templates and commodity instances) | 744                                                                            |
| Asset-specific map layers                               | 174 (plus universal spine layers from Issue 1.0)                               |
| Replication roles                                       | 30                                                                             |
| Countries in activation list                            | 54                                                                             |

## I3. Controls carried forward

Issue 1.0 controls apply unchanged:

- **Coordinates:** WGS 84, with precision classes P1–P4.
- **Security:** classes S0–S3, including the critical-infrastructure
  rule.
- **Display:** freshness badges and A/B/C grade chips.
- **Conflicts:** shown, never averaged.
- **Owner submissions:** marked “Unverified”.

Issue 2.0 adds:

- Every \[SOURCED\] value carries its URL and date in
  `Sources_WorkedExamples`. These values are re-verified by the Data
  Bank before production, because news reporting and secondary
  aggregators (e.g. Tridge, Selina Wamucii) are grade B or C.
- Conflicting official figures, such as Malawi’s 2022 pigeon-pea export
  volume, are displayed as conflicts.

## I4. Acceptance checklist

| **\#** | **Test**                                                                                                                      | **Result**                                                                |
|--------|-------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| B1     | South Africa defined as model; role-based replication to 54 countries                                                         | Pass — Part A, Annex 3, Annex 4                                           |
| B2     | Trader example answers all user items (i)–(xv) with real data where public                                                    | Pass — Part C (items needing confirmation marked \[VERIFY\])              |
| B3     | Value-chain gaps converted to opportunities and seeded per country and sector                                                 | Pass — C4, D7, Part F/G, register                                         |
| B4     | Road example shows network, paved/gravel/earth with km by level, projects, tolls, cost per km, terrain, bridges, extra layers | Pass — Part D (district/city/town km computed from segment data at build) |
| B5     | Feasibility-grade premium report standard                                                                                     | Pass — Part E, C6, D8                                                     |
| B6     | Same depth applied to every asset in 18 sectors and every commodity                                                           | Pass — Part F, Part G, Excel registers                                    |
| B7     | No invented values                                                                                                            | Pass — sourced, computed, proposed or verify markers used                 |

## I5. Open decisions

| **\#** | **Decision**                                                                                       | **Recommendation**                                      |
|--------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| OD2-01 | Adopt South Africa as the frozen model pack (Wave 0)                                               | Adopt                                                   |
| OD2-02 | Adopt surface classes S1–S5 for all 54 countries                                                   | Adopt                                                   |
| OD2-03 | Adopt the report family L1–L4 and its pricing hooks into the Transaction Blueprint                 | Adopt                                                   |
| OD2-04 | Field-verify Malawi pigeon-pea trading centres and warehouses (geocoding)                          | Commission with the NIIP workbook data                  |
| OD2-05 | Licence road segment data (SANRAL/provincial RAMS; RA Malawi) for km roll-ups below province level | Approach agencies                                       |
| OD2-06 | Confirm 18-sector register against the live platform                                               | As Issue 1.0 OD-01                                      |
| OD2-07 | Re-supply the Malawi NIIP workbook                                                                 | Required to seed Malawi opportunities beyond this issue |

*End of Issue 2.0.* \# ANNEX 1 — Investor Chain IQ01–IQ45 (applies to
every asset type)

| **Code** | **Question**                                            | **Information types**                                                 | **Tag**   | **Map behaviour**                                     | **South African model anchor**                                                     |
|----------|---------------------------------------------------------|-----------------------------------------------------------------------|-----------|-------------------------------------------------------|------------------------------------------------------------------------------------|
| IQ01     | How big is the sector and is it growing?                | Sector GDP/value added, output volumes, 5-yr CAGR, forecasts          | MAP+BRIEF | Country/province choropleth of sector output          | Stats SA GDP by industry; SARB Quarterly Bulletin; sector bodies                   |
| IQ02     | Where is the demand–supply gap?                         | Demand, installed capacity, imports, shortage indicators              | MAP+BRIEF | Gap heat by province/district; import-dependence chip | Stats SA; SARS trade data; sector regulators                                       |
| IQ03     | Which sub-sector/technology/asset type?                 | Asset-type options, technology maturity, scale bands                  | BRIEF     | Asset-type filter loads its layer stack               | AIIM sector register (this document)                                               |
| IQ04     | What projects already exist (government or private)?    | Project register: owner type, status, capacity, sponsor, funders      | MAP       | Project pins by ownership colour; time slider         | Infrastructure South Africa (ISA) pipeline; IPP Office; SIPs; company disclosures  |
| IQ05     | What opportunities exist, how big and where?            | Opportunity register: form, capacity/size, stage, location, ask       | MAP       | Gold diamonds with size label; district clusters      | InvestSA One-Stop Shop; dtic; provincial investment agencies; owners               |
| IQ06     | Exactly where (province, district, municipality, town)? | ADM1–ADM3 codes, main place, ward                                     | MAP       | Breadcrumb drill-down; boundary illumination          | Stats SA/MDB boundaries (Municipal Demarcation Board)                              |
| IQ07     | Exact coordinates and site extent                       | Pin lat/lon, precision class, site polygon, SG diagram                | MAP       | Fly-to pin; site polygon; pegs                        | Chief Surveyor-General (CSG) cadastre; owner survey                                |
| IQ08     | Who owns the land and on what title?                    | Title deed, tenure, encumbrances, servitudes, land claims             | MAP+BRIEF | Tenure hatch; claim flag                              | Deeds Office (DeedsWeb); Commission on Restitution of Land Rights                  |
| IQ09     | Is the use permitted (zoning)?                          | Zoning scheme, SDF designation, rezoning need                         | MAP       | Municipal zoning overlay                              | Municipal SDFs/land-use schemes under SPLUMA                                       |
| IQ10     | How do I get there? Road access                         | Nearest paved road, class, distance, condition, bridges               | MAP       | Access route drawn; condition colour                  | SANRAL; provincial RAMS; municipal RAMS                                            |
| IQ11     | Power: where do I connect?                              | Nearest substation by voltage, spare capacity, connection lead time   | MAP+BRIEF | Connection Finder line to substation                  | Eskom/NTCSA Generation Connection Capacity Assessment; municipal utilities         |
| IQ12     | Water: is there water and may I use it?                 | Source, yield, quality, licence status, bulk supply                   | MAP+BRIEF | Water sources, bulk mains, catchment stress           | Dept of Water and Sanitation (WARMS, WULA); water boards                           |
| IQ13     | Telecoms and fibre                                      | Coverage, nearest fibre PoP                                           | MAP       | Coverage raster; fibre route generalised              | ICASA; operators’ coverage maps                                                    |
| IQ14     | Rail and port access                                    | Nearest siding/terminal/port, capacity, tariffs                       | MAP+BRIEF | Rail and port nodes with distance/time                | Transnet (TFR, TNPA, TPT) tariff books and port statistics                         |
| IQ15     | Terrain, topography and natural hazards                 | Slope, elevation, flood lines, seismicity, sinkholes, fire            | MAP       | Hazard overlays; elevation profile                    | SANSA/NGI elevation; Council for Geoscience; SAWS; municipal flood lines           |
| IQ16     | Environmental sensitivity                               | Sensitivity themes by site, required specialist studies               | MAP+BRIEF | Site sensitivity report on click                      | DFFE National Web-based Environmental Screening Tool                               |
| IQ17     | Protected and conservation areas                        | Protected areas, CBAs, wetlands, heritage                             | MAP       | Exclusion polygons                                    | DFFE SAPAD/SACAD; provincial CBA maps; SAHRA SAHRIS                                |
| IQ18     | Communities and social licence                          | Settlements, traditional councils, land claims, resettlement exposure | MAP+BRIEF | Settlement layer; traditional council boundaries      | Stats SA census; traditional council boundaries; DLRRD                             |
| IQ19     | Labour and skills                                       | Labour force, unemployment, skills, wages by province                 | MAP+BRIEF | Labour catchment isochrone                            | Stats SA QLFS; SETAs                                                               |
| IQ20     | Which laws and licences apply?                          | Sector acts, licence types, issuing agency                            | BRIEF     | Agency pins                                           | Gazette; sector regulators                                                         |
| IQ21     | How long and what will permits cost?                    | Step sequence, statutory timelines, fees, documents                   | BRIEF     | Pathway Gantt beside map                              | InvestSA OSS; regulators                                                           |
| IQ22     | What incentives apply?                                  | Tax incentives, grants, SEZ benefits, eligibility                     | MAP+BRIEF | Incentive chip on site; SEZ polygons                  | dtic incentives (e.g. s12I, SEZ regime), SARS                                      |
| IQ23     | Tax regime                                              | CIT, VAT, WHT, royalties, customs duties                              | BRIEF     | —                                                     | SARS; National Treasury                                                            |
| IQ24     | Ownership/empowerment conditions                        | B-BBEE codes, sector charters, local content                          | BRIEF     | —                                                     | B-BBEE Commission; dtic; sector charters                                           |
| IQ25     | Can I move money in and out?                            | Exchange control, loop structures, dividend repatriation              | BRIEF     | —                                                     | SARB Financial Surveillance (Currency and Exchanges Manual for Authorised Dealers) |
| IQ26     | How is my investment protected?                         | Domestic investment law, BITs/DTAs, dispute forum                     | BRIEF     | Treaty lines between countries                        | Protection of Investment Act 2015; SARS DTA list                                   |
| IQ27     | Who buys the output (offtakers)?                        | Offtaker identity, credit, contract terms                             | MAP+BRIEF | Offtaker pins and service areas                       | Utilities, SOEs, retailers, exporters                                              |
| IQ28     | What price/tariff will I receive?                       | Regulated tariffs, market prices, history                             | MAP+BRIEF | Price chips at nodes                                  | NERSA, Ports Regulator, JSE, sector boards                                         |
| IQ29     | What will it cost to build and run?                     | Capex/opex benchmarks, unit rates, inflation                          | BRIEF     | —                                                     | Construction cost indices; CIDB; precedent projects                                |
| IQ30     | What investment model fits?                             | PPP/IPP/JV/concession/greenfield/acquisition options                  | BRIEF     | Model chip on pin                                     | National Treasury PPP Unit (Reg. 16); GTAC                                         |
| IQ31     | Who will finance it?                                    | DFIs, banks, guarantees, grants, blended windows                      | MAP+BRIEF | Funder footprint layer                                | DBSA, IDC, Land Bank, PIC, commercial banks, DFIs                                  |
| IQ32     | What did comparable deals look like?                    | Precedent deals, valuations, terms                                    | BRIEF     | Comparable project pins highlight                     | Deal databases; IPP Office results                                                 |
| IQ33     | What are the risks?                                     | Country, sector, site, counterparty risk register                     | MAP+BRIEF | Risk overlays + triangles                             | AIIM Risk tab                                                                      |
| IQ34     | Physical climate risk over asset life                   | Heat, drought, flood, wind projections                                | MAP+BRIEF | Climate projection rasters                            | SAWS; CSIR Green Book                                                              |
| IQ35     | ESG and lender standards                                | IFC PS gaps, E&S permits, grievance                                   | BRIEF     | —                                                     | DFFE; lender standards                                                             |
| IQ36     | Which studies exist (concept, PFS, FS, EIA)?            | Document inventory and quality                                        | MAP+BRIEF | Document icons on pin                                 | Owners; DFFE EIA register                                                          |
| IQ37     | Who is the counterparty and are they clean?             | KYC, beneficial ownership, sanctions, litigation                      | BRIEF     | —                                                     | CIPC; court records; sanctions lists                                               |
| IQ38     | Local partners, contractors, suppliers                  | Contractors (grading), suppliers, consultants nearby                  | MAP+BRIEF | Supplier pins                                         | CIDB register; industry associations                                               |
| IQ39     | Government counterparts and contacts                    | Agencies, OSS, municipal officials                                    | MAP       | Party pins                                            | InvestSA; provincial agencies                                                      |
| IQ40     | How long to first revenue?                              | Development/construction timeline, critical path                      | BRIEF     | Timeline overlay                                      | Precedents                                                                         |
| IQ41     | How do I exit?                                          | Listing, trade sale, refinancing markets                              | BRIEF     | —                                                     | JSE; private markets data                                                          |
| IQ42     | Can I insure it?                                        | Political risk, asset, credit insurance availability                  | BRIEF     | —                                                     | SASRIA; ECIC; MIGA; ATI                                                            |
| IQ43     | Is the site secure?                                     | Crime and security incidents, private security cost                   | MAP       | Incident heat                                         | SAPS crime statistics                                                              |
| IQ44     | How reliable is this information?                       | Source, grade, date, conflicts                                        | MAP       | Freshness badge; grade chip                           | AIIM Sources and Evidence                                                          |
| IQ45     | What do I do next?                                      | Advisor, site visit, NDA/data room, EOI                               | BRIEF     | CTA on pin                                            | AIIM embedded services                                                             |

# ANNEX 2 — Trader Chain TQ01–TQ40 (applies to every commodity)

| **Code** | **Question**                                      | **Information types**                                               | **Tag**   | **Map behaviour**                                     | **South African model anchor**                                                              |
|----------|---------------------------------------------------|---------------------------------------------------------------------|-----------|-------------------------------------------------------|---------------------------------------------------------------------------------------------|
| TQ01     | What exactly is the product (HS code and grades)? | HS 6-digit, national 8-digit tariff line, grade standards           | BRIEF     | Product search highlights producing areas             | SARS Tariff Book (Schedule 1); Agricultural Product Standards Act regulations               |
| TQ02     | How much is available? (actual quantities)        | Production by season, stocks, marketed surplus, exports to date     | MAP+BRIEF | Production bubbles by district with tonnes and season | SAGIS; Crop Estimates Committee (CEC); Stats SA                                             |
| TQ03     | Which province/district/town produces it?         | Production by ADM2/ADM3 and main places                             | MAP       | District heat; town pins                              | CEC; Dept of Agriculture; provincial departments                                            |
| TQ04     | Where exactly can I collect it?                   | Aggregation points, silos, warehouses, depots with coordinates      | MAP       | Enabler pins with capacity                            | Silo owners; SAGIS registered storage                                                       |
| TQ05     | Local (farm-gate) price                           | Price by market and date                                            | MAP       | Price chip on market pins                             | NAMC price reports; fresh produce market data                                               |
| TQ06     | Agent/trader/wholesale price                      | Buying-agent price, wholesale, delivered price                      | MAP+BRIEF | Second price chip; spread shown                       | Fresh produce markets (e.g. Joburg Market); broker quotes                                   |
| TQ07     | Exchange or auction price and availability        | Exchange contract, last trade, open interest, auction calendar      | MAP+BRIEF | Exchange/auction pins with calendar                   | JSE Commodity Derivatives (SAFEX)                                                           |
| TQ08     | National commodity trading or regulatory entity   | Marketing board, exchange, strategic reserve, statutory levy body   | MAP+BRIEF | Party pins                                            | NAMC; statutory measures/levy administrators; JSE                                           |
| TQ09     | Seasonality and harvest calendar                  | Planting/harvest/marketing months                                   | MAP       | Season slider                                         | CEC; Dept of Agriculture                                                                    |
| TQ10     | Quality, grading and testing                      | Grade standards, labs, mycotoxin/MRL testing points                 | MAP+BRIEF | Lab pins                                              | Agricultural Product Standards Act; PPECB; accredited labs (SANAS)                          |
| TQ11     | Storage and warehouse receipts                    | Certified warehouses, capacity, receipt system, collateral managers | MAP+BRIEF | Warehouse pins coloured by certification              | Silo certificates; JSE-registered silos                                                     |
| TQ12     | Which corridor and route?                         | Road/rail routes to port or border, distance, time, cost            | MAP+BRIEF | Animated corridor; segment costs                      | Transnet; SANRAL; corridor bodies                                                           |
| TQ13     | Which port or border post?                        | Port terminal, border post, hours, clearance time                   | MAP       | Port/border hexagons                                  | TNPA; Border Management Authority (BMA)                                                     |
| TQ14     | Export taxes, levies and fees                     | Export duty, statutory levies, port dues                            | BRIEF     | —                                                     | SARS; NAMC statutory measures; Ports Regulator                                              |
| TQ15     | Destination tariffs and preferences               | MFN, preferential rates, quotas                                     | BRIEF     | Destination country fill by tariff                    | WTO tariff data; ITC Market Access Map; agreements (AfCFTA, SADC, SACU-EU EPA, AGOA status) |
| TQ16     | Rules of origin                                   | Origin criteria, certificate type                                   | BRIEF     | —                                                     | SARS origin unit; agreement texts                                                           |
| TQ17     | SPS/TBT and non-tariff measures                   | Phytosanitary protocols, MRLs, labelling                            | BRIEF     | Protocol status by destination                        | Dept of Agriculture Plant Health; destination NPPOs                                         |
| TQ18     | Export regulations                                | Controlled exports, quotas, bans, permits                           | BRIEF     | Restriction hatch                                     | ITAC (export control list); Dept of Agriculture                                             |
| TQ19     | Licences and permits                              | Exporter registration, export permit, PPECB/APSA certificate        | BRIEF     | Issuing office pins                                   | SARS customs registration; ITAC; PPECB; Dept of Agriculture                                 |
| TQ20     | Central bank forex rules                          | Export proceeds repatriation, CFC accounts, documentation           | BRIEF     | —                                                     | SARB Currency and Exchanges Manual for Authorised Dealers \[VERIFY current section\]        |
| TQ21     | Exchange rate and convertibility                  | Official rate, spread, hedging instruments                          | MAP+BRIEF | FX chip                                               | SARB; JSE currency derivatives                                                              |
| TQ22     | Trade finance options                             | Pre-shipment finance, LCs, receivables, export credit insurance     | BRIEF     | Bank/ECA pins                                         | Commercial banks; ECIC                                                                      |
| TQ23     | Who are the buyers?                               | Importers, processors, traders in destination                       | BRIEF     | Buyer country flows                                   | Trade directories; customs data                                                             |
| TQ24     | Who are the competing origins?                    | Competitor countries, their prices and seasons                      | MAP+BRIEF | Competing-origin flows                                | UN Comtrade; ITC Trade Map                                                                  |
| TQ25     | World benchmark price                             | International reference prices                                      | BRIEF     | —                                                     | World Bank commodity prices; exchanges                                                      |
| TQ26     | Logistics providers                               | Forwarders, hauliers, clearing agents, inspection firms             | MAP+BRIEF | Provider pins near nodes                              | Industry associations                                                                       |
| TQ27     | Documents required                                | Commercial, transport, SPS, origin, customs                         | BRIEF     | —                                                     | SARS; destination customs                                                                   |
| TQ28     | Customs procedure and time                        | Declaration, inspection, release time                               | BRIEF     | Clearance-time chip at border/port                    | SARS; BMA                                                                                   |
| TQ29     | Fumigation, packing and containerisation          | Service points, container depots                                    | MAP       | Service pins                                          | Port service providers                                                                      |
| TQ30     | Insurance                                         | Cargo, credit, political risk                                       | BRIEF     | —                                                     | Insurers; ECIC                                                                              |
| TQ31     | Contract standards and dispute resolution         | GAFTA/FOSFA/other forms, arbitration                                | BRIEF     | —                                                     | Trade associations                                                                          |
| TQ32     | Traceability and sustainability compliance        | Traceability, deforestation-free, child labour                      | BRIEF     | —                                                     | Destination regulations                                                                     |
| TQ33     | Sanctions and KYC                                 | Counterparty screening                                              | BRIEF     | —                                                     | Sanctions lists                                                                             |
| TQ34     | Landed cost / netback                             | Full cost stack origin to destination                               | BRIEF     | Cost chips along route                                | AIIM landed-cost calculator                                                                 |
| TQ35     | Risks on the trade                                | Price, policy, quality, logistics, counterparty, security           | MAP+BRIEF | Route risk triangles                                  | AIIM Risk tab                                                                               |
| TQ36     | Local consumption and alternative markets         | Domestic demand, processors, regional markets                       | MAP+BRIEF | Domestic demand bubbles                               | Stats SA; industry                                                                          |
| TQ37     | Value-chain gaps (opportunities)                  | Missing nodes: storage, processing, finance, testing                | MAP+BRIEF | Gap markers on value-chain map                        | AIIM opportunity register                                                                   |
| TQ38     | Public procurement and tenders for the product    | Government/humanitarian buying                                      | MAP+BRIEF | Tender pins                                           | eTender portal; WFP                                                                         |
| TQ39     | Producer organisations and contacts               | Cooperatives, associations, out-grower schemes                      | MAP       | Party pins                                            | Industry bodies                                                                             |
| TQ40     | How reliable is the data?                         | Source, grade, date                                                 | MAP       | Freshness/grade chips                                 | AIIM Sources and Evidence                                                                   |

# ANNEX 3 — Role-Based Replication Table (South Africa → generic → Malawi)

| **Role**                         | **South Africa (model)**                            | **Generic role for any country**              | **Malawi (first replication)**                                                                                     |
|----------------------------------|-----------------------------------------------------|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Statistics office                | Statistics South Africa (Stats SA)                  | National Statistical Office (NSO)             | Malawi: National Statistical Office (NSO)                                                                          |
| Boundary authority               | Municipal Demarcation Board / Stats SA              | Electoral/local government boundary authority | Malawi: Ministry of Local Government; NSO EA maps                                                                  |
| Cadastre / survey                | Chief Surveyor-General (CSG)                        | Surveyor-General / Lands Department           | Malawi: Department of Surveys                                                                                      |
| Deeds / land registry            | Deeds Registration Offices                          | Land/deeds registry                           | Malawi: Lands Registry (Ministry of Lands)                                                                         |
| Investment promotion / OSS       | InvestSA One Stop Shop (dtic)                       | Investment promotion agency                   | Malawi: Malawi Investment and Trade Centre (MITC)                                                                  |
| Central bank / forex             | South African Reserve Bank (FinSurv)                | Central bank exchange control                 | Malawi: Reserve Bank of Malawi                                                                                     |
| Revenue / customs                | South African Revenue Service (SARS)                | Revenue authority                             | Malawi: Malawi Revenue Authority (MRA)                                                                             |
| Trade licensing / export control | ITAC; dtic                                          | Ministry of Trade licensing unit              | Malawi: Ministry of Trade and Industry (Control of Goods Act)                                                      |
| Agriculture ministry             | Department of Agriculture                           | Ministry of Agriculture                       | Malawi: Ministry of Agriculture                                                                                    |
| Crop estimates                   | Crop Estimates Committee (CEC)                      | Agricultural statistics unit                  | Malawi: Ministry of Agriculture crop estimates (APES)                                                              |
| Market information               | NAMC; SAGIS                                         | Market information system                     | Malawi: Ministry of Agriculture MIS; AHCX market data                                                              |
| Commodity exchange               | JSE Commodity Derivatives (SAFEX)                   | National commodity exchange                   | Malawi: AHCX; ACE                                                                                                  |
| State trading / reserve          | (none — liberalised; strategic stock policy)        | Marketing board / strategic reserve           | Malawi: ADMARC; NFRA                                                                                               |
| SPS authority                    | Dept of Agriculture Plant Health / Animal Health    | NPPO / veterinary services                    | Malawi: Department of Agricultural Research Services (plant protection)                                            |
| Standards body                   | SABS; NRCS; PPECB                                   | National bureau of standards                  | Malawi: Malawi Bureau of Standards (MBS)                                                                           |
| National roads agency            | SANRAL                                              | National roads authority                      | Malawi: Roads Authority (RA)                                                                                       |
| Road fund / tolling              | SANRAL toll (national); provincial road departments | Road fund                                     | Malawi: Roads Fund Administration (RFA)                                                                            |
| Rail/port operator               | Transnet (TFR, TNPA, TPT)                           | Rail/port authority                           | Malawi: Central East African Railways; ports via Nacala (Mozambique), Beira (Mozambique), Dar es Salaam (Tanzania) |
| Power utility / transmission     | Eskom; NTCSA                                        | National utility / TSO                        | Malawi: ESCOM; EGENCO                                                                                              |
| Energy regulator                 | NERSA                                               | Energy regulator                              | Malawi: MERA                                                                                                       |
| Water regulator                  | Dept of Water and Sanitation                        | Water ministry / boards                       | Malawi: National Water Resources Authority                                                                         |
| Environmental authority          | DFFE (Screening Tool, EIA)                          | Environment agency                            | Malawi: Malawi Environment Protection Authority (MEPA)                                                             |
| Mining cadastre                  | DMRE / DMPR SAMRAD                                  | Mining cadastre                               | Malawi: Mining and Minerals Regulatory Authority (MMRA)                                                            |
| PPP unit                         | National Treasury PPP Unit                          | PPP unit                                      | Malawi: PPP Commission                                                                                             |
| Procurement portal               | National eTender portal                             | Public procurement portal                     | Malawi: PPDA / MANEPS                                                                                              |
| Development finance              | DBSA; IDC; Land Bank                                | National DFIs                                 | Malawi: NEEF; Export Development Fund (EDF)                                                                        |
| Company registry                 | CIPC                                                | Company registry                              | Malawi: Registrar General / Business Registration                                                                  |
| Communications regulator         | ICASA                                               | ICT regulator                                 | Malawi: MACRA                                                                                                      |
| Health product regulator         | SAHPRA                                              | Medicines authority                           | Malawi: PMRA                                                                                                       |
| Competition authority            | Competition Commission                              | Competition authority                         | Malawi: CFTC                                                                                                       |

# ANNEX 4 — 54-Country Activation List

Wave 0 = South Africa model; Wave 1 = Malawi replication test plus SADC
neighbours; later waves by AU region \[PROPOSED\]. The TBCA 5-region map
in the Data Bank governs where it differs from the AU regions shown.

| **ISO3** | **Country**              | **AU region** | **Wave \[PROPOSED\]** |
|----------|--------------------------|---------------|-----------------------|
| DZA      | Algeria                  | North         | 4                     |
| EGY      | Egypt                    | North         | 4                     |
| LBY      | Libya                    | North         | 4                     |
| MRT      | Mauritania               | North         | 4                     |
| MAR      | Morocco                  | North         | 4                     |
| TUN      | Tunisia                  | North         | 4                     |
| BEN      | Benin                    | West          | 3                     |
| BFA      | Burkina Faso             | West          | 3                     |
| CPV      | Cabo Verde               | West          | 3                     |
| CIV      | Côte d’Ivoire            | West          | 3                     |
| GMB      | Gambia                   | West          | 3                     |
| GHA      | Ghana                    | West          | 3                     |
| GIN      | Guinea                   | West          | 3                     |
| GNB      | Guinea-Bissau            | West          | 3                     |
| LBR      | Liberia                  | West          | 3                     |
| MLI      | Mali                     | West          | 3                     |
| NER      | Niger                    | West          | 3                     |
| NGA      | Nigeria                  | West          | 3                     |
| SEN      | Senegal                  | West          | 3                     |
| SLE      | Sierra Leone             | West          | 3                     |
| TGO      | Togo                     | West          | 3                     |
| BDI      | Burundi                  | Central       | 5                     |
| CMR      | Cameroon                 | Central       | 5                     |
| CAF      | Central African Republic | Central       | 5                     |
| TCD      | Chad                     | Central       | 5                     |
| COG      | Congo                    | Central       | 5                     |
| COD      | DR Congo                 | Central       | 5                     |
| GNQ      | Equatorial Guinea        | Central       | 5                     |
| GAB      | Gabon                    | Central       | 5                     |
| STP      | São Tomé and Príncipe    | Central       | 5                     |
| COM      | Comoros                  | East          | 2                     |
| DJI      | Djibouti                 | East          | 2                     |
| ERI      | Eritrea                  | East          | 2                     |
| ETH      | Ethiopia                 | East          | 2                     |
| KEN      | Kenya                    | East          | 2                     |
| MDG      | Madagascar               | East          | 2                     |
| MUS      | Mauritius                | East          | 2                     |
| RWA      | Rwanda                   | East          | 2                     |
| SYC      | Seychelles               | East          | 2                     |
| SOM      | Somalia                  | East          | 2                     |
| SSD      | South Sudan              | East          | 2                     |
| SDN      | Sudan                    | East          | 2                     |
| TZA      | Tanzania                 | East          | 2                     |
| UGA      | Uganda                   | East          | 2                     |
| AGO      | Angola                   | Southern      | 1                     |
| BWA      | Botswana                 | Southern      | 1                     |
| SWZ      | Eswatini                 | Southern      | 1                     |
| LSO      | Lesotho                  | Southern      | 1                     |
| MWI      | Malawi                   | Southern      | 1 (replication test)  |
| MOZ      | Mozambique               | Southern      | 1                     |
| NAM      | Namibia                  | Southern      | 1                     |
| ZAF      | South Africa             | Southern      | 0 (model)             |
| ZMB      | Zambia                   | Southern      | 1                     |
| ZWE      | Zimbabwe                 | Southern      | 1                     |
