import { router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { CircleCheck, Clock, FileText, Info, RotateCcw, Search, TriangleAlert } from 'lucide-react';
import { KpiTile, Modal, Panel, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell, { Donut, ExportLink, Pager, useFilters, type Paginated } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';

interface Item {
    id: number;
    code: string;
    claim_code: string;
    claim: string;
    category: string;
    type: string;
    source: string;
    issuer: string;
    verification_status: string;
    expiry: string | null;
    expiry_status: 'current' | 'expiring_soon' | 'expired' | 'no_expiry';
    owner: string | null;
}
interface Props {
    items: Paginated<Item>;
    kpis: Record<'total' | 'current' | 'expiring_soon' | 'expired' | 'no_expiry', number>;
    upcoming: { code: string; title: string; expiry: string; days: number }[];
    score: number;
    filters: Record<string, string | undefined>;
    options: { categories: string[]; types: string[] };
}

const dot = { current: 'bg-verified-500', expiring_soon: 'bg-attested-500', expired: 'bg-risk-500', no_expiry: 'bg-controlled-500' };

export default function Evidence({ items, kpis, upcoming, score, filters, options }: Props) {
    const apply = useFilters('/admin/about/evidence', filters);
    const [q, setQ] = useState(filters.q ?? '');
    const [renew, setRenew] = useState<Item | null>(null);
    const [date, setDate] = useState('');
    const [showCalc, setShowCalc] = useState(false);
    const pct = (n: number) => `${kpis.total ? Math.round((n / kpis.total) * 1000) / 10 : 0}%`;
    const exportQs = new URLSearchParams(Object.entries(filters).filter(([, v]) => !!v) as [string, string][]).toString();

    const act = (item: Item, action: string, extra: Record<string, string> = {}) =>
        router.post(`/admin/about/evidence/${item.id}/action`, { action, ...extra }, { preserveScroll: true, onSuccess: () => setRenew(null) });
    const search = (e: FormEvent) => {
        e.preventDefault();
        apply({ q, page: undefined });
    };

    return (
        <AdminShell
            crumb="Evidence & Expiry Monitor"
            title="Evidence & Expiry Monitor"
            lead="Continuous assurance. Always current."
            description="This dashboard tracks the validity and expiry of all evidence assets that support our public claims. Expired evidence withdraws or holds the claim automatically."
            actions={<ExportLink href={`/admin/about/evidence/export?${exportQs}`} label="Export Report" />}
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
                <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <KpiTile label="Total Evidence Items" value={kpis.total} caption="Across all categories" icon={<FileText className="size-4" />} />
                        <KpiTile label="Current" value={kpis.current} caption={pct(kpis.current)} tone="good" icon={<CircleCheck className="size-4" />} />
                        <KpiTile label="Expiring Soon" value={kpis.expiring_soon} caption={pct(kpis.expiring_soon)} tone="warn" icon={<Clock className="size-4" />} />
                        <KpiTile label="Expired" value={kpis.expired} caption={pct(kpis.expired)} tone="bad" icon={<TriangleAlert className="size-4" />} />
                        <KpiTile label="No Expiry" value={kpis.no_expiry} caption={pct(kpis.no_expiry)} icon={<Info className="size-4" />} />
                    </div>
                    <form onSubmit={search} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-3 xl:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
                        <label className="relative"><span className="sr-only">Search evidence</span><Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence (keyword, claim ID, doc name)..." className="pl-9" /></label>
                        <Select aria-label="Claim category" placeholder="All categories" options={options.categories} value={filters.category ?? ''} onChange={(e) => apply({ category: e.target.value, page: undefined })} />
                        <Select aria-label="Evidence type" placeholder="All types" options={options.types} value={filters.type ?? ''} onChange={(e) => apply({ type: e.target.value, page: undefined })} />
                        <Select aria-label="Verification status" placeholder="All verification" options={[{ value: 'verified', label: 'Verified' }, { value: 'in_review', label: 'In review' }, { value: 'rejected', label: 'Rejected' }]} value={filters.verification ?? ''} onChange={(e) => apply({ verification: e.target.value, page: undefined })} />
                        <Select aria-label="Expiry status" placeholder="All expiry" options={[{ value: 'current', label: 'Current' }, { value: 'expiring_soon', label: 'Expiring soon' }, { value: 'expired', label: 'Expired' }, { value: 'no_expiry', label: 'No expiry' }]} value={filters.expiry ?? ''} onChange={(e) => apply({ expiry: e.target.value, page: undefined })} />
                        <button type="button" onClick={() => router.get('/admin/about/evidence')} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold"><RotateCcw className="size-3.5" aria-hidden="true" /> Clear</button>
                    </form>
                    <Panel title="Evidence Inventory">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600">
                                    <tr>{['Evidence ID', 'Claim Statement', 'Category', 'Evidence Type', 'Source / Document', 'Verification', 'Expiry Date', 'Expiry Status', 'Owner', 'Actions'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {items.data.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-ink-400">No evidence matches these filters.</td></tr>}
                                    {items.data.map((i) => (
                                        <tr key={i.id} className="align-top">
                                            <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gold-700">{i.code}</td>
                                            <td className="max-w-56 px-3 py-2.5"><span className="block text-xs text-ink-400">{i.claim_code}</span>{i.claim}</td>
                                            <td className="px-3 py-2.5"><span className="rounded border border-controlled-500/30 px-1.5 py-0.5 text-xs text-controlled-700">{i.category}</span></td>
                                            <td className="px-3 py-2.5">{i.type}</td>
                                            <td className="max-w-48 px-3 py-2.5">{i.source}<span className="block text-xs text-ink-400">{i.issuer}</span></td>
                                            <td className="px-3 py-2.5"><StatusPill status={i.verification_status} /></td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">{i.expiry ? fmtDate(i.expiry) : 'No Expiry'}</td>
                                            <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 text-xs capitalize"><span className={cn('size-2 rounded-full', dot[i.expiry_status])} aria-hidden="true" />{i.expiry_status.replace('_', ' ')}</span></td>
                                            <td className="px-3 py-2.5">{i.owner}</td>
                                            <td className="px-3 py-2.5">
                                                <select aria-label={`Actions for ${i.code}`} value="" onChange={(e) => { const v = e.target.value; if (v === 'renew') { setRenew(i); setDate(''); } else if (v) act(i, v); }} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                                    <option value="">Action…</option>
                                                    {i.verification_status !== 'verified' && <option value="verify">Mark verified</option>}
                                                    <option value="renew">Renew / new expiry</option>
                                                    {i.verification_status !== 'rejected' && <option value="reject">Reject evidence</option>}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pager page={items} noun="evidence items" />
                    </Panel>
                </div>
                <aside className="space-y-4">
                    <Panel title="Expiry Status Overview">
                        <Donut total={kpis.total} segments={[{ label: 'Current', value: kpis.current, color: '#1f7a4c' }, { label: 'Expiring Soon', value: kpis.expiring_soon, color: '#b0781e' }, { label: 'Expired', value: kpis.expired, color: '#b5372a' }, { label: 'No Expiry', value: kpis.no_expiry, color: '#2f5fa8' }]} />
                    </Panel>
                    <Panel title="Expiring in Next 60 Days">
                        {upcoming.length === 0 ? <p className="text-sm text-ink-400">Nothing expiring.</p> : (
                            <ul className="space-y-2 text-xs">
                                {upcoming.map((u) => <li key={u.code} className="flex justify-between gap-2"><span><span className="font-mono text-gold-700">{u.code}</span> {u.title}</span><span className={cn('shrink-0 rounded px-1.5', u.days <= 30 ? 'bg-risk-50 text-risk-700' : 'bg-attested-50 text-attested-700')}>{fmtDate(u.expiry)} ({u.days}d)</span></li>)}
                            </ul>
                        )}
                        <button type="button" onClick={() => apply({ expiry: 'expiring_soon', page: undefined })} className="mt-3 text-xs font-semibold text-gold-700">View All Expiring Items →</button>
                    </Panel>
                    <Panel title="Evidence Health Score">
                        <p className="text-4xl font-bold text-ink-900">{score}<span className="text-base text-ink-400">/100</span></p>
                        <p className={cn('text-sm font-semibold', score >= 80 ? 'text-verified-700' : score >= 60 ? 'text-attested-700' : 'text-risk-700')}>{score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'At risk'}</p>
                        <button type="button" onClick={() => setShowCalc(!showCalc)} className="mt-2 text-xs font-semibold text-gold-700">How is this calculated?</button>
                        {showCalc && <p className="mt-2 text-xs text-ink-600">Verified current or no-expiry evidence scores 1, verified expiring-soon 0.6, unverified 0.4 and expired 0 — averaged across all evidence items.</p>}
                    </Panel>
                </aside>
            </div>

            <Modal open={!!renew} onClose={() => setRenew(null)} title={`Renew ${renew?.code ?? ''}`} footer={<><Button variant="outline" type="button" onClick={() => setRenew(null)}>Cancel</Button><Button type="button" disabled={!date} onClick={() => renew && act(renew, 'renew', { expiry_date: date })}>Save renewal</Button></>}>
                <p className="mb-3 text-sm text-ink-600">{renew?.source}</p>
                <Field label="New expiry date" required>{(id) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
            </Modal>
        </AdminShell>
    );
}
Evidence.layout = null;
