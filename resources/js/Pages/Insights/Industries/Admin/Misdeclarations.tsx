import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, CalendarCheck, Clock, FolderSearch, Plus, Search, TriangleAlert } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, CheckList, Donut, Legend, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Row { id: number; caseId: string; sku: string; title: string; client: string; suspected: string; declared: string; priority: string; status: string; assigned: string | null; due: string | null; days: number | null }
interface Props {
    filters: { q?: string; priority?: string; status?: string; assigned?: string };
    states: string[];
    rows: Row[];
    kpis: { total: number; high: number; medium: number; low: number; resolved: number; dueToday: number; overdue: number };
    mismatches: Record<string, number>;
    reviewers: string[];
    industries: string[];
}

export default function Misdeclarations({ filters, states, rows, kpis, mismatches, reviewers, industries }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', priority: filters.priority ?? '', status: filters.status ?? '', assigned: filters.assigned ?? '' }, '/admin/insights/industries/misdeclarations');
    const [add, setAdd] = useState(false);
    const form = useForm({ sku_code: '', client: '', suspected_industry: '', declared_industry: 'General Business', priority: 'medium' });
    const update = (r: Row, patch: Record<string, string>) => router.put(`/admin/insights/industries/misdeclarations/${r.id}`, { status: r.status, assigned_to: r.assigned, ...patch }, { preserveScroll: true });

    return (
        <IndustryAdmin title="Misdeclaration & Verification Queue" badge="Harm-First Reclassification" description="Review suspected misdeclarations and verify the correct Industry, Sub-Industry and regulatory controls."
            actions={<button type="button" onClick={() => setAdd(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Add Case / Referral</button>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total in Queue" value={kpis.total} icon={<FolderSearch className="size-5" />} />
                <Stat label="High Priority" value={kpis.high} tone="red" icon={<TriangleAlert className="size-5" />} />
                <Stat label="Medium Priority" value={kpis.medium} tone="amber" icon={<Clock className="size-5" />} />
                <Stat label="Low Priority" value={kpis.low} tone="green" icon={<ArrowDown className="size-5" />} />
                <Stat label="Resolved (Last 30 Days)" value={kpis.resolved} icon={<CalendarCheck className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by case ID, sprint code, client, title..." className="h-9 w-64 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Priority" value={f.priority} onChange={(e) => apply({ priority: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                <select aria-label="Status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">Open cases</option>{states.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
                <select aria-label="Assigned to" value={f.assigned} onChange={(e) => apply({ assigned: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Reviewers</option>{reviewers.map((r) => <option key={r}>{r}</option>)}</select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_270px]">
                <Box title={`Verification Queue (${rows.length})`}>
                    <Table head={['Case ID', 'Sprint Code', 'Sprint Title', 'Client', 'Suspected Industry', 'Declared Industry', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Days']}
                        rows={rows.map((r) => [
                            <strong key="c" className="text-xs">{r.caseId}</strong>, r.sku, <span key="t" className="text-xs">{r.title}</span>, <span key="cl" className="text-xs">{r.client}</span>, <span key="s" className="text-xs">{r.suspected}</span>, <span key="d" className="text-xs">{r.declared}</span>,
                            <Status key="p" value={r.priority} />,
                            <select key="st" aria-label={`Status of ${r.caseId}`} value={r.status} onChange={(e) => update(r, { status: e.target.value })} className="h-8 rounded border border-parchment-500 text-xs">{states.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>,
                            <select key="a" aria-label={`Assignee of ${r.caseId}`} value={r.assigned ?? ''} onChange={(e) => update(r, { assigned_to: e.target.value, status: r.status === 'new' ? 'assigned' : r.status })} className="h-8 rounded border border-parchment-500 text-xs"><option value="">Unassigned</option>{reviewers.map((x) => <option key={x}>{x}</option>)}</select>,
                            r.due ?? '—', <span key="dy" className={cn('font-semibold', (r.days ?? 1) < 0 ? 'text-risk-700' : (r.days ?? 9) <= 0 ? 'text-attested-700' : '')}>{r.days}</span>,
                        ])} />
                </Box>
                <div className="space-y-4">
                    <Box title="Queue Health by Priority"><div className="flex items-center gap-3"><Donut label={kpis.total} sub="Total" size={100} segments={[{ value: kpis.high, color: '#d64545' }, { value: kpis.medium, color: '#d6a32e' }, { value: kpis.low, color: '#2f9e5b' }]} /><Legend items={[{ label: 'High', value: kpis.high, color: '#d64545' }, { label: 'Medium', value: kpis.medium, color: '#d6a32e' }, { label: 'Low', value: kpis.low, color: '#2f9e5b' }]} /></div><p className="mt-2 text-xs text-ink-500">Due today {kpis.dueToday} · Overdue {kpis.overdue}</p></Box>
                    <Box title="Top Declared vs Suspected Mismatches"><ul className="space-y-1 text-xs">{Object.entries(mismatches).map(([k, v]) => <li key={k} className="flex justify-between gap-2"><span>{k}</span><strong>{v}</strong></li>)}</ul></Box>
                    <Box title="Harm-First Review Principles"><CheckList className="text-xs" items={['Protect clients and the public first', 'Do not suspend delivery without cause', 'Verify evidence, then reclassify', 'Apply correct regulatory controls', 'Update fees and permissions']} /></Box>
                </div>
            </div>
            <Modal open={add} onClose={() => setAdd(false)} title="Add Case / Referral" footer={<button type="button" onClick={() => form.post('/admin/insights/industries/misdeclarations', { preserveScroll: true, onSuccess: () => { setAdd(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Add case</button>}>
                <div className="space-y-3">
                    <Field label="Sprint code" required error={form.errors.sku_code} hint="e.g. FIN-330">{(id) => <Input id={id} value={form.data.sku_code} onChange={(e) => form.setData('sku_code', e.target.value)} />}</Field>
                    <Field label="Client" required error={form.errors.client}>{(id) => <Input id={id} value={form.data.client} onChange={(e) => form.setData('client', e.target.value)} />}</Field>
                    <Field label="Declared industry" required error={form.errors.declared_industry}>{(id) => <Input id={id} value={form.data.declared_industry} onChange={(e) => form.setData('declared_industry', e.target.value)} />}</Field>
                    <Field label="Suspected industry" required error={form.errors.suspected_industry}>{(id) => <Select id={id} value={form.data.suspected_industry} onChange={(e) => form.setData('suspected_industry', e.target.value)} options={industries} placeholder="Select" />}</Field>
                    <Field label="Priority" required>{(id) => <Select id={id} value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)} options={['high', 'medium', 'low']} />}</Field>
                </div>
            </Modal>
        </IndustryAdmin>
    );
}
