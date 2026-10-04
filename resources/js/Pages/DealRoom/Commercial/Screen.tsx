import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bot, Briefcase, Building2, Globe2, Receipt, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ChangeScreen, ClosingScreen, DisputeScreen, FailedScreen, OverageScreen, RefundScreen, RestartScreen, StatementScreen, SubscriptionScreen, ThirdPartyScreen, UsageScreen } from '@/Components/DealRoom/commercial/BillingScreens';
import { ConfirmationScreen, DepositScreen, EngagementScreen, EstimateScreen, FeeBreakdownScreen, GateUnlockScreen, QuoteScreen, ScopeScreen } from '@/Components/DealRoom/commercial/PreMandate';
import { roomUrl, StageStepper } from '@/Components/DealRoom/RoomShell';
import { AuditPanel } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import type { RoomPageProps } from '@/types/deal-room';

interface Props extends RoomPageProps {
    screen: string;
    area: 'commercial' | 'billing';
    meta: { code: string; title: string };
    commercial: Record<string, string | null>;
    data: any;
}

const DESCRIPTIONS: Record<string, string> = {
    'preliminary-estimate': 'Get a non-binding estimate of fees to plan your transaction with confidence.',
    'formal-quotation': 'Receive a formal, binding quotation for the transaction advisory mandate.',
    'fee-breakdown': 'Transparent explanation of the quotation basis, benchmarks and calculations.',
    'scope-acceptance': 'Review the proposed scope of work and accept to authorise the mandate and proceed.',
    'engagement-acceptance': 'Review and sign the engagement terms, disclosures and mandate controls to activate the transaction advisory engagement.',
    'deposit-checkout': 'Review your deposit invoice, fees and charges before proceeding to secure payment.',
    'secure-payment': 'Authorise your deposit payment using a secure, tokenised payment gateway.',
    'payment-confirmation': 'Your payment has been received and processed. Review settlement details and entitlement status.',
    'invoice-and-receipt': 'View the final tax invoice, receipt allocation and immutable billing documents for your payment.',
    'stage-gate-unlock': 'Review mandatory prerequisites, lock status and newly enabled actions before opening the next operational stage.',
    'usage-dashboard': 'Track plan consumption, entitlement usage and projected overages for the active deal room.',
    'overage-alert': 'Review projected overages, exact additional charges and upgrade options before approval.',
    'change-request': 'Review the proposed scope change, timing impact, risk and revised commercial entitlement before acceptance.',
    'third-party-approval': 'Review external provider credentials, landed cost, administration margin, cancellation terms and prepayment before approval.',
    'monthly-statement': 'Review the monthly billing summary, activity, payments, balances and commercial status for your transaction.',
    'failed-payment': 'Your recent payment could not be processed. Update payment details to avoid interruptions.',
    'refund-request': 'Submit a refund request for eligible payments. All requests are reviewed before approval.',
    'fee-dispute': 'Raise and manage a dispute on fees, charges or commercial terms.',
    'transaction-pause': 'Review the reason for the pause and take the required actions to resume.',
    'transaction-restart': 'Review the restart requirements and resume the paused transaction.',
    'closing-invoice': 'Review the final invoice and complete payment to close the mandate.',
    'post-close-subscription': 'Manage your post-close subscription, entitlements, billing and support access.',
};

const PILL: Record<string, [string, string]> = {
    'failed-payment': ['Action Required', 'border-risk-500 text-risk-700'], 'refund-request': ['Action Required', 'border-risk-500 text-risk-700'], 'fee-dispute': ['Action Required', 'border-risk-500 text-risk-700'],
    'transaction-pause': ['Action Required', 'border-risk-500 text-risk-700'], 'transaction-restart': ['Action Required', 'border-risk-500 text-risk-700'],
    'closing-invoice': ['Post-Mandate', 'border-controlled-500 text-controlled-700'], 'post-close-subscription': ['Subscription', 'border-verified-500 text-verified-700'],
};
const COMMERCIAL_CONTROL = ['stage-gate-unlock', 'usage-dashboard', 'overage-alert', 'change-request', 'third-party-approval', 'monthly-statement'];

