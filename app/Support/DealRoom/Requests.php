<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Charge;
use App\Models\DealRoom\CommercialRequest;
use App\Models\DealRoom\Room;

/**
 * Commercial requests with named approvals: change requests, third-party
 * appointments, overage approvals, refunds, fee disputes and restarts.
 * When every approval is recorded the request advances (charge issued,
 * refund credited ...); any rejection rejects the request.
 */
class Requests
{
    public const PREFIX = ['change' => 'CR', 'third_party' => 'TPA', 'overage' => 'OVR', 'refund' => 'RFD', 'dispute' => 'DSP', 'restart' => 'RST'];

    public const APPROVERS = [
        'change' => [['John Dlamini', 'TBCA Deal Advisor'], ['Aisha Sekele', 'Client Authorised Signatory'], ['Michael Tumi', 'Finance Lead / Payer Authoriser'], ['TBCA Finance', 'Finance Approval']],
        'third_party' => [['John Dlamini', 'TBCA Deal Advisor'], ['Aisha Sekele', 'Client Authorised Signatory'], ['Michael Tumi', 'Finance Lead / Payer Authoriser'], ['TBCA Finance', 'Finance Approval']],
        'overage' => [['John Dlamini', 'TBCA Deal Advisor'], ['Michael Tumi', 'Finance Lead / Payer Authoriser'], ['TBCA Finance', 'Finance Approval']],
        'refund' => [['John Dlamini', 'TBCA Deal Advisor'], ['Aisha Sekele', 'Client Authorised Signatory'], ['TBCA Finance', 'Finance Approval'], ['Head of Finance', 'Refund Authoriser (Head of Finance)']],
        'dispute' => [['TBCA Finance', 'Finance Approval'], ['Head of Finance', 'Refund Reviewer (Head of Finance)']],
        'restart' => [['John Dlamini', 'TBCA Deal Advisor'], ['Aisha Sekele', 'Client Authorised Signatory'], ['TBCA Finance', 'Finance Approval'], ['Head of Finance', 'Restart Authoriser (Head of Finance)']],
    ];

    public static function create(Room $room, string $type, array $payload, int $amount, string $raisedBy, ?int $chargeId = null): CommercialRequest
    {
        $count = $room->requests()->where('type', $type)->count() + 1;
        $req = $room->requests()->create([
            'reference' => sprintf('%s-%s-%06d-%d', self::PREFIX[$type], now()->format('Y'), $room->id + 127, $count),
            'type' => $type,
            'status' => 'submitted',
            'raised_by' => $raisedBy,
            'charge_id' => $chargeId,
            'amount_zar' => $amount,
            'payload' => $payload,
        ]);
        Workflow::seedApprovals($room, 'request:'.$req->id, self::APPROVERS[$type]);
        $event = ['change' => 'change.requested', 'third_party' => 'expert.requested', 'overage' => 'overage.detected', 'refund' => 'refund.requested', 'dispute' => 'dispute.opened', 'restart' => 'deal.restart_requested'][$type];
        Audit::log($room, $event, ucfirst(str_replace('_', ' ', $type))." request {$req->reference} submitted", $raisedBy);

        return $req;
    }

    public static function approvals(CommercialRequest $req): array
    {
        return Workflow::approvalsFor($req->room, 'request:'.$req->id)->map(fn ($a) => Workflow::presentApproval($a))->all();
    }

    public static function allApproved(CommercialRequest $req): bool
    {
        $rows = Workflow::approvalsFor($req->room, 'request:'.$req->id);

        return $rows->isNotEmpty() && $rows->every(fn ($a) => $a->status === 'approved');
    }

