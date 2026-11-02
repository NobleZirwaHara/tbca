<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\CountryState;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Country Profile & Planning (prototype pages-profile.js): P03 Country Profile, P04 Evidence Panel,
 * P05 Availability, P06 Service Catalogue, P07 Service Detail, P08 Context Resolver, P09 Selection
 * Impact, P10 Limitations, P11 Tax, P12 Payments, P13 Language, P14 Partners, P15 Legal, P16 Privacy
 * and P56 Change History. Botswana carries the BW-1.0 registers, South Africa its own mock-up content
 * and every other country the prototype's non-BW branch (often the pack-loading panel).
 */
class ProfileController extends Controller
{
    /** Prototype hasJourney(c): every activated country has the full commercial journey. */
    private const LIVE = true;

    /** AIIM benchmark column per country (prototype BENCHCOL). */
    public const BENCHCOL = ['MWI' => 'Malawi', 'GHA' => 'Ghana', 'NGA' => 'Nigeria', 'EGY' => 'Egypt', 'MAR' => 'Morocco', 'ZAF' => 'South Africa', 'DZA' => 'Algeria', 'BWA' => 'Botswana'];

    /* ------------------------------------------------------------------ P03 Country Profile */
    public function profile(Request $request, string $country): Response
    {
        $c = $this->country($country);
        $bw = CountryHub::isBW($c);
        $sum = CountryHub::summary();

        return $this->countryPage($c, 'Profile/Profile', [
            'tab' => (string) $request->query('tab', 'overview'),
            'summary' => $bw ? [
                'facts' => $sum['Sector facts'] ?? null, 'g3' => $sum['Grade 3 %'] ?? null, 'macro' => $sum['Macro facts'] ?? null,
                'verified' => $sum['Facts verified (random sample)'] ?? null, 'validator' => $sum['Validator passes'] ?? null,
            ] : null,
            'updates' => $bw ? array_slice(CountryHub::register('BW_RegChange'), 0, 6) : [],
            'live' => self::LIVE,
            'bench' => self::LIVE ? null : self::bench($c),
            'saved' => array_values(array_map('strval', (array) CountryState::get('saved', []))),
            'shelf' => CountryHub::shelf(['intelligence', 'market-entry'], 4, 'Start here — country Sprints'),
        ]);
    }

    /* ------------------------------------------------------------------ P07 Service Detail */
    public function service(string $country, string $code): Response
    {
        $c = $this->country($country);
        $s = CountryHub::sprints()[$code] ?? null;
        if (! $s) {
            return $this->countryPage($c, 'Profile/Service', ['code' => $code, 's' => null, 'related' => []]);
        }
        $pub = (string) $s['pub'];
        $market = CountryHub::market($s['code']) ?? [];
        $tiers = [];
        foreach (['Basic' => 'b', 'Standard' => 's', 'Premium' => 'p'] as $tier => $letter) {
            $tiers[] = ['tier' => $tier, 'price' => $s['tiers'][$tier] ?? null, 'pub' => str_contains($pub, $letter), 'med' => $market[$tier] ?? null];
        }
        $related = [];
        foreach (CountryHub::sprints() as $x) {
            if ($x['topic'] === $s['topic'] && $x['code'] !== $s['code'] && $x['viable'] && $x['pop'] === 'PUBLISHED') {
                $related[] = CountryHub::card($x);
                if (count($related) >= 4) {
                    break;
                }
            }
        }

        return $this->countryPage($c, 'Profile/Service', [
            'code' => $code,
            's' => [
                'code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'topic' => $s['topic'], 'topicLabel' => CountryHub::TOPICS[$s['topic']] ?? $s['topic'],
                'up' => $s['up'], 'arch' => $market['arch'] ?? null, 'pop' => $s['pop'], 'viable' => $s['viable'], 'entry' => $s['entry'], 'ep' => $s['ep'], 'nTiers' => strlen($pub), 'tiers' => $tiers,
            ],
            'live' => self::LIVE && $s['viable'],
            'vat' => CountryHub::isBW($c) ? 0.14 : 0.15,
            'related' => $related,
        ]);
    }

