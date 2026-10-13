<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Support\CorePages\InfoContent;
use App\Support\Platform\Directory;
use App\Support\Platform\EmbeddedServices;
use App\Support\Platform\Offices;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Contact, Webinars, KP Thought Leadership and Diagnostics landing pages.
 */
class InfoPagesController extends Controller
{
    public function contact(): Response
    {
        return Inertia::render('CorePages/Contact', [
            'headOffice' => Offices::headOffice(),
            'featuredOffices' => Offices::featured(),
            'offices' => Offices::countryOffices(),
            'leads' => Directory::clientFacing(),
            'generalEmail' => Directory::GENERAL_EMAIL,
            'serviceAreas' => InfoContent::serviceAreas(),
            'hours' => InfoContent::officeHours(),
        ]);
    }

    /** Every TBCA office: head office first, then the country offices by region. */
    public function offices(): Response
    {
        return Inertia::render('CorePages/Offices', [
            'headOffice' => Offices::headOffice(),
            'regions' => Offices::byRegion(),
            'offices' => Offices::countryOffices(),
            'generalEmail' => Directory::GENERAL_EMAIL,
        ]);
    }

    public function webinars(Request $request): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:40'],
            'topic' => ['nullable', 'string', 'max:40'],
            'date' => ['nullable', 'in:30,90,365'],
            'q' => ['nullable', 'string', 'max:80'],
        ]);

        $all = collect(InfoContent::webinars());
        // Recordings are dated relative to the published catalogue (latest recording = reference date).
        $reference = Carbon::parse($all->max('date'));

        $webinars = $all
            ->when(($filters['category'] ?? 'all') !== 'all' && ! empty($filters['category']), fn ($c) => $c->where('category', $filters['category']))
            ->when(! empty($filters['topic']), fn ($c) => $c->where('topic', $filters['topic']))
            ->when(! empty($filters['date']), fn ($c) => $c->filter(fn ($w) => Carbon::parse($w['date'])->gte($reference->copy()->subDays((int) $filters['date']))))
            ->when(! empty($filters['q']), fn ($c) => $c->filter(fn ($w) => str_contains(strtolower($w['title'].' '.$w['speaker']), strtolower($filters['q']))))
            ->sortByDesc('date')
            ->values();

        return Inertia::render('CorePages/Webinars', [
            'webinars' => $webinars,
            'categories' => InfoContent::webinarCategories(),
            'topics' => $all->pluck('topic')->unique()->sort()->values(),
            'upcoming' => InfoContent::upcomingWebinar(),
            'filters' => ['category' => $filters['category'] ?? 'all', 'topic' => $filters['topic'] ?? '', 'date' => $filters['date'] ?? '', 'q' => $filters['q'] ?? ''],
            'embedded' => EmbeddedServices::forModule('webinars'),
        ]);
    }

    public function kp(Request $request): Response
    {
        $format = $request->query('format', 'featured');
        $topic = $request->query('topic');

        $insights = collect(InfoContent::kpInsights())
            ->when($format === 'featured', fn ($c) => $c->where('featured', true))
            ->when($format !== 'featured', fn ($c) => $c->where('format', $format))
            ->when($topic, fn ($c) => $c->where('topic', $topic))
            ->values();

        return Inertia::render('CorePages/KpThoughtLeadership', [
            'insights' => $insights,
            'numbers' => InfoContent::kpNumbers(),
            'formats' => InfoContent::kpFormats(),
            'topics' => InfoContent::kpTopics(),
            'filters' => ['format' => $format, 'topic' => $topic],
            'embedded' => EmbeddedServices::forModule('kp-thought-leadership'),
        ]);
    }

    public function diagnostics(Request $request): Response
    {
        $category = $request->query('category');
        $packs = collect(InfoContent::diagnosticPacks())
            ->when($category, fn ($c) => $c->filter(fn ($p) => in_array($category, $p['categories'], true)))
            ->values();

        return Inertia::render('CorePages/Diagnostics', [
            'categories' => InfoContent::diagnosticCategories(),
            'packs' => $packs,
            'category' => $category,
        ]);
    }
}
