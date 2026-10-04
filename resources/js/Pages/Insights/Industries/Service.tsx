import { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Bookmark, Calculator, Download, FileText, Info, Lock, Phone, ShieldCheck, ShoppingCart, Users, XCircle } from 'lucide-react';
import { Modal, Tabs } from '@/Components/ui/Kit';
import { AdvisorCard, ContextCard, IndustryFrame, TrustCard } from '@/Components/Insights/Industries';
import { Box, CheckList, Chip, zar } from '@/Components/Insights/Shared';
import type { SharedProps } from '@/types';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

interface AddOn { component: string; detail: string; purpose: string; ledger: 'T' | 'P' | 'X' | 'S'; fee: number | null }
interface Limitation { id: string; version: string; effective: string; scope: string; scopeItems: string[]; limitations: string[]; outOfScope: string[] }
interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    sku: {
        slug: string; code: string; title: string; summary: string | null; description: string | null; priceZar: number | null; saleState: 'sellable' | 'blocked' | 'restricted';
        included: string[]; addOns: AddOn[]; limitation: Limitation | null; addOnTotal: number; hasVariableAddOn: boolean; complexityClass: string;
        block: null | { code: string; reason: string | null; detail: string | null; rules: string[]; message: string | null };
    };
    related: { slug: string; title: string; sale_state: string; price_zar: number | null }[];
    blockedSku: null | { slug: string; code: string; title: string; block_code: string | null; block_reason: string | null; block_detail: string | null; block_rules: string[] | null };
}

const LEDGER = { T: 'TBCA', P: 'Professional', X: 'External', S: 'Statutory' } as const;

