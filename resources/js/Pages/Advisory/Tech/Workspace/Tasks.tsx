import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Search, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, KV } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { TechHeader } from '@/types/advisory';

interface Task { id: number; group: string; title: string; owner: string; due: string; status: string; dependency: string | null; evidence: string | null; priority: string }
interface Props { engagement: TechHeader; tasks: Task[]; filters: Record<string, string>; owners: string[]; blockers: { critical: number; high: number; medium: number }; next: Task | null }

const GROUPS: [string, string][] = [['', 'All Tasks'], ['client', 'Client Actions'], ['tbca', 'TBCA Delivery Tasks'], ['dependency', 'Dependencies & Blockers']];
const STATUS = ['completed', 'in_progress', 'waiting_on_client', 'blocked', 'due_soon', 'pending'];
const prioTone: Record<string, string> = { critical: 'bg-risk-500 text-white', high: 'bg-risk-50 text-risk-700', medium: 'bg-attested-50 text-attested-700', low: 'bg-parchment-300' };

export default function Tasks({ engagement: e, tasks, filters, owners, blockers, next }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: Record<string, string>) => router.get(`/technology-solutions/workspace/${e.reference}/tasks`, { ...filters, ...patch }, { preserveScroll: true, preserveState: true });
    const act = (t: Task, action: string) => router.post(`/technology-solutions/workspace/${e.reference}/tasks/${t.id}`, { action }, { preserveScroll: true });
    const search = (ev: FormEvent) => { ev.preventDefault(); go({ q }); };
    const groups = ['client', 'tbca', 'dependency'].filter((g) => !filters.group || filters.group === g);
    return (
        <TechPortal e={e} title="Tasks & Dependencies" description="Track client actions, TBCA delivery tasks and blockers for this engagement.">
            <Head title="Tasks & Dependencies" />
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-3 xl:col-span-9">
                    <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <form onSubmit={search} className="relative" role="search"><Search className="absolute top-3 left-2.5 size-4 text-ink-400" /><label htmlFor="tq" className="sr-only">Search tasks</label><Input id="tq" value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search Tasks..." className="w-52 pl-8" /></form>
                        {GROUPS.map(([k, l]) => <button key={k} type="button" onClick={() => go({ group: k })} className={cn('rounded-full border px-3 py-1 text-xs', (filters.group ?? '') === k ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}>{l}</button>)}
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(x) => go({ status: x.target.value })} placeholder="Status" options={STATUS.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))} className="w-40" />
                        <Select aria-label="Owner" value={filters.owner ?? ''} onChange={(x) => go({ owner: x.target.value })} placeholder="Owner" options={owners} className="w-44" />
                    </div>
                    {groups.map((g) => {
                        const rows = tasks.filter((t) => t.group === g);
                        if (!rows.length) return null;
                        return (
                            <Card key={g} title={{ client: 'A. Client Actions', tbca: 'B. TBCA Delivery Tasks', dependency: 'C. Dependencies & Blockers' }[g]}>
                                <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-xs"><thead className="text-ink-500"><tr><th className="text-left">Task</th><th className="text-left">Owner</th><th>Due Date</th><th>Status</th><th className="text-left">Dependency / Blocker</th><th className="text-left">Evidence Required</th><th>Priority</th><th>Action</th></tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{rows.map((t) => <tr key={t.id}><td className="py-2 font-semibold">{t.title}</td><td>{t.owner}</td><td className="text-center">{t.due}</td><td className="text-center"><StatusPill status={t.status} /></td><td>{t.dependency ?? 'None'}</td><td>{t.evidence}</td><td className="text-center"><span className={cn('rounded px-1.5 capitalize', prioTone[t.priority])}>{t.priority}</span></td>
                                        <td className="text-center">{t.status === 'completed' ? <span className="text-verified-700">Done</span> : g === 'client' ? <Button size="sm" onClick={() => act(t, 'complete')}>Complete My Task</Button> : t.priority === 'critical' || t.status === 'blocked' ? <Button size="sm" variant="outline" className="border-risk-500 text-risk-700" onClick={() => act(t, 'escalate')}>Escalate</Button> : <Button size="sm" variant="outline" onClick={() => act(t, 'remind')}>Remind</Button>}</td></tr>)}</tbody></table></div>
                            </Card>
                        );
                    })}
                    <p className="text-xs text-ink-500">Blocked tasks remain visible until dependency evidence is received and reviewed. Task states update as evidence is uploaded and reviewed.</p>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    {next && <Card title="Next Action" tone="gold"><p className="text-sm font-semibold">{next.title}</p><p className="text-xs">due {next.due}</p><Button size="sm" className="mt-2 w-full" onClick={() => act(next, 'complete')}>Complete My Task</Button></Card>}
                    <Card title="Blockers Summary"><KV rows={[['Critical', <span className="text-risk-700">{blockers.critical}</span>], ['High', blockers.high], ['Medium', blockers.medium]]} />{tasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').map((t) => <p key={t.id} className="mt-2 flex gap-1.5 rounded bg-risk-50 p-2 text-xs text-risk-700"><TriangleAlert className="size-4 shrink-0" />{t.title} — {t.dependency}</p>)}</Card>
                    <Card title="Evidence Requirements"><CheckList items={tasks.filter((t) => t.evidence).slice(0, 5).map((t) => `${t.evidence}${t.status === 'completed' ? ' ✓' : ''}`)} /></Card>
                    <Card title="Engagement Health"><KV rows={[['Schedule', e.health === 'on_track' ? 'On Track' : 'Paused'], ['Budget', 'Controlled'], ['Review Status', 'Human Review Complete']]} /></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Tasks.layout = null;
