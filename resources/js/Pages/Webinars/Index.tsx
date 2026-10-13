import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import HeroArt from '@/Components/Art/HeroArt';
import { BtnLink, EventCover, Eyebrow, Ico, SpeakerLine, StatTile, StateChip, WebinarShell, btnClass } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

interface Filters {
    q: string;
    category: string;
    when: string;
    price: string;
    cpd: boolean;
    speaker: string;
    view: string;
}

interface Props {
    filters: Filters;
    searched: boolean;
    upcoming: WebinarEvent[];
    live: WebinarEvent[];
    past: WebinarEvent[];
    categories: { key: string; label: string; icon: string }[];
    speakers: string[];
    counts: { upcoming: number; live: number; past: number; total: number; catalogue: number };
    stats: { registrations: number; delivered: number; certificates: number; satisfaction: number };
    quote: [string, string, string];
}

const FEATURES: [string, string, string][] = [
    ['users', 'Expert Speakers', 'Industry leaders and specialists'],
    ['lightbulb', 'Practical Insights', 'Actionable strategies for African markets'],
    ['trending-up', 'Business Growth', 'From startup to scale'],
    ['globe', 'Pan-African Focus', 'Relevant to your market'],
    ['award', 'Certificates', 'Earn CPD certificates'],
    ['play', 'On-Demand Replays', 'Watch anytime, anywhere'],
];

const field = 'h-10 w-full rounded-[6px] border border-parchment-500 bg-white px-3 text-[0.8125rem] text-ink-900 focus:border-gold-500 focus:outline-none';

function clean(f: Partial<Filters>) {
    return Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== '' && v !== false && v !== null && v !== undefined && !(k === 'category' && v === 'all') && !(k === 'when' && v === 'all') && !(k === 'view' && v === 'grid')));
}

