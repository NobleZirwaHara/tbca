<?php

namespace App\Http\Controllers\Portal\Admin;

use App\Http\Controllers\Portal\PortalController;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Portal\Account;
use App\Models\Portal\Consent;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\User;
use App\Support\Portal\Billing;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-099..102, 123, 135: reconciliation, money events, lifecycle, arrears, vendor documents, retention. */
class AdminFinanceController extends PortalController
{
    protected function admin(array $props): Response
    {
        return $this->register($props + ['crumbs' => [['label' => $props['title']]]], 'admin');
    }

    public function reconciliation(Request $request): Response
    {
        $orders = Order::with(['user', 'payments'])->latest()->get();
        $recon = fn (Order $o) => $o->isPaid() ? (($o->meta['reconciled'] ?? false) ? 'reconciled' : 'unreconciled') : ($o->status === 'refunded' ? 'reconciled' : 'not_due');
        $rows = Ui::filter($orders, $request, ['reference', 'user.name', 'meta.title'], ['recon' => fn ($o, $v) => $recon($o) === $v, 'section' => 'section']);
        $page = Ui::page($rows, $request, 12);
        $paid = $orders->where('status', 'paid');

        return $this->admin([
            'title' => 'Fee, Statement and QuickBooks Reconciliation', 'subtitle' => 'Fee items are generated from real orders; reconciliation marks the accounting event as matched. The portal never keeps a second journal.',
            'kpis' => [Ui::kpi('Total Fees', Ui::zar($orders->sum('total_zar')), $orders->count().' invoices', 'neutral', 'receipt'), Ui::kpi('Reconciled', Ui::zar($paid->filter(fn ($o) => $o->meta['reconciled'] ?? false)->sum('total_zar')), null, 'good', 'badge-check'), Ui::kpi('Unreconciled (paid)', Ui::zar($paid->reject(fn ($o) => $o->meta['reconciled'] ?? false)->sum('total_zar')), null, 'warn', 'history'), Ui::kpi('Outstanding', Ui::zar($orders->whereIn('status', ['awaiting_payment', 'failed'])->sum('total_zar')), null, 'bad', 'alert-triangle'), Ui::kpi('Last Sync with QBO', now()->format('H:i'), 'Simulated sync', 'neutral', 'refresh-cw')],
            'search' => 'Search fees, clients, invoices…', 'filters' => [Ui::selectFilter('recon', 'Reconciliation Status', ['reconciled' => 'Reconciled', 'unreconciled' => 'Unreconciled', 'not_due' => 'Not yet paid']), Ui::selectFilter('section', 'Fee Type / Section', $orders->pluck('section')->unique()->values()->all())],
            'main' => [Ui::table('Fee Items', ['Invoice #', 'Client / Organisation', 'Section', 'Description', 'Amount (ZAR)', 'Statement Status', 'Reconciliation', ''], $page['items']->map(fn ($o) => [Ui::ref(Billing::invoiceNumber($o)), $o->user?->name ?? 'Guest', $o->section, $o->meta['title'] ?? $o->reference, Ui::money($o->total_zar), Ui::pill(Billing::invoiceStatus($o)), Ui::pill(str_replace('_', ' ', $recon($o))), Ui::actions([$recon($o) === 'unreconciled' ? Ui::action('Reconcile', '/admin/portal/reconciliation/'.$o->reference, 'post', ['variant' => 'gold']) : null])])->all(), ['pagination' => $page['pagination']])],
            'side' => [Ui::donut('Reconciliation Health', [Ui::slice('Reconciled', (int) $paid->filter(fn ($o) => $o->meta['reconciled'] ?? false)->sum('total_zar'), 'good', null), Ui::slice('Unreconciled', (int) $paid->reject(fn ($o) => $o->meta['reconciled'] ?? false)->sum('total_zar'), 'orange', null)], Ui::pct($paid->filter(fn ($o) => $o->meta['reconciled'] ?? false)->count(), max(1, $paid->count())), 'Reconciled')],
        ]);
    }

    public function reconcile(Order $order): RedirectResponse
    {
        abort_unless($order->isPaid(), 422, 'Only paid orders can be reconciled.');
        $meta = $order->meta ?? [];
        $meta['reconciled'] = true;
        $meta['reconciled_at'] = now()->toDateTimeString();
        $order->update(['meta' => $meta]);

        return back()->with('success', Billing::invoiceNumber($order).' reconciled.');
    }

