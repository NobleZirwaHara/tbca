<?php

namespace App\Http\Controllers\Webinars;

use App\Http\Controllers\Controller;
use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use App\Models\Webinars\ChatMessage;
use App\Models\Webinars\Feedback;
use App\Models\Webinars\Note;
use App\Models\Webinars\Poll;
use App\Models\Webinars\PollVote;
use App\Models\Webinars\Question;
use App\Support\Platform\Checkout;
use App\Support\Webinars\WebinarPresenter as P;
use App\Support\Webinars\WebinarRegister as R;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Public Webinars journey (WB-TEB Track A): find, register, confirm, prepare,
 * attend live, give feedback, watch the approved replay and take a disclosed next step.
 */
class WebinarController extends Controller
{
    private const PUBLIC_STATES = ['awaiting_w1', 'approved', 'live', 'ended', 'awaiting_w3', 'published', 'edited', 'corrected', 'withheld', 'withdrawn'];

    /* ------------------------------------------------------------------ */
    /* Dashboard and find                                                  */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): Response
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:40'],
            'when' => ['nullable', Rule::in(['all', 'upcoming', 'live', 'replays'])],
            'price' => ['nullable', Rule::in(['free', 'paid'])],
            'cpd' => ['nullable', 'boolean'],
            'speaker' => ['nullable', 'string', 'max:80'],
            'view' => ['nullable', Rule::in(['grid', 'calendar'])],
        ]);

        $all = $this->catalogue();
        $match = $all
            ->when($f['q'] ?? null, fn (Collection $c, $q) => $c->filter(fn (Webinar $w) => Str::contains(Str::lower(implode(' ', [$w->title, $w->summary, $w->tagline, $w->speaker, $w->topic, P::categoryLabel($w->category)])), Str::lower(trim($q)))))
            ->when(($f['category'] ?? 'all') !== 'all' && ! empty($f['category']), fn (Collection $c) => $c->where('category', $f['category']))
            ->when(($f['price'] ?? null) === 'free', fn (Collection $c) => $c->filter(fn (Webinar $w) => ! $w->price_zar))
            ->when(($f['price'] ?? null) === 'paid', fn (Collection $c) => $c->filter(fn (Webinar $w) => (bool) $w->price_zar))
            ->when(! empty($f['cpd']), fn (Collection $c) => $c->where('cpd', true))
            ->when($f['speaker'] ?? null, fn (Collection $c, $s) => $c->where('speaker', $s));

        $when = $f['when'] ?? 'all';
        $upcoming = $match->filter(fn (Webinar $w) => $w->registrationOpen())->sortBy('starts_at')->values();
        $live = $match->filter(fn (Webinar $w) => $w->publicState() === 'live')->values();
        $past = $match->filter(fn (Webinar $w) => ! $w->registrationOpen() && $w->publicState() !== 'live')->sortByDesc('starts_at')->values();

        $regs = WebinarRegistration::query();
        $snapshots = $all->filter(fn (Webinar $w) => $w->registrations()->doesntExist())->sum(fn (Webinar $w) => (int) $w->detail('metrics.registrations', 0));

        return Inertia::render('Webinars/Index', [
            'filters' => ['q' => $f['q'] ?? '', 'category' => $f['category'] ?? 'all', 'when' => $when, 'price' => $f['price'] ?? '', 'cpd' => (bool) ($f['cpd'] ?? false), 'speaker' => $f['speaker'] ?? '', 'view' => $f['view'] ?? 'grid'],
            'searched' => collect($f)->except('view')->filter(fn ($v) => $v !== null && $v !== '' && $v !== 'all' && $v !== false)->isNotEmpty(),
            'upcoming' => in_array($when, ['all', 'upcoming'], true) ? $upcoming->map(fn ($w) => P::card($w))->all() : [],
            'live' => in_array($when, ['all', 'live'], true) ? $live->map(fn ($w) => P::card($w))->all() : [],
            'past' => in_array($when, ['all', 'replays'], true) ? $past->map(fn ($w) => P::card($w))->all() : [],
            'categories' => R::categories(),
            'speakers' => $all->pluck('speaker')->unique()->sort()->values(),
            'counts' => ['upcoming' => $upcoming->count(), 'live' => $live->count(), 'past' => $past->count(), 'total' => $match->count(), 'catalogue' => $all->count()],
            'stats' => [
                'registrations' => (clone $regs)->where('status', 'registered')->count() + $snapshots,
                'delivered' => $all->filter(fn (Webinar $w) => ! $w->registrationOpen())->count(),
                'certificates' => (clone $regs)->where('certificate', 'issued')->count(),
                'satisfaction' => (int) round((Feedback::avg('rating') ?? 4.2) / 5 * 100),
            ],
            'quote' => ['Knowledge shared today builds the businesses, jobs and opportunities of tomorrow.', 'Kruger Phiri', 'Founder, The Business Clinic.Africa'],
        ]);
    }

    public function replays(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $state = (string) $request->query('state', 'all');
        $rows = $this->catalogue()
            ->filter(fn (Webinar $w) => in_array($w->publicState(), ['published', 'edited', 'corrected', 'awaiting_w3', 'withheld', 'withdrawn'], true))
            ->when($q !== '', fn ($c) => $c->filter(fn (Webinar $w) => Str::contains(Str::lower($w->title.' '.$w->speaker.' '.$w->topic), Str::lower($q))))
            ->when($state === 'available', fn ($c) => $c->filter->replayAvailable())
            ->when($state === 'review', fn ($c) => $c->filter(fn (Webinar $w) => ! $w->replayAvailable()))
            ->sortByDesc('starts_at')->values();

        return Inertia::render('Webinars/Replays', [
            'replays' => $rows->map(fn (Webinar $w) => P::card($w) + ['note' => $w->detail('edit_note') ?? $w->detail('correction') ?? $w->detail('withheld_note')])->all(),
            'filters' => ['q' => $q, 'state' => $state],
        ]);
    }

    public function myRegistrations(Request $request): Response
    {
        $regs = $this->ownedRegistrations($request)->load('webinar');

        return Inertia::render('Webinars/MyRegistrations', [
            'tab' => in_array($request->query('tab'), ['certificates', 'notes'], true) ? $request->query('tab') : 'registrations',
            'registrations' => $regs->map(fn (WebinarRegistration $r) => ['registration' => P::registration($r), 'event' => P::card($r->webinar)])->values()->all(),
            'notes' => Note::whereIn('owner_key', $this->ownerKeys($request))->with('webinar')->latest()->get()->map(fn (Note $n) => ['event' => $n->webinar?->title, 'slug' => $n->webinar?->slug, 'body' => $n->body, 'updated' => $n->updated_at->format('j M Y, H:i')])->all(),
            'signedIn' => (bool) $request->user(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Selected webinar, registration, confirmation                        */
    /* ------------------------------------------------------------------ */

    public function show(Request $request, Webinar $webinar): Response
    {
        $this->visible($webinar, $request);

        return Inertia::render('Webinars/Show', $this->frame($request, $webinar) + [
            'countries' => R::countries(),
            'related' => $this->catalogue()->filter(fn (Webinar $w) => $w->id !== $webinar->id && $w->registrationOpen())->sortBy('starts_at')->take(3)->map(fn ($w) => P::card($w))->values()->all(),
        ]);
    }

    public function register(Request $request, Webinar $webinar): Response|RedirectResponse
    {
        $this->visible($webinar, $request);
        if (! $webinar->registrationOpen()) {
            return redirect()->route('webinars.show', $webinar)->with('error', 'Registration is closed for this event. '.R::states()[$webinar->publicState()][0].'.');
        }
        $user = $request->user();

        return Inertia::render('Webinars/Register', $this->frame($request, $webinar) + [
            'modes' => collect(R::participationModes())->map(fn ($m, $k) => ['key' => $k, 'label' => $m[0], 'body' => $m[1], 'icon' => $m[2]])->values()->all(),
            'roles' => R::roles(),
            'industries' => R::industries(),
            'countries' => R::countries(),
            'notices' => R::notices(),
            'prefill' => [
                'first_name' => $request->query('first_name', $user ? Str::before($user->name, ' ') : ''),
                'last_name' => $request->query('last_name', $user ? Str::after($user->name, ' ') : ''),
                'email' => $request->query('email', $user?->email ?? ''),
                'phone' => $user?->phone ?? '',
                'country' => $request->query('country', $user?->country === 'ZA' ? 'South Africa' : ''),
                'organisation' => $user?->company ?? '',
            ],
        ]);
    }

    public function storeRegistration(Request $request, Webinar $webinar): RedirectResponse
    {
        if (! $webinar->registrationOpen()) {
            return redirect()->route('webinars.show', $webinar)->with('error', 'Registration is closed for this event.');
        }

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:40'],
            'country' => ['required', 'string', 'max:80'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'role' => ['required', 'string', 'max:80'],
            'industry' => ['nullable', 'string', 'max:80'],
            'participation' => ['required', Rule::in(array_keys(R::participationModes()))],
            'accept_privacy' => ['accepted'],
            'accept_recording' => ['accepted'],
            'accept_confidentiality' => ['accepted'],
            'accept_offer' => ['accepted'],
            'accept_boundary' => ['accepted'],
            'opt_updates' => ['nullable', 'boolean'],
        ], [
            '*.accepted' => 'Please confirm this declaration to complete your registration.',
        ]);

        $existing = WebinarRegistration::where('webinar_id', $webinar->id)->where('email', Str::lower($data['email']))->first();
        if ($existing && $existing->status === 'registered') {
            $this->remember($request, $existing);

            return redirect()->route('webinars.confirmed', $webinar)->with('success', 'You are already registered for this webinar. Your registration details are below.');
        }

        $notices = R::notices();
        $reg = WebinarRegistration::updateOrCreate(['webinar_id' => $webinar->id, 'email' => Str::lower($data['email'])], [
            'reference' => 'WB-'.$webinar->starts_at->format('Ymd').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
            'user_id' => $request->user()?->id,
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'phone' => $data['phone'],
            'country' => $data['country'],
            'company' => $data['organisation'] ?? '',
            'job_title' => $data['role'],
            'industry' => $data['industry'] ?? null,
            'participation' => $data['participation'],
            'status' => $webinar->price_zar ? 'pending_payment' : 'registered',
            'attendance' => 'pending',
            'consent_state' => 'full',
            'opt_resources' => (bool) ($data['opt_updates'] ?? false),
            'opt_offers' => (bool) ($data['opt_updates'] ?? false),
            'source' => (string) $request->query('utm_source', 'TBCA Website'),
            'notices' => ['recording' => $notices['recording']['version'], 'offer' => $notices['offer']['version'], 'boundary' => $notices['boundary']['version'], 'privacy' => $notices['privacy']['version'], 'at' => now()->toIso8601String()],
            'access_token' => Str::random(40),
        ]);
        $this->remember($request, $reg);

        if ($webinar->price_zar) {
            $order = Checkout::createOrder([[
                'item_type' => 'webinar', 'item_code' => 'WB-'.Str::upper(Str::limit($webinar->slug, 40, '')), 'name' => 'Webinar: '.$webinar->title,
                'variant' => 'Live seat', 'quantity' => 1, 'unit_zar' => (int) $webinar->price_zar, 'commercial_act' => 'purchase',
                'meta' => ['section' => 'webinars', 'registration' => $reg->reference],
            ]], $request->user(), 'webinars', ['registration' => $reg->reference]);

            return redirect()->route('checkout.show', $order)->with('success', 'Your seat is held. Complete payment to confirm registration '.$reg->reference.'.');
        }

        return redirect()->route('webinars.confirmed', $webinar)->with('success', 'Registration confirmed. Reference '.$reg->reference.'.');
    }

    public function confirmed(Request $request, Webinar $webinar): Response|RedirectResponse
    {
        $reg = $this->registrationFor($request, $webinar);
        if (! $reg) {
            return redirect()->route('webinars.register', $webinar)->with('error', 'We could not find a registration for this webinar in your session. Please register or sign in.');
        }

        return Inertia::render('Webinars/Confirmed', $this->frame($request, $webinar, $reg));
    }

    public function myRegistration(Request $request, Webinar $webinar): Response
    {
        return Inertia::render('Webinars/MyRegistration', $this->frame($request, $webinar) + [
            'modes' => collect(R::participationModes())->map(fn ($m, $k) => ['key' => $k, 'label' => $m[0]])->values()->all(),
            'roles' => R::roles(),
            'industries' => R::industries(),
            'countries' => R::countries(),
        ]);
    }

    public function updateRegistration(Request $request, Webinar $webinar): RedirectResponse
    {
        $reg = $this->registrationFor($request, $webinar);
        abort_unless($reg, 404);
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:40'],
            'country' => ['required', 'string', 'max:80'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'role' => ['required', 'string', 'max:80'],
            'industry' => ['nullable', 'string', 'max:80'],
            'participation' => ['required', Rule::in(array_keys(R::participationModes()))],
        ]);
        $reg->update(['phone' => $data['phone'], 'country' => $data['country'], 'company' => $data['organisation'] ?? '', 'job_title' => $data['role'], 'industry' => $data['industry'] ?? null, 'participation' => $data['participation']]);

        return back()->with('success', 'Your registration details were updated.');
    }

    public function cancelRegistration(Request $request, Webinar $webinar): RedirectResponse
    {
        $reg = $this->registrationFor($request, $webinar);
        abort_unless($reg, 404);
        $reg->update(['status' => 'cancelled']);

        return redirect()->route('webinars.show', $webinar)->with('success', 'Your registration '.$reg->reference.' was cancelled.');
    }

    public function preEvent(Request $request, Webinar $webinar): Response
    {
        $reg = $this->registrationFor($request, $webinar);

        return Inertia::render('Webinars/PreEvent', $this->frame($request, $webinar, $reg) + [
            'checklist' => [
                ['Check Your Confirmation Email', 'We have sent your unique access link to '.($reg?->email ?? 'your email address').'.', (bool) $reg, null],
                ['Add to Calendar', 'Add the event to your calendar and set a reminder.', (bool) $reg, ['Add to Calendar', route('webinars.calendar', $webinar)]],
                ['Review the Event Brief', 'Prepare with the agenda, speaker profile and key discussion points.', false, ['View Brief', route('webinars.resource', [$webinar, 'brief'])]],
                ['Prepare Your Questions', 'Submit your questions in advance. Our team may include them in the live Q&A.', false, ['Submit Questions', route('webinars.qa', $webinar)]],
                ['Test Your Connection', 'Ensure a stable internet connection and an updated Zoom app or browser.', false, ['Test Connection', 'https://zoom.us/test']],
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Live room: chat, Q&A, polls                                         */
    /* ------------------------------------------------------------------ */

    public function live(Request $request, Webinar $webinar): Response
    {
        return $this->liveView($request, $webinar, 'Webinars/Live');
    }

    public function qa(Request $request, Webinar $webinar): Response
    {
        return $this->liveView($request, $webinar, 'Webinars/LiveQa');
    }

    public function polls(Request $request, Webinar $webinar): Response
    {
        return $this->liveView($request, $webinar, 'Webinars/LivePolls');
    }

    private function liveView(Request $request, Webinar $webinar, string $component): Response
    {
        $this->visible($webinar, $request);
        $voter = $this->voterKey($request);
        $staff = (bool) $request->user()?->isAdmin();
        $tab = (string) $request->query('tab', 'all');
        $search = trim((string) $request->query('search', ''));
        $category = (string) $request->query('category', '');

        $questions = $webinar->questions()->orderByDesc('pinned')->orderByDesc('upvotes')->orderBy('asked_at')->get();
        $visible = $questions->filter(fn (Question $q) => $staff || $q->status !== 'dismissed');
        $filtered = $visible
            ->when($tab === 'all', fn ($c) => $c->whereIn('status', ['pending', 'approved'])->when(! $staff, fn ($c) => $c->where('status', 'approved')))
            ->when($tab === 'answered', fn ($c) => $c->where('status', 'answered'))
            ->when($tab === 'pinned', fn ($c) => $c->where('pinned', true))
            ->when($tab === 'dismissed', fn ($c) => $c->where('status', 'dismissed'))
            ->when($search !== '', fn ($c) => $c->filter(fn (Question $q) => Str::contains(Str::lower($q->body.' '.$q->name), Str::lower($search))))
            ->when($category !== '', fn ($c) => $c->where('category', $category));
        $votes = PollVote::whereIn('poll_id', $webinar->polls()->pluck('id'))->where('voter', $voter)->pluck('option', 'poll_id');

        return Inertia::render($component, $this->frame($request, $webinar) + [
            'roomState' => match ($webinar->publicState()) {
                'live' => 'live',
                'awaiting_w1', 'approved' => 'not_started',
                default => 'ended',
            },
            'elapsed' => $webinar->publicState() === 'live' ? max(0, (int) $webinar->starts_at->diffInSeconds(now(), true)) : 0,
            'liveAttendees' => $webinar->registrations()->whereIn('attendance', ['attended', 'partial'])->count(),
            'chat' => $webinar->chat()->orderBy('posted_at')->get()->map(fn (ChatMessage $m) => ['id' => $m->id, 'name' => $m->name, 'body' => $m->body, 'host' => $m->is_host, 'at' => $m->posted_at->format('H:i')])->all(),
            'questions' => $filtered->values()->map(fn (Question $q) => $this->questionRow($q, $staff))->all(),
            'questionCounts' => [
                'all' => $visible->whereIn('status', $staff ? ['pending', 'approved'] : ['approved'])->count(),
                'answered' => $visible->where('status', 'answered')->count(),
                'pinned' => $visible->where('pinned', true)->count(),
                'dismissed' => $staff ? $questions->where('status', 'dismissed')->count() : 0,
            ],
            'questionCategories' => collect(R::questionCategories())->map(fn ($c) => ['label' => $c, 'count' => $questions->where('category', $c)->count()])->all(),
            'qaFilters' => ['tab' => $tab, 'search' => $search, 'category' => $category],
            'polls' => $webinar->polls()->get()->map(fn (Poll $p) => $this->pollRow($p, $votes[$p->id] ?? null))->all(),
            'guidelines' => R::qaGuidelines(),
            'suggestions' => $visible->where('status', 'answered')->take(3)->pluck('body')->values()->all(),
            'settings' => collect(R::moderationSettings())->map(fn ($s) => ['key' => $s[0], 'label' => $s[1], 'on' => (bool) ($webinar->detail('toggles.'.$s[0]) ?? $s[2])])->all(),
            'canPost' => $this->canParticipate($request, $webinar),
            'currentTopic' => $webinar->detail('current_topic', 'Key Sectors Driving African Growth'),
            'slide' => $webinar->detail('slide', [7, 12]),
        ]);
    }

    public function postChat(Request $request, Webinar $webinar): RedirectResponse
    {
        $this->assertParticipant($request, $webinar);
        $data = $request->validate(['body' => ['required', 'string', 'max:500']]);
        ChatMessage::create(['webinar_id' => $webinar->id, 'name' => $this->participantName($request, $webinar), 'body' => $data['body'], 'is_host' => (bool) $request->user()?->isAdmin(), 'posted_at' => now()]);

        return back();
    }

    public function postQuestion(Request $request, Webinar $webinar): RedirectResponse
    {
        $this->assertParticipant($request, $webinar);
        $data = $request->validate([
            'body' => ['required', 'string', 'min:5', 'max:500'],
            'category' => ['required', Rule::in(R::questionCategories())],
            'anonymous' => ['nullable', 'boolean'],
        ]);
        Question::create([
            'webinar_id' => $webinar->id, 'user_id' => $request->user()?->id, 'name' => ! empty($data['anonymous']) ? 'Anonymous attendee' : $this->participantName($request, $webinar),
            'category' => $data['category'], 'body' => $data['body'], 'anonymous' => (bool) ($data['anonymous'] ?? false), 'status' => 'pending', 'asked_at' => now(),
        ]);

        return back()->with('success', 'Your question was submitted privately to the moderator. Questions are reviewed before they reach the presenter.');
    }

    public function upvote(Request $request, Webinar $webinar, Question $question): RedirectResponse
    {
        abort_unless($question->webinar_id === $webinar->id, 404);
        $key = 'wb_upvoted.'.$question->id;
        if (! $request->session()->get($key)) {
            $question->increment('upvotes');
            $request->session()->put($key, true);
        }

        return back();
    }

    public function vote(Request $request, Webinar $webinar, Poll $poll): RedirectResponse
    {
        abort_unless($poll->webinar_id === $webinar->id, 404);
        $this->assertParticipant($request, $webinar);
        if ($poll->status !== 'active') {
            return back()->with('error', 'This poll is not open for voting.');
        }
        $data = $request->validate(['option' => ['required', 'integer', 'min:0', 'max:'.(count($poll->options) - 1)]]);
        $voter = $this->voterKey($request);
        $options = $poll->options;
        $prior = PollVote::where('poll_id', $poll->id)->where('voter', $voter)->first();
        if ($prior) {
            $options[$prior->option]['votes'] = max(0, $options[$prior->option]['votes'] - 1);
            $prior->update(['option' => $data['option']]);
        } else {
            PollVote::create(['poll_id' => $poll->id, 'voter' => $voter, 'option' => $data['option']]);
        }
        $options[$data['option']]['votes']++;
        $poll->update(['options' => $options]);

        return back()->with('success', $prior ? 'Your vote was changed.' : 'Thank you. Your vote was recorded.');
    }

    /* ------------------------------------------------------------------ */
    /* Post-event: thank you, feedback, certificate, offers, missed        */
    /* ------------------------------------------------------------------ */

    public function thanks(Request $request, Webinar $webinar): Response
    {
        $this->visible($webinar, $request);
        $m = P::metrics($webinar);
        $reg = $this->registrationFor($request, $webinar);

        return Inertia::render('Webinars/ThankYou', $this->frame($request, $webinar, $reg) + [
            'stats' => [
                'attendees' => $m['attended'] ?: (int) $webinar->detail('metrics.attended', 0),
                'questions' => $m['questions'],
                'pollPct' => $m['attended'] ? (int) round($m['polls'] / $m['attended'] * 100) : 0,
                'downloads' => $m['downloads'],
            ],
            'feedbackGiven' => (bool) $request->session()->get('wb_feedback.'.$webinar->id),
            'certificateReady' => $reg?->certificate === 'issued',
        ]);
    }

    public function storeFeedback(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'relevance' => ['required', Rule::in(['Not relevant', 'Somewhat relevant', 'Relevant', 'Very relevant', 'Extremely relevant'])],
            'valuable' => ['nullable', 'array'],
            'valuable.*' => ['string', 'max:80'],
            'topics' => ['nullable', 'string', 'max:500'],
            'contact_ok' => ['nullable', 'boolean'],
        ]);
        Feedback::create(['webinar_id' => $webinar->id, 'user_id' => $request->user()?->id] + $data + ['contact_ok' => (bool) ($data['contact_ok'] ?? false)]);
        $request->session()->put('wb_feedback.'.$webinar->id, true);

        return back()->with('success', 'Thank you for your feedback. It helps us improve future webinars.');
    }

    public function certificate(Request $request, Webinar $webinar): HttpResponse|RedirectResponse
    {
        $reg = $this->registrationFor($request, $webinar);
        if (! $reg || $reg->certificate !== 'issued') {
            return redirect()->route('webinars.thanks', $webinar)->with('error', 'A certificate is issued to attendees of CPD eligible events after the session. Complete the replay quiz and feedback to request one.');
        }
        $html = view()->exists('webinars.certificate') ? view('webinars.certificate', ['r' => $reg, 'w' => $webinar])->render() : $this->certificateHtml($reg, $webinar);

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="TBCA-Certificate-'.$reg->reference.'.html"']);
    }

    public function resource(Request $request, Webinar $webinar, string $key): HttpResponse|RedirectResponse
    {
        $res = collect(R::resources())->firstWhere('key', $key);
        abort_unless($res, 404);
        if ($res['after_review'] && ! $webinar->replayAvailable()) {
            return back()->with('error', $res['title'].' are released after the replay passes W3 review.');
        }
        if ($key === 'links') {
            return redirect('/resources/library');
        }
        $reg = $this->registrationFor($request, $webinar);
        $reg?->increment('download_count');
        $body = implode("\n", [
            'THE BUSINESS CLINIC.AFRICA',
            strtoupper($res['title']),
            str_repeat('=', 60),
            $webinar->title,
            $webinar->starts_at->format('l, j F Y').' | '.$webinar->starts_at->format('H:i').' - '.$webinar->endsAt()->format('H:i').' SAST | '.$webinar->format,
            'Presenter: '.$webinar->speaker.' ('.$webinar->speaker_role.')',
            '',
            'AGENDA',
            ...array_map(fn ($a) => "  {$a[0]}  {$a[1]}: {$a[2]}", $webinar->detail('agenda', R::defaultAgenda())),
            '',
            'KEY LEARNING OUTCOMES',
            ...array_map(fn ($o) => "  - $o", $webinar->detail('outcomes', R::defaultOutcomes())),
            '',
            'PROFESSIONAL BOUNDARY',
            '  '.R::notices()['boundary']['body'],
            '',
            'Webinars support: consult@thebusinessclinic.africa',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.Str::slug($webinar->slug.'-'.$res['title']).'.txt"']);
    }

    public function calendar(Webinar $webinar): HttpResponse
    {
        $fmt = fn (Carbon $d) => $d->copy()->setTimezone('UTC')->format('Ymd\THis\Z');
        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Business Clinic.Africa//Webinars//EN', 'BEGIN:VEVENT',
            'UID:webinar-'.$webinar->id.'@thebusinessclinic.africa', 'DTSTAMP:'.$fmt(now()),
            'DTSTART:'.$fmt($webinar->starts_at->copy()->shiftTimezone('Africa/Johannesburg')), 'DTEND:'.$fmt($webinar->endsAt()->shiftTimezone('Africa/Johannesburg')),
            'SUMMARY:'.$webinar->title, 'DESCRIPTION:TBCA webinar with '.$webinar->speaker.'. Join link: '.route('webinars.live', $webinar),
            'LOCATION:'.$webinar->format, 'END:VEVENT', 'END:VCALENDAR',
        ]);

        return response($ics, 200, ['Content-Type' => 'text/calendar; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$webinar->slug.'.ics"']);
    }

    public function offers(Request $request, Webinar $webinar): Response
    {
        $this->visible($webinar, $request);

        return Inertia::render('Webinars/Offers', $this->frame($request, $webinar) + [
            'offers' => R::offers(),
            'groups' => collect(R::offerGroups())->map(fn ($g) => $g + ['count' => $g['key'] === 'recommended' ? 6 : collect(R::offers())->where('group', $g['key'])->count()])->all(),
            'promo' => ['code' => 'WEBINAR20', 'percent' => 20, 'days' => 7, 'validUntil' => $webinar->endsAt()->addDays(7)->format('j M Y'), 'active' => $webinar->endsAt()->addDays(7)->isFuture()],
        ]);
    }

    public function missed(Request $request, Webinar $webinar): Response
    {
        $this->visible($webinar, $request);

        return Inertia::render('Webinars/Missed', $this->frame($request, $webinar) + [
            'sequence' => R::followUpSequence(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Replay library and player                                           */
    /* ------------------------------------------------------------------ */

    public function replay(Request $request, Webinar $webinar): Response
    {
        $this->visible($webinar, $request);
        $tab = (string) $request->query('tab', 'all');
        $q = trim((string) $request->query('q', ''));
        $chapters = collect(P::detail($webinar)['chapters'])
            ->when($tab === 'full', fn ($c) => $c->take(0))
            ->when($tab === 'clips', fn ($c) => $c->filter(fn ($ch) => in_array($ch['n'], [1, 5, 7, 8], true)))
            ->when($q !== '', fn ($c) => $c->filter(fn ($ch) => Str::contains(Str::lower($ch['title']), Str::lower($q))))
            ->values();

        return Inertia::render('Webinars/ReplayLibrary', $this->frame($request, $webinar) + [
            'chapterList' => $chapters->all(),
            'replayFilters' => ['tab' => $tab, 'q' => $q],
            'statusNote' => $webinar->detail('edit_note') ?? $webinar->detail('correction') ?? $webinar->detail('withheld_note'),
            'shareUrl' => route('webinars.replay', $webinar),
        ]);
    }

    public function watch(Request $request, Webinar $webinar): Response|RedirectResponse
    {
        $this->visible($webinar, $request);
        if (! $webinar->replayAvailable()) {
            return redirect()->route('webinars.replay', $webinar)->with('error', 'This replay is not available. '.R::states()[$webinar->publicState()][0].'.');
        }
        $webinar->increment('views');
        $chapter = max(1, min(8, (int) $request->query('chapter', 1)));
        $watched = collect($request->session()->get('wb_watched.'.$webinar->id, []))->push($chapter)->unique()->values()->all();
        $request->session()->put('wb_watched.'.$webinar->id, $watched);
        $note = Note::where('webinar_id', $webinar->id)->whereIn('owner_key', $this->ownerKeys($request))->first();

        return Inertia::render('Webinars/Watch', $this->frame($request, $webinar) + [
            'chapter' => $chapter,
            'watched' => $watched,
            'note' => $note?->body ?? '',
            'takeaways' => R::keyTakeaways(),
            'statusNote' => $webinar->detail('edit_note') ?? $webinar->detail('correction'),
            'feedbackGiven' => (bool) $request->session()->get('wb_feedback.'.$webinar->id),
            'quizDone' => (bool) $request->session()->get('wb_quiz.'.$webinar->id),
        ]);
    }

    public function saveNotes(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        Note::updateOrCreate(['webinar_id' => $webinar->id, 'owner_key' => $this->ownerKeys($request)[0]], ['user_id' => $request->user()?->id, 'body' => $data['body']]);

        return back()->with('success', 'Your notes were saved.');
    }

    public function quiz(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['answers' => ['required', 'array', 'size:3'], 'answers.*' => ['required', 'integer']]);
        $correct = collect([1, 0, 2])->filter(fn ($a, $i) => (int) ($data['answers'][$i] ?? -1) === $a)->count();
        if ($correct < 2) {
            return back()->with('error', "You answered $correct of 3 correctly. Review the chapters and try again.");
        }
        $request->session()->put('wb_quiz.'.$webinar->id, true);
        $reg = $this->registrationFor($request, $webinar);
        if ($reg && $webinar->cpd && $request->session()->get('wb_feedback.'.$webinar->id)) {
            $reg->update(['certificate' => 'issued']);
        }

        return back()->with('success', "Quiz passed ($correct of 3). ".($webinar->cpd ? 'Complete the feedback form to receive your certificate.' : ''));
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /** @return Collection<int, Webinar> */
    private function catalogue(): Collection
    {
        return Webinar::whereIn('state', self::PUBLIC_STATES)->orderBy('starts_at')->get();
    }

    private function visible(Webinar $webinar, Request $request): void
    {
        abort_if($webinar->state === 'draft' && ! $request->user()?->isAdmin(), 404);
    }

    private function frame(Request $request, Webinar $webinar, ?WebinarRegistration $reg = null): array
    {
        $reg ??= $this->registrationFor($request, $webinar);

        return [
            'event' => P::detail($webinar),
            'registration' => P::registration($reg),
            'isStaff' => (bool) $request->user()?->isAdmin(),
            'notices' => R::notices(),
        ];
    }

    private function remember(Request $request, WebinarRegistration $reg): void
    {
        $map = $request->session()->get('wb_registrations', []);
        $map[$reg->webinar_id] = $reg->id;
        $request->session()->put('wb_registrations', $map);
    }

    private function registrationFor(Request $request, Webinar $webinar): ?WebinarRegistration
    {
        $q = WebinarRegistration::where('webinar_id', $webinar->id)->whereIn('status', ['registered', 'pending_payment']);
        if ($token = $request->query('token')) {
            $hit = (clone $q)->where('access_token', $token)->first();
            if ($hit) {
                $this->remember($request, $hit);

                return $hit;
            }
        }
        $id = $request->session()->get('wb_registrations', [])[$webinar->id] ?? null;
        if ($id && ($hit = (clone $q)->whereKey($id)->first())) {
            return $hit;
        }
        if ($user = $request->user()) {
            return (clone $q)->where(fn ($w) => $w->where('user_id', $user->id)->orWhere('email', Str::lower($user->email)))->first();
        }

        return null;
    }

    /** @return Collection<int, WebinarRegistration> */
    private function ownedRegistrations(Request $request): Collection
    {
        $ids = array_values($request->session()->get('wb_registrations', []));
        $user = $request->user();

        return WebinarRegistration::where('status', '!=', 'cancelled')
            ->where(function ($q) use ($ids, $user) {
                $q->whereIn('id', $ids ?: [0]);
                if ($user) {
                    $q->orWhere('user_id', $user->id)->orWhere('email', Str::lower($user->email));
                }
            })->latest()->get();
    }

    /** @return string[] */
    private function ownerKeys(Request $request): array
    {
        $keys = $request->user() ? ['user:'.$request->user()->id] : [];
        $keys[] = 'session:'.$this->visitorId($request);

        return $keys;
    }

    /** Stable per-visitor key kept in the session (survives session id regeneration at login). */
    private function visitorId(Request $request): string
    {
        $id = $request->session()->get('wb_visitor');
        if (! $id) {
            $id = (string) Str::uuid();
            $request->session()->put('wb_visitor', $id);
        }

        return $id;
    }

    private function voterKey(Request $request): string
    {
        return $request->user() ? 'user:'.$request->user()->id : 'session:'.$this->visitorId($request);
    }

    private function canParticipate(Request $request, Webinar $webinar): bool
    {
        return (bool) $request->user() || (bool) $this->registrationFor($request, $webinar);
    }

    private function assertParticipant(Request $request, Webinar $webinar): void
    {
        abort_unless($this->canParticipate($request, $webinar), 403, 'Register for this webinar or sign in to take part.');
    }

    private function participantName(Request $request, Webinar $webinar): string
    {
        return $this->registrationFor($request, $webinar)?->name ?? $request->user()?->name ?? 'Attendee';
    }

    private function questionRow(Question $q, bool $staff): array
    {
        return [
            'id' => $q->id, 'name' => $q->name, 'initials' => collect(explode(' ', $q->name))->map(fn ($p) => Str::substr($p, 0, 1))->take(2)->implode(''),
            'category' => $q->category, 'body' => $q->body, 'upvotes' => $q->upvotes, 'priority' => $q->priority, 'pinned' => $q->pinned,
            'status' => $q->status, 'at' => $q->asked_at->format('H:i'),
        ];
    }

    private function pollRow(Poll $p, ?int $myVote): array
    {
        $total = collect($p->options)->sum('votes');

        return [
            'id' => $p->id, 'question' => $p->question, 'status' => $p->status, 'total' => $total, 'myVote' => $myVote,
            'options' => collect($p->options)->map(fn ($o) => ['label' => $o['label'], 'votes' => $o['votes'], 'pct' => $total ? (int) round($o['votes'] / $total * 100) : 0])->all(),
        ];
    }

    private function certificateHtml(WebinarRegistration $r, Webinar $w): string
    {
        $e = fn ($s) => e($s);

        return '<!doctype html><html><head><meta charset="utf-8"><title>Certificate of Attendance</title><style>body{font-family:Georgia,serif;background:#faf6ef;margin:0;padding:40px}main{max-width:820px;margin:auto;border:6px double #d6a32e;background:#fff;padding:56px;text-align:center}h1{letter-spacing:.2em;font-size:28px;margin:0}h2{font-size:34px;margin:24px 0 8px}p{color:#33333c}small{color:#6b6b78}</style></head><body><main>'
            .'<p><small>THE BUSINESS CLINIC.AFRICA</small></p><h1>CERTIFICATE OF ATTENDANCE</h1><p>This certifies that</p><h2>'.$e($r->name).'</h2>'
            .'<p>attended the TBCA webinar</p><p><strong>'.$e($w->title).'</strong></p><p>'.$e($w->starts_at->format('j F Y')).' | '.$e($w->duration_minutes).' minutes'.($w->cpd ? ' | CPD eligible' : '').'</p>'
            .'<p><small>Reference '.$e($r->reference).'. Accreditation status is confirmed by the accrediting body; this certificate records attendance only.</small></p></main></body></html>';
    }
}
