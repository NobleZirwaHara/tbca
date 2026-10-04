<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Rooms;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Stage 0 guided set-up wizard (VDR-005 to VDR-009): deal basics, parties
 * and roles, security, template and tools, review and create. Progress is
 * kept on the room (setup.draft); it opens only once Stage C has cleared.
 */
class SetupController extends Controller
{
    use LoadsRoom;

    public const STEPS = ['deal-basics', 'parties-and-roles', 'security-setup', 'template-and-tools', 'review-and-create'];

    public const MODULES = ['Document Index & Folder Structure', 'Due Diligence Checklist', 'Q&A Board', 'Risk Register', 'Buyer / Investor Activity Analytics', 'Financial Analysis & QoE', 'Valuation Module', 'Negotiation Room', 'Legal Workspace', 'Closing Pack Builder'];

    public const AI_TOOLS = ['AI Folder Structure Generator', 'Missing Document Detector', 'AI Source-Linked Q&A', 'AI Summaries & Red Flags', 'Weekly Deal Intelligence', 'Auto-Translation'];

    public const GROUPS = [
        'Buyers / Investors' => ['role' => 'investor', 'scope' => 'Due diligence'],
        'Bank / DFI' => ['role' => 'lender', 'scope' => 'Lending review'],
        'Lawyers / Advisors' => ['role' => 'advisor', 'scope' => 'Legal diligence'],
        'Government / PPP Reviewers' => ['role' => 'government', 'scope' => 'Regulatory review'],
        'Accountants / Auditors' => ['role' => 'auditor', 'scope' => 'Financial review'],
        'Valuer / Tax Advisor' => ['role' => 'valuer', 'scope' => 'Valuation & tax'],
    ];

    public function show(Request $request, Room $room, string $step): Response
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(in_array($step, self::STEPS, true), 404);

