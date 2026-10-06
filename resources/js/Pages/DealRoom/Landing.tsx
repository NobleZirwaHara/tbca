import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight, BadgeCheck, BarChart3, Bot, Building2, CalendarClock, CheckCircle2, ClipboardList, Eye, FileLock2, FileSearch, Fingerprint, Gavel, Globe2, Handshake,
    Headphones, KeyRound, Landmark, Layers, Lock, MessagesSquare, Play, Scale, ScrollText, ShieldCheck, Stamp, UserCheck, Users,
} from 'lucide-react';
import { useState } from 'react';
import { openAskQuestion } from '@/Components/AskQuestion';
import EmbeddedServices, { type EmbeddedSection } from '@/Components/Embedded/EmbeddedServices';
import { ButtonLink } from '@/Components/ui/Button';
import { Modal } from '@/Components/ui/Kit';
import type { SharedProps } from '@/types';

const strip = [
    { label: 'MFA and NDA Gate', icon: KeyRound }, { label: 'Role-Based Permissions', icon: Users }, { label: 'Dynamic Watermarking', icon: Stamp },
    { label: 'View and Download Control', icon: Eye }, { label: 'Tamper-Evident Audit Trail', icon: ScrollText }, { label: 'Human Review', icon: UserCheck },
];
const pillars = [
    { title: 'Prepare', body: 'Guided setup, document checklists, structured folders and readiness coaching.', icon: ClipboardList },
    { title: 'Control', body: 'Permissions, staged disclosure, secure viewing, watermarks and access expiry.', icon: Lock },
    { title: 'Explain', body: 'Plain-language document summaries, source-linked answers and risk explanations.', icon: FileSearch },
    { title: 'Score', body: 'Deal Readiness, Data Room Health, compliance gaps and buyer intent signals.', icon: BarChart3 },
    { title: 'Collaborate', body: 'Controlled Q&A, expert reviews, approvals, meetings, tasks and notifications.', icon: MessagesSquare },
    { title: 'Close', body: 'Offer management, conditions precedent, signatures, closing packs and Deal Bible export.', icon: Gavel },
];
const engines = [['Secure Virtual Data Room', FileLock2], ['AI Due Diligence Assistant', Bot], ['African Compliance Layer', Globe2], ['TBCA Expert Marketplace', Users], ['TBCA Trust Passport', BadgeCheck], ['Robotics-Enabled Investor Centre', Layers]] as const;
const audiences = [
    ['Founders and Sellers', 'Prepare documents, manage disclosure and track serious buyer activity.', Building2],
    ['Buyers and Investors', 'Review approved evidence, raise questions and understand deal risk.', Handshake],
    ['Banks and DFIs', 'Access credit-ready evidence, compliance records and due trails.', Landmark],
    ['Lawyers and Advisors', 'Review source documents, clauses, risks and conditions precedent.', Scale],
    ['Government and PPP Teams', 'Manage eligibility, procurement evidence and approvals.', ShieldCheck],
    ['Cross-Border African Deal Teams', 'Use country templates and jurisdiction-specific compliance workflows.', Globe2],
] as const;
const flow = [
    ['Create and Configure', 'Set deal type, roles, country, sector, permissions and timeline.'],
    ['Prepare and Classify', 'Upload, scan, classify, organise and review documents.'],
    ['Quality and Control Access', 'Complete KYC, NDA and access policies before disclosure.'],
    ['Diligence and Negotiate', 'Run Q&A, financial analysis, valuation, risk review and offer management.'],
    ['Close and Archive', 'Track CPs, signatures, completion evidence and the final Deal Bible.'],
];
const stateView = ['Risk Heatmap', 'Missing Documents', 'Outstanding Q&A', 'Approval Workflow', 'Activity Heatmap', 'Buyer Intent Signal (Indicative)', 'Compliance Status', 'Expert Review Status', 'Deal Timeline', 'Next Best Actions'];
const aiRules = [['No Source, No Answer', 'AI answers only from approved documents available to you.'], ['Permission Before Retrieval', 'AI cannot access information outside your permission scope.'], ['Confidence Labels', 'Every answer shows confidence level and source coverage.'], ['Human Approval', 'High-risk outputs require authorised human review.'], ['Complete Audit Record', 'Prompts, responses, sources, edits and approvals recorded.']];
const passport = [['Company Registration', 'Verified'], ['Beneficial Ownership', 'Verified'], ['Directors', 'Verified'], ['Tax Status', 'Verified'], ['Bank Verification', 'Verified'], ['Governance Documents', 'Verified'], ['Financial Highlights', 'Verified'], ['Licences & Permits', 'Pending'], ['Expert Review Badges', 'Verified'], ['Funding Readiness Status', 'Renewal Due']];
const systems = ['Zoho CRM', 'Zoho Books', 'Zoho Sign', 'QuickBooks', 'KYC & KYB Providers', 'E-Signature', 'Data Banks', 'Artificial Intelligence', 'Payment Gateways', 'Secure Cloud Storage'];
const controls = ['Multi-Factor Authentication', 'Role & Attribute-Based Access', 'Folder & File-Level Permissions', 'View-Only Mode', 'Download & Print Restrictions', 'Dynamic Watermarking', 'Encryption in Transit and at Rest', 'Device Trust & Session Controls', 'Legal Hold & Retention', 'Secure Deletion', 'Audit Export', 'Data Residency Options'];

