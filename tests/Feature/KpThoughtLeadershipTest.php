<?php

namespace Tests\Feature;

use App\Support\Content\KpThoughtLeadership;
use App\Support\Content\Navigation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KpThoughtLeadershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_kp_page_renders(): void
    {
        $pages = [
            '/kp-thought-leadership' => 'Kp/Home',
            '/kp-thought-leadership/articles' => 'Kp/Library',
            '/kp-thought-leadership/articles/future-of-african-enterprises' => 'Kp/Article',
            '/kp-thought-leadership/themes/leadership-governance' => 'Kp/Library',
            '/kp-thought-leadership/series' => 'Kp/Series',
            '/kp-thought-leadership/series/capital-for-african-growth' => 'Kp/Series',
            '/kp-thought-leadership/about-kruger-phiri' => 'Kp/Profile',
            '/kp-thought-leadership/speaking' => 'Kp/Speaking',
            '/kp-thought-leadership/events' => 'Kp/Events',
            '/kp-thought-leadership/podcasts' => 'Kp/Library',
            '/kp-thought-leadership/downloads' => 'Kp/Library',
            '/kp-thought-leadership/newsletter' => 'Kp/Connect',
            '/kp-thought-leadership/book' => 'Kp/Connect',
        ];

        foreach ($pages as $url => $component) {
            $this->assertFileExists(resource_path("js/Pages/{$component}.tsx"));
            $this->get($url)->assertOk()->assertInertia(fn (Assert $p) => $p->component($component, false));
        }

        $this->get('/kp-thought-leadership/articles/not-a-real-article')->assertNotFound();
        $this->get('/kp-thought-leadership/themes/not-a-theme')->assertNotFound();
    }

    public function test_library_filters_by_keyword_and_theme(): void
    {
        $this->get('/kp-thought-leadership/articles?theme=sustainability-esg')->assertInertia(fn (Assert $p) => $p
            ->where('pagination.total', 3)
            ->where('items.0.theme', 'sustainability-esg'));

        $this->get('/kp-thought-leadership/articles?q=bankable')->assertInertia(fn (Assert $p) => $p
            ->where('pagination.total', 1)
            ->where('items.0.slug', 'infrastructure-bankability'));
    }

    public function test_placeholders_are_marked_pending_and_carry_no_body(): void
    {
        foreach (KpThoughtLeadership::items() as $item) {
            $this->assertSame('pending', $item['status']);
            $this->assertSame([], $item['body']);
        }

        $this->get('/kp-thought-leadership/articles/pending-sustainability-esg-1')->assertInertia(fn (Assert $p) => $p->where('item.status', 'pending'));
    }

    public function test_webinars_and_kp_tabs_have_dropdown_menus(): void
    {
        $children = Navigation::children();
        $this->assertNotEmpty($children['/webinars'] ?? []);
        $this->assertNotEmpty($children['/kp-thought-leadership'] ?? []);
    }
}
