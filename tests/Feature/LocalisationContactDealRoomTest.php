<?php

namespace Tests\Feature;

use App\Models\DealRoom\Room;
use App\Models\User;
use App\Support\DealRoom\EnquiryOptions;
use App\Support\DealRoom\Rooms;
use App\Support\I18n\Dictionaries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Client review of 8 Oct 2026: languages and RTL, contact offices, deal room enquiry options. */
class LocalisationContactDealRoomTest extends TestCase
{
    use RefreshDatabase;

    /* ------------------------------------------------------------ Languages */

    public function test_every_language_has_a_complete_dictionary_with_matching_placeholders(): void
    {
        $keys = Dictionaries::keys();
        $this->assertGreaterThan(600, count($keys));

        foreach (Dictionaries::locales() as $locale) {
            $dictionary = Dictionaries::load($locale);
            $this->assertSame([], Dictionaries::missing($locale), "{$locale} has untranslated keys");

            foreach ($dictionary as $key => $text) {
                preg_match_all('/:[a-z]+/', $key, $expected);
                preg_match_all('/:[a-z]+/', $text, $actual);
                sort($expected[0]);
                sort($actual[0]);
                $this->assertSame($expected[0], $actual[0], "{$locale}: placeholders differ for \"{$key}\"");
                $this->assertStringNotContainsString('—', $text, "{$locale}: em dash in \"{$key}\"");
            }
        }
    }

    public function test_navigation_tabs_and_footer_are_translated(): void
    {
        $nav = app(\App\Support\Content\Navigation::class);
        // Tab labels, the contact menu and the footer. Other mega-menu entries fall back to English
        // until their keys are added (php artisan tbca:translations lists them).
        $labels = collect($nav::all())->pluck('label')
            ->merge(collect($nav::children()['/contact'])->pluck('label'))
            ->merge(collect($nav::footer())->keys())
            ->merge(collect($nav::footer())->flatten(1)->pluck('label'))
            ->unique();

        foreach (['fr', 'ar'] as $locale) {
            $dictionary = Dictionaries::load($locale);
            $untranslated = $labels->reject(fn ($label) => isset($dictionary[$label]))->values()->all();
            $this->assertSame([], $untranslated, "{$locale} is missing navigation labels");
        }
    }

    public function test_arabic_renders_right_to_left_with_the_arabic_font(): void
    {
        $this->post('/context', ['language' => 'ar'])->assertRedirect();

        $html = $this->get('/')->assertOk()->getContent();
        $this->assertStringContainsString('<html lang="ar" dir="rtl"', $html);
        $this->assertStringContainsString('Noto+Sans+Arabic', $html);
    }

    public function test_english_renders_left_to_right_without_the_arabic_font(): void
    {
        $html = $this->get('/')->assertOk()->getContent();
        $this->assertStringContainsString('<html lang="en" dir="ltr"', $html);
        $this->assertStringNotContainsString('Noto+Sans+Arabic', $html);
    }

    public function test_language_choice_persists_and_sets_the_server_locale(): void
    {
        $this->post('/context', ['language' => 'fr'])->assertRedirect();

        $this->get('/contact')->assertInertia(fn (Assert $page) => $page->where('context.language', 'fr'));
        $this->assertSame('fr', app()->getLocale());
        $this->assertSame('Veuillez choisir un type d\'opération dans la liste.', __('Please choose a transaction type from the list.'));
    }

    public function test_unknown_language_is_rejected(): void
    {
        $this->post('/context', ['language' => 'xx'])->assertSessionHasErrors('language');
    }

    /* -------------------------------------------------------------- Contact */

