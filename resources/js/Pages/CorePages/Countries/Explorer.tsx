import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BadgeDollarSign, BookOpen, ChevronLeft, ChevronRight, Database, FileSearch, Globe2, Grid2x2, HelpCircle, Landmark, List, MapPin, Network, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import CountrySearch from '@/Components/CorePages/CountrySearch';
import AfricaCountryMap from '@/Components/Map/AfricaCountryMap';
import { bucketFill, regionId } from '@/Components/Map/countryMapHelpers';
import { Flag, STATUS_DOT } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { CountryObject } from '@/types/core-pages';

interface Props {
    countries: CountryObject[];
    mapCountries: { iso: string; name: string; region: string; state: string }[];
    regionCounts: Record<string, number>;
    total: number;
    page: number;
    per: number;
    counts: Record<string, number>;
    regions: string[];
    filters: { q: string; region: string; state: string; service: string };
}

const sel = 'mt-1 h-9 w-full rounded-[4px] border border-ink-700 bg-ink-900 px-2 text-[0.8125rem] text-parchment-100';
const legend = [['Activated', 'Commercially active with full resolver and services'], ['Shell', 'Country objects created not yet activated'], ['Degraded', 'Limited availability or partial restrictions'], ['Suspended', 'Temporarily suspended services'], ['Restricted', 'Restricted or prohibited access / services']];

