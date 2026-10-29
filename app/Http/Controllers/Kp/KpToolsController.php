<?php

namespace App\Http\Controllers\Kp;

use App\Http\Controllers\Controller;
use App\Models\Kp\KpAnswer;
use App\Models\Kp\KpRecord;
use App\Support\Content\KpThoughtLeadership as Kp;
use App\Support\Content\KpTools as T;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * KP Thought Leadership AI and decision tools (KP-SCR-018 to 031) and Future Builders
 * (KP-SCR-034 to 042).
 *
 * The KP Knowledge Assistant is grounded retrieval over the KP registers: it answers only
 * from approved knowledge entries, cites every source, abstains when evidence is missing,
 * routes regulated questions to a professional and never speaks as Kruger Phiri
 * (blueprint Part 8, TBCA-KP-031 to 039).
 */
class KpToolsController extends Controller
{
    private const REGULATED = ['tax return', 'legal advice', 'lawsuit', 'sue ', 'medical', 'should i invest', 'which shares', 'which stock', 'guarantee', 'loan approval', 'audit opinion'];

    public const PUBLIC_CORRECTION_STATES = ['Corrected', 'Updated', 'Under Review', 'No Change'];

    private const PERSONA = ['pretend to be kruger', 'as kruger', 'speak as kruger', 'kruger would say', 'what would kruger', 'write like kruger', 'in kruger\'s voice'];

    /* ------------------------------------------------------------------ */
    /* KP Knowledge Assistant (018, 019, 025, 026) */
    /* ------------------------------------------------------------------ */

    public function assistant(Request $request): Response
    {
        return $this->page('Kp/Assistant', '018', [
            'prefill' => Str::limit((string) $request->query('q', ''), 300, ''),
            'suggestions' => T::suggestions(),
            'recent' => KpAnswer::where('owner_key', $this->owner($request))->latest()->take(6)->get()->map(fn (KpAnswer $a) => ['reference' => $a->reference, 'question' => $a->question, 'status' => $a->status, 'when' => $a->created_at->diffForHumans()])->all(),
            'topics' => collect(Kp::themes())->map(fn ($t) => ['label' => $t['label'], 'href' => Kp::BASE.'/topics/'.$t['slug'], 'icon' => $t['icon']])->all(),
            'covered' => collect(T::knowledge())->map(fn ($k) => $k['question'])->values()->all(),
        ]);
    }

    public function ask(Request $request): RedirectResponse
    {
        $q = trim($request->validate(['question' => ['required', 'string', 'min:3', 'max:300']])['question']);
        $result = self::answerFor($q);
        $answer = KpAnswer::create([
            'reference' => 'KPA-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'question' => $q,
            'knowledge_key' => $result['key'],
            'topic' => $result['topic'],
            'status' => $result['status'],
            'confidence' => $result['confidence'],
            'answer' => $result['answer'],
            'sources' => $result['sources'],
            'context' => ['level' => null, 'asked' => now()->toIso8601String()],
            'owner_key' => $this->owner($request),
        ]);

        return redirect(Kp::BASE.'/ask/'.$answer->reference);
    }

    public function answer(Request $request, KpAnswer $answer): Response
    {
        return $this->page('Kp/Answer', '019', [
            'answer' => $this->answerProps($answer),
            'followUps' => collect(T::suggestions())->reject(fn ($s) => $s === $answer->question)->take(4)->values(),
            'levels' => collect(T::levels())->map(fn ($l, $k) => ['key' => (string) $k, 'label' => $l[0], 'body' => $l[1], 'icon' => $l[2]])->values(),
            'recent' => KpAnswer::where('owner_key', $this->owner($request))->latest()->take(5)->get()->map(fn (KpAnswer $a) => ['reference' => $a->reference, 'question' => $a->question, 'status' => $a->status])->all(),
        ]);
    }

    public function sources(KpAnswer $answer): Response
    {
        $src = collect($answer->sources ?? []);

        return $this->page('Kp/Sources', '025', [
            'answer' => $this->answerProps($answer),
            'breakdown' => [
                ['label' => 'Source relevance', 'value' => $src->isEmpty() ? 0 : 92, 'body' => 'Sources were matched to the question by the approved knowledge entry.'],
                ['label' => 'Evidence status', 'value' => (int) round($src->avg('weight') ?? 0), 'body' => 'Full texts score higher than titles or design excerpts.'],
                ['label' => 'Source freshness', 'value' => $src->isEmpty() ? 0 : (int) round($src->where('freshness', 'current')->count() / max(1, $src->count()) * 100), 'body' => 'Share of sources reviewed within 90 days.'],
                ['label' => 'Voice consistency', 'value' => $src->isEmpty() ? 0 : 100, 'body' => 'Every source carries a declared voice class.'],
            ],
            'freshness' => collect(Kp::freshness())->map(fn ($v, $k) => ['key' => $k, 'label' => $v[0], 'body' => $v[1]])->values(),
            'voices' => collect(Kp::voices())->map(fn ($v, $k) => ['code' => $k, 'label' => $v[0]])->values(),
        ]);
    }

    public function feedback(Request $request, KpAnswer $answer): RedirectResponse
    {
        $data = $request->validate(['rating' => ['required', Rule::in(['helpful', 'not-helpful', 'report'])], 'note' => ['nullable', 'string', 'max:500']]);
        $answer->update(['feedback' => $data['rating']]);
        if ($data['rating'] === 'report') {
            KpRecord::create(['kind' => 'correction', 'code' => 'COR-'.str_pad((string) (KpRecord::where('kind', 'correction')->count() + 21), 4, '0', STR_PAD_LEFT), 'title' => 'AI answer '.$answer->reference.': '.Str::limit($answer->question, 80), 'status' => 'Reported', 'sort' => 999, 'data' => ['type' => 'Reported issue', 'topic' => Kp::themeLabel((string) $answer->topic), 'note' => $data['note'] ?: 'Reported from the answer page.', 'by' => 'Visitor report', 'impact' => 'medium', 'date' => now()->format('j M Y')]]);

            return back()->with('success', 'Thank you. The answer has been sent to the corrections desk for human review.');
        }

        return back()->with('success', 'Thank you for your feedback.');
    }

