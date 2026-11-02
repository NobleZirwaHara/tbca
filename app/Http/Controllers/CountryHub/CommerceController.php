<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\CountryState;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Inertia\Response;

/**
 * Commercial journey P27 to P34 (prototype pages-commerce.js): Quote, Waitlist, Engagement Letter,
 * Payment and Activation, Client Workspace, Deliverables, Change and Closure.
 *
 * The journey the prototype kept in localStorage (S.journey) lives in CountryState "journey" and the
 * waitlist entries in "waitlist"; each step posts here, the state is updated and the visitor moves on
 * to the next step. Payment is simulated as in the prototype: no gateway and no card details.
 */
class CommerceController extends Controller
{
    public const TIERS = ['Basic', 'Standard', 'Premium'];

    public const REQUEST_TYPES = ['Quote Only', 'Engagement', 'Information'];

    public const BUDGETS = ['Under R25,000', 'R25,000 – R100,000', 'R100,000 – R500,000', 'Over R500,000'];

    public const LEVELS = ['High', 'Medium', 'Low', 'Watchlist'];

    public const METHODS = ['Credit / Debit Card', 'Instant EFT', 'Bank Transfer (EFT)', 'Enterprise credit / invoice'];

    public const CHANGE_TYPES = ['Scope Change', 'Timeline Change', 'Deliverable Change', 'Tier Upgrade'];

    public const CLOSURES = ['Standard Closure', 'Conditional Closure', 'Pause Engagement', 'Transfer to Another Resolver'];

    private const STEPS = ['quote', 'letter', 'pay', 'workspace', 'deliverables', 'change', 'closure'];

    private const TITLES = [
        'letter' => 'Country Engagement Letter Review', 'pay' => 'Country Payment and Activation', 'workspace' => 'Client Workspace',
        'deliverables' => 'Country Deliverables and Evidence', 'change' => 'Country Change and Re-resolution', 'closure' => 'Country Closure and Next Route',
    ];

    /* ------------------------------------------------------------------ helpers */

    /** Date as the prototype shows it (en-GB: 02 Nov 2026, 15 Sept 2026). */
    public static function fmtD(Carbon|string|null $d = null): string
    {
        $d = $d instanceof Carbon ? $d : Carbon::parse($d ?? 'now');

        return str_replace(' Sep ', ' Sept ', $d->format('d M Y'));
    }

    private function href(array $c, string $key, string $q = ''): string
    {
        return '/countries/'.$c['slug'].'/'.$key.$q;
    }

    /** The visitor's journey (prototype S.journey). */
    private function journey(): array
    {
        $j = CountryState::get('journey', []);

        return is_array($j) ? $j : [];
    }

    private function save(array $j): void
    {
        CountryState::put('journey', $j);
    }

    /** The journey when it belongs to this country and its Sprint still resolves. */
    private function mine(array $c): ?array
    {
        $j = $this->journey();

        return ! empty($j['ref']) && ($j['iso'] ?? null) === $c['iso3'] && CountryHub::sprint((string) ($j['sprint'] ?? '')) ? $j : null;
    }

    /** The Sprint behind the journey with its tier fee (prototype tierPrice). */
    private function sprintFor(array $j): array
    {
        $s = CountryHub::sprint((string) $j['sprint']);

        return [
            'code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'entry' => $s['entry'], 'tiers' => (object) $s['tiers'],
            'fee' => CountryHub::tierPrice($s, $j['tier'] ?? null), 'premium' => $s['tiers']['Premium'] ?? null,
        ];
    }

    /** VAT as a whole percentage. */
    private function vatPct(array $c): int
    {
        return (int) round(CountryHub::vat($c) * 100);
    }

