import type { ReactNode } from 'react';
import {
    AlertTriangle, BadgeCheck, Ban, BarChart3, Briefcase, ClipboardCheck, Coins, FileSearch, FileSignature, FileText, Gavel, Gauge, Home,
    Landmark, LayoutDashboard, Layers, ListChecks, Lock, Network, Receipt, Scale, ScrollText, Search, ShieldAlert, ShieldCheck, Store, Users, Wallet, Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import type { Crumb } from '@/Components/ui/Breadcrumbs';

type ShellProps = {
    title?: ReactNode;
    badge?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    crumbs?: Crumb[];
    children: ReactNode;
};

export const PROVIDER_NAV: ConsoleNavGroup[] = [
    {
        title: 'Provider Portal',
        items: [
            { label: 'Home', href: '/marketplace/provider', icon: Home },
            { label: 'Provider Dashboard', href: '/marketplace/provider/dashboard', icon: LayoutDashboard },
            { label: 'Opportunity Feed', href: '/marketplace/provider/opportunities', icon: Search },
            { label: 'Earnings & Payouts', href: '/marketplace/provider/statements', icon: Wallet },
        ],
    },
    {
        title: 'Account',
        items: [
            { label: 'Provider Agreement', href: '/marketplace/provider/agreement', icon: FileSignature },
            { label: 'Grievance & Appeal', href: '/marketplace/provider/grievances/new', icon: Gavel },
            { label: 'Public Profile', href: '/marketplace/providers', icon: BadgeCheck },
        ],
    },
];

export function ProviderShell(props: ShellProps) {
    return (
        <ConsoleLayout area="Marketplace Provider Portal" areaIcon={Store} groups={PROVIDER_NAV} {...props}>
            {props.children}
        </ConsoleLayout>
    );
}

export const PARTNER_NAV: ConsoleNavGroup[] = [
    {
        title: 'Partner Workspace',
        items: [
            { label: 'Dashboard', href: '/partner-services/workspace', icon: LayoutDashboard },
            { label: 'Verifications', href: '/partner-services/workspace/verifications', icon: ShieldCheck },
            { label: 'Partner Network', href: '/partner-services/network', icon: Network },
            { label: 'Help & Resources', href: '/partner-services/professional-limitation-notice', icon: ScrollText },
        ],
    },
];

export function PartnerShell(props: ShellProps) {
    return (
        <ConsoleLayout area="Partner Services Workspace" areaIcon={Briefcase} groups={PARTNER_NAV} {...props}>
            {props.children}
        </ConsoleLayout>
    );
}

const registerIcons: Record<string, LucideIcon> = {
    'capacity-rules': Layers,
    corrections: ClipboardCheck,
    'floor-blocks': Ban,
    circumvention: ShieldAlert,
    permissions: Scale,
    arrangements: ListChecks,
    expiry: AlertTriangle,
    conflicts: Gavel,
    'fee-mechanisms': Coins,
    ledgers: Landmark,
    'ps-floor-blocks': Lock,
    escalations: Workflow,
    performance: Gauge,
};

export function adminNav(nav?: { marketplace: { key: string; title: string }[]; partners: { key: string; title: string }[] }): ConsoleNavGroup[] {
    const reg = (k: string, t: string) => ({ label: t.replace(' Console', '').replace(' Workbench', ''), href: `/admin/marketplace/${k}`, icon: registerIcons[k] ?? FileText });
    return [
        {
            title: 'Marketplace Governance',
            items: [
                { label: 'Governance Hub', href: '/admin/marketplace', icon: LayoutDashboard },
                { label: 'Provider Verification Register', href: '/admin/marketplace/providers', icon: BadgeCheck },
                { label: 'Listing Moderation', href: '/admin/marketplace/listings', icon: Store },
                { label: 'Brief Triage & Matching', href: '/admin/marketplace/briefs', icon: FileSearch },
                { label: 'QA Review Queue', href: '/admin/marketplace/qa', icon: ClipboardCheck },
                { label: 'Payout & Float Console', href: '/admin/marketplace/finance', icon: Receipt },
                { label: 'Supply & Fill-Rate', href: '/admin/marketplace/supply', icon: BarChart3 },
                { label: 'Disputes & Chargebacks', href: '/admin/marketplace/disputes', icon: Gavel },
                ...(nav?.marketplace ?? []).map((r) => reg(r.key, r.title)),
            ],
        },
        {
            title: 'Partner Services Admin',
            items: [
                { label: 'Live Partner Register', href: '/admin/marketplace/partners/register', icon: Users },
                ...(nav?.partners ?? []).map((r) => reg(r.key, r.title)),
            ],
        },
    ];
}

export function AdminShell({ nav, ...props }: ShellProps & { nav?: { marketplace: { key: string; title: string }[]; partners: { key: string; title: string }[] } }) {
    return (
        <ConsoleLayout area="Marketplace & Partner Governance" areaIcon={ShieldCheck} groups={adminNav(nav)} {...props}>
            {props.children}
        </ConsoleLayout>
    );
}
