import { Link } from '@inertiajs/react';
import { Building2, CheckCircle2, Lock, Mail, MapPin, Phone, Share2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem } from '@/types/aiim';
import { useCompactPrice } from './Explorer/money';
import ScreeningPanel from './Explorer/ScreeningPanel';
import { CompareButton, FeeButton, ListToggle } from './Actions';
import AiimIcon from './AiimIcon';
import { Donut, Gauge, ScoreRing } from './Charts';
import { Chip, ConfidenceChip, EvidenceStrip, levelTone, LockedTag, riskTone, VerificationChip } from './Chips';
import AiimPage, { DeeperBox, RailBox, SectionCard, SelectionBox } from './Shell';
import { zar2 } from './format';

export interface ItemPreviewProps extends AiimPageProps {
    item: ProjectItem;
    as: 'opportunity' | 'project';
    entitled: boolean;
    unlockFrom: number | null;
    saved: string[];
}

const TABS = ['Overview', 'Investment Rationale', 'Financial Snapshot', 'Market & Demand', 'Infrastructure & Resources', 'ESG & Sustainability', 'Risk Profile', 'Stakeholders', 'Documents & Evidence'];

/** Shared template for Opportunity Preview (P8) and Project Overview (P10). */
export default function ItemPreview({ item, as, entitled, unlockFrom, saved }: ItemPreviewProps) {
    const [tab, setTab] = useState('Overview');
    const d = item.details ?? {};
    const m = d.metrics ?? {};
    const isProject = as === 'project';
    const funds = (isProject ? d.projectFunds : d.funds) ?? d.funds ?? [];
    const highlights = (isProject ? d.projectHighlights : d.highlights) ?? [];
    const unlockHref = `/aiim/unlock/${item.code}`;
    const locked = (label: string) =>
        entitled ? <Chip tone="good">Unlocked</Chip> : item.hasPremium ? <Link href={unlockHref} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"><Lock className="size-3" />{label}</Link> : <LockedTag>{label}</LockedTag>;
    const share = () => void navigator.clipboard?.writeText(window.location.href);
    const compact = useCompactPrice();
    const country = item.country ?? { iso2: 'ZA', slug: 'south-africa', name: 'South Africa' };
    const s = item.screening ?? null;
    const regionCrumb = item.province
        ? { label: item.provinceName, href: `/aiim/province/${item.province}` }
        : item.provinceName ? { label: item.provinceName, href: `/aiim/country/${country.slug}?tab=places` } : null;

    const facts: [string, string, string][] = [
        ['Location', item.location ?? '—', 'map-pin'], [isProject ? 'Project Type' : 'Opportunity Type', item.type, 'target'], ['Stage', item.stage, 'gauge'],
        ['Investment Size', s ? compact(s.capexZar) : item.size, 'coins'], ['Sector', d.subsector ?? item.sectorName, 'server'], ['Power Capacity', m['Power Capacity'] ?? '—', 'zap'],
        ...(s
            ? ([['Project IRR', s.projectIrr !== null ? `${s.projectIrr}%` : 'Not stated', 'trending-up'], ['Hurdles passed', `${s.hurdlesPassed ?? 0} of 4`, 'shield-check'], ['Country', country.name, 'globe']] as [string, string, string][])
            : ([['Sponsor', d.sponsor ?? 'Identified sponsor', 'building-2'], ['Jobs Potential', m['Jobs Potential'] ?? '—', 'users'], ['Land Size', m['Land Size'] ?? '—', 'globe']] as [string, string, string][])),
    ];

    return (
        <AiimPage
            title={isProject ? 'Project Overview' : 'Opportunity Preview'}
            crumbs={[{ label: 'Africa', href: '/aiim#explore-africa' }, { label: country.name, href: `/aiim/country/${country.slug}${s ? '?tab=opportunities' : ''}` }, ...(regionCrumb ? [regionCrumb] : []), { label: item.sectorName, href: `/aiim/sector/${item.sector}` }, { label: isProject ? 'Projects' : 'Opportunity Search', href: isProject ? '/aiim/projects' : '/aiim/opportunities' }, { label: item.name }]}
            subtitle="Comprehensive intelligence on a high-potential investment opportunity."
            description={isProject ? 'Review key project details, investment rationale, financials, risk profile, and next steps.' : undefined}
            actions={<ButtonLink href={isProject ? '/aiim/projects' : '/aiim/opportunities'} size="sm" variant="outline" icon="arrow-right">Back to Results</ButtonLink>}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <ListToggle list="watchlist" type={as} itemKey={item.slug} saved={saved} variant="row" dark />
                        <ListToggle list="saved" type={as} itemKey={item.slug} saved={saved} variant="row" dark />
                        <CompareButton type={as} itemKey={item.slug} variant="row" dark label={`Compare ${isProject ? 'Projects' : 'Opportunities'}`} />
                        <FeeButton type={as} itemKey={item.slug} variant="row" dark label="Export Summary / View Fees" />
                        <button type="button" onClick={share} className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[0.8125rem] text-parchment-200 hover:bg-ink-800"><Share2 className="size-4 text-gold-500" />Share {isProject ? 'Project' : 'Opportunity'}</button>
                    </RailBox>
                    {item.hasPremium && !entitled && (
                        <RailBox title="Premium Object">
                            <p className="mb-2 text-xs text-ink-300">Detailed financial model and full report are locked.{unlockFrom ? ` Pay-per-view from ${zar2(unlockFrom)} incl. VAT.` : ''}</p>
                            <ButtonLink href={unlockHref} size="sm" className="w-full" icon="lock">Unlock</ButtonLink>
                        </RailBox>
                    )}
                    <DeeperBox />
                </>
            }
        >
            <section className="grid gap-4 rounded-[10px] bg-ink-950 p-4 text-parchment-100 lg:grid-cols-12">
                <div className="flex aspect-[16/10] items-center justify-center rounded-[8px] bg-gradient-to-br from-ink-800 via-ink-900 to-gold-900/40 text-gold-500 lg:col-span-4">
                    <AiimIcon name={item.icon} className="size-16" />
                </div>
                <div className="lg:col-span-6">
                    <h2 className="flex items-center gap-2 text-2xl font-bold">{item.name}<ListToggle list="saved" type={as} itemKey={item.slug} saved={saved} variant="icon" dark /></h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <Chip tone={levelTone(item.level)}>{item.level}</Chip>
                        <Chip tone="good">Source Verified</Chip>
                        <VerificationChip label={item.evidence.verification} />
                        <ConfidenceChip evidence={item.evidence} short />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {facts.map(([k, v, icon]) => (
                            <div key={k} className="flex gap-2 text-xs">
                                <span className="text-gold-500"><AiimIcon name={icon} className="size-4" /></span>
                                <div><dt className="text-ink-400">{k}</dt><dd className="font-semibold">{v}</dd></div>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 lg:col-span-2">
                    {isProject ? <Gauge value={item.score} label={item.level} /> : <ScoreRing value={item.score} size={110} dark />}
                    <p className="text-xs text-ink-300">{s ? 'Hurdle score (share of 4 tests passed)' : 'Opportunity Score'}</p>
                </div>
                {isProject && (
                    <dl className="grid grid-cols-2 gap-3 border-t border-ink-800 pt-3 text-xs sm:grid-cols-4 lg:col-span-12">
                        {[['IRR (Projected)', m['IRR (Projected)'], m['IRR band']], ['NPV (ZAR)', m['NPV (ZAR)'], m['NPV basis']], ['Payback Period', m['Payback Period'] ? `${m['Payback Period']} Years` : null, null], ['Construction Start', m['Construction Start'], 'Estimated']].map(([k, v, s]) => (
                            <div key={k as string}><dt className="text-ink-400">{k}</dt><dd className="text-lg font-bold">{entitled || !item.hasPremium ? v ?? (d.compare?.irr as string) ?? '—' : <span className="inline-flex items-center gap-1 text-sm text-ink-400"><Lock className="size-3.5" />Premium</span>}</dd>{s && <dd className="text-ink-400">{s}</dd>}</div>
                        ))}
                    </dl>
                )}
            </section>
            <div className="mt-3"><EvidenceStrip evidence={item.evidence} /></div>
            {s && <div className="mt-4"><ScreeningPanel s={s} countrySlug={country.slug} /></div>}

            <Tabs className="mt-4" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="mt-4">
                {tab === 'Overview' && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <SectionCard number={1} title="Project Description" className="xl:col-span-1">
                            <p className="text-xs leading-relaxed text-ink-600">{isProject ? d.projectDescription ?? d.description : d.description}</p>
                            <div className="mt-3">{locked('View Full Opportunity Report')}</div>
                            {isProject && <Link href="/aiim/custom-intelligence" className="mt-3 inline-flex items-center gap-1 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800"><Sparkles className="size-3.5" />Ask AI About This Project</Link>}
                        </SectionCard>
                        <SectionCard number={2} title="Key Highlights">
                            <ul className="space-y-1.5 text-xs text-ink-600">{highlights.map((h) => <li key={h} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{h}</li>)}</ul>
                            {!isProject && <ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline" className="mt-3 w-full">Open Due Diligence Room</ButtonLink>}
                        </SectionCard>
                        <SectionCard number={3} title="Investment Use of Funds">
                            <Donut data={funds.map(([label, value]) => ({ label, value }))} centre="ZAR" sub={item.size} size={110} />
                            <div className="mt-3">{locked('View Financial Model (Locked)')}</div>
                        </SectionCard>
                        <SectionCard number={4} title="Market Snapshot">
                            <ul className="space-y-2 text-xs">{(d.market ?? []).map(([t, s]) => <li key={t}><strong className="text-ink-900">{t}</strong><p className="text-ink-600">{s}</p></li>)}</ul>
                            <div className="mt-3">{locked('View Market Analysis (Locked)')}</div>
                        </SectionCard>
                        <SectionCard number={5} title={isProject ? 'Project Contacts' : 'Next Steps / Contacts'}>
                            <p className="text-xs text-ink-600">Connect with our AIIM advisors to discuss this opportunity and access curated intelligence.</p>
                            <ul className="mt-2 space-y-1.5 text-xs">
                                <li className="flex items-center gap-1.5"><Building2 className="size-3.5 text-gold-600" />{isProject ? 'TBCA Project Advisory Desk' : 'AIIM Advisory Team'}</li>
                                <li className="flex items-center gap-1.5"><Mail className="size-3.5 text-gold-600" />{isProject ? 'projects@thebusinessclinic.africa' : 'investment@thebusinessclinic.africa'}</li>
                                <li className="flex items-center gap-1.5"><Phone className="size-3.5 text-gold-600" />+27 60 801 1365</li>
                                <li className="text-ink-400">Response within 24 hours</li>
                            </ul>
                            <ButtonLink href="/aiim/workspace/advisor-request" size="sm" className="mt-3 w-full">{isProject ? 'Request Advisor Call' : 'Speak to an Advisor'}</ButtonLink>
                            <div className="mt-2"><ListToggle list="watchlist" type={as} itemKey={item.slug} saved={saved} /></div>
                        </SectionCard>
                    </div>
                )}
                {tab === 'Investment Rationale' && <SectionCard title="Investment Rationale"><ul className="space-y-2 text-sm text-ink-700">{highlights.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" />{h}</li>)}</ul></SectionCard>}
                {tab === 'Financial Snapshot' && (
                    <SectionCard title="Financial Snapshot">
                        {entitled || !item.hasPremium ? (
                            <dl className="grid gap-3 text-sm sm:grid-cols-3">{Object.entries(d.compare ?? {}).map(([k, v]) => <div key={k}><dt className="text-xs text-ink-500 capitalize">{k}</dt><dd className="font-semibold">{String(v)}</dd></div>)}</dl>
                        ) : (
                            <div className="flex flex-wrap items-center gap-4"><Lock className="size-8 text-gold-600" /><p className="flex-1 text-sm text-ink-600">The financial model, IRR, NPV and payback assumptions are a premium object.</p><ButtonLink href={unlockHref} icon="lock">Unlock Financial Model</ButtonLink></div>
                        )}
                    </SectionCard>
                )}
                {tab === 'Market & Demand' && <SectionCard title="Market & Demand"><ul className="grid gap-3 sm:grid-cols-2">{(d.market ?? []).map(([t, s]) => <li key={t} className="rounded border border-parchment-400 p-3 text-sm"><strong>{t}</strong><p className="text-ink-600">{s}</p></li>)}</ul></SectionCard>}
                {tab === 'Infrastructure & Resources' && <SectionCard title="Infrastructure & Resources"><dl className="grid gap-3 text-sm sm:grid-cols-3">{Object.entries(m).filter(([k]) => ['Power Capacity', 'Land Size', 'Construction Start', 'Jobs Potential'].includes(k)).map(([k, v]) => <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}<div><dt className="text-xs text-ink-500">Location</dt><dd className="flex items-center gap-1 font-semibold"><MapPin className="size-3.5" />{item.location}</dd></div></dl></SectionCard>}
                {tab === 'ESG & Sustainability' && <SectionCard title="ESG & Sustainability">{(d.esg ?? []).length ? <ul className="list-disc space-y-1 pl-5 text-sm">{d.esg!.map((e) => <li key={e}>{e}</li>)}</ul> : <p className="text-sm text-ink-500">ESG assessment available in the full opportunity report.</p>}</SectionCard>}
                {tab === 'Risk Profile' && <SectionCard title="Risk Profile"><ul className="space-y-2 text-sm">{(d.risks ?? []).map(([r, l]) => <li key={r} className="flex justify-between border-b border-parchment-300 pb-1"><span>{r}</span><Chip tone={riskTone(l)}>{l}</Chip></li>)}</ul></SectionCard>}
                {tab === 'Stakeholders' && <SectionCard title="Stakeholders">{(d.stakeholders ?? []).length ? <ul className="space-y-1 text-sm">{d.stakeholders!.map(([n, r]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="text-ink-500">{r}</span></li>)}</ul> : <p className="text-sm text-ink-500">Sponsor and partner details are part of the locked premium object.</p>}</SectionCard>}
                {tab === 'Documents & Evidence' && (
                    <SectionCard title="Documents & Evidence">
                        <ul className="space-y-2 text-sm">{(d.documents ?? [['Teaser (2 pages)', 'Public'], ['Information Memorandum', 'Locked']]).map(([n, s]) => <li key={n} className="flex justify-between"><span>{n}</span>{s === 'Public' || entitled ? <Chip tone="good">Available</Chip> : <LockedTag />}</li>)}</ul>
                        {item.sourceCode && <p className="mt-3 text-xs">Primary source: <Link href={`/aiim/sources/${item.sourceCode}`} className="text-gold-700 underline">{item.evidence.source}</Link></p>}
                    </SectionCard>
                )}
            </div>
        </AiimPage>
    );
}
