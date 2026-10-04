import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronRight, CircleCheck, Download, FileSpreadsheet, FolderDown, Languages, Lock, MessageCircle, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { ProductThumb } from '@/Components/CorePages/ToolsParts';
import { openAskQuestion } from '@/Components/AskQuestion';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { formatZar } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { Entitlement } from '@/types/core-pages';

interface Props {
    entitlement: Entitlement;
    complete: boolean;
}

export default function SecureDownload({ entitlement: e, complete }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const fileUrl = `/tools/downloads/${e.token}/file`;

    const download = () => {
        const frame = document.createElement('iframe');
        frame.style.display = 'none';
        frame.src = fileUrl;
        document.body.appendChild(frame);
        window.setTimeout(() => frame.remove(), 60000);
        if (!complete) router.visit(`/tools/downloads/${e.token}/success`);
    };

    const facts: [typeof Tag, string, string][] = [[Tag, 'Type', e.type_label], [FileSpreadsheet, 'Format', e.format === 'XLSX' ? 'Excel (XLSX)' : e.format], [Lock, 'Licence', e.licence], [Languages, 'Language', e.languages], [FolderDown, 'File Size', e.size], [Tag, 'Version', e.version]];

    return (
        <div className="bg-parchment-200">
            <Head title={complete ? 'Download Complete' : 'Secure Download'} />
            <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    {complete ? (
                        <div className="flex items-start gap-4">
                            <CircleCheck className="size-16 shrink-0 fill-verified-500 text-white" aria-hidden="true" />
                            <div>
                                <h1 className="font-serif text-[2rem] font-semibold text-ink-900">Download Complete!</h1>
                                <p className="font-serif text-[1.125rem] text-verified-700">Your file has been downloaded securely.</p>
                                <p className="mt-1 text-[0.875rem] text-ink-600">Thank you for your purchase. If the download didn&rsquo;t start, click the button again below.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Digital Products', href: '/tools' }, { label: 'My Downloads', href: auth.user ? '/tools/my-downloads' : undefined }, { label: 'Secure Download' }]} />
                            <h1 className="font-serif text-[2rem] font-semibold text-ink-900">Secure Download</h1>
                            <p className="mt-2 flex gap-3 text-[0.875rem] text-ink-700"><ShieldCheck className="size-8 shrink-0 text-gold-600" aria-hidden="true" />Your download is protected and ready. Please review the details below and click Download Now to access your file.</p>
                        </>
                    )}

                    <section className="mt-5 grid gap-5 rounded-[10px] border border-parchment-400 bg-white p-5 md:grid-cols-[16rem_1fr]">
                        <ProductThumb title={e.name} type={e.format} className="w-full" />
                        <div>
                            <h2 className="text-[1.25rem] font-bold text-ink-900">{e.name}</h2>
                            <dl className="mt-3 grid gap-3 text-[0.8125rem] sm:grid-cols-3">
                                {facts.map(([I, k, v]) => <div key={k} className="flex gap-2"><I className="size-4 shrink-0 text-ink-500" aria-hidden="true" /><span><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></span></div>)}
                            </dl>
                            <p className="mt-3 flex gap-4 text-[0.75rem]"><span className="inline-flex items-center gap-1"><CircleCheck className="size-3.5 text-verified-500" aria-hidden="true" />Human Reviewed</span><span className="inline-flex items-center gap-1"><CircleCheck className="size-3.5 text-verified-500" aria-hidden="true" />Version Controlled</span></p>
                            {e.expired ? (
                                <p className="mt-3 rounded-[6px] border border-risk-500/30 bg-risk-50 p-3 text-[0.8125rem] text-risk-700">This download link expired on {e.expires}. {auth.user ? 'Re-issue it from My Downloads.' : 'Sign in to re-issue it.'}</p>
                            ) : complete ? (
                                <p className="mt-3 flex gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-[0.8125rem] text-verified-700"><ShieldCheck className="size-5 shrink-0" aria-hidden="true" />This download link is unique to you{e.last_downloaded ? ` and was accessed on ${e.last_downloaded}` : ''}. For your security, this link will expire on {e.expires}.</p>
                            ) : (
                                <p className="mt-3 flex gap-2 rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-[0.8125rem] text-ink-700"><Lock className="size-5 shrink-0 text-gold-600" aria-hidden="true" />This download link is unique to you and expires on {e.expires}. For your security, please do not share this link.</p>
                            )}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <button type="button" disabled={e.expired} onClick={download} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 disabled:opacity-50"><Download className="size-4" aria-hidden="true" />{complete ? 'Download Again' : 'Download Now'}</button>
                                {complete && auth.user ? (
                                    <Link href="/tools/my-downloads" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-ink-300 text-sm">Go to My Downloads</Link>
                                ) : auth.user ? (
                                    <button type="button" onClick={() => router.post(`/tools/downloads/${e.token}/claim`)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-ink-900 text-sm font-semibold text-gold-400"><FolderDown className="size-4" aria-hidden="true" />Save to My Downloads</button>
                                ) : (
                                    <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-ink-900 text-sm font-semibold text-gold-400"><FolderDown className="size-4" aria-hidden="true" />Sign in to Save to My Downloads</Link>
                                )}
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-ink-500"><ShieldCheck className="size-3.5" aria-hidden="true" />256-bit SSL encrypted download · Downloaded {e.downloads} time{e.downloads === 1 ? '' : 's'}</p>
                        </div>
                    </section>
                    <ul className="mt-5 grid gap-3 rounded-[8px] bg-ink-950 p-4 text-[0.75rem] text-parchment-200 sm:grid-cols-4">
                        <li>Secured by industry-standard encryption</li><li>PCI DSS Compliant</li><li>256-bit SSL Encryption</li><li>Your data is safe with us</li>
                    </ul>
                </div>

                <aside className="space-y-4 xl:col-span-4">
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.125rem] font-semibold text-ink-900">{complete ? 'Download Details' : 'Download Information'}</h2>
                        <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-verified-700"><CircleCheck className="size-4" aria-hidden="true" />Payment Confirmed</p>
                        <dl className="mt-2 divide-y divide-parchment-300 text-[0.8125rem]">
                            {[['Order Number', e.order_reference ?? '—'], ['Purchase Date', e.purchase_date], ['Payment Reference', e.payment_reference], ['Amount Paid', `${formatZar(e.amount)} ZAR`], ['Payment Method', e.method]].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 py-1.5"><dt className="text-ink-500">{k}</dt><dd className="text-right font-semibold text-ink-900">{v}</dd></div>
                            ))}
                        </dl>
                    </section>
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.125rem] font-semibold text-ink-900">{complete ? 'What’s Next?' : 'Need Help?'}</h2>
                        <ul className="mt-2 divide-y divide-parchment-300">
                            {complete && auth.user && <HelpRow href="/tools/my-downloads" icon={<FolderDown className="size-5" />} title="Go to My Downloads" sub="View all your purchased products" />}
                            <HelpRow href={e.product_href} icon={<BookOpen className="size-5" />} title={`How to use this ${e.type_label.toLowerCase()}`} sub="View user guide" />
                            <li><button type="button" onClick={() => openAskQuestion({ subject: `Help with ${e.name}`, section: 'tools' })} className="flex w-full items-center gap-3 py-2.5 text-left"><Sparkles className="size-5" aria-hidden="true" /><span className="flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">Ask AI Guidance</span><span className="text-[0.75rem] text-ink-500">Get instant answers</span></span><ChevronRight className="size-4" aria-hidden="true" /></button></li>
                            <li><a href="https://wa.me/27608916365" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2.5"><MessageCircle className="size-5" aria-hidden="true" /><span className="flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">WhatsApp Support</span><span className="text-[0.75rem] text-ink-500">Chat with our team</span></span><ChevronRight className="size-4" aria-hidden="true" /></a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function HelpRow({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
    return (
        <li>
            <Link href={href} className="flex items-center gap-3 py-2.5"><span aria-hidden="true">{icon}</span><span className="flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">{title}</span><span className="text-[0.75rem] text-ink-500">{sub}</span></span><ChevronRight className="size-4" aria-hidden="true" /></Link>
        </li>
    );
}
