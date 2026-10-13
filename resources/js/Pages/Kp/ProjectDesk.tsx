import { Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Field, Input, KpPage, Meter, Select, Textarea, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Project {
    code: string;
    title: string;
    stage: string;
    place: string;
    progress: number;
    next: string;
    due: string;
    updated: string;
}

interface Props extends KpShared {
    signedIn: boolean;
    projects: Project[];
    counts: { active: number; inProgress: number; completed: number };
    support: [string, string, string, string][];
}

const DELIVER = ['Project feasibility and viability', 'Market, technical and financial due diligence', 'Bankability and investment readiness', 'Funding strategy and investor positioning', 'Implementation planning and governance', 'Monitoring, evaluation and optimisation'];
const JOURNEY: [string, string][] = [['Submit Project Brief', 'Tell us about your project.'], ['Initial Assessment', 'We review and confirm scope.'], ['Advisory Engagement', 'We work with you to develop the plan.'], ['Delivery & Support', 'We help you implement and track results.'], ['Review & Optimise', 'We refine for better outcomes.']];
const PRINCIPLES: [string, string][] = [['file-check', 'Evidence-Based Decisions'], ['coins', 'Commercially Viable'], ['sprout', 'Socially & Environmentally Responsible'], ['scale', 'Governance You Can Trust'], ['building-2', 'Built for Sustainability'], ['target', 'Focused on Real Impact']];
const STAGES = ['Concept', 'Planning / Feasibility', 'Financing', 'Implementation', 'Operations'];

/** KP-SCR-011 Project Development Desk. */
export default function ProjectDesk({ screen, kpNav, signedIn, projects, counts, support }: Props) {
    const [pick, setPick] = useState(support[0][0]);
    const form = useForm({ support: support[0][0], project: '', location: '', stage: 'Concept', brief: '', name: '', email: '' });
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Project Development Desk']]}
            title="Project Development Desk"
            subtitle="From concept to bankability. From plan to performance."
            intro="Structured advisory and execution support for projects that create real impact. Practical. Evidence-based. Investor-ready."
            rail={
                <>
                    <Box title="What We Deliver" icon="briefcase">
                        <ul className="space-y-1.5 text-[0.8125rem]">{DELIVER.map((d) => <li key={d} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{d}</li>)}</ul>
                    </Box>
                    <Box title="Your Project Journey" icon="map">
                        <ol className="space-y-2">{JOURNEY.map(([t, b], i) => <li key={t} className="flex gap-2.5"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-parchment-50">{i + 1}</span><span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{b}</span></span></li>)}</ol>
                    </Box>
                    <Box title="Need to Speak First?" tone="cream">
                        <p className="text-[0.8125rem]">Not sure where to start? Let's talk.</p>
                        <BtnLink href="/contact?subject=Project%20discovery%20call" className="mt-2 w-full" icon="arrow-right">Book a Discovery Call</BtnLink>
                    </Box>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[[L.CalendarDays, 'Your Active Projects', counts.active], [L.Clock, 'In Progress', counts.inProgress], [L.CircleCheck, 'Completed', counts.completed]].map(([I, l, v]) => {
                    const Icon = I as typeof L.Clock;
                    return <div key={l as string} className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4"><Icon className="size-7 text-gold-600" aria-hidden="true" /><span><span className="block text-[0.75rem] text-ink-600">{l as string}</span><span className="block text-2xl font-bold text-ink-900">{signedIn ? (v as number) : 'Sign in'}</span></span></div>;
                })}
                <div className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4"><L.User className="size-7 text-gold-600" aria-hidden="true" /><span><span className="block text-[0.75rem] text-ink-600">Assigned Adviser</span><span className="block text-[0.8125rem] font-bold text-ink-900">Named at engagement</span><span className="block text-[0.6875rem] text-ink-500">Kruger or a TBCA project lead</span></span></div>
            </div>

            <section>
                <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">How We Can Help</h2>
                <p className="mb-3 text-[0.8125rem] text-ink-600">Select the type of support your project needs.</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" role="radiogroup" aria-label="Support type">
                    {support.map(([k, t, b, i]) => (
                        <button key={k} type="button" role="radio" aria-checked={pick === k} onClick={() => { setPick(k); form.setData('support', k); }} className={cn('flex flex-col items-center rounded-[10px] border bg-white p-4 text-center', pick === k ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-500/30' : 'border-parchment-400 hover:border-gold-500')}>
                            <Ico name={i} className="size-8 text-gold-600" />
                            <span className="mt-2 text-[0.8125rem] font-bold text-ink-900">{t}</span>
                            <span className="mt-1 text-[0.6875rem] text-ink-600">{b}</span>
                        </button>
                    ))}
                </div>
            </section>

            <Box title="Submit a Project Brief" icon="file-text">
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/project-development`, { preserveScroll: true, onSuccess: () => form.reset('project', 'brief') }); }}>
                    <Field label="Project name" error={form.errors.project}><Input required value={form.data.project} onChange={(e) => form.setData('project', e.target.value)} /></Field>
                    <Field label="Location" error={form.errors.location}><Input required value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} placeholder="Province or city, country" /></Field>
                    <Field label="Stage" error={form.errors.stage}><Select value={form.data.stage} onChange={(e) => form.setData('stage', e.target.value)} options={STAGES} /></Field>
                    <Field label="Support needed"><Select value={form.data.support} onChange={(e) => { setPick(e.target.value); form.setData('support', e.target.value); }} options={support.map(([k, t]) => ({ value: k, label: t }))} /></Field>
                    <Field label="Project brief" error={form.errors.brief} className="sm:col-span-2" hint="What the project is, who it serves and what you need next (20 to 800 characters)."><Textarea required maxLength={800} value={form.data.brief} onChange={(e) => form.setData('brief', e.target.value)} /></Field>
                    <Field label="Your name" error={form.errors.name}><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="Email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <div className="sm:col-span-2"><button type="submit" disabled={form.processing} className={btnClass('gold')}>Submit Project Brief</button></div>
                </form>
            </Box>

            <section>
                <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Your Active Projects</h2>
                {!signedIn ? (
                    <p className="rounded-[10px] border border-dashed border-parchment-500 bg-white p-6 text-center text-[0.875rem] text-ink-600"><Link href="/login" className="font-semibold text-gold-700">Sign in</Link> to see your projects, stages and next steps.</p>
                ) : projects.length === 0 ? (
                    <p className="rounded-[10px] border border-dashed border-parchment-500 bg-white p-6 text-center text-[0.875rem] text-ink-600">No active projects yet. Submit a brief above to start.</p>
                ) : (
                    <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white">
                        <table className="w-full text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-ink-700"><tr><th className="px-3 py-2">Project</th><th className="px-3 py-2">Stage</th><th className="px-3 py-2">Progress</th><th className="px-3 py-2">Last Updated</th><th className="px-3 py-2">Next Step</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {projects.map((p) => (
                                    <tr key={p.code}>
                                        <td className="px-3 py-2.5"><span className="block font-semibold text-ink-900">{p.title}</span><span className="text-[0.6875rem] text-ink-500">{p.place} | {p.code}</span></td>
                                        <td className="px-3 py-2.5"><span className="rounded-[4px] bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">{p.stage}</span></td>
                                        <td className="px-3 py-2.5"><span className="flex items-center gap-2">{p.progress}%<Meter value={p.progress} className="w-24" tone="green" /></span></td>
                                        <td className="px-3 py-2.5">{p.updated}</td>
                                        <td className="px-3 py-2.5"><span className="block">{p.next}</span><span className="text-[0.6875rem] text-ink-500">Due {p.due}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <Box title="Our Project Development Principles">
                <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{PRINCIPLES.map(([i, t]) => <li key={t} className="flex items-center gap-2 text-[0.75rem] font-semibold text-ink-800"><Ico name={i} className="size-5 shrink-0 text-gold-600" />{t}</li>)}</ul>
            </Box>
        </KpPage>
    );
}
