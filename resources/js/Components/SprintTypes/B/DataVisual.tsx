import { cn } from '@/lib/cn';

/* ==========================================================================
   Illustrative dashboard preview rendered from a compact JSON spec, used in
   place of mockup screenshots (no image hotlinks). Charts are described as
   strings like "donut: Expense Breakdown (Cost of Sales 46%, Payroll 12%)".
   ========================================================================== */

export interface VisualSpec {
    title?: string;
    subtitle?: string;
    kpis?: (string[] | [string, string, string?])[];
    charts?: string[];
    left_label?: string;
    left?: string[];
    right_label?: string;
    right?: string[];
    footer?: string;
}

interface ParsedChart {
    kind: string;
    title: string;
    items: { label: string; value: number; raw: string }[];
}

function hash(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return Math.abs(h);
}

function series(seed: string, n = 12) {
    let h = hash(seed);
    let v = 40;
    return Array.from({ length: n }, () => {
        h = (h * 1103515245 + 12345) & 0x7fffffff;
        v = Math.max(8, Math.min(95, v + ((h % 21) - 7)));
        return v;
    });
}

export function parseChart(spec: string): ParsedChart {
    const m = spec.match(/^\s*([\w\s/-]+?)\s*:\s*(.*)$/);
    const kind = (m?.[1] ?? 'bars').toLowerCase().trim();
    const rest = m?.[2] ?? spec;
    const dash = rest.search(/\s[—–-]\s/);
    const paren = rest.indexOf('(');
    const useDash = dash >= 0 && (paren < 0 || dash < paren);
    const open = useDash ? -1 : paren;
    const title = (useDash ? rest.slice(0, dash) : open >= 0 ? rest.slice(0, open) : rest).trim();
    const inner = useDash
        ? rest.slice(dash + 3)
        : open >= 0
          ? rest.slice(open + 1, rest.lastIndexOf(')') > open ? rest.lastIndexOf(')') : undefined)
          : '';
    const parts = inner ? inner.split(/[;,](?![^(]*\))(?=\s*[A-Za-z])/).map((p) => p.trim()).filter(Boolean) : [];
    const items = parts.map((raw) => {
        const num = raw.match(/(-?[\d.,]+)\s*(%|M|pp|x)?\s*$/);
        const value = num ? parseFloat(num[1].replace(/,/g, '')) : 0;
        const label = num ? raw.slice(0, raw.length - num[0].length).replace(/[R:]$/, '').trim() : raw;
        return { label: label || raw, value, raw };
    });
    return { kind, title, items };
}

const palette = ['#d6a32e', '#e6bd63', '#9a6d19', '#f0d79c', '#7c561a', '#4a4a56'];

function Donut({ items, size = 76, center }: { items: ParsedChart['items']; size?: number; center?: string }) {
    const vals = items.length ? items.map((i) => Math.abs(i.value) || 1) : [40, 25, 20, 15];
    const total = vals.reduce((a, b) => a + b, 0);
    const r = 15.9155;
    let offset = 25;
    return (
        <svg viewBox="0 0 42 42" width={size} height={size} aria-hidden="true" className="shrink-0">
            <circle cx="21" cy="21" r={r} fill="none" stroke="#23232a" strokeWidth="6" />
            {vals.map((v, i) => {
                const pct = (v / total) * 100;
                const el = (
                    <circle
                        key={i}
                        cx="21"
                        cy="21"
                        r={r}
                        fill="none"
                        stroke={palette[i % palette.length]}
                        strokeWidth="6"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={offset}
                    />
                );
                offset -= pct;
                return el;
            })}
            {center && (
                <text x="21" y="23" textAnchor="middle" fontSize="6" fontWeight="700" fill="#f8ecd0">
                    {center}
                </text>
            )}
        </svg>
    );
}

