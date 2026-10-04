import { Link } from '@inertiajs/react';
import { CalendarDays, FileText, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { CompareButton, ListToggle } from '@/Components/Aiim/Actions';
import { BarList, Gauge } from '@/Components/Aiim/Charts';
import { Chip, levelTone, LockedTag, riskTone, SyntheticNotice } from '@/Components/Aiim/Chips';
import { AdvisoryBox } from '@/Components/Aiim/RailBoxes';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem } from '@/types/aiim';

interface Profile {
    tagline: string; intro: string;
    overview: { label: string; text: string }[];
    performance: [string, number][];
    kpis: Record<string, number>;
    subsectors: [string, string][];
    topOpportunities: [string, string, string][];
    risks: [string, string][];
    riskLevel: string;
    evidence: { coverage: string; confidence: number; verification: string; refreshed: string; humanReview: string; nextReview: string; updated: string };
}

interface Props extends AiimPageProps {
    sector: { slug: string; name: string; icon: string; summary: string; profile: Profile; score: number; label: string };
    province: { slug: string; name: string } | null;
    grade: { grade: string; label: string };
    opportunities: ProjectItem[];
    saved: string[];
}

export default function Sector({ sector, province, grade, opportunities, saved }: Props) {
    const p = sector.profile;
    const where = province ? ` in ${province.name}` : '';
    const top = p.topOpportunities.length ? p.topOpportunities : opportunities.map((o) => [o.name, o.type, o.level] as [string, string, string]);

    return (
        <AiimPage
            title={`${sector.name} Sector Profile`}
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, ...(province ? [{ label: province.name, href: `/aiim/province/${province.slug}` }] : []), { label: 'Sector Selector', href: `/aiim/sectors${province ? `?province=${province.slug}` : ''}` }, { label: sector.name }]}
            subtitle={p.tagline}
            description={p.intro}
            notice={false}
            actions={<ButtonLink href={`/aiim/sectors${province ? `?province=${province.slug}` : ''}`} size="sm" variant="outline">Back to Sector Selector</ButtonLink>}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Next Steps">
                        <p className="mb-3 text-xs text-ink-300">Take action to explore opportunities, compare sectors, and connect with our expert advisors.</p>
                        <div className="space-y-2">
                            <ButtonLink href={`/aiim/opportunities?sector=${sector.slug}${province ? `&province=${province.slug}` : ''}`} size="sm" className="w-full" trailingIcon="arrow-right">View Opportunities</ButtonLink>
                            <ButtonLink href={`/aiim/sectors${province ? `?province=${province.slug}` : ''}`} size="sm" variant="outline-light" className="w-full">Compare Sector</ButtonLink>
                            <ListToggle list="saved" type="sector" itemKey={sector.slug} saved={saved} dark />
                        </div>
                    </RailBox>
                    <AdvisoryBox />
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <SyntheticNotice />
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><CalendarDays className="size-3.5" />Last Updated</p><p className="mt-1 font-semibold">{p.evidence.updated}</p></div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><ShieldCheck className="size-3.5" />Confidence Rating</p><p className="mt-1 text-lg font-bold">{p.evidence.confidence}%</p><p className="text-verified-700">{grade.label} Confidence · Grade {grade.grade}</p></div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><UserCheck className="size-3.5" />Verification Status</p><p className="mt-1 font-semibold">{p.evidence.verification}</p><p className="text-ink-500">AI + Human Validation</p></div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><FileText className="size-3.5" />Report Access</p><p className="mt-1 font-semibold">Free Discovery</p><p className="text-ink-500">Standard Access</p></div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-12">
                <SectionCard number={1} title="Sector Overview" className="lg:col-span-4">
                    <ul className="space-y-2 text-xs text-ink-600">{p.overview.map((o) => <li key={o.label}><strong className="text-ink-900">{o.label}:</strong> {o.text}</li>)}</ul>
                </SectionCard>
                <SectionCard dark number={2} title="Sector Performance Overview" className="lg:col-span-4">
                    <BarList dark data={p.performance.map(([label, value]) => ({ label, value }))} />
                </SectionCard>
                <div className="grid grid-cols-2 gap-3 lg:col-span-4">
                    {[['Active Projects', p.kpis.projects, 'High Activity'], ['Verified Investors', p.kpis.investors, 'Active Mandates'], ['Funding Institutions', p.kpis.funders, 'Active Lenders'], ['Priority Use Cases', p.kpis.useCases, 'High Demand']].map(([l, v, c]) => (
                        <div key={l as string} className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="text-ink-500">{l}</p><p className="text-xl font-bold">{v}</p><p className="text-verified-700">{c}</p></div>
                    ))}
                    <div className="col-span-2 rounded-[8px] border border-gold-400 bg-gold-50 p-3 text-xs"><p className="text-ink-600">Sector Opportunity Score</p><p className="text-2xl font-bold">{sector.score}<span className="text-xs"> /100</span></p><p className="font-semibold text-verified-700">{sector.label}</p></div>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-4">
                <SectionCard number={3} title="Priority Subsectors">
                    <ul className="space-y-1.5 text-xs">{p.subsectors.map(([s, l]) => <li key={s} className="flex justify-between"><span>{s}</span><Chip tone={levelTone(l)}>{l}</Chip></li>)}</ul>
                </SectionCard>
                <SectionCard number={4} title="Top Opportunities (Preview)">
                    <ul className="space-y-1.5 text-xs">
                        {top.slice(0, 6).map(([n, t, l]) => <li key={n} className="flex items-center justify-between gap-2"><span className="flex-1">{n}</span><Chip tone="dark">{t}</Chip><Chip tone={levelTone(l)}>{l.replace(' Opportunity', '')}</Chip></li>)}
                    </ul>
                    {opportunities[0] && <div className="mt-2 flex gap-2"><CompareButton type="opportunity" itemKey={opportunities[0].slug} label="Compare top item" /></div>}
                </SectionCard>
                <SectionCard number={5} title="Key Risks & Constraints">
                    <ul className="space-y-1.5 text-xs">{p.risks.map(([r, l]) => <li key={r} className="flex justify-between gap-2"><span>{r}</span><Chip tone={riskTone(l)}>{l}</Chip></li>)}</ul>
                    <div className="mt-2 flex items-center justify-between"><span className="text-xs">Risk Level <strong>{p.riskLevel}</strong></span><Gauge dark={false} value={p.riskLevel === 'High' ? 75 : 50} invert /></div>
                </SectionCard>
                <SectionCard number={6} title="Evidence Snapshot">
                    <dl className="space-y-1 text-xs">
                        {[['Source Coverage', p.evidence.coverage], ['Confidence', `${p.evidence.confidence}%`], ['Verification', p.evidence.verification], ['Last Refreshed', p.evidence.refreshed], ['Human Review', p.evidence.humanReview], ['Next Review', p.evidence.nextReview]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                    </dl>
                    <ButtonLink href="/aiim/methodology" size="sm" variant="outline" className="mt-3 w-full">View Sources & Methodology</ButtonLink>
                </SectionCard>
            </div>

            <section className="mt-5 rounded-[10px] border border-gold-700/40 bg-ink-900 p-4 text-parchment-100">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold-400"><Lock className="size-4" />Premium Intelligence (Preview)</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[['Detailed Sector Report', 'Comprehensive market sizing, forecasts, deep-dive analysis, and competitive landscape.'], ['Investor & Partner List', 'Curated list of active investors, strategic partners, and ecosystem enablers.'], ['Risk & Opportunity Report', 'Detailed risk assessment, mitigation strategies, and opportunity mapping.']].map(([t, d]) => (
                        <div key={t} className="rounded-[8px] border border-ink-700 p-3 text-xs"><p className="font-semibold">{t}</p><p className="mt-1 text-ink-300">{d}</p><div className="mt-2"><LockedTag /></div></div>
                    ))}
                    <div className="rounded-[8px] border border-ink-700 p-3 text-xs"><p className="font-semibold">Custom Intelligence</p><p className="mt-1 text-ink-300">Tailored research, data extracts, and bespoke advisory support.</p><Link href="/aiim/custom-intelligence" className="mt-2 inline-block text-gold-400 underline">Request Custom Intelligence</Link></div>
                    <div className="rounded-[8px] border border-gold-500 bg-gold-500/10 p-3 text-xs"><p className="font-semibold text-gold-300">Unlock Premium Intelligence</p><p className="mt-1 text-ink-300">Upgrade your access to view full reports, datasets, and expert insights{where}.</p><ButtonLink href="/aiim/store?category=Sectors" size="sm" className="mt-2 w-full">Upgrade to Premium</ButtonLink></div>
                </div>
            </section>
        </AiimPage>
    );
}
