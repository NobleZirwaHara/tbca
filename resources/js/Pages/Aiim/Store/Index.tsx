import { Link, router } from '@inertiajs/react';
import { Briefcase, Search, ShoppingCart } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Pagination } from '@/Components/Aiim/SearchKit';
import { CtaBand, DataMeta, Hero, PillLink, Section, SvcPrice, pill, ProtoFrame, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { zar2 } from '@/Components/Aiim/format';
import { cn } from '@/lib/cn';
import type { AiimPageProps, BriefItem, Paginated } from '@/types/aiim';

export interface BwBrief { code: string; product: string; forWhom: string; contents: string; svc: SvcCard | null }

interface Props extends AiimPageProps {
    briefs: BwBrief[];
    formats: SvcCard[];
    filters: { q: string; category: string; format: string; price: string; sort: string };
    results: Paginated<BriefItem>;
    categories: string[];
    owned: string[];
}

export function addToCart(b: BriefItem) {
    router.post('/basket', { item_type: 'aiim-brief', item_code: b.sku, name: b.title, unit_zar: Math.round(b.price / 1.15), variant: 'Standard Access', commercial_act: 'purchase' }, { preserveScroll: true });
}

/** Page 34: AIIM Premium Brief Store. */
export default function StoreIndex({ briefs, formats, filters, results, categories, owned }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (next: Partial<Props['filters']>) => router.get('/aiim/store', { ...filters, q, ...next }, { preserveScroll: true, preserveState: true, only: ['results', 'filters'] });
    const submit = (e: FormEvent) => { e.preventDefault(); go({ q }); };
    const buy = (code: string) => router.post(`/aiim/store/${code}/buy`);
    const select = 'h-9 rounded-[8px] border border-parchment-500 bg-white px-2 text-[0.8rem]';

    return (
        <ProtoFrame title="AIIM Premium Brief Store" crumbs={[{ label: 'Botswana', href: '/aiim/country/botswana' }, { label: 'Premium Brief Store' }]}>
            <Hero
                eyebrow="AIIM Premium Brief Store"
                title="17 Botswana premium products and 12 report formats"
                lead="PART J of the Country Pack. Each brief is priced through the embedded-service register and delivered to your workspace."
                meta={<DataMeta />}
                actions={<><PillLink href="/aiim/store/BW-REPORT/configure"><Briefcase className="size-3.5" />Configure a report</PillLink><PillLink href="/aiim/wallet" tone="dark">Wallet &amp; credits</PillLink></>}
            />

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {briefs.map((p) => {
                    const own = owned.includes(p.code);
                    return (
                        <li key={p.code} className="flex min-w-0 flex-col rounded-[12px] border border-parchment-400 bg-white p-4">
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-[0.72rem] text-ink-500">{p.code}</span>
                                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-semibold text-gold-800">{p.forWhom}</span>
                            </div>
                            <h3 className="mt-2 text-[1rem] font-bold text-ink-900">{p.product}</h3>
                            <p className="mt-1 flex-1 text-[0.82rem] text-ink-500">{p.contents}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-parchment-300 pt-3">
                                <span className="text-[0.84rem]">{p.svc && <SvcPrice s={p.svc} prefix="from " />} {p.svc?.status === 'priced' && <span className="font-mono text-ink-400">excl. VAT</span>}</span>
                                <span className="flex gap-1.5">
                                    <PillLink href={`/aiim/store/${p.code}`} tone="ghost" size="xs">Details</PillLink>
                                    {own ? <PillLink href="/aiim/workspace/entitlements" size="xs">Owned</PillLink> : p.svc?.status === 'priced' && <button type="button" className={pill('gold', 'xs')} onClick={() => buy(p.code)}>Buy</button>}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <Section title="Report formats" sub="AIIM report services 192–203.">
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {formats.map((s) => (
                        <li key={s.code}>
                            <Link href={`/aiim/services/${s.code}`} className="flex h-full flex-col rounded-[12px] border border-parchment-400 bg-white p-4 hover:border-gold-400">
                                <span className="font-mono text-[0.7rem] text-ink-500">{s.code}</span>
                                <h4 className="mt-1 flex-1 text-[0.9rem] font-bold text-ink-900">{s.name}</h4>
                                <span className="mt-3 flex items-center justify-between gap-2 border-t border-parchment-300 pt-3 text-[0.84rem]"><SvcPrice s={s} /><span className="text-ink-500">{s.db}</span></span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="More premium briefs" sub="Briefs and data packs for other African markets in the AIIM catalogue. Prices include VAT.">
                <div className="mb-3 flex flex-wrap gap-2">
                    <form onSubmit={submit} className="flex min-w-[14rem] flex-1 items-center rounded-[8px] border border-parchment-500 bg-white px-2">
                        <label htmlFor="brief-q" className="sr-only">Search briefs</label>
                        <input id="brief-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search briefs, topics or keywords…" className="h-9 flex-1 text-[0.82rem] outline-none" />
                        <button type="submit" aria-label="Search"><Search className="size-4 text-ink-400" /></button>
                    </form>
                    <select aria-label="Category" value={filters.category} onChange={(e) => go({ category: e.target.value })} className={select}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                    <select aria-label="Price" value={filters.price} onChange={(e) => go({ price: e.target.value })} className={select}><option value="">All prices</option><option value="under-2500">Under R2,500</option><option value="2500-3000">R2,500 to R3,000</option><option value="over-3000">Over R3,000</option></select>
                    <select aria-label="Sort" value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className={select}><option value="popular">Popular</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {results.data.map((b) => (
                        <li key={b.sku} className="flex min-w-0 flex-col rounded-[12px] border border-parchment-400 bg-white p-4">
                            <span className="text-[0.7rem] text-ink-500">{b.category} · {b.format}</span>
                            <Link href={`/aiim/store/${b.sku}`} className="mt-1 text-[0.9rem] font-bold text-ink-900 hover:text-gold-700">{b.title}</Link>
                            <p className="mt-1 line-clamp-3 flex-1 text-[0.78rem] text-ink-500">{b.summary}</p>
                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-parchment-300 pt-3">
                                <b className="font-mono text-[0.84rem]">{zar2(b.price)}</b>
                                <span className="flex gap-1.5">
                                    <PillLink href={`/aiim/store/${b.sku}`} tone="ghost" size="xs">Details</PillLink>
                                    {owned.includes(b.sku) ? <PillLink href="/aiim/workspace/entitlements" size="xs">Owned</PillLink> : <button type="button" className={cn(pill('gold', 'xs'))} onClick={() => addToCart(b)}><ShoppingCart className="size-3" />Add</button>}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
                {results.data.length === 0 && <p className="py-6 text-center text-[0.84rem] text-ink-500">No briefs match your filters.</p>}
                {results.last_page > 1 && <div className="mt-3 overflow-hidden rounded-[10px] bg-ink-950"><Pagination page={results} noun="briefs" /></div>}
            </Section>

            <CtaBand />
        </ProtoFrame>
    );
}
