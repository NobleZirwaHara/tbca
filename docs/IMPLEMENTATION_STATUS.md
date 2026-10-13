# TBCA Platform: Working Modules Guide

A guide to the modules that work on http://tbca.test: what each one does, how to try it, and the demo data you can use.

The plan for connecting external services (payment gateways, email and WhatsApp, the AI agents, translation and data feeds) is in [`docs/INTEGRATIONS_PLAN.md`](INTEGRATIONS_PLAN.md).

---

## Mockup coverage

**1,266 of the 1,351 original screens (94%) are implemented.** The screens are the PNGs in `public/pages/`.

The only screens not yet implemented are the 82 Countries screens and the `Countries_page` landing mockup in Front End Pages.

All 79 AIIM screens are built. AIIM mandate stages 7–15, the desks and the staff consoles are display-only for now.

| Folder | Screens | Implemented |
|---|---:|---:|
| 1.FRONT END PAGES | 1 | 1 |
| About TBCA | 39 | 39 |
| AIIM | 79 | 79 (some display-only) |
| Book a Discovery Call | 4 | 4 |
| Business Health Score | 9 | 9 |
| Client Portal | 137 | 137 |
| Countries | 82 | 0 |
| Digital Products | 29 | 29 |
| Due Diligence | 51 | 51 |
| Explore Sprints | 17 | 17 |
| Find Right Service | 16 | 16 |
| Front End Pages | 29 | 28 |
| Industries | 35 | 35 |
| KP Thought Leadership | 48 | 48 (plus 25 blueprint screens with no mockup) |
| Market Place | 34 | 34 |
| Navigating Sprints page | 24 | 24 |
| Navigating Through Due Diligence Tabs | 9 | 9 |
| Online Shop | 45 | 45 |
| Partner Services | 35 | 35 |
| Project Advisory | 20 | 20 |
| Retainers | 30 | 30 |
| Services | 31 | 31 |
| SPRINTS | 390 | 390 |
| Subscriptions | 32 | 32 |
| TBCA-Resources | 37 | 37 |
| Tech Solutions | 29 | 29 |
| Technology Set Up Sprints | 1 | 1 |
| Tools, Templates & Calculator | 8 | 8 |
| Virtual Deal Room | 50 | 50 |

Counts include a few duplicate image files in the source folders.

---

## Demo accounts

The password for every account is **`Password123!`**.

| Who | Login | Use it for |
|---|---|---|
| Demo client: Amahle Dlamini, AgriTech SA | `amahle@agritechsa.co.za` **or** Client ID `TBCA-C-000001` | Everything client-side. After login you land on `/portal/dashboard`. Almost all seeded records belong to this client. |
| Admin | `admin@thebusinessclinic.africa` (staff ID `TBCA-S-000001`) | `/admin` and every staff console |
| Marketplace provider: Thabo Mokoena, Alpha Finance Solutions | `provider@alphafinance.co.za` | Provider portal at `/marketplace/provider` |
| Partner: Dr. Lindiwe Maseko, EnviroImpact Solutions | `partner@enviroimpact.co.za` | Partner workspace at `/partner-services/workspace` |
| Investor: David M., Frontier Capital Partners | `david@frontiercap.mu` (Client ID `TBCA-C-000901`) | Investor party in the "Baobab Capital Raise" deal room |

## Test payment cards

The payment gateway is simulated. No money moves.

| Pay with | Result |
|---|---|
| Card number ending **0002** | Declined |
| Card number ending **0119** | Pending (3-D Secure) |
| Any other card number of 12+ digits | Approved |
| A shorter card number | Failed ("incomplete") |
| EFT | Pending until proof of payment |
| Wallet | Approved |

Every order adds VAT at 15% and a R250 platform fee. Card payments also carry a 1% bank charge.

## Known limitations

- **Payments:** the payment gateway is simulated.
- **Messages:** emails and WhatsApp messages are recorded but not sent. This covers invitations, reminders and notifications.
- **External integrations are not connected yet.** This covers payment gateways, email and WhatsApp, the AI agents, translation and data feeds. The plan is in `docs/INTEGRATIONS_PLAN.md`.
- **Translation:** menus, footer, home, contact and offices pages are translated into all 7 languages. Other page content shows in English until its keys are added to `lang/{locale}.json` (see `php artisan tbca:translations`).
- **Payment options:** 7 gateways and 11 methods are listed, but only card, EFT and wallet work today. The rest show "coming soon".
- **AI features are stand-ins:**
  - NATASHA, KAREN, MICHAELA and NIKIWE answer from built-in intent matchers.
  - The persona faces are illustrated placeholders.
  - The deal-room AI tools give deterministic answers.
  - Due Diligence vendor checks are simulated.
- **Downloads:** Due Diligence reports download as watermarked HTML files. Resources downloads are generated one-page PDFs.
- **Display-only parts of AIIM:** mandate stages 7–15, the enterprise, government, API and white-label desks, and staff actions in the `/admin/aiim` consoles. These pages render, but their buttons are disabled.
- **Placeholders:** SSO, passkey and "email me a link" sign-in.
- **Illustrative figures:**
  - Some Client Portal admin consoles show figures that are labelled as illustrative.
  - Some Marketplace admin KPIs are fixed values copied from the mockups.
- **Uploads (Marketplace and Partner Services):** only the file name is stored, not the file itself.
- **Provisional prices:**
  - Sprints that had a single price use it as Standard. Basic (60%) and Premium (150%) are derived until the Batch 4A–4C price lists are loaded.
  - Country service prices in Find the Right Service are indicative, to be confirmed.
  - AIIM country indicators are labelled placeholders.
- **Documents awaiting the client:**
  - The policies at `/policies` are drafts pending approval.
  - The Company Profile download only works once `public/docs/TBCA-Company-Profile.pdf` is added; until then `/resources/company-profile/download` returns 404.

---

## Platform-wide features

These are available on every page or across all modules.

- **Look and feel:**
  - Segoe UI font.
  - Rebuilt header logo, with separate sizes for the header and footer.
  - Subtle page backdrops.
  - Generated cover art on sprint, product and brief cards.
- **Language selector (header):** 7 languages: English, Afrikaans, Portuguese, Mandarin, French, Swahili and Arabic.
  - Switching re-renders the page in the new language without a reload, and the choice persists across pages.
  - Translated: header, all menus, mobile menu, footer, home page, contact page, offices page and the deal room transaction types. Untranslated text falls back to English.
  - Arabic switches the layout to right-to-left, mirrors arrows and loads the Noto Sans Arabic font.
  - Dictionaries: `lang/{af,pt,zh,fr,sw,ar}.json`. `php artisan tbca:translations` reports coverage.
- **Currency selector (header):**
  - 5 currencies: ZAR, USD, XOF, EUR and RMB.
  - Rates come from a live daily feed (open.er-api.com) and fall back to fixed rates in `config/tbca.php` if the feed fails.
  - Prices are always charged in ZAR. Other currencies are shown as "Charged in ZAR · approx.".
