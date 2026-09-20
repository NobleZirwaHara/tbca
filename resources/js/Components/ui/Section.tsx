import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Section({
    children,
    className,
    tone = 'parchment',
    id,
}: {
    children: ReactNode;
    className?: string;
    tone?: 'parchment' | 'white' | 'ink';
    id?: string;
}) {
    const tones = {
        parchment: 'bg-parchment-200 text-ink-800',
        white: 'bg-white text-ink-800',
        ink: 'bg-ink-900 text-parchment-100',
    };

    return (
        <section id={id} className={cn('py-14 md:py-20', tones[tone], className)}>
            <div className="container-tbca">{children}</div>
        </section>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    lead,
    body,
    align = 'left',
    tone = 'light',
    className,
}: {
    eyebrow?: string;
    title: string;
    lead?: string;
    body?: string;
    align?: 'left' | 'center';
    tone?: 'light' | 'dark';
    className?: string;
}) {
    const dark = tone === 'dark';

    return (
        <header
            className={cn(
                'max-w-3xl',
                align === 'center' && 'mx-auto text-center',
                className,
            )}
        >
            {eyebrow && (
                <p
                    className={cn(
                        'mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em]',
                        dark ? 'text-gold-400' : 'text-gold-700',
                    )}
                >
                    {eyebrow}
                </p>
            )}

            <h2
                className={cn(
                    'font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.015em] md:text-[2.25rem]',
                    dark ? 'text-parchment-100' : 'text-ink-900',
                )}
            >
                {title}
            </h2>

            {lead && (
                <p
                    className={cn(
                        'mt-2 font-serif text-[1.125rem] leading-snug md:text-[1.375rem]',
                        dark ? 'text-gold-300' : 'text-gold-700',
                    )}
                >
                    {lead}
                </p>
            )}

            {body && (
                <p
                    className={cn(
                        'mt-4 text-[0.9375rem] leading-relaxed md:text-base',
                        dark ? 'text-ink-200' : 'text-ink-600',
                    )}
                >
                    {body}
                </p>
            )}
        </header>
    );
}

export function Eyebrow({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
    return (
        <p
            className={cn(
                'text-[0.6875rem] font-semibold uppercase tracking-[0.16em]',
                tone === 'dark' ? 'text-gold-400' : 'text-gold-700',
            )}
        >
            {children}
        </p>
    );
}
