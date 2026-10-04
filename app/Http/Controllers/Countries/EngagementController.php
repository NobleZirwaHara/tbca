<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\ChangeRequest;
use App\Models\Countries\Engagement;
use App\Models\Order;
use App\Support\Countries\Present;
use App\Support\Countries\ServiceCatalogue;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client market-entry engagement (CT-029 to CT-034) — Track B gates:
 * GATE-CT-05 informed letter acceptance -> GATE-CT-06 verified payment ->
 * delivery (GATE-CT-07) -> closure / next route (GATE-CT-08).
 *
 * quote_requested -> letter_issued -> (changes_requested | declined | letter_accepted)
 *   -> active (only after the order is paid) -> closed | closed_conditional | paused | transferred
 */
class EngagementController extends Controller
{
    private function own(Request $request, Engagement $engagement): void
    {
        abort_unless($engagement->user_id === $request->user()->id || $request->user()->role === 'admin', 403);
    }

    /** GATE-CT-06: entitlement only after verified payment. Settles idempotently on any workspace visit. */
    private function settle(Engagement $engagement): void
    {
        if ($engagement->status === 'letter_accepted' && $engagement->order_reference) {
            $order = Order::where('reference', $engagement->order_reference)->first();
            if ($order?->isPaid()) {
                $workspace = $engagement->workspace ?? [];
                $workspace['activity'] = array_merge([['Payment verified (PV-1) — engagement activated', now()->format('d M Y, H:i')]], $workspace['activity'] ?? []);
                $engagement->update(['status' => 'active', 'activated_at' => now(), 'workspace' => $workspace]);
            }
        }
    }

    private function payload(Engagement $e): array
    {
        $letter = $e->letter ?? [];
        $fees = collect($letter['fees'] ?? []);

        return [
            'reference' => $e->reference, 'status' => $e->status, 'title' => $e->title ?: 'Country Engagement', 'summary' => $e->summary,
            'category' => ServiceCatalogue::category($e->service_category)['name'] ?? $e->service_category, 'request_type' => $e->request_type,
            'contact' => $e->contact, 'letter' => $letter ?: null,
            'ledgers' => $fees->groupBy('ledger')->map(fn ($g, $k) => ['ledger' => $k, 'name' => Present::LEDGERS[$k][0] ?? $k, 'recipient' => Present::LEDGERS[$k][2] ?? '', 'subtotal' => $g->sum('amount'), 'lines' => $g->values()])->values(),
            'subtotal' => $fees->sum('amount'),
            'vat' => (int) round($fees->sum('amount') * 0.15),
            'order_reference' => $e->order_reference,
            'accepted_at' => $e->letter_accepted_at?->format('d M Y'),
            'activated_at' => $e->activated_at?->format('d M Y'),
            'workspace' => $e->workspace,
            'closure' => $e->closure,
            'created' => $e->created_at->format('d M Y'),
        ];
    }

    private function render(string $page, Request $request, Engagement $engagement, array $extra = []): Response
    {
        $this->own($request, $engagement);
        $this->settle($engagement);
        $engagement->refresh();

        return Inertia::render("Countries/Workspace/{$page}", [
            'engagement' => $this->payload($engagement),
            'country' => Present::country($engagement->country->load('domains')),
            ...$extra,
        ]);
    }

    public function index(Request $request): Response
    {
        $list = Engagement::with('country')->where('user_id', $request->user()->id)->latest()->get();

        return Inertia::render('Countries/Workspace/Index', [
            'engagements' => $list->map(fn ($e) => ['reference' => $e->reference, 'title' => $e->title ?: $e->summary, 'status' => $e->status, 'country' => $e->country->name, 'created' => $e->created_at->format('d M Y')]),
        ]);
    }

    public function letter(Request $request, Engagement $engagement): Response|RedirectResponse
    {
        if (! $engagement->letter) {
            $this->own($request, $engagement);

            return redirect("/countries/quote/{$engagement->reference}")->with('error', 'The engagement letter has not been issued yet.');
        }

        return $this->render('Letter', $request, $engagement);
    }

