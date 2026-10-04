import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, Bell, Briefcase, CalendarClock, ChevronRight, ClipboardCheck, Clock, Eye, FileWarning, Gavel, Layers, Lock, Medal, Search, ShieldCheck, Upload, Wallet } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill, Tabs, Tag } from '@/Components/ui/Kit';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, Stars, zarCode } from '@/Components/Marketplace/ui';
import type { MkBrief, MkEngagement, MkProvider } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    engagements: (MkEngagement & { qaState: string | null })[];
    opportunities: (MkBrief & { match: number; saved: boolean })[];
    kpis: { available: number; active: number; awaitingQa: number; corrections: number; payoutReady: number; pending: number; held: number; heldCount: number; lastPaid: string | null; grievances: number };
}

const nextAction: Record<string, string> = { assigned: 'Start Work', in_progress: 'Submit Work', corrections: 'Submit Corrections', in_qa: 'View QA', released: 'View Feedback', disputed: 'View Dispute', closed: 'View Summary', accepted: 'View Summary' };

export default function Dashboard({ provider: p, engagements, opportunities, kpis }: Props) {
    const [feed, setFeed] = useState('new');
    const m = p.profile.metrics ?? {};
    const shown = feed === 'saved' ? opportunities.filter((o) => o.saved) : feed === 'matched' ? opportunities.filter((o) => o.match >= 70) : opportunities;
    const tiles: [typeof ShieldCheck, string, string, string, string?][] = [
        [ShieldCheck, 'Provider Standing', p.status === 'suspended' ? 'Suspended' : 'Good Standing', p.status === 'suspended' ? 'Restrictions active' : 'No active restrictions', 'good'],
        [BadgeCheck, 'Verification State', p.routable ? 'Verified' : p.statusLabel, p.lastVerified ? `Completed ${p.lastVerified}` : 'Pending', 'good'],
        [Medal, 'Tier', `${p.tier ?? 'Bronze'} Tier`, p.tier === 'Gold' ? 'Tier 1 Provider' : 'Tier 2 Provider'],
        [Briefcase, 'Available Opportunities', String(kpis.available), 'New & matched'],
        [Layers, 'Active Assignments', String(kpis.active), 'In progress'],
        [Eye, 'Submissions Awaiting QA', String(kpis.awaitingQa), 'In TBCA QA'],
        [FileWarning, 'Corrections Required', String(kpis.corrections), 'Action needed', 'warn'],
        [Wallet, 'Payout-Ready Earnings', zarCode(kpis.payoutReady), 'Ready for payout', 'good'],
        [Lock, 'Payment Holds', `${kpis.heldCount} | ${zarCode(kpis.held)}`, 'Under review', 'bad'],
        [Gavel, 'Grievances', String(kpis.grievances), 'Open items'],
        [CalendarClock, 'Upcoming Verification Expiries', p.nextReviewDays !== null && p.nextReviewDays <= 60 ? '1' : '0', 'Within 60 days'],
    ];
    const tone = { good: 'text-verified-700', warn: 'text-attested-700', bad: 'text-risk-600' } as Record<string, string>;

    return (
        <ProviderShell title={`Welcome back, ${p.name}`} badge={<Tag tone="good">Verified Provider</Tag>} description="Deliver expertise. Build trust. Grow with TBCA. · External Provider Portal"
            actions={<ButtonLink href="/marketplace/provider/opportunities" trailingIcon="arrow-right">View Opportunities</ButtonLink>}>
            <Head title="Provider Dashboard" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {tiles.map(([I, k, v, c, t]) => (
                    <div key={k} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                        <div className="flex items-center gap-2"><I className="size-5 text-gold-600" aria-hidden="true" /><p className="text-[0.6875rem] text-ink-500">{k}</p></div>
                        <p className={`mt-1 text-base font-bold ${t ? tone[t] : 'text-ink-900'}`}>{v}</p><p className="text-[0.625rem] text-ink-400">{c}</p>
                    </div>
                ))}
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <Card className="xl:col-span-5" title="Active Assignments / My Engagements">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-xs">
                            <thead className="text-ink-500"><tr>{['Engagement ID', 'Service', 'Client', 'Stage', 'Due', 'QA State', 'Payment', 'Next Action'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {engagements.map((e) => (
                                    <tr key={e.reference}>
                                        <td className="py-2 font-mono">{e.reference}</td><td className="py-2">{e.service}</td><td className="py-2">{e.clientName}</td><td className="py-2"><StatusPill status={e.stageLabel} /></td>
                                        <td className="py-2">{e.targetDate}</td><td className="py-2">{e.qaState ? <StatusPill status={e.qaState} /> : 'Not Submitted'}</td><td className="py-2"><StatusPill status={e.paymentState} tone="gold" /></td>
                                        <td className="py-2"><Link href={`/marketplace/provider/engagements/${e.reference}`} className="rounded border border-gold-500 px-2 py-1 font-semibold whitespace-nowrap text-gold-800">{nextAction[e.stage] ?? 'Open'}</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card className="xl:col-span-4" title="Opportunities Feed" action={<Link href="/marketplace/provider/opportunities" className="text-xs font-semibold text-gold-700">View all →</Link>}>
                    <Tabs value={feed} onChange={setFeed} tabs={[{ key: 'new', label: 'New' }, { key: 'matched', label: 'Matched' }, { key: 'saved', label: 'Saved' }]} />
                    <ul className="mt-2 divide-y divide-parchment-300 text-xs">
                        {shown.length === 0 && <li className="py-4 text-center text-ink-400">Nothing here yet.</li>}
                        {shown.map((o) => (
                            <li key={o.reference} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                <span><span className="font-mono">{o.reference}</span> · {o.categoryLabel} · {o.data.country}<br /><span className="text-ink-500">{o.data.industry} · Fixed Rate · QA Class 2 · {o.match}% match</span></span>
                                <Link href={`/marketplace/provider/opportunities/${o.reference}`} className="rounded border border-gold-500 px-2 py-1 font-semibold text-gold-800">View Opportunity</Link>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="xl:col-span-3" title="Quick Actions">
                    <ul className="divide-y divide-parchment-300 text-sm">
                        {[[Search, 'View Opportunities', '/marketplace/provider/opportunities'], [Upload, 'Submit Work', engagements[0] ? `/marketplace/provider/engagements/${engagements[0].reference}` : '/marketplace/provider'], [Wallet, 'View Earnings', '/marketplace/provider/statements'], [AlertTriangle, 'Raise Grievance', '/marketplace/provider/grievances/new']].map(([I, l, h]) => {
                            const Ic = I as typeof Search;
                            return <li key={l as string}><Link href={h as string} className="flex items-center gap-2 py-2.5"><Ic className="size-4 text-ink-500" aria-hidden="true" /><span className="flex-1">{l as string}</span><ChevronRight className="size-4 text-ink-400" aria-hidden="true" /></Link></li>;
                        })}
                    </ul>
                </Card>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <Card title="QA & Delivery Queue">
                    <ul className="space-y-2 text-sm">{[[ClipboardCheck, 'Submissions Awaiting QA', kpis.awaitingQa], [FileWarning, 'Corrections In Progress', kpis.corrections], [Clock, 'Upcoming Delivery Deadlines', engagements.filter((e) => !['closed'].includes(e.stage)).length]].map(([I, l, v]) => {
                        const Ic = I as typeof Clock;
                        return <li key={l as string} className="flex items-center justify-between"><span className="flex items-center gap-2"><Ic className="size-4 text-ink-500" aria-hidden="true" />{l as string}</span><span className="font-bold">{v as number}</span></li>;
                    })}</ul>
                </Card>
                <Card title="Earnings Snapshot">
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between"><span>Payout-Ready Earnings</span><span className="font-bold text-verified-700">{zarCode(kpis.payoutReady)}</span></li>
                        <li className="flex justify-between"><span>Pending Payout</span><span className="font-bold text-attested-700">{zarCode(kpis.pending)}</span></li>
                        <li className="flex justify-between"><span>Held Amount</span><span className="font-bold text-risk-600">{zarCode(kpis.held)}</span></li>
                        <li className="flex justify-between"><span>Last Paid Date</span><span>{kpis.lastPaid ?? '—'}</span></li>
                    </ul>
                    <Link href="/marketplace/provider/statements" className="mt-2 block text-xs font-semibold text-gold-700">View earnings →</Link>
                </Card>
                <Card title="Performance Snapshot">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-ink-500">Quality Score</p><p className="text-lg font-bold">{p.rating ?? '—'} / 5</p><Stars value={p.rating} /></div>
                        <div><p className="text-ink-500">On-Time Delivery</p><p className="text-lg font-bold">{m.on_time ?? 92}%</p><p className="text-ink-400">Target ≥ 85%</p></div>
                        <div><p className="text-ink-500">First-Pass QA Rate</p><p className="text-lg font-bold">{m.first_pass ?? 88}%</p><p className="text-ink-400">Target ≥ 80%</p></div>
                        <div><p className="text-ink-500">Repeat Engagement</p><p className="text-lg font-bold">{m.repeat ?? 67}%</p><p className="text-ink-400">Last 90 days</p></div>
                    </div>
                </Card>
                <Card title="Compliance & Expiry Alerts">
                    <ul className="space-y-2 text-xs">{((p.profile.expiries ?? [['Verification Expiry', p.nextReview ?? '—', 'PASS']]) as [string, string, string][]).map(([k, d, s]) => <li key={k} className="flex items-center justify-between gap-2"><span>{k}<br /><span className="text-ink-400">{d}</span></span><StatusPill status={s} tone={s === 'PASS' ? 'good' : s === 'ACTION REQUIRED' ? 'bad' : 'warn'} /></li>)}</ul>
                </Card>
                <Card title="Provider Notices / What's New">
                    <ul className="space-y-2 text-xs">{[['Policy Update: QA Class 3 standards', 'New QA Class 3 requirements'], ['Webinar: Maximising QA First-Pass Rate', 'Join us next month'], ['Reminder: Evidence Quality Best Practices', 'Ensure evidence is complete and traceable']].map(([t, s]) => <li key={t} className="flex gap-2"><Bell className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><span className="block font-semibold">{t}</span><span className="text-ink-500">{s}</span></span></li>)}</ul>
                </Card>
            </div>
        </ProviderShell>
    );
}

Dashboard.layout = null;
