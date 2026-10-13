import { router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, Field, KpPage, Select, Textarea, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';

interface Flaw { id: string; title: string; sev: 'critical' | 'high' | 'medium'; impact: string; likelihood: string; why: string; guide: string }

interface Props extends KpShared {
    input: { name: string; industry: string; type: string; stage: string; band: string; location: string; description: string };
    industries: string[];
    types: string[];
    stages: string[];
    bands: { key: string; label: string; zar: number }[];
    result: { flaws: Flaw[]; score: number; label: string; counts: { critical: number; high: number; medium: number } } | null;
}

const SEV = { critical: ['Critical', 'bg-risk-500 text-white', 'text-risk-500'], high: ['High', 'bg-attested-500 text-white', 'text-attested-500'], medium: ['Medium', 'bg-gold-400 text-ink-900', 'text-gold-600'] } as const;

/** KP-SCR-023 Project Fatal-Flaw Explorer. */
export default function FatalFlaw({ screen, kpNav, input, industries, types, stages, bands, result }: Props) {
    const price = usePrice();
    const [f, setF] = useState(input);
    const [tab, setTab] = useState<'all' | Flaw['sev']>('all');
    const [open, setOpen] = useState<string | null>(null);
    const flaws = result?.flaws.filter((x) => tab === 'all' || x.sev === tab) ?? [];

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Project Fatal-Flaw Explorer']]}
            title="Project Fatal-Flaw Explorer"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            subtitle="Find the deal-breakers before you commit time, money or reputation."
            intro="Explore the critical risks that could cause your project to fail."
            left={
                <form className="space-y-3 rounded-[10px] border border-parchment-400 bg-white p-4" onSubmit={(e) => { e.preventDefault(); router.get(`${BASE}/project-fatal-flaw`, f, { preserveScroll: true }); }}>
                    <h2 className="font-serif font-bold text-ink-900">Your Project Snapshot</h2>
                    <p className="text-[0.75rem] text-ink-500">Provide key details about your project so we can test it for fatal flaws.</p>
                    <Field label="Project Type"><Select required value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder="Select..." options={types} /></Field>
                    <Field label="Industry"><Select required value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} placeholder="Select..." options={industries} /></Field>
                    <Field label="Project Stage"><Select required value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} placeholder="Select..." options={stages} /></Field>
                    <Field label="Investment Size"><Select value={f.band} onChange={(e) => setF({ ...f, band: e.target.value })} placeholder="Select..." options={bands.map((b) => ({ value: b.key, label: b.label }))} /></Field>
                    <Field label="Target Market"><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className="mt-1 h-10 w-full rounded-[6px] border border-parchment-500 px-3 text-[0.875rem]" placeholder="e.g. South Africa" /></Field>
                    <Field label="Brief Project Description" hint={`${f.description.length}/1500 characters`}><Textarea rows={4} maxLength={1500} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="We are building..." /></Field>
                    <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-referenced-500 font-semibold text-white">Run Fatal-Flaw Explorer <L.ArrowRight className="size-4" /></button>
                </form>
            }
            rail={
                <>
                    {result && (
                        <Box title="Risk Summary">
                            <div className="flex items-center gap-4">
                                <span className="flex size-20 flex-col items-center justify-center rounded-full border-8 border-attested-500"><span className="text-xl font-bold text-ink-900">{result.flaws.length}</span><span className="text-[0.5625rem] text-ink-500">flaws</span></span>
                                <ul className="space-y-1 text-[0.75rem]">{(['critical', 'high', 'medium'] as const).map((k) => <li key={k} className="flex items-center gap-2"><span className={cn('size-2.5 rounded-full', SEV[k][1].split(' ')[0])} />{SEV[k][0]}: {result.counts[k]}</li>)}</ul>
                            </div>
                            <p className="mt-3 text-[0.8125rem] font-semibold text-ink-900">{result.label} (score {result.score} / 100)</p>
                        </Box>
                    )}
                    <Box title="What is a Fatal Flaw?" icon="shield" tone="purple">
                        <p className="text-[0.8125rem]">A critical weakness that could cause the project to fail, be blocked by regulators or destroy expected value.</p>
                    </Box>
                    <Box title="Improve Your Analysis">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            <li><a href={`${BASE}/ask?q=${encodeURIComponent('What are the key risks in project development?')}`} className="hover:text-gold-700">Talk to the KP Knowledge Assistant</a></li>
                            <li><a href={`${BASE}/boardroom-challenger`} className="hover:text-gold-700">Run a Boardroom Challenge</a></li>
                            <li><a href={`${BASE}/funder-readiness`} className="hover:text-gold-700">Use the Funder Readiness Interviewer</a></li>
                            <li><a href={`${BASE}/resources?category=checklist`} className="hover:text-gold-700">Download risk checklists</a></li>
                        </ul>
                    </Box>
                    <Box title="Need Expert Help?" tone="cream">
                        <p className="text-[0.8125rem]">Our project advisers can help you close gaps and de-risk your project.</p>
                        <BtnLink href={`${BASE}/project-development`} className="mt-2 w-full" icon="arrow-right">Open the Project Desk</BtnLink>
                    </Box>
                </>
            }
        >
            {!result ? (
                <section className="rounded-[12px] border border-dashed border-referenced-500/40 bg-white p-8 text-center">
                    <L.ShieldAlert className="mx-auto size-10 text-referenced-500" aria-hidden="true" />
                    <p className="mt-3 font-serif text-[1.25rem] font-bold text-ink-900">Describe your project to run the explorer</p>
                    <p className="mt-1 text-[0.875rem] text-ink-600">Choose a project type, industry and stage. The explorer checks {types.length} project types against TBCA's deal-breaker rules.</p>
                </section>
            ) : (
                <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                    <header className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-referenced-500 text-white"><L.ShieldAlert className="size-5" aria-hidden="true" /></span><div><h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Fatal-Flaw Explorer Results</h2><p className="text-[0.75rem] text-ink-500">{[input.type, input.industry, input.stage, bands.find((b) => b.key === input.band) ? `about ${price(bands.find((b) => b.key === input.band)!.zar)}` : null].filter(Boolean).join(' | ')}</p></div></div>
                        <span className="rounded-[6px] border border-risk-500/40 bg-risk-50 px-3 py-1 text-[0.8125rem] font-bold text-risk-700">{result.flaws.length} Fatal Flaws Found</span>
                    </header>
                    <div role="tablist" className="mt-4 flex gap-1 border-b border-parchment-300">
                        {([['all', `All (${result.flaws.length})`], ['critical', `Critical (${result.counts.critical})`], ['high', `High (${result.counts.high})`], ['medium', `Medium (${result.counts.medium})`]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('px-3 py-2 text-[0.8125rem]', tab === k ? 'border-b-2 border-referenced-500 font-bold text-referenced-500' : 'text-ink-600')}>{l}</button>)}
                    </div>
                    {flaws.length === 0 ? <p className="py-6 text-center text-[0.875rem] text-ink-500">No flaws in this group.</p> : (
                        <ol className="divide-y divide-parchment-300">
                            {flaws.map((x, i) => (
                                <li key={x.id} className="py-3">
                                    <div className="flex flex-wrap items-start gap-3">
                                        <L.TriangleAlert className={cn('mt-0.5 size-6 shrink-0', SEV[x.sev][2])} aria-hidden="true" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.875rem] font-bold text-ink-900">{i + 1}. {x.title} <span className={cn('ml-1 rounded-[4px] px-1.5 py-0.5 text-[0.625rem] font-bold', SEV[x.sev][1])}>{SEV[x.sev][0]}</span></p>
                                            <p className="text-[0.8125rem] text-ink-600">{x.why}</p>
                                        </div>
                                        <dl className="text-[0.75rem]"><div><dt className="inline text-ink-500">Impact: </dt><dd className="inline font-semibold">{x.impact}</dd></div><div><dt className="inline text-ink-500">Likelihood: </dt><dd className="inline font-semibold">{x.likelihood}</dd></div></dl>
                                        <button type="button" aria-expanded={open === x.id} onClick={() => setOpen(open === x.id ? null : x.id)} className={btnClass('outline', 'sm')}>View Guidance</button>
                                    </div>
                                    {open === x.id && <p className="mt-2 ml-9 rounded-[8px] bg-referenced-50 p-3 text-[0.8125rem] text-ink-700"><strong>Guidance:</strong> {x.guide}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3">
                        <p className="text-[0.8125rem]"><strong>Recommended next step:</strong> address critical items before proceeding.</p>
                        <BtnLink href={`${BASE}/decision-sheet`} size="sm" tone="outline" icon="arrow-right">Build an Action Plan</BtnLink>
                    </div>
                </section>
            )}
            <AiDisclosure>Rule-based screening against TBCA's deal-breaker checks (Voice A). It does not replace feasibility work or professional due diligence.</AiDisclosure>
        </KpPage>
    );
}
