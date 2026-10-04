<?php

namespace App\Support\Products\Digital;

/**
 * Closed licence classes L1–L5 (Blueprint Part 4.1) with buyer copy, the
 * declared-use selector (Screen 4) and the upgrade rules (Part 4.3).
 */
class Licences
{
    public const CLASSES = ['L1', 'L2', 'L3', 'L4', 'L5'];

    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return [
            'L1' => [
                'code' => 'L1', 'name' => 'Just Me', 'short' => 'Just me', 'icon' => 'user',
                'summary' => 'I may use it for my own internal work.',
                'allowed' => ['Internal personal use only'],
                'not_allowed' => ['Sharing with others', 'Group or team use', 'Client-facing work', 'Resale or distribution'],
                'permitted_use' => 'Personal internal use only',
            ],
            'L2' => [
                'code' => 'L2', 'name' => 'One Organisation', 'short' => 'One organisation', 'icon' => 'users',
                'summary' => 'Authorised staff may use it internally.',
                'allowed' => ['Internal team use', 'Across departments', 'Secure controlled access'],
                'not_allowed' => ['Group entities', 'Client-facing use', 'Resale or white-label'],
                'permitted_use' => 'Internal business use only',
            ],
            'L3' => [
                'code' => 'L3', 'name' => 'Group Entities', 'short' => 'Group entities', 'icon' => 'building',
                'summary' => 'Internal use across approved group entities.',
                'allowed' => ['Named group entities', 'Internal workflows', 'Centralised access'],
                'not_allowed' => ['Client-facing use', 'White-label or resale'],
                'permitted_use' => 'Internal use across named group entities',
            ],
            'L4' => [
                'code' => 'L4', 'name' => 'Client Work', 'short' => 'Client-facing use', 'icon' => 'briefcase',
                'summary' => 'Use in work you deliver to clients (no resale).',
                'allowed' => ['Client deliverables', 'Consultancy projects', 'Internal + client use'],
                'not_allowed' => ['White-label / resale', 'Third-party redistribution'],
                'permitted_use' => 'Internal and client deliverable use (no resale)',
            ],
            'L5' => [
                'code' => 'L5', 'name' => 'White-label / Resale', 'short' => 'White-label / resale', 'icon' => 'award',
                'summary' => 'Approved white-label or resale rights.',
                'allowed' => ['White-label rights', 'Resale & distribution', 'Commercial reuse'],
                'not_allowed' => [],
                'permitted_use' => 'Only rights granted in the separate commercial schedule',
                'review' => 'This licence requires a separate commercial schedule and TBCA approval.',
            ],
        ];
    }

    /** Declared intended use (Step 1 of 6) -> recommended class. */
    public static function declaredUses(): array
    {
        return [
            ['key' => 'own', 'label' => 'My own work', 'body' => 'I will use this product only for my own internal work.', 'licence' => 'L1'],
            ['key' => 'organisation', 'label' => 'My organisation', 'body' => 'Authorised staff in my organisation will use this product internally.', 'licence' => 'L2'],
            ['key' => 'group', 'label' => 'Group entities', 'body' => 'We are several named group entities using this product internally.', 'licence' => 'L3'],
            ['key' => 'clients', 'label' => 'Work for my clients', 'body' => 'I will use this product in work I deliver to my clients (no resale).', 'licence' => 'L4'],
            ['key' => 'resale', 'label' => 'White-label or resale', 'body' => 'I need to white-label, repurpose or resell the source product.', 'licence' => 'L5'],
        ];
    }

    public static function recommendedFor(string $use): string
    {
        return collect(self::declaredUses())->firstWhere('key', $use)['licence'] ?? 'L2';
    }

    /**
     * Screen 4 rule: a class is adequate only if it covers the declared use.
     * Client-facing use means L1–L3 are not adequate; resale needs L5.
     */
    public static function isAdequate(string $class, string $use): bool
    {
        $needed = self::recommendedFor($use);

        return array_search($class, self::CLASSES) >= array_search($needed, self::CLASSES);
    }

    public static function label(string $class): string
    {
        return $class.' – '.(self::all()[$class]['name'] ?? $class);
    }

    /** Part 4.3: L1->L2/L3/L4, L2->L3/L4, L3->L4; L5 only via separate review. */
    public static function upgradeTargets(string $from): array
    {
        $i = array_search($from, self::CLASSES);

        return $i === false ? [] : array_values(array_filter(
            array_slice(self::CLASSES, $i + 1),
            fn ($c) => $c !== 'L5',
        ));
    }

    /** Upgrade price = target licence price − approved prior-licence credit (amount paid, ex VAT). */
    public static function upgradePrice(array $prices, string $from, string $to, int $paidZar): int
    {
        $target = (int) ($prices[$to] ?? 0);
        $credit = min($paidZar, (int) ($prices[$from] ?? $paidZar));

        return max(0, $target - $credit);
    }
}
