import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import AfricaMap from '@/Components/AfricaMap';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { CountrySelector } from '@/Components/Countries/Shell';
import { BUCKETS, bucketDot, Flag, StateBadge } from '@/Components/Countries/ui';
import type { Country, CountryBrief } from '@/types/countries';

interface Props {
    counts: { total: number; activated: number; shell: number; degraded: number; suspended: number; restricted: number; sellable_corridors: number; raw_topology: number; regions: Record<string, number> };
    featured: Country;
    countries: CountryBrief[];
    updates: { title: string; detail: string; date: string | null }[];
}

const INTEL = [
    ['Country Profiles', 'Economic overview, demographics & KPIs', L.Flag],
    ['Business & Investment Climate', 'Ease of doing business, incentives & reforms', L.Briefcase],
    ['Sectors & Opportunities', 'High-growth sectors & emerging industries', L.TrendingUp],
    ['Legal & Regulatory Environment', 'Laws, taxation, trade & compliance', L.Scale],
    ['Infrastructure & Logistics', 'Transport, energy, digital & industrial zones', L.Truck],
    ['Trade & Market Access', 'Agreements, tariffs, trade routes & partners', L.Ship],
] as const;

const ACTIONS: [string, string][] = [
    ['Country Profile Report', '/countries/south-africa'],
    ['Investment Opportunity Scan', '/countries/south-africa/plan/diaspora'],
    ['Regulatory & Compliance Check', '/countries/south-africa/legal'],
    ['Market Entry Advisory', '/countries/south-africa/plan/readiness'],
    ['Partner & Network Connection', '/countries/south-africa/partners'],
    ['Risk & Political Assessment', '/countries/south-africa/limitations'],
    ['Custom Country Intelligence', '/countries/south-africa/quote'],
];

