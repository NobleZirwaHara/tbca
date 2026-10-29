<?php

namespace App\Support\Deliverables;

use App\Models\Deliverables\Deliverable;
use App\Models\Sprint;
use App\Support\Sprints\SprintOffer;
use App\Support\Sprints\Taxonomy;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Writes a deliverable record, in the register's structure, for every published app
 * Sprint that the client's Registry of Deliverables does not cover (Noble's decision,
 * 29 October 2026). Each record is built from the Sprint's own page data and from the
 * register itself:
 *
 *  - Comparable register deliverable, in this order: the register's Sprint deliverable
 *    whose name is closest to the Sprint's when at least 60% of the words match (and it
 *    has the format the Sprint's name points to, when it points to one); else
 *    the closest one in the format the Sprint's name points to (Dashboard, Template,
 *    Report ...); else the one most often linked to Sprints of the same type and
 *    catalogue category (then the same type, then any).
 *    It supplies the tab, family, format, consulting standard, automation route,
 *    payment-triggered loop, safeguards, acceptance parameters, the depth uplift and the
 *    HeyGen and Infogram layers, exactly as the register states them for that family.
 *  - Standards sheet: page ranges per tier for the format (size M).
 *  - The Sprint: name, description, key issues (what's included, deliverables,
 *    outcomes), packages, prices and delivery time per tier.
 *  - Extent of detail: the comparable deliverable's tier wording with its issue list
 *    replaced by this Sprint's issues.
 *
 * Records carry source and V2 status "TBCA generated (Oct 2026)" and refs DEL-GEN-0001
 * onwards. Refs already issued are kept; new Sprints get the next number.
 */
class SprintDeliverableGenerator
{
    public const SOURCE = 'TBCA generated (Oct 2026)';

    public const PATH = 'database/seeders/Sections/data/deliverables/generated.json';

    /** @return array{texts: list<string>, rows: list<array<string, mixed>>, count: int} */
    public function build(): array
    {
        $existing = self::existingRefs();
        $next = $existing === [] ? 1 : max(array_map(fn ($r) => (int) substr($r, 8), $existing)) + 1;

        $templates = $this->templates();
        $formats = DB::table('deliverable_standards')->where('section', 'format')->get()->keyBy('code');

        $texts = [];
        $index = [];
        $pool = function (?string $v) use (&$texts, &$index): ?int {
            if ($v === null || $v === '') {
                return null;
            }
            if (! isset($index[$v])) {
                $index[$v] = count($texts);
                $texts[] = $v;
            }

            return $index[$v];
        };

        $rows = [];
        foreach ($this->uncovered() as $sprint) {
            $hint = self::formatHint($sprint->title);
            $strong = $this->closest($sprint, null, 0.6);
            if ($strong && $hint && $strong->format_detail !== $hint) {
                $strong = null;
            }
            $tpl = $strong
                ?? ($hint ? $this->closest($sprint, $hint, 0.0) : null)
                ?? $templates[$sprint->type.'|'.$sprint->category] ?? $templates[$sprint->type] ?? $templates['*'];
            $ref = $existing[$sprint->code] ?? sprintf('DEL-GEN-%04d', $next++);
            $row = $this->row($sprint, $tpl, $formats[$tpl->format_code] ?? null);
            $row['ref'] = $ref;
            foreach (Deliverable::POOLED as $f) {
                $row[$f] = $pool($row[$f]);
            }
            $rows[] = $row;
        }

        usort($rows, fn ($a, $b) => strcmp($a['ref'], $b['ref']));

        return ['count' => count($rows), 'texts' => $texts, 'rows' => $rows];
    }

