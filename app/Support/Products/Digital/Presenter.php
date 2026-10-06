<?php

namespace App\Support\Products\Digital;

use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpVersion;

/** Shapes Digital Product models into the props the React pages expect. */
class Presenter
{
    public const TYPES = [
        'report' => 'Reports', 'template' => 'Templates', 'toolkit' => 'Toolkits', 'checklist' => 'Checklists',
        'calculator' => 'Calculators', 'dashboard' => 'Dashboards', 'course' => 'Courses', 'guide' => 'Guides',
    ];

    public static function versionLabel(?DpVersion $v): string
    {
        if (! $v) {
            return '—';
        }

        $state = [
            'current' => 'Current', 'superseded' => 'Superseded', 'historical' => 'Historical',
            'archived' => 'Archived', 'withdrawn_unsafe' => 'Withdrawn', 'draft' => 'Draft', 'qa' => 'QA',
        ][$v->status] ?? ucfirst($v->status);

        return $v->label()." ({$state})";
    }

    public static function card(DpProduct $p): array
    {
        $current = $p->currentVersion();

        return [
            'slug' => $p->slug,
            'sku' => $p->sku,
            'name' => $p->name,
            'type' => $p->type,
            'typeLabel' => ucfirst($p->type),
            'tagline' => $p->tagline,
            'version' => $current?->label() ?? 'v'.$p->current_version,
            'versionLabel' => self::versionLabel($current),
            'languages' => collect($p->languages ?? [])->where('state', '!=', 'unavailable')->pluck('code')->values(),
            'format' => $p->primary_format,
            'formats' => collect($p->formats ?? [])->pluck('code')->values(),
            'fromPrice' => $p->fromPrice(),
            'licences' => collect($p->prices ?? [])->filter()->keys()->values(),
            'audience' => $p->audience,
            'jurisdiction' => $p->jurisdiction,
            'jurisdictions' => collect($p->jurisdictions ?? [Markets::PAN])->map(fn ($c) => Markets::jurisdictionName($c))->filter()->values(),
            'currencies' => $p->currencies ?? array_keys(Markets::CURRENCIES),
            'verifiedAt' => $p->verified_at?->format('d M Y'),
            'maintenance' => $p->maintenance_class === 'M3' ? 'Yes' : 'No',
            'updates' => $p->update_class === 'U0' ? 'No' : "Yes (If within {$p->update_months} months)",
            'support' => $p->support,
            'dss' => $p->dss,
            'tone' => $p->cover_tone,
            'purchasable' => $p->isPurchasable(),
        ];
    }

    /** Screen 3 page state (Blueprint 14.2). */
    public static function pageState(DpProduct $p): string
    {
        $current = $p->currentVersion();

        return match (true) {
            $p->disposition === 'DP-FR' => 'FREE_RESOURCE',
            $p->lifecycle_status === 'withdrawn_hold' || ! $current => 'WITHDRAWN_UNSAFE',
            $p->lifecycle_status === 'pending_pricing' => 'PRICE_HOLD',
            $p->lifecycle_status !== 'live' => 'PRICE_HOLD',
            $p->risk === 'High' => 'AVAILABLE_HIGH_RISK',
            default => 'AVAILABLE_CURRENT',
        };
    }

    public static function detail(DpProduct $p): array
    {
        $current = $p->currentVersion();

        return [
            ...self::card($p),
            'code' => $p->code,
            'description' => $p->description,
            'bestFor' => $p->best_for,
            'category' => $p->category,
            'badges' => $p->badges ?? [],
            'receive' => $p->receive ?? [],
            'compare' => $p->compare ?? [],
            'content' => $p->content ?? [],
            'languageOptions' => $p->languages ?? [],
            'formatOptions' => $p->formats ?? [],
            'prices' => $p->prices ?? [],
            'currentVersion' => $current ? self::version($current) : null,
            'versions' => $p->versions->sortByDesc('released_at')->values()->map(fn ($v) => self::version($v)),
            'nextReview' => $p->next_review_at?->format('d M Y'),
            'reviewCycle' => $p->review_cycle,
            'maintenanceClass' => $p->maintenance_class,
            'updateClass' => $p->update_class,
            'updateMonths' => $p->update_months,
            'risk' => $p->risk,
            'dssBand' => $p->dss_band,
            'state' => self::pageState($p),
            'defensibility' => $p->defensibility,
        ];
    }

    public static function version(DpVersion $v): array
    {
        return [
            'id' => $v->id,
            'version' => $v->version,
            'label' => $v->label(),
            'display' => self::versionLabel($v),
            'status' => $v->status,
            'updateType' => $v->update_type,
            'releasedAt' => $v->released_at?->format('d M Y'),
            'verifiedAt' => $v->verified_at?->format('d M Y'),
            'maintenanceUntil' => $v->maintenance_until?->format('d M Y'),
            'summary' => $v->summary,
            'whatsNew' => $v->whats_new ?? [],
            'impact' => $v->impact ?? [],
            'size' => $v->size,
            'worksWith' => $v->compat_works_with,
            'replaces' => $v->compat_replaces,
        ];
    }

    public static function entitlement(DpEntitlement $e): array
    {
        $p = $e->product;
        $current = $p->currentVersion();
        $last = $e->downloads->where('success', true)->sortByDesc('id')->first();
        $updateAvailable = $current && $e->version && $current->id !== $e->version_id
            && $current->released_at && $e->version->released_at && $current->released_at->gt($e->version->released_at);

        return [
            'reference' => $e->reference,
            'status' => $e->status,
            'product' => [
                'slug' => $p->slug, 'name' => $p->name, 'sku' => $p->sku, 'type' => $p->type, 'tone' => $p->cover_tone,
                'tagline' => $p->tagline, 'support' => $p->support, 'code' => $p->code,
            ],
            'version' => $e->version ? self::version($e->version) : null,
            'currentVersion' => $current ? self::version($current) : null,
            'updateAvailable' => $updateAvailable,
            'licence' => $e->licence_class,
            'licenceLabel' => Licences::label($e->licence_class),
            'language' => $e->language,
            'languageLabel' => Markets::languageLabel($e->language),
            'format' => $e->format,
            'jurisdiction' => $e->jurisdiction,
            'orderReference' => $e->order_reference,
            'purchasedAt' => $e->purchased_at?->format('d M Y'),
            'pricePaid' => $e->price_zar,
            'lastDownload' => $last?->created_at?->format('d M Y'),
            'downloads' => $e->downloads->where('success', true)->count(),
            'size' => $e->version?->size,
            'maintenanceStatus' => $e->maintenance_status,
            'maintenancePlan' => $e->maintenance_plan,
            'maintenanceUntil' => $e->maintenance_until?->format('d M Y'),
            'updateUntil' => $e->update_until?->format('d M Y'),
            'accessExpires' => $e->access_expires_at?->format('d M Y'),
            'autoRenew' => $e->auto_renew,
            'termsVersion' => $e->terms_version,
            'authorisedEntity' => $e->authorised_entity,
            'credit' => $e->credit_zar,
            'creditApplied' => $e->credit_applied_zar,
            'activatedAt' => $e->activated_at?->format('d M Y H:i'),
            'updatesIncluded' => $p->update_class === 'U0' ? 'No' : "Yes ({$p->update_months} months)",
        ];
    }
}
