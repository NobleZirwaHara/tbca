import { Head, Link, router } from '@inertiajs/react';
import { Bell, CircleCheck, ClipboardList, FileText, Handshake, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import { money } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest, MkProvider } from '@/types/marketplace';

interface Props {
    partner: MkProvider;
    counts: { matters: number; opportunities: number; tasks: number };
    matters: MkPartnerRequest[];
    legacyMatters: string[][];
    tasks: { label: string; due: string; done?: boolean }[];
    payments: [string, string, string, number, string][];
    outstanding: number;
    notifications: [string, string, string][];
}

function matterLink(m: MkPartnerRequest) {
    if (m.stage === 'conflict_pending') return `/partner-services/workspace/opportunities/${m.reference}`;
    if (['proposal', 'scope_quote'].includes(m.stage)) return `/partner-services/workspace/opportunities/${m.reference}/quote`;
    if (['delivery', 'qa_review'].includes(m.stage)) return `/partner-services/workspace/opportunities/${m.reference}/delivery`;
    if (m.stage === 'completed') return `/partner-services/workspace/opportunities/${m.reference}/settlement`;
    return `/partner-services/workspace/opportunities/${m.reference}`;
}

export default function Dashboard({ partner: p, counts, matters, legacyMatters, tasks, payments, outstanding, notifications }: Props) {
    const opportunities = matters.filter((m) => m.stage === 'conflict_pending');
    const verif = p.profile.verification ?? 'CURRENT_VERIFIED';

    return (
        <PartnerShell title="Partner Dashboard" description={<>Welcome back, <strong>{p.name}</strong>. Here&apos;s an overview of your Partner Services activity.</>}
            badge={<Tag tone="good">{p.routable ? 'Verified Partner' : p.statusLabel}</Tag>}
            actions={<Button type="button" variant="outline" size="sm" onClick={() => router.reload()}><RefreshCw className="size-4" aria-hidden="true" />Refresh</Button>}>
            <Head title="Partner Dashboard" />
            {!p.routable && <p className="mb-4 rounded border border-attested-500/40 bg-attested-50 p-3 text-sm text-attested-700">Your firm is {p.statusLabel.toLowerCase()}. Routing (new opportunities) starts once TBCA confirms current verification.</p>}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[[ClipboardList, 'Active Matters', counts.matters, 'View all matters'], [Handshake, 'Open Opportunities', counts.opportunities, 'View opportunities'], [FileText, 'Tasks Due', counts.tasks, 'View tasks'], [ShieldCheck, 'Verifications', verif.startsWith('CURRENT') ? 'Current' : 'Action', 'All current'], [Wallet, 'Payments Outstanding', money(outstanding), 'View statements']].map(([I, k, v, l]) => {
                    const Ic = I as typeof Wallet;
                    return <div key={k as string} className="rounded-[8px] border border-parchment-400 bg-white p-4"><div className="flex items-center gap-3"><Ic className="size-8 rounded-full bg-parchment-200 p-1.5 text-ink-700" aria-hidden="true" /><div><p className="text-xs text-ink-500">{k as string}</p><p className={`text-xl font-bold ${k === 'Verifications' ? 'text-verified-700' : 'text-ink-900'}`}>{v as string}</p></div></div><p className="mt-2 text-xs text-gold-700">{l as string} →</p></div>;
                })}
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <Card title="Active Matters">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-[0.8125rem]">
                                <thead className="text-xs text-ink-500"><tr>{['Matter Reference', 'Client', 'Service / Scope', 'Arrangement', 'Status', 'Next Milestone'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {matters.map((m) => <tr key={m.reference}><td className="py-2"><Link href={matterLink(m)} className="font-semibold text-gold-700 underline">{m.reference}</Link></td><td className="py-2">{m.clientName}</td><td className="py-2">{m.title}</td><td className="py-2 text-xs">{m.arrangement}</td><td className="py-2"><StatusPill status={m.stageLabel} /></td><td className="py-2 text-xs">{m.meta.delivery?.milestone ?? (m.stage === 'conflict_pending' ? 'Conflict check' : '—')}</td></tr>)}
                                    {legacyMatters.map((m) => <tr key={m[0]}><td className="py-2 font-semibold text-ink-700">{m[0]}</td><td className="py-2">{m[1]}</td><td className="py-2">{m[2]}</td><td className="py-2 text-xs">{m[3]}</td><td className="py-2"><StatusPill status={m[4]} /></td><td className="py-2 text-xs">{m[5]}<br /><span className="text-ink-400">{m[6]}</span></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card title="Tasks & Actions">
                            <ul className="space-y-2 text-sm">
                                {tasks.map((t, i) => (
                                    <li key={t.label} className="flex items-center justify-between gap-2">
                                        <label className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-gold-600" checked={!!t.done} onChange={() => router.post('/partner-services/workspace/tasks', { index: i }, { preserveScroll: true })} /><span className={t.done ? 'text-ink-400 line-through' : ''}>{t.label}</span></label>
                                        <span className="text-xs text-risk-600">Due {t.due}</span>
                                    </li>
                                ))}
                                {opportunities.map((o) => <li key={o.reference} className="flex justify-between text-sm"><Link href={matterLink(o)} className="font-semibold text-gold-700">Complete conflict check – {o.reference}</Link><span className="text-xs text-risk-600">Mandatory</span></li>)}
                            </ul>
                        </Card>
                        <Card title="Recent Payments">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Date', 'Matter', 'Description', 'Amount', 'Status'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{payments.map((p2) => <tr key={p2[1] + p2[0]}><td className="py-1.5">{p2[0]}</td><td className="py-1.5 font-semibold">{p2[1]}</td><td className="py-1.5">{p2[2]}</td><td className="py-1.5">{money(p2[3])}</td><td className="py-1.5"><StatusPill status={p2[4]} /></td></tr>)}</tbody></table>
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Partner Summary"><InfoRows dense rows={[['Partner ID', p.code], ['Partner Type', p.profile.firm_type ?? 'Professional Firm'], ['Agreement Status', <StatusPill key="a" status={p.agreementSigned ? 'Active' : 'Pending'} />], ['Member Since', p.profile.member_since ?? p.agreementSigned], ['Primary Contact', p.profile.practitioner]]} /><Link href="/partner-services/network" className="mt-3 block text-center text-sm font-semibold text-gold-700">View Partner Profile →</Link></Card>
                    <Card title="Verification Status">
                        <p className="text-sm text-ink-600">{verif.startsWith('CURRENT') ? 'All your verifications are current.' : `Verification state: ${verif}`}</p>
                        <ul className="mt-2 space-y-1.5 text-sm">{[['Entity Verification', verif], ['Practitioner Verification', verif], ['Indemnity Insurance', p.profile.indemnity ?? 'CURRENT']].map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><StatusPill status={String(v).startsWith('CURRENT') ? 'Current' : String(v)} tone={String(v).startsWith('CURRENT') ? 'good' : 'warn'} /></li>)}</ul>
                        <Link href="/partner-services/workspace/verifications" className="mt-3 block text-sm font-semibold text-gold-700">View verification details →</Link>
                    </Card>
                    <Card tone="cream" title="System Notifications">
                        <ul className="space-y-3 text-sm">{notifications.map(([t, s, d]) => <li key={t} className="flex gap-2"><Bell className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold">{t}</span><span className="text-xs text-ink-500">{s}</span></span><span className="text-xs text-ink-400">{d}</span></li>)}
                            {opportunities.length > 0 && <li className="flex gap-2"><CircleCheck className="size-4 text-verified-500" aria-hidden="true" />{opportunities.length} new opportunity awaiting your conflict check</li>}</ul>
                    </Card>
                </aside>
            </div>
        </PartnerShell>
    );
}

Dashboard.layout = null;
