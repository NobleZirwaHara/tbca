import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Bookmark, Check, FileText, Headphones, Search } from 'lucide-react';
import { PageTitle, CheckList, LabelValues } from '@/Components/Products/Shared';
import { Stepper } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { RetService, RetServiceFull } from '@/Components/Products/Retainers/types';
import { retIcon } from '@/Components/Products/Retainers/ui';

interface Props {
    categories: { key: string; label: string; count: number }[];
    category: string;
    services: RetService[];
    filters: { q: string; sort: string };
    selected: RetServiceFull | null;
}

export default function Choose({ categories, category, services, filters, selected }: Props) {
    const price = usePrice();
    const [q, setQ] = useState(filters.q);
    const go = (params: Record<string, string>) => router.get('/retainers/choose', Object.fromEntries(Object.entries({ category, q: filters.q, sort: filters.sort, ...params }).filter(([, v]) => v)), { preserveScroll: true, preserveState: true });

    const search = (e: FormEvent) => {
        e.preventDefault();
        go({ q, service: '' });
    };

    return (
        <>
            <Head title="Choose a Retainer Service" />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: 'Choose a Retainer Service' }]}
                title="Choose a Retainer Service"
                lead="Select a category to view available retainer services."
                aside={<Stepper className="w-72" steps={['Choose service', 'Exclusions & economics', 'Request proposal']} current={1} />}
            />

            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-[260px_1fr_300px]">
                <aside className="rounded-[8px] border border-parchment-400 bg-white p-4">
                    <h2 className="text-sm font-semibold text-ink-900">1. Select a Category</h2>
                    <ul className="mt-3 space-y-1" role="listbox" aria-label="Retainer categories">
                        {categories.map((c) => {
                            const active = c.key === category;
                            return (
                                <li key={c.key}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => go({ category: c.key, q: '', service: '' })}
                                        className={cn('flex w-full items-center justify-between gap-2 rounded-[6px] px-2.5 py-2 text-left text-[0.8125rem]', active ? 'bg-gold-50 font-semibold text-ink-900 ring-1 ring-gold-300' : 'text-ink-700 hover:bg-parchment-100')}
                                    >
                                        <span className="flex items-center gap-2">
                                            {active && <Check className="size-3.5 text-gold-600" aria-hidden="true" />}
                                            {c.label}
                                        </span>
                                        <span className={cn('rounded-full px-1.5 text-[0.6875rem]', active ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-600')}>{c.count}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-4 rounded-[6px] border border-gold-200 bg-gold-50 p-3 text-center">
                        <p className="text-xs font-semibold text-gold-800">Need help choosing?</p>
                        <p className="mt-1 text-[0.6875rem] text-ink-600">Talk to a TBCA specialist who can help match the right retainer to your goals.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Help choosing a retainer', section: 'retainers' })} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 bg-white px-3 text-xs font-semibold text-ink-900">
                            <Headphones className="size-3.5" aria-hidden="true" /> Talk to a Specialist
                        </button>
                    </div>
                </aside>

                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-ink-900">2. Select a Retainer Service</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <form onSubmit={search} role="search" className="relative">
                                <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-400" aria-hidden="true" />
                                <label htmlFor="ret-search" className="sr-only">
                                    Search retainer services
                                </label>
                                <input id="ret-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search retainer services..." className="h-9 w-56 rounded-[4px] border border-parchment-500 pr-2 pl-8 text-[0.8125rem] focus:border-gold-500 focus:outline-none" />
                            </form>
                            <label className="sr-only" htmlFor="ret-sort">
                                Sort by
                            </label>
                            <select id="ret-sort" value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]">
                                <option value="popularity">Sort by: Popularity</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name">Name A–Z</option>
                            </select>
                        </div>
                    </div>

                    <ul className="mt-4 divide-y divide-parchment-300" role="radiogroup" aria-label="Retainer services">
                        {services.length === 0 && <li className="py-8 text-center text-sm text-ink-400">No retainer services match your search.</li>}
                        {services.map((s) => {
                            const Icon = retIcon(s.icon);
                            const active = selected?.slug === s.slug;
                            return (
                                <li key={s.slug} className={cn('grid grid-cols-[auto_1fr] items-center gap-3 py-3 sm:grid-cols-[auto_1fr_auto_auto_auto]', active && 'bg-gold-50/50')}>
                                    <span className="flex size-10 items-center justify-center rounded-[6px] border border-gold-300 bg-gold-50 text-gold-700">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.875rem] font-semibold text-ink-900">{s.name}</p>
                                        <p className="text-xs text-ink-500">{s.summary}</p>
                                    </div>
                                    <p className="text-xs text-ink-500 sm:text-right">
                                        From
                                        <span className="block text-sm font-bold text-ink-900">
                                            {price(s.price_zar)} <span className="text-[0.6875rem] font-normal text-ink-500">/month</span>
                                        </span>
                                    </p>
                                    <Link href={`/retainers/${s.slug}`} className="text-xs font-semibold text-gold-700 hover:underline">
                                        View Details →
                                    </Link>
                                    <button type="button" role="radio" aria-checked={active} aria-label={`Select ${s.name}`} onClick={() => go({ service: s.slug })} className={cn('flex size-5 items-center justify-center rounded-full border', active ? 'border-gold-600' : 'border-ink-300')}>
                                        {active && <span className="size-2.5 rounded-full bg-gold-600" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <aside className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
                    <h2 className="text-sm font-semibold text-ink-900">3. Your Selection</h2>
                    {selected ? (
                        <div className="mt-4 flex-1 space-y-3">
                            <p className="font-semibold text-ink-900">{selected.name}</p>
                            <p className="text-xs text-ink-500">{selected.summary}</p>
                            <LabelValues
                                rows={[
                                    { label: 'Allowance', value: `${selected.allowance_qty} hours / month` },
                                    { label: 'From', value: price(selected.price_zar) + ' /month' },
                                    { label: 'Service level', value: selected.response_window },
                                    { label: 'Unused allowance', value: selected.unused_label },
                                ]}
                            />
                            <p className="text-xs font-semibold text-ink-700">What happens next</p>
                            <CheckList items={['Review the exclusion register', 'Read the utilisation economics disclosure', 'Request a scoped, capacity-tested proposal']} />
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                            <span className="flex size-16 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                                <FileText className="size-7" aria-hidden="true" />
                            </span>
                            <p className="mt-3 text-sm font-semibold text-ink-900">No service selected yet</p>
                            <p className="mt-1 text-xs text-ink-500">Select a category and a service to see what happens next.</p>
                        </div>
                    )}
                    <div className="mt-4 border-t border-parchment-300 pt-3">
                        <p className="text-xs font-semibold text-ink-800">Selection Summary</p>
                        <p className="text-xs text-ink-500">{selected ? `${selected.category_label} · ${selected.name}` : 'No service selected.'}</p>
                    </div>
                    <div className="mt-3 space-y-2">
                        {selected ? (
                            <Link href={`/retainers/${selected.slug}/exclusions`} className="flex h-10 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Continue <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        ) : (
                            <button type="button" disabled className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-300 text-sm font-semibold text-ink-700 opacity-70">
                                Continue <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={!selected}
                            onClick={() => selected && router.post('/saved', { item_type: 'retainer', item_key: selected.slug, label: selected.name, url: `/retainers/${selected.slug}` }, { preserveScroll: true })}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50 disabled:opacity-50"
                        >
                            <Bookmark className="size-4" aria-hidden="true" /> Save for Later
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
