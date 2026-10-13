import { convertZar, formatIn, useCurrency } from '@/lib/money';

/** Compact amount in a currency, e.g. "R3.7bn", "$207.7m", "€5.2m". */
export function compactIn(amount: number, currency: string): string {
    const shell = formatIn(0, currency);
    const at = shell.indexOf('0');
    const [prefix, suffix] = at >= 0 ? [shell.slice(0, at), shell.slice(at + 1)] : [`${currency} `, ''];
    const abs = Math.abs(amount);
    const [value, unit] = abs >= 1e9 ? [abs / 1e9, 'bn'] : abs >= 1e6 ? [abs / 1e6, 'm'] : abs >= 1e3 ? [abs / 1e3, 'k'] : [abs, ''];
    const digits = value >= 100 ? 0 : 1;
    const text = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits });
    return `${amount < 0 ? '-' : ''}${prefix}${text}${unit}${suffix}`;
}

/**
 * Compact formatter for ZAR-stored amounts in the visitor's display currency,
 * using the site FX snapshot (same conversion as usePrice).
 */
export function useCompactPrice() {
    const { currency, rates } = useCurrency();
    return (zar: number | null | undefined, empty = 'Not stated') =>
        zar === null || zar === undefined ? empty : compactIn(convertZar(Number(zar), currency, rates), currency);
}
