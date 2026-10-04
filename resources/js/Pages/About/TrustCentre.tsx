import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';

interface Content {
    cards: { title: string; icon: string; tone: string; body: string; link: { label: string; href: string } }[];
    commitments: string[];
}

const toneBg: Record<string, string> = {
    green: 'bg-verified-50 text-verified-700',
    blue: 'bg-controlled-50 text-controlled-700',
    purple: 'bg-referenced-50 text-referenced-700',
    orange: 'bg-attested-50 text-attested-700',
    red: 'bg-risk-50 text-risk-700',
};

function SideCard({ icon, title, body, link, tone, extra }: { icon: string; title: string; body: string; link: { label: string; href: string }; tone: string; extra?: React.ReactNode }) {
    return (
        <div className={cn('rounded-[8px] border p-4', tone)}>
            <div className="flex items-start gap-3">
                <AboutIcon name={icon} className="size-8 shrink-0" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-semibold text-ink-900">{title}</h2>
                        {extra}
                    </div>
                    <p className="mt-1 text-[0.8125rem] text-ink-600">{body}</p>
                    <Link href={link.href} className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold hover:underline">
                        {link.label} <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function TrustCentre({ content, systemStatus }: { content: Content; systemStatus: { healthy: boolean; label: string } | null }) {
    return (
        <>
            <Head title="Trust Centre" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Trust Centre' }]}
                title="Trust Centre"
                lead="Transparency builds trust. Trust enables impact."
                intro="Welcome to our Trust Centre. Here you will find our policies, certifications, governance practices and assurance reports. We are committed to operating with integrity, protecting your information and delivering value responsibly."
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {content.cards.map((c) => (
                                <article key={c.title} className="flex flex-col items-center rounded-[8px] border border-parchment-400 bg-white p-5 text-center">
                                    <span className={cn('inline-flex size-16 items-center justify-center rounded-full', toneBg[c.tone])}>
                                        <AboutIcon name={c.icon} className="size-8" />
                                    </span>
                                    <h2 className="mt-4 font-semibold text-ink-900">{c.title}</h2>
                                    <p className="mt-2 text-[0.8125rem] text-ink-600">{c.body}</p>
                                    <Link href={c.link.href} className="mt-auto inline-flex items-center gap-1 pt-4 text-[0.8125rem] font-semibold text-controlled-700 hover:underline">
                                        {c.link.label} <ArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                </article>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 rounded-[8px] border border-parchment-400 bg-white p-5 xl:flex-row xl:items-center">
                            <p className="flex shrink-0 items-center gap-2 font-semibold text-ink-900">
                                <ShieldCheck className="size-7 text-ink-700" aria-hidden="true" /> Our Trust Commitments
                            </p>
                            <ul className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                {content.commitments.map((c) => (
                                    <li key={c} className="flex items-start gap-2 text-xs text-ink-700">
                                        <CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" /> {c}
                                    </li>
                                ))}
                            </ul>
                            <ButtonLink href="/about/trust-badge" variant="outline" size="sm" trailingIcon="arrow-right">Read Our Trust Charter</ButtonLink>
                        </div>
                    </div>
                    <aside className="space-y-4">
                        <SideCard
                            icon="shield-check"
                            title="System Status"
                            tone={systemStatus?.healthy ? 'border-verified-500/30 bg-verified-50/50 text-verified-700' : 'border-attested-500/30 bg-attested-50/50 text-attested-700'}
                            body={systemStatus ? (systemStatus.healthy ? 'All critical systems are operating normally.' : 'One or more services are degraded. See live status.') : 'Status data not yet evidenced.'}
                            link={{ label: 'View System Status', href: '/system-status' }}
                            extra={systemStatus && <span className="rounded-full bg-white px-2 py-0.5 text-[0.6875rem] font-semibold">{systemStatus.label}</span>}
                        />
                        <SideCard icon="info" title="Transparency Commitment" tone="border-controlled-500/25 bg-controlled-50/50 text-controlled-700" body="We disclose material issues openly and act to correct them. No material public corrections are hidden." link={{ label: 'View Corrections Register', href: '/about/corrections' }} />
                        <SideCard icon="mail" title="Report a Concern" tone="border-attested-500/25 bg-attested-50/50 text-attested-700" body="If you believe we have not met our standards, let us know. Reports are treated seriously and confidentially." link={{ label: 'Submit a Concern', href: '/complaints' }} />
                        <SideCard icon="headphones" title="Contact Trust Team" tone="border-referenced-500/25 bg-referenced-50/50 text-referenced-700" body="Have a question about our practices or need more information?" link={{ label: 'Contact Us', href: '/about/contact' }} />
                    </aside>
                </div>
            </section>
        </>
    );
}
