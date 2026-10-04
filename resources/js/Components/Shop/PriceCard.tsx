import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Gift, Headphones, Info, Minus, Plus, ShoppingCart } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Select } from '@/Components/ui/Form';
import { SecureCheckout, CheckList } from '@/Components/Shop/ProductParts';
import { zar } from '@/Components/Shop/Bits';
import type { ProductDetail } from '@/types/shop';

const btnPrimary = 'flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-4 py-3 text-[0.9375rem] font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50';
const btnSecondary = 'flex w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-4 py-2.5 text-sm font-semibold text-gold-800 hover:bg-gold-50';

function Available({ text }: { text: string }) {
    return (
        <>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-verified-700"><span className="size-2 rounded-full bg-verified-500" /> Available</p>
            <p className="text-xs text-ink-500">{text}</p>
        </>
    );
}

function Help({ text }: { text: string }) {
    return (
        <div className="mt-5 rounded-[6px] border border-parchment-400 bg-parchment-100 p-3 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-900"><Headphones className="size-4 text-gold-700" aria-hidden="true" /> {text}</p>
            <button type="button" onClick={() => openAskQuestion({ subject: 'Product guidance', section: 'shop' })} className="mt-2 inline-flex h-8 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-gold-800 hover:bg-gold-50">
                Talk to TBCA →
            </button>
        </div>
    );
}

