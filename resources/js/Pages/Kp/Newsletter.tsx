import { useForm } from '@inertiajs/react';
import { btnClass } from '@/Components/Webinars/kit';
import { Box, Field, Input, KpPage, type KpShared } from '@/Components/Kp/kit';

const THEMES = ['Strategy & Execution', 'Capital & Funding', 'Governance & Boards', 'Project Development', 'Markets & Growth', 'Technology & AI'];

/** KP newsletter sign-up (explicit subscription only). */
export default function Newsletter({ screen, kpNav }: KpShared) {
    const form = useForm({ name: '', email: '', themes: [] as string[], frequency: 'monthly', consent: false, subject: 'KP newsletter subscription', section: 'kp' });
    return (
        <KpPage screen={screen} kpNav={kpNav} crumbs={[['Newsletter']]} title="KP Newsletter" subtitle="New insight when it publishes." intro="Founder's Notes, new insights and event invitations. No spam; unsubscribe at any time.">
            <Box title="Subscribe" icon="mail">
                <form className="grid max-w-2xl gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                    <Field label="Name"><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="Email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <fieldset className="sm:col-span-2">
                        <legend className="text-[0.8125rem] font-semibold text-ink-800">Themes you care about</legend>
                        <div className="mt-1 flex flex-wrap gap-3">{THEMES.map((t) => <label key={t} className="flex items-center gap-1.5 text-[0.8125rem]"><input type="checkbox" className="size-4 accent-gold-600" checked={form.data.themes.includes(t)} onChange={() => form.setData('themes', form.data.themes.includes(t) ? form.data.themes.filter((x) => x !== t) : [...form.data.themes, t])} />{t}</label>)}</div>
                    </fieldset>
                    <fieldset className="sm:col-span-2">
                        <legend className="text-[0.8125rem] font-semibold text-ink-800">Frequency</legend>
                        <div className="mt-1 flex gap-4 text-[0.8125rem]">{['weekly', 'monthly'].map((f) => <label key={f} className="flex items-center gap-1.5 capitalize"><input type="radio" className="accent-gold-600" checked={form.data.frequency === f} onChange={() => form.setData('frequency', f)} />{f}</label>)}</div>
                    </fieldset>
                    <label className="flex items-start gap-2 text-[0.8125rem] sm:col-span-2"><input required type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={form.data.consent} onChange={(e) => form.setData('consent', e.target.checked)} />I agree to receive the KP newsletter and accept the <a href="/policies" className="text-gold-700 underline">Privacy Policy</a>. I can unsubscribe at any time.</label>
                    <div><button type="submit" disabled={form.processing} className={btnClass('gold')}>Subscribe</button></div>
                </form>
            </Box>
        </KpPage>
    );
}
