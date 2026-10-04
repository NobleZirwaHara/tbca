/* Subscriptions family types: owned by the Subscriptions builder. */

export type SubClassCode = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export interface SubPlan {
    id: number;
    code: string;
    slug: string;
    name: string;
    tier: string | null;
    category: string | null;
    recurrence_class: SubClassCode;
    class_name: string;
    product_type: string;
    tagline: string | null;
    description: string | null;
    what_recurs: string | null;
    why_recurs: string | null;
    next_period_value: string | null;
    who_for: string | null;
    monthly_zar: number | null;
    annual_zar: number | null;
    usd_monthly: number | null;
    annual_discount_pct: number;
    min_term_months: number;
    delivery_cadence: string | null;
    cancellation_route: string;
    pause_allowed: boolean;
    popular: boolean;
    features: string[];
    entitlements: string[];
    details: {
        matrix_blurb?: string;
        recurrence?: { label: string; value: string }[];
        compare?: Record<string, string>;
        short?: string;
        important?: string;
        subscription_type?: string;
    };
    status: string;
    sale_blocker: string | null;
    floor_zar: number | null;
}

export interface SubUsage {
    logins?: number;
    logins_delta?: number;
    content?: number;
    content_delta?: number;
    reports?: number;
    reports_delta?: number;
    exports?: number;
    support?: number;
    session_minutes?: number;
    session_delta?: number;
    tasks?: number;
    tasks_delta?: number;
    score?: number;
    confidence?: string;
    idle_periods?: number;
    days_inactive?: number;
    daily?: { date: string; logins: number; content: number }[];
    top_content?: [string, number][];
    features?: [string, number][];
    value?: { decisions: number; decisions_delta: number; hours: number; hours_delta: number; risks: number; risks_delta: number };
    health?: Record<string, boolean>;
    activity?: [string, string, string][];
    missing?: string[];
}

export interface SubPriceChange {
    state: 'pending' | 'accepted' | 'exit' | 'applied';
    old_price_zar: number;
    new_price_zar: number;
    notice_at: string;
    effective_at: string;
    decide_by: string;
    basis: string;
    decision: string | null;
}

export interface SubSubscription {
    id: number;
    reference: string;
    status: string;
    display_status: string;
    billing_interval: 'monthly' | 'annual';
    price_zar: number;
    vat_zar: number;
    total_zar: number;
    started_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    next_charge_at: string | null;
    next_review_at: string | null;
    min_term_months: number;
    mandate: { reference?: string; status?: string; brand?: string; last4?: string; consent_version?: string } | null;
    pause_until: string | null;
    cancel_requested_at: string | null;
    cancel_effective_at: string | null;
    cancel_reason: string | null;
    access_until: string | null;
    disuse_flagged: boolean;
    price_change: SubPriceChange | null;
    payment_failed_at: string | null;
    overdue_zar: number;
    usage: SubUsage;
    meta: {
        pending_charges?: { label: string; amount_zar: number }[];
        dunning?: { stage: string; reason?: string; attempts?: number };
        invoice?: { number: string; issued: string; due: string };
        cancellation?: { mandatory_actions: number; reason: string; effective_at: string; requested_at: string };
    };
    pending_plan: { name: string; slug: string; recurrence_class: string; monthly_zar: number } | null;
    plan: SubPlan;
}

export interface SubOpRow {
    id: number | string;
    reference: string | null;
    title: string | null;
    client: string | null;
    plan_name: string | null;
    recurrence_class: string | null;
    status: string | null;
    amount_zar: number | null;
    due_at: string | null;
    data: Record<string, any>;
}

export interface SubEventRow {
    event_type: string;
    previous_state: string | null;
    new_state: string | null;
    payload?: Record<string, any> | null;
    actor_role?: string;
    created_at: string;
}
