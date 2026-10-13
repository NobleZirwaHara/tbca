import { convertZar, formatIn, useCurrency } from '@/lib/money';
import { useT } from '@/lib/i18n';
import type { RaiseBand } from '@/types/deal-room';

/**
 * Compact money labels for value bands that are set in whole ZAR (for example
 * the Virtual Deal Room indicative raise bands). Amounts are converted with the
 * shared FX rates from lib/money.ts and shortened to k / m / bn, keeping each
 * currency's own symbol position: "R5m", "$275k", "€2.7m", "¥2m", "35m CFA".
 */

const UNITS: [number, string][] = [
    [1e9, 'bn'],
    [1e6, 'm'],
    [1e3, 'k'],
];

/** Rounds a mantissa to a tidy figure: 0.1 under 10, whole numbers under 100, steps of 5 above. */
function tidy(value: number): number {
    if (value < 10) return Math.round(value * 10) / 10;
    if (value < 100) return Math.round(value);

    return Math.round(value / 5) * 5;
}

/** The currency's prefix and suffix as lib/money.ts writes them ("$" + "", "" + " CFA"). */
function affixes(currency: string): [string, string] {
    const zero = formatIn(0, currency);
    const at = zero.indexOf('0');

    return at === -1 ? [`${currency} `, ''] : [zero.slice(0, at), zero.slice(at + 1)];
}

/** Compact amount in `currency` for a ZAR value, e.g. compactMoney(5_000_000, 'USD', rates) -> "$300k". */
export function compactMoney(zar: number, currency: string, rates?: Record<string, number> | null): string {
    const amount = convertZar(zar, currency, rates);
    const [prefix, suffix] = affixes(currency);

    for (const [size, unit] of UNITS) {
        if (Math.abs(amount) >= size) {
            let mantissa = tidy(amount / size);
            let label = unit;

            // 999.7k rounds to 1000k: carry into the next unit up.
            const next = UNITS[UNITS.findIndex(([s]) => s === size) - 1];
            if (mantissa >= 1000 && next) {
                mantissa = tidy(amount / next[0]);
                label = next[1];
            }

            return `${prefix}${String(mantissa)}${label}${suffix}`;
        }
    }

    return formatIn(amount, currency);
}

/** Label for a raise band in the visitor's display currency and language. */
export function useBandLabel() {
    const { currency, rates } = useCurrency();
    const t = useT();
    const money = (zar: number) => compactMoney(zar, currency, rates);

    return (band: Pick<RaiseBand, 'min' | 'max'>) => {
        if (band.max === null) return t('Over :amount', { amount: money(band.min) });
        if (band.min <= 0) return t('Under :amount', { amount: money(band.max) });

        return t(':from to :to', { from: money(band.min), to: money(band.max) });
    };
}