export default function Index({ filters, searched, upcoming, live, past, categories, speakers, counts, stats, quote }: Props) {
    const [form, setForm] = useState<Filters>(filters);
    const latest = past.find((p) => p.replayAvailable);

    const go = (next: Partial<Filters>) => {
        const params = clean({ ...filters, ...next });
        router.get('/webinars', params as Record<string, string>, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        go(form);
    };
    const reset = () => {
        const blank: Filters = { q: '', category: 'all', when: 'all', price: '', cpd: false, speaker: '', view: filters.view };
        setForm(blank);
        go(blank);
    };
    const calendar = filters.view === 'calendar';

    return (
        <WebinarShell>
            <Head title="Webinars" />

            <section className="relative overflow-hidden rounded-[12px] bg-ink-950 text-parchment-100 shadow-raised">
                <HeroArt className="absolute inset-0 h-full w-full" />
                <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div>
                        <p className="text-[0.75rem] font-semibold tracking-[0.2em] text-gold-400 uppercase">TBCA Webinars</p>
                        <h1 className="mt-3 font-serif text-[2.25rem] leading-[1.05] font-bold text-parchment-50 sm:text-[3.25rem]">
                            Live Learning.
                            <br />
                            Real Impact.
                            <br />
                            <span className="text-gold-400">A Stronger Africa.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-parchment-200">Expert-led webinars, practical toolkits and actionable insights to help African businesses grow, compete and thrive.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a href="#find" className={btnClass('gold', 'lg')}><L.CalendarDays className="size-5" aria-hidden="true" /> Browse Upcoming Webinars</a>
                            <BtnLink href={latest ? `/webinars/${latest.slug}/replay/watch` : '/webinars/replays'} tone="ghostDark" size="lg" icon="play">Watch Latest Replay</BtnLink>
                        </div>
                    </div>
                    <blockquote className="self-start rounded-[12px] border border-gold-600/70 bg-ink-950/80 p-5">
                        <L.Quote className="size-7 text-gold-500" aria-hidden="true" />
                        <p className="mt-2 font-serif text-[1.25rem] leading-snug text-parchment-50 italic">{quote[0]}</p>
                        <footer className="mt-3 text-[0.8125rem]">
                            <span className="block font-semibold text-gold-400">{quote[1]}</span>
                            <span className="block text-[0.6875rem] text-gold-500">{quote[2]}</span>
                        </footer>
                    </blockquote>
                </div>
                <ul className="relative grid gap-4 border-t border-gold-700/40 bg-ink-950/70 px-6 py-4 sm:grid-cols-3 xl:grid-cols-6">
                    {FEATURES.map(([icon, t, b]) => (
                        <li key={t} className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-600 text-gold-400"><Ico name={icon} className="size-5" /></span>
                            <span><span className="block text-[0.8125rem] font-semibold text-parchment-50">{t}</span><span className="block text-[0.6875rem] text-parchment-300">{b}</span></span>
                        </li>
                    ))}
                </ul>
            </section>

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <li><StatTile icon="users" value={`${stats.registrations.toLocaleString('en-ZA')}+`} label="Total Registrations" /></li>
                <li><StatTile icon="play" value={stats.delivered} label="Webinars Delivered" /></li>
                <li><StatTile icon="award" value={`${stats.certificates.toLocaleString('en-ZA')}+`} label="Certificates Issued" /></li>
                <li><StatTile icon="bar-chart-3" value={`${stats.satisfaction}%`} label="Average Satisfaction" /></li>
            </ul>

            {/* ---------------- Find webinars ---------------- */}
            <section id="find" className="scroll-mt-4 rounded-[12px] border border-gold-300 bg-white p-4 sm:p-5">
                <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">Find Webinars</h2>
                <p className="text-[0.8125rem] text-ink-500">Search by keyword, speaker or topic, then narrow by category, timing and price.</p>
                <form onSubmit={submit} className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6" role="search" aria-label="Find webinars">
                    <label className="xl:col-span-2">
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Keyword</span>
                        <span className="relative block">
                            <L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                            <input type="search" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="e.g. funding, AI, marketing, Kruger Phiri" className={cn(field, 'pl-9')} />
                        </span>
                    </label>
                    <label>
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Category</span>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field}>
                            <option value="all">All Categories</option>
                            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">When</span>
                        <select value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} className={field}>
                            <option value="all">Upcoming and Replays</option>
                            <option value="upcoming">Upcoming only</option>
                            <option value="live">Live now</option>
                            <option value="replays">Replays and past events</option>
                        </select>
                    </label>
                    <label>
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Speaker</span>
                        <select value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} className={field}>
                            <option value="">All Speakers</option>
                            {speakers.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Price</span>
                        <select value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={field}>
                            <option value="">Free and Paid</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </label>
                    <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-6">
                        <label className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                            <input type="checkbox" checked={form.cpd} onChange={(e) => setForm({ ...form, cpd: e.target.checked })} className="size-4 accent-gold-600" />
                            CPD eligible only
                        </label>
                        <span className="flex-1" />
                        <button type="button" onClick={reset} className={btnClass('outline', 'md')}>Reset</button>
                        <button type="submit" className={btnClass('gold', 'md')}><L.Search className="size-4" aria-hidden="true" /> Find Webinars</button>
                    </div>
                </form>
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick category filters">
                    {[{ key: 'all', label: 'All Webinars', icon: 'play' }, ...categories].map((c) => (
                        <button key={c.key} type="button" onClick={() => { setForm({ ...form, category: c.key }); go({ ...form, category: c.key }); }} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold', (filters.category || 'all') === c.key ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-parchment-100 text-ink-700 hover:border-gold-500')}>
                            <Ico name={c.icon} className="size-3.5" />
                            {c.label}
                        </button>
                    ))}
                </div>
            </section>

            <div id="results" className="scroll-mt-4" aria-live="polite">
                {searched && (
                    <p className="mb-3 rounded-[8px] border border-parchment-400 bg-parchment-200 px-4 py-2 text-[0.8125rem] text-ink-700">
                        <strong className="text-ink-900">{counts.total}</strong> of {counts.catalogue} webinars match{filters.q && <> &ldquo;{filters.q}&rdquo;</>}: {counts.upcoming} upcoming, {counts.live} live, {counts.past} past.{' '}
                        <button type="button" onClick={reset} className="font-semibold text-gold-700 underline">Clear search</button>
                    </p>
                )}

                {calendar ? (
                    <CalendarView events={[...live, ...upcoming, ...past]} />
                ) : (
                    <div className="space-y-6">
                        {live.length > 0 && (
                            <Section title="Live Now" icon="radio">
                                {live.map((w) => <EventCard key={w.slug} w={w} />)}
                            </Section>
                        )}
                        {(filters.when === 'all' || filters.when === 'upcoming') && (
                            <Section title="Upcoming Webinars" icon="calendar-days" more={filters.when === 'upcoming' ? undefined : ['View All Upcoming', () => go({ when: 'upcoming' })]} empty={upcoming.length === 0 ? 'No upcoming webinars match your search. Try another keyword or reset the filters.' : null}>
                                {upcoming.map((w) => <EventCard key={w.slug} w={w} />)}
                            </Section>
                        )}
                        {(filters.when === 'all' || filters.when === 'replays') && (
                            <Section title="Replays and Past Webinars" icon="play" more={['Open Replay Library', () => router.get('/webinars/replays')]} empty={past.length === 0 ? 'No past webinars match your search.' : null}>
                                {past.map((w) => <EventCard key={w.slug} w={w} />)}
                            </Section>
                        )}
                        {filters.when === 'live' && live.length === 0 && <p className="rounded-[10px] border border-parchment-400 bg-white p-6 text-center text-[0.875rem] text-ink-500">No webinar is live right now. Upcoming sessions are listed under Upcoming.</p>}
                    </div>
                )}
            </div>
        </WebinarShell>
    );
}

