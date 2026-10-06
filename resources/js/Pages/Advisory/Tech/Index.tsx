import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Bot, MapPin, Rocket, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import CoverArt from '@/Components/Art/CoverArt';
import { DarkHero, TrustBand } from '@/Components/Advisory/ui';

interface Tower { code: string; slug: string; name: string; icon: string; blurb: string; services: number }

const STEPS: [string, string][] = [
    ['Discover', 'Explore our solution towers and understand your goals, challenges and technology landscape.'],
    ['Diagnose', 'Complete our free Technology Readiness Diagnostic and see where you stand today.'],
    ['Configure', 'Use the AI Solution Architect to shape your solution and see the cost drivers before any commitment.'],
    ['Review', 'Receive your complete fee disclosure and review your Engagement Letter with clarity.'],
    ['Approve', 'Approve the relevant gate and fund external costs before we commit on your behalf.'],
    ['Deliver', 'We implement, integrate, test and hand over with human review and UAT validation.'],
    ['Operate & Scale', 'We support, optimise and scale your solution with retainer and managed service options.'],
];

export default function TechIndex({ towers }: { towers: Tower[] }) {
    return (
        <>
            <Head title="Technology Solutions" />
            <DarkHero
                title="Technology Solutions."
                tagline="Automate. Integrate. Scale."
                intro="Enterprise-ready technology solutions, automations and integrations for organisations across Africa — delivered in 54 countries, 7 languages and 5 currencies."
                chips={[{ label: 'AI & Automation', sub: 'Expertise' }, { label: 'Zoho One', sub: 'Specialists' }, { label: 'RPA & Workflow', sub: 'Automation' }, { label: 'Secure & Compliant', sub: 'by Design' }, { label: 'Africa-wide Support', sub: '54 Countries' }]}
                box={{ title: 'Platform Boundary', items: ['Africa (Active) — 54 Countries, 5 Regions', '7 Languages: English, Afrikaans, Portuguese, Mandarin, French, Swahili, Arabic', '5 Currencies: ZAR (source), USD, XOF, EUR, CNY', 'Human-Reviewed with Approval Gates', 'Secure & POPIA Compliant'] }}
            >
                <ButtonLink href="/technology-solutions/context" trailingIcon="arrow-right">Request Setup</ButtonLink>
                <ButtonLink href="/contact" variant="outline-light" icon="calendar-days">Book Discovery Call</ButtonLink>
            </DarkHero>
            <section className="container-tbca py-10">
                <h2 className="font-serif text-2xl font-semibold text-ink-900">Our Technology Solution Towers</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    {towers.map((t) => (
                        <Link key={t.code} href={`/technology-solutions/towers/${t.slug}`} className="group flex flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white hover:border-gold-400">
                            <CoverArt seed={t.slug} category="technology" label={t.name} className="aspect-[4/3]" />
                            <span className="flex flex-1 flex-col p-4">
                                <span className="-mt-9 inline-flex size-11 items-center justify-center rounded bg-ink-900 text-gold-400 ring-2 ring-white"><AdvIcon name={t.icon} /></span>
                                <span className="mt-2 text-xs font-bold text-gold-700">{t.code}</span>
                                <span className="text-sm font-semibold text-ink-900">{t.name}</span>
                                <span className="mt-1 flex-1 text-xs text-ink-600">{t.blurb}</span>
                                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">{t.services} services <ArrowRight className="size-3" /></span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
            <section className="bg-ink-950 py-10 text-parchment-100">
                <div className="container-tbca">
                    <h2 className="font-serif text-2xl text-gold-400">How Technology Solutions Works</h2>
                    <ol className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                        {STEPS.map(([t, b], i) => <li key={t} className="rounded-[8px] border border-ink-700 p-3"><span className="inline-flex size-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span><p className="mt-2 text-sm font-semibold text-gold-300">{t}</p><p className="text-xs text-ink-300">{b}</p></li>)}
                    </ol>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <ButtonLink href="/technology-solutions/readiness" trailingIcon="arrow-right">Free Readiness Diagnostic</ButtonLink>
                        <ButtonLink href="/technology-solutions/configure" variant="outline-light">AI Solution Architect</ButtonLink>
                        <ButtonLink href="/technology-solutions/sprints/ai-automation" variant="outline-light">AI & Automation Sprint</ButtonLink>
                        <ButtonLink href="/technology-solutions/workspace" variant="outline-light">Client Portal</ButtonLink>
                    </div>
                </div>
            </section>
            <section className="container-tbca py-8">
                <h2 className="text-sm font-semibold text-ink-700">Our Technology Partners</h2>
                <ul className="mt-3 flex flex-wrap gap-2">{['Zoho', 'n8n', 'make', 'Microsoft 365', 'AWS', 'Google Cloud', 'Power BI', 'QuickBooks', 'HubSpot', 'DocuSign', 'SendGrid'].map((p) => <li key={p} className="rounded border border-parchment-400 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700">{p}</li>)}</ul>
                <p className="mt-2 text-xs text-ink-500">Partner licences are external costs (Ledger X), passed through at cost with no markup.</p>
            </section>
            <section className="container-tbca pb-10">
                <div className="grid gap-4 rounded-[10px] border border-gold-500/50 bg-ink-950 p-6 text-parchment-100 lg:grid-cols-12">
                    <ul className="grid grid-cols-2 gap-4 lg:col-span-8 lg:grid-cols-4">
                        {[[Rocket, 'Proven Expertise', 'Human-reviewed implementations'], [Bot, 'Human + AI Collaboration', 'Expertise with intelligent automation'], [ShieldCheck, 'Security First', 'Bank-grade security & POPIA compliance'], [MapPin, 'Africa-wide Support', 'Delivered across 54 African countries']].map(([I, t, b]) => {
                            const Icon = I as typeof Rocket;
                            return <li key={t as string} className="flex gap-2"><Icon className="size-6 shrink-0 text-gold-400" /><span><b className="block text-sm">{t as string}</b><span className="text-xs text-ink-300">{b as string}</span></span></li>;
                        })}
                    </ul>
                    <div className="lg:col-span-4">
                        <p className="font-serif text-lg text-gold-400">Ready to modernise your business?</p>
                        <p className="text-sm text-ink-300">Let&rsquo;s build the right technology foundation for your growth.</p>
                        <div className="mt-3 flex flex-wrap gap-2"><ButtonLink href="/technology-solutions/context" size="sm" trailingIcon="arrow-right">Request Setup</ButtonLink><ButtonLink href="/contact" size="sm" variant="outline-light">Book Discovery Call</ButtonLink></div>
                    </div>
                </div>
            </section>
            <TrustBand items={[['Free S0–S4', 'Discovery to fee disclosure'], ['Gate-by-gate approval', 'Current gate only'], ['No blended ledgers', 'T, X and S separate'], ['No markup on X', 'Pass-through at cost'], ['UAT before go-live', 'Evidence-based acceptance'], ['No silent renewal', 'Fresh assent required']]} />
        </>
    );
}
