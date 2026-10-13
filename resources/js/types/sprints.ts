import type { SprintPackage, SprintRecord } from '@/types';

export type { SprintPackage, SprintRecord };

export interface CatalogueItem {
    id: number;
    code: string;
    slug: string;
    title: string;
    type: string;
    category: string | null;
    category_label: string | null;
    summary: string | null;
    price_zar: number | null;
    price_display: 'from' | 'selection' | 'quote' | 'free' | 'packages' | null;
    delivery: string | null;
    commercial_act: SprintRecord['commercial_act'];
    rating: number | null;
    reviews: number;
    badge: string | null;
    icon: string;
    ideal_for: string[];
    packages: string[];
    why: string[];
    featured: boolean;
    popular: boolean;
    is_new: boolean;
    audience: string[];
    match: boolean;
    recurring: string | null;
    image_url: string | null;
}

export interface FacetOption {
    value: string;
    label: string;
    count: number;
}

export interface Facets {
    categories: FacetOption[];
    audiences: FacetOption[];
    types: FacetOption[];
    prices: FacetOption[];
    delivery: FacetOption[];
    acts: FacetOption[];
    needs: FacetOption[];
    ratings: FacetOption[];
}

export interface CatalogueFilters {
    q: string | null;
    type: string | null;
    category: string | null;
    audience: string | null;
    price: string | null;
    delivery: string | null;
    need: string | null;
    act: string | null;
    rating: string | null;
    letter: string | null;
    sort: string | null;
    page: string | null;
    flag: string | null;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface Badge {
    label: string;
    icon: string;
}

export interface CatalogueView {
    key: string;
    kind: 'all' | 'curated' | 'category';
    category: string | null;
    icon: string | null;
    title: string;
    description: string;
    search: string;
    badges: Badge[];
    quick: { label: string; href: string }[];
    quickLabel?: string;
    crumbs: { label: string; href?: string }[];
    spotlight: { label: string; why: string } | null;
    path: string;
    lockedFilters: string[];
    personalised?: boolean;
}

export interface CategoryChip {
    slug: string;
    label: string;
    icon: string;
}

export interface Pricing {
    vat_rate: number;
    platform_fee: number;
    bank_rate: number;
}

export interface SprintAddon {
    key: string;
    name: string;
    zar: number;
    body?: string;
    icon?: string;
    tag?: string;
}

/** Shape of `sprint.attributes` used by the generic sprint template. Every key is optional. */
export interface GenericAttributes {
    icon?: string;
    badge?: string;
    reviews?: number;
    ideal_for?: string[];
    format?: string;
    why?: string[];
    outcomes?: string[];
    included_intro?: string;
    included?: { title: string; icon?: string }[];
    checklist?: string[];
    scope?: { title: string; items: string[] }[];
    final_deliverables?: string[];
    deliverables?: { title: string; body?: string; icon?: string }[];
    delivery_pack?: string[];
    deliverable_groups?: { title: string; icon?: string; items: string[] }[];
    delivery_standards?: { title: string; body?: string; icon?: string }[];
    comparison?: { label: string; values: string[] }[];
    timeline?: { title: string; body: string; duration?: string }[];
    process?: { title: string; icon?: string; items: string[]; output?: string }[];
    inputs_intro?: string;
    inputs?: { title: string; icon?: string; items: string[] }[];
    addons_intro?: string;
    addons?: SprintAddon[];
    risks?: { risk: string; impact: string; mitigation: string }[];
    qa?: { title: string; body: string; icon?: string }[];
    faqs?: { group?: string; q: string; a: string }[];
    reviews_data?: {
        average: number;
        count: number;
        distribution: Record<string, number>;
        highlights?: string[];
        items: { name: string; role: string; segment?: string; package?: string; rating: number; title?: string; body: string; date?: string }[];
    };
    package_guidance?: Record<string, string>;
    why_tbca?: { title: string; icon?: string }[];
    why_tbca_title?: string;
    billing_period?: string;
    price_display?: string;
}

export interface SprintMeta {
    category_label: string | null;
    category_href: string;
    type_label: string;
    audiences: string[];
    packages: (SprintPackage & { description?: string })[];
}

export interface AudienceConfig {
    label: string;
    short: string;
    icon: string;
    title: string;
    description: string;
    needs: string[];
    focusLabel: string;
    focus: string[];
    popular: string[];
    support: { title: string; body: string; icon: string; href: string }[];
}
