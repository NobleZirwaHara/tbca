import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Progress, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, KV, Stat } from '@/Components/Advisory/ui';

interface Check { id: number; code: string; engagement: string; client: string; rule: string; breach_type: string; severity: string; detected_on: string; owner: string; status: string; action_required: string; due_date: string | null }
interface Props { kpis: { total: number; compliant: number; warning: number; breach: number; critical: number; score: number }; rules: { n: number; name: string; score: number; status: string }[]; breaches: Check[]; resolved: number }

export default function Spine({ kpis, rules, breaches, resolved }: Props) {
    const pct = (n: number) => (kpis.total ? Math.round((n / kpis.total) * 1000) / 10 : 0);
    const below = rules.filter((r) => r.score < 95);
    const worst = [...rules].sort((a, b) => a.score - b.score)[0];
    const date = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-ZA') : '—');
    return (
        <AdminShell title="Spine Compliance Monitor" description="Real-time monitoring of the TBCA Services Commercial Spine compliance across all engagements and vehicles." actions={<Button size="sm" onClick={() => router.post('/admin/advisory/spine/run', {}, { preserveScroll: true })}>Run Compliance Check</Button>}>
            <Head title="Spine Compliance Monitor" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Total Compliance Checks" value={kpis.total.toLocaleString()} />
                <Stat label="Compliant" value={kpis.compliant.toLocaleString()} sub={`${pct(kpis.compliant)}%`} tone="good" />
                <Stat label="Warning" value={kpis.warning} sub={`${pct(kpis.warning)}%`} tone="warn" />
                <Stat label="Breach" value={kpis.breach} sub={`${pct(kpis.breach)}%`} tone="bad" />
                <Stat label="Critical Breach" value={kpis.critical} tone="bad" />
                <Stat label="Compliance Score" value={`${kpis.score}%`} sub="Target: ≥ 95%" tone={kpis.score >= 95 ? 'good' : 'warn'} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <Card title="Compliance by Spine Rule Category">
                        <ul className="grid gap-2 md:grid-cols-2">{rules.map((r) => <li key={r.n} className="text-xs"><div className="flex justify-between"><span>Rule {r.n}: {r.name}</span><span className="font-semibold">{r.score}%</span></div><Progress value={r.score} tone={r.score >= 95 ? 'good' : r.score >= 90 ? 'gold' : 'bad'} /></li>)}</ul>
                    </Card>
                    <Card title={`Recent Compliance Breaches (${breaches.length} open)`}>
                        <SimpleTable columns={['Check ID', 'Engagement / Vehicle', 'Client', 'Rule Violated', 'Breach Type', 'Severity', 'Detected', 'Owner', 'Status', 'Action Required', 'Due']}
                            rows={breaches.map((b) => [<span className="font-mono text-xs text-controlled-700">{b.code}</span>, b.engagement, b.client, <b className="text-xs">{b.rule}</b>, b.breach_type, <StatusPill status={b.severity} />, date(b.detected_on), b.owner,
                                <select aria-label={`Status for ${b.code}`} value={b.status} onChange={(e) => router.post(`/admin/advisory/spine/${b.id}`, { status: e.target.value }, { preserveScroll: true })} className="rounded border border-parchment-500 text-xs">{['open', 'in_progress', 'resolved'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>, b.action_required, date(b.due_date)])} />
                        <p className="mt-2 text-xs text-ink-500">{resolved} breach(es) resolved. Running a compliance check flags every below-floor vehicle without an open Rule 6.2 breach.</p>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Overall Spine Summary"><KV rows={[['Compliance Score', `${kpis.score}%`], ['Total Breaches', kpis.breach + kpis.critical], ['Critical Breaches', kpis.critical], ['Rules Below Target', below.length], ['Highest Risk Area', worst ? `Rule ${worst.n}: ${worst.name}` : '—']]} /></Card>
                    <Card title="Spine Rule Health"><ul className="space-y-1 text-xs">{rules.map((r) => <li key={r.n} className="flex justify-between gap-2"><span>{r.name}</span><span className="flex items-center gap-1">{r.score}% <StatusPill status={r.status} tone={r.status === 'Healthy' ? 'good' : r.status === 'Monitor' ? 'warn' : 'bad'} /></span></li>)}</ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

Spine.layout = null;
