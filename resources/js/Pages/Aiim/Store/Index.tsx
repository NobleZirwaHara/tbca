import { Link, router } from '@inertiajs/react';
import { CalendarDays, FileText, Lock, Search, ShoppingCart } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import BriefArt from '@/Components/Aiim/BriefArt';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import { Pagination } from '@/Components/Aiim/SearchKit';
import AiimPage, { RailBox, SelectionBox } from '@/Components/Aiim/Shell';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, BriefItem, Paginated } from '@/types/aiim';

interface Props extends AiimPageProps {
    filters: { q: string; category: string; format: string; price: string; sort: string };
    results: Paginated<BriefItem>;
    categories: string[];
    owned: string[];
}

export function addToCart(b: BriefItem) {
    router.post('/basket', { item_type: 'aiim-brief', item_code: b.sku, name: b.title, unit_zar: Math.round(b.price / 1.15), variant: 'Standard Access', commercial_act: 'purchase' }, { preserveScroll: true });
}

export default function StoreIndex({ filters, results, categories, owned }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (next: Partial<Props['filters']>) => router.get('/aiim/store', { ...filters, q, ...next }, { preserveScroll: true, preserveState: true });
    const submit = (e: FormEvent) => { e.preventDefault(); go({ q }); };
    const select = 'h-10 rounded border border-parchment-500 bg-white px-2 text-sm';

    return (
        <AiimPage
            title="AIIM Premium Brief Store"
            crumbs={[{ label: 'Premium Intelligence' }, { label: 'Premium Brief Store' }]}
            heading={<>AIIM Premium Brief Store <Lock className="size-6 text-gold-600" /></>}
            subtitle="Citable. Source-backed. Decision-ready."
            description="Purchase standard premium briefs and data products across Africa's 54 markets. All products include verified sources, methodology notes and clear usage rights."
            rail={<><SelectionBox /><RailBox title="Need Help?"><p className="mb-3 text-xs text-ink-300">Our team is here to help you find the right intelligence for your decision.</p><ButtonLink href="/aiim/custom-intelligence" size="sm" className="w-full">Request Human Assistance</ButtonLink><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="mt-2 w-full">Talk to an AIIM Advisor</ButtonLink></RailBox></>}
        >
            <div className="mb-3 flex flex-wrap gap-3">
                <form onSubmit={submit} className="flex min-w-[14rem] flex-1 items-center rounded border border-parchment-500 bg-white px-2">
                    <label htmlFor="brief-q" className="sr-only">Search briefs</label>
                    <input id="brief-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search briefs, topics or keywords…" className="h-10 flex-1 text-sm outline-none" />
                    <button type="submit" aria-label="Search"><Search className="size-4 text-ink-400" /></button>
                </form>
                <select aria-label="Category" value={filters.category} onChange={(e) => go({ category: e.target.value })} className={select}><option value="">All Categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                <select aria-label="Format" value={filters.format} onChange={(e) => go({ format: e.target.value })} className={select}><option value="">All Formats</option><option value="PDF">PDF</option><option value="Excel">Excel</option></select>
                <select aria-label="Price" value={filters.price} onChange={(e) => go({ price: e.target.value })} className={select}><option value="">All Prices</option><option value="under-2500">Under R2,500</option><option value="2500-3000">R2,500 – R3,000</option><option value="over-3000">Over R3,000</option></select>
                <select aria-label="Sort" value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className={select}><option value="popular">Sort by: Popular</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
                {['', ...categories].map((c) => (
                    <button key={c || 'all'} type="button" onClick={() => go({ category: c })} className={cn('rounded-full border px-3 py-1 text-xs', filters.category === c ? 'border-ink-900 bg-ink-900 text-parchment-100' : 'border-parchment-500 bg-white')}>{c || 'All Briefs'}</button>
                ))}
            </div>
            <p className="mb-3 text-sm font-semibold">{results.total} premium briefs available</p>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {results.data.map((b) => (
                    <li key={b.sku} className="flex flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                        <div className="relative"><BriefArt seed={b.sku} category={b.category} label={b.title} src={b.image} className="aspect-[16/9] w-full" />{b.badge && <Chip tone="gold" className="absolute top-2 left-2 uppercase">{b.badge}</Chip>}</div>
                        <div className="flex flex-1 flex-col p-3">
                            <Link href={`/aiim/store/${b.sku}`} className="font-semibold text-ink-900 hover:text-gold-700">{b.title}</Link>
                            <p className="mt-1 flex-1 text-xs text-ink-600">{b.summary}</p>
                            <p className="mt-2 flex gap-3 text-[0.6875rem] text-ink-500"><span className="flex items-center gap-1"><FileText className="size-3" />{b.format}</span><span>{b.size}</span><span className="flex items-center gap-1"><CalendarDays className="size-3" />{b.published}</span></p>
                            <p className="mt-2 font-bold">{zar2(b.price)}</p>
                            <p className="text-[0.65rem] text-ink-400">incl. VAT</p>
                            <ButtonLink href={`/aiim/store/${b.sku}`} variant="outline" size="sm" className="mt-2 w-full">View Details</ButtonLink>
                            {owned.includes(b.sku) ? <Chip tone="good" className="mt-2 justify-center">Owned</Chip> : <Button type="button" size="sm" className="mt-2 w-full" onClick={() => addToCart(b)}><ShoppingCart className="size-4" />Add to Cart</Button>}
                        </div>
                    </li>
                ))}
            </ul>
            {results.data.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No briefs match your filters.</p>}
            <div className="mt-4 overflow-hidden rounded-[8px] bg-ink-950"><Pagination page={results} noun="briefs" /></div>
        </AiimPage>
    );
}
