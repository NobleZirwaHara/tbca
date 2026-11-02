/* P31 Client Workspace (prototype #/c/{ISO}/workspace). */
import { Link } from '@inertiajs/react';
import { A, B, Card, Chip, Cols, Dl, Donut, Kpi, Kpis, Note, STable, StatusChip, TagP, useMoney, useToast } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Props { base: CountryBase; j: JourneyState; s: JourneySprint; vat: number; today: string; plan: [string, string, string][]; created: string }

export default function Workspace({ base, j, s, vat, today, plan, created }: Props) {
    const { c } = base;
    const money = useMoney();
    const toast = useToast();
    const value = (s.fee ?? 0) * (1 + vat / 100);
    return (
        <CountryPage base={base} pageKey="workspace">
            <CountryHead base={base} pageKey="workspace" title={`${c.name} — Client Workspace`} desc="Your central workspace for this engagement: deliverables, tasks, communications and billing." />
            <CSteps c={c} active="workspace" j={j} />
            {!j.paid && <Note className="border-risk-500 bg-risk-50">Payment pending — the workspace is read-only until PV-1 passes. <Link href={cHref(c, 'pay')} className="text-controlled-700 hover:underline">Complete payment →</Link></Note>}
            <Kpis>
                <Kpi l="Engagement" v={j.engRef || 'Pending'} s={s.name} icon="file" />
                <Kpi l="Status" v={j.paid ? 'Active · On track' : 'Pending'} icon="check" />
                <Kpi l="Start / end" v={j.start} s="+21 days (Sprint)" icon="clock" />
                <Kpi l="Engagement value (incl. VAT)" v={money(value)} icon="cash" />
                <Kpi l="Account manager" v="Assigned at kick-off" s={<TagP />} icon="user" />
            </Kpis>
            <Cols n={2}>
                <Card title="Upcoming Milestones" icon="clock" act={<A sm href={cHref(c, 'deliverables')}>Deliverables →</A>}>
                    <STable compact head={['Milestone', 'Due', 'Status']} rows={plan.map((p) => [p[0], p[1], <StatusChip key="s" s={p[2]} />])} />
                </Card>
                <Card title="Recent Activity" icon="bell">
                    <ul className="list-disc space-y-1 ps-4 text-[0.82rem]">
                        <li>{created} — Quote request {j.ref} submitted</li>
                        {j.letterOk && <li>Engagement Letter {j.elRef} approved</li>}
                        {j.paid && <><li>Payment received · PV-1 passed · method: {j.method ?? ''}</li><li>Workspace access enabled</li></>}
                    </ul>
                </Card>
            </Cols>
            <Cols n={3}>
                <Card title="Tasks Overview" icon="check">
                    <Donut p={j.paid ? 33 : 0} label="complete" size={110} />
                    <Dl rows={[['Total tasks', 18], ['Completed', j.paid ? 6 : 0], ['In progress', j.paid ? 6 : 0], ['Pending', j.paid ? 6 : 18]]} />
                </Card>
                <Card title="Documents" icon="file">
                    <ul className="list-disc space-y-1 ps-4 text-[0.82rem]">
                        <li>Engagement Letter {j.elRef || '(draft)'}.pdf</li><li>Data request template.xlsx</li>{c.isBW && <li>BW-1.0 evidence annex (129 facts).csv</li>}
                    </ul>
                    <B sm className="mt-2" onClick={() => toast.show('Document upload opens with your advisor once the engagement starts.')}>Upload Document</B>
                </Card>
                <Card title="Billing & Payments" icon="cash">
                    <Dl rows={[['Invoice', `INV-2026-${(j.ref ?? '').slice(-4)}`], ['Amount', money(value)], ['Status', j.paid ? <Chip key="s" t="Paid" tone="ok" /> : <Chip key="s" t="Due" tone="warn" />]]} />
                </Card>
            </Cols>
            <Card title="Messages & Updates" icon="msg">
                <p className="text-[0.82rem]"><b>TBCA Engagement Lead</b> · {today}<br />Welcome — we have started the evidence pull from the {c.isBW ? 'Botswana registers (62 sheets)' : 'country manifest'} and will confirm scope at kick-off. <TagP /></p>
            </Card>
            <div className="flex flex-wrap gap-2">
                <A href={cHref(c, 'change')}>Request a change</A>
                <A href={cHref(c, 'closure')}>Close engagement</A>
                <A href={cHref(c, 'catalogue')}>Add another Sprint</A>
            </div>
            {toast.node}
        </CountryPage>
    );
}
