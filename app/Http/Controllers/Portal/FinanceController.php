<?php

namespace App\Http\Controllers\Portal;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Project;
use App\Models\Portal\Record;
use App\Support\Platform\Checkout;
use App\Support\Portal\Billing;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** CP-SCR-021..031: entitlements, orders, invoices, statement, quotations, contracts, fee manifest, stop-now, disputes. */
class FinanceController extends PortalController
{
    private function orderTitle(Order $o): string
    {
        return $o->meta['title'] ?? ($o->items->first()?->name ?? 'Order '.$o->reference);
    }

    public function entitlements(Request $request): Response
    {
        $orders = Billing::orders($this->user());
        $rows = collect();
        foreach ($orders as $o) {
            foreach ($o->items as $i) {
                $state = match ($o->status) { 'paid' => 'active', 'awaiting_payment' => 'pending_payment', 'refunded' => 'revoked', default => 'blocked' };
                $rows->push(['name' => $i->name, 'code' => $i->item_code, 'category' => ucwords(str_replace('-', ' ', $i->item_type)), 'access' => $o->isPaid() ? 'Full Access' : 'No Access',
                    'status' => $state, 'from' => $o->paid_at?->format('d M Y'), 'to' => $o->paid_at?->copy()->addYear()->format('d M Y'), 'order' => $o->reference,
                    'reason' => $o->isPaid() ? 'Verified payment' : 'Paid entitlement requires verified payment (CP-TEB 6.1)']);
            }
        }
        foreach (Project::where('user_id', $this->user()->id)->get() as $p) {
            $rows->push(['name' => $p->name, 'code' => $p->reference, 'category' => $p->category, 'access' => 'Full Access', 'status' => $p->status === 'completed' ? 'expired' : 'active', 'from' => $p->starts_on?->format('d M Y'), 'to' => $p->due_on?->format('d M Y'), 'order' => null, 'reason' => 'Engagement letter in force']);
        }
        $tab = $this->tab($request, 'all');
        $filtered = $tab === 'all' ? $rows : $rows->where('status', $tab)->values();
        $filtered = Ui::filter($filtered, $request, ['name', 'code', 'category'], ['category' => 'category']);

        return $this->register([
            'title' => 'Services and Entitlements', 'icon' => 'key-round', 'subtitle' => 'Entitlement is a server-side decision for an exact service, resource and period. An order or success page alone does not create access.',
            'actions' => [Ui::action('Request New Service', '/portal/intake', 'get', ['variant' => 'gold'])],
            'kpis' => [
                Ui::kpi('Active Services', $rows->where('status', 'active')->count(), 'Across '.$rows->pluck('category')->unique()->count().' categories', 'good', 'key-round'),
                Ui::kpi('Entitlements', $rows->count(), 'Granted & pending', 'neutral', 'badge-check'),
                Ui::kpi('Expiring Soon', $rows->filter(fn ($r) => $r['to'] && \Illuminate\Support\Carbon::parse($r['to'])->between(now(), now()->addDays(60)))->count(), 'Within 60 days', 'warn', 'calendar'),
                Ui::kpi('Pending Payment', $rows->where('status', 'pending_payment')->count(), 'Awaiting verified payment', 'warn', 'credit-card'),
                Ui::kpi('Service Tier', 'Premier', 'Valid until '.now()->addMonths(9)->format('d M Y'), 'gold', 'sparkles'),
            ],
            'tabs' => Ui::tabs(['all' => 'My Services', 'active' => 'Active', 'pending_payment' => 'Pending Payment', 'expired' => 'Expired']), 'tab' => $tab, 'search' => 'Search services…',
            'main' => [Ui::table(null, ['Service', 'Category', 'Access Level', 'Status', 'Valid From', 'Valid To', 'Decision Basis', ''], $filtered->map(fn ($r) => [
                Ui::stack($r['name'], $r['code']), Ui::pill($r['category'], 'info'), $r['access'], Ui::pill($r['status']), $r['from'] ?? '—', $r['to'] ?? '—', $r['reason'],
                Ui::actions([$r['status'] === 'pending_payment' ? Ui::action('Pay Now', '/checkout/'.$r['order'], 'get', ['variant' => 'gold']) : ($r['order'] ? Ui::action('View Order', '/portal/orders/'.$r['order']) : null)]),
            ])->all())],
            'side' => [
                Ui::donut('Entitlement Summary', [Ui::slice('Active', $rows->where('status', 'active')->count(), 'good'), Ui::slice('Pending Payment', $rows->where('status', 'pending_payment')->count(), 'warn'), Ui::slice('Expired / Revoked', $rows->whereIn('status', ['expired', 'revoked', 'blocked'])->count(), 'neutral')]),
                Ui::quick('Quick Actions', [Ui::action('Request New Service', '/portal/intake'), Ui::action('Upgrade Access', '/subscriptions/account'), Ui::action('View Usage & Limits', '/portal/usage')]),
                Ui::info('Service Health', 'All core services operational.', 'good', Ui::action('View System Status', '/portal/status')),
            ],
        ]);
    }

