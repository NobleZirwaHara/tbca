import { Link } from '@inertiajs/react';
import { ADV, Btn, Dl, Flow, Panel, SvcRail, eng, oppHref, type Rail } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    rows: [string, string][];
    opportunity: { id: string; name: string } | string | null;
    rail: Rail;
}

/** Page 44 Discovery Outcome: the agreed next steps the advisor recorded. */
export default function Outcome({ engagement: e, rows, opportunity, rail }: Props) {
    const opp = typeof opportunity === 'string' ? { id: opportunity, name: opportunity } : opportunity;
    return (
        <Flow title="Discovery Outcome" eyebrow="Page 44 · Agreed next steps" steps={{ list: ADV, on: 1 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]} side={<SvcRail rail={rail} context="Discovery outcome" />}>
            <Panel title="Outcome">
                <Dl rows={rows} />
                <div className="mt-4">
                    {e.quote ? <Btn href={eng(e.reference, '/quote')} size="sm">Get formal quotation</Btn> : <p className="text-[0.82rem] text-ink-500">Your advisor prepares the formal quotation from this outcome. It opens here once issued.</p>}
                </div>
            </Panel>
            {opp && (
                <Panel title="Opportunity referenced">
                    <Link href={oppHref(opp.id)} className="text-[0.88rem] font-semibold text-controlled-700 hover:underline">{opp.id === opp.name ? opp.name : `${opp.id} ${opp.name}`}</Link>
                </Panel>
            )}
        </Flow>
    );
}
