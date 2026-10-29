import { Card, Cols, DataTable, Kpi, Kpis, N, STable, StatusChip, Ticks, pct } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase, ServerTableData } from '@/types/industries';

type Row = { code: string; name: string; ind: string; type: string; reason: string; msg: string; src: string; status: string };
interface Props extends IndustryBase {
    match: { total: number; matched: number; priced: number; unmatched: number };
    cnt: Record<string, number>;
    n: number;
    total: number;
    rules: { id: string; type: string; inds: string | string[] }[];
    hits: Record<string, number>;
    table: ServerTableData<Row>;
}

export default function Blocked(p: Props) {
    const qs = new URLSearchParams({ csv: '1', ...(p.table.q ? { q: p.table.q } : {}) });
    Object.entries(p.table.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    return (
        <AdminPage active="blocked" title="Blocked-SKU Register Manager" eyebrow="Governed control · Page 30" desc="Sprints that are blocked or restricted from sale: visibility, client messaging and review workflow." match={p.match}>
            <Kpis>
                <Kpi l="Total blocked / restricted" v={N(p.n)} s={`${pct(p.n, p.total)} % of catalogue (rule hits)`} icon="lock" />
                <Kpi l="Blocked (non-sellable)" v={N(p.cnt.Blocked ?? 0)} icon="alert" />
                <Kpi l="Restricted (conditioned)" v={N(p.cnt.Restricted ?? 0)} icon="shield" />
                <Kpi l="Boundary rules" v={N(p.rules.length)} icon="layers" />
            </Kpis>
            <Cols>
                <Card title="Boundary rules" icon="layers"><STable compact head={['Rule', 'Type', 'Industries', 'Hits']} rows={p.rules.map((r) => [r.id, <StatusChip s={r.type} />, r.inds === '*' ? 'All' : (r.inds as string[]).join(', '), N(p.hits[r.id] ?? 0)])} /></Card>
                <Card title="Client messaging principles" icon="msg"><Ticks items={['Be clear and respectful', 'Explain the reason without exposing confidential rules', 'Offer the approved alternative', 'Direct to a TBCA Advisor or Partner', 'Never encourage workarounds']} /></Card>
            </Cols>
            <Card title="Blocked / restricted Sprints" icon="lock">
                <DataTable<Row> name="blocked-register" server={p.table} only={['table']} csvHref={`/admin/industries/blocked?${qs.toString()}`} filters={['type', 'src']}
                    cols={[{ k: 'code', l: 'Code' }, { k: 'name', l: 'Sprint', clip: true }, { k: 'ind', l: 'Industry', clip: true }, { l: 'Type', r: (r) => <StatusChip s={r.type} />, v: (r) => r.type }, { k: 'reason', l: 'Reason', clip: true }, { k: 'msg', l: 'Client message', clip: true }, { k: 'src', l: 'Rule' }, { k: 'status', l: 'Status' }]} />
            </Card>
        </AdminPage>
    );
}
