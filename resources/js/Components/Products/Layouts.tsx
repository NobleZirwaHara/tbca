import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { LayoutGrid, Package, UserRound } from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup, type ConsoleNavItem } from '@/Layouts/ConsoleLayout';
import type { Crumb } from '@/Components/ui/Breadcrumbs';
import { digitalAdminNav, digitalWorkspaceNav } from './nav/digital';
import { subscriptionsAdminNav, subscriptionsWorkspaceNav } from './nav/subscriptions';
import { retainersAdminNav, retainersWorkspaceNav } from './nav/retainers';

/**
 * Layout wrappers for the Products section (Digital Products, Subscriptions, Retainers).
 *
 * Pages using these must opt out of the automatic PublicLayout:
 *   MyPage.layout = null;
 */

type Family = 'digital' | 'subscriptions' | 'retainers';

const ADMIN_AREAS: Record<Family, string> = {
    digital: 'Digital Products Governance',
    subscriptions: 'Subscriptions Governance',
    retainers: 'Retainers Governance',
};

/** Admin / governance console shell for /admin/products/... screens. */
export function ProductsAdminLayout({
    family,
    title,
    description,
    badge,
    actions,
    crumbs,
    children,
}: {
    family?: Family;
    title: string;
    description?: ReactNode;
    badge?: ReactNode;
    actions?: ReactNode;
    crumbs?: Crumb[];
    children: ReactNode;
}) {
    const groups: ConsoleNavGroup[] = [
        { items: [{ label: 'Products Governance Hub', href: '/admin/products', icon: LayoutGrid }] },
        digitalAdminNav,
        subscriptionsAdminNav,
        retainersAdminNav,
    ];

    const familyCrumb: Crumb[] = family
        ? [{ label: ADMIN_AREAS[family], href: `/admin/products/${family}` }]
        : [];

    return (
        <ConsoleLayout
            area={family ? ADMIN_AREAS[family] : 'Products Governance'}
            areaIcon={Package}
            groups={groups}
            crumbs={crumbs ?? [{ label: 'Admin', href: '/admin/products' }, ...familyCrumb, { label: title }]}
            title={title}
            badge={badge}
            description={description}
            actions={actions}
        >
            <Head title={`${title} | Admin`} />
            {children}
        </ConsoleLayout>
    );
}

/**
 * Signed-in client workspace shell for /digital-products/library/..., /subscriptions/account/...
 * and /retainers/account/... screens. `context` adds a record-specific nav group
 * (e.g. the tabs of one subscription or one retainer).
 */
export function ProductsWorkspaceLayout({
    title,
    description,
    badge,
    actions,
    crumbs,
    context,
    children,
}: {
    title: string;
    description?: ReactNode;
    badge?: ReactNode;
    actions?: ReactNode;
    crumbs?: Crumb[];
    context?: ConsoleNavGroup;
    children: ReactNode;
}) {
    const mine: ConsoleNavItem[] = [...digitalWorkspaceNav, ...subscriptionsWorkspaceNav, ...retainersWorkspaceNav];
    const groups: ConsoleNavGroup[] = [
        { title: 'My Products', items: mine },
        ...(context ? [context] : []),
        { title: 'Account', items: [{ label: 'Client Portal', href: '/portal', icon: UserRound }] },
    ];

    return (
        <ConsoleLayout
            area="My Products Workspace"
            areaIcon={Package}
            groups={groups}
            crumbs={crumbs ?? [{ label: 'Home', href: '/' }, { label: title }]}
            title={title}
            badge={badge}
            description={description}
            actions={actions}
        >
            <Head title={title} />
            {children}
        </ConsoleLayout>
    );
}
