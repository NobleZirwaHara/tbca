import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, Donut, KV, Stat, zar } from '@/Components/Advisory/ui';

interface Row { code: string; engagement: string; sprint: string; type: string; client: string; current: number; floor: number; variance: number; pct: number; priority: string; status: string; action: string; due: string | null; owner: string | null }
interface Props { rows: Row[]; filters: Record<string, string>; kpis: Record<string, number>; priority: Record<string, number>; types: string[] }

const ACTIONS = ['Increase Price', 'Top-up Invoice', 'Add Sprints', 'Re-scope', 'Adjust Retainer', 'Minor Adjust', 'Adjust Scope'];

export default function BelowFloor({ rows, filters, kpis, priority, types }: Props) {
    const [actions, setActions] = useState<Record<string, string>>({});
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/below-floor', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const post = (r: Row, complete: boolean) => router.post(`/admin/advisory/below-floor/${r.code}`, { action: actions[r.code] ?? r.action, complete }, { preserveScroll: true });
    const margin = kpis.floor ? Math.round((kpis.current / kpis.floor) * 100) : 0;
    return (
        <AdminShell title="Below-Floor Remediation Workbench" description="Identify engagements priced below floor, calculate remediation options, and track actions to protect TBCA's commercial floor." actions={<Button size="sm" variant="outline" onClick={() => router.post('/admin/advisory/spine/run', {}, { preserveScroll: true })}>Run Floor Compliance Check</Button>}>
            <Head title="Below-Floor Remediation" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Below-Floor Engagements" value={kpis.count} sub="Across all vehicles" tone="bad" />
                <Stat label="Total Below-Floor Value" value={zar(kpis.value)} sub="Revenue at risk" />
                <Stat label="Average Margin Impact" value={`${kpis.impact}%`} sub="Below target floor" tone="bad" />
                <Stat label="Require Action" value={kpis.action} sub="High or medium priority" tone="warn" />
                <Stat label="Remediated" value={kpis.remediated} sub="Completed actions" tone="good" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <Select aria-label="Type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} placeholder="All Engagement Types" options={types} className="w-48" />
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['open', 'in_progress', 'remediated']} className="w-40" />
                        <Select aria-label="Priority" value={filters.priority ?? ''} onChange={(e) => go({ priority: e.target.value })} placeholder="All Priorities" options={['high', 'medium', 'low']} className="w-36" />
                        <Button size="sm" variant="ghost" onClick={() => router.get('/admin/advisory/below-floor')}>Reset</Button>
                    </div>
                    <SimpleTable columns={['Engagement', 'Vehicle / Sprint', 'Type', 'Client', 'Current', 'Floor', 'Variance', 'Var %', 'Priority', 'Status', 'Remediation Action', 'Target', 'Owner', '']}
                        rows={rows.map((r) => [<span className="font-mono text-xs text-controlled-700">{r.engagement}</span>, r.sprint, r.type, r.client, zar(r.current), zar(r.floor), <span className="text-risk-700">{zar(r.variance)}</span>, <span className="text-risk-700">{r.pct}%</span>, <StatusPill status={r.priority} />, <StatusPill status={r.status} />,
                            r.status === 'remediated' ? r.action : <select aria-label={`Action for ${r.engagement}`} value={actions[r.code] ?? r.action} onChange={(e) => setActions({ ...actions, [r.code]: e.target.value })} className="rounded border border-parchment-500 text-xs">{ACTIONS.map((a) => <option key={a}>{a}</option>)}</select>,
                            r.due ?? '—', r.owner, r.status === 'remediated' ? '' : <span className="flex gap-1"><Button size="sm" variant="outline" onClick={() => post(r, false)}>Plan</Button><Button size="sm" onClick={() => post(r, true)}>Remediate</Button></span>])} />
                    <p className="mt-2 text-xs text-ink-500">Variance = current − floor. Priority: High ≤ −40%, Medium ≤ −10%, Low otherwise. Floor validity is a saleability gate.</p>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Commercial Floor Summary"><KV rows={[['Total Floor Value', zar(kpis.floor)], ['Current Value', zar(kpis.current)], ['Variance', <span className="text-risk-700">{zar(kpis.current - kpis.floor)}</span>], ['Margin Protection', `${kpis.impact}%`], ['Target Margin', '30%'], ['Current value vs floor', `${margin}%`]]} /></Card>
                    <Card title="Priority Breakdown"><div className="flex items-center gap-3"><Donut size={96} slices={[{ value: priority.high, color: '#c53030' }, { value: priority.medium, color: '#d6a32e' }, { value: priority.low, color: '#2f855a' }]} center={kpis.count} sub="Total" /><KV rows={[['High', priority.high], ['Medium', priority.medium], ['Low', priority.low]]} /></div></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

BelowFloor.layout = null;
