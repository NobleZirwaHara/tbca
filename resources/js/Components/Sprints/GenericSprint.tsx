import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    ChevronRight,
    CircleCheck,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Headphones,
    Mail,
    MessageCircle,
    Phone,
    ShieldCheck,
    Star,
    TriangleAlert,
    Upload,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import Icon from '@/Components/ui/Icon';
import { Tabs } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import { formatZar, usePrice } from '@/lib/money';
import type { SharedProps, SprintRecord } from '@/types';
import type { GenericAttributes, Pricing, SprintMeta } from '@/types/sprints';
import CatalogueCard from './CatalogueCard';
import { BookCallModal, Box, CheckList, ClientsStrip, DetailHero, OrderSummaryCard, PackageChooser, type Pkg } from './DetailParts';
import { computeTotals, RECURRING_LABEL } from './lib';

export interface GenericSprintProps {
    sprint: SprintRecord;
    related: SprintRecord[];
    tab: string;
    selectedPackage: string | null;
    selectedAddons: string[];
    pricing: Pricing;
    meta: SprintMeta;
}

const TABS: { key: string; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'packages', label: 'Packages' },
    { key: 'whats-included', label: "What's Included" },
    { key: 'inputs-required', label: 'Inputs Required' },
    { key: 'process', label: 'Process' },
    { key: 'deliverables', label: 'Deliverables' },
    { key: 'risk-review', label: 'Risk & Review' },
    { key: 'add-ons', label: 'Add-ons' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'faqs', label: 'FAQs' },
    { key: 'support', label: 'Support' },
];

/** Tabs that belong to the package-specific order journey: they show the order summary instead of the package chooser. */
const ORDER_STEPS: Record<string, { title: string; icon: string; back?: string; backLabel?: string }> = {
    'inputs-required': { title: 'Inputs Required', icon: 'folder', back: 'packages', backLabel: 'Back to Packages' },
    'add-ons': { title: 'Add-ons', icon: 'layers', back: 'inputs-required', backLabel: 'Back to Inputs Required' },
    'risk-review': { title: 'Risk & Review', icon: 'shield-check', back: 'add-ons', backLabel: 'Back to Add-ons' },
    support: { title: 'Support', icon: 'life-buoy', back: 'risk-review', backLabel: 'Back to Risk & Review' },
    'ask-a-question': { title: 'Ask a Question', icon: 'message-circle', back: 'overview', backLabel: 'Back to Sprint' },
};

/**
 * Generic sprint template (Explore Sprints customer journey). Every section is
 * driven by sprint.attributes; sections without data are skipped.
 */
