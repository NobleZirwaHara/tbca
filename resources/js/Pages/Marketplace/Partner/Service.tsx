import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckSquare, Lock, Shield, TriangleAlert, UserRound, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { ButtonLink, Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows, artCategory } from '@/Components/Marketplace/ui';
import CoverArt from '@/Components/Art/CoverArt';
import { PsBody, money } from '@/Components/Marketplace/PartnerKit';
import type { MkListing } from '@/types/marketplace';

const ARR: Record<string, [string, string]> = {
    A1: ['Partner Reviewed', 'TBCA performs the substantive scope. The professional reviews and signs off.'],
    A2: ['Partner Delivered', 'The professional delivers the service under an approved contracting structure.'],
    A3: ['Partner Introduced', 'TBCA introduces or coordinates. The professional contracts directly.'],
};

export default function Service({ listing, related }: { listing: MkListing; related: MkListing[] }) {
    const d = listing.details;
    const f = d.fees ?? { t: 0, p: 0, x: 0 };
    const [arrTitle, arrBody] = ARR[d.arrangement ?? 'A1'];
    const request = `/partner-services/request?service=${listing.slug}`;

    return (
        <>
            <Head title={`${listing.title} – Partner Service`} />
            <PsBody>
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Products & Services', href: `/partner-services/choose-service?category=${listing.category}` }, { label: 'Partner Service Product Page' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-ink-900 md:text-4xl">Partner Service Product Page</h1>
                            <p className="mt-1 text-ink-600">Before you request, see exactly how this engagement works, who does what, and how we are paid.</p>
                            <div className="mt-3 flex flex-wrap gap-2">{['Permission Based', 'Professional Standards', 'Regulated Access', 'Conflict Before Money'].map((c) => <span key={c} className="flex items-center gap-1.5 rounded border border-gold-400/60 bg-white px-3 py-1 text-xs"><Shield className="size-3.5 text-gold-600" aria-hidden="true" />{c}</span>)}</div>
                        </div>
                        <CoverArt seed={listing.slug} category={artCategory(listing.category)} label={listing.title} src={d.image ?? null} className="aspect-[16/5] rounded-[8px]" />
                        <div className="grid gap-4 rounded-[8px] bg-ink-950 p-5 text-parchment-100 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
                            <div><p className="text-xs font-bold tracking-wide text-gold-400 uppercase">Service Overview</p><p className="mt-1 font-serif text-xl font-bold">{listing.title}</p><p className="mt-1 text-xs text-ink-300">{listing.summary}</p></div>
                            {[['Profession', d.profession], ['Jurisdiction', d.jurisdiction], ['Typical Timeline', d.timeline]].map(([k, v]) => <div key={k}><p className="text-xs text-ink-400">{k}</p><p className="font-semibold text-gold-400">{v}</p></div>)}
                        </div>
                        <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.2fr]">
                            <Card title="Engagement Arrangement">
                                <p className="flex items-center gap-2"><span className="rounded bg-gold-600 px-1.5 py-0.5 text-sm font-bold text-white">{d.arrangement ?? 'A1'}</span><span className="font-semibold">{arrTitle}</span></p>
                                <p className="mt-2 flex gap-2 text-sm text-ink-600"><Users className="size-6 shrink-0 text-gold-600" aria-hidden="true" />{arrBody}</p>
                            </Card>
                            <Card title="Who Does What">
                                <p className="text-sm font-semibold text-gold-700">TBCA (The Business Clinic.Africa™)</p>
                                <ul className="list-disc pl-4 text-xs text-ink-600">{(d.tbca_does ?? []).map((x: string) => <li key={x}>{x}</li>)}</ul>
                                <p className="mt-3 text-sm font-semibold text-gold-700">Professional Partner</p>
                                <ul className="list-disc pl-4 text-xs text-ink-600">{(d.professional_does ?? []).map((x: string) => <li key={x}>{x}</li>)}</ul>
                            </Card>
                            <Card title="Contracting & Payment Structure">
                                <InfoRows dense rows={[['Who Performs Professional Work', 'Independent Professional'], ['Who Contracts With You', d.arrangement === 'A3' ? 'The Professional' : 'The Business Clinic.Africa'], ['TBCA Legal Counterparty', 'The Business Clinic.Africa (Pty) Ltd'], ['Arrangement Type', `${d.arrangement ?? 'A1'} – ${arrTitle}`], ['How TBCA Is Paid', 'Coordination fee (M1) – fixed in quote'], ['Who Receives Professional Fee', 'Independent Professional'], ['Fee Mechanism', d.mechanism]]} />
                            </Card>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Card title="Important Limitations"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-600">{(d.limitations ?? []).map((x: string) => <li key={x}>{x}</li>)}</ul></Card>
                            <Card title="What You Need Before We Start"><ul className="space-y-1.5 text-sm text-ink-700">{(d.needs ?? []).map((x: string) => <li key={x} className="flex gap-2"><CheckSquare className="size-4 text-gold-600" aria-hidden="true" />{x}</li>)}</ul></Card>
                        </div>
                        <p className="flex items-center gap-2 text-sm text-ink-600"><Lock className="size-4 text-gold-600" aria-hidden="true" /> No fees. No work. No access until conflict clearance is complete.</p>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <Card tone="dark" title="Commercial Summary (Indicative)">
                            <p className="-mt-2 mb-3 text-xs text-ink-300">All amounts are in ZAR and exclusive of VAT</p>
                            <ul className="space-y-2 text-sm">
                                {[['T – TBCA Coordination Fee (M1)', `From ${money(f.t)}`], ['P – Professional Fee (Subject to Quote)', `From ${money(f.p)}`], ['X – Disbursements (if any)', 'Quote-based'], ['S – VAT (15%)', 'As applicable'], ['C – Credits / Adjustments', 'If applicable']].map(([k, v]) => <li key={k} className="flex justify-between gap-2"><span>{k}</span><span className="font-semibold text-gold-300">{v}</span></li>)}
                            </ul>
                            <p className="mt-3 flex gap-2 rounded bg-ink-800 p-2 text-xs text-ink-200"><TriangleAlert className="size-4 shrink-0 text-gold-400" aria-hidden="true" />Final amounts depend on scope, complexity and professional quote. You will see the full T/P/X/S/C breakdown before you engage.</p>
                        </Card>
                        <Card tone="dark" title="Profession & Jurisdiction Status">
                            <ul className="space-y-2 text-sm">{[['Profession', d.profession], ['Jurisdiction (Matter)', d.jurisdiction], ['Professional Practice Jurisdiction', d.jurisdiction]].map(([k, v]) => <li key={k} className="flex items-center justify-between gap-2"><span>{k}<br /><span className="text-xs text-gold-300">{v}</span></span><StatusPill status="Covered" tone="good" /></li>)}</ul>
                            <p className="mt-3 text-xs text-ink-300">Coverage is evidence-based and role-specific. We only proceed where we have current permission and verification.</p>
                        </Card>
                        <Card title="Ready to Request?">
                            <p className="text-sm text-ink-600">Start with a permission-checked Partner Services request.</p>
                            <ButtonLink href={request} className="mt-3 w-full">Request Partner Review <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
                            <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => openAskQuestion({ subject: listing.title, section: 'partner-services' })}><UserRound className="size-4" aria-hidden="true" /> Ask a Human Advisor</Button>
                        </Card>
                        {related.length > 0 && <Card title="Related services"><ul className="space-y-1.5 text-sm">{related.map((r) => <li key={r.slug}><Link href={`/partner-services/services/${r.slug}`} className="text-gold-700 hover:underline">{r.title}</Link></li>)}</ul></Card>}
                    </aside>
                </div>
            </PsBody>
        </>
    );
}
