import { useId, useMemo } from 'react';
import { AFRICA_COUNTRIES } from '@/Components/Map/africaPaths';
import { cn } from '@/lib/cn';

/**
 * Generated hero artwork: the TBCA Africa network constellation, rendered in depth.
 *
 *   back   – warm gradient field, orbit lines and soft gold light
 *   middle – the accurate outline of the continent (shadow + glass layer)
 *   front  – a constellation linking every country, glowing hub cities, corridor arcs and bokeh
 *
 * Purely decorative (aria-hidden), deterministic (no random flicker between renders) and
 * absolutely positioned: drop it as the first child of a `relative overflow-hidden` block.
 * `fade` lays a readability veil over the text side.
 */

type Tone = 'dark' | 'light';

const PALETTE: Record<Tone, { bg0: string; bg1: string; land: string; landStroke: string; line: string; node: string; glow: string; veil: string }> = {
    dark: { bg0: '#0a0a0f', bg1: '#17130c', land: '#1d1912', landStroke: '#d6a32e', line: '#e6bd63', node: '#f3d58c', glow: '#d6a32e', veil: '#0a0a0f' },
    light: { bg0: '#fbf8f1', bg1: '#f1e7d0', land: '#efe3c5', landStroke: '#b8892a', line: '#b8892a', node: '#a8781d', glow: '#e3b64f', veil: '#fbf8f1' },
};

/** Hub countries that carry a brighter, pulsing node (largest commercial centres). */
const HUBS = ['ZA', 'NG', 'KE', 'EG', 'MA', 'GH', 'ET', 'CI', 'SN', 'TZ', 'AO', 'RW'];

/** Corridor arcs between hubs (drawn as luminous curves above the constellation). */
const CORRIDORS: [string, string][] = [
    ['ZA', 'KE'], ['ZA', 'NG'], ['NG', 'GH'], ['KE', 'EG'], ['MA', 'SN'], ['EG', 'MA'], ['ET', 'KE'], ['AO', 'ZA'], ['CI', 'NG'], ['TZ', 'RW'],
];

function rng(seed: number) {
    let s = seed || 1;
    return () => {
        s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
        return (s % 10000) / 10000;
    };
}

