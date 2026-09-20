export type LedgerKey = 'verified' | 'attested' | 'referenced' | 'controlled' | 'risk';
export type LedgerCode = 'V' | 'A' | 'R' | 'G';

export interface NavTab {
    label: string;
    href: string;
    purpose: string;
    cta: string;
    secondary_cta: string;
}

export interface NavChild {
    label: string;
    href: string;
    note: string;
}

export interface FooterLink {
    label: string;
    href: string;
}

export interface Brand {
    name: string;
    short: string;
    trademark: string;
    promise: string;
    doctrine: string;
}

export interface Contact {
    address_lines: string[];
    phone: string;
    email: string;
    whatsapp: string;
}

export interface LanguageOption {
    code: string;
    label: string;
    status: string;
}

export interface CurrencyOption {
    code: string;
    symbol: string;
    label: string;
    status: string;
}

export interface PlatformContext {
    country: string;
    language: string;
    currency: string;
    languages: LanguageOption[];
    currencies: CurrencyOption[];
}

export interface TrustBadge {
    label: string;
    class: LedgerCode;
    icon: string;
}

export interface SharedProps {
    brand: Brand;
    contact: Contact;
    nav: {
        primary: NavTab[];
        secondary: NavTab[];
        children: Record<string, NavChild[]>;
        footer: Record<string, FooterLink[]>;
    };
    context: PlatformContext;
    trustBadges: TrustBadge[];
    flash: { message: string | null };
    url: { path: string };
    [key: string]: unknown;
}

export interface Sprint {
    code: string;
    name: string;
    summary: string;
    zar: number;
    usd: number;
    turnaround: string;
    review: string;
    icon: string;
    category: string;
    outputs: string[];
}

export interface RoutePageCluster {
    title: string;
    body: string;
    items: string[];
}

export interface RoutePageData {
    title: string;
    lead: string;
    intro: string;
    aside?: { title: string; body: string; items: string[] };
    clusters?: RoutePageCluster[];
    users?: string[];
    boundary?: string;
    faq?: { q: string; a: string }[];
    cta?: {
        title: string;
        body: string;
        primary: { label: string; href: string };
        secondary: { label: string; href: string };
    };
}
