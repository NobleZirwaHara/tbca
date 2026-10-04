import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Copy, Database, FileText, Shield, UploadCloud, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import { Card, DdHero, Donut, RISK_COLORS, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdJourneyStep } from '@/types/due-diligence';

interface BatchRow { reference: string; file_name: string; status: string; progress: number; rows: number; valid_rows: number; duplicates: number; exceptions: string[] | null; createdAt: string }
interface Props {
    kpis: { subjects: number; alerts: number; alertsByRisk: Record<string, number>; awaiting: number; batches: number; batchStates: Record<string, number>; usage: number; allowance: number };
    batches: BatchRow[];
    lastBatch: Omit<BatchRow, 'createdAt' | 'progress'> | null;
    exceptions: { schema: number; duplicates: number; alerts: number; qa: number; unresolved: number };
    subjects: { subject: string; lastAlert: string | null; risk: string; status: string }[];
    subscriptions: { reference: string; plan_name: string; plan_code: string; billing_cycle: string; status: string; nextRenewalAt: string | null }[];
    requests: { reference: string; status: string; submitted_at: string | null }[];
    journey: DdJourneyStep[];
}

/** DD-049 Enterprise Bulk Screening Dashboard. */
export default function Dashboard({ kpis, batches, lastBatch, exceptions, subjects, subscriptions, requests, journey }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const upload = (f: File | null) => {
        if (!f) return;
        setFile(f);
        setBusy(true);
        router.post('/due-diligence/enterprise/batches', { file: f }, { forceFormData: true, preserveScroll: true, onFinish: () => { setBusy(false); setFile(null); } });
    };
    const sub = subscriptions[0];

    return (
        <>
            <Head title="Enterprise Bulk Screening Dashboard" />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'Enterprise', href: '/due-diligence/enterprise' }, { label: 'Bulk Screening Dashboard' }]}
                title="Enterprise Bulk Screening Dashboard"
                subtitle="Upload batches, track exceptions, QA and invoices."
                description="All alerts are reviewed before any client-facing disposition."
                chips={[{ label: 'Lifecycle Stage', value: '13' }, { label: 'Public Stage', value: '7 Portal Delivery & Monitoring' }, { label: 'Case State', value: sub ? 'CS6 Monitoring' : 'Setup' }, { label: 'Payment State', value: sub ? 'PY5 Recurring' : 'Quotation' }, { label: 'Entitlement', value: sub ? 'EN4 Subscription' : 'Pending' }]}
                journey={journey}
                current={7}
                completed={6}
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <Card><p className="text-xs text-ink-500">Subjects under monitoring</p><p className="flex items-center gap-2 text-2xl font-bold"><Users className="size-6 text-gold-600" aria-hidden="true" />{kpis.subjects.toLocaleString('en-ZA')}</p><p className="text-xs text-ink-500">Total active subjects</p></Card>
                        <Card><p className="text-xs text-ink-500">Alerts (last 30 days)</p><Donut size={70} center={<span className="text-sm font-bold">{kpis.alerts}</span>} segments={['critical', 'high', 'medium', 'low'].map((l) => ({ label: l, value: kpis.alertsByRisk[l] ?? 0, color: RISK_COLORS[l] }))} /></Card>
                        <Card><p className="text-xs text-ink-500">Alerts awaiting review</p><p className="flex items-center gap-2 text-2xl font-bold"><AlertTriangle className="size-6 text-attested-500" aria-hidden="true" />{kpis.awaiting}</p><p className="text-xs text-ink-500">Requires reviewer action</p></Card>
                        <Card><p className="text-xs text-ink-500">Batches (last 30 days)</p><p className="flex items-center gap-2 text-2xl font-bold"><Database className="size-6 text-gold-600" aria-hidden="true" />{kpis.batches}</p><p className="text-[0.6875rem] text-ink-500">{kpis.batchStates.completed} completed · {kpis.batchStates.processing + kpis.batchStates.queued} in queue · {kpis.batchStates.failed} failed</p></Card>
                        <Card><p className="text-xs text-ink-500">Usage this period</p><p className="text-2xl font-bold">{kpis.usage.toLocaleString('en-ZA')} / {kpis.allowance.toLocaleString('en-ZA')}</p><Progress value={(kpis.usage / Math.max(1, kpis.allowance)) * 100} className="mt-1" /><p className="mt-1 text-[0.6875rem] text-ink-500">Subjects included</p></Card>
                        <Card><p className="text-xs text-ink-500">Requests</p>{requests.length ? <ul className="space-y-1 text-xs">{requests.slice(0, 3).map((r) => <li key={r.reference} className="flex justify-between gap-1"><span className="font-mono">{r.reference}</span><StatusPill status={r.status} /></li>)}</ul> : <p className="text-xs text-ink-500">None yet</p>}<Link href="/due-diligence/enterprise/request" className="mt-1 block text-xs font-semibold text-gold-700">New request →</Link></Card>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-12">
                        <div className="space-y-4 xl:col-span-3">
                            <Card title="Batch upload">
                                <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files?.[0] ?? null); }} className="flex cursor-pointer flex-col items-center gap-1 rounded-[8px] border-2 border-dashed border-parchment-500 p-4 text-center text-xs text-ink-600 hover:border-gold-500">
                                    <UploadCloud className="size-7" aria-hidden="true" />
                                    {busy ? `Uploading ${file?.name ?? ''}…` : 'Drag and drop your file here or Choose File'}
                                    <input type="file" accept=".csv,.txt" className="sr-only" onChange={(e) => upload(e.target.files?.[0] ?? null)} />
                                </label>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">Accepted format: CSV (export XLSX to CSV). Max 50 MB · Max rows 10 000. Required columns: name, entity_type, country.</p>
                                <a href="/due-diligence/enterprise/batches/template" className="mt-1 inline-block text-xs font-semibold text-gold-700">Download template</a>
                            </Card>
                            <Card title="Schema validation (last upload)">
                                {lastBatch ? (
                                    <div className="text-xs">
                                        <p className="font-semibold">{lastBatch.file_name} <StatusPill status={lastBatch.status} /></p>
                                        <p className="mt-1">{lastBatch.valid_rows} valid of {lastBatch.rows} rows · {lastBatch.duplicates} duplicates</p>
                                        {(lastBatch.exceptions ?? []).length > 0 ? <ul className="mt-2 space-y-0.5 text-risk-600">{(lastBatch.exceptions ?? []).slice(0, 5).map((x) => <li key={x}>• {x}</li>)}</ul> : <p className="mt-2 flex items-center gap-1 text-verified-700"><CheckCircle2 className="size-4" aria-hidden="true" />No schema exceptions</p>}
                                    </div>
                                ) : <p className="text-xs text-ink-500">No file processed yet. Upload a batch to view validation results.</p>}
                            </Card>
                        </div>
                        <div className="space-y-4 xl:col-span-6">
                            <Card title="Processing queue">
                                <table className="w-full text-left text-xs">
                                    <thead className="text-ink-500"><tr><th className="py-1">Batch ID</th><th>File name</th><th>Submitted</th><th>Status</th><th className="w-28">Progress</th></tr></thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {batches.map((b) => <tr key={b.reference}><td className="py-1.5 font-mono">{b.reference}</td><td>{b.file_name}</td><td>{shortDate(b.createdAt, true)}</td><td><StatusPill status={b.status} /></td><td><div className="flex items-center gap-1"><Progress value={b.progress} tone={b.status === 'failed' ? 'bad' : b.progress >= 100 ? 'good' : 'gold'} /><span>{b.progress}%</span></div></td></tr>)}
                                        {batches.length === 0 && <tr><td colSpan={5} className="py-3 text-ink-500">No batches yet.</td></tr>}
                                    </tbody>
                                </table>
                            </Card>
                            <Card title="Recent subjects with alerts">
                                <table className="w-full text-left text-xs">
                                    <thead className="text-ink-500"><tr><th className="py-1">Subject</th><th>Last alert</th><th>Risk level</th><th>Status</th></tr></thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {subjects.map((s) => <tr key={s.subject}><td className="py-1.5">{s.subject}</td><td>{shortDate(s.lastAlert)}</td><td><span className="rounded px-1.5 text-white capitalize" style={{ background: RISK_COLORS[s.risk] }}>{s.risk}</span></td><td><StatusPill status={s.status.replace('_', ' ')} /></td></tr>)}
                                        {subjects.length === 0 && <tr><td colSpan={4} className="py-3 text-ink-500">No alerts in the last 30 days.</td></tr>}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                        <div className="space-y-4 xl:col-span-3">
                            <Card title="Exceptions & review queue">
                                <ul className="space-y-1.5 text-xs">{[['Schema exceptions', exceptions.schema], ['Duplicate subjects', exceptions.duplicates], ['Alerts awaiting review', exceptions.alerts], ['QA sample ready', exceptions.qa], ['Unresolved alerts', exceptions.unresolved]].map(([k, v]) => <li key={k as string} className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Copy className="size-3.5 text-gold-600" aria-hidden="true" />{k}</span><span className="rounded-full bg-attested-50 px-2 font-semibold text-attested-700">{v}</span></li>)}</ul>
                            </Card>
                            <Card title="Invoice & subscription">
                                {sub ? <dl className="space-y-1 text-xs">{[['Plan', sub.plan_name], ['Fee code', sub.plan_code], ['Billing cycle', sub.billing_cycle], ['Next renewal', shortDate(sub.nextRenewalAt)], ['Payment status', sub.status]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="capitalize">{v}</dd></div>)}</dl> : <p className="text-xs text-ink-500">No active subscription. Submit an enterprise request to be scoped and quoted.</p>}
                                <ButtonLink href="/portal" size="sm" variant="outline" className="mt-3 w-full">View Invoices & Payments</ButtonLink>
                            </Card>
                            <Card title="Monthly management report">
                                <p className="flex items-center gap-2 text-xs"><FileText className="size-5 text-gold-600" aria-hidden="true" />Consolidated view of batches, alerts, QA and usage.</p>
                                <ButtonLink href="/due-diligence/cases" size="sm" variant="outline" className="mt-2 w-full">Open case reports</ButtonLink>
                            </Card>
                        </div>
                    </div>
                    <p className="flex items-center gap-2 text-xs text-ink-500"><Shield className="size-4 text-gold-600" aria-hidden="true" />Human review included · No alert auto-charges · Your data is encrypted and access-controlled at all times.</p>
                </div>
            </section>
        </>
    );
}
