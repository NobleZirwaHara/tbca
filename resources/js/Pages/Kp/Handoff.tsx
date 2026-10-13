import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Crumbs } from '@/Components/Webinars/kit';
import { BASE, KpMonogram, ScreenChip, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    mode: 'handoff' | 'bridge';
    handoffId: string;
    source: string | null;
    mapping?: [string, string][];
}

const PROMISES: [string, string, string][] = [
    ['lock', 'Secure Handoff', 'Your session and preferences are carried over securely.'],
    ['shield-check', 'Attribution Preserved', 'Referrals and sources are recorded accurately.'],
    ['file-text', 'No Duplicate Estate', 'One canonical home for each piece of content.'],
    ['circle-check', 'Verified Information', 'Content is reviewed and evidence-linked.'],
    ['users', 'Human Oversight', 'Expert review for quality, accuracy and relevance.'],
];

/**
 * KP-SCR-001 Navigation Handoff and KP-SCR-002 Legacy Bridge. KrugerPhiri.org is the
 * canonical authority property (TBCA-KP-001); until it is live, visitors stay on the
 * TBCA-hosted KP section and the handoff says so.
 */
export default function Handoff({ screen, mode, handoffId, source, mapping }: Props) {
    const bridge = mode === 'bridge';
    return (
        <div className="bg-ink-950 pb-12 text-parchment-200">
            <Head title={`${bridge ? 'Legacy Bridge' : 'Navigation Handoff'} | KP Thought Leadership`} />
            <div className="container-tbca pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Crumbs dark items={[['Home', '/'], ['KP Thought Leadership', BASE], [bridge ? 'Legacy Bridge' : 'Navigation Handoff']]} />
                    {screen && <ScreenChip id={screen.id} />}
                </div>
                <header className="mx-auto mt-6 max-w-3xl text-center">
                    <h1 className="font-serif text-[2rem] font-bold text-gold-400 md:text-[2.5rem]">{bridge ? 'KP Legacy Bridge' : 'TBCA KP Navigation Handoff'}</h1>
                    <p className="mt-2 text-[1.0625rem] text-parchment-50">{bridge ? 'Older KP links on businessclinic.africa lead to one canonical home.' : 'You are about to visit the official authority property of Kruger Phiri.'}</p>
                    <p className="mt-1 text-[0.875rem]">
                        {bridge
                            ? 'Each legacy address maps to exactly one canonical page, so content is never duplicated and your journey is preserved.'
                            : 'Verified insights, original thinking and founder-authorised content live on the primary authority domain. Your journey and attribution are preserved.'}
                    </p>
                </header>

                <section className="mt-8 grid items-center gap-6 rounded-[12px] border border-gold-700/50 p-6 md:grid-cols-[1fr_auto_1fr]">
                    <div className="text-center">
                        <p className="font-serif text-[1.375rem] font-bold text-gold-400">The Business Clinic.Africa</p>
                        <p className="mt-1 text-[0.6875rem] tracking-[0.2em] text-parchment-300 uppercase">Institutional Delivery Platform</p>
                        <p className="mt-3 inline-flex rounded-[6px] border border-gold-700/60 px-3 py-1.5 text-[0.875rem] text-parchment-50">www.businessclinic.africa</p>
                        <p className="mt-3 text-[0.75rem]">TBCA delivers systems, AI, diagnostics, project advisory and execution support across Africa.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <L.ArrowRight className="size-16 text-gold-500" aria-hidden="true" />
                        <p className="flex items-center gap-1.5 font-semibold tracking-wider text-gold-400 uppercase"><L.ShieldCheck className="size-4" aria-hidden="true" /> Authority Bridge</p>
                        <p className="max-w-[14rem] text-[0.75rem]">This handoff preserves attribution, source integrity and your journey.</p>
                    </div>
                    <div className="text-center">
                        <KpMonogram dark />
                        <p className="mt-3 inline-flex rounded-[6px] border border-gold-700/60 px-3 py-1.5 text-[0.875rem] text-parchment-50">www.krugerphiri.org</p>
                        <p className="mt-3 text-[0.75rem]">Kruger Phiri's original thinking, frameworks, commentary and archives.</p>
                    </div>
                </section>

                {bridge && mapping && (
                    <section className="mt-6 rounded-[12px] border border-gold-700/50 p-5">
                        <h2 className="font-serif text-[1.125rem] font-bold text-parchment-50">Route Mapping</h2>
                        <table className="mt-3 w-full text-left text-[0.8125rem]">
                            <thead className="text-gold-400"><tr><th className="py-1.5">Legacy address (businessclinic.africa)</th><th className="py-1.5">Canonical address (krugerphiri.org)</th></tr></thead>
                            <tbody className="divide-y divide-ink-800">
                                {mapping.map(([a, b]) => (
                                    <tr key={a}><td className="py-2"><Link href={a} className="hover:text-gold-300">{a}</Link></td><td className="py-2 text-parchment-50">{b}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                <section className="mt-6 grid gap-4 rounded-[12px] border border-gold-700/50 p-5 lg:grid-cols-[1fr_auto_auto_16rem] lg:items-center">
                    <p className="flex items-start gap-3 text-[0.8125rem]">
                        <L.ShieldCheck className="size-8 shrink-0 text-gold-500" aria-hidden="true" />
                        The krugerphiri.org property is being prepared. Until it goes live, the KP section stays on TBCA so nothing is lost: same content, same sources, same review.
                    </p>
                    <BtnLink href={BASE} size="lg" icon="arrow-right">Continue to KP Section</BtnLink>
                    <BtnLink href="/" size="lg" tone="ghostDark" icon="arrow-left">Stay on TBCA</BtnLink>
                    <dl className="rounded-[8px] bg-ink-900 p-3 text-[0.75rem]">
                        <dt className="font-semibold text-gold-400">Journey Tracking</dt>
                        <dd className="mt-1">UTM source: {source ?? 'direct'}</dd>
                        <dd>Handoff ID: {handoffId}</dd>
                        <dd className="mt-1 inline-flex items-center gap-1 text-verified-500"><L.CircleCheck className="size-3.5" aria-hidden="true" /> Tracked</dd>
                    </dl>
                </section>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {PROMISES.map(([i, t, b]) => {
                        const I = { lock: L.Lock, 'shield-check': L.ShieldCheck, 'file-text': L.FileText, 'circle-check': L.CircleCheck, users: L.Users }[i] ?? L.Circle;
                        return (
                            <li key={t} className="flex gap-2.5 rounded-[10px] border border-gold-700/40 p-3">
                                <I className="size-6 shrink-0 text-gold-500" aria-hidden="true" />
                                <span>
                                    <span className="block text-[0.8125rem] font-semibold text-parchment-50">{t}</span>
                                    <span className="block text-[0.6875rem]">{b}</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
