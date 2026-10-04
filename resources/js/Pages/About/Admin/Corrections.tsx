import { router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowRight, Check, CircleX, Eye, FileText, MessageSquarePlus, Plus, RotateCcw, Search, UserPlus } from 'lucide-react';
import { KpiTile, Modal, Panel, StatusPill } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell, { Pager, useFilters, type Paginated } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';

interface Correction {
    id: number;
    code: string;
    title: string;
    platform: string | null;
    submitted_by: string | null;
    submitter_email: string | null;
    status: string;
    priority: string;
    submitted_at: string | null;
    target_publish_at: string | null;
    assigned_to: string | null;
    description: string | null;
    evidence_name: string | null;
    is_public: boolean;
    previous_wording: string | null;
    corrected_position: string | null;
    reason: string | null;
    claim_code: string | null;
    last_verified_at: string | null;
    history: { at: string; by: string; action: string; note: string | null }[];
}
interface Props {
    items: Paginated<Correction>;
    selected: Correction | null;
    kpis: Record<'total' | 'open' | 'in_review' | 'approved' | 'published' | 'rejected', number>;
    pipeline: { key: string; count: number }[];
    filters: Record<string, string | undefined>;
    options: { platforms: string[]; claims: { id: number; label: string }[] };
}

const PIPE = ['submitted', 'triage', 'in_review', 'awaiting_approval', 'approved', 'published', 'closed'];
const priorityTone = (p: string) => (p === 'high' || p === 'critical' ? 'bad' : p === 'medium' ? 'warn' : 'good') as 'bad' | 'warn' | 'good';
const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

