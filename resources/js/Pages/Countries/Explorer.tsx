import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import * as L from 'lucide-react';
import AfricaMap from '@/Components/AfricaMap';
import { CountrySelector, Frame } from '@/Components/Countries/Shell';
import { BUCKETS, bucketDot, Card, FilterSelect, Flag, Kpi, Note, Pager, StateBadge, Table } from '@/Components/Countries/ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { Country, CountryBrief } from '@/types/countries';

interface Props {
    counts: Record<string, any>;
    rows: Country[];
    total: number;
    page: number;
    perPage: number;
    filters: Record<string, string>;
    regions: string[];
    categories: { value: string; label: string }[];
    countries: CountryBrief[];
}

const REGION_IDS: Record<string, string> = { 'North Africa': 'north', 'West Africa': 'west', 'Middle Africa': 'central', 'East Africa': 'east', 'Southern Africa': 'southern' };

export default function Explorer({ counts, rows, total, page, perPage, filters, regions, categories, countries }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const path = '/countries/explorer';
    const grid = filters.view === 'grid';

    return (
        <Frame
            title="Country Explorer"
            lead="Explore and compare African country objects with resolver state, evidence quality and availability at a glance."
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: 'Country Explorer' }]}
            actions={<div className="w-64"><CountrySelector countries={countries} /></div>}
        >
            <form
                className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(path, { ...filters, q: q || undefined, page: undefined }, { preserveScroll: true });
                }}
            >
                <label className="block text-[0.6875rem] font-medium text-ink-500">
                    Search countries
                    <span className="mt-1 flex">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type country name..." className="h-9 w-full rounded-l-[4px] border border-parchment-500 px-2 text-[0.8125rem] focus:border-gold-500 focus:outline-none" />
                        <button type="submit" className="rounded-r-[4px] border border-l-0 border-parchment-500 px-2" aria-label="Search"><L.Search className="size-4" /></button>
                    </span>
                </label>
                <FilterSelect label="Region" name="region" value={filters.region} options={regions.map((r) => ({ value: r, label: r }))} path={path} query={filters} />
                <FilterSelect label="Availability State" name="state" value={filters.state} options={BUCKETS.map((b) => ({ value: b.key, label: b.label }))} path={path} query={filters} />
                <FilterSelect label="Service Category" name="category" value={filters.category} options={categories} path={path} query={filters} />
                <div className="text-[0.6875rem] font-medium text-ink-500">
                    View
                    <div className="mt-1 flex gap-1">
                        {(['list', 'grid'] as const).map((v) => (
                            <button key={v} type="button" onClick={() => router.get(path, { ...filters, view: v, page: undefined })} className={cn('flex h-9 flex-1 items-center justify-center rounded-[4px] border', (filters.view ?? 'list') === v ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-white')} aria-pressed={(filters.view ?? 'list') === v}>
                                {v === 'grid' ? <L.LayoutGrid className="size-4" /> : <L.List className="size-4" />} <span className="sr-only">{v}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Kpi label="African Country Objects" value={counts.total} caption="Complete geographic coverage" icon="globe" />
                <Kpi label="Activated" value={counts.activated} caption="Commercially active, service-by-service" icon="shield-check" tone="good" />
                <Kpi label="Shells" value={counts.shell} caption="Country objects created, not yet activated" icon="layers" />
                <Kpi label="Current Sellable Directional Corridors" value={counts.sellable_corridors} caption="Until pair-specific evidence and release gates pass" icon="link" />
                <Kpi label="Local Data Sources" value="100+" caption="Government, private and verified" icon="database" />
                <Kpi label="No Resolution," value="No Price" caption="Country Resolver governs all commercial actions" icon="lock" tone="gold" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                <Card title="African Country Objects Map">
                    <div className="aspect-square rounded-[6px] bg-ink-900 p-3">
                        <AfricaMap activeRegion={filters.region ? REGION_IDS[filters.region] : 'southern'} onSelect={(id) => {
                            const name = Object.entries(REGION_IDS).find(([, v]) => v === id)?.[0];
                            router.get(path, { ...filters, region: name, page: undefined });
                        }} />
                    </div>
                    <ul className="mt-3 space-y-2">
                        {BUCKETS.map((b) => (
                            <li key={b.key} className="flex gap-2 text-xs">
                                <span className={`mt-0.5 size-3 shrink-0 rounded-full ${bucketDot(b.key)}`} aria-hidden="true" />
                                <span><b>{b.label} ({counts[b.key]})</b> — {b.body}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-[0.6875rem] text-ink-400">Click a region or a row to view details. Schematic map.</p>
                </Card>

                <Card title={`All African Country Objects (${counts.total})`} action={<span className="text-xs text-ink-500">{total} match</span>}>
                    {grid ? (
                        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {rows.map((c) => (
                                <li key={c.iso2}>
                                    <Link href={`/countries/${c.slug}`} className="block rounded-[6px] border border-parchment-400 p-3 hover:border-gold-500">
                                        <div className="flex items-center gap-2">
                                            <Flag iso={c.iso2} className="text-2xl" />
                                            <span className="font-semibold text-ink-900">{c.name}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-ink-500">{c.region}</p>
                                        <div className="mt-2 flex items-center justify-between text-xs">
                                            <StateBadge bucket={c.bucket} label={c.state_label} />
                                            <span>RCS {c.rcs_label}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Table
                            columns={['Country', 'Region', 'Availability State', 'Resolver Completeness (RCS)', 'Evidence Currentness', 'Last Updated', 'View']}
                            rows={rows.map((c) => [
                                <span className="flex items-center gap-2 font-medium text-ink-900"><Flag iso={c.iso2} className="text-lg" />{c.name}</span>,
                                c.region,
                                <StateBadge bucket={c.bucket} label={c.state_label} />,
                                c.rcs_label,
                                <span className={c.evidence_currentness === 'current' ? 'text-verified-700' : 'text-ink-500'}>{c.evidence_currentness === 'current' ? 'Current' : 'Partial'}</span>,
                                c.last_reviewed,
                                <Link href={`/countries/${c.slug}`} className="rounded border border-gold-500 px-2 py-1 text-xs font-semibold text-gold-800 hover:bg-gold-50">View Profile</Link>,
                            ])}
                            empty="No country objects match these filters."
                        />
                    )}
                    <Pager page={page} total={total} perPage={perPage} path={path} query={filters} />
                    <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-500"><L.Info className="size-3.5" /> Resolver Completeness (RCS): measures completeness of all required fields. 100% required for price resolution.</p>
                </Card>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Note tone="warn" title="Important Notice">Country objects not shown as Activated are not transaction-permitted. All prices are suppressed until Country Resolver completeness is 100% and a valid ResolvedPricePermit is in place.</Note>
                <Note title="Evidence First">All commercial actions are evidence-backed. Currentness and confidence matter.</Note>
                <Note tone="bad" title="No Bypass">No override. No manual set to 100%. No fail-open. No assumptions.</Note>
                <div className="rounded-[6px] border border-parchment-400 bg-white p-3 text-[0.8125rem]">
                    <p className="font-semibold">Questions?</p>
                    <p className="text-ink-500">Speak to our specialists or ask a question.</p>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Country Explorer', section: 'Countries' })} className="mt-2 rounded border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-800">Ask a Question →</button>
                </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[
                    ['Activation Ledger', 'View public activation status for all countries', '/countries/activation'],
                    ['Unmet Demand', 'Register interest and see captured demand', '/countries/south-africa/waitlist'],
                    ['Corridors', 'Explore directional corridors and pair permissions', '/countries/corridors'],
                    ['Evidence Manifest', 'Browse sources, freshness and contradictions', '/countries/south-africa/registers/manifest'],
                    ['Sovereign Clients', 'View sovereign client engagements', '/countries/sovereign'],
                    ['Country Admin', 'Administrator control and management', '/admin/countries'],
                ].map(([t, b, h]) => (
                    <li key={t}>
                        <Link href={h} className="flex h-full items-start justify-between gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 hover:border-gold-500">
                            <span><span className="text-[0.8125rem] font-semibold">{t}</span><span className="block text-[0.6875rem] text-ink-500">{b}</span></span>
                            <L.ArrowRight className="size-4 text-gold-600" />
                        </Link>
                    </li>
                ))}
            </ul>
        </Frame>
    );
}
