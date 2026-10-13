import { Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, Field, Input, KpPage, Select, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

type Sheet = Record<string, string | string[] | undefined> & { code?: string; status?: string; impacts?: string[] };

interface Props extends KpShared {
    sheet: Sheet | null;
    sheets: { code: string; title: string; status: string; updated: string }[];
    statuses: string[];
    fields: { key: string; label: string; hint: string }[];
    impacts: string[];
    topics: { value: string; label: string }[];
    today: string;
}

/** KP-SCR-024 Decision Sheet: capture, document and act on key decisions. */
export default function DecisionSheet({ screen, kpNav, sheet, sheets, statuses, fields, impacts, topics, today }: Props) {
    const s = sheet ?? {};
    const str = (k: string) => (typeof s[k] === 'string' ? (s[k] as string) : '');
    const form = useForm<Record<string, string | string[]>>({
        code: s.code ?? '', title: str('title'), topic: str('topic'), date: str('date') || today, owner_name: str('owner_name'), approver: str('approver'),
        summary: str('summary'), impacts: s.impacts ?? [], status: s.status ?? 'Draft',
        ...Object.fromEntries(fields.map((f) => [f.key, str(f.key)])),
    });
    const d = form.data;
    const filled = fields.filter((f) => String(d[f.key] ?? '').trim().length >= 10).length;
    const health = Math.round(((filled + (String(d.summary).length >= 10 ? 1 : 0) + ((d.impacts as string[]).length ? 1 : 0)) / (fields.length + 2)) * 100);
    const grade = (v: boolean) => (v ? 'Good' : 'Needs work');

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Decision Sheet']]}
            title="Decision Sheet"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            intro="Use this structured decision sheet to capture, document and act on key decisions."
            actions={s.code ? <a href={`${BASE}/decision-sheet/${s.code}/export`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Export</a> : undefined}
            left={
                <div className="space-y-4">
                    <Box title="Decision Context">
                        <div className="space-y-2">
                            <Field label="Title / Decision" error={form.errors.title as string}><Input required maxLength={200} value={d.title as string} onChange={(e) => form.setData('title', e.target.value)} placeholder="Enter a short, clear decision title" /></Field>
                            <Field label="Related Topic"><Select value={d.topic as string} onChange={(e) => form.setData('topic', e.target.value)} placeholder="Select..." options={topics} /></Field>
                            <Field label="Date"><Input type="date" value={d.date as string} onChange={(e) => form.setData('date', e.target.value)} /></Field>
                            <Field label="Owner"><Input value={d.owner_name as string} onChange={(e) => form.setData('owner_name', e.target.value)} /></Field>
                        </div>
                    </Box>
                    <Box title="Decision Impact">
                        <p className="-mt-2 mb-2 text-[0.75rem] text-ink-500">What areas does this decision impact?</p>
                        {impacts.map((i) => <label key={i} className="flex items-center gap-2 py-0.5 text-[0.8125rem]"><input type="checkbox" className="size-4 accent-referenced-500" checked={(d.impacts as string[]).includes(i)} onChange={() => form.setData('impacts', (d.impacts as string[]).includes(i) ? (d.impacts as string[]).filter((x) => x !== i) : [...(d.impacts as string[]), i])} />{i}</label>)}
                    </Box>
                    {sheets.length > 0 && (
                        <Box title="Your Sheets">
                            <ul className="space-y-1.5 text-[0.75rem]">{sheets.map((x) => <li key={x.code}><Link href={`${BASE}/decision-sheet?code=${x.code}`} className={cn('block hover:text-gold-700', x.code === s.code && 'font-bold text-gold-800')}>{x.code}: {x.title}<span className="block text-ink-500">{x.status} | {x.updated}</span></Link></li>)}</ul>
                            <Link href={`${BASE}/decision-sheet`} className="mt-2 inline-block text-[0.75rem] font-semibold text-gold-700">Start a new sheet</Link>
                        </Box>
                    )}
                </div>
            }
            rail={
                <>
                    <Box title="Decision Health">
                        <ConfidenceRing value={health} label={health >= 75 ? 'Well documented' : health >= 50 ? 'Partly documented' : 'Early draft'} />
                        <ul className="mt-3 space-y-1 text-[0.75rem]">
                            <li className="flex justify-between">Clarity<span>{grade(String(d.summary).length >= 30 && String(d.what ?? '').length >= 10)}</span></li>
                            <li className="flex justify-between">Evidence<span>{grade(String(d.assumptions ?? '').length >= 10)}</span></li>
                            <li className="flex justify-between">Options<span>{grade(String(d.options ?? '').length >= 10)}</span></li>
                            <li className="flex justify-between">Risk<span>{grade(String(d.risks ?? '').length >= 10)}</span></li>
                            <li className="flex justify-between">Measure<span>{grade(String(d.kpi ?? '').length >= 10)}</span></li>
                        </ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Health measures how completely the sheet is documented, not whether the decision is right.</p>
                    </Box>
                    <Box title="Related Tools">
                        <ul className="flex flex-wrap gap-1.5">{[['Boardroom Challenger', '/boardroom-challenger'], ['Funder Readiness Interviewer', '/funder-readiness'], ['Project Fatal-Flaw Explorer', '/project-fatal-flaw'], ['KP Knowledge Assistant', '/ask']].map(([t, h]) => <li key={t}><Link href={`${BASE}${h}`} className="inline-block rounded-[6px] border border-parchment-500 px-2 py-1 text-[0.6875rem] hover:border-referenced-500">{t}</Link></li>)}</ul>
                    </Box>
                </>
            }
        >
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/decision-sheet`, { preserveScroll: true }); }}>
                <Box title="Decision Summary" icon="clipboard-check">
                    <label htmlFor="summary" className="sr-only">Decision summary</label>
                    <textarea id="summary" rows={3} required minLength={10} maxLength={500} value={d.summary as string} onChange={(e) => form.setData('summary', e.target.value)} placeholder="Summarise the decision in one or two sentences..." className="w-full rounded-[8px] border border-parchment-500 p-3 text-[0.875rem]" />
                    <p className="flex justify-between text-[0.6875rem] text-ink-500"><span className="text-risk-500">{form.errors.summary as string}</span>{String(d.summary).length}/500</p>
                </Box>
                <Box title="Decision Details" icon="list-checks">
                    <div className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400">
                        {fields.map((f) => (
                            <label key={f.key} className="grid gap-2 p-2.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start">
                                <span className="text-[0.8125rem] font-semibold text-ink-900">{f.label}</span>
                                <textarea rows={2} maxLength={1000} value={d[f.key] as string} onChange={(e) => form.setData(f.key, e.target.value)} placeholder={f.hint} className="w-full rounded-[6px] border border-parchment-400 p-2 text-[0.8125rem]" />
                            </label>
                        ))}
                    </div>
                </Box>
                <Box title="Decision Approval" icon="shield-check">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Approver"><Input value={d.approver as string} onChange={(e) => form.setData('approver', e.target.value)} /></Field>
                        <Field label="Status"><Select value={d.status as string} onChange={(e) => form.setData('status', e.target.value)} options={statuses} /></Field>
                        <div className="flex items-end"><button type="submit" disabled={form.processing} className={cn(btnClass('gold'), 'w-full')}>{s.code ? 'Save Changes' : 'Save Decision Sheet'}</button></div>
                    </div>
                </Box>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3">
                    <p className="text-[0.8125rem]"><strong>Need help deciding?</strong> Use the Boardroom Challenger or ask the KP Knowledge Assistant for a fresh perspective.</p>
                    <Link href={`${BASE}/boardroom-challenger?decision=${encodeURIComponent(String(d.title))}`} className={btnClass('outline', 'sm')}>Ask the Boardroom Challenger</Link>
                </div>
            </form>
        </KpPage>
    );
}
