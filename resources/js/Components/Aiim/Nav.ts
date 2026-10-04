import { Archive, Bell, BookOpen, Briefcase, Building2, CreditCard, FileText, Gauge, Handshake, KeyRound, Landmark, LayoutDashboard, ListChecks, Receipt, Scale, ShieldCheck, Star, Tags, Users, Wallet } from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';

export const WORKSPACE_NAV: ConsoleNavGroup[] = [
    {
        title: 'AIIM Workspace',
        items: [
            { label: 'Client Dashboard', href: '/aiim/workspace', icon: LayoutDashboard },
            { label: 'My Mandates', href: '/aiim/workspace/engagements', icon: Briefcase },
            { label: 'Saved Items', href: '/aiim/workspace/saved', icon: Star },
            { label: 'Comparisons', href: '/aiim/workspace/compare', icon: Scale },
            { label: 'Reports', href: '/aiim/workspace/reports', icon: FileText },
            { label: 'Watchlists', href: '/aiim/workspace/watchlist', icon: Bell },
            { label: 'Entitlements', href: '/aiim/workspace/entitlements', icon: KeyRound },
            { label: 'Wallet & Credits', href: '/aiim/wallet', icon: Wallet },
            { label: 'Monitoring & Alerts', href: '/aiim/workspace/alerts', icon: Bell },
            { label: 'Archive & Deletion', href: '/aiim/workspace/archive', icon: Archive },
        ],
    },
    {
        title: 'Desks',
        items: [
            { label: 'Enterprise Desk', href: '/aiim/workspace/enterprise', icon: Building2 },
            { label: 'Government & DFI Desk', href: '/aiim/workspace/institutional', icon: Landmark },
            { label: 'API & White-Label', href: '/aiim/workspace/developer', icon: KeyRound },
        ],
    },
    {
        title: 'Quick Actions',
        items: [
            { label: 'Search Opportunities', href: '/aiim/opportunities', icon: Gauge },
            { label: 'Generate Report', href: '/aiim/store', icon: FileText },
            { label: 'Request Custom Intelligence', href: '/aiim/custom-intelligence', icon: BookOpen },
            { label: 'Book an Advisor', href: '/aiim/workspace/advisor-request', icon: Handshake },
        ],
    },
];

export const ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'AIIM Admin Area',
        items: [
            { label: 'Administration Dashboard', href: '/admin/aiim', icon: LayoutDashboard },
            { label: 'Advisor Dashboard', href: '/admin/aiim/advisor', icon: Users },
            { label: 'Finance Dashboard', href: '/admin/aiim/finance', icon: Receipt },
        ],
    },
    {
        title: 'Pricing & Content',
        items: [
            { label: 'Pricing Administration', href: '/admin/aiim/pricing', icon: Tags },
            { label: 'Source & Confidence', href: '/admin/aiim/sources', icon: ShieldCheck },
        ],
    },
    {
        title: 'Workflows',
        items: [
            { label: 'Engagement Queue', href: '/admin/aiim/advisor#queue', icon: ListChecks },
            { label: 'Payments', href: '/admin/aiim/finance#transactions', icon: CreditCard },
        ],
    },
];
