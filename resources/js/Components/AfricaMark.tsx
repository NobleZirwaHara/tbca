import { cn } from '@/lib/cn';

/**
 * Simplified Africa outline. Coordinates are projected from approximate coastal
 * reference points (x = (lon + 20) * 1.55, y = (40 - lat) * 1.55), so the shape
 * reads as the continent rather than a decorative blob.
 */
const OUTLINE = [
    'M21.7 6.2',
    'L46.5 4.7', // Tunis
    'L62 12.4', // Libyan coast
    'L77.5 14', // Alexandria
    'L82.2 15.5', // Suez
    'L97.7 43.4', // Bab el-Mandeb
    'L110 43.4', // Horn of Africa
    'L105.4 58.9',
    'L93 68.2', // Kenyan coast
    'L91.5 72.9',
    'L93 86.8', // Mozambique channel
    'L82.2 102.3',
    'L79 108.5', // Durban
    'L62 116.3', // Cape Agulhas
    'L58.9 114.7', // Cape Town
    'L49.6 96.1', // Namibia
    'L49.6 77.5', // Angola
    'L45 62', // Gabon
    'L43.4 55.8', // Niger delta
    'L31 54.3', // Ghana
    'L15.5 52.7', // Liberia
    'L4.7 38.8', // Dakar
    'L6.2 27.9',
    'L15.5 15.5', // Moroccan coast
    'Z',
].join(' ');

const NODES: [number, number][] = [
    [26, 20], [48, 22], [72, 24], [90, 40],
    [14, 41], [34, 48], [50, 50], [70, 46], [96, 52],
    [46, 64], [62, 68], [84, 62],
    [56, 82], [72, 82], [86, 88],
    [62, 96], [68, 106],
];

const LINKS: [[number, number], [number, number]][] = [
    [[26, 20], [48, 22]], [[48, 22], [72, 24]], [[72, 24], [90, 40]],
    [[26, 20], [14, 41]], [[48, 22], [50, 50]], [[72, 24], [70, 46]],
    [[90, 40], [96, 52]], [[14, 41], [34, 48]], [[34, 48], [50, 50]],
    [[50, 50], [70, 46]], [[34, 48], [46, 64]], [[50, 50], [62, 68]],
    [[70, 46], [84, 62]], [[96, 52], [84, 62]], [[46, 64], [56, 82]],
    [[62, 68], [72, 82]], [[84, 62], [86, 88]], [[56, 82], [62, 96]],
    [[72, 82], [62, 96]], [[62, 96], [68, 106]], [[86, 88], [72, 82]],
];

export default function AfricaMark({
    className,
    showNetwork = true,
    strokeWidth = 3,
}: {
    className?: string;
    showNetwork?: boolean;
    strokeWidth?: number;
}) {
    return (
        <svg viewBox="0 0 115 122" fill="none" className={cn('size-8', className)} aria-hidden="true">
            <path
                d={OUTLINE}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {showNetwork && (
                <g opacity="0.65">
                    {LINKS.map(([a, b], index) => (
                        <line
                            key={index}
                            x1={a[0]}
                            y1={a[1]}
                            x2={b[0]}
                            y2={b[1]}
                            stroke="currentColor"
                            strokeWidth={strokeWidth * 0.3}
                        />
                    ))}
                    {NODES.map(([x, y], index) => (
                        <circle key={index} cx={x} cy={y} r={strokeWidth * 0.62} fill="currentColor" />
                    ))}
                </g>
            )}
        </svg>
    );
}
