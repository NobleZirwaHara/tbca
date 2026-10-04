import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Lock, ShieldAlert, TriangleAlert, UserCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, KV, LedgerBadge, Notice, PageTitle, zar } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { MandateView } from '@/types/advisory';

interface Calc { amount: number; gross: number; credit: number; net: number; gross_pct: number; net_pct: number; floor_applied: boolean; cap_applied: boolean; breakdown: { from: number; to: number; rate: number; fee: number }[] }
interface Props { calc: Calc; mandate: MandateView | null; blocks: [string, string][] | null }

const STEPS = [['Class authorisation', 'Not evidenced'], ['Legal opinion cleared', 'Pending'], ['Conflict disclosure completed', 'Incomplete'], ['Term sheet approved', 'Not approved'], ['Trigger evidenced', 'Not present']];

export default function Contingent({ calc, mandate, blocks }: Props) {
    const [amount, setAmount] = useState(calc.amount);
    const base = mandate ? `/project-advisory/workspace/${mandate.reference}/contingent` : '/project-advisory/contingent-fee-calculator';
    const recalc = (v: number) => router.get(base, { amount: v }, { preserveScroll: true, preserveState: true, replace: true });
    const why = blocks ?? [['Legal permission unresolved', 'Unresolved'], ['Board class activation unresolved', 'Unresolved'], ['Conflict disclosure incomplete', 'Incomplete'], ['Trigger evidence absent', 'Absent'], ['Contingent term sheet not approved', 'Not Approved'], ['Human reviewer sign-off pending', 'Pending']];
    return (
        <div className="container-tbca py-8">
            <Head title="Contingent Fee Calculator" />
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PageTitle
                        crumbs={mandate ? [{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: `Engagement ${mandate.reference}`, href: `/project-advisory/workspace/${mandate.reference}` }, { label: 'Contingent Fee' }] : [{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Contingent Fee Calculator' }]}
                        title="Contingent Fee Calculator"
                        sub="Illustrative contingent economics. Conditional, governed and never payable until a valid crystallisation trigger is evidenced."
                    />
                </div>
                <div className="rounded-[8px] border border-risk-500/30 bg-white p-4 lg:col-span-4">
                    <p className="text-sm font-semibold">Feature Status</p>
                    <Notice tone="bad" className="mt-2"><ShieldAlert className="size-4" />Contingent configuration not activated for this engagement.</Notice>
                    <KV className="mt-2" rows={[['Class-specific legal opinion', 'Pending'], ['Board authorisation', 'Not evidenced'], ['Engagement permission state', 'Unresolved'], ['Client may view', 'UAT illustration only']]} />
                </div>
            </div>
            {mandate && <PaWorkspaceNav reference={mandate.reference} />}
            <div className="grid gap-4 lg:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-7">
                    <Notice tone="warn"><b>Illustrative / UAT Mode</b> — This calculator is shown for explanation only. No contingent amount is currently due or approved.</Notice>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <KV rows={[['Contingent class', 'Success-Based Capital Raise'], ['Calculation base', 'Funds secured through approved mandate scope'], ['Approved rate scale', '2.5% to 4.0% tiered'], ['Floor', 'R150,000'], ['Cap', 'R2,500,000'], ['Gross contingent fee', zar(calc.gross)], ['Eligible retainer credit', zar(calc.credit)], ['Net contingent fee', <b>{zar(calc.net)}</b>], ['Effective gross percentage', `${calc.gross_pct}%`], ['Effective net percentage', `${calc.net_pct}%`]]} />
                        <KV rows={[['Trigger', 'Signed funding close and cleared evidence pack'], ['Trigger evidence', <span className="text-risk-700">Not yet present</span>], ['Notice period', '10 business days after trigger validation'], ['Tail conditions', '6 months for introduced funders'], ['Exclusivity treatment', 'Limited to approved funder set'], ['Conflict disclosure', 'Required and acknowledged before activation'], ['Dispute route', 'Contractual dispute pathway + human review'], ['Tax status', 'VAT follows parent fee if activated']]} />
                    </div>
                    <div className="mt-5 rounded border border-gold-300 bg-gold-50 p-4">
                        <p className="text-sm font-semibold">Illustrative calculation (UAT example)</p>
                        <div className="mt-2 grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="ccf-amt" className="text-xs text-ink-600">Illustrative funding close amount</label>
                                <p className="font-serif text-2xl font-bold">{zar(amount)}</p>
                                <input id="ccf-amt" type="range" min={1_000_000} max={150_000_000} step={1_000_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} onMouseUp={() => recalc(amount)} onTouchEnd={() => recalc(amount)} onKeyUp={() => recalc(amount)} className="mt-2 w-full accent-gold-600" />
                                <div className="flex justify-between text-[0.625rem] text-ink-500"><span>2.5% ≤R10M</span><span>3.0% R25M</span><span>3.5% R50M</span><span>4.0% R100M+</span></div>
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold">Formula summary (marginal tiers)</p>
                                <ul className="mt-1 space-y-0.5">{calc.breakdown.map((b) => <li key={b.from}>{zar(b.from)} – {zar(b.to)} × {b.rate}% = {zar(b.fee)}</li>)}</ul>
                                <p className="mt-1">Gross {zar(calc.gross)} {calc.floor_applied && '(floor applied)'} {calc.cap_applied && '(cap applied)'}</p>
                                <p>Less retainer credit ({zar(calc.credit)}) = <b>{zar(calc.net)}</b> (Net)</p>
                            </div>
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Illustrative only. Rates apply per approved tier. Floor and cap limits apply. No entitlement exists absent a valid trigger.</p>
                    </div>
                </section>
                <div className="space-y-4 lg:col-span-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="A. Why this is blocked">
                            <ul className="space-y-1.5 text-xs">{why.map(([k, v]) => <li key={k} className="flex items-center justify-between gap-2"><span>{k}</span><span className="rounded border border-risk-500/40 bg-risk-50 px-1.5 text-[0.625rem] font-semibold text-risk-700">{v}</span></li>)}</ul>
                        </Card>
                        <Card title="B. Conflict Statement">
                            <p className="flex gap-2 text-xs text-ink-700"><TriangleAlert className="size-5 shrink-0 text-attested-500" />Contingent structures may create incentive misalignment between outcomes, advice and compensation. Therefore, this engagement requires specific disclosure, controlled approval, and your informed assent before any contingent term can be activated.</p>
                            <p className="mt-2 text-xs font-semibold">No contingent amount is payable until a valid crystallisation trigger is evidenced and approved.</p>
                        </Card>
                    </div>
                    <Card title="C. Current payable position (Fail-Closed First)">
                        <div className="grid grid-cols-5 gap-2 text-center text-[0.6875rem]">
                            {['T', 'P', 'X', 'S'].map((l) => <div key={l} className="rounded border border-parchment-400 p-2"><LedgerBadge l={l} size="sm" /><p className="mt-1">{l === 'S' ? 'No new contingent impact' : 'Refer to Fee Ledger'}</p></div>)}
                            <div className="rounded border border-risk-500 bg-risk-50 p-2"><LedgerBadge l="C" size="sm" /><p className="mt-1 font-semibold">Current payable now</p><p className="text-lg font-bold text-risk-700">R0</p><p>No valid crystallisation trigger has occurred.</p></div>
                        </div>
                    </Card>
                    <div className="space-y-2">
                        <ButtonLink href="/project-advisory/engagement-options" className="w-full" trailingIcon="arrow-right">Learn How Contingent Fees Work</ButtonLink>
                        <ButtonLink href={mandate ? `/project-advisory/workspace/${mandate.reference}` : '/project-advisory/discovery'} variant="outline" className="w-full"><UserCheck className="size-4" />Request Human Review</ButtonLink>
                        <Button variant="outline" className="w-full" disabled><Lock className="size-4" />Review Contingent Term Sheet</Button>
                        <p className="text-center text-[0.6875rem] text-ink-500">Activation unavailable until all required authority and evidence checks pass.</p>
                    </div>
                </div>
            </div>
            <section className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                <p className="text-sm font-semibold">From illustrative mode to active contingent term</p>
                <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{STEPS.map(([t, s], i) => <li key={t} className="text-center text-xs"><span className="inline-flex size-7 items-center justify-center rounded-full border-2 border-gold-500 font-bold">{i + 1}</span><p className="mt-1 font-semibold">{t}</p><p className={cn('mx-auto mt-1 inline-block rounded border border-risk-500/40 px-1.5 text-[0.625rem] text-risk-700')}>{s}</p></li>)}</ol>
                <p className="mt-3 text-xs text-ink-500">Potential contingent economics are separate from T, P, X and S ledgers. No combined grand total exists. This screen does not certify legality, bankability or payment obligation.</p>
            </section>
        </div>
    );
}
