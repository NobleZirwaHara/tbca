import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, MapPin, Search, Star, UserPlus } from 'lucide-react';
import { Input, Select } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Tag } from '@/Components/ui/Kit';
import { MkHeader } from '@/Components/Marketplace/ui';
import type { MkProvider, Option } from '@/types/marketplace';

interface Props {
    providers: MkProvider[];
    filters: { q?: string; category?: string; country?: string; tier?: string; sort?: string };
    categories: Option[];
    countries: Option[];
    tiers: string[];
}

export default function Providers({ providers, filters, categories, countries, tiers }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (patch: Partial<Props['filters']>) =>
        router.get('/marketplace/providers', Object.fromEntries(Object.entries({ ...filters, q, ...patch }).filter(([, v]) => v)), { preserveState: true, preserveScroll: true, replace: true });

    return (
        <>
            <Head title="Marketplace Providers" />
            <MkHeader
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Providers' }]}
                eyebrow="Provider Network"
                title="Verified Marketplace Providers"
                lead="Every provider is ID, credential and track-record verified, works under TBCA QA standards and is paid only on successful delivery. Matching is governed by TBCA — this is not an open directory."
                aside={
                    <div className="max-w-xs rounded-[8px] border border-gold-400/60 bg-gold-50 p-4">
                        <p className="flex items-center gap-2 font-semibold text-ink-900"><UserPlus className="size-5 text-gold-600" aria-hidden="true" /> Become a Provider</p>
                        <p className="mt-1 text-sm text-ink-600">Join the TBCA Marketplace and grow your business with trusted clients across Africa.</p>
                        <ButtonLink href="/marketplace/providers/apply" size="sm" className="mt-3">Apply to Join</ButtonLink>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <div className="flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <form role="search" className="relative min-w-52 flex-1" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                            <Input aria-label="Search providers" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search providers or cities…" className="pl-9" />
                        </form>
                        <Select aria-label="Category" className="w-48" value={filters.category ?? ''} placeholder="All categories" options={categories} onChange={(e) => apply({ category: e.target.value })} />
                        <Select aria-label="Country" className="w-44" value={filters.country ?? ''} placeholder="All countries" options={countries} onChange={(e) => apply({ country: e.target.value })} />
                        <Select aria-label="Tier" className="w-36" value={filters.tier ?? ''} placeholder="All tiers" options={tiers} onChange={(e) => apply({ tier: e.target.value })} />
                        <Select aria-label="Sort" className="w-44" value={filters.sort ?? 'rating'} options={[{ value: 'rating', label: 'Sort: Rating' }, { value: 'engagements', label: 'Sort: Engagements' }, { value: 'name', label: 'Sort: Name' }]} onChange={(e) => apply({ sort: e.target.value })} />
                        <Button type="button" size="sm" variant="ink" onClick={() => apply({})}>Search</Button>
                    </div>
                    <p className="mt-4 text-sm text-ink-500">{providers.length} verified provider{providers.length === 1 ? '' : 's'}</p>
                    <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {providers.map((p) => (
                            <li key={p.slug} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-ink-900 font-serif text-xl font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-ink-900">{p.name}</p>
                                        <p className="text-xs text-ink-500">{p.categoryLabel}</p>
                                        <p className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="size-3" aria-hidden="true" /> {p.city}, {p.country}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                    <Tag tone="good"><BadgeCheck className="mr-1 size-3" aria-hidden="true" />{p.statusLabel}</Tag>
                                    {p.tier && <Tag tone="gold">{p.tier} Tier</Tag>}
                                    <span className="flex items-center gap-1"><Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" /> {p.rating ?? '—'} ({p.reviewsCount})</span>
                                </div>
                                <p className="mt-2 flex-1 text-xs text-ink-500">{p.engagementsCount} engagements · {(p.profile.countries ?? []).length || 1} countries served</p>
                                <Link href={`/marketplace/providers/${p.slug}`} className="mt-4 text-sm font-semibold text-gold-700 hover:underline">View rating &amp; tier →</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
