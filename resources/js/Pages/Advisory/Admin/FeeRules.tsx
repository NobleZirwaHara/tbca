import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { Card, Donut, KV, Stat } from '@/Components/Advisory/ui';
import type { Paginated } from '@/types/advisory';

interface Rule { id: number; code: string; name: string; tower: string; applies_to: string; rule_type: string; status: string; priority: string; health: string; value: number | null; updated: string; updated_by: string }
interface Props { rules: Paginated<Rule>; filters: Record<string, string>; kpis: { total: number; active: number; draft: number; archived: number; warning: number; error: number; last: { updated_by: string; updated_at: string } | null }; towers: string[]; types: string[] }

export default function FeeRules({ rules, filters, kpis, towers, types }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', tower: 'All Towers', applies_to: 'All Sprints', rule_type: 'Flat Fee', priority: 'Medium', value: '' });
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/tech/fee-rules', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const act = (r: Rule, action: string) => router.post(`/admin/advisory/tech/fee-rules/${r.id}`, { action }, { preserveScroll: true });
    const healthy = kpis.total - kpis.warning - kpis.error;
    return (
        <AdminShell title="Admin Fee Rule Manager" description="Configure, maintain and govern fee rules, formulas and pricing logic." actions={<Button size="sm" onClick={() => setOpen(true)}>+ Create New Rule</Button>}>
            <Head title="Fee Rule Manager" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Active Fee Rules" value={kpis.active} sub={`${kpis.total ? Math.round((kpis.active / kpis.total) * 100) : 0}% of all rules`} tone="good" />
                <Stat label="Draft Fee Rules" value={kpis.draft} sub="Pending activation (quarantined)" />
                <Stat label="Rules with Warnings" value={kpis.warning} sub="Review recommended" tone="warn" />
                <Stat label="Rules with Errors" value={kpis.error} sub="Hard-control FAIL" tone="bad" />
                <Stat label="Last Updated" value={kpis.last ? new Date(kpis.last.updated_at).toLocaleDateString('en-ZA') : '—'} sub={kpis.last ? `By ${kpis.last.updated_by}` : ''} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="fq" className="sr-only">Search</label><Input id="fq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rules..." className="w-56" /></form>
                        <Select aria-label="Tower" value={filters.tower ?? ''} onChange={(e) => go({ tower: e.target.value })} placeholder="All Towers" options={towers} className="w-36" />
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['active', 'draft', 'archived']} className="w-36" />
                        <Select aria-label="Type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} placeholder="All Rule Types" options={types} className="w-40" />
                    </div>
                    <SimpleTable columns={['Rule ID', 'Rule Name', 'Tower', 'Applies To', 'Rule Type', 'Value', 'Status', 'Health', 'Priority', 'Last Updated', 'Actions']}
                        rows={rules.data.map((r) => [<span className="font-mono text-xs text-controlled-700">{r.code}</span>, r.name, r.tower, r.applies_to, r.rule_type, r.value ?? '—', <StatusPill status={r.status} />, <StatusPill status={r.health} tone={r.health === 'healthy' ? 'good' : r.health === 'warning' ? 'warn' : 'bad'} />, r.priority, <span className="text-xs">{r.updated}<br />{r.updated_by}</span>,
                            <span className="flex flex-wrap gap-1">{r.status !== 'active' && <Button size="sm" variant="outline" onClick={() => act(r, 'activate')}>Activate</Button>}{r.status === 'active' && <Button size="sm" variant="outline" onClick={() => act(r, 'deactivate')}>Deactivate</Button>}<Button size="sm" variant="ghost" onClick={() => act(r, 'duplicate')}>Duplicate</Button>{r.status !== 'archived' && <Button size="sm" variant="ghost" onClick={() => act(r, 'archive')}>Archive</Button>}</span>])} />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {rules.from ?? 0} to {rules.to ?? 0} of {rules.total} rules</p><Pager links={rules.links} /></div>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Fee Rules Overview"><KV rows={[['Total Fee Rules', kpis.total], ['Active', kpis.active], ['Draft', kpis.draft], ['Archived', kpis.archived]]} /></Card>
                    <Card title="Rule Health"><div className="flex items-center gap-3"><Donut size={96} slices={[{ value: healthy, color: '#2f855a' }, { value: kpis.warning, color: '#d6a32e' }, { value: kpis.error, color: '#c53030' }]} center={`${kpis.total ? Math.round((healthy / kpis.total) * 100) : 0}%`} sub="Healthy" /><KV rows={[['Healthy', healthy], ['Warning', kpis.warning], ['Critical', kpis.error]]} /></div></Card>
                    <Card title="Hard controls"><ul className="space-y-1 text-[0.6875rem] text-ink-600"><li>Pass-through rules can never carry a value (no markup on Ledger X).</li><li>Flat fees below the R995 technology floor fail.</li><li>Discounts above 10% stay draft and raise an approval exception.</li><li>No override turns a FAIL into a PASS.</li></ul></Card>
                </aside>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Create New Fee Rule" footer={<Button type="submit" form="fr-form" disabled={form.processing}>Create (as draft)</Button>}>
                <form id="fr-form" onSubmit={(e) => { e.preventDefault(); form.post('/admin/advisory/tech/fee-rules', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } }); }} className="grid gap-3 sm:grid-cols-2">
                    <Field label="Rule name" required error={form.errors.name} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Tower">{(id) => <Select id={id} value={form.data.tower} onChange={(e) => form.setData('tower', e.target.value)} options={towers} />}</Field>
                    <Field label="Applies to" error={form.errors.applies_to}>{(id) => <Input id={id} value={form.data.applies_to} onChange={(e) => form.setData('applies_to', e.target.value)} />}</Field>
                    <Field label="Rule type">{(id) => <Select id={id} value={form.data.rule_type} onChange={(e) => form.setData('rule_type', e.target.value)} options={types} />}</Field>
                    <Field label="Priority">{(id) => <Select id={id} value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)} options={['High', 'Medium', 'Low']} />}</Field>
                    <Field label="Value (ZAR, %, or multiplier)" error={form.errors.value}>{(id) => <Input id={id} type="number" step="0.01" min={0} value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} />}</Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

FeeRules.layout = null;