export default function Corrections({ items, selected, kpis, pipeline, filters, options }: Props) {
    const apply = useFilters('/admin/about/corrections', filters);
    const [q, setQ] = useState(filters.q ?? '');
    const [creating, setCreating] = useState(false);
    const [modal, setModal] = useState<null | 'assign' | 'note' | 'request_info' | 'advance'>(null);
    const create = useForm({ title: '', platform: '', priority: 'medium', description: '', claim_id: '', target_publish_at: '' });
    const action = useForm({ action: '', assigned_to: '', note: '', is_public: false, previous_wording: '', corrected_position: '', reason: '' });

    const select = (code: string) => router.get('/admin/about/corrections', { ...filters, selected: code }, { preserveState: true, preserveScroll: true, only: ['selected'] });
    const post = (name: string) => {
        if (!selected) return;
        action.transform((d) => ({ ...d, action: name }));
        action.post(`/admin/about/corrections/${selected.id}/action`, { preserveScroll: true, onSuccess: () => { setModal(null); action.reset(); } });
    };
    const quick = (name: string) => selected && router.post(`/admin/about/corrections/${selected.id}/action`, { action: name }, { preserveScroll: true });
    const openAdvance = () => {
        if (!selected) return;
        action.setData({ action: 'advance', assigned_to: '', note: '', is_public: selected.is_public, previous_wording: selected.previous_wording ?? '', corrected_position: selected.corrected_position ?? '', reason: selected.reason ?? '' });
        setModal('advance');
    };
    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        create.post('/admin/about/corrections', { onSuccess: () => { create.reset(); setCreating(false); } });
    };
    const nextStatus = selected ? PIPE[PIPE.indexOf(selected.status) + 1] : undefined;

    return (
        <AdminShell
            crumb="Correction Workflow"
            title="Correction Workflow"
            lead="Identify. Review. Correct. Communicate."
            description="Manage reported errors and content inaccuracies across all platforms with full transparency and accountability. Corrections close only with propagation evidence."
            actions={<Button size="sm" variant="outline" onClick={() => setCreating(true)}><Plus className="size-4" /> Submit a Correction</Button>}
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        <KpiTile label="Total Corrections" value={kpis.total} caption="All time" icon={<FileText className="size-4" />} />
                        <KpiTile label="Open" value={kpis.open} caption="Needs attention" tone="warn" />
                        <KpiTile label="In Review" value={kpis.in_review} caption="Under evaluation" />
                        <KpiTile label="Approved" value={kpis.approved} caption="Approved for update" tone="good" />
                        <KpiTile label="Published" value={kpis.published} caption="Changes live" tone="gold" />
                        <KpiTile label="Rejected" value={kpis.rejected} caption="Not applicable" tone="bad" />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); apply({ q, page: undefined }); }} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-3 xl:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
                        <label className="relative"><span className="sr-only">Search corrections</span><Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, title, reporter..." className="pl-9" /></label>
                        <Select aria-label="Status" placeholder="All statuses" options={[...PIPE, 'rejected'].map((v) => ({ value: v, label: v.replace('_', ' ') }))} value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value, page: undefined })} />
                        <Select aria-label="Platform" placeholder="All platforms" options={options.platforms} value={filters.platform ?? ''} onChange={(e) => apply({ platform: e.target.value, page: undefined })} />
                        <Select aria-label="Priority" placeholder="All priorities" options={['low', 'medium', 'high', 'critical']} value={filters.priority ?? ''} onChange={(e) => apply({ priority: e.target.value, page: undefined })} />
                        <Input type="date" aria-label="Submitted from" value={filters.from ?? ''} onChange={(e) => apply({ from: e.target.value, page: undefined })} />
                        <button type="button" onClick={() => router.get('/admin/about/corrections')} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold"><RotateCcw className="size-3.5" aria-hidden="true" /> Clear</button>
                    </form>
                    <Panel title="Correction Pipeline">
                        <ol className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                            {pipeline.map((p) => (
                                <li key={p.key}>
                                    <button type="button" onClick={() => apply({ status: p.key, page: undefined })} className={cn('w-full rounded-[6px] border p-2 text-center', filters.status === p.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                        <span className="block text-[0.6875rem] text-ink-500 capitalize">{p.key.replace('_', ' ')}</span>
                                        <span className="block text-lg font-bold text-ink-900">{p.count}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </Panel>
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[900px] text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Correction ID', 'Title / Description', 'Platform / Service', 'Submitted By', 'Status', 'Priority', 'Submitted On', 'Target Publish', ''].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {items.data.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-ink-400">No corrections match these filters.</td></tr>}
                                {items.data.map((c) => (
                                    <tr key={c.id} className={cn('cursor-pointer', selected?.id === c.id ? 'bg-gold-50/60' : 'hover:bg-parchment-100')} onClick={() => select(c.code)}>
                                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gold-700">{c.code}</td>
                                        <td className="px-3 py-2.5 text-ink-900">{c.title}</td>
                                        <td className="px-3 py-2.5">{c.platform}</td>
                                        <td className="px-3 py-2.5">{c.submitted_by}</td>
                                        <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                                        <td className="px-3 py-2.5"><StatusPill status={c.priority} tone={priorityTone(c.priority)} /></td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(c.submitted_at)}</td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{c.target_publish_at ? fmtDate(c.target_publish_at) : c.status === 'submitted' ? 'TBD' : '—'}</td>
                                        <td className="px-3 py-2.5"><Eye className="size-4 text-ink-400" aria-label="View details" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={items} noun="corrections" />
                </div>

                <aside className="space-y-4">
                    {selected ? (
                        <Panel title="Correction Details" action={<StatusPill status={selected.status} />}>
                            <p className="font-mono text-sm font-bold text-gold-700">{selected.code}</p>
                            <dl className="mt-3 space-y-2.5 text-[0.8125rem]">
                                <div><dt className="text-xs text-ink-500">Title</dt><dd className="text-ink-900">{selected.title}</dd></div>
                                <div><dt className="text-xs text-ink-500">Platform / Service</dt><dd>{selected.platform}</dd></div>
                                <div><dt className="text-xs text-ink-500">Priority</dt><dd className={cn('font-semibold capitalize', priorityTone(selected.priority) === 'bad' ? 'text-risk-700' : 'text-ink-800')}>{selected.priority}</dd></div>
                                <div><dt className="text-xs text-ink-500">Submitted By</dt><dd>{selected.submitted_by}{selected.submitter_email && <span className="block text-xs text-ink-500">{selected.submitter_email}</span>}</dd></div>
                                <div><dt className="text-xs text-ink-500">Submitted On</dt><dd>{dt(selected.submitted_at)}</dd></div>
                                <div><dt className="text-xs text-ink-500">Target Publish Date</dt><dd>{fmtDate(selected.target_publish_at)}</dd></div>
                                <div><dt className="text-xs text-ink-500">Assigned To</dt><dd>{selected.assigned_to ?? 'Unassigned'}</dd></div>
                                {selected.claim_code && <div><dt className="text-xs text-ink-500">Linked claim</dt><dd className="font-mono text-xs">{selected.claim_code}</dd></div>}
                                <div><dt className="text-xs text-ink-500">Description</dt><dd className="text-ink-700">{selected.description ?? '—'}</dd></div>
                                {selected.corrected_position && <div><dt className="text-xs text-ink-500">Corrected position</dt><dd className="text-ink-700">{selected.corrected_position}</dd></div>}
                                {selected.evidence_name && <div><dt className="text-xs text-ink-500">Attached Evidence</dt><dd className="text-xs">{selected.evidence_name}</dd></div>}
                                <div><dt className="text-xs text-ink-500">Public register</dt><dd>{selected.is_public ? 'Material — listed once published' : 'Internal only'}</dd></div>
                                {selected.last_verified_at && <div><dt className="text-xs text-ink-500">Propagation verified</dt><dd>{fmtDate(selected.last_verified_at)}</dd></div>}
                            </dl>
                            <div className="mt-4 space-y-2">
                                {nextStatus && selected.status !== 'rejected' && (
                                    <Button type="button" className="w-full" onClick={openAdvance}>Move to {nextStatus.replace('_', ' ')} <ArrowRight className="size-4" /></Button>
                                )}
                                {(selected.status === 'published' || selected.status === 'closed') && (
                                    <Button type="button" variant="outline" className="w-full" onClick={() => quick('verify')}><Check className="size-4" /> Verify propagation</Button>
                                )}
                                {selected.status === 'rejected' && <Button type="button" variant="outline" className="w-full" onClick={() => quick('reopen')}>Reopen</Button>}
                            </div>
                            {selected.history.length > 0 && (
                                <details className="mt-4 text-xs">
                                    <summary className="cursor-pointer font-semibold text-ink-700">Audit trail ({selected.history.length})</summary>
                                    <ul className="mt-2 space-y-1.5 border-l-2 border-parchment-400 pl-3">
                                        {selected.history.map((h, i) => <li key={i}><span className="font-semibold capitalize">{h.action}</span> · {h.by} · {dt(h.at)}{h.note && <span className="block text-ink-600">{h.note}</span>}</li>)}
                                    </ul>
                                </details>
                            )}
                        </Panel>
                    ) : (
                        <Panel title="Correction Details"><p className="text-sm text-ink-400">Select a correction.</p></Panel>
                    )}
                    {selected && (
                        <Panel title="Quick Actions">
                            <ul className="space-y-2 text-[0.8125rem]">
                                <li><button type="button" onClick={() => setModal('assign')} className="flex items-center gap-2 hover:text-gold-700"><UserPlus className="size-4" aria-hidden="true" /> Assign to Reviewer</button></li>
                                <li><button type="button" onClick={() => setModal('note')} className="flex items-center gap-2 hover:text-gold-700"><MessageSquarePlus className="size-4" aria-hidden="true" /> Add Internal Note</button></li>
                                <li><button type="button" onClick={() => setModal('request_info')} className="flex items-center gap-2 hover:text-gold-700"><FileText className="size-4" aria-hidden="true" /> Request More Info</button></li>
                                <li><button type="button" onClick={() => quick('escalate')} className="flex items-center gap-2 hover:text-gold-700"><AlertTriangle className="size-4" aria-hidden="true" /> Escalate</button></li>
                                {!['published', 'closed', 'rejected'].includes(selected.status) && <li><button type="button" onClick={() => quick('reject')} className="flex items-center gap-2 text-risk-700"><CircleX className="size-4" aria-hidden="true" /> Reject</button></li>}
                            </ul>
                        </Panel>
                    )}
                </aside>
            </div>

            <Modal open={modal === 'assign' || modal === 'note' || modal === 'request_info'} onClose={() => setModal(null)} title={modal === 'assign' ? 'Assign to reviewer' : modal === 'note' ? 'Add internal note' : 'Request more information'}
                footer={<><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button type="button" disabled={action.processing} onClick={() => modal && post(modal)}>Save</Button></>}>
                {modal === 'assign' ? (
                    <Field label="Reviewer / team" required error={action.errors.assigned_to}>{(id) => <Input id={id} value={action.data.assigned_to} onChange={(e) => action.setData('assigned_to', e.target.value)} placeholder="e.g. Content Team" />}</Field>
                ) : (
                    <Field label={modal === 'note' ? 'Note' : 'Message to the submitter'} required error={action.errors.note}>{(id) => <Textarea id={id} rows={4} value={action.data.note} onChange={(e) => action.setData('note', e.target.value)} />}</Field>
                )}
            </Modal>
            <Modal open={modal === 'advance'} onClose={() => setModal(null)} title={`Move ${selected?.code ?? ''} to ${nextStatus?.replace('_', ' ') ?? ''}`} size="lg"
                footer={<><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button type="button" disabled={action.processing} onClick={() => post('advance')}>Confirm</Button></>}>
                <div className="space-y-3">
                    <Field label="Previous public wording (if safe to publish)">{(id) => <Textarea id={id} rows={2} value={action.data.previous_wording} onChange={(e) => action.setData('previous_wording', e.target.value)} />}</Field>
                    <Field label="Corrected position" hint="Required before approval." error={action.errors.corrected_position}>{(id) => <Textarea id={id} rows={2} value={action.data.corrected_position} onChange={(e) => action.setData('corrected_position', e.target.value)} />}</Field>
                    <Field label="High-level reason">{(id) => <Input id={id} value={action.data.reason} onChange={(e) => action.setData('reason', e.target.value)} />}</Field>
                    <Checkbox label="Material public correction — list on the public Corrections Register once published" checked={action.data.is_public} onChange={(e) => action.setData('is_public', e.target.checked)} />
                    <Field label="Note (optional)">{(id) => <Input id={id} value={action.data.note} onChange={(e) => action.setData('note', e.target.value)} />}</Field>
                </div>
            </Modal>
            <Modal open={creating} onClose={() => setCreating(false)} title="Submit a Correction" size="lg">
                <form onSubmit={submitCreate} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" required error={create.errors.title} className="sm:col-span-2">{(id) => <Input id={id} value={create.data.title} onChange={(e) => create.setData('title', e.target.value)} />}</Field>
                    <Field label="Platform / service" required error={create.errors.platform}>{(id) => <Input id={id} list="platforms" value={create.data.platform} onChange={(e) => create.setData('platform', e.target.value)} />}</Field>
                    <datalist id="platforms">{options.platforms.map((p) => <option key={p} value={p} />)}</datalist>
                    <Field label="Priority" required error={create.errors.priority}>{(id) => <Select id={id} options={['low', 'medium', 'high', 'critical']} value={create.data.priority} onChange={(e) => create.setData('priority', e.target.value)} />}</Field>
                    <Field label="Linked claim (optional)" error={create.errors.claim_id}>{(id) => <Select id={id} placeholder="None" options={options.claims.map((c) => ({ value: String(c.id), label: c.label }))} value={create.data.claim_id} onChange={(e) => create.setData('claim_id', e.target.value)} />}</Field>
                    <Field label="Target publish date" error={create.errors.target_publish_at}>{(id) => <Input id={id} type="date" value={create.data.target_publish_at} onChange={(e) => create.setData('target_publish_at', e.target.value)} />}</Field>
                    <Field label="Description" required error={create.errors.description} className="sm:col-span-2">{(id) => <Textarea id={id} rows={3} value={create.data.description} onChange={(e) => create.setData('description', e.target.value)} />}</Field>
                    <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" disabled={create.processing}>Submit</Button></div>
                </form>
            </Modal>
        </AdminShell>
    );
}
Corrections.layout = null;
