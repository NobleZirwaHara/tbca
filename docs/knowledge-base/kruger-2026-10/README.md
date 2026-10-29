# Client Requests 8 to 12 October 2026

Kruger Phiri (KP) sent ten emails between 8 and 12 October 2026. This folder holds what he sent and records what was built for each request.

## Source Files

| File | What it is |
|---|---|
| sources/emails.md | Every email, with links and attachment names |
| sources/review-8-oct-2026.md | Review of TBCA WebApp, 8 Oct 2026 |
| sources/botswana-country-pack-bw-1.0.md | AIIM Botswana Country Pack BW-1.0 (Drive, AIIM COUNTRIES/BOTSWANA) |
| sources/aiim-sector-worked-examples-2.1.md | AIIM Sector Worked Examples 2.1 |
| sources/aiim-deep-information-catalogue-2.0.md | AIIM Deep Information Catalogue 2.0 |
| sources/decision-and-information-tree-booklet.txt | Decision and Information Tree Booklet: AIIM vs Countries |
| sources/zoho-one-implementation-guide.txt | TBCA Zoho One Implementation Guide, 11 Oct 2026 |
| sources/kp-teb-v2.0-consolidated-blueprint.txt | KP Thought Leadership TEB v2.0 Consolidated Blueprint (Drive folder "KP Thought Leadership", shared 13 Oct 2026) |
| public/pages/KP Thought Leadership/ | KP's 48 page mockups from the same folder (47 numbered screens plus the landing page) |
| sources/kp-articles/ | KP's 37 articles from the Drive folder "ARTICLES-KP THOT LEADERSHIP" (email "KP THOT LEADERSHIP ARTICLES", 18 Oct 2026), converted from Word to Markdown: `founders-notes/` (10), `insights/` (19) and `resources/` (8) |
| TBCA_Master_Register_Corrected.xlsx | Registry of Deliverables, TBCA Deliverables Resources File MP-DEL-2.0 (25 Oct 2026). Exported to `database/seeders/Sections/data/deliverables/` by `export_register.py` |

Structured data from the Deep Registers 2.1 workbook, the project briefs and the Botswana prototype is in `database/seeders/Sections/data/aiim/`.

## Requests and Status

