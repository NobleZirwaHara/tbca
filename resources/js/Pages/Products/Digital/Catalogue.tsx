import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BookOpen,
    Calculator,
    ClipboardCheck,
    CloudDownload,
    FileText,
    GraduationCap,
    Headphones,
    KeyRound,
    LayoutDashboard,
    LayoutGrid,
    RefreshCw,
    Rocket,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { ProductsHero } from '@/Components/Products/Shared';
import ProductCard from '@/Components/Products/Digital/ProductCard';
import FilterSidebar, { type DpFacets, type DpFilters } from '@/Components/Products/Digital/FilterSidebar';
import { HERO_TRUST, useQueryNav } from '@/Components/Products/Digital/Ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { DpProductCard } from '@/Components/Products/Digital/types';

const TYPE_ICONS: Record<string, LucideIcon> = {
    report: FileText,
    template: BookOpen,
    toolkit: Wrench,
    checklist: ClipboardCheck,
    calculator: Calculator,
    dashboard: LayoutDashboard,
    course: GraduationCap,
    guide: BookOpen,
};

export const SORTS = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'dss', label: 'Defensibility Score' },
];

export default function Catalogue({ products, total, facets, filters }: { products: DpProductCard[]; total: number; facets: DpFacets; filters: DpFilters }) {
    const apply = useQueryNav('/digital-products', filters as unknown as Record<string, unknown>);
    const activeType = filters.types.length === 1 ? filters.types[0] : '';

    return (
        <>
            <Head title="Digital Products" />
            <ProductsHero
                title="Digital Products"
                goldLine="Premium Reports, Templates, Toolkits & Tools"
                lead="Instant access to expert-built resources that help you plan, model, assess and execute with confidence. All products are human-reviewed and version-controlled."
                actions={
                    <>
                        <ButtonLink href="/digital-products/browse" trailingIcon="arrow-right">
                            Browse Products
                        </ButtonLink>
                        <ButtonLink href="#how-it-works" variant="outline-light">
                            How It Works
                        </ButtonLink>
                        <ButtonLink href="/sprints" variant="outline-light">
                            View Related Sprints
                        </ButtonLink>
                    </>
                }
                aside={
                    <div className="space-y-4">
                        <ul className="grid grid-cols-2 gap-3 rounded-[10px] border border-ink-700 bg-ink-900/70 p-4 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
                            {HERO_TRUST.map(({ icon: Icon, title }) => (
                                <li key={title} className="flex flex-col items-center gap-1.5 text-center">
                                    <Icon className="size-6 text-gold-400" aria-hidden="true" />
                                    <span className="text-[0.6875rem] leading-tight text-parchment-200">{title}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="hidden items-center justify-center gap-3 lg:flex" aria-hidden="true">
                            <CloudDownload className="size-14 text-gold-400" />
                        </div>
                        <p className="flex items-center gap-2 text-sm text-ink-200">
                            <BadgeCheck className="size-5 text-gold-400" aria-hidden="true" /> Trusted by professionals, advisors and organisations across Africa.
                        </p>
                    </div>
                }
            />

            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
                <FilterSidebar filters={filters} facets={facets} apply={apply} />

                <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div role="tablist" aria-label="Product type" className="flex gap-1 overflow-x-auto rounded-[8px] border border-parchment-400 bg-white p-1">
                            {[{ key: '', label: 'All Products', icon: LayoutGrid }, ...facets.types.map((t) => ({ key: t.key, label: t.label, icon: TYPE_ICONS[t.key] ?? FileText }))].map(
                                ({ key, label, icon: Icon }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeType === key}
                                        onClick={() => apply({ types: key ? [key] : [] })}
                                        className={cn(
                                            'flex min-w-[78px] shrink-0 flex-col items-center gap-1 rounded-[6px] px-2.5 py-2 text-[0.6875rem] font-medium',
                                            activeType === key ? 'bg-ink-950 text-gold-300' : 'text-ink-600 hover:bg-parchment-200',
                                        )}
                                    >
                                        <Icon className="size-5" aria-hidden="true" />
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                        <label className="flex items-center gap-2 text-xs text-ink-600">
                            Sort by:
                            <select value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">
                                {SORTS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <p className="mt-4 text-xs text-ink-500">
                        {total} product{total === 1 ? '' : 's'} {filters.q && <>for “{filters.q}”</>}
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        {products.map((p) => (
                            <ProductCard key={p.slug} product={p} />
                        ))}
                    </div>
                    {products.length === 0 && (
                        <div className="mt-4 rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">
                            No products match these filters.{' '}
                            <button type="button" className="font-semibold text-gold-700" onClick={() => apply({ q: '', types: [], audience: '', language: '', format: '', price: '', licence: '', industry: '' })}>
                                Clear filters
                            </button>
                        </div>
                    )}

                    <section id="how-it-works" className="mt-8 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[repeat(5,minmax(0,1fr))_1.4fr]">
                        {[
                            { icon: CloudDownload, title: 'Instant Access', body: 'Secure download after payment confirmation.' },
                            { icon: KeyRound, title: 'Licence Included', body: 'Single-user or team licence as specified.' },
                            { icon: RefreshCw, title: 'Always Current', body: 'Updates and new versions included where applicable.' },
                            { icon: Wrench, title: 'Need Customisation?', body: 'We can tailor any product to your needs.' },
                            { icon: Headphones, title: 'Support & Guidance', body: 'Human support available via Desk and WhatsApp.' },
                        ].map(({ icon: Icon, title, body }) => (
                            <div key={title} className="flex gap-2.5">
                                <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                <div>
                                    <p className="text-xs font-bold text-ink-900">{title}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{body}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col gap-2 rounded-[6px] border border-gold-300 bg-gold-50 p-3">
                            <p className="text-xs font-bold text-ink-900">Need help choosing the right product?</p>
                            <p className="text-[0.6875rem] text-ink-600">We'll recommend the best resources for your goal.</p>
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: 'Help choosing a Digital Product', section: 'digital-products' })}
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-xs font-semibold text-ink-900 hover:bg-gold-400"
                            >
                                Request Guidance <ArrowRight className="size-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <section className="container-tbca pb-10">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-ink-950 px-6 py-5 text-parchment-100">
                    <div className="flex items-center gap-4">
                        <Rocket className="size-8 shrink-0 text-gold-400" aria-hidden="true" />
                        <div>
                            <p className="font-serif text-xl font-semibold">Build Better. Decide Smarter. Execute Faster.</p>
                            <p className="text-sm text-ink-300">Access premium resources created by TBCA experts and accelerate your business outcomes.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <ButtonLink href="/digital-products/browse" trailingIcon="arrow-right">
                            Browse All Products
                        </ButtonLink>
                        <ButtonLink href="/sprints" variant="outline-light">
                            View Related Sprints
                        </ButtonLink>
                    </div>
                </div>
                <p className="mt-4 text-center text-xs text-ink-500">
                    Already a holder? <Link href="/digital-products/library" className="font-semibold text-gold-700 hover:underline">Open your Digital Products Library</Link>
                </p>
            </section>
        </>
    );
}
