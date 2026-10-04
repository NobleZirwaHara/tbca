import { Box, CheckCircle2, FileText, Gauge, TriangleAlert, UserX, Calendar } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, FilterBar, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { Progress, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Row {
    id: number; code: string; name: string; allowance: number; unit: string; period: string; scope: string | null; owner_model: string | null; owner: string | null;
    elements: Record<string, boolean>; reserved: number; utilised: number; under_use_months: number; review_state: string | null; complete: boolean; utilisation: number | null; under_use: boolean; product: string | null;
}
interface Props {
    rows: Row[];
    kpis: { total: number; complete: number; incomplete: number; reserved: number; utilised: number; under_use: number; contracts: number };
    elements: { key: string; label: string; complete: number; missing: number }[];
    rightSizing: { queue: number; review: number; proposals: number; adjusted: number };
    filters: Record<string, string>;
}

const REVIEW_LABEL: Record<string, string> = { '': 'Start under-use review', under_review: 'Propose right-sizing', right_sizing_proposed: 'Apply adjustment' };

export default function Retainers({ rows, kpis, elements, rightSizing, filters }: Props) {
    const utilisation = kpis.reserved > 0 ? (100 * kpis.utilised) / kpis.reserved : 0;
    return (
        <AdminShell title="Retainer Capacity and C1-C5 Console" description="Oversee retainer products, C1-C5 compliance, reserved capacity, utilisation and right-sizing.">
            <KpiGrid>
                <Kpi icon={<Box className="size-5" />} label="Total Retainer Products" value={kpis.total} tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="C1-C5 Complete (Compliant)" value={kpis.complete} caption={pct(kpis.complete, kpis.total)} tone="good" />
                <Kpi icon={<TriangleAlert className="size-5" />} label="Missing C1-C5 (Incomplete)" value={kpis.incomplete} caption={pct(kpis.incomplete, kpis.total)} tone="warn" />
                <Kpi icon={<FileText className="size-5" />} label="Active Retainer Contracts" value={kpis.contracts} tone="info" />
                <Kpi icon={<Calendar className="size-5" />} label="Total Reserved Capacity" value={kpis.reserved.toFixed(2)} caption={`Utilised ${kpis.utilised.toFixed(2)} (${utilisation.toFixed(2)}%)`} />
                <Kpi icon={<UserX className="size-5" />} label="Under-Use Clients (6m Rule)" value={kpis.under_use} caption={pct(kpis.under_use, kpis.total)} tone="bad" />
            </KpiGrid>

            <FilterBar
                path="/admin/shop/retainers"
                filters={filters}
                search={false}
                selects={[
                    { name: 'status', label: 'C1-C5 Status', options: [{ value: 'complete', label: 'Complete' }, { value: 'incomplete', label: 'Incomplete' }] },
                    { name: 'owner', label: 'Owner Model (C3)', options: ['NAMED_PERSON', 'DEFINED_ROLE', 'TEAM'] },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <Card title={`Retainer Products Overview (${kpis.total})`}>
                        <SimpleTable
                            columns={['Sprint Code', 'Retainer Name', 'C1 Allowance', 'Unit', 'Period', 'C2 Scope', 'C3 Owner Model', 'C3 Named Advisor / Team', 'C1-C5 Elements', 'C1-C5 Status', 'Reserved', 'Utilised', 'Utilisation %', 'Under-Use', 'Right-Sizing']}
                            rows={rows.map((r) => [
                                <span key="c" className="font-mono text-xs">{r.code}</span>, r.name, r.allowance.toFixed(2), r.unit, r.period, r.scope ?? '-', r.owner_model ?? '-', r.owner ?? '-',
                                <div key="el" className="flex gap-1">
                                    {['c1', 'c2', 'c3', 'c4', 'c5'].map((k) => (
                                        <ActionButton key={k} href={`/admin/shop/retainers/${r.id}/element`} data={{ key: k }} tone={r.elements[k] ? 'good' : 'bad'}>
                                            <span className={cn(!r.elements[k] && 'line-through')}>{k.toUpperCase()}</span>
                                        </ActionButton>
                                    ))}
                                </div>,
                                <StatusPill key="s" status={r.complete ? 'complete' : 'incomplete'} tone={r.complete ? 'good' : 'bad'} />,
                                r.reserved.toFixed(2), r.utilised.toFixed(2), r.utilisation === null ? 'N/A' : `${r.utilisation.toFixed(2)}%`,
                                r.under_use ? <span key="u" className="font-semibold text-attested-700">Yes ({r.under_use_months}m)</span> : 'No',
                                r.review_state === 'adjusted' ? (
                                    <StatusPill key="rv" status="adjusted" tone="good" />
                                ) : r.under_use || r.review_state ? (
                                    <ActionButton key="rv" href={`/admin/shop/retainers/${r.id}/review`} tone="neutral">{REVIEW_LABEL[r.review_state ?? '']}</ActionButton>
                                ) : (
                                    '—'
                                ),
                            ])}
                        />
                    </Card>
                    <Card title="C1-C5 Completion Summary">
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                            {elements.map((e) => (
                                <div key={e.key} className="rounded-[6px] border border-parchment-400 p-3 text-xs">
                                    <p className="font-bold text-ink-900">{e.key}</p>
                                    <p className="text-ink-500">{e.label}</p>
                                    <p className="mt-2 text-verified-700">Complete {e.complete} ({pct(e.complete, e.complete + e.missing)})</p>
                                    <p className="text-risk-700">Missing {e.missing} ({pct(e.missing, e.complete + e.missing)})</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="C1-C5 Compliance Health" segments={[{ label: 'Complete (C1-C5)', value: kpis.complete }, { label: 'Incomplete (Missing C1-C5)', value: kpis.incomplete, color: '#d6a32e' }]} />
                    <Card title="Capacity Utilisation Summary">
                        <p className="flex items-center gap-2 text-2xl font-bold text-controlled-700"><Gauge className="size-6" /> {utilisation.toFixed(2)}%</p>
                        <Progress value={utilisation} className="mt-2" />
                        <dl className="mt-2 space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Total Reserved</dt><dd>{kpis.reserved.toFixed(2)}</dd></div>
                            <div className="flex justify-between"><dt>Total Utilised (This Period)</dt><dd>{kpis.utilised.toFixed(2)}</dd></div>
                            <div className="flex justify-between"><dt>Remaining Capacity</dt><dd>{(kpis.reserved - kpis.utilised).toFixed(2)}</dd></div>
                        </dl>
                    </Card>
                    <Card title="Right-Sizing Actions">
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><dt>Under-Use Review Queue</dt><dd className="font-semibold">{rightSizing.queue}</dd></div>
                            <div className="flex justify-between"><dt>Under Review</dt><dd className="font-semibold">{rightSizing.review}</dd></div>
                            <div className="flex justify-between"><dt>Right-Sizing Proposals</dt><dd className="font-semibold">{rightSizing.proposals}</dd></div>
                            <div className="flex justify-between"><dt>Approved Adjustments</dt><dd className="font-semibold">{rightSizing.adjusted}</dd></div>
                        </dl>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Under-use alert: persistent under-use for ≥ 6 consecutive months.</p>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
}

Retainers.layout = null;