| Request | Status | Where |
|---|---|---|
| Currency change does not update costs on /due-diligence/project | Done. Every Due Diligence price, add-on and external cost range now follows the currency selector. The same fix covers the shared price helpers in Advisory, Insights, Subscriptions, Retainers, Marketplace, Countries, Shop, Deal Room, AIIM and Sprint pages. Staff consoles under /admin stay in rand. | `resources/js/lib/money.ts`, `resources/js/Components/DisplayCurrency.tsx` |
| Languages not working, Arabic right to left | Done for the site shell, navigation, home, contact and offices pages in Afrikaans, Portuguese, Chinese, French, Swahili and Arabic. Arabic switches the whole layout to right to left. Other page bodies fall back to English until their text is translated. | `lang/*.json`, `resources/js/lib/i18n.ts` |
| KP Thought Leadership and Webinars tabs need dropdown menus | Done | `app/Support/Content/Navigation.php` |
| Find Webinars not working; build the webinar mockups | Done. Search and filters work; all 29 mockup screens are built, including the staff consoles. | `/webinars`, `/admin/webinars` |
| KP Thought Leadership: all 72 pages | Done. KP's folder held the TEB v2.0 blueprint and 48 page mockups (47 numbered screens plus the landing page; there is no mockup for screens 021, 049, 050 or the 22 staff consoles). All 72 blueprint screens are built: 50 public screens, including Future Builders, and 22 governance consoles for staff. Screens without a mockup follow the blueprint. KP's article texts arrived on 18 Oct 2026 and are now published (next row). The design's Founder statistics (20+ years, 1,000+ projects, 54 countries, 10,000+ entrepreneurs) stay hidden until evidence is approved (blueprint 12.5). | `/kp-thought-leadership`, `/admin/kp`, `app/Support/Content/KpThoughtLeadership.php`, `app/Support/Content/KpTools.php` |
| KP Thought Leadership articles (18 Oct 2026): "Herewith all the articles. Put them in the right categories." | Done. All 37 articles are published in full, in the section matching their Drive folder: 10 in Founder's Notes, 19 in Insights and 8 in KP Resources (as "Articles by Kruger Phiri"). Each page shows the full text with its headings, tables and closing quotes, the byline as the document states it (Kruger Phiri for Founder's Notes and Resources, The Business Clinic.Africa for Insights), the date from the document, reading time, topic chips, country chips, the sources and notes as written, share links, a print view and related articles. Every article is tagged with the KP topics, and country articles appear on the Africa Lens (Nigeria, Kenya, South Africa, Burkina Faso). Search and filters cover the full text. The 29 title-only placeholders from KP's designs were the same articles and were replaced by the real texts; none was removed without a replacement. The texts load into the database through a seeder and a migration, so a deploy that runs `migrate` publishes them. | `/kp-thought-leadership/insights`, `/kp-thought-leadership/founders-notes`, `/kp-thought-leadership/resources`, `database/seeders/Sections/data/kp-articles/`, `app/Support/Content/KpArticles.php` |
| Contact: two more country offices, then "View all other Country Offices" | Done. Botswana and Mauritius are shown under Head Office, with a link to the new offices page. | `/contact`, `/contact/offices` |
| VDR enquiry: transaction types | Done. The five groups and 19 types are in the form. | `/virtual-deal-room/enquiry` |
| VDR enquiry: Indicative Raise bands that follow the currency | Done. The bands are set in rand and shown in the selected currency. | `resources/js/lib/moneyBands.ts` |
| AIIM: all 54 countries, drill down to region, district, city, municipality and town | Done. Every country has a map with drill-down. Detail exists where data was supplied (Botswana, South Africa, Malawi, Madagascar). Other countries show "data pending". | `/aiim`, `/aiim/country/{slug}` |
| AIIM project briefs on the map and Opportunities tab | Done. 26 briefs plus 28 screened-out projects from the screening register. | Country page, Opportunities tab |
| Botswana country pack and Deep Registers | Loaded: places, border gateways, hotspots, institutions, products, 18 sector examples, opportunity register, map layers and investor and trader questions. | Country page tabs |
| Intelligent, multi-layered, multi-lingual maps (windy.com, finviz.com/map) | Done. The map has a layer switcher, a detail slider and labels in English or Setswana. The heat map tab shows projects by sector. | Country page, Map and Heat map tabs |
| Zoho One configured for 90 percent automation | The Laravel side is built and switched off until credentials are added: event ledger, sync to CRM, Books, Desk, Projects, WorkDrive and Creator, signed webhooks, and an automation coverage report. The setup inside the Zoho tenant still has to be done by an administrator. | `docs/INTEGRATIONS_PLAN.md` section 18, `/admin/integrations` |
| Due Diligence: explore VOVE ID | Done. A VOVE ID provider for identity, AML and KYB checks, with a simulated default. | `docs/INTEGRATIONS_PLAN.md` section 8 |
| INDUSTRIES (21 Oct 2026): "Please configure them to be 100% identical. Propagate that to all 54 Countries." | Done. The Industries tab now follows Kruger's "TBCA Industries Prototype" page for page: the same sub-navigation, 35 mock-up pages plus the deeper pages, 17 industries active in all 54 countries, an intersection page for each of the 918 pairs (Botswana in depth from the BW-1.0 registers, South Africa as the worked example, other countries from the continental registers with Modelled, Reference and Placeholder labels), the yellow Import and Export button with its four heat maps, the engagement journey and workspace, and the admin console. Prices come from the Sprint catalogue by code (7,450 of 7,589 codes match). | `/industries`, `/industries/heatmap`, `/admin/industries`, `docs/IMPLEMENTATION_STATUS.md` (Industries) |
| Online Shop: upload all 7008 Sprints and generate pictures | Sprints done. All 7,008 Sprints from the Volume 11 register are on the site: 1,652 matched existing pages and kept their content, 5,356 were added on the generic Sprint page. They are searchable in the shop and shelved in the 26 aisles, and the shop totals come from the data. Pictures: every Sprint shows a generated cover and has an `image_url` slot; no images were generated. The plan, prompt template and cost formula are ready for Noble's approval. | `docs/INTEGRATIONS_PLAN.md` section 19, `sprint-register-reconciliation.csv`, `database/seeders/Sections/data/sprint-register/` |
| Online Shop: industry aisles were empty | Done by rule. The register gives each Sprint a service aisle only, so the six industry aisles and Risk & Cybersecurity had no Sprints. Sprints now keep their home aisle and are also listed in these aisles when they name the industry or are general Sprints relevant to it (1,234 placements). TBCA can add or remove placements in an overrides file. | `industry-aisle-listings.csv`, `docs/IMPLEMENTATION_STATUS.md` (Industry aisle listings) |
| Registry of Deliverables (25 Oct 2026): every deliverable from each tab, with depth, page counts, trigger, workflow and the comparison with BCG, McKinsey and Deloitte | Done. All 8,318 deliverables, the Sprint crosswalk, standards, 30 safeguards, 17 payment-trigger loops, the HeyGen and Infogram specification and the 54-country matrix are loaded. Every Sprint page shows "What you will receive" for the chosen package. Staff search the register at `/admin/deliverables`. A paid Sprint order now records its deliverables and loop in the integration ledger. 7,577 of the 7,589 crosswalk codes (99.8%) match an app Sprint; the 12 that do not are internal operations. | `/admin/deliverables`, `docs/IMPLEMENTATION_STATUS.md` (Registry of Deliverables), `docs/INTEGRATIONS_PLAN.md` section 20 |
| TEST DATA 3 in Google Drive | Not found in the shared Drive. KP needs to send the link. | |

