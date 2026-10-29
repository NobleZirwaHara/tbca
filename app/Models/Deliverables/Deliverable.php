<?php

namespace App\Models\Deliverables;

use App\Models\Sprint;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One deliverable from the client's Registry of Deliverables (MP-DEL-2.0): what the
 * client receives, its depth and page count per tier (Basic, Standard, Premium),
 * the payment trigger and workflow that start delivery, the consultancy benchmark
 * and the automated safeguards that apply.
 *
 * Long register texts that repeat across many deliverables are held once in
 * deliverable_texts. Call Deliverable::withTexts($items) once for a set of records,
 * then read them with $deliverable->text('heygen_layer').
 */
#[Unguarded]
class Deliverable extends Model
{
    public const TIERS = ['basic', 'standard', 'premium'];

    /** Register columns held in deliverable_texts (column "{field}_text_id"). */
    public const POOLED = [
        'extent_premium', 'consulting_standard', 'audience', 'client_inputs', 'exclusions', 'add_ons',
        'next_offer', 'catalogue_price', 'catalogue_delivery', 'uplift_basic', 'uplift_standard',
        'uplift_premium', 'heygen_layer', 'infogram_layer', 'automation_route', 'payment_trigger', 'acceptance',
    ];

    /** Every register column (A to AW) in workbook order, with the client's heading. */
    public const COLUMNS = [
        'ref' => 'Ref',
        'tab' => 'WebApp Tab',
        'family' => 'Sub-tab / Family',
        'name' => 'Deliverable',
        'format_class' => 'Format (11 classes)',
        'format_detail' => 'Format detail',
        'description' => 'Description of the deliverable',
        'key_issues' => 'Key issues to be included',
        'extent_basic' => 'Extent of detail — BASIC Sprint',
        'extent_standard' => 'Extent of detail — STANDARD Sprint',
        'extent_premium' => 'Extent of detail — PREMIUM Sprint',
        'pages_basic' => 'No. of pages — Basic',
        'pages_standard' => 'No. of pages — Standard',
        'pages_premium' => 'No. of pages — Premium',
        'page_unit' => 'Page unit',
        'delivery_basic' => 'Delivery — Basic',
        'delivery_standard' => 'Delivery — Standard',
        'delivery_premium' => 'Delivery — Premium',
        'csat_basic' => 'CSAT SLA — Basic (min)',
        'csat_standard' => 'CSAT SLA — Standard (min)',
        'csat_premium' => 'CSAT SLA — Premium (min)',
        'consulting_standard' => 'Consulting standard applied',
        'source' => 'Source of the deliverable',
        'linked_sprint_codes' => 'Linked / source Sprint code(s)',
        'sprint_type' => 'Sprint type (catalogue)',
        'audience' => 'Who it is for',
        'client_problem' => 'Client problem solved',
        'package_basic' => 'Catalogue package — Basic',
        'package_standard' => 'Catalogue package — Standard',
        'package_premium' => 'Catalogue package — Premium',
        'companion_assets' => 'Companion assets',
        'client_inputs' => 'Client inputs required',
        'exclusions' => 'Exclusions',
        'add_ons' => 'Add-ons',
        'next_offer' => 'Next best offer / upsell',
        'catalogue_price' => 'Catalogue price B | S | P (ZAR, VAT excl.) and market median',
        'catalogue_delivery' => 'Catalogue delivery time B | S | P',
        'uplift_basic' => 'V2 depth uplift — Basic',
        'uplift_standard' => 'V2 depth uplift — Standard',
        'uplift_premium' => 'V2 depth uplift — Premium',
        'beyond_benchmark' => 'Beyond-benchmark value (the wow)',
        'ai_depth' => 'AI depth — agents, agentic AI, RPA, human',
        'heygen_layer' => 'HeyGen video layer — Basic | Standard | Premium',
        'infogram_layer' => 'Infogram visual layer — Basic | Standard | Premium',
        'automation_route' => 'Automation route (AAI NOW Bible)',
        'payment_trigger' => 'Payment-triggered delivery loop (no manual start)',
        'acceptance' => 'Measurable acceptance parameters',
        'safeguards' => 'Automated safeguards (see Safeguards sheet)',
        'v2_status' => 'V2 status',
    ];

    /** @var array<string, string|null> resolved pooled texts */
    private array $resolvedTexts = [];

    private bool $textsLoaded = false;

    protected function casts(): array
    {
        return [
            'csat_basic' => 'float',
            'csat_standard' => 'float',
            'csat_premium' => 'float',
        ];
    }

    public function crosswalk(): HasMany
    {
        return $this->hasMany(DeliverableSprint::class, 'deliverable_ref', 'ref');
    }

