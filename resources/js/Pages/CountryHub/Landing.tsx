/* P01 Countries landing (prototype pages-landing.js #/countries). */
import { A, Card, Chip, Flag, Ic, N } from '@/Components/Industries/Kit';
import { BW, cHref, HubPage, HubSprintCard, StateChip } from '@/Components/CountryHub/Layout';
import { HubAfricaMap, MapLegend, STATECOL } from '@/Components/CountryHub/Maps';
import type { CountryOption, HubCountry, HubSprint, Row } from '@/types/countryHub';

interface MapCountry extends CountryOption { pack: string | null; rcs: number }
interface Props {
    map: MapCountry[];
    activated: number;
    packs: number;
    sellable: number;
    updates: Row[];
    waves: [string, string, string][];
    related: HubSprint[];
    za: HubCountry | null;
    actDate: string;
}

const DK = 'border-ink-700 bg-ink-900 text-parchment-200';

function DKpi({ l, v, s, icon }: { l: string; v: string; s: string; icon: string }) {
    return (
        <div className={`flex gap-3 rounded-[6px] border p-3 ${DK}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-[6px] bg-ink-800 text-gold-400"><Ic n={icon} /></span>
            <div className="min-w-0"><div className="text-[0.72rem] text-parchment-400">{l}</div><div className="text-[1.35rem] leading-tight font-bold text-white">{v}</div><div className="text-[0.7rem] text-parchment-400">{s}</div></div>
        </div>
    );
}

export default function Landing({ map, activated, packs, sellable, updates, waves, related, za, actDate }: Props) {
    const bw = map.find((c) => c.iso3 === 'BWA');
    return (
        <HubPage title="Countries | The Business Clinic.Africa" crumbs={[['Countries']]} dark>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="min-w-0">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-400 uppercase">Localise country services, language, currency and payments.</div>
                    <h1 className="mt-2 text-[2rem] leading-tight font-bold text-white sm:text-[2.6rem]">Countries We Serve.<br /><span className="text-gold-400">54 Markets. One Platform.</span></h1>
                    <p className="mt-3 max-w-xl text-[1.02rem] text-parchment-300">Pan-African coverage with global reach. Local intelligence. Regulatory insights. Market opportunities. One trusted platform to expand, invest and grow.</p>
                    <div className={`my-4 rounded-[6px] border p-4 ${DK}`}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-2.5"><Ic n="shield" className="mt-0.5 text-gold-400" /><div><div className="text-[0.8rem]">Current Coverage</div><div className="text-[1.2rem] font-semibold text-gold-400">{activated} Activated Countries</div><div className="text-[0.78rem] text-parchment-400">All African Union member states · activated {actDate}</div></div></div>
                            <div><div className="text-[0.8rem]">Country Intelligence Packs</div><div className="text-[1.2rem] font-semibold text-gold-400">{packs} packs issued</div><div className="text-[0.78rem] text-parchment-400">Botswana fully loaded · remaining packs roll out by wave</div></div>
                        </div>
                        <div className="my-3 border-t border-ink-700" />
                        <div className="text-[0.78rem] text-parchment-400">Every country is activated; prices still resolve service by service.</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <A v="pri" href="/countries/explorer">Explore a Country →</A>
                        <A v="dark" href={cHref(BW, 'gov/activation')}><Ic n="file" /> View Activation Ledger</A>
                        <A v="yellow" href={cHref(BW, 'trade')}>Import &amp; Export Heat Maps</A>
                    </div>
                </div>
                <Card tone="dark" title="Africa · 54 Country Objects" icon="map">
                    <HubAfricaMap countries={map} label="Africa map coloured by country availability state"
                        tip={(iso, name) => { const c = map.find((x) => x.iso3 === iso); return `${name}\nActivated · RCS ${c?.rcs ?? 100}%${c?.pack ? `\nPack ${c.pack}` : ''}`; }} />
                    <MapLegend dark items={[[STATECOL.Activated, `Activated (${activated})`], [STATECOL.Pack, 'Activated + pack issued'], [STATECOL.Full, 'Full pack loaded (Botswana)']]} />
                    <p className="mt-1 text-[0.72rem] text-parchment-400">Click any country to open its profile. Colour is never used alone: hover shows state, RCS and pack.</p>
                </Card>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
                <DKpi l="African Country Objects" v="54" s="Complete geographic coverage" icon="globe" />
                <DKpi l="Sellable Directional Corridors" v={N(sellable)} s="Pairs with corridor evidence · all countries activated" icon="swap" />
                <DKpi l="Raw Theoretical Directional Topology" v="2,862" s="54 × 53 theoretical maximum corridor connections" icon="layers" />
                <DKpi l="Verified sources (Botswana pack)" v="90" s="102 sector facts · 27 macro facts · 76 % grade 3" icon="db" />
                <DKpi l="AI & Human Insights" v="24/7" s="Real-time intelligence and expert review" icon="clock" />
                <DKpi l="No Resolution, No Price" v="✓" s="Country Resolver governs all commercial actions" icon="shield" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card tone="dark" title="Featured Country" icon="star">
                    <div className="flex items-center gap-2.5"><Flag iso2="BW" className="text-[2rem]" /><div><b className="text-[1.1rem] text-white">Botswana</b> <StateChip c={{ iso3: 'BWA' }} /><div className="text-[0.78rem] text-parchment-400">Country pack BW-1.0 · 321 templates · 2,137 ranked leads · 30/30 validator</div></div></div>
                    <div className="my-3 flex flex-wrap gap-1.5"><Chip t="Evidence current" tone="ok" /><Chip t="Prices resolved" tone="ok" /><Chip t="Journey end-to-end" tone="gold" /></div>
                    <A v="pri" block href={cHref(bw ?? BW)}>View Botswana Profile →</A>
                    {za && (
                        <>
                            <div className="my-3 border-t border-ink-700" />
                            <div className="flex items-center gap-2"><Flag iso2="ZA" className="text-[1.3rem]" /><b className="text-white">South Africa</b> <StateChip c={za} /></div>
                            <div className="text-[0.78rem] text-parchment-400">Phase 1 market since 15 Aug 2026 · RCS 100 % · Hard blocks 0</div>
                            <A v="dark" block className="mt-2" href={cHref(za)}>View South Africa Profile →</A>
                        </>
                    )}
                </Card>
                <Card tone="dark" title="Platform Highlights" icon="spark">
                    <ul className="space-y-2 text-[0.85rem]">
                        {[['Country Resolver', 'field-level completeness and dependency engine'], ['Evidence-Backed Intelligence', 'source-graded, current and contradictable facts'], ['Corridor & Fee Transparency', 'direction-aware with six-ledger separation'], ['Import & Export Heat Maps', '54 × 54 partner-by-product views'], ['Sovereign Client Independence', 'evidence integrity protected by design']].map(([a, b]) => (
                            <li key={a} className="flex gap-2"><Ic n="check" className="mt-0.5 text-verified-500" /><span><b className="text-white">{a}</b>: {b}</span></li>
                        ))}
                    </ul>
                </Card>
                <Card tone="dark" title="Recent Platform Updates" icon="bell">
                    {updates.map((r) => (
                        <div key={String(r.ID)} className="flex gap-2 border-b border-ink-700 py-1.5 text-[0.82rem]"><span className="min-w-[40px] text-[0.72rem] text-gold-300">{r.ID}</span><span className="flex-1">{r.Change} <span className="text-parchment-400">· {r.Instrument}</span></span></div>
                    ))}
                    <A sm v="dark" className="mt-2" href={cHref(BW, 'history')}>View all →</A>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card tone="dark" title="Country Readiness Gate" icon="shield" sub="One Architecture. Fifty-Four Countries. Activated by Readiness.">
                    <p className="text-[0.85rem]">A market goes live only when data, language, currency, payments, compliance and delivery capacity all pass.</p>
                    <ul className="mt-2 space-y-1.5 text-[0.85rem]">{['Verified country data pack', 'Approved language and currency', 'Payment and invoicing route', 'Delivery and support capacity'].map((t) => <li key={t} className="flex gap-2"><Ic n="check" className="mt-0.5 text-verified-500" />{t}</li>)}</ul>
                </Card>
                <Card tone="dark" title="Country Activation Waves" icon="layers" sub="Markets go live when the readiness gate passes.">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[0.8rem]">
                            <thead><tr className="border-b border-ink-700 text-[0.72rem] text-parchment-400"><th className="py-1.5 pr-3">Wave</th><th className="py-1.5 pr-3">Focus</th><th className="py-1.5">Exit gate</th></tr></thead>
                            <tbody>{waves.map((w) => <tr key={w[0]} className="border-b border-ink-800"><td className="py-1.5 pr-3 font-bold text-gold-300">{w[0]}</td><td className="py-1.5 pr-3">{w[1]}</td><td className="py-1.5 text-[0.78rem]">{w[2]}</td></tr>)}</tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Card tone="dark" title="Related Sprints" icon="tag" sub="Fixed scope. Fixed price. Human reviewed. Prices from the ECON-R0C catalogue.">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3 text-ink-900">{related.map((s) => <HubSprintCard key={s.code} s={s} c={BW} />)}</div>
            </Card>

            <div className={`flex flex-wrap gap-6 rounded-[6px] border p-4 ${DK}`}>
                {[['shield', 'Human-Reviewed', 'All insights verified by experts'], ['lock', 'Secure & Compliant', 'POPIA & ISO 27001 aligned'], ['db', 'Trusted Data', 'Verified government & private sources'], ['shield', 'Bank-Grade Security', 'Enterprise encryption & access controls'], ['clock', 'Always Current', 'Real-time updates & alerts']].map(([i, a, b]) => (
                    <div key={a} className="flex gap-2"><Ic n={i} className="mt-0.5 text-gold-400" /><div><b className="text-[0.82rem] text-white">{a}</b><div className="text-[0.72rem] text-parchment-400">{b}</div></div></div>
                ))}
            </div>
        </HubPage>
    );
}
