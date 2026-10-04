import { router } from '@inertiajs/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import ComparisonTable from '@/Components/Aiim/ComparisonTable';
import AiimPage, { DeeperBox, SelectionBox } from '@/Components/Aiim/Shell';
import { Progress } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Card, ComparisonData } from '@/types/aiim';

interface Props extends AiimPageProps {
    draft: ComparisonData & { reference: string; count: number };
    max: number;
    candidates: Card[];
    filters: { q: string; type: string; tab: string; sector: string; province: string };
    options: { sectors: { slug: string; name: string }[]; provinces: { slug: string; name: string }[] };
}

export default function CompareBuilder({ draft, max, candidates, filters, options }: Props) {
    const [f, setF] = useState(filters);
    const search = (next: Partial<typeof filters> = {}) => router.get('/aiim/workspace/compare', { ...f, ...next }, { preserveScroll: true, preserveState: true });
    const submit = (e: FormEvent) => { e.preventDefault(); search(); };
    const inDraft = (c: Card) => draft.columns.some((col) => col.card.key === c.key && col.card.type === c.type);
    const full = draft.count >= max;

    return (
        <AiimPage
            title="Comparison Builder"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Comparison Builder' }]}
            subtitle={`Compare up to ${max} items side-by-side across key investment metrics.`}
            description="Add items from your saved list or search to build a custom comparison."
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
                <aside className="space-y-3 rounded-[8px] bg-ink-950 p-4 text-parchment-100" aria-label="Add items to compare">
                    <h2 className="font-semibold">Add Items to Compare</h2>
                    <p className="text-xs text-ink-400">Select up to {max} items</p>
                    <div className="grid grid-cols-2 gap-1 rounded bg-ink-900 p-1 text-xs">
                        {[['search', 'Search'], ['saved', 'From Saved']].map(([k, l]) => (
                            <button key={k} type="button" aria-pressed={f.tab === k} onClick={() => { setF({ ...f, tab: k }); search({ tab: k }); }} className={cn('rounded py-1.5', f.tab === k ? 'bg-gold-500 font-semibold text-ink-900' : 'text-ink-200')}>{l}</button>
                        ))}
                    </div>
                    {f.tab === 'search' && (
                        <form onSubmit={submit} className="space-y-2 text-xs">
                            <label className="flex items-center rounded border border-ink-600 bg-ink-900 px-2">
                                <span className="sr-only">Search</span>
                                <input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search opportunities, projects, investors…" className="h-9 flex-1 bg-transparent outline-none" />
                                <Search className="size-4 text-ink-400" />
                            </label>
                            {[['type', 'Type', [['opportunity', 'Opportunities'], ['project', 'Projects'], ['investor', 'Investors'], ['funder', 'Funders'], ['corridor', 'Trade Corridors']]], ['sector', 'Sector', options.sectors.map((s) => [s.slug, s.name])], ['province', 'Province', options.provinces.map((s) => [s.slug, s.name])]].map(([k, l, opts]) => (
                                <label key={k as string} className="block">
                                    <span className="text-ink-300">{l as string}</span>
                                    <select value={f[k as keyof typeof f]} onChange={(e) => setF({ ...f, [k as string]: e.target.value })} className="mt-1 h-9 w-full rounded border border-ink-600 bg-ink-900 px-2">
                                        <option value="">All</option>
                                        {(opts as string[][]).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                                    </select>
                                </label>
                            ))}
                            <button type="submit" className="h-9 w-full rounded border border-gold-600 text-gold-300">Search</button>
                        </form>
                    )}
                    <ul className="max-h-80 space-y-1.5 overflow-y-auto">
                        {candidates.map((c) => (
                            <li key={`${c.type}-${c.key}`} className="flex items-center gap-2 rounded border border-ink-800 p-2 text-xs">
                                <span className="text-gold-500"><AiimIcon name={c.icon} className="size-4" /></span>
                                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name}</span><span className="text-ink-400">{c.type}</span></span>
                                <button type="button" disabled={inDraft(c) || full} onClick={() => router.post('/aiim/workspace/compare/items', { type: c.type, key: c.key }, { preserveScroll: true })} aria-label={`Add ${c.name}`} className="rounded bg-gold-500 p-1 text-ink-900 disabled:opacity-30">
                                    <Plus className="size-3.5" />
                                </button>
                            </li>
                        ))}
                        {candidates.length === 0 && <li className="text-xs text-ink-400">No matching items.</li>}
                    </ul>
                    <div>
                        <p className="mb-1 text-xs">{draft.count} of {max} slots used</p>
                        <Progress value={(draft.count / max) * 100} />
                    </div>
                </aside>

                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white">
                    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-parchment-400 bg-ink-950 px-4 py-3 text-parchment-100">
                        <h2 className="text-sm font-semibold">Comparing {draft.count} Items</h2>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => router.post('/aiim/workspace/compare/clear', {}, { preserveScroll: true })} className="flex items-center gap-1 text-xs text-gold-400 hover:underline"><Trash2 className="size-3.5" />Clear All</button>
                        </div>
                    </header>
                    {draft.count === 0 ? (
                        <p className="p-10 text-center text-sm text-ink-500">Add at least two items from the panel to start comparing.</p>
                    ) : (
                        <ComparisonTable data={draft} removable />
                    )}
                    <div className="flex justify-end border-t border-parchment-400 p-3">
                        <Button type="button" disabled={draft.count < 2} onClick={() => router.post('/aiim/workspace/compare/generate')} trailingIcon="arrow-right">Generate Comparison Results</Button>
                    </div>
                </section>
            </div>
        </AiimPage>
    );
}
