import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Lock, UserCheck } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import GatePanel from '@/Components/DealRoom/GatePanel';
import RoomShell, { roomUrl, stageHref } from '@/Components/DealRoom/RoomShell';
import { DataRoomBuildPanel, IntakePanel } from '@/Components/DealRoom/stages/DataPanels';
import { ArchivePanel, ConditionsPanel, HandoverPanel, LegalPanel, NegotiationPanel, OffersPanel, RenewalPanel, SigningPanel } from '@/Components/DealRoom/stages/DealPanels';
import { AccessPanel, CounterpartyPanel, InvitationsPanel } from '@/Components/DealRoom/stages/PartyPanels';
import { CreatedPanel, DiagnosticPanel, MandatePanel, OnboardingPanel } from '@/Components/DealRoom/stages/PreparePanels';
import QaPanel from '@/Components/DealRoom/stages/QaPanel';
import { AiNote, AuditPanel, BlockGrid, KvList } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import type { Block, Gate, RoomPageProps, StageInfo } from '@/types/deal-room';

const TITLES: Record<string, [string, string]> = {
    diagnostic: ['Deal Diagnostic and Commercial Proposal', 'Complete the diagnostic assessment to generate your readiness score, risk profile, transaction pathway and commercial proposal.'],
    mandate: ['Mandate, Engagement and Payment Gate', 'Conflict clearance, party-side designation, engagement pack, AI disclosure, POPIA notice, fee schedule, signatures, deposit invoice, payment reconciliation and Stage 0 lock.'],
    created: ['Deal Room Created Successfully!', 'Your secure transaction workspace is ready. Invite participants and start collaborating.'],
    'sponsor-onboarding': ['Sponsor Secure Onboarding', 'Complete your secure onboarding to activate full sponsor privileges and control your deal room.'],
    'data-room-build': ['Data Room Build & Document Upload', 'Build your data room structure and upload documents. Organise, secure and prepare for participant access.'],
    'ai-intake-review': ['AI Document Intake Review & Release Queue', 'AI has processed your uploaded documents. Review findings, complete human review and release to participants.'],
    'counterparty-qualification': ['Counterparty Qualification & Invitation', 'Qualify counterparties, set access permissions and invite participants to your deal room securely.'],
    'review-and-send-invitations': ['Review & Send Invitations', 'Review the invitation list, access settings and messages before sending invitations to qualified counterparties.'],
    'controlled-access-and-disclosure': ['Controlled Access & Disclosure Management', 'Manage participant access, apply disclosure controls and monitor information security in real time.'],
    'ai-qa-assistant': ['AI Q&A Assistant', 'Ask questions about the data room. AI answers are grounded only in authorised documents and highlight exact sources. Sensitive items require human review.'],
    'financial-analysis': ['Financial Analysis & Quality of Earnings', 'Reviewing financial health, earnings quality, working capital, debt and disputed items.'],
    'valuation-price-bridge': ['Valuation and Price Bridge', 'Reconcile buyer, seller and neutral value positions using governed assumptions, sensitivity testing and evidence-backed valuation logic.'],
    'negotiation-preparation': ['Negotiation Preparation', 'Prepare your negotiation strategy, positions, terms and documentation. Coordinate your team before formal negotiations begin.'],
    'live-negotiation': ['Live Negotiation Room', 'Secure live negotiation workspace for buyers, sellers and deal facilitators.'],
    'offer-term-sheet-management': ['Offer and Term-Sheet Management', 'Manage offers, counteroffers, term-sheet versions, economics, conditions and approval authority before legal documentation begins.'],
    'legal-documentation': ['Legal Documentation', 'Draft, review and finalise the legal documentation for the transaction.'],
    'conditions-precedent': ['Conditions Precedent and Closing Readiness', 'Track, validate and close all conditions precedent to achieve closing readiness.'],
    'signing-completion-close': ['Signing, Completion and Financial Close', 'Execute signatures, complete the transaction and achieve financial close.'],
    'post-closing-handover': ['Post-Closing Handover and Integration', 'Transfer closing outputs, launch integration workstreams and activate ongoing monitoring.'],
    'archive-monitoring-exit': ['Archive, Monitoring, Renewals and Exit', 'The room is under archive control, with monitoring active. Manage retention, renewals, export options, or controlled exit with verified deletion.'],
    'archive-renewal': ['Archive Renewal', 'Extend controlled archive access, monitoring continuity and retention services for the closed transaction record.'],
};

interface Props extends RoomPageProps {
    page: string;
    stage: StageInfo;
    gate: Gate;
    blocks: Block[];
    data: any;
}

function Body({ page, room, data, gate }: Pick<Props, 'page' | 'room' | 'data' | 'gate'>) {
    switch (page) {
        case 'diagnostic': return <DiagnosticPanel room={room} data={data} />;
        case 'mandate': return <MandatePanel room={room} data={data} gate={gate} />;
        case 'created': return <CreatedPanel room={room} data={data} />;
        case 'sponsor-onboarding': return <OnboardingPanel gate={gate} />;
        case 'data-room-build': return <DataRoomBuildPanel room={room} data={data} />;
        case 'ai-intake-review': return <IntakePanel room={room} data={data} />;
        case 'counterparty-qualification': return <CounterpartyPanel room={room} data={data} />;
        case 'review-and-send-invitations': return <InvitationsPanel room={room} data={data} />;
        case 'controlled-access-and-disclosure': return <AccessPanel room={room} data={data} />;
        case 'ai-qa-assistant': return <QaPanel room={room} data={data} />;
        case 'live-negotiation': return <NegotiationPanel room={room} data={data} />;
        case 'offer-term-sheet-management': return <OffersPanel room={room} data={data} />;
        case 'legal-documentation': return <LegalPanel room={room} data={data} />;
        case 'conditions-precedent': return <ConditionsPanel room={room} data={data} />;
        case 'signing-completion-close': return <SigningPanel room={room} data={data} />;
        case 'post-closing-handover': return <HandoverPanel room={room} data={data} />;
        case 'archive-monitoring-exit': return <ArchivePanel room={room} data={data} />;
        case 'archive-renewal': return <RenewalPanel room={room} data={data} />;
        default: return null;
    }
}

