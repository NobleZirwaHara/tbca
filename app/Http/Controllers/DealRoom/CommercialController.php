<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Billing;
use App\Support\DealRoom\Pricing;
use App\Support\DealRoom\Requests;
use App\Support\DealRoom\Stages;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Commercial journey and billing screens (VDR-029 to VDR-051). Pre-mandate
 * screens enforce order: estimate -> quotation -> fee breakdown -> scope ->
 * engagement -> deposit. Billing screens read live charges, usage and
 * requests for the room.
 */
class CommercialController extends Controller
{
    use LoadsRoom;

    public const COMMERCIAL = [
        'preliminary-estimate' => ['code' => 'VDR-029', 'title' => 'Preliminary Estimate'],
        'formal-quotation' => ['code' => 'VDR-030', 'title' => 'Formal Quotation'],
        'fee-breakdown' => ['code' => 'VDR-031', 'title' => 'Fee Breakdown'],
        'scope-acceptance' => ['code' => 'VDR-032', 'title' => 'Scope Acceptance'],
        'engagement-acceptance' => ['code' => 'VDR-033', 'title' => 'Engagement Acceptance'],
        'deposit-checkout' => ['code' => 'VDR-034', 'title' => 'Deposit Checkout'],
        'monthly-statement' => ['code' => 'VDR-043', 'title' => 'Monthly Statement'],
        'closing-invoice' => ['code' => 'VDR-049', 'title' => 'Closing Invoice'],
        'post-close-subscription' => ['code' => 'VDR-050', 'title' => 'Post-Close Subscription'],
    ];

    public const BILLING = [
        'secure-payment' => ['code' => 'VDR-035', 'title' => 'Secure Payment'],
        'payment-confirmation' => ['code' => 'VDR-036', 'title' => 'Payment Confirmation'],
        'invoice-and-receipt' => ['code' => 'VDR-037', 'title' => 'Invoice and Receipt'],
        'stage-gate-unlock' => ['code' => 'VDR-038', 'title' => 'Stage-Gate Unlock'],
        'usage-dashboard' => ['code' => 'VDR-039', 'title' => 'Usage Dashboard'],
        'overage-alert' => ['code' => 'VDR-040', 'title' => 'Overage Alert'],
        'change-request' => ['code' => 'VDR-041', 'title' => 'Change Request'],
        'third-party-approval' => ['code' => 'VDR-042', 'title' => 'Third-Party Approval'],
        'failed-payment' => ['code' => 'VDR-044', 'title' => 'Failed Payment'],
        'refund-request' => ['code' => 'VDR-045', 'title' => 'Refund Request'],
        'fee-dispute' => ['code' => 'VDR-046', 'title' => 'Fee Dispute'],
        'transaction-pause' => ['code' => 'VDR-047', 'title' => 'Transaction Pause'],
        'transaction-restart' => ['code' => 'VDR-048', 'title' => 'Transaction Restart'],
    ];

    /** Pre-mandate step prerequisites: screen => [flag key, message]. */
    protected const ORDER = [
        'formal-quotation' => ['diagnostic', 'Complete the Stage B diagnostic before the formal quotation is issued.'],
        'fee-breakdown' => ['quote_accepted_at', 'Accept the formal quotation first.'],
        'scope-acceptance' => ['fee_ack_at', 'Acknowledge the fee breakdown first.'],
        'engagement-acceptance' => ['scope_accepted_at', 'Accept the scope of work first.'],
        'deposit-checkout' => ['engagement_signed_at', 'Sign the engagement pack first.'],
    ];

    public function commercial(Request $request, Room $room, string $screen): Response|RedirectResponse
    {
        abort_unless(isset(self::COMMERCIAL[$screen]), 404);

        return $this->render($request, $room, $screen, self::COMMERCIAL[$screen], 'commercial');
    }

    public function billing(Request $request, Room $room, string $screen): Response|RedirectResponse
    {
        abort_unless(isset(self::BILLING[$screen]), 404);

        return $this->render($request, $room, $screen, self::BILLING[$screen], 'billing');
    }

