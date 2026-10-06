import { cn } from '@/lib/cn';
import { useCurrency } from '@/lib/money';

/**
 * Checkout charges always settle in ZAR. When the visitor browses in another
 * display currency, show the ZAR charge with the converted equivalent.
 */
export default function ChargedInZar({
    zar,
    tone = 'light',
    className,
}: {
    zar: number;
    tone?: 'light' | 'dark';
    className?: string;
}) {
    const { isConverted, format, display, live } = useCurrency();

    return (
        <p className={cn('text-[0.6875rem] leading-snug', tone === 'dark' ? 'text-ink-300' : 'text-ink-500', className)}>
            Charged in ZAR
            {isConverted && (
                <>
                    {' '}
                    · approx. <span className="font-semibold">{format(zar)}</span> {display} at{' '}
                    {live ? "today's" : 'indicative'} rate
                </>
            )}
        </p>
    );
}
