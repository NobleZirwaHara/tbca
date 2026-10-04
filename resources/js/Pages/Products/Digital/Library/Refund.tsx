import { router, useForm } from '@inertiajs/react';
import { CircleCheck, Info, Lock, ShieldCheck, Upload } from 'lucide-react';
import LibraryShell, { EntitlementSummary, HelpPanel } from '@/Components/Products/Digital/LibraryShell';
import { DpStatus } from '@/Components/Products/Digital/Ui';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { DpEntitlement } from '@/Components/Products/Digital/types';

type Selected = DpEntitlement & { amountPaid: number; paymentStatus: string };

const KINDS = [
    { key: 'refund', title: 'Request a Refund', body: 'I would like a refund for this purchase. Review against our Refund & Download Policy.' },
    { key: 'product_issue', title: 'Report a Product Issue', body: "I've found an issue with the content or file. We may replace, correct or provide guidance." },
    { key: 'technical', title: 'Technical Problem', body: "I'm experiencing a problem downloading or opening the file." },
    { key: 'other', title: 'Other Enquiry', body: 'I have another question or need additional support.' },
];

export default function Refund({
    options,
    selected,
    cases,
    reasons,
    outcomes,
}: {
    options: { reference: string; label: string }[];
    selected: Selected | null;
    cases: { reference: string; kind: string; status: string; product: string | null; created: string; outcome: string; note: string | null }[];
    reasons: Record<string, string[]>;
    outcomes: string[];
}) {
    const form = useForm<{ entitlement: string; kind: string; reason: string; description: string; outcome: string; downloaded: boolean | null; evidence: File | null }>({
        entitlement: selected?.reference ?? '',
        kind: 'refund',
        reason: '',
        description: '',
        outcome: '',
        downloaded: selected ? selected.downloads > 0 : null,
        evidence: null,
    });

    if (!selected) {
        return (
            <LibraryShell title="Refund and Product Issue" description="Raise a refund request or report a product issue. We're here to help.">
                <Notice tone="info">You have no digital product entitlements yet.</Notice>
            </LibraryShell>
        );
    }

    return (
        <LibraryShell entitlement={selected} title="Refund and Product Issue" description="Raise a refund request or report a product issue. We're here to help.">
            <div className="grid gap-4 xl:grid-cols-[1fr_360px_260px]">
                <div className="min-w-0 space-y-4">
                    {options.length > 1 && (
                        <label className="flex items-center gap-2 text-xs font-semibold">
                            Product:
                            <select value={selected.reference} onChange={(ev) => router.get('/digital-products/library/refund-and-issue', { entitlement: ev.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] font-normal">
                                {options.map((o) => <option key={o.reference} value={o.reference}>{o.label}</option>)}
                            </select>
                        </label>
                    )}
                    <EntitlementSummary
                        e={selected}
                        title="Your Purchase Summary"
                        extra={[
                            { label: 'Order Reference', value: selected.orderReference },
                            { label: 'Purchased', value: selected.purchasedAt },
                            { label: 'Amount Paid', value: <>{formatZar(selected.amountPaid)} <span className="text-ink-500">(incl. VAT)</span></> },
                            { label: 'Payment Status', value: <span className="capitalize text-verified-700">{selected.paymentStatus}</span> },
                            { label: 'Downloads', value: selected.downloads },
                        ]}
                    />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">What would you like to do?</h2>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup">
                            {KINDS.map((k) => (
                                <button key={k.key} type="button" role="radio" aria-checked={form.data.kind === k.key} onClick={() => form.setData({ ...form.data, kind: k.key, reason: '' })} className={cn('rounded-[6px] border p-3 text-left text-xs', form.data.kind === k.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                    <span className="block font-semibold text-ink-900">{k.title}</span>
                                    <span className="text-ink-500">{k.body}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-xs">
                            <p className="flex gap-2 text-verified-800"><CircleCheck className="size-4" aria-hidden="true" /><span><strong className="block">Before you continue</strong>Please check the Refund & Download Policy and Version Status to ensure your request is eligible.</span></p>
                            <div className="flex gap-2">
                                <a href={`/digital-products/${selected.product.slug}/disclosure`} className="rounded-[4px] border border-verified-600 bg-white px-2 py-1 font-semibold">View Refund Policy</a>
                                <a href={`/digital-products/library/${selected.reference}/version-status`} className="rounded-[4px] border border-verified-600 bg-white px-2 py-1 font-semibold">Check Version Status</a>
                            </div>
                        </div>
                    </section>
                    <Notice tone="gold" icon={Info}>
                        <strong>Important:</strong> Refunds and corrections are governed by our Refund & Download Policy and the Consumer Protection Act. A recorded download is evidence only — it is not an automatic decline.
                    </Notice>
                    {cases.length > 0 && (
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Your requests</h2>
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {cases.map((c) => (
                                    <li key={c.reference} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                        <span><strong>{c.reference}</strong> · {c.product} · {c.kind.replace('_', ' ')}</span>
                                        <span>{c.created}</span>
                                        <DpStatus status={c.status} />
                                        {c.note && <span className="w-full text-ink-500">TBCA: {c.note}</span>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <form
                    onSubmit={(ev) => {
                        ev.preventDefault();
                        form.post('/digital-products/library/refund-and-issue', { forceFormData: true, preserveScroll: true, onSuccess: () => form.reset('reason', 'description', 'outcome', 'evidence') });
                    }}
                    className="space-y-3 self-start rounded-[8px] border border-parchment-400 bg-white p-4"
                >
                    <h2 className="text-xs font-bold tracking-wide text-ink-900 uppercase">Tell us more</h2>
                    <p className="text-xs text-ink-500">Please provide details so we can resolve this as quickly as possible.</p>
                    <Field label="Reason Details" required error={form.errors.reason}>
                        {(id) => <Select id={id} value={form.data.reason} onChange={(ev) => form.setData('reason', ev.target.value)} placeholder="Select reason details" options={reasons[form.data.kind] ?? []} />}
                    </Field>
                    <Field label="Description" required error={form.errors.description}>
                        {(id) => <Textarea id={id} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} placeholder="Please provide a clear explanation of your request or the issue you have experienced." />}
                    </Field>
                    <Field label="What outcome are you seeking?" required error={form.errors.outcome}>
                        {(id) => <Select id={id} value={form.data.outcome} onChange={(ev) => form.setData('outcome', ev.target.value)} placeholder="Select desired outcome" options={outcomes} />}
                    </Field>
                    <fieldset>
                        <legend className="text-[0.8125rem] font-medium text-ink-800">Have you downloaded the product?</legend>
                        <div className="mt-1 flex items-center gap-2">
                            {[true, false].map((v) => (
                                <button key={String(v)} type="button" aria-pressed={form.data.downloaded === v} onClick={() => form.setData('downloaded', v)} className={cn('h-8 w-16 rounded-[4px] border text-xs font-semibold', form.data.downloaded === v ? 'border-gold-500 bg-gold-50' : 'border-parchment-500')}>
                                    {v ? 'Yes' : 'No'}
                                </button>
                            ))}
                            <span className="text-[0.6875rem] text-ink-500">If yes, refunds may be limited by our policy.</span>
                        </div>
                        {form.errors.downloaded && <p className="text-xs text-risk-600">{form.errors.downloaded}</p>}
                    </fieldset>
                    <Field label="Supporting Evidence (optional)" error={form.errors.evidence}>
                        {(id) => (
                            <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-[4px] border border-dashed border-parchment-500 p-2 text-xs">
                                <span className="inline-flex items-center gap-1 rounded-[4px] border border-gold-500 px-2 py-1 font-semibold"><Upload className="size-3.5" aria-hidden="true" /> Upload File</span>
                                <span className="text-ink-500">{form.data.evidence?.name ?? 'You can upload screenshots or documents (Max 10MB) Allowed: JPG, PNG, PDF, DOCX'}</span>
                                <input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf,.docx" className="sr-only" onChange={(ev) => form.setData('evidence', ev.target.files?.[0] ?? null)} />
                            </label>
                        )}
                    </Field>
                    {form.errors.kind && <p className="text-xs text-risk-600">{form.errors.kind}</p>}
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => form.reset()} className="h-10 rounded-[4px] border border-parchment-500 text-sm font-semibold">Cancel</button>
                        <button type="submit" disabled={form.processing || form.data.downloaded === null} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-sm font-semibold disabled:opacity-50">
                            <Lock className="size-4" aria-hidden="true" /> Submit Request
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Request Summary</h2>
                        {['We aim to respond within 1 business day', 'Complex cases may take up to 5 business days', 'You will receive updates by email and portal notifications'].map((t) => <p key={t} className="mb-1.5 flex gap-2"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{t}</p>)}
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Refunds are assessed: legal remedy first (ECTA / CPA), then TBCA-failure remedy, then discretionary goodwill.</p>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink-900 uppercase"><ShieldCheck className="size-4 text-gold-600" aria-hidden="true" />Your Entitlement Status</h2>
                        <LabelValues
                            rows={[
                                { label: 'Entitlement', value: <DpStatus status={selected.status} /> },
                                { label: 'Maintenance', value: selected.maintenanceStatus === 'active' ? `Active until ${selected.maintenanceUntil}` : 'Not active' },
                                { label: 'Updates Included', value: selected.updatesIncluded },
                                { label: 'Support Level', value: selected.product.support },
                                { label: 'Version in Use', value: selected.version?.display },
                            ]}
                        />
                    </section>
                    <HelpPanel />
                </div>
            </div>
        </LibraryShell>
    );
}

Refund.layout = null;
