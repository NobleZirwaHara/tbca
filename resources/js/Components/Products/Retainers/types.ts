/* Retainers family types: owned by the Retainers builder. Names are prefixed `Ret` to avoid collisions. */

export interface RetExclusion {
    code: string;
    category: string;
    icon?: string;
    excluded?: string;
    why?: string;
    route?: string;
    route_tone?: string;
    next?: string;
    href?: string | null;
}

export interface RetService {
    id: number;
    code: string;
    slug: string;
    name: string;
    category: string;
    category_label: string;
    desk: string | null;
    icon: string | null;
    summary: string;
    price_zar: number;
    price_usd: number | null;
    custom_pricing: boolean;
    allowance_qty: number;
    checklist: string[];
    popularity: number;
    sale_state: string;
}

export interface RetServiceFull extends RetService {
    description: string | null;
    allowance_unit: string;
    period: string;
    unit_definition: string | null;
    owner_model: string;
    owner_model_label: string;
    owner: { name?: string; title?: string; practice?: string; seniority?: string } | null;
    sla_class: string;
    response_window: string;
    inclusions: string[];
    exclusions: RetExclusion[];
    unused_rule: string;
    unused_label: string;
    rollover_cap_pct: number;
    overage_rule: string;
    overage_rate_zar: number;
    min_term_months: number;
    notice_days: number;
    certification: string;
}

export interface RetPeriod {
    id: number;
    starts_on: string;
    ends_on: string;
    status: string;
    opening: number;
    carry: number;
    credits: number;
    carry_out: number;
    statement_ack_at: string | null;
}

export interface RetMeter {
    period: { id: number; starts_on: string; ends_on: string; status: string; next_reset: string } | null;
    opening: number;
    carry: number;
    credits: number;
    denominator: number;
    confirmed: number;
    pending: number;
    disputed: number;
    overage: number;
    remaining: number;
    utilisation: number;
    days_left: number;
    days_elapsed: number;
    days_total: number;
    state: 'ALLOWANCE_HEALTHY' | 'NEAR_EXHAUSTION' | 'EXHAUSTED';
}

export interface RetAdviser {
    name: string;
    title?: string;
    since?: string;
    experience?: string;
    qualifications?: string;
    expertise?: string;
    clients?: string;
    availability?: string;
}

export interface RetRetainer {
    id: number;
    code: string;
    agreement_ref: string | null;
    name: string;
    client_name: string;
    status: string;
    allowance_qty: number;
    monthly_fee_zar: number;
    overage_rate_zar: number;
    rollover_cap_pct: number;
    carry_label: string;
    service_level: string;
    owner_model: string;
    adviser: RetAdviser | null;
    account_owner: { name?: string; role?: string; email?: string; phone?: string; since?: string; delegation?: Record<string, string | boolean> } | null;
    min_term_months: number;
    notice_days: number;
    start_date: string | null;
    term_end: string | null;
    cancel_effective: string | null;
    renewal: { choice: string; allowance: number; fee: number; effective: string; resume?: string | null; decided_at: string } | null;
    period: RetPeriod | null;
    service_slug: string;
}

export interface RetUsage {
    id: number;
    reference: string;
    occurred_at: string;
    activity: string;
    description: string | null;
    category: string;
    adviser: string;
    units: number;
    original_units: number | null;
    billing_effect: string;
    status: string;
    evidence_class: string;
    balance_after?: number | null;
}

export interface RetContext {
    retainer: RetRetainer;
    meter: RetMeter;
    badges: { overage: number; substitution: number; alert: boolean; disputes: number };
    order: { reference: string; status: string; total_zar: number } | null;
}

export interface RetProposal {
    reference: string;
    agreement_ref: string;
    status: string;
    hold_reason: string | null;
    organisation: string;
    request: Record<string, unknown>;
    allowance_qty: number;
    monthly_fee_zar: number;
    vat_zar: number;
    fee_incl_vat: number;
    overage_rate_zar: number;
    rollover_cap_pct: number;
    service_level: string;
    owner_model: string;
    start_date: string | null;
    valid_until: string | null;
    version: number;
    hash: string | null;
    reserved_units: number;
    reservation_expires_at: string | null;
    issued_at: string | null;
    accepted_at: string | null;
    service: RetServiceFull;
}

export interface RetDriver {
    label: string;
    options: Record<string, number>;
}
