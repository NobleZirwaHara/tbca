import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, ShieldAlert, Users, Workflow } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, BarList, Card, Donut, FilterBar, fmtDate, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Row {
    id: number; reference: string; sprint_code: string; product_name: string; vehicle: string; act: string; professional: string | null; professional_type: string | null;
    stage: string; risk: string; boundary: string; client_name: string | null; notes: string | null; date: string | null; sla_due: string | null;
}
interface Props {
    rows: Row[];
    kpis: { total: number; handed: number; progress: number; escalated: number };
    boundary: Record<string, number>;
    types: Record<string, number>;
    stages: string[];
    filters: Record<string, string>;
}

const WORKFLOW = [
    ['Client Trigger', 'Client selects a product or service'],
    ['Boundary Check', 'System evaluates product against professional boundary rules'],
    ['Professional Match', 'Identify appropriate verified professional or firm'],
    ['Handoff', 'Transfer client with context and requirements'],
    ['Confirmation', 'Professional accepts handoff or requests clarification'],
    ['Closed / Logged', 'Outcome recorded and visible to all parties'],
];

function MatchModal({ row, onClose }: { row: Row; onClose: () => void }) {
    const form = useForm({ professional: row.professional ?? '', professional_type: row.professional_type ?? 'Legal Professionals' });
    return (
        <Modal open onClose={onClose} title={`Match professional - ${row.reference}`} footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/handoffs/${row.id}/advance`, { preserveScroll: true, onSuccess: onClose })}>Match & Advance</Button>}>
            <div className="space-y-3">
                <Field label="Verified professional / firm" required error={form.errors.professional}>{(id) => <Input id={id} value={form.data.professional} onChange={(e) => form.setData('professional', e.target.value)} />}</Field>
                <Field label="Professional type" error={form.errors.professional_type}>{(id) => <Input id={id} value={form.data.professional_type} onChange={(e) => form.setData('professional_type', e.target.value)} />}</Field>
            </div>
        </Modal>
    );
}

function EscalateModal({ row, onClose }: { row: Row; onClose: () => void }) {
    const form = useForm({ reason: '' });
    return (
        <Modal open onClose={onClose} title={`Escalate boundary risk - ${row.reference}`} footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/handoffs/${row.id}/escalate`, { preserveScroll: true, onSuccess: onClose })}>Escalate</Button>}>
            <Field label="Reason" required error={form.errors.reason}>{(id) => <Textarea id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="e.g. Potential reserved activity" />}</Field>
        </Modal>
    );
}

