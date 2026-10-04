<?php

namespace App\Support\Portal;

use App\Models\Order;
use App\Models\Portal\Deliverable;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Membership;
use App\Models\Portal\Record;
use App\Models\Portal\Task;
use App\Models\Portal\Ticket;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * The One Action Centre (CP-SCR-014): every item currently waiting on the
 * client, derived live from the records that own it.
 */
class Actions
{
    /** @return Collection<int, array{key:string,title:string,description:string,type:string,related:string,related_url:?string,priority:string,due:?Carbon,status:string,href:string}> */
    public static function for(User $user): Collection
    {
        $items = collect();
        $today = now()->startOfDay();

        $status = function (?Carbon $due, string $fallback = 'awaiting_you') use ($today): string {
            if (! $due) {
                return $fallback;
            }

            return $due->lt($today) ? 'overdue' : ($due->lte($today->copy()->addDays(7)) ? 'due_soon' : $fallback);
        };

        foreach (EvidenceRequest::with('project')->where('user_id', $user->id)->where('status', 'pending')->get() as $r) {
            $items->push([
                'key' => 'evidence-'.$r->id, 'title' => 'Provide: '.$r->title, 'description' => $r->description ?: 'Upload the requested evidence.',
                'type' => 'Compliance', 'related' => $r->project?->name ?? 'Onboarding', 'related_url' => $r->project ? '/portal/projects/'.$r->project->reference : null,
                'priority' => $r->priority, 'due' => $r->due_on, 'status' => $status($r->due_on), 'href' => '/portal/evidence?focus='.$r->id,
            ]);
        }

        foreach (Deliverable::with('project')->where('user_id', $user->id)->whereIn('release_state', ['delivered', 'release_approved'])->where('acceptance_state', 'pending')->get() as $d) {
            $items->push([
                'key' => 'deliverable-'.$d->id, 'title' => ucfirst($d->decision_type).': '.$d->title.' v'.$d->version, 'description' => 'Review the released deliverable and record your decision.',
                'type' => 'Project', 'related' => $d->project?->name ?? '—', 'related_url' => $d->project ? '/portal/projects/'.$d->project->reference : null,
                'priority' => 'medium', 'due' => $d->acceptance_due_on, 'status' => $status($d->acceptance_due_on), 'href' => '/portal/deliverables/'.$d->id,
            ]);
        }

        foreach (Order::where('user_id', $user->id)->where('status', 'awaiting_payment')->get() as $o) {
            $due = $o->created_at->copy()->addDays(7)->startOfDay();
            $items->push([
                'key' => 'order-'.$o->id, 'title' => 'Pay invoice '.Billing::invoiceNumber($o), 'description' => 'Payment is required to keep services active.',
                'type' => 'Finance', 'related' => $o->meta['title'] ?? 'Order '.$o->reference, 'related_url' => '/portal/orders/'.$o->reference,
                'priority' => 'high', 'due' => $due, 'status' => $status($due), 'href' => '/checkout/'.$o->reference,
            ]);
        }

        foreach (Record::where('user_id', $user->id)->where('register', 'contract')->where('status', 'pending_signature')->get() as $c) {
            $items->push([
                'key' => 'contract-'.$c->id, 'title' => 'Review and sign '.$c->title, 'description' => 'Your signature is required before work can start.',
                'type' => 'Legal', 'related' => $c->reference, 'related_url' => '/portal/contracts',
                'priority' => 'high', 'due' => $c->due_on, 'status' => $status($c->due_on), 'href' => '/portal/contracts?focus='.$c->id,
            ]);
        }

        foreach (Record::where('user_id', $user->id)->where('register', 'quotation')->where('status', 'sent')->get() as $q) {
            $items->push([
                'key' => 'quote-'.$q->id, 'title' => 'Respond to '.$q->title, 'description' => 'Accept, decline or request changes to this proposal.',
                'type' => 'Finance', 'related' => $q->reference, 'related_url' => '/portal/quotations',
                'priority' => 'medium', 'due' => $q->due_on, 'status' => $status($q->due_on), 'href' => '/portal/quotations',
            ]);
        }

        $account = Portal::account($user);
        foreach (Membership::where('organisation_id', $account->organisation_id)->where('status', 'invited')->get() as $m) {
            $items->push([
                'key' => 'member-'.$m->id, 'title' => 'Approve new team member access', 'description' => "Review and approve access for {$m->name}.",
                'type' => 'Access', 'related' => 'Organisation Access', 'related_url' => '/portal/team',
                'priority' => 'medium', 'due' => $m->invited_at?->copy()->addDays(7), 'status' => 'awaiting_you', 'href' => '/portal/team?tab=invitations',
            ]);
        }

        foreach (Ticket::where('user_id', $user->id)->where('status', 'on_hold')->get() as $t) {
            $items->push([
                'key' => 'ticket-'.$t->id, 'title' => 'Reply to support: '.$t->subject, 'description' => 'Our team is waiting for your input.',
                'type' => 'Support', 'related' => $t->reference, 'related_url' => '/portal/support/'.$t->reference,
                'priority' => $t->priority, 'due' => null, 'status' => 'awaiting_you', 'href' => '/portal/support/'.$t->reference,
            ]);
        }

        foreach (Task::with('project')->where('user_id', $user->id)->where('kind', 'task')->where('status', '!=', 'completed')->where('assignee', $user->name)->get() as $t) {
            $items->push([
                'key' => 'task-'.$t->id, 'title' => $t->title, 'description' => $t->description ?: 'Task assigned to you.',
                'type' => 'Project', 'related' => $t->project?->name ?? '—', 'related_url' => $t->project ? '/portal/projects/'.$t->project->reference : null,
                'priority' => $t->priority, 'due' => $t->due_on, 'status' => $status($t->due_on), 'href' => '/portal/tasks',
            ]);
        }

        foreach ($account->onboarding ?? [] as $step => $state) {
            if ($state !== 'completed' && in_array($step, ['identity_verified', 'organisation_matched', 'authority_setup', 'terms_consent'], true)) {
                [$label, $desc, $href] = Portal::ONBOARDING[$step];
                $items->push([
                    'key' => 'setup-'.$step, 'title' => 'Complete setup: '.$label, 'description' => $desc,
                    'type' => 'Onboarding', 'related' => 'Guided Setup', 'related_url' => '/portal/welcome',
                    'priority' => 'medium', 'due' => null, 'status' => 'awaiting_you', 'href' => $href ?? '/portal/welcome',
                ]);
            }
        }

        $rank = ['overdue' => 0, 'due_soon' => 1, 'awaiting_you' => 2];

        return $items->sortBy(fn ($i) => [$rank[$i['status']] ?? 3, $i['due']?->timestamp ?? PHP_INT_MAX])->values();
    }
}
