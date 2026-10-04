import { cn } from '@/lib/cn';

/* Lightweight SVG charts for the Subscriptions consoles (no chart library). */

export const PALETTE = ['#7c5cd6', '#2f9e5b', '#3b7dd8', '#e8892b', '#d64545', '#9aa0a6', '#c9a227'];

/** Donut with a centre label and an accessible legend. */
export function Donut({
    data,
    center,
    caption,
    size = 150,
    colors = PALETTE,
    format = (v: number) => v.toLocaleString(),
}: {
    data: [string, number][];
    center: string;
    caption?: string;
    size?: number;
    colors?: string[];
    format?: (v: number) => string;
}) {
    const total = data.reduce((s, [, v]) => s + v, 0) || 1;
    const r = 40;
    const c = 2 * Math.PI * r;
    let offset = 0;

    return (
        <div className="flex flex-wrap items-center gap-5">
            <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${center} ${caption ?? ''}`} className="shrink-0">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#ece6d8" strokeWidth="16" />
                {data.map(([label, v], i) => {
                    const len = (v / total) * c;
                    const el = (
                        <circle
                            key={label}
                            cx="50"
                            cy="50"
                            r={r}
                            fill="none"
                            stroke={colors[i % colors.length]}
                            strokeWidth="16"
                            strokeDasharray={`${len} ${c - len}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 50 50)"
                        />
                    );
                    offset += len;
                    return el;
                })}
                <text x="50" y="49" textAnchor="middle" className="fill-ink-900" style={{ fontSize: 13, fontWeight: 700 }}>
                    {center}
                </text>
                {caption && (
                    <text x="50" y="61" textAnchor="middle" className="fill-ink-500" style={{ fontSize: 7 }}>
                        {caption}
                    </text>
                )}
            </svg>
            <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                {data.map(([label, v], i) => (
                    <li key={label} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-ink-700">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} aria-hidden="true" />
                            {label}
                        </span>
                        <span className="font-semibold text-ink-900 tabular-nums">
                            {format(v)} <span className="font-normal text-ink-400">({((v / total) * 100).toFixed(1)}%)</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Multi-series line chart. `series` values align with `labels`. */
export function LineChart({
    labels,
    series,
    min,
    max,
    height = 170,
    suffix = '',
    area = true,
    refLines = [],
}: {
    labels: string[];
    series: { name: string; values: number[]; color?: string; dashed?: boolean }[];
    min?: number;
    max?: number;
    height?: number;
    suffix?: string;
    area?: boolean;
    refLines?: { value: number; label: string; color: string }[];
}) {
    const all = series.flatMap((s) => s.values).concat(refLines.map((r) => r.value));
    const lo = min ?? Math.min(...all) * 0.95;
    const hi = max ?? Math.max(...all) * 1.05;
    const W = 320;
    const H = 120;
    const x = (i: number) => (labels.length <= 1 ? W / 2 : 24 + (i * (W - 32)) / (labels.length - 1));
    const y = (v: number) => H - 14 - ((v - lo) / (hi - lo || 1)) * (H - 24);
    const ticks = [lo, (lo + hi) / 2, hi];

    return (
        <figure>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label={series.map((s) => s.name).join(', ')}>
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1="24" x2={W - 8} y1={y(t)} y2={y(t)} stroke="#ece6d8" strokeWidth="0.6" />
                        <text x="2" y={y(t) + 2} style={{ fontSize: 6 }} className="fill-ink-400">
                            {Math.round(t).toLocaleString()}
                            {suffix}
                        </text>
                    </g>
                ))}
                {refLines.map((r) => (
                    <line key={r.label} x1="24" x2={W - 8} y1={y(r.value)} y2={y(r.value)} stroke={r.color} strokeDasharray="3 2" strokeWidth="0.8" />
                ))}
                {series.map((s, si) => {
                    const color = s.color ?? PALETTE[si % PALETTE.length];
                    const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
                    return (
                        <g key={s.name}>
                            {area && si === 0 && <polygon points={`${x(0)},${H - 14} ${pts} ${x(s.values.length - 1)},${H - 14}`} fill={color} opacity="0.12" />}
                            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeDasharray={s.dashed ? '3 2' : undefined} />
                            {s.values.map((v, i) => (
                                <circle key={i} cx={x(i)} cy={y(v)} r="1.6" fill={color} />
                            ))}
                        </g>
                    );
                })}
                {labels.map((l, i) =>
                    labels.length > 8 && i % Math.ceil(labels.length / 6) !== 0 ? null : (
                        <text key={l + i} x={x(i)} y={H - 3} textAnchor="middle" style={{ fontSize: 6 }} className="fill-ink-500">
                            {l}
                        </text>
                    ),
                )}
            </svg>
            <figcaption className="mt-1 flex flex-wrap justify-center gap-4 text-[0.6875rem] text-ink-600">
                {series.map((s, si) => (
                    <span key={s.name} className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} aria-hidden="true" />
                        {s.name}
                    </span>
                ))}
                {refLines.map((r) => (
                    <span key={r.label} className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 border-t border-dashed" style={{ borderColor: r.color }} aria-hidden="true" />
                        {r.label}
                    </span>
                ))}
            </figcaption>
        </figure>
    );
}

