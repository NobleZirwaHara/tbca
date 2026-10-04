import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Archive, CheckCircle2, Clock, Download, Eye, FileText, RotateCcw, Search } from 'lucide-react';
import { Box, Pager, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { AccountNav, PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import type { SimplePagination } from '@/types/insights';

interface Row { id: number; reference: string; title: string; summary: string; slug: string; url: string; type: string; source: string; acquired: string | null; expires: string | null; status: string }
interface Props {
    filters: { status: string[]; type: string[]; source: string[]; q?: string; sort?: string };
    rows: Row[];
    pagination: SimplePagination;
    kpis: { total: number; active: number; expiring: number; expired: number };
    facets: { status: Record<string, number>; type: Record<string, number>; source: Record<string, number> };
}

const SOURCE_TONE: Record<string, string> = { subscription: 'bg-verified-50 text-verified-700', one_time: 'bg-controlled-50 text-controlled-700', retainer: 'bg-purple-50 text-purple-700', free_download: 'bg-parchment-200 text-ink-700', gated: 'bg-gold-50 text-gold-800' };

export default function EntitlementLibrary({ filters, rows, pagination, kpis, facets }: Props) {
    const [f, setF] = useState(filters);
    const go = (next: Partial<Props['filters']>) => { const m = { ...f, ...next }; setF(m); router.get('/resources/account/library', Object.fromEntries(Object.entries(m).filter(([, v]) => (Array.isArray(v) ? v.length : v))) as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true }); };
    const toggle = (key: 'status' | 'type' | 'source', v: string) => go({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });

    return (
        <ResourceFrame title="Resource Entitlement Library" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Resource Entitlement Library' }]}>
            <AccountNav active="library" />
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <PageTitle title="Resource Entitlement Library" intro="View and manage all resources, guides, templates and tools available to you based on your purchases, subscriptions and access rights." />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Total Entitlements" value={kpis.total} icon={<FileText className="size-5" />} />
                    <Stat label="Active" value={kpis.active} tone="green" icon={<CheckCircle2 className="size-5" />} />
                    <Stat label="Expiring Soon" value={kpis.expiring} caption="Within 30 days" icon={<Clock className="size-5" />} />
                    <Stat label="Expired" value={kpis.expired} caption="No longer accessible" icon={<Archive className="size-5" />} tone="amber" />
                </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr]">
                <Box title={<span className="font-serif text-lg">Refine Your View</span>}>
                    {(['status', 'type', 'source'] as const).map((k) => (
                        <div key={k} className="mb-3">
                            <p className="mb-1 text-xs font-semibold">{k === 'type' ? 'Resource Type' : k === 'source' ? 'Access Source' : 'Status'}</p>
                            {Object.entries(facets[k]).map(([v, c]) => <label key={v} className="flex items-center gap-2 py-0.5 text-xs"><input type="checkbox" className="accent-gold-600" checked={f[k].includes(v)} onChange={() => toggle(k, v)} /><span className="flex-1">{label(v)}</span><span>{c}</span></label>)}
                        </div>
                    ))}
                    <button type="button" onClick={() => { setF({ status: [], type: [], source: [] }); router.get('/resources/account/library'); }} className="flex w-full items-center justify-center gap-1 rounded border border-controlled-500/40 py-1.5 text-xs text-controlled-700"><RotateCcw className="size-3.5" /> Clear Filters</button>
                </Box>
                <Box title={<span className="font-serif text-lg">{pagination.total} Resources</span>} action={
                    <div className="flex flex-wrap gap-2">
                        <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="relative"><label className="sr-only" htmlFor="ent-q">Search entitlements</label><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input id="ent-q" value={f.q ?? ''} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search your entitlements..." className="h-9 w-52 rounded border border-parchment-500 pl-7 text-xs" /></form>
                        <select aria-label="Sort" value={f.sort ?? 'newest'} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="newest">Access Date (Newest)</option><option value="oldest">Access Date (Oldest)</option><option value="title">Title</option><option value="expiry">Expiry Date</option></select>
                    </div>
                }>
                    <Table head={['Resource', 'Type', 'Access Source', 'Access Date', 'Expiry Date', 'Status', 'Actions']}
                        rows={rows.map((r) => [
                            <span key="r" className="flex gap-2"><span className="flex size-10 shrink-0 items-center justify-center rounded bg-parchment-200"><FileText className="size-5 text-ink-500" /></span><span><strong className="block">{r.title}</strong><span className="text-xs text-ink-500">{r.summary}</span></span></span>,
                            <span key="t" className="text-xs">{label(r.type)}</span>,
                            <span key="s" className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap ${SOURCE_TONE[r.source] ?? ''}`}>{label(r.source)}</span>,
                            r.acquired ?? '—', r.expires ?? '–', <Status key="st" value={r.status} />,
                            <span key="a" className="flex gap-1.5"><Link href={r.url} aria-label={`View ${r.title}`} className="rounded border p-1.5"><Eye className="size-4" /></Link>{r.status !== 'expired' && <a href={`/resources/${r.slug}/download`} aria-label={`Download ${r.title}`} className="rounded border p-1.5"><Download className="size-4" /></a>}</span>,
                        ])}
                        empty={<>No entitlements yet. <Link href="/resources/library" className="text-gold-700 underline">Browse resources</Link></>}
                    />
                    <div className="mt-3"><Pager page={pagination.page} lastPage={pagination.lastPage} query={f as unknown as Record<string, unknown>} path="/resources/account/library" /></div>
                </Box>
            </div>
        </ResourceFrame>
    );
}
