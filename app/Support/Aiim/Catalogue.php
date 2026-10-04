<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\Corridor;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Models\Aiim\Source;
use Illuminate\Database\Eloquent\Model;

/**
 * Presents catalogue records to the frontend and resolves the polymorphic
 * (type, key) pairs used by saved items, watchlists, comparisons and fee manifests.
 */
class Catalogue
{
    public const TYPES = ['opportunity', 'project', 'investor', 'funder', 'corridor', 'report', 'source', 'sector'];

    public static function zarShort(int|float $zar): string
    {
        return match (true) {
            $zar >= 1_000_000_000 => 'R'.rtrim(rtrim(number_format($zar / 1_000_000_000, 1), '0'), '.').'B',
            $zar >= 1_000_000 => 'R'.rtrim(rtrim(number_format($zar / 1_000_000, 1), '0'), '.').'M',
            $zar >= 1_000 => 'R'.rtrim(rtrim(number_format($zar / 1_000, 1), '0'), '.').'K',
            default => 'R'.number_format($zar),
        };
    }

    public static function size(int|float $min, int|float $max): string
    {
        return $min == $max ? self::zarShort($max) : self::zarShort($min).' – '.self::zarShort($max);
    }

    public static function sizeBand(int|float $max): string
    {
        return match (true) {
            $max >= 400_000_000 => 'Large',
            $max >= 150_000_000 => 'Medium',
            default => 'Small-Medium',
        };
    }

    public static function project(Project $p, bool $full = false): array
    {
        $d = $p->details ?? [];
        $base = [
            'code' => $p->code,
            'slug' => $p->slug,
            'name' => $p->name,
            'kind' => $p->kind,
            'summary' => $p->summary,
            'province' => $p->province_slug,
            'provinceName' => Province::query()->where('slug', $p->province_slug)->value('name') ?? ucfirst($p->province_slug),
            'sector' => $p->sector_slug,
            'sectorName' => Sector::query()->where('slug', $p->sector_slug)->value('name') ?? $p->sector_slug,
            'location' => $p->location,
            'type' => $p->type,
            'stage' => $p->stage,
            'size' => self::size($p->size_min_zar, $p->size_max_zar),
            'sizeBand' => self::sizeBand($p->size_max_zar),
            'sizeMax' => (int) $p->size_max_zar,
            'score' => (float) $p->score,
            'level' => $p->opportunity_level,
            'icon' => $p->icon,
            'added' => $p->added_on?->format('j M Y'),
            'tags' => $d['tags'] ?? [],
            'evidence' => Grades::evidence($p->confidence, $p->verification, Source::query()->where('code', $p->source_code)->value('name') ?? ($d['source'] ?? null), $p->updated_at?->format('j M Y'), $p->next_review_on?->format('j M Y')),
            'hasPremium' => ! empty($p->premium),
        ];

        if ($full) {
            $base['details'] = $d;
            $base['premium'] = $p->premium;
            $base['sourceCode'] = $p->source_code;
        }

        return $base;
    }

    public static function organisation(Organisation $o, bool $full = false): array
    {
        $base = [
            'slug' => $o->slug,
            'kind' => $o->kind,
            'name' => $o->name,
            'shortName' => $o->short_name ?? $o->name,
            'type' => $o->type,
            'summary' => $o->summary,
            'focus' => $o->focus ?? [],
            'stages' => $o->stages ?? [],
            'instruments' => $o->instruments ?? [],
            'beneficiaries' => $o->beneficiaries,
            'ticket' => self::zarShort($o->ticket_min_zar).' – '.self::zarShort($o->ticket_max_zar).($o->profile['ticket_plus'] ?? false ? '+' : ''),
            'ticketMin' => (int) $o->ticket_min_zar,
            'location' => $o->location,
            'origin' => $o->origin,
            'score' => (float) $o->match_score,
            'added' => $o->added_on?->format('j M Y'),
            'evidence' => Grades::evidence($o->confidence, $o->verification, $o->profile['source'] ?? null, $o->updated_at?->format('j M Y'), null),
        ];
        if ($full) {
            $base['profile'] = $o->profile ?? [];
        }

        return $base;
    }

    public static function corridor(Corridor $c, bool $full = false): array
    {
        $base = [
            'slug' => $c->slug,
            'name' => $c->name,
            'type' => $c->type,
            'countries' => $c->countries,
            'route' => $c->route,
            'agreement' => $c->agreement,
            'modes' => $c->modes ?? [],
            'score' => (float) $c->score,
            'volume' => self::zarShort($c->volume_zar),
            'sectors' => $c->sectors,
            'region' => $c->destination_region,
            'infrastructure' => $c->infrastructure,
            'added' => $c->added_on?->format('j M Y'),
            'evidence' => Grades::evidence($c->confidence, 'human-reviewed', 'SADC Secretariat, Transnet, SARS trade statistics', $c->updated_at?->format('j M Y'), null),
        ];
        if ($full) {
            $base['profile'] = $c->profile ?? [];
        }

        return $base;
    }

    public static function source(Source $s, bool $full = false): array
    {
        $base = [
            'code' => $s->code,
            'name' => $s->name,
            'provider' => $s->provider,
            'category' => $s->category,
            'dataType' => $s->data_type,
            'coverage' => $s->coverage,
            'tier' => $s->tier,
            'tierName' => Grades::tierName($s->tier),
            'model' => $s->confidence_model,
            'confidence' => $s->confidence,
            'grade' => Grades::grade($s->confidence),
            'verification' => $s->verification_status,
            'status' => $s->status,
            'updated' => $s->last_updated?->format('j M Y'),
            'nextReview' => $s->next_review?->format('j M Y'),
        ];
        if ($full) {
            $base['profile'] = $s->profile ?? [];
        }

        return $base;
    }

