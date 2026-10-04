import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';
import type { FieldSpec } from '@/types/portal';

/** Renders FieldSpec[] from the server against an Inertia useForm data bag. */
export function DynamicFields({
    fields,
    data,
    errors,
    setData,
}: {
    fields: FieldSpec[];
    data: Record<string, unknown>;
    errors: Record<string, string>;
    setData: (key: string, value: unknown) => void;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
                if (f.type === 'hidden') return null;
                const span = f.span === 1 ? '' : f.type === 'textarea' || f.type === 'radio' || f.type === 'checkboxes' || f.type === 'checkbox' || f.span === 2 ? 'sm:col-span-2' : '';
                const value = data[f.name];

                if (f.type === 'checkbox') {
                    return (
                        <div key={f.name} className={span}>
                            <Checkbox checked={!!value} onChange={(e) => setData(f.name, e.target.checked)} label={<>{f.label}{f.required && <span className="text-risk-500"> *</span>}</>} />
                            {f.hint && <p className="mt-1 ml-6 text-xs text-ink-400">{f.hint}</p>}
                            {errors[f.name] && <p role="alert" className="mt-1 text-xs font-medium text-risk-500">{errors[f.name]}</p>}
                        </div>
                    );
                }

                if (f.type === 'radio' || f.type === 'checkboxes') {
                    const selected = Array.isArray(value) ? (value as string[]) : [];
                    return (
                        <fieldset key={f.name} className={span}>
                            <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-800">
                                {f.label}
                                {f.required && <span className="text-risk-500"> *</span>}
                            </legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {(f.options ?? []).map((o) => {
                                    const checked = f.type === 'radio' ? value === o.value : selected.includes(o.value);
                                    return (
                                        <label
                                            key={o.value}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-2 rounded-[6px] border p-3 text-sm transition-colors',
                                                checked ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white hover:border-gold-300',
                                            )}
                                        >
                                            <input
                                                type={f.type === 'radio' ? 'radio' : 'checkbox'}
                                                name={f.name}
                                                value={o.value}
                                                checked={checked}
                                                onChange={() =>
                                                    f.type === 'radio'
                                                        ? setData(f.name, o.value)
                                                        : setData(f.name, checked ? selected.filter((s) => s !== o.value) : [...selected, o.value])
                                                }
                                                className="mt-0.5 accent-gold-600"
                                            />
                                            <span>
                                                <span className="font-medium text-ink-900">{o.label}</span>
                                                {o.hint && <span className="block text-xs text-ink-500">{o.hint}</span>}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors[f.name] && <p role="alert" className="mt-1 text-xs font-medium text-risk-500">{errors[f.name]}</p>}
                        </fieldset>
                    );
                }

                return (
                    <Field key={f.name} label={f.label} required={f.required} error={errors[f.name]} hint={f.hint} className={span}>
                        {(id) => {
                            if (f.type === 'select') {
                                return (
                                    <Select id={id} value={(value as string) ?? ''} onChange={(e) => setData(f.name, e.target.value)} options={f.options ?? []} placeholder={f.placeholder ?? 'Select…'} invalid={!!errors[f.name]} />
                                );
                            }
                            if (f.type === 'textarea') {
                                return <Textarea id={id} value={(value as string) ?? ''} onChange={(e) => setData(f.name, e.target.value)} placeholder={f.placeholder} invalid={!!errors[f.name]} readOnly={f.readonly} />;
                            }
                            if (f.type === 'file') {
                                return (
                                    <input
                                        id={id}
                                        type="file"
                                        onChange={(e) => setData(f.name, e.target.files?.[0] ?? null)}
                                        className="block w-full rounded-[4px] border border-dashed border-gold-400 bg-gold-50/40 p-3 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink-900 file:px-3 file:py-1.5 file:text-xs file:text-parchment-100"
                                    />
                                );
                            }
                            return (
                                <Input
                                    id={id}
                                    type={f.type}
                                    value={(value as string | number) ?? ''}
                                    onChange={(e) => setData(f.name, e.target.value)}
                                    placeholder={f.placeholder}
                                    readOnly={f.readonly}
                                    invalid={!!errors[f.name]}
                                />
                            );
                        }}
                    </Field>
                );
            })}
        </div>
    );
}
