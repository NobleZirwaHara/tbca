import { Link } from '@inertiajs/react';
import { ArrowRight, CircleCheck, Clock, UserCheck } from 'lucide-react';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { Sprint } from '@/types';

export default function SprintCard({
    sprint,
    className,
}: {
    sprint: Sprint;
    /** @deprecated The visitor's selected display currency is used automatically. */
    currency?: string;
    className?: string;
}) {
    const price = usePrice()(sprint.zar);
    const alternate = '5 Currencies';

    return (
        <Link
            href={`/shop/${sprint.code.toLowerCase()}`}
            className={cn(
                'group flex flex-col rounded-[6px] border border-parchment-400 bg-white p-5',
                'transition-all duration-250 ease-[var(--ease-brand)] hover:border-gold-300 hover:shadow-card',
                className,
            )}
        >
            <div className="flex items-start gap-3.5">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400">
                    <Icon name={sprint.icon} className="size-[18px]" />
                </span>

                <div className="min-w-0">
                    <h3 className="text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                        {sprint.name}
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{sprint.summary}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-parchment-300 pt-4">
                <span className="text-[0.875rem] font-semibold text-gold-700">From {price}</span>
                <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-verified-700">
                    <CircleCheck className="size-3.5" aria-hidden="true" />
                    {alternate}
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.75rem] text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 text-ink-400" aria-hidden="true" />
                        {sprint.turnaround}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-ink-400" aria-hidden="true" />
                        {sprint.review}
                    </span>
                </div>

                <ArrowRight
                    className="size-4 shrink-0 text-ink-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gold-600"
                    aria-hidden="true"
                />
            </div>
        </Link>
    );
}
