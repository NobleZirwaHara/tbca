import { Head, Link } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { PageTitle, Tracker } from '@/Components/Advisory/ui';
import type { MandateView } from '@/types/advisory';

export default function WorkspaceIndex({ mandates }: { mandates: MandateView[] }) {
    return (
        <div className="container-tbca py-8">
            <Head title="My Project Advisory Mandates" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Workspace' }]} title="My Project Advisory Mandates" sub="Every mandate, its current gate and your next decision." actions={<ButtonLink href="/project-advisory/discovery" trailingIcon="arrow-right">New Project Intake</ButtonLink>} />
            <div className="space-y-4">
                {mandates.map((m) => (
                    <article key={m.reference} className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-mono text-xs text-ink-500">{m.reference}</p>
                                <h2 className="font-serif text-xl font-semibold"><Link href={`/project-advisory/workspace/${m.reference}`} className="hover:text-gold-700">{m.project}</Link></h2>
                                <p className="text-sm text-ink-600">{m.organisation} · {m.sector} · {m.stage}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2"><StatusPill status={m.status} />{m.gate && <StatusPill status={`Gate ${m.gate}`} tone="gold" />}</div>
                        </div>
                        <Tracker className="mt-4" items={m.lifecycle} />
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded bg-gold-50 px-3 py-2 text-sm">
                            <span><b>Next action ({m.next.who}):</b> {m.next.label}</span>
                            {m.next.href ? <Link href={m.next.href} className="font-semibold text-gold-700 underline">Continue →</Link> : <Link href={`/project-advisory/workspace/${m.reference}`} className="font-semibold text-gold-700 underline">Open workspace →</Link>}
                        </div>
                    </article>
                ))}
                {mandates.length === 0 && <p className="rounded-[8px] border border-parchment-400 bg-white p-8 text-center text-sm text-ink-500">No mandates yet. <Link href="/project-advisory/discovery" className="underline">Submit a project intake</Link> to begin.</p>}
            </div>
        </div>
    );
}
