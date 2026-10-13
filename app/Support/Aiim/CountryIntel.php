<?php

namespace App\Support\Aiim;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Country;
use App\Models\Aiim\CountryPack;
use App\Models\Aiim\MapFeature;
use App\Models\Aiim\MapLayer;
use App\Models\Aiim\OpportunityTemplate;
use App\Models\Aiim\Project;
use App\Models\Aiim\QuestionChain;
use Illuminate\Support\Collection;

/**
 * Country map explorer payload for any of the 54 countries: admin-unit hierarchy,
 * multi-layer map, screened projects, opportunities, sector heat map inputs,
 * investor and trader questions and the country pack. Everything is built from
 * loaded records; a country without records gets empty lists, never filler.
 */
class CountryIntel
{
    public static function for(Country $country): array
    {
        $iso = $country->iso2;
        $pack = CountryPack::query()->where('country_iso2', $iso)->first();
        $units = AdminUnit::query()->where('country_iso2', $iso)->orderBy('level')->orderBy('sort')->orderBy('name')->get();
        $projects = Project::query()->where('country_iso2', $iso)->whereNotNull('screening_status')
            ->orderByRaw("case screening_status when 'QUALIFIED' then 0 when 'WATCHLIST' then 1 else 2 end")->orderByDesc('capex_zar')->get();
        $templates = OpportunityTemplate::query()->where('country_iso2', $iso)->orderBy('sector_code')->orderBy('code')->get();
        $features = MapFeature::query()->where('country_iso2', $iso)->get();
        $provinceProjects = Project::query()->where('country_iso2', $iso)->whereNull('screening_status')->count();

        $unitProjects = self::rollUp($units, $projects->pluck('admin_unit_id'));
        $unitOpps = self::rollUp($units, $templates->pluck('admin_unit_id'));

        return [
            'coverage' => [
                'units' => $units->count(),
                'levels' => $units->groupBy('level_key')->map->count(),
                'projects' => $projects->whereIn('screening_status', ['QUALIFIED', 'WATCHLIST'])->count(),
                'screened' => $projects->count(),
                'provinceProjects' => $provinceProjects,
                'opportunities' => $templates->count(),
                'features' => $features->count(),
                'africaTemplates' => OpportunityTemplate::query()->whereNull('country_iso2')->count(),
                'hasPack' => (bool) $pack,
            ],
            'units' => $units->map(fn (AdminUnit $u) => [
                'id' => $u->id,
                'parentId' => $u->parent_id,
                'level' => $u->level,
                'levelKey' => $u->level_key,
                'kind' => $u->kind,
                'name' => $u->name,
                'labels' => $u->labels ?? (object) [],
                'slug' => $u->slug,
                'population' => $u->population,
                'populationSource' => $u->population_source,
                'lat' => $u->latitude,
                'lon' => $u->longitude,
                'placeholder' => $u->placeholder,
                'source' => $u->source,
                'provinceSlug' => $u->meta['provinceSlug'] ?? null,
                'tags' => $u->meta['tags'] ?? null,
                'projects' => $unitProjects[$u->id] ?? 0,
                'opportunities' => $unitOpps[$u->id] ?? 0,
            ])->values(),
            'map' => [
                'outline' => $country->outline ?? [],
                'areas' => self::areas($pack, $units),
                'lines' => [
                    'roads' => $pack?->geo['roads'] ?? [],
                    'rail' => $pack?->geo['rail'] ?? [],
                    'rivers' => $pack?->geo['rivers'] ?? [],
                ],
                'features' => $features->filter(fn ($f) => $f->latitude !== null)->map(fn (MapFeature $f) => [
                    'id' => "{$f->layer_key}-{$f->id}",
                    'layer' => $f->layer_key,
                    'name' => $f->name,
                    'labels' => $f->labels ?? (object) [],
                    'lat' => $f->latitude,
                    'lon' => $f->longitude,
                    'placeholder' => $f->placeholder,
                    'status' => $f->status,
                    'sectorCode' => $f->sector_code,
                    'unitId' => $f->admin_unit_id,
                    'note' => $f->meta['note'] ?? ($f->meta['institution'] ?? null) ?? null,
                    'place' => $f->meta['place'] ?? null,
                    'source' => $f->source,
                ])->values(),
                'layers' => self::layers($iso, $projects, $templates, $features, $units, $pack),
                'depths' => MapLayers::DEPTHS,
                'labelLanguages' => $units->contains(fn ($u) => ! empty($u->labels['tn'])) ? ['en', 'tn'] : ['en'],
            ],
            'projects' => $projects->map(fn (Project $p) => ProjectBriefs::present($p))->values(),
            'hurdles' => ProjectBriefs::HURDLES,
            'fxZarPerUsd' => ProjectBriefs::ZAR_PER_USD,
            // Null fields are dropped to keep large registers (Botswana: 610 rows) light.
            'opportunities' => $templates->map(fn (OpportunityTemplate $t) => array_filter([
                'code' => $t->code,
                'kind' => $t->kind,
                'sectorCode' => $t->sector_code,
                'title' => $t->title,
                'asset' => $t->asset,
                'trigger' => $t->trigger,
                'placement' => $t->placement,
                'model' => $t->model,
                'band' => $t->band,
                'tier' => $t->tier,
                'score' => $t->score,
                'persona' => $t->persona,
                'citizenReserved' => $t->citizen_reserved,
                'fxEarner' => $t->fx_earner,
                'timeToRevenue' => $t->time_to_revenue,
                'place' => $t->place,
                'unitId' => $t->admin_unit_id,
                'lat' => $t->latitude,
                'lon' => $t->longitude,
                'status' => $t->status,
            ], fn ($v) => $v !== null))->values(),
            'sectorCodes' => SectorCodes::all(),
            'questions' => self::questions($iso),
            'pack' => $pack ? [
                'code' => $pack->code,
                'title' => $pack->title,
                'issued' => $pack->issued_on?->format('j M Y'),
                'summary' => $pack->summary ?? [],
                'macro' => $pack->macro ?? [],
                'products' => $pack->products ?? [],
                'institutions' => $pack->institutions ?? [],
                'oneStopShop' => $pack->one_stop_shop ?? [],
                'sectors' => $pack->sectors ?? [],
                'top' => $pack->top_opportunities ?? [],
                'benchmark' => $pack->benchmark ?? [],
                'rollout' => $pack->rollout ?? [],
                'fxNote' => $pack->fx_note,
                'source' => $pack->source,
            ] : null,
        ];
    }