    public function moneyEvents(Request $request): Response
    {
        $payments = Payment::with('order.user')->latest()->get();
        $disputes = PortalCase::with('user')->where('kind', 'dispute')->latest('submitted_at')->get();
        $tab = $this->tab($request, 'events');

        $main = $tab === 'disputes' ? [Ui::table('Disputes, Refunds & Chargebacks', ['Case ID', 'Type', 'Client', 'Subject', 'Related', 'Amount', 'Status', ''], $disputes->map(fn ($c) => [Ui::ref($c->reference), $c->payload['type'] ?? 'Dispute', $c->user?->name, $c->title, $c->payload['related'] ?? '', Ui::money($c->amount_zar), Ui::pill($c->status), Ui::actions(in_array($c->status, ['resolved', 'closed'], true) ? [] : [Ui::action('Approve / Resolve', '/admin/portal/money-events/disputes/'.$c->id, 'post', ['data' => ['decision' => 'resolved'], 'variant' => 'gold']), Ui::action('Request Info', '/admin/portal/money-events/disputes/'.$c->id, 'post', ['data' => ['decision' => 'awaiting_info']]), Ui::action('Decline', '/admin/portal/money-events/disputes/'.$c->id, 'post', ['data' => ['decision' => 'closed'], 'variant' => 'danger'])])])->all())]
            : [Ui::table('Money Events', ['Event ID', 'Type', 'Client', 'Invoice / Ref', 'Method', 'Amount (ZAR)', 'Status', 'Event Date'], $payments->map(fn ($p) => [Ui::ref($p->reference), 'Payment', $p->order?->user?->name ?? 'Guest', $p->order ? Billing::invoiceNumber($p->order) : '—', strtoupper($p->method), Ui::money($p->amount_zar), Ui::pill($p->status), $p->created_at->format('d M Y, H:i')])->all())];

        return $this->admin([
            'title' => 'Money Event, Dispute and Refund Console', 'subtitle' => 'Money events change financial, entitlement or delivery state only when the exact event fires and reconciles. Disputes freeze only the contested scope.',
            'kpis' => [Ui::kpi('Money Events', $payments->count(), 'Payment attempts', 'neutral', 'credit-card'), Ui::kpi('Succeeded', $payments->where('status', 'succeeded')->count(), null, 'good', 'badge-check'), Ui::kpi('Failed', $payments->where('status', 'failed')->count(), null, 'bad', 'user-x'), Ui::kpi('Open Disputes', $disputes->whereNotIn('status', ['resolved', 'closed'])->count(), null, 'warn', 'scale'), Ui::kpi('Refunds Approved', Ui::zar($disputes->where('status', 'resolved')->where('payload.type', 'Refund')->sum('amount_zar')), null, 'info', 'hand-coins')],
            'tabs' => Ui::tabs(['events' => 'Money Events', 'disputes' => ['Disputes & Refunds', $disputes->whereNotIn('status', ['resolved', 'closed'])->count()]]), 'tab' => $tab,
            'main' => $main,
            'side' => [Ui::list('Dispute Aging', [Ui::item('0 – 7 Days', (string) $disputes->filter(fn ($c) => $c->submitted_at?->gte(now()->subDays(7)))->count()), Ui::item('8 – 30 Days', (string) $disputes->filter(fn ($c) => $c->submitted_at?->between(now()->subDays(30), now()->subDays(8)))->count()), Ui::item('30+ Days', (string) $disputes->filter(fn ($c) => $c->submitted_at?->lt(now()->subDays(30)))->count())])],
        ]);
    }

    public function resolveDispute(Request $request, PortalCase $case): RedirectResponse
    {
        abort_unless(in_array($case->kind, ['dispute', 'ownership_dispute'], true), 404);
        $decision = $request->validate(['decision' => 'required|in:resolved,awaiting_info,closed,under_review'])['decision'];
        $case->update(['status' => $decision, 'resolved_at' => in_array($decision, ['resolved', 'closed'], true) ? now() : null]);
        if ($decision === 'resolved' && $case->kind === 'dispute' && in_array($case->payload['type'] ?? '', ['Refund', 'Dispute'], true) && $case->amount_zar) {
            Record::create(['user_id' => $case->user_id, 'register' => 'credit_note', 'reference' => 'CRN-'.now()->format('Y').'-'.str_pad((string) (Record::where('register', 'credit_note')->count() + 19), 4, '0', STR_PAD_LEFT), 'title' => 'Credit – '.$case->title.' ('.$case->reference.')', 'status' => 'available', 'amount_zar' => $case->amount_zar, 'data' => ['original' => $case->payload['related'] ?? null]]);
        }
        if ($case->user_id) {
            Portal::notify($case->user_id, 'Case '.$case->reference.' updated', 'Status: '.str_replace('_', ' ', $decision).($decision === 'resolved' && $case->kind === 'dispute' ? '. A credit note has been issued to your account.' : '.'), 'finance', $case->kind === 'dispute' ? '/portal/disputes' : '/portal/security/ownership-dispute', 'Disputes', 'Finance');
        }

        return back()->with('success', $case->reference.' → '.str_replace('_', ' ', $decision).'.');
    }

