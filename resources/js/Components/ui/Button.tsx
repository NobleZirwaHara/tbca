import { Link } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import Icon from './Icon';

type Variant = 'gold' | 'ink' | 'outline' | 'outline-light' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
    'inline-flex items-center justify-center gap-2 rounded-[4px] font-medium tracking-[-0.01em] ' +
    'transition-colors duration-200 ease-[var(--ease-brand)] whitespace-nowrap ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
    gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400 border border-gold-500 hover:border-gold-400 font-semibold',
    ink: 'bg-ink-900 text-parchment-100 hover:bg-ink-800 border border-ink-900',
    outline: 'bg-transparent text-ink-900 border border-ink-300 hover:border-ink-900 hover:bg-ink-900/5',
    'outline-light': 'bg-transparent text-parchment-100 border border-ink-600 hover:border-gold-500 hover:text-gold-300',
    ghost: 'bg-transparent text-ink-700 border border-transparent hover:text-gold-700',
};

const sizes: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-[0.8125rem]',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-[0.9375rem]',
};

interface CommonProps {
    variant?: Variant;
    size?: Size;
    icon?: string;
    trailingIcon?: string;
    className?: string;
    children: ReactNode;
}

function contents(icon: string | undefined, children: ReactNode, trailingIcon: string | undefined) {
    return (
        <>
            {icon && <Icon name={icon} className="size-4" />}
            {children}
            {trailingIcon && <Icon name={trailingIcon} className="size-4" />}
        </>
    );
}

export function Button({
    variant = 'gold',
    size = 'md',
    icon,
    trailingIcon,
    className,
    children,
    ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
    return (
        <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
            {contents(icon, children, trailingIcon)}
        </button>
    );
}

export function ButtonLink({
    variant = 'gold',
    size = 'md',
    icon,
    trailingIcon,
    className,
    children,
    href,
    method,
    preserveScroll,
}: CommonProps & {
    href: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    preserveScroll?: boolean;
}) {
    return (
        <Link
            href={href}
            method={method}
            preserveScroll={preserveScroll}
            className={cn(base, variants[variant], sizes[size], className)}
        >
            {contents(icon, children, trailingIcon)}
        </Link>
    );
}
