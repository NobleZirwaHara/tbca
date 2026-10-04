import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Rocket } from 'lucide-react';
import { useState } from 'react';
import Icon from '@/Components/ui/Icon';
import CatalogueCard from '@/Components/Sprints/CatalogueCard';
import { ActiveChips, buildGroups, CompareModal, FilterSidebar, Pagination, ResultsToolbar, useCompare } from '@/Components/Sprints/CatalogueParts';
import SprintHero, { SearchBar } from '@/Components/Sprints/SprintHero';
import { visitCatalogue, withFilter } from '@/Components/Sprints/lib';
import { cn } from '@/lib/cn';
import type { AudienceConfig, CatalogueFilters, CatalogueItem, Facets, Paginated } from '@/types/sprints';

interface Props {
    audienceKey: string;
    audience: AudienceConfig;
    audiences: { key: string; label: string; icon: string }[];
    results: Paginated<CatalogueItem>;
    facets: Facets;
    filters: CatalogueFilters;
    sorts: Record<string, string>;
    total: number;
    catalogueTotal: number;
}

/** "Sprints for SMEs / Founders / Corporates / ..." buyer-route pages. */
export default function Audience({ audienceKey, audience, audiences, results, facets, filters, sorts, total, catalogueTotal }: Props) {
    const [layout, setLayout] = useState<'grid' | 'list'>('grid');
    const compare = useCompare();
    const path = `/sprints/for/${audienceKey}`;
    const groups = buildGroups(facets, ['audience']);
    const set = (key: keyof CatalogueFilters, value: string | null) => visitCatalogue(path, withFilter(filters, key, value));
    const clear = () => visitCatalogue(path, {});
    const needs = audience.needs;

    const supportPanel = (
        <aside className="hidden self-start rounded-[8px] bg-white p-4 text-ink-900 shadow-raised lg:block">
            <p className="text-sm font-bold">{audience.short} Support</p>
            <ul className="mt-3 space-y-3">
                {audience.support.map((s) => (
                    <li key={s.title}>
                        <Link href={s.href} className="flex gap-3 rounded-[4px] p-1 hover:bg-parchment-200">
                            <Icon name={s.icon} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                            <span>
                                <span className="block text-[0.8125rem] font-semibold">{s.title}</span>
                                <span className="block text-[0.75rem] text-ink-500">{s.body}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );

    return (
        <>
            <Head title={audience.title} />

            <SprintHero
                serif
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: 'Buyer Routes', href: '/sprints' }, { label: audience.label }]}
                title={audience.title}
                description={audience.description}
                badges={[
                    { label: 'Delivered by TBCA Experts', icon: 'user-check' },
                    { label: 'Human Reviewed', icon: 'users' },
                    { label: 'Secure and Confidential', icon: 'shield-check' },
                    { label: audienceKey === 'ngos' ? 'Built for African Impact' : 'Built for African Businesses', icon: 'globe' },
                ]}
                aside={supportPanel}
            >
                <div className="flex flex-wrap gap-3">
                    <a href="#results" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                        Browse {audience.short} Sprints <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                    <Link href="/sprints/recommended" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-500/70 px-5 text-sm font-semibold text-parchment-100 hover:bg-gold-500/10">
                        Find the Right Sprint
                    </Link>
                </div>
            </SprintHero>

            {/* What do you need help with? -> need filter */}
            <div className="border-b border-ink-800 bg-ink-900">
                <div className="container-tbca flex items-center gap-3 overflow-x-auto py-3">
                    <span className="shrink-0 text-[0.8125rem] font-semibold text-parchment-100">What do you need help with?</span>
                    {needs.map((n) => {
                        const active = filters.need === n;
                        return (
                            <button
                                key={n}
                                type="button"
                                onClick={() => set('need', active ? null : n)}
                                aria-pressed={active}
                                className={cn('shrink-0 rounded-[4px] border px-3 py-1.5 text-[0.75rem] font-medium', active ? 'border-gold-500 bg-gold-500/15 text-gold-300' : 'border-ink-600 text-parchment-200 hover:border-gold-500')}
                            >
                                {n}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-parchment-100" id="results">
                <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <FilterSidebar
                        title={`Filter ${audience.short} Sprints`}
                        tone="light"
                        groups={groups}
                        filters={filters}
                        onChange={set}
                        onClear={clear}
                        header={
                            <div className="mb-3 rounded-[6px] border border-parchment-400 bg-parchment-100 p-3">
                                <p className="text-[0.75rem] font-semibold text-ink-500">Buyer Route</p>
                                <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-900">
                                    <Lock className="size-3.5" aria-hidden="true" /> {audience.label}
                                </p>
                                <label className="mt-2 block">
                                    <span className="sr-only">Change Buyer Route</span>
                                    <select
                                        value={audienceKey}
                                        onChange={(e) => visitCatalogue(`/sprints/for/${e.target.value}`, {})}
                                        className="h-8 w-full rounded-[4px] border border-gold-400 bg-white px-2 text-[0.75rem] font-semibold text-gold-800"
                                    >
                                        {audiences.map((a) => (
                                            <option key={a.key} value={a.key}>
                                                Change Buyer Route: {a.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        }
                    />

                    <div className="min-w-0">
                        <nav aria-label="Buyer routes" className="flex gap-2 overflow-x-auto pb-1">
                            {audiences.map((a) => (
                                <Link
                                    key={a.key}
                                    href={`/sprints/for/${a.key}`}
                                    className={cn('shrink-0 rounded-[4px] border px-4 py-2 text-[0.8125rem] font-medium', a.key === audienceKey ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-parchment-400 bg-white text-ink-600 hover:border-gold-300')}
                                >
                                    {a.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:p-5">
                            <SearchLight placeholder={`Search ${audience.short.toLowerCase()} Sprints by challenge, deliverable or keyword`} defaultValue={filters.q} onSearch={(q) => set('q', q || null)} />
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.75rem]">
                                <span className="font-semibold text-ink-700">Popular searches:</span>
                                {audience.popular.map((p) => (
                                    <button key={p} type="button" onClick={() => set('q', p)} className="rounded-full border border-parchment-500 bg-parchment-100 px-2.5 py-1 text-ink-600 hover:border-gold-400">
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5">
                                <h2 className="font-serif text-2xl font-semibold text-ink-900">Recommended Sprints for {audience.label}</h2>
                                <p className="text-[0.8125rem] text-ink-500">Explore structured Sprints matched to common {audience.short.toLowerCase()} needs.</p>
                            </div>
                            <div className="mt-3">
                                <ResultsToolbar
                                    title=""
                                    count={results.total}
                                    countLabel={`of ${catalogueTotal.toLocaleString('en-ZA')} Sprints match`}
                                    sort={filters.sort ?? 'recommended'}
                                    sorts={sorts}
                                    onSort={(s) => set('sort', s)}
                                    layout={layout}
                                    onLayout={setLayout}
                                    compareCount={compare.items.length}
                                    onCompare={() => compare.setOpen(true)}
                                />
                            </div>
                            <ActiveChips filters={filters} groups={groups} onRemove={set} onClear={clear} />

                            {results.data.length === 0 ? (
                                <p className="mt-6 rounded-[8px] border border-dashed border-parchment-500 p-8 text-center text-sm text-ink-500">
                                    No Sprints match. {total} Sprints are available for {audience.label}.{' '}
                                    <button type="button" onClick={clear} className="font-semibold text-gold-700 underline">
                                        Clear filters
                                    </button>
                                </p>
                            ) : (
                                <div className={cn('mt-4 grid gap-4', layout === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
                                    {results.data.map((item) => (
                                        <CatalogueCard key={item.id} item={item} variant={layout === 'list' ? 'list' : 'tile'} compared={compare.has(item)} onCompare={compare.toggle} />
                                    ))}
                                </div>
                            )}
                            <Pagination results={results} onPage={(p) => set('page', String(p))} />
                        </div>

                        <div className="mt-6 flex flex-col gap-4 rounded-[8px] bg-ink-900 p-5 text-parchment-100 sm:flex-row sm:items-center">
                            <Rocket className="size-9 shrink-0 text-gold-400" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="font-semibold">Can&rsquo;t find what you need?</p>
                                <p className="text-[0.8125rem] text-parchment-200">Tell us what you are trying to achieve and TBCA will help structure the right Sprint.</p>
                            </div>
                            <Link href="/sprints/request-a-quote" className="inline-flex h-10 items-center justify-center rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">
                                Request a Custom Sprint
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <CompareModal items={compare.items} open={compare.open} onClose={() => compare.setOpen(false)} onRemove={compare.toggle} />
        </>
    );
}

function SearchLight(props: { placeholder: string; defaultValue: string | null; onSearch: (q: string) => void }) {
    return (
        <div className="[&_form]:border-parchment-500">
            <SearchBar {...props} size="md" tone="light" finderHref="/sprints/recommended" />
        </div>
    );
}
