<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Question;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Usage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Source-grounded Q&A (Stage 5). "No source, no answer": the assistant only
 * drafts an answer when documents the asker may see match the question; the
 * draft carries citations and a confidence label, and anything sensitive or
 * unsourced is escalated for human review.
 */
class QaController extends Controller
{
    use LoadsRoom;

    protected const SENSITIVE = ['valuation', 'price', 'litigation', 'tax', 'dispute', 'warranty', 'indemn'];

    public function store(Request $request, Room $room): RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless(Access::can($room, $request->user(), 'ask_qa'), 403);
        $data = $request->validate(['question' => ['required', 'string', 'min:8', 'max:500']]);
        $text = $data['question'];

        $words = collect(preg_split('/\W+/', strtolower($text)))->filter(fn ($w) => strlen($w) > 3)->values();
        $visible = $room->folders()->get()->filter(fn ($f) => Access::folderVisible($f, $role))->pluck('id');
        $matches = $room->documents()->with('folder')->whereIn('folder_id', $visible)
            ->when(! Access::isInternal($role), fn ($q) => $q->where('review_status', 'released'))
            ->get()
            ->map(fn ($d) => ['doc' => $d, 'hits' => $words->filter(fn ($w) => str_contains(strtolower($d->name.' '.$d->category.' '.$d->folder->name), rtrim($w, 's')))->count()])
            ->where('hits', '>', 0)->sortByDesc('hits')->take(3)->values();

        $sensitive = collect(self::SENSITIVE)->contains(fn ($w) => str_contains(strtolower($text), $w));
        $question = $room->questions()->create([
            'user_id' => $request->user()->id,
            'asked_by' => $request->user()->name,
            'question' => $text,
        ]);

        if ($matches->isEmpty()) {
            $question->update(['status' => 'escalated', 'confidence' => 0, 'answer' => null]);
            $msg = 'No authorised source found — question escalated to the deal team (no source, no answer).';
        } else {
            $confidence = min(97, 60 + $matches->sum('hits') * 9);
            $sources = $matches->map(fn ($m) => ['name' => $m['doc']->name, 'folder' => $m['doc']->folder->name, 'page' => 1 + ($m['doc']->id % max(1, $m['doc']->pages))])->all();
            $answer = 'Based on '.collect($sources)->pluck('name')->implode(', ').', the requested information is documented in the authorised data room. '
                .'Review the cited sources for the exact figures; this AI draft is limited to approved documents.';
            $question->update([
                'answer' => $answer, 'sources' => $sources, 'confidence' => $confidence,
                'status' => $sensitive || $confidence < 70 ? 'escalated' : 'answered',
                'answered_by' => 'AI Q&A Assistant'.($sensitive ? ' (pending human review)' : ''), 'answered_at' => now(),
            ]);
            $msg = $sensitive ? 'Draft answer prepared with sources; sensitive topic escalated for human review.' : "Answer generated with {$confidence}% confidence and ".count($sources).' source(s).';
        }
        Usage::increment($room, 'ai_qa');
        Audit::log($room, 'qa.asked', 'Question asked: '.str($text)->limit(60));

        return back()->with('success', $msg);
    }

    /** Human answer / approve / escalate (deal team only). */
    public function update(Request $request, Room $room, Question $question): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($question->room_id === $room->id, 404);
        $this->manage($request, $room);
        $data = $request->validate([
            'action' => ['required', Rule::in(['answer', 'approve', 'escalate'])],
            'answer' => ['required_if:action,answer', 'nullable', 'string', 'max:2000'],
        ]);
        match ($data['action']) {
            'answer' => $question->update(['answer' => $data['answer'], 'status' => 'answered', 'answered_by' => $request->user()->name, 'answered_at' => now(), 'confidence' => 100]),
            'approve' => $question->answer ? $question->update(['status' => 'answered', 'answered_by' => $request->user()->name.' (human approved)']) : abort(422, 'Nothing to approve yet.'),
            'escalate' => $question->update(['status' => 'escalated']),
        };
        Audit::log($room, 'qa.'.$data['action'], 'Q&A item '.$data['action'].': '.str($question->question)->limit(50));

        return back()->with('success', 'Q&A item updated.');
    }
}
