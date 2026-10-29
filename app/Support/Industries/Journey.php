<?php

namespace App\Support\Industries;

use Illuminate\Support\Carbon;

/**
 * The Industries engagement journey (prototype pages-ind-journey.js): product, limitation
 * statement, mandatory add-ons, gates G0 to G4, engagement letter, split checkout and the
 * workspace (partner route, specialist sign-off G7, acceptance G5, escalation G6, compliance
 * calendar, benchmark consent, fee ledger and abort ladder).
 *
 * State is one engagement per visitor, held by IndustryState under "ieng". Prices are the app's
 * Sprint prices in whole ZAR. Payment is simulated: no order or charge is created.
 */
class Journey
{
    public const GATES = [
        ['G0', 'Consent Gate', 'S0 Arrival & Exploration'], ['G1', 'Registration Gate', 'S1 Registration & Intent'], ['G2', 'Disclosure Gate', 'S2 Selection & Fee Sweep'],
        ['G3', 'Quotation Gate', 'S3 Quotation'], ['G4', 'Payment Gate', 'S4 Payment & Entitlement'], ['G5', 'Acceptance Gate', 'S5 Reports & Acceptance'],
        ['G6', 'Escalation Gate', 'S6 Human Escalation'], ['G7', 'Specialist Gate', 'S7 Specialist Sign-off'], ['G8', 'Mandate Gate', 'S8 Capital / Mandate'],
    ];

    public const DISC = [
        'AGR' => ['Agricultural Economics', 'Commodity Markets', 'Agri Policy & Regulation'], 'MIN' => ['Mining Engineering', 'Mineral Economics', 'Mining Law & Permitting'],
        'ENE' => ['Power Systems', 'Energy Economics', 'Energy Regulation'], 'FIN' => ['Financial Regulation', 'Credit & Risk', 'Compliance & AML'],
        'HLT' => ['Health Systems', 'Pharmaceutical Regulation', 'Clinical Quality'],
    ];

    public static function get(): ?array
    {
        return IndustryState::get('ieng');
    }

    public static function save(array $e): void
    {
        IndustryState::put('ieng', $e);
    }

    public static function create(array $ind, ?array $sub, array $c, array $s, string $tier): array
    {
        $price = $s['tiers'][$tier] ?? $s['ep'];
        $tasks = [['Country & industry scoping', 2, 'TBCA Analyst'], ['Data & evidence collection', 6, 'TBCA Analyst'], ['Sector analysis', 9, 'TBCA Analyst'], ['Provide additional data', 9, 'Client'],
            ['Policy & regulatory impact review', 11, 'Partner (P)'], ['Draft report review & feedback', 13, 'Client'], ['Specialist sign-off', 15, 'Specialists'], ['Report delivery & acceptance (G5)', 17, 'Client']];

        return [
            'ref' => sprintf('IND-%s-%s-%03d', $ind['code'], $c['iso3'], random_int(100, 999)), 'ind' => $ind['code'], 'sub' => $sub['code'] ?? '', 'iso' => $c['iso3'],
            'code' => $s['code'], 'name' => $s['name'], 'tier' => $tier, 'price' => (int) $price,
            'addons' => array_values(array_filter(IndustryData::addOns($ind), fn ($a) => $a['req'])),
            'gates' => (object) [], 'pays' => [], 'ledger' => [], 'created' => now()->toIso8601String(),
            'tasks' => array_map(fn ($t, $i) => ['id' => 'T'.($i + 1), 't' => $t[0], 'due' => now()->addDays($t[1])->toIso8601String(), 'who' => $t[2], 'done' => false], $tasks, array_keys($tasks)),
            'partner' => null, 'reviews' => (object) [], 'aborted' => false, 'splits' => null, 'reg' => null, 'letter' => null,
        ];
    }

    public static function normalise(?array $e): ?array
    {
        if (! $e) {
            return null;
        }
        $e['gates'] = (array) ($e['gates'] ?? []);
        $e['reviews'] = (array) ($e['reviews'] ?? []);

        return $e;
    }

