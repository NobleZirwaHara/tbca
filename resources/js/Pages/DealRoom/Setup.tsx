import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BarChart3, ClipboardCheck, FileCheck2, FolderLock, Lock, MessagesSquare, Plus, Trash2 } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import RoomShell, { roomUrl } from '@/Components/DealRoom/RoomShell';
import { AiNote, CheckItem, KvList, ResultIcon } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import { Checkbox, ChoiceCard, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Panel, SimpleTable, Stepper } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { RoomPageProps, StepperStage } from '@/types/deal-room';

type Sec = Record<string, string | number | boolean>;
interface Member { role: string; name: string; email: string; organisation: string }
interface Draft {
    role: string; deal_type: string; name: string; company: string; country: string; sector: string; objective: string; deal_stage: string;
    participants: number; language: string; team: Member[]; groups: Record<string, number>; notes: string; kyc_external: boolean; security: Sec;
    template: string; modules: string[]; ai_tools: string[]; translation: string; review_threshold: string;
}
interface Props extends RoomPageProps {
    step: string;
    steps: string[];
    unlocked: boolean;
    created: boolean;
    draft: Draft;
    options: {
        dealTypes: Record<string, string>; templates: Record<string, { name: string; description: string }>; modules: string[]; aiTools: string[];
        groups: Record<string, { role: string; scope: string }>; roles: Record<string, string>; matrix: Record<string, Record<string, string>>; folders: string[];
    };
    commercial: { depositPaid: boolean; stages: StepperStage[] };
}

const LABELS = ['Deal Basics', 'Parties & Roles', 'Security Setup', 'Template & Tools', 'Review & Create'];
const ROLES = ['Founder / Seller', 'Buyer / Investor', 'Bank / DFI', 'Lawyer / Advisor', 'Government / PPP', 'Other'];
const STAGES = ['Preparation', 'Early Interest', 'Active Diligence', 'Negotiation', 'Closing'];
const BASIC_TOGGLES: [string, string][] = [['nda_gate', 'NDA gate required'], ['mfa_external', 'MFA for external participants'], ['ai_human_review', 'Human review for high-risk AI outputs'], ['view_only_default', 'View-only by default'], ['watermark', 'Dynamic watermarking enabled'], ['activity_logging', 'Activity logging and audit export enabled']];
const SECURITY_TOGGLES: [string, string, string][] = [
    ['nda_gate', 'NDA Gate', 'All external users must accept NDA before accessing the room.'],
    ['mfa_external', 'Multi-Factor Authentication', 'MFA required for all external participants.'],
    ['watermark', 'Dynamic Watermarking', 'Watermark documents with user, email and timestamp.'],
    ['download_restricted', 'Download Restrictions', 'Restrict, expire or disable downloads per folder or user.'],
    ['view_only_default', 'View-Only by Default', 'External participants have view-only access by default.'],
    ['ai_human_review', 'AI Outputs Human Review', 'High-risk AI outputs require human review before sharing.'],
    ['activity_logging', 'Activity Logging & Audit Trail', 'All activities are logged and retained for audit.'],
    ['staged_disclosure', 'Staged Disclosure Mode', 'Sensitive folders remain hidden until owner approval.'],
    ['buyer_groups_visible', 'Buyer Groups Visible to Each Other', 'Leave off to isolate buyer groups.'],
    ['confidentiality_labels', 'Confidentiality Labels', 'Label documents by sensitivity.'],
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-gold-500' : 'bg-parchment-400')}>
            <span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-all', checked ? 'left-[1.125rem]' : 'left-0.5')} />
        </button>
    );
}

