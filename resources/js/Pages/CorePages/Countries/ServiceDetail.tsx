import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Briefcase, CalendarDays, CircleCheck, Download, FileText, Lock, MessageCircle, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { CountryFrame, EvidenceStrip, Kpi, SideBox } from '@/Components/CorePages/CountryParts';
import { CheckList } from '@/Components/CorePages/Kit';
import { usePrice } from '@/lib/money';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal, Tabs } from '@/Components/ui/Kit';
import type { SharedProps } from '@/types';
import type { CountryObject } from '@/types/core-pages';

interface Service {
    code: string; name: string; category: string; status: string; summary: string; overview: string; included: string[]; process: [string, string][]; fees: { label: string; zar: number | null }[]; price_zar: number;
    requirements: string[]; limitations: string[]; related: string[]; details: [string, string][]; dependencies: Record<string, boolean>; changes: [string, string][];
}

interface Props { country: CountryObject; service: Service; priceResolved: boolean }

const TABS = [['overview', 'Overview'], ['included', 'What’s Included'], ['process', 'Process & Timeline'], ['requirements', 'Requirements'], ['fees', 'Costs & Fees'], ['evidence', 'Evidence & Sources'], ['limitations', 'Limitations'], ['related', 'Related Services'], ['changes', 'Change History']];

