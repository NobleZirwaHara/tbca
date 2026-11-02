import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { btnGhost, btnGold, Flow, SvcRail, SvcRow, TierPill, type Svc } from '@/Components/Aiim/ProtoAccount';
import { B, Card, inputCls } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Selected { type: string; key: string; name: string; tier: string | null; url: string }
interface Candidate { id: string; name: string; sector: string; sectorName: string; tier: string; band: string }

interface Props extends AiimPageProps {
    draft: { reference: string; items: Selected[] };
    max: number;
    q: string;
    candidates: Candidate[];
    services: Svc[];
}

/** Mock-up 23: Comparison Builder. */
export default function CompareBuilder({ draft, max, q, candidates, services }: Props) {
    const [search, setSearch] = useState(q);
    const first = useRef(true);
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = window.setTimeout(() => router.get('/aiim/workspace/compare', search ? { q: search } : {}, { preserveScroll: true, preserveState: true, replace: true, only: ['candidates', 'q'] }), 250);
        return () => window.clearTimeout(t);
    }, [search]);
    const chosen = new Set(draft.items.filter((i) => i.type === 'template').map((i) => i.key));
    const add = (id: string) => router.post('/aiim/workspace/compare/items', { type: 'template', key: id }, { preserveScroll: true });
    const remove = (i: Selected) => router.delete('/aiim/workspace/compare/items', { data: { type: i.type, key: i.key }, preserveScroll: true });

    return (
        <Flow
            title="Comparison Builder"
            eyebrow="Compare up to five templates"
            lead="Pick opportunities to compare side by side on score, risk, downturn tier, band, persona, citizen rules and time to revenue."
            crumbs={[{ label: 'Opportunities', href: '/aiim/opportunities' }]}
            side={<SvcRail services={services} title="Comparison services" />}
        >
            <Card
                title={`Selected (${draft.items.length}/${max})`}
                act={<B v="pri" sm disabled={draft.items.length < 2} onClick={() => router.post('/aiim/workspace/compare/generate')}>Compare now</B>}
            >
                {draft.items.length ? (
                    <ul className="grid gap-2">
                        {draft.items.map((i) => (
                            <SvcRow key={i.type + i.key} title={<Link href={i.url} className="hover:text-gold-700">{i.name}</Link>} meta={<><span className="font-mono">{i.key}</span>{i.tier !== null && <TierPill tier={i.tier} />}</>} right={<button type="button" className={btnGhost} onClick={() => remove(i)}>Remove</button>} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-[0.85rem] text-ink-500">None yet. Add from the list below.</p>
                )}
                {draft.items.length === 1 && <p className="mt-2 text-[0.75rem] text-ink-500">Add at least one more template to compare.</p>}
            </Card>
            <Card title="Add templates">
                <label className="sr-only" htmlFor="cmp-q">Search 321 templates</label>
                <input id="cmp-q" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search 321 templates" className={inputCls} />
                <ul className="mt-3 grid max-h-[420px] gap-2 overflow-auto pr-1">
                    {candidates.map((o) => (
                        <SvcRow
                            key={o.id}
                            title={o.name}
                            meta={<><span className="font-mono">{o.id}</span><TierPill tier={o.tier} /><span>{o.band}</span></>}
                            right={chosen.has(o.id) ? <span className="text-[0.72rem] font-semibold text-verified-700">Added</span> : <button type="button" className={btnGold} disabled={draft.items.length >= max} onClick={() => add(o.id)}>Add</button>}
                        />
                    ))}
                    {candidates.length === 0 && <li className="text-[0.85rem] text-ink-500">No template matches.</li>}
                </ul>
            </Card>
        </Flow>
    );
}
