/* ==========================================================================
   Attribute shapes (sprints.attributes JSON) for the group-B sprint types.
   Package data lives in sprints.packages (SprintPackage[]).
   ========================================================================== */
import type { VisualSpec } from '@/Components/SprintTypes/B/DataVisual';

export type Pair = [string, string];

export interface Faq {
    q: string;
    a: string;
}

/* --- dashboard-data (DDA) ------------------------------------------------ */
export interface DashboardDataAttributes {
    tags: string[];
    visual: VisualSpec;
    package_heading: string;
    price_prefix: string;
    cta: string;
    notes: string[];
    overview: string;
    key_outcomes: string[];
    whats_included: string[];
    deliverables_title: string;
    deliverables: string[];
    process_title: string;
    process: string[];
    we_need: string[];
    addons: string[];
    exclusions: string[];
    why: Pair[];
    facts: Pair[];
    faqs: Faq[];
}

/* --- subscription (SUB) -------------------------------------------------- */
export interface SubscriptionAttributes {
    pills: string[];
    intro: string;
    cards: { what_recurs: string; why_recurs: string; next_period: string; who_for: string };
    entitlements_title: string;
    entitlements: string[];
    we_need: string;
    recurrence: Pair[];
    price_display: string;
    price_cents: number;
    per: string;
    billing_note: string;
    next_charge: string;
    draft: boolean;
    commercial: Pair[];
    side_terms: Pair[];
    cta: string;
    cancellation_title: string;
    cancellation: string;
    important: string;
    trust: Pair[];
    plans: { key: string; name: string; zar: number; note?: string }[];
}

/* --- retainer (RET) ------------------------------------------------------ */
export interface RetainerBlock {
    label?: string;
    headline: string;
    sub?: string;
    text?: string;
    link?: string;
}

export interface RetainerAttributes {
    variant: 'withheld' | 'priced';
    badge: string;
    sprint_code: string;
    intro: string;
    meta: Pair[];
    capacity: RetainerBlock & { unit?: string; period?: string; unit_definition?: string };
    scope: string[];
    scope_link: string;
    exclusions: string[];
    exclusions_link: string;
    owner: { avatar: 'generic' | 'person' | 'team'; model_label?: string; name?: string; role?: string; seniority_label?: string; seniority?: string; headline?: string; text?: string; link?: string };
    service_level: RetainerBlock;
    unused: RetainerBlock;
    overage: RetainerBlock;
    utilisation: string;
    compare: { intro: string; product?: string; points: string[]; alt_title: string; alt_text?: string; alt_points?: string[] };
    strip: Pair[];
    per: string;
    commercial_text: string;
    commercial_check: string | null;
    side_list: string[];
    cta: string;
    fit_heading: string;
    fit: string[];
    important: string;
}

/* --- dashboard (DASH + Dashboard Sprint register) ---------------------- */
export interface DashboardAttributes {
    subtitle: string;
    badges: string[];
    highlights: string[];
    audience_text: string;
    best_for: string;
    price_note: string;
    facts: Pair[];
    build_strip: Pair[];
    tabs: string[];
    tab_content: Record<string, { intro?: string; items?: string[] }>;
    comparison: { columns?: string[]; rows?: [string, string, string][]; footer?: string };
    what_you_receive: string[];
    control_trust: { title: string; text?: string }[];
    inputs_required: string[];
    preview: VisualSpec & { tag?: string };
    register: { no: number; master_no: number; category_v2: string; subcategory_v2: string; record_id: string };
}

/* --- training (TRN) ------------------------------------------------------ */
export interface TrainingAttributes {
    badges: string[];
    facts: Pair[];
    hero_icon: string;
    how_it_works_note: string;
    delivers: { icon: string; title: string; text: string }[];
    needs: { icon: string; label: string }[];
    not_included: string;
    review_quality: Pair[];
    review_cadence: string;
    review_support: string;
    fee_table: string[][];
    fee_footer: string[];
    lead_next: { label: string; icon: string; title: string; text: string }[];
}