export default function Landing({ counts, featured, countries, updates }: Props) {
    return (
        <div className="bg-ink-950 text-parchment-100">
            <Head title="Countries We Serve" />
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12 lg:py-14">
                    <div className="lg:col-span-6">
                        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                            Countries We Serve.
                            <br />
                            <span className="text-gold-500">54 Markets. One Platform.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-[0.9375rem] text-ink-200">
                            Pan-African coverage with global reach. Local intelligence. Regulatory insights. Market opportunities. One trusted platform to expand, invest and grow.
                        </p>
                        <div className="mt-6 grid max-w-xl gap-4 rounded-[8px] border border-gold-600/40 bg-ink-900/70 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-ink-300">Current Controlled Coverage</p>
                                <p className="text-xl font-bold text-gold-400">{counts.activated} Activated Country</p>
                                <p className="text-xs text-ink-300">South Africa (Phase 1)</p>
                            </div>
                            <div>
                                <p className="text-xs text-ink-300">Other Country Objects</p>
                                <p className="text-xl font-bold text-gold-400">{counts.shell} Shells</p>
                                <p className="text-xs text-ink-300">Not Active / Not Authorised</p>
                            </div>
                            <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-300 sm:col-span-2">
                                <L.Info className="size-3.5" aria-hidden="true" /> Activation and service availability are separate controlled objects.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ButtonLink href="/countries/explorer" variant="gold" size="lg" trailingIcon="arrow-right">Explore a Country</ButtonLink>
                            <ButtonLink href="/countries/activation" variant="outline-light" size="lg" icon="file-text">View Activation Ledger</ButtonLink>
                        </div>
                        <div className="mt-6 max-w-sm">
                            <CountrySelector countries={countries} dark />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] lg:col-span-6">
                        <div className="relative aspect-square max-h-[420px] rounded-[10px] border border-ink-800 bg-ink-900/60 p-4">
                            <AfricaMap activeRegion="southern" />
                            <p className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-ink-950/80 px-2 py-1 text-[0.6875rem] text-gold-300">
                                <L.MapPin className="size-3" aria-hidden="true" /> South Africa — Activated (schematic map)
                            </p>
                        </div>
                        <div className="rounded-[10px] border border-gold-600/40 bg-ink-900/70 p-4">
                            <p className="text-sm font-semibold text-gold-400">Country Status Legend</p>
                            <ul className="mt-3 space-y-3">
                                {BUCKETS.map((b) => (
                                    <li key={b.key} className="flex gap-2.5">
                                        <span className={`mt-1 size-3 shrink-0 rounded-full ring-2 ring-ink-700 ${bucketDot(b.key)}`} aria-hidden="true" />
                                        <span>
                                            <span className="text-[0.8125rem] font-semibold">{b.label} ({counts[b.key]})</span>
                                            <span className="block text-[0.6875rem] text-ink-300">{b.body}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 border-t border-ink-700 pt-2 text-[0.6875rem] text-ink-300">Colour is never used alone. See country profile for details.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container-tbca pb-12">
                <ul className="grid gap-px overflow-hidden rounded-[8px] border border-gold-600/30 bg-gold-600/20 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        [String(counts.total), 'African Country Objects', 'Complete geographic coverage', L.Globe],
                        [String(counts.sellable_corridors), 'Current Sellable Directional Corridors', 'Until pair-specific evidence and release gates pass', L.Layers],
                        [counts.raw_topology.toLocaleString(), 'Raw Theoretical Directional Topology at 54 Countries', 'Theoretical maximum — not a target', L.ArrowLeftRight],
                        ['100+', 'Local Data Sources', 'Government, private and verified sources', L.Database],
                        ['24/7', 'AI & Human Insights', 'Real-time intelligence and expert review', L.ClipboardCheck],
                        ['No Resolution,', 'No Price', 'Country Resolver governs all commercial actions', L.ShieldCheck],
                    ].map(([v, l, b, Icon]) => {
                        const I = Icon as L.LucideIcon;
                        return (
                            <li key={l as string} className="flex gap-3 bg-ink-900 p-4">
                                <I className="size-6 shrink-0 text-gold-500" aria-hidden="true" />
                                <div>
                                    <p className="text-xl font-bold text-parchment-100">{v as string}</p>
                                    <p className="text-[0.75rem] font-semibold text-parchment-200">{l as string}</p>
                                    <p className="text-[0.6875rem] text-ink-300">{b as string}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5">
                        <p className="font-semibold text-gold-400">Featured Country</p>
                        <div className="mt-3 flex items-center gap-3">
                            <Flag iso="ZA" className="text-5xl" />
                            <div>
                                <p className="text-lg font-bold">
                                    {featured.name} <StateBadge bucket={featured.bucket} className="ml-1" />
                                </p>
                                <p className="text-xs text-ink-300">{featured.programme_status}</p>
                                <p className="text-xs text-ink-300">
                                    RCS: {featured.rcs_label} • Hard Blocks: {featured.hard_blocks} • Updated: {featured.last_reviewed}
                                </p>
                            </div>
                        </div>
                        <ul className="mt-4 grid grid-cols-2 gap-2 text-[0.6875rem]">
                            {['Services: service-by-service', 'Payments: conditional by method', 'Compliance OK', 'Evidence Current'].map((c) => (
                                <li key={c} className="flex items-center gap-1.5 rounded border border-ink-700 px-2 py-1 text-ink-200">
                                    <L.CircleCheck className="size-3.5 text-verified-500" aria-hidden="true" /> {c}
                                </li>
                            ))}
                        </ul>
                        <Link href={`/countries/${featured.slug}`} className="mt-4 block rounded border border-gold-600/50 py-2 text-center text-sm font-semibold text-gold-400 hover:bg-gold-500/10">
                            View South Africa Profile →
                        </Link>
                    </div>

                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5">
                        <p className="font-semibold text-gold-400">Platform Highlights</p>
                        <ul className="mt-3 space-y-3">
                            {[
                                ['Country Resolver', 'Field-level completeness and dependency engine', '/countries/south-africa/resolver'],
                                ['Evidence-Backed Intelligence', 'Source-graded, current and contradictable facts', '/countries/south-africa/evidence'],
                                ['Corridor & Fee Transparency', 'Direction-aware with six-ledger separation', '/countries/corridors'],
                                ['Sovereign Client Independence', 'Evidence integrity protected by design', '/countries/sovereign'],
                            ].map(([t, b, h]) => (
                                <li key={t}>
                                    <Link href={h} className="group block">
                                        <span className="text-sm font-semibold group-hover:text-gold-300">{t}</span>
                                        <span className="block text-xs text-ink-300">{b}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gold-400">Recent Platform Updates</p>
                            <Link href="/countries/south-africa/registers/history" className="text-xs text-gold-400 hover:underline">View All →</Link>
                        </div>
                        <ul className="mt-3 divide-y divide-ink-800">
                            {updates.map((u) => (
                                <li key={u.title + u.date} className="flex justify-between gap-3 py-2">
                                    <span>
                                        <span className="text-[0.8125rem] font-semibold">{u.title}</span>
                                        <span className="block text-[0.6875rem] text-ink-300">{u.detail}</span>
                                    </span>
                                    <span className="shrink-0 text-[0.6875rem] text-ink-300">{u.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-4">
                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5">
                        <p className="font-semibold text-parchment-100">Our Coverage</p>
                        <p className="mt-1 text-xs text-ink-300">Africa ({counts.total} country objects — geographic coverage, not commercial availability)</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            {Object.entries(counts.regions).map(([r, n]) => (
                                <li key={r} className="flex items-center gap-2">
                                    <L.CircleCheck className="size-4 text-gold-500" aria-hidden="true" />
                                    <Link href={`/countries/explorer?region=${encodeURIComponent(r)}`} className="hover:text-gold-300">
                                        {r} ({n})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5 lg:col-span-2">
                        <p className="font-semibold text-parchment-100">Market Intelligence You Get</p>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                            {INTEL.map(([t, b, Icon]) => (
                                <li key={t} className="flex gap-2.5">
                                    <Icon className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                                    <span>
                                        <span className="text-[0.8125rem] font-semibold">{t}</span>
                                        <span className="block text-[0.6875rem] text-ink-300">{b}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-[0.6875rem] text-ink-400">Intelligence for shell countries is limited to sourced, evidence-graded material; unsourced fields are shown as UNRESOLVED.</p>
                    </div>
                    <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-5">
                        <p className="font-semibold text-parchment-100">Popular Country Actions</p>
                        <ul className="mt-3 space-y-1.5">
                            {ACTIONS.map(([l, h]) => (
                                <li key={l}>
                                    <Link href={h} className="flex items-center gap-2 text-[0.8125rem] text-ink-200 hover:text-gold-300">
                                        <L.FileText className="size-3.5 text-gold-500" aria-hidden="true" /> {l}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href="/countries/south-africa/quote" className="mt-4 block rounded bg-gold-500 py-2 text-center text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Request Country Report →
                        </Link>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-gold-600/30 bg-ink-900 p-4">
                    <ul className="flex flex-wrap gap-6 text-xs text-ink-200">
                        {['Human-Reviewed — all insights verified by experts', 'Secure & Compliant — POPIA & ISO 27001 aligned', 'Trusted Data — verified government & private sources', 'Always Current — real-time updates & alerts'].map((t) => (
                            <li key={t} className="flex items-center gap-1.5">
                                <L.ShieldCheck className="size-4 text-gold-500" aria-hidden="true" /> {t}
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Country-specific insights', section: 'Countries' })} className="rounded border border-gold-500 px-4 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">
                        Talk to an Expert
                    </button>
                </div>
            </section>
        </div>
    );
}
