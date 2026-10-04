import { Link } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';
import { FeeButton, ListToggle } from '@/Components/Aiim/Actions';
import { Gauge } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import AiimPage, { DeeperBox, RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, SourceItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    source: SourceItem;
    access: { premium: boolean; entitled: boolean; status: string; level: string; premiumContent: string };
    usedBy: { projects: { slug: string; name: string }[] };
    saved: string[];
}

const TABS = ['Summary', 'Methodology', 'Key Findings', 'Data Points Used', 'Supporting Evidence', 'References', 'Updates & History'];

export default function Source({ source, access, usedBy, saved }: Props) {
    const [tab, setTab] = useState('Summary');
    const p = source.profile ?? {};
    const rel = p.reliability ?? { score: source.confidence };
    const locked = access.premiumContent === 'Locked';
    const points: [string, number][] = p.dataPoints ?? [];
    const meta: [string, string][] = [
        ['Source Type', p.sourceType ?? source.category], ['Publisher', source.provider], ['Published', p.published ?? source.updated ?? '—'],
        ['Next Release', p.nextRelease ?? source.nextReview ?? '—'], ['Geo Coverage', source.coverage ?? '—'], ['Language', p.language ?? 'English'], ['Access Type', p.access ?? (p.licence ?? 'Public')],
    ];

    return (
        <AiimPage
            title="Source and Evidence Preview"
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: 'Sources & Evidence', href: '/aiim/methodology' }, { label: 'Source and Evidence Preview' }]}
            heading={<>Source and Evidence Preview<ListToggle list="watchlist" type="source" itemKey={source.code} saved={saved} variant="icon" /></>}
            subtitle="Detailed preview of source metadata, methodology and supporting evidence."
            description="Understand where intelligence comes from and how it is generated."
            actions={<ButtonLink href="/aiim/methodology" size="sm" variant="outline">All Sources</ButtonLink>}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <ListToggle list="watchlist" type="source" itemKey={source.code} saved={saved} variant="row" dark />
                        <FeeButton type="source" itemKey={source.code} variant="row" dark label="Export Source Profile / Fees" />
                    </RailBox>
                    <DeeperBox text="Unlock extended source access, proprietary datasets, historical series and expert analysis." />
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-12">
                <section className="rounded-[10px] bg-ink-950 p-4 text-parchment-100 lg:col-span-8">
                    <p className="text-xs text-ink-400">Source Overview</p>
                    <h2 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-bold">{source.name}<Chip tone="info">Tier {source.tier} · {source.tierName}</Chip></h2>
                    <p className="mt-2 text-sm text-ink-200">{p.description ?? `${source.dataType} published by ${source.provider}.`}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-7">{meta.map(([k, v]) => <div key={k}><dt className="text-ink-400">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <Chip tone={levelTone(source.verification)} icon={<BadgeCheck className="size-3" />}>{source.verification === 'verified' ? 'Source Verified' : `Verification: ${source.verification}`}</Chip>
                        <Chip tone="info">Human-Reviewed</Chip>
                        <Chip tone={source.grade.tone as 'good'}>Confidence: {source.grade.label} ({source.confidence}%)</Chip>
                        <Chip tone="dark">Model {source.model}</Chip>
                    </div>
                </section>
                <section className="grid grid-cols-2 items-center gap-3 rounded-[10px] bg-ink-950 p-4 text-parchment-100 lg:col-span-4">
                    <div className="col-span-2 sm:col-span-1"><Gauge value={rel.score} label={rel.score >= 90 ? 'Very High Reliability' : 'Reliability'} /></div>
                    <ul className="col-span-2 space-y-1 text-xs sm:col-span-1">
                        {['Timeliness', 'Methodology', 'Transparency', 'Independence', 'Reputation'].map((k) => <li key={k} className="flex justify-between"><span className="text-ink-300">{k}</span><span className="font-semibold">{rel[k] ?? Math.round(source.confidence)}/100</span></li>)}
                    </ul>
                </section>
            </div>

            <Tabs className="mt-4" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="mt-4 grid gap-4 lg:grid-cols-4">
                {tab === 'Summary' && (
                    <>
                        <SectionCard title="Source Summary" className="lg:col-span-2">
                            <p className="text-xs text-ink-600">{p.summary ?? p.description ?? 'Approved AIIM source used across published intelligence objects.'}</p>
                            <ul className="mt-2 space-y-1 text-xs">{(p.bullets ?? []).map((b: string) => <li key={b} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{b}</li>)}</ul>
                            {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">View Full Report (External)<ExternalLink className="size-3" /></a>}
                        </SectionCard>
                        <SectionCard title="Key Findings">
                            <ul className="space-y-1.5 text-xs">{(p.findings ?? []).slice(0, locked ? 3 : 10).map(([k, v]: [string, string]) => <li key={k}>{k}: <strong>{v}</strong></li>)}</ul>
                            {locked && <p className="mt-2 flex items-center gap-1 text-xs text-ink-400"><Lock className="size-3" />Detailed findings locked</p>}
                        </SectionCard>
                        <SectionCard dark title="Access & Entitlement">
                            <p className="text-xs text-ink-300">{access.premium ? 'This is a premium source in your entitlement. Some detailed datasets and extended time series require a Premium upgrade.' : 'This source is publicly licensed and fully visible.'}</p>
                            <dl className="mt-2 space-y-1 text-xs">{[['Entitlement Status', access.status], ['Access Level', access.level], ['Premium Content', access.premiumContent]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-400">{k}</dt><dd><Chip tone={v === 'Locked' ? 'bad' : v === 'Included' || v === 'Unlocked' ? 'good' : 'dark'}>{v}</Chip></dd></div>)}</dl>
                            {locked && <ButtonLink href="/aiim/store?category=Data+Packs" size="sm" className="mt-3 w-full">Upgrade to Premium</ButtonLink>}
                        </SectionCard>
                    </>
                )}
                {tab === 'Data Points Used' && (
                    <SectionCard title="Data Points Used in AIIM" className="lg:col-span-2">
                        <ul className="space-y-1 text-sm">{points.map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></li>)}<li className="flex justify-between border-t border-parchment-300 pt-1 font-bold"><span>Total Data Points</span><span>{points.reduce((s, [, v]) => s + v, 0) || p.points?.total}</span></li></ul>
                    </SectionCard>
                )}
                {tab === 'Supporting Evidence' && (
                    <SectionCard title="Objects citing this source" className="lg:col-span-2">
                        {usedBy.projects.length ? <ul className="space-y-1 text-sm">{usedBy.projects.map((u) => <li key={u.slug}><Link href={`/aiim/opportunities/${u.slug}`} className="text-gold-700 hover:underline">{u.name}</Link></li>)}</ul> : <p className="text-sm text-ink-500">Used for macro indicators across cockpit and risk views.</p>}
                    </SectionCard>
                )}
                {!['Summary', 'Data Points Used', 'Supporting Evidence'].includes(tab) && (
                    <SectionCard title={tab} className="lg:col-span-2">
                        <p className="text-sm text-ink-600">{tab === 'Methodology' ? `Scored with confidence model ${source.model} (Tier ${source.tier} ${source.tierName}). Reliability combines timeliness, methodology, transparency, independence and reputation.` : tab === 'Updates & History' ? `Last updated ${source.updated}; next review ${source.nextReview}. Corrections are versioned and affected purchasers are notified.` : 'References are listed in the full source dossier.'}</p>
                        {(tab === 'Key Findings') && <ul className="mt-2 space-y-1 text-sm">{(p.findings ?? []).map(([k, v]: [string, string]) => <li key={k}>{k}: <strong>{v}</strong></li>)}</ul>}
                    </SectionCard>
                )}
            </div>
        </AiimPage>
    );
}
