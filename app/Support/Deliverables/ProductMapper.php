<?php

namespace App\Support\Deliverables;

use App\Models\Deliverables\Deliverable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Links the client's Issue 1.0 register deliverables to the app's products (Noble's
 * decision, 29 October 2026). Only clear matches are linked:
 *
 *  1. Structural rules where the register names the product: a Due Diligence check
 *     family, a subscription plan or retainer desk named as the row's family, a
 *     Technology Solutions tower, a partner discipline, an industry brief.
 *  2. "Every product of a type" where the register says a deliverable is produced by
 *     every product of that kind (Due Diligence journey outputs, standard partner
 *     outputs, retainer administration, webinar outputs and similar).
 *  3. Reviewed pairs: the app product lists this deliverable (Project Advisory
 *     services name their deliverables) or is the same product under a shorter name;
 *     each pair was checked by hand and is listed in REVIEWED.
 *  4. Name match within the product type that belongs to the row's tab: the share of
 *     words the two names have in common must be at least 0.65. Weaker candidates (0.4
 *     and over) are listed for review and not linked.
 *
 * Writes the links file the seeder loads and a review CSV with every Issue 1.0 row,
 * its decision, method and confidence.
 */
class ProductMapper
{
    public const LINKS = 'database/seeders/Sections/data/deliverables/product_links.csv';

    public const REVIEW = 'docs/knowledge-base/kruger-2026-10/deliverables-product-mapping.csv';

    public const LINK_AT = 0.65;

    public const REVIEW_AT = 0.4;

    /** Register tab => product types searched by name. */
    private const BY_NAME = [
        'Digital Products' => ['digital_product', 'tool'],
        'Tools & Calculators' => ['tool', 'digital_product'],
        'Toolkits' => ['tool', 'digital_product'],
        'Resources' => ['tool', 'digital_product'],
        'Marketplace' => ['marketplace_listing'],
        'Project Advisory — Concept to Bankability' => ['pa_service'],
        'Project Advisory — Bankability to Turnkey' => ['pa_service'],
        'Services' => ['service'],
        'AIIM' => ['aiim_brief'],
        'Diagnostics' => ['tool'],
        'Online Shop' => ['digital_product', 'tool'],
    ];

    /** Partner discipline deliverable => Partner Services listing category. */
    private const DISCIPLINES = [
        'DEL-PS-001' => 'legal-services', 'DEL-PS-002' => 'audit-assurance', 'DEL-PS-003' => 'tax-advisory',
        'DEL-PS-004' => 'esg-advisory', 'DEL-PS-005' => 'environmental-services', 'DEL-PS-006' => 'engineering-technical',
        'DEL-PS-007' => 'financial-advisory', 'DEL-PS-008' => 'specialist-compliance',
    ];

