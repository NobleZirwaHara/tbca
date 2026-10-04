import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { Card, DdHero, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdJourneyStep } from '@/types/due-diligence';

interface Props {
    cases: { reference: string; name: string; package: string; status: string; statusLabel: string; step: number; slaDueAt: string | null; actions: number; isSample: boolean; updatedAt: string }[];
    quotes: { reference: string; family: string; package: string; status: string; step: number; total: number | null; updatedAt: string }[];
    journey: DdJourneyStep[];
}

/** My Due Diligence Cases (portal area) with open quotes. */
export default function CasesIndex({ cases, quotes, journey }: Props) {
    return (
        <>
            <Head title="My Due Diligence Cases" />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'My Cases' }]}
                title="My Due Diligence Cases"
                subtitle="Track cases, consents, evidence, reviews, reports and monitoring."
                description="Cases open only after verified payment. Quotes keep your scope, consent and fee manifest until you are ready to pay."
                journey={journey}
                current={3}
            >
                <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink href="/due-diligence/services" trailingIcon="arrow-right">Start a New Case</ButtonLink>
                    <ButtonLink href="/due-diligence/enterprise/dashboard" variant="outline-light">Enterprise Dashboard</ButtonLink>
                </div>
            </DdHero>
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-6">
                    <Card title={`Cases (${cases.length})`}>
                        {cases.length === 0 ? (
                            <div className="py-8 text-center text-sm text-ink-500">
                                <FolderOpen className="mx-auto mb-2 size-8 text-ink-300" aria-hidden="true" />
                                No cases yet. Choose a service to start your first quote.
                            </div>
                        ) : (
                            <ul className="divide-y divide-parchment-300">
                                {cases.map((c) => (
                                    <li key={c.reference}>
                                        <Link href={`/due-diligence/cases/${c.reference}`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-parchment-100">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-ink-900">{c.name} {c.isSample && <span className="ml-1 rounded bg-gold-100 px-1.5 text-[0.625rem] font-bold text-gold-800">SAMPLE</span>}</p>
                                                <p className="text-xs text-ink-500"><span className="font-mono">{c.reference}</span> · {c.package} · Step {c.step} of 7 · SLA {shortDate(c.slaDueAt)}</p>
                                            </div>
                                            <StatusPill status={c.statusLabel} />
                                            {c.actions > 0 && <span className="rounded-full bg-attested-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-attested-700">{c.actions} action(s)</span>}
                                            <ArrowRight className="size-4 text-ink-400" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card title={`Open quotes (${quotes.length})`}>
                        {quotes.length === 0 ? <p className="text-sm text-ink-500">No open quotes.</p> : (
                            <ul className="divide-y divide-parchment-300">
                                {quotes.map((q) => (
                                    <li key={q.reference}>
                                        <Link href={`/due-diligence/quotes/${q.reference}`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-parchment-100">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">{q.package}</p>
                                                <p className="text-xs text-ink-500"><span className="font-mono">{q.reference}</span> · {q.family} · step {q.step} of 9 · updated {shortDate(q.updatedAt)}</p>
                                            </div>
                                            {q.total !== null && <span className="text-sm font-semibold">{rand(q.total, 2)}</span>}
                                            <StatusPill status={q.status} />
                                            <span className="text-xs font-semibold text-gold-700">Resume</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </section>
        </>
    );
}
