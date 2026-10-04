<?php

namespace App\Support\Aiim;

use App\Models\Aiim\FeeCode;
use App\Models\Aiim\Project;

/**
 * Every AIIM price is computed from the fee-code catalogue (Pricing
 * Administration). Fee components are additive and VAT (15%) is shown
 * separately before payment (GAP-047). External fees carry a disclosed 25%
 * TBCA administration margin (blueprint §3 "External Fee").
 */
class Pricing
{
    public const VAT_RATE = 0.15;

    public const EXTERNAL_ADMIN_RATE = 0.25;

    public const DEPOSIT_PERCENT = 50;

    public const EXTERNAL_TOLERANCE = 0.10;

    /** @var array<string, FeeCode|null> */
    private static array $cache = [];

    public static function flush(): void
    {
        self::$cache = [];
    }

    public static function code(string $code): ?FeeCode
    {
        if (! array_key_exists($code, self::$cache)) {
            self::$cache[$code] = FeeCode::query()->where('code', $code)->where('status', 'active')->first();
        }

        return self::$cache[$code];
    }

    /** Active amount for a fee code, falling back to the launch tariff. */
    public static function amount(string $code, float $fallback = 0): float
    {
        return (float) (self::code($code)?->amount_zar ?? $fallback);
    }

    public static function rate(string $code, float $fallback = 0): float
    {
        return (float) (self::code($code)?->rate ?? $fallback);
    }

    public static function vat(float $amount): float
    {
        return round($amount * self::VAT_RATE, 2);
    }

    /**
     * @param  list<array{label: string, amount: float}>  $lines
     * @return array{lines: list<array>, subtotal: float, vat: float, total: float}
     */
    public static function totals(array $lines): array
    {
        $subtotal = round(collect($lines)->sum('amount'), 2);
        $vat = self::vat($subtotal);

        return ['lines' => $lines, 'subtotal' => $subtotal, 'vat' => $vat, 'total' => round($subtotal + $vat, 2)];
    }

    /**
     * Fee manifest for a selection of premium objects (Fee Discovery / Fee Manifest).
     * Expert, platform and external fees are charged per item; administration per quote.
     *
     * @param  list<array{type: string, key: string, label: string}>  $items
     */
    public static function manifest(array $items): array
    {
        $n = count($items);
        if ($n === 0) {
            return self::totals([]);
        }

        $line = fn (string $code, string $label, string $desc, string $basis, float $unit, int $qty, string $notes) => [
            'code' => $code, 'label' => $label, 'description' => $desc, 'basis' => $basis,
            'unit' => $unit, 'quantity' => $qty, 'amount' => round($unit * $qty, 2), 'notes' => $notes,
        ];

        return self::totals([
            $line('AIIM-EXP-001', 'TBCA Expert Fee', 'Research, analysis, curation and expert oversight by TBCA specialists.', 'Per item', self::amount('AIIM-EXP-001', 950), $n, 'Human research and expert validation.'),
            $line('AIIM-PLAT-001', 'TBCA Platform Fee', 'Platform access, data processing, AI agents and infrastructure.', 'Per item', self::amount('AIIM-PLAT-001', 450), $n, 'Platform usage, AI agents, storage.'),
            $line('AIIM-EXT-001', 'External Supplier Cost', 'Third-party data providers, licences and verified datasets.', 'At cost', self::amount('AIIM-EXT-001', 400), $n, 'Pass-through cost. Not a margin.'),
            $line('AIIM-ADM-001', 'TBCA External Administration', 'Client success, compliance, security and administration.', 'Per quote', self::amount('AIIM-ADM-001', 600), 1, 'Governance, compliance and admin support.'),
        ]);
    }

    /** Metered pay-per-view unlock of a locked premium object. */
    public static function unlock(Project $project, int $extraViews = 0): array
    {
        $premium = $project->premium ?? [];
        $views = (int) ($premium['views'] ?? 10);
        $base = self::amount('AIIM-UNL-001', 2000);
        $extra = self::amount('AIIM-UNL-XV', 285);
        $platform = self::amount('AIIM-UNL-PLT', 280);

        $lines = [
            ['code' => 'AIIM-UNL-001', 'label' => "Metered Unlock Fee ({$views} views)", 'amount' => $base],
        ];
        if ($extraViews > 0) {
            $lines[] = ['code' => 'AIIM-UNL-XV', 'label' => "Extra View Allowance (est. {$extraViews} views)", 'amount' => round($extra * $extraViews, 2)];
        }
        $lines[] = ['code' => 'AIIM-UNL-PLT', 'label' => 'TBCA Platform Fee', 'amount' => $platform];

        return self::totals($lines) + [
            'views' => $views + $extraViews,
            'baseViews' => $views,
            'extraViewRate' => $extra,
            'durationDays' => (int) ($premium['duration_days'] ?? 7),
        ];
    }

    /** Report types available in Report Configuration, keyed by fee code. */
    public static function reportTypes(): array
    {
        return [
            'AIIM-RPT-PFM-001' => ['name' => 'Premium Financial Model', 'mode' => 'Pay-per-view Report', 'fallback' => 1500],
            'AIIM-RPT-SEC-001' => ['name' => 'Sector Intelligence Report', 'mode' => 'Standard Report', 'fallback' => 1200],
            'AIIM-RPT-PRV-001' => ['name' => 'Province Investment Profile', 'mode' => 'Standard Report', 'fallback' => 1000],
        ];
    }

