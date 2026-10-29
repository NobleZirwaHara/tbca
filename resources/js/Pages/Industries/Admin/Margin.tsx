import { router } from '@inertiajs/react';
import { Bars, Card, Cols, DataTable, Kpi, Kpis, N, STable, StatusChip, TagM, pct, useMoney } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase, ServerTableData } from '@/types/industries';

type Row = { code: string; name: string; cxl: string; family: string; tier: string; cost: number; mod: number; adj: number; floor: number; price: number; gp: number; status: string };
interface Props extends IndustryBase {
    match: { total: number; matched: number; priced: number; unmatched: number };
    sel: { code: string; name: string } | null;
    cnt: Record<string, number>;
    n: number;
    noPrice: number;
    avg: number;
    mods: Record<string, number>;
    cxn: Record<string, string>;
    table: ServerTableData<Row>;
}

export default function Margin(p: Props) {
    const money = useMoney();
    const { cnt, n } = p;
    const qs = new URLSearchParams({ csv: '1', ...(p.sel ? { ind: p.sel.code } : {}), ...(p.table.q ? { q: p.table.q } : {}) });
    Object.entries(p.table.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    return (
        <AdminPage active="margin" title="Complexity Modifier & Margin Console" eyebrow="Canonical cost truth · Page 29" desc="Maintain complexity classes C1–C5, apply modifiers and manage margin, floor and pricing guidance." match={p.match}>
            <div>
                <label className="text-[0.8rem]">Industry modifier{' '}
                    <select className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={p.sel?.code ?? ''} onChange={(e) => router.get('/admin/industries/margin', e.target.value ? { ind: e.target.value } : {})}>
                        <option value="">All Sprints (no industry modifier)</option>
                        {p.industries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                    </select>
                </label>
            </div>
            <Kpis>
                <Kpi l="Viable Sprints" v={N(n)} s={p.sel ? p.sel.name : 'All industries'} icon="tag" />
                <Kpi l="Above floor" v={N(cnt['Above floor'] ?? 0)} s={`${pct(cnt['Above floor'] ?? 0, n)} %`} icon="check" />
                <Kpi l="At floor" v={N(cnt['At floor'] ?? 0)} s={`${pct(cnt['At floor'] ?? 0, n)} %`} icon="gauge" />
                <Kpi l="Below floor" v={N((cnt['Below floor'] ?? 0) + (cnt['Below cost'] ?? 0))} s={`${N(cnt['Below cost'] ?? 0)} below cost`} icon="alert" />
                <Kpi l="Avg. margin (adjusted)" v={`${N(100 * p.avg, 1)} %`} s="Target ≥ 25 %" icon="chart" />
            </Kpis>
            <Cols>
                <Card title="Complexity component guide" icon="cog">
                    <STable compact head={['Class', 'Modifier', 'Meaning']} rows={([[1, 'Scope-light checklists and templates'], [2, 'Standard fixed-scope delivery'], [3, 'Premium, retainers, subscriptions'], [4, 'Partner-delivered, quote-route, due diligence'], [5, 'Board / investor-ready, rescue, transactions']] as [number, string][]).map(([k, t]) => [p.cxn[String(k)], `× ${p.mods[String(k)].toFixed(2)}`, <span className="text-[0.78rem]">{t}</span>])} />
                    <p className="mt-2 text-[0.72rem] text-ink-400"><TagM /> Modifier framework 0.70–1.50; industry uplift +5 % (C3) or +10 % (C4–C5 industries). Floor = adjusted cost × 1.25. Base cost is the ECON-R0C catalogue cost for the entry tier; selling price is the TBCA Sprint record's price.{p.noPrice ? ` ${N(p.noPrice)} viable Sprints have no app price and are left out.` : ''}</p>
                </Card>
                <Card title="Margin health" icon="gauge" sub="Catalogue cost vs TBCA selling price after modifiers"><Bars rows={['Above floor', 'At floor', 'Below floor', 'Below cost'].map((k) => ({ label: k, value: cnt[k] ?? 0, text: N(cnt[k] ?? 0), tone: k.startsWith('Below') ? 'bad' : '' }))} /></Card>
            </Cols>
            <Card title="Complexity & cost build-up" icon="cash">
                <DataTable<Row> name="margin-console" server={p.table} only={['table']} csvHref={`/admin/industries/margin?${qs.toString()}`} filters={['cxl', 'status', 'family']}
                    cols={[{ k: 'code', l: 'Code' }, { k: 'name', l: 'Sprint', clip: true }, { k: 'cxl', l: 'Class' }, { l: 'Base cost', r: (r) => money(r.cost), v: (r) => r.cost, num: true }, { l: 'Modifier', r: (r) => `× ${r.mod.toFixed(2)}`, v: (r) => r.mod, num: true },
                        { l: 'Adjusted cost', r: (r) => money(r.adj), v: (r) => r.adj, num: true }, { l: 'Floor', r: (r) => money(r.floor), v: (r) => r.floor, num: true }, { l: 'Selling price', r: (r) => money(r.price), v: (r) => r.price, num: true },
                        { l: 'Margin', r: (r) => `${N(100 * r.gp, 1)} %`, v: (r) => r.gp, num: true }, { l: 'Status', r: (r) => <StatusChip s={r.status} />, v: (r) => r.status }]} />
            </Card>
        </AdminPage>
    );
}