    /** Called after any approval decision on a request subject. */
    public static function advance(CommercialRequest $req): void
    {
        $room = $req->room;
        $rows = Workflow::approvalsFor($room, 'request:'.$req->id);
        if ($rows->contains(fn ($a) => $a->status === 'rejected')) {
            $req->update(['status' => 'rejected', 'decided_at' => now()]);
            Audit::log($room, $req->type.'.rejected', "Request {$req->reference} rejected");

            return;
        }
        if (! self::allApproved($req) || ! in_array($req->status, ['submitted', 'under_review'], true)) {
            return;
        }

        $p = $req->payload ?? [];
        switch ($req->type) {
            case 'change':
                $fees = $p['fees'];
                $charge = Billing::issue($room, 'change', "Change request {$req->reference}", array_values(array_filter([
                    ['category' => 'TBCA Expert Fees', 'item' => 'Incremental expert services', 'provider' => 'TBCA', 'net' => $fees['expert']],
                    ['category' => 'TBCA Platform Fees', 'item' => 'Increased allowances', 'provider' => 'TBCA Platform', 'net' => $fees['platform']],
                    ['category' => 'External Third-Party Fees', 'item' => 'Expanded legal documentation support', 'provider' => 'External Counsel', 'net' => $fees['external']],
                ], fn ($l) => $l['net'] > 0)), null, ['request' => $req->id], 14);
                $req->update(['status' => 'approved', 'charge_id' => $charge->id, 'decided_at' => now()]);
                Audit::log($room, 'change.approved', "Change request {$req->reference} approved; invoice {$charge->reference} issued");
                break;
            case 'third_party':
                $charge = Billing::issue($room, 'third_party', "Third-party prepayment: {$p['provider']}", [
                    ['category' => 'External Third-Party Fee', 'item' => $p['service'].' (landed cost)', 'provider' => $p['provider'], 'net' => $p['costs']['landed']],
                    ['category' => 'TBCA Administration Margin', 'item' => '25% administration margin', 'provider' => 'TBCA', 'net' => $p['costs']['margin']],
                ], null, ['request' => $req->id]);
                $req->update(['status' => 'approved', 'charge_id' => $charge->id, 'decided_at' => now()]);
                Audit::log($room, 'third_party_cost_approved', "Third-party appointment {$req->reference} approved; prepayment {$charge->reference} issued");
                break;
            case 'overage':
                $plans = Pricing::upgradePlans();
                $charge = $p['option'] === 'overage'
                    ? Billing::issue($room, 'overage', 'Approved usage overage ('.now()->format('F Y').')', collect($p['lines'])->map(fn ($l) => ['category' => 'Usage Overage', 'item' => $l['label'].': '.$l['qty'].' '.$l['unit'].'s @ R'.$l['rate'], 'provider' => 'TBCA Platform', 'net' => $l['charge']])->all(), null, ['request' => $req->id], 14)
                    : Billing::issue($room, 'plan_upgrade', 'Upgrade to '.$plans[$p['option']]['name'], [['category' => 'TBCA Platform Fee', 'item' => $plans[$p['option']]['name'].' (monthly)', 'provider' => 'TBCA Platform', 'net' => $plans[$p['option']]['monthly']]], null, ['request' => $req->id, 'adds' => $plans[$p['option']]['adds'], 'plan' => 'TBCA '.$plans[$p['option']]['name']], 14);
                $req->update(['status' => 'approved', 'charge_id' => $charge->id, 'decided_at' => now()]);
                break;
            case 'refund':
                $charge = Charge::find($req->charge_id);
                if ($charge) {
                    $charge->update(['refunded_zar' => $charge->refunded_zar + $req->amount_zar, 'status' => $charge->refunded_zar + $req->amount_zar >= $charge->total_zar ? 'refunded' : 'partially_refunded']);
                }
                $req->update(['status' => 'approved', 'decided_at' => now(), 'resolution' => 'Refund approved; processed to the '.($p['method'] ?? 'original payment method').' within 5 business days. Credit note issued.']);
                Audit::log($room, 'refund.approved', "Refund {$req->reference} of R".number_format($req->amount_zar).' approved');
                Audit::log($room, 'credit_note.issued', "Credit note issued against {$charge?->reference}");
                break;
            case 'restart':
                $req->update(['status' => 'approved', 'decided_at' => now()]);
                break;
        }
    }

    public static function present(CommercialRequest $r): array
    {
        return [
            'id' => $r->id, 'reference' => $r->reference, 'type' => $r->type, 'status' => $r->status, 'raisedBy' => $r->raised_by,
            'amount' => (int) $r->amount_zar, 'payload' => $r->payload ?? [], 'resolution' => $r->resolution,
            'charge' => $r->charge ? Billing::present($r->charge) : null, 'createdAt' => $r->created_at->format('d M Y H:i'),
            'decidedAt' => $r->decided_at?->format('d M Y H:i'), 'approvals' => self::approvals($r),
        ];
    }

    /** Refund policy (VDR-045 / blueprint 30.2). */
    public static function refundEligibility(Room $room, ?Charge $charge): array
    {
        if (! $charge || ! $charge->isPaid()) {
            return ['eligible' => false, 'rule' => 'No settled payment to refund.', 'refundable' => 0, 'days' => 0];
        }
        $days = (int) $charge->paid_at->diffInDays(now());
        $stageIndex = Stages::index((string) $room->current_stage);
        $net = (int) $charge->net_zar;
        $already = (int) $charge->refunded_zar;

        if ($stageIndex >= Stages::index('2') && Workflow::stage($room, '2')->status !== 'locked' && $charge->kind === 'deposit') {
            return ['eligible' => false, 'rule' => 'No refunds after Stage 2 activation (delivered work is earned).', 'refundable' => 0, 'days' => $days];
        }
        if ($days > 7) {
            return ['eligible' => false, 'rule' => 'Outside the 7 calendar day policy window.', 'refundable' => 0, 'days' => $days];
        }
        $discretionary = $stageIndex >= Stages::index('1');
        $refundable = max(0, (int) round($net * 0.30) - $already);

        return [
            'eligible' => $refundable > 0,
            'rule' => $discretionary ? 'Stage 1 — refunds at the discretion of TBCA (up to 30% of net)' : 'Stage 0 — 30% refund before mandate activation',
            'refundable' => $refundable,
            'nonRefundable' => (int) $charge->total_zar - $refundable,
            'days' => $days,
            'discretionary' => $discretionary,
        ];
    }
}
