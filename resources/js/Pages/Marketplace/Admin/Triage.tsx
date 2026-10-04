import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, DollarSign, FileText, Gauge, Sparkles, Star } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, MiniBar, Notice, zar } from '@/Components/Marketplace/ui';
import { PriorityPill, Table, td } from '@/Components/Marketplace/AdminKit';
import { cn } from '@/lib/cn';
import type { MkBrief, MkProvider, RegisterNav } from '@/types/marketplace';

interface Props {
    nav: RegisterNav;
    brief: MkBrief;
    requirements: { requirement: string; category: string; priority: string; weight: number }[];
    matches: { provider: MkProvider; score: number; expertise: number; capacity: number; available: string; cost: number; band: string; shortlisted: boolean }[];
    proposals: { provider: string; rate: number; days: number; status: string; match: number }[];
    stages: string[];
}

export default function Triage({ nav, brief: b, requirements, matches, proposals, stages }: Props) {
    const bands = ['Excellent', 'Good', 'Fair', 'Poor'].map((band) => ({ label: band, value: matches.filter((m) => m.band === band).length }));
    const shortlisted = matches.filter((m) => m.shortlisted).length;
    const avg = matches.length ? Math.round(matches.reduce((a, m) => a + m.score, 0) / matches.length) : 0;
    const stageIdx = proposals.length ? (b.status === 'assigned' ? 6 : 4) : 2;

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Brief Triage', href: '/admin/marketplace/briefs' }, { label: b.reference }, { label: 'Brief Triage and Matching Workbench' }]} title="Brief Triage and Matching Workbench"
            description="Triage incoming briefs, extract key requirements, and match with the best available providers and resources." actions={<span className="rounded border border-parchment-500 bg-white px-3 py-2 text-xs">Stage: {stageIdx} of 8 – {stages[stageIdx - 1]}</span>}>
            <Head title={`Triage – ${b.reference}`} />
            <div className="grid gap-5 xl:grid-cols-12">
                <aside className="space-y-4 xl:col-span-2">
                    <Card><p className="font-mono text-sm font-bold">{b.reference}</p><p className="text-xs text-ink-600">{b.title}</p>{(b.priorityScore ?? 0) >= 70 && <StatusPill status="High Priority" tone="bad" className="mt-1" />}
                        <ol className="mt-3 space-y-2 text-xs">{stages.map((s, i) => <li key={s} className={cn('flex gap-2 rounded px-1.5 py-1', i + 1 === stageIdx && 'bg-controlled-50 font-semibold text-controlled-700')}><span className="flex size-4 items-center justify-center rounded-full border text-[0.6rem]">{i + 1}</span>{s}</li>)}</ol>
                    </Card>
                    <Card title="Quick Stats"><ul className="space-y-1.5 text-xs">{[['Matched Providers', matches.length], ['Shortlisted', shortlisted], ['Average Match Score', `${avg}%`], ['Received', b.createdAt]].map(([k, v]) => <li key={k as string} className="flex justify-between gap-2"><span>{k}</span><strong>{v}</strong></li>)}</ul></Card>
                </aside>
                <div className="space-y-5 xl:col-span-7">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[[FileText, 'Brief Overview', b.title, b.clientName], [ClipboardList, 'Requirements Extracted', `${requirements.length} Key Requirements`, 'Auto-extracted from brief'], [Gauge, 'Priority Score', `${b.priorityScore ?? 0} / 100`, (b.priorityScore ?? 0) >= 70 ? 'High Priority' : 'Standard'], [DollarSign, 'Budget Range', b.budgetLabel ?? '—', 'Indicative']].map(([I, k, v, c]) => { const Ic = I as typeof Gauge; return <div key={k as string} className="rounded-[8px] border border-parchment-400 bg-white p-3"><Ic className="size-6 text-controlled-600" aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">{k as string}</p><p className="text-sm font-bold">{v as string}</p><p className="text-[0.6875rem] text-ink-400">{c as string}</p></div>; })}
                    </div>
                    <Card title={`Key Requirements (${requirements.length} Total)`}>
                        <Table head={['Requirement', 'Category', 'Priority', 'Match Weight', 'Status']} empty={requirements.length === 0}>
                            {requirements.map((r) => <tr key={r.requirement}><td className={td}>{r.requirement}</td><td className={td}>{r.category}</td><td className={td}><PriorityPill value={r.priority} /></td><td className={td}><div className="flex items-center gap-2"><span className="w-8 text-xs">{r.weight}%</span><MiniBar value={r.weight} max={25} tone="blue" /></div></td><td className={td}><StatusPill status="Extracted" tone="good" /></td></tr>)}
                        </Table>
                    </Card>
                    <Card title={`Matched Providers (${matches.length} Matches)`}>
                        <Table head={['Provider', 'Overall Match', 'Expertise Match', 'Capacity', 'Availability', 'Est. Cost', 'Actions']} empty={matches.length === 0}>
                            {matches.map((m) => (
                                <tr key={m.provider.slug}>
                                    <td className={td}><span className="font-semibold text-ink-900">{m.provider.name}</span><p className="text-xs text-ink-500">{m.provider.categoryLabel}</p></td>
                                    <td className={td}><span className="font-bold">{m.score}%</span> <Star className="inline size-3 fill-gold-500 text-gold-500" aria-hidden="true" />{m.provider.rating}</td>
                                    <td className={td}><div className="flex items-center gap-2"><span className="w-8 text-xs">{m.expertise}%</span><MiniBar value={m.expertise} tone="good" /></div></td>
                                    <td className={td}>{m.capacity}%</td><td className={td}><StatusPill status={m.available} tone={m.available === 'Available' ? 'good' : 'warn'} /></td><td className={td}>{zar(m.cost)}</td>
                                    <td className={td}>{m.shortlisted ? <StatusPill status="Shortlisted" tone="good" /> : <Button type="button" size="sm" variant="outline" onClick={() => router.post(`/admin/marketplace/briefs/${b.reference}/shortlist`, { provider: m.provider.id }, { preserveScroll: true })}>Shortlist</Button>}</td>
                                </tr>
                            ))}
                        </Table>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Matching Summary"><Donut items={bands} total={matches.length} label="Matching summary" /></Card>
                    <Card title="Top 3 Recommended"><ol className="space-y-2 text-sm">{matches.slice(0, 3).map((m, i) => <li key={m.provider.slug} className="flex gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-verified-500 text-xs text-white">{i + 1}</span><span>{m.provider.name}<br /><span className="text-xs text-ink-500">{m.score}% Match</span></span></li>)}</ol></Card>
                    <Card title="Proposals Received"><ul className="space-y-1.5 text-xs">{proposals.length === 0 && <li className="text-ink-400">None yet.</li>}{proposals.map((p) => <li key={p.provider} className="flex justify-between gap-2"><span>{p.provider}<br /><span className="text-ink-400">{zar(p.rate)} · {p.days}d · {p.match}%</span></span><StatusPill status={p.status} /></li>)}</ul></Card>
                    <Card title="AI Insights"><ul className="space-y-1.5 text-xs text-ink-600"><li className="flex gap-1.5"><Sparkles className="size-3.5 shrink-0" aria-hidden="true" />Strong matches found in {b.categoryLabel}.</li><li className="flex gap-1.5"><Sparkles className="size-3.5 shrink-0" aria-hidden="true" />Ledger C cap {zar(b.scope.ledgers?.c ?? 0)} — {matches.filter((m) => m.cost <= (b.scope.ledgers?.c ?? 0)).length} providers within cap.</li></ul></Card>
                    <Link href={`/admin/marketplace/briefs`} className="block text-sm font-semibold text-gold-700">← All briefs</Link>
                </aside>
            </div>
            <Notice tone="warn" className="mt-5">Matches are based on current provider profiles and availability. Final selection and due diligence required before engagement. Shortlisted providers appear as proposals the buyer can compare and award.</Notice>
        </AdminShell>
    );
}

Triage.layout = null;
