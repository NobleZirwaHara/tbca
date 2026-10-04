import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { BookOpenCheck, CalendarClock, Clock, FileClock, Landmark, Plus, Receipt, Scale, ScrollText, Timer } from 'lucide-react';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input } from '@/Components/ui/Form';
import { LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, SubAdminShell, money } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Donut, LineChart } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';

type Line = SubOpRow & { recognised: number; remaining: number; next_recognition: string | null; days_remaining: number };

interface Props {
    lines: Line[];
    aging: [string, number][];
    trend: [string, number][];
    byClass: [string, string, number][];
    adjustments: SubOpRow[];
    manual: number;
}

export default function DeferredRevenue({ lines, aging, trend, byClass, adjustments, manual }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reference: '', amount_zar: '', reason: '' });
    const total = aging.reduce((s, a) => s + a[1], 0);
    const liveDeferred = lines.reduce((s, l) => s + l.remaining, 0);
    const recognisedMonth = lines.reduce((s, l) => s + (l.amount_zar ?? 0) / 12, 0);
    const classTotal = byClass.reduce((s, c) => s + c[2], 0);

    return (
        <SubAdminShell
            title="Deferred Revenue Console"
            description="Real-time visibility and controls for unearned (deferred) revenue from subscriptions."
            actions={
                <ConsoleBtn tone="dark" onClick={() => setOpen(true)}>
                    <Plus className="size-3.5" aria-hidden="true" /> Create Manual Adjustment
                </ConsoleBtn>
            }
            strip={[
                { icon: ScrollText, title: 'Accounting Policy', body: 'Revenue recognised ratably over time.' },
                { icon: Timer, title: 'Recognition Method', body: 'Time-based (straight-line).' },
                { icon: Receipt, title: 'Tax Treatment', body: 'Excludes VAT. VAT recognised separately.' },
                { icon: BookOpenCheck, title: 'Audit Trail', body: 'All changes logged and traceable.' },
                { icon: CalendarClock, title: 'Data As At', body: new Date().toLocaleString('en-ZA') },
            ]}
            note="Deferred revenue represents obligations to deliver future recurring services or content. Financial data is secure, accurate and audit-ready."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Landmark} tone="purple" label="Total Deferred Revenue" value={money(total)} caption="All active subscriptions, ex VAT" />
                {aging.map(([label, v], i) => (
                    <StatTile key={label} icon={[Clock, FileClock, CalendarClock, Scale][i] ?? Clock} tone={(['blue', 'green', 'orange', 'red'] as const)[i] ?? 'gold'} label={label} value={money(v)} caption={`${((v / total) * 100).toFixed(2)}%`} />
                ))}
                <StatTile icon={Receipt} tone="gold" label="Recognised This Month" value={money(recognisedMonth)} caption="Platform lines, ex VAT" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Deferred Revenue Aging (ex VAT)">
                    <Donut data={aging} center={`${(total / 1_000_000).toFixed(2)}M`} caption="ZAR" size={130} format={(v) => `${(v / 1_000_000).toFixed(2)}M`} />
                </Card>
                <Card title="Deferred Revenue Trend (ex VAT, ZAR M)">
                    <LineChart labels={trend.map((t) => t[0].slice(0, 3))} series={[{ name: 'Deferred (M)', values: trend.map((t) => t[1]), color: '#7c5cd6' }]} min={0} max={20} suffix="M" />
                </Card>
                <Card title="Deferred Revenue by Recurrence Class">
                    <SimpleTable
                        columns={['Class', 'ZAR', '%']}
                        rows={[...byClass.map((c) => [<span className="flex items-center gap-1"><ClassChip code={c[0]} compact />{c[1]}</span>, money(c[2]), `${((c[2] / classTotal) * 100).toFixed(2)}%`]), [<span className="font-bold">Total</span>, money(classTotal), '100.00%']]}
                    />
                </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card title="Deferred Revenue Details">
                    <SimpleTable
                        columns={['Client', 'Plan / Subscription', 'Invoice / Reference', 'Start Date', 'End Date', 'Deferred Amount (ZAR)', 'Recognised To Date', 'Remaining Deferred', 'Next Recognition', 'Status']}
                        rows={lines.map((l) => [
                            l.client ?? '—',
                            <span>
                                {l.plan_name}
                                {l.recurrence_class && <span className="block"><ClassChip code={l.recurrence_class} /></span>}
                            </span>,
                            <span className="font-mono text-xs">{l.reference}</span>,
                            shortDate(l.data.start),
                            shortDate(l.data.end),
                            money(l.amount_zar),
                            money(l.recognised),
                            money(l.remaining),
                            shortDate(l.next_recognition),
                            <StatusPill status={l.status ?? 'Active'} />,
                        ])}
                        empty="No deferred revenue lines."
                    />
                    <p className="mt-2 text-xs text-ink-500">Platform annual subscriptions are added as live lines. Remaining deferred on listed lines: {money(liveDeferred)}.</p>
                </Card>
                <div className="space-y-5">
                    <Card title="Recognition This Month (ex VAT)">
                        <LabelValues
                            rows={[
                                { label: 'Recognised automatically', value: money(recognisedMonth) },
                                { label: 'Manual adjustments (posted)', value: money(manual) },
                                { label: 'Total', value: money(recognisedMonth + manual), strong: true },
                            ]}
                        />
                    </Card>
                    <Card title="Manual adjustments journal">
                        <ul className="space-y-2 text-xs">
                            {adjustments.map((a) => (
                                <li key={a.id} className="flex justify-between gap-2">
                                    <span>
                                        <span className="font-mono">{a.reference}</span> · {a.title}
                                        <span className="block text-ink-500">Source {a.data.source}</span>
                                    </span>
                                    <span className="font-semibold">{money(a.amount_zar)}</span>
                                </li>
                            ))}
                            {adjustments.length === 0 && <li className="text-ink-500">No manual adjustments.</li>}
                        </ul>
                    </Card>
                </div>
            </div>

            <Modal open={open} onClose={() => setOpen(false)} title="Create Manual Adjustment" footer={<ConsoleBtn tone="dark" disabled={form.processing} onClick={() => form.post('/admin/products/subscriptions/deferred-revenue/adjustment', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Post to Journal</ConsoleBtn>}>
                <div className="grid gap-3">
                    <Field label="Source invoice / reference" error={form.errors.reference} required>
                        {(id) => <Input id={id} value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />}
                    </Field>
                    <Field label="Amount (ZAR, ex VAT; negative to reverse)" error={form.errors.amount_zar} required>
                        {(id) => <Input id={id} inputMode="numeric" value={form.data.amount_zar} onChange={(e) => form.setData('amount_zar', e.target.value)} />}
                    </Field>
                    <Field label="Reason" error={form.errors.reason} required>
                        {(id) => <Input id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </SubAdminShell>
    );
}

DeferredRevenue.layout = null;
