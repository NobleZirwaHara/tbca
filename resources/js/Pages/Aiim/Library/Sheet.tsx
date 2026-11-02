import { DataTable, type Col } from '@/Components/Industries/Kit';
import { cellNode, csvHref } from '@/Components/CountryHub/IntelData';
import { Hero, PackLoading, PillLink, ProtoFrame, type LibCountry } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';
import type { ServerTableData } from '@/types/industries';

type Row = Record<string, unknown>;
interface Props extends AiimPageProps {
    country: LibCountry;
    sheet: string;
    headers: string[];
    rowCount: number;
    available: boolean;
    filters: string[];
    table: ServerTableData<Row> | null;
}

/** One register sheet, every row, paged on the server. */
export default function Sheet({ country, sheet, headers, rowCount, available, filters, table }: Props) {
    const cols: Col<Row>[] = headers.map((h) => ({ k: h, l: h, r: (x) => cellNode(x[h]), clip: true }));
    const path = `/aiim/country/${country.slug}/registers/${sheet}`;
    return (
        <ProtoFrame title={sheet} crumbs={[{ label: country.name, href: `/aiim/country/${country.slug}` }, { label: 'Data Room', href: `/aiim/country/${country.slug}/registers` }, { label: sheet }]}>
            <Hero eyebrow="Register sheet" title={sheet} lead={`${rowCount.toLocaleString('en-US')} rows × ${headers.length} columns. Columns: ${headers.join(' · ')}.`} actions={<PillLink href={`/aiim/country/${country.slug}/registers`} tone="dark">All sheets</PillLink>} />
            {available && table ? (
                <div className="mt-4 rounded-[12px] border border-parchment-400 bg-white p-4">
                    <DataTable name={sheet} cols={cols} server={table} filters={filters} only={['table']} csvHref={csvHref(path, table)} />
                </div>
            ) : <PackLoading country={country} what={`${sheet} register`} />}
        </ProtoFrame>
    );
}
