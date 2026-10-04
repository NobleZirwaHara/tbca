import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { QueueFilters } from '@/Components/Products/Digital/Console';
import { DataTable, DpStatus, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface ClaimRow {
    id: number;
    reference: string;
    product: string;
    version: string;
    claim: string;
    type: string;
    source: string | null;
    sourceDetail: string | null;
    status: string;
    priority: string;
    due: string | null;
    overdue: boolean;
    reviewer: string | null;
    evidence: boolean;
    note: string | null;
}

interface Props {
    rows: ClaimRow[];
    pagination: DpPagination;
    kpis: { total: number; pending: number; orphan: number; overdue: number; verified: number; rejected: number; inReview: number };
    filters: Record<string, string> & { tab: string };
    productNames: string[];
    reviewers: string[];
    products: { value: string; label: string }[];
}

const TYPES = ['Feature', 'Statistic', 'Outcome', 'Suitability', 'Legal', 'Other'];
const TYPE_HELP: Record<string, string> = {
    Feature: 'Product capability or functionality',
    Statistic: 'Data, numbers or quantified information',
    Outcome: 'Results or performance claims',
    Suitability: 'Use-case or applicability statements',
    Legal: 'Legal, compliance or regulatory statements',
    Other: 'Other claim types',
};

export default function Claims({ rows, pagination, kpis, filters, productNames, reviewers, products }: Props) {
    const base = '/admin/products/digital/claims';
    const nav = useQueryNav(base, filters);
    const [selected, setSelected] = useState<ClaimRow | null>(null);
    const [creating, setCreating] = useState(false);
    const form = useForm({ product: products[0]?.value ?? '', claim: '', type: 'Feature', source: '', source_detail: '', priority: 'medium', review_due: '' });

    const doAction = (c: ClaimRow, action: string) => act(`${base}/${c.id}/status`, { action }, action === 'reject' ? `Reject ${c.reference}? The product cannot be released until it is corrected.` : undefined);

    return (
        <AdminShell
            title="Claim and Statistic Verification Queue"
            description="Eliminate unsupported claims. No product can be released with orphan claims."
            actions={
                <Btn tone="gold" onClick={() => setCreating(true)}>
                    <CirclePlus className="size-4" aria-hidden="true" /> New Claim Submission
                </Btn>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Total Claims" value={kpis.total.toLocaleString()} caption="Across all products" />
                <Kpi label="Pending Verification" value={kpis.pending} tone="warn" caption="Needs human review" />
                <Kpi label="Orphan Claims" value={kpis.orphan} tone={kpis.orphan === 0 ? 'good' : 'bad'} caption="Must be zero before release" />
                <Kpi label="Overdue Reviews" value={kpis.overdue} tone="bad" caption="Past review due date" />
                <Kpi label="Verified Claims" value={kpis.verified.toLocaleString()} tone="good" caption="With supporting evidence" />
                <Kpi label="Rejected Claims" value={kpis.rejected} tone="bad" caption="Requires correction" />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search claims, products, versions, authors..."
                selects={[
                    { key: 'type', label: 'All Claim Types', options: TYPES.map((t) => ({ value: t, label: t })) },
                    { key: 'product', label: 'All Products', options: productNames.map((p) => ({ value: p, label: p })) },
                    { key: 'reviewer', label: 'All Reviewers', options: reviewers.map((r) => ({ value: r, label: r })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <QueryTabs
                        value={filters.tab}
                        onChange={(tab) => nav({ tab })}
                        tabs={[
                            { key: 'all', label: 'All Claims', count: kpis.total },
                            { key: 'pending', label: 'Pending', count: kpis.pending },
                            { key: 'in_review', label: 'In Review', count: kpis.inReview },
                            { key: 'overdue', label: 'Overdue', count: kpis.overdue },
                            { key: 'verified', label: 'Verified', count: kpis.verified },
                            { key: 'rejected', label: 'Rejected', count: kpis.rejected },
                        ]}
                    />
                    <div className="mt-3">
                        <DataTable
                            columns={['Claim ID', 'Product & Version', 'Exact Claim (EN)', 'Claim Type', 'Source', 'Status', 'Priority', 'Review Due', 'Reviewer', '']}
                            rows={rows.map((c) => [
                                <button type="button" onClick={() => setSelected(c)} className="font-mono text-[0.6875rem] font-semibold text-gold-700 hover:underline">
                                    {c.reference}
                                </button>,
                                <span>
                                    <span className="font-semibold text-ink-900">{c.product}</span>
                                    <span className="block text-ink-500">{c.version}</span>
                                </span>,
                                <span className="block max-w-[16rem]">&ldquo;{c.claim}&rdquo;</span>,
                                c.type,
                                <span>
                                    {c.source ?? 'Internal Content'}
                                    {c.sourceDetail && <span className="block text-ink-500">{c.sourceDetail}</span>}
                                </span>,
                                <span className="space-y-1">
                                    <DpStatus status={c.status} />
                                    {!c.evidence && c.status !== 'rejected' && <DpStatus status="orphan" className="ml-1" />}
                                </span>,
                                <DpStatus status={c.priority} />,
                                <span className={cn(c.overdue && 'font-semibold text-risk-700')}>{c.due ?? '—'}</span>,
                                c.reviewer ?? '—',
                                <Btn onClick={() => setSelected(c)}>Review</Btn>,
                            ])}
                        />
                    </div>
                    <Pager pagination={pagination} />
                </section>

                <div className="space-y-4">
                    {selected ? (
                        <SideCard title={`Claim ${selected.reference}`}>
                            <p className="text-[0.8125rem] text-ink-900">&ldquo;{selected.claim}&rdquo;</p>
                            <dl className="mt-3 space-y-1 text-xs">
                                <div className="flex justify-between"><dt className="text-ink-500">Product</dt><dd>{selected.product} {selected.version}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">Type</dt><dd>{selected.type}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">Evidence</dt><dd>{selected.evidence ? 'Attached' : 'None (orphan)'}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">Status</dt><dd><DpStatus status={selected.status} /></dd></div>
                            </dl>
                            {selected.note && <p className="mt-2 rounded bg-parchment-100 p-2 text-[0.6875rem] text-ink-600">{selected.note}</p>}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {!selected.evidence && <Btn onClick={() => doAction(selected, 'attach_evidence')}>Attach Evidence</Btn>}
                                {selected.status === 'pending' && <Btn onClick={() => doAction(selected, 'start_review')}>Start Review</Btn>}
                                {['pending', 'in_review'].includes(selected.status) && (
                                    <>
                                        <Btn tone="gold" onClick={() => doAction(selected, 'verify')}>Verify</Btn>
                                        <Btn tone="danger" onClick={() => doAction(selected, 'reject')}>Reject</Btn>
                                    </>
                                )}
                                {['verified', 'rejected'].includes(selected.status) && <Btn onClick={() => doAction(selected, 'reopen')}>Reopen</Btn>}
                            </div>
                        </SideCard>
                    ) : (
                        <SideCard title="Select a claim to review">
                            <p className="text-xs text-ink-600">Choose a claim from the queue to view full details, evidence, and take verification action.</p>
                        </SideCard>
                    )}
                    <SideCard title="Verification Principles">
                        <ul className="list-disc space-y-1 pl-4 text-xs text-ink-700">
                            <li>Every claim must have traceable evidence.</li>
                            <li>Claims must be current for South African use.</li>
                            <li>Orphan claims must equal zero before release.</li>
                            <li>All decisions are immutable and auditable.</li>
                        </ul>
                    </SideCard>
                    <SideCard title="Claim Types">
                        <dl className="space-y-1 text-xs">
                            {TYPES.map((t) => (
                                <div key={t}>
                                    <dt className="inline font-semibold text-ink-900">{t}: </dt>
                                    <dd className="inline text-ink-600">{TYPE_HELP[t]}</dd>
                                </div>
                            ))}
                        </dl>
                    </SideCard>
                </div>
            </div>

            <Modal
                open={creating}
                onClose={() => setCreating(false)}
                title="New Claim Submission"
                footer={
                    <Btn tone="gold" disabled={form.processing} onClick={() => form.post(base, { preserveScroll: true, onSuccess: () => { setCreating(false); form.reset(); } })}>
                        Submit Claim
                    </Btn>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Product" error={form.errors.product} required className="sm:col-span-2">
                        {(id) => <Select id={id} value={form.data.product} onChange={(e) => form.setData('product', e.target.value)} options={products} />}
                    </Field>
                    <Field label="Exact claim (EN)" error={form.errors.claim} required className="sm:col-span-2">
                        {(id) => <Textarea id={id} value={form.data.claim} onChange={(e) => form.setData('claim', e.target.value)} />}
                    </Field>
                    <Field label="Claim type" error={form.errors.type} required>
                        {(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={TYPES} />}
                    </Field>
                    <Field label="Priority" error={form.errors.priority} required>
                        {(id) => <Select id={id} value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)} options={['high', 'medium', 'low']} />}
                    </Field>
                    <Field label="Source" error={form.errors.source}>
                        {(id) => <Input id={id} value={form.data.source} onChange={(e) => form.setData('source', e.target.value)} />}
                    </Field>
                    <Field label="Source detail" error={form.errors.source_detail}>
                        {(id) => <Input id={id} value={form.data.source_detail} onChange={(e) => form.setData('source_detail', e.target.value)} />}
                    </Field>
                    <Field label="Review due" error={form.errors.review_due} required>
                        {(id) => <Input id={id} type="date" value={form.data.review_due} onChange={(e) => form.setData('review_due', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </AdminShell>
    );
}

Claims.layout = null;
