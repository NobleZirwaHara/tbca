import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, ChevronRight, Coins, FileText, Headphones, Heart, Languages, MapPin, Search, ShieldCheck, ShoppingCart } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import ProductCard from '@/Components/Shop/ProductCard';
import { ResultCard } from '@/Components/Shop/ResultRow';
import { FilterSelect } from '@/Components/Shop/FilterCheckboxes';
import { iconFor } from '@/Components/Shop/ShopIcon';
import { TrustStrip } from '@/Components/Shop/Bits';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { Option, SearchResult, ShopCard } from '@/types/shop';

interface Props {
    featured: ShopCard[];
    formats: string[];
    aisles: Option[];
    routeTiles: { title: string; body: string; icon: string; href: string }[];
    priceBands: Option[];
    filters: Record<string, string | undefined>;
    results: { total: number; items: SearchResult[] } | null;
    cart: { count: number; subtotal: number };
    savedCount: number;
    governedTotal: number;
}

const BUYERS: Option[] = [
    { value: 'businesses', label: 'Businesses' },
    { value: 'investors', label: 'Investors' },
    { value: 'governments', label: 'Governments' },
    { value: 'financiers', label: 'Financiers' },
    { value: 'advisors', label: 'Advisors' },
];
const DELIVERY: Option[] = [
    { value: '0-5', label: '0-5 Days' },
    { value: '6-15', label: '6-15 Days' },
    { value: '16-30', label: '16-30 Days' },
    { value: '31+', label: '31+ Days' },
];
const AUTOMATION: Option[] = [
    { value: 'human-led', label: 'Human-led' },
    { value: 'ai-assisted', label: 'AI-assisted' },
    { value: 'automated', label: 'Automated' },
];
const REVIEW: Option[] = [
    { value: 'included', label: 'Included' },
    { value: 'self-service', label: 'Self-Service' },
];
const LANGUAGE: Option[] = [
    { value: 'EN', label: 'English' },
    { value: 'AF', label: 'Afrikaans' },
];

const chips = [
    { icon: MapPin, title: 'Africa', sub: 'Active Market' },
    { icon: Languages, title: '7 Languages', sub: 'Languages' },
    { icon: Coins, title: 'ZAR (Source)', sub: 'USD Available' },
    { icon: BadgeCheck, title: 'Human-Reviewed', sub: 'Outputs' },
    { icon: ShieldCheck, title: 'Verified Information', sub: '' },
];

