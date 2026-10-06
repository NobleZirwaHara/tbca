import { Link, router } from '@inertiajs/react';
import { Clock, ShoppingCart, UserCheck } from 'lucide-react';
import CoverArt from '@/Components/Art/CoverArt';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { Chip } from '@/Components/Shop/Bits';
import { PriceLabel } from '@/Components/Shop/ResultRow';
import type { ShopCard } from '@/types/shop';

/** Featured product card (shop landing): icon, title, price, chips, Add to Cart. */
export default function ProductCard({ p }: { p: ShopCard }) {
    const configureHref = p.configurable ? `${p.url}/${p.act === 'A2' ? 'licence' : 'configure'}` : null;
    const direct = p.purchasable && (p.act === 'A1' || p.act === 'A2') && !p.configurable;

    return (
        <article className="relative flex h-full flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white p-4 shadow-card transition-shadow hover:border-gold-300">
            <CoverArt seed={p.slug} category={p.vehicle} label={p.name} className="-mx-4 -mt-4 mb-3 aspect-[16/9] w-[calc(100%+2rem)] max-w-none" />
            <div className="flex items-start gap-3">
                <ShopIcon name={p.icon} size="md" />
                <div className="min-w-0">
                    <h3 className="text-sm leading-snug font-semibold text-ink-900">
                        <Link href={p.url} className="hover:text-gold-700 after:absolute after:inset-0 after:content-['']">{p.name}</Link>
                    </h3>
                    {p.tagline && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{p.tagline}</p>}
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                <PriceLabel r={p} />
                <Chip tone="green">USD Available</Chip>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-600">
                <span className="inline-flex items-center gap-1"><Clock className="size-3" aria-hidden="true" /> Delivery: {p.delivery ?? 'TBC'}</span>
                <span className="inline-flex items-center gap-1"><UserCheck className="size-3" aria-hidden="true" /> Human Reviewed</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
                {(p.languages ?? ['EN']).map((l) => (
                    <span key={l} className="rounded-[3px] border border-parchment-500 px-1.5 font-semibold text-ink-700">{l}</span>
                ))}
                <span className="text-ink-500">ZAR (Source)</span>
            </div>
            <div className="relative z-10 mt-auto pt-3">
                {direct ? (
                    <button
                        type="button"
                        onClick={() => router.post(`/shop/product/${p.slug}/add`, {}, { preserveScroll: true })}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50"
                    >
                        <ShoppingCart className="size-4" /> Add to Cart
                    </button>
                ) : (
                    <Link
                        href={configureHref ?? p.url}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50"
                    >
                        {configureHref ? 'Choose Options' : 'View Details'}
                    </Link>
                )}
            </div>
        </article>
    );
}
