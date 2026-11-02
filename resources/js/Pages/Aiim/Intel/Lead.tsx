import * as L from 'lucide-react';
import { Banner, Btn, CtaBand, Dl, Hero, P, PackLoading, Panel, Rich, StatusPill, TierPill } from '@/Components/Aiim/ProtoExplore';
import { BriefCta, BwFrame, cHref, ObjActions, SvcRail, type BriefP, type IntelBase, type RailP, type Row } from '@/Components/Aiim/ProtoSearch';

interface Props extends IntelBase {
    id: string;
    lead: Row | null;
    brief?: BriefP;
    rail?: RailP;
}

/** Lead record, hotspot (BW-HL) or ranked (BW-RL) (prototype #lead.{id}). */
export default function Lead({ id, lead: l, brief, rail, bw, c, facts, saved }: Props) {
    const crumbs = [{ label: 'Leads', href: cHref(c.slug, 'leads') }, { label: id }];
    if (!bw || !l) {
        return (
            <BwFrame title={`${id} · Lead`} crumbs={crumbs}>
                <Hero eyebrow="L5 · Lead" title={id} />
                <div className="mt-6"><PackLoading country={c.name} what="Lead records" /></div>
            </BwFrame>
        );
    }
    return (
        <BwFrame title={`${id} · Lead`} crumbs={crumbs} facts={facts}>
            <Hero
                eyebrow="L5 · Lead"
                title={String(l.Opportunity)}
                lead={`${l.Hotspot ?? ''} ${l.Place} · ${l.Unit}`.trim()}
                right={<>
                    <Btn href={P.opp(String(l.Template))} tone="gold">Open template</Btn>
                    {l['Place ID'] && <Btn href={P.town(String(l['Place ID']))} tone="dark">Town</Btn>}
                    <Btn href={P.advisor} tone="dark">Request introduction</Btn>
                    <ObjActions type="lead" itemKey={id} saved={saved} compare={false} />
                </>}
                meta={<><TierPill t={l.Tier} /><span className="rounded-full border border-ink-700 px-2.5 py-1 text-[0.75rem] text-ink-200">score {String(l['Lead score'])}</span></>}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <Panel title="Lead record"><Dl rows={Object.entries(l).map(([k, v]) => [k, /Tier/.test(k) ? <TierPill t={v} /> : k === 'Status' ? <StatusPill s={v} /> : <Rich t={v} />])} /></Panel>
                <div className="grid content-start gap-4">
                    {l['Next action'] && <Banner icon={L.Bell}>{String(l['Next action'])} · due {String(l.Due)}</Banner>}
                    <BriefCta b={brief} />
                    <SvcRail rail={rail} ctx={id} />
                </div>
            </div>
            <CtaBand />
        </BwFrame>
    );
}
