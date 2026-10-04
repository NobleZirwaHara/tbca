import { Link } from '@inertiajs/react';
import { Database, Equal, Lock, RefreshCw, ShoppingCart, TriangleAlert, Workflow } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, BarList, Card, Donut, FilterBar, fmtDate, GateIcon, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import type { Option } from '@/types/shop';

interface Row { slug: string; code: string; name: string; vehicle: string; act: string; lifecycle: string | null; ca: string; ca_key: string; gates: Record<string, string>; derived: string; equal: boolean; reason: string | null }
interface Props {
    rows: Row[];
    kpis: { total: number; derived: number; equal: number; exceptions: number; hard: number; purchasable: number };
    distribution: { state: string; label: string; count: number }[];
    gates: { gate: string; pct: number }[];
    failures: { gate: string; count: number }[];
    summary: { engine: string; ruleset: string; last_run: string | null };
    events: { summary: string; created_at: string }[];
    filters: Record<string, string>;
    options: { acts: Option[]; states: Option[] };
}

const GATE_KEYS = ['completeness', 'price_floor', 'version', 'tax', 'licence', 'release'];

export default function ListingState({ rows, kpis, distribution, gates, failures, summary, events, filters, options }: Props) {
    return (
        <AdminShell
            title="Listing-State Derivation Console"
            badge="Governance"
            description="Prove that every product's Listing State (LS) is correctly derived from Commercial Availability (CA) using the CA → LS engine. LS = f(CA, critical governance gates)."
            actions={
                <>
                    <Link href="/admin/shop/listing-gate" className="inline-flex h-9 items-center rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold">View Derivation Rules</Link>
                    <ActionButton href="/admin/shop/listing-state/recalculate" tone="primary"><RefreshCw className="size-4" /> Recalculate LS</ActionButton>
                </>
            }
        >
            <KpiGrid>
                <Kpi icon={<Database className="size-5" />} label="Total Source Products" value={kpis.total} caption="100% of Catalogue" tone="info" />
                <Kpi icon={<Workflow className="size-5" />} label="LS Derived (Engine)" value={kpis.derived} caption={pct(kpis.derived, kpis.total)} tone="good" />
                <Kpi icon={<Equal className="size-5" />} label="LS = CA (All)" value={kpis.equal} tone="info" />
                <Kpi icon={<TriangleAlert className="size-5" />} label="LS ≠ CA (Exceptions)" value={kpis.exceptions} caption={pct(kpis.exceptions, kpis.total)} tone={kpis.exceptions ? 'bad' : 'warn'} />
                <Kpi icon={<Lock className="size-5" />} label="Hard Block (Not Purchasable)" value={kpis.hard} caption={pct(kpis.hard, kpis.total)} tone="bad" />
                <Kpi icon={<ShoppingCart className="size-5" />} label="Purchasable (All Acts)" value={kpis.purchasable} caption={pct(kpis.purchasable, kpis.total)} tone="good" />
            </KpiGrid>

            <FilterBar path="/admin/shop/listing-state" filters={filters} selects={[{ name: 'act', label: 'Commercial Act', options: options.acts }, { name: 'ls', label: 'Listing State', options: options.states }]} />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Card title={`Listing-State Derivation Register (${kpis.total})`} action={<span className="text-xs text-ink-500">Showing derivation for: {fmtDate(summary.last_run, true)}</span>}>
                        <SimpleTable
                            columns={['Sprint Code', 'Product', 'Vehicle', 'Commercial Act', 'Lifecycle (LS)', 'CA', 'Compl.', 'Price', 'Version', 'Tax', 'Licence', 'Release', 'Derived LS', 'LS = CA?', 'Reason']}
                            rows={rows.map((r) => [
                                <span key="c" className="font-mono text-xs">{r.code}</span>,
                                r.name, r.vehicle, r.act, r.lifecycle ?? '-',
                                <StatusPill key="ca" status={r.ca} tone={r.ca_key.startsWith('available') ? 'good' : r.ca_key === 'not_allowed' || r.ca_key === 'unavailable' ? 'bad' : 'warn'} />,
                                ...GATE_KEYS.map((k) => <GateIcon key={k} state={r.gates[k]} />),
                                <span key="d" className="font-semibold">{r.derived}</span>,
                                r.equal ? <span key="e" className="font-bold text-verified-700">=</span> : <span key="e" className="font-bold text-risk-700">≠ stale</span>,
                                <span key="r" className="text-xs">{r.reason ?? '—'}</span>,
                            ])}
                        />
                    </Card>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="LS vs CA Integrity" segments={[{ label: 'LS = CA', value: kpis.equal }, { label: 'LS ≠ CA', value: kpis.exceptions, color: '#b5372a' }]} />
                    <Card title="Listing-State Distribution"><BarList rows={distribution.map((d) => ({ label: `${d.state} ${d.label}`, value: d.count }))} /></Card>
                    <Card title="Gate Failure Snapshot (Hard Blocks)">
                        <ul className="space-y-1.5 text-xs">
                            {failures.length === 0 && <li className="text-ink-400">No gate failures.</li>}
                            {failures.map((f) => <li key={f.gate} className="flex justify-between gap-2"><span>{f.gate}</span><span className="font-semibold">{f.count}</span></li>)}
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card title="Derivation Summary">
                    <dl className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><dt>LS = f(CA, Gates) Engine Version</dt><dd className="font-semibold">{summary.engine}</dd></div>
                        <div className="flex justify-between"><dt>Derivation Last Run</dt><dd className="font-semibold">{fmtDate(summary.last_run, true)}</dd></div>
                        <div className="flex justify-between"><dt>Ruleset Version</dt><dd className="font-semibold">{summary.ruleset}</dd></div>
                        <div className="flex justify-between"><dt>Products Evaluated</dt><dd className="font-semibold">{kpis.total}</dd></div>
                        <div className="flex justify-between"><dt>Exceptions (LS ≠ CA)</dt><dd className="font-semibold">{kpis.exceptions}</dd></div>
                    </dl>
                </Card>
                <Card title="Critical Gates (All Must Pass for Purchasable States)">
                    <dl className="space-y-1.5 text-xs">{gates.map((g) => <div key={g.gate} className="flex justify-between"><dt>{g.gate}</dt><dd className="font-semibold">{g.pct}%</dd></div>)}</dl>
                </Card>
                <Card title="Recent Derivation Events">
                    <ul className="space-y-2 text-xs">
                        {events.length === 0 && <li className="text-ink-400">No derivation runs recorded yet.</li>}
                        {events.map((e, i) => <li key={i}><span className="block text-ink-800">{e.summary}</span><span className="text-ink-400">{fmtDate(e.created_at, true)}</span></li>)}
                    </ul>
                </Card>
            </div>
        </AdminShell>
    );
}

ListingState.layout = null;
