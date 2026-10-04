<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Engagement;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\SeedData;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Mandate-stage screens (stages 7–15): verification, deep dive, packaging,
 * introductions, handoffs, delivery acceptance, scope change, refund, dispute,
 * pause / restart / cancel and the transaction ledger.
 *
 * TODO backend: these are read-only GET renders built from the engagement's
 * stored records. The POST actions (approve scope / external costs, grant
 * consent, approve handoff, accept delivery, submit refund / dispute / pause /
 * restart / cancellation, approve scope change) still need implementing.
 */
class MandateController extends AiimController
{
    private function engagement(Request $request, string $ref): Engagement
    {
        $e = Engagement::query()->where('reference', $ref)->orWhere('mandate_reference', $ref)->with('advisor', 'user')->firstOrFail();
        abort_unless($e->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        return $e;
    }

    private function page(Request $request, string $ref, string $component, string $context, callable $extra): Response
    {
        $e = $this->engagement($request, $ref);

        return $this->render($request, $component, ['engagement' => EngagementController::props($e)] + $extra($e), $context);
    }

    // TODO backend: POST scope selection, POST external-cost approval (G9, 10% tolerance), staff progress updates.
    public function verification(Request $request, string $ref, string $view = 'progress'): Response
    {
        abort_unless(in_array($view, ['scope', 'costs', 'progress', 'report'], true), 404);

        return $this->page($request, $ref, 'Aiim/Mandate/Verification', 'Verification', function (Engagement $e) use ($view) {
            $items = $e->verificationItems;

            return [
                'view' => $view,
                'items' => $items->map(fn ($i) => $i->only(['code', 'name', 'description', 'recommendation', 'selected', 'supplier', 'purpose', 'basis', 'supplier_cost_zar', 'expert_fee_zar', 'timeline', 'cost_approved', 'status', 'owner', 'confidence', 'material_issues']) + ['started' => $i->started_on?->format('d M Y'), 'eta' => $i->eta_on?->format('d M Y')])->values(),
                'scope' => Pricing::verification($items),
                'approved' => Pricing::verification($items, true),
                'adminRate' => Pricing::EXTERNAL_ADMIN_RATE,
                'tolerance' => Pricing::EXTERNAL_TOLERANCE,
            ];
        });
    }

    public function deepDive(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/DeepDive', 'Deep Dive', fn (Engagement $e) => ['data' => $e->deep_dive ?? SeedData::deepDive()]);
    }

    public function packaging(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Packaging', 'Project Packaging', fn (Engagement $e) => ['data' => $e->packaging ?? SeedData::packaging()]);
    }

    // TODO backend: POST client consent (G10), staff records counterparty consent; room opens on both.
    public function introductions(Request $request, string $ref, string $view = 'consent'): Response
    {
        return $this->page($request, $ref, $view === 'room' ? 'Aiim/Mandate/IntroRoom' : 'Aiim/Mandate/IntroConsent', 'Introductions', function (Engagement $e) {
            $intro = $e->introduction?->load('parties');

            return [
                'intro' => $intro ? [
                    'reference' => $intro->reference, 'project' => $intro->project_name, 'projectInfo' => $intro->project, 'sharing' => $intro->sharing,
                    'status' => $intro->status, 'consented' => $intro->client_consented_at?->format('j M Y, H:i'), 'consentName' => $intro->consent_name,
                    'roomOpen' => $intro->roomOpen(), 'activity' => $intro->activity ?? [],
                    'parties' => $intro->parties->map(fn ($p) => $p->only(['id', 'name', 'type', 'focus', 'stage', 'fit_score', 'location', 'selected', 'consent_status', 'engagement_status']) + [
                        'responded' => $p->responded_at?->format('j M Y'),
                        // Contact details are released only after both-party consent.
                        'contact' => $intro->client_consented_at && $p->consent_status === 'accepted' ? $p->contact : null,
                    ])->values(),
                ] : null,
            ];
        });
    }

    // TODO backend: POST approve / request changes / save (G11 DD, G12 VDR, G13 Project Advisory).
    public function handoff(Request $request, string $ref, string $target): Response
    {
        abort_unless(in_array($target, ['dd', 'vdr', 'project-advisory'], true), 404);

        return $this->page($request, $ref, 'Aiim/Mandate/Handoff', 'Handoff', function (Engagement $e) use ($target) {
            $h = $e->handoffs()->where('target', $target)->first();

            return ['target' => $target, 'handoff' => $h ? ['reference' => $h->reference, 'status' => $h->status, 'packets' => $h->packets, 'summary' => $h->summary, 'approved' => $h->approved_at?->format('j M Y, H:i'), 'requested' => $h->created_at->format('d M Y H:i')] : null];
        });
    }

    // TODO backend: POST accept delivery (G5) -> balance order; request changes; raise query.
    public function delivery(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Delivery', 'Delivery Acceptance', fn (Engagement $e) => ['delivery' => $e->delivery ?? SeedData::delivery(), 'deliveredOn' => now()->subDay()->format('j M Y H:i'), 'window' => now()->addDays(6)->format('j M Y')]);
    }

    // TODO backend: POST for each case type (scope-change approval with payment, refund calc, dispute, pause, restart, cancellation settlement).
    public function caseFile(Request $request, string $ref, string $kind): Response
    {
        abort_unless(in_array($kind, ['change', 'refund', 'dispute', 'pause', 'restart', 'cancel'], true), 404);

        return $this->page($request, $ref, 'Aiim/Mandate/Case', ucfirst($kind), function (Engagement $e) use ($kind) {
            $type = ['change' => 'scope-change', 'refund' => 'refund', 'dispute' => 'dispute', 'pause' => 'pause', 'restart' => 'restart', 'cancel' => 'cancellation'][$kind];
            $case = $e->cases()->where('type', $type)->first();
            $paidEx = $e->deposit_paid_at ? $e->depositExVat() : 0;
            $earned = round($e->feeExVat() * $e->progress / 100, 2);
            $committed = round((float) ($e->verification['approved_external'] ?? 0) * (1 + Pricing::EXTERNAL_ADMIN_RATE), 2);

            return [
                'kind' => $kind,
                'case' => $case ? ['reference' => $case->reference, 'status' => $case->status, 'payload' => $case->payload, 'amount' => $case->amount_zar, 'created' => $case->created_at->format('j M Y H:i')] : null,
                'scopeChange' => $kind === 'change' ? ($case?->payload ?? SeedData::scopeChange()) : null,
                // Blueprint GAP-018: earned work and committed supplier cost are retained; only unearned paid fees are refundable.
                'settlement' => [
                    'paidEx' => $paidEx, 'paidIncl' => round($paidEx * 1.15, 2), 'earnedPct' => $e->progress, 'earned' => $earned,
                    'committed' => $committed, 'refundableEx' => max(0, round($paidEx - $earned - $committed, 2)),
                ],
            ];
        });
    }

    public function ledger(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Ledger', 'Transaction Ledger', function (Engagement $e) {
            $rows = $e->ledger()->get();

            return [
                'entries' => $rows->map(fn ($l) => ['reference' => $l->reference, 'date' => $l->posted_at->format('d M Y H:i'), 'type' => $l->type, 'description' => $l->description, 'code' => $l->fee_code, 'category' => $l->category, 'amount' => $l->amount_zar, 'vat' => $l->vat_zar, 'status' => $l->status, 'document' => $l->document])->values(),
                'totals' => [
                    'paid' => round($rows->where('type', 'payment')->sum('amount_zar'), 2),
                    'vat' => round($rows->where('type', 'payment')->sum('vat_zar'), 2),
                    'expert' => round($rows->where('category', 'Expert Fee')->sum('amount_zar'), 2),
                    'external' => round($rows->where('category', 'External Cost')->sum('amount_zar'), 2),
                    'platform' => round($rows->where('category', 'Platform Fee')->sum('amount_zar'), 2),
                    'adjustments' => round($rows->where('type', 'adjustment')->sum('amount_zar'), 2),
                ],
            ];
        });
    }
}