    /**
     * Report quotation: expert fee = type base + R350 per content module + R400 per
     * additional named province; external data R600 per sector; flat platform and
     * administration fees.
     *
     * @param  array{type: string, nationwide: bool, provinces: list<string>, sectors: list<string>, modules: list<string>, delivery?: string}  $config
     */
    public static function report(array $config): array
    {
        $types = self::reportTypes();
        $typeCode = array_key_exists($config['type'] ?? '', $types) ? $config['type'] : 'AIIM-RPT-PFM-001';
        $modules = count($config['modules'] ?? []);
        $sectors = count($config['sectors'] ?? []);
        $provinces = count($config['provinces'] ?? []);
        $extraProvinces = max(0, $provinces - 1);

        $expert = self::amount($typeCode, $types[$typeCode]['fallback'])
            + $modules * self::amount('AIIM-RPT-MOD', 350)
            + $extraProvinces * self::amount('AIIM-RPT-PRV', 400);
        $rush = ($config['delivery'] ?? 'standard') === 'express';
        if ($rush) {
            $expert = round($expert * 1.25, 2);
        }

        $totals = self::totals([
            ['code' => $typeCode, 'label' => 'TBCA Expert Fee', 'description' => 'Research, analysis and modelling by TBCA experts', 'amount' => round($expert, 2)],
            ['code' => 'AIIM-RPT-PLT', 'label' => 'TBCA Platform Fee', 'description' => 'Platform access, data processing and tools', 'amount' => self::amount('AIIM-RPT-PLT', 1350)],
            ['code' => 'AIIM-RPT-EXT', 'label' => 'External Data & Sources', 'description' => 'Third-party datasets and licensed sources', 'amount' => round($sectors * self::amount('AIIM-RPT-EXT', 600), 2)],
            ['code' => 'AIIM-RPT-ADM', 'label' => 'TBCA Administration', 'description' => 'Project management and quality assurance', 'amount' => self::amount('AIIM-RPT-ADM', 600)],
        ]);

        $pagesMin = 5 * $modules + 5;
        $pagesMax = 7 * $modules + 6;
        $daysMax = 3 + (int) ceil($modules / 2) + ($sectors > 3 ? 2 : 0);
        if ($rush) {
            $daysMax = max(2, (int) ceil($daysMax / 2));
        }

        return $totals + [
            'typeCode' => $typeCode,
            'typeName' => $types[$typeCode]['name'],
            'typeMode' => $types[$typeCode]['mode'],
            'pages' => $modules ? "{$pagesMin} – {$pagesMax} pages" : '—',
            'delivery' => $modules ? max(1, $daysMax - 2).' – '.$daysMax.' business days' : '—',
        ];
    }

    /**
     * Verification scope summary. Expert fees per selected item, platform fee at 18%
     * of expert, external supplier estimate and a 25% administration margin on it.
     *
     * @param  iterable<\App\Models\Aiim\VerificationItem>  $items
     */
    public static function verification(iterable $items, bool $approvedOnly = false): array
    {
        $selected = collect($items)->filter(fn ($i) => $i->selected && (! $approvedOnly || $i->cost_approved));
        $expert = round($selected->sum('expert_fee_zar'), 2);
        $external = round($selected->sum('supplier_cost_zar'), 2);

        return self::totals([
            ['code' => 'AIIM-VER-EXP', 'label' => 'TBCA Expert Fee', 'amount' => $expert],
            ['code' => 'AIIM-VER-PLT', 'label' => 'TBCA Platform Fee', 'amount' => round($expert * self::rate('AIIM-VER-PLT', 18) / 100, 2)],
            ['code' => 'AIIM-EXT-001', 'label' => 'External Supplier Costs', 'amount' => $external],
            ['code' => 'AIIM-EXT-ADM', 'label' => 'TBCA External Administration (25% of external)', 'amount' => round($external * self::EXTERNAL_ADMIN_RATE, 2)],
        ]) + ['count' => $selected->count(), 'external' => $external];
    }

    /**
     * Engagement quotation from advisor-scoped work items.
     *
     * @param  list<array{item: string, description: string, deliverables: string, amount: float}>  $items
     */
    public static function engagement(array $items, float $external = 0): array
    {
        $expert = round(collect($items)->sum('amount'), 2);
        $totals = self::totals([
            ['code' => 'AIIM-ENG-EXP', 'label' => 'TBCA Expert Fees', 'amount' => $expert],
            ['code' => 'AIIM-ENG-PLT', 'label' => 'TBCA Platform Fees', 'amount' => self::amount('AIIM-ENG-PLT', 6000)],
            ['code' => 'AIIM-EXT-001', 'label' => 'External Supplier Costs', 'amount' => $external],
            ['code' => 'AIIM-ENG-ADM', 'label' => 'TBCA External Administration', 'amount' => self::amount('AIIM-ENG-ADM', 4000)],
        ]);
        $depositEx = round($totals['subtotal'] * self::DEPOSIT_PERCENT / 100, 2);

        return $totals + [
            'items' => $items,
            'deposit_percent' => self::DEPOSIT_PERCENT,
            'deposit_ex_vat' => $depositEx,
            'deposit_vat' => self::vat($depositEx),
            'deposit_total' => round($depositEx + self::vat($depositEx), 2),
        ];
    }

    /** Prepaid credit packs for the AIIM wallet. */
    public static function creditPacks(): array
    {
        return [
            ['code' => 'AIIM-CRD-2K', 'credits' => 2000, 'price' => self::amount('AIIM-CRD-2K', 2000), 'label' => 'Starter Pack'],
            ['code' => 'AIIM-CRD-5K', 'credits' => 5000, 'price' => self::amount('AIIM-CRD-5K', 4750), 'label' => 'Professional Pack', 'saving' => '5% saving'],
            ['code' => 'AIIM-CRD-10K', 'credits' => 10000, 'price' => self::amount('AIIM-CRD-10K', 9000), 'label' => 'Enterprise Pack', 'saving' => '10% saving'],
        ];
    }
}
