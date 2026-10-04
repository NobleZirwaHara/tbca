import { BarChart3, Building2, Factory, Mountain, Ship, Sun, Waves, Wheat } from 'lucide-react';
import { cn } from '@/lib/cn';

const art = {
    city: ['from-controlled-700 via-ink-800 to-gold-800', Building2],
    solar: ['from-controlled-500 via-controlled-700 to-ink-900', Sun],
    port: ['from-controlled-700 via-ink-800 to-risk-700', Ship],
    mine: ['from-ink-600 via-ink-800 to-attested-700', Mountain],
    data: ['from-controlled-700 via-ink-900 to-controlled-500', BarChart3],
    coast: ['from-controlled-500 via-verified-700 to-attested-500', Waves],
    farm: ['from-verified-700 via-verified-500 to-attested-500', Wheat],
    factory: ['from-ink-700 via-ink-900 to-gold-800', Factory],
} as const;

/** Gradient illustration standing in for brief cover photos. */
export default function BriefArt({ image, className }: { image: string; className?: string }) {
    const [grad, Icon] = art[image as keyof typeof art] ?? art.city;
    return (
        <div className={cn('flex items-center justify-center bg-gradient-to-br', grad, className)} aria-hidden="true">
            <Icon className="size-10 text-white/80" />
        </div>
    );
}
