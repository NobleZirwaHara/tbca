import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/ui/Icon';
import CatalogueCard from '@/Components/Sprints/CatalogueCard';
import { ActiveChips, buildGroups, CompareModal, FilterSidebar, HelpBands, Pagination, ResultsToolbar, Spotlight, useCompare } from '@/Components/Sprints/CatalogueParts';
import SprintHero, { SearchBar } from '@/Components/Sprints/SprintHero';
import { visitCatalogue, withFilter } from '@/Components/Sprints/lib';
import { cn } from '@/lib/cn';
import type { CatalogueFilters, CatalogueItem, CatalogueView, CategoryChip, Facets, Paginated } from '@/types/sprints';

interface Props {
    view: CatalogueView;
    results: Paginated<CatalogueItem>;
    facets: Facets;
    filters: CatalogueFilters;
    sorts: Record<string, string>;
    total: number;
    spotlight: CatalogueItem | null;
    categories: CategoryChip[];
}

const FLAG_TABS = [
    { key: null, label: 'All Sprints' },
    { key: 'popular', label: 'Popular' },
    { key: 'recommended', label: 'Recommended' },
    { key: 'new', label: 'New' },
    { key: 'best-value', label: 'Best Value' },
] as const;

/**
 * Browse All, Featured / New / Popular / Recommended, Sprint Marketplace and the
 * category pages. Filtering, sorting and pagination run server-side via query params.
 */
export default function Catalogue({ view, results, facets, filters, sorts, total, spotlight, categories }: Props) {
    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const compare = useCompare();
    const groups = buildGroups(facets, view.lockedFilters);
    const set = (key: keyof CatalogueFilters, value: string | null) => visitCatalogue(view.path, withFilter(filters, key, value));
    const clear = () => visitCatalogue(view.path, filters.sort ? { sort: filters.sort } : {});
    const isNew = view.key === 'new';
    const isCategory = view.kind === 'category';
    const showSpotlight = view.spotlight && spotlight && results.current_page === 1 && !filters.q;
    const items = showSpotlight ? results.data.filter((i) => i.id !== spotlight!.id) : results.data;
    const subject = isCategory ? `${view.title} Sprint` : isNew ? 'New Sprint' : 'Sprint';

    return (
        <>
            <Head title={view.title} />

            <SprintHero crumbs={view.crumbs} title={view.title} description={view.description} badges={view.badges}>
                <SearchBar
                    key={view.key}
                    placeholder={view.search}
                    defaultValue={filters.q}
                    onSearch={(q) => set('q', q || null)}
                    buttonLabel={isCategory ? 'Search Category' : view.kind === 'curated' ? `Search ${view.title}` : 'Search Sprints'}
                />
                {view.quick.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem]">
                        <span className="font-semibold text-parchment-100">{view.quickLabel ?? (isCategory ? 'Popular topics:' : 'Quick links:')}</span>
                        {view.quick.map((q) => (
                            <Link key={q.label} href={q.href} preserveScroll className="text-gold-400 underline-offset-4 hover:underline">
                                {q.label}
                            </Link>
                        ))}
                    </div>
                )}
            </SprintHero>

            {view.kind === 'all' && (
                <nav aria-label="Sprint categories" className="border-b border-parchment-400 bg-white">
                    <div className="container-tbca flex gap-1 overflow-x-auto py-3">
                        <Link href="/sprints" className={cn('flex shrink-0 items-center gap-2 rounded-[6px] border px-4 py-2 text-[0.8125rem] font-medium', !filters.category ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-900')}>
                            <Icon name="layout-dashboard" className="size-5 text-gold-600" /> All Sprints
                        </Link>
                        {categories.map((c) => (
                            <Link key={c.slug} href={`/sprints/category/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-[6px] border border-transparent px-3 py-2 text-[0.8125rem] font-medium text-ink-600 hover:border-parchment-400 hover:text-ink-900">
                                <Icon name={c.icon} className="size-5 text-gold-600" /> <span className="max-w-[7rem] leading-tight">{c.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}

            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
                    <div>
                        <FilterSidebar
                            title={view.kind === 'curated' ? `Refine ${view.title}` : 'Filter Sprints'}
                            groups={groups}
                            filters={filters}
                            onChange={set}
                            onClear={clear}
                            tone={view.kind === 'curated' || isCategory ? 'dark' : 'light'}
                        />
                    </div>

                    <div className="min-w-0">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 md:p-5">
                            <ResultsToolbar
                                title={view.title}
                                count={results.total}
                                countLabel={view.key === 'marketplace' ? 'marketplace offers available' : view.kind === 'curated' ? `${view.title.toLowerCase().replace(' sprints', '')} Sprints` : 'Sprints available'}
                                sort={filters.sort ?? 'recommended'}
                                sorts={sorts}
                                onSort={(s) => set('sort', s)}
                                layout={layout}
                                onLayout={setLayout}
                                compareCount={compare.items.length}
                                onCompare={() => compare.setOpen(true)}
                                pill={isCategory || isNew}
                            />
                            {view.personalised && <p className="mt-2 text-[0.8125rem] text-verified-700">Personalised for your buyer route. Matches are ranked first.</p>}
                            {isCategory && (
                                <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Quick filter">
                                    {FLAG_TABS.map((t) => (
                                        <button
                                            key={t.label}
                                            type="button"
                                            role="tab"
                                            aria-selected={(filters.flag ?? null) === t.key}
                                            onClick={() => set('flag', t.key)}
                                            className={cn('rounded-full border px-3 py-1 text-[0.75rem] font-medium', (filters.flag ?? null) === t.key ? 'border-ink-900 bg-ink-900 text-parchment-100' : 'border-parchment-500 text-ink-700 hover:border-ink-400')}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <ActiveChips filters={filters} groups={groups} onRemove={set} onClear={clear} />

                            {showSpotlight && (
                                <Spotlight
                                    item={spotlight!}
                                    label={view.spotlight!.label}
                                    whyLabel={view.spotlight!.why}
                                    compared={compare.has(spotlight!)}
                                    onCompare={compare.toggle}
                                />
                            )}

                            {items.length === 0 && !showSpotlight ? (
                                <div className="mt-6 rounded-[8px] border border-dashed border-parchment-500 p-10 text-center">
                                    <p className="font-semibold text-ink-900">No Sprints match these filters.</p>
                                    <p className="mt-1 text-sm text-ink-500">Try removing a filter or searching a broader term. {total.toLocaleString('en-ZA')} Sprints are in this view.</p>
                                    <button type="button" onClick={clear} className="mt-4 text-sm font-semibold text-gold-700 underline">
                                        Clear all filters
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        'mt-4 grid gap-4',
                                        layout === 'list' ? 'grid-cols-1' : isNew ? 'sm:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2 2xl:grid-cols-3',
                                    )}
                                >
                                    {items.map((item) => (
                                        <CatalogueCard
                                            key={item.id}
                                            item={item}
                                            variant={layout === 'list' ? 'list' : isNew ? 'tile' : 'grid'}
                                            compared={compare.has(item)}
                                            onCompare={compare.toggle}
                                        />
                                    ))}
                                </div>
                            )}

                            <Pagination results={results} onPage={(p) => set('page', String(p))} />
                        </div>

                        <HelpBands subject={subject} />
                    </div>
                </div>
            </div>

            <CompareModal items={compare.items} open={compare.open} onClose={() => compare.setOpen(false)} onRemove={compare.toggle} />
        </>
    );
}
