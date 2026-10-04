import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Layers, MessageCircle, Plus, Search, Send, Timer } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, CheckList, Donut, Legend, PALETTE, Stat, Status, Table, num } from '@/Components/Insights/Shared';

interface Props {
    filters: { q?: string; type?: string; status?: string };
    rows: { id: number; code: string; name: string; intent: string; industries: string; stages: string | null; type: string; status: string; language: string; updated: string; usage: number }[];
    kpis: { total: number; active: number; messages: number; paused: number; inactive: number };
    intents: Record<string, number>;
    range: { first: string | null; last: string | null };
}

export default function WhatsApp({ filters, rows, kpis, intents, range }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', type: filters.type ?? '', status: filters.status ?? '' }, '/admin/insights/industries/whatsapp');
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', intent: '', stages: 'S0 – S8', message_type: 'Informational', industries: 'All (17)', acknowledge: false });
    const total = Object.values(intents).reduce((a, b) => a + b, 0);

    return (
        <IndustryAdmin title="Sector-Aware WhatsApp Flow Set" badge="Support & Notifications Only" description="Pre-approved WhatsApp message flows tailored to each Industry and lifecycle stage. These flows provide support, reminders and guidance only — no advice, no opinions and no gated output release."
            actions={<button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded bg-controlled-500 px-3 py-2 text-xs font-bold text-white"><Plus className="size-4" /> Create / Update Flow</button>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total WhatsApp Flows" value={kpis.total} caption={`${range.first} to ${range.last}`} icon={<MessageCircle className="size-5" />} />
                <Stat label="Industries Covered" value={17} caption="100% of Canonical" icon={<Layers className="size-5" />} />
                <Stat label="Active Flows" value={kpis.active} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Messages Sent (30 Days)" value={num(kpis.messages)} icon={<Send className="size-5" />} />
                <Stat label="Avg. Response Time" value="9m 42s" caption="Target < 15m" icon={<Timer className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search flow or keyword..." className="h-9 w-56 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Intent type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Intent Types</option>{['Informational', 'Reminder', 'Alert', 'Support'].map((t) => <option key={t}>{t}</option>)}</select>
                <select aria-label="Status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Statuses</option><option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option></select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_270px]">
                <Box title={`WhatsApp Flow Set (${rows.length})`}>
                    <Table head={['Flow ID', 'Flow Name', 'Primary Intent', 'Industries', 'Lifecycle Stage(s)', 'Message Type', 'Status', 'Language', 'Last Updated', 'Actions']}
                        rows={rows.map((r) => [r.code, <strong key="n" className="text-xs">{r.name}</strong>, <span key="i" className="text-xs">{r.intent}</span>, r.industries, r.stages, <Status key="t" value={r.type} />, <Status key="s" value={r.status} />, r.language, r.updated,
                            <select key="a" aria-label={`Status of ${r.code}`} value={r.status} onChange={(e) => router.put(`/admin/insights/industries/whatsapp/${r.id}`, { status: e.target.value }, { preserveScroll: true })} className="h-8 rounded border border-parchment-500 text-xs"><option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option></select>])} />
                </Box>
                <div className="space-y-4">
                    <Box title="Flow Set Overview"><div className="flex items-center gap-3"><Donut label={kpis.total} sub="Flows" size={100} segments={[{ value: kpis.active, color: '#2f9e5b' }, { value: kpis.paused, color: '#d6a32e' }, { value: kpis.inactive, color: '#d64545' }]} /><Legend items={[{ label: 'Active', value: kpis.active, color: '#2f9e5b' }, { label: 'Paused', value: kpis.paused, color: '#d6a32e' }, { label: 'Inactive', value: kpis.inactive, color: '#d64545' }]} /></div></Box>
                    <Box title="Intent Type Distribution"><Legend items={Object.entries(intents).map(([k, v], i) => ({ label: k, value: `${v} (${Math.round((v / Math.max(1, total)) * 100)}%)`, color: PALETTE[i] }))} /></Box>
                    <Box title="Guardrails Compliance"><CheckList className="text-xs" items={['No advice or opinions provided', 'No gated output or documents released', 'Escalate to portal for outputs', 'Respect opt-in and consent rules', 'Log all conversations & outcomes']} /></Box>
                </div>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Create Flow" footer={<button type="button" onClick={() => form.post('/admin/insights/industries/whatsapp', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Create flow</button>}>
                <div className="space-y-3">
                    <Field label="Flow name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Primary intent" required error={form.errors.intent}>{(id) => <Input id={id} value={form.data.intent} onChange={(e) => form.setData('intent', e.target.value)} />}</Field>
                    <div className="grid grid-cols-3 gap-2">
                        <Field label="Stages" required error={form.errors.stages}>{(id) => <Input id={id} value={form.data.stages} onChange={(e) => form.setData('stages', e.target.value)} />}</Field>
                        <Field label="Message type">{(id) => <Select id={id} value={form.data.message_type} onChange={(e) => form.setData('message_type', e.target.value)} options={['Informational', 'Reminder', 'Alert', 'Support']} />}</Field>
                        <Field label="Industries">{(id) => <Select id={id} value={form.data.industries} onChange={(e) => form.setData('industries', e.target.value)} options={['All (17)', 'Regulated Only']} />}</Field>
                    </div>
                    <Checkbox label="This flow provides support and notifications only — no advice, opinions or gated outputs." checked={form.data.acknowledge} onChange={(e) => form.setData('acknowledge', e.target.checked)} />
                    {form.errors.acknowledge && <p role="alert" className="text-xs text-risk-500">{form.errors.acknowledge}</p>}
                </div>
            </Modal>
        </IndustryAdmin>
    );
}
