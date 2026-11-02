/* P39 Corridor Pair Evidence (prototype pages-corridors.js #/corridors/evidence/A/B). */
import { Card, Kpi, Kpis, STable, StatusChip, TagP, TagS, Ticks } from '@/Components/Industries/Kit';
import { CorridorHead, CorrPage, pairCrumb, type Pair } from '@/Components/CountryHub/Corridors';

/** [category, description, source type, source / reference, last verified, placeholder] */
type Item = [string, string, string, string, string, boolean];
interface Props { cr: Pair; bw: boolean; items: Item[] }

export default function Evidence({ cr, bw, items }: Props) {
    return (
        <CorrPage crumbs={[pairCrumb(cr), ['Pair Evidence']]}>
            <CorridorHead cr={cr} view="evidence" title="Corridor Pair Evidence" sub={`Evidence package for ${cr.A.name} → ${cr.B.name}.`} />
            <Kpis>
                <Kpi l="Total evidence items" v={cr.items} icon="db" />
                <Kpi l="Package reference" v={`EVD-${cr.id}`} icon="file" />
                <Kpi l="Prepared by" v="TBCA Resolver Team" icon="users" />
                <Kpi l="Evidence confidence" v={`${cr.conf} %`} icon="shield" />
            </Kpis>
            <Card title="Evidence Items" icon="file" sub={bw ? <TagS s="BW-1.0 facts" /> : undefined}>
                {items.length ? (
                    <STable head={['#', 'Category', 'Description', 'Source type', 'Source / reference', 'Status', 'Last verified']}
                        rows={items.map((r, i) => [i + 1, <b key="c">{r[0]}</b>, r[5] ? <>{r[1]} <TagP /></> : r[1], r[2], r[3], <StatusChip key="s" s={bw ? 'Verified' : 'Pending'} />, r[4]])} />
                ) : (
                    <p className="text-[0.85rem] text-ink-400">No evidence items held for this pair. The corridor cannot progress until sovereign-source and cross-border evidence is attached.</p>
                )}
            </Card>
            <Card title="Evidence Quality Assurance">
                <Ticks items={['Source-attributable — linked to authoritative sources', 'Current & valid as at the review date', 'Resolver-verified independently', 'Audit-ready — full trail on request']} />
            </Card>
        </CorrPage>
    );
}
