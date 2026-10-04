import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { Progress, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { Card, KV, Stat, zar } from '@/Components/Advisory/ui';
import type { Paginated } from '@/types/advisory';

interface Row { id: number; code: string; description: string; vehicle_code: string; vehicle_name: string; client: string; type: string; disposition: string; status: string; owner: string; value_zar: number | null; start: string | null; target: string | null }
interface Props { rows: Paginated<Row>; filters: Record<string, string>; counts: Record<string, number>; total: number; vehicleCount: number; progress: number; options: { clients: string[]; vehicles: string[]; owners: string[] } }

const DISP = ['authorised', 'awaiting_client_input', 'blocked', 'completed', 'cancelled'];

export default function Dispositions({ rows, filters, counts, total, vehicleCount, progress, options }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/dispositions', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const update = (r: Row, data: Record<string, string>) => router.post(`/admin/advisory/dispositions/${r.id}`, data, { preserveScroll: true });
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
    return (
        <AdminShell title="Multi-Vehicle Sprint Disposition Workbench" description="Disposition, allocation, and status management of all sprints across active engagements and vehicles.">
            <Head title="Sprint Disposition Workbench" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
                <Stat label="Total Sprints" value={total} sub={`Across ${vehicleCount} vehicles`} />
                <Stat label="Authorised" value={counts.authorised ?? 0} sub={`${pct(counts.authorised ?? 0)}%`} tone="good" />
                <Stat label="In Progress" value={rows.data.filter((r) => r.status === 'In Progress').length} />
                <Stat label="Awaiting Client Input" value={counts.awaiting_client_input ?? 0} tone="warn" />
                <Stat label="Blocked" value={counts.blocked ?? 0} tone="bad" />
                <Stat label="Completed" value={counts.completed ?? 0} />
                <Stat label="Cancelled" value={counts.cancelled ?? 0} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="dq2" className="sr-only">Search</label><Input id="dq2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sprint code, description, client..." className="w-64" /></form>
                        <Select aria-label="Client" value={filters.client ?? ''} onChange={(e) => go({ client: e.target.value })} placeholder="All Clients" options={options.clients} className="w-48" />
                        <Select aria-label="Vehicle" value={filters.vehicle ?? ''} onChange={(e) => go({ vehicle: e.target.value })} placeholder="All Vehicles" options={options.vehicles} className="w-40" />
                        <Select aria-label="Disposition" value={filters.disposition ?? ''} onChange={(e) => go({ disposition: e.target.value })} placeholder="All Dispositions" options={DISP.map((d) => ({ value: d, label: d.replace(/_/g, ' ') }))} className="w-44" />
                        <Select aria-label="Owner" value={filters.owner ?? ''} onChange={(e) => go({ owner: e.target.value })} placeholder="All Engagement Owners" options={options.owners} className="w-44" />
                        <Button size="sm" variant="ghost" onClick={() => router.get('/admin/advisory/dispositions')}>Reset</Button>
                    </div>
                    <SimpleTable columns={['Sprint Code', 'Description', 'Vehicle / Engagement', 'Client', 'Type', 'Disposition', 'Status', 'Owner', 'Value', 'Start', 'Target']}
                        rows={rows.data.map((r) => [<span className="font-mono text-xs text-controlled-700">{r.code}</span>, r.description, <span className="text-xs">{r.vehicle_code}<br />{r.vehicle_name}</span>, r.client, r.type,
                            <select aria-label={`Disposition for ${r.code}`} value={r.disposition} onChange={(e) => update(r, { disposition: e.target.value })} className="rounded border border-parchment-500 text-xs">{DISP.map((d) => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}</select>,
                            <StatusPill status={r.status} />, <select aria-label={`Owner for ${r.code}`} value={r.owner} onChange={(e) => update(r, { owner: e.target.value })} className="rounded border border-parchment-500 text-xs">{options.owners.map((o) => <option key={o}>{o}</option>)}</select>, r.value_zar ? zar(r.value_zar) : '–', r.start, r.target ?? 'TBD'])} />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {rows.from ?? 0} to {rows.to ?? 0} of {rows.total} sprints</p><Pager links={rows.links} /></div>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Disposition Summary"><KV rows={DISP.map((d) => [d.replace(/_/g, ' '), counts[d] ?? 0])} /></Card>
                    <Card title="Overall Progress"><Progress value={progress} tone="good" /><p className="mt-1 text-xs text-ink-500">{progress}% of sprints authorised or completed</p></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

Dispositions.layout = null;
