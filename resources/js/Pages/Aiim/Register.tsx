import { Link, useForm } from '@inertiajs/react';
import { Bell, Bookmark, Lock, Mail, MessageCircle, Phone, Scale, Share2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { RailBox } from '@/Components/Aiim/Shell';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    step: number;
    data: Record<string, Record<string, string | boolean>>;
    options: { interests: string[]; heard: string[]; orgTypes: string[]; provinces: { slug: string; name: string }[]; sectors: { slug: string; name: string }[] };
}

function Step1({ data, options }: Pick<Props, 'data' | 'options'>) {
    const s = data.step1 ?? {};
    const form = useForm({ name: (s.name as string) ?? '', email: (s.email as string) ?? '', password: '', password_confirmation: '', interest: (s.interest as string) ?? '', heard: (s.heard as string) ?? '', terms: false, marketing: Boolean(s.marketing) });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/register/1'); };
    return (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
            <div className="space-y-3">
                <h3 className="font-semibold">Account Details</h3>
                <p className="text-xs text-ink-500">All fields are required.</p>
                <Field label="Full Name" error={form.errors.name} required>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Nomsa Dlamini" autoComplete="name" />}</Field>
                <Field label="Email Address" error={form.errors.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="e.g. nomsa.dlamini@company.co.za" autoComplete="email" />}</Field>
                <Field label="Password" error={form.errors.password} hint="At least 8 characters with letters and numbers" required>{(id) => <Input id={id} type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} placeholder="Create a strong password" autoComplete="new-password" />}</Field>
                <Field label="Confirm Password" required>{(id) => <Input id={id} type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" />}</Field>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold">Account Preferences</h3>
                <Field label="Primary Interest" error={form.errors.interest} required>{(id) => <Select id={id} value={form.data.interest} onChange={(e) => form.setData('interest', e.target.value)} options={options.interests} placeholder="Select your primary interest" />}</Field>
                <Field label="How did you hear about AIIM?" error={form.errors.heard}>{(id) => <Select id={id} value={form.data.heard} onChange={(e) => form.setData('heard', e.target.value)} options={options.heard} placeholder="Select an option" />}</Field>
                <Checkbox checked={form.data.terms} onChange={(e) => form.setData('terms', e.target.checked)} label={<>I confirm that I am over 18 years old and agree to the <Link href="/legal/terms" className="text-gold-700 underline">Terms of Use</Link> and <Link href="/legal/privacy" className="text-gold-700 underline">Privacy Policy</Link>.</>} />
                {form.errors.terms && <p role="alert" className="text-xs text-risk-500">{form.errors.terms}</p>}
                <Checkbox checked={form.data.marketing} onChange={(e) => form.setData('marketing', e.target.checked)} label="I agree to receive important updates and communications from The Business Clinic.Africa™ and AIIM." />
                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right" className="w-full">Continue to Profile &amp; Organisation</Button>
            </div>
        </form>
    );
}

