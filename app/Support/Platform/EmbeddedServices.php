<?php

namespace App\Support\Platform;

use App\Models\Sprint;
use Illuminate\Support\Facades\Cache;

/**
 * Embedded services (Batch 4D): sprints of type "embedded" that live inside a host
 * module (Virtual Deal Room, Project Advisory, Countries, Industries, Resources ...).
 *
 * Each embedded sprint lists its host module keys in attributes.modules (the native
 * workbook module first, then the extra pages it is shown on). The compact card list
 * is cached and keyed on the embedded rows' count and latest update.
 */
class EmbeddedServices
{
    /** Host module key => label. Keys are what controllers pass to forModule(). */
    public const MODULES = [
        'virtual-deal-room' => 'Virtual Deal Room',
        'project-advisory' => 'Project Advisory',
        'countries' => 'Countries',
        'industries' => 'Industries',
        'resources' => 'Resources',
        'kp-thought-leadership' => 'KP Thought Leadership',
        'webinars' => 'Webinars',
        'aiim' => 'Africa Investment Intelligence Map',
        'due-diligence' => 'Due Diligence',
        'partner-services' => 'Partner Services',
        'online-shop' => 'Online Shop',
        'retainers' => 'Retainers',
        'subscriptions' => 'Subscriptions',
        'digital-products' => 'Digital Products',
        'technology-solutions' => 'Technology Solutions',
        'toolkit-universe' => 'Toolkit Universe',
        'calculator-universe' => 'Calculator Universe',
        'platform-template-universe' => 'Platform Template Universe',
        'dashboard-universe' => 'Dashboard Universe',
        'report-universe' => 'Report Universe',
    ];

    /** How many cards a host page receives; the full list is one click away. */
    public const PREVIEW = 48;

    /**
     * Section payload for a host page: {module, label, total, href, items}.
     *
     * @return array{module: string, label: string, total: int, href: string, items: list<array<string, mixed>>}
     */
    public static function forModule(string $module, ?int $limit = self::PREVIEW): array
    {
        $items = array_values(array_filter(self::all(), fn (array $s) => in_array($module, $s['modules'], true)));

        return [
            'module' => $module,
            'label' => self::MODULES[$module] ?? ucwords(str_replace('-', ' ', $module)),
            'total' => count($items),
            'href' => "/embedded-services/{$module}",
            'items' => $limit === null ? $items : array_slice($items, 0, $limit),
        ];
    }

    /** Module key => number of embedded services shown there. */
    public static function counts(): array
    {
        $counts = [];
        foreach (self::all() as $s) {
            foreach ($s['modules'] as $m) {
                $counts[$m] = ($counts[$m] ?? 0) + 1;
            }
        }

        return $counts;
    }

    /** @return list<array<string, mixed>> compact cards for every published embedded sprint */
    public static function all(): array
    {
        $base = Sprint::query()->where('type', 'embedded')->where('status', 'published');
        $version = (clone $base)->count().'-'.(clone $base)->max('updated_at');

        return Cache::remember('embedded-services.'.md5($version), now()->addDay(), function () use ($base) {
            return $base->orderBy('code')->get()->map(function (Sprint $s) {
                $a = (array) ($s->attributes ?? []);
                $e = (array) ($a['embedded'] ?? []);

                return [
                    'code' => $s->code,
                    'slug' => $s->slug,
                    'title' => $s->title,
                    'category' => $s->category,
                    'host' => $e['host_module'] ?? $s->subcategory,
                    'group' => $e['group'] ?? ($e['host_module'] ?? $s->subcategory),
                    'modules' => array_values((array) ($e['modules'] ?? [])),
                    'price_zar' => $s->commercial_act === 'quote' ? null : $s->price_zar,
                    'delivery' => $s->delivery,
                    'quote' => $s->commercial_act === 'quote',
                    'href' => "/sprints/{$s->slug}",
                ];
            })->all();
        });
    }
}
