import { Link, router } from '@inertiajs/react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { BarList } from '@/Components/Aiim/Charts';
import { SyntheticNotice } from '@/Components/Aiim/Chips';
import { AdvisoryBox } from '@/Components/Aiim/RailBoxes';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    province: { slug: string; name: string; kpis: Record<string, number | string> };
    sectors: { slug: string; name: string; icon: string; summary: string; score: number; rank: number; label: string }[];
    provinces: { slug: string; name: string }[];
}

export default function Sectors({ province, sectors, provinces }: Props) {
    const top = sectors[0];
    return (
        <AiimPage
            title="Select a Sector"
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: province.name, href: `/aiim/province/${province.slug}` }, { label: 'Sector Selector' }]}
            subtitle={`Explore investment opportunities across ${province.name}'s key sectors`}
            description="Choose a sector to view detailed intelligence, market potential, priority projects, investors, funders, and risk insights."
            notice={false}
            actions={
                <div className="flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="province-switch">Province</label>
                    <select id="province-switch" value={province.slug} onChange={(e) => router.get('/aiim/sectors', { province: e.target.value })} className="h-9 rounded border border-parchment-500 bg-white px-2 text-sm">
                        {provinces.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                    </select>
                    <ButtonLink href={`/aiim/province/${province.slug}`} size="sm" variant="outline">Back to Province</ButtonLink>
                </div>
            }
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Next Steps">
                        <p className="mb-3 text-xs text-ink-300">Select a sector to explore opportunities, projects, investors, funders, and sector-specific intelligence.</p>
                        <ButtonLink href={`/aiim/opportunities?province=${province.slug}`} size="sm" className="w-full" trailingIcon="arrow-right">View All Opportunities</ButtonLink>
                    </RailBox>
                    <AdvisoryBox />
                </>
            }
        >
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-5">
                    <SyntheticNotice />
                    <div className="grid grid-cols-3 gap-3">
                        {[['Active Projects', province.kpis.projects, 'Fundable'], ['Verified Investors', province.kpis.investors, 'Active Mandates'], ['Funding Institutions', province.kpis.funders, 'Active Lenders']].map(([l, v, c]) => (
                            <div key={l as string} className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs"><p className="text-ink-500">{l} in {province.name}</p><p className="text-xl font-bold text-ink-900">{v}</p><p className="text-gold-700">{c}</p></div>
                        ))}
                    </div>
                </div>
                <SectionCard dark title={`${province.name} Sector Performance Overview`} className="lg:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                        {top && <div><p className="text-xs text-ink-400">Top Sector by Opportunity Score</p><p className="font-semibold text-verified-500">{top.name}</p><p className="text-3xl font-bold">{top.score}<span className="text-xs text-ink-400"> /100</span></p></div>}
                        <BarList dark data={sectors.map((s) => ({ label: s.name, value: s.score }))} />
                    </div>
                </SectionCard>
            </div>

            <h2 className="mt-6 mb-3 text-xl font-semibold text-ink-900">Explore Sectors in {province.name}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {sectors.map((s) => (
                    <li key={s.slug}>
                        <Link href={`/aiim/sector/${s.slug}?province=${province.slug}`} className="flex h-full gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 transition-colors hover:border-gold-500">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-gold-400">{s.rank}</span>
                            <span className="min-w-0">
                                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900"><AiimIcon name={s.icon} className="size-4 text-gold-600" />{s.name}</span>
                                <span className="mt-0.5 block text-xs text-ink-500">{s.summary}</span>
                                <span className="mt-2 block text-xl font-bold text-verified-700">{s.score}<span className="text-xs font-normal text-ink-400"> /100</span></span>
                                <span className="text-xs font-semibold text-ink-700">{s.label}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </AiimPage>
    );
}
