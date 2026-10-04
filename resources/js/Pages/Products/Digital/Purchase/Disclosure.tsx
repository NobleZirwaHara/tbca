import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CircleDollarSign, ClipboardList, CloudDownload, Info, Lock, ShieldCheck } from 'lucide-react';
import PurchaseShell from '@/Components/Products/Digital/PurchaseShell';
import { LabelValues } from '@/Components/Products/Shared';
import { usePrice } from '@/lib/money';
import type { DpProductDetail, DpPurchaseSummary } from '@/Components/Products/Digital/types';

function Card({ icon: Icon, title, items, note }: { icon: typeof Info; title: string; items: React.ReactNode[]; note: string }) {
    return (
        <section className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="flex items-center gap-3 text-sm font-bold tracking-wide text-ink-900 uppercase">
                <Icon className="size-8 text-gold-600" aria-hidden="true" /> {title}
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs text-ink-700">
                {items.map((it, i) => (
                    <li key={i}>{it}</li>
                ))}
            </ul>
            <p className="mt-auto flex gap-2 rounded-[6px] border border-gold-300 bg-gold-50 p-2.5 text-xs text-ink-700">
                <Info className="size-4 shrink-0 text-gold-700" aria-hidden="true" /> {note}
            </p>
        </section>
    );
}

export default function Disclosure({ product, summary, accepted }: { product: DpProductDetail; summary: DpPurchaseSummary; accepted: boolean }) {
    const price = usePrice();
    const form = useForm({ accept: accepted });

    return (
        <PurchaseShell
            product={product}
            title="Refund and Download Disclosure"
            lead="Please read and accept the terms below before continuing to checkout."
            step={3}
            crumbs={[
                { label: 'Digital Products', href: '/digital-products' },
                { label: product.name, href: `/digital-products/${product.slug}` },
                { label: `Licence (${summary.licenceLabel.replace(' – ', ' ')})`, href: `/digital-products/${product.slug}/licence` },
                { label: 'Options', href: `/digital-products/${product.slug}/options` },
                { label: 'Refund and Download Disclosure' },
            ]}
            meta={[
                { label: 'Product', value: product.name },
                { label: 'Licence', value: summary.licenceLabel },
                { label: 'Version', value: summary.version },
                { label: 'Format', value: summary.format },
                { label: 'Language', value: summary.language },
                { label: 'Jurisdiction', value: summary.jurisdiction },
            ]}
            aside={
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                    <div className="flex justify-between">
                        <p className="text-sm font-semibold">Your Selection Summary</p>
                        <Link href={`/digital-products/${product.slug}/options`} className="text-xs font-semibold text-gold-700 underline">
                            Edit
                        </Link>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Source Price (ZAR)</p>
                    <p className="font-serif text-2xl font-semibold">From {price(summary.price)}</p>
                    <p className="text-xs font-semibold text-verified-600">or USD Available</p>
                    <p className="mt-2 flex justify-between text-xs text-ink-600">
                        VAT Treatment <span>VAT-exclusive</span>
                    </p>
                </div>
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post(`/digital-products/${product.slug}/disclosure`, { preserveScroll: true });
                }}
                className="grid gap-4 xl:grid-cols-[1fr_300px]"
            >
                <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card
                            icon={ClipboardList}
                            title="Entitlement & Access"
                            items={[
                                'Your entitlement is created immediately after verified payment.',
                                <>
                                    Access to the file is made available in your <Link href="/digital-products/library" className="font-semibold text-gold-700 underline">Digital Products Library</Link>.
                                </>,
                                'You may download the authorised file(s) according to your selected licence.',
                            ]}
                            note="Entitlement and access do not automatically remove your rights under applicable law."
                        />
                        <Card
                            icon={CloudDownload}
                            title="Download & Use"
                            items={[
                                'You are licensing the product, not buying ownership of TBCA intellectual property.',
                                'Use is subject to the licence class you selected.',
                                'You may not share, resell or distribute beyond your granted rights.',
                                'All files include version and rights controls.',
                            ]}
                            note="Downloads are recorded to support version, support and currentness."
                        />
                        <Card
                            icon={CircleDollarSign}
                            title="Refund Policy (South Africa)"
                            items={[
                                <>Refunds are considered in accordance with the Consumer Protection Act and our <span className="font-semibold text-gold-700 underline">Refund & Download Policy</span>.</>,
                                'Digital downloads are not automatically non-refundable.',
                                'Refunds may be granted for defects, material misdescription, or other valid reasons.',
                                'Goodwill refunds are discretionary and not a substitute for legal or policy remedies.',
                            ]}
                            note="You may be asked for information to assess your request."
                        />
                    </div>
                    <div className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[1fr_auto]">
                        <div className="flex gap-3">
                            <ShieldCheck className="size-8 shrink-0 text-gold-600" aria-hidden="true" />
                            <div>
                                <h2 className="text-sm font-bold text-ink-900 uppercase">Declaration</h2>
                                <p className="text-xs text-ink-700">
                                    I confirm that I have read and understood the entitlement, download, use and refund information above and accept the terms before proceeding to checkout.
                                </p>
                            </div>
                        </div>
                        <label className="flex items-center gap-3 rounded-[6px] border border-gold-300 bg-gold-50 px-4 py-3 text-sm font-semibold text-ink-900">
                            <input type="checkbox" checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} className="size-5 accent-gold-600" />
                            I accept the refund and download terms
                        </label>
                        {form.errors.accept && <p role="alert" className="text-xs font-semibold text-risk-600 md:col-span-2">{form.errors.accept}</p>}
                    </div>
                    <div className="flex flex-wrap justify-between gap-3">
                        <Link href={`/digital-products/${product.slug}/options`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-4 text-sm font-semibold">
                            <ArrowLeft className="size-4" aria-hidden="true" /> Back to Options
                        </Link>
                        <button type="submit" disabled={!form.data.accept || form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                            Continue to Checkout <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <aside className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-sm font-semibold">What You Are Buying</h2>
                        <LabelValues
                            rows={[
                                { label: 'Licence Class', value: <span className="text-gold-700">{summary.licenceLabel}</span> },
                                { label: 'Version', value: summary.version },
                                { label: 'Format', value: summary.format },
                                { label: 'Language', value: summary.language },
                                { label: 'Jurisdiction', value: summary.jurisdiction },
                                { label: 'Verified as at', value: summary.verifiedAt ?? '—' },
                                { label: 'Maintenance', value: summary.maintenance },
                                { label: 'Updates', value: summary.updates },
                                { label: 'Support', value: summary.support },
                            ]}
                        />
                    </section>
                    <section className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <Lock className="size-6 shrink-0 text-ink-700" aria-hidden="true" />
                        <p className="text-xs text-ink-600">
                            <strong className="block text-ink-900">100% Secure Transaction</strong>
                            Your payment is encrypted and processed securely. We do not store your card details.
                        </p>
                    </section>
                </aside>
            </form>
        </PurchaseShell>
    );
}
