/**
 * Allowance sizing maths (indicative only — never a capacity reservation).
 *
 *   baseline μ, σ  from historic monthly usage
 *   uplift m       = Σ demand-driver percentages
 *   P50            = μ × (1 + m);  σ' = σ × (1 + m)
 *   Pxx            = P50 + z(xx) × σ'      (z: P10 −1.2816, P20 −0.8416, P80 +0.8416, P90 +1.2816)
 *   recommended    = P50 rounded up to the next 5 hours
 *   confidence     = Φ((recommended − P50) / σ')   (share of months covered)
 *   overage risk   = 1 − confidence^6               (at least one month over in the next six)
 */

export interface SizingResult {
    mean: number;
    sd: number;
    uplift: number;
    p10: number;
    p20: number;
    p50: number;
    p80: number;
    p90: number;
    recommended: number;
    conservative: number;
    stretch: number;
    confidence: number;
    overageRisk: number;
    coverMonths: number;
}

function phi(x: number): number {
    // Abramowitz–Stegun approximation of the standard normal CDF.
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
}

export function coverage(allowance: number, p50: number, sd: number): number {
    if (sd <= 0) return allowance >= p50 ? 1 : 0;
    return phi((allowance - p50) / sd);
}

export function sizeAllowance(history: number[], upliftPct: number): SizingResult {
    const xs = history.filter((x) => Number.isFinite(x));
    const n = xs.length || 1;
    const mean = xs.reduce((s, x) => s + x, 0) / n;
    const variance = xs.length > 1 ? xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1) : (mean * 0.2) ** 2;
    const sd = Math.sqrt(variance);
    const m = upliftPct / 100;
    const p50 = Math.max(0, mean * (1 + m));
    const s = Math.max(0.5, sd * (1 + m));
    const round1 = (v: number) => Math.round(Math.max(0, v) * 10) / 10;
    const recommended = Math.max(5, Math.ceil(p50 / 5) * 5);
    const confidence = coverage(recommended, p50, s);

    return {
        mean: round1(mean),
        sd: round1(sd),
        uplift: upliftPct,
        p10: round1(p50 - 1.2816 * s),
        p20: round1(p50 - 0.8416 * s),
        p50: round1(p50),
        p80: round1(p50 + 0.8416 * s),
        p90: round1(p50 + 1.2816 * s),
        recommended,
        conservative: Math.max(5, recommended - 5),
        stretch: recommended + 10,
        confidence: Math.round(confidence * 100),
        overageRisk: Math.round((1 - confidence ** 6) * 100),
        coverMonths: Math.round(confidence * 100),
    };
}