    public function exportAnswer(KpAnswer $answer): HttpResponse
    {
        $a = $answer->answer ?? [];
        $lines = ['KP KNOWLEDGE ASSISTANT ANSWER', 'Reference: '.$answer->reference, 'Question: '.$answer->question, 'Status: '.Str::headline($answer->status).' | Confidence: '.$answer->confidence.'%', str_repeat('=', 60), $a['intro'] ?? ''];
        foreach ($a['points'] ?? [] as $i => $p) {
            $lines[] = ($i + 1).'. '.$p['title'].': '.$p['line'];
        }
        $lines[] = $a['close'] ?? '';
        $lines[] = '';
        $lines[] = 'Sources:';
        foreach ($answer->sources ?? [] as $s) {
            $lines[] = '['.$s['n'].'] '.$s['title'].' ('.$s['typeLabel'].', Voice '.$s['voice'].', '.$s['evidence'].')';
        }
        $lines[] = '';
        $lines[] = 'Voice A: AI-generated from the KP knowledge register. It is not Kruger Phiri speaking. General information only, not professional advice.';

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$answer->reference.'.txt"']);
    }

    /** Grounded answer: knowledge match, abstention or professional routing. */
    public static function answerFor(string $q): array
    {
        $lq = Str::lower($q);
        $related = KpController::searchAll($q)->take(4)->map(fn ($r) => ['title' => $r['title'], 'href' => $r['href'], 'kind' => $r['kind']])->values()->all();

        if (Str::contains($lq, self::PERSONA)) {
            return ['key' => null, 'topic' => null, 'status' => 'declined', 'confidence' => 0, 'sources' => [], 'answer' => [
                'intro' => 'The assistant cannot speak as Kruger Phiri or imitate his voice. It only explains published KP and TBCA material, labelled as AI (Voice A).',
                'points' => [], 'close' => "Read Kruger's own notes in Founder's Notes, or request a session with him.", 'related' => $related,
                'route' => ['Read Founder\'s Notes', Kp::BASE.'/founders-notes'],
            ]];
        }
        if (Str::contains($lq, self::REGULATED)) {
            return ['key' => null, 'topic' => null, 'status' => 'routed', 'confidence' => 0, 'sources' => [], 'answer' => [
                'intro' => 'This question needs a qualified professional. The assistant gives general information only and does not give legal, tax, medical or investment advice.',
                'points' => [], 'close' => 'A TBCA adviser can route you to the right qualified professional.', 'related' => $related,
                'route' => ['Ask a TBCA adviser', '/contact'],
            ]];
        }

        $best = null;
        $bestScore = 0;
        foreach (T::knowledge() as $key => $k) {
            $score = 0;
            foreach ($k['keywords'] as $w) {
                $score += Str::contains($lq, $w) ? 1 : 0;
            }
            if (Str::lower($k['question']) === $lq) {
                $score += 5;
            }
            if ($score > $bestScore) {
                [$best, $bestScore] = [$key, $score];
            }
        }

        if (! $best) {
            return ['key' => null, 'topic' => null, 'status' => 'abstained', 'confidence' => 0, 'sources' => [], 'answer' => [
                'intro' => 'There is not enough approved evidence in the KP knowledge register to answer this question reliably, so the assistant will not guess.',
                'points' => [], 'close' => $related ? 'These published items are the closest matches. They may help while the topic is added.' : 'Try a related question, or ask a TBCA adviser.',
                'related' => $related, 'route' => ['Ask a TBCA adviser', '/contact'],
            ]];
        }

        $k = T::knowledge()[$best];
        $sources = collect($k['sources'])->values()->map(function ($slug, $i) {
            $item = Kp::find($slug);
            if ($item) {
                $weight = ['published' => 95, 'excerpt' => 80, 'pending' => 55][$item['status']] ?? 50;

                return ['n' => $i + 1, 'slug' => $slug, 'title' => $item['title'], 'typeLabel' => Kp::types()[$item['type']][0] ?? 'Article', 'voice' => $item['voice'], 'voiceLabel' => Kp::voices()[$item['voice']][0], 'freshness' => $item['freshness'], 'author' => $item['author'], 'scope' => $item['scope'],
                    'evidence' => ['published' => 'Full text published', 'excerpt' => 'Excerpt from KP design', 'pending' => 'Title and summary only'][$item['status']] ?? 'Unknown', 'weight' => $weight, 'href' => $item['href'], 'role' => $i === 0 ? 'Primary' : 'Supporting'];
            }
            $r = collect(Kp::resources())->firstWhere(0, $slug);

            return ['n' => $i + 1, 'slug' => $slug, 'title' => $r[1] ?? $slug, 'typeLabel' => Kp::resourceCategories()[$r[2] ?? ''] ?? 'Resource', 'voice' => 'I', 'voiceLabel' => Kp::voices()['I'][0], 'freshness' => 'current', 'author' => 'The Business Clinic.Africa', 'scope' => 'AFR-G0',
                'evidence' => 'Summary sheet', 'weight' => 65, 'href' => Kp::BASE.'/resources?q='.urlencode($r[1] ?? $slug), 'role' => 'Supporting'];
        })->all();

        return ['key' => $best, 'topic' => $k['topic'], 'status' => 'answered', 'confidence' => (int) round(collect($sources)->avg('weight')), 'sources' => $sources, 'answer' => [
            'intro' => $k['intro'],
            'points' => array_map(fn ($p) => ['title' => $p[0], 'line' => $p[1], 'detail' => $p[2], 'icon' => $p[3]], $k['points']),
            'close' => $k['close'], 'related' => $related, 'route' => null, 'hasLevels' => $k['levels'] !== [],
        ]];
    }

    private function answerProps(KpAnswer $a): array
    {
        $c = $a->confidence;

        return [
            'reference' => $a->reference, 'question' => $a->question, 'status' => $a->status, 'confidence' => $c,
            'confidenceLabel' => $c >= 75 ? 'High' : ($c >= 55 ? 'Medium' : ($c > 0 ? 'Low' : 'Not rated')),
            'topic' => $a->topic ? Kp::themeLabel($a->topic) : null, 'knowledgeKey' => $a->knowledge_key,
            'answer' => $a->answer, 'sources' => $a->sources ?? [], 'feedback' => $a->feedback, 'asked' => $a->created_at->format('j M Y, H:i'),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Explain It at My Level (020) */
    /* ------------------------------------------------------------------ */

    public function explain(Request $request): Response
    {
        $levels = T::levels();
        $level = array_key_exists((string) $request->query('level'), $levels) ? (string) $request->query('level') : 'student';
        $withLevels = collect(T::knowledge())->filter(fn ($k) => $k['levels'] !== []);
        $key = $withLevels->has((string) $request->query('topic')) ? (string) $request->query('topic') : $withLevels->keys()->first();
        $k = T::knowledge()[$key];
        $rows = $k['levels'][$level] ?? [];

        return $this->page('Kp/Explain', '020', [
            'level' => $level,
            'topic' => $key,
            'question' => $k['question'],
            'topics' => $withLevels->map(fn ($x, $kk) => ['key' => $kk, 'label' => $x['question']])->values(),
            'levels' => collect($levels)->map(fn ($l, $kk) => ['key' => (string) $kk, 'label' => $l[0], 'body' => $l[1], 'icon' => $l[2]])->values(),
            'points' => collect($k['points'])->values()->map(fn ($p, $i) => ['title' => $p[0], 'icon' => $p[3], 'line' => $rows[$i][0] ?? $p[1], 'example' => $rows[$i][1] ?? null])->all(),
            'intro' => $level === '12' ? 'Turning a plan into real results needs five things working together.' : $k['intro'],
            'close' => $k['close'],
            'sources' => collect($k['sources'])->map(fn ($s) => collect(Kp::items())->firstWhere('slug', $s))->filter()->map(fn ($i) => ['title' => $i['title'], 'href' => $i['href']])->values(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Boardroom Challenger (021) */
    /* ------------------------------------------------------------------ */

    public const EVIDENCE = [
        'financial-model' => 'Financial model with downside case',
        'market-evidence' => 'Market or customer evidence',
        'risk-register' => 'Risk register with owners',
        'funding' => 'Funding or budget confirmed',
        'stakeholders' => 'Key stakeholders consulted',
        'legal' => 'Legal and regulatory review',
    ];

    public function challenger(Request $request): Response
    {
        $in = $request->validate([
            'decision' => ['nullable', 'string', 'max:300'],
            'rationale' => ['nullable', 'string', 'max:1000'],
            'options' => ['nullable', 'string', 'max:1000'],
            'amount' => ['nullable', 'integer', 'min:0', 'max:100000000000'],
            'horizon' => ['nullable', 'integer', 'min:1', 'max:240'],
            'reversibility' => ['nullable', Rule::in(['reversible', 'costly', 'irreversible'])],
            'evidence' => ['nullable', 'array'], 'evidence.*' => [Rule::in(array_keys(self::EVIDENCE))],
        ]);
        $result = filled($in['decision'] ?? null) ? self::buildChallenge($in) : null;

        return $this->page('Kp/Challenger', '021', [
            'input' => ['decision' => $in['decision'] ?? '', 'rationale' => $in['rationale'] ?? '', 'options' => $in['options'] ?? '', 'amount' => $in['amount'] ?? null, 'horizon' => $in['horizon'] ?? 12, 'reversibility' => $in['reversibility'] ?? 'costly', 'evidence' => $in['evidence'] ?? []],
            'evidenceOptions' => collect(self::EVIDENCE)->map(fn ($l, $k) => ['key' => $k, 'label' => $l])->values(),
            'result' => $result,
        ]);
    }

    public static function buildChallenge(array $in): array
    {
        $ev = $in['evidence'] ?? [];
        $options = array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) ($in['options'] ?? '')) ?: [])));
        $amount = (int) ($in['amount'] ?? 0);
        $c = [];
        $add = function (string $area, string $sev, string $q, string $why) use (&$c): void {
            $c[] = compact('area', 'sev', 'q', 'why');
        };

        $add('Strategy', 'medium', 'Which strategic outcome does this decision serve, and how will the board know in '.($in['horizon'] ?? 12).' months that it worked?', 'Decisions without a measurable outcome cannot be reviewed.');
        if (count($options) < 2) {
            $add('Strategy', 'high', 'Only one option is on the table. Which alternatives, including doing nothing, were considered and rejected?', 'Boards should compare real options, not approve a single proposal.');
        }
        if (blank($in['rationale'] ?? null)) {
            $add('Strategy', 'medium', 'Why now? What changes if the decision waits one quarter?', 'No rationale was given.');
        }
        if (! in_array('financial-model', $ev, true)) {
            $add('Numbers', 'high', 'Where is the financial model, and what does the downside case look like?', 'No financial model is listed in the evidence.');
        }
        if ($amount >= 10000000) {
            $add('Numbers', 'high', 'The amount is material. What is the maximum loss if the main assumption fails, and can the business absorb it?', 'Material commitments need a stated maximum loss.');
        } elseif ($amount > 0) {
            $add('Numbers', 'medium', 'Which two assumptions drive the return, and what happens if each is 20 percent worse?', 'Sensitivity testing shows how fragile the case is.');
        }
        if (! in_array('funding', $ev, true)) {
            $add('Numbers', 'medium', 'Is the funding committed, and what happens to the plan if it arrives late?', 'Funding is not confirmed.');
        }
        if (! in_array('risk-register', $ev, true)) {
            $add('Risks', 'high', 'What are the top three risks, who owns each one, and what is the mitigation?', 'No risk register is listed.');
        }
        if (($in['reversibility'] ?? 'costly') === 'irreversible') {
            $add('Risks', 'high', 'This decision is hard to reverse. Which stage gate or pilot could reduce the commitment before it is final?', 'Irreversible decisions need staged commitment where possible.');
        }
        if (! in_array('market-evidence', $ev, true)) {
            $add('Evidence', 'medium', 'What evidence shows that customers or users want this, beyond management belief?', 'No market evidence is listed.');
        }
        if (! in_array('stakeholders', $ev, true)) {
            $add('Governance', 'medium', 'Which stakeholders are affected, and have they been consulted?', 'Stakeholder consultation is not confirmed.');
        }
        if (! in_array('legal', $ev, true)) {
            $add('Governance', 'medium', 'Has a legal and regulatory review been done, and are there licences or approvals still outstanding?', 'No legal review is listed.');
        }
        $add('Governance', 'low', 'Has every director declared any conflict of interest in this decision?', 'Conflicts must be declared before a vote.');

        $high = collect($c)->where('sev', 'high')->count();
        $readiness = (int) round(count($ev) / count(self::EVIDENCE) * 100);

        return [
            'challenges' => $c,
            'missing' => collect(self::EVIDENCE)->except($ev)->values()->all(),
            'readiness' => $readiness,
            'verdict' => $high >= 3 ? 'Not ready for a board decision' : ($high > 0 ? 'Ready with conditions' : 'Ready for board discussion'),
            'tone' => $high >= 3 ? 'red' : ($high > 0 ? 'orange' : 'green'),
            'options' => $options,
            'boardQuestions' => collect($c)->sortBy(fn ($x) => ['high' => 0, 'medium' => 1, 'low' => 2][$x['sev']])->take(5)->pluck('q')->values()->all(),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Funder Readiness Interviewer (022) */
    /* ------------------------------------------------------------------ */

    public function funder(Request $request): Response
    {
        $rec = KpRecord::where('kind', 'funder_interview')->where('data->owner', $this->owner($request))->first();
        $answers = $rec->data['answers'] ?? [];
        $qs = T::funderQuestions();

        return $this->page('Kp/Funder', '022', [
            'questions' => collect($qs)->map(fn ($q, $i) => ['n' => $i + 1, 'category' => $q[0], 'question' => $q[1], 'tip' => $q[2]])->all(),
            'answers' => (object) $answers,
            'summary' => self::funderSummary($qs, $answers),
            'saved' => $rec?->updated_at?->diffForHumans(),
            'profile' => (object) ($rec->data['profile'] ?? []),
            'industries' => self::INDUSTRIES,
        ]);
    }

    public function saveFunder(Request $request): RedirectResponse
    {
        $count = count(T::funderQuestions());
        $data = $request->validate(['answers' => ['present', 'array'], 'answers.*' => ['nullable', 'string', 'max:2000'], 'profile' => ['nullable', 'array'], 'profile.goal' => ['nullable', 'string', 'max:80'], 'profile.industry' => ['nullable', 'string', 'max:80'], 'profile.stage' => ['nullable', 'string', 'max:80']]);
        $answers = collect($data['answers'])->filter(fn ($v, $k) => is_numeric($k) && (int) $k >= 1 && (int) $k <= $count && filled($v))->mapWithKeys(fn ($v, $k) => [(string) (int) $k => $v])->all();
        $owner = $this->owner($request);
        $rec = KpRecord::firstOrNew(['kind' => 'funder_interview', 'code' => 'FRI-'.substr(md5($owner), 0, 8)]);
        $rec->fill(['title' => 'Funder readiness interview', 'status' => count($answers) === $count ? 'Complete' : 'In progress', 'data' => ['owner' => $owner, 'answers' => $answers, 'profile' => $data['profile'] ?? []]])->save();

        return back()->with('success', 'Progress saved: '.count($answers).' of '.$count.' questions answered.');
    }

    public static function funderSummary(array $qs, array $answers): array
    {
        return collect($qs)->map(fn ($q, $i) => [$q[0], $answers[(string) ($i + 1)] ?? ''])->groupBy(0)->map(fn ($rows, $cat) => [
            'category' => $cat,
            'total' => $rows->count(),
            'answered' => $rows->filter(fn ($r) => filled($r[1]))->count(),
            'strong' => $rows->filter(fn ($r) => Str::length($r[1]) >= 80)->count(),
        ])->values()->all();
    }

    /* ------------------------------------------------------------------ */
    /* Project Fatal-Flaw Explorer (023) */
    /* ------------------------------------------------------------------ */

    public const INDUSTRIES = ['Agriculture', 'Energy', 'Financial Services', 'Fintech', 'Healthcare', 'Manufacturing', 'Mining', 'Property', 'Retail', 'Technology', 'Tourism', 'Transport & Logistics'];

    public function fatalFlaw(Request $request): Response
    {
        $in = $request->validate([
            'name' => ['nullable', 'string', 'max:160'],
            'industry' => ['nullable', Rule::in(self::INDUSTRIES)],
            'type' => ['nullable', Rule::in(T::projectTypes())],
            'stage' => ['nullable', Rule::in(T::projectStages())],
            'band' => ['nullable', Rule::in(array_column(T::investmentBands(), 0))],
            'location' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1500'],
        ]);
        $ran = filled($in['industry'] ?? null) && filled($in['type'] ?? null) && filled($in['stage'] ?? null);

        return $this->page('Kp/FatalFlaw', '023', [
            'input' => ['name' => $in['name'] ?? '', 'industry' => $in['industry'] ?? '', 'type' => $in['type'] ?? '', 'stage' => $in['stage'] ?? '', 'band' => $in['band'] ?? '', 'location' => $in['location'] ?? '', 'description' => $in['description'] ?? ''],
            'industries' => self::INDUSTRIES,
            'types' => T::projectTypes(),
            'stages' => T::projectStages(),
            'bands' => array_map(fn ($b) => ['key' => $b[0], 'label' => $b[1], 'zar' => $b[2]], T::investmentBands()),
            'result' => $ran ? self::flaws($in) : null,
        ]);
    }

    public static function flaws(array $in): array
    {
        $desc = Str::lower((string) ($in['description'] ?? '').' '.($in['name'] ?? ''));
        $hits = [];
        foreach (T::flawRules() as [$id, $title, $sev, $impact, $likelihood, $why, $guide, $t]) {
            $match = in_array($in['industry'] ?? '', $t['industries'] ?? [], true)
                || in_array($in['type'] ?? '', $t['types'] ?? [], true)
                || (in_array($in['stage'] ?? '', $t['stages'] ?? [], true) && (! isset($t['bands']) || in_array($in['band'] ?? '', $t['bands'], true)))
                || (isset($t['keywords']) && Str::contains($desc, $t['keywords']));
            if ($match) {
                $hits[] = compact('id', 'title', 'sev', 'impact', 'likelihood', 'why', 'guide');
            }
        }
        $score = min(100, collect($hits)->sum(fn ($h) => ['critical' => 30, 'high' => 18, 'medium' => 9][$h['sev']]));

        return [
            'flaws' => collect($hits)->sortBy(fn ($h) => ['critical' => 0, 'high' => 1, 'medium' => 2][$h['sev']])->values()->all(),
            'score' => $score,
            'label' => $score >= 70 ? 'High risk' : ($score >= 40 ? 'Elevated risk' : 'Moderate risk'),
            'counts' => ['critical' => collect($hits)->where('sev', 'critical')->count(), 'high' => collect($hits)->where('sev', 'high')->count(), 'medium' => collect($hits)->where('sev', 'medium')->count()],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Decision Sheet (024) */
    /* ------------------------------------------------------------------ */

    public const SHEET_FIELDS = [
        'what' => ['What is the decision?', 'What are we deciding?'],
        'why' => ['Why is this decision needed?', 'What problem or opportunity does this address?'],
        'options' => ['Options considered', 'List the options or alternatives evaluated.'],
        'recommended' => ['Recommended option', 'Which option is recommended and why?'],
        'assumptions' => ['Key assumptions', 'List the key assumptions behind this decision.'],
        'outcomes' => ['Expected outcomes', 'What outcomes do we expect if we implement this decision?'],
        'risks' => ['Risks & mitigations', 'What are the main risks and how will we mitigate them?'],
        'resources' => ['Resources required', 'People, budget, time, tools or partners required.'],
        'kpi' => ['Success measure (KPI)', 'How will we know this decision was successful?'],
    ];

    public const SHEET_IMPACTS = ['Strategy & Growth', 'Operations / Execution', 'Finance & Value', 'Risk & Compliance', 'People & Culture', 'Customer / Market', 'Other'];

    public function decisionSheet(Request $request): Response
    {
        $owner = $this->owner($request);
        $mine = KpRecord::where('kind', 'decision_sheet')->where('data->owner', $owner)->latest()->get();
        $current = $request->query('code') ? $mine->firstWhere('code', $request->query('code')) : null;

        return $this->page('Kp/DecisionSheet', '024', [
            'sheet' => $current ? ['code' => $current->code, 'status' => $current->status] + collect($current->data)->except('owner')->all() : null,
            'sheets' => $mine->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'status' => $r->status, 'updated' => $r->updated_at->format('j M Y')])->all(),
            'statuses' => ['Draft', 'For Review', 'Decided', 'Deferred'],
            'fields' => collect(self::SHEET_FIELDS)->map(fn ($f, $k) => ['key' => $k, 'label' => $f[0], 'hint' => $f[1]])->values(),
            'impacts' => self::SHEET_IMPACTS,
            'topics' => collect(Kp::themes())->map(fn ($t) => ['value' => $t['slug'], 'label' => $t['label']])->all(),
            'today' => now()->toDateString(),
        ]);
    }

    public function saveDecisionSheet(Request $request): RedirectResponse
    {
        $rules = [
            'code' => ['nullable', 'string', 'max:20'],
            'title' => ['required', 'string', 'max:200'],
            'topic' => ['nullable', Rule::in(array_column(Kp::themes(), 'slug'))],
            'date' => ['nullable', 'date'],
            'owner_name' => ['nullable', 'string', 'max:120'],
            'approver' => ['nullable', 'string', 'max:120'],
            'summary' => ['required', 'string', 'min:10', 'max:500'],
            'impacts' => ['present', 'array'], 'impacts.*' => [Rule::in(self::SHEET_IMPACTS)],
            'status' => ['required', Rule::in(['Draft', 'For Review', 'Decided', 'Deferred'])],
        ];
        foreach (array_keys(self::SHEET_FIELDS) as $k) {
            $rules[$k] = ['nullable', 'string', 'max:1000'];
        }
        $data = $request->validate($rules);
        $owner = $this->owner($request);
        $rec = filled($data['code'] ?? null) ? KpRecord::where('kind', 'decision_sheet')->where('code', $data['code'])->where('data->owner', $owner)->first() : null;
        $rec ??= new KpRecord(['kind' => 'decision_sheet', 'code' => 'DS-'.(1000 + KpRecord::where('kind', 'decision_sheet')->count() + 1)]);
        $rec->fill(['title' => $data['title'], 'status' => $data['status'], 'data' => collect($data)->except(['code', 'status'])->all() + ['owner' => $owner]])->save();

        return redirect(Kp::BASE.'/decision-sheet?code='.$rec->code)->with('success', 'Decision sheet '.$rec->code.' saved.');
    }

    public function exportDecisionSheet(Request $request, string $code): HttpResponse
    {
        $r = KpRecord::where('kind', 'decision_sheet')->where('code', $code)->where('data->owner', $this->owner($request))->firstOrFail();
        $d = $r->data;
        $lines = ['DECISION SHEET '.$r->code, $r->title, 'Status: '.$r->status.' | Date: '.($d['date'] ?? '').' | Owner: '.($d['owner_name'] ?? '').' | Approver: '.($d['approver'] ?? ''), str_repeat('=', 60), 'Decision summary:', $d['summary'], '', 'Impact areas: '.implode(', ', $d['impacts'] ?? [])];
        foreach (self::SHEET_FIELDS as $k => [$label]) {
            $lines[] = '';
            $lines[] = $label.':';
            $lines[] = (string) ($d[$k] ?? '');
        }
        array_push($lines, '', 'Working draft created with the KP Decision Sheet. It is not a board resolution or professional advice.');

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$r->code.'.txt"']);
    }

    /* ------------------------------------------------------------------ */
    /* Corrections (026) */
    /* ------------------------------------------------------------------ */

    public function corrections(Request $request): Response
    {
        $public = KpRecord::where('kind', 'correction')->whereIn('status', self::PUBLIC_CORRECTION_STATES)->orderBy('sort')->get();
        $type = (string) $request->query('type', '');
        $q = Str::lower(trim((string) $request->query('q', '')));
        $rows = $public->when($type !== '', fn ($c) => $c->filter(fn ($r) => $r->data['type'] === $type))->when($q !== '', fn ($c) => $c->filter(fn ($r) => Str::contains(Str::lower($r->title.' '.$r->data['topic'].' '.$r->data['note']), $q)))->values();

        return $this->page('Kp/Corrections', '026', [
            'rows' => $rows->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'status' => $r->status] + $r->data)->all(),
            'types' => $public->pluck('data.type')->unique()->values(),
            'filters' => ['type' => $type, 'q' => $q],
            'stats' => ['total' => $public->count(), 'corrected' => $public->where('status', 'Corrected')->count(), 'updated' => $public->where('status', 'Updated')->count(), 'review' => $public->where('status', 'Under Review')->count(), 'nochange' => $public->where('status', 'No Change')->count()],
        ]);
    }

    public function reportCorrection(Request $request): RedirectResponse
    {
        $data = $request->validate(['content' => ['required', 'string', 'max:200'], 'issue' => ['required', 'string', 'min:20', 'max:1000'], 'email' => ['nullable', 'email', 'max:190']]);
        $code = 'COR-'.str_pad((string) (KpRecord::where('kind', 'correction')->count() + 21), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'correction', 'code' => $code, 'title' => $data['content'], 'status' => 'Reported', 'sort' => 999, 'data' => ['type' => 'Reported issue', 'topic' => 'Visitor report', 'note' => $data['issue'], 'by' => 'Visitor report', 'impact' => 'medium', 'date' => now()->format('j M Y'), 'email' => $data['email'] ?? null]]);

        return back()->with('success', "Report $code received. The corrections desk reviews every report; material corrections are published here.");
    }

    /* ------------------------------------------------------------------ */
    /* Insight Action Pack (027) */
    /* ------------------------------------------------------------------ */

    public function actionPack(Request $request, string $slug): Response
    {
        $item = Kp::find($slug);
        abort_unless($item, 404);

        return $this->page('Kp/ActionPack', '027', [
            'insight' => KpController::card($item) + ['excerpt' => null],
            'actions' => collect(T::actionPack())->map(fn ($a, $i) => ['n' => $i, 'title' => $a[0], 'body' => $a[1], 'priority' => $a[2], 'impact' => $a[3], 'when' => $a[4], 'owner' => $a[5], 'pillar' => $a[6]])->all(),
            'done' => array_values($request->session()->get("kp_pack.$slug", [])),
            'tools' => [['Capital Readiness Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness', 'clipboard-check'], ['Diagnostic Questions', Kp::BASE.'/diagnostic-questions?topic=finance-funding', 'help'], ['Decision Checklist', Kp::BASE.'/tools/checklists/go-no-go', 'check'], ['Funder Readiness Interviewer', Kp::BASE.'/funder-readiness', 'users']],
        ]);
    }

    public function actionProgress(Request $request, string $slug): RedirectResponse
    {
        abort_unless(Kp::find($slug), 404);
        $data = $request->validate(['n' => ['required', 'integer', 'min:0', 'max:'.(count(T::actionPack()) - 1)], 'done' => ['required', 'boolean']]);
        $done = collect($request->session()->get("kp_pack.$slug", []));
        $done = $data['done'] ? $done->push($data['n'])->unique() : $done->reject(fn ($n) => $n === $data['n']);
        $request->session()->put("kp_pack.$slug", $done->values()->all());

        return back();
    }

    public function downloadActionPack(string $slug): HttpResponse
    {
        $item = Kp::find($slug);
        abort_unless($item, 404);
        $lines = ['INSIGHT ACTION PACK', $item['title'], str_repeat('=', 60)];
        foreach (T::actionPack() as $i => $a) {
            $lines[] = ($i + 1).'. '.$a[0].' ['.Str::headline($a[2]).' priority | '.$a[4].' | Owner: '.$a[5].']';
            $lines[] = '   '.$a[1];
        }
        $lines[] = '';
        $lines[] = 'Self-assessment aid only. It is not professional advice.';

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="action-pack-'.$slug.'.txt"']);
    }

    /* ------------------------------------------------------------------ */
    /* Diagnostic Questions (028) */
    /* ------------------------------------------------------------------ */

    public function diagnostics(Request $request): Response
    {
        $topics = T::diagnosticTopics();
        $topic = array_key_exists((string) $request->query('topic'), $topics) ? (string) $request->query('topic') : array_key_first($topics);
        $owner = $this->owner($request);
        $saved = KpRecord::where('kind', 'diagnostic')->where('data->owner', $owner)->get()->keyBy(fn ($r) => $r->data['topic']);
        $answers = $saved[$topic]->data['answers'] ?? [];
        [$label, $questions] = $topics[$topic];

        return $this->page('Kp/Diagnostics', '028', [
            'topic' => $topic,
            'topics' => collect($topics)->map(fn ($t, $k) => ['key' => $k, 'label' => $t[0], 'count' => count($t[1]), 'done' => isset($saved[$k])])->values(),
            'label' => $label,
            'questions' => $questions,
            'answers' => $answers,
            'result' => isset($saved[$topic]) ? [
                'weak' => collect($questions)->filter(fn ($q, $i) => collect($q[1])->firstWhere('label', $answers[$i] ?? null)['weak'] ?? false)->map(fn ($q, $i) => ['question' => $q[0], 'answer' => $answers[$i]])->values(),
                'saved' => $saved[$topic]->updated_at->diffForHumans(),
            ] : null,
        ]);
    }

    public function saveDiagnostics(Request $request): RedirectResponse
    {
        $topics = T::diagnosticTopics();
        $topic = $request->validate(['topic' => ['required', Rule::in(array_keys($topics))]])['topic'];
        $questions = $topics[$topic][1];
        $rules = ['answers' => ['required', 'array', 'size:'.count($questions)]];
        foreach ($questions as $i => $q) {
            $rules["answers.$i"] = ['required', Rule::in(array_column($q[1], 'label'))];
        }
        $answers = $request->validate($rules)['answers'];
        $owner = $this->owner($request);
        $rec = KpRecord::firstOrNew(['kind' => 'diagnostic', 'code' => 'DQ-'.substr(md5($owner.$topic), 0, 8)]);
        $rec->fill(['title' => $topics[$topic][0], 'status' => 'Complete', 'data' => ['owner' => $owner, 'topic' => $topic, 'answers' => array_values($answers)]])->save();

        return redirect(Kp::BASE.'/diagnostic-questions?topic='.$topic)->with('success', $topics[$topic][0].' diagnostic saved.');
    }

    /* ------------------------------------------------------------------ */
    /* Scorecard, Calculator, Checklist (029 to 031) */
    /* ------------------------------------------------------------------ */

    public function scorecard(Request $request, string $key): Response
    {
        $card = T::scorecards()[$key] ?? abort(404);
        $history = KpRecord::where('kind', 'scorecard')->where('data->owner', $this->owner($request))->where('data->card', $key)->latest('id')->get();

        return $this->page('Kp/Scorecard', '029', [
            'card' => $card,
            'scores' => $history->first()->data['scores'] ?? array_column($card['categories'], 2),
            'history' => $history->map(fn ($r) => ['code' => $r->code, 'version' => $r->data['version'], 'overall' => $r->data['overall'], 'date' => $r->created_at->format('j M Y H:i')])->all(),
        ]);
    }

    public function saveScorecard(Request $request, string $key): RedirectResponse
    {
        $card = T::scorecards()[$key] ?? abort(404);
        $n = count($card['categories']);
        $scores = $request->validate(['scores' => ['required', 'array', 'size:'.$n], 'scores.*' => ['required', 'integer', 'min:0', 'max:100']])['scores'];
        $owner = $this->owner($request);
        $count = KpRecord::where('kind', 'scorecard')->where('data->owner', $owner)->where('data->card', $key)->count();
        $overall = (int) round(array_sum($scores) / $n);
        KpRecord::create(['kind' => 'scorecard', 'code' => 'SC-'.Str::upper(Str::random(6)), 'title' => $card['title'], 'status' => 'Saved', 'data' => ['owner' => $owner, 'card' => $key, 'scores' => array_map('intval', array_values($scores)), 'overall' => $overall, 'version' => 'v1.'.($count + 1)]]);

        return back()->with('success', 'Scorecard saved as version v1.'.($count + 1).'. Overall score '.$overall.' / 100.');
    }

    public function exportScorecard(Request $request, string $key): HttpResponse
    {
        $card = T::scorecards()[$key] ?? abort(404);
        $r = KpRecord::where('kind', 'scorecard')->where('data->owner', $this->owner($request))->where('data->card', $key)->latest('id')->first();
        $scores = $r->data['scores'] ?? array_column($card['categories'], 2);
        $lines = [strtoupper($card['title']), 'Version: '.($r->data['version'] ?? 'unsaved defaults'), str_repeat('=', 60)];
        foreach ($card['categories'] as $i => $c) {
            $lines[] = str_pad($c[0], 30).($scores[$i] ?? 0).' / 100';
        }
        $lines[] = str_pad('Overall', 30).(int) round(array_sum($scores) / count($scores)).' / 100';
        $lines[] = '';
        $lines[] = 'Self-assessment only. It is not a certification or an investment opinion.';

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$key.'-scorecard.txt"']);
    }

    public function calculator(Request $request, string $key): Response
    {
        abort_unless($key === 'investment-case', 404);
        $saved = KpRecord::where('kind', 'calculation')->where('data->owner', $this->owner($request))->latest('id')->take(5)->get();

        return $this->page('Kp/Calculator', '030', [
            'defaults' => $saved->first()->data['inputs'] ?? self::CALC_DEFAULTS,
            'base' => self::CALC_DEFAULTS,
            'saved' => $saved->map(fn ($r) => ['code' => $r->code, 'name' => $r->title, 'npv' => $r->data['result']['npv'] ?? 0, 'date' => $r->created_at->format('j M Y H:i')])->all(),
        ]);
    }

    public const CALC_DEFAULTS = ['name' => 'Digital Payments Expansion', 'investment' => 2000000, 'months' => 36, 'revenue' => 3500000, 'margin' => 30, 'rate' => 12, 'probability' => 70, 'risk' => 'Medium'];

    public function saveCalculation(Request $request, string $key): RedirectResponse
    {
        abort_unless($key === 'investment-case', 404);
        $in = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'investment' => ['required', 'integer', 'min:1', 'max:100000000000'],
            'months' => ['required', Rule::in([12, 24, 36, 48, 60])],
            'revenue' => ['required', 'integer', 'min:0', 'max:100000000000'],
            'margin' => ['required', 'numeric', 'min:0', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0', 'max:60'],
            'probability' => ['required', 'numeric', 'min:0', 'max:100'],
            'risk' => ['required', Rule::in(['Low', 'Medium', 'High'])],
        ]);
        $in['months'] = (int) $in['months'];
        KpRecord::create(['kind' => 'calculation', 'code' => 'CALC-'.Str::upper(Str::random(6)), 'title' => $in['name'], 'status' => 'Saved', 'data' => ['owner' => $this->owner($request), 'inputs' => $in, 'result' => self::investmentCase($in)]]);

        return back()->with('success', 'Scenario saved.');
    }

    /**
     * Investment case on monthly cash flows. Amounts are whole ZAR.
     * Monthly inflow = annual revenue increase x operating margin / 12, weighted by probability of success.
     */
    public static function investmentCase(array $in): array
    {
        $inv = (float) $in['investment'];
        $m = (int) $in['months'];
        $flow = $in['revenue'] * ($in['margin'] / 100) / 12 * ($in['probability'] / 100);
        $r = $in['rate'] / 100 / 12;
        $npvAt = function (float $rate) use ($inv, $m, $flow): float {
            $v = -$inv;
            for ($t = 1; $t <= $m; $t++) {
                $v += $flow / ((1 + $rate) ** $t);
            }

            return $v;
        };
        $irr = null;
        if ($flow * $m > $inv) {
            [$lo, $hi] = [0.0, 1.0];
            for ($i = 0; $i < 80; $i++) {
                $mid = ($lo + $hi) / 2;
                if ($npvAt($mid) > 0) {
                    $lo = $mid;
                } else {
                    $hi = $mid;
                }
            }
            $irr = round(((1 + $lo) ** 12 - 1) * 100, 1);
        }

        return ['npv' => (int) round($npvAt($r)), 'roi' => round(($flow * $m - $inv) / $inv * 100, 1), 'payback' => $flow > 0 ? round($inv / $flow, 1) : null, 'irr' => $irr, 'monthly' => (int) round($flow)];
    }

    public const CHECK_STATES = ['yes', 'partial', 'no', 'na'];

    public function checklist(Request $request, string $key): Response
    {
        $list = T::checklists()[$key] ?? abort(404);
        $rec = KpRecord::where('kind', 'checklist')->where('data->owner', $this->owner($request))->where('data->list', $key)->first();
        $tools = ['Decision Sheet' => '/decision-sheet', 'Fatal-Flaw Explorer' => '/project-fatal-flaw', 'Scorecard' => '/tools/scorecards/capital-readiness', 'Funder Readiness Interviewer' => '/funder-readiness', 'Diagnostic Questions' => '/diagnostic-questions', 'Insight Action Pack' => '/action-pack/the-real-problem-isnt-capital', 'Calculator' => '/tools/calculators/investment-case', 'Source & Confidence Panel' => '/ask'];

        return $this->page('Kp/Checklist', '031', [
            'title' => $list['title'],
            'sections' => collect($list['sections'])->map(fn ($s, $si) => ['title' => $s[0], 'items' => collect($s[1])->map(fn ($it, $ii) => ['id' => ($si + 1).'-'.($ii + 1), 'label' => $it[0], 'why' => $it[1], 'tool' => $it[2], 'href' => Kp::BASE.($tools[$it[2]] ?? '')])->all()])->all(),
            'states' => (object) ($rec->data['states'] ?? []),
            'notes' => $rec->data['notes'] ?? '',
            'saved' => $rec?->updated_at?->diffForHumans(),
        ]);
    }

    public function saveChecklist(Request $request, string $key): RedirectResponse
    {
        abort_unless(isset(T::checklists()[$key]), 404);
        $data = $request->validate(['states' => ['present', 'array'], 'states.*' => [Rule::in(self::CHECK_STATES)], 'notes' => ['nullable', 'string', 'max:2000']]);
        $states = collect($data['states'])->filter(fn ($v, $k) => preg_match('/^\d-\d$/', (string) $k) === 1)->all();
        $owner = $this->owner($request);
        $rec = KpRecord::firstOrNew(['kind' => 'checklist', 'code' => 'CL-'.substr(md5($owner.$key), 0, 8)]);
        $rec->fill(['title' => T::checklists()[$key]['title'], 'status' => 'Saved', 'data' => ['owner' => $owner, 'list' => $key, 'states' => $states, 'notes' => $data['notes'] ?? '']])->save();

        return back()->with('success', 'Checklist saved.');
    }

    /* ------------------------------------------------------------------ */
    /* Future Builders (034 to 042) */
    /* ------------------------------------------------------------------ */

    public function fbHome(Request $request): Response
    {
        return $this->page('Kp/FbHome', '034', [
            'topics' => $this->learnerTopics(),
            'courses' => $this->courseSummaries($request),
            'spark' => T::sparks()[now()->dayOfYear % count(T::sparks())],
            'challengeSteps' => array_map(fn ($s) => ['title' => $s[0], 'body' => $s[1], 'icon' => $s[2]], T::challengeSteps()),
        ] + $this->fb($request));
    }

    public function fbTopics(Request $request): Response
    {
        $level = (string) $request->query('level', '');
        $q = Str::lower(trim((string) $request->query('q', '')));
        $topics = collect($this->learnerTopics())->when($level !== '', fn ($c) => $c->where('level', $level))->when($q !== '', fn ($c) => $c->filter(fn ($t) => Str::contains(Str::lower($t['title'].' '.$t['body']), $q)))->values();

        return $this->page('Kp/FbTopics', '035', ['topics' => $topics, 'filters' => ['level' => $level, 'q' => $q], 'courses' => $this->courseSummaries($request)] + $this->fb($request));
    }

    public function lesson(Request $request, string $course, int $n): Response
    {
        $c = T::courses()[$course] ?? abort(404);
        abort_unless($n >= 1 && $n <= count($c['lessons']), 404);
        $l = $c['lessons'][$n - 1];
        $done = $request->session()->get("kp_fb.$course", []);

        return $this->page('Kp/Lesson', $course === 'ai-literacy' ? '037' : '036', [
            'course' => ['key' => $course, 'title' => $c['title'], 'level' => $c['level'], 'minutes' => $c['minutes'], 'outcomes' => $c['outcomes'], 'activity' => $c['activity'], 'lessons' => array_map(fn ($x) => $x[0], $c['lessons'])],
            'n' => $n,
            'lesson' => ['title' => $l[0], 'definition' => $l[1], 'learn' => $l[2], 'examples' => $l[3], 'takeaway' => $l[4], 'think' => $l[5]],
            'done' => array_values($done),
        ] + $this->fb($request));
    }

    public function completeLesson(Request $request, string $course, int $n): RedirectResponse
    {
        $c = T::courses()[$course] ?? abort(404);
        abort_unless($n >= 1 && $n <= count($c['lessons']), 404);
        $done = collect($request->session()->get("kp_fb.$course", []))->push($n)->unique()->sort()->values()->all();
        $request->session()->put("kp_fb.$course", $done);
        $next = $n < count($c['lessons']) ? $n + 1 : null;

        return redirect(Kp::BASE."/future-builders/lessons/$course/".($next ?? $n))->with('success', $next ? 'Lesson '.$n.' complete. On to lesson '.$next.'.' : 'Course complete. Well done!');
    }

    public function challenge(Request $request): Response
    {
        return $this->page('Kp/FbChallenge', '038', [
            'steps' => array_map(fn ($s) => ['title' => $s[0], 'body' => $s[1], 'icon' => $s[2]], T::challengeSteps()),
            'ageBands' => ['8-12', '13-15', '16-18'],
            'examples' => ['Long queues for water at the community tap', 'Litter around the school gate', 'Learners without a quiet place to study'],
        ] + $this->fb($request));
    }

    public function storeChallenge(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:40'],
            'age_band' => ['required', Rule::in(['8-12', '13-15', '16-18'])],
            'guardian_email' => ['nullable', 'required_if:age_band,8-12', 'email', 'max:190'],
            'problem' => ['required', 'string', 'min:10', 'max:600'],
            'who' => ['required', 'string', 'max:600'],
            'ideas' => ['required', 'string', 'max:600'],
            'solution' => ['required', 'string', 'max:600'],
            'step' => ['required', 'string', 'max:300'],
        ]);
        $code = 'FB-CH-'.str_pad((string) (KpRecord::where('kind', 'fb_challenge')->count() + 1), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'fb_challenge', 'code' => $code, 'title' => Str::limit($data['problem'], 80), 'status' => 'Pending review', 'data' => $data + ['received' => now()->format('j M Y')]]);

        return back()->with('success', "Great work! Your challenge $code was received. A trained reviewer checks every entry before anything is shared.");
    }

    public function activity(Request $request, string $slug): Response
    {
        abort_unless($slug === 'smart-goals', 404);

        return $this->page('Kp/FbActivity', '039', ['slug' => $slug] + $this->fb($request));
    }

    public function downloadActivity(string $slug): HttpResponse
    {
        abort_unless($slug === 'smart-goals', 404);
        $lines = ['FUTURE BUILDERS | MY SMART GOAL WORKSHEET', str_repeat('=', 60), 'Name: ______________________   Date: ____________', '',
            'S - Specific: What exactly do I want to achieve?', '______________________________________________', '',
            'M - Measurable: How will I know I have achieved it?', '______________________________________________', '',
            'A - Achievable: Is it realistic? What will I need?', '______________________________________________', '',
            'R - Relevant: Why does this goal matter to me?', '______________________________________________', '',
            'T - Time-bound: By when will I achieve it?', '______________________________________________', '',
            'My SMART goal:', '______________________________________________', '',
            'My first three steps:', '1. ________________  2. ________________  3. ________________', '',
            'Free learning resource from The Business Clinic.Africa Future Builders.'];

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="smart-goal-worksheet.txt"']);
    }

    public function educators(Request $request): Response
    {
        return $this->page('Kp/FbEducators', '040', [
            'courses' => $this->courseSummaries($request),
            'packs' => collect(T::courses())->map(fn ($c, $k) => ['key' => $k, 'title' => $c['title'].' Teaching Pack', 'body' => count($c['lessons']).' lesson plans, outcomes, activities and discussion questions.', 'href' => Kp::BASE.'/future-builders/educators/packs/'.$k])->values(),
            'roles' => ['Teacher', 'Principal', 'Youth Programme Lead', 'Librarian', 'Other Educator'],
        ] + $this->fb($request));
    }

    public function storeEducator(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'school' => ['required', 'string', 'max:160'], 'email' => ['required', 'email', 'max:190'], 'role' => ['required', 'string', 'max:60'], 'learners' => ['nullable', 'integer', 'min:1', 'max:5000']]);
        $code = 'FB-ED-'.str_pad((string) (KpRecord::where('kind', 'educator_request')->count() + 1), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'educator_request', 'code' => $code, 'title' => $data['school'], 'status' => 'Pending verification', 'data' => $data + ['received' => now()->format('j M Y')]]);

        return back()->with('success', "Request $code received. Educator accounts are verified before class tools are switched on.");
    }

    public function downloadPack(string $course): HttpResponse
    {
        $c = T::courses()[$course] ?? abort(404);
        $lines = ['FUTURE BUILDERS TEACHING PACK', strtoupper($c['title']), 'Level: '.$c['level'].' | About '.$c['minutes'].' minutes per lesson', str_repeat('=', 60), 'Learning outcomes:'];
        foreach ($c['outcomes'] as $o) {
            $lines[] = '- '.$o;
        }
        foreach ($c['lessons'] as $i => $l) {
            array_push($lines, '', 'Lesson '.($i + 1).': '.$l[0], 'Definition: '.$l[1], 'Key points: '.implode(' ', $l[2]), 'Key takeaway: '.$l[4], 'Discussion: '.$l[5]);
        }
        array_push($lines, '', 'Class activity: '.$c['activity'], '', 'Free educational resource. No learner data is collected by this pack.');

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$course.'-teaching-pack.txt"']);
    }

    public function guardians(Request $request): Response
    {
        return $this->page('Kp/FbGuardians', '041', ['courses' => $this->courseSummaries($request)] + $this->fb($request));
    }

    public function storeGuardian(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190'], 'question' => ['required', 'string', 'min:10', 'max:1000']]);
        KpRecord::create(['kind' => 'guardian_query', 'code' => 'FB-GQ-'.str_pad((string) (KpRecord::where('kind', 'guardian_query')->count() + 1), 4, '0', STR_PAD_LEFT), 'title' => Str::limit($data['question'], 80), 'status' => 'Open', 'data' => $data + ['received' => now()->format('j M Y')]]);

        return back()->with('success', 'Thank you. The Future Builders safety team replies by email.');
    }

    public function lite(Request $request): Response
    {
        return $this->page('Kp/FbLite', '042', [
            'courses' => collect(T::courses())->map(fn ($c, $k) => ['key' => $k, 'title' => $c['title'], 'lessons' => array_map(fn ($l) => $l[0], $c['lessons'])])->values(),
            'topics' => $this->learnerTopics(),
        ] + $this->fb($request));
    }

    public function toggleLite(Request $request): RedirectResponse
    {
        $on = $request->validate(['on' => ['required', 'boolean']])['on'];
        $request->session()->put('kp_lite', (bool) $on);

        return back()->with('success', $on ? 'Low-bandwidth mode is on: images and animations are switched off.' : 'Low-bandwidth mode is off.');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers */
    /* ------------------------------------------------------------------ */

    private function fb(Request $request): array
    {
        return ['lite' => (bool) $request->session()->get('kp_lite', false), 'fbNav' => [
            ['Home', Kp::BASE.'/future-builders', 'rocket'], ['Topics', Kp::BASE.'/future-builders/topics', 'layers'], ['Business Basics', Kp::BASE.'/future-builders/lessons/business-basics/1', 'briefcase'],
            ['AI Literacy', Kp::BASE.'/future-builders/lessons/ai-literacy/1', 'bot'], ['Local Problem Challenge', Kp::BASE.'/future-builders/challenge', 'lightbulb'], ['Printable Activities', Kp::BASE.'/future-builders/activities/smart-goals', 'file-text'],
            ['For Educators', Kp::BASE.'/future-builders/educators', 'graduation-cap'], ['For Parents & Guardians', Kp::BASE.'/future-builders/guardians', 'shield-check'], ['Low-Bandwidth Mode', Kp::BASE.'/future-builders/lite', 'wifi'],
        ]];
    }

    private function learnerTopics(): array
    {
        return array_map(fn ($t) => ['slug' => $t[0], 'title' => $t[1], 'body' => $t[2], 'icon' => $t[3], 'level' => $t[4], 'course' => $t[5], 'href' => $t[5] ? Kp::BASE.'/future-builders/lessons/'.$t[5].'/1' : null], T::learnerTopics());
    }

    private function courseSummaries(Request $request): array
    {
        return collect(T::courses())->map(fn ($c, $k) => [
            'key' => $k, 'title' => $c['title'], 'level' => $c['level'], 'minutes' => $c['minutes'], 'lessons' => count($c['lessons']),
            'done' => count($request->session()->get("kp_fb.$k", [])), 'href' => Kp::BASE.'/future-builders/lessons/'.$k.'/1', 'outcomes' => $c['outcomes'],
        ])->values()->all();
    }

    private function owner(Request $request): string
    {
        if ($request->user()) {
            return 'u:'.$request->user()->id;
        }
        $key = $request->session()->get('kp_visitor');
        if (! $key) {
            $key = (string) Str::uuid();
            $request->session()->put('kp_visitor', $key);
        }

        return 'v:'.$key;
    }

    private function page(string $component, ?string $screen, array $props): Response
    {
        return Inertia::render($component, KpController::shared($screen) + $props);
    }
}