function Line({ seed, area = false, bars = false }: { seed: string; area?: boolean; bars?: boolean }) {
    const pts = series(seed);
    const w = 120;
    const h = 44;
    const step = w / (pts.length - 1);
    const coords = pts.map((p, i) => `${(i * step).toFixed(1)},${(h - (p / 100) * h).toFixed(1)}`);
    if (bars) {
        return (
            <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
                {pts.map((p, i) => (
                    <rect key={i} x={i * step - 3 + (i === 0 ? 3 : 0)} y={h - (p / 100) * h} width="6" height={(p / 100) * h} fill="#d6a32e" opacity={0.55 + (i / pts.length) * 0.45} />
                ))}
            </svg>
        );
    }
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
            {area && <polygon points={`0,${h} ${coords.join(' ')} ${w},${h}`} fill="#d6a32e" opacity="0.18" />}
            <polyline points={coords.join(' ')} fill="none" stroke="#d6a32e" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function Gauge({ label, value }: { label: string; value: string }) {
    const pct = Math.max(5, Math.min(100, parseFloat(value) || 60));
    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 40 22" className="h-8 w-14" aria-hidden="true">
                <path d="M4 20 A16 16 0 0 1 36 20" fill="none" stroke="#23232a" strokeWidth="4" />
                <path d="M4 20 A16 16 0 0 1 36 20" fill="none" stroke="#d6a32e" strokeWidth="4" strokeDasharray={`${(pct / 100) * 50.3} 60`} />
            </svg>
            <span className="text-[0.625rem] font-semibold text-parchment-100">{value}</span>
            <span className="text-[0.5625rem] text-ink-300">{label}</span>
        </div>
    );
}

