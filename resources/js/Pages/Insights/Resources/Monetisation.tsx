import { Link } from '@inertiajs/react';
import { CalendarDays, FileText, Handshake, HelpCircle, Info, Lock, Search, ShieldCheck, ShoppingCart, UserCheck, Wallet } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';

export default function Monetisation() {
    return (
        <ResourceFrame title="Monetisation Gate" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Monetisation Gate' }]}>
            <PageTitle title="Monetisation Gate" intro="TBCA provides high-value insights and resources for information purposes. To access premium content, advanced tools or downloadable files, a monetisation gate may apply." />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Lock className="size-5 text-gold-600" />How It Works</span>}>
                        <ol className="grid gap-4 sm:grid-cols-4">
                            {[[Search, '1. Explore', 'Browse free resources and insights.'], [Lock, '2. Gate Activated', 'Premium content is restricted by a monetisation gate.'], [Wallet, '3. Unlock & Pay', 'Purchase, subscribe or activate access to unlock content.'], [FileText, '4. Access Granted', 'Download or access the premium resource immediately.']].map(([I, t, s]) => { const Icon = I as typeof Lock; return <li key={t as string} className="text-center"><Icon className="mx-auto size-10 rounded-full border-2 border-gold-500 p-2 text-gold-700" /><p className="mt-2 text-sm font-semibold">{t as string}</p><p className="text-xs text-ink-500">{s as string}</p></li>; })}
                        </ol>
                    </Box>
                    <Box title="Gate Types">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[[ShoppingCart, 'One-Time Purchase', 'Pay once to unlock a specific resource or template.', 'View Products', '/resources/library?access=paid', 'border-controlled-500/30 bg-controlled-50'], [CalendarDays, 'Subscription Access', 'Premium resources included with your active subscription.', 'View Subscriptions', '/resources/account/subscription', 'border-verified-500/30 bg-verified-50'], [UserCheck, 'Retainer Exclusive', 'Available to active retainer clients only.', 'Learn More', '/retainers', 'border-purple-300 bg-purple-50'], [Handshake, 'Partner / Client Only', 'Restricted content for approved partners or clients.', 'Partner Portal', '/portal', 'border-gold-300 bg-gold-50']].map(([I, t, s, c, h, tone]) => { const Icon = I as typeof Lock; return <div key={t as string} className={`rounded-[8px] border p-3 ${tone as string}`}><p className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-5" />{t as string}</p><p className="mt-1 text-xs text-ink-600">{s as string}</p><Link href={h as string} className="mt-2 inline-block text-xs font-semibold">{c as string} →</Link></div>; })}
                        </div>
                    </Box>
                    <Box tone="amber" title={<span className="flex items-center gap-2 text-gold-800"><Info className="size-5" />Why We Monetise</span>}><p className="text-sm">Monetisation allows us to maintain accurate, high-quality and continually updated resources. It ensures we can invest in research, verification, technology and expert oversight for you.</p></Box>
                </div>
                <aside className="space-y-4">
                    <Box tone="blue" title={<span className="flex items-center gap-2"><ShieldCheck className="size-5" />Free Resources</span>}><p className="text-xs">Many resources remain free to help you make informed decisions.</p><Link href="/resources/library?access=free" className="mt-2 inline-block text-xs font-semibold text-controlled-700">Explore Free Resources →</Link></Box>
                    <Box tone="gold" title="Already Have Access?"><p className="text-xs">Log in to your account to access your purchased or subscribed content.</p><Link href="/resources/account/library" className="mt-2 inline-block text-xs font-semibold text-verified-700">Login to Your Account →</Link></Box>
                    <Box title={<span className="flex items-center gap-2"><HelpCircle className="size-5" />Need Help?</span>}><p className="text-xs">Our team is here to help you find the right resource.</p><button type="button" onClick={() => openAskQuestion({ subject: 'Help finding a resource', section: 'resources' })} className="mt-2 text-xs font-semibold text-purple-700">Contact Us →</button></Box>
                    <Box tone="amber" title="Transparent Pricing"><p className="text-xs">All prices are shown upfront. No hidden fees.</p><Link href="/resources/free-vs-paid" className="mt-2 inline-block text-xs font-semibold text-gold-800">View Pricing Policy →</Link></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
