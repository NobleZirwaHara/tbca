<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Order;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Staff landing page: platform-wide counts, recent activity, and every
 * section console discovered from the registered /admin/* routes.
 */
class AdminController extends Controller
{
    public function index(): Response
    {
        $consoles = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($r) => in_array('GET', $r->methods(), true)
                && preg_match('#^admin/([a-z0-9-]+)/?([a-z0-9-]*)$#', $r->uri())
                && ! str_contains($r->uri(), '{'))
            ->map(function ($r) {
                [, $section, $page] = explode('/', $r->uri().'/', 3) + [null, null, null];
                $page = trim((string) $page, '/');

                return [
                    'section' => $section,
                    'href' => '/'.$r->uri(),
                    'label' => $page === '' ? 'Overview' : str($page)->replace('-', ' ')->title()->toString(),
                ];
            })
            ->groupBy('section')
            ->map(fn ($items, $section) => [
                'section' => str($section)->replace('-', ' ')->title()->toString(),
                'items' => $items->sortBy(fn ($i) => $i['label'] === 'Overview' ? '' : $i['label'])->values(),
            ])
            ->sortKeys()
            ->values();

        return Inertia::render('Admin/Index', [
            'stats' => [
                'clients' => User::where('role', 'client')->count(),
                'orders' => Order::count(),
                'paidRevenue' => (int) Order::where('status', 'paid')->sum('total_zar'),
                'awaitingPayment' => Order::where('status', 'awaiting_payment')->count(),
                'openSubmissions' => Submission::whereIn('status', ['received', 'in_review'])->count(),
                'upcomingBookings' => Booking::where('starts_at', '>=', now())->where('status', '!=', 'cancelled')->count(),
            ],
            'recentOrders' => Order::latest()->limit(8)->get(['reference', 'section', 'status', 'total_zar', 'created_at']),
            'recentSubmissions' => Submission::latest()->limit(8)->get(['reference', 'type', 'section', 'name', 'status', 'created_at']),
            'consoles' => $consoles,
        ]);
    }
}
