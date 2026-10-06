import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, CircleCheck, Headphones, PlayCircle, ShoppingCart } from 'lucide-react';
import CoverArt from '@/Components/Art/CoverArt';
import DiagnosticsWalkthrough from '@/Components/CorePages/DiagnosticsWalkthrough';
import { useState } from 'react';
import Icon from '@/Components/ui/Icon';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { ProgressRing } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { DiagnosticPack } from '@/types/core-pages';

interface Props {
    categories: { key: string; title: string; icon: string; body: string }[];
    packs: DiagnosticPack[];
    category: string | null;
}

const steps = [
    ['clipboard-list', 'Choose Diagnostic', 'Select a diagnostic that matches your needs'],
    ['notebook-pen', 'Complete Assessment', 'Answer structured questions and provide information'],
    ['cpu', 'AI Analysis', 'Our AI engine analyses your data against benchmarks'],
    ['user-check', 'Expert Review', 'Human experts validate and enrich the findings'],
    ['file-check', 'Receive Report', 'Get your comprehensive diagnostic report instantly'],
    ['target', 'Action Plan', 'Prioritised recommendations and next steps'],
];

const why = ['Proprietary AI Diagnostic Engine', 'Human expert validation', 'African market benchmarks (54 countries)', 'Industry-specific insights', 'Actionable recommendations', 'Secure and confidential', 'Instant digital delivery', 'Follow-up advisory available'];

