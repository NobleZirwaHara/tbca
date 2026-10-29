<?php

namespace App\Support\Deliverables;

use App\Models\Deliverables\Deliverable;
use App\Models\Deliverables\PaymentLoop;
use App\Models\Order;
use App\Models\Sprint;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * What the backend must produce when a Sprint is paid, read from the Registry of
 * Deliverables: the deliverables the Sprint's crosswalk code points to, at the tier
 * bought, and the payment-trigger loop (LOOP-PAY-{family}) that delivers them.
 *
 * Nothing here calls an external system. The plan is written into the
 * order.payment_verified event in the integration ledger, where an orchestrator
 * (the client proposes n8n) can pick it up.
 */
class DeliveryPlan
{
    /** Sprint card data for the "What you will receive" panel. */
    public static function forSprintPage(Sprint $sprint): array
    {
        if (! self::available()) {
            return [];
        }

        $items = Deliverable::forSprint($sprint);
        Deliverable::withTexts($items, ['extent_premium', 'uplift_basic', 'uplift_standard', 'uplift_premium']);

        return $items->map(fn (Deliverable $d) => [
            'ref' => $d->ref,
            'name' => $d->name,
            'format' => $d->format_class,
            'formatDetail' => $d->format_detail,
            'description' => $d->description,
            'keyIssues' => self::issues($d->key_issues),
            'pageUnit' => $d->page_unit,
            'tiers' => collect(Deliverable::TIERS)->mapWithKeys(fn ($t) => [$t => [
                'extent' => $d->text("extent_{$t}"),
                'pages' => $d->getAttribute("pages_{$t}"),
                'delivery' => $d->getAttribute("delivery_{$t}"),
            ]])->all(),
        ])->values()->all();
    }

    /**
     * The delivery plan for a paid order: one entry per Sprint line with the
     * deliverables and the loop that applies. Lines with no register entry are
     * listed with an empty deliverable set so nothing is silently dropped.
     *
     * @return array{register: string, lines: list<array<string, mixed>>}|null
     */
    public static function forOrder(Order $order): ?array
    {
        try {
            if (! self::available()) {
                return null;
            }

            $lines = [];
            foreach ($order->items()->where('item_type', 'sprint')->get() as $item) {
                $sprint = Sprint::query()->where('code', $item->item_code)->first();
                $tier = Deliverable::normaliseTier($item->variant);
                $deliverables = $sprint ? Deliverable::forSprint($sprint) : self::byCode((string) $item->item_code);
                Deliverable::withTexts($deliverables, ['payment_trigger', 'extent_premium']);

                $loopIds = $deliverables->pluck('loop_id')->filter()->unique()->values();
                $loops = PaymentLoop::query()->whereIn('loop_id', $loopIds)->orderBy('sort')->get();

                $lines[] = [
                    'item_code' => $item->item_code,
                    'register_code' => $sprint?->register_id,
                    'tier' => $tier,
                    'deliverables' => $deliverables->map(fn (Deliverable $d) => [
                        'ref' => $d->ref,
                        'name' => $d->name,
                        'format' => $d->format_class,
                        'format_code' => $d->format_code,
                        'pages' => $d->getAttribute("pages_{$tier}"),
                        'page_unit' => $d->page_unit,
                        'delivery' => $d->getAttribute("delivery_{$tier}"),
                        'csat_min' => $d->getAttribute("csat_{$tier}"),
                        'loop_id' => $d->loop_id,
                        'owner_blueprint' => $d->owner_blueprint,
                        'trigger' => $d->trigger(),
                        'safeguards' => $d->safeguardCodes(),
                    ])->values()->all(),
                    'loops' => $loops->map(fn (PaymentLoop $l) => [
                        'loop_id' => $l->loop_id,
                        'family' => $l->family,
                        'owning_blueprint' => $l->owning_blueprint,
                    ])->values()->all(),
                    'workflow' => $deliverables->first()?->workflowSteps() ?? [],
                ];
            }

            return $lines === [] ? null : ['register' => 'MP-DEL-2.0', 'lines' => $lines];
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    /** Deliverables for a code that is not a Sprint record (looked up in the crosswalk directly). */
    private static function byCode(string $code)
    {
        return Deliverable::query()
            ->whereIn('ref', fn ($q) => $q->select('deliverable_ref')->from('deliverable_sprints')->where('sprint_code', $code))
            ->orderBy('sort')->get();
    }

    /** @return list<string> */
    public static function issues(?string $text): array
    {
        if ($text === null || trim($text) === '') {
            return [];
        }

        // "Topic: a; b; c" lists the issues after the topic label.
        if (preg_match('/^[^;:]{1,80}:\s(.+)$/s', $text, $m)) {
            $text = $m[1];
        }

        return array_values(array_filter(array_map('trim', explode(';', $text))));
    }

    private static function available(): bool
    {
        static $ok = false;

        return $ok = $ok || (Schema::hasTable('deliverables') && Schema::hasTable('deliverable_sprints'));
    }
}
