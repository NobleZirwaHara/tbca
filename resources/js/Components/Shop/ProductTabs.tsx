import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FileText, Info, Lock, Sparkles, Star, Users } from 'lucide-react';
import ShopIcon, { iconFor } from '@/Components/Shop/ShopIcon';
import { CheckList } from '@/Components/Shop/ProductParts';
import { zar } from '@/Components/Shop/Bits';
import { cn } from '@/lib/cn';
import type { ProductDetail, RelatedOffer } from '@/types/shop';

export type TabKey = 'overview' | 'included' | 'delivery' | 'who' | 'why' | 'related' | 'reviews' | 'how' | 'requirements' | 'support' | 'plans' | 'tiers' | 'overage' | 'faqs';

export function tabsFor(p: ProductDetail): { key: TabKey; label: string }[] {
    const reviews = { key: 'reviews' as const, label: `Reviews (${p.reviews_count})` };
    switch (p.act) {
        case 'A2':
            return [{ key: 'overview', label: 'Overview' }, { key: 'included', label: "What's Included" }, { key: 'how', label: 'How It Works' }, { key: 'requirements', label: 'Requirements' }, { key: 'support', label: 'Support' }, reviews, { key: 'related', label: 'Related Offers' }, { key: 'faqs', label: 'FAQs' }];
        case 'A3':
            return [{ key: 'overview', label: 'Overview' }, { key: 'included', label: "What's Included" }, { key: 'how', label: 'How It Works' }, { key: 'plans', label: 'Pricing & Plans' }, { key: 'requirements', label: 'Requirements' }, { key: 'support', label: 'Support' }, reviews, { key: 'faqs', label: 'FAQs' }];
        case 'A4':
            return [{ key: 'overview', label: 'Overview' }, { key: 'included', label: "What's Included" }, { key: 'how', label: 'How It Works' }, { key: 'tiers', label: 'Commitment Tiers (C1-C5)' }, { key: 'overage', label: 'Pricing & Overage' }, { key: 'faqs', label: 'FAQ' }];
        case 'A7':
            return [{ key: 'overview', label: 'Overview' }, { key: 'included', label: 'What You Get' }, { key: 'how', label: 'How It Works' }, { key: 'faqs', label: 'FAQs' }];
        default:
            return [{ key: 'overview', label: 'Overview' }, { key: 'included', label: "What's Included" }, { key: 'delivery', label: 'Delivery & Process' }, { key: 'who', label: "Who It's For" }, { key: 'why', label: 'Why This Sprint' }, { key: 'related', label: 'Related Offers' }, reviews, { key: 'faqs', label: 'FAQs' }];
    }
}

function H({ children }: { children: string }) {
    return <h3 className="mb-3 text-[0.9375rem] font-semibold text-ink-900">{children}</h3>;
}

function Deliverables({ items }: { items: [string, string][] }) {
    return (
        <ul className="space-y-2">
            {items.map(([n, f]) => (
                <li key={n} className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                    <FileText className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                    <span className="flex-1">{n}</span>
                    <span className="text-[0.6875rem] text-ink-400">{f}</span>
                </li>
            ))}
        </ul>
    );
}

