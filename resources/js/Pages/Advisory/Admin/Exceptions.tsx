import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import { AdminShell, Pager } from '@/Components/Advisory/shells';
import { CHART, Card, Donut, Stat } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { Paginated } from '@/types/advisory';

interface Ex { id: number; code: string; area: string; type: string; subject: string; priority: string; status: string; raised: string; raised_by: string; assigned_to: string; sla: string; breached: boolean; today: boolean }
interface Props { rows: Paginated<Ex>; filters: Record<string, string>; kpis: Record<string, number>; breakdown: Record<string, number>; options: { areas: string[]; types: string[]; assignees: string[] } }

export default function Exceptions({ rows, filters, kpis, breakdown, options }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/tech/exceptions', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const act = (x: Ex, action: string) => router.post(`/admin/advisory/tech/exceptions/${x.id}`, { action }, { preserveScroll: true });
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return (
        <AdminShell title="Admin Review / Exception Queue" description="Monitor, triage and resolve exceptions, escalations and items requiring review.">
            <Head title="Review & Exception Queue" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
                <Stat label="Total Exceptions" value={kpis.total} sub="Open, all areas" />
                <Stat label="High Priority" value={kpis.high} tone="bad" />
                <Stat label="Medium Priority" value={kpis.medium} tone="warn" />
                <Stat label="Low Priority" value={kpis.low} />
                <Stat label="Awaiting My Review" value={kpis.mine} />
                <Stat label="SLA Breaches" value={kpis.sla} tone="bad" />
                <Stat label="Resolved Today" value={kpis.resolved} tone="good" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <aside className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-2">
                    <p className="text-sm font-semibold">Queue Filters</p>
                    <Select aria-label="Area" value={filters.area ?? ''} onChange={(e) => go({ area: e.target.value })} placeholder="All Areas" options={options.areas} />
                    <Select aria-label="Type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} placeholder="All Types" options={options.types} />
                    <Select aria-label="Priority" value={filters.priority ?? ''} onChange={(e) => go({ priority: e.target.value })} placeholder="All Priorities" options={['High', 'Medium', 'Low']} />
                    <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['new', 'in_review', 'pending_info', 'escalated', 'resolved']} />
                    <Select aria-label="Assigned" value={filters.assigned ?? ''} onChange={(e) => go({ assigned: e.target.value })} placeholder="All Reviewers" options={options.assignees} />
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => router.get('/admin/advisory/tech/exceptions')}>Clear All</Button>
                </aside>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-7">
                    <Tabs tabs={[{ key: 'queue', label: 'Exception Queue' }, { key: 'mine', label: 'My Reviews', count: kpis.mine }, { key: 'escalations', label: 'Escalations', count: kpis.escalated }, { key: 'sla', label: 'SLA Breaches', count: kpis.sla }, { key: 'resolved', label: 'Resolved' }]} value={filters.tab ?? 'queue'} onChange={(t) => go({ tab: t })} />
                    <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }} className="my-3"><label htmlFor="xq" className="sr-only">Search</label><Input id="xq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exceptions..." className="w-64" /></form>
                    <SimpleTable columns={['Exception ID', 'Area', 'Type', 'Subject / Item', 'Priority', 'Status', 'Raised', 'Assigned To', 'SLA Due', 'Actions']}
                        rows={rows.data.map((x) => [<span className="font-mono text-xs text-controlled-700">{x.code}</span>, x.area, x.type, x.subject, <StatusPill status={x.priority} />, <StatusPill status={x.status} />, <span className="text-xs">{x.raised}<br />{x.raised_by}</span>, x.assigned_to, <span className={cn('text-xs font-semibold', x.breached ? 'text-risk-700' : x.today ? 'text-attested-700' : 'text-verified-700')}>{x.sla}</span>,
                            x.status === 'resolved' ? '—' : <span className="flex flex-wrap gap-1"><Button size="sm" variant="ghost" onClick={() => act(x, 'assign_me')}>Assign me</Button><Button size="sm" variant="ghost" onClick={() => act(x, 'pending_info')}>Request info</Button><Button size="sm" variant="ghost" onClick={() => act(x, 'escalate')}>Escalate</Button><Button size="sm" variant="outline" onClick={() => act(x, 'resolve')}>Resolve</Button></span>])} empty="No exceptions in this view." />
                    <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {rows.from ?? 0} to {rows.to ?? 0} of {rows.total} exceptions</p><Pager links={rows.links} /></div>
                </section>
                <aside className="xl:col-span-3">
                    <Card title="Exception Breakdown"><div className="flex items-center gap-3"><Donut size={100} slices={Object.values(breakdown).map((v, i) => ({ value: v, color: CHART[i % CHART.length] }))} center={total} sub="Open" /><ul className="space-y-1 text-xs">{Object.entries(breakdown).map(([k, v], i) => <li key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: CHART[i % CHART.length] }} />{k}: {v} ({total ? Math.round((v / total) * 100) : 0}%)</li>)}</ul></div></Card>
                    <Card title="Automatic triggers" className="mt-4"><ul className="space-y-1 text-[0.6875rem] text-ink-600"><li>Fee rule below floor or pass-through markup → Fee Rule Violation</li><li>Discount &gt; 10% → Discount Approval</li><li>Supplier cost above rate card → Rate Card Mismatch</li><li>Client blocker escalation from the portal</li></ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

Exceptions.layout = null;
