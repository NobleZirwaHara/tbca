import { Btn, DEAL, Dl, Flow, Panel, Pill, SvcRow, eng, type Country, type Svc } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    target: 'dd' | 'vdr' | 'project-advisory';
    no: number;
    title: string;
    cat: string;
    lead: string;
    site: string;
    services: Svc[];
    handoff: { reference: string; status: string; packets: string[]; approved: string | null } | null;
}

/** Pages 60 Due Diligence, 61 Virtual Deal Room and 62 Project Advisory hand-offs: one template, as the prototype's handoff(). */
export default function Handoff({ engagement: e, no, title, cat, lead, site, services, handoff: h }: Props) {
    return (
        <Flow title={title} eyebrow={`Page ${no} · Hand-off to ${cat}`} steps={{ list: DEAL, on: 3 }} lead={lead}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]}
            side={<>
                <Panel title="What moves across">
                    <ul className="list-disc space-y-1 ps-5 text-[0.85rem]">
                        <li>Opportunity record and evidence IDs</li>
                        <li>Verification report and badge</li>
                        <li>Introduction thread and consents</li>
                        <li>Fee manifest and ledger reference</li>
                    </ul>
                    {h && (
                        <div className="mt-3 border-t border-parchment-300 pt-3">
                            <Dl rows={[['Hand-off', <span className="font-mono">{h.reference}</span>], ['Status', <Pill s={h.status.replace(/_/g, ' ')} />], ['Approved', h.approved], ['Packets', h.packets.join(', ')]]} />
                        </div>
                    )}
                </Panel>
                <Btn href={site} v="dark">Open {cat}</Btn>
            </>}>
            <Panel title={`${cat} services (${services.length})`}>
                <div className="grid gap-2">{services.map((s) => <SvcRow key={s.code} s={s} context={title} />)}</div>
            </Panel>
        </Flow>
    );
}