    /* ------------------------------------------------------------------ P04 to P16, P56 */
    public function page(Request $request, string $country, string $page): Response|StreamedResponse
    {
        $c = $this->country($country);

        return match ($page) {
            'evidence' => $this->evidence($c),
            'availability' => $this->availability($c),
            'catalogue' => $this->catalogue($request, $c),
            'resolver' => $this->resolver($c),
            'impact' => $this->impact($request, $c),
            'limitations' => $this->limitations($c),
            'tax' => $this->tax($c),
            'payments' => $this->payments($c),
            'language' => $this->language($c),
            'partners' => $this->partners($c),
            'legal' => $this->legal($c),
            'privacy' => $this->countryPage($c, 'Profile/Privacy'),
            'history' => $this->history($c),
            default => abort(404),
        };
    }

    private function evidence(array $c): Response
    {
        if (! CountryHub::isBW($c)) {
            return $this->countryPage($c, 'Profile/Evidence', ['bw' => null]);
        }
        $facts = CountryHub::register('BW_Facts');
        $all = [];
        foreach ($facts as $f) {
            $all[] = ['id' => $f['Fact ID'], 'dom' => $f['Sector name'], 't' => $f['Fact'], 'v' => $f['Value'], 'src' => $f['Source'], 'd' => $f['Date'], 'g' => $f['Grade'], 'url' => $f['URL']];
        }
        foreach (CountryHub::register('BW_Macro') as $f) {
            $all[] = ['id' => $f['Fact ID'], 'dom' => 'Macro & Economy', 't' => $f['Item'], 'v' => $f['Value'], 'src' => $f['Source'], 'd' => $f['Date'], 'g' => $f['Grade'], 'url' => $f['URL']];
        }
        $by = [];
        foreach ($facts as $f) {
            $by[$f['Sector']][] = $f;
        }
        $doms = [];
        foreach ($by as $k => $v) {
            $dates = array_map(fn ($x) => (string) $x['Date'], $v);
            sort($dates);
            $doms[] = ['k' => $k, 'n' => CountryHub::SECT[$k] ?? $k, 'f' => count($v), 'g3' => count(array_filter($v, fn ($x) => (string) $x['Grade'] === '3')), 'last' => end($dates)];
        }

        return $this->countryPage($c, 'Profile/Evidence', ['bw' => [
            'doms' => $doms, 'all' => $all,
            'sources' => CountryHub::register('BW_Sources'),
            'conflicts' => CountryHub::register('BW_Conflicts'),
            'verify' => CountryHub::register('BW_VerifyLog'),
        ], 'shelf' => CountryHub::shelf(['intelligence'], 4, 'Turn the evidence into a brief')]);
    }

    /** Sellable counts per topic (prototype: viable and PUBLISHED = available, viable otherwise = restricted). */
    private static function topicCounts(): array
    {
        $out = [];
        foreach (CountryHub::TOPICS as $k => $l) {
            $out[$k] = ['k' => $k, 'l' => $l, 'a' => 0, 'r' => 0, 'u' => 0, 'min' => null];
        }
        foreach (CountryHub::sprints() as $s) {
            $t = &$out[$s['topic']];
            if (! $s['viable']) {
                $t['u']++;
            } elseif ($s['pop'] !== 'PUBLISHED') {
                $t['r']++;
            } else {
                $t['a']++;
                if ($s['ep'] !== null && $s['ep'] > 0 && ($t['min'] === null || $s['ep'] < $t['min'])) {
                    $t['min'] = $s['ep'];
                }
            }
            unset($t);
        }

        return array_values($out);
    }

    private function availability(array $c): Response
    {
        return $this->countryPage($c, 'Profile/Availability', [
            'cats' => self::topicCounts(),
            'permits' => CountryHub::isBW($c) ? self::permits() : null,
            'shelf' => CountryHub::shelf(['market-entry', 'regulatory'], 4),
        ]);
    }

