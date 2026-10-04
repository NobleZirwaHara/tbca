<?php

namespace App\Support\Products\Retainers;

use App\Models\Products\Retainers\Period;
use App\Models\Products\Retainers\Proposal;
use App\Models\Products\Retainers\Retainer;
use App\Models\Products\Retainers\Service;
use App\Models\Products\Retainers\Usage;

/** Shapes Retainers models into the props the React pages expect. */
class Presenter
{
    public static function service(Service $s, bool $full = false): array
    {
        $base = [
            'id' => $s->id,
            'code' => $s->code,
            'slug' => $s->slug,
            'name' => $s->name,
            'category' => $s->category,
            'category_label' => Catalogue::categories()[$s->category] ?? $s->category,
            'desk' => $s->desk,
            'icon' => $s->icon,
            'summary' => $s->summary,
            'price_zar' => $s->price_zar,
            'price_usd' => $s->price_usd,
            'custom_pricing' => $s->custom_pricing,
            'allowance_qty' => $s->allowance_qty,
            'checklist' => $s->checklist ?? array_slice($s->inclusions ?? [], 0, 4),
            'popularity' => $s->popularity,
            'sale_state' => Engine::saleState($s),
        ];

        if (! $full) {
            return $base;
        }

        $register = Catalogue::exclusions();

        return [...$base,
            'description' => $s->description,
            'allowance_unit' => $s->allowance_unit,
            'period' => $s->period,
            'unit_definition' => $s->unit_definition,
            'owner_model' => $s->owner_model,
            'owner_model_label' => Catalogue::ownerModelLabel($s->owner_model),
            'owner' => $s->owner,
            'sla_class' => $s->sla_class,
            'response_window' => $s->response_window,
            'inclusions' => $s->inclusions ?? [],
            'exclusions' => collect($s->exclusions ?? [])->map(fn ($code) => ['code' => $code, ...($register[$code] ?? ['category' => $code])])->values(),
            'unused_rule' => $s->unused_rule,
            'unused_label' => Catalogue::unusedLabel($s->unused_rule, $s->rollover_cap_pct),
            'rollover_cap_pct' => $s->rollover_cap_pct,
            'overage_rule' => $s->overage_rule,
            'overage_rate_zar' => $s->overage_rate_zar,
            'min_term_months' => $s->min_term_months,
            'notice_days' => $s->notice_days,
            'certification' => $s->certification,
        ];
    }

    public static function retainer(Retainer $r): array
    {
        $period = $r->currentPeriod();

        return [
            'id' => $r->id,
            'code' => $r->code,
            'agreement_ref' => $r->agreement_ref,
            'name' => $r->name,
            'client_name' => $r->client_name,
            'status' => $r->status,
            'allowance_qty' => $r->allowance_qty,
            'monthly_fee_zar' => $r->monthly_fee_zar,
            'overage_rate_zar' => $r->overage_rate_zar,
            'rollover_cap_pct' => $r->rollover_cap_pct,
            'carry_label' => Catalogue::unusedLabel($r->service->unused_rule, $r->rollover_cap_pct).' (if unused)',
            'service_level' => $r->service_level,
            'owner_model' => Catalogue::ownerModelLabel($r->owner_model),
            'adviser' => $r->adviser,
            'account_owner' => $r->account_owner,
            'min_term_months' => $r->min_term_months,
            'notice_days' => $r->notice_days,
            'start_date' => $r->start_date?->toDateString(),
            'term_end' => $r->term_end?->toDateString(),
            'cancel_effective' => $r->cancel_effective?->toDateString(),
            'renewal' => $r->renewal,
            'period' => $period ? self::period($period) : null,
            'service_slug' => $r->service->slug,
        ];
    }

    public static function period(Period $p): array
    {
        return ['id' => $p->id, 'starts_on' => $p->starts_on->toDateString(), 'ends_on' => $p->ends_on->toDateString(), 'status' => $p->status, 'opening' => $p->opening_units, 'carry' => $p->carry_units, 'credits' => $p->credit_units, 'carry_out' => $p->carry_out_units, 'statement_ack_at' => $p->statement_ack_at?->toDateTimeString()];
    }

    public static function usage(Usage $u): array
    {
        return [
            'id' => $u->id,
            'reference' => $u->reference,
            'occurred_at' => $u->occurred_at->toDateTimeString(),
            'activity' => $u->activity,
            'description' => $u->description,
            'category' => $u->category,
            'adviser' => $u->adviser,
            'units' => $u->units,
            'original_units' => $u->original_units,
            'billing_effect' => $u->billing_effect,
            'status' => $u->status,
            'evidence_class' => $u->evidence_class,
        ];
    }

    public static function proposal(Proposal $p): array
    {
        $fee = $p->monthly_fee_zar;
        $vat = Catalogue::vatOf($fee);

        return [
            'reference' => $p->reference,
            'agreement_ref' => str_replace('TBCA-PR-', 'TBCA-AGR-', $p->reference),
            'status' => $p->status,
            'hold_reason' => $p->hold_reason,
            'organisation' => $p->organisation,
            'request' => $p->request,
            'allowance_qty' => $p->allowance_qty,
            'monthly_fee_zar' => $fee,
            'vat_zar' => $vat,
            'fee_incl_vat' => $fee + $vat,
            'overage_rate_zar' => $p->overage_rate_zar,
            'rollover_cap_pct' => $p->rollover_cap_pct,
            'service_level' => $p->service_level,
            'owner_model' => Catalogue::ownerModelLabel($p->owner_model),
            'start_date' => $p->start_date?->toDateString(),
            'valid_until' => $p->valid_until?->toDateString(),
            'version' => $p->version,
            'hash' => $p->hash ? substr($p->hash, 0, 12) : null,
            'reserved_units' => $p->reserved_units,
            'reservation_expires_at' => $p->reservation_expires_at?->toDateTimeString(),
            'issued_at' => $p->issued_at?->toDateTimeString(),
            'accepted_at' => $p->accepted_at?->toDateTimeString(),
            'service' => self::service($p->service, true),
        ];
    }
}
