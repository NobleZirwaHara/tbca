import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CircleAlert, CircleCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, Stat } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Row { service: string; sub: string; inclusion: number; unit: string; used: number; remaining: number; pct: number; projected: number; status: string }
interface Usage { rows: Row[]; allowance: number; used: number; remaining: number; projected: number; overage: number; term_end: string; days_left: number; series: { actual: number | null; projected: number | null }[]; warning: number }

function Chart({ series }: { series: Usage['series'] }) {
    const x = (i: number) => 30 + i * 70;
    const y = (v: number) => 130 - Math.min(140, v) * 1.0;
    const line = (k: 'actual' | 'projected') => series.map((p, i) => (p[k] === null ? null : `${x(i)},${y(p[k] as number)}`)).filter(Boolean).join(' ');
    return (
        <svg viewBox="0 0 330 150" className="w-full" role="img" aria-label="Usage forecast">
            {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1="30" x2="320" y1={y(v)} y2={y(v)} stroke="#ebe0cd" /><text x="4" y={y(v) + 3} fontSize="8" fill="#6b6b78">{v}</text></g>)}
            <line x1="30" x2="320" y1={y(100)} y2={y(100)} stroke="#c05621" strokeDasharray="4 3" />
            <polyline points={line('actual')} fill="none" stroke="#2f855a" strokeWidth="2.5" />
            <polyline points={line('projected')} fill="none" stroke="#3b6fb6" strokeWidth="2" strokeDasharray="5 4" />
        </svg>
    );
}

export default function UsagePage({ engagement: e, usage, requests }: { engagement: TechHeader; usage: Usage; requests: { reference: string; subject: string; status: string }[] }) {
    const form = useForm({ service: usage.rows[0]?.service ?? '', amount: 10, reason: '' });
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post(`/technology-solutions/workspace/${e.reference}/usage`, { preserveScroll: true, onSuccess: () => form.reset('reason') });
    };
    const atRisk = usage.rows.filter((r) => r.status !== 'On Track');
    return (
        <TechPortal e={e} title="Metered Usage" description="Real-time usage tracking for metered services included in your engagement.">
            <Head title="Metered Usage" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Total Included Allowance" value={`${usage.allowance} units`} sub="Per engagement term" />
                <Stat label="Used to Date" value={`${usage.used} units`} sub={`${usage.used}% of allowance`} />
                <Stat label="Remaining Allowance" value={`${usage.remaining} units`} tone="good" />
                <Stat label="Projected Usage (End of Term)" value={`${usage.projected} units`} sub={`${usage.projected}% of allowance`} tone={usage.projected > 100 ? 'bad' : 'neutral'} />
                <Stat label="Overage (Projected)" value={`${usage.overage} units`} sub={usage.overage ? 'Exceeds allowance' : 'Within allowance'} tone={usage.overage ? 'bad' : 'good'} />
                <Stat label="Term End Date" value={usage.term_end} sub={`${usage.days_left} days remaining`} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <Card title="Metered Services & Usage">
                        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-xs"><thead className="text-ink-500"><tr><th className="text-left">Service</th><th>Inclusion</th><th>Unit</th><th>Used</th><th>Remaining</th><th className="w-32">% Used</th><th>Projected</th><th>Status</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{usage.rows.map((r) => <tr key={r.service}><td className="py-2"><b>{r.service}</b><span className="block text-ink-500">{r.sub}</span></td><td className="text-center">{r.inclusion.toLocaleString()}</td><td className="text-center">{r.unit}</td><td className="text-center">{r.used.toLocaleString()}</td><td className="text-center">{r.remaining.toLocaleString()}</td><td><div className="flex items-center gap-1.5"><Progress value={r.pct} tone={r.pct >= usage.warning ? 'bad' : r.pct >= 60 ? 'gold' : 'good'} /><span>{r.pct}%</span></div></td><td className="text-center">{r.projected}%</td><td className="text-center"><StatusPill status={r.status} tone={r.status === 'On Track' ? 'good' : r.status === 'At Risk' ? 'warn' : 'bad'} /></td></tr>)}</tbody></table></div>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Status: On Track &lt; 60% · At Risk ≥ 60% · Warning ≥ {usage.warning}% · Over Allowance when projected &gt; 100%.</p>
                    </Card>
                    <Card title="Usage Forecast"><Chart series={usage.series} /><p className="text-xs text-ink-500"><span className="text-verified-700">— Actual</span> · <span className="text-controlled-700">- - Projected</span> · <span className="text-attested-700">- - Allowance limit</span>. Projected usage is {usage.projected}% of allowance.</p></Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Usage Alerts">
                        <ul className="space-y-2 text-xs">{atRisk.length === 0 ? <li className="flex gap-1.5"><CircleCheck className="size-4 text-verified-500" />All systems normal — no immediate action required.</li> : atRisk.map((r) => <li key={r.service} className="flex gap-1.5"><CircleAlert className="size-4 text-attested-500" />{r.service} usage at {r.pct}% — consider additional allowance.</li>)}<li className="flex gap-1.5"><TrendingUp className="size-4 text-controlled-500" />Projection: {usage.projected}% of allowance by term end.</li></ul>
                    </Card>
                    <Card title="Request Additional Allowance">
                        <form onSubmit={submit} className="space-y-2">
                            <Field label="Service" error={form.errors.service}>{(id) => <Select id={id} value={form.data.service} onChange={(x) => form.setData('service', x.target.value)} options={usage.rows.map((r) => r.service)} />}</Field>
                            <Field label="Additional units" error={form.errors.amount}>{(id) => <Input id={id} type="number" min={1} value={form.data.amount} onChange={(x) => form.setData('amount', Number(x.target.value))} />}</Field>
                            <Field label="Reason">{(id) => <Textarea id={id} value={form.data.reason} onChange={(x) => form.setData('reason', x.target.value)} className="min-h-14" />}</Field>
                            <Button type="submit" className="w-full" disabled={form.processing}>Request Allowance Increase</Button>
                            <p className="text-[0.6875rem] text-ink-500">A cap increase needs a fresh S13-CHANGE approval. Metering never auto-approves charges.</p>
                        </form>
                        {requests.length > 0 && <ul className="mt-3 space-y-1 text-xs">{requests.map((r) => <li key={r.reference} className="flex justify-between gap-2"><span>{r.subject}</span><StatusPill status={r.status} /></li>)}</ul>}
                    </Card>
                </aside>
            </div>
        </TechPortal>
    );
}

UsagePage.layout = null;
