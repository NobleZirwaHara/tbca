<?php

namespace App\Http\Controllers\Industries;

use App\Http\Controllers\Controller;
use App\Support\Industries\IndustryData as D;
use App\Support\Industries\IndustryState;
use App\Support\Industries\IndustryView;
use App\Support\Industries\Journey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Monetise-and-protect flow (prototype pages-ind-journey.js): product page P14 with the blocked
 * panel P12, mandatory add-ons P13, engagement set-up, gates P22, engagement letter P19, split
 * checkout P20 and the Industry Workspace P21 with partner route P23, specialist review P24,
 * compliance calendar P25, benchmark consent P26, fee ledger P17, abort ladder P18, verification
 * P15 and re-classification P16. Payment is simulated; no order or charge is created.
 */
class JourneyController extends Controller
{
    /* ------------------------------------------------------------------ P14 / P12 product */
    public function sprint(Request $request, string $industry, string $code): Response|RedirectResponse
    {
        $ind = IndustryController::resolve($industry, $request, '/sprint/'.rawurlencode($code));
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $base = IndustryView::base($ind);
        $res = collect(D::meta('reserved') ?? [])->firstWhere('code', $code);
        if ($res) {
            return Inertia::render('Industries/Blocked', $base + ['res' => $res]);
        }
        $s = D::sprint($code);
        if (! $s) {
            return redirect('/industries/'.$ind['slug'].'/services');
        }
        $b = D::blockFor($ind, $s);

        return Inertia::render('Industries/Product', $base + [
            's' => D::card($ind, $s) + ['prices' => $s['tiers'], 'up' => $s['up'], 'app' => $s['app'], 'familyName' => D::fams()[$s['fam']] ?? $s['fam']],
            'block' => $b[0] ?? null,
            'ack' => (bool) IndustryState::get('lim-'.$ind['code'].'-'.$s['code'], false),
        ]);
    }

    /* ------------------------------------------------------------------ P13 add-ons */
    public function addons(Request $request, string $industry, string $code): Response|RedirectResponse
    {
        $ind = IndustryController::resolve($industry, $request, '/sprint/'.rawurlencode($code).'/addons');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $s = D::sprint($code);
        if (! $s) {
            return redirect('/industries');
        }

        return Inertia::render('Industries/Addons', IndustryView::base($ind) + ['s' => D::card($ind, $s), 'addons' => D::addOns($ind)]);
    }

    /* ------------------------------------------------------------------ engagement set-up */
    private function options(array $ind): array
    {
        $opts = [];
        foreach (['TBCA-D-0604', 'TBCA-D-0451', 'TBCA-V-1252', 'TBCA-X-0491'] as $c) {
            if ($s = D::sprint($c)) {
                $opts[] = $s;
            }
        }
        $opts = array_merge($opts, D::pickSprints($ind, ['n' => 8]));
        $seen = [];

        return array_values(array_filter($opts, function ($s) use ($ind, &$seen) {
            if (isset($seen[$s['code']]) || ! $s['viable'] || ! D::priced($s) || D::blockFor($ind, $s)) {
                return false;
            }

            return $seen[$s['code']] = true;
        }));
    }

    public function engage(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = IndustryController::resolve($industry, $request, '/engage');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $opts = $this->options($ind);
        $pre = $request->query('sprint') ? D::sprint((string) $request->query('sprint')) : null;
        if ($pre && D::priced($pre) && ! D::blockFor($ind, $pre) && ! collect($opts)->contains('code', $pre['code'])) {
            array_unshift($opts, $pre);
        }
        $e = Journey::normalise(Journey::get());

        return Inertia::render('Industries/Engage', IndustryView::base($ind) + [
            'opts' => array_map(fn ($s) => ['code' => $s['code'], 'name' => $s['name'], 'tiers' => $s['tiers'], 'entry' => $s['entry']], $opts),
            'pre' => $pre && collect($opts)->contains('code', $pre['code']) ? $pre['code'] : ($opts[0]['code'] ?? null),
            'existing' => $e && ! $e['aborted'] ? $e['ref'] : null,
            'gates' => Journey::GATES,
        ]);
    }

    public function create(Request $request, string $industry): RedirectResponse
    {
        $ind = D::industry($industry);
        abort_unless($ind, 404);
        $data = $request->validate(['sprint' => 'required|string|max:40', 'tier' => 'required|in:Basic,Standard,Premium', 'sub' => 'nullable|string|max:12', 'iso' => 'required|string|max:3']);
        $s = D::sprint($data['sprint']);
        $c = D::country($data['iso']);
        abort_unless($s && $c && D::priced($s) && ! D::blockFor($ind, $s), 422);
        $tier = isset($s['tiers'][$data['tier']]) ? $data['tier'] : $s['entry'];
        $sub = D::sub($ind, $data['sub'] ?? null);
        IndustryState::setContext(['ind' => $ind['code'], 'iso' => $c['iso3'], 'sub' => $sub['code'] ?? '']);
        $e = Journey::create($ind, $sub, $c, $s, $tier);
        Journey::save($e);

        return redirect('/industries/engage/gates')->with('success', "Engagement {$e['ref']} created");
    }

