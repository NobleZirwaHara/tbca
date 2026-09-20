import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    as?: 'div' | 'article' | 'li';
    id?: string;
}

export default function Card({ children, className, hover = false, as: Tag = 'div', id }: CardProps) {
    return (
        <Tag
            id={id}
            className={cn(
                'rounded-[6px] border border-parchment-400 bg-white',
                hover &&
                    'transition-all duration-250 ease-[var(--ease-brand)] hover:border-gold-300 hover:shadow-card',
                className,
            )}
        >
            {children}
        </Tag>
    );
}

export function IconTile({
    name,
    className,
    tone = 'gold',
}: {
    name: ReactNode;
    className?: string;
    tone?: 'gold' | 'ink' | 'plain';
}) {
    const tones = {
        gold: 'bg-gold-50 text-gold-700 border-gold-200',
        ink: 'bg-ink-900 text-gold-400 border-ink-800',
        plain: 'bg-parchment-200 text-ink-600 border-parchment-400',
    };

    return (
        <span
            className={cn(
                'inline-flex size-11 shrink-0 items-center justify-center rounded-[5px] border',
                tones[tone],
                className,
            )}
        >
            {name}
        </span>
    );
}
