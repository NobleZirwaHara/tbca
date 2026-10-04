import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Archive, CheckCircle2, Clock, Download, FileCheck2, Landmark, Plus, Search } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Donut, Legend, PALETTE, Stat, Status, Table, label } from '@/Components/Insights/Shared';

interface Row { id: number; name: string; acronym: string; type: string; sectors: string; jurisdiction: string; permissions: string; renewal: string | null; status: string; opinionStatus: string; allowsSprints: string; updated: string }
interface Props {
    filters: { q?: string; type?: string; opinion?: string; allows?: string };
    rows: Row[];
    kpis: { total: number; active: number; permissions: number; review: number; archived: number };
    bySector: Record<string, number>;
    opinions: Record<string, number>;
    types: string[];
}
const EMPTY = { name: '', acronym: '', type: 'Regulatory Body', sectors: '', jurisdiction: 'South Africa', permissions: 'Permission', opinion_status: 'active', renewal: '', allows_sprints: 'yes', status: 'active' };

export default function Regulators({ filters, rows, kpis, bySector, opinions, types }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', type: filters.type ?? '', opinion: filters.opinion ?? '', allows: filters.allows ?? '' }, '/admin/insights/industries/regulators');
    const [edit, setEdit] = useState<Row | 'new' | null>(null);
    const form = useForm(EMPTY);
    const openEdit = (r: Row | 'new') => {
        form.setData(r === 'new' ? EMPTY : { name: r.name, acronym: r.acronym, type: r.type, sectors: r.sectors, jurisdiction: r.jurisdiction, permissions: r.permissions, opinion_status: r.opinionStatus, renewal: r.renewal ?? '', allows_sprints: r.allowsSprints, status: r.status });
        setEdit(r);
    };
    const save = () => (edit === 'new' ? form.post('/admin/insights/industries/regulators', { preserveScroll: true, onSuccess: () => setEdit(null) }) : edit && form.put(`/admin/insights/industries/regulators/${edit.id}`, { preserveScroll: true, onSuccess: () => setEdit(null) }));
    const sectorTotal = Object.values(bySector).reduce((a, b) => a + b, 0);

    return (
        <IndustryAdmin title="Sector Regulator Register" badge="Governance Controlled" description="Maintain regulators, permissions, opinions and compliance requirements for Industries and related Sprints."
            actions={<><a href="/admin/insights/industries/regulators-export" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Export Register (CSV)</a><button type="button" onClick={() => openEdit('new')} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Add Regulator / Update</button></>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Regulators" value={kpis.total} caption="Across SA & Selected Africa" icon={<Landmark className="size-5" />} />
                <Stat label="Active" value={kpis.active} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Permissions Issued" value={kpis.permissions} icon={<FileCheck2 className="size-5" />} />
                <Stat label="Under Review" value={kpis.review} tone="amber" icon={<Clock className="size-5" />} />
                <Stat label="Archived / Inactive" value={kpis.archived} icon={<Archive className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search regulator name, acronym, sector..." className="h-9 w-64 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
                <select aria-label="Opinion status" value={f.opinion} onChange={(e) => apply({ opinion: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Opinion Statuses</option>{Object.keys(opinions).map((o) => <option key={o} value={o}>{label(o)}</option>)}</select>
                <select aria-label="Permits sprints" value={f.allows} onChange={(e) => apply({ allows: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">Permits Sprints: All</option><option value="yes">Yes</option><option value="conditional">Conditional</option><option value="no">No</option></select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply Filters</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_270px]">
                <Box title={`Regulators (${rows.length})`}>
                    <Table head={['Regulator Name', 'Acronym', 'Regulator Type', 'Primary Sector(s)', 'Jurisdiction', 'Permissions / Opinions', 'Opinion Status', 'Renewal / Review', 'Allows Sprints', 'Status', 'Last Updated', '']}
                        rows={rows.map((r) => [<strong key="n" className="text-xs">{r.name}</strong>, r.acronym, <span key="t" className="text-xs">{r.type}</span>, <span key="s" className="text-xs">{r.sectors}</span>, r.jurisdiction, <span key="p" className="text-xs">{r.permissions}</span>, <Status key="o" value={r.opinionStatus} />, r.renewal ?? '—', <Status key="a" value={r.allowsSprints} />, <Status key="st" value={r.status} />, r.updated, <button key="e" type="button" onClick={() => openEdit(r)} className="rounded border px-2 py-0.5 text-xs">Edit</button>])} />
                </Box>
                <div className="space-y-4">
                    <Box title="Register Summary by Sector"><div className="flex flex-col items-center gap-3"><Donut label={sectorTotal} sub="Total" size={110} segments={Object.values(bySector).slice(0, 6).map((v, i) => ({ value: v, color: PALETTE[i] }))} /><Legend items={Object.entries(bySector).slice(0, 6).map(([k, v], i) => ({ label: k, value: `${v} (${Math.round((v / Math.max(1, sectorTotal)) * 100)}%)`, color: PALETTE[i] }))} /></div></Box>
                    <Box title="Opinion Status Overview"><Legend items={Object.entries(opinions).map(([k, v], i) => ({ label: label(k), value: v, color: PALETTE[i] }))} /></Box>
                </div>
            </div>
            <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === 'new' ? 'Add Regulator' : `Update ${typeof edit === 'object' && edit ? edit.acronym : ''}`} size="lg" footer={<button type="button" onClick={save} disabled={form.processing} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Save</button>}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(['name', 'acronym', 'type', 'sectors', 'jurisdiction', 'permissions', 'renewal'] as const).map((k) => <Field key={k} label={label(k)} required={k !== 'renewal'} error={form.errors[k]}>{(id) => <Input id={id} value={form.data[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>)}
                    <Field label="Opinion status" error={form.errors.opinion_status}>{(id) => <Select id={id} value={form.data.opinion_status} onChange={(e) => form.setData('opinion_status', e.target.value)} options={['active', 'under_review', 'conditional', 'expired', 'none'].map((v) => ({ value: v, label: label(v) }))} />}</Field>
                    <Field label="Allows Sprints" error={form.errors.allows_sprints}>{(id) => <Select id={id} value={form.data.allows_sprints} onChange={(e) => form.setData('allows_sprints', e.target.value)} options={['yes', 'conditional', 'no']} />}</Field>
                    <Field label="Status" error={form.errors.status}>{(id) => <Select id={id} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} options={['active', 'archived']} />}</Field>
                </div>
            </Modal>
        </IndustryAdmin>
    );
}
