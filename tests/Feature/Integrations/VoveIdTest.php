<?php

namespace Tests\Feature\Integrations;

use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\IdentityVerification;
use App\Models\IntegrationEvent;
use App\Models\User;
use App\Support\DueDiligence\Identity\IdentityVerifications;
use App\Support\DueDiligence\Identity\VoveIdProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class VoveIdTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'whsec_'.'dGVzdC12b3ZlLXdlYmhvb2stc2VjcmV0';

    private function useVove(): void
    {
        config([
            'services.identity_verification.driver' => 'vove',
            'services.vove.base_url' => 'https://api.voveid.net',
            'services.vove.hosted_url' => 'https://web.voveid.net',
            'services.vove.environment' => 'Sandbox',
            'services.vove.api_key' => 'vove_sandbox_test',
            'services.vove.public_key' => 'public_sandbox_test',
            'services.vove.webhook_secret' => self::SECRET,
            'services.vove.flows.aml_individual' => 'aml-flow-1',
            'services.vove.flows.kyc' => 'kyc-flow-1',
        ]);
    }

    private function individualCase(string $name = 'Amina Example'): CaseFile
    {
        $user = User::factory()->create();
        $case = CaseFile::create([
            'reference' => 'DD-SA-2026-00901', 'user_id' => $user->id, 'family' => 'individual', 'sku_code' => 'DD-IND-QC',
            'package_name' => 'Individual Quick Check', 'case_name' => 'Pilot case', 'subject_name' => $name, 'subject_type' => 'individual',
            'status' => 'checks_running', 'subject' => ['registered_name' => $name, 'id_number' => 'X00000000', 'date_of_birth' => '1990-02-01'],
        ]);
        foreach ([['Identity Verification', 6], ['Sanctions, PEP & Watchlists', 12], ['Employment & Education', 6]] as $i => [$category, $total]) {
            $case->checks()->create(['category' => $category, 'vendor' => 'Approved provider', 'status' => 'pending', 'total' => $total, 'sort' => $i]);
        }

        return $case;
    }

    private function webhook(array $payload, string $id = 'msg_test_1', ?string $secret = null, ?int $ts = null): TestResponse
    {
        $raw = json_encode($payload);
        $ts = (string) ($ts ?? time());
        $key = base64_decode(substr($secret ?? self::SECRET, 6));
        $sig = 'v1,'.base64_encode(hash_hmac('sha256', "{$id}.{$ts}.{$raw}", $key, true));

        return $this->call('POST', '/integrations/vove/webhook', [], [], [], $this->transformHeadersToServerVars([
            'svix-id' => $id, 'svix-timestamp' => $ts, 'svix-signature' => $sig, 'Content-Type' => 'application/json',
        ]), $raw);
    }

    public function test_the_simulated_provider_is_the_default_and_completes_checks_without_network(): void
    {
        Http::fake();
        $case = $this->individualCase();
        $identity = app(IdentityVerifications::class);
        $this->assertSame('simulated', $identity->provider()->key());

        $this->assertSame(2, $identity->startForCase($case), 'Only checks the provider can serve are started.');

        $aml = IdentityVerification::where('kind', 'aml_individual')->sole();
        $this->assertSame('passed', $aml->status);
        $this->assertSame('complete', $aml->check->status);

        $kyc = IdentityVerification::where('kind', 'kyc')->sole();
        $this->assertSame('awaiting_subject', $kyc->status);
        Http::assertNothingSent();
    }

    public function test_a_possible_sanctions_match_holds_the_check_for_an_analyst(): void
    {
        $case = $this->individualCase('Sanctioned Person Demo');
        $check = $case->checks()->where('category', 'Sanctions, PEP & Watchlists')->sole();

        ['verification' => $v] = app(IdentityVerifications::class)->startForCheck($check);

        $this->assertSame('review', $v->status);
        $this->assertSame('on_hold', $check->fresh()->status);
        $this->assertTrue($case->fresh()->review_mandatory);
        $result = IntegrationEvent::where('type', 'dd.verification_result')->sole();
        $this->assertSame('human', $result->handled_by);
        $this->assertSame('A4', $result->process);
    }

    public function test_vove_aml_screening_uses_the_documented_contract(): void
    {
        $this->useVove();
        Http::fake(['api.voveid.net/aml/case' => ['id' => 'aml-1', 'status' => 'NO_MATCH', 'refId' => 'x']]);
        $case = $this->individualCase();
        $check = $case->checks()->where('category', 'Sanctions, PEP & Watchlists')->sole();

        ['verification' => $v, 'link' => $link] = app(IdentityVerifications::class)->startForCheck($check);

        $this->assertNull($link);
        $this->assertSame('passed', $v->status);
        $this->assertSame('aml-1', $v->provider_case_id);
        $this->assertSame('TBCA-AML-INDIVIDUAL-DD-SA-2026-00901-'.$check->id, $v->ref_id);
        Http::assertSent(fn (Request $r) => $r->url() === 'https://api.voveid.net/aml/case'
            && $r->hasHeader('x-api-key', 'vove_sandbox_test')
            && $r['flowId'] === 'aml-flow-1'
            && $r['screeningData'] === ['name' => 'Amina Example', 'dob' => '01.02.1990']
            && $r['refId'] === $v->ref_id);
    }

    public function test_the_subject_link_mints_a_fresh_kyc_session_and_redirects_to_the_hosted_journey(): void
    {
        $this->useVove();
        Http::fake(['api.voveid.net/v2/sessions' => ['success' => true, 'token' => 'sess-token-1']]);
        $case = $this->individualCase();
        $check = $case->checks()->where('category', 'Identity Verification')->sole();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post("/admin/integrations/identity/checks/{$check->id}")
            ->assertSessionHas('success', fn ($m) => str_contains($m, '/due-diligence/verify/'));

        $v = IdentityVerification::sole();
        $this->assertSame('awaiting_subject', $v->status);
        Http::assertSent(fn (Request $r) => $r->url() === 'https://api.voveid.net/v2/sessions' && $r['refId'] === $v->ref_id
            && $r['flowId'] === 'kyc-flow-1' && $r['user']['lastName'] === 'Example' && $r['user']['dateOfBirth'] === '01.02.1990');

        preg_match('#/due-diligence/verify/([A-Za-z0-9]{48})#', session('success'), $m);
        $response = $this->get('/due-diligence/verify/'.$m[1]);
        $location = $response->headers->get('Location');
        $this->assertStringStartsWith('https://web.voveid.net/?', $location);
        parse_str(parse_url($location, PHP_URL_QUERY), $q);
        $this->assertSame('sess-token-1', $q['authToken']);
        $this->assertSame('public_sandbox_test', $q['publicKey']);
        $this->assertSame('Sandbox', $q['environment']);
        $this->assertStringEndsWith('/done', $q['redirectURL']);

        $this->get('/due-diligence/verify/'.str_repeat('a', 48))->assertRedirect('/due-diligence');
    }

    public function test_a_signed_webhook_is_confirmed_with_the_api_before_the_check_completes(): void
    {
        $this->useVove();
        Http::fake([
            'api.voveid.net/v2/sessions' => ['success' => true, 'token' => 't'],
            'api.voveid.net/v2/users/*' => ['refId' => 'x', 'status' => 'successful', 'documents' => [[
                'stepId' => 'ID_DOCUMENT', 'type' => 'Passport', 'firstName' => 'AMINA', 'idNumber' => 'X00000000', 'matchLevel' => 7, 'mrzStatus' => 'SUCCESS',
            ]]],
        ]);
        $case = $this->individualCase();
        $check = $case->checks()->where('category', 'Identity Verification')->sole();
        ['verification' => $v] = app(IdentityVerifications::class)->startForCheck($check);

        $this->webhook(['refId' => $v->ref_id, 'status' => 'successful'])->assertNoContent();

        $v->refresh();
        $this->assertSame('passed', $v->status);
        $this->assertSame('complete', $check->fresh()->status);
        $this->assertSame(6, $check->fresh()->done);
        $this->assertSame('Passport', $v->summary['documents'][0]['type']);
        $this->assertArrayNotHasKey('idNumber', $v->summary['documents'][0]);
        $this->assertStringNotContainsString('AMINA', json_encode($v->summary));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/v2/users/'.rawurlencode($v->ref_id)));

        // The same delivery again does nothing; a late in-progress event does not move the result back.
        $this->webhook(['refId' => $v->ref_id, 'status' => 'successful'])->assertNoContent();
        $this->webhook(['refId' => $v->ref_id, 'status' => 'in_progress'], 'msg_test_2')->assertNoContent();
        $this->assertSame('passed', $v->fresh()->status);
        $this->assertSame(2, IntegrationEvent::where('source', 'vove')->count());
        $this->assertSame(1, IntegrationEvent::where('type', 'dd.verification_result')->count());
    }

    public function test_invalid_or_stale_webhook_signatures_are_rejected(): void
    {
        $this->useVove();

        $this->webhook(['refId' => 'x', 'status' => 'successful'], secret: 'whsec_'.base64_encode('another-secret'))->assertStatus(400);
        $this->webhook(['refId' => 'x', 'status' => 'successful'], ts: time() - 3600)->assertStatus(400);
        $this->call('POST', '/integrations/vove/webhook', [], [], [], [], '{"refId":"x"}')->assertStatus(400);
        $this->assertSame(0, IntegrationEvent::count());

        $this->assertTrue(VoveIdProvider::verifySignature('whsec_'.base64_encode('k'), 'id1', (string) time(),
            'v1,bad v1,'.base64_encode(hash_hmac('sha256', 'id1.'.time().'.{}', 'k', true)), '{}'));
    }

    public function test_unknown_provider_statuses_never_count_as_success(): void
    {
        $this->assertSame('review', IdentityVerifications::localStatus('kyc', 'suspected'));
        $this->assertSame('review', IdentityVerifications::localStatus('kyb', 'IN_REVIEW'));
        $this->assertSame('review', IdentityVerifications::localStatus('kyc', 'something_new'));
        $this->assertSame('failed', IdentityVerifications::localStatus('kyb', 'REJECTED'));
        $this->assertSame('passed', IdentityVerifications::localStatus('aml_entity', 'CLEARED'));
    }

    public function test_checks_start_automatically_when_a_case_enters_checks_running_if_enabled(): void
    {
        config(['services.identity_verification.auto_start' => true]);
        $case = $this->individualCase();
        $case->update(['status' => 'ready_for_checks']);
        $this->assertSame(0, IdentityVerification::count());

        $case->update(['status' => 'checks_running']);

        $this->assertSame(2, IdentityVerification::count());
    }
}
