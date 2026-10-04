/* Due Diligence section types (mirrors App\Support\DueDiligence\*). */

export interface DdJourneyStep {
    n: number;
    label: string;
    short: string;
    body: string;
    icon: string;
}

export interface DdIconItem {
    title: string;
    body?: string;
    icon?: string;
}

export interface DdFamilyCard {
    slug: string;
    name: string;
    short: string;
    selector: string;
    icon: string;
}

export interface DdFamily {
    slug: string;
    name: string;
    icon: string;
    template: 'tiers' | 'table';
    subjectType: string;
    short: string;
    selector: string;
    title: string;
    subtitle: string;
    description: string;
    sample: string;
    sampleCode: string | null;
    sla: string;
    cta: string;
    covers: DdIconItem[];
    useCases: DdIconItem[];
    receive: DdIconItem[];
    why: string[];
    triggers: string[];
}

export interface DdSku {
    code: string;
    family: string;
    name: string;
    label: string;
    tier: 'essential' | 'enhanced' | 'executive';
    included: string;
    timeline: string;
    unit: string;
    expert: number | null;
    platform: number | null;
    external: number;
    externalLabel: string;
    total: number | null;
    popular: boolean;
    coverage: string;
    reviewLevel: string;
    reviewMandatory: boolean;
    deliverables: string;
    media: string;
    ownership: string;
    financial: string;
    bestFor: string;
    automation: string;
    includedParties: number;
    purchasable?: boolean;
}

export interface DdFeeLine {
    no: number;
    category: 'expert' | 'platform' | 'external';
    item: string;
    code: string;
    description: string;
    trigger: string;
    payer: string;
    price: number;
    vat: number;
    status: string;
    refund: string;
    recognition: string;
}

export interface DdPrice {
    lines: DdFeeLine[];
    expert: number;
    platform: number;
    external: number;
    margin: number;
    subtotal: number;
    vat: number;
    handling: number;
    total: number;
    usd: number;
    days: [number, number];
    turnaround: string;
}

export interface DdAddon {
    code: string;
    name: string;
    includes: string;
    useful: string;
    timeline: string;
    days: number;
    zar: number;
    icon: string;
}

export interface DdOption {
    value: string;
    label: string;
}

export interface DdOptions {
    subjectTypes: DdOption[];
    jurisdictions: DdOption[];
    purposes: string[];
    uses: string[];
    entityTypes: string[];
    complexity: DdOption[];
    readiness: DdOption[];
    sla: DdOption[];
    industries: string[];
}

export interface DdChip {
    label: string;
    value: string;
}

export interface DdCaseHeader {
    reference: string;
    caseName: string;
    clientName: string | null;
    subjectName: string;
    subjectType: string;
    family: string;
    familyName: string;
    package: string;
    skuCode: string;
    status: string;
    statusLabel: string;
    step: number;
    stage: number;
    stageLabel: string;
    isSample: boolean;
    createdAt: string;
    updatedAt: string;
    slaDueAt: string | null;
    chips: DdChip[];
    consentsComplete: boolean;
    counts: { openFlags: number; openRequests: number; disputes: number; hasFinal: boolean; subscription: boolean };
}

export interface DdCoordinator {
    name: string;
    role: string;
    email: string;
    phone: string;
}

export interface DdEvent {
    code: string;
    type: string;
    actor: string;
    role: string;
    description: string;
    at: string;
}

export interface DdCommercial {
    expert: number;
    platform: number;
    external: number;
    subtotal: number;
    vat: number;
    total: number;
    credits: number;
    lines: DdFeeLine[];
    orderReference: string | null;
}

export interface DdReportMeta {
    title: string;
    version: string;
    status: string;
    hash: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    deliverables: { name: string; description: string; pages: number }[];
}

export interface DdCasePageProps {
    case: DdCaseHeader;
    journey: DdJourneyStep[];
    coordinator: DdCoordinator;
}

export interface DdQuote {
    reference: string;
    status: string;
    step: number;
    inputs: Record<string, string | number | boolean | null>;
    requirements: Record<string, string | number>;
    addons: string[];
    manifest: DdPrice | null;
    priceVersion: string | null;
    scopeHash: string | null;
    externalTolerance: number;
    payerName: string | null;
    acceptedBy: string | null;
    acceptedAt: string | null;
    validUntil: string | null;
    createdAt: string;
    consent: Record<string, unknown> | null;
    consentedAt: string | null;
    engagedAt: string | null;
    billing: Record<string, string> | null;
    caseState: string;
}

export interface DdQuotePageProps {
    quote: DdQuote;
    family: { slug: string; name: string; icon: string; subjectType: string; receive: DdIconItem[] };
    sku: DdSku;
    price: DdPrice;
    step: string;
    steps: Record<number, string>;
    journey: DdJourneyStep[];
}
