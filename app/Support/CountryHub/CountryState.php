<?php

namespace App\Support\CountryHub;

use App\Support\Industries\IndustryState;

/**
 * Visitor state for the Countries tab: the commercial journey (quote, letter, payment, workspace,
 * deliverables, changes, closure), waitlist entries, saved countries, planner ticks and the like.
 * Prototype pages kept these in localStorage; here signed-in users keep them server-side (ind_states,
 * scope "u:{id}") and guests in their session, under keys prefixed "cty.".
 */
class CountryState
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return IndustryState::get('cty.'.$key, $default);
    }

    public static function put(string $key, mixed $value): void
    {
        IndustryState::put('cty.'.$key, $value);
    }

    public static function global(string $key, mixed $default = null): mixed
    {
        return IndustryState::global('cty.'.$key, $default);
    }

    public static function putGlobal(string $key, mixed $value): void
    {
        IndustryState::putGlobal('cty.'.$key, $value);
    }

    /** Keys a page may write through the generic state endpoint. The commercial journey and waitlist change only through their own validated routes. */
    public const WRITABLE = '/^(saved|plan\.[a-z0-9_-]+|ticks\.[a-z0-9_-]+|lang|notes\.[a-z0-9_-]+)$/';
}
