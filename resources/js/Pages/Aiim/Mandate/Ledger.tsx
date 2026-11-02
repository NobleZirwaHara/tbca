import { Btn, Empty, Flow, Panel, Pill, SvcRail, Table, eng, type Country, type Rail } from '@/Components/Aiim/ProtoEngagement';
import { DataTable, Kpi, Kpis, useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Entry { reference: string; date: string; type: string; description: string; code: string; category: string; amount: number; vat: number; status: string }

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    entries: Entry[];
    totals: { paid: number; fees: number; adjustments: number };
    cases: { reference: string; type: string; status: string; created: string }[];
    rail: Rail;
}

/** Page 70 Transaction Ledger: client transaction ledger and statement. */
export default function Ledger({ engagement: e, entries, totals, cases, rail }: Props) {
    const money = useMoney();
    return (
        <Flow title="Transaction Ledger" eyebrow="Page 70 · Client transaction ledger and statement (AAB-EMB-234)" crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]}
            side={<SvcRail rail={rail} context="Ledger" />}>
            {entries.length ? (
                <>
                    <Kpis>
                        <Kpi l="Paid" v={money(totals.paid)} icon="cash" />
                        <Kpi l="Fees billed" v={money(totals.fees)} icon="file" />
                        <Kpi l="Adjustments" v={money(totals.adjustments)} icon="swap" />
                    </Kpis>
                    <DataTable name={`ledger-${e.reference}`} rows={entries} size={15} cols={[
                        { k: 'date', l: 'Date' }, { k: 'type', l: 'Type' }, { k: 'reference', l: 'Reference', r: (x) => <span className="font-mono">{x.reference}</span> },
                        { k: 'description', l: 'Description' }, { k: 'status', l: 'Status', r: (x) => <Pill s={x.status} /> },
                        { k: 'amount', l: 'Amount', num: true, r: (x) => <span className={x.type === 'payment' ? 'text-verified-700' : ''}>{x.type === 'payment' ? '+' : '−'}{money(Math.abs(x.amount))}</span> },
                    ]} />
                </>
            ) : (
                <Empty>
                    <p>No transactions yet.</p>
                    {e.next && <Btn href={e.next.url} size="sm">{e.next.label}</Btn>}
                </Empty>
            )}
            {cases.length > 0 && (
                <Panel title="Requests and cases">
                    <Table head={['Reference', 'Type', 'Status', 'Submitted']} rows={cases.map((c) => [<span className="font-mono">{c.reference}</span>, c.type.replace(/-/g, ' '), <Pill s={c.status} />, c.created])} />
                </Panel>
            )}
        </Flow>
    );
}
