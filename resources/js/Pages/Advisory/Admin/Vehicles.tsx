import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { Card, KV, Stat } from '@/Components/Advisory/ui';
import type { Paginated } from '@/types/advisory';

interface V { code: string; name: string; client: string; type: string; engagement: string; status: string; start: string | null; milestone: string | null; milestone_date: string | null; owner: string | null; health: number | null; last: string | null }
interface Props { vehicles: Paginated<V>; filters: Record<string, string>; options: { clients: string[]; owners: string[]; types: string[] }; summary: Record<string, number> }

export default function Vehicles({ vehicles, filters, options, summary }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', client: '', type: 'Sprint', owner: '', value: 0 });
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/vehicles', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const exportCsv = () => {
        const rows = [['Vehicle ID', 'Name', 'Client', 'Type', 'Engagement', 'Status', 'Owner', 'Health'], ...vehicles.data.map((v) => [v.code, v.name, v.client, v.type, v.engagement, v.status, v.owner ?? '', String(v.health ?? '')])];
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')], { type: 'text/csv' }));
        a.download = 'vehicle-register.csv';
        a.click();
    };
    const pct = (n: number) => (summary.total ? Math.round((n / summary.total) * 100) : 0);
    return (
        <AdminShell title="Canonical Vehicle Register Console" description="All canonical vehicles and their engagement lifecycle across TBCA." actions={<><Button variant="outline" size="sm" onClick={exportCsv}>Export</Button><Button size="sm" onClick={() => setOpen(true)}>+ Register New Vehicle</Button></>}>
            <Head title="Canonical Vehicle Register" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Total Vehicles" value={summary.total} sub="Across all clients" />
                <Stat label="Active Vehicles" value={summary.active} sub="Engagement in progress" tone="good" />
                <Stat label="Completed Vehicles" value={summary.completed} sub="Closed engagements" />
                <Stat label="On Hold Vehicles" value={summary.on_hold} sub="Temporarily paused" tone="warn" />
                <Stat label="Archived Vehicles" value={summary.archived} sub="Inactive / exited" tone="bad" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="vq" className="sr-only">Search</label><Input id="vq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by Vehicle Name, ID or Client..." className="w-64" /></form>
                        <Select aria-label="Client" value={filters.client ?? ''} onChange={(e) => go({ client: e.target.value })} placeholder="All Clients" options={options.clients} className="w-48" />
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['active', 'on_hold', 'completed', 'archived']} className="w-36" />
                        <Select aria-label="Type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} placeholder="All Types" options={options.types} className="w-36" />
                        <Select aria-label="Owner" value={filters.owner ?? ''} onChange={(e) => go({ owner: e.target.value })} placeholder="All Engagement Owners" options={options.owners} className="w-48" />
                        <Button size="sm" variant="ghost" onClick={() => router.get('/admin/advisory/vehicles')}>Reset</Button>
                    </div>
                    <SimpleTable
                        columns={['Vehicle ID', 'Vehicle Name', 'Client / Enterprise', 'Type', 'Primary Engagement', 'Status', 'Start', 'Next Milestone', 'Owner', 'Health', 'Actions']}
                        rows={vehicles.data.map((v) => [<span className="font-mono text-xs text-controlled-700">{v.code}</span>, v.name, v.client, v.type, v.engagement, <StatusPill status={v.status} />, v.start, <span className="text-xs">{v.milestone}<br />{v.milestone_date}</span>, v.owner, <span className={(v.health ?? 0) >= 80 ? 'text-verified-700' : 'text-attested-700'}>{v.health !== null ? `${v.health}%` : '—'}</span>,
                            <select aria-label={`Change status of ${v.code}`} value={v.status} onChange={(e) => router.post(`/admin/advisory/vehicles/${v.code}/status`, { status: e.target.value }, { preserveScroll: true })} className="rounded border border-parchment-500 text-xs">{['active', 'on_hold', 'completed', 'archived'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>])}
                    />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {vehicles.from ?? 0} to {vehicles.to ?? 0} of {vehicles.total} vehicles</p><Pager links={vehicles.links} /></div>
                </section>
                <aside className="xl:col-span-3">
                    <Card title="Register Summary"><KV rows={[['Total Vehicles', summary.total], ['Active Vehicles', `${summary.active} (${pct(summary.active)}%)`], ['Completed', `${summary.completed} (${pct(summary.completed)}%)`], ['On Hold', `${summary.on_hold} (${pct(summary.on_hold)}%)`], ['Archived', `${summary.archived} (${pct(summary.archived)}%)`], ['Clients / Enterprises', summary.clients], ['Engagements Linked', summary.engagements], ['Average Health Score', `${summary.health}%`]]} /></Card>
                </aside>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Register New Vehicle" footer={<Button type="submit" form="veh-form" disabled={form.processing}>Register</Button>}>
                <form id="veh-form" onSubmit={(e) => { e.preventDefault(); form.post('/admin/advisory/vehicles', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } }); }} className="grid gap-3 sm:grid-cols-2">
                    <Field label="Vehicle name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Client / Enterprise" required error={form.errors.client}>{(id) => <Input id={id} value={form.data.client} onChange={(e) => form.setData('client', e.target.value)} />}</Field>
                    <Field label="Vehicle type">{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={options.types} />}</Field>
                    <Field label="Owner" required error={form.errors.owner}>{(id) => <Input id={id} value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} />}</Field>
                    <Field label="Contract value (ZAR)" error={form.errors.value}>{(id) => <Input id={id} type="number" min={0} value={form.data.value} onChange={(e) => form.setData('value', Number(e.target.value))} />}</Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

Vehicles.layout = null;
