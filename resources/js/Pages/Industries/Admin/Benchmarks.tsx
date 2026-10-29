import { Card, Kpi, Kpis, N, STable, StatusChip, Ticks } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Row = { ind: string; bench: string; n: number; nmin: number; k: number; div: number; supp: string; status: string; ue: number };
interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; rows: Row[] }

export default function Benchmarks(p: Props) {
    const { rows } = p;
    const eligible = rows.filter((r) => r.status === 'Eligible').length;
    return (
        <AdminPage active="benchmarks" title="Benchmark Threshold & Data-Governance Console" eyebrow="Governance controlled · Page 33" desc="Configure publication thresholds and governing rules; manage diversity, anonymity and release control." match={p.match}>
            <Kpis>
                <Kpi l="Benchmarks configured" v="17" s="One per industry" icon="layers" />
                <Kpi l="Eligible for publication" v={N(eligible)} s="Contributors below n" icon="check" />
                <Kpi l="Below threshold" v={N(rows.length - eligible)} s="n / k / diversity" icon="alert" />
                <Kpi l="Indicative bands available" v={N(rows.filter((r) => r.ue).length)} s="From BW unit-economics packs" icon="chart" />
            </Kpis>
            <Card title="Benchmark rules & thresholds" icon="gauge" sub="Contributors = signed-in clients who recorded consent on the Benchmark Contribution page">
                <STable head={['Industry', 'Benchmark', 'n (min)', 'k', 'Diversity', 'Suppression', 'Contributors', 'Status']} rows={rows.map((r) => [r.ind, r.bench, r.nmin, r.k, `${r.div} %`, <span className="text-[0.72rem]">{r.supp}</span>, r.n, <StatusChip s={r.status} />])} />
            </Card>
            <Card title="Release control" icon="shield"><Ticks items={['Disclosure Gate before any publication', 'Winsorise at P5 / P95', 'Quarterly refresh; suppression register for every withheld cell', 'Contribution Consent Ledger checked at each release']} /></Card>
        </AdminPage>
    );
}
