<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Charge;
use App\Models\DealRoom\CommercialRequest;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Billing;
use App\Support\DealRoom\Pricing;
use App\Support\DealRoom\Requests;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Commercial actions: quote, scope, engagement, deposit, payments and commercial requests. */
class CommercialActionController extends Controller
{
    use LoadsRoom;

    protected function flag(Room $room, array $values): void
    {
        $room->update(['commercial' => [...($room->commercial ?? []), ...$values]]);
    }

    public function quote(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::stage($room, 'B')->status === 'completed', 423);
        $data = $request->validate(['decision' => ['required', Rule::in(['accept', 'decline', 'changes'])], 'note' => ['required_if:decision,changes', 'nullable', 'string', 'max:500']]);
        $q = Pricing::quote($room);

        if ($data['decision'] === 'accept') {
            $this->flag($room, ['quote_accepted_at' => now()->toIso8601String(), 'quote_reference' => $q['reference'], 'quote_total' => $q['grandTotal'], 'quote_declined_at' => null]);
            Audit::log($room, 'quote.accepted', "Formal quotation {$q['reference']} accepted (R".number_format($q['grandTotal']).')');

            return redirect()->route('deal-room.commercial', [$room, 'fee-breakdown'])->with('success', 'Quotation accepted. Review the fee breakdown.');
        }
        if ($data['decision'] === 'decline') {
            $this->flag($room, ['quote_declined_at' => now()->toIso8601String(), 'quote_accepted_at' => null]);
            Audit::log($room, 'quote.declined', "Formal quotation {$q['reference']} declined");

            return back()->with('success', 'Quotation declined. TBCA will contact you; the room stays at Stage C.');
        }
        $this->flag($room, ['quote_changes' => $data['note']]);
        Audit::log($room, 'quote.changes_requested', 'Quotation changes requested: '.str($data['note'])->limit(80));

