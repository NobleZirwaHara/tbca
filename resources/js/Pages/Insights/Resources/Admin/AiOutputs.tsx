import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, Flag, Plus, Search, XCircle } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { useFilters } from '@/Components/Insights/Industries';
import { Bars, Box, Donut, Legend, PALETTE, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';

interface Props {
    filters: { q?: string; type?: string; model?: string; status?: string; risk?: string };
    rows: { id: number; outputId: string; title: string; subject: string | null; type: string; model: string; prompt: string; by: string; at: string; status: string; risk: string; reviewer: string | null; reviewedAt: string | null }[];
    kpis: { total: number; approved: number; review: number; rejected: number; high: number };
    models: Record<string, number>;
    risks: Record<string, number>;
    types: string[];
}

export default function AiOutputs({ filters, rows, kpis, models, risks, types }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', type: filters.type ?? '', model: filters.model ?? '', status: filters.status ?? '', risk: filters.risk ?? '' }, '/admin/insights/resources/ai-outputs');
    const [open, setOpen] = useState(false);
    const form = useForm({ title: '', subject: '', content_type: 'Guide', model: 'Claude 3.5', prompt: '', risk: 'low' });
    const review = (id: number, status: string) => router.put(`/admin/insights/resources/ai-outputs/${id}`, { status }, { preserveScroll: true });
    const sel = 'h-9 rounded border border-parchment-500 bg-white text-xs';
    const totalM = Object.values(models).reduce((a, b) => a + b, 0);

    return (
        <ResourceAdmin title="AI Content Output Register" description="Track and audit all AI-generated content outputs across the platform. Ensure transparency, human oversight, and compliance with AI Content Policy."
            actions={<button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Register New AI Output</button>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total AI Outputs" value={kpis.total} icon={<FileText className="size-5" />} />
                <Stat label="Approved" value={kpis.approved} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Under Review" value={kpis.review} tone="amber" icon={<Clock className="size-5" />} />
                <Stat label="Rejected / Revised" value={kpis.rejected} icon={<XCircle className="size-5" />} />
                <Stat label="High Risk Outputs" value={kpis.high} tone="red" icon={<Flag className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by title, prompt, output ID or author..." className="h-9 w-64 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Content type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className={sel}><option value="">All Content Types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
                <select aria-label="AI model" value={f.model} onChange={(e) => apply({ model: e.target.value })} className={sel}><option value="">All AI Models</option>{Object.keys(models).map((m) => <option key={m}>{m}</option>)}</select>
                <select aria-label="Status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className={sel}><option value="">All Statuses</option><option value="approved">Approved</option><option value="under_review">Under Review</option><option value="rejected">Rejected</option></select>
                <select aria-label="Risk level" value={f.risk} onChange={(e) => apply({ risk: e.target.value })} className={sel}><option value="">All Risk Levels</option>{Object.keys(risks).map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Filter</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_270px]">
                <Table head={['Output ID', 'Title / Subject', 'Content Type', 'AI Model', 'Prompt Summary', 'Created By', 'Created On', 'Status', 'Risk Level', 'Human Review', 'Actions']}
                    rows={rows.map((r) => [<span key="i" className="rounded border border-controlled-500/40 px-1.5 text-[0.6875rem] text-controlled-700">{r.outputId}</span>, <span key="t"><strong className="block">{r.title}</strong><span className="text-xs text-ink-500">{r.subject}</span></span>, r.type, r.model, <span key="p" className="text-xs">{r.prompt}</span>, r.by, <span key="a" className="text-xs">{r.at}</span>, <Status key="s" value={r.status} />, <Status key="r" value={r.risk} />, <span key="h" className="text-xs">{r.reviewedAt ? `${r.reviewedAt} · ${r.reviewer}` : '–'}</span>,
                        <span key="x" className="flex gap-1">{r.status !== 'approved' && <button type="button" onClick={() => review(r.id, 'approved')} className="rounded border border-verified-500/40 px-1.5 py-0.5 text-[0.6875rem] text-verified-700">Approve</button>}{r.status !== 'rejected' && <button type="button" onClick={() => review(r.id, 'rejected')} className="rounded border border-risk-500/40 px-1.5 py-0.5 text-[0.6875rem] text-risk-700">Reject</button>}</span>])} />
                <div className="space-y-4">
                    <Box title="Outputs by AI Model"><div className="flex flex-col items-center gap-3"><Donut label={totalM} sub="Total" size={100} segments={Object.values(models).map((v, i) => ({ value: v, color: PALETTE[i] }))} /><Legend items={Object.entries(models).map(([k, v], i) => ({ label: k, value: v, color: PALETTE[i] }))} /></div></Box>
                    <Box title="Risk Level Distribution"><Bars items={Object.entries(risks).map(([k, v], i) => ({ label: `${label(k)} Risk`, value: v, color: ['#2f9e5b', '#d6a32e', '#d64545', '#8b5cf6'][i] }))} /></Box>
                </div>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Register New AI Output" footer={<button type="button" onClick={() => form.post('/admin/insights/resources/ai-outputs', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Register</button>}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Title" required error={form.errors.title}>{(id) => <Input id={id} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />}</Field>
                    <Field label="Subject">{(id) => <Input id={id} value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} />}</Field>
                    <Field label="Content type" required>{(id) => <Select id={id} value={form.data.content_type} onChange={(e) => form.setData('content_type', e.target.value)} options={['Guide', 'Template', 'Checklist', 'Email', 'Legal Text', 'Tool', 'Report', 'Policy', 'Article']} />}</Field>
                    <Field label="AI model" required>{(id) => <Select id={id} value={form.data.model} onChange={(e) => form.setData('model', e.target.value)} options={['GPT-4o', 'Claude 3.5', 'Gemini 1.5', 'Perplexity', 'Other']} />}</Field>
                    <Field label="Prompt summary" required error={form.errors.prompt} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.prompt} onChange={(e) => form.setData('prompt', e.target.value)} />}</Field>
                    <Field label="Risk level" required>{(id) => <Select id={id} value={form.data.risk} onChange={(e) => form.setData('risk', e.target.value)} options={['low', 'medium', 'high', 'critical']} />}</Field>
                </div>
            </Modal>
        </ResourceAdmin>
    );
}