/* --- template (TPL) ------------------------------------------------------ */
export interface TemplateAttributes {
    layout_variant: 'A' | 'B' | 'C' | 'D';
    category: string;
    tagline: string;
    cover: { lines: string[]; icon: string; format_tag: string | null };
    category_pill: string | null;
    format_badge: string | null;
    hero_tagline: string | null;
    hero_problem: string | null;
    perfect_for_label: string | null;
    perfect_for: string[];
    feature_strip: Pair[];
    category_line: string | null;
    package_panel_title: string;
    package_panel_note: string | null;
    tabs: string[];
    overview: { paragraphs?: string[]; mini_features?: { icon?: string; title: string; text: string }[]; bullets?: string[] };
    key_value_title: string;
    key_value: { title: string; text?: string; icon?: string }[];
    key_value_footer: string | string[] | null;
    what_you_get: string[];
    inputs_title: string;
    inputs: string[];
    inputs_note: string | null;
    whats_included: { name?: string; title?: string; price?: string; items?: string[]; features?: string[]; recommended?: boolean }[] | null;
    included_matrix: { title?: string; columns: string[]; rows: (string | boolean)[][]; legend?: string } | null;
    preview: { title?: string; pages?: string[]; thumbnails?: string[]; caption?: string; caption_badge?: string; button?: string; chips?: string[] } | null;
    how_it_works_title: string;
    how_it_works: Pair[];
    how_it_works_footer: string[];
    why_not_ai: { title?: string; free_heading: string; free_points: string[]; tbca_heading: string; tbca_points: string[]; vs_badge?: string; footer?: string | null } | null;
    delivery_updates: Pair[] | Record<string, string> | null;
    delivery_updates_title: string | null;
    delivery_strip: string[][] | string | null;
    licence_support: unknown;
    faqs: Faq[];
    sticky_bar: { title?: string; subtitle?: string; format?: string; file_format?: string; access?: string } | null;
}

/* --- report (RPT) -------------------------------------------------------- */
export interface ReportPanel {
    type: string;
    title?: string;
    value?: string;
    label?: string;
    delta?: string;
    content?: string;
    highlight?: string;
    link?: string;
    rows?: (string | number)[][];
    items?: string[];
    kpis?: (string | number)[][];
    columns?: string[];
    legend?: string | string[];
    axes?: string | string[];
}

export interface ReportAttributes {
    flavour: 'analytics' | 'governed';
    theme: 'light' | 'dark';
    ideal_for: string[];
    hero_facts: string[][];
    hero_problem: string | null;
    hero_note: string | null;
    preview: { device?: string; title?: string; nav?: string[]; panels?: ReportPanel[] };
    package_panel_title: string;
    package_panel_note: string | null;
    ctas: string[];
    trust: string[] | null;
    tabs: string[];
    section_numbering: boolean | null;
    overview: string;
    executive_snapshot: Pair[];
    whats_inside_title: string | null;
    whats_inside: string[];
    helps_you_do: string[];
    method_evidence: string[];
    requirements: string[] | null;
    access_process: string[];
    access_process_detail: unknown;
    help_card: { title: string; text: string; button: string } | null;
    chat_widget: unknown;
    meta_strip: Pair[];
    footnote: string | null;
    faqs: Faq[];
}

/* --- implementation-pack (IMP) ------------------------------------------ */
export interface ImplementationPackAttributes {
    hero_icon: string;
    eyebrow: string | null;
    hero_meta: string[][];
    tags: string[];
    hero_visual: {
        kind: string;
        panel_title?: string;
        description?: string;
        columns?: string[][];
        kpis?: string[][];
        charts?: string[];
        boxes?: Record<string, string[]>;
        nodes_left?: string[];
        nodes_right?: string[];
    };
    tabs: string[];
    overview: string;
    key_outcomes: string[];
    whats_included: string[] | null;
    deliverables_checklist: { title: string; items: string[] } | null;
    process_steps: { title: string; steps: string[] } | null;
    what_we_need: string[];
    optional_addons: string[];
    exclusions: string[] | null;
    why_tbca: { left_header: string; right_header: string; rows: Pair[] };
    footer_badges: string[];
    facts: Pair[];
    notes: string[];
    faqs: Faq[];
}

