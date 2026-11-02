/* Countries tab (MP-COUNTRIES-1.0 prototype): props built by App\Support\CountryHub\CountryHub. */
import type { Country as IndCountry, CountryOption } from './industries';

export type { CountryOption };

/** One of the 54 activated countries with the Countries display fields (CountryHub::decorate). */
export interface HubCountry extends IndCountry {
    state: string;
    isBW: boolean;
    isZA: boolean;
    /** Sub-line under the country name (prototype csub). */
    sub: string;
    /** Evidence status for the control panel. */
    evidence: string;
    /** Last update date shown on the control panel. */
    updated: string;
}

/** Props every country page receives as `base`. */
export interface CountryBase {
    c: HubCountry;
    countries: CountryOption[];
    actDate: string;
}

/** Country Sprint card (CountryHub::card, prototype sprintCard). */
export interface HubSprint {
    code: string;
    name: string;
    type: string | null;
    pop: string | null;
    topic: string | null;
    topicLabel: string | null;
    /** Entry price in whole ZAR ex VAT, or null when not sold standalone. */
    ep: number | null;
    entry: string | null;
    tiers: string[];
    priced: boolean;
    inApp: boolean;
}

/** Sprint shelf (CountryHub::shelf, prototype sprintShelf). */
export interface HubShelf {
    title: string;
    topics: string[];
    items: HubSprint[];
    total: number;
}

/** A register row: column header => value. */
export type Row = Record<string, string | number | null>;
