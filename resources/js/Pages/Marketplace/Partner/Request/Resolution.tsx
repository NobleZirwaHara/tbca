import { Head, Link, router } from '@inertiajs/react';
import { Ban, CheckCircle2, Clock, Scale, ShieldAlert, ShieldCheck, TriangleAlert, UserRound } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DarkHero, InfoRows, Notice } from '@/Components/Marketplace/ui';
import { PsBody, PsJourney } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Resolution({ request: r, journey }: { request: MkPartnerRequest; journey: string[] }) {
    const res = r.resolution;
    const ok = r.stage === 'resolution' && res.matched;
    const route: [string, string, 'good' | 'warn' | 'none'][] = [
        ['Permission Row', ok ? 'Resolved' : 'Unavailable', ok ? 'good' : 'none'], ['Matter Jurisdiction', 'Resolved', 'good'], ['Professional Jurisdiction', ok ? 'Resolved' : 'Unavailable', ok ? 'good' : 'none'],
        ['Current Partner Verification', 'Pending next step', 'warn'], ['Conflict Clearance', 'Not started', 'none'], ['Quote & Fees', 'Locked until conflict', 'none'], ['Engagement Instrument', 'Not yet available', 'none'],
    ];

    return (
        <>
            <Head title={`Jurisdiction & Profession Resolution – ${r.reference}`} />
            <DarkHero code="PS-007" crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'My Requests', href: '/partner-services/requests' }, { label: r.reference }]} title="Jurisdiction & Profession Resolution" subtitle="Step 2 of 7 — Resolve the exact professional route for your matter."
                aside={<div className="rounded-[8px] border border-gold-500/60 p-4 text-sm"><p className="flex items-center gap-2 font-bold text-gold-400"><ShieldAlert className="size-5" aria-hidden="true" />PANEL ACTIVE IS NOT MATTER ELIGIBLE.</p><p className="mt-1 text-ink-200">Current matter eligibility requires permission, jurisdiction, current verification and conflict clearance. No payment or professional work can start at this stage.</p></div>} />
            <PsBody>
                <div className="flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs font-semibold">
                    <span className={`flex items-center gap-1 ${ok ? 'text-verified-700' : 'text-risk-600'}`}>{ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Ban className="size-4" aria-hidden="true" />}Permission {ok ? 'resolved' : 'unavailable'}</span>
                    <span className="flex items-center gap-1 text-verified-700"><CheckCircle2 className="size-4" aria-hidden="true" />Jurisdiction confirmed</span>
                    <span className="flex items-center gap-1 text-attested-700"><Clock className="size-4" aria-hidden="true" />Professional verification pending</span>
                    <span className="flex items-center gap-1"><Scale className="size-4" aria-hidden="true" />Conflict before money</span>
                    <span className="flex items-center gap-1 text-ink-500"><Ban className="size-4" aria-hidden="true" />No proposal yet</span>
                </div>
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-gold-300/60 bg-gold-300/40 sm:grid-cols-5">
                    {[['Matter ID', r.intake.matter_id], ['Request type', r.listing?.title ?? r.title], ['Client country', res.client_country], ['Matter country', res.matter_jurisdiction], ['Intended use', r.intake.intended_use]].map(([k, v]) => <div key={k} className="bg-white px-4 py-3"><p className="text-xs text-ink-500">{k}</p><p className="text-sm font-bold">{v}</p></div>)}
                </div>
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="grid gap-5 md:grid-cols-3 lg:col-span-9">
                        <Card number={1} title="Request Summary"><InfoRows dense rows={[['What do you need help with?', r.intake.category?.replace(/-/g, ' ')], ['Brief description', r.intake.description], ['Desired outcome', r.intake.outcome], ['Target timeline', r.intake.timeline], ['Requesting party', r.clientName], ['Additional context', r.intake.parties || '—']]} /></Card>
                        <Card number={2} title="Jurisdiction & Profession Resolution">
                            <InfoRows dense rows={[['Client country', res.client_country], ['Matter jurisdiction', res.matter_jurisdiction], ['Professional practice jurisdiction', res.practice_jurisdiction], ['Primary profession required', res.profession], ['Specialisation', res.specialisation], ['Expected professional output', res.output ?? r.intake.output], ['Intended use of output', res.intended_use ?? r.intake.intended_use], ['Credential class', res.credential_class ?? '—'], ['Proposed arrangement path', res.arrangement_path ?? '—']]} />
                            {ok ? (
                                <div className="mt-3 rounded border border-verified-500/40 bg-verified-50 p-3 text-xs">
                                    <p className="flex items-center justify-between font-bold text-verified-700">Permission Row Matched: {res.row}<span className="rounded-full bg-white px-2">{res.row_status === 'conditional' ? 'Conditional' : 'Resolved'}</span></p>
                                    <InfoRows dense rows={[['Profession', res.profession], ['Activity', res.activity], ['Matter jurisdiction', res.matter_jurisdiction], ['Arrangement path', res.arrangement_path]]} />
                                </div>
                            ) : <Notice tone="bad" className="mt-3">JURISDICTION UNAVAILABLE: no current authorised Permission Row exists for this profession and jurisdiction. No unsupported professional route will be offered.</Notice>}
                            {ok && <p className="mt-3 flex gap-2 rounded bg-attested-50 p-2 text-xs text-attested-700"><TriangleAlert className="size-4 shrink-0" aria-hidden="true" />Arrangement certification and professional assignment still depend on current verification and conflict clearance.</p>}
                        </Card>
                        <Card number={3} title="What This Resolution Means">
                            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-700">
                                <li>{ok ? 'A professional route exists for the stated matter.' : 'No professional route currently exists for the stated matter.'}</li><li>Client country is not the same as matter jurisdiction.</li><li>Panel active is not matter eligible.</li><li>Current professional verification is still required.</li><li>No money or professional work can begin until conflict clearance.</li>
                            </ol>
                            <div className="mt-4"><PsJourney journey={journey} step={2} /></div>
                            <p className="mt-3 flex gap-2 rounded border border-gold-400/60 bg-gold-50 p-2 text-xs"><ShieldCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="text-risk-600">No payment</strong> or professional work can start at this stage. The next step is conflict clearance.</span></p>
                        </Card>
                    </div>
                    <aside className="space-y-4 lg:col-span-3">
                        <Card tone="dark" title="Route Status">
                            <ul className="space-y-2 text-xs">{route.map(([k, v, t]) => <li key={k} className="flex justify-between gap-2"><span>{k}</span><span className={t === 'good' ? 'text-verified-500' : t === 'warn' ? 'text-gold-400' : 'text-ink-400'}>{v}</span></li>)}</ul>
                        </Card>
                        <Card title="Need Help?"><Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openAskQuestion({ subject: `Matter ${r.reference}`, section: 'partner-services' })}><UserRound className="size-4" aria-hidden="true" />Ask a Human Advisor</Button></Card>
                    </aside>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href="/partner-services/request" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to Intake</Link>
                    <Link href="/partner-services/requests" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">Save &amp; Exit</Link>
                    <div className="text-center">
                        <Button type="button" size="lg" disabled={!ok} onClick={() => router.post(`/partner-services/requests/${r.reference}/conflict-check`)} trailingIcon="arrow-right">Send for Conflict Check</Button>
                        <p className="mt-1 text-xs text-ink-500">Next step. No payment. No work starts.</p>
                    </div>
                </div>
            </PsBody>
        </>
    );
}
