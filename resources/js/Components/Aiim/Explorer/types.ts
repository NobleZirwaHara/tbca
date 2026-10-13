/* AIIM country explorer: props built by App\Support\Aiim\CountryIntel. */

export type Labels = Record<string, string>;
export type Position = [number, number];
export type PolygonCoords = Position[][];

export interface Geometry {
    type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'MultiLineString' | 'Point';
    coordinates: unknown;
}

export interface AdminUnitNode {
    id: number;
    parentId: number | null;
    level: number;
    levelKey: 'region' | 'district' | 'city' | 'municipality' | 'town';
    kind: string | null;
    name: string;
    labels: Labels;
    slug: string;
    population: number | null;
    populationSource: string | null;
    lat: number | null;
    lon: number | null;
    placeholder: boolean;
    source: string | null;
    provinceSlug: string | null;
    tags: string | null;
    projects: number;
    opportunities: number;
}

export interface MapFeatureItem {
    id: string;
    layer: string;
    name: string;
    labels: Labels;
    lat: number;
    lon: number;
    placeholder: boolean;
    status: string | null;
    sectorCode: string | null;
    unitId: number | null;
    note: string | null;
    place: string | null;
    source: string | null;
}

export interface CoreLayer {
    key: string;
    label: string;
    labels: Labels;
    geometry: string;
    levels: string;
    color: string;
    count: number;
}

export interface SectorLayerGroup {
    code: string;
    name: string;
    color: string;
    icon: string;
    records: number;
    layers: { key: string; label: string; labels: Labels; asset: string | null; geometry: string; levels: string; security: string }[];
}

export interface ScreenedProject {
    code: string;
    slug: string;
    name: string;
    kind: string;
    status: 'QUALIFIED' | 'WATCHLIST' | 'NOT QUALIFIED';
    statusLabel: string;
    sector: string | null;
    sectorCode: string | null;
    location: string | null;
    unitId: number | null;
    lat: number | null;
    lon: number | null;
    placeholder: boolean;
    capexZar: number | null;
    npvZar: number | null;
    currency: string;
    capexM: number | null;
    npvM: number | null;
    projectIrr: number | null;
    equityIrr: number | null;
    roi: number | null;
    ebitdaMarginY5: number | null;
    paybackYrs: number | null;
    wacc: number | null;
    failedTests: string[];
    hurdlesPassed: number | null;
    priceUplift: number | null;
    capexCut: number | null;
    sourceDocument: string | null;
    sourceEnvelope: string | null;
    fxZarPerUsd: number | null;
    locationFields: Record<string, string | null> | null;
    href: string | null;
}

export interface OpportunityRecord {
    code: string;
    kind: 'template' | 'anchor' | 'sweep' | 'instance';
    sectorCode: string;
    title: string;
    asset: string | null;
    trigger: string | null;
    placement: string | null;
    model: string | null;
    band: string | null;
    tier: string | null;
    score: number | null;
    persona: string | null;
    citizenReserved: string | null;
    fxEarner: string | null;
    timeToRevenue: string | null;
    place: string | null;
    unitId: number | null;
    lat: number | null;
    lon: number | null;
    status: string | null;
}

export interface SectorCode {
    code: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
}

export interface Question {
    code: string | null;
    position: number;
    question: string;
    info: string | null;
    tag: string | null;
    map: string | null;
    anchor: string | null;
    institution: string | null;
    evidence: string | null;
}

export interface QuestionSet {
    investor: Question[];
    trader: Question[];
}

export interface CountryPackData {
    code: string;
    title: string;
    issued: string | null;
    summary: { measure: string; value: string | number }[];
    macro: { id: string; item: string; value: string; source: string; date: string; url: string | null; grade: number | null }[];
    products: { group: string; product: string; setswana: string | null; hs: string | null; sector_code: string; note: string | null }[];
    institutions: { role: string; institution: string }[];
    oneStopShop: { code: string; feature: string; problem: string; how: string; gate: string }[];
    sectors: {
        code: string; number: number; name: string; investor: string | null; trader: string | null;
        facts: { id: string; fact: string; value: string; source: string; date: string; url: string | null; grade: number | null }[];
        mapStack: { layer: string; levels: string; geometry: string; illumination: string }[];
    }[];
    top: { rank: number; code: string; sector_code: string; title: string; band: string; score: number; tier: string; robust: string | null; citizen_reserved: string | null; fx_earner: string | null; persona: string | null; time_to_revenue: string | null; best_place: string | null }[];
    benchmark: Record<string, string>[];
    rollout: { wave: string; countries: string; note: string }[];
    fxNote: string | null;
    source: string | null;
}

export interface CountryIntel {
    coverage: {
        units: number;
        levels: Record<string, number>;
        projects: number;
        screened: number;
        provinceProjects: number;
        opportunities: number;
        features: number;
        africaTemplates: number;
        hasPack: boolean;
    };
    units: AdminUnitNode[];
    map: {
        outline: PolygonCoords[];
        areas: { code: string; name: string; unitId: number | null; geometry: Geometry }[];
        lines: { roads: Geometry[]; rail: Geometry[]; rivers: Geometry[] };
        features: MapFeatureItem[];
        layers: { core: CoreLayer[]; sectors: SectorLayerGroup[] };
        depths: { level: number; key: string; label: string }[];
        labelLanguages: string[];
    };
    projects: ScreenedProject[];
    hurdles: { key: string; label: string; threshold: string }[];
    fxZarPerUsd: number;
    opportunities: OpportunityRecord[];
    sectorCodes: SectorCode[];
    questions: QuestionSet & { sectors: Record<string, { country: QuestionSet; model: QuestionSet }> };
    pack: CountryPackData | null;
}

export interface CountryActivation {
    auRegion: string | null;
    wave: string | null;
    packStatus: string | null;
    packCode: string | null;
}

export const LANGUAGE_NAMES: Record<string, string> = { en: 'English', tn: 'Setswana' };

export function label(item: { name?: string; label?: string; labels?: Labels }, lang: string): string {
    return item.labels?.[lang] || item.name || item.label || '';
}
