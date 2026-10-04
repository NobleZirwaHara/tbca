import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Bookmark, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { PageTitle } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Props {
    ctx: { country: string; sector: string; sponsor: string; stage: string; size_band: string };
    resolved: { next_stage: string; evidence_available: string; evidence_required: string; study_categories: string; permission: string; capacity: string; path: { slug: string; name: string; code: string }[]; gate: string };
    sectors: { key: string; label: string; icon: string }[];
    sponsors: string[];
    stages: string[];
    bands: { key: string; label: string }[];
    saved: boolean;
}

function Tile({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" role="radio" aria-checked={active} onClick={onClick} className={cn('relative flex items-center gap-2 rounded-[6px] border px-3 py-2 text-left text-xs transition', active ? 'border-gold-500 bg-gold-50 font-semibold ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300')}>
            {children}
            {active && <CheckCircle2 className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-white text-gold-600" />}
        </button>
    );
}

export default function Context({ ctx, resolved, sectors, sponsors, stages, bands }: Props) {
    const form = useForm({ ...ctx, next: 'build' });
    const submit = (next: 'save' | 'build') => (e?: FormEvent) => {
        e?.preventDefault();
        form.transform((d) => ({ ...d, next }));
        form.post('/project-advisory/context', { preserveScroll: true });
    };
    const sectorLabel = sectors.find((s) => s.key === form.data.sector)?.label;
    const bandLabel = bands.find((b) => b.key === form.data.size_band)?.label;
    const dirty = form.isDirty;
    return (
        <div className="container-tbca py-8">
            <Head title="Context Selector" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Context Selector' }]} title="Context Selector" sub={<><p className="font-semibold text-gold-700">Build the right advisory path for your project before any fee is shown.</p><p>Your project context determines the method, likely evidence, next stage and delivery path.</p></>} />
            <form onSubmit={submit('build')} className="grid gap-5 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                    <div className="grid gap-4 md:grid-cols-12">
                        <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4 md:col-span-3">
                            <legend className="px-1 text-sm font-semibold">1 Country</legend>
                            <Select aria-label="Country" value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Kenya', 'Nigeria', 'Ghana']} />
                            {form.errors.country && <p className="mt-1 text-xs text-risk-500" role="alert">{form.errors.country}</p>}
                            <p className="mt-1 text-[0.6875rem] text-ink-500">Phase 1: South Africa only.</p>
                        </fieldset>
                        <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4 md:col-span-5">
                            <legend className="px-1 text-sm font-semibold">2 Sector</legend>
                            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4" role="radiogroup">
                                {sectors.map((s) => <Tile key={s.key} active={form.data.sector === s.key} onClick={() => form.setData('sector', s.key)}><AdvIcon name={s.icon} className="size-4 text-gold-600" />{s.label}</Tile>)}
                            </div>
                        </fieldset>
                        <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4 md:col-span-4">
                            <legend className="px-1 text-sm font-semibold">3 Sponsor Type</legend>
                            <div className="grid grid-cols-2 gap-2" role="radiogroup">
                                {sponsors.map((s) => <Tile key={s} active={form.data.sponsor === s} onClick={() => form.setData('sponsor', s)}>{s}</Tile>)}
                            </div>
                        </fieldset>
                    </div>
                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="px-1 text-sm font-semibold">4 Current Project Stage</legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup">
                            {stages.map((s) => <Tile key={s} active={form.data.stage === s} onClick={() => form.setData('stage', s)}>{s}</Tile>)}
                        </div>
                    </fieldset>
                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="px-1 text-sm font-semibold">5 Capital or Project-Size Band</legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup">
                            {bands.map((b) => <Tile key={b.key} active={form.data.size_band === b.key} onClick={() => form.setData('size_band', b.key)}>{b.label}</Tile>)}
                        </div>
                    </fieldset>
                    <section>
                        <h2 className="text-sm font-semibold">What this context resolves</h2>
                        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                            {[['Likely Advisory Path', 'Maps the most relevant Project Advisory stages and decision gates.'], ['Probable Studies', 'Identifies the studies and analyses most likely to be required.'], ['Evidence Expectations', 'Clarifies the standard of evidence and what’s needed next.'], ['Delivery Approach', 'Suggests the right engagement model and specialist mix.'], ['Next Client Decision', 'Recommends your next best action and key milestone.']].map(([t, b]) => (
                                <div key={t} className="rounded-[6px] border border-parchment-400 bg-white p-3"><p className="text-xs font-semibold">{t}</p><p className="text-[0.6875rem] text-ink-500">{b}</p></div>
                            ))}
                        </div>
                    </section>
                    <p className="flex items-center gap-2 rounded border border-gold-300 bg-gold-50 px-3 py-2 text-xs"><Info className="size-4" />No fee is displayed until the relevant project context has been resolved.</p>
                </div>
                <aside className="lg:col-span-4">
                    <div className="sticky top-4 rounded-[8px] border border-gold-300 bg-white p-5">
                        <h2 className="font-serif text-lg font-semibold">Your Project Context</h2>
                        <dl className="mt-2 space-y-1 text-xs">
                            {[['Country', form.data.country], ['Sector', sectorLabel], ['Sponsor Type', form.data.sponsor], ['Current Stage', form.data.stage], ['Project-Size Band', bandLabel]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                        </dl>
                        <dl className="mt-3 space-y-1.5 border-t border-parchment-300 pt-3 text-xs">
                            {[['Current stage', ctx.stage, 'bg-gold-100'], ['Likely next Project Advisory stage', resolved.next_stage, 'bg-gold-100'], ['Evidence currently available', resolved.evidence_available, 'bg-attested-50'], ['Evidence likely required', resolved.evidence_required, 'bg-risk-50'], ['Potential external study categories', resolved.study_categories, 'bg-parchment-300'], ['Current permission status', resolved.permission, 'bg-risk-50'], ['Current capacity status', resolved.capacity, 'bg-verified-50']].map(([k, v, c]) => (
                                <div key={k} className="flex items-center justify-between gap-2"><dt className="text-ink-600">{k}</dt><dd className={cn('rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold', c)}>{v}</dd></div>
                            ))}
                        </dl>
                        <div className="mt-3 border-t border-parchment-300 pt-3 text-xs">
                            <p className="font-semibold">Likely advisory path {dirty && <span className="font-normal text-attested-700">(save to refresh)</span>}</p>
                            <ul className="mt-1 list-disc pl-4 text-ink-600">{resolved.path.map((p) => <li key={p.slug}>{p.code} {p.name}</li>)}<li>Next gate: {resolved.gate}</li></ul>
                        </div>
                        <Button type="submit" className="mt-4 w-full" disabled={form.processing} trailingIcon="arrow-right">Build My Advisory Path</Button>
                        <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => submit('save')()}><Bookmark className="size-4" />Save and Continue Later</Button>
                    </div>
                </aside>
            </form>
        </div>
    );
}
