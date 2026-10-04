import { Link, router } from '@inertiajs/react';
import { Bell, BellOff, FileText, Scale, Search, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CompareButton, FeeButton, RailLink } from '@/Components/Aiim/Actions';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { ScoreRing } from '@/Components/Aiim/Charts';
import AiimPage, { DeeperBox, RailBox, SelectionBox } from '@/Components/Aiim/Shell';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Card } from '@/types/aiim';

interface Props extends AiimPageProps {
    list: 'saved' | 'watchlist';
    tab: string;
    q: string;
    sort: string;
    counts: Record<string, number>;
    items: (Card & { id: number; typeLabel: string; savedOn: string; alerts: boolean })[];
    compareCount: number;
}

const TABS: [string, string][] = [['all', 'All Items'], ['opportunity', 'Opportunities'], ['project', 'Projects'], ['investor', 'Investors'], ['funder', 'Funders'], ['corridor', 'Trade Corridors'], ['report', 'Reports'], ['source', 'Sources'], ['sector', 'Sectors']];

export default function Saved({ list, tab, q, sort, counts, items, compareCount }: Props) {
    const watch = list === 'watchlist';
    const path = watch ? '/aiim/workspace/watchlist' : '/aiim/workspace/saved';
    const [search, setSearch] = useState(q);
    const go = (params: Record<string, string>) => router.get(path, { tab, q: search, sort, ...params }, { preserveScroll: true, preserveState: true });
    const submit = (e: FormEvent) => { e.preventDefault(); go({ q: search }); };
    const remove = (i: Props['items'][number]) => router.post('/aiim/workspace/items', { list, type: i.type, key: i.key }, { preserveScroll: true });

    return (
        <AiimPage
            title={watch ? 'My Watchlist' : 'Saved Items'}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: watch ? 'Watchlist' : 'Saved Items' }]}
            subtitle={watch ? 'Track key opportunities, projects, investors, funders and corridors you are watching.' : 'All your saved opportunities, projects, investors, funders and more.'}
            description={watch ? 'Stay updated on items that matter to you.' : 'Review, compare and take action on items that matter to you.'}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <RailLink href="/aiim/workspace/compare" icon={<Scale className="size-4" />} label={`Compare ${watch ? 'Items' : 'Saved Items'}`} sub={`${compareCount} of 4 slots used`} />
                        <RailLink href="/aiim/fees/discover" icon={<FileText className="size-4" />} label="Create Report" sub="Price a report from selected items" />
                        <RailLink href={watch ? '/aiim/workspace/saved' : '/aiim/workspace/watchlist'} icon={<Bell className="size-4" />} label={watch ? 'View Saved Items' : 'Set Watchlist Alert'} sub="Get updates on items" />
                    </RailBox>
                    <DeeperBox />
                </>
            }
        >
            <div role="tablist" className="mb-3 flex flex-wrap gap-2">
                {TABS.filter(([k]) => k === 'all' || counts[k]).map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => go({ tab: k })} className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === k ? 'bg-ink-900 text-parchment-100' : 'border border-parchment-400 bg-white text-ink-700')}>
                        {l} <span className="ml-1 text-xs opacity-70">{counts[k] ?? 0}</span>
                    </button>
                ))}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <form onSubmit={submit} className="flex min-w-[14rem] flex-1 items-center rounded border border-parchment-500 px-2">
                    <label htmlFor="saved-search" className="sr-only">Search</label>
                    <input id="saved-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${watch ? 'watchlist' : 'saved items'}…`} className="h-9 flex-1 text-sm outline-none" />
                    <button type="submit" aria-label="Search"><Search className="size-4 text-ink-400" /></button>
                </form>
                <label className="flex items-center gap-2 text-xs text-ink-500">Sort by
                    <select value={sort} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded border border-parchment-500 px-2 text-sm">
                        <option value="newest">Date {watch ? 'Added' : 'Saved'} (Newest)</option><option value="oldest">Oldest</option><option value="score">Score</option><option value="name">Name</option>
                    </select>
                </label>
            </div>
            <p className="mb-2 text-sm font-semibold">{items.length} items</p>
            <ul className="space-y-2">
                {items.map((i) => (
                    <li key={i.id} className="grid items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 md:grid-cols-[3rem_minmax(0,2fr)_1fr_1fr_auto_auto_auto]">
                        <span className="flex size-12 items-center justify-center rounded bg-ink-900 text-gold-500"><AiimIcon name={i.icon} /></span>
                        <div className="min-w-0">
                            <Link href={i.url} className="font-semibold text-ink-900 hover:text-gold-700">{i.name}</Link>
                            <p className="truncate text-xs text-ink-500">{i.summary}</p>
                            <p className="text-[0.6875rem] text-ink-400">{i.typeLabel} · {i.location} · {i.sector}</p>
                        </div>
                        <div className="text-xs"><p className="text-ink-500">{i.metricLabel}</p><p className="font-semibold">{i.metric}</p></div>
                        <div className="text-xs"><p className="text-ink-500">{i.stageLabel}</p><p className="font-semibold">{i.stage}</p></div>
                        <div>{i.score !== null ? <ScoreRing value={i.score} size={44} /> : null}</div>
                        <div className="text-xs"><p className="text-ink-500">{watch ? 'Added On' : 'Saved on'}</p><p>{i.savedOn}</p></div>
                        <div className="flex items-center gap-1">
                            {watch && (
                                <button type="button" onClick={() => router.patch(`/aiim/workspace/items/${i.id}/alerts`, {}, { preserveScroll: true })} aria-label={i.alerts ? 'Pause alerts' : 'Enable alerts'} title={i.alerts ? 'Alerts on' : 'Alerts off'} className="p-1 text-gold-600">
                                    {i.alerts ? <Bell className="size-4" /> : <BellOff className="size-4 text-ink-400" />}
                                </button>
                            )}
                            {['opportunity', 'project', 'investor', 'funder', 'corridor'].includes(i.type) && <CompareButton type={i.type} itemKey={i.key} variant="icon" />}
                            {['opportunity', 'project', 'investor', 'funder', 'corridor', 'source'].includes(i.type) && <FeeButton type={i.type} itemKey={i.key} variant="icon" />}
                            <button type="button" onClick={() => remove(i)} aria-label="Remove" className="p-1 text-ink-400 hover:text-risk-500"><Trash2 className="size-4" /></button>
                        </div>
                    </li>
                ))}
                {items.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 p-8 text-center text-sm text-ink-500">Nothing here yet. Use the Save and Watch buttons across AIIM to build your list.</li>}
            </ul>
        </AiimPage>
    );
}
