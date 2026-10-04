<?php

namespace App\Support\Countries;

use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use Illuminate\Support\Collection;

/**
 * Part 10 / Appendix P — directional corridor resolution.
 *
 * CT-LAW-08: pair sellability cannot exceed either endpoint (the weaker endpoint
 * sets the ceiling) and must also pass pair-specific / crossing controls. The 12 x 12
 * matrix is a ceiling only: a non-blocked cell never makes a corridor sellable.
 */
class CorridorResolver
{
    /** Permitted ceiling states, strongest first. Any other state blocks the pair. */
    public const LADDER = [
        AvailabilityState::ACTIVE,
        AvailabilityState::ACTIVE_LIMITED,
        AvailabilityState::QUOTE_ONLY,
        AvailabilityState::PARTNER_ROUTED,
        AvailabilityState::INTELLIGENCE_ONLY,
        AvailabilityState::CORRIDOR_ONLY,
        AvailabilityState::SOVEREIGN_ONLY,
    ];

    /** Non-African endpoints are not TBCA country objects; their resolver-ready state carries a quote-only ceiling. */
    public const EXTERNAL_CEILING = AvailabilityState::QUOTE_ONLY;

    public const AFRICAN_COUNTRIES = 54;

    public static function rawDirectionalTopology(): int
    {
        return self::AFRICAN_COUNTRIES * (self::AFRICAN_COUNTRIES - 1);
    }

    public static function ceiling(string $origin, string $destination): string
    {
        $a = array_search($origin, self::LADDER, true);
        $b = array_search($destination, self::LADDER, true);
        if ($a === false || $b === false) {
            return 'BLOCKED';
        }

        return self::LADDER[max($a, $b)];
    }

    /** The full 12 x 12 matrix (used by the pair console and tests). */
    public static function matrix(): array
    {
        $rows = [];
        foreach (AvailabilityState::ALL as $o) {
            foreach (AvailabilityState::ALL as $d) {
                $rows[$o][$d] = self::ceiling($o, $d);
            }
        }

        return $rows;
    }

    /**
     * @param  Collection<string, Country>|null  $countries  keyed by iso2
     */
    public static function resolve(Corridor $corridor, ?Collection $countries = null): array
    {
        $countries ??= Country::query()->whereIn('iso2', [$corridor->from_iso, $corridor->to_iso])->get()->keyBy('iso2');

        $from = self::endpoint($corridor->from_iso, $corridor->from_name, $corridor->to_endpoint_state, $countries);
        $to = self::endpoint($corridor->to_iso, $corridor->to_name, $corridor->to_endpoint_state, $countries);
        $ceiling = self::ceiling($from['ceiling_state'], $to['ceiling_state']);

        $reasons = [];
        if ($ceiling === 'BLOCKED') {
            $weaker = $from['ceiling_state'] === $to['ceiling_state'] || ! in_array($from['ceiling_state'], self::LADDER, true) ? $from : $to;
            $reasons[] = "Endpoint ceiling BLOCKED: {$weaker['name']} is {$weaker['label']} (weaker endpoint governs).";
        }
        if (! $corridor->pair_certified) {
            $reasons[] = 'Pair-specific crossing evidence and release gate not yet certified.';
        }
        if ($corridor->pair_rcs < 100) {
            $reasons[] = "Pair Resolver Completeness {$corridor->pair_rcs}% — 100% required.";
        }

        $sellable = $ceiling !== 'BLOCKED' && $corridor->pair_certified && $corridor->pair_rcs >= 100;

        return [
            'from' => $from,
            'to' => $to,
            'ceiling' => $ceiling,
            'ceiling_label' => $ceiling === 'BLOCKED' ? 'Blocked' : AvailabilityState::label($ceiling),
            'sellable' => $sellable,
            'pair_permission' => $sellable ? 'RESOLVED & SELLABLE' : ($ceiling === 'BLOCKED' ? 'BLOCKED BY ENDPOINT' : 'NOT YET SELLABLE'),
            'reasons' => $reasons,
        ];
    }

    private static function endpoint(string $iso, string $name, ?string $externalState, Collection $countries): array
    {
        $country = $countries->get($iso);
        if ($country) {
            return [
                'iso' => $iso,
                'name' => $country->name,
                'slug' => $country->slug,
                'african' => true,
                'state' => $country->availability_state,
                'ceiling_state' => $country->availability_state,
                'label' => AvailabilityState::label($country->availability_state),
            ];
        }

        return [
            'iso' => $iso,
            'name' => $name,
            'slug' => null,
            'african' => false,
            'state' => $externalState ?? 'RESOLVER-READY',
            'ceiling_state' => self::EXTERNAL_CEILING,
            'label' => 'Resolver-Ready (external endpoint)',
        ];
    }

    public static function sellableCount(): int
    {
        $countries = Country::all()->keyBy('iso2');

        return Corridor::all()->filter(fn ($c) => self::resolve($c, $countries)['sellable'])->count();
    }
}