- **Notification bell:** shows the unread count and opens `/portal/notifications`.
- **Footer:**
  - Policies, Company Profile and social icons.
  - Contact details: Consult@thebusinessclinic.africa and WhatsApp +27 60 801 1365.
  - Platform badges: "Africa (Active)", "5 Currencies" and "7 Languages".
- **Assistants** (`resources/js/Components/Assistant/`). NATASHA, KAREN and MICHAELA each have an illustrated face, a choice of outfits and optional voice output with microphone input.

| Assistant | Where | What it does |
|---|---|---|
| NATASHA | Every page (floating button) | Quick actions, link cards and suggestion chips, plus a "talk to a specialist" handoff that saves the transcript and gives a reference |
| KAREN | Client Portal | Portal help |
| MICHAELA | Virtual Deal Room | Room-aware help that knows the current room and stage |
| NIKIWE | "WhatsApp / Talk" in the header | A secure-chat style session. You pick a topic and it routes you to the right Functional Lead mailbox (e.g. Due Diligence → advisorylead@…, Finance / Billing → financecontroller@…). It captures your details, saves the transcript (`/forms/whatsapp-chat`) with a reference, and offers "Continue on WhatsApp". |

- **Embedded services:**
  - 569 Batch 4D services (sprint type `embedded`, at 4D prices).
  - They appear inside Virtual Deal Room, Project Advisory, country profiles, Industries, Resources, KP Thought Leadership and Webinars.
  - Full lists by module are at `/embedded-services` and `/embedded-services/{module}`, e.g. `/embedded-services/virtual-deal-room`, `/embedded-services/project-advisory` and `/embedded-services/report-universe`.
- **Payment options:**
  - The checkout, basket and `/portal/payment-methods` list 7 gateways (Flutterwave, Paystack, Yoco, Pesapal, Onafriq, DPO Pay, Cellulant Tingg) and 11 methods.
  - Card, EFT and wallet work today; the rest show "coming soon".
- **Policies and company profile:**
  - `/policies` hub with these policies: refund-and-cancellation, cookies, popia-paia, acceptable-use, payments-and-billing.
  - Short links `/refund-policy`, `/cookie-policy` and `/paia` redirect to the matching policy.
  - The Company Profile page is `/resources/company-profile`.

---

## Modules

### Shared: sign-in, basket and checkout

- **What it does:** account sign-in and registration, a single basket, and one checkout used by every module.
- **Features:**
  - Login accepts an email or a Client ID.
  - Registration has 5 steps.
  - Basket, checkout, payment, processing and confirmation pages.
  - The basket and checkout list the payment options. Card, EFT and wallet work today.
  - Generic enquiry forms and bookings.
  - Saved items (heart icon) for signed-in users.
- **How to use:**
  1. Go to `/login` and sign in as the demo client.
  2. Add any priced item to the basket, then open `/basket`.
  3. Check out and pay with a test card. Use an ending of 0002 to see a decline.
  4. You go through `/checkout/{order}/processing` to the confirmation page.
- **URLs:** `/login`, `/register`, `/basket`, `/checkout/{order}`, `/checkout/{order}/confirmation`

### Home & core journeys

- **What it does:** the home page, landing pages and the self-service journeys.
- **Features:**
  - Book a Discovery Call, with My Meetings (reschedule, cancel, `.ics` calendar file).
  - Business Health Score: a multi-step assessment with save and resume, results and a download.
  - Tools, Templates & Calculators: browse, buy and download from a secure page.
  - Find the Right Service: a 4-stage finder that gives recommendations or a request for a person to help.
  - Countries inside Find the Right Service:
    - All 54 African countries and 5 regions are active and searchable.
    - Each country has its own page, with indicative service prices.
    - Corridor views.
  - Contact page:
    - Head Office and 12 Country Offices; clicking an office opens its Google Map.
    - Under Head Office: two featured country offices (Botswana, Mauritius), then "View all other Country Offices", which opens `/contact/offices` (all offices by region).
    - A directory of Functional Leads.
  - Diagnostics page with a walkthrough player.
- **How to use:**
  - **Book a call:** open `/discovery-call`, pick a slot, review and confirm. Signed-in clients can then manage it at `/discovery-call/meetings`.
  - **Health score:** open `/business-health-score`, answer each step and view your results.
  - **Tools:** open `/tools/calculators`, open a calculator, check out with a test card, then download from `/tools/my-downloads`.
  - **Finder:** open `/find-the-right-service` and answer the 4 stages to get recommendations.
  - **Countries:** open `/find-the-right-service/countries`, search for a country, then open its page, e.g. `/find-the-right-service/countries/ng` or `/countries/ke`.
  - **Contact:** open `/contact` and click an office to show its map.
- **URLs:**
  - Landing pages: `/`, `/contact`, `/contact/offices`, `/webinars`, `/kp-thought-leadership`, `/diagnostics`
  - Journeys: `/discovery-call`, `/business-health-score`, `/tools`, `/find-the-right-service`
  - Country and corridor views: `/find-the-right-service/countries/za`, `/find-the-right-service/corridors`
- **Demo data:**
  - Meetings `TBCA-MTG-DEMO-0001` to `0008` on the client's My Meetings page.
  - Paid order `TBCA-ORD-2026-DEMO01` (Loan Amortisation Calculator) with a download in `/tools/my-downloads`.
- **Admin:** `/admin/core-pages/corridors` (create corridors and change their state) and `/admin/core-pages/observations`.

### Sprints

- **What it does:** a catalogue of 1,850 fixed-scope "sprints", plus the 569 embedded services (see Platform-wide features). Each sprint type has its own product page template.
- **Features:**
  - Browse the catalogue: A–Z, category, audience and the featured, new, popular, recommended and marketplace views.
  - Fast search; the whole card is clickable; generated cover art on each card.
  - Sprint pages with 12 tabs: overview, packages, what's included, inputs required, process, deliverables, risk review, add-ons, reviews, FAQs, support, ask a question. The Inputs Required tab keeps the page hero.
  - Every sprint offers **Basic / Standard / Premium** packages:
    - For sprints that had a single price, Standard is that price, Basic is derived at 60% and Premium at 150%.
    - Confirmed prices go in `database/seeders/Sections/data/sprint-package-overrides.php`.
  - Add-on selection with live totals.
  - Ordering, quote requests and a success page.
- **How to use:**
  1. Log in as the demo client.
  2. Open `/sprints/business-plan-development-sprint` and choose a package (Basic, Standard or Premium).
  3. Click through to order. You land on `/sprints/{slug}/order`.
  4. Pay with any card number not ending 0002. You land on `/sprints/{slug}/success`.
  5. To ask for a quote instead, open `/sprints/{slug}/quote` or `/sprints/request-a-quote`.
- **URLs:** `/sprints`, `/sprints/a-z`, `/sprints/featured`, `/sprints/category/{category}`, `/sprints/for/{audience}`, `/sprints/{slug}`, `/sprints/{slug}/{tab}`
- **Demo data:** example sprint for each page template:

