/* P35 Corridors landing (prototype pages-corridors.js #/corridors?from=ISO). */
import { Link, router } from '@inertiajs/react';
import { A, Card, Cols, Dl, Flag, Kpi, Kpis, N, Note, TagM, useMoney } from '@/Components/Industries/Kit';
import { HubAfricaMap, type MapLine } from '@/Components/CountryHub/Maps';
import { CorrChip, CorrPage, corUrl, Legend, PTitle, type Endpoint } from '@/Components/CountryHub/Corridors';
import type { CountryOption } from '@/types/countryHub';

interface MapCountry extends CountryOption { pack: string | null; rcs: number }
interface Mine { b: string; iso2: string; name: string; st: string; items: number; conf: number }
interface Props {
    countries: CountryOption[];
    from: Endpoint;
    map: MapCountry[];
    cnt: Record<string, number>;
    sellable: number;
    lines: MapLine[];
    mine: Mine[];
    est: number;
}

export default function Landing({ countries, from, map, cnt, sellable, lines, mine, est }: Props) {
    const money = useMoney();
    const by = Object.fromEntries(mine.map((p) => [p.b, p]));
    const flag = (iso3: string) => map.find((c) => c.iso3 === iso3)?.iso2 ?? '';
    const fl = (iso2: string) => (/^[A-Z]{2}$/.test(iso2) ? String.fromCodePoint(...[...iso2].map((ch) => 127397 + ch.charCodeAt(0))) : '');
    const ev = (cnt['High Confidence'] ?? 0) + (cnt['Evidence Available'] ?? 0) + (cnt['Limited Evidence'] ?? 0);
    return (
        <CorrPage crumbs={[['Corridors']]}>
            <PTitle title="Corridors" desc="Cross-border corridors connect two African countries for trade, investment and capital flows. Every corridor is directional, evidence-gated and resolver-controlled."
                act={<>
                    <label className="sr-only" htmlFor="cf">From</label>
                    <select id="cf" value={from.iso3} onChange={(e) => router.visit(`/countries/corridors?from=${e.target.value}`)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8rem] font-semibold">
                        {countries.map((x) => <option key={x.iso3} value={x.iso3}>From {x.name}</option>)}
                    </select>
                    <A v="pri" href={`/countries/corridors/select?from=${from.iso3}`}>Corridor Selector →</A>
                </>} />
            <Kpis>
                <Kpi l="Sellable Corridors" v={N(sellable)} s="Pairs with evidence · all endpoints activated" icon="check" />
                <Kpi l="Raw Theoretical Maximum" v="2,862" s="All directional pairs (54 × 53)" icon="layers" />
                <Kpi l="Pairs with Evidence" v={N(ev)} s={<>≥ 1 evidence item <TagM /></>} icon="db" />
                <Kpi l="High Confidence Corridors" v={cnt['High Confidence'] ?? 0} s="SACU pairs — ready to progress" icon="check" />
                <Kpi l="Estimated Activation Cost" v={money(est)} s={`For the first ${from.name} corridor · model basis`} icon="cash" />
            </Kpis>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Card title="Corridor Network (Directional Pairs)" icon="map">
                    <HubAfricaMap countries={map} lines={lines} highlight={[from.iso3]} label={`Corridor network from ${from.name}`}
                        tip={(iso, name) => { const p = by[iso]; return p ? `${fl(from.iso2)} ${from.name} → ${fl(flag(iso))} ${name}\n${p.st} · ${p.items} items · ${p.conf} %` : name; }}
                        href={(c) => (c.iso3 === from.iso3 ? null : corUrl('detail', from.iso3, c.iso3))} />
                    <Legend items={[['#2fa35a', 'High confidence'], ['#ffd21f', `Evidence available (from ${from.name})`]]} extra={<span>Click a country to open the {from.name} → country corridor</span>} />
                </Card>
                <div className="grid gap-4">
                    <Card title="Corridor Network Truth" icon="shield">
                        <p className="mb-2 text-[0.82rem]">We show only what is evidence-verified and Resolver-ready.</p>
                        <Dl rows={[['High confidence', cnt['High Confidence'] ?? 0], ['Evidence available', cnt['Evidence Available'] ?? 0], ['Limited evidence', cnt['Limited Evidence'] ?? 0], ['No evidence', N(cnt['No Evidence'] ?? 0)], ['Sellable (evidence + both activated)', N(sellable)]]} />
                        <Note className="mt-2"><b>Our Commitment.</b> No price. No promise. Only verified corridors when governance and evidence are complete.</Note>
                    </Card>
                    <Card title={`Popular corridors from ${from.name}`} icon="swap">
                        {mine.slice(0, 6).map((p) => (
                            <Link key={p.b} href={corUrl('detail', from.iso3, p.b)} className="flex items-center justify-between gap-2 border-b border-parchment-300 py-1.5 text-[0.82rem] text-ink-800 hover:text-gold-700">
                                <span><Flag iso2={from.iso2} /> → <Flag iso2={p.iso2} /> {p.name}</span><CorrChip s={p.st} />
                            </Link>
                        ))}
                    </Card>
                </div>
            </div>
            <Cols n={3}>
                <Card title="Evidence-First"><p className="text-[0.82rem]">Every corridor requires sovereign-source evidence, cross-border evidence and Resolver completeness.</p><Link className="mt-2 inline-block text-[0.82rem] text-controlled-700 hover:underline" href="/countries/corridors/network">View network →</Link></Card>
                <Card title="Fee Transparency"><p className="text-[0.82rem]">Corridor fees are shown only when a corridor is Resolver-complete and governance-approved — always in six separate ledgers.</p><Link className="mt-2 inline-block text-[0.82rem] text-controlled-700 hover:underline" href={corUrl('ledger/T', from.iso3, mine[0]?.b ?? 'ZAF')}>Open Ledger T →</Link></Card>
                <Card title="Governance Controlled"><p className="text-[0.82rem]">Activation requires TBCA Board approval, regulatory eligibility and corridor-specific risk sign-off.</p></Card>
            </Cols>
        </CorrPage>
    );
}