## What KP Still Needs to Send

1. KP Thought Leadership articles: all 37 sent on 18 Oct 2026 are published. Still open:
    - The Drive folders AFRICA LENS, BUSINESS CLINIC and SPEAKING AND MEDIA were empty. Send any articles meant for them.
    - Two articles carry a proposed publication date (19 Oct 2026 for the humanoids article and 20 Oct 2026 for the colonial master article). Confirm the dates.
    - The 19 Insights documents are bylined by The Business Clinic.Africa and are shown that way, with the Institutional Voice badge. Five of them spell it "The BusinessClinic.Africa" (no space): board-performance-diagnostic, cash-flow-is-a-behaviour-explainer, raising-capital-in-uncertain-times, strategy-is-easy-explainer and why-projects-fail-before-they-start. They are shown as written. Confirm whether the spelling should be corrected.
    - Every document ends with a disclosure note, for example "AI-assisted draft. Institutional human review and approval required before publication." The notes are published as written. Send final wording if they should change.
    - The documents contain no images. The articles use the site's generated topic covers until images are sent.
2. Evidence for the Founder statistics in the designs (years of experience, projects advised, countries engaged, entrepreneurs empowered), so they can be approved and shown.
3. Approved session fees for Work With Kruger and Book Kruger (the design figures are shown as indicative).
4. Approved Founder photographs as separate image files, and verified links for the speaking and media appearances.
5. Mockups for screens 021 (Boardroom Challenger), 049 (Freshness Badge), 050 (Correction Notice) and the 22 governance consoles, if they should differ from the blueprint build.
6. The link to TEST DATA 3.
7. Country packs for the other countries (Malawi, Ghana, Nigeria, Egypt, Morocco, South Africa, Algeria) and boundary data below district level.
8. Confirmed sites for the 9 project briefs that have placeholder coordinates.
9. Final prices for the 7,008 Sprints. The Volume 11 register marks its prices "confirm price", and 1,612 existing Sprint pages show prices that differ from it (see `sprint-register-reconciliation.csv`). The repriced Batch 4A, 4B and 4C v3 workbooks are in the Drive folder but are too large to download through the Drive connector; a direct download link or copies under 10 MB would let them be loaded.
10. Approval and budget for the Sprint cover images (`docs/INTEGRATIONS_PLAN.md` section 19).
11. An industry for each Sprint, or approval of the rule-based placement. The rule-based placement is live: review `industry-aisle-listings.csv` (aisle, reason, Sprint, home aisle and the rule that placed it). If KP sends an industry column for the register, it will replace the rules; single changes can go in `database/seeders/Sections/data/shop/aisle-overrides.csv`.
