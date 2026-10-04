<?php

namespace App\Support\Portal;

/** Client organisation roles and permission matrix (CP-TEB Part 7). */
class Roles
{
    public const PERMISSIONS = [
        'view_documents' => 'View documents', 'upload_files' => 'Upload files', 'approve_deliverables' => 'Approve deliverables',
        'manage_finance' => 'Manage invoices & payments', 'book_meetings' => 'Book meetings', 'dd_workspace' => 'Access due diligence workspace',
        'manage_team' => 'Add team members', 'manage_org' => 'Edit organisation profile', 'whatsapp' => 'Receive WhatsApp notifications',
    ];

    public const ROLES = [
        'owner' => ['label' => 'Owner / Director', 'group' => 'Full Access', 'permissions' => ['view_documents', 'upload_files', 'approve_deliverables', 'manage_finance', 'book_meetings', 'dd_workspace', 'manage_team', 'manage_org', 'whatsapp']],
        'admin' => ['label' => 'Administrator', 'group' => 'Full Access', 'permissions' => ['view_documents', 'upload_files', 'approve_deliverables', 'manage_finance', 'book_meetings', 'dd_workspace', 'manage_team', 'manage_org', 'whatsapp']],
        'manager' => ['label' => 'Manager', 'group' => 'Full Access', 'permissions' => ['view_documents', 'upload_files', 'approve_deliverables', 'book_meetings', 'whatsapp']],
        'finance' => ['label' => 'Finance Manager', 'group' => 'Finance Access', 'permissions' => ['view_documents', 'manage_finance', 'whatsapp']],
        'project' => ['label' => 'Project Manager', 'group' => 'Project Access', 'permissions' => ['view_documents', 'upload_files', 'approve_deliverables', 'book_meetings']],
        'compliance' => ['label' => 'Compliance Officer', 'group' => 'Compliance Access', 'permissions' => ['view_documents', 'upload_files', 'dd_workspace']],
        'analyst' => ['label' => 'Analyst', 'group' => 'Limited Access', 'permissions' => ['view_documents', 'upload_files']],
        'contributor' => ['label' => 'Contributor', 'group' => 'Limited Access', 'permissions' => ['view_documents', 'upload_files']],
        'viewer' => ['label' => 'Viewer', 'group' => 'Read Only', 'permissions' => ['view_documents']],
    ];

    public static function label(?string $role): string
    {
        return self::ROLES[$role ?? 'viewer']['label'] ?? ucfirst((string) $role);
    }

    public static function can(?string $role, string $permission): bool
    {
        return in_array($permission, self::ROLES[$role ?? 'viewer']['permissions'] ?? [], true);
    }

    public static function options(): array
    {
        return collect(self::ROLES)->except('owner')->map(fn ($r, $k) => ['value' => $k, 'label' => $r['label']])->values()->all();
    }
}
