import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Download, Headphones, Layers, Minus, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, HeroStats, ShopCrumbs, ShopHero, SideCard, TrustStrip } from '@/Components/Shop/Bits';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { ShopCard } from '@/types/shop';

import { usePrice } from '@/lib/money';
type Rows = Record<'commercial_act' | 'best_for' | 'format_access' | 'delivery' | 'human_review' | 'key_outcome' | 'includes' | 'updates' | 'support' | 'licence', string | null>;
type Compared = ShopCard & { rows: Rows };

const CRITERIA: { key: keyof Rows; label: string; group: 'core' | 'delivery' }[] = [
    { key: 'commercial_act', label: 'Commercial Act', group: 'core' },
    { key: 'best_for', label: 'Best For', group: 'core' },
    { key: 'format_access', label: 'Format / Access', group: 'core' },
    { key: 'delivery', label: 'Delivery Time', group: 'delivery' },
    { key: 'human_review', label: 'Human Review', group: 'core' },
    { key: 'key_outcome', label: 'Key Outcome', group: 'core' },
    { key: 'includes', label: 'Includes', group: 'core' },
    { key: 'updates', label: 'Updates', group: 'delivery' },
    { key: 'support', label: 'Support', group: 'delivery' },
    { key: 'licence', label: 'Licence / Usage', group: 'core' },
];

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-[0.8125rem] text-ink-700">
            {label}
            <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn('relative h-5 w-9 rounded-full transition-colors', on ? 'bg-gold-500' : 'bg-parchment-500')}>
                <span className={cn('absolute top-0.5 size-4 rounded-full bg-white transition-all', on ? 'left-4.5' : 'left-0.5')} />
            </button>
        </label>
    );
}

