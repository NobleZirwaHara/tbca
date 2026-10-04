import { Link } from '@inertiajs/react';
import { Check, Crown, FileText, Gift, Info, Lock, MousePointerClick, Settings2, ShieldCheck, Sparkles, User } from 'lucide-react';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';

const ROWS = [
    ['Selected free resources', 'All free resources', 'All enriched benefits'],
    ['General insights and articles', 'Personalised content suggestions', 'Premium guides and tools'],
    ['Webinars and event info', 'Webinar replays (where permitted)', 'Priority support and events'],
    ['—', 'Based on your interests', 'Advanced personalisation'],
    ['—', 'Exclusive offers and updates', 'Member-only content and offers'],
    ['Basic diagnostics', 'Enhanced diagnostics', 'Advanced tools and specialists'],
];

export default function ValueExchange() {
    return (
        <ResourceFrame title="Value Exchange Disclosure" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Value Exchange Disclosure' }]}>
            <PageTitle title="Value Exchange Disclosure" intro="We believe in a fair exchange of value. This disclosure explains what you will receive from us at each access level, and how we may process data to deliver those benefits." />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <Box>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1"><h2 className="font-serif text-xl font-semibold">Our Value Exchange Promise</h2><p className="mt-1 text-sm text-ink-600">We only process information that is necessary to deliver value to you. You stay in control of your choices. Nothing is shared or sold.</p></div>
                            <div className="flex gap-2 rounded border border-gold-300 bg-gold-50 p-3 text-xs"><ShieldCheck className="size-6 text-gold-700" /><span><strong className="block">You are in control</strong>Grant, manage or withdraw permissions at any time in your <Link href="/resources/preferences" className="text-controlled-700 underline">Preference Centre</Link>.</span></div>
                        </div>
                    </Box>
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[640px] text-left text-xs">
                            <thead>
                                <tr className="border-b border-parchment-300">
                                    <th className="w-1/4 p-3 align-top"><span className="flex items-center gap-2 font-serif text-base"><Gift className="size-5 text-gold-700" />What We Provide You</span><span className="mt-1 block font-normal text-ink-500">Access to high-quality, expert-created resources, insights and tools.</span></th>
                                    <th className="p-3 text-center text-controlled-700"><User className="mx-auto size-5" />Free Access<span className="block font-normal">(R0 Resources)</span></th>
                                    <th className="p-3 text-center text-verified-700"><Sparkles className="mx-auto size-5" />Registered Access<span className="block font-normal">(Enriched Experience)</span></th>
                                    <th className="p-3 text-center text-purple-700"><Crown className="mx-auto size-5" />Paid Access<span className="block font-normal">(Premium Experience)</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-200">
                                {ROWS.map((r, i) => (
                                    <tr key={i}>
                                        <td className="p-2.5 text-ink-700">✓ {['Guides, templates and checklists', 'Expert insights and articles', 'Webinars and replays', 'Personalised recommendations', 'Special offers and updates', 'Diagnostics and triage tools'][i]}</td>
                                        {r.map((c, j) => <td key={j} className="p-2.5">{c === '—' ? <span className="text-ink-300">—</span> : <span className="flex items-center gap-1.5"><Check className="size-3.5 shrink-0 text-verified-500" />{c}</span>}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center">
                        <Settings2 className="size-7 text-gold-700" />
                        <p className="flex-1 text-sm"><strong className="block">Your Choices</strong>You decide what you share and for what purpose. You can change your preferences or withdraw consent whenever you like.</p>
                        <Link href="/resources/preferences" className="rounded bg-gold-500 px-4 py-2 text-sm font-bold">Manage My Choices →</Link>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-ink-500"><ShieldCheck className="size-4" />Full details are available in our <Link href="/resources/data-statement" className="text-controlled-700 underline">Privacy Policy and Data Statement</Link>.</p>
                </div>
                <aside className="space-y-4">
                    <Box title="Information We May Process">
                        <ul className="space-y-3 text-xs">{[[FileText, 'Information you provide', 'Name, email, preferences and optional details.'], [MousePointerClick, 'How you use our resources', 'Pages visited, downloads, searches and resource interactions.'], [Sparkles, 'AI insights (where applicable)', 'Aggregated and anonymised trend analysis to improve recommendations.'], [Info, 'Service fulfilment', 'To deliver resources, run diagnostics and communicate with you.']].map(([I, t, s]) => { const Icon = I as typeof Info; return <li key={t as string} className="flex gap-2"><Icon className="size-5 text-ink-600" /><span><strong className="block">{t as string}</strong>{s as string}</span></li>; })}</ul>
                    </Box>
                    <Box tone="blue" title={<span className="flex items-center gap-2"><Lock className="size-4" />Your Privacy Matters</span>}><p className="text-xs">We do not sell your information. You can review, update or withdraw consent at any time in your <Link href="/resources/preferences" className="underline">Preference Centre</Link>.</p></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
