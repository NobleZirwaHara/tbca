<?php

namespace App\Support\Countries;

/**
 * CT-TEB v2.0 Part 5 / Appendix F — country and service availability states,
 * their commercial meaning and the authority required to move between them.
 */
class AvailabilityState
{
    public const ACTIVE = 'ACTIVE';
    public const ACTIVE_LIMITED = 'ACTIVE-LIMITED';
    public const QUOTE_ONLY = 'QUOTE-ONLY';
    public const PARTNER_ROUTED = 'PARTNER-ROUTED';
    public const INTELLIGENCE_ONLY = 'INTELLIGENCE-ONLY';
    public const CORRIDOR_ONLY = 'CORRIDOR-ONLY';
    public const SOVEREIGN_ONLY = 'SOVEREIGN-CLIENT-ONLY';
    public const WAITLIST = 'WAITLIST';
    public const SHELL = 'INACTIVE/SHELLED';
    public const DEGRADED = 'DEGRADED';
    public const SUSPENDED = 'SUSPENDED';
    public const RESTRICTED = 'RESTRICTED';

    /** Ordered as Appendix F. */
    public const ALL = [
        self::ACTIVE, self::ACTIVE_LIMITED, self::QUOTE_ONLY, self::PARTNER_ROUTED,
        self::INTELLIGENCE_ONLY, self::CORRIDOR_ONLY, self::SOVEREIGN_ONLY, self::WAITLIST,
        self::SHELL, self::DEGRADED, self::SUSPENDED, self::RESTRICTED,
    ];

    /** States that are part of a permitted commercial environment (new sale possible, conditionally). */
    public const COMMERCIAL = [
        self::ACTIVE, self::ACTIVE_LIMITED, self::QUOTE_ONLY, self::PARTNER_ROUTED,
        self::CORRIDOR_ONLY, self::SOVEREIGN_ONLY,
    ];

    public const PROTECTIVE = [self::DEGRADED, self::SUSPENDED, self::RESTRICTED];

    public const LEVELS = [
        'L0' => 'System protective downgrade',
        'L1' => 'Operational remediation',
        'L2' => 'Commercial approval',
        'L3' => 'Qualified legal/tax/professional determination',
        'L4' => 'Board / Executive release',
    ];

    public static function meta(string $state): array
    {
        return match ($state) {
            self::ACTIVE => ['label' => 'Activated', 'meaning' => 'Normal permitted scope', 'money' => 'Yes if resolver fully resolves', 'new_sale' => 'Conditional'],
            self::ACTIVE_LIMITED => ['label' => 'Active (Limited)', 'meaning' => 'Subset of scope/routes permitted', 'money' => 'Only permitted subset', 'new_sale' => 'Conditional'],
            self::QUOTE_ONLY => ['label' => 'Quote-Only', 'meaning' => 'Manual/controlled quote route only', 'money' => 'No fixed price unless quote resolver produces permit', 'new_sale' => 'Conditional'],
            self::PARTNER_ROUTED => ['label' => 'Partner-Routed', 'meaning' => 'Qualified/approved partner must deliver or review', 'money' => 'No direct route that bypasses partner gate', 'new_sale' => 'Conditional'],
            self::INTELLIGENCE_ONLY => ['label' => 'Intelligence-Only', 'meaning' => 'Evidence/intelligence available, service commerce not allowed', 'money' => 'No service price', 'new_sale' => 'No'],
            self::CORRIDOR_ONLY => ['label' => 'Corridor-Only', 'meaning' => 'Only specified corridor products may be eligible', 'money' => 'No general country service sale', 'new_sale' => 'Conditional'],
            self::SOVEREIGN_ONLY => ['label' => 'Sovereign-Client-Only', 'meaning' => 'Restricted to approved sovereign/institution engagement pattern', 'money' => 'No general market sale', 'new_sale' => 'Conditional'],
            self::WAITLIST => ['label' => 'Waitlist', 'meaning' => 'Demand capture only under privacy controls', 'money' => 'No price / transaction', 'new_sale' => 'No'],
            self::SHELL => ['label' => 'Shell', 'meaning' => 'Geographic/data shell only', 'money' => 'No transaction', 'new_sale' => 'No'],
            self::DEGRADED => ['label' => 'Degraded', 'meaning' => 'Existing rights may continue selectively; new commitments constrained', 'money' => 'No new sale unless explicitly permitted subset', 'new_sale' => 'No'],
            self::SUSPENDED => ['label' => 'Suspended', 'meaning' => 'New commitments stopped; controlled wind-down/incident handling', 'money' => 'No new sale', 'new_sale' => 'No'],
            self::RESTRICTED => ['label' => 'Restricted', 'meaning' => 'Prohibition/sanctions/regulatory restriction', 'money' => 'No commercial override', 'new_sale' => 'No'],
            default => ['label' => $state, 'meaning' => 'Unknown state', 'money' => 'No transaction', 'new_sale' => 'No'],
        };
    }

