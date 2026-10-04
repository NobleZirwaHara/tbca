import { CircleCheck } from 'lucide-react';
import type { HeroVisual as Visual } from '@/types/sprint-types-a';

const DONUT_COLOURS = ['#22a06b', '#d6a32e', '#d9534f', '#6b6b78', '#3b82f6', '#a855f7'];

function num(v: number | string): number {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : 0;
}

/** Data-driven rendering of the dashboard / snapshot graphic shown in sprint heroes. */
export default function HeroVisual({ visual }: { visual: Visual }) {
    const kpis = visual.kpis ?? [];
    const bars = visual.bars?.items ?? [];
    const donut = visual.donut?.items ?? [];
    const maxBar = Math.max(1, ...bars.map((b) => num(b.value)));
    const donutTotal = donut.reduce((s, d) => s + num(d.value), 0) || 1;

    let acc = 0;
    const stops = donut
        .map((d, i) => {
            const from = (acc / donutTotal) * 100;
            acc += num(d.value);
            const to = (acc / donutTotal) * 100;
            return `${DONUT_COLOURS[i % DONUT_COLOURS.length]} ${from}% ${to}%`;
        })
        .join(', ');

    return (
        <figure
            aria-label={visual.title ?? 'Sprint preview'}
            className="rounded-[10px] border border-ink-700 bg-gradient-to-br from-ink-800 to-ink-950 p-4 text-parchment-100 shadow-2xl"
        >
            {visual.title && <figcaption className="mb-3 text-[0.8125rem] font-semibold tracking-wide uppercase text-parchment-100">{visual.title}</figcaption>}

            {kpis.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {kpis.slice(0, 8).map((k) => (
                        <div key={k.label} className="rounded-[6px] border border-ink-700 bg-ink-900/70 p-2.5">
                            <p className="text-[0.625rem] text-ink-300">{k.label}</p>
                            <p className="mt-0.5 text-lg font-bold text-parchment-50">{k.value}</p>
                            {k.note && <p className="text-[0.625rem] text-verified-500">{k.note}</p>}
                        </div>
                    ))}
                </div>
            )}

            {(bars.length > 0 || donut.length > 0) && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {donut.length > 0 && (
                        <div className="rounded-[6px] border border-ink-700 bg-ink-900/70 p-3">
                            {visual.donut?.title && <p className="mb-2 text-[0.6875rem] font-semibold text-ink-200">{visual.donut.title}</p>}
                            <div className="flex items-center gap-3">
                                <div className="relative size-20 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
                                    <span className="absolute inset-3 rounded-full bg-ink-900" />
                                </div>
                                <ul className="space-y-1 text-[0.625rem] text-ink-200">
                                    {donut.map((d, i) => (
                                        <li key={d.label} className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full" style={{ background: DONUT_COLOURS[i % DONUT_COLOURS.length] }} />
                                            {d.label} <span className="text-ink-400">{d.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {bars.length > 0 && (
                        <div className="rounded-[6px] border border-ink-700 bg-ink-900/70 p-3">
                            {visual.bars?.title && <p className="mb-2 text-[0.6875rem] font-semibold text-ink-200">{visual.bars.title}</p>}
                            <ul className="space-y-1.5">
                                {bars.slice(0, 7).map((b) => (
                                    <li key={b.label} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-2 text-[0.625rem] text-ink-200">
                                        <span className="truncate">{b.label}</span>
                                        <span className="h-2 rounded-full bg-ink-700">
                                            <span className="block h-2 rounded-full bg-gold-500" style={{ width: `${(num(b.value) / maxBar) * 100}%` }} />
                                        </span>
                                        <span className="text-right text-ink-300">{b.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {(visual.lists?.length ?? 0) > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visual.lists!.map((l) => (
                        <div key={l.title} className="rounded-[6px] border border-ink-700 bg-ink-900/70 p-3">
                            <p className="mb-1.5 text-[0.6875rem] font-semibold text-ink-200">{l.title}</p>
                            <ul className="space-y-1">
                                {l.items.slice(0, 6).map((it) => (
                                    <li key={it} className="flex items-start gap-1.5 text-[0.625rem] text-ink-300">
                                        <CircleCheck className="mt-px size-3 shrink-0 text-gold-500" aria-hidden="true" />
                                        {it}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {visual.table && visual.table.rows.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-[6px] border border-ink-700 bg-ink-900/70 p-3">
                    {visual.table.title && <p className="mb-1.5 text-[0.6875rem] font-semibold text-ink-200">{visual.table.title}</p>}
                    <table className="w-full text-left text-[0.625rem]">
                        <thead>
                            <tr className="text-ink-400">
                                {visual.table.columns.map((c) => (
                                    <th key={c} scope="col" className="pr-3 pb-1 font-medium">
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visual.table.rows.slice(0, 6).map((r, i) => (
                                <tr key={i} className="border-t border-ink-700 text-ink-200">
                                    {r.map((cell, j) => (
                                        <td key={j} className="py-1 pr-3">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </figure>
    );
}
