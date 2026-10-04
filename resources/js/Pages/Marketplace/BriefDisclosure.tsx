import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, Download, Settings, ShieldCheck, TriangleAlert, User } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Select } from '@/Components/ui/Form';
import { Card, InfoRows, Notice, zarCode } from '@/Components/Marketplace/ui';
import { BriefJourney } from '@/Components/Marketplace/Brief';
import type { MkBrief } from '@/types/marketplace';

const ACKS = [
    ['ack_independent', 'I acknowledge that the above provider is an independent external specialist or firm.'],
    ['ack_fees', 'I confirm that all fees (Ledger A, B and C) and procurement requirements are clear.'],
    ['ack_accountable', 'I understand that TBCA is accountable for process quality and issue resolution.'],
    ['ack_payment', 'I understand that I approve payment only at the next step after this disclosure.'],
    ['ack_terms', 'I agree to the Marketplace Terms, QA Standard and Professional Boundaries.'],
] as const;

export default function BriefDisclosure({ brief }: { brief: MkBrief }) {
    const l = brief.scope.ledgers!;
    const p = brief.provider;
    const done = brief.status !== 'scope_accepted';
    const form = useForm({ procurement: brief.data.procurement ?? 'Subcontracting permitted with disclosure only', ack_independent: false, ack_fees: false, ack_accountable: false, ack_payment: false, ack_terms: false });
    const all = ACKS.every(([k]) => form.data[k]);

    return (
        <>
            <Head title={`Third-Party Delivery & Procurement Disclosure – ${brief.reference}`} />
            <section className="bg-white py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Marketplace Brief', href: `/marketplace/briefs/${brief.reference}/review` }, { label: brief.reference }, { label: 'Third-Party Delivery & Procurement Disclosure' }]} />
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="max-w-2xl">
                            <h1 className="font-serif text-3xl font-bold text-ink-900">Third-Party Delivery &amp; Procurement Disclosure</h1>
                            <p className="mt-1 text-sm text-ink-600">Please review all third-party providers, fees and procurement requirements before approving and proceeding to payment authorisation.</p>
                        </div>
                        <div className="rounded-[8px] border border-gold-300/60 bg-parchment-100 px-4 py-3"><p className="text-xs text-ink-500">BRF ID:</p><p className="font-bold">{brief.reference}</p><p className="text-xs font-semibold text-gold-700">Status: {done ? 'Disclosure Complete' : 'Disclosure Pending'}</p></div>
                        <BriefJourney current={2} className="w-full lg:w-[420px]" />
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Who May Perform the Work?">
                            {p ? (
                                <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,0.9fr)]">
                                    <div>
                                        <div className="flex gap-3"><span className="flex size-14 items-center justify-center rounded-full bg-ink-950 font-serif text-xl font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span>
                                            <div><p className="font-semibold text-ink-900">{p.name}</p><p className="text-xs font-semibold text-gold-700">External Marketplace Provider</p><p className="text-xs text-ink-500">{p.categoryLabel} Specialist · {p.city}, {p.country}</p></div></div>
                                        <InfoRows dense className="mt-3" rows={[['Expertise', (p.profile.skills ?? []).slice(0, 3).join(', ') || p.categoryLabel], ['Verification', `Completed ${p.lastVerified ?? ''}`], ['QA Standard', brief.scope.qa?.standard ?? 'MP-QA-MR-02 v2.1'], ['Professional Adoption', 'Not Applicable'], ['Liability', 'Provider liable for deliverables per agreement']]} />
                                    </div>
                                    <div className="rounded-[6px] border border-gold-300/60 bg-parchment-100 p-4 text-xs text-ink-700">
                                        <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink-900"><ShieldCheck className="size-4 text-gold-600" aria-hidden="true" />TBCA Accountability</p>
                                        <p>TBCA remains your accountable partner for this engagement. We manage the process, quality, payments and service recovery.</p>
                                        <ul className="mt-2 space-y-1">{['We scope and approve the work', 'We disclose all fees transparently', 'We manage QA and issue resolution', 'We protect your interests end-to-end'].map((x) => <li key={x} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                                    </div>
                                </div>
                            ) : (
                                <Notice tone="warn">No provider selected yet. <Link href={`/marketplace/briefs/${brief.reference}/proposals`} className="font-semibold underline">Compare proposals</Link> before acknowledging disclosure.</Notice>
                            )}
                        </Card>
                        <Card title="Fee Breakdown (Three-Ledger Model)">
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[[User, 'Ledger A', 'TBCA Professional Fees', l.a, 'Scope design, management, QA oversight & delivery governance', 'bg-gold-50'], [Settings, 'Ledger B', 'Platform & Admin Fees', l.b, 'Workflow, platform access, assurance, compliance & service administration', 'bg-controlled-50'], [Building2, 'Ledger C', 'Third-Party Costs (Est.)', l.c, 'Provider fees, data sources, tools, databases & direct project costs', 'bg-verified-50']].map(([I, t, s, amt, body, bg]) => {
                                    const Ic = I as typeof User;
                                    return <div key={t as string} className={`rounded-[6px] border border-parchment-300 p-3 ${bg}`}><Ic className="size-6 text-ink-700" aria-hidden="true" /><p className="mt-1 text-sm font-semibold text-controlled-700">{t as string}</p><p className="text-xs text-ink-600">{s as string}</p><p className="mt-3 text-xl font-bold text-ink-900">{zarCode(amt as number)}</p><p className="mt-2 text-[0.6875rem] text-ink-600">{body as string}</p></div>;
                                })}
                            </div>
                            <p className="mt-3 rounded bg-gold-50 px-3 py-2 text-center text-xs text-ink-600">All amounts are VAT-exclusive. Applicable VAT will be applied at checkout.</p>
                        </Card>
                    </div>
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); form.post(`/marketplace/briefs/${brief.reference}/disclosure`); }}>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card title="Procurement & Approval Requirements">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <label className="text-xs font-semibold text-ink-800">Your Organisation&apos;s Procurement Requirement
                                        <Select className="mt-1" value={form.data.procurement} onChange={(e) => form.setData('procurement', e.target.value)} options={['Subcontracting permitted with disclosure only', 'Named subcontractor approval required', 'Prior written approval required', 'No procurement restriction']} disabled={done} />
                                    </label>
                                    <div className="text-xs"><p className="font-semibold text-ink-800">Required Approvals</p><ul className="mt-1 space-y-1 text-ink-600">{['Disclosure acknowledged', 'Budget authority confirmed', 'No additional written approval required'].map((x) => <li key={x} className="flex gap-1"><CheckCircle2 className="size-3.5 text-verified-500" aria-hidden="true" />{x}</li>)}</ul></div>
                                    <div className="text-xs"><p className="font-semibold text-ink-800">Documents &amp; Evidence</p><p className="mt-1 flex items-center justify-between rounded border border-parchment-300 p-2">Procurement Policy Summary<Download className="size-3.5" aria-label="Download" /></p></div>
                                </div>
                            </Card>
                            <Card title="Important Acknowledgements">
                                <div className="space-y-2">
                                    {ACKS.map(([k, label]) => <Checkbox key={k} label={label} checked={done || form.data[k]} disabled={done} onChange={(e) => form.setData(k, e.target.checked)} />)}
                                </div>
                                {Object.keys(form.errors).length > 0 && <p role="alert" className="mt-2 text-xs text-risk-500">All acknowledgements are required.</p>}
                            </Card>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 rounded-[8px] border border-gold-400/60 bg-gold-50 p-4">
                            <TriangleAlert className="size-8 text-attested-500" aria-hidden="true" />
                            <p className="flex-1 text-sm text-ink-700"><strong className="text-risk-600">You must complete all acknowledgements to continue.</strong><br />Proceeding indicates your informed consent and authority to move forward.</p>
                            <Link href={`/marketplace/briefs/${brief.reference}/review`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">Back to Scope &amp; Price</Link>
                            {done ? <Link href={`/marketplace/briefs/${brief.reference}/checkout`} className="inline-flex h-11 items-center rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">Proceed to Payment →</Link>
                                : <Button type="submit" disabled={!all || !p || form.processing} trailingIcon="arrow-right">I Acknowledge &amp; Proceed to Payment</Button>}
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}
