<?php

namespace App\Support\Content;

/**
 * Part 3 — Africa Investment Intelligence Map.
 * Canonical architecture covers all 54 African countries using one data model
 * with progressively activated verified country packs.
 */
class Aiim
{
    public static function positioning(): array
    {
        return [
            'title' => 'Africa Investment Intelligence Map',
            'standard' => 'AIIM must behave as an investor cockpit and Africa investment command centre, not as a decorative map. Every visible insight carries source, date, confidence, update frequency and verification status.',
            'intro' => 'AIIM is the operating system for African trade and investment intelligence. It supports decisions on where to trade, where to invest, who to contact, what changed, what to avoid and what action to take next.',
        ];
    }

    /** Section 9 — the eight intelligence layers. */
    public static function layers(): array
    {
        return [
            ['number' => 1, 'name' => 'Country Base Layer', 'standard' => 'At least 150 structured indicators per country covering macro, policy, risk, infrastructure, trade and investment climate.', 'icon' => 'flag'],
            ['number' => 2, 'name' => 'Sector Layer', 'standard' => 'At least 30 sectors per country and at least 80 fields per sector.', 'icon' => 'factory'],
            ['number' => 3, 'name' => 'Product Trade Layer', 'standard' => 'Import, export, tariff, logistics, product demand and trade-gap intelligence.', 'icon' => 'ship'],
            ['number' => 4, 'name' => 'Investment Opportunity Layer', 'standard' => 'Structured opportunities, sponsors, capital need, stage, evidence, constraints and next action.', 'icon' => 'target'],
            ['number' => 5, 'name' => 'Risk Layer', 'standard' => 'Sovereign, political, regulatory, currency, sector, operational, ESG and counterparty risk.', 'icon' => 'triangle-alert'],
            ['number' => 6, 'name' => 'Live Intelligence Layer', 'standard' => 'Regulatory changes, tenders, projects, funding, alerts, news and monitored developments.', 'icon' => 'radio'],
            ['number' => 7, 'name' => 'Relationship Layer', 'standard' => 'Investors, DFIs, buyers, suppliers, project sponsors, agencies, experts and contact pathways.', 'icon' => 'network'],
            ['number' => 8, 'name' => 'AI Decision Layer', 'standard' => 'Search, compare, score, explain, shortlist, recommend and route to TBCA services under source controls.', 'icon' => 'sparkles'],
        ];
    }

    /** Section 10 — AIIM page and route architecture. */
    public static function routes(): array
    {
        return [
            ['page' => 'AIIM Home', 'route' => '/aiim', 'purpose' => 'Intent selector, Africa map, search, saved items, premium reports and advisory CTA.'],
            ['page' => 'Country Profile', 'route' => '/aiim/country/{countrySlug}', 'purpose' => 'Country snapshot, indicators, sectors, risks, projects, agencies and recommendation.'],
            ['page' => 'Sector Profile', 'route' => '/aiim/sector/{sectorSlug}', 'purpose' => 'Cross-country sector comparison, demand, constraints, players and opportunities.'],
            ['page' => 'Opportunity Profile', 'route' => '/aiim/opportunities/{opportunitySlug}', 'purpose' => 'Opportunity evidence, sponsor, capital, stage, risk, source and next action.'],
            ['page' => 'Project Profile', 'route' => '/aiim/projects/{projectSlug}', 'purpose' => 'Project details, location, stage, capital, documents, DD and VDR routes.'],
            ['page' => 'Investor and Funder Profile', 'route' => '/aiim/investors/{organisationSlug}', 'purpose' => 'Mandate, geography, sectors, ticket range, instruments and verified contact path.'],
            ['page' => 'Compare', 'route' => '/aiim/compare', 'purpose' => 'Compare countries, sectors, projects and opportunities using consistent metrics.'],
            ['page' => 'Corridors', 'route' => '/aiim/corridors', 'purpose' => 'Trade corridors, ports, rail, roads, borders, logistics and bottlenecks.'],
            ['page' => 'Watchlists', 'route' => '/aiim/workspace/watchlists', 'purpose' => 'Saved countries, sectors, entities, opportunities and monitored signals.'],
            ['page' => 'Reports Store', 'route' => '/aiim/store', 'purpose' => 'Premium country, sector, trade, opportunity, risk and investor briefs.'],
            ['page' => 'Workspace', 'route' => '/aiim/workspace', 'purpose' => 'Saved searches, alerts, downloads, subscriptions and advisory requests.'],
        ];
    }

