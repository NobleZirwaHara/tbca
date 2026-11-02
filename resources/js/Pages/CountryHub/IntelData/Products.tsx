/* Products & HS Codes (prototype pages-intel.js #/c/{ISO}/products). */
import { Link } from '@inertiajs/react';
import { A, Card, DataTable } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { BwOnly, type BwOnlyData } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    products?: Row[];
    traderChain?: Row[];
    commodities?: Row[];
}

export default function Products({ base, bwOnly, shelf, products = [], traderChain = [], commodities = [] }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="products" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="products">
            <CountryHead base={base} pageKey="products" title="Products & HS Codes" desc="The Botswana product, species and mineral register in English and Setswana with HS 2022 codes, plus the 40-question trader chain and the 85-commodity continental HS list." />
            <Card title="Botswana product register (55)" icon="tag">
                <DataTable<Row> name="BW_Products" rows={products} size={15} filters={['Group', 'Sector']} cols={[
                    { k: 'Group', l: 'Group' }, { k: 'Product', l: 'Product' },
                    { k: 'Setswana [VERIFY]', l: 'Setswana', r: (x) => <i>{x['Setswana [VERIFY]']}</i> },
                    { k: 'HS 2022', l: 'HS 2022', r: (x) => <span className="font-mono">{x['HS 2022']}</span> },
                    { k: 'Sector', l: 'Sector', r: (x) => <Link href={cHref(c, `sector/${x.Sector}`)} className="text-controlled-700 hover:underline">{x.Sector}</Link> },
                    { k: 'Note', l: 'Note' },
                ]} />
            </Card>
            <Card title="Trader chain — 40 questions a trader asks (anchored to Botswana)" icon="users">
                <DataTable<Row> name="BW_Trader_Chain" rows={traderChain} size={10} cols={[
                    { k: 'Code', l: 'Code' }, { k: 'Question', l: 'Question' }, { k: 'Information types', l: 'Information types', clip: true }, { k: 'Tag', l: 'Tag' },
                    { k: 'Map behaviour', l: 'Map behaviour' }, { k: 'Botswana anchor', l: 'Botswana anchor', clip: true },
                ]} />
            </Card>
            <Card title="Continental commodity HS list (85)" icon="globe">
                <DataTable<Row> name="I2_Commodity_HS" rows={commodities} size={10} filters={['Group']} cols={[
                    { k: 'Group', l: 'Group' }, { k: 'Commodity', l: 'Commodity' },
                    { k: 'HS 2022 (6-digit)', l: 'HS', r: (x) => <span className="font-mono">{x['HS 2022 (6-digit)']}</span> },
                    { k: 'Sector', l: 'Sector' }, { k: 'SA model anchor / note', l: 'Anchor / note', clip: true }, { k: 'Commodity-specific must-find', l: 'Must-find', clip: true },
                ]} />
            </Card>
            <div><A v="yellow" href={cHref(c, 'trade')}>Open the Import & Export heat maps →</A></div>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
