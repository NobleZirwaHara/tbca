import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Banner, Btn, Chk, Dl, Fld, Flow, FormPanel, PackLoading, Panel, Pill, SumBox, SvcRail, TierPill, Timeline, VER, eng, inputCls, leadHref, townHref, type Country, type Rail, type Svc, type TiState } from '@/Components/Aiim/ProtoEngagement';
import { N } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Hotspot {
    i: number; name: string; place: string; placeId: string; unit: string; fact: string; status: string; match: string; gateway: string | null; gatewayKm: number | string | null;
    leads: { id: string; opportunity: string; template: string; due: string; tier: string; score: number; next: string; institution: string }[];
}

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    view: 'scope' | 'costs' | 'progress' | 'report';
    hotspots: { i: number; name: string; place: string }[];
    hotspot: Hotspot | null;
    scope: { hotspot: number | null; place: string | null; checks: string[] } | null;
    caps: number[] | null;
    approvedAt: string | null;
    approvedExternal: number;
    estimate: { base: Svc | null; counterparty: Svc | null; sanctions: Svc | null; esg: Svc | null };
    items: { code: string; name: string; status: string; selected: boolean; supplier: string; eta: string | null }[];
    rail: Rail;
}

const CHECKS: [string, string, boolean][] = [
    ['gps', 'P1 GPS point and photographs', true], ['tenure', 'Land tenure (Land Boards / Department of Lands)', true], ['citizen', 'Citizen-rule check (reserved activities, Economic Inclusion Act)', true],
    ['counterparty', 'Counterparty verification (AAB-EMB-158)', false], ['sanctions', 'Sanctions and PEP screening (AAB-EMB-157)', false], ['esg', 'ESG and community screen (AAB-EMB-159)', false],
];
const COSTS = ['Road travel', 'Accommodation', 'Land Board search fees', 'Translator (Setswana)'];

/** Pages 50 Verification Scope, 51 External Cost Approval, 52 Verification Progress and 53 Verification Report. */
export default function Verification(p: Props) {
    if (p.view === 'scope') return <Scope {...p} />;
    if (p.view === 'costs') return <Costs {...p} />;
    if (p.view === 'report') return <Report {...p} />;
    return <Progress {...p} />;
}

const crumbs = (e: Engagement) => [{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }];

