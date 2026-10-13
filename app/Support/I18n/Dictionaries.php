<?php

namespace App\Support\I18n;

use Illuminate\Support\Facades\File;

/**
 * The lang/{locale}.json dictionaries shared by __() on the server and t() in the
 * front end. Keys are the English source text; English itself needs no file.
 */
class Dictionaries
{
    /** @return list<string> language codes other than English */
    public static function locales(): array
    {
        return collect(config('tbca.languages'))->pluck('code')->reject(fn ($code) => $code === 'en')->values()->all();
    }

    public static function path(string $locale): string
    {
        return lang_path("{$locale}.json");
    }

    /** @return array<string, string> */
    public static function load(string $locale): array
    {
        $path = self::path($locale);

        return File::exists($path) ? (json_decode(File::get($path), true) ?: []) : [];
    }

    /** Every key used in any dictionary: the English strings the site expects to be translated. */
    public static function keys(): array
    {
        return collect(self::locales())->flatMap(fn ($locale) => array_keys(self::load($locale)))->unique()->values()->all();
    }

    /** @return list<string> keys present in another dictionary but missing (or empty) in this one */
    public static function missing(string $locale, ?array $extraKeys = null): array
    {
        $dictionary = self::load($locale);

        return collect([...self::keys(), ...($extraKeys ?? [])])
            ->unique()
            ->filter(fn ($key) => ($dictionary[$key] ?? '') === '')
            ->values()
            ->all();
    }

    /** Adds translations to a dictionary, keeping existing entries. Returns the number added. */
    public static function merge(string $locale, array $translations): int
    {
        $dictionary = self::load($locale);
        $added = 0;

        foreach ($translations as $key => $text) {
            if (($dictionary[$key] ?? '') === '' && is_string($text) && $text !== '') {
                $dictionary[$key] = $text;
                $added++;
            }
        }

        File::put(self::path($locale), json_encode($dictionary, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n");

        return $added;
    }

    public static function translator(): MachineTranslator
    {
        $class = config('tbca.translation.translator', NullMachineTranslator::class);

        return app($class);
    }
}
