/* Data Room: every sheet of the Deep Registers workbook (prototype pages-intel.js #/c/{ISO}/dataroom). */
import { Link } from '@inertiajs/react';
import { Card, DataTable, N } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { BwOnly, type BwOnlyData } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Sheet { sheet: string; rows: number; cols: number; h: string[] }
interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    index?: Sheet[];
    totalRows?: number;
    coverage?: { summary: string | null; sheets: { s: string; r: string }[] };
}

export default function Dataroom({ base, bwOnly, shelf, index = [], totalRows = 0, coverage }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="dataroom" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    const sheetHref = (s: string) => cHref(c, `dataroom/${s}`);
    return (
        <CountryPage base={base} pageKey="dataroom">
            <CountryHead base={base} pageKey="dataroom" title="Data Room — 62 register sheets"
                desc={`TBCA_AIIM_Botswana_Deep_Registers_BW-1.0.xlsx, every sheet and every row, searchable and exportable. ${N(totalRows)} rows in total.`} />
            <Card title="Sheets" icon="db">
                <DataTable<Sheet> name="register_index" rows={index} size={63} rowHref={(x) => sheetHref(x.sheet)} cols={[
                    { k: 'sheet', l: 'Sheet', r: (x) => <Link href={sheetHref(x.sheet)} className="text-controlled-700 hover:underline">{x.sheet}</Link> },
                    { k: 'rows', l: 'Rows', num: true, r: (x) => N(x.rows), v: (x) => x.rows },
                    { k: 'cols', l: 'Columns', num: true, v: (x) => x.cols },
                    { k: 'h', l: 'Headers', v: (x) => (x.h || []).join(' · '), clip: true },
                ]} />
            </Card>
            {coverage && coverage.sheets.length > 0 && (
                <Card title="Register cross-check (workbook vs packed data)" icon="check" sub={coverage.summary ?? undefined}>
                    <DataTable<{ s: string; r: string }> name="coverage" rows={coverage.sheets} size={10} cols={[{ k: 's', l: 'Sheet' }, { k: 'r', l: 'Result' }]} />
                </Card>
            )}
        </CountryPage>
    );
}
