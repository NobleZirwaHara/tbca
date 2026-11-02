import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { ADV, Banner, Btn, Chk, Dl, Fld, Flow, FormPanel, Panel, btn, eng, inputCls, type Country } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    mode: 'review' | 'sign';
    country: Country | null;
}

/** Pages 46 Engagement Letter Review and 47 Electronic Signature. */
export default function Letter(props: Props) {
    return props.mode === 'sign' ? <Sign {...props} /> : <Review {...props} />;
}

function LetterText({ e, country }: { e: Engagement; country: Country | null }) {
    const items = (e.quote?.items ?? []).map((i) => i.item.charAt(0).toLowerCase() + i.item.slice(1));
    const where = country?.name ?? 'the selected country';
    const pct = e.quote?.deposit_percent ?? 50;
    return (
        <div className="grid gap-2 rounded-[10px] border border-parchment-400 bg-parchment-50 p-5 text-[0.88rem] leading-relaxed text-ink-800">
            <h3 className="font-semibold text-ink-900">1. Scope</h3>
            <p>{e.title}: advisory for {where}{country?.isBw ? ' using the BW-1.0 evidence base' : ''}{items.length ? `: ${items.join('; ')}.` : '.'}</p>
            <h3 className="font-semibold text-ink-900">2. Citizen rules</h3>
            {country?.isBw
                ? <p>Advice will respect the Economic Inclusion Act 2021, citizen-reserved activities (June 2020 list) and procurement preferences (PPA s.74). Open gap DG-03 is disclosed.</p>
                : <p>Advice will respect the local-ownership, citizen-empowerment and procurement rules of {where}. Open gaps in the country evidence are disclosed during delivery.</p>}
            <h3 className="font-semibold text-ink-900">3. Fees</h3>
            <p>As per the formal quotation{e.quote?.number ? ` (${e.quote.number})` : ''}; {pct} % deposit, balance on acceptance of deliverables.</p>
            <h3 className="font-semibold text-ink-900">4. Data protection</h3>
            <p>POPIA and Botswana Data Protection Act aligned; ISO 27001 controls.</p>
        </div>
    );
}

