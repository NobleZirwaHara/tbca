import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { DataTable, DpStatus } from '@/Components/Products/Digital/Ui';
import { formatZar } from '@/lib/money';

interface CaseRow {
    id: number;
    reference: string;
    kind: string;
    reason: string;
    description: string | null;
    outcome: string | null;
    status: string;
    amount: number | null;
    legal: string | null;
    downloaded: boolean;
    downloads: number;
    holder: string | null;
    product: string | null;
    entitlement: string | null;
    entitlementStatus: string | null;
    created: string;
    note: string | null;
    evidence: boolean;
}

const BASES = ['Statutory remedy (ECTA / CPA)', 'TBCA-failure remedy', 'Goodwill (discretionary)', 'No remedy due'];

export default function Cases({ cases, filters }: { cases: CaseRow[]; filters: { status: string } }) {
    const base = '/admin/products/digital/cases';
    const [selected, setSelected] = useState<CaseRow | null>(cases.find((c) => ['submitted', 'under_review'].includes(c.status)) ?? cases[0] ?? null);
    const [legal, setLegal] = useState('');
    const [note, setNote] = useState('');
    const open = cases.filter((c) => ['submitted', 'under_review'].includes(c.status)).length;

    const decide = (action: string) => {
        if (!selected) return;
        act(`${base}/${selected.id}/decide`, { action, legal_state: legal || null, note: note || null }, action === 'approve' && selected.kind === 'refund' ? 'Approving revokes the entitlement and records a refund. Continue?' : undefined);
    };

    return (
        <AdminShell title="Refund & Product Issue Cases" description="Controlled refund and product-issue decisions. Statutory and TBCA-failure remedies are assessed before any goodwill decision.">
            <div className="grid gap-3 sm:grid-cols-4">
                <Kpi label="Total Cases" value={cases.length} />
                <Kpi label="Open" value={open} tone="warn" caption="Submitted or under review" />
                <Kpi label="Approved" value={cases.filter((c) => c.status === 'approved').length} tone="good" />
                <Kpi label="Declined" value={cases.filter((c) => c.status === 'declined').length} tone="bad" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <QueryTabs
                        value={filters.status}
                        onChange={(status) => router.get(base, status ? { status } : {}, { preserveScroll: true })}
                        tabs={[
                            { key: '', label: 'All' },
                            { key: 'submitted', label: 'Submitted' },
                            { key: 'under_review', label: 'Under Review' },
                            { key: 'approved', label: 'Approved' },
                            { key: 'declined', label: 'Declined' },
                            { key: 'resolved', label: 'Resolved' },
                        ]}
                    />
                    <div className="mt-3">
                        <DataTable
                            columns={['Case', 'Type', 'Product / Entitlement', 'Holder', 'Reason', 'Downloaded', 'Amount', 'Status', 'Opened', '']}
                            rows={cases.map((c) => [
                                <span className="font-mono text-[0.6875rem] font-semibold">{c.reference}</span>,
                                <span className="capitalize">{c.kind.replace(/_/g, ' ')}</span>,
                                <span>
                                    {c.product ?? '—'}
                                    <span className="block text-ink-500">{c.entitlement}</span>
                                </span>,
                                c.holder ?? '—',
                                c.reason,
                                c.downloaded ? `Yes (${c.downloads})` : 'No',
                                c.amount ? formatZar(c.amount) : '—',
                                <DpStatus status={c.status} />,
                                c.created,
                                <Btn onClick={() => { setSelected(c); setLegal(c.legal ?? ''); setNote(''); }}>Open</Btn>,
                            ])}
                            empty="No refund or product-issue cases."
                        />
                    </div>
                </section>

                {selected && (
                    <SideCard title={`Case ${selected.reference}`}>
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Status</dt><dd><DpStatus status={selected.status} /></dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Entitlement</dt><dd>{selected.entitlement} ({selected.entitlementStatus})</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Requested outcome</dt><dd>{selected.outcome ?? '—'}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Downloaded before request</dt><dd>{selected.downloaded ? 'Yes' : 'No'}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Evidence attached</dt><dd>{selected.evidence ? 'Yes' : 'No'}</dd></div>
                        </dl>
                        {selected.description && <p className="mt-2 rounded bg-parchment-100 p-2 text-xs text-ink-700">{selected.description}</p>}
                        {selected.note && <p className="mt-2 text-xs text-ink-600">Decision note: {selected.note}</p>}

                        {['submitted', 'under_review'].includes(selected.status) && (
                            <div className="mt-3 space-y-2">
                                <label className="block text-xs font-medium text-ink-800">
                                    Remedy basis
                                    <select value={legal} onChange={(e) => setLegal(e.target.value)} className="mt-1 h-9 w-full rounded border border-parchment-500 bg-white px-2 text-xs">
                                        <option value="">Select basis…</option>
                                        {BASES.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-xs font-medium text-ink-800">
                                    Decision note
                                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 min-h-16 w-full rounded border border-parchment-500 p-2 text-xs" />
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {selected.status === 'submitted' && <Btn onClick={() => decide('review')}>Start Review</Btn>}
                                    <Btn tone="gold" onClick={() => decide('approve')}>Approve</Btn>
                                    <Btn tone="danger" onClick={() => decide('decline')}>Decline</Btn>
                                    <Btn onClick={() => decide('resolve')}>Resolve (no refund)</Btn>
                                </div>
                            </div>
                        )}
                    </SideCard>
                )}
            </div>
        </AdminShell>
    );
}

Cases.layout = null;
