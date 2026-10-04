import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { BarChart3, Database, Eye, HeartHandshake, Percent, Plus, RotateCcw, ShieldCheck, TrendingDown, UserMinus, Wallet, Search } from 'lucide-react';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, FilterSelect, SubAdminShell, filterTo, money } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Bars, Donut, LineChart } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';

interface Props {
    rows: SubOpRow[];
    causes: [string, number][];
    trend: [string, number, number, number][];
    byClass: [string, number][];
    topLtm: [string, number][];
    platform: { count: number; mrr: number; codes: Record<string, number> };
    plans: SubOpRow[];
    filters: { type: string; q: string };
}

const PATH = '/admin/products/subscriptions/churn';

export default function Churn({ rows, causes, trend, byClass, topLtm, platform, plans, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState(filters.q);
    const form = useForm({ cause: causes[0]?.[0] ?? '', action: '', owner: 'Client Success Owner' });
    const totalChurned = causes.reduce((s, c) => s + c[1], 0) + platform.count;
    const mrrLost = rows.reduce((s, r) => s + (r.amount_zar ?? 0), 0);

    return (
        <SubAdminShell
            title="Churn Analysis by Cause"
            description="Understand why clients leave, quantify the impact and take action to reduce avoidable churn. Voluntary, proactive and involuntary churn are always reported separately."
            actions={
                <ConsoleBtn tone="dark" onClick={() => setOpen(true)}>
                    <Plus className="size-3.5" aria-hidden="true" /> Create Action Plan
                </ConsoleBtn>
            }
            strip={[
                { icon: Search, title: 'Understand Why', body: 'Cause recorded for every exit (reason optional for clients).' },
                { icon: TrendingDown, title: 'Reduce Avoidable Churn', body: 'Act early on at-risk accounts.' },
                { icon: RotateCcw, title: 'Recover Value', body: 'Re-engage and win clients back.' },
                { icon: Database, title: 'Data Driven', body: 'Updated daily.' },
                { icon: Eye, title: 'Transparent', body: 'Clear reasons and actions for every churn.' },
            ]}
            note="Churn data is updated daily at 02:00 SAST. All amounts exclude VAT. Churn codes: CH-VOL voluntary · CH-PRO after a disuse notice · CH-INV non-payment closure."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={UserMinus} tone="red" label="Total Churned (This Month)" value={totalChurned} caption={`incl. ${platform.count} platform`} />
                <StatTile icon={Wallet} tone="red" label="MRR Lost (listed)" value={money(mrrLost + platform.mrr)} />
                <StatTile icon={BarChart3} tone="orange" label="MRR Lost (Last 12 Months)" value="ZAR 2,245,112.44" caption="Portfolio baseline" />
                <StatTile icon={Percent} tone="purple" label="Voluntary Churn Rate (LTM)" value="7.2%" />
                <StatTile icon={Percent} tone="blue" label="Involuntary Churn Rate (LTM)" value="3.6%" />
                <StatTile icon={HeartHandshake} tone="green" label="Net Revenue Retention (LTM)" value="93.1%" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Churn by Cause (This Month)">
                    <Donut data={causes} center={String(causes.reduce((s, c) => s + c[1], 0))} caption="Total Churned" size={120} />
                </Card>
                <Card title="Churn Trend (%)">
                    <LineChart
                        labels={trend.map((t) => t[0].slice(0, 3))}
                        area={false}
                        suffix="%"
                        series={[
                            { name: 'Total', values: trend.map((t) => t[1]), color: '#7c5cd6' },
                            { name: 'Voluntary', values: trend.map((t) => t[2]), color: '#2f9e5b' },
                            { name: 'Involuntary', values: trend.map((t) => t[3]), color: '#d64545' },
                        ]}
                    />
                </Card>
                <Card title="Churn by Plan Class (LTM, %)">
                    <Bars labels={byClass.map((c) => c[0].split(' ')[0])} series={[{ name: 'Churn rate', values: byClass.map((c) => c[1]), color: '#d64545' }]} suffix="%" valueLabels />
                </Card>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <FilterSelect label="Churn Type" value={filters.type} onChange={(v) => filterTo(PATH, filters, { type: v })} options={['Voluntary', 'Proactive', 'Involuntary'].map((t) => ({ value: t, label: t }))} />
                <form
                    className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500"
                    onSubmit={(e) => {
                        e.preventDefault();
                        filterTo(PATH, filters, { q });
                    }}
                >
                    <label htmlFor="cq">Search</label>
                    <input id="cq" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" />
                </form>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card title="Churned Subscribers (latest)">
                    <SimpleTable
                        columns={['Client / Account', 'Subscription / Plan', 'Class', 'Churn Date', 'Tenure', 'MRR (Lost)', 'Churn Type', 'Primary Cause', 'Reason Detail', 'Action Taken']}
                        rows={rows.map((r) => [
                            r.client ?? '—',
                            <span>
                                {r.plan_name}
                                <span className="block font-mono text-[0.625rem] text-ink-500">{r.reference}</span>
                            </span>,
                            r.recurrence_class && <ClassChip code={r.recurrence_class} compact />,
                            shortDate(r.due_at),
                            r.data.tenure,
                            money(r.amount_zar),
                            <StatusPill status={r.status ?? ''} tone={r.status === 'Involuntary' ? 'bad' : r.status === 'Proactive' ? 'warn' : 'good'} />,
                            r.data.cause,
                            r.data.detail,
                            r.data.action,
                        ])}
                        empty="No churn records match these filters."
                    />
                </Card>
                <div className="space-y-5">
                    <Card title="Top Causes (LTM)">
                        <ol className="list-decimal space-y-1 pl-4 text-xs">
                            {topLtm.map(([c, p]) => (
                                <li key={c} className="flex justify-between gap-2">
                                    <span>{c}</span>
                                    <span className="font-semibold">{p}%</span>
                                </li>
                            ))}
                        </ol>
                    </Card>
                    <Card title="Platform churn codes">
                        <LabelValues rows={Object.entries(platform.codes).map(([k, v]) => ({ label: k, value: v }))} />
                        {Object.keys(platform.codes).length === 0 && <p className="text-xs text-ink-500">No platform churn yet.</p>}
                    </Card>
                    <Card title="Retention action plans">
                        <ul className="space-y-2 text-xs">
                            {plans.map((p) => (
                                <li key={p.id}>
                                    <span className="font-semibold">{p.data.cause}</span>: {p.title}
                                    <span className="block text-ink-500">
                                        {p.data.owner} · due {shortDate(p.due_at)} · {p.status}
                                    </span>
                                </li>
                            ))}
                            {plans.length === 0 && <li className="text-ink-500">No action plans yet.</li>}
                        </ul>
                    </Card>
                    <p className="flex items-center gap-1 text-xs text-ink-500"><ShieldCheck className="size-4" aria-hidden="true" /> Cancellation reasons stay optional for clients.</p>
                </div>
            </div>

            <Modal open={open} onClose={() => setOpen(false)} title="Create Retention Action Plan" footer={<ConsoleBtn tone="dark" disabled={form.processing} onClick={() => form.post(`${PATH}/action-plan`, { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Create</ConsoleBtn>}>
                <div className="grid gap-3">
                    <Field label="Cause addressed" error={form.errors.cause} required>
                        {(id) => <Select id={id} value={form.data.cause} onChange={(e) => form.setData('cause', e.target.value)} options={causes.map((c) => c[0])} />}
                    </Field>
                    <Field label="Action" error={form.errors.action} required>
                        {(id) => <Input id={id} value={form.data.action} onChange={(e) => form.setData('action', e.target.value)} placeholder="e.g. Offer a lower plan in the continuation notice" />}
                    </Field>
                    <Field label="Owner" error={form.errors.owner} required>
                        {(id) => <Input id={id} value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </SubAdminShell>
    );
}

Churn.layout = null;
