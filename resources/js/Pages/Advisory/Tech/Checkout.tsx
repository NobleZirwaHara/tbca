import { Head, Link, useForm } from '@inertiajs/react';
import { Layers, ShieldCheck, SplitSquareHorizontal, Wallet } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { ChoiceCard } from '@/Components/ui/Form';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { FeeLedgerTable, LedgerSubtotals } from '@/Components/Advisory/TechFees';
import { Card, zar } from '@/Components/Advisory/ui';
import type { FeeLine, LedgerTotals } from '@/types/advisory';

interface Props { journey: JourneyState; lines: FeeLine[]; totals: LedgerTotals; plan: string; gates: [number, string, string, number, number, number][] }

export default function Checkout({ journey, lines, totals, plan, gates }: Props) {
    const form = useForm({ plan });
    const first = gates[0];
    const payNow = form.data.plan === 'full' ? totals.t_fixed : first[3];
    return (
        <>
            <Head title="Ledger-Separated Checkout" />
            <TechJourney step={5} journey={journey} title="Ledger-Separated Checkout" sub="Transparent pricing. Separate ledgers for TBCA fees and external costs."
                footer={<><Link href="/technology-solutions/fees" className="text-sm">← Back to Fees</Link><Button onClick={() => form.post('/technology-solutions/checkout')} disabled={form.processing} trailingIcon="arrow-right">Continue to Engagement Letter</Button></>}>
                <p className="text-sm text-ink-600">Review your solution and choose how you want to pay. Separate ledgers keep everything clear.</p>
                <div className="grid gap-4 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-8">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card title={<span className="flex items-center gap-2">TBCA Professional Fees Ledger <span className="rounded bg-verified-50 px-1.5 text-[0.6875rem] text-verified-700">TBCA Ledger</span></span>}>
                                <FeeLedgerTable lines={lines.filter((l) => l.ledger === 'T')} totals={totals} columns="compact" />
                                <p className="mt-2 text-[0.6875rem] text-ink-500">All TBCA fees are professional fees for services, intellectual property and expertise. No third-party costs, statutory charges or external disbursements are included.</p>
                            </Card>
                            <Card title={<span className="flex items-center gap-2">External Costs Ledger <span className="rounded bg-controlled-50 px-1.5 text-[0.6875rem] text-controlled-700">External Ledger</span></span>}>
                                <FeeLedgerTable lines={lines.filter((l) => l.ledger === 'X')} totals={totals} columns="compact" />
                                <p className="mt-2 text-[0.6875rem] text-ink-500">External costs are passed through at cost or on approved estimates. TBCA does not mark up third-party or statutory charges.</p>
                            </Card>
                        </div>
                        <ul className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-4">
                            {[[SplitSquareHorizontal, 'Separate Ledgers', 'TBCA fees and external costs are listed and paid separately.'], [Layers, 'No Hidden Costs', 'You see everything before you commit.'], [Wallet, 'Flexible Payment', 'Pay by gate milestones or in full.'], [ShieldCheck, 'Secure & Compliant', 'All payments are protected and fully documented.']].map(([I, t, b]) => {
                                const Icon = I as typeof Layers;
                                return <li key={t as string} className="flex gap-2 text-xs"><Icon className="size-5 shrink-0 text-gold-600" /><span><b className="block">{t as string}</b>{b as string}</span></li>;
                            })}
                        </ul>
                    </div>
                    <aside className="space-y-4 xl:col-span-4">
                        <Card title="Order Summary" action={<span className="rounded bg-attested-50 px-2 text-xs text-attested-700">Review Required</span>}>
                            <LedgerSubtotals totals={totals} />
                            <div className="mt-4 rounded border border-gold-400 bg-gold-50 p-3">
                                <p className="text-xs text-ink-600">Amount payable now (after you sign)</p>
                                <p className="text-2xl font-bold">{zar(payNow)} <span className="text-xs font-normal">excl. VAT</span></p>
                                <p className="text-[0.6875rem] text-ink-500">{form.data.plan === 'full' ? 'All fixed TBCA fees upfront' : `Gate 1 — ${first[1]} (30% of fixed TBCA fees)`}. VAT, R250 platform fee and card charges are added on the payment page. External costs are funded separately before any supplier commitment.</p>
                            </div>
                            <p className="mt-4 text-sm font-semibold">Payment Method</p>
                            <div className="mt-2 space-y-2" role="radiogroup">
                                <ChoiceCard selected={form.data.plan === 'deposit_milestones'} onSelect={() => form.setData('plan', 'deposit_milestones')} title="Deposit + Milestones (Recommended)" description="Secure your project and pay gate by gate" />
                                <ChoiceCard selected={form.data.plan === 'full'} onSelect={() => form.setData('plan', 'full')} title="Full Payment" description="Pay all fixed TBCA fees upfront" />
                                <ChoiceCard selected={form.data.plan === 'custom'} onSelect={() => form.setData('plan', 'custom')} title="Custom Payment Plan" description="Tailored plan for your cashflow needs (reviewed by TBCA)" />
                            </div>
                            <Button className="mt-4 w-full" onClick={() => form.post('/technology-solutions/checkout')} trailingIcon="arrow-right">Continue to Engagement Letter</Button>
                        </Card>
                    </aside>
                </div>
            </TechJourney>
        </>
    );
}
