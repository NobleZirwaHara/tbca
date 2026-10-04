<?php

namespace App\Support\Platform;

use App\Models\BasketItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * The visitor's basket. Guests are keyed by a token held in their session (it
 * survives session regeneration); on login the guest basket is merged into the
 * client's basket (see claimFor).
 */
class Basket
{
    public function __construct(private Request $request) {}

    public function guestToken(): string
    {
        $session = $this->request->session();

        if (! $session->has('basket_token')) {
            $session->put('basket_token', (string) Str::uuid());
        }

        return $session->get('basket_token');
    }

    public function query(): Builder
    {
        $user = $this->request->user();

        return $user
            ? BasketItem::query()->where('user_id', $user->id)
            : BasketItem::query()->whereNull('user_id')->where('session_id', $this->guestToken());
    }

    /** @return Collection<int, BasketItem> */
    public function items(): Collection
    {
        return $this->query()->oldest()->get();
    }

    public function count(): int
    {
        return (int) $this->query()->sum('quantity');
    }

    /**
     * @param  array{item_type: string, item_code: string, name: string, unit_zar: int, variant?: ?string, quantity?: int, commercial_act?: string, meta?: array}  $line
     */
    public function add(array $line): BasketItem
    {
        $existing = $this->query()
            ->where('item_type', $line['item_type'])
            ->where('item_code', $line['item_code'])
            ->where('variant', $line['variant'] ?? null)
            ->first();

        if ($existing) {
            $existing->update(['quantity' => $existing->quantity + ($line['quantity'] ?? 1)]);

            return $existing;
        }

        return BasketItem::create([
            ...$line,
            'quantity' => $line['quantity'] ?? 1,
            'user_id' => $this->request->user()?->id,
            'session_id' => $this->request->user() ? null : $this->guestToken(),
        ]);
    }

    public function remove(int $id): void
    {
        $this->query()->whereKey($id)->delete();
    }

    public function clear(): void
    {
        $this->query()->delete();
    }

    public function subtotal(): int
    {
        return $this->items()->sum(fn (BasketItem $item) => $item->lineZar());
    }

    public static function claimFor(int $userId, ?string $guestToken): void
    {
        if ($guestToken === null) {
            return;
        }

        BasketItem::query()
            ->whereNull('user_id')
            ->where('session_id', $guestToken)
            ->update(['user_id' => $userId, 'session_id' => null]);
    }
}