/* --- due-diligence-trust (DDT) ------------------------------------------ */
export interface DueDiligenceTrustAttributes {
    layout: 'A' | 'B' | 'C';
    display_code: string;
    subtitle: string;
    eyebrow: string;
    hero_icon: string;
    trust_chips: string[][];
    assurance_line: string[];
    tabs: string[];
    overview: string;
    whats_included: string[];
    key_outcomes: string[];
    why_clients_choose: { title: string; items: string[] };
    deliverables_checklist: { title: string; items: string[] };
    process: { title: string; steps: string[] };
    inputs_evidence: string[];
    inputs_evidence_note: string | null;
    delivery_turnaround: { lines: string[]; note?: string } | null;
    review_quality: string[];
    professional_boundary: string;
    security_privacy: string[];
    purchase_badges: string[];
    trusted_by: string[];
    facts: Pair[];
    price_note: string | null;
    sprint_code_line: string | null;
    fees_external_costs: { title: string; lines: Pair[]; note?: string } | null;
    trust_review_controls: string[] | null;
    coverage_limitations: string | string[] | null;
    why_not_free_ai: { title: string; items?: string[]; text?: string } | null;
    related_next: { title: string; items: string[]; style?: string } | null;
    section_numbering: string[] | null;
    footer_strip: Pair[] | null;
    footer_meta: string[] | null;
    faqs: Faq[];
}

/* --- digital-toolkit (TBCA-4B toolkit screens + TIS-DP-PG) -------------- */
export interface ToolkitItem {
    title: string;
    text?: string;
    swatches?: string[];
    items?: string[];
}

export interface ToolkitSection {
    heading: string;
    kind: 'cards' | 'chips' | 'checks' | 'stats' | 'steps' | 'pairs' | 'columns';
    items: (ToolkitItem | string | [string, string])[];
    intro?: string;
    tab?: 'included' | 'benefits' | 'process' | 'requirements' | 'specs' | 'use';
    tone?: 'dark' | 'light';
}

export interface ToolkitPreview {
    title: string;
    subtitle?: string;
    tiles: string[];
    kpis: [string, string, string][];
    charts: string[];
    footer_row: Pair[];
    note?: string;
}

export interface DigitalToolkitAttributes {
    layout: 'standard' | 'box' | 'sheet' | 'research';
    source_layout: string;
    breadcrumb: string[];
    badges: string[];
    title_main: string;
    title_variant: string | null;
    subtitle: string | null;
    tagline: string | null;
    hero_icon: string;
    hero_icon_caption: string | null;
    box_art: { brand?: string; title_lines?: string[]; subtitle?: string | null; tagline?: string | null } | null;
    meta_strip: string[];
    highlights: string[];
    hero_checks: string[];
    ideal_for_label: string;
    ideal_for: string[];
    preview: ToolkitPreview | null;
    tabs: string[];
    overview: string;
    key_outcomes: string[];
    included_heading: string;
    included: string[];
    checklist_heading: string | null;
    checklist: string[];
    inside: { heading: string; count: string | null; columns: { title: string; items: string[] }[]; plus_label: string | null; plus_row: string[] } | null;
    process_heading: string | null;
    process: string[];
    requirements: string[];
    assurance: ToolkitItem[];
    tech_specs: Pair[];
    quality: { heading: string; items: string[] } | null;
    promise: { title: string; text: string } | null;
    why_not_free_ai: { title: string; text: string } | null;
    why_tbca: string | null;
    governance_callout: { title: string; text: string } | null;
    quote: { text: string; attribution?: string } | null;
    cta_banner: { heading: string; text?: string; button?: string } | null;
    sections: ToolkitSection[];
    purchase: {
        heading: string;
        style: 'dark' | 'light';
        primary_cta: string;
        secondary_cta: string;
        trust_icons: string[];
        scope_prompt: string | null;
        scope_link: string | null;
        code_tag: string | null;
        price_note: string | null;
    };
    why_strip: Pair[];
    footer_items: string[];
    trust_strip: Pair[];
    meta_bar: Pair[];
    ask_widget: boolean;
    variant_of: string | null;
    best_for: string | null;
}

