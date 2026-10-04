import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bookmark, CalendarDays, Clock, MapPin, Search, TrendingUp } from 'lucide-react';
import { Input, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import { Tag } from '@/Components/ui/Kit';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, zarCode } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { MkBrief, MkProvider, Option } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    briefs: (MkBrief & { match: number; saved: boolean; proposed: boolean })[];
    filters: { q?: string; country?: string; category?: string; budget?: string; view?: string; sort?: string };
    stats: { total: number; week: number; high: number; matching: number; saved: number };
    options: { countries: Option[]; categories: Option[]; budgets: Option[] };
    trending: { label: string; count: number }[];
}

const flagTone: Record<string, 'bad' | 'gold' | 'info' | 'good'> = { 'HIGH PRIORITY': 'bad', FEATURED: 'gold', NEW: 'info', MATCHED: 'good', POPULAR: 'gold' };

function Ring({ value }: { value: number }) {
    const c = 2 * Math.PI * 16;
    return (
        <svg viewBox="0 0 40 40" className="size-14 -rotate-90" role="img" aria-label={`Match score ${value}%`}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#ece6d8" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke={value >= 85 ? '#1f9d55' : '#2f6fdd'} strokeWidth="4" strokeDasharray={`${(value / 100) * c} ${c}`} />
            <text x="20" y="24" textAnchor="middle" transform="rotate(90 20 20)" className="fill-ink-900 text-[10px] font-bold">{value}%</text>
        </svg>
    );
}

