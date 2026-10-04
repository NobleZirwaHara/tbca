import { Head, Link, useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Progress } from '@/Components/ui/Kit';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { Card, KV } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Group { key: string; title: string; multi: boolean; hint: string; options: [string, string, string][] }
type Config = Record<string, string | string[]>;
interface Props { journey: JourneyState; options: Group[]; config: Config; summary: { score: number; label: string; complexity: string; timeline: string }; defaults: Config }

/** Mirrors TechContent::configSummary(). */
function summarise(groups: Group[], c: Config) {
    const rank = (k: string) => Math.max(0, groups.find((g) => g.key === k)!.options.findIndex((o) => o[0] === c[k]));
    const len = (k: string) => (Array.isArray(c[k]) ? (c[k] as string[]).length : 0);
    const points = len('agents') * 2 + len('integrations') * 2 + rank('automation') * 2 + rank('analytics') + rank('deployment') + rank('scale') * 2;
    const complexity = points >= 16 ? 'High' : points >= 9 ? 'Medium' : 'Low';
    const timeline = complexity === 'High' ? '8 – 12 weeks' : complexity === 'Medium' ? '5 – 8 weeks' : '3 – 5 weeks';
    const score = Math.min(100, 40 + len('agents') * 4 + len('integrations') * 4 + rank('security') * 8 + len('compliance') * 3 + rank('support') * 3);
    return { score, label: score >= 80 ? 'Strong Architecture' : score >= 60 ? 'Sound Architecture' : 'Basic Architecture', complexity, timeline };
}

export default function Configure({ journey, options, config, defaults }: Props) {
    const form = useForm({ ...config, compliance: (config.compliance as string[]) ?? [], next: 'save' } as Config & { next: string });
    const data = form.data as Config;
    const s = summarise(options, data);
    const toggle = (k: string, v: string) => {
        const cur = (data[k] as string[]) ?? [];
        form.setData(k as never, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]) as never);
    };
    const post = (next: 'save' | 'continue') => {
        form.transform((d) => ({ ...d, next }));
        form.post('/technology-solutions/configure', { preserveScroll: true });
    };
    const label = (k: string) => options.find((g) => g.key === k)!.options.find((o) => o[0] === data[k])?.[1] ?? '—';
    return (
        <>
            <Head title="AI Solution Architect Configurator" />
            <TechJourney step={4} journey={journey} title="AI Solution Architect Configurator" sub="Design your intelligent operating system. Configure AI agents, automation workflows, data integrations and governance to match your business goals."
                footer={<><Link href="/technology-solutions/readiness" className="text-sm">← Back to Previous Step</Link><div className="flex gap-2"><Button variant="outline" onClick={() => post('save')} disabled={form.processing}>Save Configuration</Button><Button onClick={() => post('continue')} disabled={form.processing} trailingIcon="arrow-right">Review & Continue</Button></div></>}>
                <div className="grid gap-4 xl:grid-cols-12">
                    <section className="rounded-[8px] border border-gold-300 bg-gold-50/40 p-4 xl:col-span-8">
                        <h2 className="font-semibold">Configure Your AI Operating System</h2>
                        <p className="text-xs text-ink-500">Select the capabilities, integrations and governance that best fit your needs.</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {options.map((g, gi) => (
                                <fieldset key={g.key} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                    <legend className="px-1 text-sm font-semibold">{gi + 1}. {g.title}</legend>
                                    <p className="mb-2 text-[0.6875rem] text-ink-500">{g.hint}</p>
                                    <div className="space-y-1">
                                        {g.options.map(([v, t, d]) => {
                                            const checked = g.multi ? ((data[g.key] as string[]) ?? []).includes(v) : data[g.key] === v;
                                            return (
                                                <label key={v} className={cn('flex cursor-pointer items-start gap-2 rounded px-2 py-1 text-xs', checked && 'bg-gold-50')}>
                                                    <input type={g.multi ? 'checkbox' : 'radio'} name={g.key} checked={checked} onChange={() => (g.multi ? toggle(g.key, v) : form.setData(g.key as never, v as never))} className="mt-0.5 accent-gold-600" />
                                                    <span><b>{t}</b><span className="block text-ink-500">{d}</span></span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {g.key === 'security' && (
                                        <div className="mt-2 border-t border-parchment-300 pt-2"><p className="text-[0.6875rem] font-semibold">Compliance Frameworks</p><div className="mt-1 flex flex-wrap gap-2">{['POPIA', 'ISO 27001', 'GDPR', 'PCI DSS'].map((f) => <label key={f} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={((data.compliance as string[]) ?? []).includes(f)} onChange={() => toggle('compliance', f)} className="accent-gold-600" />{f}</label>)}</div></div>
                                    )}
                                </fieldset>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded bg-white p-3 text-xs"><span className="flex items-center gap-1.5"><Info className="size-4" />Your configuration is saved when you click Save. You can modify any selection before proceeding to fees.</span><Button size="sm" variant="ghost" onClick={() => form.setData({ ...defaults, compliance: (defaults.compliance as string[]) ?? [], next: 'save' } as never)}>Reset All</Button></div>
                    </section>
                    <aside className="xl:col-span-4">
                        <Card title="Solution Architecture Summary" action={<span className="rounded bg-attested-50 px-2 text-xs text-attested-700">In Progress</span>}>
                            <p className="text-xs text-ink-500">Configuration Score</p>
                            <p className="text-3xl font-bold">{s.score}<span className="text-sm text-ink-500"> / 100</span></p>
                            <p className="text-xs font-semibold text-verified-700">{s.label}</p>
                            <Progress value={s.score} tone="good" className="mt-1" />
                            <KV className="mt-3" rows={[['AI Agents', `${((data.agents as string[]) ?? []).length} of 5 selected`], ['Automation', label('automation')], ['Integrations', `${((data.integrations as string[]) ?? []).length} of 5 selected`], ['Analytics', label('analytics')], ['Security', label('security')], ['Deployment', label('deployment')], ['Scalability', label('scale')], ['Support', label('support')], ['Est. Implementation', s.timeline], ['Complexity Level', s.complexity], ['Est. Investment', 'Final pricing in next step']]} />
                            <Button className="mt-4 w-full" onClick={() => post('continue')} trailingIcon="arrow-right">Review & Continue</Button>
                        </Card>
                    </aside>
                </div>
            </TechJourney>
        </>
    );
}
