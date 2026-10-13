import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import CoverArt from '@/Components/Art/CoverArt';
import { BtnLink, Card, CheckItem, EventHero, Ico, KeyDetails, NoticeCards, PillTabs, WebinarShell, btnClass } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Offer {
    key: string;
    group: string;
    title: string;
    icon: string;
    body: string;
    meta: string[];
    zar: number;
    unit: string | null;
    from?: boolean;
    cta: string;
    href: string;
    badge: string | null;
}

interface Props extends EventFrame {
    offers: Offer[];
    groups: { key: string; label: string; count: number }[];
    promo: { code: string; percent: number; days: number; validUntil: string; active: boolean };
}

export default function Offers({ event, notices, offers, groups, promo }: Props) {
    const price = usePrice();
    const [tab, setTab] = useState('recommended');
    const [copied, setCopied] = useState(false);
    const list = tab === 'recommended' ? offers.slice(0, 6) : offers.filter((o) => o.group === tab);

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <KeyDetails event={event} title="Webinar Summary" />
                    <Card tone="cream" title="Limited Time Offer" icon="clock" action={<span className="rounded bg-risk-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">Valid for {promo.days} Days</span>}>
                        <p className="text-[0.9375rem] text-ink-800">Get {promo.percent}% off any Advisory Service or Toolkit purchased within {promo.days} days of this webinar.</p>
                        <button type="button" onClick={() => { void navigator.clipboard?.writeText(promo.code); setCopied(true); }} className="mt-3 flex w-full items-center justify-between rounded-[6px] border border-dashed border-gold-500 bg-white px-3 py-2 text-[0.875rem]">
                            <span className="text-gold-700">Use code:</span><span className="font-mono font-bold text-ink-900">{promo.code}</span>{copied ? <L.Check className="size-4 text-verified-500" /> : <L.Copy className="size-4 text-gold-700" aria-label="Copy code" />}
                        </button>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">{promo.active ? `Valid until ${promo.validUntil}. Applied at checkout to eligible items.` : `This offer expired on ${promo.validUntil}.`} Your final price, tax and payment route are confirmed at checkout for your country.</p>
                        <BtnLink href="/basket" size="lg" className="mt-3 w-full">Redeem Offer <L.ArrowRight className="size-4" aria-hidden="true" /></BtnLink>
                    </Card>
                    <Card title="Need Help Choosing?" icon="message-circle">
                        <p className="text-[0.8125rem] text-ink-600">Speak to a TBCA adviser for a personalised recommendation based on your business needs.</p>
                        <BtnLink href="/discovery-call" tone="outline" className="mt-3 w-full" icon="calendar-days">Book a Free 15-Minute Call</BtnLink>
                    </Card>
                    <Card title="Next Steps" icon="clipboard-check">
                        <ul className="space-y-2">
                            <CheckItem>Download your webinar resources</CheckItem>
                            <CheckItem>Explore the recommended services and toolkits</CheckItem>
                            <CheckItem>Book a consultation or get started</CheckItem>
                        </ul>
                    </Card>
                </>
            }
        >
            <Head title={`Post-Webinar Offers: ${event.title}`} />
            <EventHero
                crumbs={[['Home', '/'], ['Webinars', '/webinars'], [event.title.split(':')[0], `/webinars/${event.slug}`], ['Post-Webinar Offers']]}
                eyebrow="Exclusive Offers"
                title="Take the Next Step with TBCA"
                lead={<><strong className="block text-parchment-50">Turn insights from this webinar into real impact for your business.</strong>Access post-webinar offers, recommended services and curated toolkits designed to help you move from vision to execution.</>}
                aside={event.quote ? (
                    <blockquote className="rounded-[10px] border border-gold-600/60 bg-ink-950/80 p-4">
                        <L.Quote className="size-6 text-gold-500" aria-hidden="true" />
                        <p className="mt-1 font-serif text-[1.0625rem] text-parchment-50">&ldquo;{event.quote[0]}&rdquo;</p>
                        <footer className="mt-2 text-[0.75rem] text-gold-400">{event.quote[1]}</footer>
                    </blockquote>
                ) : undefined}
            />

            <NoticeCards notices={notices} keys={['offer', 'boundary']} />

            <PillTabs tabs={groups.map((g) => ({ key: g.key, label: `${g.label} (${g.count})` }))} value={tab} onChange={setTab} />

            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {list.map((o) => (
                    <li key={o.key} className="flex flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                        <div className="relative aspect-[16/7]">
                            <CoverArt seed={o.key} category={o.group === 'toolkits' ? 'templates-toolkits' : o.group === 'flagship' ? 'subscriptions-retainers' : 'business-management'} className="absolute inset-0 h-full w-full" />
                            {o.badge && <span className="absolute top-2 left-2 rounded bg-risk-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">{o.badge}</span>}
                            <span className="absolute -bottom-5 left-4 flex size-11 items-center justify-center rounded-full border-4 border-white bg-gold-100 text-ink-900"><Ico name={o.icon} className="size-5" /></span>
                        </div>
                        <div className="flex flex-1 flex-col p-4 pt-7">
                            <h3 className="font-serif text-[1.1875rem] font-bold text-ink-900">{o.title}</h3>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">{o.body}</p>
                            <div className="mt-3 flex items-end justify-between gap-2 text-[0.75rem] text-ink-600">
                                <span className="flex flex-wrap gap-x-3">{o.meta.map((m) => <span key={m} className="flex items-center gap-1"><L.Dot className="size-3" aria-hidden="true" />{m}</span>)}</span>
                                <span className="text-right">
                                    <span className="block text-[1.0625rem] font-bold text-ink-900">{o.from && 'From '}{price(o.zar)}{o.unit}</span>
                                    <span className="text-[0.6875rem] text-ink-400">(excl. VAT)</span>
                                </span>
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                                <Link href={o.href} className={btnClass('outline', 'md')}>View Details</Link>
                                <Link href={o.href} className={cn(btnClass('gold', 'md'))}>{o.cta} <L.ArrowRight className="size-4" aria-hidden="true" /></Link>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <p className="text-[0.75rem] text-ink-500">Prices are stored in South African Rand and shown in your selected currency. The final price, tax treatment, payment route and availability for your country are resolved before you commit. There is no obligation to buy, book or continue.</p>
        </WebinarShell>
    );
}

Offers.layout = null;
