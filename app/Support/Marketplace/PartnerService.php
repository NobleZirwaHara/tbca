<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\PartnerRequest;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Support\Platform\Reference;

/**
 * Partner Services matter (PS-TEB v1.1):
 *
 *  intake -> resolution (Permission Row match; jurisdiction_unavailable if none)
 *         -> conflict_pending (partner assigned; payment/work/access locked)
 *         -> conflict_identified (CONFLICTED: propose another / pause / close) | proposal (CLEAR)
 *         -> scope_quote (T/P/X/S/C; BLOCKED when T + P below the current floor)
 *         -> instrument (signature) -> responsibility (confirmation) -> payment
 *         -> delivery -> qa_review -> completed (settlement)
 *
 * "No conflict clearance. No money. No work. No exceptions."
 */
class PartnerService
{
    public static function nextReference(): string
    {
        $n = PartnerRequest::count() + 140;
        do {
            $ref = sprintf('PSR-2026-%06d', ++$n);
        } while (PartnerRequest::where('reference', $ref)->exists());

        return $ref;
    }

    public static function history(PartnerRequest $r, string $title, string $body = ''): void
    {
        $meta = $r->meta ?? [];
        $meta['history'][] = ['at' => now()->format('d M Y, H:i'), 'title' => $title, 'body' => $body];
        $r->meta = $meta;
    }

    /** GATE-PS-02: match an authorised/conditional Permission Row for profession + jurisdiction. */
    public static function resolve(PartnerRequest $r): void
    {
        $in = $r->intake ?? [];
        $profession = $in['profession'] ?? '';
        $jurisdiction = $in['jurisdiction'] ?? 'South Africa';

        $row = Record::where('register', 'permissions')
            ->whereIn('status', ['authorised', 'conditional'])
            ->get()
            ->first(fn ($rec) => self::professionMatches($rec->data['profession'] ?? '', $profession)
                && ($rec->data['jurisdiction'] ?? '') === $jurisdiction);

        if (! $row) {
            $r->update([
                'stage' => 'jurisdiction_unavailable',
                'resolution' => [
                    'matched' => false,
                    'client_country' => $in['client_country'] ?? 'South Africa',
                    'matter_jurisdiction' => $in['country'] ?? $jurisdiction,
                    'practice_jurisdiction' => $jurisdiction,
                    'profession' => $profession,
                ],
            ]);

            return;
        }

        $arrangement = $row->data['arrangement'] ?? 'A1 – Partner Reviewed';
        $r->update([
            'stage' => 'resolution',
            'permission_ref' => $row->reference,
            'arrangement' => $arrangement,
            'fee_mechanism' => $row->data['mechanism'] ?? 'M1 – TBCA Coordination Fee',
            'resolution' => [
                'matched' => true,
                'row' => $row->reference,
                'row_status' => $row->status,
                'client_country' => $in['client_country'] ?? 'South Africa',
                'matter_jurisdiction' => $in['country'] ?? $jurisdiction,
                'practice_jurisdiction' => $jurisdiction,
                'profession' => $row->data['profession'],
                'specialisation' => $in['specialisation'] ?: ($row->data['activity'] ?? ''),
                'output' => $in['output'] ?? '',
                'intended_use' => $in['intended_use'] ?? '',
                'credential_class' => 'Independent Expert Review',
                'arrangement_path' => $arrangement.' candidate',
                'activity' => $row->data['activity'] ?? '',
                'conditions' => $row->status === 'conditional',
            ],
        ]);
    }

    public static function professionMatches(string $rowProfession, string $requested): bool
    {
        $norm = fn ($s) => strtolower(preg_replace('/\s*\(.*?\)\s*/', '', $s));

        return $norm($rowProfession) === $norm($requested) || str_contains($norm($rowProfession), $norm($requested)) || str_contains($norm($requested), $norm($rowProfession));
    }

    /** Sends for conflict check: picks a routable partner for the profession, excluding previously conflicted firms. */
    public static function sendForConflict(PartnerRequest $r): void
    {
        $excluded = $r->meta['excluded_partners'] ?? [];
        $profession = $r->resolution['profession'] ?? ($r->intake['profession'] ?? '');

        $partner = Provider::where('kind', 'partner')
            ->whereIn('status', ['active', 'active_with_conditions'])
            ->whereNotIn('id', $excluded)
            ->get()
            ->first(fn (Provider $p) => self::professionMatches($p->profession ?? '', $profession));

        if (! $partner) {
            $r->update(['stage' => 'no_partner_available', 'conflict_state' => 'NOT_REQUESTED']);

            return;
        }

        self::history($r, 'Conflict check requested', "Sent to {$partner->name}");
        $r->partner_id = $partner->id;
        $r->stage = 'conflict_pending';
        $r->conflict_state = 'PENDING';
        $r->save();

        Record::updateOrCreate(['register' => 'conflicts', 'reference' => 'PCF-'.substr($r->reference, -5)], [
            'status' => 'open',
            'priority' => 'low',
            'data' => ['matter' => $r->title, 'partner' => $partner->name, 'type' => 'Pre-engagement Check', 'opened' => now()->format('d M Y'), 'days' => 0, 'request' => $r->reference],
        ]);
    }

