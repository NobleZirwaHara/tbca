import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import { ActionButton } from '@/Components/Portal/ActionButton';
import { DynamicFields } from '@/Components/Portal/DynamicFields';
import { Banner, PanelView } from '@/Components/Portal/Panels';
import { Button } from '@/Components/ui/Button';
import { Panel, Stepper } from '@/Components/ui/Kit';
import type { JourneyProps, JourneyStep } from '@/types/portal';

function StepForm({ journey, step }: { journey: string; step: JourneyStep }) {
    const initial: Record<string, unknown> = {};
    for (const f of step.fields) initial[f.name] = f.value ?? (f.type === 'checkbox' ? false : f.type === 'checkboxes' ? [] : f.type === 'file' ? null : '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<Record<string, any>>(initial);
    const hasFile = step.fields.some((f) => f.type === 'file');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.post(`/portal/journeys/${journey}`, { forceFormData: hasFile, preserveScroll: true });
            }}
            className="space-y-5"
        >
            <DynamicFields fields={step.fields} data={form.data} errors={form.errors as Record<string, string>} setData={(k, v) => form.setData(k, v)} />
            <div className="flex flex-wrap justify-between gap-2 border-t border-parchment-300 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => router.post(`/portal/journeys/${journey}/back`)}>
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => window.confirm('Discard this draft and start again?') && router.post(`/portal/journeys/${journey}/restart`)}>
                        Start again
                    </Button>
                    <Button type="submit" size="sm" disabled={form.processing}>
                        {form.processing ? 'Saving…' : 'Save & Continue'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

/** Generic multi-step journey: steps validated and saved server-side, back/next, confirmation screen. */
export default function Journey(p: JourneyProps) {
    const current = p.steps[p.step - 1];

    return (
        <PortalShell title={p.title} code={p.code} icon={p.icon} subtitle={p.subtitle} crumbs={[{ label: 'Journeys', href: '/portal/resume' }, { label: p.title }]}>
            <Head title={p.title} />
            {p.banner && <Banner {...p.banner} />}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
                <div className="min-w-0 space-y-5">
                    <Panel>
                        <Stepper steps={p.steps.map((s) => s.title)} current={p.step} />
                    </Panel>
                    {p.done ? (
                        <Panel>
                            <div className="flex flex-col items-center py-6 text-center">
                                <CheckCircle2 className="size-12 text-verified-500" aria-hidden="true" />
                                <h2 className="mt-3 font-serif text-xl font-bold text-ink-900">{p.done.title}</h2>
                                <p className="mt-2 max-w-xl text-sm text-ink-600">{p.done.body}</p>
                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    {p.done.links.map((l, i) => (
                                        <ActionButton key={i} action={l} />
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    ) : current ? (
                        <Panel title={`Step ${p.step} of ${p.steps.length}: ${current.title}`}>
                            {current.description && <p className="-mt-2 mb-4 text-sm text-ink-600">{current.description}</p>}
                            <StepForm key={`${p.journey}-${p.step}`} journey={p.journey} step={current} />
                        </Panel>
                    ) : null}
                </div>
                <aside className="space-y-4">
                    {p.reference && <p className="rounded-[8px] border border-dashed border-gold-400 bg-gold-50 p-3 text-center font-mono text-sm">{p.reference}</p>}
                    {p.side.map((s, i) => (
                        <PanelView key={i} panel={s} />
                    ))}
                </aside>
            </div>
        </PortalShell>
    );
}

Journey.layout = null;
