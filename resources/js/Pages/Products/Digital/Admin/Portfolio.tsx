import AdminShell, { Btn, Kpi, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { Meter, QueueFilters } from '@/Components/Products/Digital/Console';
import { CHART, DataTable, Donut, DpStatus, Pager } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';

interface Row {
    slug: string;
    name: string;
    version: string | null;
    sku: string;
    disposition: string;
    state: string;
    defensibility: string | null;
    suitable: boolean;
    evidence: string;
    subscription: string;
    lastReview: string | null;
    nextReview: string | null;
    lifecycle: string;
    gate: string;
}

interface Props {
    rows: Row[];
    pagination: DpPagination;
    kpis: { total: number; paid: number; free: number; reclass: number; subscription: number };
    doctrine: { code: string; name: string; label: string; body: string; count: number }[];
    suitability: { label: string; value: number }[];
    filters: Record<string, string>;
}

export default function Portfolio({ rows, pagination, kpis, doctrine, suitability, filters }: Props) {
    const base = '/admin/products/digital/portfolio';
    const pct = (n: number) => (kpis.total ? `${((n / kpis.total) * 100).toFixed(1)}%` : '0%');

    return (
        <AdminShell
            title="Free/Paid Boundary and Subscription Suitability"
            description="Assign the correct commercial treatment to every product. Only subscription state enabled when real recurring value is proven."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Kpi label="Total Products" value={kpis.total.toLocaleString()} caption="100% of catalogue" />
                <Kpi label="Paid Products" value={kpis.paid.toLocaleString()} tone="good" caption={`${pct(kpis.paid)} · Revenue eligible`} />
                <Kpi label="Free Lead Products" value={kpis.free} tone="blue" caption={`${pct(kpis.free)} · Marketing & education`} />
                <Kpi label="Reclassify Candidates" value={kpis.reclass} tone="warn" caption={`${pct(kpis.reclass)} · Decision pending`} />
                <Kpi label="Subscription Eligible" value={kpis.subscription} tone="purple" caption={`${pct(kpis.subscription)} · Recurring value proven`} />
            </div>

            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                <h2 className="text-xs font-bold tracking-wide uppercase">Disposition Doctrine (Current v2 Portfolio Treatments)</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {doctrine.map((d) => (
                        <li key={d.code} className="rounded-[6px] border border-parchment-400 p-3">
                            <p className="text-xs font-bold text-gold-700">{d.code}</p>
                            <p className="text-sm font-semibold text-ink-900">{d.name}</p>
                            <p className="mt-0.5 text-[0.6875rem] text-ink-600">{d.body}</p>
                        </li>
                    ))}
                </ul>
                <p className="mt-2 text-[0.6875rem] text-ink-500">DP-RT RETIRE is obsolete in v2 and not used. WORKFLOW_HOLD is an internal state and not published.</p>
            </section>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search by product, version, SKU, disposition..."
                selects={[
                    { key: 'disposition', label: 'All Dispositions', options: doctrine.map((d) => ({ value: d.code, label: `${d.code} ${d.label}` })) },
                    { key: 'subscription', label: 'All Subscription Status', options: ['Enabled', 'Pending', 'Not Applicable'].map((s) => ({ value: s, label: s })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <DataTable
                        columns={['Product & Version', 'SKU', 'Disposition', 'Current State', 'Defensibility', 'Subscription Suitability', 'Recurring Value Evidence', 'Subscription Status', 'Last Review', 'Next Review', 'Actions']}
                        rows={rows.map((r) => [
                            <span>
                                <span className="font-semibold text-ink-900">{r.name}</span>
                                {r.version && <span className="block text-ink-500">v{r.version}</span>}
                            </span>,
                            <span className="font-mono text-[0.625rem]">{r.sku}</span>,
                            <label>
                                <span className="sr-only">Disposition for {r.name}</span>
                                <select
                                    value={r.disposition}
                                    onChange={(e) => act(`${base}/${r.slug}/disposition`, { disposition: e.target.value }, `Change ${r.name} to ${e.target.value}?`)}
                                    className="h-8 rounded border border-parchment-500 bg-white px-1 text-xs font-semibold"
                                >
                                    {doctrine.map((d) => (
                                        <option key={d.code} value={d.code}>
                                            {d.code}
                                        </option>
                                    ))}
                                </select>
                            </label>,
                            r.state,
                            r.defensibility ? <DpStatus status={r.defensibility} className={r.defensibility.startsWith('D1') ? 'border-risk-500/40 bg-risk-50 text-risk-700' : r.defensibility.startsWith('D2') ? 'border-attested-500/40 bg-attested-50 text-attested-700' : 'border-verified-500/40 bg-verified-50 text-verified-700'} /> : '—',
                            r.suitable ? 'Yes' : 'No',
                            r.evidence,
                            <DpStatus status={r.subscription} />,
                            r.lastReview ?? '—',
                            r.nextReview ?? '—',
                            r.subscription === 'Enabled' ? (
                                <Btn onClick={() => act(`${base}/${r.slug}/subscription`, { action: 'disable' })}>Set Pending</Btn>
                            ) : r.disposition !== 'DP-FR' ? (
                                <Btn tone="gold" onClick={() => act(`${base}/${r.slug}/subscription`, { action: 'enable' })}>Enable Subscription</Btn>
                            ) : (
                                <span className="text-ink-400">N/A</span>
                            ),
                        ])}
                    />
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    <SideCard title="Portfolio Distribution">
                        <Donut centre={kpis.total.toLocaleString()} caption="Total Products" size={120} segments={doctrine.map((d, i) => ({ label: `${d.code} ${d.label}`, value: d.count, color: CHART[i] }))} />
                    </SideCard>
                    <SideCard title="Subscription Suitability Check">
                        <div className="space-y-2.5">
                            {suitability.map((s) => (
                                <Meter key={s.label} label={s.label} value={s.value} tone={s.value >= 70 ? 'good' : s.value >= 50 ? 'warn' : 'bad'} />
                            ))}
                        </div>
                    </SideCard>
                    <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700">
                        A paid disposition needs GATE-DP-01 PASS and DSS ≥ 20. Subscription state is enabled only when evidence of recurring updates exists.
                    </p>
                </div>
            </div>
        </AdminShell>
    );
}

Portfolio.layout = null;