    /** Sample engagement (prototype sampleJourney). */
    private function sample(array $c): array
    {
        $all = CountryHub::sprints();
        $retainer = array_filter($all, fn ($s) => str_contains($s['name'], 'Market Entry Retainer Sprint') && $s['viable']);
        $entry = array_filter($all, fn ($s) => $s['topic'] === 'market-entry' && $s['viable']);
        $s = collect($retainer)->first(fn ($s) => CountryHub::priced($s)) ?? collect($entry)->first(fn ($s) => CountryHub::priced($s)) ?? reset($retainer) ?: reset($entry);
        abort_unless((bool) $s, 404);

        return [
            'iso' => $c['iso3'], 'ref' => 'QR-'.$c['iso3'].'-2026-0137', 'name' => 'Sample Client Contact', 'email' => 'contact@example.com',
            'org' => 'Kalahari AgriVentures (Pty) Ltd [sample]', 'sprint' => $s['code'], 'tier' => $s['entry'], 'type' => 'Engagement',
            'title' => 'Botswana market entry', 'scope' => 'Market entry for a horticulture and cold-chain business in Gaborone and Francistown.',
            'sector' => 'AGR', 'start' => '2026-11-02', 'created' => now()->toIso8601String(),
        ];
    }

    /* ------------------------------------------------------------------ pages */

    public function page(string $country, string $page): Response
    {
        $c = $this->country($country);
        $j = $this->journey();
        $common = ['j' => $j ?: null];

        if ($page === 'quote') {
            return $this->quote($c, $common);
        }
        if ($page === 'waitlist') {
            return $this->waitlist($c);
        }
        abort_unless(isset(self::TITLES[$page]), 404);
        $mine = $this->mine($c);
        if (! $mine) {
            return $this->countryPage($c, 'Commerce/NeedJourney', $common + ['pageKey' => $page, 'title' => self::TITLES[$page]]);
        }
        $props = $common + ['s' => $this->sprintFor($mine), 'vat' => $this->vatPct($c), 'today' => self::fmtD()];

        return match ($page) {
            'letter' => $this->countryPage($c, 'Commerce/Letter', $props),
            'pay' => $this->countryPage($c, 'Commerce/Pay', $props + ['methods' => self::METHODS]),
            'workspace' => $this->countryPage($c, 'Commerce/Workspace', $props + [
                'plan' => $this->plan($mine),
                'created' => self::fmtD($mine['created'] ?? null),
            ]),
            'deliverables' => $this->countryPage($c, 'Commerce/Deliverables', $props + $this->deliverables($c)),
            'change' => $this->countryPage($c, 'Commerce/Change', $props + ['types' => self::CHANGE_TYPES]),
            'closure' => $this->countryPage($c, 'Commerce/Closure', $props + ['closures' => self::CLOSURES]),
        };
    }

    /* P27 */
    private function quote(array $c, array $common): Response
    {
        $q = request()->query();
        $all = CountryHub::sprints();
        $pre = isset($q['sprint']) ? ($all[(string) $q['sprint']] ?? null) : null;
        $cat = isset($q['cat']) && isset(CountryHub::TOPICS[$q['cat']]) ? (string) $q['cat'] : ($pre['topic'] ?? 'market-entry');
        $options = array_slice(array_values(array_filter($all, fn ($s) => $s['topic'] === $cat && CountryHub::priced($s))), 0, 120);
        $opp = isset($q['opp']) ? collect(CountryHub::register('BW_Sweep'))->firstWhere('Opp ID', (string) $q['opp']) : null;
        $prem = isset($q['premium']) ? collect(CountryHub::register('BW_Premium'))->firstWhere('Code', (string) $q['premium']) : null;
        $tier = in_array($q['tier'] ?? null, self::TIERS, true) ? $q['tier'] : ($pre['entry'] ?? 'Basic');

        return $this->countryPage($c, 'Commerce/Quote', $common + [
            'cat' => $cat,
            'topics' => CountryHub::TOPICS,
            'sectors' => CountryHub::SECT,
            'options' => array_map(fn ($s) => ['code' => $s['code'], 'name' => $s['name'], 'ep' => $s['ep'], 'tiers' => (object) $s['tiers']], $options),
            'pre' => $pre && $pre['topic'] === $cat ? $pre['code'] : null,
            'tier' => in_array($tier, self::TIERS, true) ? $tier : 'Basic',
            'opp' => $opp ? ['id' => $opp['Opp ID'], 'name' => $opp['Opportunity'], 'sector' => $opp['Sector']] : null,
            'premium' => $prem ? ['code' => $prem['Code'], 'name' => $prem['Product']] : null,
            'units' => $c['isBW'] ? array_column(CountryHub::register('BW_Units'), 'Unit') : [],
            'vat' => $this->vatPct($c),
            'types' => self::REQUEST_TYPES,
            'budgets' => self::BUDGETS,
        ]);
    }

