import { useState } from 'react';
import { Ban, CheckCircle2, History, Layers, TriangleAlert } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { BarRow, CheckList } from '@/Components/Products/Shared';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate, zar } from '@/Components/Products/Retainers/ui';
import { router } from '@inertiajs/react';

interface Row {
    id: number;
    code: string;
    name: string;
    client: string;
    type: string;
    unit: string | null;
    floor: number;
    price: number;
    variance: number;
    pct: number;
    level: 'Compliant' | 'At Risk' | 'Below Floor';
    blocked: boolean;
    state: string;
    disposition: string | null;
}

interface Props {
    kpis: { blocked: number; at_risk: number; below: number; compliant: number; total: number };
    rows: Row[];
    filters: { level: string; type: string; unit: string; q: string };
    types: string[];
    units: { unit: string; blocked: number; at_risk: number; total: number }[];
    byType: Record<string, number>;
    services: { name: string; variance: number; pct: number; level: string; certification: string }[];
    activity: { type: string; summary: string; at: string; retainer: string | null }[];
}

const PATH = '/admin/products/retainers/below-floor';
const DISPOSITIONS = [
    { value: 'RE-D1', label: 'RE-D1 Reprice to floor' },
    { value: 'RE-D2', label: 'RE-D2 Redesign capacity' },
    { value: 'RE-D3', label: 'RE-D3 Reclassify vehicle' },
    { value: 'RE-D4', label: 'RE-D4 Retire at period end' },
];

