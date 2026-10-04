import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CheckCircle2, Copy, PenLine, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, KV, LedgerBadge, Notice, PageTitle } from '@/Components/Advisory/ui';
import type { LedgerSummary, MandateEventRow, MandateView } from '@/types/advisory';

interface Props { mandate: MandateView; events: MandateEventRow[]; ledgers: Record<string, LedgerSummary>; fingerprint: string }

const BLOCKS: [string, string, string, string, string, string, string][] = [
    ['A', 'Current T/P Fees', 'Current', 'Fees for current work and delivery. Time-based and performance fees.', 'T / P', 'Time & Performance', 'Billable'],
    ['B', 'Future Approval Events', 'Conditional', 'Future approvals that trigger upon delivery of defined milestones.', 'T / P', 'Milestone Triggered', 'Conditional'],
    ['C', 'Metered Usage', 'As-Used', 'Usage-based services billed according to consumption or unit metrics.', 'T / P', 'Metered / Unit', 'Billable'],
    ['D', 'External X', 'Pass-Through', 'External third-party costs pass-through at cost with no markup.', 'X', 'At Cost', 'Pass-Through'],
    ['E', 'Statutory S', 'Pass-Through', 'Regulatory, statutory and compliance fees payable to authorities.', 'S', 'At Cost', 'Pass-Through'],
    ['F', 'Contingent C', 'Inactive', 'Contingent success fees only if active and authorised by client.', 'C', 'Success / Outcome', 'Inactive'],
    ['G', 'Exclusions', 'Defined', 'Items and circumstances explicitly excluded from scope and fees.', '—', '—', 'N/A'],
];

