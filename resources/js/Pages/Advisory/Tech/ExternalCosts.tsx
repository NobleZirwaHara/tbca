import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Info, Lock } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill, Tabs } from '@/Components/ui/Kit';
import PublicLayout from '@/Layouts/PublicLayout';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { TechPortal } from '@/Components/Advisory/shells';
import { amount, LedgerSubtotals } from '@/Components/Advisory/TechFees';
import { Card, CheckList, Notice, zarRange } from '@/Components/Advisory/ui';
import type { FeeLine, LedgerTotals, TechHeader } from '@/types/advisory';

interface Props { journey: JourneyState | null; engagement?: TechHeader; lines: FeeLine[]; totals: LedgerTotals; suppliers: Record<string, string> }

function Body({ lines, totals, suppliers, inPortal }: Props & { inPortal: boolean }) {
    const [tab, setTab] = useState('breakdown');
    const x = lines.filter((l) => l.ledger === 'X' || l.class === 'S02');
    return (
        <div className="space-y-4">
            <Notice tone="good"><Info className="size-4" />All external costs are passed through at cost or approved estimates. TBCA does not mark up supplier charges.</Notice>
            <Tabs tabs={[{ key: 'breakdown', label: 'External Costs Breakdown' }, { key: 'funding', label: 'Supplier Funding & Financing Options' }]} value={tab} onChange={setTab} />
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    {tab === 'breakdown' ? (
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[760px] text-left text-xs">
                                <thead className="bg-parchment-200 text-ink-600"><tr>{['Category', 'Description', 'Supplier / Provider', 'Pricing Basis', 'Frequency', 'Amount / Range (ZAR)', 'Approval Status'].map((h) => <th key={h} className="px-2.5 py-2">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {x.map((l) => <tr key={l.item}><td className="px-2.5 py-2 font-semibold">{l.item}</td><td className="px-2.5">{l.covers}</td><td className="px-2.5">{suppliers[l.item] ?? 'Approved supplier list'}</td><td className="px-2.5">{l.basis}</td><td className="px-2.5">{l.frequency}</td><td className="px-2.5 font-semibold whitespace-nowrap">{amount(l)}</td><td className="px-2.5"><StatusPill status={l.gate} /></td></tr>)}
                                    <tr className="font-semibold"><td className="px-2.5 py-2" colSpan={5}>External Costs Subtotal (Estimated)</td><td className="px-2.5" colSpan={2}>{zarRange(totals.X)}</td></tr>
                                </tbody>
                            </table>
                            <p className="p-3 text-xs text-ink-500">Final supplier costs will be confirmed after scope approval and vendor onboarding.</p>
                        </div>
                    ) : (
                        <Card title="How Ledger X funding works">
                            <CheckList items={['External costs are approved line-by-line at Gate 3 (Licence / External Procurement).', 'You fund the Ledger X estimate into a restricted pass-through balance; TBCA does not mark it up.', 'No supplier commitment is made before cleared X funding.', 'Under-runs are credited or refunded to you; over-runs block the commitment and reopen the gate.', 'TBCA handling of external procurement is a separate Ledger T fee (T14 / T19), never hidden inside X.']} />
                            <p className="mt-3 flex items-center gap-1.5 text-xs text-risk-700"><Lock className="size-4" />Commitment lock applies while funding is incomplete.</p>
                            {inPortal && <p className="mt-2 text-xs">Fund your current gate&rsquo;s Ledger X estimate from the <b>Fees & Ledgers</b> page.</p>}
                        </Card>
                    )}
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="External Costs Summary"><p className="text-2xl font-bold">{zarRange(totals.X)}</p><p className="text-xs text-ink-500">Ledger X — pass-through at cost</p></Card>
                    <Card title="Fee Summary (by ledger)"><LedgerSubtotals totals={totals} /></Card>
                    <Card title="Approval Required"><CheckList tone="gold" items={x.filter((l) => l.gate === 'Approval Required').map((l) => l.item)} /></Card>
                </aside>
            </div>
        </div>
    );
}

export default function ExternalCosts(props: Props) {
    if (props.engagement) {
        return (
            <TechPortal e={props.engagement} title="External Costs & Supplier Funding" description="Third-party costs, supplier charges and funding requirements for your solution.">
                <Head title="External Costs & Supplier Funding" />
                <Body {...props} inPortal />
            </TechPortal>
        );
    }
    return (
        <PublicLayout>
            <Head title="External Costs & Supplier Funding" />
            <TechJourney step={5} journey={props.journey} title="External Costs & Supplier Funding" sub="Third-party costs, supplier charges and funding requirements for your solution."
                footer={<><Link href="/technology-solutions/fees" className="text-sm">← Back to Fees</Link><ButtonLink href="/technology-solutions/checkout" trailingIcon="arrow-right">Proceed to Engagement Letter</ButtonLink></>}>
                <Body {...props} inPortal={false} />
            </TechJourney>
        </PublicLayout>
    );
}

ExternalCosts.layout = null;