| Template | Sprints | Try |
|---|---:|---|
| Fixed scope | 468 | `/sprints/cash-flow-forecast-sprint` |
| Client service | 338 | `/sprints/workdrive-admin-support` |
| Checklist | 327 | `/sprints/crm-pipeline-setup-checklist-sprint` |
| Dashboard | 322 | `/sprints/executive-task-dashboard` |
| Technology setup | 97 | `/sprints/client-portal-onboarding-support` |
| Core service / AI advisory / diagnostic / premium service | 79 / 9 / 9 / 6 | `/sprints/business-plan-development-sprint` |
| Digital toolkit | 48 | `/sprints/executive-office-upgrade-pack` |
| Partner-delivered | 20 | `/sprints/enterprise-admin-desk-partner-reviewed-sprint` |
| Dashboard + data | 12 | `/sprints/executive-bi-command-centre-sprint` |
| Due diligence / trust | 12 | `/sprints/due-diligence-case-file-admin` |
| Implementation pack | 12 | `/sprints/crm-pipeline-setup-sprint` |
| Premium | 12 | `/sprints/board-secretariat-sprint` |
| Premium advisory feeder | 12 | `/sprints/project-sponsor-desk` |
| Quote route | 12 | `/sprints/enterprise-admin-desk-sprint` |
| Report | 12 | `/sprints/website-content-report-sprint` |
| Template | 12 | `/sprints/crm-setup-template-sprint` |
| Training | 12 | `/sprints/webinar-sales-funnel-sprint` |
| Retainer | 10 | `/sprints/ai-operations-retainer-dashboard-sprint` |
| Subscription | 9 | `/sprints/tech-support-subscription-dashboard-sprint` |

### Online Shop & site search

- **What it does:** one shop front for sprints, products, subscriptions and retainers, plus search across the whole site.
- **Features:**
  - Browse by aisle or A–Z, compare products (with export), and use a resolver to find the right product.
  - Product pages with configuration and licence details.
  - Free products and saved baskets.
  - Routes that don't use the basket: quote request → issued quote, marketplace brief, retainer proposal, and subscription mandate.
  - Receipts and entitlements after purchase.
- **How to use:**
  1. Open `/shop` and browse an aisle.
  2. Open a product, e.g. `/shop/product/ai-agents-playbook`, configure it and add it to the basket.
  3. Check out with a test card. The receipt and entitlements pages follow.
  4. Use `/search` from anywhere to search the site.
- **URLs:** `/shop`, `/shop/a-z`, `/shop/aisle/{aisle}`, `/shop/product/{product}`, `/shop/compare`, `/shop/resolver`, `/shop/saved-baskets`, `/shop/quote-request/{product}`, `/shop/marketplace-brief`, `/shop/retainer-proposal`, `/search`
- **Demo data:** the client's quote requests `TBCA-SUB-2026-QT0047` and `TBCA-SUB-2026-QT0052`, and issued quote `TBCA-QTE-2026-000047` (Cybersecurity Risk Assessment).
- **Admin (Shop Control Tower):** `/admin/shop` plus `orders`, `quotes`, `pricing`, `product-master`, `variants`, `versions`, `releases`, `listing-gate`, `listing-state`, `licences`, `entitlements`, `subscriptions`, `retainers`, `marketplace`, `handoffs`, `reconciliation`, `duplication`, `routes`, `audit`

### Digital Products

- **What it does:** sells licensed toolkits, reports, templates and courses, and keeps the buyer's library of versioned downloads.
- **Features:**
  - Browse filters for language (7), currency (5) and jurisdiction (54 countries plus Pan-African).
  - Product options, licence terms and disclosures.
  - Checkout, payment status and receipt.
  - A library page for each entitlement: download, updates, upgrade, version status, maintained access and next steps.
  - Refunds and issue reports.
- **How to use:**
  1. Open `/digital-products/browse` and open a product, e.g. `/digital-products/board-pack-template`.
  2. Pick an option and licence, then check out.
  3. As the demo client, open `/digital-products/library` to download your products and check for updates.
- **URLs:** `/digital-products`, `/digital-products/browse`, `/digital-products/{product}`, `/digital-products/library`, `/digital-products/library/{entitlement}`
- **Demo data:** the client's library holds entitlements `ENT-2026-000188` to `ENT-2026-000541`, e.g. Business Plan Template and ESG Due Diligence Toolkit.
- **Admin:** `/admin/products/digital` plus `control-tower`, `portfolio`, `versions`, `rights`, `pricing-floor`, `claims`, `cases`, `corrections`, `defensibility`, `delivery-reclassification`, `marketplace-ip`, `qa`

### Subscriptions

- **What it does:** sells recurring plans and lets subscribers manage them.
- **Features:**
  - Compare plans, a guided chooser, plan pages with disclosures, and checkout with a card mandate.
  - Account actions: change plan, pause, cancel or reactivate, renewal, price-change notice, billing recovery, usage and engagement, and data export.
- **How to use:**
  1. Open `/subscriptions/compare` or `/subscriptions/choose-subscription`.
  2. Open a plan, e.g. `/subscriptions/ai-agent-monitoring`, and check out with a test card.
  3. Manage it from `/subscriptions/account`.
- **URLs:** `/subscriptions`, `/subscriptions/compare`, `/subscriptions/{plan}`, `/subscriptions/checkout/{plan}`, `/subscriptions/account`, `/subscriptions/account/{subscription}`
- **Demo data:** the client already has active subscriptions with a Visa mandate, listed at `/subscriptions/account`.
- **Admin:** `/admin/products/subscriptions` plus `catalogue`, `billing-calendar`, `delivery-calendar`, `dunning`, `churn`, `engagement`, `deferred-revenue`, `below-floor`, `recurrence-test`, `review-capacity`

### Retainers

- **What it does:** ongoing advisory desks with monthly hour allowances, run from a proposal, an agreement and a usage ledger.
- **Features:**
  - Compare retainers, a guided chooser and an allowance-sizing tool.
  - Proposal → agreement.
  - Account pages: utilisation meter, ledger with disputes, overage, scope change, substitution, statement, renewal and cancellation.
- **How to use:**
  1. Open `/retainers/compare`, or size your hours at `/retainers/allowance-sizing`.
  2. Request a proposal. You go through `/retainers/choose`.
  3. As the demo client, open `/retainers/account` and then the Executive Strategy retainer to see its ledger and utilisation.
- **URLs:** `/retainers`, `/retainers/compare`, `/retainers/{service}` (e.g. `/retainers/board-advisory-retainer`), `/retainers/account`, `/retainers/account/{retainer}`
- **Demo data:** retainer `RET-2026-0001` (agreement `TBCA-AGR-2026-0813-0001`).
- **Admin:** `/admin/products/retainers` plus `allocation`, `capacity-register`, `capacity-test`, `profitability`, `rollover`, `scope-creep`, `substitution`, `under-use`, `below-floor`

