import { cn } from '@/lib/cn';

export type BackdropVariant = 'network' | 'topo' | 'grid' | 'none';

/**
 * A very faint full-page picture fixed behind the layout's content: an Africa
 * network constellation by default, topographic contours or a dot grid as
 * per-page variations. Opaque sections and cards sit on top of it, so it only
 * shows through the page's parchment gutters. Purely decorative.
 */
export default function Backdrop({ variant = 'network' }: { variant?: BackdropVariant }) {
    if (variant === 'none') return null;

    return (
        <div
            aria-hidden="true"
            className={cn(
                'pointer-events-none fixed inset-0 -z-10',
                variant === 'network' && 'page-motif-network',
                variant === 'topo' && 'page-motif-topo',
                variant === 'grid' && 'motif-grid opacity-40',
            )}
            style={{
                maskImage: 'radial-gradient(120% 90% at 50% 40%, black 30%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(120% 90% at 50% 40%, black 30%, transparent 100%)',
            }}
        />
    );
}