/* --- quote-route (QRA) --------------------------------------------------- */
export interface QuoteRouteAttributes {
    layout_variant: 'A' | 'B' | 'C';
    printed_code: string;
    price_note: string;
    audience_text: string;
    price_card: { label?: string; note?: string; tier_label_style?: string; primary_cta?: string; secondary_cta?: string };
    scope: string;
    included: string[];
    included_note: string | null;
    excluded: string[];
    client_inputs: string[];
    method: string;
    human_led: string[];
    ai_assisted: { intro?: string | null; items: string[] };
    deliverable: { text?: string | null; items?: string[]; format?: string | null };
    acceptance: string[];
    limitations: string[];
    external_requirements: Pair[];
    next_gate: { text: string; status: string };
    stop_position: { text: string; status: string };
    status_prefix: boolean;
    service_summary: Pair[];
    risk_style: 'orange-text' | 'yellow-pill' | 'plain-text';
    quote_basis: { title?: string; rows: Pair[]; note?: string };
    commercial_boundary: { title?: string; ledgers: [string, string, string][]; note?: string };
    notice_strip: string | null;
}

/* --- premium (PREM) ------------------------------------------------------ */
export interface PremiumPackageCard {
    title?: string;
    selected?: string;
    note?: string;
    primary_cta?: string;
    secondary_cta?: string;
}

export interface PremiumAttributes {
    layout_variant: 'X' | 'Y' | 'Z';
    hero_icon: string;
    hero_meta: string[];
    ideal_for: string[];
    tabs: string[];
    package_card: PremiumPackageCard;
    overview: string;
    key_completion_points: string[];
    whats_included_icons: string[];
    deliverables: { title?: string; note?: string | null; items: string[] };
    what_we_need: string[];
    process: { title?: string; steps: string[] };
    revisions: string | null;
    optional_addons: string[] | null;
    not_included: string[] | null;
    faqs: Pair[] | null;
    fact_strip: Pair[];
    extra: { category_line?: string; sub_label?: string; popular_badge?: string } | null;
}

/* --- premium-advisory-feeder (PAF) -------------------------------------- */
export interface PremiumFeederAttributes {
    layout_variant: 'A' | 'B' | 'C';
    hero_badge: string;
    hero_icon: string;
    hero_meta: string[];
    for_label: string | null;
    for_chips: string[];
    tabs: string[];
    package_card: PremiumPackageCard & {
        features_style?: 'sentence' | 'bullets';
        typical_delivery?: string | null;
        trust_icons?: string[] | null;
        note_outside_card?: boolean;
    };
    overview: string[] | string;
    whats_included_icons: string[];
    key_outcomes: string[];
    deliverables_checklist: { title?: string; items: string[] } | null;
    process: { title?: string; steps: string[] };
    what_we_need: string[];
    inputs_scope: { title?: string; rows: Pair[] } | null;
    delivery_revisions: { title?: string; rows: Pair[] } | null;
    exclusions: { title?: string; items: string[] } | null;
    optional_addons: { title?: string; items: string[] } | null;
    next_advisory_step: { title?: string; intro?: string | null; rows: string[][]; note?: string } | null;
    governance: { title?: string; items: string[] } | null;
    trust_bar: string[];
    extra: { category?: string; subcategory?: string } | null;
}
