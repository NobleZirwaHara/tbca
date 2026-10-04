<?php

namespace App\Support\Countries;

use App\Models\Countries\Country;
use App\Models\Countries\Service;

/**
 * CT-COUNTRY-RESOLVER-v2.0.0 — the only authority that returns a CountryFeeProfile.
 *
 * NUMERIC_PRICE_ALLOWED = RCS == 100 AND hard blocks == 0 AND profile current
 *                         AND state permits price AND signed ResolvedPricePermit.
 * Cache may reduce latency; it may not create authority, so this is computed per request.
 */
class CountryResolver
{
    public static function profile(Country $country): array
    {
        $domains = $country->relationLoaded('domains') ? $country->domains : $country->domains()->get();
        $required = max(1, (int) $domains->sum('required_fields'));
        $completed = (int) $domains->sum('completed_fields');
        $rcs = round($completed / $required * 100, 3);

        $blocks = [];
        $missing = [];
        foreach ($domains as $d) {
            $gap = $d->required_fields - $d->completed_fields;
            if ($gap <= 0) {
                continue;
            }
            [$code, $label, $abs] = CountryRegister::DOMAIN_ERRORS[$d->key] ?? ['CT-RES-021', 'Dependency unavailable', 'ABS-01'];
            $missing[] = [
                'domain' => $d->label,
                'key' => $d->key,
                'missing_fields' => $gap,
                'error' => $code,
                'error_label' => $label,
                'absence_code' => $abs,
                'absence' => CountryRegister::absenceCopy($abs),
                'fields' => $d->missing ?? [],
            ];
            if ($d->hard_block_class) {
                $blocks[$d->hard_block_class] = true;
            }
        }

        $state = $country->availability_state;
        if (! AvailabilityState::isActive($state)) {
            $blocks['country/service state'] = true;
        }
        if ($state === AvailabilityState::RESTRICTED) {
            $blocks['sanctions/prohibition'] = true;
        }

        $current = $country->profile_valid_to !== null && $country->profile_valid_to->endOfDay()->isFuture();
        $hardBlocks = count($blocks);
        $statePermits = AvailabilityState::isActive($state);

        return [
            'rcs' => $rcs,
            'rcs_label' => self::pct($rcs),
            'required_fields' => $required,
            'completed_fields' => $completed,
            'hard_blocks' => $hardBlocks,
            'hard_block_classes' => array_keys($blocks),
            'profile_current' => $current,
            'state' => $state,
            'state_label' => AvailabilityState::label($state),
            'bucket' => AvailabilityState::bucket($state),
            'transaction_permission' => $statePermits && $hardBlocks === 0,
            'quote_permission' => $statePermits && ! in_array('sanctions/prohibition', array_keys($blocks), true),
            'intelligence_permission' => $state !== AvailabilityState::RESTRICTED,
            'price_resolution' => $statePermits && $rcs >= 100 && $hardBlocks === 0 && $current,
            'missing' => $missing,
            'version' => $country->resolver_version,
            'valid_to' => $country->profile_valid_to?->format('d M Y'),
        ];
    }

    /**
     * Resolve a single service request. A numeric price is returned only when
     * every condition of NUMERIC_PRICE_ALLOWED holds; otherwise the exact reason.
     */
    public static function service(Country $country, Service $service, ?array $profile = null): array
    {
        $profile ??= self::profile($country);
        $reasons = [];

        if (! $profile['transaction_permission']) {
            $reasons[] = $profile['state'] === AvailabilityState::SHELL
                ? 'CT-RES-004 — Country object is a shell: no transaction, no numeric price.'
                : 'CT-RES-004 — Country state does not permit transaction.';
        }
        if ($profile['rcs'] < 100) {
            $reasons[] = 'Resolver Completeness is '.$profile['rcs_label'].' — 100.000% is required for a numeric price.';
        }
        if (! $profile['profile_current']) {
            $reasons[] = 'CT-RES-022 — Profile expired; revalidation required.';
        }
        if ($service->access === 'unavailable') {
            $reasons[] = 'Service is not permitted in this country.';
        } elseif ($service->access === 'restricted') {
            $reasons[] = 'Service requires specific permission ('.AvailabilityState::label($service->availability_state).').';
        }
        if (in_array($service->availability_state, [AvailabilityState::QUOTE_ONLY, AvailabilityState::PARTNER_ROUTED], true)) {
            $reasons[] = AvailabilityState::label($service->availability_state).' — '.AvailabilityState::meta($service->availability_state)['money'].'.';
        }
        if (! $service->price_permit) {
            $reasons[] = 'No signed ResolvedPricePermit for this service.';
        }

        $allowed = $reasons === [] && $service->price_zar !== null;
        $quote = $profile['quote_permission'] && $service->access !== 'unavailable';

        return [
            'price_allowed' => $allowed,
            'price_zar' => $allowed ? $service->price_zar : null,
            'reasons' => $reasons,
            'quote_permitted' => $quote,
            'eligible' => $profile['transaction_permission'] && $service->access === 'available',
            'route' => match (true) {
                $allowed => 'Purchase at resolved price',
                $quote && $service->access === 'available' => 'Request a quote (controlled route)',
                $profile['state'] === AvailabilityState::SHELL || $service->access !== 'available' => 'Register interest (waitlist)',
                default => 'Ask a question',
            },
        ];
    }

    public static function pct(float $value): string
    {
        return rtrim(rtrim(number_format($value, 1), '0'), '.').'%';
    }
}
