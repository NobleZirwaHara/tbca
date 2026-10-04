import { useState } from 'react';
import { BadgePercent, Banknote, Coins, TrendingUp, Users, UserX } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ActionButton, BarRow } from '@/Components/Products/Shared';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, zar } from '@/Components/Products/Retainers/ui';

interface ClientRow {
    client: string;
    retainers: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    utilisation: number;
    status: 'Healthy' | 'At Risk' | 'Critical';
    owners: string[];
    review: boolean;
    codes: string[];
}

interface Props {
    kpis: { revenue: number; cost: number; profit: number; margin: number; clients: number; under: number };
    clients: ClientRow[];
    distribution: Record<string, number>;
    scatter: { client: string; x: number; y: number; status: string }[];
    filters: { owner: string; q: string; status: string };
    owners: string[];
    paid_orders: number;
}

const PATH = '/admin/products/retainers/profitability';
const DOT: Record<string, string> = { Healthy: C.green, 'At Risk': C.amber, Critical: C.red };

export default function Profitability({ kpis, clients, distribution, scatter, filters, owners, paid_orders }: Props) {
    const [q, setQ] = useState(filters.q);
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const distTotal = Object.values(distribution).reduce((s, n) => s + n, 0) || 1;
    const sorted = [...clients].sort((a, b) => b.margin - a.margin);
    const critical = clients.filter((c) => c.margin < 20).length;

    return (
        <AdminShell title="Retainer Profitability by Client" description="Analyse profitability performance of retainers by client, period and retainer.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Banknote} label="Total Retainer Revenue" value={zar(kpis.revenue)} caption="This period" />
                <StatTile icon={Coins} label="Direct Cost" value={zar(kpis.cost)} tone="info" />
                <StatTile icon={TrendingUp} label="Gross Profit" value={zar(kpis.profit)} tone="good" />
                <StatTile icon={BadgePercent} label="Gross Margin" value={`${kpis.margin}%`} tone="purple" />
                <StatTile icon={Users} label="Active Clients" value={kpis.clients} />
                <StatTile icon={UserX} label="Under-Utilised Clients (<60%)" value={kpis.under} tone="bad" caption={`${kpis.clients ? Math.round((kpis.under / kpis.clients) * 100) : 0}%`} />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Account Owner" value={filters.owner} onChange={(v) => set('owner', v)} options={[{ value: '', label: 'All Owners' }, ...owners.map((o) => ({ value: o, label: o }))]} />
                <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All Statuses' }, ...['Healthy', 'At Risk', 'Critical'].map((s) => ({ value: s, label: s }))]} />
                <form
                    className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500"
                    onSubmit={(e) => {
                        e.preventDefault();
                        set('q', q);
                    }}
                >
                    <label htmlFor="prof-q">Search client</label>
                    <input id="prof-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem] text-ink-800" />
                </form>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
                <Panel title="Client Profitability Summary">
                    <SimpleTable
                        columns={['#', 'Client', 'Active Retainers', 'Revenue (ZAR)', 'Direct Cost (ZAR)', 'Gross Profit (ZAR)', 'Margin %', 'Utilisation %', 'Status', 'Action']}
                        rows={clients.map((c, i) => [
                            i + 1,
                            <span className="font-semibold text-ink-900">{c.client}</span>,
                            c.retainers,
                            c.revenue.toLocaleString('en-ZA'),
                            c.cost.toLocaleString('en-ZA'),
                            <span className="font-semibold text-verified-700">{c.profit.toLocaleString('en-ZA')}</span>,
                            `${c.margin}%`,
                            `${c.utilisation}%`,
                            <StatusPill status={c.status} tone={c.status === 'Healthy' ? 'good' : c.status === 'At Risk' ? 'warn' : 'bad'} />,
                            c.review ? (
                                <span className="text-xs text-ink-500">Review open</span>
                            ) : (
                                <ActionButton href={`${PATH}/review`} data={{ client: c.client }} tone={c.status === 'Healthy' ? 'outline' : 'gold'}>
                                    Open Commercial Review
                                </ActionButton>
                            ),
                        ])}
                        empty="No active retainers match these filters."
                    />
                    <p className="mt-3 text-[0.6875rem] text-ink-500">
                        Internal only. Margin from low utilisation is a governance signal, never a sales target, and is never shown to clients. Paid retainer orders to date: {zar(paid_orders)}.
                    </p>
                </Panel>

                <div className="space-y-5">
                    <Panel title="Profitability Overview">
                        <div className="flex flex-col items-center gap-3">
                            <Donut size={150} centre={zar(kpis.revenue)} sub="Total Revenue" segments={[{ value: kpis.profit, color: C.green }, { value: kpis.cost, color: C.blue }]} />
                            <Legend items={[{ color: C.green, label: 'Gross Profit', value: `${zar(kpis.profit)} (${kpis.margin}%)` }, { color: C.blue, label: 'Direct Cost', value: zar(kpis.cost) }]} />
                        </div>
                    </Panel>
                    <Panel title="Margin Distribution">
                        <div className="space-y-2">
                            {Object.entries(distribution).map(([band, n]) => (
                                <BarRow key={band} label={band} value={n} max={distTotal} suffix={` clients`} tone={band === '< 20%' ? 'bad' : band === '20% – 35%' ? 'gold' : 'good'} />
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Top / Bottom by Margin %">
                        <p className="text-xs font-semibold text-verified-700">Top 3</p>
                        <ul className="mb-2 text-xs">
                            {sorted.slice(0, 3).map((c) => (
                                <li key={c.client} className="flex justify-between">
                                    <span>{c.client}</span>
                                    <span className="font-semibold">{c.margin}%</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs font-semibold text-risk-700">Bottom 3</p>
                        <ul className="text-xs">
                            {sorted.slice(-3).reverse().map((c) => (
                                <li key={c.client} className="flex justify-between">
                                    <span>{c.client}</span>
                                    <span className="font-semibold">{c.margin}%</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Panel title="Utilisation vs Margin">
                    <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label="Scatter of utilisation against margin by client">
                        <line x1="30" y1="170" x2="310" y2="170" stroke="var(--color-parchment-500)" />
                        <line x1="30" y1="10" x2="30" y2="170" stroke="var(--color-parchment-500)" />
                        <text x="170" y="195" fontSize="9" textAnchor="middle" fill="var(--color-ink-500)">Utilisation %</text>
                        <text x="10" y="90" fontSize="9" textAnchor="middle" fill="var(--color-ink-500)" transform="rotate(-90 10 90)">Margin %</text>
                        {scatter.map((s) => (
                            <circle key={s.client} cx={30 + (Math.min(100, s.x) / 100) * 280} cy={170 - (Math.max(0, Math.min(80, s.y)) / 80) * 160} r="5" fill={DOT[s.status] ?? C.grey}>
                                <title>{`${s.client}: ${s.x}% utilisation, ${s.y}% margin`}</title>
                            </circle>
                        ))}
                    </svg>
                    <Legend items={Object.entries(DOT).map(([label, color]) => ({ label, color }))} />
                </Panel>
                <Panel title="Insights">
                    <ul className="list-disc space-y-1.5 pl-4 text-[0.8125rem] text-ink-700">
                        <li>
                            {kpis.under} clients ({kpis.clients ? Math.round((kpis.under / kpis.clients) * 100) : 0}%) are under-utilised (&lt;60% utilisation). Send a neutral utilisation review from the Under-Use Alert Queue.
                        </li>
                        <li>{critical} clients have margin &lt; 20% and require attention.</li>
                        {sorted[0] && (
                            <li>
                                Top performer: {sorted[0].client} ({sorted[0].margin}% margin).
                            </li>
                        )}
                    </ul>
                </Panel>
            </div>
        </AdminShell>
    );
}

Profitability.layout = null;
