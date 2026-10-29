import { A, Card, CatChip, Chip, Cols, CxChip, Dl, IICON, Note, N, RegChip } from '@/Components/Industries/Kit';
import { Head1, Legend, PlainPage, iHref } from '@/Components/Industries/Layout';
import type { Industry, IndustryBase } from '@/types/industries';

type V = Industry & { score: number };
interface Props extends IndustryBase { deep: V; thin: V; regulated: V }

function Col({ x, label, note }: { x: V; label: string; note: string }) {
    return (
        <Card title={label} icon={IICON[x.code]}>
            <div className="text-[0.72rem] text-ink-400">Home › Industries › {x.name}</div>
            <h3 className="my-1.5 text-[1.05rem] font-semibold">{x.name}</h3>
            <p className="mb-2 text-[0.82rem]">{x.desc}</p>
            <Dl rows={[['Industry Mode', <Chip t="Active" tone="ok" />], ['Catalogue', <CatChip cat={x.cat} />], ['Complexity', <CxChip n={x.cx} name={x.cxName} />], ['Regulatory', <RegChip reg={x.reg} />], ['Approved Sprints', N(x.stats.approved)], ['Diagnostics', N(x.stats.diagnostics)], ['Opportunity', `${N(x.score, 1)}/100`]]} />
            <Note className="my-3">{note}</Note>
            <A v="pri" block href={iHref(x)}>Open live page</A>
        </Card>
    );
}

export default function Instances({ deep, thin, regulated }: Props) {
    return (
        <PlainPage title="Industry Page Instances" crumbs={[['Industries', '/industries'], ['Industry Page Instances']]}>
            <Head1 eyebrow="IN-SCR-004 · Mock-up Page 4" title="Industry Page Instances ×3" desc="Three UAT variants of the Industry Page Template (IN-SCR-003), resolved from live catalogue depth and regulatory state." />
            <Legend items={[['#1f7a4c', 'Deep catalogue — strong content and services'], ['#b0781e', 'Thin / below threshold — honest limited depth'], ['#b5372a', 'Highly regulated — professional gate']]} />
            <Cols n={3}>
                <Col x={deep} label="Variant A · Deep Catalogue" note="Full catalogue, diagnostics and brief; standard human gate for C4–C5." />
                <Col x={thin} label={`Variant B · ${thin.cat === 'Thin' ? 'Thin Catalogue' : 'Below Threshold'}`} note="Honest overview: what we can and cannot do yet; request-update CTA." />
                <Col x={regulated} label="Variant C · Highly Regulated" note="Professional gate banner; approved service families only; licensed partner routes." />
            </Cols>
        </PlainPage>
    );
}
