import { FolderLock, LayoutDashboard, Receipt, Scale } from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';

export const DEAL_ROOM_ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'Deal Room Control Tower',
        items: [
            { label: 'Overview & Rooms', href: '/admin/deal-room', icon: LayoutDashboard },
            { label: 'Commercial Requests', href: '/admin/deal-room/requests', icon: Scale },
            { label: 'Billing & Invoices', href: '/admin/deal-room/billing', icon: Receipt },
        ],
    },
    { title: 'Public', items: [{ label: 'Virtual Deal Room site', href: '/virtual-deal-room', icon: FolderLock }] },
];
