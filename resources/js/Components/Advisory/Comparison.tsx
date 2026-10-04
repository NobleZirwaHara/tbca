import { Link } from '@inertiajs/react';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { cn } from '@/lib/cn';

export interface CompCol {
    key: string;
    name: string;
    tag?: string;
    icon?: string;
    href?: string;
    values: Record<string, string>;
    fit?: string;
    recommended?: boolean;
    excluded?: string[];
}

const fitTone = (f?: string) =>
    !f ? '' : f.startsWith('High') ? 'bg-verified-50 text-verified-700' : f.startsWith('Medium–High') ? 'bg-verified-50 text-verified-700' : f.startsWith('Medium') ? 'bg-attested-50 text-attested-700' : f === 'Varies' ? 'bg-controlled-50 text-controlled-700' : 'bg-risk-50 text-risk-700';

/** Vehicle comparison table with equal visibility for every option. */
export default function ComparisonTable({ rows, cols, firstHeader = 'Comparison Dimensions' }: { rows: [string, string][]; cols: CompCol[]; firstHeader?: string }) {
    return (
        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full min-w-[820px] text-left text-[0.8125rem]">
                <thead>
                    <tr>
                        <th scope="col" className="w-40 bg-ink-950 px-3 py-3 text-xs font-semibold text-parchment-100">{firstHeader}</th>
                        {cols.map((c) => (
                            <th key={c.key} scope="col" className={cn('px-3 py-3 text-center align-bottom', c.recommended && 'bg-gold-50')}>
                                {c.recommended && <span className="mb-1 inline-block rounded bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold text-ink-900">Recommended</span>}
                                {c.icon && <AdvIcon name={c.icon} className="mx-auto size-6 text-gold-600" />}
                                {c.href ? <Link href={c.href} className="mt-1 block font-semibold text-ink-900 hover:text-gold-700">{c.name}</Link> : <p className="mt-1 font-semibold text-ink-900">{c.name}</p>}
                                {c.tag && <p className="text-[0.6875rem] font-normal text-ink-500">{c.tag}</p>}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300">
                    {cols.some((c) => c.fit) && (
                        <tr>
                            <th scope="row" className="px-3 py-2 font-semibold text-ink-800">How it fits your need</th>
                            {cols.map((c) => (
                                <td key={c.key} className={cn('px-3 py-2 text-center', c.recommended && 'bg-gold-50')}>
                                    <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', fitTone(c.fit))}>{c.fit}</span>
                                </td>
                            ))}
                        </tr>
                    )}
                    {rows.map(([key, label]) => (
                        <tr key={key}>
                            <th scope="row" className="px-3 py-2 font-semibold text-ink-800">{label}</th>
                            {cols.map((c) => (
                                <td key={c.key} className={cn('px-3 py-2 text-ink-700', c.recommended && 'bg-gold-50', key === 'price' && 'font-semibold text-ink-900')}>{c.values[key]}</td>
                            ))}
                        </tr>
                    ))}
                    {cols.some((c) => c.excluded && c.excluded.length) && (
                        <tr>
                            <th scope="row" className="px-3 py-2 font-semibold text-ink-800">Why not suitable</th>
                            {cols.map((c) => (
                                <td key={c.key} className="px-3 py-2 text-xs text-risk-700">{c.excluded?.join(' ') || '—'}</td>
                            ))}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
