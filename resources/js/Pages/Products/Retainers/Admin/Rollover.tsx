import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlarmClock, Coins, Gauge, Hourglass, Scale, TriangleAlert } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ActionButton, BarRow } from '@/Components/Products/Shared';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Row {
    id: number;
    code: string;
    client: string;
    type: string;
    period_ended: string;
    units: number;
    unit_type: string;
    cpu: number;
    value: number;
    pct: number;
    risk: 'High' | 'Medium' | 'Low';
    note: string | null;
    expires_on: string;
    days: number;
}

interface PeriodRow {
    id: number;
    code: string;
    client: string;
    ends_on: string;
    blockers: string[];
    meter: Record<string, number>;
}

interface DisputeRow {
    id: number;
    reference: string;
    retainer: string;
    client: string;
    entry: string;
    units: number;
    reason: string;
    outcome: string | null;
    proposed_units: number | null;
    created_at: string;
}

interface Props {
    kpis: { total: number; units: number; clients: number; cpu: number; expiring: number; at_risk: number; pct_revenue: number };
    rows: Row[];
    filters: { risk: string; type: string; q: string };
    byRisk: Record<string, number>;
    byType: Record<string, number>;
    windows: Record<string, number>;
    periods: PeriodRow[];
    disputes: DisputeRow[];
    types: string[];
}

const PATH = '/admin/products/retainers/rollover';
const RISK_TONE = { High: 'bad', Medium: 'warn', Low: 'good' } as const;

function DisputeActions({ d }: { d: DisputeRow }) {
    const [units, setUnits] = useState(String(d.proposed_units ?? 0));
    return (
        <span className="flex flex-wrap items-center gap-1">
            <label className="sr-only" htmlFor={`du-${d.id}`}>
                Corrected units
            </label>
            <input id={`du-${d.id}`} value={units} onChange={(e) => setUnits(e.target.value)} className="h-7 w-14 rounded border border-parchment-500 px-1 text-xs" inputMode="decimal" />
            <button type="button" onClick={() => router.post(`${PATH}/disputes/${d.id}`, { decision: 'upheld', units: Number(units) }, { preserveScroll: true })} className="h-7 rounded border border-verified-500 px-2 text-xs font-semibold text-verified-700">
                Uphold
            </button>
            <button type="button" onClick={() => router.post(`${PATH}/disputes/${d.id}`, { decision: 'rejected' }, { preserveScroll: true })} className="h-7 rounded border border-risk-500/40 px-2 text-xs font-semibold text-risk-700">
                Reject
            </button>
        </span>
    );
}

