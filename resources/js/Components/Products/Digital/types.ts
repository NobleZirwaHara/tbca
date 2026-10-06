/* Digital Products family types (props shaped by App\Support\Products\Digital\Presenter). */

export interface DpProductCard {
    slug: string;
    sku: string;
    name: string;
    type: string;
    typeLabel: string;
    tagline: string;
    version: string;
    versionLabel: string;
    languages: string[];
    format: string;
    formats: string[];
    fromPrice: number;
    licences: string[];
    audience: string;
    jurisdiction: string;
    /** Jurisdiction names ("Pan-African" or countries). */
    jurisdictions: string[];
    /** Currencies the product is offered in (ZAR, USD, XOF, EUR, RMB). */
    currencies: string[];
    verifiedAt: string | null;
    maintenance: string;
    updates: string;
    support: string;
    dss: number | null;
    tone: string;
    purchasable: boolean;
}

export interface DpVersion {
    id: number;
    version: string;
    label: string;
    display: string;
    status: string;
    updateType: string | null;
    releasedAt: string | null;
    verifiedAt: string | null;
    maintenanceUntil: string | null;
    summary: string | null;
    whatsNew: string[];
    impact: string[];
    size: string | null;
    worksWith: string | null;
    replaces: string | null;
}

export interface DpOption {
    code: string;
    label: string;
    note: string;
    state?: string;
}

export interface DpDTest {
    code: string;
    title: string;
    description: string;
    status: string;
    evidence: Record<string, string>;
}

export interface DpDefensibility {
    tests: DpDTest[];
    substitute: { name: string; score: number; ours: number };
    detail: Record<string, string>;
    gate: string;
    decision: string;
    decided_at: string;
    decided_by: string;
    assessed_at: string;
    assessed_by: string;
    notes?: string | null;
}

export interface DpProductDetail extends DpProductCard {
    code: string;
    description: string;
    bestFor: string;
    category: string;
    badges: string[];
    receive: string[];
    compare: string[][];
    content: { how_to_use?: string[]; does_not_do?: string[]; related_sprint?: { title: string; slug: string; price: number } };
    languageOptions: DpOption[];
    formatOptions: DpOption[];
    prices: Record<string, number | null>;
    currentVersion: DpVersion | null;
    versions: DpVersion[];
    nextReview: string | null;
    reviewCycle: string;
    maintenanceClass: string;
    updateClass: string;
    updateMonths: number;
    risk: string;
    dssBand: string | null;
    state: string;
    defensibility: DpDefensibility | null;
}

export interface DpLicence {
    code: string;
    name: string;
    short: string;
    icon: string;
    summary: string;
    allowed: string[];
    not_allowed: string[];
    permitted_use: string;
    review?: string;
    price?: number | null;
    permitted?: boolean;
    listPrice?: number;
}

export interface DpEntitlement {
    reference: string;
    status: string;
    product: { slug: string; name: string; sku: string; type: string; tone: string; tagline: string; support: string; code: string };
    version: DpVersion | null;
    currentVersion: DpVersion | null;
    updateAvailable: boolean;
    licence: string;
    licenceLabel: string;
    language: string;
    languageLabel: string;
    format: string;
    jurisdiction: string;
    orderReference: string | null;
    purchasedAt: string | null;
    pricePaid: number;
    lastDownload: string | null;
    downloads: number;
    size: string | null;
    maintenanceStatus: string;
    maintenancePlan: string | null;
    maintenanceUntil: string | null;
    updateUntil: string | null;
    accessExpires: string | null;
    autoRenew: boolean;
    termsVersion: string;
    authorisedEntity: string | null;
    credit: number;
    creditApplied: number;
    activatedAt: string | null;
    updatesIncluded: string;
}

export interface DpPurchaseSummary {
    licence: string;
    licenceLabel: string;
    use: string | null;
    price: number;
    version: string;
    format: string;
    language: string;
    jurisdiction: string;
    verifiedAt: string | null;
    maintenance: string;
    updates: string;
    support: string;
}

export interface DpFacet {
    key: string;
    label: string;
    count: number;
    /** Optional group heading (jurisdictions: AU region). */
    group?: string;
}

export interface DpPagination {
    page: number;
    perPage: number;
    total: number;
    pages: number;
}

export interface DpOrder {
    reference: string;
    status: string;
    subtotal: number;
    vat: number;
    fees: number;
    total: number;
    createdAt: string;
    paidAt: string | null;
    items: { name: string; variant: string | null; unit: number }[];
    entitlements: DpEntitlement[];
    checkoutUrl: string;
}
