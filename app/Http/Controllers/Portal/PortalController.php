<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Portal\Account;
use App\Models\Portal\Organisation;
use App\Models\User;
use App\Support\Portal\Portal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Base for signed-in portal controllers.
 */
abstract class PortalController extends Controller
{
    protected function user(): User
    {
        return request()->user();
    }

    protected function account(): Account
    {
        return Portal::account($this->user());
    }

    protected function org(): Organisation
    {
        return Portal::organisation($this->user());
    }

    /** Render the generic register screen (Pages/Portal/Register.tsx). */
    protected function register(array $props, string $shell = 'client'): Response
    {
        $request = request();

        return Inertia::render('Portal/Register', array_merge([
            'shell' => $shell,
            'query' => array_filter($request->query(), fn ($v) => is_string($v)),
            'tab' => (string) $request->query('tab', ''),
            'side' => [],
            'kpis' => [],
        ], $props));
    }

    protected function tab(Request $request, string $default): string
    {
        return (string) $request->query('tab', $default) ?: $default;
    }

    /**
     * Sensitive authority changes require a step-up verification within the last
     * 15 minutes (CP-TEB Part 7). Returns a redirect when step-up is needed.
     */
    protected function needsStepUp(): ?\Illuminate\Http\RedirectResponse
    {
        $at = session('portal.stepup_at');
        if ($at && now()->diffInMinutes(\Illuminate\Support\Carbon::parse($at), true) < 15) {
            return null;
        }
        $back = url()->previous() ?: '/portal/dashboard';

        return redirect('/portal/security/step-up?intended='.urlencode(parse_url($back, PHP_URL_PATH) ?: '/portal/dashboard'))
            ->with('error', 'Please confirm it is you before making this change.');
    }

    protected function ownOrFail($model, string $column = 'user_id'): void
    {
        abort_unless($model && (int) $model->{$column} === (int) $this->user()->id, 404);
    }
}
