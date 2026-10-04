import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CircleCheck, Download, ExternalLink, FileText, Lock, MessageCircle, Receipt, RotateCw, Search, ShieldCheck, Sparkles, UserRound, Zap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ProductThumb } from '@/Components/CorePages/ToolsParts';
import { openAskQuestion } from '@/Components/AskQuestion';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { Entitlement } from '@/types/core-pages';

interface FileRow { item: string; type: string; format: string; added: string; size: string; status: string; href: string }

interface Props {
    featured: Entitlement | null;
    files: FileRow[];
    stats: { total: number; ready: number; recent: { date: string; name: string } | null; downloaded: number };
    filters: { tab: string; search: string };
}

const TABS = [['all', 'All Downloads'], ['calculators', 'Calculators'], ['documents', 'Documents'], ['recent', 'Recently Added']];

export default function Downloads({ featured: e, files, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const go = (n: Partial<Props['filters']>) => router.get('/tools/my-downloads', { ...filters, ...n }, { preserveState: true, preserveScroll: true, replace: true });
    const doSearch = (ev: FormEvent) => {
        ev.preventDefault();
        go({ search });
    };

    return (
        <div className="bg-parchment-200">
            <Head title="My Downloads" />
            <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Digital Products', href: '/tools' }, { label: 'My Downloads' }]} />
                    <h1 className="font-serif text-[2rem] font-semibold text-ink-900">My Downloads</h1>
                    <p className="text-[0.875rem] text-ink-600">Access your purchased files, templates, calculators and supporting documents securely.</p>

                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[[Download, 'Total Downloads', stats.total, 'All files available'], [CircleCheck, 'Ready Now', stats.ready, 'Available to download'], [Lock, 'Secure Access', '100%', 'Encrypted & protected'], [CalendarDays, 'Recent Purchase', stats.recent?.date ?? '—', stats.recent?.name ?? 'No purchases yet']].map(([I, l, v, s]) => {
                            const Ico = I as typeof Download;
                            return (
                                <li key={l as string} className="flex items-center gap-3 rounded-[8px] bg-ink-950 p-4 text-parchment-200">
                                    <Ico className="size-9 shrink-0 text-gold-500" aria-hidden="true" />
                                    <span><span className="block text-[0.75rem]">{l as string}</span><span className="block text-[1.25rem] font-bold text-parchment-100">{v as string}</span><span className="block text-[0.6875rem] text-ink-300">{s as string}</span></span>
                                </li>
                            );
                        })}
                    </ul>

                    <section className="mt-4 rounded-[10px] border border-parchment-400 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-300 pb-2">
                            <div role="tablist" aria-label="Download filters" className="flex gap-1 overflow-x-auto">
                                {TABS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={filters.tab === k} onClick={() => go({ tab: k })} className={cn('shrink-0 border-b-2 px-3 py-1.5 text-[0.8125rem]', filters.tab === k ? 'border-gold-500 font-semibold text-ink-900' : 'border-transparent text-ink-500')}>{l}</button>)}
                            </div>
                            <form onSubmit={doSearch} className="relative">
                                <label htmlFor="dl-search" className="sr-only">Search my downloads</label>
                                <input id="dl-search" value={search} onChange={(ev) => setSearch(ev.target.value)} placeholder="Search my downloads..." className="h-9 w-60 rounded-[4px] border border-parchment-500 pr-8 pl-2 text-[0.8125rem]" />
                                <button type="submit" aria-label="Search" className="absolute top-2.5 right-2"><Search className="size-4 text-ink-400" /></button>
                            </form>
                        </div>

                        {e ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-[9rem_1fr_12rem]">
                                <ProductThumb title={e.name} type={e.format} />
                                <div>
                                    <h2 className="flex flex-wrap items-center gap-2 font-serif text-[1.25rem] font-semibold text-ink-900">{e.name}<StatusPill status={e.expired ? 'Link expired' : 'Ready to Download'} tone={e.expired ? 'warn' : 'good'} /></h2>
                                    <dl className="mt-3 grid gap-3 text-[0.75rem] sm:grid-cols-4">
                                        {[['Product Type', e.type_label], ['Format', e.format], ['Language', e.language], ['Access', 'Secure Client Portal'], ['Added On', e.added], ['Order', e.order_reference], ['License', e.licence], ['File Size', e.size]].map(([k, v]) => (
                                            <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>
                                        ))}
                                    </dl>
                                    <p className="mt-3 flex gap-2 text-[0.6875rem]"><span className="rounded-[3px] bg-ink-900 px-2 py-0.5 text-parchment-100">v{e.version} | Version Controlled</span><span className="rounded-[3px] bg-gold-100 px-2 py-0.5 text-gold-800">Human Reviewed</span></p>
                                </div>
                                <div className="flex flex-col gap-2 text-[0.8125rem]">
                                    <Link href={`/tools/downloads/${e.token}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 font-semibold text-ink-900"><Download className="size-4" aria-hidden="true" />Download Now</Link>
                                    <Link href={e.product_href} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500">View Product <ExternalLink className="size-3.5" aria-hidden="true" /></Link>
                                    {e.order_reference && <Link href={`/checkout/${e.order_reference}/confirmation`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500">View Invoice <FileText className="size-3.5" aria-hidden="true" /></Link>}
                                    {e.order_reference && <Link href={`/checkout/${e.order_reference}/confirmation`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500">Receipt <Receipt className="size-3.5" aria-hidden="true" /></Link>}
                                    <button type="button" onClick={() => router.post(`/tools/downloads/${e.token}/claim`)} className="inline-flex items-center justify-center gap-1.5 text-ink-600"><RotateCw className="size-3.5" aria-hidden="true" />Re-issue link (7 days)</button>
                                </div>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-ink-500">You have no downloads yet. <Link href="/tools" className="font-semibold text-gold-700">Browse tools, templates and calculators</Link></p>
                        )}
                    </section>

                    <section className="mt-4 rounded-[10px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Recent Downloads</h2>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                <thead className="text-[0.6875rem] text-ink-500 uppercase"><tr>{['Item', 'Type', 'Format', 'Added On', 'Size', 'Status', 'Action'].map((h) => <th key={h} className="px-2 py-1.5">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {files.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-ink-400">No files match.</td></tr>}
                                    {files.map((f, i) => (
                                        <tr key={`${f.item}${i}`}>
                                            <td className="px-2 py-2 font-medium text-ink-900">{f.item}</td>
                                            <td className="px-2 py-2">{f.type}</td>
                                            <td className="px-2 py-2">{f.format}</td>
                                            <td className="px-2 py-2">{f.added}</td>
                                            <td className="px-2 py-2">{f.size}</td>
                                            <td className="px-2 py-2"><StatusPill status={f.status} tone={f.status === 'Ready' ? 'good' : 'warn'} /></td>
                                            <td className="px-2 py-2"><Link href={f.href} className="inline-flex items-center gap-1 font-semibold"><Download className="size-3.5" aria-hidden="true" />Download</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-[0.75rem] text-ink-500">Showing {files.length ? 1 : 0} to {files.length} of {files.length} items</p>
                    </section>
                </div>

                <aside className="space-y-4 xl:col-span-3">
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Download Help</h2>
                        <p className="mt-1 text-[0.75rem] text-ink-600">Your downloads are securely available in this client portal anytime. You can download files as many times as you need or re-download if updated.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Help with my downloads', section: 'tools' })} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900"><Sparkles className="size-4" aria-hidden="true" />Ask AI Guidance</button>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Speak to a human about my downloads', section: 'tools' })} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 text-[0.8125rem] font-semibold text-gold-400"><UserRound className="size-4" aria-hidden="true" />Ask a Human</button>
                        <a href="https://wa.me/27608916365" target="_blank" rel="noreferrer" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 text-[0.8125rem]"><MessageCircle className="size-4 text-verified-500" aria-hidden="true" />Chat on WhatsApp</a>
                    </section>
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Need More Than a Download?</h2>
                        <p className="mt-1 text-[0.75rem] text-ink-600">Turn your insights into action with expert support. Our AI Agents and Specialists are ready to help you implement, automate and scale.</p>
                        <Link href="/shop" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900"><Zap className="size-4" aria-hidden="true" />Start a Sprint</Link>
                    </section>
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Trusted Controls</h2>
                        <ul className="mt-2 grid grid-cols-2 gap-2 text-[0.75rem]">
                            {['ISO 27001 Aligned', 'POPIA Compliant', 'Secure Downloads', 'Bank-Grade Security'].map((c) => <li key={c} className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-gold-600" aria-hidden="true" />{c}</li>)}
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}
