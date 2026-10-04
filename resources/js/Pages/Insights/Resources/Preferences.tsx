import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { BarChart3, Check, Headphones, Mail, Megaphone, Share2, Shield, Sparkles, User } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box, Status } from '@/Components/Insights/Shared';
import { AccountNav, PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';

interface Item { key: string; label: string; hint?: string; does?: string; channels?: string; text?: string }
interface Props {
    email: string | null;
    purposes: Item[];
    settings: Item[];
    current: Record<string, string>;
    summary: { active: number; limited: number; inactive: number; updated: string | null };
    history: { purpose: string; state: string; at: string }[];
}

function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: () => void; label: string; disabled?: boolean }) {
    return (
        <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onChange} className={cn('relative h-6 w-11 rounded-full transition-colors disabled:opacity-60', on ? 'bg-verified-500' : 'bg-parchment-400')}>
            <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
        </button>
    );
}

export default function Preferences({ email, purposes, settings, current, summary, history }: Props) {
    const initial = Object.fromEntries([...purposes, ...settings].map((p) => [p.key, p.key === 'essential' ? true : current[p.key] === 'granted']));
    const [prefs, setPrefs] = useState<Record<string, boolean>>(initial);
    const [showHistory, setShowHistory] = useState(false);
    const emailForm = useForm({ email: email ?? '' });
    const save = (reset = false) => router.post('/resources/preferences', { prefs, reset, email: email ?? emailForm.data.email }, { preserveScroll: true });
    const icons = [Mail, Sparkles, BarChart3, Megaphone, Share2];

    return (
        <ResourceFrame title="Preference & Consent Centre" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Preference & Consent Centre' }]}>
            <AccountNav active="preferences" />
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <PageTitle title="Preference & Consent Centre" intro="You're in control. Manage your communication preferences, data sharing choices and consent settings. Your choices help us provide relevant resources while respecting your privacy." />
                    {!email && (
                        <form onSubmit={(e) => { e.preventDefault(); router.get('/resources/consent'); }} className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-4 text-sm">
                            Sign in, or record your choices first on the <Link href="/resources/consent" className="font-semibold underline">Consent Capture</Link> page, to manage saved preferences. You can still set choices below with your email address:
                            <input aria-label="Email address" type="email" value={emailForm.data.email} onChange={(e) => emailForm.setData('email', e.target.value)} placeholder="you@company.co.za" className="mt-2 h-9 w-full rounded border border-parchment-500 bg-white px-2" />
                        </form>
                    )}
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Mail className="size-5" />Communication Preferences</span>}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[540px] text-left text-xs">
                                <thead className="text-ink-500"><tr><th className="py-2">Preference</th><th>Description</th><th>Channel</th><th>Status</th></tr></thead>
                                <tbody className="divide-y divide-parchment-200">
                                    {purposes.map((p, i) => {
                                        const I = icons[i % icons.length];
                                        return (
                                            <tr key={p.key}>
                                                <td className="py-2.5 pr-2"><span className="flex items-center gap-2 font-semibold"><I className="size-6 rounded-full border p-1 text-gold-700" />{p.label}</span></td>
                                                <td className="pr-2">{p.does}</td>
                                                <td className="pr-2 font-semibold">{p.channels}</td>
                                                <td><Toggle label={p.label} on={prefs[p.key]} disabled={p.key === 'essential'} onChange={() => setPrefs({ ...prefs, [p.key]: !prefs[p.key] })} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-verified-700">Save your changes</span>
                            <span className="flex gap-3"><button type="button" onClick={() => save(true)} className="text-xs font-semibold text-controlled-700">Reset to default</button><button type="button" onClick={() => save()} className="rounded bg-verified-500 px-4 py-2 text-xs font-bold text-white">Save Preferences</button></span>
                        </div>
                    </Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Shield className="size-5" />Data & Consent Settings</span>}>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {settings.map((s) => (
                                <div key={s.key} className="text-xs">
                                    <div className="flex items-center justify-between"><strong className="text-[0.8125rem]">{s.label}</strong><Toggle label={s.label} on={prefs[s.key]} onChange={() => setPrefs({ ...prefs, [s.key]: !prefs[s.key] })} /></div>
                                    <p className="mt-1 text-ink-600">{s.text}</p>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => save()} className="mt-3 rounded border border-verified-500 px-3 py-1.5 text-xs font-semibold text-verified-700">Save settings</button>
                    </Box>
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="flex items-center gap-2"><Shield className="size-5" />Your Consent Summary</span>}>
                        <dl className="space-y-2 text-xs">
                            <div className="flex justify-between"><dt className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-verified-500" />Active Preferences</dt><dd className="font-semibold">{summary.active}</dd></div>
                            <div className="flex justify-between"><dt className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-attested-500" />Limited Preferences</dt><dd className="font-semibold">{summary.limited}</dd></div>
                            <div className="flex justify-between"><dt className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-risk-500" />Inactive Preferences</dt><dd className="font-semibold">{summary.inactive}</dd></div>
                            <div className="flex justify-between"><dt>Last Updated</dt><dd>{summary.updated ?? '—'}</dd></div>
                        </dl>
                        <button type="button" onClick={() => setShowHistory(!showHistory)} className="mt-2 text-xs font-semibold text-controlled-700">View Consent History →</button>
                        {showHistory && <ul className="mt-2 space-y-1 text-[0.6875rem]">{history.map((h, i) => <li key={i} className="flex justify-between gap-2"><span>{h.purpose}</span><span><Status value={h.state} /> {h.at}</span></li>)}</ul>}
                    </Box>
                    <Box title={<span className="flex items-center gap-2"><User className="size-5" />Your Rights</span>}><ul className="space-y-1.5 text-xs">{['Access your personal data', 'Request correction or update', 'Request deletion of your data', 'Withdraw consent at any time'].map((t) => <li key={t} className="flex gap-2"><Check className="size-3.5 text-verified-500" />{t}</li>)}</ul><Link href="/resources/withdrawal" className="mt-2 inline-block text-xs font-semibold text-controlled-700">Withdrawal & erasure →</Link></Box>
                    <Box tone="amber" title={<span className="flex items-center gap-2"><Headphones className="size-5" />Need Help?</span>}><p className="text-xs">Our data team is here to help you understand your choices.</p><button type="button" onClick={() => openAskQuestion({ subject: 'Preference centre help', section: 'resources' })} className="mt-2 w-full rounded border border-gold-500 bg-white py-1.5 text-xs font-semibold text-gold-800">Contact Data Team →</button></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
