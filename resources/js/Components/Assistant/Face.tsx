import { useId } from 'react';
import { cn } from '@/lib/cn';
import { PERSONAS, outfitFor, type FaceTraits, type Outfit, type PersonaId } from './personas';

/**
 * Illustrated persona portrait. The face is fixed per persona; only the
 * outfit rotates (daily by default, or pass `outfit`). Pass `src` (or set
 * `portrait` in the persona config) to swap in a real photo later.
 */
export default function Face({
    persona,
    size = 40,
    outfit,
    src,
    className,
    online,
}: {
    persona: PersonaId;
    size?: number;
    outfit?: number;
    src?: string;
    className?: string;
    online?: boolean;
}) {
    const p = PERSONAS[persona];
    const image = src ?? p.portrait;

    return (
        <span className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }} aria-hidden="true">
            {image ? (
                <img src={image} alt="" className="size-full rounded-full object-cover ring-2 ring-white/70" />
            ) : (
                <Portrait face={p.face} outfit={outfitFor(p, outfit)} />
            )}
            {online && <span className="absolute right-0 bottom-0 size-[28%] max-h-3 max-w-3 rounded-full bg-verified-500 ring-2 ring-white" />}
        </span>
    );
}

function Portrait({ face: f, outfit: o }: { face: FaceTraits; outfit: Outfit }) {
    const clip = `face${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    return (
        <svg viewBox="0 0 120 120" className="size-full rounded-full ring-2 ring-white/70" role="presentation">
            <defs>
                <clipPath id={clip}>
                    <circle cx="60" cy="60" r="60" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
                <rect width="120" height="120" fill={f.background} />
                <circle cx="96" cy="22" r="30" fill="#fff" opacity="0.25" />

                {/* Hair behind the head */}
                {f.hairStyle === 'afro' && <ellipse cx="60" cy="48" rx="37" ry="34" fill={f.hair} />}
                {f.hairStyle === 'braids' && (
                    <g fill={f.hair}>
                        <ellipse cx="60" cy="46" rx="29" ry="30" />
                        <rect x="31" y="46" width="13" height="58" rx="6" />
                        <rect x="76" y="46" width="13" height="58" rx="6" />
                    </g>
                )}
                {f.hairStyle === 'bun' && (
                    <g fill={f.hair}>
                        <circle cx="60" cy="18" r="13" />
                        <ellipse cx="60" cy="46" rx="25" ry="27" />
                    </g>
                )}
                {f.hairStyle === 'curls' && (
                    <g fill={f.hair}>
                        {[
                            [36, 44], [40, 30], [50, 22], [62, 19], [74, 23], [83, 32], [86, 46], [34, 58], [87, 60],
                        ].map(([cx, cy]) => (
                            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="12" />
                        ))}
                    </g>
                )}

                {/* Neck */}
                <path d="M50 72 h20 v20 q-10 6 -20 0 z" fill={f.skinShade} />

                {/* Outfit */}
                <Clothes o={o} skin={f.skin} />

                {/* Ears */}
                <ellipse cx="39.5" cy="58" rx="4" ry="6" fill={f.skinShade} />
                <ellipse cx="80.5" cy="58" rx="4" ry="6" fill={f.skinShade} />

                {/* Head */}
                <ellipse cx="60" cy="56" rx="20.5" ry="24" fill={f.skin} />
                <circle cx="38.5" cy="67" r="2.6" fill="none" stroke={f.earring} strokeWidth="1.6" />
                <circle cx="81.5" cy="67" r="2.6" fill="none" stroke={f.earring} strokeWidth="1.6" />

                {/* Hair front */}
                {f.hairStyle === 'afro' && <path d="M39 52 q2 -22 21 -23 q19 1 21 23 q-6 -12 -21 -13 q-15 1 -21 13 z" fill={f.hair} />}
                {f.hairStyle === 'braids' && (
                    <path d="M39.5 54 q0 -24 20.5 -25 q20.5 1 20.5 25 q-4 -10 -10 -14 q-8 4 -21 4 q-6 2 -10 10 z" fill={f.hair} />
                )}
                {f.hairStyle === 'bun' && <path d="M39.5 54 q1 -23 20.5 -24 q19.5 1 20.5 24 q-3 -14 -20.5 -16 q-17.5 2 -20.5 16 z" fill={f.hair} />}
                {f.hairStyle === 'curls' && <path d="M39.5 52 q2 -20 20.5 -21 q18.5 1 20.5 21 q-6 -10 -12 -11 q-4 4 -9 1 q-5 3 -9 0 q-7 2 -11 10 z" fill={f.hair} />}

                {/* Brows */}
                <path d="M48 49 q5 -3 9 -0.5" stroke={f.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M63 48.5 q4 -2.5 9 0.5" stroke={f.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />

                {/* Eyes */}
                <ellipse cx="52.5" cy="55.5" rx="3.6" ry="2.4" fill="#fff" />
                <ellipse cx="67.5" cy="55.5" rx="3.6" ry="2.4" fill="#fff" />
                <circle cx="52.8" cy="55.6" r="1.8" fill="#2a1a12" />
                <circle cx="67.8" cy="55.6" r="1.8" fill="#2a1a12" />
                <circle cx="53.4" cy="55" r="0.55" fill="#fff" />
                <circle cx="68.4" cy="55" r="0.55" fill="#fff" />
                <path d="M48.6 54.6 q3.9 -3.2 7.8 0" stroke="#1a100c" strokeWidth="1" fill="none" />
                <path d="M63.6 54.6 q3.9 -3.2 7.8 0" stroke="#1a100c" strokeWidth="1" fill="none" />

                {f.glasses && (
                    <g fill="none" stroke="#16161b" strokeWidth="1.3">
                        <rect x="46.5" y="51" width="11.5" height="9" rx="3.5" />
                        <rect x="62" y="51" width="11.5" height="9" rx="3.5" />
                        <path d="M58 55 h4 M46.5 54.5 l-6 -1.5 M73.5 54.5 l6 -1.5" />
                    </g>
                )}

                {/* Nose, cheeks, lips */}
                <path d="M58.5 60 q-1.8 4.6 0.2 5.4 q1.3 0.6 2.6 0 q2 -0.8 0.2 -5.4" fill={f.skinShade} opacity="0.55" />
                <circle cx="48" cy="64" r="3.2" fill="#c0634a" opacity="0.18" />
                <circle cx="72" cy="64" r="3.2" fill="#c0634a" opacity="0.18" />
                <path d="M53.5 70 q6.5 2.6 13 0 q-1.2 4.6 -6.5 4.8 q-5.3 -0.2 -6.5 -4.8 z" fill={f.lips} />
                <path d="M53.5 70 q3.2 -1.6 6.5 -0.4 q3.3 -1.2 6.5 0.4" fill={f.lips} stroke={f.lips} strokeWidth="0.8" />

                {f.headset && (
                    <g fill="none" stroke="#16161b" strokeLinecap="round">
                        <path d="M37 58 q0 -30 23 -31 q23 1 23 31" strokeWidth="2.2" />
                        <rect x="34" y="53" width="6" height="11" rx="2.5" fill="#16161b" />
                        <path d="M37 64 q2 10 13 10" strokeWidth="1.6" />
                        <circle cx="51" cy="74" r="1.8" fill="#16161b" />
                    </g>
                )}
            </g>
        </svg>
    );
}

function Clothes({ o, skin }: { o: Outfit; skin: string }) {
    const shoulders = 'M12 122 C14 98 32 88 60 88 C88 88 106 98 108 122 Z';

    switch (o.style) {
        case 'blazer':
            return (
                <g>
                    <path d={shoulders} fill={o.main} />
                    <path d="M50 88 L60 106 L70 88 Z" fill={o.accent} />
                    <path d="M44 89 L54 112 L58 104 L50 88 Z M76 89 L66 112 L62 104 L70 88 Z" fill="#000" opacity="0.22" />
                    <circle cx="60" cy="114" r="1.6" fill="#000" opacity="0.35" />
                </g>
            );
        case 'blouse':
            return (
                <g>
                    <path d={shoulders} fill={o.main} />
                    <path d="M51 88 Q60 101 69 88 Z" fill={skin} />
                    <path d="M51 88 Q60 101 69 88" fill="none" stroke={o.accent} strokeWidth="2" />
                    <path d="M30 106 q4 -6 10 -8 M90 106 q-4 -6 -10 -8" stroke={o.accent} strokeWidth="1.5" fill="none" opacity="0.6" />
                </g>
            );
        case 'wrap':
            return (
                <g>
                    <path d={shoulders} fill={o.main} />
                    <path d="M50 88 L68 120 L76 120 L56 88 Z" fill={o.accent} />
                    <path d="M70 88 L60 100 L56 94 L52 88 Z" fill={skin} />
                </g>
            );
        case 'turtleneck':
            return (
                <g>
                    <path d={shoulders} fill={o.main} />
                    <rect x="48" y="80" width="24" height="12" rx="5" fill={o.accent} />
                    <path d="M48 85 h24 M48 88.5 h24" stroke={o.main} strokeWidth="0.8" opacity="0.6" />
                </g>
            );
    }
}