    /** Intent selector presented on the AIIM launch screen. */
    public static function intents(): array
    {
        return [
            ['label' => 'I want to trade', 'body' => 'Find demand, corridors, tariffs and buyers.', 'icon' => 'ship'],
            ['label' => 'I want to invest', 'body' => 'Find opportunities, sponsors and capital structures.', 'icon' => 'trending-up'],
            ['label' => 'I want to enter a market', 'body' => 'Understand regulation, licensing, cost and partners.', 'icon' => 'door-open'],
            ['label' => 'I want to assess risk', 'body' => 'Sovereign, currency, regulatory and counterparty exposure.', 'icon' => 'shield-alert'],
            ['label' => 'I want to find partners', 'body' => 'Investors, DFIs, buyers, suppliers and agencies.', 'icon' => 'users'],
            ['label' => 'I want to monitor change', 'body' => 'Regulation, tenders, projects, funding and alerts.', 'icon' => 'bell'],
        ];
    }

    /** Section 11 — roles, entitlements and control. */
    public static function roles(): array
    {
        return [
            ['role' => 'Public Explorer', 'use' => 'View public layers and limited country or sector snapshots.', 'entitlement' => 'Public', 'control' => 'No confidential records.'],
            ['role' => 'Registered User', 'use' => 'Save searches, compare, receive alerts and maintain preferences.', 'entitlement' => 'Authenticated', 'control' => 'CRM contact and consent required.'],
            ['role' => 'Subscriber', 'use' => 'Access entitled data, dashboards, reports and monitoring.', 'entitlement' => 'Paid entitlement', 'control' => 'Subscription status validated.'],
            ['role' => 'Enterprise User', 'use' => 'Team workspace, bulk data, dashboards, API or advisory access.', 'entitlement' => 'Contract entitlement', 'control' => 'Role, organisation and data-sharing controls.'],
            ['role' => 'TBCA Advisor', 'use' => 'Use AIIM to support research, market entry, project and investment advisory.', 'entitlement' => 'Staff', 'control' => 'Need-to-know and source restrictions.'],
            ['role' => 'Data Curator', 'use' => 'Create, verify, date, score and publish records.', 'entitlement' => 'Internal specialist', 'control' => 'Maker-checker approval.'],
            ['role' => 'AIIM Approver', 'use' => 'Approve high-impact or premium intelligence.', 'entitlement' => 'Senior owner', 'control' => 'Publication lock and audit note.'],
        ];
    }

    /** Table 6 — data source tiers. */
    public static function sourceTiers(): array
    {
        return [
            ['tier' => 'Tier 1', 'sources' => 'National statistics offices, central banks, ministries, regulators, customs, port authorities, PPP units and geospatial agencies.', 'use' => 'Legal, policy, sector, official asset, fiscal, macro, trade and regulatory data.'],
            ['tier' => 'Tier 2', 'sources' => 'World Bank, IMF, AfDB, Afreximbank, UN Comtrade, WITS, ITC, WTO, UNCTAD, FAO, IEA, IRENA, UNECA and open geospatial sources.', 'use' => 'Cross-country benchmarks and machine-readable datasets.'],
            ['tier' => 'Tier 3', 'sources' => 'Company filings, DFI databases, donor projects, credit reports, satellite imagery, academic research, chambers, associations, media and field surveys.', 'use' => 'Market detail, project validation, private activity and early signals.'],
        ];
    }

    /** Table 7 — confidence grades. */
    public static function confidenceGrades(): array
    {
        return [
            ['grade' => 'A', 'definition' => 'Official, current, geocoded, machine-readable, audited.', 'treatment' => 'Display as primary fact.', 'tone' => 'verified'],
            ['grade' => 'B', 'definition' => 'Official but old, incomplete or not geocoded.', 'treatment' => 'Display with caution.', 'tone' => 'attested'],
            ['grade' => 'C', 'definition' => 'Credible third party with clear method.', 'treatment' => 'Display as supporting evidence.', 'tone' => 'referenced'],
            ['grade' => 'D', 'definition' => 'Media or private source requiring verification.', 'treatment' => 'Flag for validation.', 'tone' => 'controlled'],
            ['grade' => 'E', 'definition' => 'Field observation or crowdsourced.', 'treatment' => 'Use only after review.', 'tone' => 'risk'],
        ];
    }

