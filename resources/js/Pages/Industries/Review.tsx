import { router } from '@inertiajs/react';
import { B, Card, Chip, Cols, Kpi, Kpis, STable, Steps, TagP, Ticks } from '@/Components/Industries/Kit';
import { Head1, NoEngagement, WorkspacePage, dayS, nowS } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; disc: string[] }

export default function Review(p: Props) {
    const { e, ind, disc } = p;
    if (!e) return <WorkspacePage base={p} active="review" label="Specialist Review"><NoEngagement base={p} /></WorkspacePage>;
    const signed = Object.values(e.reviews ?? {}).filter(Boolean).length;
    const due = new Date(e.gates.G4 ?? e.created);
    due.setDate(due.getDate() + 15);

    return (
        <WorkspacePage base={p} active="review" label="Specialist Review">
            <Head1 eyebrow="Mock-up Page 24" title="Specialist Review and Sign-Off" desc="Qualified specialist review and sign-off are required before this engagement can be delivered. At least two disciplines must sign off." />
            <Steps items={['Scope & Classification', 'Data & Analysis', 'Specialist Review', 'Client Acknowledgement', 'Sign-off & Release'].map((s, i) => ({ label: s, state: i < 2 || (i === 2 && signed >= 2) ? 'done' : i === 2 ? 'on' : e.gates.G5 ? 'done' : '' }))} />
            <Kpis>
                <Kpi l="Review status" v={signed >= 2 ? 'Complete' : 'In progress'} s={`${signed} of 3 signed`} icon="check" />
                <Kpi l="Complexity" v={ind.cxName} s="Required disciplines: 3" icon="gauge" />
                <Kpi l="Due date" v={dayS(due.toISOString())} icon="clock" />
            </Kpis>
            <Card title="Specialist Review Panel" icon="users">
                <STable head={['Discipline', 'Specialist', 'Role', 'Status', 'Signature']} rows={disc.map((d, i) => [
                    <b>{d}</b>, <>Specialist {'ABC'[i]} · ID SP-{ind.code}-{String(i + 1).padStart(3, '0')} <span className="text-[0.72rem]"><TagP /> name after panel onboarding</span></>,
                    i ? 'Specialist reviewer' : 'Lead reviewer', e.reviews[d] ? <Chip t="Completed" tone="ok" /> : <Chip t={i === 0 ? 'In review' : 'Pending'} tone="warn" />,
                    e.reviews[d] ? <span className="text-[0.78rem]">Signed {nowS(e.reviews[d])}</span> : <B sm onClick={() => router.post('/industries/engage/action', { do: 'sign', discipline: d }, { preserveScroll: true })}>Record sign-off</B>,
                ])} />
            </Card>
            <Cols>
                <Card title="Documents under review" icon="file">
                    <ul className="list-disc space-y-1 ps-5 text-[0.82rem]"><li>{e.name} (draft) · {e.ref}-D1.pdf</li><li>Data tables & annexures · {e.ref}-A.xlsx</li><li>Methodology & sources · {e.ref}-M.pdf</li><li>Limitations & assumptions · {e.ref}-L.pdf</li></ul>
                    <p className="mt-2 text-[0.72rem] text-ink-400">Documents are generated at delivery.</p>
                </Card>
                <Card title="Review checklist" icon="check">
                    <Ticks items={['Scope aligns with classification and client need', 'Data sources are appropriate and credible', 'Methodology is defensible and transparent', 'Analysis is accurate and qualified', 'Limitations and assumptions clearly stated', 'Conclusions are balanced and unbiased']} />
                    <p className="mt-2 text-[0.72rem] text-ink-400">Specialist opinions are independent of TBCA. All reviews are recorded for audit.</p>
                </Card>
            </Cols>
        </WorkspacePage>
    );
}
