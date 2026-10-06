import { Head, router } from '@inertiajs/react';
import { CheckCircle2, CircleAlert, CircleX, Plus, Trash2, UserCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import EmbeddedServices, { type EmbeddedSection } from '@/Components/Embedded/EmbeddedServices';
import { Card, CheckList, KV, PageTitle, Stat, TrustBand, zarRange } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Study { key: string; name: string; why: string; evidence: string; provider: string; quote: string; timing: string; rights: string; reuse: string; transferability: string; abort: string; cost: string; range: [number, number, number] }
interface Props {
    ctx: { project_name: string; country: string; stage: string; route: string };
    sector: string;
    sectorLabel: string;
    studies: Study[];
    path: string[];
    snapshot: { active: number; reusable: number; pending: number; review: number };
    sectors: { key: string; code: string; label: string; icon: string; blurb: string }[];
    plan: { key: string; code: string; label: string; focus: string; subs: string[]; approvals: string[]; risks: string[]; funders: string[]; phases: [string, string, string, string[]][] };
    embedded?: EmbeddedSection;
}

const EV: Record<string, [string, typeof CheckCircle2, string]> = {
    available: ['Evidence Available', CheckCircle2, 'text-verified-700'],
    partial: ['Evidence Partial', CircleAlert, 'text-attested-700'],
    missing: ['Evidence Missing', CircleX, 'text-risk-700'],
    human_review: ['Human Review Required', UserCheck, 'text-controlled-700'],
};

export default function Studies({ ctx, sector, sectorLabel, studies, path, snapshot, sectors, plan, embedded }: Props) {
    const act = (study: string, action: 'add' | 'remove' | 'evidence') => router.post('/project-advisory/studies', { study, action }, { preserveScroll: true });
    return (
        <>
            <Head title="Sector Study Explorer" />
            <div className="container-tbca py-8">
                <PageTitle
                    crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Sector Study Explorer' }]}
                    title="Sector Study Explorer"
                    sub={<><p className="font-semibold text-gold-700">Select the sector-specific studies and evidence pathways that may be required for your project.</p><p>Compare study types, evidence status, provider requirements and transferability before adding a study to your advisory path.</p></>}
                    actions={<ButtonLink href="/project-advisory/cost-exposure" trailingIcon="arrow-right">View Cost Exposure</ButtonLink>}
                />
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-9">
                        <section>
                            <h2 className="text-sm font-semibold">1. Select a Sector <span className="font-normal text-ink-500">— all 17 TBCA sectors</span></h2>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" role="radiogroup" aria-label="Sector">
                                {sectors.map((s) => (
                                    <button key={s.key} type="button" role="radio" aria-checked={sector === s.key} title={s.blurb} onClick={() => router.get('/project-advisory/studies', { sector: s.key }, { preserveScroll: true })} className={cn('flex flex-col items-center gap-1 rounded-[8px] border p-3 text-center text-xs', sector === s.key ? 'border-gold-500 bg-gold-50 font-semibold ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300')}>
                                        <AdvIcon name={s.icon} className="size-7 text-gold-600" /><span className="text-[0.625rem] text-ink-500">{s.code}</span>{s.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-gold-300 bg-white p-4" aria-labelledby="plan-h">
                            <p className="text-[0.6875rem] font-semibold tracking-wider text-gold-700 uppercase">{plan.code} · Sector advisory plan</p>
                            <h2 id="plan-h" className="font-serif text-lg font-semibold">{plan.label}</h2>
                            <p className="text-xs text-ink-600">{plan.focus}</p>
                            <ol className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {plan.phases.map(([stages, title, body, outputs], i) => (
                                    <li key={title} className="rounded-[6px] border border-parchment-400 p-3">
                                        <p className="flex items-center gap-2 text-xs font-semibold"><span className="flex size-6 items-center justify-center rounded-full bg-gold-500 text-[0.6875rem] text-ink-900">{i + 1}</span>{title}</p>
                                        <p className="mt-0.5 text-[0.625rem] text-ink-500">Lifecycle {stages}</p>
                                        <p className="mt-1 text-[0.6875rem] text-ink-600">{body}</p>
                                        <CheckList className="mt-2" items={outputs} />
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-3 grid gap-3 text-xs md:grid-cols-4">
                                <div><p className="font-semibold">Sub-sectors</p><p className="text-ink-600">{plan.subs.join(' · ')}</p></div>
                                <div><p className="font-semibold">Typical approvals</p><ul className="list-disc pl-4 text-ink-600">{plan.approvals.map((a) => <li key={a}>{a}</li>)}</ul></div>
                                <div><p className="font-semibold">Key risks</p><ul className="list-disc pl-4 text-ink-600">{plan.risks.map((a) => <li key={a}>{a}</li>)}</ul></div>
                                <div><p className="font-semibold">Typical funders</p><ul className="list-disc pl-4 text-ink-600">{plan.funders.map((a) => <li key={a}>{a}</li>)}</ul></div>
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-3 text-sm font-semibold">2. Required and Optional Studies for {sectorLabel}</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-left text-[0.6875rem]">
                                    <thead className="bg-parchment-200 text-ink-600"><tr>{['Study Type', 'Why It May Be Required', 'Current Evidence State', 'Named-Provider Requirement', 'Quote Status', 'Expected Timing', 'Rights & Reliance', 'Reuse', 'Transferability', 'Abort Value', 'Indicative (X)', ''].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {studies.map((s) => {
                                            const [l, I, c] = EV[s.evidence] ?? EV.missing;
                                            const inPath = path.includes(s.name);
                                            return (
                                                <tr key={s.key}>
                                                    <td className="px-2 py-2 font-semibold text-ink-900">{s.name}</td>
                                                    <td className="px-2">{s.why}</td>
                                                    <td className={cn('px-2', c)}><span className="inline-flex items-center gap-1"><I className="size-3.5" />{l}</span></td>
                                                    <td className="px-2">{s.provider}</td>
                                                    <td className="px-2">{s.quote}</td>
                                                    <td className="px-2">{s.timing}</td>
                                                    <td className="px-2">{s.rights}</td>
                                                    <td className="px-2">{s.reuse}</td>
                                                    <td className="px-2">{s.transferability}</td>
                                                    <td className="px-2">{s.abort}</td>
                                                    <td className="px-2 whitespace-nowrap">{zarRange([s.range[0], s.range[2]])}</td>
                                                    <td className="px-2">
                                                        <div className="flex flex-col gap-1">
                                                            <button type="button" onClick={() => act(s.name, inPath ? 'remove' : 'add')} className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold', inPath ? 'border-risk-500 text-risk-700' : 'border-gold-500 text-gold-800')}>{inPath ? <><Trash2 className="size-3" />Remove</> : <><Plus className="size-3" />Add</>}</button>
                                                            <button type="button" onClick={() => act(s.name, 'evidence')} className="text-controlled-700 underline">Request evidence</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">External study costs are Ledger X: paid directly to the provider, approved line-by-line at Gate G3. TBCA does not mark up provider costs.</p>
                        </section>
                    </div>
                    <aside className="space-y-4 lg:col-span-3">
                        <Card title="Selected Project Context"><KV rows={[['Project', ctx.project_name], ['Country', ctx.country], ['Sector', sectorLabel], ['Stage', `${ctx.stage} Path`], ['Engagement Route', ctx.route.replace('-', ' ')]]} /></Card>
                        <div className="grid grid-cols-2 gap-2">
                            <Stat label="Active Studies" value={snapshot.active} />
                            <Stat label="Evidence Reusable" value={snapshot.reusable} tone="good" />
                            <Stat label="Quote Pending" value={snapshot.pending} tone="warn" />
                            <Stat label="Human Review Items" value={snapshot.review} />
                        </div>
                        <Card title={`Your advisory path (${path.length})`}>
                            {path.length === 0 ? <p className="text-xs text-ink-500">Add studies to build your path.</p> : <CheckList items={path} />}
                        </Card>
                        <Card title="What to resolve next"><CheckList tone="gold" items={['Confirm scope and objectives for each study', 'Select or approve study providers', 'Upload available data and documents', 'Resolve quote requirements', 'Review reliance and IP terms']} /></Card>
                        <Button className="w-full" onClick={() => router.visit('/project-advisory/discovery')}>Book Advisory Call</Button>
                    </aside>
                </div>
            </div>
            <EmbeddedServices section={embedded} />
            <TrustBand items={[['Published Method', 'Transparent frameworks and assumptions.'], ['You Approve Before We Charge', 'No costs without your confirmed go-ahead.'], ['Human Review Where Required', 'Specialists validate high-impact judgements.'], ['Your Work Product Is Portable', 'You own your reports, data and decision files.'], ['POPIA-Aware Data Controls', 'Role-based and consent controls.'], ['Five ledgers', 'T, P, X, S, C separate']]} />
        </>
    );
}
