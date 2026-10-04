import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Database, FileText, Headphones, Info, Lock, Mail, MinusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Box, Status } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';

interface Props {
    purposes: { key: string; label: string }[];
    prefill: { name: string; email: string };
    requests: { reference: string; type: string; status: string; at: string; disposition: { item: string; status: string }[] | null }[];
}

export default function Withdrawal({ purposes, prefill, requests }: Props) {
    const form = useForm<{ type: 'withdraw' | 'erase'; name: string; email: string; purposes: string[]; notes: string }>({ type: 'withdraw', name: prefill.name, email: prefill.email, purposes: [], notes: '' });
    const err = form.errors as Record<string, string>;
    const toggle = (k: string) => form.setData('purposes', form.data.purposes.includes(k) ? form.data.purposes.filter((x) => x !== k) : [...form.data.purposes, k]);

    return (
        <ResourceFrame title="Withdrawal & Erasure" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Withdrawal & Erasure Flow' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <PageTitle title="Withdrawal & Erasure Flow" intro={<>You can withdraw consent or request erasure of your personal data at any time. We will process your request in accordance with <strong className="text-controlled-700">POPIA</strong> and our data retention policy.</>} />
                    <Box title="How it works – 4 simple steps">
                        <ol className="grid gap-4 sm:grid-cols-4">{[[FileText, '1. Submit Request', 'Choose what you want to do and submit your request.'], [CheckCircle2, '2. We Verify', 'We verify your identity to protect your data.'], [Clock, '3. We Process', 'We action your request within the required timeframe.'], [Mail, '4. Confirmation', 'You receive confirmation once completed.']].map(([I, t, s]) => { const Icon = I as typeof Clock; return <li key={t as string} className="text-center"><Icon className="mx-auto size-10 rounded-full border-2 border-gold-500 p-2 text-gold-700" /><p className="mt-2 text-sm font-semibold">{t as string}</p><p className="text-xs text-ink-500">{s as string}</p></li>; })}</ol>
                    </Box>
                    <form onSubmit={(e) => { e.preventDefault(); form.post('/resources/withdrawal', { preserveScroll: true }); }} className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5" noValidate>
                        <h2 className="font-serif text-lg font-semibold">What can you do?</h2>
                        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Request type">
                            <button type="button" role="radio" aria-checked={form.data.type === 'withdraw'} onClick={() => form.setData('type', 'withdraw')} className={cn('flex gap-3 rounded-[8px] border p-3 text-left', form.data.type === 'withdraw' ? 'border-controlled-500 bg-controlled-50 ring-1 ring-controlled-500' : 'border-parchment-400')}><MinusCircle className="size-6 text-controlled-700" /><span><strong className="block text-sm">Withdraw Consent</strong><span className="text-xs text-ink-600">Stop us from using your data for specific purposes (e.g. marketing, analytics).</span></span></button>
                            <button type="button" role="radio" aria-checked={form.data.type === 'erase'} onClick={() => form.setData('type', 'erase')} className={cn('flex gap-3 rounded-[8px] border p-3 text-left', form.data.type === 'erase' ? 'border-verified-500 bg-verified-50 ring-1 ring-verified-500' : 'border-parchment-400')}><Trash2 className="size-6 text-verified-700" /><span><strong className="block text-sm">Request Erasure</strong><span className="text-xs text-ink-600">Request deletion of your personal data where there is no legal obligation for us to keep it.</span></span></button>
                        </div>
                        {form.data.type === 'withdraw' && (
                            <fieldset>
                                <legend className="text-sm font-semibold">Purposes to withdraw (no reason required)</legend>
                                <div className="mt-2 flex flex-wrap gap-2">{[...purposes, { key: 'whatsapp', label: 'WhatsApp updates' }, { key: 'data_bank', label: 'Data Bank contribution' }].map((p) => <label key={p.key} className={cn('flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs', form.data.purposes.includes(p.key) ? 'border-controlled-500 bg-controlled-50' : 'border-parchment-400')}><input type="checkbox" className="accent-controlled-500" checked={form.data.purposes.includes(p.key)} onChange={() => toggle(p.key)} />{p.label}</label>)}</div>
                                {(err.purposes ?? err['purposes.0']) && <p role="alert" className="mt-1 text-xs text-risk-500">{err.purposes ?? err['purposes.0']}</p>}
                            </fieldset>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Full name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                            <Field label="Email address" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                            <Field label="Notes (optional)" className="sm:col-span-2" error={form.errors.notes}>{(id) => <Textarea id={id} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />}</Field>
                        </div>
                        <button type="submit" disabled={form.processing} className="rounded bg-gold-500 px-5 py-2 text-sm font-bold">{form.data.type === 'withdraw' ? 'Withdraw now' : 'Submit erasure request'}</button>
                    </form>
                    <Box tone="amber" title="What happens after your request?">
                        <ul className="space-y-1.5 text-sm">{['We stop using your data for the selected purposes.', 'We delete or anonymise your data where legally possible.', 'Some data may be retained if required by law (e.g. tax, legal, regulatory).', 'You will receive an email confirmation once your request is completed.'].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="size-4 text-gold-600" />{t}</li>)}</ul>
                    </Box>
                    {requests.length > 0 && (
                        <Box title="Your requests">
                            <ul className="space-y-3 text-xs">{requests.map((r) => <li key={r.reference}><p className="flex items-center gap-2"><strong>{r.reference}</strong> {r.type} · {r.at} <Status value={r.status} /></p>{r.disposition && <ul className="mt-1 pl-4 text-ink-600">{r.disposition.map((d) => <li key={d.item}>• {d.item}: {d.status}</li>)}</ul>}</li>)}</ul>
                        </Box>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-ink-500"><Info className="size-4" /> For full details, please read our <Link href="/resources/data-statement" className="text-controlled-700 underline">Privacy Policy and Data Statement</Link>.</p>
                </div>
                <aside className="space-y-4">
                    <Box tone="blue" title={<span className="flex items-center gap-2"><Info className="size-5" />Timeframes</span>}><p className="text-xs">We will respond to your request within 10 business days and complete it within 30 calendar days, unless an extension is required by law.</p></Box>
                    <Box tone="gold" title={<span className="flex items-center gap-2"><Lock className="size-5" />Your Identity</span>}><p className="text-xs">To protect your privacy, we may ask you to verify your identity before we can process your request.</p></Box>
                    <Box title={<span className="flex items-center gap-2"><Database className="size-5" />Data We May Retain</span>}><p className="text-xs">We may keep certain data if we are legally required to. Examples include:</p><ul className="mt-1 list-disc pl-4 text-xs"><li>Tax and accounting records</li><li>Legal or regulatory obligations</li><li>Fraud prevention and security</li></ul></Box>
                    <Box tone="amber" title={<span className="flex items-center gap-2"><Headphones className="size-5" />Need Help?</span>}><p className="text-xs">Our Data Team is here to assist you.</p><button type="button" onClick={() => openAskQuestion({ subject: 'Withdrawal / erasure help', section: 'resources' })} className="mt-2 text-xs font-semibold text-gold-800">Contact Data Team →</button><ShieldCheck className="hidden" /></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
