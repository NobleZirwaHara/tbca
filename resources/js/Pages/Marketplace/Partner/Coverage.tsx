import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { BookOpen, CircleCheck, CircleMinus, CircleAlert, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Select } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PIcon } from '@/Components/Marketplace/PartnerKit';
import { Notice } from '@/Components/Marketplace/ui';

type StateKey = 'current' | 'available' | 'matter' | 'output' | 'manual' | 'unavailable';

interface Props {
    coverage: { icon: string; profession: string; za: StateKey; africa: StateKey; cross: StateKey; note: string }[];
    states: Record<StateKey, { label: string; tone: string }>;
    check: null | { profession: string; jurisdiction: string; state: StateKey; partners: number; rows: { reference: string; activity: string; arrangement: string; status: string }[] };
    professions: string[];
    jurisdictions: string[];
}

function StateCell({ state, states }: { state: StateKey; states: Props['states'] }) {
    const s = states[state];
    const icon = s.tone === 'good' ? <CircleCheck className="size-4 text-verified-500" /> : s.tone === 'warn' ? <CircleAlert className="size-4 text-attested-500" /> : <CircleMinus className="size-4 text-ink-400" />;
    return <span className="flex items-center gap-1.5 text-xs text-ink-700">{icon}{s.label}</span>;
}

