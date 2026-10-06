<?php

namespace Database\Seeders\Sections;

use App\Models\Sprint;
use App\Support\Platform\EmbeddedServices;
use App\Support\Sprints\Packages;
use App\Support\Sprints\SprintContent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Batch 4D embedded services: the 569 client-facing embedded Sprints of the
 * TBCA_Batch_4D_581_Embedded_Sprint_Workbook_REPRICED_v3 workbook (the 12 internal
 * operations rows are excluded). Each one is a sprint of type "embedded" with the
 * workbook's Basic / Standard / Premium prices (ZAR excl. VAT) and delivery times,
 * placed on its host module(s) via attributes.embedded.modules.
 *
 * Data files in data/embedded/*.php are generated from the workbook CSVs. The six
 * "NOT COMPUTABLE" rows are seeded as quote-on-request. Idempotent: rows are
 * chunk-upserted on `code`; slugs give way to slugs other sections already own.
 * A 4D code that already belongs to a non-embedded sprint only has its packages updated.
 */
class EmbeddedServicesSeeder extends Seeder
{
    private const COLUMNS = [
        'slug', 'title', 'type', 'category', 'subcategory', 'audience', 'summary', 'description', 'price_zar',
        'delivery', 'commercial_act', 'packages', 'attributes', 'featured', 'popular', 'is_new', 'rating', 'status',
    ];

