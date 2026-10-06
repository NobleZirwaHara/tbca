import type { AfricaRegion } from './africaPaths';

/** AU region label ("Central Africa") -> map region id ("central"). */
const REGION_IDS: Record<string, AfricaRegion> = {
    'North Africa': 'north',
    'West Africa': 'west',
    'Central Africa': 'central',
    'Middle Africa': 'central',
    'East Africa': 'east',
    'Southern Africa': 'southern',
};

export function regionId(label?: string | null): AfricaRegion | null {
    return label ? (REGION_IDS[label] ?? null) : null;
}

/** Map fills for the Countries availability buckets (matches the legend dots). Shells keep the base fill. */
const BUCKET_FILLS: Record<string, string> = {
    activated: '#2f8a5f',
    degraded: '#b7791f',
    suspended: '#c0392b',
    restricted: '#7f1d1d',
};

export function bucketFill(bucket?: string | null): string | undefined {
    return bucket ? BUCKET_FILLS[bucket] : undefined;
}
