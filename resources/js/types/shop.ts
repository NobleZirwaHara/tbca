/* Online Shop types (see app/Support/Shop). */

export type ActCode = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7';

export interface Option {
    value: string;
    label: string;
}

export interface CountOption extends Option {
    count: number;
}

export interface ShopCard {
    slug: string;
    code: string;
    name: string;
    act: ActCode;
    act_label: string;
    tagline: string | null;
    icon: string;
    price_zar: number | null;
    indicative_zar: number | null;
    price_unit: string | null;
    price_state: string;
    delivery: string | null;
    output_format: string | null;
    listing_state: string | null;
    purchasable: boolean;
    configurable: boolean;
    url: string;
    rating: number | null;
    vehicle: string;
    languages?: string[];
}

export interface Tier {
    key: string;
    name: string;
    sub?: string;
    badge?: string;
    popular?: boolean;
    zar: number;
    fit?: string;
    features?: string[];
    support?: string;
}

export interface Licence {
    key: string;
    name: string;
    zar: number;
    body?: string;
    icon?: string;
    includes?: string[];
}

export interface Plan {
    key: string;
    name: string;
    zar: number;
    licence?: string;
    includes?: string[];
}

export interface Commitment {
    key: string;
    name: string;
    hours: number;
    zar: number;
    popular?: boolean;
}

export interface ProductVariants {
    tiers?: Tier[];
    matrix?: (string | boolean)[][];
    addons?: { key: string; name: string; zar: number }[];
    sizes?: string[];
    industries?: string[];
    modes?: string[];
    licences?: Licence[];
    plans?: Plan[];
    commitments?: Commitment[];
    skus?: Record<string, string | number>[];
}

export interface RelatedOffer extends ShopCard {
    relationship: string;
    fit_reason: string | null;
    disposition: string;
    cta: string;
}

export interface ProductContent {
    short?: string;
    key_benefit?: string;
    achieve?: string[];
    benefits?: string[];
    best_for_list?: string[];
    deliverables?: [string, string][];
    glance?: [string, string][];
    why?: [string, string, string][];
    why_intro?: string;
    why_trust?: string;
    related_title?: string;
    related_intro?: string;
    delivery_overview?: string[];
    process?: [string, string, string][];
    delivery_access?: [string, string][];
    support_inclusions?: [string, string][];
    inputs?: string[];
    quality?: string[];
    how_it_works?: [string, string][];
    requirements?: string[];
    support_list?: string[];
    commitment_tiers?: [string, string][];
    faqs?: { q: string; a: string }[];
    price_note?: string;
    chips?: string[];
    estimated_start?: string;
    estimated_completion?: string;
    licence?: string;
    format?: string;
    validity_days?: number;
    entitlement_name?: string;
    entitlement_body?: string;
    [key: string]: unknown;
}

export interface ProductDetail extends ShopCard {
    sprint_code: string | null;
    summary: string | null;
    vehicle_code: string;
    aisle: string | null;
    aisle_name: string | null;
    subcategory: string | null;
    floor_zar: number | null;
    best_for: string | null;
    reviews_count: number;
    version: string;
    mode: string;
    listing_state_label: string | null;
    statement: string | null;
    gate: { outcome: string; hard: string[]; soft: string[] };
    certified: boolean;
    content: ProductContent;
    variants: ProductVariants;
    related: RelatedOffer[];
}

export interface SearchResult {
    key: string;
    source: 'shop' | 'sprint';
    code: string;
    sprint_code: string | null;
    slug: string;
    name: string;
    summary: string | null;
    act: ActCode;
    act_label: string;
    delivery: string | null;
    delivery_band: string | null;
    price_zar: number | null;
    price_unit: string | null;
    price_state: string;
    available: boolean;
    listing_state: string | null;
    url: string;
    icon: string;
    image_url?: string | null;
    aisle: string | null;
    subcategory: string | null;
    subcategory_name: string;
    output_format: string | null;
    source_records: number;
    aliases: string[];
    key_benefit: string | null;
    featured: boolean;
    rating: number | null;
}

export interface Aisle {
    slug: string;
    name: string;
    description: string;
    icon: string;
    products: number;
    buyers: string[];
    acts: string[];
    listed?: number;
}

export interface Subcategory {
    slug: string;
    name: string;
    description: string;
    icon: string;
    sprints: number;
    from_zar: number | null;
    acts: string[];
    listed?: number;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}
