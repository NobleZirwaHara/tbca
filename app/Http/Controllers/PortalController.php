<?php

namespace App\Http\Controllers;

use App\Support\Content\DueDiligence;
use App\Support\Content\Platform;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client Portal shell. Role-aware dashboard over upstream systems of record.
 */
class PortalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Portal/Index', [
            'areas' => [
                ['name' => 'Orders and Entitlements', 'body' => 'Orders, invoices, receipts, entitlement status and renewals.', 'icon' => 'receipt'],
                ['name' => 'Sprints and Delivery', 'body' => 'Tasks, milestones, assigned owner, quality gate and delivery status.', 'icon' => 'rocket'],
                ['name' => 'Due Diligence Cases', 'body' => 'Case ID, product, subject, status, service level, action required and owner.', 'icon' => 'shield-check'],
                ['name' => 'Documents', 'body' => 'Approved folders, evidence packs, deliverables and versions.', 'icon' => 'folder'],
                ['name' => 'AIIM Workspace', 'body' => 'Saved searches, watchlists, alerts, downloads and subscriptions.', 'icon' => 'globe'],
                ['name' => 'Support', 'body' => 'Tickets, complaints, disputes, service levels and recovery history.', 'icon' => 'life-buoy'],
                ['name' => 'Project and Deal Rooms', 'body' => 'Project cases, controlled data rooms and transaction evidence.', 'icon' => 'folder-lock'],
                ['name' => 'Preferences', 'body' => 'Country, language, currency, consent and notification settings.', 'icon' => 'settings'],
            ],
            'ddAreas' => DueDiligence::portalAreas(),
            'dashboards' => Platform::dashboards(),
        ]);
    }
}
