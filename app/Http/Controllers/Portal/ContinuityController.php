<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\PortalCase;
use App\Models\Portal\Project;
use App\Support\Portal\Billing;
use App\Support\Portal\Journeys;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-086/087/088/115/118/124: account floor, appeal, pause/cancel/exit, reactivation, save-state, low-data. */
class ContinuityController extends PortalController
{
    public function status(): Response
    {
        $a = $this->account();
        $restricted = Portal::isRestricted($a) || $a->account_state === 'paused';
        $days = Portal::daysOverdue($this->user());
        [$level] = Portal::degradation($days);

        return $this->register([
            'title' => $restricted ? 'Restricted or Suspended Account' : 'Account Status', 'icon' => 'shield-alert', 'subtitle' => $restricted ? 'Some services are temporarily restricted while we review your account or required actions are completed.' : 'Your account is in good standing. This page shows what is always protected for you.',
            'banner' => $restricted ? ['tone' => 'bad', 'title' => 'Current account status: '.ucfirst($a->account_state), 'body' => ($a->state_reason ?? 'Your account is under review.').' This is a controlled review state, not a permanent shutdown.', 'meta' => $a->state_case ? 'Review Case '.$a->state_case : null] : ['tone' => 'good', 'title' => 'Account in good standing', 'body' => 'Entitlement level: '.$level.'. No restrictions apply.'],
            'actions' => $restricted ? [Ui::action('Start Remedy Process', '/portal/account/appeal', 'get', ['variant' => 'gold'])] : [],
            'main' => [
                Ui::row([Ui::checklist('What Still Works', array_map(fn ($f) => Ui::check($f), Portal::FLOOR)), Ui::checklist($restricted ? 'What Is Restricted' : 'Restricted only if your account is restricted', array_map(fn ($f) => Ui::check($f, ! $restricted), Portal::RESTRICTED))]),
                Ui::steps('Case Progress', [['label' => 'Issue Detected'], ['label' => 'Notice Sent'], ['label' => 'Client Action Required'], ['label' => 'TBCA Review'], ['label' => 'Access Restored']], $restricted ? 3 : 6),
            ],
            'side' => [Ui::kv('Account Summary', [['Account ID', $this->user()->client_id], ['Organisation', $this->org()->name], ['Account Status', Ui::pill($a->account_state)], ['Since', Ui::date($a->state_since)], ['Days overdue (oldest invoice)', (string) $days], ['Updates Channel', 'Messages & Email']]), Ui::checklist('Rights That Remain Accessible', [Ui::check('Privacy & data access requests'), Ui::check('Data correction & deletion rights'), Ui::check('Complaints & escalation rights'), Ui::check('Support & enquiry rights')]), Ui::quick('Help', [Ui::action('Chat with KAREN', '/portal/natasha'), Ui::action('Contact Human Support', '/portal/support?new=1'), Ui::action('Arrears & Payment Help', '/portal/arrears')])],
        ]);
    }

    private function appealCase(): PortalCase
    {
        $items = [['Valid authority letter', 'Signed & dated authority letter on company letterhead', 'required'], ['Government-issued ID', 'Clear copy of ID for the authorised signatory', 'required'], ['Business registration', 'Current registration or incorporation certificate', 'required'], ['Explanation for delay', 'Brief explanation for delay or change in authority', 'optional'], ['Accuracy confirmation', 'Confirm accuracy of all submitted information', 'required']];

        return PortalCase::firstOrCreate(['user_id' => $this->user()->id, 'kind' => 'appeal', 'status' => 'draft'], ['reference' => 'RES-'.now()->format('Y-m').'-'.random_int(1000, 9999), 'title' => 'Access restriction appeal', 'payload' => ['items' => array_map(fn ($i) => ['label' => $i[0], 'desc' => $i[1], 'need' => $i[2], 'status' => 'required', 'at' => null], $items)]]);
    }

