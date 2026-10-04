import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BadgeCheck, Building2, CircleCheck, Globe, Handshake, Lock, MapPin, Scale, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { Input, Select } from '@/Components/ui/Form';
import { Card, CodeChip } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import type { MkProvider } from '@/types/marketplace';

interface Props { partners: MkProvider[]; filters: { q?: string; profession?: string; jurisdiction?: string }; professions: string[]; jurisdictions: string[] }

export default function Network({ partners, filters, professions, jurisdictions }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (patch: Partial<Props['filters']>) => router.get('/partner-services/network', Object.fromEntries(Object.entries({ ...filters, q, ...patch }).filter(([, v]) => v)), { preserveScroll: true, preserveState: true, replace: true });

    return (
        <>
            <Head title="Partner Network" />
            <PsBody>
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-7">
                        <div>
                            <CodeChip code="PS-015" />
                            <h1 className="mt-2 font-serif text-4xl font-bold text-ink-900">Partner Network</h1>
                            <p className="mt-1 font-semibold text-ink-800">Qualified professionals. Verified standing. Permission-led engagements.</p>
                            <p className="mt-3 text-sm text-ink-600">Our Partner Network brings together independent professionals and specialist firms who are qualified to deliver professional services where a professional boundary applies. All engagements are arranged under one of our three standard arrangements.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[['A1 – Partner Reviewed', 'The professional reviews or signs off. TBCA performs coordination services.', Users], ['A2 – Partner Delivered', 'The professional delivers under an approved contracting structure.', Handshake], ['A3 – Partner Introduced', 'TBCA introduces you; you engage and pay the professional directly.', ShieldCheck]].map(([t, b, I]) => {
                                const Ic = I as typeof Users;
                                return <div key={t as string} className="rounded-[8px] border border-parchment-400 bg-white p-4"><Ic className="size-8 text-gold-600" aria-hidden="true" /><p className="mt-2 text-sm font-semibold text-ink-900">{t as string}</p><p className="text-xs text-ink-600">{b as string}</p></div>;
                            })}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <ButtonLink href="/partner-services/request" trailingIcon="arrow-right">Request Partner Review</ButtonLink>
                            <ButtonLink href="/partner-services/coverage" variant="outline">Explore Professions</ButtonLink>
                        </div>
                        <Card title="Our Network at a Glance">
                            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
                                {[[Users, '412', 'Verified Partners'], [Building2, '186', 'Firms'], [MapPin, '8', 'Professions'], [Globe, '54', 'Jurisdictions'], [BadgeCheck, '98%', 'Verification Current']].map(([I, v, l]) => {
                                    const Ic = I as typeof Users;
                                    return <div key={l as string}><Ic className="mx-auto size-7 text-gold-600" aria-hidden="true" /><p className="mt-1 text-2xl font-bold text-ink-900">{v as string}</p><p className="text-xs text-ink-500">{l as string}</p></div>;
                                })}
                            </div>
                        </Card>
                    </div>
                    <div className="space-y-5 lg:col-span-5">
                        <Card tone="cream" title="Our Partner Network Is Built On">
                            <ul className="divide-y divide-parchment-300 text-sm">
                                {[[ShieldCheck, 'Professional Independence', 'Each professional remains independent and responsible for their professional judgement and deliverables.'], [UserCheck, 'Verified Standing', 'Registration, qualifications, indemnity and jurisdictional standing are verified and monitored.'], [Scale, 'Permission Led', 'We only facilitate services where the profession and jurisdiction are supported by verified permission.'], [ShieldCheck, 'Ethics & Quality', 'Our partners adhere to professional codes, ethics, quality standards and our Partner Covenant.'], [Lock, 'Client Protection', 'Clear responsibility, confidentiality, and liability boundaries protect your interests.']].map(([I, t, b]) => {
                                    const Ic = I as typeof Lock;
                                    return <li key={t as string} className="grid grid-cols-[2rem_8rem_1fr] gap-2 py-2.5"><Ic className="size-6 text-gold-600" aria-hidden="true" /><span className="font-semibold text-ink-900">{t as string}</span><span className="text-xs text-ink-600">{b as string}</span></li>;
                                })}
                            </ul>
                        </Card>
                        <Card tone="blue" title="Partner Eligibility Requirements">
                            <ul className="space-y-1.5 text-sm text-ink-700">{['Relevant professional qualification and registration in good standing.', 'Appropriate indemnity insurance for professional services.', 'Compliance with applicable laws, regulations and professional codes.', 'Adherence to TBCA Partner Agreement and Partner Covenant.', 'Agreement to ongoing verification and quality monitoring.'].map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{x}</li>)}</ul>
                        </Card>
                        <Card tone="green" title="Interested in Joining Our Partner Network?">
                            <p className="text-sm text-ink-700">We are always looking for exceptional professionals and firms who share our commitment to quality, ethics and client protection.</p>
                            <ButtonLink href="/partner-services/apply" variant="outline" size="sm" className="mt-3">Apply to Become a Partner</ButtonLink>
                        </Card>
                    </div>
                </div>
                <Card title="Partner Directory (verified & routable)">
                    <div className="mb-4 flex flex-wrap gap-3">
                        <form role="search" className="relative min-w-52 flex-1" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                            <Input aria-label="Search partners" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search firm or profession…" />
                        </form>
                        <Select aria-label="Profession" className="w-64" value={filters.profession ?? ''} placeholder="All professions" options={professions} onChange={(e) => apply({ profession: e.target.value })} />
                        <Select aria-label="Jurisdiction" className="w-48" value={filters.jurisdiction ?? ''} placeholder="All jurisdictions" options={jurisdictions} onChange={(e) => apply({ jurisdiction: e.target.value })} />
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {partners.length === 0 && <li className="text-sm text-ink-500">No routable partners match these filters.</li>}
                        {partners.map((p) => (
                            <li key={p.slug} className="rounded-[6px] border border-parchment-300 bg-white p-4">
                                <div className="flex items-start justify-between gap-2"><p className="font-semibold text-ink-900">{p.name}</p><StatusPill status={p.status === 'active' ? 'Current' : 'Conditions'} tone={p.status === 'active' ? 'good' : 'warn'} /></div>
                                <p className="text-xs text-ink-600">{p.profession}</p>
                                <p className="text-xs text-ink-500">{p.category} · {p.city}, {p.country}</p>
                                <p className="mt-1 text-[0.6875rem] text-ink-400">CURRENT VERIFIED as at {p.lastVerified}</p>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 flex items-center gap-2 text-xs text-ink-500"><Lock className="size-4" aria-hidden="true" />TBCA does not provide professional advice or opinion. Panel active is not matter eligibility — every matter passes permission, verification and conflict checks.</p>
                </Card>
            </PsBody>
        </>
    );
}
