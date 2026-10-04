import { Link } from '@inertiajs/react';
import { cn } from '@/lib/cn';

const BRAND = 'The Business Clinic.Africa™';

/**
 * Derived from public/tbca_logo.png by scripts documented in the brand folder.
 * - `lockup` drops the tagline and rebalances the mark against the wordmark,
 *   keeping the artwork's own 2.2:1 mark-to-type ratio.
 * - `full` is the untouched lockup, tagline included.
 * - `header` is reconstituted for the 68px utility bar: the parts are sliced
 *   apart, the mark shrunk to 1.3x the text block, the tagline justified to the
 *   wordmark's width and the transparent padding trimmed. Sized for 46px tall,
 *   shipped at 1x and 2x.
 */
const ASSETS = {
    lockup: { src: '/brand/tbca-logo.png', ratio: '698/87' },
    full: { src: '/brand/tbca-logo-full.png', ratio: '788/211' },
    mark: { src: '/brand/tbca-mark.png', ratio: '191/211' },
    header: { src: '/brand/tbca-logo-header.png', ratio: '281/46' },
} as const;

export type LogoVariant = keyof typeof ASSETS;

export default function Logo({
    variant = 'lockup',
    className,
}: {
    variant?: LogoVariant;
    className?: string;
}) {
    return (
        <Link
            href="/"
            className={cn('inline-flex shrink-0 items-center', className)}
            aria-label={`${BRAND} — home`}
        >
            {variant === 'lockup' ? (
                /* Below sm the wordmark would crowd the utility bar, so the mark stands alone. */
                <picture>
                    <source media="(min-width: 640px)" srcSet={ASSETS.lockup.src} />
                    <img
                        src={ASSETS.mark.src}
                        alt={BRAND}
                        className="h-9 w-auto aspect-[191/211] sm:h-[42px] sm:aspect-[698/87]"
                    />
                </picture>
            ) : variant === 'header' ? (
                <img
                    src={ASSETS.header.src}
                    srcSet={`${ASSETS.header.src} 1x, /brand/tbca-logo-header@2x.png 2x`}
                    alt={BRAND}
                    width={281}
                    height={46}
                    className="h-[46px] w-auto"
                    style={{ aspectRatio: ASSETS.header.ratio }}
                />
            ) : (
                <img
                    src={ASSETS[variant].src}
                    alt={BRAND}
                    className={cn('w-auto', variant === 'mark' ? 'h-9' : 'h-auto w-full')}
                    style={{ aspectRatio: ASSETS[variant].ratio }}
                />
            )}
        </Link>
    );
}
