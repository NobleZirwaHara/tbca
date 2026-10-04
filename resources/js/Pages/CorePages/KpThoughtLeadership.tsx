import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Mic, PlayCircle, Presentation, Users, Video } from 'lucide-react';
import { useState } from 'react';
import Icon from '@/Components/ui/Icon';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';
import type { KpInsight } from '@/types/core-pages';

interface Props {
    insights: KpInsight[];
    numbers: { value: string; label: string; icon: string }[];
    formats: { key: string; label: string }[];
    topics: string[];
    filters: { format: string; topic: string | null };
}

const engagements = ['Book KP to Speak', 'Advisory Session', 'Boardroom Briefing', 'Media & Interviews'];

export default function KpThoughtLeadership({ insights, numbers, formats, topics, filters }: Props) {
    const [reading, setReading] = useState<KpInsight | null>(null);
    const [engageOpen, setEngageOpen] = useState(false);
    const form = useForm({ name: '', email: '', organisation: '', engagement: engagements[0], details: '', subject: 'KP engagement request', section: 'core' });

    const go = (next: Partial<Props['filters']>) => router.get('/kp-thought-leadership', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const engage = (type: string) => {
        form.setData('engagement', type);
        setEngageOpen(true);
    };

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title="KP Thought Leadership" />
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <h1 className="text-[2.25rem] leading-[1.08] font-semibold text-parchment-100 md:text-[2.75rem]">
                            KP Thought Leadership.
                            <br />
                            <span className="text-gold-500">Ideas. Insights. Impact.</span>
                        </h1>
                        <p className="mt-4 text-[0.9375rem] leading-relaxed">
                            Strategic perspectives from Kruger Phiri on business, investment, leadership, innovation and Africa&rsquo;s transformation. Real experience. Practical wisdom. Proven impact.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button type="button" onClick={() => go({ format: 'featured', topic: null })} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Explore All Insights <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => go({ format: 'video' })} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-600 px-5 text-sm text-parchment-100 hover:text-gold-300">
                                <PlayCircle className="size-4" aria-hidden="true" /> Watch KP in Action
                            </button>
                        </div>
                    </div>
                    <div className="relative hidden items-center justify-center lg:col-span-4 lg:flex" aria-hidden="true">
                        <div className="text-center">
                            <p className="font-serif text-[4.5rem] leading-none font-bold text-gold-500">KP</p>
                            <p className="mt-2 font-serif text-xl tracking-[0.3em] text-gold-400">KRUGER PHIRI</p>
                            <p className="mt-1 text-[0.6875rem] tracking-widest text-ink-300 uppercase">Founder-Led Strategic Advisory</p>
                            <p className="text-[0.6875rem] tracking-widest text-ink-300 uppercase">Diagnose. Prepare. Execute.</p>
                        </div>
                    </div>
                    <aside className="rounded-[10px] border border-gold-700/50 bg-ink-900/70 p-5 lg:col-span-3">
                        <h2 className="text-center text-[1rem] font-semibold text-gold-400">KP by the Numbers</h2>
                        <ul className="mt-3 space-y-2.5">
                            {numbers.map((n) => (
                                <li key={n.label} className="flex items-center gap-3">
                                    <Icon name={n.icon} className="size-6 text-gold-500" />
                                    <span>
                                        <span className="block text-[1rem] font-bold text-parchment-100">{n.value}</span>
                                        <span className="block text-[0.6875rem]">{n.label}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </section>

            <section className="container-tbca grid gap-5 pb-6 lg:grid-cols-12">
                <div className="rounded-[8px] border border-gold-700/40 bg-ink-900/40 p-4 lg:col-span-9">
                    <div role="tablist" aria-label="Insight formats" className="flex gap-1 overflow-x-auto border-b border-ink-800">
                        {formats.map((f) => (
                            <button key={f.key} type="button" role="tab" aria-selected={filters.format === f.key} onClick={() => go({ format: f.key })} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem]', filters.format === f.key ? 'border-gold-500 text-gold-400' : 'border-transparent hover:text-gold-300')}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {filters.topic && (
                        <p className="mt-3 text-[0.75rem]">
                            Topic: <strong className="text-gold-400">{filters.topic}</strong>{' '}
                            <button type="button" className="underline" onClick={() => go({ topic: null })}>clear</button>
                        </p>
                    )}
                    {insights.length === 0 ? (
                        <p className="py-10 text-center text-[0.875rem] text-ink-300">No insights in this format yet. Try Featured Insights.</p>
                    ) : (
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {insights.map((i) => (
                                <li key={i.slug} className="flex flex-col overflow-hidden rounded-[6px] border border-gold-700/40 bg-ink-900">
                                    <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
                                        <Icon name={i.icon} className="size-10 text-gold-500/80" />
                                        <span className="absolute top-1.5 left-1.5 rounded-[2px] border border-gold-600/60 bg-ink-950/80 px-1.5 text-[0.5625rem] font-bold text-gold-400 uppercase">{i.tag}</span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-3">
                                        <h3 className="text-[0.875rem] leading-snug font-semibold text-parchment-100">{i.title}</h3>
                                        <p className="mt-1.5 text-[0.75rem] leading-relaxed">{i.body}</p>
                                        <button type="button" onClick={() => setReading(i)} className="mt-auto inline-flex items-center gap-1 pt-2 text-[0.75rem] font-semibold text-gold-400">
                                            Read More <ArrowRight className="size-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <aside className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4 lg:col-span-3">
                    <h2 className="text-[0.9375rem] font-semibold text-parchment-100">Popular Topics</h2>
                    <ul className="mt-2 space-y-1">
                        {topics.map((t) => (
                            <li key={t}>
                                <button type="button" onClick={() => go({ topic: t, format: 'featured' === filters.format ? 'article' : filters.format })} className={cn('w-full rounded px-1 py-1 text-left text-[0.8125rem] hover:text-gold-300', filters.topic === t && 'text-gold-400')}>
                                    {t}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => go({ topic: null, format: 'featured' })} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900">
                        View All Topics <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                </aside>
            </section>

            <section className="container-tbca pb-12">
                <div className="grid items-center gap-4 rounded-[8px] border border-gold-700/40 bg-ink-900/40 p-4 md:grid-cols-6">
                    <div className="flex gap-3 md:col-span-2">
                        <Presentation className="size-8 shrink-0 text-gold-500" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-parchment-100">Engage With KP</p>
                            <p className="text-[0.75rem]">Book KP for speaking engagements, advisory sessions, boardroom strategy or expert panels.</p>
                        </div>
                    </div>
                    {[
                        [Mic, engagements[0], 'Keynotes & Conferences'],
                        [Users, engagements[1], '1-on-1 Strategy'],
                        [BriefcaseBusiness, engagements[2], 'Executive Insights'],
                        [Video, engagements[3], 'Press & Broadcast'],
                    ].map(([I, t, s]) => {
                        const Ico = I as typeof Mic;
                        return (
                            <button key={t as string} type="button" onClick={() => engage(t as string)} className="flex items-center gap-2.5 text-left hover:text-gold-300">
                                <Ico className="size-6 text-gold-500" aria-hidden="true" />
                                <span><span className="block text-[0.8125rem] font-semibold text-parchment-100">{t as string}</span><span className="block text-[0.6875rem]">{s as string}</span></span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => engage(engagements[1])} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-[0.8125rem] font-semibold text-gold-400">
                        <CalendarDays className="size-4" aria-hidden="true" /> Contact KP Team <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </section>

            <Modal open={reading !== null} onClose={() => setReading(null)} title={reading?.title ?? ''} size="lg">
                {reading && (
                    <article className="space-y-3 text-sm leading-relaxed text-ink-700">
                        <p className="text-[0.75rem] font-semibold text-gold-700 uppercase">{reading.tag} · {reading.topic}</p>
                        <p className="font-serif text-lg text-ink-900">{reading.body}</p>
                        <p>Kruger Phiri draws on two decades of advising African enterprises, funders and governments. This insight sets out the practical moves leaders can make now: sharpen the strategy, build evidence that funders trust, and execute with governed systems and accountable teams.</p>
                        <p>For a conversation on how this applies to your organisation, book an advisory session with the KP team.</p>
                        <Link href="/discovery-call" className="inline-flex items-center gap-1 font-semibold text-gold-700">Book a Discovery Call <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                    </article>
                )}
            </Modal>

            <Modal open={engageOpen} onClose={() => setEngageOpen(false)} title="Engage With KP">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/forms/kp-engagement', { preserveScroll: true, onSuccess: () => { setEngageOpen(false); form.reset('details'); } });
                    }}
                >
                    <Field label="Engagement type" required>{(id) => <Select id={id} options={engagements} value={form.data.engagement} onChange={(e) => form.setData('engagement', e.target.value)} />}</Field>
                    <Field label="Your name" required error={form.errors.name}>{(id) => <Input id={id} required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                    <Field label="Organisation">{(id) => <Input id={id} value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} />}</Field>
                    <Field label="Event or request details" required>{(id) => <Textarea id={id} required value={form.data.details} onChange={(e) => form.setData('details', e.target.value)} />}</Field>
                    <button type="submit" disabled={form.processing} className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Send Request</button>
                </form>
            </Modal>
        </div>
    );
}
