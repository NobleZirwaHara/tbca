import { Link } from '@inertiajs/react';
import { Ban, CheckCircle2, Clock, Download, Database, Info, Play, Settings, TriangleAlert, Truck } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, FilterBar, fmtDate, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import type { Option } from '@/types/shop';

interface Row { slug: string; code: string; name: string; vehicle: string; act: string; state: string | null; state_label: string; outcome: string | null; reasons: string[]; evaluated: string | null }
interface Props {
    rows: Row[];
    kpis: { total: number; passed: number; blocked: number; warning: number; vehicles: number; last_scan: string | null };
    reasons: { reason: string; count: number }[];
    filters: Record<string, string>;
    options: { vehicles: string[]; acts: Option[]; states: Option[] };
}

export default function ListingGate({ rows, kpis, reasons, filters, options }: Props) {
    return (
        <AdminShell
            title="Vehicle-Aware Listing Gate Console"
            description="Prevent unresolvable, non-compliant or incomplete products from reaching clients."
            actions={
                <>
                    <a href="/admin/shop/listing-state" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Download className="size-4" /> Export Report</a>
                    <Link href="/admin/shop/listing-state" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Settings className="size-4" /> Gate Rules</Link>
                    <ActionButton href="/admin/shop/listing-gate/scan" tone="primary"><Play className="size-4" /> Run Full Gate Scan</ActionButton>
                </>
            }
        >
            <KpiGrid>
                <Kpi icon={<Database className="size-5" />} label="Total Source Records" value={kpis.total} caption="100% of Catalogue" tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Passed Gate (All Vehicles)" value={kpis.passed} caption={pct(kpis.passed, kpis.total)} tone="good" />
                <Kpi icon={<Ban className="size-5" />} label="Blocked by Gate" value={kpis.blocked} caption={pct(kpis.blocked, kpis.total)} tone="bad" />
                <Kpi icon={<TriangleAlert className="size-5" />} label="Warnings (Review)" value={kpis.warning} caption={pct(kpis.warning, kpis.total)} tone="warn" />
                <Kpi icon={<Truck className="size-5" />} label="Vehicles Configured" value={kpis.vehicles} caption="All active" />
                <Kpi icon={<Clock className="size-5" />} label="Last Full Scan" value={<span className="text-sm">{fmtDate(kpis.last_scan, true)}</span>} caption="SAST (UTC+2)" />
            </KpiGrid>

            <FilterBar
                path="/admin/shop/listing-gate"
                filters={filters}
                selects={[
                    { name: 'vehicle', label: 'Vehicle', options: options.vehicles },
                    { name: 'act', label: 'Commercial Act', options: options.acts },
                    { name: 'ls', label: 'Listing State', options: options.states },
                    { name: 'outcome', label: 'Gate Outcome', options: [{ value: 'passed', label: 'Passed' }, { value: 'warning', label: 'Warning' }, { value: 'blocked', label: 'Blocked' }] },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <SimpleTable
                        columns={['Sprint Code', 'Sprint Name', 'Vehicle', 'Commercial Act', 'Listing State', 'Gate Outcome', 'Blocking Reasons / Warnings', 'Last Evaluated', '']}
                        rows={rows.map((r) => [
                            <span key="c" className="font-mono text-xs">{r.code}</span>,
                            <Link key="n" href={`/admin/shop/product-master?product=${r.slug}`} className="font-medium hover:text-gold-700">{r.name}</Link>,
                            r.vehicle,
                            r.act,
                            <StatusPill key="s" status={r.state_label} tone={r.state === 'LS-05' || r.state === 'LS-06' ? 'bad' : r.state === 'LS-01' || r.state === 'LS-03' ? 'good' : 'info'} />,
                            <StatusPill key="o" status={r.outcome ?? 'not evaluated'} tone={r.outcome === 'passed' ? 'good' : r.outcome === 'warning' ? 'warn' : 'bad'} />,
                            r.reasons.length ? <span key="r" className="text-xs">{r.reasons.join('; ')}</span> : '—',
                            <span key="e" className="text-xs">{fmtDate(r.evaluated, true)}</span>,
                            <ActionButton key="a" href={`/admin/shop/listing-gate/${r.slug}/evaluate`}>Re-evaluate</ActionButton>,
                        ])}
                    />
                    <p className="text-xs text-ink-500">Showing {rows.length} of {kpis.total} records</p>
                    <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700">
                        <Info className="size-5 shrink-0 text-controlled-700" />
                        <p>The Vehicle-Aware Listing Gate ensures that ONLY complete, compliant and commercially resolvable Sprints are shown to clients.<br /><strong>Principle: SOURCE RECORD EXISTS + VEHICLE RESOLVED + ACT RESOLVED + LS MODE RESOLVED</strong></p>
                    </div>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Gate Health Overview" segments={[{ label: 'Passed', value: kpis.passed }, { label: 'Blocked', value: kpis.blocked, color: '#b5372a' }, { label: 'Warnings', value: kpis.warning, color: '#d6a32e' }]} />
                    <Card title="Top Blocking Reasons">
                        <ul className="space-y-1.5 text-xs">
                            {reasons.length === 0 && <li className="text-ink-400">No blocking reasons.</li>}
                            {reasons.map((r) => <li key={r.reason} className="flex justify-between gap-2"><span>{r.reason}</span><span className="font-semibold">{r.count}</span></li>)}
                        </ul>
                    </Card>
                    <Card title="Quick Tools">
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/admin/shop/listing-state" className="font-semibold text-verified-700">Gate Rules Manager</Link><span className="block text-ink-500">Configure vehicle & act rules</span></li>
                            <li><Link href="/admin/shop/product-master" className="font-semibold text-verified-700">Attribute Completeness Report</Link><span className="block text-ink-500">See missing data by vehicle</span></li>
                            <li><Link href="/admin/shop/pricing?compliance=below_floor" className="font-semibold text-verified-700">Below Floor Report</Link><span className="block text-ink-500">View economic breaches</span></li>
                            <li><Link href="/admin/shop/duplication" className="font-semibold text-verified-700">Batch4C State Review</Link><span className="block text-ink-500">Check legacy contamination</span></li>
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
}

ListingGate.layout = null;
