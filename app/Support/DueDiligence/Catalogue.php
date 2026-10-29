<?php

namespace App\Support\DueDiligence;

/**
 * Product families and the SKU register for TBCA Due Diligence.
 *
 * Copy and prices are taken from the Due Diligence mock-up pack (DD-001 to
 * DD-016) and the Part 4 blueprint (Table 18 SKU register, Section 17 pricing).
 * Fee categories always stay separate: TBCA Expert, TBCA Platform, External
 * Third Party (pass-through, plus a 25% administration margin where lawful)
 * and Tax/Payment.
 */
class Catalogue
{
    public const ADMIN_MARGIN = 0.25;

    public const TIERS = ['essential', 'enhanced', 'executive'];

    /** @return list<array<string, mixed>> */
    public static function families(): array
    {
        // Stable product code per family page (DDF-{slug}), used by the Registry of Deliverables links.
        return array_map(fn (array $f) => $f + [
            'code' => 'DDF-'.strtoupper($f['slug']),
            'template' => 'tiers',
            'why' => [],
            'triggers' => [],
            'subjectType' => 'company',
            'sampleCode' => null,
        ], self::rawFamilies());
    }

    public static function family(string $slug): ?array
    {
        foreach (self::families() as $family) {
            if ($family['slug'] === $slug) {
                return $family;
            }
        }

        return null;
    }

    /** @return list<string> */
    public static function slugs(): array
    {
        return array_column(self::rawFamilies(), 'slug');
    }

    /** @return list<array<string, mixed>> */
    public static function skus(?string $family = null): array
    {
        $all = [];
        foreach (self::rawSkus() as $familySlug => $rows) {
            foreach (array_values($rows) as $i => $row) {
                $all[] = self::normaliseSku($familySlug, $i, $row, count($rows));
            }
        }

        return $family === null ? $all : array_values(array_filter($all, fn ($s) => $s['family'] === $family));
    }

    public static function sku(string $code): ?array
    {
        foreach (self::skus() as $sku) {
            if ($sku['code'] === $code) {
                return $sku;
            }
        }

        return null;
    }

    /** SKUs that can be bought through the self-service quote journey. */
    public static function purchasable(array $sku): bool
    {
        return $sku['expert'] !== null && $sku['unit'] === 'once';
    }

    private static function normaliseSku(string $family, int $index, array $row, int $count): array
    {
        $tier = $row['tier'] ?? (self::TIERS[min(2, (int) floor($index * 3 / max(1, $count)))] ?? 'essential');
        $level = array_search($tier, self::TIERS, true);
        $expert = $row['expert'];
        $platform = $row['platform'] ?? ($expert === null ? null : (int) round($expert * 0.15));
        $external = $row['external'] ?? ($expert === null ? 0 : (int) (round($expert * 0.2 / 50) * 50));

        return [
            'code' => $row['code'],
            'family' => $family,
            'name' => $row['name'],
            'label' => $row['label'] ?? $row['name'],
            'tier' => $tier,
            'included' => $row['included'],
            'timeline' => $row['timeline'],
            'unit' => $row['unit'] ?? 'once',
            'expert' => $expert,
            'platform' => $platform,
            'external' => $external,
            'externalLabel' => $row['externalLabel'] ?? 'At cost',
            'total' => $expert === null ? null : $expert + $platform,
            'popular' => $row['popular'] ?? false,
            'coverage' => ['Standard', 'Enhanced', 'Comprehensive'][$level],
            'reviewLevel' => ['RL1 – Light review', 'RL2 – Standard review', 'RL3 – Substantive review'][$level],
            'reviewMandatory' => $level > 0 || in_array($family, ['investor', 'project-sponsor', 'institution', 'project'], true),
            'deliverables' => ['Standard report', 'Detailed report + annexure', 'Comprehensive report + annexures'][$level],
            'media' => ['Included (standard)', 'Included (enhanced)', 'Included (comprehensive)'][$level],
            'ownership' => ['Basic', 'Detailed', 'Full mapping & verification'][$level],
            'financial' => ['Not included', 'Basic financial review', 'Full financial review'][$level],
            'bestFor' => $row['bestFor'] ?? ['Low-risk, early-stage screening', 'Investment, onboarding and procurement assessment', 'High-risk and high-value decisions'][$level],
            'automation' => ['High automation', 'AI-assisted and human-reviewed', 'Human-led with senior review'][$level],
            'includedParties' => [3, 6, 10][$level],
        ];
    }

    /** Optional add-ons (DD-021). Board-provisional pricing, ex VAT. */
    public static function addons(): array
    {
        return [
            ['code' => 'DD-ADD-MEDIA', 'name' => 'Adverse Media Deep Scan', 'includes' => 'Extended media search (local language, regional & global).', 'useful' => 'High-profile subjects or sensitive industries.', 'timeline' => '+ 1–2 business days', 'days' => 2, 'zar' => 1950, 'icon' => 'Newspaper'],
            ['code' => 'DD-ADD-PEP', 'name' => 'PEP & Sanctions Enhanced', 'includes' => 'PEP watch, sanctions list refresh and cross-border risk layering.', 'useful' => 'Politically exposed persons or cross-border entities.', 'timeline' => '+ 1 business day', 'days' => 1, 'zar' => 2450, 'icon' => 'ShieldAlert'],
            ['code' => 'DD-ADD-SITE', 'name' => 'Site Visit / Physical Verification', 'includes' => 'On-site inspection and asset verification with photos and notes.', 'useful' => 'Physical assets, operational capacity or site risk.', 'timeline' => '+ 2–3 business days', 'days' => 3, 'zar' => 3950, 'icon' => 'MapPin'],
            ['code' => 'DD-ADD-FORENSIC', 'name' => 'Forensic Document Review', 'includes' => 'Detailed review of selected contracts and documents.', 'useful' => 'Complex agreements or red-flag documents.', 'timeline' => '+ 2–4 business days', 'days' => 4, 'zar' => 2950, 'icon' => 'FileSearch'],
            ['code' => 'DD-ADD-UBO', 'name' => 'Beneficial Ownership Deep Dive', 'includes' => 'Ultimate beneficial ownership, control and nominee tracing.', 'useful' => 'Complex ownership structures.', 'timeline' => '+ 2–5 business days', 'days' => 5, 'zar' => 4950, 'icon' => 'Network'],
            ['code' => 'DD-ADD-ESG', 'name' => 'ESG & Sustainability Review', 'includes' => 'ESG risk screening and sustainability performance indicators.', 'useful' => 'ESG-sensitive sectors or green finance.', 'timeline' => '+ 3–5 business days', 'days' => 5, 'zar' => 3450, 'icon' => 'Leaf'],
            ['code' => 'DD-ADD-RUSH', 'name' => 'Rush / Priority Turnaround', 'includes' => 'Expedited processing (subject to availability).', 'useful' => 'Tight deadlines or time-sensitive deals.', 'timeline' => 'Reduce total time by up to 50%', 'days' => 0, 'zar' => 4500, 'icon' => 'Zap'],
        ];
    }

    public static function addon(string $code): ?array
    {
        foreach (self::addons() as $addon) {
            if ($addon['code'] === $code) {
                return $addon;
            }
        }

        return null;
    }

    /**
     * Common external costs (at cost, approved per item before payment).
     * min/max are whole ZAR so the front end can show them in any currency;
     * `range` keeps the rand wording for PDFs and emails.
     */
    public static function externalCosts(): array
    {
        return [
            ['item' => 'Government Filing Fees', 'min' => 200, 'max' => 5000, 'plus' => false, 'range' => 'From R 200 – R 5,000', 'payable' => 'Government'],
            ['item' => 'Registry Search Fees', 'min' => 150, 'max' => 2500, 'plus' => false, 'range' => 'From R 150 – R 2,500', 'payable' => 'Registry'],
            ['item' => 'Courier / Legalisation', 'min' => 250, 'max' => 2000, 'plus' => false, 'range' => 'From R 250 – R 2,000', 'payable' => 'Courier'],
            ['item' => 'Third-Party Data Provider Fees', 'min' => 500, 'max' => 10000, 'plus' => true, 'range' => 'From R 500 – R 10,000+', 'payable' => 'Provider'],
            ['item' => 'Translation & Notarisation', 'min' => 300, 'max' => 2500, 'plus' => false, 'range' => 'From R 300 – R 2,500', 'payable' => 'Service Firm'],
            ['item' => 'International Verification', 'min' => 1000, 'max' => 20000, 'plus' => true, 'range' => 'From R 1,000 – R 20,000+', 'payable' => 'Provider'],
            ['item' => 'Site Visit Travel Costs', 'min' => 2000, 'max' => 15000, 'plus' => true, 'range' => 'From R 2,000 – R 15,000+', 'payable' => 'Travel Vendor'],
            ['item' => 'Other Disbursements', 'min' => null, 'max' => null, 'plus' => false, 'range' => 'At cost', 'payable' => 'Various'],
        ];
    }

