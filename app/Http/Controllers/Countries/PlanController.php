<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Country;
use App\Models\Countries\Plan;
use App\Models\Countries\PlanItem;
use App\Support\Countries\CountryRegister;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Planners;
use App\Support\Countries\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Market-entry journey planners (CT-017..CT-026). Visitors see the reference
 * template; signed-in clients copy it into their own plan and every status change
 * recomputes the score, domain progress and critical gaps server-side.
 */
class PlanController extends Controller
{
    public function show(Request $request, Country $country, string $kind): Response
    {
        $def = Planners::definition($kind);
        abort_unless($def, 404);

        $plan = $request->user()
            ? Plan::with('items')->where(['user_id' => $request->user()->id, 'country_id' => $country->id, 'kind' => $kind])->first()
            : null;

        $items = $plan
            ? $plan->items->map(fn (PlanItem $i) => ['id' => $i->id, 'code' => $i->code, 'title' => $i->title, 'category' => $i->category, 'owner' => $i->owner, 'due_date' => $i->due_date?->toDateString(), 'priority' => $i->priority, 'status' => $i->status, 'critical' => $i->critical])->all()
            : array_map(fn ($i) => [...$i, 'id' => null], Planners::template($kind));

        $profile = CountryResolver::profile($country->load('domains'));

        return Inertia::render('Countries/Planner', [
            'country' => Present::country($country, $profile),
            'kind' => $kind,
            'nav' => Planners::nav(),
            'def' => collect($def)->except('items')->all(),
            'items' => $items,
            'score' => Planners::score($items),
            'ownPlan' => (bool) $plan,
            'planUpdated' => $plan?->updated_at?->format('d M Y H:i'),
            'blocked' => ! $profile['transaction_permission'],
            'absence' => CountryRegister::absenceCopy('ABS-01'),
            'statuses' => Planners::STATUSES,
        ]);
    }

    public function start(Request $request, Country $country, string $kind): RedirectResponse
    {
        abort_unless(Planners::definition($kind), 404);
        abort_unless(CountryResolver::profile($country->load('domains'))['transaction_permission'], 403, 'Planning requires an activated country object.');

        $plan = Plan::firstOrCreate(['user_id' => $request->user()->id, 'country_id' => $country->id, 'kind' => $kind]);
        if ($plan->items()->doesntExist()) {
            foreach (Planners::template($kind) as $i => $item) {
                $plan->items()->create([...$item, 'sort' => $i]);
            }
        }

        return back()->with('success', 'Your own plan has been created from the reference template. Update statuses as you progress.');
    }

    public function updateItem(Request $request, PlanItem $item): RedirectResponse
    {
        abort_unless($item->plan->user_id === $request->user()->id, 403);
        $data = $request->validate([
            'status' => ['required', Rule::in(Planners::STATUSES)],
            'owner' => ['nullable', 'string', 'max:80'],
            'due_date' => ['nullable', 'date'],
        ]);
        $item->update(array_filter($data, fn ($v) => $v !== null));
        $item->plan->touch();

        return back()->with('success', "{$item->code} updated — score recalculated.");
    }

    public function addItem(Request $request, Country $country, string $kind): RedirectResponse
    {
        $plan = Plan::where(['user_id' => $request->user()->id, 'country_id' => $country->id, 'kind' => $kind])->firstOrFail();
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'owner' => ['nullable', 'string', 'max:80'],
            'due_date' => ['nullable', 'date'],
            'priority' => ['required', Rule::in(['High', 'Medium', 'Low'])],
            'critical' => ['boolean'],
        ]);
        $n = $plan->items()->count() + 1;
        $plan->items()->create([...$data, 'code' => strtoupper(substr($kind, 0, 3)).'-U'.str_pad((string) $n, 3, '0', STR_PAD_LEFT), 'status' => 'not_started', 'sort' => $n]);

        return back()->with('success', 'Requirement added to your plan.');
    }
}
