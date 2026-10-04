import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bookmark, CheckCircle2, Clock, Lock, Search, ShieldCheck, TriangleAlert, Users, Bot, Eye } from 'lucide-react';
import { Box, CurrentnessChip, Pager, Table, label } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { ResourceCard, SimplePagination } from '@/types/insights';

interface Props {
    filters: { status: string | null; q: string | null; type: string | null };
    counts: Record<'current' | 'review_due' | 'overdue' | 'restricted', number>;
    rows: ResourceCard[];
    pagination: SimplePagination;
    types: string[];
}

export default function ContentStatus({ filters, counts, rows, pagination, types }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [q, setQ] = useState(filters.q ?? '');
    const go = (next: Record<string, string>) => router.get('/resources/content-status', Object.fromEntries(Object.entries({ status: filters.status ?? '', type: filters.type ?? '', q, ...next }).filter(([, v]) => v)), { preserveScroll: true, preserveState: true });
    const cards = [
        ['current', 'Current', 'Content is up-to-date and recently reviewed.', CheckCircle2, 'border-verified-500/40 bg-verified-50 text-verified-700', 'View Current Content'],
        ['review_due', 'Review Due', 'Content approaching review date. Review in progress.', Clock, 'border-attested-500/40 bg-attested-50 text-attested-700', 'View Items Due for Review'],
        ['overdue', 'Overdue', 'Content past review date. May be outdated.', TriangleAlert, 'border-risk-500/40 bg-risk-50 text-risk-700', 'View Overdue Content'],
        ['restricted', 'Restricted', 'Content withdrawn or restricted due to accuracy or compliance.', Lock, 'border-parchment-500 bg-parchment-200 text-ink-700', 'View Restricted Content'],
    ] as const;
    const save = (r: ResourceCard) => (auth.user ? router.post('/saved', { item_type: 'resource', item_key: r.slug, label: r.title, url: r.url }, { preserveScroll: true }) : router.get('/login'));

    return (
        <ResourceFrame title="Content Status" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Content Status' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <PageTitle title="Content Status – Stale Content States" intro="We maintain content accuracy and reliability. Use the status filters below to understand the currentness of our resources." />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(([k, t, s, I, tone, cta]) => (
                            <div key={k} className={cn('rounded-[8px] border p-4', tone, filters.status === k && 'ring-2 ring-gold-500')}>
                                <p className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900"><I className="size-6" />{t}</p>
                                <p className="mt-1 text-xs text-ink-600">{s}</p>
                                <p className="mt-2 text-center text-2xl font-bold">{counts[k]}</p><p className="text-center text-xs text-ink-500">Items</p>
                                <button type="button" onClick={() => go({ status: filters.status === k ? '' : k, page: '' })} className="mt-3 w-full rounded border border-current bg-white py-1.5 text-xs font-semibold">{filters.status === k ? 'Show all' : cta}</button>
                            </div>
                        ))}
                    </div>
                    <Box>
                        <form onSubmit={(e) => { e.preventDefault(); go({ page: '' }); }} className="mb-3 flex flex-wrap gap-2">
                            <label className="relative min-w-56 flex-1"><span className="sr-only">Search content</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content by title, topic or keyword..." className="h-9 w-full rounded border border-parchment-500 pl-7 text-xs" /></label>
                            <select aria-label="Content type" value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value, page: '' })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Content Types</option>{types.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
                        </form>
                        <Table head={['Title', 'Type', 'Topic', 'Status', 'Last Reviewed', 'Next Review', 'Actions']}
                            rows={rows.map((r) => [
                                <span key="t"><strong className="block">{r.title}</strong><span className="text-xs text-ink-500">{r.summary}</span></span>, <span key="ty" className="rounded bg-parchment-200 px-1.5 text-xs">{label(r.type)}</span>, <span key="c" className="text-xs">{r.categoryLabel}</span>, <CurrentnessChip key="s" value={r.currentness} />, r.reviewedAt ?? '—', r.currentness === 'restricted' ? '—' : (r.nextReviewAt ?? '—'),
                                <span key="a" className="flex items-center gap-2"><Link href={r.url} className="rounded border px-2 py-0.5 text-xs">{r.currentness === 'restricted' ? 'View Info' : 'View'}</Link><button type="button" aria-label={`Save ${r.title}`} onClick={() => save(r)}><Bookmark className="size-4 text-ink-500" /></button></span>,
                            ])} />
                        <div className="mt-3"><Pager page={pagination.page} lastPage={pagination.lastPage} query={{ status: filters.status ?? '', type: filters.type ?? '', q }} path="/resources/content-status" /></div>
                    </Box>
                </div>
                <aside className="space-y-4">
                    <Box title="About Content Currentness">
                        <p className="text-xs text-ink-600">We review all resources regularly to ensure accuracy, relevance and compliance.</p>
                        <ul className="mt-3 space-y-2.5 text-xs">{[[Users, 'Human review where required', 'Expert oversight for quality and accuracy.'], [Bot, 'AI-assisted monitoring', 'We scan for updates, changes and signals.'], [Eye, 'Transparent status', 'You always know how current our content is.'], [ShieldCheck, 'Your safety first', 'Outdated or risky content is restricted.']].map(([I, t, s]) => { const Icon = I as typeof Eye; return <li key={t as string} className="flex gap-2"><Icon className="size-5 text-ink-600" /><span><strong className="block">{t as string}</strong>{s as string}</span></li>; })}</ul>
                    </Box>
                    <Box title="Need Something Current?"><p className="text-xs">Can't find a current resource on your topic? Let us help you.</p><button type="button" onClick={() => router.post('/forms/updated-resource-request', { section: 'resources', subject: 'Request updated resource', redirect: '/resources/content-status' }, { preserveScroll: true })} className="mt-2 rounded border px-3 py-1.5 text-xs font-semibold">Request Updated Resource →</button></Box>
                    <Box title="Status Definitions"><ul className="space-y-2 text-xs">{[['bg-verified-500', 'Current', 'Reviewed and accurate.'], ['bg-attested-500', 'Review Due', 'Review is due soon.'], ['bg-risk-500', 'Overdue', 'Past review date. New downloads paused.'], ['bg-ink-400', 'Restricted', 'Withdrawn or limited access.']].map(([c, t, s]) => <li key={t} className="flex gap-2"><span className={`mt-1 size-2.5 rounded-full ${c}`} /><span><strong className="block">{t}</strong>{s}</span></li>)}</ul></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