function Body({ screen, room, data, commercial }: Pick<Props, 'screen' | 'room' | 'data' | 'commercial'>) {
    switch (screen) {
        case 'preliminary-estimate': return <EstimateScreen room={room} data={data} />;
        case 'formal-quotation': return <QuoteScreen room={room} data={data} commercial={commercial} />;
        case 'fee-breakdown': return <FeeBreakdownScreen room={room} data={data} commercial={commercial} />;
        case 'scope-acceptance': return <ScopeScreen room={room} data={data} commercial={commercial} />;
        case 'engagement-acceptance': return <EngagementScreen room={room} data={data} commercial={commercial} />;
        case 'deposit-checkout': return <DepositScreen room={room} data={data} />;
        case 'secure-payment': return <DepositScreen room={room} data={data} secure />;
        case 'payment-confirmation': return <ConfirmationScreen room={room} data={data} />;
        case 'invoice-and-receipt': return <ConfirmationScreen room={room} data={data} receipt />;
        case 'stage-gate-unlock': return <GateUnlockScreen room={room} data={data} />;
        case 'usage-dashboard': return <UsageScreen room={room} data={data} />;
        case 'overage-alert': return <OverageScreen room={room} data={data} />;
        case 'change-request': return <ChangeScreen room={room} data={data} />;
        case 'third-party-approval': return <ThirdPartyScreen room={room} data={data} />;
        case 'monthly-statement': return <StatementScreen room={room} data={data} />;
        case 'failed-payment': return <FailedScreen room={room} data={data} />;
        case 'transaction-pause': return <FailedScreen room={room} data={data} pause />;
        case 'transaction-restart': return <RestartScreen room={room} data={data} />;
        case 'refund-request': return <RefundScreen room={room} data={data} />;
        case 'fee-dispute': return <DisputeScreen room={room} data={data} />;
        case 'closing-invoice': return <ClosingScreen room={room} data={data} />;
        case 'post-close-subscription': return <SubscriptionScreen room={room} data={data} />;
        default: return null;
    }
}

const NAV: [string, string][] = [
    ['commercial/preliminary-estimate', 'Estimate'], ['commercial/formal-quotation', 'Quotation'], ['commercial/fee-breakdown', 'Fee Breakdown'], ['commercial/scope-acceptance', 'Scope'], ['commercial/engagement-acceptance', 'Engagement'], ['commercial/deposit-checkout', 'Deposit'],
    ['billing/usage-dashboard', 'Usage'], ['billing/overage-alert', 'Overage'], ['billing/change-request', 'Change Request'], ['billing/third-party-approval', 'Third Party'], ['commercial/monthly-statement', 'Statement'],
    ['billing/refund-request', 'Refund'], ['billing/fee-dispute', 'Dispute'], ['billing/transaction-pause', 'Pause'], ['commercial/closing-invoice', 'Closing Invoice'], ['commercial/post-close-subscription', 'Subscription'],
];

