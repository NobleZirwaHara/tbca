import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Download, Map, MapPinned, Share2 } from 'lucide-react';
import AfricaCountryMap from '@/Components/Map/AfricaCountryMap';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import CountryExplorer from '@/Components/Aiim/Explorer/CountryExplorer';
import type { CountryIntel } from '@/Components/Aiim/Explorer/types';
import { BarList, Donut, Gauge } from '@/Components/Aiim/Charts';
import { PlaceholderTag, SyntheticNotice } from '@/Components/Aiim/Chips';
import CountryPicker from '@/Components/Aiim/CountryPicker';
import AiimPage, { CtaBand, SectionCard } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, CountryIndicator, CountryOption, CountryProfile } from '@/types/aiim';

interface Props extends AiimPageProps {
    country: CountryProfile;
    countries: CountryOption[];
    peers: CountryOption[];
    /** Full province-level content pack (South Africa only). */
    content: {
        kpis: [string, string, string, string][];
        topSectors: string[];
        opportunityScore: number;
        risk: { score: number; label: string; split: [string, number][] };
    } | null;
    provinces: { slug: string; name: string; score: number }[];
    sectors: { slug: string; name: string; icon: string }[];
    /** Map explorer payload: areas, layers, project briefs, opportunities, questions, country pack. */
    intel: CountryIntel;
    initialTab: string;
    initialUnit: string | null;
}

const num = (n: number) => n.toLocaleString('en-ZA', { maximumFractionDigits: 1 });

function show(i: CountryIndicator | undefined): string {
    if (!i || i.value === null) return 'Awaiting data';
    if (i.unit === 'million') return `${num(i.value)} M`;
    if (i.unit === 'USD billion') return `US$ ${num(i.value)} B`;
    if (i.unit === 'USD') return `US$ ${num(i.value)}`;
    if (i.unit === '%') return `${num(i.value)}%`;
    return `${num(i.value)} ${i.unit}`;
}

function opportunityLabel(score: number) {
    if (score >= 75) return 'High Opportunity';
    if (score >= 60) return 'Moderate-High Opportunity';
    if (score >= 45) return 'Moderate Opportunity';
    return 'Emerging Opportunity';
}

function riskLabel(score: number) {
    if (score >= 4) return 'High Risk';
    if (score >= 3) return 'Moderate Risk';
    if (score >= 2) return 'Low-Moderate Risk';
    return 'Low Risk';
}

