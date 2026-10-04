import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Download, Map, Share2 } from 'lucide-react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { BarList, Donut, Gauge } from '@/Components/Aiim/Charts';
import { SyntheticNotice } from '@/Components/Aiim/Chips';
import AiimPage, { CtaBand, SectionCard } from '@/Components/Aiim/Shell';
import SaMap from '@/Components/Aiim/SaMap';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    content: {
        kpis: [string, string, string, string][];
        topSectors: string[];
        opportunityScore: number;
        risk: { score: number; label: string; split: [string, number][] };
    };
    provinces: { slug: string; name: string; score: number }[];
}

export default function Cockpit({ content, provinces }: Props) {
    const { snapshot } = usePage<Props>().props;
    const share = () => void navigator.clipboard?.writeText(window.location.href);

    return (
        <AiimPage
            title="South Africa Investor Cockpit"
            tone="dark"
            crumbs={[{ label: 'South Africa' }]}
            heading={<><span aria-hidden="true">🇿🇦</span> South Africa Investor Cockpit</>}
            subtitle="Your live intelligence dashboard for South Africa"
            description="Key investment signals, sectors, projects, investors, trade flows, risks and opportunities across all 9 provinces. Phase 1 active country."
            notice={false}
            actions={
                <div className="flex flex-wrap gap-2">
                    <ButtonLink href="/aiim" size="sm" variant="outline-light" icon="globe">Change Country</ButtonLink>
                    <button type="button" onClick={share} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Share2 className="size-4" />Share</button>
                    <Link href="/aiim/store/SA-IC-2025" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Download className="size-4" />Download Brief</Link>
                </div>
            }
            rail={false}
        >
            <SyntheticNotice className="mb-4 max-w-md" />
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2 xl:grid-cols-4 xl:col-span-5">
                    {content.kpis.map(([label, value, caption, icon]) => (
                        <div key={label} className="rounded-[8px] border border-gold-700/40 bg-ink-900 p-3">
                            <span className="text-gold-500"><AiimIcon name={icon} className="size-4" /></span>
                            <p className="mt-1 text-[0.6875rem] text-ink-300">{label}</p>
                            <p className="text-lg font-bold text-parchment-100">{value}</p>
                            <p className="text-[0.6875rem] text-verified-500">{caption}</p>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-4">
                    <SaMap provinces={provinces} />
                    <div className="mt-2 text-center"><Link href="/aiim/country/south-africa/provinces" className="inline-flex items-center gap-1 text-xs text-gold-400 hover:underline"><Map className="size-3.5" />Open Province Selector</Link></div>
                </div>
                <SectionCard dark title="Province Opportunity Heatmap" className="lg:col-span-3">
                    <BarList dark data={provinces.map((p) => ({ label: p.name, value: p.score }))} />
                    <p className="mt-2 text-center text-[0.65rem] text-ink-400">Score /100</p>
                </SectionCard>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <SectionCard dark title="Top Opportunity Sectors">
                    <ol className="space-y-1.5 text-sm text-ink-200">{content.topSectors.map((s, i) => <li key={s}><span className="mr-2 text-gold-500">{i + 1}</span>{s}</li>)}</ol>
                    <ButtonLink href="/aiim/sectors" size="sm" variant="outline-light" className="mt-3 w-full">View All Sectors</ButtonLink>
                </SectionCard>
                <SectionCard dark title="Top Provinces by Score">
                    <ol className="space-y-1.5 text-sm text-ink-200">
                        {provinces.slice(0, 5).map((p, i) => <li key={p.slug} className="flex justify-between"><Link href={`/aiim/province/${p.slug}`} className="hover:text-gold-400"><span className="mr-2 text-gold-500">{i + 1}</span>{p.name}</Link><span>{p.score}</span></li>)}
                    </ol>
                    <ButtonLink href="/aiim/country/south-africa/provinces" size="sm" variant="outline-light" className="mt-3 w-full">View All Provinces</ButtonLink>
                </SectionCard>
                <SectionCard dark title="Opportunity Score"><Gauge value={content.opportunityScore} label="Moderate-High Opportunity" /></SectionCard>
                <SectionCard dark title="Risk Snapshot">
                    <Donut dark centre={`${content.risk.score} /5`} sub={content.risk.label} data={content.risk.split.map(([label, value]) => ({ label, value }))} size={110} />
                </SectionCard>
                <SectionCard dark title="Saved & Watchlists">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        {[['Saved Items', snapshot?.saved], ['Watchlist', snapshot?.watchlist], ['Comparisons', snapshot?.comparisons], ['Custom Reports', snapshot?.reports]].map(([l, v]) => (
                            <div key={l as string} className="rounded border border-ink-700 p-2"><p className="text-[0.65rem] text-ink-400">{l}</p><p className="text-lg font-bold">{v ?? '—'}</p></div>
                        ))}
                    </div>
                    <ButtonLink href={snapshot ? '/aiim/workspace' : '/aiim/register'} size="sm" variant="outline-light" className="mt-3 w-full">{snapshot ? 'Go to My Workspace' : 'Create Free Account'}</ButtonLink>
                </SectionCard>
            </div>

            <SectionCard dark title="Quick Actions" className="mt-5">
                <ul className="grid gap-1 sm:grid-cols-3">
                    {[['Explore Opportunities', '/aiim/opportunities'], ['View Projects', '/aiim/projects'], ['Find Investors', '/aiim/investors'], ['Find Funders', '/aiim/funders'], ['Trade Corridor Map', '/aiim/corridors'], ['Risk & Outlook', '/aiim/risk']].map(([l, h]) => (
                        <li key={h}><Link href={h} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-ink-800">{l}<ArrowRight className="size-4 text-gold-500" /></Link></li>
                    ))}
                </ul>
            </SectionCard>
            <CtaBand title="Need deeper intelligence or human insight?" text="Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory." />
        </AiimPage>
    );
}
