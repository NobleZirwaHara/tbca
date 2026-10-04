<?php

namespace App\Support\Products\Seeds;

use App\Models\Order;
use App\Models\Products\Digital\DpCase;
use App\Models\Products\Digital\DpClaim;
use App\Models\Products\Digital\DpDownload;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpEvent;
use App\Models\Products\Digital\DpIncident;
use App\Models\Products\Digital\DpIpRecord;
use App\Models\Products\Digital\DpPriceItem;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpReclassItem;
use App\Models\Products\Digital\DpVersion;
use App\Models\User;
use App\Support\Platform\Money;
use App\Support\Products\Digital\Catalogue;
use Illuminate\Support\Carbon;

/**
 * Idempotent demo data for the Digital Products family, taken from the
 * 29 Digital_Products mockups (catalogue, holder library, governance registers).
 */
class DigitalSeed
{
    public function run(): void
    {
        $this->products();
        $this->claims();
        $this->ipRecords();
        $this->incidents();
        $this->reclassification();
        $this->priceFloor();
        $this->holders();
        $this->events();
    }

    private function products(): void
    {
        foreach (Catalogue::products() as $row) {
            $current = collect($row['versions'])->firstWhere(1, 'current');
            $releasedAt = Carbon::parse($current[3]);
            $af = $row['af'] ?? 'unavailable';

            $product = DpProduct::updateOrCreate(['code' => $row['code']], [
                'sku' => $row['sku'],
                'slug' => $row['slug'],
                'name' => $row['name'],
                'type' => $row['type'],
                'category' => $row['category'],
                'tagline' => $row['tagline'],
                'description' => $row['description'] ?? $row['tagline'].' Built and human-reviewed by TBCA specialists for South African use, version-controlled and supported.',
                'audience' => $row['audience'],
                'best_for' => $row['best_for'] ?? 'Planning, decision support and governance-ready deliverables',
                'audiences' => $row['audiences'],
                'industries' => $row['industries'],
                'business_function' => $row['business_function'],
                'jurisdiction' => 'South Africa',
                'languages' => [
                    ['code' => 'EN', 'label' => 'English', 'state' => 'approved', 'note' => 'Full content available'],
                    ['code' => 'AF', 'label' => 'Afrikaans', 'state' => $af, 'note' => match ($af) {
                        'approved' => 'Human-reviewed translation',
                        'review' => 'In progress – human review pending',
                        default => 'Not available',
                    }],
                    ['code' => 'FR', 'label' => 'Français', 'state' => 'unavailable', 'note' => 'Not available'],
                    ['code' => 'PT', 'label' => 'Português', 'state' => 'unavailable', 'note' => 'Not available'],
                ],
                'formats' => collect($row['formats'])->map(fn ($f) => ['code' => $f, 'label' => $f, 'note' => Catalogue::FORMAT_NOTES[$f]])->all(),
                'primary_format' => $row['primary_format'],
                'prices' => $row['prices'],
                'current_version' => $current[0],
                'verified_at' => $releasedAt,
                'next_review_at' => $releasedAt->copy()->addMonths(3),
                'review_cycle' => 'Quarterly',
                'maintenance_class' => 'M1',
                'update_class' => $row['disposition'] === 'DP-FR' ? 'U0' : 'U2',
                'update_months' => 12,
                'support' => 'Standard Email',
                'dss' => $row['dss'],
                'dss_band' => $row['dss_band'],
                'risk' => $row['risk'] ?? 'Medium',
                'lifecycle_status' => $row['lifecycle'] ?? 'live',
                'disposition' => $row['disposition'],
                'defensibility_level' => $row['defensibility_level'] ?? 'D3 – Strong',
                'subscription_suitable' => $row['subscription_suitable'] ?? false,
                'subscription_status' => $row['subscription_status'] ?? 'Not Applicable',
                'recurring_evidence' => $row['recurring_evidence'] ?? null,
                'receive' => $row['receive'],
                'compare' => Catalogue::compareRows($row['type']),
                'badges' => $row['badges'] ?? ['Human Reviewed', 'Version Controlled', 'South Africa Context', 'Professional Standard'],
                'content' => [
                    'how_to_use' => [
                        'Download the licensed file from your Digital Products Library.',
                        'Read the usage guide before editing the master file.',
                        'Work through each section in order; guidance notes sit beside every heading.',
                        'Check the Version Status page before relying on the output for a new decision.',
                    ],
                    'does_not_do' => [
                        'It is not legal, tax or investment advice and does not replace a qualified professional.',
                        'It does not include buyer-specific research, drafting or review by TBCA.',
                        'It does not transfer ownership of TBCA intellectual property.',
                        'It does not guarantee funding, approval or regulatory outcomes.',
                    ],
                    'related_sprint' => ['title' => 'Business Plan Development Sprint', 'slug' => 'business-plan-development', 'price' => 14500],
                ],
                'defensibility' => $this->defensibility($row, $releasedAt),
                'qa' => $this->qa($row['code'] === 'DP-PLN-000123'),
                'downloads_count' => $row['downloads_count'],
                'popularity' => $row['popularity'],
                'cover_tone' => $row['tone'],
                'released_at' => $releasedAt,
            ]);

            foreach ($row['versions'] as [$v, $status, $type, $date, $summary]) {
                $released = $date ? Carbon::parse($date) : null;
                DpVersion::updateOrCreate(['product_id' => $product->id, 'version' => $v], [
                    'status' => $status,
                    'update_type' => $type,
                    'released_at' => $released,
                    'verified_at' => $released,
                    'maintenance_until' => $released?->copy()->addYear(),
                    'summary' => $summary,
                    'whats_new' => $this->whatsNew($summary),
                    'impact' => $type === 'major' ? ['New content', 'Regulatory updates', 'Process improvements'] : ['Additional examples', 'Template refinements', 'Clarifications'],
                    'size' => ['PDF' => '2.7 MB', 'DOCX' => '256 KB', 'XLSX' => '1.1 MB', 'PPTX' => '4.4 MB'][$row['primary_format']] ?? '1.2 MB',
                    'compat_works_with' => 'v'.substr($v, 0, 1).'.0.0 and above',
                    'compat_replaces' => 'All earlier '.substr($v, 0, 1).'.x releases',
                ]);
            }
        }
    }

