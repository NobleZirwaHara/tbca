import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { BellRing, Briefcase, CheckCircle2, Plus, ShieldAlert, Shuffle, XCircle } from 'lucide-react';
import { Modal, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { ActionButton, BarRow, CheckList } from '@/Components/Products/Shared';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate } from '@/Components/Products/Retainers/ui';

interface Row {
    id: number;
    reference: string;
    retainer: string;
    client: string;
    from: string;
    to: string;
    type: string;
    reason: string;
    requested: string;
    status: string;
    risk: string;
    note: string | null;
}

interface Props {
    kpis: { active: number; total: number; pending: number; approved: number; declined: number; high: number; approved_pct: number; declined_pct: number };
    rows: Row[];
    filters: { status: string; type: string; risk: string; q: string };
    risk: Record<string, number>;
    reasons: Record<string, number>;
    sla: { sent: number; awaiting: number; overdue: number; total: number };
    activity: { type: string; summary: string; at: string; retainer: string | null }[];
    options: { value: string; label: string }[];
}

const PATH = '/admin/products/retainers/substitution';
const STATUS = [
    ['pending_notice', 'Pending Notice'],
    ['awaiting_approval', 'Awaiting Approval'],
    ['discuss', 'Discussion Requested'],
    ['approved', 'Approved'],
    ['client_declined', 'Client Declined'],
];

