import { Link, router } from '@inertiajs/react';
import { ArrowRight, FileText, ShoppingCart } from 'lucide-react';
import { Chip, DpCover, DpPrice } from './Ui';
import type { DpProductCard } from './types';

/** Adds the product to the shared basket with its entry licence, current version and primary format. */
export function addToCart(p: DpProductCard) {
    const licence = p.licences[0] ?? 'L2';
    router.post(
        '/basket',
        {
            item_type: 'digital-product',
            item_code: `${p.sku}:${licence}`,
            name: p.name,
            variant: `${licence} · ${p.version} · ${p.format} · EN`,
            unit_zar: p.fromPrice,
            meta: { section: 'digital-products', product: p.slug, sku: p.sku, licence, format: p.format, language: 'EN', disclosure_version: 'RDP-v2.0', terms_version: 'v1.1' },
        },
        { preserveScroll: true },
    );
}

export default function ProductCard({ product: p }: { product: DpProductCard }) {
    return (
        <article className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-3 transition-shadow hover:shadow-raised">
            <Link href={`/digital-products/${p.slug}`} className="block focus-visible:outline-2 focus-visible:outline-gold-500">
                <DpCover name={p.name} type={p.typeLabel} tone={p.tone} />
                <h3 className="mt-3 text-[0.9375rem] leading-snug font-semibold text-ink-900">{p.name}</h3>
            </Link>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-600">{p.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Chip>{p.typeLabel}</Chip>
                <Chip>{p.version}</Chip>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {p.languages.map((l) => (
                    <Chip key={l} tone="info">
                        {l}
                    </Chip>
                ))}
                <span className="inline-flex items-center gap-1 text-[0.6875rem] text-ink-500">
                    <FileText className="size-3.5" aria-hidden="true" />
                    {p.format}
                </span>
            </div>
            <DpPrice zar={p.fromPrice} className="mt-3 text-right" />
            <div className="mt-auto pt-3">
                <button
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={!p.purchasable}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50 disabled:opacity-50"
                >
                    <ShoppingCart className="size-4" aria-hidden="true" /> Add to Cart
                </button>
                <Link href={`/digital-products/${p.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">
                    View Details <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
