import { router } from '@inertiajs/react';
import { CircleOff, FileText, Pause, Route as RouteIcon, ShoppingCart, CheckCircle2, ClipboardList } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { Card, Donut, FilterBar, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Row {
    id: number; source_code: string; source_name: string; relationship_type: string; legacy_relationship: string; destination_code: string | null; destination_name: string | null;
    destination_vehicle: string | null; destination_act: string | null; disposition: string; owner: string | null; fit_reason: string | null; cta: string; destination_state: string | null; price_state: string;
}
interface Props {
    rows: Row[];
    kpis: { total: number; remediated: number; purchase: number; quote: number; proposal: number; hold: number; broken: number };
    dispositions: Record<string, number>;
    types: Record<string, number>;
    options: { dispositions: string[] };
    filters: Record<string, string>;
}

export default function Routes({ rows, kpis, dispositions, types, options, filters }: Props) {
    return (
        <AdminShell title="Merchandising Route Remediation" description="Manage and remediate legacy merchandising routes (Attach Path / recurring / next-best) for Subscription and Retainer destinations.">
            <KpiGrid>
                <Kpi icon={<RouteIcon className="size-5" />} label="Total Routes to Remediate" value={kpis.total} tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Routes Remediated" value={kpis.remediated} caption={pct(kpis.remediated, kpis.total)} tone="good" />
                <Kpi icon={<ShoppingCart className="size-5" />} label="Active Purchase Routes" value={kpis.purchase} caption={pct(kpis.purchase, kpis.total)} tone="good" />
                <Kpi icon={<FileText className="size-5" />} label="Active Proposal / Quote" value={kpis.proposal + kpis.quote} caption={pct(kpis.proposal + kpis.quote, kpis.total)} tone="info" />
                <Kpi icon={<Pause className="size-5" />} label="Honest Hold" value={kpis.hold} tone="warn" />
                <Kpi icon={<CircleOff className="size-5" />} label="Broken / Suppressed" value={kpis.broken} caption={pct(kpis.broken, kpis.total)} tone="bad" />
            </KpiGrid>

            <FilterBar
                path="/admin/shop/routes"
                filters={filters}
                selects={[
                    { name: 'type', label: 'Relationship Type', options: Object.keys(types) },
                    { name: 'disposition', label: 'Relationship Disposition', options: options.dispositions },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Card title={`Merchandising Route Remediation Register (${kpis.total})`}>
                        <SimpleTable
                            columns={['Source Code', 'Source Name', 'Relationship Type', 'Legacy Relationship (Raw)', 'Resolved Destination', 'Destination Vehicle', 'Destination Act', 'Route Disposition', 'Current CTA', 'Price / Tax State', 'Owner']}
                            rows={rows.map((r) => [
                                <span key="c" className="font-mono text-xs">{r.source_code}</span>,
                                r.source_name,
                                <span key="t" className="capitalize">{r.relationship_type.replace('_', ' ')}</span>,
                                <span key="l" className="text-xs">{r.legacy_relationship}</span>,
                                <span key="d" className="text-xs">{r.destination_code} - {r.destination_name}<span className="block text-ink-400">{r.destination_state}</span></span>,
                                r.destination_vehicle ?? '-',
                                r.destination_act ?? '-',
                                <label key="disp" className="block">
                                    <span className="sr-only">Disposition for {r.source_name}</span>
                                    <select
                                        className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1 text-[0.6875rem] font-semibold"
                                        value={r.disposition}
                                        onChange={(e) => router.post(`/admin/shop/routes/${r.id}/disposition`, { disposition: e.target.value }, { preserveScroll: true })}
                                    >
                                        {options.dispositions.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </label>,
                                r.cta,
                                <StatusPill key="p" status={r.price_state} tone={r.price_state === 'OK' ? 'good' : 'warn'} />,
                                r.owner ?? '-',
                            ])}
                        />
                    </Card>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Route Disposition Summary" segments={Object.entries(dispositions).map(([label, value]) => ({ label, value }))} />
                    <Donut title="Relationship Type Summary" segments={Object.entries(types).map(([label, value]) => ({ label, value }))} />
                    <Card title="Controls & Integrity">
                        <ul className="space-y-1.5 text-xs">
                            {[['Exact Destination Required', 'No vague or inferred destinations'], ['CTA Governed by Disposition', 'Only permitted CTA shown'], ['Vehicle & Act Match', 'Destination vehicle and act validated'], ['Evidence Required', 'Every route change is evidenced']].map(([t, b]) => (
                                <li key={t} className="flex gap-2"><ClipboardList className="size-3.5 shrink-0 text-verified-500" /><span><strong>{t}</strong><span className="block text-ink-500">{b}</span></span></li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
}

Routes.layout = null;