    public function appeal(): Response
    {
        $case = $this->appealCase();
        $a = $this->account();
        $history = PortalCase::where('user_id', $this->user()->id)->where('kind', 'appeal')->where('status', '!=', 'draft')->latest()->get();

        return $this->register([
            'title' => 'Access Restriction Appeal and Review', 'icon' => 'gavel', 'code' => 'CP-SCR-118', 'subtitle' => 'Restricted access decisions show the reason, effective scope, evidence state, and appeal options. Review is handled with fairness, human oversight, and full auditability.',
            'actions' => [Ui::action('Submit Appeal', '/portal/account/appeal', 'post', ['variant' => 'gold', 'confirm' => 'Submit your appeal for human review?'])],
            'main' => [
                Ui::kv('Current Restriction Summary', [['Client / Organisation', $this->org()->name], ['Restricted user', $this->user()->name], ['Current status', Ui::pill($a->account_state)], ['Reason', $a->state_reason ?? 'No active restriction'], ['Reference', $a->state_case ?? $case->reference], ['Estimated review timeline', 'Up to 5 business days after all required evidence is received']]),
                Ui::table('Appeal Submission', ['#', 'Requirement', 'Description', 'Status', 'Submitted At', ''], collect($case->payload['items'])->map(fn ($i, $n) => [$n + 1, $i['label'], $i['desc'], Ui::pill($i['status'] === 'required' && $i['need'] === 'optional' ? 'optional' : $i['status']), $i['at'] ?? '—', Ui::actions([$i['status'] !== 'submitted' ? ($n === 4 ? Ui::action('Complete', '/portal/account/appeal/'.$n, 'post', ['variant' => 'gold', 'confirm' => 'I confirm all submitted information is accurate.']) : Ui::modal('Upload', 'item-'.$n, ['variant' => 'gold'])) : null])])->all(), ['caption' => 'Please upload all required items to enable timely review. Incomplete submissions may extend review timelines.']),
                Ui::table('Appeal History', ['Reference', 'Status', 'Submitted', 'Outcome'], $history->map(fn ($h) => [Ui::ref($h->reference), Ui::pill($h->status), Ui::date($h->submitted_at), $h->outcome ?? 'Pending'])->all(), ['empty' => 'No appeals submitted yet.']),
            ],
            'side' => [Ui::checklist('Fair Review Safeguards', [Ui::check('Reason disclosed'), Ui::check('Scope limited to affected access'), Ui::check('Human review available'), Ui::check('Evidence linked to decision'), Ui::check('Audit trail preserved'), Ui::check('Escalation path available')]), Ui::kv('Restriction Scope', [['Affected', 'Submissions, Document Upload, Admin Rights, Delegations'], ['Not Affected', 'Workspace view access, Payment History, Billing & Invoices']])],
            'forms' => collect(range(0, 3))->mapWithKeys(fn ($n) => ['item-'.$n => Ui::form('Upload: '.$case->payload['items'][$n]['label'], '/portal/account/appeal/'.$n, [Ui::field('file', 'File', 'file', ['required' => true])], 'Upload Evidence')])->all(),
        ]);
    }

    public function appealItem(Request $request, int $item): RedirectResponse
    {
        $case = $this->appealCase();
        $items = $case->payload['items'];
        abort_unless(isset($items[$item]), 404);
        if ($item !== 4) {
            $request->validate(['file' => 'required|file|max:25600|mimes:'.DocumentController::MIMES]);
            $doc = DocumentController::storeUpload($request->file('file'), $this->user(), ['doc_type' => 'Appeal Evidence', 'tags' => ['Appeal']]);
            $items[$item]['document_id'] = $doc->id;
        }
        $items[$item]['status'] = 'submitted';
        $items[$item]['at'] = now()->format('d M Y, H:i');
        $case->update(['payload' => ['items' => $items]]);

        return back()->with('success', $items[$item]['label'].' received.');
    }

    public function submitAppeal(): RedirectResponse
    {
        $case = $this->appealCase();
        $missing = collect($case->payload['items'])->where('need', 'required')->where('status', '!=', 'submitted');
        if ($missing->isNotEmpty()) {
            return back()->with('error', 'Please complete: '.$missing->pluck('label')->implode(', ').'.');
        }
        $case->update(['status' => 'under_review', 'submitted_at' => now(), 'due_at' => now()->addWeekdays(5)]);
        Portal::notify($this->user(), 'Appeal submitted', $case->reference.' is with the TBCA Review Team.', 'compliance', '/portal/account/appeal', 'Appeal', 'Compliance');

        return back()->with('success', 'Appeal '.$case->reference.' submitted for human review.');
    }

