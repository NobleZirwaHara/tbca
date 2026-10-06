import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Mirrors App\Support\Platform\PaymentOptions::register(). */
export interface PaymentRegister {
    gateways: string[];
    methods: { key: string; label: string; note: string; live: boolean; checkout_method: string | null; status: string }[];
    banks: string[];
    platform_wallet: string;
    note: string;
}

/** Text wordmark tile (no third-party logo files). */
export function Wordmark({ name, muted = false }: { name: string; muted?: boolean }) {
    return (
        <span className={cn('inline-flex h-8 items-center rounded-[4px] border px-2.5 text-[0.75rem] font-bold tracking-tight', muted ? 'border-parchment-400 text-ink-500' : 'border-parchment-500 text-ink-800')}>
            {name}
        </span>
    );
}

/** Compact "We Accept" panel: live methods, then gateways and banks as wordmark tiles. */
export function AcceptedPayments({ register, className }: { register: PaymentRegister; className?: string }) {
    return (
        <div className={cn('space-y-3', className)}>
            <div>
                <p className="text-[0.6875rem] font-semibold tracking-wide text-ink-500 uppercase">Available now</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {['VISA', 'Mastercard', 'EFT', 'TBCA Wallet'].map((m) => (
                        <Wordmark key={m} name={m} />
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[0.6875rem] font-semibold tracking-wide text-ink-500 uppercase">Payment partners · coming soon</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {register.gateways.map((g) => (
                        <Wordmark key={g} name={g} muted />
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[0.6875rem] font-semibold tracking-wide text-ink-500 uppercase">Banks</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {register.banks.map((b) => (
                        <Wordmark key={b} name={b} muted />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Full list of the 11 payment methods with live / coming-soon status. */
export function PaymentMethodList({ register, className }: { register: PaymentRegister; className?: string }) {
    return (
        <ul className={cn('grid gap-2 sm:grid-cols-2', className)}>
            {register.methods.map((m) => (
                <li key={m.key} className="flex gap-2.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                    {m.live ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified-700" aria-hidden="true" /> : <Clock className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />}
                    <span className="min-w-0 text-[0.8125rem]">
                        <span className="block font-semibold text-ink-900">{m.label}</span>
                        <span className="block text-ink-600">{m.note}</span>
                        <span className={cn('mt-1 inline-block rounded-full px-1.5 text-[0.625rem] font-semibold', m.live ? 'bg-verified-50 text-verified-700' : 'bg-parchment-200 text-ink-600')}>{m.status}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
