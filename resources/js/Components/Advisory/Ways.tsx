import { Link } from '@inertiajs/react';
import { MessageSquare, Scale } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';

export interface Way { key: string; title: string; body: string; price: string; icon: string; href: string }

export function WaysGrid({ ways, cols = 2 }: { ways: Way[]; cols?: 2 | 4 }) {
    return (
        <div className={cols === 4 ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-3 sm:grid-cols-2'}>
            {ways.map((w) => (
                <Link key={w.key} href={w.href} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-3.5 hover:border-gold-400">
                    <AdvIcon name={w.icon} className="size-6 shrink-0 text-ink-800" />
                    <span>
                        <span className="block text-sm font-semibold text-ink-900">{w.title}</span>
                        <span className="block text-xs text-ink-500">{w.body}</span>
                        <span className={w.price === 'Design only' ? 'mt-1 inline-block rounded bg-gold-100 px-1.5 text-[0.6875rem] text-gold-800' : 'mt-1 block text-xs font-semibold text-verified-700'}>{w.price}</span>
                    </span>
                </Link>
            ))}
        </div>
    );
}

export function FitBand({ dark = false }: { dark?: boolean }) {
    return (
        <section className="container-tbca pb-10">
            <div className={dark ? 'flex flex-col items-start justify-between gap-4 rounded-[10px] bg-ink-950 p-6 text-parchment-100 md:flex-row md:items-center' : 'flex flex-col items-start justify-between gap-4 rounded-[10px] border border-gold-300 bg-gold-50 p-6 md:flex-row md:items-center'}>
                <div className="flex items-center gap-3">
                    <Scale className={dark ? 'size-8 text-gold-400' : 'size-8 text-ink-800'} />
                    <div>
                        <h2 className="font-serif text-xl font-semibold">We recommend by fit, not margin</h2>
                        <p className={dark ? 'text-sm text-ink-300' : 'text-sm text-ink-600'}>You see every viable way to work with TBCA so you can choose what fits your need, timing and budget.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <ButtonLink href="/services/resolver/1" trailingIcon="arrow-right">Find the Right Service</ButtonLink>
                    <ButtonLink href="/services/choice-comparison" variant={dark ? 'outline-light' : 'ink'}>Compare All Options</ButtonLink>
                </div>
            </div>
        </section>
    );
}

export function NotSureBox({ title }: { title: string }) {
    return (
        <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-sm">
            <p className="font-semibold text-ink-900">{title}</p>
            <p className="text-xs text-ink-600">Let us help you check your options.</p>
            <ButtonLink href="/services/resolver/1" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">Find the Right Service</ButtonLink>
            <Link href="/services/proposal-request" className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded border border-gold-500 text-xs font-semibold"><MessageSquare className="size-3.5" />Talk to a Human</Link>
        </div>
    );
}
