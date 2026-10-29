import { Link } from '@inertiajs/react';
import { Card, CatChip, Chip, Kpi, Kpis, Method, Meter, N, STable } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Row = { code: string; slug: string; name: string; cat: string; stage: string; score: number; cov: number; sprints: number; act: number };
interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; rows: Row[] }

export default function Pipeline(p: Props) {
    const { rows } = p;
    const avg = rows.reduce((s, r) => s + r.score, 0) / Math.max(1, rows.length);
    return (
        <AdminPage active="pipeline" title="Industry Activation Pipeline & Performance" eyebrow="Control tower S0–S8 · Page 34" desc="End-to-end view of industry lifecycle activation and performance across the 17 canonical industries — all live in 54 countries." match={p.match}>
            <Kpis>
                <Kpi l="Industries" v="17" s="100 % of canonical" icon="layers" />
                <Kpi l="Fully activated (S7–S8)" v="17" s="100 %" icon="check" />
                <Kpi l="In progress" v="0" icon="clock" />
                <Kpi l="Avg activation score" v={`${N(avg, 0)} %`} s="Target 80 %" icon="gauge" />
                <Kpi l="Countries live per industry" v="54" s="All activated" icon="globe" />
            </Kpis>
            <Card title="Pipeline S0–S8" icon="layers"><Method on={7} items={['S0 Intake · 0', 'S1 Scoping · 0', 'S2 Classification · 0', 'S3 Controls · 0', 'S4 Content & Cost · 0', 'S5 Review & Approvals · 0', 'S6 UAT & Quality · 0', 'S7–S8 Live · 17']} /></Card>
            <Card title="Industry activation status" icon="chart">
                <STable head={['Industry', 'Stage', 'Activation score', 'Coverage', 'Sprints mapped', 'Sellable', 'Catalogue']} rows={rows.map((r) => [
                    <Link href={`/industries/${r.slug}`} className="text-controlled-700 hover:underline">{r.name}</Link>, <Chip t={r.stage} tone="ok" />,
                    <div className="min-w-[90px]"><Meter p={r.score} tone={r.score >= 80 ? 'ok' : 'warn'} /><span className="text-[0.72rem]">{r.score} %</span></div>, `${r.cov} %`, N(r.sprints), N(r.act), <CatChip cat={r.cat} />,
                ])} />
            </Card>
            <Card title="Top risks & issues" icon="alert">
                <ul className="list-disc space-y-1 ps-5 text-[0.82rem]"><li><b>High</b> — country-specific regulator names outstanding for 52 of 54 countries (packs pending)</li><li><b>Medium</b> — benchmark contributors below n for all 17 industries</li><li><b>Medium</b> — Education & Skills catalogue below threshold</li><li><b>Low</b> — partner listings awaiting onboarding</li></ul>
            </Card>
        </AdminPage>
    );
}
