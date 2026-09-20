import { cn } from '@/lib/cn';

interface Region {
    id: string;
    label: string;
    d: string;
}

/**
 * Schematic regional map used as the AIIM command-centre canvas.
 * Regions are simplified blocks in the same projection as AfricaMark,
 * not survey geometry, and are labelled as schematic wherever shown.
 */
const REGIONS: Region[] = [
    {
        id: 'north',
        label: 'North Africa',
        d: 'M21.7 6.2 L46.5 4.7 L62 12.4 L77.5 14 L82.2 15.5 L92 34 L66 42 L30 42 L6.2 27.9 L15.5 15.5 Z',
    },
    {
        id: 'west',
        label: 'West Africa',
        d: 'M6.2 27.9 L30 42 L45 44 L43.4 55.8 L31 54.3 L15.5 52.7 L4.7 38.8 Z',
    },
    {
        id: 'central',
        label: 'Central Africa',
        d: 'M30 42 L66 42 L64 62 L49.6 77.5 L45 62 L43.4 55.8 L45 44 Z',
    },
    {
        id: 'east',
        label: 'East Africa',
        d: 'M66 42 L92 34 L97.7 43.4 L110 43.4 L105.4 58.9 L93 68.2 L91.5 72.9 L70 60 L64 62 Z',
    },
    {
        id: 'southern',
        label: 'Southern Africa',
        d: 'M49.6 77.5 L70 60 L91.5 72.9 L93 86.8 L82.2 102.3 L79 108.5 L62 116.3 L58.9 114.7 L49.6 96.1 Z',
    },
];

const NODES: [number, number][] = [
    [30, 24], [55, 22], [76, 26], [90, 42],
    [16, 42], [36, 49], [52, 52], [70, 48],
    [48, 66], [64, 70], [84, 64],
    [58, 84], [74, 84], [64, 98],
];

export default function AfricaMap({
    activeRegion,
    onSelect,
    className,
}: {
    activeRegion?: string | null;
    onSelect?: (id: string) => void;
    className?: string;
}) {
    return (
        <svg viewBox="0 0 115 122" className={cn('h-full w-full', className)} role="img">
            <title>Schematic map of African regions</title>

            {REGIONS.map((region) => {
                const active = activeRegion === region.id;

                return (
                    <path
                        key={region.id}
                        d={region.d}
                        className={cn(
                            'cursor-pointer transition-all duration-300',
                            active
                                ? 'fill-gold-500/35 stroke-gold-400'
                                : 'fill-gold-600/10 stroke-gold-600/50 hover:fill-gold-500/22',
                        )}
                        strokeWidth={active ? 1.2 : 0.7}
                        strokeLinejoin="round"
                        onClick={() => onSelect?.(region.id)}
                    >
                        <title>{region.label}</title>
                    </path>
                );
            })}

            <g className="pointer-events-none">
                {NODES.map(([x, y], index) => (
                    <circle key={index} cx={x} cy={y} r="1.2" className="fill-gold-400/80" />
                ))}
            </g>
        </svg>
    );
}

export { REGIONS };