    public function test_contact_shows_head_office_then_two_country_offices(): void
    {
        $this->get('/contact')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('CorePages/Contact', false)
            ->where('headOffice.kind', 'head')
            ->has('featuredOffices', 2)
            ->where('featuredOffices.0.slug', 'botswana')
            ->where('featuredOffices.1.slug', 'mauritius')
            ->has('offices', 12));
    }

    public function test_offices_page_lists_every_office_by_region(): void
    {
        $this->get('/contact/offices')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('CorePages/Offices', false)
            ->where('headOffice.city', 'Pretoria')
            ->has('offices', 12)
            ->has('regions', 4)
            ->where('regions.0.region', 'North Africa'));
    }

    /* ---------------------------------------------------- Deal room enquiry */

    public function test_enquiry_offers_grouped_transaction_types_and_zar_raise_bands(): void
    {
        $this->get('/virtual-deal-room/enquiry')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('DealRoom/Enquiry', false)
            ->has('transactionTypes', 5)
            ->where('transactionTypes.0.group', 'Mergers & Acquisitions (M&A)')
            ->where('transactionTypes.0.options.0', 'Sell-Side M&A')
            ->has('raiseBands', 6)
            ->where('raiseBands.0.code', 'RAISE_UNDER_1M')
            ->where('raiseBands.0.max', 1_000_000)
            ->where('raiseBands.5.max', null));
    }

    public function test_enquiry_stores_the_band_code_and_a_working_zar_amount(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/virtual-deal-room/enquiry', $this->enquiry([
            'transaction_type' => 'Infrastructure Concessions & Project Finance',
            'raise_band' => 'RAISE_100M_500M',
        ]))->assertRedirect();

        $room = Room::latest('id')->firstOrFail();
        $this->assertSame('Infrastructure Concessions & Project Finance', $room->transaction_type);
        $this->assertSame('procurement', $room->deal_type);
        $this->assertSame(300_000_000, (int) $room->amount_zar);
        $this->assertSame('RAISE_100M_500M', $room->enquiry['raise_band']);
        $this->assertSame('Real Estate & Infrastructure', $room->enquiry['transaction_group']);

        $header = Rooms::header($room, $user);
        $this->assertSame('RAISE_100M_500M', $header['raiseBand']['code']);
        $this->assertSame('Real Estate & Infrastructure', $header['transactionGroup']);
    }

    public function test_enquiry_rejects_unknown_types_and_bands(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/virtual-deal-room/enquiry', $this->enquiry([
            'transaction_type' => 'Fundraising / Capital Raise',
            'raise_band' => 'R150000000',
        ]))->assertSessionHasErrors(['transaction_type', 'raise_band']);

        $this->assertSame(0, Room::count());
    }

    public function test_rooms_created_before_bands_still_show_their_type_and_band(): void
    {
        $user = User::factory()->create();
        $room = Rooms::create($user, [
            'name' => 'Legacy Raise', 'company' => 'Legacy Co', 'transaction_type' => 'Fundraising / Capital Raise', 'amount_zar' => 150_000_000,
        ]);

        $header = Rooms::header($room->fresh(), $user);
        $this->assertSame('Fundraising / Capital Raise', $header['transactionType']);
        $this->assertSame('Capital Raising & Financing', $header['transactionGroup']);
        $this->assertSame('RAISE_100M_500M', $header['raiseBand']['code']);
        $this->assertSame('R100m to R500m', EnquiryOptions::zarLabel('RAISE_100M_500M'));
        $this->assertSame('Under R1m', EnquiryOptions::zarLabel('RAISE_UNDER_1M'));
        $this->assertSame('Over R500m', EnquiryOptions::zarLabel('RAISE_OVER_500M'));
    }

    private function enquiry(array $overrides = []): array
    {
        return [
            'transaction_type' => 'Sell-Side M&A',
            'objective' => 'Sell a majority stake in a regional logistics business to a strategic buyer.',
            'raise_band' => 'RAISE_50M_100M',
            'current_stage' => 'Preparation',
            'company' => 'Kalahari Freight',
            'jurisdiction' => 'Botswana',
            'sector' => 'Logistics',
            'name' => 'Test Founder',
            'email' => 'founder@example.com',
            'role' => 'Founder / CEO',
            'authority' => true,
            ...$overrides,
        ];
    }
}