export function Glance({ rows }: { rows: [string, string][] }) {
    return (
        <dl className="space-y-1.5 text-[0.8125rem]">
            {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                    <dt className="font-medium text-ink-800">{k}</dt>
                    <dd className="text-right text-ink-600">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

function Overview({ p }: { p: ProductDetail }) {
    const c = p.content;
    const first = p.act === 'A1' ? 'What You Will Achieve' : p.act === 'A7' ? 'What You Will Get' : 'What You Get';
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div><H>{first}</H><CheckList items={(c.achieve ?? []).length ? (c.achieve as string[]) : [p.tagline ?? '']} /></div>
            <div>
                {p.act === 'A1' && c.deliverables ? (<><H>Key Deliverables</H><Deliverables items={c.deliverables} /></>) : p.act === 'A7' ? (
                    <><H>How It Works</H><ol className="space-y-3">{(c.how_it_works ?? [['Answer simple questions', 'Tell us about your business.'], ['Get instant results', 'See your score and insights.'], ['Take action', 'Follow the recommended steps.']]).map(([t, b], i) => (<li key={t} className="flex gap-2 text-[0.8125rem]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-50 text-xs font-bold text-verified-700">{i + 1}</span><span><span className="block font-semibold">{t}</span><span className="text-ink-500">{b}</span></span></li>))}</ol></>
                ) : (<><H>Key Benefits</H><CheckList items={c.benefits ?? []} /></>)}
            </div>
            <div>
                {p.act === 'A1' ? (<><H>At a Glance</H><Glance rows={c.glance ?? []} /></>) : p.act === 'A7' ? (
                    <><H>What's Included</H><CheckList tone="green" items={['Business Profile Assessment', 'Operations & Processes Check', 'Financial Health Indicators', 'Market & Customer Readiness', 'Growth & Strategy Alignment']} /></>
                ) : (<><H>Best For</H><ul className="space-y-2">{(c.best_for_list ?? []).map((b) => <li key={b} className="flex gap-2 text-[0.8125rem] text-ink-700"><Users className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />{b}</li>)}</ul></>)}
            </div>
        </div>
    );
}

function Delivery({ p }: { p: ProductDetail }) {
    const c = p.content;
    return (
        <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
                <div><H>Delivery Overview</H><p className="mb-3 text-[0.8125rem] text-ink-600">We follow a structured delivery approach to ensure you receive high-quality, actionable outputs within the committed timeframe.</p><CheckList tone="green" items={c.delivery_overview ?? []} /></div>
                <div><H>What You Will Receive</H><Deliverables items={c.deliverables ?? []} /></div>
                <div>
                    <H>Delivery & Access</H><Glance rows={c.delivery_access ?? []} />
                    <p className="mt-3 flex gap-2 rounded-[6px] bg-verified-50 p-2 text-xs text-verified-700"><Lock className="size-4 shrink-0" aria-hidden="true" /> All files are stored securely and protected by bank-grade encryption.</p>
                </div>
            </div>
            <div>
                <H>Detailed Delivery Process</H>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {(c.process ?? []).map(([t, b, d], i) => (
                        <li key={t} className="rounded-[8px] border border-parchment-400 p-3 text-center">
                            <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-verified-500 text-xs font-bold text-white">{i + 1}</span>
                            <p className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{t}</p>
                            <p className="mt-1 text-xs text-ink-500">{b}</p>
                            <p className="mt-2 text-xs font-semibold text-ink-800">{d}</p>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <div><H>Inputs Required</H><CheckList items={c.inputs ?? []} /></div>
                <div><H>Support Inclusions</H><Glance rows={c.support_inclusions ?? []} /></div>
            </div>
            <p className="flex gap-2 rounded-[6px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-ink-700"><Info className="size-4 shrink-0 text-controlled-700" aria-hidden="true" /> <span><strong>Delivery Commitment.</strong> We are committed to delivering high-quality outputs on time. If we foresee any delays, we will inform you immediately.</span></p>
        </div>
    );
}

function Why({ p }: { p: ProductDetail }) {
    const c = p.content;
    return (
        <div>
            <H>Why This Product?</H>
            <p className="-mt-2 mb-4 text-[0.8125rem] text-ink-600">{c.why_intro}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(c.why ?? []).map(([icon, t, b]) => {
                    const I = iconFor(icon);
                    return (
                        <div key={t} className="flex gap-3 rounded-[8px] border border-parchment-400 p-4">
                            <I className="size-7 shrink-0 text-verified-500" strokeWidth={1.5} aria-hidden="true" />
                            <p className="text-xs text-ink-600"><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span>{b}</p>
                        </div>
                    );
                })}
            </div>
            {c.why_trust && <p className="mt-4 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">Trusted by Businesses Across Africa</strong>{c.why_trust}</p>}
        </div>
    );
}

function OfferCard({ r }: { r: RelatedOffer }) {
    return (
        <div className="flex flex-col rounded-[8px] border border-parchment-400 p-4">
            <ShopIcon name={r.icon} size="sm" />
            <Link href={r.url} className="mt-3 text-[0.8125rem] font-semibold text-ink-900 hover:text-gold-700">{r.name}</Link>
            <p className="mt-1 flex-1 text-xs text-ink-500">{r.tagline}</p>
            <p className="mt-3 text-sm font-bold text-gold-700">{r.price_zar ? `From ${zar(r.price_zar)}${r.price_unit ? ` /${r.price_unit}` : ''}` : r.act_label}</p>
            <div className="mt-2 flex gap-2">
                <Link href={`/shop/compare?items=${r.code}`} className="flex-1 rounded-[4px] border border-parchment-500 py-1.5 text-center text-xs font-semibold text-ink-700 hover:border-gold-500">Add to Compare</Link>
                <Link href={r.url} className="flex-1 rounded-[4px] border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800 hover:bg-gold-50">{r.cta}</Link>
            </div>
        </div>
    );
}

function Related({ p }: { p: ProductDetail }) {
    const [sub, setSub] = useState<'offers' | 'tools' | 'learning'>('offers');
    const next = p.related[0];
    const rest = p.related.slice(next ? 1 : 0);
    const list = sub === 'offers' ? rest.filter((r) => r.act !== 'A2') : rest.filter((r) => r.act === 'A2');
    return (
        <div className="space-y-5">
            <div>
                <H>{p.content.related_title ?? 'Related Offers / Next Best'}</H>
                <p className="-mt-2 text-[0.8125rem] text-ink-600">{p.content.related_intro ?? 'These governed offers help you go further. Each one is independently checked for current availability before it is shown.'}</p>
            </div>
            {next && (
                <div className="rounded-[8px] border border-verified-500/30 bg-verified-50/60 p-4">
                    <p className="flex items-center gap-2 font-semibold text-ink-900"><Star className="size-4 text-verified-700" aria-hidden="true" /> Recommended Next Step</p>
                    <p className="text-xs text-ink-600">{next.fit_reason}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 rounded-[6px] border border-parchment-400 bg-white p-3">
                        <ShopIcon name={next.icon} size="sm" />
                        <div className="min-w-0 flex-1"><p className="text-[0.8125rem] font-semibold text-ink-900">{next.name}</p><p className="text-xs text-ink-500">{next.tagline}</p></div>
                        <div className="text-right"><p className="text-sm font-bold text-gold-700">{next.price_zar ? `From ${zar(next.price_zar)}` : next.act_label}</p><Link href={next.url} className="text-xs font-semibold text-gold-800 underline">View Details</Link></div>
                    </div>
                </div>
            )}
            <div role="tablist" className="flex gap-4 border-b border-parchment-400 text-[0.8125rem]">
                {([['offers', 'Related Offers'], ['tools', 'Tools & Templates'], ['learning', 'Learning & Insights']] as const).map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={sub === k} onClick={() => setSub(k)} className={cn('-mb-px border-b-2 px-1 py-2', sub === k ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-500')}>{l}</button>
                ))}
            </div>
            {sub === 'learning' ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                    {[['Webinars', '/webinars'], ['KP Thought Leadership', '/thought-leadership'], ['Resource Library', '/resources'], ['Guides & Reports', '/resources']].map(([t, h]) => (
                        <li key={t}><Link href={h} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-3 text-[0.8125rem] font-medium hover:border-gold-500"><Sparkles className="size-4 text-gold-700" aria-hidden="true" />{t}</Link></li>
                    ))}
                </ul>
            ) : list.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{list.map((r) => <OfferCard key={r.slug} r={r} />)}</div>
            ) : (
                <p className="text-sm text-ink-500">No governed offers in this group are currently available.</p>
            )}
            <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
                <Sparkles className="size-5 text-controlled-700" aria-hidden="true" />
                <p className="flex-1 text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">Not sure what's next?</strong>Use our Strategy Path Finder to get a personalised recommendation.</p>
                <Link href="/shop/resolver" className="rounded-[4px] border border-controlled-500 px-3 py-1.5 text-xs font-semibold text-controlled-700">Try Strategy Path Finder →</Link>
            </div>
        </div>
    );
}

export function TabBody({ p, tab }: { p: ProductDetail; tab: TabKey }) {
    const c = p.content;
    switch (tab) {
        case 'overview': return <Overview p={p} />;
        case 'delivery': return <Delivery p={p} />;
        case 'why': return <Why p={p} />;
        case 'related': return <Related p={p} />;
        case 'included':
            return (
                <div className="grid gap-6 md:grid-cols-2">
                    <div><H>Included in this product</H><CheckList items={c.achieve ?? []} /></div>
                    <div>{c.deliverables ? (<><H>Deliverables</H><Deliverables items={c.deliverables} /></>) : (<><H>Quality controls</H><CheckList tone="green" items={c.quality ?? ['Human review before release', 'Version-controlled content', 'Exact licence and jurisdiction shown']} /></>)}</div>
                </div>
            );
        case 'who':
            return <div><H>Who It's For</H><p className="mb-3 text-[0.8125rem] text-ink-600">Best for {p.best_for}.</p><CheckList items={c.best_for_list ?? []} /></div>;
        case 'how':
            return (
                <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {(c.how_it_works ?? []).map(([t, b], i) => (
                        <li key={t} className="rounded-[8px] border border-parchment-400 p-4"><span className="flex size-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span><p className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{t}</p><p className="mt-1 text-xs text-ink-500">{b}</p></li>
                    ))}
                </ol>
            );
        case 'requirements': return <div><H>Requirements</H><CheckList items={c.requirements ?? []} /></div>;
        case 'support': return <div><H>Support</H><CheckList tone="green" items={c.support_list ?? []} /></div>;
        case 'plans':
            return (
                <div className="grid gap-3 md:grid-cols-2">
                    {(p.variants.plans ?? []).map((pl) => (
                        <div key={pl.key} className="rounded-[8px] border border-parchment-400 p-4">
                            <p className="font-semibold text-ink-900">{pl.name}</p>
                            <p className="text-lg font-bold text-gold-700">{zar(pl.zar)} <span className="text-xs font-normal text-ink-500">/ {p.price_unit ?? 'month'} excl. VAT</span></p>
                            <div className="mt-2"><CheckList tone="green" items={pl.includes ?? []} /></div>
                        </div>
                    ))}
                </div>
            );
        case 'tiers':
            return (
                <div className="space-y-4">
                    <div className="grid gap-2 sm:grid-cols-5">{(c.commitment_tiers ?? []).map(([k, l]) => <div key={k} className="rounded-[6px] border border-parchment-400 p-3 text-center"><p className="text-lg font-bold text-gold-700">{k}</p><p className="text-xs text-ink-600">{l}</p></div>)}</div>
                    <div className="overflow-x-auto"><table className="w-full text-left text-[0.8125rem]"><thead className="text-xs text-ink-500"><tr><th className="py-1.5">Tier</th><th>Allowance</th><th>Monthly fee (excl. VAT)</th></tr></thead><tbody className="divide-y divide-parchment-300">{(p.variants.commitments ?? []).map((t) => <tr key={t.key}><td className="py-2 font-medium">{t.name}</td><td>{t.hours} hours</td><td>{zar(t.zar)}</td></tr>)}</tbody></table></div>
                </div>
            );
        case 'overage':
            return <div className="space-y-2 text-[0.8125rem] text-ink-700"><H>Pricing & Overage</H><p>Fees are billed monthly in advance. Each tier quantifies an hourly allowance (C1) against a bounded scope (C2) with reserved adviser capacity (C3).</p><p>Unused hours follow the agreed unused treatment (C4) and additional hours follow the overage treatment (C5): billed at the agreed rate, pre-approved, or hard-capped. Minimum term 3 months.</p></div>;
        case 'reviews':
            return <div className="flex items-center gap-4"><p className="text-4xl font-bold text-ink-900">{p.rating ?? '-'}</p><div><p className="flex text-gold-500" aria-label={`${p.rating} out of 5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn('size-4', i <= Math.round(p.rating ?? 0) && 'fill-gold-500')} />)}</p><p className="text-xs text-ink-500">Based on {p.reviews_count} verified client reviews</p></div></div>;
        case 'faqs':
            return <dl className="space-y-3">{(c.faqs ?? []).map((f) => <div key={f.q} className="rounded-[6px] border border-parchment-400 p-3"><dt className="text-[0.8125rem] font-semibold text-ink-900">{f.q}</dt><dd className="mt-1 text-xs text-ink-600">{f.a}</dd></div>)}</dl>;
        default:
            return null;
    }
}

export function TabBar({ tabs, value, onChange }: { tabs: { key: TabKey; label: string }[]; value: TabKey; onChange: (k: TabKey) => void }) {
    return (
        <div role="tablist" aria-label="Product information" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
            {tabs.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={t.key === value} onClick={() => onChange(t.key)}
                    className={cn('-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[0.8125rem] whitespace-nowrap', t.key === value ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900')}>
                    {t.label}
                </button>
            ))}
        </div>
    );
}

