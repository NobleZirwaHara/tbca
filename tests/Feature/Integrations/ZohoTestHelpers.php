<?php

namespace Tests\Feature\Integrations;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/** Shared Zoho configuration for the integration tests (EU data centre, fictitious IDs). */
trait ZohoTestHelpers
{
    protected function enableZoho(array $overrides = []): void
    {
        config(array_merge([
            'zoho.enabled' => true,
            'zoho.dc' => 'eu',
            'zoho.oauth.client_id' => '1000.TESTCLIENT',
            'zoho.oauth.client_secret' => 'test-secret',
            'zoho.oauth.refresh_token' => '1000.test-refresh',
            'zoho.orgs.books.organization_id' => '900001',
            'zoho.orgs.desk.org_id' => '700001',
            'zoho.orgs.desk.department_id' => '7000001',
            'zoho.orgs.projects.portal_id' => '600001',
            'zoho.orgs.projects.template_id' => '6000001',
            'zoho.orgs.workdrive.parent_folder_id' => 'wd-parent',
            'zoho.orgs.creator.owner' => 'tbca',
            'zoho.webhook.secret' => 'zoho-webhook-test-secret',
            'zoho.sync.backoff' => [60, 300],
        ], $overrides));
        Cache::forget('zoho.access_token');
    }

    /** Fake responses for every Zoho endpoint the outbox uses. */
    protected function zohoFakes(array $extra = []): array
    {
        return $extra + [
            'accounts.zoho.eu/oauth/v2/token' => ['access_token' => 'tok-1', 'expires_in' => 3600, 'api_domain' => 'https://www.zohoapis.eu'],
            'www.zohoapis.eu/crm/v8/Accounts/upsert' => ['data' => [['status' => 'success', 'action' => 'insert', 'details' => ['id' => 'crm-acc-1']]]],
            'www.zohoapis.eu/crm/v8/Contacts/upsert' => ['data' => [['status' => 'success', 'action' => 'insert', 'details' => ['id' => 'crm-con-1']]]],
            'www.zohoapis.eu/crm/v8/Deals/upsert' => ['data' => [['status' => 'success', 'action' => 'insert', 'details' => ['id' => 'crm-deal-1']]]],
            'www.zohoapis.eu/crm/v8/Leads/upsert' => ['data' => [['status' => 'success', 'action' => 'insert', 'details' => ['id' => 'crm-lead-1']]]],
            'www.zohoapis.eu/books/v3/contacts*' => fn ($r) => $r->method() === 'GET' ? ['contacts' => []] : ['contact' => ['contact_id' => 'bk-cust-1']],
            'www.zohoapis.eu/books/v3/invoices*' => fn ($r) => $r->method() === 'GET' ? ['invoices' => []] : ['invoice' => ['invoice_id' => 'bk-inv-1', 'invoice_number' => 'INV-000001']],
            'www.zohoapis.eu/books/v3/customerpayments*' => ['payment' => ['payment_id' => 'bk-pay-1']],
            'projectsapi.zoho.eu/*' => ['projects' => [['id_string' => 'prj-1']]],
            'www.zohoapis.eu/workdrive/*' => ['data' => ['id' => 'wd-folder-1']],
            'www.zohoapis.eu/creator/*' => fn ($r) => $r->method() === 'GET' ? Http::response(['code' => 9280], 404) : ['code' => 3000, 'data' => ['ID' => 'cr-1']],
            'desk.zoho.eu/api/v1/tickets*' => ['id' => 'desk-1', 'ticketNumber' => '101'],
        ];
    }

    protected function signedZoho(array $body, ?int $timestamp = null, ?string $secret = null): array
    {
        $raw = json_encode($body);
        $ts = (string) ($timestamp ?? time());

        return [$raw, [
            'X-TBCA-Timestamp' => $ts,
            'X-TBCA-Signature' => 'sha256='.hash_hmac('sha256', $ts.'.'.$raw, $secret ?? config('zoho.webhook.secret')),
            'Content-Type' => 'application/json',
        ]];
    }
}
