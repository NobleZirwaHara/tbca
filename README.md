# The Business Clinic.Africa — Platform Front End

Laravel 13 + Inertia + React (TypeScript) + Tailwind v4 implementation of the front end
described in the TBCA Pan-African AI Consultancy Operating System Developer Blueprint.

## Running locally with Herd

The project lives in `C:\Users\haran\Herd\tbca`, so Herd serves it at **http://tbca.test**.

```powershell
cd C:\Users\haran\Herd\tbca
composer install
npm install
npm run dev
```

`composer install` and `npm install` are needed once. `npm run dev` gives hot reload while
editing. A production build is already committed in `public/build`, so the site renders
even before you run Vite.

## What is implemented

**Canonical route matrix (Table 1).** All 21 primary navigation tabs, with AIIM and Due
Diligence as primary destinations. `/digital-due-diligence` issues a permanent redirect to
`/due-diligence` as required by Section 17.

| Cluster | Routes |
| --- | --- |
| Core | `/`, `/services`, `/shop`, `/shop/{code}`, `/digital-products`, `/subscriptions`, `/retainers` |
| AIIM | `/aiim`, `/aiim/compare`, `/aiim/corridors`, `/aiim/store`, `/aiim/workspace`, `/aiim/workspace/watchlists`, `/aiim/methodology`, `/aiim/country/{slug}`, `/aiim/sector/{slug}` |
| Due Diligence | `/due-diligence`, `/due-diligence/start`, `/due-diligence/reports`, plus the twelve product families |
| About | `/about`, `/about/our-story`, `/about/methodology`, `/about/team`, `/about/team/{slug}`, `/about/governance`, `/about/certifications` |
| Other | `/marketplace`, `/partner-services`, `/technology-solutions`, `/diagnostics`, `/project-advisory`, `/countries`, `/industries`, `/resources`, `/portal`, `/kp-thought-leadership`, `/webinars`, `/contact` |

**Context persistence.** Country, language and currency persist in session across every
route and drive price display. `POST /context` updates them.

**Content layer.** Page content is not hard-coded in components. It lives in typed PHP
registers under `app/Support/Content/` so it can be swapped for database or CRM sources
without touching the front end:

- `Navigation.php` — Table 1 route matrix, mega-menu children, footer register
- `Platform.php` — platform engines, canonical methodology, systems of record, governance pillars, agent families and authority tiers, implementation waves, dashboards, deal room stages
- `Commerce.php` — Sprint catalogue, digital products, subscriptions, retainer desks
- `Aiim.php` — eight intelligence layers, route architecture, roles and entitlements, source tiers, confidence grades, curation lifecycle, record metadata, country and sector registers
- `DueDiligence.php` — routes, SKU register, case status machine, end-to-end workflow, review triggers, controls, report templates, portal areas
- `About.php` — trust rail, certifications, profile record states, leadership
- `Pages.php` — service-category template content for the remaining routes

**Design system.** Tokens are defined in `resources/css/app.css` under Tailwind v4 `@theme`:
gold, ink, parchment, and the evidence-ledger palettes (verified, attested, referenced,
controlled, risk). Components live in `resources/js/Components/`:

- `Header.tsx` — utility bar, two-row navigation, mega menus, mobile drawer
- `PageHeader.tsx` — standard inner-page header with evidence panel
- `Blocks.tsx` — stat band, feature grid, cluster grid, step flow, data table, FAQ, boundary note, definition rows
- `ui/LedgerChip.tsx` — evidence class and confidence grade chips
- `AfricaMark.tsx` / `AfricaMap.tsx` — Africa network mark and schematic regional map

## Not yet wired

Authentication, checkout, CRM and finance integrations, AIIM data ingestion and the Due
Diligence case engine are backend work. The Due Diligence consent gate at
`/due-diligence/start` enforces its rules client-side and stops at checkout; the portal at
`/portal` presents a disabled sign-in form.

## Commands

```
npm run dev          # Vite dev server with hot reload
npm run build        # production asset build
npm run type-check   # tsc --noEmit
php artisan route:list --except-vendor
```
