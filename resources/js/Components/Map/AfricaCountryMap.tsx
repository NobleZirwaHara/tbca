import { Link } from '@inertiajs/react';
import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AFRICA_COUNTRIES, AFRICA_VIEWBOX, WESTERN_SAHARA_PATH, type AfricaCountryShape, type AfricaRegion } from './africaPaths';

export type { AfricaCountryShape, AfricaRegion };

type Tone = 'dark' | 'light';

const PALETTE: Record<Tone, { base: string; region: string; highlight: string; hover: string; selected: string; stroke: string; sahara: string }> = {
    dark: { base: '#1c1c24', region: '#3a3122', highlight: '#6e5520', hover: '#8a6a1f', selected: '#d6a32e', stroke: '#d6a32e', sahara: '#14141a' },
    light: { base: '#ece6d8', region: '#e7d8b4', highlight: '#e3c27a', hover: '#f0d79c', selected: '#d6a32e', stroke: '#8a6a1f', sahara: '#f4f0e6' },
};

/**
 * Accurate map of Africa's 54 countries (Natural Earth 1:50m outlines, see africaPaths.ts),
 * shared across the site.
 *
 * - `selected` (slug or ISO2) is drawn in solid gold, `highlighted` ISO2s and the countries
 *   of `activeRegion` get lighter gold fills; `colorFor` overrides the fill per country.
 * - Interaction: `hrefFor` makes each country a link (return null to leave it unlinked);
 *   `onSelect` makes countries buttons instead. With neither, hover still names the country.
 * - `decorative` renders a static, aria-hidden backdrop (hero artwork).
 */
export default function AfricaCountryMap({
    selected,
    highlighted,
    activeRegion,
    colorFor,
    hrefFor = (slug) => `/aiim/country/${slug}`,
    onSelect,
    tone = 'dark',
    decorative = false,
    label = 'Map of Africa: select a country to open its Investor Cockpit',
    className,
    tipFor,
}: {
    selected?: string | null;
    highlighted?: string[];
    activeRegion?: AfricaRegion | null;
    colorFor?: (country: AfricaCountryShape) => string | undefined;
    hrefFor?: ((slug: string, country: AfricaCountryShape) => string | null) | null;
    onSelect?: (country: AfricaCountryShape) => void;
    tone?: Tone;
    decorative?: boolean;
    label?: string;
    className?: string;
    /** Optional richer hover text (several lines allowed); defaults to the country name. */
    tipFor?: (country: AfricaCountryShape) => string;
}) {
    const [hover, setHover] = useState<{ slug: string; name: string; x: number; y: number } | null>(null);
    const p = PALETTE[tone];
    const highlightSet = new Set((highlighted ?? []).map((h) => h.toUpperCase()));
    const isSelected = (c: AfricaCountryShape) => Boolean(selected) && (c.slug === selected || c.iso2 === selected?.toUpperCase());

    const track = (slug: string, name: string) => (e: MouseEvent<SVGGElement>) => {
        const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (!box) return;
        setHover({ slug, name, x: e.clientX - box.left, y: e.clientY - box.top });
    };

    const fill = (c: AfricaCountryShape) => {
        if (isSelected(c)) return p.selected;
        if (!decorative && c.slug === hover?.slug) return p.hover;
        const custom = colorFor?.(c);
        if (custom) return custom;
        if (highlightSet.has(c.iso2)) return p.highlight;
        if (activeRegion && c.region === activeRegion) return p.region;
        return p.base;
    };

    const shape = (c: AfricaCountryShape) => {
        const sel = isSelected(c);
        return (
            <>
                <path d={c.d} fill={fill(c)} stroke={p.stroke} strokeOpacity={sel ? 1 : decorative ? 0.45 : 0.6} strokeWidth={sel ? 1.6 : 0.7} fillRule="evenodd" className="transition-colors duration-150" />
                {c.small && <circle cx={c.c[0]} cy={c.c[1]} r={9} fill={fill(c)} fillOpacity={0.35} stroke={p.stroke} strokeOpacity={0.7} strokeWidth={0.8} />}
            </>
        );
    };

    const country = (c: AfricaCountryShape): ReactNode => {
        if (decorative) return <g key={c.slug}>{shape(c)}</g>;

        const focus = {
            onFocus: () => setHover({ slug: c.slug, name: c.name, x: -1, y: -1 }),
            onBlur: () => setHover(null),
        };
        const inner = <g onMouseMove={track(c.slug, c.name)}>{shape(c)}</g>;
        const href = onSelect ? null : hrefFor?.(c.slug, c) ?? null;

        if (href) {
            return (
                <Link key={c.slug} href={href} aria-label={c.name} aria-current={isSelected(c) ? 'page' : undefined} {...focus} className="cursor-pointer outline-none">
                    {inner}
                </Link>
            );
        }
        if (onSelect) {
            return (
                <g
                    key={c.slug}
                    role="button"
                    tabIndex={0}
                    aria-label={c.name}
                    aria-pressed={isSelected(c)}
                    onClick={() => onSelect(c)}
                    onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(c);
                        }
                    }}
                    {...focus}
                    className="cursor-pointer outline-none"
                >
                    {inner}
                </g>
            );
        }
        return (
            <g key={c.slug} aria-label={c.name}>
                {inner}
            </g>
        );
    };

    // The selected country is drawn last so its outline sits on top of its neighbours.
    const ordered = [...AFRICA_COUNTRIES].sort((a, b) => Number(isSelected(a)) - Number(isSelected(b)));

    return (
        <div className={cn('relative', className)} aria-hidden={decorative || undefined}>
            <svg
                viewBox={AFRICA_VIEWBOX}
                className="h-auto w-full"
                role={decorative ? undefined : 'group'}
                aria-label={decorative ? undefined : label}
                onMouseLeave={() => setHover(null)}
            >
                <path d={WESTERN_SAHARA_PATH} fill={p.sahara} stroke={p.stroke} strokeOpacity={0.35} strokeWidth={0.8} strokeDasharray="3 2" fillRule="evenodd">
                    {!decorative && <title>Western Sahara (disputed territory)</title>}
                </path>
                {ordered.map(country)}
            </svg>
            {hover && !decorative && (
                <span
                    role="tooltip"
                    className={cn('pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded px-2 py-1 text-xs font-semibold shadow', tipFor ? 'w-max max-w-[240px] whitespace-pre-line' : 'whitespace-nowrap', tone === 'dark' ? 'bg-parchment-100 text-ink-900' : 'bg-ink-900 text-parchment-100')}
                    style={hover.x < 0 ? { left: '50%', top: '0.5rem', transform: 'translateX(-50%)' } : { left: hover.x, top: hover.y - 10 }}
                >
                    {tipFor ? tipFor(AFRICA_COUNTRIES.find((c) => c.slug === hover.slug) ?? AFRICA_COUNTRIES[0]) : hover.name}
                </span>
            )}
        </div>
    );
}
