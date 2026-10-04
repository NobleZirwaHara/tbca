<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Proposal;
use App\Models\Marketplace\Provider;
use App\Support\Platform\Reference;
use Illuminate\Support\Str;

/**
 * Brief lifecycle: submission -> Methodology Brief + three-ledger envelope ->
 * buyer acceptance -> provider award -> disclosure -> payment -> engagement.
 */
class BriefService
{
    public static function nextReference(): string
    {
        $n = (int) Brief::where('reference', 'like', 'BRF-2026-%')->count() + 500;
        do {
            $ref = sprintf('BRF-2026-%05d', ++$n);
        } while (Brief::where('reference', $ref)->exists());

        return $ref;
    }

    /** Generates the TBCA Methodology Brief and commercial envelope (GATE-MP-19) on submission. */
    public static function scope(Brief $brief): void
    {
        $d = $brief->data ?? [];
        $category = $d['category'] ?? 'financial-advisory';
        $env = Pricing::envelope($category, $d['complexity'] ?? 'medium', $d['urgency'] ?? 'standard');
        $label = Options::CATEGORIES[$category] ?? 'Advisory';
        $deliverables = $d['deliverables'] ?? '';

        $brief->update([
            'status' => $env['floor_status'] === 'PASS' ? 'awaiting_buyer_confirmation' : 'blocked_below_floor',
            'priority_score' => Matching::priority($d),
            'open_to_providers' => true,
            'scope' => [
                'price_version' => 'PV-01',
                'gate' => 'GATE-MP-24',
                'methodology' => "TBCA {$label} Methodology v2.1 (QA-MP-07)",
                'objective' => $d['outcome'] ?? ($d['description'] ?? ''),
                'summary' => Str::limit($d['description'] ?? '', 280),
                'scope_items' => array_values(array_filter(array_map('trim', preg_split('/\r?\n|;/', $d['scope'] ?? '') ?: []))) ?: [
                    "{$label} assessment against the stated objective",
                    'Review of supplied information and assumptions',
                    'Assumption testing and sensitivity analysis',
                    'Executive memo and recommendations',
                ],
                'deliverables' => array_values(array_filter(array_map('trim', preg_split('/\r?\n|;/', $deliverables) ?: []))) ?: [
                    'Review note with findings', 'Executive briefing PDF', 'Risk and assumptions summary',
                ],
                'exclusions' => ['No legal opinion', 'No tax opinion', 'No engineering certification', 'No lender due diligence report'],
                'assumptions' => [
                    'Buyer provides source data by stated deadline',
                    'Work limited to supplied scope',
                    'One consolidated correction cycle included',
                    'Professional adoption required if regulated conclusions arise',
                ],
                'timing' => [
                    'kickoff' => 'After payment clearance',
                    'turnaround' => self::turnaround($d['deadline'] ?? '14-30'),
                    'buyer_data_due' => now()->addDays(5)->format('d M Y'),
                    'draft' => now()->addDays(14)->format('d M Y'),
                    'final' => now()->addDays(18)->format('d M Y'),
                ],
                'qa' => ['standard' => 'QA-MP-07', 'human_review' => 'Required', 'rights' => 'Required', 'release' => 'No release before QA pass', 'professional' => 'Not Required for current scope'],
                'delivery_class' => ($d['urgency'] ?? 'standard') === 'urgent' ? 'Expedited' : 'Standard',
                'qa_class' => 'Human Review',
                'ledgers' => ['a' => $env['a'], 'b' => $env['b'], 'c' => $env['c'], 'c_state' => $env['c_state']],
                'floor' => ['status' => $env['floor_status'], 'floor' => $env['floor'], 'target' => $env['target'], 'cts' => $env['cts'], 'benchmark' => $env['benchmark']],
                'provider_selection' => 'Not Yet Selected',
            ],
        ]);
    }

    private static function turnaround(string $deadline): string
    {
        return match ($deadline) {
            'within-7' => '5 business days',
            '7-14' => '10 business days',
            '14-30' => '15 business days',
            '30-60' => '30 business days',
            default => '45 business days',
        };
    }

