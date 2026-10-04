import { Link } from '@inertiajs/react';
import { CheckCircle2, Globe, Link2 } from 'lucide-react';
import { useState } from 'react';
import { CompareButton, FeeButton, ListToggle } from '@/Components/Aiim/Actions';
import { Donut, ScoreRing } from '@/Components/Aiim/Charts';
import { Chip, ConfidenceChip, EvidenceStrip, VerificationChip } from '@/Components/Aiim/Chips';
import AiimPage, { DeeperBox, RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, OrgItem, ProjectItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    org: OrgItem;
    related: ProjectItem[];
    saved: string[];
}

export default function OrgShow({ org, related, saved }: Props) {
    const investor = org.kind === 'investor';
    const p = org.profile ?? {};
    const tabs = investor
        ? ['Overview', 'Investment Focus', 'Investment Criteria', 'Portfolio Snapshot', 'Key People', 'Recent Investments', 'Engagement', 'Documents & Evidence']
        : ['Overview', 'Funding Focus', 'Eligibility & Criteria', 'Funding Instruments', 'Recent Investments', 'Portfolio in South Africa', 'Documents & Evidence', 'Key Contacts'];
    const [tab, setTab] = useState('Overview');
    const base = investor ? '/aiim/investors' : '/aiim/funders';
    const stats: [string, string | undefined][] = investor
        ? [['Founded', p.founded], ['Team Size', p.team], ['AUM (ZAR)', p.aum], ['Portfolio Companies', p.portfolio], ['Active in', p.countries]]
        : [['Established', p.established], ['Member Countries', p.members], ['Asset Size', p.assets], ['Staff', p.staff], ['HQ', p.hq ?? org.location ?? undefined]];
    const metrics: [string, string | undefined, string?][] = investor
        ? [['Investment Ticket Size (ZAR)', org.ticket, 'Typically per round'], ['Investment Stages', p.stagesLong ?? org.stages.join(', ')], ['Target Ownership', p.ownership], ['Annual Investment Pace', p.pace]]
        : [['Annual Approvals (Africa)', p.approvals, p.approvalsNote], ['Active in Countries', p.activeCountries, 'African Countries'], ['Projects in South Africa', p.saProjects, 'Active Portfolio'], ['Typical Ticket Size (ZAR)', p.ticketLabel ?? org.ticket, 'Per Project'], ['Funding Instruments', p.instrumentCount ?? String(org.instruments.length), 'Types Available']];
    const focusAreas: string[] = p.focusAreas ?? org.focus;
    const allocation: [string, number][] = p.allocation ?? [];
    const about: string[] = Array.isArray(p.about) ? p.about : [p.about ?? org.summary ?? ''];

    return (
        <AiimPage
            title={investor ? 'Investor Preview' : 'Funder Preview'}
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: investor ? 'Investors' : 'Funders', href: base }, { label: org.name }]}
            heading={<>{investor ? 'Investor Preview' : 'Funder Preview'}<ListToggle list="saved" type={org.kind} itemKey={org.slug} saved={saved} variant="icon" /></>}
            subtitle={investor ? 'Detailed profile and investment intelligence.' : 'Comprehensive funder profile and funding intelligence.'}
            description={investor ? 'Comprehensive intelligence, focus areas, investment criteria, portfolio, and engagement information.' : 'Detailed mandate, focus areas, ticket sizes, portfolio and engagement information.'}
            actions={<ButtonLink href={base} size="sm" variant="outline">Back to Results</ButtonLink>}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <ListToggle list="watchlist" type={org.kind} itemKey={org.slug} saved={saved} variant="row" dark />
                        <FeeButton type={org.kind} itemKey={org.slug} variant="row" dark label={`Export ${investor ? 'Profile' : 'Funder Profile'} / Fees`} />
                        <CompareButton type={org.kind} itemKey={org.slug} variant="row" dark label={`Compare ${investor ? 'Investors' : 'Funders'}`} />
                    </RailBox>
                    <DeeperBox text={investor ? 'Unlock detailed reports, data rooms, financial models, and expert support.' : 'Unlock detailed reports, funding intelligence, pipeline access and expert support.'} />
                </>
            }
        >
            <section className="grid gap-4 lg:grid-cols-12">
                <div className="flex flex-wrap gap-4 rounded-[10px] bg-ink-950 p-4 text-parchment-100 lg:col-span-7">
                    <div className="flex size-28 shrink-0 items-center justify-center rounded-[8px] bg-white text-center text-lg font-bold tracking-widest text-ink-900">{org.shortName.toUpperCase().slice(0, 8)}</div>
                    <div className="min-w-0 flex-1">
                        <h2 className="flex flex-wrap items-center gap-2 text-2xl font-bold">{org.name}<Chip tone="good">{p.designation ?? org.type}</Chip></h2>
                        <p className="text-xs text-ink-300">{p.offices ?? org.location}</p>
                        <p className="mt-2 text-sm text-ink-200">{p.headline ?? org.summary}</p>
                        <dl className="mt-3 grid grid-cols-3 gap-3 text-xs sm:grid-cols-5">
                            {stats.map(([k, v]) => <div key={k}><dt className="text-ink-400">{k}</dt><dd className="font-semibold">{v ?? '—'}</dd></div>)}
                        </dl>
                        <div className="mt-3 flex flex-wrap gap-1.5"><Chip tone="good">Source Verified</Chip><VerificationChip label={org.evidence.verification} /><ConfidenceChip evidence={org.evidence} short /></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-[10px] bg-ink-950 p-4 text-parchment-100 lg:col-span-5">
                    {metrics.map(([k, v, s]) => <div key={k} className="text-xs"><p className="text-ink-400">{k}</p><p className="text-lg font-bold">{v ?? '—'}</p>{s && <p className="text-ink-400">{s}</p>}</div>)}
                    <div className="col-span-2 flex items-center justify-center gap-3 border-t border-ink-800 pt-3">
                        <ScoreRing value={org.score} size={90} dark />
                        <div className="text-xs"><p className="text-ink-400">AIIM {investor ? 'Engagement' : 'Match'} Score</p><p className="font-semibold text-verified-500">{org.score >= 90 ? 'High Match' : 'Good Match'}</p></div>
                    </div>
                </div>
            </section>
            <div className="mt-3"><EvidenceStrip evidence={org.evidence} /></div>

            <Tabs className="mt-4" tabs={tabs.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="mt-4">
                {tab === 'Overview' ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <SectionCard title={`About ${org.shortName}`}>
                            {about.map((a) => <p key={a} className="mb-2 text-xs text-ink-600">{a}</p>)}
                            <ul className="space-y-1 text-xs">{(p.bullets ?? []).map((b: string) => <li key={b} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{b}</li>)}</ul>
                            <div className="mt-3 flex gap-4 text-xs">
                                {p.website && <span className="flex items-center gap-1"><Globe className="size-3.5" />{p.website}</span>}
                                <span className="flex items-center gap-1"><Link2 className="size-3.5" />LinkedIn Profile</span>
                            </div>
                        </SectionCard>
                        <SectionCard title={investor ? 'Investment Focus Areas' : 'Funding Focus Areas'}><ul className="space-y-1.5 text-xs">{focusAreas.map((f) => <li key={f} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-gold-600" />{f}</li>)}</ul></SectionCard>
                        <SectionCard title={investor ? 'Geographic Focus' : 'Eligible Beneficiaries'}>
                            {investor ? (
                                <dl className="space-y-2 text-xs">{[['Primary', p.geo?.primary ?? org.origin], ['Secondary', p.geo?.secondary ?? '—'], ['Active In', p.geo?.active ?? p.countries ?? '—']].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                            ) : (
                                <ul className="space-y-1.5 text-xs">{(p.eligible ?? (org.beneficiaries ?? '').split(', ')).map((b: string) => <li key={b} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-gold-600" />{b}</li>)}</ul>
                            )}
                        </SectionCard>
                        <SectionCard title={investor ? 'Sector Allocation' : 'Top Sectors Funded'}>
                            {allocation.length ? <Donut data={allocation.map(([label, value]) => ({ label, value }))} size={110} /> : <p className="text-xs text-ink-500">Allocation data is part of the premium profile.</p>}
                            <p className="mt-2 text-[0.65rem] text-ink-400">{p.allocationNote ?? 'Based on portfolio companies'}</p>
                        </SectionCard>
                    </div>
                ) : tab.includes('Instrument') || tab.includes('Criteria') ? (
                    <SectionCard title={tab}>
                        <dl className="grid gap-3 text-sm sm:grid-cols-3">
                            <div><dt className="text-xs text-ink-500">Ticket size</dt><dd className="font-semibold">{org.ticket}</dd></div>
                            <div><dt className="text-xs text-ink-500">Stages</dt><dd className="font-semibold">{org.stages.join(', ')}</dd></div>
                            <div><dt className="text-xs text-ink-500">Instruments</dt><dd className="font-semibold">{org.instruments.join(', ')}</dd></div>
                        </dl>
                    </SectionCard>
                ) : tab.includes('Portfolio') || tab.includes('Recent') ? (
                    <SectionCard title={`${tab} — matching AIIM opportunities`}>
                        <ul className="divide-y divide-parchment-300 text-sm">{related.map((r) => <li key={r.slug} className="flex justify-between py-2"><Link href={`/aiim/opportunities/${r.slug}`} className="hover:text-gold-700">{r.name}</Link><span className="text-ink-500">{r.size}</span></li>)}</ul>
                    </SectionCard>
                ) : (
                    <SectionCard title={tab}>
                        <p className="text-sm text-ink-600">Contact pathways are controlled: TBCA shares a verified route only after both parties consent to an introduction (gate G10). Request an introduction through an advisory mandate.</p>
                        <ButtonLink href="/aiim/workspace/advisor-request" size="sm" className="mt-3">Request Introduction Support</ButtonLink>
                    </SectionCard>
                )}
            </div>
        </AiimPage>
    );
}
