import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ensureSpan, linePath, linesOf, makeView, polygonPath, polygonsOf, WIDTH, type BBox } from './geo';
import type { Geometry, PolygonCoords } from './types';

export type PointShape = 'diamond' | 'circle' | 'triangle' | 'square' | 'dot' | 'ring';

export interface MapPoint {
    id: string;
    layer: string;
    lat: number;
    lon: number;
    name: string;
    sub?: string;
    color: string;
    shape: PointShape;
    /** Radius in map pixels before zoom compensation. */
    size?: number;
    /** Cluster count drawn inside the marker. */
    count?: number;
    placeholder?: boolean;
    dim?: boolean;
    showLabel?: boolean;
}

export interface MapArea {
    key: string;
    name: string;
    polygons: PolygonCoords[];
    selected?: boolean;
    muted?: boolean;
}

export interface MapLine {
    key: string;
    geometries: Geometry[];
    color: string;
    width: number;
    dash?: string;
}

/**
 * SVG country map: outline, optional sub-national boundaries, line layers and
 * point layers. Equirectangular projection fitted to the focus box; zoom with the
 * buttons, drag to pan.
 */
export default function CountryMap({
    outline,
    areas = [],
    lines = [],
    points,
    focus,
    selectedId,
    onPointClick,
    onAreaClick,
    className,
    ariaLabel,
}: {
    outline: PolygonCoords[];
    areas?: MapArea[];
    lines?: MapLine[];
    points: MapPoint[];
    focus: BBox;
    selectedId?: string | null;
    onPointClick?: (p: MapPoint) => void;
    onAreaClick?: (key: string) => void;
    className?: string;
    ariaLabel: string;
}) {
    const [box, setBox] = useState<BBox>(focus);
    const [hover, setHover] = useState<{ text: string; sub?: string; x: number; y: number } | null>(null);
    const drag = useRef<{ x: number; y: number; box: BBox; moved: boolean } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const focusKey = focus.join(',');

    useEffect(() => setBox(focus), [focusKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const view = useMemo(() => makeView(box), [box]);
    // Markers keep a constant on-screen size: compensate for zoom relative to the focus box.
    const zoom = Math.max(1, Math.min(12, (focus[2] - focus[0]) / Math.max(0.01, box[2] - box[0])));
    const scale = 1 / Math.sqrt(zoom);

    const outlinePath = useMemo(() => polygonPath(outline, view), [outline, view]);
    const areaPaths = useMemo(() => areas.map((a) => ({ ...a, d: polygonPath(a.polygons, view) })), [areas, view]);
    const linePaths = useMemo(() => lines.map((l) => ({ ...l, d: linePath(l.geometries.flatMap(linesOf), view) })), [lines, view]);

    const zoomBy = (f: number) => {
        const [x0, y0, x1, y1] = box;
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        setBox(ensureSpan([cx - ((x1 - x0) / 2) * f, cy - ((y1 - y0) / 2) * f, cx + ((x1 - x0) / 2) * f, cy + ((y1 - y0) / 2) * f], 0.05));
    };

    const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
        drag.current = { x: e.clientX, y: e.clientY, box, moved: false };
    };
    const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
        const d = drag.current;
        if (!d || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) < 4 && !d.moved) return;
        d.moved = true;
        const v = makeView(d.box);
        const degX = (dx / rect.width) * (WIDTH / (v.k * v.cos));
        const degY = (dy / rect.height) * (v.height / v.k);
        setBox([d.box[0] - degX, d.box[1] + degY, d.box[2] - degX, d.box[3] + degY]);
    };
    const endDrag = () => {
        setTimeout(() => (drag.current = null), 0);
    };
    const clickable = () => !drag.current?.moved;

    const marker = (p: MapPoint) => {
        const [x, y] = view.project(p.lon, p.lat);
        const r = (p.size ?? 6) * scale * (p.id === selectedId ? 1.35 : 1);
        const stroke = p.id === selectedId ? '#fdfbf7' : '#08080b';
        const common = {
            fill: p.placeholder ? 'transparent' : p.color,
            stroke: p.placeholder ? p.color : stroke,
            strokeWidth: p.placeholder ? 2 : 1,
            strokeDasharray: p.placeholder ? '3 2' : undefined,
            opacity: p.dim ? 0.25 : 1,
        };
        let shape;
        switch (p.shape) {
            case 'diamond':
                shape = <path d={`M${x} ${y - r * 1.3}L${x + r * 1.3} ${y}L${x} ${y + r * 1.3}L${x - r * 1.3} ${y}Z`} {...common} />;
                break;
            case 'triangle':
                shape = <path d={`M${x} ${y - r * 1.3}L${x + r * 1.2} ${y + r}L${x - r * 1.2} ${y + r}Z`} {...common} />;
                break;
            case 'square':
                shape = <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={1.5} {...common} />;
                break;
            case 'ring':
                shape = <circle cx={x} cy={y} r={r} {...common} fill="transparent" stroke={p.color} strokeWidth={2.2} />;
                break;
            case 'dot':
                shape = <circle cx={x} cy={y} r={r * 0.6} {...common} strokeWidth={0.6} />;
                break;
            default:
                shape = <circle cx={x} cy={y} r={r} {...common} fillOpacity={p.count ? 0.85 : 1} />;
        }
        return (
            <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.name}${p.sub ? `, ${p.sub}` : ''}`}
                className="cursor-pointer outline-none"
                onClick={() => clickable() && onPointClick?.(p)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPointClick?.(p)}
                onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) setHover({ text: p.name, sub: p.sub, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHover(null)}
            >
                {shape}
                {p.count !== undefined && p.count > 1 && (
                    <text x={x} y={y + 3.5 * scale} textAnchor="middle" fontSize={10 * scale} fontWeight={700} fill="#08080b" pointerEvents="none">{p.count}</text>
                )}
                {p.showLabel && !p.dim && (
                    <text x={x + r + 3} y={y + 4} fontSize={12 * Math.max(scale, 0.7)} fill="#fdfbf7" stroke="#08080b" strokeWidth={3} paintOrder="stroke" pointerEvents="none">{p.name}</text>
                )}
            </g>
        );
    };

    // Draw dimmed points first and selected last so they sit on top.
    const ordered = [...points].sort((a, b) => Number(!a.dim) - Number(!b.dim) || Number(a.id === selectedId) - Number(b.id === selectedId));

    return (
        <div className={cn('relative overflow-hidden rounded-[8px] border border-ink-700 bg-[#0f1a24]', className)}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${view.height.toFixed(0)}`}
                className="h-auto w-full touch-none select-none"
                role="group"
                aria-label={ariaLabel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
            >
                <path d={outlinePath} fill="#1c1c24" stroke="#d6a32e" strokeWidth={1.4} fillRule="evenodd" />
                {areaPaths.map((a) => (
                    <path
                        key={a.key}
                        d={a.d}
                        fill={a.selected ? 'rgba(214,163,46,0.28)' : a.muted ? 'rgba(79,143,202,0.04)' : 'rgba(79,143,202,0.10)'}
                        stroke={a.selected ? '#d6a32e' : '#4f8fca'}
                        strokeWidth={a.selected ? 1.8 : 0.8}
                        strokeOpacity={0.8}
                        fillRule="evenodd"
                        className={onAreaClick ? 'cursor-pointer hover:fill-[rgba(214,163,46,0.18)]' : undefined}
                        onClick={() => clickable() && onAreaClick?.(a.key)}
                    >
                        <title>{a.name}</title>
                    </path>
                ))}
                {linePaths.map((l) => (
                    <path key={l.key} d={l.d} fill="none" stroke={l.color} strokeWidth={l.width} strokeDasharray={l.dash} strokeOpacity={0.85} strokeLinejoin="round" pointerEvents="none" />
                ))}
                {ordered.map(marker)}
            </svg>
            <div className="absolute top-2 right-2 flex flex-col gap-1">
                {[
                    ['Zoom in', <Plus key="p" className="size-4" />, () => zoomBy(0.6)],
                    ['Zoom out', <Minus key="m" className="size-4" />, () => zoomBy(1.6)],
                    ['Reset view', <RotateCcw key="r" className="size-4" />, () => setBox(focus)],
                ].map(([title, icon, fn]) => (
                    <button key={title as string} type="button" title={title as string} aria-label={title as string} onClick={fn as () => void} className="flex size-8 items-center justify-center rounded border border-ink-600 bg-ink-900/90 text-parchment-100 hover:border-gold-500">
                        {icon as ReactNode}
                    </button>
                ))}
            </div>
            {hover && (
                <span role="tooltip" className="pointer-events-none absolute z-10 max-w-64 -translate-x-1/2 -translate-y-full rounded bg-parchment-100 px-2 py-1 text-xs font-semibold text-ink-900 shadow" style={{ left: hover.x, top: hover.y - 10 }}>
                    {hover.text}
                    {hover.sub && <span className="block font-normal text-ink-500">{hover.sub}</span>}
                </span>
            )}
        </div>
    );
}
