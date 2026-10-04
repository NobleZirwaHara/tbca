import { router } from '@inertiajs/react';
import AdminShell, { Btn, Kpi, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { LicenceDots, QueueFilters, QuickActions, type DpIpRow } from '@/Components/Products/Digital/Console';
import { CHART, DataTable, Donut, DpStatus, Pager } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';

interface Props {
    rows: DpIpRow[];
    pagination: DpPagination;
    kpis: { awaiting_evidence: number; in_review: number; cleared: number; blocked: number; total: number };
    health: { label: string; value: number }[];
    filters: Record<string, string>;
}

const STATUS = [
    ['awaiting_evidence', 'Awaiting Evidence'],
    ['in_review', 'In Review'],
    ['cleared', 'Cleared'],
    ['blocked', 'Blocked'],
] as const;

/** GATE-DP-03 clearance actions allowed from each status (mirrors AdminActionController::clearance). */
function actionsFor(r: DpIpRow): { action: string; label: string; tone?: 'gold' | 'danger'; confirm?: string }[] {
    switch (r.clearance) {
        case 'awaiting_evidence':
            return [
                { action: 'evidence_received', label: 'Evidence Received' },
                ...(r.ref ? [{ action: 'start_review', label: 'Start Legal Review' }] : []),
                { action: 'request_evidence', label: 'Re-request Evidence' },
            ];
        case 'in_review':
            return [
                { action: 'clear', label: 'Clear (GATE-DP-03)', tone: 'gold' },
                { action: 'block', label: 'Block', tone: 'danger', confirm: 'Block this product? It cannot be commercialised.' },
                { action: 'request_evidence', label: 'Request Evidence' },
            ];
        case 'cleared':
            return r.listed ? [{ action: 'unlist', label: 'Unlist' }] : [{ action: 'list', label: 'List on Marketplace', tone: 'gold' }];
        default:
            return [{ action: 'request_evidence', label: 'Request Provider Evidence' }];
    }
}

export default function MarketplaceIp({ rows, pagination, kpis, health, filters }: Props) {
    const base = '/admin/products/digital/marketplace-ip';
    const pct = (n: number) => (kpis.total ? ((n / kpis.total) * 100).toFixed(1) : '0.0');

    return (
        <AdminShell title="Marketplace IP Clearance Queue" description="Verify rights chain and clear marketplace-authored products before commercial release.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Kpi label="Total Marketplace Products" value={kpis.total} caption="Exact cohort" dark />
                <Kpi label="Awaiting Evidence" value={kpis.awaiting_evidence} tone="warn" caption={`${pct(kpis.awaiting_evidence)}% · Provider action required`} />
                <Kpi label="In Review" value={kpis.in_review} tone="blue" caption={`${pct(kpis.in_review)}% · Legal / IP review`} />
                <Kpi label="Cleared (GATE-DP-03 PASS)" value={kpis.cleared} tone="good" caption={`${pct(kpis.cleared)}% · Ready for release`} />
                <Kpi label="Blocked / Failed" value={kpis.blocked} tone="bad" caption={`${pct(kpis.blocked)}% · Cannot be commercialised`} />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search by product, provider, SKU..."
                selects={[
                    { key: 'clearance', label: 'All Clearance Status', options: STATUS.map(([v, l]) => ({ value: v, label: l })) },
                    { key: 'authorship', label: 'All Authorship Classes', options: ['A2', 'A3', 'A4', 'A5'].map((a) => ({ value: a, label: a })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <DataTable
                        columns={['Product & Version', 'SKU', 'Provider / Author', 'Auth. Class', 'Rights Instrument (ID / Date)', 'Licence Classes (L1–L5)', 'Third-Party Clearance', 'AI Assistance Class', 'Clearance Status (GATE-DP-03)', 'Listed State', 'Actions']}
                        rows={rows.map((r) => [
                            <span>
                                <span className="font-semibold text-ink-900">{r.product}</span>
                                <span className="block text-ink-500">{r.version}</span>
                            </span>,
                            <span className="font-mono text-[0.6875rem]">{r.sku}</span>,
                            r.provider ?? '—',
                            <span className="font-bold">{r.authorship}</span>,
                            r.ref ? (
                                <span>
                                    {r.ref}
                                    <span className="block text-ink-500">{r.instrumentDate}</span>
                                </span>
                            ) : (
                                <span className="text-risk-700">— No instrument</span>
                            ),
                            <LicenceDots classes={r.classes} />,
                            <DpStatus status={r.thirdParty} />,
                            <span className={r.ai === 'AI-X' ? 'font-bold text-risk-700' : ''}>{r.ai}</span>,
                            <DpStatus status={r.clearance} />,
                            r.listed ? <DpStatus status="listed" /> : <span className="text-ink-500">Not Listed</span>,
                            <span className="flex flex-col gap-1">
                                {actionsFor(r).map((a) => (
                                    <Btn key={a.action} tone={a.tone ?? 'outline'} onClick={() => act(`${base}/${r.id}/clearance`, { action: a.action }, a.confirm)}>
                                        {a.label}
                                    </Btn>
                                ))}
                            </span>,
                        ])}
                    />
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    <SideCard title="Clearance Checklist">
                        <Donut
                            centre={kpis.total}
                            caption="Total"
                            size={120}
                            segments={[
                                { label: 'Cleared', value: kpis.cleared, color: CHART[0] },
                                { label: 'In Review', value: kpis.in_review, color: CHART[1] },
                                { label: 'Awaiting Evidence', value: kpis.awaiting_evidence, color: CHART[2] },
                                { label: 'Blocked', value: kpis.blocked, color: CHART[5] },
                            ]}
                        />
                    </SideCard>
                    <SideCard title="Queue Health">
                        <ul className="space-y-1.5 text-xs">
                            {health.map((h) => (
                                <li key={h.label} className="flex justify-between gap-2">
                                    <span className="text-ink-700">{h.label}</span>
                                    <span className={h.value > 0 ? 'font-bold text-risk-700' : 'font-bold text-verified-700'}>{h.value}</span>
                                </li>
                            ))}
                        </ul>
                    </SideCard>
                    <SideCard title="Quick Actions">
                        <QuickActions
                            items={[
                                { title: 'Awaiting provider evidence', body: 'Show products waiting on providers.', onClick: () => router.get(base, { clearance: 'awaiting_evidence' }) },
                                { title: 'Open Legal Review Queue', body: 'Products in legal / IP review.', onClick: () => router.get(base, { clearance: 'in_review' }) },
                                { title: 'View Provider Agreements', body: 'Full licence & IP chain ledger.', onClick: () => router.get('/admin/products/digital/rights') },
                                { title: 'Blocked products', body: 'Cannot be commercialised.', onClick: () => router.get(base, { clearance: 'blocked' }) },
                            ]}
                        />
                    </SideCard>
                    <p className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs text-attested-700">
                        Marketplace default state is IP_EVIDENCE_HOLD: zero products are auto-cleared. Only CLEARED products may be listed.
                    </p>
                </div>
            </div>
        </AdminShell>
    );
}

MarketplaceIp.layout = null;
