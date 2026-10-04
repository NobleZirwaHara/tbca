import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Row { n: number; milestone: string; pct: number; amount: number; status: string; order: string | null }
interface Props {
    engagement: TechHeader;
    kpis: { contract: number; contract_excl: number; paid: number; outstanding: number; count: number; next: Row | null };
    schedule: Row[];
    transactions: { date: string; type: string; desc: string; ref: string; method: string; amount: number; status: string }[];
}

export default function Payments({ engagement: e, kpis, schedule, transactions }: Props) {
    const [tab, setTab] = useState('tx');
    const csv = () => {
        const rows = [['Date', 'Description', 'Reference', 'Method', 'Amount', 'Status'], ...transactions.map((t) => [t.date, t.desc, t.ref, t.method, String(t.amount), t.status])];
        const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${e.reference}-transactions.csv`;
        a.click();
    };
    return (
        <TechPortal e={e} title="Payments & Receipts" description="Track all payments, receipts and financial transactions related to your engagement.">
            <Head title="Payments & Receipts" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Total Contract Value — Ledger T (Incl. VAT)" value={zar(kpis.contract)} sub={`Excl. VAT: ${zar(kpis.contract_excl)}`} />
                <Stat label="Total Paid (Incl. VAT)" value={zar(kpis.paid)} tone="good" />
                <Stat label="Outstanding Balance (Incl. VAT)" value={zar(kpis.outstanding)} tone="warn" />
                <Stat label="Payments Received" value={kpis.count} />
                <Stat label="Next Payment Due" value={kpis.next ? zar(kpis.next.amount) : '—'} sub={kpis.next?.milestone} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Tabs tabs={[{ key: 'tx', label: 'Payments & Receipts' }, { key: 'schedule', label: 'Payment Schedule' }]} value={tab} onChange={setTab} />
                    <div className="mt-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        {tab === 'tx' ? (
                            <>
                                <SimpleTable columns={['Date', 'Type', 'Description', 'Reference', 'Method', 'Amount (Incl. VAT)', 'Status']} rows={transactions.map((t) => [t.date, t.type, t.desc, <Link href={`/checkout/${t.ref}`} className="font-mono text-xs underline">{t.ref}</Link>, t.method, zar(t.amount), <StatusPill status={t.status} />])} empty="No portal transactions yet." />
                                <div className="mt-3 flex justify-between text-xs text-ink-500"><Button size="sm" variant="outline" onClick={csv}>Download Transactions (CSV)</Button><span>Showing {transactions.length} transactions</span></div>
                            </>
                        ) : (
                            <>
                                <SimpleTable columns={['Milestone', '% of Ledger T', 'Amount (Incl. VAT)', 'Status', '']} rows={[...schedule.map((s) => [`${s.n}. ${s.milestone}`, `${s.pct}%`, zar(s.amount), <StatusPill status={s.status} />, s.status === 'Awaiting Payment' && s.order ? <Link href={`/checkout/${s.order}`} className="text-xs underline">Pay</Link> : '']), [<b>Total</b>, '100%', <b>{zar(kpis.contract)}</b>, '', '']]} />
                                <p className="mt-2 text-xs text-ink-500">All amounts include VAT. Milestone amount = gate share × TBCA fixed fees. External costs (Ledger X) are funded separately and never included here.</p>
                            </>
                        )}
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Payment Methods"><CheckList items={['EFT / Bank Transfer (Preferred)', 'Credit / Debit Card (Secure online payment)', 'Instant EFT & wallet at checkout']} /></Card>
                    <Card title="Documents"><ul className="space-y-1 text-xs"><li>Payment Terms & Conditions (PDF)</li><li>Tax Invoice Template (PDF)</li><li>Banking Details (PDF)</li></ul></Card>
                    <Card title="Need to update your payment details?" tone="gold"><Link href={`/technology-solutions/workspace/${e.reference}/support`} className="text-xs font-semibold underline">Request Change</Link></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Payments.layout = null;
