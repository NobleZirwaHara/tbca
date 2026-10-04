<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Room;

/**
 * Commercial register: diagnostic scoring, preliminary estimate, formal
 * quotation, fee breakdown (TBCA 60% expert rule, landed cost + 25% external
 * margin), deposit, closing, subscription, renewal and change-request prices.
 */
class Pricing
{
    public const VAT = 0.15;

    public const DEPOSIT_NET = 300000;

    public const DIAGNOSTIC_OPTIONS = ['3' => 'Fully in place', '2' => 'Partially in place', '1' => 'Planned', '0' => 'Not in place'];

    public static function vat(int|float $net): int
    {
        return (int) round($net * self::VAT);
    }

    /** @return array<string, array{title: string, risk: string, questions: array<string, string>}> */
    public static function diagnosticSections(): array
    {
        return [
            'strategy' => ['title' => 'Strategic & Transaction Overview', 'risk' => 'Market Risk', 'questions' => [
                'objective' => 'Transaction objective approved by the board',
                'proceeds' => 'Use of proceeds defined and costed',
                'investor_profile' => 'Target investor or buyer profile defined',
                'timeline' => 'Realistic transaction timeline agreed',
            ]],
            'financial' => ['title' => 'Financial & Performance', 'risk' => 'Financial Risk', 'questions' => [
                'audited' => 'Audited financial statements (last 3 years)',
                'model' => 'Five-year financial model with assumptions',
                'management_accounts' => 'Monthly management accounts up to date',
                'debt' => 'Debt schedule and covenant compliance evidence',
            ]],
            'operations' => ['title' => 'Operations & Business Model', 'risk' => 'Operational Risk', 'questions' => [
                'unit_economics' => 'Unit economics documented',
                'customers' => 'Customer concentration analysed',
                'team' => 'Management team and key-person cover',
                'systems' => 'Core systems and data controls in place',
            ]],
            'legal' => ['title' => 'Legal & Compliance', 'risk' => 'Legal / Regulatory Risk', 'questions' => [
                'records' => 'Corporate records and statutory registers complete',
                'contracts' => 'Material contracts identified and reviewed',
                'licences' => 'Regulatory licences current (e.g. FSP)',
                'litigation' => 'Litigation and disputes disclosed',
            ]],
            'documents' => ['title' => 'Documents & Data Readiness', 'risk' => 'Execution Risk', 'questions' => [
                'digital' => 'Key documents digitised and indexed',
                'cap_table' => 'Cap table and share register reconciled',
                'ip' => 'IP register and ownership evidence',
                'tax' => 'Tax clearance and returns available',
            ]],
            'governance' => ['title' => 'Governance & Stakeholders', 'risk' => 'Execution Risk', 'questions' => [
                'board' => 'Board structure and charter',
                'sha' => 'Shareholders\' agreement in force',
                'related' => 'Related-party transactions recorded',
                'esg' => 'ESG and B-BBEE policies',
            ]],
        ];
    }

    public static function diagnosticProgress(Room $room): array
    {
        $answers = $room->diagnostic['answers'] ?? [];
        $total = 0;
        $answered = 0;
        $score = 0;
        $sections = [];
        foreach (self::diagnosticSections() as $key => $s) {
            $sa = 0;
            $ss = 0;
            foreach ($s['questions'] as $q => $label) {
                $total++;
                if (isset($answers[$key][$q]) && $answers[$key][$q] !== '') {
                    $answered++;
                    $sa++;
                    $ss += (int) $answers[$key][$q];
                }
            }
            $score += $ss;
            $pct = $sa ? (int) round($ss / ($sa * 3) * 100) : null;
            $sections[] = ['key' => $key, 'title' => $s['title'], 'risk' => $s['risk'], 'answered' => $sa, 'total' => count($s['questions']), 'score' => $pct];
        }
        $readiness = $answered ? (int) round($score / ($answered * 3) * 100) : 0;

        $risks = [];
        foreach ($sections as $sec) {
            $level = $sec['score'] === null ? 'Not assessed' : ($sec['score'] >= 75 ? 'Low' : ($sec['score'] >= 50 ? 'Medium' : 'High'));
            $risks[$sec['risk']] = isset($risks[$sec['risk']]) && $risks[$sec['risk']] === 'High' ? 'High' : $level;
        }

        return [
            'answered' => $answered,
            'total' => $total,
            'readiness' => $readiness,
            'band' => $readiness >= 80 ? 'Excellent' : ($readiness >= 60 ? 'Good' : ($readiness >= 40 ? 'Fair' : 'Low')),
            'complexity' => $room->amount_zar > 250_000_000 ? 'High' : ($room->amount_zar > 50_000_000 ? 'Medium' : 'Low'),
            'sections' => $sections,
            'risks' => collect($risks)->map(fn ($l, $k) => ['label' => $k, 'level' => $l])->values()->all(),
        ];
    }