    public function decideLetter(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $data = $request->validate([
            'decision' => ['required', 'in:approve,changes,decline'],
            'note' => ['required_unless:decision,approve', 'nullable', 'string', 'max:1000'],
            'acknowledge_boundary' => ['required_if:decision,approve', 'accepted_if:decision,approve'],
        ], ['acknowledge_boundary.accepted_if' => 'Please acknowledge the professional boundary statement before approving.']);

        if (! in_array($engagement->status, ['letter_issued', 'changes_requested'], true)) {
            return back()->with('error', 'This letter is not awaiting your decision.');
        }

        $letter = $engagement->letter;
        $letter['decision_note'] = $data['note'] ?? null;

        match ($data['decision']) {
            'approve' => $engagement->update(['status' => 'letter_accepted', 'letter_accepted_at' => now(), 'letter' => [...$letter, 'version' => $letter['version'], 'locked' => true]]),
            'changes' => $engagement->update(['status' => 'changes_requested', 'letter' => $letter]),
            'decline' => $engagement->update(['status' => 'declined', 'letter' => $letter]),
        };

        return match ($data['decision']) {
            'approve' => redirect("/countries/workspace/{$engagement->reference}/activate")->with('success', 'Engagement letter accepted — the accepted version is now immutable. Complete payment to activate.'),
            'changes' => back()->with('success', 'Change request sent to your TBCA engagement lead.'),
            'decline' => back()->with('success', 'Engagement letter declined. No obligation has been created.'),
        };
    }

    public function activate(Request $request, Engagement $engagement): Response|RedirectResponse
    {
        if ($engagement->status === 'active') {
            return redirect("/countries/workspace/{$engagement->reference}");
        }

        return $this->render('Activate', $request, $engagement, [
            'order' => $engagement->order_reference ? Order::where('reference', $engagement->order_reference)->first(['reference', 'status', 'total_zar']) : null,
        ]);
    }

    public function pay(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $request->validate([
            'authorise' => ['accepted'], 'accept_terms' => ['accepted'], 'understand_verification' => ['accepted'],
        ]);
        if ($engagement->status !== 'letter_accepted') {
            return back()->with('error', 'Payment is only available after the engagement letter has been accepted (GATE-CT-05).');
        }

        $existing = $engagement->order_reference ? Order::where('reference', $engagement->order_reference)->first() : null;
        if ($existing && $existing->status !== 'failed') {
            return redirect()->route('checkout.show', $existing);
        }

        $lines = collect($engagement->letter['fees'])->map(fn ($f) => [
            'item_type' => 'country-ledger-'.strtolower($f['ledger']),
            'item_code' => $engagement->reference.'-'.$f['ledger'],
            'name' => "Ledger {$f['ledger']} — {$f['label']} ({$f['recipient']})",
            'unit_zar' => (int) $f['amount'],
            'meta' => ['ledger' => $f['ledger'], 'recipient' => $f['recipient']],
        ])->all();

        $order = Checkout::createOrder($lines, $request->user(), 'countries', [
            'return_url' => "/countries/workspace/{$engagement->reference}",
            'title' => 'Country engagement activation — '.$engagement->reference,
            'engagement' => $engagement->reference,
        ]);
        $engagement->update(['order_reference' => $order->reference]);

        return redirect()->route('checkout.show', $order);
    }

    public function workspace(Request $request, Engagement $engagement): Response|RedirectResponse
    {
        $this->own($request, $engagement);
        $this->settle($engagement);
        if (! in_array($engagement->fresh()->status, ['active', 'closed', 'closed_conditional', 'paused', 'transferred'], true)) {
            $fresh = $engagement->fresh();

            return redirect(match (true) {
                $fresh->status === 'letter_accepted' => "/countries/workspace/{$fresh->reference}/activate",
                (bool) $fresh->letter => "/countries/workspace/{$fresh->reference}/letter",
                default => "/countries/quote/{$fresh->reference}",
            });
        }

        return $this->render('Workspace', $request, $engagement);
    }

    public function deliverables(Request $request, Engagement $engagement): Response
    {
        return $this->render('Deliverables', $request, $engagement);
    }

    public function acceptDeliverable(Request $request, Engagement $engagement, int $index): RedirectResponse
    {
        $this->own($request, $engagement);
        $ws = $engagement->workspace;
        abort_unless(isset($ws['deliverables'][$index]), 404);
        if ($ws['deliverables'][$index][2] !== 'completed') {
            return back()->with('error', 'Only completed, human-reviewed deliverables can be accepted.');
        }
        $ws['deliverables'][$index][6] = true;
        $engagement->update(['workspace' => $ws]);

        return back()->with('success', 'Deliverable accepted.');
    }

    public function change(Request $request, Engagement $engagement): Response
    {
        return $this->render('Change', $request, $engagement, [
            'requests' => $engagement->changeRequests()->get()->map(fn (ChangeRequest $c) => [
                'reference' => $c->reference, 'type' => $c->change_type, 'reason' => $c->reason, 'requested_by' => $c->requested_by, 'impact' => $c->impact,
                'status' => $c->status, 'assessment' => $c->assessment, 'reresolution' => $c->reresolution_required, 'date' => $c->created_at->format('d M Y'),
                'desired' => $c->desired_date?->format('d M Y'),
            ]),
        ]);
    }

