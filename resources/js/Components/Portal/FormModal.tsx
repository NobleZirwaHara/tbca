import { createContext, useContext, useState, type ReactNode } from 'react';
import { useForm } from '@inertiajs/react';
import { Modal } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { FormSpec } from '@/types/portal';
import { DynamicFields } from './DynamicFields';

type Ctx = { open: (key: string, overrides?: Record<string, unknown>) => void; has: (key: string) => boolean };

const FormsContext = createContext<Ctx>({ open: () => undefined, has: () => false });

export function useForms() {
    return useContext(FormsContext);
}

function initialData(spec: FormSpec, overrides: Record<string, unknown>) {
    const data: Record<string, unknown> = {};
    for (const f of spec.fields) {
        data[f.name] = f.value ?? (f.type === 'checkbox' ? false : f.type === 'checkboxes' ? [] : f.type === 'file' ? null : '');
    }
    return { ...data, ...overrides };
}

function FormBody({ spec, overrides, onClose }: { spec: FormSpec; overrides: Record<string, unknown>; onClose: () => void }) {
    const form = useForm<Record<string, any>>(initialData(spec, overrides));
    const hasFile = spec.fields.some((f) => f.type === 'file');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const method = spec.method ?? 'post';
        const opts = { preserveScroll: true, forceFormData: hasFile, onSuccess: () => onClose() };
        if (method === 'post') form.post(spec.action, opts);
        else if (method === 'put') form.put(spec.action, opts);
        else if (method === 'patch') form.patch(spec.action, opts);
        else form.delete(spec.action, opts);
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {spec.intro && <p className="text-sm text-ink-600">{spec.intro}</p>}
            <DynamicFields fields={spec.fields} data={form.data} errors={form.errors as Record<string, string>} setData={(k, v) => form.setData(k, v)} />
            <div className="flex justify-end gap-2 border-t border-parchment-300 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" size="sm" disabled={form.processing}>
                    {form.processing ? 'Working…' : spec.submit}
                </Button>
            </div>
        </form>
    );
}

/** Provides modal forms (keyed FormSpec) to any PortalActionButton with `modal`. */
export function FormsProvider({ forms, children }: { forms?: Record<string, FormSpec>; children: ReactNode }) {
    const [active, setActive] = useState<{ key: string; overrides: Record<string, unknown>; n: number } | null>(null);
    const spec = active ? forms?.[active.key] : undefined;

    return (
        <FormsContext.Provider
            value={{
                open: (key, overrides = {}) => setActive((a) => ({ key, overrides, n: (a?.n ?? 0) + 1 })),
                has: (key) => !!forms?.[key],
            }}
        >
            {children}
            <Modal open={!!spec} onClose={() => setActive(null)} title={spec?.title ?? ''} size="lg">
                {spec && active && <FormBody key={active.n} spec={spec} overrides={active.overrides} onClose={() => setActive(null)} />}
            </Modal>
        </FormsContext.Provider>
    );
}
