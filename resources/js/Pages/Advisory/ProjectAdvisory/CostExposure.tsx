import { Head, useForm } from '@inertiajs/react';
import { ChevronRight, Send, TriangleAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Form';
import { Card, CheckList, KV, LedgerBadge, Notice, PageTitle, Tracker, zar } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

type Range = [number, number, number];
interface Line { item: string; recipient: string; basis: string; certainty: string; range: Range | null }
interface Props {
    ctx: { project_name: string; country: string; stage: string; route: string };
    sectorLabel: string;
    bandLabel: string;
    reuse: Record<string, string>;
    estimate: { lines: Record<'T' | 'P' | 'X' | 'S' | 'C', Line[]>; subtotals: Record<'T' | 'P' | 'X', Range>; reuse_factor: number };
    method: [string, string, string][];
    throughClose: number;
    savedAt: string | null;
}

const REUSE: Record<string, [string, string]> = {
    reusable: ['Reusable', 'bg-verified-50 text-verified-700'],
    partial: ['Partial', 'bg-attested-50 text-attested-700'],
    missing: ['Missing', 'bg-risk-50 text-risk-700'],
    human_review: ['Human Review Required', 'bg-controlled-50 text-controlled-700'],
    quote_pending: ['Quote Pending', 'bg-gold-100 text-gold-800'],
};

function LedgerTable({ l, title, sub, lines, subtotal }: { l: string; title: string; sub: string; lines: Line[]; subtotal?: Range }) {
    return (
        <Card title={<span className="flex items-center gap-2"><LedgerBadge l={l} size="sm" />{title}</span>}>
            <p className="-mt-2 mb-2 text-[0.6875rem] text-ink-500">{sub}</p>
            <div className="overflow-x-auto">
                <table className="w-full text-[0.6875rem]">
                    <thead className="text-ink-500"><tr><th className="py-1 text-left">Line item</th><th className="text-left">Basis</th><th className="text-right">Low | Expected | High</th></tr></thead>
                    <tbody className="divide-y divide-parchment-300">
                        {lines.map((x) => (
                            <tr key={x.item}><td className="py-1.5 pr-2">{x.item}<span className="block text-ink-400">{x.recipient} · {x.certainty}</span></td><td className="pr-2">{x.basis}</td><td className="text-right whitespace-nowrap">{x.range ? (x.range[0] === x.range[2] ? `${zar(x.range[1])} (Fixed)` : `${zar(x.range[0])} | ${zar(x.range[1])} | ${zar(x.range[2])}`) : 'Quote / official schedule required'}</td></tr>
                        ))}
                    </tbody>
                    {subtotal && <tfoot><tr className="border-t-2 border-parchment-400 font-semibold"><td className="py-1.5" colSpan={2}>Ledger {l} subtotal (this ledger only)</td><td className="text-right">{zar(subtotal[0])} | {zar(subtotal[1])} | {zar(subtotal[2])}</td></tr></tfoot>}
                </table>
            </div>
        </Card>
    );
}

export default function CostExposure({ ctx, sectorLabel, bandLabel, reuse, estimate, method, throughClose, savedAt }: Props) {
    const form = useForm({ reuse, action: 'save', email: '' });
    const post = (action: 'save' | 'link') => {
        form.transform((d) => ({ ...d, action }));
        form.post('/project-advisory/cost-exposure', { preserveScroll: true });
    };
    const { lines, subtotals } = estimate;
    return (
        <div className="container-tbca py-8">
            <Head title="Path-to-Close Cost Exposure Estimate" />
            <PageTitle
                crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Cost Exposure Estimate' }]}
                title="Path-to-Close Cost Exposure Estimate"
                sub="See the likely advisory and transaction-support cost path before you commit. Each ledger is disclosed separately. This is not a project capital budget."
                actions={<><Button onClick={() => post('save')} disabled={form.processing} trailingIcon="arrow-right">Save and Continue</Button><Button variant="outline" icon="download" onClick={() => window.print()}>Export Estimate (PDF)</Button></>}
            />
            <Notice tone="warn" className="mb-4"><TriangleAlert className="size-4 shrink-0" /><span><b>This estimate is not a complete project capital budget.</b> Method, professional fees, platform fees, external provider costs, statutory charges and any authorised contingent economics are disclosed separately before commitment. There is no cross-ledger total.</span></Notice>
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-9">
                    <div className="grid gap-4 md:grid-cols-12">
                        <Card num={1} title="Project Context" className="md:col-span-4">
                            <KV rows={[['Project', ctx.project_name], ['Country', ctx.country], ['Sector', sectorLabel], ['Stage', `${ctx.stage} Path`], ['Capital band', bandLabel], ['Engagement route', ctx.route.replace('-', ' ')]]} />
                        </Card>
                        <Card num={2} title="Method Path" className="md:col-span-8">
                            <Tracker items={method.map(([t], i) => ({ label: t, state: i + 1 < throughClose ? 'done' : i + 1 === throughClose ? 'current' : 'todo' }))} />
                            <div className="mt-2 flex justify-between text-[0.6875rem] text-ink-500"><span>1–5 Through Close</span><span>6–8 Post Close (Not Yet Activated)</span></div>
                        </Card>
                    </div>
                    <Card num={3} title="Existing Evidence and Reusable Work">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Reused evidence may reduce downstream scope and cost (current reduction on T time-based lines: {Math.round((1 - estimate.reuse_factor) * 100)}%).</p>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
                            {Object.keys(form.data.reuse).map((k) => (
                                <label key={k} className="rounded border border-parchment-400 p-2 text-[0.6875rem]">
                                    <span className="block font-semibold">{k}</span>
                                    <select value={form.data.reuse[k]} onChange={(e) => form.setData('reuse', { ...form.data.reuse, [k]: e.target.value })} className={cn('mt-1 w-full rounded px-1 py-0.5 font-semibold', REUSE[form.data.reuse[k]]?.[1])}>
                                        {Object.entries(REUSE).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </label>
                            ))}
                        </div>
                        <Button size="sm" variant="outline" className="mt-3" onClick={() => post('save')}>Recalculate with evidence</Button>
                    </Card>
                    <div className="grid gap-4 xl:grid-cols-3">
                        <LedgerTable l="T" title="TBCA Professional Fees" sub="Professional work bought from TBCA. Separate from platform, external and statutory costs." lines={lines.T} subtotal={subtotals.T} />
                        <LedgerTable l="P" title="Platform Fees" sub="Platform access and secure collaboration services." lines={lines.P} subtotal={subtotals.P} />
                        <LedgerTable l="X" title="External Provider Costs" sub="Third-party studies and specialist services. Client pays providers directly." lines={lines.X} subtotal={subtotals.X} />
                        <LedgerTable l="S" title="Statutory Charges" sub="Official authority charges and filings. Not part of TBCA fees." lines={lines.S} />
                        <Card title={<span className="flex items-center gap-2"><LedgerBadge l="C" size="sm" />Potential Contingent Economics</span>} className="xl:col-span-2">
                            <Notice tone="bad" className="mb-2">Potential exposure only. Not currently payable.</Notice>
                            <KV rows={[['Contingent model status', 'Not activated for this engagement'], ['Trigger', 'Valid authorised close event'], ['Exposure basis', 'Class-specific approval required'], ['Potential range (illustrative)', 'Not yet configured']]} />
                            <p className="mt-2 text-[0.6875rem] text-risk-700">Contingent economics remain unpayable unless validly triggered.</p>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card num={9} title="Explicit Exclusions"><CheckList tone="bad" items={['Project EPC cost and construction budget', 'Equipment procurement and installation', 'Land acquisition and associated costs', 'Debt interest and finance charges', 'Taxes not yet qualified or legislated', 'Success-based economics not activated', 'Any external work not separately approved', 'Costs outside the defined engagement scope']} /></Card>
                        <Card num={10} title="Cost and Variance Drivers"><CheckList tone="gold" items={['Project complexity and technical novelty', 'Data quality and completeness', 'Regulatory pathway and approval depth', 'Location-specific studies and logistics', 'Timing pressure and sequencing', 'Multi-party approvals and coordination', 'Language and translation requirements', 'Provider quote freshness and availability']} /></Card>
                        <Card num={11} title="If I Stop Here"><CheckList items={['You keep approved work product already delivered', 'Unapproved future phases do not become due', 'Some external commitments may remain payable once triggered', 'Contingent economics remain unpayable unless validly triggered']} /><ButtonLink href="/project-advisory/stop-now-ladder" size="sm" variant="outline" className="mt-3">Review Stop Position</ButtonLink></Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card num={12} title="Evidence, Quote and Freshness Status">
                            <KV rows={[['TBCA pricing basis', 'Current (validated)'], ['External quote coverage', 'Partial — some quotes still pending'], ['Statutory schedule status', 'Mixed — official schedules not confirmed'], ['Last refresh date', savedAt ?? 'Not saved yet'], ['Currency source', 'ZAR'], ['USD display status', 'Not displayed (currency snapshot)']]} />
                        </Card>
                        <Card num={13} title="Save and Continue">
                            <p className="text-xs text-ink-600">Save this estimate, then continue building your advisory path.</p>
                            <Button className="mt-3 w-full" onClick={() => post('save')} disabled={form.processing}>Save and Continue</Button>
                            <div className="mt-3 flex gap-2">
                                <label className="sr-only" htmlFor="ce-email">Email for secure link</label>
                                <Input id="ce-email" type="email" placeholder="you@company.co.za" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} invalid={!!form.errors.email} />
                                <Button variant="outline" onClick={() => post('link')}><Send className="size-4" />Send Me Secure Link</Button>
                            </div>
                            {form.errors.email && <p className="mt-1 text-xs text-risk-500">{form.errors.email}</p>}
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 lg:col-span-3">
                    <Card title="Estimate Summary"><KV rows={[['Project', ctx.project_name], ['Country', ctx.country], ['Sector', sectorLabel], ['Stage', ctx.stage], ['Capital band', bandLabel]]} /></Card>
                    <Card title="Active Ledgers in this Estimate">
                        <ul className="space-y-1.5 text-xs">{(['T', 'P', 'X'] as const).map((l) => <li key={l} className="flex items-center justify-between gap-2"><LedgerBadge l={l} size="sm" /><span>Expected {zar(subtotals[l][1])}</span></li>)}<li className="flex items-center justify-between"><LedgerBadge l="S" size="sm" /><span>Official schedule</span></li><li className="flex items-center justify-between"><LedgerBadge l="C" size="sm" /><span>Not payable</span></li></ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Each ledger is disclosed on its own. No combined grand total exists.</p>
                    </Card>
                    <Card title="What to resolve next">
                        <ul className="space-y-1.5 text-xs">{['Confirm site rights and access', 'Request external provider quotes', 'Validate permissions pathway', 'Upload sponsor financial inputs', 'Select preferred engagement route'].map((x) => <li key={x} className="flex justify-between">{x}<ChevronRight className="size-3.5" /></li>)}</ul>
                    </Card>
                    <Card title="Need help interpreting this?" tone="gold"><p className="text-xs text-ink-600">Speak to a TBCA advisor for clarity on cost exposure, ledgers and next steps.</p><ButtonLink href="/project-advisory/engagement-options" size="sm" className="mt-2">Choose Engagement Route</ButtonLink></Card>
                </aside>
            </div>
        </div>
    );
}
