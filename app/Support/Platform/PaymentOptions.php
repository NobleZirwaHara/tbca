<?php

namespace App\Support\Platform;

/**
 * Payment gateways, methods and banks from the client's "Payment Methods - TBCA"
 * document (Aug 2026). Display register only: the live checkout still runs on the
 * simulated PaymentGateway (card / EFT / TBCA Wallet) until a real gateway is integrated.
 *
 * `live` = the method is already accepted by the current checkout; everything else is
 * shown as "coming soon".
 */
class PaymentOptions
{
    public const GATEWAYS = ['Flutterwave', 'Paystack', 'Yoco', 'Pesapal', 'Onafriq', 'DPO Pay', 'Cellulant Tingg'];

    public const BANKS = ['FNB', 'Standard Bank', 'Access Bank', 'Capitec'];

    /** [key, label, short note, live now, checkout method key it maps to] */
    private const METHODS = [
        ['cards', 'Visa / Mastercard debit and credit cards', 'Pay instantly by card with 3-D Secure.', true, 'card'],
        ['apple-google-pay', 'Apple Pay / Google Pay', 'Tap to pay from your phone or browser.', false, null],
        ['instant-eft', 'Pay by Bank / Instant EFT', 'Authorise a payment directly from your bank.', false, null],
        ['capitec-pay', 'Capitec Pay', 'Approve the payment in the Capitec app.', false, null],
        ['debicheck', 'DebiCheck', 'Authenticated debit order for subscriptions and retainers.', false, null],
        ['manual-eft', 'Manual EFT / Bank Transfer', 'Pay by bank transfer using your order reference.', true, 'eft'],
        ['payshap', 'PayShap / Request to Pay', 'Real-time payment request to your banking app.', false, null],
        ['po-invoice', 'PO + Invoice + Bank Transfer', 'For organisations paying against a purchase order.', false, null],
        ['payment-links', 'Payment Links', 'A secure link sent by TBCA for quotes and invoices.', false, null],
        ['mobile-money', 'Mobile Money (E-Wallet or equivalent)', 'Mobile money and e-wallets available in your country.', false, null],
        ['crypto', 'Crypto Wallets', 'Selected digital-asset wallets.', false, null],
    ];

    public static function methods(): array
    {
        return array_map(fn (array $m) => [
            'key' => $m[0],
            'label' => $m[1],
            'note' => $m[2],
            'live' => $m[3],
            'checkout_method' => $m[4],
            'status' => $m[3] ? 'Available now' : 'Coming soon',
        ], self::METHODS);
    }

    /** Everything the payment UIs need, in one shared payload. */
    public static function register(): array
    {
        return [
            'gateways' => self::GATEWAYS,
            'methods' => self::methods(),
            'banks' => self::BANKS,
            'platform_wallet' => 'TBCA Wallet (prepaid platform credit) is also accepted now.',
            'note' => 'Additional gateways and methods are being integrated; availability may differ by country and currency.',
        ];
    }
}
