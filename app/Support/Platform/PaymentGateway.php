<?php

namespace App\Support\Platform;

/**
 * Simulated payment gateway. No real money moves; it reproduces the outcomes
 * the checkout screens need so the flows can be exercised end to end:
 *
 *  - card ending 0002  -> declined
 *  - card ending 0119  -> processing (pending)
 *  - any other valid card number -> approved
 *  - eft -> pending until proof of payment is reconciled
 *  - wallet -> approved
 *
 * Swap this class for a real provider (PayFast, Peach, Stripe) behind the same charge() signature.
 */
class PaymentGateway
{
    /**
     * @return array{status: 'succeeded'|'pending'|'failed', reason?: string, meta?: array}
     */
    public static function charge(string $method, int $amountZar, array $details): array
    {
        if ($method === 'eft') {
            return ['status' => 'pending', 'meta' => ['instructions' => 'Use the order reference as your EFT payment reference.']];
        }

        if ($method === 'wallet') {
            return ['status' => 'succeeded', 'meta' => ['wallet' => 'TBCA Wallet']];
        }

        $number = preg_replace('/\D/', '', (string) ($details['card_number'] ?? ''));
        $meta = ['last4' => substr($number, -4), 'brand' => str_starts_with($number, '5') ? 'Mastercard' : 'Visa'];

        if (strlen($number) < 12) {
            return ['status' => 'failed', 'reason' => 'Card number is incomplete.', 'meta' => $meta];
        }

        return match (substr($number, -4)) {
            '0002' => ['status' => 'failed', 'reason' => 'The card was declined by the issuing bank.', 'meta' => $meta],
            '0119' => ['status' => 'pending', 'reason' => 'Awaiting 3-D Secure confirmation from the bank.', 'meta' => $meta],
            default => ['status' => 'succeeded', 'meta' => $meta],
        };
    }
}