export default function Diagnostics({ categories, packs, category }: Props) {
    const [customOpen, setCustomOpen] = useState(false);
    const price = usePrice();
    const quote = useForm({ name: '', email: '', company: '', needs: '', subject: 'Custom Diagnostic request', section: 'core', redirect: '/diagnostics' });

    const addToCart = (p: DiagnosticPack) =>
        router.post('/basket', { item_type: 'diagnostic', item_code: p.code, name: p.title, unit_zar: p.zar, commercial_act: 'purchase' }, { preserveScroll: true });

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title="Diagnostics" />
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <h1 className="text-[2.25rem] leading-[1.08] font-bold text-parchment-100 md:text-[2.75rem]">
                            Diagnostics That Reveal.
                            <br />
                            <span className="text-gold-500">Insights That Drive Action.</span>
                        </h1>
                        <p className="mt-4 text-[0.9375rem] leading-relaxed">
                            Comprehensive business diagnostics, assessments and benchmarks powered by AI and expert methodology. Understand your current state. Identify gaps. Prioritise what matters.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a href="#categories" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">Browse Diagnostics <ArrowRight className="size-4" aria-hidden="true" /></a>
                            <a href="#walkthrough" className="inline-flex items-center gap-3 rounded-[4px] border border-gold-600 px-4 py-1.5 text-parchment-100 hover:border-gold-400">
                                <PlayCircle className="size-6 text-gold-400" aria-hidden="true" />
                                <span><span className="block text-sm font-semibold">How Diagnostics Work</span><span className="block text-[0.6875rem] text-ink-300">Watch the 30-second walkthrough</span></span>
                            </a>
                        </div>
                        <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
                            {[['sparkles', 'AI-Powered Analysis'], ['user-check', 'Human-Reviewed Validation'], ['bar-chart-3', 'Benchmark Comparison'], ['download', 'Instant Reports'], ['lock', 'Secure & Confidential'], ['globe', 'Africa Market Data']].map(([i, l]) => (
                                <li key={l} className="flex flex-col items-center gap-1.5 rounded-[6px] border border-gold-700/40 p-2 text-center text-[0.625rem] leading-tight">
                                    <Icon name={i} className="size-5 text-gold-500" />
                                    {l}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6" aria-label="Sample diagnostic output">
                        <div className="flex items-center gap-4 rounded-[8px] border border-gold-700/50 bg-ink-900/70 p-4 text-parchment-100">
                            <ProgressRing value={76} label="76" sub="/100" track="dark" />
                            <div>
                                <p className="text-[0.6875rem] font-semibold tracking-wide text-gold-400 uppercase">Business Health Score</p>
                                <p className="mt-1 text-sm">Good — growth ready</p>
                            </div>
                        </div>
                        <div className="rounded-[8px] border border-gold-700/50 bg-ink-900/70 p-4">
                            <p className="text-[0.6875rem] font-semibold tracking-wide text-gold-400 uppercase">Key Insights</p>
                            <ul className="mt-2 space-y-1 text-[0.8125rem]">
                                <li>4 Critical Issues</li>
                                <li>7 Improvement Areas</li>
                                <li>12 Opportunities</li>
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-gold-700/50 bg-ink-900/70 p-4 sm:col-span-2">
                            <p className="text-[0.6875rem] font-semibold tracking-wide text-gold-400 uppercase">Risk Exposure</p>
                            <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                                <span className="w-[20%] bg-risk-500" />
                                <span className="w-[35%] bg-attested-500" />
                                <span className="w-[45%] bg-verified-500" />
                            </div>
                            <p className="mt-1 flex justify-between text-[0.6875rem]"><span>High</span><span>Medium</span><span>Low</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="categories" className="container-tbca grid gap-5 pb-6 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <h2 className="text-[1.0625rem] font-semibold text-parchment-100">Explore Our Diagnostic Categories</h2>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {categories.map((c) => (
                            <li key={c.key}>
                                <Link
                                    href={c.key === 'business-health' ? '/business-health-score' : `/diagnostics?category=${c.key}#packs`}
                                    preserveScroll
                                    className={cn('flex h-full flex-col rounded-[6px] border bg-ink-900/60 p-3 hover:border-gold-500', category === c.key ? 'border-gold-500' : 'border-gold-700/40')}
                                >
                                    <CoverArt seed={`dx-cat-${c.key}`} category="diagnostics" label={c.title} className="-mx-3 -mt-3 mb-2 aspect-[16/9] rounded-t-[6px]" />
                                    <Icon name={c.icon} className="size-6 text-gold-500" />
                                    <span className="mt-2 text-[0.8125rem] font-semibold text-parchment-100">{c.title}</span>
                                    <span className="mt-1 text-[0.6875rem] leading-snug">{c.body}</span>
                                    <span className="mt-auto pt-2 text-[0.6875rem] font-semibold text-gold-400">Explore →</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <h2 id="walkthrough" className="mt-8 scroll-mt-24 text-[1.0625rem] font-semibold text-parchment-100">How Diagnostics Work — Walkthrough</h2>
                    <p className="mt-1 text-[0.8125rem]">Play the walkthrough to see each step of the Diagnostics journey, or jump to a chapter.</p>
                    <DiagnosticsWalkthrough className="mt-3" />
                    <ol className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {steps.map(([i, t, b], n) => (
                            <li key={t} className="flex gap-2">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{n + 1}</span>
                                <span>
                                    <Icon name={i} className="size-5 text-gold-500" />
                                    <span className="mt-1 block text-[0.8125rem] font-semibold text-parchment-100">{t}</span>
                                    <span className="block text-[0.6875rem] leading-snug">{b}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4">
                        <h2 className="text-[0.9375rem] font-semibold text-gold-400">Why Choose TBCA Diagnostics?</h2>
                        <ul className="mt-3 space-y-2">
                            {why.map((w) => (
                                <li key={w} className="flex gap-2 text-[0.8125rem]"><CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />{w}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4">
                        <h2 className="text-[0.9375rem] font-semibold text-gold-400">Need Help Choosing?</h2>
                        <p className="mt-1 text-[0.8125rem]">Our experts can help you select the right diagnostic for your goals.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Help choosing a diagnostic', section: 'diagnostics' })} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                        </button>
                    </div>
                </aside>
            </section>

            <section id="packs" className="container-tbca pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[1.0625rem] font-semibold text-parchment-100">Most Popular Diagnostic Packs</h2>
                    {category && (
                        <Link href="/diagnostics#packs" preserveScroll className="text-[0.75rem] font-semibold text-gold-400">
                            Showing {categories.find((c) => c.key === category)?.title} · Show all
                        </Link>
                    )}
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {packs.map((p) => (
                        <li key={p.code} className="flex flex-col overflow-hidden rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4">
                            <CoverArt seed={p.code} category="diagnostics" label={p.title} className="-mx-4 -mt-4 mb-3 aspect-[16/9]" />
                            <div className="flex items-start gap-2.5">
                                <Icon name={p.icon} className="size-7 shrink-0 text-gold-500" />
                                <div>
                                    <h3 className="text-[0.875rem] leading-snug font-semibold text-parchment-100">{p.title}</h3>
                                    <p className="mt-0.5 text-[0.6875rem]">{p.body}</p>
                                </div>
                            </div>
                            <p className="mt-3 flex items-baseline justify-between gap-2">
                                <span className="text-[1.0625rem] font-bold text-gold-400">{p.from && 'From '}{price(p.zar)}</span>
                            </p>
                            <ul className="mt-2 space-y-1">
                                {p.features.map((f) => (
                                    <li key={f} className="flex gap-1.5 text-[0.75rem]"><CircleCheck className="mt-0.5 size-3.5 shrink-0 text-gold-500" aria-hidden="true" />{f}</li>
                                ))}
                            </ul>
                            {p.custom ? (
                                <button type="button" onClick={() => setCustomOpen(true)} className="mt-auto inline-flex h-9 items-center justify-center gap-1 rounded-[4px] bg-gold-500 pt-0 text-[0.8125rem] font-semibold text-ink-900 [margin-top:auto]">
                                    Request Custom <ArrowRight className="size-3.5" aria-hidden="true" />
                                </button>
                            ) : (
                                <button type="button" onClick={() => addToCart(p)} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-gold-600 text-[0.8125rem] font-semibold text-gold-400 hover:bg-gold-500 hover:text-ink-900">
                                    <ShoppingCart className="size-3.5" aria-hidden="true" /> Add to Cart
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="container-tbca pb-12">
                <ul className="grid gap-4 rounded-[8px] border border-gold-700/40 bg-ink-900/40 p-4 sm:grid-cols-3 lg:grid-cols-5">
                    {[['lock', '100% Confidential', 'Your data is always secure'], ['users', 'Human + AI Advantage', 'Best of both worlds'], ['map-pin', 'Africa (Active)', 'Market intelligence across 54 countries'], ['clock', 'Results in 24 Hours', 'Most reports delivered fast'], ['target', 'Action-Oriented', 'Insights that drive results']].map(([i, t, b]) => (
                        <li key={t} className="flex gap-2.5">
                            <Icon name={i} className="size-6 shrink-0 text-gold-500" />
                            <span><span className="block text-[0.8125rem] font-semibold text-parchment-100">{t}</span><span className="block text-[0.6875rem]">{b}</span></span>
                        </li>
                    ))}
                </ul>
            </section>

            <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Request a Custom Diagnostic">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        quote.post('/forms/quote-request', { preserveScroll: true, onSuccess: () => setCustomOpen(false) });
                    }}
                >
                    <Field label="Your name" required error={quote.errors.name}>{(id) => <Input id={id} required value={quote.data.name} onChange={(e) => quote.setData('name', e.target.value)} />}</Field>
                    <Field label="Email" required error={quote.errors.email}>{(id) => <Input id={id} type="email" required value={quote.data.email} onChange={(e) => quote.setData('email', e.target.value)} />}</Field>
                    <Field label="Company">{(id) => <Input id={id} value={quote.data.company} onChange={(e) => quote.setData('company', e.target.value)} />}</Field>
                    <Field label="What should the diagnostic cover?" required>{(id) => <Textarea id={id} required value={quote.data.needs} onChange={(e) => quote.setData('needs', e.target.value)} />}</Field>
                    <button type="submit" disabled={quote.processing} className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Request Custom Quote</button>
                </form>
            </Modal>
        </div>
    );
}
