/* AIIM — Africa Investment Intelligence Map: shared frontend types. */

export interface AiimSelection {
    country: string;
    province: string | null;
    provinceSlug: string | null;
    sector: string | null;
    sectorSlug: string | null;
    item: string | null;
    context: string | null;
}

export interface AiimSnapshot {
    saved: number;
    watchlist: number;
    comparisons: number;
    reports: number;
    entitlements: number;
    mandates: number;
    wallet: number;
}

/** Props every AIIM page receives from App\Http\Controllers\Aiim\AiimController::render(). */
export interface AiimPageProps {
    selection: AiimSelection;
    snapshot: AiimSnapshot | null;
    [key: string]: unknown;
}

export interface Evidence {
    confidence: number;
    grade: string;
    gradeLabel: string;
    tone: 'good' | 'warn' | 'bad';
    verification: string;
    source: string | null;
    updated: string | null;
    nextReview: string | null;
    sellable: boolean;
}

export interface ProjectItem {
    code: string;
    slug: string;
    name: string;
    kind: string;
    summary: string | null;
    province: string;
    provinceName: string;
    sector: string;
    sectorName: string;
    location: string | null;
    type: string;
    stage: string;
    size: string;
    sizeBand: string;
    sizeMax: number;
    score: number;
    level: string;
    icon: string;
    added: string | null;
    tags: string[];
    evidence: Evidence;
    hasPremium: boolean;
    /** Country of the record (South Africa for the province pack). */
    country?: { iso2: string; slug: string; name: string };
    /** Screening metrics for TBCA investor project briefs (amounts in ZAR). */
    screening?: import('@/Components/Aiim/Explorer/types').ScreenedProject | null;
    details?: ProjectDetails;
    premium?: PremiumObject | null;
    sourceCode?: string | null;
}

export interface ProjectDetails {
    tags?: string[];
    subsector?: string;
    sponsor?: string;
    metrics?: Record<string, string>;
    description?: string;
    projectDescription?: string;
    highlights?: string[];
    projectHighlights?: string[];
    funds?: [string, number][];
    projectFunds?: [string, number][];
    market?: [string, string][];
    risks?: [string, string][];
    esg?: string[];
    stakeholders?: [string, string][];
    documents?: [string, string][];
    compare?: Record<string, string | number>;
    source?: string;
}

export interface PremiumObject {
    title: string;
    product_type: string;
    views: number;
    duration_days: number;
    preview: string[];
    locked: string[];
    model?: Record<string, string>;
}

export interface OrgItem {
    slug: string;
    kind: 'investor' | 'funder';
    name: string;
    shortName: string;
    type: string;
    summary: string | null;
    focus: string[];
    stages: string[];
    instruments: string[];
    beneficiaries: string | null;
    ticket: string;
    ticketMin: number;
    location: string | null;
    origin: string;
    score: number;
    added: string | null;
    evidence: Evidence;
    profile?: Record<string, any>;
}

export interface CorridorItem {
    slug: string;
    name: string;
    type: string;
    countries: string;
    route: string;
    agreement: string;
    modes: string[];
    score: number;
    volume: string;
    sectors: string | null;
    region: string | null;
    infrastructure: string | null;
    added: string | null;
    evidence: Evidence;
    profile?: Record<string, any>;
}

export interface SourceItem {
    code: string;
    name: string;
    provider: string;
    category: string;
    dataType: string | null;
    coverage: string | null;
    tier: number;
    tierName: string;
    model: string;
    confidence: number;
    grade: { grade: string; label: string; tone: string };
    verification: string;
    status: string;
    updated: string | null;
    nextReview: string | null;
    profile?: Record<string, any>;
}

export interface BriefItem {
    sku: string;
    title: string;
    category: string;
    format: string;
    size: string | null;
    published: string | null;
    price: number;
    enterpriseFrom: number | null;
    badge: string | null;
    summary: string | null;
    image: string;
    profile?: Record<string, any>;
}

