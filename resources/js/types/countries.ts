/* Countries Transaction Ecosystem — shapes sent by App\Support\Countries\Present. */

export type Bucket = 'activated' | 'shell' | 'degraded' | 'suspended' | 'restricted';

export interface CountryBrief {
    slug: string;
    name: string;
    iso2: string;
    state: string;
    state_label: string;
    bucket: Bucket;
}

export interface Country extends CountryBrief {
    id: number;
    iso3: string;
    region: string;
    currency: string | null;
    income_group: string | null;
    programme_status: string;
    activated: boolean;
    gate_status: string;
    evidence_currentness: string;
    confidence: string;
    confidence_pct: number;
    last_reviewed: string | null;
    next_review: string | null;
    activation_date: string | null;
    release_certificate: string | null;
    protective_reason: string | null;
    rcs: number;
    rcs_label: string;
    hard_blocks: number;
    price_resolution: boolean;
}

export interface MissingDomain {
    domain: string;
    key: string;
    missing_fields: number;
    error: string;
    error_label: string;
    absence_code: string;
    absence: string;
    fields: string[];
}

export interface ResolverProfile {
    rcs: number;
    rcs_label: string;
    required_fields: number;
    completed_fields: number;
    hard_blocks: number;
    hard_block_classes: string[];
    profile_current: boolean;
    state: string;
    state_label: string;
    bucket: Bucket;
    transaction_permission: boolean;
    quote_permission: boolean;
    intelligence_permission: boolean;
    price_resolution: boolean;
    missing: MissingDomain[];
    version: string | null;
    valid_to: string | null;
}

export interface ServiceRow {
    code: string;
    name: string;
    category: string;
    summary: string;
    state: string;
    state_label: string;
    access: 'available' | 'restricted' | 'unavailable';
    access_type: string;
    commercial_model: string;
    timeline: string | null;
    delivery_model: string;
    price_allowed: boolean;
    price_zar: number | null;
    route: string;
    reasons: string[];
    quote_permitted: boolean;
    eligible: boolean;
}

export interface CategoryRow {
    key: string;
    prefix: string;
    name: string;
    blurb: string;
    icon: string;
    state: string;
    available: number;
    restricted: number;
    unavailable: number;
    dependency: string;
}

export interface RegisterRow {
    code: string;
    title: string;
    category: string | null;
    type: string | null;
    status: string | null;
    impact: string | null;
    date: string | null;
    data: Record<string, any>;
}

export interface CorridorResolution {
    from: { iso: string; name: string; slug: string | null; african: boolean; state: string; label: string };
    to: { iso: string; name: string; slug: string | null; african: boolean; state: string; label: string };
    ceiling: string;
    ceiling_label: string;
    sellable: boolean;
    pair_permission: string;
    reasons: string[];
}

export interface CorridorRow {
    code: string;
    from_iso: string;
    from_name: string;
    to_iso: string;
    to_name: string;
    type: string;
    purpose: string;
    group: string | null;
    path_type: string;
    evidence_status: string;
    evidence_items: number;
    confidence_pct: number;
    confidence: string;
    cost_min: number;
    cost_max: number;
    time: string | null;
    risk: string;
    pair_rcs: number;
    featured: boolean;
    resolution: CorridorResolution;
    details?: Record<string, any> | null;
}

export interface FeeLineRow {
    no: number;
    name: string;
    description: string;
    payer: string;
    payable_to: string | null;
    jurisdiction: string | null;
    basis: string;
    quantity: number;
    unit: number | null;
    amount: number | null;
    currency: string;
    amount_zar: number | null;
    when: string | null;
    evidence: string | null;
    certainty: string;
    resolver_ref: string | null;
    status: string;
}

export interface LedgerSummary {
    code: string;
    name: string;
    lines: number;
    resolved: number;
    suppressed: number;
    subtotal_zar: number;
}

export interface Outlook {
    months: string[];
    [ledger: string]: number[] | string[];
}

export interface PlanItemRow {
    id: number | null;
    code: string;
    title: string;
    category: string;
    owner: string | null;
    due_date: string | null;
    priority: string;
    status: string;
    critical: boolean;
}

export interface PlanScore {
    score: number;
    level: string;
    counts: Record<string, number>;
    total: number;
    applicable: number;
    completed: number;
    bars: { label: string; pct: number; status: string; open: number }[];
    critical_open: number;
}

export type TopicBlock = {
    type: 'kv' | 'checklist' | 'table' | 'cards' | 'note' | 'list' | 'guidance' | 'bars';
    title: string;
    intro?: string;
    span?: number;
    tabs?: string[];
    rows?: any[];
    items?: any[];
    columns?: string[];
    head?: string[];
    footer?: string;
    body?: string;
    tone?: string;
    cta?: [string, string];
};

export interface TopicAction {
    label: string;
    kind: string;
}

export interface Topic {
    key: string;
    title: string;
    lead: string;
    kpis: { label: string; value: string; caption: string; icon: string }[];
    tabs: string[];
    blocks: TopicBlock[];
    status: { title: string; rows: [string, string, string][]; cta?: [string, string] };
    important: string | null;
    actions: TopicAction[];
    advisor: [string, string] | null;
    trust: [string, string][];
    footer: string;
}

export interface EngagementPayload {
    reference: string;
    status: string;
    title: string;
    summary: string;
    category: string;
    request_type: string;
    contact: Record<string, string | null>;
    letter: Record<string, any> | null;
    ledgers: { ledger: string; name: string; recipient: string; subtotal: number; lines: { ledger: string; label: string; recipient: string; amount: number }[] }[];
    subtotal: number;
    vat: number;
    order_reference: string | null;
    accepted_at: string | null;
    activated_at: string | null;
    workspace: Record<string, any> | null;
    closure: Record<string, any> | null;
    created: string;
}

export interface SovereignPayload {
    reference: string;
    stage: number;
    status: string;
    intake: Record<string, any>;
    declarations: Record<string, string>[];
    conflict_outcome: string | null;
    disclosure_submitted: string | null;
    independence_confirmed: string | null;
    evidence_approved: string | null;
    deliverables: Record<string, any>[];
    closure: Record<string, any> | null;
    closed: string | null;
}