    /* P28 */
    private function waitlist(array $c): Response
    {
        $all = CountryHub::sprints();
        $pre = ($code = request()->query('sprint')) ? ($all[(string) $code] ?? null) : null;
        $unmet = [];
        foreach (CountryHub::TOPICS as $k => $l) {
            $unmet[] = ['label' => $l, 'n' => count(array_filter($all, fn ($s) => $s['topic'] === $k && ! $s['viable']))];
        }
        usort($unmet, fn ($a, $b) => $b['n'] <=> $a['n']);
        $svc = array_map(fn ($s) => $s['name'], array_slice(array_values(array_filter($all, fn ($s) => $s['viable'] && $s['pop'] === 'PUBLISHED')), 0, 60));
        if ($pre) {
            array_unshift($svc, $pre['name']);
        }
        $byUnit = null;
        if ($c['isBW']) {
            $byUnit = array_count_values(array_map(fn ($r) => (string) $r['Unit'], CountryHub::register('BW_Ranked_Leads')));
            arsort($byUnit);
            $byUnit = array_map(fn ($u, $n) => ['unit' => $u, 'n' => $n], array_keys(array_slice($byUnit, 0, 10, true)), array_slice($byUnit, 0, 10, true));
        }
        $mine = CountryState::get('waitlist', []);

        return $this->countryPage($c, 'Commerce/Waitlist', [
            'mine' => is_array($mine) ? $mine : [],
            'notSold' => count(array_filter($all, fn ($s) => ! $s['viable'])),
            'unmet' => $unmet,
            'services' => $svc,
            'sprint' => $pre['code'] ?? null,
            'byUnit' => $byUnit,
            'levels' => self::LEVELS,
        ]);
    }

    /** Workspace milestones from the start date (prototype plan). */
    private function plan(array $j): array
    {
        $st = Carbon::parse($j['start'] ?? '2026-11-02');
        $add = fn (int $d) => self::fmtD($st->copy()->addDays($d));
        $paid = ! empty($j['paid']);

        return [
            ['Engagement activated', $add(0), 'Completed'], ['Kick-off & scope confirmation', $add(3), $paid ? 'Completed' : 'Pending'],
            ['Evidence pull from country registers', $add(7), 'In Progress'], ['Draft deliverable', $add(14), 'Pending'],
            ['Human review (SME sign-off)', $add(18), 'Pending'], ['Final release + evidence pack', $add(21), 'Not Started'],
        ];
    }

    /* P32 */
    private function deliverables(array $c): array
    {
        if (! $c['isBW']) {
            return ['domains' => null, 'premiumStore' => null];
        }
        $groups = [];
        foreach (CountryHub::register('BW_Facts') as $f) {
            $groups[(string) $f['Sector name']][] = $f;
        }
        $domains = [];
        foreach ($groups as $d => $l) {
            $g3 = count(array_filter($l, fn ($x) => (string) $x['Grade'] === '3'));
            $domains[] = ['dom' => $d, 'n' => count($l), 'p' => (int) floor(100 * $g3 / count($l) + 0.5)];
        }

        return [
            'domains' => $domains,
            'premiumStore' => array_map(fn ($p) => ['code' => $p['Code'], 'name' => $p['Product'], 'contents' => $p['Contents']], array_slice(CountryHub::register('BW_Premium'), 0, 4)),
        ];
    }

    /* ------------------------------------------------------------------ actions */

