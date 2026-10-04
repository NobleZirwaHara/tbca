import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

const PALETTE = ['#d6a32e', '#1f7a4c', '#2f5fa8', '#7a4fa3', '#b0781e', '#9a9aa5', '#b5372a'];

function scoreColour(v: number) {
    if (v >= 80) return '#1f9d5c';
    if (v >= 70) return '#7cb342';
    if (v >= 60) return '#d6a32e';
    if (v >= 55) return '#e07b22';
    return '#c0392b';
}

/** Circular score ring (0–100). */
export function ScoreRing({ value, size = 48, label = '/100', dark = false }: { value: number; size?: number; label?: string; dark?: boolean }) {
    const r = size / 2 - 4;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`Score ${value} out of 100`}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className={dark ? 'stroke-ink-700' : 'stroke-parchment-400'} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke={scoreColour(value)} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, value) / 100)} />
            </svg>
            <span className={cn('absolute text-center leading-none font-bold', dark ? 'text-parchment-100' : 'text-ink-900')} style={{ fontSize: size / 4 }}>
                {Number.isInteger(value) ? value : value.toFixed(1)}
                {size >= 90 && <span className="block text-[0.6rem] font-medium opacity-60">{label}</span>}
            </span>
        </div>
    );
}

/** Semi-circular gauge. `max` defaults to 100. */
export function Gauge({ value, max = 100, label, caption, dark = true, invert = false }: { value: number; max?: number; label?: string; caption?: string; dark?: boolean; invert?: boolean }) {
    const pct = Math.max(0, Math.min(1, value / max));
    const angle = Math.PI * pct;
    const x = 60 - 48 * Math.cos(angle);
    const y = 60 - 48 * Math.sin(angle);
    const colour = scoreColour(invert ? 100 - pct * 100 : pct * 100);
    return (
        <div className="flex flex-col items-center" role="img" aria-label={`${label ?? 'Gauge'} ${value} of ${max}`}>
            <svg viewBox="0 0 120 66" className="w-40">
                <path d="M12 60 A48 48 0 0 1 108 60" fill="none" strokeWidth="10" className={dark ? 'stroke-ink-700' : 'stroke-parchment-400'} strokeLinecap="round" />
                <path d={`M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" strokeWidth="10" stroke={colour} strokeLinecap="round" />
            </svg>
            <p className={cn('-mt-8 text-3xl font-bold', dark ? 'text-parchment-100' : 'text-ink-900')}>
                {value}
                <span className="text-sm font-medium opacity-60"> /{max}</span>
            </p>
            {label && <p className={cn('mt-1 text-sm font-semibold', dark ? 'text-gold-400' : 'text-ink-700')}>{label}</p>}
            {caption && <p className="text-xs text-ink-400">{caption}</p>}
        </div>
    );
}

/** Donut chart with a legend. */
export function Donut({ data, centre, sub, dark = false, size = 140 }: { data: { label: string; value: number }[]; centre?: string; sub?: string; dark?: boolean; size?: number }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = 40;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size} role="img" aria-label={data.map((d) => `${d.label} ${d.value}`).join(', ')}>
                    {data.map((d, i) => {
                        const len = (d.value / total) * c;
                        const el = <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                        offset += len;
                        return el;
                    })}
                </svg>
                {centre && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={cn('text-lg font-bold', dark ? 'text-parchment-100' : 'text-ink-900')}>{centre}</span>
                        {sub && <span className="text-[0.65rem] text-ink-400">{sub}</span>}
                    </div>
                )}
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                {data.map((d, i) => (
                    <li key={d.label} className="flex items-center justify-between gap-3">
                        <span className={cn('flex items-center gap-2', dark ? 'text-ink-200' : 'text-ink-600')}>
                            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                            {d.label}
                        </span>
                        <span className={cn('font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{d.value}{total === 100 ? '%' : ''}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Horizontal bars, values 0–max. */
export function BarList({ data, max = 100, dark = false, suffix = '' }: { data: { label: string; value: number; display?: string; warn?: boolean }[]; max?: number; dark?: boolean; suffix?: string }) {
    return (
        <ul className="space-y-2.5">
            {data.map((d) => (
                <li key={d.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-xs sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
                    <span className={cn('truncate', dark ? 'text-ink-200' : 'text-ink-600')} title={d.label}>{d.label}</span>
                    <span className={cn('h-2.5 overflow-hidden rounded-full', dark ? 'bg-ink-800' : 'bg-parchment-300')}>
                        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (d.value / max) * 100)}%`, background: d.warn ? '#d6a32e' : scoreColour((d.value / max) * 100) }} />
                    </span>
                    <span className={cn('w-14 text-right font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{d.display ?? `${d.value}${suffix}`}</span>
                </li>
            ))}
        </ul>
    );
}

/** Vertical bar chart (forecasts). */
export function Columns({ data, highlight }: { data: [string, number][]; highlight?: string }) {
    const max = Math.max(...data.map((d) => d[1]), 1);
    return (
        <div className="flex h-48 items-end gap-2" role="img" aria-label={data.map((d) => `${d[0]} ${d[1]}`).join(', ')}>
            {data.map(([label, v]) => (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[0.65rem] font-semibold text-ink-700">{v}</span>
                    <span className={cn('w-full rounded-t', label === highlight ? 'bg-referenced-500' : 'bg-parchment-400')} style={{ height: `${(v / max) * 150}px` }} />
                    <span className="text-[0.65rem] text-ink-500">{label}</span>
                </div>
            ))}
        </div>
    );
}

/** Simple line chart for trends. */
export function TrendLine({ data, dark = false }: { data: [string, number][]; dark?: boolean }) {
    const max = Math.max(...data.map((d) => d[1])) * 1.15;
    const pts = data.map((d, i) => [20 + (i * 260) / Math.max(1, data.length - 1), 110 - (d[1] / max) * 100]);
    return (
        <svg viewBox="0 0 300 130" className="w-full" role="img" aria-label={data.map((d) => `${d[0]} ${d[1]}`).join(', ')}>
            <polyline fill="none" stroke="#d6a32e" strokeWidth="2.5" points={pts.map((p) => p.join(',')).join(' ')} />
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r="3.5" fill="#d6a32e" />
                    <text x={p[0]} y={p[1] - 8} textAnchor="middle" fontSize="9" className={dark ? 'fill-parchment-100' : 'fill-ink-700'}>{data[i][1]}</text>
                    <text x={p[0]} y="126" textAnchor="middle" fontSize="8" className="fill-ink-400">{data[i][0]}</text>
                </g>
            ))}
        </svg>
    );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
    return (
        <span className="inline-flex" aria-label={`${value} of ${max} stars`}>
            {Array.from({ length: max }, (_, i) => (
                <Star key={i} className={cn('size-3.5', i < value ? 'fill-gold-500 text-gold-500' : 'text-parchment-500')} />
            ))}
        </span>
    );
}
