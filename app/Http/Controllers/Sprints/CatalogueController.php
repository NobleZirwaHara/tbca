<?php

namespace App\Http\Controllers\Sprints;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Support\Sprints\Catalogue;
use App\Support\Sprints\Taxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sprint catalogue: Browse All, curated views, categories, buyer routes and A to Z.
 */
class CatalogueController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->curated($request, 'all');
    }

    public function view(Request $request, string $view): Response
    {
        return $this->curated($request, $view);
    }

    public function category(Request $request, string $category): Response|RedirectResponse
    {
        if ($canonical = Taxonomy::categoryAliases()[$category] ?? null) {
            return redirect("/sprints/category/{$canonical}", 301);
        }

        $config = Taxonomy::categories()[$category] ?? abort(404);
        $filters = Catalogue::normalise($request->query());
        $filters['sort'] ??= 'recommended';
        $path = "/sprints/category/{$category}";

        $data = (new Catalogue($request->user()))->search($filters, fn (Sprint $s) => $s->category === $category, $path);

        return Inertia::render('Sprints/Catalogue', [
            ...$data,
            'filters' => $filters,
            'sorts' => Taxonomy::sorts(),
            'view' => [
                'key' => "category:{$category}",
                'kind' => 'category',
                'category' => $category,
                'icon' => $config['icon'],
                'title' => $config['label'],
                'description' => $config['description'],
                'search' => $config['search'],
                'badges' => $config['badges'] ?? Taxonomy::BADGES,
                'quick' => collect($config['quick'])->map(fn ($q) => ['label' => $q, 'href' => $path.'?q='.urlencode($q)])->all(),
                'crumbs' => [['label' => 'Home', 'href' => '/'], ['label' => 'Sprints', 'href' => '/sprints'], ['label' => 'Browse by Category', 'href' => '/sprints'], ['label' => $config['label']]],
                'spotlight' => ['label' => 'Featured', 'why' => 'Why choose this Sprint'],
                'path' => $path,
                'lockedFilters' => ['category'],
            ],
            'categories' => $this->categoryStrip(),
        ]);
    }

    public function audience(Request $request, string $audience): Response
    {
        $config = Taxonomy::audiences()[$audience] ?? abort(404);
        $filters = Catalogue::normalise($request->query());
        $filters['sort'] ??= 'recommended';
        $path = "/sprints/for/{$audience}";

        $data = (new Catalogue($request->user()))->search(
            $filters,
            fn (Sprint $s) => in_array($audience, Catalogue::audiences($s), true),
            $path,
        );

        return Inertia::render('Sprints/Audience', [
            ...$data,
            'filters' => $filters,
            'sorts' => Taxonomy::sorts(),
            'audienceKey' => $audience,
            'audience' => collect($config)->except([])->all(),
            'audiences' => collect(Taxonomy::audiences())->map(fn ($a, $k) => ['key' => $k, 'label' => $a['label'], 'icon' => $a['icon']])->values(),
            'catalogueTotal' => (new Catalogue)->all()->count(),
        ]);
    }

    public function az(Request $request): Response
    {
        $filters = Catalogue::normalise($request->query());
        $filters['sort'] = 'az';
        $catalogue = new Catalogue($request->user());

        $data = $catalogue->search($filters, null, '/sprints/a-z', paginate: false);

        $letters = $catalogue->all()->groupBy(fn (Sprint $s) => strtoupper(substr($s->title, 0, 1)))->map->count();

        // Without a letter or search, show a preview of each letter (the full list is one click away).
        $items = collect($data['results']->items());
        $matched = $items->groupBy(fn ($i) => strtoupper(substr($i['title'], 0, 1)))->map->count();
        if (! $filters['letter'] && ! $filters['q']) {
            $items = $items->groupBy(fn ($i) => strtoupper(substr($i['title'], 0, 1)))->flatMap(fn ($g) => $g->take(6))->values();
        }

        return Inertia::render('Sprints/AToZ', [
            'results' => $items,
            'matched' => $matched,
            'facets' => $data['facets'],
            'total' => $data['total'],
            'filters' => $filters,
            'letters' => collect(range('A', 'Z'))->mapWithKeys(fn ($l) => [$l => $letters[$l] ?? 0]),
        ]);
    }

    public function alias(string $alias): RedirectResponse
    {
        return redirect(Taxonomy::aliases()[$alias] ?? '/sprints', 301);
    }

    private function curated(Request $request, string $key): Response
    {
        $config = Taxonomy::views()[$key] ?? abort(404);
        $filters = Catalogue::normalise($request->query());
        $filters['sort'] ??= $config['sort'];
        $path = $key === 'all' ? '/sprints' : "/sprints/{$key}";

        $scope = match ($key) {
            'featured' => fn (Sprint $s) => $s->featured,
            'new' => fn (Sprint $s) => $s->is_new,
            'popular' => fn (Sprint $s) => $s->popular,
            'recommended' => fn (Sprint $s) => (float) $s->rating >= 4.5,
            'marketplace' => fn (Sprint $s) => ! empty($s->attributes['marketplace']),
            default => null,
        };

        $data = (new Catalogue($request->user()))->search($filters, $scope, $path);

        $quick = $key === 'all' || $key === 'new'
            ? ['Business Plan', 'Pitch Deck', 'Funding Readiness', 'Financial Model', 'Due Diligence', 'Business Health Score']
            : ['Capital Raising', 'Business Planning', 'Due Diligence', 'Strategy', 'Finance', 'AI Readiness'];

        return Inertia::render('Sprints/Catalogue', [
            ...$data,
            'filters' => $filters,
            'sorts' => Taxonomy::sorts(),
            'view' => [
                'key' => $key,
                'kind' => $key === 'all' ? 'all' : 'curated',
                'category' => null,
                'icon' => null,
                'title' => $config['title'],
                'description' => $config['description'],
                'search' => $config['search'],
                'badges' => $config['badges'] ?? Taxonomy::BADGES,
                'quick' => collect($quick)->map(fn ($q) => ['label' => $q, 'href' => $path.'?q='.urlencode($q)])->all(),
                'quickLabel' => $key === 'all' || $key === 'new' ? 'Popular searches:' : 'Quick links:',
                'crumbs' => [['label' => 'Home', 'href' => '/'], ['label' => 'Sprints', 'href' => '/sprints'], ['label' => $config['title']]],
                'spotlight' => $config['spotlight'],
                'path' => $path,
                'lockedFilters' => [],
                'personalised' => $key === 'recommended' && $request->user() !== null,
            ],
            'categories' => $this->categoryStrip(),
        ]);
    }

    private function categoryStrip(): array
    {
        return collect(Taxonomy::categories())
            ->map(fn ($c, $slug) => ['slug' => $slug, 'label' => $c['label'], 'icon' => $c['icon']])
            ->values()->all();
    }
}