    /** Partner submits the conflict result (PS-020). */
    public static function submitConflict(PartnerRequest $r, array $data): void
    {
        abort_unless($r->stage === 'conflict_pending', 422, 'This matter is not awaiting a conflict check.');
        $meta = $r->meta ?? [];
        $meta['conflict'] = [...$data, 'submitted_at' => now()->format('d M Y, H:i')];
        $r->meta = $meta;
        $caseRef = 'PCF-'.substr($r->reference, -5);

        if ($data['result'] === 'conflicted') {
            $meta['excluded_partners'] = [...($meta['excluded_partners'] ?? []), $r->partner_id];
            $meta['conflict_identified_at'] = now()->format('d M Y, H:i');
            $r->meta = $meta;
            $r->stage = 'conflict_identified';
            $r->conflict_state = 'CONFLICTED';
            self::history($r, 'Conflict identified', 'Professional unable to act. Reason confidential.');
            Record::where('register', 'conflicts')->where('reference', $caseRef)->update(['status' => 'conflicted', 'priority' => 'high']);
        } else {
            $r->conflict_state = $data['result'] === 'clear_with_conditions' ? 'CLEAR_WITH_CONDITIONS' : 'CLEAR';
            $r->stage = 'proposal';
            $meta['proposal'] = self::buildProposal($r);
            $r->meta = $meta;
            if (! $r->quote) {
                $r->quote = self::defaultQuote($r);
            }
            self::history($r, 'Conflict cleared', 'Partner proposal issued.');
            Record::where('register', 'conflicts')->where('reference', $caseRef)->update(['status' => 'resolved']);
        }
        $r->save();
    }

    public static function buildProposal(PartnerRequest $r): array
    {
        $p = $r->partner;
        $profile = $p?->profile ?? [];

        return [
            'firm' => $p?->name,
            'specialisation' => $profile['specialisation'] ?? $p?->profession,
            'firm_type' => $profile['firm_type'] ?? 'Independent Specialist Firm',
            'registration' => $profile['registration'] ?? '',
            'address' => $profile['address'] ?? $p?->city,
            'lead' => $profile['lead'] ?? '',
            'qualifications' => $profile['qualifications'] ?? '',
            'professional_registration' => $profile['professional_registration'] ?? '',
            'experience' => $profile['experience'] ?? '10+ years',
            'independence' => 'Filed '.now()->format('d M Y'),
            'understanding' => $r->intake['description'] ?? '',
            'methodology' => $profile['methodology'] ?? 'Scoping → Assessment → Findings → Review → Reporting',
            'deliverables' => $profile['deliverables'] ?? 'Signed report and supporting documentation',
            'timeline' => $profile['timeline'] ?? '4–6 weeks from appointment',
            'team' => $profile['team'] ?? 'Lead professional and specialist support',
        ];
    }

    public static function defaultQuote(PartnerRequest $r): array
    {
        $listing = $r->listing;
        $t = (int) ($listing?->details['fees']['t'] ?? 24500);
        $p = (int) ($r->partner?->profile['standard_fee'] ?? ($listing?->details['fees']['p'] ?? 68500));
        $x = (int) ($listing?->details['fees']['x'] ?? 12000);

        return [...Pricing::partnerQuote($t, $p, $x), 'basis' => 'Time & Materials (Professional Fee)', 'validity' => now()->addDays(30)->format('d M Y'), 'source' => 'indicative'];
    }

    /** Partner revises the quote (PS-021). Below-floor quotes are blocked automatically. */
    public static function submitQuote(PartnerRequest $r, array $data): void
    {
        abort_unless(in_array($r->stage, ['proposal', 'scope_quote'], true), 422, 'Quotes can only be revised before the scope is accepted.');
        $calc = Pricing::partnerSubmission($data['billing_basis'], (int) ($data['hours'] ?? 0), (int) ($data['rate'] ?? 0), (int) ($data['fixed_fee'] ?? 0), (int) $data['disbursements']);
        $t = (int) ($r->quote['t'] ?? 24500);
        $quote = Pricing::partnerQuote($t, $calc['p'], $calc['x']);

        $r->quote = [
            ...$quote,
            'basis' => $data['billing_basis'] === 'time-materials' ? 'Time & Materials (Professional Fee)' : 'Fixed Fee (Defined Scope)',
            'mechanism' => $data['fee_mechanism'],
            'hours' => (int) ($data['hours'] ?? 0),
            'rate' => (int) ($data['rate'] ?? 0),
            'validity' => $data['valid_until'],
            'scope' => $data['description'],
            'methodology' => $data['methodology'] ?? '',
            'deliverables' => $data['deliverables'] ?? '',
            'assumptions' => $data['assumptions'] ?? '',
            'exclusions' => $data['exclusions'] ?? '',
            'source' => 'partner',
            'submitted_at' => now()->format('d M Y, H:i'),
        ];
        self::history($r, 'Scope & quote submitted', 'Partner submitted P = R'.number_format($calc['p']));
        $r->save();

        if ($quote['floor_status'] === 'BLOCKED') {
            self::blockBelowFloor($r);
        }
    }

