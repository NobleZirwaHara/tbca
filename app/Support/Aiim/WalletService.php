<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Wallet;
use App\Models\Aiim\WalletTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Prepaid AIIM credits. Credits are bought through the shared checkout (VAT is
 * charged on the top-up) and are usable only against AIIM platform services;
 * they are not stored-value banking (blueprint §3 "Wallet credit").
 * The ledger is append-only: the balance is the running total of transactions.
 */
class WalletService
{
    public static function wallet(User $user): Wallet
    {
        return Wallet::firstOrCreate(['user_id' => $user->id]);
    }

    public static function balance(User $user): float
    {
        return round((float) WalletTransaction::query()->where('user_id', $user->id)->sum('amount_zar'), 2);
    }

    public static function summary(User $user): array
    {
        $tx = WalletTransaction::query()->where('user_id', $user->id);

        return [
            'balance' => self::balance($user),
            'total' => round((float) (clone $tx)->where('amount_zar', '>', 0)->where('type', 'top-up')->sum('amount_zar'), 2),
            'used' => round(abs((float) (clone $tx)->where('type', 'debit')->sum('amount_zar')) - (float) (clone $tx)->where('type', 'credit')->sum('amount_zar'), 2),
            'reserved' => 0.0,
            'expiring' => 0.0,
        ];
    }

    /** Credit the wallet for a paid top-up order. Idempotent per order. */
    public static function creditOrder(Order $order, float $credits, string $description): ?WalletTransaction
    {
        if (! $order->isPaid() || WalletTransaction::query()->where('order_id', $order->id)->exists()) {
            return null;
        }

        return self::post($order->user, 'top-up', $credits, $description, $order->id);
    }

    public static function credit(User $user, float $amount, string $description, ?string $relatedKey = null): WalletTransaction
    {
        return self::post($user, 'credit', abs($amount), $description, null, $relatedKey);
    }

    /** Debit credits for a confirmed purchase. Throws when the balance is insufficient. */
    public static function debit(User $user, float $amount, string $description, ?string $relatedKey = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $description, $relatedKey) {
            // Lock the user's ledger so two unlocks cannot overspend the same balance.
            WalletTransaction::query()->where('user_id', $user->id)->lockForUpdate()->get(['id']);
            if (self::balance($user) + 0.001 < $amount) {
                throw new RuntimeException('Insufficient wallet credits. Please top up your wallet.');
            }

            return self::post($user, 'debit', -abs($amount), $description, null, $relatedKey);
        });
    }

    private static function post(User $user, string $type, float $amount, string $description, ?int $orderId = null, ?string $relatedKey = null): WalletTransaction
    {
        $balance = self::balance($user) + $amount;

        return WalletTransaction::create([
            'reference' => Refs::make('WTX'),
            'user_id' => $user->id,
            'type' => $type,
            'amount_zar' => round($amount, 2),
            'balance_zar' => round($balance, 2),
            'description' => $description,
            'order_id' => $orderId,
            'related_key' => $relatedKey,
        ]);
    }
}