    /** Section 13 — curation lifecycle. */
    public static function curationStages(): array
    {
        return [
            ['stage' => 'Ingest', 'treatment' => 'API, approved file, public source, partner feed or controlled manual entry.'],
            ['stage' => 'Validate', 'treatment' => 'Schema, required fields, country, sector, date and duplication.'],
            ['stage' => 'Verify', 'treatment' => 'Check source authority, freshness, consistency and evidence.'],
            ['stage' => 'Enrich', 'treatment' => 'Add geography, entity links, classifications, calculated fields and AI summary.'],
            ['stage' => 'Review', 'treatment' => 'Maker-checker review for premium, high-impact or low-confidence records.'],
            ['stage' => 'Publish', 'treatment' => 'Release to map, profile, report, dashboard or API according to entitlement.'],
            ['stage' => 'Monitor', 'treatment' => 'Refresh by cadence, source change, expiry or alert.'],
            ['stage' => 'Retire', 'treatment' => 'Withdraw stale, superseded, disputed or invalid records.'],
        ];
    }

    /** Required metadata on every published AIIM record. */
    public static function recordMetadata(): array
    {
        return [
            'Source organisation', 'Source URL or document reference', 'Publication date', 'Extraction date',
            'Country', 'Sector', 'Record owner', 'Confidence grade', 'Verification status',
            'Next review date', 'Permitted use', 'Publication status',
        ];
    }

