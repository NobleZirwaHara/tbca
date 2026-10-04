import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CalendarDays, ChevronRight, FileSearch, Info, UserCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Form';
import { Gauge, PageTitle, StatusDot, TrustBand } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';

type Status = 'available' | 'partial' | 'human_review' | 'external_review' | 'missing';
interface Props {
    ctx: { project_name: string; country: string; stage: string; capital: number; route: string };
    sectorLabel: string;
    dimensions: { key: string; name: string; sub: string; available: string; gap: string }[];
    answers: Record<string, Status>;
    points: Record<Status, number>;
    assessedAt: string;
}

const STATUS: Record<Status, [string, string]> = {
    available: ['Evidence Available', 'border-verified-500/40 bg-verified-50 text-verified-700'],
    partial: ['Evidence Partial', 'border-attested-500/40 bg-attested-50 text-attested-700'],
    human_review: ['Human Review Required', 'border-controlled-500/40 bg-controlled-50 text-controlled-700'],
    external_review: ['External Review Required', 'border-referenced-500/40 bg-referenced-50 text-referenced-700'],
    missing: ['Evidence Missing', 'border-risk-500/40 bg-risk-50 text-risk-700'],
};
const BANDS: [number, string][] = [[80, 'Well Prepared'], [60, 'Ready for Next Advisory Gate'], [30, 'Developing'], [0, 'Early Stage']];
const NOTES: Record<string, string> = { 'Well Prepared': 'Ready to commit to the next advisory gate with confidence.', 'Ready for Next Advisory Gate': 'Most evidence is in place. Close remaining gaps in parallel.', Developing: 'Strong foundation in some areas. Address key gaps to advance.', 'Early Stage': 'Significant evidence gaps. Start with structured discovery.' };
const ORDER: Status[] = ['missing', 'human_review', 'external_review', 'partial'];

