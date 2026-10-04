import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, CircleDot, FlaskConical, Flag, Package, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, Kpi, KpiGrid, fmtDate, pct } from '@/Components/Shop/AdminKit';

interface Metric { id: number; code: string; metric: string; definition: string; closure_method: string; evidence: string | null; measured: string | null; target: string; owner: string; status: string; closed_at: string | null }
interface Case { id: number; code: string; scenario: string; result: string; executed_by: string | null; executed_at: string | null; exception: string | null }
interface Props { metrics: Metric[]; cases: Case[]; kpis: Record<string, number>; release: { status: string; authorised_at: string | null; authorised_by: string | null; candidate: string }; blockers: string[] }

function CloseModal({ metric, onClose }: { metric: Metric; onClose: () => void }) {
    const form = useForm({ evidence: `EV-${metric.code}.pdf`, measured: metric.target });
    return (
        <Modal open onClose={onClose} title={`Close ${metric.code} ${metric.metric}`} footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/releases/metrics/${metric.id}/close`, { preserveScroll: true, onSuccess: onClose })}>Close Metric</Button>}>
            <div className="space-y-3">
                <Field label="Evidence object" error={form.errors.evidence} required>{(id) => <Input id={id} value={form.data.evidence} onChange={(e) => form.setData('evidence', e.target.value)} />}</Field>
                <Field label="Measured value" error={form.errors.measured} required hint={`Target: ${metric.target}`}>{(id) => <Input id={id} value={form.data.measured} onChange={(e) => form.setData('measured', e.target.value)} />}</Field>
            </div>
        </Modal>
    );
}

function ReleasesConsole({ metrics, cases, kpis, release, blockers }: Props) {
    const [closing, setClosing] = useState<Metric | null>(null);
    const authorised = release.status === 'authorised';
    const record = (c: Case, result: string) => {
        const exception = result === 'fail' ? window.prompt('Log an exception for this failure (required for release):', c.exception ?? '') ?? '' : '';
        router.post(`/admin/shop/releases/uat/${c.id}`, { result, exception: exception || null }, { preserveScroll: true });
    };

    return (
        <AdminShell title="Release and UAT Control Tower" badge="Governance" description="Central command for releases, gate closures, UAT evidence and production authorisation."
            actions={<ActionButton href="/admin/shop/releases/authorise" tone="primary" disabled={authorised}><ShieldCheck className="size-3.5" /> {authorised ? 'Production Authorised' : 'Authorise Production'}</ActionButton>}>
            <KpiGrid>
                <Kpi icon={<Package className="size-5" />} label="Products in Scope" value={kpis.products} />
                <Kpi icon={<ShieldCheck className="size-5" />} tone="good" label="Metrics Closed" value={`${kpis.closed} / ${kpis.metrics}`} caption={pct(kpis.closed, kpis.metrics)} />
                <Kpi icon={<CircleDot className="size-5" />} tone="warn" label="Metrics Open" value={kpis.open} />
                <Kpi icon={<FlaskConical className="size-5" />} tone="info" label="UAT Cases" value={kpis.cases} caption={`${kpis.executed} executed`} />
                <Kpi icon={<CheckCircle2 className="size-5" />} tone="good" label="UAT Passed" value={kpis.passed} caption={pct(kpis.passed, kpis.cases)} />
                <Kpi icon={<XCircle className="size-5" />} tone="bad" label="UAT Failed" value={kpis.failed} />
            </KpiGrid>
            {blockers.length > 0 && !authorised && <div role="status" className="rounded-[8px] border border-attested-500/40 bg-attested-50 p-3 text-xs text-attested-700"><strong>Release blockers:</strong> {blockers.join(' · ')}</div>}
            <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                <Card title="Gate Closure Register (All Ten Metrics)">
                    <SimpleTable columns={['Metric ID', 'Metric', 'Definition', 'Closure Method', 'Evidence', 'Measured', 'Target', 'Status', 'Closed At', 'Owner', 'Actions']} rows={metrics.map((m) => [
                        m.code, m.metric, <span key="d" className="text-xs">{m.definition}</span>, m.closure_method, m.evidence ?? '-', m.measured ?? '-', m.target,
                        <StatusPill key="s" status={m.status === 'closed' ? 'closed' : 'open'} tone={m.status === 'closed' ? 'good' : 'warn'} />, fmtDate(m.closed_at, true), m.owner,
                        m.status === 'open' ? <button key="a" type="button" onClick={() => setClosing(m)} className="rounded-[4px] border border-verified-500 px-2.5 py-1 text-xs font-semibold text-verified-700">Close</button> : <ActionButton key="a" href={`/admin/shop/releases/metrics/${m.id}/reopen`} tone="bad" confirm="Reopen this metric? Production authorisation will be withdrawn.">Reopen</ActionButton>,
                    ])} />
                    <p className="mt-2 text-xs text-ink-500">Authorisation threshold: {kpis.closed} / {kpis.metrics} closed ({pct(kpis.closed, kpis.metrics)})</p>
                </Card>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-center">
                    <h2 className="text-sm font-semibold text-ink-900">Release Candidate Summary</h2>
                    <p className="mt-1 text-xs text-ink-500">{release.candidate}</p>
                    <div className={`mx-auto mt-4 flex size-40 flex-col items-center justify-center rounded-full border-8 ${authorised ? 'border-verified-700 text-verified-700' : 'border-attested-500 text-attested-700'}`}>
                        {authorised ? <BadgeCheck className="size-7" /> : <Flag className="size-7" />}
                        <p className="mt-1 text-sm font-bold">{authorised ? 'PRODUCTION AUTHORISED' : 'NOT YET AUTHORISED'}</p>
                        <p className="text-[0.625rem]">{authorised ? 'ALL GATES AT ZERO' : `${blockers.length} blocker(s)`}</p>
                    </div>
                    <dl className="mt-4 space-y-1 text-left text-xs">
                        <div className="flex justify-between"><dt>Scope</dt><dd>{kpis.products} Products</dd></div>
                        <div className="flex justify-between"><dt>Countries</dt><dd>South Africa</dd></div>
                        <div className="flex justify-between"><dt>Authorised By</dt><dd>{release.authorised_by ?? '-'}</dd></div>
                        <div className="flex justify-between"><dt>Authorised At</dt><dd>{fmtDate(release.authorised_at, true)}</dd></div>
                    </dl>
                </section>
            </div>
            <div className="grid gap-5 xl:grid-cols-[20rem_1fr]">
                <Donut title={`UAT Execution Summary (${kpis.cases} Cases)`} caption="Total Cases" segments={[{ label: 'Passed', value: kpis.passed }, { label: 'Failed', value: kpis.failed, color: '#b5372a' }, { label: 'Blocked', value: kpis.blocked, color: '#d6a32e' }, { label: 'Not Executed', value: kpis.cases - kpis.executed, color: '#2f5fa8' }]} />
                <Card title="UAT Results">
                    <SimpleTable columns={['Test ID', 'Scenario', 'Result', 'Exception', 'Executed At', 'Executed By', 'Record']} rows={cases.map((c) => [
                        c.code, c.scenario, <StatusPill key="r" status={c.result === 'pass' ? 'passed' : c.result} tone={c.result === 'pass' ? 'good' : c.result === 'fail' ? 'bad' : 'warn'} />, c.exception ?? '-', fmtDate(c.executed_at, true), c.executed_by ?? '-',
                        <div key="a" className="flex gap-1"><ActionButton href={`/admin/shop/releases/uat/${c.id}`} data={{ result: 'pass' }} tone="good">Pass</ActionButton><button type="button" onClick={() => record(c, 'fail')} className="inline-flex h-8 items-center rounded-[4px] border border-risk-500/60 px-2.5 text-xs font-semibold text-risk-700">Fail</button></div>,
                    ])} />
                </Card>
            </div>
            {closing && <CloseModal metric={closing} onClose={() => setClosing(null)} />}
        </AdminShell>
    );
}

ReleasesConsole.layout = null;
export default ReleasesConsole;
