import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, CalendarDays, Search } from 'lucide-react';
import CoverArt from '@/Components/Art/CoverArt';
import { usePrice } from '@/lib/money';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { Card, KV, LedgerBadge, TrustBand } from '@/Components/Advisory/ui';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';

interface Detail {
    code: string; slug: string; name: string; icon: string; intro: string; dep: string; services: number;
    capabilities: { title: string; body: string; icon: string }[];
    sprints: { title: string; body: string; tier: string; posture: string; slug: string; exists: boolean }[];
    dependencies: [string, string][];
    pathways: [string, string, string][];
}

interface CatalogueSprint { slug: string; title: string; category: string; summary: string; price_zar: number; delivery: string | null; group: string | null; image: string | null }
interface OtherTower { code: string; slug: string; name: string; icon: string; services: number }

const PAGE = 24;

export default function Tower({ tower: t, catalogue, others }: { tower: Detail; catalogue: CatalogueSprint[]; others: OtherTower[] }) {
    const price = usePrice();
    const [q, setQ] = useState('');
    const [limit, setLimit] = useState(PAGE);
    const term = q.trim().toLowerCase();
    const list = term ? catalogue.filter((s) => `${s.title} ${s.summary} ${s.group ?? ''}`.toLowerCase().includes(term)) : catalogue;
    const findMatching = (title: string) => {
        setQ(title.replace(t.name, '').replace(/sprint/i, '').trim().split(' ')[0] ?? '');
        document.getElementById('tower-services')?.scrollIntoView({ behavior: 'smooth' });
    };
    const configure = () => router.post('/technology-solutions/towers', { tower: t.code, draft: false });
    return (
        <>
            <Head title={`${t.code} ${t.name}`} />
            <header className="bg-ink-950 text-parchment-100">
                <div className="container-tbca grid gap-6 py-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div className="[&_a]:text-gold-400 [&_li]:text-ink-300"><Breadcrumbs items={[{ label: 'Technology Solutions', href: '/technology-solutions' }, { label: 'Towers', href: '/technology-solutions/towers' }, { label: `${t.code} ${t.name}` }]} /></div>
                        <div className="flex items-start gap-4">
                            <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-[10px] border border-gold-600 bg-ink-900 text-gold-400"><AdvIcon name={t.icon} className="size-8" /></span>
                            <div>
                                <h1 className="font-serif text-3xl font-semibold md:text-4xl">{t.code} {t.name}</h1>
                                <p className="mt-2 text-ink-200">{t.intro}</p>
                                <p className="mt-2 text-sm text-gold-300">{t.services} services (sprints) in this tower · Delivered across 54 African countries · 7 languages · 5 currencies</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">{['Africa (Active)', '7 Languages', '5 Currencies', 'Human-Reviewed'].map((c) => <span key={c} className="rounded-full border border-gold-600/60 px-2.5 py-0.5 text-gold-300">{c}</span>)}</div>
                                <div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => document.getElementById('tower-services')?.scrollIntoView({ behavior: 'smooth' })}>View All {t.services} Services</Button><Button onClick={configure} variant="outline-light" trailingIcon="arrow-right">Configure This Solution</Button><ButtonLink href="/contact" variant="outline-light" icon="calendar-days">Book Discovery</ButtonLink></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-3 lg:col-span-5">
                        <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-4 text-sm"><p className="font-semibold text-gold-400">Tower Summary</p><dl className="mt-2 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-ink-400">Tower Code</dt><dd>{t.code}</dd></div><div><dt className="text-ink-400">Delivery Model</dt><dd>Advisory + Implementation</dd></div><div><dt className="text-ink-400">Delivery Geography</dt><dd>Africa (Active)</dd></div><div><dt className="text-ink-400">Current Availability</dt><dd>Active</dd></div></dl><p className="mt-2 text-[0.6875rem] text-ink-400">Commercial availability remains subject to configuration and gate approval.</p></div>
                        <div className="rounded-[8px] border border-ink-700 bg-ink-900 p-4 text-xs"><p className="font-semibold text-gold-400">How This Works</p><p className="mt-2 flex flex-wrap items-center gap-1">{['Discover', 'Diagnose', 'Configure', 'Review Fees', 'Sign', 'Approve', 'Deliver'].map((s, i) => <span key={s} className="inline-flex items-center gap-1">{i > 0 && <ArrowRight className="size-3 text-gold-500" />}{s}</span>)}</p><p className="mt-2 text-ink-400">Our structured journey ensures the right solution, transparent fees and accountable delivery at every step.</p></div>
                    </div>
                </div>
            </header>
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                    <Card num={1} title="In-Scope Capabilities"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{t.capabilities.map((c) => <div key={c.title} className="rounded border border-parchment-400 p-2.5"><AdvIcon name={c.icon} className="size-5 text-gold-600" /><p className="mt-1 text-xs font-semibold">{c.title}</p><p className="text-[0.6875rem] text-ink-500">{c.body}</p></div>)}</div></Card>
                    <Card num={2} title="Representative Sprint Examples">
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{t.sprints.map((s) => <div key={s.title} className="flex flex-col rounded border border-parchment-400 p-3"><p className="text-xs font-semibold">{s.title}</p><p className="mt-1 flex-1 text-[0.6875rem] text-ink-500">{s.body}</p><p className="mt-2 flex justify-between text-[0.6875rem]"><span>Starts from {s.tier}</span><span className="rounded bg-parchment-300 px-1.5">{s.posture}</span></p>{s.exists ? <Link href={`/sprints/${s.slug}`} className="mt-1 text-[0.6875rem] font-semibold text-gold-700">View Sprint →</Link> : <button type="button" onClick={() => findMatching(s.title)} className="mt-1 text-left text-[0.6875rem] font-semibold text-gold-700">Find matching services →</button>}</div>)}</div>
                        <Link href="/technology-solutions/sprints/ai-automation" className="mt-3 inline-block text-xs font-semibold text-gold-700">See the AI & Automation Sprint (technology variant) →</Link>
                    </Card>
                    <Card num={3} title="External Dependencies (Not TBCA Fees)"><KV rows={t.dependencies} /></Card>
                </div>
                <div className="space-y-4 lg:col-span-5">
                    <Card num={4} title="Fee Class Preview (Fees Are Not Combined)">
                        <table className="w-full text-[0.6875rem]"><thead className="text-ink-500"><tr><th className="text-left">Ledger</th><th className="text-left">What It Covers</th><th>Fee Posture</th><th>Certainty</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                <tr><td className="py-1.5"><LedgerBadge l="T" size="sm" /> TBCA Fees</td><td>Advisory, configuration, implementation, testing, training & support</td><td className="text-center">Quote-on-Approval</td><td className="text-center">Variable</td></tr>
                                <tr><td className="py-1.5"><LedgerBadge l="X" size="sm" /> External Costs</td><td>{t.dep}, third-party services, APIs, infrastructure and tools</td><td className="text-center">Pass-Through / Estimated</td><td className="text-center">Estimated</td></tr>
                                <tr><td className="py-1.5"><LedgerBadge l="S" size="sm" /> Statutory</td><td>VAT, withholding tax and other statutory obligations</td><td className="text-center">As Per Law</td><td className="text-center">Fixed</td></tr>
                            </tbody></table>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Fee architecture, line-item breakdowns and approval gates are provided after configuration.</p>
                    </Card>
                    <Card num={5} title="Risk & Review Panel"><ul className="space-y-2 text-xs">{[['Sensitive Data Review', 'Review required for PII and financial data', 'Human Review'], ['Integration Complexity Review', 'Complex integrations reviewed for risk', 'Review'], ['Human Review Trigger', 'All configurations subject to human gate', 'Accountable'], ['Change Control', 'Changes tracked with approval trail', 'Controlled']].map(([a, b, c]) => <li key={a} className="flex justify-between gap-2"><span><b className="block">{a}</b>{b}</span><span className="h-fit rounded bg-controlled-50 px-1.5 text-controlled-700">{c}</span></li>)}</ul></Card>
                    <Card num={6} title="Likely Recurring Service Pathways"><ul className="grid grid-cols-2 gap-2 text-xs">{t.pathways.map(([a, b, c]) => <li key={a} className="rounded border border-parchment-400 p-2"><b className="block">{a}</b><span className="text-ink-500">{b}</span><span className="mt-1 flex items-center gap-1 text-gold-700"><CalendarDays className="size-3" />{c}</span></li>)}</ul></Card>
                </div>
            </div>
            <section id="tower-services" className="container-tbca scroll-mt-20 pb-10" aria-labelledby="tower-services-h">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold tracking-wider text-gold-700 uppercase">{t.code} · Full service list</p>
                        <h2 id="tower-services-h" className="font-serif text-2xl font-semibold text-ink-900">All services (sprints) in {t.name}</h2>
                        <p className="text-xs text-ink-500">{catalogue.length} sprints from the live catalogue. Prices are set in ZAR and shown in your selected currency.</p>
                    </div>
                    <label className="relative w-full max-w-xs">
                        <span className="sr-only">Search services in this tower</span>
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                        <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search services…" className="h-10 w-full rounded-[4px] border border-parchment-500 bg-white pr-3 pl-8 text-sm" />
                    </label>
                </div>
                {list.length === 0 ? (
                    <p className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-6 text-center text-sm text-ink-500">No services match “{q}”.</p>
                ) : (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {list.slice(0, limit).map((s) => (
                            <li key={s.slug}>
                                <Link href={`/sprints/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white hover:border-gold-400">
                                    <CoverArt seed={s.slug} category="technology" label={s.title} src={s.image} className="aspect-[16/9]" />
                                    <span className="flex flex-1 flex-col p-3">
                                        {s.group && <span className="line-clamp-1 text-[0.625rem] font-semibold tracking-wide text-gold-700 uppercase">{s.group}</span>}
                                        <span className="mt-0.5 line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-gold-800">{s.title}</span>
                                        <span className="mt-1 line-clamp-2 flex-1 text-xs text-ink-600">{s.summary}</span>
                                        <span className="mt-2 flex items-center justify-between text-xs"><span className="font-bold text-ink-900">{s.price_zar > 0 ? `From ${price(s.price_zar)}` : 'Quote'}</span><span className="text-gold-700">View Sprint →</span></span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                {list.length > limit && <div className="mt-4 text-center"><Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>Show more ({list.length - limit} remaining)</Button></div>}
                {others.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-ink-700">Other towers</h3>
                        <ul className="mt-2 flex flex-wrap gap-2">{others.map((o) => <li key={o.code}><Link href={`/technology-solutions/towers/${o.slug}`} className="inline-flex items-center gap-2 rounded-full border border-parchment-500 bg-white px-3 py-1.5 text-xs hover:border-gold-500"><AdvIcon name={o.icon} className="size-4 text-gold-600" />{o.code} {o.name} <span className="text-ink-500">({o.services})</span></Link></li>)}</ul>
                    </div>
                )}
            </section>
            <TrustBand items={[['Human-reviewed', 'Every configuration'], ['Gate approval', 'Current gate only'], ['T / X / S', 'Never blended'], ['No markup', 'On supplier costs'], ['Market', 'Africa (Active)'], ['POPIA', 'Secure by design']]} />
        </>
    );
}
