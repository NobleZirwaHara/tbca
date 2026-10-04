import { Building2, FolderOpen, LayoutDashboard, ListChecks, ShieldCheck } from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';

export const DD_ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'Due Diligence Operations',
        items: [
            { label: 'Control Tower', href: '/admin/due-diligence', icon: LayoutDashboard },
            { label: 'Case Register', href: '/admin/due-diligence/cases', icon: FolderOpen },
            { label: 'Review Queue', href: '/admin/due-diligence/cases?status=review_required', icon: ListChecks },
            { label: 'Enterprise & Monitoring', href: '/admin/due-diligence/enterprise', icon: Building2 },
        ],
    },
    {
        title: 'Public',
        items: [{ label: 'Due Diligence site', href: '/due-diligence', icon: ShieldCheck }],
    },
];
