<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * TBCA-FE-001 — retain country, language and currency context across routes.
 */
class ContextController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $languages = collect(config('tbca.languages'))->pluck('code')->all();
        $currencies = collect(config('tbca.currencies'))->pluck('code')->all();

        $validated = $request->validate([
            'language' => ['nullable', Rule::in($languages)],
            'currency' => ['nullable', Rule::in($currencies)],
            'country' => ['nullable', 'string', 'max:2'],
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $request->session()->put("tbca.{$key}", $value);
            }
        }

        return back();
    }
}
