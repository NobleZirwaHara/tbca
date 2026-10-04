import { useForm } from '@inertiajs/react';
import { Brain, CheckCircle2, FileText, Info, Scale } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';

export default function Limitations() {
    const form = useForm({ section: 'resources', subject: 'Content issue report', resource: '', details: '', email: '', redirect: '/resources/limitations' });
    const cols: [string, typeof Info, string, string, string[], string, string][] = [
        ['1. Limitation of Use', Info, 'border-controlled-500/30 bg-controlled-50', 'The resources and insights on this site are provided for information purposes only.', ['They do not constitute legal, tax, accounting, financial or investment advice.', 'You should seek independent professional advice for your specific situation.', 'While we strive for accuracy, we make no warranties about completeness or currentness.', 'You use this information at your own risk.'], 'View Full Terms of Use', '/resources/value-exchange'],
        ['2. AI-Generated Content', Brain, 'border-verified-500/30 bg-verified-50', 'Some content on this platform is generated or assisted by artificial intelligence.', ['AI helps us draft, structure and translate content.', 'Human experts review, verify and approve all published material.', 'We clearly label AI-assisted content where applicable.', 'Our goal is accuracy, clarity and decision-useful information.'], 'Learn More About Our AI Process', '/resources/content-status'],
        ['3. Source Integrity', FileText, 'border-purple-300 bg-purple-50', 'We use trusted, reputable and publicly available sources wherever possible.', ['Sources are cited to help you verify information.', 'Some content includes third-party data under licence.', "We respect all data providers' terms and intellectual property rights.", 'If you spot an issue, please let us know.'], 'Our Data Sources', '/resources/data-statement'],
    ];
    return (
        <ResourceFrame title="Limitation / AI / Source Block" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Limitation / AI / Source Block' }]}>
            <PageTitle title="Limitation / AI / Source Block" intro="Transparency builds trust. Please read the following important information about how we create and present content." />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {cols.map(([t, I, tone, intro, items, cta, href]) => (
                    <section key={t} className={`rounded-[8px] border p-5 ${tone}`}>
                        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><I className="size-6" />{t}</h2>
                        <p className="mt-2 text-sm text-ink-700">{intro}</p>
                        <ul className="mt-3 space-y-2 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" />{i}</li>)}</ul>
                        <Link href={href} className="mt-4 inline-block text-sm font-semibold">{cta} →</Link>
                    </section>
                ))}
            </div>
            <Box className="mt-5" tone="amber">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                    <div className="flex gap-3"><Scale className="size-10 text-gold-700" /><div><h2 className="font-serif text-xl font-semibold text-gold-800">Our Commitment</h2><p className="text-sm">We are committed to responsible information sharing, ethical AI use, and continuous improvement. Thank you for helping us maintain a trustworthy knowledge platform for Africa.</p></div></div>
                    <form onSubmit={(e) => { e.preventDefault(); form.post('/forms/content-issue', { preserveScroll: true, onSuccess: () => form.reset('details', 'resource') }); }} className="grid gap-2 sm:grid-cols-2">
                        <Field label="Resource or page">{(id) => <Input id={id} value={form.data.resource} onChange={(e) => form.setData('resource', e.target.value)} />}</Field>
                        <Field label="Your email (optional)">{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                        <Field label="What is the issue?" className="sm:col-span-2">{(id) => <Textarea id={id} required value={form.data.details} onChange={(e) => form.setData('details', e.target.value)} />}</Field>
                        <button type="submit" disabled={form.processing || !form.data.details} className="rounded border border-gold-500 bg-white px-4 py-2 text-sm font-semibold text-gold-800 disabled:opacity-50 sm:col-span-2">Report an Issue →</button>
                    </form>
                </div>
            </Box>
        </ResourceFrame>
    );
}
