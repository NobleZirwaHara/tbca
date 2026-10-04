import { router } from '@inertiajs/react';
import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Lock, Play, RefreshCw, ShieldCheck, TriangleAlert, Workflow, XCircle } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ConsoleBtn, SubAdminShell, money, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, StatTile, rand, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Bars, Donut } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface Props {
    month: string;
    runs: SubOpRow[];
    performance: [string, number, number][];
    exceptions: [string, number, number, number][];
    channels: [string, number][];
    due: { reference: string; plan: string; next_charge_at: string; price_zar: number; blockers: string[] }[];
    orders: { month: number; paid: number; failed: number };
}

const PATH = '/admin/products/subscriptions/billing-calendar';
const TYPE_TONE: Record<string, string> = { Monthly: 'bg-verified-50 text-verified-700', 'Ad-hoc': 'bg-controlled-50 text-controlled-700', 'Mid-Month': 'bg-controlled-50 text-controlled-700', Annual: 'bg-attested-50 text-attested-700', Retry: 'bg-referenced-50 text-referenced-700' };

function shift(month: string, by: number) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + by, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function BillingCalendar({ month, runs, performance, exceptions, channels, due, orders }: Props) {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const days = new Date(y, m, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const today = new Date().toISOString().slice(0, 10);
    const byDay = (d: number) => runs.filter((r) => r.due_at?.slice(0, 10) === `${month}-${String(d).padStart(2, '0')}`);
    const upcoming = runs.filter((r) => r.status === 'Scheduled');
    const completed = runs.filter((r) => r.status === 'Completed').slice(-5).reverse();
    const monthRuns = runs.filter((r) => r.due_at?.startsWith(month));
    const nextRun = upcoming[0];

    return (
        <SubAdminShell
            title="Billing Calendar and Run Monitor"
            description="View billing schedule, monitor billing runs and track invoice delivery. Every charge passes the Universal Next-Period Gate."
            actions={
                <>
                    <ConsoleBtn onClick={() => post(`${PATH}/run`, { type: 'Retry' }, 'Retry charges due today?')}>
                        <RefreshCw className="size-3.5" aria-hidden="true" /> Retry Failed
                    </ConsoleBtn>
                    <ConsoleBtn tone="dark" onClick={() => post(`${PATH}/run`, { type: 'Ad-hoc' }, 'Trigger an ad-hoc billing run for subscriptions due within 1 day?')}>
                        <Play className="size-3.5" aria-hidden="true" /> Trigger Ad-hoc Run
                    </ConsoleBtn>
                </>
            }
            strip={[
                { icon: Workflow, title: 'Automated & Reliable', body: 'Scheduling, execution and alerts.' },
                { icon: FileText, title: 'Transparent', body: 'Full visibility from schedule to settlement.' },
                { icon: ShieldCheck, title: 'Compliant', body: 'Audit-ready logs and controls.' },
                { icon: CheckCircle2, title: 'Accurate', body: 'Validated data and reconciliation.' },
                { icon: Lock, title: 'Secure', body: 'Role-based access and encryption.' },
            ]}
            note="All times shown are in SAST (UTC+2). No charge runs without continuation notice, reserved capacity, a valid price above floor and a valid mandate; duplicates per period are blocked."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={FileText} tone="purple" label="Runs This Month" value={monthRuns.length} caption={money(monthRuns.reduce((s, r) => s + (r.amount_zar ?? 0), 0), 0)} />
                <StatTile icon={CheckCircle2} tone="green" label="Paid Subscription Orders" value={orders.paid} caption={`${orders.month} created this month`} />
                <StatTile icon={XCircle} tone="red" label="Failed Orders" value={orders.failed} />
                <StatTile icon={CalendarClock} tone="blue" label="Next Run" value={nextRun?.due_at ? shortDate(nextRun.due_at) : '—'} caption={nextRun?.title ?? 'Nothing scheduled'} />
                <StatTile icon={TriangleAlert} tone="orange" label="Due & Held by Gate" value={due.filter((d) => d.blockers.length).length} caption="Charge = HOLD" />
                <StatTile icon={Clock} tone="gold" label="Due (platform)" value={due.length} caption={rand(due.reduce((s, d) => s + d.price_zar, 0))} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <Card
                    title="Billing Calendar"
                    action={
                        <div className="flex items-center gap-1">
                            <button type="button" aria-label="Previous month" onClick={() => router.get(PATH, { month: shift(month, -1) }, { preserveScroll: true })} className="rounded border border-parchment-400 p-1"><ChevronLeft className="size-4" /></button>
                            <span className="px-2 text-sm font-semibold">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                            <button type="button" aria-label="Next month" onClick={() => router.get(PATH, { month: shift(month, 1) }, { preserveScroll: true })} className="rounded border border-parchment-400 p-1"><ChevronRight className="size-4" /></button>
                        </div>
                    }
                >
                    <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem] font-semibold text-ink-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                            const iso = `${month}-${String(d).padStart(2, '0')}`;
                            return (
                                <div key={d} className={cn('min-h-16 rounded border p-1 text-left', iso === today ? 'border-gold-500 bg-gold-50' : 'border-parchment-300 bg-white')}>
                                    <p className="text-[0.6875rem] font-semibold text-ink-700">{d}</p>
                                    {byDay(d).map((r) => (
                                        <p key={r.id} className={cn('mt-0.5 truncate rounded px-1 text-[0.5625rem] font-semibold', TYPE_TONE[r.data.type] ?? 'bg-parchment-200')} title={`${r.title} · ${r.status}`}>
                                            {r.data.type} {r.due_at?.slice(11, 16)}
                                        </p>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <div className="space-y-5">
                    <Card title="Upcoming Billing Runs">
                        <SimpleTable columns={['Run', 'Schedule', 'Target', 'Est. Value']} rows={upcoming.slice(0, 6).map((r) => [r.title, shortDate(r.due_at), r.data.invoices ?? '—', money(r.amount_zar, 0)])} empty="No scheduled runs." />
                    </Card>
                    <Card title="Billing Channels">
                        <Donut data={channels} center={String(channels.reduce((s, c) => s + c[1], 0))} caption="Invoices" size={110} />
                    </Card>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card title="Run Status (latest completed)">
                    <SimpleTable columns={['Run', 'Date & Time', 'Status', 'Invoices', 'Value (ex VAT)']} rows={completed.map((r) => [r.title, r.due_at ? new Date(r.due_at).toLocaleString('en-ZA') : '—', <StatusPill status={r.status ?? ''} />, r.data.invoices ?? 0, money(r.amount_zar)])} empty="No completed runs." />
                </Card>
                <Card title="Run Performance – Last 6 Months">
                    <Bars labels={performance.map((p) => p[0].slice(0, 3))} series={[{ name: 'Invoices', values: performance.map((p) => p[1]), color: '#7c5cd6' }]} />
                    <p className="mt-2 text-xs text-ink-500">Success rate: {performance.map((p) => `${p[0].slice(0, 3)} ${p[2]}%`).join(' · ')}</p>
                </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card title="Due Platform Charges — Universal Next-Period Gate">
                    <SimpleTable
                        columns={['Subscription', 'Plan', 'Next Charge', 'Amount', 'Gate']}
                        rows={due.map((d) => [
                            <span className="font-mono text-xs">{d.reference}</span>,
                            d.plan,
                            shortDate(d.next_charge_at),
                            rand(d.price_zar),
                            d.blockers.length ? <span className="text-xs text-risk-700">HOLD: {d.blockers.join(', ')}</span> : <StatusPill status="Pass" tone="good" />,
                        ])}
                        empty="No active subscriptions are due."
                    />
                </Card>
                <Card title="Invoices Requiring Attention">
                    <SimpleTable columns={['Reason', 'Count', 'Value (ex VAT)', 'Oldest Age']} rows={exceptions.map((e) => [e[0], e[1], money(e[2]), `${e[3]} days`])} />
                </Card>
            </div>
        </SubAdminShell>
    );
}

BillingCalendar.layout = null;
