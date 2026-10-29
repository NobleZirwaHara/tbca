<?php

namespace App\Http\Controllers\Sprints;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Submission;
use App\Support\Deliverables\DeliveryPlan;
use App\Support\Platform\Reference;
use App\Support\Shop\IndustryListings;
use App\Support\Sprints\Catalogue;
use App\Support\Sprints\Packages;
use App\Support\Sprints\SprintOffer;
use App\Support\Sprints\Taxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sprint detail dispatcher. Renders Sprints/Show, which hands the page to a
 * type template in Pages/Sprints/Types/{type}.tsx when one exists, otherwise
 * to the generic sprint template.
 */
class SprintController extends Controller
{
    public const TABS = [
        'overview', 'packages', 'whats-included', 'inputs-required', 'process', 'deliverables',
        'risk-review', 'add-ons', 'reviews', 'faqs', 'support', 'ask-a-question',
    ];

    public function show(Request $request, string $slug, string $tab = 'overview'): Response|RedirectResponse
    {
        $sprint = self::find($slug);

        // Old package keys (?package=starter / growth / executive ...) redirect to basic / standard / premium.
        $requested = $request->query('package');
        if (is_string($requested) && $requested !== '' && ($tier = Packages::resolveKey($requested)) !== $requested) {
            $query = array_filter([...$request->query(), 'package' => $tier]);

            return redirect()->to($request->url().($query ? '?'.http_build_query($query) : ''), 301);
        }

        // Every sprint shows exactly Basic / Standard / Premium, whatever the stored row holds.
        $sprint->packages = SprintOffer::packages($sprint);

        $related = Sprint::query()
            ->where('status', 'published')
            ->where('id', '!=', $sprint->id)
            ->where(fn ($q) => $q->where('category', $sprint->category)->orWhere('type', $sprint->type))
            ->orderByDesc('featured')->orderByDesc('rating')
            ->limit(4)
            ->get()
            ->each(fn (Sprint $r) => $r->packages = SprintOffer::packages($r));

        $category = Taxonomy::categories()[$sprint->category] ?? null;
        $package = SprintOffer::package($sprint, $request->query('package'));

        return Inertia::render('Sprints/Show', [
            'sprint' => $sprint,
            'related' => $related,
            'tab' => $tab,
            'selectedPackage' => $package['key'] ?? null,
            'selectedAddons' => Catalogue::list($request->query('addons', '')),
            'pricing' => SprintOffer::pricing(),
            // Online Shop aisles the Sprint appears in: its home aisle, then industry cross-listings.
            'listedIn' => IndustryListings::listedIn($sprint),
            // "What you will receive": deliverables from the Registry of Deliverables, per tier.
            'deliverables' => DeliveryPlan::forSprintPage($sprint),
            'meta' => [
                'category_label' => $sprint->subcategory ?: ($category['label'] ?? null),
                'category_href' => $sprint->category ? "/sprints/category/{$sprint->category}" : '/sprints',
                'type_label' => Taxonomy::typeLabel($sprint->type),
                'audiences' => collect(Catalogue::audiences($sprint))->map(fn ($a) => Taxonomy::audiences()[$a]['label'] ?? $a)->values(),
                'packages' => SprintOffer::packages($sprint),
            ],
        ]);
    }

    /** "Ask a Question" form on the sprint page (existing or new customer). */
    public function question(Request $request, string $slug): RedirectResponse
    {
        $sprint = self::find($slug);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact_method' => ['required', 'in:email,whatsapp,phone'],
            'package' => ['nullable', 'string', 'max:40'],
            'topic' => ['required', 'string', 'max:120'],
            'question' => ['required', 'string', 'min:10', 'max:1000'],
        ], [
            'topic.required' => 'Select a topic for your question.',
        ]);

        $submission = Submission::create([
            'reference' => Reference::make('QST'),
            'user_id' => $request->user()?->id,
            'type' => 'sprint-question',
            'section' => 'sprints',
            'subject' => "{$sprint->title}: {$data['topic']}",
            'name' => $data['name'],
            'email' => $data['email'],
            'payload' => [
                'sprint' => $sprint->code,
                'slug' => $sprint->slug,
                'package' => $data['package'] ?? null,
                'contact_method' => $data['contact_method'],
                'phone' => $data['phone'] ?? null,
                'question' => $data['question'],
            ],
            'status' => 'received',
        ]);

        return back()
            ->with('success', "Thank you. Your question has been sent. Reference {$submission->reference}.")
            ->with('reference', $submission->reference);
    }

    public static function find(string $slug): Sprint
    {
        return Sprint::query()->where('slug', $slug)->where('status', 'published')->firstOrFail();
    }
}
