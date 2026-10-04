import { useEffect, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Bookmark, Download, Info, Lock, Minus, Plus, ShoppingBag, Trash2, Zap } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, ShopCrumbs, SideCard, TrustStrip, zar, zar2 } from '@/Components/Shop/Bits';
import { HelpCard } from '@/Components/Shop/CheckoutParts';
import { cn } from '@/lib/cn';
import type { BasketItem, SharedProps, Totals } from '@/types';

type Group = 'purchase' | 'quote' | 'subscription' | 'retainer' | 'brief' | 'free';

const GROUPS: Record<Group, { mode: string; title: string; body: string; checkout: string; border: string; tone: string }> = {
    purchase: { mode: 'LS-PURCHASE', title: 'Immediate Purchase', body: 'These items are available for immediate online purchase.', checkout: 'Online', border: 'border-l-verified-500', tone: 'text-verified-700' },
    quote: { mode: 'LS-QUOTE', title: 'Quote / Proposal', body: 'These items require a proposal, capacity check and human consultation.', checkout: 'Quote Process', border: 'border-l-attested-500', tone: 'text-attested-700' },
    subscription: { mode: 'LS-SUBSCRIBE', title: 'Recurring Subscription', body: 'Recurring commitments are processed separately with an explicit mandate.', checkout: 'Mandate + Checkout', border: 'border-l-controlled-500', tone: 'text-controlled-700' },
    retainer: { mode: 'LS-RETAINER', title: 'Retainer Proposal', body: 'Retainers begin only after C1-C5 scoping, capacity and contract approval.', checkout: 'Proposal Builder', border: 'border-l-risk-500', tone: 'text-risk-700' },
    brief: { mode: 'LS-BRIEF', title: 'Marketplace Brief', body: 'Briefs are matched to verified providers; no payment is taken.', checkout: 'Brief Submission', border: 'border-l-referenced-500', tone: 'text-referenced-700' },
    free: { mode: 'LS-FREE', title: 'Free Access', body: 'Free resources are activated under Approved Free Basis.', checkout: 'Free Activation', border: 'border-l-verified-500', tone: 'text-verified-700' },
};

interface SavedBasket {
    id: number;
    name: string;
    items: number;
    updated_at: string;
}

function meta(item: BasketItem, key: string): string | undefined {
    const v = item.meta?.[key];
    return typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;
}

function groupOf(item: BasketItem): Group {
    return (item.commercial_act in GROUPS ? item.commercial_act : 'purchase') as Group;
}

function nextHref(item: BasketItem, group: Group): string {
    const slug = meta(item, 'slug');
    if (!slug) return '/shop';
    return {
        purchase: `/shop/product/${slug}`,
        quote: `/shop/product/${slug}`,
        subscription: `/shop/mandate?product=${slug}`,
        retainer: `/shop/retainer-proposal?product=${slug}`,
        brief: `/shop/marketplace-brief?product=${slug}`,
        free: `/shop/free/${slug}`,
    }[group];
}

function Qty({ item }: { item: BasketItem }) {
    const set = (quantity: number) => router.patch(`/shop/basket/${item.id}`, { quantity }, { preserveScroll: true });
    return (
        <div className="inline-flex items-center rounded-[4px] border border-parchment-500">
            <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => set(item.quantity - 1)} className="flex size-8 items-center justify-center text-ink-600 disabled:opacity-40">
                <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
            <button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={item.quantity >= 50} onClick={() => set(item.quantity + 1)} className="flex size-8 items-center justify-center text-ink-600 disabled:opacity-40">
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}

function remove(item: BasketItem) {
    router.delete(`/basket/${item.id}`, { preserveScroll: true });
}

function ItemCell({ item }: { item: BasketItem }) {
    const act = meta(item, 'act') ?? (item.item_type === 'digital-product' ? 'A2' : 'A1');
    const actLabel = meta(item, 'act_label') ?? (act === 'A2' ? 'Digital Product' : 'A1 Fixed Sprint');
    const slug = meta(item, 'slug');
    return (
        <div className="flex gap-3">
            <ShopIcon name={item.item_type === 'digital-product' ? 'file-text' : item.commercial_act === 'quote' ? 'users' : 'target'} size="md" />
            <div className="min-w-0">
                {slug ? (
                    <Link href={`/shop/product/${slug}`} className="font-semibold text-ink-900 hover:text-gold-700">{item.name}</Link>
                ) : (
                    <p className="font-semibold text-ink-900">{item.name}</p>
                )}
                <div className="mt-1"><ActTag act={act} label={actLabel} /></div>
                <p className="mt-1 text-[0.6875rem] text-ink-400">
                    Code: {item.item_code}
                    {meta(item, 'version') && <> | Version: {meta(item, 'version')}</>}
                    {meta(item, 'licence') && <> | Licence: {meta(item, 'licence')}</>}
                    {item.variant && <> | {item.variant}</>}
                </p>
            </div>
        </div>
    );
}