### Due Diligence

- **What it does:** consent-based checks on companies and people, from a priced quote through to a released report, monitoring and closure.
- **Features:**
  - 14 check families, each with 10 tabs.
  - A pricing page that builds a live quote.
  - A 9-step quote journey: inputs → process → deliverables → add-ons → recommendation → manifest → consent → review → checkout.
  - Secure consent links that need no login.
  - Case workspace:
    - Evidence uploads and alternatives for missing evidence.
    - Checks, risk flags and findings.
    - Review and partner review.
    - The report is released only after the client acknowledges its limitations.
    - Disputes and corrections produce a versioned report.
    - Monitoring with alerts.
    - Closure needs two approvals before data is deleted.
  - Enterprise bulk screening.
- **How to use:**
  1. Open `/due-diligence/pricing` to build a quote, or browse a family such as `/due-diligence/company/packages`.
  2. Log in as the demo client and open `/due-diligence/cases`.
  3. Open case `DD-SA-2026-00047` to see a released report, its monitoring and a dispute. Download the report from its Report page.
  4. Open the open quote `/due-diligence/quotes/Q-DD-2026-00071` to continue from the manifest step.
  5. As admin, open `/admin/due-diligence/cases/DD-SA-2026-00047` to move the case on, add findings or approve closure.
- **URLs:** `/due-diligence`, `/due-diligence/services`, `/due-diligence/pricing`, `/due-diligence/{family}/{tab}`, `/due-diligence/quotes/{quote}/{step}`, `/due-diligence/cases`, `/due-diligence/cases/{case}/{page}`, `/due-diligence/enterprise/request`, `/due-diligence/enterprise/dashboard`
- **Demo data:**
  - Sample subject: Kanyisa Power Systems.
  - Cases at different statuses:
    - `DD-SA-2026-00047`: monitoring
    - `DD-SA-2026-00031`: intake open
    - `DD-SA-2026-00052`: review required
    - `DD-SA-2026-00058`: partner review
    - `DD-SA-2026-00063`: report draft
    - `DD-SA-2026-00006`: closed
  - Open quote `Q-DD-2026-00071`.
  - Consent link `/due-diligence/consent/demo-consent-00031-company-secretary-link-0001`.
  - Enterprise request `ENT-DD-2026-00012`; monitoring plan `SUB-SA-2026-00047`.
- **Admin:** `/admin/due-diligence`, `/admin/due-diligence/cases`, `/admin/due-diligence/enterprise`

### Industries

- **What it does:** sector intelligence and industry-specific engagements for 17 industries.
- **Features:**
  - Industry pages, a diagnostic for each industry, and benchmarks (published only when a minimum threshold is met).
  - Paid sector briefs, industry × country views, partners and industry services.
  - Engagement workspace:
    - 9 gates, with a ledger that can be exported.
    - Verification evidence and reclassification notices.
    - Abort ladder, engagement letter (with PDF) and split checkout.
    - Partner route, specialist review, compliance calendar (`.ics`) and benchmark consent.
- **How to use:**
  1. Open `/industries/select` and pick an industry, e.g. `/industries/agriculture-agro-industry`.
  2. Run its diagnostic and view its benchmarks.
  3. As the demo client, open `/industries/workspace`. It opens engagement `AGRI-2026-EGY-001`; look at its gates and ledger.
- **URLs:** `/industries`, `/industries/{industry}`, `/industries/{industry}/diagnostic`, `/industries/{industry}/benchmarks`, `/industries/sector-intelligence/{industry}`, `/industries/workspace/{engagement}`
- **Demo data:** engagement `AGRI-2026-EGY-001`.
- **Admin:** `/admin/insights/industries` plus `taxonomy`, `classification`, `misdeclarations`, `blocked`, `benchmarks`, `regulators`, `margin`, `activation`, `whatsapp`

### Resources

- **What it does:** TBCA's library of guides, reports, templates, case studies, KP insights and webinars. Items can be free, gated, paid or subscription.
- **Features:**
  - Library with search and filters.
  - Access gates, paid checkout and subscription entitlements.
  - Free diagnostic.
  - Webinar registration and replays.
  - Consent, preferences and withdrawal.
  - Account library and subscription management.
- **How to use:**
  1. Open `/resources/library` and filter or search.
  2. Open an item, e.g. `/resources/project-charter-template`, and unlock it: fill in the gate form, pay, or use a subscription.
  3. Try the free diagnostic at `/resources/free-diagnostic`.
  4. Register for a webinar at `/resources/webinars`.
  5. Signed in, see your items at `/resources/account/library`.
- **URLs:** `/resources`, `/resources/library`, `/resources/guides-reports`, `/resources/templates-tools`, `/resources/insights`, `/resources/webinars`, `/resources/{resource}`, `/resources/consent`, `/resources/preferences`, `/resources/account/library`, `/resources/account/subscription`
- **Demo data:** the client's entitlements `ENT-DEMO-0001…` and an active resources subscription.
- **Admin:** `/admin/insights/resources` plus `records` (create, edit, publish), `lifecycle`, `decay`, `protected`, `consents`, `roi`, `ai-outputs`, `whatsapp`

### Services

- **What it does:** the full catalogue of 110 advisory services and the ways to work with TBCA. A "vehicle" is one of those ways, such as a sprint, retainer or mandate.
- **Features:**
  - Services A–Z, category and capability pages, and a resolver.
  - Fee panel at `/services/fee-panel`. For the demo client it opens the fees of a seeded vehicle; demo vehicles are seeded for this client.
  - "Not sure which?" help and a choice comparison.
  - Proposal requests.
  - Relationship dashboard and statement.
  - Fees for each vehicle.
  - Moving between vehicles (transition, upgrade or downgrade) carries credits across.
- **How to use:**
  1. Open `/services/a-z`, or run the resolver at `/services/resolver/1`.
  2. Compare routes at `/services/ways-to-work-with-tbca`.
  3. As the demo client, open `/services/relationship` and `/services/statement`.
- **URLs:** `/services`, `/services/a-z`, `/services/catalogue/{slug}`, `/services/resolver/{step}`, `/services/ways-to-work-with-tbca`, `/services/proposal-request`, `/services/relationship`, `/services/statement`, `/services/vehicle-transition-proposal`
- **Admin:** `/admin/advisory` plus `vehicles`, `vehicle-performance`, `dispositions`, `disposition-tool`, `crosswalk`, `proposals`, `spine`, `stop-now`, `below-floor`, `margin-bias`

### Project Advisory

- **What it does:** advisory mandates for large projects, from a readiness check through gated delivery.
- **Features:**
  - Covers 17 sectors.
  - Readiness and cost-exposure tools, a contingent fee calculator, studies, engagement options and discovery.
  - Embedded services for Project Advisory are listed on its pages and at `/embedded-services/project-advisory`.
  - Mandate workspace:
    - Gates G0–G10.
    - 5 ledgers and a fee meter.
    - NDA, mandate letter, engagement letter and method card.
    - Contingent fees and settlement.
