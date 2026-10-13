<?php

namespace Tests\Feature\Integrations;

use App\Support\Integrations\Zoho\Zoho;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ZohoClientTest extends TestCase
{
    use ZohoTestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->enableZoho();
    }

    public function test_integration_is_off_until_switched_on_with_credentials(): void
    {
        $this->assertTrue(ZohoConfig::enabled());

        config(['zoho.oauth.refresh_token' => null]);
        $this->assertFalse(ZohoConfig::enabled());

        config(['zoho.oauth.refresh_token' => 'x', 'zoho.enabled' => false]);
        $this->assertFalse(ZohoConfig::enabled());
    }

    public function test_data_centre_selects_hosts_and_overrides_win(): void
    {
        $this->assertSame('https://accounts.zoho.eu', ZohoConfig::host('accounts'));
        config(['zoho.dc' => 'us']);
        $this->assertSame('https://www.zohoapis.com', ZohoConfig::host('api'));
        config(['zoho.hosts.api' => 'https://example.test/']);
        $this->assertSame('https://example.test', ZohoConfig::host('api'));
    }

    public function test_refresh_token_flow_caches_the_access_token(): void
    {
        Http::fake($this->zohoFakes());

        Zoho::crm()->upsertAccount('TBCA-B-000001', ['Account_Name' => 'Demo A']);
        Zoho::crm()->upsertContact('TBCA-P-000001', ['Last_Name' => 'Demo']);

        Http::assertSentCount(3);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'accounts.zoho.eu/oauth/v2/token')
            && $r['grant_type'] === 'refresh_token' && $r['refresh_token'] === '1000.test-refresh');
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/crm/v8/Accounts/upsert')
            && $r->hasHeader('Authorization', 'Zoho-oauthtoken tok-1')
            && $r['duplicate_check_fields'] === ['TBCA_Business_ID']
            && $r['data'][0]['TBCA_Business_ID'] === 'TBCA-B-000001');
    }

    public function test_expired_token_is_refreshed_once_on_401(): void
    {
        $calls = 0;
        Http::fake([
            'accounts.zoho.eu/*' => Http::sequence()->push(['access_token' => 'old', 'expires_in' => 3600])->push(['access_token' => 'new', 'expires_in' => 3600]),
            'www.zohoapis.eu/crm/*' => function (Request $r) use (&$calls) {
                $calls++;

                return $r->hasHeader('Authorization', 'Zoho-oauthtoken new')
                    ? Http::response(['data' => [['status' => 'success', 'details' => ['id' => '5']]]])
                    : Http::response(['code' => 'INVALID_TOKEN'], 401);
            },
        ]);

        $this->assertSame('5', Zoho::crm()->upsertLead(['Email' => 'a@example.test', 'Last_Name' => 'A'])['id']);
        $this->assertSame(2, $calls);
    }

    public function test_rate_limits_are_retryable_and_validation_errors_are_not(): void
    {
        Http::fake([
            'accounts.zoho.eu/*' => ['access_token' => 'tok', 'expires_in' => 3600],
            'www.zohoapis.eu/crm/v8/Leads/upsert' => Http::response(['code' => 'TOO_MANY_REQUESTS'], 429),
            'www.zohoapis.eu/crm/v8/Deals/upsert' => ['data' => [['status' => 'error', 'code' => 'MANDATORY_NOT_FOUND', 'message' => 'required field not found']]],
        ]);

        try {
            Zoho::crm()->upsertLead(['Email' => 'a@example.test']);
            $this->fail('Expected exception');
        } catch (ZohoException $e) {
            $this->assertTrue($e->retryable);
            $this->assertSame(429, $e->status);
        }

        try {
            Zoho::crm()->upsertDeal('TBCA-ORD-1', ['Deal_Name' => 'x']);
            $this->fail('Expected exception');
        } catch (ZohoException $e) {
            $this->assertFalse($e->retryable);
        }
    }

    public function test_app_wrappers_call_the_documented_endpoints(): void
    {
        Http::fake($this->zohoFakes([
            'www.zohoapis.eu/books/v3/bankstatements*' => ['message' => 'imported', 'statement_id' => 'st-1'],
            'flow.zoho.eu/*' => ['status' => 'ok'],
        ]));

        $this->assertSame('bk-inv-1', Zoho::books()->createInvoice(['customer_id' => 'c', 'line_items' => []])['invoice_id']);
        $this->assertSame('desk-1', Zoho::desk()->createTicket(['subject' => 'Help'])['id']);
        $this->assertSame('prj-1', Zoho::projects()->createFromTemplate('TBCA-ORD-1 Sprint', 'desc'));
        $this->assertSame('wd-folder-1', Zoho::workdrive()->createFolder('TBCA-ORD-1'));
        $this->assertSame('cr-1', Zoho::creator()->addRecord('DD_Cases', ['TBCA_Reference' => 'DD-1']));
        $this->assertNull(Zoho::creator()->findRecord('All_DD_Cases', '(TBCA_Reference == "DD-1")'));
        $this->assertSame('st-1', Zoho::books()->importBankStatement('2026-10-01', '2026-10-31', [['transaction_id' => 't1', 'date' => '2026-10-02', 'debit_or_credit' => 'credit', 'amount' => 100]], 'bank-1'));
        Zoho::flow()->trigger('https://flow.zoho.eu/1/flow/webhook/incoming?zapikey=x', ['event_id' => 'e1']);

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/books/v3/invoices') && str_contains($r->url(), 'organization_id=900001'));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'desk.zoho.eu/api/v1/tickets') && $r->hasHeader('orgId', '700001') && $r['departmentId'] === '7000001');
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'projectsapi.zoho.eu/restapi/portal/600001/projects/') && $r['template_id'] === '6000001');
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/workdrive/api/v1/files') && $r['data']['attributes']['parent_id'] === 'wd-parent');
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/creator/v2.1/data/tbca/tbca-operations/form/DD_Cases'));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/books/v3/bankstatements') && $r['account_id'] === 'bank-1' && count($r['transactions']) === 1);
        Http::assertSent(fn (Request $r) => str_starts_with($r->url(), 'https://flow.zoho.eu/') && ! $r->hasHeader('Authorization'));
    }

    public function test_bank_statement_import_needs_a_books_bank_account(): void
    {
        Http::fake($this->zohoFakes());
        $this->expectException(ZohoException::class);
        Zoho::books()->importBankStatement('2026-10-01', '2026-10-31', []);
    }
}