    /** Pairs checked by hand: deliverable => [product type, product code, reason]. */
    private const REVIEWED = [
        // Project Advisory services list their deliverables (PaContent).
        'DEL-PC-003' => ['pa_service', 'PA-T-001', 'App service lists Concept Note'],
        'DEL-PC-007' => ['pa_service', 'PA-T-001', 'App service lists Investability Screen'],
        'DEL-PC-008' => ['pa_service', 'PA-T-001', 'App service lists Roadmap'],
        'DEL-PC-015' => ['pa_service', 'PA-T-002', 'App service lists Feasibility Report'],
        'DEL-PC-025' => ['pa_service', 'PA-T-002', 'App service lists Executive Summary'],
        'DEL-PC-021' => ['pa_service', 'PA-T-003', 'App service lists Business Case and Investment Memorandum'],
        'DEL-PC-022' => ['pa_service', 'PA-T-003', 'App service lists Options Appraisal'],
        'DEL-PC-016' => ['pa_service', 'PA-T-004', 'App service lists Financial Model'],
        'DEL-PC-017' => ['pa_service', 'PA-T-004', 'App service lists Model Book and assumptions log'],
        'DEL-PC-034' => ['pa_service', 'PA-T-004', 'App service lists Valuation Report'],
        'DEL-PT-005' => ['pa_service', 'PA-T-005', 'App service lists Structuring Options Paper and Risk Matrix'],
        'DEL-PT-006' => ['pa_service', 'PA-T-005', 'App service lists Information Memorandum and Teaser'],
        'DEL-PT-003' => ['pa_service', 'PA-T-006', 'App service lists Funder Map and Approach Strategy'],
        'DEL-PT-017' => ['pa_service', 'PA-T-007', 'App service lists Monthly PMO Report'],
        // Same product under another name.
        'DEL-SV-005' => ['service', 'SVC-033', 'Same service: company registration'],
        'DEL-SV-012' => ['service', 'SVC-045', 'Same service: eLearning course design'],
        'DEL-SV-014' => ['service', 'SVC-028', 'Same service: cash flow forecast'],
        'DEL-SV-021' => ['service', 'SVC-057', 'Same service: HR policy pack'],
        'DEL-SV-035' => ['service', 'SVC-010', 'Same service: AI use-case discovery'],
        'DEL-SV-045' => ['service', 'SVC-048', 'Same service: ESG baseline'],
        'DEL-SV-054' => ['service', 'SVC-107', 'Same service: website build'],
        'DEL-SV-057' => ['service', 'SVC-008', 'Same service: AfCFTA opportunity'],
        'DEL-SV-058' => ['service', 'SVC-047', 'Same service: enterprise and supplier development programme design'],
        'DEL-DP-010' => ['digital_product', 'DP-RPT-000101', 'App edition of the country report (South Africa 2026)'],
        'DEL-TC-022' => ['tool', 'TLS-009', 'Same calculation: cash runway'],
    ];

    /** Tabs with no product page that carries a product identity (listed as unmatched). */
    private const NO_PRODUCT_PAGE = [
        'Countries' => 'Country pages are journeys, not products with a code; the country deliverable set is in the Country Matrix.',
        'Virtual Deal Room' => 'Deal room stage outputs are produced inside a client deal room, not sold as products.',
        'Client Portal' => 'Client workspace records, produced for every engagement inside the portal.',
        'KP Thought Leadership' => 'Editorial content; KP articles are not priced products.',
        'Internal Operations (non-client)' => 'Internal operations, not sold.',
    ];

    private const STOP = ['and', 'the', 'for', 'of', 'a', 'an', 'to', 'in', 'with', 'tbca', '&', 'by', 'on', 'or', 'sprint'];

    /** @return array{links: list<array<string, string>>, review: list<array<string, string>>} */
    public function build(): array
    {
        $products = ProductCatalogue::indexed();
        $rows = Deliverable::query()->where('v2_status', 'not like', 'NEW%')->where('v2_status', 'not like', 'TBCA generated%')
            ->orderBy('sort')->get(['ref', 'tab', 'family', 'name']);
        $sprintLinked = DB::table('deliverable_sprints')->where('match', '!=', 'unmatched')->pluck('deliverable_ref')->flip();

        $links = [];
        $review = [];
        foreach ($rows as $d) {
            [$found, $note, $candidate] = $this->decide($d, $products);
            foreach ($found as $l) {
                $links[] = ['deliverable_ref' => $d->ref] + $l;
            }
            $review[] = [
                'deliverable_ref' => $d->ref,
                'tab' => $d->tab,
                'family' => (string) $d->family,
                'deliverable' => $d->name,
                'decision' => $found ? 'linked' : 'not linked',
                'product_type' => implode('; ', array_unique(array_column($found, 'product_type'))),
                'product_codes' => implode('; ', array_column($found, 'product_code')),
                'product_names' => implode('; ', array_column($found, 'product_name')),
                'match_method' => implode('; ', array_unique(array_column($found, 'match_method'))),
                'confidence' => $found ? 'high' : '',
                'also_linked_to_sprints' => isset($sprintLinked[$d->ref]) ? 'yes' : 'no',
                'note' => $note,
                'best_candidate' => $candidate,
            ];
        }

        return ['links' => $links, 'review' => $review];
    }