export default function IndustryService({ industry: ind, context, sku, related, blockedSku }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [tab, setTab] = useState('description');
    const [stage, setStage] = useState<'none' | 'limitation' | 'addons'>('none');
    const [blockOpen, setBlockOpen] = useState(sku.saleState !== 'sellable' || !!blockedSku);
    const form = useForm({ acknowledge_limitation: false, acknowledge_addons: false });

    const block = blockedSku
        ? { title: blockedSku.title, code: blockedSku.code, blockCode: blockedSku.block_code ?? 'IN-BLOCK', reason: blockedSku.block_reason, detail: blockedSku.block_detail, rules: blockedSku.block_rules ?? [] }
        : sku.block ? { title: sku.title, code: sku.code, blockCode: sku.block.code, reason: sku.block.reason, detail: sku.block.detail ?? sku.block.message, rules: sku.block.rules } : null;

    const start = () => {
        if (!auth.user) return router.get('/login');
        if (sku.saleState !== 'sellable') return setBlockOpen(true);
        setStage('limitation');
    };
    const afterLimitation = () => (sku.addOns.length ? setStage('addons') : commit());
    const commit = () => form.post(`/industries/${ind.slug}/services/${sku.slug}/engage`, { onError: () => setStage('limitation') });

    return (
        <IndustryFrame
            title={sku.title}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.name, href: `/industries/${ind.slug}` }, { label: 'Diagnostics', href: `/industries/${ind.slug}/diagnostic` }, { label: sku.title }]}
            sidebar={
                <>
                    <ContextCard title="Your Industry Context" context={context} />
                    <AdvisorCard title="Need Help Choosing?" text="Speak to a TBCA Advisor for a sector-adapted recommendation." label="Book Advisor Call" />
                    <TrustCard />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Chip tone="green">AIIM Enabled</Chip>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-ink-900">{sku.title}</h1>
                    <p className="mt-1 max-w-xl text-sm text-ink-600">{sku.summary}</p>
                    <p className="mt-2 text-xs text-ink-500">Industry: <strong>{ind.name}</strong> · Sub-Industry: <strong>{context.subIndustryName ?? 'Not selected'}</strong> · SKU {sku.code}</p>
                </div>
                {auth.user && (
                    <button type="button" onClick={() => router.post('/saved', { item_type: 'industry-service', item_key: sku.slug, label: sku.title, url: `/industries/${ind.slug}/services/${sku.slug}` }, { preserveScroll: true })} className="flex items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800">
                        <Bookmark className="size-4" /> Save Diagnostic
                    </button>
                )}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                    <Box title="Price">
                        <p className="text-xs text-ink-500">From</p>
                        <p className="text-3xl font-bold text-ink-900">{sku.priceZar ? zar(sku.priceZar) : '—'}</p>
                        <p className="text-xs text-ink-500">Ex VAT · uniform base price, mandatory add-ons shown before you commit</p>
                        <button type="button" onClick={start} className="mt-4 flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-4 py-2.5 text-sm font-bold text-ink-900 disabled:opacity-50" disabled={form.processing}>
                            {sku.saleState === 'sellable' ? <><ShoppingCart className="size-4" /> Add to Cart</> : <><Lock className="size-4" /> Not available</>}
                        </button>
                        <Link href={`/industries/${ind.slug}`} className="mt-2 block rounded-[4px] border border-gold-500 py-2 text-center text-sm font-semibold text-gold-800">Add to Compare</Link>
                        {sku.limitation && <button type="button" onClick={() => setStage('limitation')} className="mt-3 text-xs text-controlled-700 underline">Read the Sector Limitation Statement</button>}
                        {(form.errors.acknowledge_limitation || form.errors.acknowledge_addons) && <p role="alert" className="mt-2 text-xs text-risk-500">{form.errors.acknowledge_limitation ?? form.errors.acknowledge_addons}</p>}
                    </Box>
                    <Box title="What You Get"><CheckList items={sku.included} /></Box>
                </div>
                <div className="space-y-4">
                    <Box>
                        <Tabs tabs={[{ key: 'description', label: 'Description' }, { key: 'method', label: 'Methodology' }, { key: 'faq', label: 'FAQs' }, { key: 'terms', label: 'Terms' }]} value={tab} onChange={setTab} />
                        <div className="pt-4 text-sm text-ink-700">
                            {tab === 'description' && <p>{sku.description}</p>}
                            {tab === 'method' && <p>Sector-adapted questionnaire, evidence review and AIIM benchmarks. Complexity class {sku.complexityClass}; human review where required. Outputs carry source, date and confidence.</p>}
                            {tab === 'faq' && (
                                <dl className="space-y-3">
                                    <div><dt className="font-semibold">Is this a certification?</dt><dd>No. It is information only — not a certification, approval or regulated opinion.</dd></div>
                                    <div><dt className="font-semibold">Why are there add-ons?</dt><dd>Some components are required by law or professional standards for your industry context. They are always disclosed before you pay.</dd></div>
                                </dl>
                            )}
                            {tab === 'terms' && <p>Fees in ZAR excl. VAT. No commitment is made until you confirm and pay. You may abort at any stage per the Abort Ladder.</p>}
                        </div>
                    </Box>
                    {related.length > 0 && (
                        <Box title="Other services in this industry">
                            <ul className="divide-y divide-parchment-300 text-sm">
                                {related.map((r) => (
                                    <li key={r.slug} className="flex items-center justify-between py-2">
                                        <span>{r.title}</span>
                                        {r.sale_state === 'sellable' ? (
                                            <Link href={`/industries/${ind.slug}/services/${r.slug}`} className="text-xs font-semibold text-gold-700">{r.price_zar ? zar(r.price_zar) : 'View'} →</Link>
                                        ) : (
                                            <Link href={`/industries/${ind.slug}/services/${sku.slug}?requested=${r.slug}`} preserveScroll className="text-xs font-semibold text-risk-700">Request →</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    )}
                </div>
            </div>

            {/* IN-SCR-012 Blocked SKU explanation */}
            <Modal open={blockOpen && !!block} onClose={() => (sku.saleState === 'sellable' ? (setBlockOpen(false), router.get(`/industries/${ind.slug}/services/${sku.slug}`, {}, { preserveScroll: true, replace: true })) : setBlockOpen(false))} title="Service Not Available" size="xl"
                footer={<button type="button" onClick={() => setBlockOpen(false)} className="rounded-[4px] bg-ink-900 px-5 py-2 text-sm font-semibold text-parchment-100">Close</button>}>
                {block && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-start gap-3">
                            <XCircle className="size-10 text-risk-500" />
                            <p className="flex-1 text-sm text-ink-700">This service is not available for your selected <strong>Industry</strong> context. We cannot accept this request under our professional boundaries and risk policy.</p>
                            <Chip tone="red">Code: {block.blockCode}</Chip>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Box title="Requested Service (SKU)">
                                <p className="font-semibold">{block.title}</p>
                                <p className="text-xs text-ink-500">SKU: {block.code} <Chip tone="red" className="ml-1">Blocked</Chip></p>
                            </Box>
                            <Box title="Your Industry Context">
                                <p className="text-xs">Industry: <strong>{ind.name}</strong></p>
                                <p className="text-xs">Sub-Industry: <strong>{context.subIndustryName ?? '—'}</strong></p>
                                <p className="text-xs">Country: <strong>{context.countryName}</strong></p>
                            </Box>
                            <Box title="Why This Service Is Not Available">
                                <p className="font-semibold text-risk-700">{block.reason}</p>
                                <p className="mt-1 text-xs text-ink-600">{block.detail}</p>
                            </Box>
                            <Box title="Applicable Rules & References">
                                <ul className="space-y-1 text-xs">{block.rules.map((r) => <li key={r} className="flex gap-1.5"><FileText className="size-3.5 shrink-0" />{r}</li>)}</ul>
                            </Box>
                        </div>
                        <h3 className="font-semibold">What You Can Do Instead</h3>
                        <p className="text-xs text-ink-500">We can help you access this service through verified professional routes.</p>
                        <div className="grid gap-3 md:grid-cols-3">
                            {[
                                [Users, '1. Use Our Partner Route', 'We will connect you with a verified firm for a formal engagement.', 'Find Partners', `/industries/${ind.slug}/partners`],
                                [FileText, '2. Get a Readiness Diagnostic', 'Assess your readiness and get prepared with our diagnostic.', 'View Diagnostic', `/industries/${ind.slug}/diagnostic`],
                                [Phone, '3. Speak to a TBCA Advisor', 'Discuss your needs and the best professional route for your context.', 'Book Advisor Call', '/contact?topic=industries'],
                            ].map(([I, t, s, cta, href]) => {
                                const Icon = I as typeof Users;
                                return (
                                    <div key={t as string} className="rounded-[8px] border border-parchment-400 p-3">
                                        <p className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-5 text-verified-700" />{t as string}</p>
                                        <p className="mt-1 text-xs text-ink-500">{s as string}</p>
                                        <Link href={href as string} className="mt-2 block rounded border border-verified-500/40 py-1.5 text-center text-xs font-semibold text-verified-700">{cta as string} →</Link>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-col gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 sm:flex-row sm:items-center">
                            <Info className="size-5 text-controlled-700" />
                            <p className="flex-1 text-xs"><strong>Transparency is our commitment.</strong> We will never offer or disguise a reserved service. Your protection. Our professional integrity.</p>
                            <Link href="/resources/limitations" className="rounded border border-controlled-500/40 bg-white px-3 py-1.5 text-xs font-semibold">Learn More About Our Boundaries →</Link>
                        </div>
                    </div>
                )}
            </Modal>

            {/* IN-SCR-014 Sector Limitation Statement */}
            <Modal open={stage === 'limitation' && !!sku.limitation} onClose={() => setStage('none')} title="Sector Limitation Statement" size="xl">
                {sku.limitation && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <p className="max-w-lg text-xs text-ink-600">This statement clarifies the scope, boundaries and exclusions that apply to this diagnostic and any outputs delivered. It is visible at all times to protect you and to preserve professional integrity.</p>
                            <div className="rounded border border-parchment-400 p-2 text-[0.6875rem]"><strong>Statement ID: {sku.limitation.id}</strong><br />Version: {sku.limitation.version} · Effective: {sku.limitation.effective}</div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div><h3 className="border-b border-gold-400 pb-1 text-sm font-semibold">Scope of This Diagnostic</h3><p className="mt-2 text-[0.6875rem] text-ink-600">{sku.limitation.scope}</p><CheckList className="mt-2 text-xs" items={sku.limitation.scopeItems} /></div>
                            <div><h3 className="border-b border-gold-400 pb-1 text-sm font-semibold">Key Limitations</h3><CheckList className="mt-2 text-xs" tone="amber" items={sku.limitation.limitations} /></div>
                            <div><h3 className="border-b border-gold-400 pb-1 text-sm font-semibold">Out of Scope</h3><CheckList className="mt-2 text-xs" tone="red" items={sku.limitation.outOfScope} /></div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <Box title="Professional Boundaries"><p className="text-xs text-ink-600">Where specialist professional services are required (e.g., legal opinions, technical certifications, lab testing, valuation, tax structuring), we will connect you to verified professionals.</p><Link href={`/industries/${ind.slug}/partners`} className="mt-2 inline-block text-xs font-semibold text-gold-700">View Professional Routes →</Link></Box>
                            <Box title="Your Acknowledgement">
                                <label className="flex items-start gap-2 text-xs">
                                    <input type="checkbox" className="mt-0.5 accent-gold-600" checked={form.data.acknowledge_limitation} onChange={(e) => form.setData('acknowledge_limitation', e.target.checked)} />
                                    I have read and understood the scope, limitations and exclusions that apply to this diagnostic and its outputs. I acknowledge and accept the terms above.
                                </label>
                                <button type="button" disabled={!form.data.acknowledge_limitation} onClick={afterLimitation} className="mt-3 w-full rounded-[4px] bg-gold-500 py-2 text-xs font-bold disabled:bg-parchment-300 disabled:text-ink-400">
                                    {form.data.acknowledge_limitation ? 'Continue' : 'Required to Continue'}
                                </button>
                            </Box>
                            <Box title="Questions About Scope?"><p className="text-xs text-ink-600">Speak to a TBCA Advisor to understand what this diagnostic can and cannot do for your business.</p><Link href="/contact?topic=industries" className="mt-2 inline-block text-xs font-semibold text-gold-700">Book Advisor Call →</Link></Box>
                        </div>
                        <p className="flex items-center gap-2 rounded bg-controlled-50 p-2.5 text-xs text-controlled-700"><ShieldCheck className="size-4" /> Transparency is our commitment. We operate within clear boundaries to protect you, our professionals and the integrity of the ecosystem.</p>
                    </div>
                )}
            </Modal>

            {/* IN-SCR-013 Mandatory Add-On Disclosure */}
            <Modal open={stage === 'addons'} onClose={() => setStage('none')} title="Mandatory Add-On Disclosure" size="xl"
                footer={
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <a href={`/industries/${ind.slug}/services/${sku.slug}/disclosure`} className="flex items-center gap-1.5 rounded border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-800"><Download className="size-4" /> Download Full Disclosure (PDF)</a>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setStage('none')} className="rounded border border-parchment-500 px-4 py-2 text-xs font-semibold">Back to Product</button>
                            <button type="button" disabled={!form.data.acknowledge_addons || form.processing} onClick={commit} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold disabled:opacity-50">Continue to Add-ons →</button>
                        </div>
                    </div>
                }>
                <p className="text-sm text-ink-700">To deliver this diagnostic lawfully and with professional integrity, the following add-on components are mandatory for your selected industry context.</p>
                <div className="mt-3 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs"><strong>Why add-ons are mandatory</strong><br />These components are required by law, regulation or professional standards to ensure accuracy, compliance and defensibility of the outputs delivered to you.</div>
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="text-ink-500"><tr><th className="py-2">Component</th><th>Purpose</th><th>Ledger</th><th>Est. Fee (Ex VAT)</th><th>Status</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {sku.addOns.map((a) => (
                                <tr key={a.component}>
                                    <td className="py-2 pr-2"><strong>{a.component}</strong><span className="block text-ink-500">{a.detail}</span></td>
                                    <td className="pr-2">{a.purpose}</td>
                                    <td><span className="rounded-full border px-1.5 font-bold">{a.ledger}</span> {LEDGER[a.ledger]}</td>
                                    <td className="font-semibold">{a.fee ? zar(a.fee) : 'Varies'}</td>
                                    <td><Chip tone="red"><AlertCircle className="size-3" /> Required</Chip></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 grid gap-3 rounded-[8px] border border-parchment-400 bg-parchment-100 p-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3"><Calculator className="size-8 text-ink-600" /><div><p className="text-xs text-ink-500">Estimated additional cost (Ex VAT)</p><p className="text-xl font-bold">{zar(sku.addOnTotal)}{sku.hasVariableAddOn ? '+' : ''}</p><p className="text-[0.6875rem] text-ink-500">In addition to the base price of {zar(sku.priceZar)}</p></div></div>
                    <p className="flex gap-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" />Exact fees will be confirmed after scoping. You will see all costs before you commit.</p>
                </div>
                <label className="mt-3 flex items-start gap-2 text-xs">
                    <input type="checkbox" className="mt-0.5 accent-gold-600" checked={form.data.acknowledge_addons} onChange={(e) => form.setData('acknowledge_addons', e.target.checked)} />
                    I acknowledge that the above add-ons are mandatory for this diagnostic and required for lawful, professional and defensible delivery of the outputs.
                </label>
                <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-500"><Lock className="size-3.5" /> No commitment is made until you confirm and pay.</p>
            </Modal>
        </IndustryFrame>
    );
}
