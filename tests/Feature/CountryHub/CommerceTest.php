<?php

namespace Tests\Feature\CountryHub;

use App\Models\Sprint;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Commercial journey P27 to P34 (prototype pages-commerce.js), walked as a guest. */
class CommerceTest extends TestCase
{
    use RefreshDatabase;

    private const BW = '/countries/botswana';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        foreach ([['TBCA-X-1690', 'Market Entry Retainer Sprint', 10600], ['TBCA-G-0002', 'Export Readiness Score Sprint', 1220]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cty-commerce-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    private function quote(array $over = []): array
    {
        return $over + [
            'fname' => 'Neo Molefe', 'email' => 'neo@example.com', 'org' => 'Kalahari AgriVentures (Pty) Ltd', 'coo' => 'Botswana', 'contact' => 'Email',
            'cat' => 'market-entry', 'sprint' => 'TBCA-G-0002', 'tier' => 'Standard', 'type' => 'Engagement', 'title' => '', 'sector' => 'AGR', 'region' => 'Central',
            'start' => '2026-11-09', 'budget' => 'Under R25,000', 'scope' => 'Horticulture entry', 'accurate' => true, 'privacy' => true, 'noEngagement' => true,
        ];
    }

    public function test_every_commerce_page_renders_for_three_countries(): void
    {
        foreach (['botswana', 'south-africa', 'kenya'] as $c) {
            $this->get("/countries/{$c}/quote")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Quote')->where('cat', 'market-entry')->where('j', null)->has('topics', 9));
            $this->get("/countries/{$c}/waitlist")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Waitlist')->has('unmet', 9)->where('mine', []));
            foreach (['letter', 'pay', 'workspace', 'deliverables', 'change', 'closure'] as $key) {
                $this->get("/countries/{$c}/{$key}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/NeedJourney')->where('pageKey', $key));
            }
        }
        $this->get(self::BW.'/waitlist')->assertInertia(fn (Assert $p) => $p->has('byUnit', 10));
        $this->get('/countries/kenya/waitlist')->assertInertia(fn (Assert $p) => $p->where('byUnit', null));
    }

    public function test_quote_preselects_the_sprint_and_reads_opportunity_and_premium(): void
    {
        $this->get(self::BW.'/quote?sprint=TBCA-G-0002&tier=Premium')->assertInertia(fn (Assert $p) => $p->where('pre', 'TBCA-G-0002')->where('tier', 'Premium')
            ->where('options.0.code', fn ($v) => in_array($v, ['TBCA-X-1690', 'TBCA-G-0002'], true))->has('units', 16)->where('vat', 14));
        $this->get(self::BW.'/quote?opp=BW-ENR-S01&premium=BW-PB-01')->assertInertia(fn (Assert $p) => $p->where('opp.id', 'BW-ENR-S01')->where('opp.sector', 'ENR')->where('premium.code', 'BW-PB-01'));
        $this->get(self::BW.'/quote?cat=tax')->assertInertia(fn (Assert $p) => $p->where('cat', 'tax')->where('pre', null));
        $this->get('/countries/kenya/waitlist?sprint=TBCA-G-0002')->assertInertia(fn (Assert $p) => $p->where('sprint', 'TBCA-G-0002')->where('services.0', 'Export Readiness Score Sprint — Growth, Go To Market, Market Entry and Business Development'));
    }

    public function test_quote_validation(): void
    {
        $this->post(self::BW.'/quote', $this->quote(['email' => 'nope', 'privacy' => false]))->assertSessionHasErrors(['email', 'privacy']);
        $this->post(self::BW.'/quote', $this->quote(['cat' => 'localisation', 'sprint' => '']))->assertRedirect(self::BW.'/quote?cat=localisation')->assertSessionHas('error');
    }

    public function test_full_guest_journey_from_quote_to_closure(): void
    {
        // P27 quote
        $this->post(self::BW.'/quote', $this->quote())->assertRedirect(self::BW.'/letter')->assertSessionHas('success');
        $j = session('ind_state.cty.journey');
        $this->assertSame('BWA', $j['iso']);
        $this->assertMatchesRegularExpression('/^QR-BWA-2026-\d{4}$/', $j['ref']);
        $this->assertSame(['TBCA-G-0002', 'Standard', 'Export Readiness Score Sprint — Growth, Go To Market, Market Entry and Business Development'], [$j['sprint'], $j['tier'], $j['title']]);
        $last4 = substr($j['ref'], -4);

        // Other countries still see the "start with a quote" panel.
        $this->get('/countries/kenya/letter')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/NeedJourney'));

        // P29 letter: Standard tier = 2,440 ex VAT, VAT 14 %.
        $this->get(self::BW.'/letter')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Letter')
            ->where('s.fee', 2440)->where('s.premium', 3660)->where('vat', 14)->where('j.ref', $j['ref'])->missing('j.letterOk'));
        $this->post(self::BW.'/pay', ['method' => 'Instant EFT', 'collect' => 1, 'terms' => 1, 'verification' => 1])->assertRedirect(self::BW.'/letter')->assertSessionHas('error', 'Approve the Engagement Letter first.');
        $this->post(self::BW.'/letter', ['boundary' => true])->assertRedirect(self::BW.'/letter')->assertSessionHas('error');
        $this->post(self::BW.'/letter', ['boundary' => true, 'fees' => true])->assertRedirect(self::BW.'/pay');
        $this->assertSame('EL-2026-'.$last4, session('ind_state.cty.journey')['elRef']);

        // P30 pay (simulated, no card fields)
        $this->get(self::BW.'/pay')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Pay')->where('j.letterOk', true)->has('methods', 4));
        $this->post(self::BW.'/deliverables')->assertRedirect(self::BW.'/pay');
        $this->post(self::BW.'/pay', ['method' => 'Instant EFT', 'collect' => 1, 'terms' => 1])->assertRedirect(self::BW.'/pay')->assertSessionHas('error', 'Please confirm all three authorisations.');
        $this->post(self::BW.'/pay', ['method' => 'Bitcoin', 'collect' => 1, 'terms' => 1, 'verification' => 1])->assertSessionHasErrors('method');
        $this->post(self::BW.'/pay', ['method' => 'Instant EFT', 'collect' => 1, 'terms' => 1, 'verification' => 1])->assertRedirect(self::BW.'/workspace')->assertSessionHas('success', 'Engagement ENG-2026-'.$last4.' activated');

        // P31 workspace
        $this->get(self::BW.'/workspace')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Workspace')->where('j.paid', true)->where('j.method', 'Instant EFT')
            ->has('plan', 6)->where('plan.0', ['Engagement activated', '09 Nov 2026', 'Completed'])->where('plan.1.2', 'Completed')->where('plan.5.1', '30 Nov 2026'));

        // P32 deliverables and acceptance
        $this->get(self::BW.'/deliverables')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Deliverables')->has('domains', 18)->has('premiumStore', 4));
        $this->post(self::BW.'/deliverables')->assertRedirect(self::BW.'/deliverables');
        $this->assertNotEmpty(session('ind_state.cty.journey')['accepted']);

        // P33 change requests
        $this->post(self::BW.'/change', ['type' => 'Scope Change', 'reason' => ''])->assertSessionHasErrors('reason');
        $this->post(self::BW.'/change', ['type' => 'Scope Change', 'reason' => 'Additional districts in scope'])->assertRedirect(self::BW.'/change');
        $this->post(self::BW.'/change', ['type' => 'Tier Upgrade', 'reason' => 'Premium tier'])->assertRedirect(self::BW.'/change');
        $this->get(self::BW.'/change')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Change')->has('j.crs', 2)
            ->where('j.crs.0.id', 'CR-2026-0028')->where('j.crs.1.id', 'CR-2026-0027')->where('j.crs.1.t', 'Scope Change'));

        // P34 closure, then a new journey
        $this->get(self::BW.'/closure')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Closure')->has('closures', 4)->where('j.engRef', 'ENG-2026-'.$last4));
        $this->post(self::BW.'/closure', ['action' => 'initiate', 'type' => 'Nope'])->assertSessionHasErrors('type');
        $this->post(self::BW.'/closure', ['action' => 'initiate', 'type' => 'Conditional Closure'])->assertRedirect(self::BW.'/closure');
        $this->assertSame('Conditional Closure', session('ind_state.cty.journey')['closure']['type']);
        $this->post(self::BW.'/closure', ['action' => 'reset'])->assertRedirect('/countries');
        $this->get(self::BW.'/workspace')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/NeedJourney')->where('j', null));
    }

    public function test_sample_engagement_and_waitlist(): void
    {
        $this->post('/countries/kenya/quote', ['sample' => true, 'next' => 'pay'])->assertRedirect('/countries/kenya/pay');
        $this->get('/countries/kenya/pay')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Commerce/Pay')->where('j.ref', 'QR-KEN-2026-0137')
            ->where('s.code', 'TBCA-X-1690')->where('s.fee', 10600)->where('vat', 16));
        $this->post('/countries/kenya/quote', ['sample' => true, 'next' => 'elsewhere'])->assertRedirect('/countries/kenya/letter');

        $this->post('/countries/kenya/waitlist', ['org' => '', 'svc' => 'X', 'lvl' => 'High'])->assertSessionHasErrors('org');
        $this->post('/countries/kenya/waitlist', ['org' => 'Acme', 'svc' => 'Export Readiness Score Sprint', 'lvl' => 'Medium', 'sprint' => 'TBCA-G-0002'])
            ->assertRedirect('/countries/kenya/waitlist?sprint=TBCA-G-0002');
        $this->get(self::BW.'/waitlist')->assertInertia(fn (Assert $p) => $p->has('mine', 1)->where('mine.0.country', 'Kenya')->where('mine.0.lvl', 'Medium'));
    }
}