    public static function brief(Brief $b, bool $full = false): array
    {
        $base = [
            'sku' => $b->sku,
            'title' => $b->title,
            'category' => $b->category,
            'format' => $b->format,
            'size' => $b->size_label,
            'published' => $b->published,
            'price' => $b->price_zar,
            'enterpriseFrom' => $b->enterprise_from_zar,
            'badge' => $b->badge,
            'summary' => $b->summary,
            'image' => $b->image,
        ];
        if ($full) {
            $base['profile'] = $b->profile ?? [];
        }

        return $base;
    }

    /** Find the model behind a polymorphic (type, key) pair. */
    public static function find(string $type, string $key): ?Model
    {
        return match ($type) {
            'opportunity', 'project' => Project::query()->where('slug', $key)->orWhere('code', $key)->first(),
            'investor', 'funder' => Organisation::query()->where('slug', $key)->first(),
            'corridor' => Corridor::query()->where('slug', $key)->first(),
            'report' => Brief::query()->where('sku', $key)->first(),
            'source' => Source::query()->where('code', $key)->first(),
            'sector' => Sector::query()->where('slug', $key)->first(),
            default => null,
        };
    }

    /**
     * Compact card used by saved items, watchlists, compare and fee discovery.
     */
    public static function card(string $type, string $key): ?array
    {
        $m = self::find($type, $key);
        if (! $m) {
            return null;
        }

        return match (true) {
            $m instanceof Project => [
                'type' => $type, 'key' => $m->slug, 'name' => $m->name, 'summary' => $m->summary, 'icon' => $m->icon,
                'location' => $m->location, 'sector' => Sector::query()->where('slug', $m->sector_slug)->value('name'),
                'province' => Province::query()->where('slug', $m->province_slug)->value('name'),
                'metricLabel' => 'Investment Size', 'metric' => self::size($m->size_min_zar, $m->size_max_zar),
                'stageLabel' => 'Stage', 'stage' => $m->stage, 'score' => (float) $m->score,
                'url' => $type === 'project' ? "/aiim/projects/{$m->slug}" : "/aiim/opportunities/{$m->slug}",
                'confidence' => $m->confidence,
            ],
            $m instanceof Organisation => [
                'type' => $type, 'key' => $m->slug, 'name' => $m->name, 'summary' => $m->summary,
                'icon' => $m->kind === 'investor' ? 'users' : 'landmark',
                'location' => $m->location, 'sector' => implode(', ', array_slice($m->focus ?? [], 0, 2)), 'province' => $m->origin,
                'metricLabel' => $m->profile['fund_size'] ?? null ? 'Fund Size' : 'Ticket Size',
                'metric' => $m->profile['fund_size'] ?? (self::zarShort($m->ticket_min_zar).' – '.self::zarShort($m->ticket_max_zar)),
                'stageLabel' => 'Type', 'stage' => $m->type, 'score' => (float) $m->match_score,
                'url' => $m->kind === 'investor' ? "/aiim/investors/{$m->slug}" : "/aiim/funders/{$m->slug}",
                'confidence' => $m->confidence,
            ],
            $m instanceof Corridor => [
                'type' => 'corridor', 'key' => $m->slug, 'name' => $m->name, 'summary' => $m->route, 'icon' => 'route',
                'location' => $m->countries, 'sector' => $m->sectors, 'province' => $m->type.' Region',
                'metricLabel' => 'Route Type', 'metric' => $m->type.' Corridor', 'stageLabel' => 'Framework', 'stage' => $m->agreement,
                'score' => (float) $m->score, 'url' => "/aiim/corridors/{$m->slug}", 'confidence' => $m->confidence,
            ],
            $m instanceof Brief => [
                'type' => 'report', 'key' => $m->sku, 'name' => $m->title, 'summary' => $m->summary, 'icon' => 'file-text',
                'location' => 'South Africa', 'sector' => $m->category, 'province' => null,
                'metricLabel' => 'Format', 'metric' => $m->format.' · '.$m->size_label, 'stageLabel' => 'Published', 'stage' => $m->published,
                'score' => null, 'url' => "/aiim/store/{$m->sku}", 'confidence' => 85,
            ],
            $m instanceof Source => [
                'type' => 'source', 'key' => $m->code, 'name' => $m->name, 'summary' => $m->provider, 'icon' => 'database',
                'location' => $m->coverage, 'sector' => $m->category, 'province' => null,
                'metricLabel' => 'Confidence', 'metric' => $m->confidence.'%', 'stageLabel' => 'Verification', 'stage' => ucfirst($m->verification_status),
                'score' => (float) $m->confidence, 'url' => "/aiim/sources/{$m->code}", 'confidence' => $m->confidence,
            ],
            $m instanceof Sector => [
                'type' => 'sector', 'key' => $m->slug, 'name' => $m->name, 'summary' => $m->summary, 'icon' => $m->icon,
                'location' => 'South Africa', 'sector' => $m->name, 'province' => null,
                'metricLabel' => 'Opportunity Score', 'metric' => (string) ($m->scores['gauteng'] ?? '—'), 'stageLabel' => 'Layer', 'stage' => 'Sector',
                'score' => (float) ($m->scores['gauteng'] ?? 0), 'url' => "/aiim/sector/{$m->slug}", 'confidence' => (int) ($m->profile['evidence']['confidence'] ?? 80),
            ],
            default => null,
        };
    }

    public static function typeLabel(string $type): string
    {
        return [
            'opportunity' => 'Opportunity', 'project' => 'Project', 'investor' => 'Investor', 'funder' => 'Funder',
            'corridor' => 'Trade Corridor', 'report' => 'Report', 'source' => 'Source', 'sector' => 'Sector',
        ][$type] ?? ucfirst($type);
    }
}
