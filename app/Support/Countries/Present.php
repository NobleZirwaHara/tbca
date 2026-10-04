<?php

namespace App\Support\Countries;

use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\FeeLine;
use App\Models\Countries\Service;
use Illuminate\Support\Collection;

/** Array shapes sent to the Countries pages (see resources/js/types/countries.ts). */
class Present
{
    public static function country(Country $c, ?array $profile = null): array
    {
        $profile ??= CountryResolver::profile($c);

        return [
            'id' => $c->id,
            'iso2' => $c->iso2,
            'iso3' => $c->iso3,
            'slug' => $c->slug,
            'name' => $c->name,
            'region' => $c->region,
            'currency' => $c->currency,
            'income_group' => $c->income_group,
            'programme_status' => $c->programme_status,
            'state' => $c->availability_state,
            'state_label' => AvailabilityState::label($c->availability_state),
            'bucket' => AvailabilityState::bucket($c->availability_state),
            'activated' => AvailabilityState::isActive($c->availability_state),
            'gate_status' => $c->gate_status,
            'evidence_currentness' => $c->evidence_currentness,
            'confidence' => $c->evidence_confidence,
            'confidence_pct' => $c->confidence_pct,
            'last_reviewed' => $c->last_reviewed_at?->format('d M Y'),
            'next_review' => $c->next_review_at?->format('d M Y'),
            'activation_date' => $c->activation_date?->format('d M Y'),
            'release_certificate' => $c->release_certificate_ref,
            'protective_reason' => $c->protective_reason,
            'rcs' => $profile['rcs'],
            'rcs_label' => $profile['rcs_label'],
            'hard_blocks' => $profile['hard_blocks'],
            'price_resolution' => $profile['price_resolution'],
        ];
    }

    public static function brief(Country $c): array
    {
        return ['slug' => $c->slug, 'name' => $c->name, 'iso2' => $c->iso2, 'state' => $c->availability_state, 'state_label' => AvailabilityState::label($c->availability_state), 'bucket' => AvailabilityState::bucket($c->availability_state)];
    }

    public static function service(Service $s, Country $c, array $profile): array
    {
        $r = CountryResolver::service($c, $s, $profile);

        return [
            'code' => $s->code, 'name' => $s->name, 'category' => $s->category, 'summary' => $s->summary,
            'state' => $s->availability_state, 'state_label' => AvailabilityState::label($s->availability_state), 'access' => $s->access,
            'access_type' => $s->access_type, 'commercial_model' => $s->commercial_model, 'timeline' => $s->timeline, 'delivery_model' => $s->delivery_model,
            'price_allowed' => $r['price_allowed'], 'price_zar' => $r['price_zar'], 'route' => $r['route'], 'reasons' => $r['reasons'],
            'quote_permitted' => $r['quote_permitted'], 'eligible' => $r['eligible'],
        ];
    }

    public static function corridor(Corridor $c, ?Collection $countries = null): array
    {
        $res = CorridorResolver::resolve($c, $countries);

        return [
            'code' => $c->code, 'from_iso' => $c->from_iso, 'from_name' => $c->from_name, 'to_iso' => $c->to_iso, 'to_name' => $c->to_name,
            'type' => $c->type, 'purpose' => $c->purpose, 'group' => $c->group_name, 'path_type' => $c->path_type,
            'evidence_status' => $c->evidence_status, 'evidence_items' => $c->evidence_items, 'confidence_pct' => $c->confidence_pct,
            'confidence' => $c->confidence_pct >= 75 ? 'High' : ($c->confidence_pct >= 50 ? 'Medium' : 'Low'),
            'cost_min' => $c->cost_min_zar, 'cost_max' => $c->cost_max_zar, 'time' => $c->time_to_activate, 'risk' => $c->risk,
            'pair_rcs' => $c->pair_rcs, 'featured' => $c->featured, 'resolution' => $res,
        ];
    }

    public static function feeLine(FeeLine $l): array
    {
        return [
            'no' => $l->line_no, 'name' => $l->name, 'description' => $l->description, 'payer' => $l->payer, 'payable_to' => $l->payable_to,
            'jurisdiction' => $l->jurisdiction, 'basis' => $l->basis, 'quantity' => $l->quantity, 'unit' => $l->unit_amount, 'amount' => $l->amount,
            'currency' => $l->currency, 'amount_zar' => $l->amount === null ? null : round($l->amount * $l->fx_to_zar, 2), 'when' => $l->when_payable,
            'evidence' => $l->evidence_ref, 'certainty' => $l->certainty, 'resolver_ref' => $l->resolver_ref, 'status' => $l->status,
        ];
    }

    public const LEDGERS = [
        'T' => ['TBCA Fees', 'TBCA professional fee ledger only. Other economic classes are shown separately in their own ledgers.', 'TBCA', 'T: TBCA Fees Only'],
        'X' => ['External Fees', 'Immutable third-party and government fees payable outside TBCA for the selected corridor.', 'Third parties', 'External Fees Only'],
        'S' => ['Statutory Fees', 'Official statutory fees payable to government authorities in both endpoint countries for the selected corridor.', 'Authorities', 'Statutory Fees Only'],
        'P' => ['Partner Fees', 'Fees payable to verified TBCA Partners and regulated professionals for the selected corridor.', 'Verified partners', 'Partner Fees Only'],
        'D' => ['Data & Licence Fees', 'Fees for data subscriptions, datasets, analytics, databases and software licences used in delivery for the selected corridor.', 'Data licensors', 'Data & Licence Fees Only'],
        'CT-C' => ['Corridor Fees', 'Corridor (pair) specific economics for the selected country pair.', 'Pair-specific recipients', 'Corridor Fees Only'],
    ];

    /**
     * Part 6.2 client display law: each ledger gets its own subtotal only if every
     * included amount is resolved; suppressed lines are excluded and counted.
     * There is deliberately no combined all-ledger total.
     */
    public static function ledgerSummary(Collection $lines): array
    {
        $out = [];
        foreach (array_keys(self::LEDGERS) as $code) {
            $l = $lines->where('ledger', $code);
            $priced = $l->whereNotNull('amount')->where('certainty', '!=', 'suppressed');
            $out[$code] = [
                'code' => $code, 'name' => self::LEDGERS[$code][0], 'lines' => $l->count(),
                'resolved' => $priced->count(), 'suppressed' => $l->count() - $priced->count(),
                'subtotal_zar' => round($priced->sum(fn ($x) => $x->amount * $x->fx_to_zar), 2),
            ];
        }

        return $out;
    }
}
