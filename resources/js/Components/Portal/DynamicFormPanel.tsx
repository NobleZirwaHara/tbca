import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import type { FormSpec } from '@/types/portal';
import { DynamicFields } from './DynamicFields';

/** Inline (non-modal) server-described form. */
export function DynamicFormPanel({ spec }: { spec: FormSpec }) {
    const initial: Record<string, unknown> = {};
    for (const f of spec.fields) {
        initial[f.name] = f.value ?? (f.type === 'checkbox' ? false : f.type === 'checkboxes' ? [] : f.type === 'file' ? null : '');
    }
    const form = useForm<Record<string, any>>(initial);
    const hasFile = spec.fields.some((f) => f.type === 'file');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const opts = { preserveScroll: true, forceFormData: hasFile, onSuccess: () => hasFile && form.reset() };
                const m = spec.method ?? 'post';
                if (m === 'put') form.put(spec.action, opts);
                else if (m === 'patch') form.patch(spec.action, opts);
                else form.post(spec.action, opts);
            }}
            className="space-y-4"
        >
            {spec.intro && <p className="text-sm text-ink-600">{spec.intro}</p>}
            <DynamicFields fields={spec.fields} data={form.data} errors={form.errors as Record<string, string>} setData={(k, v) => form.setData(k, v)} />
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {form.processing ? 'Working…' : spec.submit}
                </Button>
            </div>
        </form>
    );
}