function Review({ engagement: e, country }: Props) {
    const form = useForm({ read: false, data: false, decision: 'accept', accept: false, reason: '' });
    const [declining, setDeclining] = useState(false);
    const open = e.status === 'quote_accepted';
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.transform((d) => ({ ...d, decision: 'accept', accept: d.read && d.data ? 1 : 0 }));
        form.post(eng(e.reference, '/letter'));
    };
    const decline = () => {
        form.transform((d) => ({ ...d, decision: 'decline' }));
        form.post(eng(e.reference, '/letter'));
    };
    if (!open) {
        return (
            <Flow title="Engagement Letter Review" eyebrow="Page 46" steps={{ list: ADV, on: 3 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}>
                <Panel title="Engagement letter (AAB-EMB-231)">
                    <LetterText e={e} country={country} />
                    <p className="mt-3 text-[0.82rem] text-ink-600">Accepted {e.letterAcceptedAt ?? ''}.</p>
                    {e.next && <div className="mt-3"><Btn href={e.next.url}>{e.next.label}</Btn></div>}
                </Panel>
            </Flow>
        );
    }
    return (
        <Flow title="Engagement Letter Review" eyebrow="Page 46" steps={{ list: ADV, on: 3 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}
            side={<Banner>The letter records the scope, fees and terms of quotation {e.quote?.number ?? ''}. Signing follows on the next page.</Banner>}>
            <FormPanel title="Engagement letter (AAB-EMB-231)" submit="Proceed to e-signature" onSubmit={submit} processing={form.processing} back={eng(e.reference, '/quote')}
                extra={<button type="button" className={btn('danger')} onClick={() => setDeclining((x) => !x)}>Decline</button>}>
                <LetterText e={e} country={country} />
                <Chk checked={form.data.read} onChange={(v) => form.setData('read', v)}>I have read the scope and fee terms.</Chk>
                <Chk checked={form.data.data} onChange={(v) => form.setData('data', v)} error={form.errors.accept}>I accept the data protection terms.</Chk>
                {declining && (
                    <div className="grid gap-2 rounded-[10px] border border-risk-500/40 bg-risk-50 p-3">
                        <Fld label="Reason for declining" error={form.errors.reason}><textarea rows={2} className={inputCls} value={form.data.reason} onChange={(ev) => form.setData('reason', ev.target.value)} /></Fld>
                        <div><button type="button" className={btn('danger', 'sm')} onClick={decline} disabled={form.processing || !form.data.reason.trim()}>Confirm decline</button></div>
                    </div>
                )}
            </FormPanel>
        </Flow>
    );
}

function Sign({ engagement: e }: Props) {
    const form = useForm({ signature: '', drawn: '', agree: false });
    const canvas = useRef<HTMLCanvasElement>(null);
    const down = useRef(false);
    useEffect(() => {
        const c = canvas.current;
        const x = c?.getContext('2d');
        if (!c || !x) return;
        x.strokeStyle = getComputedStyle(c).color;
        x.lineWidth = 2.2;
        x.lineCap = 'round';
    }, []);
    const point = (ev: PointerEvent<HTMLCanvasElement>): [number, number] => {
        const c = canvas.current!;
        const r = c.getBoundingClientRect();
        return [((ev.clientX - r.left) * c.width) / r.width, ((ev.clientY - r.top) * c.height) / r.height];
    };
    const ctx = () => canvas.current?.getContext('2d') ?? null;
    const clear = () => { const c = canvas.current; ctx()?.clearRect(0, 0, c?.width ?? 0, c?.height ?? 0); form.setData('drawn', ''); };
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/sign')); };

    if (e.signature) {
        return (
            <Flow title="Electronic Signature" eyebrow="Page 47" steps={{ list: ADV, on: 4 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}>
                <Panel title="Signed">
                    <Dl rows={[['Signed by', `${e.signature.name}${e.signature.title ? ` (${e.signature.title})` : ''}`], ['Signed at', e.signature.at], ['Record hash', <span className="font-mono">{e.signature.hash}</span>]]} />
                    {e.next && <div className="mt-3"><Btn href={e.next.url}>{e.next.label}</Btn></div>}
                </Panel>
            </Flow>
        );
    }
    return (
        <Flow title="Electronic Signature" eyebrow="Page 47" steps={{ list: ADV, on: 4 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}
            side={<Banner>Type your full name as it appears on your account. The signature record is stored with the date, time and a hash of the letter and quotation.</Banner>}>
            <FormPanel title="Sign" submit="Sign engagement letter" onSubmit={submit} processing={form.processing} back={eng(e.reference, '/letter')}>
                <Fld label="Full name" error={form.errors.signature}><input className={inputCls} value={form.data.signature} onChange={(ev) => form.setData('signature', ev.target.value)} autoComplete="name" /></Fld>
                <div className="grid gap-1.5">
                    <span className="text-[0.82rem] font-semibold text-ink-800">Signature</span>
                    <canvas ref={canvas} width={600} height={160} aria-label="Draw your signature" className="w-full max-w-[600px] touch-none rounded-[8px] border border-dashed border-parchment-500 bg-white text-ink-900"
                        onPointerDown={(ev) => { down.current = true; const x = ctx(); x?.beginPath(); x?.moveTo(...point(ev)); }}
                        onPointerMove={(ev) => { if (!down.current) return; const x = ctx(); x?.lineTo(...point(ev)); x?.stroke(); }}
                        onPointerUp={() => { down.current = false; form.setData('drawn', canvas.current?.toDataURL('image/png') ?? ''); }}
                        onPointerLeave={() => { if (down.current) { down.current = false; form.setData('drawn', canvas.current?.toDataURL('image/png') ?? ''); } }} />
                    <button type="button" className={`${btn('ghost', 'xs')} justify-self-start`} onClick={clear}>Clear</button>
                </div>
                <Chk checked={form.data.agree} onChange={(v) => form.setData('agree', v)} error={form.errors.agree}>I agree that this electronic signature is binding.</Chk>
            </FormPanel>
        </Flow>
    );
}
