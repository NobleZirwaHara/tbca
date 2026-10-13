import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * Form primitives shared by every section. Pair them with Inertia's useForm:
 *
 *   const form = useForm({ email: '' });
 *   <Field label="Email" error={form.errors.email} required>
 *     {(id) => <Input id={id} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}
 *   </Field>
 */

const control =
    'w-full rounded-[4px] border border-parchment-500 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-300 ' +
    'transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none ' +
    'disabled:cursor-not-allowed disabled:bg-parchment-200 aria-[invalid=true]:border-risk-500';

export function Field({
    label,
    hint,
    error,
    required,
    className,
    children,
}: {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    className?: string;
    children: (id: string) => ReactNode;
}) {
    const id = useId();

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <label htmlFor={id} className="block text-[0.8125rem] font-medium text-ink-800">
                    {label}
                    {required && <span className="ms-0.5 text-risk-500">*</span>}
                </label>
            )}
            {children(id)}
            {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
            {error && (
                <p role="alert" className="text-xs font-medium text-risk-500">
                    {error}
                </p>
            )}
        </div>
    );
}

export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    return <input aria-invalid={invalid || undefined} className={cn(control, 'h-10', className)} {...rest} />;
}

export function Textarea({ className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    return <textarea aria-invalid={invalid || undefined} className={cn(control, 'min-h-24 py-2', className)} {...rest} />;
}

type SelectOption = string | { value: string; label: string };

/** A labelled group of options, rendered as an <optgroup>. */
export interface SelectGroup {
    group: string;
    options: SelectOption[];
}

function renderOption(o: SelectOption) {
    const opt = typeof o === 'string' ? { value: o, label: o } : o;

    return (
        <option key={opt.value} value={opt.value}>
            {opt.label}
        </option>
    );
}

export function Select({
    className,
    options,
    placeholder,
    invalid,
    ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
    options: (SelectOption | SelectGroup)[];
    placeholder?: string;
    invalid?: boolean;
}) {
    return (
        <select aria-invalid={invalid || undefined} className={cn(control, 'h-10 pe-8', className)} {...rest}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) =>
                typeof o === 'object' && 'group' in o ? (
                    <optgroup key={o.group} label={o.group}>
                        {o.options.map(renderOption)}
                    </optgroup>
                ) : (
                    renderOption(o)
                ),
            )}
        </select>
    );
}

export function Checkbox({
    label,
    className,
    ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode }) {
    return (
        <label className={cn('flex cursor-pointer items-start gap-2.5 text-sm text-ink-700', className)}>
            <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded-[3px] border-parchment-500 accent-gold-600" {...rest} />
            <span>{label}</span>
        </label>
    );
}

/**
 * Selectable card used for payment methods, packages, client types and similar single choices.
 */
export function ChoiceCard({
    selected,
    onSelect,
    title,
    description,
    icon,
    aside,
    className,
}: {
    selected: boolean;
    onSelect: () => void;
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    aside?: ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                'flex w-full items-center gap-3 rounded-[6px] border px-4 py-3 text-start transition-colors',
                selected ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300',
                className,
            )}
        >
            <span
                className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    selected ? 'border-gold-600' : 'border-ink-300',
                )}
            >
                {selected && <span className="size-2 rounded-full bg-gold-600" />}
            </span>
            {icon && <span className="shrink-0 text-ink-700">{icon}</span>}
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{title}</span>
                {description && <span className="block text-xs text-ink-400">{description}</span>}
            </span>
            {aside && <span className="shrink-0 text-sm font-semibold text-ink-900">{aside}</span>}
        </button>
    );
}
