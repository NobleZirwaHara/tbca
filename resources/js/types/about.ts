import type { LedgerCode } from '@/types';

/** current: evidence valid · review_due: evidence expires inside the review window · under_review: evidence expired, value withheld */
export type ClaimState = 'current' | 'review_due' | 'under_review';

export interface ClaimEvidenceItem {
    code: string;
    title: string;
    type: string;
    issuer: string;
    reference_no: string | null;
    as_at: string | null;
    expiry: string | null;
    expiry_status: 'current' | 'expiring_soon' | 'expired' | 'no_expiry';
    verification_url: string | null;
}

export interface ClaimPopoverContent {
    overview?: { title: string; body: string }[];
    metrics?: { value: string; label: string; caption: string | null }[];
    governance?: string[];
    policies?: string[];
    proof_points?: string[];
}

/** A published claim from the Claim Liability Register (App\Models\About\Claim::toPublic). */
export interface PublicClaim {
    id: number;
    code: string;
    key: string;
    statement: string;
    value: string | null;
    label: string | null;
    description: string | null;
    category: string;
    claim_type: string;
    ledger: LedgerCode;
    icon: string | null;
    state: ClaimState;
    as_at: string | null;
    expires: string | null;
    action: { label: string; href: string } | null;
    popover: ClaimPopoverContent | null;
    correction: { code: string; title: string; effective_at: string | null } | null;
    evidence: ClaimEvidenceItem[];
}

export interface PublicTestimonial {
    code: string;
    quote: string;
    name: string;
    role: string | null;
    company: string;
    industry: string | null;
    rating: number;
    ledger: LedgerCode;
    image: boolean;
    typicality: string;
}

export interface PublicInstitution {
    slug: string;
    name: string;
    acronym: string;
    ledger: LedgerCode;
    description: string;
    detail: string | null;
    color: string | null;
    review_due: boolean;
}

export interface PublicCorrection {
    code: string;
    date: string | null;
    claim: string;
    claim_type: string | null;
    affected_surface: string | null;
    previous_wording: string | null;
    corrected_position: string | null;
    reason: string | null;
    status: string;
    effective_at: string | null;
    last_verified_at: string | null;
}

export interface CardItem {
    title: string;
    body: string;
    icon: string;
    items?: string[];
    link?: { label: string; href: string };
    tone?: string;
}

export interface RoleSummary {
    code: string;
    slug: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
    experience_level: string | null;
    travel: string | null;
    reports_to: string | null;
    icon: string;
    posted_at: string | null;
    closes_at: string | null;
    is_open: boolean;
    skills?: string[];
}

export interface NewsCard {
    slug: string;
    kind: string;
    category: string;
    category_label: string;
    title: string;
    subtitle: string | null;
    icon: string | null;
    published_at: string | null;
}
