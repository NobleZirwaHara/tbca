import { router, useForm } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Download, FileText, Info, Lock, ShieldCheck, Users } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Status, Table, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Props extends WorkspaceBase {
    scope: { element: string; input: string; law: string; profession: string }[];
    partners: { id: string; name: string; profession: string; verified: string; fee: number }[];
    selected: string | null;
    routeStatus: string;
}

export default function PartnerRoute(props: Props) {
    const { engagement: e, scope, partners, selected, routeStatus } = props;
    const root = `/industries/workspace/${e.reference}`;
    const form = useForm({ action: 'confirm', acknowledge: false });
    const step = routeStatus === 'confirmed' ? 5 : selected ? 3 : 2;
    const sel = partners.find((p) => p.id === selected);

    return (
        <WorkspaceShell
            base={props}
            title="Partner Attachment & Disclosure"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="This engagement requires professional input. Review the professional route, confirm partner attachment, and understand responsibilities."
            actions={<a href={`${root}/engagement-letter/pdf`} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Download Route Summary (PDF)</a>}
            right={
                <>
                    <Box title="Route Status" action={<Status value={routeStatus} />}>
                        <p className="text-xs text-ink-600">{routeStatus === 'confirmed' ? `${sel?.name} attached. Work can begin under Ledger P.` : 'Partner attachment required before proceeding to report commissioning.'}</p>
                    </Box>
                    <Box title="Your Rights"><ul className="space-y-1.5 text-xs">{['You choose whether to proceed.', 'You can change partner if needed.', 'You can withdraw at any time.', 'No professional opinion is provided by TBCA.', 'All fees are shown upfront and transparently.'].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul></Box>
                    <Box title="Important Documents"><ul className="space-y-1.5 text-xs">{['Professional Route Summary', 'Limitation & Responsibility Notice', 'Conflict Check Policy', 'Engagement Policy'].map((t) => <li key={t} className="flex justify-between"><span className="flex gap-1.5"><FileText className="size-3.5" />{t}</span><a href="/resources/limitations" className="text-controlled-700">View</a></li>)}</ul></Box>
                </>
            }
        >
            <Box title="Why a Professional Route is Required">
                <p className="text-xs text-ink-600">This engagement contains scope elements that require professional judgement, interpretation or opinion under local law and practice. TBCA does not provide legal, tax, regulatory or professional opinions. We engage qualified independent partners to deliver those elements.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[[ShieldCheck, 'Your rights are protected', 'Professional input is independent and governed.'], [Users, 'No opinions from TBCA', 'We coordinate. Partners provide the opinion.'], [FileText, 'Clear responsibilities', 'You will see who is responsible for what.']].map(([I, t, s]) => {
                        const Icon = I as typeof Users;
                        return <div key={t as string} className="flex gap-2 rounded border border-parchment-300 p-2.5"><Icon className="size-5 text-verified-700" /><span className="text-xs"><strong className="block">{t as string}</strong>{s as string}</span></div>;
                    })}
                </div>
                <h3 className="mt-5 text-sm font-semibold">Professional Route Overview</h3>
                <Stepper className="mt-3" steps={['Identify Need', 'Attach Partner', 'Disclosure', 'Review & Confirm', 'Work Begins']} current={step} />
            </Box>

            {scope.length > 0 && (
                <Box title="Engagement Scope Elements Requiring Professional Input">
                    <Table head={['Scope Element', 'Professional Input Required', 'Applicable Law / Framework', 'Proposed Profession(s)', '']} rows={scope.map((s) => [s.element, s.input, s.law, s.profession, <Chip key="r" tone="red">Required</Chip>])} />
                    <p className="mt-3 flex items-center gap-2 rounded bg-attested-50 p-2 text-xs text-attested-700"><Info className="size-4" /> These elements will be delivered by qualified independent partners. TBCA coordinates and manages the process.</p>
                </Box>
            )}

            <Box title="Partner Selection">
                {partners.length === 0 ? (
                    <p className="text-sm text-ink-600">No professional route is required for this engagement.</p>
                ) : (
                    <ul className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Partner">
                        {partners.map((p) => (
                            <li key={p.id}>
                                <button type="button" role="radio" aria-checked={p.id === selected} disabled={routeStatus === 'confirmed'} onClick={() => router.post(`${root}/partner-route`, { action: 'select', partner: p.id }, { preserveScroll: true })} className={cn('h-full w-full rounded-[8px] border p-3 text-left', p.id === selected ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300')}>
                                    <p className="flex items-center gap-1.5 text-sm font-semibold"><BadgeCheck className="size-4 text-verified-500" />{p.name}</p>
                                    <p className="text-xs text-ink-500">{p.profession}</p>
                                    <p className="text-[0.6875rem] text-ink-400">{p.verified} · Matter-eligible</p>
                                    <p className="mt-1 text-xs">Est. Ledger P fee: <strong>{zar(p.fee)}</strong></p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {sel && routeStatus !== 'confirmed' && (
                    <div className="mt-4 rounded-[8px] border border-parchment-400 p-3">
                        <p className="text-sm font-semibold">Disclosure & responsibilities</p>
                        <p className="text-xs text-ink-600">{sel.name} contracts directly with you and bills Ledger P separately. TBCA coordinates; the partner is responsible for the professional opinion, its scope and its limitations. Conflict checks are complete.</p>
                        <Checkbox className="mt-2" label="I acknowledge the partner disclosure, responsibilities and Ledger P billing." checked={form.data.acknowledge} onChange={(ev) => form.setData('acknowledge', ev.target.checked)} />
                        <div className="mt-3 flex gap-2">
                            <button type="button" disabled={!form.data.acknowledge || form.processing} onClick={() => form.post(`${root}/partner-route`, { preserveScroll: true })} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold disabled:opacity-50">Confirm Partner Attachment</button>
                            <button type="button" onClick={() => router.post(`${root}/partner-route`, { action: 'change' }, { preserveScroll: true })} className="rounded border border-parchment-500 px-4 py-2 text-xs">Change partner</button>
                        </div>
                    </div>
                )}
                {routeStatus === 'confirmed' && <p className="mt-3 flex items-center gap-2 text-sm text-verified-700"><Lock className="size-4" /> Partner attached and recorded to the ledger as a Ledger P estimate.</p>}
            </Box>

            <Box title="What You Will Receive from Professionals">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[['Professional Findings', 'Written outputs with professional opinion where permitted.'], ['Authority & Limitations', 'Clear statement of the permitted scope and limitations.'], ['Independence Statement', 'Professional judgement is independent of TBCA and your commercial interests.'], ['Confidential Handling', 'All information handled under strict confidentiality obligations.']].map(([t, s]) => <div key={t} className="text-xs"><strong className="block text-[0.8125rem]">{t}</strong>{s}</div>)}
                </div>
            </Box>
        </WorkspaceShell>
    );
}
