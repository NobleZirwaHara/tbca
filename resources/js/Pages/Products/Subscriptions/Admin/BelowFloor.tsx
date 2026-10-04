import { Ban, Bell, CircleDollarSign, DoorOpen, Play, ShieldCheck, TrendingUp, Users, Wrench, CalendarClock } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, SubAdminShell, money, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Bars } from '@/Components/Products/Subscriptions/charts';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';

type FloorPlan = SubPlan & { sales_blocked: boolean; cost_zar: number | null; subscription_type: string; variance: number; variance_pct: number };

interface Props {
    plans: FloorPlan[];
    subscribers: { client: string; slug: string; plan: string; since: string; mrr: number; next_review: string; status: string }[];
    trend: [string, number][];
    live: number;
    blockLog: { event_type: string; payload: Record<string, unknown> | null; created_at: string }[];
    margin: number;
    remediated: number;
    blocked: number;
}

const PATH = '/admin/products/subscriptions/below-floor';

export default function BelowFloor({ plans, subscribers, trend, live, blockLog, margin, remediated, blocked }: Props) {
    const atRisk = subscribers.filter((s) => s.status === 'At Risk');
    const mrr = atRisk.reduce((s, r) => s + r.mrr, 0);

    return (
        <SubAdminShell
            title="Below-Floor Recurring Block Monitor"
            description="Prevent recurring loss by blocking new sales and renewal of plans priced below floor (after all costs and VAT)."
            actions={
                <ConsoleBtn tone="dark" onClick={() => post(`${PATH}/check`, {}, 'Recompute every floor from cost and the target margin?')}>
                    <Play className="size-3.5" aria-hidden="true" /> Run Floor Check
                </ConsoleBtn>
            }
            strip={[
                { icon: ShieldCheck, title: 'Protect Margin', body: 'No plan below floor. No exceptions.' },
                { icon: Ban, title: 'Block at the Gate', body: 'Prevent loss before it starts.' },
                { icon: Wrench, title: 'Remediate or Exit', body: 'Raise price, resize scope, or withdraw.' },
                { icon: Bell, title: 'Notify Transparently', body: 'Clients get 30 days notice and an exit right.' },
                { icon: CalendarClock, title: 'Review Regularly', body: 'Floors reviewed monthly.' },
            ]}
            note="Below-floor monitoring is active. New sales and renewals are blocked at checkout for plans below floor."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Ban} tone="red" label="Below-Floor Plans (Live)" value={plans.length} caption={`${live ? ((plans.length / live) * 100).toFixed(1) : 0}% of live plans`} />
                <StatTile icon={Users} tone="orange" label="Subscribers on Below-Floor Plans" value={atRisk.length} />
                <StatTile icon={CircleDollarSign} tone="red" label="MRR at Risk (This Month)" value={money(mrr)} />
                <StatTile icon={DoorOpen} tone="purple" label="Block Actions (30 Days)" value={blocked} caption="Sales / renewals blocked" />
                <StatTile icon={Ban} tone="blue" label="Sales Blocked Now" value={plans.filter((p) => p.sales_blocked || p.sale_blocker === 'BLOCKED_BELOW_FLOOR').length} caption="Checkout gate" />
                <StatTile icon={TrendingUp} tone="green" label="Plans Remediated (30 Days)" value={remediated} caption="Raised to floor" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <Card title="Below-Floor Plans (Live)">
                        <SimpleTable
                            columns={['Plan Class', 'Plan Name', 'Subscription Type', 'Price (Ex VAT)', 'Floor (Ex VAT)', 'Variance', 'Variance %', 'Status', 'Action']}
                            rows={plans.map((p) => [
                                <ClassChip code={p.recurrence_class} label={p.class_name} />,
                                <span className="font-semibold text-ink-900">{p.name}</span>,
                                p.subscription_type,
                                money(p.monthly_zar),
                                money(p.floor_zar),
                                <span className="text-risk-700">-{money(Math.abs(p.variance))}</span>,
                                <span className="text-risk-700">{p.variance_pct}%</span>,
                                <StatusPill status={p.sales_blocked ? 'Sales Blocked' : 'Below Floor'} tone="bad" />,
                                <span className="flex flex-wrap gap-1">
                                    {p.sales_blocked ? (
                                        <ConsoleBtn onClick={() => post(`${PATH}/${p.slug}`, { action: 'unblock' })}>Unblock</ConsoleBtn>
                                    ) : (
                                        <ConsoleBtn tone="danger" onClick={() => post(`${PATH}/${p.slug}`, { action: 'block' })}>Block Sales</ConsoleBtn>
                                    )}
                                    <ConsoleBtn tone="gold" onClick={() => post(`${PATH}/${p.slug}`, { action: 'remediate' }, `Raise ${p.name} to floor (${money(p.floor_zar)})? Live subscribers get 30 days notice and an exit right.`)}>
                                        Remediate
                                    </ConsoleBtn>
                                </span>,
                            ])}
                            empty="No live plans are below floor."
                        />
                    </Card>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Monthly MRR at Risk (ZAR K)">
                            <Bars labels={trend.map((t) => t[0].slice(0, 3))} series={[{ name: 'MRR at risk', values: trend.map((t) => t[1]), color: '#d64545' }]} suffix="K" valueLabels />
                        </Card>
                        <Card title="Active Subscribers on Below-Floor Plans">
                            <SimpleTable
                                columns={['Client', 'Plan', 'Since', 'MRR', 'Status', 'Next Review']}
                                rows={subscribers.map((s) => [s.client, s.plan, shortDate(s.since), money(s.mrr), <StatusPill status={s.status} tone={s.status === 'At Risk' ? 'warn' : 'good'} />, shortDate(s.next_review)])}
                            />
                        </Card>
                    </div>
                </div>

                <div className="space-y-5">
                    <Card title="Flooring Rules">
                        <LabelValues
                            rows={[
                                { label: 'Apply VAT', value: 'Excluded' },
                                { label: 'Include direct costs', value: 'Yes' },
                                { label: 'Include indirect costs', value: 'Yes' },
                                { label: 'Target gross margin', value: `${margin}%` },
                                { label: 'Floor formula', value: `cost ÷ (1 − ${margin}%)` },
                                { label: 'Rounding', value: 'Up to nearest ZAR 1' },
                            ]}
                        />
                    </Card>
                    <Card title="Block log">
                        <ul className="space-y-2 text-xs">
                            {blockLog.map((e, i) => (
                                <li key={i}>
                                    <span className="text-ink-400">{new Date(e.created_at).toLocaleString('en-ZA')}</span> · {e.event_type.replace(/_/g, ' ')}
                                    {e.payload?.plan ? <span className="block text-ink-600">{String(e.payload.plan)}</span> : null}
                                </li>
                            ))}
                            {blockLog.length === 0 && <li className="text-ink-500">No block actions yet.</li>}
                        </ul>
                    </Card>
                </div>
            </div>
        </SubAdminShell>
    );
}

BelowFloor.layout = null;
