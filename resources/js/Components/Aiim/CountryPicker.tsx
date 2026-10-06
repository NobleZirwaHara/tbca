import { router } from '@inertiajs/react';
import { ChevronDown, Search } from 'lucide-react';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import type { CountryOption } from '@/types/aiim';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Searchable select of Africa's 54 countries (type to filter by name, ISO code or
 * region). Choosing a country opens its Investor Cockpit unless `onSelect` is given.
 */
export default function CountryPicker({
    countries,
    value,
    onSelect,
    placeholder = 'Search 54 African countries…',
    tone = 'dark',
    className,
    label = 'Choose a country',
}: {
    countries: CountryOption[];
    value?: string | null;
    onSelect?: (slug: string) => void;
    placeholder?: string;
    tone?: 'dark' | 'light';
    className?: string;
    label?: string;
}) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const current = countries.find((c) => c.slug === value);
    const dark = tone === 'dark';

    const matches = useMemo(() => {
        const needle = fold(q.trim());
        return needle ? countries.filter((c) => fold(`${c.name} ${c.iso2} ${c.regionName}`).includes(needle)) : countries;
    }, [countries, q]);

    const choose = (c: CountryOption) => {
        setOpen(false);
        setQ('');
        if (onSelect) onSelect(c.slug);
        else router.visit(`/aiim/country/${c.slug}`);
    };

    const move = (to: number) => {
        const next = Math.max(0, Math.min(matches.length - 1, to));
        setActive(next);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
    };

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); move(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(active - 1); }
        else if (e.key === 'Enter' && open && matches[active]) { e.preventDefault(); choose(matches[active]); }
        else if (e.key === 'Escape') setOpen(false);
    };

    return (
        <div className={cn('relative', className)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
            <label htmlFor={`${id}-input`} className="sr-only">{label}</label>
            <span className={cn('flex h-12 items-center gap-2 rounded-[4px] border px-3', dark ? 'border-gold-600/60 bg-ink-900 text-parchment-100' : 'border-parchment-500 bg-white text-ink-900')}>
                {current && !open ? <span aria-hidden="true">{current.flag}</span> : <Search className="size-4 shrink-0 text-ink-400" />}
                <input
                    id={`${id}-input`}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${id}-list`}
                    aria-autocomplete="list"
                    aria-activedescendant={open && matches[active] ? `${id}-${matches[active].slug}` : undefined}
                    autoComplete="off"
                    value={open ? q : (current?.name ?? '')}
                    placeholder={current ? current.name : placeholder}
                    onFocus={() => { setOpen(true); setActive(0); }}
                    onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
                    onKeyDown={onKey}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
                />
                <ChevronDown className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
            </span>
            {open && (
                <ul id={`${id}-list`} ref={listRef} role="listbox" aria-label="African countries" className={cn('absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-[6px] border py-1 shadow-lg', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white text-ink-900')}>
                    {matches.length === 0 && <li className="px-3 py-2 text-xs text-ink-400">No country matches “{q}”.</li>}
                    {matches.map((c, i) => (
                        <li
                            key={c.slug}
                            id={`${id}-${c.slug}`}
                            role="option"
                            aria-selected={c.slug === value}
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(c)}
                            onMouseEnter={() => setActive(i)}
                            className={cn('flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm', i === active && (dark ? 'bg-ink-800' : 'bg-parchment-200'), c.slug === value && 'font-semibold text-gold-500')}
                        >
                            <span aria-hidden="true">{c.flag}</span>
                            <span className="flex-1">{c.name}</span>
                            <span className="text-[0.65rem] text-ink-400">{c.regionName}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
