import { BadgeCheck, Bot, CheckCircle2, Clock, FileSearch, Gauge, Play, ShieldCheck, TriangleAlert, XCircle, CircleSlash, ListChecks } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { BarRow, LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, FilterSelect, SubAdminShell, filterTo, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, rand } from '@/Components/Products/Subscriptions/ui';
import { Donut, LineChart } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';

interface Props {
    results: [string, string, number, number, number, number][];
    trend: [string, number][];
    reasons: [string, number][];
    run: SubOpRow | null;
    catalogue: { slug: string; name: string; class: string; status: string; gate: string; evidence_id: string | null; price: number | null; floor: number | null; next_period_value: string | null }[];
    filters: { class: string; status: string };
    live: { tested: number; passed: number };
}

const PATH = '/admin/products/subscriptions/recurrence-test';

export default function RecurrenceTest({ results, trend, reasons, run, catalogue, filters, live }: Props) {
    const total = results.reduce((s, r) => s + r[2], 0) + live.tested;
    const passed = results.reduce((s, r) => s + r[3], 0) + live.passed;
    const warnings = results.reduce((s, r) => s + r[4], 0);
    const failed = total - passed - warnings;
    const pct = (n: number) => (total ? ((n / total) * 100).toFixed(2) : '0.00');
    const reasonTotal = reasons.reduce((s, r) => s + r[1], 0) || 1;
    const failures: [string, string, string, string][] = run?.data.failures ?? [];

    return (
        <SubAdminShell
            title="Recurrence Test Workbench"
            description="Validate, certify and monitor subscription recurrence compliance. Row-level decisions only: no manual override, no bulk PASS."
            actions={
                <ConsoleBtn tone="dark" onClick={() => post(`${PATH}/run`, {}, 'Run the row-level recurrence test against every plan now?')}>
                    <Play className="size-3.5" aria-hidden="true" /> Run Test
                </ConsoleBtn>
            }
            strip={[
                { icon: FileSearch, title: 'Evidence Based', body: 'Every result is backed by data.' },
                { icon: Bot, title: 'Automated & Scheduled', body: 'Runs daily to keep you compliant.' },
                { icon: ShieldCheck, title: 'Transparent', body: 'Full visibility into rules and results.' },
                { icon: ListChecks, title: 'Actionable', body: 'Clear next steps for every issue.' },
                { icon: BadgeCheck, title: 'Audit Ready', body: 'Reports are exportable and traceable.' },
            ]}
            note="Recurrence testing ensures that every subscription delivers ongoing value and complies with TBCA standards. A plan without a recurrence class and next-period value is not purchasable."
        >
            <div className="flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <FilterSelect label="Recurrence Class" value={filters.class} onChange={(v) => filterTo(PATH, filters, { class: v })} options={['R1', 'R2', 'R3', 'R4', 'R5'].map((c) => ({ value: c, label: c }))} />
                <FilterSelect label="Status" value={filters.status} onChange={(v) => filterTo(PATH, filters, { status: v })} options={[{ value: 'PASS', label: 'Pass' }, { value: 'FAIL', label: 'Fail / hold' }]} />
                <p className="ml-auto text-xs text-ink-500">
                    Last run: {run?.due_at ? new Date(run.due_at).toLocaleString('en-ZA') : 'never'} {run && <StatusPill status={run.status ?? ''} tone={run.status === 'PASS' ? 'good' : 'warn'} />}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Gauge} tone="purple" label="Products Tested" value={total.toLocaleString()} caption="100% of active products" />
                <StatTile icon={CheckCircle2} tone="green" label="Passed" value={passed.toLocaleString()} caption={`${pct(passed)}%`} />
                <StatTile icon={TriangleAlert} tone="orange" label="Warnings" value={warnings} caption={`${pct(warnings)}%`} />
                <StatTile icon={XCircle} tone="red" label="Failed" value={failed} caption={`${pct(failed)}%`} />
                <StatTile icon={CircleSlash} tone="blue" label="Not Applicable" value={0} caption="0.00%" />
                <StatTile icon={Clock} tone="gold" label="Avg Test Duration" value="00:03:42" caption="Per product" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Recurrence Class Results (R1–R5)">
                            <SimpleTable
                                columns={['Class', 'Products', 'Passed', 'Warnings', 'Failed', 'Pass Rate']}
                                rows={[
                                    ...results.map((r) => [<span className="font-semibold">{r[1]}</span>, r[2], r[3], r[4], r[5], `${((r[3] / r[2]) * 100).toFixed(2)}%`]),
                                    [<span className="font-bold">Total</span>, total, passed, warnings, failed, `${pct(passed)}%`],
                                ]}
                            />
                        </Card>
                        <Card title="Pass Rate Over Time">
                            <LineChart labels={trend.map((t) => t[0])} series={[{ name: 'Pass Rate (%)', values: trend.map((t) => t[1]), color: '#7c5cd6' }]} min={80} max={100} suffix="%" />
                        </Card>
                    </div>

                    <Card title="Live plan register — row-level gate (GATE-SU-01)">
                        <SimpleTable
                            columns={['Plan', 'Class', 'Status', 'Gate Result', 'Evidence ID', 'Price / Floor', 'Next-Period Value']}
                            rows={catalogue.map((p) => [
                                <span className="font-semibold text-ink-900">{p.name}</span>,
                                <ClassChip code={p.class} compact />,
                                <StatusPill status={p.status} />,
                                <StatusPill status={p.gate} tone={p.gate === 'PASS' ? 'good' : p.gate === 'NOT_RUN' ? 'neutral' : 'bad'} />,
                                p.evidence_id ?? <span className="text-risk-700">missing</span>,
                                `${rand(p.price)} / ${rand(p.floor)}`,
                                <span className="block max-w-[16rem] text-xs">{p.next_period_value ?? <span className="text-risk-700">missing</span>}</span>,
                            ])}
                            empty="No plans match these filters."
                        />
                    </Card>

                    <Card title="Recent Failures (latest run)">
                        <SimpleTable
                            columns={['Product / Plan', 'Recurrence Class', 'Failure Reason', 'Detected', 'Status']}
                            rows={failures.map((f) => [f[0], f[1], f[2], f[3], <StatusPill status="FAILED" tone="bad" />])}
                            empty="No failures in the latest run."
                        />
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card title="Test Summary">
                        {run ? (
                            <LabelValues
                                rows={[
                                    { label: 'Test ID', value: run.reference },
                                    { label: 'Test Type', value: run.data.type },
                                    { label: 'Triggered By', value: run.data.triggered_by },
                                    { label: 'Environment', value: run.data.environment },
                                    { label: 'Test Engine', value: run.data.engine },
                                    { label: 'Records Evaluated', value: run.data.records },
                                    { label: 'Rules Evaluated', value: run.data.rules },
                                    { label: 'Compliance Baseline', value: run.data.baseline },
                                ]}
                            />
                        ) : (
                            <p className="text-xs text-ink-500">No test run recorded. Run the test to evaluate every plan.</p>
                        )}
                    </Card>
                    <Card title="Recurrence Class Distribution">
                        <Donut data={results.map((r) => [r[1], r[2]])} center={String(total - live.tested)} caption="Portfolio" size={120} />
                    </Card>
                    <Card title="Top Failure Reasons">
                        <div className="space-y-2">
                            {reasons.map(([r, n]) => (
                                <BarRow key={r} label={r} value={n} max={reasonTotal} tone="bad" />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </SubAdminShell>
    );
}

RecurrenceTest.layout = null;
