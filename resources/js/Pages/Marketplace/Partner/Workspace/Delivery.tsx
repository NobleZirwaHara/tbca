import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CircleCheck, Clock, FileText, Info, Lock, Upload } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Progress, StatusPill, Stepper, Tabs } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, CodeChip, InfoRows } from '@/Components/Marketplace/ui';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Delivery({ request: r }: { request: MkPartnerRequest }) {
    const dv = r.meta.delivery ?? {};
    const open = r.stage === 'delivery';
    const [tab, setTab] = useState('workspace');
    const up = useForm({ action: 'upload', file_name: '' });
    const prog = useForm({ action: 'progress', milestone: dv.milestone ?? '', progress: dv.progress ?? 0, comment: dv.comment ?? '', internal: dv.internal ?? '' });
    const time = useForm({ action: 'time', hours: '' });
    const url = `/partner-services/workspace/opportunities/${r.reference}/delivery`;
    const files = (dv.files ?? []) as { name: string; type: string; version: string; uploaded: string; status: string }[];
    const qa = Object.entries((dv.qa ?? {}) as Record<string, string>);
    const activity = ((dv.activity ?? []) as { at: string; body: string }[]).slice().reverse();

    return (
        <PartnerShell crumbs={[{ label: 'Partner Dashboard', href: '/partner-services/workspace' }, { label: `Opportunity ${r.reference}` }, { label: 'Delivery & QA Interface' }]}
            title={<span className="flex items-center gap-3">Delivery &amp; QA Interface <CodeChip code="PS-022" /></span>} description="Deliver your professional work within the controlled environment. Submit for QA and obtain sign-off for release."
            actions={<div className="text-right text-xs text-ink-500">Opportunity Reference<p className="font-serif text-xl font-bold text-ink-900">{r.reference}</p><StatusPill status={r.stageLabel} /></div>}>
            <Head title={`Delivery & QA – ${r.reference}`} />
            <div className="mb-5 max-w-3xl"><Stepper steps={['Opportunity & Conflict', 'Scope & Quote', 'Delivery & QA', 'Client Sign-off', 'Completion']} current={r.stage === 'delivery' ? 3 : r.stage === 'qa_review' ? 4 : 6} /></div>
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <Tabs value={tab} onChange={setTab} tabs={[{ key: 'workspace', label: 'Delivery Workspace' }, { key: 'qa', label: 'QA Review' }, { key: 'signoffs', label: 'Sign-offs' }, { key: 'audit', label: 'Audit Trail' }]} />
                    <p className="flex items-center gap-2 rounded bg-controlled-50 px-3 py-2 text-xs text-controlled-700"><Info className="size-4" aria-hidden="true" />All work must be limited to the agreed scope. Do not provide advice beyond the authorised mandate.</p>
                    {tab === 'workspace' && (
                        <div className="grid gap-5 md:grid-cols-2">
                            <Card title="A. Document & Work Packet">
                                {open && (
                                    <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); up.post(url, { preserveScroll: true, onSuccess: () => up.reset('file_name') }); }}>
                                        <Input aria-label="Document file name" placeholder="Draft_EIA_Report_v1.0.pdf" value={up.data.file_name} onChange={(e) => up.setData('file_name', e.target.value)} aria-invalid={!!up.errors.file_name} />
                                        <Button type="submit" size="sm" disabled={up.processing}><Upload className="size-4" aria-hidden="true" />Upload</Button>
                                    </form>
                                )}
                                {up.errors.file_name && <p role="alert" className="mb-2 text-xs text-risk-500">{up.errors.file_name}</p>}
                                <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Name', 'Type', 'Version', 'Uploaded', 'Status'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{files.length === 0 && <tr><td colSpan={5} className="py-3 text-center text-ink-400">No documents yet.</td></tr>}{files.map((f) => <tr key={f.name}><td className="py-1.5"><FileText className="mr-1 inline size-3.5" aria-hidden="true" />{f.name}</td><td>{f.type}</td><td>{f.version}</td><td>{f.uploaded}</td><td><StatusPill status={f.status} /></td></tr>)}</tbody></table>
                            </Card>
                            <Card title="B. Delivery Progress">
                                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); prog.post(url, { preserveScroll: true }); }}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Milestone" error={prog.errors.milestone}>{(id) => <Select id={id} disabled={!open} value={prog.data.milestone} options={['Inception & Data Request', 'Scoping Report', 'Draft EIA Report', 'Final Report', 'Regulatory Submission']} placeholder="Select" onChange={(e) => prog.setData('milestone', e.target.value)} />}</Field>
                                        <Field label="% Complete" error={prog.errors.progress}>{(id) => <Input id={id} type="number" min={0} max={100} disabled={!open} value={prog.data.progress} onChange={(e) => prog.setData('progress', Number(e.target.value))} />}</Field>
                                    </div>
                                    <Progress value={Number(prog.data.progress)} />
                                    <Field label="Comments / Update (visible to client)">{(id) => <Textarea id={id} maxLength={1000} disabled={!open} value={prog.data.comment} onChange={(e) => prog.setData('comment', e.target.value)} />}</Field>
                                    <Field label="Internal Notes (firm only)">{(id) => <Textarea id={id} maxLength={1000} disabled={!open} value={prog.data.internal} onChange={(e) => prog.setData('internal', e.target.value)} />}</Field>
                                    {open && <Button type="submit" size="sm" variant="outline" disabled={prog.processing}>Save Progress</Button>}
                                </form>
                                <div className="mt-4 border-t border-parchment-300 pt-3">
                                    <p className="text-xs font-semibold">Time Tracking (P Component)</p>
                                    <div className="mt-1 grid grid-cols-3 text-sm"><span>Logged<br /><strong>{(dv.hours_logged ?? 0).toFixed(2)}</strong></span><span>Remaining<br /><strong>{Math.max(0, (dv.hours_total ?? 0) - (dv.hours_logged ?? 0)).toFixed(2)}</strong></span><span>Total Estimated<br /><strong>{(dv.hours_total ?? 0).toFixed(2)}</strong></span></div>
                                    {open && <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); time.post(url, { preserveScroll: true, onSuccess: () => time.reset('hours') }); }}><Input aria-label="Hours" type="number" step="0.25" min={0.25} placeholder="Hours" value={time.data.hours} onChange={(e) => time.setData('hours', e.target.value)} className="w-28" /><Button type="submit" size="sm" variant="outline"><Clock className="size-4" aria-hidden="true" />Log Time</Button></form>}
                                </div>
                            </Card>
                        </div>
                    )}
                    {tab === 'qa' && <Card title="QA Checklist (TBCA)"><ul className="space-y-2 text-sm">{qa.map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><StatusPill status={v} /></li>)}</ul></Card>}
                    {tab === 'signoffs' && <Card title="Sign-offs"><InfoRows rows={[['Partner professional sign-off', r.stage !== 'delivery' ? 'Submitted' : 'Pending'], ['TBCA QA sign-off', r.stage === 'qa_review' || r.stage === 'completed' ? 'Completed' : 'Pending'], ['Client sign-off', r.stage === 'completed' ? 'Completed' : 'Pending']]} /></Card>}
                    {tab === 'audit' && <Card title="Audit Trail"><ol className="space-y-2 text-sm">{((r.meta.history ?? []) as { at: string; title: string; body: string }[]).map((h, i) => <li key={i}><span className="text-xs text-ink-400">{h.at}</span> · <strong>{h.title}</strong> {h.body}</li>)}</ol></Card>}
                    <Card title="C. Activity Feed"><ul className="space-y-1.5 text-xs">{activity.slice(0, 8).map((a, i) => <li key={i} className="flex justify-between gap-3"><span>{a.body}</span><span className="text-ink-400">{a.at}</span></li>)}</ul></Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Matter Summary"><InfoRows dense rows={[['Client', r.clientName], ['Profession', r.resolution.profession], ['Service', r.title], ['Jurisdiction', r.intake.jurisdiction], ['Arrangement', r.arrangement], ['Fee Mechanism', r.feeMechanism]]} /></Card>
                    <Card title="QA Checklist (TBCA)"><ul className="space-y-1.5 text-sm">{qa.map(([k, v]) => <li key={k} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5">{v === 'Completed' ? <CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> : <Clock className="size-4 text-attested-500" aria-hidden="true" />}{k}</span><span className="text-xs">{v}</span></li>)}</ul></Card>
                    <Card tone="blue" title="Important Reminders"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-700"><li>Work only within the agreed scope of services.</li><li>All outputs are subject to TBCA QA and partner professional sign-off.</li><li>Do not share client information outside authorised team members.</li><li>Record all material correspondence and decisions in the workspace.</li></ul></Card>
                </aside>
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
                <Link href="/partner-services/workspace" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to Opportunity</Link>
                {open && <div className="text-center"><Button type="button" disabled={files.length === 0} onClick={() => router.post(url, { action: 'submit' }, { preserveScroll: true })} trailingIcon="arrow-right">Submit for QA Review</Button><p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Client Sign-off (Unlocked after QA sign-off)</p></div>}
            </div>
        </PartnerShell>
    );
}

Delivery.layout = null;