    /** Preliminary non-binding ranges scale with deal value (Pre-Mandate VDR-029). */
    public static function estimate(Room $room): array
    {
        $v = max($room->amount_zar, 20_000_000);
        $r = fn ($pct, $floor) => (int) (max($floor, round($v * $pct / 10000)) );
        $a = [$r(50, 150000), $r(105, 300000)];
        $b = [$r(15, 60000), $r(35, 140000)];
        $c = [$r(25, 80000), $r(73.3, 220000)];

        return [
            'reference' => Audit::ref($room, 'EST'),
            'expert' => $a, 'platform' => $b, 'external' => $c,
            'total' => [$a[0] + $b[0] + $c[0], $a[1] + $b[1] + $c[1]],
            'validDays' => 14,
        ];
    }

    /** Formal quotation (VDR-030). */
    public static function quote(Room $room): array
    {
        $success = (int) round($room->amount_zar * 0.025);
        $professional = [
            ['item' => 'Retainer Fee', 'basis' => 'Monthly (6 Months)', 'net' => 300000],
            ['item' => 'Success Fee', 'basis' => '2.5% of Funds Raised', 'net' => $success],
            ['item' => 'Out-of-Pocket Disbursements', 'basis' => 'Reimbursable at Cost', 'net' => 150000],
        ];
        $disbursements = [
            ['item' => 'Legal & Regulatory Filings', 'net' => 50000],
            ['item' => 'Third-Party Due Diligence', 'net' => 60000],
            ['item' => 'Printing, Travel & Logistics', 'net' => 25000],
            ['item' => 'Data Room & Tech Services', 'net' => 15000],
        ];
        $add = fn ($rows) => array_map(fn ($r) => [...$r, 'vat' => self::vat($r['net']), 'total' => $r['net'] + self::vat($r['net'])], $rows);
        $p = $add($professional);
        $d = $add($disbursements);
        $sum = fn ($rows, $k) => array_sum(array_column($rows, $k));

        return [
            'reference' => Audit::ref($room, 'QTE'),
            'professional' => $p,
            'disbursements' => $d,
            'professionalTotals' => ['net' => $sum($p, 'net'), 'vat' => $sum($p, 'vat'), 'total' => $sum($p, 'total')],
            'disbursementTotals' => ['net' => $sum($d, 'net'), 'vat' => $sum($d, 'vat'), 'total' => $sum($d, 'total')],
            'grandTotal' => $sum($p, 'total') + $sum($d, 'total'),
            'successFee' => $success,
        ];
    }

    /** Fee breakdown (VDR-031): expert = verified market average x 60%; external = landed cost + 25% admin margin. */
    public static function feeBreakdown(): array
    {
        $expert = array_map(fn ($r) => [...$r, 'fee' => (int) round($r['market'] * 0.6), 'saving' => 40], [
            ['workstream' => 'Financial Due Diligence', 'market' => 120000],
            ['workstream' => 'Valuation & Analysis', 'market' => 90000],
            ['workstream' => 'Legal & Transaction Advisory', 'market' => 150000],
            ['workstream' => 'Negotiation Support', 'market' => 60000],
            ['workstream' => 'Project Management', 'market' => 55000],
        ]);
        $platform = [
            ['component' => 'Deal Room & Security', 'unit' => 'Per Deal Room / Monthly', 'rate' => 10000, 'qty' => '6 Months', 'amount' => 60000, 'notes' => 'Secure VDR, access control'],
            ['component' => 'AI Agents & RPA', 'unit' => 'Per Transaction', 'rate' => 15000, 'qty' => '1', 'amount' => 15000, 'notes' => 'AI agents, automation & data extraction'],
            ['component' => 'Q&A & Reporting', 'unit' => 'Per Transaction', 'rate' => 7000, 'qty' => '1', 'amount' => 7000, 'notes' => 'Q&A, dashboards, analytics & reports'],
            ['component' => 'Document Management', 'unit' => 'Per GB / Monthly', 'rate' => 100, 'qty' => '20 GB x 6 Months', 'amount' => 12000, 'notes' => 'Storage, versioning & sync'],
        ];
        $external = array_map(function ($r) {
            $approved = $r['supplier'] + $r['transfer'];
            $landed = $approved + $r['tax'];
            $margin = (int) round($landed * 0.25);
            $vat = self::vat($landed + $margin);

            return [...$r, 'approved' => $approved, 'landed' => $landed, 'margin' => $margin, 'vat' => $vat, 'total' => $landed + $margin + $vat];
        }, [
            ['supplier_name' => 'Deloitte South Africa — Financial Due Diligence', 'supplier' => 120000, 'transfer' => 1500, 'tax' => 1500],
            ['supplier_name' => 'Werksmans Attorneys — Legal Opinion', 'supplier' => 80000, 'transfer' => 1000, 'tax' => 1000],
            ['supplier_name' => 'PwC South Africa — Valuation Report', 'supplier' => 60000, 'transfer' => 1000, 'tax' => 1000],
            ['supplier_name' => 'Moody\'s Analytics — Market Data Pack', 'supplier' => 25000, 'transfer' => 500, 'tax' => 500],
        ]);
        $sum = fn ($rows, $k) => array_sum(array_column($rows, $k));

        return [
            'expert' => $expert,
            'platform' => $platform,
            'external' => $external,
            'totals' => [
                'market' => $sum($expert, 'market'),
                'expert' => $sum($expert, 'fee'),
                'platform' => $sum($platform, 'amount'),
                'external' => $sum($external, 'total'),
                'saving' => $sum($expert, 'market') - $sum($expert, 'fee'),
            ],
        ];
    }

