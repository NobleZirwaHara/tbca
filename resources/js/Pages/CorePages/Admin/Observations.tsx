import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, CircleCheck, ClipboardList, Download, Eye, Plus, RefreshCw, TrendingUp, Undo2, Users, Radar } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { COUNTRY_ADMIN_NAV, Pager } from '@/Components/CorePages/AdminParts';
import { BarRow, Donut } from '@/Components/CorePages/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal, StatusPill, Tag } from '@/Components/ui/Kit';
import type { Paginated } from '@/types/core-pages';

interface Row {
    obs_id: string; origin_surface: string; country: string; country_flag: string | null; observation_class: string; subject: string; value: string | null; rcs_link: number; quality_score: number;
    status: string; risk: string; availability_state: string; publication_permission: boolean; promoted_id: string | null; decision_note: string | null; captured_at: string; transitions: string[];
}

interface Props {
    observations: Paginated<Row>;
    kpis: { today: number; candidates: number; review: number; passed: number; promoted: number; retracted: number };
    byClass: Record<string, number>;
    bySurface: Record<string, number>;
    byState: Record<string, number>;
    quality: { label: string; count: number }[];
    rcsByCountry: { country: string; rcs: number }[];
    promotions: { id: string; class: string; at: string | null }[];
    options: { surfaces: string[]; classes: string[]; countries: string[]; states: string[] };
    filters: { q: string; surface: string; class: string; country: string; state: string; risk: string; status: string };
    thresholds: { quality: number; rcs: number };
}

const palette = ['var(--color-controlled-500)', 'var(--color-attested-500)', 'var(--color-verified-500)', 'var(--color-risk-500)', 'var(--color-referenced-500)', 'var(--color-ink-300)', 'var(--color-gold-500)', 'var(--color-ink-500)'];
const actionLabel: Record<string, string> = { under_review: 'Start review', passed: 'Pass quality gate', promoted: 'Promote', rejected: 'Reject', retracted: 'Retract' };
const riskTone = (r: string) => (r === 'High' ? 'bad' : r === 'Medium' ? 'warn' : 'good') as 'bad' | 'warn' | 'good';