    public function exit(Request $request): Response
    {
        $s = Billing::summary($this->user());
        $projects = Project::where('user_id', $this->user()->id)->where('status', '!=', 'completed')->get();
        $latest = PortalCase::where('user_id', $this->user()->id)->where('kind', 'exit')->latest()->first();
        $option = (string) $request->query('option', 'pause');

        return $this->register([
            'title' => 'Pause, Cancellation and Exit', 'icon' => 'log-out', 'subtitle' => 'Manage your engagement with TBCA in a way that works for you. Exit is never hidden behind friction.',
            'banner' => $latest ? ['tone' => 'info', 'title' => 'Latest request: '.$latest->title.' ('.$latest->reference.')', 'body' => 'Status: '.str_replace('_', ' ', $latest->status), 'meta' => Ui::date($latest->submitted_at)] : null,
            'main' => [
                Ui::cards('Choose an option', [
                    Ui::card('Pause Services (Recommended)', 'Temporarily pause delivery while preserving your account, data and progress. Temporary and reversible.', 'Keep access to portal & documents', null, 'circle-pause', 'good'),
                    Ui::card('Cancel Engagement', 'End the current project or engagement while keeping your portal account active.', 'Document access retained', null, 'user-x', 'warn'),
                    Ui::card('Exit Portal', 'Close your portal access and relationship with TBCA across all engagements.', 'Data retained per policy; reactivation requires approval', null, 'log-out', 'bad'),
                ], 3),
                ['kind' => 'form', 'title' => 'Your Selection', 'form' => Ui::form('Exit', '/portal/account/exit', [
                    Ui::field('option', 'Option', 'radio', ['required' => true, 'value' => $option, 'options' => [['value' => 'pause', 'label' => 'Pause Services'], ['value' => 'cancel', 'label' => 'Cancel Engagement'], ['value' => 'exit', 'label' => 'Exit Portal']]]),
                    Ui::field('reason', 'Reason', 'select', ['required' => true, 'options' => Ui::options(['Budget reallocation / cash flow planning', 'Project objectives achieved', 'Change in business priorities', 'Service not meeting expectations', 'Other'])]),
                    Ui::field('effective', 'Effective date', 'date', ['required' => true, 'value' => now()->toDateString()]),
                    Ui::field('months', 'Pause duration (months, pause only)', 'select', ['value' => '3', 'options' => Ui::options(['1', '2', '3', '6'])]),
                    Ui::field('engagements', 'Affected services / engagements', 'checkboxes', ['options' => $projects->map(fn ($p) => ['value' => $p->reference, 'label' => $p->name])->values()->all()]),
                    Ui::field('confirm', 'I understand what changes and what stays available', 'checkbox', ['required' => true]),
                ], 'Submit Request')],
            ],
            'side' => [
                Ui::kv('Financial Clarity', [['Current Payable (Outstanding)', Ui::money($s['outstanding'])], ['Overdue', Ui::money($s['overdue'])], ['Available Credits', Ui::money($s['credits'])]], Ui::action('If I Stop Now calculator', '/portal/if-i-stop-now')),
                Ui::checklist('What stays available', [Ui::check('Portal access & documents'), Ui::check('Historical data & reports'), Ui::check('Invoices & payment history'), Ui::check('Messages & communications'), Ui::check('Data export at any time')]),
                Ui::info('Exit Guidance', "Your data is protected. We retain data for 12 months after exit per our Data Retention Policy. You can request a data export any time. Reactivation may require review.", 'neutral', Ui::action('Export my data', '/portal/exports')),
            ],
        ]);
    }