    public static function depositLines(): array
    {
        return [
            ['category' => 'TBCA Expert Fee — Deposit / Retainer', 'item' => 'Expert fee deposit', 'provider' => 'TBCA', 'net' => self::DEPOSIT_NET],
            ['category' => 'TBCA Platform Fee', 'item' => 'Initial setup entitlement (included)', 'provider' => 'TBCA Platform', 'net' => 0],
            ['category' => 'External Third-Party Fee', 'item' => 'Pre-approved reserve (not called)', 'provider' => 'External Suppliers', 'net' => 0],
        ];
    }

    public static function closingLines(): array
    {
        return [
            ['category' => 'TBCA Expert Fee', 'item' => 'Mandate & advisory services', 'provider' => 'TBCA', 'net' => 300000],
            ['category' => 'TBCA Platform Fee', 'item' => 'Platform access & data room', 'provider' => 'TBCA Platform', 'net' => 80000],
            ['category' => 'External Third-Party Fee', 'item' => 'Legal, valuation & other experts', 'provider' => 'External', 'net' => 90000],
            ['category' => 'Gateway & Processing Fee', 'item' => 'Payment gateway & card charges', 'provider' => 'Gateway', 'net' => 3000],
        ];
    }

    public const SUBSCRIPTION_NET = 345000;

    public static function renewalPackages(): array
    {
        return [
            'standard_12' => ['name' => 'Standard Renewal: 12 Months', 'description' => 'Active archive access, monitoring continuity, quarterly review reminders.', 'months' => 12, 'net' => 48000],
            'extended_24' => ['name' => 'Extended Renewal: 24 Months', 'description' => 'Includes export support and trust passport continuity.', 'months' => 24, 'net' => 86000],
            'secure_hold' => ['name' => 'Secure Hold Add-On', 'description' => 'Legal hold administration and restricted-access workspace.', 'months' => 12, 'net' => 66000],
        ];
    }

    /** Overage options (VDR-040). */
    public static function upgradePlans(): array
    {
        return [
            'growth_plus' => ['name' => 'Growth Plus Plan', 'monthly' => 2500, 'adds' => ['ocr_pages' => 5000, 'ai_qa' => 1000]],
            'enterprise' => ['name' => 'Enterprise Plan', 'monthly' => 5800, 'adds' => ['ocr_pages' => 15000, 'ai_qa' => 2500]],
        ];
    }

    /** Unit prices for change requests (VDR-041). */
    public static function changeRates(): array
    {
        return [
            'seats' => ['label' => 'Seats', 'expert' => 0, 'platform' => 1500],
            'buyer_groups' => ['label' => 'Additional investor group support', 'expert' => 45000, 'platform' => 3000],
            'storage_gb' => ['label' => 'Data room capacity (GB)', 'expert' => 0, 'platform' => 150],
            'ocr_pages' => ['label' => 'OCR processing allowance (pages)', 'expert' => 0, 'platform' => 2],
            'ai_qa' => ['label' => 'Extended Q&A facilitation (AI Q&A requests)', 'expert' => 0, 'platform' => 14.5],
            'meetings' => ['label' => 'Meetings', 'expert' => 5500, 'platform' => 0],
            'workshops' => ['label' => 'Extra negotiation support (workshops)', 'expert' => 20000, 'platform' => 0],
        ];
    }

    public const LEGAL_SUPPORT_EXTERNAL = 36000;

    public static function changeFees(array $increments, bool $legal): array
    {
        $expert = 0;
        $platform = 0;
        foreach (self::changeRates() as $k => $r) {
            $n = (int) ($increments[$k] ?? 0);
            $expert += $n * $r['expert'];
            $platform += $n * $r['platform'];
        }
        $external = $legal ? self::LEGAL_SUPPORT_EXTERNAL : 0;
        $net = (int) round($expert + $platform + $external);

        return ['expert' => (int) round($expert), 'platform' => (int) round($platform), 'external' => $external, 'net' => $net, 'vat' => self::vat($net), 'total' => $net + self::vat($net)];
    }

    /** Third-party landed cost: supplier + transfer + disbursement + non-recoverable tax, then 25% margin and VAT. */
    public static function thirdParty(int $supplier, int $transfer, int $disbursement, int $tax): array
    {
        $landed = $supplier + $transfer + $disbursement + $tax;
        $margin = (int) round($landed * 0.25);
        $vat = self::vat($landed + $margin);

        return ['landed' => $landed, 'margin' => $margin, 'vat' => $vat, 'total' => $landed + $margin + $vat, 'net' => $landed + $margin];
    }
}
