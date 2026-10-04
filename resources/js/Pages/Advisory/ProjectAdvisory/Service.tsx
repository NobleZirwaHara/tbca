import { Head, Link } from '@inertiajs/react';
import { Info, Tag } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Card, CheckList, KV, LedgerBadge, PageTitle } from '@/Components/Advisory/ui';
import { usePrice } from '@/lib/money';

interface Svc {
    slug: string; code: string; pcode: string; name: string; price: number; summary: string; scope: string; duration: string;
    derivation: Record<string, string>; included: string[]; excluded: string[]; method: string[]; deliverables: string[];
    studies: { name: string; status: string }[]; human: string[]; ai: string[]; acceptance: string[]; limitations: string[]; inputs: string[];
}

export default function PaService({ service: s, ledgers, others }: { service: Svc; ledgers: Record<string, [string, string, string]>; others: { slug: string; name: string; price: number; code: string }[] }) {
    const price = usePrice();
    return (
        <div className="container-tbca py-8">
            <Head title={s.name} />
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Services', href: '/project-advisory' }, { label: s.name }]} title={s.name} sub={s.summary} />
                    <section className="grid gap-4 rounded-[8px] border border-gold-300 bg-white p-5 sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-ink-500">Controlled Price (ZAR)</p>
                            <p className="font-serif text-4xl font-bold text-gold-700">{price(s.price)}</p>
                            <p className="flex items-center gap-1 text-xs text-ink-500">Ledger T: TBCA Professional Fee only <Info className="size-3" /></p>
                        </div>
                        <div className="flex items-center gap-2 border-parchment-300 sm:border-l sm:pl-4"><Tag className="size-5 text-gold-600" /><div><p className="text-xs text-ink-500">Fee Code</p><p className="font-serif text-xl">{s.code}</p><p className="text-[0.6875rem] text-ink-400">Register {s.pcode}</p></div></div>
                        <div className="flex flex-col gap-2">
                            <ButtonLink href="/project-advisory/discovery">Review Method</ButtonLink>
                            <ButtonLink href="/project-advisory/cost-exposure" variant="outline" trailingIcon="arrow-right">Estimate Path-to-Close Exposure</ButtonLink>
                        </div>
                    </section>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <Card num={1} title="Scope"><p className="text-xs text-ink-600">{s.scope}</p></Card>
                        <Card num={2} title="What is included"><CheckList items={s.included} /></Card>
                        <Card num={3} title="What is excluded"><CheckList tone="bad" items={s.excluded} /></Card>
                        <Card num={4} title="Typical client inputs"><CheckList tone="gold" items={s.inputs} /></Card>
                        <Card num={5} title="TBCA method"><p className="text-xs text-ink-600">TBCA {s.name} Methodology: {s.method.join(' → ')}.</p></Card>
                        <Card num={6} title="Human-led activities"><CheckList items={s.human} /></Card>
                        <Card num={7} title="AI-assisted activities"><CheckList tone="gold" items={s.ai} /></Card>
                        <Card num={8} title="Deliverable"><CheckList items={s.deliverables} /></Card>
                        <Card num={9} title="Acceptance criteria"><CheckList items={s.acceptance} /></Card>
                        <Card num={10} title="Limitations"><CheckList tone="bad" items={s.limitations} /></Card>
                        <Card num={11} title="Likely external studies">
                            <ul className="space-y-1.5 text-xs">{s.studies.map((x) => <li key={x.name} className="flex justify-between gap-2"><span>{x.name}</span><span className="rounded border border-parchment-500 px-1.5">{x.status}</span></li>)}</ul>
                        </Card>
                        <Card num={12} title="Next gate / Stop position">
                            <p className="text-xs text-ink-600">Next gate: Method Card approval and engagement confirmation.</p>
                            <p className="mt-1 inline-block rounded bg-verified-50 px-2 text-[0.6875rem] text-verified-700">Gate Status: Pending Approval</p>
                            <p className="mt-2 text-xs text-ink-600">Stop before external commitments retains portable work product already delivered.</p>
                            <p className="mt-1 inline-block rounded bg-risk-50 px-2 text-[0.6875rem] text-risk-700">Status: Controlled Stop</p>
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 lg:col-span-4">
                    <Card title="Service Summary">
                        <KV rows={[['Service Name', s.name], ['Fee Code', s.code], ['Controlled ZAR Price', price(s.price)], ['Duration', s.duration], ['Delivery Mode', 'Virtual / Hybrid'], ['Lead Adviser', 'TBCA Project Advisor'], ['Senior Reviewer', 'TBCA Senior Advisor'], ['Next Gate', 'Method Card Approval'], ['Stop Position', 'Portable Work Product Retained']]} />
                    </Card>
                    <Card title="Price Derivation (Ledger T)">
                        <KV rows={Object.entries(s.derivation)} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">The controlled price reflects defined scope, effort and quality assurance to deliver decision-ready work. External provider costs and statutory charges, where required, are separate and not included in the Ledger T amount.</p>
                    </Card>
                    <Card title="Commercial Boundary (Five-Ledger Logic)">
                        <ul className="space-y-2">{Object.entries(ledgers).map(([l, [n, , d]]) => <li key={l} className="flex items-start gap-2 text-xs"><LedgerBadge l={l} size="sm" /><span><b className="block">{n}</b>{d}</span></li>)}</ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Each ledger is controlled and transparent.</p>
                    </Card>
                    <Card title="Other services">
                        <ul className="space-y-1.5 text-xs">{others.map((o) => <li key={o.slug} className="flex justify-between"><Link href={`/project-advisory/services/${o.slug}`} className="hover:text-gold-700">{o.code} {o.name}</Link><span>{price(o.price)}</span></li>)}</ul>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
