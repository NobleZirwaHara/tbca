export type StepState = 'done' | 'current' | 'todo';

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
}

export interface TechHeader {
    reference: string;
    organisation: string;
    tower: string;
    tower_code: string;
    owner: string | null;
    status: string;
    health: string;
    stage: number;
    stage_name: string;
    gate_label: string;
    presented: { number: number; name: string } | null;
    tracker: { label: string; state: StepState }[];
    readonly: boolean;
}

export interface FeeLine {
    ledger: 'T' | 'X' | 'S';
    item: string;
    covers: string;
    basis: string;
    certainty: string;
    gate: string;
    frequency: string;
    low: number | null;
    high: number | null;
    status: string;
    class: string;
}

export interface LedgerTotals {
    T: [number, number];
    X: [number, number];
    S: [number, number];
    vat: [number, number];
    t_fixed: number;
}

export interface MandateLineRow {
    id: number;
    ledger: string;
    code: string | null;
    item: string;
    recipient: string;
    basis: string;
    certainty: string;
    status: string;
    low: number;
    expected: number;
    high: number;
    paid: number;
    earned: number;
    creditable: number;
    invoice: string | null;
    due: string | null;
    gate: string | null;
    route: string | null;
    evidence: string | null;
    vat: number;
    order: string | null;
}

export interface LedgerSummary {
    ledger: string;
    name: string;
    recipient: string;
    payer: string;
    status: string;
    paid: number;
    earned: number;
    unearned: number;
    creditable: number;
    refundable: number;
    next_milestone: string | null;
    next_due: number | null;
    due_date: string | null;
    lines: MandateLineRow[];
}

export interface MandateView {
    reference: string;
    project: string;
    organisation: string;
    country: string;
    sector: string;
    stage_index: number;
    stage: string;
    stage_name: string;
    status: string;
    gate: string | null;
    route: string;
    entry: string;
    service: { slug: string; name: string; code: string; price: number; duration: string } | null;
    method_card_ref: string | null;
    lead: string | null;
    reviewer: string | null;
    nda_signed: string | null;
    method_approved: string | null;
    letter_signed: string | null;
    mandate_signed: string | null;
    deposit: { reference: string; status: string; total: number } | null;
    lifecycle: { code: string; label: string; state: StepState }[];
    gates: { code: string; name: string; binds: string; status: string; amount: number; decided: string | null; by: string | null; expires: string | null }[];
    pending_gate: string | null;
    meta: {
        evidence_requests?: { item: string; requested: string; status: string; required_by: string }[];
        deliverables?: { name: string; ref: string; due: string; status: string; owner: string }[];
        milestones?: { date: string; name: string; depends: string }[];
        vdr?: { folders: number; files: number; review: number };
        next_tbca?: string;
        next_client?: string;
        [k: string]: unknown;
    };
    signals: Record<string, string>;
    stop_blocks: { code: string; message: string }[];
    next: { label: string; href: string | null; who: string };
}

export interface MandateEventRow {
    actor: string;
    event: string;
    ref: string | null;
    at: string;
    ago?: string;
}

export interface ComparisonRow {
    key: string;
    name: string;
    tag: string;
    icon: string;
    use: string;
    get: string;
    who: string;
    commitment: string;
    price: string;
    price_note: string;
    exit: string;
    best: string;
    href: string;
    score: number;
    fit: string;
    reasons: string[];
    excluded: string[];
    viable: boolean;
}

export interface ResolverResult {
    outcome: 'recommend' | 'decline' | 'escalate';
    recommended: string | null;
    rows: ComparisonRow[];
    viable_count: number;
    decline_reasons: string[];
    escalation_reasons: { title: string; body: string }[];
    alternatives: { title: string; body: string; href: string }[];
}

export interface VehicleRow {
    code: string;
    name: string;
    type: string;
    status: string;
    engagement: string;
    start: string | null;
    next_due: string | null;
    invoiced: number;
    paid: number;
    outstanding: number;
    overdue: number;
    health: number | null;
    owner: string | null;
    progress: number;
    label: string;
    billing: string | null;
}
