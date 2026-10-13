import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import { colorOf } from '@/Components/Webinars/kit';

/* Lightweight SVG charts for the Webinars consoles (no chart library dependency). */

export interface Series {
    label: string;
    values: number[];
    color?: string;
    kind?: 'bar' | 'line';
}

function useFmt(money?: boolean, pct?: boolean) {
    const price = usePrice('');
    return (v: number) => (money ? price(v) : pct ? `${v}%` : v >= 10000 ? `${Math.round(v / 1000)}k` : String(v));
}

function niceMax(v: number) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

const W = 640;
const H = 240;
const PAD = { l: 52, r: 12, t: 14, b: 34 };

function Legend({ series }: { series: Series[] }) {
    if (series.length < 2) return null;
    return (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-ink-600">
            {series.map((s, i) => (
                <li key={s.label} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: colorOf(s.color, i) }} />
                    {s.label}
                </li>
            ))}
        </ul>
    );
}

function Axis({ max, fmt, labels, step }: { max: number; fmt: (v: number) => string; labels: string[]; step: number }) {
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const every = Math.max(1, Math.ceil(labels.length / 8));
    return (
        <g fontSize="11" fill="#6b6b78">
            {ticks.map((t) => {
                const y = PAD.t + (H - PAD.t - PAD.b) * (1 - t);
                return (
                    <g key={t}>
                        <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#ebe0cd" />
                        <text x={PAD.l - 6} y={y + 4} textAnchor="end">{fmt(Math.round(max * t))}</text>
                    </g>
                );
            })}
            {labels.map((l, i) => (i % every === 0 || i === labels.length - 1 ? (
                <text key={l + i} x={PAD.l + step * (i + 0.5)} y={H - 12} textAnchor="middle">{l.length > 12 ? `${l.slice(0, 11)}...` : l}</text>
            ) : null))}
        </g>
    );
}

export function LineChart({ labels, series, money, pct, area = true }: { labels: string[]; series: Series[]; money?: boolean; pct?: boolean; area?: boolean }) {
    const fmt = useFmt(money, pct);
    const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
    const step = (W - PAD.l - PAD.r) / Math.max(1, labels.length);
    const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
    return (
        <figure>
            <Legend series={series} />
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={series.map((s) => s.label).join(', ')}>
                <Axis max={max} fmt={fmt} labels={labels} step={step} />
                {series.map((s, si) => {
                    const c = colorOf(s.color, si);
                    const pts = s.values.map((v, i) => `${PAD.l + step * (i + 0.5)},${y(v)}`);
                    return (
                        <g key={s.label}>
                            {area && series.length === 1 && pts.length > 1 && <polygon points={`${PAD.l + step * 0.5},${y(0)} ${pts.join(' ')} ${PAD.l + step * (s.values.length - 0.5)},${y(0)}`} fill={c} opacity="0.15" />}
                            <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
                            {s.values.map((v, i) => (
                                <circle key={i} cx={PAD.l + step * (i + 0.5)} cy={y(v)} r="3.5" fill="#fff" stroke={c} strokeWidth="2">
                                    <title>{`${labels[i]}: ${fmt(v)}`}</title>
                                </circle>
                            ))}
                        </g>
                    );
                })}
            </svg>
        </figure>
    );
}

