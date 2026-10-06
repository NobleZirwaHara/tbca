import { useState, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Info, Menu, MessageCircleQuestion, Rocket, ShieldCheck, X } from 'lucide-react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Flash from '@/Components/Flash';
import { openAskQuestion } from '@/Components/AskQuestion';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { PortalNavGroup } from '@/types/portal';
import { portalIcon } from './icons';

export interface PortalShared {
    nav: PortalNavGroup[];
    user: { name: string; initials: string; organisation: string; client_id: string | null; state: string; role: string };
    unread: number;
    actions: number;
    a11y: { text_size: number; contrast: string; colour: string; focus: boolean; density: string; reduce_motion: boolean; hide_decorative: boolean };
}

type Props = SharedProps & { portal?: PortalShared };

function activeFor(path: string, href: string) {
    return path === href || (href !== '/portal/dashboard' && path.startsWith(`${href}/`));
}

function Sidebar({ nav, path, onNavigate }: { nav: PortalNavGroup[]; path: string; onNavigate?: () => void }) {
    const current = nav.find((g) => g.items.some((i) => activeFor(path, i.href)))?.title ?? nav[0]?.title;
    const [open, setOpen] = useState<Record<string, boolean>>({ [current ?? '']: true });

    return (
        <nav aria-label="Client portal navigation" className="space-y-1 px-2 py-3">
            {nav.map((group) => {
                const isOpen = open[group.title] ?? false;
                const GroupIcon = portalIcon(group.icon);
                return (
                    <div key={group.title}>
                        <button
                            type="button"
                            onClick={() => setOpen((o) => ({ ...o, [group.title]: !isOpen }))}
                            aria-expanded={isOpen}
                            className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[0.6875rem] font-bold tracking-wider text-ink-500 uppercase hover:bg-parchment-200"
                        >
                            <GroupIcon className="size-3.5 text-gold-600" aria-hidden="true" />
                            <span className="flex-1">{group.title}</span>
                            <ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                        </button>
                        {isOpen && (
                            <ul className="mt-0.5 mb-2 space-y-0.5">
                                {group.items.map((item) => {
                                    const active = activeFor(path, item.href);
                                    const Icon = portalIcon(item.icon);
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onNavigate}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[0.8125rem] transition-colors',
                                                    active ? 'bg-gold-50 font-semibold text-gold-800 ring-1 ring-gold-400/60' : 'text-ink-700 hover:bg-parchment-200 hover:text-ink-900',
                                                )}
                                            >
                                                <Icon className="size-4 shrink-0" aria-hidden="true" />
                                                <span className="flex-1 truncate">{item.label}</span>
                                                {item.badge !== undefined && item.badge !== 0 && (
                                                    <span className="rounded-full bg-verified-500 px-1.5 text-[0.625rem] font-bold text-white">{item.badge}</span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

/**
 * Signed-in Client Portal shell: standard site header, collapsible portal
 * sidebar, context bar and page head. Portal pages set `Page.layout = null`.
 */
export default function PortalShell({
    title,
    code,
    subtitle,
    icon,
    crumbs,
    actions,
    children,
}: {
    title?: ReactNode;
    code?: string | null;
    subtitle?: ReactNode;
    icon?: string | null;
    crumbs?: { label: string; href?: string }[];
    actions?: ReactNode;
    children: ReactNode;
}) {
    const { url, portal } = usePage<Props>().props;
    const [drawer, setDrawer] = useState(false);
    const nav = portal?.nav ?? [];
    const a11y = portal?.a11y;
    const PageIcon = icon ? portalIcon(icon) : null;

    return (
        <div
            className={cn(
                'flex min-h-screen flex-col bg-parchment-200',
                a11y?.contrast === 'high' && 'portal-contrast',
                a11y?.reduce_motion && 'motion-reduce',
                a11y?.colour === 'monochrome' && 'grayscale',
            )}
            style={a11y && a11y.text_size !== 100 ? { fontSize: `${a11y.text_size}%` } : undefined}
        >
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900">
                Skip to content
            </a>
            <Header variant="dark" />

            <div className="flex flex-1">
                <aside className="hidden w-64 shrink-0 border-r border-parchment-400 bg-white lg:block">
                    <div className="sticky top-0 max-h-screen overflow-y-auto">
                        <div className="flex items-center gap-2 border-b border-parchment-300 px-4 py-3">
                            <ShieldCheck className="size-5 text-gold-600" aria-hidden="true" />
                            <span className="text-sm font-semibold text-ink-900">Client Portal</span>
                        </div>
                        <Sidebar nav={nav} path={url.path} />
                        <div className="m-3 rounded-[8px] border border-gold-300 bg-gold-50 p-3 text-center">
                            <p className="text-sm font-semibold text-ink-900">Need Help?</p>
                            <p className="mt-0.5 text-xs text-ink-600">Our support team is ready to assist you.</p>
                            <Link href="/portal/support?new=1" className="mt-2 inline-flex rounded-[4px] border border-gold-500 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-gold-100">
                                Contact Support
                            </Link>
                        </div>
                        <p className="mx-4 mb-4 flex gap-2 text-[0.6875rem] text-ink-500">
                            <ShieldCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />
                            Secure Portal — your data is protected with enterprise-grade security.
                        </p>
                    </div>
                </aside>

                {drawer && (
                    <div className="fixed inset-0 z-[65] lg:hidden" role="dialog" aria-modal="true" aria-label="Portal menu">
                        <div className="absolute inset-0 bg-ink-950/50" onClick={() => setDrawer(false)} aria-hidden="true" />
                        <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white shadow-raised">
                            <div className="flex items-center justify-between border-b border-parchment-300 px-4 py-3">
                                <span className="text-sm font-semibold">Client Portal</span>
                                <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded p-1 text-ink-500 hover:text-ink-900">
                                    <X className="size-5" />
                                </button>
                            </div>
                            <Sidebar nav={nav} path={url.path} onNavigate={() => setDrawer(false)} />
                        </div>
                    </div>
                )}

                <main id="main" className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[8px] border border-parchment-400 bg-white px-3 py-2 text-xs">
                        <button type="button" onClick={() => setDrawer(true)} className="inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-500 px-2 py-1 font-medium text-ink-700 lg:hidden">
                            <Menu className="size-4" aria-hidden="true" /> Portal menu
                        </button>
                        {portal && (
                            <>
                                <span className="flex size-7 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-gold-300">{portal.user.initials}</span>
                                <span className="font-semibold text-ink-900">{portal.user.name}</span>
                                <span className="text-ink-400">·</span>
                                <Link href="/portal/organisations" className="text-ink-600 hover:text-gold-700">{portal.user.organisation}</Link>
                                {portal.user.client_id && <span className="hidden font-mono text-ink-500 sm:inline">{portal.user.client_id}</span>}
                                <Link href="/portal/account/status"><StatusPill status={portal.user.state} /></Link>
                            </>
                        )}
                        <span className="flex-1" />
                        <button type="button" onClick={() => openAskQuestion({ section: 'portal' })} className="inline-flex items-center gap-1 rounded-[4px] border border-gold-500 px-2 py-1 font-semibold text-gold-800 hover:bg-gold-50">
                            <MessageCircleQuestion className="size-3.5" aria-hidden="true" /> Ask a Question
                        </button>
                        <Link href="/sprints" className="hidden items-center gap-1 rounded-[4px] bg-gold-500 px-2 py-1 font-semibold text-ink-900 hover:bg-gold-400 sm:inline-flex">
                            <Rocket className="size-3.5" aria-hidden="true" /> Start a Sprint
                        </Link>
                        <Link href="/portal/notifications" className="relative rounded-[4px] p-1 text-ink-600 hover:text-ink-900" aria-label={`Notifications (${portal?.unread ?? 0} unread)`}>
                            <Bell className="size-4" />
                            {!!portal?.unread && <span className="absolute -top-0.5 -right-0.5 rounded-full bg-risk-500 px-1 text-[0.5625rem] font-bold text-white">{portal.unread}</span>}
                        </Link>
                    </div>

                    {crumbs && <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Client Portal', href: '/portal/dashboard' }, ...crumbs]} />}

                    {(title || actions) && (
                        <div className="mt-2 mb-5 flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {PageIcon && (
                                    <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-gold-300 bg-gold-50 text-gold-700">
                                        <PageIcon className="size-5" aria-hidden="true" />
                                    </span>
                                )}
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {title && <h1 className="font-serif text-2xl font-bold text-ink-900 sm:text-[1.75rem]">{title}</h1>}
                                        {code && <span className="rounded-full border border-controlled-500/30 bg-controlled-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-controlled-700">{code}</span>}
                                        <Info className="size-4 text-ink-400" aria-hidden="true" />
                                    </div>
                                    {subtitle && <p className="mt-1 max-w-3xl text-sm text-ink-500">{subtitle}</p>}
                                </div>
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
