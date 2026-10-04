import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Tabs } from '@/Components/ui/Kit';
import ComparisonTable from '@/Components/Advisory/Comparison';
import { ArrowLink, CheckList, DarkHero, SERVICES_TRUST, TrustBand } from '@/Components/Advisory/ui';
import { usePrice } from '@/lib/money';

interface Cap { slug: string; title: string; pillar: string; tagline: string; intro: string; sprintFit: string; sprintGet: string; paFit: string; kw: string }
interface V { name: string; tag: string; icon: string; get: string; who: string; commitment: string; price: string; price_note: string; exit: string; best: string; href: string }
interface Props {
    capability: Cap;
    pillar: { title: string; slug: string } | null;
    vehicles: Record<string, V>;
    sprints: { slug: string; title: string; summary: string; price_zar: number }[];
    services: { slug: string; title: string; price_zar: number; duration: string }[];
    fromResolver: boolean;
}

export default function Capability({ capability: c, pillar, vehicles, sprints, services, fromResolver }: Props) {
    const [tab, setTab] = useState('overview');
    const price = usePrice();
    const cols = [
        { key: 'sprint', recommended: true, values: { fit: c.sprintFit, get: c.sprintGet } },
        { key: 'digital-product', values: { fit: 'Standard templates & tools', get: 'Templates, calculators' } },
        { key: 'subscription', values: { fit: `Ongoing ${c.kw} updates`, get: 'Live insights & updates' } },
        { key: 'retainer', values: { fit: 'Ongoing expert capacity', get: 'Advisor time & advice' } },
        { key: 'project-advisory', values: { fit: c.paFit, get: 'Full delivery & implementation' } },
        { key: 'partner-services', values: { fit: 'Regulated / specialist', get: 'Specialist advice & certification' } },
    ].map((x) => {
        const v = vehicles[x.key];
        return { key: x.key, name: v.name, tag: v.tag, icon: v.icon, href: v.href, recommended: x.recommended, values: { ...x.values, who: v.who, commitment: v.commitment, price: `${v.price} ${v.price_note}`, exit: v.exit, when: v.best } };
    });
    cols.push({ key: 'enterprise', name: 'Enterprise Relationship', tag: 'Institutional', icon: 'building-2', href: '/services/enterprise-relationship', recommended: false, values: { fit: 'Institutional coordination', get: 'Consolidated account view', who: 'TBCA relationship team', commitment: 'Ongoing relationship', price: 'Custom (Quote required)', exit: 'By agreement', when: 'Enterprise coordination' } });

    return (
        <>
            <Head title={c.title} />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Capability Families', href: '/services/business-consultancy' }, ...(pillar ? [{ label: pillar.title, href: `/services/capability/${pillar.slug}` }] : []), { label: c.title }]}
                title={c.title}
                tagline={c.tagline}
                intro={c.intro}
                box={{
                    title: 'Is this what you need?',
                    items: [`You asked for expert help with a ${pillar?.title.toLowerCase() ?? ''} capability.`],
                    footer: (
                        <div>
                            <p className="flex items-center gap-1.5 text-sm text-verified-500"><CheckCircle2 className="size-4" />Yes, this matches your need</p>
                            <p className="text-xs text-ink-300">We show all the ways this capability can be delivered.</p>
                            <ButtonLink href={fromResolver ? '/services/choice-comparison' : '/services/resolver/1'} variant="outline-light" size="sm" className="mt-3">Back to Resolver</ButtonLink>
                        </div>
                    ),
                }}
            />
            <div className="container-tbca py-6">
                <Tabs tabs={[{ key: 'overview', label: 'Overview' }, { key: 'get', label: 'What You Get' }, { key: 'how', label: 'How It Works' }, { key: 'situations', label: 'Typical Situations' }, { key: 'who', label: 'Who Should Use This' }, { key: 'note', label: 'Professional Note' }, { key: 'faq', label: 'FAQs' }]} value={tab} onChange={setTab} />
                <div className="mt-5 grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-9">
                        {tab === 'overview' && (
                            <>
                                <h2 className="font-serif text-xl font-semibold text-ink-900">Choose the way that fits your context, timing and budget</h2>
                                <p className="mb-3 text-sm text-ink-600">All options are viable ways to receive {c.title} with TBCA.</p>
                                <ComparisonTable firstHeader="Way to work with TBCA" rows={[['fit', 'Best fit'], ['get', 'What you get'], ['who', 'Who delivers'], ['commitment', 'Commitment'], ['price', 'Indicative price (ZAR)'], ['exit', 'Exit / Flexibility'], ['when', 'When to choose']]} cols={cols} />
                            </>
                        )}
                        {tab === 'get' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-4"><h3 className="text-sm font-semibold">Sprints in this capability</h3>
                                    <ul className="mt-2 space-y-2">{services.map((s) => <li key={s.slug} className="flex justify-between text-sm"><Link href={`/services/catalogue/${s.slug}`} className="text-ink-800 hover:text-gold-700">{s.title}</Link><span className="text-xs text-ink-500">{price(s.price_zar)}</span></li>)}{services.length === 0 && <li className="text-xs text-ink-500">Browse the <Link href="/services/a-z" className="underline">A–Z catalogue</Link>.</li>}</ul>
                                </div>
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-4"><h3 className="text-sm font-semibold">Recommended catalogue sprints</h3>
                                    <ul className="mt-2 space-y-2">{sprints.map((s) => <li key={s.slug}><Link href={`/sprints/${s.slug}`} className="text-sm text-ink-800 hover:text-gold-700">{s.title}</Link></li>)}{sprints.length === 0 && <li className="text-xs text-ink-500">No matching catalogue sprints yet.</li>}</ul>
                                </div>
                            </div>
                        )}
                        {tab === 'how' && <ol className="grid gap-3 sm:grid-cols-4">{['Tell us your need', 'See every viable vehicle', 'Approve scope and price', 'Receive reviewed outputs'].map((s, i) => <li key={s} className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><span className="font-bold text-gold-700">{i + 1}.</span> {s}</li>)}</ol>}
                        {tab === 'situations' && <CheckList items={['Preparing a funding application', 'Evaluating an investment or expansion', 'Testing feasibility before committing capital', 'Planning budgets and performance targets', 'Responding to lender or investor questions']} />}
                        {tab === 'who' && <CheckList items={['Founders and owner-managers', 'CFOs and finance teams', 'Project sponsors and developers', 'Investors and boards']} />}
                        {tab === 'note' && <p className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm text-ink-700">{c.title} is a professional advisory service. Outputs are decision-support and do not constitute audit, assurance, tax or legal advice. Where regulated advice is needed, we route you to qualified Partners.</p>}
                        {tab === 'faq' && <dl className="space-y-3 text-sm"><div><dt className="font-semibold">Is the Sprint price fixed?</dt><dd className="text-ink-600">Yes — the Sprint price is fixed for the published scope. VAT and platform fees are shown separately at checkout.</dd></div><div><dt className="font-semibold">Can I upgrade later?</dt><dd className="text-ink-600">Yes. Your Sprint investment is credited when you upgrade to a Mandate. <ArrowLink href="/services/sprint-to-mandate-upgrade">How upgrades work</ArrowLink></dd></div></dl>}
                    </div>
                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><p className="font-semibold">What changes by option?</p><p className="text-xs text-ink-500">Delivery, commitment and depth.</p><ArrowLink href="/services/ways-to-work-with-tbca" className="mt-2">See full comparison guide</ArrowLink></div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><p className="font-semibold">Need help deciding?</p><p className="text-xs text-ink-500">Speak to a TBCA expert who will help you choose.</p><Link href="/services/proposal-request" className="mt-2 inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold"><MessageSquare className="size-3.5" />Talk to a Human</Link></div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><p className="font-semibold">Next step</p><p className="text-xs text-ink-500">Ready to get started?</p><ButtonLink href="/services/resolver/1" size="sm" className="mt-2 w-full" trailingIcon="arrow-right">Find the Right Service</ButtonLink></div>
                    </aside>
                </div>
            </div>
            <TrustBand items={SERVICES_TRUST} />
        </>
    );
}
