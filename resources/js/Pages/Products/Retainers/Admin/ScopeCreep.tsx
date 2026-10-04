import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Download, PieChart, Plus, Search, XCircle } from 'lucide-react';
import { Modal, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { ActionButton, BarRow, CheckList } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Change {
    id: number;
    reference: string;
    summary: string;
    change_type: string;
    raised_by: string;
    risk: string;
    status: string;
    stage: number;
    impact_hours: number;
    impact_zar: number;
    retainer: string;
    client: string;
    created_at: string;
}

interface Props {
    kpis: { potential: number; review: number; approved: number; rejected: number; hours: number; rate: number };
    changes: Change[];
    filters: { status: string; risk: string; type: string; raised_by: string; q: string };
    heat: Record<string, Record<string, number>>;
    alignment: { within: number; approved: number; pending: number; rejected: number };
    types: Record<string, number>;
    timeline: { date: string; summary: string; status: string; hours: number }[];
    options: { value: string; label: string }[];
}

const PATH = '/admin/products/retainers/scope-creep';
const HEAT = (n: number, impact: string, like: string) => {
    const score = ['Low', 'Medium', 'High'].indexOf(impact) + ['Low', 'Medium', 'High'].indexOf(like);
    return score >= 3 ? 'bg-risk-500 text-white' : score === 2 ? 'bg-attested-500 text-white' : 'bg-verified-500 text-white';
};

export default function ScopeCreep({ kpis, changes, filters, heat, alignment, types, timeline, options }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({ retainer: options[0]?.value ?? '', change_type: 'Additional Activity', summary: '', risk: 'Medium', impact_hours: '1' });
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const total = alignment.within + alignment.approved + alignment.pending + alignment.rejected || 1;
    const p = (n: number) => Math.round((n / total) * 100);
    const maxType = Math.max(1, ...Object.values(types));
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(PATH, { preserveScroll: true, onSuccess: () => setOpen(false) });
    };

    return (
        <AdminShell title="Scope-Creep Monitor" description="Detect, track and manage scope changes to ensure alignment with the agreed scope and allowance.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={AlertTriangle} tone="bad" label="Potential Scope Creep" value={kpis.potential} caption="Items detected" />
                <StatTile icon={Search} tone="gold" label="Under Review" value={kpis.review} caption="Awaiting assessment" />
                <StatTile icon={CheckCircle2} tone="good" label="Approved Changes" value={kpis.approved} caption="This period" />
                <StatTile icon={XCircle} tone="bad" label="Rejected Changes" value={kpis.rejected} caption="This period" />
                <StatTile icon={Clock} tone="purple" label="Additional Hours (Approved)" value={hrs(kpis.hours)} caption="This period" />
                <StatTile icon={PieChart} tone="info" label="Approval Rate" value={`${kpis.rate}%`} caption="This period" />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All Statuses' }, ...['under_review', 'proposed', 'approved', 'rejected'].map((s) => ({ value: s, label: s.replace('_', ' ') }))]} />
                <MiniSelect label="Risk Level" value={filters.risk} onChange={(v) => set('risk', v)} options={[{ value: '', label: 'All Levels' }, ...['Low', 'Medium', 'High'].map((s) => ({ value: s, label: s }))]} />
                <MiniSelect label="Change Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ value: '', label: 'All Types' }, ...Object.keys(types).map((s) => ({ value: s, label: s }))]} />
                <MiniSelect label="Raised By" value={filters.raised_by} onChange={(v) => set('raised_by', v)} options={[{ value: '', label: 'All' }, { value: 'Client', label: 'Client' }, { value: 'Adviser', label: 'Adviser' }]} />
                <label className="flex flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">Search<input defaultValue={filters.q} onKeyDown={(e) => e.key === 'Enter' && set('q', (e.target as HTMLInputElement).value)} placeholder="Search scope items..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" /></label>
                <button type="button" onClick={() => setOpen(true)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-referenced-700 px-4 text-sm font-semibold text-white"><Plus className="size-4" aria-hidden="true" />New Scope Change</button>
            </div>

            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_300px]">
                <Panel title="Scope Change Register" className="min-w-0">
                    <SimpleTable
                        columns={['ID', 'Change Description', 'Retainer', 'Change Type', 'Raised By', 'Detected On', 'Risk Level', 'Status', 'Impact (Hours)', 'Impact (ZAR excl. VAT)', 'Actions']}
                        rows={changes.map((c) => [
                            <span key="i" className="font-mono text-xs text-referenced-700">{c.reference}</span>, c.summary, <span key="r" className="text-xs">{c.retainer}<br /><span className="text-ink-400">{c.client}</span></span>, c.change_type, c.raised_by, fmtDate(c.created_at),
                            <StatusPill key="k" status={c.risk} tone={c.risk === 'High' ? 'bad' : c.risk === 'Medium' ? 'warn' : 'good'} />, <StatusPill key="s" status={c.status} />, hrs(c.impact_hours), zar(c.impact_zar),
                            <span key="a" className="flex flex-wrap gap-1">
                                {c.status === 'under_review' && <ActionButton href={`${PATH}/${c.id}`} data={{ decision: 'propose' }}>Propose to client</ActionButton>}
                                {['under_review', 'proposed'].includes(c.status) && <ActionButton href={`${PATH}/${c.id}`} data={{ decision: 'approve' }} tone="gold">Approve</ActionButton>}
                                {['under_review', 'proposed'].includes(c.status) && <ActionButton href={`${PATH}/${c.id}`} data={{ decision: 'reject' }} tone="danger">Reject</ActionButton>}
                            </span>,
                        ])}
                        empty="No scope items match."
                    />
                </Panel>
                <div className="space-y-4">
                    <Panel title="Scope Alignment Summary">
                        <div className="flex flex-col items-center gap-3">
                            <Donut size={130} stroke={18} segments={[{ value: alignment.within, color: C.green }, { value: alignment.approved, color: C.amber }, { value: alignment.pending, color: C.purple }, { value: alignment.rejected, color: C.red }]} />
                            <div className="w-full"><Legend items={[{ color: C.green, label: 'Within Scope', value: `${p(alignment.within)}% (${hrs(alignment.within)} h)` }, { color: C.amber, label: 'Changes Approved', value: `${p(alignment.approved)}% (${hrs(alignment.approved)} h)` }, { color: C.purple, label: 'Pending Review', value: `${p(alignment.pending)}% (${hrs(alignment.pending)} h)` }, { color: C.red, label: 'Rejected', value: `${p(alignment.rejected)}% (${hrs(alignment.rejected)} h)` }]} /></div>
                        </div>
                    </Panel>
                    <Panel title="Top Change Types">
                        <div className="space-y-2">{Object.entries(types).map(([t, n]) => <BarRow key={t} label={t} value={n} max={maxType} tone="info" />)}</div>
                    </Panel>
                </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Panel title="Risk Heat Map">
                    <div className="grid grid-cols-[60px_repeat(3,1fr)] gap-1 text-center text-xs">
                        {['High', 'Medium', 'Low'].map((impact) => (
                            <div key={impact} className="contents">
                                <span className="flex items-center text-ink-500">{impact}</span>
                                {['Low', 'Medium', 'High'].map((like) => <span key={like} className={cn('flex h-12 items-center justify-center rounded text-base font-bold', HEAT(heat[impact]?.[like] ?? 0, impact, like))}>{heat[impact]?.[like] ?? 0}</span>)}
                            </div>
                        ))}
                        <span />
                        {['Low', 'Medium', 'High'].map((l) => <span key={l} className="text-ink-500">{l}</span>)}
                    </div>
                    <p className="mt-1 text-center text-[0.6875rem] text-ink-400">Impact (rows) × Likelihood by hours (columns)</p>
                </Panel>
                <Panel title="Recent Scope Change Timeline">
                    <ol className="space-y-3 text-xs">{timeline.map((t, i) => <li key={i} className="border-l-2 border-referenced-500/40 pl-3"><p className="font-semibold text-ink-900">{fmtDate(t.date)}</p><p className="text-ink-700">{t.summary}</p><p className="text-ink-500">Status: {t.status.replace('_', ' ')} • Impact: {hrs(t.hours)} hrs</p></li>)}</ol>
                </Panel>
                <Panel title="Recommended Actions">
                    <CheckList items={[`Review ${kpis.review} items awaiting assessment`, 'Confirm allowance impact with client', 'Route out-of-scope work to a priced alternative — never absorb it', 'Communicate decisions and next steps']} />
                </Panel>
            </div>

            <div className="mt-5 flex justify-end"><button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-500 px-4 text-sm"><Download className="size-4" aria-hidden="true" />Export Report</button></div>

            <Modal open={open} onClose={() => setOpen(false)} title="Open Scope Review" footer={<><button type="button" onClick={() => setOpen(false)} className="h-9 rounded border border-parchment-500 px-4 text-sm">Cancel</button><button type="submit" form="sc-form" disabled={form.processing} className="h-9 rounded bg-referenced-700 px-4 text-sm font-semibold text-white">Open</button></>}>
                <form id="sc-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
                    <Field label="Retainer" className="sm:col-span-2">{(id) => <Select id={id} value={form.data.retainer} onChange={(e) => form.setData('retainer', e.target.value)} options={options} />}</Field>
                    <Field label="Change Type">{(id) => <Select id={id} value={form.data.change_type} onChange={(e) => form.setData('change_type', e.target.value)} options={['Additional Deliverable', 'Additional Activity', 'Schedule Change', 'Out of Scope']} />}</Field>
                    <Field label="Risk">{(id) => <Select id={id} value={form.data.risk} onChange={(e) => form.setData('risk', e.target.value)} options={['Low', 'Medium', 'High']} />}</Field>
                    <Field label="Summary" required error={(form.errors as Record<string, string>).summary} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.summary} onChange={(e) => form.setData('summary', e.target.value)} />}</Field>
                    <Field label="Impact (hours)">{(id) => <Input id={id} type="number" step={0.25} value={form.data.impact_hours} onChange={(e) => form.setData('impact_hours', e.target.value)} />}</Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

ScopeCreep.layout = null;