    private function catalogue(Request $request, array $c): Response|StreamedResponse
    {
        $topic = (string) $request->query('topic', '');
        if (! isset(CountryHub::TOPICS[$topic])) {
            $topic = '';
        }
        $rows = [];
        foreach (CountryHub::sprints() as $s) {
            if ($topic && $s['topic'] !== $topic) {
                continue;
            }
            $rows[] = [
                'code' => $s['code'], 'name' => $s['name'], 'cat' => CountryHub::TOPICS[$s['topic']] ?? $s['topic'], 'type' => $s['type'], 'entry' => $s['entry'],
                'price' => self::LIVE && $s['viable'] && $s['ep'] ? $s['ep'] : null,
                'avail' => ! $s['viable'] ? 'Unavailable' : ($s['pop'] !== 'PUBLISHED' ? 'Embedded' : (self::LIVE ? 'Available' : 'Price suppressed')),
            ];
        }
        $search = ['code', 'name', 'cat', 'type', 'entry', 'avail'];
        $sortKeys = ['code', 'name', 'cat', 'type', 'entry', 'price', 'avail'];
        if ($request->query('csv')) {
            return ServerTable::csv($c['iso3'].'_country_sprints', $rows, $request, $search, $sortKeys,
                ['Code' => 'code', 'Sprint' => 'name', 'Category' => 'cat', 'Type' => 'type', 'Entry tier' => 'entry', 'From (ex VAT)' => 'price', 'Availability' => 'avail']);
        }
        $cats = self::topicCounts();

        return $this->countryPage($c, 'Profile/Catalogue', [
            'topic' => $topic ?: null,
            'cats' => $cats,
            'kpi' => ['a' => array_sum(array_column($cats, 'a')), 'r' => array_sum(array_column($cats, 'r')), 'u' => array_sum(array_column($cats, 'u')), 'total' => count(CountryHub::sprints())],
            'table' => ServerTable::make($rows, $request, $search, ['cat', 'type', 'avail'], $sortKeys),
        ]);
    }

    private function resolver(array $c): Response
    {
        $bw = CountryHub::isBW($c);

        return $this->countryPage($c, 'Profile/Resolver', [
            'validator' => $bw ? CountryHub::register('BW_Validator') : null,
            'cpds' => $bw ? CountryHub::register('BW_CPDS') : null,
            'shelf' => CountryHub::shelf(['regulatory', 'risk'], 4),
        ]);
    }

    private function impact(Request $request, array $c): Response
    {
        $o = CountryHub::country((string) $request->query('with', CountryHub::isBW($c) ? 'KEN' : 'BWA')) ?? CountryHub::country('KEN');
        $spr = CountryHub::sprints();
        $svc = number_format(count(array_filter($spr, fn ($s) => $s['viable'] && $s['pop'] === 'PUBLISHED'))).' of '.number_format(count($spr));
        $row = fn (array $x) => [
            'st' => $x['state'], 'svc' => $svc, 'rcs' => $x['rcs'].'%', 'price' => 'Price Resolution Permitted', 'tax' => 'Tax treatment resolved',
            'pay' => CountryHub::isBW($x) ? 'Methods resolved (pula, crawling peg)' : '12 payment options', 'legal' => 'Clear framework',
            'data' => CountryHub::isBW($x) ? 'Data Protection Act [REFERENCE]' : 'POPIA compliant', 'dep' => 'Production',
        ];
        $bc = self::BENCHCOL[$c['iso3']] ?? null;
        $bo = self::BENCHCOL[$o['iso3']] ?? null;

        return $this->countryPage($c, 'Profile/Impact', [
            'o' => $o, 'a' => $row($c), 'b' => $row($o), 'oLive' => self::LIVE,
            'bench' => $bc && $bo ? array_map(fn ($r) => [$r['Metric'], $r[$bc], $r[$bo]], CountryHub::register('BW_Benchmark')) : null,
        ]);
    }

    private function limitations(array $c): Response
    {
        if (! CountryHub::isBW($c)) {
            return $this->countryPage($c, 'Profile/Limitations', ['bw' => null]);
        }

        return $this->countryPage($c, 'Profile/Limitations', ['bw' => [
            'gaps' => CountryHub::register('BW_DataGaps'),
            'closed' => CountryHub::register('BW_ClosedGaps'),
            'conflicts' => CountryHub::register('BW_Conflicts'),
        ]]);
    }

