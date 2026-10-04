import { Link } from '@inertiajs/react';
import { BadgeCheck, CalendarClock, Clock, Download, FilePen, PenLine, Plus, Search, ShieldCheck, TriangleAlert, Users, Archive, FileText } from 'lucide-react';
import { useFilters } from '@/Components/Insights/Industries';
import { Box, Donut, Legend, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';
import type { ResourceCard } from '@/types/insights';

type Row = ResourceCard & { recordId: string; publishState: string; version: string; owner: string | null; updated: string; stage: string };
interface Props {
    filters: { stage?: string; type?: string; category?: string; owner?: string; q?: string };
    stages: Record<'draft' | 'internal_review' | 'legal_review' | 'published' | 'due' | 'archived', number>;
    rows: Row[];
    kpis: { total: number; published: number; review: number; due: number; overdue: number };
    health: { score: number; upToDate: number; dueSoon: number; overdue: number; other: number };
    types: string[];
    owners: string[];
    categories: { value: string; label: string }[];
}

const STAGES = [
    ['draft', '1. Draft', 'New content being created or edited', FilePen, 'border-controlled-500'],
    ['internal_review', '2. Internal Review', 'Content under internal quality review', Users, 'border-gold-500'],
    ['legal_review', '3. Legal / Compliance', 'Legal and compliance clearance in progress', ShieldCheck, 'border-purple-500'],
    ['published', '4. Published', 'Live and accessible to users', BadgeCheck, 'border-verified-500'],
    ['due', '5. Due for Review', 'Review due in the next 30 days or overdue', Clock, 'border-attested-500'],
    ['archived', '6. Archived / Expired', 'No longer current or accessible', Archive, 'border-risk-500'],
] as const;

export default function Lifecycle({ filters, stages, rows, kpis, health, types, owners, categories }: Props) {
    const { f, setF, apply } = useFilters({ stage: filters.stage ?? '', type: filters.type ?? '', category: filters.category ?? '', owner: filters.owner ?? '', q: filters.q ?? '' }, '/admin/insights/resources/lifecycle');
    const sel = 'h-9 rounded border border-parchment-500 bg-white text-xs';
    return (
        <ResourceAdmin title="Content Lifecycle Console" description="Monitor and manage the entire lifecycle of all resources. Ensure content quality, currency, compliance and value at every stage."
            actions={<Link href="/admin/insights/resources/records/create" className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Add New Resource</Link>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Resources" value={kpis.total} caption="All lifecycle stages" icon={<FileText className="size-5" />} />
                <Stat label="Published" value={kpis.published} tone="green" caption={`${((kpis.published / Math.max(1, kpis.total)) * 100).toFixed(1)}% of total`} />
                <Stat label="Under Review" value={kpis.review} tone="amber" icon={<Clock className="size-5" />} />
                <Stat label="Due for Review" value={kpis.due} caption="Next 30 days" icon={<CalendarClock className="size-5" />} />
                <Stat label="Overdue" value={kpis.overdue} tone="red" caption="Past review date" icon={<TriangleAlert className="size-5" />} />
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_260px]">
                <div className="space-y-4">
                    <Box title="Lifecycle Stages Overview">
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                            {STAGES.map(([k, t, s, I, b]) => (
                                <button key={k} type="button" onClick={() => apply({ stage: f.stage === k ? '' : k })} className={cn('rounded-[6px] border-b-4 bg-parchment-100 p-3 text-left', b, f.stage === k && 'ring-2 ring-gold-500')}>
                                    <I className="size-6 text-ink-600" /><p className="mt-1 text-xs font-semibold">{t}</p><p className="text-2xl font-bold">{stages[k]}</p><p className="text-[0.6875rem] text-ink-500">{s}</p>
                                </button>
                            ))}
                        </div>
                    </Box>
                    <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search resources..." className="h-9 w-52 rounded border border-parchment-500 pl-7 text-xs" /></label>
                        <select aria-label="Type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className={sel}><option value="">All Resource Types</option>{types.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
                        <select aria-label="Category" value={f.category} onChange={(e) => apply({ category: e.target.value })} className={sel}><option value="">All Categories</option>{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                        <select aria-label="Owner" value={f.owner} onChange={(e) => apply({ owner: e.target.value })} className={sel}><option value="">All Owners</option>{owners.map((o) => <option key={o}>{o}</option>)}</select>
                        <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Filter</button>
                    </form>
                    <Table head={['Resource Title', 'Type', 'Category', 'Lifecycle Stage', 'Version', 'Owner', 'Last Updated', 'Next Review', 'Status', 'Actions']}
                        rows={rows.map((r) => [<span key="t"><strong className="block">{r.title}</strong><span className="text-xs text-ink-500 line-clamp-1">{r.summary}</span></span>, label(r.type), <span key="c" className="text-xs">{r.categoryLabel}</span>, <Status key="s" value={STAGES.find((s) => s[0] === (r.stage === 'retired' ? 'archived' : r.stage))?.[1] ?? r.stage} />, `v${r.version}`, <span key="o" className="text-xs">{r.owner}</span>, r.updated, r.nextReviewAt ?? '–', <Status key="st" value={r.publishState === 'published' ? (r.currentness === 'current' ? 'live' : r.currentness) : r.publishState} />, <Link key="e" href={`/admin/insights/resources/records/${r.slug}/edit`} className="flex items-center gap-1 text-xs text-gold-700"><PenLine className="size-3.5" />Edit</Link>])} />
                </div>
                <div className="space-y-4">
                    <Box title="Lifecycle Insights">
                        <p className="text-xs font-semibold">Content Health Score</p>
                        <div className="flex flex-col items-center gap-3"><Donut label={`${health.score}%`} sub={health.score >= 80 ? 'Good' : 'Needs work'} size={110} segments={[{ value: health.upToDate, color: '#2f9e5b' }, { value: health.dueSoon, color: '#d6a32e' }, { value: health.overdue, color: '#d64545' }, { value: health.other, color: '#9aa0a6' }]} /><Legend items={[{ label: 'Up to date', value: health.upToDate, color: '#2f9e5b' }, { label: 'Due soon', value: health.dueSoon, color: '#d6a32e' }, { label: 'Overdue', value: health.overdue, color: '#d64545' }, { label: 'In review / other', value: health.other, color: '#9aa0a6' }]} /></div>
                    </Box>
                    <Box title="Quick Actions">
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/admin/insights/resources/records/create" className="flex items-center gap-2"><Plus className="size-4" />Add New Resource</Link></li>
                            <li><Link href="/admin/insights/resources/decay" className="flex items-center gap-2"><CalendarClock className="size-4" />View Expiry Calendar</Link></li>
                            <li><Link href="/admin/insights/resources/records?currentness=overdue" className="flex items-center gap-2"><TriangleAlert className="size-4" />Run Content Audit (overdue)</Link></li>
                            <li><Link href="/resources/content-status" className="flex items-center gap-2"><Download className="size-4" />Public status report</Link></li>
                        </ul>
                    </Box>
                </div>
            </div>
        </ResourceAdmin>
    );
}