    public function run(): void
    {
        $overrides = require __DIR__.'/data/sprint-package-overrides.php';
        $existing = Sprint::query()->get(['code', 'slug', 'type'])->keyBy('code');
        $taken = $existing->pluck('code', 'slug')->all();

        $bulk = [];
        foreach (['modules', 'aiim', 'toolkits'] as $file) {
            foreach (require __DIR__."/data/embedded/{$file}.php" as $spec) {
                $row = Packages::applyToRow(['code' => $spec['code'], ...self::row($spec)], $overrides);

                // Same code already seeded as a different sprint type: refresh its prices only.
                $current = $existing->get($spec['code']);
                if ($current !== null && $current->type !== 'embedded') {
                    Sprint::query()->where('code', $spec['code'])->update([
                        'packages' => json_encode($row['packages'], JSON_UNESCAPED_UNICODE),
                        'price_zar' => $row['price_zar'],
                    ]);

                    continue;
                }

                $slug = $row['slug'];
                if (isset($taken[$slug]) && $taken[$slug] !== $spec['code']) {
                    $slug .= '-'.strtolower($spec['code']);
                }
                $row['slug'] = $slug;
                $taken[$slug] = $spec['code'];
                $bulk[] = $row;
            }
        }

        $now = now();
        foreach (array_chunk($bulk, 100) as $chunk) {
            $records = array_map(fn (array $r) => [
                ...$r,
                'packages' => json_encode($r['packages'], JSON_UNESCAPED_UNICODE),
                'attributes' => json_encode($r['attributes'], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ], $chunk);

            DB::table('sprints')->upsert($records, ['code'], [...self::COLUMNS, 'updated_at']);
        }
    }

    /**
     * @param  array<string, mixed>  $spec  one generated workbook row
     * @return array<string, mixed>
     */
    public static function row(array $spec): array
    {
        $title = $spec['title'];
        $host = $spec['host'] === 'AIIM' ? 'Africa Investment Intelligence Map' : $spec['host'];
        $quote = $spec['zar'] === null;
        $delivery = $quote ? 'Confirmed after scope' : $spec['delivery'][0];
        $placements = array_values(array_filter(array_map(fn ($m) => EmbeddedServices::MODULES[$m] ?? null, $spec['modules'])));
        $group = $spec['host'] === 'Toolkit Universe' ? explode(' Toolkit ', $title)[0] : $host;
        $aaiNow = (int) round(($spec['aai'][0] ?? 0) * 100);

        $summary = $quote
            ? "{$title}: an embedded {$host} service. Scope and price are confirmed on request."
            : "{$title}: an embedded {$host} service, delivered in ".strtolower($delivery).' from receipt of complete inputs.';

        $built = SprintContent::build([
            'slug' => $spec['slug'],
            'title' => $title,
            'type' => 'embedded',
            'category' => $spec['category'],
            'subcategory' => $host,
            'audience' => 'smes,corporates,investors,founders',
            'summary' => $summary,
            'description' => "{$title} is an embedded service that runs inside the TBCA {$host} module"
                .($placements ? ' and is available from '.implode(', ', array_unique($placements)) : '').'. '
                .($quote ? 'Its scope is confirmed on request, so it is quoted rather than sold at a fixed price. ' : "Prices are fixed per package (ZAR, excluding VAT) and delivery runs during coverage time (08:00-17:00 Mon-Fri) from receipt of complete inputs. ")
                ."About {$aaiNow}% of the work is AI-automated today; every output is human-reviewed before release and delivered through the Client Portal.",
            'act' => $quote ? 'quote' : 'purchase',
            'price' => $quote ? null : $spec['zar'][0],
            'delivery' => $delivery,
            'packages' => self::packages($spec, $title, $host),
            'rating' => null,
            'reviews' => 0,
            'ideal_for' => ['SMEs', 'Corporates', 'Investors'],
            'needs' => [],
            'keywords' => array_values(array_unique(['embedded service', $host, $group, ...$placements])),
            'badge' => 'Embedded Service',
            'price_display' => $quote ? 'quote' : null,
            'format' => 'Delivered in-platform (Client Portal)',
            'attributes' => [
                'reviews_data' => null,
                'embedded' => [
                    'code' => $spec['code'],
                    'workbook_name' => $spec['name'],
                    'host_module' => $host,
                    'host_subcategory' => $spec['host_subcategory'],
                    'group' => $group,
                    'modules' => $spec['modules'],
                    'placement' => $placements,
                    'sku' => $spec['sku'],
                    'automation' => [
                        'aai_now' => $spec['aai'][0], 'aai_h1' => $spec['aai'][1], 'aai_h2' => $spec['aai'][2],
                        ...$spec['split'],
                        'human_minutes_per_order' => $spec['human_minutes'],
                    ],
                    'archetype' => $spec['archetype'],
                    'universal_prompt' => $spec['prompt'],
                    'delivery_shape' => $spec['shape'],
                    'delivery_clock' => $spec['clock'],
                    'delivery_qualifier' => $spec['qualifier'],
                    'price_authority' => $spec['authority'],
                    'benchmark' => $spec['benchmark'],
                    'entry_tier' => $spec['entry_tier'],
                    'client_saleable' => $spec['saleable'],
                    'vat' => 'VAT-exclusive; VAT 15% stated separately',
                    'source' => 'Batch 4D v3 ('.$spec['as_at'].')',
                ],
            ],
        ]);

        $built['rating'] = null;

        return $built;
    }

    /** @return list<array<string, mixed>> exactly Basic / Standard / Premium */
    private static function packages(array $spec, string $title, string $host): array
    {
        $features = [
            'basic' => ["Core {$title} output", "Run inside {$host}", 'Human-reviewed before release', 'Email support'],
            'standard' => ["Full-scope {$title} output", 'Expert review and quality assurance', 'One revision round', 'Client Portal handover'],
            'premium' => ['Extended scope with deeper analysis', 'Additional expert review session', 'Priority delivery queue', 'Extended post-delivery support (30 days)'],
        ];
        $descriptions = [
            'basic' => 'Essential scope: the core outputs to get started.',
            'standard' => 'Complete scope with full outputs and expert review.',
            'premium' => 'Extended scope with deeper analysis, expert sessions and priority delivery.',
        ];

        $out = [];
        foreach (array_keys(Packages::TIERS) as $i => $key) {
            $zar = $spec['zar'][$i] ?? null;
            $out[] = [
                'key' => $key,
                'name' => Packages::TIERS[$key],
                'zar' => $zar,
                'price_label' => $zar === null ? null : 'R'.number_format($zar),
                'delivery' => $spec['delivery'][$i] ?? 'Confirmed after scope',
                'description' => $descriptions[$key],
                'features' => $features[$key],
                'popular' => $key === 'standard',
            ];
        }

        return $out;
    }
}
