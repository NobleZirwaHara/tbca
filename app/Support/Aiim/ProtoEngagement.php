<?php

namespace App\Support\Aiim;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Country;
use App\Models\Aiim\Engagement;
use App\Models\Order;
use App\Models\User;
use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;

/**
 * Data for the engagement and mandate pages of the client's "TBCA AIIM Botswana"
 * prototype (mock-ups 39 to 70): embedded services priced from the app's Sprint
 * records, the Botswana BW-1.0 registers those pages read, and the engagement's
 * country. Prices come only from the app; a service the app does not price shows
 * as not in the catalogue yet.
 */
class ProtoEngagement
{
    /** The prototype's 18 Botswana sectors (code => name). */
    public const SECTORS = [
        'ENR' => 'Energy & Power', 'OGS' => 'Fuels, Strategic Reserves & Coal-bed Methane', 'MIN' => 'Diamonds, Copper & Mining',
        'AGR' => 'Livestock, Beef & Horticulture', 'BLU' => 'Fisheries & Aquaculture', 'FOR' => 'Forestry & Veld Products',
        'MFG' => 'Manufacturing, SEZs & Beneficiation', 'WSW' => 'Water, Sanitation & Waste', 'TRN' => 'Transport, Corridors & Logistics',
        'ICT' => 'Digital, Mobile Money & 5G', 'CRE' => 'Construction, Roads & Housing', 'TOU' => 'Tourism (Okavango, Chobe, Kalahari)',
        'HLT' => 'Health & Pharmaceuticals', 'EDU' => 'Education & Skills', 'FIN' => 'Finance, Pensions & Fintech',
        'TRD' => 'Trade, Retail & Citizen Markets', 'GRN' => 'Green Economy & Climate Finance', 'CSP' => 'Creative, Sport & Professional Services',
    ];

    /** Formal quotation lines of the prototype (page 45). */
    public const QLINES = ['AAB-EMB-205', 'AAB-EMB-210', 'AAB-EMB-211', 'AAB-EMB-171', 'AAB-EMB-197'];

    public const TICKETS = ['S (US$0.2–1 m)', 'M (US$1–5 m)', 'L (US$5–50 m)', 'XL (> US$50 m)'];

    public const DESKS = ['Country lead — Botswana', 'Mining & energy', 'Agriculture & food', 'Logistics & corridors', 'Finance & capital raising', 'Government & DFI desk'];

    public const CHANNELS = ['Video call', 'WhatsApp', 'Phone', 'In person (Gaborone)'];

    /* ------------------------------------------------------------ services */

    /** The 581 embedded services keyed by code. */
    public static function services(): array
    {
        return once(fn () => collect(CountryHub::meta('aiim_services') ?? [])->keyBy('code')->all());
    }

    /** One embedded service with its app price (entry tier, ZAR excl. VAT) or null when the app does not sell it. */
    public static function svc(string $code): ?array
    {
        $s = self::services()[$code] ?? null;
        $sp = IndustryData::sprint($code);
        if (! $s && ! $sp) {
            return null;
        }
        $price = $sp && ($sp['ep'] ?? 0) > 0 ? (int) $sp['ep'] : null;

        return [
            'code' => $code,
            'name' => $s['name'] ?? $sp['name'],
            'cat' => $s['cat'] ?? null,
            'delivery' => $s['db'] ?? null,
            'tier' => $price ? $sp['entry'] : ($s['et'] ?? null),
            'aai' => isset($s['a0']) ? (int) round($s['a0'] * 100) : null,
            'price' => $price,
        ];
    }

    /** A rail of embedded services, as the prototype's svcRail(). */
    public static function rail(array $codes, string $title = 'Embedded services on this page', int $max = 6): array
    {
        return ['title' => $title, 'items' => collect($codes)->map(fn ($c) => self::svc($c))->filter()->take($max)->values()->all()];
    }

    /** All embedded services of one category (Due Diligence, Virtual Deal Room, Project Advisory). */
    public static function category(string $cat): array
    {
        return collect(self::services())->where('cat', $cat)->keys()->map(fn ($c) => self::svc($c))->filter()->values()->all();
    }

