import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, RotateCcw, Search, TimerOff, XCircle } from 'lucide-react';
import { Box, Pager, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import type { SimplePagination } from '@/types/insights';

interface Props {
    filters: { status: string[]; purpose?: string; basis?: string; channel?: string; q?: string };
    rows: { id: number; name: string; ref: string; email: string; purpose: string; basis: string; channel: string; date: string; state: string; expires: string | null; updated: string }[];
    pagination: SimplePagination;
    kpis: { total: number; active: number; expired: number; withdrawn: number; pending: number };
    facets: { status: Record<string, number>; purpose: Record<string, number>; basis: Record<string, number>; channel: Record<string, number> };
    requests: { id: number; reference: string; type: string; name: string; email: string; status: string; at: string }[];
}

export default function Consents({ filters, rows, pagination, kpis, facets, requests }: Props) {
    const [f, setF] = useState(filters);
    const go = (next: Partial<Props['filters']>) => { const m = { ...f, ...next }; setF(m); router.get('/admin/insights/resources/consents', Object.fromEntries(Object.entries(m).filter(([, v]) => (Array.isArray(v) ? v.length : v))) as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true }); };
    const toggleStatus = (s: string) => go({ status: f.status.includes(s) ? f.status.filter((x) => x !== s) : [...f.status, s] });

    return (
        <ResourceAdmin title="Consent & Withdrawal Register" description="View, manage and audit all user consents and withdrawals. Ensure compliance with POPIA and our Consent Architecture.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Consents" value={kpis.total} icon={<FileText className="size-5" />} />
                <Stat label="Active Consents" value={kpis.active} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Expired Consents" value={kpis.expired} tone="amber" icon={<TimerOff className="size-5" />} />
                <Stat label="Withdrawn" value={kpis.withdrawn} icon={<XCircle className="size-5" />} />
                <Stat label="Pending Requests" value={kpis.pending} tone="red" icon={<Clock className="size-5" />} />
            </div>
            <div className="mt-4 grid gap-5 lg:grid-cols-[230px_1fr]">
                <Box title="Refine Your View">
                    <p className="text-xs font-semibold">Consent Status</p>
                    {Object.entries(facets.status).map(([s, c]) => <label key={s} className="flex items-center gap-2 py-0.5 text-xs"><input type="checkbox" className="accent-gold-600" checked={f.status.includes(s)} onChange={() => toggleStatus(s)} /><span className="flex-1">{label(s === 'granted' ? 'active' : s)}</span>{c}</label>)}
                    {(['purpose', 'basis', 'channel'] as const).map((k) => (
                        <label key={k} className="mt-3 block text-xs font-semibold">{k === 'basis' ? 'Legal Basis' : label(k)}
                            <select value={f[k] ?? ''} onChange={(e) => go({ [k]: e.target.value })} className="mt-1 h-8 w-full rounded border border-parchment-500 text-xs font-normal"><option value="">All</option>{Object.entries(facets[k]).map(([v, c]) => <option key={v} value={v}>{label(v)} ({c})</option>)}</select>
                        </label>
                    ))}
                    <button type="button" onClick={() => { setF({ status: [] }); router.get('/admin/insights/resources/consents'); }} className="mt-3 flex w-full items-center justify-center gap-1 rounded border border-controlled-500/40 py-1.5 text-xs text-controlled-700"><RotateCcw className="size-3.5" /> Clear Filters</button>
                </Box>
                <div className="space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="relative max-w-md"><label className="sr-only" htmlFor="cq">Search</label><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input id="cq" value={f.q ?? ''} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by name, email or consent ID..." className="h-9 w-full rounded border border-parchment-500 bg-white pl-7 text-xs" /></form>
                    <Table head={['User', 'Email', 'Purpose', 'Legal Basis', 'Channel', 'Consent Date', 'Status', 'Expiry Date', 'Last Updated']}
                        rows={rows.map((r) => [<span key="u"><strong className="block">{r.name}</strong><span className="text-xs text-ink-400">ID: {r.ref}</span></span>, <span key="e" className="text-xs">{r.email}</span>, r.purpose, r.basis, r.channel, <span key="d" className="text-xs">{r.date}</span>, <Status key="s" value={r.state === 'granted' ? 'active' : r.state} />, r.expires ?? '–', <span key="up" className="text-xs">{r.updated}</span>])} />
                    <Pager page={pagination.page} lastPage={pagination.lastPage} query={f as unknown as Record<string, unknown>} path="/admin/insights/resources/consents" />
                    <Box title="Privacy Requests (Withdrawal & Erasure)">
                        <Table head={['Reference', 'Type', 'Name', 'Email', 'Received', 'Status', 'Action']}
                            rows={requests.map((r) => [r.reference, label(r.type), r.name, <span key="e" className="text-xs">{r.email}</span>, r.at, <Status key="s" value={r.status} />, r.status !== 'completed' ? <button key="a" type="button" onClick={() => router.post(`/admin/insights/resources/privacy-requests/${r.id}`, {}, { preserveScroll: true })} className="rounded border px-2 py-0.5 text-xs">Advance</button> : '—'])}
                            empty="No privacy requests." />
                    </Box>
                </div>
            </div>
        </ResourceAdmin>
    );
}
