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
    whatsapp_url: string;
}

export interface LanguageOption {
    code: string;
    label: string;
    native: string;
    html: string;
    dir: 'ltr' | 'rtl';
    status: 'live' | 'coming_soon' | string;
}

export interface CurrencyOption {
    code: string;
    display: string;
    symbol: string;
    label: string;
    fallback_rate: number;
    decimals: number;
    status: string;
}

/** Daily ZAR-based display FX (units of each currency per 1 ZAR). */
export interface FxSnapshot {
    base: 'ZAR' | string;
    rates: Record<string, number>;
    source: 'live' | 'fallback' | string;
    updated_at: string | null;
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

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    client_id: string | null;
    role: 'client' | 'admin' | 'partner';
    company: string | null;
    phone: string | null;
    country: string;
    client_type: string | null;
}

/* --- Shared commerce records (see app/Support/Platform) ------------------ */

export interface OrderItem {
    id: number;
    item_type: string;
    item_code: string;
    name: string;
    variant: string | null;
    quantity: number;
    unit_zar: number;
    line_zar: number;
    meta: Record<string, unknown> | null;
}

export interface Payment {
    id: number;
    reference: string;
    method: 'card' | 'eft' | 'wallet';
    status: 'pending' | 'succeeded' | 'failed';
    amount_zar: number;
    failure_reason: string | null;
    meta: Record<string, unknown> | null;
    created_at: string;
}

export interface Order {
    id: number;
    reference: string;
    section: string;
    status: 'awaiting_payment' | 'paid' | 'failed' | 'cancelled' | 'refunded';
    subtotal_zar: number;
    vat_zar: number;
    fees_zar: number;
    total_zar: number;
    billing: Record<string, string | null> | null;
    meta: Record<string, unknown> | null;
    paid_at: string | null;
    created_at: string;
    items?: OrderItem[];
    payments?: Payment[];
}

export interface Totals {
    subtotal: number;
    vat: number;
    platform: number;
    bank: number;
    fees: number;
    total: number;
}

export interface BasketItem {
    id: number;
    item_type: string;
    item_code: string;
    name: string;
    variant: string | null;
    quantity: number;
    unit_zar: number;
    commercial_act: string;
    meta: Record<string, unknown> | null;
}

export interface SprintPackage {
    key: string;
    name: string;
    zar: number;
    features?: string[];
    popular?: boolean;
    delivery?: string;
}

export interface SprintRecord {
    id: number;
    code: string;
    slug: string;
    title: string;
    type: string;
    category: string | null;
    subcategory: string | null;
    audience: string | null;
    summary: string | null;
    description: string | null;
    price_zar: number | null;
    delivery: string | null;
    commercial_act: 'purchase' | 'quote' | 'subscription' | 'retainer' | 'free';
    packages: SprintPackage[] | null;
    attributes: Record<string, unknown> | null;
    featured: boolean;
    popular: boolean;
    is_new: boolean;
    rating: number | null;
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
    auth: { user: AuthUser | null };
    basketCount: number;
    unreadNotifications: number;
    fx: FxSnapshot;
    flash: { message: string | null; success: string | null; error: string | null; reference: string | null };
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