    /* ------------------------------------------------------------------ shared payload */
    private function payload(?array $e): array
    {
        $ind = $e ? D::industry($e['ind']) : null;
        $base = IndustryView::base($ind);
        if (! $e) {
            return $base + ['e' => null];
        }
        $c = D::country($e['iso']);

        return $base + ['e' => $e, 'tt' => Journey::totals($e), 'country' => $c, 'subName' => D::sub($ind, $e['sub'])['name'] ?? null, 'gateList' => Journey::GATES];
    }

    private function eng(): ?array
    {
        return Journey::normalise(Journey::get());
    }

    public function gates(): Response
    {
        $e = $this->eng();

        return Inertia::render('Industries/Gates', $this->payload($e) + ['cur' => $e ? Journey::currentGate($e) : null]);
    }

    public function letter(): Response
    {
        return Inertia::render('Industries/Letter', $this->payload($this->eng()));
    }

    public function checkout(): Response
    {
        return Inertia::render('Industries/Checkout', $this->payload($this->eng()));
    }

    public function workspace(): Response
    {
        return Inertia::render('Industries/Workspace', $this->payload($this->eng()));
    }

    public function partner(): Response
    {
        $e = $this->eng();
        $extra = [];
        if ($e) {
            $ind = D::industry($e['ind']);
            $c = D::country($e['iso']);
            $regs = D::regulators($ind, $c);
            $extra = ['regulator' => $regs[0] ?? null, 'cats' => array_slice(array_merge(IndustryController::PCATS[$ind['code']] ?? [], IndustryController::PCAT_DEF), 0, 8)];
        }

        return Inertia::render('Industries/PartnerRoute', $this->payload($e) + $extra);
    }

    public function review(): Response
    {
        $e = $this->eng();
        $ind = $e ? D::industry($e['ind']) : null;

        return Inertia::render('Industries/Review', $this->payload($e) + ['disc' => $ind ? (Journey::DISC[$ind['code']] ?? [$ind['name'].' Economics', 'Market & Trade', 'Policy & Regulation']) : []]);
    }

    public function calendar(Request $request): Response
    {
        $e = $this->eng();

        return Inertia::render('Industries/Calendar', $this->payload($e) + ['ob' => $e ? Journey::obligations($e) : [], 'month' => preg_match('/^\d{4}-\d{2}$/', (string) $request->query('m')) ? $request->query('m') : now()->format('Y-m'), 'today' => now()->toDateString()]);
    }

    public function ics()
    {
        $e = $this->eng();
        abort_unless($e, 404);
        $lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TBCA//Industries//EN'];
        foreach (Journey::obligations($e) as $o) {
            array_push($lines, 'BEGIN:VEVENT', 'UID:'.md5($e['ref'].$o['name'].$o['due']).'@thebusinessclinic.africa', 'DTSTART;VALUE=DATE:'.str_replace('-', '', $o['due']), 'SUMMARY:'.$o['name'], 'DESCRIPTION:'.$o['body'], 'END:VEVENT');
        }
        $lines[] = 'END:VCALENDAR';

        return response(implode("\r\n", $lines), 200, ['Content-Type' => 'text/calendar; charset=utf-8', 'Content-Disposition' => 'attachment; filename="compliance-'.$e['ref'].'.ics"']);
    }

    public function benchmark(): Response
    {
        $e = $this->eng();
        $ctx = IndustryView::ctx();
        $ind = $e ? D::industry($e['ind']) : $ctx['ind'];
        $c = $e ? D::country($e['iso']) : $ctx['c'];

        return Inertia::render('Industries/BenchmarkConsent', $this->payload($e) + ['bind' => ['code' => $ind['code'], 'name' => $ind['name']], 'bcountry' => $c['name'], 'cur' => IndustryState::get('icons', [])[$ind['code']] ?? null]);
    }

    public function ledger(): Response
    {
        return Inertia::render('Industries/Ledger', $this->payload($this->eng()));
    }

    public function abort(): Response
    {
        return Inertia::render('Industries/Abort', $this->payload($this->eng()));
    }

    public function wsVerify(): Response
    {
        $e = $this->eng();
        $ind = $e ? D::industry($e['ind']) : IndustryView::ctx()['ind'];

        return Inertia::render('Industries/Verify', IndustryView::base($ind) + IndustryController::verifyData($ind) + ['inWorkspace' => true]);
    }