- **How to use:**
  1. Open `/project-advisory/readiness`, then `/project-advisory/contingent-fee-calculator`.
  2. As the demo client, open `/project-advisory/workspace`, then mandate `PA-2026-0319`.
  3. Look at its ledger and fee meter.
- **URLs:** `/project-advisory`, `/project-advisory/readiness`, `/project-advisory/cost-exposure`, `/project-advisory/contingent-fee-calculator`, `/project-advisory/discovery`, `/project-advisory/workspace/{mandate}` (+ `ledger`, `fee-meter`, `nda`, `mandate-letter`, `engagement-letter`, `settlement`)
- **Demo data:**
  - `PA-2026-0319`: Blue Horizon Solar & Grid, at gate G4.
  - `PA-2026-0147`: Working Capital Optimisation.
  - `PA-2026-0402`: Gauteng Agro-Logistics Hub.
- **Admin:** `/admin/advisory/mandates/{mandate}`

### Technology Solutions

- **What it does:** technology engagements organised by tower, from readiness and configuration through delivery and exit.
- **Features:**
  - Towers, readiness, scope, configurator, fees and external costs.
  - Each tower page lists the sprints that belong to it.
  - Fees show separate T, X and S subtotals, with no combined total.
  - Checkout is gated behind a signed engagement letter.
  - Workspace: fee meter, payments, usage, tasks, UAT, subscription, statement, support, documents and exit.
- **How to use:**
  1. Open `/technology-solutions/towers`, then `/technology-solutions/configure` and `/technology-solutions/fees`.
  2. Sign the engagement letter at `/technology-solutions/engagement-letter`, then go to checkout.
  3. As the demo client, open `/technology-solutions/workspace/ENG-TS-1042`.
- **URLs:** `/technology-solutions`, `/technology-solutions/towers`, `/technology-solutions/readiness`, `/technology-solutions/configure`, `/technology-solutions/fees`, `/technology-solutions/engagement-letter`, `/technology-solutions/checkout`, `/technology-solutions/workspace/{engagement}`
- **Demo data:** engagement `ENG-TS-1042`: Acme Manufacturing, tower TS-1, in QA review.
- **Admin:** `/admin/advisory/tech/engagements`, `/tech/exceptions`, `/tech/fee-rules`, `/tech/suppliers`, `/tech/whatsapp`

### Virtual Deal Room

- **What it does:** a governed, secure room that runs a transaction from mandate to close.
- **Features:**
  - MICHAELA, an in-room assistant that knows the current room and stage.
  - Embedded services for deal rooms are listed at `/embedded-services/virtual-deal-room`.
  - Enquiry, then pre-mandate stages A–C and stages 0–15.
  - Enquiry transaction types are grouped (M&A; Capital Raising & Financing; Real Estate & Infrastructure; Restructuring & Distressed Transactions; Strategic Partnerships & Commercial Agreements).
  - Indicative Raise is a set of bands held in rand (under R1m up to over R500m) and shown in the selected display currency. The band code is stored.
  - Each stage has gates, tick lists, approvals and stage fees.
  - A setup wizard.
  - Commercial screens: estimate → quotation → fee breakdown → scope → engagement → deposit, then statements, closing invoice and post-close subscription.
  - Secure data room:
    - The NDA must be accepted first.
    - Disclosure is staged, and access follows a permissions matrix.
    - Downloads are watermarked and logged.
  - Parties and invitations; Q&A; live negotiation; offers and term sheets.
  - Registers for items, conditions precedent and funds flow.
  - Billing: usage and overage, change, refund and dispute requests, and pause, restart and renewal.
- **How to use:**
  1. Log in as the demo client and open `/virtual-deal-room/rooms`.
  2. Open "Baobab Capital Raise" to see a room at Stage 10, with offers, term sheets and the data room.
  3. Open "AgriTech SA Growth Raise" (Stage C) and continue the commercial journey from `/commercial/formal-quotation`.
  4. Log in as `david@frontiercap.mu` to see the Baobab room as an investor: data room, Q&A and live negotiation.
  5. New users start at `/virtual-deal-room/enquiry`.
- **URLs:** `/virtual-deal-room`, `/virtual-deal-room/enquiry`, `/virtual-deal-room/rooms`, `/virtual-deal-room/rooms/{room}`, `/rooms/{room}/{stage-page}`, `/rooms/{room}/data-room`, `/rooms/{room}/commercial/{screen}`, `/rooms/{room}/billing/{screen}`, `/rooms/{room}/setup/{step}`
- **Demo data:**
  - `baobab-capital-raise` (`DR-2025-000128`, Stage 10). The client is the owner and David M. is an investor.
  - `agritech-sa-growth-raise` (`DR-2026-000131`, Stage C, quotation issued).
- **Admin (Deal Room Control Tower):** `/admin/deal-room`, `/admin/deal-room/requests`, `/admin/deal-room/billing`, `/admin/deal-room/rooms/{room}`

### Marketplace

- **What it does:** buyers brief vetted analysts and specialist providers, and TBCA controls pricing, QA and payment.
- **Features (buyer):**
  - Services catalogue with search, filters and sorting.
  - Service pages with Basic / Standard / Premium packages and Packages, Inputs Required and Process tabs.
  - Directory of verified providers, with profiles.
  - 5-step brief wizard, then:
    1. Scope and price review
    2. Proposal comparison
    3. Third-party disclosure
    4. Checkout, priced in separate fee ledgers
  - My Marketplace.
  - Assignment and progress tracking.
  - Deliverable QA, with an accept or return decision.
  - Disputes.
- **Features (provider):**
  - 7-step provider application.
  - Provider portal:
    - Dashboard.
    - Opportunity feed, where the provider accepts the offered rate.
    - Engagement work submission.
    - Earnings statement.
    - Agreement.
    - Grievances.
- **How to use (buyer):**
  1. Log in as the demo client and open `/marketplace/services`. Filter the list, then open a service, e.g. `/marketplace/services/financial-model-review`.
  2. Click **Submit a Brief** (`/marketplace/brief/1`) and complete the 5 steps.
  3. Review scope and price, then compare proposals. For the seeded brief, open `/marketplace/briefs/BRF-2026-00421/review`, then `/proposals`.
  4. Accept the disclosure and pay at checkout with a test card.
  5. Follow the work at `/marketplace/my`, e.g. `/marketplace/engagements/ENG-2026-0048/progress`.
  6. Review a released deliverable at `/marketplace/engagements/ENG-2026-0037/deliverables/DEL-2026-0114` and accept or return it.
  7. See the open dispute at `/marketplace/engagements/ENG-2026-0037/disputes/DIS-2026-0003`.
- **How to use (provider):**
  1. Log in as `provider@alphafinance.co.za` and open `/marketplace/provider/dashboard`.
  2. Open the feed at `/marketplace/provider/opportunities`, e.g. brief `BRF-2026-0095`, and accept the rate.
  3. Submit work on `/marketplace/provider/engagements/ENG-2026-0042`.
  4. See earnings at `/marketplace/provider/statements`.
  5. New providers apply at `/marketplace/providers/apply/1`.
