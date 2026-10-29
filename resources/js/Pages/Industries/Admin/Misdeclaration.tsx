import { router } from '@inertiajs/react';
import { B, Card, Kpi, Kpis, N, STable, StatusChip, Ticks } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Row = { id: string; code: string; name: string; declared: string; suspected: string; pri: string; status: string; due: string; i: number };
interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; rows: Row[] }

export default function Misdeclaration(p: Props) {
    const { rows } = p;
    const cnt = (k: string) => rows.filter((r) => r.pri === k).length;
    return (
        <AdminPage active="misdeclaration" title="Misdeclaration & Verification Queue" eyebrow="Harm-first reclassification · Page 32" desc="Review suspected misdeclarations and verify the correct industry, sub-industry and regulatory controls." match={p.match}>
            <Kpis>
                <Kpi l="Total in queue" v={N(rows.filter((r) => !/Resolved/.test(r.status)).length)} s="Cases from rule hits" icon="alert" />
                <Kpi l="High priority" v={N(cnt('High'))} icon="flame" />
                <Kpi l="Medium" v={N(cnt('Medium'))} icon="gauge" />
                <Kpi l="Low" v={N(cnt('Low'))} icon="check" />
            </Kpis>
            <Card title="Harm-first review principles" icon="shield"><Ticks items={['Protect clients and the public first', 'Do not suspend delivery without cause', 'Verify evidence, then reclassify', 'Apply the correct regulatory controls', 'Update fees and permissions']} /></Card>
            <Card title="Verification queue" icon="layers" sub="Queue seeded from boundary-rule hits — client names are not shown">
                <STable head={['Case', 'Sprint', 'Declared', 'Suspected', 'Priority', 'Status', 'Due', '']} rows={rows.map((r) => [
                    <span className="font-mono text-[0.72rem]">{r.id}</span>, <span className="text-[0.8rem]"><b>{r.code}</b> {r.name}</span>, r.declared, r.suspected, <StatusChip s={r.pri} />, <StatusChip s={r.status} />, <span className="whitespace-nowrap">{r.due}</span>,
                    /Resolved/.test(r.status) ? '' : <B sm onClick={() => router.post('/admin/industries/misdeclaration', { i: r.i }, { preserveScroll: true })}>Resolve</B>,
                ])} />
            </Card>
        </AdminPage>
    );
}
