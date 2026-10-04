import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, Lock, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Modal, Progress, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows, Notice, StageTrack } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { MkProvider, RegisterNav } from '@/types/marketplace';

interface Check { area: string; description: string; status: string; evidence: string | null; note: string | null }
interface Props {
    nav: RegisterNav;
    provider: MkProvider;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    application: Record<string, any>;
    vetting: { stage?: string; checklist: Check[]; activity?: { at: string; body: string }[]; decision?: string; target?: string; reviewer?: string };
}

const STAGES = ['Initial Screen', 'Document Review', 'Reference Check', 'Risk Assessment', 'Decision'];

export default function Vetting({ nav, provider: p, application, vetting }: Props) {
    const checks = vetting.checklist;
    const done = checks.filter((c) => c.status === 'verified').length;
    const allDone = done === checks.length;
    const decided = !['applied', 'verification', 'action_required'].includes(p.status);
    const [edit, setEdit] = useState<number | null>(null);
    const [row, setRow] = useState({ status: 'verified', note: '', evidence: '' });
    const [decision, setDecision] = useState('');
    const stageIdx = Math.max(1, STAGES.indexOf(vetting.stage ?? 'Document Review') + 1);
    const pending = (k: string) => checks.filter((c) => c.status !== 'verified').some((c) => c.area.includes(k));

    const save = () => edit !== null && router.post(`/admin/marketplace/providers/${p.slug}/vetting`, { index: edit, ...row }, { preserveScroll: true, onSuccess: () => setEdit(null) });

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Provider Applications', href: '/admin/marketplace/providers' }, { label: p.applicationRef ?? p.code }, { label: 'Vetting & Verification' }]}
            title="Provider Vetting & Verification" description="Comprehensive due diligence to ensure quality, capability and compliance.">
            <Head title={`Vetting – ${p.name}`} />
            <div className="mb-5 max-w-3xl"><StageTrack stages={STAGES} current={decided ? 6 : stageIdx} /></div>
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <Card>
                        <div className="flex flex-wrap items-start gap-5">
                            <span className="flex size-16 items-center justify-center rounded-[8px] bg-ink-950 font-serif text-3xl font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-xl font-bold">{p.name}</h2><span className="rounded bg-controlled-50 px-2 py-0.5 text-xs text-controlled-700">Application ID: {p.applicationRef}</span></div>
                                <p className="text-sm text-ink-600">Services Applied For: {(application.services_applied ?? application.services ?? []).join(', ')}</p>
                            </div>
                            <InfoRows dense className="min-w-56" rows={[['Application Date', application.submitted ?? '—'], ['Business Type', application.business_type ?? '—'], ['Country of Operation', p.country], ['Current Status', <StatusPill key="s" status={p.statusLabel} />], ['Assigned To', vetting.reviewer ?? 'TBCA Vetting Team']]} />
                        </div>
                    </Card>
                    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                        <Card title="Vetting Checklist">
                            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs">
                                <thead className="text-ink-500"><tr>{['#', 'Area', 'Description', 'Status', 'Evidence', 'Reviewer Notes'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{checks.map((c, i) => <tr key={c.area}><td className="py-2">{i + 1}</td><td className="py-2 font-semibold">{c.area}</td><td className="py-2 text-ink-600">{c.description}</td><td className="py-2"><StatusPill status={c.status} /></td><td className="py-2 text-controlled-600">{c.evidence ?? '—'}</td><td className="py-2"><button type="button" disabled={decided} onClick={() => { setEdit(i); setRow({ status: c.status === 'verified' ? 'verified' : 'verified', note: c.note ?? '', evidence: c.evidence ?? '' }); }} className="rounded border border-parchment-500 px-2 py-0.5 hover:border-gold-500 disabled:opacity-40">{c.note ? 'View' : 'Update'}</button></td></tr>)}</tbody>
                            </table></div>
                        </Card>
                        <Card title="Preliminary Risk Assessment">
                            <InfoRows dense rows={[['Risk Category', `${p.categoryLabel} Services`], ['Inherent Risk', <StatusPill key="i" status="Medium" tone="warn" />], ['Residual Risk (Preliminary)', <StatusPill key="r" status={allDone ? 'Low' : 'Medium'} tone={allDone ? 'good' : 'warn'} />]]} />
                            <p className="mt-3 text-xs font-semibold">Risk Factors</p>
                            <ul className="mt-1 space-y-1 text-xs">{[['Business registration', !pending('Business')], ['Financial statements verified', !pending('Financial')], ['No adverse findings in sanctions check', !pending('Sanctions')], ['Insurance document provided', !pending('Insurance')], ['Tax compliance verified', !pending('Tax')]].map(([k, ok]) => <li key={k as string} className="flex gap-1.5">{ok ? <CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> : <TriangleAlert className="size-4 text-attested-500" aria-hidden="true" />}{k as string}{ok ? '' : ' – pending'}</li>)}</ul>
                            <p className="mt-3 text-xs font-semibold">Recommendation</p><p className="text-xs text-ink-600">{allDone ? 'All checks verified. Proceed to decision.' : 'Proceed to reference checks and risk assessment.'}</p>
                        </Card>
                    </div>
                    <Card title={<span>Vetting Decision <span className="text-xs font-normal normal-case text-ink-500">(Locked until all checks complete)</span></span>}>
                        {decided ? <Notice tone="good">Decision recorded: <strong>{vetting.decision ?? p.statusLabel}</strong>. Provider status is now {p.statusLabel}.</Notice> : (
                            <>
                                <div role="radiogroup" className="grid gap-2 md:grid-cols-3">
                                    {[['approve', 'Approve & Onboard', 'Provider meets TBCA standards and can be onboarded.', 'text-verified-700'], ['conditions', 'Approve with Conditions', 'Provider approved subject to specific conditions.', 'text-attested-700'], ['decline', 'Decline', 'Provider does not meet TBCA standards.', 'text-risk-600']].map(([k, t, b, c]) => (
                                        <button key={k} type="button" role="radio" aria-checked={decision === k} disabled={!allDone && k !== 'decline'} onClick={() => setDecision(k)} className={cn('rounded-[6px] border p-3 text-left disabled:opacity-40', decision === k ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}><span className={`block text-sm font-semibold ${c}`}>{t}</span><span className="text-xs text-ink-500">{b}</span></button>
                                    ))}
                                </div>
                                <Button type="button" className="mt-3" disabled={!decision} onClick={() => router.post(`/admin/marketplace/providers/${p.slug}/status`, { action: decision }, { preserveScroll: true })}><Lock className="size-4" aria-hidden="true" />Lock Decision</Button>
                                {!allDone && <p className="mt-2 text-xs text-ink-500">{checks.length - done} check(s) outstanding — approval stays locked until all are verified.</p>}
                            </>
                        )}
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Vetting Summary">
                        <p className="flex justify-between text-sm"><span>Overall Progress</span><span>{Math.round((done / checks.length) * 100)}%</span></p><Progress value={(done / checks.length) * 100} className="mt-1" />
                        <InfoRows dense className="mt-3" rows={[['Vetting Stage', vetting.stage], ['Risk Rating (Preliminary)', 'Medium'], ['Target Decision Date', vetting.target ?? '—'], ['Reviewer', vetting.reviewer ?? 'TBCA Vetting Team']]} />
                    </Card>
                    <Card title="Important Notes"><p className="text-xs text-ink-600">All checks must be completed and evidence retained before a decision can be made.</p></Card>
                    <Card title="Activity Log"><ul className="space-y-2 text-xs">{(vetting.activity ?? []).slice().reverse().slice(0, 8).map((a, i) => <li key={i}><span className="text-ink-400">{a.at}</span><p>{a.body}</p></li>)}</ul></Card>
                    <Link href="/admin/marketplace/providers" className="block text-sm font-semibold text-gold-700">← Back to Applications</Link>
                </aside>
            </div>
            <Modal open={edit !== null} onClose={() => setEdit(null)} title={edit !== null ? checks[edit].area : ''} footer={<><Button size="sm" variant="outline" type="button" onClick={() => setEdit(null)}>Cancel</Button><Button size="sm" type="button" onClick={save}>Save</Button></>}>
                <div className="space-y-3">
                    <Field label="Status">{(id) => <Select id={id} value={row.status} onChange={(e) => setRow({ ...row, status: e.target.value })} options={[{ value: 'pending', label: 'Pending' }, { value: 'in_review', label: 'In Review' }, { value: 'verified', label: 'Verified' }, { value: 'failed', label: 'Failed' }]} />}</Field>
                    <Field label="Evidence file">{(id) => <Input id={id} value={row.evidence} onChange={(e) => setRow({ ...row, evidence: e.target.value })} placeholder="CIPC_Registration.pdf" />}</Field>
                    <Field label="Reviewer note">{(id) => <Input id={id} value={row.note} onChange={(e) => setRow({ ...row, note: e.target.value })} />}</Field>
                </div>
            </Modal>
        </AdminShell>
    );
}

Vetting.layout = null;
