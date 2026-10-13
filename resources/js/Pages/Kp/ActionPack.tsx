import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, KpPage, Limitation, type KpCard, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Action { n: number; title: string; body: string; priority: 'high' | 'medium' | 'low'; impact: string; when: string; owner: string; pillar: string }

interface Props extends KpShared {
    insight: KpCard & { excerpt: { key_insight: string } | null };
    actions: Action[];
    done: number[];
    tools: [string, string, string][];
}

const PRI = { high: 'bg-risk-50 text-risk-700', medium: 'bg-attested-50 text-attested-700', low: 'bg-verified-50 text-verified-700' };

/** KP-SCR-027 Insight Action Pack: turn an insight into prioritised actions. */
export default function ActionPack({ screen, kpNav, insight, actions, done, tools }: Props) {
    const [filter, setFilter] = useState<'all' | Action['priority']>('all');
    const view = actions.filter((a) => filter === 'all' || a.priority === filter);
    const pct = Math.round((done.length / actions.length) * 100);
    const toggle = (n: number) => router.post(`${BASE}/action-pack/${insight.slug}/progress`, { n, done: !done.includes(n) }, { preserveScroll: true, preserveState: true });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['Insights', `${BASE}/insights`], ['Insight Action Pack']]}
            title="Insight Action Pack"
            subtitle="Turn insights into action."
            intro="Prioritised recommendations, next steps and resources to drive results."
            actions={<a href={`${BASE}/action-pack/${insight.slug}/download`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download Action Pack</a>}
            left={
                <div className="space-y-4">
                    <Box title="Insight Summary" tone="purple">
                        <Link href={insight.href} className="font-serif font-bold text-ink-900 hover:text-gold-700">{insight.title}</Link>
                        <p className="mt-1 text-[0.75rem] text-ink-600">Topic: {insight.themeLabel}</p>
                        {insight.excerpt && <p className="mt-2 text-[0.75rem] text-ink-700">{insight.excerpt.key_insight}</p>}
                    </Box>
                    <Box title="Filter by Priority">
                        <div className="flex flex-wrap gap-1.5">{(['all', 'high', 'medium', 'low'] as const).map((p) => <button key={p} type="button" aria-pressed={filter === p} onClick={() => setFilter(p)} className={cn('rounded-full border px-3 py-1 text-[0.75rem] capitalize', filter === p ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-500')}>{p} ({p === 'all' ? actions.length : actions.filter((a) => a.priority === p).length})</button>)}</div>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="Your Progress">
                        <ConfidenceRing value={pct} label={`${done.length} of ${actions.length} done`} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Progress is kept for this browser session. Download the pack to keep a copy.</p>
                    </Box>
                    <Box title="Related KP Tools">
                        <ul className="space-y-2">{tools.map(([t, h, i]) => <li key={t}><Link href={h} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><Ico name={i} className="size-4 text-referenced-500" />{t}</Link></li>)}</ul>
                    </Box>
                </>
            }
        >
            <Box title="Recommended Actions" icon="list-checks">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[0.8125rem]">
                        <thead className="border-b border-parchment-400 text-[0.75rem] text-ink-600"><tr><th className="py-2 pr-2">Done</th><th className="py-2 pr-2">Action</th><th className="py-2 pr-2">Priority</th><th className="py-2 pr-2">Impact</th><th className="py-2 pr-2">Timeframe</th><th className="py-2 pr-2">Owner</th><th className="py-2">Pillar</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {view.map((a) => (
                                <tr key={a.n} className={cn(done.includes(a.n) && 'bg-verified-50/50')}>
                                    <td className="py-2 pr-2"><input type="checkbox" aria-label={`Mark "${a.title}" done`} className="size-4 accent-referenced-500" checked={done.includes(a.n)} onChange={() => toggle(a.n)} /></td>
                                    <td className="py-2 pr-2"><span className={cn('block font-semibold text-ink-900', done.includes(a.n) && 'line-through')}>{a.title}</span><span className="block text-[0.75rem] text-ink-600">{a.body}</span></td>
                                    <td className="py-2 pr-2"><span className={cn('rounded-[4px] px-1.5 py-0.5 text-[0.6875rem] font-semibold capitalize', PRI[a.priority])}>{a.priority}</span></td>
                                    <td className="py-2 pr-2">{a.impact}</td>
                                    <td className="py-2 pr-2 whitespace-nowrap">{a.when}</td>
                                    <td className="py-2 pr-2">{a.owner}</td>
                                    <td className="py-2">{a.pillar}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3">
                <p className="text-[0.8125rem]"><strong>Need help implementing?</strong> Ask the KP Knowledge Assistant, or turn the plan into a TBCA Sprint.</p>
                <div className="flex gap-2"><Link href={`${BASE}/ask`} className={btnClass('outline', 'sm')}>Ask KP Assistant</Link><Link href="/sprints" className={btnClass('outline', 'sm')}>View Sprints</Link></div>
            </div>
            <Limitation compact />
        </KpPage>
    );
}
