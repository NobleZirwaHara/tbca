<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\Corridor;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Models\Aiim\Source;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Content;
use App\Support\Aiim\Grades;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Free exploration layer (stages A and 0): landing, South Africa cockpit,
 * province and sector selectors and profiles, risk outlook and source evidence.
 */
class ExploreController extends AiimController
{
    public function landing(Request $request): Response
    {
        return $this->render($request, 'Aiim/Landing', [
            'content' => Content::landing(),
            'sectors' => Sector::query()->orderBy('sort')->get(['slug', 'name', 'icon']),
            'top' => Project::query()->whereIn('code', ['OPP-NC-GH2-013', 'OPP-KZN-AGH-014', 'OPP-GA-LTP-012'])->get()->map(fn ($p) => Catalogue::project($p)),
            'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name', 'score']),
        ], 'Landing');
    }

    public function country(Request $request, string $slug): Response
    {
        if ($slug !== 'south-africa') {
            return $this->render($request, 'Aiim/CountryInactive', ['country' => ucwords(str_replace('-', ' ', $slug))], 'Country');
        }
        $this->select($request, ['country' => 'South Africa']);

        return $this->render($request, 'Aiim/Cockpit', [
            'content' => Content::cockpit(),
            'provinces' => Province::query()->orderByDesc('score')->get(['slug', 'name', 'score']),
        ], 'Investor Cockpit');
    }

    public function provinces(Request $request, string $slug): Response
    {
        abort_unless($slug === 'south-africa', 404);
        $sort = $request->query('sort', 'score');
        $query = Province::query();
        $sort === 'name' ? $query->orderBy('name') : $query->orderByDesc('score');
        $sectorIcons = Sector::query()->pluck('icon', 'slug');

        return $this->render($request, 'Aiim/Provinces', [
            'sort' => $sort,
            'glance' => Content::cockpit()['glance'],
            'provinces' => $query->get()->map(fn ($p) => [
                'slug' => $p->slug, 'name' => $p->name, 'rank' => $p->rank, 'score' => (float) $p->score,
                'label' => Grades::opportunityLabel((float) $p->score),
                'sectors' => collect($p->key_sectors)->map(fn ($s) => ['slug' => $s, 'icon' => $sectorIcons[$s] ?? 'factory'])->take(4)->values(),
            ]),
        ], 'Province Selector');
    }

    public function province(Request $request, Province $province): Response
    {
        $this->select($request, ['province' => $province->slug, 'sector' => null]);
        $sectors = Sector::query()->get()
            ->filter(fn ($s) => isset($s->scores[$province->slug]))
            ->sortByDesc(fn ($s) => $s->scores[$province->slug])
            ->take(5)->values()
            ->map(fn ($s) => ['slug' => $s->slug, 'name' => $s->name, 'score' => $s->scores[$province->slug], 'label' => Grades::opportunityLabel($s->scores[$province->slug])]);

        return $this->render($request, 'Aiim/Province', [
            'province' => $province->only(['slug', 'name', 'code', 'tagline', 'glance', 'kpis', 'economy', 'evidence']) + ['score' => (float) $province->score],
            'sectors' => $sectors,
            'projects' => Project::query()->where('province_slug', $province->slug)->orderByDesc('score')->take(5)->get()->map(fn ($p) => Catalogue::project($p)),
            'grade' => Grades::grade($province->evidence['confidence'] ?? 70),
        ], 'Province Profile');
    }

    public function sectors(Request $request): Response
    {
        $slug = $request->query('province', $this->selection($request)['province'] ?? 'gauteng');
        $province = Province::query()->where('slug', $slug)->firstOrFail();
        $this->select($request, ['province' => $province->slug]);

        $sectors = Sector::query()->orderBy('sort')->get()
            ->map(fn ($s) => ['slug' => $s->slug, 'name' => $s->name, 'icon' => $s->icon, 'summary' => $s->summary, 'score' => $s->scores[$province->slug] ?? null])
            ->filter(fn ($s) => $s['score'] !== null)
            ->sortByDesc('score')->values()
            ->map(fn ($s, $i) => $s + ['rank' => $i + 1, 'label' => Grades::opportunityLabel($s['score'])]);

        return $this->render($request, 'Aiim/Sectors', [
            'province' => ['slug' => $province->slug, 'name' => $province->name, 'kpis' => $province->kpis],
            'sectors' => $sectors,
            'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name']),
        ], 'Sector Selector');
    }

    public function sector(Request $request, Sector $sector): Response
    {
        $provinceSlug = $request->query('province', $this->selection($request)['province'] ?? 'gauteng');
        $province = Province::query()->where('slug', $provinceSlug)->first();
        $this->select($request, ['sector' => $sector->slug, 'province' => $province?->slug]);
        $score = $sector->scores[$provinceSlug] ?? collect($sector->scores)->max();
        $evidence = $sector->profile['evidence'] ?? [];

        return $this->render($request, 'Aiim/Sector', [
            'sector' => ['slug' => $sector->slug, 'name' => $sector->name, 'icon' => $sector->icon, 'summary' => $sector->summary, 'profile' => $sector->profile, 'score' => $score, 'label' => Grades::opportunityLabel((float) $score)],
            'province' => $province?->only(['slug', 'name']),
            'grade' => Grades::grade($evidence['confidence'] ?? 80),
            'opportunities' => Project::query()->where('sector_slug', $sector->slug)->when($province, fn ($q) => $q->where('province_slug', $province->slug))->orderByDesc('score')->take(6)->get()->map(fn ($p) => Catalogue::project($p)),
            'saved' => $this->savedKeys($request->user()),
        ], 'Sector Profile');
    }

    public function risk(Request $request): Response
    {
        return $this->render($request, 'Aiim/Risk', ['risk' => Content::risk()], 'Overall Country Risk');
    }

    public function source(Request $request, Source $source): Response
    {
        $profile = $source->profile ?? [];
        $premium = $profile['premium'] ?? false;
        $entitled = (bool) $this->entitled($request->user(), 'source', $source->code);

        return $this->render($request, 'Aiim/Source', [
            'source' => Catalogue::source($source, true),
            'access' => [
                'premium' => $premium,
                'entitled' => $entitled,
                'status' => $request->user() ? 'Included' : 'Sign in required',
                'level' => $entitled ? 'Full' : 'Preview',
                'premiumContent' => $entitled || ! $premium ? 'Unlocked' : 'Locked',
            ],
            'usedBy' => [
                'projects' => Project::query()->where('source_code', $source->code)->get(['slug', 'name'])->all(),
            ],
            'saved' => $this->savedKeys($request->user()),
        ], 'Source & Evidence');
    }

    public function methodology(Request $request): Response
    {
        return $this->render($request, 'Aiim/Methodology', [
            'grades' => Grades::confidenceGrades(),
            'tiers' => Grades::sourceTiers(),
            'verification' => Grades::verificationStates(),
            'threshold' => Grades::SELLABILITY_THRESHOLD,
            'sources' => Source::query()->orderBy('tier')->orderByDesc('confidence')->get()->map(fn ($s) => Catalogue::source($s)),
            'counts' => ['projects' => Project::count(), 'organisations' => Organisation::count(), 'corridors' => Corridor::count(), 'briefs' => Brief::count()],
        ], 'Methodology');
    }
}