    public static function label(string $state): string
    {
        return self::meta($state)['label'];
    }

    public static function isActive(string $state): bool
    {
        return in_array($state, self::COMMERCIAL, true);
    }

    /**
     * Public legend bucket (activated / shell / degraded / suspended / restricted).
     * Colour is never used alone — the bucket always travels with its text label.
     */
    public static function bucket(string $state): string
    {
        return match (true) {
            self::isActive($state) => 'activated',
            $state === self::DEGRADED => 'degraded',
            $state === self::SUSPENDED => 'suspended',
            $state === self::RESTRICTED => 'restricted',
            default => 'shell',
        };
    }

    public static function options(): array
    {
        return array_map(fn ($s) => ['value' => $s, 'label' => self::label($s).' ('.$s.')'], self::ALL);
    }

    /**
     * Appendix F.1 transition authority. Returns null when permitted or the refusal reason.
     *
     * @param  array{rcs: float, hard_blocks: int}  $resolver
     */
    public static function refusal(string $from, string $to, string $level, ?string $certificate, array $resolver): ?string
    {
        $rank = (int) substr($level, 1);

        if ($from === $to) {
            return 'The country is already in that state.';
        }

        if (! in_array($to, self::ALL, true)) {
            return 'Unknown target state.';
        }

        // Protective downgrade: any level may apply it, nobody may use it to upgrade.
        if (in_array($to, self::PROTECTIVE, true)) {
            return null;
        }

        if ($from === self::RESTRICTED && $rank < 3) {
            return 'Restriction removal requires a new qualified prohibition/legal determination (L3) plus release (L4).';
        }

        if ($to === self::SHELL) {
            return $rank >= 4 ? null : 'Returning a country to shell (exit / withdrawal) requires Board / Executive release (L4).';
        }

        if (in_array($from, [self::SHELL, self::WAITLIST, self::INTELLIGENCE_ONLY], true) && self::isActive($to)) {
            if ($rank < 4) {
                return 'Country activation requires Track C, G-D9 and a release certificate under Board / Executive authority (L4).';
            }
            if (! $certificate) {
                return 'Country activation requires an activation / release certificate reference.';
            }
            if ($resolver['rcs'] < 100 || $resolver['hard_blocks'] > 0) {
                return sprintf('G-D9 not passed: Resolver Completeness is %s%% with %d hard block(s). No manual 100%% override is permitted.', rtrim(rtrim(number_format($resolver['rcs'], 3), '0'), '.'), $resolver['hard_blocks']);
            }

            return null;
        }

        if ($from === self::DEGRADED || $from === self::SUSPENDED) {
            return $rank >= 1 ? null : 'Operational restoration needs evidence remediation (L1) — system downgrades cannot upgrade.';
        }

        if (in_array($to, [self::WAITLIST, self::INTELLIGENCE_ONLY], true)) {
            return $rank >= 2 ? null : 'Scope changes require Commercial approval (L2) within legal/tax/professional bounds.';
        }

        // Commercial scope change between permitted states.
        return $rank >= 2 ? null : 'Commercial scope changes require Commercial approval (L2) within legal/tax/professional bounds.';
    }
}