    public function orders(Request $request): Response
    {
        $orders = Billing::orders($this->user());
        $state = fn (Order $o) => match ($o->status) { 'paid' => 'completed', 'awaiting_payment' => 'in_progress', 'failed' => 'on_hold', default => 'cancelled' };
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $orders : $orders->filter(fn ($o) => $state($o) === $tab)->values();
        $rows = Ui::filter($rows, $request, ['reference', 'meta.title', 'section'], ['section' => 'section']);
        $page = Ui::page($rows, $request, 10);
        $counts = $orders->groupBy(fn ($o) => $state($o))->map->count();

        return $this->register([
            'title' => 'My Orders', 'icon' => 'shopping-bag', 'subtitle' => 'Every order placed across the TBCA platform, with payment, entitlement and delivery status.',
            'actions' => [Ui::action('New Order', '/shop', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Orders', $orders->count(), 'All time', 'neutral', 'shopping-bag'), Ui::kpi('In Progress', $counts['in_progress'] ?? 0, 'Awaiting payment', 'warn', 'history'), Ui::kpi('Completed', $counts['completed'] ?? 0, 'Paid & activated', 'good', 'badge-check'), Ui::kpi('On Hold', $counts['on_hold'] ?? 0, 'Payment failed', 'bad', 'circle-pause'), Ui::kpi('Cancelled', $counts['cancelled'] ?? 0, null, 'neutral', 'user-x')],
            'tabs' => Ui::tabs(['all' => ['All Orders', $orders->count()], 'in_progress' => 'In Progress', 'completed' => 'Completed', 'on_hold' => 'On Hold', 'cancelled' => 'Cancelled']), 'tab' => $tab, 'search' => 'Search by name, ID or service…',
            'filters' => [Ui::selectFilter('section', 'Category', $orders->pluck('section')->unique()->mapWithKeys(fn ($s) => [$s => ucwords(str_replace('-', ' ', $s))])->all())],
            'main' => [Ui::table(null, ['Order ID', 'Service / Product', 'Category', 'Status', 'Order Date', 'Amount', ''], $page['items']->map(fn ($o) => [
                Ui::ref($o->reference, '/portal/orders/'.$o->reference), Ui::stack($this->orderTitle($o), $o->items->count().' line(s)'), Ui::pill(ucwords(str_replace('-', ' ', $o->section)), 'info'),
                Ui::pill($state($o)), $o->created_at->format('d M Y'), Ui::money($o->total_zar),
                Ui::actions([$o->status === 'awaiting_payment' || $o->status === 'failed' ? Ui::action('Pay Now', '/checkout/'.$o->reference, 'get', ['variant' => 'gold']) : null, Ui::action('View', '/portal/orders/'.$o->reference)]),
            ])->all(), ['pagination' => $page['pagination'], 'empty' => 'No orders yet — browse the shop to get started.'])],
            'side' => [
                Ui::donut('Order Summary', [Ui::slice('In Progress', $counts['in_progress'] ?? 0, 'info'), Ui::slice('Completed', $counts['completed'] ?? 0, 'good'), Ui::slice('On Hold', $counts['on_hold'] ?? 0, 'warn'), Ui::slice('Cancelled', $counts['cancelled'] ?? 0, 'neutral')]),
                Ui::quick('Quick Actions', [Ui::action('Place New Order', '/shop'), Ui::action('View Invoices', '/portal/invoices'), Ui::action('Track Deliveries', '/portal/deliverables'), Ui::action('Request Support', '/portal/support?new=1')]),
            ],
        ]);
    }

    public function order(Order $order): Response
    {
        $this->ownOrFail($order);
        $order->load('items', 'payments');
        $paid = $order->isPaid();
        $step = $paid ? 4 : ($order->status === 'awaiting_payment' ? 1 : 2);

        return $this->register([
            'title' => $this->orderTitle($order), 'icon' => 'shopping-bag', 'code' => $order->reference, 'crumbs' => [['label' => 'My Orders', 'href' => '/portal/orders'], ['label' => $order->reference]],
            'subtitle' => 'Order placed '.$order->created_at->format('d M Y, H:i').' · '.ucwords(str_replace('-', ' ', $order->section)),
            'actions' => array_values(array_filter([
                Ui::action('Invoice (Print / PDF)', '/portal/invoices/'.$order->reference),
                ! $paid && $order->status !== 'cancelled' ? Ui::action('Cancel Order', '/portal/orders/'.$order->reference.'/cancel', 'post', ['confirm' => 'Cancel this unpaid order?', 'variant' => 'danger']) : null,
                ! $paid && $order->status !== 'cancelled' ? Ui::action('Pay Now', '/checkout/'.$order->reference, 'get', ['variant' => 'gold']) : null,
            ])),
            'kpis' => [Ui::kpi('Order ID', $order->reference, 'Version v1.0', 'neutral', 'receipt'), Ui::kpi('Order Date', $order->created_at->format('d M Y'), $order->created_at->format('H:i'), 'neutral', 'calendar'), Ui::kpi('Total Amount', Ui::zar($order->total_zar), 'incl. VAT & fees', 'gold', 'wallet'), Ui::kpi('Currency', $order->currency, null, 'neutral', 'credit-card'), Ui::kpi('Status', ucwords(str_replace('_', ' ', $order->status)), null, $paid ? 'good' : 'warn', 'badge-check')],
            'main' => [
                Ui::row([
                    Ui::kv('Order Information', [['Order ID', $order->reference], ['Customer', $order->billing['company'] ?? $this->user()->company], ['Ordered By', $order->billing['name'] ?? $this->user()->name], ['Order State', Ui::pill($order->status)], ['Last Updated', $order->updated_at->format('d M Y, H:i')]]),
                    Ui::kv('Finance Reconciliation', [['Invoice Number', Billing::invoiceNumber($order)], ['Invoice Amount', Ui::money($order->total_zar)], ['Payment Method', strtoupper($order->payments->where('status', 'succeeded')->first()?->method ?? '—')], ['Payment Reference', $order->payments->where('status', 'succeeded')->first()?->reference ?? '—'], ['Reconciled On', $order->paid_at?->format('d M Y') ?? 'Not yet paid']]),
                ]),
                Ui::table('Order Lines', ['#', 'Service / Resource', 'Qty', 'Unit Price', 'Amount (excl. VAT)'], $order->items->values()->map(fn ($i, $n) => [$n + 1, Ui::stack($i->name, $i->item_code), $i->quantity, Ui::money($i->unit_zar), Ui::money($i->line_zar)])->all(), [
                    'footer' => ['', 'Sub-total '.Ui::zar($order->subtotal_zar).' · VAT (15%) '.Ui::zar($order->vat_zar).' · Fees '.Ui::zar($order->fees_zar), '', 'Total', Ui::money($order->total_zar)],
                ]),
                Ui::table('Payments', ['Reference', 'Method', 'Amount', 'Status', 'Date', ''], $order->payments->map(fn ($p) => [Ui::ref($p->reference, '/portal/payments/'.$p->reference), strtoupper($p->method), Ui::money($p->amount_zar), Ui::pill($p->status), $p->created_at->format('d M Y, H:i'), Ui::actions([Ui::action('Receipt', '/portal/payments/'.$p->reference)])])->all(), ['empty' => 'No payment attempts yet.']),
            ],
            'side' => [
                Ui::steps('Order Status', [['label' => 'Ordered'], ['label' => 'Paid'], ['label' => 'Processing'], ['label' => 'Completed']], $step),
                Ui::info($paid ? 'Entitlement Result: Access Granted' : 'Entitlement Pending', $paid ? 'Entitlements activated on '.$order->paid_at?->format('d M Y').'.' : 'Access is granted only after verified payment.', $paid ? 'good' : 'warn', Ui::action('View Entitlements', '/portal/entitlements')),
                Ui::quick('Quick Actions', [Ui::action('View Invoice', '/portal/invoices/'.$order->reference), Ui::action('Request Support', '/portal/support?new=1'), Ui::action('Raise a Dispute', '/portal/disputes')]),
            ],
        ]);
    }

    public function cancelOrder(Order $order): RedirectResponse
    {
        $this->ownOrFail($order);
        abort_if($order->isPaid(), 422, 'Paid orders are cancelled through the dispute and refund route.');
        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Order cancelled.');
    }

    public function invoices(Request $request): Response
    {
        $user = $this->user();
        $orders = Billing::orders($user)->where('status', '!=', 'cancelled');
        $s = Billing::summary($user);
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $orders : $orders->filter(fn ($o) => Billing::invoiceStatus($o) === $tab);
        $rows = Ui::filter($rows->values(), $request, ['reference', 'meta.title']);
        $page = Ui::page($rows, $request, 10);
        $credits = Billing::credits($user);

        return $this->register([
            'title' => 'Invoices and Payments', 'icon' => 'credit-card', 'subtitle' => 'Invoices are generated from your orders; payments reconcile automatically.',
            'actions' => [Ui::action('Statement of Account', '/portal/statement')],
            'kpis' => [
                Ui::kpi('Total Invoiced', Ui::zar($s['invoiced']), 'Across '.$s['count'].' invoices', 'neutral', 'receipt'),
                Ui::kpi('Total Paid', Ui::zar($s['paid']), Ui::pct($s['paid'], $s['invoiced']).' of total invoiced', 'good', 'badge-check'),
                Ui::kpi('Outstanding', Ui::zar($s['outstanding']), 'Across '.$s['outstanding_count'].' invoices', 'warn', 'history'),
                Ui::kpi('Overdue', Ui::zar($s['overdue']), $s['overdue_count'].' invoices overdue', 'bad', 'alert-triangle'),
                Ui::kpi('Credits Available', Ui::zar($s['credits']), 'Available to apply', 'info', 'hand-coins'),
            ],
            'tabs' => Ui::tabs(['all' => 'All Invoices', 'outstanding' => 'Outstanding', 'overdue' => 'Overdue', 'paid' => 'Paid', 'refunded' => 'Refunds']), 'tab' => $tab, 'search' => 'Search invoices…',
            'main' => [
                Ui::table(null, ['Invoice No.', 'Date', 'Reference', 'Description', 'Due Date', 'Amount', 'Status', ''], $page['items']->map(fn ($o) => [
                    Ui::ref(Billing::invoiceNumber($o), '/portal/invoices/'.$o->reference), $o->created_at->format('d M Y'), $o->reference, $this->orderTitle($o), Billing::dueDate($o)->format('d M Y'), Ui::money($o->total_zar), Ui::pill(Billing::invoiceStatus($o)),
                    Ui::actions([in_array(Billing::invoiceStatus($o), ['outstanding', 'overdue'], true) ? Ui::action('Pay Now', '/checkout/'.$o->reference, 'get', ['variant' => 'gold']) : null, Ui::action('View', '/portal/invoices/'.$o->reference)]),
                ])->all(), ['pagination' => $page['pagination']]),
                Ui::table('Credit Notes', ['Reference', 'Description', 'Amount', 'Status'], $credits->map(fn ($c) => [Ui::ref($c->reference), $c->title, Ui::money(-$c->amount_zar), Ui::pill($c->status)])->all()),
            ],
            'side' => [
                Ui::donut('Payment Summary', [Ui::slice('Paid', $s['paid'], 'good', Ui::zar($s['paid'])), Ui::slice('Outstanding', $s['outstanding'] - $s['overdue'], 'info', Ui::zar($s['outstanding'] - $s['overdue'])), Ui::slice('Overdue', $s['overdue'], 'bad', Ui::zar($s['overdue']))], Ui::zar($s['invoiced']), 'Total Invoiced', ['label' => 'View Statement of Account', 'href' => '/portal/statement']),
                Ui::list('Recent Payments', Billing::payments($user)->where('status', 'succeeded')->take(4)->map(fn ($p) => Ui::item($p->reference, Ui::zar($p->amount_zar), $p->created_at->format('d M Y'), null, '/portal/payments/'.$p->reference))->values()->all()),
                Ui::quick('Quick Actions', [Ui::action('Make a Payment', '/portal/invoices?tab=outstanding'), Ui::action('Arrears & Payment Help', '/portal/arrears'), Ui::action('Raise a Dispute', '/portal/disputes')]),
            ],
        ]);
    }

    public function invoice(Order $order): Response
    {
        $this->ownOrFail($order);
        $order->load('items', 'payments');
        $org = $this->org();

        return Inertia::render('Portal/Invoice', [
            'invoice' => [
                'number' => Billing::invoiceNumber($order), 'reference' => $order->reference, 'date' => $order->created_at->format('d M Y'), 'due' => Billing::dueDate($order)->format('d M Y'),
                'status' => Billing::invoiceStatus($order), 'title' => $this->orderTitle($order),
                'billing' => ['name' => $order->billing['name'] ?? $this->user()->name, 'company' => $org->name, 'email' => $order->billing['email'] ?? $this->user()->email, 'vat' => $org->vat_number, 'address' => $org->head_office],
                'lines' => $order->items->map(fn ($i) => ['name' => $i->name, 'code' => $i->item_code, 'qty' => $i->quantity, 'unit' => $i->unit_zar, 'total' => $i->line_zar])->values(),
                'subtotal' => $order->subtotal_zar, 'vat' => $order->vat_zar, 'fees' => $order->fees_zar, 'total' => $order->total_zar,
                'payments' => $order->payments->map(fn ($p) => ['reference' => $p->reference, 'method' => strtoupper($p->method), 'amount' => $p->amount_zar, 'status' => $p->status, 'date' => $p->created_at->format('d M Y')])->values(),
                'payable' => in_array($order->status, ['awaiting_payment', 'failed'], true),
            ],
        ]);
    }

    public function payment(string $payment): Response
    {
        $payment = Payment::with('order.items')->where('reference', $payment)->firstOrFail();
        abort_unless($payment->order && (int) $payment->order->user_id === (int) $this->user()->id, 404);
        $o = $payment->order;
        $ok = $payment->status === 'succeeded';
        $excl = (int) round($payment->amount_zar / 1.15);

        return $this->register([
            'title' => 'Payment, Receipt and Credit Detail', 'icon' => 'receipt', 'code' => $payment->reference, 'crumbs' => [['label' => 'Invoices & Payments', 'href' => '/portal/invoices'], ['label' => $payment->reference]],
            'actions' => [Ui::action('View Invoice', '/portal/invoices/'.$o->reference, 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Transaction Type', 'Payment', $ok ? 'Funds received' : 'Not settled', 'neutral', 'credit-card'), Ui::kpi('Amount', Ui::zar($payment->amount_zar), 'incl. VAT', 'gold', 'wallet'), Ui::kpi('Payment Date', $payment->created_at->format('d M Y'), $payment->created_at->format('H:i'), 'neutral', 'calendar'), Ui::kpi('Status', $ok ? 'Cleared' : ucfirst($payment->status), $ok ? 'Funds cleared' : ($payment->failure_reason ?? ''), $ok ? 'good' : 'bad', 'badge-check'), Ui::kpi('Reference', $payment->reference, 'Internal reference', 'neutral', 'receipt')],
            'main' => [
                Ui::row([
                    Ui::kv('Transaction Information', [['Payment Method', strtoupper($payment->method)], ['Payer', $o->billing['company'] ?? $this->user()->company], ['To Account', 'The Business Clinic.Africa (Pty) Ltd'], ['Notes', 'Payment for '.$this->orderTitle($o)], ['Captured By', 'TBCA Payment Gateway'], ['Captured On', $payment->created_at->format('d M Y, H:i')]]),
                    Ui::kv('Amount Summary', [['Amount (excl. VAT)', Ui::money($excl)], ['VAT', Ui::money($payment->amount_zar - $excl)], ['Total', Ui::money($payment->amount_zar)], ['Allocated', Ui::money($ok ? $payment->amount_zar : 0)], ['Unallocated', Ui::money(0)], ['Allocation', $ok ? '✓ Fully Allocated' : 'Not allocated']]),
                ]),
                Ui::table('Allocation Summary', ['Invoice', 'Description', 'Invoice Amount', 'Allocated', 'Allocation %', 'Status'], [[Ui::ref(Billing::invoiceNumber($o), '/portal/invoices/'.$o->reference), $this->orderTitle($o), Ui::money($o->total_zar), Ui::money($ok ? $payment->amount_zar : 0), $ok ? Ui::pct($payment->amount_zar, $o->total_zar) : '0%', Ui::pill($ok ? 'paid' : $payment->status)]]),
            ],
            'side' => [Ui::timeline('Transaction Timeline', [['title' => 'Payment Initiated', 'meta' => $payment->created_at->format('d M, H:i'), 'tone' => 'good'], ['title' => $ok ? 'Funds Received' : 'Gateway Response: '.$payment->status, 'tone' => $ok ? 'good' : 'bad'], ['title' => 'Bank Reconciliation', 'sub' => $ok ? 'Matched and reconciled' : 'Pending', 'tone' => $ok ? 'good' : 'neutral'], ['title' => $ok ? 'Cleared' : 'Not cleared', 'tone' => $ok ? 'good' : 'neutral']]), Ui::quick('Related Links', [Ui::action('View Invoice', '/portal/invoices/'.$o->reference), Ui::action('Statement of Account', '/portal/statement')])],
        ]);
    }

    public function statement(Request $request): Response
    {
        $user = $this->user();
        $from = (string) $request->query('from', now()->subMonths(3)->startOfMonth()->toDateString());
        $to = (string) $request->query('to', now()->toDateString());
        $st = Billing::statement($user, $from, $to);
        $s = Billing::summary($user);
        $ageing = Billing::ageing($user);

        return $this->register([
            'title' => 'Statement of Account', 'icon' => 'scroll', 'subtitle' => 'A running ledger of invoices, payments and credits. Positive balances are owed to TBCA.',
            'actions' => [Ui::action('Download Statement (CSV)', '/portal/statement/download?from='.$from.'&to='.$to, 'get', ['download' => true]), Ui::action('Make a Payment', '/portal/invoices?tab=outstanding', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Account', $this->org()->name, $user->client_id, 'neutral', 'building'), Ui::kpi('Current Balance', Ui::zar(abs($st['closing'])), $st['closing'] > 0 ? 'Due' : 'Credit', $st['closing'] > 0 ? 'warn' : 'good', 'wallet'), Ui::kpi('Total Outstanding', Ui::zar($s['outstanding']), 'Overdue: '.Ui::zar($s['overdue']), 'bad', 'alert-triangle'), Ui::kpi('Credits Available', Ui::zar($s['credits']), null, 'info', 'hand-coins'), Ui::kpi('Statement Period', Ui::date($from).' – '.Ui::date($to), null, 'neutral', 'calendar')],
            'filters' => [Ui::selectFilter('from', 'Period from', [now()->subMonths(3)->startOfMonth()->toDateString() => 'Last 3 months', now()->subMonths(6)->startOfMonth()->toDateString() => 'Last 6 months', now()->startOfYear()->toDateString() => 'Year to date', '2020-01-01' => 'All time'])],
            'main' => [Ui::table('Transactions', ['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'], array_merge(
                [[Ui::date($from), 'Opening Balance', '—', 'Balance brought forward', '', '', Ui::money($st['opening'])]],
                array_map(fn ($l) => [$l['date']->format('d M Y'), $l['type'], $l['href'] ? Ui::ref($l['reference'], $l['href']) : Ui::ref($l['reference']), $l['description'], $l['debit'] ? Ui::money($l['debit']) : '', $l['credit'] ? Ui::money($l['credit']) : '', Ui::money($l['balance'])], $st['lines']),
            ), ['footer' => ['', 'Closing Balance', '', 'Carried forward', Ui::money($st['debits']), Ui::money($st['credits']), Ui::money($st['closing'])]])],
            'side' => [
                Ui::kv('Account Summary', [['Opening Balance', Ui::money($st['opening'])], ['Total Debits', Ui::money($st['debits'])], ['Total Credits', Ui::money($st['credits'])], ['Closing Balance', Ui::money($st['closing'])], ['As at', now()->format('d M Y')]]),
                Ui::list('Ageing Summary (Outstanding)', collect($ageing)->map(fn ($v, $k) => Ui::item($k, Ui::zar($v)))->values()->push(Ui::item('Total Outstanding', Ui::zar(array_sum($ageing))))->all()),
                Ui::info('Source', 'Statement projected from authoritative orders, payments and approved credit notes (CP:C). Source version '.now()->format('Ymd').'; reconciliation state current.', 'neutral'),
            ],
        ]);
    }

    public function statementDownload(Request $request): StreamedResponse
    {
        $st = Billing::statement($this->user(), $request->query('from'), $request->query('to'));

        return response()->streamDownload(function () use ($st) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date', 'Type', 'Reference', 'Description', 'Debit (ZAR)', 'Credit (ZAR)', 'Balance (ZAR)']);
            fputcsv($out, ['', 'Opening Balance', '', '', '', '', $st['opening']]);
            foreach ($st['lines'] as $l) {
                fputcsv($out, [$l['date']->format('Y-m-d'), $l['type'], $l['reference'], $l['description'], $l['debit'], $l['credit'], $l['balance']]);
            }
            fputcsv($out, ['', 'Closing Balance', '', '', $st['debits'], $st['credits'], $st['closing']]);
            fclose($out);
        }, 'TBCA-statement-'.now()->format('Ymd').'.csv', ['Content-Type' => 'text/csv']);
    }

    public function quotations(Request $request): Response
    {
        $all = Record::where('user_id', $this->user()->id)->where('register', 'quotation')->orderBy('sort')->get();
        $all->each(function ($q) {
            if ($q->status === 'sent' && $q->due_on?->isPast()) {
                $q->update(['status' => 'expired']);
            }
        });
        $tab = $this->tab($request, 'all');
        $rows = match ($tab) { 'all' => $all, 'closed' => $all->whereIn('status', ['declined', 'expired']), default => $all->where('status', $tab) };
        $rows = Ui::filter($rows->values(), $request, ['title', 'reference']);

        return $this->register([
            'title' => 'Quotations and Proposals', 'icon' => 'file-text', 'subtitle' => 'Review proposals from TBCA. Accepting a quotation converts it into an order you can pay securely.',
            'actions' => [Ui::action('Request a Quotation', '/portal/intake', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total', $all->count(), 'All time', 'neutral', 'file-text'), Ui::kpi('Draft', $all->where('status', 'draft')->count(), 'In preparation', 'neutral', 'history'), Ui::kpi('Sent', $all->where('status', 'sent')->count(), 'Awaiting your response', 'warn', 'inbox'), Ui::kpi('Accepted', $all->where('status', 'accepted')->count(), 'Converted to order', 'good', 'badge-check'), Ui::kpi('Declined / Expired', $all->whereIn('status', ['declined', 'expired'])->count(), 'Not accepted', 'bad', 'user-x')],
            'tabs' => Ui::tabs(['all' => 'All', 'draft' => 'Draft', 'sent' => 'Sent', 'accepted' => 'Accepted', 'closed' => 'Declined / Expired']), 'tab' => $tab, 'search' => 'Search quotations…',
            'main' => [Ui::table(null, ['Reference', 'Title', 'Type', 'Status', 'Valid Until', 'Total (excl. VAT)', ''], $rows->map(fn ($q) => [
                Ui::ref($q->reference), Ui::stack($q->title, collect($q->data['lines'] ?? [])->pluck('label')->implode(' · ')), $q->data['type'] ?? 'Quotation', Ui::pill($q->status), Ui::date($q->due_on), Ui::money($q->amount_zar),
                Ui::actions($q->status === 'sent' ? [Ui::action('Accept & Pay', '/portal/quotations/'.$q->id.'/accept', 'post', ['variant' => 'gold', 'confirm' => 'Accept this proposal? An order will be created for payment.']), Ui::action('Request Changes', '/portal/quotations/'.$q->id.'/changes', 'post'), Ui::action('Decline', '/portal/quotations/'.$q->id.'/decline', 'post', ['variant' => 'danger', 'confirm' => 'Decline this proposal?'])] : [!empty($q->data['order']) ? Ui::action('View Order', '/portal/orders/'.$q->data['order']) : null]),
            ])->all())],
            'side' => [Ui::donut('Proposal Summary', [Ui::slice('Draft', $all->where('status', 'draft')->count(), 'neutral'), Ui::slice('Sent', $all->where('status', 'sent')->count(), 'warn'), Ui::slice('Accepted', $all->where('status', 'accepted')->count(), 'good'), Ui::slice('Declined / Expired', $all->whereIn('status', ['declined', 'expired'])->count(), 'bad')]), Ui::info('How acceptance works', 'Gate approval shows exact scope, fee lines and what happens if you decline. Accepting creates an order; the work is only scheduled after verified payment.', 'info')],
        ]);
    }

    public function quotationAction(Record $record, string $action): RedirectResponse
    {
        $this->ownOrFail($record);
        abort_unless($record->register === 'quotation' && $record->status === 'sent', 422, 'This quotation can no longer be actioned.');
        if ($action === 'accept') {
            $lines = collect($record->data['lines'] ?? [['label' => $record->title, 'amount' => $record->amount_zar]])->map(fn ($l, $i) => ['item_type' => 'quotation', 'item_code' => $record->reference.'-'.($i + 1), 'name' => $l['label'], 'unit_zar' => (int) $l['amount']])->all();
            $order = Checkout::createOrder($lines, $this->user(), 'portal', ['title' => $record->title, 'quotation' => $record->reference, 'return_url' => '/portal/quotations']);
            $data = $record->data;
            $data['order'] = $order->reference;
            $record->update(['status' => 'accepted', 'data' => $data]);

            return redirect()->route('checkout.show', $order);
        }
        $record->update(['status' => $action === 'decline' ? 'declined' : 'draft']);
        Portal::notify($this->user(), $action === 'decline' ? 'Proposal declined' : 'Change request received', $record->title.' ('.$record->reference.')', 'finance', '/portal/quotations', 'Quotations', 'Finance');

        return back()->with('success', $action === 'decline' ? 'Proposal declined.' : 'Change request sent — the proposal returns to draft while TBCA revises it.');
    }

    public function contracts(Request $request): Response
    {
        $all = Record::where('user_id', $this->user()->id)->where('register', 'contract')->orderBy('sort')->get();
        $statusOf = fn ($c) => $c->status === 'signed' && $c->due_on?->isPast() ? 'expired' : $c->status;
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->filter(fn ($c) => $tab === 'expired' ? $statusOf($c) === 'expired' : ($c->data['type'] ?? '') === $tab);
        $soon = $all->filter(fn ($c) => $statusOf($c) === 'signed' && $c->due_on && $c->due_on->lte(now()->addDays(60)));

        return $this->register([
            'title' => 'Contracts and Engagement Letters', 'icon' => 'file-signature', 'subtitle' => 'Signed instruments, pending signatures and upcoming expiries. Signing requires step-up verification.',
            'actions' => [Ui::action('Upload Document', '/portal/documents/upload', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Instruments', $all->count(), 'Across all statuses', 'neutral', 'file-signature'), Ui::kpi('Signed', $all->filter(fn ($c) => $statusOf($c) === 'signed')->count(), 'Active agreements', 'good', 'badge-check'), Ui::kpi('Pending Signature', $all->where('status', 'pending_signature')->count(), 'Awaiting your action', 'warn', 'stamp'), Ui::kpi('Expiring Soon', $soon->count(), 'Within 60 days', 'warn', 'calendar'), Ui::kpi('Expired', $all->filter(fn ($c) => $statusOf($c) === 'expired')->count(), 'Require attention', 'bad', 'alert-triangle')],
            'tabs' => Ui::tabs(['all' => 'All Instruments', 'Contract' => 'Contracts', 'Engagement Letter' => 'Engagement Letters', 'Addendum' => 'Addenda', 'expired' => 'Expired']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Instrument', 'Type', 'Counterparty', 'Status', 'Signed Date', 'Valid Until', ''], $rows->values()->map(fn ($c) => [
                Ui::stack($c->title, $c->reference), Ui::pill($c->data['type'] ?? '', 'info'), $c->data['counterparty'] ?? '', Ui::pill($statusOf($c)), Ui::date($c->data['signed_on'] ?? null),
                ($c->due_on ? $c->due_on->format('d M Y').' ('.($c->due_on->isPast() ? 'expired '.$c->due_on->diffForHumans() : 'in '.(int) now()->diffInDays($c->due_on).' days').')' : '—'),
                Ui::actions([$c->status === 'pending_signature' ? Ui::action('Review & Sign', '/portal/contracts/'.$c->id.'/sign', 'post', ['variant' => 'gold', 'confirm' => "Sign {$c->title}? This is a binding commitment."]) : null]),
            ])->all())],
            'side' => [Ui::donut('Contract Health Overview', [Ui::slice('Signed (Active)', $all->filter(fn ($c) => $statusOf($c) === 'signed')->count(), 'good'), Ui::slice('Pending Signature', $all->where('status', 'pending_signature')->count(), 'warn'), Ui::slice('Expired', $all->filter(fn ($c) => $statusOf($c) === 'expired')->count(), 'bad')]), Ui::list('Upcoming Expiries', $soon->map(fn ($c) => Ui::item($c->title, $c->due_on->format('d M Y'), 'In '.(int) now()->diffInDays($c->due_on).' days'))->values()->all()), Ui::quick('Quick Actions', [Ui::action('Request Contract Variation', '/portal/variations'), Ui::action('View Fee Manifest', '/portal/fee-manifest')])],
        ]);
    }

    public function signContract(Record $record): RedirectResponse
    {
        $this->ownOrFail($record);
        abort_unless($record->register === 'contract' && $record->status === 'pending_signature', 422);
        if ($r = $this->needsStepUp()) {
            return $r;
        }
        $data = $record->data;
        $data['signed_on'] = now()->toDateString();
        $data['signed_by'] = $this->user()->name;
        $record->update(['status' => 'signed', 'data' => $data, 'due_on' => now()->addYear()]);
        Portal::notify($this->user(), 'Contract signed', $record->title.' is now in force.', 'compliance', '/portal/contracts', 'Contracts', 'Compliance');

        return back()->with('success', $record->title.' signed. A durable receipt has been recorded.');
    }

    public function feeManifest(Request $request): Response
    {
        $lines = Record::where('user_id', $this->user()->id)->where('register', 'fee_line')->orderBy('sort')->get();
        $rows = Ui::filter($lines, $request, ['title', 'data.description'], ['category' => 'data.category', 'class' => 'data.class', 'status' => 'status']);
        $total = (int) $lines->sum('amount_zar');
        $classes = ['A' => 'A – Certain', 'B' => 'B – Probable', 'C' => 'C – Possible', 'D' => 'D – Unlikely'];
        $pay = ['currently_payable' => 'Currently Payable', 'payable_if_event' => 'Payable if event occurs', 'not_payable' => 'Not currently payable'];
        $payableNow = (int) $lines->where('status', 'currently_payable')->sum('amount_zar');

        return $this->register([
            'title' => 'Fee Manifest', 'icon' => 'receipt', 'code' => $lines->first()->data['manifest'] ?? null, 'subtitle' => 'Qualified fee lines by namespace, basis, certainty class and payability. Exposure is never shown as payable.',
            'kpis' => [Ui::kpi('Manifest ID', $lines->first()->data['manifest'] ?? '—', 'Version 1.0', 'neutral', 'receipt'), Ui::kpi('Engagement', $lines->first()->data['engagement'] ?? '—', null, 'neutral', 'folder-kanban'), Ui::kpi('Total (excl. VAT)', Ui::zar($total), 'ZAR', 'gold', 'wallet'), Ui::kpi('Currently Payable', Ui::zar($payableNow), 'Class A, trigger satisfied', 'good', 'badge-check'), Ui::kpi('Exposure (non-payable)', Ui::zar($total - $payableNow), 'Payable only if events occur', 'warn', 'trending-up')],
            'search' => 'Search fee lines…', 'filters' => [Ui::selectFilter('category', 'Category', ['Professional Fee', 'Third-Party Cost', 'Direct Expense', 'Reimbursable Expense']), Ui::selectFilter('class', 'Certainty Class', $classes), Ui::selectFilter('status', 'Payability', $pay)],
            'main' => [Ui::table(null, ['#', 'Fee / Item Description', 'Category', 'Basis', 'Certainty Class', 'Payability State', 'Amount'], $rows->values()->map(fn ($l, $i) => [$i + 1, Ui::stack($l->title, $l->data['description'] ?? ''), $l->data['category'] ?? '', $l->data['basis'] ?? '', Ui::pill($classes[$l->data['class'] ?? 'A'] ?? '', ['A' => 'good', 'B' => 'warn', 'C' => 'info', 'D' => 'neutral'][$l->data['class'] ?? 'A'] ?? 'neutral'), Ui::pill($pay[$l->status] ?? $l->status, $l->status === 'currently_payable' ? 'good' : 'neutral'), Ui::money($l->amount_zar)])->all(), [
                'footer' => ['', 'Subtotal '.Ui::zar($total).' · VAT (15%) '.Ui::zar((int) round($total * 0.15)), '', '', '', 'Total', Ui::money((int) round($total * 1.15))],
            ])],
            'side' => [
                Ui::donut('Manifest Summary', $lines->groupBy('data.category')->map(fn ($g, $k) => Ui::slice($k, (int) $g->sum('amount_zar'), ['Professional Fee' => 'good', 'Third-Party Cost' => 'info', 'Direct Expense' => 'gold', 'Reimbursable Expense' => 'orange'][$k] ?? 'neutral', Ui::zar($g->sum('amount_zar'))))->values()->all(), Ui::zar($total)),
                Ui::bars('Certainty Class Breakdown', collect($classes)->map(fn ($label, $k) => Ui::bar($label, $total ? round($lines->where('data.class', $k)->sum('amount_zar') / $total * 100) : 0, Ui::zar($lines->where('data.class', $k)->sum('amount_zar'))))->values()->all()),
                Ui::info('Payability rule', 'CP:EXPOSURE is future, estimated or contingent and remains non-payable until the exact approved money event fires and reconciles (CP-TEB 14.3).', 'info'),
            ],
        ]);
    }

    public function stopNow(Request $request): Response
    {
        $projects = Project::where('user_id', $this->user()->id)->where('status', '!=', 'completed')->get();
        abort_if($projects->isEmpty(), 404, 'You have no active engagements.');
        $p = $projects->firstWhere('reference', $request->query('engagement')) ?? $projects->first();
        $c = Billing::stopNow($p);

        return $this->register([
            'title' => 'If I Stop Now', 'icon' => 'circle-pause', 'subtitle' => 'Understand consequences, obligations and alternatives before deciding.',
            'banner' => ['tone' => 'info', 'title' => 'This is a decision support tool.', 'body' => 'It does not process cancellations or refunds. You remain in control.'],
            'filters' => [Ui::selectFilter('engagement', 'Engagement', $projects->mapWithKeys(fn ($x) => [$x->reference => $x->name])->all())],
            'kpis' => [Ui::kpi('Current Engagement', $p->name, $p->reference, 'neutral', 'folder-kanban'), Ui::kpi('Engagement Value', Ui::zar($c['fee']), 'excl. VAT', 'gold', 'wallet'), Ui::kpi('Progress', $p->progress.'%', ucwords(str_replace('_', ' ', $p->status)), 'info', 'activity'), Ui::kpi('Billed to Date', Ui::zar($c['billed']), null, 'neutral', 'receipt')],
            'main' => [
                Ui::cards('Impact Summary', [
                    Ui::card('Work Completed', $p->progress.'% of total scope completed', 'Value delivered: '.Ui::zar($c['delivered']), null, 'badge-check', 'good'),
                    Ui::card('Work in Progress', 'Current stage: '.$p->current_stage, 'In-progress value: '.Ui::zar($c['wip']), null, 'history', 'warn'),
                    Ui::card('Future Work', 'Not started', 'Remaining value: '.Ui::zar($c['future']), null, 'calendar', 'info'),
                    Ui::card('Payable If You Stop Now', 'Delivered work + 50% of WIP, less amounts already billed', Ui::zar($c['payable']), null, 'wallet', 'bad'),
                    Ui::card('Outstanding Obligations', 'Tasks, approvals and information still open', $c['open_items'].' open items', '/portal/actions', 'list-checks', 'warn'),
                ], 5),
                Ui::table('Upcoming Payments if You Continue', ['Milestone', 'Date', 'Amount', 'Status'], collect($c['milestones'])->map(fn ($m) => [$m['label'], Ui::date($m['date']), Ui::money($m['amount']), Ui::pill($m['status'])])->all(), ['footer' => ['Total Remaining', '', Ui::money($c['remaining_if_continue']), '']]),
                Ui::checklist('Your Obligations if You Stop Now', [Ui::check('Pay for work already completed and accepted'), Ui::check('Settle any outstanding invoices'), Ui::check('Return or hand over TBCA deliverables'), Ui::check('No use of partial deliverables', 'warn'), Ui::check('Close access and permissions')]),
            ],
            'side' => [
                Ui::info('Important', 'Stopping now may delay your objectives, reduce value and increase future costs. Final amounts are confirmed against actual work measurement and contract terms.', 'bad'),
                Ui::quick('What Are Your Options?', [Ui::action('Pause Engagement', '/portal/account/exit?option=pause'), Ui::action('Adjust Scope', '/portal/variations'), Ui::action('Proceed as Planned', '/portal/projects/'.$p->reference), Ui::action('Stop Engagement', '/portal/account/exit?option=cancel')]),
            ],
        ]);
    }

    public function disputes(Request $request): Response
    {
        $all = PortalCase::where('user_id', $this->user()->id)->where('kind', 'dispute')->latest('submitted_at')->get();
        $tab = $this->tab($request, 'all');
        $rows = match ($tab) { 'all' => $all, 'closed' => $all->whereIn('status', ['resolved', 'closed']), default => $all->filter(fn ($c) => strtolower($c->payload['type'] ?? '') === $tab) };
        $orders = Billing::orders($this->user());

        return $this->register([
            'title' => 'Disputes, Refunds and Chargebacks', 'icon' => 'scale', 'subtitle' => 'A dispute is scoped to the exact engagement or invoice. It never suspends unrelated paid rights.',
            'actions' => [Ui::modal('Raise New Case', 'dispute', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Open Cases', $all->whereIn('status', ['open', 'awaiting_info'])->count(), 'Require your attention', 'bad', 'scale'), Ui::kpi('Under Review', $all->where('status', 'under_review')->count(), 'With our team', 'warn', 'history'), Ui::kpi('Resolved', $all->whereIn('status', ['resolved', 'closed'])->count(), 'Last 90 days', 'good', 'badge-check'), Ui::kpi('Refunds Approved', Ui::zar($all->where('status', 'resolved')->where('payload.type', 'Refund')->sum('amount_zar')), 'Last 90 days', 'info', 'hand-coins'), Ui::kpi('Chargebacks', $all->where('payload.type', 'Chargeback')->whereNotIn('status', ['resolved', 'closed'])->count(), 'Open', 'neutral', 'credit-card')],
            'tabs' => Ui::tabs(['all' => 'All Cases', 'dispute' => 'Disputes', 'refund' => 'Refunds', 'chargeback' => 'Chargebacks', 'closed' => 'Closed']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Case ID', 'Type', 'Subject', 'Related To', 'Amount', 'Status', 'Priority', 'Updated'], $rows->values()->map(fn ($c) => [Ui::ref($c->reference), $c->payload['type'] ?? 'Dispute', $c->title, $c->payload['related'] ?? '—', Ui::money($c->amount_zar), Ui::pill($c->status), Ui::pill($c->priority ?? 'medium'), $c->updated_at->diffForHumans()])->all())],
            'side' => [Ui::info('Before You Raise a Case', 'Many billing questions are answered in the Help Centre. A case freezes only the contested scope and keeps your other rights intact.', 'info', Ui::action('Go to Help Centre', '/portal/help')), Ui::quick('Raise a New Case', [Ui::modal('Raise a Dispute', 'dispute', ['data' => ['type' => 'Dispute']]), Ui::modal('Request a Refund', 'dispute', ['data' => ['type' => 'Refund']]), Ui::modal('Report a Chargeback', 'dispute', ['data' => ['type' => 'Chargeback']])])],
            'forms' => ['dispute' => Ui::form('Raise a New Case', '/portal/disputes', [
                Ui::field('type', 'Case type', 'select', ['required' => true, 'options' => Ui::options(['Dispute', 'Refund', 'Chargeback'])]),
                Ui::field('related', 'Related invoice', 'select', ['required' => true, 'options' => $orders->map(fn ($o) => ['value' => Billing::invoiceNumber($o), 'label' => Billing::invoiceNumber($o).' – '.$this->orderTitle($o).' ('.Ui::zar($o->total_zar).')'])->values()->all()]),
                Ui::field('subject', 'Subject', 'text', ['required' => true]), Ui::field('amount', 'Amount disputed (ZAR)', 'number', ['required' => true]),
                Ui::field('details', 'What happened?', 'textarea', ['required' => true]),
            ], 'Submit Case')],
        ]);
    }

    public function raiseDispute(Request $request): RedirectResponse
    {
        $d = $request->validate(['type' => 'required|in:Dispute,Refund,Chargeback', 'related' => 'required|string|max:60', 'subject' => 'required|string|max:160', 'amount' => 'required|integer|min:1', 'details' => 'required|string|max:2000']);
        $prefix = ['Dispute' => 'DSP', 'Refund' => 'REF', 'Chargeback' => 'CHB'][$d['type']];
        $ref = $prefix.'-'.now()->format('Y').'-'.str_pad((string) (PortalCase::where('kind', 'dispute')->count() + 13), 4, '0', STR_PAD_LEFT);
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'dispute', 'reference' => $ref, 'title' => $d['subject'], 'status' => 'open', 'priority' => $d['amount'] > 20000 ? 'high' : 'medium', 'amount_zar' => $d['amount'], 'payload' => ['type' => $d['type'], 'related' => 'Invoice '.$d['related'], 'details' => $d['details']], 'submitted_at' => now(), 'due_at' => now()->addDays(10), 'step' => 99]);
        Portal::notify($this->user(), $d['type'].' case received', "{$ref}: {$d['subject']}", 'finance', '/portal/disputes', 'Disputes', 'Finance');

        return back()->with('success', "Case {$ref} created. We will acknowledge within 1 business day.");
    }
}