/** Secondary screens that belong to the same stage. */
const SIBLINGS: Record<string, [string, string][]> = {
    '0': [['created', 'Deal Room Created']],
    '2': [['data-room-build', 'Data Room Build'], ['ai-intake-review', 'AI Intake Review']],
    '3': [['counterparty-qualification', 'Qualification'], ['review-and-send-invitations', 'Review & Send Invitations']],
    '15': [['archive-monitoring-exit', 'Archive & Monitoring'], ['archive-renewal', 'Archive Renewal']],
};

/** One template for every transaction stage screen: hero, stepper, stage body, analysis blocks, gate and governance. */
export default function StagePage({ room, audit, page, stage, gate, blocks, data }: Props) {
    const [title, description] = TITLES[page] ?? [stage.name, stage.output];
    const prev = room.stepper[room.stepper.findIndex((s) => s.code === stage.code) - 1];
    const nextUnlocked = stage.next && room.stepper.find((s) => s.code === stage.next?.code)?.status !== 'locked';
    const locked = stage.status === 'locked';

    return (
        <RoomShell
            room={room}
            title={title}
            eyebrow={`Stage ${stage.code}`}
            description={description}
            activeStage={stage.code}
            badge={<StatusPill status={stage.status === 'unlocked' ? 'in_progress' : stage.status} tone={stage.status === 'completed' ? 'good' : stage.status === 'locked' ? 'bad' : 'info'} />}
            actionBar={
                <>
                    <Link href={roomUrl(room.slug)} className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 hover:underline"><Bookmark className="size-4" aria-hidden /> Save and Continue Later</Link>
                    {prev && prev.code !== 'A' && <Link href={stageHref(room.slug, prev)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 px-3 text-[0.8125rem] hover:border-ink-900"><ArrowLeft className="size-4" aria-hidden /> Back to {prev.name}</Link>}
                    <Button type="button" size="sm" variant="outline" onClick={() => openAskQuestion({ subject: `Human review request: ${room.name} — Stage ${stage.code} ${stage.name}`, section: 'Virtual Deal Room' })}><UserCheck className="size-4" aria-hidden /> Request Human Review</Button>
                    {stage.next && (nextUnlocked ? (
                        <Link href={stageHref(room.slug, { code: stage.next.code, page: stage.next.page })} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-400">Continue to {stage.next.name} (Stage {stage.next.code}) <ArrowRight className="size-4" aria-hidden /></Link>
                    ) : (
                        <span className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-parchment-300 px-4 text-[0.8125rem] font-semibold text-ink-500" title={stage.lockRule}><Lock className="size-4" aria-hidden /> Stage {stage.next.code} locked</span>
                    ))}
                </>
            }
        >
            {SIBLINGS[stage.code] && (
                <nav aria-label="Stage screens" className="flex flex-wrap gap-2">
                    {SIBLINGS[stage.code].map(([p, label]) => (
                        <Link key={p} href={roomUrl(room.slug, p)} className={`rounded-full border px-3 py-1 text-xs ${p === page ? 'border-gold-500 bg-gold-50 font-semibold text-gold-800' : 'border-parchment-500 bg-white text-ink-600'}`}>{label}</Link>
                    ))}
                    {stage.code === '0' && <Link href={roomUrl(room.slug, 'setup/review-and-create')} className="rounded-full border border-parchment-500 bg-white px-3 py-1 text-xs text-ink-600">Set-up wizard</Link>}
                </nav>
            )}

            {locked ? (
                <Panel>
                    <div className="flex flex-col items-center py-10 text-center">
                        <Lock className="mb-3 size-10 text-ink-400" aria-hidden />
                        <h2 className="font-serif text-xl font-bold">Stage {stage.code} is locked</h2>
                        <p className="mt-2 max-w-xl text-sm text-ink-600">{stage.lockRule}</p>
                        <p className="mt-1 text-sm text-ink-600">Start condition: {stage.start}</p>
                        <Link href={stageHref(room.slug, { code: room.currentStage.code, page: room.currentStage.page })} className="mt-4 font-semibold text-gold-700 underline">Go to the current stage: {room.currentStage.name}</Link>
                    </div>
                </Panel>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="min-w-0 space-y-5">
                        <Body page={page} room={room} data={data} gate={gate} />
                        <BlockGrid blocks={blocks} />
                    </div>
                    <aside className="space-y-5">
                        <GatePanel room={room} stage={stage} gate={gate} />
                        <Panel title="Stage Governance">
                            <KvList rows={[['Stage State', stage.status === 'unlocked' ? 'In progress' : stage.status], ['Start Condition', stage.start], ['Primary Output', stage.output], ['Revenue Logic', stage.revenue], ['Unlocked', stage.unlockedAt ?? '—']]} />
                        </Panel>
                        <AiNote>I can summarise this stage, flag missing evidence and draft next actions from authorised documents only.</AiNote>
                        <AuditPanel audit={audit} />
                    </aside>
                </div>
            )}
        </RoomShell>
    );
}
