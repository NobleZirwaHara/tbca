import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/cn';
import type { PortalAction } from '@/types/portal';
import { useForms } from './FormModal';
import { portalIcon } from './icons';

const variants = {
    gold: 'bg-gold-500 text-ink-900 border-gold-500 hover:bg-gold-400 font-semibold',
    ink: 'bg-ink-900 text-parchment-100 border-ink-900 hover:bg-ink-800',
    outline: 'bg-white text-ink-800 border-parchment-500 hover:border-gold-500 hover:text-gold-800',
    ghost: 'bg-transparent text-controlled-700 border-transparent hover:underline px-1',
    danger: 'bg-white text-risk-700 border-risk-500/40 hover:bg-risk-50',
};

/** One server-described action: link, Inertia request (with confirm) or modal form. */
export function ActionButton({ action, size = 'sm', className, fallbackVariant = 'outline' }: { action: PortalAction; size?: 'xs' | 'sm'; className?: string; fallbackVariant?: keyof typeof variants }) {
    const forms = useForms();
    const Icon = action.icon ? portalIcon(action.icon) : null;
    const cls = cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[4px] border whitespace-nowrap transition-colors disabled:opacity-50',
        size === 'xs' ? 'px-2 py-1 text-[0.6875rem]' : 'px-3 py-1.5 text-[0.8125rem]',
        variants[action.variant ?? fallbackVariant],
        className,
    );
    const content = (
        <>
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {action.label}
        </>
    );

    if (action.modal) {
        return (
            <button type="button" className={cls} onClick={() => forms.open(action.modal!, action.data ?? {})}>
                {content}
            </button>
        );
    }

    const method = action.method ?? 'get';
    if (method === 'get' && action.href) {
        if (action.external || action.download) {
            return (
                <a href={action.href} className={cls} {...(action.download ? { download: true } : {})}>
                    {content}
                </a>
            );
        }
        return (
            <Link href={action.href} className={cls}>
                {content}
            </Link>
        );
    }

    if (!action.href) {
        return (
            <span className={cn(cls, 'cursor-default opacity-60')} aria-disabled="true">
                {content}
            </span>
        );
    }

    return (
        <button
            type="button"
            className={cls}
            onClick={() => {
                if (action.confirm && !window.confirm(action.confirm)) return;
                router.visit(action.href!, { method, data: (action.data ?? {}) as Record<string, string>, preserveScroll: true });
            }}
        >
            {content}
        </button>
    );
}
