import { useState, type FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, CheckCircle2, FileText, Headphones, Search, SlidersHorizontal } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PageTitle } from '@/Components/Products/Shared';
import { ClassChip, PLAN_ICON } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import { Stepper } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

import { usePrice } from '@/lib/money';
interface Props {
    categories: { name: string; count: number }[];
    plans: SubPlan[];
    selected: SubPlan | null;
    filters: { category: string; q: string; sort: string; class: string };
}

export default function Choose({ categories, plans, selected, filters }: Props) {
    const rand = usePrice();
    const { auth } = usePage<SharedProps>().props;
    const [q, setQ] = useState(filters.q);
    const [showFilters, setShowFilters] = useState(Boolean(filters.class));

    const go = (patch: Partial<Props['filters']> & { plan?: string }) =>
        router.get('/subscriptions/choose-subscription', { ...filters, plan: selected?.slug, ...patch }, { preserveScroll: true, preserveState: true, replace: true });

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        go({ q });
    };

    return (
        <>
            <Head title="Choose a Subscription" />
            <PageTitle
                crumbs={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: 'Choose a Subscription' }]}
                title="Choose a Subscription"
                lead="Select a category to view available subscription plans."
                aside={
                    <div className="w-64">
                        <p className="mb-2 text-right text-xs text-ink-500">Step {selected ? 2 : 1} of 3</p>
                        <Stepper steps={['Choose', 'Review terms', 'Confirm']} current={selected ? 2 : 1} />
                    </div>
                }
            />

            <div className="bg-parchment-100 pb-14">
                <div className="container-tbca grid gap-5 pt-6 lg:grid-cols-[16rem_1fr_17rem]">
                    <aside className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-bold text-ink-900">1. Select a Category</h2>
                        <ul className="mt-3 space-y-0.5" role="listbox" aria-label="Subscription categories">
                            {categories.map((c) => {
                                const active = c.name === filters.category;
                                return (
                                    <li key={c.name}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            onClick={() => go({ category: c.name, plan: undefined })}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left text-[0.8125rem]',
                                                active ? 'bg-gold-50 font-semibold text-ink-900 ring-1 ring-gold-300' : 'text-ink-700 hover:bg-parchment-200',
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                {active && <CheckCircle2 className="size-4 text-gold-600" aria-hidden="true" />}
                                                {c.name}
                                            </span>
                                            <span className={cn('rounded-full px-1.5 text-[0.6875rem]', active ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-600')}>{c.count}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="mt-4 rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-center">
                            <p className="text-xs font-bold text-gold-800">Need help choosing?</p>
                            <p className="mt-1 text-[0.6875rem] text-ink-600">Talk to a TBCA specialist who can help match the right subscription to your goals.</p>
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: 'Help choosing a subscription', section: 'subscriptions' })}
                                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 bg-white px-3 text-xs font-semibold text-gold-800"
                            >
                                <Headphones className="size-3.5" /> Talk to a Specialist
                            </button>
                        </div>
                    </aside>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-ink-900">2. Select a Subscription</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <form onSubmit={submitSearch} className="relative">
                                    <label htmlFor="sub-search" className="sr-only">
                                        Search subscriptions
                                    </label>
                                    <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-400" aria-hidden="true" />
                                    <input
                                        id="sub-search"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search subscriptions..."
                                        className="h-9 w-56 rounded-[4px] border border-parchment-500 pr-3 pl-8 text-xs focus:border-gold-500 focus:outline-none"
                                    />
                                </form>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters((s) => !s)}
                                    aria-expanded={showFilters}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 px-3 text-xs font-medium text-ink-700"
                                >
                                    <SlidersHorizontal className="size-4" /> Filters
                                </button>
                                <label className="sr-only" htmlFor="sub-sort">
                                    Sort by
                                </label>
                                <select
                                    id="sub-sort"
                                    value={filters.sort}
                                    onChange={(e) => go({ sort: e.target.value })}
                                    className="h-9 rounded-[4px] border border-parchment-500 px-2 text-xs"
                                >
                                    <option value="popularity">Sort by: Popularity</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name">Name</option>
                                </select>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Recurrence class filter">
                                {['', 'R1', 'R2', 'R3', 'R4', 'R5'].map((c) => (
                                    <button
                                        key={c || 'all'}
                                        type="button"
                                        aria-pressed={filters.class === c}
                                        onClick={() => go({ class: c })}
                                        className={cn('rounded-full border px-3 py-1 text-xs', filters.class === c ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}
                                    >
                                        {c || 'All classes'}
                                    </button>
                                ))}
                            </div>
                        )}

                        <ul className="mt-4 divide-y divide-parchment-300 rounded-[6px] border border-parchment-300" role="radiogroup" aria-label="Subscriptions">
                            {plans.length === 0 && <li className="p-6 text-center text-sm text-ink-500">No subscriptions match your search.</li>}
                            {plans.map((p) => {
                                const Icon = PLAN_ICON[p.recurrence_class] ?? FileText;
                                const isSel = selected?.slug === p.slug;
                                return (
                                    <li key={p.slug} className={cn('flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap', isSel && 'bg-gold-50')}>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] border border-gold-300 bg-gold-50 text-gold-700">
                                            <Icon className="size-5" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-900">
                                                {p.name} <ClassChip code={p.recurrence_class} compact />
                                            </p>
                                            <p className="text-xs text-ink-500">{p.description}</p>
                                        </div>
                                        <p className="w-28 text-xs text-ink-500">
                                            From
                                            <br />
                                            <span className="text-sm font-bold text-ink-900">{rand(p.monthly_zar)}</span> /month
                                        </p>
                                        <Link href={`/subscriptions/${p.slug}`} className="text-xs font-semibold whitespace-nowrap text-gold-700 hover:underline">
                                            View Details →
                                        </Link>
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={isSel}
                                            aria-label={`Select ${p.name}`}
                                            onClick={() => go({ plan: p.slug })}
                                            className={cn('flex size-5 items-center justify-center rounded-full border-2', isSel ? 'border-gold-600' : 'border-ink-300')}
                                        >
                                            {isSel && <span className="size-2.5 rounded-full bg-gold-600" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <aside className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-bold text-ink-900">3. Your Selection</h2>
                        {selected ? (
                            <div className="mt-4 flex-1">
                                <p className="text-base font-semibold text-ink-900">{selected.name}</p>
                                <div className="mt-1">
                                    <ClassChip code={selected.recurrence_class} label={selected.class_name} />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-ink-900">
                                    {rand(selected.monthly_zar)}
                                    <span className="text-xs font-normal text-ink-500"> /month ex VAT</span>
                                </p>
                                <dl className="mt-3 space-y-2 text-xs">
                                    <div>
                                        <dt className="font-semibold text-ink-800">What repeats</dt>
                                        <dd className="text-ink-600">{selected.what_recurs}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-ink-800">Next-period value</dt>
                                        <dd className="text-ink-600">{selected.next_period_value}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-ink-800">How to stop</dt>
                                        <dd className="text-ink-600">{selected.cancellation_route}. No Sales call.</dd>
                                    </div>
                                </dl>
                                <p className="mt-3 rounded-[6px] bg-parchment-200 p-2 text-[0.6875rem] text-ink-600">Next: review how this subscription continues and how to cancel, then confirm.</p>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                                    <FileText className="size-8" aria-hidden="true" />
                                </span>
                                <p className="mt-3 text-sm font-semibold text-ink-900">No subscription selected yet</p>
                                <p className="mt-1 text-xs text-ink-500">Select a category and a subscription to see what happens next.</p>
                            </div>
                        )}
                        <div className="mt-4 border-t border-parchment-300 pt-3">
                            <p className="text-xs font-bold text-ink-900">Selection Summary</p>
                            <p className="text-xs text-ink-500">{selected ? `${selected.name} · ${rand(selected.monthly_zar)}/month` : 'No subscription selected.'}</p>
                        </div>
                        {selected ? (
                            <Link
                                href={`/subscriptions/${selected.slug}/disclosure`}
                                className="mt-3 flex h-10 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400"
                            >
                                Continue <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <button type="button" disabled className="mt-3 flex h-10 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 opacity-50">
                                Continue <ArrowRight className="size-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={!selected}
                            onClick={() =>
                                auth.user
                                    ? router.post('/saved', { item_type: 'subscription', item_key: selected!.slug, label: selected!.name, url: `/subscriptions/${selected!.slug}` }, { preserveScroll: true })
                                    : router.visit('/login')
                            }
                            className="mt-2 flex h-10 items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-medium text-ink-900 disabled:opacity-50"
                        >
                            <Bookmark className="size-4" /> Save for Later
                        </button>
                    </aside>
                </div>
            </div>
        </>
    );
}