export default function ShopIndex({ featured, formats, aisles, routeTiles, priceBands, filters, results, cart, savedCount, governedTotal }: Props) {
    const { context } = usePage<SharedProps>().props;
    const price = usePrice();
    const [q, setQ] = useState(filters.q ?? '');

    const apply = (patch: Record<string, string>) => {
        const next = Object.fromEntries(Object.entries({ ...filters, ...patch }).filter(([, v]) => v));
        router.get('/shop', next as Record<string, string>, { preserveScroll: true, preserveState: true });
    };
    const active = Object.values(filters).some(Boolean);

    return (
        <>
            <Head title="TBCA Online Shop" />

            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 motif-glow opacity-70" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12 lg:py-12">
                    <div className="lg:col-span-8">
                        <h1 className="font-serif text-[2.25rem] leading-tight font-semibold md:text-[3rem]">TBCA Online Shop</h1>
                        <p className="mt-1 font-serif text-xl text-gold-400 md:text-2xl">{governedTotal.toLocaleString('en-ZA').replace(/\s/g, ',')} Governed TBCA Sprints</p>
                        <p className="mt-3 max-w-xl text-sm text-ink-200 md:text-[0.9375rem]">
                            Buy high-quality Sprints, digital products, subscriptions and retainer services built on verified, human-reviewed intelligence.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ButtonLink href="/shop/a-z" trailingIcon="arrow-right">Browse Sprints</ButtonLink>
                            <ButtonLink href="/shop/product/tax-due-diligence-compliance-review" variant="outline-light" icon="mail">Request Quote</ButtonLink>
                        </div>
                        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
                            {chips.map((c) => (
                                <li key={c.title} className="flex items-start gap-2">
                                    <c.icon className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                    <span className="text-[0.6875rem] leading-snug text-parchment-200">{c.title}<span className="block text-ink-300">{c.sub}</span></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <aside className="lg:col-span-4">
                        <div className="rounded-[8px] border border-gold-600/60 bg-ink-950/80 p-5">
                            <p className="flex items-center gap-2 font-semibold"><ShoppingCart className="size-5 text-gold-400" aria-hidden="true" /> Cart Summary</p>
                            <div className="mt-3 flex justify-between text-sm">
                                <span>{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
                                <span className="font-bold">{price(cart.subtotal)}</span>
                            </div>
                            <ButtonLink href="/basket" className="mt-4 w-full">View Cart</ButtonLink>
                            <Link href="/portal" className="mt-4 flex items-center gap-2 text-sm text-parchment-200 hover:text-gold-300">
                                <Heart className="size-5 text-gold-400" aria-hidden="true" />
                                <span>Saved Items<span className="block text-xs text-ink-300">{savedCount} items</span></span>
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            <div className="container-tbca py-6">
                <div className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 md:grid-cols-[minmax(14rem,1.4fr)_repeat(4,1fr)] xl:grid-cols-[minmax(14rem,1.4fr)_repeat(8,1fr)_auto]">
                    <form
                        role="search"
                        className="relative"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ q });
                        }}
                    >
                        <label htmlFor="shop-q" className="sr-only">Search Sprints or products</label>
                        <input id="shop-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Sprints or products..." className="h-9 w-full rounded-[4px] border border-parchment-500 pr-9 pl-3 text-[0.8125rem]" />
                        <button type="submit" className="absolute top-0 right-0 flex size-9 items-center justify-center text-ink-500" aria-label="Search">
                            <Search className="size-4" />
                        </button>
                    </form>
                    <FilterSelect label="Category" value={filters.category ?? ''} options={aisles} onChange={(v) => apply({ category: v })} />
                    <FilterSelect label="Buyer Type" value={filters.buyer ?? ''} options={BUYERS} onChange={(v) => apply({ buyer: v })} />
                    <FilterSelect label="Delivery Time" value={filters.delivery ?? ''} options={DELIVERY} onChange={(v) => apply({ delivery: v })} />
                    <FilterSelect label="Price Band" value={filters.price ?? ''} options={priceBands} onChange={(v) => apply({ price: v })} />
                    <FilterSelect label="Automation Level" value={filters.automation ?? ''} options={AUTOMATION} onChange={(v) => apply({ automation: v })} />
                    <FilterSelect label="Human Review" value={filters.review ?? ''} options={REVIEW} onChange={(v) => apply({ review: v })} />
                    <FilterSelect label="Language" value={filters.language ?? ''} options={LANGUAGE} onChange={(v) => apply({ language: v })} />
                    <FilterSelect
                        label="Currency"
                        value={context.currency}
                        options={context.currencies.map((c) => ({ value: c.code, label: c.code }))}
                        onChange={(v) => v && router.post('/context', { currency: v }, { preserveScroll: true })}
                    />
                    <Link href="/shop" className="self-end pb-2 text-xs font-semibold whitespace-nowrap text-gold-700 hover:text-gold-800">Clear All Filters</Link>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3 xl:col-span-2">
                        <nav aria-label="A-Z Categories" className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <p className="mb-2 text-sm font-semibold text-ink-900">A-Z Categories</p>
                            <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                                <li>
                                    <Link href="/shop/a-z" className="flex items-center justify-between py-2 text-ink-700 hover:text-gold-700">All Categories <ChevronRight className="size-4" aria-hidden="true" /></Link>
                                </li>
                                {formats.map((f) => (
                                    <li key={f}>
                                        <Link href={`/search?q=${encodeURIComponent(f.replace(/s$/, ''))}`} className="flex items-center justify-between py-2 text-ink-700 hover:text-gold-700">
                                            <span className="inline-flex items-center gap-2"><FileText className="size-4 text-gold-600" aria-hidden="true" />{f}</span>
                                            <ChevronRight className="size-4" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    <div className="min-w-0 lg:col-span-9 xl:col-span-10">
                        {active && results ? (
                            <section aria-labelledby="results-h">
                                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                    <h2 id="results-h" className="text-lg font-semibold text-ink-900">{results.total} matching products</h2>
                                    {filters.q && <Link href={`/search?q=${encodeURIComponent(filters.q)}`} className="text-xs font-semibold text-gold-700">Open full search →</Link>}
                                </div>
                                {results.items.length === 0 ? (
                                    <div className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-600">
                                        No governed products match these filters. <Link href="/shop" className="font-semibold text-gold-700">Clear filters</Link> or try the{' '}
                                        <Link href="/shop/resolver" className="font-semibold text-gold-700">Services Resolver</Link>.
                                    </div>
                                ) : (
                                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {results.items.map((r) => <li key={r.key}><ResultCard r={r} /></li>)}
                                    </ul>
                                )}
                            </section>
                        ) : (
                            <section aria-labelledby="featured-h">
                                <h2 id="featured-h" className="mb-3 text-lg font-semibold text-ink-900">Featured Sprints</h2>
                                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                    {featured.map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}
                                </ul>
                            </section>
                        )}

                        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                            {routeTiles.map((t) => {
                                const Icon = iconFor(t.icon);
                                return (
                                    <li key={t.title}>
                                        <Link href={t.href} className="flex h-full items-start gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
                                            <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-xs font-semibold text-ink-900">{t.title}</span>
                                                <span className="block text-[0.6875rem] text-ink-500">{t.body}</span>
                                            </span>
                                            <ArrowRight className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <section className="mt-8 flex flex-col items-start gap-4 rounded-[12px] bg-ink-950 p-6 text-parchment-100 md:flex-row md:items-center md:justify-between md:p-8">
                    <div>
                        <h2 className="font-serif text-2xl font-semibold">Ready to Build, Fund, Automate or Scale?</h2>
                        <p className="mt-1 text-sm text-ink-200">Start with a diagnostic, choose a Sprint or speak to TBCA about a structured advisory mandate.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <ButtonLink href="/shop/resolver" trailingIcon="arrow-right">Start Your First Sprint</ButtonLink>
                        <button
                            type="button"
                            onClick={() => openAskQuestion({ subject: 'Online Shop enquiry', section: 'shop' })}
                            className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-600 px-5 text-sm font-medium text-parchment-100 hover:border-gold-500"
                        >
                            <Headphones className="size-4" /> Talk to TBCA
                        </button>
                    </div>
                </section>
            </div>
            <TrustStrip />
        </>
    );
}
