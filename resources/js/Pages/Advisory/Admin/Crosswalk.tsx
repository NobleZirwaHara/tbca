import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { Card, KV, Notice } from '@/Components/Advisory/ui';
import type { Paginated } from '@/types/advisory';

interface Row { id: number; source_taxonomy: string; source_code: string; source_label: string; target_taxonomy: string; target_code: string; target_label: string; relationship: string; confidence: number; status: string; last_verified: string | null }
interface Props { rows: Paginated<Row>; filters: Record<string, string>; options: { sources: string[]; targets: string[]; relationships: string[] }; summary: Record<string, number> }

export default function Crosswalk({ rows, filters, options, summary }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState(false);
    const form = useForm({ source_taxonomy: '', source_code: '', source_label: '', target_taxonomy: '', target_code: '', target_label: '', relationship: 'Exact Match', confidence: 90 });
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/crosswalk', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const pct = (n: number) => (summary.total ? Math.round((n / summary.total) * 100) : 0);
    return (
        <AdminShell title="Taxonomy Crosswalk Manager" description="Map and maintain relationships between different classification taxonomies used across TBCA systems." actions={<><Button size="sm" variant="outline" onClick={() => router.post('/admin/advisory/crosswalk/validate', {}, { preserveScroll: true })}>Run Validation Check</Button><Button size="sm" onClick={() => setOpen(true)}>+ Create New Mapping</Button></>}>
            <Head title="Taxonomy Crosswalk Manager" />
            <div className="grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="cq" className="sr-only">Search</label><Input id="cq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mappings, codes, or descriptions..." className="w-64" /></form>
                        <Select aria-label="Source" value={filters.source ?? ''} onChange={(e) => go({ source: e.target.value })} placeholder="All Source Taxonomies" options={options.sources} className="w-48" />
                        <Select aria-label="Target" value={filters.target ?? ''} onChange={(e) => go({ target: e.target.value })} placeholder="All Target Taxonomies" options={options.targets} className="w-48" />
                        <Select aria-label="Relationship" value={filters.relationship ?? ''} onChange={(e) => go({ relationship: e.target.value })} placeholder="All Relationship Types" options={options.relationships} className="w-44" />
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['validated', 'under_review', 'needs_attention']} className="w-40" />
                    </div>
                    <h2 className="mb-2 text-sm font-semibold">Active Crosswalk Mappings ({rows.total})</h2>
                    <SimpleTable columns={['Source Taxonomy', 'Source Code', 'Source Label', 'Target Taxonomy', 'Target Code', 'Target Label', 'Relationship', 'Confidence', 'Status', 'Last Verified', '']}
                        rows={rows.data.map((r) => [r.source_taxonomy, <span className="font-mono">{r.source_code}</span>, r.source_label, r.target_taxonomy, <span className="font-mono">{r.target_code}</span>, r.target_label, r.relationship, <span className={r.confidence < 80 ? 'font-semibold text-risk-700' : ''}>{r.confidence}%</span>, <StatusPill status={r.status} />, r.last_verified ? new Date(r.last_verified).toLocaleDateString('en-ZA') : '—', r.status !== 'validated' ? <Button size="sm" variant="outline" onClick={() => router.post(`/admin/advisory/crosswalk/${r.id}`, {}, { preserveScroll: true })}>Validate</Button> : ''])} />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {rows.from ?? 0} to {rows.to ?? 0} of {rows.total} mappings</p><Pager links={rows.links} /></div>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Crosswalk Summary"><KV rows={[['Total Mappings', summary.total], ['Validated', `${summary.validated} (${pct(summary.validated)}%)`], ['Under Review', `${summary.review} (${pct(summary.review)}%)`], ['Needs Attention', `${summary.attention} (${pct(summary.attention)}%)`], ['Source Taxonomies', summary.sources], ['Target Taxonomies', summary.targets], ['Average Confidence', `${summary.confidence}%`]]} /></Card>
                    <Card title="Recent Validation Alerts">{summary.low > 0 ? <Notice tone="warn">{summary.low} mapping(s) have low confidence (&lt;80%).</Notice> : <Notice tone="good">All mappings ≥ 80% confidence.</Notice>}<p className="mt-2 text-xs text-ink-500">Mappings below 80% cannot be validated until confidence is raised.</p></Card>
                </aside>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="New Crosswalk Mapping" size="lg" footer={<Button type="submit" form="cw-form" disabled={form.processing}>Create mapping</Button>}>
                <form id="cw-form" onSubmit={(e) => { e.preventDefault(); form.post('/admin/advisory/crosswalk', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } }); }} className="grid gap-3 sm:grid-cols-3">
                    {(['source_taxonomy', 'source_code', 'source_label', 'target_taxonomy', 'target_code', 'target_label'] as const).map((k) => <Field key={k} label={k.replace('_', ' ')} required error={form.errors[k]}>{(id) => <Input id={id} value={form.data[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>)}
                    <Field label="Relationship">{(id) => <Select id={id} value={form.data.relationship} onChange={(e) => form.setData('relationship', e.target.value)} options={options.relationships} />}</Field>
                    <Field label="Confidence (%)" error={form.errors.confidence}>{(id) => <Input id={id} type="number" min={0} max={100} value={form.data.confidence} onChange={(e) => form.setData('confidence', Number(e.target.value))} />}</Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

Crosswalk.layout = null;
