import { router } from '@inertiajs/react';
import { A, B, Card, Chip, Cols, Ic, Kpi, Kpis, Note, TagP, useMoney } from '@/Components/Industries/Kit';
import { CallButton, GateGrid, Head1, NoEngagement, WhatsAppButton, WorkspacePage, dayS, nowS } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals; gateList?: [string, string, string][] }

export default function Workspace(p: Props) {
    const { e, tt, ind } = p;
    const money = useMoney();
    if (!e || !tt) return <WorkspacePage base={p} active=""><NoEngagement base={p} /></WorkspacePage>;
    const tasks = e.tasks ?? [];
    const done = tasks.filter((t) => t.done).length;
    const prog = tasks.length ? Math.round((100 * done) / tasks.length) : 0;
    const next = tasks.find((t) => !t.done);
    const ready = done >= 6;
    const act = (d: Record<string, unknown>) => router.post('/industries/engage/action', d as never, { preserveScroll: true });
    const status = e.aborted ? ['Aborted', 'bad'] : e.gates.G5 ? ['Completed', 'ok'] : e.gates.G4 ? ['Active', 'ok'] : ['Awaiting payment', 'warn'];
    const exportCsv = () => {
        const rows = [['Task', 'Owner', 'Due', 'Done'], ...tasks.map((t) => [t.t, t.who, new Date(t.due).toDateString(), String(t.done)])];
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
        a.download = `workspace-${e.ref}.csv`;
        a.click();
    };

    return (
        <WorkspacePage base={p} active="">
            <Head1 eyebrow={<>Mock-up Page 21 · <Chip t={status[0]} tone={status[1] as 'ok'} /></>} title="Industry Workspace Dashboard" desc="Your central workspace to manage engagement activities, access deliverables, track payments and collaborate with TBCA."
                act={<><B onClick={exportCsv}>Export dashboard</B><B onClick={() => act({ do: 'escalate' })}>Request support</B></>} />
            <Kpis>
                <Kpi l="Engagement progress" v={`${prog} %`} s={`${done} of ${tasks.length} tasks`} icon="gauge" />
                <Kpi l="Next milestone" v={next ? next.t : 'All done'} s={next ? `Due ${dayS(next.due)}` : ''} icon="clock" />
                <Kpi l="Deliverables ready" v={ready ? '1 draft' : '0'} s={ready ? 'Draft report' : 'In progress'} icon="file" />
                <Kpi l="Outstanding balance" v={money(tt.out)} s={`Paid ${money(tt.paid)}`} icon="cash" />
            </Kpis>
            {!e.gates.G4 && <Note><Ic n="alert" className="me-1 inline" /> Payment pending — entitlement activates at the Payment Gate. <a className="underline" href="/industries/engage/gates">Continue gates →</a></Note>}
            <Card title="Gate Status" icon="shield"><GateGrid gates={p.gateList ?? []} done={e.gates} note={(k) => (e.gates[k] ? `Completed ${dayS(e.gates[k])}` : ['G6', 'G8'].includes(k) ? 'Optional / locked' : 'Pending')} /></Card>
            <Cols>
                <Card title="Tasks & Actions" icon="check">
                    {tasks.map((t) => (
                        <label key={t.id} className="flex items-start gap-2 border-b border-parchment-300 py-1.5">
                            <input type="checkbox" className="mt-1" checked={t.done} disabled={!e.gates.G4} onChange={() => act({ do: 'task', task: t.id })} />
                            <span className="min-w-0 flex-1 text-[0.82rem]"><b>{t.t}</b><br /><span className="text-ink-400">{t.who} · due {dayS(t.due)}</span></span>
                            {t.done ? <Chip t="Done" tone="ok" /> : new Date(t.due) < new Date() ? <Chip t="Overdue" tone="bad" /> : <Chip t="Pending" tone="warn" />}
                        </label>
                    ))}
                    {Boolean(e.gates.G4) && !ready && <B sm className="mt-2" onClick={() => act({ do: 'advance' })}>Simulate analyst progress</B>}
                </Card>
                <Card title="My Deliverables" icon="file">
                    <ul className="space-y-1.5 text-[0.82rem]">
                        <li>Engagement Letter {e.letter ? <Chip t="Signed" tone="ok" /> : <Chip t="Pending" tone="warn" />}</li>
                        <li>Scope of Work (Schedule 1) <Chip t="Active" tone="ok" /></li>
                        <li>Fee Schedule (Schedule 2) <Chip t="Active" tone="ok" /></li>
                        <li>Industry Classification Report <Chip t="View" tone="info" /></li>
                        <li>{e.name} — draft {ready ? <Chip t="Ready" tone="ok" /> : <Chip t="In progress" tone="warn" />}</li>
                        <li>Final report {e.gates.G5 ? <Chip t="Accepted" tone="ok" /> : <Chip t="After G5" />}</li>
                    </ul>
                    {ready && !e.gates.G5 && <div className="mt-3 flex flex-wrap gap-2"><A href="/industries/workspace/review">Specialist review</A><B v="pri" onClick={() => act({ do: 'accept' })}>Accept report (G5)</B></div>}
                </Card>
            </Cols>
            <Cols>
                <Card title="Recent Activity" icon="clock" act={<A sm href="/industries/workspace/ledger">Ledger →</A>}>
                    {e.ledger.length ? [...e.ledger].reverse().slice(0, 6).map((l, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 border-b border-parchment-300 py-1.5"><span className="text-[0.8rem]"><b>{l.type}</b> · {l.desc}</span><span className="text-[0.72rem] whitespace-nowrap text-ink-400">{nowS(l.at)}</span></div>
                    )) : <p className="text-[0.82rem] text-ink-400">No activity yet.</p>}
                </Card>
                <Card title="Your TBCA Advisor" icon="user">
                    <p className="text-[0.82rem]"><b>Industry Advisory Lead</b> — {ind.name}<br /><span className="text-ink-400">Assigned at payment · name shown after advisor onboarding <TagP /></span></p>
                    <div className="mt-2 flex flex-wrap gap-1.5"><WhatsAppButton /><CallButton v="default">Book a call</CallButton></div>
                </Card>
            </Cols>
        </WorkspacePage>
    );
}
