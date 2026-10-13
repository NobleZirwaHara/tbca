import { Link } from '@inertiajs/react';
import CoverArt from '@/Components/Art/CoverArt';
import { ArrowRight, Bookmark, Clock, Scale, Star } from 'lucide-react';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { CatalogueItem } from '@/types/sprints';
import { priceText } from './lib';

const badgeTone: Record<string, string> = {
    New: 'border-verified-500/40 bg-verified-50 text-verified-700',
    Popular: 'border-gold-400/60 bg-gold-50 text-gold-800',
    'Best Value': 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
    Recommended: 'border-verified-500/40 bg-verified-50 text-verified-700',
    'Top Rated': 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
};

export function CardBadge({ label }: { label: string | null }) {
    if (!label) return null;
    return (
        <span className={cn('inline-flex rounded-[3px] border px-1.5 py-0.5 text-[0.625rem] font-semibold whitespace-nowrap', badgeTone[label] ?? 'border-parchment-500 bg-parchment-200 text-ink-700')}>
            {label}
        </span>
    );
}

export function Rating({ value, reviews, className }: { value: number | null; reviews?: number; className?: string }) {
    if (!value) return null;
    return (
        <span className={cn('inline-flex items-center gap-1 text-[0.75rem] text-ink-600', className)}>
            <Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" />
            <span className="font-semibold text-ink-800">{value.toFixed(1)}</span>
            {reviews ? <span>({reviews} reviews)</span> : null}
        </span>
    );
}

export function IconTile({ name, size = 'md', tone = 'dark' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: 'dark' | 'light' }) {
    const box = { sm: 'size-10', md: 'size-14', lg: 'size-20', xl: 'size-28 md:size-32' }[size];
    const icon = { sm: 'size-5', md: 'size-7', lg: 'size-10', xl: 'size-14' }[size];
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-[8px]',
                tone === 'dark' ? 'border border-gold-500/40 bg-ink-950 text-gold-400' : 'text-gold-600',
                box,
            )}
            aria-hidden="true"
        >
            <Icon name={name} className={icon} strokeWidth={1.3} />
        </span>
    );
}

interface CardProps {
    item: CatalogueItem;
    variant?: 'grid' | 'list' | 'tile';
    compared?: boolean;
    onCompare?: (item: CatalogueItem) => void;
    saved?: boolean;
}

/**
 * Sprint card used on every listing screen.
 *  grid  – black icon tile left, tag + badge, rating, ideal-for chips, price, View Sprint / Compare
 *  tile  – vertical centred card (New Sprints, buyer-route pages, diagnostics)
 *  list  – single row (list view)
 */
