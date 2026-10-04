import { Link } from '@inertiajs/react';
import { CalendarDays, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { BarList, Gauge } from '@/Components/Aiim/Charts';
import { Chip, levelTone, SyntheticNotice } from '@/Components/Aiim/Chips';
import { AdvisoryBox, CurrentStateBox, WorkspaceSnapshotBox } from '@/Components/Aiim/RailBoxes';
import AiimPage, { MoreLink, SectionCard } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    province: {
        slug: string; name: string; code: string; tagline: string; score: number;
        glance: { label: string; value: string; icon: string }[];
        kpis: Record<string, number | string>;
        economy: { label: string; value: number; display: string; warn?: boolean }[];
        evidence: { updated: string; confidence: number; verification: string; sources: string };
    };
    sectors: { slug: string; name: string; score: number; label: string }[];
    projects: ProjectItem[];
    grade: { grade: string; label: string; tone: string };
}

export default function Province({ province, sectors, projects, grade }: Props) {
    const k = province.kpis;
    const kpis: [string, string | number, string, string][] = [
        ['Investment Opportunities', k.opportunities, 'High Potential', 'target'], ['Active Projects', k.projects, 'Fundable', 'building-2'],
        ['Verified Investors', k.investors, `Active in ${province.name}`, 'users'], ['Funding Institutions', k.funders, 'Active Lenders', 'landmark'],
        ['Trade Corridors', k.corridors, 'Strategic Routes', 'route'], ['Priority Sectors', k.sectors, 'High Opportunity', 'trending-up'],
    ];
    const code = province.code;

    return (
        <AiimPage
            title={`${province.name} Province Profile`}
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: 'Province Selector', href: '/aiim/country/south-africa/provinces' }, { label: province.name }]}
            subtitle={province.tagline}
            description={`Comprehensive investment intelligence for ${province.name}: economic overview, key sectors, priority projects, infrastructure, risks and opportunities.`}
            notice={false}
            rail={<><WorkspaceSnapshotBox /><CurrentStateBox /><AdvisoryBox /></>}
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SyntheticNotice />
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><CalendarDays className="size-3.5" />Last Updated</p><p className="mt-1 font-semibold text-ink-900">{province.evidence.updated}</p></div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><ShieldCheck className="size-3.5" />Confidence Rating</p><p className="mt-1 font-semibold text-verified-700">{grade.label} · Grade {grade.grade}</p><p className="text-ink-500">{province.evidence.confidence} /100</p></div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="flex items-center gap-1.5 text-ink-500"><UserCheck className="size-3.5" />Verification Status</p><p className="mt-1 font-semibold text-ink-900">{province.evidence.verification}</p><p className="text-ink-500">Not AI-Only</p></div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
                {kpis.map(([l, v, c, icon]) => (
                    <div key={l} className="rounded-[8px] border border-ink-700 bg-ink-950 p-3 text-parchment-100">
                        <span className="text-gold-500"><AiimIcon name={icon} className="size-4" /></span>
                        <p className="mt-1 text-[0.65rem] text-ink-300">{l}</p>
                        <p className="text-xl font-bold">{v}</p>
                        <p className="text-[0.65rem] text-verified-500">{c}</p>
                    </div>
                ))}
                <div className="rounded-[8px] border border-ink-700 bg-ink-950 p-3 text-parchment-100">
                    <p className="text-[0.65rem] text-ink-300">Risk Outlook</p>
                    <p className="text-lg font-bold">{k.risk}</p>
                    <p className="text-[0.65rem] text-ink-400">Stable Trend</p>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <SectionCard title="Economic Snapshot">
                    <BarList data={province.economy.map((e) => ({ label: e.label, value: e.value, display: e.display, warn: e.warn }))} />
                    <p className="mt-3 flex justify-between text-[0.65rem] text-ink-400"><span>Source: {province.evidence.sources}</span><span className="text-verified-700">{grade.label} Confidence</span></p>
                </SectionCard>
                <SectionCard title="Top Opportunity Sectors" action={<MoreLink href={`/aiim/sectors?province=${province.slug}`}>View All Sectors</MoreLink>}>
                    <ol className="space-y-2 text-xs">
                        {sectors.map((s, i) => (
                            <li key={s.slug} className="flex items-center justify-between gap-2">
                                <Link href={`/aiim/sector/${s.slug}?province=${province.slug}`} className="flex-1 hover:text-gold-700"><span className="mr-2 font-bold text-gold-600">{i + 1}</span>{s.name}</Link>
                                <Chip tone={levelTone(s.label)}>{s.label.replace(' Opportunity', '')}</Chip>
                                <span className="w-14 text-right font-semibold">{s.score}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-3 text-[0.65rem] text-ink-400">Source: AIIM Sector Intelligence Engine</p>
                </SectionCard>
                <SectionCard title="Top Priority Projects (Preview)" action={<MoreLink href={`/aiim/projects?province=${province.slug}`}>View All Projects</MoreLink>}>
                    <ol className="space-y-2 text-xs">
                        {projects.map((p, i) => (
                            <li key={p.slug} className="flex items-center justify-between gap-2">
                                <Link href={`/aiim/projects/${p.slug}`} className="flex-1 hover:text-gold-700"><span className="mr-2 font-bold text-gold-600">{i + 1}</span>{p.name}</Link>
                                <Chip tone="dark">{p.sectorName.split(' ')[0]}</Chip>
                                <span className="font-semibold text-verified-700">{p.evidence.gradeLabel}</span>
                            </li>
                        ))}
                        {projects.length === 0 && <li className="text-ink-400">No projects published yet for this province.</li>}
                    </ol>
                    <p className="mt-3 text-[0.65rem] text-ink-400">Source: AIIM Project Intelligence · Human-Reviewed</p>
                </SectionCard>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <SectionCard title={`${province.name} at a Glance`} className="lg:col-span-2">
                    <dl className="grid gap-x-6 sm:grid-cols-2">
                        {province.glance.map((g) => <div key={g.label} className="flex justify-between border-b border-parchment-300 py-1.5 text-xs"><dt className="text-ink-500">{g.label}</dt><dd className="font-semibold">{g.value}</dd></div>)}
                    </dl>
                </SectionCard>
                <SectionCard title="Opportunity Score"><Gauge dark={false} value={province.score} label="Province Opportunity Score" /></SectionCard>
            </div>

            <section className="mt-5 flex flex-wrap items-center gap-4 rounded-[10px] border border-gold-700/40 bg-ink-900 p-5 text-parchment-100">
                <Lock className="size-8 text-gold-500" />
                <div className="min-w-[12rem] flex-1">
                    <h2 className="font-semibold">Unlock deeper intelligence</h2>
                    <p className="text-xs text-ink-300">Access detailed reports, verified data, investor lists and downloadable intelligence.</p>
                </div>
                {[['Detailed Province Report', `AIIM-PROV-${code}-RPT`], ['Investor & Partner List', `AIIM-PROV-${code}-INV`], ['Risk & Opportunity Report', `AIIM-PROV-${code}-RSK`]].map(([l, c]) => (
                    <div key={c} className="text-xs"><p className="font-semibold">{l}</p><p className="text-ink-400">{c}</p></div>
                ))}
                <ButtonLink href={`/aiim/store?category=Provinces&q=${encodeURIComponent(province.name)}`} size="sm" trailingIcon="arrow-right">Upgrade to Premium</ButtonLink>
            </section>
        </AiimPage>
    );
}
