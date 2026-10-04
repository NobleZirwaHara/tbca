import { useState } from 'react';
import { Activity, BarChart3, Clock, Gauge, LineChart as LineIcon, ShieldCheck, Sprout, TriangleAlert, Users, Eye } from 'lucide-react';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, SubAdminShell, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile } from '@/Components/Products/Subscriptions/ui';
import { Bars, LineChart } from '@/Components/Products/Subscriptions/charts';

interface Row {
    id: number;
    class: string;
    name: string;
    subscribers: number;
    platform_subscribers: number;
    demand_hours: number;
    committed_hours: number;
    utilisation: number;
    headroom: number;
    status: string;
    minutes_per_subscriber: number;
}

interface Props {
    rows: Row[];
    trend: [string, number][];
    commitments: { id: number; class: string; boost: number }[];
}

const PATH = '/admin/products/subscriptions/review-capacity';

export default function Capacity({ rows, trend, commitments }: Props) {
    const [editing, setEditing] = useState<Row | null>(null);
    const [action, setAction] = useState<'increase' | 'boost' | 'reduce'>('increase');
    const [hours, setHours] = useState('20');
    const subs = rows.reduce((s, r) => s + r.subscribers, 0);
    const demand = rows.reduce((s, r) => s + r.demand_hours, 0);
    const committed = rows.reduce((s, r) => s + r.committed_hours, 0);
    const util = committed ? Math.round((demand / committed) * 1000) / 10 : 0;
    const atRisk = rows.filter((r) => r.status !== 'Healthy');
    const sorted = [...rows].sort((a, b) => b.utilisation - a.utilisation);

    return (
        <SubAdminShell
            title="Review Capacity versus Subscriber Book"
            description="Compare review capacity with active subscriber commitments to ensure sustainable delivery. Growth stops before overload."
            strip={[
                { icon: ShieldCheck, title: 'Protect Delivery', body: 'Prevent over-subscription and failure.' },
                { icon: BarChart3, title: 'Data Driven', body: 'Real-time view of demand and capacity.' },
                { icon: Eye, title: 'Plan Ahead', body: 'Identify risks and act before breaches.' },
                { icon: Sprout, title: 'Sustainable Growth', body: 'Scale responsibly within capacity.' },
                { icon: Activity, title: 'Transparent', body: 'Clear to clients and internal teams.' },
            ]}
            note="When a class exceeds 100% of committed capacity, new sales in that class are held at checkout (CAPACITY_HOLD) and unreserved continuations are frozen."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Users} tone="purple" label="Active Subscribers" value={subs.toLocaleString()} caption="Baseline + platform book" />
                <StatTile icon={Clock} tone="blue" label="Total Review Demand" value={`${demand.toFixed(1)} hrs`} />
                <StatTile icon={Gauge} tone="green" label="Committed Review Capacity" value={`${committed.toFixed(1)} hrs`} />
                <StatTile icon={LineIcon} tone={util >= 85 ? 'orange' : 'green'} label="Capacity Utilisation" value={`${util}%`} caption="Warning 85% · Critical 95%" />
                <StatTile icon={TriangleAlert} tone="red" label="At Risk (≥ 95%)" value={`${atRisk.length} Classes`} />
                <StatTile icon={Clock} tone="gold" label="Capacity Headroom" value={`${(committed - demand).toFixed(1)} hrs`} caption={`${committed ? (((committed - demand) / committed) * 100).toFixed(1) : 0}% of capacity`} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card title="Capacity Utilisation Trend (Last 6 Months)">
                    <LineChart
                        labels={[...trend.map((t) => t[0].slice(0, 3)), 'Now']}
                        series={[{ name: 'Utilisation (%)', values: [...trend.map((t) => t[1]), util], color: '#2f9e5b' }]}
                        min={0}
                        max={110}
                        suffix="%"
                        refLines={[
                            { value: 85, label: 'Warning (85%)', color: '#e8892b' },
                            { value: 95, label: 'Critical (95%)', color: '#d64545' },
                        ]}
                    />
                </Card>
                <Card title="Capacity vs Demand by Plan Class (hrs)">
                    <Bars
                        labels={rows.map((r) => r.class)}
                        series={[
                            { name: 'Review Demand', values: rows.map((r) => r.demand_hours), color: '#3b7dd8' },
                            { name: 'Headroom', values: rows.map((r) => Math.max(0, r.headroom)), color: '#2f9e5b' },
                            { name: 'Over Capacity', values: rows.map((r) => Math.max(0, -r.headroom)), color: '#d64545' },
                        ]}
                    />
                </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card title="Plan Classes Capacity Summary">
                    <SimpleTable
                        columns={['Plan Class', 'Active Subscribers', 'Review Demand (hrs)', 'Committed Capacity (hrs)', 'Utilisation', 'Headroom / (Shortfall)', 'Status', 'Boost (hrs)', 'Action']}
                        rows={[
                            ...rows.map((r) => [
                                <span className="flex items-center gap-1.5"><ClassChip code={r.class} compact />{r.name}</span>,
                                <span>{r.subscribers}{r.platform_subscribers > 0 && <span className="block text-[0.625rem] text-ink-500">incl. {r.platform_subscribers} platform</span>}</span>,
                                r.demand_hours.toFixed(1),
                                r.committed_hours.toFixed(1),
                                `${r.utilisation}%`,
                                <span className={r.headroom < 0 ? 'text-risk-700' : ''}>{r.headroom < 0 ? `(${Math.abs(r.headroom).toFixed(1)})` : r.headroom.toFixed(1)}</span>,
                                <StatusPill status={r.status} tone={r.status === 'Healthy' ? 'good' : r.status === 'At Risk' ? 'warn' : 'bad'} />,
                                commitments.find((c) => c.id === r.id)?.boost ?? 0,
                                <ConsoleBtn onClick={() => setEditing(r)}>Adjust</ConsoleBtn>,
                            ]),
                            [<span className="font-bold">Total</span>, subs, demand.toFixed(1), committed.toFixed(1), `${util}%`, (committed - demand).toFixed(1), '', '', ''],
                        ]}
                    />
                </Card>
                <div className="space-y-5">
                    <Card title="Capacity Overview">
                        <LabelValues
                            rows={[
                                { label: 'Total committed capacity', value: `${committed.toFixed(1)} hrs` },
                                { label: 'Lowest utilisation (class)', value: sorted.at(-1) ? `${sorted.at(-1)!.class} (${sorted.at(-1)!.utilisation}%)` : '—' },
                                { label: 'Highest utilisation (class)', value: sorted[0] ? `${sorted[0].class} (${sorted[0].utilisation}%)` : '—' },
                            ]}
                        />
                    </Card>
                    <Card title="Top Capacity Risks">
                        <ul className="space-y-2 text-xs">
                            {sorted.slice(0, 3).map((r) => (
                                <li key={r.id}>
                                    <span className="font-semibold">{r.class} {r.name}</span> — Utilisation {r.utilisation}%
                                    <span className="block text-ink-500">{r.headroom < 0 ? 'Shortfall now — new sales held' : `${r.headroom.toFixed(1)} hrs headroom`}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={editing ? `Adjust capacity — ${editing.class} ${editing.name}` : ''}
                footer={
                    <ConsoleBtn tone="dark" onClick={() => { if (editing) post(`${PATH}/${editing.id}`, { action, hours: Number(hours) }); setEditing(null); }}>
                        Apply
                    </ConsoleBtn>
                }
            >
                {editing && (
                    <div className="space-y-3 text-sm">
                        <p className="text-xs text-ink-600">Committed {editing.committed_hours.toFixed(1)} hrs · demand {editing.demand_hours.toFixed(1)} hrs. Capacity cannot be reduced below current demand.</p>
                        <fieldset className="flex flex-wrap gap-3">
                            <legend className="sr-only">Action</legend>
                            {(['increase', 'boost', 'reduce'] as const).map((a) => (
                                <label key={a} className="flex items-center gap-1.5 text-xs">
                                    <input type="radio" name="cap-action" checked={action === a} onChange={() => setAction(a)} />
                                    {a === 'increase' ? 'Increase commitment' : a === 'boost' ? 'Temporary boost' : 'Reduce / reallocate'}
                                </label>
                            ))}
                        </fieldset>
                        <label className="block text-xs font-medium">
                            Hours
                            <input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" className="mt-1 h-9 w-full rounded border border-parchment-500 px-2" />
                        </label>
                    </div>
                )}
            </Modal>
        </SubAdminShell>
    );
}

Capacity.layout = null;
