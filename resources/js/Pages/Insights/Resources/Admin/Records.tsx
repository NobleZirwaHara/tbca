import { Link } from '@inertiajs/react';
import { CalendarClock, FilePen, FileText, Plus, Search, SearchCheck } from 'lucide-react';
import { useFilters } from '@/Components/Insights/Industries';
import { AccessChip, CurrentnessChip, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import type { ResourceCard } from '@/types/insights';

type Row = ResourceCard & { recordId: string; publishState: string; version: string; owner: string | null; updated: string };
interface Props {
    filters: { q?: string; type?: string; currentness?: string; state?: string; owner?: string };
    rows: Row[];
    kpis: { draft: number; review: number; published: number; due: number };
    types: string[];
    owners: string[];
}

export default function Records({ filters, rows, kpis, types, owners }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', type: filters.type ?? '', currentness: filters.currentness ?? '', state: filters.state ?? '', owner: filters.owner ?? '' }, '/admin/insights/resources/records');
    const sel = 'h-9 rounded border border-parchment-500 bg-white text-xs';
    return (
        <ResourceAdmin title="Content Record Manager" description="Maintain Controlled Content Records and Resources extensions."
            actions={<Link href="/admin/insights/resources/records/create" className="flex items-center gap-1.5 rounded bg-ink-900 px-3 py-2 text-xs font-bold text-parchment-100"><Plus className="size-4" /> Create New Record</Link>}>
            <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Draft Records" value={kpis.draft} icon={<FilePen className="size-5" />} />
                <Stat label="In Review" value={kpis.review} tone="amber" icon={<SearchCheck className="size-5" />} />
                <Stat label="Published" value={kpis.published} tone="green" icon={<FileText className="size-5" />} />
                <Stat label="Review Due" value={kpis.due} tone="red" icon={<CalendarClock className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search records</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search records by title, slug, ID..." className="h-9 w-60 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Resource type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className={sel}><option value="">All Resource Types</option>{types.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
                <select aria-label="Currentness" value={f.currentness} onChange={(e) => apply({ currentness: e.target.value })} className={sel}><option value="">All Currentness States</option>{['current', 'review_due', 'overdue', 'restricted', 'retired'].map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
                <select aria-label="Publish state" value={f.state} onChange={(e) => apply({ state: e.target.value })} className={sel}><option value="">All Publish States</option>{['draft', 'internal_review', 'legal_review', 'published', 'archived', 'retired'].map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
                <select aria-label="Owner" value={f.owner} onChange={(e) => apply({ owner: e.target.value })} className={sel}><option value="">All Owners</option>{owners.map((o) => <option key={o}>{o}</option>)}</select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Filter</button>
            </form>
            <div className="mt-4">
                <Table head={['Record ID', 'Title', 'Type', 'Access', 'Workflow', 'Currentness', 'Version', 'Owner', 'Updated', 'Downloads', '']}
                    rows={rows.map((r) => [<span key="i" className="text-xs">{r.recordId}</span>, <Link key="t" href={`/admin/insights/resources/records/${r.slug}/edit`} className="font-semibold hover:text-gold-700">{r.title}</Link>, label(r.type), <AccessChip key="a" label={r.accessLabel} />, <Status key="w" value={r.publishState} />, <CurrentnessChip key="c" value={r.currentness} />, r.version, <span key="o" className="text-xs">{r.owner}</span>, r.updated, r.downloads, <Link key="e" href={`/admin/insights/resources/records/${r.slug}/edit`} className="text-xs font-semibold text-gold-700">Edit</Link>])} />
            </div>
        </ResourceAdmin>
    );
}
