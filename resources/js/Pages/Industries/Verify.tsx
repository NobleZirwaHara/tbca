import { router } from '@inertiajs/react';
import { Card, Kpi, Kpis, Method, STable, StatusChip, TagP, TagS, saveState } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, WorkspacePage, dayS } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Req = { id: string; ev: string; desc: string; src: string; imp: string; due: string; status: string; file: string | null; i: number };
interface Props extends IndustryBase { reqs: Req[]; stateKey: string; bw: boolean; inWorkspace: boolean }

export default function Verify(p: Props) {
    const { ind, ctx, reqs } = p;
    const sub = reqs.filter((r) => r.status === 'Submitted').length;
    const upload = (i: number, name: string) => {
        const st: Record<number, string> = {};
        reqs.forEach((r) => { if (r.file) st[r.i] = r.file; });
        st[i] = name;
        void saveState(p.stateKey, st).then(() => router.reload({ only: ['reqs'] }));
    };
    const body = (
        <>
            <Head1 eyebrow="Mock-up Page 15" title="Industry Verification & Evidence Request" desc={`Verify the evidence behind ${ind.name} intelligence for ${ctx.country.name}. Your evidence helps keep AIIM data accurate and trusted.`} />
            <Kpis>
                <Kpi l="Verification status" v={sub === reqs.length ? 'Complete' : 'In progress'} icon="gauge" />
                <Kpi l="Requests outstanding" v={`${reqs.length - sub} of ${reqs.length}`} icon="alert" />
                <Kpi l="Evidence submitted" v={`${sub} of ${reqs.length}`} icon="check" />
                <Kpi l="Last updated" v={dayS()} icon="clock" />
            </Kpis>
            <Card title="Evidence requests" icon="file" sub={p.bw ? <TagS s="BW_Facts / BW_DataGaps" /> : <><TagP /> requests generated from the Botswana fact template</>}>
                <STable head={['Request ID', 'Evidence required', 'Source type', 'Impact', 'Due', 'Status', 'Action']} rows={reqs.map((r) => [
                    <span className="font-mono text-[0.72rem]">{r.id}</span>, <><b className="text-[0.8rem]">{r.ev}</b><div className="text-[0.72rem] text-ink-400">{r.desc}</div></>, <span className="text-[0.78rem]">{r.src}</span>,
                    <StatusChip s={r.imp} />, <span className="whitespace-nowrap">{r.due}</span>, <StatusChip s={r.status} />,
                    r.file ? <span className="text-[0.72rem]">{r.file}</span> : (
                        <label className="relative inline-flex cursor-pointer items-center rounded-[4px] border border-parchment-500 bg-white px-2.5 py-1 text-[0.75rem] font-semibold whitespace-nowrap">+ Upload
                            <input type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(r.i, f.name); }} />
                        </label>
                    ),
                ])} />
                <p className="mt-2 text-[0.72rem] text-ink-400">The file name is recorded against the request; analysts collect the document itself through your TBCA Advisor.</p>
            </Card>
            <Card title="How verification works" icon="check">
                <Method items={['1 · REVIEW REQUEST', '2 · SUBMIT EVIDENCE', '3 · UNDER REVIEW', '4 · RESOLVED']} />
                <p className="mt-3 text-[0.82rem]">Analysts validate submissions; verified data is published across AIIM with its grade and date.</p>
            </Card>
        </>
    );
    return p.inWorkspace ? <WorkspacePage base={p} active="verify" label="Industry Verification">{body}</WorkspacePage> : <IndustryPage base={p} active="verify">{body}</IndustryPage>;
}