export default function HeroArt({
    tone = 'dark',
    focus = 'right',
    fade = 'left',
    seed = 7,
    className,
}: {
    tone?: Tone;
    /** Where the continent sits. */
    focus?: 'right' | 'center';
    /** Readability veil over the text side. */
    fade?: 'left' | 'bottom' | 'none';
    seed?: number;
    className?: string;
}) {
    const id = useId().replace(/:/g, '');
    const p = PALETTE[tone];
    const dark = tone === 'dark';

    // Africa paths live in a 1000×913 box; place them inside the 1600×900 canvas.
    const scale = focus === 'right' ? 0.86 : 0.8;
    const tx = focus === 'right' ? 1600 - 1000 * scale - 70 : (1600 - 1000 * scale) / 2;
    const ty = (900 - 913 * scale) / 2 + 10;

    const { nodes, links, arcs, bokeh } = useMemo(() => {
        const pts = AFRICA_COUNTRIES.map((c) => ({ iso: c.iso2, x: c.c[0], y: c.c[1], hub: HUBS.includes(c.iso2) }));
        const seen = new Set<string>();
        const ls: [number, number][] = [];
        pts.forEach((a, i) => {
            pts.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
                .filter((x) => x.j !== i)
                .sort((m, n) => m.d - n.d)
                .slice(0, a.hub ? 4 : 2)
                .forEach(({ j }) => {
                    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        ls.push([i, j]);
                    }
                });
        });
        const at = (iso: string) => pts.find((q) => q.iso === iso)!;
        const as = CORRIDORS.map(([a, b]) => {
            const A = at(a);
            const B = at(b);
            const mx = (A.x + B.x) / 2;
            const my = (A.y + B.y) / 2;
            const len = Math.hypot(B.x - A.x, B.y - A.y);
            // Bow each arc outward (perpendicular to the chord) for a sense of flight.
            const nx = -(B.y - A.y) / len;
            const ny = (B.x - A.x) / len;
            return `M${A.x} ${A.y} Q${mx + nx * len * 0.22} ${my + ny * len * 0.22} ${B.x} ${B.y}`;
        });
        const rand = rng(seed);
        const bk = Array.from({ length: 26 }, () => ({ x: rand() * 1600, y: rand() * 900, r: 4 + rand() * 26, o: 0.04 + rand() * 0.12 }));
        return { nodes: pts, links: ls, arcs: as, bokeh: bk };
    }, [seed]);

    const veil =
        fade === 'left'
            ? { x1: '0', y1: '0', x2: '1', y2: '0', stops: [[0, 0.94], [0.42, 0.72], [0.7, 0]] }
            : fade === 'bottom'
              ? { x1: '0', y1: '1', x2: '0', y2: '0', stops: [[0, 0.9], [0.45, 0.4], [0.8, 0]] }
              : null;

    return (
        <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                <defs>
                    <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={p.bg0} />
                        <stop offset="1" stopColor={p.bg1} />
                    </linearGradient>
                    <radialGradient id={`sun${id}`} cx={focus === 'right' ? '0.72' : '0.5'} cy="0.42" r="0.5">
                        <stop offset="0" stopColor={p.glow} stopOpacity={dark ? 0.32 : 0.28} />
                        <stop offset="0.45" stopColor={p.glow} stopOpacity={dark ? 0.1 : 0.08} />
                        <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id={`rim${id}`} cx="0.08" cy="0.05" r="0.45">
                        <stop offset="0" stopColor={p.glow} stopOpacity={dark ? 0.16 : 0.12} />
                        <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id={`land${id}`} x1="0" y1="0" x2="0.4" y2="1">
                        <stop offset="0" stopColor={p.land} stopOpacity={dark ? 0.95 : 0.85} />
                        <stop offset="1" stopColor={p.land} stopOpacity={dark ? 0.55 : 0.45} />
                    </linearGradient>
                    <linearGradient id={`arc${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={p.line} stopOpacity="0" />
                        <stop offset="0.5" stopColor={p.node} stopOpacity={dark ? 0.85 : 0.7} />
                        <stop offset="1" stopColor={p.line} stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id={`hub${id}`}>
                        <stop offset="0" stopColor={p.node} stopOpacity="0.9" />
                        <stop offset="0.35" stopColor={p.glow} stopOpacity="0.35" />
                        <stop offset="1" stopColor={p.glow} stopOpacity="0" />
                    </radialGradient>
                    <filter id={`blur${id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="18" />
                    </filter>
                    <filter id={`soft${id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" />
                    </filter>
                    {veil && (
                        <linearGradient id={`veil${id}`} x1={veil.x1} y1={veil.y1} x2={veil.x2} y2={veil.y2}>
                            {veil.stops.map(([o, a]) => (
                                <stop key={o} offset={o} stopColor={p.veil} stopOpacity={a} />
                            ))}
                        </linearGradient>
                    )}
                </defs>

                {/* Back: field, light and orbits */}
                <rect width="1600" height="900" fill={`url(#bg${id})`} />
                <rect width="1600" height="900" fill={`url(#rim${id})`} />
                <rect width="1600" height="900" fill={`url(#sun${id})`} />
                <g fill="none" stroke={p.line} strokeOpacity={dark ? 0.08 : 0.12} strokeWidth="1">
                    {[260, 360, 470, 590, 720].map((r, i) => (
                        <ellipse key={r} cx={tx + 500 * scale} cy={ty + 470 * scale} rx={r * 1.25} ry={r * 0.82} strokeDasharray={i % 2 ? '2 10' : undefined} transform={`rotate(-14 ${tx + 500 * scale} ${ty + 470 * scale})`} />
                    ))}
                </g>

                {/* Middle: the continent — blurred shadow, then a glass layer */}
                <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
                    <g filter={`url(#blur${id})`} opacity={dark ? 0.55 : 0.35} transform="translate(14 26)">
                        {AFRICA_COUNTRIES.map((c) => (
                            <path key={c.slug} d={c.d} fill={dark ? '#000' : '#c9b48a'} />
                        ))}
                    </g>
                    <g>
                        {AFRICA_COUNTRIES.map((c) => (
                            <path key={c.slug} d={c.d} fill={`url(#land${id})`} stroke={p.landStroke} strokeOpacity={dark ? 0.32 : 0.4} strokeWidth={0.9} fillRule="evenodd" />
                        ))}
                    </g>

                    {/* Front: constellation */}
                    <g stroke={p.line} strokeOpacity={dark ? 0.32 : 0.38} strokeWidth="1" strokeLinecap="round">
                        {links.map(([a, b]) => (
                            <line key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
                        ))}
                    </g>
                    <g fill="none" stroke={`url(#arc${id})`} strokeWidth="2" strokeLinecap="round">
                        {arcs.map((d) => (
                            <path key={d} d={d} />
                        ))}
                    </g>
                    {nodes.map((n) =>
                        n.hub ? (
                            <g key={n.iso}>
                                <circle cx={n.x} cy={n.y} r="34" fill={`url(#hub${id})`} className="motion-safe:animate-pulse" />
                                <circle cx={n.x} cy={n.y} r="5.5" fill={p.node} />
                                <circle cx={n.x} cy={n.y} r="11" fill="none" stroke={p.node} strokeOpacity="0.45" />
                            </g>
                        ) : (
                            <circle key={n.iso} cx={n.x} cy={n.y} r="3" fill={p.node} fillOpacity={dark ? 0.75 : 0.65} />
                        ),
                    )}
                </g>

                {/* Front: bokeh light */}
                <g filter={`url(#soft${id})`}>
                    {bokeh.map((b, i) => (
                        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={p.glow} fillOpacity={b.o * (dark ? 1 : 0.7)} />
                    ))}
                </g>

                {veil && <rect width="1600" height="900" fill={`url(#veil${id})`} />}
            </svg>
        </div>
    );
}
