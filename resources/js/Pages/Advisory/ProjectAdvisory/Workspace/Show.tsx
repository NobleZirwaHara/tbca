import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Activity, Building2, CalendarDays, ClipboardCheck, FileText, FolderOpen, Gauge, MessageSquare, PauseCircle, PlayCircle, Upload } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import PaGateModal, { type PaGateDetail } from '@/Components/Advisory/PaGateModal';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, LedgerBadge, Notice, PageTitle, StatusDot, zar } from '@/Components/Advisory/ui';
import type { LedgerSummary, MandateEventRow, MandateView } from '@/types/advisory';

interface Props { mandate: MandateView; events: MandateEventRow[]; ledgers: Record<string, LedgerSummary>; gateDetail: PaGateDetail | null; openGate: boolean }

export default function Show({ mandate: m, events, ledgers, gateDetail, openGate }: Props) {
    const [gateOpen, setGateOpen] = useState(openGate && gateDetail !== null);
    const ev = m.meta.evidence_requests ?? [];
    const approvals = [
        ['Method Card', m.method_approved ? 'Approved' : 'Pending', m.method_card_ref ?? '—', m.method_approved],
        ['NDA', m.nda_signed ? 'Signed' : 'Pending', 'NDA v2.0', m.nda_signed],
        ['Engagement Letter', m.letter_signed ? 'Signed' : 'Pending', 'EL-v2.3', m.letter_signed],
        ['Mandate Letter', m.mandate_signed ? 'Signed' : 'Pending', m.deposit?.reference ?? '—', m.mandate_signed],
    ];
    const upload = (i: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = () => input.files?.[0] && router.post(`/project-advisory/workspace/${m.reference}/evidence/${i}`, { file: input.files[0] }, { forceFormData: true, preserveScroll: true });
        input.click();
    };
    const ledgerSnap: [string, string, string][] = [
        ['T', 'Next approved amount due', zar(ledgers.T?.next_due ?? 0)],
        ['P', 'Current platform fees due', zar(ledgers.P?.next_due ?? 0)],
        ['X', 'Approved direct-to-provider', zar(ledgers.X?.lines.filter((l) => l.status === 'approved').reduce((s, l) => s + l.expected, 0) ?? 0)],
        ['S', 'Current payable', ledgers.S?.paid ? zar(ledgers.S.paid) : 'No current payable item'],
        ['C', 'Contingent', 'Not triggered'],
    ];
    return (
        <div className="container-tbca py-8">
            <Head title={`Workspace ${m.reference}`} />
            <PageTitle
                crumbs={[{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: `Engagement ${m.reference}` }]}
                title="Project Advisory Workspace"
                sub="Command centre for your active advisory engagement, decisions, evidence and fee position."
                actions={<>
                    <ButtonLink href={`/project-advisory/workspace/${m.reference}/method-card`} variant="outline" size="sm">Review Method</ButtonLink>
                    <ButtonLink href={`/project-advisory/workspace/${m.reference}/ledger`} variant="outline" size="sm">Review Fees</ButtonLink>
                    <Button size="sm" onClick={() => openAskQuestion({ subject: `Question on ${m.reference}`, section: 'advisory' })}>Ask a Question</Button>
                </>}
            />
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-9">
                {[[Building2, 'Organisation', m.organisation], [FileText, 'Engagement ID', m.reference], [Building2, 'Country', m.country], [Activity, 'Sector', m.sector], [ClipboardCheck, 'Current stage', m.stage], [Gauge, 'Current gate', m.pending_gate ? `Gate ${m.pending_gate} under client review` : m.gate ?? '—'], [FileText, 'Current Method Card', m.method_card_ref ?? '—'], [MessageSquare, 'Next client decision', m.next.who === 'Client' ? m.next.label : m.meta.next_client ?? '—'], [CalendarDays, 'Next TBCA action', m.meta.next_tbca ?? (m.next.who === 'TBCA' ? m.next.label : '—')]].map(([I, k, v]) => {
                    const Icon = I as typeof Building2;
                    return <div key={k as string} className="rounded-[6px] border border-parchment-400 bg-white p-2.5"><p className="flex items-center gap-1 text-[0.625rem] text-ink-500"><Icon className="size-3" />{k as string}</p><p className="text-xs font-semibold text-ink-900">{v as string}</p></div>;
                })}
            </div>
            <PaWorkspaceNav reference={m.reference} lifecycle={m.lifecycle} />
            {m.stop_blocks.length > 0 && <Notice tone="bad" className="mb-4">Stop-Now active: {m.stop_blocks.map((b) => `${b.code} ${b.message}`).join(' ')}</Notice>}
            <Notice tone={m.next.who === 'Client' ? 'warn' : 'info'} className="mb-4">
                <span className="flex-1"><b>Next action ({m.next.who}):</b> {m.next.label}</span>
                {m.next.href && (gateDetail && m.next.href.includes('?gate') ? <button type="button" className="font-semibold underline" onClick={() => setGateOpen(true)}>Review gate</button> : <Link href={m.next.href} className="font-semibold underline">Continue →</Link>)}
            </Notice>
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Current Deliverables" icon="clipboard-list">
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {(m.meta.deliverables ?? []).map((d) => <li key={d.ref} className="grid grid-cols-3 gap-2 py-2"><span><b className="block">{d.name}</b><span className="font-mono text-ink-500">{d.ref}</span></span><span>Due: {d.due}<br /><StatusPill status={d.status} /></span><span className="text-right">Owner<br />{d.owner}</span></li>)}
                                {(m.meta.deliverables ?? []).length === 0 && <li className="py-2 text-ink-500">Deliverables appear once paid work begins.</li>}
                            </ul>
                        </Card>
                        <Card title="Evidence Requests" icon="folder-open">
                            <table className="w-full text-xs">
                                <thead className="text-ink-500"><tr><th className="text-left">Requested Item</th><th>Status</th><th>Required By</th><th>Secure Upload</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {ev.map((r, i) => <tr key={r.item}><td className="py-1.5">{r.item}</td><td className="text-center"><StatusPill status={r.status} /></td><td className="text-center">{r.required_by}</td><td className="text-center">{['Submitted', 'Accepted'].includes(r.status) ? <span className="text-verified-700">Uploaded</span> : <button type="button" onClick={() => upload(i)} className="inline-flex items-center gap-1 text-controlled-700 underline"><Upload className="size-3" />Upload</button>}</td></tr>)}
                                </tbody>
                            </table>
                            {ev.length === 0 && <p className="text-xs text-ink-500">No evidence requested yet.</p>}
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Current Approvals" icon="badge-check">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {approvals.map(([t, s, r, d]) => <div key={t as string} className="rounded border border-parchment-400 p-2 text-[0.6875rem]"><StatusDot state={d ? 'ok' : 'warn'} /><p className="mt-1 font-semibold">{t} {s}</p><p className="text-ink-500">{r}</p><p className="text-ink-500">{(d as string) ?? 'Awaiting'}</p></div>)}
                            </div>
                        </Card>
                        <Card title="Upcoming Milestones" icon="calendar-days">
                            <ul className="space-y-1.5 text-xs">{(m.meta.milestones ?? []).map((x) => <li key={x.name} className="flex justify-between gap-2"><span className="w-20 shrink-0 text-ink-500">{x.date}</span><span className="flex-1">{x.name}</span><span className="text-ink-500">Depends on: {x.depends}</span></li>)}</ul>
                            {(m.meta.milestones ?? []).length === 0 && <p className="text-xs text-ink-500">Milestones are set once the Method Card is approved.</p>}
                        </Card>
                    </div>
                    <Card title="Gate Register (G0–G10)" icon="shield-check">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                            {m.gates.map((g) => <div key={g.code} className="rounded border border-parchment-400 p-2 text-[0.6875rem]"><p className="font-semibold">{g.code} {g.name}</p><StatusPill status={g.status} />{g.decided && <p className="text-ink-500">{g.decided}</p>}</div>)}
                        </div>
                        {gateDetail && <Button className="mt-3" onClick={() => setGateOpen(true)}>Review Gate {gateDetail.code}</Button>}
                    </Card>
                    <Card title="Quick Actions">
                        <div className="flex flex-wrap gap-2">
                            <ButtonLink size="sm" variant="outline" href={`/project-advisory/workspace/${m.reference}/method-card`}>Review Method</ButtonLink>
                            <ButtonLink size="sm" variant="outline" href={`/project-advisory/workspace/${m.reference}/ledger`}>Review Fees</ButtonLink>
                            <ButtonLink size="sm" variant="outline" href={`/project-advisory/workspace/${m.reference}/settlement`}>Settlement Centre</ButtonLink>
                            <ButtonLink size="sm" variant="outline" href={`/project-advisory/workspace/${m.reference}/fee-meter`}>Live Fee Meter</ButtonLink>
                            {m.status === 'paused' ? (
                                <Button size="sm" variant="outline" onClick={() => router.post(`/project-advisory/workspace/${m.reference}/stop`, { action: 'resume' }, { preserveScroll: true })}><PlayCircle className="size-4" />Resume</Button>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => confirm('Pause this engagement at the current boundary? Unapproved future phases will not become due.') && router.post(`/project-advisory/workspace/${m.reference}/stop`, { action: 'pause' }, { preserveScroll: true })}><PauseCircle className="size-4 text-risk-500" />Stop / Pause</Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => window.print()}>Export Work Product</Button>
                        </div>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Live Fee Snapshot (ZAR)" action={<Link href={`/project-advisory/workspace/${m.reference}/fee-meter`} className="text-xs underline">View details</Link>}>
                        <ul className="space-y-2">{ledgerSnap.map(([l, k, v]) => <li key={l} className="flex items-center gap-2 text-xs"><LedgerBadge l={l} size="sm" /><span className="flex-1 text-ink-500">{k}</span><b>{v}</b></li>)}</ul>
                    </Card>
                    <Card title="Current Stop Position (If I stop now)">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><p className="text-ink-500">Earned to date (T)</p><p className="text-lg font-bold">{zar(ledgers.T?.earned ?? 0)}</p></div>
                            <div><p className="text-ink-500">Refund / Credit</p><p className="text-lg font-bold text-verified-700">{zar(Object.values(ledgers).reduce((s, l) => s + l.creditable, 0))}</p></div>
                        </div>
                        <Link href={`/project-advisory/workspace/${m.reference}/ledger`} className="mt-2 block text-xs underline">See stop package</Link>
                    </Card>
                    <Card title="VDR Status" action={<StatusPill status="active" />}>
                        <ul className="space-y-1 text-xs"><li className="flex justify-between"><span><FolderOpen className="mr-1 inline size-3" />Folders provisioned</span><b>{m.meta.vdr?.folders ?? 0}</b></li><li className="flex justify-between"><span>Files uploaded</span><b>{m.meta.vdr?.files ?? ev.filter((e) => e.status === 'Submitted').length}</b></li><li className="flex justify-between"><span>Human review required</span><b>{m.meta.vdr?.review ?? 0} items</b></li></ul>
                        {!m.nda_signed && <p className="mt-2 text-xs text-risk-700">Locked until the NDA gate is completed.</p>}
                    </Card>
                    <Card title="Human Lead & Senior Reviewer">
                        <div className="grid grid-cols-2 gap-2 text-xs"><div><b>{m.lead ?? 'To be assigned'}</b><p className="text-ink-500">Engagement Lead</p></div><div><b>{m.reviewer ?? 'To be assigned'}</b><p className="text-ink-500">Senior Reviewer</p></div></div>
                    </Card>
                    <Card title="Permission & Capacity Status">
                        <ul className="space-y-1 text-xs">
                            <li className="flex justify-between">Authority validated <StatusPill status={m.letter_signed ? 'cleared' : 'pending'} /></li>
                            <li className="flex justify-between">NDA complete <StatusPill status={m.nda_signed ? 'cleared' : 'pending'} /></li>
                            <li className="flex justify-between">External study authority <StatusPill status={m.gates.find((g) => g.code === 'G3')?.status === 'approved' ? 'cleared' : 'pending'} /></li>
                            <li className="flex justify-between">Assigned team <StatusPill status="available" tone="good" /></li>
                        </ul>
                    </Card>
                    <Card title="Activity Feed">
                        <ul className="space-y-1.5 text-xs">{events.map((e, i) => <li key={i} className="flex justify-between gap-2"><span>{e.event}{e.ref && <span className="font-mono text-ink-400"> {e.ref}</span>}</span><span className="shrink-0 text-ink-400">{e.actor} · {e.ago}</span></li>)}</ul>
                    </Card>
                </aside>
            </div>
            {gateDetail && <PaGateModal open={gateOpen} onClose={() => setGateOpen(false)} gate={gateDetail} mandate={m} />}
        </div>
    );
}
