import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity, AlertTriangle, BarChart3, Briefcase, CalendarClock, ClipboardCheck, ClipboardList, Cpu, CreditCard, FileText, FolderLock, Gauge, GitCompare,
    Handshake, LayoutDashboard, LifeBuoy, ListChecks, LogOut, MessageCircle, Network, Receipt, Scale, ShieldAlert, ShieldCheck, SlidersHorizontal, Truck, Users, Wallet,
} from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import type { Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { TechHeader } from '@/types/advisory';
import { Tracker } from '@/Components/Advisory/ui';
import { StatusPill } from '@/Components/ui/Kit';

export const ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'Project Advisory',
        items: [
            { label: 'Mandate Control Tower', href: '/admin/advisory', icon: LayoutDashboard },
            { label: 'Stop-Now Ladder', href: '/admin/advisory/stop-now', icon: ShieldAlert },
        ],
    },
    {
        title: 'Services Governance',
        items: [
            { label: 'Canonical Vehicle Register', href: '/admin/advisory/vehicles', icon: Briefcase },
            { label: 'Taxonomy Crosswalk', href: '/admin/advisory/crosswalk', icon: Network },
            { label: 'Sprint Disposition', href: '/admin/advisory/dispositions', icon: ListChecks },
            { label: 'Subscription vs Retainer', href: '/admin/advisory/disposition-tool', icon: GitCompare },
            { label: 'Below-Floor Remediation', href: '/admin/advisory/below-floor', icon: Scale },
            { label: 'Margin-Bias Monitor', href: '/admin/advisory/margin-bias', icon: Activity },
            { label: 'Spine Compliance', href: '/admin/advisory/spine', icon: ShieldCheck },
            { label: 'Vehicle Performance', href: '/admin/advisory/vehicle-performance', icon: BarChart3 },
            { label: 'Proposals & Changes', href: '/admin/advisory/proposals', icon: FileText },
        ],
    },
    {
        title: 'Technology Solutions',
        items: [
            { label: 'Engagement Control', href: '/admin/advisory/tech/engagements', icon: SlidersHorizontal },
            { label: 'Fee Rule Manager', href: '/admin/advisory/tech/fee-rules', icon: Receipt },
            { label: 'Supplier / External Cost', href: '/admin/advisory/tech/suppliers', icon: Truck },
            { label: 'Review & Exception Queue', href: '/admin/advisory/tech/exceptions', icon: AlertTriangle },
            { label: 'WhatsApp Flow Set', href: '/admin/advisory/tech/whatsapp', icon: MessageCircle },
        ],
    },
];

export function AdminShell({ title, description, crumbs, actions, badge, children }: { title: string; description?: string; crumbs?: Crumb[]; actions?: ReactNode; badge?: ReactNode; children: ReactNode }) {
    return (
        <ConsoleLayout area="Advisory Control Tower" areaIcon={Cpu} groups={ADMIN_NAV} crumbs={crumbs ?? [{ label: 'Admin', href: '/admin/advisory' }, { label: title }]} title={title} description={description} actions={actions} badge={badge}>
            {children}
        </ConsoleLayout>
    );
}

export function techNav(ref: string): ConsoleNavGroup[] {
    const b = `/technology-solutions/workspace/${ref}`;
    return [
        {
            title: 'Portal Navigation',
            items: [
                { label: 'Overview', href: b, icon: LayoutDashboard },
                { label: 'Scope', href: `${b}/scope`, icon: ClipboardList },
                { label: 'Fees & Ledgers', href: `${b}/fee-meter`, icon: Gauge },
                { label: 'External Costs', href: `${b}/external-costs`, icon: Truck },
                { label: 'Payments', href: `${b}/payments`, icon: CreditCard },
                { label: 'Usage & Consumption', href: `${b}/usage`, icon: Activity },
                { label: 'Tasks', href: `${b}/tasks`, icon: ListChecks },
                { label: 'Documents', href: `${b}/documents`, icon: FolderLock },
                { label: 'UAT & Acceptance', href: `${b}/uat`, icon: ClipboardCheck },
                { label: 'Subscription', href: `${b}/subscription`, icon: CalendarClock },
                { label: 'Statement', href: `${b}/statement`, icon: Wallet },
                { label: 'Support & Cases', href: `${b}/support`, icon: LifeBuoy },
                { label: 'Exit & Handover', href: `${b}/exit`, icon: LogOut },
            ],
        },
        { title: 'Workspace', items: [{ label: 'All engagements', href: '/technology-solutions/workspace', icon: Briefcase }] },
    ];
}

