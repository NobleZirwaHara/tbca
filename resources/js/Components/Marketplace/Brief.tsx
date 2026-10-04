import type { ReactNode } from 'react';
import { Stepper, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { Ledgers } from '@/types/marketplace';
import { zarCode } from './ui';

export const BRIEF_JOURNEY = ['Scope & Price', 'Disclosure', 'Checkout', 'Assignment', 'Delivery'];

export function BriefJourney({ current, className }: { current: number; className?: string }) {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <div className="min-w-[420px]"><Stepper steps={BRIEF_JOURNEY} current={current} /></div>
        </div>
    );
}

const LEDGERS = [
    ['a', 'A', 'TBCA Professional Fees'],
    ['b', 'B', 'Platform, QA & Administration Fees'],
    ['c', 'C', 'External / Third-Party Costs'],
] as const;

/** Commercial envelope: three separated ledgers, never a blended total. */
export function LedgerEnvelope({ ledgers, footer }: { ledgers: Ledgers; footer?: ReactNode }) {
    return (
        <div>
            <table className="w-full text-[0.8125rem]">
                <thead className="text-xs text-ink-500">
                    <tr><th scope="col" className="pb-2 text-left font-medium">Ledger</th><th scope="col" className="pb-2 text-left font-medium">Description</th><th scope="col" className="pb-2 text-right font-medium">Amount (ZAR)</th><th scope="col" className="pb-2 text-right font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-parchment-300">
                    {LEDGERS.map(([k, letter, label]) => (
                        <tr key={k}>
                            <td className="py-2"><span className="flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{letter}</span></td>
                            <td className="py-2 text-ink-800">{label}{k === 'c' && ledgers.c_state === 'estimated_cap' && <span className="block text-[0.6875rem] text-ink-400">Capped estimate until provider selection</span>}</td>
                            <td className="py-2 text-right font-semibold">{zarCode(ledgers[k])}</td>
                            <td className="py-2 text-right">
                                <StatusPill status={k === 'c' ? (ledgers.c_state === 'actual' ? 'Confirmed' : 'Estimated Cap') : 'Confirmed'} tone={k === 'c' && ledgers.c_state !== 'actual' ? 'warn' : 'good'} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-[6px] border border-parchment-300 bg-parchment-100 p-3 text-center">
                {LEDGERS.map(([k, letter]) => <div key={k}><p className="text-[0.6875rem] text-ink-500">Ledger {letter}</p><p className="text-sm font-bold text-ink-900">{zarCode(ledgers[k])}</p></div>)}
            </div>
            <p className="mt-2 text-center text-xs text-ink-500">No blended total. Each ledger remains separate.</p>
            {footer}
        </div>
    );
}
