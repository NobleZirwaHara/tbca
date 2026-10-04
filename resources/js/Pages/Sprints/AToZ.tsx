import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { buildGroups, FilterSidebar } from '@/Components/Sprints/CatalogueParts';
import { IconTile } from '@/Components/Sprints/CatalogueCard';
import SprintHero, { SearchBar } from '@/Components/Sprints/SprintHero';
import { visitCatalogue, withFilter } from '@/Components/Sprints/lib';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { CatalogueFilters, CatalogueItem, Facets } from '@/types/sprints';

interface Props {
    results: CatalogueItem[];
    facets: Facets;
    total: number;
    filters: CatalogueFilters;
    letters: Record<string, number>;
    matched: Record<string, number>;
}

/** A to Z Services: letter bar, grouped rows, bookmark (saved items for signed-in clients). */
export default function AToZ({ results, facets, total, filters, letters, matched }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [layout, setLayout] = useState<'grid' | 'list'>('list');
    const path = '/sprints/a-z';
    const set = (key: keyof CatalogueFilters, value: string | null) => visitCatalogue(path, withFilter({ ...filters, sort: null }, key, value));
    const clear = () => visitCatalogue(path, {});
    const groups = buildGroups(facets, ['rating', 'type']);

    const grouped = results.reduce<Record<string, CatalogueItem[]>>((acc, item) => {
        const l = item.title.charAt(0).toUpperCase();
        (acc[l] ??= []).push(item);
        return acc;
    }, {});

    function save(item: CatalogueItem) {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post('/saved', { item_type: 'sprint', item_key: item.slug, label: item.title, url: `/sprints/${item.slug}` }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="A to Z Services" />
            <SprintHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: 'A to Z Services' }]}
                title="A to Z Services"
                description="Explore our complete range of expert-led Sprints and solutions from A to Z across all business needs and objectives."
                badges={[
                    { label: 'Expert-led solutions', icon: 'badge-check' },
                    { label: 'Outcome-driven', icon: 'circle-check' },
                    { label: 'Secure & confidential', icon: 'shield-check' },
                    { label: 'Built for Africa', icon: 'globe' },
                ]}
            >
                <div className="max-w-xl">
                    <SearchBar placeholder="Search services by name, keyword or business need" defaultValue={filters.q} onSearch={(q) => set('q', q || null)} buttonLabel="Search Services" finderHref={null} size="md" />
                </div>
            </SprintHero>

            <div className="bg-parchment-100">
                <div className="container-tbca py-8">
                    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <h2 className="text-lg font-bold text-ink-900">Browse Services by Letter</h2>
                        <nav aria-label="Letters" className="flex flex-wrap gap-1">
                            <button type="button" onClick={() => set('letter', null)} className={cn('h-9 min-w-9 rounded-[4px] border px-2 text-[0.8125rem] font-semibold', !filters.letter ? 'border-ink-900 bg-ink-900 text-white' : 'border-parchment-500 bg-white')}>
                                All
                            </button>
                            {Object.entries(letters).map(([l, n]) => (
                                <button
                                    key={l}
                                    type="button"
                                    disabled={n === 0}
                                    onClick={() => set('letter', l)}
                                    aria-pressed={filters.letter === l}
                                    title={`${n} services`}
                                    className={cn('h-9 min-w-9 rounded-[4px] border text-[0.8125rem] disabled:opacity-30', filters.letter === l ? 'border-ink-900 bg-ink-900 text-white' : 'border-parchment-500 bg-white hover:border-gold-500')}
                                >
                                    {l}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <FilterSidebar title="Filter Services" tone="light" groups={groups} filters={filters} onChange={set} onClear={clear} />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="flex items-center gap-2 font-semibold text-ink-900">
                                    All Services
                                    <span className="rounded-full border border-verified-500/30 bg-verified-50 px-2 py-0.5 text-[0.75rem] text-verified-700">
                                        {Object.values(matched).reduce((a, b) => a + b, 0).toLocaleString('en-ZA')} of {total.toLocaleString('en-ZA')} services
                                    </span>
                                </p>
                                <div className="flex items-center gap-2 text-[0.8125rem] text-ink-600">
                                    Sort by: <span className="rounded-[4px] border border-parchment-500 bg-white px-2 py-1">A to Z</span>
                                    <div className="flex overflow-hidden rounded-[4px] border border-parchment-500">
                                        <button type="button" onClick={() => setLayout('grid')} aria-pressed={layout === 'grid'} className={cn('px-2 py-1', layout === 'grid' ? 'bg-gold-500' : 'bg-white')}>
                                            Grid
                                        </button>
                                        <button type="button" onClick={() => setLayout('list')} aria-pressed={layout === 'list'} className={cn('px-2 py-1', layout === 'list' ? 'bg-gold-500' : 'bg-white')}>
                                            List
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {Object.keys(grouped).length === 0 && <p className="mt-6 rounded-[8px] border border-dashed border-parchment-500 p-8 text-center text-sm text-ink-500">No services match these filters.</p>}

                            {Object.entries(grouped).map(([letter, items]) => (
                                <section key={letter} className="mt-5" aria-labelledby={`letter-${letter}`}>
                                    <h3 id={`letter-${letter}`} className="mb-2 text-lg font-bold text-ink-900">
                                        {letter}
                                    </h3>
                                    <ul className={cn('overflow-hidden rounded-[8px] border border-parchment-400 bg-white', layout === 'grid' ? 'grid sm:grid-cols-2' : 'divide-y divide-parchment-300')}>
                                        {items.map((item) => (
                                            <li key={item.id} className={cn('flex flex-col gap-3 p-4 md:flex-row md:items-center', layout === 'grid' && 'border-b border-parchment-300 md:flex-col md:items-start')}>
                                                <div className="flex min-w-0 flex-1 gap-3">
                                                    <IconTile name={item.icon} size="sm" tone="light" />
                                                    <div className="min-w-0">
                                                        <Link href={`/sprints/${item.slug}`} className="text-sm font-semibold text-ink-900 hover:text-gold-700">
                                                            {item.title}
                                                        </Link>
                                                        <p className="line-clamp-2 text-[0.8125rem] text-ink-500">{item.summary}</p>
                                                    </div>
                                                </div>
                                                <dl className="grid grid-cols-3 gap-3 text-[0.75rem] md:w-[380px]">
                                                    <div>
                                                        <dt className="text-ink-400">Category</dt>
                                                        <dd className="text-ink-800">{item.category_label}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-ink-400">Delivery</dt>
                                                        <dd className="text-ink-800">{item.delivery ?? 'After scope'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-ink-400">Packages</dt>
                                                        <dd className="text-ink-800">{item.packages.join(' | ') || (item.commercial_act === 'quote' ? 'Quote' : 'Standard')}</dd>
                                                    </div>
                                                </dl>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/sprints/${item.slug}`} className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-[0.75rem] font-semibold text-ink-900 hover:bg-gold-50">
                                                        View Sprint <ArrowRight className="size-3.5" aria-hidden="true" />
                                                    </Link>
                                                    <button type="button" onClick={() => save(item)} aria-label={`Save ${item.title}`} className="rounded-[4px] border border-parchment-500 p-1.5 text-ink-500 hover:text-gold-700">
                                                        {auth.user ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    {(matched[letter] ?? 0) > items.length && (
                                        <button type="button" onClick={() => set('letter', letter)} className="mt-2 text-[0.8125rem] font-semibold text-gold-700 hover:underline">
                                            View all {matched[letter]} services starting with {letter} →
                                        </button>
                                    )}
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
