<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Engagement;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\ProtoEngagement as P;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Mandate-stage pages of the prototype (mock-ups 50 to 70): verification scope, external
 * costs, progress and report; market and sector deep dive; project packaging; introduction
 * consent and room; due diligence, deal room and project advisory hand-offs; delivery
 * acceptance; scope change and the case forms; and the transaction ledger. The forms post
 * to POST /aiim/workspace/engagements/{ref}/message with an `action` field (see
 * EngagementController::action()).
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

        return $this->render($request, $component, ['engagement' => EngagementController::props($e), 'country' => P::country($e)] + $extra($e), $context);
    }

    /** Pages 50 Verification Scope, 51 External Cost Approval, 52 Verification Progress and 53 Verification Report. */
    public function verification(Request $request, string $ref, string $view = 'progress'): Response
    {
        abort_unless(in_array($view, ['scope', 'costs', 'progress', 'report'], true), 404);
        $titles = ['scope' => 'Verification Scope', 'costs' => 'External Cost Approval', 'progress' => 'Verification Progress', 'report' => 'Verification Report'];

        return $this->page($request, $ref, 'Aiim/Mandate/Verification', $titles[$view], function (Engagement $e) use ($view, $request) {
            $country = P::country($e);
            $bw = $country && $country['isBw'];
            $v = $e->verification ?? [];
            $hotspots = $bw ? P::hotspots() : [];
            $pick = $request->query('h') !== null ? (int) $request->query('h') : ($v['scope']['hotspot'] ?? 0);
            $hot = $hotspots[$pick] ?? ($hotspots[0] ?? null);

            return [
                'view' => $view,
                'hotspots' => $view === 'scope' ? collect($hotspots)->map(fn ($h) => ['i' => $h['i'], 'name' => $h['name'], 'place' => $h['place']])->all() : [],
                'hotspot' => $hot,
                'scope' => $v['scope'] ?? null,
                'caps' => $v['caps'] ?? null,
                'approvedAt' => $v['approved_at'] ?? null,
                'approvedExternal' => (float) ($v['approved_external'] ?? 0),
                'estimate' => ['base' => P::svc('AAB-EMB-171'), 'counterparty' => P::svc('AAB-EMB-158'), 'sanctions' => P::svc('AAB-EMB-157'), 'esg' => P::svc('AAB-EMB-159')],
                'items' => $e->verificationItems->map(fn ($i) => ['code' => $i->code, 'name' => $i->name, 'status' => $i->status, 'selected' => (bool) $i->selected, 'supplier' => $i->supplier, 'eta' => $i->eta_on?->format('j M Y')])->values(),
                'rail' => P::rail(['AAB-EMB-208', 'AAB-EMB-207'], 'Next', 2),
                'adminRate' => Pricing::EXTERNAL_ADMIN_RATE,
            ];
        });
    }

    /** Page 54 Market and Sector Deep Dive. */
    public function deepDive(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/DeepDive', 'Market and Sector Deep Dive', function (Engagement $e) {
            $country = P::country($e);

            return [
                'sectors' => $country && $country['isBw'] ? P::deepDive() : [],
                'initial' => $e->request['sector_code'] ?? 'ENR',
                'brief' => P::svc('AAB-EMB-123'),
                'rail' => P::rail(['AAB-EMB-116', 'AAB-EMB-120', 'AAB-EMB-121', 'AAB-EMB-122'], 'Embedded services on this page', 4),
            ];
        });
    }

    /** Page 56 Project Packaging Workspace: a service is done once the client has paid for it. */
    public function packaging(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Packaging', 'Project Packaging Workspace', function (Engagement $e) {
            $items = [['Teaser and information memorandum', 'AAB-EMB-201'], ['Financial model', 'AAB-EMB-211'], ['Pre-feasibility study', 'AAB-EMB-210'], ['ESG and development impact assessment', 'AAB-EMB-212'], ['Due diligence checklist pack', 'AAB-EMB-202'], ['Permit pathway confirmed', null], ['Citizen-partner shortlist', 'AAB-EMB-197'], ['Bankability score', 'AAB-EMB-140']];
            $paid = P::paidCodes($e->user, array_filter(array_column($items, 1)));

            return [
                'project' => $e->outcome['opportunity'] ?? $e->packaging['project'][0][1] ?? $e->title,
                'items' => collect($items)->map(fn ($x) => ['title' => $x[0], 'svc' => $x[1] ? P::svc($x[1]) : null, 'done' => $x[1] ? in_array($x[1], $paid, true) : (bool) ($e->packaging['permit_confirmed'] ?? false)])->all(),
                'rail' => P::rail(['AAB-EMB-209', 'AAB-EMB-214'], '', 2),
            ];
        });
    }

    /** Pages 58 Introduction Consent and 59 Introduction Room. */
    public function introductions(Request $request, string $ref, string $view = 'consent'): Response
    {
        abort_unless(in_array($view, ['consent', 'room'], true), 404);

        return $this->page($request, $ref, $view === 'room' ? 'Aiim/Mandate/IntroRoom' : 'Aiim/Mandate/IntroConsent', $view === 'room' ? 'Introduction Room' : 'Introduction Consent', function (Engagement $e) use ($view) {
            $intro = $e->introduction?->load('parties');

            return [
                'intro' => $intro ? [
                    'reference' => $intro->reference, 'project' => $intro->project_name, 'status' => $intro->status,
                    'consented' => $intro->client_consented_at?->format('j M Y, H:i'), 'consentName' => $intro->consent_name,
                    'roomOpen' => $intro->roomOpen(), 'activity' => $intro->activity ?? [],
                    'sharing' => collect($intro->sharing ?? [])->map(fn ($s) => ['label' => $s['label'], 'share' => (bool) $s['share']])->values(),
                    'parties' => $intro->parties->where('selected', true)->map(fn ($p) => $p->only(['name', 'type', 'consent_status', 'engagement_status']) + [
                        // Contact details are released only after both-party consent.
                        'contact' => $intro->client_consented_at && $p->consent_status === 'accepted' ? $p->contact : null,
                    ])->values(),
                ] : null,
                'brief' => P::svc('AAB-EMB-208'),
                'rail' => $view === 'room' ? P::rail(['AAB-EMB-226', 'AAB-EMB-238', 'AAB-EMB-239'], 'Room services', 3) : null,
            ];
        });
    }

    /** Pages 60 Due Diligence, 61 Virtual Deal Room and 62 Project Advisory hand-offs. */
    public function handoff(Request $request, string $ref, string $target): Response
    {
        $meta = [
            'dd' => [60, 'Due Diligence Handoff', 'Due Diligence', 'The deal moves into TBCA Due Diligence with the AIIM evidence attached.', '/due-diligence'],
            'vdr' => [61, 'Virtual Deal Room Handoff', 'Virtual Deal Room', 'Open a secure deal room for documents, Q&A and approvals.', '/virtual-deal-room'],
            'project-advisory' => [62, 'Project Advisory Handoff', 'Project Advisory', 'Project Advisory takes the packaged project to financial close.', '/project-advisory'],
        ];
        abort_unless(isset($meta[$target]), 404);
        [$no, $title, $cat, $lead, $site] = $meta[$target];

        return $this->page($request, $ref, 'Aiim/Mandate/Handoff', $title, function (Engagement $e) use ($target, $no, $title, $cat, $lead, $site) {
            $h = $e->handoffs()->where('target', $target)->first();

            return [
                'target' => $target, 'no' => $no, 'title' => $title, 'cat' => $cat, 'lead' => $lead, 'site' => $site,
                'services' => P::category($cat),
                'handoff' => $h ? ['reference' => $h->reference, 'status' => $h->status, 'packets' => collect($h->packets ?? [])->pluck('name')->values(), 'approved' => $h->approved_at?->format('j M Y, H:i')] : null,
            ];
        });
    }

    /** Page 63 Delivery Acceptance. */
    public function delivery(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Delivery', 'Delivery Acceptance', function (Engagement $e) {
            $names = collect($e->deliverables ?? [])->pluck('name')->filter();
            if ($names->isEmpty()) {
                $names = collect($e->delivery['outputs'] ?? [])->map(fn ($o) => $o[0]);
            }

            return [
                'deliverables' => $names->values(),
                'balance' => round($e->feeExVat() - ($e->deposit_paid_at ? $e->depositExVat() : 0), 2),
                'balancePercent' => 100 - (int) ($e->quote['deposit_percent'] ?? 50),
                'canAccept' => $e->status === 'delivered',
            ];
        });
    }

    /** Pages 64 Scope Change Approval and 65–69 Refund, Dispute, Pause, Restart and Cancellation. */
    public function caseFile(Request $request, string $ref, string $kind): Response
    {
        abort_unless(in_array($kind, ['change', 'refund', 'dispute', 'pause', 'restart', 'cancel'], true), 404);
        $titles = ['change' => 'Scope Change Approval', 'refund' => 'Refund Request', 'dispute' => 'Dispute Case', 'pause' => 'Pause Mandate', 'restart' => 'Restart Mandate', 'cancel' => 'Cancellation'];

        return $this->page($request, $ref, 'Aiim/Mandate/Case', $titles[$kind], function (Engagement $e) use ($kind) {
            $type = ['change' => 'scope-change', 'refund' => 'refund', 'dispute' => 'dispute', 'pause' => 'pause', 'restart' => 'restart', 'cancel' => 'cancellation'][$kind];
            $orders = collect([['value' => $e->mandate_reference ?? $e->reference, 'label' => 'Engagement · '.($e->mandate_reference ?? $e->reference).' · '.$e->title]])
                ->merge($e->ledger()->get()->map(fn ($l) => ['value' => $l->reference, 'label' => "{$l->description} · {$l->reference}"]))->values();

            return [
                'kind' => $kind,
                'orders' => $orders,
                'cases' => $e->cases()->where('type', $type)->get()->map(fn ($c) => ['reference' => $c->reference, 'status' => str_replace('_', ' ', $c->status), 'created' => $c->created_at->format('j M Y'), 'amount' => $c->amount_zar])->values(),
                'services' => $kind === 'change' ? collect(EngagementController::SCOPE_SERVICES)->map(fn ($c) => P::svc($c))->filter()->values() : [],
            ];
        });
    }

    /** Page 70 Transaction Ledger. */
    public function ledger(Request $request, string $ref): Response
    {
        return $this->page($request, $ref, 'Aiim/Mandate/Ledger', 'Transaction Ledger', function (Engagement $e) {
            $rows = $e->ledger()->get();

            return [
                'entries' => $rows->map(fn ($l) => ['reference' => $l->reference, 'date' => $l->posted_at->format('d M Y H:i'), 'type' => $l->type, 'description' => $l->description, 'code' => $l->fee_code, 'category' => $l->category, 'amount' => (float) $l->amount_zar, 'vat' => (float) $l->vat_zar, 'status' => $l->status])->values(),
                'totals' => [
                    'paid' => round($rows->where('type', 'payment')->sum('amount_zar'), 2),
                    'fees' => round($rows->where('type', 'fee')->sum('amount_zar'), 2),
                    'adjustments' => round($rows->where('type', 'adjustment')->sum('amount_zar'), 2),
                ],
                'cases' => $e->cases()->get()->map(fn ($c) => ['reference' => $c->reference, 'type' => $c->type, 'status' => str_replace('_', ' ', $c->status), 'created' => $c->created_at->format('j M Y')])->values(),
                'rail' => P::rail(['AAB-EMB-233', 'AAB-EMB-234'], 'Finance documents', 2),
            ];
        });
    }
}
