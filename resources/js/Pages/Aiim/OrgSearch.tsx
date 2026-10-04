import { Link } from '@inertiajs/react';
import { CompareButton, ListToggle } from '@/Components/Aiim/Actions';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import AiimPage from '@/Components/Aiim/Shell';
import { CheckGroup, DarkSelect, FilterBar, Pagination, RefinePanel, ResultsHeader, SearchRail, type Filters } from '@/Components/Aiim/SearchKit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, OrgItem, Paginated } from '@/types/aiim';

interface Props extends AiimPageProps {
    kind: 'investor' | 'funder';
    filters: Filters & { q: string; sector: string; types: string[]; stage: string; instrument: string; minTicket: string; origin: string; sort: string; view: string };
    results: Paginated<OrgItem>;
    options: { types: string[]; stages: string[]; instruments: string[]; origins: string[]; tickets: [string, string][]; provinces: { slug: string; name: string }[]; sectors: { slug: string; name: string }[] };
    saved: string[];
}

export default function OrgSearch({ kind, filters, results, options, saved }: Props) {
    const investor = kind === 'investor';
    const path = investor ? '/aiim/investors' : '/aiim/funders';
    const noun = investor ? 'Investors' : 'Funders';
    const sectorName = options.sectors.find((s) => s.slug === filters.sector)?.name;
    const href = (o: OrgItem) => `${path}/${o.slug}`;

    return (
        <AiimPage
            title={investor ? 'Investor Search' : 'Funder Search'}
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, ...(sectorName ? [{ label: sectorName, href: `/aiim/sector/${filters.sector}` }] : []), { label: `${investor ? 'Investor' : 'Funder'} Search` }]}
            subtitle={investor ? `Find and connect with active investors${sectorName ? ` in the ${sectorName} sector` : ''}` : 'Find and connect with active funders and development finance institutions.'}
            description={investor ? 'Filter, compare and explore investor profiles, investment focus, ticket sizes and recent activity.' : 'Filter, compare and explore funding opportunities, eligibility and mandates.'}
            actions={<ButtonLink href={sectorName ? `/aiim/sector/${filters.sector}` : '/aiim/sectors'} size="sm" variant="outline">Back to Sector</ButtonLink>}
            rail={<SearchRail compareLabel={`Compare ${noun}`} />}
        >
            <FilterBar
                path={path}
                filters={filters}
                labels={[
                    { key: 'sector', label: 'Sector', display: (v) => options.sectors.find((s) => s.slug === v)?.name ?? v },
                    { key: 'types', label: investor ? 'Investor Type' : 'Funder Type' },
                    { key: 'stage', label: investor ? 'Investment Stage' : 'Funding Stage' },
                    ...(investor ? [{ key: 'origin', label: 'Investor Origin' }] : [{ key: 'instrument', label: 'Funding Instrument' }]),
                    { key: 'minTicket', label: 'Ticket Size (ZAR)', display: (v: string) => options.tickets.find((t) => t[0] === v)?.[1] ?? v },
                ]}
            />
            <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <RefinePanel key={JSON.stringify(filters)} path={path} filters={filters} placeholder={investor ? 'e.g. VC, PE, impact, corporate investor' : 'e.g. grant, loan, equity, blended finance'}>
                    {(d, set) => (
                        <>
                            <CheckGroup label={investor ? 'Investor Type' : 'Funder Type'} options={options.types} value={d.types as string[]} onChange={(v) => set('types', v)} />
                            <DarkSelect label={investor ? 'Investment Stage Focus' : 'Funding Stage'} value={d.stage as string} onChange={(v) => set('stage', v)} options={options.stages} all="All Stages" />
                            {!investor && <DarkSelect label="Funding Instrument" value={d.instrument as string} onChange={(v) => set('instrument', v)} options={options.instruments} all="All Instruments" />}
                            <DarkSelect label="Minimum Ticket Size (ZAR)" value={d.minTicket as string} onChange={(v) => set('minTicket', v)} options={options.tickets} />
                            {investor && <DarkSelect label="Investor Origin" value={d.origin as string} onChange={(v) => set('origin', v)} options={options.origins} all="All Origins" />}
                            <DarkSelect label="Sector" value={d.sector as string} onChange={(v) => set('sector', v)} options={options.sectors.map((s) => [s.slug, s.name])} all="All Sectors" />
                        </>
                    )}
                </RefinePanel>

                <section className="min-w-0 overflow-hidden rounded-[8px] bg-ink-950 text-parchment-100">
                    <ResultsHeader path={path} filters={filters} total={results.total} noun={noun} sorts={[['score', 'Match Score'], ['ticket', 'Ticket Size'], ['added', 'Date Added'], ['name', 'Name']]} />
                    {results.data.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-300">No {noun.toLowerCase()} match these filters.</p>}
                    {filters.view === 'grid' ? (
                        <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                            {results.data.map((o) => (
                                <li key={o.slug} className="rounded-[8px] border border-ink-700 p-3">
                                    <div className="flex justify-between gap-2"><Link href={href(o)} className="font-semibold hover:text-gold-400">{o.name}</Link><ScoreRing value={o.score} dark size={44} /></div>
                                    <Chip tone="gold">{o.type}</Chip>
                                    <p className="mt-2 text-xs text-ink-300">{o.summary}</p>
                                    <p className="mt-2 text-xs">{o.ticket} · {o.location}</p>
                                    <div className="mt-2 flex gap-1"><ListToggle list="saved" type={kind} itemKey={o.slug} saved={saved} variant="icon" dark /><CompareButton type={kind} itemKey={o.slug} variant="icon" dark /></div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[60rem] text-left text-xs">
                                <thead className="text-ink-400">
                                    <tr>{[investor ? 'Investor' : 'Funder', 'Type', 'Focus Areas', ...(investor ? [] : ['Funding Instruments']), 'Ticket Size (ZAR)', investor ? 'Stage Focus' : 'Target Beneficiaries', 'Location', 'Match Score', 'Added'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-ink-800">
                                    {results.data.map((o) => (
                                        <tr key={o.slug} className="align-top hover:bg-ink-900">
                                            <td className="px-3 py-3">
                                                <div className="flex gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded bg-parchment-100 text-[0.6rem] font-bold text-ink-900">{o.shortName.slice(0, 5).toUpperCase()}</span>
                                                    <div><Link href={href(o)} className="text-sm font-semibold hover:text-gold-400">{o.name}</Link><p className="max-w-[14rem] text-ink-300">{o.summary}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3"><Chip tone="gold">{o.type}</Chip></td>
                                            <td className="px-3 py-3">{o.focus.join(', ')}</td>
                                            {!investor && <td className="px-3 py-3">{o.instruments.join(', ')}</td>}
                                            <td className="px-3 py-3 font-semibold">{o.ticket}</td>
                                            <td className="px-3 py-3">{investor ? <div className="flex flex-wrap gap-1">{o.stages.map((s) => <Chip key={s} tone="info">{s}</Chip>)}</div> : o.beneficiaries}</td>
                                            <td className="px-3 py-3">{o.location}</td>
                                            <td className="px-3 py-3"><ScoreRing value={o.score} dark size={44} /></td>
                                            <td className="px-3 py-3">{o.added}<div className="mt-1 flex gap-1"><ListToggle list="saved" type={kind} itemKey={o.slug} saved={saved} variant="icon" dark /><CompareButton type={kind} itemKey={o.slug} variant="icon" dark /></div></td>
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
