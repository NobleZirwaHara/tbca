<?php

namespace App\Http\Controllers\Kp;

use App\Http\Controllers\Controller;
use App\Models\Insights\Webinar;
use App\Support\About\Content as AboutContent;
use App\Support\Content\KpThoughtLeadership as Kp;
use App\Support\CorePages\InfoContent;
use App\Support\Portal\Catalogue;
use App\Support\Webinars\WebinarPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * KP Thought Leadership section: landing, article library, series, author profile,
 * speaking and media, events, podcasts and videos, downloads, newsletter and booking.
 */
class KpController extends Controller
{
    public function home(): Response
    {
        $items = collect(Kp::items());

        return Inertia::render('Kp/Home', $this->shared() + [
            'featured' => $items->where('featured', true)->map(fn ($i) => $this->card($i))->values(),
            'latest' => $items->take(-4)->map(fn ($i) => $this->card($i))->values(),
            'numbers' => InfoContent::kpNumbers(),
            'counts' => ['items' => $items->count(), 'published' => $items->where('status', 'published')->count(), 'series' => count(Kp::series())],
            'events' => $this->kpWebinars()->take(3)->values(),
        ]);
    }

    public function library(Request $request, ?string $kind = null, ?string $theme = null): Response
    {
        $kind ??= (string) $request->route('kind', 'articles');
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'theme' => ['nullable', Rule::in(array_column(Kp::themes(), 'slug'))],
            'format' => ['nullable', Rule::in(array_keys(Kp::formats()))],
            'sort' => ['nullable', Rule::in(['newest', 'title'])],
        ]);
        $theme ??= $f['theme'] ?? null;
        $formats = match ($kind) {
            'podcasts' => ['podcast', 'video', 'interview', 'keynote'],
            'downloads' => ['report'],
            default => array_keys(Kp::formats()),
        };
        $all = collect(Kp::items())->whereIn('format', $formats);
        $rows = $all
            ->when($theme, fn (Collection $c) => $c->where('theme', $theme))
            ->when($f['format'] ?? null, fn (Collection $c, $fmt) => $c->where('format', $fmt))
            ->when($f['q'] ?? null, fn (Collection $c, $q) => $c->filter(fn ($i) => Str::contains(Str::lower($i['title'].' '.($i['summary'] ?? '').' '.Kp::themeLabel($i['theme'])), Str::lower(trim($q)))))
            ->when(($f['sort'] ?? 'newest') === 'title', fn (Collection $c) => $c->sortBy('title'))
            ->values();
        $page = max(1, (int) $request->query('page', 1));
        $per = 12;

        return Inertia::render('Kp/Library', $this->shared() + [
            'kind' => $kind,
            'heading' => match ($kind) {
                'podcasts' => 'Podcasts, Videos and Interviews',
                'downloads' => 'Reports, Whitepapers and Downloads',
                'theme' => Kp::themeLabel((string) $theme),
                default => 'Article Library',
            },
            'theme' => $theme ? collect(Kp::themes())->firstWhere('slug', $theme) : null,
            'items' => $rows->forPage($page, $per)->map(fn ($i) => $this->card($i))->values(),
            'pagination' => ['page' => $page, 'last' => max(1, (int) ceil($rows->count() / $per)), 'total' => $rows->count(), 'of' => $all->count()],
            'filters' => ['q' => $f['q'] ?? '', 'theme' => $theme ?? '', 'format' => $f['format'] ?? '', 'sort' => $f['sort'] ?? 'newest'],
            'formatOptions' => collect(Kp::formats())->only($formats)->map(fn ($v, $k) => ['key' => $k, 'label' => $v[1]])->values(),
        ]);
    }

    public function theme(Request $request, string $theme): Response
    {
        abort_unless(collect(Kp::themes())->contains('slug', $theme), 404);

        return $this->library($request, 'theme', $theme);
    }

    public function article(string $slug): Response
    {
        $item = Kp::find($slug);
        abort_unless($item, 404);
        $related = collect(Kp::items())->where('theme', $item['theme'])->where('slug', '!=', $slug)->take(3);

        return Inertia::render('Kp/Article', $this->shared() + [
            'item' => $this->card($item) + ['body' => $item['body'], 'readMinutes' => $item['read_minutes']],
            'series' => $item['series'] ? collect(Kp::series())->firstWhere('slug', $item['series']) : null,
            'related' => $related->map(fn ($i) => $this->card($i))->values(),
            'author' => $this->author(),
        ]);
    }

    public function series(?string $slug = null): Response
    {
        $series = collect(Kp::series());
        $current = $slug ? $series->firstWhere('slug', $slug) : null;
        abort_if($slug && ! $current, 404);
        $items = collect(Kp::items());

        return Inertia::render('Kp/Series', $this->shared() + [
            'collections' => $series->map(fn ($s) => $s + ['count' => $items->where('series', $s['slug'])->count(), 'themeLabels' => array_map([Kp::class, 'themeLabel'], $s['themes'])])->values(),
            'current' => $current ? $current + ['themeLabels' => array_map([Kp::class, 'themeLabel'], $current['themes'])] : null,
            'items' => $current ? $items->where('series', $current['slug'])->map(fn ($i) => $this->card($i))->values() : [],
        ]);
    }

    public function profile(): Response
    {
        return Inertia::render('Kp/Profile', $this->shared() + [
            'author' => $this->author(),
            'numbers' => InfoContent::kpNumbers(),
        ]);
    }

    public function speaking(): Response
    {
        return Inertia::render('Kp/Speaking', $this->shared() + [
            'engagements' => Kp::engagementTypes(),
            'topics' => $this->author()['expertise'],
            'media' => collect(Kp::items())->whereIn('format', ['interview', 'keynote', 'podcast', 'video'])->map(fn ($i) => $this->card($i))->values(),
        ]);
    }

    public function events(): Response
    {
        return Inertia::render('Kp/Events', $this->shared() + [
            'webinars' => $this->kpWebinars(),
            'sessions' => collect(Catalogue::kpSessions())->map(fn ($s, $key) => ['key' => $key, 'title' => $s[0], 'type' => $s[1], 'date' => now()->addDays($s[2])->format('D, j M Y'), 'time' => $s[3], 'topic' => $s[4]])->values(),
        ]);
    }

    public function connect(Request $request): Response
    {
        $mode = $request->route()->getName() === 'kp.book' ? 'book' : 'newsletter';

        return Inertia::render('Kp/Connect', $this->shared() + [
            'mode' => $mode,
            'engagements' => Kp::engagementTypes(),
            'preset' => (string) $request->query('type', ''),
        ]);
    }

    /* ------------------------------------------------------------------ */

    private function shared(): array
    {
        return [
            'sections' => Kp::sections(),
            'themes' => Kp::themes(),
            'formats' => collect(Kp::formats())->map(fn ($v, $k) => ['key' => $k, 'label' => $v[0], 'plural' => $v[1], 'icon' => $v[2]])->values(),
            'plannedPages' => Kp::PLANNED_PAGES,
        ];
    }

    private function card(array $i): array
    {
        $fmt = Kp::formats()[$i['format']] ?? ['Article', 'Articles', 'file-text'];

        return [
            'slug' => $i['slug'], 'title' => $i['title'], 'summary' => $i['summary'], 'theme' => $i['theme'], 'themeLabel' => Kp::themeLabel($i['theme']),
            'format' => $i['format'], 'formatLabel' => $fmt[0], 'icon' => $fmt[2], 'status' => $i['status'], 'featured' => (bool) $i['featured'],
            'series' => $i['series'], 'published' => $i['published'],
        ];
    }

    private function author(): array
    {
        $a = AboutContent::findLeader('kruger-phiri') ?? [];

        return collect($a)->only(['name', 'post_nominal', 'role', 'summary', 'bio', 'highlights', 'expertise', 'qualifications', 'languages', 'location', 'reviewed', 'state'])->all();
    }

    private function kpWebinars(): Collection
    {
        return Webinar::where('speaker', 'Kruger Phiri')->whereNotIn('state', ['draft'])->orderByDesc('starts_at')->get()
            ->sortBy(fn (Webinar $w) => $w->registrationOpen() ? 0 : 1)->values()->map(fn (Webinar $w) => WebinarPresenter::card($w));
    }
}
