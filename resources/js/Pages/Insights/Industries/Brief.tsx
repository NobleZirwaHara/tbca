import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Download, Lock } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, Chip, DarkKpis, SmallLink, zar } from '@/Components/Insights/Shared';
import type { SharedProps } from '@/types';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    owned: boolean;
    subSectors: { name: string; text: string | null; score: number }[];
}

const TABS = ['Executive Summary', 'Market Overview', 'Opportunity Landscape', 'Policy & Incentives', 'Risks & Red Flags', 'Trade & Corridors', 'Data Sources', 'Methodology'];

export default function SectorBrief({ industry: ind, context, owned, subSectors }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [tab, setTab] = useState(TABS[0]);
    const p = ind.profile;
    const locked = !owned && tab !== TABS[0];

    const purchase = () => (auth.user ? router.post(`/industries/sector-intelligence/${ind.slug}/purchase`) : router.get('/login'));

    return (
        <IndustryFrame
            title={`${ind.name} – Sector Intelligence Brief`}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: 'Sector Intelligence' }, { label: ind.name }]}
            sidebar={
                <>
                    <ContextCard context={context} rows={[['Classification', 'To be verified'], ['Complexity Class', ind.complexityLabel], ['Human Gate', ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory']]} />
                    <Box tone="dark" title="Unlock Full Intelligence">
                        <p className="text-xs text-ink-200">Premium intelligence includes full data, benchmarks, project details, risk analysis, investor insights and methodology.</p>
                        {owned ? (
                            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-verified-500"><CheckCircle2 className="size-4" /> You own this brief</p>
                        ) : (
                            <button type="button" onClick={purchase} className="mt-3 w-full rounded-[4px] bg-gold-500 px-3 py-2 text-xs font-bold text-ink-900 uppercase">Buy Brief – {zar(p.brief.price)} →</button>
                        )}
                    </Box>
                    <NextSteps items={['Run a sector-adapted diagnostic.', 'View benchmark preview.', 'Book a discovery call with a TBCA Advisor.', 'Explore services for this industry.']} cta={{ label: 'View Next Steps', href: `/industries/${ind.slug}/diagnostic` }} />
                    <AdvisorCard title="Need Expert Guidance?" text="Speak to a TBCA Advisor for tailored advice and market support." />
                </>
            }
        >
            <Chip tone="green">AIIM Sector Intelligence</Chip>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                    <h1 className="flex flex-wrap items-center gap-3 font-serif text-3xl font-bold text-ink-900">{ind.name} <Chip tone="gold">Premium Intelligence</Chip></h1>
                    <p className="font-serif text-xl text-gold-700">Sector Intelligence Brief</p>
                    <p className="mt-2 text-sm text-ink-700">Comprehensive intelligence, trends, and opportunity analysis for {ind.name} across Africa.</p>
                    <p className="text-xs text-ink-500">This brief is sourced, verified and continuously updated to support investment, trade and project decisions.</p>
                </div>
                <StatusChips items={[{ label: 'Industry', value: ind.name }, { label: 'Complexity Class', value: ind.complexityLabel }, { label: 'Brief Version', value: 'v1.0' }, { label: 'Last Updated', value: p.brief.updated }, { label: 'Source Status', value: 'Verified' }]} />
            </div>

            <Tabs className="mt-5" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />

            <div className="mt-4">
                <DarkKpis
                    items={[
                        { label: 'Sector Opportunity Score', value: <>{p.kpis.opportunity}<span className="text-xs text-ink-300"> /100</span></>, caption: p.kpis.opportunityLabel, accent: true },
                        { label: 'Market Size (Africa)', value: owned ? '$298B' : <Lock className="size-5 text-ink-400" />, caption: 'Estimated 2024', icon: 'coins' },
                        { label: 'Projected CAGR', value: '6.7%', caption: '2024 – 2030', icon: 'trending-up' },
                        { label: 'Import Dependence', value: owned ? '41%' : <Lock className="size-5 text-ink-400" />, caption: 'Key commodities', icon: 'truck' },
                        { label: 'Investable Projects', value: p.kpis.projects * 13, caption: 'Active Pipeline', icon: 'package' },
                        { label: 'Coverage Index', value: '84%', caption: 'Data Completeness', icon: 'shield-check' },
                    ]}
                />
            </div>

            {locked ? (
                <Box className="mt-4" tone="gold" title={`${tab} – premium section`}>
                    <p className="text-sm text-ink-700">This section is part of the full {p.brief.title} ({p.brief.pages} pages). Purchase once to unlock every section, data tables and the downloadable PDF.</p>
                    <button type="button" onClick={purchase} className="mt-3 rounded-[4px] bg-gold-500 px-4 py-2 text-xs font-bold uppercase">Unlock for {zar(p.brief.price)} →</button>
                </Box>
            ) : (
                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <Box title="Sector Snapshot">
                        <p className="text-xs text-ink-600">{ind.description} The sector offers strong opportunities across {ind.subIndustries.slice(0, 3).map((s) => s.name.toLowerCase()).join(', ')} and related services.</p>
                        <ul className="mt-3 space-y-2 text-xs">
                            {[['Strong demand fundamentals', 'Rising population, urbanisation and demand growth.'], ['High export potential', 'Regional and global export corridors.'], ['Value-addition opportunity', 'Processing, packaging, branding and technology adoption.'], ['Policy priority sector', 'Supported through incentives, credit schemes and infrastructure.']].map(([t, s]) => (
                                <li key={t} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" /><span><strong>{t}</strong><span className="block text-ink-500">{s}</span></span></li>
                            ))}
                        </ul>
                    </Box>
                    <Box title="Top Sub-Sectors by Opportunity">
                        <ol className="space-y-2.5 text-xs">
                            {subSectors.map((s, i) => (
                                <li key={s.name} className="flex items-start gap-2">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gold-500 text-[0.625rem] font-bold">{i + 1}</span>
                                    <span className="flex-1"><strong>{s.name}</strong><span className="block text-ink-500">{s.text}</span></span>
                                    <span className="font-bold text-verified-700">{s.score}<span className="text-ink-400">/100</span></span>
                                </li>
                            ))}
                        </ol>
                    </Box>
                    <Box title="Key Opportunities">
                        <ul className="space-y-2 text-xs">{p.opportunities.slice(0, 5).map((o) => <li key={o.title}><strong>{o.title}</strong><span className="block text-ink-500">{o.text}</span></li>)}</ul>
                        <SmallLink className="mt-3" href={`/industries/${ind.slug}/country/south-africa`}>View opportunity landscape</SmallLink>
                    </Box>
                </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Box title="Quick Facts">
                    <dl className="space-y-1.5 text-xs">
                        {[['Countries Covered', '54 African Countries'], ['Data Sources', '28 Verified Sources'], ['Languages', 'EN, AF'], ['Currency View', 'USD, ZAR, XOF, EUR'], ['Update Frequency', 'Weekly / Monthly'], ['Methodology', 'AIIM v1.0'], ['Confidence Level', p.kpis.confidence]].map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-parchment-200 pb-1"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
                        ))}
                    </dl>
                    {owned && <a href={`/resources/library?q=${encodeURIComponent(ind.name.split(' ')[0])}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700"><Download className="size-4" /> Related downloadable resources</a>}
                </Box>
                <Box title="Related AIIM Resources">
                    <ul className="space-y-2 text-xs">
                        {[['Country Opportunity Profiles', 'Compare countries by sector potential.', '/aiim'], ['Trade & Corridor Intelligence', 'Export routes, trade flows and corridors.', '/aiim/corridors'], ['Project Pipeline Explorer', 'Browse investable projects.', '/aiim'], ['Investor Matching Engine', 'Find investors focused on this sector.', '/aiim']].map(([t, s, h]) => (
                            <li key={t}><Link href={h} className="font-semibold text-ink-900 hover:text-gold-700">{t}</Link><span className="block text-ink-500">{s}</span></li>
                        ))}
                    </ul>
                </Box>
            </div>
        </IndustryFrame>
    );
}