/** Vertical bar chart (optionally stacked). */
export function Bars({
    labels,
    series,
    height = 170,
    suffix = '',
    valueLabels = false,
}: {
    labels: string[];
    series: { name: string; values: number[]; color?: string }[];
    height?: number;
    suffix?: string;
    valueLabels?: boolean;
}) {
    const totals = labels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0));
    const hi = Math.max(...totals, 1) * 1.15;
    const W = 320;
    const H = 120;
    const bw = (W - 40) / labels.length;

    return (
        <figure>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label={series.map((s) => s.name).join(', ')}>
                <line x1="24" x2={W - 8} y1={H - 16} y2={H - 16} stroke="#d9d1bf" strokeWidth="0.6" />
                {labels.map((l, i) => {
                    let acc = 0;
                    return (
                        <g key={l}>
                            {series.map((s, si) => {
                                const v = s.values[i] ?? 0;
                                const h = (v / hi) * (H - 30);
                                const yTop = H - 16 - acc - h;
                                acc += h;
                                return <rect key={s.name} x={28 + i * bw + bw * 0.2} y={yTop} width={bw * 0.6} height={h} fill={s.color ?? PALETTE[si % PALETTE.length]} rx="1" />;
                            })}
                            {valueLabels && (
                                <text x={28 + i * bw + bw / 2} y={H - 18 - acc} textAnchor="middle" style={{ fontSize: 6, fontWeight: 700 }} className="fill-ink-800">
                                    {totals[i].toLocaleString()}
                                    {suffix}
                                </text>
                            )}
                            <text x={28 + i * bw + bw / 2} y={H - 6} textAnchor="middle" style={{ fontSize: 5.5 }} className="fill-ink-500">
                                {l}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {series.length > 1 && (
                <figcaption className="mt-1 flex flex-wrap justify-center gap-4 text-[0.6875rem] text-ink-600">
                    {series.map((s, si) => (
                        <span key={s.name} className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-sm" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} aria-hidden="true" />
                            {s.name}
                        </span>
                    ))}
                </figcaption>
            )}
        </figure>
    );
}

/** Horizontal funnel. */
export function Funnel({ data }: { data: [string, number][] }) {
    const max = data[0]?.[1] || 1;
    return (
        <ul className="space-y-1.5">
            {data.map(([label, v]) => (
                <li key={label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-2 text-xs">
                    <span className="truncate text-ink-600">{label}</span>
                    <span className="flex justify-center">
                        <span className={cn('block h-5 rounded-sm bg-referenced-500/70')} style={{ width: `${Math.max(8, (v / max) * 100)}%` }} />
                    </span>
                    <span className="font-semibold text-ink-900 tabular-nums">
                        {v} <span className="font-normal text-ink-400">({((v / max) * 100).toFixed(1)}%)</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
