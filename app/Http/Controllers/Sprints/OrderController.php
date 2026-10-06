<?php

namespace App\Http\Controllers\Sprints;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Platform\Checkout;
use App\Support\Sprints\Catalogue;
use App\Support\Sprints\SprintOffer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Order Sprint (new and existing customer) -> shared checkout -> Payment Successful.
 *
 * Commercial acts: purchase -> order and payment; subscription / retainer -> order
 * flagged as recurring; free -> instant confirmation; quote -> quote request form.
 */
class OrderController extends Controller
{
    private const SESSION_KEY = 'sprints.orders';

    public function create(Request $request, string $slug): Response|RedirectResponse
    {
        $sprint = SprintController::find($slug);

        $package = SprintOffer::package($sprint, $request->query('package'));

        // Quote-only sprints and packages without a fixed price go to the quote form.
        if ($sprint->commercial_act === 'quote' || $package === null || $package['zar'] === null) {
            return redirect("/sprints/{$sprint->slug}/quote".($package ? '?package='.$package['key'] : ''));
        }

        // Legacy package keys (?package=starter / growth / executive ...) redirect to the tier key.
        if ($request->query('package') !== null && $request->query('package') !== $package['key']) {
            return redirect()->to("/sprints/{$sprint->slug}/order?".http_build_query([...$request->query(), 'package' => $package['key']]), 301);
        }
        $user = $request->user();

        return Inertia::render('Sprints/Order', [
            'sprint' => $sprint,
            'selectedPackage' => $package['key'],
            'selectedAddons' => collect(SprintOffer::selectedAddons($sprint, Catalogue::list($request->query('addons', ''))))->pluck('key'),
            'pricing' => SprintOffer::pricing(),
            'packages' => SprintOffer::packages($sprint),
            'customer' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'company' => $user->company,
                'job_title' => $user->job_title,
                'country' => $user->country,
                'client_id' => $user->client_id,
            ] : null,
            'brief' => self::brief($sprint),
        ]);
    }

    public function store(Request $request, string $slug): RedirectResponse
    {
        $sprint = SprintController::find($slug);
        abort_if($sprint->commercial_act === 'quote', 422, 'This Sprint is priced on request.');

        $packageKeys = collect(SprintOffer::packages($sprint))->whereNotNull('zar')->pluck('key')->all();
        $addonKeys = collect(SprintOffer::addons($sprint))->pluck('key')->all();
        $user = $request->user();
        $guest = $user === null;
        $differentContact = $guest || $request->boolean('use_different_contact');
        $brief = self::brief($sprint);

        $data = $request->validate([
            'package' => ['required', Rule::in($packageKeys)],
            'addons' => ['array'],
            'addons.*' => [Rule::in($addonKeys)],

            'name' => [Rule::requiredIf($differentContact), 'nullable', 'string', 'max:120'],
            'email' => [Rule::requiredIf($differentContact), 'nullable', 'email', 'max:190'],
            'phone' => [Rule::requiredIf($differentContact), 'nullable', 'string', 'max:30'],
            'company' => [Rule::requiredIf($guest), 'nullable', 'string', 'max:190'],
            'role' => [Rule::requiredIf($guest), 'nullable', 'string', 'max:120'],
            'country' => [Rule::requiredIf($guest), 'nullable', 'string', 'max:60'],
            'language' => ['required', Rule::in(['English', 'Afrikaans'])],

            'account' => [Rule::requiredIf($guest), 'nullable', Rule::in(['guest', 'create'])],
            'password' => [Rule::requiredIf($guest && $request->input('account') === 'create'), 'nullable', 'confirmed', Password::min(8)],

            'project_name' => ['required', 'string', 'max:190'],
            'industry' => ['required', 'string', 'max:120'],
            'stage' => ['required', 'string', 'max:120'],
            'funding_goal' => ['nullable', 'string', 'max:120'],
            'target_market' => ['nullable', 'string', 'max:190'],
            'description' => ['required', 'string', 'min:20', 'max:2000'],
            'purposes' => ['required', 'array', 'min:1'],
            'purposes.*' => [Rule::in($brief['purposes'])],
            'preferred_date' => ['nullable', 'required_if:start,date', 'date', 'after:today'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'documents' => ['nullable', 'array', 'max:5'],
            'documents.*' => ['file', 'mimes:pdf,docx,xlsx,pptx', 'max:15360'],

            'channel' => ['required', Rule::in(['whatsapp', 'email', 'phone'])],
            'start' => ['required', Rule::in(['asap', 'date'])],
            'accept_terms' => ['accepted'],
        ], [
            'purposes.required' => 'Select at least one reason you need this Sprint.',
            'accept_terms.accepted' => 'Please accept the Terms & Conditions to continue.',
            'description.min' => 'Please describe your business in at least 20 characters.',
        ]);

        if ($guest && ($data['account'] ?? null) === 'create') {
            $request->validate(['email' => ['unique:users,email']], ['email.unique' => 'An account with this email already exists. Please sign in to continue.']);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'client_id' => 'TBCA-C-'.str_pad((string) (User::max('id') + 1), 6, '0', STR_PAD_LEFT),
                'role' => 'client',
                'phone' => $data['phone'],
                'company' => $data['company'],
                'job_title' => $data['role'],
                'client_type' => 'sme',
                'profile' => ['source' => 'sprint-order'],
            ]);
            Auth::login($user);
            $request->session()->regenerate();
        }

        $package = SprintOffer::package($sprint, $data['package']);
        $addons = SprintOffer::selectedAddons($sprint, $data['addons'] ?? []);
        $recurring = in_array($sprint->commercial_act, ['subscription', 'retainer'], true);

        $documents = collect($request->file('documents', []))
            ->map(fn ($file) => ['name' => $file->getClientOriginalName(), 'path' => $file->store("sprints/briefs/{$sprint->code}", 'local')])
            ->all();

        $contact = $differentContact
            ? ['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'], 'company' => $data['company'] ?? $user?->company]
            : ['name' => $user->name, 'email' => $user->email, 'phone' => $user->phone, 'company' => $user->company];

        $order = Checkout::createOrder(SprintOffer::lines($sprint, $package, $addons), $user, 'sprints', array_filter([
            'title' => "{$sprint->title} ({$package['name']})",
            'sprint' => $sprint->code,
            'slug' => $sprint->slug,
            'package' => $package['key'],
            'package_name' => $package['name'],
            'delivery' => $package['delivery'] ?? $sprint->delivery,
            'addons' => collect($addons)->pluck('key')->all(),
            'commercial_act' => $sprint->commercial_act,
            'recurring' => $recurring ? [
                'period' => $sprint->attributes['billing_period'] ?? 'month',
                'note' => 'Recurring '.($sprint->commercial_act).': billed every '.($sprint->attributes['billing_period'] ?? 'month').' until cancelled. This payment covers the first period.',
            ] : null,
            'customer' => [
                'type' => $guest ? (($data['account'] ?? 'guest') === 'create' ? 'new-account' : 'guest') : 'existing',
                'role' => $data['role'] ?? $user?->job_title,
                'country' => $data['country'] ?? $user?->country,
                'language' => $data['language'],
            ],
            'brief' => [
                'project_name' => $data['project_name'],
                'industry' => $data['industry'],
                'stage' => $data['stage'],
                'funding_goal' => $data['funding_goal'] ?? null,
                'target_market' => $data['target_market'] ?? null,
                'description' => $data['description'],
                'purposes' => $data['purposes'],
                'preferred_date' => $data['preferred_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'documents' => $documents,
            ],
            'delivery_preferences' => ['channel' => $data['channel'], 'start' => $data['start'], 'method' => 'client-portal'],
        ]));

        // The reference only exists once the order is created, so the return URL is set afterwards.

        $order->update([
            'billing' => array_filter([...($order->billing ?? []), ...$contact]),
            'meta' => [...$order->meta, 'return_url' => "/sprints/{$sprint->slug}/success?order={$order->reference}"],
        ]);

        $request->session()->push(self::SESSION_KEY, $order->reference);

        if ($sprint->commercial_act === 'free' || $order->total_zar === 0) {
            $order->update(['status' => 'paid', 'paid_at' => now()]);

            return redirect("/sprints/{$sprint->slug}/success?order={$order->reference}")
                ->with('success', 'Your free Sprint is confirmed.');
        }

        return redirect()->route('checkout.show', $order);
    }

    public function success(Request $request, string $slug): Response|RedirectResponse
    {
        $sprint = SprintController::find($slug);
        $order = Order::query()->with('items', 'payments')->where('reference', (string) $request->query('order'))->first();

        abort_unless($order && $order->section === 'sprints' && ($order->meta['slug'] ?? null) === $sprint->slug, 404);
        abort_unless(self::ownsOrder($request, $order), 403);

        if (! $order->isPaid()) {
            return redirect()->route('checkout.show', $order);
        }

        $package = SprintOffer::package($sprint, $order->meta['package'] ?? null);

        return Inertia::render('Sprints/Success', [
            'sprint' => $sprint,
            'order' => $order,
            'package' => $package,
            'addons' => SprintOffer::selectedAddons($sprint, $order->meta['addons'] ?? []),
            'payment' => $order->payments->where('status', 'succeeded')->last() ?? $order->payments->last(),
        ]);
    }

    public static function ownsOrder(Request $request, Order $order): bool
    {
        $user = $request->user();

        if ($order->user_id !== null) {
            return $user !== null && ($user->id === $order->user_id || $user->isAdmin());
        }

        return in_array($order->reference, (array) $request->session()->get(self::SESSION_KEY, []), true)
            || ($user?->isAdmin() ?? false);
    }

    /** Brief panel labels and options; sprint attributes may override. */
    public static function brief(Sprint $sprint): array
    {
        $b = (array) ($sprint->attributes['brief'] ?? []);

        return [
            'title' => $b['title'] ?? 'Project Brief',
            'purposeLabel' => $b['purposeLabel'] ?? 'What do you need this Sprint for? (Select all that apply)',
            'purposes' => $b['purposes'] ?? ['Funding', 'Bank / Partnership', 'Grant Application', 'Investor Pitch', 'Expansion Planning', 'Internal Planning'],
            'industries' => ['Agriculture & Agri-processing', 'Construction & Infrastructure', 'Education', 'Energy & Renewables', 'Financial Services', 'Healthcare', 'ICT & Technology', 'Logistics & Transport', 'Manufacturing', 'Mining', 'Professional Services', 'Retail & Consumer', 'Tourism & Hospitality', 'Public Sector', 'Non-profit / Development', 'Other'],
            'stages' => ['Idea / Concept', 'Start-up (0-2 years)', 'Early growth', 'Established SME', 'Scale-up', 'Corporate / Enterprise', 'Public institution', 'Programme / Project'],
            'fundingGoals' => ['Not raising funding', 'Under R1 million', 'R1m – R5m', 'R5m – R20m', 'R20m – R100m', 'Over R100m', 'Grant funding'],
        ];
    }
}
