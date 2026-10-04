import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Download, RotateCcw, Search } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import AboutHero, { AsideCard, NoticeBand } from '@/Components/About/AboutHero';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import type { PublicCorrection } from '@/types/about';

interface Props {
    corrections: PublicCorrection[];
    filters: Partial<Record<'q' | 'claim_type' | 'surface' | 'status' | 'from' | 'to' | 'sort', string>>;
    options: { claim_types: string[]; surfaces: string[]; statuses: string[] };
}

export default function Corrections({ corrections, filters, options }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [concernOpen, setConcernOpen] = useState(false);
    const [selected, setSelected] = useState<PublicCorrection | null>(null);
    const concern = useForm({ name: '', email: '', surface: '', claim: '', details: '' });

    const apply = (patch: Record<string, string | undefined>) =>
        router.get('/about/corrections', { ...filters, ...patch }, { preserveScroll: true, preserveState: true, replace: true });

    const exportHref = `/about/corrections/export?${new URLSearchParams(Object.entries(filters).filter(([, v]) => !!v) as [string, string][]).toString()}`;

    const submitConcern = (e: FormEvent) => {
        e.preventDefault();
        concern.post('/about/corrections/concern', { preserveScroll: true, onSuccess: () => { concern.reset(); setConcernOpen(false); } });
    };

    return (
        <>
            <Head title="Corrections Register" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Corrections Register' }]}
                title="Corrections Register"
                lead="Transparency. Accuracy. Accountability."
                intro="This register lists material public corrections we have made to claims or statements on TBCA-controlled surfaces. It explains what changed, why, and when. All corrections are reviewed, approved and published transparently."
                aside={
                    <AsideCard
                        icon="info"
                        title="Our Correction Protocol"
                        body="We detect, assess and correct material errors or outdated claims. Corrections are approved by authority, published and propagated."
                        link={{ label: 'View Correction Protocol', href: '/about/governance' }}
                    />
                }
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ q });
                        }}
                        className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(5,1fr)_auto_auto]"
                    >
                        <Field label="Search">
                            {(id) => (
                                <div className="relative">
                                    <Input id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search corrections..." className="pr-9" />
                                    <button type="submit" className="absolute top-2.5 right-2.5 text-ink-400" aria-label="Search">
                                        <Search className="size-4" />
                                    </button>
                                </div>
                            )}
                        </Field>
                        <Field label="From">{(id) => <Input id={id} type="date" value={filters.from ?? ''} onChange={(e) => apply({ from: e.target.value })} />}</Field>
                        <Field label="To">{(id) => <Input id={id} type="date" value={filters.to ?? ''} onChange={(e) => apply({ to: e.target.value })} />}</Field>
                        <Field label="Claim Type">
                            {(id) => <Select id={id} placeholder="All" options={options.claim_types} value={filters.claim_type ?? ''} onChange={(e) => apply({ claim_type: e.target.value })} />}
                        </Field>
                        <Field label="Affected Surface">
                            {(id) => <Select id={id} placeholder="All" options={options.surfaces} value={filters.surface ?? ''} onChange={(e) => apply({ surface: e.target.value })} />}
                        </Field>
                        <Field label="Status">
                            {(id) => <Select id={id} placeholder="All" options={options.statuses} value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value })} />}
                        </Field>
                        <div className="flex items-end">
                            <Button type="button" variant="outline" onClick={() => router.get('/about/corrections')} className="w-full">
                                <RotateCcw className="size-4" /> Clear Filters
                            </Button>
                        </div>
                        <div className="flex items-end">
                            <a href={exportHref} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-600 px-4 text-sm font-semibold text-white hover:bg-gold-700">
                                <Download className="size-4" /> Export Register
                            </a>
                        </div>
                    </form>

                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <p className="mb-3 text-sm font-semibold text-ink-900">
                            {corrections.length} Correction{corrections.length === 1 ? '' : 's'} Found
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[960px] text-left text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600">
                                    <tr>
                                        <th className="px-3 py-2">Correction ID</th>
                                        <th className="px-3 py-2">
                                            <button type="button" className="inline-flex items-center gap-1" onClick={() => apply({ sort: filters.sort === 'asc' ? 'desc' : 'asc' })}>
                                                Date {filters.sort === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                                            </button>
                                        </th>
                                        <th className="px-3 py-2">Claim</th>
                                        <th className="px-3 py-2">Affected Surface</th>
                                        <th className="px-3 py-2">Previous Public Wording (Summary)</th>
                                        <th className="px-3 py-2">Corrected Position (Summary)</th>
                                        <th className="px-3 py-2">Reason (High Level)</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Effective Date</th>
                                        <th className="px-3 py-2">Last Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {corrections.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-3 py-8 text-center text-ink-500">
                                                No material public corrections are currently listed for these filters.
                                            </td>
                                        </tr>
                                    )}
                                    {corrections.map((c) => (
                                        <tr key={c.code} className="cursor-pointer align-top hover:bg-parchment-100" onClick={() => setSelected(c)}>
                                            <td className="px-3 py-3 font-mono text-xs text-ink-800">{c.code}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">{fmtDate(c.date)}</td>
                                            <td className="px-3 py-3 font-medium text-ink-900">{c.claim}</td>
                                            <td className="px-3 py-3">{c.affected_surface}</td>
                                            <td className="px-3 py-3 text-ink-600">{c.previous_wording}</td>
                                            <td className="px-3 py-3 text-ink-800">{c.corrected_position}</td>
                                            <td className="px-3 py-3 text-ink-600">{c.reason}</td>
                                            <td className="px-3 py-3"><StatusPill status={c.status} /></td>
                                            <td className="px-3 py-3 whitespace-nowrap">{fmtDate(c.effective_at)}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">{fmtDate(c.last_verified_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <NoticeBand
                        title="No material public corrections are hidden."
                        action={
                            <Button type="button" onClick={() => setConcernOpen(true)} id="concern">
                                Submit a Correction Concern
                            </Button>
                        }
                    >
                        If you believe a material claim requires correction, tell us below or use the{' '}
                        <a href="/complaints" className="font-semibold text-gold-700 underline">
                            Complaints route
                        </a>
                        .
                    </NoticeBand>
                </div>
            </section>

            {selected && (
                <Modal open onClose={() => setSelected(null)} title={`${selected.code} · ${selected.claim}`} size="lg">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold text-ink-500 uppercase">Previous public wording</dt>
                            <dd className="mt-1 rounded bg-risk-50 p-2 text-ink-700 line-through decoration-risk-500/60">{selected.previous_wording}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold text-ink-500 uppercase">Corrected position</dt>
                            <dd className="mt-1 rounded bg-verified-50 p-2 text-ink-800">{selected.corrected_position}</dd>
                        </div>
                        <div><dt className="text-xs font-semibold text-ink-500 uppercase">Reason</dt><dd>{selected.reason}</dd></div>
                        <div><dt className="text-xs font-semibold text-ink-500 uppercase">Affected surface</dt><dd>{selected.affected_surface}</dd></div>
                        <div><dt className="text-xs font-semibold text-ink-500 uppercase">Effective</dt><dd>{fmtDate(selected.effective_at)}</dd></div>
                        <div><dt className="text-xs font-semibold text-ink-500 uppercase">Last verification</dt><dd>{fmtDate(selected.last_verified_at)}</dd></div>
                    </dl>
                </Modal>
            )}

            <Modal open={concernOpen} onClose={() => setConcernOpen(false)} title="Submit a Correction Concern" size="lg">
                <form onSubmit={submitConcern} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name" required error={concern.errors.name}>
                        {(id) => <Input id={id} value={concern.data.name} onChange={(e) => concern.setData('name', e.target.value)} />}
                    </Field>
                    <Field label="Email Address" required error={concern.errors.email}>
                        {(id) => <Input id={id} type="email" value={concern.data.email} onChange={(e) => concern.setData('email', e.target.value)} />}
                    </Field>
                    <Field label="Where did you see it?" required error={concern.errors.surface} hint="Page or service, e.g. Our Promise">
                        {(id) => <Input id={id} value={concern.data.surface} onChange={(e) => concern.setData('surface', e.target.value)} />}
                    </Field>
                    <Field label="Claim or statement" required error={concern.errors.claim}>
                        {(id) => <Input id={id} value={concern.data.claim} onChange={(e) => concern.setData('claim', e.target.value)} />}
                    </Field>
                    <Field label="Why does it need correcting?" required error={concern.errors.details} className="sm:col-span-2">
                        {(id) => <Textarea id={id} rows={4} value={concern.data.details} onChange={(e) => concern.setData('details', e.target.value)} />}
                    </Field>
                    <div className="flex justify-end gap-2 sm:col-span-2">
                        <Button type="button" variant="outline" onClick={() => setConcernOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={concern.processing}>Submit Concern</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