    /** P27 submit (or load the sample engagement): records the quote request and opens the letter. */
    public function storeQuote(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $r = request();
        if ($r->boolean('sample')) {
            $next = in_array($r->input('next'), self::STEPS, true) ? $r->input('next') : 'letter';
            $this->save($this->sample($c));

            return redirect($this->href($c, $next));
        }

        $d = $r->validate([
            'fname' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'org' => ['nullable', 'string', 'max:190'],
            'coo' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
            'contact' => ['nullable', 'in:Email,WhatsApp,Phone'],
            'cat' => ['required', 'in:'.implode(',', array_keys(CountryHub::TOPICS))],
            'sprint' => ['nullable', 'string', 'max:40'],
            'tier' => ['required', 'in:'.implode(',', self::TIERS)],
            'type' => ['required', 'in:'.implode(',', self::REQUEST_TYPES)],
            'title' => ['nullable', 'string', 'max:200'],
            'sector' => ['nullable', 'in:'.implode(',', array_keys(CountryHub::SECT))],
            'region' => ['nullable', 'string', 'max:120'],
            'start' => ['nullable', 'date'],
            'budget' => ['nullable', 'string', 'max:60'],
            'scope' => ['nullable', 'string', 'max:1500'],
            'accurate' => ['accepted'],
            'privacy' => ['accepted'],
            'noEngagement' => ['accepted'],
        ]);

        $all = CountryHub::sprints();
        $s = ! empty($d['sprint']) && isset($all[$d['sprint']]) && CountryHub::priced($all[$d['sprint']]) ? $all[$d['sprint']] : null;
        $s ??= collect($all)->first(fn ($x) => $x['topic'] === $d['cat'] && CountryHub::priced($x));
        if (! $s) {
            return redirect($this->href($c, 'quote', '?cat='.$d['cat']))->with('error', 'No priced Sprint in this category yet. Join the waitlist instead.');
        }
        $j = [
            'iso' => $c['iso3'], 'ref' => 'QR-'.$c['iso3'].'-2026-'.(1000 + ((int) floor(microtime(true) * 1000) % 9000)),
            'name' => $d['fname'], 'email' => $d['email'], 'org' => $d['org'] ?? '', 'sprint' => $s['code'], 'tier' => $d['tier'], 'type' => $d['type'],
            'title' => ($d['title'] ?? '') !== '' ? $d['title'] : $s['name'], 'scope' => $d['scope'] ?? '', 'sector' => $d['sector'] ?? '',
            'start' => ! empty($d['start']) ? Carbon::parse($d['start'])->format('Y-m-d') : '2026-11-02', 'created' => now()->toIso8601String(),
        ];
        $this->save($j);

        return redirect($this->href($c, 'letter'))->with('success', "Quote request {$j['ref']} submitted · proposal prepared");
    }

    /** P28 submit: adds an unmet-demand entry. */
    public function storeWaitlist(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $d = request()->validate([
            'org' => ['required', 'string', 'max:190'],
            'svc' => ['required', 'string', 'max:300'],
            'lvl' => ['required', 'in:'.implode(',', self::LEVELS)],
            'sprint' => ['nullable', 'string', 'max:40'],
        ]);
        $list = CountryState::get('waitlist', []);
        $list = is_array($list) ? $list : [];
        array_unshift($list, ['iso' => $c['iso3'], 'country' => $c['name'], 'svc' => $d['svc'], 'lvl' => $d['lvl'], 'org' => $d['org'], 'd' => self::fmtD()]);
        CountryState::put('waitlist', array_slice($list, 0, 100));

        return redirect($this->href($c, 'waitlist', ! empty($d['sprint']) ? '?sprint='.urlencode($d['sprint']) : ''))
            ->with('success', "Added to the {$c['name']} waitlist · you will be notified when the service activates");
    }