export default function Explorer({ countries, mapCountries, regionCounts, total, page, per, counts, regions, filters }: Props) {
    const [help, setHelp] = useState(false);
    const [view, setView] = useState<'list' | 'grid'>('list');
    const pages = Math.max(1, Math.ceil(total / per));
    const go = (n: Record<string, string | number>) => router.get('/find-the-right-service/countries', { ...filters, page: 1, per, ...n }, { preserveState: true, preserveScroll: true, replace: true });
    const activated = mapCountries.filter((c) => c.state === 'Activated').length;

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title="Country Explorer" />
            <div className="container-tbca py-8">
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <h1 className="font-serif text-[2.25rem] font-semibold text-parchment-100">Country Explorer</h1>
                        <p className="mt-1 text-[0.9375rem]">Explore all 54 African countries across 5 regions — Africa (Active) — with evidence quality, services and standard pricing at a glance.</p>
                        <button type="button" onClick={() => setHelp(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-gold-600/60 px-3 py-1.5 text-[0.75rem] text-gold-300"><HelpCircle className="size-3.5" aria-hidden="true" />How to use this explorer</button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-5">
                        <div className="rounded-[8px] border border-gold-700/40 p-3 sm:col-span-2 lg:col-span-1">
                            <CountrySearch countries={mapCountries} initial={filters.q} onSearch={(q) => go({ q })} inputClassName={sel} />
                        </div>
                        <div className="rounded-[8px] border border-gold-700/40 p-3"><label htmlFor="c-region" className="text-[0.75rem] font-semibold text-parchment-100">Region</label><select id="c-region" value={filters.region} onChange={(e) => go({ region: e.target.value })} className={sel}><option value="">All Regions</option>{regions.map((r) => <option key={r}>{r}</option>)}</select></div>
                        <div className="rounded-[8px] border border-gold-700/40 p-3"><label htmlFor="c-state" className="text-[0.75rem] font-semibold text-parchment-100">Availability State</label><select id="c-state" value={filters.state} onChange={(e) => go({ state: e.target.value })} className={sel}><option value="">All States</option>{Object.keys(counts).map((s) => <option key={s}>{s}</option>)}</select></div>
                        <div className="rounded-[8px] border border-gold-700/40 p-3"><label htmlFor="c-service" className="text-[0.75rem] font-semibold text-parchment-100">Service Category</label><select id="c-service" value={filters.service} onChange={(e) => go({ service: e.target.value })} className={sel}><option value="">All Services</option><option>Business & Corporate Services</option><option>Advisory Services</option><option>Market Intelligence</option></select></div>
                        <div className="rounded-[8px] border border-gold-700/40 p-3"><p className="text-[0.75rem] font-semibold text-parchment-100">View</p><div className="mt-1 flex gap-2"><button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')} className={cn('rounded p-2', view === 'grid' ? 'bg-gold-500 text-ink-900' : 'border border-ink-700')}><Grid2x2 className="size-4" /></button><button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')} className={cn('rounded p-2', view === 'list' ? 'bg-gold-500 text-ink-900' : 'border border-ink-700')}><List className="size-4" /></button></div></div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by region">
                    <span className="text-[0.75rem] font-semibold text-parchment-100">Regions:</span>
                    <button type="button" onClick={() => go({ region: '' })} aria-pressed={!filters.region} className={cn('rounded-full border px-3 py-1 text-[0.75rem]', !filters.region ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-700 hover:border-gold-500')}>All Africa ({mapCountries.length})</button>
                    {regions.map((r) => (
                        <button key={r} type="button" onClick={() => go({ region: filters.region === r ? '' : r })} aria-pressed={filters.region === r} className={cn('rounded-full border px-3 py-1 text-[0.75rem]', filters.region === r ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-700 hover:border-gold-500')}>{r} ({regionCounts[r] ?? 0})</button>
                    ))}
                </div>

                <ul className="mt-4 grid gap-px overflow-hidden rounded-[8px] border border-gold-700/40 bg-gold-700/20 sm:grid-cols-3 lg:grid-cols-6">
                    {[[Globe2, String(mapCountries.length), 'African Countries', 'Complete geographic coverage'], [ShieldCheck, String(activated), 'Activated', 'Africa (Active) — standard catalogue available'], [MapPin, String(regions.length), 'Regions', 'North, West, Central, East and Southern Africa'], [Network, '4', 'Regional Corridors', 'SADC, SACU, EAC and ECOWAS'], [Database, '100+', 'Local Data Sources', 'Government, private and verified proprietary sources'], [BadgeDollarSign, 'Standard', 'Catalogue Pricing', 'Shown in your selected currency']].map(([I, v, l, s]) => {
                        const Ico = I as typeof Globe2;
                        return <li key={l as string} className="flex gap-3 bg-ink-950 p-4"><Ico className="size-7 shrink-0 text-gold-500" aria-hidden="true" /><span><span className="block text-[1.375rem] leading-tight font-bold text-parchment-100">{v as string}</span><span className="block text-[0.75rem] font-semibold text-parchment-100">{l as string}</span><span className="block text-[0.6875rem] text-ink-300">{s as string}</span></span></li>;
                    })}
                </ul>

                <div className="mt-5 grid gap-5 lg:grid-cols-12">
                    <section className="rounded-[8px] border border-gold-700/40 p-4 lg:col-span-4">
                        <h2 className="text-[0.9375rem] font-semibold text-parchment-100">African Countries Map</h2>
                        <div className="mt-3 grid gap-3">
                            <ul className="space-y-2 rounded-[6px] border border-ink-700 p-3 text-[0.6875rem]">
                                <li className="text-[0.75rem] font-semibold text-parchment-100">Legend</li>
                                {legend.map(([s, d]) => (
                                    <li key={s}><button type="button" onClick={() => go({ state: filters.state === s ? '' : s })} className="flex gap-2 text-left"><span className={cn('mt-1 size-2.5 shrink-0 rounded-full', STATUS_DOT[s])} /><span><strong className="text-parchment-100">{s} ({counts[s] ?? 0})</strong><br />{d}</span></button></li>
                                ))}
                            </ul>
                            <AfricaCountryMap
                                className="order-first"
                                activeRegion={regionId(filters.region)}
                                colorFor={(c) => {
                                    const state = mapCountries.find((m) => m.iso === c.iso2)?.state;
                                    return state && state !== 'Activated' ? bucketFill(state.toLowerCase()) : undefined;
                                }}
                                hrefFor={(_, c) => `/find-the-right-service/countries/${c.iso2.toLowerCase()}`}
                                label="Map of Africa: select a country to open its country profile"
                            />
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-ink-300">Click a country or row to view details.</p>
                    </section>

                    <section className="rounded-[8px] border border-gold-700/40 p-4 lg:col-span-8">
                        <h2 className="text-[0.9375rem] font-semibold text-parchment-100">{filters.region || 'All African Countries'} ({total})</h2>
                        {view === 'list' ? (
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                    <thead className="text-[0.6875rem] text-ink-300"><tr>{['Country', 'Region', 'Availability State', 'Resolver Completeness (RCS)', 'Evidence Currentness', 'Last Updated', 'View'].map((h) => <th key={h} className="px-2 py-1.5">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-ink-800">
                                        {countries.map((c) => (
                                            <tr key={c.iso} className="cursor-pointer hover:bg-ink-900" onClick={() => router.visit(`/find-the-right-service/countries/${c.iso.toLowerCase()}`)}>
                                                <td className="px-2 py-2 text-parchment-100"><Flag iso={c.iso} className="mr-2" />{c.name}</td>
                                                <td className="px-2 py-2">{c.region}</td>
                                                <td className="px-2 py-2"><span className={cn('rounded-full border px-2 py-0.5 text-[0.6875rem]', c.state === 'Activated' ? 'border-verified-500 text-verified-500' : 'border-ink-600 text-ink-200')}>{c.state}</span></td>
                                                <td className="px-2 py-2">{c.rcs}%</td>
                                                <td className={cn('px-2 py-2', c.evidence === 'Current' ? 'text-verified-500' : '')}>{c.evidence}</td>
                                                <td className="px-2 py-2">{c.updated}</td>
                                                <td className="px-2 py-2"><Link href={`/find-the-right-service/countries/${c.iso.toLowerCase()}`} onClick={(e) => e.stopPropagation()} className="rounded-[4px] border border-gold-500 px-2 py-1 text-[0.6875rem] text-gold-400">View Profile</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {countries.map((c) => (
                                    <li key={c.iso}><Link href={`/find-the-right-service/countries/${c.iso.toLowerCase()}`} className="block rounded-[6px] border border-ink-700 p-3 hover:border-gold-500"><p className="text-parchment-100"><Flag iso={c.iso} className="mr-1" />{c.name}</p><p className="text-[0.6875rem]">{c.state} · RCS {c.rcs}%</p></Link></li>
                                ))}
                            </ul>
                        )}
                        {countries.length === 0 && <p className="py-6 text-center text-ink-300">No country objects match.</p>}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.75rem]">
                            <button type="button" onClick={() => go({ per: per === 54 ? 8 : 54, page: 1 })} className="inline-flex items-center gap-1 rounded-[4px] border border-gold-500 px-3 py-1.5 text-gold-400">{per === 54 ? 'Show 8 per page' : `View all ${total} countries`} <ArrowRight className="size-3.5" aria-hidden="true" /></button>
                            <span className="flex items-center gap-1">
                                {(page - 1) * per + (total ? 1 : 0)} – {Math.min(page * per, total)} of {total}
                                <button type="button" disabled={page <= 1} onClick={() => go({ page: page - 1 })} className="rounded border border-ink-700 p-1 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-3.5" /></button>
                                {Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p <= 3 || p === pages || Math.abs(p - page) <= 1).map((p) => <button key={p} type="button" onClick={() => go({ page: p })} aria-current={p === page ? 'page' : undefined} className={cn('min-w-7 rounded border px-1.5 py-0.5', p === page ? 'border-gold-500 text-gold-400' : 'border-ink-700')}>{p}</button>)}
                                <button type="button" disabled={page >= pages} onClick={() => go({ page: page + 1 })} className="rounded border border-ink-700 p-1 disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-3.5" /></button>
                            </span>
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-ink-300">Evidence “Baseline” means reference data is loaded and awaiting country-desk verification.</p>
                    </section>
                </div>

                <div className="mt-5 grid gap-4 rounded-[8px] border border-gold-700/40 p-4 md:grid-cols-4">
                    <p className="text-[0.75rem]"><strong className="block text-gold-400">Africa (Active)</strong>All 54 African countries are activated. Standard catalogue prices are shown in your selected currency; statutory and partner fees are quoted at cost.</p>
                    <p className="text-[0.75rem]"><strong className="block text-gold-400">Evidence First</strong>All commercial actions are evidence-backed. Currentness and confidence matter.</p>
                    <p className="text-[0.75rem]"><strong className="block text-gold-400">Baseline Data</strong>Country reference data marked “to be confirmed” is a working baseline pending country-desk verification.</p>
                    <div className="flex items-center justify-between gap-2 text-[0.75rem]"><p><strong className="block text-gold-400">Questions?</strong>Speak to our specialists or ask a question.</p><button type="button" onClick={() => openAskQuestion({ subject: 'Country Explorer question', section: 'core' })} className="rounded-[4px] border border-gold-500 px-3 py-1.5 text-gold-400">Ask a Question</button></div>
                </div>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {[[BookOpen, 'Activation Ledger', 'View public activation status for all countries', '/find-the-right-service/countries?state=Activated'], [TrendingUp, 'Unmet Demand', 'Explore captured demand and market gaps', '/find-the-right-service/request-human-assistance'], [Network, 'Corridors', 'Explore directional corridors and pair permissions', '/find-the-right-service/corridors'], [FileSearch, 'Evidence Manifest', 'Browse sources, freshness and contradictions', '/find-the-right-service/countries/za/evidence'], [Users, 'Sovereign Clients', 'View sovereign client engagements', '/project-advisory'], [Landmark, 'Country Admin', 'Administrator control and management', '/admin/core-pages/corridors']].map(([I, t, b, h]) => {
                        const Ico = I as typeof Users;
                        return <li key={t as string}><Link href={h as string} className="flex h-full items-center gap-3 rounded-[8px] border border-gold-700/40 p-3 hover:border-gold-500"><Ico className="size-6 shrink-0 text-gold-500" aria-hidden="true" /><span className="flex-1 text-[0.75rem]"><strong className="block text-parchment-100">{t as string}</strong>{b as string}</span><ArrowRight className="size-4" aria-hidden="true" /></Link></li>;
                    })}
                </ul>
            </div>

            <Modal open={help} onClose={() => setHelp(false)} title="How to use the Country Explorer">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-700">
                    <li>Filter by region, availability state or service category, or search by name.</li>
                    <li>Click a country tile or row to open its Country Profile.</li>
                    <li>Use the region chips to focus on North, West, Central, East or Southern Africa.</li>
                    <li>All 54 countries are activated (Africa Active). Each profile lists the standard service catalogue with prices in your selected currency.</li>
                </ol>
            </Modal>
        </div>
    );
}
