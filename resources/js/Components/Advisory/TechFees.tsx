import { LedgerBadge, zar, zarRange } from '@/Components/Advisory/ui';
import { StatusPill } from '@/Components/ui/Kit';
import type { FeeLine, LedgerTotals } from '@/types/advisory';

export const LEDGER_NAME: Record<string, string> = { T: 'TBCA Fees (Professional Services)', X: 'External Costs (Third-Party)', S: 'Statutory / Tax' };

export function amount(l: FeeLine) {
    if (l.low === null) return l.item.startsWith('VAT') ? '15% of taxable TBCA items' : '—';
    const suffix = l.frequency === 'Monthly' ? ' /mo' : '';
    return l.high === null ? zar(l.low) : `${zarRange([l.low, l.high])}${suffix}`;
}

/** Fee transparency ledger table grouped by T / X / S with per-ledger subtotals only. */
export function FeeLedgerTable({ lines, totals, columns = 'full' }: { lines: FeeLine[]; totals: LedgerTotals; columns?: 'full' | 'compact' }) {
    return (
        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full min-w-[760px] text-left text-[0.75rem]">
                <thead className="bg-parchment-200 text-ink-600"><tr>{(columns === 'full' ? ['Fee Item', 'What It Covers', 'Pricing Basis', 'Certainty', 'Approval Gate', 'Frequency', 'Amount / Range', 'Status'] : ['Item Description', 'Pricing Basis', 'Amount (ZAR)']).map((h) => <th key={h} className="px-2.5 py-2">{h}</th>)}</tr></thead>
                {(['T', 'X', 'S'] as const).map((L) => (
                    <tbody key={L} className="divide-y divide-parchment-300">
                        <tr className="bg-parchment-100"><th colSpan={columns === 'full' ? 8 : 3} className="px-2.5 py-1.5 text-left"><span className="flex items-center gap-2"><LedgerBadge l={L} size="sm" />{LEDGER_NAME[L]}</span></th></tr>
                        {lines.filter((l) => l.ledger === L).map((l) =>
                            columns === 'full' ? (
                                <tr key={l.item}><td className="px-2.5 py-2 font-semibold">{l.item}</td><td className="px-2.5">{l.covers}</td><td className="px-2.5">{l.basis}</td><td className="px-2.5">{l.certainty}</td><td className="px-2.5">{l.gate}</td><td className="px-2.5">{l.frequency}</td><td className="px-2.5 whitespace-nowrap font-semibold">{amount(l)}</td><td className="px-2.5"><StatusPill status={l.status} /></td></tr>
                            ) : (
                                <tr key={l.item}><td className="px-2.5 py-2"><b>{l.item}</b><span className="block text-ink-500">{l.covers}</span></td><td className="px-2.5">{l.basis}</td><td className="px-2.5 whitespace-nowrap font-semibold">{amount(l)}</td></tr>
                            ),
                        )}
                        <tr className="font-semibold"><td className="px-2.5 py-2" colSpan={columns === 'full' ? 6 : 2}>Ledger {L} subtotal{L === 'S' ? ' (incl. VAT on T)' : ''}</td><td className="px-2.5" colSpan={columns === 'full' ? 2 : 1}>{zarRange(totals[L])}</td></tr>
                    </tbody>
                ))}
            </table>
        </div>
    );
}

export function LedgerSubtotals({ totals }: { totals: LedgerTotals }) {
    return (
        <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><dt className="flex items-center gap-2"><LedgerBadge l="T" size="sm" />TBCA Fees Subtotal</dt><dd className="font-semibold">{zarRange(totals.T)}</dd></div>
            <div className="flex items-center justify-between"><dt className="flex items-center gap-2"><LedgerBadge l="X" size="sm" />External Costs Subtotal</dt><dd className="font-semibold">{zarRange(totals.X)}</dd></div>
            <div className="flex items-center justify-between"><dt className="flex items-center gap-2"><LedgerBadge l="S" size="sm" />Statutory Subtotal</dt><dd className="font-semibold">{zarRange(totals.S)}</dd></div>
            <p className="text-[0.6875rem] text-ink-500">VAT (15%) on TBCA fees: {zarRange(totals.vat)} — included in Ledger S. Ledgers are never combined into one total.</p>
        </dl>
    );
}
