import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Briefcase, CircleCheck, Clock, Headphones, Rocket, ShieldCheck, Target, UserCheck, Users } from 'lucide-react';
import LibraryShell, { EntitlementSummary } from '@/Components/Products/Digital/LibraryShell';
import { Chip } from '@/Components/Products/Digital/Ui';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { DpEntitlement } from '@/Components/Products/Digital/types';

interface Service {
    key: string;
    kind: string;
    title: string;
    body: string;
    incl: number;
    term: string;
    slug: string | null;
    popular?: boolean;
    monthly?: boolean;
}

export default function NextSteps({
    entitlement: e,
    services,
    credit,
}: {
    entitlement: DpEntitlement;
    services: Service[];
    credit: { eligible: boolean; available: number; applied: number; balance: number; expires: string };
}) {
    const [picked, setPicked] = useState(services.find((s) => s.popular)?.key ?? services[0]?.key);
    const [applyCredit, setApplyCredit] = useState(true);
    const done = typeof window !== 'undefined' && window.location.search.includes('done=1');
    const chosen = services.find((s) => s.key === picked);

    return (
        <LibraryShell entitlement={e} title="Related Sprint / Advisory Conversion" crumb="Related Sprint / Advisory Conversion" description="Take your next step with expert-led support, implementation or custom advisory.">
            {done && <Notice tone="good" title="Conversion booked">Your Sprint / Advisory order is confirmed. Credit applied: {formatZar(credit.applied)}. Our team will contact you to schedule.</Notice>}
            <div className="grid gap-4 xl:grid-cols-[1fr_280px_260px]">
                <div className="min-w-0 space-y-4">
                    <EntitlementSummary
                        e={e}
                        extra={[
                            { label: 'Order Reference', value: e.orderReference },
                            { label: 'Purchased', value: e.purchasedAt },
                            { label: 'Entitlement Status', value: <span className="capitalize text-verified-700">{e.status}</span> },
                            { label: 'Current Version', value: e.currentVersion?.display },
                            { label: 'Library', value: <Link href={`/digital-products/library/${e.reference}`} className="font-semibold text-gold-700 underline">View in My Library</Link> },
                        ]}
                    />
                    <p className="flex gap-3 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-verified-800">
                        <ShieldCheck className="size-5" aria-hidden="true" />
                        <span><strong className="block">You have the tools — let's help you implement.</strong>These Sprints and Advisory services are designed to help you apply your {e.product.name} with expert support.</span>
                    </p>
                    <section>
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Recommended Next Steps</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {services.map((s) => (
                                <div key={s.key} className={cn('relative flex flex-col rounded-[8px] border bg-white p-3', picked === s.key ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                    {s.popular && <Chip tone="gold" className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Chip>}
                                    <p className="text-sm font-semibold text-ink-900">{s.kind}: {s.title}</p>
                                    <p className="mt-1 text-[0.6875rem] text-ink-600">{s.body}</p>
                                    <p className="mt-auto pt-3 text-sm font-bold">From {formatZar(s.incl)}{s.monthly && <span className="text-xs font-normal"> / month</span>}<span className="block text-[0.625rem] font-normal text-ink-500">(incl. VAT)</span></p>
                                    <button type="button" onClick={() => setPicked(s.key)} aria-pressed={picked === s.key} className="mt-2 h-8 rounded-[4px] bg-gold-500 text-[0.6875rem] font-semibold">
                                        {picked === s.key ? 'Selected ✓' : `Select ${s.kind}`}
                                    </button>
                                    {s.slug && <Link href={`/sprints/${s.slug}`} className="mt-1 text-center text-[0.6875rem] text-gold-700 underline">View {s.kind} Details</Link>}
                                    <p className="mt-1 text-[0.625rem] text-ink-500">{s.term}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs">
                        <label className="flex items-center gap-2 text-verified-800">
                            <input type="checkbox" className="accent-gold-600" checked={applyCredit && credit.eligible} disabled={!credit.eligible || credit.balance === 0} onChange={(ev) => setApplyCredit(ev.target.checked)} />
                            <span><strong className="block">Credit can be applied at checkout on eligible Sprints and Advisory services.</strong>Credit is non-transferable and expires on {credit.expires}.</span>
                        </label>
                        <button
                            type="button"
                            disabled={!chosen}
                            onClick={() => router.post(`/digital-products/library/${e.reference}/next-steps`, { service: picked ?? '', apply_credit: applyCredit })}
                            className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-verified-600 bg-white px-3 font-semibold"
                        >
                            Proceed to Checkout{applyCredit && credit.balance > 0 ? ' & Apply Credit' : ''} <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <section className="self-start rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                    <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Why Upgrade with TBCA?</h2>
                    {[[Target, 'Expert Implementation', 'We help you implement and adapt your plan to your business.'], [Clock, 'Save Time & Reduce Risk', 'Avoid costly mistakes and accelerate results.'], [Users, 'Custom to Your Needs', 'Flexible engagements tailored to your organisation.'], [UserCheck, 'Trusted Experts', 'TBCA professionals with real-world experience.']].map(([I, t, b]) => {
                        const Icon = I as typeof Target;
                        return <p key={t as string} className="mb-2.5 flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{t as string}</strong>{b as string}</span></p>;
                    })}
                </section>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Your Eligibility & Benefits</h2>
                        <LabelValues
                            rows={[
                                { label: 'Eligible for Credit', value: credit.eligible ? 'Yes' : 'No' },
                                { label: 'Available Credit', value: formatZar(credit.available) },
                                { label: 'Credit Applied', value: formatZar(credit.applied) },
                                { label: 'Credit Balance', value: formatZar(credit.balance), strong: true },
                                { label: 'Credit Expires', value: credit.expires },
                            ]}
                        />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">How credit works: 10% of your licence price, disclosed before you commit, usable once against eligible services for 12 months.</p>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-1 font-bold tracking-wide text-ink-900 uppercase">Need Help Choosing?</h2>
                        <p className="text-ink-600">Our advisors can help you select the right Sprint or Advisory service for your goals.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Advisor help for ${e.product.name}`, section: 'digital-products' })} className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 font-semibold">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to an Advisor
                        </button>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Your Current Product Value</h2>
                        {[`Complete ${e.product.name}`, 'Professional Structure & Guidance', 'Implementation Roadmap', 'Financial Planning Framework'].map((v) => <p key={v} className="mb-1 flex gap-1.5"><CircleCheck className="size-3.5 text-gold-600" aria-hidden="true" />{v}</p>)}
                        <Link href={`/digital-products/${e.product.slug}`} className="mt-1 inline-block font-semibold text-gold-700 underline">View Product Details →</Link>
                    </section>
                    <p className="flex items-center gap-1 text-[0.6875rem] text-ink-400"><Briefcase className="size-3" aria-hidden="true" /> <Rocket className="size-3" aria-hidden="true" /> Conversions are recorded against {e.reference}.</p>
                </div>
            </div>
        </LibraryShell>
    );
}

NextSteps.layout = null;
