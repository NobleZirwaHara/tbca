import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FolderLock, Mail, Plus } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Panel, Progress, StatusPill } from '@/Components/ui/Kit';

interface Props {
    rooms: { slug: string; reference: string; name: string; company: string; status: string; stage: string; stageName: string; progress: number; role: string }[];
    invites: { token: string; room: string; role: string; expires: string | null }[];
}

/** VDR lobby: rooms the signed-in user owns or is an active party to, plus pending invitations. */
export default function Rooms({ rooms, invites }: Props) {
    return (
        <>
            <Head title="My Deal Rooms" />
            <section className="bg-ink-950 text-parchment-100">
                <div className="container-tbca flex flex-wrap items-end justify-between gap-4 py-8">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-gold-400 uppercase">Virtual Deal Room</p>
                        <h1 className="mt-1 font-serif text-3xl font-bold">My Deal Rooms</h1>
                        <p className="mt-1 text-sm text-ink-200">Every room you own or have been invited into, with its current stage gate.</p>
                    </div>
                    <ButtonLink href="/virtual-deal-room/enquiry"><Plus className="size-4" aria-hidden /> Start a Deal Room</ButtonLink>
                </div>
            </section>
            <div className="bg-parchment-200 py-8">
                <div className="container-tbca space-y-5">
                    {invites.length > 0 && (
                        <Panel title="Pending Invitations">
                            <ul className="divide-y divide-parchment-300">
                                {invites.map((i) => (
                                    <li key={i.token} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                                        <Mail className="size-4 text-gold-600" aria-hidden />
                                        <span className="flex-1"><strong>{i.room}</strong> — invited as {i.role}{i.expires ? ` · expires ${i.expires}` : ''}</span>
                                        <Link href={`/virtual-deal-room/invitations/${i.token}`} className="rounded bg-gold-500 px-3 py-1 text-xs font-semibold text-ink-900">Accept</Link>
                                        <Link href={`/virtual-deal-room/invitations/${i.token}?decline=1`} className="text-xs text-ink-500 underline">Decline</Link>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    )}
                    {rooms.length === 0 ? (
                        <Panel><div className="py-10 text-center"><FolderLock className="mx-auto mb-2 size-10 text-ink-300" aria-hidden /><p className="font-semibold">No deal rooms yet</p><p className="text-sm text-ink-500">Submit an enquiry to open your first room.</p></div></Panel>
                    ) : (
                        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {rooms.map((r) => (
                                <li key={r.slug}>
                                    <Link href={`/virtual-deal-room/rooms/${r.slug}`} className="block h-full rounded-[8px] border border-parchment-400 bg-white p-5 hover:border-gold-500 focus-visible:outline-2 focus-visible:outline-gold-500">
                                        <div className="flex items-start justify-between gap-2">
                                            <div><p className="text-xs text-ink-400">{r.reference}</p><p className="font-serif text-lg font-bold">{r.name}</p><p className="text-xs text-ink-500">{r.company} · {r.role}</p></div>
                                            <StatusPill status={r.status} />
                                        </div>
                                        <p className="mt-3 text-xs">Stage <strong>{r.stage}</strong>: {r.stageName}</p>
                                        <Progress value={r.progress} className="mt-2" />
                                        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">Enter room <ArrowRight className="size-3.5" aria-hidden /></p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
