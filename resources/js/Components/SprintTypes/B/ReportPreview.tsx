import { CircleCheck, FileText, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ReportPanel } from '@/types/sprint-types-b';

/* Report preview: a grid of dark dashboard panels (analytics reports) or a PDF viewer
   window with a contents rail (governed starter reports). Rendered from panel data. */

const palette = ['#d6a32e', '#e6bd63', '#9a6d19', '#f0d79c', '#7c561a', '#6b6b78'];

const num = (s: unknown) => {
    const m = String(s ?? '').match(/-?[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
};

function seeded(seed: string, n = 10) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    let v = 40;
    return Array.from({ length: n }, () => {
        h = (h * 1103515245 + 12345) >>> 0;
        v = Math.max(10, Math.min(92, v + ((h >> 8) % 19) - 6));
        return v;
    });
}

function Ring({ value, semi = false }: { value: string; semi?: boolean }) {
    const pct = Math.max(4, Math.min(100, num(value)));
    if (semi) {
        return (
            <svg viewBox="0 0 60 34" className="mx-auto h-12 w-20" aria-hidden="true">
                <path d="M6 30 A24 24 0 0 1 54 30" fill="none" stroke="#23232a" strokeWidth="6" />
                <path d="M6 30 A24 24 0 0 1 54 30" fill="none" stroke="#d6a32e" strokeWidth="6" strokeDasharray={`${(pct / 100) * 75.4} 80`} />
                <text x="30" y="29" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{value}</text>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 42 42" className="mx-auto size-16" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#23232a" strokeWidth="5" />
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#d6a32e" strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="25" />
            <text x="21" y="23.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">{value}</text>
        </svg>
    );
}

function Donut({ rows }: { rows: (string | number)[][] }) {
    const vals = rows.map((r) => Math.abs(num(r[1])) || 1);
    const total = vals.reduce((x, y) => x + y, 0);
    let off = 25;
    return (
        <div className="flex items-center gap-2">
            <svg viewBox="0 0 42 42" className="size-14 shrink-0" aria-hidden="true">
                {vals.map((v, i) => {
                    const p = (v / total) * 100;
                    const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={palette[i % palette.length]} strokeWidth="6" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={off} />;
                    off -= p;
                    return el;
                })}
            </svg>
            <ul className="min-w-0 flex-1 space-y-0.5 text-[0.5625rem] text-ink-200">
                {rows.slice(0, 5).map((r, i) => (
                    <li key={i} className="flex items-center gap-1">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: palette[i % palette.length] }} />
                        <span className="truncate">{r[0]}</span>
                        <span className="ml-auto text-white">{r[1]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Spark({ seed, columns = false }: { seed: string; columns?: boolean }) {
    const pts = seeded(seed);
    const w = 100;
    const h = 34;
    const step = w / (pts.length - 1);
    if (columns) {
        return (
            <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
                {pts.map((p, i) => <rect key={i} x={i * step} y={h - (p / 100) * h} width={step * 0.6} height={(p / 100) * h} fill="#d6a32e" opacity={0.5 + i / 20} />)}
            </svg>
        );
    }
    const c = pts.map((p, i) => `${(i * step).toFixed(1)},${(h - (p / 100) * h).toFixed(1)}`).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
            <polygon points={`0,${h} ${c} ${w},${h}`} fill="#d6a32e" opacity="0.15" />
            <polyline points={c} fill="none" stroke="#d6a32e" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function Bars({ rows, red = false }: { rows: (string | number)[][]; red?: boolean }) {
    const max = Math.max(...rows.map((r) => Math.abs(num(r[1]))), 1);
    return (
        <ul className="space-y-1">
            {rows.slice(0, 6).map((r, i) => (
                <li key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-1.5 text-[0.5625rem] text-ink-200">
                    <span className="truncate">{r[0]}</span>
                    <span className="flex items-center gap-1">
                        <span className={cn('h-1.5 rounded-full', red || String(r[1]).startsWith('-') ? 'bg-risk-500' : 'bg-gold-500')} style={{ width: `${(Math.abs(num(r[1])) / max) * 100}%` }} />
                        <span className="shrink-0 text-white">{r[1]}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function ReportPanelView({ p }: { p: ReportPanel }) {
    const t = p.type;
    const rows = Array.isArray(p.rows) ? p.rows : [];
    const items = Array.isArray(p.items) ? p.items : [];
    let body;
    if ((t === 'donut_score' || t === 'gauge_score') && p.value) {
        body = (
            <>
                <Ring value={p.value} semi={t === 'gauge_score'} />
                {p.label && <p className="text-center text-[0.5625rem] text-ink-300">{p.label}</p>}
                {rows.length > 0 && <Bars rows={rows} />}
            </>
        );
    } else if (t === 'donut_legend' && rows.length) {
        body = <Donut rows={rows} />;
    } else if ((t === 'kpi_line' || t === 'kpi') && p.value) {
        body = (
            <>
                <p className="text-lg font-bold text-white">{p.value}</p>
                {p.delta && <p className={cn('text-[0.5625rem]', String(p.delta).startsWith('-') ? 'text-risk-500' : 'text-verified-500')}>{p.delta}</p>}
                {t === 'kpi_line' && <Spark seed={p.title ?? 'k'} />}
            </>
        );
    } else if (t === 'kpis' && Array.isArray(p.kpis)) {
        body = (
            <div className="grid grid-cols-2 gap-1.5">
                {p.kpis.slice(0, 6).map((k, i) => (
                    <div key={i} className="rounded bg-ink-800 p-1.5">
                        <p className="truncate text-[0.5rem] text-ink-300">{k[0]}</p>
                        <p className="text-xs font-bold text-white">{k[1]}</p>
                        {k[2] && <p className="text-[0.5rem] text-verified-500">{k[2]}</p>}
                    </div>
                ))}
            </div>
        );
    } else if ((t === 'bars' || t === 'column' || t === 'funnel' || t === 'numbered_bars') && rows.length) {
        body = <Bars rows={rows} />;
    } else if (t === 'table' && rows.length) {
        body = (
            <table className="w-full text-[0.5625rem] text-ink-200">
                {p.columns && <thead><tr>{p.columns.map((c) => <th key={c} className="pb-0.5 text-left font-semibold text-ink-300">{c}</th>)}</tr></thead>}
                <tbody>{rows.slice(0, 5).map((r, i) => <tr key={i} className="border-t border-ink-700">{r.map((c, j) => <td key={j} className="py-0.5 pr-1">{c}</td>)}</tr>)}</tbody>
            </table>
        );
    } else if (items.length) {
        const Icon = t.includes('warning') || t.includes('flag') ? TriangleAlert : CircleCheck;
        body = (
            <ul className="space-y-0.5 text-[0.5625rem] text-ink-200">
                {items.slice(0, 5).map((it, i) => (
                    <li key={it} className="flex gap-1">
                        {t === 'numbered_list' ? <span className="font-bold text-gold-400">{i + 1}.</span> : <Icon className="size-2.5 shrink-0 text-gold-400" />}
                        {it}
                    </li>
                ))}
            </ul>
        );
    } else if (t === 'text') {
        body = (
            <p className="text-[0.5625rem] leading-relaxed text-ink-200">
                {p.highlight && <span className="mr-1 text-sm font-bold text-gold-400">{p.highlight}</span>}
                {p.content && !/placeholder|lines of/i.test(p.content) ? p.content : 'Summary of findings, priorities and the recommended next actions for decision-makers.'}
            </p>
        );
    } else if (t === 'map') {
        body = (
            <div className="grid grid-cols-8 gap-0.5" aria-hidden="true">
                {seeded(p.title ?? 'map', 24).map((v, i) => <span key={i} className="h-2.5 rounded-[2px] bg-gold-500" style={{ opacity: 0.15 + v / 110 }} />)}
            </div>
        );
    } else if (t === 'heading') {
        return <p className="col-span-full text-[0.6875rem] font-bold tracking-wide text-gold-400 uppercase">{p.title}</p>;
    } else {
        body = <Spark seed={(p.title ?? '') + t} columns={['column', 'waterfall', 'combo', 'dot_matrix'].includes(t)} />;
    }
    return (
        <div className="min-w-0 rounded-[6px] border border-ink-700 bg-ink-900 p-2">
            {p.title && <p className="mb-1 truncate text-[0.5625rem] font-semibold tracking-wide text-ink-300 uppercase">{p.title}</p>}
            {body}
            {p.link && <p className="mt-1 text-[0.5625rem] font-semibold text-gold-400">{p.link}</p>}
        </div>
    );
}

export default function ReportPreview({
    title,
    panels,
    nav,
    pdf = false,
    large = false,
}: {
    title?: string;
    panels: ReportPanel[];
    nav?: string[];
    pdf?: boolean;
    large?: boolean;
}) {
    const grid = (
        <div className={cn('grid gap-2', large ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3')}>
            {panels.slice(0, large ? 12 : 6).map((p, i) => <ReportPanelView key={`${p.title}-${i}`} p={p} />)}
        </div>
    );
    if (!pdf) {
        return (
            <div className="rounded-[12px] border border-ink-700 bg-ink-950 p-3 shadow-[0_0_40px_-12px_rgba(214,163,46,0.5)]">
                {title && <p className="mb-2 text-xs font-bold tracking-wide text-white">{title}</p>}
                {grid}
            </div>
        );
    }
    return (
        <div className="overflow-hidden rounded-[10px] border border-ink-700 bg-ink-900 shadow-raised">
            <div className="flex items-center gap-1.5 border-b border-ink-700 px-3 py-1.5">
                <span className="size-2 rounded-full bg-risk-500" />
                <span className="size-2 rounded-full bg-attested-500" />
                <span className="size-2 rounded-full bg-verified-500" />
                <span className="ml-2 flex items-center gap-1 truncate text-[0.625rem] text-ink-300"><FileText className="size-3" />{title ?? 'report.pdf'}</span>
            </div>
            <div className="grid grid-cols-[6rem_1fr]">
                <ul className="space-y-1 border-r border-ink-700 p-2 text-[0.5625rem] text-ink-300">
                    <li className="font-semibold text-parchment-100">Report Sections</li>
                    {(nav?.length ? nav : panels.map((p) => p.title ?? '').filter(Boolean)).slice(0, 8).map((n, i) => (
                        <li key={`${n}-${i}`} className={cn('truncate rounded px-1 py-0.5', i === 0 && 'border border-gold-500 text-gold-300')}>{n}</li>
                    ))}
                </ul>
                <div className="p-2">{grid}</div>
            </div>
        </div>
    );
}
