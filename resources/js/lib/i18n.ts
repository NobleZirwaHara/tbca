import { useCallback, useSyncExternalStore } from 'react';
import { usePage } from '@inertiajs/react';
import type { LanguageOption, SharedProps } from '@/types';

/**
 * Site-wide translations.
 *
 * Dictionaries live in `lang/{locale}.json` (Laravel's JSON translation format,
 * keyed by the English source text), so the same files serve `__()` on the
 * server and `t()` here. English needs no file: the key is the English text.
 *
 *   const t = useT();
 *   t('Start a Sprint')                      -> "Commencer un Sprint"
 *   t('Plus :count country offices', { count: 12 })
 *
 * A key with no translation falls back to the English text, so content from the
 * PHP registers can be passed through t() before every string is translated.
 * Missing keys are collected per locale (see `missingKeys()`) for the machine
 * translation hook described in docs/INTEGRATIONS_PLAN.md.
 */

export type Messages = Record<string, string>;
export type Replacements = Record<string, string | number>;

const loaders = import.meta.glob<Messages>('../../../lang/*.json', { import: 'default' });

const catalogues: Record<string, Messages> = { en: {} };
const pending: Record<string, Promise<Messages> | undefined> = {};
const missing = new Map<string, Set<string>>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
    version += 1;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

const getVersion = () => version;

/** Loads (once) the dictionary for `locale`. Resolves to an empty dictionary when none exists. */
export function loadLocale(locale: string): Promise<Messages> {
    if (catalogues[locale]) return Promise.resolve(catalogues[locale]);

    const loader = loaders[`../../../lang/${locale}.json`];

    if (!loader) {
        catalogues[locale] = {};

        return Promise.resolve(catalogues[locale]);
    }

    pending[locale] ??= loader()
        .then((messages) => {
            catalogues[locale] = messages;
            notify();

            return messages;
        })
        .catch(() => {
            pending[locale] = undefined;

            return {};
        });

    return pending[locale];
}

export function isLocaleLoaded(locale: string): boolean {
    return Boolean(catalogues[locale]);
}

/** Laravel-style placeholder replacement (`:name`), longest names first. */
function replace(text: string, replacements?: Replacements): string {
    if (!replacements) return text;

    return Object.keys(replacements)
        .sort((a, b) => b.length - a.length)
        .reduce((out, name) => out.split(`:${name}`).join(String(replacements[name])), text);
}

export function translate(locale: string, key: string, replacements?: Replacements): string {
    if (!key) return key;

    const catalogue = catalogues[locale];
    let text = catalogue?.[key];

    if (text === undefined || text === '') {
        if (locale !== 'en' && catalogue) {
            if (!missing.has(locale)) missing.set(locale, new Set());
            missing.get(locale)!.add(key);
        }
        text = key;
    }

    return replace(text, replacements);
}

/** Keys requested on this page view that have no translation yet (for the machine-translation hook). */
export function missingKeys(locale: string): string[] {
    return [...(missing.get(locale) ?? [])];
}

if (typeof window !== 'undefined') {
    (window as unknown as { __tbcaMissingTranslations?: (locale: string) => string[] }).__tbcaMissingTranslations = missingKeys;
}

export type Translate = (key: string, replacements?: Replacements) => string;

/**
 * Current language, direction and translator. Re-renders when the dictionary
 * for the selected language finishes loading.
 */
export function useI18n() {
    const { context } = usePage<SharedProps>().props;
    const loaded = useSyncExternalStore(subscribe, getVersion, getVersion);
    const locale = context.language || 'en';
    const meta: LanguageOption | undefined = context.languages.find((l) => l.code === locale);

    if (!catalogues[locale]) void loadLocale(locale);

    // `loaded` is a dependency so translators refresh once a dictionary arrives.
    const t = useCallback<Translate>((key, replacements) => translate(locale, key, replacements), [locale, loaded]);

    return {
        t,
        locale,
        /** BCP 47 tag for Intl APIs and the lang attribute (e.g. zh-Hans). */
        tag: meta?.html ?? locale,
        dir: (meta?.dir ?? 'ltr') as 'ltr' | 'rtl',
        rtl: meta?.dir === 'rtl',
    };
}

export function useT(): Translate {
    return useI18n().t;
}

/** Country name in the visitor's language from an ISO 3166 alpha-2 code, falling back to `fallback`. */
export function countryName(iso2: string | null | undefined, tag: string, fallback: string): string {
    if (!iso2) return fallback;

    try {
        return new Intl.DisplayNames([tag, 'en'], { type: 'region' }).of(iso2.toUpperCase()) ?? fallback;
    } catch {
        return fallback;
    }
}

const ARABIC_FONT_ID = 'tbca-font-rtl';
const ARABIC_FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';

/**
 * Applies <html lang dir> for the selected language and loads the Arabic web
 * font the first time a right-to-left language is chosen. Inertia visits do not
 * re-render the Blade root, so this runs on every navigation and on a switch.
 */
export function applyDocumentLocale(language: LanguageOption | undefined) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.lang = language?.html ?? 'en';
    root.dir = language?.dir ?? 'ltr';

    if (language?.dir === 'rtl' && !document.getElementById(ARABIC_FONT_ID)) {
        const link = document.createElement('link');
        link.id = ARABIC_FONT_ID;
        link.rel = 'stylesheet';
        link.href = ARABIC_FONT_URL;
        document.head.appendChild(link);
    }
}
