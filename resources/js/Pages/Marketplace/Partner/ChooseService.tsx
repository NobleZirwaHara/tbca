import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { ArrowRight, CircleCheck, ClipboardList, Headphones, Search, Send } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { MkListing } from '@/types/marketplace';

interface Props {
    categories: { value: string; label: string; count: number }[];
    services: MkListing[];
    filters: { category: string; q?: string; sort?: string };
}

export default function ChooseService({ categories, services, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [selected, setSelected] = useState<string | null>(null);
    const chosen = services.find((s) => s.slug === selected);

    const apply = (next: Partial<Props['filters']>) =>
        router.get('/partner-services/choose-service', { ...filters, q, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        apply({ q });
    };

    return (
        <div className="bg-parchment-100">
            <Head title="Choose a Partner Service" />
            <div className="container-tbca py-8">
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Choose a Partner Service' }]} />
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink-900">Choose a Partner Service</h1>
                        <p className="mt-1 text-sm text-ink-500">Select a category to view available services.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                        Step 1 of 3
                        {[1, 2, 3].map((n) => (
                            <span key={n} className={cn('flex size-7 items-center justify-center rounded-full text-xs font-bold', n === 1 ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-500')}>{n}</span>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-12">
                    <nav aria-label="Service categories" className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-3">
                        <h2 className="mb-3 text-sm font-semibold text-ink-900">1. Select a Category</h2>
                        <ul className="space-y-1">
                            {categories.map((c) => {
                                const active = c.value === filters.category;
                                return (
                                    <li key={c.value}>
                                        <Link
                                            href={`/partner-services/choose-service?category=${c.value}`}
                                            preserveScroll
                                            className={cn('flex items-center justify-between gap-2 rounded-[6px] border px-3 py-2 text-[0.8125rem]', active ? 'border-gold-500 bg-gold-50 font-semibold text-ink-900' : 'border-transparent text-ink-700 hover:bg-parchment-100')}
                                            aria-current={active ? 'true' : undefined}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className={cn('flex size-4 items-center justify-center rounded-[3px] border', active ? 'border-gold-600 bg-gold-500' : 'border-ink-300')}>{active && <span className="text-[10px] text-ink-900">✓</span>}</span>
                                                {c.label}
                                            </span>
                                            <span className={cn('rounded-full px-2 text-[0.6875rem]', active ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-600')}>{c.count}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-6">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-ink-900">2. Select a Service</h2>
                            <form onSubmit={submit} className="flex flex-wrap gap-2" role="search">
                                <label className="relative">
                                    <span className="sr-only">Search services</span>
                                    <Search className="pointer-events-none absolute top-3 left-2.5 size-4 text-ink-300" aria-hidden="true" />
                                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services..." className="w-48 pl-8" />
                                </label>
                                <label>
                                    <span className="sr-only">Sort</span>
                                    <Select value={filters.sort ?? 'popularity'} onChange={(e) => apply({ sort: e.target.value })} options={[{ value: 'popularity', label: 'Sort by: Popularity' }, { value: 'name', label: 'Sort by: Name' }]} className="w-44" />
                                </label>
                            </form>
                        </div>
                        <div role="radiogroup" aria-label="Services" className="divide-y divide-parchment-300 rounded-[6px] border border-parchment-300">
                            {services.length === 0 && <p className="p-6 text-center text-sm text-ink-400">No services match your search in this category.</p>}
                            {services.map((s) => (
                                <div key={s.slug} className={cn('flex items-center gap-3 p-3', selected === s.slug && 'bg-gold-50')}>
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-gold-300 text-gold-700"><ClipboardList className="size-4" aria-hidden="true" /></span>
                                    <button type="button" role="radio" aria-checked={selected === s.slug} onClick={() => setSelected(s.slug)} className="min-w-0 flex-1 text-left">
                                        <span className="block text-[0.875rem] font-semibold text-ink-900">{s.title}</span>
                                        <span className="block text-xs text-ink-500">{s.summary}</span>
                                    </button>
                                    <span aria-hidden="true" className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', selected === s.slug ? 'border-gold-600' : 'border-ink-300')}>
                                        {selected === s.slug && <span className="size-2 rounded-full bg-gold-600" />}
                                    </span>
                                    <Link href={`/partner-services/services/${s.slug}`} className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-800 sm:inline-flex">
                                        View Service <ArrowRight className="size-3" aria-hidden="true" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                        <h2 className="text-sm font-semibold text-ink-900">What Happens Next</h2>
                        <ol className="space-y-4">
                            {[
                                [CircleCheck, 'Choose a Category', 'Select a service category that matches your needs.'],
                                [ClipboardList, 'Review Available Services', 'Browse services and view details to find the right fit.'],
                                [Send, 'Continue to Request', 'Provide a few details so we can match you with the right expert.'],
                            ].map(([I, t, b]) => {
                                const Ico = I as typeof Send;
                                return (
                                    <li key={t as string} className="flex gap-3">
                                        <Ico className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                        <div><p className="text-[0.8125rem] font-semibold text-ink-900">{t as string}</p><p className="text-xs text-ink-500">{b as string}</p></div>
                                    </li>
                                );
                            })}
                        </ol>
                        <div className="border-t border-parchment-300 pt-4">
                            <p className="text-xs font-semibold text-ink-700">Selection Summary</p>
                            <p className="mt-1 text-sm text-ink-900">{chosen ? chosen.title : <span className="text-ink-400">No service selected yet.</span>}</p>
                        </div>
                        <Button type="button" className="w-full" disabled={!chosen} onClick={() => chosen && router.get('/partner-services/request', { service: chosen.slug })} trailingIcon="arrow-right">
                            Continue
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: 'Help choosing a partner service', section: 'Partner Services' })}>
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                        </Button>
                    </aside>
                </div>
            </div>
        </div>
    );
}