- **URLs:** `/marketplace`, `/marketplace/how-it-works`, `/marketplace/services`, `/marketplace/services/{listing}`, `/marketplace/providers`, `/marketplace/providers/{provider}` (e.g. `alpha-finance-solutions`), `/marketplace/providers/apply/{step}`, `/marketplace/brief/{step}`, `/marketplace/briefs/{brief}/review` (+ `proposals`, `disclosure`, `checkout`), `/marketplace/my`, `/marketplace/engagements/{engagement}/progress` (+ `assignment`), `/marketplace/provider/...`
- **Demo data:**
  - **Client's brief:** `BRF-2026-00421` (Solar Mini-Grid feasibility, awaiting your confirmation).
  - **Client's engagements:**
    - `ENG-2026-0048`: Financial Model Review, in QA.
    - `ENG-2026-0037`: Valuation Review, released. Deliverable `DEL-2026-0114`; dispute `DIS-2026-0003`.
  - **Open briefs in the provider feed:** `BRF-2026-0093` to `BRF-2026-0098`.
  - **Alpha Finance engagements:** `ENG-2026-0042`, `-0021`, `-0013`, plus the two client engagements above.
  - **Seeded providers:** 22, e.g. `alpha-finance-solutions` and `greentech-engineering`.
- **Admin:**
  - `/admin/marketplace` hub plus `providers` (and `providers/{provider}/vetting`), `listings`, `briefs` (and `briefs/{brief}/triage`), `qa` (QA queue), `finance` (payouts), `supply`, `disputes` (incl. chargebacks `DSP-2026-0012` to `-0022`), `partners/register`.
  - Register consoles at `/admin/marketplace/{register}`.

### Partner Services

- **What it does:** routes regulated and specialist work (legal, audit, tax, environmental, engineering) to vetted partner firms. TBCA checks jurisdiction and conflicts and makes responsibilities explicit.
- **Features (client):**
  - 45 partner services.
  - Choose a service, how it works, coverage by profession and jurisdiction, service pages, the professional limitation notice and the partner network.
  - Request journey:
    1. Intake
    2. Jurisdiction resolution
    3. Conflict check
    4. Proposal
    5. Scope and quote
    6. Signing the engagement instrument
    7. Responsibility statement
    8. Status tracking
  - Escalated matters.
- **Features (partner):**
  - 6-step partner application.
  - Partner workspace:
    - Conflict check.
    - Quote calculator.
    - Delivery and QA.
    - Settlement.
    - Re-verification.
- **How to use (client):**
  1. Log in as the demo client and open `/partner-services/choose-service`, or a service page such as `/partner-services/services/environmental-impact-assessment-eia`.
  2. Start a request at `/partner-services/request`.
  3. Track your requests at `/partner-services/requests`. `PSR-2026-000124` opens at its proposal step.
  4. See a conflict result at `/partner-services/requests/PSR-2026-000127/conflict`, and an escalated matter at `/partner-services/requests/PSR-2026-000133/escalated`.
- **How to use (partner):**
  1. Log in as `partner@enviroimpact.co.za` and open `/partner-services/workspace`.
  2. Run the conflict check on `PSR-2026-001245`.
  3. Price `PSR-2026-000124` with the quote calculator (`.../opportunities/PSR-2026-000124/quote`).
  4. Deliver `PSR-2026-000075` (`/delivery`).
  5. See the settlement for `PSR-2026-000098` (`/settlement`).
  6. Re-verify at `/partner-services/workspace/verifications`.
  7. New firms apply at `/partner-services/apply/1`.
- **URLs:** `/partner-services`, `/partner-services/choose-service`, `/partner-services/how-it-works`, `/partner-services/coverage`, `/partner-services/network`, `/partner-services/professional-limitation-notice`, `/partner-services/services/{listing}`, `/partner-services/request`, `/partner-services/requests/{request}/{step}` (resolution, conflict, proposal, scope-quote, engagement-instrument, responsibility, status, escalated), `/partner-services/workspace/...`
- **Demo data:**
  - **Client's requests:**
    - `PSR-2026-000124`: EIA, 150MW Solar Farm, at the proposal step.
    - `PSR-2026-001245`: conflict check pending.
    - `PSR-2026-000127`: Heritage Impact Assessment, conflict identified.
    - `PSR-2026-000133`: escalated.
  - **Partner's other matters:**
    - `PSR-2026-000075`: in delivery.
    - `PSR-2026-000098`: completed, with settlement `SET-2026-000321`.
- **Admin:** `/admin/marketplace/partners/register`, plus the Marketplace consoles above.

### About & Trust

- **What it does:** company information, trust and governance pages, careers, newsroom, complaints and whistleblowing.
- **Features:**
  - Hero artwork on the About pages, including the How TBCA Works hero.
  - Institution wordmarks on the testimonials.
  - About: story, methodology, team, governance, certifications and verifications, institutional relationships, testimonials, corrections log, AI disclosure.
  - Trust centre, privacy, terms and system status.
  - Careers with a multi-step application and status tracking.
  - Newsroom.
  - Complaints with tracking.
  - Anonymous whistleblowing with token-based follow-up.
- **How to use:**
  - **Track a complaint:** open `/complaints/track` and enter `TBCA-CMP-2026-DEMO01` with `sizwe.n@example.com`.
  - **Check an application:** open `/careers/application-status` and enter `TBCA-APP-2026-DEMO01` with `lindiwe.m@example.com`.
  - **Follow up a whistleblowing report:** open `/whistleblowing/follow-up` and enter `WB-2026-DEMO01` with token `TBCA-DEMO-CASE-0001`.
  - **Apply for a job:** open `/careers`, pick a vacancy and go through the application steps.
- **URLs:** `/about` (+ `/our-story`, `/methodology`, `/team`, `/governance`, `/certifications`, `/relationships`, `/testimonials`, `/corrections`, `/ai-disclosure`), `/trust-centre`, `/privacy`, `/terms`, `/system-status`, `/careers`, `/newsroom`, `/complaints`, `/whistleblowing`
- **Demo data:** the three references above, plus partner enquiry `TBCA-PRT-2026-DEMO01` (in the admin cases console).
- **Admin:** `/admin/about` plus `claims`, `evidence`, `certifications`, `testimonials`, `corrections`, `careers` (with CV download), `cases`, `status`

### Client Portal

- **What it does:** the signed-in client's home for everything they hold with TBCA.
- **Features:**
  - Dashboard and One Action Centre.
  - The header bell shows the unread count and opens `/portal/notifications`.
  - Saved payment options at `/portal/payment-methods`.
  - Money: orders, invoices (printable), statement (CSV) and arrears. Each unpaid item has a Pay-now link to checkout.
  - Document vault: private storage and share links.
  - Projects, deliverables and approvals.
  - Support tickets with SLA levels L0–L4 and threaded replies; secure messages.
  - Security: password change, TOTP authenticator MFA, step-up verification and active sessions.
  - Privacy: consents, data-rights requests and a JSON data export.
  - Team and organisation.
  - Guided journeys: verification, organisation, authority, terms, intake, offboarding and others.
  - Continuity and restricted-account pages.
  - KAREN, the in-portal assistant.