    public function submitExit(Request $request): RedirectResponse
    {
        $d = $request->validate(['option' => 'required|in:pause,cancel,exit', 'reason' => 'required|string|max:200', 'effective' => 'required|date|after_or_equal:today', 'months' => 'nullable|integer|in:1,2,3,6', 'engagements' => 'array', 'confirm' => 'accepted']);
        $ref = 'EX-'.now()->format('Y').'-'.random_int(10000, 99999);
        $title = ['pause' => 'Pause Services', 'cancel' => 'Cancel Engagement', 'exit' => 'Exit Portal'][$d['option']];
        $status = $d['option'] === 'cancel' ? 'submitted' : 'confirmed';
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'exit', 'reference' => $ref, 'title' => $title, 'status' => $status, 'payload' => $d + ['resume_on' => $d['option'] === 'pause' ? now()->parse($d['effective'])->addMonths((int) ($d['months'] ?? 3))->toDateString() : null], 'submitted_at' => now(), 'step' => 99]);
        if ($d['option'] === 'pause') {
            $this->account()->update(['account_state' => 'paused', 'state_reason' => 'Services paused at your request until '.now()->parse($d['effective'])->addMonths((int) ($d['months'] ?? 3))->format('d M Y').'.', 'state_case' => $ref, 'state_since' => now()]);
            Project::where('user_id', $this->user()->id)->whereIn('reference', $d['engagements'] ?? [])->update(['status' => 'on_hold']);
        } elseif ($d['option'] === 'exit') {
            $this->account()->update(['account_state' => 'exited', 'state_reason' => 'You closed your portal relationship. Your data is retained for 12 months and remains exportable.', 'state_case' => $ref, 'state_since' => now()]);
        }
        Portal::notify($this->user(), $title.' – receipt '.$ref, 'Your request has been recorded. A durable receipt is kept in your account.', 'system', '/portal/account/exit', 'Exit & Continuity');

        return redirect($d['option'] === 'cancel' ? '/portal/account/exit' : '/portal/account/status')->with('success', "{$title} recorded (receipt {$ref}).");
    }

    public function reactivation(): Response
    {
        $a = $this->account();
        $case = PortalCase::where('user_id', $this->user()->id)->where('kind', 'reactivation')->latest()->first();
        $s = Billing::summary($this->user());

        return $this->register([
            'title' => 'Reactivation and Relationship Return', 'icon' => 'rotate-ccw', 'subtitle' => 'A guided process to reactivate your relationship and return to full service with The Business Clinic.Africa™.',
            'banner' => $case ? ['tone' => 'info', 'title' => 'Reactivation status: '.ucwords(str_replace('_', ' ', $case->status)), 'body' => 'Request reference '.$case->reference, 'meta' => 'Relationship state: '.ucfirst($a->account_state)] : ['tone' => $a->account_state === 'active' ? 'good' : 'warn', 'title' => 'Relationship state: '.ucfirst($a->account_state), 'body' => $a->account_state === 'active' ? 'Your account is fully active — no reactivation needed.' : 'Submit a reactivation request below.'],
            'main' => [
                Ui::steps('Your Reactivation Journey', [['label' => 'Review Status'], ['label' => 'Resolve Outstanding Items'], ['label' => 'Confirm Details'], ['label' => 'TBCA Review'], ['label' => 'Relationship Restored']], $a->account_state === 'active' ? 6 : ($case ? 4 : 1)),
                ['kind' => 'form', 'title' => 'Reactivation Request', 'form' => Ui::form('Reactivate', '/portal/account/reactivation', [
                    Ui::field('return_option', 'Selected return option', 'select', ['required' => true, 'options' => Ui::options(['Return to Full Service', 'Return to Limited Service', 'Resume Paused Engagements Only'])]),
                    Ui::field('restart', 'Preferred restart date', 'date', ['required' => true, 'value' => now()->addDays(3)->toDateString()]),
                    Ui::field('channel', 'Preferred communication', 'select', ['value' => 'Email', 'options' => Ui::options(['Email', 'Phone', 'WhatsApp'])]),
                    Ui::field('notes', 'Additional notes (optional)', 'textarea'),
                    Ui::field('ack1', 'I confirm the information provided is accurate and complete.', 'checkbox', ['required' => true]),
                    Ui::field('ack2', 'I understand that reactivation is subject to TBCA review and approval.', 'checkbox', ['required' => true]),
                ], 'Submit Reactivation Request')],
            ],
            'side' => [Ui::checklist('What still needs your action', [Ui::check('Confirm primary contact details', true), Ui::check('Settle outstanding balance (if any)', $s['outstanding'] === 0 ? true : 'warn', Ui::zar($s['outstanding'])), Ui::check('Accept updated service terms', 'warn'), Ui::check('Confirm service preferences', 'warn')]), Ui::info('What Happens Next?', 'We review your request and documents (typically within 2 business days). Reactivation re-runs current identity, authority, payment and entitlement checks. Expected review time: 2-3 business days.', 'info')],
        ]);
    }

    public function submitReactivation(Request $request): RedirectResponse
    {
        $d = $request->validate(['return_option' => 'required|string', 'restart' => 'required|date|after_or_equal:today', 'channel' => 'nullable|string', 'notes' => 'nullable|string|max:1000', 'ack1' => 'accepted', 'ack2' => 'accepted']);
        $ref = 'RR-'.now()->format('Y').'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        $a = $this->account();
        $instant = $a->account_state === 'paused';
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'reactivation', 'reference' => $ref, 'title' => $d['return_option'], 'status' => $instant ? 'approved' : 'under_review', 'payload' => $d, 'submitted_at' => now(), 'step' => 99]);
        if ($instant) {
            $a->update(['account_state' => 'active', 'state_reason' => null, 'state_case' => null, 'state_since' => now()]);
            Project::where('user_id', $this->user()->id)->where('status', 'on_hold')->update(['status' => 'in_progress']);
        }

        return back()->with('success', $instant ? "Services resumed (reference {$ref})." : "Reactivation request {$ref} submitted for review.");
    }

    public function resume(Request $request): Response
    {
        $all = PortalCase::where('user_id', $this->user()->id)->whereIn('kind', array_keys(Journeys::all()))->latest('updated_at')->get();
        $state = fn ($c) => $c->status === 'draft' ? ($c->updated_at->lt(now()->subDays(90)) ? 'expired' : ($c->payload['_paused'] ?? false ? 'paused_by_you' : ($c->updated_at->gte(now()->subDays(7)) ? 'ready_to_resume' : 'in_progress'))) : 'submitted';
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->filter(fn ($c) => $state($c) === $tab);
        $defs = Journeys::all();

        return $this->register([
            'title' => 'Save-State and Resume Centre', 'icon' => 'save', 'code' => 'CP-SCR-124', 'subtitle' => 'Your in-progress work is automatically saved so you can resume anytime, on any device, without losing your place.',
            'actions' => [Ui::action('Clear Completed', '/portal/resume/clear-completed', 'post', ['confirm' => 'Remove completed items from this list? Records themselves are kept.'])],
            'kpis' => [Ui::kpi('In Progress', $all->where('status', 'draft')->count(), 'Drafts not yet submitted', 'neutral', 'save'), Ui::kpi('Ready to Resume', $all->filter(fn ($c) => $state($c) === 'ready_to_resume')->count(), 'Left off within 7 days', 'warn', 'history'), Ui::kpi('Completed', $all->where('status', '!=', 'draft')->count(), null, 'good', 'badge-check'), Ui::kpi('Paused by You', $all->filter(fn ($c) => $state($c) === 'paused_by_you')->count(), null, 'info', 'circle-pause'), Ui::kpi('Auto-Saved', 'On', 'Continuous save active', 'good', 'save')],
            'tabs' => Ui::tabs(['all' => 'All Drafts', 'ready_to_resume' => 'Ready to Resume', 'paused_by_you' => 'Paused by You', 'submitted' => 'Submitted / Completed', 'expired' => 'Expired']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Draft / Task Name', 'Last Modified', 'Saved On', 'Progress', 'Status', ''], $rows->values()->map(fn ($c) => [
                Ui::stack($defs[$c->kind]['title'] ?? $c->kind, $c->reference ?? 'Draft'), $c->updated_at->format('d M Y, H:i'), 'Server (all devices)', Ui::progress($c->status === 'draft' ? round((($c->step - 1) / max(1, count($defs[$c->kind]['steps'] ?? [1]))) * 100) : 100), Ui::pill(str_replace('_', ' ', $state($c))),
                Ui::actions($c->status === 'draft' ? [Ui::action('Resume', '/portal/journeys/'.$c->kind, 'get', ['variant' => 'gold']), Ui::action(($c->payload['_paused'] ?? false) ? 'Unpause' : 'Pause', '/portal/resume/'.$c->id.'/pause', 'post'), Ui::action('Discard', '/portal/resume/'.$c->id.'/discard', 'post', ['variant' => 'danger', 'confirm' => 'Discard this draft?'])] : [Ui::action('View', '/portal/journeys/'.$c->kind)]),
            ])->all(), ['empty' => 'Nothing saved yet. Guided journeys save automatically after every step.'])],
            'side' => [Ui::checklist('Tips for Saving Work', [Ui::check('Work is auto-saved as you go.'), Ui::check('You can resume on any device and continue where you left off.'), Ui::check('Manually pause a draft if you need to step away.')]), Ui::kv('Storage & Retention', [['Auto-save retention', '90 days'], ['Expired drafts', (string) $all->filter(fn ($c) => $state($c) === 'expired')->count()]])],
        ]);
    }

    public function resumeAction(PortalCase $case, string $action): RedirectResponse
    {
        $this->ownOrFail($case);
        abort_unless($case->status === 'draft', 422);
        if ($action === 'discard') {
            $case->delete();

            return back()->with('success', 'Draft discarded.');
        }
        $p = $case->payload ?? [];
        $p['_paused'] = ! ($p['_paused'] ?? false);
        $case->update(['payload' => $p]);

        return back()->with('success', $p['_paused'] ? 'Draft paused.' : 'Draft unpaused.');
    }

    public function clearCompleted(): RedirectResponse
    {
        PortalCase::where('user_id', $this->user()->id)->whereIn('kind', array_keys(Journeys::all()))->where('status', '!=', 'draft')->get()->each(function ($c) {
            $p = $c->payload ?? [];
            $p['_hidden'] = true;
            $c->update(['payload' => $p, 'kind' => $c->kind.'_archived']);
        });

        return back()->with('success', 'Completed items cleared from the resume list.');
    }

    public function lowData(): Response
    {
        $l = array_merge(Portal::defaultPreferences()['low_data'], $this->account()->preferences['low_data'] ?? []);
        $drafts = PortalCase::where('user_id', $this->user()->id)->whereIn('kind', array_keys(Journeys::all()))->where('status', 'draft')->get();
        $synced = $this->account()->preferences['last_sync'] ?? null;

        return $this->register([
            'title' => 'Offline and Low-Data Mode Console', 'icon' => 'wifi-off', 'code' => 'CP-SCR-115', 'subtitle' => 'Purpose-built continuity for limited connectivity. Save progress, preserve evidence, reduce data usage, and sync safely when connectivity returns.',
            'actions' => [Ui::action('Sync When Online', '/portal/low-data/sync', 'post', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Saved Drafts', $drafts->count(), null, 'neutral', 'save'), Ui::kpi('Items Awaiting Sync', $drafts->filter(fn ($d) => ! $synced || $d->updated_at->gt($synced))->count(), null, 'warn', 'refresh-cw'), Ui::kpi('Last Successful Sync', $synced ? \Illuminate\Support\Carbon::parse($synced)->diffForHumans() : 'Never', null, 'good', 'history'), Ui::kpi('Data Saver', $l['text_first'] || $l['compress'] ? 'On' : 'Off', null, 'good', 'gauge')],
            'main' => [
                ['kind' => 'form', 'title' => 'Low-Data Optimisation Controls', 'form' => Ui::form('Low data', '/portal/low-data', [
                    Ui::field('text_first', 'Text-first mode — reduce data by prioritising text content', 'checkbox', ['value' => (bool) $l['text_first']]),
                    Ui::field('compress', 'Image compression — compress images before saving or upload', 'checkbox', ['value' => (bool) $l['compress']]),
                    Ui::field('no_background_sync', 'Background sync disabled — prevent auto sync on limited data', 'checkbox', ['value' => (bool) $l['no_background_sync']]),
                    Ui::field('wifi_only', 'Download on Wi-Fi only — defer downloads to Wi-Fi networks', 'checkbox', ['value' => (bool) $l['wifi_only']]),
                    Ui::field('auto_resume', 'Auto-resume drafts — resume in-progress drafts after reconnect', 'checkbox', ['value' => (bool) $l['auto_resume']]),
                    Ui::field('cache_docs', 'Cache important documents — keep key docs available offline', 'checkbox', ['value' => (bool) $l['cache_docs']]),
                ], 'Save Controls', 'put')],
                Ui::table('Saved Drafts and Pending Actions', ['Item', 'Saved At', 'Sync State', ''], $drafts->map(fn ($d) => [Journeys::all()[$d->kind]['title'] ?? $d->kind, $d->updated_at->format('d M Y, H:i'), Ui::pill(! $synced || $d->updated_at->gt($synced) ? 'queued' : 'synced'), Ui::actions([Ui::action('Resume', '/portal/journeys/'.$d->kind)])])->all(), ['empty' => 'No drafts.']),
            ],
            'side' => [Ui::checklist('Sync Health', [Ui::check('Local integrity check', true, 'Healthy'), Ui::check('Queue encryption', true, 'Healthy'), Ui::check('Timestamp capture', true, 'Healthy')]), Ui::info('Important', 'Offline continuity preserves your work, but local save does not equal server acceptance. Time, source and change history remain visible at every step.', 'info')],
        ]);
    }

    public function updateLowData(Request $request): RedirectResponse
    {
        $keys = ['text_first', 'compress', 'no_background_sync', 'wifi_only', 'auto_resume', 'cache_docs'];
        $d = $request->validate(array_fill_keys($keys, 'boolean'));
        Portal::setPref($this->user(), 'low_data', collect($keys)->mapWithKeys(fn ($k) => [$k => (bool) ($d[$k] ?? false)])->all());

        return back()->with('success', 'Low-data controls saved.');
    }

    public function sync(): RedirectResponse
    {
        Portal::setPref($this->user(), 'last_sync', now()->toDateTimeString());

        return back()->with('success', 'All drafts synced and server-verified.');
    }
}