export default function ServiceDetail({ country: c, service: s, priceResolved }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [tab, setTab] = useState('overview');
    const [open, setOpen] = useState(false);
    const iso = c.iso.toLowerCase();
    const price = usePrice();
    const form = useForm({ name: auth.user?.name ?? '', email: auth.user?.email ?? '', notes: '' });
    const brief = `data:text/plain;charset=utf-8,${encodeURIComponent([`${s.code} — ${s.name}`, s.summary, '', 'Included:', ...s.included.map((x) => `- ${x}`), '', 'Process:', ...s.process.map(([t, d], i) => `${i + 1}. ${t}: ${d}`), '', `Standard catalogue price: from ${price(s.price_zar)} (statutory and partner fees quoted at cost).`].join('\n'))}`;
    const show = (k: string) => tab === 'overview' || tab === k;

    return (
        <div>
            <Head title={`${s.name} — Service Detail`} />
            <CountryFrame
                crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: c.name, href: `/find-the-right-service/countries/${iso}` }, { label: 'Service Catalogue', href: `/find-the-right-service/countries/${iso}` }, { label: 'Service Detail' }]}
                title="Service Detail"
                actions={<Link href={`/find-the-right-service/countries/${iso}`} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Service Catalogue</Link>}
                aside={
                    <>
                        <SideBox title="Service Access">
                            <p className="text-[0.75rem] font-semibold text-ink-700">Commercial Availability</p>
                            <p className="mt-1 flex items-center gap-2 font-bold text-verified-700"><CircleCheck className="size-5" aria-hidden="true" />Permitted</p>
                            <p className="text-[0.6875rem] text-ink-500">Africa (Active) — standard catalogue</p>
                            <p className="mt-3 text-[0.75rem] font-semibold text-ink-700">Standard Price</p>
                            <p className="text-[1.5rem] font-bold text-ink-900">{price(s.price_zar)}</p>
                            <p className="text-[0.6875rem] text-ink-500">TBCA fee, shown in your selected currency</p>
                            <p className="mt-3 text-[0.75rem] font-semibold text-ink-700">Resolver Dependencies</p>
                            <ul className="mt-1 space-y-1 text-[0.75rem]">{Object.entries(s.dependencies).map(([k, ok]) => <li key={k} className="flex justify-between"><span className="flex items-center gap-1.5"><CircleCheck className={ok ? 'size-3.5 text-verified-500' : 'size-3.5 text-ink-300'} aria-hidden="true" />{k}</span><span className={ok ? 'text-verified-700' : 'text-risk-500'}>{ok ? 'Complete' : 'Incomplete'}</span></li>)}</ul>
                        </SideBox>
                        <SideBox tone="warn"><p className="flex gap-2 text-[0.75rem]"><TriangleAlert className="size-4 shrink-0 text-attested-700" aria-hidden="true" /><span><strong className="block text-ink-900">Statutory &amp; partner fees</strong>Government and partner fees are quoted at cost once your request is confirmed.</span></p></SideBox>
                        <button type="button" onClick={() => router.post(`/find-the-right-service/countries/${iso}/services/${s.code}/eligibility`, {}, { preserveScroll: true })} className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Check My Eligibility <ArrowRight className="size-4" aria-hidden="true" /></button>
                        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-sm"><FileText className="size-4" aria-hidden="true" />Request Service Access</button>
                        <a href={brief} download={`${s.code}-service-brief.txt`} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-sm"><Download className="size-4" aria-hidden="true" />Download Service Brief</a>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Question: ${s.code} ${s.name}`, section: 'core' })} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-sm"><MessageCircle className="size-4" aria-hidden="true" />Ask a Question</button>
                        <SideBox title="Need Expert Guidance?"><p className="text-[0.75rem] text-ink-600">Speak to a TBCA Advisor for tailored support.</p><Link href="/discovery-call" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem]"><CalendarDays className="size-4" aria-hidden="true" />Speak to an Advisor</Link></SideBox>
                    </>
                }
            >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="flex gap-4">
                        <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-[8px] border border-gold-300 bg-gold-50 text-gold-600"><Briefcase className="size-8" aria-hidden="true" /></span>
                        <div>
                            <h2 className="flex flex-wrap items-center gap-2 text-[1.5rem] font-bold text-ink-900">{s.name}<span className="rounded-full bg-verified-50 px-2 text-[0.75rem] text-verified-700">{s.status}</span></h2>
                            <p className="text-[0.75rem] text-ink-600">Service Code: <strong>{s.code}</strong> | Category: <strong>{s.category}</strong></p>
                            <span className="mt-1 inline-block rounded-[4px] border border-controlled-500/40 px-2 text-[0.6875rem] text-controlled-700">Service-by-service permission</span>
                            <p className="mt-2 text-[0.8125rem] text-ink-600">{s.summary}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Kpi label="Availability" value="Available" sub="Service is accessible" icon={<CircleCheck className="size-6" aria-hidden="true" />} tone="good" />
                    <Kpi label="Resolver Completeness" value={`${c.rcs}%`} sub="All critical fields complete" icon={<ShieldCheck className="size-6" aria-hidden="true" />} />
                    <Kpi label="Evidence Status" value={c.confirmed ? 'Current' : 'Baseline'} sub={c.confirmed ? 'All critical domains' : 'To be confirmed'} icon={<ShieldCheck className="size-6" aria-hidden="true" />} tone={c.confirmed ? 'good' : undefined} />
                    <Kpi label="Standard Price" value={price(s.price_zar)} sub="TBCA fee (standard catalogue)" icon={<CalendarDays className="size-6" aria-hidden="true" />} />
                </div>
                <Tabs className="mt-5" value={tab} onChange={setTab} tabs={TABS.map(([key, label]) => ({ key, label }))} />
                <div className="mt-4 grid gap-4 lg:grid-cols-4">
                    {show('included') && (
                        <SideBox title="Service Overview">
                            <p className="text-[0.75rem] text-ink-600">{s.overview}</p>
                            <CheckList className="mt-2" items={s.included} />
                            <p className="mt-3 rounded-[6px] bg-gold-50 p-2 text-[0.6875rem] text-ink-600">Service delivery is subject to any sector-specific regulatory approvals.</p>
                        </SideBox>
                    )}
                    {show('process') && (
                        <SideBox title="Service Process">
                            <ol className="space-y-2.5">{s.process.map(([t, d], i) => <li key={t} className="flex gap-2.5"><span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-ink-300 text-[0.6875rem] font-bold">{i + 1}</span><span className="text-[0.75rem]"><strong className="block text-ink-900">{t}</strong>{d}</span></li>)}</ol>
                        </SideBox>
                    )}
                    {show('fees') && (
                        <SideBox title="Cost & Pricing Information">
                            <p className="text-[0.6875rem] text-ink-500">Standard catalogue price, stored in ZAR and shown in your selected currency.</p>
                            <ul className="mt-2 space-y-1.5">{s.fees.map((f) => <li key={f.label} className="flex items-center justify-between gap-2 rounded-[4px] border border-parchment-400 px-2 py-1.5 text-[0.75rem]"><span>{f.label}</span><span className={f.zar !== null && priceResolved ? 'font-bold text-ink-900' : 'flex items-center gap-1 text-ink-500'}>{f.zar !== null && priceResolved ? price(f.zar) : <>Quoted at cost<Lock className="size-3" aria-hidden="true" /></>}</span></li>)}</ul>
                        </SideBox>
                    )}
                    {tab === 'overview' && (
                        <SideBox title="Key Details">
                            <dl className="space-y-1.5 text-[0.75rem]">{s.details.map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}</dl>
                        </SideBox>
                    )}
                    {tab === 'requirements' && <SideBox title="Requirements"><CheckList items={s.requirements} /></SideBox>}
                    {tab === 'evidence' && <SideBox title="Evidence & Sources"><p className="text-[0.75rem] text-ink-600">{c.iso === 'ZA' ? 'Statutory fees and process steps are evidenced by EVD-S-001 to EVD-S-003 (CIPC) and the Companies Act, 2008.' : `Process steps are based on the ${c.name} baseline evidence set (to be confirmed by the country desk).`}</p><Link href={`/find-the-right-service/countries/${iso}/evidence`} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">Open Evidence Panel <ArrowRight className="size-3.5" aria-hidden="true" /></Link></SideBox>}
                    {tab === 'limitations' && <SideBox title="Limitations"><ul className="list-disc space-y-1 pl-4 text-[0.75rem]">{s.limitations.map((x) => <li key={x}>{x}</li>)}</ul></SideBox>}
                    {tab === 'related' && <SideBox title="Related Services"><ul className="space-y-1 text-[0.75rem]">{s.related.map((x) => <li key={x}><Link href={`/find-the-right-service/countries/${iso}/services/${x.split(' ')[0]}`} className="text-gold-700 hover:underline">{x}</Link></li>)}</ul></SideBox>}
                    {tab === 'changes' && <SideBox title="Change History"><ul className="space-y-1 text-[0.75rem]">{s.changes.map(([d, t]) => <li key={t} className="flex justify-between gap-3"><span>{t}</span><span className="text-ink-500">{d}</span></li>)}</ul></SideBox>}
                </div>
                <EvidenceStrip />
            </CountryFrame>

            <Modal open={open} onClose={() => setOpen(false)} title={`Request Service Access — ${s.name}`}>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(`/find-the-right-service/countries/${iso}/services/${s.code}/access`, { preserveScroll: true, onSuccess: () => setOpen(false) });
                    }}
                >
                    <Field label="Your name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                    <Field label="Notes (company name, timing)">{(id) => <Textarea id={id} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />}</Field>
                    <button type="submit" disabled={form.processing} className="inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Submit Access Request</button>
                </form>
            </Modal>
        </div>
    );
}
