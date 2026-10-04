import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { SharedProps } from '@/types';
import { portalIcon } from './icons';

type AdminNav = { title: string; items: { label: string; href: string; icon: string; badge?: number }[] }[];

/** /admin/portal consoles: the shared ConsoleLayout with the Client Portal Admin Control Tower sidebar. */
export default function AdminShell({
    title,
    code,
    subtitle,
    crumbs,
    actions,
    children,
}: {
    title: ReactNode;
    code?: string | null;
    subtitle?: ReactNode;
    crumbs?: { label: string; href?: string }[];
    actions?: ReactNode;
    children: ReactNode;
}) {
    const { portalAdminNav } = usePage<SharedProps & { portalAdminNav?: AdminNav }>().props;
    const groups = (portalAdminNav ?? []).map((g) => ({ title: g.title, items: g.items.map((i) => ({ ...i, icon: portalIcon(i.icon) })) }));

    return (
        <ConsoleLayout
            area="Client Portal Admin Control Tower"
            areaIcon={ShieldCheck}
            groups={groups}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Admin Control Tower', href: '/admin/portal' }, ...(crumbs ?? [])]}
            title={title}
            badge={code ? <span className="rounded-full border border-controlled-500/30 bg-controlled-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-controlled-700">{code}</span> : <span className="text-xs font-medium text-verified-600">● Data up to date</span>}
            description={subtitle}
            actions={actions}
        >
            {children}
        </ConsoleLayout>
    );
}
