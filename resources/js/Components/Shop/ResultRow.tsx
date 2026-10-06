import { Link, router, usePage } from '@inertiajs/react';
import { Bookmark, Clock, ShoppingCart, UserCheck } from 'lucide-react';
import CoverArt from '@/Components/Art/CoverArt';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, Chip } from '@/Components/Shop/Bits';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { SearchResult } from '@/types/shop';

/** True when a result can be added straight to the basket (shop A1/A2 without variants). */
export function directBuy(r: SearchResult): boolean {
    return r.source === 'shop' && (r.act === 'A1' || r.act === 'A2') && r.listing_state === 'LS-01' && r.price_state === 'FIXED_CONFIRMED';
}

export function PriceLabel({ r, className }: { r: Pick<SearchResult, 'price_zar' | 'price_unit' | 'price_state' | 'act'>; className?: string }) {
    const price = usePrice();
    if (r.act === 'A7' || r.price_state === 'FREE_APPROVED') return <span className={cn('font-bold text-verified-700', className)}>Free</span>;
    if (r.price_state === 'QUOTE_REQUIRED') return <span className={cn('font-semibold text-ink-700', className)}>Request quote</span>;
    if (r.price_state === 'PROPOSAL_REQUIRED' && !r.price_zar) return <span className={cn('font-semibold text-ink-700', className)}>Request proposal</span>;
    if (r.price_state === 'PRICE_SUSPENDED' || r.price_zar === null) return <span className={cn('font-semibold text-ink-500', className)}>Price to be confirmed</span>;
    return (
        <span className={className}>
            <span className="text-xs font-normal text-ink-500">From </span>
            <span className="font-bold text-gold-700">{price(r.price_zar)}</span>
            {r.price_unit && <span className="text-xs text-ink-500"> /{r.price_unit}</span>}
        </span>
    );
}

export function BookmarkButton({ slug, label, url }: { slug: string; label: string; url: string }) {
    const { auth } = usePage<SharedProps>().props;
    if (!auth.user) {
        return (
            <Link href="/login" className="rounded p-1 text-gold-600 hover:text-gold-800" aria-label={`Sign in to save ${label}`}>
                <Bookmark className="size-5" />
            </Link>
        );
    }
    return (
        <button
            type="button"
            onClick={() => router.post('/saved', { item_type: 'shop-product', item_key: slug, label, url }, { preserveScroll: true })}
            className="rounded p-1 text-gold-600 hover:text-gold-800"
            aria-label={`Save ${label}`}
        >
            <Bookmark className="size-5" />
        </button>
    );
}

export function AddButton({ r, size = 'md' }: { r: SearchResult; size?: 'sm' | 'md' }) {
    const cls = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-[0.8125rem]';
    if (directBuy(r)) {
        return (
            <button
                type="button"
                onClick={() => router.post(`/shop/product/${r.slug}/add`, {}, { preserveScroll: true })}
                className={cn('inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 font-semibold text-ink-900 hover:bg-gold-400', cls)}
            >
                <ShoppingCart className="size-4" /> Add to Basket
            </button>
        );
    }
    return null;
}

/** Search / listing row (P5): icon, title, description, chips, price, actions. */
export default function ResultRow({ r }: { r: SearchResult }) {
    return (
        <article className="relative flex flex-col gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 sm:flex-row sm:items-start">
            <CoverArt seed={r.slug} category={r.aisle ?? r.subcategory} label={r.name} className="aspect-[16/10] w-full shrink-0 rounded-[6px] sm:w-32" />
            <div className="min-w-0 flex-1">
                <h3 className="text-[0.9375rem] font-semibold text-ink-900">
                    <Link href={r.url} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">{r.name}</Link>
                </h3>
                {r.summary && <p className="mt-1 line-clamp-2 text-[0.8125rem] text-ink-600">{r.summary}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                    <ActTag act={r.act} label={r.act_label} />
                    {r.delivery && <Chip icon={<Clock className="size-3" />}>{r.delivery}</Chip>}
                    {r.act !== 'A2' && r.act !== 'A7' ? <Chip tone="green" icon={<UserCheck className="size-3" />}>Human-Reviewed</Chip> : <Chip>{r.output_format ?? 'Instant Access'}</Chip>}
                    {r.source === 'sprint' && <Chip tone="gold">Sprint catalogue</Chip>}
                </div>
            </div>
            <div className="relative z-10 flex shrink-0 flex-row items-center justify-between gap-3 sm:w-56 sm:flex-col sm:items-end">
                <div className="text-sm sm:text-right">
                    <PriceLabel r={r} />
                    {r.price_zar !== null && r.price_zar > 0 && <p className="text-[0.6875rem] text-ink-400">Excl. VAT</p>}
                    <p className={cn('mt-0.5 flex items-center gap-1 text-xs', r.available ? 'text-verified-700' : 'text-attested-700')}>
                        <span className={cn('size-1.5 rounded-full', r.available ? 'bg-verified-500' : 'bg-attested-500')} />
                        {r.available ? 'Available' : 'Not purchasable online'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link href={r.url} className="inline-flex h-9 items-center rounded-[4px] border border-parchment-500 px-3 text-[0.8125rem] font-medium text-ink-800 hover:border-gold-500">
                        View Details
                    </Link>
                    <AddButton r={r} />
                    {r.source === 'shop' && <BookmarkButton slug={r.slug} label={r.name} url={r.url} />}
                </div>
                {r.source === 'shop' && (
                    <Link href={`/shop/compare?items=${r.code}`} className="text-[0.6875rem] font-medium text-ink-500 hover:text-gold-700">
                        + Add to compare
                    </Link>
                )}
            </div>
        </article>
    );
}

/** Compact grid card variant of a result. */
export function ResultCard({ r }: { r: SearchResult }) {
    return (
        <article className="relative flex h-full flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white p-4">
            <CoverArt seed={r.slug} category={r.aisle ?? r.subcategory} label={r.name} className="-mx-4 -mt-4 mb-3 aspect-[16/8] w-[calc(100%+2rem)] max-w-none" />
            <div className="flex items-start gap-3">
                <ShopIcon name={r.icon} size="sm" />
                <h3 className="text-sm font-semibold text-ink-900"><Link href={r.url} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">{r.name}</Link></h3>
            </div>
            {r.summary && <p className="mt-2 line-clamp-3 flex-1 text-xs text-ink-600">{r.summary}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
                <ActTag act={r.act} label={r.act_label} />
                {r.delivery && <Chip>{r.delivery}</Chip>}
            </div>
            <div className="relative z-10 mt-3 flex items-center justify-between gap-2 border-t border-parchment-300 pt-3">
                <PriceLabel r={r} className="text-sm" />
                {directBuy(r) ? <AddButton r={r} size="sm" /> : <Link href={r.url} className="text-xs font-semibold text-gold-700">View Details →</Link>}
            </div>
        </article>
    );
}