    private function tax(array $c): Response
    {
        $bw = null;
        if (CountryHub::isBW($c)) {
            $bw = ['f18' => self::macro('BW-MAC-F18'), 'fiscal' => array_map(fn ($id) => self::macro($id), ['BW-MAC-F13', 'BW-MAC-F14', 'BW-MAC-F15', 'BW-MAC-F25'])];
        }

        return $this->countryPage($c, 'Profile/Tax', ['bw' => $bw, 'shelf' => CountryHub::shelf(['tax'], 4)]);
    }

    private function payments(array $c): Response
    {
        $bw = null;
        if (CountryHub::isBW($c)) {
            $bw = [
                'f11' => self::macro('BW-MAC-F11'), 'f12' => self::macro('BW-MAC-F12'), 'f19' => self::macro('BW-MAC-F19'),
                'fx' => CountryHub::register('BW_FX'),
                'ict' => array_values(array_filter(CountryHub::register('BW_Facts'), fn ($f) => in_array($f['Sector'], ['ICT', 'FIN'], true))),
            ];
        }

        return $this->countryPage($c, 'Profile/Payments', ['bw' => $bw, 'shelf' => CountryHub::shelf(['payments', 'investment'], 4)]);
    }

    private function language(array $c): Response
    {
        return $this->countryPage($c, 'Profile/Language', [
            'products' => CountryHub::isBW($c) ? CountryHub::register('BW_Products') : null,
            'shelf' => CountryHub::shelf(['localisation', 'market-entry'], 4),
        ]);
    }

    private function partners(array $c): Response
    {
        $bw = CountryHub::isBW($c);

        return $this->countryPage($c, 'Profile/Partners', [
            'institutions' => $bw ? CountryHub::register('BW_Institutions') : null,
            'permits' => $bw ? self::permits() : null,
            'shelf' => CountryHub::shelf(['regulatory'], 4),
        ]);
    }

    private function legal(array $c): Response
    {
        $bw = null;
        if (CountryHub::isBW($c)) {
            $bw = [
                'rules' => array_map(fn ($id) => self::macro($id), ['BW-MAC-F20', 'BW-MAC-F21', 'BW-MAC-F22', 'BW-MAC-F23']),
                'changes' => CountryHub::register('BW_RegChange'),
                'policy' => CountryHub::register('BW_Policy'),
                'permits' => self::permits(),
            ];
        }

        return $this->countryPage($c, 'Profile/Legal', ['bw' => $bw, 'shelf' => CountryHub::shelf(['regulatory'], 4)]);
    }

    private function history(array $c): Response
    {
        if (! CountryHub::isBW($c)) {
            return $this->countryPage($c, 'Profile/History', ['bw' => null]);
        }

        return $this->countryPage($c, 'Profile/History', ['bw' => [
            'editions' => CountryHub::register('BW_EditionLog'),
            'challenge' => CountryHub::register('BW_Challenge'),
            'changes' => CountryHub::register('BW_RegChange'),
            'verify' => CountryHub::register('BW_VerifyLog'),
        ]]);
    }

    /* ------------------------------------------------------------------ helpers (top of pages-profile.js) */

    /** One BW_Macro row by fact ID (prototype macro()). */
    public static function macro(string $id): array
    {
        foreach (CountryHub::register('BW_Macro') as $r) {
            if ($r['Fact ID'] === $id) {
                return $r;
            }
        }

        return [];
    }

    /** AIIM benchmark rows [metric, value] for one of the eight benchmark countries, else null (prototype bench()). */
    public static function bench(array $c): ?array
    {
        $col = self::BENCHCOL[$c['iso3']] ?? null;

        return $col ? array_map(fn ($r) => [$r['Metric'], $r[$col]], CountryHub::register('BW_Benchmark')) : null;
    }

    /** BW_Permits with the sector name (prototype SECT[x.Sector]). */
    private static function permits(): array
    {
        return array_map(fn ($r) => $r + ['SectorName' => CountryHub::SECT[$r['Sector']] ?? $r['Sector']], CountryHub::register('BW_Permits'));
    }
}