    /** Monitoring plans offered after report delivery (DD-047). Monthly, ex VAT. */
    public static function monitoringPlans(): array
    {
        return [
            ['code' => 'DD-MON-ESS', 'name' => 'Essential Monitoring', 'expert' => 1000, 'platform' => 650, 'external' => 300, 'allowance' => 50, 'reviews' => 1, 'rechecks' => 0, 'tone' => 'neutral'],
            ['code' => 'DD-MON-ENH', 'name' => 'Enhanced Monitoring', 'expert' => 2200, 'platform' => 1150, 'external' => 600, 'allowance' => 100, 'reviews' => 2, 'rechecks' => 1, 'tone' => 'gold', 'popular' => true],
            ['code' => 'DD-MON-HRW', 'name' => 'Continuous Watch / High-Risk', 'expert' => 4500, 'platform' => 2450, 'external' => 1000, 'allowance' => 250, 'reviews' => 6, 'rechecks' => 2, 'tone' => 'risk'],
        ];
    }

    public static function monitoringPlan(string $code): ?array
    {
        foreach (self::monitoringPlans() as $plan) {
            if ($plan['code'] === $code) {
                return $plan + ['total' => $plan['expert'] + $plan['platform'] + $plan['external']];
            }
        }

        return null;
    }

    /* ------------------------------------------------------------------ */

