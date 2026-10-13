<?php

namespace App\Support\Integrations\Zoho;

use App\Models\IntegrationEvent;
use App\Models\IntegrationLink;

/**
 * Sends one outbound ledger event to the Zoho apps it concerns.
 *
 * Every step is idempotent: its result is saved on the event as soon as it
 * succeeds, and creates are preceded by a lookup (link table, upsert by TBCA
 * ID, or search by reference). A retry after a timeout therefore resumes and
 * never creates a second invoice, project, folder or ticket.
 *
 * Returns true when the event was handed to Zoho Flow and is awaiting Flow's
 * confirmation (status "sent"); false when it is complete.
 */
class OutboundSync
{
    public function handle(IntegrationEvent $event): bool
    {
        $data = $event->payload ?? [];

        match ($event->type) {
            'order.payment_verified' => $this->orderPaid($event, $data),
            'enquiry.received', 'webinar.registered' => $this->lead($event, $data),
            'dd.case_created' => $this->ddCase($event, $data),
            'vdr.enquiry_submitted' => $this->dealRoom($event, $data),
            'support.requested' => $this->support($event, $data),
            default => throw new ZohoException("No Zoho handler for event type {$event->type}.", retryable: false),
        };

        return $this->flow($event, $data);
    }

    /* --- A2 Paid order: CRM account, contact and deal; Books invoice and payment; Projects; WorkDrive --- */

    private function orderPaid(IntegrationEvent $event, array $data): void
    {
        $order = $data['order_id'];
        $party = $data['party'] ?? [];
        [$accountId] = $this->account($event, $party);

        $this->once($event, 'crm_deal', fn () => Zoho::crm()->upsertDeal($order, array_filter([
            'Deal_Name' => trim($order.' '.($data['items'][0]['name'] ?? '')),
            'Stage' => 'Closed Won',
            'Amount' => $data['total_zar'],
            'Currency' => $data['currency'],
            'Account_Name' => $accountId ? ['id' => $accountId] : null,
            'Payment_Verification' => 'Verified',
            'SKU' => $data['items'][0]['item_code'] ?? null,
        ], fn ($v) => $v !== null))['id']);

        if (ZohoConfig::org('books', 'organization_id')) {
            $customerId = $this->booksCustomer($event, $party);
            $invoice = $this->once($event, 'books_invoice', function () use ($data, $order, $customerId) {
                $existing = IntegrationLink::externalId('order', $order, 'zoho_books', 'invoices');
                if ($existing) {
                    return ['invoice_id' => $existing, 'total' => null, 'status' => 'linked'];
                }
                $found = Zoho::books()->findInvoiceByReference($order);
                if ($found) {
                    IntegrationLink::remember('order', $order, 'zoho_books', 'invoices', (string) $found['invoice_id']);

                    return ['invoice_id' => (string) $found['invoice_id'], 'total' => $found['total'] ?? null, 'status' => $found['status'] ?? null];
                }
                $created = Zoho::books()->createInvoice([
                    'customer_id' => $customerId,
                    'reference_number' => $order,
                    'date' => substr((string) ($data['paid_at'] ?? now()->toIso8601String()), 0, 10),
                    'currency_code' => $data['currency'],
                    'line_items' => $this->lines($data),
                    'notes' => 'TBCA order '.$order,
                ]);
                IntegrationLink::remember('order', $order, 'zoho_books', 'invoices', $created['invoice_id'], ['number' => $created['invoice_number']]);

                return ['invoice_id' => $created['invoice_id'], 'total' => null, 'status' => 'draft'];
            });

            // A payment that was recorded in Books first (EFT matched there) must not be recorded twice.
            if (($data['paid_via'] ?? null) !== 'zoho_books' && ($invoice['status'] ?? null) !== 'paid') {
                $this->once($event, 'books_payment', fn () => Zoho::books()->recordPayment([
                    'customer_id' => $customerId,
                    'payment_mode' => $data['payment_method'] ?? 'card',
                    'amount' => $invoice['total'] ?? $data['total_zar'],
                    'date' => substr((string) ($data['paid_at'] ?? now()->toIso8601String()), 0, 10),
                    'reference_number' => $data['payment_reference'] ?? $order,
                    'invoices' => [['invoice_id' => $invoice['invoice_id'], 'amount_applied' => $invoice['total'] ?? $data['total_zar']]],
                ]));
            }
        }

        $isDelivery = collect($data['items'] ?? [])->contains(fn ($i) => in_array($i['item_type'] ?? '', ['sprint', 'retainer'], true)) || ($data['section'] ?? '') === 'sprints';

        if ($isDelivery && ZohoConfig::org('projects', 'portal_id')) {
            $this->once($event, 'projects_project', function () use ($order, $data) {
                $existing = IntegrationLink::externalId('order', $order, 'zoho_projects', 'projects');
                if ($existing) {
                    return $existing;
                }
                $id = Zoho::projects()->createFromTemplate(trim($order.' '.($data['items'][0]['name'] ?? 'Engagement')), 'TBCA order '.$order.' for '.($data['party']['company'] ?? $data['party']['name'] ?? 'client'));
                IntegrationLink::remember('order', $order, 'zoho_projects', 'projects', $id);

                return $id;
            });
        }

        if ($isDelivery && ZohoConfig::org('workdrive', 'parent_folder_id')) {
            $this->once($event, 'workdrive_folder', function () use ($order, $data) {
                $existing = IntegrationLink::externalId('order', $order, 'zoho_workdrive', 'folders');
                if ($existing) {
                    return $existing;
                }
                $id = Zoho::workdrive()->createFolder($order.' '.($data['party']['company'] ?? $data['party']['name'] ?? ''));
                IntegrationLink::remember('order', $order, 'zoho_workdrive', 'folders', $id);

                return $id;
            });
        }
    }

