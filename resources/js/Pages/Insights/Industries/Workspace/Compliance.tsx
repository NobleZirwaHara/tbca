import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Bell, CalendarCheck, CalendarClock, ChevronLeft, ChevronRight, Download, Plus, Repeat, ShieldCheck, TriangleAlert, FileCheck2 } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Donut, Legend, Stat, Status } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Ob { id: number; title: string; authority: string | null; type: string; due: string; dueLabel: string; days: number; state: string; recurring: boolean; custom: boolean }
interface Props extends WorkspaceBase {
    month: string;
    monthLabel: string;
    today: string;
    obligations: Ob[];
    upcoming: Ob[];
    kpis: { total: number; upcoming: number; overdue: number; recurring: number; completed: number };
    health: { percent: number; onTrack: number; atRisk: number; overdue: number; notDue: number };
    typeCounts: Record<string, number>;
}

const TYPE_COLOR: Record<string, string> = { filing: 'bg-verified-50 text-verified-700 border-verified-500/30', renewal: 'bg-gold-50 text-gold-800 border-gold-400/50', reporting: 'bg-controlled-50 text-controlled-700 border-controlled-500/30', payment: 'bg-purple-50 text-purple-700 border-purple-300' };

export default function Compliance(props: Props) {
    const { engagement: e, month, monthLabel, today, obligations, upcoming, kpis, health, typeCounts } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [view, setView] = useState<'month' | 'list'>('month');
    const [add, setAdd] = useState(false);
    const form = useForm({ title: '', authority: '', type: 'filing', due_on: '', recurring: false });

    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysIn = new Date(y, m, 0).getDate();
    const cells = Array.from({ length: Math.ceil((offset + daysIn) / 7) * 7 }, (_, i) => i - offset + 1);
    const shift = (d: number) => {
        const t = new Date(y, m - 1 + d, 1);
        router.get(`${root}/compliance-calendar`, { month: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}` }, { preserveScroll: true, preserveState: true });
    };
    const iso = (d: number) => `${month}-${String(d).padStart(2, '0')}`;

    return (
        <WorkspaceShell
            base={props}
            title="Sector Compliance Calendar"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Track regulatory obligations, filing dates, renewals and compliance activities applicable to your sector and jurisdiction."
            actions={
                <>
                    <a href={`${root}/compliance-calendar.ics`} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Export Calendar (ICS)</a>
                    <Link href="/resources/preferences" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Bell className="size-4" /> Subscribe / Reminders</Link>
                    <button type="button" onClick={() => setAdd(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Add Custom Obligation</button>
                </>
            }
            right={
                <>
                    <Box title="Compliance Health">
                        <div className="flex items-center gap-3">
                            <Donut value={health.percent} label={`${health.percent}%`} sub="Compliant" size={100} />
                            <Legend items={[{ label: 'On Track', value: health.onTrack, color: '#2f9e5b' }, { label: 'At Risk', value: health.atRisk, color: '#d6a32e' }, { label: 'Overdue', value: health.overdue, color: '#d64545' }, { label: 'Not Due', value: health.notDue, color: '#9aa0a6' }]} />
                        </div>
                    </Box>
                    <Box title="Obligation Types"><ul className="space-y-1 text-xs">{Object.entries(typeCounts).map(([t, c]) => <li key={t} className="flex justify-between capitalize"><span>{t === 'filing' ? 'Filing / Submission' : t}</span><strong>{c}</strong></li>)}</ul></Box>
                    <Box title="Calendar Settings"><dl className="space-y-1 text-xs">{[['Jurisdiction', e.country], ['Regulatory View', 'Sector Specific'], ['Update Frequency', 'Weekly'], ['Reminder Lead Time', '14 Days']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}</dl></Box>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Obligations" value={kpis.total} caption="This Year" icon={<CalendarCheck className="size-5" />} />
                <Stat label="Upcoming" value={kpis.upcoming} caption="Next 90 Days" icon={<CalendarClock className="size-5" />} tone="green" />
                <Stat label="Overdue" value={kpis.overdue} caption="Requires attention" icon={<TriangleAlert className="size-5" />} tone="red" />
                <Stat label="Recurring Obligations" value={kpis.recurring} caption="Ongoing / Annual" icon={<Repeat className="size-5" />} />
                <Stat label="Completed" value={kpis.completed} caption="This Year" icon={<FileCheck2 className="size-5" />} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <Box title="Compliance Calendar" action={
                    <div className="flex rounded border border-parchment-400 text-xs">
                        {(['month', 'list'] as const).map((v) => <button key={v} type="button" onClick={() => setView(v)} className={cn('px-3 py-1 capitalize', view === v && 'bg-gold-50 font-semibold text-gold-800')}>{v}</button>)}
                    </div>
                }>
                    <div className="mb-3 flex items-center gap-2">
                        <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="rounded border p-1"><ChevronLeft className="size-4" /></button>
                        <button type="button" aria-label="Next month" onClick={() => shift(1)} className="rounded border p-1"><ChevronRight className="size-4" /></button>
                        <button type="button" onClick={() => router.get(`${root}/compliance-calendar`)} className="rounded border px-2 py-0.5 text-xs">Today</button>
                        <span className="ml-2 font-semibold">{monthLabel}</span>
                    </div>
                    {view === 'month' ? (
                        <div className="overflow-x-auto">
                            <div className="grid min-w-[560px] grid-cols-7 border-t border-l border-parchment-300 text-xs">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="border-r border-b border-parchment-300 bg-parchment-100 p-1 text-center font-semibold">{d}</div>)}
                                {cells.map((d, i) => {
                                    const inMonth = d >= 1 && d <= daysIn;
                                    const items = inMonth ? obligations.filter((o) => o.due === iso(d)) : [];
                                    return (
                                        <div key={i} className={cn('min-h-20 border-r border-b border-parchment-300 p-1', !inMonth && 'bg-parchment-100 text-ink-300')}>
                                            <span className={cn('text-[0.6875rem]', inMonth && iso(d) === today && 'rounded-full bg-gold-500 px-1.5 font-bold')}>{inMonth ? d : ''}</span>
                                            {items.map((o) => <p key={o.id} className={cn('mt-1 rounded border px-1 py-0.5 text-[0.625rem]', o.state === 'overdue' ? 'border-risk-500/30 bg-risk-50 text-risk-700' : o.state === 'completed' ? 'border-parchment-400 bg-parchment-100 text-ink-400 line-through' : TYPE_COLOR[o.type])}>{o.state === 'overdue' ? 'Overdue: ' : ''}{o.title}</p>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-parchment-300 text-sm">
                            {obligations.filter((o) => o.due.startsWith(month)).map((o) => <li key={o.id} className="flex items-center justify-between py-2"><span>{o.dueLabel} — {o.title}</span><Status value={o.state} /></li>)}
                        </ul>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-[0.6875rem]">{['filing', 'renewal', 'reporting', 'payment'].map((t) => <span key={t} className={cn('rounded border px-1.5 capitalize', TYPE_COLOR[t])}>{t}</span>)}<span className="rounded border border-risk-500/30 bg-risk-50 px-1.5 text-risk-700">Overdue</span></div>
                </Box>
                <Box title="Upcoming Obligations (Next 90 Days)">
                    <ul className="space-y-3">
                        {[...obligations.filter((o) => o.state === 'overdue'), ...upcoming].map((o) => (
                            <li key={o.id} className="flex items-start gap-3 border-b border-parchment-200 pb-2">
                                <span className="w-10 rounded border border-parchment-400 text-center text-xs"><strong className="block text-base">{o.dueLabel.slice(0, 2)}</strong>{o.dueLabel.slice(3, 6)}</span>
                                <span className="flex-1 text-xs"><strong className="block text-[0.8125rem]">{o.title}</strong>{o.authority}<span className={cn('block font-semibold', o.days < 0 ? 'text-risk-700' : o.days <= 7 ? 'text-attested-700' : 'text-verified-700')}>{o.days < 0 ? `${-o.days} days overdue` : `${o.days} days`}</span></span>
                                <button type="button" onClick={() => router.post(`${root}/compliance-calendar/${o.id}/complete`, {}, { preserveScroll: true })} className="rounded border px-2 py-0.5 text-[0.6875rem]">Mark done</button>
                            </li>
                        ))}
                    </ul>
                </Box>
            </div>
            <p className="flex items-center gap-2 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><ShieldCheck className="size-4" /> Compliance information is sourced from verified regulators and partners. You remain responsible for final compliance.</p>

            <Modal open={add} onClose={() => setAdd(false)} title="Add Custom Obligation"
                footer={<button type="button" disabled={form.processing} onClick={() => form.post(`${root}/compliance-calendar`, { preserveScroll: true, onSuccess: () => { setAdd(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Add obligation</button>}>
                <div className="space-y-3">
                    <Field label="Obligation" required error={form.errors.title}>{(id) => <Input id={id} value={form.data.title} onChange={(ev) => form.setData('title', ev.target.value)} />}</Field>
                    <Field label="Authority" error={form.errors.authority}>{(id) => <Input id={id} value={form.data.authority} onChange={(ev) => form.setData('authority', ev.target.value)} />}</Field>
                    <Field label="Type" required error={form.errors.type}>{(id) => <Select id={id} value={form.data.type} onChange={(ev) => form.setData('type', ev.target.value)} options={[{ value: 'filing', label: 'Filing / Submission' }, { value: 'renewal', label: 'Renewal' }, { value: 'reporting', label: 'Reporting' }, { value: 'payment', label: 'Payment' }]} />}</Field>
                    <Field label="Due date" required error={form.errors.due_on}>{(id) => <Input id={id} type="date" value={form.data.due_on} onChange={(ev) => form.setData('due_on', ev.target.value)} />}</Field>
                    <Checkbox label="Recurring annually" checked={form.data.recurring} onChange={(ev) => form.setData('recurring', ev.target.checked)} />
                </div>
            </Modal>
        </WorkspaceShell>
    );
}