export default function Coverage({ coverage, states, check, professions, jurisdictions }: Props) {
    const [profession, setProfession] = useState(check?.profession ?? '');
    const [jurisdiction, setJurisdiction] = useState(check?.jurisdiction ?? 'South Africa');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/partner-services/coverage', { profession, jurisdiction }, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="bg-parchment-100">
            <Head title="Profession & Jurisdiction Coverage" />
            <div className="container-tbca py-8 md:py-10">
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Profession & Jurisdiction Coverage' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h1 className="font-serif text-3xl font-bold text-ink-900 md:text-[2.5rem]">Profession &amp; Jurisdiction Coverage</h1>
                        <p className="mt-2 text-lg text-gold-700">Evidence-bound coverage across professions and jurisdictions.</p>
                        <p className="mt-3 text-sm text-ink-600">
                            This public coverage guide shows where TBCA Partner Services has published rules or active routes. Final routing depends on the exact profession, activity, output, intended use, matter
                            jurisdiction, current professional verification, and conflict clearance.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <ButtonLink href="#check">Check My Matter Coverage</ButtonLink>
                            <ButtonLink href="/partner-services/choose-service" variant="outline" trailingIcon="arrow-right">Request Partner Review</ButtonLink>
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-gold-400/60 bg-white p-5 lg:col-span-5">
                        <p className="flex items-center gap-2 font-semibold text-ink-900"><BookOpen className="size-5 text-gold-600" aria-hidden="true" />How to Read Coverage</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.8125rem] text-ink-600">
                            <li>Coverage rules are not the same as a confirmed assignment.</li>
                            <li>Matter jurisdiction must be resolved before proposal.</li>
                            <li>Current professional verification is required.</li>
                            <li>Conflict clearance is required before any money or professional work.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-12">
                    <section className="lg:col-span-9">
                        <h2 className="mb-3 font-semibold text-ink-900">Coverage by Profession and Jurisdiction</h2>
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-ink-950 text-xs text-parchment-100">
                                    <tr>
                                        <th scope="col" className="px-3 py-2.5">Profession</th>
                                        <th scope="col" className="px-3 py-2.5">South Africa</th>
                                        <th scope="col" className="px-3 py-2.5">Selected African Jurisdictions</th>
                                        <th scope="col" className="px-3 py-2.5">Cross-Border / International</th>
                                        <th scope="col" className="px-3 py-2.5">Public Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {coverage.map((c) => (
                                        <tr key={c.profession}>
                                            <th scope="row" className="px-3 py-2.5 font-semibold text-ink-900"><span className="flex items-center gap-2"><PIcon name={c.icon} className="size-4 text-gold-600" />{c.profession}</span></th>
                                            <td className="px-3 py-2.5"><StateCell state={c.za} states={states} /></td>
                                            <td className="px-3 py-2.5"><StateCell state={c.africa} states={states} /></td>
                                            <td className="px-3 py-2.5"><StateCell state={c.cross} states={states} /></td>
                                            <td className="px-3 py-2.5 text-xs text-ink-500">{c.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 className="mt-8 mb-3 font-semibold text-ink-900">What Makes a Matter Eligible</h2>
                        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ['Confirm Profession & Output', 'Confirm the exact profession, activity and output required.'],
                                ['Resolve Matter Jurisdiction', 'Determine matter jurisdiction separate from client location.'],
                                ['Verify Current Professional Standing', 'Confirm current verification, licence, registration or accreditation.'],
                                ['Clear Conflict Before Money', 'Mandatory conflict clearance before any money or work.'],
                            ].map(([t, b], i) => (
                                <li key={t} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                                    <div><p className="text-sm font-semibold text-ink-900">{t}</p><p className="text-xs text-ink-500">{b}</p></div>
                                </li>
                            ))}
                        </ol>

                        <form id="check" onSubmit={submit} className="mt-8 scroll-mt-24 rounded-[8px] border border-gold-400/60 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Check My Matter Coverage</h2>
                            <p className="mb-4 text-xs text-ink-500">Checked live against the Permission Register and the Live Partner Register.</p>
                            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                                <Field label="Primary profession required" required>
                                    {(id) => <Select id={id} value={profession} onChange={(e) => setProfession(e.target.value)} options={professions} placeholder="Select profession" required />}
                                </Field>
                                <Field label="Matter jurisdiction" required>
                                    {(id) => <Select id={id} value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} options={jurisdictions} required />}
                                </Field>
                                <Button type="submit">Start Coverage Check</Button>
                            </div>
                            {check && (
                                <div className="mt-5 space-y-3" aria-live="polite">
                                    <Notice tone={check.state === 'current' ? 'good' : check.state === 'unavailable' ? 'bad' : 'warn'}>
                                        <p className="font-semibold">{check.profession} · {check.jurisdiction}: {states[check.state].label}</p>
                                        <p className="mt-1 flex items-center gap-1"><Users className="size-3.5" aria-hidden="true" />{check.partners} currently verified, routable partner(s) for this profession.</p>
                                    </Notice>
                                    {check.rows.length > 0 && (
                                        <ul className="divide-y divide-parchment-300 rounded-[6px] border border-parchment-300 text-sm">
                                            {check.rows.map((r) => (
                                                <li key={r.reference} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                                                    <span><span className="font-mono text-xs text-ink-500">{r.reference}</span> · {r.activity} <span className="text-xs text-ink-400">({r.arrangement})</span></span>
                                                    <StatusPill status={r.status} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </form>
                    </section>

                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="mb-3 font-semibold text-ink-900">Coverage States</h2>
                            <ul className="space-y-3 text-xs">
                                <li><StateCell state="current" states={states} /><p className="mt-0.5 text-ink-500">A current public rule-set exists; professional assignment still depends on exact matter checks.</p></li>
                                <li><StateCell state="matter" states={states} /><p className="mt-0.5 text-ink-500">Manual profession/jurisdiction resolution required before engagement.</p></li>
                                <li><StateCell state="manual" states={states} /><p className="mt-0.5 text-ink-500">Current source or professional standing must be confirmed.</p></li>
                                <li><StateCell state="unavailable" states={states} /><p className="mt-0.5 text-ink-500">No unsupported route will be offered in this jurisdiction.</p></li>
                            </ul>
                        </div>
                        <Notice tone="info">Client country is not the same as matter jurisdiction. Both must be determined before routing.</Notice>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5 text-sm">
                            <p className="font-semibold text-ink-900">Need help checking a matter?</p>
                            <p className="mt-1 text-xs text-ink-500">Speak with a human adviser to confirm coverage and the next best step for your matter.</p>
                            <Button type="button" size="sm" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Matter coverage check', section: 'Partner Services' })}>Talk to a Human Adviser</Button>
                        </div>
                    </aside>
                </div>
                <Notice tone="gold" className="mt-6">Panel active is not matter eligible. Matter eligibility requires permission, jurisdiction, current verification and conflict clearance.</Notice>
            </div>
        </div>
    );
}
