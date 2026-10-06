import { Check, Clock, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { MkPackage, MkPackageRow } from '@/types/marketplace';

/** Basic / Standard / Premium package cards for a Marketplace service. Selecting a card sets the package used for ordering or a brief. */
export function PackageCards({
    packages,
    value,
    onChange,
    recurring = false,
}: {
    packages: MkPackage[];
    value: string;
    onChange: (key: MkPackage['key']) => void;
    recurring?: boolean;
}) {
    const price = usePrice();

    return (
        <div role="radiogroup" aria-label="Choose a package" className="grid gap-4 md:grid-cols-3">
            {packages.map((p) => {
                const active = p.key === value;
                return (
                    <button
                        key={p.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(p.key)}
                        className={cn(
                            'relative flex flex-col rounded-[8px] border bg-white p-4 text-left transition-colors',
                            active ? 'border-gold-500 ring-2 ring-gold-400/60' : 'border-parchment-400 hover:border-gold-400',
                        )}
                    >
                        {p.recommended && <span className="absolute -top-2.5 right-3 rounded-full bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">Most popular</span>}
                        <span className="flex items-center justify-between gap-2">
                            <span className="font-serif text-lg font-bold text-ink-900">{p.name}</span>
                            <span aria-hidden="true" className={cn('flex size-4 items-center justify-center rounded-full border', active ? 'border-gold-600' : 'border-ink-300')}>
                                {active && <span className="size-2 rounded-full bg-gold-600" />}
                            </span>
                        </span>
                        <span className="mt-1 text-2xl font-bold text-ink-900">
                            {price(p.priceZar)}
                            {recurring && <span className="text-sm font-normal text-ink-500"> / month</span>}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-ink-500"><Clock className="size-3.5" aria-hidden="true" /> {p.delivery}</span>
                        <span className="mt-3 text-[0.8125rem] text-ink-700">{p.scope}</span>
                        <ul className="mt-3 space-y-1.5 text-xs text-ink-700">
                            {p.features.slice(-4).map((f) => (
                                <li key={f} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-verified-600" aria-hidden="true" />{f}</li>
                            ))}
                        </ul>
                    </button>
                );
            })}
        </div>
    );
}

/** Side-by-side comparison of the three packages: price, delivery, revisions, support and every scope feature. */
export function PackageComparison({ packages, rows, value, onChange }: { packages: MkPackage[]; rows: MkPackageRow[]; value: string; onChange: (key: MkPackage['key']) => void }) {
    const price = usePrice();
    const head = (label: string, get: (p: MkPackage) => string | undefined) => (
        <tr className="border-b border-parchment-300">
            <th scope="row" className="py-2 pr-3 text-left font-semibold text-ink-800">{label}</th>
            {packages.map((p) => <td key={p.key} className={cn('px-3 py-2 text-center', p.key === value && 'bg-gold-50')}>{get(p) ?? '—'}</td>)}
        </tr>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-[0.8125rem]">
                <caption className="sr-only">Package comparison</caption>
                <thead>
                    <tr className="border-b border-parchment-400">
                        <th scope="col" className="py-2 pr-3 text-left text-xs font-semibold text-ink-500">Compare packages</th>
                        {packages.map((p) => (
                            <th key={p.key} scope="col" className={cn('px-3 py-2 text-center', p.key === value && 'bg-gold-50')}>
                                <button type="button" onClick={() => onChange(p.key)} className="font-serif text-base font-bold text-ink-900 hover:text-gold-700" aria-pressed={p.key === value}>{p.name}</button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {head('Price', (p) => price(p.priceZar))}
                    {head('Delivery time', (p) => p.delivery)}
                    {head('Revisions', (p) => p.revisions)}
                    {head('Support', (p) => p.support)}
                    {rows.map((r) => (
                        <tr key={r.label} className="border-b border-parchment-300">
                            <th scope="row" className="py-2 pr-3 text-left font-normal text-ink-700">{r.label}</th>
                            {packages.map((p) => (
                                <td key={p.key} className={cn('px-3 py-2 text-center', p.key === value && 'bg-gold-50')}>
                                    {r[p.key] ? <Check className="mx-auto size-4 text-verified-600" aria-label="Included" /> : <Minus className="mx-auto size-4 text-ink-300" aria-label="Not included" />}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
