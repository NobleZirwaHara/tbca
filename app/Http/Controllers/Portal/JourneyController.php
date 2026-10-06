<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\PortalCase;
use App\Support\Portal\Journeys;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Generic server-side wizard for every multi-step portal journey (Pages/Portal/Journey.tsx). */
class JourneyController extends PortalController
{
    private function def(string $key): array
    {
        $all = Journeys::all($this->user());
        abort_unless(isset($all[$key]), 404);

        return $all[$key];
    }

    private function draft(string $key): ?PortalCase
    {
        return PortalCase::where('user_id', $this->user()->id)->where('kind', $key)->where('status', 'draft')->latest()->first();
    }

    public function show(Request $request, string $key): Response
    {
        $def = $this->def($key);
        $case = $this->draft($key);
        $done = null;
        if (! $case && ($request->query('done') || ! $request->query('start'))) {
            $last = PortalCase::where('user_id', $this->user()->id)->where('kind', $key === 'ownership-dispute' ? 'ownership_dispute' : $key)->where('status', '!=', 'draft')->latest('submitted_at')->first();
            if ($last && $request->query('done')) {
                $done = $last;
            }
        }
        $step = $case?->step ?? 1;
        $data = $case?->payload ?? [];
        foreach (['service', 'member'] as $prefill) {
            if ($request->query($prefill) && ! isset($data[$prefill === 'member' ? 'member_id' : 'service'])) {
                $data[$prefill === 'member' ? 'member_id' : 'service'] = (string) $request->query($prefill);
            }
        }
        if ($key === 'verification' && $step === 2 && ! session('portal.journey_code')) {
            session(['portal.journey_code' => (string) random_int(100000, 999999)]);
        }
        $steps = array_map(function ($s) use ($data) {
            $s['fields'] = array_map(fn ($f) => array_key_exists($f['name'], $data) && $f['type'] !== 'file' ? array_merge($f, ['value' => $data[$f['name']]]) : $f, $s['fields']);
            $s['description'] ??= null;

            return $s;
        }, $def['steps']);

        return Inertia::render('Portal/Journey', [
            'journey' => $key, 'title' => $def['title'], 'code' => $def['code'], 'subtitle' => $def['subtitle'], 'icon' => $def['icon'],
            'reference' => $done?->reference ?? $case?->reference, 'status' => $done ? $done->status : ($case ? 'draft' : 'new'), 'step' => $done ? count($steps) + 1 : $step,
            'steps' => $steps, 'data' => collect($data)->except('_paused')->all(),
            'banner' => $key === 'verification' && $step === 2 && ! $done ? ['tone' => 'gold', 'title' => 'Verification code sent', 'body' => 'Demo environment (no SMS gateway): your code is '.session('portal.journey_code').'. It is valid for 10 minutes.'] : null,
            'done' => $done ? ['title' => 'Submitted — reference '.$done->reference, 'body' => $def['done'], 'links' => [Ui::action('Back to Dashboard', '/portal/dashboard', 'get', ['variant' => 'gold']), Ui::action('Save-State & Resume Centre', '/portal/resume'), Ui::action('Start another', '/portal/journeys/'.$key.'?start=1')]] : null,
            'side' => [
                Ui::steps('Progress', array_map(fn ($s) => ['label' => $s['title']], $def['steps']), $done ? count($steps) + 1 : $step),
                Ui::info('Saved automatically', 'Your progress is saved on our servers after every step, so you can continue on any device from the Save-State & Resume Centre.', 'info', Ui::action('Resume Centre', '/portal/resume')),
                Ui::quick('Need help?', [Ui::action('Chat with KAREN', '/portal/natasha'), Ui::action('Contact Support', '/portal/support?new=1'), Ui::action('Knowledge Base', '/portal/help')]),
            ],
        ]);
    }

    private function rules(array $fields): array
    {
        $rules = [];
        foreach ($fields as $f) {
            $req = ! empty($f['required']);
            $rules[$f['name']] = match ($f['type']) {
                'checkbox' => $req ? ['accepted'] : ['nullable', 'boolean'],
                'checkboxes' => $req ? ['required', 'array', 'min:1'] : ['nullable', 'array'],
                'file' => [$req ? 'required' : 'nullable', 'file', 'max:25600', 'mimes:'.DocumentController::MIMES],
                'email' => [$req ? 'required' : 'nullable', 'email', 'max:160'],
                'date' => [$req ? 'required' : 'nullable', 'date'],
                'number' => [$req ? 'required' : 'nullable', 'numeric'],
                'textarea' => [$req ? 'required' : 'nullable', 'string', 'max:5000'],
                default => [$req ? 'required' : 'nullable', 'string', 'max:255'],
            };
        }

        return $rules;
    }

    public function advance(Request $request, string $key): RedirectResponse
    {
        $def = $this->def($key);
        $case = $this->draft($key) ?? PortalCase::create(['user_id' => $this->user()->id, 'kind' => $key, 'status' => 'draft', 'step' => 1, 'title' => $def['title'], 'payload' => []]);
        $stepDef = $def['steps'][$case->step - 1] ?? abort(422);
        $data = $request->validate($this->rules($stepDef['fields']));

        if ($key === 'verification' && $stepDef['key'] === 'phone' && ($data['code'] ?? '') !== session('portal.journey_code')) {
            return back()->withErrors(['code' => 'That code is not correct. Please check the code we sent.']);
        }
        if ($key === 'organisation' && $stepDef['key'] === 'details' && ($case->payload['organisation_id'] ?? '') === 'new' && empty($data['name'])) {
            return back()->withErrors(['name' => 'Please provide the registered name of the new organisation.']);
        }

        $payload = $case->payload ?? [];
        foreach ($stepDef['fields'] as $f) {
            if ($f['type'] === 'file') {
                if ($request->hasFile($f['name'])) {
                    $doc = DocumentController::storeUpload($request->file($f['name']), $this->user(), ['doc_type' => $def['title'], 'tags' => ['Journey', strtoupper($def['prefix'])]]);
                    $payload[$f['name']] = ['document_id' => $doc->id, 'name' => $doc->name];
                }

                continue;
            }
            $payload[$f['name']] = $data[$f['name']] ?? null;
        }

        $last = $case->step >= count($def['steps']);
        if (! $last) {
            $case->update(['payload' => $payload, 'step' => $case->step + 1]);

            return redirect('/portal/journeys/'.$key)->with('success', 'Step saved.');
        }

        if (! empty($def['stepup']) && ($r = $this->needsStepUp())) {
            $case->update(['payload' => $payload]);

            return $r;
        }

        $case->update(['payload' => $payload, 'status' => 'submitted', 'submitted_at' => now(), 'step' => count($def['steps']) + 1,
            'reference' => $def['prefix'].'-'.now()->format('Y').'-'.str_pad((string) (PortalCase::where('kind', $key)->count() + 100), 5, '0', STR_PAD_LEFT)]);
        session()->forget('portal.journey_code');
        $message = Journeys::complete($key, $case->fresh(), $this->user());

        return redirect('/portal/journeys/'.$key.'?done=1')->with('success', $message);
    }

    public function back(string $key): RedirectResponse
    {
        $case = $this->draft($key);
        if ($case && $case->step > 1) {
            $case->update(['step' => $case->step - 1]);
        }

        return redirect('/portal/journeys/'.$key);
    }

    public function restart(string $key): RedirectResponse
    {
        $this->draft($key)?->delete();

        return redirect('/portal/journeys/'.$key.'?start=1');
    }
}
