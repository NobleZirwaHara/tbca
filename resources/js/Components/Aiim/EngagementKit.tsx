import { Link } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Progress, Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { Advisor, Engagement } from '@/types/aiim';
import { Chip, levelTone } from './Chips';
import AiimPage, { type Crumb, RailBox, SelectionBox } from './Shell';
import { zar2 } from './format';

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    const cls = { sm: 'size-9 text-xs', md: 'size-12 text-sm', lg: 'size-20 text-xl' }[size];
    return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 font-bold text-gold-300 ${cls}`} aria-hidden="true">{initials}</span>;
}

export function AdvisorInline({ advisor }: { advisor: Advisor | null }) {
    if (!advisor) return <span className="text-xs text-ink-500">Advisor to be assigned</span>;
    return (
        <span className="flex items-center gap-2">
            <Avatar name={advisor.name} size="sm" />
            <span className="text-xs"><strong className="block text-sm text-ink-900">{advisor.name}</strong><span className="block text-referenced-700">{advisor.title}</span>{advisor.years} years advisory experience</span>
        </span>
    );
}

export function HumanLed({ text = 'All advisory engagements are led by experienced TBCA professionals. No AI-only advice.', title = 'Human-led advisory' }: { text?: string; title?: string }) {
    return (
        <div className="flex max-w-xs gap-2 rounded-[8px] border border-verified-500/40 bg-verified-50 p-3 text-xs">
            <UserRound className="size-6 shrink-0 text-verified-700" />
            <span><strong className="block tracking-wide text-verified-700 uppercase">{title}</strong>{text}</span>
        </div>
    );
}

export function AiGuidance({ children }: { children: ReactNode }) {
    return (
        <div className="flex max-w-xs gap-2 rounded-[8px] border border-verified-500/40 bg-white p-3 text-xs">
            <ShieldCheck className="size-6 shrink-0 text-verified-700" />
            <span><strong className="block tracking-wide text-verified-700 uppercase">AI Guidance</strong>{children}</span>
        </div>
    );
}

/** Engagement header used on letter / signature / deposit screens. */
export function EngagementHeader({ e }: { e: Engagement }) {
    return (
        <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
            <div><p className="text-ink-500">Engagement</p><p className="font-semibold">{e.title}</p><p className="mt-1">ID: <span className="font-semibold text-referenced-700">{e.reference}</span></p></div>
            <div><p className="text-ink-500">Client</p><p className="font-semibold">{e.client.name}</p><p>{e.client.company}</p><p>{e.client.email}</p></div>
            <div><p className="text-ink-500">Advisor</p><AdvisorInline advisor={e.advisor} /></div>
            <div><p className="text-ink-500">Date Issued</p><p className="font-semibold">{e.quote?.issued ?? e.created}</p><p className="mt-1 text-ink-500">Valid Until</p><p className="font-semibold">{e.quote?.valid_until ?? '—'}</p></div>
            <div><p className="text-ink-500">Engagement Fee (ex. VAT)</p><p className="text-xl font-bold text-referenced-700">{zar2(e.fee)}</p><p className="text-ink-500">Total (incl. VAT 15%)</p><p className="font-semibold">{zar2(e.feeTotal)}</p></div>
        </section>
    );
}

/** Purple journey tracker: Request → … → Accepted. */
export function Journey({ e }: { e: Engagement }) {
    return (
        <ol className="mb-4 flex flex-wrap gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
            {e.journey.map((s, i) => {
                const n = i + 1;
                const done = n < e.journeyIndex;
                const cur = n === e.journeyIndex;
                return (
                    <li key={s} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium ${done ? 'bg-verified-50 text-verified-700' : cur ? 'bg-referenced-500 text-white' : 'bg-parchment-200 text-ink-500'}`} aria-current={cur ? 'step' : undefined}>
                        {done ? <CheckCircle2 className="size-3.5" /> : <span>{n}</span>}{s}
                    </li>
                );
            })}
        </ol>
    );
}

export const MANDATE_LINKS = (ref: string): [string, string][] => [
    ['Mandate Workspace', `/aiim/workspace/engagements/${ref}`],
    ['Verification', `/aiim/workspace/engagements/${ref}/verification`],
    ['Deep Dive', `/aiim/workspace/engagements/${ref}/deep-dive`],
    ['Packaging', `/aiim/workspace/engagements/${ref}/packaging`],
    ['Introductions', `/aiim/workspace/engagements/${ref}/introductions`],
    ['Handoffs', `/aiim/workspace/engagements/${ref}/handoff/dd`],
    ['Delivery', `/aiim/workspace/engagements/${ref}/delivery`],
    ['Ledger', `/aiim/workspace/engagements/${ref}/ledger`],
];