/** Compact polymorphic card (saved items, compare, fee discovery). */
export interface Card {
    type: string;
    key: string;
    name: string;
    summary: string | null;
    icon: string;
    location: string | null;
    sector: string | null;
    province: string | null;
    metricLabel: string;
    metric: string;
    stageLabel: string;
    stage: string | null;
    score: number | null;
    url: string;
    confidence: number;
    typeLabel?: string;
    id?: number;
    savedOn?: string;
    alerts?: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface FeeLine {
    code: string;
    label: string;
    amount: number;
    description?: string;
    basis?: string;
    notes?: string;
    unit?: number;
    quantity?: number;
}

export interface Totals {
    lines: FeeLine[];
    subtotal: number;
    vat: number;
    total: number;
}

export interface MetricCell {
    display: string;
    value: number | null;
    label?: string | null;
}

export interface ComparisonData {
    columns: { card: Card; metrics: Record<string, MetricCell>; overall: number; label: string }[];
    best: Record<string, number[]>;
    rows: { key: string; label: string; better: string | null }[];
    insights: { icon: string; name: string; text: string }[];
}

export interface Advisor {
    slug: string;
    name: string;
    title: string;
    years: number;
    strengths: string[];
    email?: string;
    phone?: string;
}

export interface EngagementQuote {
    lines: FeeLine[];
    subtotal: number;
    vat: number;
    total: number;
    items: { item: string; description: string; deliverables: string; amount: number }[];
    deposit_percent: number;
    deposit_ex_vat: number;
    deposit_vat: number;
    deposit_total: number;
    number?: string;
    issued?: string;
    valid_until?: string;
    duration?: string;
    engagement_type?: string;
}

export interface Engagement {
    reference: string;
    mandate: string | null;
    type: 'custom-intelligence' | 'advisory';
    title: string;
    status: string;
    statusLabel: string;
    stage: string | null;
    progress: number;
    journey: string[];
    journeyIndex: number;
    next: { label: string; url: string } | null;
    created: string;
    start: string | null;
    end: string | null;
    originalEnd: string | null;
    fee: number;
    feeTotal: number;
    deposit: number;
    depositPaid: boolean;
    balancePaid: boolean;
    advisor: Advisor | null;
    client: { name: string; company: string | null; email: string; phone: string | null };
    request?: Record<string, any>;
    sectorNames?: string[];
    provinceNames?: string[];
    countryNames?: string[];
    booking?: string | null;
    discoveryAt?: string | null;
    outcome?: Record<string, any> | null;
    quote?: EngagementQuote | null;
    quoteAcceptedAt?: string | null;
    letterAcceptedAt?: string | null;
    signature?: { name: string; title: string; at: string; hash: string } | null;
    workplan?: { key: string; label: string; status: string; date: string }[];
    deliverables?: { name: string; format: string; size: string | null; status: string }[];
    events?: { actor: string; action: string; note: string | null; at: string }[];
    depositOrder?: string | null;
}

/* --- Country register (54 countries) ------------------------------------- */

export interface CountryOption {
    slug: string;
    name: string;
    iso2: string;
    region: 'north' | 'west' | 'central' | 'east' | 'southern';
    regionName: string;
    flag: string;
}

export interface CountryIndicator {
    label: string;
    value: number | null;
    unit: string;
    year: number | null;
    source: string;
    /** "placeholder" until replaced by an API feed / client Test Data. */
    status: 'placeholder' | 'permanent' | 'live' | 'sourced';
}

export interface CountryProfile extends CountryOption {
    iso3: string;
    capital: string;
    currencyCode: string;
    currencyName: string;
    areaKm2: number;
    indicators: Record<string, CountryIndicator>;
    subregions: string[];
    hasProvincePack: boolean;
    /** Roll-out wave and country pack status (Deep Registers 2.1, Country_Activation). */
    activation: { auRegion: string | null; wave: string | null; packStatus: string | null; packCode: string | null };
}
