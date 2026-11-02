import { Btn, DEAL, Flow, Panel, Pill, SvcRail, addToBasket, btn, eng, type Country, type Rail, type Svc } from '@/Components/Aiim/ProtoEngagement';
import { useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    project: string;
    items: { title: string; svc: Svc | null; done: boolean }[];
    rail: Rail;
}

/** Page 56 Project Packaging Workspace: investor readiness checklist. */
export default function Packaging({ engagement: e, project, items, rail }: Props) {
    const money = useMoney();
    const done = items.filter((i) => i.done).length;
    const open = items.length - done;
    return (
        <Flow title="Project Packaging Workspace" eyebrow="Page 56 · Investor readiness" steps={{ list: DEAL, on: 0 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]}
            lead={`Project: ${project}.`}
            side={<><Btn href={eng(e.reference, '/introductions')}>Request introductions</Btn><SvcRail rail={rail} context="Packaging" /></>}>
            <Panel title="Readiness checklist">
                <div className="grid gap-2">
                    {items.map((i) => (
                        <div key={i.title} className="flex items-center justify-between gap-3 rounded-[10px] border border-parchment-400 px-3 py-2.5">
                            <div className="min-w-0">
                                <b className="text-[0.88rem]">{i.done && '✓ '}{i.title}</b>
                                <div className="flex flex-wrap gap-x-2.5 text-[0.72rem] text-ink-500">
                                    {i.svc ? <><span className="font-mono">{i.svc.code}</span><span>{i.svc.price ? money(i.svc.price) : 'Not in the app catalogue yet'}</span></> : <span>Advisor task</span>}
                                </div>
                            </div>
                            {i.done ? <Pill s="Done" tone="ok" /> : i.svc?.price ? <button type="button" className={btn('gold', 'xs')} onClick={() => addToBasket(i.svc!, 'Packaging')}>Order</button> : <Pill s="Open" tone="info" />}
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-[0.75rem] text-ink-500">A service shows as done once its order is paid.</p>
            </Panel>
            <Panel title="Readiness">
                {[['Complete', done, 'bg-verified-500'], ['Open', open, 'bg-attested-500']].map(([l, v, c]) => (
                    <div key={l as string} className="grid grid-cols-[6rem_minmax(0,1fr)_2rem] items-center gap-3 py-1 text-[0.85rem]">
                        <span>{l}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-parchment-300"><i className={`block h-full rounded-full ${c}`} style={{ width: `${items.length ? ((v as number) / items.length) * 100 : 0}%` }} /></span>
                        <span className="text-right font-mono">{v}</span>
                    </div>
                ))}
            </Panel>
        </Flow>
    );
}
