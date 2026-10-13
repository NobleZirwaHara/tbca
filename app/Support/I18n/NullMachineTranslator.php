<?php

namespace App\Support\I18n;

/** Default translator: translates nothing, so untranslated keys keep showing English. */
class NullMachineTranslator implements MachineTranslator
{
    public function translate(array $texts, string $locale): array
    {
        return [];
    }
}
