import { Head, router } from '@inertiajs/react';
import { CalendarDays, CircleX, Clock, Info, Lock, PauseCircle, ShieldAlert, ShieldCheck, TriangleAlert, UserRound, Users, ChevronRight, CircleCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DarkHero, InfoRows } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import { cn } from '@/lib/cn';
import type { MkPartnerRequest } from '@/types/marketplace';

const PROGRESS = ['Request Received', 'Conflict Check', 'Conflict Clearance Result', 'Partner Proposal', 'Scope & Quote', 'Engagement Agreement', 'Confirmation'];

export default function Conflict({ request: r }: { request: MkPartnerRequest; journey: string[] }) {
    const conflicted = r.stage === 'conflict_identified';
    const paused = r.stage === 'paused';
    const none = r.stage === 'no_partner_available';
    const pending = r.stage === 'conflict_pending';
    const choose = (choice: string) => router.post(`/partner-services/requests/${r.reference}/next-step`, { choice });
    const summary: [string, string][] = [
        ['Service Category', r.listing?.title ?? r.title ?? ''], ['Primary Profession', r.resolution.profession ?? r.intake.profession], ['Jurisdiction (Matter)', r.resolution.matter_jurisdiction ?? r.intake.jurisdiction],
        ['Intended Use', r.intake.intended_use], ['Arrangement (Proposed)', r.arrangement ?? '—'], ['Permission Row', `${r.permissionRef ?? '—'} (Under Review)`], ['Fee Mechanism', `${r.feeMechanism ?? 'M1 – TBCA Coordination Fee'} (Unopined)`], ['Brief Description', r.intake.description],
    ];

    return (
        <>
            <Head title={`${conflicted ? 'Conflict Identified' : 'Conflict Check Pending'} – ${r.reference}`} />
            <DarkHero code={conflicted ? 'PS-009' : 'PS-008'} crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'My Requests', href: '/partner-services/requests' }, { label: r.reference }, { label: conflicted ? 'Conflict Identified' : 'Conflict Check (Pending)' }]}
                title={conflicted ? 'Conflict Identified' : paused ? 'Request Paused' : none ? 'No Verified Partner Available' : 'Conflict Check Pending'}
                subtitle={conflicted ? 'We are unable to proceed with the current professional assignment.' : none ? 'We will not substitute an unverified person.' : 'Conflict clearance is required before any payment or work can proceed.'}
                aside={
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className={cn('rounded-[8px] border p-4 text-sm', conflicted ? 'border-risk-500/70' : 'border-gold-500/60')}>
                            <p className={cn('flex items-center gap-2 font-semibold', conflicted ? 'text-risk-500' : 'text-gold-400')}>{conflicted ? <ShieldAlert className="size-5" aria-hidden="true" /> : <ShieldCheck className="size-5" aria-hidden="true" />}{conflicted ? 'Confidential Notice' : 'Your Responsibility'}</p>
                            <p className="mt-1 text-ink-200">{conflicted ? 'We cannot disclose the specific reason for this conflict as it may involve confidential information relating to other clients and professional duties.' : 'No payment is taken and no work is assigned until conflict clearance is complete. Detailed conflict reasons are confidential and not disclosed.'}</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-xs text-ink-300">Request Reference</p>
                            <p className="font-serif text-2xl font-bold text-gold-400">{r.reference}</p>
                            <StatusPill status={conflicted ? 'Conflict Identified' : r.stageLabel} tone={conflicted ? 'bad' : 'gold'} />
                            <p className="mt-2 flex items-center gap-1.5 text-ink-200"><CalendarDays className="size-4" aria-hidden="true" />Requested {r.requestedOn}</p>
                            <p className="flex items-center gap-1.5 text-ink-200"><Clock className="size-4" aria-hidden="true" />{conflicted ? `Identified ${r.meta.conflict_identified_at ?? ''}` : 'Est. completion 24–48 Hours'}</p>
                            <p className="flex items-center gap-1.5 text-ink-200"><UserRound className="size-4" aria-hidden="true" />{r.clientName}</p>
                        </div>
                    </div>
                }>
                {conflicted ? 'A potential conflict of interest has been identified that prevents the proposed professional(s) from accepting this engagement.' : 'We are performing a professional conflict check for the proposed engagement. When this check is complete, we will notify you and share the next steps.'}
            </DarkHero>
            <PsBody>
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        {conflicted || paused || none ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card title="What This Means">
                                    <ul className="space-y-1 text-sm text-ink-700"><li>The identified professional is unable to act for you on this matter.</li><li>No information about the nature of the conflict will be shared.</li><li>Your confidentiality and the confidentiality of others are protected.</li></ul>
                                    <p className="mt-4 text-sm font-semibold text-ink-900">What Happens Next</p>
                                    <ul className="mt-1 space-y-1 text-sm text-ink-700">{['You may choose one of the options on the right.', 'If you choose a new professional, we will start a new conflict check.', 'No fees will be charged for this conflict check.', 'You can pause or close this request if you no longer require assistance.'].map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                                </Card>
                                <Card title="Your Request Summary"><InfoRows dense rows={[...summary.slice(0, 7), ['Status', r.stageLabel.toUpperCase()]]} /></Card>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Card title="Why we check for conflicts"><p className="text-sm text-ink-600">We must ensure that no existing or past professional relationship, duty of confidentiality, or other factor creates a conflict for any potential professional. This protects you, other clients, and the integrity of the process.</p></Card>
                                    <Card title="What we are checking"><ul className="list-disc pl-5 text-sm text-ink-700"><li>Existing client relationships</li><li>Confidential information risks</li><li>Professional independence and impartiality</li><li>Jurisdictional and regulatory limitations</li><li>Any other relevant conflict factors</li></ul></Card>
                                </div>
                                <Card title="Request Summary"><InfoRows rows={summary} /></Card>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Card tone="cream"><p className="flex items-center gap-2 font-semibold text-gold-800"><TriangleAlert className="size-4" aria-hidden="true" />Please do not send payment</p><p className="mt-1 text-sm text-ink-600">Do not send any payment or make any commitment until you receive confirmation that conflict clearance is complete and the next step has been approved.</p></Card>
                                    <Card tone="cream"><p className="flex items-center gap-2 font-semibold text-gold-800"><Clock className="size-4" aria-hidden="true" />What happens next?</p><p className="mt-1 text-sm text-ink-600">You will receive an email and portal notification once the conflict check is complete and we can proceed.</p></Card>
                                </div>
                            </>
                        )}
                        {conflicted && <p className="flex items-center gap-3 rounded-[8px] border border-risk-500/40 bg-risk-50 p-4 text-sm font-semibold text-risk-700"><Lock className="size-6" aria-hidden="true" />No payment can be made and no work can begin until a suitable conflict-free professional is confirmed and all applicable clearances are complete.</p>}
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        {(conflicted || none || paused) && (
                            <Card title="Choose Your Next Step">
                                <div className="space-y-2">
                                    {(paused ? [['resume', 'Resume This Request', 'Return to the conflict outcome and choose a next step.', PauseCircle]] : [['another', 'Propose Another Professional', 'We will find and propose alternative professionals who can assist with your matter.', Users], ['pause', 'Pause This Request', 'Put this request on hold. You can resume it at any time.', PauseCircle]]).concat([['close', 'Close This Request', 'Close this request. You can submit a new request in the future if needed.', CircleX]]).map(([k, t, b, I]) => {
                                        const Ic = I as typeof Users;
                                        return <button key={k as string} type="button" onClick={() => choose(k as string)} className="flex w-full items-center gap-3 rounded-[6px] border border-gold-400/60 bg-white p-3 text-left hover:bg-gold-50"><Ic className="size-7 shrink-0 text-gold-600" aria-hidden="true" /><span className="flex-1"><span className="block text-sm font-semibold text-ink-900">{t as string}</span><span className="text-xs text-ink-500">{b as string}</span></span><ChevronRight className="size-4" aria-hidden="true" /></button>;
                                    })}
                                </div>
                            </Card>
                        )}
                        {pending && (
                            <Card title="Your Request Progress">
                                <ol className="space-y-3">{PROGRESS.map((s, i) => <li key={s} className="flex items-start gap-3 text-sm"><span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', i === 0 ? 'bg-ink-900 text-white' : i === 1 ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-400')}>{i === 0 ? '✓' : i + 1}</span><span><span className={i <= 1 ? 'font-semibold' : 'text-ink-400'}>{s}</span><br /><span className="text-xs text-ink-400">{i === 0 ? r.requestedOn : i === 1 ? 'In progress' : 'Pending'}</span></span>{i === 1 && <span className="ml-auto rounded border border-gold-500 px-1.5 text-[0.625rem] font-bold text-gold-700">YOU ARE HERE</span>}</li>)}</ol>
                            </Card>
                        )}
                        <Card tone="cream" title="Need Help?">
                            <p className="text-sm text-ink-600">{conflicted ? 'Speak to our team for confidential guidance.' : 'Our team is available to answer your questions.'}</p>
                            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: `Matter ${r.reference}`, section: 'partner-services' })}><Info className="size-4" aria-hidden="true" />Ask a Human Advisor</Button>
                        </Card>
                    </aside>
                </div>
            </PsBody>
        </>
    );
}
