import { Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, InsightCard, KpPage, Select, apply, type Filters, type KpCard, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    items: KpCard[];
    pagination: { shown: number; total: number; page: number; more: boolean };
    filters: Filters;
    themes: { slug: string; label: string }[];
}

const RELATED: [string, string][] = [
    ['Latest Insights', `${BASE}/insights`],
    ['African Business Diagnostic Tools', `${BASE}/african-business-clinic`],
    ['Work With Kruger', `${BASE}/work-with-kruger`],
    ['Project Development Desk', `${BASE}/project-development`],
    ['KP Knowledge Assistant', `${BASE}/ask`],
];

/** KP-SCR-007 Founder's Notes (Voice F). */
export default function FoundersNotes({ screen, kpNav, items, pagination, filters, themes }: Props) {
    const [f, setF] = useState<Filters>(filters);
    const go = (next: Filters = f, page?: number) => apply(`${BASE}/founders-notes`, { ...next, page });
    const sub = useForm({ email: '', name: '', subject: "Founder's Notes subscription", section: 'kp' });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[["Founder's Notes"]]}
            title="Founder's Notes"
            subtitle="Notes from the desk of Kruger Phiri."
            intro="Short-form field notes, reflections and diagnostic observations on business, capital, projects and execution across Africa."
            rail={
                <>
                    <Box tone="dark" title="About Founder's Notes" icon="pen">
                        <p className="text-[0.8125rem]">These notes are not formal articles. They are working reflections, risk observations and practical prompts from real engagements.</p>
                        <p className="mt-3 flex items-center gap-2 text-[0.8125rem]"><span className="flex size-6 items-center justify-center rounded-full border border-gold-500 text-[0.6875rem] font-bold text-gold-400">F</span>Founder Voice (F): original personal reflections.</p>
                        <Link href={`${BASE}/standards/voice-badge`} className="mt-3 inline-block text-[0.8125rem] font-semibold text-gold-400">Editorial Standards</Link>
                    </Box>
                    <Box title="Explore Related" icon="compass">
                        <ul className="divide-y divide-parchment-300">{RELATED.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center justify-between py-2 text-[0.8125rem] hover:text-gold-700">{t}<L.ArrowRight className="size-3.5 text-gold-600" /></Link></li>)}</ul>
                    </Box>
                    <Box title="Stay Connected" icon="mail" tone="cream">
                        <p className="text-[0.8125rem]">Get new Founder's Notes and key insights delivered to your inbox.</p>
                        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); sub.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => sub.reset('email') }); }}>
                            <label htmlFor="nl" className="sr-only">Email address</label>
                            <input id="nl" type="email" required value={sub.data.email} onChange={(e) => sub.setData('email', e.target.value)} placeholder="Enter your email address" className="h-9 min-w-0 flex-1 rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]" />
                            <button type="submit" disabled={sub.processing} className={btnClass('gold', 'sm')}>Subscribe</button>
                        </form>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">You can unsubscribe at any time.</p>
                    </Box>
                </>
            }
        >
            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_10rem_auto]" onSubmit={(e) => { e.preventDefault(); go(); }}>
                <label className="relative">
                    <span className="sr-only">Search notes</span>
                    <L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                    <input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search notes by keyword or topic..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-3 pl-9 text-[0.875rem]" />
                </label>
                <label><span className="sr-only">Theme</span><Select className="mt-0" value={f.theme} onChange={(e) => { const n = { ...f, theme: e.target.value }; setF(n); go(n); }} placeholder="All Themes" options={themes.map((t) => ({ value: t.slug, label: t.label }))} /></label>
                <label><span className="sr-only">Sort by</span><Select className="mt-0" value={f.sort} onChange={(e) => { const n = { ...f, sort: e.target.value }; setF(n); go(n); }} options={[{ value: 'recent', label: 'Newest First' }, { value: 'title', label: 'Title A to Z' }]} /></label>
                <button type="submit" className={btnClass('outline')}>Search</button>
            </form>

            {items.length === 0 ? <Empty>No notes match your search.</Empty> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((i) => <InsightCard key={i.slug} item={i} />)}</div>}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[0.75rem] text-ink-500">Showing {pagination.shown} of {pagination.total} notes.</p>
                {pagination.more && <button type="button" className={cn(btnClass('outline', 'sm'))} onClick={() => go(f, pagination.page + 1)}>Show more notes</button>}
            </div>
        </KpPage>
    );
}