    /** P29 approve: both acknowledgements, then on to payment. */
    public function signLetter(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $j = $this->mine($c);
        if (! $j) {
            return redirect($this->href($c, 'quote'))->with('error', 'Start with a quote.');
        }
        $r = request();
        if (! $r->boolean('boundary') || ! $r->boolean('fees')) {
            return redirect($this->href($c, 'letter'))->with('error', 'Please acknowledge the professional boundary and the fee schedule first.');
        }
        $j['letterOk'] = true;
        $j['elRef'] = 'EL-2026-'.substr($j['ref'], -4);
        $this->save($j);

        return redirect($this->href($c, 'pay'))->with('success', "Engagement Letter {$j['elRef']} approved · proceed to payment");
    }

    /** P30 simulated payment: letter approved, three authorisations, a method; then activation. */
    public function pay(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $j = $this->mine($c);
        if (! $j) {
            return redirect($this->href($c, 'quote'))->with('error', 'Start with a quote.');
        }
        if (empty($j['letterOk'])) {
            return redirect($this->href($c, 'letter'))->with('error', 'Approve the Engagement Letter first.');
        }
        if (! empty($j['paid'])) {
            return redirect($this->href($c, 'workspace'));
        }
        $r = request();
        if (! $r->boolean('collect') || ! $r->boolean('terms') || ! $r->boolean('verification')) {
            return redirect($this->href($c, 'pay'))->with('error', 'Please confirm all three authorisations.');
        }
        $method = $r->validate(['method' => ['required', 'in:'.implode(',', self::METHODS)]])['method'];
        $j['paid'] = true;
        $j['engRef'] = 'ENG-2026-'.substr($j['ref'], -4);
        $j['paidAt'] = now()->toIso8601String();
        $j['method'] = $method;
        $this->save($j);

        return redirect($this->href($c, 'workspace'))->with('success', "Engagement {$j['engRef']} activated");
    }

    /** P32 client acceptance of the deliverables (feeds the closure checklist). */
    public function acceptDeliverable(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $j = $this->mine($c);
        if (! $j) {
            return redirect($this->href($c, 'quote'))->with('error', 'Start with a quote.');
        }
        if (empty($j['paid'])) {
            return redirect($this->href($c, 'pay'))->with('error', 'Payment pending — the workspace is read-only until PV-1 passes.');
        }
        $j['accepted'] = self::fmtD();
        $this->save($j);

        return redirect($this->href($c, 'deliverables'))->with('success', 'Deliverables accepted');
    }

    /** P33 submit: logs a change request against the engagement. */
    public function storeChange(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $j = $this->mine($c);
        if (! $j) {
            return redirect($this->href($c, 'quote'))->with('error', 'Start with a quote.');
        }
        $d = request()->validate([
            'type' => ['required', 'in:'.implode(',', self::CHANGE_TYPES)],
            'reason' => ['required', 'string', 'max:1500'],
        ]);
        $crs = $j['crs'] ?? [];
        array_unshift($crs, ['id' => 'CR-2026-'.str_pad((string) (27 + count($crs)), 4, '0', STR_PAD_LEFT), 't' => $d['type'], 'r' => $d['reason'], 'd' => self::fmtD(), 's' => 'In Progress']);
        $j['crs'] = $crs;
        $this->save($j);

        return redirect($this->href($c, 'change'))->with('success', 'Change request submitted');
    }

    /** P34: initiate closure with the chosen route, or clear the journey and start again. */
    public function close(string $country): RedirectResponse
    {
        $c = $this->country($country);
        $d = request()->validate([
            'action' => ['required', 'in:initiate,reset'],
            'type' => ['required_if:action,initiate', 'nullable', 'in:'.implode(',', self::CLOSURES)],
        ]);
        if ($d['action'] === 'reset') {
            $this->save([]);

            return redirect('/countries')->with('success', 'Engagement cleared — start a new journey');
        }
        $j = $this->mine($c);
        if (! $j) {
            return redirect($this->href($c, 'quote'))->with('error', 'Start with a quote.');
        }
        $j['closure'] = ['type' => $d['type'], 'at' => self::fmtD()];
        $this->save($j);

        return redirect($this->href($c, 'closure'))->with('success', "Closure initiated: {$d['type']}");
    }
}
