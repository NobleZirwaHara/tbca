import { Head, Link } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { PageTitle, Tracker } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

export default function Index({ engagements }: { engagements: TechHeader[] }) {
    return (
        <div className="container-tbca py-8">
            <Head title="Technology Solutions Client Portal" />
            <PageTitle crumbs={[{ label: 'Technology Solutions', href: '/technology-solutions' }, { label: 'Client Portal' }]} title="Technology Solutions Client Portal" sub="Your active technology engagements, gates and next actions." actions={<ButtonLink href="/technology-solutions/context" trailingIcon="arrow-right">Start a new solution</ButtonLink>} />
            <div className="space-y-4">
                {engagements.map((e) => (
                    <article key={e.reference} className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div><p className="font-mono text-xs text-ink-500">{e.reference}</p><h2 className="font-serif text-xl font-semibold"><Link href={`/technology-solutions/workspace/${e.reference}`} className="hover:text-gold-700">{e.organisation} | {e.tower}</Link></h2><p className="text-sm text-ink-600">{e.stage_name} · {e.gate_label}</p></div>
                            <StatusPill status={e.status} />
                        </div>
                        <Tracker className="mt-4" items={e.tracker} />
                        {e.presented && <p className="mt-3 rounded bg-gold-50 px-3 py-2 text-sm">Gate {e.presented.number} — {e.presented.name} is ready for your approval. <Link href={`/technology-solutions/workspace/${e.reference}?gate=1`} className="font-semibold underline">Review gate →</Link></p>}
                    </article>
                ))}
                {engagements.length === 0 && <p className="rounded-[8px] border border-parchment-400 bg-white p-8 text-center text-sm text-ink-500">No engagements yet. <Link href="/technology-solutions/context" className="underline">Start your technology journey</Link>.</p>}
            </div>
        </div>
    );
}
