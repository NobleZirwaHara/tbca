<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Room;

/**
 * Usage metering (VDR-039/040). Seats, buyer groups and storage are derived
 * live from room records; OCR pages, AI Q&A and the rest are counters bumped
 * by room actions. Forecasts extrapolate month-to-date use to period end and
 * threshold alerts (90% / 95%) are logged once per period.
 */
class Usage
{
    public static function metrics(): array
    {
        return [
            'seats' => ['label' => 'Seats', 'included' => 12, 'rate' => null, 'unit' => 'seat', 'derived' => true],
            'buyer_groups' => ['label' => 'Buyer Groups', 'included' => 5, 'rate' => null, 'unit' => 'group', 'derived' => true],
            'storage_gb' => ['label' => 'Storage', 'included' => 50, 'rate' => 150, 'unit' => 'GB', 'derived' => true],
            'ocr_pages' => ['label' => 'OCR Pages', 'included' => 15000, 'rate' => 2, 'unit' => 'page', 'derived' => false],
            'ai_qa' => ['label' => 'AI Q&A', 'included' => 2500, 'rate' => 15, 'unit' => 'request', 'derived' => false],
            'summaries' => ['label' => 'Summaries', 'included' => 400, 'rate' => null, 'unit' => 'summary', 'derived' => false],
            'meetings' => ['label' => 'Meetings', 'included' => 30, 'rate' => null, 'unit' => 'meeting', 'derived' => false],
            'reports' => ['label' => 'Reports', 'included' => 20, 'rate' => null, 'unit' => 'report', 'derived' => false],
            'exports' => ['label' => 'Exports', 'included' => 10, 'rate' => null, 'unit' => 'export', 'derived' => false],
            'integrations' => ['label' => 'Integrations', 'included' => 4, 'rate' => null, 'unit' => 'integration', 'derived' => false],
        ];
    }

    public static function period(): string
    {
        return now()->format('Y-m');
    }

    public static function allowances(Room $room): array
    {
        $out = [];
        foreach (self::metrics() as $k => $m) {
            $out[$k] = (int) ($room->plan['allowances'][$k] ?? $m['included']);
        }

        return $out;
    }

    public static function increment(Room $room, string $metric, int $by = 1): void
    {
        $row = $room->usage()->firstOrCreate(['period' => self::period(), 'metric' => $metric], ['used' => 0]);
        $row->increment('used', $by);

        $included = self::allowances($room)[$metric] ?? 0;
        if ($included <= 0) {
            return;
        }
        $alerts = $row->alerts ?? [];
        foreach ([90, 95] as $t) {
            if ($row->used >= $included * $t / 100 && ! in_array($t, $alerts, true)) {
                $alerts[] = $t;
                Audit::log($room, 'overage.detected', self::metrics()[$metric]['label']." reached {$t}% of the included allowance", 'Usage Monitor', ['metric' => $metric, 'threshold' => $t]);
            }
        }
        $row->update(['alerts' => $alerts]);
    }

    public static function summary(Room $room): array
    {
        $counters = $room->usage()->where('period', self::period())->pluck('used', 'metric');
        $allow = self::allowances($room);
        $day = max(1, (int) now()->format('j'));
        $days = (int) now()->daysInMonth;

        $derived = [
            'seats' => $room->parties()->whereNotIn('status', ['revoked', 'declined', 'expired', 'prospect', 'qualified'])->count(),
            'buyer_groups' => $room->parties()->whereNotIn('role', Access::INTERNAL_ROLES)->whereNotNull('group_name')->distinct()->count('group_name'),
            'storage_gb' => (int) round(($room->documents()->sum('size') / 1_000_000_000) + (float) ($room->plan['storage_offset_gb'] ?? 0)),
        ];

        $rows = [];
        $overage = 0;
        foreach (self::metrics() as $k => $m) {
            $used = $m['derived'] ? $derived[$k] : (int) ($counters[$k] ?? 0);
            $forecast = $m['derived'] ? $used : (int) round($used / $day * $days);
            $included = $allow[$k];
            $over = max(0, $forecast - $included);
            $charge = $m['rate'] ? (int) round($over * $m['rate']) : 0;
            $overage += $charge;
            $pct = $included ? (int) round($used / $included * 100) : 0;
            $rows[] = [
                'key' => $k, 'label' => $m['label'], 'unit' => $m['unit'], 'included' => $included, 'used' => $used,
                'remaining' => max(0, $included - $used), 'forecast' => $forecast, 'rate' => $m['rate'], 'pct' => $pct,
                'projectedOverage' => $over, 'charge' => $charge,
                'status' => $over > 0 && $m['rate'] ? 'overage_risk' : ($pct >= 80 && $forecast >= $included ? 'near_limit' : 'on_track'),
            ];
        }

        return [
            'rows' => $rows,
            'projectedOverage' => $overage,
            'vat' => Pricing::vat($overage),
            'plan' => $room->plan['name'] ?? 'TBCA Growth Raise Plan — Standard',
            'period' => now()->format('F Y'),
            'projectedDate' => now()->endOfMonth()->format('d M Y'),
            'spendToDate' => (int) $room->charges()->whereIn('status', ['paid', 'partially_refunded'])->where('paid_at', '>=', now()->startOfMonth())->sum('total_zar'),
            'outstanding' => (int) $room->charges()->whereIn('status', ['issued', 'awaiting_payment', 'failed'])->sum('total_zar'),
            'alerts' => $room->events()->where('event', 'overage.detected')->latest('id')->limit(6)->get()->map(fn ($e) => ['at' => $e->created_at->format('d M Y H:i'), 'description' => $e->description])->all(),
        ];
    }
}