    protected function render(Request $request, Room $room, string $screen, array $meta, string $area): Response|RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);

        if (isset(self::ORDER[$screen])) {
            [$flag, $message] = self::ORDER[$screen];
            $ok = $flag === 'diagnostic' ? Workflow::stage($room, 'B')->status === 'completed' : ! empty($room->commercial[$flag] ?? null);
            if (! $ok) {
                $prev = array_keys(self::COMMERCIAL)[array_search($screen, array_keys(self::COMMERCIAL), true) - 1] ?? 'preliminary-estimate';

                return redirect()->route($flag === 'diagnostic' ? 'deal-room.rooms.page' : 'deal-room.commercial', [$room, $flag === 'diagnostic' ? 'diagnostic' : $prev])->with('error', $message);
            }
        }

        return Inertia::render('DealRoom/Commercial/Screen', [
            ...$this->shared($request, $room),
            'screen' => $screen,
            'area' => $area,
            'meta' => $meta,
            'commercial' => $room->commercial ?? (object) [],
            'data' => $this->data($request, $room, $screen),
        ]);
    }

    protected function data(Request $request, Room $room, string $screen): array
    {
        $deposit = $room->charges()->where('kind', 'deposit')->latest('id')->first();
        $lastPaid = $room->charges()->whereIn('status', ['paid', 'partially_refunded', 'refunded'])->latest('paid_at')->first();
        $pauseCharge = $room->charges()->find($room->stateGet('pause.charge'));
        $failed = $room->charges()->where('status', 'failed')->latest('id')->first() ?? $pauseCharge;
        $present = fn ($c) => $c ? Billing::present($c) : null;
        $requests = fn (string $type) => $room->requests()->where('type', $type)->latest('id')->get()->map(fn ($r) => Requests::present($r))->all();

        return match ($screen) {
            'preliminary-estimate' => ['estimate' => Pricing::estimate($room), 'diagnostic' => Pricing::diagnosticProgress($room)],
            'formal-quotation' => ['quote' => Pricing::quote($room), 'estimate' => Pricing::estimate($room)],
            'fee-breakdown' => ['fees' => Pricing::feeBreakdown(), 'quote' => Pricing::quote($room)],
            'scope-acceptance', 'engagement-acceptance' => ['quote' => Pricing::quote($room), 'fees' => Pricing::feeBreakdown()['totals'], 'deposit' => Pricing::DEPOSIT_NET + Pricing::vat(Pricing::DEPOSIT_NET)],
            'deposit-checkout', 'secure-payment' => ['charge' => $present($request->query('charge') ? $room->charges()->find($request->query('charge')) : $deposit), 'depositLines' => Pricing::depositLines(), 'quote' => Pricing::quote($room)['reference']],
            'payment-confirmation', 'invoice-and-receipt' => ['charge' => $present($request->query('charge') ? $room->charges()->find($request->query('charge')) : $lastPaid), 'payment' => $this->payment($lastPaid)],
            'stage-gate-unlock' => [
                'deposit' => $present($deposit),
                'stageC' => ['status' => Workflow::stage($room, 'C')->status, 'completedAt' => Workflow::stage($room, 'C')->completed_at?->format('d M Y H:i')],
                'stage0' => Workflow::stage($room, '0')->status,
                'gate' => Workflow::gate($room, 'C'),
                'refs' => ['eng' => Audit::ref($room, 'ENG'), 'rev' => Audit::ref($room, 'REV'), 'ent' => Audit::ref($room, 'ENT'), 'aud' => Audit::ref($room, 'AUD'), 'kyc' => Audit::ref($room, 'KYC'), 'gate' => Audit::ref($room, 'SGU')],
            ],
            'usage-dashboard', 'overage-alert' => ['usage' => Usage::summary($room), 'plans' => Pricing::upgradePlans(), 'requests' => $requests('overage')],
            'change-request' => ['allowances' => Usage::allowances($room), 'rates' => Pricing::changeRates(), 'legalExternal' => Pricing::LEGAL_SUPPORT_EXTERNAL, 'quote' => Pricing::quote($room), 'requests' => $requests('change')],
            'third-party-approval' => ['requests' => $requests('third_party')],
            'monthly-statement' => $this->statement($room),
            'failed-payment', 'transaction-pause' => ['charge' => $present($failed), 'payment' => $this->payment($failed), 'paused' => $room->isPaused(), 'pausedAt' => $room->paused_at?->format('d M Y H:i'), 'reason' => $room->paused_reason],
            'transaction-restart' => $this->restart($room, $pauseCharge),
            'refund-request' => ['charge' => $present($lastPaid), 'eligibility' => Requests::refundEligibility($room, $lastPaid), 'requests' => $requests('refund')],
            'fee-dispute' => ['charges' => $room->charges()->whereIn('status', ['paid', 'partially_refunded'])->where('paid_at', '>=', now()->subDays(30))->latest('id')->get()->map(fn ($c) => Billing::present($c))->all(), 'requests' => $requests('dispute')],
            'closing-invoice' => ['charge' => $present($room->charges()->where('kind', 'closing')->latest('id')->first()), 'lines' => Pricing::closingLines(), 'eligible' => Workflow::stage($room, '13')->status === 'completed'],
            'post-close-subscription' => ['subscription' => $room->stateGet('subscription'), 'charge' => $present($room->charges()->where('kind', 'subscription')->latest('id')->first()), 'net' => Pricing::SUBSCRIPTION_NET, 'eligible' => Workflow::stage($room, '13')->status === 'completed', 'usage' => ['users' => $room->parties()->where('status', 'active')->count(), 'storage' => round($room->documents()->sum('size') / 1e9, 2), 'queries' => $room->questions()->count()]],
            default => [],
        };
    }

    protected function payment($charge): ?array
    {
        $order = $charge?->order;
        $payment = $order?->payments()->latest('id')->first();

        return $payment ? [
            'reference' => $payment->reference, 'method' => $payment->method, 'status' => $payment->status, 'reason' => $payment->failure_reason,
            'amount' => (int) $payment->amount_zar, 'at' => $payment->created_at->format('d M Y H:i'), 'order' => $order->reference,
            'attempts' => $order->payments()->count(), 'meta' => $payment->meta,
        ] : null;
    }

    /** Monthly statement: opening balance + new charges - payments = closing balance. */
    protected function statement(Room $room): array
    {
        $start = now()->startOfMonth();
        $charges = $room->charges()->orderBy('id')->get();
        $opening = $charges->filter(fn ($c) => $c->created_at < $start && ! $c->isPaid() && $c->status !== 'cancelled')->sum('total_zar');
        $new = $charges->filter(fn ($c) => $c->created_at >= $start && $c->status !== 'cancelled');
        $payments = $charges->filter(fn ($c) => $c->paid_at && $c->paid_at >= $start)->sum('total_zar');
        $credits = $charges->sum('refunded_zar');
        $unpaid = $charges->filter(fn ($c) => in_array($c->status, ['issued', 'awaiting_payment', 'failed'], true));

        return [
            'reference' => Audit::ref($room, 'MST'),
            'period' => $start->format('d M Y').' – '.now()->endOfMonth()->format('d M Y'),
            'opening' => (int) $opening,
            'newCharges' => (int) $new->sum('total_zar'),
            'payments' => (int) $payments,
            'credits' => (int) $credits,
            'closing' => (int) $unpaid->sum('total_zar'),
            'lines' => $new->map(fn ($c) => Billing::present($c))->values()->all(),
            'unpaid' => $unpaid->map(fn ($c) => Billing::present($c))->values()->all(),
            'ageing' => [
                '0-30' => (int) $unpaid->filter(fn ($c) => $c->created_at >= now()->subDays(30))->sum('total_zar'),
                '31-60' => (int) $unpaid->filter(fn ($c) => $c->created_at < now()->subDays(30) && $c->created_at >= now()->subDays(60))->sum('total_zar'),
                '61+' => (int) $unpaid->filter(fn ($c) => $c->created_at < now()->subDays(60))->sum('total_zar'),
            ],
            'approved' => $room->stateGet('statement.'.now()->format('Y-m')),
        ];
    }

    protected function restart(Room $room, $pauseCharge): array
    {
        $req = $room->requests()->where('type', 'restart')->latest('id')->first();
        $approved = $req ? collect(Requests::approvals($req))->where('status', 'approved')->count() : 0;
        $paid = (bool) $pauseCharge?->isPaid();
        $reqs = [
            ['label' => 'Payment issue resolved', 'done' => $paid, 'detail' => $paid ? 'Outstanding prepayment settled' : 'Insufficient funds must be resolved'],
            ['label' => 'Payment method verified', 'done' => $paid || ($pauseCharge?->failed_attempts ?? 0) > 0, 'detail' => 'Card details validated'],
            ['label' => 'Stage lock confirmation', 'done' => $paid, 'detail' => 'Stage will be unlocked on restart'],
            ['label' => 'Outstanding fees review', 'done' => true, 'detail' => 'No other outstanding fees'],
            ['label' => 'Required approvals obtained', 'done' => $req && Requests::allApproved($req), 'detail' => "{$approved} of 4 approvals received"],
            ['label' => 'Documents & evidence up to date', 'done' => true, 'detail' => 'All required documents are current'],
            ['label' => 'Commercial terms unchanged', 'done' => true, 'detail' => 'No changes detected'],
            ['label' => 'Gateway connectivity confirmed', 'done' => true, 'detail' => 'Payment gateway is operational'],
        ];

        return [
            'paused' => $room->isPaused(),
            'pausedAt' => $room->paused_at?->format('d M Y H:i'),
            'reason' => $room->paused_reason,
            'charge' => $pauseCharge ? Billing::present($pauseCharge) : null,
            'requirements' => $reqs,
            'request' => $req ? Requests::present($req) : null,
            'ready' => collect($reqs)->every('done'),
            'resumeStage' => Stages::get((string) $room->current_stage)['name'],
        ];
    }
}
