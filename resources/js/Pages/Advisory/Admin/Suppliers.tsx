import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, Stat, zar } from '@/Components/Advisory/ui';
import type { Paginated } from '@/types/advisory';

interface Sup { id: number; code: string; name: string; category: string; services: string; status: string; contract: string | null; rate_card: string; last_cost_zar: number; rate_card_max_zar: number; rating: number; over: boolean }
interface Props { suppliers: Paginated<Sup>; filters: Record<string, string>; categories: string[]; kpis: Record<string, number> }

export default function Suppliers({ suppliers, filters, categories, kpis }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState(false);
    const [cost, setCost] = useState<Record<number, string>>({});
    const form = useForm({ name: '', category: '', services: '', contract_end: '', rate_card_max_zar: 0 });
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/tech/suppliers', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const upd = (s: Sup, data: Record<string, string | number>) => router.post(`/admin/advisory/tech/suppliers/${s.id}`, data, { preserveScroll: true });
    return (
        <AdminShell title="Admin Supplier / External Cost Manager" description="Manage suppliers, external costs, rate cards and cost governance." actions={<Button size="sm" onClick={() => setOpen(true)}>+ Add Supplier</Button>}>
            <Head title="Supplier / External Cost Manager" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Active Suppliers" value={kpis.active} sub={`of ${kpis.total}`} tone="good" />
                <Stat label="On Hold" value={kpis.hold} tone="warn" />
                <Stat label="Pending Approvals" value={kpis.pending} sub="Supplier exceptions" />
                <Stat label="Expiring Contracts" value={kpis.expiring} sub="Within 30 days" tone="warn" />
                <Stat label="Above Rate Card" value={kpis.over} tone="bad" />
                <Stat label="Total External Cost" value={zar(kpis.cost)} sub="Last recorded costs" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="sq" className="sr-only">Search</label><Input id="sq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search suppliers..." className="w-56" /></form>
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['active', 'on_hold', 'inactive']} className="w-36" />
                        <Select aria-label="Category" value={filters.category ?? ''} onChange={(e) => go({ category: e.target.value })} placeholder="All Categories" options={categories} className="w-44" />
                    </div>
                    <SimpleTable columns={['Supplier ID', 'Supplier Name', 'Category', 'Services', 'Status', 'Contract End', 'Rate Card (max)', 'Last Cost (Excl. VAT)', 'Performance', 'Actions']}
                        rows={suppliers.data.map((s) => [<span className="font-mono text-xs text-controlled-700">{s.code}</span>, s.name, s.category, s.services,
                            <select aria-label={`Status of ${s.name}`} value={s.status} onChange={(e) => upd(s, { action: e.target.value })} className="rounded border border-parchment-500 text-xs">{['active', 'on_hold', 'inactive'].map((x) => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select>,
                            s.contract, <span className="text-xs">{s.rate_card}<br />{zar(s.rate_card_max_zar)}</span>, <span className={s.over ? 'font-semibold text-risk-700' : ''}>{zar(s.last_cost_zar)}</span>, <span className="inline-flex items-center gap-0.5 text-xs"><Star className="size-3 fill-gold-500 text-gold-500" />{s.rating}</span>,
                            <span className="flex items-center gap-1"><Input aria-label={`New cost for ${s.name}`} type="number" min={0} value={cost[s.id] ?? ''} onChange={(e) => setCost({ ...cost, [s.id]: e.target.value })} className="h-8 w-24" placeholder="Cost" /><Button size="sm" variant="outline" disabled={!cost[s.id]} onClick={() => upd(s, { action: 'cost', cost: Number(cost[s.id]) })}>Record</Button></span>])} />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {suppliers.from ?? 0} to {suppliers.to ?? 0} of {suppliers.total} suppliers</p><Pager links={suppliers.links} /></div>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Supplier Overview"><KV rows={[['Total Suppliers', kpis.total], ['Active', kpis.active], ['On Hold', kpis.hold], ['Inactive', kpis.inactive]]} /></Card>
                    <Card title="Governance & Compliance"><CheckList items={['Pass-through at cost — no markup', 'Cost above rate card raises an exception', 'Supplier commitment only after cleared Ledger X funding', 'Segregation of duties enforced', 'Audit trail enabled']} /></Card>
                </aside>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Add Supplier" footer={<Button type="submit" form="sup-form" disabled={form.processing}>Add supplier</Button>}>
                <form id="sup-form" onSubmit={(e) => { e.preventDefault(); form.post('/admin/advisory/tech/suppliers', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } }); }} className="grid gap-3 sm:grid-cols-2">
                    <Field label="Supplier name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Category" required error={form.errors.category}>{(id) => <Input id={id} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} />}</Field>
                    <Field label="Services" required error={form.errors.services} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.services} onChange={(e) => form.setData('services', e.target.value)} />}</Field>
                    <Field label="Contract end" required error={form.errors.contract_end}>{(id) => <Input id={id} type="date" value={form.data.contract_end} onChange={(e) => form.setData('contract_end', e.target.value)} />}</Field>
                    <Field label="Rate card maximum (ZAR)" required error={form.errors.rate_card_max_zar}>{(id) => <Input id={id} type="number" min={0} value={form.data.rate_card_max_zar} onChange={(e) => form.setData('rate_card_max_zar', Number(e.target.value))} />}</Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

Suppliers.layout = null;
