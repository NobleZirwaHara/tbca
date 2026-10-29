import { Bars, Card, DataTable, Kpi, Kpis, N, StatusChip, useMoney } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase, ServerTableData } from '@/types/industries';

type Row = { code: string; name: string; type: string; family: string; cxl: string; primary: string; core: string; apps: number; rule: string; inApp: string; ep: number | null };
interface Props extends IndustryBase {
    match: { total: number; matched: number; priced: number; unmatched: number };
    kpi: { sprints: number; single: number; hits: number };
    famBars: { label: string; n: number }[];
    table: ServerTableData<Row>;
}

export default function Classification(p: Props) {
    const money = useMoney();
    const qs = new URLSearchParams({ csv: '1', ...(p.table.q ? { q: p.table.q } : {}) });
    Object.entries(p.table.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    return (
        <AdminPage active="classification" title="Sprint Classification Console" eyebrow="Page 28" desc="Every Sprint classified to a service family and complexity class, then mapped to the industries it serves." match={p.match}>
            <Kpis>
                <Kpi l="Sprints" v={N(p.kpi.sprints)} s="ECON-R0C catalogue" icon="tag" />
                <Kpi l="Service families" v="26" s="A–Z" icon="layers" />
                <Kpi l="Single-industry core" v={N(p.kpi.single)} icon="check" />
                <Kpi l="Rule hits" v={N(p.kpi.hits)} s="Boundary rules matched" icon="lock" />
                <Kpi l="Matched to app Sprints" v={`${N(p.match.matched)} of ${N(p.match.total)}`} s={`${N(p.match.unmatched)} not in the app catalogue · ${N(p.match.priced)} priced`} icon="db" />
            </Kpis>
            <Card title="Sprints by service family" icon="chart" sub="Family from code letter, family suffix, archetype aspect or keyword classifier"><Bars rows={p.famBars.map((f) => ({ label: f.label, value: f.n }))} /></Card>
            <Card title="Classification register" icon="tag">
                <DataTable<Row> name="sprint-classification" server={p.table} only={['table']} csvHref={`/admin/industries/classification?${qs.toString()}`} filters={['family', 'cxl', 'type', 'primary', 'inApp']}
                    cols={[{ k: 'code', l: 'Code' }, { k: 'name', l: 'Sprint', clip: true }, { k: 'type', l: 'Type' }, { k: 'family', l: 'Family' }, { k: 'cxl', l: 'Complexity' }, { k: 'primary', l: 'Primary industry' }, { k: 'core', l: 'Core for' }, { k: 'apps', l: 'Applicable (of 17)', num: true }, { k: 'rule', l: 'Rule' },
                        { l: 'App Sprint record', r: (r) => <StatusChip s={r.inApp === 'Matched' ? 'Matched · active' : r.inApp} />, v: (r) => r.inApp }, { l: 'App price from', r: (r) => money(r.ep), v: (r) => r.ep ?? 0, num: true }]} />
            </Card>
        </AdminPage>
    );
}
