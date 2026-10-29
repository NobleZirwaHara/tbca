<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Translation coverage for lang/{locale}.json, and the machine-translation hook.
|   php artisan tbca:translations                 coverage per language
|   php artisan tbca:translations --locale=ar     one language, listing missing keys
|   php artisan tbca:translations --fill          translate missing keys with the configured MachineTranslator
*/
Artisan::command('tbca:translations {--locale=* : Limit to these language codes} {--fill : Fill missing keys with the configured machine translator}', function () {
    $locales = $this->option('locale') ?: \App\Support\I18n\Dictionaries::locales();
    $total = count(\App\Support\I18n\Dictionaries::keys());

    foreach ($locales as $locale) {
        $missing = \App\Support\I18n\Dictionaries::missing($locale);
        $this->line(sprintf('%-4s %d of %d keys translated, %d missing', $locale, $total - count($missing), $total, count($missing)));

        if ($this->option('locale')) {
            foreach ($missing as $key) {
                $this->line('     - '.$key);
            }
        }

        if ($this->option('fill') && $missing) {
            $added = \App\Support\I18n\Dictionaries::merge($locale, \App\Support\I18n\Dictionaries::translator()->translate($missing, $locale));
            $this->info("     {$added} keys added by ".get_class(\App\Support\I18n\Dictionaries::translator()).'.');
        }
    }
})->purpose('Report translation coverage and fill missing keys through the machine translation hook');

/*
| Zoho One outbox: send pending integration events every minute. The command
| does nothing until ZOHO_ENABLED=true and the OAuth credentials are set.
*/
\Illuminate\Support\Facades\Schedule::command('zoho:sync')->everyMinute()->withoutOverlapping();

/*
| Registry of Deliverables: write deliverables for app Sprints the client's register does not cover.
|   php artisan deliverables:generate            rewrite database/seeders/Sections/data/deliverables/generated.json
|   php artisan deliverables:generate --dry-run  print the counts only
| Then reload with: php artisan db:seed --class='Database\Seeders\Sections\DeliverablesRegisterSeeder'
*/
Artisan::command('deliverables:generate {--dry-run : Print the counts and write nothing}', function () {
    $generator = new \App\Support\Deliverables\SprintDeliverableGenerator;
    $doc = $this->option('dry-run') ? $generator->build() : $generator->write();
    $byTemplate = collect($doc['rows'])->countBy('template_ref')->sortDesc();
    $this->info(sprintf('%d deliverables for uncovered app Sprints (%d shared texts), built from %d comparable register deliverables.', $doc['count'], count($doc['texts']), $byTemplate->count()));
})->purpose('Write TBCA-generated deliverables for app Sprints the client register does not cover');

/*
| Registry of Deliverables: link Issue 1.0 deliverables to the app's products.
|   php artisan deliverables:map-products   rewrite the links file and the review CSV
*/
Artisan::command('deliverables:map-products', function () {
    \App\Support\Deliverables\ProductCodes::backfill();
    $doc = (new \App\Support\Deliverables\ProductMapper)->write();
    $review = collect($doc['review']);
    $this->info(sprintf('%d Issue 1.0 deliverables: %d linked (%d links), %d not linked.', $review->count(), $review->where('decision', 'linked')->count(), count($doc['links']), $review->where('decision', 'not linked')->count()));
})->purpose('Link the register deliverables to app products by product code');
