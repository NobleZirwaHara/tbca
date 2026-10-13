import { Link } from '@inertiajs/react';
import { CheckCircle2, MapPin, XCircle } from 'lucide-react';
import { usePrice } from '@/lib/money';
import { compactIn, useCompactPrice } from './money';
import { pct, PlaceholderNote, StatusChip } from './shared';
import type { ScreenedProject } from './types';

const HURDLES: [string, string, (s: ScreenedProject) => number | null][] = [
    ['IRR', 'Project IRR above 18%', (s) => s.projectIrr],
    ['NPV', 'NPV above zero at the country WACC', (s) => s.npvM],
    ['ROI', 'ROI above 22%', (s) => s.roi],
    ['EBITDA', 'EBITDA margin in year 5 above 25%', (s) => s.ebitdaMarginY5],
];

/** Screening results block for a TBCA investor project brief (opportunity and project pages). */
export default function ScreeningPanel({ s, countrySlug }: { s: ScreenedProject; countrySlug: string }) {
    const price = usePrice('Not stated');
    const compact = useCompactPrice();
    const loc = s.locationFields ?? {};
    const levels: [string, string | null | undefined][] = [['Region', loc.region], ['District', loc.district], ['City', loc.city], ['Municipality', loc.municipality], ['Town or site', loc.town]];

    return (
        <section className="mb-4 rounded-[10px] border border-parchment-400 bg-white p-4" aria-labelledby="screening-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="screening-heading" className="text-sm font-semibold text-ink-900">Screening results against the TBCA hurdles</h2>
                <StatusChip project={s} />
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
                <dl className="grid grid-cols-2 gap-3 text-xs lg:col-span-2">
                    <div><dt className="text-ink-500">Capital cost</dt><dd className="text-base font-bold text-ink-900">{price(s.capexZar)}</dd>{s.currency !== 'ZAR' && s.capexM !== null && <dd className="text-[0.65rem] text-ink-500">Brief: {compactIn(s.capexM * 1e6, s.currency)}, converted at R{s.fxZarPerUsd} per US$</dd>}</div>
                    <div><dt className="text-ink-500">NPV at country WACC ({pct(s.wacc)})</dt><dd className="text-base font-bold text-ink-900">{compact(s.npvZar)}</dd></div>
                    <div><dt className="text-ink-500">Project IRR / equity IRR</dt><dd className="text-base font-bold text-ink-900">{pct(s.projectIrr)} / {pct(s.equityIrr)}</dd></div>
                    <div><dt className="text-ink-500">Payback</dt><dd className="text-base font-bold text-ink-900">{s.paybackYrs ? `${s.paybackYrs} years` : 'Not within the model horizon'}</dd></div>
                    <div className="col-span-2">
                        <dt className="mb-1 text-ink-500">Hurdles</dt>
                        <dd>
                            <ul className="grid gap-1 sm:grid-cols-2">
                                {HURDLES.map(([key, text, get]) => {
                                    const v = get(s);
                                    const fail = s.failedTests.includes(key);
                                    return (
                                        <li key={key} className="flex items-center gap-1.5">
                                            {fail ? <XCircle className="size-4 text-risk-500" /> : <CheckCircle2 className="size-4 text-verified-500" />}
                                            <span>{text}: <strong>{key === 'NPV' ? compact(s.npvZar) : pct(v)}</strong>{fail ? ' (fails)' : ''}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                            {(s.priceUplift || s.capexCut) && <p className="mt-1 text-attested-700">Would qualify with {[s.priceUplift && `a ${s.priceUplift}% price uplift`, s.capexCut && `a ${s.capexCut}% capex cut`].filter(Boolean).join(' or ')}.</p>}
                        </dd>
                    </div>
                </dl>
                <div className="text-xs">
                    <p className="mb-1 flex items-center gap-1 font-semibold text-ink-900"><MapPin className="size-3.5 text-gold-600" />Location</p>
                    <dl className="space-y-0.5">
                        {levels.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className={v && v.includes('TBC') ? 'text-attested-700' : 'text-ink-900'}>{v ?? 'Not stated'}</dd></div>
                        ))}
                        <div className="flex justify-between gap-2"><dt className="text-ink-500">Coordinates</dt><dd>{s.lat !== null ? `${s.lat}, ${s.lon}` : 'Not set'}</dd></div>
                    </dl>
                    {s.placeholder && <PlaceholderNote className="mt-1" />}
                    <Link href={`/aiim/country/${countrySlug}?tab=map`} className="mt-2 inline-flex text-gold-700 hover:underline">See it on the country map</Link>
                    {s.sourceDocument && <p className="mt-2 text-[0.65rem] text-ink-500">Source document: {s.sourceDocument}{s.sourceEnvelope ? `. Programme envelope: ${s.sourceEnvelope}.` : ''}</p>}
                </div>
            </div>
        </section>
    );
}