function ChartTile({ spec }: { spec: string }) {
    const c = parseChart(spec);
    const k = c.kind;
    let body;
    if (k.includes('donut') || k.includes('ring') || k.includes('pie')) {
        body = (
            <div className="flex items-center gap-3">
                <Donut items={c.items} center={k.includes('ring') ? c.title.match(/[\d.]+%/)?.[0] : undefined} />
                <ul className="min-w-0 flex-1 space-y-0.5 text-[0.625rem] text-ink-200">
                    {c.items.slice(0, 5).map((it, i) => (
                        <li key={it.raw} className="flex items-center gap-1.5">
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: palette[i % palette.length] }} />
                            <span className="truncate">{it.label}</span>
                            <span className="ml-auto text-parchment-100">{it.raw.match(/[-\d.,]+\s*%?$/)?.[0]}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    } else if (k.includes('gauge')) {
        const items = c.items.length ? c.items : [{ label: c.title, value: 0, raw: c.title.match(/[\d.]+%/)?.[0] ?? '' }];
        body = (
            <div className="flex flex-wrap justify-around gap-2">
                {items.slice(0, 5).map((it) => (
                    <Gauge key={it.raw + it.label} label={it.label} value={it.raw.match(/[-\d.,]+\s*%?$/)?.[0] ?? it.raw} />
                ))}
            </div>
        );
    } else if ((k.includes('bar') || k.includes('funnel')) && c.items.length) {
        const max = Math.max(...c.items.map((i) => Math.abs(i.value)), 1);
        const red = k.includes('red');
        body = (
            <ul className="space-y-1">
                {c.items.slice(0, 5).map((it) => (
                    <li key={it.raw} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-2 text-[0.625rem] text-ink-200">
                        <span className="truncate">{it.label}</span>
                        <span className="flex items-center gap-1.5">
                            <span className={cn('h-1.5 rounded-full', red ? 'bg-risk-500' : 'bg-gold-500')} style={{ width: `${(Math.abs(it.value) / max) * 100}%` }} />
                            <span className="shrink-0 text-parchment-100">{it.raw.match(/[-R\d.,]+\s*%?$/)?.[0]}</span>
                        </span>
                    </li>
                ))}
            </ul>
        );
    } else if (k.includes('map') || k.includes('heat')) {
        const cells = series(c.title, 24);
        body = (
            <div className="grid grid-cols-8 gap-0.5" aria-hidden="true">
                {cells.map((v, i) => (
                    <span key={i} className="h-3 rounded-[2px] bg-gold-500" style={{ opacity: 0.15 + (v / 100) * 0.85 }} />
                ))}
            </div>
        );
    } else if ((k.includes('list') || k.includes('dots') || k.includes('radar') || k.includes('table')) && c.items.length) {
        body = (
            <ul className="space-y-0.5 text-[0.625rem] text-ink-200">
                {c.items.slice(0, 5).map((it) => (
                    <li key={it.raw} className="flex items-start gap-1.5">
                        <span className="mt-1 size-1 shrink-0 rounded-full bg-gold-500" />
                        <span>{it.raw}</span>
                    </li>
                ))}
            </ul>
        );
    } else {
        body = <Line seed={spec} area={k.includes('area')} bars={k.includes('column') || k.includes('bar')} />;
    }
    return (
        <div className="min-w-0 rounded-[6px] border border-ink-700 bg-ink-900/80 p-2.5">
            <p className="mb-1.5 truncate text-[0.6875rem] font-semibold text-parchment-100">{c.title || k}</p>
            {body}
        </div>
    );
}

export function KpiStrip({ kpis, className }: { kpis: VisualSpec['kpis']; className?: string }) {
    if (!kpis?.length) return null;
    return (
        <div className={cn('grid gap-2', kpis.length >= 5 ? 'grid-cols-2 sm:grid-cols-5' : kpis.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4', className)}>
            {kpis.map((k) => (
                <div key={k[0]} className="min-w-0 rounded-[6px] border border-ink-700 bg-ink-900/80 p-2">
                    <p className="truncate text-[0.625rem] text-ink-300">{k[0]}</p>
                    <p className="truncate text-sm font-bold text-parchment-50">{k[1]}</p>
                    {k[2] && <p className={cn('truncate text-[0.5625rem]', String(k[2]).trim().startsWith('-') ? 'text-risk-500' : 'text-verified-500')}>{k[2]}</p>}
                </div>
            ))}
        </div>
    );
}

/** The dark dashboard mock (title, KPI tiles, chart grid). */
export default function DataVisual({ spec, className, compact = false }: { spec: VisualSpec; className?: string; compact?: boolean }) {
    const charts = spec.charts?.length ? spec.charts : ['area: Performance Trend', 'donut: Mix (A 40%, B 30%, C 20%, D 10%)', 'bars: Top Drivers (One 80%, Two 64%, Three 52%, Four 38%)'];
    return (
        <div className={cn('rounded-[10px] border border-ink-700 bg-ink-950 p-3 text-parchment-100 motif-glow', className)}>
            {(spec.title || spec.subtitle) && (
                <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        {spec.title && <p className="text-[0.8125rem] font-bold tracking-wide">{spec.title}</p>}
                        {spec.subtitle && <p className="text-[0.625rem] text-ink-300">{spec.subtitle}</p>}
                    </div>
                    <span className="text-[0.5625rem] tracking-wider text-ink-400 uppercase">Sample data · Illustrative view</span>
                </div>
            )}
            <KpiStrip kpis={spec.kpis} className="mb-2" />
            <div className={cn('grid gap-2', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3')}>
                {charts.slice(0, compact ? 4 : 6).map((c) => (
                    <ChartTile key={c} spec={c} />
                ))}
            </div>
            {spec.footer && <p className="mt-2 text-center text-[0.625rem] font-semibold text-gold-400">{spec.footer}</p>}
        </div>
    );
}

/** Data-flow hero: sources → central dashboard → outputs, with "Single Source of Truth" plinth. */
export function DataFlowVisual({ spec, className }: { spec: VisualSpec; className?: string }) {
    const side = (label: string | undefined, items: string[] | undefined) =>
        items?.length ? (
            <div className="hidden w-32 shrink-0 flex-col gap-1.5 md:flex">
                {label && <p className="text-[0.5625rem] font-bold tracking-wider text-parchment-200 uppercase">{label}</p>}
                {items.slice(0, 8).map((s) => (
                    <span key={s} className="rounded-[5px] border border-gold-700/60 bg-ink-900 px-2 py-1 text-[0.625rem] text-parchment-100 shadow-[0_0_10px_-4px_rgba(214,163,46,0.6)]">
                        {s}
                    </span>
                ))}
            </div>
        ) : null;
    return (
        <div className={cn('flex items-center gap-3', className)}>
            {side(spec.left_label, spec.left)}
            <div className="min-w-0 flex-1">
                <DataVisual spec={{ ...spec, footer: undefined }} compact />
                <div className="mx-auto mt-2 w-3/4 rounded-[50%] border border-gold-500/50 bg-gradient-to-b from-gold-500/30 to-transparent py-1.5 text-center shadow-[0_0_30px_-6px_rgba(214,163,46,0.8)]">
                    <p className="text-[0.6875rem] font-bold text-gold-300">{spec.footer ?? 'Single Source of Truth'}</p>
                    <p className="text-[0.5625rem] text-parchment-200">Trusted · Governed · Actionable</p>
                </div>
            </div>
            {side(spec.right_label, spec.right)}
        </div>
    );
}
