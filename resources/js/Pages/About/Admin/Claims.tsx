import { router } from '@inertiajs/react';
import { Fragment, useState, type FormEvent } from 'react';
import { Archive, CircleCheck, Eye, FileText, RotateCcw, Search, TriangleAlert } from 'lucide-react';
import { KpiTile, StatusPill } from '@/Components/ui/Kit';
import { Input, Select } from '@/Components/ui/Form';
import LedgerChip from '@/Components/ui/LedgerChip';
import AdminShell, { ExportLink, Pager, useFilters, type Paginated } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import type { LedgerCode } from '@/types';

interface ClaimRow {
    id: number;
    code: string;
    key: string;
    statement: string;
    category: string;
    ledger: LedgerCode;
    evidence_summary: string | null;
    review_status: string;
    verification_status: string;
    lifecycle: string;
    approval_authority: string | null;
    claimed_on: string | null;
    last_reviewed_at: string | null;
    public: boolean;
    needs_attention: boolean;
    surfaces: string[];
    evidence: { code: string; title: string; issuer: string; verification_status: string; expiry: string | null; expiry_status: string }[];
}

interface Props {
    claims: Paginated<ClaimRow>;
    kpis: Record<'total' | 'verified' | 'under_review' | 'approved' | 'attention' | 'archived', number>;
    filters: Record<string, string | undefined>;
    options: { categories: string[]; authorities: string[] };
}

const actionsFor = (c: ClaimRow) => {
    const a: { key: string; label: string }[] = [];
    if (c.review_status !== 'approved') a.push({ key: 'approve', label: 'Approve for publication' });
    if (c.review_status === 'approved') a.push({ key: 'review', label: 'Send back to review' });
    if (c.verification_status !== 'verified') a.push({ key: 'verify', label: 'Mark verified' });
    if (c.review_status !== 'rejected') a.push({ key: 'reject', label: 'Reject' });
    if (c.lifecycle === 'active') a.push({ key: 'withdraw', label: 'Withdraw' }, { key: 'archive', label: 'Archive' });
    else a.push({ key: 'restore', label: 'Restore' });
    return a;
};