export default function Readiness({ ctx, sectorLabel, dimensions, answers, points, assessedAt }: Props) {
    const form = useForm({ answers, project_name: ctx.project_name, capital: ctx.capital });
    const score = dimensions.reduce((s, d) => s + (points[form.data.answers[d.key]] ?? 0), 0);
    const band = BANDS.find(([min]) => score >= min)![1];
    const resolve = dimensions.filter((d) => form.data.answers[d.key] !== 'available').sort((a, b) => ORDER.indexOf(form.data.answers[a.key]) - ORDER.indexOf(form.data.answers[b.key])).slice(0, 5);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/project-advisory/readiness', { preserveScroll: true });
    };
    return (
        <>
            <Head title="Project Readiness Diagnostic" />
            <form onSubmit={submit} className="container-tbca py-8">
                <PageTitle
                    crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Readiness Diagnostic' }]}
                    title="Project Readiness Diagnostic"
                    sub="A structured assessment of your project across 10 critical readiness dimensions. This decision-support signal helps identify strengths, gaps and the next best advisory step."
                    actions={<><Button type="button" variant="outline" icon="download" onClick={() => window.print()}>Download Full Report (PDF)</Button><Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Save Readiness Signal</Button><ButtonLink href="/project-advisory/cost-exposure" variant="ink">Build My Method Card</ButtonLink></>}
                />
                <div className="grid gap-5 lg:grid-cols-12">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-6">
                        <h2 className="text-sm font-semibold">Readiness Assessment Across 10 Dimensions</h2>
                        <p className="mb-3 text-xs text-ink-500">Set the evidence state for each dimension — the signal recalculates instantly.</p>
                        <ul className="divide-y divide-parchment-300">
                            {dimensions.map((d, i) => {
                                const st = form.data.answers[d.key];
                                return (
                                    <li key={d.key} className="grid gap-2 py-2.5 sm:grid-cols-12 sm:items-center">
                                        <div className="sm:col-span-5"><p className="text-sm font-semibold"><span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-gold-500 text-[0.625rem]">{i + 1}</span>{d.name}</p><p className="text-[0.6875rem] text-ink-500">{d.sub}</p></div>
                                        <label className="sm:col-span-3">
                                            <span className="sr-only">{d.name} status</span>
                                            <select value={st} onChange={(e) => form.setData('answers', { ...form.data.answers, [d.key]: e.target.value as Status })} className={cn('w-full rounded border px-2 py-1 text-[0.6875rem] font-semibold', STATUS[st][1])}>
                                                {(Object.keys(STATUS) as Status[]).map((k) => <option key={k} value={k}>{STATUS[k][0]}</option>)}
                                            </select>
                                        </label>
                                        <p className="text-[0.6875rem] text-ink-600 sm:col-span-4">{st === 'available' ? d.available : d.gap}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-3">
                        <h2 className="text-sm font-semibold">Overall Readiness Signal</h2>
                        <div className="mt-3"><Gauge value={score} label={band} sub={NOTES[band]} /></div>
                        <div className="mt-4 rounded bg-parchment-200 p-3 text-xs">
                            <p className="font-semibold">Readiness Scale</p>
                            {[['0 - 29', 'Early Stage'], ['30 - 59', 'Developing'], ['60 - 79', 'Ready for Next Advisory Gate'], ['80 - 100', 'Well Prepared']].map(([r, l]) => <p key={r} className={cn('flex justify-between', l === band && 'font-bold text-gold-700')}><span>{r}</span><span>{l}</span></p>)}
                            <p className="mt-2 text-[0.625rem] text-ink-500">Points: Available 10 · Partial 6 · Human review 5 · External review 4 · Missing 0</p>
                        </div>
                        <p className="mt-3 flex gap-1.5 rounded bg-attested-50 p-2 text-[0.6875rem] text-attested-700"><Info className="size-3.5 shrink-0" />This is a decision-support signal, not a legal, investment, engineering or bankability certification.</p>
                    </section>
                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold">Your Project Snapshot</h2>
                            <Field label="Project Name" className="mt-2">{(id) => <Input id={id} value={form.data.project_name} onChange={(e) => form.setData('project_name', e.target.value)} />}</Field>
                            <Field label="Capital Requirement (ZAR)" className="mt-2" hint={formatZar(Number(form.data.capital) || 0)}>{(id) => <Input id={id} type="number" min={0} value={form.data.capital} onChange={(e) => form.setData('capital', Number(e.target.value))} />}</Field>
                            <dl className="mt-2 space-y-1 text-xs"><div className="flex justify-between"><dt className="text-ink-500">Country</dt><dd>{ctx.country}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Sector</dt><dd>{sectorLabel}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Project Stage</dt><dd>{ctx.stage}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Engagement Route</dt><dd className="capitalize">{ctx.route.replace('-', ' ')}</dd></div></dl>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold">What To Resolve Next</h2>
                            <ul className="mt-2 space-y-1.5">{resolve.map((r) => <li key={r.key} className="flex items-center gap-2 text-xs"><StatusDot state={form.data.answers[r.key] === 'missing' ? 'bad' : form.data.answers[r.key] === 'partial' ? 'warn' : 'info'} /><span className="flex-1">{r.gap.split('.').slice(-2)[0] || r.name}</span><ChevronRight className="size-3.5 text-ink-400" /></li>)}</ul>
                        </div>
                        <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-sm">
                            <p className="font-semibold">Need help prioritising?</p>
                            <p className="text-xs text-ink-600">Speak to a TBCA Advisor for a tailored readiness improvement plan.</p>
                            <ButtonLink href="/project-advisory/discovery" size="sm" className="mt-2" trailingIcon="arrow-right">Request Advisory Call</ButtonLink>
                        </div>
                    </aside>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-5">
                    {[[FileSearch, 'Assessment Method', 'TBCA Readiness Framework v2.0'], [FileSearch, 'Evidence Sources', 'Documents, interviews & data'], [CalendarDays, 'Assessment Date', assessedAt], [UserCheck, 'Assessed By', 'TBCA Advisory Team'], [CalendarDays, 'Next Review', '30 Days']].map(([I, k, v]) => {
                        const Icon = I as typeof FileSearch;
                        return <div key={k as string} className="flex gap-2"><Icon className="size-5 text-gold-600" /><div><dt className="text-ink-500">{k as string}</dt><dd className="font-semibold">{v as string}</dd></div></div>;
                    })}
                </dl>
            </form>
            <TrustBand tone="dark" items={[['Method Before Money', 'Understand before you commit'], ['Five-Ledger Transparency', 'T, P, X, S and C shown separately'], ['You Approve Before We Charge', 'No commitment without your assent'], ['Your Work Product Is Portable', 'You keep approved deliverables'], ['Human Review Where Required', 'AI-assisted. Human-led. Responsible.'], ['POPIA-Aware', 'Data controls']]} />
        </>
    );
}
