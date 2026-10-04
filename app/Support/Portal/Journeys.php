<?php

namespace App\Support\Portal;

use App\Models\Portal\Consent;
use App\Models\Portal\Membership;
use App\Models\Portal\Organisation;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Project;
use App\Models\Portal\SecurityEvent;
use App\Models\User;

/**
 * Multi-step guided journeys (entry gates EG-01..EG-06, intake, offboarding,
 * ownership disputes). Progress is saved server-side in portal_cases after
 * every step so clients can resume on any device (CP-TEB Part 35).
 */
class Journeys
{
    public static function all(?User $user = null): array
    {
        $f = fn (...$a) => Ui::field(...$a);
        $o = fn (array $v) => Ui::options($v);

        return [
            'verification' => ['title' => 'Identity and Contact Verification', 'code' => 'CP-SCR-006', 'icon' => 'scan-face', 'prefix' => 'VER', 'subtitle' => 'Verify your contact details and identity. Friction rises only when risk, authority or data sensitivity requires it.',
                'steps' => [
                    ['key' => 'personal', 'title' => 'Personal Information', 'description' => 'Confirm your legal name and contact details.', 'fields' => [$f('full_name', 'Full legal name', 'text', ['required' => true, 'value' => $user?->name]), $f('email', 'Email address', 'email', ['required' => true, 'value' => $user?->email])]],
                    ['key' => 'phone', 'title' => 'Phone Verification', 'description' => 'We will send a 6-digit code to your mobile (valid 10 minutes).', 'fields' => [$f('mobile', 'Mobile number', 'text', ['required' => true, 'value' => $user?->phone]), $f('method', 'Verification method', 'radio', ['required' => true, 'value' => 'sms', 'options' => [['value' => 'sms', 'label' => 'SMS (Recommended)'], ['value' => 'voice', 'label' => 'Voice Call']]]), $f('code', 'Verification code', 'text', ['required' => true, 'hint' => 'Demo environment: enter the code shown in the notice above.'])]],
                    ['key' => 'identity', 'title' => 'Identity Document', 'description' => 'Upload a valid government-issued ID.', 'fields' => [$f('id_type', 'Document type', 'select', ['required' => true, 'options' => $o(['SA ID Card', 'SA Green ID Book', 'Passport', 'Driver\'s Licence'])]), $f('id_number', 'Document number', 'text', ['required' => true]), $f('id_file', 'Upload document', 'file', ['required' => true])]],
                    ['key' => 'address', 'title' => 'Address Verification', 'description' => 'Provide your business or residential address.', 'fields' => [$f('address', 'Street address', 'text', ['required' => true]), $f('city', 'City', 'text', ['required' => true]), $f('postal', 'Postal code', 'text', ['required' => true])]],
                    ['key' => 'review', 'title' => 'Review & Confirmation', 'description' => 'Confirm the information is accurate.', 'fields' => [$f('accurate', 'I confirm the information provided is accurate and belongs to me.', 'checkbox', ['required' => true])]],
                ],
                'done' => 'Your verification has been submitted. You will receive full portal access once all checks complete.', 'step_key' => 'identity_verified'],
            'duplicate' => ['title' => 'Resolve Duplicate Accounts', 'code' => 'CP-SCR-005', 'icon' => 'users', 'prefix' => 'DUP', 'subtitle' => 'We found existing records that may match your details. Choose how to resolve them — your choice is secure and logged.',
                'steps' => [
                    ['key' => 'review', 'title' => 'Review Possible Matches', 'description' => 'Possible match: '.($user?->name ?? 'You').' · '.($user?->email ?? '').' (exact email match, 96% match score).', 'fields' => [$f('decision', 'What would you like to do?', 'radio', ['required' => true, 'options' => [['value' => 'existing', 'label' => 'This is my existing account', 'hint' => 'Use the existing record'], ['value' => 'merge', 'label' => 'Merge my accounts', 'hint' => 'Combine records after verification'], ['value' => 'not_me', 'label' => 'None of these are me', 'hint' => 'Keep records separate'], ['value' => 'help', 'label' => 'Need help deciding', 'hint' => 'Talk to our identity team']]])]],
                    ['key' => 'confirm', 'title' => 'Confirm', 'description' => 'Email possession alone is not authority — merges are reviewed by our identity team.', 'fields' => [$f('notes', 'Anything we should know?', 'textarea'), $f('consent', 'I authorise TBCA to compare and, where I chose merge, combine my records.', 'checkbox', ['required' => true])]],
                ], 'done' => 'Thank you. Our identity team will resolve the duplicate within 2 business days.'],
            'organisation' => ['title' => 'Organisation Match or Create', 'code' => 'CP-SCR-009', 'icon' => 'building-2', 'prefix' => 'ORG', 'subtitle' => 'This helps us verify your relationship with your organisation and apply the correct permissions and entitlements across the portal.',
                'steps' => [
                    ['key' => 'match', 'title' => 'Search for your organisation', 'description' => 'Select a verified match or choose to create a new organisation.', 'fields' => [$f('organisation_id', 'Organisation', 'radio', ['required' => true, 'options' => array_merge(Organisation::where('verified', true)->orderBy('id')->take(4)->get()->map(fn ($x) => ['value' => (string) $x->id, 'label' => $x->name, 'hint' => trim(($x->registration_number ?? '').' · '.($x->country ?? ''))])->all(), [['value' => 'new', 'label' => 'Create a new organisation', 'hint' => "Can't find your organisation?"]])])]],
                    ['key' => 'details', 'title' => 'Organisation details', 'description' => 'Only needed for a new organisation.', 'fields' => [$f('name', 'Registered name', 'text'), $f('registration_number', 'Registration number', 'text'), $f('website', 'Website / domain', 'text')]],
                    ['key' => 'relationship', 'title' => 'Your relationship', 'description' => 'We confirm your relationship and assign permissions.', 'fields' => [$f('relationship', 'Relationship to organisation', 'select', ['required' => true, 'options' => $o(['Director', 'Employee', 'Shareholder', 'Appointed Representative', 'Consultant'])]), $f('job_title', 'Job title', 'text', ['value' => $user?->job_title])]],
                ], 'done' => 'Organisation linked. Permissions will be applied once verification completes.', 'step_key' => 'organisation_matched'],
            'authority' => ['title' => 'Authority and Delegation Setup', 'code' => 'CP-SCR-010', 'icon' => 'key-round', 'prefix' => 'AUTH', 'subtitle' => 'Authority is narrower than identity. Confirm your role, authority basis, permissions and any delegates.',
                'steps' => [
                    ['key' => 'role', 'title' => 'Your Role and Authority', 'description' => 'How are you authorised to act for the organisation?', 'fields' => [$f('relationship', 'Relationship to organisation', 'select', ['required' => true, 'options' => $o(['Employee', 'Director', 'Shareholder', 'Appointed Agent'])]), $f('portal_role', 'Role in Client Portal', 'select', ['required' => true, 'options' => $o(['Primary Authorised Contact', 'Finance Contact', 'Project Contact', 'Viewer'])]), $f('basis', 'Authority basis', 'select', ['required' => true, 'options' => $o(['Written Delegation', 'Board Resolution', 'Directorship (CIPC)', 'Power of Attorney'])]), $f('start', 'Effective start date', 'date', ['required' => true, 'value' => now()->toDateString()]), $f('act', 'Can you act alone?', 'radio', ['required' => true, 'value' => 'alone', 'options' => [['value' => 'alone', 'label' => 'Act Alone'], ['value' => 'approval', 'label' => 'Requires Approval']]])]],
                    ['key' => 'permissions', 'title' => 'Access Permissions', 'description' => 'Choose what you need. Requests outside your basis are marked Limited for review.', 'fields' => [$f('permissions', 'Permissions requested', 'checkboxes', ['required' => true, 'value' => ['view_documents', 'upload_files', 'approve_deliverables', 'book_meetings'], 'options' => collect(Roles::PERMISSIONS)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values()->all()])]],
                    ['key' => 'delegate', 'title' => 'Delegate Authority (Optional)', 'description' => 'Add a delegate with a limited scope and validity period.', 'fields' => [$f('delegate_name', 'Delegate name', 'text'), $f('delegate_email', 'Delegate email', 'email'), $f('delegate_scope', 'Scope of authority', 'select', ['options' => $o(['Invoices & Payments Only', 'Projects & Deliverables', 'Documents Only'])]), $f('delegate_until', 'Effective until', 'date')]],
                ], 'done' => 'Authority setup submitted for review. You can keep uploading documents and viewing information meanwhile.', 'step_key' => 'authority_setup'],
            'terms' => ['title' => 'Terms, Privacy and Consent', 'code' => 'CP-SCR-011', 'icon' => 'file-lock', 'prefix' => 'TPC', 'subtitle' => 'Review the Terms of Use (v1.2) and Privacy Notice (v1.2), then record your consent choices. Optional consents can be changed any time.',
                'steps' => [
                    ['key' => 'terms', 'title' => 'Terms of Use & Privacy Notice', 'description' => 'Account use & responsibilities · Data handling & protection · Communication preferences · Document retention · Human support & escalation.', 'fields' => [$f('essential', 'Essential Platform Consent — I agree to the Terms of Use and acknowledge the Privacy Notice.', 'checkbox', ['required' => true])]],
                    ['key' => 'consents', 'title' => 'Consent Preferences', 'description' => 'Optional consents. Your choices are recorded and can be updated in account settings.', 'fields' => [$f('optional', 'Optional consents', 'checkboxes', ['options' => [['value' => 'service_updates', 'label' => 'Service Updates'], ['value' => 'marketing', 'label' => 'Marketing Communications'], ['value' => 'whatsapp', 'label' => 'WhatsApp Contact Permission'], ['value' => 'analytics', 'label' => 'Analytics & Improvement']]])]],
                ], 'done' => 'Your choices are recorded. You can update them any time in the Consent Centre.', 'step_key' => 'terms_consent'],
            'intake' => ['title' => 'Service Intake', 'code' => 'CP-SCR-035', 'icon' => 'inbox', 'prefix' => 'INT', 'subtitle' => 'Tell us what you need. We reuse information you have already given us.',
                'steps' => [
                    ['key' => 'service', 'title' => 'Choose Service', 'description' => 'Select what you need.', 'fields' => [$f('service', 'Service', 'select', ['required' => true, 'options' => $o(['Market Entry Strategy', 'Business Plan Development', 'Due Diligence', 'Feasibility Study', 'Regulatory & Compliance', 'Funding & Investor Support', 'Project Management', 'Specialist Advisory'])]), $f('engagement_type', 'Engagement type', 'select', ['required' => true, 'options' => $o(['Project', 'Advisory', 'Retainer', 'Not sure'])])]],
                    ['key' => 'details', 'title' => 'Provide Details', 'description' => 'Your organisation profile is reused automatically — just tell us about this need.', 'fields' => [$f('objective', 'What outcome do you need?', 'textarea', ['required' => true]), $f('timeline', 'Desired timeline', 'select', ['options' => $o(['ASAP', '1-3 months', '3-6 months', '6+ months'])]), $f('budget', 'Indicative budget (ZAR)', 'select', ['options' => $o(['Under R50 000', 'R50 000 – R150 000', 'R150 000 – R500 000', 'Over R500 000'])]), $f('file', 'Supporting document (optional)', 'file')]],
                    ['key' => 'confirm', 'title' => 'Review & Confirm', 'description' => 'Submitting creates a request our team responds to, usually within 1 business day.', 'fields' => [$f('reuse', 'Reuse my confirmed company profile and documents for this request.', 'checkbox', ['value' => true]), $f('confirm', 'I confirm these details are accurate.', 'checkbox', ['required' => true])]],
                ], 'done' => 'Your request has been submitted securely. Our team reviews and responds, usually within 1 business day.', 'step_key' => 'service_preferences'],
            'offboarding' => ['title' => 'Team-Member Offboarding', 'code' => 'CP-SCR-085', 'icon' => 'user-x', 'prefix' => 'OFF', 'subtitle' => 'Securely offboard a team member and revoke access to all systems and data. All items must be completed before access is revoked.',
                'steps' => [
                    ['key' => 'member', 'title' => 'Select Member', 'description' => 'Choose the member to offboard.', 'fields' => [$f('member_id', 'Team member', 'select', ['required' => true, 'options' => $user ? Membership::where('organisation_id', Portal::account($user)->organisation_id)->where('status', 'active')->where('is_primary', false)->get()->map(fn ($m) => ['value' => (string) $m->id, 'label' => $m->name.' – '.$m->job_title])->values()->all() : []]), $f('reason', 'Reason for offboarding', 'select', ['required' => true, 'options' => $o(['Role Change / Resignation', 'Contract Ended', 'Security Concern', 'Other'])]), $f('date', 'Offboarding date', 'date', ['required' => true, 'value' => now()->toDateString()])]],
                    ['key' => 'review', 'title' => 'Review Access', 'description' => 'Roles, projects, documents, owned deliverables, tasks and delegated access will be updated.', 'fields' => [$f('reviewed', 'I have reviewed the member\'s roles, access and ownership.', 'checkbox', ['required' => true])]],
                    ['key' => 'transfer', 'title' => 'Transfer & Reassign', 'description' => 'Transfer ownership and delegate tasks.', 'fields' => [$f('reassign_to', 'Reassign deliverables, tasks and threads to', 'text', ['required' => true, 'value' => $user?->name]), $f('checklist', 'Offboarding checklist', 'checkboxes', ['required' => true, 'options' => $o(['deliverables' => 'Reassign owned deliverables and documents', 'tasks' => 'Delegate open tasks and responsibilities', 'threads' => 'Transfer client communications and threads', 'export' => 'Export or archive required data (optional)', 'approvals' => 'Confirm settlement of outstanding approvals'])])]],
                    ['key' => 'revoke', 'title' => 'Revoke Access', 'description' => 'This immediately revokes the member\'s access to all systems upon completion.', 'fields' => [$f('confirm', 'Revoke system access and active sessions now.', 'checkbox', ['required' => true])]],
                ], 'done' => 'Offboarding complete. Access revoked and the audit record has been created.', 'stepup' => true],
            'ownership-dispute' => ['title' => 'Raise an Account Ownership Dispute', 'code' => 'CP-SCR-084', 'icon' => 'user-x', 'prefix' => 'DISP', 'subtitle' => 'Our security team will investigate. Disputed ownership does not allow either side to self-approve changes.',
                'steps' => [
                    ['key' => 'issue', 'title' => 'Describe the issue', 'fields' => [$f('subject', 'Subject', 'select', ['required' => true, 'options' => $o(['Unauthorised access to my account', 'Dispute over account ownership', 'Someone else controls our organisation', 'Other'])]), $f('details', 'What happened?', 'textarea', ['required' => true]), $f('when', 'When did you notice?', 'date', ['required' => true])]],
                    ['key' => 'evidence', 'title' => 'Evidence', 'fields' => [$f('evidence', 'Supporting evidence (optional)', 'file'), $f('contact', 'Best contact number', 'text', ['value' => $user?->phone])]],
                ], 'done' => 'Your dispute has been raised. Our security team will contact you within 1 business day.'],
        ];
    }