    private function whatsNew(string $summary): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/,| and /', rtrim($summary, '.')))));
    }

    private function defensibility(array $row, Carbon $released): array
    {
        $weak = in_array($row['disposition'], ['DP-FR', 'DP-RC'], true);
        $evidence = [
            'D1' => ['Verified As At' => $released->format('d M Y'), 'Source' => 'SA Companies Act 2024 Amendments'],
            'D2' => ['Evidence' => 'Comparative analysis attached'],
            'D3' => ['Evidence' => 'Expert structure & depth assessment'],
            'D4' => ['Evidence' => 'IP and authorship record attached'],
            'D5' => ['Claims Verified' => '28 / 28', 'Orphan Claims' => '0'],
        ];

        return [
            'tests' => collect(Catalogue::D_TESTS)->map(fn ($t, $code) => [
                'code' => $code,
                'title' => $t[0],
                'description' => $t[1],
                'status' => $weak && in_array($code, ['D3', 'D4'], true) ? 'inactive' : 'active',
                'evidence' => $evidence[$code],
            ])->values()->all(),
            'substitute' => ['name' => 'ChatGPT (Free)', 'score' => $weak ? 71 : 52, 'ours' => $weak ? 58 : 84],
            'detail' => [
                'authority' => 'Companies Act 71 of 2008 as amended (2024)', 'effective' => '31 May 2024', 'coverage' => 'South Africa',
                'frequency' => 'Quarterly', 'human' => 'Yes – '.$released->format('d M Y'), 'file' => 'D1_Evidence_SA_Act_2024.pdf',
            ],
            'gate' => $weak ? 'WORKFLOW_HOLD' : 'PASS',
            'decision' => $weak ? 'Referred for human review' : 'Approve Paid State',
            'decided_at' => $released->format('d M Y'),
            'decided_by' => 'QA Lead',
            'assessed_at' => $released->format('d M Y').', 10:24',
            'assessed_by' => 'QA Reviewer',
            'notes' => 'Paid value delta evidenced against the best free alternative. Re-test on material substitute improvement.',
        ];
    }

    private function qa(bool $draftInQa): array
    {
        return [
            'cycle' => 1,
            'status' => $draftInQa ? 'ready_for_review' : 'released',
            'completed_at' => '10 Aug 2026, 11:32',
            'run_by' => 'QA Reviewer',
            'note' => 'All checks passed. Product is eligible for submission to the Release Review Panel. No blocking issues.',
            'checks' => collect(Catalogue::QA_CHECKS)->map(fn ($c, $i) => [
                'n' => $i + 1,
                'name' => $c[0],
                'description' => $c[1],
                'reviewer' => $c[2],
                'result' => 'pass',
                'evidence' => [3, 5, 12, 2, 1, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2][$i],
                'date' => '10 Aug 2026',
            ])->all(),
        ];
    }

    private function claims(): void
    {
        $rows = [
            ['CLM-2026-002145', 'business-plan-template', 'Business Plan Template', 'v1.3 (Current)', 'Includes 25+ financial formulas with automated calculations.', 'Feature', 'Internal Content', null, 'pending', 'high', '2026-08-11', null],
            ['CLM-2026-002144', 'financial-model-template-3-statements', 'Financial Model Builder', 'v2.1 (Current)', 'DCF model based on SA Reserve Bank inflation projections.', 'Statistic', 'External Report', 'SARB, May 2024', 'in_review', 'high', '2026-08-12', 'QA Reviewer'],
            ['CLM-2026-002143', 'cash-flow-forecast-template', 'Cash Flow Forecast Template', 'v1.2', 'Suitable for all South African business structures.', 'Suitability', 'Internal Content', null, 'pending', 'medium', '2026-08-13', null],
            ['CLM-2026-002142', 'pitch-deck-template', 'Investor Pitch Deck Template', 'v1.1', 'Used by 500+ businesses successfully.', 'Outcome', 'Customer Data', 'CRM Analysis', 'pending', 'high', '2026-08-14', null],
            ['CLM-2026-002141', 'market-research-toolkit', 'Market Research Toolkit', 'v1.1', 'Includes verified statistics from Stats SA Q1 2026.', 'Statistic', 'Stats SA', 'Q1 2026 Release', 'pending', 'medium', '2026-08-15', null],
            ['CLM-2026-002140', 'business-plan-template', 'Business Plan Template', 'v1.3 (Current)', 'Aligned to the Companies Act 71 of 2008 as amended (2024).', 'Legal', 'Legal Authority', 'Companies Act (2024)', 'verified', 'high', '2026-11-10', 'Legal Reviewer'],
            ['CLM-2026-002139', 'aml-kyc-compliance-checklist', 'AML & KYC Compliance Checklist', 'v1.0 (Current)', 'Covers every FICA section 21 customer due diligence obligation.', 'Legal', 'Legal Authority', 'FIC Act s21', 'verified', 'high', '2026-10-28', 'Legal Reviewer'],
            ['CLM-2026-002138', 'south-africa-investment-opportunities-report-2026', 'South Africa Investment Opportunities Report 2026', 'v1.3 (Current)', 'Pipeline of R1.2 trillion in priority projects.', 'Statistic', 'External Report', 'IDC Pipeline 2026', 'verified', 'medium', '2026-11-01', 'Claims Officer'],
            ['CLM-2026-002137', 'board-pack-template', 'Board Pack Template', 'v2.0.1', 'Fully King IV compliant.', 'Legal', 'Internal Content', null, 'rejected', 'high', '2026-08-01', 'Legal Reviewer'],
            ['CLM-2026-002136', 'project-feasibility-dashboard', 'Project Feasibility Dashboard', 'v1.3 (Current)', 'Calculates IRR and NPV under five scenarios.', 'Feature', 'Internal Content', null, 'verified', 'low', '2026-12-20', 'QA Reviewer'],
            ['CLM-2026-002135', 'esg-due-diligence-toolkit', 'ESG Due Diligence Toolkit', 'v1.1 (Current)', 'Mapped to all eight IFC Performance Standards.', 'Suitability', 'External Standard', 'IFC PS 2012', 'pending', 'medium', '2026-07-30', null],
        ];

        foreach ($rows as [$ref, $slug, $name, $ver, $claim, $type, $source, $detail, $status, $priority, $due, $reviewer]) {
            DpClaim::updateOrCreate(['reference' => $ref], [
                'product_id' => DpProduct::where('slug', $slug)->value('id'),
                'product_name' => $name, 'version_label' => $ver, 'claim' => $claim, 'type' => $type,
                'source' => $source, 'source_detail' => $detail, 'status' => $status, 'has_evidence' => true,
                'priority' => $priority, 'review_due' => $due, 'reviewer' => $reviewer,
            ]);
        }
    }

    private function ipRecords(): void
    {
        $ok = fn (int $n, string $rest = 'blocked') => collect(['L1', 'L2', 'L3', 'L4', 'L5'])->mapWithKeys(fn ($c, $i) => [$c => $i < $n ? 'ok' : $rest])->all();

        $ledger = [
            ['business-plan-template', 'Business Plan Template', 'v1.3 (Current)', 'DP-TPL-BUS-PLAN', false, 'TBCA', 'A1', 'Employment Contract', 'TBCA-EMP-2024-01', '2024-01-10', 'cleared', $ok(4), '2.1', '2026-06-01', 'PASS', 'AI-1', 'cleared', true],
            ['financial-model-template-3-statements', 'Financial Model Builder', 'v2.1 (Current)', 'DP-TPL-FIN-3S', false, 'Marketplace Provider', 'A2', 'Licence Agreement', 'LIC-MP-7763', '2025-11-02', 'cleared', $ok(4), '2.0', '2026-04-15', 'PASS', 'AI-0', 'cleared', true],
            ['cash-flow-forecast-template', 'Cash Flow Forecast Template', 'v1.2', 'DP-CF-0130', false, 'Contributor', 'A3', 'Assignment Deed', 'ASSN-2025-104', '2025-09-14', 'cleared', $ok(3), '1.3', '2026-03-10', 'PASS', 'AI-1', 'cleared', true],
            ['pitch-deck-template', 'Investor Pitch Deck Template', 'v1.1', 'DP-TPL-PITCH', false, 'TBCA', 'A1', 'Employment Contract', 'TBCA-EMP-2024-01', '2024-01-10', 'cleared', $ok(4), '1.1', '2026-02-05', 'PASS', 'AI-1', 'cleared', true],
            ['board-pack-template', 'Board Pack Template', 'v2.0', 'DP-TPL-BOARD', false, 'Marketplace Provider', 'A2', 'Licence Agreement', 'LIC-MP-6661', '2026-04-20', 'cleared', $ok(3), '2.1', '2026-05-01', 'PASS', 'AI-0', 'cleared', true],
            ['feasibility-study-guide', 'Feasibility Study Guide', 'v1.0', 'DP-GDE-FEAS', false, 'Contributor', 'A3', 'Assignment Deed', 'ASSN-2025-087', '2025-08-01', 'at_risk', $ok(2), '1.0', '2026-01-03', 'PENDING', 'AI-1', 'in_review', false],
            // Marketplace cohort (GATE-DP-03)
            ['market-research-toolkit', 'Market Research Toolkit', 'v1.0.3', 'MRK-TOOL-0012', true, 'Insight Africa Research', 'A2', 'Licence Agreement', 'LIC-IA-2024-07', '2024-07-12', 'cleared', $ok(4), '1.0', '2026-01-20', 'PASS', 'AI-1', 'cleared', true],
            [null, 'Africa Trade Agreements Guide', 'v2.1.0', 'ATAG-V2-010', true, 'TradeWise Consulting', 'A2', 'Licence Agreement', 'LIC-TW-2025-01', '2025-01-28', 'partial', [...$ok(3), 'L4' => 'pending'], '1.0', '2025-01-28', 'PASS', 'AI-0', 'in_review', false],
            [null, 'Investment Risk Heatmaps', 'v1.0.1', 'IRH-HEAT-0004', true, 'RiskMap Analytics', 'A5', 'Licence Agreement', 'LIC-RMA-2025-03', '2025-03-03', 'partial', ['L1' => 'ok', 'L2' => 'pending', 'L3' => 'blocked', 'L4' => 'blocked', 'L5' => 'blocked'], '1.0', '2025-03-03', 'NONE', 'AI-X', 'awaiting_evidence', false],
            [null, 'Project Feasibility Workbook', 'v3.0.0', 'PFW-V3-015', true, 'InfraSolutions Partners', 'A2', 'Licence Agreement', 'LIC-ISP-2024-11', '2024-11-15', 'cleared', $ok(4), '1.0', '2024-11-15', 'PASS', 'AI-1', 'cleared', true],
            [null, 'ESG Compliance Checklist', 'v1.2.0', 'ESG-CHK-0031', true, 'ESG Global Africa', 'A2', 'Licence Agreement', 'LIC-ESG-2025-02', '2025-02-10', 'partial', ['L1' => 'ok', 'L2' => 'ok', 'L3' => 'pending', 'L4' => 'pending', 'L5' => 'blocked'], '1.0', '2025-02-10', 'PENDING', 'AI-0', 'in_review', false],
            [null, 'Energy Sector Outlook Report', 'v1.0.0', 'EOR-ENERGY-002', true, 'SectorOutlook Ltd', 'A5', null, null, null, 'at_risk', $ok(0), null, null, 'FAIL', 'AI-X', 'blocked', false],
            [null, 'Agribusiness Market Brief', 'v1.1.0', 'AGR-BRIEF-008', true, 'AgriMarket Insights', 'A2', 'Licence Agreement', 'LIC-AMI-2025-04', '2025-04-21', 'cleared', $ok(4), '1.0', '2025-04-21', 'PASS', 'AI-1', 'cleared', true],
            [null, 'Logistics Corridors Dataset', 'v2.0.0', 'LCD-V2-007', true, 'Corridor Data Lab', 'A2', 'Licence Agreement', 'LIC-CDL-2025-05', '2025-05-11', 'partial', [...$ok(3), 'L4' => 'pending'], '1.0', '2025-05-11', 'PASS', 'AI-0', 'awaiting_evidence', false],
        ];

        foreach ($ledger as [$slug, $name, $ver, $sku, $market, $provider, $auth, $type, $ref, $date, $ip, $classes, $lv, $eff, $third, $ai, $clear, $listed]) {
            DpIpRecord::updateOrCreate(['sku' => $sku, 'marketplace' => $market], [
                'product_id' => $slug ? DpProduct::where('slug', $slug)->value('id') : null,
                'product_name' => $name, 'version_label' => $ver, 'provider' => $provider, 'authorship_class' => $auth,
                'instrument_type' => $type, 'instrument_ref' => $ref, 'instrument_date' => $date, 'ip_status' => $ip,
                'licence_classes' => $classes, 'licence_version' => $lv, 'licence_effective' => $eff,
                'third_party' => $third, 'ai_class' => $ai, 'clearance_status' => $clear, 'listed' => $listed,
                'last_review' => $eff, 'next_review' => $eff ? Carbon::parse($eff)->addYear() : null, 'reviewer' => 'Legal Reviewer',
            ]);
        }
    }

    private function incidents(): void
    {
        $rows = [
            ['CRR-2026-00052', 'business-plan-template', 'Business Plan Template', 'v2.1.0', 'Outdated tax reference for FY2025', 'S2', 'Content Error', 'QA Review', '2026-08-09', 'under_review', 'not_contained', 3, 412, 598, 'Content Owner'],
            ['CRR-2026-00051', 'financial-model-template-3-statements', 'Financial Model Builder', 'v2.0.1', 'Formula error in Cash Flow sheet', 'S1', 'Calculation Error', 'Customer Report', '2026-08-08', 'in_containment', 'in_containment', 2, 1128, 1876, 'QA Lead'],
            ['CRR-2026-00050', 'pitch-deck-template', 'Investor Pitch Deck Template', 'v1.1.1', 'Incorrect legal disclaimer wording', 'S2', 'Legal / Disclaimer', 'Legal Review', '2026-08-08', 'open', 'not_contained', 1, 256, 301, 'Legal Reviewer'],
            ['CRR-2026-00049', 'cash-flow-forecast-template', 'Cash Flow Forecast Template', 'v1.2.0', 'Typo in KPI definition (EBITDA)', 'S3', 'Typographical', 'QA Review', '2026-08-07', 'under_review', 'not_contained', 3, 98, 143, 'QA Reviewer'],
            ['CRR-2026-00048', 'market-research-toolkit', 'Market Research Toolkit', 'v1.0.3', 'Source link no longer available', 'S2', 'Source Issue', 'QA Automation', '2026-08-07', 'open', 'not_contained', 1, 622, 811, 'Research Lead'],
            ['CRR-2026-00047', 'board-pack-template', 'Board Pack Template', 'v2.0.0', 'Resolution register numbering error', 'S3', 'Content Error', 'Customer Report', '2026-07-30', 'resolved', 'contained', 6, 140, 188, 'QA Reviewer'],
        ];

        foreach ($rows as [$ref, $slug, $name, $ver, $summary, $sev, $type, $by, $on, $status, $cont, $step, $holders, $dl, $who]) {
            DpIncident::updateOrCreate(['reference' => $ref], [
                'product_id' => DpProduct::where('slug', $slug)->value('id'),
                'product_name' => $name, 'version_label' => $ver, 'summary' => $summary,
                'detail' => $ref === 'CRR-2026-00051' ? 'Formula error in Cash Flow sheet causes incorrect free cash flow.' : $summary.'.',
                'severity' => $sev, 'type' => $type, 'detected_by' => $by, 'detected_on' => $on, 'status' => $status,
                'containment' => $cont, 'step' => $step, 'holders_affected' => $holders, 'downloads' => $dl, 'assigned_to' => $who,
                'containment_started_at' => $sev === 'S1' ? Carbon::parse($on.' 14:25') : null,
                'replacement_version' => $status === 'resolved' ? 'v2.0.1' : null,
            ]);
        }
    }

    private function reclassification(): void
    {
        $rows = [
            ['Business Plan Template', 'v2.1', 'Business & Management', 'eligible', 'Package for instant download', 'R-A', 'DSS 2 – High', 'High', 'DP Product Team', '2026-08-15', 4],
            ['Cash Flow Forecast Template', 'v1.3', 'Finance & Accounting', 'eligible', 'Add license mapping', 'R-A', 'DSS 3 – Medium', 'Medium', 'Finance Content Lead', '2026-08-18', 4],
            ['Market Research Toolkit', 'v1.0', 'Research & Reports', 'pending_rework', 'Update to latest version', 'R-D', 'DSS 2 – High', 'High', 'Research Lead', '2026-08-22', 3],
            ['Investor Pitch Deck Template', 'v1.0', 'Business & Management', 'eligible', 'Configure instant access', 'R-A', 'DSS 3 – Medium', 'Medium', 'Content Operations', '2026-08-16', 4],
            ['Feasibility Study Guide', 'v1.2', 'Project Advisory', 'not_eligible', 'Requires human advisory', 'R-B', 'DSS 1 – Very High', 'Low', 'Project Advisory Lead', null, 2],
            ['Board Pack Template', 'v2.0', 'Governance', 'eligible', 'Instant access configured & tested', 'R-A', 'DSS 3 – Medium', 'Medium', 'Content Operations', '2026-08-20', 5],
            ['Sector Opportunity Guide – Energy', 'v3.0', 'Research & Reports', 'pending_rework', 'Split scheduled enrichment from instant core', 'R-D', 'DSS 2 – High', 'High', 'Research Lead', '2026-08-28', 3],
        ];

        foreach ($rows as [$name, $ver, $cat, $elig, $gap, $route, $dss, $prio, $owner, $target, $stage]) {
            DpReclassItem::updateOrCreate(['product_name' => $name, 'version_label' => $ver], [
                'category' => $cat, 'current_state' => 'Delayed Delivery', 'eligibility' => $elig, 'gap_summary' => $gap, 'route' => $route,
                'dss_band' => $dss, 'priority' => $prio, 'owner' => $owner, 'target_release' => $target, 'stage' => $stage,
            ]);
        }
    }

    private function priceFloor(): void
    {
        $rows = [
            ['Business Plan Template', 'v2.1', 'DP-PL-000123', 'Business & Management', 'L2', 149, 199, 249, 'high'],
            ['Financial Model Builder', 'v2.0', 'DP-FN-000215', 'Finance & Accounting', 'L1', 99, 149, 179, 'high'],
            ['Cash Flow Forecast', 'v1.3', 'DP-FN-000332', 'Finance & Accounting', 'L2', 199, 249, 299, 'medium'],
            ['Investor Pitch Deck', 'v1.0', 'DP-PR-000441', 'Project Advisory', 'L2', 199, 199, 249, 'medium'],
            ['Market Research Toolkit', 'v1.1', 'DP-RS-000511', 'Research & Reports', 'L3', 299, 349, 449, 'high'],
            ['Feasibility Study Guide', 'v1.2', 'DP-PR-000622', 'Project Advisory', 'L2', 249, 299, 349, 'medium'],
            ['Starter Compliance Bundle', 'v1.0', 'DP-BN-000710', 'Compliance & ESG', 'L2', 1490, 1100, 1999, 'low'],
        ];

        foreach ($rows as [$name, $ver, $sku, $cat, $lic, $price, $tcs, $floor, $prio]) {
            DpPriceItem::updateOrCreate(['sku' => $sku], [
                'product_name' => $name, 'version_label' => $ver, 'category' => $cat, 'licence' => $lic,
                'lowest_price' => $price, 'tcs' => $tcs, 'floor_price' => $floor, 'priority' => $prio,
                'status' => 'needs_review', 'bundle' => str_contains($name, 'Bundle'),
            ]);
        }
    }

    /** Library data for the demo client plus other holders shown in the register. */
    private function holders(): void
    {
        $amahle = User::where('email', 'amahle@agritechsa.co.za')->first();

        $rows = [
            // [ref, slug, version, holder (null=amahle), email, entity, order ref, date, licence, status, downloaded, maintenance]
            ['ENT-2026-000541', 'business-plan-template', '1.3.0', null, null, 'Baobab (Pty) Ltd', 'DPORD-2026-000541', '2026-08-10 11:45', 'L2', 'active', true, 'active'],
            ['ENT-2026-000540', 'south-africa-investment-opportunities-report-2026', '1.3.0', null, null, 'Baobab (Pty) Ltd', 'DPORD-2026-000541', '2026-08-10 11:45', 'L2', 'active', true, 'not_active'],
            ['ENT-2026-000398', 'project-feasibility-dashboard', '1.2.0', null, null, 'Baobab (Pty) Ltd', 'DPORD-2026-000398', '2026-08-05 09:10', 'L2', 'active', true, 'not_active'],
            ['ENT-2026-000397', 'esg-due-diligence-toolkit', '1.1.0', null, null, 'Baobab (Pty) Ltd', 'DPORD-2026-000398', '2026-08-01 09:10', 'L2', 'active', true, 'not_active'],
            ['ENT-2026-000188', 'aml-kyc-compliance-checklist', '1.0.0', null, null, 'Baobab (Pty) Ltd', 'DPORD-2026-000188', '2026-07-28 15:20', 'L2', 'active', true, 'not_active'],
            ['ENT-2026-000123', 'business-plan-template', '1.3.0', 'Acme Holdings (Pty) Ltd', 'info@acme.co.za', 'Acme Holdings (Pty) Ltd', 'DPORD-2026-001256', '2026-08-10 10:20', 'L2', 'active', true, 'active'],
            ['ENT-2026-000124', 'financial-model-template-3-statements', '2.1.0', 'Thabo Consulting', 'thabo@consult.co.za', 'Thabo Consulting', 'DPORD-2026-001255', '2026-08-10 09:15', 'L3', 'active', false, 'not_active'],
            ['ENT-2026-000125', 'cash-flow-forecast-template', '1.2.0', 'Sunrise Trading (Pty) Ltd', 'finance@sunrise.co.za', 'Sunrise Trading (Pty) Ltd', 'DPORD-2026-001254', '2026-08-09 16:00', 'L1', 'active', true, 'not_active'],
            ['ENT-2026-000126', 'pitch-deck-template', '1.1.1', 'InvestCo SA', 'investor@investco.co.za', 'InvestCo SA', 'DPORD-2026-001252', '2026-08-09 11:30', 'L2', 'active', true, 'not_active'],
            ['ENT-2026-000127', 'market-research-toolkit', '1.0.3', 'Mkhize Projects', 'projects@mkhize.co.za', 'Mkhize Projects', 'DPORD-2026-001253', '2026-08-08 10:00', 'L4', 'active', false, 'not_active'],
            ['ENT-2026-000128', 'feasibility-study-guide', '1.0.0', 'Public Sector User', 'psu@province.gov.za', 'Provincial Treasury', 'DPORD-2026-001251', '2026-08-08 08:40', 'L1', 'suspended', false, 'not_active'],
            ['ENT-2026-000129', 'board-pack-template', '1.3.0', 'Legacy Holder', 'legacy@unknown.co.za', 'Legacy Holder', 'DPORD-2025-009999', '2025-12-12 12:00', 'L2', 'legacy', true, 'not_active'],
        ];

        foreach ($rows as [$ref, $slug, $ver, $holder, $email, $entity, $orderRef, $date, $lic, $status, $downloaded, $maint]) {
            $product = DpProduct::where('slug', $slug)->first();
            $version = $product?->versions()->where('version', $ver)->first();
            $mine = $holder === null;

            if (! $product || ($mine && ! $amahle)) {
                continue;
            }

            $at = Carbon::parse($date);
            $price = (int) ($product->prices[$lic] ?? $product->fromPrice());
            $order = Order::where('reference', $orderRef)->first();
            if (! $order) {
                $totals = Money::totals($price);
                $order = Order::create([
                    'reference' => $orderRef,
                    'user_id' => $mine ? $amahle->id : null,
                    'section' => 'digital-products',
                    'status' => $status === 'suspended' ? 'paid' : ($orderRef === 'DPORD-2026-001253' ? 'paid' : 'paid'),
                    'subtotal_zar' => $totals['subtotal'], 'vat_zar' => $totals['vat'], 'fees_zar' => $totals['fees'], 'total_zar' => $totals['total'],
                    'billing' => ['name' => $mine ? $amahle->name : $holder, 'email' => $mine ? $amahle->email : $email, 'company' => $entity],
                    'meta' => ['title' => $product->name, 'seeded' => true],
                    'paid_at' => $at,
                    'created_at' => $at,
                ]);
                $order->items()->create([
                    'item_type' => 'digital-product-seed', 'item_code' => $product->sku.':'.$lic, 'name' => $product->name,
                    'variant' => $lic, 'quantity' => 1, 'unit_zar' => $price, 'line_zar' => $price,
                    'meta' => ['product' => $slug, 'licence' => $lic],
                ]);
            }

            $current = $product->versions()->where('status', 'current')->first();
            $ent = DpEntitlement::updateOrCreate(['reference' => $ref], [
                'user_id' => $mine ? $amahle->id : null,
                'holder_name' => $mine ? $amahle->name : $holder,
                'holder_email' => $mine ? $amahle->email : $email,
                'authorised_entity' => $entity,
                'product_id' => $product->id,
                'version_id' => $version?->id,
                'order_id' => $order->id,
                'order_reference' => $orderRef,
                'licence_class' => $lic,
                'language' => 'EN',
                'format' => $product->primary_format,
                'status' => $status,
                'terms_version' => 'v1.1',
                'price_zar' => $price,
                'update_until' => $at->copy()->addYear(),
                'access_expires_at' => $at->copy()->addYear(),
                'maintenance_status' => $maint,
                'maintenance_plan' => $maint === 'active' ? 'annual' : null,
                'maintenance_until' => $maint === 'active' ? $at->copy()->addYear() : null,
                'credit_zar' => $ref === 'ENT-2026-000541' ? 350 : (int) round($price * 0.10),
                'credit_applied_zar' => $ref === 'ENT-2026-000541' ? 250 : 0,
                'notification_state' => in_array($ref, ['ENT-2026-000124', 'ENT-2026-000127', 'ENT-2026-000129'], true) ? 'pending' : ($status === 'suspended' ? 'failed' : 'delivered'),
                'correction_state' => match ($ref) {
                    'ENT-2026-000124' => 'Pending',
                    'ENT-2026-000127' => 'Correction Available v1.1.0',
                    'ENT-2026-000128' => 'Refund Case',
                    'ENT-2026-000129' => 'Superseded – use '.($current?->label() ?? 'current'),
                    default => 'Delivered',
                },
                'manifest' => ['product' => $slug, 'licence' => $lic, 'seeded' => true],
                'purchased_at' => $at,
                'activated_at' => $at->copy()->addMinute(),
            ]);

            if ($downloaded && ! $ent->downloads()->exists()) {
                DpDownload::create([
                    'entitlement_id' => $ent->id, 'user_id' => $ent->user_id, 'product_id' => $product->id,
                    'version' => $ver, 'format' => $ent->format, 'language' => 'EN',
                    'file_name' => "{$product->name}_v{$ver}_EN.".strtolower($ent->format), 'success' => true,
                    'hash' => hash('sha256', $ref.$ver), 'created_at' => $at->copy()->addMinutes(3), 'updated_at' => $at->copy()->addMinutes(3),
                ]);
            }

            if ($ref === 'ENT-2026-000128') {
                DpCase::updateOrCreate(['reference' => 'REF-2026-00078'], [
                    'entitlement_id' => $ent->id, 'kind' => 'refund', 'reason' => 'Product does not match description',
                    'description' => 'The guide does not cover public-sector PFMA feasibility requirements as described.',
                    'outcome' => 'Full refund', 'downloaded' => false, 'status' => 'under_review', 'legal_state' => 'TBCA-failure assessment',
                    'amount_zar' => $price,
                ]);
            }
        }
    }

    private function events(): void
    {
        if (DpEvent::exists()) {
            return;
        }

        $rows = [
            ['DP_VERSION_RELEASED', 'DpProduct', 'Business Plan Template', '2026-08-10 10:24', ['version' => 'v1.3']],
            ['DP_DEFENSIBILITY_PASSED', 'DpProduct', 'Marketing Strategy Toolkit', '2026-08-10 09:58', []],
            ['DP_PRICE_UPDATED', 'DpPriceItem', 'Cash Flow Forecast Template', '2026-08-10 09:41', ['step' => 'Price floor exception resolved']],
            ['DP_REFUND_APPROVED', 'DpCase', 'Order DPORD-2026-000732', '2026-08-10 09:17', []],
            ['DP_CORRECTION_OPENED', 'DpIncident', 'Investor Pitch Deck Template v1.2', '2026-08-10 08:55', ['severity' => 'S2']],
        ];

        foreach ($rows as [$event, $type, $label, $at, $data]) {
            DpEvent::create(['event' => $event, 'subject_type' => $type, 'subject_label' => $label, 'data' => $data ?: null, 'created_at' => $at, 'updated_at' => $at]);
        }
    }
}
