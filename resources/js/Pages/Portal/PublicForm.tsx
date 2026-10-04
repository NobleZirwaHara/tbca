import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { DynamicFields } from '@/Components/Portal/DynamicFields';
import { Button } from '@/Components/ui/Button';
import { Stepper } from '@/Components/ui/Kit';
import type { FormSpec } from '@/types/portal';

interface Props {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    message: string | null;
    facts: [string, string | null][];
    steps: string[];
    current: number;
    form: FormSpec | null;
    links?: { label: string; href: string; download?: boolean }[];
    aside: string[];
}

function FormBody({ spec }: { spec: FormSpec }) {
    const initial: Record<string, unknown> = {};
    for (const f of spec.fields) initial[f.name] = f.value ?? (f.type === 'checkbox' ? false : '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<Record<string, any>>(initial);
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.post(spec.action, { preserveScroll: true });
            }}
            className="space-y-4"
        >
            {spec.intro && <p className="text-sm text-ink-600">{spec.intro}</p>}
            <DynamicFields fields={spec.fields} data={form.data} errors={form.errors as Record<string, string>} setData={(k, v) => form.setData(k, v)} />
            <Button type="submit" className="w-full" disabled={form.processing}>
                <Lock className="size-4" aria-hidden="true" /> {spec.submit}
            </Button>
        </form>
    );
}

/** Public portal forms: account activation (CP-SCR-003), recovery (CP-SCR-008) and secure share links. */
export default function PublicForm(p: Props) {
    return (
        <section className="bg-parchment-100 py-10">
            <Head title={p.title} />
            <div className="container-tbca grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="rounded-[10px] border border-parchment-400 bg-white p-6 sm:p-8">
                    {p.eyebrow && <p className="text-xs font-bold tracking-wider text-gold-700 uppercase">{p.eyebrow}</p>}
                    <h1 className="mt-1 font-serif text-2xl font-bold text-ink-900 sm:text-3xl">{p.title}</h1>
                    {p.subtitle && <p className="mt-2 text-sm text-ink-600">{p.subtitle}</p>}
                    {p.steps.length > 0 && <Stepper steps={p.steps} current={p.current} className="mt-6" />}
                    {p.facts.length > 0 && (
                        <dl className="mt-6 grid gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-sm sm:grid-cols-2">
                            {p.facts.map(([k, v]) => (
                                <div key={k}>
                                    <dt className="text-xs text-ink-500">{k}</dt>
                                    <dd className="font-semibold text-ink-900">{v ?? '—'}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    {p.message && <p className="mt-5 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-sm text-controlled-800">{p.message}</p>}
                    {p.form && (
                        <div className="mt-6">
                            <FormBody key={p.form.action + p.current} spec={p.form} />
                        </div>
                    )}
                    {p.links && p.links.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {p.links.map((l) =>
                                l.download ? (
                                    <a key={l.href} href={l.href} className="rounded-[4px] bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                        {l.label}
                                    </a>
                                ) : (
                                    <Link key={l.href} href={l.href} className="rounded-[4px] border border-ink-300 px-4 py-2 text-sm font-medium hover:border-ink-900">
                                        {l.label}
                                    </Link>
                                ),
                            )}
                        </div>
                    )}
                </div>
                <aside className="space-y-4">
                    <div className="rounded-[10px] bg-ink-900 p-5 text-parchment-100">
                        <ShieldCheck className="size-6 text-gold-400" aria-hidden="true" />
                        <p className="mt-2 font-serif text-lg font-bold">Security Notice</p>
                        <ul className="mt-2 space-y-2 text-sm text-parchment-200">
                            {p.aside.map((a) => (
                                <li key={a}>• {a}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[10px] border border-parchment-400 bg-white p-5 text-sm">
                        <p className="font-semibold text-ink-900">Questions?</p>
                        <p className="mt-1 text-ink-600">support@thebusinessclinic.africa · +27 12 001 0567</p>
                    </div>
                </aside>
            </div>
        </section>
    );
}
