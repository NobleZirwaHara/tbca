<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Room;
use App\Models\User;
use Illuminate\Support\Str;

/** Room creation, defaults and the shared header payload used by every room page. */
class Rooms
{
    public const DEAL_TYPES = [
        'fundraising' => 'Fundraising',
        'ma' => 'Company Sale / M&A',
        'due_diligence' => 'Due Diligence',
        'lending' => 'Lending / Credit Review',
        'partnership' => 'Strategic Partnership / JV',
        'procurement' => 'Procurement / PPP',
    ];

    public const TEMPLATES = [
        'fundraising' => ['name' => 'Fundraising Room', 'description' => 'For equity, debt and investor readiness processes.'],
        'ma_seller' => ['name' => 'M&A Seller Room', 'description' => 'For company sale preparation and managed disclosure.'],
        'buyer_dd' => ['name' => 'Buyer Due Diligence Room', 'description' => 'For buyer-side target review and diligence workflows.'],
        'lending' => ['name' => 'Lending / Credit Review Room', 'description' => 'For banks, DFIs and credit committees.'],
        'ppp' => ['name' => 'PPP / Strategic Partnership Room', 'description' => 'For structured procurement, PPPs and JV processes.'],
    ];

    public const FOLDERS = [
        '01. Company Overview', '02. Financial Information', '03. Legal & Corporate', '04. Commercial & Operations', '05. Capitalisation & Investors',
        '06. Marketing & Sales', '07. Risk & Compliance', '08. Environmental, Social & Governance', '09. Other Documents',
    ];

    public static function defaultSecurity(): array
    {
        return [
            'nda_gate' => true, 'mfa_external' => true, 'watermark' => true, 'download_restricted' => true, 'view_only_default' => true,
            'ai_human_review' => true, 'activity_logging' => true, 'session_timeout' => 20, 'access_mode' => 'Restricted', 'access_scope' => 'Need to Know',
            'staged_disclosure' => true, 'buyer_groups_visible' => false, 'link_expiry_days' => 7, 'data_residency' => 'South Africa', 'confidentiality_labels' => true,
            'print' => 'Restricted', 'pdf_expiry_days' => 30, 'copy_paste' => 'Enabled',
        ];
    }

    public static function create(User $user, array $data): Room
    {
        $base = Str::slug($data['name']);
        $slug = $base;
        $i = 2;
        while (Room::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        $room = Room::create([
            'reference' => 'DR-'.now()->format('Y').'-PENDING-'.Str::random(6),
            'slug' => $slug,
            'user_id' => $user->id,
            'name' => $data['name'],
            'company' => $data['company'],
            'country' => $data['country'] ?? 'South Africa',
            'sector' => $data['sector'] ?? null,
            'deal_type' => $data['deal_type'] ?? 'fundraising',
            'transaction_type' => $data['transaction_type'] ?? 'Fundraising & Growth Capital Raise',
            'objective' => $data['objective'] ?? null,
            'amount_zar' => $data['amount_zar'] ?? 0,
            'target_close_date' => $data['target_close_date'] ?? null,
            'current_stage' => 'A',
            'status' => 'active',
            'enquiry' => $data['enquiry'] ?? null,
            'security' => self::defaultSecurity(),
            'plan' => ['name' => 'TBCA Growth Raise Plan — Standard'],
        ]);
        $room->update(['reference' => sprintf('DR-%s-%06d', now()->format('Y'), $room->id + 127)]);

        $room->parties()->create([
            'user_id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'organisation' => $data['company'],
            'role' => 'owner', 'access_level' => 'full', 'status' => 'active', 'accepted_at' => now(), 'nda_accepted_at' => now(),
        ]);
        Workflow::ensureStages($room);
        Audit::log($room, 'deal.enquiry_received', 'Deal enquiry received for '.$room->name, $user->name);

        return $room;
    }

    public static function ensureFolders(Room $room): void
    {
        if ($room->folders()->exists()) {
            return;
        }
        foreach (self::FOLDERS as $i => $name) {
            $room->folders()->create(['position' => $i + 1, 'name' => $name, 'staged' => true]);
        }
    }

    /** Header card payload shared by all room pages. */
    public static function header(Room $room, ?User $user): array
    {
        $current = (string) $room->current_stage;
        $next = Stages::next($current);

        return [
            'slug' => $room->slug,
            'reference' => $room->reference,
            'name' => $room->name,
            'company' => $room->company,
            'country' => $room->country,
            'sector' => $room->sector,
            'dealType' => self::DEAL_TYPES[$room->deal_type] ?? $room->deal_type,
            'transactionType' => $room->transaction_type,
            'amount' => (int) $room->amount_zar,
            'status' => $room->status,
            'pausedReason' => $room->paused_reason,
            'currentStage' => ['code' => $current, 'name' => Stages::get($current)['name'], 'page' => Stages::get($current)['page']],
            'nextStage' => $next !== null ? ['code' => $next, 'name' => Stages::get($next)['name']] : null,
            'role' => Access::role($room, $user),
            'manages' => Access::manages($room, $user),
            'stepper' => Workflow::stepper($room),
        ];
    }
}