export default function Handoffs({ rows, kpis, boundary, types, stages, filters }: Props) {
    const [matching, setMatching] = useState<Row | null>(null);
    const [escalating, setEscalating] = useState<Row | null>(null);
    const within = boundary.within ?? 0;
    const total = Object.values(boundary).reduce((s, v) => s + v, 0);

    const advance = (r: Row) => {
        const needsPro = (r.stage === 'boundary_check' || r.stage === 'professional_match' || r.stage === 'escalated') && !r.professional;
        if (needsPro) setMatching(r);
        else router.post(`/admin/shop/handoffs/${r.id}/advance`, {}, { preserveScroll: true });
    };

    return (
        <AdminShell title="Native Handoff / Professional Boundary" badge="Governance" description="Ensure clients and staff are handed off to the right professional at the right time with clear boundary rules and full audit.">
            <KpiGrid cols={4}>
                <Kpi icon={<Users className="size-5" />} label="Handoff Requests" value={kpis.total} tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Successfully Handed Off" value={kpis.handed} caption={`${pct(kpis.handed, kpis.total)} success rate`} tone="good" />
                <Kpi icon={<Clock className="size-5" />} label="In Progress" value={kpis.progress} caption={pct(kpis.progress, kpis.total)} tone="warn" />
                <Kpi icon={<ShieldAlert className="size-5" />} label="Boundary Risks / Escalated" value={kpis.escalated} caption={pct(kpis.escalated, kpis.total)} tone="bad" />
            </KpiGrid>

            <FilterBar path="/admin/shop/handoffs" filters={filters} search={false} selects={[{ name: 'stage', label: 'Handoff Stage', options: [...stages, 'escalated'] }, { name: 'type', label: 'Professional Type', options: Object.keys(types) }]} />

            <Card title="Handoff Workflow">
                <ol className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    {WORKFLOW.map(([t, b], i) => (
                        <li key={t} className="text-center text-xs">
                            <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-verified-700 font-bold text-white">{i + 1}</span>
                            <p className="mt-1 font-semibold text-ink-900">{t}</p>
                            <p className="text-ink-500">{b}</p>
                        </li>
                    ))}
                </ol>
            </Card>

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Card title="Recent Handoff Requests">
                        <SimpleTable
                            columns={['Request ID', 'Date / Time', 'Sprint Code', 'Product / Sprint', 'Vehicle', 'Commercial Act', 'Professional Matched', 'Stage', 'Risk', 'Boundary', 'SLA Due', 'Actions']}
                            rows={rows.map((r) => [
                                <span key="r" className="font-mono text-xs">{r.reference}</span>, fmtDate(r.date, true), r.sprint_code,
                                <span key="p" title={r.notes ?? ''}>{r.product_name}{r.client_name && <span className="block text-[0.6875rem] text-ink-400">{r.client_name}</span>}</span>,
                                r.vehicle, r.act, r.professional ?? '-',
                                <StatusPill key="s" status={r.stage} tone={r.stage === 'escalated' ? 'bad' : r.stage === 'accepted' || r.stage === 'closed' ? 'good' : 'info'} />,
                                <StatusPill key="k" status={r.risk} tone={r.risk === 'high' ? 'bad' : r.risk === 'medium' ? 'warn' : 'good'} />,
                                <StatusPill key="b" status={r.boundary.replace('_', ' ')} tone={r.boundary === 'within' ? 'good' : r.boundary === 'breached' ? 'bad' : 'warn'} />,
                                fmtDate(r.sla_due),
                                <div key="a" className="flex flex-wrap gap-1">
                                    {r.stage !== 'closed' && <button type="button" onClick={() => advance(r)} className="inline-flex h-8 items-center rounded-[4px] border border-verified-500 px-2.5 text-xs font-semibold text-verified-700">{r.stage === 'escalated' ? 'Resolve' : 'Advance'}</button>}
                                    {r.stage !== 'closed' && r.stage !== 'escalated' && <button type="button" onClick={() => setEscalating(r)} className="inline-flex h-8 items-center rounded-[4px] border border-risk-500/60 px-2.5 text-xs font-semibold text-risk-700">Escalate</button>}
                                </div>,
                            ])}
                        />
                    </Card>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Professional Boundary Health" centre={pct(within, total)} caption="Healthy" segments={[{ label: 'Within Boundary', value: within }, { label: 'At Risk', value: boundary.at_risk ?? 0, color: '#d6a32e' }, { label: 'Breached', value: boundary.breached ?? 0, color: '#b5372a' }, { label: 'Pending Review', value: boundary.pending_review ?? 0, color: '#7a4fa3' }]} />
                    <Card title="Professional Match Distribution"><BarList rows={Object.entries(types).map(([label, value]) => ({ label, value }))} /></Card>
                    <Card title="Policy Reminders">
                        <ul className="space-y-2 text-xs text-ink-700">
                            <li className="flex gap-2"><Workflow className="size-4 shrink-0 text-verified-500" /> TBCA does not provide regulated professional services. All regulated engagements are performed by verified independent professionals.</li>
                            <li className="flex gap-2"><Workflow className="size-4 shrink-0 text-verified-500" /> Handoffs are recorded for governance, quality assurance and client protection.</li>
                        </ul>
                    </Card>
                </div>
            </div>
            {matching && <MatchModal row={matching} onClose={() => setMatching(null)} />}
            {escalating && <EscalateModal row={escalating} onClose={() => setEscalating(null)} />}
            <span className="hidden"><ActionButton href="#">-</ActionButton></span>
        </AdminShell>
    );
}

Handoffs.layout = null;