    /** Phase 1 activation state. South Africa is the active verified pack. */
    public static function countries(): array
    {
        return [
            ['slug' => 'south-africa', 'name' => 'South Africa', 'iso' => 'ZA', 'region' => 'Southern Africa', 'status' => 'Verified pack active', 'grade' => 'A', 'wave' => 'Wave 1'],
            ['slug' => 'botswana', 'name' => 'Botswana', 'iso' => 'BW', 'region' => 'Southern Africa', 'status' => 'Pack in preparation', 'grade' => 'B', 'wave' => 'Wave 5'],
            ['slug' => 'malawi', 'name' => 'Malawi', 'iso' => 'MW', 'region' => 'Southern Africa', 'status' => 'Pack in preparation', 'grade' => 'B', 'wave' => 'Wave 5'],
            ['slug' => 'namibia', 'name' => 'Namibia', 'iso' => 'NA', 'region' => 'Southern Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'zambia', 'name' => 'Zambia', 'iso' => 'ZM', 'region' => 'Southern Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'kenya', 'name' => 'Kenya', 'iso' => 'KE', 'region' => 'East Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'nigeria', 'name' => 'Nigeria', 'iso' => 'NG', 'region' => 'West Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'ghana', 'name' => 'Ghana', 'iso' => 'GH', 'region' => 'West Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'egypt', 'name' => 'Egypt', 'iso' => 'EG', 'region' => 'North Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'morocco', 'name' => 'Morocco', 'iso' => 'MA', 'region' => 'North Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'tanzania', 'name' => 'Tanzania', 'iso' => 'TZ', 'region' => 'East Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
            ['slug' => 'rwanda', 'name' => 'Rwanda', 'iso' => 'RW', 'region' => 'East Africa', 'status' => 'Scheduled', 'grade' => 'C', 'wave' => 'Wave 5'],
        ];
    }

    public static function findCountry(string $slug): ?array
    {
        foreach (self::countries() as $country) {
            if ($country['slug'] === $slug) {
                return $country;
            }
        }

        return null;
    }

    public static function sectors(): array
    {
        return [
            ['slug' => 'agriculture-agro-processing', 'name' => 'Agriculture and Agro-Processing', 'icon' => 'wheat'],
            ['slug' => 'energy-renewables', 'name' => 'Energy and Renewables', 'icon' => 'zap'],
            ['slug' => 'mining-minerals', 'name' => 'Mining and Minerals', 'icon' => 'mountain'],
            ['slug' => 'infrastructure-transport', 'name' => 'Infrastructure and Transport', 'icon' => 'train-front'],
            ['slug' => 'manufacturing', 'name' => 'Manufacturing', 'icon' => 'factory'],
            ['slug' => 'financial-services', 'name' => 'Financial Services', 'icon' => 'landmark'],
            ['slug' => 'digital-technology', 'name' => 'Digital and Technology', 'icon' => 'cpu'],
            ['slug' => 'health-life-sciences', 'name' => 'Health and Life Sciences', 'icon' => 'heart-pulse'],
            ['slug' => 'tourism-hospitality', 'name' => 'Tourism and Hospitality', 'icon' => 'palmtree'],
            ['slug' => 'water-sanitation', 'name' => 'Water and Sanitation', 'icon' => 'droplets'],
            ['slug' => 'education-skills', 'name' => 'Education and Skills', 'icon' => 'graduation-cap'],
            ['slug' => 'logistics-trade', 'name' => 'Logistics and Trade', 'icon' => 'truck'],
        ];
    }

    public static function findSector(string $slug): ?array
    {
        foreach (self::sectors() as $sector) {
            if ($sector['slug'] === $slug) {
                return $sector;
            }
        }

        return null;
    }

    /** Table 5 — map interaction model. */
    public static function interactions(): array
    {
        return [
            ['interaction' => 'Select country', 'response' => 'Country border glows. Capital, ports, airports, economic zones and corridors activate.', 'guide' => 'Explains country profile, major commercial nodes and the next useful filter.'],
            ['interaction' => 'Select sector', 'response' => 'Relevant sector zones, assets and corridors appear. Non-relevant layers soften.', 'guide' => 'Explains why certain regions or countries are highlighted.'],
            ['interaction' => 'Select risk layer', 'response' => 'Risk overlays appear with colour intensity and confidence labels.', 'guide' => 'Explains risk category, data confidence and mitigation route.'],
            ['interaction' => 'Select currency', 'response' => 'All displayed prices and product costs convert to the selected currency.', 'guide' => 'States conversion timestamp and whether values are live or configured.'],
            ['interaction' => 'Compare countries', 'response' => 'Selected countries pulse together. Difference indicators appear.', 'guide' => 'Summarises ranking logic and recommends the next TBCA action.'],
            ['interaction' => 'Save opportunity', 'response' => 'Card moves to workspace. Map pins the saved selection.', 'guide' => 'Confirms the saved item and offers a briefing or verification pathway.'],
        ];
    }

    /** Premium intelligence store. */
    public static function reports(): array
    {
        return [
            ['name' => 'Country Market Entry Brief', 'scope' => 'One country', 'zar' => 4800, 'usd' => 270, 'grade' => 'A', 'summary' => 'Regulatory route, cost base, partner landscape and entry risk for a single market.'],
            ['name' => 'Sector Opportunity Assessment', 'scope' => 'One sector, up to five countries', 'zar' => 6400, 'usd' => 355, 'grade' => 'A', 'summary' => 'Demand, constraints, players and ranked opportunity set across markets.'],
            ['name' => 'Trade Corridor Brief', 'scope' => 'One corridor', 'zar' => 5200, 'usd' => 290, 'grade' => 'B', 'summary' => 'Ports, rail, road, border and logistics bottleneck analysis with cost indicators.'],
            ['name' => 'Country Comparison Report', 'scope' => 'Up to five countries', 'zar' => 5600, 'usd' => 310, 'grade' => 'A', 'summary' => 'Consistent metric comparison with heat map, risk matrix and ranking logic.'],
            ['name' => 'Risk and Exposure Brief', 'scope' => 'One country or counterparty set', 'zar' => 4400, 'usd' => 245, 'grade' => 'B', 'summary' => 'Sovereign, currency, regulatory and operational exposure with mitigation routes.'],
            ['name' => 'Investor and Funder Map', 'scope' => 'One sector or country', 'zar' => 7200, 'usd' => 400, 'grade' => 'B', 'summary' => 'Mandates, ticket ranges, instruments and verified contact pathways.'],
        ];
    }
}
