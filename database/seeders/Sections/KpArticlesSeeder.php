<?php

namespace Database\Seeders\Sections;

use App\Models\Kp\KpArticle;
use App\Models\Kp\KpRecord;
use App\Support\Content\KpArticles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Loads Kruger Phiri's articles from the versioned files in
 * database/seeders/Sections/data/kp-articles into kp_articles.
 *
 * Idempotent: rows are matched by slug and updated in place; an article whose
 * files are removed is removed from the table. The text is loaded exactly as it
 * stands in the files; nothing is generated here.
 */
class KpArticlesSeeder extends Seeder
{
    public function run(): void
    {
        $order = array_flip(array_keys(KpArticles::CATEGORIES));
        $files = collect(KpArticles::files())
            ->sortBy(fn ($f) => sprintf('%d-%s', $order[$f[0]['category']], 99999999 - (int) str_replace('-', '', (string) ($f[0]['date'] ?? '0'))))
            ->values();

        $slugs = [];
        foreach ($files as $i => [$m, $body]) {
            $words = KpArticles::words($body);
            $search = Str::lower(implode(' ', array_filter([
                $m['title'], $m['deck'] ?? '', $m['kicker'] ?? '', KpArticles::plain($body),
                implode(' ', array_column($m['sources'], 'text')),
                implode(' ', array_column($m['countries'], 'name')),
            ])));

            KpArticle::updateOrCreate(['slug' => $m['slug']], [
                'category' => $m['category'],
                'type' => $m['type'],
                'title' => $m['title'],
                'kicker' => $m['kicker'],
                'deck' => $m['deck'],
                'published_on' => $m['date'],
                'date_note' => $m['date_note'],
                'voice' => $m['voice'],
                'scope' => $m['scope'],
                'theme' => $m['themes'][0],
                'themes' => $m['themes'],
                'countries' => $m['countries'],
                'featured' => (bool) $m['featured'],
                'read_minutes' => max(1, (int) ceil($words / 200)),
                'word_count' => $words,
                'body' => $body,
                'search_text' => KpArticles::plain($search),
                'sources_heading' => $m['sources_heading'],
                'sources' => $m['sources'],
                'notes' => $m['notes'],
                'source' => $m['source'],
                'conversion_fixes' => $m['conversion_fixes'],
                'sort' => $i,
            ]);
            $slugs[] = $m['slug'];
        }

        KpArticle::query()->whereNotIn('slug', $slugs)->delete();

        // The governance lifecycle console listed these items as awaiting KP's text.
        $titles = $files->map(fn ($f) => $f[0]['title'])->all();
        KpRecord::query()->where('kind', 'console')->where('data->console', 'lifecycle')->whereIn('title', $titles)->get()
            ->each(fn (KpRecord $r) => $r->update(['status' => 'Published', 'data' => ['note' => 'Full text supplied by KP on 18 Oct 2026'] + $r->data]));
    }
}
