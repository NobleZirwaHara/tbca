<?php

namespace App\Support\Advisory;

use App\Models\Sprint;
use Illuminate\Support\Facades\Cache;

/**
 * Maps the live sprint catalogue onto the 7 Technology Solution Towers (TS-1..TS-7).
 *
 * Each technology / AI / data sprint is assigned to exactly one tower by its register
 * category and title keywords (first matching rule wins), so a tower page can list the
 * whole set of services under it with links to /sprints/{slug}.
 */
class TowerCatalogue
{
    /** [tower code, register-category needles, title regex] in priority order. */
    private const RULES = [
        ['TS-1', ['Zoho, Qlik, Power BI, UiPath'], '/zoho|\bcrm\b|\berp\b|quickbooks|xero|\bsage\b|odoo|business system|accounting system/i'],
        ['TS-3', ['New Technology, AI, Machine Learning'], '/\bai\b|agentic|\bagent|copilot|chatbot|machine learning|\bllm\b|generative/i'],
        ['TS-4', [], '/\brpa\b|uipath|power automate|workflow|automation|\bn8n\b|\bbot\b|process automation/i'],
        ['TS-6', ['Technology, Digital Transformation, Cybersecurity and Cloud'], '/cloud|cyber|security|backup|infrastructure|network|microsoft 365|\bit\b|digital transformation|disaster recovery|hosting/i'],
        ['TS-5', ['Web, eCommerce, Platforms, Portals and Online Shops'], '/website|\bweb\b|e-?commerce|online shop|\bshop\b|portal|landing page|\bseo\b|platform/i'],
        ['TS-7', ['User Experience, Design, Graphics, Creative and Product Design'], '/\bux\b|\bui\b|design|brand|product|prototype|graphic|creative/i'],
        ['TS-2', ['Data, Analytics, Research'], '/dashboard|\bbi\b|power bi|qlik|analytics|data|reporting|kpi|control tower/i'],
    ];

    /** @return array<string, list<array<string, mixed>>> keyed by tower code */
    public static function grouped(): array
    {
        return Cache::remember('tech-tower-catalogue:v1', now()->addMinutes(30), function () {
            $out = array_fill_keys(array_column(self::RULES, 0), []);
            $rows = Sprint::query()
                ->whereIn('category', ['technology', 'ai-automation', 'data-dashboards'])
                ->orderBy('title')
                ->get(['slug', 'title', 'category', 'subcategory', 'summary', 'price_zar', 'delivery', 'attributes']);

            foreach ($rows as $s) {
                $reg = (string) ($s->attributes['register']['category_v2'] ?? ($s->attributes['breadcrumb'][2] ?? ''));
                $code = self::assign($s->category, $reg, $s->title.' '.$s->subcategory);
                if ($code) {
                    $out[$code][] = [
                        'slug' => $s->slug,
                        'title' => $s->title,
                        'category' => $s->category,
                        'summary' => (string) ($s->summary ?: ($s->attributes['overview'] ?? '')),
                        'price_zar' => (int) $s->price_zar,
                        'delivery' => $s->delivery,
                        'group' => $reg ?: $s->subcategory,
                        'image' => $s->attributes['image_url'] ?? null,
                    ];
                }
            }

            return $out;
        });
    }

    private static function assign(string $category, string $register, string $text): ?string
    {
        foreach (self::RULES as [$code, $needles, $regex]) {
            foreach ($needles as $n) {
                if ($register !== '' && str_contains($register, $n)) {
                    return $code;
                }
            }
        }
        // Data sprints that are really marketing / finance packs are not technology tower services.
        if ($category === 'data-dashboards' && ! preg_match('/dashboard|data|analytics|\bbi\b|kpi|control tower/i', $text)) {
            return null;
        }
        foreach (self::RULES as [$code, , $regex]) {
            if (preg_match($regex, $text)) {
                return $code;
            }
        }

        return match ($category) {
            'ai-automation' => 'TS-3',
            'data-dashboards' => 'TS-2',
            default => 'TS-6',
        };
    }

    public static function forTower(string $code): array
    {
        return self::grouped()[$code] ?? [];
    }

    /** @return array<string, int> */
    public static function counts(): array
    {
        return array_map('count', self::grouped());
    }
}
