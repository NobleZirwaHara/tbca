import { Link } from '@inertiajs/react';
import { DataTable, type Col } from '@/Components/Industries/Kit';
import { Hero, Kpi, N, PackLoading, PillLink, ProtoFrame, Section, type LibCountry } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

interface Row { sheet: string; rows: number; cols: number; cells: number; src: string | null; pages: string }
interface Props extends AiimPageProps {
    country: LibCountry;
    summary: string | null;
    kpis: { blocks: number; blocksSrc: number | null; tables: number; tablesSrc: number | null; cells: number; cellsSrc: number | null; services: number } | null;
    rows: Row[];
}

/** Coverage report: every pack block and register cell counted into the build. */
export default function Coverage({ country, summary, kpis, rows }: Props) {
    const base = `/aiim/country/${country.slug}`;
    const cols: Col<Row>[] = [
        { k: 'sheet', l: 'Sheet', r: (x) => <Link href={`${base}/registers/${x.sheet}`} className="font-mono text-controlled-700 hover:underline">{x.sheet}</Link> },
        { k: 'rows', l: 'Rows', num: true, r: (x) => N(x.rows) },
        { k: 'cols', l: 'Cols', num: true },
        { k: 'cells', l: 'Cells', num: true, r: (x) => N(x.cells) },
        { k: 'src', l: 'Source check', r: (x) => (x.src ? <span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.72rem] font-semibold text-verified-700">{x.src}</span> : '—') },
        { k: 'pages', l: 'Presented on' },
    ];
    return (
        <ProtoFrame title="Coverage Report" crumbs={[{ label: country.name, href: base }, { label: 'Coverage Report' }]}>
            <Hero
                eyebrow="Coverage report"
                title={country.isBW ? '100 % of both Botswana documents is in the prototype' : `${country.name} coverage`}
                lead={country.isBW && kpis ? `Every docx block (${kpis.blocks}) renders in the Country Pack reader and in context on the designed pages; every register cell renders in the Data Room and on the pages listed below. Build-time check: ${summary}.` : 'The coverage check runs when the country pack is loaded.'}
                actions={<><PillLink href={`${base}/pack`}>Country Pack</PillLink><PillLink href={`${base}/registers`} tone="dark">Data Room</PillLink></>}
            />
            {kpis ? (
                <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Kpi label="Docx blocks" value={N(kpis.blocks)} sub={kpis.blocksSrc ? `${N(kpis.blocksSrc)} in source` : undefined} />
                        <Kpi label="Docx tables" value={N(kpis.tables)} sub={kpis.tablesSrc ? `${N(kpis.tablesSrc)} in source` : undefined} />
                        <Kpi label="Register cells" value={N(kpis.cells)} sub={kpis.cellsSrc ? `${N(kpis.cellsSrc)} non-empty in source` : undefined} />
                        <Kpi label="Embedded services" value={N(kpis.services)} sub="581 in Batch 4D" />
                    </div>
                    <Section title="Sheet-by-sheet" sub="Rows × columns delivered, the source count from the build check, and the pages that present the sheet.">
                        <div className="rounded-[12px] border border-parchment-400 bg-white p-4"><DataTable name="coverage" cols={cols} rows={rows} size={100} compact /></div>
                    </Section>
                </>
            ) : <PackLoading country={country} what="coverage report" />}
        </ProtoFrame>
    );
}
