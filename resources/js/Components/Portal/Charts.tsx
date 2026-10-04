import type { Slice } from '@/types/portal';
import { cn } from '@/lib/cn';

/* Lightweight SVG charts for portal dashboards (no chart library). */

export const TONE_HEX: Record<string, string> = {
    good: '#1f7a4c',
    green: '#1f7a4c',
    warn: '#b0781e',
    orange: '#d97a1e',
    bad: '#b5372a',
    red: '#b5372a',
    info: '#2f5fa8',
    blue: '#2f5fa8',
    gold: '#d6a32e',
    purple: '#7a4fa3',
    neutral: '#9a9aa5',
    grey: '#9a9aa5',
    teal: '#1d8a8a',
    dark: '#33333c',
};

export function toneHex(tone?: string | null) {
    return TONE_HEX[tone ?? 'neutral'] ?? tone ?? TONE_HEX.neutral;
}

export function Donut({ items, center, centerLabel, size = 132 }: { items: Slice[]; center?: string; centerLabel?: string | null; size?: number }) {
    const total = items.reduce((s, i) => s + Math.max(0, i.value), 0) || 1;
    const r = 42;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${centerLabel ?? 'Total'} ${center ?? ''}`} className="shrink-0">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#efe7d8" strokeWidth="16" />
            {items.map((i) => {
                const len = (Math.max(0, i.value) / total) * c;
                const el = (
                    <circle
                        key={i.label}
                        cx="60"
                        cy="60"
                        r={r}
                        fill="none"
                        stroke={toneHex(i.tone)}
                        strokeWidth="16"
                        strokeDasharray={`${len} ${c - len}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 60 60)"
                    />
                );
                offset += len;
                return el;
            })}
            <text x="60" y="58" textAnchor="middle" className="fill-ink-900" style={{ fontSize: center && center.length > 6 ? 13 : 18, fontWeight: 700 }}>
                {center}
            </text>
            {centerLabel && (
                <text x="60" y="74" textAnchor="middle" className="fill-ink-500" style={{ fontSize: 9 }}>
                    {centerLabel}
                </text>
            )}
        </svg>
    );
}

export function Legend({ items }: { items: Slice[] }) {
    const total = items.reduce((s, i) => s + Math.max(0, i.value), 0) || 1;
    return (
        <ul className="w-full space-y-1.5 text-xs">
            {items.map((i) => (
                <li key={i.label} className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: toneHex(i.tone) }} aria-hidden="true" />
                    <span className="flex-1 text-ink-700">{i.label}</span>
                    <span className="font-semibold text-ink-900">{i.display ?? `${i.value} (${Math.round((i.value / total) * 1000) / 10}%)`}</span>
                </li>
            ))}
        </ul>
    );
}

export function Gauge({ value, label }: { value: number; label: string }) {
    const v = Math.max(0, Math.min(100, value));
    const angle = Math.PI * (1 - v / 100);
    const x = 60 + 44 * Math.cos(angle);
    const y = 64 - 44 * Math.sin(angle);
    const tone = v >= 85 ? TONE_HEX.good : v >= 65 ? TONE_HEX.gold : TONE_HEX.bad;
    return (
        <svg viewBox="0 0 120 76" className="mx-auto w-44" role="img" aria-label={`${label} ${v}`}>
            <path d="M16 64 A44 44 0 0 1 104 64" fill="none" stroke="#efe7d8" strokeWidth="12" strokeLinecap="round" />
            <path d={`M16 64 A44 44 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" stroke={tone} strokeWidth="12" strokeLinecap="round" />
            <text x="60" y="56" textAnchor="middle" className="fill-ink-900" style={{ fontSize: 17, fontWeight: 700 }}>
                {Number.isInteger(value) ? value : value.toFixed(1)}
                {value <= 100 ? '' : ''}
            </text>
            <text x="60" y="72" textAnchor="middle" style={{ fontSize: 9, fill: tone, fontWeight: 600 }}>
                {label}
            </text>
        </svg>
    );
}

export function SeriesChart({
    labels,
    series,
    type = 'stacked',
    height = 180,
    format = (n: number) => n.toLocaleString('en-ZA'),
}: {
    labels: string[];
    series: { label: string; tone: string; values: number[] }[];
    type?: 'stacked' | 'line' | 'bars';
    height?: number;
    format?: (n: number) => string;
}) {
    const w = 600;
    const h = height;
    const pad = { l: 44, r: 8, t: 10, b: 24 };
    const totals = labels.map((_, i) => (type === 'stacked' ? series.reduce((s, se) => s + (se.values[i] ?? 0), 0) : Math.max(...series.map((se) => se.values[i] ?? 0))));
    const max = Math.max(1, ...totals) * 1.1;
    const bw = (w - pad.l - pad.r) / labels.length;
    const y = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);

    return (
        <div>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Chart">
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                    <g key={f}>
                        <line x1={pad.l} x2={w - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#efe7d8" />
                        <text x={pad.l - 4} y={y(max * f) + 3} textAnchor="end" style={{ fontSize: 9 }} className="fill-ink-400">
                            {format(Math.round(max * f))}
                        </text>
                    </g>
                ))}
                {type === 'line'
                    ? series.map((se) => (
                          <polyline
                              key={se.label}
                              fill="none"
                              stroke={toneHex(se.tone)}
                              strokeWidth="2.5"
                              points={se.values.map((v, i) => `${pad.l + bw * i + bw / 2},${y(v)}`).join(' ')}
                          />
                      ))
                    : labels.map((_, i) => {
                          let acc = 0;
                          return (
                              <g key={i}>
                                  {series.map((se, si) => {
                                      const v = se.values[i] ?? 0;
                                      if (type === 'bars') {
                                          const sw = (bw * 0.7) / series.length;
                                          return <rect key={se.label} x={pad.l + bw * i + bw * 0.15 + sw * si} y={y(v)} width={sw} height={h - pad.b - y(v)} fill={toneHex(se.tone)} rx="2" />;
                                      }
                                      const top = y(acc + v);
                                      const rect = <rect key={se.label} x={pad.l + bw * i + bw * 0.2} y={top} width={bw * 0.6} height={y(acc) - top} fill={toneHex(se.tone)} />;
                                      acc += v;
                                      return rect;
                                  })}
                              </g>
                          );
                      })}
                {labels.map((l, i) => (
                    <text key={l + i} x={pad.l + bw * i + bw / 2} y={h - 8} textAnchor="middle" style={{ fontSize: 9 }} className="fill-ink-500">
                        {l}
                    </text>
                ))}
            </svg>
            <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-ink-600">
                {series.map((se) => (
                    <span key={se.label} className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full" style={{ background: toneHex(se.tone) }} aria-hidden="true" />
                        {se.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function Sparkline({ values, tone = 'good', className }: { values: number[]; tone?: string; className?: string }) {
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 28}`).join(' ');
    return (
        <svg viewBox="0 0 100 32" className={cn('h-8 w-24', className)} aria-hidden="true">
            <polyline points={pts} fill="none" stroke={toneHex(tone)} strokeWidth="2" />
        </svg>
    );
}
