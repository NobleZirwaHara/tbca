import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import {
    Activity, BarChart3, Boxes, ClipboardCheck, Coins, Copy, FileCheck, FileSearch, GitBranch, Handshake, Key, LayoutDashboard, ListChecks, Receipt,
    Repeat, Rocket, Route, ScrollText, ShieldCheck, ShoppingCart, Store, Users, Workflow,
} from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { StatusPill } from '@/Components/ui/Kit';

/** "Shop Admin Control Tower" sidebar - groups as in the Product Master mockup. */
export const SHOP_ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'Product Governance',
        items: [
            { label: 'Vehicle-Aware Listing Gate', href: '/admin/shop/listing-gate', icon: ShieldCheck },
            { label: 'Product Master / Variant Console', href: '/admin/shop/product-master', icon: Boxes },
            { label: 'Variant & SKU Console', href: '/admin/shop/variants', icon: GitBranch },
            { label: 'Price, Floor & Tax Console', href: '/admin/shop/pricing', icon: Coins },
            { label: 'Subscription Certification', href: '/admin/shop/subscriptions', icon: Repeat },
            { label: 'Retainer Capacity Console', href: '/admin/shop/retainers', icon: Users },
            { label: 'Native Handoff / Professional Boundary', href: '/admin/shop/handoffs', icon: Handshake },
        ],
    },
    {
        title: 'Commerce Operations',
        items: [
            { label: 'Orders & Accounting', href: '/admin/shop/orders', icon: ShoppingCart },
            { label: 'Quotes & Proposals', href: '/admin/shop/quotes', icon: Receipt },
            { label: 'Entitlements Console', href: '/admin/shop/entitlements', icon: Key },
            { label: 'Marketplace Console', href: '/admin/shop/marketplace', icon: Store },
        ],
    },
    {
        title: 'Content & QA',
        items: [
            { label: 'ProductVersion Control', href: '/admin/shop/versions', icon: FileCheck },
            { label: 'Creation QA Console', href: '/admin/shop/duplication', icon: Copy },
            { label: 'Licence & IP Console', href: '/admin/shop/licences', icon: ScrollText },
            { label: 'Audit Trail', href: '/admin/shop/audit', icon: ListChecks },
        ],
    },
    {
        title: 'Reports & Insights',
        items: [
            { label: 'Gate Metrics Dashboard', href: '/admin/shop', icon: LayoutDashboard },
            { label: 'QBO & Entitlement Reconciliation', href: '/admin/shop/reconciliation', icon: BarChart3 },
            { label: 'Merchandising Route Remediation', href: '/admin/shop/routes', icon: Route },
            { label: 'Listing-State Derivation Console', href: '/admin/shop/listing-state', icon: Workflow },
            { label: 'Release & UAT Control Tower', href: '/admin/shop/releases', icon: Rocket },
        ],
    },
];

const STRIP = [
    { title: 'Governance First', body: 'Policy-led. Evidence-based.', icon: ShieldCheck },
    { title: 'Data Integrity', body: 'Accurate. Current. Trusted.', icon: Activity },
    { title: 'Client Protection', body: 'No surprises. Only clarity.', icon: FileSearch },
    { title: 'Compliant by Design', body: 'Legal. Regulatory. Ethical.', icon: ClipboardCheck },
    { title: 'Human Oversight', body: 'Reviewed. Approved. Responsible.', icon: Users },
    { title: 'Audit Ready', body: 'Traceable. Verifiable. Defensible.', icon: ListChecks },
];

export default function AdminShell({
    title,
    description,
    badge = 'Production',
    actions,
    children,
}: {
    title: string;
    description?: string;
    badge?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <ConsoleLayout
            area="Shop Admin Control Tower"
            areaIcon={Store}
            groups={SHOP_ADMIN_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Online Shop', href: '/admin/shop' }, { label: title }]}
            title={title}
            badge={<StatusPill status={badge} tone={badge === 'Production' ? 'good' : badge === 'Governance' ? 'info' : 'gold'} />}
            description={description}
            actions={actions}
        >
            <Head title={`${title} | Shop Admin`} />
            <div className="space-y-5">{children}</div>
            <ul className="mt-8 grid gap-4 border-t border-parchment-400 pt-5 sm:grid-cols-3 xl:grid-cols-6">
                {STRIP.map((s) => (
                    <li key={s.title} className="flex items-start gap-2">
                        <s.icon className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />
                        <span>
                            <span className="block text-xs font-semibold text-ink-900">{s.title}</span>
                            <span className="block text-[0.6875rem] text-ink-500">{s.body}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </ConsoleLayout>
    );
}
