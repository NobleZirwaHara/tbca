<?php

namespace App\Support\Portal;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Portal\Deliverable;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Project;
use App\Models\Portal\Record;
use App\Models\Portal\Task;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Client finance projection (CP-TEB Parts 14-16). Invoices and statements are
 * generated from the shared orders/payments tables; credits come from approved
 * CP:C credit notes. The portal never keeps a second journal.
 */
class Billing
{
    public static function invoiceNumber(Order $order): string
    {
        return 'INV-'.$order->created_at->format('Y').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
    }

    public static function dueDate(Order $order)
    {
        return $order->created_at->copy()->addDays(7);
    }

    /** Invoice status as the client sees it. */
    public static function invoiceStatus(Order $order): string
    {
        return match ($order->status) {
            'paid' => 'paid',
            'refunded' => 'refunded',
            'cancelled' => 'cancelled',
            default => self::dueDate($order)->isPast() ? 'overdue' : 'outstanding',
        };
    }

    /** @return Collection<int, Order> */
    public static function orders(User $user): Collection
    {
        return Order::with(['items', 'payments'])->where('user_id', $user->id)->latest()->get();
    }

    /** @return Collection<int, Record> */
    public static function credits(User $user): Collection
    {
        return Record::where('user_id', $user->id)->where('register', 'credit_note')->orderBy('created_at')->get();
    }

    public static function summary(User $user): array
    {
        $orders = self::orders($user)->whereNotIn('status', ['cancelled']);
        $paid = $orders->where('status', 'paid')->sum('total_zar');
        $open = $orders->whereIn('status', ['awaiting_payment', 'failed']);
        $overdue = $open->filter(fn ($o) => self::dueDate($o)->isPast());
        $credits = self::credits($user)->where('status', 'available')->sum('amount_zar');

        return [
            'invoiced' => (int) $orders->sum('total_zar'),
            'count' => $orders->count(),
            'paid' => (int) $paid,
            'outstanding' => (int) $open->sum('total_zar'),
            'outstanding_count' => $open->count(),
            'overdue' => (int) $overdue->sum('total_zar'),
            'overdue_count' => $overdue->count(),
            'credits' => (int) $credits,
        ];
    }

    /** Running ledger for a statement period. @return array{opening:int, lines:list<array>, closing:int, debits:int, credits:int} */
    public static function statement(User $user, ?string $from = null, ?string $to = null): array
    {
        $events = collect();
        foreach (self::orders($user)->whereNotIn('status', ['cancelled']) as $o) {
            $events->push(['date' => $o->created_at, 'type' => 'Invoice', 'reference' => self::invoiceNumber($o), 'description' => $o->meta['title'] ?? ($o->items->first()?->name ?? 'Order '.$o->reference), 'debit' => $o->total_zar, 'credit' => 0, 'href' => '/portal/invoices/'.$o->reference]);
            foreach ($o->payments->where('status', 'succeeded') as $p) {
                $events->push(['date' => $p->created_at, 'type' => 'Payment', 'reference' => $p->reference, 'description' => 'Payment received – thank you', 'debit' => 0, 'credit' => $p->amount_zar, 'href' => '/portal/payments/'.$p->reference]);
            }
            if ($o->status === 'refunded') {
                $events->push(['date' => $o->updated_at, 'type' => 'Refund', 'reference' => 'RF-'.$o->id, 'description' => 'Refund issued', 'debit' => $o->total_zar, 'credit' => 0, 'href' => null]);
            }
        }
        foreach (self::credits($user) as $c) {
            $events->push(['date' => $c->created_at, 'type' => 'Credit Note', 'reference' => $c->reference, 'description' => $c->title, 'debit' => 0, 'credit' => (int) $c->amount_zar, 'href' => null]);
        }
        $events = $events->sortBy('date')->values();

        $fromDate = $from ? \Illuminate\Support\Carbon::parse($from)->startOfDay() : null;
        $toDate = $to ? \Illuminate\Support\Carbon::parse($to)->endOfDay() : null;

        $balance = 0; // positive = client owes TBCA
        $opening = 0;
        $lines = [];
        foreach ($events as $e) {
            if ($fromDate && $e['date']->lt($fromDate)) {
                $opening += $e['debit'] - $e['credit'];
                $balance = $opening;

                continue;
            }
            if ($toDate && $e['date']->gt($toDate)) {
                continue;
            }
            $balance += $e['debit'] - $e['credit'];
            $lines[] = $e + ['balance' => $balance];
        }

        return [
            'opening' => $opening,
            'lines' => $lines,
            'closing' => $balance,
            'debits' => (int) collect($lines)->sum('debit'),
            'credits' => (int) collect($lines)->sum('credit'),
        ];
    }

    /** Ageing of unpaid invoices by days past due. */
    public static function ageing(User $user): array
    {
        $buckets = ['Current (0-30 days)' => 0, '31-60 days' => 0, '61-90 days' => 0, '90+ days' => 0];
        foreach (self::orders($user)->whereIn('status', ['awaiting_payment', 'failed']) as $o) {
            $days = (int) $o->created_at->diffInDays(now(), true);
            $key = match (true) {
                $days <= 30 => 'Current (0-30 days)',
                $days <= 60 => '31-60 days',
                $days <= 90 => '61-90 days',
                default => '90+ days',
            };
            $buckets[$key] += $o->total_zar;
        }

        return $buckets;
    }

    /**
     * "If I stop now" decision support (CP-SCR-030, CP-TEB 15.2): separates
     * value delivered, work in progress, future work, payable now and open items.
     */
    public static function stopNow(Project $project): array
    {
        $fee = (int) $project->fee_zar;
        $stages = max(1, count($project->stages ?? []) ?: 5);
        $delivered = (int) round($fee * $project->progress / 100);
        $wip = (int) min($fee - $delivered, round($fee / $stages * 0.85));
        $future = max(0, $fee - $delivered - $wip);
        $payable = max(0, $delivered + (int) round($wip * 0.5) - (int) $project->billed_zar);

        $openItems = Task::where('project_id', $project->id)->where('status', '!=', 'completed')->count()
            + EvidenceRequest::where('project_id', $project->id)->where('status', 'pending')->count()
            + Deliverable::where('project_id', $project->id)->where('acceptance_state', 'pending')->count();

        $milestones = collect($project->meta['milestones'] ?? [])->where('status', '!=', 'paid')->values()->all();

        return [
            'fee' => $fee,
            'delivered' => $delivered,
            'wip' => $wip,
            'future' => $future,
            'billed' => (int) $project->billed_zar,
            'payable' => $payable,
            'open_items' => $openItems,
            'milestones' => $milestones,
            'remaining_if_continue' => (int) collect($milestones)->sum('amount'),
        ];
    }

    public static function payments(User $user): Collection
    {
        return Payment::with('order')->whereHas('order', fn ($q) => $q->where('user_id', $user->id))->latest()->get();
    }
}