    public static function normaliseTier(?string $tier): string
    {
        $tier = strtolower((string) $tier);

        return in_array($tier, self::TIERS, true) ? $tier : 'standard';
    }

    /**
     * Resolve the pooled texts for a set of deliverables with one query.
     *
     * @template T of iterable<Deliverable>
     *
     * @param  T  $items
     * @return T
     */
    public static function withTexts(iterable $items, ?array $fields = null): iterable
    {
        $fields ??= self::POOLED;
        $ids = [];
        foreach ($items as $d) {
            foreach ($fields as $f) {
                if ($id = $d->getAttribute("{$f}_text_id")) {
                    $ids[$id] = true;
                }
            }
        }

        $bodies = $ids === [] ? [] : DeliverableText::query()->whereIn('id', array_keys($ids))->pluck('body', 'id')->all();

        foreach ($items as $d) {
            foreach ($fields as $f) {
                $id = $d->getAttribute("{$f}_text_id");
                $d->resolvedTexts[$f] = $id ? ($bodies[$id] ?? null) : null;
            }
            $d->textsLoaded = true;
        }

        return $items;
    }

    /** A register column by its field name, pooled or not. */
    public function text(string $field): ?string
    {
        if (! in_array($field, self::POOLED, true)) {
            $v = $this->getAttribute($field);

            return $v === null ? null : (string) $v;
        }

        if (! array_key_exists($field, $this->resolvedTexts)) {
            if ($this->textsLoaded) {
                $id = $this->getAttribute("{$field}_text_id");
                $this->resolvedTexts[$field] = $id ? DeliverableText::query()->whereKey($id)->value('body') : null;
            } else {
                self::withTexts([$this]);
            }
        }

        return $this->resolvedTexts[$field] ?? null;
    }

    /** Every register column, keyed by field name, with the client's text as written. */
    public function register(): array
    {
        $out = [];
        foreach (array_keys(self::COLUMNS) as $field) {
            $out[$field] = $this->text($field);
        }

        return $out;
    }

    /** What the client receives at one tier. */
    public function tier(?string $tier): array
    {
        $tier = self::normaliseTier($tier);

        return [
            'tier' => $tier,
            'extent' => $this->text("extent_{$tier}"),
            'pages' => $this->getAttribute("pages_{$tier}"),
            'page_unit' => $this->page_unit,
            'delivery' => $this->getAttribute("delivery_{$tier}"),
            'csat_min' => $this->getAttribute("csat_{$tier}"),
            'uplift' => $this->text("uplift_{$tier}"),
            'video' => self::tierPart($this->text('heygen_layer'), $tier),
            'visuals' => self::tierPart($this->text('infogram_layer'), $tier),
        ];
    }

    /** The trigger that starts delivery: the text before the first arrow of the payment-triggered loop. */
    public function trigger(): ?string
    {
        $text = $this->text('payment_trigger');

        return $text === null ? null : trim(explode('→', $text, 2)[0]);
    }

    /** @return list<string> the workflow after the trigger, one step per arrow */
    public function workflowSteps(): array
    {
        $text = $this->text('payment_trigger');
        if ($text === null) {
            return [];
        }

        return array_values(array_filter(array_map('trim', array_slice(explode('→', $text), 1))));
    }

    /** @return list<string> */
    public function safeguardCodes(): array
    {
        preg_match_all('/SG-\d{2}/', (string) $this->safeguards, $m);

        return array_values(array_unique($m[0]));
    }

    /** The part of a "BASIC: ... | STANDARD: ... | PREMIUM: ..." text that belongs to one tier. */
    public static function tierPart(?string $text, string $tier): ?string
    {
        if ($text === null) {
            return null;
        }
        if (preg_match('/'.strtoupper($tier).':\s*(.*?)(?=\s\|\s(?:BASIC|STANDARD|PREMIUM):|$)/s', $text, $m)) {
            return trim($m[1]);
        }

        return $text;
    }

    /**
     * Deliverables linked to a Sprint through the Sprint Crosswalk, matched on the
     * Sprint's code and on its register_id (older records carry the register code there).
     *
     * @return Collection<int, Deliverable>
     */
    public static function forSprint(Sprint $sprint): Collection
    {
        $codes = array_values(array_unique(array_filter([$sprint->code, $sprint->register_id])));
        if ($codes === []) {
            return new Collection;
        }

        $refs = DeliverableSprint::query()->whereIn('sprint_code', $codes)->pluck('deliverable_ref')->unique()->all();

        return $refs === [] ? new Collection : self::query()->whereIn('ref', $refs)->orderBy('sort')->get();
    }
}
