import type { FeeLine } from '@/types/aiim';
import { zar2 } from './format';

/** Compact fee summary: lines, subtotal, VAT 15%, total. */
export function FeeSummary({ lines, subtotal, vat, total, vatLabel = 'VAT (15%)', totalLabel = 'Total (incl. VAT)' }: { lines: FeeLine[]; subtotal: number; vat: number; total: number; vatLabel?: string; totalLabel?: string }) {
    return (
        <dl className="text-sm">
            {lines.map((l) => (
                <div key={l.code + l.label} className="flex justify-between gap-3 border-b border-parchment-300 py-1.5">
                    <dt className="text-ink-600">{l.label}</dt>
                    <dd className="font-medium whitespace-nowrap">{zar2(l.amount)}</dd>
                </div>
            ))}
            <div className="flex justify-between py-1.5 font-semibold"><dt>Subtotal (excl. VAT)</dt><dd>{zar2(subtotal)}</dd></div>
            <div className="flex justify-between py-1.5"><dt className="text-ink-600">{vatLabel}</dt><dd>{zar2(vat)}</dd></div>
            <div className="mt-1 flex justify-between rounded bg-gold-50 px-2 py-2 text-base font-bold"><dt>{totalLabel}</dt><dd className="text-risk-500">{zar2(total)}</dd></div>
        </dl>
    );
}

/** Itemised manifest table with fee code, basis and notes. */
export function FeeManifestTable({ lines, subtotal, vat, total }: { lines: FeeLine[]; subtotal: number; vat: number; total: number }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-xs">
                <thead className="bg-ink-950 text-parchment-100"><tr>{['Fee Category', 'Description', 'Fee Code', 'Basis / Trigger', 'Amount (ZAR)', 'Notes'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-parchment-300">
                    {lines.map((l) => (
                        <tr key={l.code}>
                            <td className="px-3 py-2 font-semibold">{l.label}{l.quantity && l.quantity > 1 ? ` × ${l.quantity}` : ''}</td>
                            <td className="px-3 py-2 text-ink-600">{l.description}</td>
                            <td className="px-3 py-2 font-mono">{l.code}</td>
                            <td className="px-3 py-2">{l.basis}</td>
                            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{zar2(l.amount)}</td>
                            <td className="px-3 py-2 text-ink-500">{l.notes}</td>
                        </tr>
                    ))}
                    <tr><td colSpan={4} className="px-3 py-2 font-semibold">Subtotal (excl. VAT)</td><td className="px-3 py-2 text-right font-semibold">{zar2(subtotal)}</td><td /></tr>
                    <tr><td colSpan={4} className="px-3 py-2">VAT (15%)</td><td className="px-3 py-2 text-right">{zar2(vat)}</td><td /></tr>
                    <tr className="bg-gold-50 text-sm font-bold"><td colSpan={4} className="px-3 py-2">Total (incl. VAT)</td><td className="px-3 py-2 text-right text-risk-500">{zar2(total)}</td><td /></tr>
                </tbody>
            </table>
        </div>
    );
}
