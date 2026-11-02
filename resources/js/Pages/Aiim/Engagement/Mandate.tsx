import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ADV, BriefCta, Dl, Fld, Flow, PackLoading, Panel, Pill, QuickLinks, SvcRail, TierPill, Timeline, btn, eng, inputCls, leadHref, mandateLinks, oppHref, townHref, type Country, type Rail, type Svc } from '@/Components/Aiim/ProtoEngagement';
import { DataTable, GradeChip } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Report {
    sector: string;
    sectorName: string;
    facts: { id: string; fact: string; value: string; date: string; grade: string }[];
    templates: { id: string; opportunity: string; band: string; score: number; ra: number; tier: string; downturn: string; citizen: string; fx: string; persona: string; ttr: string; evidence: string }[];
    leads: { id: string; template: string; opportunity: string; place: string; placeId: string; unit: string; score: number; tier: string; persona: string }[];
    permits: { permits: string; issuer: string; time: string | null } | null;
}

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    report: Report | null;
    brief: Svc | null;
    rail: Rail;
}

const yn = (v: unknown, yes: string) => (String(v).toLowerCase().startsWith('y') ? <Pill s={yes} tone="gold" /> : <Pill s="No" tone="grey" />);

/** Page 49 Custom Intelligence Report: the mandate's deliverable, built from the country pack, with the workplan and advisor messages. */
export default function Mandate({ engagement: e, country, report: r, brief, rail }: Props) {
    const req = e.request ?? {};
    const form = useForm({ message: '' });
    const send = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message'), { preserveScroll: true, onSuccess: () => form.reset() }); };
    const question = req.detail ?? req.summary ?? e.title;
    const slug = country?.slug ?? 'botswana';
    const delivered = (e.deliverables ?? []).filter((d) => d.status === 'completed').length;
    return (
        <Flow title="Custom Intelligence Report" eyebrow={`Page 49 · ${country?.isBw ? 'Deliverable built from BW-1.0' : 'Mandate deliverable'} · ${e.mandate ?? e.reference}`} steps={{ list: ADV, on: 6 }}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Mandates', href: '/aiim/workspace/engagements' }]}
            lead={`Question: ${question}`}
            right={<Link href={`/aiim/custom-intelligence?country=${slug}`} className={btn('gold', 'sm')}>Commission one</Link>}
            side={<>
                {brief && <BriefCta title={r ? `${r.sectorName} brief` : 'Sector brief'} sub="Premium brief from the country pack" s={brief} context={e.title} />}
                <SvcRail rail={rail} context={e.title} />
                <QuickLinks links={mandateLinks(e.reference)} />
            </>}>
            <Panel title="1. Answer" right={<Pill s={e.statusLabel} />}>
                <Dl rows={[
                    ['Mandate', <><span className="font-mono">{e.mandate ?? e.reference}</span> · {e.title}</>],
                    ['Advisor', e.advisor ? `${e.advisor.name}, ${e.advisor.title}` : 'To be assigned'],
                    ['Progress', `${e.progress} % · ${e.stage ?? e.statusLabel}`],
                    ['Dates', [e.start && `Started ${e.start}`, e.end && `due ${e.end}`].filter(Boolean).join(', ')],
                    ['Deliverables', `${delivered} of ${(e.deliverables ?? []).length} completed`],
                ]} />
                <p className="mt-3 text-[0.85rem] text-ink-600">The analyst-reviewed answer is filed here as the final report when the mandate is delivered. The evidence below is what the {country?.isBw ? 'BW-1.0 pack' : 'country pack'} holds for this question today.</p>
                {(e.deliverables ?? []).length > 0 && (
                    <ul className="mt-3 grid gap-1.5">
                        {(e.deliverables ?? []).map((d) => <li key={d.name} className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-parchment-400 px-3 py-2 text-[0.85rem]"><span>{d.name} <span className="text-ink-500">· {d.format}{d.size ? ` · ${d.size}` : ''}</span></span><Pill s={d.status.replace(/_/g, ' ')} /></li>)}
                    </ul>
                )}
            </Panel>

            {r ? (
                <>
                    <Panel title="2. Evidence">
                        <DataTable name={`evidence-${r.sector}`} size={10} rows={r.facts} cols={[
                            { k: 'id', l: 'Fact ID' }, { k: 'fact', l: 'Fact', clip: true }, { k: 'value', l: 'Value', clip: true }, { k: 'date', l: 'Date' },
                            { k: 'grade', l: 'Grade', r: (f) => <GradeChip g={f.grade} /> },
                        ]} />
                    </Panel>
                    <Panel title="3. Templates">
                        <DataTable name={`templates-${r.sector}`} size={8} rows={r.templates} cols={[
                            { k: 'id', l: 'Opp ID', r: (o) => <Link href={oppHref(o.id)} className="font-mono text-controlled-700 hover:underline">{o.id}</Link> },
                            { k: 'opportunity', l: 'Opportunity', clip: true }, { k: 'band', l: 'Band' }, { k: 'score', l: 'Score', num: true }, { k: 'ra', l: 'RA', num: true },
                            { k: 'tier', l: 'Tier', r: (o) => <TierPill t={o.tier} /> }, { k: 'downturn', l: 'Downturn', r: (o) => <TierPill t={o.downturn} /> },
                            { k: 'citizen', l: 'Citizen', r: (o) => yn(o.citizen, 'Reserved') }, { k: 'fx', l: 'FX', r: (o) => yn(o.fx, 'FX') },
                            { k: 'persona', l: 'Persona' }, { k: 'ttr', l: 'Time to revenue' }, { k: 'evidence', l: 'Evidence', clip: true },
                        ]} />
                    </Panel>
                    <Panel title={`4. Where — ranked leads${req.unit ? ` in ${req.unit}` : ''}`}>
                        <DataTable name={`leads-${r.sector}`} size={8} rows={r.leads} cols={[
                            { k: 'template', l: 'Template', r: (l) => <Link href={leadHref(slug, l.id)} className="font-mono text-controlled-700 hover:underline">{l.template}</Link> },
                            { k: 'opportunity', l: 'Opportunity', clip: true },
                            { k: 'place', l: 'Place', r: (l) => <Link href={townHref(slug, l.placeId)} className="hover:text-gold-700">{l.place}</Link> },
                            { k: 'score', l: 'Lead score', num: true }, { k: 'tier', l: 'Tier', r: (l) => <TierPill t={l.tier} /> }, { k: 'persona', l: 'Persona' },
                        ]} />
                    </Panel>
                    <Panel title="5. Rules and permits">
                        <Dl rows={[
                            ['Permits', r.permits?.permits ?? '—'],
                            ['Issuer', r.permits?.issuer ?? '—'],
                            ['Typical time', r.permits?.time],
                            ['Citizen rules', 'Economic Inclusion Act 2021; citizen-reserved activities and procurement preferences apply'],
                        ]} />
                    </Panel>
                </>
            ) : country?.isBw ? (
                <Panel title="2. Evidence"><p className="text-[0.85rem] text-ink-600">This mandate has no Botswana sector on file, so the pack evidence is attached by your analyst during delivery.</p></Panel>
            ) : <PackLoading country={country} what="The evidence, templates, ranked leads and permit sections" />}

            {(e.workplan ?? []).length > 0 && (
                <Panel title="Workplan">
                    <Timeline items={(e.workplan ?? []).map((w) => [<span key={w.key}>{w.label} <span className="text-ink-500">· {w.date}</span></span>, w.status === 'completed' ? 'done' : w.status === 'in_progress' ? 'on' : ''])} />
                </Panel>
            )}

            <Panel title="Message your advisor">
                <form onSubmit={send} className="grid gap-2">
                    <Fld label="Message" error={form.errors.message}><textarea rows={3} className={inputCls} value={form.data.message} onChange={(ev) => form.setData('message', ev.target.value)} /></Fld>
                    <div><button type="submit" className={btn('gold', 'sm')} disabled={form.processing || !form.data.message.trim()}>Send</button></div>
                </form>
                {(e.events ?? []).length > 0 && (
                    <ul className="mt-4 grid gap-1.5 text-[0.8rem]">
                        {(e.events ?? []).map((ev, i) => <li key={i} className="border-b border-parchment-300 pb-1.5 last:border-0"><b>{ev.action}</b> <span className="text-ink-500">· {ev.actor} · {ev.at}</span>{ev.note && <span className="block text-ink-600">{ev.note}</span>}</li>)}
                    </ul>
                )}
            </Panel>
        </Flow>
    );
}