    public static function vatRate(array $e): float
    {
        return (float) (IndustryData::country($e['iso'])['vat'] ?? 0);
    }

    /** T fee, P estimates, VAT on T, totals and payments in whole ZAR (prototype engTotals). */
    public static function totals(array $e): array
    {
        $t = (int) ($e['price'] ?? 0);
        $p = array_sum(array_map(fn ($a) => (int) ($a['fee'] ?? 0), $e['addons']));
        $vat = (int) round($t * self::vatRate($e) / 100);
        $paid = (int) array_sum(array_map(fn ($x) => (int) $x['amt'], $e['pays']));

        return ['t' => $t, 'p' => $p, 'vat' => $vat, 'total' => $t + $vat, 'paid' => $paid, 'out' => max(0, $t + $vat - $paid)];
    }

    public static function ledger(array &$e, array $row): void
    {
        $e['ledger'][] = array_merge(['at' => now()->toIso8601String()], $row);
    }

    /** The current gate among G0 to G4 (first not yet passed). */
    public static function currentGate(array $e): ?string
    {
        foreach (['G0', 'G1', 'G2', 'G3', 'G4'] as $k) {
            if (empty($e['gates'][$k])) {
                return $k;
            }
        }

        return null;
    }

    /** Compliance obligations for the engagement's industry and country (prototype obligationsFor). */
    public static function obligations(array $e): array
    {
        $ind = IndustryData::industry($e['ind']);
        $c = IndustryData::country($e['iso']);
        $base = Carbon::parse($e['gates']['G4'] ?? $e['created']);
        $bw = $c['iso3'] === 'BWA';
        $za = $c['iso3'] === 'ZAF';
        $ob = [];
        $add = function (int $d, string $name, string $body, string $type) use (&$ob, $base) {
            $ob[] = ['due' => $base->copy()->addDays($d)->startOfDay(), 'name' => $name, 'body' => $body, 'type' => $type];
        };
        if ($c['vat'] !== null) {
            foreach ([7, 37, 67] as $d) {
                $add($d, 'VAT return ('.self::num($c['vat']).' %)', $bw ? 'Botswana Unified Revenue Service (BURS)' : ($za ? 'SARS' : 'Revenue authority'), 'Filing');
            }
        }
        foreach ([14, 44, 74] as $d) {
            $add($d, 'PAYE / social contributions', $bw ? 'BURS' : ($za ? 'SARS / UIF' : 'Revenue & social security bodies'), 'Payment');
        }
        if ($bw) {
            foreach (IndustryData::bySec(IndustryData::register('BW_Permits'), $ind) as $i => $p) {
                $add(20 + $i * 9, explode(';', (string) $p['Permits'])[0].' — renewal / compliance', (string) $p['Issuer'], 'Renewal');
            }
        } else {
            foreach (IndustryData::IND_REG_ROLE[$ind['code']] ?? [] as $i => $r) {
                $add(20 + $i * 11, "{$r} — licence renewal", "{$r} ({$c['name']}) [name to verify]", 'Renewal');
            }
        }
        $add(30, 'Annual return', $bw ? 'CIPA (Companies and Intellectual Property Authority)' : ($za ? 'CIPC' : 'Companies registry'), 'Filing');
        $add(60, 'Environmental / sector report', 'Sector regulator', 'Reporting');
        $add(-3, 'Data-protection registration check', 'Data protection authority', 'Reporting');
        usort($ob, fn ($a, $b) => $a['due'] <=> $b['due']);
        $today = now()->startOfDay();

        return array_map(fn ($o) => ['due' => $o['due']->toDateString(), 'name' => $o['name'], 'body' => $o['body'], 'type' => $o['type'], 'overdue' => $o['due']->lt($today)], $ob);
    }

    private static function num(float $v): string
    {
        return rtrim(rtrim(number_format($v, 2, '.', ''), '0'), '.');
    }
}