        return Inertia::render('DealRoom/Setup', [
            ...$this->shared($request, $room),
            'step' => $step,
            'steps' => self::STEPS,
            'unlocked' => Workflow::isUnlocked($room, '0'),
            'created' => ! empty($room->setup['created_at'] ?? null),
            'draft' => $this->draft($room),
            'options' => [
                'dealTypes' => Rooms::DEAL_TYPES,
                'templates' => Rooms::TEMPLATES,
                'modules' => self::MODULES,
                'aiTools' => self::AI_TOOLS,
                'groups' => self::GROUPS,
                'roles' => Access::ROLES,
                'matrix' => Access::matrix(),
                'folders' => Rooms::FOLDERS,
            ],
            'commercial' => [
                'depositPaid' => ! empty($room->commercial['deposit_paid_at'] ?? null),
                'stages' => collect(Workflow::stepper($room))->take(5)->values(),
            ],
        ]);
    }

    protected function draft(Room $room): array
    {
        $d = $room->setup['draft'] ?? [];
        $s = $room->security ?? Rooms::defaultSecurity();

        return [
            'role' => $d['role'] ?? 'Founder / Seller',
            'deal_type' => $d['deal_type'] ?? $room->deal_type,
            'name' => $d['name'] ?? 'Project '.$room->name,
            'company' => $d['company'] ?? $room->company,
            'country' => $d['country'] ?? $room->country,
            'sector' => $d['sector'] ?? $room->sector,
            'objective' => $d['objective'] ?? $room->objective,
            'deal_stage' => $d['deal_stage'] ?? ($room->enquiry['current_stage'] ?? 'Preparation'),
            'participants' => $d['participants'] ?? 12,
            'language' => $d['language'] ?? 'English',
            'team' => $d['team'] ?? [
                ['role' => 'tbca_advisor', 'name' => 'John Dlamini', 'email' => 'john.dlamini@thebusinessclinic.africa', 'organisation' => 'The Business Clinic.Africa'],
                ['role' => 'finance', 'name' => 'Michael Tumi', 'email' => 'michael.tumi@'.Str::slug($room->company).'.co.za', 'organisation' => $room->company],
                ['role' => 'legal', 'name' => 'Lerato Pillay', 'email' => 'lerato.pillay@'.Str::slug($room->company).'.co.za', 'organisation' => $room->company],
            ],
            'groups' => $d['groups'] ?? ['Buyers / Investors' => 14, 'Bank / DFI' => 4, 'Lawyers / Advisors' => 6, 'Government / PPP Reviewers' => 5, 'Accountants / Auditors' => 5, 'Valuer / Tax Advisor' => 5],
            'notes' => $d['notes'] ?? "External participants receive staged-disclosure access based on role and purpose.\nBuyer and lender groups are isolated from one another with no cross-view permissions.\nRedacted documents require legal and financial review before full release.\nAll sensitive files are watermarked and download-restricted by default.",
            'kyc_external' => $d['kyc_external'] ?? true,
            'security' => $s,
            'template' => $d['template'] ?? ($room->setup['template'] ?? 'fundraising'),
            'modules' => $d['modules'] ?? array_slice(self::MODULES, 0, 9),
            'ai_tools' => $d['ai_tools'] ?? self::AI_TOOLS,
            'translation' => $d['translation'] ?? 'English only',
            'review_threshold' => $d['review_threshold'] ?? 'High-risk outputs only',
        ];
    }

    public function save(Request $request, Room $room, string $step): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(in_array($step, self::STEPS, true), 404);
        abort_unless(Workflow::isUnlocked($room, '0'), 423, 'Stage 0 is locked until the mandate, engagement and deposit gate clears.');

        $setup = $room->setup ?? [];
        $draft = $setup['draft'] ?? [];

        switch ($step) {
            case 'deal-basics':
                $data = $request->validate([
                    'role' => ['required', 'string', 'max:40'],
                    'deal_type' => ['required', Rule::in(array_keys(Rooms::DEAL_TYPES))],
                    'name' => ['required', 'string', 'max:120'],
                    'company' => ['required', 'string', 'max:160'],
                    'country' => ['required', 'string', 'max:80'],
                    'sector' => ['required', 'string', 'max:80'],
                    'objective' => ['required', 'string', 'max:500'],
                    'deal_stage' => ['required', Rule::in(['Preparation', 'Early Interest', 'Active Diligence', 'Negotiation', 'Closing'])],
                    'participants' => ['required', 'integer', 'min:1', 'max:500'],
                    'language' => ['required', 'string', 'max:30'],
                    'security' => ['required', 'array'],
                ]);
                $room->security = [...($room->security ?? Rooms::defaultSecurity()), ...array_map(fn ($v) => (bool) $v, array_intersect_key($data['security'], array_flip(['nda_gate', 'view_only_default', 'mfa_external', 'watermark', 'ai_human_review', 'activity_logging'])))];
                unset($data['security']);
                $draft = [...$draft, ...$data];
                break;
            case 'parties-and-roles':
                $data = $request->validate([
                    'team' => ['array', 'max:12'],
                    'team.*.role' => ['required', Rule::in(Access::INTERNAL_ROLES)],
                    'team.*.name' => ['required', 'string', 'max:120'],
                    'team.*.email' => ['required', 'email', 'max:190'],
                    'team.*.organisation' => ['nullable', 'string', 'max:160'],
                    'groups' => ['array'],
                    'groups.*' => ['integer', 'min:0', 'max:200'],
                    'notes' => ['nullable', 'string', 'max:1000'],
                    'kyc_external' => ['boolean'],
                    'nda_gate' => ['boolean'],
                    'mfa_external' => ['boolean'],
                    'buyer_groups_visible' => ['boolean'],
                ]);
                if (collect($data['team'] ?? [])->pluck('email')->duplicates()->isNotEmpty()) {
                    return back()->withErrors(['team' => 'Each internal team member needs a unique email (segregation of duties).']);
                }
                $room->security = [...($room->security ?? []), 'nda_gate' => (bool) ($data['nda_gate'] ?? true), 'mfa_external' => (bool) ($data['mfa_external'] ?? true), 'buyer_groups_visible' => (bool) ($data['buyer_groups_visible'] ?? false)];
                $draft = [...$draft, 'team' => $data['team'] ?? [], 'groups' => array_intersect_key($data['groups'] ?? [], self::GROUPS), 'notes' => $data['notes'] ?? null, 'kyc_external' => (bool) ($data['kyc_external'] ?? true)];
                break;
            case 'security-setup':
                $data = $request->validate([
                    'security' => ['required', 'array'],
                    'security.session_timeout' => ['required', 'integer', Rule::in([10, 20, 30, 60])],
                    'security.access_mode' => ['required', Rule::in(['Restricted', 'Standard', 'Open'])],
                    'security.access_scope' => ['required', Rule::in(['Need to Know', 'Group', 'All Documents'])],
                    'security.link_expiry_days' => ['required', 'integer', Rule::in([1, 3, 7, 14, 30])],
                    'security.data_residency' => ['required', Rule::in(['South Africa', 'Kenya', 'Nigeria', 'Mauritius', 'EU'])],
                ]);
                $bools = ['nda_gate', 'mfa_external', 'watermark', 'download_restricted', 'view_only_default', 'ai_human_review', 'activity_logging', 'staged_disclosure', 'buyer_groups_visible', 'confidentiality_labels'];
                $sec = $data['security'];
                foreach ($bools as $b) {
                    $sec[$b] = (bool) ($request->input("security.$b") ?? false);
                }
                $room->security = [...($room->security ?? []), ...$sec];
                Audit::log($room, 'security.configured', 'Security settings configured');
                break;
            case 'template-and-tools':
                $data = $request->validate([
                    'template' => ['required', Rule::in(array_keys(Rooms::TEMPLATES))],
                    'modules' => ['array', 'min:1'],
                    'modules.*' => [Rule::in(self::MODULES)],
                    'ai_tools' => ['array'],
                    'ai_tools.*' => [Rule::in(self::AI_TOOLS)],
                    'translation' => ['required', 'string', 'max:40'],
                    'review_threshold' => ['required', Rule::in(['High-risk outputs only', 'All AI outputs', 'None'])],
                ]);
                $draft = [...$draft, ...$data];
                break;
            case 'review-and-create':
                return $this->create($request, $room);
        }

        $setup['draft'] = $draft;
        $room->setup = $setup;
        $room->save();

        $next = self::STEPS[array_search($step, self::STEPS, true) + 1] ?? 'review-and-create';

        return redirect()->route('deal-room.setup', [$room, $request->boolean('stay') ? $step : $next])->with('success', 'Saved.');
    }

    /** Final step: confirmations, then generate structure, permissions and internal team, and complete Stage 0. */
    protected function create(Request $request, Room $room): RedirectResponse
    {
        $request->validate([
            'confirm_accurate' => ['accepted'], 'confirm_invites' => ['accepted'], 'confirm_ai' => ['accepted'],
        ], ['accepted' => 'Please confirm all three final confirmations.']);
        $draft = $this->draft($room);
        if (empty($room->setup['draft']['name'] ?? null)) {
            return back()->withErrors(['confirm_accurate' => 'Complete the Deal Basics step first.']);
        }

        $room->update([
            'name' => $draft['name'], 'company' => $draft['company'], 'country' => $draft['country'], 'sector' => $draft['sector'],
            'objective' => $draft['objective'], 'deal_type' => $draft['deal_type'],
            'setup' => [...($room->setup ?? []), 'template' => $draft['template'], 'modules' => $draft['modules'], 'ai_tools' => $draft['ai_tools'], 'created_at' => now()->toIso8601String()],
        ]);
        Rooms::ensureFolders($room);
        foreach ($draft['team'] as $member) {
            $room->parties()->firstOrCreate(['email' => strtolower($member['email'])], [
                'name' => $member['name'], 'organisation' => $member['organisation'] ?? $room->company, 'role' => $member['role'],
                'access_level' => 'full', 'status' => 'invited', 'invite_token' => Str::random(40), 'invited_at' => now(), 'invite_expires_at' => now()->addDays(14),
            ]);
        }
        Audit::log($room, 'room.created', 'Deal room created in controlled admin mode with staged disclosure', $request->user()->name);
        Workflow::complete($room->fresh(), '0', $request->user()->name);

        return redirect()->route('deal-room.rooms.page', [$room, 'created'])->with('success', 'Deal room created successfully.');
    }
}