    /** Counts per unit including every descendant. */
    private static function rollUp(Collection $units, Collection $ids): array
    {
        $parent = $units->pluck('parent_id', 'id');
        $out = [];
        foreach ($ids->filter() as $id) {
            $guard = 0;
            while ($id && $guard++ < 8) {
                $out[$id] = ($out[$id] ?? 0) + 1;
                $id = $parent[$id] ?? null;
            }
        }

        return $out;
    }

    private static function areas(?CountryPack $pack, Collection $units): array
    {
        $byCode = $units->where('level', 1)->whereNotNull('code')->keyBy('code');

        return collect($pack?->geo['areas'] ?? [])->map(fn ($a) => [
            'code' => $a['code'],
            'name' => $a['name'],
            'unitId' => $byCode[$a['code']]->id ?? null,
            'geometry' => $a['geometry'],
        ])->values()->all();
    }

    private static function layers(string $iso, Collection $projects, Collection $templates, Collection $features, Collection $units, ?CountryPack $pack): array
    {
        $counts = [
            'projects' => $projects->whereNotNull('latitude')->count(),
            'opportunities' => $templates->whereNotNull('latitude')->count(),
            'admin-units' => count($pack?->geo['areas'] ?? []) ?: $units->where('level', '<', 5)->whereNotNull('latitude')->count(),
            'places' => $units->where('level', 5)->whereNotNull('latitude')->count(),
            'roads' => count($pack?->geo['roads'] ?? []),
            'rail' => count($pack?->geo['rail'] ?? []),
            'rivers' => count($pack?->geo['rivers'] ?? []),
        ] + $features->groupBy('layer_key')->map->count()->all();

        $sectorCounts = $projects->groupBy(fn ($p) => $p->screening['sectorCode'] ?? '')->map->count()->all();
        $oppSector = $templates->groupBy('sector_code')->map->count()->all();
        $featSector = $features->groupBy('sector_code')->map->count()->all();

        $all = MapLayer::query()->orderBy('sort')->get();

        return [
            'core' => $all->where('family', 'core')->map(fn (MapLayer $l) => [
                'key' => $l->key,
                'label' => $l->label,
                'labels' => $l->labels ?? (object) [],
                'geometry' => $l->geometry,
                'levels' => $l->levels,
                'color' => $l->color,
                'count' => $counts[$l->key] ?? 0,
            ])->values(),
            'sectors' => $all->where('family', 'sector')->groupBy('sector_code')->map(fn ($rows, $code) => [
                'code' => $code,
                'name' => SectorCodes::name($code),
                'color' => SectorCodes::color($code),
                'icon' => SectorCodes::icon($code),
                'records' => ($sectorCounts[$code] ?? 0) + ($oppSector[$code] ?? 0) + ($featSector[$code] ?? 0),
                'layers' => $rows->map(fn (MapLayer $l) => [
                    'key' => $l->key,
                    'label' => $l->label,
                    'labels' => $l->labels ?? (object) [],
                    'asset' => $l->asset_type,
                    'geometry' => $l->geometry,
                    'levels' => $l->levels,
                    'security' => $l->security_class,
                ])->values(),
            ])->values(),
        ];
    }

    private static function questions(string $iso): array
    {
        $rows = QuestionChain::query()->where(fn ($q) => $q->whereNull('country_iso2')->orWhere('country_iso2', $iso))->orderBy('position')->get();
        $shape = fn (QuestionChain $q) => [
            'code' => $q->code,
            'position' => $q->position,
            'question' => $q->question,
            'info' => $q->info_types,
            'tag' => $q->tag,
            'map' => $q->map_behaviour,
            'anchor' => $q->anchor,
            'institution' => $q->institution,
            'evidence' => $q->evidence,
        ];
        $generic = $rows->whereNull('sector_code');
        $sector = $rows->whereNotNull('sector_code');

        return [
            'investor' => $generic->where('chain', 'investor')->map($shape)->values(),
            'trader' => $generic->where('chain', 'trader')->map($shape)->values(),
            'sectors' => $sector->groupBy('sector_code')->map(fn ($r) => [
                'country' => [
                    'investor' => $r->where('country_iso2', $iso)->where('chain', 'investor')->map($shape)->values(),
                    'trader' => $r->where('country_iso2', $iso)->where('chain', 'trader')->map($shape)->values(),
                ],
                'model' => [
                    'investor' => $r->whereNull('country_iso2')->where('chain', 'investor')->map($shape)->values(),
                    'trader' => $r->whereNull('country_iso2')->where('chain', 'trader')->map($shape)->values(),
                ],
            ]),
        ];
    }
}