    /* --- A1 Enquiry or webinar registration: CRM lead --- */

    private function lead(IntegrationEvent $event, array $data): void
    {
        $party = $data['party'] ?? [];
        if (blank($party['email'] ?? null)) {
            throw new ZohoException('Lead has no email address; it needs a person to correct it.', retryable: false);
        }

        [$first, $last] = $this->splitName($party['name'] ?? null);

        $this->once($event, 'crm_lead', fn () => Zoho::crm()->upsertLead(array_filter([
            'First_Name' => $first,
            'Last_Name' => $last,
            'Email' => $party['email'],
            'Company' => $party['company'] ?? null,
            'Phone' => $party['phone'] ?? null,
            'Designation' => $party['job_title'] ?? null,
            'Lead_Source' => $event->type === 'webinar.registered' ? 'Webinar' : 'TBCA website',
            'Description' => trim(($data['type'] ?? $data['webinar'] ?? '').': '.($data['subject'] ?? $data['reference'] ?? ''), ': '),
            'TBCA_Reference' => $data['reference'] ?? null,
            'TBCA_Person_ID' => $party['person_id'] ?? null,
        ], fn ($v) => $v !== null && $v !== ''))['id']);
    }

    /* --- A4 Due Diligence case: Creator control record --- */

    private function ddCase(IntegrationEvent $event, array $data): void
    {
        $this->account($event, $data['party'] ?? []);

        if (! ZohoConfig::org('creator', 'owner')) {
            return;
        }

        $this->once($event, 'creator_dd_case', function () use ($data) {
            $ref = $data['case_id'];
            $existing = IntegrationLink::externalId('dd_case', $ref, 'zoho_creator', 'DD_Cases')
                ?? Zoho::creator()->findRecord('All_DD_Cases', '(TBCA_Reference == "'.$ref.'")');
            if ($existing) {
                return $existing;
            }
            $id = Zoho::creator()->addRecord('DD_Cases', array_filter([
                'TBCA_Reference' => $ref,
                'TBCA_Business_ID' => $data['party']['business_id'] ?? null,
                'Order_ID' => $data['order_id'] ?? null,
                'SKU' => $data['sku'] ?? null,
                'Subject_Type' => $data['subject_type'] ?? null,
                'Jurisdiction' => $data['jurisdiction'] ?? null,
                'Purpose' => $data['purpose'] ?? null,
                'State' => $data['status'] ?? null,
            ], fn ($v) => $v !== null));
            IntegrationLink::remember('dd_case', $ref, 'zoho_creator', 'DD_Cases', $id);

            return $id;
        });
    }

