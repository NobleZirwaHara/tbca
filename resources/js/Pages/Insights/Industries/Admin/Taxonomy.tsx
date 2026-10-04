import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Download, Edit3, FileText, Plus, Search } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Chip, Donut, DynIcon, Legend, PALETTE, Status, Table } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Props {
    filters: { q: string | null; status: string | null };
    industries: { id: number; number: number; slug: string; name: string; icon: string | null; status: string; subCount: number }[];
    selected: null | {
        id: number; number: number; slug: string; name: string; icon: string | null; code: string; canonicalCode: string; status: string; version: string; created: string; updated: string;
        description: string | null; examples: string[]; rules: string[]; blurb: string | null; complexityClass: string; catalogueState: string;
        subIndustries: { id: number; code: string; name: string; description: string | null; bands: string; status: string; sprintCount: number; updated: string }[];
        changes: { date: string; by: string; type: string; details: string; version: string }[];
    };
    summary: { industries: number; subIndustries: number; active: number; inactive: number; mapped: number; unmapped: number };
    complexity: { class: string; label: string; count: number }[];
    quality: { orphans: number; duplicates: number; missingDescriptions: number };
}

export default function Taxonomy({ filters, industries, selected: s, summary, complexity, quality }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', status: filters.status ?? '', industry: s?.slug ?? '' }, '/admin/insights/industries/taxonomy');
    const [modal, setModal] = useState<'none' | 'add' | 'edit' | 'sub'>('none');
    const addForm = useForm({ name: '', short_code: '', blurb: '', complexity_class: 'C1' });
    const editForm = useForm({ name: s?.name ?? '', description: s?.description ?? '', status: s?.status ?? 'active', complexity_class: s?.complexityClass ?? 'C1', catalogue_state: s?.catalogueState ?? 'deep', examples: (s?.examples ?? []).join(', ') });
    const subForm = useForm({ name: '', description: '', complexity_bands: 'C1 - C3' });
    const totalCx = complexity.reduce((a, c) => a + c.count, 0);

    return (
        <IndustryAdmin
            title="Sector Taxonomy Manager"
            badge="Canonical Source of Truth"
            description={`Manage the ${summary.industries} canonical industries and ${summary.subIndustries} sub-industries used for Sprint classification, curation and pricing.`}
            actions={
                <>
                    <Link href="/resources/limitations" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><FileText className="size-4" /> Taxonomy Policy</Link>
                    <a href="/admin/insights/industries/taxonomy-export" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Export Taxonomy (CSV)</a>
                    <button type="button" onClick={() => setModal('add')} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Add Industry</button>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[280px_1fr_260px]">
                <Box title={`Industries (${industries.length})`}>
                    <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mb-3 flex gap-2">
                        <label className="relative flex-1"><span className="sr-only">Search industries</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search industries..." className="h-9 w-full rounded border border-parchment-500 pl-7 text-xs" /></label>
                        <select aria-label="Status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select>
                    </form>
                    <ul className="max-h-[560px] space-y-1 overflow-y-auto">
                        {industries.map((i) => (
                            <li key={i.id}>
                                <Link href={`/admin/insights/industries/taxonomy?industry=${i.slug}`} preserveScroll className={cn('flex items-center gap-2 rounded-[6px] border p-2', s?.slug === i.slug ? 'border-gold-400 bg-gold-50' : 'border-transparent hover:bg-parchment-100')}>
                                    <DynIcon name={i.icon} className="size-5 text-ink-600" />
                                    <span className="flex-1 text-xs"><strong className="block">{i.number}. {i.name}</strong>{i.subCount} sub-industries</span>
                                    <Status value={i.status} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Box>

                {s && (
                    <div className="space-y-4">
                        <Box title="Selected Industry" action={<span className="flex items-center gap-2"><Status value={s.status} /><button type="button" onClick={() => setModal('edit')} className="flex items-center gap-1 rounded border px-2 py-1 text-xs"><Edit3 className="size-3.5" /> Edit Industry</button></span>}>
                            <div className="flex items-center gap-3"><DynIcon name={s.icon} className="size-10 rounded-[8px] bg-gold-50 p-2 text-gold-700" /><h2 className="text-lg font-semibold">{s.number}. {s.name}</h2><Chip>Canonical</Chip></div>
                            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_220px]">
                                <div>
                                    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">{[['Industry Code', s.code], ['Canonical ID', s.canonicalCode], ['Created', s.created], ['Last Updated', s.updated], ['Version', s.version]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                                    <p className="mt-3 text-xs font-semibold">Description</p><p className="text-xs text-ink-600">{s.description}</p>
                                    <p className="mt-3 text-xs font-semibold">Included Examples</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">{s.examples.map((x) => <span key={x} className="rounded bg-verified-50 px-2 py-0.5 text-[0.6875rem] text-verified-700">{x}</span>)}</div>
                                </div>
                                <div className="rounded border border-parchment-300 p-3"><p className="text-xs font-semibold">Industry Rules</p><ul className="mt-2 space-y-1 text-[0.6875rem]">{s.rules.map((r) => <li key={r} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{r}</li>)}</ul></div>
                            </div>
                        </Box>
                        <Box title={`Sub-Industries (${s.subIndustries.length})`} action={<button type="button" onClick={() => setModal('sub')} className="flex items-center gap-1 rounded border px-2 py-1 text-xs"><Plus className="size-3.5" /> Add Sub-Industry</button>}>
                            <Table head={['Code', 'Sub-Industry', 'Description (Short)', 'Complexity Bands', 'Status', 'Sprint Count', 'Updated']} rows={s.subIndustries.map((x) => [x.code, <strong key="n">{x.name}</strong>, <span key="d" className="text-xs">{x.description}</span>, x.bands, <Status key="s" value={x.status} />, x.sprintCount, x.updated])} />
                        </Box>
                        <Box title="Recent Changes">
                            <Table head={['Date', 'Changed By', 'Change Type', 'Details', 'Version']} rows={s.changes.map((c) => [c.date, c.by, c.type, c.details, c.version])} empty="No changes recorded." />
                        </Box>
                    </div>
                )}

                <div className="space-y-4">
                    <Box title="Taxonomy Summary">
                        <dl className="space-y-1.5 text-xs">{[['Industries (Top Level)', summary.industries], ['Sub-Industries', summary.subIndustries], ['Active', summary.active], ['Inactive / Archived', summary.inactive], ['Industry SKUs Mapped', summary.mapped], ['Unmapped SKUs', summary.unmapped]].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                    </Box>
                    <Box title="Complexity Distribution (All)">
                        <div className="flex flex-col items-center gap-3">
                            <Donut label={totalCx} sub="SKUs" size={110} segments={complexity.map((c, i) => ({ value: c.count, color: PALETTE[i] }))} />
                            <Legend items={complexity.map((c, i) => ({ label: `${c.class} ${c.label}`, value: `${c.count} (${totalCx ? Math.round((c.count / totalCx) * 100) : 0}%)`, color: PALETTE[i] }))} />
                        </div>
                    </Box>
                    <Box title="Data Quality">
                        <ul className="space-y-1.5 text-xs">
                            {[[quality.orphans === 0, 'No orphaned sub-industries'], [true, 'All sub-industries mapped to parent'], [quality.duplicates === 0, 'No duplicate codes'], [quality.missingDescriptions === 0, 'Descriptions up to date']].map(([ok, t]) => <li key={t as string} className={cn('flex gap-1.5', !ok && 'text-risk-700')}><CheckCircle2 className={cn('size-4', ok ? 'text-verified-500' : 'text-risk-500')} />{t as string}</li>)}
                        </ul>
                    </Box>
                </div>
            </div>

            <Modal open={modal === 'add'} onClose={() => setModal('none')} title="Add Industry (proposed)" footer={<button type="button" onClick={() => addForm.post('/admin/insights/industries/taxonomy', { onSuccess: () => setModal('none') })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Add Industry</button>}>
                <div className="space-y-3">
                    <Field label="Industry name" required error={addForm.errors.name}>{(id) => <Input id={id} value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />}</Field>
                    <Field label="Short code (3 letters)" required error={addForm.errors.short_code}>{(id) => <Input id={id} maxLength={3} value={addForm.data.short_code} onChange={(e) => addForm.setData('short_code', e.target.value.toUpperCase())} />}</Field>
                    <Field label="Selector description" required error={addForm.errors.blurb}>{(id) => <Textarea id={id} value={addForm.data.blurb} onChange={(e) => addForm.setData('blurb', e.target.value)} />}</Field>
                    <Field label="Complexity class" required error={addForm.errors.complexity_class}>{(id) => <Select id={id} value={addForm.data.complexity_class} onChange={(e) => addForm.setData('complexity_class', e.target.value)} options={['C0', 'C1', 'C2', 'C3']} />}</Field>
                </div>
            </Modal>
            <Modal open={modal === 'edit'} onClose={() => setModal('none')} title={`Edit ${s?.name ?? ''}`} footer={<button type="button" onClick={() => s && editForm.put(`/admin/insights/industries/taxonomy/${s.slug}`, { preserveScroll: true, onSuccess: () => setModal('none') })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Save (new version)</button>}>
                <div className="space-y-3">
                    <Field label="Name" required error={editForm.errors.name}>{(id) => <Input id={id} value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />}</Field>
                    <Field label="Description" required error={editForm.errors.description}>{(id) => <Textarea id={id} value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />}</Field>
                    <Field label="Included examples (comma separated)" error={editForm.errors.examples}>{(id) => <Input id={id} value={editForm.data.examples} onChange={(e) => editForm.setData('examples', e.target.value)} />}</Field>
                    <div className="grid grid-cols-3 gap-2">
                        <Field label="Status">{(id) => <Select id={id} value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} options={['active', 'inactive', 'archived']} />}</Field>
                        <Field label="Complexity">{(id) => <Select id={id} value={editForm.data.complexity_class} onChange={(e) => editForm.setData('complexity_class', e.target.value)} options={['C0', 'C1', 'C2', 'C3']} />}</Field>
                        <Field label="Catalogue">{(id) => <Select id={id} value={editForm.data.catalogue_state} onChange={(e) => editForm.setData('catalogue_state', e.target.value)} options={[{ value: 'deep', label: 'Deep' }, { value: 'thin', label: 'Thin' }, { value: 'below_threshold', label: 'Below threshold' }]} />}</Field>
                    </div>
                </div>
            </Modal>
            <Modal open={modal === 'sub'} onClose={() => setModal('none')} title="Add Sub-Industry" footer={<button type="button" onClick={() => s && subForm.post(`/admin/insights/industries/taxonomy/${s.slug}/sub-industries`, { preserveScroll: true, onSuccess: () => { setModal('none'); subForm.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Add</button>}>
                <div className="space-y-3">
                    <Field label="Sub-industry name" required error={subForm.errors.name}>{(id) => <Input id={id} value={subForm.data.name} onChange={(e) => subForm.setData('name', e.target.value)} />}</Field>
                    <Field label="Short description" required error={subForm.errors.description}>{(id) => <Input id={id} value={subForm.data.description} onChange={(e) => subForm.setData('description', e.target.value)} />}</Field>
                    <Field label="Complexity bands" required error={subForm.errors.complexity_bands}>{(id) => <Input id={id} value={subForm.data.complexity_bands} onChange={(e) => subForm.setData('complexity_bands', e.target.value)} />}</Field>
                </div>
            </Modal>
        </IndustryAdmin>
    );
}
