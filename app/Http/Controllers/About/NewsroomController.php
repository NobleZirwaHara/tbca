<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\NewsItem;
use App\Models\About\TrustCase;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Newsroom: public releases only (embargoed/draft excluded in the query) + media enquiries. */
class NewsroomController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->string('category')->toString();
        $category = array_key_exists($category, NewsItem::CATEGORIES) ? $category : null;

        $news = NewsItem::query()->public()->where('kind', 'news')
            ->when($category, fn ($q, $c) => $q->where('category', $c))
            ->orderByDesc('published_at')->get();

        $counts = NewsItem::query()->public()->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');

        $featured = $category ? null : NewsItem::query()->public()->where('featured', true)->orderByDesc('published_at')->first();

        return Inertia::render('About/Newsroom/Index', [
            'featured' => $featured?->card(),
            'news' => $news->reject(fn ($n) => $featured && $n->id === $featured->id)->map->card()->values(),
            'announcements' => $category ? [] : NewsItem::query()->public()->where('kind', 'announcement')->orderByDesc('published_at')->limit(3)->get()->map->card(),
            'categories' => collect(NewsItem::CATEGORIES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => (int) ($counts[$key] ?? 0)])->values(),
            'total' => (int) $counts->sum(),
            'category' => $category,
        ]);
    }

    public function show(NewsItem $news): Response
    {
        abort_unless(NewsItem::query()->public()->whereKey($news->id)->exists(), 404);

        return Inertia::render('About/Newsroom/Release', [
            'release' => $news->card() + [
                'location' => $news->location,
                'body' => $news->body ?? [],
                'quote' => $news->quote,
                'quote_by' => $news->quote_by,
            ],
            'related' => NewsItem::query()->public()->where('kind', 'news')->whereKeyNot($news->id)->orderByDesc('published_at')->limit(3)->get()->map->card(),
        ]);
    }

    public function media(): Response
    {
        return Inertia::render('About/Newsroom/MediaContact');
    }

    public function storeMedia(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'outlet' => ['required', 'string', 'max:160'],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
            'topic' => ['required', 'string', 'max:200'],
            'questions' => ['required', 'string', 'max:3000'],
        ]);

        $case = TrustCase::create([
            'reference' => Reference::make(TrustCase::PREFIX['media']),
            'type' => 'media',
            'status' => 'received',
            'name' => $data['name'],
            'email' => $data['email'],
            'organisation' => $data['outlet'],
            'subject' => $data['topic'],
            'message' => $data['questions'],
            'details' => ['deadline' => $data['deadline'] ?? null],
            'history' => [['at' => now()->toIso8601String(), 'status' => 'received', 'note' => 'Media enquiry received.']],
        ]);

        return back()->with('success', 'Thank you — the communications team will respond within one business day.')->with('reference', $case->reference);
    }
}
