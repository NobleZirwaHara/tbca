import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Menu, MessageCircle, Search, ShoppingBag, User, X } from 'lucide-react';
import Logo from './Logo';
import { cn } from '@/lib/cn';
import type { NavChild, NavTab, SharedProps } from '@/types';

export type HeaderVariant = 'dark' | 'split';

export default function Header({ variant = 'split' }: { variant?: HeaderVariant }) {
    const { nav, context, url, auth, basketCount } = usePage<SharedProps>().props;
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setDrawerOpen(false);
        setOpenMenu(null);
    }, [url.path]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenu(null);
                setDrawerOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const isActive = (href: string) =>
        href === '/' ? url.path === '/' : url.path === href || url.path.startsWith(`${href}/`);

    const scheduleClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
    };

    const cancelClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    };

    const setContext = (key: 'language' | 'currency', value: string) => {
        router.post('/context', { [key]: value }, { preserveScroll: true, preserveState: true });
    };

    const secondaryOnDark = variant === 'dark';

    return (
        <header className="sticky top-0 z-50">
            {/* ---------------- Utility bar ---------------- */}
            <div className="border-b border-ink-800 bg-ink-950">
                <div className="container-tbca flex h-[68px] items-center gap-4">
                    {/* Header-specific lockup (mark, wordmark, rule, tagline) sized to the bar; the mark alone on phones. */}
                    <Logo variant="header" className="hidden sm:inline-flex" />
                    <Logo variant="mark" className="sm:hidden" />

                    <div className="ml-auto flex items-center gap-2 xl:gap-3">
                        <div className="hidden items-center gap-1 2xl:flex">
                            <ContextSelect
                                label={
                                    context.languages.find((l) => l.code === context.language)?.label ?? 'English'
                                }
                                options={context.languages.map((l) => ({ value: l.code, label: l.label }))}
                                onSelect={(value) => setContext('language', value)}
                            />
                            <ContextSelect
                                label={context.currency}
                                options={context.currencies.map((c) => ({
                                    value: c.code,
                                    label: `${c.code} — ${c.label}`,
                                }))}
                                onSelect={(value) => setContext('currency', value)}
                            />
                        </div>

                        <form action="/search" method="get" role="search" className="relative hidden lg:block">
                            <label>
                                <span className="sr-only">Search TBCA</span>
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    name="q"
                                    placeholder="Search everything..."
                                    className="h-9 w-48 rounded-[4px] border border-ink-700 bg-ink-900 pr-3 pl-9 text-[0.8125rem] text-parchment-100 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none xl:w-60"
                                />
                            </label>
                        </form>


                        <Link
                            href="/shop"
                            className="hidden h-9 items-center gap-1.5 rounded-[4px] bg-gold-500 px-3.5 text-[0.8125rem] font-semibold text-ink-900 transition-colors hover:bg-gold-400 sm:inline-flex"
                        >
                            Start a Sprint
                        </Link>

                        <Link
                            href="/contact"
                            className="hidden h-9 items-center gap-1.5 rounded-[4px] border border-ink-700 px-3 text-[0.8125rem] font-medium text-parchment-100 transition-colors hover:border-[#25D366]/60 hover:text-[#25D366] xl:inline-flex"
                        >
                            <MessageCircle className="size-4 text-[#25D366]" aria-hidden="true" />
                            WhatsApp / Talk
                        </Link>

                        <button
                            type="button"
                            className="relative hidden size-9 items-center justify-center rounded-[4px] border border-ink-700 text-parchment-200 transition-colors hover:border-gold-600 hover:text-gold-300 lg:inline-flex"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" aria-hidden="true" />
                            <span className="absolute -top-1.5 -right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-risk-500 text-[0.625rem] font-semibold text-white">
                                2
                            </span>
                        </button>

                        <Link
                            href="/basket"
                            className="relative hidden size-9 items-center justify-center rounded-[4px] border border-ink-700 text-parchment-200 transition-colors hover:border-gold-600 hover:text-gold-300 lg:inline-flex"
                            aria-label={`Basket, ${basketCount} item${basketCount === 1 ? '' : 's'}`}
                        >
                            <ShoppingBag className="size-4" aria-hidden="true" />
                            {basketCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-gold-500 text-[0.625rem] font-semibold text-ink-900">
                                    {basketCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={auth.user ? (auth.user.role === 'admin' ? '/admin' : '/portal/dashboard') : '/login'}
                            className="hidden h-9 items-center gap-1.5 rounded-[4px] border border-ink-700 px-3 text-[0.8125rem] font-medium text-parchment-100 transition-colors hover:border-gold-600 hover:text-gold-300 md:inline-flex"
                        >
                            <User className="size-4" aria-hidden="true" />
                            {auth.user ? auth.user.name.split(' ')[0] : 'Client Login'}
                        </Link>

                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="inline-flex size-9 items-center justify-center rounded-[4px] border border-ink-700 text-parchment-100 lg:hidden"
                            aria-label="Open navigation"
                            aria-expanded={drawerOpen}
                        >
                            <Menu className="size-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------------- Primary navigation ---------------- */}
            <div className="hidden bg-ink-900 lg:block">
                <div className="container-tbca">
                    <ul className="flex items-stretch justify-between">
                        {nav.primary.map((tab, i) => (
                            <NavItem
                                key={tab.href}
                                tab={tab}
                                tone="dark"
                                align={i >= nav.primary.length / 2 ? 'right' : 'left'}
                                active={isActive(tab.href)}
                                items={nav.children[tab.href]}
                                open={openMenu === tab.href}
                                onOpen={() => {
                                    cancelClose();
                                    setOpenMenu(nav.children[tab.href] ? tab.href : null);
                                }}
                                onClose={scheduleClose}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            {/* ---------------- Secondary navigation ---------------- */}
            <div
                className={cn(
                    'hidden border-b lg:block',
                    secondaryOnDark
                        ? 'border-ink-800 bg-ink-900/95'
                        : 'border-parchment-400 bg-white',
                )}
            >
                <div className="container-tbca">
                    <ul className="flex items-stretch justify-between">
                        {nav.secondary.map((tab, i) => (
                            <NavItem
                                key={tab.href}
                                tab={tab}
                                tone={secondaryOnDark ? 'dark' : 'light'}
                                align={i >= nav.secondary.length / 2 ? 'right' : 'left'}
                                active={isActive(tab.href)}
                                items={nav.children[tab.href]}
                                open={openMenu === tab.href}
                                onOpen={() => {
                                    cancelClose();
                                    setOpenMenu(nav.children[tab.href] ? tab.href : null);
                                }}
                                onClose={scheduleClose}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} isActive={isActive} />
        </header>
    );
}

/* ------------------------------------------------------------------ */

function NavItem({
    tab,
    tone,
    active,
    items,
    open,
    onOpen,
    onClose,
    align = 'left',
}: {
    align?: 'left' | 'right';
    tab: NavTab;
    tone: 'dark' | 'light';
    active: boolean;
    items?: NavChild[];
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
}) {
    const onDark = tone === 'dark';

    return (
        <li className="relative" onMouseEnter={onOpen} onMouseLeave={onClose} onFocus={onOpen} onBlur={onClose}>
            <Link
                href={tab.href}
                className={cn(
                    'relative flex h-11 items-center gap-1 px-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors xl:px-2.5',
                    onDark
                        ? active
                            ? 'text-gold-400'
                            : 'text-parchment-200 hover:text-gold-300'
                        : active
                          ? 'text-gold-700'
                          : 'text-ink-700 hover:text-gold-700',
                )}
                aria-current={active ? 'page' : undefined}
                aria-haspopup={items ? 'true' : undefined}
                aria-expanded={items ? open : undefined}
            >
                {tab.label}
                {items && <ChevronDown className="size-3 opacity-60" aria-hidden="true" />}

                {active && (
                    <span
                        className={cn(
                            'absolute inset-x-1.5 bottom-0 h-[2px]',
                            onDark ? 'bg-gold-500' : 'bg-gold-600',
                        )}
                        aria-hidden="true"
                    />
                )}
            </Link>

            {items && open && (
                <div
                    className={cn(
                        'absolute top-full z-50 overflow-hidden rounded-b-[6px] border border-t-0 border-parchment-400 bg-white shadow-raised',
                        items.length > 7 ? 'w-[40rem]' : 'w-[22rem]',
                        align === 'right' ? 'right-0' : 'left-0',
                    )}
                >
                    <div className="border-b border-parchment-300 bg-parchment-100 px-4 py-2.5">
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-700">
                            {tab.label}
                        </p>
                        <p className="mt-0.5 text-[0.75rem] leading-snug text-ink-500">{tab.purpose}</p>
                    </div>

                    <ul className={cn('p-1.5', items.length > 7 && 'grid grid-cols-2 gap-x-1')}>
                        {items.map((child) => (
                            <li key={child.href}>
                                <Link
                                    href={child.href}
                                    className="block rounded-[4px] px-2.5 py-2 transition-colors hover:bg-parchment-200"
                                >
                                    <span className="block text-[0.8125rem] font-semibold text-ink-900">
                                        {child.label}
                                    </span>
                                    <span className="mt-0.5 block text-[0.75rem] leading-snug text-ink-500">
                                        {child.note}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
}

function ContextSelect({
    label,
    options,
    onSelect,
}: {
    label: string;
    options: { value: string; label: string }[];
    onSelect: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative" onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                onClick={() => setOpen((state) => !state)}
                className="inline-flex h-9 items-center gap-1 rounded-[4px] px-2 text-[0.8125rem] font-medium text-parchment-200 transition-colors hover:text-gold-300"
                aria-expanded={open}
            >
                {label}
                <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
            </button>

            {open && (
                <ul className="absolute right-0 z-50 mt-0.5 w-52 overflow-hidden rounded-[5px] border border-parchment-400 bg-white py-1 shadow-raised">
                    {options.map((option) => (
                        <li key={option.value}>
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(option.value);
                                    setOpen(false);
                                }}
                                className="block w-full px-3 py-1.5 text-left text-[0.8125rem] text-ink-700 transition-colors hover:bg-parchment-200"
                            >
                                {option.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function MobileDrawer({
    open,
    onClose,
    isActive,
}: {
    open: boolean;
    onClose: () => void;
    isActive: (href: string) => boolean;
}) {
    const { nav } = usePage<SharedProps>().props;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                className="absolute inset-0 bg-ink-950/70"
                onClick={onClose}
                aria-label="Close navigation"
            />

            <div className="absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col bg-ink-950">
                <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink-800 px-5">
                    <Logo variant="mark" />
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex size-9 items-center justify-center rounded-[4px] border border-ink-700 text-parchment-100"
                        aria-label="Close navigation"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-0.5">
                        {[...nav.primary, ...nav.secondary].map((tab) => (
                            <li key={tab.href}>
                                <Link
                                    href={tab.href}
                                    className={cn(
                                        'flex items-center justify-between rounded-[4px] px-3 py-2.5 text-[0.9375rem]',
                                        isActive(tab.href)
                                            ? 'bg-ink-800 font-semibold text-gold-400'
                                            : 'text-parchment-200 hover:bg-ink-900',
                                    )}
                                >
                                    {tab.label}
                                </Link>

                                {nav.children[tab.href] && (
                                    <ul className="mt-0.5 mb-1.5 ml-3 space-y-0.5 border-l border-ink-800 pl-3">
                                        {nav.children[tab.href].map((child) => (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    className="block rounded-[4px] px-2.5 py-1.5 text-[0.8125rem] text-ink-300 hover:text-gold-300"
                                                >
                                                    {child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="shrink-0 space-y-2 border-t border-ink-800 p-4">
                    <Link
                        href="/shop"
                        className="flex h-11 items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900"
                    >
                        Start a Sprint
                    </Link>
                    <Link
                        href="/login"
                        className="flex h-11 items-center justify-center rounded-[4px] border border-ink-700 text-sm font-medium text-parchment-100"
                    >
                        Client Login
                    </Link>
                    <Link
                        href="/basket"
                        className="flex h-11 items-center justify-center rounded-[4px] border border-ink-700 text-sm font-medium text-parchment-100"
                    >
                        Basket
                    </Link>
                </div>
            </div>
        </div>
    );
}
