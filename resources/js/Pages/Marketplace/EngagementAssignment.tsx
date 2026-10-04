import { Head, Link } from '@inertiajs/react';
import { BarChart3, CalendarDays, CheckCircle2, ClipboardList, Download, Eye, FileText, Headphones, Info, Lock, Scale, ShieldCheck, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, CheckList, FactStrip, InfoRows } from '@/Components/Marketplace/ui';
import { BriefJourney } from '@/Components/Marketplace/Brief';
import type { BriefScope, MkEngagement } from '@/types/marketplace';

export default function EngagementAssignment({ engagement: e, scope }: { engagement: MkEngagement; scope: BriefScope }) {
    const p = e.provider;
    const timeline = [
        ['Assignment Confirmed', e.meta.timeline?.[0]?.at ?? '—', 'Completed'],
        ['Provider Onboarding Started', '', ['assigned'].includes(e.stage) ? 'In Progress' : 'Completed'],
        ['Kick-off / Data Request', '', ['assigned'].includes(e.stage) ? 'Upcoming' : 'Completed'],
        ['Draft Delivery Target', scope.timing?.draft ?? '', ['in_qa', 'released', 'closed', 'accepted'].includes(e.stage) ? 'Completed' : 'Upcoming'],
        ['Final Delivery Target', e.targetDate ?? '', ['closed', 'accepted'].includes(e.stage) ? 'Completed' : 'Upcoming'],
    ];

    return (
        <>
            <Head title={`Provider Assignment – ${e.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'My Marketplace', href: '/marketplace/my' }, { label: 'Provider Assignment Notification' }]} />
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink-900">Provider Assignment Notification</h1>
                        <p className="max-w-3xl text-sm text-ink-600">TBCA has assigned an external specialist provider to deliver your engagement. TBCA remains accountable for the workflow, quality assurance, and issue resolution throughout the delivery lifecycle.</p>
                    </div>
                    <BriefJourney current={4} />
                    <FactStrip items={[
                        { icon: <FileText className="size-4" />, label: 'Engagement ID', value: e.reference },
                        { icon: <ClipboardList className="size-4" />, label: 'Assignment ID', value: e.assignmentRef },
                        { icon: <ShieldCheck className="size-4" />, label: 'BRF ID', value: e.briefRef ?? '—' },
                        { icon: <Users className="size-4" />, label: 'Assignment State', value: <StatusPill status={e.stage === 'assigned' ? 'Assigned' : e.stageLabel} tone="good" /> },
                        { label: 'Gate', value: 'GATE-MP-27' },
                        { icon: <CalendarDays className="size-4" />, label: 'Target Delivery Date', value: e.targetDate },
                    ]} />
                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="space-y-5">
                            <Card title="A. Assigned Provider">
                                {p ? (
                                    <div className="flex gap-4">
                                        <span className="flex h-28 w-24 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-b from-ink-700 to-ink-950 font-serif text-3xl font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2"><p className="font-serif text-xl font-bold text-ink-900">{p.name}</p><Tag tone="info">External Provider</Tag></div>
                                            <InfoRows dense rows={[['Provider Type', 'External Marketplace Provider'], ['Role', `${p.categoryLabel} Specialist`], ['Verification Date', p.lastVerified], ['City / Country', `${p.city}, ${p.country}`]]} />
                                        </div>
                                    </div>
                                ) : <p className="text-sm text-ink-500">Provider assignment in progress.</p>}
                                <p className="mt-3 flex gap-2 rounded bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> The provider is not a TBCA employee. TBCA remains your accountable contracting and QA partner.</p>
                            </Card>
                            <Card title="E. Timeline & Next Steps">
                                <ol className="space-y-2.5 border-l-2 border-verified-500/40 pl-4">
                                    {timeline.map(([t, d, s]) => <li key={t} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-ink-800">{t}</span><span className="flex items-center gap-2 text-xs text-ink-500">{d}<StatusPill status={s} /></span></li>)}
                                </ol>
                            </Card>
                        </div>
                        <div className="space-y-5">
                            <Card title="B. Assignment Scope">
                                <p className="text-xs font-semibold text-ink-900">Scope Summary</p>
                                <p className="text-sm text-ink-600">{scope.summary || e.title}</p>
                                <p className="mt-3 text-xs font-semibold text-ink-900">Approved Access</p>
                                <p className="flex gap-1.5 text-sm text-ink-600"><Lock className="size-4 shrink-0" aria-hidden="true" />Read-only access to buyer-approved brief, selected project documents, and controlled upload workspace.</p>
                                <p className="mt-3 text-xs font-semibold text-ink-900">Service Scope</p>
                                <CheckList items={(e.meta.scope_items ?? scope.scope_items ?? []).slice(0, 5)} />
                                <InfoRows dense className="mt-3" rows={[['QA Standard (Reference)', e.qaStandard], ['Delivery Class', scope.delivery_class ?? 'Standard'], ['Human Review', 'Required']]} />
                            </Card>
                            <Card title="F. What Happens Next">
                                <CheckList items={['TBCA will manage the assigned provider — on-time, high-quality delivery.', 'Delivery will be quality-assured before release.', 'You will be notified of progress and any controlled change requests.', 'Support and disputes remain with TBCA.']} />
                            </Card>
                        </div>
                        <div className="space-y-5">
                            <Card title="C. Commercial & Compliance Status">
                                <ul className="space-y-2 text-sm">
                                    {[['Procurement Approval', 'Approved'], ['Disclosure State', 'Complete'], ['Payment State', 'Paid'], ['Floor Check', 'Pass'], ['Rights & Privacy Checks', 'Confirmed']].map(([k, v]) => <li key={k} className="flex items-center justify-between"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{k}</span><StatusPill status={v} tone="good" /></li>)}
                                </ul>
                                <p className="mt-3 rounded bg-parchment-200 p-2 text-xs text-ink-600">All mandatory commercial and compliance checks have been completed successfully.</p>
                            </Card>
                            <Card title="D. Professional Boundary & Review">
                                <p className="text-xs font-semibold text-ink-900">Professional-Adaptation Requirement</p>
                                <p className="mt-1 flex items-center gap-2 rounded border border-verified-500/30 bg-verified-50 p-2 text-sm text-verified-700"><CheckCircle2 className="size-4" aria-hidden="true" />Not required for current scope</p>
                                <p className="mt-2 text-xs text-ink-600">This assignment does not include regulated or reserved professional conclusions. If the scope changes to include regulated deliverables, the engagement will be escalated to the correct professional route.</p>
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-gold-800"><Scale className="size-4" aria-hidden="true" />TBCA owns process accountability, quality assurance and issue resolution at every step.</p>
                            </Card>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href={`/marketplace/engagements/${e.reference}/progress`} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900"><Eye className="size-4" aria-hidden="true" /> View Progress</Link>
                        <Link href="/marketplace/my" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><BarChart3 className="size-4" aria-hidden="true" /> My Marketplace</Link>
                        <Button type="button" variant="outline" onClick={() => openAskQuestion({ subject: `Engagement ${e.reference}`, section: 'marketplace' })}><Headphones className="size-4" aria-hidden="true" /> Talk to TBCA</Button>
                        <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" /> Download Assignment Summary</Button>
                    </div>
                </div>
            </section>
        </>
    );
}
