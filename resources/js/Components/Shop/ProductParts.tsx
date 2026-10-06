import type { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Clock, FileText, Heart, Repeat, ShieldCheck, ShoppingBag, Store, Users, Zap } from 'lucide-react';
import CoverArt from '@/Components/Art/CoverArt';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag } from '@/Components/Shop/Bits';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { ProductDetail } from '@/types/shop';

export function SaveToggle({ product, saved, className }: { product: ProductDetail; saved: boolean; className?: string }) {
    const { auth } = usePage<SharedProps>().props;
    const cls = cn('inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold text-ink-700 hover:border-gold-500', className);
    if (!auth.user) {
        return (
            <Link href="/login" className={cls}>
                <Heart className="size-4 text-gold-700" aria-hidden="true" /> Add to Saved Items
            </Link>
        );
    }
    return (
        <button
            type="button"
            aria-pressed={saved}
            className={cls}
            onClick={() => router.post('/saved', { item_type: 'shop-product', item_key: product.slug, label: product.name, url: product.url }, { preserveScroll: true })}
        >
            <Heart className={cn('size-4 text-gold-700', saved && 'fill-gold-500')} aria-hidden="true" /> {saved ? 'Saved' : 'Add to Saved Items'}
        </button>
    );
}

/** Attribute row under the title, by commercial act. */
export function attributes(p: ProductDetail): { icon: ReactNode; label: string; value: string }[] {
    const i = (n: ReactNode) => n;
    switch (p.act) {
        case 'A2':
            return [
                { icon: i(<Zap className="size-4" />), label: 'Instant Access', value: 'After checkout' },
                { icon: i(<Users className="size-4" />), label: 'Self-Service', value: 'Use at your pace' },
                { icon: i(<FileText className="size-4" />), label: p.output_format ?? 'Templates & Tools', value: 'Format' },
                { icon: i(<ShieldCheck className="size-4" />), label: 'Human-Reviewed', value: 'TBCA professionals' },
                { icon: i(<Repeat className="size-4" />), label: 'Lifetime Updates', value: p.version },
            ];
        case 'A3':
            return [
                { icon: i(<Repeat className="size-4" />), label: 'Monthly Access', value: 'Recurring' },
                { icon: i(<ShieldCheck className="size-4" />), label: 'Human-Reviewed', value: 'By TBCA Advisors' },
                { icon: i(<FileText className="size-4" />), label: 'Plan Updates', value: 'Continuous' },
                { icon: i(<Users className="size-4" />), label: 'Priority Support', value: 'Email + WhatsApp' },
                { icon: i(<Clock className="size-4" />), label: 'Cancel Anytime', value: 'No lock-in' },
            ];
        case 'A4':
            return [
                { icon: i(<Users className="size-4" />), label: 'Dedicated Adviser', value: 'Named Senior Adviser' },
                { icon: i(<BadgeCheck className="size-4" />), label: 'Flexible Commitment', value: 'C1-C5 Tiers' },
                { icon: i(<FileText className="size-4" />), label: 'Predictable Budget', value: 'Monthly Fee + Overage' },
                { icon: i(<Zap className="size-4" />), label: 'Priority Access', value: 'Faster Response' },
                { icon: i(<Repeat className="size-4" />), label: 'Continuous Value', value: 'Month after Month' },
            ];
        case 'A7':
            return [
                { icon: i(<Zap className="size-4" />), label: 'Instant Access', value: 'Start immediately' },
                { icon: i(<Clock className="size-4" />), label: 'Takes 10-15 Minutes', value: 'Quick and easy' },
                { icon: i(<Users className="size-4" />), label: 'Personalised Insights', value: 'Results tailored to you' },
                { icon: i(<CheckCircle2 className="size-4" />), label: 'Actionable Next Steps', value: 'Clear recommendations' },
            ];
        default:
            return [
                { icon: i(<Clock className="size-4" />), label: 'Delivery Time', value: p.delivery ?? 'TBC' },
                { icon: i(<Users className="size-4" />), label: 'Human Review', value: 'Included' },
                { icon: i(<FileText className="size-4" />), label: 'Output Format', value: p.output_format ?? '-' },
                { icon: i(<ShoppingBag className="size-4" />), label: 'Commercial Act', value: p.act_label },
                { icon: i(<Store className="size-4" />), label: 'Shop Listing Mode', value: p.mode },
            ];
    }
}

/** Left icon tile + act tag + title + tagline block shared by every product template. */
export function ProductHead({ product, saved, tag, title, tagline, children, tone = 'gold' }: { product: ProductDetail; saved: boolean; tag?: string; title?: string; tagline?: string; children?: ReactNode; tone?: 'gold' | 'green' | 'red' }) {
    return (
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3 md:w-56">
                <div className="relative w-full overflow-hidden rounded-[8px] border border-parchment-400">
                    <CoverArt seed={product.slug} category={product.aisle} label={product.name} className="aspect-[4/3]" />
                    <span className="absolute bottom-2 left-2"><ShopIcon name={tone === 'red' ? 'shopping-bag' : product.icon} size="sm" tone={tone} /></span>
                </div>
                <SaveToggle product={product} saved={saved} className="w-full" />
            </div>
            <div className="min-w-0">
                <ActTag act={product.act} label={tag ?? product.act_label} />
                <h1 className="mt-2 font-serif text-[1.875rem] leading-tight font-semibold text-ink-900 md:text-[2.375rem]">{title ?? product.name}</h1>
                <p className="mt-2 text-[0.9375rem] font-medium text-ink-800">{tagline ?? product.tagline}</p>
                {children}
            </div>
        </div>
    );
}

export function AttributeRow({ product }: { product: ProductDetail }) {
    return (
        <ul className="mt-4 grid grid-cols-2 gap-3 border-y border-parchment-400 py-3 sm:grid-cols-3 lg:grid-cols-5">
            {attributes(product).map((a) => (
                <li key={a.label} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 text-gold-700" aria-hidden="true">{a.icon}</span>
                    <span>
                        <span className="block font-semibold text-ink-900">{a.label}</span>
                        <span className="block text-ink-500">{a.value}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function ReviewedBox({ title = 'Human-Reviewed for quality and accuracy', body = 'All deliverables are reviewed by TBCA professionals before delivery.' }: { title?: string; body?: string }) {
    return (
        <div className="mt-4 flex items-start gap-3 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3">
            <ShieldCheck className="size-6 shrink-0 text-verified-500" aria-hidden="true" />
            <p className="text-xs text-ink-700"><span className="block text-[0.8125rem] font-semibold text-ink-900">{title}</span>{body}</p>
        </div>
    );
}

export function CheckList({ items, tone = 'gold' }: { items: string[]; tone?: 'gold' | 'green' }) {
    return (
        <ul className="space-y-2">
            {items.map((t) => (
                <li key={t} className="flex gap-2 text-[0.8125rem] text-ink-700">
                    <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', tone === 'gold' ? 'text-gold-600' : 'text-verified-500')} aria-hidden="true" />
                    {t}
                </li>
            ))}
        </ul>
    );
}

export function SecureCheckout() {
    return (
        <div className="mt-5 border-t border-parchment-300 pt-4">
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-900"><ShieldCheck className="size-4 text-gold-700" aria-hidden="true" /> Secure Checkout</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-600">
                <li>✓ Payments processed securely in ZAR</li>
                <li>✓ Invoice available on checkout</li>
                <li>✓ Protected by bank-grade security</li>
            </ul>
        </div>
    );
}
