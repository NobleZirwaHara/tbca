import { Link, router, usePage } from '@inertiajs/react';
import { Bookmark, BookmarkCheck, Eye, EyeOff, Receipt, Scale } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

type Variant = 'icon' | 'button' | 'row';

function useAuthed() {
    return Boolean(usePage<SharedProps>().props.auth.user);
}

function ActionButton({ onClick, icon, label, active, variant = 'button', dark }: { onClick: () => void; icon: ReactNode; label: string; active?: boolean; variant?: Variant; dark?: boolean }) {
    if (variant === 'icon') {
        return (
            <button type="button" onClick={onClick} aria-pressed={active} aria-label={label} title={label} className={cn('rounded p-1 transition-colors hover:text-gold-600', active ? 'text-gold-600' : dark ? 'text-ink-300' : 'text-ink-400')}>
                {icon}
            </button>
        );
    }
    if (variant === 'row') {
        return (
            <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[0.8125rem] transition-colors', dark ? 'text-parchment-200 hover:bg-ink-800' : 'text-ink-700 hover:bg-parchment-200')}>
                <span className="text-gold-500">{icon}</span>
                {label}
            </button>
        );
    }
    return (
        <button type="button" onClick={onClick} aria-pressed={active} className={cn('inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-[0.8125rem] font-medium transition-colors', active ? 'border-gold-500 bg-gold-50 text-gold-800' : dark ? 'border-ink-600 text-parchment-100 hover:border-gold-500' : 'border-ink-300 text-ink-800 hover:border-ink-900')}>
            {icon}
            {label}
        </button>
    );
}

/** Saved items / watchlist toggle (auth). Guests are sent to sign in. */
export function ListToggle({ list, type, itemKey, saved, variant = 'button', dark }: { list: 'saved' | 'watchlist'; type: string; itemKey: string; saved: string[]; variant?: Variant; dark?: boolean }) {
    const authed = useAuthed();
    const active = saved.includes(`${list}:${type}:${itemKey}`);
    const isWatch = list === 'watchlist';
    const label = isWatch ? (active ? 'On Watchlist' : 'Add to Watchlist') : active ? 'Saved' : 'Save';
    const icon = isWatch ? (active ? <Eye className="size-4" /> : <EyeOff className="size-4" />) : active ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />;
    const go = () => (authed ? router.post('/aiim/workspace/items', { list, type, key: itemKey }, { preserveScroll: true }) : router.visit('/login'));
    return <ActionButton onClick={go} icon={icon} label={label} active={active} variant={variant} dark={dark} />;
}

export function CompareButton({ type, itemKey, variant = 'button', dark, label = 'Compare' }: { type: string; itemKey: string; variant?: Variant; dark?: boolean; label?: string }) {
    const authed = useAuthed();
    const go = () => (authed ? router.post('/aiim/workspace/compare/items', { type, key: itemKey }, { preserveScroll: true }) : router.visit('/login'));
    return <ActionButton onClick={go} icon={<Scale className="size-4" />} label={label} variant={variant} dark={dark} />;
}

export function FeeButton({ type, itemKey, variant = 'button', dark, label = 'View Fees' }: { type: string; itemKey: string; variant?: Variant; dark?: boolean; label?: string }) {
    return <ActionButton onClick={() => router.post('/aiim/fees/items', { type, key: itemKey })} icon={<Receipt className="size-4" />} label={label} variant={variant} dark={dark} />;
}

export function RailLink({ href, icon, label, sub, dark = true }: { href: string; icon: ReactNode; label: string; sub?: string; dark?: boolean }) {
    return (
        <Link href={href} className={cn('flex items-start gap-2.5 rounded px-2 py-1.5 transition-colors', dark ? 'hover:bg-ink-800' : 'hover:bg-parchment-200')}>
            <span className="mt-0.5 text-gold-500">{icon}</span>
            <span>
                <span className={cn('block text-[0.8125rem] font-medium', dark ? 'text-parchment-100' : 'text-ink-800')}>{label}</span>
                {sub && <span className="block text-[0.6875rem] text-ink-400">{sub}</span>}
            </span>
        </Link>
    );
}