    public static function total(Brief $brief): int
    {
        $l = $brief->scope['ledgers'] ?? ['a' => 0, 'b' => 0, 'c' => 0];

        return (int) ($l['a'] + $l['b'] + $l['c']);
    }

    /**
     * Awards a proposal. Provider actual cost replaces the Ledger C cap; if the
     * actual exceeds the cap the price version is re-issued and buyer
     * confirmation is required again (blueprint: "actual cost reopens the floor").
     */
    public static function award(Brief $brief, Proposal $proposal): bool
    {
        $scope = $brief->scope ?? [];
        $ledgers = $scope['ledgers'] ?? [];
        $cap = (int) ($ledgers['c'] ?? 0);
        $reopened = $ledgers['c_state'] === 'estimated_cap' && $proposal->rate_zar > $cap;

        $brief->proposals()->where('id', '!=', $proposal->id)->where('status', '!=', 'withdrawn')->update(['status' => 'declined']);
        $proposal->update(['status' => 'awarded']);

        $version = (int) substr($scope['price_version'] ?? 'PV-01', 3);
        $scope['ledgers']['c'] = $proposal->rate_zar;
        $scope['ledgers']['c_state'] = 'actual';
        $scope['provider_selection'] = $proposal->provider->name;
        if ($reopened) {
            $scope['price_version'] = sprintf('PV-%02d', $version + 1);
        }

        $brief->update([
            'provider_id' => $proposal->provider_id,
            'scope' => $scope,
            'status' => $reopened ? 'awaiting_buyer_confirmation' : $brief->status,
            'open_to_providers' => false,
        ]);

        return $reopened;
    }

    /** Called when the buyer returns from payment: creates the engagement once the order is paid. */
    public static function syncPayment(Brief $brief): ?Engagement
    {
        $order = $brief->order;
        if (! $order || ! $order->isPaid()) {
            return null;
        }

        if ($brief->engagement) {
            return $brief->engagement;
        }

        $provider = $brief->provider ?? self::autoAssign($brief);
        $l = $brief->scope['ledgers'] ?? [];

        $engagement = Engagement::create([
            'reference' => self::engagementReference(),
            'assignment_ref' => Reference::make('ASN'),
            'brief_id' => $brief->id,
            'user_id' => $brief->user_id,
            'provider_id' => $provider?->id,
            'order_id' => $order->id,
            'title' => $brief->title,
            'service' => Options::CATEGORIES[$brief->category] ?? $brief->category,
            'category' => $brief->category,
            'client_name' => $brief->client_name,
            'stage' => 'assigned',
            'priority' => ($brief->priority_score ?? 0) >= 70 ? 'high' : 'medium',
            'progress' => 10,
            'value_zar' => (int) (($l['a'] ?? 0) + ($l['b'] ?? 0) + ($l['c'] ?? 0)),
            'provider_rate_zar' => (int) ($l['c'] ?? 0),
            'payment_state' => 'pay_on_qa',
            'qa_standard' => $brief->scope['qa']['standard'] ?? 'QA-MP-07',
            'target_date' => now()->addDays(18),
            'meta' => [
                'timeline' => [
                    Workflow::event('Payment Received', "Order {$order->reference} paid", 'TBCA Marketplace'),
                    Workflow::event('Provider Assigned', ($provider?->name ?? 'Provider').' assigned to engagement', 'TBCA Marketplace'),
                ],
                'documents' => [['Contract & Scope', 'Approved'], ['Provider Work Plan', 'Pending'], ['Deliverable v1.0', 'Pending'], ['Evidence Pack', 'Pending']],
                'scope_items' => $brief->scope['scope_items'] ?? [],
            ],
        ]);

        $brief->update(['status' => 'assigned', 'provider_id' => $provider?->id]);

        return $engagement;
    }

    public static function engagementReference(): string
    {
        $n = Engagement::count() + 100;
        do {
            $ref = sprintf('ENG-2026-%04d', ++$n);
        } while (Engagement::where('reference', $ref)->exists());

        return $ref;
    }

    /** Fallback assignment: best-matching routable provider. */
    public static function autoAssign(Brief $brief): ?Provider
    {
        return Matching::forBrief($brief, 1)->first()['provider'] ?? null;
    }
}
