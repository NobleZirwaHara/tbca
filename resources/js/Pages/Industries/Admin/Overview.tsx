import { Kpi, Kpis, N, Tile, TileGrid } from '@/Components/Industries/Kit';
import { ADM, AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; total: number; ruleHits: number; reserved: number }

export default function Overview(p: Props) {
    return (
        <AdminPage active="" title="Industries Admin Console" eyebrow="Overview" desc="Governance of the 17 canonical industries, 56 sub-industries and the 7,589 Sprints classified against them." match={p.match}>
            <Kpis>
                <Kpi l="Industries" v="17" s="All active" icon="layers" />
                <Kpi l="Sub-industries" v="56" s="Canonical" icon="tag" />
                <Kpi l="Sprints classified" v={N(p.total)} s="100 % with complexity" icon="check" />
                <Kpi l="Rule hits (blocked/restricted)" v={N(p.ruleHits)} s="Across 8 boundary rules" icon="lock" />
                <Kpi l="Reserved services" v={N(p.reserved)} s="Never sold" icon="alert" />
                <Kpi l="Countries" v="54" s="Every industry active" icon="globe" />
                <Kpi l="Matched to TBCA Sprint records" v={N(p.match.matched)} s={`${N(p.match.unmatched)} classified codes not in the app catalogue`} icon="db" />
            </Kpis>
            <TileGrid>
                {ADM.slice(1).map(([k, l, n]) => <Tile key={k} href={`/admin/industries/${k}`}><b className="text-[0.88rem]">{l}</b><span className="text-[0.72rem] text-ink-400">Mock-up page {n}</span></Tile>)}
            </TileGrid>
        </AdminPage>
    );
}
