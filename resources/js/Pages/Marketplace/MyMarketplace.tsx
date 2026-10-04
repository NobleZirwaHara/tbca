import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FilePlus2 } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { KpiTile, Progress, StatusPill, Tabs } from '@/Components/ui/Kit';
import { MkHeader, zarCode } from '@/Components/Marketplace/ui';
import type { MkBrief, MkDispute, MkEngagement } from '@/types/marketplace';

interface Props {
    briefs: MkBrief[];
    engagements: (MkEngagement & { latestDeliverable: string | null })[];
    disputes: MkDispute[];
}

function briefLink(b: MkBrief) {
    if (b.status === 'draft') return `/marketplace/brief/${b.step}?draft=${b.reference}`;
    if (['scope_accepted'].includes(b.status)) return b.provider ? `/marketplace/briefs/${b.reference}/disclosure` : `/marketplace/briefs/${b.reference}/proposals`;
    if (['disclosure_complete', 'awaiting_payment'].includes(b.status)) return `/marketplace/briefs/${b.reference}/checkout`;
    return `/marketplace/briefs/${b.reference}/review`;
}

export default function MyMarketplace({ briefs, engagements, disputes }: Props) {
    const [tab, setTab] = useState('engagements');
    const active = engagements.filter((e) => !['closed', 'awaiting_payment'].includes(e.stage));

    return (
        <>
            <Head title="My Marketplace" />
            <MkHeader crumbs={[{ label: 'Client Portal', href: '/portal' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'My Marketplace' }]} title="My Marketplace"
                lead="Your briefs, engagements, deliverables and disputes in one place." aside={<ButtonLink href="/marketplace/brief"><FilePlus2 className="size-4" aria-hidden="true" /> New Brief</ButtonLink>} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <KpiTile label="Open Briefs" value={briefs.filter((b) => b.status !== 'assigned').length} />
                        <KpiTile label="Active Engagements" value={active.length} tone="gold" />
                        <KpiTile label="Awaiting Your Decision" value={engagements.filter((e) => e.stage === 'released').length} tone="warn" />
                        <KpiTile label="Open Disputes" value={disputes.filter((d) => !['closed', 'withdrawn', 'won', 'lost'].includes(d.status)).length} tone="bad" />
                    </div>
                    <Tabs value={tab} onChange={setTab} tabs={[{ key: 'engagements', label: 'Engagements', count: engagements.length }, { key: 'briefs', label: 'Briefs', count: briefs.length }, { key: 'disputes', label: 'Disputes', count: disputes.length }]} />
                    {tab === 'engagements' && (
                        <ul className="space-y-3">
                            {engagements.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">No engagements yet. Submit a brief or order a service.</li>}
                            {engagements.map((e) => (
                                <li key={e.reference} className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div><p className="font-mono text-xs text-ink-500">{e.reference}</p><p className="font-semibold text-ink-900">{e.title}</p><p className="text-xs text-ink-500">{e.provider?.name ?? 'Provider pending'} · Target {e.targetDate}</p></div>
                                        <StatusPill status={e.stageLabel} />
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-4">
                                        <div className="w-40"><Progress value={e.progress} /></div>
                                        <span className="text-xs text-ink-500">{e.progress}% · {zarCode(e.valueZar)}</span>
                                        <div className="ml-auto flex flex-wrap gap-3 text-sm font-semibold text-gold-700">
                                            {e.stage === 'awaiting_payment' ? <span className="text-xs text-ink-500">Awaiting payment confirmation</span> : <>
                                                <Link href={`/marketplace/engagements/${e.reference}/assignment`}>Assignment</Link>
                                                <Link href={`/marketplace/engagements/${e.reference}/progress`}>Progress</Link>
                                                {e.latestDeliverable && ['released', 'accepted', 'closed', 'corrections', 'disputed'].includes(e.stage) && <Link href={`/marketplace/engagements/${e.reference}/deliverables/${e.latestDeliverable}`}>Deliverable</Link>}
                                            </>}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {tab === 'briefs' && (
                        <ul className="space-y-3">
                            {briefs.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">No briefs yet.</li>}
                            {briefs.map((b) => (
                                <li key={b.reference} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <div><p className="font-mono text-xs text-ink-500">{b.reference}</p><p className="font-semibold text-ink-900">{b.title}</p><p className="text-xs text-ink-500">{b.categoryLabel} · {b.budgetLabel} · {b.createdAt}</p></div>
                                    <div className="flex items-center gap-3"><StatusPill status={b.statusLabel} /><Link href={briefLink(b)} className="text-sm font-semibold text-gold-700">{b.status === 'draft' ? 'Continue draft' : 'Open'} →</Link></div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {tab === 'disputes' && (
                        <ul className="space-y-3">
                            {disputes.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">No disputes.</li>}
                            {disputes.map((d) => (
                                <li key={d.reference} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <div><p className="font-mono text-xs text-ink-500">{d.reference} · {d.engagementRef}</p><p className="font-semibold text-ink-900">{d.subject}</p></div>
                                    <div className="flex items-center gap-3"><StatusPill status={d.status} /><Link href={`/marketplace/engagements/${d.engagementRef}/disputes/${d.reference}`} className="text-sm font-semibold text-gold-700">Open →</Link></div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}
