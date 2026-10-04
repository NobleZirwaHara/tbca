import { Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Check, CircleCheck, HelpCircle, Info, Lock, PencilLine, ShieldCheck } from 'lucide-react';
import PurchaseShell from '@/Components/Products/Digital/PurchaseShell';
import { DarkCard } from '@/Components/Products/Digital/Ui';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { formatZar } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { DpProductDetail, DpPurchaseSummary } from '@/Components/Products/Digital/types';

const zar = (n: number) => `ZAR ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 }).replace(/\s/g, ',')}`;

export default function Checkout({
    product,
    summary,
    totals,
    state,
    terms,
}: {
    product: DpProductDetail;
    summary: DpPurchaseSummary;
    totals: { subtotal: number; vat: number; platform: number; bank: number; fees: number; total: number };
    state: string;
    terms: { label: string; value: string }[];
}) {
    const form = useForm({});
    const { flash } = usePage<SharedProps>().props;
    const ready = state === 'READY_TO_PAY';

    return (
        <PurchaseShell
            product={product}
            title="Checkout & Order Review"
            lead="Review your selections below. Once payment is confirmed, your entitlement and download access will be created immediately."
            step={4}
            crumbs={[
                { label: 'Digital Products', href: '/digital-products' },
                { label: product.name, href: `/digital-products/${product.slug}` },
                { label: `Licence (${summary.licenceLabel.replace(' – ', ' ')})`, href: `/digital-products/${product.slug}/licence` },
                { label: 'Options', href: `/digital-products/${product.slug}/options` },
                { label: 'Disclosure', href: `/digital-products/${product.slug}/disclosure` },
                { label: 'Checkout & Order Review' },
            ]}
            meta={[
                { label: 'Licence', value: summary.licenceLabel },
                { label: 'Version', value: summary.version },
                { label: 'Format', value: summary.format },
                { label: 'Language', value: summary.language },
            ]}
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    <Notice tone="warn" icon={AlertTriangle}>
                        Please ensure all details are correct before continuing. Changes after payment may impact your refund rights.
                    </Notice>
                    {!ready && (
                        <Notice tone="bad" title={state.replace(/_/g, ' ')}>
                            {state === 'PRICE_CHANGED' && 'The price for your licence changed since you selected it. Go back to the licence step to re-review the amount.'}
                            {state === 'PRODUCT_GATE_CHANGED' && 'This product or version is no longer available for purchase. Return to the product page.'}
                            {state === 'DISCLOSURE_CHANGED' && 'The disclosure changed. Please re-read and accept it.'}
                        </Notice>
                    )}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">1. Your Order</h2>
                            <p className="text-sm font-semibold text-ink-900">{product.name}</p>
                            <p className="mb-2 text-xs text-ink-500">{product.tagline}</p>
                            <LabelValues
                                rows={[
                                    { label: 'Licence Class', value: <span>{summary.licenceLabel} <Link href={`/digital-products/${product.slug}/licence`} className="ml-2 text-gold-700 underline">Change</Link></span> },
                                    { label: 'Version', value: summary.version },
                                    { label: 'Format', value: summary.format },
                                    { label: 'Language', value: summary.language },
                                    { label: 'Jurisdiction', value: summary.jurisdiction },
                                    { label: 'Verified as at', value: summary.verifiedAt ?? '—' },
                                    { label: 'Maintenance Included', value: summary.maintenance },
                                    { label: 'Updates Included', value: summary.updates },
                                    { label: 'Support', value: summary.support },
                                ]}
                            />
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">2. Terms & Commercial Conditions</h2>
                            <ul className="space-y-2">
                                {terms.map((t) => (
                                    <li key={t.label} className="flex items-center justify-between gap-2 text-xs">
                                        <span className="flex items-center gap-2 text-ink-700">
                                            <CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> {t.label}
                                        </span>
                                        <span className="font-medium text-ink-900">{t.value}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-xs text-ink-700">
                                <ShieldCheck className="mr-1 inline size-4 text-gold-700" aria-hidden="true" />
                                Digital-download refund rights are assessed in accordance with the Consumer Protection Act 68 of 2008 and our Refund & Download Policy.
                                <Link href={`/digital-products/${product.slug}/disclosure`} className="mt-1 block font-semibold text-gold-700 underline">
                                    View Refund & Download Policy →
                                </Link>
                            </div>
                        </section>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                            <h2 className="mb-2 font-bold text-ink-900 uppercase">3. Security & Payment</h2>
                            <p className="flex gap-1.5 text-ink-700"><Check className="size-4 text-verified-500" aria-hidden="true" /> Your payment is encrypted and processed securely.</p>
                            <p className="mt-1 flex gap-1.5 text-ink-700"><Check className="size-4 text-verified-500" aria-hidden="true" /> We do not store your card details.</p>
                            <p className="mt-3 font-semibold text-ink-900">Accepted methods:</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {['VISA', 'Mastercard', 'Instant EFT', 'Apple Pay', 'G Pay'].map((m) => (
                                    <span key={m} className="rounded border border-parchment-500 px-1.5 py-0.5 text-[0.625rem] font-bold">{m}</span>
                                ))}
                                <span className="text-[0.625rem] text-ink-500">and more</span>
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                            <h2 className="mb-2 flex items-center gap-1.5 font-bold text-ink-900 uppercase"><PencilLine className="size-4 text-gold-600" aria-hidden="true" />4. Need to change something?</h2>
                            <p className="text-ink-700">If you need to change your licence, options or details, please go back and update before proceeding.</p>
                            <Link href={`/digital-products/${product.slug}/disclosure`} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 font-semibold">
                                <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to Previous Step
                            </Link>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                            <h2 className="mb-2 flex items-center gap-1.5 font-bold text-ink-900 uppercase"><HelpCircle className="size-4 text-gold-600" aria-hidden="true" />Need human assistance?</h2>
                            <p className="text-ink-700">Our team can help you confirm the right product, licence, or next step.</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Checkout help: ${product.name}`, section: 'digital-products' })} className="mt-3 inline-flex h-8 items-center rounded-[4px] border border-gold-500 px-3 font-semibold">
                                Ask a Question →
                            </button>
                        </section>
                    </div>
                </div>

                <aside className="space-y-3">
                    <DarkCard title="Order Summary">
                        <LabelValues
                            rows={[
                                { label: 'Product', value: product.name },
                                { label: 'Licence', value: summary.licenceLabel },
                                { label: 'Version', value: summary.version },
                                { label: 'Format', value: summary.format },
                                { label: 'Language', value: summary.language },
                                { label: 'Jurisdiction', value: summary.jurisdiction },
                            ]}
                        />
                        <p className="mt-3 text-[0.6875rem] text-ink-500">Source Price (ZAR)</p>
                        <p className="font-serif text-xl font-semibold">{zar(totals.subtotal)}</p>
                        <LabelValues
                            className="mt-2"
                            rows={[
                                { label: 'VAT (15%)', value: zar(totals.vat) },
                                { label: 'Total (VAT Exclusive)', value: zar(totals.subtotal), strong: true },
                                { label: 'Total VAT', value: zar(totals.vat) },
                                { label: 'Platform & bank charges', value: `from ${formatZar(totals.fees)}` },
                            ]}
                        />
                        <div className="mt-3 flex items-baseline justify-between border-t border-parchment-300 pt-3">
                            <span className="text-sm font-bold text-verified-700">Amount to Pay</span>
                            <span className="font-serif text-2xl font-semibold text-verified-700">{zar(totals.total)}</span>
                        </div>
                        <p className="mt-1 text-[0.625rem] text-ink-400">Includes the R250 platform fee and card bank charge; final charges depend on your payment method.</p>
                        <p className="mt-3 flex gap-2 rounded-[6px] bg-verified-50 p-2 text-[0.6875rem] text-verified-700">
                            <Info className="size-4 shrink-0" aria-hidden="true" /> USD Available at live exchange rate for your convenience.
                        </p>
                        <p className="mt-2 flex gap-2 rounded-[6px] bg-attested-50 p-2 text-[0.6875rem] text-attested-700">
                            <Lock className="size-4 shrink-0" aria-hidden="true" /> All prices are final before payment. You will not be charged until payment is successfully verified.
                        </p>
                    </DarkCard>
                    {flash.error && <p role="alert" className="text-xs font-semibold text-risk-600">{flash.error}</p>}
                    <button
                        type="button"
                        disabled={!ready || form.processing}
                        onClick={() => form.post('/digital-products/checkout')}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-ink-950 text-sm font-semibold text-parchment-100 hover:bg-ink-800 disabled:opacity-50"
                    >
                        Proceed to Payment <Lock className="size-4" aria-hidden="true" />
                    </button>
                    <p className="text-center text-xs text-ink-500">You will review payment on the next step.</p>
                </aside>
            </div>
        </PurchaseShell>
    );
}
