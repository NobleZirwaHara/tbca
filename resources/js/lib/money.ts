import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';

/** Mirrors config('tbca.commerce.zar_per_usd'). Stored amounts are always whole ZAR. */
export const ZAR_PER_USD = 18;

export function formatZar(zar: number): string {
    return `R${Math.round(zar).toLocaleString('en-ZA').replace(/,/g, ' ')}`;
}

export function formatMoney(zar: number, currency: string): string {
    if (currency === 'USD') {
        return `$${Math.round(zar / ZAR_PER_USD).toLocaleString('en-US')}`;
    }

    return formatZar(zar);
}

/**
 * Formats a ZAR amount in the visitor's selected display currency.
 *   const price = usePrice();  price(14800) -> "R14 800" or "$822"
 */
export function usePrice() {
    const { context } = usePage<SharedProps>().props;

    return (zar: number) => formatMoney(zar, context.currency);
}
