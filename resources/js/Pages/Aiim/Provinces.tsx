import { Link, router } from '@inertiajs/react';
import { ArrowRight, MousePointerClick, Search, Zap } from 'lucide-react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { AdvisoryBox, CurrentStateBox, WorkspaceSnapshotBox } from '@/Components/Aiim/RailBoxes';
import AiimPage, { SectionCard } from '@/Components/Aiim/Shell';
import SaMap from '@/Components/Aiim/SaMap';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    sort: string;
    glance: [string, string][];
    provinces: { slug: string; name: string; rank: number; score: number; label: string; sectors: { slug: string; icon: string }[] }[];
}

export default function Provinces({ sort, glance, provinces }: Props) {
    return (
        <AiimPage
            title="Select a Province"
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: 'Province Selector' }]}
            subtitle="Explore investment opportunities across South Africa's 9 provinces"
            description="Choose a province to view detailed investment intelligence, priority sectors, key projects, investors, infrastructure, and risk insights."
            actions={<ButtonLink href="/aiim/country/south-africa" size="sm" variant="outline">Back to Cockpit</ButtonLink>}
            rail={<><WorkspaceSnapshotBox /><CurrentStateBox /><AdvisoryBox /></>}
        >
            <div className="grid gap-5 lg:grid-cols-12">
                <SectionCard title="How to use this page" className="lg:col-span-3">
                    <ol className="space-y-3 text-xs text-ink-600">
                        <li className="flex gap-2"><MousePointerClick className="size-4 shrink-0 text-gold-600" /><span><strong className="block text-ink-900">1. Select a province</strong>Click any province to view its profile and opportunities.</span></li>
                        <li className="flex gap-2"><Search className="size-4 shrink-0 text-gold-600" /><span><strong className="block text-ink-900">2. Explore insights</strong>Access sectors, projects, investors, infrastructure and risk.</span></li>
                        <li className="flex gap-2"><Zap className="size-4 shrink-0 text-gold-600" /><span><strong className="block text-ink-900">3. Take action</strong>Save, compare, or generate reports for deeper analysis.</span></li>
                    </ol>
                </SectionCard>
                <div className="rounded-[8px] bg-ink-950 p-3 lg:col-span-5"><SaMap provinces={provinces} /></div>
                <SectionCard title="South Africa at a Glance" className="lg:col-span-4">
                    <dl className="divide-y divide-parchment-300 text-xs">
                        {glance.map(([k, v]) => <div key={k} className="flex justify-between py-1.5"><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}
                    </dl>
                    <p className="mt-3 text-xs text-ink-500">Next: explore sectors, opportunities, projects, investors, infrastructure, corridors and risk.</p>
                    <Link href="/aiim/sectors" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">View All Sectors <ArrowRight className="size-3" /></Link>
                </SectionCard>
            </div>

            <SectionCard
                title="Provinces Overview"
                className="mt-5"
                action={
                    <label className="flex items-center gap-2 text-xs text-ink-500">
                        Sort by:
                        <select value={sort} onChange={(e) => router.get('/aiim/country/south-africa/provinces', { sort: e.target.value }, { preserveScroll: true })} className="h-8 rounded border border-parchment-500 px-2 text-xs">
                            <option value="score">Opportunity Score</option>
                            <option value="name">Name (A–Z)</option>
                        </select>
                    </label>
                }
            >
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {provinces.map((p) => (
                        <li key={p.slug} className="rounded-[8px] border border-ink-700 bg-ink-950 p-3 text-parchment-100">
                            <p className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-6 items-center justify-center rounded-full border border-gold-500 text-xs text-gold-400">{p.rank}</span>{p.name}</p>
                            <p className="mt-2 text-2xl font-bold">{p.score}<span className="text-xs text-ink-400"> /100</span></p>
                            <Chip tone={levelTone(p.label)}>{p.label}</Chip>
                            <p className="mt-2 text-[0.65rem] text-ink-400">Key Sectors</p>
                            <div className="mt-1 flex gap-2 text-gold-500">{p.sectors.map((s) => <AiimIcon key={s.slug} name={s.icon} className="size-4" />)}</div>
                            <Link href={`/aiim/province/${p.slug}`} className="mt-3 flex items-center justify-between rounded border border-gold-700/60 px-2 py-1.5 text-xs text-gold-300 hover:bg-gold-500 hover:text-ink-900">View Province <ArrowRight className="size-3.5" /></Link>
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </AiimPage>
    );
}
