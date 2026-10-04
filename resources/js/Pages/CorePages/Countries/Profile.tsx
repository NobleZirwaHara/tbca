import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CalendarDays, CircleCheck, CircleDot, FileSearch, HelpCircle, MapPin, ShieldCheck, Scale, TriangleAlert, Ban, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { CountryFrame, EvidenceStrip, Kpi, NoPrice, SideBox, StatePill } from '@/Components/CorePages/CountryParts';
import { CheckList, Flag } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Tabs } from '@/Components/ui/Kit';
import type { CountryObject } from '@/types/core-pages';

interface Props {
    profile: {
        country: CountryObject;
        summary: string;
        kpis: { label: string; value: string }[];
        availability: { label: string; status: string }[];
        access: string[];
        evidence_quality: { label: string; value: string }[];
        guardrails: string[];
        updates: { title: string; date: string }[];
        control: { label: string; value: string }[];
    };
    services: { code: string; name: string; category: string; status: string; summary: string }[];
}

const kpiIcons = [CircleCheck, MapPin, ShieldCheck, Ban, CalendarDays, Briefcase];

export default function Profile({ profile: p, services }: Props) {
    const [tab, setTab] = useState('overview');
    const c = p.country;
    const active = c.state === 'Activated';
    const iso = c.iso.toLowerCase();

    return (
        <CountryFrame
            crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: c.name }, { label: 'Country Profile' }]}
            title="Country Profile"
            aside={
                <>
                    <SideBox title="Country Control Panel">
                        <p className="flex items-center gap-2 text-[1.125rem] font-bold text-ink-900"><Flag iso={c.iso} className="text-2xl" />{c.name}</p>
                        <p className="text-[0.75rem] text-ink-500">{active ? 'Phase 1 controlled environment' : 'Shell country object'}</p>
                        <dl className="mt-3 space-y-1.5 text-[0.75rem]">
                            {p.control.map((r) => <div key={r.label} className="flex justify-between gap-2"><dt className="text-ink-500">{r.label}</dt><dd className={active ? 'text-right font-semibold text-verified-700' : 'text-right font-semibold'}>{r.value}</dd></div>)}
                        </dl>
                    </SideBox>
                    {active && services[0] ? (
                        <Link href={`/find-the-right-service/countries/${iso}/services/${services[0].code}`} className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Explore Services <ArrowRight className="size-4" aria-hidden="true" /></Link>
                    ) : (
                        <Link href="/find-the-right-service/request-human-assistance" className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Register Interest</Link>
                    )}
                    {active && <Link href={`/find-the-right-service/countries/${iso}/evidence`} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-sm"><FileSearch className="size-4" aria-hidden="true" />View Evidence Panel</Link>}
                    {active && <Link href={`/find-the-right-service/countries/${iso}/legal`} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-sm"><Scale className="size-4" aria-hidden="true" />Legal &amp; Regulatory Boundary</Link>}
                    <Link href="/find-the-right-service/countries?state=Activated" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-sm"><BookOpen className="size-4" aria-hidden="true" />View Activation Ledger</Link>
                    <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${c.name}`, section: 'core' })} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-sm"><HelpCircle className="size-4" aria-hidden="true" />Ask a Question</button>
                    <NoPrice />
                </>
            }
        >
            <Head title={`${c.name} — Country Profile`} />
            <section className="grid gap-4 rounded-[8px] border border-parchment-400 p-4 md:grid-cols-[8rem_1fr]">
                <div className="flex items-center justify-center rounded-[6px] bg-parchment-100 text-[4rem]" aria-hidden="true"><Flag iso={c.iso} /></div>
                <div>
                    <h2 className="text-[1.75rem] font-bold text-ink-900">{c.name}</h2>
                    <p className="text-[0.8125rem] font-semibold text-ink-600">{active ? 'Phase 1 controlled country environment' : 'Shell country object — discovery only'}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {(active ? ['Activated', 'Evidence Current', 'Resolver Complete', 'Service-by-service permission applies'] : ['Shell', 'Evidence Partial', `Resolver ${c.rcs}%`, 'Not transaction-permitted']).map((b) => <li key={b} className="inline-flex items-center gap-1.5 rounded-[6px] border border-parchment-400 px-2.5 py-1 text-[0.75rem]"><CircleCheck className={active ? 'size-4 text-verified-500' : 'size-4 text-ink-400'} aria-hidden="true" />{b}</li>)}
                    </ul>
                    <p className="mt-2 text-[0.8125rem] text-ink-600">{p.summary}</p>
                </div>
            </section>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {p.kpis.map((k, i) => {
                    const I = kpiIcons[i];
                    return <Kpi key={k.label} label={k.label} value={k.value} icon={<I className="size-6" aria-hidden="true" />} tone={i === 0 && active ? 'good' : undefined} />;
                })}
            </div>
            <Tabs className="mt-5" value={tab} onChange={setTab} tabs={[{ key: 'overview', label: 'Overview' }, { key: 'availability', label: 'Availability' }, { key: 'evidence', label: 'Evidence' }, { key: 'services', label: 'Services', count: services.length }, { key: 'payments', label: 'Payments' }, { key: 'compliance', label: 'Compliance' }]} />

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {(tab === 'overview' || tab === 'availability') && (
                    <SideBox title="Controlled Availability">
                        <p className="text-[0.75rem] text-ink-600">Country object is {c.state}. Service access depends on resolver state and service-by-service permission.</p>
                        <ul className="mt-2 space-y-1.5 text-[0.8125rem]">
                            {p.availability.map((a) => <li key={a.label} className="flex justify-between gap-2"><span>{a.label}</span><span className="rounded-[3px] border border-attested-500/40 bg-attested-50 px-1.5 text-[0.6875rem] text-attested-700">{a.status}</span></li>)}
                        </ul>
                        <p className="mt-3 text-[0.6875rem] text-ink-500">Commercial availability is service-by-service and subject to Country Resolver permission.</p>
                    </SideBox>
                )}
                {(tab === 'overview' || tab === 'availability') && <SideBox title="What You Can Access"><CheckList items={p.access} /></SideBox>}
                {(tab === 'overview' || tab === 'evidence') && (
                    <SideBox title="Evidence & Source Quality">
                        <dl className="space-y-1 text-[0.8125rem]">{p.evidence_quality.map((e) => <div key={e.label} className="flex justify-between"><dt className="text-ink-500">{e.label}</dt><dd className={active ? 'font-semibold text-verified-700' : 'font-semibold'}>{e.value}</dd></div>)}</dl>
                        {active && <Link href={`/find-the-right-service/countries/${iso}/evidence`} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">Open Evidence Panel <ArrowRight className="size-3.5" aria-hidden="true" /></Link>}
                    </SideBox>
                )}
                {(tab === 'overview' || tab === 'payments') && (
                    <SideBox title="Payments & Commercial Guardrails">
                        <ul className="space-y-1.5 text-[0.8125rem]">{p.guardrails.map((g) => <li key={g} className="flex gap-2"><CircleDot className="mt-0.5 size-3.5 text-gold-600" aria-hidden="true" />{g}</li>)}</ul>
                        <p className="mt-3 flex gap-2 rounded-[6px] bg-attested-50 p-2 text-[0.75rem] text-attested-700"><TriangleAlert className="size-4 shrink-0" aria-hidden="true" /><span><strong>No Resolution, No Price</strong><br />No overrides. No implied access.</span></p>
                    </SideBox>
                )}
                {(tab === 'overview' || tab === 'compliance') && (
                    <SideBox title="Professional & Regulatory Boundary">
                        <p className="text-[0.8125rem] text-ink-600">Regulated, licensed, or partner-routed work is controlled separately and may require specific permits, approvals, or professional engagement.</p>
                        <p className="mt-2 text-[0.75rem] font-semibold text-ink-900">This profile is discovery only, not authorisation.</p>
                        {active && <Link href={`/find-the-right-service/countries/${iso}/legal`} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">View Legal Boundary <ArrowRight className="size-3.5" aria-hidden="true" /></Link>}
                    </SideBox>
                )}
                {(tab === 'overview' || tab === 'evidence') && (
                    <SideBox title="Recent Verified Updates">
                        <ul className="space-y-1.5 text-[0.75rem]">{p.updates.map((u) => <li key={u.title} className="flex justify-between gap-3"><span>{u.title}</span><span className="shrink-0 text-ink-500">{u.date}</span></li>)}</ul>
                    </SideBox>
                )}
                {tab === 'services' && (
                    <div className="lg:col-span-3">
                        {services.length === 0 ? (
                            <p className="rounded-[8px] border border-parchment-400 p-6 text-center text-sm text-ink-500">No services are available for shell country objects. <Link href="/find-the-right-service/request-human-assistance" className="font-semibold text-gold-700">Register interest</Link></p>
                        ) : (
                            <ul className="grid gap-3 md:grid-cols-2">
                                {services.map((s) => (
                                    <li key={s.code}><Link href={`/find-the-right-service/countries/${iso}/services/${s.code}`} className="block rounded-[8px] border border-parchment-400 p-4 hover:border-gold-400"><p className="flex items-center gap-2 font-bold text-ink-900">{s.name}<StatePill state={s.status} /></p><p className="text-[0.75rem] text-ink-500">{s.code} · {s.category}</p><p className="mt-1 text-[0.8125rem] text-ink-600">{s.summary}</p></Link></li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
            <EvidenceStrip />
        </CountryFrame>
    );
}