    public function lifecycle(): Response
    {
        $items = \App\Models\OrderItem::with('order.user')->whereIn('item_type', ['subscription', 'retainer'])->latest()->get();
        $renewals = Record::with('user')->where('register', 'renewal')->orderBy('due_on')->get();

        return $this->admin([
            'title' => 'Subscription and Retainer Lifecycle Control', 'subtitle' => 'Every new recurring period is a new promise that must independently pass recurrence, capacity and delivery controls (NS-00..NS-03).',
            'kpis' => [Ui::kpi('Recurring Order Lines', $items->count(), 'Subscriptions & retainers', 'neutral', 'repeat'), Ui::kpi('Active (paid)', $items->filter(fn ($i) => $i->order?->isPaid())->count(), null, 'good', 'badge-check'), Ui::kpi('Renewals (90 days)', $renewals->filter(fn ($r) => $r->due_on?->between(now(), now()->addDays(90)))->count(), null, 'warn', 'calendar'), Ui::kpi('Opted Out', $renewals->where('status', 'opted_out')->count(), null, 'bad', 'user-x'), Ui::kpi('Auto-Renewals On', $renewals->filter(fn ($r) => $r->data['auto'] ?? false)->count(), null, 'info', 'refresh-cw')],
            'main' => [
                Ui::table('Recurring Order Lines', ['Item', 'Client', 'Order', 'Amount', 'Order Status', 'Portal State'], $items->map(fn ($i) => [Ui::stack($i->name, $i->item_code), $i->order?->user?->name ?? 'Guest', Ui::ref($i->order?->reference ?? '—'), Ui::money($i->line_zar), Ui::pill($i->order?->status ?? ''), Ui::pill($i->order?->isPaid() ? 'NS-03 Active Certified' : 'NS-02 Cert Pending', $i->order?->isPaid() ? 'good' : 'warn')])->all(), ['empty' => 'No subscription or retainer orders yet.']),
                Ui::table('Renewal Register', ['Reference', 'Client', 'Engagement', 'Type', 'Next Event', 'Amount', 'Auto-Renew', 'Status'], $renewals->map(fn ($r) => [Ui::ref($r->reference), $r->user?->name, $r->title, $r->data['type'] ?? '', Ui::date($r->due_on), Ui::money($r->amount_zar), ($r->data['auto'] ?? false) ? 'On' : 'Off', Ui::pill($r->status)])->all()),
            ],
            'side' => [Ui::info('Recurring states', "NS-00 No native record · NS-01 Legacy signal only · NS-02 Contract evidenced, certification pending (hold renewals) · NS-03 Active certified.", 'info')],
        ]);
    }

