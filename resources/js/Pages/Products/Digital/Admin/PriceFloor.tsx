import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Calculator, Check } from 'lucide-react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { FlowSteps, QueueFilters, QuickActions } from '@/Components/Products/Digital/Console';
import { CHART, DataTable, Donut, DpStatus, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';
import { formatZar } from '@/lib/money';

interface Row {
    id: number;
    product: string;
    sku: string;
    category: string;
    licence: string;
    price: number;
    floor: number;
    tcs: number;
    proposed: number | null;
    priority: string;
    status: string;
    bundle: boolean;
    state: string;
    gapFloor: number;
    gapFloorPct: number;
    gapTcs: number;
    gapTcsPct: number;
    gp: number;
}

interface Props {
    rows: Row[];
    pagination: DpPagination;
    kpis: { below: number; tcs: number; gp: number; bundle: number; value: number; blendedNow: number; blendedAfter: number; restored: number };
    steps: { key: string; label: string; count: number }[];
    priority: { key: string; count: number }[];
    tabs: { key: string; label: string; count: number }[];
    filters: Record<string, string> & { tab: string };
}

const RULES = [
    'Every proposed tier must be > TCS.',
    'Gross profit must be ≥ 45% at every tier.',
    'Discounts must respect Max Defensible Discount.',
    'Bundle price must be ≥ sum of component floors.',
    'Price changes require Finance approval (GATE-DP-14).',
];

function RowActions({ r, base }: { r: Row; base: string }) {
    const [price, setPrice] = useState(String(r.proposed ?? r.floor));
    const post = (action: string, extra: Record<string, unknown> = {}) => act(`${base}/${r.id}`, { action, ...extra });

    switch (r.status) {
        case 'needs_review':
            return <Btn onClick={() => post('analyse')}>Analyse</Btn>;
        case 'in_analysis':
        case 'price_proposed':
            return (
                <span className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-[0.6875rem]">
                        <span className="sr-only">Proposed price for {r.product}</span>R
                        <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className="h-7 w-16 rounded border border-parchment-500 px-1 text-xs" inputMode="numeric" />
                    </label>
                    <Btn onClick={() => post('propose', { price: Number(price) })}>Propose</Btn>
                    {r.status === 'price_proposed' && <Btn tone="gold" onClick={() => post('submit')}>Submit to Finance</Btn>}
                </span>
            );
        case 'awaiting_approval':
            return (
                <span className="flex flex-col gap-1">
                    <Btn tone="gold" onClick={() => post('approve')}>Approve (GATE-DP-14)</Btn>
                    <Btn tone="danger" onClick={() => post('reject')}>Reject</Btn>
                </span>
            );
        default:
            return <Check className="size-4 text-verified-600" aria-label="Remediated" />;
    }
}

export default function PriceFloor({ rows, pagination, kpis, steps, priority, tabs, filters }: Props) {
    const base = '/admin/products/digital/pricing-floor';
    const nav = useQueryNav(base, filters);

    return (
        <AdminShell
            title="Price Floor and Package Remediation"
            description="Resolve below-floor pricing, restore margin integrity and enforce package economics."
            actions={
                <Btn tone="gold" onClick={() => act(`${base}/recalculate`)}>
                    <Calculator className="size-4" aria-hidden="true" /> Recalculate Floors
                </Btn>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Kpi label="Below Floor Items" value={kpis.below} tone="bad" caption="At least one tier below floor" />
                <Kpi label="At / Below TCS Items" value={kpis.tcs} tone="warn" caption="At or below TCS at one tier" />
                <Kpi label="Low GP Items (< 45%)" value={kpis.gp} tone="warn" caption="Gross profit below 45%" />
                <Kpi label="Bundle Violations" value={kpis.bundle} caption="Component floor breaches" />
                <Kpi label="Total Remediation Value" value={formatZar(kpis.value)} tone="good" caption="Additional revenue potential" />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search by product, version, category, SKU..."
                selects={[
                    { key: 'licence', label: 'All Licence Classes', options: ['L1', 'L2', 'L3', 'L4', 'L5'].map((l) => ({ value: l, label: l })) },
                    { key: 'status', label: 'All Statuses', options: steps.map((s) => ({ value: s.key, label: s.label })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <QueryTabs value={filters.tab} onChange={(tab) => nav({ tab })} tabs={tabs} />
                        <div className="mt-3">
                            <DataTable
                                columns={['Product & Version', 'Category', 'Licence', 'Current State', 'Lowest Tier Price', 'Floor Price (45% GP)', 'TCS', 'Gap to Floor', 'Gap to TCS', 'Suggested Action', 'Priority', 'Status', 'Actions']}
                                rows={rows.map((r) => [
                                    <span>
                                        <span className="font-semibold text-ink-900">{r.product}</span>
                                        <span className="block font-mono text-[0.625rem] text-ink-500">{r.sku}</span>
                                    </span>,
                                    r.category,
                                    r.licence,
                                    <DpStatus status={r.state} />,
                                    formatZar(r.price),
                                    formatZar(r.floor),
                                    formatZar(r.tcs),
                                    <span className={r.gapFloor ? 'text-risk-700' : ''}>
                                        {formatZar(r.gapFloor)} <span className="block text-[0.625rem]">+{r.gapFloorPct}%</span>
                                    </span>,
                                    <span>
                                        {formatZar(r.gapTcs)} <span className="block text-[0.625rem]">+{r.gapTcsPct}%</span>
                                    </span>,
                                    r.status === 'completed' ? `Remediated at ${formatZar(r.price)}` : `Raise price to ${formatZar(r.floor)}`,
                                    <DpStatus status={r.priority} />,
                                    <DpStatus status={r.status} />,
                                    <RowActions r={r} base={base} />,
                                ])}
                            />
                        </div>
                        <Pager pagination={pagination} />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <SideCard title="Floor & Margin Rules">
                            <ul className="space-y-1.5 text-xs text-ink-700">
                                {RULES.map((r) => (
                                    <li key={r} className="flex gap-2">
                                        <Check className="mt-0.5 size-3.5 shrink-0 text-verified-600" aria-hidden="true" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </SideCard>
                        <SideCard title="Remediation Status by Step">
                            <ul className="grid grid-cols-5 gap-2 text-center">
                                {steps.map((s) => (
                                    <li key={s.key}>
                                        <p className="text-lg font-bold text-ink-900">{s.count}</p>
                                        <p className="text-[0.625rem] text-ink-500">{s.label}</p>
                                    </li>
                                ))}
                            </ul>
                        </SideCard>
                    </div>
                    <FlowSteps
                        steps={['Identify Below Floor Items', 'Analyse Costs & Floors', 'Propose Price Adjustments', 'Validate Impact & GP', 'Finance Approval', 'Apply Updates', 'Monitor Performance'].map((t) => ({ title: t }))}
                        active={0}
                    />
                </div>

                <div className="space-y-4">
                    <SideCard title="Remediation Overview">
                        <Donut
                            centre={kpis.below}
                            caption="Below Floor Items"
                            size={120}
                            segments={priority.map((p) => ({ label: `${p.key[0].toUpperCase()}${p.key.slice(1)} Priority`, value: p.count, color: p.key === 'high' ? CHART[5] : p.key === 'medium' ? CHART[2] : CHART[0] }))}
                        />
                    </SideCard>
                    <SideCard title="Remediation Impact (Est.)">
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><dt className="text-ink-600">New Revenue Potential</dt><dd className="font-bold">{formatZar(kpis.value)}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Blended GP (Current)</dt><dd className="font-bold">{kpis.blendedNow}%</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Blended GP (Post Remediation)</dt><dd className="font-bold text-verified-700">{kpis.blendedAfter}%</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Items Restored to Floor</dt><dd className="font-bold">{kpis.restored}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">TCS Compliance Improvement</dt><dd className="font-bold">{kpis.tcs}</dd></div>
                        </dl>
                    </SideCard>
                    <SideCard title="Quick Actions">
                        <QuickActions
                            items={[
                                { title: 'Auto-Calculate Floor Prices', body: 'Recalculate 45% GP floor for all items.', onClick: () => act(`${base}/recalculate`) },
                                { title: 'Awaiting Finance approval', body: 'Proposed prices waiting on GATE-DP-14.', onClick: () => router.get(base, { tab: 'all', status: 'awaiting_approval' }) },
                                { title: 'Review Package Floors', body: 'Check bundle and package economics.', onClick: () => nav({ tab: 'bundle' }) },
                                { title: 'Remediated items', body: 'Prices restored to floor.', onClick: () => nav({ tab: 'remediated' }) },
                            ]}
                        />
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

PriceFloor.layout = null;