- **How to use:**
  1. Log in as the demo client. You land on `/portal/dashboard`.
  2. Open `/portal/invoices` and pay an unpaid invoice with Pay now and a test card.
  3. Open `/portal/support`, then ticket `TKT-2026-0724-1`, and reply in the thread.
  4. Open `/portal/projects`, then `FS-2026-0021`, to see a project and its deliverables.
  5. Turn on MFA at `/portal/security`.
  6. Download your data from `/portal/privacy/data`.
- **URLs:** `/portal/dashboard`, `/portal/actions`, `/portal/orders`, `/portal/invoices`, `/portal/statement`, `/portal/arrears`, `/portal/documents`, `/portal/projects`, `/portal/deliverables`, `/portal/approvals`, `/portal/support`, `/portal/messages`, `/portal/security`, `/portal/privacy`, `/portal/team`, `/portal/organisation`, `/portal/natasha`, `/portal/journeys/{key}`
- **Demo data:**
  - Projects: `DD-2026-0007`, `FS-2026-0021`, `FIN-2026-0011`, `REG-2026-0004`.
  - Support tickets `TKT-2026-0718` to `TKT-2026-0724`. Each reference ends with the client's user ID, e.g. `TKT-2026-0724-1`.
  - Secure-message threads, e.g. `PA-2026-00048`.
  - Disputes `DSP-2026-0005`, `-0007` and `-0012`.
  - Invoices come from the client's real orders.
- **Admin:** `/admin/portal` plus `clients`, `lifecycle`, `support`, `sla`, `exceptions`, `arrears`, `money-events`, `reconciliation`, `disputes`, `promises`, `entitlement-decisions`, `consent`, `security`, `successor-access`, `continuity`, `retention`, `communications`, `natasha`, `handoffs`, `partners`, `vendor-documents`, `integrations`, `capacity`, `entry-surfaces`, `routes`, `uat`

### AIIM (Africa Investment Intelligence)

- **What it does:** trade and investment intelligence for Africa. Users search opportunities, projects, investors and funders, buy briefs and unlock data.
- **Features (working):**
  - Explore Africa: pick any of the 54 countries to open its Investor Cockpit (`/aiim/country/{slug}`, e.g. `/aiim/country/nigeria`).
  - An interactive map of Africa.
  - Country indicators, clearly labelled as placeholders.
  - Custom intelligence wizard (`/aiim/custom-intelligence`) and cover art in the brief store.
  - Searches with filters across opportunities, projects, investors, funders, sectors, corridors and risk.
  - Confidence and source chips. Items below 60% confidence cannot be sold.
  - Saved items and watchlists.
  - Comparison builder with CSV export.
  - Fee discovery → manifest → checkout → entitlement.
  - Wallet and credits, with metered unlocks.
  - Premium brief store, and a report configurator that produces a quote.
  - Engagement journey: discovery booking → quote → letter → typed signature → deposit → mandate.
- **How to use:**
  1. Open `/aiim`, pick a country in Explore Africa (e.g. `/aiim/country/south-africa`), then search `/aiim/opportunities` or `/aiim/investors` with the filters.
  2. Save items, then view them at `/aiim/workspace/saved` and `/aiim/workspace/watchlist`.
  3. Buy a brief from `/aiim/store`, e.g. `/aiim/store/GP-EP-2025`, or start at `/aiim/fees/discover`. Then pay at checkout.
  4. Top up or spend credits at `/aiim/wallet`.
  5. As the demo client, open `/aiim/workspace/engagements/ENG-20250507-001` to follow an engagement.
- **URLs:** `/aiim`, `/aiim/country/{slug}`, `/aiim/sectors`, `/aiim/opportunities`, `/aiim/projects`, `/aiim/investors`, `/aiim/funders`, `/aiim/corridors`, `/aiim/risk`, `/aiim/store`, `/aiim/custom-intelligence`, `/aiim/methodology`, `/aiim/wallet`, `/aiim/workspace` (+ `saved`, `watchlist`, `compare`, `reports`, `entitlements`, `engagements`)
- **Demo data:**
  - Saved and watchlist items, e.g. Gauteng Data Centre Campus and North Corridor.
  - Comparison `cmp_20250506_001`.
  - Entitlement `ENT-20250506-7890`.
  - Report request `REP-20250506-0037` (quote `AIIM-QR-20250506-037`).
  - Engagements `ENG-20250507-001` (mandate `MND-2025-05-07-001`, introduction `INT-2025-05-07-001`) and `ENG-20250510-002` (quoted).
  - A seeded wallet with transactions.
- **Display-only:** mandate stages 7–15, the enterprise, government, API and white-label desks, and staff actions in the admin consoles.
- **Admin:** `/admin/aiim`, `/admin/aiim/advisor`, `/admin/aiim/finance`, `/admin/aiim/pricing`, `/admin/aiim/sources`

### KP Thought Leadership

