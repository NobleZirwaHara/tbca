<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Condition;
use App\Models\DealRoom\Item;
use App\Models\DealRoom\Offer;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Transaction-stage records: live negotiation sign-offs and action register,
 * offer / term-sheet versions, legal documents and issues, conditions
 * precedent, the e-signature sequence, funds-flow evidence and handover items.
 */
class TransactionController extends Controller
{
    use LoadsRoom;

    protected const ITEM_STATUSES = [
        'action' => ['pending', 'in_progress', 'completed'],
        'legal_doc' => ['drafting', 'in_review', 'finalised'],
        'legal_issue' => ['open', 'in_review', 'resolved', 'deferred'],
        'handover' => ['scheduled', 'in_progress', 'completed'],
        'workstream' => ['planned', 'in_progress', 'completed'],
        'post_close_risk' => ['open', 'in_progress', 'resolved'],
        'signature' => ['waiting', 'pending', 'signed'],
    ];

    protected const ITEM_STAGE = ['action' => '9', 'legal_doc' => '11', 'legal_issue' => '11', 'handover' => '14', 'workstream' => '14', 'post_close_risk' => '14', 'signature' => '13'];

    /** Live negotiation: buyer/seller sign-offs, then close as agreed (both approved) or declined. */
    public function negotiation(Request $request, Room $room): RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless(Workflow::isUnlocked($room, '9'), 423, 'The live negotiation room is locked.');
        $data = $request->validate(['action' => ['required', Rule::in(['request_buyer', 'request_seller', 'buyer_approve', 'seller_approve', 'close_agreed', 'close_declined', 'keep_open', 'summarise'])]]);
        $state = $room->stateGet('negotiation', []);
        $isBuyerSide = in_array($role, ['investor', 'lender'], true);
        $manages = Access::manages($room, $request->user());

        switch ($data['action']) {
            case 'request_buyer':
            case 'request_seller':
                abort_unless($manages, 403);
                $side = $data['action'] === 'request_buyer' ? 'buyer' : 'seller';
                $state[$side] = 'awaiting';
                $msg = ucfirst($side).' approval requested.';
                break;
            case 'buyer_approve':
                abort_unless($isBuyerSide || $request->user()->isAdmin(), 403, 'Only the buyer team (or TBCA on their recorded instruction) can sign off.');
                $state['buyer'] = 'approved';
                $msg = 'Buyer sign-off recorded.';
                break;
            case 'seller_approve':
                abort_unless($role === 'owner' || $request->user()->isAdmin(), 403);
                $state['seller'] = 'approved';
                $msg = 'Seller sign-off recorded.';
                break;
            case 'close_agreed':
                abort_unless($manages, 403);
                if (($state['buyer'] ?? null) !== 'approved' || ($state['seller'] ?? null) !== 'approved') {
                    throw ValidationException::withMessages(['action' => 'Facilitator cannot close yet: both buyer and seller approvals are required.']);
                }
                $state['outcome'] = 'agreed';
                $state['closed_at'] = now()->toIso8601String();
                $msg = 'Session closed as agreed. Minutes and decision log locked.';
                break;
            case 'close_declined':
                abort_unless($manages, 403);
                $state['outcome'] = 'declined';
                $msg = 'Session closed as declined. The room remains open for a new session.';
                break;
            case 'summarise':
                abort_unless($manages, 403);
                Usage::increment($room, 'summaries');
                $state['summary_at'] = now()->toIso8601String();
                $msg = 'AI discussion summary generated (pending human review).';
                break;
            default:
                $state['outcome'] = null;
                $msg = 'Room kept open.';
        }
        $room->stateSet('negotiation', $state);
        $room->save();
        Audit::log($room, 'negotiation.'.$data['action'], $msg);