export default function CatalogueCard({ item, variant = 'grid', compared = false, onCompare }: CardProps) {
    const price = usePrice();
    const p = priceText(item, price);
    const href = `/sprints/${item.slug}`;
    const delivery = item.delivery ?? 'Delivery confirmed after scope';

    const compare = onCompare && (
        <label className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 text-[0.75rem] text-ink-600">
            <input type="checkbox" checked={compared} onChange={() => onCompare(item)} className="size-3.5 accent-gold-600" />
            Compare
        </label>
    );

    if (variant === 'list') {
        return (
            <article className="relative flex flex-col gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 sm:flex-row sm:items-center">
                <CoverArt seed={item.slug} category={item.category} src={item.image_url} label={item.title} className="aspect-[16/10] w-full shrink-0 rounded-[6px] sm:w-28" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink-900">
                            <Link href={href} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">
                                {item.title}
                            </Link>
                        </h3>
                        <CardBadge label={item.badge} />
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-ink-500">{item.summary}</p>
                </div>
                <dl className="grid grid-cols-3 gap-4 text-[0.75rem] sm:w-[340px]">
                    <div>
                        <dt className="text-ink-400">Category</dt>
                        <dd className="text-ink-800">{item.category_label}</dd>
                    </div>
                    <div>
                        <dt className="text-ink-400">Delivery</dt>
                        <dd className="text-ink-800">{delivery}</dd>
                    </div>
                    <div>
                        <dt className="text-ink-400">{p.label || 'Price'}</dt>
                        <dd className="font-semibold text-ink-900">{p.value}</dd>
                    </div>
                </dl>
                <div className="flex items-center gap-3">
                    {compare}
                    <Link href={href} className="relative z-10 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50">
                        View Sprint <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </div>
            </article>
        );
    }

    if (variant === 'tile') {
        return (
            <article className="relative flex flex-col overflow-hidden rounded-[8px] border border-gold-300/70 bg-white p-4 text-center transition-shadow hover:shadow-card">
                <CoverArt seed={item.slug} category={item.category} src={item.image_url} label={item.title} className="-mx-4 -mt-4 mb-3 aspect-[16/7] w-[calc(100%+2rem)] max-w-none" />
                <div className="flex items-start justify-between">
                    <CardBadge label={item.badge ?? (item.is_new ? 'New' : null)} />
                    <Bookmark className="size-4 text-ink-300" aria-hidden="true" />
                </div>
                <p className="mt-1 text-[0.6875rem] font-semibold text-gold-700">{item.category_label}</p>
                <h3 className="mt-1 text-[0.9375rem] leading-snug font-bold text-ink-900">
                    <Link href={href} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">
                        {item.title}
                    </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-600">{item.summary}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-600">
                    <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-gold-600" aria-hidden="true" />
                        {delivery}
                    </span>
                    <Rating value={item.rating} />
                </div>
                {item.ideal_for.length > 0 && (
                    <p className="mt-2 text-[0.75rem] text-ink-600">
                        <span className="font-semibold text-ink-800">Ideal for:</span> {item.ideal_for.join(', ')}
                    </p>
                )}
                {item.packages.length > 1 && (
                    <p className="mt-1 text-[0.75rem] text-ink-600">
                        <span className="font-semibold text-ink-800">Packages:</span> {item.packages.join(' | ')}
                    </p>
                )}
                <p className="mt-2 text-[0.8125rem] font-semibold text-ink-900">
                    {p.label} {p.value}
                </p>
                <div className="mt-auto pt-4">
                    <Link href={href} className="relative z-10 flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 text-[0.8125rem] font-semibold text-parchment-100 hover:bg-ink-800">
                        View Sprint <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    {compare && <div className="mt-2 flex justify-center">{compare}</div>}
                </div>
            </article>
        );
    }

    return (
        <article className="relative flex flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white p-4 transition-shadow hover:border-gold-300 hover:shadow-card">
            <CoverArt seed={item.slug} category={item.category} src={item.image_url} label={item.title} className="-mx-4 -mt-4 mb-3 aspect-[16/6] w-[calc(100%+2rem)] max-w-none" />
            <div className="flex gap-3.5">
                <IconTile name={item.icon} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-1.5">
                        <span className="rounded-[3px] border border-gold-300 bg-gold-50 px-1.5 py-0.5 text-[0.625rem] font-semibold text-gold-800">{item.category_label}</span>
                        <CardBadge label={item.badge} />
                    </div>
                    <h3 className="mt-1.5 text-[0.9375rem] leading-snug font-bold text-ink-900">
                        <Link href={href} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">
                            {item.title}
                        </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-600">{item.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-600">
                        <Rating value={item.rating} reviews={item.reviews} />
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5 text-ink-400" aria-hidden="true" />
                            {delivery}
                        </span>
                    </div>
                </div>
            </div>
            {item.ideal_for.length > 0 && (
                <div className="mt-3 mb-4 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
                    <span className="font-semibold text-ink-700">Ideal for:</span>
                    {item.ideal_for.map((t) => (
                        <span key={t} className="rounded-full border border-parchment-500 px-2 py-0.5 text-ink-600">
                            {t}
                        </span>
                    ))}
                </div>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-3">
                <p className="text-sm text-ink-700">
                    {p.label} <span className="font-bold text-ink-900">{p.value}</span>
                </p>
                <div className="flex items-center gap-2">
                    <Link href={href} className="relative z-10 inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-[0.75rem] font-semibold text-ink-900 hover:bg-gold-400">
                        View Sprint <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    {onCompare && (
                        <button
                            type="button"
                            onClick={() => onCompare(item)}
                            aria-pressed={compared}
                            className={cn(
                                'relative z-10 inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-[0.75rem] font-medium',
                                compared ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 text-ink-700 hover:border-ink-400',
                            )}
                        >
                            <Scale className="size-3.5" aria-hidden="true" />
                            Compare
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
