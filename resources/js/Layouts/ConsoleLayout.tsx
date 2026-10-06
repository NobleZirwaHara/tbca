import { useState, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Flash from '@/Components/Flash';
import Backdrop, { type BackdropVariant } from '@/Components/Backdrop';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

export interface ConsoleNavItem {
    label: string;
    href: string;
    icon?: LucideIcon;
    badge?: string | number;
}

export interface ConsoleNavGroup {
    title?: string;
    items: ConsoleNavItem[];
}

/**
 * Sidebar shell for admin consoles ("Shop Admin Control Tower", "Claim Register
 * Console" ...) and signed-in workspaces. The page supplies its own sidebar
 * groups so each section keeps its own console navigation.
 *
 *   ProductConsole.layout = null;
 *   export default function ProductConsole() {
 *     return (
 *       <ConsoleLayout area="Shop Admin Control Tower" groups={SHOP_ADMIN_NAV} crumbs={[...]}
 *                      title="Product Master / Variant Console" badge="Production" actions={<Button>..</Button>}>
 *         ...
 *       </ConsoleLayout>
 *     );
 *   }
 */
export default function ConsoleLayout({
    area,
    areaIcon: AreaIcon,
    groups,
    crumbs,
    title,
    badge,
    description,
    actions,
    children,
    backdrop = 'topo',
}: {
    area: string;
    areaIcon?: LucideIcon;
    groups: ConsoleNavGroup[];
    crumbs?: Crumb[];
    title?: ReactNode;
    badge?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    /** Faint full-page background picture behind the workspace. */
    backdrop?: BackdropVariant;
}) {
    const { url } = usePage<SharedProps>().props;
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="relative isolate flex min-h-screen flex-col bg-parchment-200">
            <Backdrop variant={backdrop} />
            <Header variant="dark" />

            <div className="flex flex-1">
                <aside
                    className={cn(
                        'hidden shrink-0 flex-col border-r border-ink-800 bg-ink-950 text-parchment-200 lg:flex',
                        collapsed ? 'w-16' : 'w-64',
                    )}
                >
                    <div className="flex items-center gap-2.5 border-b border-ink-800 px-4 py-4">
                        {AreaIcon && <AreaIcon className="size-5 shrink-0 text-gold-400" />}
                        {!collapsed && <span className="text-sm leading-tight font-semibold text-parchment-100">{area}</span>}
                    </div>

                    <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label={`${area} navigation`}>
                        {groups.map((group, gi) => (
                            <div key={gi} className="mb-4">
                                {group.title && !collapsed && (
                                    <p className="px-2.5 pb-1.5 text-[0.6875rem] font-bold tracking-wider text-ink-400 uppercase">{group.title}</p>
                                )}
                                <ul className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const active = url.path === item.href || url.path.startsWith(`${item.href}/`);
                                        const Icon = item.icon;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    title={collapsed ? item.label : undefined}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[0.8125rem] transition-colors',
                                                        active
                                                            ? 'bg-gold-500/15 font-semibold text-gold-300 ring-1 ring-gold-600/40'
                                                            : 'text-ink-200 hover:bg-ink-900 hover:text-parchment-100',
                                                    )}
                                                >
                                                    {Icon && <Icon className="size-4 shrink-0" />}
                                                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                                    {!collapsed && item.badge !== undefined && (
                                                        <span className="rounded-full bg-gold-500 px-1.5 text-[0.625rem] font-bold text-ink-900">{item.badge}</span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setCollapsed((c) => !c)}
                        className="flex items-center gap-2 border-t border-ink-800 px-4 py-3 text-xs text-gold-400 hover:text-gold-300"
                    >
                        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
                        {!collapsed && 'Collapse Menu'}
                    </button>
                </aside>

                <main id="main" className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
                    {/* Mobile: sidebar items as a horizontal scroller */}
                    <nav className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden" aria-label={`${area} navigation`}>
                        {groups.flatMap((g) => g.items).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'shrink-0 rounded-full border px-3 py-1 text-xs',
                                    url.path === item.href ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 bg-white text-ink-600',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {crumbs && <Breadcrumbs items={crumbs} />}

                    {(title || actions) && (
                        <div className="mt-2 mb-5 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {title && <h1 className="font-serif text-2xl font-bold text-ink-900 sm:text-[1.75rem]">{title}</h1>}
                                    {badge}
                                </div>
                                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
                            </div>
                            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                        </div>
                    )}

                    {children}
                </main>
            </div>

            <Footer />
            <Flash />
        </div>
    );
}
