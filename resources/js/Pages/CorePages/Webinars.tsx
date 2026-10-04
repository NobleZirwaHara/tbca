import { Head, router, useForm } from '@inertiajs/react';
import { ArrowRight, Award, CalendarDays, ChevronRight, Clock, Mail, MessageSquare, PlayCircle, User, Users, Video, Zap } from 'lucide-react';
import { useState } from 'react';
import Icon from '@/Components/ui/Icon';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';
import type { Webinar } from '@/types/core-pages';

interface Props {
    webinars: Webinar[];
    categories: { key: string; label: string; icon: string }[];
    topics: string[];
    upcoming: { slug: string; title: string; date: string; time: string; speaker: string; channel: string };
    filters: { category: string; topic: string; date: string; q: string };
}

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const darkSelect = 'h-9 w-full rounded-[4px] border border-ink-700 bg-ink-900 px-2 text-[0.8125rem] text-parchment-100';

export default function Webinars({ webinars, categories, topics, upcoming, filters }: Props) {
    const [finder, setFinder] = useState({ category: filters.category, topic: filters.topic, date: filters.date });
    const [watching, setWatching] = useState<Webinar | null>(null);
    const [registerOpen, setRegisterOpen] = useState(false);
    const reg = useForm({ name: '', email: '', subject: `Webinar registration: ${upcoming.title}`, section: 'core', webinar: upcoming.slug });
    const sub = useForm({ email: '', subject: 'Webinar updates subscription', section: 'core' });
    const [subOpen, setSubOpen] = useState(false);
    const up = new Date(upcoming.date);

    const apply = (next: Partial<Props['filters']>) =>
        router.get('/webinars', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title="Webinars" />
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">Webinars</p>
                        <h1 className="mt-2 text-[2.25rem] leading-[1.08] font-semibold text-parchment-100 md:text-[2.75rem]">
                            Knowledge Shared.
                            <br />
                            <span className="text-gold-500">Impact Multiplied.</span>
                        </h1>
                        <p className="mt-4 text-[0.9375rem] leading-relaxed">
                            Join our expert-led webinars and discussions on business, investment, leadership, and Africa&rsquo;s growth. Learn. Engage. Transform.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a href="#featured" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Browse All Webinars <ArrowRight className="size-4" aria-hidden="true" />
                            </a>
                            <button type="button" onClick={() => setSubOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-600 px-5 text-sm text-parchment-100 hover:text-gold-300">
                                <Mail className="size-4" aria-hidden="true" /> Subscribe for Updates
                            </button>
                        </div>
                    </div>
                    <div className="hidden items-center justify-center lg:col-span-4 lg:flex" aria-hidden="true">
                        <div className="relative h-52 w-80 rounded-[10px] border border-gold-700/50 bg-gradient-to-br from-ink-800 to-ink-950 p-4 shadow-raised">
                            <div className="flex h-full flex-col items-center justify-center rounded-[6px] border border-ink-700 bg-ink-900">
                                <Video className="size-10 text-gold-500" />
                                <p className="mt-2 font-serif text-lg text-parchment-100">TBCA Live</p>
                                <p className="text-[0.6875rem] text-ink-300">Expert sessions · Q&amp;A · Recordings</p>
                            </div>
                        </div>
                    </div>
                    <aside className="rounded-[10px] border border-gold-700/50 bg-ink-900/80 p-5 lg:col-span-3">
                        <h2 className="text-[1rem] font-semibold text-gold-400">Upcoming Webinar</h2>
                        <div className="mt-3 flex gap-4">
                            <div className="flex w-16 shrink-0 flex-col items-center rounded-[6px] border border-gold-600/60 py-2 text-center">
                                <span className="text-[0.6875rem] font-semibold text-gold-400 uppercase">{up.toLocaleString('en-GB', { month: 'short' })}</span>
                                <span className="text-2xl font-bold text-parchment-100">{up.getDate()}</span>
                                <span className="text-[0.6875rem]">{up.getFullYear()}</span>
                            </div>
                            <div>
                                <p className="text-[1.0625rem] leading-snug font-semibold text-parchment-100">{upcoming.title}</p>
                                <p className="mt-2 flex items-center gap-1.5 text-[0.75rem]"><Clock className="size-3.5 text-gold-500" aria-hidden="true" />{upcoming.time}</p>
                                <p className="flex items-center gap-1.5 text-[0.75rem]"><User className="size-3.5 text-gold-500" aria-hidden="true" />{upcoming.speaker}</p>
                                <p className="flex items-center gap-1.5 text-[0.75rem]"><Video className="size-3.5 text-gold-500" aria-hidden="true" />{upcoming.channel}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setRegisterOpen(true)} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Register Now <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </aside>
                </div>
            </section>

            <section className="container-tbca grid gap-5 pb-8 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <div role="tablist" aria-label="Webinar categories" className="flex gap-1 overflow-x-auto rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-1.5">
                        {categories.map((c) => {
                            const active = (filters.category || 'all') === c.key;
                            return (
                                <button key={c.key} type="button" role="tab" aria-selected={active} onClick={() => apply({ category: c.key })} className={cn('flex min-w-[6.5rem] flex-col items-center gap-1 rounded-[6px] px-2 py-2 text-center text-[0.6875rem] leading-tight', active ? 'border-b-2 border-gold-500 bg-ink-800 text-gold-300' : 'text-parchment-200 hover:text-gold-300')}>
                                    <Icon name={c.icon} className="size-5 text-gold-500" />
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>

                    <div id="featured" className="mt-4 rounded-[8px] border border-gold-700/40 bg-ink-900/40 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[1rem] font-semibold text-parchment-100">Featured Webinars</h2>
                            <button type="button" onClick={() => apply({ category: 'all', topic: '', date: '', q: '' })} className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-400">
                                View All Webinars <ArrowRight className="size-3.5" aria-hidden="true" />
                            </button>
                        </div>
                        {webinars.length === 0 ? (
                            <p className="py-10 text-center text-[0.875rem] text-ink-300">No webinars match these filters yet.</p>
                        ) : (
                            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                {webinars.map((w) => (
                                    <li key={w.slug} className="flex flex-col overflow-hidden rounded-[6px] border border-gold-700/40 bg-ink-900">
                                        <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
                                            <Icon name={w.icon} className="size-10 text-gold-500/80" />
                                            <span className="absolute top-1.5 left-1.5 rounded-[2px] border border-gold-600/60 bg-ink-950/80 px-1.5 text-[0.5625rem] font-bold text-gold-400 uppercase">{w.tag}</span>
                                            <span className="absolute top-1.5 right-1.5 text-[0.625rem] font-semibold text-parchment-100">{w.duration}</span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-2.5">
                                            <h3 className="text-[0.8125rem] leading-snug font-semibold text-parchment-100">{w.title}</h3>
                                            <p className="mt-auto flex justify-between gap-2 pt-2 text-[0.625rem] text-ink-300">
                                                <span>{w.speaker}</span>
                                                <span>{fmt(w.date)}</span>
                                            </p>
                                            <button type="button" onClick={() => setWatching(w)} className="mt-2 inline-flex h-8 items-center justify-center gap-1 rounded-[4px] border border-gold-600/70 text-[0.6875rem] font-semibold text-gold-400 hover:bg-gold-500 hover:text-ink-900">
                                                Watch Recording <ArrowRight className="size-3" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <aside className="space-y-4 lg:col-span-3">
                    <form
                        className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply(finder);
                        }}
                    >
                        <h2 className="text-[0.9375rem] font-semibold text-gold-400">Find the Right Webinar</h2>
                        <label className="mt-3 block text-[0.75rem]" htmlFor="wf-cat">Category</label>
                        <select id="wf-cat" className={darkSelect} value={finder.category} onChange={(e) => setFinder({ ...finder, category: e.target.value })}>
                            {categories.map((c) => <option key={c.key} value={c.key}>{c.key === 'all' ? 'All Categories' : c.label}</option>)}
                        </select>
                        <label className="mt-2 block text-[0.75rem]" htmlFor="wf-topic">Topic</label>
                        <select id="wf-topic" className={darkSelect} value={finder.topic} onChange={(e) => setFinder({ ...finder, topic: e.target.value })}>
                            <option value="">All Topics</option>
                            {topics.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <label className="mt-2 block text-[0.75rem]" htmlFor="wf-date">Date</label>
                        <select id="wf-date" className={darkSelect} value={finder.date} onChange={(e) => setFinder({ ...finder, date: e.target.value })}>
                            <option value="">Any Time</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 12 months</option>
                        </select>
                        <button type="submit" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900">
                            Find Webinars <ArrowRight className="size-3.5" aria-hidden="true" />
                        </button>
                    </form>
                    <div className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4">
                        <h2 className="text-[0.9375rem] font-semibold text-gold-400">Webinar Resources</h2>
                        <ul className="mt-2 divide-y divide-ink-800 text-[0.8125rem]">
                            {['Presentation Slides', 'Webinar Recordings', 'Speaker Bios', 'Discussion Summaries', 'Downloadable Toolkits'].map((r) => (
                                <li key={r}>
                                    <a href={r === 'Downloadable Toolkits' ? '/tools/toolkits' : '/resources'} className="flex items-center justify-between py-1.5 hover:text-gold-300">
                                        {r} <ChevronRight className="size-3.5" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <ul className="grid gap-4 rounded-[8px] border border-gold-700/40 bg-ink-900/40 p-4 sm:grid-cols-3 lg:col-span-12 lg:grid-cols-6">
                    {[
                        [Users, 'Expert Speakers', 'Industry leaders & specialists'],
                        [MessageSquare, 'Live Q&A', 'Engage & ask questions'],
                        [Zap, 'Actionable Insights', 'Practical strategies you can use'],
                        [PlayCircle, 'On-Demand Access', 'Watch anytime, anywhere'],
                        [Award, 'Certificates', 'Earn CPD certificates'],
                        [Users, 'Community Access', 'Join our expert community'],
                    ].map(([I, t, b]) => {
                        const Ico = I as typeof Users;
                        return (
                            <li key={t as string} className="flex gap-2.5">
                                <Ico className="size-6 shrink-0 text-gold-500" aria-hidden="true" />
                                <span><span className="block text-[0.8125rem] font-semibold text-parchment-100">{t as string}</span><span className="block text-[0.6875rem] text-ink-300">{b as string}</span></span>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <Modal open={watching !== null} onClose={() => setWatching(null)} title={watching?.title ?? ''} size="lg">
                {watching && (
                    <div>
                        <div className="flex aspect-video items-center justify-center rounded-[6px] bg-ink-950 text-parchment-200">
                            <div className="text-center">
                                <PlayCircle className="mx-auto size-14 text-gold-500" aria-hidden="true" />
                                <p className="mt-2 text-sm">Recording · {watching.duration}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-ink-600">
                            {watching.speaker} · {fmt(watching.date)} · {watching.tag}
                        </p>
                    </div>
                )}
            </Modal>

            <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title={`Register: ${upcoming.title}`}>
                <form
                    id="webinar-register"
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        reg.post('/forms/webinar-registration', { preserveScroll: true, onSuccess: () => { setRegisterOpen(false); reg.reset('name', 'email'); } });
                    }}
                >
                    <p className="flex items-center gap-2 text-sm text-ink-600"><CalendarDays className="size-4 text-gold-600" aria-hidden="true" /> {fmt(upcoming.date)} · {upcoming.time} · {upcoming.channel}</p>
                    <Field label="Full name" required error={reg.errors.name}>{(id) => <Input id={id} required value={reg.data.name} onChange={(e) => reg.setData('name', e.target.value)} />}</Field>
                    <Field label="Email address" required error={reg.errors.email}>{(id) => <Input id={id} type="email" required value={reg.data.email} onChange={(e) => reg.setData('email', e.target.value)} />}</Field>
                    <button type="submit" disabled={reg.processing} className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Confirm Registration</button>
                </form>
            </Modal>

            <Modal open={subOpen} onClose={() => setSubOpen(false)} title="Subscribe for Webinar Updates" size="sm">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sub.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => { setSubOpen(false); sub.reset('email'); } });
                    }}
                >
                    <Field label="Email address" required error={sub.errors.email}>{(id) => <Input id={id} type="email" required value={sub.data.email} onChange={(e) => sub.setData('email', e.target.value)} />}</Field>
                    <button type="submit" disabled={sub.processing} className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Subscribe</button>
                </form>
            </Modal>
        </div>
    );
}
