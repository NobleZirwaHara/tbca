import { Head, router, useForm } from '@inertiajs/react';
import { Info, Lock, Save, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DarkHero } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import { cn } from '@/lib/cn';
import type { MkListing, Option } from '@/types/marketplace';

interface Props {
    listing: MkListing | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draft: Record<string, any>;
    steps: string[];
    options: Record<'categories' | 'outcomes' | 'timelines' | 'countries' | 'professions' | 'outputs' | 'uses' | 'roles' | 'actFor', Option[]>;
}

export default function Intake({ listing, draft, steps, options }: Props) {
    const form = useForm({
        category: listing?.category ?? '', description: '', outcome: '', timeline: '', country: 'South Africa', jurisdiction: 'South Africa', profession: '', specialisation: '',
        output: '', intended_use: '', role: '', act_for: '', organisation: '', matter_reference: '', parties: '', service: listing?.slug ?? '', ...draft,
    });
    type K = keyof typeof form.data;
    const sel = (k: K, l: string, o: Option[], req = true) => <Field label={l} required={req} error={form.errors[k]}>{(id) => <Select id={id} value={form.data[k]} options={o} placeholder="Select" onChange={(e) => form.setData(k, e.target.value)} />}</Field>;

    return (
        <>
            <Head title="Request Partner Review Intake" />
            <DarkHero crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Request Partner Review' }]} title="Request Partner Review Intake" subtitle="Step 1 of 7 – Tell us what you need and we'll guide you through the process."
                aside={<div className="rounded-[8px] border border-gold-500/60 p-5 text-sm"><p className="flex items-center gap-2 font-semibold text-gold-400"><ShieldCheck className="size-5" aria-hidden="true" />Permission Vehicle.</p><p className="mt-1 text-ink-200">Partner Services is a permission-controlled route. It is not a marketplace or a freelancer directory. Every engagement is governed by professional boundaries, jurisdictional rules and conflict clearance before any payment or work begins.</p></div>}>
                Partner Services connects you with qualified independent professionals and firms where regulated permission, professional authority, or specialist skills are required. We manage the controls, so you get clarity on who does what, who is responsible, and how we are paid.
            </DarkHero>
            <PsBody>
                <form className="grid gap-5 lg:grid-cols-12" onSubmit={(e) => { e.preventDefault(); form.post('/partner-services/request'); }}>
                    <div className="space-y-5 lg:col-span-9">
                        <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white px-4 py-3 text-sm">
                            <Info className="size-4 text-gold-600" aria-hidden="true" /><span className="flex-1"><strong>Before you start:</strong> This form captures the essentials only. You will see scope, fees, contracting parties and responsibilities before you commit.</span>
                            {listing && <span className="rounded bg-gold-50 px-2 py-1 text-xs">Service: {listing.title}</span>}
                            <span className="text-xs text-ink-500">All fields marked * are required.</span>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            <Card number={1} title="About Your Request">
                                <div className="space-y-4">
                                    {sel('category', 'What do you need help with?', options.categories)}
                                    <Field label="Brief description of your request" required hint={`${form.data.description.length} / 1000`} error={form.errors.description}>{(id) => <Textarea id={id} maxLength={1000} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Provide a short summary of the matter, objective and what you need reviewed or signed." />}</Field>
                                    {sel('outcome', 'Desired outcome', options.outcomes)}
                                    {sel('timeline', 'Target timeline', options.timelines)}
                                </div>
                            </Card>
                            <Card number={2} title="Jurisdiction & Profession">
                                <div className="space-y-4">
                                    {sel('country', 'Country of matter', options.countries)}
                                    {sel('jurisdiction', 'Jurisdiction of practice', options.countries)}
                                    {sel('profession', 'Primary profession required', options.professions)}
                                    <Field label="Specialisation (optional)">{(id) => <Input id={id} value={form.data.specialisation} onChange={(e) => form.setData('specialisation', e.target.value)} placeholder="e.g. Tax Advisory, Environmental Law" />}</Field>
                                    {sel('output', 'Expected professional output', options.outputs)}
                                    {sel('intended_use', 'Intended use of output', options.uses)}
                                </div>
                            </Card>
                            <Card number={3} title="Parties & Context">
                                <div className="space-y-4">
                                    {sel('role', 'You are', options.roles)}
                                    {sel('act_for', 'You act for', options.actFor)}
                                    <Field label="Client organisation (if applicable)">{(id) => <Input id={id} value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} placeholder="Enter organisation name" />}</Field>
                                    <Field label="Matter reference (optional)">{(id) => <Input id={id} value={form.data.matter_reference} onChange={(e) => form.setData('matter_reference', e.target.value)} placeholder="Enter internal reference" />}</Field>
                                    <Field label="Additional parties (optional)" hint={`${form.data.parties.length} / 500`}>{(id) => <Textarea id={id} maxLength={500} value={form.data.parties} onChange={(e) => form.setData('parties', e.target.value)} placeholder="List any relevant third parties or stakeholders." />}</Field>
                                </div>
                            </Card>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Save &amp; Continue</Button>
                            <Button type="button" variant="outline" onClick={() => router.post('/partner-services/request', { ...form.data, save_draft: 1 }, { preserveScroll: true })}><Save className="size-4" aria-hidden="true" />Save as Draft</Button>
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" />Your information is secure and confidential.</p>
                        </div>
                    </div>
                    <aside className="space-y-4 lg:col-span-3">
                        <Card tone="dark" title="Your Request Progress">
                            <ol className="space-y-2.5 text-sm">{steps.map((s, i) => <li key={s} className="flex items-center gap-2"><span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-bold', i === 0 ? 'bg-gold-500 text-ink-900' : 'bg-ink-800 text-ink-300')}>{i + 1}</span><span className={i === 0 ? 'text-parchment-100' : 'text-ink-300'}>{s}</span>{i === 0 && <span className="ml-auto text-xs text-gold-400">You are here</span>}</li>)}</ol>
                        </Card>
                        <Card tone="cream" title="Need Help?">
                            <p className="text-sm text-ink-600">Our team is here to help you complete your request accurately.</p>
                            <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Partner review intake', section: 'partner-services' })}><UserRound className="size-4" aria-hidden="true" />Ask a Human Advisor</Button>
                        </Card>
                    </aside>
                </form>
            </PsBody>
        </>
    );
}