export default function PriceCard({ product }: { product: ProductDetail }) {
    const v = product.variants;
    const [qty, setQty] = useState(1);
    const [licence, setLicence] = useState(v.licences?.[0]?.key ?? '');
    const [plan, setPlan] = useState(v.plans?.[0]?.key ?? '');
    const [commit, setCommit] = useState((v.commitments?.find((c) => c.popular) ?? v.commitments?.[0])?.key ?? '');
    const [busy, setBusy] = useState(false);

    const add = (buyNow: boolean, extra: Record<string, unknown> = {}) => {
        setBusy(true);
        router.post(`/shop/product/${product.slug}/add`, { quantity: qty, buy_now: buyNow, ...extra }, { preserveScroll: true, onFinish: () => setBusy(false) });
    };
    const unit = product.price_unit ? ` /${product.price_unit}` : '';

    if (product.act === 'A7') {
        return (
            <aside className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink-900">This is 100% Free</h2>
                    <span className="flex size-12 items-center justify-center rounded-full bg-verified-500 text-white"><Gift className="size-6" aria-hidden="true" /></span>
                </div>
                <div className="mt-3"><CheckList tone="green" items={['No credit card required', 'No hidden costs', 'No obligation']} /></div>
                <p className="mt-4 text-sm text-ink-600">A great first step to better decisions, stronger strategies and sustainable growth.</p>
                <Link href={`/shop/free/${product.slug}`} className="mt-4 flex w-full items-center justify-center rounded-[4px] bg-verified-700 px-4 py-3 text-sm font-semibold text-white hover:bg-verified-500">
                    Access Free →
                </Link>
                <Help text="Need help after your results?" />
            </aside>
        );
    }

    if (product.act === 'A3') {
        const p = v.plans?.find((x) => x.key === plan) ?? v.plans?.[0];
        return (
            <aside className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <p className="text-xs text-ink-500">Subscription Price (Excl. VAT)</p>
                <p className="mt-1 text-ink-700">From <span className="text-[1.75rem] font-bold text-gold-700">{zar(p?.zar ?? product.price_zar ?? 0)}</span> <span className="font-semibold text-gold-700">{unit}</span></p>
                {product.certified ? <Available text={product.content.price_note ?? 'Cancel or change plan anytime.'} /> : <p className="mt-1 text-xs font-semibold text-attested-700">Recurring purchase not yet enabled</p>}
                {(v.plans?.length ?? 0) > 0 && (
                    <label className="mt-4 block text-xs font-semibold text-ink-800">
                        Choose Your Plan
                        <Select className="mt-1" value={plan} onChange={(e) => setPlan(e.target.value)} options={(v.plans ?? []).map((x) => ({ value: x.key, label: `${x.name} - ${zar(x.zar)} / ${product.price_unit ?? 'month'}` }))} />
                    </label>
                )}
                {p?.includes && <div className="mt-3"><CheckList tone="green" items={p.includes} /></div>}
                <div className="mt-4 space-y-2">
                    {product.certified ? (
                        <Link href={`/shop/mandate?product=${product.slug}&plan=${p?.key ?? ''}`} className={btnPrimary}><ShoppingCart className="size-4" /> Subscribe Now</Link>
                    ) : (
                        <>
                            <div className="rounded-[6px] border border-attested-500/40 bg-attested-50 p-3 text-xs text-ink-700">
                                <p className="font-semibold text-attested-700">Subscription options being finalised</p>
                                This product has been identified as a Subscription candidate, but recurring purchase is not currently enabled for this SKU. No recurring charge or payment mandate will be created from this page.
                            </div>
                            <Link href={`/search?q=${encodeURIComponent(product.name)}`} className={btnPrimary}>View current options</Link>
                        </>
                    )}
                    <button type="button" className={btnSecondary} onClick={() => router.post(`/shop/product/${product.slug}/save-for-later`, {}, { preserveScroll: true })}>Save to Basket</button>
                    <button type="button" className={btnSecondary} onClick={() => openAskQuestion({ subject: `Custom plan: ${product.name}`, section: 'shop' })}>Request a Custom Plan</button>
                </div>
                <SecureCheckout />
                <Help text="Need help choosing the right plan?" />
            </aside>
        );
    }

    if (product.act === 'A4') {
        const c = v.commitments?.find((x) => x.key === commit);
        return (
            <aside className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <p className="text-xs text-ink-500">Monthly Fee (Excl. VAT)</p>
                <p className="mt-1 text-ink-700">From <span className="text-[1.75rem] font-bold text-gold-700">{zar(product.price_zar ?? product.indicative_zar ?? 0)}</span> <span className="font-semibold text-gold-700">/month</span></p>
                <Available text={product.content.price_note ?? 'Retainer capacity is subject to adviser availability.'} />
                {(v.commitments?.length ?? 0) > 0 && (
                    <>
                        <label className="mt-4 block text-xs font-semibold text-ink-800">
                            Select Commitment Tier (C1-C5)
                            <Select className="mt-1" value={commit} onChange={(e) => setCommit(e.target.value)} options={(v.commitments ?? []).map((x) => ({ value: x.key, label: `${x.name} - ${zar(x.zar)} / month` }))} />
                        </label>
                        {c && (
                            <div className="mt-3 rounded-[6px] border border-parchment-400 p-3">
                                <p className="text-xs text-ink-500">Estimated Monthly Allowance</p>
                                <p className="text-lg font-bold text-ink-900">{c.hours} hours</p>
                                <p className="text-xs text-ink-500">Advisory, reviews, strategy & support</p>
                            </div>
                        )}
                    </>
                )}
                <p className="mt-3 flex gap-1.5 text-[0.6875rem] text-ink-500"><Info className="size-3.5 shrink-0" aria-hidden="true" /> {product.statement}</p>
                <div className="mt-4 space-y-2">
                    <Link href={`/shop/retainer-proposal?product=${product.slug}&tier=${commit}`} className={btnPrimary}>Request This Retainer</Link>
                    <Link href={`/shop/retainer-proposal?product=${product.slug}`} className={btnSecondary}>Request a Custom Retainer</Link>
                </div>
                <SecureCheckout />
                <Help text="Need help choosing the right commitment?" />
            </aside>
        );
    }

    // A1 / A2
    const lic = v.licences?.find((l) => l.key === licence);
    const display = lic?.zar ?? product.price_zar ?? 0;
    const tiered = (v.tiers?.length ?? 0) > 0;
    const iconLicences = v.licences?.some((l) => l.icon);

    return (
        <aside className="rounded-[8px] border border-parchment-400 bg-white p-5">
            <p className="text-xs text-ink-500">Price (Excl. VAT)</p>
            <p className="mt-1 text-ink-700">From <span className="text-[1.75rem] font-bold text-gold-700">{zar(display)}</span></p>
            <Available text={product.content.price_note ?? 'Price includes human review and all deliverables.'} />

            {product.act === 'A2' && (v.licences?.length ?? 0) > 0 && !iconLicences && (
                <>
                    <label className="mt-4 block text-xs font-semibold text-ink-800">
                        Select Licence
                        <Select className="mt-1" value={licence} onChange={(e) => setLicence(e.target.value)} options={(v.licences ?? []).map((l) => ({ value: l.key, label: `${l.name} - ${zar(l.zar)}` }))} />
                    </label>
                    {lic?.includes && (
                        <div className="mt-3">
                            <p className="mb-1.5 text-xs font-semibold text-ink-800">Licence Includes</p>
                            <CheckList tone="green" items={lic.includes} />
                        </div>
                    )}
                </>
            )}

            {product.act === 'A1' && !tiered && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-800" id="qty-label">Quantity</span>
                    <div className="inline-flex items-center rounded-[4px] border border-parchment-500" role="group" aria-labelledby="qty-label">
                        <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-9 items-center justify-center disabled:opacity-40"><Minus className="size-4" /></button>
                        <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                        <button type="button" aria-label="Increase quantity" disabled={qty >= 50} onClick={() => setQty((q) => Math.min(50, q + 1))} className="flex size-9 items-center justify-center disabled:opacity-40"><Plus className="size-4" /></button>
                    </div>
                </div>
            )}

            <div className="mt-4 space-y-2">
                {tiered ? (
                    <Link href={`/shop/product/${product.slug}/configure`} className={btnPrimary}><ShoppingCart className="size-4" /> Configure & Buy</Link>
                ) : iconLicences ? (
                    <Link href={`/shop/product/${product.slug}/licence`} className={btnPrimary}><ShoppingCart className="size-4" /> Choose Licence & Buy</Link>
                ) : product.act === 'A2' ? (
                    <>
                        <button type="button" disabled={busy} className={btnPrimary} onClick={() => add(false, { licence: licence || undefined, use: licence ? 'internal' : undefined })}><ShoppingCart className="size-4" /> Add to Basket</button>
                        <button type="button" disabled={busy} className={btnSecondary} onClick={() => add(true, { licence: licence || undefined, use: licence ? 'internal' : undefined })}>Buy Now - Instant Access</button>
                    </>
                ) : (
                    <>
                        <button type="button" disabled={busy} className={btnPrimary} onClick={() => add(true)}><ShoppingCart className="size-4" /> Buy this Sprint</button>
                        <button type="button" disabled={busy} className={btnSecondary} onClick={() => add(false)}>Add to Basket</button>
                    </>
                )}
                <button type="button" className="w-full text-center text-xs font-semibold text-gold-800 hover:underline" onClick={() => openAskQuestion({ subject: `Quote request: ${product.name}`, section: 'shop' })}>
                    Request a Quote Instead
                </button>
            </div>
            <SecureCheckout />
            <Help text={product.act === 'A2' ? 'Need a different licence or have questions?' : 'Need Help Deciding?'} />
        </aside>
    );
}
