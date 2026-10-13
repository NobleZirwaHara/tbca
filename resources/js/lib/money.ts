import { usePage } from '@inertiajs/react';
import type { CurrencyOption, FxSnapshot, SharedProps } from '@/types';

/**
 * Stored and charged amounts are always whole ZAR. Other currencies (USD, XOF,
 * EUR, CNY/RMB) are display conversions using the daily FX snapshot shared by
 * HandleInertiaRequests (`fx`), falling back to these approximate rates.
 */
export const FALLBACK_RATES: Record<string, number> = {
    ZAR: 1,
    USD: 0.06,
    XOF: 35.1,
    EUR: 0.0536,
    CNY: 0.4035,
};

/** Legacy constant kept for callers that still need a fixed USD rate. */
export const ZAR_PER_USD = 18;

const SYMBOLS: Record<string, { prefix: string; suffix?: string; locale: string }> = {
    ZAR: { prefix: 'R', locale: 'en-ZA' },
    USD: { prefix: '$', locale: 'en-US' },
    XOF: { prefix: '', suffix: ' CFA', locale: 'fr-FR' },
    EUR: { prefix: '€', locale: 'en-IE' },
    CNY: { prefix: '¥', locale: 'zh-CN' },
};

function group(value: number, locale: string): string {
    const text = Math.round(value).toLocaleString(locale);

    // House style: thin-space grouping for Rand and CFA ("R14 800", "493 000 CFA").
    return locale === 'en-ZA' || locale === 'fr-FR' ? text.replace(/[,  .]/g, ' ') : text;
}

export function formatZar(zar: number): string {
    return `R${group(zar, 'en-ZA')}`;
}

export function convertZar(zar: number, currency: string, rates?: Record<string, number> | null): number {
    const code = currency.toUpperCase();
    const rate = rates?.[code] ?? FALLBACK_RATES[code] ?? 1;

    return zar * rate;
}

/** Formats an amount already expressed in `currency`. */
export function formatIn(amount: number, currency: string): string {
    const code = currency.toUpperCase();
    const meta = SYMBOLS[code];

    if (!meta) return `${code} ${group(amount, 'en-US')}`;

    return `${amount < 0 ? '-' : ''}${meta.prefix}${group(Math.abs(amount), meta.locale)}${meta.suffix ?? ''}`;
}

/** Formats a ZAR amount in `currency`, converting with the given (or fallback) rates. */
export function formatMoney(zar: number, currency: string, rates?: Record<string, number> | null): string {
    if (currency.toUpperCase() === 'ZAR') return formatZar(zar);

    return formatIn(convertZar(zar, currency, rates), currency);
}

/* ------------------------------------------------------------------
 * Display currency store
 *
 * Many module-level helpers (rand(), zar(), money()) format amounts outside
 * React hooks. They read the visitor's display currency from this store, which
 * <DisplayCurrency> updates from the shared Inertia props on every render, before
 * any page content renders. Staff consoles are pinned to ZAR because that is
 * the currency TBCA books and reports in.
 * ------------------------------------------------------------------ */

type DisplayState = { currency: string; rates: Record<string, number> | null };

const display: DisplayState = { currency: 'ZAR', rates: null };

/** Paths where amounts must stay in rand: staff consoles book and report in ZAR. */
const ZAR_ONLY = /^\/admin(\/|$)/;

export function pinnedToZar(path: string): boolean {
    return ZAR_ONLY.test(path);
}

export function setDisplayCurrency(currency: string, rates?: Record<string, number> | null): void {
    display.currency = (currency || 'ZAR').toUpperCase();
    display.rates = rates ?? null;
}

export function displayCurrency(): string {
    return display.currency;
}

export function displayRates(): Record<string, number> | null {
    return display.rates;
}

/** Formats a ZAR amount in the current display currency (non-hook helpers). */
export function displayMoney(zar: number): string {
    return formatMoney(zar, display.currency, display.rates);
}

/** Converts a ZAR amount into the current display currency without formatting. */
export function displayAmount(zar: number): number {
    return convertZar(zar, display.currency, display.rates);
}

/**
 * The reference amount shown beside a price: USD when the visitor sees rand,
 * otherwise the rand amount TBCA actually charges.
 */
export function referenceMoney(zar: number): string {
    return display.currency === 'ZAR' ? formatMoney(zar, 'USD', display.rates) : formatZar(zar);
}

/**
 * Formats a ZAR amount in the visitor's selected display currency.
 *   const price = usePrice();  price(14800) -> "R14 800", "$822", "€755", "¥5 920", "494 320 CFA"
 */
export function usePrice(empty = 'Custom') {
    const { props, url } = usePage<SharedProps>();
    const currency = pinnedToZar(url.split('?')[0]) ? 'ZAR' : props.context.currency;

    return (zar: number | null | undefined) =>
        zar === null || zar === undefined ? empty : formatMoney(Number(zar), currency, props.fx?.rates);
}

/**
 * Everything a checkout summary needs: the selected currency, a formatter and
 * whether the visitor is seeing a converted (non-ZAR) figure.
 */
export function useCurrency() {
    const { props, url } = usePage<SharedProps>();
    const { context, fx } = props;
    const currency = pinnedToZar(url.split('?')[0]) ? 'ZAR' : context.currency.toUpperCase();
    const option: CurrencyOption | undefined = context.currencies.find((c) => c.code === currency);

    return {
        currency,
        display: option?.display ?? currency,
        isConverted: currency !== 'ZAR',
        rates: fx?.rates ?? FALLBACK_RATES,
        live: fx?.source === 'live',
        format: (zar: number) => formatMoney(zar, currency, fx?.rates),
        zar: formatZar,
    };
}
