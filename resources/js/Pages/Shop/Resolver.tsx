import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Headphones, HelpCircle, Info, Target } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { ShopCrumbs, TrustStrip } from '@/Components/Shop/Bits';
import { iconFor } from '@/Components/Shop/ShopIcon';
import ResultRow from '@/Components/Shop/ResultRow';
import { FilterSelect } from '@/Components/Shop/FilterCheckboxes';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { Aisle, Option, SearchResult } from '@/types/shop';

interface Priority {
    key: string;
    title: string;
    body: string;
    icon: string;
}

interface Props {
    priorities: Priority[];
    budgets: Option[];
    buyers: Option[];
    filters: { need: string; priority: string | null; buyer: string | null; budget: string | null; urgency: string | null; language: string; guided: boolean };
    result: { products: SearchResult[]; aisles: Aisle[]; total: number; priority: Priority | null; interpreted: string[] } | null;
}

const URGENCY: Option[] = [
    { value: 'this-week', label: 'This week' },
    { value: 'this-month', label: 'This month' },
    { value: 'exploring', label: 'Just exploring' },
];

export default function Resolver({ priorities, budgets, buyers, filters, result }: Props) {
    const [need, setNeed] = useState(filters.need);
    const [language, setLanguage] = useState(filters.language);
    const [priority, setPriority] = useState(filters.priority ?? '');
    const [buyer, setBuyer] = useState(filters.buyer ?? '');
    const [budget, setBudget] = useState(filters.budget ?? '');
    const [urgency, setUrgency] = useState(filters.urgency ?? '');

    const go = (patch: Record<string, string | boolean> = {}) => {
        const data = { need, language, priority, buyer, budget, urgency, guided: filters.guided ? '1' : '', ...patch };
        router.get('/shop/resolver', Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && (v as unknown) !== false)) as Record<string, string>, { preserveScroll: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        go();
    };

    return (
        <>
            <Head title="Services Resolver" />
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 motif-glow opacity-70" aria-hidden="true" />
                <div className="container-tbca relative py-8 md:py-10">
                    <ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Services Resolver' }]} />
                    <h1 className="font-serif text-[2.25rem] font-semibold md:text-[3rem]">Services Resolver</h1>
                    <p className="mt-1 font-serif text-lg text-gold-400 md:text-xl">Tell us what you need help with, and we'll guide you to the right TBCA solutions.</p>
                    <form onSubmit={submit} className="mt-6 rounded-[8px] border border-gold-600/60 bg-ink-950/80 p-4">
                        <label htmlFor="need" className="flex items-center gap-1.5 text-sm font-semibold">
                            Describe your business need, challenge or goal <Info className="size-4 text-gold-400" aria-hidden="true" />
                        </label>
                        <div className="mt-2 grid gap-3 md:grid-cols-[1fr_10rem_auto]">
                            <input
                                id="need"
                                value={need}
                                onChange={(e) => setNeed(e.target.value)}
                                maxLength={300}
                                placeholder='e.g. "I need help with compliance for my SME", "Raise funding for expansion", "Implement Zoho One"'
                                className="h-11 rounded-[4px] border border-ink-600 bg-ink-900 px-3 text-sm text-parchment-100 placeholder:text-ink-400"
                            />
                            <label className="sr-only" htmlFor="lang">Language</label>
                            <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} className="h-11 rounded-[4px] border border-ink-600 bg-ink-900 px-2 text-sm text-parchment-100">
                                <option value="en">English</option>
                                <option value="af">Afrikaans</option>
                            </select>
                            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Find the Right Solutions <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <div className="container-tbca py-8">
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <section aria-labelledby="priority-h">
                            <h2 id="priority-h" className="font-serif text-xl font-semibold text-ink-900">What best describes your immediate priority?</h2>
                            <p className="text-sm text-ink-500">Select a category to help us understand your top challenge.</p>
                            <div role="radiogroup" aria-labelledby="priority-h" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                {priorities.map((p) => {
                                    const Icon = iconFor(p.icon);
                                    const selected = priority === p.key;
                                    return (
                                        <button
                                            key={p.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            onClick={() => {
                                                setPriority(p.key);
                                                go({ priority: p.key });
                                            }}
                                            className={cn(
                                                'relative flex flex-col items-center rounded-[8px] border bg-white p-4 text-center transition-colors',
                                                selected ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300',
                                            )}
                                        >
                                            <span className={cn('absolute top-2 right-2 size-3.5 rounded-full border', selected ? 'border-gold-600 bg-gold-500' : 'border-ink-300')} aria-hidden="true" />
                                            <Icon className="size-9 text-gold-700" strokeWidth={1.5} aria-hidden="true" />
                                            <span className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{p.title}</span>
                                            <span className="mt-1 text-[0.6875rem] text-ink-500">{p.body}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <HelpCircle className="size-6 text-gold-700" aria-hidden="true" />
                            <p className="flex-1 text-sm">
                                <span className="font-semibold text-ink-900">Not sure?</span>
                                <span className="block text-xs text-ink-500">Answer a few quick questions in our guided resolver and we'll recommend the best path.</span>
                            </p>
                            <button type="button" onClick={() => go({ guided: '1' })} className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50">
                                Take the Guided Resolver <ArrowRight className="size-4" />
                            </button>
                        </div>

                        {filters.guided && (
                            <form onSubmit={submit} className="rounded-[8px] border border-gold-300 bg-gold-50/60 p-4" aria-label="Guided resolver">
                                <p className="mb-3 text-sm font-semibold text-ink-900">Guided Resolver - three quick questions</p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <FilterSelect label="1. Who are you buying for?" value={buyer} options={buyers} onChange={setBuyer} />
                                    <FilterSelect label="2. What is your budget?" value={budget} options={budgets} onChange={setBudget} />
                                    <FilterSelect label="3. How soon do you need it?" value={urgency} options={URGENCY} onChange={setUrgency} />
                                </div>
                                <button type="submit" className="mt-4 inline-flex h-9 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900">
                                    Show my matched paths <ArrowRight className="size-4" />
                                </button>
                            </form>
                        )}

                        {result && (
                            <section aria-labelledby="matched-h" className="space-y-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h2 id="matched-h" className="font-serif text-xl font-semibold text-ink-900">Your matched paths</h2>
                                    <p className="text-xs text-ink-500">
                                        {result.total} governed matches
                                        {result.priority && <> for <strong>{result.priority.title}</strong></>}
                                        {result.interpreted.length > 0 && <> · interpreted as "{result.interpreted.join(' ')}"</>}
                                    </p>
                                </div>
                                {result.aisles.length > 0 && (
                                    <ul className="flex flex-wrap gap-2">
                                        {result.aisles.map((a) => (
                                            <li key={a.slug}>
                                                <Link href={`/shop/aisle/${a.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-gold-400 bg-white px-3 py-1 text-xs font-semibold text-ink-800 hover:bg-gold-50">
                                                    <Target className="size-3.5 text-gold-600" aria-hidden="true" /> {a.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {result.products.length === 0 ? (
                                    <p className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-6 text-sm text-ink-600">
                                        No governed product fits yet. <Link href="/shop/product/tax-due-diligence-compliance-review" className="font-semibold text-gold-700">Request a scoped quote</Link> or talk to an advisor.
                                    </p>
                                ) : (
                                    <ul className="space-y-3">{result.products.map((r) => <li key={r.key}><ResultRow r={r} /></li>)}</ul>
                                )}
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-serif text-lg font-semibold text-ink-900">How it works</h2>
                            <p className="text-xs text-ink-500">Three simple steps to the right solutions.</p>
                            <ol className="mt-4 space-y-4">
                                {[
                                    ['Tell us what you need', 'Share your challenge, goal or context.'],
                                    ['We analyse & match', 'We map your need to the right services and solutions.'],
                                    ['Get your matched paths', 'Review recommended solutions and take the next step.'],
                                ].map(([t, b], i) => (
                                    <li key={t} className="flex gap-3">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-gold-400">{i + 1}</span>
                                        <span><span className="block text-sm font-semibold text-ink-900">{t}</span><span className="text-xs text-ink-500">{b}</span></span>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-5 rounded-[6px] bg-parchment-200 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Headphones className="size-5 text-gold-700" aria-hidden="true" /> Prefer to talk?</p>
                                <p className="mt-1 text-xs text-ink-600">Speak to a TBCA expert for personalised guidance.</p>
                                <button type="button" onClick={() => openAskQuestion({ subject: 'Services Resolver', section: 'shop' })} className="mt-2 text-xs font-semibold text-gold-700">Talk to TBCA →</button>
                            </div>
                        </section>
                    </aside>
                </div>

                <section className="mt-8 flex flex-col gap-4 rounded-[12px] bg-ink-950 p-6 text-parchment-100 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-serif text-xl font-semibold">Already know what you're looking for?</h2>
                        <p className="text-sm text-ink-200">Browse our A-Z categories, search the full shop, or explore curated solutions.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href="/shop/a-z" variant="outline-light" size="sm" trailingIcon="arrow-right">Browse A-Z</ButtonLink>
                        <ButtonLink href="/search" variant="outline-light" size="sm" trailingIcon="arrow-right">Search All Products</ButtonLink>
                        <ButtonLink href="/shop" variant="outline-light" size="sm" trailingIcon="arrow-right">Back to Online Shop</ButtonLink>
                    </div>
                </section>
            </div>
            <TrustStrip />
        </>
    );
}