export default function Claims({ claims, kpis, filters, options }: Props) {
    const apply = useFilters('/admin/about/claims', filters);
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState<number | null>(null);
    const exportQs = new URLSearchParams(Object.entries(filters).filter(([, v]) => !!v) as [string, string][]).toString();

    const act = (c: ClaimRow, action: string) => router.post(`/admin/about/claims/${c.id}/action`, { action }, { preserveScroll: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        apply({ q, page: undefined });
    };

    return (
        <AdminShell
            crumb="Claim Register"
            title="Claim Register Console"
            lead="All claims. One source of truth."
            description="This register lists every public claim made by TBCA, the evidence that supports it, and the status of review and approval."
            actions={<ExportLink href={`/admin/about/claims/export?${exportQs}`} />}
        >
            <form onSubmit={search} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-3 xl:grid-cols-[1.4fr_repeat(4,1fr)_auto_auto_auto]">
                <label className="relative">
                    <span className="sr-only">Search claims</span>
                    <Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search claims by keyword..." className="pl-9" />
                </label>
                <Select aria-label="Claim category" placeholder="All categories" options={options.categories} value={filters.category ?? ''} onChange={(e) => apply({ category: e.target.value, page: undefined })} />
                <Select aria-label="Review status" placeholder="All review statuses" options={['proposed', 'under_review', 'approved', 'rejected'].map((v) => ({ value: v, label: v.replace('_', ' ') }))} value={filters.review ?? ''} onChange={(e) => apply({ review: e.target.value, page: undefined })} />
                <Select aria-label="Verification status" placeholder="All verification" options={['verified', 'in_progress', 'unverified'].map((v) => ({ value: v, label: v.replace('_', ' ') }))} value={filters.verification ?? ''} onChange={(e) => apply({ verification: e.target.value, page: undefined })} />
                <Select aria-label="Approval authority" placeholder="All authorities" options={options.authorities} value={filters.authority ?? ''} onChange={(e) => apply({ authority: e.target.value, page: undefined })} />
                <Input type="date" aria-label="Claimed from" value={filters.from ?? ''} onChange={(e) => apply({ from: e.target.value, page: undefined })} />
                <Input type="date" aria-label="Claimed to" value={filters.to ?? ''} onChange={(e) => apply({ to: e.target.value, page: undefined })} />
                <button type="button" onClick={() => router.get('/admin/about/claims')} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold text-ink-700"><RotateCcw className="size-3.5" aria-hidden="true" /> Clear Filters</button>
            </form>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Total Claims" value={kpis.total} caption="Across all categories" icon={<FileText className="size-4" />} />
                <KpiTile label="Verified" value={kpis.verified} caption="Evidence reviewed" tone="good" icon={<CircleCheck className="size-4" />} />
                <KpiTile label="Under Review" value={kpis.under_review} caption="Awaiting review" tone="warn" />
                <KpiTile label="Approved" value={kpis.approved} caption="Approved for publication" />
                <KpiTile label="Needs Attention" value={kpis.attention} caption="Evidence expired" tone="bad" icon={<TriangleAlert className="size-4" />} />
                <KpiTile label="Archived" value={kpis.archived} caption="No longer active" icon={<Archive className="size-4" />} />
            </div>

            <div className="mt-4 overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                <table className="w-full min-w-[1100px] text-left text-[0.8125rem]">
                    <thead className="bg-parchment-200 text-xs text-ink-600">
                        <tr>{['Claim ID', 'Claim Statement', 'Category', 'Evidence Summary', 'Review Status', 'Verification Status', 'Approval Authority', 'Date Claimed', 'Last Reviewed', 'Actions'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-300">
                        {claims.data.length === 0 && <tr><td colSpan={10} className="px-3 py-8 text-center text-ink-400">No claims match these filters.</td></tr>}
                        {claims.data.map((c) => (
                            <Fragment key={c.id}>
                                <tr className="align-top">
                                    <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gold-700">{c.code}</td>
                                    <td className="max-w-64 px-3 py-2.5 text-ink-900">
                                        {c.statement}
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            <LedgerChip code={c.ledger} full={false} />
                                            {c.public ? <StatusPill status="public" tone="good" /> : <StatusPill status="not public" tone="neutral" />}
                                            {c.needs_attention && <StatusPill status="evidence expired" tone="bad" />}
                                            {c.lifecycle !== 'active' && <StatusPill status={c.lifecycle} />}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5"><span className="rounded border border-parchment-400 px-1.5 py-0.5 text-xs">{c.category}</span></td>
                                    <td className="max-w-48 px-3 py-2.5 text-ink-700">{c.evidence_summary ?? '—'}</td>
                                    <td className="px-3 py-2.5"><StatusPill status={c.review_status} /></td>
                                    <td className="px-3 py-2.5"><StatusPill status={c.verification_status} /></td>
                                    <td className="px-3 py-2.5 text-ink-700">{c.approval_authority}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(c.claimed_on)}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(c.last_reviewed_at)}</td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <button type="button" onClick={() => setOpen(open === c.id ? null : c.id)} className="rounded border border-parchment-400 p-1.5 text-ink-600 hover:text-gold-700" aria-label={`View evidence for ${c.code}`} aria-expanded={open === c.id}>
                                                <Eye className="size-4" />
                                            </button>
                                            <select aria-label={`Actions for ${c.code}`} value="" onChange={(e) => e.target.value && act(c, e.target.value)} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                                <option value="">Action…</option>
                                                {actionsFor(c).map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                {open === c.id && (
                                    <tr className="bg-parchment-100">
                                        <td colSpan={10} className="px-4 py-3">
                                            <p className="text-xs font-semibold text-ink-700">Evidence for {c.code} · surfaces: {c.surfaces.join(', ') || '—'}</p>
                                            <ul className="mt-2 grid gap-2 md:grid-cols-2">
                                                {c.evidence.map((e) => (
                                                    <li key={e.code} className="rounded border border-parchment-400 bg-white p-2 text-xs">
                                                        <span className="font-mono">{e.code}</span> · {e.title} · {e.issuer}
                                                        <span className="mt-1 flex gap-1"><StatusPill status={e.verification_status} /><StatusPill status={e.expiry_status} /> <span className="text-ink-500">{e.expiry ? `expires ${fmtDate(e.expiry)}` : 'no expiry'}</span></span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pager page={claims} noun="claims" />
        </AdminShell>
    );
}
Claims.layout = null;
