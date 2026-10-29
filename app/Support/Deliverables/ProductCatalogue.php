<?php

namespace App\Support\Deliverables;

use App\Support\Advisory\PaContent;
use App\Support\Advisory\TechContent;
use App\Support\CorePages\ToolsCatalogue;
use App\Support\DueDiligence\Catalogue as DdCatalogue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Every app product (other than Sprints) that a register deliverable can be linked to,
 * with its product type, its stable product code, name, group and page.
 *
 * Product codes. Products that already had a code keep it: Due Diligence SKUs
 * (DD-...), digital products (DP-...), subscription plans (SUB-...), retainer services
 * (RSV-...), technology towers (TS-1 to TS-7), industries (AGR, MIN ...), AIIM briefs
 * (their SKU) and Project Advisory services (PA-T-...). Products that had none were
 * given one (see ProductCodes):
 *
 *   DDF-{FAMILY SLUG}   Due Diligence family pages, e.g. DDF-INDIVIDUAL
 *   TLS-001 ...         Tools, templates and calculators (/tools)
 *   WBN-001 ...         Webinars
 *   MKT-001 ...         Marketplace listings
 *   PSV-001 ...         Partner Services listings
 *   SVC-001 ...         Services catalogue entries (/services/catalogue)
 */
class ProductCatalogue
{
    public const TYPES = [
        'dd_family' => 'Due Diligence family',
        'dd_sku' => 'Due Diligence SKU',
        'digital_product' => 'Digital product',
        'subscription_plan' => 'Subscription plan',
        'retainer' => 'Retainer',
        'tech_tower' => 'Technology Solutions tower',
        'tool' => 'Tool, template or calculator',
        'webinar' => 'Webinar',
        'industry' => 'Industry',
        'aiim_brief' => 'AIIM brief',
        'marketplace_listing' => 'Marketplace service',
        'partner_service' => 'Partner service',
        'pa_service' => 'Project Advisory service',
        'service' => 'Services catalogue entry',
    ];

    /** Label used for links that apply to every product of a type. */
    public const EVERY = [
        'dd_family' => 'Every Due Diligence check',
        'digital_product' => 'Every digital product',
        'subscription_plan' => 'Every subscription plan',
        'retainer' => 'Every retainer',
        'tech_tower' => 'Every Technology Solutions engagement',
        'webinar' => 'Every webinar',
        'partner_service' => 'Every partner service',
    ];

    /** @return list<array{type: string, code: string, slug: string, name: string, group: ?string, url: string}> */
    public static function all(): array
    {
        $out = [];
        $add = function (string $type, ?string $code, string $slug, string $name, ?string $group, string $url) use (&$out) {
            if ($code) {
                $out[] = compact('type', 'code', 'slug', 'name', 'group', 'url');
            }
        };

        foreach (DdCatalogue::families() as $f) {
            $add('dd_family', $f['code'], $f['slug'], $f['name'], null, "/due-diligence/{$f['slug']}");
        }
        foreach (DdCatalogue::skus() as $s) {
            $add('dd_sku', $s['code'], $s['family'], $s['name'], $s['family'], "/due-diligence/{$s['family']}");
        }
        foreach (self::rows('prd_dp_products', ['code', 'slug', 'name', 'category']) as $r) {
            $add('digital_product', $r->code, $r->slug, $r->name, $r->category, "/digital-products/{$r->slug}");
        }
        foreach (self::rows('prd_sub_plans', ['code', 'slug', 'name', 'category']) as $r) {
            $add('subscription_plan', $r->code, $r->slug, $r->name, $r->category, "/subscriptions/{$r->slug}");
        }
        foreach (self::rows('prd_ret_services', ['code', 'slug', 'name', 'desk']) as $r) {
            $add('retainer', $r->code, $r->slug, $r->name, $r->desk, "/retainers/{$r->slug}");
        }
        foreach (TechContent::towers() as $slug => $t) {
            $add('tech_tower', $t['code'], $slug, $t['name'], null, "/technology-solutions/towers/{$slug}");
        }
        foreach (ToolsCatalogue::products() as $p) {
            $add('tool', $p['code'] ?? null, $p['slug'], $p['title'], $p['type'], "/tools/{$p['type']}/{$p['slug']}");
        }
        foreach (self::rows('ins_webinars', ['code', 'slug', 'title']) as $r) {
            $add('webinar', $r->code ?? null, $r->slug, $r->title, null, "/webinars/{$r->slug}");
        }
        foreach (self::rows('ind_industries', ['code', 'slug', 'name']) as $r) {
            $add('industry', $r->code, $r->slug, $r->name, null, "/industries/{$r->slug}");
        }
        foreach (self::rows('aiim_briefs', ['sku', 'title', 'category']) as $r) {
            $add('aiim_brief', $r->sku, $r->sku, $r->title, $r->category, "/aiim/store/{$r->sku}");
        }
        foreach (self::rows('mkt_listings', ['code', 'slug', 'title', 'category', 'kind', 'status']) as $r) {
            if (($r->status ?? 'published') !== 'published') {
                continue;
            }
            $partner = $r->kind === 'partner';
            $add($partner ? 'partner_service' : 'marketplace_listing', $r->code ?? null, $r->slug, $r->title, $r->category, ($partner ? '/partner-services/services/' : '/marketplace/services/').$r->slug);
        }
        foreach (PaContent::services() as $slug => $s) {
            $add('pa_service', $s['code'], $slug, $s['name'], null, "/project-advisory/services/{$slug}");
        }
        foreach (self::rows('adv_services', ['code', 'slug', 'title', 'sub_category']) as $r) {
            $add('service', $r->code ?? null, $r->slug, $r->title, $r->sub_category, "/services/catalogue/{$r->slug}");
        }

        return $out;
    }

    /** @return array<string, array<string, array<string, mixed>>> type => code => product */
    public static function indexed(): array
    {
        $out = [];
        foreach (self::all() as $p) {
            $out[$p['type']][$p['code']] = $p;
        }

        return $out;
    }

    private static function rows(string $table, array $columns): iterable
    {
        if (! Schema::hasTable($table)) {
            return [];
        }
        $have = Schema::getColumnListing($table);

        return DB::table($table)->orderBy('id')->get(array_values(array_intersect($columns, $have)));
    }
}
