/* Virtual Deal Room types (shared by DealRoom pages and components). */

export type StageStatus = 'locked' | 'unlocked' | 'completed';

export interface StepperStage {
    code: string;
    name: string;
    short: string;
    page: string;
    phase: string;
    status: StageStatus;
}

export interface RoomHeader {
    slug: string;
    reference: string;
    name: string;
    company: string;
    country: string;
    sector: string | null;
    dealType: string;
    transactionType: string;
    /** Group of the transaction type (null for unrecognised older labels). */
    transactionGroup: string | null;
    amount: number;
    /** Indicative raise band (ZAR limits); rendered in the display currency. */
    raiseBand: RaiseBand | null;
    status: 'active' | 'paused' | 'closed' | 'archived';
    pausedReason: string | null;
    currentStage: { code: string; name: string; page: string };
    nextStage: { code: string; name: string } | null;
    role: string | null;
    manages: boolean;
    stepper: StepperStage[];
}

/** Mirrors App\Support\DealRoom\EnquiryOptions::RAISE_BANDS (whole ZAR; max is exclusive, null = open). */
export interface RaiseBand {
    code: string;
    min: number;
    max: number | null;
    indicative_zar: number;
}

/** Grouped transaction types for the enquiry select. */
export interface TransactionTypeGroup {
    group: string;
    options: string[];
}

export interface AuditEntry {
    id: number;
    event: string;
    description: string;
    actor: string;
    at: string;
}

export interface ApprovalRow {
    id: number;
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    decidedBy: string | null;
    decidedAt: string | null;
    note: string | null;
    clientSide: boolean;
}

export interface ChargeLine {
    category: string;
    item: string;
    provider?: string;
    net: number;
    vat: number;
}

export interface Charge {
    id: number;
    reference: string;
    kind: string;
    stage: string | null;
    description: string;
    lines: ChargeLine[];
    net: number;
    vat: number;
    total: number;
    status: string;
    order: string | null;
    failedAttempts: number;
    failureReason: string | null;
    dueDate: string | null;
    issuedAt: string;
    paidAt: string | null;
    refunded: number;
    meta: Record<string, unknown> | null;
}

export interface GateCheck {
    key: string;
    label: string;
    done: boolean;
    auto: boolean;
}

export interface Gate {
    checks: GateCheck[];
    approvals: ApprovalRow[];
    fee: { code: string; name: string; net: number; charge: Charge | null; paid: boolean } | null;
    passed: boolean;
    blockers: string[];
}

export interface StageInfo {
    code: string;
    name: string;
    phase: string;
    status: StageStatus;
    start: string;
    output: string;
    revenue: string;
    unlockedAt: string | null;
    completedAt: string | null;
    next: { code: string; name: string; page: string } | null;
    lockRule: string;
}

export type Block =
    | { type: 'table'; title: string; columns: string[]; rows: string[][]; note?: string; span?: number }
    | { type: 'kv'; title: string; rows: [string, string][]; note?: string; span?: number }
    | { type: 'list'; title: string; items: string[]; note?: string; span?: number }
    | { type: 'metrics'; title: string; items: { label: string; value: string; caption?: string }[]; note?: string; span?: number }
    | { type: 'bars'; title: string; items: { label: string; value: number; display: string }[]; note?: string; span?: number };

export interface DocumentRow {
    id: number;
    name: string;
    folderId: number;
    folder: string | null;
    size: number;
    version: number;
    category: string | null;
    confidence: number | null;
    status: 'ready' | 'flagged' | 'approved' | 'released';
    issue: string | null;
    severity: string | null;
    hash: string | null;
    uploaded: string;
    downloadable: boolean;
}

export interface FolderRow {
    id: number;
    name: string;
    documents: number;
    staged: boolean;
    released: boolean;
    roles: string[];
}

export interface PartyRow {
    id: number;
    name: string;
    email: string;
    organisation: string | null;
    role: string;
    roleLabel: string;
    group: string | null;
    jurisdiction: string | null;
    accessLevel: 'full' | 'qa_only' | 'view_only';
    status: string;
    score: number | null;
    mfa: boolean;
    nda: string | null;
    invitedAt: string | null;
    expires: string | null;
    lastAccess: string | null;
    internal: boolean;
    docAccess?: string;
}

export interface ItemRow {
    id: number;
    title: string;
    owner: string | null;
    status: string;
    due: string | null;
    meta: Record<string, string | number | null>;
    updated: string;
}

export interface OfferRow {
    id: number;
    version: string;
    label: string;
    side: 'sponsor' | 'investor';
    submittedBy: string;
    at: string;
    valuation: number;
    investment: number;
    equity: number;
    condition: string | null;
    terms: Record<string, string>;
    status: 'active' | 'superseded' | 'approved' | 'withdrawn';
    approvedAt: string | null;
}

export interface UsageRow {
    key: string;
    label: string;
    unit: string;
    included: number;
    used: number;
    remaining: number;
    forecast: number;
    rate: number | null;
    pct: number;
    projectedOverage: number;
    charge: number;
    status: 'on_track' | 'near_limit' | 'overage_risk';
}

export interface UsageSummary {
    rows: UsageRow[];
    projectedOverage: number;
    vat: number;
    plan: string;
    period: string;
    projectedDate: string;
    spendToDate: number;
    outstanding: number;
    alerts: { at: string; description: string }[];
}

export interface CommercialRequestRow {
    id: number;
    reference: string;
    type: string;
    status: string;
    raisedBy: string;
    amount: number;
    payload: Record<string, any>;
    resolution: string | null;
    charge: Charge | null;
    createdAt: string;
    decidedAt: string | null;
    approvals: ApprovalRow[];
    room?: string;
    slug?: string;
}

export interface RoomPageProps {
    room: RoomHeader;
    audit: AuditEntry[];
}