export default function Observations(p: Props) {
    const { observations, kpis, filters, options, thresholds } = p;
    const [q, setQ] = useState(filters.q);
    const [creating, setCreating] = useState(false);
    const [viewing, setViewing] = useState<Row | null>(null);
    const form = useForm({ origin_surface: options.surfaces[0], country: 'South Africa', observation_class: options.classes[0], subject: '', value: '', rcs_link: 85, quality_score: 0.8, risk: 'Medium', availability_state: 'Active' });
    const go = (n: Partial<Props['filters']>) => router.get('/admin/core-pages/observations', { ...filters, ...n }, { preserveState: true, preserveScroll: true, replace: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        go({ q });
    };
    const move = (o: Row, status: string) => {
        const note = status === 'rejected' || status === 'retracted' ? window.prompt(`Reason for ${status === 'rejected' ? 'rejection' : 'retraction'} (optional)`) ?? '' : '';
        router.patch(`/admin/core-pages/observations/${o.obs_id}/status`, { status, note }, { preserveScroll: true });
    };
    const total = Object.values(p.byClass).reduce((s, v) => s + v, 0);
    const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(['Obs ID,Surface,Country,Class,Subject,RCS,Quality,Status,Risk', ...observations.data.map((o) => [o.obs_id, o.origin_surface, o.country, o.observation_class, `"${o.subject}"`, o.rcs_link, o.quality_score, o.status, o.risk].join(','))].join('\n'))}`;

    return (
        <ConsoleLayout
            area="Country Administration"
            areaIcon={Radar}
            groups={COUNTRY_ADMIN_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Countries' }, { label: 'Layer 9 Observation Intake' }]}
            title="Layer 9 Observation Intake"
            badge={<Tag tone="good">Intake Active</Tag>}
            description="Capture, validate and govern operational observations from all controlled surfaces and workflows."
            actions={
                <>
                    <button type="button" onClick={() => router.reload()} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><RefreshCw className="size-4" aria-hidden="true" />Refresh</button>
                    <a href={csv} download="layer9-observations.csv" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><Download className="size-4" aria-hidden="true" />Export Report</a>
                    <button type="button" onClick={() => setCreating(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-controlled-700 px-3 text-[0.8125rem] font-semibold text-white"><Plus className="size-4" aria-hidden="true" />New Observation</button>
                </>
            }
        >
            <Head title="Layer 9 Observation Intake" />
            <div className="grid gap-5 2xl:grid-cols-12">
                <div className="space-y-4 2xl:col-span-9">
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                        {[[CalendarDays, 'Observations Today', kpis.today, 'Across all surfaces', 'candidate'], [ClipboardList, 'Candidates (Unreviewed)', kpis.candidates, 'Awaiting triage', 'candidate'], [Users, 'Under Review', kpis.review, 'With reviewers', 'under_review'], [CircleCheck, 'Passed Quality Gate', kpis.passed, 'Awaiting promotion', 'passed'], [TrendingUp, 'Promoted to Evidence', kpis.promoted, 'Total promoted', 'promoted'], [Undo2, 'Retracted', kpis.retracted, 'With cascade', 'retracted']].map(([I, l, v, s, st]) => {
                            const Ico = I as typeof Users;
                            return <button key={l as string} type="button" onClick={() => go({ status: st as string })} className="rounded-[8px] border border-parchment-400 bg-white p-3 text-left hover:border-controlled-500"><div className="flex items-start justify-between"><p className="text-[0.75rem] font-medium text-ink-600">{l as string}</p><Ico className="size-5 text-controlled-500" aria-hidden="true" /></div><p className="mt-1 text-[1.5rem] font-bold text-ink-900">{v as number}</p><p className="text-[0.6875rem] text-ink-500">{s as string}</p></button>;
                        })}
                    </div>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex flex-wrap gap-2">
                            <form onSubmit={search} className="min-w-[10rem] flex-1"><label htmlFor="obs-q" className="sr-only">Search observations</label><input id="obs-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search observations..." className="h-9 w-full rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" /></form>
                            {([['surface', 'All Origin Surfaces', options.surfaces], ['class', 'All Observation Classes', options.classes], ['country', 'All Countries', options.countries], ['state', 'All Availability States', options.states], ['risk', 'All Risk Levels', ['Low', 'Medium', 'High']], ['status', 'Open queue', ['candidate', 'under_review', 'passed', 'promoted', 'rejected', 'retracted']]] as const).map(([k, l, o]) => (
                                <select key={k} aria-label={l} value={filters[k]} onChange={(e) => go({ [k]: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 text-[0.8125rem]"><option value="">{l}</option>{o.map((x) => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select>
                            ))}
                        </div>
                        <h2 className="mt-4 text-[0.875rem] font-bold text-ink-900">Latest Observation Candidates</h2>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-[0.75rem]">
                                <thead className="text-[0.6875rem] text-ink-500"><tr>{['Obs ID', 'Origin Surface', 'Country / Corridor', 'Observation Class', 'Subject / Metric', 'Captured At', 'RCS Link', 'Quality Score', 'Publication', 'Status', 'Risk Level', 'Actions'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {observations.data.length === 0 && <tr><td colSpan={12} className="py-6 text-center text-ink-400">No observations in this queue.</td></tr>}
                                    {observations.data.map((o) => (
                                        <tr key={o.obs_id}>
                                            <td className="px-2 py-2 font-mono text-controlled-700">{o.obs_id}</td>
                                            <td className="px-2 py-2">{o.origin_surface}</td>
                                            <td className="px-2 py-2">{o.country}</td>
                                            <td className="px-2 py-2">{o.observation_class}</td>
                                            <td className="px-2 py-2 font-medium text-ink-900">{o.subject}{o.value ? <span className="block text-[0.6875rem] text-ink-500">{o.value}</span> : null}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{o.captured_at}</td>
                                            <td className={o.rcs_link >= thresholds.rcs ? 'px-2 py-2 text-verified-700' : 'px-2 py-2 text-risk-500'}>{o.rcs_link}%</td>
                                            <td className={o.quality_score >= thresholds.quality ? 'px-2 py-2 font-semibold' : 'px-2 py-2 font-semibold text-risk-500'}>{o.quality_score.toFixed(2)}</td>
                                            <td className="px-2 py-2">
                                                <button type="button" disabled={['rejected', 'retracted'].includes(o.status)} onClick={() => router.patch(`/admin/core-pages/observations/${o.obs_id}/permission`, {}, { preserveScroll: true })} className={o.publication_permission ? 'rounded border border-verified-500/40 bg-verified-50 px-1.5 text-verified-700' : 'rounded border border-parchment-400 px-1.5 text-ink-500'} aria-pressed={o.publication_permission}>{o.publication_permission ? 'Permitted' : 'Not permitted'}</button>
                                            </td>
                                            <td className="px-2 py-2"><StatusPill status={o.status} tone={o.status === 'promoted' || o.status === 'passed' ? 'good' : o.status === 'under_review' ? 'info' : o.status === 'candidate' ? 'warn' : 'bad'} /></td>
                                            <td className="px-2 py-2"><StatusPill status={o.risk} tone={riskTone(o.risk)} /></td>
                                            <td className="px-2 py-2">
                                                <span className="flex flex-wrap gap-1">
                                                    <button type="button" onClick={() => setViewing(o)} aria-label={`View ${o.obs_id}`} className="rounded border border-parchment-400 p-1"><Eye className="size-3.5" /></button>
                                                    {o.transitions.map((t) => <button key={t} type="button" onClick={() => move(o, t)} className={t === 'rejected' || t === 'retracted' ? 'rounded border border-risk-500/40 px-1.5 text-risk-500' : 'rounded border border-parchment-400 px-1.5'}>{actionLabel[t]}</button>)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pager page={observations} />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-4">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Observations by Availability State</h2>
                            <div className="mt-2 flex justify-center"><Donut segments={Object.entries(p.byState).map(([k, v], i) => ({ value: v, color: palette[i], label: k }))} center={total} /></div>
                            <ul className="mt-2 space-y-0.5 text-[0.6875rem]">{Object.entries(p.byState).map(([k, v], i) => <li key={k} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: palette[i] }} />{k} <strong>{v}</strong></li>)}</ul>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Quality Score Distribution</h2>
                            <div className="mt-3 flex h-32 items-end gap-2" role="img" aria-label="Quality score histogram">
                                {p.quality.map((b) => { const max = Math.max(1, ...p.quality.map((x) => x.count)); return <div key={b.label} className="flex flex-1 flex-col items-center gap-1"><span className="text-[0.625rem]">{b.count}</span><span className="w-full rounded-t bg-controlled-500" style={{ height: `${(b.count / max) * 90}px` }} /><span className="text-[0.5625rem] text-ink-500">{b.label}</span></div>; })}
                            </div>
                            <p className="mt-1 text-[0.6875rem] text-ink-500">Quality gate: ≥ {thresholds.quality.toFixed(2)}</p>
                        </section>
                        <section className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">RCS Coverage (Selected)</h2>
                            {p.rcsByCountry.map((r) => <BarRow key={r.country} label={r.country} value={r.rcs} suffix="%" color="bg-controlled-500" />)}
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Latest Promotions</h2>
                            <ul className="mt-2 space-y-1 text-[0.6875rem]">{p.promotions.length === 0 ? <li className="text-ink-400">None yet.</li> : p.promotions.map((x) => <li key={x.id} className="grid grid-cols-[1fr_auto] gap-2"><span className="font-mono text-controlled-700">{x.id}<span className="block font-sans text-ink-500">{x.class}</span></span><span>{x.at}</span></li>)}</ul>
                        </section>
                    </div>
                </div>

                <aside className="space-y-4 2xl:col-span-3">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Observation Intake by Class</h2>
                        <div className="mt-2 flex justify-center"><Donut segments={Object.entries(p.byClass).map(([k, v], i) => ({ value: v, color: palette[i % palette.length], label: k }))} center={total} sub="Total" /></div>
                        <ul className="mt-2 space-y-0.5 text-[0.6875rem]">{Object.entries(p.byClass).map(([k, v], i) => <li key={k} className="flex justify-between"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: palette[i % palette.length] }} />{k}</span><strong>{Math.round((v / Math.max(1, total)) * 100)}% ({v})</strong></li>)}</ul>
                    </section>
                    <section className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Intake by Origin Surface</h2>
                        {Object.entries(p.bySurface).map(([k, v]) => <BarRow key={k} label={k} value={v} max={Math.max(1, ...Object.values(p.bySurface))} color="bg-controlled-500" />)}
                    </section>
                    <section className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-[0.75rem] text-controlled-700">
                        <p className="font-semibold">Layer 9 rules</p>
                        <p>Candidates are captured with publication permission false. Quality gate: score ≥ {thresholds.quality.toFixed(2)} and RCS link ≥ {thresholds.rcs}%. Promotion requires granted publication permission. Nothing is published until it passes all gates. No-source, no-answer. No evidence, no claim.</p>
                    </section>
                </aside>
            </div>

            <Modal open={creating} onClose={() => setCreating(false)} title="New Observation" size="lg">
                <form
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/admin/core-pages/observations', { preserveScroll: true, onSuccess: () => { setCreating(false); form.reset('subject', 'value'); } });
                    }}
                >
                    <Field label="Origin surface" required>{(id) => <Select id={id} options={options.surfaces} value={form.data.origin_surface} onChange={(e) => form.setData('origin_surface', e.target.value)} />}</Field>
                    <Field label="Country / corridor" required error={form.errors.country}>{(id) => <Input id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} />}</Field>
                    <Field label="Observation class" required>{(id) => <Select id={id} options={options.classes} value={form.data.observation_class} onChange={(e) => form.setData('observation_class', e.target.value)} />}</Field>
                    <Field label="Availability state" required>{(id) => <Select id={id} options={options.states} value={form.data.availability_state} onChange={(e) => form.setData('availability_state', e.target.value)} />}</Field>
                    <Field label="Subject / metric" required error={form.errors.subject} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} />}</Field>
                    <Field label="Observed value">{(id) => <Input id={id} value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} />}</Field>
                    <Field label="Risk level" required>{(id) => <Select id={id} options={['Low', 'Medium', 'High']} value={form.data.risk} onChange={(e) => form.setData('risk', e.target.value)} />}</Field>
                    <Field label="RCS link (%)" required error={form.errors.rcs_link}>{(id) => <Input id={id} type="number" min={0} max={100} value={form.data.rcs_link} onChange={(e) => form.setData('rcs_link', Number(e.target.value))} />}</Field>
                    <Field label="Quality score (0–1)" required error={form.errors.quality_score}>{(id) => <Input id={id} type="number" min={0} max={1} step={0.01} value={form.data.quality_score} onChange={(e) => form.setData('quality_score', Number(e.target.value))} />}</Field>
                    <button type="submit" disabled={form.processing} className="h-10 rounded-[4px] bg-controlled-700 text-sm font-semibold text-white sm:col-span-2">Capture candidate</button>
                </form>
            </Modal>
            <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.obs_id ?? ''}>
                {viewing && (
                    <dl className="space-y-1.5 text-sm">
                        {[['Surface', viewing.origin_surface], ['Country', viewing.country], ['Class', viewing.observation_class], ['Subject', viewing.subject], ['Value', viewing.value ?? '—'], ['RCS link', `${viewing.rcs_link}%`], ['Quality', viewing.quality_score.toFixed(2)], ['Status', viewing.status], ['Publication permission', viewing.publication_permission ? 'true' : 'false'], ['Promoted ID', viewing.promoted_id ?? '—'], ['Decision note', viewing.decision_note ?? '—']].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                    </dl>
                )}
            </Modal>
        </ConsoleLayout>
    );
}

Observations.layout = null;
