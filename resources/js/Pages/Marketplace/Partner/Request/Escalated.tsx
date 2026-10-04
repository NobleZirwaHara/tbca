import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, FileText, Info, Lock, Route, Scale, ShieldCheck, Split, UserCheck, Wallet } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import PsJourneyHeader from '@/Components/Marketplace/PsJourneyHeader';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Escalated({ request: r, journey }: { request: MkPartnerRequest; journey: string[] }) {
    const e = r.meta.escalation ?? {};

    return (
        <>
            <Head title={`Escalated From Another Vehicle – ${r.reference}`} />
            <PsBody>
                <PsJourneyHeader request={r} journey={journey} code="PS-014" title="Escalated From Another Vehicle" crumb="Escalated From Another Vehicle" step={2}
                    lead="This matter has been escalated from another TBCA vehicle because a professional boundary applies. A qualified professional must perform this work."
                    responsibility={<><p className="font-semibold">IMPORTANT NOTICE</p><p>TBCA cannot perform this professional function. To proceed safely and compliantly, this matter has been escalated to Partner Services.</p><p>No work will commence until a qualified professional is appointed and the engagement is executed.</p></>}
                    refRows={[['Requested On', r.requestedOn], ['Requested By', r.clientName], ['Original Vehicle', e.vehicle], ['Escalated Reason', e.reason]]} />
                <div className="grid gap-5 lg:grid-cols-3">
                    <Card title="A. Why This Matter Was Escalated">
                        <div className="rounded-[6px] border border-gold-400/60 bg-parchment-100 p-4 text-sm">
                            <p className="flex items-center gap-2 font-semibold text-ink-900"><Scale className="size-5 text-gold-600" aria-hidden="true" />Professional Boundary Triggered</p>
                            <InfoRows dense rows={[['Activity', e.activity], ['Applicable Profession', e.profession], ['Jurisdiction', r.intake.jurisdiction]]} />
                            <p className="mt-2 text-xs text-ink-600">This activity requires professional judgement, certification and legal accountability that TBCA does not hold.</p>
                            <p className="mt-3 font-semibold">Escalation Decision</p>
                            <p className="text-xs text-ink-600">In accordance with TBCA&apos;s professional boundary policy and the Permission Register, this matter must be performed by a qualified professional.</p>
                        </div>
                    </Card>
                    <Card title="B. Impact on This Engagement">
                        <ul className="space-y-3 text-sm">{[[Route, 'Route Change', 'This matter will now proceed via Partner Services (VEH-10).'], [UserCheck, 'Requirement', 'A qualified, currently verified professional will be appointed.'], [Split, 'Scope Separation', 'TBCA will coordinate. The professional will perform the work and issue the report.'], [ShieldCheck, 'Liability & Responsibility', 'The professional is solely responsible for the professional output, its opinions and outcomes.'], [Wallet, 'Commercial', 'Fees will be charged under the T / P / X / S / C structure. No payment is required until the engagement is executed.']].map(([I, t, b]) => { const Ic = I as typeof Route; return <li key={t as string} className="flex gap-3"><Ic className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><span className="block font-semibold">{t as string}</span><span className="text-ink-600">{b as string}</span></span></li>; })}</ul>
                        <p className="mt-3 rounded border border-gold-400/60 bg-gold-50 p-3 text-sm"><strong>You will be presented with partner proposals shortly.</strong><br />You remain in control at every step.</p>
                    </Card>
                    <div className="space-y-4">
                        <Card title="C. Original Vehicle Context">
                            <InfoRows dense rows={[['Original Vehicle', e.vehicle], ['Original Request ID', e.request_id], ['Original Request Date', e.date], ['Original Scope Summary', e.scope], ['Escalation Date', e.escalated_on], ['Escalated By', e.by]]} />
                            <button type="button" onClick={() => window.print()} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700"><FileText className="size-4" aria-hidden="true" />View Original Request Summary <ExternalLink className="size-3" aria-hidden="true" /></button>
                        </Card>
                        <Card tone="blue"><p className="flex items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />IMPORTANT</p><p className="mt-1 text-sm text-ink-700">Proceeding through Partner Services ensures compliance with professional standards, protects your interests and upholds TBCA&apos;s governance obligations.</p></Card>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/partner-services/requests" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to My Requests</Link>
                    <Link href="/partner-services/coverage" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">View Permission &amp; Profession Details</Link>
                    <div className="ml-auto text-center"><Button type="button" size="lg" onClick={() => router.post(`/partner-services/requests/${r.reference}/escalated`)} trailingIcon="arrow-right">Continue to Partner Proposals</Button><p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Permission check &amp; conflict clearance</p></div>
                </div>
            </PsBody>
        </>
    );
}
