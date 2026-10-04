import { Download, Info } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import { SectionCard } from '@/Components/Aiim/Shell';
import { KpiTile } from '@/Components/ui/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Entry { reference: string; date: string; type: string; description: string; code: string | null; category: string; amount: number; vat: number; status: string; document: string | null }

interface Props extends AiimPageProps {
    engagement: Engagement;
    entries: Entry[];
    totals: { paid: number; vat: number; expert: number; external: number; platform: number; adjustments: number };
}

const TABS = ['Ledger Overview', 'All Transactions', 'Payments', 'Refunds', 'Adjustments', 'Invoices & Receipts', 'Audit Trail'];
const FILTER: Record<string, string | null> = { 'Ledger Overview': null, 'All Transactions': null, Payments: 'payment', Refunds: 'refund', Adjustments: 'adjustment', 'Invoices & Receipts': 'fee', 'Audit Trail': null };

export default function Ledger({ engagement: e, entries, totals: t }: Props) {
    const [tab, setTab] = useState(TABS[0]);
    const rows = FILTER[tab] ? entries.filter((x) => x.type === FILTER[tab]) : entries;
    const fees = t.expert + t.external + t.platform + t.adjustments;
    const csv = () => {
        const lines = [['Date', 'Type', 'Description', 'Fee Code', 'Category', 'Amount ex VAT', 'VAT', 'Total', 'Status', 'Document'], ...rows.map((r) => [r.date, r.type, r.description, r.code ?? '', r.category, r.amount, r.vat, r.amount + r.vat, r.status, r.document ?? ''])];
        const url = URL.createObjectURL(new Blob([lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `aiim-ledger-${e.mandate ?? e.reference}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <MandateFrame
            e={e}
            title="Transaction Ledger"
            description="Your complete, immutable record of all fees, payments, refunds and adjustments related to this mandate."
            guidance="The ledger is your authoritative record. Download statements or export for your records anytime."
            stage={e.stage ?? '—'}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Total Engagement Value (ex. VAT)" value={zar2(e.fee)} />
                <KpiTile label="Total Paid (ex. VAT)" value={zar2(t.paid)} caption={e.fee ? `${Math.round((t.paid / e.fee) * 100)}% of engagement` : undefined} />
                <KpiTile label="Total VAT (on payments)" value={zar2(t.vat)} />
                <KpiTile label="Total Platform Fees" value={zar2(t.platform)} />
                <KpiTile label="External Supplier Costs" value={zar2(t.external)} />
                <KpiTile label="Balance Due (incl. VAT)" value={zar2(Math.max(0, e.feeTotal - t.paid - t.vat))} tone="gold" caption="Due before next milestone" />
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
                <SectionCard title="Recent Transactions" action={<button type="button" onClick={csv} className="flex items-center gap-1 text-xs font-semibold text-referenced-700"><Download className="size-3.5" />Export Ledger (CSV)</button>}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-xs">
                            <thead className="text-ink-500"><tr>{['Date', 'Type', 'Description', 'Fee Code', 'Category', 'Amount (ex. VAT)', 'VAT (15%)', 'Total (incl. VAT)', 'Status', 'Receipt / Invoice'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {rows.map((r) => <tr key={r.reference + r.description}><td className="px-2 py-1.5">{r.date}</td><td className="px-2"><Chip tone={r.type === 'payment' ? 'good' : r.type === 'adjustment' ? 'warn' : 'purple'} className="uppercase">{r.type}</Chip></td><td className="px-2">{r.description}</td><td className="px-2 font-mono">{r.code}</td><td className="px-2">{r.category}</td><td className="px-2 text-right">{zar2(r.amount)}</td><td className="px-2 text-right">{zar2(r.vat)}</td><td className="px-2 text-right">{zar2(r.amount + r.vat)}</td><td className="px-2"><span className={r.status === 'Paid' ? 'text-verified-700' : ''}>{r.status}</span></td><td className="px-2 font-mono text-referenced-700">{r.document}</td></tr>)}
                                {rows.length === 0 && <tr><td colSpan={10} className="py-6 text-center text-ink-500">No entries in this view.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 flex gap-1 text-xs text-ink-500"><Info className="size-3.5" />All transactions are recorded in ZAR (South African Rand) and are immutable.</p>
                </SectionCard>
                <SectionCard title="Fee Breakdown (ex. VAT)">
                    <ul className="space-y-2 text-xs">{[['Expert Fees', t.expert], ['External Supplier Costs', t.external], ['Platform Fees', t.platform], ['Adjustments', t.adjustments]].map(([l, v]) => <li key={l as string} className="flex justify-between"><span>{l}</span><span>{zar2(v as number)} ({fees ? (((v as number) / fees) * 100).toFixed(1) : 0}%)</span></li>)}<li className="flex justify-between border-t border-parchment-300 pt-1 font-bold"><span>Total</span><span>{zar2(fees)}</span></li></ul>
                    <button type="button" onClick={() => window.print()} className="mt-3 w-full rounded border border-referenced-500 py-1.5 text-xs font-semibold text-referenced-700">Download Statement (PDF)</button>
                </SectionCard>
            </div>
        </MandateFrame>
    );
}
