# Table of Contents

# Document Control

| **Item**       | **Entry**                                                                                                                                                                                                                 |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Document ID    | TBCA-AIIM-INFO-CAT-2.1 (Sector Worked Examples Volume)                                                                                                                                                                    |
| Relationship   | Supplements TBCA-AIIM-INFO-CAT-2.0. Issue 2.0 worked Agriculture (pigeon peas, trader) and Transport (roads, investor). This volume works the other **16 sectors**, each with one **investor** and one **trader** example |
| Model country  | South Africa. Each information type is also expressed as a replication *role* so the same screen works in all 54 countries                                                                                                |
| Issue date     | 09 October 2026                                                                                                                                                                                                           |
| Prepared by    | Opus 5.5 (Max) for The Business Clinic.Africa                                                                                                                                                                             |
| Companion file | `TBCA_AIIM_Deep_Registers_2.1.xlsx`: all Issue 2.0 sheets plus four new sheets (`WX_Facts`, `WX_Chains`, `WX_MapStack`, `WX_Opportunities`)                                                                               |

## Interpretation Control

The markers are as in Issue 2.0:

| **Marker**   | **Meaning**                                                               |
|--------------|---------------------------------------------------------------------------|
| \[SOURCED\]  | Value comes from a cited source (table *a*); re-verify before publication |
| \[COMPUTED\] | Derived from sourced values                                               |
| \[VERIFY\]   | Confirm at onboarding                                                     |
| \[PROPOSED\] | TBCA design choice                                                        |
| Conflict     | Sources disagree; both are shown                                          |

Each investor or trader example applies the full Investor Chain
IQ01–IQ45 and Trader Chain TQ01–TQ40 from Issue 2.0. The tables below
show the scenario-specific answers. Questions answered generically by
the universal spine (land, hazards, labour, tax, KYC and so on) are not
repeated.

## Structure of every sector section

| **Part** | **Content**                                                                                          |
|----------|------------------------------------------------------------------------------------------------------|
| \(a\)    | Scenario — investor and trader examples                                                              |
| \(b\)    | Sourced fact base (South Africa)                                                                     |
| \(c\)    | Investor chain answered, with information type, map behaviour, SA instance and replication role      |
| \(d\)    | Trader chain answered, the same way                                                                  |
| \(e\)    | Map stack — layers, levels, geometry and illumination                                                |
| \(f\)    | What the map shows at each of the six levels                                                         |
| \(g\)    | Additional information types proposed by Opus 5.5                                                    |
| \(h\)    | Value-chain gap opportunities, each with an ID that seeds the country and sector Opportunities lists |
| \(i\)    | Premium Report additions to the 18-chapter feasibility standard (Issue 2.0 Part E)                   |

# W1. Energy & Power (ENR)

**(a) Scenarios**

- **Investor: develop a 100–300 MW utility-scale solar PV (+ battery)
  IPP and sell power through a public bid window or a private wheeling
  PPA**
- **Trader: buy and sell electricity across borders through the Southern
  African Power Pool (SAPP) markets**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                                          | **Value**                                                                                                                                                                                                                                                                                                                             | **Source**                                                                                                                                                                     | **Date**   |
