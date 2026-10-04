import { Link, useForm } from '@inertiajs/react';
import { Check, Headphones, Info, Shield, User } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Field, Input } from '@/Components/ui/Form';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';

interface Purpose { key: string; label: string; hint: string; does: string; channels: string }
interface Props {
    purposes: Purpose[];
    current: Record<string, string>;
    prefill: { name: string; email: string; phone: string };
}

export default function Consent({ purposes, current, prefill }: Props) {
    const initial = purposes.filter((p) => (current[p.key] ? current[p.key] === 'granted' : ['essential', 'newsletters', 'webinars'].includes(p.key))).map((p) => p.key);
    const form = useForm({ name: prefill.name, email: prefill.email, phone: prefill.phone, purposes: initial });
    const toggle = (k: string) => form.setData('purposes', form.data.purposes.includes(k) ? form.data.purposes.filter((x) => x !== k) : [...form.data.purposes, k]);
    const all = form.data.purposes.length === purposes.length;

    return (
        <ResourceFrame title="Consent Capture" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Consent Capture' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <PageTitle title="Consent Capture" intro={<>We value your privacy and your choices. You decide what you share and for what purpose. All consents are optional. You can change or withdraw them at any time in your <Link href="/resources/preferences" className="text-controlled-700 underline">Preference Centre</Link>.</>} />
                    <form onSubmit={(e) => { e.preventDefault(); form.post('/resources/consent'); }} className="rounded-[8px] border border-parchment-400 bg-white p-5" noValidate>
                        <h2 className="font-serif text-lg font-semibold">1. Choose What You Consent To (all optional)</h2>
                        <p className="text-xs text-ink-500">Select the purposes for which you give consent. Clear descriptions are provided for each.</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-xs">
                                <thead className="text-ink-500"><tr><th className="py-2">Purpose</th><th>What this allows us to do</th><th className="text-center">Consent</th></tr></thead>
                                <tbody className="divide-y divide-parchment-200">
                                    {purposes.map((p) => (
                                        <tr key={p.key}>
                                            <td className="py-2.5 pr-3"><strong className="block text-[0.8125rem]">{p.label}</strong><span className="text-ink-500">{p.hint}</span></td>
                                            <td className="pr-3">{p.does}</td>
                                            <td className="text-center"><input type="checkbox" aria-label={`Consent to ${p.label}`} className="size-4 accent-controlled-500" checked={form.data.purposes.includes(p.key)} onChange={() => toggle(p.key)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" className="accent-controlled-500" checked={all} onChange={() => form.setData('purposes', all ? [] : purposes.map((p) => p.key))} /> Select all (optional)</label>
                        <h2 className="mt-5 font-serif text-lg font-semibold">2. Your Contact Details <span className="font-sans text-xs font-normal">(used for the purposes you select above)</span></h2>
                        <div className="mt-2 grid gap-3 sm:grid-cols-3">
                            <Field label="Full Name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Thandi Maseko" />}</Field>
                            <Field label="Email Address" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="e.g. thandi@company.co.za" />}</Field>
                            <Field label="Phone (optional)" error={form.errors.phone}>{(id) => <Input id={id} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+27 82 123 4567" />}</Field>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <Link href="/resources" className="rounded border border-parchment-500 px-4 py-2 text-sm">Back</Link>
                            <span className="flex items-center gap-3"><Link href="/resources/preferences" className="text-sm font-semibold text-controlled-700">Manage My Choices</Link><button type="submit" disabled={form.processing} className="rounded bg-verified-500 px-5 py-2 text-sm font-bold text-white">Save My Choices →</button></span>
                        </div>
                        <p className="mt-2 text-right text-xs text-ink-500">You can update or withdraw consent at any time.</p>
                    </form>
                </div>
                <aside className="space-y-4">
                    <Box tone="blue" title={<span className="flex items-center gap-2"><Shield className="size-5" />Why we ask</span>}><p className="text-xs">Consent allows us to provide you with relevant resources and a personalised experience. All consents are optional and granular. You stay in control.</p><Link href="/resources/data-statement" className="mt-2 inline-block text-xs font-semibold">Learn more about how we process data →</Link></Box>
                    <Box title={<span className="flex items-center gap-2"><User className="size-5" />Your Rights</span>}><ul className="space-y-1.5 text-xs">{['Access your data and consents', 'Change your preferences', 'Withdraw consent at any time', 'Request correction or deletion of your data', 'Object to or restrict certain processing'].map((t) => <li key={t} className="flex gap-2"><Check className="size-3.5 text-verified-500" />{t}</li>)}</ul></Box>
                    <Box tone="amber" title={<span className="flex items-center gap-2"><Headphones className="size-5" />Need Help?</span>}><p className="text-xs">Our data team is here to help you with any questions about your data and choices.</p><button type="button" onClick={() => openAskQuestion({ subject: 'Data and consent question', section: 'resources' })} className="mt-2 w-full rounded border border-gold-500 bg-white py-1.5 text-xs font-semibold text-gold-800">Contact Data Team →</button></Box>
                    <p className="flex gap-1.5 text-[0.6875rem] text-ink-500"><Info className="size-3.5 shrink-0" /> Essential communications use the contract basis; all marketing purposes are off unless you tick them.</p>
                </aside>
            </div>
        </ResourceFrame>
    );
}
