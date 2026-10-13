<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Support\DueDiligence\Identity\IdentityVerifications;
use Illuminate\Http\RedirectResponse;

/**
 * GET /due-diligence/verify/{token}
 *
 * The link sent to a Due Diligence subject. Each visit mints a fresh provider
 * session (VOVE KYC tokens last 30 minutes) and redirects to the provider's
 * hosted journey. The result is taken from the provider's webhook and API,
 * never from the browser redirect.
 */
class IdentityLinkController extends Controller
{
    public function open(string $token, IdentityVerifications $identity): RedirectResponse
    {
        $verification = $identity->forLink($token);
        if (! $verification) {
            return redirect('/due-diligence')->with('error', __('This verification link has expired or has already been used. Please ask your TBCA case coordinator for a new link.'));
        }

        $url = $identity->provider()->hostedUrl($verification, url("/due-diligence/verify/{$token}/done"));

        if ($url === null) {
            // Simulated provider: there is no hosted journey, so the result is applied straight away.
            $identity->refresh($verification);

            return redirect('/due-diligence')->with('success', __('Thank you. Your verification has been received.'));
        }

        return redirect()->away($url);
    }

    public function done(): RedirectResponse
    {
        return redirect('/due-diligence')->with('success', __('Thank you. We will confirm your verification result with the provider and update the case.'));
    }
}
