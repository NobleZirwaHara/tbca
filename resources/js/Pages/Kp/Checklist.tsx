import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, KpPage, Limitation, Meter, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

type State = 'yes' | 'partial' | 'no' | 'na';

interface Props extends KpShared {
    title: string;
    sections: { title: string; items: { id: string; label: string; why: string; tool: string; href: string }[] }[];
    states: Record<string, State>;
    notes: string;
    saved: string | null;
}

const OPT: [State, string, string][] = [['yes', 'Yes', 'border-verified-500 bg-verified-50 text-verified-700'], ['partial', 'Partial', 'border-attested-500 bg-attested-50 text-attested-700'], ['no', 'No', 'border-risk-500 bg-risk-50 text-risk-700'], ['na', 'N/A', 'border-ink-300 bg-parchment-200 text-ink-600']];
const SECTION_ICON = [L.Target, L.Settings, L.ShieldCheck, L.Flag];

/** KP-SCR-031 Decision Checklist (go / no-go). */
export default function Checklist({ screen, kpNav, title, sections, states: initial, notes: n0, saved }: Props) {
    const [states, setStates] = useState<Record<string, State>>(initial);
    const [notes, setNotes] = useState(n0);
    const all = sections.flatMap((s) => s.items);
    const count = (k: State) => all.filter((i) => states[i.id] === k).length;
    const scored = all.filter((i) => states[i.id] && states[i.id] !== 'na');
    const readiness = scored.length ? Math.round((scored.reduce((a, i) => a + (states[i.id] === 'yes' ? 1 : states[i.id] === 'partial' ? 0.5 : 0), 0) / scored.length) * 100) : 0;
    const answered = all.filter((i) => states[i.id]).length;
    const gaps = all.filter((i) => states[i.id] === 'no' || states[i.id] === 'partial');
    const verdict = answered < all.length ? 'Complete the checklist' : count('no') > 2 ? 'No-go for now' : readiness >= 75 ? 'Go' : 'Go with conditions';

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['African Business Clinic', `${BASE}/african-business-clinic`], ['Decision Checklist']]}
            title={title}
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            intro="Use this checklist to validate key decision criteria before taking action."
            actions={
                <>
                    <button type="button" onClick={() => window.print()} className={btnClass('outline', 'sm')}><L.Printer className="size-3.5" />Print</button>
                    <button type="button" onClick={() => router.post(`${BASE}/tools/checklists/go-no-go`, { states, notes }, { preserveScroll: true })} className={btnClass('gold', 'sm')}><L.Save className="size-3.5" />Save Checklist</button>
                </>
            }
            rail={
                <>
                    <Box title="Checklist Summary">
                        <ConfidenceRing value={Math.round((answered / all.length) * 100)} label={`${answered} of ${all.length} answered`} />
                        <ul className="mt-3 space-y-1 text-[0.75rem]">{OPT.map(([k, l]) => <li key={k} className="flex justify-between"><span>{l}</span><strong>{count(k)}</strong></li>)}</ul>
                        {saved && <p className="mt-2 text-[0.6875rem] text-ink-500">Last saved {saved}.</p>}
                    </Box>
                    <Box title="Decision Readiness" tone={verdict === 'Go' ? 'cream' : 'light'}>
                        <p className="text-3xl font-bold text-ink-900">{readiness}<span className="text-base text-ink-500">/100</span></p>
                        <Meter value={readiness} tone={readiness >= 75 ? 'green' : readiness >= 50 ? 'orange' : 'red'} className="mt-1" />
                        <p className="mt-2 font-serif text-[1.0625rem] font-bold text-ink-900">{verdict}</p>
                        <p className="text-[0.6875rem] text-ink-500">Yes = 1, Partial = 0.5, No = 0. N/A is excluded.</p>
                    </Box>
                    <Box title="Key Gaps to Address">
                        {gaps.length ? <ul className="space-y-1 text-[0.75rem]">{gaps.map((g) => <li key={g.id} className="flex gap-2"><span className={cn('mt-1 size-2 shrink-0 rounded-full', states[g.id] === 'no' ? 'bg-risk-500' : 'bg-attested-500')} />{g.label} ({g.id.replace('-', '.')})</li>)}</ul> : <p className="text-[0.75rem] text-ink-500">No gaps marked yet.</p>}
                        <Link href={`${BASE}/action-pack/the-real-problem-isnt-capital`} className="mt-2 inline-block text-[0.75rem] font-semibold text-gold-700">Go to the Insight Action Pack</Link>
                    </Box>
                </>
            }
        >
            <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white">
                <table className="w-full text-left text-[0.8125rem]">
                    <thead className="border-b border-parchment-400 text-[0.75rem] text-ink-600"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Decision Criteria</th><th className="px-3 py-2">Why it matters</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Evidence / Tool</th></tr></thead>
                    {sections.map((s, si) => {
                        const Icon = SECTION_ICON[si] ?? L.Circle;
                        return (
                            <tbody key={s.title} className="divide-y divide-parchment-300">
                                <tr className="bg-referenced-50"><th colSpan={5} className="px-3 py-2 text-[0.75rem] font-bold tracking-wider text-referenced-500 uppercase"><span className="inline-flex items-center gap-2"><Icon className="size-4" aria-hidden="true" />{s.title}</span></th></tr>
                                {s.items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="px-3 py-2 text-ink-500">{it.id.replace('-', '.')}</td>
                                        <td className="px-3 py-2 font-semibold text-ink-900">{it.label}</td>
                                        <td className="px-3 py-2 text-ink-600">{it.why}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex gap-1" role="radiogroup" aria-label={`Status for ${it.label}`}>
                                                {OPT.map(([k, l, tone]) => <button key={k} type="button" role="radio" aria-checked={states[it.id] === k} onClick={() => setStates({ ...states, [it.id]: k })} className={cn('rounded-[4px] border px-1.5 py-0.5 text-[0.6875rem] font-semibold', states[it.id] === k ? tone : 'border-parchment-400 text-ink-500')}>{l}</button>)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2"><Link href={it.href} className="text-[0.75rem] text-gold-700 hover:underline">{it.tool}</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        );
                    })}
                </table>
            </div>
            <Box title="Notes and Actions" icon="pen">
                <label htmlFor="notes" className="sr-only">Notes</label>
                <textarea id="notes" rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Record conditions, owners and next steps..." className="w-full rounded-[8px] border border-parchment-500 p-3 text-[0.8125rem]" />
                <div className="mt-2 flex gap-2"><button type="button" onClick={() => setStates(Object.fromEntries(all.map((i) => [i.id, 'yes'])))} className={btnClass('outline', 'sm')}>Mark All Complete</button><button type="button" onClick={() => setStates({})} className={btnClass('outline', 'sm')}>Clear</button></div>
            </Box>
            <Limitation compact />
        </KpPage>
    );
}
