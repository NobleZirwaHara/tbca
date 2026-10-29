import { Link, router } from '@inertiajs/react';
import { A, Card, Cols, DataTable, Field, Flag, Ic, Kpi, Kpis, N, Note, PillNav, STable, TagM, TagP, fmtM, inputCls, sum, useUsdM } from '@/Components/Industries/Kit';
import { type Crumb, Head1, IndMap, Shell, Stack, heatCol, iHref, tradeHref, txtCol } from '@/Components/Industries/Layout';
import type { Country, IndustryBase } from '@/types/industries';

type C = { iso3: string; iso2: string; slug: string; name: string };
type Row = C & { own: number[]; tot: number[]; o: number; T: number };
interface Props extends IndustryBase {
    country: Country;
    view: number;
    title: string;
    who: 'import' | 'export';
    partner: C | null;
    groups: string[];
    rows: Row[];
    basis: string;
    anchors: { bw_imp_from_za: number; bw_exp_to_za: number };
}

const VIEWS: Record<number, [string, 'import' | 'export', boolean]> = { 1: ['Imports vs Whole-Africa Exports', 'import', false], 2: ['Imports vs One Partner’s Exports', 'import', true], 3: ['Exports vs Whole-Africa Imports', 'export', false], 4: ['Exports vs One Partner’s Imports', 'export', true] };
const short = (g: string) => g.replace(/\s*\(HS[^)]*\)/, '');

