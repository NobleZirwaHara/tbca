import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, KpPage, ThemeCover, type KpResource, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    category: string;
    q: string;
    categories: { key: string; label: string; count: number }[];
    total: number;
    featured: KpResource[];
    rows: KpResource[];
}

const ART: Record<string, string> = { framework: 'strategy-execution', report: 'markets-growth', tool: 'capital-funding', checklist: 'governance-boards', guide: 'project-development', template: 'leadership-people', media: 'technology-ai' };
const QUICK: [string, string][] = [['Capital Readiness Tools', `${BASE}/tools/scorecards/capital-readiness`], ['Project Development Playbook', `${BASE}/resources?q=playbook`], ['Board & Governance Resources', `${BASE}/resources?category=checklist`], ['Market & Industry Insights', `${BASE}/sectors/financial-services`], ['Execution & Performance Tools', `${BASE}/tools/checklists/go-no-go`]];
const PER = 8;

/** KP-SCR-013 KP Resources. Downloads are summary sheets until KP supplies the final files. */
export default function Resources({ screen, kpNav, category, q, categories, total, featured, rows }: Props) {
    const [query, setQuery] = useState(q);
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(rows.length / PER));
    const go = (over: Record<string, string>) => router.get(`${BASE}/resources`, Object.fromEntries(Object.entries({ category, q: query, ...over }).filter(([, v]) => v && v !== 'all')), { preserveScroll: true });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['KP Resources']]}
            title="KP Resources"
            subtitle="Tools, frameworks and references to help you think, decide and act."
            intro="Curated resources from Kruger Phiri and The Business Clinic.Africa to support better decisions and stronger execution."
            rail={
                <>
                    <form className="relative" onSubmit={(e) => { e.preventDefault(); go({ q: query }); }}>
                        <label htmlFor="rq" className="sr-only">Search resources</label>
                        <input id="rq" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-9 pl-3 text-[0.875rem]" />
                        <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2"><L.Search className="size-4 text-ink-500" /><span className="sr-only">Search</span></button>
                    </form>
                    <Box title="Resource Categories">
                        <ul className="space-y-1">
                            <li><button type="button" onClick={() => go({ category: 'all' })} className={cn('flex w-full justify-between text-[0.8125rem]', category === 'all' && 'font-bold text-gold-800')}>All Resources<span>{total}</span></button></li>
                            {categories.map((c) => <li key={c.key}><button type="button" onClick={() => go({ category: c.key })} className={cn('flex w-full justify-between text-[0.8125rem]', category === c.key && 'font-bold text-gold-800')}>{c.label}<span>{c.count}</span></button></li>)}
                        </ul>
                    </Box>
                    <Box title="Quick Access">
                        <ul className="space-y-1.5">{QUICK.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><L.ArrowRight className="size-3.5 text-gold-600" aria-hidden="true" />{t}</Link></li>)}</ul>
                    </Box>
                    <Box title="Need Something Specific?" tone="cream">
                        <p className="text-[0.8125rem]">Can't find what you're looking for? Let us know and we'll point you in the right direction.</p>
                        <BtnLink href="/contact?subject=KP%20resource%20request" className="mt-2 w-full" icon="arrow-right">Request a Resource</BtnLink>
                    </Box>
                </>
            }
        >
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Resource categories">
                {[{ key: 'all', label: 'All Resources' }, ...categories].map((c) => (
                    <button key={c.key} type="button" role="tab" aria-selected={category === c.key} onClick={() => go({ category: c.key })} className={cn('rounded-[6px] border px-3 py-1.5 text-[0.8125rem] font-semibold', category === c.key ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-white text-ink-700')}>{c.label}</button>
                ))}
            </div>

            {category === 'all' && !q && (
                <section>
                    <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Featured Resources</h2>
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {featured.map((r) => (
                            <li key={r.slug} className="flex flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                                <ThemeCover theme={ART[r.category] ?? 'strategy-execution'} seed={r.slug} label={r.title} className="aspect-[16/10]"><span className="absolute top-2 left-2 rounded-[4px] bg-ink-950/80 px-2 py-0.5 text-[0.625rem] font-bold text-gold-400 uppercase">{r.categoryLabel}</span></ThemeCover>
                                <div className="flex flex-1 flex-col p-3">
                                    <p className="text-[0.8125rem] font-bold text-ink-900">{r.title}</p>
                                    <p className="mt-1 flex-1 text-[0.6875rem] text-ink-600">{r.body}</p>
                                    <p className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-500">{r.format}<a href={r.href} aria-label={`Download summary of ${r.title}`} className="text-gold-700"><L.Download className="size-4" /></a></p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section>
                <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Resource Library</h2>
                {rows.length === 0 ? <Empty>No resources match.</Empty> : (
                    <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white">
                        <table className="w-full text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-ink-700"><tr><th className="px-3 py-2">Resource Name</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Description</th><th className="px-3 py-2">Format</th><th className="px-3 py-2">Action</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {rows.slice((page - 1) * PER, page * PER).map((r) => (
                                    <tr key={r.slug}>
                                        <td className="px-3 py-2 font-semibold text-ink-900">{r.title}</td>
                                        <td className="px-3 py-2"><span className="rounded-[4px] bg-controlled-50 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-controlled-700">{r.categoryLabel}</span></td>
                                        <td className="px-3 py-2">{r.topic}</td>
                                        <td className="px-3 py-2 text-ink-600">{r.body}</td>
                                        <td className="px-3 py-2">{r.format}</td>
                                        <td className="px-3 py-2"><a href={r.href} className={btnClass('outline', 'sm')}>Summary <L.Download className="size-3.5" /></a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.75rem] text-ink-500">
                    <span>Showing {rows.length ? (page - 1) * PER + 1 : 0} to {Math.min(rows.length, page * PER)} of {rows.length} resources. Each download is a summary sheet until the final file is supplied.</span>
                    {pages > 1 && <span className="flex gap-1">{Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => setPage(p)} className={cn('size-8 rounded-[6px] border', p === page ? 'border-gold-500 bg-gold-500 font-bold text-ink-900' : 'border-parchment-500 bg-white')}>{p}</button>)}</span>}
                </div>
            </section>
        </KpPage>
    );
}
