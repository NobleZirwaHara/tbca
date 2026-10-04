import { Link, useForm } from '@inertiajs/react';
import { Download, FileText, Gift, Info, RefreshCw, Shield, SlidersHorizontal, Undo2, User } from 'lucide-react';
import { Checkbox } from '@/Components/ui/Form';
import { AccessChip, Box, Chip, CurrentnessChip, Notice, label } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceBody, ResourceCard } from '@/types/insights';

interface Props {
    resource: ResourceCard & { version: string; language: string; body: ResourceBody };
    blocked: string | null;
    prefill: { email: string; firstName: string };
    held: { organisation: string | null; language: string };
}

function Row({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <section className="grid gap-3 border-b border-parchment-300 p-4 sm:grid-cols-[2rem_2rem_1fr] last:border-b-0">
            <span className="flex size-7 items-center justify-center rounded-full border border-gold-500 text-xs font-bold">{n}</span>
            <span className="text-gold-700">{icon}</span>
            <div><h2 className="text-xs font-bold tracking-wide uppercase">{title}</h2><div className="mt-2">{children}</div></div>
        </section>
    );
}

export default function Access({ resource: r, blocked, prefill, held }: Props) {
    const form = useForm({ email: prefill.email, first_name: prefill.firstName, opt_email: false, opt_whatsapp: false, opt_databank: false });
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(`/resources/${r.slug}/access`); };

    return (
        <ResourceFrame title={`Value Exchange – ${r.title}`} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Resource Library', href: '/resources/library' }, { label: r.title, href: r.url }, { label: 'Value Exchange' }]}>
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]" noValidate>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2"><Chip tone="dark">{label(r.type)}</Chip><AccessChip label={r.accessLabel} /><CurrentnessChip value={r.currentness} /></div>
                    <h1 className="font-serif text-3xl font-bold text-ink-900">Your Value Exchange</h1>
                    <p className="text-sm text-ink-600">Get the {r.title} with a clear, controlled exchange.</p>
                    {blocked && <Notice tone="red">{blocked}</Notice>}
                    <div className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs sm:grid-cols-5">
                        <p className="col-span-2 flex items-center gap-2 font-semibold"><FileText className="size-5 text-gold-700" />Get {r.title}</p>
                        <p><strong className="block">v{r.version}</strong>Version</p><p><strong className="block">{r.format}</strong>Format</p><p><strong className="block">{label(r.currentness)}</strong>Currentness · Instant access</p>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white">
                        <Row n={1} icon={<Gift className="size-5" />} title="You Get">
                            <ul className="grid gap-1 text-xs sm:grid-cols-2">{(r.body.get ?? ['Current version of the resource', 'Downloadable PDF', 'Source and review details', 'Library access record']).map((g) => <li key={g}>✓ {g}</li>)}</ul>
                        </Row>
                        <Row n={2} icon={<User className="size-5" />} title="You Give: Required Now">
                            <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr] sm:items-center">
                                <label htmlFor="ve-email" className="text-xs font-medium">Email address <span className="text-risk-500">*</span></label>
                                <input id="ve-email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="you@yourorganisation.com" className="h-9 rounded border border-parchment-500 px-2 text-sm" aria-invalid={!!form.errors.email} />
                                <span className="text-[0.6875rem] text-ink-500">Needed to deliver the resource and record access.</span>
                                <label htmlFor="ve-name" className="text-xs font-medium">First name <span className="text-risk-500">*</span></label>
                                <input id="ve-name" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} placeholder="Enter your first name" className="h-9 rounded border border-parchment-500 px-2 text-sm" aria-invalid={!!form.errors.first_name} />
                                <span className="text-[0.6875rem] text-ink-500">Used to personalise delivery.</span>
                            </div>
                            {(form.errors.email || form.errors.first_name) && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.email ?? form.errors.first_name}</p>}
                        </Row>
                        <Row n={3} icon={<RefreshCw className="size-5" />} title="Already Held and Reused">
                            <dl className="grid gap-1 text-xs sm:grid-cols-[8rem_1fr_1fr]"><dt>Organisation</dt><dd className="rounded bg-parchment-200 px-2 py-1">{held.organisation ?? 'Not held'}</dd><dd className="text-ink-500">Used to associate this access with your account.</dd><dt>Language preference</dt><dd className="rounded bg-parchment-200 px-2 py-1">{held.language}</dd><dd className="text-ink-500">Used to send the correct version.</dd></dl>
                        </Row>
                        <Row n={4} icon={<Shield className="size-5" />} title="Why / How Long">
                            <dl className="grid gap-1 text-xs sm:grid-cols-[8rem_1fr]"><dt>Purpose</dt><dd>To deliver the resource, maintain your access history, and support quality control.</dd><dt>Retention summary</dt><dd>Retained according to the current resource-access policy shown below.</dd></dl>
                        </Row>
                        <Row n={5} icon={<SlidersHorizontal className="size-5" />} title="Optional: Not Required">
                            <div className="space-y-1.5">
                                <Checkbox label={<>Email insights and updates <span className="text-ink-500">— Receive occasional insights and resource updates.</span></>} checked={form.data.opt_email} onChange={(e) => form.setData('opt_email', e.target.checked)} />
                                <Checkbox label={<>WhatsApp updates <span className="text-ink-500">— Receive updates and reminders via WhatsApp.</span></>} checked={form.data.opt_whatsapp} onChange={(e) => form.setData('opt_whatsapp', e.target.checked)} />
                                <Checkbox label={<>Data Bank contribution, only if relevant <span className="text-ink-500">— Share anonymised insights to improve future resources.</span></>} checked={form.data.opt_databank} onChange={(e) => form.setData('opt_databank', e.target.checked)} />
                            </div>
                            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500"><Info className="size-3.5" /> Optional choices do not affect access to this resource.</p>
                        </Row>
                        <Row n={6} icon={<FileText className="size-5" />} title="Policy and Disclosure">
                            <p className="text-xs">Privacy version: <Link href="/resources/data-statement" className="text-gold-700 underline">PV-Current</Link> · Disclosure version: <Link href="/resources/value-exchange" className="text-gold-700 underline">Ledger D vCurrent</Link></p>
                        </Row>
                    </div>
                </div>
                <aside className="space-y-4">
                    <Box title="Summary">
                        <div className="space-y-3 text-xs">
                            <div><p className="font-bold uppercase">You Get</p><ul className="mt-1 space-y-0.5"><li>• {r.title} (R0)</li><li>• {r.format}, current version</li><li>• Instant access and library record</li></ul></div>
                            <div><p className="font-bold uppercase">You Give</p><ul className="mt-1 space-y-0.5"><li>• Email address (required now)</li><li>• First name (required now)</li></ul></div>
                            <div><p className="font-bold uppercase">Optional</p><ul className="mt-1 space-y-0.5"><li>• Email insights and updates {form.data.opt_email ? '✓' : ''}</li><li>• WhatsApp updates {form.data.opt_whatsapp ? '✓' : ''}</li><li>• Data Bank contribution {form.data.opt_databank ? '✓' : ''}</li></ul></div>
                            <div><p className="flex items-center gap-1 font-bold uppercase"><Undo2 className="size-3.5" />Take It Back</p><ul className="mt-1 space-y-0.5"><li>• You can change optional permissions anytime.</li><li>• You can withdraw optional permissions at any time.</li><li>• Mandatory details are required to deliver this resource and maintain access history.</li></ul></div>
                        </div>
                        <button type="submit" disabled={form.processing || !!blocked} className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold-500 py-2.5 text-sm font-bold disabled:opacity-50"><Download className="size-4" /> Get My Resource</button>
                        <Link href="/resources/library" className="mt-2 block rounded border border-gold-400 py-2 text-center text-xs font-semibold">No thanks, continue browsing</Link>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">You can change or withdraw optional permissions later in the <Link href="/resources/preferences" className="underline">Preference Centre</Link>.</p>
                    </Box>
                    <Box title="What happens next"><ol className="list-decimal space-y-1 pl-4 text-xs"><li>Review the exchange details.</li><li>Receive the resource instantly.</li><li>Optional permissions are applied only if you choose them.</li></ol></Box>
                </aside>
            </form>
        </ResourceFrame>
    );
}
