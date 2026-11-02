/* Data Room: one register, every row, paged on the server (prototype pages-intel.js #/c/{ISO}/dataroom/{SHEET}). */
import { A, Card, DataTable, Ic, N, TagS } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { cellNode, csvHref } from '@/Components/CountryHub/IntelData';
import type { CountryBase, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

interface Props {
    base: CountryBase;
    sheet: string;
    headers: string[];
    rowCount: number;
    filters: string[];
    table: ServerTableData<Row>;
}

export default function Sheet({ base, sheet, headers, rowCount, filters, table }: Props) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="dataroom" extraCrumbs={[[sheet]]} noRight>
            <CountryHead base={base} pageKey="dataroom" title={sheet} desc={`${N(rowCount)} rows × ${headers.length} columns`}
                act={<A href={cHref(BW, 'dataroom')}><Ic n="back" /> All sheets</A>} />
            <Card title={sheet} icon="db" sub={<TagS s={sheet} />}>
                <DataTable<Row> name={sheet} server={table} only={['table']} filters={filters} csvHref={csvHref(cHref(c, `dataroom/${sheet}`), table)}
                    cols={headers.map((h) => ({ k: h, l: h, clip: true, r: (x: Row) => cellNode(x[h]) }))} />
            </Card>
        </CountryPage>
    );
}
