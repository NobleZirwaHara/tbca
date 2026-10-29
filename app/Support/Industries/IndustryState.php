<?php

namespace App\Support\Industries;

use Illuminate\Support\Facades\DB;

/**
 * Visitor state for the Industries tab: the IndustryContext, the engagement journey, diagnostic
 * answers, benchmark inputs and consents, acknowledgements and evidence file names.
 *
 * Signed-in users keep it server-side (ind_states, scope "u:{id}") so it follows them across
 * devices; guests keep it in their session. Console-wide state (the misdeclaration queue) uses the
 * "global" scope.
 */
class IndustryState
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $user = auth()->user();
        if (! $user) {
            return session('ind_state.'.$key, $default);
        }

        return self::read('u:'.$user->getAuthIdentifier(), $key, $default);
    }

    public static function put(string $key, mixed $value): void
    {
        $user = auth()->user();
        if (! $user) {
            session(['ind_state.'.$key => $value]);

            return;
        }
        self::write('u:'.$user->getAuthIdentifier(), $key, $value);
    }

    public static function global(string $key, mixed $default = null): mixed
    {
        return self::read('global', $key, $default);
    }

    public static function putGlobal(string $key, mixed $value): void
    {
        self::write('global', $key, $value);
    }

    private static function read(string $scope, string $key, mixed $default): mixed
    {
        $v = DB::table('ind_states')->where('scope', $scope)->where('key', $key)->value('value');

        return $v === null ? $default : json_decode($v, true);
    }

    private static function write(string $scope, string $key, mixed $value): void
    {
        DB::table('ind_states')->upsert([['scope' => $scope, 'key' => $key, 'value' => json_encode($value), 'created_at' => now(), 'updated_at' => now()]], ['scope', 'key'], ['value', 'updated_at']);
    }

    /* ------------------------------------------------------------------ IndustryContext */

    /** The visitor's context: industry code, sub-industry code and country ISO3 (default the worked example). */
    public static function context(): array
    {
        return self::get('ictx', ['ind' => 'AGR', 'sub' => 'AGR2', 'iso' => 'BWA']);
    }

    /** Merge into the context; changing industry clears a sub-industry that does not belong to it (prototype setCtx). */
    public static function setContext(array $p): array
    {
        $ctx = array_merge(self::context(), array_filter($p, fn ($v) => $v !== null));
        if (isset($p['ind']) && ! array_key_exists('sub', $p)) {
            $x = IndustryData::industry($p['ind']);
            if ($x && ! IndustryData::sub($x, $ctx['sub'] ?? null)) {
                $ctx['sub'] = '';
            }
        }
        self::put('ictx', $ctx);

        return $ctx;
    }
}
