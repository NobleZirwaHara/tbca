<?php

namespace App\Support\Products\Subscriptions;

use App\Models\Products\Subscriptions\Subscription;
use App\Models\Products\Subscriptions\SubOp;

/**
 * Review capacity versus subscriber book (Blueprint Part 9).
 * Each recurrence class has a capacity pool (prd_sub_ops kind=capacity). Demand is the
 * baseline book plus every live subscription on the platform times its review minutes.
 * Utilisation >= 95% is At Risk; > 100% is Breached, which freezes new sales and
 * unreserved continuations for that class (GATE-SU-21B).
 */
class Capacity
{
    public const WARNING = 85.0;

    public const CRITICAL = 95.0;

    public static function rows(): array
    {
        $live = Subscription::query()
            ->whereIn('status', ['ACTIVE', 'IN_GRACE', 'PAST_DUE', 'CANCELLED_PENDING'])
            ->with('plan:id,recurrence_class')
            ->get()
            ->groupBy(fn ($s) => $s->plan?->recurrence_class);

        return SubOp::kind('capacity')->orderBy('recurrence_class')->get()->map(function (SubOp $op) use ($live) {
            $d = $op->data ?? [];
            $platform = isset($live[$op->recurrence_class]) ? $live[$op->recurrence_class]->count() : 0;
            $subscribers = (int) ($d['baseline_subscribers'] ?? 0) + $platform;
            $demand = round((float) ($d['baseline_demand_hours'] ?? 0) + $platform * (float) ($d['minutes_per_subscriber'] ?? 60) / 60, 1);
            $committed = (float) ($d['committed_hours'] ?? 0);
            $util = $committed > 0 ? round($demand / $committed * 100, 1) : 0.0;

            return [
                'id' => $op->id,
                'class' => $op->recurrence_class,
                'name' => $op->title,
                'subscribers' => $subscribers,
                'platform_subscribers' => $platform,
                'demand_hours' => $demand,
                'committed_hours' => $committed,
                'utilisation' => $util,
                'headroom' => round($committed - $demand, 1),
                'status' => $util > 100 ? 'Breached' : ($util >= self::CRITICAL ? 'At Risk' : 'Healthy'),
                'minutes_per_subscriber' => (float) ($d['minutes_per_subscriber'] ?? 60),
            ];
        })->all();
    }

    public static function classBreached(string $class): bool
    {
        foreach (self::rows() as $row) {
            if ($row['class'] === $class) {
                return $row['status'] === 'Breached';
            }
        }

        return false;
    }
}
