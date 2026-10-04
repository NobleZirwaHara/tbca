import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, CircleX, ExternalLink, FileText, Info, Lightbulb, ListChecks, RefreshCw, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Modal, StatusPill, Tag } from '@/Components/ui/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import { Card, CodeChip, InfoRows, Responsibility, RefCard } from '@/Components/Marketplace/ui';
import { PsBody, money } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Proposal({ request: r }: { request: MkPartnerRequest; journey: string[] }) {
    const p = r.meta.proposal ?? {};
    const [decline, setDecline] = useState<'' | 'decline' | 'alternative'>('');
    const [reason, setReason] = useState('');
    const send = (decision: string, why?: string) => router.post(`/partner-services/requests/${r.reference}/proposal`, { decision, reason: why });

    return (
        <>
            <Head title={`Partner Proposal & Acceptance – ${r.reference}`} />
            <PsBody>
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'My Requests', href: '/partner-services/requests' }, { label: r.reference }, { label: 'Partner Proposal & Acceptance' }]} />
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <CodeChip code="PS-010" />
                        <h1 className="mt-2 font-serif text-4xl font-bold text-ink-900">Partner Proposal &amp; Acceptance</h1>
                        <p className="mt-1 text-ink-600">Review the proposed professional and their approach for your engagement.</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs sm:grid-cols-4">
                            {[['Jurisdiction & Profession', 'Resolved'], ['Permission Row', r.permissionRef], ['Conflict Check', r.conflictState === 'CLEAR_WITH_CONDITIONS' ? 'Cleared (conditions)' : 'Cleared'], ['Next Step', 'Scope & Quote']].map(([k, v]) => <div key={k} className="flex gap-1.5"><CheckCircle2 className="size-4 shrink-0 text-verified-500" aria-hidden="true" /><span><span className="block font-semibold">{k}</span>{v}</span></div>)}
                        </div>
                    </div>
                    <div className="lg:col-span-3"><RefCard reference={r.reference} rows={[['Requested On', r.requestedOn], ['Primary Profession', r.resolution.profession], ['Service Category', r.listing?.title ?? r.title], ['Jurisdiction (Matter)', r.resolution.matter_jurisdiction]]} /></div>
                    <div className="lg:col-span-3"><Responsibility><p>You review the proposal and accept the professional before we move to scope and quote.</p><p>No commitment or payment is required at this stage.</p></Responsibility></div>
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                    <Card title="Proposed Professional" action={<StatusPill status="Verified" tone="good" />}>
                        <div className="flex items-center gap-3"><span className="flex size-14 items-center justify-center rounded-full bg-controlled-50 font-serif text-xl font-bold text-controlled-700" aria-hidden="true">{(p.firm ?? 'P').slice(0, 1)}</span><div><p className="font-semibold text-ink-900">{p.firm}</p><Tag tone="gold">{r.arrangement}</Tag></div></div>
                        <div className="mt-3 grid gap-x-4 sm:grid-cols-2">
                            <InfoRows dense rows={[['Specialisation', p.specialisation], ['Firm Type', p.firm_type], ['Registration', p.registration], ['Physical Address', p.address]]} />
                            <InfoRows dense rows={[['Lead Professional', p.lead], ['Qualifications', p.qualifications], ['Professional Registration', p.professional_registration], ["Years' Experience", p.experience], ['Independence Declaration', p.independence]]} />
                        </div>
                        <a href="/partner-services/network" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700">View Professional &amp; Firm Profile <ExternalLink className="size-3.5" aria-hidden="true" /></a>
                    </Card>
                    <Card title="Approach Summary">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">The proposed professional&apos;s approach to your matter.</p>
                        <ul className="space-y-3 text-sm">{[[Lightbulb, 'Understanding of the Matter', p.understanding], [ListChecks, 'Proposed Methodology', p.methodology], [FileText, 'Key Deliverables', p.deliverables], [CalendarDays, 'Estimated Timeline', p.timeline], [Users, 'Typical Team', p.team]].map(([I, k, v]) => { const Ic = I as typeof Users; return <li key={k as string} className="flex gap-2"><Ic className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><span className="block font-semibold text-ink-900">{k as string}</span><span className="text-ink-600">{v as string}</span></span></li>; })}</ul>
                    </Card>
                    <div className="space-y-5">
                        <Card title="Commercial Indication (Indicative Only)">
                            <InfoRows dense rows={[['Fee Mechanism', r.feeMechanism], ['TBCA Coordination Fee (T)', `From ${money(r.quote.t ?? 0)}`], ['Professional Fee (P)', r.quote.p ? `Indicative ${money(r.quote.p)}` : 'Quote-based (to be provided)'], ['Disbursements (X)', 'If any, will be disclosed in quote'], ['VAT (S)', 'As applicable'], ['Credits / Adjustments (C)', 'If applicable']]} />
                        </Card>
                        <Card><p className="flex items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />IMPORTANT</p><p className="mt-1 text-sm text-ink-600">Acceptance confirms the proposed professional and allows TBCA to proceed to scope and quote.</p><p className="mt-2 text-sm text-ink-600">This is not a commitment to engage or pay.</p></Card>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <p className="flex flex-1 items-center gap-2 rounded-[6px] border border-parchment-400 bg-white px-4 py-3 text-xs text-ink-600"><Info className="size-4" aria-hidden="true" />All proposed professionals are subject to final engagement terms, scope agreement, and successful completion of all remaining gates.</p>
                    <Button type="button" variant="outline" onClick={() => setDecline('decline')}><CircleX className="size-4" aria-hidden="true" />Decline Proposal</Button>
                    <Button type="button" variant="outline" onClick={() => setDecline('alternative')}><RefreshCw className="size-4" aria-hidden="true" />Request Alternative</Button>
                    <Button type="button" size="lg" onClick={() => send('accept')} trailingIcon="arrow-right">Accept Proposal &amp; Continue</Button>
                </div>
            </PsBody>
            <Modal open={decline !== ''} onClose={() => setDecline('')} title={decline === 'decline' ? 'Decline Proposal' : 'Request Alternative Professional'}
                footer={<><Button variant="outline" size="sm" type="button" onClick={() => setDecline('')}>Cancel</Button><Button size="sm" type="button" onClick={() => send(decline, reason)}>Confirm</Button></>}>
                <p className="mb-3 text-sm text-ink-600">We will source an alternative verified professional and start a new conflict check. No fees are charged.</p>
                <Field label="Reason (optional)">{(id) => <Textarea id={id} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />}</Field>
            </Modal>
        </>
    );
}
