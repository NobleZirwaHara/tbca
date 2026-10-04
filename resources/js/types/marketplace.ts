/* Marketplace + Partner Services shapes (serialised by App\Support\Marketplace\Presenter). */

export interface Option {
    value: string;
    label: string;
}

export interface MkProvider {
    id: number;
    code: string;
    slug: string;
    kind: 'marketplace' | 'partner';
    name: string;
    category: string | null;
    categoryLabel: string | null;
    profession: string | null;
    city: string | null;
    country: string;
    status: string;
    statusLabel: string;
    tier: string | null;
    rating: number | null;
    reviewsCount: number;
    engagementsCount: number;
    score: number | null;
    applicationRef: string | null;
    lastVerified: string | null;
    nextReview: string | null;
    nextReviewDays: number | null;
    agreementSigned: string | null;
    routable: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: Record<string, any>;
}

export interface MkListing {
    id: number;
    slug: string;
    kind: 'fixed' | 'recurring' | 'partner';
    title: string;
    category: string;
    categoryLabel: string;
    subcategory: string | null;
    summary: string | null;
    priceZar: number | null;
    period: string | null;
    rating: number | null;
    reviewsCount: number;
    badge: string | null;
    status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: Record<string, any>;
    provider: { name: string; slug: string; status: string } | null;
}

export interface Ledgers {
    a: number;
    b: number;
    c: number;
    c_state: 'estimated_cap' | 'actual';
}

export interface BriefScope {
    price_version?: string;
    gate?: string;
    methodology?: string;
    objective?: string;
    summary?: string;
    scope_items?: string[];
    deliverables?: string[];
    exclusions?: string[];
    assumptions?: string[];
    timing?: Record<string, string>;
    qa?: Record<string, string>;
    delivery_class?: string;
    qa_class?: string;
    ledgers?: Ledgers;
    floor?: { status: string; floor: number; target?: number; cts?: number; benchmark?: number };
    provider_selection?: string;
    accepted_at?: string;
    clarifications?: { at: string; message: string }[];
}

export interface MkBrief {
    id: number;
    reference: string;
    title: string;
    category: string | null;
    categoryLabel: string | null;
    clientName: string | null;
    status: string;
    statusLabel: string;
    step: number;
    priorityScore: number | null;
    openToProviders: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    scope: BriefScope;
    disclosure: Record<string, string>;
    budgetLabel: string | null;
    countryLabel: string | null;
    provider: MkProvider | null;
    createdAt: string | null;
    journeyStep: number;
}

export interface TimelineEvent {
    at: string;
    event: string;
    description: string;
    owner: string;
    status: string;
}

export interface MkEngagement {
    id: number;
    reference: string;
    assignmentRef: string | null;
    title: string;
    service: string | null;
    category: string | null;
    categoryLabel: string | null;
    clientName: string | null;
    stage: string;
    stageLabel: string;
    priority: string;
    progress: number;
    valueZar: number;
    providerRateZar: number;
    paymentState: string;
    qaStandard: string | null;
    targetDate: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: Record<string, any> & { timeline?: TimelineEvent[] };
    briefRef: string | null;
    provider: MkProvider | null;
    listingSlug: string | null;
    trackerStep: number;
    deliverableStep: number;
    providerStep: number;
}

export interface MkDeliverable {
    id: number;
    reference: string;
    fileName: string;
    version: string;
    status: string;
    reviewer: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qa: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: Record<string, any>;
    submittedAt: string | null;
    decidedAt: string | null;
}

export interface MkDispute {
    id: number;
    reference: string;
    kind: string;
    type: string;
    category: string | null;
    priority: string;
    subject: string;
    description: string | null;
    amountZar: number;
    status: string;
    step: number;
    responseDue: string | null;
    responseDaysLeft: number | null;
    raisedOn: string | null;
    updatedOn: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: Record<string, any>;
    engagementRef: string | null;
    engagementTitle: string | null;
    providerName: string | null;
}

export interface PartnerQuote {
    t: number;
    p: number;
    x: number;
    s: number;
    c: number;
    total: number;
    floor: number;
    floor_status: 'PASS' | 'BLOCKED';
    basis?: string;
    validity?: string;
    hours?: number;
    rate?: number;
    scope?: string;
    methodology?: string;
    deliverables?: string;
    assumptions?: string;
    exclusions?: string;
    mechanism?: string;
    source?: string;
}

export interface MkPartnerRequest {
    id: number;
    reference: string;
    title: string | null;
    clientName: string | null;
    stage: string;
    stageLabel: string;
    step: number;
    conflictState: string;
    arrangement: string | null;
    feeMechanism: string | null;
    permissionRef: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intake: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolution: Record<string, any>;
    quote: PartnerQuote | Record<string, never>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: Record<string, any>;
    requestedOn: string | null;
    partner: MkProvider | null;
    listing: { title: string; slug: string } | null;
    orderRef: string | null;
    orderStatus: string | null;
    page: string;
}

export interface RegisterNav {
    marketplace: { key: string; title: string }[];
    partners: { key: string; title: string }[];
}
