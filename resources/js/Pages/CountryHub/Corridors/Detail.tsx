/* P37 Corridor Detail (prototype pages-corridors.js #/corridors/detail/A/B). */
import { Link } from '@inertiajs/react';
import { A, B, Card, Ic, Kpi, Kpis, STable, sum, TagM, Ticks, useMoney, useToast, useUsdM } from '@/Components/Industries/Kit';
import { cHref } from '@/Components/CountryHub/Layout';
import { HubAfricaMap } from '@/Components/CountryHub/Maps';
import { CorridorHead, CorrPage, corUrl, pairCrumb, type Ledg, type Pair, type Totals } from '@/Components/CountryHub/Corridors';
import type { CountryOption } from '@/types/countryHub';

interface Props { cr: Pair; tot: Totals; map: (CountryOption & { pack: string | null })[]; fl: number; rv: number; gw: string[]; sacu: boolean; ledg: Ledg[] }

export default function Detail({ cr, tot, map, fl, rv, gw, sacu, ledg }: Props) {
    const money = useMoney();
    const usdM = useUsdM();
    const toast = useToast();
    const est = sum(Object.values(tot));
    const strengths = [
        ...(cr.items ? [`${cr.items} evidence items`] : []),
        ...(cr.shared.length ? [`Shared regional bloc: ${cr.shared.join(', ')}`] : []),
        ...(sacu ? ['SACU common external tariff and revenue pool'] : []),
        ...(gw.length ? [`Botswana border gateways: ${gw.join(', ')}`] : []),
        'Service-by-service commercial permission',
    ];
    return (
        <CorrPage crumbs={[pairCrumb(cr, false), ['Corridor Detail']]}>
            <CorridorHead cr={cr} view="detail" title="Corridor Detail" sub={`Evidence-verified view of the ${cr.A.name} → ${cr.B.name} corridor.`}
                back={<A href={`/countries/corridors/select?from=${cr.a}`}><Ic n="back" /> Back to Corridor Selector</A>} />
            <Kpis>
                <Kpi l="Corridor ID" v={cr.id} s="Created 01 Aug 2026" icon="file" />
                <Kpi l="Type / purpose" v={cr.type} s="Market entry" icon="tag" />
                <Kpi l={`Modelled trade ${cr.a}→${cr.b}`} v={usdM(fl)} s={`Reverse ${usdM(rv)}`} icon="ship" />
                <Kpi l="Time to activate (est.)" v={`${cr.days} days`} icon="clock" />
                <Kpi l="Estimated total activation cost" v={money(est)} s="Model basis · six ledgers" icon="cash" />
            </Kpis>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Card title="Corridor Route Map" icon="map">
                    <HubAfricaMap countries={map} dark={false} label={`Route map ${cr.A.name} to ${cr.B.name}`}
                        fill={(iso) => (iso === cr.a ? '#16161b' : iso === cr.b ? '#d6a32e' : '#e9e4d8')} lines={[[cr.a, cr.b, 4, '#c0392b']]} highlight={[cr.a, cr.b]} />
                </Card>
                <div className="grid gap-4">
                    <Card title="Key Corridor Strengths" icon="check"><Ticks items={strengths} /></Card>
                    <Card title="Important Note" icon="alert"><p className="text-[0.82rem]">Commercial availability is subject to service-by-service Country Resolver permission. All 54 endpoints are activated; a corridor sells once its pair evidence passes.</p></Card>
                </div>
            </div>
            <Card title="Fee Transparency (Model Basis) — six ledgers, never combined in a price" icon="cash">
                <STable head={['Ledger', 'Covers', 'Model basis estimate']} rows={ledg.map(([l, n, d]) => [
                    <Link key={l} className="text-controlled-700 hover:underline" href={corUrl(`ledger/${l}`, cr.a, cr.b)}><b>{l}</b> · {n}</Link>, d, money(tot[l]),
                ])} />
                <p className="mt-1.5 text-[0.72rem] text-ink-400">T = sum of entry prices of 8 corridor Sprints in the ECON-R0C catalogue; other ledgers <TagM /> from the mock-up ledger proportions and corridor evidence state.</p>
            </Card>
            <Card title="Activation Timeline (estimated)" icon="clock">
                <STable head={['Stage', 'Days']} rows={[['Resolver mandate & engagement', 'Day 1 – 3'], ['Regulatory & compliance processing', 'Day 4 – 15'], ['Approvals & licences', 'Day 16 – 20'], ['Commercial & service set-up', 'Day 21 – 25'], ['Activation complete', 'Day 25+']]} />
            </Card>
            <div className="flex flex-wrap gap-2">
                <B v="pri" onClick={() => toast.show('Corridor initiation needs TBCA Board approval. Ask a question to start the request.')}>Initiate This Corridor</B>
                <A href={corUrl('compare', cr.a, cr.b)}>Endpoint comparison →</A>
                <A v="yellow" href={cHref(cr.B, 'trade/2', `?partner=${cr.a}`)}>Trade heat map for this pair</A>
            </div>
            {toast.node}
        </CorrPage>
    );
}
