import {
    BadgeCheck,
    BookOpen,
    ClipboardCheck,
    FileWarning,
    Gauge,
    History,
    KeyRound,
    LayoutDashboard,
    LifeBuoy,
    Scale,
    ShieldCheck,
    Store,
    Tags,
    Truck,
    Undo2,
} from 'lucide-react';
import type { ConsoleNavGroup, ConsoleNavItem } from '@/Layouts/ConsoleLayout';

/** Admin console navigation for the Digital Products family (/admin/products/digital/...). */
export const digitalAdminNav: ConsoleNavGroup = {
    title: 'Digital Products',
    items: [
        { label: 'Admin Control Centre', href: '/admin/products/digital', icon: LayoutDashboard },
        { label: 'Defensibility Test', href: '/admin/products/digital/defensibility', icon: Scale },
        { label: 'Creation QA & Release', href: '/admin/products/digital/qa', icon: ClipboardCheck },
        { label: 'Claim Verification', href: '/admin/products/digital/claims', icon: BadgeCheck },
        { label: 'Licence & IP Chain', href: '/admin/products/digital/rights', icon: KeyRound },
        { label: 'Version & Download Register', href: '/admin/products/digital/versions', icon: History },
        { label: 'Correction & Withdrawal', href: '/admin/products/digital/corrections', icon: FileWarning },
        { label: 'Delivery Reclassification', href: '/admin/products/digital/delivery-reclassification', icon: Truck },
        { label: 'Price Floor Remediation', href: '/admin/products/digital/pricing-floor', icon: Tags },
        { label: 'Free / Paid Boundary', href: '/admin/products/digital/portfolio', icon: BookOpen },
        { label: 'Marketplace IP Clearance', href: '/admin/products/digital/marketplace-ip', icon: Store },
        { label: 'Refunds & Issues', href: '/admin/products/digital/cases', icon: Undo2 },
        { label: 'Control Tower', href: '/admin/products/digital/control-tower', icon: Gauge },
    ],
};

/** Signed-in client workspace links for Digital Products. */
export const digitalWorkspaceNav: ConsoleNavItem[] = [
    { label: 'My Digital Library', href: '/digital-products/library', icon: BookOpen },
    { label: 'Refund & Product Issues', href: '/digital-products/library/refund-and-issue', icon: ShieldCheck },
    { label: 'Digital Products Catalogue', href: '/digital-products', icon: LifeBuoy },
];