/** Stage 0 guided set-up wizard (VDR-005 to VDR-009); progress persists server-side on the room. */
export default function Setup({ room, step, steps, unlocked, created, draft, options, commercial }: Props) {
    const idx = steps.indexOf(step);
    const form = useForm<Draft & { confirm_accurate: boolean; confirm_invites: boolean; confirm_ai: boolean }>({ ...draft, confirm_accurate: false, confirm_invites: false, confirm_ai: false });
    const d = form.data;
    const sec = (k: string, v: string | number | boolean) => form.setData('security', { ...d.security, [k]: v });
    const toggleIn = (key: 'modules' | 'ai_tools', v: string) => form.setData(key, d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v]);
    const save = () => form.post(roomUrl(room.slug, `setup/${step}`), { preserveScroll: true });
    const prev = steps[idx - 1];

    return (
        <RoomShell room={room} title={`Stage 0.${idx + 1}: ${LABELS[idx]}`} eyebrow="Guided Deal Room Setup" description="Set up a secure transaction workspace for fundraising, acquisitions, due diligence, lending, partnerships and strategic transactions." activeStage="0"
            actionBar={
                <>
                    <Link href={roomUrl(room.slug)} className="mr-auto text-sm font-medium text-gold-700 hover:underline">Save and Continue Later</Link>
                    {prev && <Link href={roomUrl(room.slug, `setup/${prev}`)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden /> Back to {LABELS[idx - 1]}</Link>}
                    <Button type="button" size="sm" variant="outline" onClick={() => openAskQuestion({ subject: `Guided set-up request: ${room.name}`, section: 'Virtual Deal Room' })}>Request Guided Setup</Button>
                    {unlocked && <Button type="button" size="sm" disabled={form.processing} onClick={save}>{step === 'review-and-create' ? (created ? 'Room already created' : 'Create Deal Room') : `Continue to ${LABELS[idx + 1]}`} <ArrowRight className="size-4" aria-hidden /></Button>}
                </>
            }>
            <section className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[1fr_auto]">
                <ol className="flex flex-wrap gap-2">
                    {commercial.stages.map((s) => (
                        <li key={s.code} className={cn('rounded-[6px] border px-3 py-2 text-xs', s.status === 'completed' ? 'border-verified-500/40 bg-verified-50' : s.status === 'unlocked' ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 text-ink-400')}>
                            <span className="block font-semibold">Stage {s.code}</span>{s.name}<span className="block capitalize">{s.status === 'unlocked' ? 'Active' : s.status}</span>
                        </li>
                    ))}
                </ol>
                <ul className="space-y-1 text-xs">
                    <CheckItem done={commercial.depositPaid}>Prior gate: {commercial.depositPaid ? 'Complete' : 'Deposit outstanding'}</CheckItem>
                    <CheckItem done={unlocked}>This stage: {unlocked ? 'Unlocked' : 'Locked'}</CheckItem>
                </ul>
            </section>

            {!unlocked ? (
                <Panel>
                    <div className="flex flex-col items-center py-8 text-center">
                        <Lock className="mb-2 size-8 text-ink-400" aria-hidden />
                        <p className="font-semibold">Deal room set-up unlocks after Stage C</p>
                        <p className="mt-1 text-sm text-ink-600">The mandate must be signed and the activation deposit paid and reconciled.</p>
                        <Link href={roomUrl(room.slug, 'mandate')} className="mt-3 font-semibold text-gold-700 underline">Go to the Mandate & Payment Gate</Link>
                    </div>
                </Panel>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <Panel>
                        <Stepper steps={LABELS} current={idx + 1} className="mb-6" />
                        {Object.keys(form.errors).length > 0 && <p role="alert" className="mb-3 rounded bg-risk-50 p-2 text-xs text-risk-700">{Object.values(form.errors)[0]}</p>}

                        {step === 'deal-basics' && (
                            <div className="space-y-5">
                                <fieldset><legend className="mb-2 text-[0.8125rem] font-medium">Your Role</legend><div className="flex flex-wrap gap-2">{ROLES.map((r) => <button type="button" key={r} onClick={() => form.setData('role', r)} className={cn('rounded-[4px] border px-3 py-1.5 text-xs', d.role === r ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}>{r}</button>)}</div></fieldset>
                                <fieldset><legend className="mb-2 text-[0.8125rem] font-medium">Deal Type</legend><div className="grid gap-2 sm:grid-cols-3">{Object.entries(options.dealTypes).map(([k, l]) => <ChoiceCard key={k} selected={d.deal_type === k} onSelect={() => form.setData('deal_type', k)} title={l} />)}</div></fieldset>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Field label="Deal Room Name" required error={form.errors.name}>{(id) => <Input id={id} value={d.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                    <Field label="Company / Organisation Name" required error={form.errors.company}>{(id) => <Input id={id} value={d.company} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                                    <Field label="Country" required error={form.errors.country}>{(id) => <Select id={id} value={d.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Mauritius', 'Egypt', 'Morocco', 'Rwanda']} />}</Field>
                                    <Field label="Sector" required error={form.errors.sector}>{(id) => <Input id={id} value={d.sector ?? ''} onChange={(e) => form.setData('sector', e.target.value)} />}</Field>
                                    <Field label="Transaction Objective" required error={form.errors.objective} className="sm:col-span-2">{(id) => <Textarea id={id} value={d.objective ?? ''} onChange={(e) => form.setData('objective', e.target.value)} className="min-h-16" />}</Field>
                                    <Field label="Expected External Participants" error={form.errors.participants}>{(id) => <Input id={id} type="number" min={1} value={d.participants} onChange={(e) => form.setData('participants', Number(e.target.value))} />}</Field>
                                    <Field label="Preferred Language">{(id) => <Select id={id} value={d.language} onChange={(e) => form.setData('language', e.target.value)} options={['English', 'French', 'Portuguese', 'Afrikaans', 'Kiswahili']} />}</Field>
                                    <fieldset><legend className="mb-1.5 text-[0.8125rem] font-medium">Current Deal Stage</legend><div className="flex flex-wrap gap-1">{STAGES.map((s) => <button type="button" key={s} onClick={() => form.setData('deal_stage', s)} className={cn('rounded border px-2 py-1 text-[0.6875rem]', d.deal_stage === s ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}>{s}</button>)}</div></fieldset>
                                </div>
                                <fieldset className="rounded-[6px] border border-parchment-400 p-3"><legend className="px-1 text-[0.8125rem] font-semibold">Security and Access Preferences</legend>
                                    <div className="grid gap-3 sm:grid-cols-3">{BASIC_TOGGLES.map(([k, l]) => <label key={k} className="flex items-center justify-between gap-2 text-xs">{l}<Toggle checked={!!d.security[k]} onChange={(v) => sec(k, v)} label={l} /></label>)}</div>
                                </fieldset>
                            </div>
                        )}

                        {step === 'parties-and-roles' && (
                            <div className="space-y-5">
                                <div>
                                    <p className="mb-2 text-[0.8125rem] font-semibold">1. Room Owner and Internal Team</p>
                                    <div className="space-y-2">
                                        {d.team.map((m, i) => (
                                            <div key={i} className="grid gap-2 rounded border border-parchment-400 p-2 sm:grid-cols-[10rem_1fr_1fr_1fr_auto]">
                                                <select aria-label="Role" value={m.role} onChange={(e) => form.setData('team', d.team.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} className="h-9 rounded border border-parchment-500 bg-white px-1 text-xs">
                                                    {['tbca_advisor', 'finance', 'legal', 'owner'].map((r) => <option key={r} value={r}>{options.roles[r]}</option>)}
                                                </select>
                                                <Input aria-label="Name" value={m.name} onChange={(e) => form.setData('team', d.team.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                                                <Input aria-label="Email" type="email" value={m.email} onChange={(e) => form.setData('team', d.team.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
                                                <Input aria-label="Organisation" value={m.organisation} onChange={(e) => form.setData('team', d.team.map((x, j) => (j === i ? { ...x, organisation: e.target.value } : x)))} />
                                                <button type="button" aria-label="Remove member" onClick={() => form.setData('team', d.team.filter((_, j) => j !== i))} className="p-2 text-risk-500"><Trash2 className="size-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" size="sm" variant="ghost" className="mt-1" onClick={() => form.setData('team', [...d.team, { role: 'finance', name: '', email: '', organisation: d.company }])}><Plus className="size-4" aria-hidden /> Add internal member</Button>
                                </div>
                                <div>
                                    <p className="mb-2 text-[0.8125rem] font-semibold">2. External Participant Groups (isolated, staged disclosure)</p>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {Object.entries(options.groups).map(([g, meta]) => (
                                            <label key={g} className="rounded border border-parchment-400 p-3 text-xs">
                                                <span className="block font-semibold text-ink-900">{g}</span>
                                                <span className="text-ink-500">Access scope: {meta.scope} · Staged · Group only · Isolated</span>
                                                <span className="mt-2 flex items-center gap-2">Participants<input type="number" min={0} value={d.groups[g] ?? 0} onChange={(e) => form.setData('groups', { ...d.groups, [g]: Number(e.target.value) })} className="h-7 w-16 rounded border border-parchment-500 px-1" /></span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-4">
                                    {[['nda_gate', 'NDA required before room entry'], ['kyc_external', 'KYC / identity check for external parties'], ['mfa_external', 'MFA for external parties'], ['buyer_groups_visible', 'Buyer groups visible to each other']].map(([k, l]) => (
                                        <label key={k} className="flex items-center justify-between gap-2 rounded border border-parchment-400 p-2 text-xs">{l}<Toggle checked={k === 'kyc_external' ? d.kyc_external : !!d.security[k]} onChange={(v) => (k === 'kyc_external' ? form.setData('kyc_external', v) : sec(k, v))} label={l} /></label>
                                    ))}
                                </div>
                                <div>
                                    <p className="mb-2 text-[0.8125rem] font-semibold">4. Role Permissions Preview</p>
                                    <SimpleTable columns={['Role', 'View', 'Upload', 'Ask Q&A', 'Approve Disclosure', 'Download', 'AI Access', 'Approve Invite', 'Approve Publish']}
                                        rows={['owner', 'investor', 'lender', 'advisor', 'tbca_advisor'].map((r) => [options.roles[r], ...Object.values(options.matrix[r]).map((v, i) => <span key={i} className={cn('rounded px-1.5 text-[0.6875rem] font-semibold', v === 'yes' ? 'bg-verified-50 text-verified-700' : v === 'limited' ? 'bg-attested-50 text-attested-700' : 'bg-risk-50 text-risk-700')}>{v === 'yes' ? 'Yes' : v === 'limited' ? 'Limited' : 'No'}</span>)])} />
                                </div>
                                <Field label="5. Participant Notes / Special Access Instructions" hint={`${d.notes?.length ?? 0} / 1000`}>{(id) => <Textarea id={id} maxLength={1000} value={d.notes ?? ''} onChange={(e) => form.setData('notes', e.target.value)} />}</Field>
                                <p className="rounded bg-attested-50 p-2 text-xs text-attested-700">Stage lock: cannot proceed until segregation of duties is confirmed (unique internal members). No new fee is triggered — included in activation.</p>
                            </div>
                        )}

                        {step === 'security-setup' && (
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="space-y-3">
                                    <p className="text-[0.8125rem] font-semibold">1. Security Controls</p>
                                    {SECURITY_TOGGLES.map(([k, t, b]) => <div key={k} className="flex items-start justify-between gap-3 border-b border-parchment-300 pb-2 text-xs"><span><span className="block font-semibold text-ink-900">{t}</span>{b}</span><Toggle checked={!!d.security[k]} onChange={(v) => sec(k, v)} label={t} /></div>)}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[0.8125rem] font-semibold">2. Access & Disclosure Rules</p>
                                    <Field label="Access Mode">{(id) => <Select id={id} value={String(d.security.access_mode)} onChange={(e) => sec('access_mode', e.target.value)} options={['Restricted', 'Standard', 'Open']} />}</Field>
                                    <Field label="User Access Scope">{(id) => <Select id={id} value={String(d.security.access_scope)} onChange={(e) => sec('access_scope', e.target.value)} options={['Need to Know', 'Group', 'All Documents']} />}</Field>
                                    <Field label="External Links Expiry">{(id) => <Select id={id} value={String(d.security.link_expiry_days)} onChange={(e) => sec('link_expiry_days', Number(e.target.value))} options={[1, 3, 7, 14, 30].map((n) => ({ value: String(n), label: `${n} days` }))} />}</Field>
                                    <Field label="Session Timeout">{(id) => <Select id={id} value={String(d.security.session_timeout)} onChange={(e) => sec('session_timeout', Number(e.target.value))} options={[10, 20, 30, 60].map((n) => ({ value: String(n), label: `${n} minutes` }))} />}</Field>
                                    <Field label="Data Residency / Jurisdiction">{(id) => <Select id={id} value={String(d.security.data_residency)} onChange={(e) => sec('data_residency', e.target.value)} options={['South Africa', 'Kenya', 'Nigeria', 'Mauritius', 'EU']} />}</Field>
                                    {d.security.staged_disclosure && <p className="rounded bg-gold-50 p-2 text-xs">Staged disclosure mode is enabled. All sensitive folders remain hidden until owner approval.</p>}
                                </div>
                            </div>
                        )}

                        {step === 'template-and-tools' && (
                            <div className="space-y-5">
                                <div><p className="mb-2 text-[0.8125rem] font-semibold">1. Choose Deal Room Template</p><div className="grid gap-2 sm:grid-cols-2">{Object.entries(options.templates).map(([k, t]) => <ChoiceCard key={k} selected={d.template === k} onSelect={() => form.setData('template', k)} title={t.name} description={t.description} />)}</div></div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div><p className="mb-2 text-[0.8125rem] font-semibold">2. Core Modules to Enable</p><ul className="space-y-2">{options.modules.map((m) => <li key={m} className="flex items-center justify-between text-xs">{m}<Toggle checked={d.modules.includes(m)} onChange={() => toggleIn('modules', m)} label={m} /></li>)}</ul></div>
                                    <div><p className="mb-2 text-[0.8125rem] font-semibold">3. AI and Automation Tools</p><ul className="space-y-2">{options.aiTools.map((m) => <li key={m} className="flex items-center justify-between text-xs">{m}<Toggle checked={d.ai_tools.includes(m)} onChange={() => toggleIn('ai_tools', m)} label={m} /></li>)}</ul>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            <Field label="Auto-translation language">{(id) => <Select id={id} value={d.translation} onChange={(e) => form.setData('translation', e.target.value)} options={['English only', 'English + French', 'English + Portuguese']} />}</Field>
                                            <Field label="Human review threshold">{(id) => <Select id={id} value={d.review_threshold} onChange={(e) => form.setData('review_threshold', e.target.value)} options={['High-risk outputs only', 'All AI outputs', 'None']} />}</Field>
                                        </div>
                                    </div>
                                </div>
                                <div><p className="mb-2 text-[0.8125rem] font-semibold">4. Workspace Structure Preview</p><div className="flex flex-wrap gap-2">{[...options.folders, 'Q&A (auto-created)', 'Reports (auto-created)', 'Closing Docs (auto-created)'].map((f) => <span key={f} className="flex items-center gap-1 rounded border border-parchment-400 px-2 py-1 text-[0.6875rem]"><FolderLock className="size-3.5 text-gold-500" aria-hidden />{f}</span>)}</div></div>
                            </div>
                        )}

                        {step === 'review-and-create' && (
                            <div className="space-y-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div><p className="mb-1 text-[0.8125rem] font-semibold">A. Deal Room Summary</p><KvList rows={[['Deal Room Name', d.name], ['Company', d.company], ['Country', d.country], ['Deal Type', options.dealTypes[d.deal_type]], ['Sector', d.sector], ['Deal Stage', d.deal_stage], ['External Participants', String(d.participants)], ['Language', d.language]]} /></div>
                                    <div><p className="mb-1 text-[0.8125rem] font-semibold">B. Participant & Access Summary</p><KvList rows={[['Internal team', d.team.map((m) => m.name).join(', ')], ['External groups', Object.entries(d.groups).filter(([, n]) => n > 0).map(([g]) => g).join(', ')], ['External access mode', String(d.security.access_mode)], ['NDA gate', d.security.nda_gate ? 'On' : 'Off'], ['KYC / identity checks', d.kyc_external ? 'On' : 'Off'], ['Buyer groups visible', d.security.buyer_groups_visible ? 'Yes' : 'No']]} /></div>
                                    <div><p className="mb-1 text-[0.8125rem] font-semibold">C. Security & Disclosure Summary</p><ul className="grid grid-cols-2 gap-1 text-xs">{SECURITY_TOGGLES.map(([k, t]) => <li key={k} className="flex items-center gap-1"><ResultIcon ok={!!d.security[k]} />{t}</li>)}</ul></div>
                                    <div><p className="mb-1 text-[0.8125rem] font-semibold">D. Template & Tools Summary</p><KvList rows={[['Template', options.templates[d.template]?.name], ['Modules', `${d.modules.length} enabled`], ['AI tools', `${d.ai_tools.length} enabled`], ['Auto-translation', d.translation], ['Human review threshold', d.review_threshold]]} /></div>
                                </div>
                                <p className="rounded bg-controlled-50 p-2 text-xs text-controlled-700">The room will be created in controlled set-up mode with staged disclosure and AI-assisted document preparation. Participant invitations are only sent after creation and controlled access approval.</p>
                                <fieldset className="space-y-2 rounded border border-parchment-400 p-3"><legend className="px-1 text-[0.8125rem] font-semibold">F. Final Confirmations</legend>
                                    <Checkbox label="I confirm that the information provided is accurate." checked={d.confirm_accurate} onChange={(e) => form.setData('confirm_accurate', e.target.checked)} />
                                    <Checkbox label="I understand that participant invitations will only be sent after room creation and controlled access approval." checked={d.confirm_invites} onChange={(e) => form.setData('confirm_invites', e.target.checked)} />
                                    <Checkbox label="I confirm that AI outputs will remain subject to permissions and human review where required." checked={d.confirm_ai} onChange={(e) => form.setData('confirm_ai', e.target.checked)} />
                                </fieldset>
                                {created && <p className="text-xs font-semibold text-verified-700">This room has already been created. <Link className="underline" href={roomUrl(room.slug, 'created')}>View room</Link></p>}
                            </div>
                        )}
                    </Panel>
                    <aside className="space-y-5">
                        <AiNote title="Deal Room Intake & Setup Assistant">I’ll help you configure your deal room foundation with the right structure, checklist and security settings based on your inputs and context.</AiNote>
                        <Panel title="What You’ll Create">
                            <ul className="space-y-2 text-xs">
                                {[[FolderLock, 'Secure document room'], [ClipboardCheck, 'AI-guided checklist'], [MessagesSquare, 'Q&A and approvals'], [BarChart3, 'Risk and readiness tracking'], [FileCheck2, 'Audit-ready transaction record']].map(([I, l]) => { const Ico = I as typeof FolderLock; return <li key={l as string} className="flex items-center gap-2"><Ico className="size-4 text-gold-600" aria-hidden />{l as string}</li>; })}
                            </ul>
                        </Panel>
                        <Panel title="Recommended Starter Package">
                            <ul className="space-y-1">{['Document room template', 'Due diligence checklist', 'Q&A board', 'Risk register', 'Trust Passport starter', 'Closing pack structure'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul>
                        </Panel>
                        <Panel title="Commercial Entitlement"><KvList rows={[['Package', 'Guided Deal Room Setup'], ['Fee Category', 'Activation / Setup Fee'], ['Payment Status', commercial.depositPaid ? 'Paid / Reconciled' : 'Unpaid'], ['Fee Trigger', 'No new fee (included in activation)']]} /></Panel>
                    </aside>
                </div>
            )}
        </RoomShell>
    );
}
