import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, FileText, Info, MessageSquare, ShieldCheck, Tag as TagIcon, Users, Wallet, XCircle } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import { Card, CheckList, FactStrip, InfoRows, Notice } from '@/Components/Marketplace/ui';
import { LedgerEnvelope } from '@/Components/Marketplace/Brief';
import type { MkBrief } from '@/types/marketplace';

export default function BriefReview({ brief, proposalCount }: { brief: MkBrief; proposalCount: number }) {
    const s = brief.scope;
    const [clarify, setClarify] = useState(false);
    const msg = useForm({ message: '' });
    const floorPass = s.floor?.status === 'PASS';
    const awaiting = ['awaiting_buyer_confirmation', 'clarification_requested'].includes(brief.status);
    const canAccept = awaiting && floorPass;
    const accepted = !awaiting && brief.status !== 'blocked_below_floor';

    return (
        <>
            <Head title={`Scope and Price Confirmation – ${brief.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'My Marketplace', href: '/marketplace/my' }, { label: 'Scope and Price Confirmation' }]} />
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <div>
                                <h1 className="font-serif text-3xl font-bold text-ink-900">Scope and Price Confirmation</h1>
                                <p className="text-sm text-ink-500">Review the current Methodology Brief, delivery scope and commercial envelope before you proceed.</p>
                            </div>
                            <FactStrip items={[
                                { icon: <FileText className="size-4" />, label: 'BRF ID', value: brief.reference },
                                { icon: <TagIcon className="size-4" />, label: 'Price Version', value: s.price_version },
                                { icon: <ShieldCheck className="size-4" />, label: 'Current Floor Status', value: <span className={floorPass ? 'text-verified-700' : 'text-risk-600'}>{s.floor?.status}</span> },
                                { icon: <Users className="size-4" />, label: 'Provider Selection Status', value: s.provider_selection ?? 'Not Yet Selected' },
                                { icon: <CalendarClock className="size-4" />, label: 'Review Status', value: <span className="text-gold-700">{brief.statusLabel}</span> },
                                { label: 'Gate', value: s.gate ?? 'GATE-MP-24' },
                            ]} />
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card number={1} title="Methodology Brief" className="md:row-span-2">
                                    <InfoRows dense rows={[['Brief Title', brief.title], ['Objective Summary', s.objective], ['Scope Summary', s.summary], ['Approved Methodology', s.methodology], ['Intended Use', brief.data.intended_use]]} />
                                    <InfoRows dense className="mt-3 border-t border-parchment-300" rows={[['Country', brief.data.country], ['Industry', brief.data.industry], ['Delivery Class', s.delivery_class], ['QA Class', s.qa_class]]} />
                                </Card>
                                <Card number={2} title="Scope of Work"><CheckList items={s.scope_items ?? []} /></Card>
                                <Card number={3} title="Deliverables"><CheckList items={s.deliverables ?? []} mark="info" /></Card>
                                <Card number={4} title="Exclusions"><CheckList items={s.exclusions ?? []} mark="x" /></Card>
                                <Card number={5} title="Assumptions"><CheckList items={s.assumptions ?? []} mark="info" /></Card>
                                <Card number={6} title="Timing">
                                    <InfoRows dense rows={[['Kick-off', s.timing?.kickoff], ['Estimated Turnaround', s.timing?.turnaround], ['Buyer Data Due Date', s.timing?.buyer_data_due], ['Draft Delivery Date', s.timing?.draft], ['Final Release Target', s.timing?.final]]} />
                                </Card>
                                <Card number={7} title="QA and Review" className="md:col-span-2">
                                    <InfoRows dense rows={[['QA Standard ID', s.qa?.standard], ['Human Review', s.qa?.human_review], ['Rights & Privacy Checks', s.qa?.rights], ['Release Rule', s.qa?.release], ['Professional Review State', s.qa?.professional]]} />
                                </Card>
                            </div>
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            <Card title="Commercial Envelope (Separated Ledgers)">
                                {s.ledgers && <LedgerEnvelope ledgers={s.ledgers} footer={<p className="mt-2 text-xs text-ink-500">Tax Treatment: VAT treatment to apply as invoiced.</p>} />}
                            </Card>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <Card><p className="font-semibold text-ink-900">Provider Selection State</p><p className="mt-1 text-ink-500">{brief.provider ? brief.provider.name : 'Provider not yet selected. Ledger C remains a capped estimate until selection.'}</p></Card>
                                <Card><p className="font-semibold text-ink-900">Floor Check</p><p className={floorPass ? 'mt-1 font-bold text-verified-700' : 'mt-1 font-bold text-risk-600'}>{s.floor?.status}</p></Card>
                                <Card><p className="font-semibold text-ink-900">Payment Prerequisite</p><p className="mt-1 text-risk-600">Not yet authorised</p></Card>
                                <Card><p className="font-semibold text-ink-900">Disclosure Prerequisite</p><p className="mt-1 text-verified-700">{brief.provider ? 'Ready' : 'Pending provider'}</p></Card>
                            </div>
                            <Card tone="cream" title="Compliance & Guardrails">
                                <ul className="list-disc space-y-1 pl-4 text-xs text-ink-700"><li>Do not present a single blended price.</li><li>If any prerequisite is unresolved, acceptance remains disabled.</li><li>Provider actual cost above the cap re-issues the price version.</li></ul>
                            </Card>
                            {(s.clarifications ?? []).length > 0 && (
                                <Card title="Clarification requests">
                                    <ul className="space-y-2 text-xs">{s.clarifications!.map((c, i) => <li key={i}><span className="text-ink-400">{c.at}</span><p className="text-ink-700">{c.message}</p></li>)}</ul>
                                </Card>
                            )}
                        </aside>
                    </div>

                    {brief.status === 'blocked_below_floor' && <Notice tone="bad">This brief is blocked below the current price floor. TBCA will re-scope it before acceptance is possible.</Notice>}
                    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        {awaiting ? (
                            <Button type="button" disabled={!canAccept} onClick={() => router.post(`/marketplace/briefs/${brief.reference}/accept`, { price_version: s.price_version })}>
                                <CheckCircle2 className="size-4" aria-hidden="true" /> Accept Scope and Price
                            </Button>
                        ) : accepted ? (
                            <Link href={brief.provider ? `/marketplace/briefs/${brief.reference}/disclosure` : `/marketplace/briefs/${brief.reference}/proposals`} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">
                                Continue: {brief.provider ? 'Disclosure' : `Compare Proposals (${proposalCount})`}
                            </Link>
                        ) : (
                            <StatusPill status={brief.statusLabel} />
                        )}
                        <Button type="button" variant="outline" onClick={() => setClarify(true)} disabled={!awaiting}><MessageSquare className="size-4" aria-hidden="true" /> Request Clarification</Button>
                        <Link href="/marketplace/my" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-300 px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Brief</Link>
                        {awaiting && proposalCount > 0 && <Link href={`/marketplace/briefs/${brief.reference}/proposals`} className="text-sm font-semibold text-gold-700"><Wallet className="mr-1 inline size-4" aria-hidden="true" />{proposalCount} provider proposals received</Link>}
                        <p className="flex flex-1 items-start gap-2 text-xs text-ink-500"><Info className="size-4 shrink-0" aria-hidden="true" /> Acceptance does not merge ledgers and does not authorise work until Authority to Proceed and payment conditions are satisfied.</p>
                    </div>
                </div>
            </section>
            <Modal open={clarify} onClose={() => setClarify(false)} title="Request Clarification"
                footer={<><Button variant="outline" size="sm" type="button" onClick={() => setClarify(false)}><XCircle className="size-4" aria-hidden="true" />Cancel</Button><Button size="sm" type="button" disabled={msg.processing} onClick={() => msg.post(`/marketplace/briefs/${brief.reference}/clarify`, { onSuccess: () => { setClarify(false); msg.reset(); } })}><ClipboardList className="size-4" aria-hidden="true" />Send</Button></>}>
                <Field label="What would you like clarified?" error={msg.errors.message} required>{(id) => <Textarea id={id} value={msg.data.message} onChange={(e) => msg.setData('message', e.target.value)} maxLength={1000} />}</Field>
            </Modal>
        </>
    );
}
