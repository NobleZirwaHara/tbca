import { router } from '@inertiajs/react';
import { Card, DataTable, Kpi, Kpis, N, SrcTag } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { Country, IndustryBase } from '@/types/industries';

type Row = { name: string; type: string; what: string; time: string; status: string; src: string; sectors: string; n: number };
interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; country: Country; rows: Row[] }

export default function Regulators(p: Props) {
    const { country: c, rows } = p;
    return (
        <AdminPage active="regulators" title="Sector Regulator Register" eyebrow="Governance controlled · Page 31" desc="Regulators, permissions, opinions and compliance requirements for each industry and jurisdiction (all 54)." match={p.match}>
            <div>
                <label className="text-[0.8rem]">Jurisdiction{' '}
                    <select className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={c.iso3} onChange={(e) => router.get('/admin/industries/regulators', { iso: e.target.value })}>
                        {p.countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}
                    </select>
                </label>
            </div>
            <Kpis>
                <Kpi l="Regulators / roles" v={N(rows.length)} s={c.name} icon="scale" />
                <Kpi l="Sourced" v={N(rows.filter((r) => !['Placeholder', 'Reference'].includes(r.src)).length)} s="From country registers" icon="check" />
                <Kpi l="Reference" v={N(rows.filter((r) => r.src === 'Reference').length)} s="Verify before reliance" icon="book" />
                <Kpi l="To verify" v={N(rows.filter((r) => r.src === 'Placeholder').length)} s="Named by the country pack" icon="alert" />
            </Kpis>
            <Card title="Register" icon="scale" sub={c.iso3 === 'BWA' ? 'BW_Permits issuers and BW_Institutions' : c.iso3 === 'ZAF' ? 'Mock-up register (Page 31) — reference' : 'Role placeholders until the country pack names each body'}>
                <DataTable<Row> key={c.iso3} name={`regulators-${c.iso3}`} rows={rows} size={15} filters={['type', 'src']}
                    cols={[{ k: 'name', l: 'Regulator / role', clip: true }, { k: 'type', l: 'Type' }, { k: 'sectors', l: 'Industries', clip: true }, { k: 'n', l: '#', num: true }, { k: 'what', l: 'Permissions / scope', clip: true }, { k: 'time', l: 'Typical time' }, { k: 'status', l: 'Status' }, { l: 'Source', r: (r) => <SrcTag src={r.src} />, v: (r) => r.src }]} />
            </Card>
        </AdminPage>
    );
}