    public function storeChange(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless($engagement->status === 'active', 403);
        $data = $request->validate([
            'change_type' => ['required', Rule::in(['Scope Change', 'Timeline Change', 'Deliverable Change', 'Assumption Change'])],
            'reason' => ['required', 'string', 'min:15', 'max:1000'],
            'desired_date' => ['nullable', 'date'],
            'impact' => ['required', Rule::in(['Low', 'Medium', 'High'])],
        ]);
        $n = ChangeRequest::count() + 28;
        ChangeRequest::create([...$data, 'reference' => sprintf('CR-%s-%04d', now()->format('Y'), $n), 'engagement_id' => $engagement->id,
            'requested_by' => $request->user()->name, 'status' => 'impact_assessment',
            // Material scope / deliverable changes re-open fee resolution (re-resolution if material).
            'reresolution_required' => in_array($data['change_type'], ['Scope Change', 'Deliverable Change'], true) || $data['impact'] === 'High']);

        return back()->with('success', 'Change request submitted for impact assessment. No change is implemented before written approval.');
    }

    public function decideChange(Request $request, Engagement $engagement, string $reference): RedirectResponse
    {
        $this->own($request, $engagement);
        $cr = $engagement->changeRequests()->where('reference', $reference)->firstOrFail();
        $data = $request->validate(['decision' => ['required', 'in:approve,withdraw']]);
        if ($cr->status !== 'impact_assessment' || ! $cr->assessment) {
            return back()->with('error', 'This change cannot be approved until the impact assessment is complete.');
        }
        $cr->update(['status' => $data['decision'] === 'withdraw' ? 'withdrawn' : ($cr->reresolution_required ? 're_resolution' : 'approved')]);

        return back()->with('success', $data['decision'] === 'withdraw' ? 'Change request withdrawn.' : ($cr->reresolution_required ? 'Change approved by client — fee re-resolution triggered before implementation.' : 'Change approved.'));
    }

    public function closure(Request $request, Engagement $engagement): Response
    {
        return $this->render('Closure', $request, $engagement, ['checklist' => $this->checklist($engagement)]);
    }

    private function checklist(Engagement $e): array
    {
        $ws = $e->workspace ?? [];
        $deliverables = collect($ws['deliverables'] ?? []);
        $invoices = collect($ws['invoices'] ?? []);
        $openChanges = $e->changeRequests()->whereIn('status', ['impact_assessment', 're_resolution'])->count();

        return [
            ['All deliverables accepted by client', 'All accepted deliverables have been acknowledged.', $deliverables->isNotEmpty() && $deliverables->every(fn ($d) => $d[6] ?? false)],
            ['Evidence pack finalised', 'Evidence archived and verified in TBCA repository.', collect($ws['evidence'] ?? [])->every(fn ($r) => $r[4] === 'Verified')],
            ['Outstanding actions', 'No outstanding change requests or client feedback items.', $openChanges === 0],
            ['Financial settlement', 'All invoices paid and no outstanding credits.', $invoices->every(fn ($i) => $i[1] === 'paid')],
            ['Compliance & licence obligations', 'All jurisdictional compliance requirements met or handover scheduled.', true],
            ['Post-engagement support confirmed', 'Client briefed on support channels and continuity options.', (bool) ($ws['closure']['support_confirmed'] ?? false)],
        ];
    }

    public function close(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $data = $request->validate([
            'type' => ['required', 'in:standard,conditional,pause,transfer,confirm_support'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($data['type'] === 'confirm_support') {
            $ws = $engagement->workspace;
            $ws['closure']['support_confirmed'] = true;
            $engagement->update(['workspace' => $ws]);

            return back()->with('success', 'Post-engagement support confirmed.');
        }
        if ($engagement->status !== 'active') {
            return back()->with('error', 'Only an active engagement can be closed, paused or transferred.');
        }
        $pending = collect($this->checklist($engagement))->reject(fn ($c) => $c[2])->pluck(0);
        if ($data['type'] === 'standard' && $pending->isNotEmpty()) {
            return back()->with('error', 'Standard closure needs every required item complete. Pending: '.$pending->implode(', ').'.');
        }

        $status = ['standard' => 'closed', 'conditional' => 'closed_conditional', 'pause' => 'paused', 'transfer' => 'transferred'][$data['type']];
        $engagement->update(['status' => $status, 'closed_at' => in_array($status, ['closed', 'closed_conditional'], true) ? now() : null,
            'closure' => ['type' => $data['type'], 'note' => $data['note'] ?? null, 'pending' => $pending->values(), 'at' => now()->format('d M Y H:i')]]);

        return back()->with('success', match ($status) {
            'closed' => 'Engagement closed. Obligations preserved; records retained for 7 years.',
            'closed_conditional' => 'Conditional closure recorded — outstanding items remain under resolver review.',
            'paused' => 'Engagement paused (AL-2). It can be reactivated later.',
            default => 'Handover to another authorised resolver recorded.',
        });
    }
}
