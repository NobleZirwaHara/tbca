import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, KpPage, type KpShared } from '@/Components/Kp/kit';
import { usePrice } from '@/lib/money';

interface Props extends KpShared {
    plans: [string, number | null, string, string][];
    rows: [string, string, string, string, string, string][];
}

const ROW_ICON = ['lightbulb', 'help', 'calculator', 'download', 'bar-chart-3', 'help-circle', 'user-check'];
const NOTES = ['Free access is for exploration and evaluation.', 'Usage limits apply to ensure fair access for all.', 'Paid access provides more depth, tools and support.', 'Some tools require human review and are only available with paid access.', 'You can upgrade or cancel at any time.'];

/** KP-SCR-032 Free-to-Paid Disclosure. Prices are indicative and confirmed on the Subscriptions page. */
export default function FreePaid({ screen, kpNav, plans, rows }: Props) {
    const price = usePrice();
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Free-to-Paid Disclosure']]}
            title="Free-to-Paid Disclosure"
            intro="Transparent information about free access, upgrade options and what you get with paid access."
            actions={<button type="button" onClick={() => window.print()} className={btnClass('outline', 'sm')}><L.Printer className="size-3.5" />Print Disclosure</button>}
            rail={
                <>
                    <Box title="Upgrade Options" icon="crown">
                        <p className="-mt-2 mb-2 text-[0.75rem] text-ink-500">Choose the option that fits your needs.</p>
                        <ul className="divide-y divide-parchment-300">{plans.map(([t, zar, unit, i]) => <li key={t}><Link href="/subscriptions" className="flex items-center gap-2 py-2 hover:text-gold-700"><Ico name={i} className="size-5 text-referenced-500" /><span className="flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{zar === null ? unit : `From ${price(zar)} ${unit}`}</span></span><L.ArrowRight className="size-4" /></Link></li>)}</ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Indicative. Current prices and terms are on the Subscriptions page.</p>
                    </Box>
                    <Box title="Important Notes" icon="triangle-alert">
                        <ul className="list-disc space-y-1 pl-4 text-[0.75rem]">{NOTES.map((n) => <li key={n}>{n}</li>)}</ul>
                    </Box>
                    <Box title="Questions?">
                        <p className="text-[0.8125rem]">We're here to help you make the right choice.</p>
                        <Link href="/contact?subject=KP%20access%20question" className="mt-2 inline-block text-[0.8125rem] font-semibold text-gold-700">Contact Support</Link>
                    </Box>
                </>
            }
        >
            <div className="flex gap-3 rounded-[12px] border border-referenced-500/30 bg-referenced-50 p-4">
                <L.Info className="size-6 shrink-0 text-referenced-500" aria-hidden="true" />
                <div className="text-[0.8125rem] text-ink-700"><p className="font-bold text-ink-900">Why we have limits on free access</p><p>Free access helps you explore and make informed decisions. Paid access unlocks deeper insights, advanced tools and personalised support created by experts. Paid tools include human review where required. Learners in Future Builders always use the free layer: nothing there is sold.</p></div>
            </div>
            <Box title="What's Included" icon="layers">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[0.8125rem]">
                        <thead className="border-b border-parchment-400 text-[0.75rem] text-ink-600"><tr><th className="py-2 pr-3">Feature / Capability</th><th className="py-2 pr-3">Free Access <span className="ml-1 rounded-full bg-referenced-50 px-2 py-0.5 text-referenced-500">Explore</span></th><th className="py-2">Paid Access <span className="ml-1 rounded-full bg-verified-50 px-2 py-0.5 text-verified-700">Unlock More</span></th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {rows.map(([f, d, fl, fs, pl, ps], i) => (
                                <tr key={f}>
                                    <td className="py-2.5 pr-3"><span className="flex items-start gap-2"><Ico name={ROW_ICON[i]} className="mt-0.5 size-5 shrink-0 text-referenced-500" /><span><span className="block font-semibold text-ink-900">{f}</span><span className="block text-[0.75rem] text-ink-500">{d}</span></span></span></td>
                                    <td className="py-2.5 pr-3"><span className={`block font-semibold ${fl === 'Not included' ? 'text-risk-500' : 'text-controlled-700'}`}>{fl}</span><span className="block text-[0.75rem] text-ink-500">{fs}</span></td>
                                    <td className="py-2.5"><span className="flex items-start gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" /><span><span className="block font-semibold text-verified-700">{pl}</span><span className="block text-[0.75rem] text-ink-500">{ps}</span></span></span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[['shield-check', 'Your data is safe', 'We never sell your data. See our Privacy Policy for details.', '/policies'], ['lock', 'Transparent & honest', "Clear about what's free, what's paid and why.", `${BASE}/standards/professional-limitation`], ['handshake', 'Value you can trust', 'Paid access is designed to help you achieve better outcomes.', `${BASE}/work-with-kruger`]].map(([i, t, b, h]) => <li key={t} className="flex gap-2.5 rounded-[10px] border border-parchment-400 bg-white p-3"><Ico name={i} className="mt-0.5 size-6 shrink-0 text-referenced-500" /><span><Link href={h} className="block text-[0.8125rem] font-bold text-ink-900 hover:text-gold-700">{t}</Link><span className="block text-[0.75rem] text-ink-600">{b}</span></span></li>)}
                <li className="rounded-[10px] border border-gold-300 bg-gold-50 p-3"><p className="text-[0.8125rem] font-bold text-ink-900">Ready to unlock more?</p><p className="text-[0.75rem] text-ink-600">Upgrade for full access, deeper insights and expert support.</p><BtnLink href="/subscriptions" size="sm" className="mt-2" icon="arrow-right">View Subscriptions</BtnLink></li>
            </ul>
        </KpPage>
    );
}
