import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bot, CheckCircle2, Cpu, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Tabs } from '@/Components/ui/Kit';
import { Card, CheckList, KV, zar } from '@/Components/Advisory/ui';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Pkg { key: string; name: string; title: string; body: string; price: number | null; timeline: string; team: string; popular?: boolean }

export default function Sprint({ data, vat }: { data: { packages: Pkg[] }; vat: number }) {
    const { auth } = usePage<SharedProps>().props;
    const [pkg, setPkg] = useState('professional');
    const [tab, setTab] = useState('overview');
    const p = data.packages.find((x) => x.key === pkg)!;
    const v = p.price ? Math.round(p.price * vat) : 0;
    const start = () => router.post('/technology-solutions/sprints/ai-automation', { package: pkg });
    return (
        <>
            <Head title="AI & Automation Sprint — Technology Variant" />
            <header className="bg-ink-950 text-parchment-100">
                <div className="container-tbca py-10">
                    <div className="[&_a]:text-gold-400 [&_li]:text-ink-300"><Breadcrumbs items={[{ label: 'Technology Solutions', href: '/technology-solutions' }, { label: 'Sprints' }, { label: 'AI & Automation Sprint' }]} /></div>
                    <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-3xl font-semibold md:text-4xl">AI & Automation Sprint</h1><span className="rounded-full bg-gold-500 px-3 py-0.5 text-xs font-bold text-ink-900">Technology Variant</span></div>
                    <p className="mt-2 max-w-2xl text-ink-200">Design, configure and deploy enterprise-grade AI and automation solutions tailored to your business.</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">{['Fixed Scope', 'Transparent Pricing', 'Rapid Deployment', 'Human-Reviewed', 'Secure & Compliant'].map((c) => <span key={c} className="rounded-full border border-gold-600/60 px-2.5 py-0.5 text-gold-300">{c}</span>)}</div>
                </div>
            </header>
            <div className="container-tbca py-6">
                <Tabs tabs={[{ key: 'overview', label: 'Overview' }, { key: 'deliverables', label: 'Deliverables' }, { key: 'method', label: 'Methodology' }, { key: 'cases', label: 'Use Cases' }, { key: 'faq', label: 'FAQs' }]} value={tab} onChange={setTab} />
                <div className="mt-5 grid gap-5 lg:grid-cols-12">
                    <aside className="space-y-4 lg:col-span-3">
                        <Card title="Why This Sprint?"><CheckList items={['Solve real business challenges with AI', 'Improve efficiency and reduce manual tasks', 'Unlock data-driven decision making', 'Deploy secure, compliant solutions', 'Local support in South Africa']} /></Card>
                        <Card title="Regulatory & Security"><CheckList items={['POPIA & ISO 27001 aligned', 'Bank-grade data security', 'Human oversight at every stage', 'IP protection & NDAs included', 'Africa data residency options']} /></Card>
                        <Card title="Need Help?" tone="gold"><p className="text-xs">Speak to a technology specialist to choose the right sprint for your goals.</p><a href="https://wa.me/27120010567" className="mt-2 flex items-center gap-1 text-xs text-verified-700"><MessageCircle className="size-3.5" />Chat on WhatsApp</a></Card>
                    </aside>
                    <section className="space-y-4 lg:col-span-6">
                        {tab === 'overview' && (
                            <>
                                <h2 className="font-serif text-xl font-semibold">Choose Your Sprint Package</h2>
                                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                                    {data.packages.map((x) => (
                                        <button key={x.key} type="button" role="radio" aria-checked={pkg === x.key} onClick={() => setPkg(x.key)} className={cn('relative rounded-[8px] border bg-white p-4 text-left', pkg === x.key ? 'border-gold-500 ring-2 ring-gold-400' : 'border-parchment-400')}>
                                            {x.popular && <span className="absolute -top-2 right-3 rounded bg-gold-500 px-2 text-[0.625rem] font-bold">Most Popular</span>}
                                            <p className="font-serif text-lg font-semibold">{x.name}</p>
                                            <p className="text-sm font-semibold">{x.title}</p>
                                            <p className="text-xs text-ink-500">{x.body}</p>
                                            <p className="mt-2 text-lg font-bold text-gold-700">{x.price ? `From ${zar(x.price)}` : 'Price on Request'} {x.price && <span className="text-xs font-normal text-ink-500">(Excl. VAT)</span>}</p>
                                        </button>
                                    ))}
                                </div>
                                <Card title="What You Get"><CheckList items={['End-to-end AI & automation solution design and deployment', 'AI agents, workflow automation, data integration and analytics', 'Secure cloud, hybrid, or on-premise options', 'User training, documentation and change support', '30–90 day rapid implementation cycles', 'Post-deployment optimisation and 90-day hypercare']} /></Card>
                                <Card title="How It Works"><ol className="grid grid-cols-5 gap-2 text-center text-[0.6875rem]">{[['Discover', '1–3 days'], ['Design', '5–10 days'], ['Build', '2–6 weeks'], ['Test & Train', '1–2 weeks'], ['Go Live', 'Within 30–90 days']].map(([t, d], i) => <li key={t}><span className="inline-flex size-7 items-center justify-center rounded-full bg-gold-500 font-bold">{i + 1}</span><p className="mt-1 font-semibold">{t}</p><p className="text-ink-500">{d}</p></li>)}</ol></Card>
                            </>
                        )}
                        {tab === 'deliverables' && <Card title="Deliverables"><CheckList items={['Automation opportunity assessment', 'Solution architecture and agent design', 'Configured workflows and integrations', 'Test evidence and UAT sign-off pack', 'Runbooks, training and handover pack']} /></Card>}
                        {tab === 'method' && <Card title="Methodology"><p className="text-sm text-ink-600">Gate-based delivery: each phase is approved before the next begins. AI usage is metered against an approved cap with an 80% warning and a hard pause — metering never auto-approves charges.</p></Card>}
                        {tab === 'cases' && <Card title="Sample Use Cases"><CheckList items={['Automate finance, HR and procurement workflows', 'Deploy AI-powered customer service and chatbots', 'Build predictive analytics and demand forecasting', 'Digitise compliance and risk monitoring processes', 'Integrate ERP, CRM and business applications']} /></Card>}
                        {tab === 'faq' && <Card title="FAQs"><p className="text-sm"><b>Are licences included?</b> No — model/API consumption and vendor licences are external costs (Ledger X), passed through at cost.</p><p className="mt-2 text-sm"><b>What do I pay to start?</b> A 30% deposit on acceptance; 40% on configuration sign-off; 30% on go-live.</p></Card>}
                        <div className="grid grid-cols-4 gap-2 rounded-[8px] bg-ink-950 p-4 text-center text-parchment-100">{[['Human', 'Reviewed'], ['Fixed', 'Scope'], ['3', 'Ledgers, never blended'], ['90-day', 'Hypercare']].map(([a, b]) => <div key={b}><p className="font-serif text-xl text-gold-400">{a}</p><p className="text-[0.6875rem]">{b}</p></div>)}</div>
                    </section>
                    <aside className="lg:col-span-3">
                        <Card title="Sprint Summary" action={<span className="rounded bg-gold-100 px-2 text-xs text-gold-800">{p.name} Selected</span>}>
                            <KV rows={[['Variant', 'Technology'], ['Package', p.name], ['Est. Timeline', p.timeline], ['Team Size', p.team], ['Support Tier', '90-day hypercare'], ['Delivery Model', 'Hybrid (Cloud + On-Prem)']]} />
                            <p className="mt-3 text-xs font-semibold">Investment Breakdown</p>
                            <KV rows={p.price ? [['Sprint Package', zar(p.price)], ['TBCA Professional Fees', 'Included'], ['VAT (15%)', zar(v)], ['Total (Incl. VAT)', <b>{zar(p.price + v)}</b>], ['Deposit now (30%)', zar(Math.round(p.price * 0.3))]] : [['Pricing', 'Quoted after scoping']]} />
                            <p className="mt-3 text-xs font-semibold">Payment & Contract Terms</p>
                            <ul className="text-xs text-ink-600"><li>30% Deposit on acceptance</li><li>40% On configuration sign-off</li><li>30% On go-live</li><li>Engagement Letter required</li></ul>
                            <Link href="/technology-solutions/fees" className="mt-2 block text-xs font-semibold text-gold-700">View Fee Transparency →</Link>
                            <Button className="mt-3 w-full" onClick={start} trailingIcon="arrow-right">{p.price ? 'Start This Sprint' : 'Request Quote'}</Button>
                            {!auth.user && p.price && <p className="mt-1 text-center text-[0.6875rem] text-ink-500">You can check out as a guest or sign in.</p>}
                            <p className="mt-2 flex items-center justify-center gap-1 text-[0.6875rem] text-ink-500"><CheckCircle2 className="size-3" />Human-reviewed delivery <Bot className="size-3" /><Cpu className="size-3" /></p>
                        </Card>
                    </aside>
                </div>
            </div>
        </>
    );
}
