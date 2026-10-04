import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CalendarCheck, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Database, Eye, Gauge, Plus, ShieldCheck, TriangleAlert, Users } from 'lucide-react';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { ConsoleBtn, FilterSelect, SubAdminShell, filterTo, money, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface Props {
    month: string;
    items: SubOpRow[];
    upcoming: SubOpRow[];
    stats: { total: number; value: number; completed: number; completed_value: number; upcoming: number; upcoming_value: number; overdue: number; overdue_value: number; renewals: number; subscriptions: number };
    filters: { class: string; status: string };
}

const PATH = '/admin/products/subscriptions/delivery-calendar';
const CAT: Record<string, string> = { review: 'bg-controlled-50 text-controlled-700', delivery: 'bg-verified-50 text-verified-700', update: 'bg-referenced-50 text-referenced-700', capacity: 'bg-attested-50 text-attested-700' };

function shift(month: string, by: number) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + by, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function DeliveryCalendar({ month, items, upcoming, stats, filters }: Props) {
    const [adding, setAdding] = useState(false);
    const [selected, setSelected] = useState<SubOpRow | null>(null);
    const [newDate, setNewDate] = useState('');
    const form = useForm({ recurrence_class: 'R1', type: 'Content Refresh', client: '', date: '', time: '10:00', category: 'update' });
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const days = new Date(y, m, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const today = new Date().toISOString().slice(0, 10);
    const pct = (n: number) => (stats.total ? `${((n / stats.total) * 100).toFixed(1)}% of scheduled` : '');

    return (
        <SubAdminShell
            title="Recurring Delivery Calendar"
            description="View and manage all upcoming recurring deliverables and review events across your subscriptions."
            actions={
                <ConsoleBtn tone="dark" onClick={() => setAdding(true)}>
                    <Plus className="size-3.5" aria-hidden="true" /> Add Delivery
                </ConsoleBtn>
            }
            strip={[
                { icon: Eye, title: 'Always Visible', body: 'All upcoming and overdue deliveries in one place.' },
                { icon: CalendarCheck, title: 'Proactive Delivery', body: 'Never miss a review, report or update.' },
                { icon: Gauge, title: 'Capacity Aware', body: 'Delivery calendar respects review capacity.' },
                { icon: ShieldCheck, title: 'Value Assurance', body: 'Consistent delivery builds retained value.' },
                { icon: Database, title: 'Data Current', body: 'Updated in real time from the platform.' },
            ]}
            note="Deliver on time, every time. A missed period triggers a service credit and holds the next charge until the remedy is complete."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={CalendarDays} tone="purple" label="Deliveries This Month" value={stats.total} caption={money(stats.value, 0)} />
                <StatTile icon={CalendarCheck} tone="green" label="Completed (This Month)" value={stats.completed} caption={pct(stats.completed)} />
                <StatTile icon={CalendarClock} tone="blue" label="Upcoming (This Month)" value={stats.upcoming} caption={pct(stats.upcoming)} />
                <StatTile icon={Users} tone="gold" label="Subscriptions Due" value={stats.subscriptions} caption="Active on platform" />
                <StatTile icon={TriangleAlert} tone="red" label="Overdue Deliveries" value={stats.overdue} caption={money(stats.overdue_value, 0)} />
                <StatTile icon={CalendarClock} tone="orange" label="Auto-Renewal Reviews" value={stats.renewals} caption="Due in next 30 days" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card
                    title="Calendar"
                    action={
                        <div className="flex items-center gap-1">
                            <button type="button" aria-label="Previous month" onClick={() => router.get(PATH, { ...filters, month: shift(month, -1) }, { preserveScroll: true })} className="rounded border border-parchment-400 p-1"><ChevronLeft className="size-4" /></button>
                            <span className="px-2 text-sm font-semibold">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                            <button type="button" aria-label="Next month" onClick={() => router.get(PATH, { ...filters, month: shift(month, 1) }, { preserveScroll: true })} className="rounded border border-parchment-400 p-1"><ChevronRight className="size-4" /></button>
                        </div>
                    }
                >
                    <div className="mb-3 flex flex-wrap gap-3">
                        <FilterSelect label="Plan / Class" value={filters.class} onChange={(v) => filterTo(PATH, { ...filters, month }, { class: v })} options={['R1', 'R2', 'R3', 'R4', 'R5'].map((c) => ({ value: c, label: c }))} />
                        <FilterSelect label="Status" value={filters.status} onChange={(v) => filterTo(PATH, { ...filters, month }, { status: v })} options={['Completed', 'Upcoming', 'Overdue'].map((s) => ({ value: s, label: s }))} />
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[640px]">
                            <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem] font-semibold text-ink-500">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
                            </div>
                            <div className="mt-1 grid grid-cols-7 gap-1">
                                {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
                                {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                                    const iso = `${month}-${String(d).padStart(2, '0')}`;
                                    const list = items.filter((i) => i.due_at?.slice(0, 10) === iso);
                                    return (
                                        <div key={d} className={cn('min-h-20 rounded border p-1', iso === today ? 'border-gold-500 bg-gold-50' : 'border-parchment-300 bg-white')}>
                                            <p className="text-[0.6875rem] font-semibold">{d}</p>
                                            {list.slice(0, 3).map((i) => (
                                                <button key={i.id} type="button" onClick={() => setSelected(i)} className={cn('mt-0.5 block w-full truncate rounded px-1 text-left text-[0.5625rem] font-semibold', i.status === 'Overdue' ? 'bg-risk-50 text-risk-700' : CAT[i.data.category] ?? 'bg-parchment-200')}>
                                                    {i.title} {i.due_at?.slice(11, 16)}
                                                </button>
                                            ))}
                                            {list.length > 3 && <p className="text-[0.5625rem] text-ink-500">+{list.length - 3} more</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-5">
                    <Card title="Upcoming Deliveries (Next 7 Days)">
                        <ul className="space-y-2 text-xs">
                            {upcoming.map((u) => (
                                <li key={u.id}>
                                    <button type="button" onClick={() => setSelected(u)} className="w-full text-left hover:text-gold-700">
                                        <span className="font-semibold">{u.due_at ? new Date(u.due_at).toLocaleString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</span> · {u.title}
                                        <span className="block text-ink-500">{u.client}</span>
                                    </button>
                                </li>
                            ))}
                            {upcoming.length === 0 && <li className="text-ink-500">Nothing upcoming.</li>}
                        </ul>
                    </Card>
                    <Card title="Calendar Legend">
                        <ul className="space-y-1 text-xs">
                            {[['review', 'Review / Advisory'], ['delivery', 'Delivery / Output'], ['update', 'Update / Content'], ['capacity', 'Capacity / Check']].map(([k, l]) => (
                                <li key={k} className={cn('rounded px-2 py-0.5', CAT[k])}>{l}</li>
                            ))}
                            <li className="rounded bg-risk-50 px-2 py-0.5 text-risk-700">Overdue</li>
                        </ul>
                    </Card>
                </div>
            </div>

            <Card title="Deliveries this view">
                <SimpleTable
                    columns={['Delivery', 'Client', 'Class', 'Due', 'Status', 'Actions']}
                    rows={items.map((i) => [
                        i.title,
                        i.client,
                        i.recurrence_class,
                        i.due_at ? new Date(i.due_at).toLocaleString('en-ZA') : '—',
                        <StatusPill status={i.status ?? ''} tone={i.status === 'Completed' ? 'good' : i.status === 'Overdue' ? 'bad' : 'info'} />,
                        i.status !== 'Completed' ? (
                            <span className="flex gap-1">
                                <ConsoleBtn tone="gold" onClick={() => post(`${PATH}/${i.id}`, { action: 'complete' })}>Complete</ConsoleBtn>
                                <ConsoleBtn onClick={() => setSelected(i)}>Reschedule</ConsoleBtn>
                            </span>
                        ) : (
                            '—'
                        ),
                    ])}
                    empty="No deliveries match these filters."
                />
            </Card>

            <Modal
                open={!!selected}
                onClose={() => setSelected(null)}
                title={selected ? `${selected.title} — ${selected.client}` : ''}
                footer={
                    selected && selected.status !== 'Completed' ? (
                        <>
                            <ConsoleBtn onClick={() => { post(`${PATH}/${selected.id}`, { action: 'remind' }); setSelected(null); }}>Send Reminder</ConsoleBtn>
                            <ConsoleBtn disabled={!newDate} onClick={() => { post(`${PATH}/${selected.id}`, { action: 'reschedule', date: newDate }); setSelected(null); }}>Reschedule</ConsoleBtn>
                            <ConsoleBtn tone="gold" onClick={() => { post(`${PATH}/${selected.id}`, { action: 'complete' }); setSelected(null); }}>Mark Completed</ConsoleBtn>
                        </>
                    ) : undefined
                }
            >
                {selected && (
                    <div className="space-y-2 text-sm">
                        <p>Due {selected.due_at ? new Date(selected.due_at).toLocaleString('en-ZA') : '—'} · Status <StatusPill status={selected.status ?? ''} /></p>
                        {selected.status !== 'Completed' && (
                            <label className="block text-xs font-medium">
                                New date
                                <input type="date" min={today} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 h-9 w-full rounded border border-parchment-500 px-2" />
                            </label>
                        )}
                        <p className="text-xs text-ink-500">Reference {selected.reference} · {shortDate(selected.due_at)}</p>
                    </div>
                )}
            </Modal>

            <Modal open={adding} onClose={() => setAdding(false)} title="Add Delivery" footer={<ConsoleBtn tone="dark" disabled={form.processing} onClick={() => form.post(PATH, { preserveScroll: true, onSuccess: () => { setAdding(false); form.reset(); } })}>Schedule</ConsoleBtn>}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Class" error={form.errors.recurrence_class} required>
                        {(id) => <Select id={id} value={form.data.recurrence_class} onChange={(e) => form.setData('recurrence_class', e.target.value)} options={['R1', 'R2', 'R3', 'R4', 'R5']} />}
                    </Field>
                    <Field label="Category" error={form.errors.category} required>
                        {(id) => <Select id={id} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} options={[{ value: 'review', label: 'Review / Advisory' }, { value: 'delivery', label: 'Delivery / Output' }, { value: 'update', label: 'Update / Content' }, { value: 'capacity', label: 'Capacity / Check' }]} />}
                    </Field>
                    <Field label="Delivery type" error={form.errors.type} required>
                        {(id) => <Input id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} />}
                    </Field>
                    <Field label="Client" error={form.errors.client} required>
                        {(id) => <Input id={id} value={form.data.client} onChange={(e) => form.setData('client', e.target.value)} />}
                    </Field>
                    <Field label="Date" error={form.errors.date} required>
                        {(id) => <Input id={id} type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />}
                    </Field>
                    <Field label="Time" error={form.errors.time} required>
                        {(id) => <Input id={id} type="time" value={form.data.time} onChange={(e) => form.setData('time', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </SubAdminShell>
    );
}

DeliveryCalendar.layout = null;
