import { Link, router } from '@inertiajs/react';
import { Archive, CalendarClock, CheckCircle2, FileText, TriangleAlert } from 'lucide-react';
import { Bars, Box, Donut, Legend, Stat, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import type { ResourceCard } from '@/types/insights';

type Row = ResourceCard & { version: string; updated: string; daysToReview: number | null; slug: string };
interface Props {
    kpis: { total: number; upToDate: number; due: number; overdue: number; expired: number };
    score: number;
    due: Row[];
    overdue: Row[];
    risk: { label: string; pct: number }[];
    trend: { m: string; reviewed: number; due: number }[];
}

export default function Decay({ kpis, score, due, overdue, risk, trend }: Props) {
    const reviewed = (r: Row) => router.post(`/admin/insights/resources/records/${r.slug}/reviewed`, {}, { preserveScroll: true });
    const maxT = Math.max(1, ...trend.map((t) => Math.max(t.reviewed, t.due)));
    return (
        <ResourceAdmin title="Decay & Review Dashboard" description="Monitor content decay, review status, and upcoming actions to keep content current, accurate and compliant.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Resources" value={kpis.total} icon={<FileText className="size-5" />} />
                <Stat label="Up to Date" value={kpis.upToDate} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Due for Review" value={kpis.due} tone="amber" icon={<CalendarClock className="size-5" />} />
                <Stat label="Overdue" value={kpis.overdue} tone="red" icon={<TriangleAlert className="size-5" />} />
                <Stat label="Expired / Archived" value={kpis.expired} icon={<Archive className="size-5" />} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Box title="Content Decay Profile"><div className="flex items-center gap-4"><Donut label={`${score}%`} sub="Health" size={120} segments={[{ value: kpis.upToDate, color: '#2f9e5b' }, { value: kpis.due, color: '#d6a32e' }, { value: kpis.overdue, color: '#d64545' }, { value: kpis.expired, color: '#8b5cf6' }]} /><Legend items={[{ label: 'Up to date', value: kpis.upToDate, color: '#2f9e5b' }, { label: 'Due soon (≤ 30 days)', value: kpis.due, color: '#d6a32e' }, { label: 'Overdue', value: kpis.overdue, color: '#d64545' }, { label: 'Expired', value: kpis.expired, color: '#8b5cf6' }]} /></div><p className="mt-2 text-[0.6875rem] text-ink-500">Content Health Score — based on review currency.</p></Box>
                <Box title="Review Trend (Last 6 Months)">
                    <div className="flex h-36 items-end gap-2">{trend.map((t) => <div key={t.m} className="flex flex-1 flex-col items-center gap-0.5"><div className="flex h-28 w-full items-end gap-0.5"><div className="flex-1 rounded-t bg-verified-500" style={{ height: `${(t.reviewed / maxT) * 100}%` }} title={`Reviewed ${t.reviewed}`} /><div className="flex-1 rounded-t bg-gold-500" style={{ height: `${(t.due / maxT) * 100}%` }} title={`Due ${t.due}`} /></div><span className="text-[0.5625rem] text-ink-500">{t.m.split(' ')[0]}</span></div>)}</div>
                    <p className="mt-1 text-[0.6875rem] text-ink-500"><span className="text-verified-700">■</span> Reviewed · <span className="text-gold-700">■</span> Due for review</p>
                </Box>
                <Box title="Decay Risk by Type"><Bars items={risk.map((r) => ({ label: r.label, value: r.pct }))} max={100} format={(v) => `${v}%`} /></Box>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
                <Box title="Resources Due for Review">
                    <Table head={['Resource Title', 'Type', 'Category', 'Version', 'Last Reviewed', 'Next Review', 'Days Remaining', '']}
                        rows={due.map((r) => [<strong key="t">{r.title}</strong>, label(r.type), <span key="c" className="text-xs">{r.categoryLabel}</span>, `v${r.version}`, r.reviewedAt, r.nextReviewAt, <span key="d" className="rounded bg-attested-50 px-1.5 text-xs text-attested-700">{r.daysToReview} days</span>, <button key="b" type="button" onClick={() => reviewed(r)} className="rounded border px-2 py-0.5 text-xs">Mark reviewed</button>])}
                        empty="Nothing due in the next 30 days." />
                </Box>
                <Box title="Overdue Resources">
                    <ul className="space-y-2 text-xs">{overdue.map((r) => <li key={r.id} className="flex items-center justify-between gap-2"><Link href={`/admin/insights/resources/records/${r.slug}/edit`} className="flex items-center gap-1.5"><FileText className="size-4 text-risk-500" />{r.title}</Link><span className="text-risk-700">Overdue by {Math.abs(r.daysToReview ?? 0)} days</span></li>)}{overdue.length === 0 && <li className="text-ink-400">No overdue resources.</li>}</ul>
                    <p className="mt-3 text-[0.6875rem] text-ink-500">Overdue content is withheld from new downloads until reviewed (decay state machine).</p>
                </Box>
            </div>
        </ResourceAdmin>
    );
}