    /** Side effects when a journey is submitted. Returns a flash message. */
    public static function complete(string $key, PortalCase $case, User $user): string
    {
        $d = $case->payload ?? [];
        $def = self::all($user)[$key];
        if (! empty($def['step_key'])) {
            Portal::completeStep($user, $def['step_key'], in_array($key, ['authority', 'verification'], true) ? 'in_progress' : 'completed');
        }

        switch ($key) {
            case 'terms':
                foreach (['service_updates', 'marketing', 'whatsapp', 'analytics'] as $c) {
                    $on = in_array($c, $d['optional'] ?? [], true);
                    Consent::where('user_id', $user->id)->where('key', $c)->update($on ? ['status' => 'active', 'given_at' => now(), 'expires_at' => now()->addYear()] : ['status' => 'withdrawn', 'withdrawn_at' => now()]);
                }
                Consent::where('user_id', $user->id)->where('key', 'essential')->update(['status' => 'active', 'given_at' => now()]);
                break;
            case 'organisation':
                $account = Portal::account($user);
                if (($d['organisation_id'] ?? '') === 'new' && ! empty($d['name'])) {
                    $org = Organisation::create(['reference' => 'ORG-'.str_pad((string) (Organisation::max('id') + 1), 3, '0', STR_PAD_LEFT), 'name' => $d['name'], 'registration_number' => $d['registration_number'] ?? null, 'website' => $d['website'] ?? null, 'verified' => false]);
                } else {
                    $org = Organisation::find((int) ($d['organisation_id'] ?? 0)) ?? $account->organisation;
                }
                Membership::updateOrCreate(['organisation_id' => $org->id, 'email' => $user->email], ['user_id' => $user->id, 'name' => $user->name, 'role' => 'owner', 'access_group' => 'Full Access', 'status' => 'active', 'job_title' => $d['job_title'] ?? null]);
                $account->update(['organisation_id' => $org->id]);
                break;
            case 'intake':
                $case->update(['title' => $d['service'] ?? 'Service request', 'status' => 'under_review']);
                break;
            case 'offboarding':
                $m = Membership::find((int) ($d['member_id'] ?? 0));
                if ($m && $m->organisation_id === Portal::account($user)->organisation_id && ! $m->is_primary) {
                    $m->update(['status' => 'offboarded', 'offboarded_at' => now(), 'offboard_reason' => $d['reason'] ?? null, 'meta' => ['reassigned_to' => $d['reassign_to'] ?? null]]);
                    SecurityEvent::create(['user_id' => $user->id, 'event' => 'team_offboard', 'details' => "Offboarded {$m->name}; reassigned to ".($d['reassign_to'] ?? '—'), 'status' => 'verified', 'occurred_at' => now()]);
                    $case->update(['title' => 'Offboard '.$m->name, 'status' => 'completed', 'resolved_at' => now()]);
                }
                break;
            case 'ownership-dispute':
                $case->update(['kind' => 'ownership_dispute', 'title' => $d['subject'] ?? 'Ownership dispute', 'status' => 'under_review', 'priority' => 'high']);
                break;
            case 'duplicate':
                $case->update(['status' => ($d['decision'] ?? '') === 'existing' ? 'resolved' : 'under_review']);
                break;
        }

        Portal::notify($user, $def['title'].' submitted', ($case->reference ?? '').' — '.$def['done'], 'system', '/portal/resume', 'Save-State & Resume');

        return $def['done'];
    }

    public static function projectsFor(User $user)
    {
        return Project::where('user_id', $user->id)->get();
    }
}
