import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BarChart3, Bell, Bookmark, Bot, CheckCircle2, ChevronRight, Download, Eye, FileText, Scale, Search } from 'lucide-react';
import { useState } from 'react';
import AfricaCountryMap from '@/Components/Map/AfricaCountryMap';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { Gauge } from '@/Components/Aiim/Charts';
import CountryPicker from '@/Components/Aiim/CountryPicker';
import { Ribbon, SubNav } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, CountryOption, ProjectItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    content: {
        numbers: [string, string, string][];
        pillars: [string, string, string][];
        platform: string[];
        countries: { name: string; slug: string; code: string; status: string }[];
        actions: [string, string][];
        snapshot: [string, string][];
        verifiedSources: string[];
    };
    countries: CountryOption[];
    regions: [string, number][];
    sectors: { slug: string; name: string; icon: string }[];
    top: ProjectItem[];
    provinces: { slug: string; name: string; score: number }[];
}

const panel = 'rounded-[10px] border border-gold-700/40 bg-ink-900/80 p-5';

export default function Landing({ content, countries, regions, sectors, top, provinces }: Props) {
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [sector, setSector] = useState('');
    const [q, setQ] = useState('');

    const search = (target: string) => router.get(target, { province: province || undefined, sector: sector || undefined, q: q || undefined });

    return (
        <>
            <Head title="AIIM – Africa Investment Intelligence Map" />
            <SubNav />
            <div className="bg-ink-950 text-parchment-100">
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                    <div className="container-tbca relative grid gap-8 py-12 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <h1 className="text-[2.25rem] leading-tight font-bold tracking-tight sm:text-[2.75rem]">AIIM – Africa Investment Intelligence Map</h1>
                            <p className="mt-2 text-2xl font-bold text-gold-500">54 Markets. One Intelligence Platform.</p>
                            <p className="mt-4 max-w-xl text-[0.9375rem] text-ink-200">
                                AIIM is your pan-African intelligence platform for opportunities, projects, investors, sectors, trade corridors, market intelligence, and risk outlook — powered by verified data and human insight.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a href="#explore-africa" className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-gold-500 px-6 text-[0.9375rem] font-semibold text-ink-900 transition-colors hover:border-gold-400 hover:bg-gold-400">Explore Africa <ArrowRight className="size-4" /></a>
                                <ButtonLink href="/aiim/store" size="lg" variant="outline-light" icon="file-text">Buy Premium Briefs</ButtonLink>
                            </div>
                            <div className="mt-4 max-w-md">
                                <p className="mb-1.5 text-xs font-semibold text-gold-400">Explore Africa — open any of the 54 country cockpits</p>
                                <CountryPicker countries={countries} label="Explore Africa: choose a country" />
                            </div>
                            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-200">
                                {['54 Countries Covered', '100+ Local Data Sources', '24/7 AI & Human Insights', 'Verified & Human-Reviewed', 'Secure & Compliant'].map((t) => (
                                    <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-gold-500" />{t}</li>
                                ))}
                            </ul>
                        </div>
                        <div id="explore-africa" className="relative scroll-mt-24 lg:col-span-3">
                            <AfricaCountryMap className="mx-auto max-w-sm" />
                            <p className="mt-1 text-center text-[0.65rem] text-ink-400">Hover a country for its name · click to open its Investor Cockpit</p>
                        </div>
                        <aside className={`${panel} lg:col-span-3`} aria-label="Africa by the numbers">
                            <h2 className="mb-3 text-sm font-semibold text-gold-400">Africa by the Numbers</h2>
                            <ul className="space-y-3">
                                {content.numbers.map(([v, l, icon]) => (
                                    <li key={l} className="flex items-center gap-3">
                                        <span className="text-gold-500"><AiimIcon name={icon} /></span>
                                        <span><span className="block text-lg leading-none font-bold">{v}</span><span className="text-xs text-ink-300">{l}</span></span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 rounded border border-gold-700/50 px-2 py-1 text-center text-[0.6875rem] font-semibold tracking-wide text-gold-400">SYNTHETIC DATA ONLY</p>
                        </aside>
                    </div>
                </section>

                {/* Pillars */}
                <section className="container-tbca">
                    <ul className="grid gap-3 rounded-[10px] border border-gold-700/40 bg-ink-900 p-4 sm:grid-cols-2 lg:grid-cols-6">
                        {content.pillars.map(([t, s, icon]) => (
                            <li key={t} className="flex items-start gap-2.5">
                                <span className="text-gold-500"><AiimIcon name={icon} /></span>
                                <span><span className="block text-[0.8125rem] font-semibold">{t}</span><span className="text-xs text-ink-300">{s}</span></span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Cockpit search + snapshot */}
                <section className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                    <div className={`${panel} lg:col-span-4`}>
                        <h2 className="mb-3 text-lg font-semibold">Africa Investor Cockpit</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-ink-300">Select Country</span>
                                <CountryPicker countries={countries} value={country || null} onSelect={(slug) => { setCountry(slug); setProvince(''); }} className="mt-1" label="Select country" />
                                {country && <Link href={`/aiim/country/${country}`} className="mt-1 inline-flex text-xs text-gold-400 hover:underline">Open {countries.find((c) => c.slug === country)?.name} Investor Cockpit →</Link>}
                            </div>
                            {country === 'south-africa' && (
                            <label className="block">
                                <span className="text-xs text-ink-300">Select Province</span>
                                <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 h-10 w-full rounded border border-ink-600 bg-ink-950 px-2 text-parchment-100">
                                    <option value="">All Provinces</option>
                                    {provinces.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                                </select>
                            </label>
                            )}
                            <label className="block">
                                <span className="text-xs text-ink-300">Select Sector</span>
                                <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 h-10 w-full rounded border border-ink-600 bg-ink-950 px-2 text-parchment-100">
                                    <option value="">All Sectors</option>
                                    {sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs text-ink-300">Search keywords</span>
                                <span className="mt-1 flex items-center rounded border border-ink-600 bg-ink-950 px-2">
                                    <Search className="size-4 text-ink-400" />
                                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Green Hydrogen, Logistics" className="h-10 flex-1 bg-transparent px-2 text-parchment-100 outline-none" />
                                </span>
                            </label>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                {[['Opportunities', '/aiim/opportunities'], ['Projects', '/aiim/projects'], ['Investors', '/aiim/investors'], ['Funders', '/aiim/funders']].map(([l, h]) => (
                                    <button key={h} type="button" onClick={() => search(h)} className="h-9 rounded border border-gold-600/60 text-xs font-semibold text-gold-300 hover:bg-gold-500 hover:text-ink-900">Search {l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={`${panel} lg:col-span-4`}>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gold-400">Market Snapshot — Africa</h2>
                            <span className="text-xs text-gold-500">Africa Market (Active)</span>
                        </div>
                        <ul className="divide-y divide-ink-800 text-sm">
                            {content.snapshot.map(([l, v]) => (
                                <li key={l} className="flex justify-between py-2"><span className="text-ink-200">{l}</span><span className="font-semibold">{v}</span></li>
                            ))}
                        </ul>
                    </div>
                    <div className={`${panel} lg:col-span-4`}>
                        <h2 className="mb-2 text-sm font-semibold text-gold-400">Risk Outlook</h2>
                        <Gauge value={3.2} max={5} label="Moderate Risk" caption="Updated today" invert />
                        <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-ink-300">
                            {['Low Risk', 'Moderate', 'Elevated', 'High Risk'].map((l) => <li key={l}>● {l}</li>)}
                        </ul>
                    </div>
                </section>

                {/* Top opportunities + action tiles */}
                <section className="container-tbca grid gap-5 lg:grid-cols-12">
                    <div className={`${panel} lg:col-span-7`}>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Top Opportunities This Week</h2>
                            <Link href="/aiim/opportunities" className="text-xs text-gold-400 hover:underline">View All →</Link>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {top.map((p) => (
                                <Link key={p.slug} href={`/aiim/opportunities/${p.slug}`} className="rounded-[8px] border border-ink-700 bg-ink-950 p-3 hover:border-gold-600">
                                    <p className="flex items-center gap-2 text-sm font-semibold"><span className="text-gold-500"><AiimIcon name={p.icon} /></span>{p.name}</p>
                                    <p className="text-xs text-ink-400">{p.provinceName}</p>
                                    <div className="my-2 flex flex-wrap gap-1"><Chip tone="dark">{p.sectorName}</Chip></div>
                                    <p className="text-[0.6875rem] text-ink-400">Investment Size</p>
                                    <p className="text-sm font-semibold">{p.size}</p>
                                    <p className="mt-1 text-[0.6875rem] text-ink-400">AI Confidence</p>
                                    <p className="text-sm font-semibold text-gold-400">{p.evidence.gradeLabel}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2">
                        {[
                            [Scale, 'Compare', 'Up to 4 items', '/aiim/workspace/compare'], [Bookmark, 'Saved Items', 'Your shortlist', '/aiim/workspace/saved'],
                            [Eye, 'Watchlist', 'Track changes', '/aiim/workspace/watchlist'], [Bell, 'My Alerts', 'Monitoring', '/aiim/workspace/alerts'],
                            [Download, 'Export Data', 'CSV / PDF', '/aiim/fees/discover'], [Bot, 'AI Ask', 'Ask AIIM', '/aiim/methodology'],
                            [FileText, 'Premium Briefs', 'Market & Sector Reports', '/aiim/store'], [BarChart3, 'Wallet & Credits', 'Prepaid unlocks', '/aiim/wallet'],
                        ].map(([Icon, l, s, h]) => {
                            const I = Icon as typeof Scale;
                            return (
                                <Link key={h as string} href={h as string} className="flex items-center gap-2.5 rounded-[8px] border border-ink-700 bg-ink-900 p-3 hover:border-gold-600">
                                    <I className="size-5 text-gold-500" />
                                    <span><span className="block text-[0.8125rem] font-semibold">{l as string}</span><span className="text-[0.6875rem] text-ink-400">{s as string}</span></span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Coverage cards */}
                <section className="container-tbca grid gap-5 py-8 md:grid-cols-2 xl:grid-cols-5">
                    <div className={panel}>
                        <h2 className="text-sm font-semibold">Regional Coverage</h2>
                        <p className="mb-3 text-xs text-ink-400">Explore Africa by region</p>
                        <ul className="space-y-1.5 text-sm">
                            {regions.map(([r, n]) => <li key={r} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-gold-500" />{r} ({n})</li>)}
                        </ul>
                        <a href="#explore-africa" className="mt-4 inline-flex text-xs text-gold-400 hover:underline">View All 54 Countries →</a>
                    </div>
                    <div className={panel}>
                        <h2 className="mb-3 text-sm font-semibold">Platform Overview</h2>
                        <ul className="space-y-1.5 text-xs text-ink-200">
                            {content.platform.map((p) => <li key={p} className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-gold-500" />{p}</li>)}
                        </ul>
                        <Link href="/aiim/methodology" className="mt-4 inline-flex text-xs text-gold-400 hover:underline">How AIIM Works →</Link>
                    </div>
                    <div className={panel}>
                        <h2 className="text-sm font-semibold">Featured Country Insights</h2>
                        <p className="mb-3 text-xs text-ink-400">Key market highlights</p>
                        <ul className="space-y-2 text-sm">
                            {content.countries.map((c) => (
                                <li key={c.code} className="flex items-center justify-between gap-2">
                                    <Link href={`/aiim/country/${c.slug}`} className="hover:text-gold-400">{c.name}</Link>
                                    <Chip tone={levelTone(c.status)}>{c.status}</Chip>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={panel}>
                        <h2 className="text-sm font-semibold">Strategic Sectors</h2>
                        <p className="mb-3 text-xs text-ink-400">High-impact sectors across Africa</p>
                        <ul className="grid grid-cols-3 gap-2 text-center text-[0.65rem]">
                            {sectors.slice(0, 9).map((s) => (
                                <li key={s.slug}>
                                    <Link href={`/aiim/sector/${s.slug}`} className="flex flex-col items-center gap-1 rounded p-1 hover:bg-ink-800">
                                        <span className="text-gold-500"><AiimIcon name={s.icon} /></span>{s.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href="/aiim/sectors" className="mt-3 inline-flex text-xs text-gold-400 hover:underline">Explore Sectors →</Link>
                    </div>
                    <div className={panel}>
                        <h2 className="text-sm font-semibold">Popular Actions</h2>
                        <p className="mb-3 text-xs text-ink-400">Get started with AIIM</p>
                        <ul className="space-y-1 text-[0.8125rem]">
                            {content.actions.map(([l, h]) => (
                                <li key={l}><Link href={h} className="flex items-center justify-between rounded px-1 py-1 hover:bg-ink-800">{l}<ChevronRight className="size-4 text-gold-500" /></Link></li>
                            ))}
                        </ul>
                        <ButtonLink href="/aiim/store?category=Investment+Climate" size="sm" className="mt-3 w-full">Request Country Report</ButtonLink>
                    </div>
                </section>

                <section className="container-tbca pb-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-gold-700/40 bg-ink-900 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-semibold">Move from Data to Decisions with Africa&rsquo;s Smartest Intelligence Platform</h2>
                            <p className="text-sm text-ink-300">Unlock opportunities, reduce risk, and grow across 54 African markets with confidence. Verified sources: {content.verifiedSources.join(', ')}.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <ButtonLink href="/aiim/workspace/advisor-request" trailingIcon="arrow-right">Speak to an Advisor</ButtonLink>
                            <ButtonLink href="/aiim/custom-intelligence" variant="outline-light">Request Custom Intelligence <ArrowRight className="size-4" /></ButtonLink>
                        </div>
                    </div>
                </section>
            </div>
            <Ribbon />
        </>
    );
}
