import { useState, type ReactNode } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Bookmark,
    Calendar,
    CheckSquare,
    Clock,
    FileText,
    Globe,
    Headphones,
    Info,
    KeyRound,
    Landmark,
    Languages,
    RefreshCw,
    ShieldCheck,
    ShoppingCart,
    TrendingUp,
    Wrench,
} from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Tabs } from '@/Components/ui/Kit';
import { CheckList, Notice } from '@/Components/Products/Shared';
import ProductCard, { addToCart } from '@/Components/Products/Digital/ProductCard';
import { Chip, DpCover, DpPrice } from '@/Components/Products/Digital/Ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { DpLicence, DpProductCard, DpProductDetail } from '@/Components/Products/Digital/types';

const BADGE_ICONS = [TrendingUp, Landmark, Wrench, BadgeCheck];

export default function Product({
    product: p,
    licences,
    related,
    saved,
    owned,
}: {
    product: DpProductDetail;
    licences: Record<string, DpLicence>;
    related: DpProductCard[];
    saved: boolean;
    owned: string | null;
}) {
    const { auth } = usePage<SharedProps>().props;
    const price = usePrice();
    const [tab, setTab] = useState('overview');
    const v = p.currentVersion;
    const blocked = ['PRICE_HOLD', 'WITHDRAWN_UNSAFE', 'FREE_RESOURCE'].includes(p.state);

    const save = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post('/saved', { item_type: 'digital-product', item_key: p.slug, label: p.name, url: `/digital-products/${p.slug}` }, { preserveScroll: true });
    };

    const facts: [typeof KeyRound, string, string][] = [
        [KeyRound, 'Licence Class', Object.entries(p.prices).filter(([, v]) => v).map(([k]) => k).join(', ')],
        [FileText, 'Format', p.formats.join(', ')],
        [Languages, 'Language', p.languages.join(', ')],
        [RefreshCw, 'Version', v?.display ?? '—'],
        [Calendar, 'Verified as at', p.verifiedAt ?? '—'],
        [Wrench, 'Maintenance Included', p.maintenance],
        [RefreshCw, 'Updates Included', p.updateClass === 'U0' ? 'No' : `Yes (${p.updateMonths} months)`],
        [Headphones, 'Support', p.support],
    ];

    return (
        <>
            <Head title={p.name} />
            <div className="container-tbca py-6">
                <Breadcrumbs items={[{ label: 'Digital Products', href: '/digital-products' }, { label: `${p.typeLabel}s`, href: `/digital-products?types[]=${p.type}` }, { label: p.name }]} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0 space-y-5">
                        <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
                            <DpCover name={p.name} type={p.typeLabel} tone={p.tone} size="lg" />
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    <Chip tone="gold">{p.typeLabel.toUpperCase()}</Chip>
                                    {p.state === 'FREE_RESOURCE' ? <Chip tone="good">FREE RESOURCE</Chip> : <Chip tone="good">● INSTANT ACCESS</Chip>}
                                    {p.state === 'AVAILABLE_HIGH_RISK' && <Chip tone="warn">QUALIFIED REVIEW APPLIES</Chip>}
                                </div>
                                <h1 className="mt-3 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{p.name}</h1>
                                <p className="mt-2 text-[0.9375rem] text-ink-700">{p.tagline}</p>
                                <ul className="mt-4 flex flex-wrap gap-4">
                                    {p.badges.map((b, i) => {
                                        const Icon = BADGE_ICONS[i % BADGE_ICONS.length];
                                        return (
                                            <li key={b} className="flex items-center gap-2 text-xs font-semibold text-ink-800">
                                                <Icon className="size-5 text-gold-600" aria-hidden="true" /> {b}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-700">{p.description}</p>
                                <p className="mt-3 text-[0.8125rem] text-ink-700">
                                    <strong className="text-ink-900">Primary Audience:</strong> {p.audience}
                                </p>
                                <p className="mt-1 text-[0.8125rem] text-ink-700">
                                    <strong className="text-ink-900">Best For:</strong> {p.bestFor}
                                </p>
                            </div>
                        </div>

                        {p.state === 'AVAILABLE_HIGH_RISK' && (
                            <Notice tone="warn" title="High-risk compliance content">
                                This product carries regulatory thresholds. It has passed qualified review for the version shown; check the current edition and next review date before new reliance.
                            </Notice>
                        )}

                        <section className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                            <h2 className="bg-ink-950 px-4 py-2 text-xs font-bold tracking-wide text-gold-400 uppercase">Current Edition</h2>
                            <dl className="grid grid-cols-2 gap-px bg-parchment-300 sm:grid-cols-5">
                                {[
                                    ['Version', v?.display ?? '—'],
                                    ['Jurisdiction', p.jurisdiction],
                                    ['As-at Date', v?.verifiedAt ?? '—'],
                                    ['Next Review', p.nextReview ?? '—'],
                                    ['Currentness', v ? '● Current' : 'Withdrawn'],
                                ].map(([k, val]) => (
                                    <div key={k} className="bg-white px-4 py-2.5">
                                        <dt className="text-[0.6875rem] font-semibold text-ink-500">{k}</dt>
                                        <dd className={`font-mono text-[0.8125rem] ${k === 'Currentness' ? 'text-verified-600' : 'text-ink-900'}`}>{val}</dd>
                                    </div>
                                ))}
                            </dl>
                            <p className="border-t border-parchment-300 px-4 py-2 text-[0.6875rem] text-ink-500">
                                Maintenance: {p.maintenanceClass} · Updates: {p.updateClass}. Requirements can change; check the Client Portal for current status before new reliance.
                            </p>
                        </section>

                        <Tabs
                            value={tab}
                            onChange={setTab}
                            tabs={[
                                { key: 'overview', label: 'Overview' },
                                { key: 'receive', label: 'What You Receive' },
                                { key: 'how', label: 'How To Use' },
                                { key: 'not', label: 'What This Does Not Do' },
                                { key: 'maintenance', label: 'Maintenance & Updates' },
                                { key: 'support', label: 'Support' },
                                { key: 'sprint', label: 'Related Sprint' },
                                { key: 'disclosure', label: 'Disclosure' },
                            ]}
                        />

                        {tab === 'overview' && (
                            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
                                <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink-900 uppercase">
                                        Why this, not a free AI answer? <Info className="size-3.5 text-gold-600" aria-hidden="true" />
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr>
                                                    <th className="bg-ink-900 p-2 text-parchment-100">Factor</th>
                                                    <th className="bg-gold-500 p-2 text-ink-900">This {p.typeLabel}</th>
                                                    <th className="bg-ink-900 p-2 text-parchment-100">Free / AI Answer</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-parchment-300">
                                                {p.compare.map((r) => (
                                                    <tr key={r[0]}>
                                                        <td className="p-2 font-semibold text-ink-800">{r[0]}</td>
                                                        <td className="p-2 text-ink-700">{r[1]}</td>
                                                        <td className="p-2 text-ink-500">{r[2]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-3 rounded-[6px] border border-gold-300 bg-gold-50 p-2 text-xs text-ink-700">
                                        Our {p.type} saves you days of work and gives you a {p.type === 'template' ? 'plan' : 'result'} that decision-makers respect.
                                    </p>
                                </section>
                                <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">What You Receive</h2>
                                    <ul className="space-y-1.5">
                                        {p.receive.map((r) => (
                                            <li key={r} className="flex gap-2 text-xs text-ink-700">
                                                <CheckSquare className="size-4 shrink-0 text-gold-600" aria-hidden="true" /> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                                <div className="space-y-4">
                                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                        <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">Defensibility & Trust</h2>
                                        <ul className="space-y-2.5">
                                            {[
                                                ['Human Reviewed Quality', 'Reviewed by TBCA business experts'],
                                                ['Version Controlled', `Every ${p.type} has a controlled version`],
                                                ['Source Integrity', 'All frameworks are original TBCA IP'],
                                                ['Privacy & Security', 'Your downloads are secure and private'],
                                            ].map(([t, b]) => (
                                                <li key={t} className="flex gap-2">
                                                    <ShieldCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                                    <span className="text-xs">
                                                        <strong className="block text-ink-900">{t}</strong>
                                                        <span className="text-ink-500">{b}</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        {p.dss !== null && <p className="mt-3 text-xs text-ink-600">Defensibility Score (DSS): <strong>{p.dss}/100</strong></p>}
                                    </section>
                                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                        <h2 className="mb-1 text-xs font-bold tracking-wide text-ink-900 uppercase">Refund & Download</h2>
                                        <p className="text-xs text-ink-600">Read our refund and download terms before purchase.</p>
                                        <button type="button" onClick={() => setTab('disclosure')} className="mt-2 text-xs font-semibold text-gold-700 hover:underline">
                                            View Refund & Download Policy →
                                        </button>
                                    </section>
                                </div>
                            </div>
                        )}
                        {tab === 'receive' && <TabPanel><CheckList items={p.receive} /></TabPanel>}
                        {tab === 'how' && <TabPanel><ol className="list-decimal space-y-2 pl-5 text-[0.8125rem] text-ink-700">{(p.content.how_to_use ?? []).map((s) => <li key={s}>{s}</li>)}</ol></TabPanel>}
                        {tab === 'not' && <TabPanel><ul className="list-disc space-y-2 pl-5 text-[0.8125rem] text-ink-700">{(p.content.does_not_do ?? []).map((s) => <li key={s}>{s}</li>)}</ul></TabPanel>}
                        {tab === 'maintenance' && (
                            <TabPanel>
                                <p className="mb-3 text-[0.8125rem] text-ink-700">
                                    Updates are included for {p.updateMonths} months after purchase. Maintained Access keeps you on the current controlled edition after that. Review cycle: {p.reviewCycle}.
                                </p>
                                <ul className="divide-y divide-parchment-300 text-xs">
                                    {p.versions.filter((x) => !['draft', 'qa'].includes(x.status)).map((x) => (
                                        <li key={x.id} className="flex flex-wrap justify-between gap-2 py-2">
                                            <span className="font-semibold text-ink-900">{x.display}</span>
                                            <span className="text-ink-500">{x.releasedAt}</span>
                                            <span className="w-full text-ink-600">{x.summary}</span>
                                        </li>
                                    ))}
                                </ul>
                            </TabPanel>
                        )}
                        {tab === 'support' && (
                            <TabPanel>
                                <p className="text-[0.8125rem] text-ink-700">{p.support} support is included: questions on using the product, download problems and correction notices. Buyer-specific drafting or advice is a Sprint or Advisory service.</p>
                                <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${p.name}`, section: 'digital-products' })} className="mt-3 inline-flex h-9 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">
                                    Ask a Question
                                </button>
                            </TabPanel>
                        )}
                        {tab === 'sprint' && p.content.related_sprint && (
                            <TabPanel>
                                <p className="text-[0.8125rem] text-ink-700">Need expert help applying this product? Convert to a guided Sprint.</p>
                                <Link href={`/sprints/${p.content.related_sprint.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline">
                                    {p.content.related_sprint.title} — from {price(p.content.related_sprint.price)} <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            </TabPanel>
                        )}
                        {tab === 'disclosure' && (
                            <TabPanel>
                                <ul className="list-disc space-y-2 pl-5 text-[0.8125rem] text-ink-700">
                                    <li>You are purchasing a licence to use the identified product version under the licence class, format, language, jurisdiction, maintenance and update terms shown before payment.</li>
                                    <li>You do not acquire ownership of TBCA or third-party intellectual property merely because a file is delivered.</li>
                                    <li>Digital downloads are not automatically non-refundable. Where the law gives you a cooling-off or other remedy, TBCA will apply it.</li>
                                    <li>A successful download is recorded as transaction evidence; it does not by itself decide that no refund is available.</li>
                                    <li>Wrong product, corrupt file, material defect, misdescription or an unsafe/withdrawn version are assessed under the applicable legal remedy first, then any goodwill response.</li>
                                </ul>
                            </TabPanel>
                        )}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <section className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                            <header className="bg-ink-950 px-4 py-3 text-center">
                                <h2 className="text-sm font-bold tracking-wide text-parchment-100 uppercase">Purchase & Download</h2>
                                <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-gold-400">
                                    <ShieldCheck className="size-3.5" aria-hidden="true" /> 100% Secure Transaction
                                </p>
                            </header>
                            <div className="p-4">
                                {p.state === 'FREE_RESOURCE' ? <p className="text-center font-serif text-3xl">Free</p> : <DpPrice zar={p.fromPrice} big className="text-center" />}
                                <dl className="mt-4 space-y-2 text-xs">
                                    {facts.map(([Icon, k, val]) => (
                                        <div key={k} className="flex items-center justify-between gap-2">
                                            <dt className="flex items-center gap-2 text-ink-600">
                                                <Icon className="size-3.5 text-gold-600" aria-hidden="true" /> {k}
                                            </dt>
                                            <dd className="text-right font-semibold text-ink-900">{val}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {owned && (
                                    <Notice tone="good" className="mt-4">
                                        You already hold this product. <Link className="font-semibold underline" href={`/digital-products/library/${owned}`}>Open your entitlement</Link>
                                    </Notice>
                                )}
                                {blocked ? (
                                    <Notice tone={p.state === 'FREE_RESOURCE' ? 'good' : 'warn'} className="mt-4">
                                        {p.state === 'WITHDRAWN_UNSAFE' && 'This edition has been withdrawn while a corrected version is prepared. Contact support for the replacement.'}
                                        {p.state === 'PRICE_HOLD' && 'Checkout is temporarily unavailable for this product while pricing is reviewed.'}
                                        {p.state === 'FREE_RESOURCE' && 'This is a free resource. Request access via Resources.'}
                                    </Notice>
                                ) : (
                                    <>
                                        <Link href={`/digital-products/${p.slug}/licence`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                            Select Licence & Options <ArrowRight className="size-4" aria-hidden="true" />
                                        </Link>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <button type="button" onClick={() => addToCart(p)} className="flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-xs font-semibold hover:bg-gold-50">
                                                <ShoppingCart className="size-4" aria-hidden="true" /> Add to Cart
                                            </button>
                                            <button type="button" onClick={save} aria-pressed={saved} className="flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-xs font-semibold hover:bg-gold-50">
                                                <Bookmark className={`size-4 ${saved ? 'fill-gold-500' : ''}`} aria-hidden="true" /> {saved ? 'Saved' : 'Save Item'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Licence classes</h2>
                            <ul className="space-y-1.5 text-xs">
                                {Object.values(licences).map((l) => (
                                    <li key={l.code} className="flex justify-between gap-2">
                                        <span>
                                            <strong>{l.code}</strong> {l.name}
                                        </span>
                                        <span className="font-semibold">{l.code === 'L5' ? 'Review' : p.prices[l.code] ? price(p.prices[l.code] as number) : 'Not offered'}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500">
                                <Globe className="size-3" aria-hidden="true" /> ZAR source prices, ex VAT. <Clock className="ml-1 size-3" aria-hidden="true" /> Instant access after verified payment.
                            </p>
                        </section>
                    </aside>
                </div>

                {related.length > 0 && (
                    <section className="mt-10">
                        <h2 className="mb-3 font-serif text-xl font-semibold text-ink-900">Related Digital Products</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {related.map((r) => (
                                <ProductCard key={r.slug} product={r} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function TabPanel({ children }: { children: ReactNode }) {
    return <section className="rounded-[8px] border border-parchment-400 bg-white p-5">{children}</section>;
}
