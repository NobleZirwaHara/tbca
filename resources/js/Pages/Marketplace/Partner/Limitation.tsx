import { Head } from '@inertiajs/react';
import { CircleAlert, CircleCheck, CircleX, Download, Info, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DarkHero } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';

interface Props {
    notice: { not_provided: string[]; profession_led: string[]; information: string[] };
    arrangements: { code: string; title: string; lead: string }[];
}

export default function Limitation({ notice, arrangements }: Props) {
    return (
        <>
            <Head title="Professional Limitation Notice" />
            <DarkHero crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Professional Limitation Notice' }]} title="Professional Limitation Notice" subtitle="Understanding the Boundaries of Partner Services"
                aside={
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="hidden size-24 shrink-0 text-gold-500 sm:block" aria-hidden="true" />
                        <div className="rounded-[8px] border border-gold-500/60 p-4 text-sm"><p className="flex items-center gap-1.5 font-semibold text-gold-400"><CircleAlert className="size-4" aria-hidden="true" />Your Responsibility</p><p className="mt-1 text-ink-200">You remain responsible for your decisions. Obtain your own professional advice and do your own due diligence.</p></div>
                    </div>
                }>
                Partner Services connects you with qualified independent professionals and firms. TBCA is not your professional adviser and does not provide regulated professional services.
            </DarkHero>
            <PsBody>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <Card title="TBCA Is Not Your Professional Adviser">
                        <p className="text-sm text-ink-600">TBCA performs consulting, coordination and support services. We do not perform or sign off on regulated professional work.</p>
                        <p className="mt-3 text-sm font-semibold text-ink-900">TBCA does not provide:</p>
                        <ul className="mt-1 space-y-1 text-sm text-ink-700">{notice.not_provided.map((x) => <li key={x} className="flex gap-2"><CircleX className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                        <p className="mt-3 text-xs text-ink-500">Where professional authority is required, we connect you with qualified independent experts who hold the appropriate licence, registration and indemnity.</p>
                    </Card>
                    <Card title="Profession-Led Delivery">
                        <p className="text-sm text-ink-600">When professional authority is required:</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-ink-700">{notice.profession_led.map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                        <p className="mt-3 flex gap-2 rounded border border-gold-400/60 bg-gold-50 p-2 text-xs text-ink-700"><ShieldCheck className="size-4 shrink-0" aria-hidden="true" />Only the professional can provide professional opinion or certification.</p>
                    </Card>
                    <Card title="Three Engagement Arrangements">
                        <p className="text-sm text-ink-600">Engagements operate under one of three approved structures only.</p>
                        <ul className="mt-3 space-y-3">{arrangements.map((a) => <li key={a.code} className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded bg-gold-600 font-bold text-white">{a.code}</span><span><span className="block font-semibold text-ink-900">Partner {a.title.replace('Partner ', '')}</span><span className="text-xs text-ink-600">{a.lead}</span></span></li>)}</ul>
                        <p className="mt-3 text-xs text-ink-500">The arrangement used will be confirmed before any work begins.</p>
                    </Card>
                    <div className="space-y-5">
                        <Card title="Limitations of Information">
                            <p className="text-sm text-ink-600">Information on AIIM and TBCA platforms is:</p>
                            <ul className="mt-2 space-y-1 text-sm text-ink-700">{notice.information.map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                            <p className="mt-2 text-xs text-ink-500">Use the information as an input, not as a substitute for professional judgement.</p>
                        </Card>
                        <Card title="Need Professional Advice?">
                            <p className="text-sm text-ink-600">Request a partner review and we will connect you with the right qualified professional for your matter.</p>
                            <ButtonLink href="/partner-services/request" className="mt-3 w-full">Request Partner Review</ButtonLink>
                            <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => openAskQuestion({ subject: 'Professional limitation', section: 'partner-services' })}><UserRound className="size-4" aria-hidden="true" />Ask a Human Advisor</Button>
                        </Card>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                    <p className="flex items-center gap-2 text-sm text-ink-700"><Info className="size-4" aria-hidden="true" />By using Partner Services, you acknowledge this notice and agree to obtain independent professional advice where required.</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" />Download Full Limitation PDF</Button>
                </div>
            </PsBody>
        </>
    );
}
