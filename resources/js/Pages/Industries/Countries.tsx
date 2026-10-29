import { Card, Chip, DataTable, Flag, N, TagM, fmtM } from '@/Components/Industries/Kit';
import { Head1, IndMap, IndustryPage, scoreCol } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Row = { iso3: string; iso2: string; slug: string; name: string; region: string; s: number; e: number; im: number; rank: number; band: string };
interface Props extends IndustryBase { rows: Row[]; basis: string }

export default function Countries(p: Props) {
    const { ind, rows } = p;
    const by = Object.fromEntries(rows.map((r) => [r.iso3, r]));
    return (
        <IndustryPage base={p} active="countries" label="Industry × 54 Countries">
            <Head1 eyebrow="Industry × 54 Countries" title={`${ind.name} in all 54 countries`} desc="Every country is activated for this industry. Ranked by the modelled opportunity composite; open any row for the full intersection page." />
            <Card>
                <IndMap countries={p.countries} fill={(iso) => scoreCol(by[iso]?.s ?? 0)} tip={(iso, name) => `${name}\n${N(by[iso]?.s, 1)}/100 · rank ${by[iso]?.rank}`} href={(c) => `/industries/${ind.slug}/country/${c.slug}`} label={`${ind.name} by country`} />
            </Card>
            <Card title="Ranking" icon="globe" sub={<><TagM /> {p.basis}</>}>
                <DataTable<Row> name={`countries-${ind.code}`} rows={rows} size={15} sort={0} filters={['region', 'band']} rowHref={(r) => `/industries/${ind.slug}/country/${r.slug}`}
                    cols={[
                        { k: 'rank', l: '#', num: true }, { l: 'Country', r: (r) => <><Flag iso2={r.iso2} /> {r.name}</>, v: (r) => r.name }, { k: 'region', l: 'AU region' },
                        { l: 'Score', r: (r) => <b>{N(r.s, 1)}</b>, v: (r) => r.s, num: true }, { k: 'band', l: 'Band' },
                        { l: 'Exports US$ m', r: (r) => fmtM(r.e), v: (r) => r.e, num: true }, { l: 'Imports US$ m', r: (r) => fmtM(r.im), v: (r) => r.im, num: true },
                        { l: 'Status', r: () => <Chip t="Active" tone="ok" />, v: () => 'Active' },
                    ]} />
            </Card>
        </IndustryPage>
    );
}
