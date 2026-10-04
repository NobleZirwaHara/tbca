import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Award, BadgeCheck, Briefcase, CalendarDays, CheckCircle2, ChevronRight, Circle, FileText, Gavel, Megaphone, Search, ShieldCheck, Star, TrendingUp, Users, Wallet } from 'lucide-react';
import { Progress, StatusPill, Tabs, Tag } from '@/Components/ui/Kit';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, Notice, zarCode } from '@/Components/Marketplace/ui';
import type { MkBrief, MkEngagement, MkProvider } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    engagements: MkEngagement[];
    briefs: (MkBrief & { match: number })[];
    kpis: { active: number; proposals: number; earnings: number };
    checklist: [string, boolean][];
}

const groups: Record<string, string[] | null> = { all: null, progress: ['assigned', 'in_progress', 'corrections'], review: ['in_qa', 'released', 'disputed'], completed: ['closed', 'accepted'] };

export default function Home({ provider: p, engagements, briefs, kpis, checklist }: Props) {
    const [tab, setTab] = useState('all');
    const rows = engagements.filter((e) => !groups[tab] || groups[tab]!.includes(e.stage));
    const count = (k: string) => engagements.filter((e) => !groups[k] || groups[k]!.includes(e.stage)).length;
    const m = p.profile.metrics ?? {};
    const doneChecks = checklist.filter(([, d]) => d).length;

    return (
        <ProviderShell title={<span className="flex items-center gap-3">Welcome back, {p.name}</span>} badge={p.routable ? <Tag tone="info"><BadgeCheck className="mr-1 size-3" aria-hidden="true" />Verified Provider</Tag> : <StatusPill status={p.statusLabel} />}
            description="Deliver expertise. Build trust. Grow with TBCA.">
            <Head title="Provider Portal" />
            {!p.routable && (
                <Notice tone="warn" className="mb-5">
                    Your provider status is <strong>{p.statusLabel}</strong>. {['agreement_ready', 'verified'].includes(p.status) ? <>Verification is approved — <Link href="/marketplace/provider/agreement" className="font-semibold underline">review and sign the Provider Agreement</Link> to go Active.</> : 'Opportunities open once TBCA vetting is complete and your agreement is signed.'}
                </Notice>
            )}
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {[['Active Engagements', kpis.active, 'View all', '/marketplace/provider/dashboard'], ['Pending Proposals', kpis.proposals, 'View briefs', '/marketplace/provider/opportunities'], ["This Month's Earnings", zarCode(kpis.earnings), 'View earnings', '/marketplace/provider/statements']].map(([k, v, l, h]) => (
                            <div key={k as string} className="rounded-[8px] border border-parchment-400 bg-white p-4"><p className="text-xs text-controlled-600">{k}</p><p className="mt-1 text-2xl font-bold text-ink-900">{v}</p><Link href={h as string} className="text-xs font-semibold text-controlled-600">{l} →</Link></div>
                        ))}
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-center"><p className="text-xs text-ink-500">Provider Rating</p><p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold"><Star className="size-5 fill-gold-500 text-gold-500" aria-hidden="true" />{p.rating ?? '—'} <span className="text-sm text-ink-400">/ 5</span></p><p className="text-xs text-ink-500">({p.reviewsCount} reviews)</p></div>
                    </div>
                    <Card title="Your Engagement Overview" action={<Link href="/marketplace/provider/dashboard" className="text-xs font-semibold text-controlled-600">View all engagements →</Link>}>
                        <Tabs value={tab} onChange={setTab} tabs={[{ key: 'all', label: 'All', count: count('all') }, { key: 'progress', label: 'In Progress', count: count('progress') }, { key: 'review', label: 'In Review', count: count('review') }, { key: 'completed', label: 'Completed', count: count('completed') }]} />
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[640px] text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Engagement ID', 'Service', 'Client', 'Stage', 'Due Date', 'Progress', ''].map((h) => <th key={h} scope="col" className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-400">No engagements in this view.</td></tr>}
                                    {rows.map((e) => (
                                        <tr key={e.reference}>
                                            <td className="px-3 py-2 font-mono text-xs">{e.reference}</td><td className="px-3 py-2">{e.service}</td><td className="px-3 py-2">{e.clientName}</td>
                                            <td className="px-3 py-2"><StatusPill status={e.stageLabel} /></td><td className="px-3 py-2">{e.targetDate}</td>
                                            <td className="px-3 py-2"><div className="flex items-center gap-2"><span className="w-9 text-xs">{e.progress}%</span><Progress value={e.progress} className="w-24" tone={e.progress === 100 ? 'good' : 'gold'} /></div></td>
                                            <td className="px-3 py-2"><Link href={`/marketplace/provider/engagements/${e.reference}`} aria-label={`Open ${e.reference}`}><ChevronRight className="size-4" /></Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Briefs & Opportunities" action={<Link href="/marketplace/provider/opportunities" className="text-xs font-semibold text-controlled-600">View all briefs →</Link>}>
                            <ul className="grid gap-3 sm:grid-cols-3">
                                {briefs.map((b, i) => (
                                    <li key={b.reference} className="flex flex-col rounded-[6px] border border-parchment-300 p-3">
                                        <Tag tone={i === 1 ? 'info' : 'gold'} className="self-start">{b.data.flag ?? (i === 1 ? 'Popular' : 'New')}</Tag>
                                        <p className="mt-2 text-sm font-semibold text-ink-900">{b.title}</p>
                                        <p className="text-[0.6875rem] text-ink-500">{b.reference}</p>
                                        <p className="mt-1 text-xs text-ink-600"><Briefcase className="mr-1 inline size-3" aria-hidden="true" />{b.categoryLabel}</p>
                                        <p className="text-xs text-ink-600">Budget: {b.budgetLabel}</p>
                                        <p className="flex-1 text-xs text-ink-600"><CalendarDays className="mr-1 inline size-3" aria-hidden="true" />Due: {b.data.delivery_date}</p>
                                        <Link href={`/marketplace/provider/opportunities/${b.reference}`} className="mt-2 rounded border border-controlled-500 py-1 text-center text-xs font-semibold text-controlled-600">View Brief</Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card title="Performance Snapshot" action={<Link href={`/marketplace/providers/${p.slug}`} className="text-xs font-semibold text-controlled-600">View performance →</Link>}>
                            <div className="grid grid-cols-2 gap-4">
                                {[['On-Time Delivery', `${m.on_time ?? 96}%`, ''], ['Quality Score', `${m.quality ?? p.rating ?? 4.8} / 5`, 'Target: ≥ 4.5'], ['Client Satisfaction', `${m.satisfaction ? Math.round(m.satisfaction * 20) : 98}%`, ''], ['Repeat Engagements', `${m.repeat ?? 76}%`, 'Target: ≥ 90%']].map(([k, v, t]) => (
                                    <div key={k}><p className="text-xs text-ink-500">{k}</p><p className="text-xl font-bold text-ink-900">{v}</p>{t && <p className="text-[0.6875rem] text-controlled-600">{t}</p>}</div>
                                ))}
                            </div>
                            <p className="mt-3 rounded bg-controlled-50 p-2 text-xs text-controlled-700">Tip: Keep your profile, portfolio and QA evidence up to date to win more briefs.</p>
                        </Card>
                    </div>
                    <Card title="Grow Your Business with TBCA">
                        <div className="grid gap-4 md:grid-cols-3">
                            {[[Users, 'Expand Your Reach', 'Access high-quality clients and projects across Africa and beyond.'], [Award, 'Build Your Reputation', 'Deliver quality, earn great reviews and unlock more opportunities.'], [TrendingUp, 'Increase Your Earnings', 'Competitive fees, on-time payments and long-term partnerships.']].map(([I, t, b]) => {
                                const Ic = I as typeof Users;
                                return <div key={t as string} className="flex gap-3"><Ic className="size-8 text-controlled-500" aria-hidden="true" /><div><p className="font-semibold text-ink-900">{t as string}</p><p className="text-xs text-ink-600">{b as string}</p></div></div>;
                            })}
                        </div>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Quick Actions">
                        <ul className="divide-y divide-parchment-300 text-sm">
                            {[[Search, 'View New Briefs', 'Find briefs matching your expertise', '/marketplace/provider/opportunities'], [FileText, 'Submit a Proposal', 'Respond to client briefs', '/marketplace/provider/opportunities?view=matched'], [Wallet, 'Earnings & Payouts', 'Statements and payout status', '/marketplace/provider/statements'], [ShieldCheck, 'Provider Agreement', 'Terms MP-PA-v2.1', '/marketplace/provider/agreement'], [Gavel, 'Raise a Grievance', 'Report or appeal a decision', '/marketplace/provider/grievances/new']].map(([I, t, s, h]) => {
                                const Ic = I as typeof Search;
                                return <li key={t as string}><Link href={h as string} className="flex items-center gap-3 py-2.5"><Ic className="size-5 text-ink-500" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold text-ink-900">{t as string}</span><span className="text-xs text-ink-500">{s as string}</span></span><ChevronRight className="size-4 text-ink-400" aria-hidden="true" /></Link></li>;
                            })}
                        </ul>
                    </Card>
                    <Card title="Provider Checklist" action={<Tag tone="good">{doneChecks}/{checklist.length} Completed</Tag>}>
                        <ul className="space-y-1.5 text-sm">{checklist.map(([l, d]) => <li key={l} className="flex items-center gap-2">{d ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : <Circle className="size-4 text-ink-300" aria-hidden="true" />}{l}</li>)}</ul>
                    </Card>
                    <Card title="What's New">
                        <ul className="space-y-3 text-xs">{[['New Briefs Matching Your Expertise', `${briefs.length} new briefs posted`], ['Policy Update', 'Marketplace Terms updated'], ['Provider Webinar', 'How to win more briefs']].map(([t, s]) => <li key={t} className="flex gap-2"><Megaphone className="size-4 text-ink-500" aria-hidden="true" /><span><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-500">{s}</span></span></li>)}</ul>
                    </Card>
                </aside>
            </div>
        </ProviderShell>
    );
}

Home.layout = null;
