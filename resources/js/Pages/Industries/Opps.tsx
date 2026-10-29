import { Card, DataTable, Kpi, Kpis, N, Tabs, type Col } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, iHref } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type R = Record<string, string | number | null>;
interface Props extends IndustryBase { tab: 'cont' | 'bw' | 'za'; counts: { cont: number; bw: number; za: number }; rows: R[] }

const COLS: Record<string, { cols: Col<R>[]; filters: string[] }> = {
    cont: { cols: [{ k: 'Opp ID', l: 'ID' }, { k: 'Sector', l: 'Sector' }, { k: 'Asset/Group', l: 'Group' }, { k: 'Asset/Commodity', l: 'Asset' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Evidence trigger', l: 'Trigger', clip: true }, { k: 'Investment model', l: 'Model' }, { k: 'Country scope', l: 'Scope' }, { k: 'Status', l: 'Status' }], filters: ['Sector', 'Asset/Group', 'Country scope', 'Status'] },
    bw: { cols: [{ k: 'Opp ID', l: 'ID' }, { k: 'Sector name', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Placement', l: 'Placement', clip: true }, { k: 'Model', l: 'Model' }, { k: 'Band', l: 'Band' }, { k: 'Score', l: 'Score', num: true }, { k: 'Tier', l: 'Tier' }, { k: 'Persona', l: 'Persona' }], filters: ['Sector name', 'Tier', 'Band', 'Persona'] },
    za: { cols: [{ k: 'Opp ID', l: 'ID' }, { k: 'Sector name', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Map placement', l: 'Placement', clip: true }, { k: 'Investment model', l: 'Model' }, { k: 'Country scope', l: 'Scope' }], filters: [] },
};

export default function Opps(p: Props) {
    const { ind, tab, counts } = p;
    return (
        <IndustryPage base={p} active="opps">
            <Head1 eyebrow="Opportunity Register" title={`${ind.name} — opportunities`} desc="Continental templates instantiate in any of the 54 countries where evidence supports them; Botswana and South Africa carry scored and worked instances." />
            <Kpis>
                <Kpi l="Continental templates" v={N(counts.cont)} s="I2_Opportunity_Register" icon="globe" />
                <Kpi l="Botswana instances" v={N(counts.bw)} s="BW_Opportunities" icon="star" />
                <Kpi l="SA worked example" v={N(counts.za)} s="I2_WX_Opportunities" icon="star" />
            </Kpis>
            <Tabs items={[['cont', 'Continental (54)'], ['bw', 'Botswana'], ['za', 'South Africa model']]} active={tab} hrefFor={(k) => `${iHref(ind, 'opps')}?tab=${k}`} />
            <Card><DataTable<R> key={tab} name={`${tab}-opps`} rows={p.rows} size={12} cols={COLS[tab].cols} filters={COLS[tab].filters} /></Card>
        </IndustryPage>
    );
}
