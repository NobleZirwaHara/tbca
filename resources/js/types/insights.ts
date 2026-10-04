/* Insights section (Industries + TBCA Resources) shared types. */

export interface IndustryContextValue {
    industryCode: string | null;
    industryName: string | null;
    industrySlug: string | null;
    subIndustryCode: string | null;
    subIndustryName: string | null;
    country: string;
    countryName: string;
}

export interface IndustryCard {
    id: number;
    code: string;
    shortCode: string;
    number: number;
    slug: string;
    name: string;
    icon: string | null;
    blurb: string | null;
    catalogueState: 'deep' | 'thin' | 'below_threshold';
    complexityClass: string;
    complexityLabel: string;
    regulatoryState: string;
    professionalGate: string;
    status: string;
}

export interface SubIndustryOption {
    code: string;
    name: string;
    description: string | null;
}

export interface IndustryOption extends IndustryCard {
    subIndustries: SubIndustryOption[];
}

export interface IndustryProfile {
    tagline?: string;
    intro?: string;
    kpis: {
        opportunity: number;
        opportunityLabel: string;
        projects: number;
        mandates: number;
        institutions: number;
        freshness: string;
        nextUpdate: string;
        confidence: string;
    };
    services: { title: string; text: string; icon: string; regulated?: boolean }[];
    diagnostics: { title: string; text: string; minutes: number; popular?: boolean }[];
    brief: { title: string; regions: string; updated: string; pages: number; price: number; summary: string };
    opportunities: { title: string; text: string }[];
    can: string[];
    cannot: string[];
    tiles?: { approvedServices: number; diagnostics: number; professionalRoutes: number; leadTime: string; evidence: string };
    caseStudy?: { title: string; text: string } | null;
}

export interface SprintLink {
    slug: string;
    title: string;
    summary: string | null;
    priceZar: number | null;
    delivery: string | null;
    category: string | null;
}

export interface IndustryPage extends IndustryCard {
    description: string | null;
    tagline: string | null;
    intro: string | null;
    operatingMode: string;
    profile: IndustryProfile;
    subIndustries: SubIndustryOption[];
    sprints: SprintLink[];
    sprintsUrl: string;
    skus: { slug: string; title: string; priceZar: number | null; saleState: string; summary: string | null }[];
    approvedServices: number;
}

export interface EngagementContext {
    reference: string;
    title: string;
    industry: string | null;
    industrySlug: string | null;
    subIndustry: string | null;
    country: string;
    stage: string;
    stageLabel: string;
    status: string;
    date: string;
}

export interface WorkspaceBase {
    engagement: EngagementContext;
    counts: { tasks: number; evidence: number; notices: number; ledger: number };
}

export type Currentness = 'current' | 'review_due' | 'overdue' | 'restricted' | 'retired';

export interface ResourceCard {
    id: number;
    slug: string;
    url: string;
    title: string;
    type: string;
    collection: string;
    category: string;
    categoryLabel: string;
    summary: string;
    format: string;
    minutes: number | null;
    pages: number | null;
    fileSize: string | null;
    access: 'free' | 'gated' | 'paid' | 'subscription' | 'restricted';
    accessLabel: string;
    priceZar: number | null;
    listPriceZar: number | null;
    source: string;
    sourceBasis: string | null;
    sourceCount: number;
    reviewedAt: string | null;
    nextReviewAt: string | null;
    currentness: Currentness;
    downloads: number;
    aiAssisted: boolean;
    humanReview: string;
    featured: boolean;
    industries: string[];
}

export interface AccessState {
    state: 'retired' | 'blocked' | 'entitled' | 'open' | 'gate' | 'login' | 'purchase' | 'subscribe' | 'restricted';
    canDownload: boolean;
    reason: string | null;
}

export interface ResourceBody {
    about?: string;
    learn?: string[];
    get?: string[];
    who?: string[];
    how?: string[];
    preview?: { title: string; items: string[] }[];
    sections?: { heading: string; text: string }[];
    checklist?: string[];
}

export interface ResourceDetail extends ResourceCard {
    body: ResourceBody;
    meta: Record<string, unknown>;
    publishState: string;
    riskClass: string;
    version: string;
    language: string;
    boundaryNote: string | null;
    linkedProduct: string | null;
    protected: boolean;
    retiredAt: string | null;
    retiredReason: string | null;
    replacement: ResourceCard | null;
    accessState: AccessState;
    saved: boolean;
}

export interface WebinarCard {
    id: number;
    slug: string;
    title: string;
    tagline: string;
    summary: string;
    speaker: string;
    speakerRole: string | null;
    topic: string;
    audience: string;
    date: string;
    weekday: string;
    time: string;
    durationMinutes: number;
    upcoming: boolean;
    cpd: boolean;
    icon: string;
    gains: string[];
    replayVersion: string;
    reviewDue: string | null;
}

export interface Paged<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    currentPage: number;
    lastPage: number;
}

export interface SimplePagination {
    page: number;
    lastPage: number;
    total: number;
}
