import { Link, router } from '@inertiajs/react';
import { CircleAlert, CircleCheck, RefreshCw } from 'lucide-react';
import AdminShell, { Btn, Kpi, SideCard } from '@/Components/Products/Digital/AdminShell';
import { CHART, DataTable, Donut, DpStatus } from '@/Components/Products/Digital/Ui';
import { formatZar } from '@/lib/money';
import { cn } from '@/lib/cn';

interface Props {
    kpis: { total: number; paid: number; free: number; subscriptions: number; orders: number; ordersDelta: number | null; downloads: number; holders: number; revenue: number };
    grid: { name: string; code: string | null; value: string; target: string; ok: boolean; note?: string }[];
    actions: { priority: string; item: string; area: string; owner: string | null; due: string; status: string; href: string }[];
    revenue: { months: { month: string; short: string; value: number }[]; total: number; annualised: number };
    disposition: { code: string; label: string; count: number }[];
    risks: { label: string; value: number }[];
    freshness: { label: string; state: string }[];
}

export default function ControlTower({ kpis, grid, actions, revenue, disposition, risks, freshness }: Props) {
    const max = Math.max(1, ...revenue.months.map((m) => m.value));
    const pct = (n: number) => (kpis.total ? `${((n / kpis.total) * 100).toFixed(1)}%` : '0%');

    return (
        <AdminShell
            title="Digital Products Control Tower"
            description="Real-time portfolio, quality, compliance, economics and launch control."
            actions={
                <Btn onClick={() => router.reload()}>
                    <RefreshCw className="size-4" aria-hidden="true" /> Refresh Data
                </Btn>
            }
        >
            <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
                <Kpi label="Total Products" value={kpis.total.toLocaleString()} caption="100% of catalogue" />
                <Kpi label="Paid Products Live" value={kpis.paid.toLocaleString()} tone="good" caption={`${pct(kpis.paid)} · Revenue eligible`} />
                <Kpi label="Free Lead Live" value={kpis.free} tone="blue" caption={pct(kpis.free)} />
                <Kpi label="Subscriptions Live" value={kpis.subscriptions} tone="purple" caption="Recurring value proven" />
                <Kpi label="Orders (30D)" value={kpis.orders} caption={kpis.ordersDelta === null ? 'No prior period' : `${kpis.ordersDelta >= 0 ? '+' : ''}${kpis.ordersDelta}% vs last 30 days`} />
                <Kpi label="Downloads (30D)" value={kpis.downloads.toLocaleString()} />
                <Kpi label="Active Holders" value={kpis.holders.toLocaleString()} caption="Entitlements" />
                <Kpi label="Revenue (30D)" value={formatZar(kpis.revenue)} tone="gold" caption="Paid, ex VAT" />
            </div>

            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                <h2 className="mb-3 text-xs font-bold tracking-wide uppercase">Master KPI Grid</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {grid.map((g) => (
                        <li key={g.name} className={cn('rounded-[6px] border p-3', g.ok ? 'border-verified-500/30' : 'border-attested-500/40 bg-attested-50/40')}>
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-ink-900">{g.name}</p>
                                {g.ok ? <CircleCheck className="size-4 shrink-0 text-verified-600" aria-label="On target" /> : <CircleAlert className="size-4 shrink-0 text-attested-600" aria-label="Off target" />}
                            </div>
                            {g.code && <p className="text-[0.625rem] text-ink-400">{g.code}</p>}
                            <p className="mt-1 text-xl font-bold text-ink-900">{g.value}</p>
                            <p className="text-[0.6875rem] text-ink-500">{g.target}</p>
                            {g.note && <p className="text-[0.625rem] text-ink-400">{g.note}</p>}
                        </li>
                    ))}
                </ul>
            </section>

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-3 text-xs font-bold tracking-wide uppercase">Top 10 Action List (By Priority)</h2>
                        <DataTable
                            columns={['Priority', 'Item', 'Area', 'Owner', 'Due Date', 'Status']}
                            rows={actions.map((a) => [
                                <DpStatus status={a.priority} className={a.priority === 'P0' ? 'border-risk-500/40 bg-risk-50 text-risk-700' : a.priority === 'P1' ? 'border-attested-500/40 bg-attested-50 text-attested-700' : ''} />,
                                <Link href={a.href} className="font-semibold text-ink-900 hover:text-gold-700 hover:underline">
                                    {a.item}
                                </Link>,
                                a.area,
                                a.owner ?? '—',
                                a.due,
                                <DpStatus status={a.status} />,
                            ])}
                            empty="No open actions. The portfolio is within all gates."
                        />
                    </section>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="text-xs font-bold tracking-wide uppercase">Revenue (Last 12 Months, ex VAT)</h2>
                            <p className="text-xs text-ink-600">
                                Total <span className="font-bold text-ink-900">{formatZar(revenue.total)}</span>
                            </p>
                        </div>
                        <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label="Monthly paid revenue bar chart">
                            {revenue.months.map((m) => (
                                <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${formatZar(m.value)}`}>
                                    <div className="w-full rounded-t bg-gold-500" style={{ height: `${Math.max(2, (m.value / max) * 130)}px` }} />
                                    <span className="text-[0.625rem] text-ink-500">{m.short}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-4">
                    <SideCard title="Portfolio Disposition">
                        <Donut centre={kpis.total} caption="Products" size={120} segments={disposition.map((d, i) => ({ label: `${d.code} ${d.label}`, value: d.count, color: CHART[i] }))} />
                    </SideCard>
                    <SideCard title="Risk & Exceptions">
                        <ul className="space-y-1.5 text-xs">
                            {risks.map((r) => (
                                <li key={r.label} className="flex justify-between gap-2">
                                    <span className="text-ink-700">{r.label}</span>
                                    <span className={r.value > 0 ? 'font-bold text-risk-700' : 'font-bold text-verified-700'}>{r.value}</span>
                                </li>
                            ))}
                        </ul>
                    </SideCard>
                    <SideCard title="Data Freshness">
                        <ul className="space-y-1.5 text-xs">
                            {freshness.map((f) => (
                                <li key={f.label} className="flex justify-between gap-2">
                                    <span className="text-ink-700">{f.label}</span>
                                    <DpStatus status={f.state} />
                                </li>
                            ))}
                        </ul>
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

ControlTower.layout = null;
