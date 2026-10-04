<?php

namespace App\Support\Shop;

use App\Models\Shop\Product;
use App\Models\Shop\RetainerCapacity;

/**
 * Vehicle-Aware Listing Gate and the CA -> LS derivation engine
 * (blueprint Parts 3 and 13.12). Listing state is always generated from
 * commercial availability plus the critical governance gates:
 *
 *   LS = f(CA, gates)   PUBLIC_COMMITMENT_ALLOWED only when hard blocks = 0
 */
class ListingGate
{
    public const ENGINE_VERSION = 'v2.3.1';

    public const RULESET = 'LS-DERIV-2026.05.12';

    public const GATES = [
        'completeness' => 'Completeness (>=99%)',
        'price_floor' => 'Price / Floor (>=Floor)',
        'version' => 'ProductVersion (Creation QA = PASS)',
        'tax' => 'Tax Profile (Confirmed)',
        'licence' => 'Licence / IP (Exact Scope Cleared)',
        'release' => 'Release QA (UAT & Evidence)',
    ];

    /**
     * @return array{ca: string, gates: array<string, string>, listing_state: string, outcome: string, reasons: list<string>, hard: list<string>, soft: list<string>}
     */
    public static function evaluate(Product $p): array
    {
        $g = $p->gates ?? [];
        $hard = [];
        $soft = [];
        $gates = [];

        $completeness = (int) ($g['completeness'] ?? 100);
        $gates['completeness'] = $completeness >= 99 ? 'pass' : 'fail';
        if ($gates['completeness'] === 'fail') {
            $hard[] = "Completeness {$completeness}% (<99%)";
        }
        foreach ($g['missing_hard'] ?? [] as $m) {
            $hard[] = "Missing: {$m}";
            $gates['completeness'] = 'fail';
        }
        foreach ($g['missing_soft'] ?? [] as $m) {
            $soft[] = "Missing: {$m}";
        }

        $gates['price_floor'] = 'pass';
        $binding = in_array($p->act, ['A1', 'A2', 'A3', 'A4'], true);
        if (in_array($p->act, ['A1', 'A2', 'A3'], true) && $p->price_zar === null) {
            $gates['price_floor'] = 'fail';
            $hard[] = 'No price set';
        } elseif ($binding && $p->price_zar !== null && $p->floor_zar !== null && $p->price_zar < $p->floor_zar) {
            $gates['price_floor'] = 'fail';
            $hard[] = 'Below floor price';
        }

        $qa = $g['qa'] ?? 'passed';
        $gates['version'] = match ($qa) {
            'passed' => 'pass',
            'pending' => 'warn',
            default => 'fail',
        };
        if ($gates['version'] === 'fail') {
            $hard[] = 'Version / QA not PASS';
        } elseif ($gates['version'] === 'warn') {
            $soft[] = 'Creation QA pending';
        }

        $gates['tax'] = 'pass';
        if ($p->isMonetary() && ! $p->tax_confirmed) {
            $gates['tax'] = 'warn';
            $hard[] = 'Tax profile unconfirmed';
        }

        $rights = $g['rights'] ?? 'cleared';
        $gates['licence'] = $rights === 'cleared' ? 'pass' : 'fail';
        if ($gates['licence'] === 'fail') {
            $hard[] = 'Licence '.($g['licence_scope'] ?? '').' not cleared';
        }

        $gates['release'] = ($g['release'] ?? true) ? 'pass' : 'fail';
        if ($gates['release'] === 'fail') {
            $hard[] = 'Release QA not passed';
        }

        if ($p->act === 'A4') {
            $capacity = $p->id ? RetainerCapacity::query()->where('product_id', $p->id)->first() : null;
            if ($capacity && collect($capacity->elements)->contains(false)) {
                $hard[] = 'C1-C5 incomplete';
            }
        }

        $certified = $p->isCertifiedSubscription();
        if ($p->act === 'A3' && ! $certified) {
            $failing = collect(['r1', 'r2', 'r3', 'r4', 'r5'])->first(fn ($k) => ($p->recurrence[$k] ?? null) !== 'pass');
            $soft[] = strtoupper((string) $failing).' Not Certified';
        }

        $ca = match (true) {
            $gates['licence'] === 'fail' => 'not_allowed',
            $hard !== [] => 'unavailable',
            $p->act === 'A3' => $certified ? 'available' : 'pending',
            $p->act === 'A4' => 'requested_proposal',
            $p->act === 'A5' => 'brief',
            $p->act === 'A6' => 'quote',
            $p->act === 'A7' => 'available_free',
            default => 'available',
        };

        $ls = match (true) {
            $gates['licence'] === 'fail' => 'LS-06',
            $hard !== [] => 'LS-05',
            $p->act === 'A3' => $certified ? 'LS-01' : 'LS-05',
            $p->act === 'A4' => 'LS-02',
            in_array($p->act, ['A5', 'A6'], true) => 'LS-04',
            $p->act === 'A7' => 'LS-03',
            default => 'LS-01',
        };

        $outcome = $hard !== [] ? 'blocked' : ($soft !== [] ? 'warning' : 'passed');

        return [
            'ca' => $ca,
            'gates' => $gates,
            'listing_state' => $ls,
            'outcome' => $outcome,
            'reasons' => [...$hard, ...$soft],
            'hard' => $hard,
            'soft' => $soft,
        ];
    }

    /** Re-derives and stores the listing state of one product. */
    public static function apply(Product $p): Product
    {
        $r = self::evaluate($p);
        $p->forceFill([
            'listing_state' => $r['listing_state'],
            'gate_outcome' => $r['outcome'],
            'gate_reasons' => $r['reasons'],
            'gate_evaluated_at' => now(),
        ])->save();

        return $p;
    }

    /** Full gate scan across the catalogue. Returns counts by outcome. */
    public static function scan(): array
    {
        $counts = ['passed' => 0, 'warning' => 0, 'blocked' => 0];
        Product::query()->each(function (Product $p) use (&$counts) {
            self::apply($p);
            $counts[$p->gate_outcome]++;
        });
        Setting::put('gate_last_scan', now()->toIso8601String());

        return $counts;
    }

    public static function caLabel(string $ca): string
    {
        return [
            'available' => 'Available',
            'available_free' => 'Available (Free)',
            'requested_proposal' => 'Requested (Proposal)',
            'brief' => 'Brief Submission',
            'quote' => 'Quote Required',
            'pending' => 'Pending Certification',
            'unavailable' => 'Unavailable',
            'not_allowed' => 'Not Allowed',
        ][$ca] ?? $ca;
    }

    /** The LS a CA maps to before gates are applied (used for the LS = CA proof). */
    public static function lsForCa(string $ca): string
    {
        return match ($ca) {
            'available' => 'LS-01',
            'requested_proposal' => 'LS-02',
            'available_free' => 'LS-03',
            'brief', 'quote' => 'LS-04',
            'not_allowed' => 'LS-06',
            default => 'LS-05',
        };
    }
}