    public function wsReclass(): Response
    {
        $e = $this->eng();
        $ind = $e ? D::industry($e['ind']) : IndustryView::ctx()['ind'];

        return Inertia::render('Industries/Reclass', IndustryView::base($ind) + IndustryController::reclassData($ind) + ['inWorkspace' => true]);
    }

    public function start(): RedirectResponse
    {
        return redirect(Journey::get() ? '/industries/engage/gates' : '/industries/'.IndustryView::ctx()['ind']['slug'].'/engage');
    }

    /* ------------------------------------------------------------------ actions */
    public function act(Request $request): RedirectResponse
    {
        $do = (string) $request->input('do');
        if ($do === 'consent') {
            return $this->consent($request);
        }
        $e = $this->eng();
        if (! $e) {
            return redirect('/industries/workspace')->with('error', 'Start an engagement first.');
        }
        $now = now()->toIso8601String();
        $msg = null;
        $to = null;

        switch ($do) {
            case 'gate':
                $k = (string) $request->input('gate');
                if ($k !== Journey::currentGate($e)) {
                    return back()->with('error', 'Locked until the previous gate passes.');
                }
                if ($k === 'G1') {
                    $reg = $request->validate(['n' => 'required|string|max:120', 'o' => 'nullable|string|max:160', 'e' => 'required|email|max:160']);
                    $e['reg'] = ['n' => $reg['n'], 'o' => $reg['o'] ?? '', 'e' => $reg['e']];
                }
                if ($k === 'G4') {
                    return redirect('/industries/engage/checkout');
                }
                $e['gates'][$k] = $now;
                if ($k === 'G3') {
                    Journey::ledger($e, ['type' => 'CHARGE', 'led' => 'T', 'desc' => $e['name'].' · '.$e['tier'], 'amt' => Journey::totals($e)['total'], 'status' => 'Due']);
                    $to = '/industries/engage/letter';
                } else {
                    $msg = "{$k} passed · recorded to the audit trail";
                }
                break;
            case 'letter':
                $e['letter'] = $now;
                $msg = 'Engagement Letter accepted · proceeding to payment';
                $to = '/industries/engage/checkout';
                break;
            case 'splits':
                $e['splits'] = $this->splits($request);
                break;
            case 'pay':
                $tt = Journey::totals($e);
                $splits = $this->splits($request);
                if (abs(array_sum(array_column($splits, 'pct')) - 100) > 0.05 || $tt['out'] <= 0) {
                    return back()->with('error', 'The split must total 100 %.');
                }
                $e['splits'] = $splits;
                $left = $tt['out'];
                $last = array_key_last(array_filter($splits, fn ($s) => $s['pct'] > 0));
                foreach ($splits as $i => $s) {
                    if ($s['pct'] > 0) {
                        $amt = $i === $last ? $left : (int) round($tt['out'] * $s['pct'] / 100);
                        $left -= $amt;
                        $e['pays'][] = ['at' => $now, 'm' => $s['m'], 'who' => $s['who'], 'amt' => $amt];
                        Journey::ledger($e, ['type' => 'PAYMENT', 'led' => 'T', 'desc' => "Payment · {$s['m']} · {$s['who']}", 'amt' => $amt, 'status' => 'Completed']);
                    }
                }
                $e['gates']['G4'] = $now;
                $e['gates']['G3'] ??= $now;
                foreach ($e['addons'] as $a) {
                    Journey::ledger($e, $a['ledger'] === 'S'
                        ? ['type' => 'COMMITMENT', 'led' => 'S', 'desc' => "{$a['name']} (pass-through, on schedule)", 'amt' => 0, 'status' => 'Scheduled']
                        : ['type' => 'COMMITMENT', 'led' => $a['ledger'], 'desc' => "{$a['name']} (contracted with partner)", 'amt' => (int) ($a['fee'] ?? 0), 'status' => $a['fee'] ? 'Estimate' : 'Quote pending']);
                }
                $e['tasks'][0]['done'] = true;
                $msg = 'Payment simulated · entitlement activated · ledger updated';
                $to = '/industries/workspace';
                break;
            case 'task':
                foreach ($e['tasks'] as &$t) {
                    if ($t['id'] === $request->input('task') && ! empty($e['gates']['G4'])) {
                        $t['done'] = ! $t['done'];
                    }
                }
                unset($t);
                break;
            case 'advance':
                foreach ($e['tasks'] as $i => &$t) {
                    if ($i < 6) {
                        $t['done'] = true;
                    }
                }
                unset($t);
                $msg = 'TBCA analyst work advanced to draft report';
                break;
            case 'accept':
                if (count(array_filter($e['reviews'])) < 2) {
                    return redirect('/industries/workspace/review')->with('error', 'Two specialist sign-offs are required before acceptance (G7)');
                }
                $e['gates']['G5'] = $now;
                foreach ($e['tasks'] as &$t) {
                    $t['done'] = true;
                }
                unset($t);
                $msg = 'Report accepted · G5 passed';
                break;
            case 'escalate':
                $e['gates']['G6'] = $now;
                $msg = 'Human escalation opened · a TBCA lead responds within 1 business day (G6)';
                break;
            case 'partner':
                $cat = (string) $request->validate(['cat' => 'required|string|max:80'])['cat'];
                $e['partner'] = ['cat' => $cat, 'at' => $now];
                Journey::ledger($e, ['type' => 'COMMITMENT', 'led' => 'P', 'desc' => "Partner attached · {$cat}", 'amt' => 0, 'status' => 'Engagement letter with partner']);
                $msg = "Partner route attached · {$cat}";
                break;
            case 'sign':
                $d = (string) $request->validate(['discipline' => 'required|string|max:80'])['discipline'];
                $e['reviews'][$d] = $now;
                if (count(array_filter($e['reviews'])) >= 2) {
                    $e['gates']['G7'] ??= $now;
                }
                $msg = 'Specialist sign-off recorded (simulation)';
                break;
            case 'abort':
                $tt = Journey::totals($e);
                $done = count(array_filter($e['tasks'], fn ($t) => $t['done']));
                $forfeit = ! empty($e['gates']['G4']) ? (int) round($tt['paid'] * $done / max(1, count($e['tasks']))) : 0;
                $e['aborted'] = true;
                Journey::ledger($e, ['type' => 'ABORT', 'led' => 'T', 'desc' => 'Engagement aborted by client', 'amt' => 0, 'status' => 'Recorded']);
                if (! empty($e['gates']['G4']) && $tt['paid'] - $forfeit > 0) {
                    Journey::ledger($e, ['type' => 'REFUND', 'led' => 'T', 'desc' => 'Refund of uncompleted milestones (pro-rata)', 'amt' => $tt['paid'] - $forfeit, 'status' => 'Pending']);
                }
                $msg = 'Engagement aborted · refund (if any) shown in the ledger';
                $to = '/industries/workspace/ledger';
                break;
            default:
                abort(422);
        }
        Journey::save($e);

        return ($to ? redirect($to) : back())->with('success', $msg);
    }

