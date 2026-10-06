import { Link } from '@inertiajs/react';
import { Plane, Ship, TrainFront, Truck } from 'lucide-react';
import { CompareButton, ListToggle } from '@/Components/Aiim/Actions';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import AiimPage from '@/Components/Aiim/Shell';
import { CheckGroup, DarkSelect, FilterBar, Pagination, RefinePanel, ResultsHeader, SearchRail, type Filters } from '@/Components/Aiim/SearchKit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, CorridorItem, Paginated } from '@/types/aiim';

interface Props extends AiimPageProps {
    filters: Filters & { q: string; types: string[]; mode: string; agreement: string; region: string; infrastructure: string; minScore: string; sort: string; view: string };
    results: Paginated<CorridorItem>;
    options: { types: string[]; agreements: string[]; regions: string[]; infrastructure: string[]; modes: string[] };
    saved: string[];
}

export function ModeIcons({ modes }: { modes: string[] }) {
    const map = { road: Truck, rail: TrainFront, sea: Ship, air: Plane } as const;
    return (
        <span className="flex gap-1.5">
            {modes.map((m) => {
                const I = map[m as keyof typeof map];
                return I ? <I key={m} className="size-4" aria-label={m} /> : null;
            })}
        </span>
    );
}

const typeTone = (t: string) => (t === 'SADC' ? 'good' : t === 'Global' ? 'info' : t === 'Emerging' ? 'purple' : 'gold') as 'good' | 'info' | 'purple' | 'gold';

export default function CorridorSearch({ filters, results, options, saved }: Props) {
    const path = '/aiim/corridors';
    return (
        <AiimPage
            title="Trade Corridor Search"
            crumbs={[{ label: 'Africa', href: '/aiim#explore-africa' }, { label: 'Trade Corridor Search' }]}
            subtitle="Explore and compare trade corridors connecting African markets to key regional and global markets."
            description="Filter, compare and explore corridor performance, infrastructure, agreements and opportunities."
            actions={<ButtonLink href="/aiim/sectors" size="sm" variant="outline">Back to Sector</ButtonLink>}
            rail={<SearchRail compareLabel="Compare Corridors" />}
        >
            <FilterBar
                path={path}
                filters={filters}
                labels={[{ key: 'region', label: 'Destination Region' }, { key: 'types', label: 'Corridor Type' }, { key: 'mode', label: 'Transport Mode' }, { key: 'agreement', label: 'Agreement' }, { key: 'minScore', label: 'Performance Score', display: (v) => `${v}+` }]}
            />
            <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <RefinePanel key={JSON.stringify(filters)} path={path} filters={filters} placeholder="e.g. SADC, AfCFTA, Port of Durban">
                    {(d, set) => (
                        <>
                            <CheckGroup label="Corridor Type" options={options.types} value={d.types as string[]} onChange={(v) => set('types', v)} />
                            <DarkSelect label="Transport Mode" value={d.mode as string} onChange={(v) => set('mode', v)} options={options.modes.map((m) => [m, m[0].toUpperCase() + m.slice(1)])} all="All Modes" />
                            <DarkSelect label="Agreement / Framework" value={d.agreement as string} onChange={(v) => set('agreement', v)} options={options.agreements} all="All Agreements" />
                            <DarkSelect label="Destination Region" value={d.region as string} onChange={(v) => set('region', v)} options={options.regions} />
                            <DarkSelect label="Infrastructure Quality" value={d.infrastructure as string} onChange={(v) => set('infrastructure', v)} options={options.infrastructure} />
                            <DarkSelect label="Performance Score" value={d.minScore as string} onChange={(v) => set('minScore', v)} options={[['90', '90+'], ['85', '85+'], ['80', '80+']]} />
                        </>
                    )}
                </RefinePanel>
                <section className="min-w-0 overflow-hidden rounded-[8px] bg-ink-950 text-parchment-100">
                    <ResultsHeader path={path} filters={filters} total={results.total} noun="Trade Corridors" sorts={[['score', 'Performance Score'], ['volume', 'Trade Volume'], ['added', 'Date Added'], ['name', 'Name']]} />
                    {results.data.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-300">No corridors match these filters.</p>}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[60rem] text-left text-xs">
                            <thead className="text-ink-400"><tr>{['Corridor', 'Type', 'Key Route', 'Agreement / Framework', 'Transport Mode', 'Performance Score', 'Trade Volume (ZAR)', 'Top Sectors', 'Added'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-ink-800">
                                {results.data.map((c) => (
                                    <tr key={c.slug} className="align-top hover:bg-ink-900">
                                        <td className="px-3 py-3"><Link href={`/aiim/corridors/${c.slug}`} className="text-sm font-semibold hover:text-gold-400">{c.name}</Link><p className="max-w-[12rem] text-ink-300">{c.countries}</p></td>
                                        <td className="px-3 py-3"><Chip tone={typeTone(c.type)}>{c.type}</Chip></td>
                                        <td className="px-3 py-3">{c.route}</td>
                                        <td className="px-3 py-3">{c.agreement}</td>
                                        <td className="px-3 py-3 text-gold-400"><ModeIcons modes={c.modes} /></td>
                                        <td className="px-3 py-3"><ScoreRing value={c.score} dark size={44} /></td>
                                        <td className="px-3 py-3 font-semibold">{c.volume}<br /><span className="font-normal text-ink-400">(2023)</span></td>
                                        <td className="px-3 py-3">{c.sectors}</td>
                                        <td className="px-3 py-3">{c.added}<div className="mt-1 flex gap-1"><ListToggle list="saved" type="corridor" itemKey={c.slug} saved={saved} variant="icon" dark /><CompareButton type="corridor" itemKey={c.slug} variant="icon" dark /></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={results} noun="corridors" />
                </section>
            </div>
        </AiimPage>
    );
}