export default function EngagementLetter({ mandate: m, events, fingerprint }: Props) {
    const signed = !!m.letter_signed;
    const form = useForm({ read: false, terms: false, name: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/project-advisory/workspace/${m.reference}/engagement-letter`, { preserveScroll: true });
    };
    const reviewed = 5 + (form.data.read ? 1 : 0) + (form.data.terms ? 1 : 0);
    return (
        <div className="container-tbca py-8">
            <Head title="Engagement Letter Preview & E-Sign" />
            <PageTitle crumbs={[{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: m.project, href: `/project-advisory/workspace/${m.reference}` }, { label: 'Engagement Letter' }]} title="Engagement Letter Preview & E-Sign" sub="Review the current controlled commercial document below. Please review all sections, confirm statements, and e-sign to authorise." />
            <PaWorkspaceNav reference={m.reference} />
            {!m.method_approved && <Notice tone="warn" className="mb-4">The Method Card must be approved before this letter can be signed. <Link href={`/project-advisory/workspace/${m.reference}/method-card`} className="underline">Review Method Card</Link></Notice>}
            <form onSubmit={submit} className="grid gap-4 xl:grid-cols-12">
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Review Completeness"><p className="text-2xl font-bold">{signed ? 100 : Math.round((reviewed / 7) * 100)}%</p><Progress value={signed ? 100 : (reviewed / 7) * 100} tone="good" /><p className="mt-1 text-xs text-verified-700">{signed ? 'Signed' : 'Confirm the statements to complete review'}</p>
                        <ul className="mt-3 space-y-1 text-xs">{['Overview', 'Scope & Method', 'Commercial Terms', 'External & Statutory Costs', 'Contingent Terms', 'Exclusions', 'Approval History', 'Signature Block', 'Version History'].map((s) => <li key={s} className="flex justify-between">{s}<CheckCircle2 className="size-3.5 text-verified-500" /></li>)}</ul>
                    </Card>
                    <Card title="Engagement Summary">
                        <KV rows={[['Project Name', m.project], ['Organisation', m.organisation], ['Engagement ID', m.reference], ['Current Method Card', m.method_card_ref ?? '—'], ['Commercial Fingerprint', <span className="inline-flex items-center gap-1 font-mono">{fingerprint.slice(0, 12)}…<Copy className="size-3" /></span>], ['Document Version', <StatusPill status="EL-v2.3 Current" tone="good" />], ['Authority Status', m.letter_signed ? 'Validated' : 'On signature'], ['Required Signatures', '2 of 2 roles'], ['Payer Allocation', `${m.organisation} (100%)`]]} />
                    </Card>
                </aside>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-6">
                    <div className="flex flex-wrap justify-between gap-2 text-xs"><b className="text-sm">Engagement Letter</b><span>Version: EL-v2.3</span><span className="font-mono">Fingerprint: {fingerprint.slice(0, 16)}</span><span>Authority: <b className="text-verified-700">{signed ? 'Validated' : 'Pending'}</b></span></div>
                    <p className="mt-3 text-xs font-semibold">Commercial Blocks (Seven-Pillar Commercial Architecture)</p>
                    <div className="mt-2 overflow-x-auto">
                        <table className="w-full min-w-[560px] text-[0.6875rem]">
                            <thead className="text-ink-500"><tr><th className="text-left">Block</th><th className="text-left">Description</th><th>Ledger</th><th>Basis</th><th>Status</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{BLOCKS.map(([k, t, tag, d, l, b, s]) => <tr key={k}><td className="py-2 pr-2"><b>{k}. {t}</b><br /><span className="rounded bg-parchment-300 px-1">{tag}</span></td><td className="pr-2">{d}</td><td className="text-center">{l.split(' / ').map((x) => x.length === 1 ? <LedgerBadge key={x} l={x} size="sm" /> : x)}</td><td className="text-center">{b}</td><td className="text-center"><StatusPill status={s} /></td></tr>)}</tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Each block is governed independently. No combined total is presented. Contingent fees are not payable unless active and authorised.</p>
                    <Notice tone="warn" className="mt-3"><TriangleAlert className="size-4" />A changed commercial fingerprint creates a new controlled document version. All changes require authority validation.</Notice>
                    <div className="mt-3 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" size="sm" icon="download" onClick={() => window.print()}>Download PDF</Button><Link href="/services/proposal-request" className="inline-flex h-9 items-center rounded border border-ink-300 px-3 text-xs">Request Change</Link></div>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Engagement Context"><KV rows={[['Workspace', 'Project Advisory'], ['Engagement', m.project], ['Method Card', m.method_card_ref ?? '—'], ['Human Lead', m.lead ?? '—'], ['Senior Reviewer', m.reviewer ?? '—']]} /></Card>
                    <Card title="Approval History (Recent)"><ul className="space-y-1.5 text-xs">{events.slice(0, 4).map((e, i) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" /><span>{e.at} — {e.event}<br /><span className="text-ink-500">{e.actor}</span></span></li>)}</ul></Card>
                    <Card title="Required Signatures (2 of 2)">
                        <ul className="space-y-2 text-xs"><li className="flex justify-between">Client Authorised Signatory<StatusPill status={signed ? 'signed' : 'Ready to Sign'} /></li><li className="flex justify-between">TBCA Engagement Principal<StatusPill status={signed ? 'signed' : 'Ready to Sign'} /></li></ul>
                        {signed ? (
                            <div className="mt-3"><Notice tone="good">Signed {m.letter_signed}.</Notice><Link href={`/project-advisory/workspace/${m.reference}/mandate-letter`} className="mt-2 block text-sm font-semibold text-gold-700 underline">Continue to Mandate Letter →</Link></div>
                        ) : (
                            <div className="mt-3 space-y-2">
                                <Checkbox label="I confirm I have read and understood this engagement letter." checked={form.data.read} onChange={(e) => form.setData('read', e.target.checked)} />
                                <Checkbox label="I confirm the commercial terms are acceptable." checked={form.data.terms} onChange={(e) => form.setData('terms', e.target.checked)} />
                                <Field label="Signatory full name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                {(form.errors.read || form.errors.terms) && <p className="text-xs text-risk-500">{form.errors.read ?? form.errors.terms}</p>}
                                <Button type="submit" className="w-full" disabled={form.processing || !m.method_approved}><PenLine className="size-4" />Sign Engagement Letter</Button>
                            </div>
                        )}
                    </Card>
                </aside>
            </form>
        </div>
    );
}