    public function write(): array
    {
        $doc = $this->build();
        $out = [
            'source' => self::SOURCE,
            'note' => 'Deliverables for app Sprints that the client register MP-DEL-2.0 does not cover. Written by `php artisan deliverables:generate`.',
            'count' => $doc['count'],
            'pooled' => Deliverable::POOLED,
            'texts' => $doc['texts'],
            'rows' => $doc['rows'],
        ];
        file_put_contents(base_path(self::PATH), json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");

        return $doc;
    }

    /** @return array<string, string> sprint code => ref already issued */
    public static function existingRefs(): array
    {
        $path = base_path(self::PATH);
        if (! is_file($path)) {
            return [];
        }
        $doc = json_decode((string) file_get_contents($path), true) ?: [];

        return collect($doc['rows'] ?? [])->mapWithKeys(fn ($r) => [$r['linked_sprint_codes'] => $r['ref']])->all();
    }

    /** Published Sprints whose code and register_id are both absent from the client's crosswalk. */
    public function uncovered(): Collection
    {
        $register = DB::table('deliverable_sprints')->where('status', 'not like', 'TBCA generated%')->select('sprint_code');

        return Sprint::query()
            ->where('status', 'published')
            ->whereNotIn('code', $register)
            ->where(fn ($w) => $w->whereNull('register_id')->orWhereNotIn('register_id', (clone $register)))
            ->orderBy('code')
            ->get();
    }

    /** Format the Sprint's name points to ("... Dashboard Sprint" is a dashboard), checked in this order. */
    private const HINTS = [
        '/\\bdashboards?\\b/i' => 'Dashboard',
        '/\\btemplates?\\b/i' => 'Template',
        '/\\bchecklists?\\b/i' => 'Checklist',
        '/\\b(calculator|estimator)s?\\b/i' => 'Calculator',
        '/\\btool ?kits?\\b/i' => 'Toolkit',
        '/\\b(pitch|deck)\\b/i' => 'Pitch / Deck',
        '/\\bvaluation\\b/i' => 'Valuation',
        '/\\b(financial|projection)\\b.*\\bmodel/i' => 'Financial model',
        '/\\bretainer\\b/i' => 'Retainer monthly pack',
        '/\\bsubscription\\b/i' => 'Subscription cycle pack',
        '/\\broadmap\\b/i' => 'Plan / Roadmap',
        '/\\b(memo|paper|proposal)\\b/i' => 'Memo / Paper',
        '/\\b(assessment|audit|review|analysis|scan|diagnostic|readiness|health)\\b/i' => 'Analysis',
        '/\\b(plan|planning|strategy|report|research|study|feasibility)\\b/i' => 'Report',
    ];

    public static function formatHint(string $title): ?string
    {
        foreach (self::HINTS as $pattern => $format) {
            if (preg_match($pattern, $title)) {
                return $format;
            }
        }

        return null;
    }

    /** @var array<string, list<array{ref: string, tokens: array<string, true>, type: ?string, sort: int, format: string}>>|null */
    private ?array $byToken = null;

    /** @var array<string, Deliverable> */
    private array $loaded = [];

    private const STOP = ['sprint', 'and', 'the', 'for', 'of', 'a', 'an', 'to', 'in', 'with', 'tbca', 'pack', 'service', 'services', '&', 'by', 'on', 'or'];

    /** @return array<string, true> */
    private static function tokens(string $name): array
    {
        $words = preg_split('/[^a-z0-9]+/', Str::lower($name), -1, PREG_SPLIT_NO_EMPTY);

        return array_fill_keys(array_values(array_diff($words, self::STOP)), true);
    }

    /**
     * The register's own Sprint deliverable whose name is closest to this Sprint's
     * (shared words over all words, with a small preference for the same Sprint type),
     * optionally only among deliverables of one format.
     */
    private function closest(Sprint $sprint, ?string $format, float $threshold): ?Deliverable
    {
        if ($this->byToken === null) {
            $this->byToken = [];
            $rows = DB::table('deliverables as d')
                ->leftJoin('deliverable_sprints as x', function ($j) {
                    $j->on('x.deliverable_ref', '=', 'd.ref')->where('x.status', 'not like', 'TBCA generated%');
                })
                ->leftJoin('sprints as s', 's.id', '=', 'x.sprint_id')
                ->where('d.v2_status', 'like', 'NEW%')
                ->get(['d.ref', 'd.name', 'd.sort', 'd.format_detail', 's.type']);
            foreach ($rows as $r) {
                $entry = ['ref' => $r->ref, 'tokens' => self::tokens($r->name), 'type' => $r->type, 'sort' => (int) $r->sort, 'format' => (string) $r->format_detail];
                foreach (array_keys($entry['tokens']) as $t) {
                    $this->byToken[$t][] = $entry;
                }
            }
        }

        $mine = self::tokens($sprint->title);
        if (count($mine) < 2) {
            return null;
        }

        $best = null;
        $bestScore = 0.0;
        $seen = [];
        foreach (array_keys($mine) as $t) {
            foreach ($this->byToken[$t] ?? [] as $c) {
                if (isset($seen[$c['ref']]) || ($format !== null && $c['format'] !== $format)) {
                    continue;
                }
                $seen[$c['ref']] = true;
                $shared = count(array_intersect_key($mine, $c['tokens']));
                $score = $shared / count($mine + $c['tokens']) + ($c['type'] === $sprint->type ? 0.05 : 0);
                if ($score > $bestScore || ($score === $bestScore && $best !== null && $c['sort'] < $best['sort'])) {
                    [$best, $bestScore] = [$c, $score];
                }
            }
        }

        if ($best === null || $bestScore < $threshold) {
            return null;
        }

        if (! isset($this->loaded[$best['ref']])) {
            $model = Deliverable::query()->where('ref', $best['ref'])->first();
            Deliverable::withTexts([$model]);
            $this->loaded[$best['ref']] = $model;
        }

        return $this->loaded[$best['ref']];
    }

    /**
     * The comparable register deliverable for each Sprint type and type|category: the
     * (format, loop, tab, family) combination most often linked to such Sprints, and
     * the first register row with that combination.
     *
     * @return array<string, object>
     */
    private function templates(): array
    {
        $links = DB::table('deliverable_sprints as x')
            ->join('sprints as s', 's.id', '=', 'x.sprint_id')
            ->join('deliverables as d', 'd.ref', '=', 'x.deliverable_ref')
            ->where('x.status', 'not like', 'TBCA generated%')
            ->where('d.v2_status', 'like', 'NEW%')
            ->get(['s.type', 's.category', 'd.ref', 'd.sort', 'd.format_detail', 'd.loop_id', 'd.tab', 'd.family']);

        $pick = function (Collection $g) {
            $combo = $g->groupBy(fn ($r) => "{$r->format_detail}|{$r->loop_id}|{$r->tab}|{$r->family}")
                ->sortBy([fn ($a, $b) => $b->count() <=> $a->count(), fn ($a, $b) => $a->min('sort') <=> $b->min('sort')])
                ->first();

            return $combo->sortBy('sort')->first()->ref;
        };

        $refs = ['*' => DB::table('deliverables')->where('v2_status', 'like', 'NEW%')->where('format_detail', 'Report')->orderBy('sort')->value('ref')];
        foreach ($links->groupBy('type') as $type => $g) {
            $refs[$type] = $pick($g);
        }
        foreach ($links->groupBy(fn ($r) => $r->type.'|'.$r->category) as $key => $g) {
            $refs[$key] = $pick($g);
        }

        // Sprint types the register never links to borrow from the closest type.
        foreach (['core-service' => 'fixed-scope', 'ai-advisory' => 'quote-route', 'premium-service' => 'premium', 'diagnostic' => 'diagnostic', 'training' => 'training'] as $type => $like) {
            $refs[$type] ??= $refs[$like] ?? $refs['*'];
        }

        $models = Deliverable::query()->whereIn('ref', array_unique(array_values($refs)))->get()->keyBy('ref');
        Deliverable::withTexts($models);

        return array_map(fn ($ref) => $models[$ref], $refs);
    }

    private function row(Sprint $s, Deliverable $t, ?object $format): array
    {
        $a = (array) ($s->attributes ?? []);
        $name = trim((string) $s->title);
        $issues = $this->issues($a, $s);
        $topic = trim(preg_replace('/\s+(Sprint|Pack|Programme)$/i', '', $name));
        $keyIssues = $topic.': '.implode('; ', $issues);
        $packages = collect(SprintOffer::packages($s))->keyBy('key');

        $priority = array_slice($issues, 0, max(3, (int) ceil(count($issues) / 2)));
        $tplIssues = $this->listOf((string) $t->key_issues);

        $pkg = fn (string $tier) => $packages[$tier] ?? null;
        $delivery = fn (string $tier) => trim((string) ($pkg($tier)['delivery'] ?? $s->delivery ?? $t->getAttribute("delivery_{$tier}")));
        $price = fn (string $tier) => isset($pkg($tier)['zar']) ? ucfirst($tier).' R'.number_format((int) $pkg($tier)['zar']) : null;
        $packageText = function (string $tier) use ($pkg) {
            $p = $pkg($tier);
            if (! $p) {
                return null;
            }
            $features = array_filter(array_map(fn ($f) => is_string($f) ? $f : ($f['title'] ?? $f['label'] ?? null), (array) ($p['features'] ?? [])));

            return trim(($p['description'] ?? '').($features ? ' | Includes: '.implode('; ', $features) : '')) ?: null;
        };

        $description = trim((string) ($s->description ?: $s->summary ?: ($a['overview'] ?? '')));
        $description = is_string($description) ? $description : $name;
        $problem = $a['client_problem'] ?? $a['hero_problem'] ?? $s->summary ?? null;
        $problem = is_string($problem) ? $problem : (is_array($problem) ? ($problem['text'] ?? $problem['body'] ?? null) : null);

        $benchmark = trim(explode(' For this Sprint:', (string) $t->beyond_benchmark)[0]);
        $aiDepth = trim(explode(' Why not a free AI answer:', (string) $t->ai_depth)[0]);

        return [
            'tab' => $t->tab,
            'family' => $t->family,
            'name' => $name,
            'format_class' => $t->format_class,
            'format_detail' => $t->format_detail,
            'format_code' => $t->format_code,
            'description' => $description !== '' ? $description : $name,
            'key_issues' => $keyIssues,
            'extent_basic' => $this->extent((string) $t->extent_basic, $tplIssues, $priority, (string) $t->key_issues, $keyIssues),
            'extent_standard' => $this->extent((string) $t->extent_standard, $tplIssues, $issues, (string) $t->key_issues, $keyIssues),
            'extent_premium' => $t->text('extent_premium'),
            'pages_basic' => $format->basic ?? $t->pages_basic,
            'pages_standard' => $format->standard ?? $t->pages_standard,
            'pages_premium' => $format->premium ?? $t->pages_premium,
            'page_unit' => $t->page_unit,
            'delivery_basic' => $delivery('basic'),
            'delivery_standard' => $delivery('standard'),
            'delivery_premium' => $delivery('premium'),
            'csat_basic' => $t->csat_basic,
            'csat_standard' => $t->csat_standard,
            'csat_premium' => $t->csat_premium,
            'consulting_standard' => $t->text('consulting_standard'),
            'source' => self::SOURCE." from app Sprint {$s->code}; comparable register deliverable {$t->ref}",
            'linked_sprint_codes' => $s->code,
            'sprint_type' => $t->sprint_type,
            'audience' => $this->audience($s, $a) ?? $t->text('audience'),
            'client_problem' => $problem,
            'package_basic' => $packageText('basic'),
            'package_standard' => $packageText('standard'),
            'package_premium' => $packageText('premium'),
            'companion_assets' => "{$topic} quick-start guide; {$topic} completed example/sample; {$topic} verification/version note; {$topic} 90-second walkthrough specification; {$topic} support/update guide",
            'client_inputs' => $t->text('client_inputs'),
            'exclusions' => $t->text('exclusions'),
            'add_ons' => $t->text('add_ons'),
            'next_offer' => 'Resolved by the Services Resolver at OSS-S17',
            'catalogue_price' => implode(' | ', array_filter([$price('basic'), $price('standard'), $price('premium')])).' · prices shown on the app Sprint page (no market median in the register)',
            'catalogue_delivery' => implode(' | ', [$delivery('basic'), $delivery('standard'), $delivery('premium')]),
            'uplift_basic' => $t->text('uplift_basic'),
            'uplift_standard' => $t->text('uplift_standard'),
            'uplift_premium' => $t->text('uplift_premium'),
            'beyond_benchmark' => $benchmark !== '' ? "{$benchmark} For this Sprint: built around {$topic}." : null,
            'ai_depth' => $aiDepth !== '' ? $aiDepth : null,
            'heygen_layer' => $t->text('heygen_layer'),
            'infogram_layer' => $t->text('infogram_layer'),
            'automation_route' => $t->text('automation_route'),
            'payment_trigger' => $t->text('payment_trigger'),
            'acceptance' => $t->text('acceptance'),
            'safeguards' => $t->safeguards,
            'v2_status' => self::SOURCE,
            'template_ref' => $t->ref,
        ];
    }

    /** Up to 10 issues from the Sprint's own page data. */
    private function issues(array $a, Sprint $s): array
    {
        $out = [];
        $take = function ($list) use (&$out) {
            foreach ((array) $list as $item) {
                $v = is_string($item) ? $item : (is_array($item) ? ($item['title'] ?? $item['label'] ?? $item['name'] ?? null) : null);
                if (! is_string($v)) {
                    continue;
                }
                $v = trim(rtrim(strip_tags($v), '.'));
                if ($v !== '' && mb_strlen($v) <= 120 && ! isset($out[Str::lower($v)])) {
                    $out[Str::lower($v)] = Str::lcfirst($v) === $v ? $v : $this->sentenceCase($v);
                }
            }
        };

        foreach (['included', 'whats_included', 'what_you_receive', 'deliverables', 'final_deliverables', 'deliverables_checklist', 'what_you_get', 'whats_inside', 'inside', 'delivers', 'key_outcomes', 'outcomes', 'scope'] as $key) {
            if (count($out) >= 10) {
                break;
            }
            $take($a[$key] ?? []);
        }
        if (count($out) < 3) {
            $take(collect(SprintOffer::packages($s))->pluck('features')->flatten(1)->all());
        }
        if (count($out) < 3) {
            $take(['current position, objectives and success measures', 'options and recommendation', 'implementation plan and next steps']);
        }

        return array_slice(array_values($out), 0, 10);
    }

    private function sentenceCase(string $v): string
    {
        // Lower-case the first word only when no other word is capitalised (keeps names, acronyms and title-case phrases intact).
        $words = preg_split('/\s+/', $v);
        $rest = array_slice($words, 1);

        return preg_match('/^[A-Z][a-z]+$/', $words[0]) && ! preg_grep('/^[A-Z]/', $rest) ? Str::lcfirst($v) : $v;
    }

    private function audience(Sprint $s, array $a): ?string
    {
        foreach ([$a['ideal_for'] ?? null, $a['audience_text'] ?? null, $a['who_for'] ?? null] as $v) {
            if (is_array($v)) {
                $v = implode('; ', array_filter(array_map(fn ($x) => is_string($x) ? $x : ($x['title'] ?? $x['label'] ?? null), $v)));
            }
            if (is_string($v) && trim($v) !== '') {
                return trim($v);
            }
        }

        $labels = array_filter(array_map(fn ($k) => Taxonomy::audiences()[trim($k)]['label'] ?? null, explode(',', (string) $s->audience)));

        return $labels ? implode('; ', $labels) : null;
    }

    /** @return list<string> */
    private function listOf(string $keyIssues): array
    {
        return DeliveryPlan::issues($keyIssues);
    }

    /** The comparable deliverable's tier wording with its issue list replaced by this Sprint's. */
    private function extent(string $text, array $tplIssues, array $mine, string $tplFull, string $myFull): ?string
    {
        if ($text === '') {
            return null;
        }
        if ($tplFull !== '' && str_contains($text, $tplFull)) {
            $text = str_replace($tplFull, $myFull, $text);
        } else {
            // The wording quotes the first n template issues: swap in the same share of this Sprint's.
            for ($n = count($tplIssues); $n >= 1; $n--) {
                $prefix = implode('; ', array_slice($tplIssues, 0, $n));
                $topic = str_contains($tplFull, ':') ? trim(explode(':', $tplFull, 2)[0]).': ' : '';
                foreach ([$topic.$prefix, $prefix] as $needle) {
                    if ($needle !== '' && str_contains($text, $needle)) {
                        $myTopic = str_contains($myFull, ':') ? trim(explode(':', $myFull, 2)[0]).': ' : '';
                        $text = str_replace($needle, ($needle === $prefix ? '' : $myTopic).implode('; ', $mine), $text);
                        break 2;
                    }
                }
            }
        }

        return preg_replace('/\ball \d+ (issues|components|items|areas|elements)\b/', 'all '.count($mine).' $1', $text);
    }
}