    private function splits(Request $request): array
    {
        $rows = $request->validate(['splits' => 'required|array|min:1|max:5', 'splits.*.m' => 'required|string|max:60', 'splits.*.who' => 'required|string|max:120', 'splits.*.pct' => 'required|numeric|min:0|max:100'])['splits'];

        return array_values(array_map(fn ($s) => ['m' => $s['m'], 'who' => $s['who'], 'pct' => (float) $s['pct']], $rows));
    }

    private function consent(Request $request): RedirectResponse
    {
        $data = $request->validate(['ind' => 'required|string|max:8', 'choice' => 'required|in:yes,no,later']);
        $ind = D::industry($data['ind']);
        abort_unless($ind, 404);
        $icons = IndustryState::get('icons', []);
        $icons[$ind['code']] = $data['choice'];
        IndustryState::put('icons', $icons);
        $e = $this->eng();
        if ($e) {
            Journey::ledger($e, ['type' => 'CONSENT', 'led' => '—', 'desc' => 'Benchmark contribution: '.$data['choice'], 'amt' => 0, 'status' => 'Recorded']);
            Journey::save($e);
        }

        return back()->with('success', 'Choice recorded in the Contribution Consent Ledger');
    }

    /* ------------------------------------------------------------------ small per-visitor state */
    public function state(Request $request): RedirectResponse|HttpResponse
    {
        $data = $request->validate(['key' => ['required', 'string', 'max:60', 'regex:/^(diag-[A-Z]{3}|bm-[A-Z]{3}|lim-[A-Z]{3}-[A-Za-z0-9-]+|ver-[A-Z]{3}-[A-Z]{3}|rcn-[A-Z]{3}-[A-Z]{3})$/'], 'value' => 'nullable']);
        $value = $data['value'] ?? null;
        if (str_starts_with($data['key'], 'rcn-') && $value) {
            $value = now()->toIso8601String();
        }
        if (strlen((string) json_encode($value)) > 20000) {
            abort(422);
        }
        IndustryState::put($data['key'], $value);

        return $request->wantsJson() ? response()->noContent() : back();
    }

    public static function dayS(?string $d): string
    {
        return $d ? Carbon::parse($d)->format('d M Y') : '';
    }
}
