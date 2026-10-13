import type { Geometry, PolygonCoords, Position } from './types';

/** [lonMin, latMin, lonMax, latMax] */
export type BBox = [number, number, number, number];

export const WIDTH = 1000;

export interface View {
    bbox: BBox;
    k: number;
    cos: number;
    height: number;
    project: (lon: number, lat: number) => [number, number];
}

/** Equirectangular projection scaled by the cosine of the middle latitude, fitted to WIDTH. */
export function makeView(bbox: BBox, pad = 0.06, maxRatio = 1.1): View {
    let [x0, y0, x1, y1] = bbox;
    const padX = (x1 - x0) * pad || 0.5;
    const padY = (y1 - y0) * pad || 0.5;
    x0 -= padX; x1 += padX; y0 -= padY; y1 += padY;
    const cos = Math.cos((((y0 + y1) / 2) * Math.PI) / 180);
    let k = WIDTH / ((x1 - x0) * cos);
    let height = (y1 - y0) * k;
    // Tall shapes: widen the box so the map keeps a sensible aspect ratio.
    if (height > WIDTH * maxRatio) {
        k = (WIDTH * maxRatio) / (y1 - y0);
        const span = WIDTH / (k * cos);
        const mid = (x0 + x1) / 2;
        x0 = mid - span / 2;
        x1 = mid + span / 2;
        height = WIDTH * maxRatio;
    }
    if (height < WIDTH * 0.45) {
        const span = (WIDTH * 0.45) / k;
        const mid = (y0 + y1) / 2;
        y0 = mid - span / 2;
        y1 = mid + span / 2;
        height = WIDTH * 0.45;
    }
    const top = y1;
    const left = x0;
    return { bbox: [x0, y0, x1, y1], k, cos, height, project: (lon, lat) => [(lon - left) * cos * k, (top - lat) * k] };
}

export function bboxOfPositions(points: Position[]): BBox | null {
    if (!points.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of points) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
    }
    return [x0, y0, x1, y1];
}

export function polygonsOf(g: Geometry | null | undefined): PolygonCoords[] {
    if (!g) return [];
    if (g.type === 'Polygon') return [g.coordinates as PolygonCoords];
    if (g.type === 'MultiPolygon') return g.coordinates as PolygonCoords[];
    return [];
}

export function linesOf(g: Geometry): Position[][] {
    if (g.type === 'LineString') return [g.coordinates as Position[]];
    if (g.type === 'MultiLineString') return g.coordinates as Position[][];
    if (g.type === 'Polygon') return g.coordinates as Position[][];
    if (g.type === 'MultiPolygon') return (g.coordinates as Position[][][]).flat();
    return [];
}

export function outerPositions(polys: PolygonCoords[]): Position[] {
    return polys.flatMap((p) => p[0] ?? []);
}

/** SVG path data for polygons (all rings, even-odd fill). */
export function polygonPath(polys: PolygonCoords[], view: View): string {
    return polys
        .map((rings) => rings.map((ring) => ring.map(([x, y], i) => `${i ? 'L' : 'M'}${view.project(x, y).map((n) => n.toFixed(1)).join(' ')}`).join('') + 'Z').join(''))
        .join('');
}

export function linePath(lines: Position[][], view: View): string {
    return lines.map((line) => line.map(([x, y], i) => `${i ? 'L' : 'M'}${view.project(x, y).map((n) => n.toFixed(1)).join(' ')}`).join('')).join('');
}

/** Expands a bbox that is too small (single point or a tight cluster). */
export function ensureSpan(b: BBox, min = 0.6): BBox {
    const [x0, y0, x1, y1] = b;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const w = Math.max(x1 - x0, min) / 2;
    const h = Math.max(y1 - y0, min) / 2;
    return [cx - w, cy - h, cx + w, cy + h];
}
