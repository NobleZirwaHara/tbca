import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock, Gauge, ShieldCheck, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { PageTitle, Notice, LabelValues } from '@/Components/Products/Shared';
import { Field, Input, Select } from '@/Components/ui/Form';
import { usePrice } from '@/lib/money';
import type { RetDriver, RetService } from '@/Components/Products/Retainers/types';
import { DriverPanel, BandPanel } from '@/Components/Products/Retainers/SizingPanels';
import { sizeAllowance, coverage } from '@/Components/Products/Retainers/sizing';
import { StatTile } from '@/Components/Products/Retainers/ui';

const VARIABILITY: Record<string, number> = { Low: 0.1, Moderate: 0.25, High: 0.4 };

function baseline(drivers: Record<string, RetDriver>): Record<string, string> {
    return Object.fromEntries(Object.entries(drivers).map(([k, d]) => [k, Object.keys(d.options).find((o) => d.options[o] === 0) ?? Object.keys(d.options)[0]]));
}

export default function Sizing({ services, drivers, service }: { services: RetService[]; drivers: Record<string, RetDriver>; service: string | null }) {
    const price = usePrice();
    const [slug, setSlug] = useState(service ?? services[0]?.slug ?? '');
    const [avg, setAvg] = useState('18');
    const [variability, setVariability] = useState('Moderate');
    const [values, setValues] = useState(() => baseline(drivers));
    const [chosen, setChosen] = useState<number | null>(null);
    const [custom, setCustom] = useState('');

    const svc = services.find((s) => s.slug === slug);
    const mean = Math.max(0, Number(avg) || 0);
    const v = VARIABILITY[variability];
    // Synthetic 12-month history from the average and variability (stated assumption, shown to the user).
    const history = Array.from({ length: 12 }, (_, i) => mean * (1 + v * Math.sin((i / 12) * Math.PI * 2) * 1.4));
    const uplift = Object.entries(values).reduce((s, [k, o]) => s + (drivers[k]?.options[o] ?? 0), 0);
    const r = sizeAllowance(history, uplift);
    const allowance = Number(custom) > 0 ? Number(custom) : (chosen ?? r.recommended);
    const s = Math.max(0.5, r.sd * (1 + uplift / 100));
    const cover = Math.round(coverage(allowance, r.p50, s) * 100);
    const basis = svc && svc.allowance_qty > 0 ? svc.price_zar / svc.allowance_qty : 0;
    const fee = Math.round((basis * allowance) / 500) * 500;
    const expectedOver = Math.max(0, r.p50 - allowance);

    return (
        <>
            <Head title="Allowance Sizing Tool" />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: 'Allowance Sizing Tool' }]}
                title="Allowance Sizing Tool"
                chips={<span className="rounded-full bg-referenced-50 px-2 py-0.5 text-[0.6875rem] font-bold text-referenced-700">BETA</span>}
                lead="Estimate your recurring need and the right allowance size. This is indicative only — it does not reserve capacity or create a commitment."
            />
            <div className="container-tbca space-y-5 py-8">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile icon={Clock} tone="purple" label="Recommended Allowance" value={r.recommended} unit="Hours / month" />
                    <StatTile icon={ShieldCheck} tone="purple" label="Confidence Level" value={`${r.confidence}%`} caption="Share of months covered" />
                    <StatTile icon={TrendingUp} tone="good" label="Forecast Monthly Need" value={r.p50} unit="Hours (P50)" />
                    <StatTile icon={AlertTriangle} tone="bad" label="Risk of Overage (Next 6m)" value={`${r.overageRisk}%`} caption={`With ${r.recommended} hours`} />
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <section className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-referenced-700">Your Requirement</h2>
                        <Field label="Retainer service">
                            {(id) => <Select id={id} value={slug} onChange={(e) => setSlug(e.target.value)} options={services.map((x) => ({ value: x.slug, label: x.name }))} />}
                        </Field>
                        <Field label="Typical adviser hours needed per month" hint="Your best estimate from recent months.">
                            {(id) => <Input id={id} type="number" min={1} max={200} value={avg} onChange={(e) => setAvg(e.target.value)} />}
                        </Field>
                        <Field label="Month-to-month variability">
                            {(id) => <Select id={id} value={variability} onChange={(e) => setVariability(e.target.value)} options={Object.keys(VARIABILITY)} />}
                        </Field>
                        <Notice tone="purple" icon={Info}>
                            Range P10–P90: {r.p10} – {r.p90} hours / month.
                        </Notice>
                    </section>
                    <DriverPanel drivers={drivers} values={values} onChange={(k, o) => setValues({ ...values, [k]: o })} onReset={() => setValues(baseline(drivers))} />
                    <BandPanel result={r} chosen={allowance} onChoose={(h) => { setChosen(h); setCustom(''); }} custom={custom} onCustom={setCustom} />
                </div>

                <section className="grid gap-5 rounded-[8px] border border-parchment-400 bg-white p-5 md:grid-cols-[1fr_320px]">
                    <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                            <Gauge className="size-4 text-gold-600" aria-hidden="true" /> Indicative outcome at {allowance} hours / month
                        </h2>
                        <LabelValues
                            className="mt-3"
                            rows={[
                                { label: 'Months fully covered', value: `${cover}%` },
                                { label: 'Expected monthly shortfall at forecast', value: expectedOver > 0 ? `${expectedOver.toFixed(1)} hours (needs prior overage approval)` : 'None expected' },
                                { label: 'Indicative monthly fee (excl. VAT)', value: svc ? price(fee) : '—' },
                                { label: 'Unused allowance treatment', value: 'Up to 25% capped roll-forward, one period only' },
                            ]}
                        />
                        <p className="mt-3 text-xs text-ink-500">
                            Method: forecast = average × (1 + demand drivers); range uses your variability; recommended = forecast rounded up to the next 5 hours. Final allowance and price are confirmed in a proposal after the C1–C5 capacity test.
                        </p>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                        {svc && (
                            <Link href={`/retainers/${svc.slug}/exclusions?allowance=${allowance}`} className="flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Build My Requirement <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        )}
                        <Link href="/retainers/compare" className="flex h-11 items-center justify-center rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                            Compare with Subscription / Per-Use
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