export default function GenericSprint({ sprint, related, tab: initialTab, selectedPackage, selectedAddons, pricing, meta }: GenericSprintProps) {
    const a = (sprint.attributes ?? {}) as GenericAttributes;
    const packages = meta.packages as Pkg[];
    const [tab, setTab] = useState(TABS.some((t) => t.key === initialTab) || initialTab === 'ask-a-question' ? initialTab : 'overview');
    const [pkgKey, setPkgKey] = useState<string | null>(selectedPackage ?? packages[0]?.key ?? null);
    const [addonKeys, setAddonKeys] = useState<string[]>(selectedAddons);
    const [terms, setTerms] = useState(false);
    const [booking, setBooking] = useState(false);

    const quote = sprint.commercial_act === 'quote' || packages.length === 0;
    const recurringLabel = sprint.commercial_act === 'subscription' || sprint.commercial_act === 'retainer' ? RECURRING_LABEL[a.billing_period ?? 'month'] : null;
    const pkg = packages.find((p) => p.key === pkgKey) ?? packages[0] ?? null;
    const addons = (a.addons ?? []).filter((x) => addonKeys.includes(x.key));
    const totals = computeTotals(pkg, addons, pricing);
    const step = ORDER_STEPS[tab];
    const base = `/sprints/${sprint.slug}`;

    function go(next: string) {
        setTab(next);
        router.get(next === 'overview' ? base : `${base}/${next}`, pkg ? { package: pkg.key } : {}, { preserveState: true, preserveScroll: true, replace: true });
        if (ORDER_STEPS[next]) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function order() {
        if (quote) {
            router.visit(`${base}/quote${pkg ? `?package=${pkg.key}` : ''}`);
            return;
        }
        const q = new URLSearchParams({ package: pkg?.key ?? '' });
        if (addonKeys.length) q.set('addons', addonKeys.join(','));
        if (terms) q.set('terms', '1');
        router.visit(`${base}/order?${q.toString()}`);
    }

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Sprints', href: '/sprints' },
        { label: sprint.title, href: base },
        ...(tab !== 'overview' ? [{ label: step && pkg ? `${step.title} (${pkg.name} Package)` : (TABS.find((t) => t.key === tab)?.label ?? '') }] : []),
    ];

    const features = pkg?.features ?? a.outcomes ?? [];

    return (
        <>
            <Head title={step ? `${step.title} – ${sprint.title}` : sprint.title} />

            {/* The sprint hero is identical on every tab; only the tab content below changes. */}
            <DetailHero
                crumbs={crumbs}
                icon={a.icon ?? 'briefcase'}
                art={{ seed: sprint.slug, category: sprint.category }}
                title={sprint.title}
                summary={sprint.summary}
                rating={sprint.rating}
                reviews={a.reviews_data?.count ?? a.reviews}
                delivery={sprint.delivery}
                idealFor={a.ideal_for}
            />

            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Sidebar first on mobile so the package choice is visible early; floats up into the hero on desktop. */}
                    <aside className="order-first pt-6 lg:order-last lg:-mt-56 lg:pt-0">
                        <div className="lg:sticky lg:top-24">
                            {step && !quote ? (
                                <OrderSummaryCard
                                    pkg={pkg}
                                    features={features}
                                    addons={addons}
                                    totals={totals}
                                    recurringLabel={recurringLabel}
                                    onEdit={() => go('packages')}
                                    primaryLabel={tab === 'ask-a-question' ? 'Pay Now' : 'Continue to Checkout'}
                                    primaryDisabled={tab === 'risk-review' && !terms}
                                    onPrimary={order}
                                    secondaryLabel={step.backLabel}
                                    onSecondary={() => step.back && go(step.back)}
                                />
                            ) : (
                                <PackageChooser
                                    packages={packages}
                                    value={pkg?.key ?? null}
                                    onChange={setPkgKey}
                                    onOrder={order}
                                    onBook={() => setBooking(true)}
                                    orderLabel={quote ? 'Request a Quote' : sprint.commercial_act === 'free' ? 'Start Free' : sprint.commercial_act === 'subscription' ? 'Subscribe' : 'Order Sprint'}
                                    recurringLabel={recurringLabel}
                                    quote={quote}
                                />
                            )}
                            {tab === 'risk-review' && (
                                <Box className="mt-4" title="Need to make a change?" subtitle="You can go back to:">
                                    {['inputs-required', 'add-ons'].map((k) => (
                                        <button key={k} type="button" onClick={() => go(k)} className="mt-2 flex w-full items-center justify-between rounded-[4px] border border-parchment-400 px-3 py-2 text-[0.8125rem] font-semibold text-ink-800 hover:border-gold-400">
                                            {ORDER_STEPS[k].title} <ArrowRight className="size-4" aria-hidden="true" />
                                        </button>
                                    ))}
                                </Box>
                            )}
                        </div>
                    </aside>

                    <div className="min-w-0 pt-2 lg:pt-4">
                        <Tabs tabs={TABS} value={tab === 'ask-a-question' ? 'support' : tab} onChange={go} className="bg-white" />
                        <div className="mt-5 space-y-5">
                            {step && pkg && (
                                <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <p className="text-[0.75rem] font-semibold tracking-wide text-gold-700 uppercase">{sprint.title}</p>
                                    <h2 className="mt-1 text-lg font-bold text-ink-900">{tab === 'ask-a-question' ? 'Ask a Question' : `${step.title} (${pkg.name} Package)`}</h2>
                                    <p className="mt-1 text-[0.8125rem] text-ink-600">{stepSummary(tab, sprint, a)}</p>
                                    <ul className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            { label: `Package: ${pkg.name}`, icon: 'layers' },
                                            { label: `Delivery: ${pkg.delivery ?? sprint.delivery ?? 'after scope'}`, icon: 'clock' },
                                            { label: `Format: ${a.format ?? 'Digital'}`, icon: 'file-text' },
                                            { label: 'Secure & Confidential', icon: 'shield-check' },
                                        ].map((c) => (
                                            <li key={c.label} className="inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-400 bg-parchment-50 px-2.5 py-1 text-[0.75rem] text-ink-700">
                                                <Icon name={c.icon} className="size-3.5 text-gold-600" />
                                                {c.label}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                            {tab === 'overview' && <OverviewTab sprint={sprint} a={a} onTab={go} />}
                            {tab === 'packages' && <PackagesTab packages={packages} a={a} value={pkg?.key ?? null} onChange={setPkgKey} onOrder={order} recurringLabel={recurringLabel} quote={quote} />}
                            {tab === 'whats-included' && <IncludedTab sprint={sprint} a={a} packages={packages} value={pkg?.key ?? null} onChange={setPkgKey} />}
                            {tab === 'inputs-required' && <InputsTab a={a} onUpload={order} />}
                            {tab === 'process' && <ProcessTab a={a} />}
                            {tab === 'deliverables' && <DeliverablesTab sprint={sprint} a={a} packages={packages} />}
                            {tab === 'risk-review' && <RiskTab sprint={sprint} a={a} pkg={pkg} addons={addons.map((x) => x.name)} terms={terms} onTerms={setTerms} />}
                            {tab === 'add-ons' && (
                                <AddonsTab a={a} selected={addonKeys} onToggle={(k) => setAddonKeys((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))} slug={sprint.slug} />
                            )}
                            {tab === 'reviews' && <ReviewsTab sprint={sprint} a={a} onBook={() => setBooking(true)} onAsk={() => go('ask-a-question')} />}
                            {tab === 'faqs' && <FaqsTab sprint={sprint} a={a} />}
                            {tab === 'support' && <SupportTab sprint={sprint} onAsk={() => go('ask-a-question')} onBook={() => setBooking(true)} delivery={pkg?.delivery ?? sprint.delivery} />}
                            {tab === 'ask-a-question' && <AskTab sprint={sprint} pkg={pkg} onFaqs={() => go('faqs')} />}

                            <ClientsStrip attrs={a} />

                            {related.length > 0 && (
                                <section aria-labelledby="related-heading">
                                    <div className="flex items-center justify-between">
                                        <h2 id="related-heading" className="text-lg font-bold text-ink-900">
                                            Related Sprints
                                        </h2>
                                        <Link href={meta.category_href} className="text-[0.8125rem] font-semibold text-gold-700">
                                            More in {meta.category_label} →
                                        </Link>
                                    </div>
                                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                                        {related.slice(0, 4).map((r) => (
                                            <CatalogueCard key={r.id} item={relatedCard(r)} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BookCallModal open={booking} onClose={() => setBooking(false)} topic={sprint.title} />
        </>
    );
}

function stepSummary(tab: string, sprint: SprintRecord, a: GenericAttributes): string {
    const topic = sprint.title.replace(/ Sprint$/, '').toLowerCase();
    switch (tab) {
        case 'inputs-required':
            return a.inputs_intro ?? `To deliver a world-class ${topic}, we need the following information and materials from you.`;
        case 'add-ons':
            return a.addons_intro ?? `Enhance your ${topic} with expert add-ons and custom deliverables.`;
        case 'risk-review':
            return 'Review key risks, quality assurance and terms before you proceed.';
        case 'support':
            return "We're here to ensure your sprint experience is smooth and successful.";
        default:
            return `Our experts are here to help you get the most out of your ${sprint.title}.`;
    }
}

function relatedCard(r: SprintRecord) {
    const ra = (r.attributes ?? {}) as GenericAttributes & { ideal_for?: unknown };
    const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    return {
        id: r.id,
        code: r.code,
        slug: r.slug,
        title: r.title,
        type: r.type,
        category: r.category,
        category_label: r.subcategory ?? r.category,
        summary: r.summary,
        price_zar: r.price_zar,
        price_display: (typeof ra.price_display === 'string' ? ra.price_display : null) as 'from' | null,
        delivery: r.delivery,
        commercial_act: r.commercial_act,
        rating: r.rating,
        reviews: typeof ra.reviews === 'number' ? ra.reviews : 0,
        badge: typeof ra.badge === 'string' ? ra.badge : null,
        icon: typeof ra.icon === 'string' ? ra.icon : 'briefcase',
        ideal_for: strings(ra.ideal_for).slice(0, 3),
        packages: (r.packages ?? []).map((p) => p.name),
        why: [],
        featured: r.featured,
        popular: r.popular,
        is_new: r.is_new,
        audience: [],
        match: false,
        recurring: null,
    };
}

/* ======================================================================= Tabs */

function OverviewTab({ sprint, a, onTab }: { sprint: SprintRecord; a: GenericAttributes; onTab: (t: string) => void }) {
    const checklist = a.checklist ?? (a.deliverables ?? []).map((d) => d.title);
    return (
        <>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
                <Box title="Overview">
                    <p className="text-[0.875rem] leading-relaxed text-ink-700">{sprint.description ?? sprint.summary}</p>
                    {a.included && a.included.length > 0 && (
                        <>
                            <h3 className="mt-5 font-bold text-ink-900">What&rsquo;s Included</h3>
                            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                                {a.included.slice(0, 6).map((i) => (
                                    <li key={i.title} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-2 text-[0.75rem] text-ink-700">
                                        <Icon name={i.icon ?? 'circle-check'} className="size-5 shrink-0 text-gold-600" />
                                        {i.title}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Box>
                {a.outcomes && (
                    <Box title="Key Outcomes" className="border-gold-300 bg-gold-50/50">
                        <CheckList items={a.outcomes} />
                    </Box>
                )}
            </div>
            {(checklist.length > 0 || a.process) && (
                <div className="grid gap-5 rounded-[8px] border border-gold-300 bg-gold-50/40 p-5 md:grid-cols-2">
                    {checklist.length > 0 && (
                        <div>
                            <h3 className="font-bold text-ink-900">Deliverables Checklist</h3>
                            <CheckList items={checklist} className="mt-3 grid gap-x-4 sm:grid-cols-2 [&>li]:mt-0" />
                        </div>
                    )}
                    {a.process && (
                        <div>
                            <h3 className="font-bold text-ink-900">{a.process.length}-Step TBCA Sprint Process</h3>
                            <ol className="mt-4 flex items-start justify-between gap-1">
                                {a.process.map((p, i) => (
                                    <li key={p.title} className="flex flex-1 flex-col items-center text-center">
                                        <span className="flex size-9 items-center justify-center rounded-full bg-gold-600 text-sm font-bold text-white">{i + 1}</span>
                                        <span className="mt-1.5 text-[0.6875rem] leading-tight text-ink-700">{p.title}</span>
                                    </li>
                                ))}
                            </ol>
                            <button type="button" onClick={() => onTab('process')} className="mt-3 text-[0.8125rem] font-semibold text-gold-700">
                                See the full process →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

function PackagesTab({ packages, a, value, onChange, onOrder, recurringLabel, quote }: { packages: Pkg[]; a: GenericAttributes; value: string | null; onChange: (k: string) => void; onOrder: () => void; recurringLabel: string | null; quote: boolean }) {
    const price = usePrice('On request');
    if (quote) {
        return (
            <Box title="Packages" subtitle="This Sprint is scoped to your project and priced on request.">
                <button type="button" onClick={onOrder} className="h-10 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">
                    Request a Quote
                </button>
            </Box>
        );
    }
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
            <Box title="Choose the Right Package" subtitle="Select the package that best matches your stage and needs.">
                <div className={cn('grid gap-3', packages.length >= 3 ? 'md:grid-cols-3' : packages.length === 2 ? 'md:grid-cols-2' : '')}>
                    {packages.map((p) => {
                        const selected = p.key === value;
                        return (
                            <div key={p.key} className={cn('relative flex flex-col rounded-[8px] border p-4', selected ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                {p.popular && <span className="absolute -top-2 right-3 rounded-[3px] bg-gold-500 px-1.5 text-[0.625rem] font-bold text-ink-900">Best Value</span>}
                                <button type="button" role="radio" aria-checked={selected} onClick={() => onChange(p.key)} className="flex items-start justify-between gap-2 text-left">
                                    <span className="flex items-center gap-2 font-bold text-ink-900">
                                        <span className={cn('flex size-4 items-center justify-center rounded-full border', selected ? 'border-gold-600' : 'border-ink-300')}>{selected && <span className="size-2 rounded-full bg-gold-600" />}</span>
                                        {p.name}
                                    </span>
                                    <span className="text-right">
                                        <span className="block font-bold text-ink-900">{p.zar === 0 ? 'Free' : price(p.zar)}</span>
                                        <span className="block text-[0.6875rem] text-ink-500">{recurringLabel ?? p.delivery}</span>
                                    </span>
                                </button>
                                {p.description && <p className="mt-2 text-[0.8125rem] text-ink-600">{p.description}</p>}
                                <CheckList items={p.features ?? []} className="mt-3" />
                                <button
                                    type="button"
                                    onClick={() => (selected ? onOrder() : onChange(p.key))}
                                    className={cn('mt-auto h-9 rounded-[4px] pt-0 text-[0.8125rem] font-semibold', 'mt-4', selected ? 'bg-gold-500 text-ink-900 hover:bg-gold-400' : 'border border-ink-300 text-ink-800 hover:border-ink-900')}
                                >
                                    {selected ? 'Order Sprint' : 'Select Package'}
                                </button>
                            </div>
                        );
                    })}
                </div>
                {a.comparison && packages.length === a.comparison[0]?.values.length && (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[520px] text-[0.8125rem]">
                            <caption className="mb-2 text-left font-bold text-ink-900">What&rsquo;s Included</caption>
                            <thead className="sr-only">
                                <tr>
                                    <th>Feature</th>
                                    {packages.map((p) => (
                                        <th key={p.key}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {a.comparison.map((row) => (
                                    <tr key={row.label}>
                                        <th className="py-1.5 pr-3 text-left font-normal text-ink-600">{row.label}</th>
                                        {row.values.map((v, i) => (
                                            <td key={i} className={cn('px-2 py-1.5 text-center text-ink-800', packages[i]?.key === value && 'bg-gold-50 font-semibold')}>
                                                {v}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Box>
            {a.package_guidance && (
                <Box title="Which package is best for you?">
                    <ul className="space-y-3">
                        {packages.map((p) =>
                            a.package_guidance?.[p.key] ? (
                                <li key={p.key}>
                                    <button type="button" onClick={() => onChange(p.key)} className={cn('w-full rounded-[6px] border p-3 text-left', p.key === value ? 'border-gold-400 bg-gold-50' : 'border-parchment-300')}>
                                        <span className="block text-[0.8125rem] font-semibold text-gold-700">{p.name}</span>
                                        <span className="mt-0.5 block text-[0.75rem] text-ink-600">{a.package_guidance[p.key]}</span>
                                    </button>
                                </li>
                            ) : null,
                        )}
                    </ul>
                </Box>
            )}
        </div>
    );
}

function IncludedTab({ sprint, a, packages, value, onChange }: { sprint: SprintRecord; a: GenericAttributes; packages: Pkg[]; value: string | null; onChange: (k: string) => void }) {
    return (
        <>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                <Box title="What's Included" subtitle={a.included_intro ?? `Everything included in the ${sprint.title}.`}>
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                        {(a.included ?? []).map((i) => (
                            <li key={i.title} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-2.5 text-[0.75rem] text-ink-700">
                                <Icon name={i.icon ?? 'circle-check'} className="size-5 shrink-0 text-gold-600" />
                                {i.title}
                            </li>
                        ))}
                    </ul>
                </Box>
                {a.outcomes && (
                    <Box title="Included Outcomes" className="border-gold-300 bg-gold-50/50">
                        <CheckList items={a.outcomes} />
                    </Box>
                )}
            </div>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                {a.scope && (
                    <Box title="Detailed Scope">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {a.scope.map((s) => (
                                <div key={s.title}>
                                    <p className="text-[0.8125rem] font-bold text-ink-900">{s.title}</p>
                                    <CheckList items={s.items} className="mt-2" />
                                </div>
                            ))}
                        </div>
                    </Box>
                )}
                {a.final_deliverables && (
                    <Box title="Final Deliverables" className="border-gold-300 bg-gold-50/50">
                        <CheckList items={a.final_deliverables} />
                    </Box>
                )}
            </div>
            {packages.length > 1 && (
                <Box title="Package Scope Comparison">
                    <div role="radiogroup" className="grid gap-3 md:grid-cols-3">
                        {packages.map((p) => (
                            <button key={p.key} type="button" role="radio" aria-checked={p.key === value} onClick={() => onChange(p.key)} className={cn('relative rounded-[6px] border p-3 text-left', p.key === value ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                {p.popular && <span className="absolute -top-2 right-2 rounded-[3px] bg-gold-500 px-1.5 text-[0.625rem] font-bold">Best Value</span>}
                                <span className="block text-sm font-semibold text-ink-900">{p.name}</span>
                                <span className="block text-[0.75rem] text-ink-600">{p.description}</span>
                            </button>
                        ))}
                    </div>
                </Box>
            )}
        </>
    );
}

function InputsTab({ a, onUpload }: { a: GenericAttributes; onUpload: () => void }) {
    const groups = a.inputs ?? [];
    const [ready, setReady] = useState<string[]>([]);
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    const toggle = (k: string) => setReady((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.875rem] text-ink-600">Please provide the information below. The more detailed your inputs, the stronger your result will be.</p>
                <span className="rounded-full bg-verified-50 px-3 py-1 text-[0.75rem] font-semibold text-verified-700">
                    {ready.length} of {total} inputs ready
                </span>
            </div>
            <a href="#inputs-guide" onClick={(e) => { e.preventDefault(); window.print(); }} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-controlled-700">
                <Download className="size-4" aria-hidden="true" /> Download Input Guide (PDF)
            </a>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {groups.map((g, gi) => (
                    <Box key={g.title} title={`${gi + 1}. ${g.title}`} className={cn(gi === 3 && 'xl:col-span-3 bg-gold-50/40')}>
                        <ul className={cn('space-y-2', gi === 3 && 'xl:grid xl:grid-cols-2 xl:gap-x-6 xl:space-y-0 xl:gap-y-2')}>
                            {g.items.map((item) => {
                                const k = `${gi}:${item}`;
                                return (
                                    <li key={item}>
                                        <Checkbox label={item} checked={ready.includes(k)} onChange={() => toggle(k)} className="text-[0.8125rem]" />
                                    </li>
                                );
                            })}
                        </ul>
                        <button type="button" onClick={onUpload} className="mt-4 flex w-full flex-col items-center rounded-[6px] border border-dashed border-parchment-500 p-3 text-[0.75rem] text-ink-500 hover:border-gold-500">
                            <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                                <Upload className="size-4" aria-hidden="true" /> Upload files
                            </span>
                            Attach documents on the order form, or later in your Client Portal
                        </button>
                    </Box>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Box title="What Happens Next?">
                    <ol className="space-y-3">
                        {[
                            ['We Receive Your Inputs', 'Once submitted, our team will review and confirm.'],
                            ['Research & Analysis', 'We conduct market, financial and strategic analysis.'],
                            ['Content Development', 'We craft your deliverables.'],
                            ['Review & Refinement', "You review and we refine until you're happy."],
                            ['Delivery', 'You receive your final outputs and materials.'],
                        ].map(([t, b], i) => (
                            <li key={t} className="flex gap-3">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-500 text-[0.75rem] font-bold text-white">{i + 1}</span>
                                <span>
                                    <span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span>
                                    <span className="block text-[0.75rem] text-ink-500">{b}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </Box>
                <Box title="Need Help?" subtitle="Not sure what to provide? Our team is here to help." className="bg-verified-50/50">
                    <WhatsAppLink label="Ask Our Experts on WhatsApp" />
                </Box>
            </div>
        </>
    );
}

function ProcessTab({ a }: { a: GenericAttributes }) {
    const steps = a.process ?? [];
    return (
        <Box title={`Our ${steps.length}-Step TBCA Sprint Process`} subtitle="A structured, expert-led process that delivers decision-ready results.">
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {steps.map((s, i) => (
                    <li key={s.title} className="flex flex-col rounded-[8px] border border-parchment-400 p-3">
                        <span className="mx-auto flex size-8 items-center justify-center rounded-full bg-gold-600 text-sm font-bold text-white">{i + 1}</span>
                        <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] font-bold text-ink-900">
                            <Icon name={s.icon ?? 'circle-check'} className="size-4 text-gold-600" />
                            {s.title}
                        </p>
                        <CheckList items={s.items} className="mt-2 [&>li]:text-[0.75rem]" />
                        {s.output && (
                            <p className="mt-auto rounded-[4px] bg-gold-50 p-2 pt-2 text-[0.75rem] text-ink-700">
                                <span className="font-semibold text-gold-800">Output:</span> {s.output}
                            </p>
                        )}
                    </li>
                ))}
            </ol>
            <div className="mt-4 flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50/50 p-4 md:flex-row md:items-center">
                <ShieldCheck className="size-8 shrink-0 text-gold-600" aria-hidden="true" />
                <div className="flex-1">
                    <p className="font-semibold text-ink-900">Human Review at Every Step</p>
                    <p className="text-[0.8125rem] text-ink-600">All outputs are reviewed by TBCA experts to ensure accuracy, quality and readiness.</p>
                </div>
                <ul className="flex flex-wrap gap-3 text-[0.75rem] text-ink-700">
                    {['Expert-Led', 'Data-Backed', 'Quality Assured', 'Secure Delivery'].map((t) => (
                        <li key={t} className="flex items-center gap-1">
                            <CircleCheck className="size-3.5 text-gold-600" aria-hidden="true" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </Box>
    );
}

function DeliverablesTab({ sprint, a, packages }: { sprint: SprintRecord; a: GenericAttributes; packages: Pkg[] }) {
    const price = usePrice('On request');
    return (
        <>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
                <Box title="Sprint Deliverables" subtitle={`This page shows the final outputs you will receive from the ${sprint.title}.`}>
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                        {(a.deliverables ?? []).map((d) => (
                            <li key={d.title} className="rounded-[6px] border border-parchment-400 p-3 text-center">
                                <Icon name={d.icon ?? 'file-text'} className="mx-auto size-7 text-gold-600" />
                                <p className="mt-2 text-[0.75rem] font-bold text-ink-900">{d.title}</p>
                                {d.body && <p className="mt-1 text-[0.6875rem] text-ink-500">{d.body}</p>}
                            </li>
                        ))}
                    </ul>
                </Box>
                {a.delivery_pack && (
                    <Box title="Final Delivery Pack" className="border-gold-300 bg-gold-50/50">
                        <CheckList items={a.delivery_pack} />
                    </Box>
                )}
            </div>
            {a.deliverable_groups && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {a.deliverable_groups.map((g) => (
                        <Box key={g.title} title={<span className="flex items-center gap-2"><Icon name={g.icon ?? 'file-text'} className="size-4 text-gold-600" />{g.title}</span>}>
                            <ul className="list-disc space-y-1 pl-4 text-[0.8125rem] text-ink-700">
                                {g.items.map((i) => (
                                    <li key={i}>{i}</li>
                                ))}
                            </ul>
                        </Box>
                    ))}
                </div>
            )}
            {a.delivery_standards && (
                <Box title="Delivery Standards – What You Receive">
                    <ul className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
                        {a.delivery_standards.map((d) => (
                            <li key={d.title} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-2.5">
                                <Icon name={d.icon ?? 'badge-check'} className="size-5 text-gold-600" />
                                <span>
                                    <span className="block text-[0.75rem] font-semibold text-ink-900">{d.title}</span>
                                    <span className="block text-[0.6875rem] text-ink-500">{d.body}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </Box>
            )}
            <div className="grid gap-5 xl:grid-cols-2">
                {a.comparison && packages.length === a.comparison[0]?.values.length && (
                    <Box title="Deliverables by Package">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-[0.75rem]">
                                <thead>
                                    <tr className="bg-ink-900 text-left text-parchment-100">
                                        <th className="p-2">Deliverable</th>
                                        {packages.map((p) => (
                                            <th key={p.key} className="p-2">
                                                {p.name} ({price(p.zar)})
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {a.comparison.map((r) => (
                                        <tr key={r.label}>
                                            <th className="p-2 text-left font-normal text-ink-600">{r.label}</th>
                                            {r.values.map((v, i) => (
                                                <td key={i} className="p-2 text-ink-800">
                                                    <CircleCheck className="mr-1 inline size-3.5 text-verified-500" aria-hidden="true" />
                                                    {v}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Box>
                )}
                {a.timeline && (
                    <Box title="Delivery Timeline – Handover Flow">
                        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {a.timeline.map((t, i) => (
                                <li key={t.title} className="text-center">
                                    <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-gold-500 text-[0.75rem] font-bold text-ink-900">{i + 1}</span>
                                    <p className="mt-1 text-[0.75rem] font-semibold text-ink-900">{t.title}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{t.body}</p>
                                    {t.duration && <p className="text-[0.6875rem] font-semibold text-gold-700">({t.duration})</p>}
                                </li>
                            ))}
                        </ol>
                    </Box>
                )}
            </div>
        </>
    );
}

function RiskTab({ sprint, a, pkg, addons, terms, onTerms }: { sprint: SprintRecord; a: GenericAttributes; pkg: Pkg | null; addons: string[]; terms: boolean; onTerms: (v: boolean) => void }) {
    const impactTone: Record<string, string> = { High: 'bg-risk-50 text-risk-700', Medium: 'bg-attested-50 text-attested-700', Low: 'bg-verified-50 text-verified-700' };
    const delivery = pkg?.delivery?.replace(' delivery', '') ?? sprint.delivery ?? 'the agreed timeline';
    const revisions = pkg?.features?.find((f) => /revision/i.test(f));
    const recurring = sprint.commercial_act === 'subscription' || sprint.commercial_act === 'retainer';
    const termsList = [
        ['Deliverables', `As outlined in the ${pkg?.name ?? 'selected'} package scope.`],
        ['Delivery Time', recurring ? 'Monthly service period, starting within 5 business days of payment.' : `${delivery} (business days) from receipt of all required inputs.`],
        ['Revisions', revisions ? `${revisions} included.` : 'As listed in the package comparison.'],
        ['Confidentiality', 'We treat your information with the highest level of confidentiality.'],
        ['Payment', recurring ? 'Billed in advance for each period until cancelled.' : 'Full payment required before sprint kickoff.'],
        ['Cancellation', recurring ? 'Cancel any time before the next billing date.' : 'Cancellations must be made within 24 hours of order placement.'],
    ];
    return (
        <div className="grid gap-5 xl:grid-cols-2">
            <Box title="1. Key Risks & Mitigations" subtitle="We proactively manage risks to ensure a high-quality deliverable.">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-[0.8125rem]">
                        <thead className="text-left text-[0.75rem] text-ink-500">
                            <tr>
                                <th className="py-1.5">Risk</th>
                                <th className="py-1.5">Impact</th>
                                <th className="py-1.5">Mitigation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parchment-300">
                            {(a.risks ?? []).map((r) => (
                                <tr key={r.risk}>
                                    <td className="py-2 pr-2 font-medium text-ink-900">
                                        <TriangleAlert className={cn('mr-1.5 inline size-4', r.impact === 'Low' ? 'text-verified-500' : r.impact === 'High' ? 'text-risk-500' : 'text-attested-500')} aria-hidden="true" />
                                        {r.risk}
                                    </td>
                                    <td className="py-2 pr-2">
                                        <span className={cn('rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold', impactTone[r.impact] ?? 'bg-parchment-300')}>{r.impact}</span>
                                    </td>
                                    <td className="py-2 text-ink-600">{r.mitigation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            <Box title="2. Quality Assurance Process" subtitle="Multi-step quality checks before delivery.">
                <ol className="space-y-3">
                    {(a.qa ?? []).map((q) => (
                        <li key={q.title} className="flex gap-3">
                            <Icon name={q.icon ?? 'circle-check'} className="mt-0.5 size-5 shrink-0 text-ink-700" />
                            <span>
                                <span className="block text-[0.8125rem] font-semibold text-ink-900">{q.title}</span>
                                <span className="block text-[0.75rem] text-ink-500">{q.body}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </Box>
            <Box title="3. Terms & Conditions Summary" subtitle="By proceeding, you agree to the following key terms.">
                <ul className="space-y-2">
                    {termsList.map(([k, v]) => (
                        <li key={k} className="flex gap-2 text-[0.8125rem] text-ink-700">
                            <FileText className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
                            <span>
                                <strong className="text-ink-900">{k}:</strong> {v}
                            </span>
                        </li>
                    ))}
                </ul>
                <Checkbox
                    className="mt-4"
                    checked={terms}
                    onChange={(e) => onTerms(e.target.checked)}
                    label={
                        <>
                            I have read and agree to the{' '}
                            <a href="/terms" className="font-semibold text-gold-700 underline">
                                Terms &amp; Conditions
                            </a>
                            .
                        </>
                    }
                />
            </Box>
            <Box title="4. Review Your Selections" subtitle="Please confirm your selections before proceeding.">
                <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
                    {[
                        ['Sprint', sprint.title],
                        ['Package', pkg?.name ?? '—'],
                        ['Delivery Time', delivery],
                        ['Format', a.format ?? 'Digital'],
                        ['Add-ons', addons.length ? addons.join(', ') : 'No add-ons selected'],
                    ].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] py-2">
                            <dt className="font-semibold text-ink-900">{k}</dt>
                            <dd className="text-ink-700">{v}</dd>
                        </div>
                    ))}
                </dl>
                <p className={cn('mt-3 rounded-[6px] p-3 text-[0.8125rem]', terms ? 'bg-verified-50 text-verified-700' : 'bg-gold-50 text-ink-700')}>
                    {terms ? "Everything looks good? You're ready to proceed to secure checkout." : 'Please accept the Terms & Conditions to continue to checkout.'}
                </p>
            </Box>
        </div>
    );
}

function AddonsTab({ a, selected, onToggle, slug }: { a: GenericAttributes; selected: string[]; onToggle: (k: string) => void; slug: string }) {
    const price = usePrice('On request');
    const [details, setDetails] = useState<string | null>(null);
    return (
        <>
            <Box title="Recommended Add-ons" subtitle="Select any add-ons below to tailor your Sprint to your unique needs.">
                <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(a.addons ?? []).map((x) => {
                        const on = selected.includes(x.key);
                        return (
                            <li key={x.key} className={cn('flex flex-col rounded-[8px] border p-3', on ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                <label className="flex cursor-pointer gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                                        <Icon name={x.icon ?? 'plus'} className="size-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] font-bold text-ink-900">
                                            {x.name}
                                            {x.tag && <span className="rounded-full bg-verified-50 px-1.5 text-[0.625rem] font-semibold text-verified-700">{x.tag}</span>}
                                        </span>
                                        <span className={cn('mt-0.5 block text-[0.75rem] text-ink-600', details !== x.key && 'line-clamp-2')}>{x.body}</span>
                                    </span>
                                    <input type="checkbox" checked={on} onChange={() => onToggle(x.key)} className="mt-1 size-4 accent-gold-600" aria-label={`Add ${x.name}`} />
                                </label>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="font-bold text-ink-900">{price(x.zar)}</span>
                                    <button type="button" onClick={() => setDetails(details === x.key ? null : x.key)} className="text-[0.75rem] font-semibold text-gold-700">
                                        {details === x.key ? 'Hide details' : 'View details →'}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </Box>
            <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50/50 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <p className="font-semibold text-ink-900">Need something custom?</p>
                    <p className="text-[0.8125rem] text-ink-600">We can create bespoke add-ons tailored to your specific requirements.</p>
                </div>
                <Link href={`/sprints/${slug}/quote`} className="inline-flex h-10 items-center gap-1.5 rounded-[4px] border border-gold-500 bg-white px-4 text-sm font-semibold text-gold-800">
                    Request a Custom Add-on <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}

function ReviewsTab({ sprint, a, onBook, onAsk }: { sprint: SprintRecord; a: GenericAttributes; onBook: () => void; onAsk: () => void }) {
    const data = a.reviews_data;
    const [segment, setSegment] = useState('All Reviews');
    const [sort, setSort] = useState<'recent' | 'top'>('recent');
    const [pkgFilter, setPkgFilter] = useState('');
    if (!data) return <Box title="Client Reviews">No reviews yet.</Box>;
    const segments = ['All Reviews', ...Array.from(new Set(data.items.map((r) => r.segment).filter((s): s is string => !!s)))];
    const pkgs = Array.from(new Set(data.items.map((r) => r.package).filter((s): s is string => !!s)));
    let items = data.items.filter((r) => (segment === 'All Reviews' || r.segment === segment) && (!pkgFilter || r.package === pkgFilter));
    if (sort === 'top') items = [...items].sort((x, y) => y.rating - x.rating);
    const max = Math.max(...Object.values(data.distribution), 1);

    return (
        <>
            <Box title="Client Reviews" subtitle={`Verified client feedback on the ${sprint.title}.`}>
                <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)_220px]">
                    <div className="rounded-[8px] border border-parchment-400 p-4 text-center">
                        <p className="text-4xl font-bold text-ink-900">
                            {data.average.toFixed(1)} <span className="text-lg font-normal text-ink-500">/ 5</span>
                        </p>
                        <p className="text-[0.75rem] text-ink-500">Based on {data.count} verified reviews</p>
                        <p className="mt-1 text-xl text-gold-500" aria-hidden="true">
                            ★★★★★
                        </p>
                    </div>
                    <ul className="space-y-1.5 rounded-[8px] border border-parchment-400 p-4">
                        {[5, 4, 3, 2, 1].map((s) => (
                            <li key={s} className="flex items-center gap-2 text-[0.75rem] text-ink-600">
                                <span className="w-12">{s} stars</span>
                                <span className="h-2 flex-1 overflow-hidden rounded-full bg-parchment-300">
                                    <span className="block h-full rounded-full bg-gold-500" style={{ width: `${((data.distribution[String(s)] ?? 0) / max) * 100}%` }} />
                                </span>
                                <span className="w-8 text-right">{data.distribution[String(s)] ?? 0}</span>
                            </li>
                        ))}
                    </ul>
                    {data.highlights && <CheckList items={data.highlights} className="rounded-[8px] border border-parchment-400 p-4" />}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {segments.map((s) => (
                        <button key={s} type="button" aria-pressed={segment === s} onClick={() => setSegment(s)} className={cn('rounded-full border px-3 py-1 text-[0.75rem]', segment === s ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}>
                            {s}
                        </button>
                    ))}
                    <select aria-label="Sort reviews" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'top')} className="h-8 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.75rem]">
                        <option value="recent">Most Recent</option>
                        <option value="top">Highest Rated</option>
                    </select>
                    {pkgs.length > 0 && (
                        <select aria-label="Filter by package" value={pkgFilter} onChange={(e) => setPkgFilter(e.target.value)} className="h-8 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.75rem]">
                            <option value="">Package: All</option>
                            {pkgs.map((p) => (
                                <option key={p} value={p}>
                                    Package: {p}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((r) => (
                        <li key={r.name + r.title} className="rounded-[8px] border border-parchment-400 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-700 text-[0.75rem] font-bold" aria-hidden="true">
                                        {r.name.split(' ').map((n) => n[0]).join('')}
                                    </span>
                                    <div>
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{r.name}</p>
                                        <p className="text-[0.6875rem] text-ink-500">{r.role}</p>
                                    </div>
                                </div>
                                {r.package && <span className="rounded-[3px] bg-gold-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800">{r.package}</span>}
                            </div>
                            <p className="mt-1 text-gold-500" aria-label={`${r.rating} out of 5 stars`}>
                                {'★'.repeat(r.rating)}
                                <span className="text-parchment-500">{'★'.repeat(5 - r.rating)}</span>
                            </p>
                            {r.title && <p className="text-[0.8125rem] font-bold text-ink-900">{r.title}</p>}
                            <p className="mt-1 text-[0.75rem] text-ink-700">{r.body}</p>
                            <p className="mt-2 flex justify-between text-[0.6875rem] text-ink-400">
                                <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="size-3" aria-hidden="true" /> Verified Client
                                </span>
                                {r.date}
                            </p>
                        </li>
                    ))}
                    {items.length === 0 && <li className="text-[0.8125rem] text-ink-500">No reviews match this filter.</li>}
                </ul>
            </Box>
            <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50/40 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <p className="font-semibold text-ink-900">Need help choosing the right package?</p>
                    <p className="text-[0.8125rem] text-ink-600">Speak to TBCA before placing your order.</p>
                </div>
                <button type="button" onClick={onBook} className="h-10 rounded-[4px] border border-gold-500 bg-white px-4 text-sm font-semibold">
                    Book Discovery Call
                </button>
                <button type="button" onClick={onAsk} className="h-10 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">
                    Ask a Question
                </button>
            </div>
        </>
    );
}

function FaqsTab({ sprint, a }: { sprint: SprintRecord; a: GenericAttributes }) {
    const faqs = (a.faqs ?? []).map((f, i) => ({ ...f, n: i + 1 }));
    const [open, setOpen] = useState<number | null>(1);
    const groups = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
        (acc[f.group ?? 'General Questions'] ??= []).push(f);
        return acc;
    }, {});
    const entries = Object.entries(groups);
    const columns = [entries.filter((_, i) => i % 3 === 0), entries.filter((_, i) => i % 3 === 1), entries.filter((_, i) => i % 3 === 2)];

    return (
        <Box title="Frequently Asked Questions" subtitle={`Find answers to common questions about the ${sprint.title}.`}>
            <div className="grid gap-4 lg:grid-cols-3">
                {columns.map((col, ci) => (
                    <div key={ci} className="space-y-4">
                        {col.map(([group, items]) => (
                            <div key={group}>
                                <p className="mb-2 text-[0.8125rem] font-semibold text-gold-700">{group}</p>
                                <ul className="divide-y divide-parchment-300 rounded-[6px] border border-parchment-400">
                                    {items.map((f) => (
                                        <li key={f.n}>
                                            <button type="button" aria-expanded={open === f.n} onClick={() => setOpen(open === f.n ? null : f.n)} className="flex w-full items-start justify-between gap-2 p-3 text-left text-[0.8125rem] font-semibold text-ink-900">
                                                {f.n}. {f.q}
                                                <ChevronDown className={cn('size-4 shrink-0 transition-transform', open === f.n && 'rotate-180')} aria-hidden="true" />
                                            </button>
                                            {open === f.n && <p className="px-3 pb-3 text-[0.75rem] leading-relaxed text-ink-600">{f.a}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Box>
    );
}

function WhatsAppLink({ label }: { label: string }) {
    const { contact } = usePage<SharedProps>().props;
    const number = (contact?.whatsapp ?? '+27608011365').replace(/[^\d]/g, '');
    return (
        <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-verified-500/40 bg-white px-4 text-[0.8125rem] font-semibold text-ink-900 hover:border-verified-500">
            <MessageCircle className="size-4 text-verified-500" aria-hidden="true" /> {label}
        </a>
    );
}

const SUPPORT_TOPICS = [
    ['How to provide inputs for the best results', 'Step-by-step guide to submit all required information.', 'Use the Inputs Required checklist. Share what you have — gaps are fine; your consultant will flag what is essential during the discovery call.'],
    ['Sprint delivery timeline explained', 'Detailed breakdown of the delivery process.', 'The clock starts once your inputs are received. You get a draft for review, one or more refinement rounds, then final delivery through the Client Portal.'],
    ['File formats and usage rights', 'What you receive and how you can use it.', 'You receive PDF plus editable source files (where applicable) with a perpetual licence for use within your organisation.'],
    ['What happens after I place my order?', 'Understand the sprint process and key milestones.', 'You receive an instant confirmation, a kickoff email within 24 hours and access to the Sprint workspace in your Client Portal.'],
    ['Revisions and change requests', "How revisions work and what's included.", 'Each package includes a set number of revision rounds. Scope changes beyond the package go through change control and are quoted before work starts.'],
    ['Confidentiality and data security', 'How we protect your information.', 'All work is covered by NDA, stored in encrypted systems with access controls and handled only by the assigned delivery team.'],
];

function SupportTab({ sprint, onAsk, onBook, delivery }: { sprint: SprintRecord; onAsk: () => void; onBook: () => void; delivery: string | null }) {
    const { contact } = usePage<SharedProps>().props;
    const [topic, setTopic] = useState<number | null>(null);
    const email = contact?.email ?? 'Consult@thebusinessclinic.africa';
    const number = (contact?.whatsapp ?? '+27608011365').replace(/[^\d]/g, '');
    const cards = [
        { title: 'Ask a Question', body: 'Get quick answers from our TBCA experts.', icon: <MessageCircle className="size-5 text-verified-500" />, cta: <button type="button" onClick={onAsk} className="h-9 w-full rounded-[4px] border border-verified-500 text-[0.8125rem] font-semibold text-verified-700">Ask a Question →</button>, foot: 'Typical reply: Under 5 minutes' },
        { title: 'WhatsApp Support', body: 'Chat with our team on WhatsApp for fast assistance.', icon: <Phone className="size-5 text-gold-600" />, cta: <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" className="flex h-9 w-full items-center justify-center gap-1 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-gold-800">Chat on WhatsApp <ExternalLink className="size-3.5" /></a>, foot: 'Available: Mon – Fri, 08:00 – 17:00 SAST' },
        { title: 'Email Support', body: "Send us a detailed query and we'll respond.", icon: <Mail className="size-5 text-controlled-500" />, cta: <a href={`mailto:${email}?subject=${encodeURIComponent(`Support: ${sprint.title}`)}`} className="flex h-9 w-full items-center justify-center rounded-[4px] border border-controlled-500 text-[0.8125rem] font-semibold text-controlled-700">Send an Email →</a>, foot: 'Typical reply: Under 2 hours' },
        { title: 'Schedule a Call', body: 'Book a call with a specialist for in-depth support.', icon: <Headphones className="size-5 text-ink-700" />, cta: <button type="button" onClick={onBook} className="h-9 w-full rounded-[4px] border border-ink-400 text-[0.8125rem] font-semibold text-ink-800">Book a Call →</button>, foot: 'Available: Mon – Fri, 08:00 – 17:00 SAST' },
    ];
    return (
        <>
            <Box title="How Can We Help You?" subtitle={`Choose the best way to get support for your ${sprint.title.toLowerCase()}.`}>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((c) => (
                        <li key={c.title} className="flex flex-col rounded-[8px] border border-parchment-400 p-3">
                            <p className="flex items-center gap-2 font-semibold text-ink-900">
                                <span className="flex size-9 items-center justify-center rounded-full bg-parchment-200">{c.icon}</span>
                                {c.title}
                            </p>
                            <p className="mt-2 flex-1 text-[0.75rem] text-ink-600">{c.body}</p>
                            <div className="mt-3">{c.cta}</div>
                            <p className="mt-2 text-[0.6875rem] text-ink-400">{c.foot}</p>
                        </li>
                    ))}
                </ul>
            </Box>
            <Box title="Common Support Topics" subtitle="Browse help articles and guides for common questions.">
                <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {SUPPORT_TOPICS.map(([t, b, answer], i) => (
                        <li key={t} className="rounded-[6px] border border-parchment-400">
                            <button type="button" aria-expanded={topic === i} onClick={() => setTopic(topic === i ? null : i)} className="flex w-full items-start gap-2 p-3 text-left">
                                <FileText className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
                                <span className="flex-1">
                                    <span className="block text-[0.8125rem] font-semibold text-ink-900">{t.replace('the delivery', delivery ? `the ${delivery}` : 'the delivery')}</span>
                                    <span className="block text-[0.75rem] text-ink-500">{b}</span>
                                </span>
                                <ChevronRight className={cn('size-4 text-ink-400 transition-transform', topic === i && 'rotate-90')} aria-hidden="true" />
                            </button>
                            {topic === i && <p className="px-3 pb-3 text-[0.75rem] text-ink-600">{answer}</p>}
                        </li>
                    ))}
                </ul>
                <Link href="/contact" className="mt-4 flex flex-col items-center rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-center">
                    <span className="font-semibold text-gold-800">Visit the Help Centre</span>
                    <span className="text-[0.75rem] text-ink-600">Explore all articles, guides and resources.</span>
                </Link>
            </Box>
        </>
    );
}

const QUESTION_TOPICS = ['Scope and deliverables', 'Packages and pricing', 'Timeline and delivery', 'Inputs required', 'Payment and invoicing', 'Customisation', 'Other'];

function AskTab({ sprint, pkg, onFaqs }: { sprint: SprintRecord; pkg: Pkg | null; onFaqs: () => void }) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: auth.user?.phone ?? '',
        contact_method: 'email',
        package: pkg?.key ?? '',
        topic: '',
        question: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/sprints/${sprint.slug}/question`, { preserveScroll: true, onSuccess: () => form.reset('question', 'topic') });
    }

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <Box title="How can we help you?" subtitle="Ask your question and our TBCA experts will get back to you shortly.">
                {auth.user && <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-verified-50 px-2.5 py-1 text-[0.75rem] font-semibold text-verified-700"><CircleCheck className="size-3.5" /> Existing Customer</p>}
                <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                    <Field label="Your Name" required error={form.errors.name}>
                        {(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />}
                    </Field>
                    <Field label="Sprint Package" error={form.errors.package}>
                        {(id) => <Input id={id} readOnly value={pkg ? `${pkg.name} – ${pkg.description ?? ''}` : 'Not selected'} />}
                    </Field>
                    <Field label="Email Address" required error={form.errors.email}>
                        {(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />}
                    </Field>
                    <Field label="Subject" required error={form.errors.topic}>
                        {(id) => <Select id={id} value={form.data.topic} onChange={(e) => form.setData('topic', e.target.value)} placeholder="Select a topic" options={QUESTION_TOPICS} required />}
                    </Field>
                    <fieldset>
                        <legend className="text-[0.8125rem] font-medium text-ink-800">Preferred Contact Method</legend>
                        <div className="mt-2 flex flex-wrap gap-4 text-[0.8125rem]">
                            {[['email', 'Email'], ['whatsapp', 'WhatsApp'], ['phone', 'Phone Call']].map(([v, l]) => (
                                <label key={v} className="flex items-center gap-1.5">
                                    <input type="radio" name="contact_method" value={v} checked={form.data.contact_method === v} onChange={() => form.setData('contact_method', v)} className="accent-gold-600" />
                                    {l}
                                </label>
                            ))}
                        </div>
                        {form.data.contact_method !== 'email' && (
                            <Input className="mt-2" aria-label="Phone number" placeholder="+27 ..." value={form.data.phone ?? ''} onChange={(e) => form.setData('phone', e.target.value)} />
                        )}
                    </fieldset>
                    <Field label="Your Question" required error={form.errors.question} hint={`${form.data.question.length}/1000`}>
                        {(id) => <Textarea id={id} maxLength={1000} rows={4} value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} placeholder="Type your question here..." required />}
                    </Field>
                    <div className="rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-[0.75rem] text-ink-700">
                        <p className="font-semibold text-ink-900">Confidentiality Assurance</p>
                        All questions and information you share with us are treated with the highest level of confidentiality and are used solely to assist you.
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-6 font-semibold text-ink-900 disabled:opacity-50">
                            Send Question <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                        <span className="flex items-center gap-1 text-[0.6875rem] text-ink-500">
                            <Clock className="size-3" aria-hidden="true" /> We typically reply in under 5 minutes
                        </span>
                    </div>
                </form>
            </Box>
            <div className="space-y-4">
                <Box title="What to Expect">
                    <ul className="space-y-3 text-[0.75rem] text-ink-600">
                        {[
                            ['Expert Response', 'Your question will be answered by a TBCA business expert.'],
                            ['Fast Turnaround', 'We typically reply in under 5 minutes during business hours.'],
                            ['Detailed Guidance', 'Receive clear, actionable answers and next steps.'],
                            ['Follow-up Support', "We're here to ensure you get the clarity you need."],
                        ].map(([t, b]) => (
                            <li key={t}>
                                <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                                    <Star className="size-3.5 text-gold-600" aria-hidden="true" /> {t}
                                </span>
                                {b}
                            </li>
                        ))}
                    </ul>
                </Box>
                <Box title="Popular Questions">
                    <ul className="space-y-1.5 text-[0.75rem]">
                        {['What information do I need to get started?', 'Can I customise the deliverables in my sprint?', 'How are the financial projections prepared?', 'What if I need revision after delivery?', 'Do you work with my industry?'].map((q) => (
                            <li key={q}>
                                <button type="button" onClick={() => { form.setData('question', q); }} className="flex w-full items-center justify-between text-left text-ink-700 hover:text-gold-700">
                                    {q} <ChevronRight className="size-3.5" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={onFaqs} className="mt-3 text-[0.75rem] font-semibold text-gold-700">
                        View all FAQs →
                    </button>
                </Box>
            </div>
        </div>
    );
}

