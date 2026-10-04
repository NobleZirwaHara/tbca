import { Star, Pencil, RotateCcw } from 'lucide-react';
import type { RetDriver } from './types';
import type { SizingResult } from './sizing';
import { cn } from '@/lib/cn';

/** Demand drivers: select + derived percentage, controlled by the parent. */
export function DriverPanel({ drivers, values, onChange, onReset }: { drivers: Record<string, RetDriver>; values: Record<string, string>; onChange: (key: string, option: string) => void; onReset: () => void }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="text-sm font-semibold text-referenced-700">Demand Drivers</h2>
            <p className="mt-1 text-xs text-ink-500">Adjust expected drivers that influence future demand.</p>
            <ul className="mt-3 space-y-3">
                {Object.entries(drivers).map(([key, d]) => {
                    const pct = d.options[values[key]] ?? 0;
                    const min = Math.min(...Object.values(d.options));
                    const max = Math.max(...Object.values(d.options));
                    const pos = max === min ? 50 : ((pct - min) / (max - min)) * 100;
                    return (
                        <li key={key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[150px_140px_1fr_48px]">
                            <label htmlFor={`drv-${key}`} className="text-xs text-ink-700">
                                {d.label}
                            </label>
                            <select id={`drv-${key}`} value={values[key]} onChange={(e) => onChange(key, e.target.value)} className="h-8 rounded-[4px] border border-parchment-500 px-2 text-xs focus:border-gold-500 focus:outline-none">
                                {Object.keys(d.options).map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                            <span className="relative hidden h-1.5 rounded-full bg-parchment-300 sm:block" aria-hidden="true">
                                <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-referenced-500" style={{ left: `${pos}%` }} />
                            </span>
                            <span className="hidden text-right text-xs font-semibold text-ink-800 tabular-nums sm:block">
                                {pct > 0 ? '+' : ''}
                                {pct}%
                            </span>
                        </li>
                    );
                })}
            </ul>
            <button type="button" onClick={onReset} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-referenced-700 hover:underline">
                <RotateCcw className="size-3.5" aria-hidden="true" /> Reset to Baseline
            </button>
        </section>
    );
}

/** P20 / P50 / P80 / P90 band with quick-apply buttons. */
export function BandPanel({ result, chosen, onChoose, custom, onCustom }: { result: SizingResult; chosen: number; onChoose: (h: number) => void; custom: string; onCustom: (v: string) => void }) {
    const lo = Math.max(0, Math.floor(result.p20) - 2);
    const hi = Math.ceil(Math.max(result.p90, result.stretch)) + 2;
    const pos = (v: number) => ((v - lo) / Math.max(1, hi - lo)) * 100;
    const ticks = [
        { v: result.p20, l: 'Conservative', s: '(P20)' },
        { v: result.p50, l: 'Forecast', s: '(P50)' },
        { v: result.p80, l: 'Stretch', s: '(P80)' },
        { v: result.p90, l: 'High', s: '(P90)' },
    ];
    const actions = [
        { h: result.recommended, label: 'Recommended' },
        { h: result.conservative, label: 'Conservative' },
        { h: result.stretch, label: 'Stretch' },
    ];
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="text-sm font-semibold text-referenced-700">Recommended Allowance Band</h2>
            <div className="mt-4 text-center">
                <span className="inline-block rounded-[4px] bg-referenced-700 px-3 py-1 text-xs font-semibold text-white">Recommended: {result.recommended} Hours / month</span>
            </div>
            <div className="relative mx-2 mt-4 h-3 rounded-full bg-referenced-50">
                <span className="absolute inset-y-0 rounded-full bg-referenced-500/30" style={{ left: `${pos(result.p20)}%`, right: `${100 - pos(result.p90)}%` }} />
                <Star className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 fill-referenced-700 text-referenced-700" style={{ left: `${pos(result.recommended)}%` }} aria-hidden="true" />
            </div>
            <ul className="mt-3 grid grid-cols-4 text-center text-[0.6875rem] text-ink-500">
                {ticks.map((t) => (
                    <li key={t.s}>
                        <span className="block text-sm font-semibold text-ink-900">{t.v}</span>
                        {t.l}
                        <br />
                        {t.s}
                    </li>
                ))}
            </ul>
            <div className="mt-4 rounded-[6px] bg-referenced-50 p-3 text-xs text-ink-700">
                <p className="font-semibold text-referenced-700">Why {result.recommended} hours?</p>
                Based on your historic usage (average {result.mean}h) and the selected demand drivers ({result.uplift > 0 ? '+' : ''}
                {result.uplift}%), {result.recommended} hours covers forecast demand in about {result.confidence}% of months — the best balance between value and cost control.
            </div>
            <p className="mt-4 text-xs font-semibold text-ink-800">Quick Actions</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {actions.map((a) => (
                    <button key={a.label} type="button" onClick={() => onChoose(a.h)} aria-pressed={chosen === a.h} className={cn('rounded-[4px] border px-2 py-2 text-xs font-semibold', chosen === a.h ? 'border-referenced-700 bg-referenced-700 text-white' : 'border-referenced-500/40 text-referenced-700 hover:bg-referenced-50')}>
                        Apply {a.h} Hours
                        <span className="block text-[0.625rem] font-normal">({a.label})</span>
                    </button>
                ))}
                <label className="flex items-center gap-1 rounded-[4px] border border-referenced-500/40 px-2 text-xs text-referenced-700">
                    <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only">Custom allowance</span>
                    <input type="number" min={4} max={200} value={custom} onChange={(e) => onCustom(e.target.value)} placeholder="Custom" className="h-8 w-full bg-transparent text-xs focus:outline-none" />
                </label>
            </div>
        </section>
    );
}
