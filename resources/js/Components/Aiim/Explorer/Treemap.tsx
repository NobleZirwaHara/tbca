import { Link } from '@inertiajs/react';
import { useState } from 'react';

export interface TreemapLeaf {
    id: string;
    label: string;
    value: number;
    color: string;
    detail?: string;
    href?: string | null;
}

export interface TreemapGroup {
    id: string;
    label: string;
    leaves: TreemapLeaf[];
}

interface Rect { x: number; y: number; w: number; h: number }

/** Squarified treemap layout (Bruls, Huizing and van Wijk) for values that sum to the rect area. */
function squarify<T extends { value: number }>(items: T[], rect: Rect): (T & Rect)[] {
    const out: (T & Rect)[] = [];
    const total = items.reduce((s, i) => s + i.value, 0);
    if (total <= 0 || rect.w <= 0 || rect.h <= 0) return out;
    const scale = (rect.w * rect.h) / total;
    let queue = [...items].sort((a, b) => b.value - a.value).map((i) => ({ item: i, area: i.value * scale }));
    let { x, y, w, h } = rect;

    const worst = (row: { area: number }[], side: number) => {
        const sum = row.reduce((s, r) => s + r.area, 0);
        const max = Math.max(...row.map((r) => r.area));
        const min = Math.min(...row.map((r) => r.area));
        return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
    };

    while (queue.length) {
        const side = Math.min(w, h);
        const row = [queue[0]];
        let i = 1;
        while (i < queue.length && worst([...row, queue[i]], side) <= worst(row, side)) {
            row.push(queue[i]);
            i++;
        }
        queue = queue.slice(i);
        const sum = row.reduce((s, r) => s + r.area, 0);
        if (w >= h) {
            const cw = sum / h;
            let cy = y;
            for (const r of row) {
                const ch = r.area / cw;
                out.push({ ...r.item, x, y: cy, w: cw, h: ch });
                cy += ch;
            }
            x += cw;
            w -= cw;
        } else {
            const ch = sum / w;
            let cx = x;
            for (const r of row) {
                const cw = r.area / ch;
                out.push({ ...r.item, x: cx, y, w: cw, h: ch });
                cx += cw;
            }
            y += ch;
            h -= ch;
        }
    }
    return out;
}

/**
 * Heat-map treemap in the style of a market map: groups (sectors) hold tiles sized
 * by value and coloured by a performance measure supplied by the caller.
 */
export default function Treemap({ groups, height = 460, ariaLabel }: { groups: TreemapGroup[]; height?: number; ariaLabel: string }) {
    const W = 1000;
    const H = height;
    const [hover, setHover] = useState<string | null>(null);
    const sized = groups.map((g) => ({ ...g, value: g.leaves.reduce((s, l) => s + l.value, 0) })).filter((g) => g.value > 0);
    const blocks = squarify(sized, { x: 0, y: 0, w: W, h: H });

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-[8px] border border-ink-700 bg-ink-950" role="img" aria-label={ariaLabel}>
            {blocks.map((g) => {
                const header = g.h > 40 && g.w > 60 ? 18 : 0;
                const tiles = squarify(g.leaves.filter((l) => l.value > 0), { x: g.x + 1, y: g.y + header + 1, w: g.w - 2, h: g.h - header - 2 });
                return (
                    <g key={g.id}>
                        <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#16161b" stroke="#08080b" strokeWidth={2} />
                        {header > 0 && (
                            <text x={g.x + 6} y={g.y + 13} fontSize={11} fontWeight={700} fill="#dca83c" style={{ textTransform: 'uppercase' }}>
                                {g.label.length * 6.5 > g.w - 10 ? `${g.label.slice(0, Math.max(3, Math.floor((g.w - 10) / 6.5) - 1))}…` : g.label}
                            </text>
                        )}
                        {tiles.map((t) => {
                            const big = t.w > 70 && t.h > 34;
                            const chars = Math.floor((t.w - 8) / 6.2);
                            const name = t.label.length > chars ? `${t.label.slice(0, Math.max(1, chars - 1))}…` : t.label;
                            const body = (
                                <g onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)}>
                                    <rect x={t.x} y={t.y} width={Math.max(0, t.w)} height={Math.max(0, t.h)} fill={t.color} stroke={hover === t.id ? '#fdfbf7' : '#08080b'} strokeWidth={hover === t.id ? 2 : 1} />
                                    <title>{`${t.label}${t.detail ? `\n${t.detail}` : ''}`}</title>
                                    {big && <text x={t.x + 5} y={t.y + 15} fontSize={11} fontWeight={600} fill="#fdfbf7" pointerEvents="none">{name}</text>}
                                    {big && t.detail && t.h > 48 && <text x={t.x + 5} y={t.y + 29} fontSize={10} fill="#fdfbf7" opacity={0.85} pointerEvents="none">{t.detail.length > chars ? `${t.detail.slice(0, Math.max(1, chars - 1))}…` : t.detail}</text>}
                                </g>
                            );
                            return t.href ? <Link key={t.id} href={t.href} aria-label={t.label}>{body}</Link> : <g key={t.id}>{body}</g>;
                        })}
                    </g>
                );
            })}
        </svg>
    );
}

/** Diverging colour for a value against a hurdle: red below, green above. */
export function hurdleColor(value: number | null | undefined, hurdle: number, spread = 12): string {
    if (value === null || value === undefined) return '#3a3a44';
    const t = Math.max(-1, Math.min(1, (value - hurdle) / spread));
    if (t >= 0) {
        const g = Math.round(90 + 70 * t);
        return `rgb(${Math.round(40 - 20 * t)}, ${g}, ${Math.round(60 - 10 * t)})`;
    }
    const r = Math.round(120 + 70 * -t);
    return `rgb(${r}, ${Math.round(50 - 20 * -t)}, ${Math.round(45 - 10 * -t)})`;
}

export const STATUS_COLORS: Record<string, string> = {
    QUALIFIED: '#1f7a4c',
    WATCHLIST: '#b0781e',
    'NOT QUALIFIED': '#8d271c',
};