function Step2({ data, options }: Pick<Props, 'data' | 'options'>) {
    const s = data.step2 ?? {};
    const form = useForm({ company: (s.company as string) ?? '', job_title: (s.job_title as string) ?? '', org_type: (s.org_type as string) ?? '', phone: (s.phone as string) ?? '', province: (s.province as string) ?? '', sector: (s.sector as string) ?? '' });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/register/2'); };
    return (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
            <Field label="Organisation" error={form.errors.company} required>{(id) => <Input id={id} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} autoComplete="organization" />}</Field>
            <Field label="Job Title" error={form.errors.job_title} required>{(id) => <Input id={id} value={form.data.job_title} onChange={(e) => form.setData('job_title', e.target.value)} />}</Field>
            <Field label="Organisation Type" error={form.errors.org_type} required>{(id) => <Select id={id} value={form.data.org_type} onChange={(e) => form.setData('org_type', e.target.value)} options={options.orgTypes} placeholder="Select type" />}</Field>
            <Field label="Phone Number" error={form.errors.phone} required>{(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+27 82 123 4567" autoComplete="tel" />}</Field>
            <Field label="Province of Interest" error={form.errors.province} required>{(id) => <Select id={id} value={form.data.province} onChange={(e) => form.setData('province', e.target.value)} options={options.provinces.map((p) => ({ value: p.slug, label: p.name }))} placeholder="Select province" />}</Field>
            <Field label="Sector Focus" error={form.errors.sector} required>{(id) => <Select id={id} value={form.data.sector} onChange={(e) => form.setData('sector', e.target.value)} options={options.sectors.map((p) => ({ value: p.slug, label: p.name }))} placeholder="Select sector" />}</Field>
            <div className="flex gap-3 md:col-span-2">
                <ButtonLink href="/aiim/register/1" variant="outline">Back</ButtonLink>
                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Continue to Verification</Button>
            </div>
        </form>
    );
}

function Step3() {
    const form = useForm({ id_type: '', id_number: '', popia: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/register/3'); };
    return (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
            <Field label="Identity Document Type" error={form.errors.id_type} required>{(id) => <Select id={id} value={form.data.id_type} onChange={(e) => form.setData('id_type', e.target.value)} options={['South African ID', 'Passport', 'Company Registration']} placeholder="Select document" />}</Field>
            <Field label="Document Number" error={form.errors.id_number} hint="Used only for identity verification (human-in-the-loop review)." required>{(id) => <Input id={id} value={form.data.id_number} onChange={(e) => form.setData('id_number', e.target.value)} />}</Field>
            <div className="md:col-span-2">
                <Checkbox checked={form.data.popia} onChange={(e) => form.setData('popia', e.target.checked)} label="I consent to TBCA processing my personal information for AIIM account, verification and service purposes under POPIA." />
                {form.errors.popia && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.popia}</p>}
            </div>
            <div className="flex gap-3 md:col-span-2">
                <ButtonLink href="/aiim/register/2" variant="outline">Back</ButtonLink>
                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Create Free Account</Button>
            </div>
        </form>
    );
}

export default function Register({ step, data, options }: Props) {
    return (
        <AiimPage
            title="AIIM Registration"
            crumbs={[{ label: 'Registration' }]}
            heading={<>AIIM Registration <UserCheck className="size-7 text-gold-600" /></>}
            description={<>Create your AIIM account to access free intelligence, save items and collaborate securely. Already have an account? <Link href="/login" className="font-semibold text-risk-500">Sign in</Link></>}
            rail={<><SelectionBox /><RailBox title="Why Create an Account?"><p className="mb-3 text-xs text-ink-300">Unlock the full power of AIIM and personalise your investment intelligence experience.</p><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="w-full">Speak to an Advisor</ButtonLink></RailBox></>}
        >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem_14rem]">
                <SectionCard>
                    <Stepper steps={['Account Details', 'Profile & Organisation', 'Verification']} current={step} className="mb-6" />
                    {step === 1 && <Step1 data={data} options={options} />}
                    {step === 2 && <Step2 data={data} options={options} />}
                    {step === 3 && <Step3 />}
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-400"><Lock className="size-3" />Your information is secure and will never be shared without your consent.</p>
                </SectionCard>
                <SectionCard title="Your AIIM Account Includes">
                    <ul className="space-y-3 text-xs">
                        {[[Sparkles, 'Free Access', 'Access curated, human-reviewed intelligence at no cost.'], [Bookmark, 'Saved Items', 'Save opportunities, projects, investors and more.'], [Scale, 'Compare & Analyse', 'Compare up to 4 items across key metrics.'], [Share2, 'Export & Share', 'Export results and share with your team or advisors.'], [Bell, 'Notifications', 'Stay updated on new opportunities and market insights.']].map(([I, t, d]) => {
                            const Icon = I as typeof Bell;
                            return <li key={t as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-gold-600" /><span><strong className="block text-ink-900">{t as string}</strong>{d as string}</span></li>;
                        })}
                    </ul>
                    <p className="mt-3 border-t border-parchment-300 pt-3 text-xs text-ink-500">Upgrade anytime for premium reports, advanced analytics and expert support.</p>
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard title="Secure & Verified">
                        <ul className="space-y-2 text-xs">{['256-bit SSL Encryption', 'Identity Verification', 'SOC 2 Type II Standards', 'Human-in-the-Loop Review'].map((t) => <li key={t} className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-600" />{t}</li>)}</ul>
                    </SectionCard>
                    <SectionCard title="Need Help?">
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-center gap-2"><MessageCircle className="size-4 text-gold-600" />WhatsApp / Talk</li>
                            <li className="flex items-center gap-2"><Mail className="size-4 text-gold-600" />help@thebusinessclinic.africa</li>
                            <li className="flex items-center gap-2"><Phone className="size-4 text-gold-600" />Request a Call Back</li>
                        </ul>
                    </SectionCard>
                </div>
            </div>
        </AiimPage>
    );
}
