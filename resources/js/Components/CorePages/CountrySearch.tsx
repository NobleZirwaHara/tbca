import { router } from '@inertiajs/react';
import { ChevronDown, Search } from 'lucide-react';
import { useId, useState, type KeyboardEvent } from 'react';
import { Flag } from '@/Components/CorePages/Kit';
import { cn } from '@/lib/cn';

interface Option {
    iso: string;
    name: string;
    region: string;
}

/**
 * "Search Countries" combobox: type to filter, or open the dropdown to pick any of the 54 African
 * countries (grouped by region). Choosing a country opens its profile; Enter on free text filters the list.
 */
export default function CountrySearch({ countries, initial = '', onSearch, inputClassName }: { countries: Option[]; initial?: string; onSearch?: (q: string) => void; inputClassName?: string }) {
    const id = useId();
    const [q, setQ] = useState(initial);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    const term = q.trim().toLowerCase();
    const matches = [...countries]
        .sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name))
        .filter((c) => !term || c.name.toLowerCase().includes(term) || c.iso.toLowerCase() === term);

    const pick = (c: Option) => {
        setOpen(false);
        setQ(c.name);
        router.visit(`/find-the-right-service/countries/${c.iso.toLowerCase()}`);
    };

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, matches.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (open && matches[active]) {
                pick(matches[active]);
            } else {
                onSearch?.(q);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    let lastRegion = '';

    return (
        <div className="relative">
            <label htmlFor={`${id}-input`} className="text-[0.75rem] font-semibold text-parchment-100">Search Countries</label>
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2 mt-0.5 size-3.5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <input
                    id={`${id}-input`}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${id}-list`}
                    aria-autocomplete="list"
                    aria-activedescendant={open && matches[active] ? `${id}-${matches[active].iso}` : undefined}
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setActive(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onKeyDown={onKey}
                    placeholder="All 54 countries…"
                    className={cn(inputClassName, 'pr-7 pl-7')}
                />
                <button type="button" tabIndex={-1} aria-label="Show all countries" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen((o) => !o)} className="absolute top-1/2 right-2 mt-0.5 -translate-y-1/2 text-ink-400">
                    <ChevronDown className="size-4" />
                </button>
            </div>
            {open && (
                <ul id={`${id}-list`} role="listbox" className="absolute z-30 mt-1 max-h-72 w-full min-w-[15rem] overflow-y-auto rounded-[6px] border border-ink-700 bg-ink-900 py-1 text-[0.8125rem] shadow-lg">
                    {matches.length === 0 && <li className="px-3 py-2 text-ink-400">No country matches “{q}”.</li>}
                    {matches.map((c, i) => {
                        const header = c.region !== lastRegion ? c.region : null;
                        lastRegion = c.region;
                        return (
                            <li key={c.iso} role="presentation">
                                {header && <p className="px-3 pt-2 pb-1 text-[0.625rem] font-bold tracking-wider text-gold-400 uppercase">{header}</p>}
                                <div
                                    id={`${id}-${c.iso}`}
                                    role="option"
                                    aria-selected={i === active}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => pick(c)}
                                    className={cn('flex cursor-pointer items-center gap-2 px-3 py-1.5 text-parchment-100', i === active && 'bg-ink-800')}
                                >
                                    <Flag iso={c.iso} />
                                    <span className="flex-1">{c.name}</span>
                                    <span className="text-[0.6875rem] text-ink-400">{c.iso}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
