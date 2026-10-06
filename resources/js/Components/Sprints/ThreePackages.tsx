import { Link } from '@inertiajs/react';
import { ArrowRight, CircleCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { SprintPackage, SprintRecord } from '@/types';

type Pkg = SprintPackage & { description?: string | null };

/**
 * Basic / Standard / Premium package cards. Every sprint sells exactly these three
 * (normalised server-side); unpriced tiers route to a quote / proposal request.
 */
export default function ThreePackages({ sprint, title = 'Choose Your Package', per, className }: { sprint: SprintRecord; title?: string; per?: string; className?: string }) {
    const price = usePrice('On request');
    const packages = (sprint.packages ?? []) as Pkg[];
    if (!packages.length) return null;

    const proposalOnly = sprint.commercial_act === 'quote' || sprint.commercial_act === 'retainer';

    return (
        <section id="packages" aria-labelledby="three-packages-h" className={cn('scroll-mt-40 rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <h2 id="three-packages-h" className="text-base font-bold text-ink-900">{title}</h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
                {packages.map((p) => {
                    const quote = proposalOnly || p.zar === null;
                    const href = quote ? `/sprints/${sprint.slug}/quote?package=${p.key}` : `/sprints/${sprint.slug}/order?package=${p.key}`;
                    return (
                        <li key={p.key} className={cn('relative flex flex-col rounded-[8px] border p-4', p.popular ? 'border-gold-500 bg-gold-50/60' : 'border-parchment-400')}>
                            {p.popular && <span className="absolute -top-2.5 left-4 rounded-[3px] bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">Most Popular</span>}
                            <p className="text-sm font-bold text-ink-900">{p.name}</p>
                            <p className="mt-1 text-xl font-bold text-ink-900">
                                {p.zar === 0 ? 'Free' : price(p.zar)}
                                {p.zar !== null && p.zar > 0 && per && <span className="ml-1 text-xs font-normal text-ink-500">{per}</span>}
                            </p>
                            {p.delivery && (
                                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-600">
                                    <Clock className="size-3.5 text-gold-600" aria-hidden="true" /> {p.delivery}
                                </p>
                            )}
                            {p.description && <p className="mt-2 text-[0.75rem] text-ink-600">{p.description}</p>}
                            <ul className="mt-2 flex-1 space-y-1">
                                {(p.features ?? []).slice(0, 5).map((f) => (
                                    <li key={f} className="flex items-start gap-1.5 text-[0.75rem] text-ink-700">
                                        <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={href}
                                className={cn(
                                    'mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] text-[0.8125rem] font-semibold',
                                    p.popular ? 'bg-gold-500 text-ink-900 hover:bg-gold-400' : 'border border-gold-500 text-ink-900 hover:bg-gold-50',
                                )}
                            >
                                {quote ? `Request ${p.name} Proposal` : `Choose ${p.name}`} <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
