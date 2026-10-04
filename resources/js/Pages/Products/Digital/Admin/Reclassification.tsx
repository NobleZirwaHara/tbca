import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { Meter, QueueFilters } from '@/Components/Products/Digital/Console';
import { DataTable, DpStatus, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';
import { formatZar } from '@/lib/money';
import { cn } from '@/lib/cn';

interface Row {
    id: number;
    product: string;
    category: string;
    state: string;
    eligibility: string;
    gap: string;
    route: string | null;
    dss: string;
    priority: string;
    owner: string;
    target: string | null;
    stage: number;
}

interface Props {
    rows: Row[];
    pagination: DpPagination;
    kpis: { delayed: number; total: number; eligible: number; rework: number; notEligible: number; published: number };
    stages: { n: number; label: string; count: number; at: number }[];
    tabs: { key: string; label: string; count: number }[];
    filters: Record<string, string> & { tab: string };
    categories: string[];
}

const CHECKLIST = [
    'Digital artefact exists (DOCX / XLSX / PDF)',
    'Instant access configured & tested',
    'Licence classes L1–L5 mapped',
    'Version & language packaged',
    'QA passed (Creation QA Workbench)',
    'Price & packaging assigned',
    'Support route defined',
    'Listing content complete',
    'Refund disclosure ready',
];

export default function Reclassification({ rows, pagination, kpis, stages, tabs, filters, categories }: Props) {
    const base = '/admin/products/digital/delivery-reclassification';
    const nav = useQueryNav(base, filters);
    const pct = (n: number) => (kpis.total ? ((n / kpis.total) * 100).toFixed(1) : '0.0');
    const eligiblePct = kpis.total ? Math.round(((kpis.eligible + kpis.published) / kpis.total) * 100) : 0;

    return (
        <AdminShell title="Delivery Reclassification Workbench" description="Convert delayed-delivery items to instant-core Digital Products. Enforce instant-core standard.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Total Delayed (To Reclassify)" value={kpis.delayed.toLocaleString()} caption="Not yet published" />
                <Kpi label="Total In Scope" value={kpis.total.toLocaleString()} caption="Register + DP-extension rows" dark />
                <Kpi label="Eligible for Instant-Core" value={kpis.eligible.toLocaleString()} tone="good" caption={`${pct(kpis.eligible)}% of total in scope`} />
                <Kpi label="Pending Rework" value={kpis.rework} tone="warn" caption={`${pct(kpis.rework)}% of total in scope`} />
                <Kpi label="Not Eligible" value={kpis.notEligible} tone="bad" caption={`${pct(kpis.notEligible)}% · needs human advisory`} />
                <Kpi label="Published" value={kpis.published} tone="good" caption="Instant core live" />
            </div>

            <ol className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
                {stages.map((s) => {
                    const complete = s.at === 0 && s.count > 0 && s.n <= 2;
                    const status = complete ? 'Complete' : s.at > 0 ? 'In Progress' : s.n === 7 && s.count > 0 ? 'Complete' : 'Pending';
                    return (
                        <li key={s.n} className={cn('rounded-[8px] border bg-white p-3', status === 'In Progress' ? 'border-gold-500' : 'border-parchment-400')}>
                            <p className="text-[0.6875rem] font-bold text-gold-700">Step {s.n}</p>
                            <p className="text-xs font-semibold text-ink-900">{s.label}</p>
                            <DpStatus status={status} className="mt-1" />
                            <p className="mt-1 text-lg font-bold text-ink-900">{(s.n <= 2 ? s.count : s.at).toLocaleString()}</p>
                            <p className="text-[0.625rem] text-ink-500">{s.n <= 2 ? 'Items assessed' : 'Items at this step'}</p>
                        </li>
                    );
                })}
            </ol>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search by product, version, category..."
                selects={[
                    { key: 'category', label: 'All Categories', options: categories.map((c) => ({ value: c, label: c })) },
                    { key: 'dss', label: 'All DSS Bands', options: ['DSS 1 – Very High', 'DSS 2 – High', 'DSS 3 – Medium'].map((d) => ({ value: d, label: d })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <QueryTabs value={filters.tab} onChange={(tab) => nav({ tab })} tabs={tabs} />
                    <div className="mt-3">
                        <DataTable
                            columns={['Product & Version', 'Category', 'Current State', 'Eligibility', 'Gap Summary', 'DSS Band', 'Priority', 'Owner', 'Target Release', 'Stage', 'Actions']}
                            rows={rows.map((r) => [
                                <span className="font-semibold text-ink-900">{r.product}</span>,
                                r.category,
                                r.state,
                                <DpStatus status={r.eligibility} />,
                                r.gap,
                                r.dss,
                                <DpStatus status={r.priority} />,
                                r.owner,
                                r.target ?? '—',
                                `${Math.min(r.stage, 7)} / 7`,
                                <span className="flex flex-col gap-1">
                                    {r.stage < 7 && r.eligibility === 'eligible' && <Btn tone="gold" onClick={() => act(`${base}/${r.id}`, { action: 'advance' })}>Advance Stage</Btn>}
                                    {r.stage < 2 && r.eligibility !== 'eligible' && <Btn onClick={() => act(`${base}/${r.id}`, { action: 'advance' })}>Complete Analysis</Btn>}
                                    {r.eligibility === 'pending_rework' && <Btn onClick={() => act(`${base}/${r.id}`, { action: 'rework_done' })}>Rework Done</Btn>}
                                    {r.eligibility === 'not_eligible' && (
                                        <Btn onClick={() => act(`${base}/${r.id}`, { action: 'reclassify' }, 'Route this item to a Sprint / Advisory vehicle (R-B)?')}>Reclassify to Sprint</Btn>
                                    )}
                                </span>,
                            ])}
                        />
                    </div>
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    <SideCard title="Instant-Core Standard Checklist">
                        <p className="mb-2 text-[0.6875rem] text-ink-500">All criteria must be GREEN to qualify.</p>
                        <div className="space-y-2">
                            {CHECKLIST.map((c) => (
                                <Meter key={c} label={c} value={eligiblePct} tone={eligiblePct >= 80 ? 'good' : 'warn'} />
                            ))}
                        </div>
                    </SideCard>
                    <SideCard title="Reclassification Impact (Est.)">
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><dt className="text-ink-600">New Instant-Core Products</dt><dd className="font-bold">{kpis.eligible.toLocaleString()}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Revenue Potential (Est.)</dt><dd className="font-bold">{formatZar(kpis.eligible * 6967)}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Time to Completion (Est.)</dt><dd className="font-bold">{Math.max(1, Math.ceil(kpis.delayed / 60))} days</dd></div>
                        </dl>
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

Reclassification.layout = null;
