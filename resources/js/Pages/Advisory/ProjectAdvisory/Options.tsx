import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Modal } from '@/Components/ui/Kit';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { CheckList, PageTitle } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Opt { key: string; name: string; badge: string; tone: string; icon: string; body: string; subtitle?: string; values: string[]; detail: string }
interface Props { data: { rows: string[]; options: Opt[]; included: string[] }; selected: string }

const badgeTone: Record<string, string> = { good: 'bg-verified-50 text-verified-700', info: 'bg-controlled-50 text-controlled-700', bad: 'bg-risk-50 text-risk-700', gold: 'bg-referenced-50 text-referenced-700' };

export default function Options({ data, selected }: Props) {
    const [choice, setChoice] = useState(selected);
    const [detail, setDetail] = useState<Opt | null>(null);
    const [compare, setCompare] = useState(false);
    const select = () => router.post('/project-advisory/engagement-options', { route: choice });
    return (
        <div className="container-tbca py-8">
            <Head title="Choose Your Engagement Architecture" />
            <PageTitle
                crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Engagement Options' }]}
                title="Choose Your Engagement Architecture"
                sub={<><p className="text-lg font-semibold text-gold-700">Transparent options. Clear economics. You approve before we commit.</p><p>Each architecture defines how we work with you, how we are paid, and what happens if you stop. All fees are shown separately by ledger (T, P, X, S, C). You approve each gate before we proceed.</p></>}
                actions={<ButtonLink href="/project-advisory" variant="outline">← Back to Services</ButtonLink>}
            />
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Engagement architecture">
                        {data.options.map((o) => (
                            <article key={o.key} className={cn('flex flex-col rounded-[8px] border bg-white p-4', choice === o.key ? 'border-gold-500 ring-2 ring-gold-400' : 'border-parchment-400')}>
                                <button type="button" role="radio" aria-checked={choice === o.key} onClick={() => setChoice(o.key)} className="text-left">
                                    <div className="flex items-start gap-2">
                                        <AdvIcon name={o.icon} className="size-8 text-gold-600" />
                                        <div>
                                            <h2 className="font-serif text-lg font-semibold">{o.name}</h2>
                                            <span className={cn('rounded px-1.5 text-[0.6875rem] font-semibold', badgeTone[o.tone])}>{o.badge}</span>
                                        </div>
                                    </div>
                                    {o.subtitle && <p className="mt-1 text-xs font-semibold text-risk-700">{o.subtitle}</p>}
                                    <p className="mt-2 text-xs text-ink-600">{o.body}</p>
                                </button>
                                <dl className="mt-3 flex-1 space-y-1 text-[0.6875rem]">
                                    {data.rows.map((r, i) => <div key={r} className="flex justify-between gap-2 border-b border-parchment-200 pb-1"><dt className="text-ink-500">{r}</dt><dd className="text-right font-medium">{o.values[i]}</dd></div>)}
                                </dl>
                                <button type="button" onClick={() => setDetail(o)} className="mt-3 rounded border border-gold-500 py-1.5 text-xs font-semibold">View Full Details →</button>
                            </article>
                        ))}
                    </div>
                    <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3"><ShieldCheck className="size-8 text-gold-700" /><div><p className="font-semibold">Transparent. Ethical. Client-First.</p><p className="text-xs text-ink-600">No surprises. You approve before we charge. You decide how we work together.</p></div></div>
                        <div className="flex gap-2"><Button variant="outline" onClick={() => setCompare(true)}>Compare All Options</Button><Button onClick={select} trailingIcon="arrow-right">Select Engagement Route</Button></div>
                    </div>
                </div>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4"><h2 className="text-sm font-semibold">What&rsquo;s Included in Every Option</h2><CheckList className="mt-2" items={data.included} /></div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><p className="font-semibold">Compare Options Side-by-Side</p><p className="text-xs text-ink-500">Use the comparison tool to evaluate fee exposure, stop position, and commitments across all options.</p><Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setCompare(true)}>Compare Options →</Button></div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm"><p className="font-semibold">Need Help Choosing?</p><p className="text-xs text-ink-500">Speak to a TBCA Advisor to identify the best engagement route for your project.</p><ButtonLink href="/project-advisory/discovery" size="sm" className="mt-2 w-full">Speak to an Advisor</ButtonLink><Link href="/contact" className="mt-2 block text-center text-xs underline">Book a Discovery Call</Link></div>
                </aside>
            </div>
            <Modal open={detail !== null} onClose={() => setDetail(null)} title={detail?.name ?? ''} footer={detail && <Button onClick={() => { setChoice(detail.key); setDetail(null); }}>Choose {detail.name}</Button>}>
                <p className="text-sm text-ink-700">{detail?.detail}</p>
            </Modal>
            <Modal open={compare} onClose={() => setCompare(false)} title="Compare engagement architectures" size="xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead><tr><th className="p-2 text-left">Dimension</th>{data.options.map((o) => <th key={o.key} className="p-2 text-left">{o.name}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">{data.rows.map((r, i) => <tr key={r}><th className="p-2 text-left font-semibold">{r}</th>{data.options.map((o) => <td key={o.key} className="p-2">{o.values[i]}</td>)}</tr>)}</tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
}
