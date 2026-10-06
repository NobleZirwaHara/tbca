import { router, usePage } from '@inertiajs/react';
import type { CatalogueFilters, CatalogueItem, Pricing, SprintAddon } from '@/types/sprints';
import type { SprintPackage } from '@/types';

/** Build a query object from the current filters with one key changed (page always resets). */
export function withFilter(filters: Partial<CatalogueFilters>, key: keyof CatalogueFilters, value: string | null): Record<string, string> {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...filters, [key]: value, page: key === 'page' ? value : null })) {
        if (v !== null && v !== undefined && v !== '') next[k] = String(v);
    }
    return next;
}

/** Navigate the catalogue with server-side filtering. */
export function visitCatalogue(path: string, query: Record<string, string>) {
    router.get(path, query, { preserveScroll: true, preserveState: true, replace: true });
}

/** Toggle one value inside a comma-separated multi-value filter. */
export function toggleValue(current: string | null, value: string): string | null {
    const list = (current ?? '').split(',').filter(Boolean);
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return next.length ? next.join(',') : null;
}

export function hasValue(current: string | null, value: string): boolean {
    return (current ?? '').split(',').includes(value);
}

export function priceText(item: Pick<CatalogueItem, 'price_zar' | 'price_display' | 'commercial_act' | 'recurring'>, price: (zar: number) => string): { label: string; value: string } {
    if (item.commercial_act === 'free' || item.price_display === 'free') return { label: '', value: 'Free' };
    if (item.commercial_act === 'quote' || item.price_zar === null) return { label: 'Price', value: 'On request' };
    if (item.price_display === 'selection') return { label: 'Price on', value: 'selection' };
    if (item.price_display === 'packages') return { label: '', value: 'View Packages' };
    const suffix = item.recurring ? ` /${item.recurring}` : '';
    return { label: 'From', value: price(item.price_zar) + suffix };
}

export interface Totals {
    packageZar: number;
    addonsZar: number;
    subtotal: number;
    vat: number;
    bank: number;
    platform: number;
    total: number;
}

/** Mirrors App\Support\Platform\Money::totals() for the card method (used for the live order summary). */
export function computeTotals(pkg: SprintPackage | null | undefined, addons: SprintAddon[], pricing: Pricing): Totals {
    const packageZar = pkg?.zar ?? 0;
    const addonsZar = addons.reduce((sum, a) => sum + a.zar, 0);
    const subtotal = packageZar + addonsZar;
    const vat = Math.round(subtotal * pricing.vat_rate);
    const platform = subtotal > 0 ? pricing.platform_fee : 0;
    const bank = Math.round(subtotal * pricing.bank_rate);
    return { packageZar, addonsZar, subtotal, vat, bank, platform, total: subtotal + vat + platform + bank };
}

export const RECURRING_LABEL: Record<string, string> = { month: 'per month', year: 'per year', quarter: 'per quarter' };

const tabSlug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Index of the tab a /sprints/{slug}/{tab} URL asks for, matched against a template's own
 * tab labels ("inputs-required" -> "Inputs Required" or "Requirements"). 0 when nothing matches.
 */
export function urlTabIndex(labels: string[], urlTab: string | null | undefined): number {
    if (!urlTab || urlTab === 'overview') return 0;
    const slugs = labels.map(tabSlug);
    const exact = slugs.indexOf(urlTab);
    if (exact >= 0) return exact;
    const stem = urlTab.replace(/^whats-/, '').split('-')[0].slice(0, 5);
    const fuzzy = slugs.findIndex((s) => s.includes(stem) || (stem === 'input' && s.includes('requir')));
    return fuzzy >= 0 ? fuzzy : 0;
}

/** The {tab} segment of the current sprint URL (Sprints/Show prop), if any. */
export function useUrlTab(): string | null {
    const props = usePage().props as { tab?: unknown };
    return typeof props.tab === 'string' ? props.tab : null;
}
