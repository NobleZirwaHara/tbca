/* P38 Corridor Endpoint Comparison (prototype pages-corridors.js #/corridors/compare/A/B). */
import type { ReactNode } from 'react';
import { A, Card, Flag, Ic, N, STable, TagR, TagS } from '@/Components/Industries/Kit';
import { cHref, StateChip } from '@/Components/CountryHub/Layout';
import { CorridorHead, CorrPage, corUrl, pairCrumb, type Pair } from '@/Components/CountryHub/Corridors';

interface Ep {
    iso3: string; iso2: string; slug: string; name: string; region: string; rcs: number; capital: string | null; currency: string | null; languages: string | null;
    recs: string | null; pop: number | null; gdp: number | null; landlocked: boolean; bench: [string, string][];
}
interface Props { cr: Pair; ea: Ep; eb: Ep }

const rowsOf = (c: Ep): [ReactNode, ReactNode][] => [
    ['Country state', <StateChip key="s" c={c} />], ['Activation scope', 'Full (pan-African)'], ['RCS', `${c.rcs} %`], ['Region', `${c.region} Africa`],
    [<>Capital <TagR /></>, c.capital], [<>Currency <TagR /></>, c.currency], [<>Languages <TagR /></>, c.languages], [<>RECs <TagR /></>, c.recs || '—'],
    [<>Population (m) <TagR /></>, N(c.pop, 1)], [<>GDP (US$ bn) <TagR /></>, N(c.gdp)], ['Landlocked', c.landlocked ? 'Yes' : 'No'],
    ...c.bench.map(([m, v]): [ReactNode, ReactNode] => [<>{m} <TagS s="Bench" /></>, v]),
];

export default function Compare({ cr, ea, eb }: Props) {
    const A1 = rowsOf(ea), B1 = rowsOf(eb);
    return (
        <CorrPage crumbs={[pairCrumb(cr), ['Endpoint Comparison']]}>
            <CorridorHead cr={cr} view="compare" title="Corridor Endpoint Comparison" sub={`Compare the departure and arrival endpoints for ${cr.A.name} → ${cr.B.name}.`}
                back={<A href={corUrl('detail', cr.a, cr.b)}><Ic n="back" /> Back to Corridor Detail</A>} />
            <Card title="Endpoint Comparison">
                <STable head={['Attribute', <><Flag iso2={ea.iso2} /> {ea.name} (departure)</>, <><Flag iso2={eb.iso2} /> {eb.name} (arrival)</>]}
                    rows={A1.map((r, i) => [r[0], r[1], B1[i]?.[1] ?? ''])} />
            </Card>
            <div className="flex flex-wrap gap-2">
                <A href={cHref(ea)}>View {ea.name} profile</A>
                <A href={cHref(eb)}>View {eb.name} profile →</A>
                <A href={corUrl('evidence', cr.a, cr.b)}>Pair evidence →</A>
            </div>
        </CorrPage>
    );
}
