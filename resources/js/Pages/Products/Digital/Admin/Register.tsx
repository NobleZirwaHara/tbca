import { router } from '@inertiajs/react';
import { Check, CircleDashed, Minus, X } from 'lucide-react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { Meter, QueueFilters, QuickActions } from '@/Components/Products/Digital/Console';
import { DataTable, DpStatus, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';

interface Row {
    id: number;
    reference: string;
    product: string;
    version: string;
    acquired: string;
    holder: string;
    email: string;
    order: string | null;
    date: string | null;
    licence: string;
    licenceShort: string;
    terms: string | null;
    status: string;
    available: boolean;
    downloaded: boolean;
    latest: string | null;
    accessed: string;
    notification: string;
    correction: string;
    updatedAt: string;
}

interface Props {
    rows: Row[];
    pagination: DpPagination;
    kpis: {
        total: number;
        entitled: number;
        available: number;
        downloaded: number;
        currentAccessed: number;
        downloadEvents: number;
        corrected: number;
        notifRate: number;
        integrity: number;
        openCorrections: number;
    };
    filters: Record<string, string> & { tab: string };
    products: { value: string; label: string }[];
}

const Yes = () => <Check className="size-4 text-verified-600" aria-label="Yes" />;
const No = () => <Minus className="size-4 text-ink-400" aria-label="No" />;

export default function Register({ rows, pagination, kpis, filters, products }: Props) {
    const base = '/admin/products/digital/versions';
    const nav = useQueryNav(base, filters);
    const pct = (n: number) => (kpis.total ? ((n / kpis.total) * 100).toFixed(1) : '0.0');
    const currentPct = kpis.downloadEvents ? Math.round((kpis.currentAccessed / kpis.downloadEvents) * 1000) / 10 : 0;

    return (
        <AdminShell title="Version, Holder and Download Register" description="Complete visibility of entitlements, versions, holders and download events.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Total Entitlements" value={kpis.total.toLocaleString()} caption="Across all products" />
                <Kpi label="Entitled" value={kpis.entitled.toLocaleString()} tone="good" caption={`${pct(kpis.entitled)}%`} />
                <Kpi label="Available (Not Downloaded)" value={kpis.available.toLocaleString()} tone="blue" caption={`${pct(kpis.available)}%`} />
                <Kpi label="Downloaded" value={kpis.downloaded.toLocaleString()} tone="good" caption={`${pct(kpis.downloaded)}%`} />
                <Kpi label="Current Version Accessed" value={kpis.currentAccessed.toLocaleString()} caption={`${currentPct}% of downloads`} />
                <Kpi label="Corrected / Superseded" value={kpis.corrected.toLocaleString()} tone="bad" caption={`${pct(kpis.corrected)}%`} />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search by product, holder, email, order, entitlement..."
                selects={[
                    { key: 'product', label: 'All Products', options: products },
                    { key: 'licence', label: 'All Licence Classes', options: ['L1', 'L2', 'L3', 'L4', 'L5'].map((l) => ({ value: l, label: l })) },
                    { key: 'status', label: 'All Entitlement Status', options: ['active', 'legacy', 'suspended', 'revoked', 'refunded'].map((s) => ({ value: s, label: s })) },
                    { key: 'download', label: 'All Download Status', options: [{ value: 'downloaded', label: 'Downloaded' }, { value: 'not', label: 'Not downloaded' }] },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <QueryTabs
                        value={filters.tab}
                        onChange={(tab) => nav({ tab })}
                        tabs={[
                            { key: 'entitlements', label: 'Entitlements & Downloads' },
                            { key: 'currentness', label: 'Version Currentness' },
                            { key: 'corrections', label: 'Correction Impact' },
                            { key: 'notifications', label: 'Holder Notifications' },
                        ]}
                    />
                    <div className="mt-3">
                        <DataTable
                            columns={['Entitlement ID', 'Product & Version', 'Holder', 'Order & Date', 'Licence', 'Terms Version', 'Entitlement Status', 'Available', 'Downloaded', 'Latest Download', 'Version Accessed', 'Notifications', 'Correction State', 'Actions']}
                            rows={rows.map((r) => [
                                <span className="font-mono text-[0.6875rem] font-semibold">{r.reference}</span>,
                                <span>
                                    <span className="font-semibold text-ink-900">{r.product}</span>
                                    <span className="block text-ink-500">{r.version}</span>
                                    <span className="block text-[0.625rem] text-ink-400">Acquired {r.acquired}</span>
                                </span>,
                                <span>
                                    {r.holder}
                                    <span className="block text-ink-500">{r.email}</span>
                                </span>,
                                <span>
                                    {r.order ?? '—'}
                                    <span className="block text-ink-500">{r.date}</span>
                                </span>,
                                <span>
                                    <span className="font-bold">{r.licence}</span> {r.licenceShort}
                                </span>,
                                r.terms ?? '—',
                                <DpStatus status={r.status} />,
                                r.available ? <Yes /> : <X className="size-4 text-risk-600" aria-label="No access" />,
                                r.downloaded ? <Yes /> : <No />,
                                r.latest ?? '—',
                                r.accessed,
                                r.notification === 'delivered' ? <Yes /> : <DpStatus status={r.notification} />,
                                <span>
                                    {r.correction}
                                    <span className="block text-[0.625rem] text-ink-400">{r.updatedAt}</span>
                                </span>,
                                <span className="flex flex-col gap-1">
                                    {r.notification !== 'delivered' && <Btn onClick={() => act(`${base}/${r.id}/notify`)}>Resend Notice</Btn>}
                                    {r.correction !== 'Delivered' && r.available && (
                                        <Btn tone="gold" onClick={() => act(`${base}/${r.id}/correction`, {}, `Link ${r.reference} to the current controlled version?`)}>
                                            Apply Correction
                                        </Btn>
                                    )}
                                </span>,
                            ])}
                        />
                    </div>
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    <SideCard title="Register Health">
                        <div className="space-y-2.5">
                            <Meter label="Entitlement Integrity" value={kpis.integrity} />
                            <Meter label="Version Currentness" value={currentPct} tone={currentPct >= 85 ? 'good' : 'warn'} />
                            <Meter label="Notification Delivery" value={kpis.notifRate} tone={kpis.notifRate >= 95 ? 'good' : 'warn'} />
                            <Meter label="Open Corrections" value={kpis.total ? (kpis.openCorrections / kpis.total) * 100 : 0} display={kpis.openCorrections} tone="bad" />
                        </div>
                    </SideCard>
                    <SideCard title="Status Legend">
                        <ul className="space-y-1.5 text-xs text-ink-700">
                            <li className="flex items-center gap-2"><Yes /> Entitled – Access granted</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-controlled-600" aria-hidden="true" /> Downloaded – Artefact delivered</li>
                            <li className="flex items-center gap-2"><CircleDashed className="size-4 text-attested-600" aria-hidden="true" /> Available – Not yet downloaded</li>
                            <li className="flex items-center gap-2"><X className="size-4 text-risk-600" aria-hidden="true" /> No Access – Suspended / Revoked</li>
                            <li className="flex items-center gap-2"><Minus className="size-4 text-ink-400" aria-hidden="true" /> Legacy – Read-only entitlement</li>
                        </ul>
                    </SideCard>
                    <SideCard title="Quick Actions">
                        <QuickActions
                            items={[
                                { title: 'Holders needing notices', body: 'Send update or correction notices.', onClick: () => nav({ tab: 'notifications' }) },
                                { title: 'Apply Correction to Entitlements', body: 'Link corrected version to entitlements.', onClick: () => nav({ tab: 'corrections' }) },
                                { title: 'Superseded versions', body: 'Holders not on the current version.', onClick: () => nav({ tab: 'currentness' }) },
                                { title: 'Refund & issue cases', body: 'Suspended entitlements and refunds.', onClick: () => router.get('/admin/products/digital/cases') },
                            ]}
                        />
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

Register.layout = null;