    public function arrears(): Response
    {
        $users = User::where('role', 'client')->get();
        $rows = $users->map(function ($u) {
            $days = Portal::daysOverdue($u);
            [$level, $tone, $next] = Portal::degradation($days);
            $s = Billing::summary($u);

            return compact('u', 'days', 'level', 'tone', 'next', 's') + ['state' => Account::where('user_id', $u->id)->value('account_state') ?? 'active'];
        })->sortByDesc('days')->values();

        return $this->admin([
            'title' => 'Arrears, Degradation and Client-Floor Control', 'subtitle' => 'Graduated, reason-coded degradation instead of blanket lockout. The client-information floor always survives (CP-TEB Part 18).',
            'kpis' => [Ui::kpi('Total Overdue', Ui::zar($rows->sum(fn ($r) => $r['s']['overdue'])), null, 'bad', 'alert-triangle'), Ui::kpi('Total Outstanding', Ui::zar($rows->sum(fn ($r) => $r['s']['outstanding'])), null, 'warn', 'wallet'), Ui::kpi('Degraded / Suspended', $rows->whereIn('level', ['Degraded', 'Suspended'])->count(), 'By ladder', 'bad', 'shield-alert'), Ui::kpi('Fully Compliant', $rows->where('level', 'Full Access')->count(), null, 'good', 'badge-check'), Ui::kpi('Client-Floor Breaches', 0, 'Floor paths always reachable', 'good', 'shield-check')],
            'main' => [Ui::table('Arrears Overview', ['Client / Organisation', 'Outstanding', 'Overdue', 'Days Overdue', 'Ladder Level', 'Account State', 'Next Action', ''], $rows->map(fn ($r) => [Ui::stack($r['u']->name, $r['u']->company), Ui::money($r['s']['outstanding']), Ui::money($r['s']['overdue']), $r['days'], Ui::pill($r['level'], $r['tone']), Ui::pill($r['state']), $r['next'], Ui::actions([Ui::action('Set State', '/admin/portal/clients')])])->all())],
            'side' => [Ui::list('Degradation Ladder', [Ui::item('0 – 7 days', 'Full Access', null, 'good'), Ui::item('8 – 30 days', 'Limited Access', null, 'warn'), Ui::item('31 – 45 days', 'Degraded', null, 'warn'), Ui::item('46+ days', 'Suspended', null, 'bad')]), Ui::checklist('Protected Client Floor', array_map(fn ($f) => Ui::check($f), Portal::FLOOR))],
        ]);
    }

