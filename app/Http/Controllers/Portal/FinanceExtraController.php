<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Membership;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Project;
use App\Models\Portal\Record;
use App\Support\Platform\Checkout;
use App\Support\Portal\Billing;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-032/033/034/048/122/126/128/138. */
class FinanceExtraController extends PortalController
{
    private function records(string $register)
    {
        return Record::where('user_id', $this->user()->id)->where('register', $register)->orderBy('sort')->get();
    }

    public function renewals(Request $request): Response
    {
        $all = $this->records('renewal');
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->filter(fn ($r) => strtolower(str_replace(' ', '-', $r->data['type'] ?? '')) === $tab || $r->status === $tab);
        $annual = (int) $all->whereNotIn('status', ['expired', 'opted_out'])->sum('amount_zar');

        return $this->register([
            'title' => 'Renewals and Price Changes', 'icon' => 'refresh-cw', 'subtitle' => 'Every renewal is a new promise. Price changes are notified in advance and you can opt out before they take effect.',
            'kpis' => [Ui::kpi('Upcoming Renewals', $all->where('status', 'upcoming')->filter(fn ($r) => $r->due_on?->lte(now()->addDays(90)))->count(), 'Next 90 days', 'neutral', 'calendar'), Ui::kpi('Price Increases', $all->filter(fn ($r) => ($r->data['change'] ?? 0) > 0)->count(), 'Pending in 90 days', 'warn', 'trending-up'), Ui::kpi('Notices Active', $all->whereIn('status', ['notice_issued', 'effective_soon'])->count(), 'Notice period active', 'info', 'bell'), Ui::kpi('Auto-Renewals On', $all->filter(fn ($r) => $r->data['auto'] ?? false)->count(), 'Across engagements', 'good', 'repeat'), Ui::kpi('Total Annual Value', Ui::zar($annual * 1.15), 'incl. VAT', 'gold', 'wallet')],
            'tabs' => Ui::tabs(['all' => 'All Items', 'renewal' => 'Renewals', 'price-increase' => 'Price Increases', 'price-change' => 'Price Changes', 'auto-renewal' => 'Auto-Renewals', 'opted_out' => 'Opted Out']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Engagement / Contract', 'Type', 'Current Period End', 'Next Event', 'New Price (excl. VAT)', 'Change', 'Auto-Renew', 'Status', ''], $rows->values()->map(fn ($r) => [
                Ui::stack($r->title, $r->reference), $r->data['type'] ?? '', Ui::date($r->data['period_end'] ?? null), Ui::date($r->due_on), Ui::money($r->amount_zar), ($r->data['change'] ?? 0) ? '+'.$r->data['change'].'%' : '—',
                ($r->data['auto'] ?? false) ? 'On' : 'Off', Ui::pill($r->status),
                Ui::actions(in_array($r->status, ['upcoming', 'notice_issued', 'effective_soon'], true) ? [Ui::action('Accept', '/portal/renewals/'.$r->id.'/accept', 'post', ['variant' => 'gold']), Ui::action(($r->data['auto'] ?? false) ? 'Turn off auto-renew' : 'Turn on auto-renew', '/portal/renewals/'.$r->id.'/auto', 'post'), Ui::action('Opt Out', '/portal/renewals/'.$r->id.'/opt-out', 'post', ['variant' => 'danger', 'confirm' => 'Opt out of this renewal? Your current period continues until it ends.'])] : []),
            ])->all())],
            'side' => [Ui::list('Upcoming Renewals', $all->where('status', 'upcoming')->sortBy('due_on')->map(fn ($r) => Ui::item($r->title, Ui::date($r->due_on), 'In '.(int) now()->diffInDays($r->due_on).' days'))->values()->all()), Ui::list('Price Change Notices', $all->filter(fn ($r) => ($r->data['change'] ?? 0) > 0)->map(fn ($r) => Ui::item($r->title, '+'.$r->data['change'].'%', 'Effective '.Ui::date($r->due_on), 'warn'))->values()->all()), Ui::info('Your rights', 'No retention offer may delay or obstruct an opt-out. Cancellation produces a durable receipt.', 'info')],
        ]);
    }

    public function renewalAction(Record $record, string $action): RedirectResponse
    {
        $this->ownOrFail($record);
        $data = $record->data;
        if ($action === 'auto') {
            $data['auto'] = ! ($data['auto'] ?? false);
            $record->update(['data' => $data]);

            return back()->with('success', 'Auto-renew turned '.($data['auto'] ? 'on' : 'off').'.');
        }
        $record->update(['status' => $action === 'accept' ? 'accepted' : 'opted_out', 'data' => $data + ['decided_at' => now()->toDateTimeString()]]);
        Portal::notify($this->user(), $action === 'accept' ? 'Renewal accepted' : 'Renewal opt-out confirmed', $record->title.' ('.$record->reference.')', 'finance', '/portal/renewals', 'Renewals', 'Finance');

        return back()->with('success', $action === 'accept' ? 'Renewal accepted. It will be invoiced on the renewal date.' : 'Opt-out recorded. A durable receipt has been added to your notifications.');
    }

    public function usage(): Response
    {
        $meters = $this->records('meter');
        $wallet = Record::where('user_id', $this->user()->id)->where('register', 'wallet')->first();
        $state = fn ($m) => ($pct = $m->data['used'] / max(1, $m->data['limit']) * 100) >= 95 ? 'critical' : ($pct >= 80 ? 'high_usage' : 'normal');
        $avg = $meters->avg(fn ($m) => $m->data['used'] / max(1, $m->data['limit']) * 100);

        return $this->register([
            'title' => 'Usage, Metering and Top-Ups', 'icon' => 'gauge', 'subtitle' => 'Track metered allowances across your services and top up your usage wallet.',
            'actions' => [Ui::modal('Top-Up Now', 'topup', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Active Meters', $meters->count(), 'Across services', 'neutral', 'gauge'), Ui::kpi("This Month's Usage", round($avg).'%', 'Of total allowance', 'warn', 'activity'), Ui::kpi('Remaining Allowance', round(100 - $avg).'%', 'Average across meters', 'good', 'trending-up'), Ui::kpi('Alerts', $meters->filter(fn ($m) => $state($m) !== 'normal')->count(), 'Require attention', 'bad', 'alert-triangle'), Ui::kpi('Wallet Balance', Ui::zar($wallet?->amount_zar ?? 0), 'Available for top-ups', 'gold', 'wallet')],
            'main' => [
                Ui::table('All Meters', ['Service / Meter', 'Meter Type', 'Allowance / Limit', 'Used', 'Remaining', 'Period', 'Status'], $meters->map(fn ($m) => [
                    Ui::stack($m->title, $m->reference), $m->data['type'], number_format($m->data['limit']).' '.$m->data['unit'], Ui::progress($m->data['used'] / max(1, $m->data['limit']) * 100, number_format($m->data['used']).' ('.round($m->data['used'] / max(1, $m->data['limit']) * 100).'%)'),
                    number_format($m->data['limit'] - $m->data['used']).' '.$m->data['unit'], now()->startOfMonth()->format('d M').' – '.now()->endOfMonth()->format('d M'), Ui::pill(str_replace('_', ' ', $state($m)), ['critical' => 'bad', 'high_usage' => 'warn', 'normal' => 'good'][$state($m)]),
                ])->all(), ['caption' => 'Status rule: 95% or more is Critical, 80% or more is High Usage.']),
                Ui::cards('Usage Alerts', $meters->filter(fn ($m) => $state($m) !== 'normal')->map(fn ($m) => Ui::card($m->title.' at '.round($m->data['used'] / $m->data['limit'] * 100).'%', 'Consider a top-up or upgrade to avoid interruption.', null, null, 'alert-triangle', 'bad', [Ui::modal('Top Up', 'topup')]))->values()->all(), 3),
            ],
            'side' => [Ui::kv('Top-Up Your Account', [['Wallet Balance', Ui::money($wallet?->amount_zar ?? 0)]], Ui::modal('Top-Up Now', 'topup', ['variant' => 'gold'])), Ui::list('Recent Top-Ups', collect($wallet?->data['topups'] ?? [])->map(fn ($t) => Ui::item(Ui::zar($t['amount']), Ui::date($t['date'])))->all())],
            'forms' => ['topup' => Ui::form('Top up your usage wallet', '/portal/usage/top-up', [Ui::field('amount', 'Amount (ZAR)', 'select', ['required' => true, 'options' => Ui::options(['5000' => 'R5 000', '10000' => 'R10 000', '20000' => 'R20 000', '50000' => 'R50 000'])])], 'Continue to Payment', 'post', 'You will be taken to the secure payment page. The wallet is credited once payment is verified.')],
        ]);
    }

    public function topUp(Request $request): RedirectResponse
    {
        $amount = (int) $request->validate(['amount' => 'required|in:5000,10000,20000,50000'])['amount'];
        $order = Checkout::createOrder([['item_type' => 'credits', 'item_code' => 'WALLET-TOPUP', 'name' => 'Usage wallet top-up', 'unit_zar' => $amount]], $this->user(), 'portal', ['title' => 'Usage wallet top-up', 'wallet_topup' => $amount, 'return_url' => '/portal/usage']);

        return redirect()->route('checkout.show', $order);
    }

    public function arrears(): Response
    {
        $user = $this->user();
        $s = Billing::summary($user);
        $days = Portal::daysOverdue($user);
        [$level, $tone] = Portal::degradation($days);
        $plan = PortalCase::where('user_id', $user->id)->where('kind', 'payment_help')->latest()->first();
        $credits = $s['credits'];

        return $this->register([
            'title' => 'Arrears and Payment-Difficulty Explainer', 'icon' => 'alert-triangle', 'subtitle' => 'Understand your balance, what happens next and the help available. Your protected client floor always remains.',
            'banner' => $s['overdue'] > 0 ? ['tone' => 'bad', 'title' => 'Attention Required', 'body' => 'Your account has overdue invoices. Please review your balance and take action to avoid service restrictions.', 'meta' => $days.' days past due'] : ['tone' => 'good', 'title' => 'Your account is up to date', 'body' => 'No invoices are overdue.'],
            'actions' => [Ui::action('Pay Now', '/portal/invoices?tab=outstanding', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Overdue', Ui::zar($s['overdue']), $s['overdue_count'].' invoices', 'bad', 'alert-triangle'), Ui::kpi('Total Outstanding', Ui::zar($s['outstanding']), 'Includes current invoices', 'warn', 'wallet'), Ui::kpi('Credits Available', Ui::zar($credits), null, 'info', 'hand-coins'), Ui::kpi('Payment Plan In Place', $plan ? ucfirst($plan->status) : 'No', $plan ? 'Requested '.$plan->created_at->format('d M Y') : null, 'neutral', 'calendar'), Ui::kpi('Entitlement Level', $level, $days.' days overdue', $tone, 'shield-check')],
            'main' => [
                Ui::kv('Your Balance Breakdown', [['Overdue Invoices', Ui::money($s['overdue'])], ['Current Invoices (due within 7 days)', Ui::money($s['outstanding'] - $s['overdue'])], ['Credits & Adjustments', Ui::money(-$credits)], ['Total Outstanding', Ui::money(max(0, $s['outstanding'] - $credits))]], Ui::action('View Statement of Account', '/portal/statement')),
                Ui::timeline('What Happens Next?', [['title' => 'Reminder Sent', 'sub' => 'Day 1-7 · Email and WhatsApp reminders', 'tone' => $days >= 0 ? 'gold' : 'neutral'], ['title' => 'Limited Access', 'sub' => 'Day 8-30 · New orders and approvals held', 'tone' => $days > 7 ? 'warn' : 'neutral'], ['title' => 'Degraded Service', 'sub' => 'Day 31-45 · Access to gated workspaces restricted', 'tone' => $days > 30 ? 'bad' : 'neutral'], ['title' => 'Account Suspension', 'sub' => 'Day 46+ · No new work started; protected floor remains', 'tone' => $days > 45 ? 'bad' : 'neutral']]),
                ['kind' => 'form', 'title' => 'Help Options Available', 'form' => Ui::form('Request help', '/portal/arrears/help', [
                    Ui::field('option', 'What would help?', 'radio', ['required' => true, 'options' => [['value' => 'payment_plan', 'label' => 'Payment Plan', 'hint' => 'Spread the balance over instalments'], ['value' => 'extension', 'label' => 'Payment Extension', 'hint' => 'Request more time'], ['value' => 'finance_call', 'label' => 'Speak to Finance Team', 'hint' => 'We will call you'], ['value' => 'hardship', 'label' => 'Financial Hardship Support', 'hint' => 'Confidential hardship review']]]),
                    Ui::field('details', 'Tell us more (optional)', 'textarea'),
                ], 'Request Help')],
            ],
            'side' => [Ui::checklist('Always available (client floor)', array_map(fn ($f) => Ui::check($f), Portal::FLOOR)), Ui::info('Communication is key', 'Hardship and dispute paths are always visible before any restriction. Talk to us early.', 'gold', Ui::action('Contact Finance Team', '/portal/messages'))],
        ]);
    }

    public function arrearsHelp(Request $request): RedirectResponse
    {
        $d = $request->validate(['option' => 'required|in:payment_plan,extension,finance_call,hardship', 'details' => 'nullable|string|max:1000']);
        $ref = 'PH-'.now()->format('Y').'-'.random_int(1000, 9999);
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'payment_help', 'reference' => $ref, 'title' => ucwords(str_replace('_', ' ', $d['option'])), 'status' => 'submitted', 'payload' => $d, 'submitted_at' => now(), 'step' => 99]);

        return back()->with('success', "Request {$ref} received. Our finance team will contact you within 1 business day.");
    }

    public function obligations(): Response
    {
        $all = $this->records('obligation');
        $money = (int) $all->whereNotNull('amount_zar')->whereNotIn('status', ['completed'])->sum('amount_zar');

        return $this->register([
            'title' => 'What TBCA Owes Me', 'icon' => 'hand-coins', 'subtitle' => 'Every refund, credit, replacement, handover and remedy TBCA owes you, with its current status.',
            'kpis' => [Ui::kpi('Current Monetary Obligations', Ui::zar($money), 'Refunds & credits', 'gold', 'wallet'), Ui::kpi('Replacement & Corrections', $all->where('title', 'Replacement / Correction')->count(), 'In progress', 'warn', 'refresh-cw'), Ui::kpi('Deliverables & Handover', $all->whereIn('title', ['Undelivered Deliverable', 'Client Document Handover'])->count(), 'Ready or pending', 'info', 'package'), Ui::kpi('Service Recovery Actions', $all->where('title', 'Service-Recovery Action')->count(), null, 'neutral', 'life-buoy'), Ui::kpi('Under Investigation', $all->where('status', 'not_calculable')->count(), 'Not yet calculable', 'bad', 'file-search')],
            'main' => [Ui::table('Your Obligations Overview', ['Obligation Type', 'Description', 'Related To', 'Amount', 'Status', 'Last Updated'], $all->map(fn ($o) => [$o->title, $o->data['description'] ?? '', $o->data['related'] ?? '', $o->status === 'not_calculable' ? Ui::money(null) : ($o->amount_zar ? Ui::money($o->amount_zar) : '—'), Ui::pill($o->status), $o->updated_at->format('d M Y')])->all())],
            'side' => [Ui::kv('Obligations Summary', [['Total Monetary Obligations', Ui::money($money)], ['Non-Monetary', (string) $all->whereNull('amount_zar')->count()], ['Under Investigation', (string) $all->where('status', 'not_calculable')->count()]]), Ui::quick('Quick Actions', [Ui::action('Request Refund', '/portal/disputes'), Ui::action('View Credits', '/portal/invoices'), Ui::action('View Handover Items', '/portal/closure'), Ui::action('Contact Support', '/portal/support?new=1')])],
        ]);
    }

    public function forwardExposure(): Response
    {
        $user = $this->user();
        $months = collect(range(0, 11))->map(fn ($i) => now()->startOfMonth()->addMonths($i));
        $buckets = $months->mapWithKeys(fn ($m) => [$m->format('Y-m') => ['confirmed' => 0, 'probable' => 0, 'possible' => 0, 'risk' => 0]])->all();
        $add = function ($date, string $type, int $amount) use (&$buckets) {
            $k = \Illuminate\Support\Carbon::parse($date)->format('Y-m');
            if (isset($buckets[$k])) {
                $buckets[$k][$type] += $amount;
            }
        };
        foreach (Billing::orders($user)->whereIn('status', ['awaiting_payment', 'failed']) as $o) {
            Billing::dueDate($o)->isPast() ? $add(now(), 'risk', $o->total_zar) : $add(Billing::dueDate($o), 'confirmed', $o->total_zar);
        }
        foreach (Project::where('user_id', $user->id)->get() as $p) {
            foreach ($p->meta['milestones'] ?? [] as $m) {
                $add($m['date'], 'confirmed', (int) $m['amount']);
            }
        }
        foreach ($this->records('fee_line') as $l) {
            $class = $l->data['class'] ?? 'A';
            if ($class !== 'A') {
                $add(now()->addMonths($class === 'B' ? 2 : 4), $class === 'B' ? 'probable' : 'possible', (int) $l->amount_zar);
            }
        }
        foreach ($this->records('renewal')->whereIn('status', ['upcoming', 'notice_issued', 'effective_soon']) as $r) {
            $add($r->due_on, 'probable', (int) $r->amount_zar);
        }
        $tot = fn ($k) => array_sum(array_column($buckets, $k));
        $total = $tot('confirmed') + $tot('probable') + $tot('possible') + $tot('risk');
        $peak = collect($buckets)->map(fn ($b) => array_sum($b))->sortDesc();

        return $this->register([
            'title' => 'Forward Exposure and Twelve-Month View', 'icon' => 'trending-up', 'code' => 'CP-SCR-126', 'subtitle' => 'See your confirmed and probable obligations across the next 12 months. Evidence-backed. Exposure is not payable until its money event occurs.',
            'kpis' => [Ui::kpi('Total Forward Exposure', Ui::zar($total), 'Next 12 months', 'neutral', 'calendar'), Ui::kpi('Confirmed Obligations', Ui::zar($tot('confirmed')), Ui::pct($tot('confirmed'), $total, 1).' of total', 'good', 'badge-check'), Ui::kpi('Probable Obligations', Ui::zar($tot('probable')), Ui::pct($tot('probable'), $total, 1), 'warn', 'history'), Ui::kpi('Possible Obligations', Ui::zar($tot('possible')), Ui::pct($tot('possible'), $total, 1), 'info', 'circle-pause'), Ui::kpi('Overdue / At Risk', Ui::zar($tot('risk')), Ui::pct($tot('risk'), $total, 1), 'bad', 'alert-triangle'), Ui::kpi('Peak Month', $peak->keys()->first() ? \Illuminate\Support\Carbon::parse($peak->keys()->first().'-01')->format('M Y') : '—', Ui::zar($peak->first() ?? 0), 'neutral', 'trending-up')],
            'main' => [
                Ui::chart('Forward Exposure by Month (Next 12 Months)', $months->map(fn ($m) => $m->format('M y'))->all(), [['label' => 'Confirmed', 'tone' => 'good', 'values' => array_column($buckets, 'confirmed')], ['label' => 'Probable', 'tone' => 'orange', 'values' => array_column($buckets, 'probable')], ['label' => 'Possible', 'tone' => 'info', 'values' => array_column($buckets, 'possible')], ['label' => 'At Risk / Overdue', 'tone' => 'bad', 'values' => array_column($buckets, 'risk')]], 'stacked', 'All amounts in ZAR, incl. VAT where invoiced.'),
                Ui::table('Forward Exposure Summary', ['Month', 'Confirmed', 'Probable', 'Possible', 'At Risk / Overdue', 'Total'], collect($buckets)->map(fn ($b, $k) => [\Illuminate\Support\Carbon::parse($k.'-01')->format('M Y'), Ui::money($b['confirmed']), Ui::money($b['probable']), Ui::money($b['possible']), Ui::money($b['risk']), Ui::money(array_sum($b))])->values()->all()),
            ],
            'side' => [Ui::donut('Exposure by Type', [Ui::slice('Confirmed', $tot('confirmed'), 'good', Ui::zar($tot('confirmed'))), Ui::slice('Probable', $tot('probable'), 'orange', Ui::zar($tot('probable'))), Ui::slice('Possible', $tot('possible'), 'info', Ui::zar($tot('possible'))), Ui::slice('At Risk / Overdue', $tot('risk'), 'bad', Ui::zar($tot('risk')))], Ui::zar($total)), Ui::info('Notes', 'Confirmed = invoiced or contracted milestones. Probable = class B fee lines and renewals. Possible = class C lines. Forward exposure is recalculated on every visit.', 'neutral')],
        ]);
    }

    public function groupBilling(): Response
    {
        $user = $this->user();
        $s = Billing::summary($user);
        $ms = Membership::with('organisation')->where('user_id', $user->id)->get();
        $current = $this->account()->organisation_id;
        $rows = $ms->map(function ($m) use ($current, $s) {
            $b = $m->organisation->meta['billing'] ?? ['billed' => 0, 'paid' => 0, 'overdue' => 0, 'credit' => 0];
            if ($m->organisation_id === $current) {
                $b = ['billed' => $s['invoiced'], 'paid' => $s['paid'], 'overdue' => $s['overdue'], 'credit' => $s['credits']];
            }

            return ['org' => $m->organisation, 'billed' => $b['billed'], 'paid' => $b['paid'], 'outstanding' => max(0, $b['billed'] - $b['paid']), 'overdue' => $b['overdue'], 'credit' => $b['credit'], 'balance' => max(0, $b['billed'] - $b['paid']) - $b['credit']];
        });

        return $this->register([
            'title' => 'Group and Consolidated Billing View', 'icon' => 'building-2', 'code' => 'CP-SCR-128', 'subtitle' => 'Consolidated billing position, charges, payments and balances across your organisation group. Each legal entity stays separate.',
            'kpis' => [Ui::kpi('Total Group Balance', Ui::zar($rows->sum('balance')), 'Outstanding', 'bad', 'users'), Ui::kpi('Total Billed', Ui::zar($rows->sum('billed')), 'This year', 'good', 'receipt'), Ui::kpi('Total Paid', Ui::zar($rows->sum('paid')), Ui::pct($rows->sum('paid'), max(1, $rows->sum('billed')), 1).' of billed', 'neutral', 'credit-card'), Ui::kpi('Overdue Amount', Ui::zar($rows->sum('overdue')), null, 'warn', 'alert-triangle'), Ui::kpi('Entities', $rows->count(), $rows->where('overdue', '>', 0)->count().' with overdue', 'neutral', 'building-2'), Ui::kpi('Next Invoice Run', now()->addDays(7)->format('d M Y'), 'In 7 days', 'neutral', 'calendar')],
            'main' => [Ui::table('Consolidated Summary by Organisation', ['Organisation', 'Type', 'Status', 'Billed', 'Paid', 'Outstanding', 'Overdue', 'Credit / Prepay', 'Balance'], $rows->map(fn ($r) => [Ui::stack($r['org']->name, $r['org']->reference), $r['org']->org_type, Ui::pill($r['org']->status), Ui::money($r['billed']), Ui::money($r['paid']), Ui::money($r['outstanding']), Ui::money($r['overdue']), Ui::money($r['credit']), Ui::money($r['balance'])])->all(), [
                'footer' => ['GROUP TOTAL', '', '', Ui::money($rows->sum('billed')), Ui::money($rows->sum('paid')), Ui::money($rows->sum('outstanding')), Ui::money($rows->sum('overdue')), Ui::money($rows->sum('credit')), Ui::money($rows->sum('balance'))],
                'caption' => 'All amounts in ZAR. Totals are a view only — no binding grand total blends separate legal entities (CP-TEB 14.3).',
            ])],
            'side' => [Ui::donut('Group Balance Overview', [Ui::slice('Overdue', (int) $rows->sum('overdue'), 'bad', Ui::zar($rows->sum('overdue'))), Ui::slice('Outstanding (not overdue)', (int) max(0, $rows->sum('outstanding') - $rows->sum('overdue')), 'gold', Ui::zar(max(0, $rows->sum('outstanding') - $rows->sum('overdue'))))], Ui::zar($rows->sum('balance'))), Ui::quick('Quick Actions', [Ui::action('Download Group Statement', '/portal/statement/download', 'get', ['download' => true]), Ui::action('Switch Organisation', '/portal/organisations')])],
        ]);
    }

    public function variations(): Response
    {
        $cases = PortalCase::where('user_id', $this->user()->id)->where('kind', 'variation')->latest('submitted_at')->get();
        $projects = Project::where('user_id', $this->user()->id)->get();
        $latest = $cases->first();
        $step = ['submitted' => 1, 'in_review' => 2, 'approved' => 3, 'implemented' => 4, 'declined' => 2][$latest?->status ?? 'submitted'] ?? 1;

        return $this->register([
            'title' => 'Contract Variation and Change Request', 'icon' => 'git-pull-request', 'code' => 'CP-SCR-138', 'subtitle' => 'Request, review and approve changes to the contracted scope, fees, timelines or terms.',
            'actions' => [Ui::modal('Create New Variation', 'variation', ['variant' => 'gold'])],
            'main' => [Ui::table('Variation Requests', ['Request ID', 'Engagement', 'Change Summary', 'Time Impact', 'Fee Impact (excl. VAT)', 'Status', 'Submitted', ''], $cases->map(fn ($c) => [
                Ui::ref($c->reference), $c->payload['engagement'] ?? '', Ui::stack($c->title, $c->payload['justification'] ?? ''), '+'.($c->payload['time_days'] ?? 0).' working days', Ui::money($c->amount_zar), Ui::pill($c->status), Ui::date($c->submitted_at),
                Ui::actions([$c->status === 'approved' && $c->amount_zar > 0 ? Ui::action('Accept & Pay Fee Change', '/portal/variations/'.$c->id.'/accept', 'post', ['variant' => 'gold']) : null]),
            ])->all())],
            'side' => array_values(array_filter([
                $latest ? Ui::steps('Request Status – '.$latest->reference, [['label' => 'Submitted', 'sub' => Ui::date($latest->submitted_at)], ['label' => 'In Review'], ['label' => 'Approval'], ['label' => 'Implemented']], $step) : null,
                $latest ? Ui::kv('Impact Summary (Estimated)', [['Time Impact', '+'.($latest->payload['time_days'] ?? 0).' Working Days'], ['Fee Impact (excl. VAT)', Ui::money($latest->amount_zar)], ['Currency', 'ZAR']]) : null,
                Ui::info('How variations work', 'Changes are reviewed by the Contract Manager within 3 business days. Approved fee changes create an order for the exact approved amount only.', 'info'),
            ])),
            'forms' => ['variation' => Ui::form('Create New Variation', '/portal/variations', [
                Ui::field('engagement', 'Engagement', 'select', ['required' => true, 'options' => $projects->map(fn ($p) => ['value' => $p->reference, 'label' => $p->reference.' – '.$p->name])->values()->all()]),
                Ui::field('priority', 'Priority', 'select', ['required' => true, 'value' => 'medium', 'options' => Ui::options(['low' => 'Low', 'medium' => 'Medium', 'high' => 'High'])]),
                Ui::field('types', 'Change Type (select all that apply)', 'checkboxes', ['required' => true, 'options' => Ui::options(['scope' => 'Scope Change', 'fee' => 'Fee Change', 'timeline' => 'Timeline Extension', 'delivery' => 'Delivery Approach', 'resource' => 'Resource Change', 'other' => 'Other'])]),
                Ui::field('summary', 'Change Summary', 'textarea', ['required' => true]), Ui::field('justification', 'Justification / Reason', 'textarea', ['required' => true]),
                Ui::field('time_days', 'Estimated time impact (working days)', 'number', ['value' => 0]), Ui::field('fee_impact', 'Estimated fee impact (ZAR, excl. VAT)', 'number', ['value' => 0]),
            ], 'Submit Request')],
        ]);
    }

    public function storeVariation(Request $request): RedirectResponse
    {
        $d = $request->validate(['engagement' => 'required|string', 'priority' => 'required|in:low,medium,high', 'types' => 'required|array|min:1', 'summary' => 'required|string|max:1000', 'justification' => 'required|string|max:1000', 'time_days' => 'nullable|integer|min:0|max:365', 'fee_impact' => 'nullable|integer|min:0']);
        abort_unless(Project::where('user_id', $this->user()->id)->where('reference', $d['engagement'])->exists(), 422);
        $ref = 'VAR-'.now()->format('Y').'-'.str_pad((string) (PortalCase::where('kind', 'variation')->count() + 28), 5, '0', STR_PAD_LEFT);
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'variation', 'reference' => $ref, 'title' => mb_strimwidth($d['summary'], 0, 90, '…'), 'status' => 'submitted', 'priority' => $d['priority'], 'amount_zar' => (int) ($d['fee_impact'] ?? 0), 'payload' => $d, 'submitted_at' => now(), 'due_at' => now()->addWeekdays(3), 'step' => 99]);
        Portal::notify($this->user(), 'Variation request submitted', "{$ref} is with the Contract Manager for review.", 'project_update', '/portal/variations', 'Contract Variations', 'Projects');

        return back()->with('success', "Variation {$ref} submitted. Next review: Contract Manager, due ".now()->addWeekdays(3)->format('d M Y').'.');
    }

    public function acceptVariation(PortalCase $case): RedirectResponse
    {
        $this->ownOrFail($case);
        abort_unless($case->kind === 'variation' && $case->status === 'approved' && $case->amount_zar > 0, 422);
        $order = Checkout::createOrder([['item_type' => 'variation', 'item_code' => $case->reference, 'name' => 'Contract variation '.$case->reference, 'unit_zar' => (int) $case->amount_zar]], $this->user(), 'portal', ['title' => 'Contract variation '.$case->reference, 'return_url' => '/portal/variations']);
        $case->update(['status' => 'implemented', 'resolved_at' => now()]);

        return redirect()->route('checkout.show', $order);
    }

    public function procurement(): Response
    {
        $reqs = $this->records('procurement_req');
        $complete = $reqs->where('status', 'complete')->count();
        $ready = $reqs->every(fn ($r) => $r->status === 'complete');

        return $this->register([
            'title' => 'Procurement, Purchase Order and Vendor Requirements', 'icon' => 'clipboard-list', 'code' => 'CP-SCR-122', 'subtitle' => 'Manage procurement preconditions, purchase orders, supplier requirements, mandatory documents, and approval readiness before work starts.',
            'kpis' => [Ui::kpi('Requirements', $reqs->count(), 'For this case', 'neutral', 'clipboard-list'), Ui::kpi('PO pending', $reqs->where('title', 'Purchase Order')->where('status', '!=', 'complete')->count(), null, 'warn', 'file-text'), Ui::kpi('Vendor documents complete', Ui::pct($complete, $reqs->count()), null, 'good', 'badge-check'), Ui::kpi('Approval blockers', $reqs->whereIn('status', ['missing', 'expiring'])->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Ready to proceed', $ready ? 'Yes' : 'No', $ready ? 'Work can start' : 'Complete all requirements', $ready ? 'good' : 'warn', 'flag')],
            'main' => [
                Ui::kv('Current Procurement Case', [['Client / Organisation', $this->org()->name], ['Procurement route', 'Direct Engagement (Pre-approved)'], ['Purchase order required', Ui::pill('Required', 'bad')], ['Buyer reference', $reqs->first()->data['case'] ?? '—'], ['Named vendor', 'The Business Clinic.Africa'], ['Commercial scope', 'AI Strategy & Implementation Advisory'], ['Payment basis', 'Time & Materials (Monthly)'], ['Case status', Ui::pill($ready ? 'Ready to proceed' : 'Pending Review', $ready ? 'good' : 'warn')]]),
                Ui::table('Requirement Register', ['Requirement', 'Owner', 'Submitted At', 'Current Status', 'Expiry / Review', ''], $reqs->map(fn ($r) => [
                    $r->title, $r->data['owner'] ?? '', Ui::date($r->data['submitted'] ?? null), Ui::pill(str_replace('_', ' ', $r->status), ['complete' => 'good', 'missing' => 'bad', 'expiring' => 'warn'][$r->status] ?? 'warn'), $r->due_on ? $r->due_on->format('d M Y').($r->status === 'expiring' ? ' ('.(int) now()->diffInDays($r->due_on).' days)' : '') : '—',
                    Ui::actions([$r->status !== 'complete' ? Ui::modal($r->status === 'missing' ? 'Provide' : ($r->status === 'expiring' ? 'Upload' : 'Submit'), 'req-'.$r->id, ['variant' => 'gold']) : null]),
                ])->all()),
            ],
            'side' => [Ui::donut('Requirement Mix', $reqs->groupBy('status')->map(fn ($g, $k) => Ui::slice(ucwords(str_replace('_', ' ', $k)), $g->count(), ['complete' => 'good', 'pending' => 'gold', 'missing' => 'bad', 'expiring' => 'orange', 'review_due' => 'purple'][$k] ?? 'neutral'))->values()->all()), Ui::checklist('Procurement Readiness Rules', [Ui::check('No work starts before required PO or formal waiver'), Ui::check('Vendor compliance documents must be current'), Ui::check('Billing entity must match approved buyer entity'), Ui::check('Scope deviations require review and approval'), Ui::check('Approval trail preserved for audit and assurance')])],
            'footnote' => 'Procurement controls preserve clarity on buyer authority, vendor readiness, and approval conditions before delivery or billing milestones begin.',
            'forms' => $reqs->mapWithKeys(fn ($r) => ['req-'.$r->id => Ui::form($r->title, '/portal/procurement/'.$r->id, [Ui::field('reference', $r->title === 'Purchase Order' ? 'PO number' : 'Reference / note', 'text', ['required' => true]), Ui::field('file', 'Supporting document (optional)', 'file')], 'Submit')])->all(),
        ]);
    }

    public function submitRequirement(Request $request, Record $record): RedirectResponse
    {
        $this->ownOrFail($record);
        $d = $request->validate(['reference' => 'required|string|max:120', 'file' => 'nullable|file|max:25600|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png']);
        $data = $record->data;
        $data['submitted'] = now()->toDateString();
        $data['value'] = $d['reference'];
        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('portal/'.$this->user()->id.'/procurement', 'local');
        }
        $record->update(['status' => 'complete', 'data' => $data, 'due_on' => now()->addYear()]);

        return back()->with('success', $record->title.' submitted.');
    }
}
