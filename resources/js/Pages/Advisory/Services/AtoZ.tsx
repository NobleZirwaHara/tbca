import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Clock, Heart, MessageCircle, Search, UserCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Svc {
    slug: string;
    letter: string;
    sub_category: string;
    title: string;
    summary: string;
    price_zar: number;
    duration: string;
    delivery: string;
}
interface Props {
    categories: { letter: string; name: string }[];
    counts: Record<string, number>;
    services: Svc[];
    filters: { letter: string; q: string; sort: string; delivery: string };
}

export default function AtoZ({ categories, counts, services, filters }: Props) {
    const price = usePrice();
    const { auth } = usePage<SharedProps>().props;
    const [q, setQ] = useState(filters.q);
    const [quick, setQuick] = useState<Svc | null>(null);
    const go = (patch: Partial<Props['filters']>) => router.get('/services/a-z', { ...filters, ...patch }, { preserveScroll: true, preserveState: true });
    const selected = categories.find((c) => c.letter === filters.letter);

    function search(e: FormEvent) {
        e.preventDefault();
        go({ q });
    }

    function save(s: Svc) {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post('/saved', { item_type: 'service', item_key: s.slug, label: s.title, url: `/services/catalogue/${s.slug}` }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="A-Z Service Categories" />
            <div className="container-tbca py-8">
                <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: 'A-Z Service Categories' }]} />
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-[2rem] font-semibold text-ink-900">A-Z Service Categories</h1>
                        <p className="text-sm text-ink-600">Browse TBCA service Sprints by alphabetical category and explore the options that best match your business need.</p>
                    </div>
                    <form onSubmit={search} className="flex flex-wrap gap-2" role="search">
                        <label className="sr-only" htmlFor="az-q">
                            Search Sprints
                        </label>
                        <div className="relative">
                            <Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" />
                            <Input id="az-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Sprints in this category..." className="w-64 pl-9" />
                        </div>
                        <Select aria-label="Delivery filter" value={filters.delivery} onChange={(e) => go({ delivery: e.target.value })} placeholder="All delivery" options={['Portal Delivery', 'Fixed Scope', 'Package Available']} className="w-40" />
                        <Select
                            aria-label="Sort by"
                            value={filters.sort}
                            onChange={(e) => go({ sort: e.target.value })}
                            options={[
                                { value: 'popularity', label: 'Sort by: Popularity' },
                                { value: 'price-asc', label: 'Price: low to high' },
                                { value: 'price-desc', label: 'Price: high to low' },
                                { value: 'name', label: 'Name A–Z' },
                            ]}
                            className="w-48"
                        />
                    </form>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <p className="flex justify-between px-1 pb-2 text-xs font-semibold text-ink-700">
                                Browse by Letter Category <span className="font-normal text-ink-400">Sprints</span>
                            </p>
                            <ul className="max-h-[560px] space-y-0.5 overflow-y-auto">
                                {categories.map((c) => (
                                    <li key={c.letter}>
                                        <button
                                            type="button"
                                            onClick={() => go({ letter: c.letter, q: '' })}
                                            className={cn('flex w-full items-start gap-2 rounded px-1.5 py-1.5 text-left text-xs', filters.letter === c.letter ? 'bg-gold-50 font-semibold text-ink-900 ring-1 ring-gold-300' : 'text-ink-600 hover:bg-parchment-200')}
                                        >
                                            <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded font-bold', filters.letter === c.letter ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300')}>{c.letter}</span>
                                            <span className="flex-1">{c.name}</span>
                                            <span className="text-ink-400">{counts[c.letter] ?? 0}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <section className="lg:col-span-6">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <p className="text-sm font-semibold text-ink-900">
                                {filters.letter === 'ALL' ? 'All Categories' : `${filters.letter} Category`} <span className="text-ink-400">|</span> {services.length} Sprints
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Letters">
                                {['ALL', ...categories.map((c) => c.letter)].map((l) => (
                                    <button key={l} type="button" role="tab" aria-selected={filters.letter === l} onClick={() => go({ letter: l, q: '' })} className={cn('min-w-7 rounded px-1.5 py-1 text-xs font-semibold', filters.letter === l ? 'bg-gold-500 text-ink-900' : 'text-ink-500 hover:bg-parchment-200')}>
                                        {l === 'ALL' ? 'All' : l}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {services.map((s) => (
                                    <article key={s.slug} className="flex flex-col rounded-[8px] border border-parchment-400 p-3.5 hover:border-gold-300">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-[0.6875rem] font-semibold text-gold-700">{s.sub_category}</p>
                                            <button type="button" onClick={() => save(s)} aria-label={`Save ${s.title}`} className="text-ink-400 hover:text-risk-500">
                                                <Heart className="size-4" />
                                            </button>
                                        </div>
                                        <h2 className="text-sm font-semibold text-ink-900">{s.title}</h2>
                                        <p className="mt-1 flex-1 text-xs text-ink-600">{s.summary}</p>
                                        <p className="mt-2 text-sm">
                                            From <span className="font-bold text-gold-700">{price(s.price_zar)}</span> <span className="text-xs text-verified-700">· USD Available</span>
                                        </p>
                                        <p className="mt-1 flex flex-wrap gap-3 text-[0.6875rem] text-ink-500">
                                            <span className="inline-flex items-center gap-1"><Clock className="size-3" />{s.duration}</span>
                                            <span className="inline-flex items-center gap-1"><UserCheck className="size-3" />Human Reviewed</span>
                                            <span>{s.delivery}</span>
                                        </p>
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <button type="button" onClick={() => setQuick(s)} className="text-xs font-semibold text-controlled-700 underline">
                                                Quick View
                                            </button>
                                            <ButtonLink href={`/services/catalogue/${s.slug}`} size="sm" trailingIcon="arrow-right">
                                                View Sprint
                                            </ButtonLink>
                                        </div>
                                    </article>
                                ))}
                                {services.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-ink-500">No Sprints match. Try another letter or clear the search.</p>}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                            <h2 className="font-semibold text-ink-900">How This Page Works</h2>
                            <ol className="mt-2 space-y-2 text-xs text-ink-600">
                                <li><b className="text-ink-900">Choose a letter category</b> — Select a letter from the list to view Sprints in that category.</li>
                                <li><b className="text-ink-900">Browse available Sprints</b> — Explore Sprints with pricing, delivery time and key details.</li>
                                <li><b className="text-ink-900">Open the Sprint that fits your need</b> — View more details, packages and options for the right solution.</li>
                            </ol>
                        </div>
                        {selected && (
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                <p className="text-xs font-semibold text-ink-500">Selected Category</p>
                                <div className="mt-2 flex gap-3">
                                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded bg-gold-500 font-serif text-2xl font-bold text-ink-900">{selected.letter}</span>
                                    <p className="text-sm font-semibold text-ink-900">{selected.name}</p>
                                </div>
                                <p className="mt-2 text-xs text-ink-500">
                                    {services.length} Sprints shown for {selected.letter}
                                </p>
                            </div>
                        )}
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                            <p className="font-semibold text-ink-900">Need Help?</p>
                            <p className="text-xs text-ink-500">Our experts are ready to assist.</p>
                            <ButtonLink href="/services/proposal-request" className="mt-3 w-full" trailingIcon="arrow-right">
                                Talk to a Consultant
                            </ButtonLink>
                            <a href="https://wa.me/27120010567" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded border border-ink-300 text-sm font-medium">
                                <MessageCircle className="size-4 text-verified-500" /> Ask on WhatsApp
                            </a>
                        </div>
                    </aside>
                </div>
            </div>
            <Modal open={quick !== null} onClose={() => setQuick(null)} title={quick?.title ?? ''} footer={quick && <><Button variant="outline" onClick={() => setQuick(null)}>Close</Button><ButtonLink href={`/services/catalogue/${quick.slug}`}>View Sprint</ButtonLink></>}>
                {quick && (
                    <div className="space-y-2 text-sm text-ink-700">
                        <p className="text-xs font-semibold text-gold-700">{quick.sub_category}</p>
                        <p>{quick.summary}</p>
                        <p>
                            From <b>{price(quick.price_zar)}</b> excl. VAT · {quick.duration} · {quick.delivery}
                        </p>
                        <Link href={`/services/catalogue/${quick.slug}`} className="text-xs font-semibold text-gold-700 underline">See recommended sprints and full details</Link>
                    </div>
                )}
            </Modal>
        </>
    );
}
