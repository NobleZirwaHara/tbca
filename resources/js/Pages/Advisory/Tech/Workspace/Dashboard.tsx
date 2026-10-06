import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tabs } from '@/Components/ui/Kit';
import TechGateModal, { type TechGate } from '@/Components/Advisory/TechGateModal';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, Donut, KV, LedgerBadge, Stat, Tracker, zar, zarRange } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Task { id: number; group: string; title: string; owner: string; due: string; status: string; priority: string }
interface Props {
    engagement: TechHeader;
    ledgers: { T: { paid: number; approved: number; future: number }; X: { funded: number; pending: number }; S: { vat_paid: number } };
    gate: TechGate | null;
    openGate: boolean;
    tasks: Task[];
    documents: { id: number; name: string; version: string; status: string }[];
    tickets: { reference: string; subject: string; priority: string; status: string; assigned_to: string }[];
    kpis: { completion: number; blockers: number; next_due: string | null; days: number | null };
    uat: { defects_open?: number; signoff?: boolean } | null;
    timeline: { at: string; event: string; by: string }[];
}

export default function Dashboard({ engagement: e, ledgers, gate, openGate, tasks, documents, tickets, kpis, uat, timeline }: Props) {
    const [open, setOpen] = useState(openGate && !!gate);
    const [tab, setTab] = useState('client');
    const list = tasks.filter((t) => (tab === 'client' ? t.group === 'client' : tab === 'tbca' ? t.group === 'tbca' : t.group === 'dependency'));
    return (
        <TechPortal e={e} title="Client Engagement Dashboard" description="Secure command centre for your active technology solution engagement." actions={gate ? <Button onClick={() => setOpen(true)} trailingIcon="arrow-right">Gate {gate.number} awaiting you</Button> : undefined}>
            <Head title="Client Engagement Dashboard" />
            <Card title="1 Engagement Progress">
                <Tracker items={e.tracker} />
                <p className="mt-2 text-xs text-ink-500">Current Stage: {e.stage_name} · Stage {e.stage} of 10</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="T" size="sm" />Implementation & Advisory Fees</p><KV className="mt-2" rows={[['Paid', zar(ledgers.T.paid)], ['Approved Unpaid', zar(ledgers.T.approved)], ['Future gates (disclosed)', zar(ledgers.T.future)]]} /><Link href={`/technology-solutions/workspace/${e.reference}/fee-meter`} className="mt-1 block font-semibold text-gold-700">View Ledger T Details →</Link></div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="X" size="sm" />Third-Party & External Costs</p><KV className="mt-2" rows={[['Funded', zar(ledgers.X.funded)], ['Pending Funding', zar(ledgers.X.pending)]]} />{ledgers.X.pending > 0 && <p className="mt-1 text-risk-700">Commitment lock if funding incomplete.</p>}<Link href={`/technology-solutions/workspace/${e.reference}/external-costs`} className="mt-1 block font-semibold text-gold-700">View Ledger X Details →</Link></div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="S" size="sm" />Statutory, Tax & Compliance</p><KV className="mt-2" rows={[['VAT Treatment', 'Standard Rated'], ['VAT paid to date', zar(ledgers.S.vat_paid)], ['Statutory Filing', 'Up to date']]} /><Link href={`/technology-solutions/workspace/${e.reference}/statement`} className="mt-1 block font-semibold text-gold-700">View Ledger S Details →</Link></div>
                </div>
            </Card>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4"><Donut size={64} slices={[{ value: kpis.completion, color: '#2f855a' }, { value: 100 - kpis.completion, color: '#ebe0cd' }]} center={`${kpis.completion}%`} /><div><p className="text-xs text-ink-500">Overall Completion</p><p className="text-sm font-semibold">{e.health === 'on_track' ? 'On Track' : 'Paused'}</p></div></div>
                <Stat label="Days to Next Milestone" value={kpis.days ?? '—'} sub={kpis.next_due ?? ''} />
                <Stat label="Open Blockers" value={kpis.blockers} sub={kpis.blockers ? 'Requires Attention' : 'None'} tone={kpis.blockers ? 'bad' : 'good'} />
                <Stat label="Human Review State" value="Complete" tone="good" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <Card title="3 Tasks" className="xl:col-span-7" action={<Link href={`/technology-solutions/workspace/${e.reference}/tasks`} className="text-xs underline">View All Tasks</Link>}>
                    <Tabs tabs={[{ key: 'client', label: 'Client Actions' }, { key: 'tbca', label: 'TBCA Delivery Tasks' }, { key: 'dep', label: 'Dependencies / Blockers' }]} value={tab} onChange={setTab} />
                    <table className="mt-2 w-full text-xs"><thead className="text-ink-500"><tr><th className="py-1 text-left">Task</th><th className="text-left">Owner</th><th>Due Date</th><th>Status</th></tr></thead><tbody className="divide-y divide-parchment-300">{list.map((t) => <tr key={t.id}><td className="py-1.5">{t.title}</td><td>{t.owner}</td><td className="text-center">{t.due}</td><td className="text-center"><StatusPill status={t.status} /></td></tr>)}</tbody></table>
                </Card>
                <Card title="4 Documents" className="xl:col-span-5" action={<Link href={`/technology-solutions/workspace/${e.reference}/documents`} className="text-xs underline">View All Documents</Link>}>
                    <ul className="divide-y divide-parchment-300 text-xs">{documents.map((d) => <li key={d.id} className="flex items-center justify-between gap-2 py-1.5"><span>{d.name}</span><span className="text-ink-500">{d.version}</span><StatusPill status={d.status} /></li>)}</ul>
                </Card>
                <Card title="5 Review & Acceptance" className="xl:col-span-4">
                    <KV rows={[['UAT Status', <StatusPill status={uat?.signoff ? 'signed' : 'Pending Review'} />], ['Open Defects', uat?.defects_open ?? 0], ['Sign-off Status', uat?.signoff ? 'Signed' : 'Awaiting Client']]} />
                    <Link href={`/technology-solutions/workspace/${e.reference}/uat`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">Review UAT <ChevronRight className="size-3" /></Link>
                </Card>
                <Card title="6 Support & Cases" className="xl:col-span-4">
                    <p className="text-xs">Open Cases: <b>{tickets.length}</b> · SLA Status: Within SLA</p>
                    <ul className="mt-2 space-y-1 text-xs">{tickets.map((t) => <li key={t.reference} className="flex justify-between gap-2"><span>#{t.reference} {t.subject}</span><StatusPill status={t.status} /></li>)}</ul>
                    <div className="mt-3 flex flex-wrap gap-2"><Link href={`/technology-solutions/workspace/${e.reference}/support`} className="rounded border border-parchment-500 px-2 py-1 text-xs">Raise Issue</Link><a href="https://wa.me/27608011365" className="inline-flex items-center gap-1 rounded border border-verified-500 px-2 py-1 text-xs text-verified-700"><MessageCircle className="size-3" />WhatsApp Support</a></div>
                </Card>
                <Card title="7 Activity Timeline" className="xl:col-span-4">
                    <ul className="space-y-1.5 text-xs">{timeline.map((t, i) => <li key={i}><span className="text-ink-500">{t.at}</span> — {t.event} <span className="text-ink-400">({t.by})</span></li>)}</ul>
                </Card>
            </div>
            {gate && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-gold-400 bg-gold-50 p-4">
                    <p className="text-sm"><b>Gate {gate.number}: {gate.name}</b> — T {zar(gate.t)}{gate.x[1] > 0 && ` · X ${zarRange(gate.x)}`}</p>
                    <div className="flex gap-2">{gate.status === 'approved_not_paid' && gate.order && <Button variant="outline" onClick={() => router.visit(`/checkout/${gate.order}`)}>Complete payment</Button>}<Button onClick={() => setOpen(true)}>Review Gate</Button></div>
                </div>
            )}
            {gate && <TechGateModal open={open} onClose={() => setOpen(false)} gate={gate} e={e} />}
        </TechPortal>
    );
}

Dashboard.layout = null;