        return back()->with('success', 'Change request sent to your TBCA deal advisor.');
    }

    public function feeAck(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_if(empty($room->commercial['quote_accepted_at'] ?? null), 423);
        $this->flag($room, ['fee_ack_at' => now()->toIso8601String()]);
        Audit::log($room, 'quote.fee_acknowledged', 'Fee breakdown acknowledged (pricing basis disclosed)');

        return redirect()->route('deal-room.commercial', [$room, 'scope-acceptance'])->with('success', 'Fee breakdown acknowledged.');
    }

    public function scope(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_if(empty($room->commercial['fee_ack_at'] ?? null), 423);
        $data = $request->validate(['signatory' => ['required', 'string', 'max:120'], 'signatory_role' => ['required', 'string', 'max:80'], 'accept' => ['accepted']], ['accept.accepted' => 'Tick the acceptance box to authorise the mandate.']);
        $this->flag($room, ['scope_accepted_at' => now()->toIso8601String(), 'signatory' => $data['signatory'], 'signatory_role' => $data['signatory_role']]);
        Audit::log($room, 'scope.accepted', "Scope of work accepted by {$data['signatory']} ({$data['signatory_role']})");

        return redirect()->route('deal-room.commercial', [$room, 'engagement-acceptance'])->with('success', 'Scope accepted and mandate authorised.');
    }

    public function engagement(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_if(empty($room->commercial['scope_accepted_at'] ?? null), 423);
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Confirm you accept the mandate, disclosures, fees and engagement terms.']);
        $this->flag($room, ['engagement_signed_at' => now()->toIso8601String(), 'ai_disclosure_at' => now()->toIso8601String(), 'popia_at' => now()->toIso8601String()]);
        Audit::log($room, 'mandate.signed', 'Engagement pack signed; AI disclosure and POPIA notice accepted');

        if (! $room->charges()->where('kind', 'deposit')->whereNotIn('status', ['cancelled'])->exists()) {
            Billing::issue($room, 'deposit', 'Activation deposit — mandate activation and Stage 0 entitlement', Pricing::depositLines(), 'C');
            Audit::log($room, 'deposit.requested', 'Deposit invoice issued');
        }

        return redirect()->route('deal-room.commercial', [$room, 'deposit-checkout'])->with('success', 'Engagement signed. The deposit invoice is now active.');
    }

    /** Pay a charge through the shared checkout (deposit, stage fees, overage, change, third party, closing, renewal, retries). */
    public function pay(Request $request, Room $room, Charge $charge): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless($charge->room_id === $room->id, 404);
        if ($charge->kind === 'archive_renewal') {
            $pending = $room->approvals()->where('subject', 'renewal')->where('status', '!=', 'approved')->count();
            if ($pending) {
                throw ValidationException::withMessages(['charge' => 'Renewal approvals must be recorded before payment.']);
            }
        }
        $back = $request->input('return', route('deal-room.billing', [$room, 'payment-confirmation'], false).'?charge='.$charge->id);

        return Billing::pay($room, [$charge], $request->user(), str_starts_with($back, '/virtual-deal-room/') ? $back : '/virtual-deal-room/rooms/'.$room->slug);
    }

    /** Return target for every VDR order. */
    public function returned(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $to = (string) $request->query('to', '');
        $room->refresh();

        return redirect(str_starts_with($to, '/virtual-deal-room/') ? $to : route('deal-room.rooms.show', $room))->with('success', 'Payment received and reconciled.');
    }

    /** Statement balance: pay every unpaid invoice in one order. */
    public function payStatement(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $unpaid = $room->charges()->whereIn('status', ['issued', 'awaiting_payment', 'failed'])->where('total_zar', '>', 0)->get();
        if ($unpaid->isEmpty()) {
            return back()->with('error', 'There is no outstanding balance on this statement.');
        }
        $room->stateSet('statement.'.now()->format('Y-m'), now()->toIso8601String());
        $room->save();
        Audit::log($room, 'statement.approved', 'Monthly statement approved by client');

        return Billing::pay($room, $unpaid->all(), $request->user(), route('deal-room.commercial', [$room, 'monthly-statement'], false));
    }

    public function closing(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::stage($room, '13')->status === 'completed', 423, 'The closing invoice is issued after signing and financial close.');
        $charge = $room->charges()->where('kind', 'closing')->latest('id')->first()
            ?? Billing::issue($room, 'closing', 'Closing invoice — mandate completion', Pricing::closingLines(), null, [], 14);

        return Billing::pay($room, [$charge], $request->user(), route('deal-room.commercial', [$room, 'closing-invoice'], false));
    }

    public function subscription(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate(['action' => ['required', Rule::in(['start', 'cancel', 'auto_renew'])]]);
        abort_unless(Workflow::stage($room, '13')->status === 'completed', 423);

        if ($data['action'] === 'start') {
            $charge = $room->charges()->where('kind', 'subscription')->whereIn('status', ['issued', 'awaiting_payment', 'failed'])->first()
                ?? Billing::issue($room, 'subscription', 'Post-close Enterprise subscription (annual)', [['category' => 'TBCA Platform Fee', 'item' => 'Enterprise subscription — 12 months', 'provider' => 'TBCA Platform', 'net' => Pricing::SUBSCRIPTION_NET]]);

            return Billing::pay($room, [$charge], $request->user(), route('deal-room.commercial', [$room, 'post-close-subscription'], false));
        }
        $sub = $room->stateGet('subscription');
        abort_unless($sub, 422);
        $sub = $data['action'] === 'cancel' ? [...$sub, 'status' => 'cancelled', 'auto_renew' => false] : [...$sub, 'auto_renew' => ! ($sub['auto_renew'] ?? true)];
        $room->stateSet('subscription', $sub);
        $room->save();
        Audit::log($room, 'subscription.'.$data['action'], 'Subscription updated: '.$data['action']);

        return back()->with('success', 'Subscription updated.');
    }

    /** Overage decision: approve exact overage or upgrade plan; becomes a request needing payer + finance approval. */
    public function overage(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate(['option' => ['required', Rule::in(['overage', 'growth_plus', 'enterprise'])]]);
        if ($room->requests()->where('type', 'overage')->whereIn('status', ['submitted'])->exists()) {
            return back()->with('error', 'An overage decision is already awaiting approval.');
        }
        $usage = Usage::summary($room);
        $lines = collect($usage['rows'])->where('charge', '>', 0)->map(fn ($r) => ['label' => $r['label'], 'qty' => $r['projectedOverage'], 'unit' => $r['unit'], 'rate' => $r['rate'], 'charge' => $r['charge']])->values()->all();
        if ($data['option'] === 'overage' && ! $lines) {
            return back()->with('error', 'No projected overage to approve.');
        }
        $amount = $data['option'] === 'overage' ? $usage['projectedOverage'] : Pricing::upgradePlans()[$data['option']]['monthly'];
        $req = Requests::create($room, 'overage', ['option' => $data['option'], 'lines' => $lines], $amount, $request->user()->name);

        return back()->with('success', "Overage decision {$req->reference} submitted for payer and finance approval.");
    }

    public function change(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $rules = ['reason' => ['required', 'string', 'max:500'], 'legal_support' => ['boolean'], 'timing_days' => ['nullable', 'integer', 'min:0', 'max:120']];
        foreach (array_keys(Pricing::changeRates()) as $k) {
            $rules["increments.$k"] = ['nullable', 'integer', 'min:0', 'max:100000'];
        }
        $data = $request->validate($rules);
        $inc = array_filter(array_map('intval', $data['increments'] ?? []));
        if (! $inc && empty($data['legal_support'])) {
            throw ValidationException::withMessages(['increments' => 'Propose at least one change.']);
        }
        $fees = Pricing::changeFees($inc, (bool) ($data['legal_support'] ?? false));
        $req = Requests::create($room, 'change', [
            'reason' => $data['reason'], 'increments' => $inc, 'legal_support' => (bool) ($data['legal_support'] ?? false), 'fees' => $fees,
            'baseline' => Usage::allowances($room), 'timing_days' => $data['timing_days'] ?? 10,
        ], $fees['total'], $request->user()->name);

        return back()->with('success', "Change request {$req->reference} submitted (incremental R".number_format($fees['total']).' incl. VAT). Entitlement activates after approval and payment.');
    }

    public function thirdParty(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:120'], 'service' => ['required', 'string', 'max:160'], 'workstream' => ['required', 'string', 'max:120'],
            'business_need' => ['required', 'string', 'max:300'], 'scope_window' => ['nullable', 'string', 'max:60'], 'quote_ref' => ['nullable', 'string', 'max:40'],
            'supplier' => ['required', 'integer', 'min:1'], 'transfer' => ['nullable', 'integer', 'min:0'], 'disbursement' => ['nullable', 'integer', 'min:0'], 'tax' => ['nullable', 'integer', 'min:0'],
        ]);
        $costs = Pricing::thirdParty($data['supplier'], $data['transfer'] ?? 0, $data['disbursement'] ?? 0, $data['tax'] ?? 0);
        $req = Requests::create($room, 'third_party', [...$data, 'costs' => $costs, 'conflict' => 'Cleared', 'credentials' => 'Verified'], $costs['total'], $request->user()->name);

        return back()->with('success', "Third-party appointment {$req->reference} submitted. Prepayment of R".number_format($costs['total']).' is due after approval.');
    }

    public function refund(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $charge = $room->charges()->findOrFail($request->integer('charge_id'));
        $elig = Requests::refundEligibility($room, $charge);
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:120'], 'detail' => ['required', 'string', 'max:1000'],
            'amount' => ['required', 'integer', 'min:1', 'max:'.max(1, $elig['refundable'])], 'method' => ['required', Rule::in(['original', 'bank_transfer'])], 'notes' => ['nullable', 'string', 'max:500'],
        ], ['amount.max' => 'The refundable amount under policy is R'.number_format($elig['refundable']).'.']);
        if (! $elig['eligible']) {
            throw ValidationException::withMessages(['amount' => $elig['rule']]);
        }
        if ($room->requests()->where('type', 'refund')->where('charge_id', $charge->id)->where('status', 'submitted')->exists()) {
            throw ValidationException::withMessages(['amount' => 'A refund request for this payment is already pending.']);
        }
        $req = Requests::create($room, 'refund', [...$data, 'method' => $data['method'] === 'original' ? 'original payment method' : 'bank transfer (manual refund)', 'rule' => $elig['rule']], $data['amount'], $request->user()->name, $charge->id);

        return back()->with('success', "Refund request {$req->reference} submitted for approval.");
    }

    public function dispute(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $charge = $room->charges()->findOrFail($request->integer('charge_id'));
        $data = $request->validate([
            'dispute_type' => ['required', Rule::in(['Fee Amount Dispute', 'Service Not Delivered', 'Duplicate Charge', 'Commercial Terms Dispute'])],
            'reason' => ['required', 'string', 'max:300'], 'detail' => ['required', 'string', 'max:2000'],
            'amount' => ['required', 'integer', 'min:1', 'max:'.$charge->total_zar],
        ]);
        if (! $charge->paid_at || $charge->paid_at->lt(now()->subDays(30))) {
            throw ValidationException::withMessages(['amount' => 'Disputes must be raised within 30 days of payment.']);
        }
        $req = Requests::create($room, 'dispute', [...$data, 'charge' => $charge->reference], $data['amount'], $request->user()->name, $charge->id);
        $req->update(['status' => 'submitted']);

        return back()->with('success', "Dispute {$req->reference} submitted. TBCA Finance will respond within 10 business days.");
    }

    /** Client accepts the proposed dispute resolution (credit applied). */
    public function acceptResolution(Request $request, Room $room, CommercialRequest $req): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless($req->room_id === $room->id && $req->type === 'dispute' && $req->status === 'resolution_proposed', 422);
        $credit = (int) ($req->payload['credit'] ?? 0);
        if ($credit && $req->charge) {
            $req->charge->update(['refunded_zar' => $req->charge->refunded_zar + $credit, 'status' => 'partially_refunded']);
            Audit::log($room, 'credit_note.issued', 'Credit note R'.number_format($credit)." issued for dispute {$req->reference}");
        }
        $req->update(['status' => 'resolved', 'decided_at' => now()]);
        Audit::log($room, 'dispute.resolved', "Dispute {$req->reference} resolved and closed");

        return back()->with('success', 'Resolution accepted. Dispute closed.');
    }

    /** Restart a paused transaction once the payment issue is resolved and restart approvals are recorded. */
    public function restart(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless($room->isPaused(), 422, 'The transaction is not paused.');
        $req = $room->requests()->where('type', 'restart')->whereIn('status', ['submitted', 'approved'])->latest('id')->first();
        if (! $req) {
            $req = Requests::create($room, 'restart', ['reason' => $room->paused_reason], 0, $request->user()->name);

            return back()->with('success', "Restart request {$req->reference} raised. Approvals are now required.");
        }
        $charge = $room->charges()->find($room->stateGet('pause.charge'));
        if (! $charge?->isPaid()) {
            throw ValidationException::withMessages(['restart' => 'Resolve the failed payment first (retry or use an alternative method).']);
        }
        if (! Requests::allApproved($req)) {
            throw ValidationException::withMessages(['restart' => 'All four restart approvals are required.']);
        }
        $room->update(['status' => 'active', 'paused_at' => null, 'paused_reason' => null]);
        $room->stateSet('pause', null);
        $room->save();
        $req->update(['status' => 'resolved', 'decided_at' => now()]);
        Audit::log($room, 'deal.restarted', 'Transaction restarted from '.$room->current_stage);
        Workflow::attempt($room->fresh(), (string) $room->current_stage);

        return redirect()->route('deal-room.rooms.show', $room)->with('success', 'Transaction restarted. Completed steps and evidence were retained.');
    }

    /** Archive renewal package selection (approvals then payment). */
    public function renewal(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::isUnlocked($room, '15'), 423, 'Archive renewal opens at Stage 15.');
        $data = $request->validate(['package' => ['required', Rule::in(array_keys(Pricing::renewalPackages()))], 'confirm' => ['accepted']]);
        $pkg = Pricing::renewalPackages()[$data['package']];
        $room->charges()->where('kind', 'archive_renewal')->where('status', 'issued')->update(['status' => 'cancelled']);
        Billing::issue($room, 'archive_renewal', 'Archive renewal — '.$pkg['name'], [['category' => 'Archive Services', 'item' => $pkg['name'], 'provider' => 'TBCA Platform', 'net' => $pkg['net']]], '15', ['package' => $data['package'], 'months' => $pkg['months']], 14);
        Workflow::seedApprovals($room, 'renewal', [['John Dlamini', 'TBCA Sponsor Review'], ['Aisha Sekele', 'Founder / CEO'], ['Michael Tumi', 'Finance Lead']]);
        Audit::log($room, 'renewal.due', 'Archive renewal selected: '.$pkg['name']);

        return back()->with('success', 'Renewal selected. Record the approvals, then pay to continue archive service.');
    }
}