|--------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| ENR-F1 | REIPPPP Bid Window 7 preferred bidders            | 8 solar PV projects, 1,760 MW; tariffs 42–49 c/kWh (average 46 c/kWh); R31.4 bn investment; projects in Mpumalanga, Free State, North West and Limpopo; no wind awarded                                                                                                                                                               | [Green Building Africa](https://www.greenbuildingafrica.co.za/eight-solar-projects-awarded-preferred-bidder-status-in-reipppp-bw-7-no-wind-projects-awarded/)                  | 2024-12-23 |
| ENR-F2 | Transmission Development Plan 2025–2034           | ≈14,500 km new lines; 210 transformers (≈113,000 MVA); R112 bn over five years; integrates 56 GW new generation; 31 projects under construction (1,445 km, 16,900 MVA) enabling ≈16 GW by 2028                                                                                                                                        | [Green Building Africa (NTCSA TDP)](https://www.greenbuildingafrica.co.za/south-africas-immediate-transmission-build-to-accommodate-16-gw-of-new-generation-capacity-by-2028/) | 2025       |
| ENR-F3 | Grid capacity with curtailment (GCCA-2025 update) | Eastern + Western Cape hosting capacity raised from 5,625 MW to 7,205 MW at ≈4 % curtailment (NERSA approval for 1 Apr 2025–31 Mar 2028); Western Cape curtailment allocations by substation: Nuweveld/Galenia 720 MW, Droërivier 220 MW, Bacchus 140 MW, Agulhas 100 MW; Northern Cape constrained (Aurora no additional allocation) | [NTCSA GCCA-2025 Curtailment Update](https://www.ntcsa.co.za/wp-content/uploads/2025/11/27.1-GCCA_2025_Update_31102025_publish.pdf)                                            | 2025-10-31 |
| ENR-F4 | SAPP market activity (Nov 2025)                   | 118.7 GWh traded; Day-Ahead Market average 9.2 USc/kWh (peak 15.3, off-peak 6.8); 152.5 GWh matched but untraded because of transmission constraints, mainly Botswana–Zimbabwe and Zimbabwe–Zambia interconnectors                                                                                                                    | [SAPP Market Performance Report, Nov 2025](https://www.sapp.co.zw/sites/default/files/SAPP%20Market%20Performance%20Report%20-%20November%202025.pdf)                          | 2025-11    |
| ENR-F5 | Private wheeled solar for data centres            | Teraco developing a 120 MW solar PV plant to supply its data centres through wheeling                                                                                                                                                                                                                                                 | [Teraco](https://www.teraco.co.za/news/teraco-completes-ct2-data-centre-expansion/)                                                                                            | 2025-11-10 |

**(c) Investor chain answered**

| **\#** | **Question**                                     | **Information types**                                                                                | **Map behaviour**                                                                                           | **South African instance**                   | **Replication role**                          |
|--------|--------------------------------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|----------------------------------------------|-----------------------------------------------|
| 1      | Which technology and where is the resource best? | GHI raster, specific yield kWh/kWp by district; REDZ polygons                                        | Solar raster; REDZ outlines; click shows kWh/kWp                                                            | Solar Atlas + DFFE REDZ                      | Resource atlas; strategic environmental zones |
| 2      | Where can I connect?                             | Substations with available capacity by voltage; curtailment-allocated substations; constrained areas | Substations coloured green/amber/red by capacity; Northern Cape red; WC curtailment substations labelled MW | NTCSA GCCA (F3)                              | TSO connection-capacity study                 |
| 3      | What new lines are coming and when?              | TDP projects: route, voltage, year, status                                                           | Planned lines dashed by target year; time slider to COD                                                     | NTCSA TDP (F2)                               | Transmission master plan                      |
| 4      | Point of grid connection from my site            | Distance to nearest 132/400 kV substation, spare bays, line route                                    | Connection Finder draws site→substation line with km; alternatives ranked                                   | GCCA + site polygon                          | TSO + DSO data                                |
| 5      | Step-up and step-down                            | Site switchyard step-up (e.g. 33/132 kV), grid substation transformer ratio and MVA                  | Squares labelled with ratio and MVA; path to load centre illuminated                                        | NTCSA substation data (S2 generalised)       | TSO asset register                            |
| 6      | What price can I get?                            | Latest bid-window tariffs; private PPA ranges; wheeling charges                                      | Tariff chip on comparable projects                                                                          | BW7 42–49 c/kWh (F1)                         | IPP procurement results                       |
| 7      | Who buys?                                        | Public offtaker; private C&I offtakers (mines, data centres, manufacturers) with load                | C&I load bubbles; data-centre pins                                                                          | Eskom/NTCSA buyer; Teraco-type wheeling (F5) | Utility + large-load registry                 |
| 8      | Which projects already exist?                    | REIPPPP/private projects by bid window, MW, status                                                   | Project pins with bid-window label                                                                          | IPP Office                                   | IPP register                                  |
| 9      | Land and environment                             | Title, zoning, screening-tool sensitivity, protected areas, agricultural land class                  | Site query returns sensitivity themes                                                                       | DFFE Screening Tool; Deeds                   | Land + environment agencies                   |
| 10     | Licensing pathway                                | NERSA licence/registration, EA, water use, SANS grid compliance, wheeling agreement                  | Pathway Gantt                                                                                               | NERSA; DFFE; DWS                             | Regulator set                                 |
| 11     | Investment model                                 | Public bid (competitive) vs private wheeled PPA vs hybrid with storage                               | Model chip                                                                                                  | IPP Office; NERSA wheeling frameworks        | IPP/PPP unit                                  |
| 12     | Financing                                        | DFI/commercial debt terms, local content, BEE equity                                                 | Funder footprint                                                                                            | DBSA, IDC, banks                             | National DFIs                                 |

**(d) Trader chain answered**

| **\#** | **Question**               | **Information types**                                                                        | **Map behaviour**                                       | **South African instance**                  | **Replication role**   |
|--------|----------------------------|----------------------------------------------------------------------------------------------|---------------------------------------------------------|---------------------------------------------|------------------------|
| 1      | What is the product?       | Energy (MWh) by market: DAM, intraday, forward weekly/monthly; HS 2716.00 for customs        | Market card                                             | SAPP products (F4)                          | Regional power pool    |
| 2      | How much can be traded?    | Matched vs traded volumes; available transfer capacity                                       | Interconnector lines coloured by congestion             | 118.7 GWh traded vs 152.5 GWh untraded (F4) | Pool market reports    |
| 3      | Where are the constraints? | Congested interconnectors and outages                                                        | Red glow on Botswana–Zimbabwe and Zimbabwe–Zambia links | SAPP report (F4)                            | Pool/TSO outage data   |
| 4      | Prices                     | DAM average and time-of-day prices; history                                                  | Price chips at pool node                                | 9.2 USc/kWh DAM average (F4)                | Pool price data        |
| 5      | Who can trade?             | Pool membership categories, trading licence, credit collateral                               | Member pins by country                                  | NERSA trading licence \[VERIFY\]            | Pool rules + regulator |
| 6      | Wheeling cost              | Transmission use-of-system and wheeling charges through each country                         | Cost chips per border                                   | Utility tariff books                        | TSO tariffs            |
| 7      | Forex and settlement       | Settlement currency (USD), collateral, SARB rules                                            | Brief                                                   | SARB; SAPP settlement                       | Central bank + pool    |
| 8      | Risks                      | Interconnector outages, payment risk of counterparties, hydrology in hydro-dependent sellers | Risk triangles on lines                                 | SAPP outage notes                           | Pool + hydrology       |

**(e) Map stack**

| **Layer**                                               | **Levels** | **Geometry**            | **Illumination / behaviour**                 |
|---------------------------------------------------------|------------|-------------------------|----------------------------------------------|
| Solar GHI/DNI raster                                    | L0–L5      | Raster                  | Value at click                               |
| REDZ and strategic transmission corridors               | L0–L2      | Polygon                 | Glow on hover                                |
| Transmission lines by voltage and status (existing/TDP) | L0–L5      | Line                    | Voltage ramp; dashed planned; selection glow |
| Substations with available/curtailed capacity           | L1–L5      | Square (S2 generalised) | Green/amber/red; MW label                    |
| REIPPPP and private IPP projects                        | L0–L5      | Pin                     | Bid-window label; status colour              |
| C&I load centres (mines, data centres, smelters)        | L0–L4      | Bubble                  | Size by MW                                   |
| SAPP interconnectors and congestion                     | L0         | Line                    | Red pulse when congested                     |
| Opportunity diamonds ENR-W-Oxx                          | L2–L5      | Diamond                 | Gold glow                                    |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                                                                                                                                          |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Solar GHI/DNI raster; REDZ and strategic transmission corridors; Transmission lines by voltage and status (existing/TDP); REIPPPP and private IPP projects; C&I load centres (mines, data centres, smelters); SAPP interconnectors and congestion                                           |
| L1 Region/Province | Solar GHI/DNI raster; REDZ and strategic transmission corridors; Transmission lines by voltage and status (existing/TDP); Substations with available/curtailed capacity; REIPPPP and private IPP projects; C&I load centres (mines, data centres, smelters)                                 |
| L2 District        | Solar GHI/DNI raster; REDZ and strategic transmission corridors; Transmission lines by voltage and status (existing/TDP); Substations with available/curtailed capacity; REIPPPP and private IPP projects; C&I load centres (mines, data centres, smelters); Opportunity diamonds ENR-W-Oxx |
| L3 Municipality    | Solar GHI/DNI raster; Transmission lines by voltage and status (existing/TDP); Substations with available/curtailed capacity; REIPPPP and private IPP projects; C&I load centres (mines, data centres, smelters); Opportunity diamonds ENR-W-Oxx                                            |
| L4 City/Town       | Solar GHI/DNI raster; Transmission lines by voltage and status (existing/TDP); Substations with available/curtailed capacity; REIPPPP and private IPP projects; C&I load centres (mines, data centres, smelters); Opportunity diamonds ENR-W-Oxx                                            |
| L5 Site            | Solar GHI/DNI raster; Transmission lines by voltage and status (existing/TDP); Substations with available/curtailed capacity; REIPPPP and private IPP projects; Opportunity diamonds ENR-W-Oxx                                                                                              |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                                   | **Why it matters**    |
|--------------------------------------------------------|-----------------------|
| Curtailment probability by substation over time        | Revenue haircut       |
| Wheeling-ready municipalities                          | Private PPA routes    |
| Battery revenue-stacking signals (time-of-use spreads) | Hybrid sizing         |
| Module and inverter import duties and lead times       | Capex and timing      |
| Heavy-haul routes for transformers                     | Logistics             |
| Land lease rates per ha by district                    | Opex                  |
| Community trust/ED obligations                         | Bid scoring           |
| Grid code compliance test centres                      | Commissioning         |
| Pool members’ credit ratings                           | Trading risk          |
| Hydrology outlook in Zambia/Zimbabwe/Mozambique        | Regional price driver |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                          | **Evidence trigger**         | **Map placement**              | **Investment model**            |
|------------|----------------------------------------------------------|------------------------------|--------------------------------|---------------------------------|
| ENR-W-O01  | Utility-scale PV + BESS IPP in unconstrained substations | GCCA capacity available      | Substations with capacity      | IPP/private PPA                 |
| ENR-W-O02  | Private wheeled PPAs for data centres and mines          | Large-load demand (F5)       | Load centres                   | Wheeling PPA                    |
| ENR-W-O03  | Independent transmission projects (ITP) on TDP lines     | R112 bn TDP (F2)             | TDP corridors                  | Build-own-transfer/availability |
| ENR-W-O04  | Substation transformer EPC and supply                    | 210 transformers (F2)        | Substations                    | EPC/supply                      |
| ENR-W-O05  | Curtailment-tolerant wind in Western/Eastern Cape        | Curtailment allocations (F3) | WC/EC substations              | IPP                             |
| ENR-W-O06  | Grid-scale storage at congested nodes                    | Curtailment                  | Constrained substations        | BESS IPP                        |
| ENR-W-O07  | Interconnector upgrades on SAPP central corridor         | 152.5 GWh untraded (F4)      | Botswana–Zimbabwe–Zambia links | Regional PPP/DFI                |
| ENR-W-O08  | Licensed electricity trader/aggregator                   | SAPP and wheeling growth     | Gauteng/Cape Town              | Trading company                 |
| ENR-W-O09  | Embedded generation for municipalities                   | Municipal procurement        | Metros                         | PPA                             |
| ENR-W-O10  | Module/racking/cable localisation                        | BW7 volumes (F1)             | SEZs                           | Manufacturing                   |
| ENR-W-O11  | O&M and robotic cleaning services                        | Growing fleet                | Northern Cape/Free State       | Service                         |
| ENR-W-O12  | Transformer and high-voltage equipment repair centre     | Grid build-out               | Industrial hubs                | Workshop                        |
| ENR-W-O13  | Grid-connection advisory and studies                     | Connection queue             | National                       | Advisory                        |
| ENR-W-O14  | Renewable energy certificates and traceability platform  | Corporate buyers             | National                       | Platform                        |
| ENR-W-O15  | Hybrid solar for agriculture and irrigation              | Tariff increases             | Agricultural districts         | C&I PPA                         |
| ENR-W-O16  | Solar + storage for SADC exports via SAPP                | Pool prices (F4)             | Border substations             | Merchant/trading                |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**                                               |
|-------------------|---------------------------------------------------------------------------------------|
| Market and price  | Tariff outlook (bid windows, private PPAs, pool prices); demand forecast; curtailment |
| Grid connection   | Substation capacity; TDP timing; connection cost and self-build options               |
| Energy yield      | P50/P90; degradation; storage dispatch                                                |
| Financial model   | LCOE; project IRR/equity IRR; DSCR; curtailment and tariff sensitivities              |
| Regulation        | Licence, EA, wheeling agreements, local content and ED                                |
| Risk              | Grid delay; offtaker credit; FX on modules; community                                 |
| Exhibits          | GCCA map; tariff trend chart; yield histogram; LCOE waterfall; tornado; Gantt         |

# W2. Oil, Gas & Petroleum (OGS)

**(a) Scenarios**

- **Investor: take equity or supply services in an LNG import terminal
  and gas-to-power hub at Richards Bay**
- **Trader: import and wholesale refined fuels (diesel, petrol) into the
  South African inland market**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                              | **Value**                                                                                                                                                                                                                                                                                                                                           | **Source**                                                                                                                                                                                              | **Date**   |
|--------|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| OGS-F1 | ZET LNG import terminal, Richards Bay | Zululand Energy Terminal (Vopak Terminal Durban + Transnet Pipelines JV); Phase 1: floating storage ≥170,000 m³ and onshore regas ≈3 mtpa (≈400 MMscfd); Phase 2: onshore tank ≈220,000 m³, total ≈4.5 mtpa; FID targeted 2028; Phase 1 COD 2030; 25-year TNPA concession; ≈25 km pipeline to the Lilly pipeline                                    | [Engineering News](https://www.engineeringnews.co.za/article/zet-liquefied-natural-gas-lng-import-terminal-project-south-africa-2026-08-21)                                                             | 2026-08-21 |
| OGS-F2 | Eskom foundation customer             | Heads of agreement (5 Jun 2026) making Eskom a foundation customer to support its planned 3 GW Richards Bay gas-to-power programme; ExxonMobil affiliate signed HoA on supply interest (17 Jun 2026)                                                                                                                                                | [Engineering News; Mining Weekly](https://www.miningweekly.com/article/eskom-signs-agreement-with-zululand-energy-terminal-as-it-seeks-to-advance-3-gw-richards-bay-gas-fired-power-project-2026-06-05) | 2026-06    |
| OGS-F3 | Fuel import dependence                | About 60 % of supply met by imported refined products, ≈40 % processed domestically (Minister, Mar 2026); refined products averaged 12 % more expensive than crude (2014–2024); SARB estimates oil import bill could have been ≈R76 bn lower in 2021–2024 if refined products were ≤25 % of oil imports; ≈5,400 jobs displaced by refinery closures | [IOL / The Star citing SARB](https://iol.co.za/the-star/2026-09-28-refinery-closures-leave-south-africa-more-exposed-to-imported-fuel-shocks2/)                                                         | 2026-09-28 |
| OGS-F4 | Carbon fuel levy                      | Increases from 1 Apr 2026 to 19 c/l petrol and 23 c/l diesel                                                                                                                                                                                                                                                                                        | [Anthesis (Budget 2026)](https://www.anthesisgroup.com/za/insights/south-african-carbon-tax-update-2026/)                                                                                               | 2026       |

**(c) Investor chain answered**

| **\#** | **Question**                             | **Information types**                                                                            | **Map behaviour**                                             | **South African instance** | **Replication role**        |
|--------|------------------------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------|----------------------------|-----------------------------|
| 1      | Where is the terminal and its footprint? | Port precinct, berth, pipeline route to Lilly pipeline                                           | Terminal polygon in Port of Richards Bay; 25 km pipeline line | ZET (F1)                   | Port authority + project    |
| 2      | Capacity and phasing                     | mtpa, storage m³, phases, COD                                                                    | Phase chips on terminal pin                                   | 3 → 4.5 mtpa (F1)          | Project disclosures         |
| 3      | Who are the anchor customers?            | Foundation customers, gas-to-power plants, industrial users                                      | Eskom 3 GW pin; industrial gas users within 50 km             | Eskom HoA (F2)             | Utility + industry          |
| 4      | Gas network connection                   | Existing pipelines, compressor stations, tie-in points                                           | Lilly pipeline glow; tie-in peg                               | Transnet Pipelines         | Pipeline operator           |
| 5      | Regulation                               | Gas Act licences (NERSA), port concession, EA, AEL, water use, coastal discharge, dumping-at-sea | Pathway Gantt                                                 | Permits list (F1)          | Gas regulator + environment |
| 6      | Supply                                   | LNG sellers, contract structures, shipping routes                                                | Flow arrows from supply basins                                | ExxonMobil HoA (F2)        | Market data                 |
| 7      | Price formation                          | LNG index (e.g. JKM/Brent-linked), regas tariff, pipeline tariff                                 | Price stack brief                                             | NERSA tariffs              | Regulator                   |
| 8      | Risks                                    | Demand ramp, policy on gas in IRP, FX, marine/port                                               | Risk register                                                 | —                          | —                           |

**(d) Trader chain answered**

| **\#** | **Question**          | **Information types**                                                       | **Map behaviour**                                                       | **South African instance**                 | **Replication role**       |
|--------|-----------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------|--------------------------------------------|----------------------------|
| 1      | Product and specs     | HS 2710.12/2710.19; 50 ppm/10 ppm diesel; petrol grades                     | Product card                                                            | SARS tariff; SANS fuel specs               | Customs + standards        |
| 2      | How much is imported? | Import share and volumes by port                                            | Port inflow arrows                                                      | ≈60 % imported (F3)                        | Energy ministry statistics |
| 3      | Ports and storage     | Import terminals, tank capacity, third-party access                         | Terminal squares at Durban, Richards Bay, Saldanha, Cape Town, Gqeberha | Terminal operators                         | Port + storage register    |
| 4      | Inland route          | Transnet multi-product pipeline, rail, road to Gauteng depots               | Pipeline and road lines with cost/day chips                             | Transnet Pipelines                         | Pipeline operator          |
| 5      | Price                 | Regulated Basic Fuel Price and monthly adjustment; wholesale margin; levies | Price panel                                                             | Monthly fuel price adjustment              | Energy ministry            |
| 6      | Taxes and levies      | Fuel levy, RAF levy, carbon fuel levy, customs                              | Brief                                                                   | Carbon fuel levy 19/23 c/l (F4)            | Treasury/SARS              |
| 7      | Licences              | Wholesale licence, site licences, import permit, customs registration       | Pathway                                                                 | Petroleum Products Act licences \[VERIFY\] | Ministry licensing         |
| 8      | Forex                 | Import payment rules                                                        | Brief                                                                   | SARB                                       | Central bank               |
| 9      | Risks                 | Price volatility, supply disruptions, theft/adulteration                    | Risk triangles on routes                                                | —                                          | —                          |

**(e) Map stack**

| **Layer**                                     | **Levels** | **Geometry**    | **Illumination / behaviour**     |
|-----------------------------------------------|------------|-----------------|----------------------------------|
| Ports with liquid-bulk berths and terminals   | L0–L4      | Hexagon/polygon | Capacity chips                   |
| Pipelines (crude, products, gas)              | L0–L4      | Line (S2)       | Direction arrows; selection glow |
| Refineries (operating/closed/planned rebuild) | L0–L4      | Pin             | Status colour                    |
| Depots and storage                            | L1–L5      | Square          | Capacity m³                      |
| Gas-to-power and industrial gas users         | L1–L4      | Bubble          | Demand                           |
| LNG terminal and pipeline (ZET)               | L2–L5      | Polygon + line  | Phase colours                    |
| Fuel retail density                           | L2–L4      | Heat            | —                                |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Ports with liquid-bulk berths and terminals; Pipelines (crude, products, gas); Refineries (operating/closed/planned rebuild)                                                                                                                  |
| L1 Region/Province | Ports with liquid-bulk berths and terminals; Pipelines (crude, products, gas); Refineries (operating/closed/planned rebuild); Depots and storage; Gas-to-power and industrial gas users                                                       |
| L2 District        | Ports with liquid-bulk berths and terminals; Pipelines (crude, products, gas); Refineries (operating/closed/planned rebuild); Depots and storage; Gas-to-power and industrial gas users; LNG terminal and pipeline (ZET); Fuel retail density |
| L3 Municipality    | Ports with liquid-bulk berths and terminals; Pipelines (crude, products, gas); Refineries (operating/closed/planned rebuild); Depots and storage; Gas-to-power and industrial gas users; LNG terminal and pipeline (ZET); Fuel retail density |
| L4 City/Town       | Ports with liquid-bulk berths and terminals; Pipelines (crude, products, gas); Refineries (operating/closed/planned rebuild); Depots and storage; Gas-to-power and industrial gas users; LNG terminal and pipeline (ZET); Fuel retail density |
| L5 Site            | Depots and storage; LNG terminal and pipeline (ZET)                                                                                                                                                                                           |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                      | **Why it matters** |
|-------------------------------------------|--------------------|
| Tank availability and storage tariffs     | Import economics   |
| Strategic stock obligations               | Compliance         |
| Vessel draft limits by berth              | Cargo size         |
| Pipeline nominations and capacity         | Inland logistics   |
| Rail tank-car availability                | Alternatives       |
| Fuel quality testing labs                 | Compliance         |
| Theft hotspots on pipelines               | Risk               |
| Refinery restart plans                    | Competition        |
| Gas demand aggregation by industrial park | Anchor demand      |
| Air-quality headroom near terminals       | Permitting         |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                  | **Evidence trigger**     | **Map placement**            | **Investment model** |
|------------|--------------------------------------------------|--------------------------|------------------------------|----------------------|
| OGS-W-O01  | Equity in LNG import terminal                    | ZET pre-FID (F1)         | Richards Bay                 | Equity/JV            |
| OGS-W-O02  | Regas and pipeline services/EPC                  | Phased construction (F1) | Richards Bay–Empangeni       | EPC                  |
| OGS-W-O03  | Gas distribution to industry from Lilly pipeline | Pipeline link            | KZN industrial nodes         | Distribution licence |
| OGS-W-O04  | Small-scale LNG/CNG trucking                     | Off-pipeline demand      | Industrial towns             | Virtual pipeline     |
| OGS-W-O05  | Independent fuel storage terminals               | Import dependence (F3)   | Durban/Richards Bay/Saldanha | Terminal BOO         |
| OGS-W-O06  | Inland fuel depots near Gauteng                  | Pipeline end-points      | Gauteng                      | Depot                |
| OGS-W-O07  | Refinery rebuild/conversion partnerships         | Rebuild plans (F3)       | Durban/Mossel Bay            | JV                   |
| OGS-W-O08  | Biofuels blending                                | Import substitution      | Agricultural regions         | Plant                |
| OGS-W-O09  | Fuel-quality testing and marking                 | Adulteration risk        | Ports/depots                 | Lab/service          |
| OGS-W-O10  | Truck-stop fuel and service centres on N3/N1     | Freight flows            | Corridors                    | Concession           |
| OGS-W-O11  | Gas-to-power IPPs                                | 3 GW programme (F2)      | Richards Bay/Coega           | IPP                  |
| OGS-W-O12  | LPG import and cylinder distribution             | Clean cooking            | Townships                    | Distribution         |
| OGS-W-O13  | Pipeline security services                       | Theft                    | Pipeline routes              | Service              |
| OGS-W-O14  | Strategic fuel stock facilities                  | Supply security          | Coastal                      | PPP                  |
| OGS-W-O15  | Bunkering services                               | Port traffic             | Durban/Saldanha/Algoa        | Concession           |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**                          |
|-------------------|------------------------------------------------------------------|
| Demand            | Gas demand aggregation (power + industry); fuel demand by region |
| Supply            | LNG supply options; refined product origins                      |
| Infrastructure    | Terminal, pipeline and storage capacity and tariffs              |
| Price             | Netback/import parity models                                     |
| Financial         | Terminal tariff model; trading margin model                      |
| Regulation        | Gas Act, Petroleum Products Act, port concession, environmental  |
| Exhibits          | Supply chain map; price stack; capacity utilisation; sensitivity |

# W3. Mining & Minerals (MIN)

**(a) Scenarios**

- **Investor: bid as private partner for the new Northern Cape–Ngqura
  manganese export corridor and terminal**
- **Trader: buy chrome ore from South African producers for export**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                      | **Value**                                                                                                                                                                                                             | **Source**                                                                                                                                 | **Date**   |
|--------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|------------|
| MIN-F1 | Manganese exports 2025        | ≈26 Mt shipped (Minerals Council); rail ≈16 Mtpa; ≈10 Mtpa trucked; Port Elizabeth (Gqeberha) ≈65 % of export capacity; destinations ≈95 % Asia (China ≈68 %, India 16 %, Singapore 3 %, Malaysia 3 %, Japan 2 %)     | [Mining Weekly](https://www.miningweekly.com/article/south-africas-transnet-begins-process-to-expand-manganese-export-capacity-2026-09-25) | 2026-09-25 |
| MIN-F2 | Ngqura manganese corridor PSP | Transnet issued a Request for Qualification for a private partner to fund, develop, operate and maintain a new Northern Cape–Ngqura corridor and terminal for 25 years; aim to expand export capacity ≈20 %           | [Mining Weekly](https://www.miningweekly.com/article/south-africas-transnet-begins-process-to-expand-manganese-export-capacity-2026-09-25) | 2026-09-25 |
| MIN-F3 | Chrome ore export control     | Cabinet approved placing chrome ore under export control (ITAC permit) and development of a chrome ore export tax; expanded SEZ smelter incentives; more than half of 59 chrome furnaces shut; Glencore smelters shut | [OPIS (Dow Jones)](https://www.opis.com/resources/energy-market-news-from-opis/s-africas-cabinet-approves-chrome-export-restrictions/)     | 2025-07-01 |

**(c) Investor chain answered**

| **\#** | **Question**                                   | **Information types**                                            | **Map behaviour**                                        | **South African instance**         | **Replication role**            |
|--------|------------------------------------------------|------------------------------------------------------------------|----------------------------------------------------------|------------------------------------|---------------------------------|
| 1      | Where are the mines and how much do they ship? | Manganese mines, output, rail vs road split                      | Kalahari manganese field polygons; mine pins sized by Mt | 26 Mt, 16 Mt rail, 10 Mt road (F1) | Mining cadastre + industry body |
| 2      | Which corridor and port?                       | Rail line, ports and terminal capacities                         | Corridor line Northern Cape→Ngqura; Gqeberha share 65 %  | F1–F2                              | Rail/port authority             |
| 3      | What is being procured?                        | PSP scope, term, RFQ stage, timeline                             | Gold diamond on Ngqura terminal                          | 25-year PSP (F2)                   | PPP/port concession             |
| 4      | Demand                                         | Export destinations and growth                                   | Flow arrows to China/India/SE Asia                       | 95 % Asia (F1)                     | Customs data                    |
| 5      | Tariffs and charges                            | Rail tariff, port charges, terminal handling                     | Cost chips per segment                                   | Transnet tariff book               | Rail/port regulator             |
| 6      | Regulation                                     | Port concession, rail access, EA for terminal, water, dust (AEL) | Pathway                                                  | Ports Regulator; DFFE              | Port/environment                |
| 7      | Risks                                          | Rail performance, cable theft, dust, community                   | Risk overlays                                            | —                                  | —                               |

**(d) Trader chain answered**

| **\#** | **Question**                 | **Information types**                                                      | **Map behaviour**                     | **South African instance**              | **Replication role** |
|--------|------------------------------|----------------------------------------------------------------------------|---------------------------------------|-----------------------------------------|----------------------|
| 1      | Product                      | Chrome ore HS 2610.00; Cr2O3 %, Cr:Fe ratio, lumpy vs fines vs concentrate | Product card                          | SARS tariff                             | Customs              |
| 2      | Where is it produced?        | Bushveld Complex mines by producer and output                              | Mine pins and Bushveld polygon        | DMPR data \[VERIFY\]                    | Mining cadastre      |
| 3      | Export control               | Permit requirement and conditions                                          | Red hatch on chrome with ‘permit’ tag | Export control (F3)                     | Trade commission     |
| 4      | Export tax                   | Proposed tax status and rate                                               | Brief alert                           | Tax under development (F3)              | Treasury             |
| 5      | Domestic smelter competition | Ferrochrome smelters status (operating/shut)                               | Smelter squares grey/green            | More than half of 59 furnaces shut (F3) | Industry             |
| 6      | Route to port                | Rail/road to Richards Bay, Maputo, Durban                                  | Corridor lines with cost/time         | Transnet; Maputo corridor               | Rail/port            |
| 7      | Price                        | Benchmark chrome ore prices (e.g. China port prices)                       | Brief                                 | Market data                             | Price reporters      |
| 8      | Forex                        | Export proceeds rules                                                      | Brief                                 | SARB                                    | Central bank         |
| 9      | Risks                        | Policy (tax/permits), illegal mining, rail capacity                        | Risk triangles                        | F3                                      | —                    |

**(e) Map stack**

| **Layer**                            | **Levels** | **Geometry** | **Illumination / behaviour** |
|--------------------------------------|------------|--------------|------------------------------|
| Mining rights and mines by commodity | L0–L5      | Polygon/pin  | Commodity colour             |
| Ore rail lines and capacity          | L0–L3      | Line         | Utilisation colour           |
| Ports and bulk terminals             | L0–L4      | Hexagon      | Capacity                     |
| Smelters and beneficiation plants    | L1–L4      | Square       | Operating status             |
| Trucking routes and road damage      | L1–L4      | Line         | Truck volume                 |
| Export flows by destination          | L0         | Flow         | Volume width                 |
| Opportunity diamonds MIN-W-Oxx       | L2–L5      | Diamond      | Glow                         |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                                              |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Mining rights and mines by commodity; Ore rail lines and capacity; Ports and bulk terminals; Export flows by destination                                                                        |
| L1 Region/Province | Mining rights and mines by commodity; Ore rail lines and capacity; Ports and bulk terminals; Smelters and beneficiation plants; Trucking routes and road damage                                 |
| L2 District        | Mining rights and mines by commodity; Ore rail lines and capacity; Ports and bulk terminals; Smelters and beneficiation plants; Trucking routes and road damage; Opportunity diamonds MIN-W-Oxx |
| L3 Municipality    | Mining rights and mines by commodity; Ore rail lines and capacity; Ports and bulk terminals; Smelters and beneficiation plants; Trucking routes and road damage; Opportunity diamonds MIN-W-Oxx |
| L4 City/Town       | Mining rights and mines by commodity; Ports and bulk terminals; Smelters and beneficiation plants; Trucking routes and road damage; Opportunity diamonds MIN-W-Oxx                              |
| L5 Site            | Mining rights and mines by commodity; Opportunity diamonds MIN-W-Oxx                                                                                                                            |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                       | **Why it matters**      |
|--------------------------------------------|-------------------------|
| Rail slot availability and performance     | Corridor reliability    |
| Truck accident and road-damage data        | Social licence          |
| Smelter electricity tariffs                | Beneficiation economics |
| Water availability in Northern Cape        | Processing              |
| Illegal mining hotspots                    | Security                |
| Port draft and ship sizes                  | Freight cost            |
| Dust/AQ permit status                      | Permitting              |
| Mining Charter ownership status of sellers | Compliance              |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                      | **Evidence trigger**         | **Map placement** | **Investment model** |
|------------|------------------------------------------------------|------------------------------|-------------------|----------------------|
| MIN-W-O01  | Ngqura manganese terminal and corridor PSP           | Transnet RFQ (F2)            | Ngqura            | 25-year PSP          |
| MIN-W-O02  | Rolling stock (wagons/locomotives) leasing           | Rail shortfall (F1)          | Corridor          | Leasing              |
| MIN-W-O03  | Road-to-rail transfer terminals                      | 10 Mt trucked (F1)           | Northern Cape     | Terminal             |
| MIN-W-O04  | Manganese beneficiation (EMM/HPMSM for batteries)    | Exports 95 % raw (F1)        | SEZs              | Plant                |
| MIN-W-O05  | Ferrochrome smelter restart with own renewable power | Smelters shut (F3)           | Bushveld          | Smelter + PPA        |
| MIN-W-O06  | Chrome beneficiation under SEZ incentives            | Expanded SEZ incentives (F3) | SEZs              | Plant                |
| MIN-W-O07  | Tailings retreatment for chrome/PGMs                 | Bushveld tailings            | Bushveld          | Retreatment          |
| MIN-W-O08  | Dust suppression and road safety services            | Trucking                     | Haul routes       | Service              |
| MIN-W-O09  | Bulk port terminal capacity at Richards Bay/Saldanha | Exports                      | Ports             | Concession           |
| MIN-W-O10  | Assay and sampling laboratories                      | Export quality               | Ports/mines       | Lab                  |
| MIN-W-O11  | Mine-water treatment                                 | Mining                       | Mine areas        | Plant                |
| MIN-W-O12  | Battery precursor plants                             | Critical minerals            | SEZs              | Plant                |
| MIN-W-O13  | Rail maintenance and security PPP                    | Theft                        | Corridors         | Service              |
| MIN-W-O14  | Mining services (drilling, explosives, maintenance)  | Mine expansion               | Mining towns      | Service              |
| MIN-W-O15  | Renewable PPAs for mines                             | Power costs                  | Mining regions    | PPA                  |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**                      |
|-------------------|--------------------------------------------------------------|
| Market            | Manganese/chrome supply–demand; price decks                  |
| Logistics         | Mine-to-ship cost model; rail/road split                     |
| Concession        | PSP structure; tariff; capex; risk allocation                |
| Policy            | Export controls and taxes; beneficiation incentives          |
| Financial         | Terminal throughput model; trader margin model               |
| Exhibits          | Corridor map; cost curve; destination flows; policy timeline |

# W4. Livestock, Fisheries & Blue Economy (BLU)

**(a) Scenarios**

- **Investor: build an export-approved feedlot and abattoir in a
  foot-and-mouth (FMD) free zone**
- **Trader: export beef to Middle East/Asian markets**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**              | **Value**                                                                                                                                                                                                                                      | **Source**                                                                                                                                                                         | **Date**             |
|--------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| BLU-F1 | FMD extent (Feb 2026) | Infections or movement restrictions in KwaZulu-Natal, Free State, Mpumalanga, Gauteng, North West and parts of Western Cape and Limpopo; Northern Cape reported free of cases; auctions suspended and movement restricted in affected zones    | [IOL](https://iol.co.za/news/2026-02-11-why-south-africas-foot-and-mouth-disease-outbreak-threatens-exports-and-jobs/)                                                             | 2026-02-11           |
| BLU-F2 | Vaccination response  | Botswana Vaccine Institute ≈700,000 doses by end-February 2026; ARC local production ≈20,000 doses/week from March 2026; Western Cape ≈R100 m for vaccines and containment; national herd to be vaccinated in phases to regain FMD-free status | [IOL](https://iol.co.za/news/2026-02-11-why-south-africas-foot-and-mouth-disease-outbreak-threatens-exports-and-jobs/)                                                             | 2026-02-11           |
| BLU-F3 | Market suspensions    | China halted South African meat imports (May 2025); Zambia suspended livestock imports from South Africa (Feb 2026)                                                                                                                            | [Feed Business MEA; TimesLive](https://www.timeslive.co.za/news/south-africa/2026-02-15-zambia-suspends-livestock-imports-from-south-africa-over-foot-and-mouth-disease-outbreak/) | 2025-05 / 2026-02-15 |

**(c) Investor chain answered**

| **\#** | **Question**             | **Information types**                                                   | **Map behaviour**                                         | **South African instance** | **Replication role**            |
|--------|--------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------|----------------------------|---------------------------------|
| 1      | Where can I export from? | FMD control zones, free zones, vaccination zones, movement restrictions | Zone polygons: red infected, amber restricted, green free | Northern Cape free (F1)    | Veterinary services             |
| 2      | Which markets are open?  | Market access by destination and establishment approval                 | Destination fill: open/suspended                          | China halted (F3)          | Veterinary export certification |
| 3      | Supply of cattle         | Herd size by district, weaner supply, auctions                          | Livestock density; auction pins                           | Herd census \[VERIFY\]     | Livestock statistics            |
| 4      | Site                     | Water, feed grain supply (maize), land, distance to farms               | Site query: water, feed mills, grain silos                | SAGIS silos; DWS           | Agriculture + water             |
| 5      | Abattoir standards       | Export establishment approval, halal, Meat Safety Act                   | Pathway                                                   | Dept of Agriculture        | Vet authority                   |
| 6      | Cold chain and port      | Cold stores, reefer depots, ports                                       | Cold-chain squares; ports                                 | Port operators             | Logistics                       |
| 7      | Risks                    | Disease spread, vaccine supply, trade bans, drought                     | FMD outbreak triangles with dates                         | F1–F3                      | —                               |

**(d) Trader chain answered**

| **\#** | **Question**  | **Information types**                                            | **Map behaviour**                           | **South African instance**    | **Replication role** |
|--------|---------------|------------------------------------------------------------------|---------------------------------------------|-------------------------------|----------------------|
| 1      | Product       | HS 0202.30 frozen boneless beef; 0201 chilled; cuts specs; halal | Product card                                | SARS                          | Customs              |
| 2      | Quantities    | Slaughter numbers, export volumes by month                       | Abattoir output bubbles                     | RMIS data \[VERIFY\]          | Industry body        |
| 3      | Where to buy  | Export-approved abattoirs                                        | Abattoir pins with approval tags per market | Dept of Agriculture list      | Vet authority        |
| 4      | Prices        | Carcass prices (A2/A3), export prices                            | Price chips                                 | RMIS/industry                 | Market data          |
| 5      | Market access | Protocols, suspensions, certificates                             | Destination status layer                    | China/Zambia suspensions (F3) | Vet authority        |
| 6      | Documents     | Veterinary health certificate, halal, origin                     | Brief                                       | —                             | —                    |
| 7      | Logistics     | Reefer containers, ports (Durban, Cape Town), transit            | Corridor lines                              | Transnet                      | Port                 |
| 8      | Forex/finance | LC, export credit                                                | Brief                                       | SARB/ECIC                     | —                    |
| 9      | Risks         | Disease status changes, rejection, price                         | Alerts                                      | F1                            | —                    |

**(e) Map stack**

| **Layer**                              | **Levels** | **Geometry**       | **Illumination / behaviour**  |
|----------------------------------------|------------|--------------------|-------------------------------|
| FMD zones and outbreak points (dated)  | L0–L5      | Polygon + triangle | Colour by status; time slider |
| Livestock density                      | L1–L3      | Heat               | —                             |
| Feedlots and abattoirs (approval tags) | L2–L5      | Pin                | Approval badges               |
| Auctions and movement-control points   | L2–L4      | Pin                | Open/suspended                |
| Vaccination coverage                   | L1–L3      | Choropleth         | %                             |
| Cold stores and reefer depots          | L3–L5      | Square             | Capacity                      |
| Export flows                           | L0         | Flow               | Status                        |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                                          |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | FMD zones and outbreak points (dated); Export flows                                                                                                                                         |
| L1 Region/Province | FMD zones and outbreak points (dated); Livestock density; Vaccination coverage                                                                                                              |
| L2 District        | FMD zones and outbreak points (dated); Livestock density; Feedlots and abattoirs (approval tags); Auctions and movement-control points; Vaccination coverage                                |
| L3 Municipality    | FMD zones and outbreak points (dated); Livestock density; Feedlots and abattoirs (approval tags); Auctions and movement-control points; Vaccination coverage; Cold stores and reefer depots |
| L4 City/Town       | FMD zones and outbreak points (dated); Feedlots and abattoirs (approval tags); Auctions and movement-control points; Cold stores and reefer depots                                          |
| L5 Site            | FMD zones and outbreak points (dated); Feedlots and abattoirs (approval tags); Cold stores and reefer depots                                                                                |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                          | **Why it matters** |
|-----------------------------------------------|--------------------|
| Vaccine availability and coverage by district | Restart timeline   |
| Traceability (animal ID) coverage             | Market access      |
| Feed cost (maize/soy) by region               | Margin             |
| Water availability for feedlots               | Site               |
| Grazing condition/drought index               | Supply             |
| Halal certifying bodies                       | Market access      |
| Hides and by-product markets                  | Revenue            |
| Biosecurity compliance services               | Risk               |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                               | **Evidence trigger**     | **Map placement**     | **Investment model** |
|------------|-----------------------------------------------|--------------------------|-----------------------|----------------------|
| BLU-W-O01  | Export-approved abattoir in FMD-free zone     | Northern Cape free (F1)  | Northern Cape         | Greenfield           |
| BLU-W-O02  | Feedlot with integrated grain supply          | Market recovery          | Free zones near grain | Feedlot              |
| BLU-W-O03  | Vaccine production scale-up                   | Vaccine shortage (F2)    | ARC/industrial sites  | Manufacturing/PPP    |
| BLU-W-O04  | Animal identification and traceability system | Market access            | National              | Platform             |
| BLU-W-O05  | Compartment/biosecure production units        | Trade recovery           | Free zones            | Farm units           |
| BLU-W-O06  | Cold-chain and reefer depots                  | Exports                  | Ports/inland          | Logistics            |
| BLU-W-O07  | Tannery and leather goods                     | Hides                    | Industrial hubs       | Manufacturing        |
| BLU-W-O08  | Rendering and by-product plants               | Abattoir by-products     | Near abattoirs        | Plant                |
| BLU-W-O09  | Halal certification and processing            | Middle East demand       | Abattoirs             | Service              |
| BLU-W-O10  | Veterinary diagnostics laboratory             | Disease monitoring       | Regional              | Lab                  |
| BLU-W-O11  | Livestock insurance (disease/price)           | Losses                   | National              | Insurer              |
| BLU-W-O12  | Aquaculture (abalone/finfish)                 | Diversification          | Coastal               | Farm                 |
| BLU-W-O13  | Feed mills                                    | Feedlots                 | Grain regions         | Plant                |
| BLU-W-O14  | Digital livestock auctions                    | Auction suspensions (F1) | National              | Platform             |
| BLU-W-O15  | Dairy processing (UHT/powder)                 | Milk producers           | Dairy regions         | Plant                |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus**  | **Sector-specific analyses / exhibits**         |
|--------------------|-------------------------------------------------|
| Disease and access | FMD status, recovery timeline, protocol outlook |
| Supply             | Cattle supply curve by region                   |
| Market             | Destination demand and prices                   |
| Operations         | Feedlot/abattoir throughput, yields, cold chain |
| Financial          | Margin per head; sensitivities to bans          |
| Exhibits           | FMD zone map; access matrix; margin waterfall   |

# W5. Forestry & Timber (FOR)

**(a) Scenarios**

- **Investor: build a sawmill and engineered-timber (CLT/glulam) plant
  fed by Mpumalanga/KwaZulu-Natal pine plantations**
- **Trader: buy sawn timber, poles and wood chips for domestic and
  export markets**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                     | **Value**                                                                                                                                                                         | **Source**                                                          | **Date** |
|--------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|----------|
| FOR-F1 | Plantation area and species  | ≈1.2 million ha of plantations: pine 49 %, eucalyptus 43 %, wattle 7 %; Mpumalanga and KwaZulu-Natal dominate, with Eastern Cape, Limpopo and Western Cape                        | [Agribook (Forestry SA data)](https://www.agribook.co.za/forestry/) | 2025     |
| FOR-F2 | Sector value and jobs (2025) | Total GDP contribution ≈R74.5 bn; timber sales ≈R15.2 bn; pulp, paper, sawn lumber, boards, poles and other products ≈R59.3 bn; ≈145,000 jobs (95,000 growing; 35,000 processing) | [Agribook](https://www.agribook.co.za/forestry/)                    | 2025     |

**(c) Investor chain answered**

| **\#** | **Question**                 | **Information types**                                                         | **Map behaviour**                                        | **South African instance** | **Replication role**         |
|--------|------------------------------|-------------------------------------------------------------------------------|----------------------------------------------------------|----------------------------|------------------------------|
| 1      | Where is the fibre?          | Plantation polygons by species and age class; owner (state/private/community) | Plantation polygons coloured by species; age-class hatch | 1.2 m ha (F1)              | Forestry statistics + owners |
| 2      | How much log supply is free? | Annual allowable cut, committed volumes, uncommitted log supply               | Sustainable-yield chips by district                      | Forestry owners \[VERIFY\] | Forest management plans      |
| 3      | Site                         | Industrial land, power, water, roads, rail siding, distance to plantations    | Site query; isochrone to plantations                     | Spine U-layers             | Municipal/utility data       |
| 4      | Market                       | Construction timber demand, CLT adoption, import competition                  | Demand bubbles at metros                                 | Sector value (F2)          | Construction statistics      |
| 5      | Regulation                   | Forestry licences, building code acceptance of CLT, AEL for kilns/boilers     | Pathway                                                  | National Forests Act; SANS | Forestry + standards         |
| 6      | Risks                        | Fire, pests, log theft, land claims                                           | Fire history raster; claims flags                        | —                          | —                            |

**(d) Trader chain answered**

| **\#** | **Question**    | **Information types**                                   | **Map behaviour**       | **South African instance**        | **Replication role** |
|--------|-----------------|---------------------------------------------------------|-------------------------|-----------------------------------|----------------------|
| 1      | Products and HS | Sawn coniferous 4407.11; wood chips 4401.22; poles 4403 | Product cards           | SARS                              | Customs              |
| 2      | Where to buy    | Sawmills, pole treatment plants, chip mills             | Mill pins with capacity | Forestry SA members               | Industry register    |
| 3      | Grades          | SANS stress grades; treatment classes                   | Brief                   | SABS                              | Standards            |
| 4      | Prices          | Price per m³ by grade and region                        | Price chips             | Industry price surveys \[VERIFY\] | Market data          |
| 5      | Routes          | Road/rail to Durban/Richards Bay; inland to Gauteng     | Corridor lines          | Transnet                          | Rail/port            |
| 6      | Export rules    | Phytosanitary (ISPM 15 for packaging), chain-of-custody | Brief                   | Plant health                      | SPS authority        |
| 7      | Risks           | Supply shortages after fires, quality                   | Fire alerts             | —                                 | —                    |

**(e) Map stack**

| **Layer**                        | **Levels** | **Geometry**    | **Illumination / behaviour** |
|----------------------------------|------------|-----------------|------------------------------|
| Plantations by species/age       | L1–L5      | Polygon         | Species colour               |
| Fire incidence and risk          | L1–L5      | Raster/triangle | Season slider                |
| Sawmills, chip mills, pulp mills | L2–L5      | Pin             | Capacity                     |
| Forest roads and haul routes     | L2–L5      | Line            | Condition                    |
| Export ports with chip terminals | L0–L3      | Hexagon         | Throughput                   |
| Land claims on plantations       | L2–L5      | Hatch           | Status                       |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                                |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Export ports with chip terminals                                                                                                                                                  |
| L1 Region/Province | Plantations by species/age; Fire incidence and risk; Export ports with chip terminals                                                                                             |
| L2 District        | Plantations by species/age; Fire incidence and risk; Sawmills, chip mills, pulp mills; Forest roads and haul routes; Export ports with chip terminals; Land claims on plantations |
| L3 Municipality    | Plantations by species/age; Fire incidence and risk; Sawmills, chip mills, pulp mills; Forest roads and haul routes; Export ports with chip terminals; Land claims on plantations |
| L4 City/Town       | Plantations by species/age; Fire incidence and risk; Sawmills, chip mills, pulp mills; Forest roads and haul routes; Land claims on plantations                                   |
| L5 Site            | Plantations by species/age; Fire incidence and risk; Sawmills, chip mills, pulp mills; Forest roads and haul routes; Land claims on plantations                                   |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                       | **Why it matters** |
|--------------------------------------------|--------------------|
| Age-class distribution and future harvest  | Supply security    |
| Log prices by grade                        | Feedstock cost     |
| Water-licence status for new afforestation | Expansion          |
| CLT building approvals                     | Demand             |
| Biomass residues for energy                | Co-product         |
| Community forestry schemes                 | Supply/ESG         |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                             | **Evidence trigger**                  | **Map placement**  | **Investment model** |
|------------|---------------------------------------------|---------------------------------------|--------------------|----------------------|
| FOR-W-O01  | CLT/glulam engineered-timber plant          | Construction demand; pine supply (F1) | Mpumalanga/KZN     | Greenfield           |
| FOR-W-O02  | Sawmill modernisation                       | Value (F2)                            | Mill towns         | Acquisition/upgrade  |
| FOR-W-O03  | New licensed afforestation on degraded land | Fibre shortfall                       | Eastern Cape       | Plantation           |
| FOR-W-O04  | Fire detection and suppression services     | Fire risk                             | Plantation regions | Service              |
| FOR-W-O05  | Biomass pellets/energy from residues        | Residues                              | Near mills         | Plant                |
| FOR-W-O06  | Pole treatment for power/telecom            | Grid build-out                        | Plantation regions | Plant                |
| FOR-W-O07  | Timber-frame housing manufacturing          | Housing backlog                       | Metros             | Factory              |
| FOR-W-O08  | Wood-chip export terminal capacity          | Exports                               | Richards Bay       | Terminal             |
| FOR-W-O09  | Dissolving pulp/biochemicals                | Eucalyptus (F1)                       | KZN                | Plant                |
| FOR-W-O10  | Community/outgrower forestry                | Inclusion                             | Eastern Cape/KZN   | Outgrower            |
| FOR-W-O11  | Furniture manufacturing clusters            | Sawn timber                           | Metros             | SME cluster          |
| FOR-W-O12  | Timber drying and kilns                     | Quality                               | Mill towns         | Service              |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**       |
|-------------------|-----------------------------------------------|
| Fibre             | Supply curve, age-class model                 |
| Market            | Demand by product; import parity              |
| Plant             | Technology, yields, capex                     |
| Financial         | Margin per m³; sensitivity to log price       |
| Exhibits          | Plantation map; supply curve; yield waterfall |

# W6. Manufacturing & Industrial (MFG)

**(a) Scenarios**

- **Investor: build an automotive component plant in an SEZ near an OEM
  (e.g. Coega, East London)**
- **Trader: buy South African-built vehicles and components for export
  into Africa or Europe**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**             | **Value**                                                                                                                                                                                                                              | **Source**                                                                                                                                  | **Date**   |
|--------|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|------------|
| MFG-F1 | Vehicle exports 2025 | 414,268 units (+5.9 % on 391,128 in 2024) to 109 countries; 70.3 % of light-vehicle production exported; Europe 332,695 units (80.3 %); North America fell ≈74 % after US Section 232 duty; NEV sales 16,716 (2.8 % of new-car market) | [TimesLive (naamsa data)](https://www.timeslive.co.za/motoring/2026-02-17-sa-vehicle-exports-hit-record-414268-in-2025-despite-us-tariffs/) | 2026-02-17 |

**(c) Investor chain answered**

| **\#** | **Question**                        | **Information types**                                        | **Map behaviour**                 | **South African instance**           | **Replication role** |
|--------|-------------------------------------|--------------------------------------------------------------|-----------------------------------|--------------------------------------|----------------------|
| 1      | Where are the OEMs and suppliers?   | OEM plants, supplier parks, component imports by part        | OEM pins; supplier park polygons  | naamsa; dtic                         | Industry association |
| 2      | What components are imported (gap)? | Import values by HS 87.08 lines vs local supply              | Gap heat by component family      | SARS trade data                      | Customs              |
| 3      | Which SEZ?                          | SEZ incentives, plots, utilities, port distance              | SEZ polygons with available plots | dtic SEZ programme                   | Zone authority       |
| 4      | Market                              | OEM volumes, export destinations, EV transition              | Flow arrows to Europe             | F1                                   | Industry             |
| 5      | Incentives                          | APDP/AIS-type production incentives, s12I, SEZ tax rate      | Incentive chips                   | dtic \[VERIFY current scheme names\] | Industry ministry    |
| 6      | Labour and skills                   | Automotive skills pool, wages                                | Isochrones                        | QLFS; MERSETA                        | Labour statistics    |
| 7      | Risks                               | Trade policy (US duties), power, logistics, labour relations | Alerts                            | F1                                   | —                    |

**(d) Trader chain answered**

| **\#** | **Question**           | **Information types**                                 | **Map behaviour**       | **South African instance**   | **Replication role** |
|--------|------------------------|-------------------------------------------------------|-------------------------|------------------------------|----------------------|
| 1      | Products               | HS 8703 vehicles; 8708 parts                          | Product card            | SARS                         | Customs              |
| 2      | Availability           | Export volumes by model/plant                         | Plant pins with volumes | F1                           | Industry             |
| 3      | Rules of origin        | AfCFTA/SADC/EU-SADC EPA origin for vehicles           | Brief                   | Agreement texts              | Trade ministry       |
| 4      | Tariffs at destination | Duties into SADC, EU, UK, US (s232)                   | Destination fill        | F1                           | Destination tariffs  |
| 5      | Logistics              | Ro-Ro terminals (Durban, East London, Port Elizabeth) | Port hexagons           | Transnet                     | Port                 |
| 6      | Homologation           | Standards in destination                              | Brief                   | NRCS; destination regulators | Standards            |
| 7      | Finance and forex      | Floor-plan finance; export proceeds                   | Brief                   | SARB                         | Central bank         |

**(e) Map stack**

| **Layer**                           | **Levels** | **Geometry** | **Illumination / behaviour** |
|-------------------------------------|------------|--------------|------------------------------|
| OEM plants and supplier parks       | L0–L5      | Pin/polygon  | Status                       |
| SEZs with available plots           | L1–L5      | Polygon      | Availability                 |
| Ro-Ro and container terminals       | L0–L4      | Hexagon      | Capacity                     |
| Rail to ports                       | L0–L3      | Line         | Status                       |
| Export flows by destination         | L0         | Flow         | Units                        |
| Industrial power capacity near SEZs | L2–L5      | Square (S2)  | MW                           |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                          |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | OEM plants and supplier parks; Ro-Ro and container terminals; Rail to ports; Export flows by destination                                    |
| L1 Region/Province | OEM plants and supplier parks; SEZs with available plots; Ro-Ro and container terminals; Rail to ports                                      |
| L2 District        | OEM plants and supplier parks; SEZs with available plots; Ro-Ro and container terminals; Rail to ports; Industrial power capacity near SEZs |
| L3 Municipality    | OEM plants and supplier parks; SEZs with available plots; Ro-Ro and container terminals; Rail to ports; Industrial power capacity near SEZs |
| L4 City/Town       | OEM plants and supplier parks; SEZs with available plots; Ro-Ro and container terminals; Industrial power capacity near SEZs                |
| L5 Site            | OEM plants and supplier parks; SEZs with available plots; Industrial power capacity near SEZs                                               |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                      | **Why it matters** |
|-------------------------------------------|--------------------|
| Component import substitution list        | Product selection  |
| OEM sourcing calendars/new model launches | Timing             |
| Utility tariffs and reliability by SEZ    | Opex               |
| Port Ro-Ro dwell times                    | Logistics          |
| EV battery/drivetrain localisation plans  | Future-proofing    |
| Trade defence actions                     | Market risk        |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                               | **Evidence trigger** | **Map placement** | **Investment model** |
|------------|-----------------------------------------------|----------------------|-------------------|----------------------|
| MFG-W-O01  | Component plant for imported parts            | Import gap           | SEZs near OEMs    | Greenfield/JV        |
| MFG-W-O02  | EV components and battery assembly            | NEV growth (F1)      | Coega/East London | Greenfield           |
| MFG-W-O03  | Diversification of exports to Africa (AfCFTA) | US market drop (F1)  | Ports             | Trading/distribution |
| MFG-W-O04  | Tooling and die making                        | Supplier depth       | Supplier parks    | SME/JV               |
| MFG-W-O05  | Ro-Ro terminal capacity                       | Exports 414k (F1)    | Ports             | Concession           |
| MFG-W-O06  | Logistics parks near OEMs                     | Just-in-time supply  | SEZs              | Development          |
| MFG-W-O07  | Recycled plastics and composites for auto     | Sustainability       | Industrial hubs   | Plant                |
| MFG-W-O08  | Renewable PPAs for SEZ tenants                | Power cost           | SEZs              | PPA                  |
| MFG-W-O09  | Testing and homologation centre               | Export compliance    | Gauteng/EC        | Service              |
| MFG-W-O10  | Skills academies with OEMs                    | Skills               | OEM towns         | PPP                  |
| MFG-W-O11  | Steel service centres                         | Inputs               | Industrial hubs   | Distribution         |
| MFG-W-O12  | Component remanufacturing                     | Aftermarket          | Metros            | Plant                |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**       |
|-------------------|-----------------------------------------------|
| Market            | OEM demand by component; import substitution  |
| Site              | SEZ comparison                                |
| Operations        | Process, capex, staffing                      |
| Incentives        | Eligibility and value                         |
| Financial         | Unit cost vs import parity; IRR               |
| Exhibits          | Supplier gap heat; SEZ matrix; cost waterfall |

# W7. Water, Sanitation & Waste (WSW)

**(a) Scenarios**

- **Investor: refurbish and operate municipal wastewater treatment works
  under performance-based contracts**
- **Trader: buy and sell scrap metal and recyclables**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                 | **Value**                                                                                                                                                                                                                                | **Source**                                                                                                                                     | **Date**   |
|--------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| WSW-F1 | Green Drop 2025 results  | 848 wastewater treatment works across 144 water services authorities; 47 % (396) in critical state, up from 39 % (334) in 2022; 61 % below minimum standard; only 8 % (66) excellent/good; ≈R13.34 bn estimated to restore functionality | [Infrastructure News (DWS Green Drop 2025)](https://infrastructurenews.co.za/2026/06/18/green-drop-report-the-state-of-wastewater-in-numbers/) | 2026-06-18 |
| WSW-F2 | WWTWs by province        | EC 125; FS 95; GP 61; KZN 148; LP 65; MP 75; NC 75; NW 44; WC 160                                                                                                                                                                        | [Infrastructure News](https://infrastructurenews.co.za/2026/06/18/green-drop-report-the-state-of-wastewater-in-numbers/)                       | 2026-06-18 |
| WSW-F3 | Scrap metal export rules | Price Preference System since 2013, extended to 2027: scrap must first be offered to domestic users at ITAC-calculated preferential prices before export; tighter export-permit controls; temporary export prohibition in 2022 and 2023  | [IEA Policies Database](https://www.iea.org/policies/18901-export-of-ferrous-and-non-ferrous-waste-and-scrap-metal)                            | 2024-06-11 |

**(c) Investor chain answered**

| **\#** | **Question**                        | **Information types**                                                         | **Map behaviour**                     | **South African instance** | **Replication role**     |
|--------|-------------------------------------|-------------------------------------------------------------------------------|---------------------------------------|----------------------------|--------------------------|
| 1      | Which plants are failing and where? | Green Drop score, risk rating, design capacity, operational capacity per WWTW | WWTW pins coloured by Green Drop risk | 47 % critical (F1)         | Water regulator report   |
| 2      | How many per province/municipality? | Count and critical share                                                      | Province chips                        | F2                         | Regulator                |
| 3      | What will it cost?                  | Refurbishment estimate per plant; national VROOM                              | Cost chips                            | R13.34 bn (F1)             | Regulator/engineers      |
| 4      | Who pays?                           | Municipal finances, collection rates, grants                                  | Municipal credit choropleth           | Treasury municipal data    | Treasury                 |
| 5      | Contract model                      | Performance-based O&M, BOT, water reuse sale                                  | Model chip                            | Municipal PPP regulations  | PPP unit                 |
| 6      | Environmental pressure              | Rivers receiving effluent, downstream users                                   | River reaches coloured by pollution   | DWS water quality          | Water quality monitoring |
| 7      | Risks                               | Municipal payment, vandalism, power outages                                   | Risk triangles                        | —                          | —                        |

**(d) Trader chain answered**

| **\#** | **Question**    | **Information types**                              | **Map behaviour**         | **South African instance**                 | **Replication role** |
|--------|-----------------|----------------------------------------------------|---------------------------|--------------------------------------------|----------------------|
| 1      | Products        | Ferrous scrap HS 7204; copper 7404; aluminium 7602 | Product cards             | SARS                                       | Customs              |
| 2      | Rules           | Price Preference System; export permits; bans      | Red/amber restriction tag | F3                                         | Trade commission     |
| 3      | Where to buy    | Licensed scrap dealers and yards                   | Yard pins                 | Second-Hand Goods Act registers \[VERIFY\] | Police/licensing     |
| 4      | Domestic buyers | Steel mills, foundries                             | Mill pins                 | Industry                                   | Industry             |
| 5      | Prices          | ITAC preferential price vs international benchmark | Price chips               | ITAC calculation (F3)                      | Trade commission     |
| 6      | Compliance      | Anti-theft rules (cable), traceability             | Brief                     | —                                          | —                    |
| 7      | Logistics       | Ports for export; rail                             | Port hexagons             | Transnet                                   | Port                 |

**(e) Map stack**

| **Layer**                          | **Levels** | **Geometry** | **Illumination / behaviour** |
|------------------------------------|------------|--------------|------------------------------|
| WWTWs by Green Drop risk           | L1–L5      | Pin          | Red/amber/green              |
| Water treatment works by Blue Drop | L1–L5      | Pin          | Risk colour                  |
| Rivers with pollution status       | L1–L4      | Line         | Colour                       |
| Municipal financial health         | L2–L3      | Choropleth   | Score                        |
| Landfills and MRFs                 | L2–L5      | Pin          | Airspace                     |
| Scrap yards and mills              | L2–L5      | Pin          | Licence                      |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | —                                                                                                                                                                 |
| L1 Region/Province | WWTWs by Green Drop risk; Water treatment works by Blue Drop; Rivers with pollution status                                                                        |
| L2 District        | WWTWs by Green Drop risk; Water treatment works by Blue Drop; Rivers with pollution status; Municipal financial health; Landfills and MRFs; Scrap yards and mills |
| L3 Municipality    | WWTWs by Green Drop risk; Water treatment works by Blue Drop; Rivers with pollution status; Municipal financial health; Landfills and MRFs; Scrap yards and mills |
| L4 City/Town       | WWTWs by Green Drop risk; Water treatment works by Blue Drop; Rivers with pollution status; Landfills and MRFs; Scrap yards and mills                             |
| L5 Site            | WWTWs by Green Drop risk; Water treatment works by Blue Drop; Landfills and MRFs; Scrap yards and mills                                                           |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                    | **Why it matters** |
|-----------------------------------------|--------------------|
| Operational vs design capacity          | Sizing             |
| Electricity reliability at plants       | Operations         |
| Effluent reuse demand (industry, mines) | Revenue            |
| Sludge disposal options                 | Cost               |
| Skilled process controllers             | Operations         |
| Cable theft hotspots                    | Security           |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                        | **Evidence trigger** | **Map placement**    | **Investment model** |
|------------|--------------------------------------------------------|----------------------|----------------------|----------------------|
| WSW-W-O01  | WWTW refurbish–operate contracts                       | 47 % critical (F1)   | Critical plants      | Performance contract |
| WSW-W-O02  | Treated effluent reuse for industry/mines              | Water scarcity       | Industrial nodes     | Offtake              |
| WSW-W-O03  | Package/modular treatment plants                       | Small towns          | Small municipalities | Supply/lease         |
| WSW-W-O04  | Sludge-to-energy/biogas                                | Sludge               | Large WWTWs          | Plant                |
| WSW-W-O05  | Remote monitoring/SCADA services                       | Operations           | National             | SaaS                 |
| WSW-W-O06  | Process-controller training academy                    | Skills               | Regional             | Training             |
| WSW-W-O07  | Non-revenue water reduction contracts                  | Water losses         | Metros               | Shared savings       |
| WSW-W-O08  | Recycling plants (plastics, paper)                     | EPR                  | Metros               | Plant                |
| WSW-W-O09  | Scrap processing (shredding/baling) for domestic mills | PPS (F3)             | Industrial hubs      | Plant                |
| WSW-W-O10  | Non-ferrous refining (copper/aluminium)                | Scrap                | Industrial hubs      | Plant                |
| WSW-W-O11  | Landfill gas projects                                  | Landfills            | Metros               | IPP                  |
| WSW-W-O12  | Desalination for coastal towns                         | Drought              | Coast                | BOT                  |
| WSW-W-O13  | Laboratory services for effluent testing               | Compliance           | Regional             | Lab                  |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**         |
|-------------------|-------------------------------------------------|
| Diagnosis         | Plant-by-plant condition and compliance         |
| Technical         | Refurbishment scope and costs                   |
| Commercial        | Payment mechanism, municipal credit, guarantees |
| Financial         | Contract cash flows; risk allocation            |
| Exhibits          | Green Drop map; cost table; payment structure   |

# W8. ICT, Digital & Telecoms (ICT)

**(a) Scenarios**

- **Investor: build a colocation/hyperscale data centre with wheeled
  renewable power**
- **Trader (services): export global business services (BPO/CX) from
  South Africa**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                   | **Value**                                                                                                                                                                    | **Source**                                                                                                                                             | **Date**   |
|--------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| ICT-F1 | Teraco capacity            | ≈189 MW critical power load: Isando 70 MW, Bredell 64 MW, Cape Town 53 MW, Durban 2 MW; CT2 expansion added 32 MW (Nov 2025); 120 MW solar PV for wheeling under development | [Teraco](https://www.teraco.co.za/news/teraco-completes-ct2-data-centre-expansion/)                                                                    | 2025-11-10 |
| ICT-F2 | Data-centre demand outlook | Expansion plans could add ≈1,000 MW to national electricity demand (Teraco, Cavaleros, hyperscalers)                                                                         | [Daily Maverick](https://www.dailymaverick.co.za/article/2026-02-09-major-sa-data-centre-expansion-plans-emes-emerge-set-to-more-than-double-current/) | 2026-02-09 |
| ICT-F3 | GBS/BPO exports            | 14,000+ new jobs Jan–Sep 2024 (12,564 youth); export revenue ≈R13.6 bn in the same period; UK 51.2 % and US 30.4 % of globally focused workers; target 500,000 jobs by 2030  | [BPESA](https://bpesa.org.za/news/658-sa’s-global-business-services-sector-on-track-to-create-500-000-jobs-by-2031.html)                               | 2025-01-30 |

**(c) Investor chain answered**

| **\#** | **Question**                      | **Information types**                                            | **Map behaviour**                                | **South African instance** | **Replication role**  |
|--------|-----------------------------------|------------------------------------------------------------------|--------------------------------------------------|----------------------------|-----------------------|
| 1      | Where is demand and connectivity? | Existing DCs, IXPs, cable landings, cloud regions                | DC pins (S2 generalised); cable landing hexagons | F1                         | Regulator + operators |
| 2      | Power availability                | Substation capacity, municipal vs Eskom supply, wheeling options | Substation colour + municipal boundary           | GCCA; municipal tariffs    | Utility               |
| 3      | Renewable sourcing                | Wheeling PPAs, REDZ projects                                     | PPA links from plant to DC                       | 120 MW solar (F1)          | Regulator             |
| 4      | Land and zoning                   | Industrial land near metros; zoning                              | Plot polygons                                    | Municipal                  | Municipal             |
| 5      | Water for cooling                 | Water availability and restrictions                              | Water stress raster                              | DWS                        | Water authority       |
| 6      | Market size                       | MW demand forecast                                               | Demand chips                                     | ≈1,000 MW (F2)             | Industry              |
| 7      | Regulation                        | Data protection, ICASA licences (if network), EA                 | Pathway                                          | POPIA; ICASA               | ICT regulator         |

**(d) Trader chain answered**

| **\#** | **Question**           | **Information types**                                      | **Map behaviour**       | **South African instance** | **Replication role** |
|--------|------------------------|------------------------------------------------------------|-------------------------|----------------------------|----------------------|
| 1      | Service                | CX/BPO, finance & accounting, IT services; mode 1/4 trade  | Service card            | BPESA                      | Industry body        |
| 2      | Talent supply          | Graduates, language skills, unemployed youth pools by city | Talent heat by metro    | QLFS                       | Labour statistics    |
| 3      | Buyers                 | UK, US, Australia clients                                  | Flow arrows             | 51.2 % UK, 30.4 % US (F3)  | Industry             |
| 4      | Incentives             | GBS incentive programme                                    | Brief                   | dtic                       | Industry ministry    |
| 5      | Connectivity and power | Fibre, redundancy, backup power                            | Fibre and outage layers | ICASA/utility              | —                    |
| 6      | Data protection        | POPIA, client-country rules (GDPR)                         | Brief                   | Information Regulator      | Data regulator       |
| 7      | Forex                  | Service export proceeds                                    | Brief                   | SARB                       | Central bank         |

**(e) Map stack**

| **Layer**                                    | **Levels** | **Geometry** | **Illumination / behaviour** |
|----------------------------------------------|------------|--------------|------------------------------|
| Data centres (generalised) and cloud regions | L0–L4      | Pin (S2)     | MW                           |
| Submarine cables and landings                | L0–L2      | Line/hexagon | Capacity                     |
| Fibre backbone                               | L0–L3      | Line (S2)    | Owner                        |
| Substations with capacity near metros        | L2–L5      | Square (S2)  | MW                           |
| BPO clusters and talent pools                | L2–L4      | Heat         | Jobs                         |
| Water stress                                 | L1–L4      | Raster       | Score                        |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                              |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Data centres (generalised) and cloud regions; Submarine cables and landings; Fibre backbone                                                                                     |
| L1 Region/Province | Data centres (generalised) and cloud regions; Submarine cables and landings; Fibre backbone; Water stress                                                                       |
| L2 District        | Data centres (generalised) and cloud regions; Submarine cables and landings; Fibre backbone; Substations with capacity near metros; BPO clusters and talent pools; Water stress |
| L3 Municipality    | Data centres (generalised) and cloud regions; Fibre backbone; Substations with capacity near metros; BPO clusters and talent pools; Water stress                                |
| L4 City/Town       | Data centres (generalised) and cloud regions; Substations with capacity near metros; BPO clusters and talent pools; Water stress                                                |
| L5 Site            | Substations with capacity near metros                                                                                                                                           |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                | **Why it matters** |
|-------------------------------------|--------------------|
| Latency to Europe/US                | Product fit        |
| Municipal electricity tariffs       | Opex               |
| Load-shedding/outage history        | Resilience         |
| Tax incentives for DCs \[VERIFY\]   | Economics          |
| Office space and rents in BPO nodes | Cost               |
| Security of sites                   | Risk               |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                   | **Evidence trigger**    | **Map placement**            | **Investment model** |
|------------|---------------------------------------------------|-------------------------|------------------------------|----------------------|
| ICT-W-O01  | Colocation/hyperscale data centre with wheeled RE | ≈1,000 MW pipeline (F2) | Gauteng/Cape Town            | Developer            |
| ICT-W-O02  | Edge data centres in secondary cities             | Latency                 | Durban/Gqeberha/Bloemfontein | Developer            |
| ICT-W-O03  | Dedicated RE + storage for DCs                    | Wheeling (F1)           | REDZ                         | IPP                  |
| ICT-W-O04  | Water-free cooling technology                     | Water stress            | Metros                       | Supply               |
| ICT-W-O05  | BPO centres in secondary cities                   | Talent pools (F3)       | Secondary cities             | Operator             |
| ICT-W-O06  | Skills academies for GBS                          | Target 500k jobs (F3)   | Metros                       | Training             |
| ICT-W-O07  | Subsea cable landing/colocation                   | Capacity                | Coast                        | Infrastructure       |
| ICT-W-O08  | Fibre to secondary towns                          | Coverage gaps           | Towns                        | Open-access          |
| ICT-W-O09  | Backup power/microgrids for office parks          | Outages                 | Metros                       | ESCO                 |
| ICT-W-O10  | Cybersecurity services hub                        | Demand                  | Metros                       | Service              |
| ICT-W-O11  | AI compute/GPU clusters                           | AI demand               | Metros                       | Developer            |
| ICT-W-O12  | Data-centre construction supply chain (MEP)       | DC build-out            | Metros                       | Contractors          |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**       |
|-------------------|-----------------------------------------------|
| Demand            | MW demand by tenant type                      |
| Power             | Supply, tariffs, wheeling, carbon             |
| Site              | Site scoring                                  |
| Financial         | Rent per kW, utilisation ramp, IRR            |
| Exhibits          | Connectivity map; MW pipeline; cost waterfall |

# W9. Construction, Real Estate & Housing (CRE)

**(a) Scenarios**

- **Investor: develop affordable/gap-market rental housing on
  well-located land in Gauteng**
- **Trader: import and distribute cement and building materials**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                     | **Value**                                                                                                                                                                                                                                                                    | **Source**                                                                                                                                                         | **Date**   |
|--------|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| CRE-F1 | Housing backlog              | More than 2.6 million units; over 4,000 informal settlements; City of Tshwane estimates ≈R32.5 bn needed to upgrade/relocate informal settlements                                                                                                                            | [IOL (Gauteng Partnership Fund, SALGA)](https://iol.co.za/business/property/2026-03-24-housing-crisis-deepens-in-south-africa-as-backlog-exceeds-2-million-homes/) | 2026-03-24 |
| CRE-F2 | Cement dumping investigation | ITAC found a prima facie case of dumping of cement from Vietnam (margin 37 %) and Mozambique (90 %); applicants Afrimat, Sephaku (Dangote) and Intercement; PPC building a R3 bn, 1.5 Mt/yr plant in the Western Cape; Mozambique adding capacity (US\$333 m for two plants) | [Business Day](https://www.businessday.co.za/news/2026-09-21-cement-dumping-margins-of-up-to-90-trigger-tariff-probe/)                                             | 2026-09-21 |

**(c) Investor chain answered**

| **\#** | **Question**        | **Information types**                                        | **Map behaviour**                                 | **South African instance**     | **Replication role**     |
|--------|---------------------|--------------------------------------------------------------|---------------------------------------------------|--------------------------------|--------------------------|
| 1      | Where is demand?    | Backlog by municipality; income bands; rental demand         | Backlog choropleth; informal settlements polygons | 2.6 m units (F1)               | Housing agency + census  |
| 2      | Well-located land   | Public land release, private parcels near transport and jobs | Parcel polygons with distance to rail/BRT         | HDA/municipal land registers   | Land agencies            |
| 3      | Bulk services       | Water, sewer, electricity capacity                           | Capacity zones                                    | Municipal infrastructure plans | Municipal utilities      |
| 4      | Subsidy and finance | FLISP/social housing grants, DFI lending                     | Brief                                             | Housing finance institutions   | Housing finance agencies |
| 5      | Approvals           | Rezoning, building plans, NHBRC enrolment                    | Pathway                                           | SPLUMA; NHBRC                  | Planning authority       |
| 6      | Costs               | Construction cost per m², materials                          | Benchmark panel                                   | Industry indices               | Quantity surveyors       |
| 7      | Risks               | Land invasions, construction mafia, payment defaults         | Risk heat                                         | SAPS/municipal                 | —                        |

**(d) Trader chain answered**

| **\#** | **Question**   | **Information types**                                   | **Map behaviour**                                             | **South African instance** | **Replication role** |
|--------|----------------|---------------------------------------------------------|---------------------------------------------------------------|----------------------------|----------------------|
| 1      | Product        | Portland cement HS 2523.29; clinker 2523.10; SANS 50197 | Product card                                                  | SARS; SABS                 | Customs + standards  |
| 2      | Supply         | Local plants, import terminals, origins                 | Plant and terminal pins; import flows from Vietnam/Mozambique | F2                         | Industry + customs   |
| 3      | Trade remedies | Anti-dumping investigation, provisional/final duties    | Alert on origin flows                                         | ITAC case (F2)             | Trade commission     |
| 4      | Demand         | Building activity by region                             | Demand bubbles                                                | Stats SA building plans    | Statistics           |
| 5      | Distribution   | Builders’ merchants network, rail/road costs            | Merchant pins; cost radius                                    | —                          | —                    |
| 6      | Compliance     | NRCS compulsory specification for cement                | Brief                                                         | NRCS                       | Regulator            |
| 7      | Risks          | Duties, price wars, quality                             | Alerts                                                        | F2                         | —                    |

**(e) Map stack**

| **Layer**                          | **Levels** | **Geometry** | **Illumination / behaviour** |
|------------------------------------|------------|--------------|------------------------------|
| Housing backlog by municipality    | L2–L3      | Choropleth   | Units                        |
| Informal settlements               | L3–L5      | Polygon      | Count                        |
| Available land parcels             | L4–L5      | Polygon (S1) | Availability                 |
| Bulk-services capacity zones       | L3–L5      | Polygon      | Spare capacity               |
| Transport (rail/BRT/taxi ranks)    | L3–L5      | Line/pin     | Access                       |
| Cement plants and import terminals | L0–L4      | Pin          | Capacity                     |
| Builders’ merchants                | L3–L5      | Pin          | —                            |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                                                            |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Cement plants and import terminals                                                                                                                                            |
| L1 Region/Province | Cement plants and import terminals                                                                                                                                            |
| L2 District        | Housing backlog by municipality; Cement plants and import terminals                                                                                                           |
| L3 Municipality    | Housing backlog by municipality; Informal settlements; Bulk-services capacity zones; Transport (rail/BRT/taxi ranks); Cement plants and import terminals; Builders’ merchants |
| L4 City/Town       | Informal settlements; Available land parcels; Bulk-services capacity zones; Transport (rail/BRT/taxi ranks); Cement plants and import terminals; Builders’ merchants          |
| L5 Site            | Informal settlements; Available land parcels; Bulk-services capacity zones; Transport (rail/BRT/taxi ranks); Builders’ merchants                                              |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                         | **Why it matters** |
|----------------------------------------------|--------------------|
| Rental yields by node                        | Returns            |
| Affordability by income band                 | Product design     |
| Construction permit times                    | Timeline           |
| Municipal billing reliability                | Opex               |
| Alternative building technology approvals    | Cost               |
| Security (construction disruption) incidents | Risk               |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                      | **Evidence trigger**    | **Map placement**    | **Investment model** |
|------------|------------------------------------------------------|-------------------------|----------------------|----------------------|
| CRE-W-O01  | Affordable rental (social/gap) developments          | Backlog (F1)            | Well-located parcels | Developer–DFI JV     |
| CRE-W-O02  | Informal settlement upgrading contracts              | 4,000 settlements (F1)  | Metros               | Programme contracts  |
| CRE-W-O03  | Bulk infrastructure PPPs                             | Service capacity        | Growth corridors     | Availability PPP     |
| CRE-W-O04  | Prefab/modular housing factory                       | Speed/cost              | Gauteng              | Manufacturing        |
| CRE-W-O05  | Building-material supply hubs in townships           | Distribution gaps       | Townships            | Retail               |
| CRE-W-O06  | Cement grinding/blending plant                       | Import competition (F2) | Coastal/inland       | Plant                |
| CRE-W-O07  | Bricks/blocks plants                                 | Demand                  | Growth nodes         | Plant                |
| CRE-W-O08  | Housing finance (rent-to-own, micro-mortgages)       | Gap market              | National             | Finance              |
| CRE-W-O09  | Land assembly and title regularisation services      | Title gaps              | Metros               | Service              |
| CRE-W-O10  | Student accommodation (see EDU)                      | Bed shortfall           | University towns     | Developer            |
| CRE-W-O11  | Construction security and community liaison services | Disruption              | Metros               | Service              |
| CRE-W-O12  | Green building retrofits                             | Energy cost             | Commercial stock     | ESCO                 |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**         |
|-------------------|-------------------------------------------------|
| Demand            | Backlog and affordability segmentation          |
| Site              | Land scoring (jobs/transport access)            |
| Product           | Unit mix, rents                                 |
| Financial         | Development appraisal; rental IRR               |
| Exhibits          | Backlog map; land matrix; feasibility waterfall |

# W10. Tourism & Hospitality (TOU)

**(a) Scenarios**

- **Investor: bid for a Kruger National Park lodge concession**
- **Trader (services): operate an inbound tour/destination-management
  company**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                 | **Value**                                                                                                                                                                                                                                                                   | **Source**                                                                                                                                       | **Date** |
|--------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| TOU-F1 | Tourist arrivals 2025    | 10.5 million tourists (+17.7 % on 8.9 m in 2024; 2.6 % above 2019); SADC 75.2 %, other Africa 1.9 %, overseas 22.8 % (overseas +11.9 %); average stay: overseas 14 days                                                                                                     | [Stats SA](https://www.statssa.gov.za/?p=19362)                                                                                                  | 2026     |
| TOU-F2 | Kruger lodge concessions | SANParks published six Kruger lodge concessions on 7 Jul 2026: Jock of the Bushveld, Mluwati, Lwakahle, Jakkalsbessie, Mpanamana, Mutlumuvi; Mluwati and Lwakahle RFPs close 5 Oct 2026; PPP fee to SANParks; B-BBEE key evaluation criterion; subject to Treasury approval | [InfraPPP World / SANParks](https://www.infrapppworld.com/update/sanparks-opens-six-kruger-national-park-lodge-concessions-to-private-investors) | 2026-07  |

**(c) Investor chain answered**

| **\#** | **Question**                    | **Information types**                                                       | **Map behaviour**                                  | **South African instance** | **Replication role** |
|--------|---------------------------------|-----------------------------------------------------------------------------|----------------------------------------------------|----------------------------|----------------------|
| 1      | Which concessions are on offer? | Concession sites, accommodation type, tender dates                          | Gold polygons inside Kruger with countdown badges  | Six concessions (F2)       | Parks authority PPP  |
| 2      | Demand                          | Arrivals by source market, park visitor numbers, occupancy                  | Flow arrows from source markets; park visitor chip | 10.5 m tourists (F1)       | Statistics office    |
| 3      | Access                          | Airports (Skukuza, Kruger Mpumalanga, Phalaborwa, Hoedspruit), gates, roads | Airport hexagons; gate pins; drive times           | ACSA/private airports      | Aviation             |
| 4      | Terms                           | Term, PPP fee, development obligations, B-BBEE                              | Brief                                              | F2                         | Parks + Treasury     |
| 5      | Environment                     | Ecological zoning, bed limits, water                                        | Zoning overlay                                     | SANParks management plan   | Parks                |
| 6      | Risks                           | Security, wildlife, seasonality, climate                                    | Risk layer                                         | —                          | —                    |

**(d) Trader chain answered**

| **\#** | **Question**   | **Information types**                                         | **Map behaviour**  | **South African instance** | **Replication role** |
|--------|----------------|---------------------------------------------------------------|--------------------|----------------------------|----------------------|
| 1      | Product        | Packaged tours, safaris, MICE                                 | Product card       | Tourism grading            | Tourism authority    |
| 2      | Source markets | Arrivals by country and growth                                | Source flows       | F1                         | Statistics           |
| 3      | Supply         | Hotels/lodges by grade, rates, availability                   | Accommodation pins | Grading council            | Tourism authority    |
| 4      | Regulation     | Tour operator registration, tourist guide registration, visas | Brief              | Tourism Act; Home Affairs  | —                    |
| 5      | Prices         | Seasonal rates, park fees                                     | Price chips        | SANParks tariffs           | Parks                |
| 6      | Payments/forex | Foreign currency receipts                                     | Brief              | SARB                       | Central bank         |
| 7      | Risks          | Safety perception, airline capacity                           | Alerts             | —                          | —                    |

**(e) Map stack**

| **Layer**                           | **Levels** | **Geometry** | **Illumination / behaviour** |
|-------------------------------------|------------|--------------|------------------------------|
| National parks and concession areas | L0–L5      | Polygon      | Tender glow                  |
| Lodges/hotels by grade              | L2–L5      | Pin          | Grade                        |
| Airports and air routes             | L0–L3      | Hexagon/flow | Frequency                    |
| Park gates and roads                | L3–L5      | Pin/line     | Condition                    |
| Visitor demand by source            | L0         | Flow         | Volume                       |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                         |
|--------------------|------------------------------------------------------------------------------------------------------------|
| L0 Country         | National parks and concession areas; Airports and air routes; Visitor demand by source                     |
| L1 Region/Province | National parks and concession areas; Airports and air routes                                               |
| L2 District        | National parks and concession areas; Lodges/hotels by grade; Airports and air routes                       |
| L3 Municipality    | National parks and concession areas; Lodges/hotels by grade; Airports and air routes; Park gates and roads |
| L4 City/Town       | National parks and concession areas; Lodges/hotels by grade; Park gates and roads                          |
| L5 Site            | National parks and concession areas; Lodges/hotels by grade; Park gates and roads                          |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                         | **Why it matters** |
|----------------------------------------------|--------------------|
| Occupancy and ADR by region                  | Revenue            |
| Air seat capacity by route                   | Demand             |
| Wildlife density by season                   | Product            |
| Water and power availability at remote sites | Opex               |
| Community partnership obligations            | Bid score          |
| Fire and flood risk                          | Risk               |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                              | **Evidence trigger**   | **Map placement** | **Investment model** |
|------------|----------------------------------------------|------------------------|-------------------|----------------------|
| TOU-W-O01  | Kruger lodge concessions                     | RFPs (F2)              | Kruger            | PPP concession       |
| TOU-W-O02  | Mid-scale branded hotels in secondary cities | Arrivals growth (F1)   | Secondary cities  | Developer/franchise  |
| TOU-W-O03  | SADC shopping and medical tourism services   | SADC 75.2 % (F1)       | Border cities     | Retail/health        |
| TOU-W-O04  | Air-route development partnerships           | Overseas +11.9 % (F1)  | Airports          | Route fund           |
| TOU-W-O05  | Heritage precinct redevelopment              | Cultural tourism       | Cities            | PPP                  |
| TOU-W-O06  | Eco-lodges on community land                 | Community partnerships | Rural             | JV                   |
| TOU-W-O07  | Tourism training academy                     | Skills                 | Regional          | Training             |
| TOU-W-O08  | Destination-management digital platform      | Inbound demand         | National          | Platform             |
| TOU-W-O09  | Renewable microgrids for lodges              | Remote power           | Parks             | ESCO                 |
| TOU-W-O10  | Film tourism packages (see CSP)              | Film                   | Locations         | Packages             |
| TOU-W-O11  | MICE venue upgrades                          | Business travel        | Metros            | PPP                  |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits** |
|-------------------|-----------------------------------------|
| Demand            | Source-market model; seasonality        |
| Site              | Concession/site analysis                |
| Product           | Room mix and rates                      |
| Financial         | RevPAR model; concession fee; IRR       |
| Exhibits          | Arrivals chart; concession map; P&L     |

# W11. Health & Pharmaceuticals (HLT)

**(a) Scenarios**

- **Investor: build a generic medicines or vaccine fill-finish plant**
- **Trader: import and distribute registered medicines**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                                 | **Value**                                                                                                                                                                                                                                                                                                   | **Source**                                                                                                                                                         | **Date**   |
|--------|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| HLT-F1 | Import dependence and targets            | About two-thirds of medicines used in South Africa are imported; heavy API import dependence; national target of 50 % of domestic market and 10 % of African market from local production by 2040; AU goal 60 % by 2040; vaccine cost-competitiveness needs ≈10 m doses/yr (premium) or ≈50 m (mass-market) | [Mining Weekly / Engineering News (TIPS dialogue)](https://www.miningweekly.com/article/pharma-localisation-runs-into-scale-and-affordability-barriers-2026-07-03) | 2026-07-03 |
| HLT-F2 | Regulatory fast-track for local products | SAHPRA policy (approved June 2025) to cut registration of locally manufactured vaccines from 360 to 180 working days; local products prioritised at standard fee                                                                                                                                            | [Business Day](https://www.businessday.co.za/bd/national/health/2025-07-15-sa-medicines-regulator-commits-to-halve-approval-time-for-local-manufacturers/)         | 2025-07-15 |

**(c) Investor chain answered**

| **\#** | **Question**                                | **Information types**                                     | **Map behaviour**             | **South African instance**      | **Replication role**  |
|--------|---------------------------------------------|-----------------------------------------------------------|-------------------------------|---------------------------------|-----------------------|
| 1      | What is imported and could be made locally? | Import values by product/API; tender volumes              | Gap heat by therapeutic class | Two-thirds imported (F1)        | Customs + procurement |
| 2      | Who buys?                                   | State tenders, private market, pooled African procurement | Tender pins; export flows     | National Dept of Health tenders | Procurement agency    |
| 3      | Registration time                           | SAHPRA timelines and fast-track rules                     | Pathway Gantt                 | 360 → 180 days (F2)             | Medicines regulator   |
| 4      | Site                                        | Pharma-grade utilities, water, power, SEZ                 | SEZ/plot layer                | dtic SEZs                       | Zone authority        |
| 5      | Scale economics                             | Minimum efficient scale                                   | Brief                         | 10 m / 50 m doses (F1)          | Industry studies      |
| 6      | Incentives                                  | Localisation designation, tender preferences              | Brief                         | Treasury designation \[VERIFY\] | Treasury              |
| 7      | Risks                                       | Tender rules, price regulation, API supply                | Alerts                        | F1                              | —                     |

**(d) Trader chain answered**

| **\#** | **Question** | **Information types**                     | **Map behaviour**          | **South African instance** | **Replication role** |
|--------|--------------|-------------------------------------------|----------------------------|----------------------------|----------------------|
| 1      | Product      | HS 3004 dosage forms; registration status | Product card               | SAHPRA register            | Regulator            |
| 2      | Licences     | Wholesale/distribution licence, GWP       | Pathway                    | SAHPRA                     | Regulator            |
| 3      | Pricing      | Single Exit Price, logistics fee          | Brief                      | Pricing regulations        | Health ministry      |
| 4      | Distribution | Warehouses, pharmacies, hospitals         | Facility pins              | DoH                        | Health ministry      |
| 5      | Import       | Port of entry, cold chain                 | Port hexagons; cold stores | SARS                       | Customs              |
| 6      | Risks        | Registration delays, tender loss          | Alerts                     | —                          | —                    |

**(e) Map stack**

| **Layer**                     | **Levels** | **Geometry** | **Illumination / behaviour** |
|-------------------------------|------------|--------------|------------------------------|
| Pharma plants (GMP status)    | L1–L5      | Pin          | Approval tag                 |
| Medical depots and cold chain | L1–L4      | Square       | Capacity                     |
| Health facilities by level    | L2–L5      | Pin          | Beds                         |
| Disease burden                | L1–L3      | Choropleth   | Rate                         |
| Export flows to SADC          | L0         | Flow         | Value                        |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                    |
|--------------------|-------------------------------------------------------------------------------------------------------|
| L0 Country         | Export flows to SADC                                                                                  |
| L1 Region/Province | Pharma plants (GMP status); Medical depots and cold chain; Disease burden                             |
| L2 District        | Pharma plants (GMP status); Medical depots and cold chain; Health facilities by level; Disease burden |
| L3 Municipality    | Pharma plants (GMP status); Medical depots and cold chain; Health facilities by level; Disease burden |
| L4 City/Town       | Pharma plants (GMP status); Medical depots and cold chain; Health facilities by level                 |
| L5 Site            | Pharma plants (GMP status); Health facilities by level                                                |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                | **Why it matters** |
|-------------------------------------|--------------------|
| Tender calendars and awarded prices | Revenue            |
| API supply sources                  | Risk               |
| WHO PQ status of plants             | Export             |
| Skills (pharmacists, QA)            | Operations         |
| Clinical trial sites                | R&D                |
| Cold-chain capacity                 | Vaccines           |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                                          | **Evidence trigger** | **Map placement**    | **Investment model** |
|------------|----------------------------------------------------------|----------------------|----------------------|----------------------|
| HLT-W-O01  | Generic medicines manufacturing (high-volume essentials) | Imports (F1)         | SEZs/industrial hubs | Greenfield/JV        |
| HLT-W-O02  | Vaccine fill-finish                                      | Fast-track (F2)      | Gauteng/Cape Town    | Tech-transfer JV     |
| HLT-W-O03  | API and intermediates production                         | API imports (F1)     | Chemical clusters    | Plant                |
| HLT-W-O04  | Regional pooled-procurement supply                       | AU 60 % goal (F1)    | Exports              | Supply contracts     |
| HLT-W-O05  | Medical consumables manufacturing                        | Imports              | Industrial hubs      | Plant                |
| HLT-W-O06  | Cold-chain logistics for medicines                       | Vaccines             | National             | Logistics            |
| HLT-W-O07  | Day hospitals and diagnostics in secondary towns         | Access gaps          | Secondary towns      | Operator             |
| HLT-W-O08  | Contract research/clinical trials                        | R&D                  | Metros               | Service              |
| HLT-W-O09  | Bioequivalence/testing laboratories                      | Registration         | Metros               | Lab                  |
| HLT-W-O10  | Pharmacy and dispensing networks                         | Access               | Townships            | Retail               |
| HLT-W-O11  | Health-tech/telemedicine                                 | Rural access         | Rural                | Platform             |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**        |
|-------------------|------------------------------------------------|
| Market            | Import substitution sizing by product          |
| Regulatory        | Registration path and timeline                 |
| Operations        | Plant design, capacity, GMP                    |
| Financial         | Unit cost vs import; tender scenarios          |
| Exhibits          | Import gap chart; regulatory Gantt; cost curve |

# W12. Education & Skills (EDU)

**(a) Scenarios**

- **Investor: develop purpose-built student accommodation (PBSA) near
  universities and TVET colleges**
- **Trader (services): recruit and serve international students
  (education services export)**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                | **Value**                                                                                                                                                                                                                                                                                                  | **Source**                                                                                                                                                        | **Date**   |
|--------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| EDU-F1 | Student beds and demand | Public university enrolment \>1.1 m (2026); university bed capacity ≈525,000–527,000 (university-owned ≈125,000–135,000; leased ≈68,000; private accredited ≈332,000); TVET-owned shortfall 76,574 beds (Mar 2026 survey); NSFAS accommodation funding 2023–2026: R18 bn (universities) and R3.5 bn (TVET) | [Sunday Tribune](https://sundaytribune.co.za/news/2026-09-01-focus-on-student-housing-costs-shortages-and-nsfas/)                                                 | 2026-09-01 |
| EDU-F2 | Shortfall headline      | Over 500,000-bed shortfall reported for PBSA                                                                                                                                                                                                                                                               | [IOL](https://iol.co.za/dailynews/news/2025-02-05-purpose-built-student-accommodation-shortage-500-000-beds-shortfall/)                                           | 2025-02-05 |
| EDU-F3 | International students  | International enrolment fell by more than a third between 2014 and 2021 (Stats SA), attributed to protests, Covid-19 and visa problems                                                                                                                                                                     | [Research Professional News](https://www.researchprofessionalnews.com/rr-news-africa-south-2024-4-international-student-numbers-drop-by-a-third-in-south-africa/) | 2024       |

**(c) Investor chain answered**

| **\#** | **Question**           | **Information types**                                     | **Map behaviour**               | **South African instance**           | **Replication role**      |
|--------|------------------------|-----------------------------------------------------------|---------------------------------|--------------------------------------|---------------------------|
| 1      | Where is the shortage? | Beds vs enrolment per campus; TVET shortfalls             | Campus pins with bed-gap bubble | F1, F2 (conflicting estimates shown) | Higher-education ministry |
| 2      | Who pays rent?         | NSFAS caps, accreditation, payment record; private payers | Brief                           | NSFAS funding (F1)                   | Student-funding agency    |
| 3      | Site                   | Walking distance/transport to campus, zoning              | Isochrones around campuses      | Municipal                            | Municipal                 |
| 4      | Accreditation          | Institution and NSFAS accreditation standards             | Pathway                         | Accreditation rules \[VERIFY\]       | Education ministry        |
| 5      | Costs                  | Cost per bed                                              | Benchmark panel                 | Industry                             | QS                        |
| 6      | Risks                  | Payment delays, protests, regulation of rents             | Alerts                          | —                                    | —                         |

**(d) Trader chain answered**

| **\#** | **Question**   | **Information types**                     | **Map behaviour** | **South African instance** | **Replication role** |
|--------|----------------|-------------------------------------------|-------------------|----------------------------|----------------------|
| 1      | Service        | Degrees, short courses, online programmes | Service card      | —                          | —                    |
| 2      | Source markets | International students by country         | Flow arrows       | Decline since 2014 (F3)    | Statistics           |
| 3      | Visas          | Study permit process and timelines        | Brief             | Home Affairs               | Immigration          |
| 4      | Accommodation  | Beds for international students           | Campus pins       | F1                         | —                    |
| 5      | Fees and forex | International fee levels; payment rules   | Brief             | Universities; SARB         | —                    |
| 6      | Risks          | Visa delays, protests                     | Alerts            | F3                         | —                    |

**(e) Map stack**

| **Layer**                      | **Levels** | **Geometry**   | **Illumination / behaviour** |
|--------------------------------|------------|----------------|------------------------------|
| Universities and TVET campuses | L1–L5      | Pin            | Enrolment                    |
| Bed gap per campus             | L3–L5      | Bubble         | Beds short                   |
| Accredited private residences  | L4–L5      | Pin            | Accredited                   |
| Transport to campus            | L4–L5      | Line/isochrone | Minutes                      |
| Land parcels near campuses     | L4–L5      | Polygon (S1)   | Availability                 |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                                 |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | —                                                                                                                                  |
| L1 Region/Province | Universities and TVET campuses                                                                                                     |
| L2 District        | Universities and TVET campuses                                                                                                     |
| L3 Municipality    | Universities and TVET campuses; Bed gap per campus                                                                                 |
| L4 City/Town       | Universities and TVET campuses; Bed gap per campus; Accredited private residences; Transport to campus; Land parcels near campuses |
| L5 Site            | Universities and TVET campuses; Bed gap per campus; Accredited private residences; Transport to campus; Land parcels near campuses |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                         | **Why it matters** |
|----------------------------------------------|--------------------|
| NSFAS accommodation cap by region \[VERIFY\] | Revenue            |
| Rental benchmarks                            | Pricing            |
| Campus expansion plans                       | Demand             |
| Safety around campuses                       | Risk               |
| Bulk services near campuses                  | Feasibility        |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                            | **Evidence trigger**   | **Map placement** | **Investment model** |
|------------|--------------------------------------------|------------------------|-------------------|----------------------|
| EDU-W-O01  | PBSA near high-gap campuses                | Bed gaps (F1, F2)      | University towns  | Developer/REIT       |
| EDU-W-O02  | TVET college residences                    | 76,574 shortfall (F1)  | TVET campuses     | PPP                  |
| EDU-W-O03  | Conversion of offices to student housing   | Vacancies              | CBDs              | Redevelopment        |
| EDU-W-O04  | Student housing management platforms       | Payments/accreditation | National          | Platform             |
| EDU-W-O05  | Private schools in growth suburbs          | Enrolment pressure     | Metros            | School chain         |
| EDU-W-O06  | Private TVET in scarce skills              | Skills gaps            | Industrial hubs   | Training             |
| EDU-W-O07  | International student recruitment services | Decline (F3)           | Source markets    | Agency               |
| EDU-W-O08  | Online/blended degree platforms            | Access                 | National          | Platform             |
| EDU-W-O09  | Campus energy and water efficiency         | Costs                  | Campuses          | ESCO                 |
| EDU-W-O10  | Student transport services                 | Access                 | University towns  | Operator             |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**      |
|-------------------|----------------------------------------------|
| Demand            | Bed-gap model per campus                     |
| Revenue           | Rent caps, occupancy ramp                    |
| Site              | Proximity and safety scoring                 |
| Financial         | Yield on cost; IRR                           |
| Exhibits          | Campus gap map; rent vs cap chart; cash-flow |

# W13. Financial Services & Fintech (FIN)

**(a) Scenarios**

- **Investor: launch or acquire an SME lending/fintech platform**
- **Trader (finance): provide trade and receivables finance to exporters
  into SADC**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                  | **Value**                                                                                                                       | **Source**                                                                                                                                                        | **Date**   |
|--------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| FIN-F1 | SME credit gap            | IFC estimate ≈R509 bn (≈US\$30 bn); ≈2.5 m SMEs (≈98.5 % of businesses); ≈780,000 formal and ≈2 m informal firms affected (NCR) | [McKinsey (citing IFC, NCR)](https://www.mckinsey.com/featured-insights/middle-east-and-africa/a-credit-lifeline-how-banks-can-serve-smes-in-south-africa-better) | 2020-12-11 |
| FIN-F2 | Newer estimate (headline) | R350 bn SME funding gap discussed (2025)                                                                                        | [Business Day podcast](https://www.businessday.co.za/bd/economy/2025-07-04-podcast-sas-r350bn-sme-funding-gap/)                                                   | 2025-07-04 |
| FIN-F3 | Exports to Africa         | US\$31.2 bn (2024); SADC 91 % of intra-African exports; Mozambique, Botswana, Namibia and Zimbabwe ≈59 %                        | [tralac](https://www.tralac.org/documents/publications/trade-data-analysis/6024-south-africa-intra-africa-trade-update-2024/file.html)                            | 2024       |

**(c) Investor chain answered**

| **\#** | **Question**        | **Information types**                                         | **Map behaviour**     | **South African instance**                   | **Replication role**        |
|--------|---------------------|---------------------------------------------------------------|-----------------------|----------------------------------------------|-----------------------------|
| 1      | How big is the gap? | SME credit gap by segment/province                            | Gap choropleth        | R509 bn vs R350 bn — conflict shown (F1, F2) | Development finance studies |
| 2      | Where are the SMEs? | Business density, informal enterprises                        | Business density heat | Stats SA; CIPC                               | Registry/statistics         |
| 3      | Licensing           | Credit provider registration (NCR), banking licence, payments | Pathway               | NCR; Prudential Authority                    | Regulators                  |
| 4      | Data                | Credit bureaux, open-banking, invoice data                    | Brief                 | Credit bureaux                               | Credit info                 |
| 5      | Funding             | Wholesale funding, guarantees (e.g. SEFA), DFIs               | Funder footprint      | DFIs                                         | DFIs                        |
| 6      | Risks               | Default, fraud, regulation of rates                           | Brief                 | —                                            | —                           |

**(d) Trader chain answered**

| **\#** | **Question**      | **Information types**                                                   | **Map behaviour** | **South African instance** | **Replication role** |
|--------|-------------------|-------------------------------------------------------------------------|-------------------|----------------------------|----------------------|
| 1      | Market            | Export flows into SADC by product and country                           | Flow arrows       | US\$31.2 bn (F3)           | Trade data           |
| 2      | Instruments       | LCs, invoice discounting, supply-chain finance, export credit insurance | Brief             | Banks; ECIC                | ECA                  |
| 3      | Counterparty risk | Importer-country risk, FX convertibility                                | Country risk fill | Rating agencies            | —                    |
| 4      | Payments          | Settlement rails, PAPSS/SADC-RTGS \[VERIFY\]                            | Brief             | SARB                       | Central bank         |
| 5      | Regulation        | Exchange control for trade finance                                      | Brief             | SARB                       | Central bank         |

**(e) Map stack**

| **Layer**                  | **Levels** | **Geometry**    | **Illumination / behaviour** |
|----------------------------|------------|-----------------|------------------------------|
| SME density and credit gap | L1–L3      | Heat/choropleth | Gap                          |
| Bank branches/agents       | L3–L5      | Point           | Density                      |
| Export flows to SADC       | L0         | Flow            | Value                        |
| Country risk               | L0         | Choropleth      | Score                        |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                               |
|--------------------|--------------------------------------------------|
| L0 Country         | Export flows to SADC; Country risk               |
| L1 Region/Province | SME density and credit gap                       |
| L2 District        | SME density and credit gap                       |
| L3 Municipality    | SME density and credit gap; Bank branches/agents |
| L4 City/Town       | Bank branches/agents                             |
| L5 Site            | Bank branches/agents                             |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                 | **Why it matters**   |
|--------------------------------------|----------------------|
| Default rates by sector              | Pricing              |
| Invoice payment days of large buyers | Supply-chain finance |
| Guarantee schemes                    | Risk sharing         |
| Digital payment adoption             | Distribution         |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                              | **Evidence trigger** | **Map placement**  | **Investment model** |
|------------|----------------------------------------------|----------------------|--------------------|----------------------|
| FIN-W-O01  | SME lending platform (invoice/asset finance) | Credit gap (F1)      | Metros/townships   | Fintech/NBFI         |
| FIN-W-O02  | Supply-chain finance for corporate suppliers | Payment delays       | Metros             | Platform             |
| FIN-W-O03  | Trade finance for SADC exporters             | Exports (F3)         | Border/port cities | Fund/bank            |
| FIN-W-O04  | Warehouse-receipt and collateral finance     | Agri trade           | Grain regions      | NBFI                 |
| FIN-W-O05  | Credit guarantee co-funds                    | Risk                 | National           | DFI partnership      |
| FIN-W-O06  | Township merchant acquiring and payments     | Cash economy         | Townships          | Fintech              |
| FIN-W-O07  | Insurance for SMEs                           | Coverage             | National           | Insurer              |
| FIN-W-O08  | Equipment leasing for construction/agri      | Asset finance        | Regional           | Lessor               |
| FIN-W-O09  | Cross-border remittance/payment services     | SADC flows           | Border corridors   | Fintech              |
| FIN-W-O10  | Infrastructure debt funds                    | Pipeline             | National           | Fund                 |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits** |
|-------------------|-----------------------------------------|
| Market            | Gap sizing and segmentation             |
| Product           | Credit model, pricing                   |
| Regulation        | Licences                                |
| Financial         | Loan book model, losses, funding        |
| Exhibits          | Gap map; unit economics; loss curve     |

# W14. Trade, Distribution & Retail (TRD)

**(a) Scenarios**

- **Investor: build a regional distribution centre serving SADC
  markets**
- **Trader: export FMCG products to Mozambique, Zimbabwe, Zambia and
  other SADC markets**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**                    | **Value**                                                                                                                                                                                                          | **Source**                                                                                                                             | **Date** |
|--------|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|----------|
| TRD-F1 | SA exports to Africa (2024) | US\$31.2 bn; SACU 36 % and SADC (excl. SACU) 55 % of exports to Africa; SADC 91 % overall; Mozambique, Botswana, Namibia and Zimbabwe ≈59 %; processed food, beverages, chemicals and consumer goods among exports | [tralac](https://www.tralac.org/documents/publications/trade-data-analysis/6024-south-africa-intra-africa-trade-update-2024/file.html) | 2024     |

**(c) Investor chain answered**

| **\#** | **Question**            | **Information types**                       | **Map behaviour**                         | **South African instance** | **Replication role** |
|--------|-------------------------|---------------------------------------------|-------------------------------------------|----------------------------|----------------------|
| 1      | Where should the DC be? | Corridor flows, border posts, transit times | Isochrones from Gauteng/Durban to borders | F1                         | Corridor data        |
| 2      | Demand                  | Exports by product and destination          | Flow arrows                               | F1                         | Trade data           |
| 3      | Land and zoning         | Logistics land near N1/N3/N4, rail          | Parcels near interchanges                 | Municipal                  | Municipal            |
| 4      | Bonded/customs status   | Bonded warehouse licensing                  | Pathway                                   | SARS                       | Customs              |
| 5      | Risks                   | Border delays, theft, FX in destinations    | Risk overlays                             | —                          | —                    |

**(d) Trader chain answered**

| **\#** | **Question**        | **Information types**                                | **Map behaviour**               | **South African instance** | **Replication role** |
|--------|---------------------|------------------------------------------------------|---------------------------------|----------------------------|----------------------|
| 1      | Products            | HS lines (food, beverages, household goods)          | Product cards                   | SARS                       | Customs              |
| 2      | Tariffs/preferences | SACU/SADC/AfCFTA rates, RoO                          | Destination fill                | Agreement schedules        | Trade ministry       |
| 3      | NTMs                | Import licences, standards, labelling in destination | Brief                           | Destination regulators     | —                    |
| 4      | Routes              | Beitbridge, Lebombo, Kazungula etc.; times and costs | Border hexagons with wait chips | BMA; corridor groups       | Border agencies      |
| 5      | Buyers              | Distributors and retailers in destination            | Brief                           | Directories                | —                    |
| 6      | Payment/forex       | Destination FX availability; SARB rules              | Country risk fill               | Central banks              | —                    |
| 7      | Risks               | Border queues, import bans, currency shortages       | Alerts                          | —                          | —                    |

**(e) Map stack**

| **Layer**                      | **Levels** | **Geometry** | **Illumination / behaviour** |
|--------------------------------|------------|--------------|------------------------------|
| Export flows by destination    | L0         | Flow         | Value                        |
| Border posts with wait times   | L0–L3      | Hexagon      | Minutes/hours                |
| Corridors                      | L0–L2      | Line         | Time colour                  |
| DCs and bonded warehouses      | L2–L5      | Square       | Capacity                     |
| Retail density in destinations | L1–L3      | Heat         | Outlets                      |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                 |
|--------------------|----------------------------------------------------------------------------------------------------|
| L0 Country         | Export flows by destination; Border posts with wait times; Corridors                               |
| L1 Region/Province | Border posts with wait times; Corridors; Retail density in destinations                            |
| L2 District        | Border posts with wait times; Corridors; DCs and bonded warehouses; Retail density in destinations |
| L3 Municipality    | Border posts with wait times; DCs and bonded warehouses; Retail density in destinations            |
| L4 City/Town       | DCs and bonded warehouses                                                                          |
| L5 Site            | DCs and bonded warehouses                                                                          |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**                   | **Why it matters** |
|----------------------------------------|--------------------|
| Border wait-time history               | Planning           |
| Destination FX availability            | Payment risk       |
| Retailer shelf access terms            | Market entry       |
| Truck availability and back-haul rates | Cost               |
| Counterfeit risk                       | Brand protection   |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                               | **Evidence trigger** | **Map placement**      | **Investment model** |
|------------|-----------------------------------------------|----------------------|------------------------|----------------------|
| TRD-W-O01  | Regional DC near Beitbridge/Lebombo corridors | SADC 91 % (F1)       | Corridor nodes         | Developer            |
| TRD-W-O02  | Bonded and cross-dock facilities              | Transit trade        | Borders/ports          | Operator             |
| TRD-W-O03  | FMCG distribution JVs in destination markets  | Exports (F1)         | Maputo, Harare, Lusaka | JV                   |
| TRD-W-O04  | E-commerce cross-border fulfilment            | Digital retail       | Metros                 | Platform             |
| TRD-W-O05  | Truck stops and secure parking on corridors   | Border queues        | Corridors              | Concession           |
| TRD-W-O06  | Trade-compliance services (RoO, NTMs)         | Complexity           | National               | Service              |
| TRD-W-O07  | Cold-chain distribution to SADC               | Food exports         | Corridors              | Logistics            |
| TRD-W-O08  | Township wholesale hubs                       | Informal retail      | Townships              | Wholesale            |
| TRD-W-O09  | Fresh produce market modernisation            | Markets              | Metros                 | PPP                  |
| TRD-W-O10  | Export credit and payment solutions (see FIN) | FX risk              | National               | Fintech              |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**            |
|-------------------|----------------------------------------------------|
| Market            | Destination demand and share                       |
| Route             | Corridor cost/time comparison                      |
| Compliance        | Tariffs, RoO, NTMs                                 |
| Financial         | Landed cost and margin; DC economics               |
| Exhibits          | Flow map; border wait chart; landed-cost waterfall |

# W15. Green Economy, Climate & Carbon (GRN)

**(a) Scenarios**

- **Investor: develop a carbon-offset project eligible under the South
  African Carbon Tax offset rules**
- **Trader: buy and sell carbon credits to carbon-tax payers**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**         | **Value**                                                                                            | **Source**                                                                                                | **Date** |
|--------|------------------|------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|----------|
| GRN-F1 | Carbon tax rate  | R308/tCO2e from 1 Jan 2026 (up from R236, ≈31 % increase); Phase 2 runs 2026–2030                    | [Anthesis (Budget 2026)](https://www.anthesisgroup.com/za/insights/south-african-carbon-tax-update-2026/) | 2026     |
| GRN-F2 | Offset allowance | Fuel-combustion emissions: 10 % → 15 %; process and fugitive emissions: 5 % → 10 % (from 1 Jan 2026) | [Anthesis](https://www.anthesisgroup.com/za/insights/south-african-carbon-tax-update-2026/)               | 2026     |

**(c) Investor chain answered**

| **\#** | **Question**                 | **Information types**                           | **Map behaviour**               | **South African instance**           | **Replication role**                 |
|--------|------------------------------|-------------------------------------------------|---------------------------------|--------------------------------------|--------------------------------------|
| 1      | Who needs offsets?           | Carbon-tax payers by sector and location        | Emitter pins sized by emissions | Tax at R308/t (F1)                   | Revenue authority/emissions registry |
| 2      | How much demand?             | Offset allowance × liable emissions             | Demand chip                     | 15 %/10 % allowance (F2)             | Treasury                             |
| 3      | Eligible project types       | Approved standards/methodologies, exclusions    | Brief                           | Carbon offset regulations \[VERIFY\] | Climate ministry                     |
| 4      | Where are projects possible? | Methane sources, degraded land, cookstove areas | Opportunity rasters             | —                                    | —                                    |
| 5      | Registration                 | Offset administration system, verification      | Pathway                         | DFFE offset system \[VERIFY\]        | Registry                             |
| 6      | Risks                        | Integrity, policy change, price                 | Alerts                          | —                                    | —                                    |

**(d) Trader chain answered**

| **\#** | **Question** | **Information types**                                       | **Map behaviour** | **South African instance**  | **Replication role** |
|--------|--------------|-------------------------------------------------------------|-------------------|-----------------------------|----------------------|
| 1      | Product      | Credits by standard, vintage, project type                  | Product card      | Registries                  | Registries           |
| 2      | Price        | Credit prices vs tax rate ceiling                           | Brief             | R308/t ceiling \[COMPUTED\] | Market data          |
| 3      | Buyers       | Carbon-tax payers                                           | Emitter pins      | F1                          | Registry             |
| 4      | Rules        | Eligibility, retirement, corresponding adjustments (Art. 6) | Brief             | —                           | —                    |
| 5      | Risks        | Disallowed credits, reputational                            | Alerts            | —                           | —                    |

**(e) Map stack**

| **Layer**                                 | **Levels** | **Geometry** | **Illumination / behaviour** |
|-------------------------------------------|------------|--------------|------------------------------|
| Large emitters (generalised)              | L0–L3      | Pin          | Emissions                    |
| Registered offset projects                | L1–L5      | Pin/polygon  | Credits                      |
| Methane sources (landfills, WWTWs, mines) | L2–L5      | Pin          | Potential                    |
| Degraded land/rangeland                   | L1–L4      | Raster       | Carbon potential             |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                                                           |
|--------------------|------------------------------------------------------------------------------------------------------------------------------|
| L0 Country         | Large emitters (generalised)                                                                                                 |
| L1 Region/Province | Large emitters (generalised); Registered offset projects; Degraded land/rangeland                                            |
| L2 District        | Large emitters (generalised); Registered offset projects; Methane sources (landfills, WWTWs, mines); Degraded land/rangeland |
| L3 Municipality    | Large emitters (generalised); Registered offset projects; Methane sources (landfills, WWTWs, mines); Degraded land/rangeland |
| L4 City/Town       | Registered offset projects; Methane sources (landfills, WWTWs, mines); Degraded land/rangeland                               |
| L5 Site            | Registered offset projects; Methane sources (landfills, WWTWs, mines)                                                        |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**  | **Why it matters** |
|-----------------------|--------------------|
| Emissions by facility | Demand             |
| Methodology pipeline  | Supply             |
| Verifier capacity     | Timeline           |
| Co-benefit metrics    | Premium pricing    |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                       | **Evidence trigger** | **Map placement**       | **Investment model** |
|------------|---------------------------------------|----------------------|-------------------------|----------------------|
| GRN-W-O01  | Landfill and WWTW methane projects    | Green Drop/landfills | Metros                  | Developer            |
| GRN-W-O02  | Rangeland/grassland carbon            | Land                 | Eastern Cape/Free State | Developer            |
| GRN-W-O03  | Energy-efficiency offset programmes   | Industry             | Industrial hubs         | ESCO                 |
| GRN-W-O04  | Carbon-credit trading desk/aggregator | Demand (F1, F2)      | Johannesburg            | Trading              |
| GRN-W-O05  | MRV and verification services         | Registration         | National                | Service              |
| GRN-W-O06  | Biogas from agricultural waste        | Feedstock            | Farming regions         | IPP                  |
| GRN-W-O07  | Mine methane capture                  | Mining               | Coal fields             | Developer            |
| GRN-W-O08  | Clean-cooking programmes              | Households           | Rural                   | Developer            |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits**       |
|-------------------|-----------------------------------------------|
| Demand            | Offset demand model                           |
| Supply            | Project pipeline and costs                    |
| Methodology       | Eligibility and yield                         |
| Financial         | Credit revenue vs cost                        |
| Exhibits          | Emitter map; supply curve; price vs tax chart |

# W16. Creative, Sports & Professional Services (CSP)

**(a) Scenarios**

- **Investor: build a film studio and post-production facility**
- **Trader (services): sell production services to foreign film and TV
  productions**

**(b) Sourced fact base — South Africa**

| **ID** | **Fact**              | **Value**                                                                                                                                                                                                                                       | **Source**                                                                                                    | **Date**   |
|--------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|------------|
| CSP-F1 | Film incentive status | Incentive introduced 2004; contingent liability ≈R2 bn (FY to Mar 2021) reduced to R473 m; no new approvals in 2024/25 and 2025/26; budget cut R136 m in 2023/24; government promised to address backlog (Feb 2026); industry protests Jan 2026 | [GroundUp](https://groundup.news/article/government-promises-to-fix-payment-backlog-choking-sa-film-industry) | 2026-02-17 |

**(c) Investor chain answered**

| **\#** | **Question**        | **Information types**                        | **Map behaviour**             | **South African instance**    | **Replication role** |
|--------|---------------------|----------------------------------------------|-------------------------------|-------------------------------|----------------------|
| 1      | Demand              | Foreign and local productions; spend         | Production location pins      | F1                            | Film commissions     |
| 2      | Incentive certainty | Approval and payment status                  | Alert banner                  | No new approvals 2024–26 (F1) | Industry ministry    |
| 3      | Site                | Studios, backlots, power, access to airports | Studio pins; airport distance | —                             | —                    |
| 4      | Talent and crews    | Crew availability by city                    | Talent heat                   | Industry                      | —                    |
| 5      | Risks               | Incentive delays, power                      | Alerts                        | F1                            | —                    |

**(d) Trader chain answered**

| **\#** | **Question** | **Information types**                           | **Map behaviour** | **South African instance** | **Replication role** |
|--------|--------------|-------------------------------------------------|-------------------|----------------------------|----------------------|
| 1      | Service      | Production services, locations, post-production | Service card      | —                          | —                    |
| 2      | Incentives   | Rebates for foreign productions                 | Brief             | F1                         | Industry ministry    |
| 3      | Permits      | Filming permits, work permits                   | Pathway           | Municipal film offices     | Municipal            |
| 4      | Locations    | Location library                                | Location pins     | Film commissions           | —                    |
| 5      | Forex        | Service receipts                                | Brief             | SARB                       | Central bank         |

**(e) Map stack**

| **Layer**                   | **Levels** | **Geometry** | **Illumination / behaviour** |
|-----------------------------|------------|--------------|------------------------------|
| Studios and post-production | L2–L5      | Pin          | Capacity                     |
| Filming locations           | L1–L5      | Pin          | Permit office                |
| Venues and stadiums         | L2–L5      | Pin          | Capacity                     |
| Creative clusters           | L3–L4      | Heat         | Firms                        |

**(f) What the map shows at each level**

| **Level**          | **Layers visible**                                                                     |
|--------------------|----------------------------------------------------------------------------------------|
| L0 Country         | —                                                                                      |
| L1 Region/Province | Filming locations                                                                      |
| L2 District        | Studios and post-production; Filming locations; Venues and stadiums                    |
| L3 Municipality    | Studios and post-production; Filming locations; Venues and stadiums; Creative clusters |
| L4 City/Town       | Studios and post-production; Filming locations; Venues and stadiums; Creative clusters |
| L5 Site            | Studios and post-production; Filming locations; Venues and stadiums                    |

**(g) Additional information types proposed by Opus 5.5**

| **Information type**              | **Why it matters** |
|-----------------------------------|--------------------|
| Permit turnaround by municipality | Scheduling         |
| Crew rates                        | Cost               |
| Equipment rental availability     | Logistics          |
| Insurance for productions         | Risk               |

**(h) Value-chain gap opportunities → country and sector Opportunities
lists**

| **Opp ID** | **Opportunity**                         | **Evidence trigger** | **Map placement**      | **Investment model** |
|------------|-----------------------------------------|----------------------|------------------------|----------------------|
| CSP-W-O01  | Studio and sound-stage complexes        | Production demand    | Cape Town/Johannesburg | Developer            |
| CSP-W-O02  | Post-production/VFX hubs                | Services export      | Metros                 | Operator             |
| CSP-W-O03  | Film-incentive finance (bridge funding) | Payment backlog (F1) | National               | Fund                 |
| CSP-W-O04  | Location services platforms             | Permits              | National               | Platform             |
| CSP-W-O05  | Equipment rental houses                 | Logistics            | Metros                 | Rental               |
| CSP-W-O06  | Stadium/venue concessions               | Utilisation          | Metros                 | PPP                  |
| CSP-W-O07  | Sports academies                        | Talent               | Metros                 | Operator             |
| CSP-W-O08  | Music and live-event venues             | Events               | Metros                 | Operator             |

**(i) Premium Report — sector additions to the 18-chapter standard**

| **Chapter focus** | **Sector-specific analyses / exhibits** |
|-------------------|-----------------------------------------|
| Demand            | Production pipeline                     |
| Incentives        | Value and certainty                     |
| Facility          | Stages, capex                           |
| Financial         | Utilisation model                       |
| Exhibits          | Location map; utilisation chart         |

# Summary, Gaps and Next Steps

| **Item**                          | **Count**                                               |
|-----------------------------------|---------------------------------------------------------|
| Sectors worked in this volume     | 16 (Agriculture and Transport were worked in Issue 2.0) |
| Worked examples                   | 32 (16 investor + 16 trader)                            |
| Sourced facts                     | 40                                                      |
| Chain answers (investor + trader) | 220                                                     |
| Map-stack layers                  | 92                                                      |
| New gap opportunities             | 190                                                     |

**Where public data is thinnest.** Some examples rest on fewer sourced
numbers, because the South African public data is thin or dated. These
are Finance (the SME gap estimates are from 2020, and the 2025 figure is
a headline only), Education (international student counts), and Creative
industries (incentive rates). Field and partner data should be
prioritised for these before the Premium Reports are produced.

**Conflicts shown, not resolved.** Two pairs of figures disagree and
both are displayed:

- SME credit gap: R509 bn (IFC, 2020) vs R350 bn (2025).
- Student-bed shortfall: different survey bases (F1 vs F2).

**Next steps \[PROPOSED\].**

1.  Load the `WX_` sheets into the Data Bank as opportunity and layer
    templates.
2.  Geocode the named sites from the sources: Kruger concessions, ZET
    terminal, Ngqura, the GCCA substations and the Green Drop plants.
3.  Commission L3 pre-feasibility reports for the five highest-scoring
    opportunities per sector.
4.  Replicate each example in the Wave-1 countries using the role table
    from Issue 2.0.

*End of Issue 2.1.*
