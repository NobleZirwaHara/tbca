import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Ban, CheckCircle2, Clock, EyeOff, Info, Lock, Search, Unlock } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Stat, Status, Table } from '@/Components/Insights/Shared';

interface Row { id: number; code: string; title: string; industry: string | null; subIndustry: string | null; type: string; reason: string | null; message: string | null; status: string | null; blockedOn: string | null; reviewBy: string | null }
interface Props {
    filters: { q?: string; type?: string; status?: string; industry?: string };
    rows: Row[];
    kpis: { total: number; hidden: number; restricted: number; review: number; released: number; catalogue: number };
    reasons: Record<string, number>;
    industries: { value: string; label: string }[];
    candidates: { value: string; label: string }[];
}

export default function Blocked({ filters, rows, kpis, reasons, industries, candidates }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', type: filters.type ?? '', status: filters.status ?? '', industry: filters.industry ?? '' }, '/admin/insights/industries/blocked');
    const [open, setOpen] = useState(false);
    const form = useForm({ sku_id: '', sale_state: 'blocked', block_reason: '', client_message: '', review_by: '' });
    const act = (id: number, action: string) => router.put(`/admin/insights/industries/blocked/${id}`, { action }, { preserveScroll: true });

    return (
        <IndustryAdmin
            title="Blocked-SKU Register Manager"
            badge="Governed Control"
            description="Manage Sprints that are blocked or restricted from sale. Control visibility, client messaging and review workflow."
            actions={<button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Lock className="size-4" /> Block / Restrict SKU</button>}
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Blocked / Restricted" value={kpis.total} caption={`of ${kpis.catalogue} SKUs`} icon={<Lock className="size-5" />} tone="red" />
                <Stat label="Hidden from Catalogue" value={kpis.hidden} icon={<EyeOff className="size-5" />} />
                <Stat label="Restricted (Conditioned)" value={kpis.restricted} icon={<Info className="size-5" />} tone="amber" />
                <Stat label="Under Review" value={kpis.review} icon={<Clock className="size-5" />} />
                <Stat label="Released (Last 30 Days)" value={kpis.released} icon={<CheckCircle2 className="size-5" />} tone="green" />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by Sprint Code, Title, Reason..." className="h-9 w-64 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Industry" value={f.industry} onChange={(e) => apply({ industry: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Industries</option>{industries.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}</select>
                <select aria-label="Block type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Types</option><option value="blocked">Blocked (Non-Sellable)</option><option value="restricted">Restricted (Conditioned)</option></select>
                <select aria-label="Status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Statuses</option><option value="active">Active</option><option value="under_review">Under Review</option><option value="released">Released</option></select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_260px]">
                <Box title={`Blocked / Restricted Sprints (${rows.length})`}>
                    <Table
                        head={['Sprint Code', 'Sprint Title', 'Industry / Sub-Industry', 'Block Type', 'Reason', 'Client Message (Short)', 'Status', 'Blocked On', 'Review By', 'Actions']}
                        rows={rows.map((r) => [
                            <strong key="c">{r.code}</strong>, r.title, <span key="i" className="text-xs">{r.industry} / {r.subIndustry}</span>,
                            <Status key="t" value={r.type === 'blocked' ? 'Blocked (Non-Sellable)' : 'Restricted (Conditioned)'} />,
                            <span key="r" className="text-xs">{r.reason}</span>, <span key="m" className="text-xs">{r.message}</span>, <Status key="s" value={r.status ?? 'active'} />, r.blockedOn ?? '—', r.reviewBy ?? '—',
                            <span key="a" className="flex gap-1">
                                {r.status !== 'under_review' && r.status !== 'released' && <button type="button" onClick={() => act(r.id, 'review')} className="rounded border px-1.5 py-0.5 text-[0.6875rem]">Review</button>}
                                {r.status === 'under_review' && <button type="button" onClick={() => act(r.id, 'activate')} className="rounded border px-1.5 py-0.5 text-[0.6875rem]"><Ban className="inline size-3" /> Keep</button>}
                                {r.status !== 'released' && <button type="button" onClick={() => act(r.id, 'release')} className="rounded border border-verified-500/40 px-1.5 py-0.5 text-[0.6875rem] text-verified-700"><Unlock className="inline size-3" /> Release</button>}
                            </span>,
                        ])}
                    />
                </Box>
                <div className="space-y-4">
                    <Box title="Client Messaging Principles"><ul className="space-y-1.5 text-xs">{['Be clear and respectful', 'Explain the reason (without exposing confidential rules)', 'Offer the approved alternative', 'Direct to TBCA Advisor or Partner', 'Do not encourage workarounds'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul></Box>
                    <Box title="Common Block Reasons"><ul className="space-y-1 text-xs">{Object.entries(reasons).map(([r, c]) => <li key={r} className="flex justify-between gap-2"><span>{r}</span><strong>{c}</strong></li>)}</ul></Box>
                </div>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Block / Restrict SKU" footer={<button type="button" disabled={form.processing} onClick={() => form.post('/admin/insights/industries/blocked', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Apply control</button>}>
                <div className="space-y-3">
                    <Field label="Sprint / SKU" required error={form.errors.sku_id}>{(id) => <Select id={id} value={form.data.sku_id} onChange={(e) => form.setData('sku_id', e.target.value)} options={candidates} placeholder="Select a sellable SKU" />}</Field>
                    <Field label="Block type" required error={form.errors.sale_state}>{(id) => <Select id={id} value={form.data.sale_state} onChange={(e) => form.setData('sale_state', e.target.value)} options={[{ value: 'blocked', label: 'Blocked (Non-Sellable)' }, { value: 'restricted', label: 'Restricted (Conditioned)' }]} />}</Field>
                    <Field label="Reason" required error={form.errors.block_reason}>{(id) => <Input id={id} value={form.data.block_reason} onChange={(e) => form.setData('block_reason', e.target.value)} placeholder="e.g. Regulated activity – licence required" />}</Field>
                    <Field label="Client message (short)" required error={form.errors.client_message}>{(id) => <Input id={id} value={form.data.client_message} onChange={(e) => form.setData('client_message', e.target.value)} />}</Field>
                    <Field label="Review by" error={form.errors.review_by}>{(id) => <Input id={id} type="date" value={form.data.review_by} onChange={(e) => form.setData('review_by', e.target.value)} />}</Field>
                </div>
            </Modal>
        </IndustryAdmin>
    );
}
