import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, BookmarkCheck, Calculator, CircleCheck, Download, Eye, FileSpreadsheet, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { formatCalc, formatCell, NeedMoreBand, ProductThumb, ToolsHero, ToolsTrustStrip } from '@/Components/CorePages/ToolsParts';
import { LineChart } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { CalcInput, CalcResult, LicenceOption, ToolProduct } from '@/types/core-pages';

interface Props {
    product: ToolProduct;
    typeLabel: string;
    calculator: { inputs: CalcInput[]; values: Record<string, number>; result: CalcResult } | null;
    licences: LicenceOption[];
    related: ToolProduct[];
    isSaved: boolean;
    owned: string | null;
}

export default function Product({ product, typeLabel, calculator, licences, related, isSaved, owned }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const price = usePrice();
    const [licence, setLicence] = useState('single');
    const [values, setValues] = useState<Record<string, number>>(calculator?.values ?? {});
    const [showAll, setShowAll] = useState(false);
    const [busy, setBusy] = useState(false);
    const base = `/tools/${product.type}/${product.slug}`;
    const chosen = licences.find((l) => l.key === licence) ?? licences[0];
    const r = calculator?.result;
    const rows = r?.table?.rows ?? [];

    const calculate = () => {
        setBusy(true);
        router.get(base, values, { preserveState: true, preserveScroll: true, replace: true, only: ['calculator'], onFinish: () => setBusy(false) });
    };
    const reset = () => {
        const d = Object.fromEntries((calculator?.inputs ?? []).map((i) => [i.key, i.default]));
        setValues(d);
        router.get(base, {}, { preserveState: true, preserveScroll: true, replace: true, only: ['calculator'] });
    };
    const save = () => router.post('/saved', { item_type: 'tool', item_key: product.slug, label: product.title, url: base }, { preserveScroll: true });

    return (
        <>
            <Head title={product.title} />
            <ToolsHero
                title={product.title}
                lead={product.body}
                body={product.calculator ? `A practical, human-designed financial calculator. ${product.body} Optimised for SMEs, business owners and financial advisors.` : `${product.body} Built for ${product.audience.toLowerCase()}.`}
                crumbs={[{ label: 'Digital Products', href: '/tools' }, { label: 'Tools, Templates & Calculators', href: '/tools' }, { label: `${typeLabel}s`, href: `/tools/${product.type}` }, { label: product.title }]}
                aside={r && r.summary.length > 0 ? (
                    <div className="rounded-[8px] border border-gold-700/50 bg-ink-900/80 p-4">
                        <p className="text-[0.6875rem] font-semibold tracking-wide text-gold-400 uppercase">Live Summary</p>
                        <dl className="mt-2 space-y-1.5 text-[0.8125rem]">
                            {r.summary.map((s) => <div key={s.label} className="flex justify-between gap-3"><dt className="text-ink-300">{s.label}</dt><dd className="font-semibold">{formatCalc(s)}</dd></div>)}
                        </dl>
                    </div>
                ) : undefined}
            >
                <ul className="mt-4 flex flex-wrap gap-2 text-[0.6875rem]">
                    {[typeLabel, 'Human-Reviewed', 'Version-Controlled', 'Secure', 'Accurate', ...(product.languages.includes('AF') ? ['Afrikaans Available'] : [])].map((c) => <li key={c} className="rounded-[4px] border border-gold-700/60 px-2 py-1 text-parchment-200">{c}</li>)}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                    {owned ? (
                        <Link href={`/tools/downloads/${owned}`} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900"><Download className="size-4" aria-hidden="true" />Download (owned)</Link>
                    ) : (
                        <Link href={`${base}/checkout?licence=${licence}`} className="inline-flex h-11 items-center rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">Buy / Download</Link>
                    )}
                    <a href="#preview" className="inline-flex h-11 items-center rounded-[4px] border border-parchment-200/40 px-5 text-sm text-parchment-100">Preview Sample</a>
                    <Link href={`${base}/checkout?licence=annual`} className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border border-parchment-200/40 px-5 text-sm text-parchment-100"><Zap className="size-4" aria-hidden="true" />Pay per Use</Link>
                </div>
                <Link href={`/tools/${product.type}`} className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400">View Related {typeLabel}s <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
            </ToolsHero>
            <ToolsTrustStrip />

            <div className="bg-parchment-200">
                <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                    <div className="space-y-5 xl:col-span-9">
                        <section className="grid gap-5 rounded-[10px] border border-parchment-400 bg-white p-5 md:grid-cols-[12rem_1fr]">
                            <ProductThumb title={product.title} type={product.formats[0] === 'Excel' ? 'XLSX' : product.formats[0]} className="w-full" />
                            <div>
                                <h2 className="text-[1.25rem] font-bold text-ink-900">{product.title}</h2>
                                <p className="mt-1 text-[0.875rem] text-ink-600">{product.body}</p>
                                <div className="mt-4 grid gap-5 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-[0.875rem] font-bold text-ink-900">Key Benefits</h3>
                                        <ul className="mt-2 space-y-1.5 text-[0.8125rem] text-ink-700">
                                            {['Scenario modelling with your own inputs', 'Clear summary and visual outputs', 'Human-reviewed formulas and structure', 'Export clean schedules for management and lenders', 'Version-controlled updates'].map((b) => <li key={b} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{b}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-[0.875rem] font-bold text-ink-900">What&rsquo;s Included</h3>
                                        <ul className="mt-2 space-y-1.5 text-[0.8125rem] text-ink-700">
                                            {(product.calculator ? ['8-sheet Excel calculator', 'Scenario comparison dashboard', 'Summary dashboard sheet', 'Instruction / usage guide', 'Printable schedule format'] : [`${product.formats.join(' + ')} files`, 'Instruction / usage guide', 'Editable sections', 'Examples and prompts']).map((b) => <li key={b} className="flex gap-2"><FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{b}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {calculator && r && (
                            <section id="preview" className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                <h2 className="flex items-center gap-2 text-[1rem] font-bold text-ink-900"><Calculator className="size-5 text-gold-600" aria-hidden="true" />Calculator Preview</h2>
                                <p className="text-[0.75rem] text-ink-500">Change the inputs and press Calculate — results are computed on the server with the same formulas as the download.</p>
                                <form
                                    className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        calculate();
                                    }}
                                >
                                    {calculator.inputs.map((i) => (
                                        <label key={i.key} className="text-[0.75rem] font-medium text-ink-700">
                                            {i.label}
                                            <input type="number" step={i.step} value={values[i.key] ?? ''} onChange={(e) => setValues({ ...values, [i.key]: Number(e.target.value) })} onBlur={calculate} className="mt-1 h-9 w-full rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" />
                                        </label>
                                    ))}
                                    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                                        <button type="submit" disabled={busy} className="inline-flex h-9 items-center rounded-[4px] bg-ink-900 px-4 text-[0.8125rem] font-semibold text-gold-400">{busy ? 'Calculating…' : 'Calculate'}</button>
                                        <button type="button" onClick={reset} className="inline-flex h-9 items-center rounded-[4px] border border-parchment-500 px-4 text-[0.8125rem]">Reset to defaults</button>
                                    </div>
                                </form>
                                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
                                    {r.summary.map((s) => (
                                        <li key={s.label} className="rounded-[6px] border border-parchment-400 bg-parchment-100 p-3">
                                            <p className="text-[0.6875rem] text-ink-500">{s.label}</p>
                                            <p className="mt-0.5 text-[1rem] font-bold text-ink-900">{formatCalc(s)}</p>
                                        </li>
                                    ))}
                                </ul>
                                {r.notes?.map((n) => <p key={n} className="mt-2 text-[0.75rem] text-attested-700">{n}</p>)}
                                <div className="mt-4 grid gap-5 lg:grid-cols-5">
                                    {r.table && (
                                        <div className={cn('overflow-x-auto', r.chart ? 'lg:col-span-3' : 'lg:col-span-5')}>
                                            <table className="w-full min-w-[480px] text-right text-[0.75rem]">
                                                <thead className="bg-parchment-200 text-ink-600"><tr>{r.table.columns.map((c, i) => <th key={c} className={cn('px-2 py-1.5', i === 0 && 'text-left')}>{c}</th>)}</tr></thead>
                                                <tbody className="divide-y divide-parchment-300">
                                                    {(showAll ? rows : rows.slice(0, 12)).map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j} className={cn('px-2 py-1', j === 0 && 'text-left')}>{formatCell(c)}</td>)}</tr>)}
                                                </tbody>
                                            </table>
                                            {rows.length > 12 && <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 text-[0.75rem] font-semibold text-gold-700">{showAll ? 'Show first 12 rows' : `Show all ${rows.length} rows`}</button>}
                                        </div>
                                    )}
                                    {r.chart && <LineChart points={r.chart} label={r.chart_label ?? ''} className={r.table ? 'lg:col-span-2' : 'lg:col-span-5'} />}
                                </div>
                            </section>
                        )}

                        <section className="grid gap-5 rounded-[10px] border border-parchment-400 bg-white p-5 md:grid-cols-2">
                            <div>
                                <h2 className="text-[1rem] font-bold text-ink-900">Specifications</h2>
                                <dl className="mt-2 divide-y divide-parchment-300 text-[0.8125rem]">
                                    {[['Product Type', typeLabel], ['Format', product.formats.join(', ')], ['Language', product.languages.map((l) => (l === 'AF' ? 'Afrikaans' : 'English')).join(', ')], ['Calculation Engine', product.calculator ? 'Excel Formulas' : 'Not applicable'], ['Version Status', `v${product.version} Human-Reviewed`], ['Updates', 'Version Controlled'], ['Compatibility', product.formats.includes('Excel') ? 'MS Excel, LibreOffice, Google Sheets' : 'Standard office software'], ['Audience', product.audience]].map(([k, v]) => (
                                        <div key={k} className="flex justify-between gap-3 py-1.5"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>
                                    ))}
                                </dl>
                            </div>
                            <div>
                                <h2 className="text-[1rem] font-bold text-ink-900">Related {typeLabel}s</h2>
                                <ul className="mt-2 grid grid-cols-2 gap-3">
                                    {related.map((p) => (
                                        <li key={p.slug}>
                                            <Link href={`/tools/${p.type}/${p.slug}`} className="block rounded-[6px] border border-parchment-400 p-2 hover:border-gold-400">
                                                <ProductThumb title={p.title} type={typeLabel} />
                                                <p className="mt-1 text-[0.75rem] font-semibold text-ink-900">{p.title}</p>
                                                <p className="text-[0.6875rem] text-gold-700">View Preview →</p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 xl:col-span-3">
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[1rem] font-bold text-ink-900">{product.title}</h2>
                            <p className="mt-2 text-[0.8125rem] font-semibold text-gold-700">Price Options <span className="font-normal text-ink-500">(All in ZAR)</span></p>
                            <div role="radiogroup" aria-label="Price options" className="mt-2 space-y-1.5">
                                {licences.map((l) => (
                                    <label key={l.key} className={cn('flex cursor-pointer items-center justify-between gap-2 rounded-[4px] border px-2.5 py-2 text-[0.8125rem]', licence === l.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                        <span className="flex items-center gap-2"><input type="radio" name="licence" value={l.key} checked={licence === l.key} onChange={() => setLicence(l.key)} className="accent-gold-600" />{l.label}</span>
                                        <strong>{price(l.zar)}</strong>
                                    </label>
                                ))}
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-verified-700"><CircleCheck className="size-3.5" aria-hidden="true" />Human Reviewed</p>
                            <Link href={`${base}/checkout?licence=${licence}`} className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Buy / Download · {price(chosen.zar)}</Link>
                            {auth.user ? (
                                <button type="button" onClick={save} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 text-[0.8125rem]">{isSaved ? <><BookmarkCheck className="size-4 text-gold-600" aria-hidden="true" />Saved</> : <><Bookmark className="size-4" aria-hidden="true" />Add to Saved Items</>}</button>
                            ) : (
                                <Link href="/login" className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 text-[0.8125rem]"><Bookmark className="size-4" aria-hidden="true" />Sign in to Save</Link>
                            )}
                            <a href="#preview" className="mt-2 inline-flex w-full items-center justify-center gap-1 text-[0.75rem] text-ink-600"><Eye className="size-3.5" aria-hidden="true" />Preview the calculator first</a>
                        </section>
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.9375rem] font-bold text-ink-900">Need Implementation Support?</h2>
                            <p className="mt-1 text-[0.75rem] text-ink-600">TBCA can pair this {typeLabel.toLowerCase()} with a practical playbook to help you implement it effectively.</p>
                            <Link href="/shop" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900">Start a Sprint</Link>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${product.title}`, section: 'tools' })} className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-parchment-500 text-[0.8125rem]">Ask a Question</button>
                        </section>
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Trusted Credentials</h2>
                            <ul className="mt-2 grid grid-cols-2 gap-2 text-center text-[0.6875rem]">
                                {['100% Secure', 'Expert Approved', 'POPIA Aligned', 'Bank-Grade Security'].map((c) => <li key={c} className="rounded-[4px] border border-parchment-400 p-2"><ShieldCheck className="mx-auto size-5 text-gold-600" aria-hidden="true" />{c}</li>)}
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
            <NeedMoreBand />
        </>
    );
}
