import { Link } from '@inertiajs/react';
import { ChevronRight, Download, FilePlus2, FileWarning, Plus, Scale, Settings, ShieldCheck, Tags, Upload } from 'lucide-react';
import AdminShell, { Kpi, SideCard } from '@/Components/Products/Digital/AdminShell';
import { CHART, DataTable, Donut, DpStatus, TextLink } from '@/Components/Products/Digital/Ui';
import { Progress } from '@/Components/ui/Kit';
import { formatZar } from '@/lib/money';

interface Props {
    kpis: { live: number; total: number; passRate: number; passCount: number; dssMedian: number; dssMin: number; dssMax: number; belowFloor: number; reclass: number; p0: number; orders: number; ordersDelta: number | null; revenue: number };
    portfolio: { key: string; label: string; count: number }[];
    activity: { event: string; subject: string | null; at: string; code: string }[];
    gates: { code: string; name: string; status: string; value: string }[];
    orders: { reference: string; customer: string; product: string; amount: number; status: string; date: string }[];
    topProducts: { name: string; downloads: number }[];
}

export default function ControlCentre({ kpis, portfolio, activity, gates, orders, topProducts }: Props) {
    return (
        <AdminShell
            title="Digital Product Admin Control Centre"
            description="Manage the entire Digital Products lifecycle, quality, pricing, rights and performance."
            actions={
                <>
                    <a href="/admin/products/digital/control-tower" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Download className="size-4" aria-hidden="true" /> Export Dashboard</a>
                    <Link href="/admin/products/digital/qa" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-xs font-semibold"><Plus className="size-4" aria-hidden="true" /> Create New Product</Link>
                    <Link href="/admin/products/digital/portfolio" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Settings className="size-4" aria-hidden="true" /> System Settings</Link>
                </>
            }
        >
            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">Key Overview <span className="font-normal normal-case text-ink-500">(Live Catalogue)</span></h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <div>
                        <Kpi label="Live Products" value={kpis.live.toLocaleString()} caption={`of ${kpis.total.toLocaleString()} total`} tone="neutral" />
                        <Progress value={(kpis.live / Math.max(1, kpis.total)) * 100} tone="good" className="mt-1" />
                    </div>
                    <Kpi label="Defensibility Pass Rate" value={`${kpis.passRate}%`} caption={`${kpis.passCount} with ≥1 ACTIVE D · Target 100%`} tone="good" />
                    <Kpi label="DSS Median (Paid)" value={kpis.dssMedian} caption={`Min ${kpis.dssMin} | Max ${kpis.dssMax} · Target ≥ 40`} tone="good" />
                    <Kpi label="Below Price Floor" value={kpis.belowFloor} caption="Rows below floor · Needs action" tone="bad" />
                    <Kpi label="Reclassification Queue" value={kpis.reclass} caption="Delivery reclassification · In progress" tone="warn" />
                    <Kpi label="Open P0 Items" value={kpis.p0} caption="Across QC & Gates · Needs attention" tone="bad" />
                    <Kpi label="Orders (This Month)" value={kpis.orders} caption={<>{kpis.ordersDelta !== null && <span className="text-verified-600">▲ {kpis.ordersDelta}% vs last month · </span>}{formatZar(kpis.revenue)}</>} />
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-3">
                <SideCard title="Product Portfolio by Status">
                    <Donut centre={kpis.total.toLocaleString()} caption="Total" segments={portfolio.map((p, i) => ({ label: p.label, value: p.count, color: CHART[i % CHART.length] }))} />
                    <TextLink href="/admin/products/digital/portfolio" className="mt-3">View full portfolio report →</TextLink>
                </SideCard>
                <SideCard title="Latest Activity">
                    <ul className="space-y-2.5 text-xs">
                        {activity.map((a, i) => (
                            <li key={i} className="flex justify-between gap-3">
                                <span><strong className="block text-ink-900">{a.event}</strong><span className="text-ink-500">{a.subject}</span></span>
                                <span className="shrink-0 text-ink-500">{a.at}</span>
                            </li>
                        ))}
                    </ul>
                    <TextLink href="/admin/products/digital/control-tower" className="mt-3">View all system activity →</TextLink>
                </SideCard>
                <SideCard title="Gate & Compliance Status">
                    <ul className="space-y-2 text-xs">
                        {gates.map((g) => (
                            <li key={g.code} className="grid grid-cols-[92px_1fr_auto_auto] items-center gap-2">
                                <span className="font-semibold text-ink-900">{g.code}</span>
                                <span className="text-ink-600">{g.name}</span>
                                <DpStatus status={g.status} />
                                <span className="w-12 text-right font-semibold">{g.value}</span>
                            </li>
                        ))}
                    </ul>
                    <TextLink href="/admin/products/digital/qa" className="mt-3">View gate dashboard →</TextLink>
                </SideCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
                <SideCard title="Recent Orders">
                    <DataTable
                        columns={['Order Reference', 'Customer', 'Product', 'Amount', 'Status', 'Date']}
                        rows={orders.map((o) => [o.reference, o.customer, o.product, formatZar(o.amount), <DpStatus key="s" status={o.status} />, o.date])}
                        empty="No digital product orders yet."
                    />
                    <TextLink href="/admin/products/digital/versions" className="mt-3">View all orders →</TextLink>
                </SideCard>
                <SideCard title="Top Products (By Downloads)">
                    <ul className="space-y-2 text-xs">
                        {topProducts.map((t) => <li key={t.name} className="flex justify-between"><span>{t.name}</span><strong>{t.downloads.toLocaleString()}</strong></li>)}
                    </ul>
                    <TextLink href="/admin/products/digital/control-tower" className="mt-3">View full analytics →</TextLink>
                </SideCard>
                <SideCard title="Quick Actions">
                    <ul className="divide-y divide-parchment-300 text-xs">
                        {[
                            [FilePlus2, 'Create New Product', 'Start a new Digital Product from template.', '/admin/products/digital/qa'],
                            [Upload, 'Upload New Version', 'Upload and prepare a new product version.', '/admin/products/digital/qa'],
                            [Scale, 'Run Defensibility Review', 'Evaluate D1–D5 for selected product.', '/admin/products/digital/defensibility'],
                            [Tags, 'Manage Price Exceptions', 'Review and resolve pricing floor exceptions.', '/admin/products/digital/pricing-floor'],
                            [FileWarning, 'View Correction Register', 'Manage corrections and withdrawals.', '/admin/products/digital/corrections'],
                        ].map(([I, t, b, h]) => {
                            const Icon = I as typeof Scale;
                            return (
                                <li key={t as string}>
                                    <Link href={h as string} className="flex items-center gap-3 py-2">
                                        <Icon className="size-5 text-gold-600" aria-hidden="true" />
                                        <span className="flex-1"><strong className="block text-ink-900">{t as string}</strong>{b as string}</span>
                                        <ChevronRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </SideCard>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-3 text-xs text-ink-700">
                <span className="flex items-center gap-2"><ShieldCheck className="size-5 text-gold-700" aria-hidden="true" /> All actions are logged and auditable. Ensure all changes meet governance, QA and legal requirements before release.</span>
                <Link href="/admin/products" className="font-semibold text-gold-700 underline">Visit Governance Centre →</Link>
            </div>
        </AdminShell>
    );
}

ControlCentre.layout = null;
