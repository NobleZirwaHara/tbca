import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { BarChart3, Calendar, CheckCircle2, Clock, Search, ShieldOff, Users } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Donut, Legend, PALETTE, Stat, Status, Table } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Row { id: number; sector: string; name: string; type: string; minN: number; minK: number; minDiversity: number; nCurrent: number; kCurrent: number; diversityCurrent: number; nPass: boolean; kPass: boolean; diversityPass: boolean; suppressionRule: string | null; suppressed: boolean; suppressionReason: string | null; underReview: boolean; status: string; releaseState: string; level: string; lastReview: string | null; nextReview: string | null }
interface Props {
    filters: { q?: string; status?: string; type?: string };
    rows: Row[];
    kpis: { configured: number; sectors: number; eligible: number; below: number; suppressed: number; review: number };
    compliance: { label: string; pass: number; total: number }[];
    diversity: { label: string; count: number }[];
    suppressions: { label: string; reason: string | null; date: string }[];
    types: string[];
    industries: { value: string; label: string }[];
    share: number;
}

const Pass = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => <span className={cn('font-semibold', ok ? 'text-verified-700' : 'text-risk-700')}>{children}</span>;

export default function Benchmarks({ filters, rows, kpis, compliance, diversity, suppressions, types, industries }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', status: filters.status ?? '', type: filters.type ?? '' }, '/admin/insights/industries/benchmarks');
    const [tab, setTab] = useState('rules');
    const form = useForm({ sector: '', name: '', type: 'Cost Benchmark', min_n: 30, min_k: 10, min_diversity: 60, industry_id: '' });
    const act = (r: Row, action: string, extra: Record<string, unknown> = {}) => router.put(`/admin/insights/industries/benchmarks/${r.id}`, { action, ...extra } as Record<string, string>, { preserveScroll: true });

    return (
        <IndustryAdmin title="Benchmark Threshold & Data-Governance Console" badge="Governance Controlled" description="Configure publication thresholds and governing rules. Manage data diversity, anonymity and release control for sector benchmarks.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Benchmarks Configured" value={kpis.configured} caption={`Across ${kpis.sectors} sectors`} icon={<BarChart3 className="size-5" />} />
                <Stat label="Eligible for Publication" value={kpis.eligible} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Below Threshold (n/k/div)" value={kpis.below} tone="amber" icon={<Users className="size-5" />} />
                <Stat label="Suppressed (Privacy / Risk)" value={kpis.suppressed} tone="red" icon={<ShieldOff className="size-5" />} />
                <Stat label="Under Review" value={kpis.review} icon={<Clock className="size-5" />} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search sector or benchmark..." className="h-9 w-56 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Benchmark type" value={f.type} onChange={(e) => apply({ type: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
                <select aria-label="Publication status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Statuses</option><option value="eligible">Eligible</option><option value="below_threshold">Below Threshold</option><option value="suppressed">Suppressed</option><option value="under_review">Under Review</option></select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply Filters</button>
            </form>
            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_270px]">
                <div className="space-y-4">
                    <Tabs tabs={[{ key: 'rules', label: 'Benchmark Rules & Thresholds' }, { key: 'diversity', label: 'Data Diversity & Anonymity' }, { key: 'release', label: 'Release Control & Suppressions' }]} value={tab} onChange={setTab} />
                    <Box title={`Benchmark Rules (${rows.length})`}>
                        <Table
                            head={tab === 'rules'
                                ? ['Sector', 'Benchmark Name', 'Type', 'n ≥ (Min Contributors)', 'k-Anonymity (≥ k)', 'Diversity (≥ %)', 'Suppression Rules', 'Publication Status', 'Last Review', 'Next Review']
                                : tab === 'diversity' ? ['Sector', 'Benchmark', 'Contributors (n)', 'k', 'Diversity Index', 'Level', 'Release State']
                                : ['Sector', 'Benchmark', 'Status', 'Reason', 'Actions']}
                            rows={rows.map((r) =>
                                tab === 'rules'
                                    ? [r.sector, <strong key="n" className="text-xs">{r.name}</strong>, <span key="t" className="text-xs">{r.type}</span>, r.minN, r.minK, `${r.minDiversity}%`, <span key="s" className="text-xs">{r.suppressionRule}</span>, <Status key="p" value={r.status} />, r.lastReview, r.nextReview]
                                    : tab === 'diversity'
                                      ? [r.sector, r.name, <Pass key="n" ok={r.nPass}>{r.nCurrent} / {r.minN}</Pass>, <Pass key="k" ok={r.kPass}>{r.kCurrent} / {r.minK}</Pass>, <Pass key="d" ok={r.diversityPass}>{r.diversityCurrent}% / {r.minDiversity}%</Pass>, r.level, <span key="r" className="text-xs">{r.releaseState}</span>]
                                      : [r.sector, r.name, <Status key="s" value={r.status} />, <span key="r" className="text-xs">{r.suppressionReason ?? '—'}</span>,
                                          <span key="a" className="flex flex-wrap gap-1">
                                              {r.suppressed ? <button type="button" onClick={() => act(r, 'unsuppress')} className="rounded border px-1.5 py-0.5 text-[0.6875rem]">Lift suppression</button>
                                                  : <button type="button" onClick={() => { const reason = window.prompt('Suppression reason', 'Client concentration > 20%'); if (reason) act(r, 'suppress', { reason }); }} className="rounded border border-risk-500/40 px-1.5 py-0.5 text-[0.6875rem] text-risk-700">Suppress</button>}
                                              {r.underReview ? <button type="button" onClick={() => act(r, 'clear_review')} className="rounded border px-1.5 py-0.5 text-[0.6875rem]">Complete review</button>
                                                  : <button type="button" onClick={() => act(r, 'review')} className="rounded border px-1.5 py-0.5 text-[0.6875rem]">Send to review</button>}
                                          </span>],
                            )}
                        />
                    </Box>
                    <Box title="Rule Builder (Quick)">
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
                            <Field label="Sector" required error={form.errors.sector}>{(id) => <Input id={id} value={form.data.sector} onChange={(e) => form.setData('sector', e.target.value)} />}</Field>
                            <Field label="Benchmark name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                            <Field label="Type" required>{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={['Cost Benchmark', 'Margin Benchmark', 'Productivity Benchmark', 'Project Benchmark', 'Operational Benchmark']} />}</Field>
                            <Field label="Min contributors (n)" error={form.errors.min_n}>{(id) => <Input id={id} type="number" value={form.data.min_n} onChange={(e) => form.setData('min_n', Number(e.target.value))} />}</Field>
                            <Field label="k-Anonymity (≥ k)" error={form.errors.min_k}>{(id) => <Input id={id} type="number" value={form.data.min_k} onChange={(e) => form.setData('min_k', Number(e.target.value))} />}</Field>
                            <Field label="Diversity Index (%)" error={form.errors.min_diversity}>{(id) => <Input id={id} type="number" value={form.data.min_diversity} onChange={(e) => form.setData('min_diversity', Number(e.target.value))} />}</Field>
                            <Field label="Industry">{(id) => <Select id={id} value={form.data.industry_id} onChange={(e) => form.setData('industry_id', e.target.value)} options={industries} placeholder="Optional" />}</Field>
                        </div>
                        <button type="button" onClick={() => form.post('/admin/insights/industries/benchmarks', { preserveScroll: true, onSuccess: () => form.reset() })} className="mt-3 rounded bg-controlled-500 px-4 py-2 text-xs font-bold text-white">Save Rule</button>
                    </Box>
                </div>
                <div className="space-y-4">
                    <Box title="Threshold Compliance Overview">
                        <ul className="space-y-3 text-xs">{compliance.map((c) => <li key={c.label}><div className="flex justify-between"><span>{c.label}</span><strong>{c.total ? ((c.pass / c.total) * 100).toFixed(1) : 0}% ({c.pass}/{c.total})</strong></div><div className="mt-1 h-1.5 rounded-full bg-parchment-300"><div className="h-full rounded-full bg-verified-500" style={{ width: `${c.total ? (c.pass / c.total) * 100 : 0}%` }} /></div></li>)}</ul>
                    </Box>
                    <Box title="Data Diversity Index Distribution"><div className="flex flex-col items-center gap-3"><Donut label={rows.length} sub="Total" size={100} segments={diversity.map((d, i) => ({ value: d.count, color: PALETTE[i] }))} /><Legend items={diversity.map((d, i) => ({ label: d.label, value: d.count, color: PALETTE[i] }))} /></div></Box>
                    <Box title="Recent Suppressions"><ul className="space-y-2 text-xs">{suppressions.length === 0 ? <li className="text-ink-400">None.</li> : suppressions.map((s) => <li key={s.label}><strong className="block">{s.label}</strong>Reason: {s.reason} <span className="text-ink-400">· {s.date}</span></li>)}</ul></Box>
                    <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-500"><Calendar className="size-3.5" /> Numbers render publicly only for BM-05 PUBLISHABLE benchmarks.</p>
                </div>
            </div>
        </IndustryAdmin>
    );
}
