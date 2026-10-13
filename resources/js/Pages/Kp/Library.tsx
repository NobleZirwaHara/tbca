import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import KpFrame, { KpItemCard, type KpCard, type KpShared, type KpTheme } from '@/Components/Kp/KpFrame';
import { btnClass } from '@/Components/Webinars/kit';

interface Props extends KpShared {
    kind: 'articles' | 'podcasts' | 'downloads' | 'theme';
    heading: string;
    theme: KpTheme | null;
    items: KpCard[];
    pagination: { page: number; last: number; total: number; of: number };
    filters: { q: string; theme: string; format: string; sort: string };
    formatOptions: { key: string; label: string }[];
}

const PATH: Record<Props['kind'], string> = { articles: '/kp-thought-leadership/articles', podcasts: '/kp-thought-leadership/podcasts', downloads: '/kp-thought-leadership/downloads', theme: '/kp-thought-leadership/articles' };
const field = 'h-10 w-full rounded-[6px] border border-parchment-500 bg-white px-3 text-[0.8125rem] focus:border-gold-500 focus:outline-none';

export default function Library({ sections, themes, kind, heading, theme, items, pagination, filters, formatOptions }: Props) {
    const [form, setForm] = useState(filters);
    const base = kind === 'theme' && theme ? `/kp-thought-leadership/themes/${theme.slug}` : PATH[kind];
    const go = (next: Partial<Props['filters']> & { page?: number }) => {
        const params = Object.fromEntries(Object.entries({ ...filters, ...next }).filter(([k, v]) => v !== '' && v !== undefined && !(k === 'sort' && v === 'newest') && !(k === 'page' && v === 1) && !(kind === 'theme' && k === 'theme')));
        router.get(base, params as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        go({ ...form, page: 1 });
    };
    const lead = {
        articles: 'Search and filter every article, report and interview by theme and format.',
        podcasts: 'Podcast episodes, videos, keynotes and media interviews with Kruger Phiri.',
        downloads: 'Reports and whitepapers to download, plus the media kit on request.',
        theme: theme?.blurb ?? '',
    }[kind];

    return (
        <KpFrame sections={sections} crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ...(kind === 'theme' ? [['Themes'] as [string]] : []), [heading]]} title={heading} lead={lead}>
            <Head title={`${heading} | KP Thought Leadership`} />
            <form onSubmit={submit} role="search" aria-label={`Search ${heading}`} className="grid gap-3 rounded-[12px] border border-gold-300 bg-white p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]">
                <label>
                    <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Search</span>
                    <span className="relative block"><L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" /><input type="search" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="Title, theme or keyword" className={cn(field, 'pl-9')} /></span>
                </label>
                {kind !== 'theme' && (
                    <label>
                        <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Theme</span>
                        <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className={field}>
                            <option value="">All Themes</option>
                            {themes.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
                        </select>
                    </label>
                )}
                <label>
                    <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Format</span>
                    <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className={field}>
                        <option value="">All Formats</option>
                        {formatOptions.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                </label>
                <label>
                    <span className="mb-1 block text-[0.75rem] font-semibold text-ink-700">Sort</span>
                    <select value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} className={field}>
                        <option value="newest">Newest first</option>
                        <option value="title">Title A to Z</option>
                    </select>
                </label>
                <div className="flex items-end gap-2">
                    <button type="submit" className={btnClass('gold', 'md')}><L.Search className="size-4" aria-hidden="true" />Search</button>
                    <button type="button" className={btnClass('outline', 'md')} onClick={() => { const blank = { q: '', theme: '', format: '', sort: 'newest' }; setForm(blank); router.get(base); }}>Reset</button>
                </div>
            </form>

            {kind !== 'theme' && (
                <div className="flex flex-wrap gap-2" aria-label="Themes">
                    {themes.map((t) => (
                        <Link key={t.slug} href={`/kp-thought-leadership/themes/${t.slug}`} className="rounded-full border border-parchment-500 bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink-700 hover:border-gold-500">{t.label}</Link>
                    ))}
                </div>
            )}

            <p className="text-[0.8125rem] text-ink-600" aria-live="polite">Showing {items.length} of {pagination.total} matching entries ({pagination.of} in this collection).</p>

            {items.length === 0 ? (
                <p className="rounded-[10px] border border-parchment-400 bg-white p-8 text-center text-ink-500">No entries match your search. Try another keyword or reset the filters.</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((i) => <KpItemCard key={i.slug} item={i} />)}</ul>
            )}

            {pagination.last > 1 && (
                <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                    <button type="button" disabled={pagination.page <= 1} onClick={() => go({ page: pagination.page - 1 })} className={btnClass('outline', 'sm')}>Previous</button>
                    <span className="text-[0.8125rem] text-ink-700">Page {pagination.page} of {pagination.last}</span>
                    <button type="button" disabled={pagination.page >= pagination.last} onClick={() => go({ page: pagination.page + 1 })} className={btnClass('outline', 'sm')}>Next</button>
                </nav>
            )}

            {kind === 'downloads' && (
                <section className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-ink-950 p-5 text-parchment-100">
                    <div><h2 className="font-serif text-[1.25rem] font-bold text-parchment-50">Media Kit</h2><p className="text-[0.8125rem] text-parchment-300">Approved biography, photographs and speaker requirements, sent on request.</p></div>
                    <Link href="/kp-thought-leadership/book?type=media" className={btnClass('gold', 'md')}>Request the Media Kit</Link>
                </section>
            )}
        </KpFrame>
    );
}