export default function Cockpit({ country, countries, peers, content, provinces, sectors, intel, initialTab, initialUnit }: Props) {
    const { snapshot } = usePage<Props>().props;
    const share = () => void navigator.clipboard?.writeText(window.location.href);
    const ind = country.indicators;
    const pack = country.hasProvincePack && content;
    const oppScore = pack ? content.opportunityScore : (ind.opportunity_score?.value ?? 0);
    const riskScore = pack ? content.risk.score : (ind.risk_score?.value ?? 0);
    const customHref = `/aiim/custom-intelligence?country=${country.slug}`;
    const firstLevel = intel.units.filter((u) => u.level === 1);
    const topUnits = [...firstLevel].sort((a, b) => b.projects - a.projects || (b.population ?? 0) - (a.population ?? 0) || a.name.localeCompare(b.name)).slice(0, 8);
    const act = country.activation;

    const permanent: [string, string][] = [
        ['Capital', country.capital],
        ['Currency', `${country.currencyName} (${country.currencyCode})`],
        ['Region', country.regionName],
        ['Land Area', `${num(country.areaKm2)} km²`],
    ];
    const headline: [string, CountryIndicator | undefined, string][] = [
        ['Population', ind.population, 'users'],
        ['GDP (Nominal)', ind.gdp, 'trending-up'],
        ['Real GDP Growth', ind.gdp_growth, 'gauge'],
        ['GDP per Capita', ind.gdp_per_capita, 'coins'],
    ];

    return (
        <AiimPage
            title={`${country.name} Investor Cockpit`}
            tone="dark"
            crumbs={[{ label: 'Africa', href: '/aiim#explore-africa' }, { label: country.regionName }, { label: country.name }]}
            heading={<><span aria-hidden="true">{country.flag}</span> {country.name} Investor Cockpit</>}
            subtitle={`Your intelligence dashboard for ${country.name}`}
            description={pack
                ? 'Key investment signals, sectors, projects, investors, trade flows, risks and opportunities across all 9 provinces.'
                : `Headline indicators, opportunity and risk signals for ${country.name}, one of 54 country cockpits in the Africa Market (Active).`}
            notice={false}
            actions={
                <div className="flex flex-wrap items-start gap-2">
                    <CountryPicker countries={countries} value={country.slug} className="w-64" label="Change country" placeholder="Change country…" />
                    <button type="button" onClick={share} className="inline-flex h-12 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Share2 className="size-4" />Share</button>
                    {pack
                        ? <Link href="/aiim/store/SA-IC-2025" className="inline-flex h-12 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Download className="size-4" />Download Brief</Link>
                        : <Link href={customHref} className="inline-flex h-12 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Download className="size-4" />Request Country Brief</Link>}
                </div>
            }
            rail={false}
        >
            <CountryExplorer
                intel={intel}
                countryName={country.name}
                activation={country.activation}
                initialTab={initialTab}
                initialUnit={initialUnit}
                overview={
                    <>
                    <SyntheticNotice className="mb-4 max-w-md" />
                    <section aria-label="AIIM coverage" className="mb-5 grid grid-cols-2 gap-3 rounded-[8px] border border-gold-700/40 bg-ink-900 p-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
                        <div><p className="text-ink-400">Roll-out wave</p><p className="text-sm font-semibold">{act.wave ? act.wave.replace('[PROPOSED]', '').trim() : 'Not set'}</p></div>
                        <div><p className="text-ink-400">Country pack</p><p className="text-sm font-semibold">{act.packStatus ?? 'Not started'}{act.packCode ? ` (${act.packCode})` : ''}</p></div>
                        <div><p className="text-ink-400">Project briefs</p><p className="text-sm font-semibold">{intel.coverage.projects}</p></div>
                        <div><p className="text-ink-400">Opportunity records</p><p className="text-sm font-semibold">{intel.coverage.opportunities}</p></div>
                        <div><p className="text-ink-400">Areas and towns</p><p className="text-sm font-semibold">{intel.coverage.units}</p></div>
                        <div className="flex items-end"><Link href={`/aiim/country/${country.slug}?tab=map`} className="inline-flex items-center gap-1 font-semibold text-gold-400 hover:underline"><Map className="size-3.5" />Open the map</Link></div>
                    </section>
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-3 lg:col-span-5">
                            {pack && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                                    {content.kpis.map(([label, value, caption, icon]) => (
                                        <div key={label} className="rounded-[8px] border border-gold-700/40 bg-ink-900 p-3">
                                            <span className="text-gold-500"><AiimIcon name={icon} className="size-4" /></span>
                                            <p className="mt-1 text-[0.6875rem] text-ink-300">{label}</p>
                                            <p className="text-lg font-bold text-parchment-100">{value}</p>
                                            <p className="text-[0.6875rem] text-verified-500">{caption}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="rounded-[8px] border border-gold-700/40 bg-ink-900 p-3">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-sm font-semibold">Headline Indicators</h2>
                                    {headline.some(([, i]) => i?.status !== 'sourced') && <PlaceholderTag />}
                                </div>
                                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                    {headline.map(([label, i, icon]) => (
                                        <div key={label} className="rounded-[6px] border border-dashed border-ink-600 p-2.5">
                                            <span className="text-gold-500"><AiimIcon name={icon} className="size-4" /></span>
                                            <p className="mt-1 text-[0.6875rem] text-ink-300">{label}{i?.year ? ` (${i.year})` : ''}</p>
                                            <p className="text-base font-bold text-parchment-100">{show(i)}</p>
                                            {i?.status === 'sourced'
                                                ? <p className="text-[0.6rem] text-verified-500" title={i.source}>Sourced ({i.source.split(' (')[0]})</p>
                                                : <p className="text-[0.6rem] text-attested-500">Placeholder</p>}
                                        </div>
                                    ))}
                                </div>
                                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-ink-800 pt-3 text-xs">
                                    {permanent.map(([k, v]) => <div key={k}><dt className="text-ink-400">{k}</dt><dd className="font-semibold text-parchment-100">{v}</dd></div>)}
                                </dl>
                                <p className="mt-2 text-[0.6rem] text-ink-400">Capital, currency, region and area are permanent reference data. Indicators marked placeholder are approximate and will be replaced by live API data.</p>
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <AfricaCountryMap selected={country.slug} />
                            <p className="mt-1 text-center text-[0.65rem] text-ink-400">Click any country to switch cockpit</p>
                        </div>
                        <SectionCard dark title={pack ? 'Province Opportunity Heatmap' : 'Sub-national Regions'} className="lg:col-span-3">
                            <div id="regions" className="scroll-mt-24">
                                {pack ? (
                                    <>
                                        <BarList dark data={provinces.map((p) => ({ label: p.name, value: p.score }))} />
                                        <p className="mt-2 text-center text-[0.65rem] text-ink-400">Score /100</p>
                                        <div className="mt-2 text-center"><Link href={`/aiim/country/${country.slug}/provinces`} className="inline-flex items-center gap-1 text-xs text-gold-400 hover:underline"><Map className="size-3.5" />Open Province Selector</Link></div>
                                    </>
                                ) : (
                                    <>
                                        {topUnits.length > 0 ? (
                                            <>
                                                <p className="mb-2 text-xs text-ink-300">{topUnits.length} of {firstLevel.length} first-level areas loaded</p>
                                                <ul className="mb-3 space-y-1 text-sm">
                                                    {topUnits.map((u) => (
                                                        <li key={u.id}>
                                                            <Link href={`/aiim/country/${country.slug}?tab=map&unit=${u.slug}`} className="flex items-center gap-2 hover:text-gold-400">
                                                                <MapPinned className="size-3.5 text-gold-500" />{u.name}
                                                                <span className="ml-auto text-[0.65rem] text-ink-400">{u.projects ? `${u.projects} projects` : u.population ? `${u.population.toLocaleString('en-US')} people` : u.kind}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Link href={`/aiim/country/${country.slug}?tab=places`} className="inline-flex items-center gap-1 text-xs text-gold-400 hover:underline"><Map className="size-3.5" />See all areas and towns</Link>
                                            </>
                                        ) : (
                                            <div className="rounded-[6px] border border-dashed border-gold-700/60 p-3 text-xs text-ink-200">
                                                <p className="font-semibold text-gold-400">Sub-national data pending</p>
                                                <p className="mt-1">Regions, districts, cities, municipalities and towns for {country.name} load with its country pack or project briefs. Nothing is shown until sourced data arrives.</p>
                                                <Link href={customHref} className="mt-2 inline-flex text-gold-400 hover:underline">Request {country.name} regional intelligence</Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                        <SectionCard dark title={pack ? 'Top Opportunity Sectors' : 'Strategic Sectors'}>
                            {pack
                                ? <ol className="space-y-1.5 text-sm text-ink-200">{content.topSectors.map((s, i) => <li key={s}><span className="mr-2 text-gold-500">{i + 1}</span>{s}</li>)}</ol>
                                : <ul className="space-y-1.5 text-sm text-ink-200">{sectors.slice(0, 6).map((s) => <li key={s.slug} className="flex items-center gap-2"><span className="text-gold-500"><AiimIcon name={s.icon} className="size-4" /></span>{s.name}</li>)}</ul>}
                            <ButtonLink href={pack ? '/aiim/sectors' : customHref} size="sm" variant="outline-light" className="mt-3 w-full">{pack ? 'View All Sectors' : 'Request Sector Scan'}</ButtonLink>
                        </SectionCard>
                        {pack ? (
                            <SectionCard dark title="Top Provinces by Score">
                                <ol className="space-y-1.5 text-sm text-ink-200">
                                    {provinces.slice(0, 5).map((p, i) => <li key={p.slug} className="flex justify-between"><Link href={`/aiim/province/${p.slug}`} className="hover:text-gold-400"><span className="mr-2 text-gold-500">{i + 1}</span>{p.name}</Link><span>{p.score}</span></li>)}
                                </ol>
                                <ButtonLink href={`/aiim/country/${country.slug}/provinces`} size="sm" variant="outline-light" className="mt-3 w-full">View All Provinces</ButtonLink>
                            </SectionCard>
                        ) : (
                            <SectionCard dark title={`More in ${country.regionName}`}>
                                <ul className="grid grid-cols-1 gap-1 text-sm text-ink-200">
                                    {peers.slice(0, 8).map((p) => <li key={p.slug}><Link href={`/aiim/country/${p.slug}`} className="flex items-center gap-2 hover:text-gold-400"><span aria-hidden="true">{p.flag}</span>{p.name}</Link></li>)}
                                </ul>
                            </SectionCard>
                        )}
                        <SectionCard dark title="Opportunity Score">
                            <Gauge value={oppScore} label={opportunityLabel(oppScore)} />
                            {!pack && <div className="mt-2 text-center"><PlaceholderTag short /></div>}
                        </SectionCard>
                        <SectionCard dark title="Risk Snapshot">
                            {pack
                                ? <Donut dark centre={`${content.risk.score} /5`} sub={content.risk.label} data={content.risk.split.map(([label, value]) => ({ label, value }))} size={110} />
                                : <><Gauge value={riskScore} max={5} label={riskLabel(riskScore)} invert /><div className="mt-2 text-center"><PlaceholderTag short /></div></>}
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
                            {(pack
                                ? [['Explore Opportunities', '/aiim/opportunities'], ['View Projects', '/aiim/projects'], ['Find Investors', '/aiim/investors'], ['Find Funders', '/aiim/funders'], ['Trade Corridor Map', '/aiim/corridors'], ['Risk & Outlook', '/aiim/risk']]
                                : [[`Request ${country.name} Intelligence`, customHref], ['Speak to an Advisor', '/aiim/workspace/advisor-request'], ['Find Investors', '/aiim/investors'], ['Find Funders', '/aiim/funders'], ['Trade Corridor Map', '/aiim/corridors'], ['Premium Brief Store', '/aiim/store']]
                            ).map(([l, h]) => (
                                <li key={l}><Link href={h} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-ink-800">{l}<ArrowRight className="size-4 text-gold-500" /></Link></li>
                            ))}
                        </ul>
                    </SectionCard>
                    </>
                }
            />
            <CtaBand title="Need deeper intelligence or human insight?" text={`Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory in ${country.name}.`} />
        </AiimPage>
    );
}
