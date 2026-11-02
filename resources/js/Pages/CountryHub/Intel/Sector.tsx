/* Sector page (prototype pages-intel.js #/c/{ISO}/sector/{CODE}). */
import { A, Card, Cols, DataTable, GradeChip, Kpi, Kpis, PillNav, STable, pct } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { DocBlocks, ExtLink, TLink, TierChip, bandShort, s, type DocBlock } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase; code: string; name: string; sect: Record<string, string>; facts: Row[]; shock: Row; pri: Row[]; chains: Row[]; mapStack: Row[];
    permits: Row[]; products: Row[]; unitEconomics: Row[]; doc: DocBlock[]; shelf: HubShelf;
}

export default function Sector({ base, code: k, name: n, sect, facts, shock: sh, pri, chains, mapStack, permits, products, unitEconomics, doc, shelf }: Props) {
    const oppHref = (id: unknown) => cHref(BW, `opp/${s(id)}`);
    return (
        <CountryPage base={base} pageKey="sectors" extraCrumbs={[[n]]}>
            <CountryHead base={base} pageKey="sectors" title={n}
                desc={`Sector ${k} · ${facts.length} facts · ${pri.length} sweep templates · shock index ${s(sh.Index)} (downturn ${s(sh['Downturn index'])}).`} />
            <PillNav items={Object.keys(sect).map((x) => ({ label: x, href: cHref(BW, `sector/${x}`), on: x === k }))} />
            <Kpis>
                <Kpi l="Facts" v={facts.length} s={`${pct(facts.filter((f) => String(f.Grade) === '3').length, facts.length)} % grade 3`} icon="db" />
                <Kpi l="Templates" v={pri.length} s="In the 321 sweep" icon="layers" />
                <Kpi l="Tier A+ / A" v={pri.filter((x) => /A/.test(s(x.Tier))).length} s="After freshness gate" icon="star" />
                <Kpi l="Shock index" v={s(sh.Index)} s={`${s(sh.Rationale).slice(0, 60)}…`} icon="alert" />
                <Kpi l="Products" v={products.length} s="In the EN/Setswana register" icon="tag" />
            </Kpis>
            <Card title="Sector facts" icon="db">
                <DataTable<Row> name={`BW_Facts_${k}`} rows={facts} size={8} cols={[
                    { k: 'Fact ID', l: 'ID', r: (x) => <span className="font-mono">{s(x['Fact ID'])}</span> }, { k: 'Fact', l: 'Fact' }, { k: 'Value', l: 'Value', clip: true },
                    { k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Grade', l: 'Grade', r: (x) => <GradeChip g={x.Grade} /> }, { k: 'URL', l: '', r: (x) => <ExtLink href={x.URL} /> },
                ]} />
            </Card>
            <Cols>
                <Card title="Investor & trader chains" icon="users">
                    <DataTable<Row> name={`BW_Chains_${k}`} rows={chains} size={8} filters={['Chain']} cols={[
                        { k: 'Chain', l: 'Chain' }, { k: '#', l: '#' }, { k: 'Question', l: 'Question' }, { k: 'Information types', l: 'Information', clip: true },
                        { k: 'Map behaviour', l: 'Map behaviour' }, { k: 'Evidence', l: 'Evidence' }, { k: 'Institution/role', l: 'Institution/role' },
                    ]} />
                </Card>
                <Card title="Map stack" icon="map" sub="Layers + permit pathway">
                    <STable compact head={['Layer', 'Levels', 'Geometry', 'Illumination']} rows={mapStack.map((r) => [s(r.Layer), s(r.Levels), s(r.Geometry), s(r.Illumination)])} />
                    <div className="my-3 border-t border-parchment-300" />
                    <STable compact head={['Permits', 'Issuer', 'Typical time']} rows={permits.map((r) => [s(r.Permits), s(r.Issuer), s(r['Typical time'])])} />
                </Card>
            </Cols>
            <Card title="Opportunities in this sector (priority ranking)" icon="star">
                <DataTable<Row> name={`BW_Priority_${k}`} rows={pri} size={10} filters={['Tier', 'Persona']} rowHref={(x) => oppHref(x['Opp ID'])} cols={[
                    { k: 'Rank', l: 'Rank', num: true }, { k: 'Opp ID', l: 'Opp ID', r: (x) => <TLink mono href={oppHref(x['Opp ID'])}>{s(x['Opp ID'])}</TLink> },
                    { k: 'Opportunity', l: 'Opportunity' }, { k: 'Band', l: 'Band', r: (x) => bandShort(x.Band) }, { k: 'Score', l: 'Score', num: true }, { k: 'RA', l: 'RA', num: true },
                    { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> }, { k: 'Persona', l: 'Persona' }, { k: 'Time to revenue', l: 'Time to revenue' },
                ]} />
            </Card>
            {unitEconomics.length > 0 && (
                <Card title="Invest-in-a-Box unit economics" icon="cash" act={<A sm href={cHref(BW, 'invest')}>Investment case →</A>}>
                    <STable head={['ID', 'Pack', 'Band', 'Capex P m', 'Revenue P m', 'After-tax P m', 'Payback yrs', 'Project IRR']}
                        rows={unitEconomics.map((u) => [s(u.ID), s(u.Pack), s(u.Band), s(u['Capex P m']), s(u['Revenue P m']), s(u['After-tax P m']), s(u['Payback yrs']), <b key="i">{s(u['Project IRR'])}</b>])} />
                </Card>
            )}
            <Card title="Products in this sector" icon="tag">
                <STable compact head={['Product', 'Setswana', 'HS 2022', 'Note']}
                    rows={products.map((p) => [s(p.Product), <i key="t">{s(p['Setswana [VERIFY]'])}</i>, <span key="h" className="font-mono">{s(p['HS 2022'])}</span>, s(p.Note)])} />
            </Card>
            {doc.length > 0 && (
                <Card title="Worked example from the Country Pack (Part F)" icon="book" sub={`${doc.length} blocks — investor and trader chains anchored to Botswana`}>
                    <div className="max-h-[520px] overflow-auto"><DocBlocks blocks={doc} /></div>
                </Card>
            )}
            <SprintShelf shelf={shelf} c={base.c} />
        </CountryPage>
    );
}
