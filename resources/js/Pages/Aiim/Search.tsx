import { Link } from '@inertiajs/react';
import { CompareButton, ListToggle } from '@/Components/Aiim/Actions';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip, levelTone, VerificationChip } from '@/Components/Aiim/Chips';
import AiimPage from '@/Components/Aiim/Shell';
import { CheckGroup, DarkSelect, FilterBar, Pagination, RefinePanel, ResultsHeader, SearchRail, type Filters } from '@/Components/Aiim/SearchKit';
import type { AiimPageProps, Paginated, ProjectItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    kind: 'opportunity' | 'project';
    filters: Filters & { q: string; province: string; sector: string; types: string[]; size: string; stage: string; sort: string; view: string };
    results: Paginated<ProjectItem>;
    options: { types: string[]; stages: string[]; sizes: [string, string][]; provinces: { slug: string; name: string }[]; sectors: { slug: string; name: string }[] };
    saved: string[];
}

export default function Search({ kind, filters, results, options, saved }: Props) {
    const isProject = kind === 'project';
    const path = isProject ? '/aiim/projects' : '/aiim/opportunities';
    const noun = isProject ? 'Projects' : 'Opportunities';
    const provinceName = options.provinces.find((p) => p.slug === filters.province)?.name;
    const sectorName = options.sectors.find((s) => s.slug === filters.sector)?.name;
    const scope = [sectorName, provinceName].filter(Boolean).join(' · ');
    const href = (p: ProjectItem) => (isProject ? `/aiim/projects/${p.slug}` : `/aiim/opportunities/${p.slug}`);

    return (
        <AiimPage
            title={isProject ? 'Project Search' : 'Opportunity Search'}
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, ...(provinceName ? [{ label: provinceName, href: `/aiim/province/${filters.province}` }] : []), ...(sectorName ? [{ label: sectorName, href: `/aiim/sector/${filters.sector}` }] : []), { label: noun }]}
            subtitle={isProject ? `Discover high-potential projects${scope ? ` in ${scope}` : ' across South Africa'}` : `Find and filter high-potential investment opportunities${scope ? ` in ${scope}` : ' across South Africa'}`}
            description={isProject ? 'Filter, compare and explore investment-ready projects with verified insights.' : `Use filters to narrow results or explore all ${results.total} active opportunities.`}
            rail={<SearchRail compareLabel={`Compare ${noun}`} />}
        >
            <FilterBar
                path={path}
                filters={filters}
                labels={[
                    { key: 'province', label: 'Location', display: (v) => options.provinces.find((p) => p.slug === v)?.name ?? v },
                    { key: 'sector', label: 'Sector', display: (v) => options.sectors.find((s) => s.slug === v)?.name ?? v },
                    { key: 'types', label: isProject ? 'Project Type' : 'Opportunity Type' },
                    { key: 'size', label: 'Investment Size', display: (v) => options.sizes.find((s) => s[0] === v)?.[1] ?? v },
                    { key: 'stage', label: 'Stage' },
                ]}
            />
            <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <RefinePanel key={JSON.stringify(filters)} path={path} filters={filters} placeholder="e.g. data centre, fintech, cloud, AI">
                    {(d, set) => (
                        <>
                            <DarkSelect label="Location" value={d.province as string} onChange={(v) => set('province', v)} options={options.provinces.map((p) => [p.slug, p.name])} all="All Provinces" />
                            <CheckGroup label={isProject ? 'Project Type' : 'Opportunity Type'} options={options.types} value={d.types as string[]} onChange={(v) => set('types', v)} />
                            <DarkSelect label="Investment Size (ZAR)" value={d.size as string} onChange={(v) => set('size', v)} options={options.sizes} all="All Sizes" />
                            <DarkSelect label="Development Stage" value={d.stage as string} onChange={(v) => set('stage', v)} options={options.stages} all="All Stages" />
                            <DarkSelect label="Sector Focus" value={d.sector as string} onChange={(v) => set('sector', v)} options={options.sectors.map((s) => [s.slug, s.name])} all="All Sectors" />
                        </>
                    )}
                </RefinePanel>

                <section className="min-w-0 overflow-hidden rounded-[8px] bg-ink-950 text-parchment-100">
                    <ResultsHeader path={path} filters={filters} total={results.total} noun={noun} sorts={[['score', 'Opportunity Score'], ['size', 'Investment Size'], ['added', 'Date Added'], ['name', 'Name']]} />
                    {results.data.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-300">No {noun.toLowerCase()} match these filters. Try clearing a filter.</p>}
                    {filters.view === 'grid' ? (
                        <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                            {results.data.map((p) => (
                                <li key={p.slug} className="rounded-[8px] border border-ink-700 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <Link href={href(p)} className="font-semibold hover:text-gold-400">{p.name}</Link>
                                        <ScoreRing value={p.score} dark size={44} />
                                    </div>
                                    <p className="mt-1 text-xs text-ink-300">{p.summary}</p>
                                    <p className="mt-2 text-xs">{p.location} · {p.size}</p>
                                    <div className="mt-2 flex flex-wrap gap-1"><Chip tone={levelTone(p.level)}>{p.level}</Chip><Chip tone="dark">{p.stage}</Chip></div>
                                    <div className="mt-2 flex gap-1"><ListToggle list="saved" type={kind} itemKey={p.slug} saved={saved} variant="icon" dark /><CompareButton type={kind} itemKey={p.slug} variant="icon" dark /></div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[56rem] text-left text-xs">
                                <thead className="text-ink-400"><tr>{[isProject ? 'Project' : 'Opportunity', 'Location', 'Investment Size', 'Type', 'Stage', 'Opportunity Score', 'Added'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-ink-800">
                                    {results.data.map((p) => (
                                        <tr key={p.slug} className="align-top hover:bg-ink-900">
                                            <td className="px-3 py-3">
                                                <div className="flex gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded bg-ink-800 text-gold-500"><AiimIcon name={p.icon} /></span>
                                                    <div>
                                                        <Link href={href(p)} className="text-sm font-semibold hover:text-gold-400">{p.name}</Link>
                                                        <p className="max-w-xs text-ink-300">{p.summary}</p>
                                                        <div className="mt-1 flex flex-wrap gap-1"><Chip tone={levelTone(p.level)}>{p.level}</Chip><VerificationChip label={p.evidence.verification} /></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">{p.location}</td>
                                            <td className="px-3 py-3"><span className="font-semibold">{p.size}</span><br /><span className="text-ink-400">{p.sizeBand}</span></td>
                                            <td className="px-3 py-3">{p.type}</td>
                                            <td className="px-3 py-3">{p.stage}</td>
                                            <td className="px-3 py-3"><ScoreRing value={p.score} dark size={44} /></td>
                                            <td className="px-3 py-3">
                                                {p.added}
                                                <div className="mt-1 flex gap-1"><ListToggle list="saved" type={kind} itemKey={p.slug} saved={saved} variant="icon" dark /><CompareButton type={kind} itemKey={p.slug} variant="icon" dark /></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination page={results} noun={noun.toLowerCase()} />
                </section>
            </div>
        </AiimPage>
    );
}
