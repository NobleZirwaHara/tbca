import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Layers, Plus, ScrollText, ShieldCheck, Archive, RefreshCw, Scale } from 'lucide-react';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { CheckList, LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, FilterSelect, SubAdminShell, filterTo, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, rand, shortDate } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

type PlanRow = SubPlan & { gate: string | null; evidence_id: string | null; certified_until: string | null; subscribers: number };

interface Props {
    classes: { code: string; name: string; body: string; plans: number; active: number; review: number; retired: number; first: string; updated: string | null }[];
    plans: PlanRow[];
    filters: { class: string; status: string; q: string };
}

const PATH = '/admin/products/subscriptions/catalogue';

export default function Catalogue({ classes, plans, filters }: Props) {
    const [creating, setCreating] = useState(false);
    const [pricing, setPricing] = useState<PlanRow | null>(null);
    const [q, setQ] = useState(filters.q);
    const selected = classes.find((c) => c.code === filters.class) ?? classes[0];
    const form = useForm({ name: '', recurrence_class: 'R1', category: 'Intelligence Dashboards', monthly_zar: '', cost_zar: '', next_period_value: '', delivery_cadence: 'Monthly' });
    const price = useForm({ new_price_zar: '', notice_days: '30' });
    const totals = classes.reduce((acc, c) => ({ plans: acc.plans + c.plans, active: acc.active + c.active, review: acc.review + c.review, retired: acc.retired + c.retired }), { plans: 0, active: 0, review: 0, retired: 0 });

    const certify = (p: PlanRow) => {
        const evidence = p.evidence_id ?? window.prompt(`Evidence ID for ${p.name} (row-level decision; required for certification):`) ?? '';
        if (!evidence && !p.evidence_id) return;
        post(`${PATH}/${p.slug}/certify`, { evidence_id: evidence });
    };

    return (
        <SubAdminShell
            title="Subscription Catalogue and Class Register"
            description="Authoritative register of all subscription classes (R1–R5) and published plans."
            actions={
                <ConsoleBtn tone="dark" onClick={() => setCreating(true)}>
                    <Plus className="size-3.5" aria-hidden="true" /> Propose Subscription Plan
                </ConsoleBtn>
            }
            strip={[
                { icon: BookOpen, title: 'Authoritative Register', body: 'Single source of truth for all classes and plans.' },
                { icon: ShieldCheck, title: 'Certified Recurrence', body: 'All active plans are certified for recurring value.' },
                { icon: ScrollText, title: 'Governed Changes', body: 'Changes follow approval, certification and version control.' },
                { icon: Scale, title: 'Transparent & Defensible', body: 'Clear evidence for regulators, auditors and clients.' },
                { icon: RefreshCw, title: 'Always Current', body: 'Registry updated in real time across the platform.' },
            ]}
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <StatTile icon={Layers} tone="purple" label="Total Subscription Classes" value={classes.length} caption="R1 – R5" />
                <StatTile icon={CheckCircle2} tone="green" label="Active Plans" value={totals.active} caption="Published" />
                <StatTile icon={Clock} tone="orange" label="Plans Under Review" value={totals.review} caption="Awaiting certification" />
                <StatTile icon={Archive} tone="red" label="Plans Retired" value={totals.retired} caption="Not available" />
                <StatTile icon={BookOpen} tone="blue" label="Total Plans" value={totals.plans} caption="Across all classes" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[200px_1fr_300px]">
                <Card title="Browse Classes">
                    <ul className="space-y-1 text-[0.8125rem]">
                        {[{ code: '', name: 'All Classes' }, ...classes, { code: 'R0', name: 'Retired / Legacy' }].map((c) => (
                            <li key={c.code}>
                                <button type="button" onClick={() => filterTo(PATH, filters, { class: c.code })} className={cn('w-full rounded px-2 py-1.5 text-left', filters.class === c.code ? 'bg-gold-50 font-semibold text-gold-800' : 'hover:bg-parchment-100')}>
                                    {c.code && `${c.code} `}
                                    {c.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 space-y-2">
                        <FilterSelect label="Status" value={filters.status} onChange={(v) => filterTo(PATH, filters, { status: v })} options={[{ value: 'live', label: 'Live' }, { value: 'under_review', label: 'Under review' }, { value: 'retired', label: 'Retired' }]} />
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                filterTo(PATH, filters, { q });
                            }}
                        >
                            <label className="flex flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">
                                Search
                                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by plan..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem] text-ink-800" />
                            </label>
                        </form>
                    </div>
                </Card>

                <div className="min-w-0 space-y-5">
                    <Card title="Subscription Classes (R1–R5)">
                        <SimpleTable
                            columns={['Class', 'Class Name & Description', 'Plans', 'Status', 'Certification', 'Jurisdiction', 'Last Updated']}
                            rows={[
                                ...classes.map((c) => [
                                    <ClassChip code={c.code} compact />,
                                    <span>
                                        <span className="font-semibold text-ink-900">{c.name}</span>
                                        <span className="block text-xs text-ink-500">{c.body}</span>
                                    </span>,
                                    `${c.plans} plans`,
                                    <StatusPill status="Active" />,
                                    <span className="text-xs text-verified-700">Certified</span>,
                                    'ZA',
                                    c.updated ? new Date(c.updated).toLocaleString('en-ZA') : '—',
                                ]),
                                [<ClassChip code="R0" compact />, <span><span className="font-semibold">Retired / Legacy</span><span className="block text-xs text-ink-500">Classes no longer sold. Retained for reference only.</span></span>, `${totals.retired} plans`, <StatusPill status="Retired" tone="neutral" />, '— Not Applicable', 'ZA', '—'],
                            ]}
                        />
                    </Card>
                    <Card title={`Plans (${plans.length})`}>
                        <SimpleTable
                            columns={['Plan', 'Class', 'Status', 'Price / Floor', 'Gate', 'Evidence', 'Certified Until', 'Subscribers', 'Actions']}
                            rows={plans.map((p) => [
                                <span className="font-semibold text-ink-900">{p.name}</span>,
                                <ClassChip code={p.recurrence_class} compact />,
                                <StatusPill status={p.status} />,
                                <span className={p.floor_zar && p.monthly_zar !== null && p.monthly_zar < p.floor_zar ? 'text-risk-700' : ''}>
                                    {rand(p.monthly_zar)} / {rand(p.floor_zar)}
                                </span>,
                                <StatusPill status={p.gate ?? 'NOT_RUN'} tone={p.gate === 'PASS' ? 'good' : p.gate ? 'bad' : 'neutral'} />,
                                p.evidence_id ?? '—',
                                shortDate(p.certified_until),
                                p.subscribers,
                                <span className="flex flex-wrap gap-1">
                                    {p.status !== 'live' && p.status !== 'retired' && <ConsoleBtn tone="gold" onClick={() => certify(p)}>Certify</ConsoleBtn>}
                                    {p.status === 'live' && p.monthly_zar !== null && <ConsoleBtn onClick={() => { setPricing(p); price.setData('new_price_zar', String(p.monthly_zar)); }}>Price Change</ConsoleBtn>}
                                    {p.status !== 'retired' && <ConsoleBtn tone="danger" onClick={() => post(`${PATH}/${p.slug}/retire`, {}, `Retire ${p.name}? New sales freeze immediately.`)}>Retire</ConsoleBtn>}
                                </span>,
                            ])}
                            empty="No plans match these filters."
                        />
                    </Card>
                </div>

                <div className="space-y-5">
                    {selected && (
                        <Card title="Class Details">
                            <p className="font-semibold text-ink-900">
                                {selected.code} {selected.name}
                            </p>
                            <p className="mt-1 text-xs text-ink-600">{selected.body}</p>
                            <LabelValues
                                className="mt-3"
                                rows={[
                                    { label: 'Total Plans', value: selected.plans },
                                    { label: 'Active Plans', value: selected.active },
                                    { label: 'Plans Under Review', value: selected.review },
                                    { label: 'Retired Plans', value: selected.retired },
                                    { label: 'First Plan Published', value: selected.first },
                                    { label: 'Owner', value: 'Subscriptions Governance' },
                                    { label: 'Jurisdiction', value: 'South Africa (ZA)' },
                                ]}
                            />
                        </Card>
                    )}
                    <Card title="Class Health">
                        <CheckList items={['All mandatory fields complete', 'Business rules compliant', 'Pricing certified', 'No open violations']} />
                    </Card>
                </div>
            </div>

            <Modal
                open={creating}
                onClose={() => setCreating(false)}
                title="Propose Subscription Plan"
                size="lg"
                footer={<ConsoleBtn tone="dark" disabled={form.processing} onClick={() => form.post(PATH, { preserveScroll: true, onSuccess: () => { setCreating(false); form.reset(); } })}>Add as Under Review</ConsoleBtn>}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Plan name" error={form.errors.name} required className="sm:col-span-2">
                        {(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}
                    </Field>
                    <Field label="Recurrence class" error={form.errors.recurrence_class} required>
                        {(id) => <Select id={id} value={form.data.recurrence_class} onChange={(e) => form.setData('recurrence_class', e.target.value)} options={classes.map((c) => ({ value: c.code, label: `${c.code} ${c.name}` }))} />}
                    </Field>
                    <Field label="Category" error={form.errors.category} required>
                        {(id) => <Input id={id} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} />}
                    </Field>
                    <Field label="Monthly price (ZAR, ex VAT)" error={form.errors.monthly_zar} required>
                        {(id) => <Input id={id} inputMode="numeric" value={form.data.monthly_zar} onChange={(e) => form.setData('monthly_zar', e.target.value)} />}
                    </Field>
                    <Field label="Cost to serve (ZAR / month)" error={form.errors.cost_zar} required hint="Floor = cost ÷ (1 − 35% margin), rounded up.">
                        {(id) => <Input id={id} inputMode="numeric" value={form.data.cost_zar} onChange={(e) => form.setData('cost_zar', e.target.value)} />}
                    </Field>
                    <Field label="Next-period value (what repeats)" error={form.errors.next_period_value} required className="sm:col-span-2">
                        {(id) => <Textarea id={id} value={form.data.next_period_value} onChange={(e) => form.setData('next_period_value', e.target.value)} />}
                    </Field>
                    <Field label="Delivery cadence" error={form.errors.delivery_cadence} required>
                        {(id) => <Input id={id} value={form.data.delivery_cadence} onChange={(e) => form.setData('delivery_cadence', e.target.value)} />}
                    </Field>
                </div>
            </Modal>

            <Modal
                open={!!pricing}
                onClose={() => setPricing(null)}
                title={`New price version — ${pricing?.name ?? ''}`}
                footer={<ConsoleBtn tone="dark" disabled={price.processing} onClick={() => pricing && price.post(`${PATH}/${pricing.slug}/price-change`, { preserveScroll: true, onSuccess: () => setPricing(null) })}>Publish with Notice</ConsoleBtn>}
            >
                <p className="mb-3 text-xs text-ink-600">Every live subscriber receives a price-change notice with an exit right. Minimum notice is 30 days; nobody is silently charged a changed amount.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="New monthly price (ZAR, ex VAT)" error={price.errors.new_price_zar} required>
                        {(id) => <Input id={id} inputMode="numeric" value={price.data.new_price_zar} onChange={(e) => price.setData('new_price_zar', e.target.value)} />}
                    </Field>
                    <Field label="Notice period (days)" error={price.errors.notice_days} required>
                        {(id) => <Input id={id} inputMode="numeric" value={price.data.notice_days} onChange={(e) => price.setData('notice_days', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </SubAdminShell>
    );
}

Catalogue.layout = null;
