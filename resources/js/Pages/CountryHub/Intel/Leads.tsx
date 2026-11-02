/* Ranked Leads (prototype pages-intel.js #/c/{ISO}/leads?tab=). The ranked and coverage registers are paged on the server. */
import { usePage } from '@inertiajs/react';
import { Card, DataTable, Kpi, Kpis, N, Note, STable, StatusChip, TagM, Tabs, type Col } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { TLink, TierChip, bandShort, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

type Tab = 'ranked' | 'hotspot' | 'coverage' | 'envelopes';
interface Props { base: CountryBase; tab: Tab; tabs: Record<Tab, string>; table: ServerTableData<Row> | null; rows: Row[] | null; shelf: HubShelf }

const CRUMB: Record<Tab, string> = { ranked: 'Ranked leads', hotspot: 'Hotspot leads', coverage: 'Coverage', envelopes: 'Envelopes' };
const tpl: Col<Row> = { k: 'Template', l: 'Template', r: (x) => <TLink href={cHref(BW, `opp/${s(x.Template)}`)}>{s(x.Template)}</TLink> };
const place: Col<Row> = { k: 'Place', l: 'Place', r: (x) => <TLink href={cHref(BW, `geo/town/${s(x['Place ID'])}`)}>{s(x.Place)}</TLink> };
const tier: Col<Row> = { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> };
const num = (k: string, l = k): Col<Row> => ({ k, l, num: true });
const plain = (...ks: string[]): Col<Row>[] => ks.map((k) => ({ k, l: k }));

export default function Leads({ base, tab, tabs, table, rows, shelf }: Props) {
    const { c } = base;
    const { url } = usePage();
    const csvHref = `${url}${url.includes('?') ? '&' : '?'}csv=1`;
    const list = rows ?? [];
    const view = (() => {
        switch (tab) {
            case 'hotspot':
                return (
                    <Card title="126 hotspot leads with next action" icon="flame">
                        <DataTable<Row> key={tab} name="BW_Hotspot_Leads" rows={list} size={15} filters={['Unit', 'Tier', 'Owner']} cols={[
                            ...plain('Lead ID', 'Hotspot', 'Place', 'Unit'), { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> }, tpl, ...plain('Opportunity', 'Band'),
                            num('Lead score', 'Score'), tier, ...plain('Next action', 'Institution to call', 'Owner', 'Due'),
                        ]} />
                    </Card>
                );
            case 'coverage':
                return table && (
                    <Card title="Coverage — 10,346 template × place rows" icon="db">
                        <DataTable<Row> key={tab} name="BW_Coverage" server={table} only={['table']} csvHref={csvHref} filters={['Sector', 'Unit', 'Tier', 'Band']} cols={[
                            { k: 'Row', l: 'Row' }, tpl, ...plain('Sector', 'Opportunity', 'Band'), place, { k: 'Unit', l: 'Unit' }, num('Gateway km'), num('Lead score', 'Score'), tier,
                        ]} />
                    </Card>
                );
            case 'envelopes':
                return (
                    <Card title="Unit investment envelopes (G-5)" icon="cash">
                        <STable head={['Unit code', 'Unit', 'Envelope US$ m (weighted)', 'Envelope US$ m (equal, DZ rule)', 'Tier A ranked leads']}
                            rows={list.map((r) => [s(r['Unit code']), <TLink key="u" href={cHref(BW, `geo/unit/${s(r['Unit code'])}`)}>{s(r.Unit)}</TLink>, <b key="w">{s(r['Envelope US$ m (weighted)'])}</b>, s(r['Envelope US$ m (equal, DZ rule)']), s(r['Tier A ranked leads'])])} />
                        <Note className="mt-2.5">Weighted by lead score × population <TagM /> — indicative, not a fund commitment.</Note>
                    </Card>
                );
            default:
                return table && (
                    <Card title="2,137 ranked place leads" icon="star" sub="Ranked lead = RA + M + H + F − G">
                        <DataTable<Row> key={tab} name="BW_Ranked_Leads" server={table} only={['table']} csvHref={csvHref} filters={['Sector', 'Unit', 'Tier', 'Persona']} cols={[
                            { k: 'Lead ID', l: 'Lead', r: (x) => <span className="font-mono">{s(x['Lead ID'])}</span> }, tpl, ...plain('Sector', 'Opportunity'), { k: 'Band', l: 'Band', r: (x) => bandShort(x.Band) },
                            ...plain('Persona', 'Citizen-reserved'), num('Rank'), place, { k: 'Unit', l: 'Unit' }, num('Gateway km'), num('RA'), num('M'), num('H'), num('F'), num('G'),
                            num('Lead score', 'Score'), tier, { k: 'Time to revenue', l: 'Time to revenue' }, { k: 'Population', l: 'Population', num: true, r: (x) => N(x.Population) },
                        ]} />
                    </Card>
                );
        }
    })();

    return (
        <CountryPage base={base} pageKey="leads" extraCrumbs={[[CRUMB[tab]]]}>
            <CountryHead base={base} pageKey="leads" title="Ranked Leads" desc="From template to place: who should do what, where, and whom to call first." />
            <Kpis>
                <Kpi l="Ranked leads" v="2,137" s="34 places in ranked lists" icon="star" />
                <Kpi l="Hotspot leads" v="126" s="With next action & institution" icon="flame" />
                <Kpi l="Coverage rows" v="10,346" s="Every template × place" icon="db" />
                <Kpi l="Top-1 concentration" v="46 %" s="19 % under DZ rotation (not used)" icon="layers" />
            </Kpis>
            <Tabs items={Object.entries(tabs) as [string, string][]} active={tab} hrefFor={(k) => cHref(c, 'leads', `?tab=${k}`)} />
            {view}
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
