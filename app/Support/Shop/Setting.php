<?php

namespace App\Support\Shop;

use App\Models\Shop\Setting as SettingModel;

/** Tiny key/value store for console run timestamps and release state. */
class Setting
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return SettingModel::query()->find($key)?->value['v'] ?? $default;
    }

    public static function put(string $key, mixed $value): void
    {
        SettingModel::query()->updateOrCreate(['key' => $key], ['value' => ['v' => $value]]);
    }
}
