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

Structured data from the Deep Registers 2.1 workbook, the project briefs and the Botswana prototype is in `database/seeders/Sections/data/aiim/`.

## Requests and Status

| Request | Status | Where |
|---|---|---|
| Currency change does not update costs on /due-diligence/project | Done. Every Due Diligence price, add-on and external cost range now follows the currency selector. The same fix covers the shared price helpers in Advisory, Insights, Subscriptions, Retainers, Marketplace, Countries, Shop, Deal Room, AIIM and Sprint pages. Staff consoles under /admin stay in rand. | `resources/js/lib/money.ts`, `resources/js/Components/DisplayCurrency.tsx` |
| Languages not working, Arabic right to left | Done for the site shell, navigation, home, contact and offices pages in Afrikaans, Portuguese, Chinese, French, Swahili and Arabic. Arabic switches the whole layout to right to left. Other page bodies fall back to English until their text is translated. | `lang/*.json`, `resources/js/lib/i18n.ts` |
| KP Thought Leadership and Webinars tabs need dropdown menus | Done | `app/Support/Content/Navigation.php` |
| Find Webinars not working; build the webinar mockups | Done. Search and filters work; all 29 mockup screens are built, including the staff consoles. | `/webinars`, `/admin/webinars` |
| KP Thought Leadership: all 72 pages | 13 working pages built on a content register. The rest waits for KP's mockups and articles. The article link in KP's email pointed back to the site, so the articles still need to be sent. | `/kp-thought-leadership`, `app/Support/Content/KpThoughtLeadership.php` |
| Contact: two more country offices, then "View all other Country Offices" | Done. Botswana and Mauritius are shown under Head Office, with a link to the new offices page. | `/contact`, `/contact/offices` |
| VDR enquiry: transaction types | Done. The five groups and 19 types are in the form. | `/virtual-deal-room/enquiry` |
| VDR enquiry: Indicative Raise bands that follow the currency | Done. The bands are set in rand and shown in the selected currency. | `resources/js/lib/moneyBands.ts` |
| AIIM: all 54 countries, drill down to region, district, city, municipality and town | Done. Every country has a map with drill-down. Detail exists where data was supplied (Botswana, South Africa, Malawi, Madagascar). Other countries show "data pending". | `/aiim`, `/aiim/country/{slug}` |
| AIIM project briefs on the map and Opportunities tab | Done. 26 briefs plus 28 screened-out projects from the screening register. | Country page, Opportunities tab |
| Botswana country pack and Deep Registers | Loaded: places, border gateways, hotspots, institutions, products, 18 sector examples, opportunity register, map layers and investor and trader questions. | Country page tabs |
| Intelligent, multi-layered, multi-lingual maps (windy.com, finviz.com/map) | Done. The map has a layer switcher, a detail slider and labels in English or Setswana. The heat map tab shows projects by sector. | Country page, Map and Heat map tabs |
| Zoho One configured for 90 percent automation | The Laravel side is built and switched off until credentials are added: event ledger, sync to CRM, Books, Desk, Projects, WorkDrive and Creator, signed webhooks, and an automation coverage report. The setup inside the Zoho tenant still has to be done by an administrator. | `docs/INTEGRATIONS_PLAN.md` section 18, `/admin/integrations` |
| Due Diligence: explore VOVE ID | Done. A VOVE ID provider for identity, AML and KYB checks, with a simulated default. | `docs/INTEGRATIONS_PLAN.md` section 8 |
| Online Shop: upload all 7008 Sprints and generate pictures | Not started. The 7008 Sprint records and the image budget are needed first. | |
| TEST DATA 3 in Google Drive | Not found in the shared Drive. KP needs to send the link. | |

## What KP Still Needs to Send

1. The Drive link to the KP Thought Leadership articles.
2. The mockups for the 72 KP Thought Leadership pages.
3. The link to TEST DATA 3.
4. Country packs for the other countries (Malawi, Ghana, Nigeria, Egypt, Morocco, South Africa, Algeria) and boundary data below district level.
5. Confirmed sites for the 9 project briefs that have placeholder coordinates.
6. The full 7008 Sprint register.
