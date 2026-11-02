/* Investor & Trader Questions (prototype pages-intel.js #/c/{ISO}/infotypes). */
import { Card, DataTable, Kpi, Kpis, Tabs, type Col } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { BwOnly, csvHref, type BwOnlyData } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    tab?: string;
    tabs?: [string, string][];
    chain?: Row[] | null;
    table?: ServerTableData<Row> | null;
    filters?: string[];
}

const CHAIN: Col<Row>[] = [
    { k: 'Code', l: 'Code' }, { k: 'Question', l: 'Question' }, { k: 'Information types', l: 'Information types', clip: true }, { k: 'Tag', l: 'Tag' },
    { k: 'Map behaviour', l: 'Map behaviour' }, { k: 'Botswana anchor', l: 'Botswana anchor', clip: true },
];
const BWI: Col<Row>[] = [
    { k: 'Row ID', l: 'Row ID' }, { k: 'Sector', l: 'Sector' }, { k: 'Asset ID', l: 'Asset ID' }, { k: 'Asset/opportunity type', l: 'Asset type', clip: true }, { k: 'Origin', l: 'Origin' },
    { k: 'Q', l: 'Q' }, { k: 'Question', l: 'Question', clip: true }, { k: 'Information type', l: 'Information type', clip: true }, { k: 'Tag', l: 'Tag' },
    { k: 'Map behaviour', l: 'Map behaviour', clip: true }, { k: 'Botswana anchor', l: 'Botswana anchor', clip: true },
];
const BWT: Col<Row>[] = [
    { k: 'Row ID', l: 'Row ID' }, { k: 'Group', l: 'Group' }, { k: 'Product', l: 'Product' }, { k: 'HS', l: 'HS' }, { k: 'Q', l: 'Q' },
    { k: 'Question', l: 'Question', clip: true }, { k: 'Information type', l: 'Information type', clip: true }, { k: 'Tag', l: 'Tag' },
    { k: 'Map behaviour', l: 'Map behaviour', clip: true }, { k: 'Botswana anchor', l: 'Botswana anchor', clip: true },
];

export default function Infotypes({ base, bwOnly, shelf, tab = 'investor', tabs = [], chain, table, filters = [] }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="infotypes" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    const path = cHref(c, 'infotypes');
    let body = null;
    if ((tab === 'investor' || tab === 'trader') && chain) {
        body = (
            <Card title={tab === 'investor' ? 'Investor chain — IQ01–IQ45' : 'Trader chain — TQ01–TQ40'} icon="users">
                <DataTable<Row> key={tab} name={tab === 'investor' ? 'BW_Investor_Chain' : 'BW_Trader_Chain'} rows={chain} size={15} cols={CHAIN} />
            </Card>
        );
    } else if (table) {
        const bwi = tab === 'bwi';
        body = (
            <Card title={bwi ? '18,810 investor information types (asset × question)' : '5,600 trader information types (product × question)'} icon="db">
                <DataTable<Row> key={tab} name={bwi ? 'BW_Investor_InfoTypes' : 'BW_Trader_InfoTypes'} server={table} only={['table']} filters={filters}
                    csvHref={csvHref(path, table, { tab })} cols={bwi ? BWI : BWT} />
            </Card>
        );
    }
    return (
        <CountryPage base={base} pageKey="infotypes">
            <CountryHead base={base} pageKey="infotypes" title="Investor & Trader Questions" desc="What an investor or a trader needs to know, asset by asset and product by product — and where in Botswana the answer is anchored." />
            <Kpis>
                <Kpi l="Investor questions" v="45" s="IQ01–IQ45" icon="users" />
                <Kpi l="Investor info types" v="18,810" s="418 assets × 45" icon="db" />
                <Kpi l="Trader questions" v="40" s="TQ01–TQ40" icon="users" />
                <Kpi l="Trader info types" v="5,600" s="140 products × 40" icon="db" />
            </Kpis>
            <Tabs items={tabs} active={tab} hrefFor={(k) => `${path}?tab=${k}`} />
            {body}
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
