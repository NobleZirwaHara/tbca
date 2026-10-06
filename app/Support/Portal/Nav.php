<?php

namespace App\Support\Portal;

/**
 * The Client Portal information architecture (CP-TEB Part 8). Drives the
 * client sidebar, the admin console sidebar and the Portal Sitemap (CP-SCR-137).
 */
class Nav
{
    /** @return list<array{title:string,key:string,icon:string,description:string,items:list<array{label:string,href:string,icon:string}>}> */
    public static function client(): array
    {
        return [
            ['title' => 'Overview', 'key' => 'overview', 'icon' => 'layout-dashboard', 'description' => 'Your personalised control centre with key actions and state at a glance.', 'items' => [
                ['label' => 'Dashboard', 'href' => '/portal/dashboard', 'icon' => 'layout-dashboard'],
                ['label' => 'One Action Centre', 'href' => '/portal/actions', 'icon' => 'list-checks'],
                ['label' => 'Notifications', 'href' => '/portal/notifications', 'icon' => 'bell'],
                ['label' => 'Welcome & Guided Setup', 'href' => '/portal/welcome', 'icon' => 'sparkles'],
                ['label' => 'Next-Best-Route Guide', 'href' => '/portal/next-steps', 'icon' => 'route'],
            ]],
            ['title' => 'Delivery & Workspaces', 'key' => 'delivery', 'icon' => 'folder-kanban', 'description' => 'Projects, sprints, tasks and deliverables.', 'items' => [
                ['label' => 'Projects', 'href' => '/portal/projects', 'icon' => 'folder-kanban'],
                ['label' => 'Tasks & Milestones', 'href' => '/portal/tasks', 'icon' => 'check-square'],
                ['label' => 'Evidence Requests', 'href' => '/portal/evidence', 'icon' => 'file-search'],
                ['label' => 'Deliverables', 'href' => '/portal/deliverables', 'icon' => 'package'],
                ['label' => 'Approvals & Revisions', 'href' => '/portal/approvals', 'icon' => 'stamp'],
                ['label' => 'QA & Release Status', 'href' => '/portal/qa-release', 'icon' => 'badge-check'],
                ['label' => 'Decision & Evidence Timeline', 'href' => '/portal/timeline', 'icon' => 'history'],
                ['label' => 'Meetings & Bookings', 'href' => '/portal/meetings', 'icon' => 'calendar'],
                ['label' => 'Completion & Handover', 'href' => '/portal/closure', 'icon' => 'flag'],
                ['label' => 'Service Intake', 'href' => '/portal/intake', 'icon' => 'inbox'],
                ['label' => 'No-Retelling Data Reuse', 'href' => '/portal/data-reuse', 'icon' => 'recycle'],
            ]],
            ['title' => 'Documents & Resources', 'key' => 'documents', 'icon' => 'folder', 'description' => 'Document vault, uploads, resources and exports.', 'items' => [
                ['label' => 'Document Vault', 'href' => '/portal/documents', 'icon' => 'folder'],
                ['label' => 'Upload Documents', 'href' => '/portal/documents/upload', 'icon' => 'upload'],
                ['label' => 'Resources & Downloads', 'href' => '/portal/resources', 'icon' => 'download'],
                ['label' => 'Digital Products Library', 'href' => '/portal/library', 'icon' => 'library'],
                ['label' => 'Deliverable Portability & Export', 'href' => '/portal/exports', 'icon' => 'archive'],
            ]],
            ['title' => 'Finances & Billing', 'key' => 'finance', 'icon' => 'wallet', 'description' => 'Invoices, payments, statements and fee schedules.', 'items' => [
                ['label' => 'Services & Entitlements', 'href' => '/portal/entitlements', 'icon' => 'key-round'],
                ['label' => 'My Orders', 'href' => '/portal/orders', 'icon' => 'shopping-bag'],
                ['label' => 'Quotations & Proposals', 'href' => '/portal/quotations', 'icon' => 'file-text'],
                ['label' => 'Contracts & Engagement Letters', 'href' => '/portal/contracts', 'icon' => 'file-signature'],
                ['label' => 'Fee Manifest', 'href' => '/portal/fee-manifest', 'icon' => 'receipt'],
                ['label' => 'Statement of Account', 'href' => '/portal/statement', 'icon' => 'scroll'],
                ['label' => 'Invoices & Payments', 'href' => '/portal/invoices', 'icon' => 'credit-card'],
                ['label' => 'If I Stop Now', 'href' => '/portal/if-i-stop-now', 'icon' => 'circle-pause'],
                ['label' => 'Disputes & Refunds', 'href' => '/portal/disputes', 'icon' => 'scale'],
                ['label' => 'Renewals & Price Changes', 'href' => '/portal/renewals', 'icon' => 'refresh-cw'],
                ['label' => 'Usage & Top-Ups', 'href' => '/portal/usage', 'icon' => 'gauge'],
                ['label' => 'Arrears & Payment Help', 'href' => '/portal/arrears', 'icon' => 'alert-triangle'],
                ['label' => 'Payment Methods', 'href' => '/portal/payment-methods', 'icon' => 'credit-card'],
                ['label' => 'What TBCA Owes Me', 'href' => '/portal/obligations', 'icon' => 'hand-coins'],
                ['label' => 'Forward Exposure', 'href' => '/portal/forward-exposure', 'icon' => 'trending-up'],
                ['label' => 'Group Billing', 'href' => '/portal/billing/group', 'icon' => 'building-2'],
                ['label' => 'Contract Variations', 'href' => '/portal/variations', 'icon' => 'git-pull-request'],
                ['label' => 'Procurement & Vendors', 'href' => '/portal/procurement', 'icon' => 'clipboard-list'],
            ]],
            ['title' => 'Workspaces', 'key' => 'workspaces', 'icon' => 'layout-grid', 'description' => 'Diagnostics, subscriptions, retainers and native platform workspaces.', 'items' => [
                ['label' => 'Diagnostics Workspace', 'href' => '/portal/diagnostics', 'icon' => 'activity'],
                ['label' => 'Subscriptions Workspace', 'href' => '/portal/workspaces/subscriptions', 'icon' => 'repeat'],
                ['label' => 'Retainers Workspace', 'href' => '/portal/workspaces/retainers', 'icon' => 'briefcase'],
                ['label' => 'Technology Solutions', 'href' => '/portal/workspaces/technology', 'icon' => 'cpu'],
                ['label' => 'AIIM Workspace', 'href' => '/portal/workspaces/aiim', 'icon' => 'brain'],
                ['label' => 'Countries Workspace', 'href' => '/portal/workspaces/countries', 'icon' => 'globe'],
                ['label' => 'Industries Workspace', 'href' => '/portal/workspaces/industries', 'icon' => 'factory'],
                ['label' => 'Due Diligence Case Room', 'href' => '/portal/workspaces/due-diligence', 'icon' => 'shield-check'],
                ['label' => 'VDR Lobby', 'href' => '/portal/workspaces/deal-rooms', 'icon' => 'lock'],
                ['label' => 'Project Advisory', 'href' => '/portal/workspaces/project-advisory', 'icon' => 'compass'],
                ['label' => 'Partner Services', 'href' => '/portal/workspaces/partner-services', 'icon' => 'handshake'],
                ['label' => 'Marketplace Engagement', 'href' => '/portal/workspaces/marketplace', 'icon' => 'store'],
                ['label' => 'Webinars & Events', 'href' => '/portal/events', 'icon' => 'video'],
                ['label' => 'KP Sessions & Action Tools', 'href' => '/portal/kp-sessions', 'icon' => 'mic'],
                ['label' => 'Reports & Dashboards', 'href' => '/portal/reports', 'icon' => 'bar-chart-3'],
                ['label' => 'Benchmarks & Consent', 'href' => '/portal/benchmarks', 'icon' => 'pie-chart'],
            ]],
            ['title' => 'Support & Communication', 'key' => 'support', 'icon' => 'life-buoy', 'description' => 'Messages, support tickets, KAREN and help.', 'items' => [
                ['label' => 'Secure Messages', 'href' => '/portal/messages', 'icon' => 'message-square'],
                ['label' => 'WhatsApp Preferences', 'href' => '/portal/whatsapp', 'icon' => 'message-circle'],
                ['label' => 'Support Tickets', 'href' => '/portal/support', 'icon' => 'life-buoy'],
                ['label' => 'KAREN Assistant', 'href' => '/portal/natasha', 'icon' => 'bot'],
                ['label' => 'Human Handoff & Escalation', 'href' => '/portal/natasha/handoff', 'icon' => 'user-round'],
                ['label' => 'Knowledge Base & Help', 'href' => '/portal/help', 'icon' => 'book-open'],
                ['label' => 'Escalation Ladder', 'href' => '/portal/escalations', 'icon' => 'trending-up'],
                ['label' => 'Feedback & Voice of Client', 'href' => '/portal/feedback', 'icon' => 'message-square-heart'],
                ['label' => 'System Status', 'href' => '/portal/status', 'icon' => 'activity'],
                ['label' => 'Portal Sitemap', 'href' => '/portal/sitemap', 'icon' => 'map'],
            ]],
            ['title' => 'Account & Organisation', 'key' => 'account', 'icon' => 'user', 'description' => 'Manage organisations, roles, delegations and contacts.', 'items' => [
                ['label' => 'My Profile', 'href' => '/portal/profile', 'icon' => 'user'],
                ['label' => 'Organisation Profile', 'href' => '/portal/organisation', 'icon' => 'building'],
                ['label' => 'Organisation Switcher', 'href' => '/portal/organisations', 'icon' => 'arrow-left-right'],
                ['label' => 'Team & Access', 'href' => '/portal/team', 'icon' => 'users'],
                ['label' => 'External Participants', 'href' => '/portal/participants', 'icon' => 'user-plus'],
                ['label' => 'Relationship Graph', 'href' => '/portal/relationships', 'icon' => 'network'],
                ['label' => 'Agent & API Access', 'href' => '/portal/access/api', 'icon' => 'code'],
                ['label' => 'Preferences & Settings', 'href' => '/portal/settings', 'icon' => 'settings'],
                ['label' => 'Accessibility', 'href' => '/portal/accessibility', 'icon' => 'accessibility'],
                ['label' => 'Language Centre', 'href' => '/portal/language', 'icon' => 'languages'],
            ]],
            ['title' => 'Security & Privacy', 'key' => 'security', 'icon' => 'shield', 'description' => 'Security settings, audit logs, consent and data rights.', 'items' => [
                ['label' => 'Security & Access History', 'href' => '/portal/security', 'icon' => 'shield'],
                ['label' => 'Sessions & Devices', 'href' => '/portal/security/sessions', 'icon' => 'monitor-smartphone'],
                ['label' => 'Account Ownership Dispute', 'href' => '/portal/security/ownership-dispute', 'icon' => 'user-x'],
                ['label' => 'Consent, Terms & Privacy', 'href' => '/portal/privacy', 'icon' => 'file-lock'],
                ['label' => 'Data Access & Export', 'href' => '/portal/privacy/data', 'icon' => 'database'],
                ['label' => 'Data Residency & Transfer', 'href' => '/portal/privacy/residency', 'icon' => 'globe-lock'],
                ['label' => 'Trust Passport', 'href' => '/portal/trust-passport', 'icon' => 'id-card'],
                ['label' => 'Trust Centre', 'href' => '/portal/trust-centre', 'icon' => 'shield-check'],
                ['label' => 'Re-verification', 'href' => '/portal/reverification', 'icon' => 'scan-face'],
                ['label' => 'Capture Provenance', 'href' => '/portal/provenance', 'icon' => 'fingerprint'],
                ['label' => 'Change & Version Digest', 'href' => '/portal/changes', 'icon' => 'git-commit'],
            ]],
            ['title' => 'Exit & Continuity', 'key' => 'continuity', 'icon' => 'log-out', 'description' => 'Account status, save-state, low-data mode, pause and exit.', 'items' => [
                ['label' => 'Account Status', 'href' => '/portal/account/status', 'icon' => 'shield-alert'],
                ['label' => 'Restriction Appeal', 'href' => '/portal/account/appeal', 'icon' => 'gavel'],
                ['label' => 'Save-State & Resume', 'href' => '/portal/resume', 'icon' => 'save'],
                ['label' => 'Offline & Low-Data Mode', 'href' => '/portal/low-data', 'icon' => 'wifi-off'],
                ['label' => 'Pause, Cancel or Exit', 'href' => '/portal/account/exit', 'icon' => 'log-out'],
                ['label' => 'Reactivation', 'href' => '/portal/account/reactivation', 'icon' => 'rotate-ccw'],
            ]],
        ];
    }