    /* --- A5 Deal room enquiry: CRM account and contact, Creator deal room record --- */

    private function dealRoom(IntegrationEvent $event, array $data): void
    {
        $this->account($event, $data['party'] ?? []);

        if (! ZohoConfig::org('creator', 'owner')) {
            return;
        }

        $this->once($event, 'creator_deal_room', function () use ($data) {
            $ref = $data['room_id'];
            $existing = IntegrationLink::externalId('vdr_room', $ref, 'zoho_creator', 'Deal_Rooms')
                ?? Zoho::creator()->findRecord('All_Deal_Rooms', '(TBCA_Reference == "'.$ref.'")');
            if ($existing) {
                return $existing;
            }
            $id = Zoho::creator()->addRecord('Deal_Rooms', array_filter([
                'TBCA_Reference' => $ref,
                'TBCA_Business_ID' => $data['party']['business_id'] ?? null,
                'Company' => $data['company'] ?? null,
                'Country' => $data['country'] ?? null,
                'Deal_Type' => $data['deal_type'] ?? null,
                'Transaction_Type' => $data['transaction_type'] ?? null,
                'Amount_ZAR' => $data['amount_zar'] ?? null,
                'Fit_Score' => $data['fit_score'] ?? null,
                'State' => 'Requested',
            ], fn ($v) => $v !== null));
            IntegrationLink::remember('vdr_room', $ref, 'zoho_creator', 'Deal_Rooms', $id);

            return $id;
        });
    }

    /* --- A8 Support request: Desk ticket --- */

    private function support(IntegrationEvent $event, array $data): void
    {
        if (! ZohoConfig::org('desk', 'org_id')) {
            throw new ZohoException('ZOHO_DESK_ORG_ID is not set.', retryable: false);
        }

        $party = $data['party'] ?? [];
        [$first, $last] = $this->splitName($party['name'] ?? null);
        $ref = $data['reference'];

        $this->once($event, 'desk_ticket', function () use ($data, $party, $first, $last, $ref) {
            $existing = IntegrationLink::externalId('support', $ref, 'zoho_desk', 'tickets');
            if ($existing) {
                return $existing;
            }
            $ticket = Zoho::desk()->createTicket(array_filter([
                'subject' => $data['subject'] ?? 'TBCA support request '.$ref,
                'description' => 'TBCA reference '.$ref.($data['area'] ?? null ? ' | Area: '.$data['area'] : ''),
                'priority' => ucfirst((string) ($data['priority'] ?? 'medium')),
                'category' => $data['category'] ?? null,
                'channel' => 'Web',
                'contact' => array_filter(['firstName' => $first, 'lastName' => $last, 'email' => $party['email'] ?? null, 'phone' => $party['phone'] ?? null]),
                'cf' => ['cf_tbca_reference' => $ref, 'cf_tbca_business_id' => $party['business_id'] ?? null],
            ], fn ($v) => $v !== null));
            IntegrationLink::remember('support', $ref, 'zoho_desk', 'tickets', $ticket['id'], ['number' => $ticket['number']]);

            return $ticket['id'];
        });
    }

    /* --- Shared steps --- */