function Card({ title, children, cta, href }: { title: string; children: React.ReactNode; cta?: string; href?: string }) {
    return (
        <section className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-center text-sm font-bold text-ink-900">{title}</h2>
            <div className="flex-1">{children}</div>
            {cta && href && <Link href={href} className="mx-auto mt-3 inline-flex items-center gap-1 rounded border border-gold-500 px-3 py-1 text-xs font-semibold text-ink-900 hover:bg-gold-50">{cta} <ArrowRight className="size-3" aria-hidden /></Link>}
        </section>
    );
}

/** Virtual Deal Room landing (Stage 1 / front-end page). */
export default function Landing({ stages, embedded }: { stages: { code: string; name: string; phase: string }[]; embedded?: EmbeddedSection }) {
    const { auth } = usePage<SharedProps>().props;
    const [video, setVideo] = useState(false);
    const [lifecycle, setLifecycle] = useState(false);
    const demo = () => openAskQuestion({ subject: 'Book a guided Virtual Deal Room demo', section: 'Virtual Deal Room' });

    return (
        <>
            <Head title="Virtual Deal Room" />
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_45%_30%,rgba(212,160,23,0.18),transparent_45%)]" />
                <div className="container-tbca relative grid gap-8 py-12 lg:grid-cols-[1.1fr_1fr]">
                    <div>
                        <p className="text-xs font-bold tracking-wider text-gold-400 uppercase">AI-Enabled Transaction Command Centre</p>
                        <h1 className="mt-3 font-serif text-3xl leading-tight font-bold sm:text-5xl">Prepare, De-Risk and Close African Transactions with <span className="text-gold-400">Confidence</span></h1>
                        <p className="mt-4 max-w-xl text-sm text-ink-200 sm:text-base">A secure Virtual Deal Room that controls confidential documents, guides due diligence, explains risks, tracks buyer activity and moves every authorised party from first interest to final signature.</p>
                        <p className="mt-3 text-sm font-semibold text-gold-300">Built for founders, sellers, buyers, investors, banks, advisors, lawyers and deal teams.</p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <ButtonLink href="/virtual-deal-room/enquiry">Start a Deal Room <ArrowRight className="size-4" aria-hidden /></ButtonLink>
                            <button type="button" onClick={demo} className="inline-flex h-11 items-center rounded-[4px] border border-gold-500 px-5 text-sm font-medium text-parchment-100 hover:bg-gold-500/10">Book a Guided Demo</button>
                            <Link href={auth.user ? '/virtual-deal-room/rooms' : '/login'} className="inline-flex items-center gap-1 text-sm text-parchment-100 hover:text-gold-300">{auth.user ? 'Open My Deal Rooms' : 'Existing Client Sign In'} <ArrowRight className="size-4" aria-hidden /></Link>
                        </div>
                    </div>
                    <div className="rounded-[10px] border border-gold-600/60 bg-ink-900/70 p-4">
                        <div className="flex items-center justify-between"><p className="font-serif text-lg font-bold">Deal Room Set Up</p><span className="rounded border border-gold-500 px-2 py-0.5 text-[0.6875rem] text-gold-300">Explainer Video | 120 seconds</span></div>
                        <p className="text-xs text-ink-300">See how the TBCA Virtual Deal Room works in 120 seconds.</p>
                        <button type="button" onClick={() => setVideo(true)} className="group relative mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-[6px] bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 text-left" aria-label="Play explainer video">
                            <span className="absolute top-6 left-6"><span className="block font-serif text-2xl">TBCA</span><span className="block text-lg tracking-wide">VIRTUAL DEAL ROOM</span><span className="text-sm text-gold-400">Secure. Intelligent. African.</span></span>
                            <span className="flex size-14 items-center justify-center rounded-full bg-parchment-100 text-ink-900 transition group-hover:scale-105"><Play className="size-6" aria-hidden /></span>
                        </button>
                    </div>
                </div>
                <div className="container-tbca relative pb-6">
                    <ul className="grid grid-cols-2 gap-2 rounded-[8px] border border-ink-700 bg-ink-900/60 p-3 sm:grid-cols-3 lg:grid-cols-6">
                        {strip.map(({ label, icon: I }) => <li key={label} className="flex items-center gap-2 text-xs"><I className="size-5 text-gold-400" aria-hidden />{label}</li>)}
                    </ul>
                    <div className="mt-5 grid gap-3 lg:grid-cols-[14rem_1fr]">
                        <div><h2 className="font-serif text-xl font-bold">More Than a Data Room</h2><p className="mt-1 text-sm text-ink-300">The platform helps deal teams know what is missing, what is risky, who must act and what must happen next.</p></div>
                        <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                            {pillars.map(({ title, body, icon: I }) => <li key={title} className="rounded-[6px] bg-parchment-100 p-3 text-ink-800"><I className="mb-1 size-6 text-gold-600" aria-hidden /><p className="font-semibold">{title}</p><p className="text-xs text-ink-600">{body}</p></li>)}
                        </ul>
                    </div>
                </div>
            </section>

            <div className="bg-parchment-200 py-8">
                <div className="container-tbca space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card title="One Platform. Six Connected Engines.">
                            <ul className="grid grid-cols-3 gap-2">{engines.map(([l, I]) => <li key={l} className="rounded border border-parchment-400 p-2 text-center text-[0.6875rem]"><I className="mx-auto mb-1 size-5 text-gold-600" aria-hidden />{l}</li>)}</ul>
                        </Card>
                        <Card title="Built for Every Side of the Transaction" cta="Explore This Audience View" href="/virtual-deal-room/enquiry">
                            <ul className="grid gap-2 sm:grid-cols-2">{audiences.map(([t, b, I]) => <li key={t} className="flex gap-2 text-[0.6875rem]"><I className="size-5 shrink-0 text-gold-600" aria-hidden /><span><strong className="block text-ink-900">{t}</strong>{b}</span></li>)}</ul>
                        </Card>
                        <Card title="From First Interest to Final Signature">
                            <ol className="grid grid-cols-5 gap-1">{flow.map(([t, b], i) => <li key={t} className="text-center text-[0.625rem]"><span className="mx-auto mb-1 flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold">{i + 1}</span><strong className="block text-ink-900">{t}</strong>{b}</li>)}</ol>
                            <button type="button" onClick={() => setLifecycle(true)} className="mx-auto mt-3 flex items-center gap-1 rounded border border-gold-500 px-3 py-1 text-xs font-semibold">View the Full Workflow <ArrowRight className="size-3" aria-hidden /></button>
                        </Card>
                        <Card title="See the State of the Deal in One View" cta="View Live Dashboard Preview" href={auth.user ? '/virtual-deal-room/rooms' : '/login'}>
                            <ul className="grid grid-cols-2 gap-1.5 text-[0.6875rem]">{stateView.map((s) => <li key={s} className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-gold-600" aria-hidden />{s}</li>)}</ul>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card title="AI Assistance with Human Accountability">
                            <ul className="grid grid-cols-5 gap-1">{aiRules.map(([t, b]) => <li key={t} className="text-center text-[0.625rem]"><Fingerprint className="mx-auto mb-1 size-4 text-gold-600" aria-hidden /><strong className="block text-ink-900">{t}</strong>{b}</li>)}</ul>
                        </Card>
                        <Card title="Create a Reusable TBCA Trust Passport">
                            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[0.6875rem]">{passport.map(([l, s]) => <li key={l} className="flex justify-between gap-1"><span>{l}</span><span className={s === 'Verified' ? 'text-verified-700' : s === 'Pending' ? 'text-attested-700' : 'text-risk-700'}>{s}</span></li>)}</ul>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Reuse verified company evidence across approved investor, bank, funder and buyer engagements.</p>
                        </Card>
                        <Card title="Connect Approved Business Systems">
                            <ul className="grid grid-cols-3 gap-1.5">{systems.map((s) => <li key={s} className="rounded border border-parchment-400 px-1 py-1.5 text-center text-[0.625rem]">{s}</li>)}</ul>
                            <p className="mt-2 text-[0.625rem] text-ink-500">Consent, access scopes, sync status and source lineage remain visible and auditable.</p>
                        </Card>
                        <Card title="Enterprise Controls for Confidential Transactions">
                            <ul className="grid grid-cols-3 gap-1.5">{controls.map((s) => <li key={s} className="flex items-start gap-1 text-[0.625rem]"><ShieldCheck className="size-3.5 shrink-0 text-gold-600" aria-hidden />{s}</li>)}</ul>
                        </Card>
                    </div>
                    <section className="flex flex-col items-center gap-4 rounded-[10px] bg-ink-950 p-6 text-center text-parchment-100 lg:flex-row lg:text-left">
                        <div className="flex-1"><h2 className="font-serif text-2xl font-bold">Ready to Prepare and Manage Your Transaction with Confidence?</h2><p className="text-sm text-ink-300">Create a secure deal workspace, request controlled access or speak to TBCA about a guided transaction setup.</p></div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <ButtonLink href="/virtual-deal-room/enquiry">Start a Deal Room</ButtonLink>
                            <button type="button" onClick={demo} className="inline-flex h-11 items-center rounded-[4px] border border-ink-600 px-5 text-sm">Book a Guided Demo</button>
                            <button type="button" onClick={() => openAskQuestion({ subject: 'Talk to TBCA about a transaction', section: 'Virtual Deal Room' })} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-600 px-5 text-sm"><Headphones className="size-4" aria-hidden /> Talk to TBCA</button>
                        </div>
                    </section>
                </div>
            </div>

            <EmbeddedServices section={embedded} intro="Fixed-price services that run inside the Virtual Deal Room: provisioning, access control, indexing, watermarking, Q&A, disclosure and closing support." />

            <Modal open={video} onClose={() => setVideo(false)} title="Deal Room Set Up — 120 seconds" size="lg">
                <ol className="space-y-2 text-sm">
                    {['Enquiry & qualification (Stage A) — preliminary conflict, sanctions and fit checks.', 'Diagnostic & proposal (Stage B) — readiness score, risk profile and fee estimate.', 'Mandate & payment gate (Stage C) — signed engagement and cleared deposit unlock the room.', 'Configure (Stage 0) — roles, security, template and folders.', 'Data room, qualification and controlled access (Stages 1–4).', 'Diligence, finance, valuation and negotiation (Stages 5–10).', 'Legal, CPs, signing and close (Stages 11–13), then handover and archive (14–15).'].map((s, i) => <li key={i} className="flex gap-2"><CalendarClock className="size-4 shrink-0 text-gold-600" aria-hidden />{s}</li>)}
                </ol>
            </Modal>
            <Modal open={lifecycle} onClose={() => setLifecycle(false)} title="Full transaction lifecycle (A–C and 0–15)" size="lg">
                <ol className="grid gap-1.5 sm:grid-cols-2">
                    {stages.map((s) => <li key={s.code} className="flex gap-2 text-xs"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 font-bold">{s.code}</span><span><strong className="block">{s.name}</strong><span className="text-ink-500">{s.phase}</span></span></li>)}
                </ol>
                <p className="mt-3 text-xs text-ink-500">If payment, authority, consent, permission, mandatory evidence or human approval is missing, the next stage remains locked.</p>
                <Link href="/virtual-deal-room/enquiry" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700">Start with an enquiry<ArrowRight className="size-4" aria-hidden /></Link>
            </Modal>
        </>
    );
}