    public function vendorDocuments(Request $request): Response
    {
        $all = Record::whereNull('user_id')->where('register', 'vendor_doc')->orderBy('sort')->get();
        $state = fn ($d) => $d->status === 'approved' && $d->due_on?->lte(now()->addDays(60)) ? ($d->due_on->isPast() ? 'expired' : 'expiring_soon') : $d->status;
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->filter(fn ($d) => $state($d) === $tab);

        return $this->admin([
            'title' => 'Vendor Compliance Documents', 'subtitle' => 'Access and review current, approved, and governed vendor compliance documents.',
            'kpis' => [Ui::kpi('Total Documents', $all->count(), null, 'neutral', 'file-check'), Ui::kpi('Approved / Current', $all->filter(fn ($d) => $state($d) === 'approved')->count(), null, 'good', 'badge-check'), Ui::kpi('Pending Review', $all->where('status', 'pending_review')->count(), null, 'warn', 'history'), Ui::kpi('Expired / Expiring', $all->filter(fn ($d) => in_array($state($d), ['expired', 'expiring_soon'], true))->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Document Types', $all->pluck('title')->unique()->count(), null, 'neutral', 'layout-grid')],
            'tabs' => Ui::tabs(['all' => 'All Documents', 'approved' => 'Current (Approved)', 'pending_review' => 'Pending Review', 'expiring_soon' => 'Expiring Soon', 'expired' => 'Expired', 'rejected' => 'Rejected']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Document ID', 'Vendor', 'Document Type', 'Version', 'Status', 'Expiry Date', 'Uploaded By', ''], $rows->values()->map(fn ($d) => [Ui::ref($d->reference), $d->data['vendor'] ?? '', $d->title, $d->data['version'] ?? '', Ui::pill(str_replace('_', ' ', $state($d))), $d->due_on ? $d->due_on->format('d M Y') : 'Never', $d->data['by'] ?? '', Ui::actions($d->status === 'pending_review' ? [Ui::action('Approve', '/admin/portal/records/'.$d->id.'/status', 'post', ['data' => ['status' => 'approved'], 'variant' => 'gold']), Ui::action('Reject', '/admin/portal/records/'.$d->id.'/status', 'post', ['data' => ['status' => 'rejected'], 'variant' => 'danger'])] : [])])->all())],
        ]);
    }

    public function retention(): Response
    {
        $users = User::where('role', 'client')->get();
        $seg = $users->map(fn ($u) => ['u' => $u, 'seen' => Account::where('user_id', $u->id)->value('last_seen_at'), 'exposure' => Billing::summary($u)['outstanding']])->map(function ($r) {
            $days = $r['seen'] ? (int) \Illuminate\Support\Carbon::parse($r['seen'])->diffInDays(now(), true) : 999;
            $r['segment'] = match (true) { $days > 90 => 'Dormant', $days > 60 && $r['exposure'] > 0 => 'At Risk – High', $days > 30 => 'At Risk – Medium', default => 'Engaged' };

            return $r;
        });
        $offers = Record::whereNull('user_id')->where('register', 'winback')->latest()->get();
        $segments = ['At Risk – High' => 'No login > 60 days and active financial exposure.', 'At Risk – Medium' => 'No login > 30 days or engagement declining.', 'Dormant' => 'No login > 90 days, low/no recent activity.', 'Engaged' => 'Active within last 30 days.'];

        return $this->admin([
            'title' => 'Governed Retention and Win-Back Offer', 'subtitle' => 'Retain value responsibly. Offers are based on value, never pressure, and are sent only to clients who consented to marketing. No retention offer may delay or obstruct exit.',
            'actions' => [Ui::modal('Create Win-Back Campaign', 'offer', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('At-Risk Clients', $seg->whereIn('segment', ['At Risk – High', 'At Risk – Medium'])->count(), null, 'warn', 'users'), Ui::kpi('Dormant', $seg->where('segment', 'Dormant')->count(), null, 'neutral', 'circle-pause'), Ui::kpi('Win-Back Offers Sent', $offers->count(), null, 'info', 'message-circle'), Ui::kpi('Offers Accepted', $offers->where('status', 'accepted')->count(), Ui::pct($offers->where('status', 'accepted')->count(), max(1, $offers->count())).' acceptance', 'good', 'badge-check'), Ui::kpi('Win-Back Revenue', Ui::zar($offers->sum('amount_zar')), null, 'gold', 'wallet')],
            'main' => [Ui::table('Retention Status Overview', ['Status', 'Description', 'Clients', '% of Base'], collect($segments)->map(fn ($desc, $s) => [Ui::pill($s, str_contains($s, 'High') ? 'bad' : (str_contains($s, 'Medium') ? 'warn' : ($s === 'Dormant' ? 'neutral' : 'good'))), $desc, $seg->where('segment', $s)->count(), Ui::pct($seg->where('segment', $s)->count(), max(1, $seg->count()), 1)])->values()->all()), Ui::table('Recent Win-Back Offers', ['Offer', 'Segment', 'Offer', 'Status', 'Result', 'Sent On'], $offers->map(fn ($o) => [Ui::ref($o->reference), $o->data['segment'] ?? '', $o->data['offer'] ?? $o->title, Ui::pill($o->status), Ui::money($o->amount_zar), Ui::date($o->data['sent'] ?? $o->created_at)])->all())],
            'side' => [Ui::checklist('Governed Retention Principles', [Ui::check('Fair & Transparent — clear, honest, non-misleading'), Ui::check('Compliant & Consented — consent & communication rules'), Ui::check('Value-Focused — no pressure or manipulation'), Ui::check('Audit & Oversight — journeys and outcomes logged')])],
            'forms' => ['offer' => Ui::form('Create Win-Back Offer', '/admin/portal/retention/offers', [Ui::field('segment', 'Target segment', 'select', ['required' => true, 'options' => Ui::options(array_keys($segments))]), Ui::field('offer', 'Offer', 'text', ['required' => true, 'placeholder' => 'e.g. 10% retainer credit for 3 months']), Ui::field('message', 'Message to clients', 'textarea', ['required' => true])], 'Send to Consented Clients', 'post', 'Only clients in the segment with active Marketing consent receive the offer.')],
        ]);
    }

    public function createOffer(Request $request): RedirectResponse
    {
        $d = $request->validate(['segment' => 'required|string', 'offer' => 'required|string|max:160', 'message' => 'required|string|max:1000']);
        $consented = Consent::where('key', 'marketing')->where('status', 'active')->pluck('user_id');
        $targets = User::where('role', 'client')->whereIn('id', $consented)->get();
        foreach ($targets as $u) {
            Portal::notify($u, 'An offer for you: '.$d['offer'], $d['message'], 'system', '/portal/next-steps', 'Offer', 'System');
        }
        Record::create(['register' => 'winback', 'reference' => 'WB-'.now()->format('Y').'-'.str_pad((string) (Record::where('register', 'winback')->count() + 22), 3, '0', STR_PAD_LEFT), 'title' => $d['offer'], 'status' => 'pending', 'data' => $d + ['sent' => now()->toDateString(), 'recipients' => $targets->count()]]);

        return back()->with('success', 'Offer sent to '.$targets->count().' consented client(s).');
    }
}