export default function Opportunities({ provider, briefs, filters, stats, options, trending }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (patch: Partial<Props['filters']>) =>
        router.get('/marketplace/provider/opportunities', Object.fromEntries(Object.entries({ ...filters, q, ...patch }).filter(([, v]) => v)), { preserveScroll: true, preserveState: true, replace: true });

    return (
        <ProviderShell title="Opportunity Feed" description="Discover live opportunities across Africa tailored to your focus and expertise.">
            <Head title="Opportunity Feed" />
            {!provider.routable && <p className="mb-4 rounded border border-attested-500/40 bg-attested-50 p-3 text-sm text-attested-700">You can browse briefs, but proposals open once your provider status is Active.</p>}
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <Card title="Search & Filter Opportunities">
                        <div className="flex flex-wrap gap-3">
                            <form role="search" className="relative min-w-52 flex-1" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                                <Input aria-label="Search opportunities" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, sector, country, keyword..." />
                            </form>
                            <Select aria-label="Country" className="w-44" value={filters.country ?? ''} placeholder="All Countries" options={options.countries} onChange={(e) => apply({ country: e.target.value })} />
                            <Select aria-label="Sector" className="w-48" value={filters.category ?? ''} placeholder="All Sectors" options={options.categories} onChange={(e) => apply({ category: e.target.value })} />
                            <Select aria-label="Budget range" className="w-48" value={filters.budget ?? ''} placeholder="Investment Range" options={options.budgets} onChange={(e) => apply({ budget: e.target.value })} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {[['', 'All Opportunities'], ['matched', 'Matching My Profile'], ['saved', 'Saved Opportunities']].map(([v, l]) => (
                                <button key={v} type="button" aria-pressed={(filters.view ?? '') === v} onClick={() => apply({ view: v || undefined })} className={cn('rounded border px-3 py-1 text-xs', (filters.view ?? '') === v ? 'border-controlled-600 bg-controlled-600 text-white' : 'border-parchment-500 text-ink-700')}>{l}</button>
                            ))}
                            <button type="button" className="ml-auto text-xs text-ink-500 underline" onClick={() => { setQ(''); router.get('/marketplace/provider/opportunities'); }}>Clear All</button>
                            <Select aria-label="Sort" className="w-48" value={filters.sort ?? 'newest'} options={[{ value: 'newest', label: 'Sort by: Newest First' }, { value: 'match', label: 'Sort by: Match Score' }, { value: 'budget', label: 'Sort by: Budget' }]} onChange={(e) => apply({ sort: e.target.value })} />
                        </div>
                    </Card>
                    <Card title="Opportunity Overview">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            {[['Total Opportunities', stats.total], ['New This Week', stats.week], ['High Priority', stats.high], ['Matching My Profile', stats.matching], ['Saved Opportunities', stats.saved]].map(([k, v]) => <div key={k as string}><p className="text-xs text-ink-500">{k}</p><p className="text-2xl font-bold text-ink-900">{v}</p></div>)}
                        </div>
                    </Card>
                    <h2 className="font-semibold text-ink-900">Latest Opportunities</h2>
                    <ul className="space-y-3">
                        {briefs.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">No opportunities match your filters.</li>}
                        {briefs.map((b) => {
                            const flag = (b.data.flag as string | undefined) ?? ((b.priorityScore ?? 0) >= 80 ? 'HIGH PRIORITY' : 'NEW');
                            const l = b.scope.ledgers;
                            return (
                                <li key={b.reference} className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[9rem_1fr_auto_auto_auto]">
                                    <div className="relative h-24 overflow-hidden rounded bg-gradient-to-br from-gold-700 via-ink-800 to-ink-950"><span className="absolute top-2 left-2"><Tag tone={flagTone[flag] ?? 'info'}>{flag}</Tag></span></div>
                                    <div className="min-w-0">
                                        <Link href={`/marketplace/provider/opportunities/${b.reference}`} className="font-semibold text-ink-900 hover:underline">{b.title}</Link>
                                        <p className="line-clamp-2 text-xs text-ink-600">{b.data.description}</p>
                                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500"><MapPin className="size-3" aria-hidden="true" />{b.data.country}<Tag tone="good" className="normal-case">{b.data.industry}</Tag><Tag tone="info" className="normal-case">{b.categoryLabel}</Tag></p>
                                        <p className="mt-1 flex gap-3 text-xs text-ink-400"><span><Clock className="mr-1 inline size-3" aria-hidden="true" />Posted {b.createdAt}</span><span><CalendarDays className="mr-1 inline size-3" aria-hidden="true" />Due {b.data.delivery_date}</span></p>
                                        {b.proposed && <Tag tone="good" className="mt-1">Proposal submitted</Tag>}
                                    </div>
                                    <div className="text-xs"><p className="text-ink-500">Budget Range</p><p className="text-base font-bold text-verified-700">{b.budgetLabel}</p>{l && <p className="text-ink-500">Provider rate cap {zarCode(l.c)}</p>}</div>
                                    <div className="text-center text-xs"><p className="text-ink-500">Match Score</p><Ring value={b.match} /></div>
                                    <button type="button" aria-label={b.saved ? 'Remove from saved' : 'Save opportunity'} aria-pressed={b.saved} onClick={() => router.post(`/marketplace/provider/opportunities/${b.reference}/save`, {}, { preserveScroll: true })} className="self-start">
                                        <Bookmark className={cn('size-5', b.saved ? 'fill-gold-500 text-gold-600' : 'text-ink-400')} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Opportunity Alerts">
                        <ul className="space-y-2 text-sm">{[['New High Priority', stats.high, 'bg-risk-500'], ['Matching Your Profile', stats.matching, 'bg-verified-500'], ['New This Week', stats.week, 'bg-controlled-500'], ['Saved', stats.saved, 'bg-gold-500']].map(([k, v, c]) => <li key={k as string} className="flex justify-between"><span>{k}</span><span className={`rounded-full px-2 text-xs font-bold text-white ${c}`}>{v}</span></li>)}</ul>
                    </Card>
                    <Card title="Trending Sectors">
                        <ol className="space-y-2 text-sm">{trending.map((t, i) => <li key={t.label} className="flex items-center justify-between"><span>{i + 1}. {t.label}<br /><span className="text-xs text-ink-500">{t.count} opportunities</span></span><TrendingUp className="size-4 text-verified-500" aria-hidden="true" /></li>)}</ol>
                    </Card>
                    <Button type="button" variant="outline" className="w-full" onClick={() => apply({ view: 'matched', sort: 'match' })}>Show best matches</Button>
                </aside>
            </div>
        </ProviderShell>
    );
}

Opportunities.layout = null;