export default function Compare({ products, candidates, codes, q, max, shareUrl }: { products: Compared[]; candidates: ShopCard[]; codes: string[]; q: string; max: number; shareUrl: string }) {
    const fmt = usePrice();
    const { auth } = usePage<SharedProps>().props;
    const [highlight, setHighlight] = useState(true);
    const [showAll, setShowAll] = useState(true);
    const [pricing, setPricing] = useState(true);
    const [delivery, setDelivery] = useState(true);
    const [search, setSearch] = useState(q);
    const [copied, setCopied] = useState(false);

    const nav = (next: string[], query = '') => router.get('/shop/compare', { items: next.join(','), ...(query ? { q: query } : {}) }, { preserveScroll: true });
    const rows = CRITERIA.filter((c) => (delivery || c.group !== 'delivery')).filter((c) => showAll || new Set(products.map((p) => p.rows[c.key])).size > 1);
    const differs = (k: keyof Rows) => new Set(products.map((p) => p.rows[k])).size > 1;
    const price = (p: Compared) => (p.price_zar ? `From ${fmt(p.price_zar)}${p.price_unit ? ` /${p.price_unit}` : ''}` : p.act === 'A7' ? 'Free' : 'On request');

    return (
        <>
            <Head title="Product Comparison" />
            <ShopHero crumbs={<ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Search Results', href: '/search' }, { label: 'Product Comparison' }]} />}
                title="Product Comparison" intro="Compare up to 4 solutions side-by-side to choose the best fit for your needs."
                aside={<HeroStats stats={[{ icon: <Layers className="size-5" />, value: products.length, label: 'Products Selected' }, { icon: <Check className="size-5" />, value: 'Side-by-side', label: 'Comparison View' }, { icon: <ShieldCheck className="size-5" />, value: '100%', label: 'Human-Reviewed', caption: 'All information verified' }, { icon: <Download className="size-5" />, value: <a href={`/shop/compare/export?items=${codes.join(',')}`} className="text-base underline">Export</a>, label: 'Comparison CSV' }]} />} />

            <div className="container-tbca grid gap-5 py-6 lg:grid-cols-12">
                <aside className="space-y-4 lg:col-span-3">
                    <SideCard title="Comparison Control" action={<Link href="/shop/compare" className="text-xs text-gold-800">Clear All</Link>}>
                        <form onSubmit={(e) => { e.preventDefault(); nav(codes, search); }}>
                            <label htmlFor="cmp-search" className="text-xs font-semibold text-ink-800">Add Products</label>
                            <div className="relative mt-1"><input id="cmp-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Sprints, products..." className="h-9 w-full rounded-[4px] border border-parchment-500 pr-8 pl-2 text-[0.8125rem]" /><button type="submit" aria-label="Search" className="absolute top-2 right-2"><Search className="size-4 text-gold-700" /></button></div>
                        </form>
                        <p className="mt-3 text-xs font-semibold text-ink-800">{q ? 'Matching products' : 'Quick Add from Results'}</p>
                        <ul className="mt-1 space-y-1">
                            {candidates.map((c) => (
                                <li key={c.code}>
                                    <button type="button" disabled={codes.length >= max} onClick={() => nav([...codes, c.code])} className="flex w-full items-center justify-between gap-2 rounded px-1 py-1 text-left text-xs hover:bg-parchment-200 disabled:opacity-40">
                                        <span className="flex items-center gap-1.5"><Plus className="size-3.5 text-gold-700" />{c.name}</span><span className="text-ink-400">{c.price_zar ? fmt(c.price_zar) : ''}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </SideCard>
                    <SideCard title="Comparison Options">
                        <Toggle label="Highlight differences" on={highlight} onChange={setHighlight} />
                        <Toggle label="Show all features" on={showAll} onChange={setShowAll} />
                        <Toggle label="Show pricing (excl. VAT)" on={pricing} onChange={setPricing} />
                        <Toggle label="Show delivery & support" on={delivery} onChange={setDelivery} />
                    </SideCard>
                </aside>

                <div className="min-w-0 lg:col-span-6 xl:col-span-6">
                    {products.length === 0 ? (
                        <div className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-10 text-center text-sm text-ink-500">Add up to {max} products from the left to compare them side-by-side.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                <thead>
                                    <tr className="align-top">
                                        <th className="w-36 p-3 text-xs font-semibold text-ink-500">Comparison Criteria</th>
                                        {products.map((p) => (
                                            <th key={p.code} className="border-l border-parchment-300 p-3 font-normal">
                                                <div className="flex items-start gap-2">
                                                    <ShopIcon name={p.icon} size="sm" />
                                                    <div className="min-w-0 flex-1"><Link href={p.url} className="font-semibold text-ink-900 hover:text-gold-700">{p.name}</Link><p className="text-[0.6875rem] text-ink-400">{p.code}</p><ActTag act={p.act} label={p.act_label} /></div>
                                                    <button type="button" aria-label={`Remove ${p.name}`} onClick={() => nav(codes.filter((c) => c !== p.code))}><X className="size-4 text-ink-400 hover:text-risk-500" /></button>
                                                </div>
                                                <p className="mt-2 text-xs text-ink-600">{p.tagline}</p>
                                                {pricing && <p className="mt-2 font-bold text-gold-700">{price(p)}</p>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.map((c) => (
                                        <tr key={c.key} className={cn(highlight && differs(c.key) && 'bg-gold-50/50')}>
                                            <th scope="row" className="p-3 text-xs font-semibold text-ink-800">{c.label}</th>
                                            {products.map((p) => (
                                                <td key={p.code} className="border-l border-parchment-300 p-3 text-xs text-ink-700">
                                                    {c.key === 'human_review' ? (p.rows.human_review === 'Included' ? <span className="text-verified-700">✓ Included</span> : <span className="inline-flex items-center gap-1"><Minus className="size-3" /> Self-Service</span>) : (p.rows[c.key] ?? '-')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {pricing && (
                                        <tr><th scope="row" className="p-3 text-xs font-semibold">Price (Excl. VAT)</th>{products.map((p) => <td key={p.code} className="border-l border-parchment-300 p-3 text-xs font-bold">{price(p)}</td>)}</tr>
                                    )}
                                    <tr>
                                        <th scope="row" className="p-3 text-xs font-semibold">Primary CTA</th>
                                        {products.map((p) => <td key={p.code} className="border-l border-parchment-300 p-3"><Link href={p.url} className="block rounded-[4px] border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800 hover:bg-gold-50">{p.act === 'A3' ? 'View Current Options' : 'View Details'}</Link></td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {products.length > 0 && products.length < max && <p className="mt-2 text-xs text-ink-500">Add Another Product - compare up to {max} products.</p>}
                </div>

                <aside className="space-y-4 lg:col-span-3">
                    <SideCard>
                        <p className="flex items-center gap-2 font-semibold text-ink-900"><Headphones className="size-4 text-gold-700" aria-hidden="true" /> Need Help Deciding?</p>
                        <p className="mt-1 text-xs text-ink-600">Speak with a TBCA advisor for a personalised recommendation.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Comparison: ${codes.join(', ')}`, section: 'shop' })} className="mt-2 rounded-[4px] border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800">Talk to TBCA →</button>
                    </SideCard>
                    <SideCard title="Compare with Confidence">
                        <ul className="space-y-1 text-xs text-ink-600">{['All products are human-reviewed', 'Accurate, verified and current', 'Transparent pricing in ZAR (Source)', 'Secure payments and client protection'].map((t) => <li key={t}>✓ {t}</li>)}</ul>
                    </SideCard>
                    <SideCard title="Your Comparison Summary">
                        <p className="text-xs text-ink-600">{products.length} products selected · side-by-side comparison ready for review</p>
                        {auth.user ? (
                            <button type="button" disabled={!products.length} onClick={() => router.post('/saved', { item_type: 'comparison', item_key: codes.join(','), label: `Comparison: ${products.map((p) => p.name).join(' vs ')}`.slice(0, 180), url: `/shop/compare?items=${codes.join(',')}` }, { preserveScroll: true })} className="mt-3 w-full rounded-[4px] bg-gold-500 py-2.5 text-sm font-semibold text-ink-900 disabled:opacity-50">Save Comparison →</button>
                        ) : (
                            <Link href="/login" className="mt-3 block w-full rounded-[4px] bg-gold-500 py-2.5 text-center text-sm font-semibold text-ink-900">Log in to Save Comparison</Link>
                        )}
                        <button type="button" onClick={() => { void navigator.clipboard?.writeText(shareUrl); setCopied(true); }} className="mt-2 w-full rounded-[4px] border border-parchment-500 py-2 text-xs font-semibold text-ink-700">{copied ? 'Link copied' : 'Share Comparison'}</button>
                    </SideCard>
                </aside>
            </div>
            <TrustStrip />
        </>
    );
}
