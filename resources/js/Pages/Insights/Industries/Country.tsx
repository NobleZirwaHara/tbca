import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { CheckCircle2, Info } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, DarkKpis, Status } from '@/Components/Insights/Shared';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    country: { slug: string; name: string; code: string; phase: string; status: string };
    countries: { slug: string; name: string }[];
}

const TABS = ['Overview', 'Sub-Sectors', 'Market Overview', 'Regulatory Landscape', 'Incentives & Support', 'Risks & Red Flags', 'TBCA Relevance', 'Service Coverage', 'Data Sources'];

export default function IndustryCountry({ industry: ind, context, country, countries }: Props) {
    const [tab, setTab] = useState('Overview');
    const agriZa = ind.slug === 'agriculture-agro-industry' && country.code === 'ZA';
    const priorities = ['High Priority', 'High Priority', 'High Priority', 'Medium Priority', 'Emerging', 'Emerging', 'Emerging'];
    const regulatory = agriZa
        ? [['Agricultural Product Standards Act', 'Applicable'], ['Foodstuffs, Cosmetics & Disinfectants Act', 'Applicable'], ['Water Use Licence (NWA)', 'Potential'], ['Environmental Authorisation (NEMA)', 'Potential'], ['Land Use Compliance', 'Check Local'], ['Labour Regulations (Agricultural Sector)', 'Applicable'], ['Organic Certification (Optional)', 'Available']]
        : [['Companies Act / company registration', 'Applicable'], ['Sector licensing and permits', 'Potential'], ['Tax registration and VAT', 'Applicable'], ['Environmental authorisation', 'Potential'], ['Labour regulations', 'Applicable'], ['Data protection (POPIA or local equivalent)', 'Applicable']];
    const highlights = agriZa
        ? ['Strong domestic demand and growing middle class.', 'Favourable climate zones with diverse production regions.', 'Key export markets: SADC, EU, Middle East, Asia.', 'Government focus on food security, rural development and agro-industrialisation.', 'Infrastructure gaps remain in logistics, storage and processing capacity.']
        : [`Established demand base for ${ind.name.toLowerCase()} in ${country.name}.`, 'Regional trade corridors support growth.', 'Policy attention on jobs, investment and localisation.', 'Infrastructure and skills gaps remain constraints.'];
    const show = (t: string) => tab === 'Overview' || tab === t;

    return (
        <IndustryFrame
            title={`${country.name} × ${ind.name}`}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Countries', href: '/countries' }, { label: country.name }, { label: 'Industries', href: '/industries' }, { label: ind.name }]}
            sidebar={
                <>
                    <ContextCard title="Your Intersection Context" context={{ ...context, countryName: country.name }} rows={[['Intersection Status', country.status], ['Complexity Class', ind.complexityLabel], ['Human Gate', ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory'], ['Visible Fees', 'T / P / X / S']]} />
                    <NextSteps items={['Run a sector-adapted diagnostic.', 'View benchmarking preview.', 'Identify relevant incentives.', 'Speak to a TBCA Advisor.']} cta={{ label: 'View Next Steps', href: `/industries/${ind.slug}/diagnostic` }} />
                    <AdvisorCard title="Need Expert Guidance?" text="Speak to a TBCA Advisor for tailored advice and professional routing." />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                    <h1 className="font-serif text-3xl font-bold text-ink-900">{country.name} × {ind.name}</h1>
                    <p className="font-semibold text-gold-700">Industry-Country Intersection Overview</p>
                    <p className="mt-1 text-sm text-ink-600">Understand how {ind.name} operates in {country.name} today, including market scale, priority sub-sectors, regulatory context, incentives and TBCA service coverage.</p>
                    <label className="mt-2 inline-flex items-center gap-2 text-xs">
                        Switch country
                        <select value={country.slug} onChange={(e) => router.get(`/industries/${ind.slug}/country/${e.target.value}`)} className="h-8 rounded border border-parchment-500 bg-white px-2">
                            {countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                        </select>
                    </label>
                </div>
                <StatusChips items={[{ label: 'Industry', value: ind.name }, { label: 'Country', value: country.name }, { label: 'Phase', value: country.phase }, { label: 'Data Currency', value: ind.profile.kpis.nextUpdate }, { label: 'Confidence', value: ind.profile.kpis.confidence }]} />
            </div>

            <div className="mt-5">
                <DarkKpis
                    items={
                        agriZa
                            ? [
                                  { label: 'Industry Contribution to GDP (2024 Est.)', value: '2.7%', caption: '≈ R243B', icon: 'coins' },
                                  { label: 'Employment Contribution (2024 Est.)', value: '8.3%', caption: '≈ 940,000 Jobs', icon: 'users' },
                                  { label: 'Export Value (2024 Est.)', value: 'R185B', caption: '+6.2% vs 2023', icon: 'trending-up' },
                                  { label: 'Registered Businesses (Primary SIC)', value: '86,213', caption: 'Active Enterprises', icon: 'building' },
                                  { label: 'Priority Status (SA)', value: 'High Priority', caption: 'Food Security, Jobs, Exports' },
                                  { label: 'TBCA Coverage', value: `${ind.approvedServices} Services`, caption: `+${ind.profile.diagnostics.length} Diagnostics`, icon: 'shield-check' },
                              ]
                            : [
                                  { label: 'Opportunity Score', value: ind.profile.kpis.opportunity, caption: ind.profile.kpis.opportunityLabel, accent: true },
                                  { label: 'Active Projects', value: ind.profile.kpis.projects, caption: 'Fundable', icon: 'package' },
                                  { label: 'Investor Mandates', value: ind.profile.kpis.mandates, caption: 'Active', icon: 'users' },
                                  { label: 'Funding Institutions', value: ind.profile.kpis.institutions, caption: 'Lenders / Funds', icon: 'landmark' },
                                  { label: 'Intersection Status', value: country.status, caption: country.phase },
                                  { label: 'TBCA Coverage', value: `${ind.approvedServices} Services`, caption: `+${ind.profile.diagnostics.length} Diagnostics`, icon: 'shield-check' },
                              ]
                    }
                />
            </div>

            <Tabs className="mt-5" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {show('Sub-Sectors') && (
                    <Box title={`Priority Sub-Sectors in ${country.name}`}>
                        <ul className="space-y-2.5 text-xs">
                            {ind.subIndustries.map((s, i) => (
                                <li key={s.code} className="flex justify-between gap-2"><span><strong>{s.name}</strong><span className="block text-ink-500">{s.description}</span></span><span className="text-[0.6875rem] font-semibold whitespace-nowrap text-verified-700">{priorities[i] ?? 'Emerging'}</span></li>
                            ))}
                        </ul>
                    </Box>
                )}
                {show('Market Overview') && (
                    <Box title={`Market Highlights (${country.name})`}>
                        <ul className="space-y-2 text-xs">{highlights.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" />{h}</li>)}</ul>
                    </Box>
                )}
                {show('Regulatory Landscape') && (
                    <Box title="Regulatory & Policy Snapshot">
                        <ul className="space-y-2 text-xs">{regulatory.map(([r, s]) => <li key={r} className="flex items-center justify-between gap-2"><span>{r}</span><Status value={s} /></li>)}</ul>
                    </Box>
                )}
                {(show('TBCA Relevance') || tab === 'Service Coverage') && (
                    <Box title={`TBCA in ${country.name}`}>
                        <p className="text-xs text-ink-600">TBCA provides sector-adapted diagnostics, intelligence and professional-route advisory specific to {country.name} conditions.</p>
                        <ul className="mt-2 space-y-1.5 text-xs">
                            <li>{ind.approvedServices} Curated Services</li>
                            <li>{ind.profile.diagnostics.length} Sector Diagnostics</li>
                            <li>5 Intelligence Products</li>
                            <li>Qualified Partner Routes</li>
                        </ul>
                        <Link href={`/industries/${ind.slug}`} className="mt-3 block rounded border border-ink-300 py-1.5 text-center text-xs font-bold uppercase">Explore Services →</Link>
                        <p className="mt-3 flex gap-1.5 rounded bg-controlled-50 p-2 text-[0.6875rem] text-controlled-700"><Info className="size-4 shrink-0" /> Some services may require regulatory permissions or professional partner engagements before delivery.</p>
                    </Box>
                )}
                {['Incentives & Support', 'Risks & Red Flags', 'Data Sources'].includes(tab) && (
                    <Box title={tab} className="md:col-span-2">
                        <p className="text-sm text-ink-600">
                            {tab === 'Incentives & Support' && 'Incentive programmes, development finance and grant schemes are mapped in the Sector Intelligence Brief. Your advisor confirms eligibility for your exact scope.'}
                            {tab === 'Risks & Red Flags' && 'Key risks include input-cost volatility, logistics and infrastructure gaps, regulatory change and climate exposure. Each flag is evidence-tracked with source and confidence.'}
                            {tab === 'Data Sources' && 'Official statistics, customs trade data, regulator publications and verified private market reports. Every figure carries source, date and confidence grade.'}
                        </p>
                        <Link href={`/industries/sector-intelligence/${ind.slug}`} className="mt-3 inline-block text-xs font-semibold text-gold-700">Open the Sector Intelligence Brief →</Link>
                    </Box>
                )}
            </div>
        </IndustryFrame>
    );
}