/**
 * Frame for every mandate-stage screen (P50–P70): header strip with mandate, client,
 * advisor, engagement status and value, AI guidance, engagement snapshot and tabs.
 */
export function MandateFrame({
    e, title, heading, description, guidance, stage, statusLabel, progress, tabs, tab, onTab, children, footer, crumbs = [],
}: {
    e: Engagement;
    title: string;
    heading?: ReactNode;
    description: string;
    guidance: ReactNode;
    stage: string;
    statusLabel?: string;
    progress?: number;
    tabs?: string[];
    tab?: string;
    onTab?: (t: string) => void;
    children: ReactNode;
    footer?: ReactNode;
    crumbs?: Crumb[];
}) {
    const ref = e.mandate ?? e.reference;
    const status = statusLabel ?? (e.status === 'paused' ? 'Paused' : e.status === 'closed' ? 'Completed' : 'In Progress');
    const pct = progress ?? e.progress;
    return (
        <AiimPage
            title={title}
            heading={heading}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Mandates', href: '/aiim/workspace/engagements' }, { label: ref, href: `/aiim/workspace/engagements/${e.reference}` }, ...crumbs, { label: title }]}
            description={description}
            notice={<AiGuidance>{guidance}</AiGuidance>}
            accent="purple"
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Engagement Snapshot">
                        <dl className="space-y-1.5 text-xs">
                            {[['Mandate ID', ref], ['Stage', stage], ['Current Step', title], ['Advisor', e.advisor?.name ?? '—'], ['Mandate Start', e.start ?? '—'], ['Deposit Status', e.depositPaid ? 'Paid' : 'Not paid']].map(([k, v]) => <div key={k}><dt className="text-ink-400">{k}</dt><dd className={k === 'Mandate ID' ? 'font-semibold text-referenced-500' : 'font-medium'}>{v}</dd></div>)}
                        </dl>
                    </RailBox>
                    <RailBox title="Mandate Stages">
                        <ul className="space-y-0.5 text-xs">{MANDATE_LINKS(e.reference).map(([l, h]) => <li key={h}><Link href={h} className="block rounded px-2 py-1 text-parchment-200 hover:bg-ink-800">{l}</Link></li>)}</ul>
                        <ButtonLink href="/aiim/workspace" size="sm" variant="outline-light" className="mt-3 w-full">Return to Workspace</ButtonLink>
                    </RailBox>
                </>
            }
        >
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <div><p className="text-ink-500">Mandate</p><p className="font-semibold">{e.title}</p><p className="mt-1">Mandate ID: <span className="font-semibold text-referenced-700">{ref}</span></p></div>
                <div><p className="text-ink-500">Client</p><p className="font-semibold">{e.client.name}</p><p>{e.client.company}</p><p>{e.client.email}</p></div>
                <div><p className="text-ink-500">Advisor</p><AdvisorInline advisor={e.advisor} /></div>
                <div><p className="text-ink-500">Engagement Status</p><Chip tone={levelTone(status)} className="uppercase">{status}</Chip><p className="mt-1">Stage: {stage}</p><p>Progress: {pct}%</p><Progress value={pct} className="mt-1" /></div>
                <div>
                    <p className="text-ink-500">Engagement Value (ex. VAT)</p><p className="text-lg font-bold text-referenced-700">{zar2(e.fee)}</p>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                        <span><span className="block text-ink-500">Deposit ({e.quote?.deposit_percent ?? 50}%)</span>{zar2(e.deposit)} {e.depositPaid && <span className="text-verified-700">Paid</span>}</span>
                        <span><span className="block text-ink-500">Balance Due</span><strong>{zar2(e.balancePaid ? 0 : e.fee - (e.depositPaid ? e.deposit : 0))}</strong></span>
                    </div>
                </div>
            </section>
            {tabs && tab && onTab && <Tabs className="mb-4" tabs={tabs.map((t) => ({ key: t, label: t }))} value={tab} onChange={onTab} />}
            {children}
            {footer && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">{footer}</div>}
        </AiimPage>
    );
}
