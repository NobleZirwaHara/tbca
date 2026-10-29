<?php

namespace App\Support\Industries;

/**
 * Props shared by the Industries pages: the industry, the visitor's IndustryContext (industry,
 * sub-industry, country with the modelled score and rank) and the option lists for switchers.
 */
class IndustryView
{
    /** Resolved context objects (prototype ctxObj). */
    public static function ctx(): array
    {
        $x = IndustryState::context();
        $ind = IndustryData::industry($x['ind'] ?? 'AGR') ?? IndustryData::industries()['AGR'];
        $c = IndustryData::country($x['iso'] ?? 'BWA') ?? IndustryData::country('BWA');

        return ['ind' => $ind, 'sub' => IndustryData::sub($ind, $x['sub'] ?? null), 'c' => $c];
    }

    /** Industry payload for the page (everything the prototype's industry object carries). */
    public static function industry(array $ind): array
    {
        return array_merge($ind, ['cxName' => IndustryData::cxName($ind['cx'])]);
    }

    public static function base(?array $ind = null): array
    {
        $ctx = self::ctx();
        $ind ??= $ctx['ind'];
        $c = $ctx['c'];
        $sub = $ctx['sub'] && collect($ind['subs'])->contains('code', $ctx['sub']['code']) ? $ctx['sub'] : null;
        $s = IndustryData::score($ind, $c['iso3']);

        return [
            'ind' => self::industry($ind),
            'ctx' => ['sub' => $sub, 'country' => $c, 'score' => $s['s'], 'rank' => IndustryData::rank($ind, $c['iso3'])],
            'industries' => IndustryData::industryOptions(),
            'countries' => IndustryData::countryOptions(),
            'engagement' => self::engagementBar(),
        ];
    }

    /** Compact engagement summary for the engagement bar (prototype engBar). */
    public static function engagementBar(): ?array
    {
        $e = Journey::normalise(Journey::get());
        if (! $e) {
            return null;
        }
        $ind = IndustryData::industry($e['ind']);
        $c = IndustryData::country($e['iso']);

        return ['ref' => $e['ref'], 'industry' => $ind['name'] ?? $e['ind'], 'country' => $c['name'] ?? $e['iso'], 'iso2' => $c['iso2'] ?? '', 'sprint' => $e['name'], 'tier' => $e['tier'], 'gates' => count($e['gates']), 'aborted' => (bool) $e['aborted']];
    }
}
