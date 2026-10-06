/* Types for the Core pages and customer journeys (CorePages section). */

/** Mirrors App\Support\Platform\Offices. */
export interface Office {
    slug: string;
    kind: 'head' | 'country';
    country: string;
    iso2: string;
    city: string;
    address: string;
    phone: string | null;
    map_embed: string;
    map_link: string;
}

/** Mirrors App\Support\Platform\Directory (role mailboxes, proposed — not yet active). */
export interface RoleMailbox {
    hc_code: string;
    position: string;
    email: string;
    additional_seat: boolean;
    client_facing: boolean;
    topic: string | null;
    status: string;
}

export interface Webinar {
    slug: string;
    category: string;
    tag: string;
    title: string;
    speaker: string;
    date: string;
    duration: string;
    topic: string;
    icon: string;
}

export interface KpInsight {
    slug: string;
    tag: string;
    format: string;
    featured: boolean;
    topic: string;
    icon: string;
    title: string;
    body: string;
}

export interface DiagnosticPack {
    code: string;
    title: string;
    icon: string;
    zar: number;
    from?: boolean;
    custom?: boolean;
    categories: string[];
    body: string;
    features: string[];
}

/* --- Discovery call ------------------------------------------------------ */

export interface Purpose {
    key: string;
    title: string;
    icon: string;
    body: string;
}

export interface Manager {
    name: string;
    title: string;
    email: string;
    phone: string;
    initials: string;
}

export interface TimezoneOption {
    key: string;
    label: string;
    offset: number;
}

export interface UploadedFile {
    name: string;
    size: number;
    path: string;
}

export interface DiscoveryShared {
    purposes: Purpose[];
    engagements: string[];
    timezones: TimezoneOption[];
    slots: { morning: string[]; afternoon: string[] };
    manager: Manager;
}

export interface Meeting {
    reference: string;
    type: string;
    title: string;
    subtitle: string;
    purpose: string;
    topic: string | null;
    engagement: string;
    notes: string | null;
    files: UploadedFile[];
    manager: Manager;
    date: string;
    date_label: string;
    weekday: string;
    time: string;
    timezone: string;
    channel: string;
    format: string;
    status: string;
    outcome: string | null;
    summary: string | null;
    is_past: boolean;
    can_change: boolean;
    meeting_link: string | null;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    contact_method: string;
    is_new: boolean;
}

/* --- Health score -------------------------------------------------------- */

export interface HealthQuestion {
    key: string;
    label: string;
    type: 'select' | 'text' | 'amount';
    required: boolean;
    options?: string[];
}

export interface HealthSection {
    title: string;
    intro: string;
    about: string;
    bullets: string[];
    next: string;
    questions: HealthQuestion[];
}

export interface HealthStep {
    key: string;
    label: string;
    crumb: string;
}

export interface SprintRecommendation {
    name: string;
    slug: string;
    href: string;
    body: string;
    chips: string[];
}

export interface HealthResult {
    dimensions: Record<string, number>;
    overall: number;
    band: { min: number; key: string; title: string; body: string };
    gaps: { title: string; dimension: string; section: string }[];
    actions: string[];
    recommendation: SprintRecommendation;
    also: SprintRecommendation[];
}

/* --- Tools --------------------------------------------------------------- */

export interface ToolProduct {
    slug: string;
    type: string;
    title: string;
    body: string;
    audience: string;
    need: string;
    languages: string[];
    formats: string[];
    zar: number;
    human_reviewed: boolean;
    version: string;
    size_kb: number;
    recommended: boolean;
    calculator: string | null;
    industry: string;
    instant: boolean;
}

export interface CalcInput {
    key: string;
    label: string;
    default: number;
    step: number;
}

export interface CalcSummary {
    label: string;
    value: number | string;
    format: 'money' | 'percent' | 'number' | 'ratio' | 'text';
}

export interface CalcResult {
    summary: CalcSummary[];
    table?: { columns: string[]; rows: (string | number)[][] };
    chart?: { label: string; value: number }[];
    chart_label?: string;
    notes?: string[];
}

export interface LicenceOption {
    key: string;
    label: string;
    licence?: string;
    zar: number;
}

export interface Entitlement {
    token: string;
    name: string;
    slug: string;
    type: string;
    type_label: string;
    format: string;
    language: string;
    languages: string;
    licence: string;
    version: string;
    size: string;
    added: string;
    added_date: string;
    recent: boolean;
    expires: string;
    expired: boolean;
    downloads: number;
    last_downloaded: string | null;
    order_reference: string | null;
    purchase_date: string;
    payment_reference: string;
    amount: number;
    method: string;
    product_href: string;
    owned_by_user: boolean;
}

/* --- Service finder ------------------------------------------------------ */

export interface FinderStep {
    slug: string;
    label: string;
    subtitle: string;
}

export interface FinderSummary {
    need: string | null;
    market: string;
    language: string;
    currency: string;
    formats: string | null;
    budget: string | null;
    status: string;
}

export interface FinderShared {
    steps: FinderStep[];
    completed: number;
    reference: string | null;
    summary: FinderSummary;
}

export interface Offering {
    key: string;
    name: string;
    kind: string;
    format: string;
    icon: string;
    zar: number;
    weeks: number;
    body: string;
    bullets: string[];
    delivery: string;
    includes: string;
    href: string;
    primary: string;
    secondary: string;
    match: number;
}

/* --- Countries ----------------------------------------------------------- */

export interface CountryObject {
    iso: string;
    name: string;
    region: string;
    state: string;
    rcs: number;
    evidence: string;
    updated: string;
    capital?: string;
    currency?: string;
    currency_name?: string;
    languages?: string;
    legal_system?: string;
    office?: string;
    confirmed?: boolean;
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
