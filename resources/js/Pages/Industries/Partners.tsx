import { A, B, Card, Cols, CxChip, DataTable, Ic, N, TagP, Ticks, useMoney, useToast } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, iHref, sprintHref } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Row = { code: string; name: string; family: string; cx: number; cxl: string; ep: number | null };
interface Props extends IndustryBase { cats: { name: string; n: number }[]; rows: Row[] }

export default function Partners(p: Props) {
    const { ind, ctx } = p;
    const money = useMoney();
    const toast = useToast();
    return (
        <IndustryPage base={p} active="partners">
            <Head1 eyebrow="Partners · Mock-up Page 10" title={`${ind.name} — Partner Directory · ${ctx.country.name}`} desc="Find the right professional-route partner. All partners operate within the TBCA four-ledger model; engagements are contracted between you and the professional firm." />
            <Card title="How Professional Routes Work on TBCA" icon="layers">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[['users', 'You engage the professional', 'You select and contract directly with an independent firm.'], ['cash', 'Four-ledger transparency', 'Fees separated: T (TBCA), P (Partner), X (External), S (Statutory).'], ['shield', 'Scope & boundaries', 'Scope, limitations and professional boundaries are defined up front.'], ['check', 'Quality & compliance', 'Partners are verified and quality-monitored.']].map(([i, a, b]) => (
                        <div key={a} className="flex items-start gap-2"><Ic n={i} className="mt-0.5 text-gold-600" /><div><b className="text-[0.82rem]">{a}</b><div className="text-[0.72rem] text-ink-400">{b}</div></div></div>
                    ))}
                </div>
            </Card>
            <Card title="Partner Categories in This Sector" icon="users">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {p.cats.map((k) => (
                        <div key={k.name} className="flex min-h-[96px] flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                            <b className="text-[0.88rem]">{k.name}</b>
                            <span className="text-[0.72rem] text-ink-400">{N(k.n)} partner-delivered Sprints in this family</span>
                            <span className="text-[0.72rem]">Verified partner listings: <TagP /></span>
                            <B sm className="mt-auto self-start" onClick={() => toast.show(`Partner introduction requested: ${k.name} · ${ctx.country.name}. A TBCA Advisor confirms scope and conflicts first.`)}>Request introduction</B>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-[0.72rem] text-ink-400">Partner firm names publish once onboarding, licence checks and conflict checks complete. Counts above are real catalogue Sprints delivered through partners.</p>
            </Card>
            <Card title="Partner-delivered Sprints for this industry" icon="tag">
                <DataTable<Row> name={`partner-sprints-${ind.code}`} rows={p.rows} size={10} rowHref={(r) => sprintHref(ind, r.code)}
                    cols={[{ k: 'code', l: 'Code' }, { k: 'name', l: 'Sprint', clip: true }, { k: 'family', l: 'Family' }, { l: 'Complexity', r: (r) => <CxChip n={r.cx} name={r.cxl} />, v: (r) => r.cx }, { l: 'From', r: (r) => money(r.ep), v: (r) => r.ep ?? 0, num: true }]} />
            </Card>
            <Cols>
                <Card title="What to Consider" icon="check"><Ticks items={["Confirm the partner's scope and limits.", 'Review their experience in your sub-sector.', 'Verify regulatory registrations.', 'Agree fees, terms and deliverables (P ledger).']} /></Card>
                <Card title="Not sure which partner you need?" icon="spark"><p className="mb-2 text-[0.82rem]">Start with a sector-adapted diagnostic to get tailored recommendations.</p><A v="pri" href={iHref(ind, 'diagnostic')}>Run sector diagnostic</A></Card>
            </Cols>
            {toast.node}
        </IndustryPage>
    );
}
