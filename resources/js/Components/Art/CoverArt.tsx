import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * Generated placeholder artwork for sprints, products, briefs and services.
 *
 * Deterministic per `seed` (use the slug or code): the same item always gets the
 * same picture, and items in the same `category` share a colour family so a
 * catalogue reads as one set. When a real HD image exists, pass it as `src` and
 * it is shown instead — swapping placeholders for final art is a data change only.
 *
 *   <CoverArt seed={sprint.slug} category={sprint.category} label={sprint.title} className="aspect-[16/9]" />
 */

const FAMILIES: Record<string, [string, string, string]> = {
    'business-management': ['#1b1b22', '#3a2a10', '#d6a32e'],
    'ai-automation': ['#0d1424', '#14324f', '#5fb3e6'],
    'data-dashboards': ['#0f1a17', '#123d33', '#3fbf8f'],
    'courses-learning': ['#1d1222', '#3d1f4a', '#c48be0'],
    diagnostics: ['#1f1410', '#4a2412', '#f08a4b'],
    'digital-products': ['#18140b', '#3d3110', '#e6bd63'],
    'project-advisory': ['#101820', '#1f3a4d', '#7fb2d9'],
    'research-reports': ['#141414', '#2e2e38', '#b8b8c8'],
    'templates-toolkits': ['#161a10', '#34401a', '#a8c95a'],
    technology: ['#0b1220', '#1a2b4f', '#6f8cff'],
    'due-diligence': ['#1a1010', '#40191a', '#e0605a'],
    'subscriptions-retainers': ['#12161c', '#22324a', '#9ab4d6'],
};
const FALLBACK: [string, string, string] = ['#0d0d11', '#23232a', '#d6a32e'];

function hash(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function rng(seed: number) {
    let s = seed || 1;
    return () => {
        s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
        return (s % 10000) / 10000;
    };
}

export default function CoverArt({
    seed,
    category,
    label,
    src,
    className,
    showLabel = false,
}: {
    seed: string;
    category?: string | null;
    label?: string;
    src?: string | null;
    className?: string;
    showLabel?: boolean;
}) {
    const gid = useId().replace(/:/g, '');

    if (src) {
        return <img src={src} alt={label ?? ''} loading="lazy" className={cn('h-full w-full object-cover', className)} />;
    }

    const [dark, mid, accent] = FAMILIES[category ?? ''] ?? FALLBACK;
    const rand = rng(hash(seed));

    // A constellation of nodes with connecting lines, echoing the TBCA Africa network mark.
    const nodes = Array.from({ length: 14 }, () => ({ x: 10 + rand() * 300, y: 10 + rand() * 160, r: 1.2 + rand() * 2.6 }));
    const links: [number, number][] = [];
    nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
            if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 70) links.push([i, j]);
        });
    });
    const arcY = 60 + rand() * 80;
    const angle = Math.floor(rand() * 360);

    return (
        <div className={cn('relative overflow-hidden', className)} role="img" aria-label={label ?? ''}>
            <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <linearGradient id={`g${gid}`} gradientTransform={`rotate(${angle} .5 .5)`}>
                        <stop offset="0" stopColor={dark} />
                        <stop offset="1" stopColor={mid} />
                    </linearGradient>
                    <radialGradient id={`r${gid}`} cx=".75" cy=".25" r=".7">
                        <stop offset="0" stopColor={accent} stopOpacity=".35" />
                        <stop offset="1" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="320" height="180" fill={`url(#g${gid})`} />
                <rect width="320" height="180" fill={`url(#r${gid})`} />
                <path d={`M0 ${arcY} Q 160 ${arcY - 70} 320 ${arcY + 10}`} stroke={accent} strokeOpacity=".25" strokeWidth="1.2" fill="none" />
                <path d={`M0 ${arcY + 24} Q 160 ${arcY - 40} 320 ${arcY + 36}`} stroke={accent} strokeOpacity=".12" strokeWidth="1" fill="none" />
                {links.map(([i, j]) => (
                    <line key={`${i}-${j}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} stroke={accent} strokeOpacity=".28" strokeWidth=".7" />
                ))}
                {nodes.map((n, i) => (
                    <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={accent} fillOpacity={0.45 + (i % 3) * 0.18} />
                ))}
            </svg>
            {showLabel && label && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-sm font-semibold text-white">{label}</span>
            )}
        </div>
    );
}
