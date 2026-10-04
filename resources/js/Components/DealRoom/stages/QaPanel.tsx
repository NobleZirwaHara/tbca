import { router, useForm } from '@inertiajs/react';
import { FileText, Send, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import type { RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { Empty, Gauge, Stat } from '../Ui';

interface Question {
    id: number;
    question: string;
    answer: string | null;
    sources: { name: string; folder: string; page: number }[];
    confidence: number | null;
    status: 'open' | 'answered' | 'escalated';
    askedBy: string;
    answeredBy: string | null;
    at: string;
}

interface QaData {
    questions: Question[];
    stats: { asked: number; answered: number; high: number; medium: number; low: number; escalated: number; open: number };
    suggested: string[];
}

/** Stage 5: source-grounded Q&A with citations, confidence labels and human escalation. */
export default function QaPanel({ room, data }: { room: RoomHeader; data: QaData }) {
    const form = useForm({ question: '' });
    const [selected, setSelected] = useState<number | null>(data.questions[0]?.id ?? null);
    const [reply, setReply] = useState('');
    const current = data.questions.find((q) => q.id === selected) ?? data.questions[0];
    const ask = (q?: string) => {
        if (q) form.setData('question', q);
        form.transform((d) => ({ question: q ?? d.question }));
        form.post(roomUrl(room.slug, 'questions'), { preserveScroll: true, onSuccess: () => form.reset() });
    };
    const update = (id: number, action: string, answer?: string) => router.patch(roomUrl(room.slug, `questions/${id}`), { action, answer }, { preserveScroll: true, onSuccess: () => setReply('') });
    const avg = data.questions.filter((q) => q.confidence).reduce((a, q, _, arr) => a + (q.confidence ?? 0) / arr.length, 0);

    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5">
                <Panel title="Query Assistant">
                    <p className="mb-2 text-xs text-ink-500">Ask a question in natural language. AI searches only authorised documents and cites sources.</p>
                    <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex gap-2">
                        <label className="sr-only" htmlFor="qa-input">Question</label>
                        <input id="qa-input" value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} placeholder={`Ask a question about the ${room.name} data room…`} className="h-10 min-w-0 flex-1 rounded-[4px] border border-parchment-500 px-3 text-sm focus:border-gold-500 focus:outline-none" />
                        <Button type="submit" size="sm" variant="ink" disabled={form.processing || form.data.question.length < 8} aria-label="Ask"><Send className="size-4" /></Button>
                    </form>
                    {form.errors.question && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.question}</p>}
                    <p className="mt-3 mb-1 text-xs font-bold text-ink-900 uppercase">Suggested questions</p>
                    <ul className="space-y-1">
                        {data.suggested.map((s) => <li key={s}><button type="button" onClick={() => ask(s)} className="text-left text-xs text-controlled-700 hover:underline">{s}</button></li>)}
                    </ul>
                </Panel>
                <Panel title="AI Search Settings">
                    <ul className="space-y-1 text-xs text-ink-700">
                        <li>Search scope: <strong>Authorised folders only</strong></li><li>Answer depth: <strong>Standard</strong></li><li>Citations: <strong>Always show sources</strong></li><li>Sensitive topics: <strong>Human review</strong></li>
                    </ul>
                </Panel>
            </div>
            <Panel title="AI Answer" className="lg:col-span-1" action={current ? <StatusPill status={current.status === 'answered' ? 'verified' : current.status} /> : undefined}>
                {!current ? <Empty>No questions yet. Ask the first one.</Empty> : (
                    <div className="space-y-3 text-[0.8125rem]">
                        <p className="font-semibold text-ink-900">{current.question}</p>
                        <p className="text-xs text-ink-400">Asked by {current.askedBy} · {current.at}</p>
                        {current.answer ? <p className="text-ink-700">{current.answer}</p> : <p className="rounded bg-attested-50 p-2 text-xs text-attested-700">No authorised source found — escalated to the deal team. (No source, no answer.)</p>}
                        {current.sources.length > 0 && (
                            <div>
                                <p className="mb-1 text-xs font-bold uppercase">Sources</p>
                                <ul className="space-y-1">
                                    {current.sources.map((s, i) => <li key={i} className="flex items-center gap-2 rounded border border-parchment-400 p-2 text-xs"><FileText className="size-4 text-risk-500" aria-hidden /><span className="flex-1">{i + 1}. {s.name}<span className="block text-ink-400">/{s.folder}/</span></span><span>Page {s.page}</span></li>)}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs text-ink-500">Confidence: {current.confidence ?? 0}% · {current.answeredBy ?? 'Awaiting answer'}</p>
                        {room.manages && current.status !== 'answered' && (
                            <form onSubmit={(e) => { e.preventDefault(); update(current.id, 'answer', reply); }} className="space-y-2 border-t border-parchment-300 pt-3">
                                <label htmlFor="human-answer" className="text-xs font-semibold">Human answer</label>
                                <textarea id="human-answer" value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-20 w-full rounded border border-parchment-500 p-2 text-sm" />
                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit" size="sm" disabled={!reply}><UserCheck className="size-4" aria-hidden /> Publish answer</Button>
                                    {current.answer && <Button type="button" size="sm" variant="outline" onClick={() => update(current.id, 'approve')}>Approve AI draft</Button>}
                                </div>
                            </form>
                        )}
                        {room.manages && current.status === 'answered' && <Button type="button" size="sm" variant="outline" onClick={() => update(current.id, 'escalate')}>Request human review</Button>}
                    </div>
                )}
            </Panel>
            <div className="space-y-5">
                <Panel title="Answer Confidence">
                    <div className="flex items-center gap-4">
                        <Gauge value={Math.round(avg)} label={avg >= 80 ? 'High' : avg >= 50 ? 'Medium' : 'Low'} />
                        <ul className="space-y-1 text-xs"><li>High (80–100%): <strong>{data.stats.high}</strong></li><li>Medium (50–79%): <strong>{data.stats.medium}</strong></li><li>Low (0–49%): <strong>{data.stats.low}</strong></li></ul>
                    </div>
                </Panel>
                <Panel title="Q&A Activity">
                    <div className="grid grid-cols-2 gap-2"><Stat label="Questions Asked" value={data.stats.asked} /><Stat label="Answered" value={data.stats.answered} tone="good" /><Stat label="Open" value={data.stats.open} tone="warn" /><Stat label="Escalated" value={data.stats.escalated} tone={data.stats.escalated ? 'bad' : 'neutral'} /></div>
                </Panel>
                <Panel title="Question Log">
                    <ul className="max-h-72 space-y-1 overflow-y-auto">
                        {data.questions.map((q) => (
                            <li key={q.id}><button type="button" onClick={() => setSelected(q.id)} className={`w-full rounded px-2 py-1.5 text-left text-xs ${q.id === current?.id ? 'bg-gold-50 font-semibold' : 'hover:bg-parchment-200'}`}><span className="line-clamp-1">{q.question}</span><StatusPill status={q.status} /></button></li>
                        ))}
                    </ul>
                </Panel>
            </div>
        </div>
    );
}
