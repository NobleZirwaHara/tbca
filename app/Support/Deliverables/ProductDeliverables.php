<?php

namespace App\Support\Deliverables;

use App\Models\Deliverables\Deliverable;
use App\Support\Advisory\PaContent;
use App\Support\Advisory\TechContent;
use App\Support\CorePages\ToolsCatalogue;
use App\Support\DueDiligence\Catalogue as DdCatalogue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * "What you will receive" for product detail pages other than Sprints. Shared with
 * every Inertia page (HandleInertiaRequests) and resolved from the route: each product
 * route names its product type and how to find the product's code. The panel itself is
 * rendered by the page layout, so product pages need no changes.
 */
class ProductDeliverables
{
    /** Package names on product pages that correspond to Basic, Standard and Premium. */
    private const DD_TIERS = ['essential' => 'basic', 'enhanced' => 'standard', 'executive' => 'premium'];

    /** Product detail routes that show the panel. */
    public const ROUTES = [
        'due-diligence.family', 'products.digital.show', 'products.subscriptions.show', 'products.retainers.show',
        'adv.ts.tower', 'core.tools.show', 'webinars.show', 'industries.show', 'marketplace.services.show',
        'partner-services.services.show', 'adv.pa.service', 'adv.services.service', 'aiim.store.show',
    ];

    public static function forRequest(Request $request): ?array
    {
        try {
            $route = $request->route();
            $name = $route?->getName();
            if (! in_array($name, self::ROUTES, true) || ! Schema::hasTable('deliverable_products')) {
                return null;
            }

            $param = fn (string $key) => $route->parameter($key);
            $value = fn ($p, string $column) => $p instanceof Model ? $p->getAttribute($column) : $p;

            [$codes, $aliases] = match ($name) {
                'due-diligence.family' => [self::ddFamily((string) $param('slug')), self::DD_TIERS],
                'products.digital.show' => [['digital_product' => [self::code('prd_dp_products', $value($param('product'), 'slug'))]], []],
                'products.subscriptions.show' => [['subscription_plan' => [self::code('prd_sub_plans', $value($param('plan'), 'slug'))]], []],
                'products.retainers.show' => [['retainer' => [self::code('prd_ret_services', $value($param('service'), 'slug'))]], []],
                'adv.ts.tower' => [['tech_tower' => [TechContent::towers()[(string) $param('slug')]['code'] ?? null]], []],
                'core.tools.show' => [['tool' => [ToolsCatalogue::find((string) $param('type'), (string) $param('slug'))['code'] ?? null]], []],
                'webinars.show' => [['webinar' => [self::code('ins_webinars', $value($param('webinar'), 'slug'))]], []],
                'industries.show' => [['industry' => [self::code('ind_industries', (string) $param('industry'))]], []],
                'marketplace.services.show' => [['marketplace_listing' => [self::code('mkt_listings', $value($param('listing'), 'slug'))]], []],
                'partner-services.services.show' => [['partner_service' => [self::code('mkt_listings', $value($param('listing'), 'slug'))]], []],
                'adv.pa.service' => [['pa_service' => [PaContent::services()[(string) $param('slug')]['code'] ?? null]], []],
                'adv.services.service' => [['service' => [self::code('adv_services', (string) $param('slug'))]], []],
                'aiim.store.show' => [['aiim_brief' => [$value($param('brief'), 'sku')]], []],
                default => [null, []],
            };
            if ($codes === null) {
                return null;
            }

            $items = DeliveryPlan::forProducts($codes);

            return $items === [] ? null : ['items' => $items, 'tierAliases' => (object) $aliases];
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    /** The family page and its SKUs. */
    private static function ddFamily(string $slug): array
    {
        $family = DdCatalogue::family($slug);

        return $family ? ['dd_family' => [$family['code']], 'dd_sku' => array_column(DdCatalogue::skus($slug), 'code')] : [];
    }

    private static function code(string $table, mixed $slug): ?string
    {
        if (! is_string($slug) || $slug === '' || ! Schema::hasColumn($table, 'code')) {
            return null;
        }

        return DB::table($table)->where('slug', $slug)->value('code');
    }

    /** Panel tier labels for a deliverable (kept here so the Sprint page and product pages match). */
    public static function tiers(Deliverable $d): array
    {
        return collect(Deliverable::TIERS)->mapWithKeys(fn ($t) => [$t => [
            'extent' => $d->text("extent_{$t}"),
            'pages' => $d->getAttribute("pages_{$t}"),
            'delivery' => $d->getAttribute("delivery_{$t}"),
        ]])->all();
    }
}