    public static function blockBelowFloor(PartnerRequest $r): void
    {
        $q = $r->quote;
        $quoted = (int) ($q['t'] + $q['p']);
        Record::updateOrCreate(['register' => 'ps-floor-blocks', 'reference' => 'BF-'.substr($r->reference, -6)], [
            'status' => 'blocked',
            'priority' => 'high',
            'data' => [
                'matter' => $r->reference.' '.$r->title,
                'partner' => $r->partner?->name,
                'profession' => $r->partner?->profession,
                'arrangement' => $r->arrangement,
                'quoted' => $quoted,
                'floor' => Pricing::PS_FLOOR_ZAR,
                'variance' => sprintf('-R%s (%.1f%%)', number_format(Pricing::PS_FLOOR_ZAR - $quoted), (Pricing::PS_FLOOR_ZAR - $quoted) / Pricing::PS_FLOOR_ZAR * -100),
                'created' => now()->format('d M Y'),
            ],
        ]);
    }

    /** Creates the payment order once the responsibility statement is confirmed. */
    public static function orderLines(PartnerRequest $r): array
    {
        $q = $r->quote;
        $lines = [
            ['item_type' => 'partner-service', 'item_code' => $r->reference.'-T', 'name' => 'T – TBCA Coordination Fee ('.$r->reference.')', 'unit_zar' => (int) $q['t']],
            ['item_type' => 'partner-service', 'item_code' => $r->reference.'-P', 'name' => 'P – Professional Fee ('.($r->partner?->name ?? 'Professional').')', 'unit_zar' => (int) $q['p']],
        ];
        if ((int) $q['x'] > 0) {
            $lines[] = ['item_type' => 'partner-service', 'item_code' => $r->reference.'-X', 'name' => 'X – Disbursements (estimated)', 'unit_zar' => (int) $q['x']];
        }

        return $lines;
    }

    public static function syncPayment(PartnerRequest $r): void
    {
        if ($r->stage === 'payment' && $r->order?->isPaid()) {
            $r->stage = 'delivery';
            $meta = $r->meta ?? [];
            $meta['delivery'] = $meta['delivery'] ?? [
                'milestone' => 'Inception & Data Request', 'progress' => 5, 'status' => 'In Progress',
                'files' => [], 'hours_logged' => 0, 'hours_total' => (int) ($r->quote['hours'] ?? 120),
                'qa' => ['Scope compliance' => 'Not Started', 'Professional methodology' => 'Not Started', 'Technical accuracy' => 'Not Started', 'Legislative compliance' => 'Not Started', 'Completeness of deliverables' => 'Not Started'],
                'activity' => [],
            ];
            $r->meta = $meta;
            self::history($r, 'Payment received', 'Order '.$r->order->reference.' paid. Professional may commence.');
            $r->save();

            Record::updateOrCreate(['register' => 'ledgers', 'reference' => 'TXN-'.substr($r->order->reference, -6)], [
                'status' => 'posted',
                'data' => ['date' => now()->format('d M Y H:i'), 'ledger' => 'T', 'type' => 'Client Payment Into Trust', 'matter' => $r->reference, 'client' => $r->client_name, 'partner' => '—', 'ref' => $r->order->reference, 'amount' => $r->order->total_zar],
            ]);
        }
    }

    /** Client signs off the delivered professional work: settlement is recorded (PS-023). */
    public static function settle(PartnerRequest $r): void
    {
        $q = $r->quote;
        $p = (float) $q['p'];
        $t = (float) $q['t'];
        $meta = $r->meta ?? [];
        $meta['settlement'] = [
            'reference' => Reference::make('SET'),
            'invoice' => Reference::make('INV'),
            'tax_point' => now()->format('d M Y'),
            'p' => $p, 't' => $t,
            'p_vat' => round($p * 0.15, 2), 't_vat' => round($t * 0.15, 2),
            'paid_on' => $r->order?->paid_at?->format('d M Y') ?? now()->format('d M Y'),
            'payment_ref' => $r->order?->reference,
            'method' => 'Bank Transfer',
            'status' => 'Settled',
        ];
        $r->meta = $meta;
        $r->stage = 'completed';
        self::history($r, 'Delivery signed off', 'Engagement completed and settled.');
        $r->save();

        Record::updateOrCreate(['register' => 'ledgers', 'reference' => 'TXN-P-'.substr($r->reference, -6)], [
            'status' => 'posted',
            'data' => ['date' => now()->format('d M Y H:i'), 'ledger' => 'P', 'type' => 'Professional Fee To Partner', 'matter' => $r->reference, 'client' => $r->client_name, 'partner' => $r->partner?->name, 'ref' => $meta['settlement']['reference'], 'amount' => $p],
        ]);
    }
}
