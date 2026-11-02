/* Opportunities (prototype pages-intel.js #/c/{ISO}/opps?tab=). */
import { usePage } from '@inertiajs/react';
import { Card, DataTable, Kpi, Kpis, STable, TagS, Tabs, type Col } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, Why, cHref } from '@/Components/CountryHub/Layout';
import { TLink, TierChip, bandShort, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

type Tab = 'top30' | 'priority' | 'register' | 'persona' | 'downturn';
interface Persona { persona: string; n: number; rows: Row[] }
interface Kpi { templates: unknown; sShare: unknown; aPlus: unknown; a: unknown; b: unknown; c: unknown; robust: unknown; fx: unknown; citizen: unknown }
interface Props { base: CountryBase; tab: Tab; tabs: Record<Tab, string>; kpi: Kpi; data: Row[] | Persona[] | null; table: ServerTableData<Row> | null; shelf: HubShelf }

const CRUMB: Record<Tab, string> = { top30: 'Top 30', priority: 'All 321', register: 'Register', persona: 'By persona', downturn: 'Downturn' };
const oppHref = (id: unknown) => cHref(BW, `opp/${s(id)}`);
const oppLink: Col<Row> = { k: 'Opp ID', l: 'Opp ID', r: (x) => <TLink mono href={oppHref(x['Opp ID'])}>{s(x['Opp ID'])}</TLink> };
const band: Col<Row> = { k: 'Band', l: 'Band', r: (x) => bandShort(x.Band) };
const tier = (k: string, l: string): Col<Row> => ({ k, l, r: (x) => <TierChip t={x[k]} /> });
const plain = (...ks: string[]): Col<Row>[] => ks.map((k) => ({ k, l: k }));

export default function Opps({ base, tab, tabs, kpi, data, table, shelf }: Props) {
    const { c } = base;
    const { url } = usePage();
    const rows = (data ?? []) as Row[];
    const view = (() => {
        switch (tab) {
            case 'priority':
                return (
                    <Card title="All 321 templates — priority ranking with gates" icon="layers">
                        <DataTable<Row> key={tab} name="BW_Priority" rows={rows} size={15} filters={['Sector', 'Tier', 'Persona', 'Citizen-reserved', 'FX earner']} rowHref={(x) => oppHref(x['Opp ID'])} cols={[
                            { k: 'Rank', l: '#', num: true }, oppLink, ...plain('Sector', 'Opportunity'), band, { k: 'Score', l: 'Score', num: true }, { k: 'RA', l: 'RA', num: true },
                            tier('Tier pre-gate', 'Pre-gate'), tier('Tier', 'Tier'), ...plain('Gate reason', 'Robust', 'Persona', 'Citizen-reserved', 'FX earner'),
                        ]} />
                    </Card>
                );
            case 'register':
                return table && (
                    <Card title="Opportunity register (610 entries incl. asset-level)" icon="db">
                        <DataTable<Row> key={tab} name="BW_Opportunities" server={table} only={['table']} csvHref={`${url}${url.includes('?') ? '&' : '?'}csv=1`} filters={['Sector name', 'Model', 'Type']} cols={[
                            { k: 'Opp ID', l: 'Opp ID', r: (x) => <span className="font-mono">{s(x['Opp ID'])}</span> }, ...plain('Sector name', 'Opportunity', 'Evidence trigger', 'Placement', 'Model'),
                            band, tier('Tier', 'Tier'), ...plain('Type', 'Verification owner'),
                        ]} />
                    </Card>
                );
            case 'persona':
                return ((data ?? []) as Persona[]).map((p) => (
                    <Card key={p.persona} title={`Best opportunities for persona: ${p.persona}`} icon="users" sub={`${p.n} templates`}>
                        <STable compact head={['Opp ID', 'Opportunity', 'Band', 'Tier', 'Time to revenue']}
                            rows={p.rows.map((x) => [<TLink key="i" mono href={oppHref(x['Opp ID'])}>{s(x['Opp ID'])}</TLink>, s(x.Opportunity), bandShort(x.Band), <TierChip key="t" t={x.Tier} />, s(x['Time to revenue'])])} />
                    </Card>
                ));
            case 'downturn':
                return (
                    <Card title="Diamond-downturn re-tiering (H-6) — 86 templates re-scored" icon="alert">
                        <DataTable<Row> key={tab} name="BW_Downturn" rows={rows} size={12} filters={['Sector', 'Tier downturn']} cols={[
                            oppLink, ...plain('Sector', 'Opportunity', 'Band'), { k: 'Score', l: 'Score', num: true }, { k: 'RA base', l: 'RA base', num: true }, tier('Tier base', 'Tier base'),
                            { k: 'RA downturn', l: 'RA downturn', num: true }, tier('Tier downturn', 'Tier downturn'),
                        ]} />
                    </Card>
                );
            default:
                return (
                    <Card title="Top 30 — diversified (≤ 3 per sector, 11 sectors)" icon="star" sub={<><TagS s="BW_Top30" /> Score = E + D + P* + (4 − R)</>}>
                        <DataTable<Row> key={tab} name="BW_Top30" rows={rows} size={30} filters={['Sector', 'Persona']} rowHref={(x) => oppHref(x['Opp ID'])} cols={[
                            { k: 'Rank', l: '#', num: true }, oppLink, { k: 'Sector', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity' }, band, { k: 'Score', l: 'Score', num: true },
                            { k: 'RA', l: 'RA', num: true }, tier('Tier', 'Tier'), tier('Downturn tier', 'Downturn'), ...plain('Robust', 'Citizen-reserved', 'FX earner', 'Persona', 'Time to revenue', 'Best place'),
                        ]} />
                    </Card>
                );
        }
    })();

    return (
        <CountryPage base={base} pageKey="opps" extraCrumbs={[[CRUMB[tab] ?? 'Top 30']]}>
            <CountryHead base={base} pageKey="opps" title="Opportunities"
                desc="From 321 sweep templates to a gated, diversified Top 30 — every opportunity carries evidence, a band, a persona, a downturn tier and a place." />
            <Kpis>
                <Kpi l="Sweep templates" v={s(kpi.templates)} s={`${s(kpi.sShare)} % in the S band (US$0.2–1 m)`} icon="layers" />
                <Kpi l="Tier A+" v={s(kpi.aPlus)} icon="star" />
                <Kpi l="Tier A" v={s(kpi.a)} s="After the freshness gate" icon="star" />
                <Kpi l="Tier B / C" v={`${s(kpi.b)} / ${s(kpi.c)}`} icon="layers" />
                <Kpi l="Robust Tier A" v={s(kpi.robust)} s="Survive the diamond downturn" icon="shield" />
                <Kpi l="FX-earning" v={s(kpi.fx)} s={`Citizen-reserved: ${s(kpi.citizen)}`} icon="cash" />
            </Kpis>
            <Tabs items={Object.entries(tabs) as [string, string][]} active={tab} hrefFor={(k) => cHref(c, 'opps', `?tab=${k}`)} />
            {view}
            <Why>A ranked list is only useful if it is honest about concentration: the pack reports top-1 concentration both ways (46 % without rotation, 19 % with the DZ rotation rule) and refuses to manufacture diversity.</Why>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