    /** Links to native platform areas built by other sections. */
    public static function native(): array
    {
        return [
            ['label' => 'AIIM Workspace', 'href' => '/aiim/workspace'],
            ['label' => 'Due Diligence Cases', 'href' => '/due-diligence/cases'],
            ['label' => 'Virtual Deal Rooms', 'href' => '/virtual-deal-room/rooms'],
            ['label' => 'Subscriptions', 'href' => '/subscriptions/account'],
            ['label' => 'Retainers', 'href' => '/retainers/account'],
        ];
    }

    /** Sidebar groups for /admin/portal consoles (ConsoleNavGroup shape, icon names resolved client-side). */
    public static function admin(): array
    {
        return [
            ['title' => 'Admin Control Tower', 'items' => [
                ['label' => 'Control Tower Overview', 'href' => '/admin/portal', 'icon' => 'layout-dashboard'],
                ['label' => 'Clients & Organisations', 'href' => '/admin/portal/clients', 'icon' => 'users'],
                ['label' => 'Entitlement Decisions', 'href' => '/admin/portal/entitlement-decisions', 'icon' => 'key-round'],
                ['label' => 'Entry-Gate Exceptions', 'href' => '/admin/portal/exceptions', 'icon' => 'shield-alert'],
                ['label' => 'Roles & Ownership Disputes', 'href' => '/admin/portal/disputes', 'icon' => 'user-x'],
                ['label' => 'Route & Workspace Registry', 'href' => '/admin/portal/routes', 'icon' => 'route'],
                ['label' => 'Promise-to-Proof', 'href' => '/admin/portal/promises', 'icon' => 'badge-check'],
            ]],
            ['title' => 'Delivery', 'items' => [
                ['label' => 'Workflow & SLA Compliance', 'href' => '/admin/portal/sla', 'icon' => 'gauge'],
                ['label' => 'Delivery & QA Capacity', 'href' => '/admin/portal/capacity', 'icon' => 'activity'],
                ['label' => 'Reviews & Release Blocks', 'href' => '/admin/portal/reviews', 'icon' => 'stamp'],
                ['label' => 'Partner & Marketplace', 'href' => '/admin/portal/partners', 'icon' => 'handshake'],
            ]],
            ['title' => 'Finance', 'items' => [
                ['label' => 'Fee & QuickBooks Reconciliation', 'href' => '/admin/portal/reconciliation', 'icon' => 'receipt'],
                ['label' => 'Money Events & Refunds', 'href' => '/admin/portal/money-events', 'icon' => 'scale'],
                ['label' => 'Subscription & Retainer Lifecycle', 'href' => '/admin/portal/lifecycle', 'icon' => 'repeat'],
                ['label' => 'Arrears & Client Floor', 'href' => '/admin/portal/arrears', 'icon' => 'alert-triangle'],
                ['label' => 'Vendor Compliance Documents', 'href' => '/admin/portal/vendor-documents', 'icon' => 'file-check'],
                ['label' => 'Retention & Win-Back', 'href' => '/admin/portal/retention', 'icon' => 'heart-handshake'],
            ]],
            ['title' => 'Support & Trust', 'items' => [
                ['label' => 'Support, SLA & Complaints', 'href' => '/admin/portal/support', 'icon' => 'life-buoy'],
                ['label' => 'Communications & WhatsApp', 'href' => '/admin/portal/communications', 'icon' => 'message-circle'],
                ['label' => 'KAREN Console', 'href' => '/admin/portal/natasha', 'icon' => 'bot'],
                ['label' => 'Consent, Rights & Retention', 'href' => '/admin/portal/consent', 'icon' => 'file-lock'],
                ['label' => 'Security & Anomaly', 'href' => '/admin/portal/security', 'icon' => 'shield'],
                ['label' => 'Successor & Estate Access', 'href' => '/admin/portal/successor-access', 'icon' => 'scroll'],
            ]],
            ['title' => 'Platform', 'items' => [
                ['label' => 'Integrations & Incidents', 'href' => '/admin/portal/integrations', 'icon' => 'plug'],
                ['label' => 'UAT, Release & Certificates', 'href' => '/admin/portal/uat', 'icon' => 'rocket'],
                ['label' => 'Channel Handoffs & Links', 'href' => '/admin/portal/handoffs', 'icon' => 'link'],
                ['label' => 'Entry Surface Integrity', 'href' => '/admin/portal/entry-surfaces', 'icon' => 'door-open'],
                ['label' => 'Continuity & Save-State', 'href' => '/admin/portal/continuity', 'icon' => 'save'],
            ]],
        ];
    }
}
