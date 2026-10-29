import { A, Bars, Card, Cols, DataTable, Kpi, Kpis, N, StatusChip, Ticks, useMoney } from '@/Components/Industries/Kit';
import { Head1, LEDN, LedChip, NoEngagement, WorkspacePage, nowS } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase, LedgerRow, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals }
type Row = LedgerRow & { n: number; when: string };

export default function Ledger(p: Props) {
    const { e, tt } = p;
    const money = useMoney();
    if (!e || !tt) return <WorkspacePage base={p} active="ledger" label="Fee Ledger"><NoEngagement base={p} /></WorkspacePage>;
    const rows: Row[] = e.ledger.map((l, i) => ({ ...l, n: i + 1, when: nowS(l.at) }));
    const fees = (k: string) => e.addons.filter((a) => a.ledger === k && a.fee).reduce((s, a) => s + (a.fee ?? 0), 0);
    const committed = tt.total + e.addons.filter((a) => a.fee).reduce((s, a) => s + (a.fee ?? 0), 0);
    const byLed = (['T', 'P', 'X', 'S'] as const).map((k) => ({ label: LEDN[k], value: k === 'T' ? tt.total : fees(k), text: money(k === 'T' ? tt.total : fees(k)) }));

    return (
        <WorkspacePage base={p} active="ledger" label="Fee Ledger">
            <Head1 eyebrow="Mock-up Page 17" title="Fee Transparency Ledger" desc="A real-time record of every fee, payment, commitment and disbursement for complete transparency." />
            <Kpis>
                <Kpi l="Total committed" v={money(committed)} s="T incl. VAT + P/X estimates" icon="cash" />
                <Kpi l="Total paid" v={money(tt.paid)} s={committed ? `${N((100 * tt.paid) / committed, 1)} % of committed` : ''} icon="check" />
                <Kpi l="Outstanding (T)" v={money(tt.out)} icon="alert" />
                <Kpi l="Disbursed (S)" v={money(0)} s="Statutory fees paid on schedule" icon="file" />
            </Kpis>
            <Cols>
                <Card title="Ledger summary by ledger" icon="layers" sub="Four-ledger model — T / P / X / S"><Bars rows={byLed} /></Card>
                <Card title="Fee policies" icon="shield"><Ticks items={['Every charge, payment and disbursement is recorded and auditable', 'P, X and S items are never bundled into the TBCA fee', 'Refunds follow the Abort Ladder']} /><A sm className="mt-2" href="/industries/workspace/abort">Abort ladder →</A></Card>
            </Cols>
            <Card title="All transactions" icon="file">
                <DataTable<Row> name={`ledger-${e.ref}`} rows={rows} size={10} filters={['type', 'led']}
                    cols={[{ k: 'n', l: '#', num: true }, { k: 'when', l: 'Date' }, { k: 'type', l: 'Type' }, { l: 'Ledger', r: (r) => (r.led && r.led !== '—' ? <LedChip l={r.led} /> : '—'), v: (r) => r.led }, { k: 'desc', l: 'Description', clip: true },
                        { l: 'Amount', r: (r) => (r.amt ? money(r.amt) : '—'), v: (r) => r.amt, num: true }, { l: 'Status', r: (r) => <StatusChip s={r.status} />, v: (r) => r.status }]} />
            </Card>
        </WorkspacePage>
    );
}
