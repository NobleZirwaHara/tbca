import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, CalendarDays, CircleCheck, Clock, Eye, Headset, Lock, Mail, MessageCircle, Phone, PlusCircle, Rocket, ShieldCheck, Tag } from 'lucide-react';
import { ASSIST_STEPS, FinderHeader } from '@/Components/CorePages/FinderParts';
import { NumberedList } from '@/Components/CorePages/Kit';
import type { FinderShared } from '@/types/core-pages';

interface Props extends FinderShared {
    request: { reference: string; submitted_on: string; help_with: string; item: string; assistance_type: string; urgency: string; preferred_time?: string; contact_channel: string };
}

export default function Submitted({ request: r, summary }: Props) {
    const tiles: [typeof Tag, string, string][] = [
        [Bookmark, 'Request Reference', r.reference], [Tag, 'Service Route', summary.need ?? r.help_with], [Rocket, 'Requested Item', r.item], [MessageCircle, 'Request Type', r.assistance_type.replace('I need ', '')],
        [MessageCircle, 'Preferred Contact Channel', r.contact_channel], [Clock, 'Preferred Time', r.preferred_time ?? 'Any time'], [Clock, 'Urgency', r.urgency], [CalendarDays, 'Submitted On', r.submitted_on],
    ];

    return (
        <div className="bg-parchment-200">
            <Head title="Request Submitted Successfully" />
            <FinderHeader
                title="Request Submitted Successfully"
                subtitle="Your human assistance request has been received. A TBCA specialist will review your request and contact you through your preferred channel."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Find the Right Service', href: '/find-the-right-service/recommendations' }, { label: 'Request Submitted' }]}
                steps={ASSIST_STEPS}
                current={7}
                chips={['Priority review within 1 business day', 'Human experts, not bots', 'Confidential and secure']}
                icon={<ShieldCheck className="size-8" aria-hidden="true" />}
                assist
            />
            <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <section className="grid gap-5 rounded-[10px] border border-parchment-400 bg-white p-5 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-14 items-center justify-center rounded-full bg-gold-50 text-gold-600"><ShieldCheck className="size-8" aria-hidden="true" /></span>
                                <div><h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">We&rsquo;ve received your request</h2><p className="text-[0.8125rem] text-ink-500">Thank you. Your request has been logged and assigned for review.</p></div>
                            </div>
                            <dl className="mt-4 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                                {tiles.map(([I, k, v]) => (
                                    <div key={k} className="flex gap-2.5 bg-white p-3"><I className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><dt className="text-[0.6875rem] text-ink-500">{k}</dt><dd className="text-[0.8125rem] font-semibold text-ink-900">{v}</dd></span></div>
                                ))}
                            </dl>
                            <p className="mt-3 flex items-center gap-2 rounded-[6px] bg-gold-50 p-3 text-[0.75rem] text-ink-700"><Mail className="size-4 text-gold-600" aria-hidden="true" />A confirmation message has been sent to your email and WhatsApp.</p>
                        </div>
                        <div className="lg:col-span-2">
                            <h3 className="text-[0.9375rem] font-bold text-ink-900">What happens next?</h3>
                            <NumberedList className="mt-3" items={['We acknowledge your request.', 'A TBCA specialist reviews your needs.', 'We contact you via your preferred channel.', 'You receive expert guidance and next steps.']} />
                            <h3 className="mt-5 text-[0.9375rem] font-bold text-ink-900">While you wait</h3>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[0.6875rem]">
                                <Link href="/find-the-right-service/recommendations" className="rounded-[6px] border border-gold-300 p-2 hover:bg-gold-50"><Eye className="mx-auto size-5" aria-hidden="true" />View recommended options again</Link>
                                <Link href="/shop" className="rounded-[6px] border border-gold-300 p-2 hover:bg-gold-50"><Rocket className="mx-auto size-5" aria-hidden="true" />Explore more Sprints</Link>
                                <Link href="/resources" className="rounded-[6px] border border-gold-300 p-2 hover:bg-gold-50"><BookOpen className="mx-auto size-5" aria-hidden="true" />Read helpful resources</Link>
                            </div>
                        </div>
                    </section>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Link href="/find-the-right-service/recommendations" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />Back to Recommendations</Link>
                        <Link href="/portal" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><Bookmark className="size-4" aria-hidden="true" />View Request in Client Portal</Link>
                        <button type="button" onClick={() => router.post('/find-the-right-service/restart')} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><PlusCircle className="size-4" aria-hidden="true" />Start Another Request</button>
                        <Link href="/services" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 sm:ml-auto">Return to Services <ArrowRight className="size-4" aria-hidden="true" /></Link>
                    </div>
                    <p className="mt-4 flex gap-2 text-[0.75rem] text-ink-500"><Lock className="size-4 shrink-0" aria-hidden="true" />Your request has been securely recorded. Responses from TBCA do not constitute binding professional advice, a funding decision or a quotation until formally confirmed.</p>
                </div>
                <aside className="xl:col-span-4">
                    <div className="rounded-[10px] bg-ink-950 p-5 text-parchment-200">
                        <h2 className="font-serif text-[1.1875rem] font-semibold text-gold-400">Your Request Summary</h2>
                        <dl className="mt-3 space-y-2 text-[0.8125rem]">
                            {[
                                ['Status', <span key="s" className="inline-flex items-center gap-1 text-verified-500"><CircleCheck className="size-4" aria-hidden="true" />Submitted</span>],
                                ['Selected Service Route', summary.need ?? r.help_with], ['Selected Item', r.item], ['Market', summary.market], ['Language', summary.language], ['Currency', summary.currency],
                                ['Contact Preference', r.contact_channel], ['Recommendation Status', summary.status],
                            ].map(([k, v]) => (
                                <div key={k as string} className="grid grid-cols-[9.5rem_1fr] gap-2"><dt className="text-ink-300">{k}</dt><dd className="text-parchment-100">{v}</dd></div>
                            ))}
                        </dl>
                        <p className="mt-4 flex gap-3 rounded-[8px] border border-gold-600/60 p-3 text-[0.75rem]"><Headset className="size-5 shrink-0 text-gold-500" aria-hidden="true" /><span><strong className="text-parchment-100">AI-Guided | Human-Reviewed Where Required</strong><br />Complex requests are reviewed by human experts.</span></p>
                        <p className="mt-4 text-[0.8125rem] font-semibold text-parchment-100">Need immediate help?</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-verified-500 text-[0.75rem] text-parchment-100"><MessageCircle className="size-4" aria-hidden="true" />Continue on WhatsApp</a>
                            <Link href="/discovery-call" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.75rem] text-parchment-100"><Phone className="size-4" aria-hidden="true" />Call / Book Consultation</Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
