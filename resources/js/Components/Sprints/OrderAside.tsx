import { CircleCheck, Lock, MessageCircle } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { SprintAddon } from '@/types/sprints';
import type { Pkg } from './DetailParts';
import type { Totals } from './lib';

/** "Your Order Summary" sidebar on the Order Sprint page (live totals). */
export default function OrderAside({
    title,
    packages,
    pkgKey,
    onPackage,
    addons,
    totals,
    recurringLabel,
    free,
    processing,
    submitLabel,
}: {
    title: string;
    packages: Pkg[];
    pkgKey: string;
    onPackage: (k: string) => void;
    addons: SprintAddon[];
    totals: Totals;
    recurringLabel: string | null;
    free: boolean;
    processing: boolean;
    submitLabel: string;
}) {
    const pkg = packages.find((p) => p.key === pkgKey) ?? packages[0];

    return (
        <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-raised">
            <p className="font-semibold">Your Order Summary</p>
            <p className="mt-2 rounded-[6px] border border-ink-700 px-3 py-2 text-[0.8125rem]">{title}</p>

            <div role="radiogroup" aria-label="Package" className="mt-3 space-y-2">
                {packages.map((p) => {
                    const on = p.key === pkgKey;
                    return (
                        <button
                            key={p.key}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => onPackage(p.key)}
                            className={cn('flex w-full items-start gap-2 rounded-[6px] border p-2.5 text-left', on ? 'border-gold-500 bg-gold-500/10' : 'border-ink-700 opacity-80 hover:opacity-100')}
                        >
                            <span className={cn('mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full border', on ? 'border-gold-500' : 'border-ink-400')}>
                                {on && <span className="size-1.5 rounded-full bg-gold-500" />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-white">
                                    {p.name}
                                    {p.popular && <span className="rounded-[3px] bg-gold-500 px-1 text-[0.625rem] text-ink-900">Best Value</span>}
                                    {on && <span className="rounded-[3px] border border-gold-500 px-1 text-[0.625rem] text-gold-400">Selected</span>}
                                </span>
                                {on && p.description && <span className="block text-[0.6875rem] text-parchment-200">{p.description}</span>}
                            </span>
                            <span className="text-sm font-bold text-gold-400">{p.zar === 0 ? 'Free' : formatZar(p.zar)}</span>
                        </button>
                    );
                })}
            </div>

            <dl className="mt-3 space-y-1 text-[0.75rem]">
                {[
                    ['Delivery', pkg?.delivery ?? 'Confirmed after scope'],
                    ['Delivery Method', 'Client Portal'],
                    ['Review Type', 'Human Reviewed'],
                    ['Currency', 'ZAR (South African Rand)'],
                    ...(recurringLabel ? [['Billing', `Recurring, ${recurringLabel}`]] : []),
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                        <dt className="text-parchment-300">{k}</dt>
                        <dd className="text-right">{v}</dd>
                    </div>
                ))}
            </dl>

            {pkg?.features && pkg.features.length > 0 && (
                <>
                    <p className="mt-3 text-[0.8125rem] font-semibold text-gold-400">Included in {pkg.name}</p>
                    <ul className="mt-1.5 space-y-1">
                        {pkg.features.slice(0, 6).map((f) => (
                            <li key={f} className="flex gap-1.5 text-[0.75rem] text-parchment-200">
                                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-gold-500" aria-hidden="true" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <dl className="mt-3 space-y-1 border-t border-ink-700 pt-3 text-[0.8125rem]">
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Package Total</dt>
                    <dd>{formatZar(totals.packageZar)}</dd>
                </div>
                {addons.map((a) => (
                    <div key={a.key} className="flex justify-between text-[0.75rem]">
                        <dt className="text-parchment-300">+ {a.name}</dt>
                        <dd>{formatZar(a.zar)}</dd>
                    </div>
                ))}
                <div className="flex justify-between">
                    <dt className="text-parchment-200">VAT (15%)</dt>
                    <dd>{formatZar(totals.vat)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Bank Charges</dt>
                    <dd>{formatZar(totals.bank)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Platform Charges</dt>
                    <dd>{formatZar(totals.platform)}</dd>
                </div>
            </dl>
            <div className="mt-2 flex items-center justify-between border-t border-ink-700 pt-2">
                <span className="font-semibold text-gold-400">Total Due Today</span>
                <span className="text-xl font-bold text-gold-400">{free ? 'R0' : formatZar(totals.total)}</span>
            </div>

            <button type="submit" form="sprint-order" disabled={processing} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                <Lock className="size-4" aria-hidden="true" /> {submitLabel}
            </button>
            <button type="button" onClick={() => openAskQuestion({ subject: `Order question: ${title}`, section: 'sprints' })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500/60 text-sm font-semibold">
                <MessageCircle className="size-4" aria-hidden="true" /> Ask a Question
            </button>
        </div>
    );
}
