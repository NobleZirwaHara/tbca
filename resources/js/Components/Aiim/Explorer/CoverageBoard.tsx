import { Link } from '@inertiajs/react';
import { useState } from 'react';
import AfricaCountryMap from '@/Components/Map/AfricaCountryMap';
import { cn } from '@/lib/cn';
import type { CountryOption } from '@/types/aiim';

export interface CoverageRow extends CountryOption {
    auRegion: string | null;
    wave: string | null;
    packStatus: string | null;
    packCode: string | null;
    projects: number;
    opportunities: number;
    units: number;
}

const BUCKETS = [
    { key: 'loaded', label: 'Country pack loaded', color: '#2f8a5f' },
    { key: 'model', label: 'Model or replication pack', color: '#d6a32e' },
    { key: 'issued', label: 'Pack issued, awaiting upload', color: '#2f5fa8' },
    { key: 'data', label: 'Project briefs or areas only', color: '#7a4fa3' },
    { key: 'none', label: 'Not started', color: '#3a3122' },
] as const;

function bucket(r: CoverageRow): (typeof BUCKETS)[number]['key'] {
    const s = (r.packStatus ?? '').toLowerCase();
    if (s.includes('loaded')) return 'loaded';
    if (s.includes('model') || s.includes('replication')) return 'model';
    if (s.includes('issued')) return 'issued';
    if (r.projects || r.units || r.opportunities) return 'data';
    return 'none';
}

/** All 54 countries: roll-out wave, country pack status and loaded records (Deep Registers 2.1, Country_Activation). */
export default function CoverageBoard({ rows }: { rows: CoverageRow[] }) {
    const [filter, setFilter] = useState<string>('');
    const byIso = new Map(rows.map((r) => [r.iso2, r]));
    const colorFor = (iso2: string) => BUCKETS.find((b) => b.key === bucket(byIso.get(iso2)!))?.color;
    const shown = rows.filter((r) => !filter || bucket(r) === filter).sort((a, b) => (a.wave ?? '9').localeCompare(b.wave ?? '9') || a.name.localeCompare(b.name));

    return (
        <section className="container-tbca py-8" aria-labelledby="coverage-heading">
            <div className="rounded-[10px] border border-gold-700/40 bg-ink-900/80 p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 id="coverage-heading" className="text-lg font-semibold">Coverage of all 54 countries</h2>
                        <p className="text-xs text-ink-300">Roll-out wave and country pack status for every country, with the project briefs, opportunity records and mapped areas loaded so far.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => setFilter('')} className={cn('rounded border px-2 py-1 text-[0.6875rem]', !filter ? 'border-gold-500 text-gold-400' : 'border-ink-600 text-ink-300')}>All ({rows.length})</button>
                        {BUCKETS.map((b) => {
                            const n = rows.filter((r) => bucket(r) === b.key).length;
                            return n ? (
                                <button key={b.key} type="button" onClick={() => setFilter(filter === b.key ? '' : b.key)} className={cn('flex items-center gap-1.5 rounded border px-2 py-1 text-[0.6875rem]', filter === b.key ? 'border-gold-500 text-gold-400' : 'border-ink-600 text-ink-300')}>
                                    <span className="inline-block size-2.5 rounded-sm" style={{ background: b.color }} />{b.label} ({n})
                                </button>
                            ) : null;
                        })}
                    </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <AfricaCountryMap colorFor={(c) => colorFor(c.iso2)} label="Map of Africa coloured by AIIM country pack status" />
                    <div className="max-h-[26rem] overflow-y-auto pr-1">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-ink-900 text-ink-400">
                                <tr>{['Country', 'AU region', 'Wave', 'Country pack', 'Project briefs', 'Opportunity records', 'Areas and towns'].map((h) => <th key={h} className="py-1.5 pr-3 font-medium">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-ink-800">
                                {shown.map((r) => (
                                    <tr key={r.iso2}>
                                        <td className="py-1.5 pr-3"><Link href={`/aiim/country/${r.slug}`} className="flex items-center gap-1.5 hover:text-gold-400"><span aria-hidden="true">{r.flag}</span>{r.name}</Link></td>
                                        <td className="py-1.5 pr-3 text-ink-300">{r.auRegion}</td>
                                        <td className="py-1.5 pr-3 text-ink-300">{r.wave?.replace('[PROPOSED]', '').trim()}</td>
                                        <td className="py-1.5 pr-3"><span className="flex items-center gap-1.5"><span className="inline-block size-2 rounded-sm" style={{ background: BUCKETS.find((b) => b.key === bucket(r))?.color }} />{r.packStatus ?? 'Not started'}{r.packCode ? ` (${r.packCode})` : ''}</span></td>
                                        <td className="py-1.5 pr-3">{r.projects ? <Link href={`/aiim/country/${r.slug}?tab=opportunities`} className="text-gold-400 hover:underline">{r.projects}</Link> : <span className="text-ink-500">0</span>}</td>
                                        <td className="py-1.5 pr-3">{r.opportunities || <span className="text-ink-500">0</span>}</td>
                                        <td className="py-1.5">{r.units ? <Link href={`/aiim/country/${r.slug}?tab=places`} className="text-gold-400 hover:underline">{r.units}</Link> : <span className="text-ink-500">Pending</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="mt-3 text-[0.65rem] text-ink-400">Waves are proposed in the AIIM Deep Registers 2.1. Countries marked pending show their outline and indicators until a country pack or project briefs are supplied.</p>
            </div>
        </section>
    );
}