function Remediate({ row }: { row: Row }) {
    const [d, setD] = useState('RE-D1');
    if (row.disposition) return <span className="text-xs text-verified-700">{row.disposition}</span>;
    if (!row.blocked) return <StatusPill status="Active" tone="good" />;
    return (
        <span className="flex items-center gap-1">
            <label className="sr-only" htmlFor={`d-${row.id}`}>
                Disposition for {row.code}
            </label>
            <select id={`d-${row.id}`} value={d} onChange={(e) => setD(e.target.value)} className="h-8 rounded border border-parchment-500 bg-white px-1 text-xs">
                {DISPOSITIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={() => window.confirm(`Apply ${d} to ${row.code}?`) && router.post(`${PATH}/${row.id}/remediate`, { disposition: d }, { preserveScroll: true })}
                className="h-8 rounded border border-referenced-500 bg-referenced-500 px-2 text-xs font-semibold text-white"
            >
                Remediate
            </button>
        </span>
    );
}

export default function BelowFloor({ kpis, rows, filters, types, units, byType, services, activity }: Props) {
    const [q, setQ] = useState(filters.q);
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const maxType = Math.max(1, ...Object.values(byType));

    return (
        <AdminShell title="Below-Floor Block Monitor" description="Monitor and enforce below-floor pricing controls. Retainers priced below the minimum floor are blocked from sale or renewal.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <StatTile icon={Ban} tone="bad" label="Blocked Retainers" value={kpis.blocked} caption="Cannot be sold or renewed" />
                <StatTile icon={TriangleAlert} tone="gold" label="At Risk (Near Floor)" value={kpis.at_risk} caption="Within 5% of floor" />
                <StatTile icon={History} tone="purple" label="Below Floor" value={kpis.below} caption="More than 5% under floor" />
                <StatTile icon={CheckCircle2} tone="good" label="Compliant (At/Above Floor)" value={kpis.compliant} caption="Meets floor requirement" />
                <StatTile icon={Layers} tone="info" label="Total Retainers" value={kpis.total} caption="Across all statuses" />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Risk Level" value={filters.level} onChange={(v) => set('level', v)} options={[{ value: '', label: 'All' }, ...['Below Floor', 'At Risk', 'Compliant'].map((s) => ({ value: s, label: s }))]} />
                <MiniSelect label="Retainer Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ value: '', label: 'All' }, ...types.map((t) => ({ value: t, label: t }))]} />
                <MiniSelect label="Business Unit" value={filters.unit} onChange={(v) => set('unit', v)} options={[{ value: '', label: 'All' }, ...units.map((u) => ({ value: u.unit, label: u.unit }))]} />
                <form
                    className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500"
                    onSubmit={(e) => {
                        e.preventDefault();
                        set('q', q);
                    }}
                >
                    <label htmlFor="bf-q">Search</label>
                    <input id="bf-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search retainers, clients, codes..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem] text-ink-800" />
                </form>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
                <Panel title="Below-Floor Retainers">
                    <SimpleTable
                        columns={['#', 'Retainer Code', 'Retainer Name', 'Client', 'Retainer Type', 'Floor Price (ZAR)', 'Current Price (ZAR)', 'Variance (ZAR)', 'Variance %', 'Risk Level', 'State', 'Actions']}
                        rows={rows.map((r, i) => [
                            i + 1,
                            <span className="font-mono text-xs font-semibold">{r.code}</span>,
                            r.name,
                            r.client,
                            r.type,
                            r.floor.toLocaleString('en-ZA'),
                            r.price.toLocaleString('en-ZA'),
                            <span className={r.variance < 0 ? 'text-risk-700' : 'text-verified-700'}>{`${r.variance > 0 ? '+' : ''}${r.variance.toLocaleString('en-ZA')}`}</span>,
                            `${r.pct > 0 ? '+' : ''}${r.pct}%`,
                            <StatusPill status={r.level} tone={r.level === 'Compliant' ? 'good' : r.level === 'At Risk' ? 'warn' : 'bad'} />,
                            <StatusPill status={r.state} />,
                            <Remediate row={r} />,
                        ])}
                        empty="No retainers match these filters."
                    />
                </Panel>

                <div className="space-y-5">
                    <Panel title="Floor Compliance Overview">
                        <div className="flex flex-col items-center gap-3">
                            <Donut
                                size={140}
                                centre={kpis.total}
                                sub="Total Retainers"
                                segments={[
                                    { value: kpis.below, color: C.red },
                                    { value: kpis.at_risk, color: C.amber },
                                    { value: kpis.compliant, color: C.green },
                                ]}
                            />
                            <Legend items={[{ color: C.red, label: 'Below Floor', value: kpis.below }, { color: C.amber, label: 'At Risk (Near Floor)', value: kpis.at_risk }, { color: C.green, label: 'Compliant', value: kpis.compliant }]} />
                        </div>
                    </Panel>
                    <Panel title="Top Below-Floor Retainer Types">
                        <div className="space-y-2">
                            {Object.entries(byType).map(([t, n]) => (
                                <BarRow key={t} label={t} value={n} max={maxType} tone="bad" />
                            ))}
                            {Object.keys(byType).length === 0 && <p className="text-xs text-ink-500">No blocked retainers.</p>}
                        </div>
                    </Panel>
                    <Panel title="Floor Compliance Rules">
                        <CheckList items={['No new retainer can be sold below the approved floor price.', 'Renewals below floor are blocked.', 'Existing below-floor retainers are flagged for review.', 'Account Owners must propose a price adjustment.']} />
                    </Panel>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <Panel title="Floor Breach by Business Unit">
                    <SimpleTable columns={['Business Unit', 'Below Floor', 'At Risk', 'Total']} rows={units.map((u) => [u.unit ?? '—', u.blocked, u.at_risk, u.total])} />
                </Panel>
                <Panel title="Catalogue Services Below Floor">
                    <SimpleTable columns={['Service', 'Variance', 'Level']} rows={services.map((s) => [s.name, `${s.pct}%`, <StatusPill status={s.level} tone="bad" />])} empty="All catalogue services meet their floor." />
                </Panel>
                <Panel title="Recent Floor Breach Activity">
                    <ul className="space-y-2 text-xs">
                        {activity.map((a, i) => (
                            <li key={i}>
                                <span className="text-ink-400">{fmtDate(a.at)}</span> <span className="font-semibold">{a.retainer}</span> {a.summary}
                            </li>
                        ))}
                        {activity.length === 0 && <li className="text-ink-500">No floor events recorded yet.</li>}
                    </ul>
                </Panel>
            </div>
        </AdminShell>
    );
}

BelowFloor.layout = null;