export default function Trade(p: Props) {
    const { ind, country: c, view: v, who, partner, groups, rows } = p;
    const usdM = useUsdM();
    const defP = c.iso3 === 'ZAF' ? 'botswana' : 'south-africa';
    const q = (k: number, pp?: string | null) => `?view=${k}${VIEWS[k][2] ? `&partner=${pp ?? partner?.slug ?? defP}` : ''}`;
    const crumbs: Crumb[] = [['Industries', '/industries'], [ind.name, iHref(ind)], [c.name, `/industries/${ind.slug}/country/${c.slug}`], ['Import & Export', tradeHref(ind, c.slug)], [`${v} · ${p.title}`]];

    const selector = (
        <Card>
            <div className="flex flex-wrap items-end gap-3">
                <Field label="Industry" className="min-w-[min(100%,200px)]">
                    <select className={inputCls} value={ind.code} onChange={(e) => { const x = p.industries.find((i) => i.code === e.target.value); if (x) router.visit(`${tradeHref(x, c.slug)}${q(v)}`); }}>
                        {p.industries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                    </select>
                </Field>
                <Field label="Selected country" className="min-w-[min(100%,200px)]">
                    <select className={inputCls} value={c.iso3} onChange={(e) => { const x = p.countries.find((k) => k.iso3 === e.target.value); if (x) router.visit(`${tradeHref(ind, x.slug)}${q(v)}`); }}>
                        {p.countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}
                    </select>
                </Field>
                {partner && (
                    <Field label="Partner" className="min-w-[min(100%,200px)]">
                        <select className={inputCls} value={partner.iso3} onChange={(e) => { const x = p.countries.find((k) => k.iso3 === e.target.value); if (x) router.visit(`${tradeHref(ind, c.slug)}${q(v, x.slug)}`); }}>
                            {p.countries.filter((x) => x.iso3 !== c.iso3).map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}
                        </select>
                    </Field>
                )}
                <div className="ms-auto"><PillNav items={[1, 2, 3, 4].map((k) => ({ label: `${k} · ${VIEWS[k][1] === 'import' ? 'Imports' : 'Exports'} · ${VIEWS[k][2] ? 'partner' : 'Africa'}`, href: `${tradeHref(ind, c.slug)}${q(k)}`, on: k === v }))} /></div>
            </div>
        </Card>
    );

    if (!groups.length) {
        return (
            <Shell title={`Import & Export · ${ind.name} · ${c.name}`} crumbs={crumbs}>
                <Stack>
                    {selector}
                    <Card title={`${ind.name} is a services industry`} icon="swap">
                        <p className="text-[0.88rem]">The intra-African matrix covers goods (10 HS groups). Services trade for {ind.name} is <TagP /> pending a services-trade feed. You can still view the goods heat maps for {c.name} through a goods industry such as Manufacturing & Industrial.</p>
                        <A v="yellow" className="mt-3" href={tradeHref({ slug: 'manufacturing-industrial' }, c.slug)}><Ic n="swap" /> {c.name} Import & Export (manufactured goods)</A>
                    </Card>
                </Stack>
            </Shell>
        );
    }

    const max = Math.max(...rows.flatMap((r) => r.own), 1);
    const ownTot = sum(rows.map((r) => r.o));
    const byIso = Object.fromEntries(rows.map((r) => [r.iso3, r]));
    const pair = partner ? rows.find((r) => r.iso3 === partner.iso3) : null;
    const top = rows[0];

    return (
        <Shell title={`Import & Export · ${ind.name} · ${c.name}`} crumbs={crumbs}>
            <Stack>
                <Head1 eyebrow={`Import & Export · ${ind.name}`} title={`${v} · ${p.title}`}
                    desc={`${who === 'import' ? `What ${c.name} buys` : `What ${c.name} sells`} in ${ind.name} HS groups (${groups.map(short).join('; ')})${partner ? ` — with ${partner.name}` : ' — against all of Africa'}.`}
                    act={<><A href={`/industries/${ind.slug}/country/${c.slug}`}><Ic n="back" /> Back to intersection</A></>} />
                {selector}
                <Kpis>
                    <Kpi l={who === 'import' ? 'Industry imports' : 'Industry exports'} v={usdM(ownTot)} s="Intra-African · modelled" icon="ship" />
                    <Kpi l="Partners with flows" v={N(rows.filter((r) => r.o > 0).length)} s="of 53" icon="globe" />
                    <Kpi l="Top partner" v={top ? top.name : '—'} s={top ? usdM(top.o) : ''} icon="star" />
                    <Kpi l="Top-3 concentration" v={ownTot ? `${N((100 * sum(rows.slice(0, 3).map((r) => r.o))) / ownTot, 0)} %` : '—'} s="Share of flows" icon="gauge" />
                </Kpis>
                {partner && pair && (
                    <Card title={`${c.name} ↔ ${partner.name} · ${ind.name}`} icon="swap" sub="US$ m · modelled">
                        <STable head={['HS group', who === 'import' ? `${c.name} imports from ${partner.name}` : `${c.name} exports to ${partner.name}`, who === 'import' ? `${partner.name} exports to Africa` : `${partner.name} imports from Africa`, 'Share', 'Headroom']}
                            rows={groups.map((g, k) => { const a = pair.own[k], b = pair.tot[k]; return [short(g), <b>{fmtM(a)}</b>, fmtM(b), b ? `${N((100 * a) / b, 1)} %` : '—', fmtM(Math.max(0, b - a))]; })} />
                    </Card>
                )}
                <Cols>
                    <Card title="Partner choropleth" icon="map" sub="Click a partner for the pair view">
                        <IndMap countries={p.countries} highlight={[c.iso3, ...(partner ? [partner.iso3] : [])]}
                            fill={(iso) => (iso === c.iso3 ? '#23232a' : heatCol(byIso[iso]?.o ?? 0, top ? top.o : 1))}
                            tip={(iso, name) => (iso === c.iso3 ? `${name} (selected)` : `${name}\n${who === 'import' ? 'Supplies' : 'Buys'} US$ ${fmtM(byIso[iso]?.o ?? 0)} m`)}
                            href={(x) => (x.iso3 === c.iso3 ? null : `${tradeHref(ind, c.slug)}?view=${who === 'import' ? 2 : 4}&partner=${x.slug}`)} />
                    </Card>
                    <Card title="Partner × product heat matrix" icon="layers" sub="US$ m · top 25 partners">
                        <div className="max-h-[440px] max-w-full overflow-auto rounded-[6px] border border-parchment-400">
                            <table className="w-full border-collapse text-[0.72rem]">
                                <thead className="sticky top-0 bg-parchment-200"><tr><th className="px-2 py-1.5 text-left">Partner</th>{groups.map((g) => <th key={g} title={g} className="px-2 py-1.5 text-left font-semibold">{short(g)}</th>)}<th className="px-2 py-1.5 text-right">Total</th></tr></thead>
                                <tbody>
                                    {rows.slice(0, 25).map((r) => (
                                        <tr key={r.iso3} className="border-b border-parchment-300">
                                            <td className="px-2 py-1 whitespace-nowrap"><Link href={`${tradeHref(ind, c.slug)}?view=${who === 'import' ? 2 : 4}&partner=${r.slug}`} className="hover:underline"><Flag iso2={r.iso2} /> {r.name}</Link></td>
                                            {r.own.map((x, i) => <td key={i} className="px-2 py-1 text-right" style={{ background: heatCol(x, max), color: txtCol(x, max) }}>{fmtM(x)}</td>)}
                                            <td className="px-2 py-1 text-right font-bold">{fmtM(r.o)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Cols>
                <Card title="Ranked partners" icon="chart">
                    <DataTable<Row> key={`${v}-${c.iso3}`} name={`${ind.code}-${c.iso3}-view${v}`} rows={rows} size={10} sort={1} dir={-1}
                        cols={[{ l: 'Partner', r: (r) => <><Flag iso2={r.iso2} /> {r.name}</>, v: (r) => r.name }, { l: who === 'import' ? 'Imports from' : 'Exports to', r: (r) => fmtM(r.o), v: (r) => r.o, num: true },
                            { l: who === 'import' ? 'Partner exports to Africa' : 'Partner imports from Africa', r: (r) => fmtM(r.T), v: (r) => r.T, num: true }, { l: 'Share %', r: (r) => (r.T ? N((100 * r.o) / r.T, 1) : '—'), v: (r) => (r.T ? r.o / r.T : 0), num: true }]} />
                </Card>
                <Note><b><TagM /> Basis.</b> {p.basis} Values are US$ m (display currency converts at the platform's daily rates). Botswana anchors: imports from South Africa US$ {N(p.anchors.bw_imp_from_za)} m; exports to South Africa US$ {N(p.anchors.bw_exp_to_za)} m.</Note>
            </Stack>
        </Shell>
    );
}
