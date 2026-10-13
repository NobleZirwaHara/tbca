<?php

namespace App\Support\I18n;

/**
 * Hook point for a machine translation service (DeepL, Google Cloud Translation,
 * Azure Translator or an LLM). Not wired to a paid API: the configured class is
 * config('tbca.translation.translator'), NullMachineTranslator by default.
 * See docs/INTEGRATIONS_PLAN.md section 11.
 */
interface MachineTranslator
{
    /**
     * Translates English source strings into `$locale`.
     *
     * Implementations must keep Laravel placeholders (":count", ":name") and
     * brand names (TBCA, AIIM, Sprint, NIKIWE) unchanged.
     *
     * @param  list<string>  $texts  English source strings (the dictionary keys)
     * @return array<string, string> source => translation; strings it cannot translate are left out
     */
    public function translate(array $texts, string $locale): array;
}