    /** CRM account and contact for a known TBCA customer. Anonymous parties are skipped. */
    private function account(IntegrationEvent $event, array $party): array
    {
        if (blank($party['business_id'] ?? null)) {
            return [null, null];
        }

        $accountId = $this->once($event, 'crm_account', fn () => Zoho::crm()->upsertAccount($party['business_id'], array_filter([
            'Account_Name' => ($party['company'] ?? null) ?: ($party['name'] ?? $party['business_id']),
            'Billing_Country' => $party['country'] ?? null,
            'Phone' => $party['phone'] ?? null,
        ]))['id']);

        [$first, $last] = $this->splitName($party['name'] ?? null);
        $contactId = $this->once($event, 'crm_contact', fn () => Zoho::crm()->upsertContact($party['person_id'], array_filter([
            'First_Name' => $first,
            'Last_Name' => $last,
            'Email' => $party['email'] ?? null,
            'Phone' => $party['phone'] ?? null,
            'Account_Name' => ['id' => $accountId],
        ]))['id']);

        return [$accountId, $contactId];
    }

    private function booksCustomer(IntegrationEvent $event, array $party): string
    {
        return $this->once($event, 'books_customer', function () use ($party) {
            $key = $party['business_id'] ?? ('email:'.strtolower((string) ($party['email'] ?? '')));
            $existing = IntegrationLink::externalId('business', $key, 'zoho_books', 'contacts');
            if ($existing) {
                return $existing;
            }
            $id = filled($party['email'] ?? null) ? Zoho::books()->findCustomerByEmail($party['email']) : null;
            $id ??= Zoho::books()->createCustomer(array_filter([
                'contact_name' => ($party['company'] ?? null) ?: ($party['name'] ?? 'TBCA customer'),
                'company_name' => $party['company'] ?? null,
                'contact_persons' => filled($party['email'] ?? null) ? [['first_name' => $party['name'] ?? null, 'email' => $party['email'], 'is_primary_contact' => true]] : null,
                'notes' => isset($party['business_id']) ? 'TBCA Business ID '.$party['business_id'] : null,
            ]));
            IntegrationLink::remember('business', $key, 'zoho_books', 'contacts', $id);

            return $id;
        });
    }

    /** Invoice lines from the order. Tax treatment is set on the Books items by the finance owner. */
    private function lines(array $data): array
    {
        $lines = collect($data['items'] ?? [])->map(fn ($i) => array_filter([
            'name' => $i['name'],
            'description' => trim(($i['item_code'] ?? '').' '.($i['variant'] ?? '')),
            'rate' => $i['unit_zar'],
            'quantity' => $i['quantity'] ?? 1,
        ], fn ($v) => $v !== null && $v !== ''))->values()->all();

        if (($data['fees_zar'] ?? 0) > 0) {
            $lines[] = ['name' => 'Platform and payment fees', 'rate' => $data['fees_zar'], 'quantity' => 1];
        }

        return $lines ?: [['name' => 'TBCA order '.$data['order_id'], 'rate' => $data['total_zar'], 'quantity' => 1]];
    }

    /** Trigger the Flow webhook configured for this event type. Returns true if confirmation is awaited. */
    private function flow(IntegrationEvent $event, array $data): bool
    {
        $url = config("zoho.flow.webhooks.{$event->type}");
        if (blank($url)) {
            return false;
        }

        $this->once($event, 'flow_trigger', function () use ($event, $data, $url) {
            Zoho::flow()->trigger($url, [
                'schema_version' => 1,
                'event_id' => $event->event_id,
                'event_type' => $event->type,
                'occurred_at' => $event->created_at?->toIso8601String(),
                'source' => 'tbca_laravel',
                'correlation_id' => $event->correlation_id,
                'business_id' => $data['party']['business_id'] ?? null,
                'zoho_ids' => $event->result['steps'] ?? [],
                'data' => $data,
            ]);

            return now()->toIso8601String();
        });

        return (bool) config('zoho.flow.await_confirmation');
    }

    private function once(IntegrationEvent $event, string $step, callable $fn): mixed
    {
        $done = $event->step($step);
        if ($done !== null) {
            return $done;
        }

        $value = $fn();
        $event->rememberStep($step, $value ?? true);

        return $value;
    }

    private function splitName(?string $name): array
    {
        $name = trim((string) $name);
        if ($name === '') {
            return [null, 'Unknown'];
        }
        $parts = preg_split('/\s+/', $name);
        $last = array_pop($parts);

        return [$parts ? implode(' ', $parts) : null, $last];
    }
}