/** One template for all commercial and billing screens (VDR-029 to VDR-050). */
export default function CommercialScreen({ room, audit, screen, area, meta, commercial, data }: Props) {
    const pill = PILL[screen] ?? (COMMERCIAL_CONTROL.includes(screen) ? ['Commercial Control', 'border-ink-400 text-ink-700'] : ['Pre-Mandate (A–C)', 'border-controlled-500 text-controlled-700']);
    const current = `${area}/${screen}`;
    return (
        <>
            <Head title={`${meta.title} — ${room.name}`} />
            <section className="bg-parchment-100">
                <div className="container-tbca grid gap-5 py-6 lg:grid-cols-[1fr_minmax(0,36rem)_18rem]">
                    <div>
                        <p className="text-xs font-semibold text-verified-700"><Link href="/virtual-deal-room/rooms" className="hover:underline">Virtual Deal Room</Link> / <Link href={roomUrl(room.slug)} className="hover:underline">{room.name}</Link> / <span className="text-gold-700">{meta.title}</span></p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="font-serif text-2xl font-bold sm:text-3xl"><span className="text-gold-600">{meta.code}</span> {meta.title}</h1>
                            <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${pill[1]}`}>{pill[0]}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink-600">{DESCRIPTIONS[screen]}</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {[['Role-Based Access', Users], ['Source-Grounded AI', Bot], ['Human Review', UserCheck], ['Audit Trail', ShieldCheck]].map(([l, I]) => { const Ico = I as typeof Users; return <li key={l as string} className="inline-flex items-center gap-1 rounded bg-ink-950 px-2 py-1 text-[0.6875rem] text-parchment-100"><Ico className="size-3.5 text-gold-400" aria-hidden />{l as string}</li>; })}
                        </ul>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 rounded-[8px] bg-ink-950 p-4 text-xs text-parchment-100 sm:grid-cols-4">
                        <div><dt className="flex items-center gap-1 text-gold-400"><Briefcase className="size-3.5" aria-hidden />Deal Room</dt><dd className="mt-1 font-semibold">{room.name}</dd></div>
                        <div><dt className="flex items-center gap-1 text-gold-400"><Building2 className="size-3.5" aria-hidden />Company</dt><dd className="mt-1 font-semibold">{room.company}</dd></div>
                        <div><dt className="flex items-center gap-1 text-gold-400"><Receipt className="size-3.5" aria-hidden />Transaction</dt><dd className="mt-1">{room.transactionType}</dd></div>
                        <div><dt className="flex items-center gap-1 text-gold-400"><Globe2 className="size-3.5" aria-hidden />Country</dt><dd className="mt-1">{room.country}</dd></div>
                        <div><dt className="text-gold-400">Reference</dt><dd className="mt-1">{room.reference}</dd></div>
                        <div><dt className="text-gold-400">Currency</dt><dd className="mt-1">ZAR (primary) · USD (secondary)</dd></div>
                        <div className="col-span-2"><dt className="text-gold-400">Stage</dt><dd className="mt-1">Stage {room.currentStage.code} — {room.currentStage.name}</dd></div>
                    </dl>
                    <aside className="rounded-[8px] bg-ink-950 p-4 text-xs text-parchment-100">
                        <p className="font-semibold text-gold-300">AI Deal Assistant — Michaela <span className="ml-1 text-verified-500">● Online</span></p>
                        <p className="mt-2 rounded bg-parchment-100 p-2 text-ink-800">I can explain this screen, the pricing logic and what happens next. All fees are shown before acceptance.</p>
                        <Button type="button" size="sm" variant="outline-light" className="mt-2 w-full" onClick={() => openAskQuestion({ subject: `${meta.code} ${meta.title}: question about ${room.name}`, section: 'Virtual Deal Room' })}>Ask about {meta.title}</Button>
                        <p className="mt-2 text-[0.6875rem] text-ink-300">AI cannot approve fees or authorise payments. Human approval is required.</p>
                    </aside>
                </div>
            </section>
            <StageStepper room={room} active={room.currentStage.code} />
            <div className="bg-parchment-200 py-6">
                <div className="container-tbca space-y-5">
                    <nav aria-label="Commercial screens" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
                        {NAV.map(([href, label]) => <Link key={href} href={roomUrl(room.slug, href)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${href === current ? 'border-gold-500 bg-gold-50 font-semibold text-gold-800' : 'border-parchment-500 bg-white text-ink-600 hover:border-gold-400'}`}>{label}</Link>)}
                    </nav>
                    <Body screen={screen} room={room} data={data} commercial={commercial} />
                    <AuditPanel audit={audit} title="Evidence Created & Audit Trail" />
                    <Link href={roomUrl(room.slug)} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline"><ArrowLeft className="size-4" aria-hidden /> Back to the deal room</Link>
                </div>
            </div>
        </>
    );
}
