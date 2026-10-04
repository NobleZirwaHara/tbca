import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckOption {
    value: string;
    label: string;
    count?: number;
}

/** Collapsible checkbox facet; onToggle receives the next selected list. */
export default function FilterCheckboxes({
    title,
    options,
    selected,
    onChange,
    limit = 6,
}: {
    title: string;
    options: CheckOption[];
    selected: string[];
    onChange: (next: string[]) => void;
    limit?: number;
}) {
    const [open, setOpen] = useState(true);
    const [more, setMore] = useState(false);
    const visible = more ? options : options.slice(0, limit);
    const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

    return (
        <fieldset className="border-t border-parchment-300 pt-3 first:border-0 first:pt-0">
            <legend className="w-full">
                <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-[0.8125rem] font-semibold text-ink-900" aria-expanded={open}>
                    {title}
                    <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                </button>
            </legend>
            {open && (
                <ul className="mt-2 space-y-1.5">
                    {visible.map((o) => (
                        <li key={o.value}>
                            <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink-700">
                                <input type="checkbox" className="size-4 accent-gold-600" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                                <span className="flex-1">{o.label}</span>
                                {o.count !== undefined && <span className="text-xs text-ink-400">{o.count}</span>}
                            </label>
                        </li>
                    ))}
                    {options.length > limit && (
                        <li>
                            <button type="button" onClick={() => setMore((m) => !m)} className="text-xs font-semibold text-gold-700">
                                {more ? 'Show less' : 'Show more'}
                            </button>
                        </li>
                    )}
                    {options.length === 0 && <li className="text-xs text-ink-400">No options</li>}
                </ul>
            )}
        </fieldset>
    );
}

/** Small labelled select used in shop filter bars. */
export function FilterSelect({ label, value, options, onChange, className }: { label: string; value: string; options: CheckOption[]; onChange: (v: string) => void; className?: string }) {
    return (
        <label className={cn('block text-xs font-medium text-ink-600', className)}>
            <span className="sr-only sm:not-sr-only">{label}</span>
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-0.5 block h-9 w-full rounded-[4px] border border-gold-400/70 bg-white px-2 text-[0.8125rem] font-medium text-ink-900"
            >
                <option value="">{label}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </label>
    );
}
