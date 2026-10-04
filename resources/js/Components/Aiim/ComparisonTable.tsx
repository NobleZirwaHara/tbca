import { Link, router } from '@inertiajs/react';
import { MapPin, Star, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ComparisonData } from '@/types/aiim';
import AiimIcon from './AiimIcon';
import { ScoreRing, Stars } from './Charts';
import { Chip, levelTone } from './Chips';
import { labelise } from './format';

/** Side-by-side comparison grid shared by the Comparison Builder and Results. */
export default function ComparisonTable({ data, removable = false, showOverall = false }: { data: ComparisonData; removable?: boolean; showOverall?: boolean }) {
    const best = (key: string, i: number) => (data.best[key] ?? []).includes(i);
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-xs">
                <thead>
                    <tr>
                        <th className="w-40 px-3 py-2 align-bottom text-ink-500">Metric</th>
                        {data.columns.map((c) => (
                            <th key={c.card.key} className="px-3 py-2 align-top">
                                <div className="flex items-start gap-2">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded bg-ink-900 text-gold-500"><AiimIcon name={c.card.icon} /></span>
                                    <span className="min-w-0 flex-1">
                                        <Link href={c.card.url} className="block text-sm font-semibold text-ink-900 hover:text-gold-700">{c.card.name}</Link>
                                        <span className="block font-normal text-ink-500">{labelise(c.card.type)}</span>
                                        <span className="flex items-center gap-1 font-normal text-ink-500"><MapPin className="size-3" />{c.card.location}</span>
                                    </span>
                                    {removable && (
                                        <button type="button" aria-label={`Remove ${c.card.name}`} onClick={() => router.delete('/aiim/workspace/compare/items', { data: { type: c.card.type, key: c.card.key }, preserveScroll: true })} className="text-ink-400 hover:text-risk-500">
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300">
                    {data.rows.map((r) => (
                        <tr key={r.key}>
                            <th scope="row" className="px-3 py-2 font-medium text-ink-600">{r.label}</th>
                            {data.columns.map((c, i) => {
                                const cell = c.metrics[r.key];
                                return (
                                    <td key={c.card.key} className={cn('px-3 py-2', best(r.key, i) && 'bg-gold-50')}>
                                        <span className="flex items-center gap-2">
                                            {r.key === 'risk' && cell.value !== null ? (
                                                <><ScoreRing value={cell.value} size={32} /><span className="text-ink-500">{cell.label}</span></>
                                            ) : r.key === 'fit' ? (
                                                <><Stars value={Number(cell.value)} /><span>{cell.label}</span></>
                                            ) : r.key === 'alignment' ? (
                                                <Chip tone={levelTone(cell.display)}>{cell.display}</Chip>
                                            ) : (
                                                <span className="font-medium text-ink-900">{cell.display}</span>
                                            )}
                                            {best(r.key, i) && <Star className="size-3.5 fill-gold-500 text-gold-500" aria-label="Top score in this metric" />}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {showOverall && (
                        <tr className="bg-verified-50">
                            <th scope="row" className="px-3 py-3 font-semibold text-ink-900">Overall Score (Weighted)</th>
                            {data.columns.map((c) => (
                                <td key={c.card.key} className="px-3 py-3">
                                    <span className="text-2xl font-bold text-verified-700">{Math.round(c.overall)}</span><span className="text-ink-500"> /100</span>
                                    <span className="ml-2 font-semibold">{c.label}</span>
                                </td>
                            ))}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
