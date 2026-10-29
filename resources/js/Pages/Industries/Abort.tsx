import { router } from '@inertiajs/react';
import { useState } from 'react';
import { B, Card, Chip, Kpi, Kpis, Note, useMoney } from '@/Components/Industries/Kit';
import { Head1, NoEngagement, WorkspacePage } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals }

export default function Abort(p: Props) {
    const { e, tt } = p;
    const money = useMoney();
    const [confirm, setConfirm] = useState(false);
    if (!e || !tt) return <WorkspacePage base={p} active="abort" label="Abort Ladder"><NoEngagement base={p} /></WorkspacePage>;
    const g = e.gates;
    const rungs: [string, string, string, string, string, string, boolean][] = [
        ['S0', 'Arrival & Exploration', 'Any time before registration', 'Nothing recorded', 'Nothing', 'None', !g.G1],
        ['S1', 'Registration & Intent', 'After registration, before any paid access', 'Profile, saved preferences', 'Nothing', 'None', Boolean(g.G1 && !g.G3)],
        ['S2', 'Selection & Fee Sweep', 'After disclosure, before quotation approval', 'Fee sweep, disclosure manifest', 'Nothing', 'None', Boolean(g.G2 && !g.G3)],
        ['S3', 'Quotation approved', 'Before payment', 'Quotation and letter', 'Nothing', 'None', Boolean(g.G3 && !g.G4)],
        ['S4', 'Paid · work in progress', 'Before draft delivery', 'Work completed to last milestone', 'Future work and deliverables', 'Milestones completed are non-refundable', Boolean(g.G4 && !g.G5)],
        ['S5', 'Report commissioning', 'Before acceptance (Gate G5)', 'Draft report, methodology, sources', 'Final report and update cycle', 'Work to last accepted milestone', Boolean(g.G4 && !g.G5)],
        ['S6–S8', 'Escalation, specialist & mandate', 'At milestones in the contract', 'Accepted deliverables', 'Future work, introductions, outcomes', 'Per engagement contract', Boolean(g.G5)],
    ];
    const done = (e.tasks ?? []).filter((t) => t.done).length;
    const tot = (e.tasks ?? []).length || 1;
    const forfeit = g.G4 ? Math.round((tt.paid * done) / tot) : 0;

    return (
        <WorkspacePage base={p} active="abort" label="Abort Ladder">
            <Head1 eyebrow="Mock-up Page 18" title="Abort Ladder" desc="You can exit at any stage. The ladder shows when you can abort, what you keep, what you forfeit and any fees that apply." />
            <Card title="The Abort Ladder" icon="layers">
                <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400">
                    <table className="w-full border-collapse text-[0.78rem]">
                        <thead className="bg-parchment-200 text-left"><tr>{['Stage', 'Abort point', 'When you can abort', 'What you keep', 'What you forfeit', 'Fees that apply'].map((h) => <th key={h} className="border-b border-parchment-400 px-2.5 py-2 font-semibold">{h}</th>)}</tr></thead>
                        <tbody>
                            {rungs.map((r) => (
                                <tr key={r[0]} className={r[6] ? 'bg-gold-50 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'border-b border-parchment-300'}>
                                    <td className="px-2.5 py-2 font-bold">{r[0]}</td><td className="px-2.5 py-2"><b>{r[1]}</b>{r[6] && <> <Chip t="You are here" tone="gold" /></>}</td>
                                    <td className="px-2.5 py-2">{r[2]}</td><td className="px-2.5 py-2">{r[3]}</td><td className="px-2.5 py-2">{r[4]}</td><td className="px-2.5 py-2">{r[5]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Kpis>
                <Kpi l="Abort points available" v={String(rungs.filter((r) => !r[6]).length)} icon="check" />
                <Kpi l="Fees already paid" v={money(tt.paid)} icon="cash" />
                <Kpi l="Non-refundable (work done)" v={money(forfeit)} s={`${done}/${tot} milestones`} icon="lock" />
                <Kpi l="Refund if you abort now" v={money(Math.max(0, tt.paid - forfeit))} s="Pro-rata" icon="swap" />
            </Kpis>
            {e.aborted ? (
                <Note><Chip t="Aborted" tone="bad" /> This engagement was aborted. You can always start again — aborting does not affect your ability to return.</Note>
            ) : (
                <Card title="Abort this engagement" icon="alert">
                    <p className="mb-3 text-[0.85rem]">Key principles: you are always in control; fees, forfeiture and rights are disclosed up front; abort rules are tied to work completed, not time alone.</p>
                    <B v="danger" onClick={() => (confirm ? router.post('/industries/engage/action', { do: 'abort' }) : setConfirm(true))}>{confirm ? 'Click again to confirm the abort' : 'Abort engagement'}</B>
                </Card>
            )}
        </WorkspacePage>
    );
}