function Scope({ engagement: e, country, hotspots, hotspot, scope, estimate }: Props) {
    const form = useForm({
        action: 'verify-scope', hotspot: (hotspot?.i ?? null) as number | null, place: scope?.place ?? '',
        checks: scope?.checks ?? CHECKS.filter((c) => c[2]).map((c) => c[0]),
    });
    const has = (k: string) => form.data.checks.includes(k);
    const toggle = (k: string, v: boolean) => form.setData('checks', v ? [...form.data.checks, k] : form.data.checks.filter((x) => x !== k));
    const lines: [string, number | null][] = [['Field verification and site visit', estimate.base?.price ?? null]];
    if (has('counterparty')) lines.push(['Counterparty verification', estimate.counterparty?.price ?? null]);
    if (has('sanctions')) lines.push(['Sanctions & PEP', estimate.sanctions?.price ?? null]);
    if (has('esg')) lines.push(['ESG screen', estimate.esg?.price ?? null]);
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    return (
        <Flow title="Verification Scope" eyebrow="Page 50 · Field verification and site visit" steps={{ list: VER, on: 0 }} crumbs={[...crumbs(e), { label: 'Projects', href: '/aiim/projects' }]}
            side={<Panel title="Estimate"><SumBox lines={lines} /></Panel>}>
            <FormPanel title="What should we verify?" submit="Estimate costs" onSubmit={submit} processing={form.processing} back={eng(e.reference)}>
                {country?.isBw && hotspots.length ? (
                    <Fld label="Hotspot or place">
                        <select className={inputCls} value={form.data.hotspot ?? 0} onChange={(ev) => form.setData('hotspot', Number(ev.target.value))}>
                            {hotspots.map((h) => <option key={h.i} value={h.i}>{h.name} — {h.place}</option>)}
                        </select>
                    </Fld>
                ) : (
                    <>
                        <Fld label="Site or place" error={(form.errors as Record<string, string>).place}><input className={inputCls} value={form.data.place} onChange={(ev) => form.setData('place', ev.target.value)} placeholder="Name the site, town or project to verify" /></Fld>
                        <PackLoading country={country} what="The list of evidence hotspots" />
                    </>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                    {CHECKS.map(([k, l]) => <Chk key={k} checked={has(k)} onChange={(v) => toggle(k, v)}>{l}</Chk>)}
                </div>
            </FormPanel>
        </Flow>
    );
}

function Costs({ engagement: e, hotspot, scope, caps, approvedAt, approvedExternal }: Props) {
    const form = useForm({ action: 'ext-cost', caps: caps ?? COSTS.map(() => 0), approve: false });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    const site = hotspot?.name ?? scope?.place ?? 'site';
    const err = form.errors as Record<string, string>;
    return (
        <Flow title="External Cost Approval" eyebrow="Page 51 · Pass-through costs need your approval" steps={{ list: VER, on: 1 }} crumbs={crumbs(e)}
            side={<Banner>Pass-through costs are charged at receipted actual cost, never above the caps you approve. {approvedAt ? `Caps approved on ${approvedAt} (total R ${N(approvedExternal, 2)}).` : ''}</Banner>}>
            <FormPanel title={`External costs for ${site}`} submit="Approve and start" onSubmit={submit} processing={form.processing} back={eng(e.reference, '/verification/scope')}>
                <Dl rows={[
                    ['Site', hotspot?.place ?? scope?.place ?? ''],
                    ['Nearest gateway', hotspot?.gateway ? `${hotspot.gateway} · ${N(hotspot.gatewayKm)} km straight line` : '—'],
                    ['Cost basis', 'Actual cost, receipted (AAB-EMB-237 proof-of-cost pack)'],
                ]} />
                <div className="max-w-full overflow-x-auto rounded-[10px] border border-parchment-400">
                    <table className="w-full text-[0.82rem]">
                        <thead className="bg-parchment-200 text-left text-[0.7rem] tracking-wide text-ink-600 uppercase"><tr><th className="px-3 py-2">Item</th><th className="px-3 py-2">Basis</th><th className="px-3 py-2">Cap (enter)</th></tr></thead>
                        <tbody>
                            {COSTS.map((c, i) => (
                                <tr key={c} className="border-t border-parchment-300">
                                    <td className="px-3 py-2">{c}</td><td className="px-3 py-2">Receipted actual</td>
                                    <td className="px-3 py-2"><input type="number" min={0} step={100} aria-label={`${c} cap`} className={`${inputCls} w-32`} value={form.data.caps[i] ?? 0}
                                        onChange={(ev) => form.setData('caps', form.data.caps.map((x, j) => (j === i ? Number(ev.target.value) : x)))} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Chk checked={form.data.approve} onChange={(v) => form.setData('approve', v)} error={err.approve}>I approve pass-through costs up to the caps entered.</Chk>
            </FormPanel>
        </Flow>
    );
}

function Progress({ engagement: e, hotspot, scope, approvedAt, items }: Props) {
    const tl: [string, TiState][] = items.length
        ? items.filter((i) => i.selected).map((i) => [`${i.name}${i.eta ? ` · due ${i.eta}` : ''}`, i.status === 'completed' ? 'done' : i.status === 'in_progress' ? 'on' : ''])
        : [
            ['Desk review against BW-1.0 evidence', scope ? 'done' : 'on'],
            ['Scout assigned', approvedAt ? 'done' : scope ? 'on' : ''],
            ['P1 GPS point and photos', approvedAt ? 'on' : ''],
            ['Land tenure check', ''], ['Citizen-rule check', ''], ['Verified badge decision', ''],
        ];
    return (
        <Flow title="Verification Progress" eyebrow={`Page 52${hotspot ? ` · ${hotspot.name}` : ''}`} steps={{ list: VER, on: 2 }} crumbs={crumbs(e)}
            side={<><Btn href={eng(e.reference, '/verification/report')}>View report (sample)</Btn><Btn href={eng(e.reference, '/verification/scope')} v="ghost">Change scope</Btn></>}>
            <Panel title="Checks"><Timeline items={tl} /></Panel>
            {hotspot && (
                <Panel title="Evidence on file">
                    <Dl rows={[['Status', <Pill s={hotspot.status} />], ['Fact', hotspot.fact], ['Leads', String(hotspot.leads.length)]]} />
                </Panel>
            )}
        </Flow>
    );
}

function Report({ engagement: e, country, hotspot, rail }: Props) {
    const slug = country?.slug ?? 'botswana';
    return (
        <Flow title="Verification Report" eyebrow="Page 53" steps={{ list: VER, on: 3 }} crumbs={crumbs(e)} side={<SvcRail rail={rail} context="Verification report" />}>
            <Panel title={`Findings${hotspot ? ` — ${hotspot.name}` : ''}`}>
                {hotspot ? (
                    <Dl rows={[
                        ['Location', <Link href={townHref(slug, hotspot.placeId)} className="text-controlled-700 hover:underline">{hotspot.place}</Link>],
                        ['Status in pack', <Pill s={hotspot.status} />],
                        ['Evidence', hotspot.fact],
                        ['Listing rule', 'Scout confirmation, P1 point, land-tenure and citizen-rule checks, then a Verified badge'],
                    ]} />
                ) : <PackLoading country={country} what="The site evidence" />}
                <div className="mt-3"><Banner>Sample layout. Field results appear here once the scout files them.</Banner></div>
            </Panel>
            {hotspot && (
                <Panel title={`Leads at this site (${hotspot.leads.length})`}>
                    <div className="grid gap-2">
                        {hotspot.leads.map((l) => (
                            <Link key={l.id} href={leadHref(slug, l.id)} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-[10px] border border-parchment-400 p-3 hover:border-gold-500">
                                <div className="min-w-0"><b className="text-[0.85rem]">{l.opportunity}</b><div className="flex flex-wrap gap-x-2.5 text-[0.72rem] text-ink-500"><span className="font-mono">{l.id}</span><span>{l.template}</span><span>due {l.due}</span></div></div>
                                <div className="text-right"><TierPill t={l.tier} /><div className="font-mono text-[0.72rem]">score {l.score}</div></div>
                            </Link>
                        ))}
                    </div>
                    {hotspot.leads[0] && <div className="mt-3"><Banner>Next action: {hotspot.leads[0].next}</Banner></div>}
                </Panel>
            )}
        </Flow>
    );
}