    /** Codes of services the user has paid for (to mark checklist items done). */
    public static function paidCodes(User $user, array $codes): array
    {
        return Order::query()->where('user_id', $user->id)->where('status', 'paid')
            ->join('order_items', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('order_items.item_code', $codes)->distinct()->pluck('order_items.item_code')->all();
    }

    /* ------------------------------------------------------------- country */

    /** The engagement's country: the request's country, else South Africa for legacy province-based requests. */
    public static function country(Engagement $e): ?array
    {
        $req = $e->request ?? [];
        $slug = $req['countries'][0] ?? null;
        $c = $slug ? Country::query()->where('slug', $slug)->first() : null;
        if (! $c && ! empty($req['country'])) {
            $c = Country::query()->where('name', $req['country'])->first();
        }
        if (! $c && ! empty($req['provinces'])) {
            $c = Country::query()->where('slug', 'south-africa')->first();
        }

        return $c ? self::countryRow($c) : null;
    }

    public static function countryBySlug(?string $slug): ?array
    {
        $c = $slug ? Country::query()->where('slug', $slug)->first() : null;

        return $c ? self::countryRow($c) : null;
    }

    private static function countryRow(Country $c): array
    {
        return ['slug' => $c->slug, 'name' => $c->name, 'iso2' => $c->iso2, 'isBw' => $c->iso2 === 'BW', 'pack' => $c->pack_status];
    }

    /** Sector options for a country: the Botswana pack's names for Botswana, the AIIM codes elsewhere. */
    public static function sectors(?array $country): array
    {
        $names = $country && $country['isBw'] ? self::SECTORS : collect(SectorCodes::CODES)->map(fn ($s) => $s[0])->all();

        return collect($names)->map(fn ($n, $c) => ['code' => $c, 'name' => $n])->values()->all();
    }

    public static function sectorName(?string $code, ?array $country = null): ?string
    {
        if (! $code) {
            return null;
        }

        return ($country === null || $country['isBw']) && isset(self::SECTORS[$code]) ? self::SECTORS[$code] : (SectorCodes::name($code) ?? $code);
    }

    /** First-level units of a country (16 districts and councils for Botswana). */
    public static function units(?array $country): array
    {
        if (! $country) {
            return [];
        }
        if ($country['isBw']) {
            return collect(CountryHub::register('BW_Units'))->map(fn ($u) => ['code' => $u['Code'], 'name' => $u['Unit']])->values()->all();
        }

        return AdminUnit::query()->where('country_iso2', $country['iso2'])->where('level', 1)->orderBy('name')->get(['code', 'name'])
            ->map(fn ($u) => ['code' => (string) ($u->code ?? $u->name), 'name' => $u->name])->values()->all();
    }

    /* ------------------------------------------------------ BW-1.0 registers */

    public static function reg(string $name): array
    {
        return CountryHub::register($name);
    }

    /** Facts, templates and ranked leads the BW-1.0 pack holds for a sector (custom request triage). */
    public static function coverage(?string $sector): array
    {
        $f = fn ($rows) => collect($rows)->filter(fn ($r) => ! $sector || ($r['Sector'] ?? null) === $sector)->count();

        return [
            'facts' => $f(self::reg('BW_Facts')),
            'templates' => $f(self::reg('BW_Sweep')),
            'leads' => $f(self::reg('BW_Ranked_Leads')),
        ];
    }

    /** The 42 evidence hotspots with their place, nearest gateway and hotspot leads. */
    public static function hotspots(): array
    {
        return once(function () {
            $towns = collect(self::reg('BW_Towns'))->keyBy('ID');
            $leads = collect(self::reg('BW_Hotspot_Leads'))->groupBy('Hotspot');

            return collect(self::reg('BW_Hotspots'))->values()->map(function ($h, $i) use ($towns, $leads) {
                $t = $towns[$h['Place ID']] ?? null;

                return [
                    'i' => $i, 'name' => $h['Hotspot'], 'place' => $h['Place'], 'placeId' => $h['Place ID'], 'unit' => $h['Unit code'],
                    'fact' => $h['Fact'], 'status' => $h['Status'], 'match' => $h['Match'],
                    'gateway' => $t['Nearest gateway'] ?? null, 'gatewayKm' => $t['Gateway km'] ?? null,
                    'leads' => collect($leads[$h['Hotspot']] ?? [])->map(fn ($l) => [
                        'id' => $l['Lead ID'], 'opportunity' => $l['Opportunity'], 'template' => $l['Template'], 'due' => $l['Due'],
                        'tier' => $l['Tier'], 'score' => $l['Lead score'], 'next' => $l['Next action'], 'institution' => $l['Institution to call'],
                    ])->values()->all(),
                ];
            })->all();
        });
    }

    /** Per-sector figures for the deep dive (page 54): KPIs and the investor chain answered. */
    public static function deepDive(): array
    {
        $sweep = collect(self::reg('BW_Sweep'));
        $facts = collect(self::reg('BW_Facts'));
        $shocks = collect(self::reg('BW_Shocks'))->keyBy('Sector');
        $chains = collect(self::reg('BW_Chains'))->where('Chain', 'Investor');

        return collect(self::SECTORS)->map(function ($name, $code) use ($sweep, $facts, $shocks, $chains) {
            $t = $sweep->where('Sector', $code);

            return [
                'code' => $code, 'name' => $name, 'slug' => SectorCodes::slug($code),
                'templates' => $t->count(),
                'tierA' => $t->filter(fn ($o) => str_starts_with((string) $o['Tier'], 'A'))->count(),
                'facts' => $facts->where('Sector', $code)->count(),
                'shock' => $shocks[$code]['Index'] ?? null,
                'chain' => $chains->where('Sector', $code)->map(fn ($r) => [
                    'n' => $r['#'], 'question' => $r['Question'], 'types' => $r['Information types'], 'map' => $r['Map behaviour'],
                    'evidence' => $r['Evidence'], 'institution' => $r['Institution/role'],
                ])->values()->all(),
            ];
        })->values()->all();
    }

    /** The custom intelligence report sections built from BW-1.0 for one sector (page 49). */
    public static function report(string $sector, ?string $unit = null): array
    {
        $permit = collect(self::reg('BW_Permits'))->firstWhere('Sector', $sector);
        $leads = collect(self::reg('BW_Ranked_Leads'))->where('Sector', $sector);
        if ($unit) {
            $leads = $leads->where('Unit code', $unit);
        }

        return [
            'sector' => $sector, 'sectorName' => self::sectorName($sector),
            'facts' => collect(self::reg('BW_Facts'))->where('Sector', $sector)->map(fn ($f) => [
                'id' => $f['Fact ID'], 'fact' => $f['Fact'], 'value' => $f['Value'], 'date' => $f['Date'], 'grade' => $f['Grade'],
            ])->values()->all(),
            'templates' => collect(self::reg('BW_Sweep'))->where('Sector', $sector)->map(fn ($o) => [
                'id' => $o['Opp ID'], 'opportunity' => $o['Opportunity'], 'band' => $o['Band'], 'score' => $o['Score'], 'ra' => $o['RA'], 'tier' => $o['Tier'],
                'downturn' => $o['Downturn tier'], 'citizen' => $o['Citizen-reserved'], 'fx' => $o['FX earner'], 'persona' => $o['Persona'],
                'ttr' => $o['Time to revenue'], 'evidence' => $o['Evidence'],
            ])->values()->all(),
            'leads' => $leads->sortByDesc(fn ($l) => (float) $l['Lead score'])->take(300)->map(fn ($l) => [
                'id' => $l['Lead ID'], 'template' => $l['Template'], 'opportunity' => $l['Opportunity'], 'place' => $l['Place'], 'placeId' => $l['Place ID'],
                'unit' => $l['Unit'], 'score' => $l['Lead score'], 'tier' => $l['Tier'], 'persona' => $l['Persona'],
            ])->values()->all(),
            'permits' => $permit ? ['permits' => $permit['Permits'], 'issuer' => $permit['Issuer'], 'time' => $permit['Typical time'] ?? null] : null,
        ];
    }
}