export function BarChart({ labels, series, money, pct, stacked }: { labels: string[]; series: Series[]; money?: boolean; pct?: boolean; stacked?: boolean }) {
    const fmt = useFmt(money, pct);
    const bars = series.filter((s) => s.kind !== 'line');
    const totals = labels.map((_, i) => (stacked ? bars.reduce((a, s) => a + (s.values[i] ?? 0), 0) : Math.max(...bars.map((s) => s.values[i] ?? 0))));
    const max = niceMax(Math.max(1, ...totals, ...series.filter((s) => s.kind === 'line').flatMap((s) => s.values)));
    const step = (W - PAD.l - PAD.r) / Math.max(1, labels.length);
    const inner = H - PAD.t - PAD.b;
    const groupW = step * 0.7;
    const bw = stacked ? groupW : groupW / Math.max(1, bars.length);
    return (
        <figure>
            <Legend series={series} />
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={series.map((s) => s.label).join(', ')}>
                <Axis max={max} fmt={fmt} labels={labels} step={step} />
                {labels.map((l, i) => {
                    let acc = 0;
                    return bars.map((s, si) => {
                        const v = s.values[i] ?? 0;
                        const h = (inner * v) / max;
                        const x = PAD.l + step * i + (step - groupW) / 2 + (stacked ? 0 : si * bw);
                        const yy = PAD.t + inner - h - (stacked ? (inner * acc) / max : 0);
                        acc += v;
                        return (
                            <g key={`${l}-${s.label}`}>
                                <rect x={x} y={yy} width={Math.max(2, bw - 2)} height={Math.max(0, h)} rx="2" fill={colorOf(s.color, si)}>
                                    <title>{`${l} | ${s.label}: ${fmt(v)}`}</title>
                                </rect>
                                {!stacked && bars.length === 1 && labels.length <= 8 && (
                                    <text x={x + bw / 2} y={yy - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#23232a">{fmt(v)}</text>
                                )}
                            </g>
                        );
                    });
                })}
                {series.filter((s) => s.kind === 'line').map((s, si) => (
                    <polyline key={s.label} points={s.values.map((v, i) => `${PAD.l + step * (i + 0.5)},${PAD.t + inner * (1 - v / max)}`).join(' ')} fill="none" stroke={colorOf(s.color, si + 3)} strokeWidth="2.5" />
                ))}
            </svg>
        </figure>
    );
}

export function HBars({ rows, money, asPct }: { rows: { label: string; value: number; color?: string; pct?: boolean; money?: boolean }[]; money?: boolean; asPct?: boolean }) {
    const price = usePrice('');
    const total = rows.reduce((a, r) => a + r.value, 0) || 1;
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <ul className="space-y-2.5">
            {rows.map((r, i) => {
                const share = Math.round((r.value / total) * 100);
                const width = asPct ? share : r.pct ? r.value : (r.value / max) * 100;
                const text = r.money || money ? price(r.value) : r.pct ? `${r.value}%` : asPct ? `${share}% (${r.value})` : String(r.value);
                return (
                    <li key={r.label + i}>
                        <div className="flex items-baseline justify-between gap-2 text-[0.75rem]">
                            <span className="truncate text-ink-700">{r.label}</span>
                            <span className="shrink-0 font-semibold text-ink-900">{text}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-parchment-300">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(1, Math.min(100, width))}%`, background: colorOf(r.color, i) }} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export function Donut({ slices, center, sub, size = 150 }: { slices: { label: string; value: number; color?: string; money?: boolean }[]; center: string; sub?: string; size?: number }) {
    const price = usePrice('');
    const total = slices.reduce((a, s) => a + s.value, 0);
    const r = 42;
    const c = 2 * Math.PI * r;
    let off = 0;
    const centerText = center.startsWith('money:') ? price(Number(center.slice(6))) : center;
    return (
        <div className="flex flex-wrap items-center gap-4">
            <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0" role="img" aria-label={`${centerText} ${sub ?? ''}`}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="#f4ede1" strokeWidth="14" />
                {total > 0 && slices.map((s, i) => {
                    const len = (s.value / total) * c;
                    const el = <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={colorOf(s.color, i)} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 50 50)"><title>{`${s.label}: ${s.value}`}</title></circle>;
                    off += len;
                    return el;
                })}
                <text x="50" y={sub ? 49 : 54} textAnchor="middle" fontSize={centerText.length > 6 ? 11 : 16} fontWeight="700" fill="#0d0d11">{centerText}</text>
                {sub && <text x="50" y="62" textAnchor="middle" fontSize="7" fill="#4a4a56">{sub}</text>}
            </svg>
            <ul className="min-w-[10rem] flex-1 space-y-1.5 text-[0.75rem]">
                {slices.map((s, i) => (
                    <li key={s.label} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-ink-700"><span className="size-2.5 shrink-0 rounded-full" style={{ background: colorOf(s.color, i) }} />{s.label}</span>
                        <span className="shrink-0 font-semibold text-ink-900">{s.money ? price(s.value) : s.value} <span className="font-normal text-ink-400">{total ? Math.round((s.value / total) * 100) : 0}%</span></span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Funnel({ steps }: { steps: { label: string; value: number; sub?: string }[] }) {
    const max = Math.max(1, ...steps.map((s) => s.value));
    const colors = ['blue', 'green', 'purple', 'gold', 'red', 'orange'];
    return (
        <ul className="space-y-1.5">
            {steps.map((s, i) => (
                <li key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="flex justify-center">
                        <div className="flex h-8 items-center justify-center rounded-[4px] text-[0.75rem] font-bold text-white" style={{ width: `${Math.max(18, (s.value / max) * 100)}%`, background: colorOf(colors[i % colors.length]) }}>
                            {s.value.toLocaleString('en-ZA')}
                        </div>
                    </div>
                    <div className="w-36 text-[0.75rem]">
                        <p className="font-semibold text-ink-900">{s.label}</p>
                        {s.sub && <p className="text-ink-500">{s.sub}</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

const LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

export function HeatMap({ points }: { points: { n: number; label: string; x: number; y: number }[] }) {
    const color = (x: number, y: number) => {
        const s = x + y;
        return s >= 9 ? '#d0473a' : s >= 7 ? '#e08a2e' : s >= 5 ? '#e6bd63' : s >= 4 ? '#a8c95a' : '#6fbf7f';
    };
    return (
        <div>
            <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-0.5 text-[0.625rem] text-ink-500">
                {[5, 4, 3, 2, 1].map((y) => (
                    <div key={y} className="contents">
                        <span className="pr-1.5 text-right leading-7">{LEVELS[y - 1]}</span>
                        {[1, 2, 3, 4, 5].map((x) => {
                            const here = points.filter((p) => p.x === x && p.y === y);
                            return (
                                <div key={x} className="flex h-7 items-center justify-center rounded-[2px]" style={{ background: color(x, y) }}>
                                    {here.map((p) => (
                                        <span key={p.n} title={p.label} className="flex size-5 items-center justify-center rounded-full bg-ink-900 text-[0.625rem] font-bold text-white">{p.n}</span>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
                <span />
                {LEVELS.map((l) => <span key={l} className="pt-1 text-center">{l}</span>)}
            </div>
            <p className="mt-1 text-center text-[0.6875rem] font-semibold text-ink-600">Likelihood (horizontal) by Impact (vertical)</p>
            <ol className="mt-2 space-y-0.5 text-[0.6875rem] text-ink-600">
                {points.map((p) => <li key={p.n} className={cn('truncate')}>{p.n}. {p.label}</li>)}
            </ol>
        </div>
    );
}