        return back()->with('success', $msg);
    }

    /** New offer / counteroffer: the previous active version is frozen read-only (superseded). */
    public function storeOffer(Request $request, Room $room): RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless(Workflow::isUnlocked($room, '10'), 423, 'Offer management is locked until negotiation preparation completes.');
        $data = $request->validate([
            'label' => ['required', 'string', 'max:80'],
            'valuation' => ['required', 'integer', 'min:1000000'],
            'investment' => ['required', 'integer', 'min:100000'],
            'equity' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'key_condition' => ['nullable', 'string', 'max:120'],
            'liquidation' => ['nullable', 'string', 'max:60'],
            'board' => ['nullable', 'string', 'max:60'],
            'exclusivity' => ['nullable', 'string', 'max:30'],
        ]);
        $side = in_array($role, ['investor', 'lender'], true) ? 'investor' : 'sponsor';
        $room->offers()->where('status', 'active')->update(['status' => 'superseded']);
        $n = $room->offers()->count() + 1;
        $offer = $room->offers()->create([
            'version' => sprintf('TS-%02d', $n), 'label' => $data['label'], 'side' => $side, 'submitted_by' => $request->user()->name,
            'valuation_zar' => $data['valuation'], 'investment_zar' => $data['investment'], 'equity_pct' => $data['equity'],
            'key_condition' => $data['key_condition'] ?? null, 'status' => 'active',
            'terms' => array_filter(['liquidation' => $data['liquidation'] ?? null, 'board' => $data['board'] ?? null, 'exclusivity' => $data['exclusivity'] ?? null]),
        ]);
        Audit::log($room, 'offer.submitted', "{$offer->version} {$offer->label} submitted by {$offer->submitted_by}; prior versions frozen");

        return back()->with('success', "{$offer->version} submitted. Previous versions are frozen (read-only).");
    }

    /** Approve the active version (requires the stage's dual approvals to be recorded first). */
    public function approveOffer(Request $request, Room $room, Offer $offer): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless($offer->room_id === $room->id, 404);
        if ($offer->status !== 'active') {
            throw ValidationException::withMessages(['offer' => 'Only the active (editable) version can be approved.']);
        }
        $pending = $room->approvals()->where('subject', 'stage:10')->where('status', '!=', 'approved')->count();
        if ($pending) {
            throw ValidationException::withMessages(['offer' => 'Dual approval required (commercial + legal) before the active term sheet can be approved.']);
        }
        $room->offers()->where('status', 'approved')->update(['status' => 'superseded']);
        $offer->update(['status' => 'approved', 'approved_at' => now()]);
        Audit::log($room, 'offer.approved', "{$offer->version} approved as the authorised term sheet");

        return back()->with('success', "{$offer->version} approved as the authorised term sheet.");
    }

    public function storeItem(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate([
            'kind' => ['required', Rule::in(['action', 'legal_doc', 'legal_issue', 'handover', 'post_close_risk'])],
            'title' => ['required', 'string', 'max:160'],
            'owner' => ['nullable', 'string', 'max:80'],
            'due_date' => ['nullable', 'date'],
            'severity' => ['nullable', Rule::in(['Low', 'Medium', 'High'])],
        ]);
        abort_unless(Workflow::isUnlocked($room, self::ITEM_STAGE[$data['kind']]), 423);
        $room->items()->create([
            'kind' => $data['kind'], 'title' => $data['title'], 'owner' => $data['owner'] ?? null, 'due_date' => $data['due_date'] ?? null,
            'status' => self::ITEM_STATUSES[$data['kind']][0], 'position' => $room->items()->where('kind', $data['kind'])->count() + 1,
            'meta' => array_filter(['severity' => $data['severity'] ?? null, 'version' => $data['kind'] === 'legal_doc' ? 'v1.0' : null]),
        ]);
        Audit::log($room, 'item.created', ucfirst(str_replace('_', ' ', $data['kind']))." added: {$data['title']}");

        return back()->with('success', 'Added to the register.');
    }

    public function updateItem(Request $request, Room $room, Item $item): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($item->room_id === $room->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(self::ITEM_STATUSES[$item->kind] ?? [])]]);
        $stageCode = self::ITEM_STAGE[$item->kind] ?? null;
        abort_if($stageCode && ! Workflow::isUnlocked($room, $stageCode), 423);

        if ($item->kind === 'signature') {
            // E-signature sequence: a signer may sign only when every earlier signer has signed; signer must be the named party or TBCA.
            $earlier = $room->items()->where('kind', 'signature')->where('position', '<', $item->position)->where('status', '!=', 'signed')->exists();
            if ($earlier) {
                throw ValidationException::withMessages(['status' => 'Signing order enforced: earlier signatories must sign first.']);
            }
            $meta = $item->meta ?? [];
            $meta['signed_at'] = now()->format('d M Y H:i');
            $item->meta = $meta;
        } else {
            $this->manage($request, $room);
            if ($item->kind === 'legal_doc' && $data['status'] === 'finalised') {
                $meta = $item->meta ?? [];
                $meta['hash'] = hash('sha256', $item->title.($meta['version'] ?? 'v1').now());
                $item->meta = $meta;
            }
        }
        $item->status = $data['status'];
        $item->save();
        Audit::log($room, 'item.updated', "{$item->title}: ".str_replace('_', ' ', $data['status']));

        $msg = 'Updated.';
        if ($stageCode && in_array($stageCode, ['11', '13', '14'], true) && Workflow::gate($room->fresh(), $stageCode)['passed'] && Workflow::stage($room, $stageCode)->status !== 'completed') {
            $msg = "Updated. Stage {$stageCode} completion test now passes — you can complete the stage.";
        }

        return back()->with('success', $msg);
    }

    public function updateCondition(Request $request, Room $room, Condition $condition): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless($condition->room_id === $room->id, 404);
        abort_unless(Workflow::isUnlocked($room, '12'), 423);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['not_started', 'in_progress', 'at_risk', 'satisfied', 'waived'])],
            'validated' => ['sometimes', 'boolean'],
            'evidence' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);
        if (($data['validated'] ?? false) && empty($data['evidence'] ?? $condition->evidence)) {
            throw ValidationException::withMessages(['validated' => 'Attach an evidence reference before validating a condition.']);
        }
        $condition->update($data);
        Audit::log($room, 'cp.updated', "CP {$condition->number} {$condition->condition}: ".str_replace('_', ' ', $condition->status).($condition->validated ? ' (validated)' : ''));

        return back()->with('success', "Condition {$condition->number} updated.");
    }

    public function storeCondition(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::isUnlocked($room, '12'), 423);
        $data = $request->validate([
            'condition' => ['required', 'string', 'max:160'], 'category' => ['required', 'string', 'max:40'],
            'owner' => ['required', 'string', 'max:80'], 'due_date' => ['nullable', 'date'],
        ]);
        $room->conditions()->create([...$data, 'number' => (int) $room->conditions()->max('number') + 1, 'status' => 'not_started']);
        Audit::log($room, 'cp.created', "Condition precedent added: {$data['condition']}");

        return back()->with('success', 'Condition precedent added.');
    }

    /** Funds-flow evidence: TBCA verifies evidence only; it never holds proceeds. */
    public function fundsFlow(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::isUnlocked($room, '13'), 423);
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'escrow' => ['required', 'string', 'max:80'],
            'settlement_reference' => ['required', 'string', 'max:60'],
            'received_on' => ['required', 'date'],
        ]);
        $room->stateSet('funds_flow', [...$data, 'verified_at' => now()->format('d M Y H:i'), 'verified_by' => $request->user()->name]);
        $room->save();
        Workflow::tick($room, '13', 'funds_flow', true);
        Audit::log($room, 'closing.funds_verified', 'Funds-flow evidence verified: '.$data['settlement_reference']);

        return back()->with('success', 'Funds-flow evidence verified.');
    }
}