- **What it does:** Kruger Phiri's thought leadership section, built to the KP TEB v2.0 Consolidated Blueprint and KP's 48 page mockups. All 72 blueprint screens (KP-SCR-001 to 072) are built; each page shows its Screen ID.
- **Features (working):**
  - Landing, navigation handoff, legacy bridge, authority landing and Founder profile. The design's Founder statistics are hidden until evidence is approved; focus areas are shown instead (blueprint 12.5).
  - Insights, Founder's Notes, African Business Clinic, Topic Hub and Search, with filters by type, theme, voice, region and freshness. Every item carries a voice class (P, F, I, S, E, A), a freshness state and a geographic scope (AFR-G0 to G5).
  - Article texts: none were supplied. 28 insights show title and summary from KP's designs; "The Real Problem Isn't Capital" shows the excerpt visible in the design. Nothing is written on KP's behalf.
  - Work With Kruger and Book Kruger: five offers with indicative fees in the selected currency. A booking form creates a request (not a booking); staff confirm the delivery mode (K1 to K4) and fee first.
  - Project Development Desk (brief form, and the demo client's projects), Speaking & Media (enquiry form), KP Resources (summary-sheet downloads), Country Lens (AIIM indicators, labelled as placeholders) and Sector Lens (Industries register).
  - KP Knowledge Assistant: grounded answers from the KP register with numbered sources and a confidence score, a Source & Confidence panel, export, feedback and reporting. It abstains without evidence, routes regulated questions to a professional and refuses to speak as Kruger. No generative model is used.
  - Explain It at My Level (five levels), Boardroom Challenger, Funder Readiness Interviewer (20 questions, saved), Project Fatal-Flaw Explorer, Decision Sheet (save and export), corrections timeline with a report form, Insight Action Pack, Diagnostic Questions (10 topics), Capital Readiness Scorecard (versions and trend), Investment Case Calculator (NPV, ROI, payback, IRR) and Decision Checklist.
  - Free-to-Paid Disclosure, Related TBCA Route and the eight content standards pages (voice badge, synthetic disclosure, Founder attribution, evidence popover, professional limitation, geographic scope, freshness, correction notice).
  - Future Builders: home, learner topic hub, Business Basics (12 lessons) and AI Literacy (10 lessons) with progress, Local Problem Challenge (reviewed before sharing; guardian email for ages 8 to 12), printable SMART goals worksheet, Educator Portal (teaching packs and access requests), Guardian page and Low-Bandwidth Mode. No commercial calls to action and no learner surnames.
  - 22 governance consoles for staff (topics, lifecycle, voice, independent review, AI output approval, synthetic register, claim evidence, UTM, D023 funnel, customer value, Founder capacity, session pipeline, contested topics, duplication, knowledge graph, source freshness, Africa coverage, translation QA, Future Builders safety, AI agent control, corrections, experiments). Records move between the blueprint states with an audit trail. Hard rules are enforced: unevidenced claims cannot be approved, a hard review block cannot be overridden, and a booked or routed session needs a delivery mode.
- **How to use:**
  1. Open `/kp-thought-leadership`, then Insights, an article, or Ask KP Assistant. Try "What are the 5 pillars of execution?" and open its sources.
  2. Request a session at `/kp-thought-leadership/book`; the request appears in `/admin/kp/sessions`.
  3. Try the tools from `/kp-thought-leadership/african-business-clinic` and the learner pages at `/kp-thought-leadership/future-builders`.
  4. Sign in as the admin and open `/admin/kp` for the 72-screen register, work queues and consoles.
- **URLs:** `/kp-thought-leadership` (+ `handoff`, `legacy-bridge`, `authority`, `about`, `insights`, `founders-notes`, `african-business-clinic`, `topics`, `search`, `work-with-kruger`, `book`, `project-development`, `speaking-media`, `resources`, `africa/{country}`, `sectors/{sector}`, `ask`, `explain`, `boardroom-challenger`, `funder-readiness`, `project-fatal-flaw`, `decision-sheet`, `corrections`, `action-pack/{slug}`, `diagnostic-questions`, `tools/scorecards/capital-readiness`, `tools/calculators/investment-case`, `tools/checklists/go-no-go`, `free-and-paid`, `related-route`, `standards/{component}`, `future-builders/...`, `events`, `newsletter`)
- **Demo data:** `KpSeeder`: 126 records for the consoles, five session requests, eight public corrections and three projects for the demo client (`amahle@agritechsa.co.za`).
- **Admin:** `/admin/kp`, `/admin/kp/{console}`

### Assistants: NATASHA, KAREN, MICHAELA, NIKIWE

- **What it does:** a chat assistant for each area of the site, each with its own persona. The table under Platform-wide features says where each one appears.
- **Features:**
  - Quick actions, link cards, suggestion chips and a typing indicator.
  - History is kept for the browser session.
  - An illustrated face with a choice of outfits.
  - Optional voice replies and microphone input.
  - NATASHA's "Talk to a specialist" saves a `question` submission with the transcript and shows a reference number.
  - NIKIWE routes each topic to the right Functional Lead mailbox and captures the visitor's details as a lead. It saves the chat to `/forms/whatsapp-chat` with a reference and offers "Continue on WhatsApp".
- **How to use:**
  1. Click **Ask NATASHA** on any page, then pick a quick action or type a question, e.g. "How do I order a sprint?". Choose "Talk to a specialist" to get a reference.
  2. In the Client Portal, open KAREN. In a deal room (e.g. `/virtual-deal-room/rooms/baobab-capital-raise`), open MICHAELA; she answers about the current stage.
  3. Click **WhatsApp / Talk** in the header to open NIKIWE.
  4. Choose a topic (e.g. Due Diligence or Finance / Billing), leave your details and get a reference. You can then continue on WhatsApp (+27 60 801 1365).
- **Note:**
  - Replies come from built-in intent matchers in `resources/js/lib/assistant.ts`. To connect the real AI agent, replace `getReply()`; `docs/INTEGRATIONS_PLAN.md` describes the plan.
  - The UI lives in `resources/js/Components/Assistant/`.
  - `/admin/portal/natasha` is the policy console for the portal assistant.

### Admin hub

- **What it does:** a single staff entry point to every module's console.
- **How to use:** log in as `admin@thebusinessclinic.africa` and open `/admin`. Each console is listed in its module's section above. Clients who open `/admin` get "forbidden".

### Navigation & branding

- **Header row 1:** Home, Services, Online Shop, AIIM, Due Diligence, Digital Products, Subscriptions, Retainers, Marketplace, Partner Services, Virtual Deal Room.
- **Header row 2:** Technology Solutions, Diagnostics, Project Advisory, Countries, Industries, Resources, Client Portal, About TBCA, KP Thought Leadership, Webinars, Contact.
- **Mega-menus:** these sections have mega-menus with their key pages: Services, Shop, Digital Products, Subscriptions, Retainers, Marketplace, Partner Services, Virtual Deal Room, Project Advisory, Technology Solutions, Diagnostics, Industries, Resources, AIIM, Due Diligence, Client Portal and About.
  - Marketplace menu: Home, How It Works, Browse Services, Submit a Brief, Verified Providers, Become a Provider, My Marketplace, Provider Portal.
  - Partner Services menu: Home, Choose a Partner Service, How Partner Engagements Work, Profession & Jurisdiction Coverage, Request Partner Review, My Partner Requests, Partner Network, Professional Limitation Notice, Apply to Become a Partner, Partner Workspace.
  - Client Portal menu: Dashboard, Action Centre, Orders & Invoices, Projects & Deliverables, Document Vault, Support, My Meetings, DD Cases, Deal Rooms, Subscriptions, Retainers, Privacy.
  - KP Thought Leadership menu: Home, Authority Landing, About the Founder, Insights, Founder's Notes, African Business Clinic, Topic Hub, KP Knowledge Assistant, Africa Lens, Work With Kruger, Book Kruger, Project Development Desk, Speaking & Media, KP Resources, Future Builders, KP Governance Consoles (staff).
  - AIIM menu: Home, South Africa Investor Cockpit, Sectors, Opportunities, Projects, Investors & Funders, Corridors, Risk & Outlook, Brief Store, Custom Intelligence, Methodology, Workspace, Wallet.
- **Links:** the menus and footer are built from `app/Support/Content/Navigation.php`. They hold 169 unique links (22 tabs, 160 menu links and 41 footer links). Every link opens for the signed-in client except Provider Portal and Partner Workspace, which correctly need the provider or partner login.
- **Logo:** the header uses `public/brand/tbca-logo-header.png` (with an `@2x` version), 46px tall in the 68px header bar. The footer uses its own logo size.