    private static function rawSkus(): array
    {
        $tier = fn (string $code, string $name, int $expert, int $platform, int $external, string $timeline, string $included, bool $popular = false) => compact('code', 'name', 'expert', 'platform', 'external', 'timeline', 'included', 'popular') + ['externalLabel' => 'R '.number_format($external)];

        return [
            'individual' => [
                $tier('DD-IND-QC', 'Individual Quick Check', 1600, 850, 500, '2–5 business days', 'Identity-data capture, ID or document verification where available, sanctions, PEP, RCA & watchlist screening, basic adverse-media screening and evidence summary.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-IND-EDD', 'Individual Enhanced Due Diligence', 3200, 1250, 1500, '3–7 business days', 'Everything in Quick Check plus address or proof-of-address review, enhanced adverse-media assessment, director / company links, expanded evidence summary, risk narrative and mandatory human review.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-IND-EXE', 'Individual Executive / High-Risk Check', 5500, 1950, 2500, '5–10 business days', 'Enhanced Due Diligence plus employment and education verification, lawful criminal / reference checks where permitted, senior review and executive vetting narrative.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'company' => [
                $tier('DD-COMP-QC', 'Company Quick Check', 2600, 1350, 1000, '2–5 business days', 'Company registry, basic screening and structure check: registration status, company profile, sanctions and watchlist checks, basic director data.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-COMP-EDD', 'Company Enhanced Check', 4800, 1950, 2200, '5–10 business days', 'Registry plus ownership map, directors and UBO request, sanctions, PEP and adverse media, litigation signals and basic financials.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-COMP-EXE', 'Company Executive / High-Risk Check', 8500, 2850, 3600, '7–15 business days', 'Full ownership & director checks, AML / media review, litigation and insolvency review, financial analysis and senior reviewer conclusion.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'supplier' => [
                $tier('DD-SUP-ESS', 'Supplier Essential Check', 3500, 1650, 1800, '3–7 business days', 'Supplier identity, registration, tax/VAT, sanctions and adverse media on the supplier and key principals.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-SUP-ENH', 'Supplier Enhanced Due Diligence', 5900, 2450, 3600, '5–10 business days', 'Essential plus ownership and control, financial and credit stability, operational capacity and procurement red flags.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-SUP-EXE', 'Supplier Executive / High-Risk Review', 9400, 3750, 5800, '7–15 business days', 'Enhanced plus ESG and anti-bribery procurement integrity review, certifications, continuity notes and senior review.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'director-ubo' => [
                $tier('DD-DIR-ESS', 'Director & UBO Essential Check', 3000, 1450, 1500, '2–7 business days', 'Director identity and role verification, beneficial owner intake and sanctions, PEP and adverse media screening.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-DIR-UBO', 'Director and UBO Check', 5600, 2150, 3200, '5–10 business days', 'Essential plus UBO mapping, shareholding and control structure, conflicts and governance review.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-DIR-EXE', 'Director & UBO Executive / High-Risk Check', 8800, 2950, 5200, '7–15 business days', 'Enhanced plus cross-border, trust, nominee and layered-structure analysis with senior review.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'investor' => [
                $tier('DD-INV-ESS', 'Investor Essential Check', 3400, 1650, 1900, '2–5 business days', 'Investor identity and credentials, sanctions, PEP and adverse media screening.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-INV-PS', 'Investor Enhanced Check', 6300, 2550, 4100, '5–10 business days', 'Essential plus ownership and UBO review, source of funds / wealth indicators and mandate verification.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-INV-EXE', 'Investor Executive / High-Risk Check', 9800, 3850, 6300, '7–15 business days', 'Enhanced plus reputation, regulatory and cross-border risk review with senior review note.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'project-sponsor' => [
                $tier('DD-SPN-ESS', 'Project Sponsor Essential Check', 4500, 2050, 2400, '2–5 business days', 'Sponsor identity, corporate profile, directors and sanctions / media screening.') + ['label' => 'Essential (Standard Checks)'],
                $tier('DD-SPN-ENH', 'Project Sponsor Enhanced Check', 7200, 2850, 4900, '5–10 business days', 'Essential plus track record and delivery history, ownership and governance, and funding readiness.', true) + ['label' => 'Enhanced (Extended Checks)'],
                $tier('DD-SPN-EXE', 'Project Sponsor Executive / High-Risk Check', 10900, 4050, 8000, '7–15 business days', 'Enhanced plus regulatory, legal, stakeholder and ESG integrity review with senior review.') + ['label' => 'Executive / High-Risk (Comprehensive)'],
            ],
            'institution' => [
                ['code' => 'DD-INS-S7-540', 'name' => 'Institution DD – Base', 'included' => 'Legal status, governance, owners, sanctions and basic financial review.', 'timeline' => '7–10 business days', 'expert' => 16500, 'platform' => 2475],
                ['code' => 'DD-INS-S7-541', 'name' => 'Institution Governance & Counterparty Review', 'included' => 'Enhanced governance, control, financial analysis and counterparty assessment.', 'timeline' => '10–15 business days', 'expert' => 21000, 'platform' => 3150, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-INS-S7-542', 'name' => 'Public-Sector / DFI Reliance Review', 'included' => 'Mandate, public interest alignment, risk of state influence and donor compliance.', 'timeline' => '10–15 business days', 'expert' => 21000, 'platform' => 3150, 'tier' => 'executive'],
                ['code' => 'DD-INS-S10-543', 'name' => 'Institution DD Report (Expert Signed)', 'included' => 'Expert review, quality assurance and signed report.', 'timeline' => '3–5 business days', 'expert' => 6500, 'platform' => 975, 'external' => 0, 'externalLabel' => '—', 'tier' => 'executive'],
            ],
            'aml-kyc-kyb' => [
                ['code' => 'DD-AML-S4-600', 'name' => 'Individual KYC Onboarding Pack (Base)', 'included' => 'Identity verification, liveness, sanctions screening.', 'timeline' => '3–5 business days', 'expert' => 3250, 'platform' => 488, 'tier' => 'essential'],
                ['code' => 'DD-AML-S4-601', 'name' => 'Business KYB Onboarding Pack (Base)', 'included' => 'Business verification, ownership, signatories, sanctions screening.', 'timeline' => '5–7 business days', 'expert' => 5950, 'platform' => 893, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-AML-S5-602', 'name' => 'AML Enhanced Screening (Individual)', 'included' => 'Enhanced PEP, adverse media and risk review.', 'timeline' => '5–10 business days', 'expert' => 5040, 'platform' => 756, 'tier' => 'enhanced'],
                ['code' => 'DD-AML-S5-603', 'name' => 'Company AML & UBO Review', 'included' => 'UBO identification, enhanced KYB, sanctions & media review.', 'timeline' => '7–15 business days', 'expert' => 8400, 'platform' => 1260, 'tier' => 'executive'],
            ],
            'project' => [
                ['code' => 'DD-PDD-S6-700', 'name' => 'Project DD – Basic', 'included' => 'High-level review across key commercial, technical & legal areas.', 'timeline' => '5–10 business days', 'expert' => 19750, 'platform' => 2963],
                ['code' => 'DD-PDD-S6-701', 'name' => 'Project DD – Standard', 'included' => 'Detailed review with financial model checks and risk assessment.', 'timeline' => '10–20 business days', 'expert' => 36750, 'platform' => 5513, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-PDD-S6-702', 'name' => 'Project DD – Comprehensive', 'included' => 'Full scope due diligence with field verification and stakeholder analysis.', 'timeline' => '20–40 business days', 'expert' => 78500, 'platform' => 11775, 'tier' => 'executive'],
                ['code' => 'DD-PDD-S6-703', 'name' => 'Project DD – Investor Grade', 'included' => 'Independent expert panel review, deep validation and stress testing.', 'timeline' => '30–60 business days', 'expert' => 132500, 'platform' => 19875, 'tier' => 'executive'],
            ],
            'esg' => [
                ['code' => 'DD-ESG-S7-800', 'name' => 'ESG Screening (Basic)', 'included' => 'High-level ESG screening and risk overview.', 'timeline' => '5–7 business days', 'expert' => 9750, 'platform' => 1463],
                ['code' => 'DD-ESG-S7-801', 'name' => 'ESG Assessment (Standard)', 'included' => 'Materiality assessment, data review and risk analysis.', 'timeline' => '10–15 business days', 'expert' => 21000, 'platform' => 3150, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-ESG-S7-802', 'name' => 'ESG Due Diligence (Comprehensive)', 'included' => 'Full ESG DD with site review, scorecard and action plan.', 'timeline' => '20–30 business days', 'expert' => 42000, 'platform' => 6300, 'tier' => 'executive'],
                ['code' => 'DD-ESG-S7-803', 'name' => 'ESG Investor Grade', 'included' => 'Investor-grade ESG DD with verification and benchmarking.', 'timeline' => '30–45 business days', 'expert' => 68000, 'platform' => 10200, 'tier' => 'executive'],
            ],
            'enterprise' => [
                ['code' => 'DD-ENT-S6-900', 'name' => 'Enterprise Screening – Basic', 'included' => 'Business verification, sanctions screening and media check.', 'timeline' => '3–5 business days', 'expert' => 3950, 'platform' => 593],
                ['code' => 'DD-ENT-S6-901', 'name' => 'Enterprise Screening – Standard', 'included' => 'Includes ownership mapping and financial snapshot.', 'timeline' => '5–7 business days', 'expert' => 7450, 'platform' => 1118, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-ENT-S6-902', 'name' => 'Enterprise Screening – Comprehensive', 'included' => 'Full screening with deep financial, legal and compliance review.', 'timeline' => '10–15 business days', 'expert' => 14950, 'platform' => 2243, 'tier' => 'executive'],
                ['code' => 'DD-ENT-S6-903', 'name' => 'Enterprise Screening – Investor Grade', 'included' => 'Enhanced analysis, site review option, and expert validation.', 'timeline' => '15–20 business days', 'expert' => 24950, 'platform' => 3743, 'tier' => 'executive'],
            ],
            'monitoring' => [
                ['code' => 'DD-MON-S13-850', 'name' => 'Monitoring – Up to 10 subjects', 'included' => 'Continuous monitoring, alerts and monthly summary report.', 'timeline' => 'Monthly', 'expert' => 1800, 'platform' => 270, 'unit' => 'monthly'],
                ['code' => 'DD-MON-S13-851', 'name' => 'Monitoring – Up to 50 subjects', 'included' => 'Continuous monitoring, alerts and monthly summary report.', 'timeline' => 'Monthly', 'expert' => 5500, 'platform' => 825, 'unit' => 'monthly', 'popular' => true],
                ['code' => 'DD-MON-S13-852', 'name' => 'Monitoring – Up to 100 subjects', 'included' => 'Continuous monitoring, alerts and monthly summary report.', 'timeline' => 'Monthly', 'expert' => 9500, 'platform' => 1425, 'unit' => 'monthly'],
                ['code' => 'DD-MON-S13-853', 'name' => 'Reviewed Monitoring Alert', 'included' => 'Analyst review and risk recommendation.', 'timeline' => 'Per alert', 'expert' => 1680, 'platform' => 252, 'unit' => 'per alert'],
                ['code' => 'DD-MON-S13-854', 'name' => 'Urgent Same-Day Alert Review', 'included' => 'Priority analyst review (same business day).', 'timeline' => 'Per alert', 'expert' => 840, 'platform' => 126, 'unit' => 'per alert'],
                ['code' => 'DD-MON-S14-855', 'name' => 'Annual Recertification Review', 'included' => 'Annual review and updated risk assessment.', 'timeline' => 'Annual', 'expert' => 3950, 'platform' => 593, 'unit' => 'annual'],
            ],
            'reports' => [
                ['code' => 'DD-RPT-S10-900', 'name' => 'DD Report (Standard)', 'included' => 'Full report with executive summary and findings.', 'timeline' => '5–7 business days', 'expert' => 8950, 'platform' => 1118],
                ['code' => 'DD-RPT-S10-901', 'name' => 'DD Report (Comprehensive)', 'included' => 'Enhanced report with deep analysis and annexures.', 'timeline' => '7–10 business days', 'expert' => 16950, 'platform' => 2243, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-RPT-S10-902', 'name' => 'Executive Summary', 'included' => 'Board or investor summary pack.', 'timeline' => '3–5 business days', 'expert' => 5950, 'platform' => 593, 'tier' => 'essential'],
                ['code' => 'DD-RPT-S10-903', 'name' => 'Custom Dashboard Report', 'included' => 'Custom metrics dashboard and report.', 'timeline' => '10–15 business days', 'expert' => 24950, 'platform' => 3743, 'tier' => 'executive'],
                ['code' => 'DD-RPT-S14-904', 'name' => 'Report Reissue (New Scope)', 'included' => 'Reissue report with updated scope or new findings.', 'timeline' => '3–5 business days', 'expert' => 6950, 'platform' => 825, 'tier' => 'executive'],
            ],
            'portal-api' => [
                ['code' => 'DD-API-S0-900', 'name' => 'Standard Portal Setup', 'included' => 'Tenant setup, roles, templates, workflows and branding.', 'timeline' => '5–7 business days', 'expert' => 35000, 'platform' => 1118],
                ['code' => 'DD-API-S0-901', 'name' => 'API Integration', 'included' => 'API mapping, sandbox, security testing and production cutover.', 'timeline' => '10–15 business days', 'expert' => 85000, 'platform' => 2243, 'popular' => true, 'tier' => 'enhanced'],
                ['code' => 'DD-API-S13-902', 'name' => 'API Usage (Allowance)', 'included' => 'Metered API calls, usage reporting and monitoring.', 'timeline' => 'Monthly', 'expert' => 12600, 'platform' => 630, 'unit' => 'monthly', 'tier' => 'enhanced'],
                ['code' => 'DD-API-S13-903', 'name' => 'Priority Support & SLA', 'included' => 'Enhanced support, faster response and SLA coverage.', 'timeline' => 'Monthly', 'expert' => 16800, 'platform' => 840, 'unit' => 'monthly', 'tier' => 'executive'],
                ['code' => 'DD-API-S0-904', 'name' => 'Custom Integration', 'included' => 'Custom development and advanced integrations.', 'timeline' => 'By scope', 'expert' => null, 'platform' => null, 'unit' => 'quote', 'externalLabel' => 'At cost', 'tier' => 'executive'],
            ],
        ];
    }

    private static function rawFamilies(): array
    {
        return [
            [
                'slug' => 'individual', 'name' => 'Individual Checks', 'icon' => 'UserSearch', 'subjectType' => 'individual',
                'short' => 'ID verification, criminal, address, employment, credit & more.',
                'selector' => 'Identity, sanctions, PEP, watchlists and adverse media checks.',
                'title' => 'Individual Checks Overview',
                'subtitle' => 'Verify people with confidence before you engage, hire, appoint or transact.',
                'description' => 'Comprehensive individual due diligence including identity verification, sanctions and PEP screening, watchlists, adverse media, address and employment verification, education and reference checks, and other lawful integrity checks for individuals.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 2–5 business days. Expedited options available.',
                'cta' => 'Start Individual Check',
                'covers' => [
                    ['title' => 'Identity Verification', 'body' => 'Verify identity documents, date of birth, nationality and biometric consistency where available.', 'icon' => 'IdCard'],
                    ['title' => 'Sanctions & PEP', 'body' => 'Screen against global sanctions, PEPs and enhanced risk lists.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Adverse Media', 'body' => 'Search global media sources for negative news, legal actions and reputational risk.', 'icon' => 'Newspaper'],
                    ['title' => 'Employment & Education', 'body' => 'Verify employment history, positions held, qualifications and professional memberships.', 'icon' => 'GraduationCap'],
                    ['title' => 'Address & Contact', 'body' => 'Validate current and previous addresses, phone numbers and contact details.', 'icon' => 'MapPin'],
                    ['title' => 'Optional Criminal / Reference Checks', 'body' => 'Lawful criminal record checks (where permitted) and professional reference verification.', 'icon' => 'FolderSearch'],
                ],
                'useCases' => [
                    ['title' => 'Executive Vetting', 'body' => 'Senior executives, CEOs, CFOs and board appointments.', 'icon' => 'Briefcase'],
                    ['title' => 'New Hires', 'body' => 'Pre-employment screening for all new employees.', 'icon' => 'UserPlus'],
                    ['title' => 'Key Staff', 'body' => 'Critical roles in finance, ops, legal and compliance.', 'icon' => 'UserCog'],
                    ['title' => 'Counterparties', 'body' => 'Suppliers, partners and business counterparties.', 'icon' => 'Handshake'],
                    ['title' => 'Trustees & Fiduciaries', 'body' => 'Boards, trustees and fiduciary appointment oversight.', 'icon' => 'Users'],
                    ['title' => 'Directors', 'body' => 'Director appointments and ongoing director screening.', 'icon' => 'UserCheck'],
                    ['title' => 'Consultants', 'body' => 'Independent consultants and interim appointments.', 'icon' => 'Star'],
                    ['title' => 'Investors', 'body' => 'Investors, shareholders and funding counterparties.', 'icon' => 'TrendingUp'],
                ],
                'receive' => [
                    ['title' => 'Clear Summary Report', 'body' => 'Concise findings with risk indicators (not conclusions).', 'icon' => 'FileText'],
                    ['title' => 'Flagged Findings Overview', 'body' => 'Key matches and issues highlighted for review.', 'icon' => 'Flag'],
                    ['title' => 'Evidence Log', 'body' => 'Source list and evidence trail for every finding.', 'icon' => 'FolderOpen'],
                    ['title' => 'Human Review Status', 'body' => 'Expert analyst review and quality assurance.', 'icon' => 'BadgeCheck'],
                    ['title' => 'Secure Portal Delivery', 'body' => 'Reports delivered securely via your client portal.', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'company', 'name' => 'Company Checks', 'icon' => 'Building2',
                'short' => 'Company registration, financials, directors, litigation & sanctions.',
                'selector' => 'Registration, directors, ownership, financials and risk profile.',
                'title' => 'Company Checks Overview',
                'subtitle' => 'Verify companies with confidence before you contract, invest, lend or partner.',
                'description' => 'Comprehensive company due diligence covering registration, directors and beneficial ownership, sanctions and adverse media, litigation, financial and compliance signals, and governance risk for companies and counterparties.',
                'sample' => 'Amari Holdings screening Kanyisa Power Systems',
                'sla' => 'Typical 2–7 business days. Expedited options available.',
                'cta' => 'Start Company Check',
                'covers' => [
                    ['title' => 'Registration & Status', 'body' => 'Confirm legal name, registration number, active status, incorporation date and registered office.', 'icon' => 'FileText'],
                    ['title' => 'Directors & UBOs', 'body' => 'Identify directors, beneficial owners, control persons and governance links.', 'icon' => 'Users'],
                    ['title' => 'Ownership & Shareholding', 'body' => 'Review ownership structure, shareholders and control profile where available.', 'icon' => 'Network'],
                    ['title' => 'Sanctions & Adverse Media', 'body' => 'Screen company and related parties for sanctions, PEP links, watchlists and negative media.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Litigation / Insolvency', 'body' => 'Review available litigation, insolvency, business rescue and enforcement signals.', 'icon' => 'Scale'],
                    ['title' => 'Financial & Compliance Profile', 'body' => 'Assess company profile, credit and compliance indicators, and key operating risk markers.', 'icon' => 'BarChart3'],
                ],
                'useCases' => [
                    ['title' => 'Supplier Onboarding', 'body' => 'New supplier verification and procurement screening.', 'icon' => 'Truck'],
                    ['title' => 'Investor Screening', 'body' => 'Counterparty and target company review before engagement.', 'icon' => 'UserSearch'],
                    ['title' => 'JV / Partner Review', 'body' => 'Assess local partners, distributors and strategic allies.', 'icon' => 'Handshake'],
                    ['title' => 'Lender / Credit Review', 'body' => 'Screen borrowers, obligors and guarantee counterparties.', 'icon' => 'Landmark'],
                    ['title' => 'Tender & Procurement', 'body' => 'Vendor and bidder integrity review.', 'icon' => 'ClipboardList'],
                    ['title' => 'M&A Target Checks', 'body' => 'Early-stage acquisition and investment screening.', 'icon' => 'Target'],
                    ['title' => 'Board & Governance', 'body' => 'Review governance standing before appointments or mandates.', 'icon' => 'Users'],
                    ['title' => 'Cross-Border Deals', 'body' => 'Check entities involved in multi-jurisdiction transactions.', 'icon' => 'Globe'],
                ],
                'receive' => [
                    ['title' => 'Executive Summary Report', 'body' => 'Clear summary of findings and material risks.', 'icon' => 'FileText'],
                    ['title' => 'Flagged Findings', 'body' => 'Key issues highlighted for management attention.', 'icon' => 'Flag'],
                    ['title' => 'Evidence Log', 'body' => 'Source list and auditable trail for each finding.', 'icon' => 'FolderOpen'],
                    ['title' => 'Risk View', 'body' => 'Risk-rated observations and next-step guidance.', 'icon' => 'ShieldCheck'],
                    ['title' => 'Human Review', 'body' => 'Analyst review and quality assurance before release.', 'icon' => 'BadgeCheck'],
                    ['title' => 'Secure Portal Delivery', 'body' => 'Reports delivered securely through the client portal.', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'supplier', 'name' => 'Supplier Checks', 'icon' => 'Package',
                'short' => 'Supplier vetting, performance, compliance and risk assessment.',
                'selector' => 'Compliance, capacity, financial, ESG and procurement readiness.',
                'title' => 'Supplier Checks Overview',
                'subtitle' => 'Assess suppliers with confidence before you onboard, contract or procure.',
                'description' => 'Comprehensive supplier due diligence covering legal status, ownership, sanctions, financial stability, ESG and compliance, operational capacity, procurement integrity and performance risk.',
                'sample' => 'Amari Holdings screening Kanyisa Power Systems',
                'sla' => 'Typical 3–7 business days. Expedited options available.',
                'cta' => 'Start Supplier Check',
                'covers' => [
                    ['title' => 'Supplier Identity & Registration', 'body' => 'Confirm legal existence, registration, tax/VAT and operating details.', 'icon' => 'IdCard'],
                    ['title' => 'Ownership & Control', 'body' => 'Review parent company, beneficial ownership and control structure.', 'icon' => 'Network'],
                    ['title' => 'Sanctions & Adverse Media', 'body' => 'Screen supplier and key principals for PEP, sanctions, watchlists and negative media.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Financial & Credit Stability', 'body' => 'Assess solvency signals, payment stress and financial risk indicators.', 'icon' => 'BarChart3'],
                    ['title' => 'Operational & Capacity Review', 'body' => 'Evaluate production or service capacity, certifications, delivery capability and resilience.', 'icon' => 'Factory'],
                    ['title' => 'ESG & Procurement Integrity', 'body' => 'Review ethics, labour, environmental and anti-bribery procurement risk factors.', 'icon' => 'Leaf'],
                ],
                'useCases' => [
                    ['title' => 'New Supplier Onboarding', 'icon' => 'Users'],
                    ['title' => 'Tender & Procurement', 'icon' => 'Gavel'],
                    ['title' => 'Strategic Sourcing', 'icon' => 'Target'],
                    ['title' => 'Cross-Border Supply Chains', 'icon' => 'Globe'],
                    ['title' => 'Distributor / Channel Partner Review', 'icon' => 'Handshake'],
                    ['title' => 'Manufacturing Inputs Screening', 'icon' => 'Settings'],
                    ['title' => 'Project Vendor Prequalification', 'icon' => 'ClipboardList'],
                    ['title' => 'Public Sector Vendor Integrity', 'icon' => 'Landmark'],
                ],
                'receive' => [
                    ['title' => 'Executive Summary Report', 'icon' => 'FileText'],
                    ['title' => 'Risk-Rated Findings', 'icon' => 'ShieldCheck'],
                    ['title' => 'Evidence Log', 'icon' => 'FolderOpen'],
                    ['title' => 'Human Review', 'icon' => 'BadgeCheck'],
                    ['title' => 'Supplier Risk View', 'icon' => 'Eye'],
                    ['title' => 'Secure Portal Delivery', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'director-ubo', 'name' => 'Director & UBO Checks', 'icon' => 'Network', 'subjectType' => 'individual',
                'short' => 'Director profiles, UBO mapping, conflicts and adverse media.',
                'selector' => 'Directors, beneficial owners and control verification.',
                'title' => 'Director & UBO Checks Overview',
                'subtitle' => 'Verify decision-makers, controllers and beneficial owners before you appoint, engage, fund or transact.',
                'description' => 'Comprehensive due diligence covering director identity and role validation, UBO mapping, ownership and control review, PEP/sanctions/adverse media screening, conflicts and governance signals, and cross-border control-risk assessment.',
                'sample' => 'Amari Holdings screening Kanyisa Power Systems',
                'sla' => 'Typical 2–7 business days. Expedited options available.',
                'cta' => 'Start Director & UBO Check',
                'covers' => [
                    ['title' => 'Director Identity & Role Verification', 'body' => 'Verify names, role history, appointments and authority signals.', 'icon' => 'IdCard'],
                    ['title' => 'UBO Mapping & Ownership', 'body' => 'Identify beneficial owners and control chains where available.', 'icon' => 'Users'],
                    ['title' => 'Shareholding & Control Structure', 'body' => 'Review direct and indirect ownership, nominee or layered holdings.', 'icon' => 'Network'],
                    ['title' => 'Sanctions, PEP & Adverse Media', 'body' => 'Screen directors, controllers and related parties.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Conflicts & Governance Review', 'body' => 'Review governance exposures, related-party links and decision-risk signals.', 'icon' => 'Scale'],
                    ['title' => 'Cross-Border / High-Risk Structures', 'body' => 'Highlight offshore, trust, nominee or complex control patterns.', 'icon' => 'Globe'],
                ],
                'useCases' => [
                    ['title' => 'Board Appointments', 'icon' => 'Users'],
                    ['title' => 'Investor Onboarding', 'icon' => 'UserPlus'],
                    ['title' => 'Counterparty Screening', 'icon' => 'UserSearch'],
                    ['title' => 'Lender / Guarantor Review', 'icon' => 'Landmark'],
                    ['title' => 'M&A Target Review', 'icon' => 'Target'],
                    ['title' => 'Procurement Signatory Checks', 'icon' => 'ClipboardList'],
                    ['title' => 'JV / Partner Checks', 'icon' => 'Handshake'],
                    ['title' => 'Institutional Governance Review', 'icon' => 'Building'],
                ],
                'receive' => [
                    ['title' => 'UBO Map', 'icon' => 'Network'],
                    ['title' => 'Director Profile Summary', 'icon' => 'IdCard'],
                    ['title' => 'Flagged Findings', 'icon' => 'Flag'],
                    ['title' => 'Evidence Log', 'icon' => 'FolderOpen'],
                    ['title' => 'Human Review', 'icon' => 'BadgeCheck'],
                    ['title' => 'Secure Portal Delivery', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'investor', 'name' => 'Investor Checks', 'icon' => 'TrendingUp',
                'short' => 'Investor verification, reputation, sanctions and regulatory status.',
                'selector' => 'Investor credibility, mandate, ownership and funding sources.',
                'title' => 'Investor Checks Overview',
                'subtitle' => 'Verify investors with confidence before you onboard, negotiate, fund or transact.',
                'description' => 'Comprehensive investor due diligence covering identity and mandate verification, ownership and source-of-funds indicators, sanctions and PEP screening, reputation and adverse media, capacity to invest, regulatory red flags, and counterparty credibility.',
                'sample' => 'Amari Holdings screening Kanyisa Power Systems',
                'sla' => 'Typical 2–5 business days, depends on scope.',
                'cta' => 'Start Investor Check',
                'covers' => [
                    ['title' => 'Investor Identity & Credentials', 'body' => 'Verify legal identity, track record, credentials and professional standing.', 'icon' => 'IdCard'],
                    ['title' => 'Ownership & UBO Review', 'body' => 'Map ownership structure and ultimate beneficial owners.', 'icon' => 'Users'],
                    ['title' => 'Source of Funds / Wealth Indicators', 'body' => 'Assess source of wealth indicators and capacity to invest.', 'icon' => 'Coins'],
                    ['title' => 'Sanctions, PEP & Adverse Media', 'body' => 'Screen investors against sanctions, PEP and adverse media.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Mandate, Authority & Investment Capacity', 'body' => 'Confirm mandate, authority and investment mandate/capacity.', 'icon' => 'BadgeCheck'],
                    ['title' => 'Reputation, Regulatory & Cross-Border Risk', 'body' => 'Assess reputation, regulatory standing and cross-border risk factors.', 'icon' => 'Globe'],
                ],
                'useCases' => [
                    ['title' => 'Private Equity Screening', 'icon' => 'Users'],
                    ['title' => 'Strategic Investor Onboarding', 'icon' => 'Handshake'],
                    ['title' => 'Co-Investor Review', 'icon' => 'UserSearch'],
                    ['title' => 'Institutional Investor Qualification', 'icon' => 'Landmark'],
                    ['title' => 'Lender / Capital Provider Review', 'icon' => 'Coins'],
                    ['title' => 'JV / Equity Partner Review', 'icon' => 'Puzzle'],
                ],
                'receive' => [
                    ['title' => 'Executive Summary Report', 'icon' => 'FileText'],
                    ['title' => 'Risk-Rated Findings', 'icon' => 'ShieldCheck'],
                    ['title' => 'Evidence Log', 'icon' => 'FolderOpen'],
                    ['title' => 'Investor Profile Summary', 'icon' => 'IdCard'],
                    ['title' => 'Human Review', 'icon' => 'BadgeCheck'],
                    ['title' => 'Secure Portal Delivery', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'project-sponsor', 'name' => 'Project Sponsor Checks', 'icon' => 'HardHat',
                'short' => 'Sponsor background, track record and project experience.',
                'selector' => 'Track record, governance, capacity and project experience.',
                'title' => 'Project Sponsor Checks Overview',
                'subtitle' => 'Assess project sponsors with confidence before you partner, fund, mandate or approve.',
                'description' => 'Comprehensive due diligence on sponsor capability, governance, track record, financial backing, delivery capacity, stakeholder integrity, and risk signals — so you can decide with clarity.',
                'sample' => 'Amari Holdings screening Kanyisa Power Systems',
                'sla' => 'Typical 2–5 business days, depends on scope.',
                'cta' => 'Start Project Sponsor Check',
                'covers' => [
                    ['title' => 'Sponsor Identity & Corporate Profile', 'body' => 'Verify legal identity, group structure, directors and corporate background.', 'icon' => 'Building2'],
                    ['title' => 'Track Record & Delivery History', 'body' => 'Assess completed projects, performance, references and delivery outcomes.', 'icon' => 'BarChart3'],
                    ['title' => 'Ownership & Governance', 'body' => 'Map ownership, control, board composition and governance practices.', 'icon' => 'Users'],
                    ['title' => 'Financial Capacity & Funding Readiness', 'body' => 'Evaluate financial strength, funding sources and capital commitments.', 'icon' => 'Coins'],
                    ['title' => 'Regulatory / Legal / Reputation Review', 'body' => 'Screen regulatory compliance, legal exposures and reputation risk factors.', 'icon' => 'Scale'],
                    ['title' => 'Stakeholder, ESG & Project Integrity', 'body' => 'Assess stakeholder standing, ESG performance and integrity risk signals.', 'icon' => 'Leaf'],
                ],
                'useCases' => [
                    ['title' => 'PPP / Infrastructure Screening', 'icon' => 'Building'],
                    ['title' => 'EPC / Contractor Review', 'icon' => 'HardHat'],
                    ['title' => 'Investor Consortium Review', 'icon' => 'Users'],
                    ['title' => 'Project Bid Sponsor Review', 'icon' => 'ClipboardList'],
                    ['title' => 'Strategic Partner Review', 'icon' => 'Handshake'],
                    ['title' => 'Major Capital Project Review', 'icon' => 'Factory'],
                ],
                'receive' => [
                    ['title' => 'Executive Summary Report', 'icon' => 'FileText'],
                    ['title' => 'Risk-Rated Findings', 'icon' => 'ShieldCheck'],
                    ['title' => 'Evidence Log', 'icon' => 'FolderOpen'],
                    ['title' => 'Sponsor Profile Summary', 'icon' => 'IdCard'],
                    ['title' => 'Human Review', 'icon' => 'BadgeCheck'],
                    ['title' => 'Secure Portal Delivery', 'icon' => 'Lock'],
                ],
            ],
            [
                'slug' => 'institution', 'name' => 'Institution Checks', 'icon' => 'Landmark', 'template' => 'table', 'subjectType' => 'institution', 'sampleCode' => 'DD-009',
                'short' => 'Bank, fund, NGO and institution due diligence and reputation.',
                'selector' => 'Legal status, governance, counterparties and risk assessment.',
                'title' => 'Institution Checks Overview',
                'subtitle' => 'Assess institutions with confidence. Verify legal standing, governance, owners and control.',
                'description' => 'Our institution due diligence services help you validate banks, DFIs, state entities, public bodies, NGOs and other organisations you plan to engage with.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 7–15 business days.',
                'cta' => 'Start Institution Check',
                'covers' => [
                    ['title' => 'Legal Status & Registration', 'body' => 'Verify incorporation, licensing and good standing across relevant registries.', 'icon' => 'ShieldCheck'],
                    ['title' => 'Governance & Structure', 'body' => 'Assess governance framework, board composition and decision rights.', 'icon' => 'Network'],
                    ['title' => 'Owners & Beneficial Control', 'body' => 'Identify direct and ultimate owners and control relationships.', 'icon' => 'Users'],
                    ['title' => 'Financial Standing', 'body' => 'Review financial statements, solvency indicators and credit signals.', 'icon' => 'Landmark'],
                    ['title' => 'Regulatory & Sanctions', 'body' => 'Screen against sanctions, watchlists, adverse media and regulatory actions.', 'icon' => 'Scale'],
                    ['title' => 'Public Interest & Mandate', 'body' => 'Evaluate mandate, public interest role and alignment with objectives.', 'icon' => 'BadgeCheck'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Institution DD Report', 'body' => 'Clear findings with evidence references.', 'icon' => 'FileText'],
                    ['title' => 'Risk & Control Score', 'body' => 'Overall risk view with key driver analysis.', 'icon' => 'Gauge'],
                    ['title' => 'Owner & Control Map', 'body' => 'Visual structure and ownership chart.', 'icon' => 'Network'],
                    ['title' => 'Compliance Summary', 'body' => 'Regulatory status and sanctions results.', 'icon' => 'ClipboardCheck'],
                    ['title' => 'Recommendations', 'body' => 'Mitigation actions and engagement guidance.', 'icon' => 'Lightbulb'],
                ],
                'why' => ['Avoid regulatory and reputational exposure.', 'Understand who ultimately controls the institution.', 'Strengthen your counterparty and investment decisions.', 'Meet fiduciary, AML/CFT and governance obligations.'],
                'triggers' => ['Engaging a bank, DFI, state entity or NGO', 'Partnership, funding or procurement due diligence', 'Compliance, AML/CFT or fiduciary requirements'],
            ],
            [
                'slug' => 'aml-kyc-kyb', 'name' => 'AML, KYC & KYB', 'icon' => 'ScanFace', 'template' => 'table', 'sampleCode' => 'DD-010',
                'short' => 'Anti-money laundering, KYC for individuals and KYB for companies.',
                'selector' => 'Structured onboarding, evidence and AML screening.',
                'title' => 'AML, KYC & KYB Overview',
                'subtitle' => 'Know who you are dealing with. Detect risk early. Comply with confidence.',
                'description' => 'Comprehensive Anti-Money Laundering, Know Your Customer (KYC) and Know Your Business (KYB) services designed to meet regulatory obligations and protect your institution, transactions and reputation.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 3–15 business days by package.',
                'cta' => 'Start AML / KYC / KYB Check',
                'covers' => [
                    ['title' => 'Customer Identification', 'body' => 'Verify identity of individuals using official documents, biometric and liveness verification.', 'icon' => 'User'],
                    ['title' => 'Business Verification', 'body' => 'Confirm business existence, registration, structure, ownership and authorised signatories.', 'icon' => 'Building2'],
                    ['title' => 'Sanctions Screening', 'body' => 'Screen against global and local sanctions lists, watchlists and regulatory alerts.', 'icon' => 'ShieldCheck'],
                    ['title' => 'PEP & Adverse Media', 'body' => 'Identify politically exposed persons (PEPs) and assess adverse media risk.', 'icon' => 'Target'],
                    ['title' => 'UBO Identification', 'body' => 'Identify ultimate beneficial owners (UBOs) and control relationships.', 'icon' => 'Users'],
                    ['title' => 'Ongoing Monitoring', 'body' => 'Monitor customers and transactions for emerging risk and regulatory changes.', 'icon' => 'LineChart'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'KYC/KYB Compliance File', 'body' => 'Complete digital file of verification and screening evidence.', 'icon' => 'FileText'],
                    ['title' => 'Risk Assessment Report', 'body' => 'Risk rating and key risk driver analysis.', 'icon' => 'Clock'],
                    ['title' => 'Sanctions & PEP Screening Results', 'body' => 'Detailed screening results and sources.', 'icon' => 'ShieldAlert'],
                    ['title' => 'UBO & Ownership Structure', 'body' => 'Visual map of ownership and control.', 'icon' => 'Network'],
                    ['title' => 'Regulatory Compliance Summary', 'body' => 'Summary of compliance status and obligations.', 'icon' => 'ClipboardCheck'],
                ],
                'why' => ['Meet AML/CFT and KYC regulations.', 'Reduce fraud, corruption and financial crime risk.', 'Protect your reputation and stakeholder trust.', 'Support onboarding, transactions and partnerships.', 'Stay audit-ready with complete evidence.'],
                'triggers' => ['Onboarding new customers or counterparties', 'Regulatory compliance and audit requirements', 'High-value transactions or cross-border activity', 'Enhanced due diligence for higher-risk entities'],
            ],
            [
                'slug' => 'project', 'name' => 'Project Due Diligence', 'icon' => 'LineChart', 'template' => 'table', 'subjectType' => 'project', 'sampleCode' => 'DD-011',
                'short' => 'Project feasibility, market, financial, technical and commercial review.',
                'selector' => 'Commercial, legal, technical, financial, ESG and institutional review.',
                'title' => 'Project Due Diligence Overview',
                'subtitle' => 'Validate projects. Reduce risk. Protect value. Make better decisions.',
                'description' => 'Our project due diligence services help you assess feasibility, commercial viability, technical soundness and execution risk before you commit capital or sign agreements.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 5–60 business days by package.',
                'cta' => 'Start Project Due Diligence',
                'covers' => [
                    ['title' => 'Commercial Viability', 'body' => 'Assess demand, revenue drivers, pricing, offtake, and market sustainability.', 'icon' => 'FileSearch'],
                    ['title' => 'Technical Feasibility', 'body' => 'Review design, technology, engineering, site conditions, and implementation risk.', 'icon' => 'Settings'],
                    ['title' => 'Financial Review', 'body' => 'Evaluate CAPEX, OPEX, funding structure, returns, sensitivity and IRR drivers.', 'icon' => 'Coins'],
                    ['title' => 'Execution & Delivery', 'body' => 'Assess implementation plans, contractors, timelines, and delivery capability.', 'icon' => 'ClipboardCheck'],
                    ['title' => 'Legal & Regulatory', 'body' => 'Review permits, licences, compliance, land, contracts and regulatory obligations.', 'icon' => 'ShieldCheck'],
                    ['title' => 'ESG & Sustainability', 'body' => 'Evaluate environmental, social, governance and sustainability factors.', 'icon' => 'Leaf'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Comprehensive DD Report', 'body' => 'Clear findings with analysis and evidence references.', 'icon' => 'FileText'],
                    ['title' => 'Risk & Materiality Matrix', 'body' => 'Project risk rating and materiality assessment.', 'icon' => 'Grid3x3'],
                    ['title' => 'Recommendations', 'body' => 'Actionable next steps to strengthen the project.', 'icon' => 'Lightbulb'],
                    ['title' => 'Financial Summary', 'body' => 'Key financial findings and performance drivers.', 'icon' => 'BarChart3'],
                    ['title' => 'Go / No-Go Presentation', 'body' => 'Independent view and slide deck (optional).', 'icon' => 'Presentation'],
                ],
                'why' => ['Avoid project failure and cost overruns.', 'Prevent value leakage and hidden risks.', 'Strengthen financing and investor confidence.', 'Improve execution success and returns.', 'Make informed, data-driven decisions.'],
                'triggers' => ['Pre-investment evaluation of projects', 'Lender or investor due diligence', 'PPP / concession / infrastructure projects', 'M&A or project acquisition assessments', 'Board or committee decision requirements'],
            ],
            [
                'slug' => 'esg', 'name' => 'ESG Due Diligence', 'icon' => 'Leaf', 'template' => 'table', 'subjectType' => 'project', 'sampleCode' => 'DD-012',
                'short' => 'Environmental, social and governance risk assessment and reporting.',
                'selector' => 'ESG risk, impacts, gaps and compliance assessment.',
                'title' => 'ESG Due Diligence Overview',
                'subtitle' => 'Assess environmental, social and governance performance. Manage ESG risk.',
                'description' => 'Our ESG due diligence services help you evaluate ESG factors, identify material risks and opportunities, and strengthen governance for sustainable growth and investment confidence.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 5–45 business days by package.',
                'cta' => 'Start ESG Due Diligence',
                'covers' => [
                    ['title' => 'Environmental Assessment', 'body' => 'Evaluate environmental impacts, resource use and emissions.', 'icon' => 'Leaf'],
                    ['title' => 'Social Impact Review', 'body' => 'Assess community impact, labour practices, health and safety and inclusion.', 'icon' => 'Users'],
                    ['title' => 'Governance Evaluation', 'body' => 'Review board structure, ethics, transparency and management practices.', 'icon' => 'Building'],
                    ['title' => 'ESG Risk & Gap Analysis', 'body' => 'Identify ESG risks, gaps and areas for improvement.', 'icon' => 'TriangleAlert'],
                    ['title' => 'Regulatory & Compliance Check', 'body' => 'Verify compliance with ESG regulations and voluntary standards.', 'icon' => 'ClipboardCheck'],
                    ['title' => 'ESG Reporting Readiness', 'body' => 'Assess data quality, disclosure readiness and reporting frameworks.', 'icon' => 'BarChart3'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'ESG DD Report', 'body' => 'Comprehensive report with findings and evidence.', 'icon' => 'FileText'],
                    ['title' => 'Materiality Matrix', 'body' => 'Visual map of material ESG issues and risks.', 'icon' => 'Grid3x3'],
                    ['title' => 'Risk Rating & Score', 'body' => 'ESG risk rating with benchmark analysis.', 'icon' => 'Star'],
                    ['title' => 'Action Plan', 'body' => 'Recommendations and mitigation roadmap.', 'icon' => 'ListChecks'],
                    ['title' => 'Compliance Summary', 'body' => 'Summary of compliance and data references.', 'icon' => 'ClipboardCheck'],
                ],
                'why' => ['Meet investor and lender ESG requirements.', 'Reduce environmental and social risks.', 'Improve governance and stakeholder trust.', 'Enhance access to sustainable finance.', 'Strengthen long-term business resilience.'],
                'triggers' => ['Pre-investment ESG risk assessment', 'Lender and investor ESG requirements', 'Sustainability reporting and compliance', 'Project finance and green financing', 'Board and stakeholder ESG oversight'],
            ],
            [
                'slug' => 'enterprise', 'name' => 'Enterprise Screening', 'icon' => 'FileSearch', 'template' => 'table', 'sampleCode' => 'DD-013',
                'short' => 'Bulk screening across entities, watchlists and global databases.',
                'selector' => 'Bulk screening of suppliers, counterparties and entities.',
                'title' => 'Enterprise Screening Overview',
                'subtitle' => 'Screen organisations globally. Detect risk early. Protect your business.',
                'description' => 'Comprehensive enterprise screening services help you assess corporate entities, business partners, customers and counterparties for risk, compliance and reputational exposure.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 3–20 business days by package.',
                'cta' => 'Request Enterprise Screening',
                'covers' => [
                    ['title' => 'Company Verification', 'body' => 'Confirm business existence, registration, structure and incorporation details.', 'icon' => 'Building2'],
                    ['title' => 'Sanctions Screening', 'body' => 'Screen global sanctions, watchlists, PEPs and regulatory lists.', 'icon' => 'ShieldCheck'],
                    ['title' => 'Adverse Media', 'body' => 'Identify negative news, legal issues and reputational risks.', 'icon' => 'Newspaper'],
                    ['title' => 'Financial Health Check', 'body' => 'Assess credit signals, financial stability and payment behaviour.', 'icon' => 'PieChart'],
                    ['title' => 'Ownership & Control', 'body' => 'Map ownership structure, beneficial owners and corporate control.', 'icon' => 'User'],
                    ['title' => 'Compliance Review', 'body' => 'Review regulatory filings, licenses, and corporate compliance indicators.', 'icon' => 'Folder'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Enterprise Screening Report', 'body' => 'Comprehensive findings with source references.', 'icon' => 'FileText'],
                    ['title' => 'Risk & Compliance Score', 'body' => 'Overall risk rating with key driver analysis.', 'icon' => 'Gauge'],
                    ['title' => 'Sanctions & PEP Results', 'body' => 'Detailed screening results and matches.', 'icon' => 'ShieldAlert'],
                    ['title' => 'Ownership Structure Map', 'body' => 'Visual map of corporate relationships.', 'icon' => 'Network'],
                    ['title' => 'Financial Summary', 'body' => 'Key financial indicators and stability insights.', 'icon' => 'BarChart3'],
                    ['title' => 'Recommendations', 'body' => 'Risk mitigation actions and next steps.', 'icon' => 'Lightbulb'],
                ],
                'why' => ['Avoid fraud, financial crime and reputational damage.', 'Meet compliance and regulatory obligations.', 'Make safer partner and supplier decisions.', 'Strengthen due diligence for high-value transactions.', 'Improve portfolio and counterparty risk management.'],
                'triggers' => ['Onboarding new suppliers or partners', 'Large or high-risk transactions', 'M&A and investment due diligence', 'Third-party risk management', 'Periodic compliance screening'],
            ],
            [
                'slug' => 'monitoring', 'name' => 'Monitoring Services', 'icon' => 'Radar', 'template' => 'table', 'sampleCode' => 'DD-014',
                'short' => 'Ongoing monitoring, alerts and continuous risk updates.',
                'selector' => 'Ongoing screening, alerts and risk updates.',
                'title' => 'Monitoring Services Overview',
                'subtitle' => 'Stay informed. Detect changes early. Manage ongoing risk with confidence.',
                'description' => 'Our monitoring services continuously track your entities, owners, partners and projects so you can act early and stay compliant.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Monthly, per alert or annual cycles.',
                'cta' => 'Select Monitoring',
                'covers' => [
                    ['title' => 'Continuous Monitoring', 'body' => 'Track changes to entities, individuals, sanctions, PEPs and adverse media.', 'icon' => 'Radar'],
                    ['title' => 'Risk Alerts', 'body' => 'Receive timely alerts for material or high-risk changes.', 'icon' => 'Bell'],
                    ['title' => 'Regulatory Updates', 'body' => 'Monitor regulatory, sanctions and watchlist updates.', 'icon' => 'LineChart'],
                    ['title' => 'Ongoing Compliance', 'body' => 'Support ongoing AML/CFT, KYB and fiduciary compliance.', 'icon' => 'ClipboardCheck'],
                    ['title' => 'Watchlists & PEPs', 'body' => 'Track global watchlists, PEPs and politically exposed relationships.', 'icon' => 'Users'],
                    ['title' => 'Audit Trail & Reporting', 'body' => 'Maintain clear records and reporting for audits and stakeholders.', 'icon' => 'FileText'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Monitoring Dashboard', 'body' => 'Real-time status and risk summary.', 'icon' => 'LayoutDashboard'],
                    ['title' => 'Alert Notifications', 'body' => 'Email and in-portal risk alerts.', 'icon' => 'Bell'],
                    ['title' => 'Change Reports', 'body' => 'Monthly or event-driven reports.', 'icon' => 'FileText'],
                    ['title' => 'Risk Reassessment', 'body' => 'Updated risk ratings and trend analysis.', 'icon' => 'LineChart'],
                    ['title' => 'Compliance Log', 'body' => 'Audit-ready activity and response log.', 'icon' => 'ClipboardList'],
                ],
                'why' => ['Spot emerging risks before they escalate.', 'Stay ahead of regulatory and sanctions changes.', 'Protect your reputation and reduce exposure.', 'Demonstrate ongoing oversight and due care.', 'Support informed decisions throughout the relationship.'],
                'triggers' => ['Ongoing business relationships', 'High-risk clients or counterparties', 'Regulatory or sanctions watch', 'Post-deal or post-onboarding oversight', 'Fiduciary or trustee monitoring requirements'],
            ],
            [
                'slug' => 'reports', 'name' => 'Reports & Dashboards', 'icon' => 'BarChart3', 'template' => 'table', 'sampleCode' => 'DD-015',
                'short' => 'Detailed reports, dashboards and audit-ready exports.',
                'selector' => 'Detailed reports, visual dashboards and audit-ready exports.',
                'title' => 'Reports and Dashboards Overview',
                'subtitle' => 'Transform diligence into clear insights. Make better decisions with confidence.',
                'description' => 'Our reporting and dashboard services turn complex due diligence data into actionable intelligence for you and your stakeholders.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 3–15 business days by package.',
                'cta' => 'Select Report / Dashboard',
                'covers' => [
                    ['title' => 'Comprehensive Reports', 'body' => 'Clear, structured reports with executive summaries and detailed findings.', 'icon' => 'BarChart3'],
                    ['title' => 'Analytics Dashboards', 'body' => 'Interactive dashboards for real-time oversight and decision support.', 'icon' => 'PieChart'],
                    ['title' => 'Custom Reporting', 'body' => 'Tailored reports and metrics aligned to your objectives and stakeholders.', 'icon' => 'FileText'],
                    ['title' => 'Board & Investor Packs', 'body' => 'Board-ready and investor-grade packs for committee and deal approvals.', 'icon' => 'Users'],
                    ['title' => 'Export & Integration', 'body' => 'Export to PDF/Excel and integrate with your systems via secure access.', 'icon' => 'Download'],
                    ['title' => 'Report Reissue', 'body' => 'Reissue reports with new scope, updates or enhanced annexures.', 'icon' => 'RefreshCw'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Executive Summary', 'body' => 'High-level summary for quick understanding.', 'icon' => 'FileText'],
                    ['title' => 'Detailed Findings', 'body' => 'In-depth analysis and evidence references.', 'icon' => 'FileSearch'],
                    ['title' => 'Risk Ratings', 'body' => 'Clear risk ratings and impact assessments.', 'icon' => 'Gauge'],
                    ['title' => 'Data Visualisations', 'body' => 'Charts, trends and comparative insights.', 'icon' => 'BarChart3'],
                    ['title' => 'Action Recommendations', 'body' => 'Practical actions and next steps.', 'icon' => 'ListChecks'],
                ],
                'why' => ['Make evidence-based decisions with confidence.', 'Communicate clearly with boards and investors.', 'Track performance and risk in real time.', 'Save time with standardised, high-quality reporting.', 'Strengthen accountability and audit readiness.'],
                'triggers' => ['Board and investor reporting requirements', 'Deal process and investment reviews', 'Ongoing monitoring and performance tracking', 'Audit and compliance reporting', 'Management oversight and decision support'],
            ],
            [
                'slug' => 'portal-api', 'name' => 'Portal & API Setup', 'icon' => 'MonitorCog', 'template' => 'table', 'sampleCode' => 'DD-016',
                'short' => 'Enterprise portal, API integration and custom workflows.',
                'selector' => 'Enterprise portal, API integration and custom workflows.',
                'title' => 'Portal and API Setup Overview',
                'subtitle' => 'Integrate TBCA DD into your systems. Secure. Scalable. Built for enterprise.',
                'description' => 'Set up dedicated portals, connect via API, and align workflows to your governance, security and reporting requirements.',
                'sample' => 'Baobab Executive Vetting Demo',
                'sla' => 'Typical 5–15 business days for setup.',
                'cta' => 'Request Scope',
                'covers' => [
                    ['title' => 'Dedicated Portal Setup', 'body' => 'Configure your branded environment, roles, workflows and templates.', 'icon' => 'Monitor'],
                    ['title' => 'API Integration', 'body' => 'Connect via secure API endpoints with sandbox and production support.', 'icon' => 'Puzzle'],
                    ['title' => 'System & Workflow Mapping', 'body' => 'Map your processes, data fields and approval flows.', 'icon' => 'Workflow'],
                    ['title' => 'Security & Access Management', 'body' => 'Role-based access, SSO, encryption and audit controls.', 'icon' => 'Lock'],
                    ['title' => 'Data & Reporting Integration', 'body' => 'Push/pull data, automate reports and dashboard delivery.', 'icon' => 'PieChart'],
                    ['title' => 'Ongoing Support & Optimisation', 'body' => 'Monitoring, maintenance and continuous improvement.', 'icon' => 'Headphones'],
                ],
                'useCases' => [],
                'receive' => [
                    ['title' => 'Setup Plan', 'body' => 'Detailed implementation plan with milestones.', 'icon' => 'FileText'],
                    ['title' => 'Integration Guide', 'body' => 'API documentation and technical specifications.', 'icon' => 'Code'],
                    ['title' => 'Configuration Pack', 'body' => 'Pre-built roles, templates and workflow setup.', 'icon' => 'SlidersHorizontal'],
                    ['title' => 'Test Results', 'body' => 'Sandbox testing and security validation.', 'icon' => 'ShieldCheck'],
                    ['title' => 'Go-Live Support', 'body' => 'Deployment assistance and knowledge transfer.', 'icon' => 'Rocket'],
                ],
                'why' => ['Seamless integration with your systems and data.', 'Stronger security, governance and compliance.', 'Faster time-to-value with guided setup.', 'Scalable for growing volumes and teams.', 'Reliable support for long-term success.'],
                'triggers' => ['Need to integrate DD into existing systems', 'High volume screening and automation needs', 'Enterprise security and compliance requirements', 'Branded portal for teams or stakeholders', 'API access for data and workflow automation'],
            ],
        ];
    }
}
