import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, KpMonogram, KpPage, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    leader: { name?: string; post_nominal?: string; role?: string; summary?: string; expertise?: string[]; qualifications?: string[]; state?: string; reviewed?: string };
    focusAreas: [string, string, string][];
    rules: string[];
    claims: { code: string; claim: string | null; status: string }[];
}

const METHODS = ['African Business Diagnostics (ABD)', 'Capital Readiness Architecture (CRA)', 'Project Development Desk (PDD)', 'Boardroom Decision Frameworks', 'AI Decision Support & Africa Lens', 'Thorny Business Explainer Series'];
const EVIDENCE = [
    'All material claims are evidence-linked.',
    'Interview, speaking and media requests are subject to verification.',
    'Quotes and content are human-authored or AI-assisted with disclosure.',
    'Corrections and updates are published with transparent change records.',
];
const MORE: [string, string][] = [
    ["Founder's Notes", `${BASE}/founders-notes`],
    ['Speaking & Media Enquiries', `${BASE}/speaking-media`],
    ['Work With Kruger', `${BASE}/work-with-kruger`],
    ['Full Leadership Profile', '/about/team/kruger-phiri'],
];

/** KP-SCR-004 Founder Authority Foundation. Unevidenced claims from the design stay hidden (blueprint 12.5). */
export default function Founder({ screen, kpNav, leader, focusAreas, rules, claims }: Props) {
    const approved = claims.filter((c) => c.status === 'Approved');
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['About the Founder']]}
            title="Founder Authority Foundation"
            subtitle="Verified Experience. Practical Wisdom. African Impact."
            intro={`${leader.name ?? 'Kruger Phiri'}${leader.post_nominal ? `, ${leader.post_nominal}` : ''} is the ${leader.role ?? 'Founder'} of The Business Clinic.Africa. ${leader.summary ?? ''}`}
            actions={
                <>
                    <BtnLink href={`${BASE}/insights`} icon="arrow-right">Explore Kruger's Thinking</BtnLink>
                    <BtnLink href={`${BASE}/book`} tone="outline" icon="calendar-days">Book Kruger (Request)</BtnLink>
                </>
            }
            rail={
                <>
                    <Box title="Authority & Integrity First" icon="shield-check" tone="cream">
                        <ul className="space-y-2">{rules.map((r) => <li key={r} className="flex items-start gap-2 text-[0.8125rem]"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />{r}</li>)}</ul>
                    </Box>
                    <Box title="Verified By Design" icon="badge-check">
                        <p className="text-[0.8125rem]">Every biography element, credential, framework and case reference is either publicly verifiable or documented in the claim evidence register. Profile reviewed {leader.reviewed ?? 'recently'} ({leader.state ?? 'state pending'}).</p>
                        <Link href={`${BASE}/standards/evidence-popover`} className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Our Verification Process <L.ArrowRight className="size-3.5" /></Link>
                    </Box>
                    <Box title="Professional Boundaries" icon="scale">
                        <p className="text-[0.8125rem]">Legal, tax, accounting and medical advice are provided only by licensed professionals within their jurisdiction.</p>
                        <Link href={`${BASE}/standards/professional-limitation`} className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Our Boundaries <L.ArrowRight className="size-3.5" /></Link>
                    </Box>
                </>
            }
        >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {focusAreas.map(([t, b, i]) => (
                        <li key={t} className="flex gap-2.5 rounded-[10px] border border-parchment-400 bg-white p-3">
                            <Ico name={i} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                            <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.75rem] text-ink-500">{b}</span></span>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-center rounded-[12px] border border-gold-200 bg-white p-4"><KpMonogram /></div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Box title="Professional Foundation" icon="briefcase">
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {(leader.qualifications ?? []).map((q) => <li key={q} className="flex gap-2"><L.Award className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{q}</li>)}
                    </ul>
                    {approved.length > 0 && (
                        <ul className="mt-3 space-y-1 border-t border-parchment-300 pt-3 text-[0.8125rem]">
                            {approved.map((c) => <li key={c.code} className="flex gap-2"><L.BadgeCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />{c.claim}</li>)}
                        </ul>
                    )}
                </Box>
                <Box title="Knowledge & Methodologies" icon="layers">
                    <ul className="space-y-1.5 text-[0.8125rem]">{METHODS.map((m) => <li key={m} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{m}</li>)}</ul>
                    <p className="mt-3 text-[0.75rem] text-ink-500">Expertise: {(leader.expertise ?? []).join(', ')}.</p>
                </Box>
                <Box title="Evidence & Verification" icon="file-check">
                    <ul className="space-y-1.5 text-[0.8125rem]">{EVIDENCE.map((m) => <li key={m} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{m}</li>)}</ul>
                    <div className="mt-3 border-t border-parchment-300 pt-3">
                        <p className="text-[0.75rem] font-semibold text-ink-900">Claim evidence register</p>
                        <ul className="mt-1 space-y-1 text-[0.75rem]">
                            {claims.map((c) => (
                                <li key={c.code} className="flex items-center justify-between gap-2">
                                    <span className="truncate">{c.claim ?? `${c.code}: wording withheld until evidenced`}</span>
                                    <StatusPill status={c.status} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </Box>
            </div>

            <Box title="Explore More" icon="compass">
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {MORE.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center justify-between rounded-[8px] border border-parchment-400 px-3 py-2 text-[0.8125rem] font-semibold text-ink-900 hover:border-gold-500">{t}<L.ArrowRight className="size-4 text-gold-600" /></Link></li>)}
                </ul>
            </Box>

            <p className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-attested-500/30 bg-attested-50 px-4 py-3 text-[0.8125rem] text-ink-700">
                <span className="flex items-center gap-2"><L.Info className="size-4 text-attested-500" aria-hidden="true" />The Founder's time is limited and allocated to the highest-value decisions.</span>
                <Link href={`${BASE}/work-with-kruger`} className="font-semibold text-gold-700">See Availability & Process</Link>
            </p>
        </KpPage>
    );
}
