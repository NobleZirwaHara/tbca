import { Link } from '@inertiajs/react';
import { cn } from '@/lib/cn';

/** Approximate province centres on a 100 x 80 schematic of South Africa. */
const POS: Record<string, [number, number]> = {
    limpopo: [70, 12], mpumalanga: [76, 26], gauteng: [64, 25], 'north-west': [50, 26], 'free-state': [58, 42],
    'kwazulu-natal': [80, 44], 'northern-cape': [28, 46], 'eastern-cape': [62, 62], 'western-cape': [24, 68],
};

const OUTLINE = 'M8 60 L14 44 L22 34 L34 30 L44 18 L58 14 L66 4 L80 4 L88 14 L90 28 L92 38 L86 52 L78 60 L68 70 L52 74 L36 76 L22 76 L12 70 Z';

/**
 * Schematic, clickable map of South Africa's nine provinces. Provinces glow by score.
 */
export default function SaMap({ provinces, active, className }: { provinces: { slug: string; name: string; score: number }[]; active?: string | null; className?: string }) {
    return (
        <svg viewBox="0 0 100 80" className={cn('w-full', className)} role="img" aria-labelledby="sa-map-title">
            <title id="sa-map-title">Map of South Africa&apos;s provinces by opportunity score</title>
            <defs>
                <radialGradient id="sa-glow">
                    <stop offset="0%" stopColor="#f0d79c" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#d6a32e" stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d={OUTLINE} fill="#0d0d11" stroke="#d6a32e" strokeWidth="0.6" />
            {provinces.map((p) => {
                const [x, y] = POS[p.slug] ?? [50, 40];
                const r = 2 + (p.score - 50) / 8;
                return (
                    <Link key={p.slug} href={`/aiim/province/${p.slug}`} aria-label={`${p.name}: score ${p.score}`}>
                        <circle cx={x} cy={y} r={r * 2.2} fill="url(#sa-glow)" />
                        <circle cx={x} cy={y} r={1.4} fill={active === p.slug ? '#fff' : '#d6a32e'} className="cursor-pointer" />
                        <text x={x} y={y - 2.8} textAnchor="middle" fontSize="2.8" className={cn('cursor-pointer', active === p.slug ? 'fill-white font-bold' : 'fill-parchment-200 hover:fill-gold-300')}>
                            {p.name}
                        </text>
                    </Link>
                );
            })}
        </svg>
    );
}
