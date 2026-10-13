import { displayCurrency, displayMoney } from '@/lib/money';

/** Rand with cents, e.g. R 2,850.00 — used on fee manifests, quotes and ledgers. */
export function zar2(n: number | string | null | undefined): string {
    const v = Number(n ?? 0);
    return `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ')}`;
}

/** Whole rand, e.g. R 103 500. */
export function zar(n: number | string | null | undefined): string {
    if (displayCurrency() !== 'ZAR') return displayMoney(Number(n ?? 0));
    return `R ${Math.round(Number(n ?? 0)).toLocaleString('en-ZA').replace(/ /g, ' ')}`;
}

export const labelise = (s: string) => s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