export default function Substitution({ kpis, rows, filters, risk, reasons, sla, activity, options }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({ retainer: options[0]?.value ?? '', proposed_name: '', proposed_title: '', type: 'Planned', reason: 'Availability', reason_detail: '', effective_from: '' });
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const slaTotal = sla.total || 1;
    const reasonTotal = Object.values(reasons).reduce((s, n) => s + n, 0) || 1;
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(PATH, { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } });
    };

    return (
        <AdminShell
            title="Substitution and Continuity Console"
            description="Manage adviser substitutions, ensure continuity of service and maintain client confidence."
            actions={
                <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-referenced-500 px-3 text-xs font-semibold text-white">
                    <Plus className="size-4" aria-hidden="true" /> New Substitution
                </button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Briefcase} label="Active Retainers" value={kpis.active} />
                <StatTile icon={Shuffle} tone="info" label="Substitutions" value={kpis.total} caption="Register to date" />
                <StatTile icon={BellRing} tone="gold" label="Pending Client Notice" value={kpis.pending} caption="Action required" />
                <StatTile icon={CheckCircle2} tone="good" label="Approved Substitutions" value={kpis.approved} caption={`${kpis.approved_pct}% approved`} />
                <StatTile icon={XCircle} tone="bad" label="Client Declined" value={kpis.declined} caption={`${kpis.declined_pct}% declined`} />
                <StatTile icon={ShieldAlert} tone="bad" label="Continuity Risk (High)" value={kpis.high} caption="Requires attention" />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All' }, ...STATUS.map(([value, label]) => ({ value, label }))]} />
                <MiniSelect label="Substitution Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ value: '', label: 'All' }, { value: 'Planned', label: 'Planned' }, { value: 'Emergency', label: 'Emergency' }]} />
                <MiniSelect label="Risk Level" value={filters.risk} onChange={(v) => set('risk', v)} options={[{ value: '', label: 'All' }, ...['High', 'Medium', 'Low'].map((r) => ({ value: r, label: r }))]} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
                <Panel title="Substitution Register">
                    <SimpleTable
                        columns={['ID', 'Retainer Code', 'Client', 'Current Adviser', 'Proposed Adviser', 'Substitution Type', 'Reason', 'Requested On', 'Status', 'Risk Level', 'Client Note / Actions']}
                        rows={rows.map((s) => [
                            <span className="font-mono text-xs font-semibold">{s.reference}</span>,
                            s.retainer,
                            s.client,
                            s.from,
                            s.to,
                            s.type,
                            s.reason,
                            fmtDate(s.requested),
                            <StatusPill status={STATUS.find(([k]) => k === s.status)?.[1] ?? s.status} />,
                            <StatusPill status={s.risk} tone={s.risk === 'High' ? 'bad' : s.risk === 'Medium' ? 'warn' : 'good'} />,
                            s.status === 'pending_notice' ? (
                                <ActionButton href={`${PATH}/${s.id}/notice`} tone="gold">
                                    Issue Client Notice
                                </ActionButton>
                            ) : (
                                <span className="text-xs text-ink-500">{s.note ?? (s.status === 'awaiting_approval' ? 'Awaiting client response' : '—')}</span>
                            ),
                        ])}
                        empty="No substitutions match these filters."
                    />
                </Panel>

                <div className="space-y-5">
                    <Panel title="Continuity Risk Overview">
                        <div className="flex flex-col items-center gap-3">
                            <Donut size={130} centre={kpis.total} sub="Total" segments={[{ value: risk.High ?? 0, color: C.red }, { value: risk.Medium ?? 0, color: C.amber }, { value: risk.Low ?? 0, color: C.green }]} />
                            <Legend items={[{ color: C.red, label: 'High Risk', value: risk.High ?? 0 }, { color: C.amber, label: 'Medium Risk', value: risk.Medium ?? 0 }, { color: C.green, label: 'Low Risk', value: risk.Low ?? 0 }]} />
                        </div>
                    </Panel>
                    <Panel title="Substitution Reasons">
                        <div className="space-y-2">
                            {Object.entries(reasons).map(([r, n]) => (
                                <BarRow key={r} label={r} value={n} max={reasonTotal} />
                            ))}
                        </div>
                    </Panel>
                    <Panel title="SLA / Notice Compliance">
                        <div className="space-y-2">
                            <BarRow label="Notice sent" value={sla.sent} max={slaTotal} tone="good" />
                            <BarRow label="Awaiting client response" value={sla.awaiting} max={slaTotal} tone="gold" />
                            <BarRow label="Overdue notices" value={sla.overdue} max={slaTotal} tone="bad" />
                        </div>
                    </Panel>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <Panel title="Notification Workflow">
                    <ol className="space-y-2 text-xs">
                        {[
                            ['Request Initiated', 'Substitution requested by Retainer Manager.'],
                            ['Client Notice', 'Client notified with details of proposed change.'],
                            ['Client Response', 'Client approves, declines or requests more info.'],
                            ['Implementation', 'Change implemented and records updated.'],
                        ].map(([t, b], i) => (
                            <li key={t} className="flex gap-2">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-referenced-500 text-[0.625rem] font-bold text-white">{i + 1}</span>
                                <span>
                                    <span className="font-semibold text-ink-900">{t}</span> — {b}
                                </span>
                            </li>
                        ))}
                    </ol>
                </Panel>
                <Panel title="Continuity Assurance Checklist">
                    <CheckList items={['Knowledge transfer completed', 'Open items and commitments reviewed', 'Client informed with rationale', 'Handover documentation updated', 'Quality and SLA impact assessed']} />
                </Panel>
                <Panel title="Recent Activity">
                    <ul className="space-y-2 text-xs">
                        {activity.map((a, i) => (
                            <li key={i}>
                                <span className="text-ink-400">{fmtDate(a.at)}</span> {a.summary}
                            </li>
                        ))}
                        {activity.length === 0 && <li className="text-ink-500">No substitution activity yet.</li>}
                    </ul>
                </Panel>
            </div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="New Substitution"
                size="lg"
                footer={
                    <button type="submit" form="sub-form" disabled={form.processing} className="h-9 rounded-[4px] bg-referenced-500 px-4 text-sm font-semibold text-white disabled:opacity-50">
                        Create Substitution
                    </button>
                }
            >
                <form id="sub-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                    <Field label="Retainer" error={form.errors.retainer} required className="sm:col-span-2">
                        {(id) => <Select id={id} value={form.data.retainer} onChange={(e) => form.setData('retainer', e.target.value)} options={options} />}
                    </Field>
                    <Field label="Proposed adviser" error={form.errors.proposed_name} required>
                        {(id) => <Input id={id} value={form.data.proposed_name} onChange={(e) => form.setData('proposed_name', e.target.value)} />}
                    </Field>
                    <Field label="Proposed adviser title" error={form.errors.proposed_title}>
                        {(id) => <Input id={id} value={form.data.proposed_title} onChange={(e) => form.setData('proposed_title', e.target.value)} />}
                    </Field>
                    <Field label="Type" error={form.errors.type} required>
                        {(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={['Planned', 'Emergency']} />}
                    </Field>
                    <Field label="Reason" error={form.errors.reason} required>
                        {(id) => <Select id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} options={['Availability', 'Resource reallocation', 'Adviser unavailable', 'Skill requirement', 'Medical leave', 'Resignation', 'Capacity balance', 'Conflict of interest']} />}
                    </Field>
                    <Field label="Effective from" error={form.errors.effective_from} required>
                        {(id) => <Input id={id} type="date" value={form.data.effective_from} onChange={(e) => form.setData('effective_from', e.target.value)} />}
                    </Field>
                    <Field label="Detail for the client notice" error={form.errors.reason_detail} className="sm:col-span-2">
                        {(id) => <Textarea id={id} value={form.data.reason_detail} onChange={(e) => form.setData('reason_detail', e.target.value)} />}
                    </Field>
                </form>
            </Modal>
        </AdminShell>
    );
}

Substitution.layout = null;
