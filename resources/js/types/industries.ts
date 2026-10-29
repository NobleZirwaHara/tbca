/* Industries tab (MP-INDUSTRIES-1.0 prototype) payloads. */

export interface SubIndustry {
    code: string;
    name: string;
    desc: string;
    aiim: string[];
    hs: number[];
}

export interface IndustryStats {
    mapped: number;
    core: number;
    sellable: number;
    blocked: number;
    approved: number;
    diagnostics: number;
    cx: Record<string, number>;
}

export interface Industry {
    code: string;
    number: number;
    slug: string;
    name: string;
    short: string;
    desc: string;
    w: Record<string, number>;
    cx: number;
    cxName: string;
    reg: string;
    gate: string;
    aiim: string[];
    hs: number[];
    stats: IndustryStats;
    cat: string;
    variant: string;
    subs: SubIndustry[];
}

export interface IndustryOption {
    code: string;
    slug: string;
    name: string;
}

export interface CountryOption {
    iso3: string;
    iso2: string;
    slug: string;
    name: string;
    region: string;
}

export interface Country extends CountryOption {
    wave: string | null;
    pack: string | null;
    packStatus: string | null;
    capital: string | null;
    currency: string | null;
    languages: string | null;
    pop: number | null;
    gdp: number | null;
    landlocked: boolean;
    recs: string | null;
    rcs: number;
    vat: number | null;
}

export interface EngagementBar {
    ref: string;
    industry: string;
    country: string;
    iso2: string;
    sprint: string;
    tier: string;
    gates: number;
    aborted: boolean;
}

export interface IndustryBase {
    ind: Industry;
    ctx: { sub: SubIndustry | null; country: Country; score: number; rank: number };
    industries: IndustryOption[];
    countries: CountryOption[];
    engagement: EngagementBar | null;
}

export interface SprintCardData {
    code: string;
    name: string;
    type: string | null;
    fam: string;
    family: string;
    cx: number;
    cxName: string;
    ep: number | null;
    entry: string | null;
    tiers: string[];
    block: { type: string; reason: string } | null;
    priced: boolean;
    inApp: boolean;
}

export type Row = Record<string, unknown>;

export interface ServerTableData<T = Row> {
    rows: T[];
    total: number;
    count: number;
    page: number;
    pages: number;
    size: number;
    q: string;
    f: Record<string, string>;
    sort: number | null;
    dir: number;
    options: Record<string, string[]>;
}

export interface AddOn {
    id: string;
    name: string;
    purpose: string;
    ledger: 'T' | 'P' | 'X' | 'S';
    fee: number | null;
    basis: string;
    req: boolean;
}

export interface LedgerRow {
    at: string;
    type: string;
    led: string;
    desc: string;
    amt: number;
    status: string;
}

export interface Engagement {
    ref: string;
    ind: string;
    sub: string;
    iso: string;
    code: string;
    name: string;
    tier: string;
    price: number;
    addons: AddOn[];
    gates: Record<string, string>;
    pays: { at: string; m: string; who: string; amt: number }[];
    ledger: LedgerRow[];
    created: string;
    tasks: { id: string; t: string; due: string; who: string; done: boolean }[];
    partner: { cat: string; at: string } | null;
    reviews: Record<string, string>;
    aborted: boolean;
    splits: { m: string; who: string; pct: number }[] | null;
    reg: { n: string; o: string; e: string } | null;
    letter: string | null;
}

export interface Totals {
    t: number;
    p: number;
    vat: number;
    total: number;
    paid: number;
    out: number;
}

export interface Regulator {
    name: string;
    type: string;
    what: string;
    time: string;
    src: string;
    status: string;
}