    public function write(): array
    {
        $doc = $this->build();
        $this->csv(base_path(self::LINKS), ['deliverable_ref', 'product_type', 'product_code', 'product_slug', 'product_name', 'product_url', 'scope', 'match_method', 'confidence', 'note'], $doc['links']);
        $this->csv(base_path(self::REVIEW), array_keys($doc['review'][0]), $doc['review']);

        return $doc;
    }

    /** @return array{0: list<array<string, string>>, 1: string, 2: string} links, note, weaker candidate */
    private function decide(object $d, array $products): array
    {
        $ref = $d->ref;
        $num = (int) substr($ref, strrpos($ref, '-') + 1);
        $link = fn (string $type, array $p, string $method, string $note = '') => [
            'product_type' => $type, 'product_code' => $p['code'], 'product_slug' => $p['slug'], 'product_name' => $p['name'], 'product_url' => $p['url'],
            'scope' => 'product', 'match_method' => $method, 'confidence' => 'high', 'note' => $note,
        ];
        $every = fn (string $type, string $method) => [[
            'product_type' => $type, 'product_code' => '*', 'product_slug' => '', 'product_name' => ProductCatalogue::EVERY[$type], 'product_url' => '',
            'scope' => 'all', 'match_method' => $method, 'confidence' => 'high', 'note' => '',
        ]];
        $byName = fn (string $type, string $name) => collect($products[$type] ?? [])->first(fn ($p) => Str::lower($p['name']) === Str::lower($name));

        if (isset(self::REVIEWED[$ref]) && ($p = $products[self::REVIEWED[$ref][0]][self::REVIEWED[$ref][1]] ?? null)) {
            return [[$link(self::REVIEWED[$ref][0], $p, 'Reviewed pair', self::REVIEWED[$ref][2])], '', ''];
        }

        // Due Diligence: check families 1 to 14 are the 14 family pages, in the same order.
        if (str_starts_with($ref, 'DEL-DD-') && $num <= 14) {
            $family = array_values($products['dd_family'] ?? [])[$num - 1] ?? null;

            return [$family ? [$link('dd_family', $family, 'Check family = Due Diligence family page (same order and name)')] : [], '', ''];
        }
        if (str_starts_with($ref, 'DEL-DD-') && $num >= 28 && $num <= 41) {
            return [$every('dd_family', 'Journey output of every Due Diligence case (Stages A to 14)'), '', ''];
        }

        // Subscriptions and retainers: the register's family is the plan or desk name.
        if ($ref === 'DEL-SU-012' || $ref === 'DEL-DP-018') {
            return [$every($ref === 'DEL-SU-012' ? 'subscription_plan' : 'digital_product', 'Statement produced for every product of the type'), '', ''];
        }
        if (str_starts_with($ref, 'DEL-SU-')) {
            $names = $d->family === 'Enterprise & Custom' ? ['Enterprise', 'Custom / Intelligence Archive'] : [$d->family];
            $found = array_values(array_filter(array_map(fn ($n) => ($p = $byName('subscription_plan', $n)) ? $link('subscription_plan', $p, 'Register family = subscription plan name') : null, $names)));

            return [$found, $found ? '' : 'No subscription plan with the family name.', ''];
        }
        if (str_starts_with($ref, 'DEL-RT-')) {
            if ($d->family === 'Retainer administration (all desks)') {
                return [$every('retainer', 'Register family says all desks'), '', ''];
            }
            $p = $byName('retainer', $d->family);

            return [$p ? [$link('retainer', $p, 'Register family = retainer service name')] : [], $p ? '' : 'No retainer with the family name.', ''];
        }

        // Technology Solutions: stage outputs apply to every engagement; towers TS-1 to TS-7 in order.
        if (str_starts_with($ref, 'DEL-TS-')) {
            if ($num <= 12) {
                return [$every('tech_tower', 'Stage output (S0 to S13) of every Technology Solutions engagement'), '', ''];
            }
            if ($num <= 19 && ($p = $products['tech_tower']['TS-'.($num - 12)] ?? null)) {
                return [[$link('tech_tower', $p, 'Register tower TS-1 to TS-7 = tower page (same order and name)')], '', ''];
            }

            return [[], 'Cross-tower business case; no single tower page.', ''];
        }

        if (str_starts_with($ref, 'DEL-WB-')) {
            return [$every('webinar', 'Output of every webinar'), '', ''];
        }

        if (str_starts_with($ref, 'DEL-PS-')) {
            if ($d->family === 'Standard partner outputs (all disciplines)') {
                return [$every('partner_service', 'Register family says all disciplines'), '', ''];
            }
            $category = self::DISCIPLINES[$ref] ?? null;
            $found = array_values(array_map(fn ($p) => $link('partner_service', $p, 'Discipline = Partner Services listing category', "Category {$category}"),
                array_filter($products['partner_service'] ?? [], fn ($p) => $p['group'] === $category)));

            return [$found, $found ? '' : 'No partner listing in this discipline.', ''];
        }

        if ($d->tab === 'Industries') {
            if (preg_match('/^Industry Intelligence Brief\s+\S+\s+(.+)$/u', $d->name, $m) && ($p = $byName('industry', trim($m[1])))) {
                return [[$link('industry', $p, 'Industry brief = industry page (same industry name)')], '', ''];
            }

            return [[], 'Industries module output; not tied to one industry page.', ''];
        }

        if (isset(self::NO_PRODUCT_PAGE[$d->tab])) {
            return [[], self::NO_PRODUCT_PAGE[$d->tab], ''];
        }

        // Name match within the tab's product types.
        $best = null;
        foreach (self::BY_NAME[$d->tab] ?? [] as $type) {
            foreach ($products[$type] ?? [] as $p) {
                $score = self::similarity($d->name, $p['name']);
                if ($best === null || $score > $best[0]) {
                    $best = [$score, $type, $p];
                }
            }
        }
        if ($best && $best[0] >= self::LINK_AT) {
            return [[$link($best[1], $best[2], sprintf('Name match %.2f', $best[0]))], '', ''];
        }

        $candidate = $best && $best[0] >= self::REVIEW_AT ? sprintf('%s %s "%s" (%.2f)', $best[1], $best[2]['code'], $best[2]['name'], $best[0]) : '';
        $note = isset(self::BY_NAME[$d->tab]) ? 'No product with a clear name match.' : 'No product page of this kind in the app.';

        return [[], $note, $candidate];
    }

    /** Shared words over all words (stop words removed). */
    public static function similarity(string $a, string $b): float
    {
        $ta = self::tokens($a);
        $tb = self::tokens($b);
        if ($ta === [] || $tb === []) {
            return 0.0;
        }

        return count(array_intersect_key($ta, $tb)) / count($ta + $tb);
    }

    /** @return array<string, true> */
    private static function tokens(string $s): array
    {
        $s = Str::lower(str_replace(['(3-statement)', '(3-statements)'], 'three statement', Str::lower($s)));
        $words = preg_split('/[^a-z0-9]+/', $s, -1, PREG_SPLIT_NO_EMPTY);
        $words = array_map(fn ($w) => strlen($w) > 3 ? rtrim($w, 's') : $w, $words);

        return array_fill_keys(array_values(array_diff($words, self::STOP)), true);
    }

    private function csv(string $path, array $header, array $rows): void
    {
        $fh = fopen($path, 'w');
        fputcsv($fh, $header, escape: '');
        foreach ($rows as $r) {
            fputcsv($fh, array_map(fn ($k) => $r[$k] ?? '', $header), escape: '');
        }
        fclose($fh);
    }
}
