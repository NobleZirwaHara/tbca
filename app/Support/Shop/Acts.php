<?php

namespace App\Support\Shop;

/**
 * The seven commercial acts (blueprint Part 4) and how each one is labelled,
 * routed and grouped in the selection basket.
 */
class Acts
{
    public const ACTS = [
        'A1' => ['label' => 'A1 Fixed Sprint', 'short' => 'Fixed Sprint', 'mode' => 'LS-PURCHASE', 'basket' => 'purchase', 'cta' => 'Buy this Sprint',
            'statement' => 'You are buying a defined one-off Sprint. Payment starts the controlled fulfilment process after verification.'],
        'A2' => ['label' => 'A2 Digital Product', 'short' => 'Digital Product', 'mode' => 'LS-PURCHASE', 'basket' => 'purchase', 'cta' => 'Buy digital product',
            'statement' => 'You are buying the exact ProductVersion, licence, format, language and jurisdiction shown.'],
        'A3' => ['label' => 'A3 Subscription', 'short' => 'Subscription', 'mode' => 'LS-SUBSCRIBE', 'basket' => 'subscription', 'cta' => 'Subscribe Now',
            'statement' => 'You are entering a recurring commitment only after the recurrence class, billing period, mandate and cancellation route are disclosed and accepted.'],
        'A4' => ['label' => 'A4 Retainer', 'short' => 'Retainer', 'mode' => 'LS-RETAINER', 'basket' => 'retainer', 'cta' => 'Request proposal',
            'statement' => 'Submitting this request does not start a Retainer and no payment is taken now. A Retainer begins only after C1-C5, capacity, pricing and contract approval.'],
        'A5' => ['label' => 'A5 Marketplace Brief', 'short' => 'Marketplace Brief', 'mode' => 'LS-BRIEF', 'basket' => 'brief', 'cta' => 'Submit brief',
            'statement' => 'Submitting the brief does not appoint a provider, create an engagement or authorise payment.'],
        'A6' => ['label' => 'A6 Quote Request', 'short' => 'Quote Request', 'mode' => 'LS-QUOTE', 'basket' => 'quote', 'cta' => 'Request quote',
            'statement' => 'Requesting a quote does not create an order or payment obligation. The accepted quote/contract becomes the commercial instrument.'],
        'A7' => ['label' => 'A7 Free Access', 'short' => 'Free Access', 'mode' => 'LS-FREE', 'basket' => 'free', 'cta' => 'Access free',
            'statement' => 'Free access uses Approved Free Basis. Any later paid product is a separate commercial commitment.'],
    ];

    /** Listing states produced by the CA -> LS engine. */
    public const LISTING_STATES = [
        'LS-01' => 'Purchasable (Buy / Access)',
        'LS-02' => 'Purchasable (Proposal)',
        'LS-03' => 'Purchasable (Access - Free)',
        'LS-04' => 'Quote Only (Owner Verified)',
        'LS-05' => 'Honest Hold (Not Purchasable)',
        'LS-06' => 'Do Not List (Blocked)',
    ];

    /** Basket partition groups, in display order (blueprint 9.2). */
    public const BASKET_GROUPS = [
        'purchase' => ['mode' => 'LS-PURCHASE', 'title' => 'Immediate Purchase', 'checkout' => 'Online'],
        'quote' => ['mode' => 'LS-QUOTE', 'title' => 'Quote / Proposal', 'checkout' => 'Quote Process'],
        'subscription' => ['mode' => 'LS-SUBSCRIBE', 'title' => 'Recurring Subscription', 'checkout' => 'Mandate + Checkout'],
        'retainer' => ['mode' => 'LS-RETAINER', 'title' => 'Retainer Proposal', 'checkout' => 'Proposal Builder'],
        'brief' => ['mode' => 'LS-BRIEF', 'title' => 'Marketplace Brief', 'checkout' => 'Brief Submission'],
        'free' => ['mode' => 'LS-FREE', 'title' => 'Free Access', 'checkout' => 'Free Activation'],
    ];

    public static function label(string $act): string
    {
        return self::ACTS[$act]['label'] ?? $act;
    }

    public static function mode(string $act): string
    {
        return self::ACTS[$act]['mode'] ?? 'LS-PURCHASE';
    }

    public static function basketAct(string $act): string
    {
        return self::ACTS[$act]['basket'] ?? 'purchase';
    }

    /** Maps the shared sprint catalogue's commercial_act to a shop act. */
    public static function fromSprintAct(?string $act): string
    {
        return match ($act) {
            'quote' => 'A6',
            'subscription' => 'A3',
            'retainer' => 'A4',
            'free' => 'A7',
            default => 'A1',
        };
    }

    /** Key/label options for filters. */
    public static function options(): array
    {
        return collect(self::ACTS)->map(fn ($a, $k) => ['value' => $k, 'label' => $a['label']])->values()->all();
    }
}