Index.layout = null;

function Section({ title, icon, more, empty, children }: { title: string; icon: string; more?: [string, () => void]; empty?: string | null; children: React.ReactNode }) {
    return (
        <section>
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-serif text-[1.5rem] font-bold text-ink-900"><Ico name={icon} className="size-5 text-gold-600" />{title}</h2>
                {more && <button type="button" onClick={more[1]} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800">{more[0]} <L.ArrowRight className="size-4" aria-hidden="true" /></button>}
            </div>
            {empty ? <p className="rounded-[10px] border border-parchment-400 bg-white p-6 text-center text-[0.875rem] text-ink-500">{empty}</p> : <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">{children}</ul>}
        </section>
    );
}

function EventCard({ w }: { w: WebinarEvent }) {
    const price = usePrice();
    const base = `/webinars/${w.slug}`;
    return (
        <li className="flex flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white shadow-sm">
            <Link href={base} aria-label={w.title}><EventCover event={w} className="aspect-[16/8]" /></Link>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.6875rem] font-bold tracking-wide text-gold-700 uppercase">{w.categoryLabel}</span>
                    <StateChip event={w} />
                </div>
                <h3 className="mt-1.5 font-serif text-[1.0625rem] leading-snug font-bold text-ink-900"><Link href={base} className="hover:text-gold-700">{w.title}</Link></h3>
                <p className="mt-1 line-clamp-2 text-[0.8125rem] text-ink-600">{w.summary}</p>
                <div className="mt-3"><SpeakerLine name={w.speaker} role={w.speakerRole} /></div>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-600">
                    <span className="flex items-center gap-1"><L.Clock className="size-3.5" aria-hidden="true" />{w.upcoming || w.live ? w.timeRange : w.replayDuration ?? `${w.durationMinutes} mins`}</span>
                    <span className="flex items-center gap-1"><L.Monitor className="size-3.5" aria-hidden="true" />Online</span>
                    <span className="flex items-center gap-1 font-semibold text-ink-900"><L.Ticket className="size-3.5" aria-hidden="true" />{w.priceZar ? price(w.priceZar) : 'Free'}</span>
                    {w.cpd && <span className="flex items-center gap-1"><L.Award className="size-3.5" aria-hidden="true" />CPD</span>}
                </p>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                    {w.live ? (
                        <BtnLink href={`${base}/live`} size="sm" tone="danger">Join Live</BtnLink>
                    ) : w.registrationOpen ? (
                        <BtnLink href={`${base}/register`} size="sm">Register Now</BtnLink>
                    ) : w.replayAvailable ? (
                        <BtnLink href={`${base}/replay/watch`} size="sm">Watch Replay</BtnLink>
                    ) : (
                        <BtnLink href={`${base}/replay`} size="sm" tone="outline">Replay Status</BtnLink>
                    )}
                    <BtnLink href={base} size="sm" tone="outline">Learn More</BtnLink>
                </div>
            </div>
        </li>
    );
}

function CalendarView({ events }: { events: WebinarEvent[] }) {
    const groups = events.reduce<Record<string, WebinarEvent[]>>((acc, e) => {
        const key = new Date(e.startsAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        (acc[key] ??= []).push(e);
        return acc;
    }, {});
    const sorted = Object.entries(groups).sort((a, b) => new Date(b[1][0].startsAt).getTime() - new Date(a[1][0].startsAt).getTime());
    return (
        <section aria-label="Webinar calendar" className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">Webinar Calendar</h2>
                <Link href="/webinars" className="text-[0.8125rem] font-semibold text-gold-700">Back to card view</Link>
            </div>
            {sorted.map(([month, list]) => (
                <div key={month} className="rounded-[10px] border border-parchment-400 bg-white">
                    <h3 className="border-b border-parchment-300 px-4 py-2 font-serif text-[1.0625rem] font-bold text-ink-900">{month}</h3>
                    <ul className="divide-y divide-parchment-300">
                        {list.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).map((e) => (
                            <li key={e.slug} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                                <span className="w-24 shrink-0 text-[0.8125rem] font-semibold text-ink-900">{e.day} {e.month}</span>
                                <Link href={`/webinars/${e.slug}`} className="min-w-0 flex-1 text-[0.8125rem] font-semibold text-ink-800 hover:text-gold-700">{e.title}</Link>
                                <span className="text-[0.75rem] text-ink-500">{e.timeRange}</span>
                                <StateChip event={e} />
                                {e.registrationOpen && <a href={`/webinars/${e.slug}/calendar.ics`} className="text-[0.75rem] font-semibold text-gold-700">Add to calendar</a>}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            {sorted.length === 0 && <p className="text-center text-ink-500">No webinars match.</p>}
        </section>
    );
}