export default function Basket({ items, totals }: { items: BasketItem[]; totals: Totals }) {
    const { auth } = usePage<SharedProps>().props;
    const [saved, setSaved] = useState<SavedBasket[]>([]);
    const [savedVersion, setSavedVersion] = useState(0);
    const [saveOpen, setSaveOpen] = useState(false);
    const [quoteOpen, setQuoteOpen] = useState(false);
    const [shared, setShared] = useState(false);
    const saveForm = useForm({ name: '' });
    const quoteForm = useForm({ name: '', email: '' });

    // Saved baskets live outside the basket props, so they are fetched from the shop API.
    useEffect(() => {
        let ignore = false;
        fetch('/shop/saved-baskets', { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : []))
            .then((data: SavedBasket[]) => {
                if (!ignore) setSaved(data);
            })
            .catch(() => undefined);
        return () => {
            ignore = true;
        };
    }, [savedVersion, items.length]);

    const groups = (Object.keys(GROUPS) as Group[])
        .map((g) => ({ key: g, items: items.filter((i) => groupOf(i) === g) }))
        .filter((g) => g.items.length > 0);
    const purchase = items.filter((i) => groupOf(i) === 'purchase');
    const others = items.filter((i) => groupOf(i) !== 'purchase');
    const mixed = groups.length > 1;
    const purchaseSubtotal = purchase.reduce((s, i) => s + i.unit_zar * i.quantity, 0);
    const vat = purchaseSubtotal * 0.15;
    const quoteItems = items.filter((i) => groupOf(i) === 'quote');

    const proceed = () => router.post(others.length ? '/shop/basket/checkout-purchase' : '/basket/checkout');
    const requestQuotes = () => {
        if (auth.user) router.post('/shop/basket/quotes', {}, { preserveScroll: true });
        else setQuoteOpen(true);
    };

    const title = mixed ? 'Mixed-Act Basket Partition' : 'Saved Selection / Basket';

    return (
        <>
            <Head title={mixed ? 'Mixed-Act Basket' : 'Your Selection Basket'} />
            <div className="container-tbca py-6 md:py-8">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: title }]} />

                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="font-serif text-2xl font-semibold text-ink-900 md:text-3xl">
                                    {mixed ? 'Mixed-Act Basket Partition' : 'Your Selection Basket'}{' '}
                                    <span className="font-sans text-base font-normal text-ink-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                </h1>
                                <p className="mt-1 text-sm text-ink-500">
                                    {mixed
                                        ? 'Your basket contains different Commercial Acts. Each group is processed separately for compliance, pricing and checkout.'
                                        : 'Review your selected Sprints and resources before checkout.'}
                                </p>
                            </div>
                            {items.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
                                        <Bookmark className="size-4" /> Save Basket for Later
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const text = items.map((i) => `${i.name} (${i.item_code}) x${i.quantity}${i.commercial_act === 'purchase' ? ` - ${zar(i.unit_zar)}` : ''}`).join('\n');
                                            void navigator.clipboard?.writeText(`My TBCA selection:\n${text}\n${window.location.origin}/shop`);
                                            setShared(true);
                                        }}
                                    >
                                        {shared ? 'Selection copied' : 'Share Basket'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {mixed && (
                            <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-controlled-500/30 bg-controlled-50 px-4 py-3 text-[0.8125rem] text-ink-700">
                                <Info className="size-4 text-controlled-700" aria-hidden="true" />
                                <span><strong>Why we partition:</strong> Different products have different Commercial Acts, VAT treatments, delivery methods and governance controls.</span>
                            </div>
                        )}

                        {items.length === 0 && (
                            <div className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-10 text-center">
                                <ShoppingBag className="mx-auto size-10 text-gold-600" aria-hidden="true" />
                                <h2 className="mt-3 text-lg font-semibold text-ink-900">Your basket is empty</h2>
                                <p className="mt-1 text-sm text-ink-500">Browse governed Sprints, digital products and services, or load a saved basket below.</p>
                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    <ButtonLink href="/shop">Browse the Online Shop</ButtonLink>
                                    <ButtonLink href="/shop/resolver" variant="outline">Use Services Resolver</ButtonLink>
                                </div>
                            </div>
                        )}

                        {groups.map((g, gi) => {
                            const meta_ = GROUPS[g.key];
                            const subtotal = g.items.reduce((s, i) => s + i.unit_zar * i.quantity, 0);
                            return (
                                <section key={g.key} className={cn('overflow-hidden rounded-[8px] border border-l-4 border-parchment-400 bg-white', meta_.border)} aria-labelledby={`group-${g.key}`}>
                                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-parchment-300 p-4">
                                        <div>
                                            <h2 id={`group-${g.key}`} className="font-semibold text-ink-900">
                                                {mixed && `Group ${gi + 1}: `}
                                                {meta_.mode} ({meta_.title}){' '}
                                                <span className="ml-1 rounded-full bg-parchment-300 px-2 py-0.5 text-xs font-medium text-ink-600">{g.items.length} {g.items.length === 1 ? 'item' : 'items'}</span>
                                            </h2>
                                            <p className="mt-0.5 text-xs text-ink-500">{meta_.body}</p>
                                        </div>
                                        <dl className="flex gap-6 text-xs">
                                            <div><dt className="text-ink-400">Act</dt><dd className={cn('font-semibold', meta_.tone)}>{meta_.mode}</dd></div>
                                            <div><dt className="text-ink-400">Checkout</dt><dd className={cn('font-semibold', meta_.tone)}>{meta_.checkout}</dd></div>
                                        </dl>
                                    </header>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                            <thead className="bg-parchment-100 text-xs text-ink-500">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold">Item</th>
                                                    <th className="px-3 py-2 font-semibold">Delivery</th>
                                                    <th className="px-3 py-2 font-semibold">{g.key === 'purchase' ? 'Unit Price (Excl. VAT)' : 'Requested Price'}</th>
                                                    <th className="px-3 py-2 font-semibold">Qty</th>
                                                    {g.key === 'purchase' && <th className="px-3 py-2 font-semibold">Total (Excl. VAT)</th>}
                                                    <th className="px-3 py-2 font-semibold"><span className="sr-only">Actions</span></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-parchment-300">
                                                {g.items.map((item) => {
                                                    const indicative = Number(meta(item, 'indicative_zar') ?? 0);
                                                    const instant = item.item_type === 'digital-product';
                                                    return (
                                                        <tr key={item.id} className="align-top">
                                                            <td className="px-4 py-3"><ItemCell item={item} /></td>
                                                            <td className="px-3 py-3 text-xs text-ink-600">
                                                                {g.key === 'purchase' ? (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        {instant ? <Zap className="size-3.5" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
                                                                        {instant ? 'Instant Access' : 'Digital Delivery'}
                                                                    </span>
                                                                ) : g.key === 'quote' ? 'Consultation, TBD' : 'Per native process'}
                                                            </td>
                                                            <td className="px-3 py-3 font-semibold text-ink-900">
                                                                {g.key === 'purchase' ? zar(item.unit_zar) : indicative ? (
                                                                    <>
                                                                        From {zar(indicative)}
                                                                        <span className="block text-[0.6875rem] font-normal text-ink-400">{g.key === 'quote' ? 'Proposal-based' : meta(item, 'price_unit') ? `per ${meta(item, 'price_unit')}` : 'Indicative'}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-ink-500">To be confirmed</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3">{g.key === 'purchase' ? <Qty item={item} /> : <span className="font-semibold">{item.quantity}</span>}</td>
                                                            {g.key === 'purchase' && <td className="px-3 py-3 font-semibold text-ink-900">{zar(item.unit_zar * item.quantity)}</td>}
                                                            <td className="px-3 py-3 text-right whitespace-nowrap">
                                                                {g.key !== 'purchase' && (
                                                                    g.key === 'quote' ? (
                                                                        <button type="button" onClick={requestQuotes} className="mb-1 block rounded-[4px] border border-attested-500 px-2.5 py-1 text-xs font-semibold text-attested-700 hover:bg-attested-50">
                                                                            Request a Quote
                                                                        </button>
                                                                    ) : (
                                                                        <Link href={nextHref(item, g.key)} className="mb-1 block rounded-[4px] border border-parchment-500 px-2.5 py-1 text-center text-xs font-semibold text-ink-800 hover:border-gold-500">
                                                                            {meta_.checkout}
                                                                        </Link>
                                                                    )
                                                                )}
                                                                <button type="button" onClick={() => remove(item)} className="text-xs font-semibold text-risk-500 hover:underline">
                                                                    Remove<span className="sr-only"> {item.name}</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {g.key === 'purchase' && mixed && (
                                        <p className="flex justify-end gap-8 border-t border-parchment-300 px-4 py-3 text-sm">
                                            <span className="font-semibold">Group {gi + 1} Subtotal (Excl. VAT)</span>
                                            <span className="font-bold">{zar(subtotal)}</span>
                                        </p>
                                    )}
                                    {g.key === 'quote' && (
                                        <p className="border-t border-parchment-300 px-4 py-3 text-xs text-ink-600">
                                            <strong>Group {gi + 1} Next Step:</strong> You will be guided to complete a short scoping form and our team will contact you.
                                        </p>
                                    )}
                                </section>
                            );
                        })}

                        {mixed && (
                            <div className="rounded-[6px] border border-controlled-500/30 bg-controlled-50 px-4 py-3 text-xs text-ink-700">
                                <p className="font-semibold text-controlled-700">Additional Acts</p>
                                If your basket contains items with other Commercial Acts (e.g., LS-SUBSCRIBE, LS-RETAINER, LS-BRIEF), they appear as additional groups.
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex gap-2">
                                    <ButtonLink href="/shop" variant="outline" size="sm"><ArrowLeft className="size-4" /> Continue Shopping</ButtonLink>
                                    <Button type="button" variant="outline" size="sm" className="border-risk-500/50 text-risk-700" onClick={() => confirm('Clear every item from your basket?') && router.post('/shop/basket/clear', {}, { preserveScroll: true })}>
                                        <Trash2 className="size-4" /> Clear Basket
                                    </Button>
                                </div>
                                <p className="text-xs text-ink-500">All prices are in ZAR and exclude VAT. VAT will be calculated at checkout.</p>
                            </div>
                        )}

                        <SideCard title="Saved Baskets">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Load a previously saved basket or manage your saved selections.</p>
                            {saved.length === 0 ? (
                                <p className="text-sm text-ink-400">No saved baskets yet. Use "Save Basket for Later" to keep a selection.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[0.8125rem]">
                                        <thead className="text-xs text-ink-500">
                                            <tr><th className="py-1.5">Basket Name</th><th>Items</th><th>Last Updated</th><th><span className="sr-only">Actions</span></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {saved.map((b) => (
                                                <tr key={b.id}>
                                                    <td className="py-2 font-medium">{b.name}</td>
                                                    <td>{b.items} items</td>
                                                    <td>{new Date(b.updated_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td className="space-x-2 text-right whitespace-nowrap">
                                                        <button type="button" className="rounded-[4px] border border-verified-500 px-2.5 py-0.5 text-xs font-semibold text-verified-700" onClick={() => router.post(`/shop/saved-baskets/${b.id}/load`, {}, { preserveScroll: true, onSuccess: () => setSavedVersion((v) => v + 1) })}>
                                                            Load
                                                        </button>
                                                        <button type="button" className="rounded-[4px] border border-risk-500/50 px-2.5 py-0.5 text-xs font-semibold text-risk-700" onClick={() => router.delete(`/shop/saved-baskets/${b.id}`, { preserveScroll: true, onSuccess: () => setSavedVersion((v) => v + 1) })}>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </SideCard>
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title={mixed ? 'Basket Summary' : 'Order Summary'}>
                            {mixed ? (
                                <dl className="space-y-2 text-[0.8125rem]">
                                    {groups.map((g, gi) => (
                                        <div key={g.key} className="flex justify-between gap-2">
                                            <dt>Group {gi + 1}: {GROUPS[g.key].mode} ({g.items.length})</dt>
                                            <dd className="font-semibold">{g.key === 'purchase' ? zar(purchaseSubtotal) : g.key === 'free' ? 'Free' : g.key === 'quote' ? 'Quote Required' : 'Separate process'}</dd>
                                        </div>
                                    ))}
                                    <div className="flex items-baseline justify-between border-t border-parchment-300 pt-3">
                                        <dt className="font-semibold">Estimated Total (Excl. VAT)<span className="block text-[0.6875rem] font-normal text-ink-400">Excludes items requiring quotes</span></dt>
                                        <dd className="text-xl font-bold text-verified-700">{zar(purchaseSubtotal)}{others.length > 0 ? '+' : ''}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <dl className="space-y-2 text-[0.8125rem]">
                                    <div className="flex justify-between"><dt className="text-ink-500">Subtotal (Excl. VAT)</dt><dd className="font-semibold">{zar2(totals.subtotal)}</dd></div>
                                    <div className="flex justify-between"><dt className="text-ink-500">Estimated VAT (15%)</dt><dd className="font-semibold">{zar2(vat)}</dd></div>
                                    <div className="flex items-baseline justify-between border-t border-parchment-300 pt-3">
                                        <dt className="font-semibold">Estimated Total (Incl. VAT)</dt>
                                        <dd className="text-xl font-bold text-verified-700">{zar2(purchaseSubtotal + vat)}</dd>
                                    </div>
                                    <p className="text-[0.6875rem] text-ink-400">Platform and bank charges for your chosen payment method are shown at payment.</p>
                                </dl>
                            )}
                            <div className="mt-4 space-y-2">
                                <button
                                    type="button"
                                    disabled={purchase.length === 0}
                                    onClick={proceed}
                                    className="flex w-full flex-col items-center justify-center rounded-[4px] bg-verified-700 px-4 py-3 text-sm font-semibold text-white hover:bg-verified-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="inline-flex items-center gap-2"><Lock className="size-4" /> {mixed ? 'Proceed to Checkout for Group 1' : 'Proceed to Secure Checkout'}</span>
                                    {mixed && <span className="text-[0.6875rem] font-normal opacity-90">You can checkout purchased items now.</span>}
                                </button>
                                {quoteItems.length > 0 ? (
                                    <button type="button" onClick={requestQuotes} className="flex w-full flex-col items-center rounded-[4px] border border-attested-500 px-4 py-2.5 text-sm font-semibold text-attested-700 hover:bg-attested-50">
                                        Request Quotes for {mixed ? `Group ${groups.findIndex((g) => g.key === 'quote') + 1}` : 'these items'}
                                        <span className="text-[0.6875rem] font-normal text-ink-500">We'll prepare a proposal for the quoted items.</span>
                                    </button>
                                ) : (
                                    <ButtonLink href="/shop/product/tax-due-diligence-compliance-review" variant="outline" className="w-full">Request a Quote Instead</ButtonLink>
                                )}
                            </div>
                        </SideCard>

                        <SideCard>
                            <p className="font-semibold text-ink-900">Secure & Compliant</p>
                            <ul className="mt-2 space-y-1 text-xs text-ink-600">
                                {['Prices exclude VAT', 'VAT calculated at checkout per act', 'Payments processed securely in ZAR', 'Invoice available on checkout', 'Protected by bank-grade security'].map((t) => (
                                    <li key={t}>✓ {t}</li>
                                ))}
                            </ul>
                        </SideCard>

                        <SideCard>
                            <p className="font-semibold text-ink-900">We Accept</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                                {['VISA', 'Mastercard', 'EFT', 'TBCA Wallet'].map((m) => (
                                    <span key={m} className="rounded-[4px] border border-parchment-500 px-2 py-1 text-ink-700">{m}</span>
                                ))}
                            </div>
                            <p className="mt-3 text-xs font-semibold text-ink-900">Delivery & Access</p>
                            <p className="text-xs text-ink-500">Digital products: Instant access. Sprint deliveries: As per item details.</p>
                        </SideCard>

                        <HelpCard body="Talk to a TBCA advisor for help with your selection or to request a custom proposal." />
                    </aside>
                </div>
            </div>
            <TrustStrip />

            <Modal
                open={saveOpen}
                onClose={() => setSaveOpen(false)}
                title="Save Basket for Later"
                footer={
                    <Button type="button" size="sm" disabled={saveForm.processing} onClick={() => saveForm.post('/shop/saved-baskets', { preserveScroll: true, onSuccess: () => { setSaveOpen(false); saveForm.reset(); setSavedVersion((v) => v + 1); } })}>
                        Save Basket
                    </Button>
                }
            >
                <Field label="Basket name" error={saveForm.errors.name} required>
                    {(id) => <Input id={id} value={saveForm.data.name} placeholder="e.g. Q3 Expansion Plan" onChange={(e) => saveForm.setData('name', e.target.value)} />}
                </Field>
            </Modal>

            <Modal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                title="Request Quotes"
                footer={
                    <Button type="button" size="sm" disabled={quoteForm.processing} onClick={() => quoteForm.post('/shop/basket/quotes', { preserveScroll: true, onSuccess: () => setQuoteOpen(false) })}>
                        Submit Quote Requests
                    </Button>
                }
            >
                <p className="mb-3 text-sm text-ink-600">Requesting a quote does not create an order or payment obligation.</p>
                <div className="space-y-3">
                    <Field label="Full name" error={quoteForm.errors.name} required>
                        {(id) => <Input id={id} value={quoteForm.data.name} onChange={(e) => quoteForm.setData('name', e.target.value)} />}
                    </Field>
                    <Field label="Email" error={quoteForm.errors.email} required>
                        {(id) => <Input id={id} type="email" value={quoteForm.data.email} onChange={(e) => quoteForm.setData('email', e.target.value)} />}
                    </Field>
                </div>
            </Modal>
        </>
    );
}
