import { A, Card, N, STable, StatusChip } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, LimitStatement, sprintHref } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Rule = { id: string; type: string; fams: string | null; famName: string | null; reason: string; ref: string; alt: string };
type Res = { code: string; name: string; type: string; msg: string };
interface Props extends IndustryBase { rules: Rule[]; reserved: Res[] }

export default function Limits(p: Props) {
    const { ind } = p;
    return (
        <IndustryPage base={p} active="limits">
            <Head1 eyebrow="Limitations & Boundaries · Mock-ups 12 & 14" title={`${ind.name} — what we will not do`} desc="Visible at all times to protect you and to preserve professional integrity." />
            <Card title="Sector Limitation Statement" icon="shield"><LimitStatement ind={ind} /></Card>
            <Card title="Boundary rules applied to this industry" icon="lock" sub={`${N(ind.stats.blocked)} catalogue Sprints are restricted or blocked for ${ind.name}`}>
                <STable compact head={['Rule', 'Type', 'Applies to', 'Reason', 'Reference', 'Approved alternative']} rows={p.rules.map((r) => [r.id, <StatusChip s={r.type} />, r.fams ? `${r.famName} family` : 'All families', r.reason, <span className="text-[0.72rem]">{r.ref}</span>, r.alt])} />
            </Card>
            {p.reserved.length > 0 && (
                <Card title="Reserved services (never sold)" icon="alert">
                    <STable compact head={['Code', 'Service', 'Type', 'Why']} rows={p.reserved.map((r) => [<span className="font-mono">{r.code}</span>, r.name, <StatusChip s={r.type} />, <span className="text-[0.78rem]">{r.msg}</span>])} />
                    <A className="mt-3" href={sprintHref(ind, p.reserved[0].code)}>See how a blocked request is explained →</A>
                </Card>
            )}
        </IndustryPage>
    );
}
