<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Products governance hub: one entry point to the Digital Products,
 * Subscriptions and Retainers admin consoles.
 */
class ProductsAdminController extends Controller
{
    public function index(): Response
    {
        $sections = ['digital-products', 'subscriptions', 'retainers'];

        $orders = Order::query()
            ->whereIn('section', $sections)
            ->get(['section', 'status', 'total_zar']);

        $families = collect($sections)->map(fn (string $section) => [
            'section' => $section,
            'orders' => $orders->where('section', $section)->count(),
            'paid' => $orders->where('section', $section)->where('status', 'paid')->count(),
            'revenue_zar' => (int) $orders->where('section', $section)->where('status', 'paid')->sum('total_zar'),
        ])->keyBy('section');

        $recent = Order::query()
            ->whereIn('section', $sections)
            ->latest('id')
            ->limit(10)
            ->get(['reference', 'section', 'status', 'total_zar', 'created_at']);

        return Inertia::render('Products/Admin/Hub', [
            'families' => $families,
            'recentOrders' => $recent,
        ]);
    }
}
