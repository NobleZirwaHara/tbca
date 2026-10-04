<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Folder;
use App\Models\DealRoom\Party;
use App\Models\DealRoom\Room;
use App\Models\User;

/**
 * Who may see and do what inside a room. The room owner, TBCA admins and
 * active parties may enter; each role maps to the permission matrix shown on
 * the Parties & Roles screen, and folders are filtered by role and staged
 * disclosure.
 */
class Access
{
    public const INTERNAL_ROLES = ['owner', 'tbca_advisor', 'finance', 'legal'];

    public const ROLES = [
        'owner' => 'Founder / Seller',
        'tbca_advisor' => 'TBCA Advisor',
        'finance' => 'Internal Finance Lead',
        'legal' => 'Internal Legal / Company Secretary',
        'investor' => 'Buyer / Investor',
        'lender' => 'Bank / DFI',
        'advisor' => 'Lawyer / Advisor',
        'auditor' => 'Accountant / Auditor',
        'valuer' => 'Valuer / Tax Advisor',
        'government' => 'Government / PPP Reviewer',
    ];

    public const PERMISSIONS = ['view', 'upload', 'ask_qa', 'approve_disclosure', 'download', 'ai_access', 'approve_invite', 'approve_publish'];

    /** Permission matrix: yes | limited | no. */
    public static function matrix(): array
    {
        $all = array_fill_keys(self::PERMISSIONS, 'yes');

        return [
            'owner' => $all,
            'tbca_advisor' => $all,
            'finance' => [...$all, 'approve_disclosure' => 'no', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'legal' => [...$all, 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'investor' => ['view' => 'yes', 'upload' => 'limited', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'limited', 'ai_access' => 'limited', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'lender' => ['view' => 'yes', 'upload' => 'limited', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'limited', 'ai_access' => 'yes', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'advisor' => ['view' => 'yes', 'upload' => 'yes', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'yes', 'ai_access' => 'yes', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'auditor' => ['view' => 'yes', 'upload' => 'yes', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'limited', 'ai_access' => 'yes', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'valuer' => ['view' => 'yes', 'upload' => 'yes', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'limited', 'ai_access' => 'yes', 'approve_invite' => 'no', 'approve_publish' => 'no'],
            'government' => ['view' => 'yes', 'upload' => 'no', 'ask_qa' => 'yes', 'approve_disclosure' => 'no', 'download' => 'no', 'ai_access' => 'limited', 'approve_invite' => 'no', 'approve_publish' => 'no'],
        ];
    }

    public static function party(Room $room, User $user): ?Party
    {
        return $room->parties()
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('email', $user->email))
            ->whereIn('status', ['active', 'invited'])
            ->first();
    }

    /** Role of the user in the room, or null if they may not enter. */
    public static function role(Room $room, ?User $user): ?string
    {
        if (! $user) {
            return null;
        }
        if ($room->user_id === $user->id) {
            return 'owner';
        }
        if ($user->isAdmin()) {
            return 'tbca_advisor';
        }
        $party = self::party($room, $user);

        return $party && $party->status === 'active' ? $party->role : null;
    }

    public static function authorize(Room $room, ?User $user): string
    {
        $role = self::role($room, $user);
        abort_unless($role !== null, 403, 'You are not a party to this deal room.');

        return $role;
    }

    /** Owner-side (sponsor or TBCA) management rights. */
    public static function manages(Room $room, ?User $user): bool
    {
        return in_array(self::role($room, $user), ['owner', 'tbca_advisor'], true);
    }

    public static function can(Room $room, ?User $user, string $permission): bool
    {
        $role = self::role($room, $user);

        return $role !== null && (self::matrix()[$role][$permission] ?? 'no') !== 'no';
    }

    public static function isInternal(?string $role): bool
    {
        return in_array($role, self::INTERNAL_ROLES, true);
    }

    /** Folders visible to a role: internal roles see all; externals see released folders permitted to their role. */
    public static function folderVisible(Folder $folder, ?string $role): bool
    {
        if (self::isInternal($role)) {
            return true;
        }
        if ($folder->staged && ! $folder->released_at) {
            return false;
        }

        return empty($folder->roles) || in_array($role, $folder->roles, true);
    }

    /** Approvals the client may record themselves; TBCA-side approvals need an administrator. */
    public static function clientCanDecide(string $approverRole): bool
    {
        return ! preg_match('/TBCA|Head of Finance|Finance Approval|Finance Review|Independent Valuer|Human Review|Restart Authoriser|Refund Authoriser|Reconciliation|Buyer Counsel|Investor Representative/i', $approverRole);
    }

    public static function watermark(User $user): string
    {
        return 'CONFIDENTIAL · '.$user->email.' · '.now()->format('d M Y H:i');
    }
}