export function TechPortal({ e, title, description, actions, children, showStrip = true }: { e: TechHeader; title: string; description?: string; actions?: ReactNode; children: ReactNode; showStrip?: boolean }) {
    return (
        <ConsoleLayout
            area={`Client Portal · ${e.organisation}`}
            areaIcon={Briefcase}
            groups={techNav(e.reference)}
            crumbs={[{ label: 'Technology Solutions', href: '/technology-solutions' }, { label: 'Client Portal', href: '/technology-solutions/workspace' }, { label: title }]}
            title={title}
            description={description}
            actions={actions}
        >
            {showStrip && (
                <div className="mb-5 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <dl className="grid grid-cols-2 gap-3 text-[0.8125rem] sm:grid-cols-3 lg:grid-cols-6">
                        <div className="col-span-2">
                            <dt className="text-xs text-ink-500">Engagement</dt>
                            <dd className="font-semibold text-ink-900">
                                {e.organisation} | {e.tower}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-500">Reference</dt>
                            <dd className="font-mono font-semibold text-ink-900">{e.reference}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-500">Owner</dt>
                            <dd className="font-medium text-ink-900">{e.owner}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-500">Current Stage</dt>
                            <dd className="font-medium text-ink-900">{e.stage_name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-ink-500">Gate · Status</dt>
                            <dd className="flex flex-wrap gap-1">
                                <StatusPill status={e.gate_label} tone="good" />
                                <StatusPill status={e.status} />
                            </dd>
                        </div>
                    </dl>
                    {e.readonly && <p className="mt-3 rounded bg-attested-50 px-3 py-1.5 text-xs text-attested-700">This engagement is closed. You have read-only access during the retention window.</p>}
                </div>
            )}
            {children}
        </ConsoleLayout>
    );
}

export const SERVICES_PORTAL_NAV: ConsoleNavGroup[] = [
    {
        title: 'Services',
        items: [
            { label: 'Cross-Vehicle Dashboard', href: '/services/relationship', icon: LayoutDashboard },
            { label: 'Multi-Vehicle Statement', href: '/services/statement', icon: Wallet },
            { label: 'Vehicle Fee Panel', href: '/services/fee-panel', icon: Receipt },
            { label: 'Upgrade to Mandate', href: '/services/sprint-to-mandate-upgrade', icon: Users },
            { label: 'Vehicle Transition', href: '/services/vehicle-transition-proposal', icon: GitCompare },
            { label: 'Recurrence Conversion', href: '/services/recurrence-conversion', icon: CalendarClock },
            { label: 'Downgrade & Exit', href: '/services/downgrade-exit', icon: LogOut },
            { label: 'Request a Proposal', href: '/services/proposal-request', icon: Handshake },
        ],
    },
];

export function ServicesPortal({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
    return (
        <ConsoleLayout area="My Services" areaIcon={Briefcase} groups={SERVICES_PORTAL_NAV} crumbs={[{ label: 'Services', href: '/services' }, { label: title }]} title={title} description={description} actions={actions}>
            {children}
        </ConsoleLayout>
    );
}

/** Sub-navigation for the Project Advisory workspace (public layout). */
export function PaWorkspaceNav({ reference, lifecycle }: { reference: string; lifecycle?: { code: string; label: string; state: 'done' | 'current' | 'todo' }[] }) {
    const { url } = usePage<SharedProps>().props;
    const b = `/project-advisory/workspace/${reference}`;
    const tabs: [string, string][] = [
        ['Workspace', b],
        ['NDA', `${b}/nda`],
        ['Method Card', `${b}/method-card`],
        ['Engagement Letter', `${b}/engagement-letter`],
        ['Mandate Letter', `${b}/mandate-letter`],
        ['Fee Ledger', `${b}/ledger`],
        ['Settlement', `${b}/settlement`],
        ['Live Fee Meter', `${b}/fee-meter`],
        ['Contingent', `${b}/contingent`],
    ];
    return (
        <div className="mb-6 space-y-4">
            <nav aria-label="Workspace sections" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
                {tabs.map(([label, href]) => (
                    <Link key={href} href={href} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem] whitespace-nowrap', url.path === href ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900')}>
                        {label}
                    </Link>
                ))}
            </nav>
            {lifecycle && (
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3">
                    <Tracker items={lifecycle} />
                </div>
            )}
        </div>
    );
}

export function Pager({ links }: { links: { url: string | null; label: string; active: boolean }[] }) {
    if (links.length <= 3) return null;
    return (
        <nav className="mt-3 flex flex-wrap gap-1" aria-label="Pagination">
            {links.map((l, i) =>
                l.url ? (
                    <Link key={i} href={l.url} preserveScroll className={cn('rounded border px-2.5 py-1 text-xs', l.active ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500 bg-white')}>
                        <span dangerouslySetInnerHTML={{ __html: l.label }} />
                    </Link>
                ) : (
                    <span key={i} className="rounded border border-parchment-300 px-2.5 py-1 text-xs text-ink-300" dangerouslySetInnerHTML={{ __html: l.label }} />
                ),
            )}
        </nav>
    );
}
