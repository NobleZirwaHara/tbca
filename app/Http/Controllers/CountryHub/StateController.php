<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryState;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Small pieces of visitor state the Countries pages save without a page visit (planner ticks, notes, saved countries). */
class StateController extends Controller
{
    public function store(Request $request): RedirectResponse|Response
    {
        $data = $request->validate(['key' => ['required', 'string', 'max:60', 'regex:'.CountryState::WRITABLE], 'value' => 'nullable']);
        abort_if(strlen((string) json_encode($data['value'] ?? null)) > 20000, 422);
        CountryState::put($data['key'], $data['value'] ?? null);

        return $request->wantsJson() ? response()->noContent() : back();
    }
}