export default function Rollover({ kpis, rows, filters, byRisk, byType, windows, periods, disputes, types }: Props) {
    const [q, setQ] = useState(filters.q);
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const winMax = Math.max(1, ...Object.values(windows));
    const typeTotal = Object.values(byType).reduce((s, n) => s + n, 0) || 1;
    const top = [...rows].sort((a, b) => b.value - a.value).slice(0, 3);

    return (
        <AdminShell title="Rollover Liability Register" description="Track unused allowances rolled over to the next period and the associated liability.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Coins} label="Total Rollover Liability" value={zar(kpis.total)} caption="At cost value" />
                <StatTile icon={Hourglass} tone="info" label="Total Rolled Over (Units)" value={hrs(kpis.units, 2)} caption={`Across ${kpis.clients} clients`} />
                <StatTile icon={Scale} tone="purple" label="Average Cost per Unit" value={zar(kpis.cpu)} caption="Weighted average" />
                <StatTile icon={AlarmClock} tone="gold" label="Expiring Next Period" value={hrs(kpis.expiring, 2)} caption={`${kpis.units ? ((kpis.expiring / kpis.units) * 100).toFixed(1) : 0}% of total`} />
                <StatTile icon={TriangleAlert} tone="bad" label="At Risk (May Expire)" value={hrs(kpis.at_risk, 2)} caption="High risk, ≤ 31 days" />
                <StatTile icon={Gauge} label="Liability % of Revenue" value={`${kpis.pct_revenue}%`} caption="Of monthly retainer fees" />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Rollover Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ value: '', label: 'All' }, ...types.map((t) => ({ value: t, label: t }))]} />
                <MiniSelect label="Risk Level" value={filters.risk} onChange={(v) => set('risk', v)} options={[{ value: '', label: 'All' }, ...['High', 'Medium', 'Low'].map((r) => ({ value: r, label: r }))]} />
                <form
                    className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500"
                    onSubmit={(e) => {
                        e.preventDefault();
                        set('q', q);
                    }}
                >
                    <label htmlFor="ro-q">Search</label>
                    <input id="ro-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search retainer or client..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem] text-ink-800" />
                </form>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
                <Panel title="Rollover Register">
                    <SimpleTable
                        columns={['#', 'Retainer Code', 'Client', 'Retainer Type', 'Period Ended', 'Rolled Over (Units)', 'Unit Type', 'Cost per Unit (ZAR)', 'Liability Value (ZAR)', 'Rollover %', 'Risk Level', 'Expires', 'Note']}
                        rows={rows.map((r, i) => [
                            i + 1,
                            <span className="font-mono text-xs font-semibold">{r.code}</span>,
                            r.client,
                            r.type,
                            fmtDate(r.period_ended),
                            r.units.toFixed(2),
                            r.unit_type,
                            r.cpu.toLocaleString('en-ZA'),
                            <span className="font-semibold">{r.value.toLocaleString('en-ZA')}</span>,
                            `${r.pct}%`,
                            <StatusPill status={r.risk} tone={RISK_TONE[r.risk]} />,
                            <span className={r.days <= 30 ? 'font-semibold text-risk-700' : ''}>
                                {fmtDate(r.expires_on)}
                                <span className="block text-[0.6875rem]">{r.days < 0 ? 'expired' : `in ${r.days} days`}</span>
                            </span>,
                            r.note ?? '—',
                        ])}
                        empty="No open rollover balances."
                    />
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Liability = rolled-over units × cost per unit. Rollover follows the C4 rule, cap and expiry in each agreement; unused capacity is never silently forfeited.</p>
                </Panel>

                <div className="space-y-5">
                    <Panel title="Liability by Risk Level">
                        <div className="flex flex-col items-center gap-3">
                            <Donut size={140} centre={zar(kpis.total)} sub="Total Liability" segments={[{ value: byRisk.High ?? 0, color: C.red }, { value: byRisk.Medium ?? 0, color: C.amber }, { value: byRisk.Low ?? 0, color: C.green }]} />
                            <Legend items={(['High', 'Medium', 'Low'] as const).map((k) => ({ color: k === 'High' ? C.red : k === 'Medium' ? C.amber : C.green, label: `${k} Risk`, value: zar(byRisk[k] ?? 0) }))} />
                        </div>
                    </Panel>
                    <Panel title="Liability by Expiry Window">
                        <div className="space-y-2">
                            {Object.entries(windows).map(([w, v], i) => (
                                <BarRow key={w} label={w} value={Math.round(v)} max={winMax} tone={i === 0 ? 'bad' : i === 3 ? 'good' : 'gold'} />
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Rollover Type Breakdown">
                        <ul className="space-y-1 text-xs">
                            {Object.entries(byType).map(([t, v]) => (
                                <li key={t} className="flex justify-between">
                                    <span>{t}</span>
                                    <span className="font-semibold">
                                        {zar(v)} ({((v / typeTotal) * 100).toFixed(1)}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Top Clients by Liability">
                        <ol className="list-decimal space-y-1 pl-4 text-xs">
                            {top.map((r) => (
                                <li key={r.id}>
                                    {r.client} — <span className="font-semibold">{zar(r.value)}</span>
                                </li>
                            ))}
                        </ol>
                    </Panel>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Panel title="Period Reconciliation (closing within 31 days)">
                    <SimpleTable
                        columns={['Retainer', 'Client', 'Period Ends', 'Blockers', 'Action']}
                        rows={periods.map((p) => [
                            <span className="font-mono text-xs">{p.code}</span>,
                            p.client,
                            fmtDate(p.ends_on),
                            p.blockers.length ? <span className="text-xs text-risk-700">{p.blockers.join('; ')}</span> : <span className="text-xs text-verified-700">Ready</span>,
                            p.blockers.length ? (
                                <span className="text-xs text-ink-400">Resolve blockers</span>
                            ) : (
                                <ActionButton href={`${PATH}/periods/${p.id}/reconcile`} tone="gold" confirm={`Reconcile and close the period for ${p.code}? Carry-over and expiry will be posted.`}>
                                    Reconcile Period
                                </ActionButton>
                            ),
                        ])}
                        empty="No periods close within the next 31 days."
                    />
                </Panel>
                <Panel title="Usage Disputes Under Review">
                    <SimpleTable
                        columns={['Dispute', 'Retainer', 'Entry', 'Units', 'Reason', 'Decision']}
                        rows={disputes.map((d) => [<span className="font-mono text-xs">{d.reference}</span>, d.retainer, d.entry, d.units, d.reason, <DisputeActions d={d} />])}
                        empty="No usage disputes are awaiting a decision."
                    />
                    <p className="mt-2 text-[0.6875rem] text-ink-500">A disputed line is excluded from confirmed usage and blocks period close until decided.</p>
                </Panel>
            </div>
        </AdminShell>
    );
}

Rollover.layout = null;
