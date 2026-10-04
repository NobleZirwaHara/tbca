import { router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronUp, Factory, Gauge, PlayCircle, Timer } from 'lucide-react';
import { IndustryAdmin } from '@/Components/Insights/Industries';
import { Box, Donut, Legend, Stat, Table } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Props {
    kpis: { total: number; live: number; progress: number; notStarted: number; avgScore: number };
    pipeline: { stage: string; label: string; count: number; pct: number }[];
    rows: { id: number; slug: string; name: string; stage: string; stageLabel: string; score: number; sprintsTotal: number; sprintsActivated: number; activatedPct: number; risks: number; target: string | null; owner: string; mode: string }[];
    sprints: { activated: number; total: number };
    trend: { m: string; v: number }[];
    milestones: string[];
}

const STAGE_COLOR = ['bg-ink-500', 'bg-ink-400', 'bg-controlled-500', 'bg-gold-400', 'bg-gold-500', 'bg-risk-500', 'bg-purple-500', 'bg-verified-500'];

export default function Activation({ kpis, pipeline, rows, sprints, trend, milestones }: Props) {
    const max = Math.max(...trend.map((t) => t.v), 1);
    const advance = (slug: string, direction: 'up' | 'down') => router.post(`/admin/insights/industries/activation/${slug}/advance`, { direction }, { preserveScroll: true });

    return (
        <IndustryAdmin title="Industry Activation Pipeline & Performance Dashboard" badge="Control Tower (S0–S8)" description={`End-to-end view of Industry lifecycle activation and performance across the ${kpis.total} canonical Industries.`}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Industries (Total)" value={kpis.total} caption="Canonical" icon={<Factory className="size-5" />} />
                <Stat label="Fully Activated (S7–S8)" value={kpis.live} tone="green" caption={`${((kpis.live / Math.max(1, kpis.total)) * 100).toFixed(1)}%`} icon={<CheckCircle2 className="size-5" />} />
                <Stat label="In Progress (S2–S6)" value={kpis.progress} tone="amber" icon={<Timer className="size-5" />} />
                <Stat label="Not Started (S0–S1)" value={kpis.notStarted} tone="red" icon={<PlayCircle className="size-5" />} />
                <Stat label="Avg. Activation Score" value={`${kpis.avgScore}%`} caption="Target ≥ 80%" icon={<Gauge className="size-5" />} />
            </div>
            <Box className="mt-4" title="Industry Activation Pipeline (S0–S8)">
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                    {pipeline.map((p, i) => (
                        <li key={p.stage} className="rounded-[6px] border border-parchment-300 p-2 text-center">
                            <p className="text-xs font-bold">{p.stage}</p><p className="text-[0.6875rem] text-ink-500">{p.label}</p>
                            <p className="mt-1 text-xl font-bold">{p.count}</p><p className="text-[0.6875rem]">{p.pct}%</p>
                            <div className={cn('mt-1 h-1.5 rounded-full', STAGE_COLOR[i])} />
                        </li>
                    ))}
                </ol>
            </Box>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <Box title="Industry Activation Status">
                    <Table head={['Industry', 'Activation Stage', 'Activation Score', 'Sprints Total', 'Sprints Activated', 'Key Risks', 'Target Live Date', 'Owner', 'Advance']}
                        rows={rows.map((r) => [
                            <strong key="n" className="text-xs">{r.name}</strong>, <span key="s" className="rounded bg-parchment-200 px-1.5 text-[0.6875rem] whitespace-nowrap">{r.stageLabel}</span>,
                            <span key="sc" className={cn('font-semibold', r.score >= 80 ? 'text-verified-700' : r.score >= 50 ? 'text-attested-700' : 'text-risk-700')}>{r.score}%</span>,
                            r.sprintsTotal || '—', `${r.sprintsActivated} (${r.activatedPct}%)`, r.risks, r.target ?? '—', <span key="o" className="text-xs">{r.owner}</span>,
                            <span key="a" className="flex gap-1">
                                <button type="button" aria-label={`Move ${r.name} back`} onClick={() => advance(r.slug, 'down')} className="rounded border p-0.5"><ChevronDown className="size-4" /></button>
                                <button type="button" aria-label={`Advance ${r.name}`} onClick={() => advance(r.slug, 'up')} className="rounded border border-gold-500 p-0.5"><ChevronUp className="size-4" /></button>
                            </span>,
                        ])} />
                </Box>
                <div className="space-y-4">
                    <Box title="Activation Score Trend (All Industries)">
                        <div className="flex h-36 items-end gap-2">
                            {trend.map((t) => <div key={t.m} className="flex flex-1 flex-col items-center gap-1"><span className="text-[0.625rem] font-semibold">{t.v}%</span><div className="w-full rounded-t bg-verified-500" style={{ height: `${(t.v / max) * 100}%` }} /><span className="text-[0.5625rem] text-ink-500">{t.m.split(' ')[0]}</span></div>)}
                        </div>
                    </Box>
                    <Box title="Sprints Activation Progress">
                        <div className="flex items-center gap-4"><Donut label={sprints.total} sub="Total Sprints" size={110} segments={[{ value: sprints.activated, color: '#2f9e5b' }, { value: sprints.total - sprints.activated, color: '#d6a32e' }]} /><Legend items={[{ label: 'Activated', value: sprints.activated, color: '#2f9e5b' }, { label: 'In Progress / Not Started', value: sprints.total - sprints.activated, color: '#d6a32e' }]} /></div>
                    </Box>
                    <Box title="Recent Milestones"><ul className="space-y-1.5 text-xs">{milestones.length === 0 ? <li className="text-ink-400">Stage changes you make appear here.</li> : milestones.map((m) => <li key={m} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{m}</li>)}</ul></Box>
                </div>
            </div>
        </IndustryAdmin>
    );
}
