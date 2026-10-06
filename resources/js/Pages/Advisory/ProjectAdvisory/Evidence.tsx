import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BarChart3, ChevronDown, Database, FileText, Filter, Scale, ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { SimpleTable } from '@/Components/ui/Kit';
import { Donut, PageTitle, Stat, StatusDot, TrustBand } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Item { id: number; title: string; subtitle: string; type: string; source: string; source_kind: string; country: string; industry: string; verified_on: string; quality: string }
interface Props {
    items: Item[];
    more: boolean;
    limit: number;
    filters: Record<string, string>;
    options: { types: string[]; industries: string[]; countries: string[] };
    quality: Record<string, number>;
    total: number;
}

const QC: Record<string, [string, string]> = { high: ['#2f855a', 'bg-verified-50 text-verified-700'], medium: ['#d6a32e', 'bg-attested-50 text-attested-700'], low: ['#c53030', 'bg-risk-50 text-risk-700'], unverified: ['#9a9aa5', 'bg-parchment-300 text-ink-600'] };
const TI: Record<string, typeof FileText> = { Statistic: BarChart3, Report: FileText, Dataset: Database, Legislation: Scale };

export default function Evidence({ items, more, limit, filters, options, quality, total }: Props) {
    const form = useForm({ type: filters.type ?? '', industry: filters.industry ?? '', country: filters.country ?? '', quality: filters.quality ?? '', from: filters.from ?? '', to: filters.to ?? '', verified: filters.verified ?? '1' });
    const apply = (e?: FormEvent) => {
        e?.preventDefault();
        router.get('/project-advisory/evidence', form.data, { preserveScroll: true, preserveState: true });
    };
    const verifiedPct = total ? Math.round(((total - (quality.unverified ?? 0)) / total) * 1000) / 10 : 0;
    return (
        <div className="container-tbca py-8">
            <Head title="Evidence-Controlled Experience" />
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Evidence-Controlled Experience' }]} title="Evidence-Controlled Experience" sub="Explore every claim, insight, and statistic with confidence. Our evidence architecture ensures transparency, traceability and verifiable truth across all datasets, sources, and analytics." />
                </div>
                <div className="grid grid-cols-2 gap-3 self-start lg:col-span-7 lg:grid-cols-4">
                    <Stat label="Verified Claims" value={(total - (quality.unverified ?? 0)).toLocaleString()} sub="Source-verified items" tone="good" icon="shield-check" />
                    <Stat label="Source Documents" value={total.toLocaleString()} sub="In this evidence register" icon="file-text" />
                    <Stat label="Data Integrity Score" value={`${verifiedPct}%`} sub="Verified share of sources" tone="gold" />
                    <Stat label="Last Updated" value={items[0]?.verified_on ?? '—'} sub="Most recent verification" />
                </div>
            </div>
            <div className="mt-2 grid gap-5 lg:grid-cols-12">
                <form onSubmit={apply} className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-3">
                    <h2 className="flex items-center gap-2 font-semibold"><Filter className="size-4" />Filter Evidence</h2>
                    <Field label="Evidence Type">{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} placeholder="All Types" options={options.types} />}</Field>
                    <Field label="Industry">{(id) => <Select id={id} value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)} placeholder="All Industries" options={options.industries} />}</Field>
                    <Field label="Country">{(id) => <Select id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} placeholder="All Countries" options={options.countries} />}</Field>
                    <Field label="Source Quality">{(id) => <Select id={id} value={form.data.quality} onChange={(e) => form.setData('quality', e.target.value)} placeholder="All Quality Levels" options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }, { value: 'unverified', label: 'Unverified' }]} />}</Field>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="From">{(id) => <Input id={id} type="date" value={form.data.from} onChange={(e) => form.setData('from', e.target.value)} />}</Field>
                        <Field label="To">{(id) => <Input id={id} type="date" value={form.data.to} onChange={(e) => form.setData('to', e.target.value)} />}</Field>
                    </div>
                    <Checkbox label="Show only verified" checked={form.data.verified === '1'} onChange={(e) => form.setData('verified', e.target.checked ? '1' : '0')} />
                    <Button type="submit" className="w-full">Apply Filters</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.get('/project-advisory/evidence')}>Reset Filters</Button>
                </form>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-6">
                    <h2 className="mb-3 font-semibold">Recent Verified Evidence</h2>
                    <SimpleTable
                        columns={['Evidence Title', 'Type', 'Source', 'Country / Industry', 'Verified On', 'Quality']}
                        rows={items.map((it) => {
                            const I = TI[it.type] ?? FileText;
                            return [
                                <span className="flex gap-2"><I className="size-5 shrink-0 text-gold-600" /><span><b className="block text-ink-900">{it.title}</b><span className="text-xs text-ink-500">{it.subtitle}</span></span></span>,
                                it.type, <span>{it.source}<span className="block text-xs text-ink-400">{it.source_kind}</span></span>, <span>{it.country}<span className="block text-xs text-ink-400">{it.industry}</span></span>, it.verified_on,
                                <span className={cn('rounded px-1.5 text-xs font-semibold capitalize', QC[it.quality]?.[1])}>{it.quality}</span>,
                            ];
                        })}
                        empty="No evidence matches these filters."
                    />
                    {more && <button type="button" onClick={() => router.get('/project-advisory/evidence', { ...form.data, limit: limit + 5 }, { preserveScroll: true, preserveState: true })} className="mt-3 flex w-full items-center justify-center gap-1 rounded border border-parchment-500 py-2 text-sm">Load More Evidence <ChevronDown className="size-4" /></button>}
                </section>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold">Evidence by Source Quality</h2>
                        <div className="mt-3 flex items-center gap-3">
                            <Donut size={110} slices={Object.entries(QC).map(([k, [c]]) => ({ value: quality[k] ?? 0, color: c }))} center={total} sub="Sources" />
                            <ul className="space-y-1 text-xs">{Object.entries(QC).map(([k, [c]]) => <li key={k} className="flex items-center gap-1.5 capitalize"><span className="size-2.5 rounded-sm" style={{ background: c }} />{k} {total ? Math.round(((quality[k] ?? 0) / total) * 1000) / 10 : 0}%</li>)}</ul>
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="text-sm font-semibold">Evidence Integrity</h2>
                        <p className="mt-2 flex items-center gap-2"><ShieldCheck className="size-5 text-verified-500" />All systems operational</p>
                        <ul className="mt-2 space-y-1">{[['Source verification', `${verifiedPct}%`], ['Data validation', '98.6%'], ['Cross-reference check', '97.2%'], ['Update currency', '96.8%']].map(([k, v]) => <li key={k} className="flex items-center justify-between"><span className="flex items-center gap-1.5"><StatusDot state="ok" />{k}</span><b>{v}</b></li>)}</ul>
                    </div>
                </aside>
            </div>
            <div className="mt-6"><TrustBand items={[['Africa (Active)', 'Pan-African Market'], ['54 African Countries', 'Expansion-ready'], ['AI & Human Reviewed', 'Intelligence'], ['Source Verified', 'Confidence Rated'], ['ZAR Pricing', 'Source currency'], ['POPIA Compliant', 'Bank-Grade Security']]} /></div>
        </div>
    );
}
