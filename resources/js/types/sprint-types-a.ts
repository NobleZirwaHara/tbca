import type { SprintPackage, SprintRecord } from '@/types';

/** Sprint types rendered by the Group A templates (resources/js/Pages/Sprints/Types). */
export type SprintTypeASlug = 'technology-setup' | 'fixed-scope' | 'partner-delivered' | 'checklist' | 'client-service';

export interface SprintTypeAPackage extends SprintPackage {
    /** Price exactly as printed on the product page, e.g. "R4,918.60" or "From R3,800". */
    price_label?: string | null;
    /** "From" for quote-route scopes. */
    price_prefix?: string | null;
    description?: string | null;
    /** Card ribbon, e.g. "Best Value" / "Selected". */
    badge?: string | null;
}

export interface HeroVisual {
    title?: string | null;
    kpis?: { label: string; value: string; note?: string | null }[];
    bars?: { title?: string | null; items: { label: string; value: number | string }[] } | null;
    donut?: { title?: string | null; items: { label: string; value: number | string }[] } | null;
    lists?: { title: string; items: string[] }[];
    table?: { title?: string | null; columns: string[]; rows: string[][] } | null;
}

export interface ProcessStep {
    title: string;
    body?: string | null;
}

export interface LabelValue {
    label: string;
    value: string;
}

export interface Comparison {
    title?: string | null;
    left_title: string;
    right_title: string;
    left: string[];
    right: string[];
}

export interface ExtraPanel {
    title: string;
    kind?: 'list' | 'check' | 'text' | 'steps' | 'comparison' | 'facts' | 'chips' | string;
    items?: (string | LabelValue | ProcessStep)[];
    text?: string | null;
    note?: string | null;
}

/** Shape of `sprint.attributes` for every Group A sprint (all keys optional; templates fall back). */
export interface SprintTypeAAttributes {
    source?: 'mockup' | 'register' | 'manifest';
    screen?: string | null;
    page_code?: string | null;
    register_code?: string | null;
    display_codes?: string[];

    badge?: string | null;
    subtitle?: string | null;
    icon?: string | null;
    breadcrumb?: string[];
    hero_meta?: string[];
    ideal_for_label?: string | null;
    ideal_for?: string[];
    visual?: HeroVisual | null;

    package_heading?: string | null;
    cta_primary?: string | null;
    cta_secondary?: string | null;
    cta_note?: string | null;
    trust_icons?: string[];
    scope_link?: string | null;

    tabs?: string[];
    overview_title?: string | null;
    overview?: string | null;
    client_problem?: string | null;
    short_description?: string | null;
    long_description?: string | null;

    outcomes_title?: string | null;
    outcomes?: string[];
    included_title?: string | null;
    included?: string[];
    deliverables_title?: string | null;
    deliverables?: string[];
    deliverables_by_scope?: Record<string, string[]> | null;
    process_title?: string | null;
    process?: ProcessStep[];

    governance?: LabelValue[];
    bottom_band?: string[];
    bottom_band_lead?: string | null;

    /* technology-setup */
    who_for_title?: string | null;
    who_for?: string[];
    why_title?: string | null;
    why?: string[];
    aligns_with?: string[];
    tools_used?: string | null;
    delivery_mode?: string | null;

    /* fixed-scope */
    simple_terms_title?: string | null;
    simple_terms?: string[];
    inputs_title?: string | null;
    inputs_lead?: string | null;
    inputs?: string[];
    inputs_note?: string | null;
    inputs_turnaround?: string | null;
    why_text?: string | null;
    related_title?: string | null;
    related?: string[];
    limitations?: string[];

    /* partner-delivered */
    controls_title?: string | null;
    controls?: string[];
    ai_note?: string | null;
    scope_notes_title?: string | null;
    scope_notes?: string | null;
    support_title?: string | null;
    support_lines?: string[];

    /* checklist / client-service */
    facts?: LabelValue[];
    as_at?: string | null;
    review_cadence?: string | null;
    companion_assets?: string[];
    exclusions?: string[];
    exclusions_text?: string | null;
    comparison?: Comparison | null;
    completion_title?: string | null;
    completion?: string[];
    delivery_support?: string[];
    add_ons?: string[];
    feature_band?: { title: string; body?: string | null }[];

    extra_panels?: ExtraPanel[];
    faqs?: { q: string; a: string }[];
}

export type SprintTypeARecord = Omit<SprintRecord, 'attributes' | 'packages'> & {
    attributes: SprintTypeAAttributes | null;
    packages: SprintTypeAPackage[] | null;
};

export interface SprintTypeAPageProps {
    sprint: SprintRecord;
    related: SprintRecord[];
}

/** Narrow the generic SprintRecord to the Group A attribute shape. */
export function asTypeA(sprint: SprintRecord): { attrs: SprintTypeAAttributes; packages: SprintTypeAPackage[] } {
    return {
        attrs: (sprint.attributes ?? {}) as SprintTypeAAttributes,
        packages: (sprint.packages ?? []) as SprintTypeAPackage[],
    };
}
