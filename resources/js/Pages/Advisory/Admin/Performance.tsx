import { Head, router } from '@inertiajs/react';
import { Select } from '@/Components/ui/Form';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, CHART, Donut, KV, Stat, zar } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Row { code: string; name: string; type: string; engagement: string; revenue: number; cost: number; margin: number; util: number; status: string; lifecycle: string; owner: string }
interface Props { rows: Row[]; filters: Record<string, string>; kpis: Record<string, number>; marginDist: Record<string, number>; utilDist: Record<string, number>; lifecycle: Record<string, number> }

function Dist({ title, data, note }: { title: string; data: Record<string, number>; note: string }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    return (
        <Card title={title}>
            <div className="flex items-center gap-3"><Donut size={100} slices={Object.values(data).map((v, i) => ({ value: v, color: CHART[i % CHART.length] }))} center={total} sub="Vehicles" /><ul className="space-y-1 text-xs">{Object.entries(data).map(([k, v], i) => <li key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: CHART[i % CHART.length] }} />{k}: {v}</li>)}</ul></div>
            <p className="mt-2 text-[0.6875rem] text-ink-500">{note}</p>
        </Card>
    );
}

export default function Performance({ rows, filters, kpis, marginDist, utilDist, lifecycle }: Props) {
    const go = (patch: Record<string, string>) => router.get('/admin/advisory/vehicle-performance', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const maxL = Math.max(1, ...Object.values(lifecycle));
    return (
        <AdminShell title="Vehicle Performance and Rationalisation Console" description="Monitor vehicle usage, financial performance, margin health and identify vehicles to optimise, consolidate, or retire.">
            <Head title="Vehicle Performance" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Analysed Vehicles" value={kpis.total} />
                <Stat label="Active Vehicles (register)" value={kpis.active} tone="good" />
                <Stat label="Avg Margin %" value={`${kpis.margin}%`} sub="Target: ≥ 30%" tone={kpis.margin >= 30 ? 'good' : 'warn'} />
                <Stat label="Below-Floor Vehicles" value={kpis.below} tone="bad" />
                <Stat label="Underutilised (<25%)" value={kpis.under} tone="warn" />
                <Stat label="Retirement Candidates" value={kpis.retire} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Dist title="Margin Performance Distribution" data={marginDist} note="Margin % = (Revenue − Direct Cost) / Revenue" />
                        <Dist title="Utilisation Score Distribution" data={utilDist} note="Utilisation based on sprint consumption vs capacity" />
                        <Card title="Vehicle Lifecycle Overview"><ul className="space-y-2 text-xs">{Object.entries(lifecycle).map(([k, v]) => <li key={k}><div className="flex justify-between"><span>{k}</span><b>{v}</b></div><div className="h-2 rounded bg-parchment-200"><div className="h-2 rounded bg-gold-500" style={{ width: `${(v / maxL) * 100}%` }} /></div></li>)}</ul></Card>
                    </div>
                    <Card title="Vehicle Performance Snapshot">
                        <div className="mb-3 flex gap-2"><Select aria-label="Type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} placeholder="All Vehicle Types" options={['Mandate', 'Sprint', 'Subscription', 'Product', 'Retainer']} className="w-44" /><Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All Statuses" options={['Healthy', 'At Risk', 'Below Floor']} className="w-40" /></div>
                        <SimpleTable columns={['Vehicle Code', 'Vehicle / Sprint Name', 'Type', 'Engagement Type', 'Revenue', 'Direct Cost', 'Margin %', 'Utilisation', 'Status', 'Lifecycle Recommendation', 'Owner']}
                            rows={rows.map((r) => [<span className="font-mono text-xs text-controlled-700">{r.code}</span>, r.name, r.type, r.engagement, zar(r.revenue), zar(r.cost), <span className={cn('font-semibold', r.margin < 0 ? 'text-risk-700' : r.margin < 30 ? 'text-attested-700' : 'text-verified-700')}>{r.margin}%</span>, `${r.util}%`, <StatusPill status={r.status} tone={r.status === 'Healthy' ? 'good' : r.status === 'At Risk' ? 'warn' : 'bad'} />, <span className="rounded bg-parchment-200 px-1.5 text-xs">{r.lifecycle}</span>, r.owner])} />
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Financial Summary (Period)"><KV rows={[['Total Revenue', zar(kpis.revenue)], ['Total Direct Costs', zar(kpis.cost)], ['Gross Profit', zar(kpis.profit)], ['Avg. Margin %', `${kpis.margin}%`], ['Below-Floor Loss', <span className="text-risk-700">{zar(kpis.loss)}</span>]]} /></Card>
                    <Card title="Top Underperforming Vehicles"><ul className="space-y-1 text-xs">{rows.slice(0, 5).map((r) => <li key={r.code} className="flex justify-between gap-2"><span>{r.name}</span><span className="text-risk-700">{r.margin}%</span></li>)}</ul></Card>
                    <Card title="Rationalisation rules"><ul className="space-y-1 text-[0.6875rem] text-ink-600"><li>Margin &lt; 0 and utilisation &lt; 20% → Retire / Sunset</li><li>Margin &lt; 0 and utilisation &lt; 25% → Consolidate / Merge</li><li>Margin &lt; 10% → Optimise / Improve</li><li>Margin ≥ 40% and utilisation ≥ 80% → Growth / Scale</li><li>Otherwise → Maintain / Monitor</li></ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

Performance.layout = null;
