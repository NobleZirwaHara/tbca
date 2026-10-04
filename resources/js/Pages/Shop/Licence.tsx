import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bookmark, Briefcase, Building2, CheckCircle2, Code, GraduationCap, Headphones, Info, MoreHorizontal, Scale, Share2, ShieldCheck, ShoppingCart, User, Users, Zap, BookOpen, Home } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Input } from '@/Components/ui/Form';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, ShopCrumbs, SideCard, TrustStrip, zar, zar2 } from '@/Components/Shop/Bits';
import { Glance } from '@/Components/Shop/ProductTabs';
import { cn } from '@/lib/cn';
import type { ProductDetail } from '@/types/shop';

interface Use { key: string; label: string; body: string; min: number }

const LIC_ICONS: Record<string, typeof User> = { user: User, briefcase: Briefcase, 'building-2': Building2, scale: Scale, 'share-2': Share2 };
const USE_ICONS: Record<string, typeof User> = { internal: Home, client: Users, training: GraduationCap, publication: BookOpen, software: Code, other: MoreHorizontal };

export default function Licence({ product, uses, saved }: { product: ProductDetail; uses: Use[]; saved: boolean }) {
    const licences = product.variants.licences ?? [];
    const [licence, setLicence] = useState(licences[0]?.key ?? 'L1');
    const [use, setUse] = useState('internal');
    const [other, setOther] = useState('');
    const [busy, setBusy] = useState(false);
    const level = Number(licence.replace(/\D/g, ''));
    const selectedUse = uses.find((u) => u.key === use);
    const compatible = selectedUse ? level >= selectedUse.min : false;
    const lic = licences.find((l) => l.key === licence);
    const price = lic?.zar ?? 0;
    const vat = price * 0.15;
    const step = compatible ? 3 : 2;

    const submit = (buyNow: boolean) => {
        setBusy(true);
        router.post(`/shop/product/${product.slug}/add`, { licence, use, use_other: other, buy_now: buyNow }, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <>
            <Head title={`Licence: ${product.name}`} />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Digital Products', href: '/shop/aisle/digital-products-ip' }, { label: `${product.code} ${product.name}`, href: product.url }, { label: 'Choose Licence & Intended Use' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <aside className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                        <ShopIcon name={product.icon} size="xl" tone="green" className="mx-auto flex" />
                        <span className="mt-4 inline-block rounded bg-verified-50 px-2 py-0.5 text-xs font-semibold text-verified-700">{product.code}</span>
                        <h2 className="mt-2 font-serif text-xl font-semibold text-ink-900">{product.name}</h2>
                        <p className="mt-1 text-xs text-ink-600">{product.tagline}</p>
                        <div className="mt-4"><Glance rows={product.content.glance ?? []} /></div>
                        <Link href={product.url} className="mt-5 flex items-center justify-center gap-1.5 rounded-[4px] border border-risk-500/50 py-2 text-xs font-semibold text-risk-700"><ArrowLeft className="size-4" /> Back to Product</Link>
                    </aside>

                    <div className="min-w-0 space-y-5 lg:col-span-6">
                        <span className="inline-block rounded bg-parchment-300 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-700">OS-015 Licence & Intended-Use Selector</span>
                        <h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Select Your Licence and Intended Use</h1>
                        <p className="-mt-3 text-sm text-ink-600">Choose the licence that matches how you will use this product.</p>
                        <FlowSteps current={step} done={step - 1} steps={[{ title: 'Select Licence', sub: 'Choose your rights' }, { title: 'Intended Use', sub: "Confirm how you'll use it" }, { title: 'Review & Continue', sub: 'Add to cart or buy now' }]} />

                        <SideCard title="1. Select Your Licence">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Each licence defines how you may use, modify and share this product.</p>
                            <div role="radiogroup" aria-label="Licence" className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
                                {licences.map((l) => {
                                    const I = LIC_ICONS[l.icon ?? ''] ?? User;
                                    return (
                                        <button key={l.key} type="button" role="radio" aria-checked={licence === l.key} onClick={() => setLicence(l.key)} className={cn('flex flex-col rounded-[8px] border p-3 text-left', licence === l.key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300')}>
                                            <span className="text-xs font-semibold text-ink-900">{l.key} - {l.name}</span>
                                            <I className="my-2 size-5 text-ink-500" aria-hidden="true" />
                                            <span className="flex-1 text-[0.6875rem] text-ink-500">{l.body}</span>
                                            <span className="mt-2 text-sm font-bold text-ink-900">{zar(l.zar)}</span>
                                            <span className="text-[0.625rem] text-ink-400">excl. VAT</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-3 flex gap-2 rounded-[6px] bg-verified-50 p-2 text-xs text-verified-700"><ShieldCheck className="size-4 shrink-0" aria-hidden="true" /> All licences are perpetual and include 12 months of updates and email support.</p>
                        </SideCard>

                        <SideCard title="2. Confirm Your Intended Use">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Select the primary way you will use this product.</p>
                            <div role="radiogroup" aria-label="Intended use" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {uses.map((u) => {
                                    const I = USE_ICONS[u.key] ?? Home;
                                    const ok = level >= u.min;
                                    return (
                                        <button key={u.key} type="button" role="radio" aria-checked={use === u.key} onClick={() => setUse(u.key)} className={cn('flex gap-2 rounded-[8px] border p-3 text-left', use === u.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                            <I className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden="true" />
                                            <span><span className="block text-xs font-semibold text-ink-900">{u.label}</span><span className="block text-[0.6875rem] text-ink-500">{u.body}</span>{!ok && <span className="text-[0.625rem] font-semibold text-attested-700">Requires L{u.min}+</span>}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {use === 'other' && <Input className="mt-3" aria-label="Describe your intended use" placeholder="Describe your intended use" value={other} onChange={(e) => setOther(e.target.value)} />}
                            {!compatible && selectedUse && (
                                <p role="alert" className="mt-3 rounded-[6px] border border-attested-500/40 bg-attested-50 p-2 text-xs text-attested-700">
                                    {selectedUse.label} requires licence L{selectedUse.min} or higher. <button type="button" className="font-semibold underline" onClick={() => setLicence(licences.find((l) => Number(l.key.replace(/\D/g, '')) >= selectedUse.min)?.key ?? licence)}>Upgrade to L{selectedUse.min}</button>
                                </p>
                            )}
                            <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> Not sure which licence fits? <button type="button" className="underline" onClick={() => openAskQuestion({ subject: `Licence advice: ${product.name}`, section: 'shop' })}>contact a TBCA advisor</button>.</p>
                        </SideCard>
                    </div>

                    <aside className="space-y-4 lg:col-span-3">
                        <SideCard title="Your Selection">
                            <dl className="space-y-1.5 rounded-[6px] bg-verified-50 p-3 text-xs">
                                <div className="flex justify-between"><dt className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-verified-500" /> Licence</dt><dd>{licence} - {lic?.name}</dd></div>
                                <div className="flex justify-between"><dt className="flex items-center gap-1"><CheckCircle2 className={cn('size-3.5', compatible ? 'text-verified-500' : 'text-attested-500')} /> Intended Use</dt><dd>{selectedUse?.label}</dd></div>
                            </dl>
                            <dl className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between"><dt>Price (excl. VAT)</dt><dd className="font-semibold">{zar2(price)}</dd></div>
                                <div className="flex justify-between"><dt>VAT (15%)</dt><dd className="font-semibold">{zar2(vat)}</dd></div>
                            </dl>
                            <p className="mt-3 flex items-baseline justify-between border-t border-parchment-300 pt-3"><span className="font-semibold">Total (incl. VAT)</span><span className="text-xl font-bold text-gold-700">{zar2(price + vat)}</span></p>
                            <p className="mt-3 rounded-[6px] bg-controlled-50 p-2 text-xs text-controlled-700"><strong className="block">Digital Product</strong>This is a digital product. No physical item will be shipped.</p>
                            <ul className="mt-3 space-y-2 text-xs text-ink-600">
                                <li className="flex gap-2"><Zap className="size-4 shrink-0" />Instant Access - download immediately after payment.</li>
                                <li className="flex gap-2"><ShieldCheck className="size-4 shrink-0" />Secure & Verified - all files are malware scanned.</li>
                                <li className="flex gap-2"><Headphones className="size-4 shrink-0" />Support Included - email support for 12 months.</li>
                            </ul>
                            <div className="mt-4 space-y-2">
                                <button type="button" disabled={busy || !compatible} onClick={() => submit(false)} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-semibold text-ink-900 disabled:opacity-50"><ShoppingCart className="size-4" /> Add to Cart & Continue</button>
                                <button type="button" disabled={busy || !compatible} onClick={() => submit(true)} className="w-full rounded-[4px] border border-gold-500 py-2 text-sm font-semibold text-gold-800 disabled:opacity-50">Buy Now</button>
                                <button type="button" onClick={() => router.post('/saved', { item_type: 'shop-product', item_key: product.slug, label: product.name, url: product.url }, { preserveScroll: true })} className="flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 py-2 text-xs font-semibold">
                                    <Bookmark className="size-4" /> {saved ? 'Saved' : 'Save for Later'}
                                </button>
                            </div>
                        </SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
