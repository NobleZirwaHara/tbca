import { ADV, Btn, Dl, Flow, PackLoading, Panel, SvcRail, Table, eng, type Country, type Rail } from '@/Components/Aiim/ProtoEngagement';
import { N } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    sectorName: string | null;
    coverage: { facts: number; templates: number; leads: number } | null;
    gaps: Record<string, string | number>[];
    rail: Rail;
}

const GAP_COLS = ['ID', 'Missing data', 'Needed for', 'Holder', 'Priority', 'Tier A', 'Weighted', 'How to close', 'Cost', 'Days'];

/** Page 40 Custom Request Review: analyst triage of the submitted request. */
export default function CustomReview({ engagement: e, country, sectorName, coverage, gaps, rail }: Props) {
    const r = e.request ?? {};
    const quoted = !!e.quote;
    const booked = !!e.booking;
    const coverageText = coverage
        ? (coverage.facts + coverage.templates + coverage.leads > 0
            ? `${N(coverage.facts)} facts, ${N(coverage.templates)} templates and ${N(coverage.leads)} ranked leads exist for ${sectorName ?? 'this sector'}`
            : `No facts, templates or leads yet for ${sectorName ?? 'this sector'}`)
        : null;
    return (
        <Flow title="Custom Request Review" eyebrow="Page 40 · Analyst triage" steps={{ list: ADV, on: 0 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Custom Intelligence Request', href: '/aiim/custom-intelligence' }]} side={<SvcRail rail={rail} context="Custom request review" />}>
            <Panel title="Triage">
                <Dl rows={[
                    ['Request', <><span className="font-mono">{e.reference}</span> · {e.statusLabel}</>],
                    ['Your question', r.detail ?? e.title],
                    ['Sector and unit', [sectorName, r.unit || 'All units', country?.name].filter(Boolean).join(' · ')],
                    ['Ticket size', r.ticket],
                    ['Needed by', r.required_by],
                    [country?.isBw ? 'Coverage in BW-1.0' : 'Coverage in the country pack', coverageText ?? 'Country pack loading'],
                    ['Open gaps that may apply', country?.isBw ? 'DG-01 tax rate, DG-03 citizen-reserved list' : null],
                    ['Recommended route', 'Discovery call → formal quote'],
                    ['Indicative services', 'Commissioned sector deep dive, data-gap resolution'],
                ]} />
                <div className="mt-4 flex flex-wrap gap-2">
                    {booked ? <Btn href={eng(e.reference, '/discovery/confirmed')}>View discovery booking</Btn> : <Btn href={eng(e.reference, '/discovery')}>Book discovery call</Btn>}
                    {quoted ? <Btn href={eng(e.reference, '/quote')} v="ghost">Skip to quotation</Btn> : <span className="self-center text-[0.8rem] text-ink-500">The formal quotation opens here once your analyst issues it.</span>}
                </div>
            </Panel>
            {country?.isBw ? (
                <Panel title="Open data gaps">
                    <Table head={GAP_COLS} rows={gaps.map((g) => GAP_COLS.map((c) => (c === 'ID' ? <b className="font-mono text-controlled-700">{g[c]}</b> : String(g[c] ?? ''))))} />
                </Panel>
            ) : <PackLoading country={country} what="The open data gaps list" />}
        </Flow>
    );
}
