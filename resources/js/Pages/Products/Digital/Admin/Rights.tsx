import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import AdminShell, { Btn, Kpi, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { AUTHORSHIP, LicenceDots, Meter, QueueFilters, QuickActions, type DpIpRow } from '@/Components/Products/Digital/Console';
import { CHART, DataTable, Donut, DpStatus, Pager } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';

interface Props {
    rows: DpIpRow[];
    pagination: DpPagination;
    kpis: { products: number; licences: number; complete: number; expiring: number };
    byClass: { key: string; label: string; count: number }[];
    health: { key: string; label: string; count: number }[];
    filters: Record<string, string>;
    products: { value: string; label: string }[];
}

const IP_LABEL: Record<string, [string, string]> = {
    cleared: ['Cleared', 'Full Chain'],
    partial: ['Partial', 'Pending Clearance'],
    at_risk: ['At Risk', 'Action Required'],
};

export default function Rights({ rows, pagination, kpis, byClass, health, filters, products }: Props) {
    const base = '/admin/products/digital/rights';
    const [adding, setAdding] = useState(false);
    const form = useForm({
        product_name: products[0]?.label ?? '',
        version_label: 'v1.0',
        sku: '',
        provider: '',
        marketplace: false,
        authorship_class: 'A1',
        instrument_type: 'Employment Contract',
        instrument_ref: '',
        third_party: 'PASS',
        ai_class: 'AI-0',
        classes: ['L1', 'L2'] as string[],
    });
    const healthTotal = health.reduce((s, h) => s + h.count, 0) || 1;
    const toggleClass = (c: string) => form.setData('classes', form.data.classes.includes(c) ? form.data.classes.filter((x) => x !== c) : [...form.data.classes, c]);

    return (
        <AdminShell
            title="Licence and IP Chain Ledger"
            description="Prove saleable rights for every Digital Product. Trace authorship to buyer entitlement."
            actions={
                <Btn tone="gold" onClick={() => setAdding(true)}>
                    <CirclePlus className="size-4" aria-hidden="true" /> Add New Record
                </Btn>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label="Total Products" value={kpis.products.toLocaleString()} caption="With IP chain recorded" />
                <Kpi label="Licences Active" value={kpis.licences.toLocaleString()} caption="Across all products" />
                <Kpi label="IP Chain Complete" value={kpis.complete.toLocaleString()} tone="good" caption={`${kpis.products ? ((kpis.complete / kpis.products) * 100).toFixed(1) : 0}% complete`} />
                <Kpi label="Licences Expiring" value={kpis.expiring} tone="bad" caption="Within 90 days" />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search products, versions, authors, licence..."
                selects={[
                    { key: 'licence', label: 'All Licence Classes', options: ['L1', 'L2', 'L3', 'L4', 'L5'].map((l) => ({ value: l, label: l })) },
                    { key: 'authorship', label: 'All Authorship Classes', options: Object.entries(AUTHORSHIP).map(([k, v]) => ({ value: k, label: `${k} ${v}` })) },
                    { key: 'ip', label: 'All IP Status', options: Object.entries(IP_LABEL).map(([k, v]) => ({ value: k, label: v[0] })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <h2 className="mb-3 text-xs font-bold tracking-wide uppercase">Licence &amp; IP Chain Register ({pagination.total.toLocaleString()})</h2>
                    <DataTable
                        columns={['Product & Version', 'Authorship Class', 'Rights Instrument', 'IP Status', 'Licence Classes Permitted', 'Licence Version', 'Jurisdiction', 'Last Review', 'Next Review', 'Actions']}
                        rows={rows.map((r) => [
                            <span>
                                <span className="font-semibold text-ink-900">{r.product}</span>
                                <span className="block text-ink-500">{r.version}</span>
                            </span>,
                            <span>
                                <span className="font-bold">{r.authorship}</span> {AUTHORSHIP[r.authorship]}
                            </span>,
                            r.ref ? (
                                <span>
                                    {r.instrument}
                                    <span className="block text-ink-500">Ref: {r.ref}</span>
                                </span>
                            ) : (
                                <span className="text-risk-700">No instrument</span>
                            ),
                            <span>
                                <DpStatus status={IP_LABEL[r.ip]?.[0] ?? r.ip} />
                                <span className="block text-[0.6875rem] text-ink-500">{IP_LABEL[r.ip]?.[1]}</span>
                            </span>,
                            <LicenceDots classes={r.classes} />,
                            <span>
                                {r.licenceVersion ?? '—'}
                                {r.effective && <span className="block text-ink-500">Effective {r.effective}</span>}
                            </span>,
                            r.jurisdiction ?? 'South Africa',
                            <span>
                                {r.lastReview ?? '—'}
                                {r.reviewer && <span className="block text-ink-500">{r.reviewer}</span>}
                            </span>,
                            r.nextReview ?? '—',
                            <span className="flex flex-col gap-1">
                                {r.ip !== 'cleared' && <Btn onClick={() => act(`${base}/${r.id}/status`, { ip_status: 'cleared' })}>Mark Cleared</Btn>}
                                {r.ip !== 'partial' && <Btn onClick={() => act(`${base}/${r.id}/status`, { ip_status: 'partial' })}>Set Partial</Btn>}
                                {r.ip !== 'at_risk' && (
                                    <Btn tone="danger" onClick={() => act(`${base}/${r.id}/status`, { ip_status: 'at_risk' }, 'Flag this chain At Risk? Non-TBCA products stop sale until cleared.')}>
                                        Flag At Risk
                                    </Btn>
                                )}
                            </span>,
                        ])}
                    />
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    <SideCard title="Licence Classes (Active Entitlements)">
                        <Donut centre={kpis.licences.toLocaleString()} caption="Total Licences" segments={byClass.map((c, i) => ({ label: c.label, value: c.count, color: CHART[i] }))} size={120} />
                    </SideCard>
                    <SideCard title="IP Chain Health">
                        <div className="space-y-2.5">
                            {health.map((h) => (
                                <Meter key={h.key} label={h.label} value={Math.round((h.count / healthTotal) * 100)} display={`${h.count} (${((h.count / healthTotal) * 100).toFixed(1)}%)`} tone={h.key === 'cleared' ? 'good' : h.key === 'partial' ? 'warn' : 'bad'} />
                            ))}
                        </div>
                    </SideCard>
                    <SideCard title="Quick Actions">
                        <QuickActions
                            items={[
                                { title: 'Add New Product IP Record', body: 'Create a new licence & IP chain entry.', onClick: () => setAdding(true) },
                                { title: 'Request Third-Party Clearance', body: 'Track clearance in the marketplace queue.', onClick: () => router.get('/admin/products/digital/marketplace-ip') },
                                { title: 'Review Expiring Rights', body: 'See rights and reviews due soon.', onClick: () => router.get(base, { ip: 'partial' }) },
                                { title: 'Review At-Risk Chains', body: 'Chains needing action before sale.', onClick: () => router.get(base, { ip: 'at_risk' }) },
                            ]}
                        />
                    </SideCard>
                </div>
            </div>

            <Modal
                open={adding}
                onClose={() => setAdding(false)}
                title="Add New Product IP Record"
                size="lg"
                footer={
                    <Btn tone="gold" disabled={form.processing} onClick={() => form.post(base, { preserveScroll: true, onSuccess: () => { setAdding(false); form.reset(); } })}>
                        Create Record
                    </Btn>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Product name" error={form.errors.product_name} required>
                        {(id) => <Select id={id} value={form.data.product_name} onChange={(e) => form.setData('product_name', e.target.value)} options={products.map((p) => p.label)} />}
                    </Field>
                    <Field label="Version label" error={form.errors.version_label} required>
                        {(id) => <Input id={id} value={form.data.version_label} onChange={(e) => form.setData('version_label', e.target.value)} />}
                    </Field>
                    <Field label="SKU" error={form.errors.sku} required>
                        {(id) => <Input id={id} value={form.data.sku} onChange={(e) => form.setData('sku', e.target.value)} />}
                    </Field>
                    <Field label="Provider / author" error={form.errors.provider}>
                        {(id) => <Input id={id} value={form.data.provider} onChange={(e) => form.setData('provider', e.target.value)} />}
                    </Field>
                    <Field label="Authorship class" error={form.errors.authorship_class} required>
                        {(id) => <Select id={id} value={form.data.authorship_class} onChange={(e) => form.setData('authorship_class', e.target.value)} options={Object.entries(AUTHORSHIP).map(([k, v]) => ({ value: k, label: `${k} ${v}` }))} />}
                    </Field>
                    <Field label="Rights instrument type" error={form.errors.instrument_type}>
                        {(id) => <Select id={id} value={form.data.instrument_type} onChange={(e) => form.setData('instrument_type', e.target.value)} options={['Employment Contract', 'Licence Agreement', 'Assignment Deed', 'Third-Party Clearance']} />}
                    </Field>
                    <Field label="Instrument reference" error={form.errors.instrument_ref} hint="Leave blank if not yet executed.">
                        {(id) => <Input id={id} value={form.data.instrument_ref} onChange={(e) => form.setData('instrument_ref', e.target.value)} />}
                    </Field>
                    <Field label="Third-party clearance" error={form.errors.third_party} required>
                        {(id) => <Select id={id} value={form.data.third_party} onChange={(e) => form.setData('third_party', e.target.value)} options={['PASS', 'PENDING', 'NONE', 'FAIL']} />}
                    </Field>
                    <Field label="AI assistance class" error={form.errors.ai_class} required>
                        {(id) => <Select id={id} value={form.data.ai_class} onChange={(e) => form.setData('ai_class', e.target.value)} options={['AI-0', 'AI-1', 'AI-2', 'AI-3', 'AI-X']} />}
                    </Field>
                    <div className="space-y-2">
                        <p className="text-[0.8125rem] font-medium text-ink-800">Licence classes requested</p>
                        <div className="flex flex-wrap gap-3">
                            {['L1', 'L2', 'L3', 'L4', 'L5'].map((c) => (
                                <Checkbox key={c} label={c} checked={form.data.classes.includes(c)} onChange={() => toggleClass(c)} />
                            ))}
                        </div>
                        <Checkbox label="Marketplace-authored product" checked={form.data.marketplace} onChange={(e) => form.setData('marketplace', e.target.checked)} />
                    </div>
                </div>
            </Modal>
        </AdminShell>
    );
}

Rights.layout = null;
