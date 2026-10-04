import { Head, Link } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { FeeLedgerTable, LedgerSubtotals } from '@/Components/Advisory/TechFees';
import { Card, CheckList, KV, Notice, zar } from '@/Components/Advisory/ui';
import type { FeeLine, LedgerTotals } from '@/types/advisory';

interface Props { journey: JourneyState; lines: FeeLine[]; totals: LedgerTotals; summary: Record<string, string>; gates: [number, string, string, number, number, number][]; configured: boolean }

export default function Fees({ journey, lines, totals, summary, gates, configured }: Props) {
    const t = totals.t_fixed;
    return (
        <>
            <Head title="Fee Transparency Ledger" />
            <TechJourney step={5} journey={journey} title="Fee Transparency Ledger" sub="Review every fee component, approval trigger and payment rule before you proceed to your engagement letter."
                footer={<><Link href="/technology-solutions/configure" className="text-sm">← Back to Configure</Link><div className="flex gap-2"><ButtonLink href="/technology-solutions/external-costs" variant="outline">External Costs & Funding</ButtonLink><ButtonLink href="/technology-solutions/checkout" trailingIcon="arrow-right">Proceed to Checkout Review</ButtonLink></div></>}>
                {!configured && <Notice tone="warn">Showing the default configuration. <Link href="/technology-solutions/configure" className="underline">Configure your solution</Link> to see your own fees.</Notice>}
                <Notice tone="good"><Info className="size-4" />Transparent pricing. No blended ledgers. External costs, statutory charges and TBCA professional fees are shown separately.</Notice>
                <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs sm:grid-cols-5">
                    {[['Selected Tower', summary.tower], ['Deployment Model', summary.deployment], ['Support Tier', `${summary.support} · ${summary.scale}`], ['Est. Implementation Complexity', summary.complexity], ['Quote Status', summary.status]].map(([k, v]) => <div key={k}><p className="text-ink-500">{k}</p><p className="font-semibold">{v}</p></div>)}
                </div>
                <div className="grid gap-4 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-8">
                        <FeeLedgerTable lines={lines} totals={totals} />
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card title="Approval & Change-Control Rules"><CheckList items={['No external cost is incurred without approval.', 'Scope changes create a Change Order.', 'No implementation begins before letter acceptance.', 'Pricing may refresh if third-party licence costs change.', 'All changes documented and approved by you.']} /></Card>
                            <Card title="Payment Plan & Commercial Terms">
                                <ol className="space-y-1 text-xs">{gates.filter((g) => g[3] > 0).map((g, i) => <li key={g[0]} className="flex justify-between gap-2"><span>{i + 1}. Gate {g[0]} {g[1]}</span><span className="font-semibold">{t ? Math.round((g[3] / t) * 100) : 0}% · {zar(g[3])}</span></li>)}</ol>
                                <KV className="mt-2" rows={[['Quote Validity', '14 Days'], ['Currency Treatment', 'ZAR source / USD where applicable'], ['Invoicing', 'Tax invoice per gate']]} />
                            </Card>
                            <Card title="Included vs Excluded">
                                <p className="text-xs font-semibold text-verified-700">Included in This Stage</p><CheckList items={['Architecture & configuration', 'Standard integrations', 'User training & documentation', 'QA, testing & UAT support', 'Knowledge transfer']} />
                                <p className="mt-2 text-xs font-semibold text-risk-700">Not Included / Out of Scope</p><CheckList tone="bad" items={['Third-party licence fees (Ledger X)', 'Custom legacy system re-write', 'Hardware procurement', 'Physical infrastructure', 'Change orders & new scope']} />
                            </Card>
                        </div>
                    </div>
                    <aside className="space-y-4 xl:col-span-4">
                        <Card title="Fee Summary" action={<span className="rounded bg-attested-50 px-2 text-xs text-attested-700">Review Required</span>}>
                            <LedgerSubtotals totals={totals} />
                            <KV className="mt-3" rows={[['Currency', 'ZAR source / USD where applicable'], ['Quote Validity', '14 Days'], ['Payment Structure', 'Gate-by-gate (deposit + milestones)'], ['Commercial Guardrails', 'No Resolution, No Price® · Fair pricing. Always.']]} />
                            <ButtonLink href="/technology-solutions/checkout" className="mt-4 w-full" trailingIcon="arrow-right">Proceed to Engagement Letter</ButtonLink>
                            <ButtonLink href="/technology-solutions/scope" variant="outline" className="mt-2 w-full">Scope & Deliverables</ButtonLink>
                        </Card>
                    </aside>
                </div>
            </TechJourney>
        </>
    );
}
