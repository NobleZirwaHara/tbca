<?php

namespace App\Support\Content;

use App\Models\Kp\KpArticle;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\ExternalLink\ExternalLinkExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\MarkdownConverter;

/**
 * Kruger Phiri's articles (Drive folder "ARTICLES-KP THOT LEADERSHIP", supplied
 * 18 October 2026). The texts are stored as versioned files in
 * database/seeders/Sections/data/kp-articles/<category>/<slug>.md with a
 * <slug>.json metadata file each, and loaded into kp_articles by KpArticlesSeeder.
 *
 * The article body, standfirst, sources and notes are KP's own text. Only
 * conversion artefacts were fixed (listed per article under conversion_fixes).
 */
class KpArticles
{
    /** Drive folder => [section label, path under the KP base]. */
    public const CATEGORIES = [
        'insights' => ['Insights', '/insights'],
        'founders-notes' => ["Founder's Notes", '/founders-notes'],
        'resources' => ['KP Resources', '/resources'],
    ];

    /** Folders in KP's Drive that were empty on 18 October 2026. */
    public const EMPTY_FOLDERS = ['AFRICA LENS', 'BUSINESS CLINIC', 'SPEAKING AND MEDIA'];

    public static function dataPath(string $sub = ''): string
    {
        return database_path('seeders/Sections/data/kp-articles'.($sub !== '' ? '/'.$sub : ''));
    }

    /**
     * Every source file pair as [meta, body markdown], in category order.
     *
     * @return list<array{0: array<string, mixed>, 1: string}>
     */
    public static function files(): array
    {
        $out = [];
        foreach (array_keys(self::CATEGORIES) as $cat) {
            foreach (glob(self::dataPath($cat).'/*.json') ?: [] as $json) {
                $meta = json_decode((string) file_get_contents($json), true, flags: JSON_THROW_ON_ERROR);
                $out[] = [$meta, (string) file_get_contents(substr($json, 0, -5).'.md')];
            }
        }

        return $out;
    }

    /** Canonical public URL of an article. */
    public static function href(string $category, string $slug): string
    {
        return KpThoughtLeadership::BASE.(self::CATEGORIES[$category][1] ?? '/insights').'/'.$slug;
    }

    /** Plain text of a markdown fragment (for search and word counts). */
    public static function plain(string $md): string
    {
        $text = preg_replace('/\]\([^)]*\)/', ']', $md) ?? $md;       // drop link targets
        $text = preg_replace('/<https?:[^>]+>/', ' ', $text) ?? $text;  // autolinks
        $text = preg_replace('/^\s*\|?[-:| ]+\|?\s*$/m', ' ', $text) ?? $text; // table rules
        $text = str_replace(['\\[', '\\]', '\\|', '\\$', '\\*'], ['[', ']', '|', '$', '*'], $text);
        $text = preg_replace('/[#*>_`|\[\]]+/', ' ', $text) ?? $text;

        return trim(preg_replace('/\s+/u', ' ', $text) ?? $text);
    }

    public static function words(string $md): int
    {
        return preg_match_all('/[\p{L}\p{N}][\p{L}\p{N}’\'\-.,%]*/u', self::plain($md));
    }

    private static ?MarkdownConverter $converter = null;

    private static function converter(): MarkdownConverter
    {
        if (! self::$converter) {
            $env = new Environment([
                'html_input' => 'escape',
                'allow_unsafe_links' => false,
                'external_link' => [
                    'internal_hosts' => [(string) parse_url((string) config('app.url'), PHP_URL_HOST)],
                    'open_in_new_window' => true,
                    'noopener' => 'external',
                    'noreferrer' => 'external',
                    'nofollow' => '',
                ],
            ]);
            $env->addExtension(new CommonMarkCoreExtension);
            $env->addExtension(new GithubFlavoredMarkdownExtension);
            $env->addExtension(new ExternalLinkExtension);
            self::$converter = new MarkdownConverter($env);
        }

        return self::$converter;
    }

    /**
     * Article body as HTML with anchor ids on section headings, plus the contents list.
     *
     * @return array{html: string, toc: list<array{id: string, text: string}>}
     */
    public static function render(string $md): array
    {
        $html = (string) self::converter()->convert($md);
        $toc = [];
        $used = [];
        $html = preg_replace_callback('/<h2>(.*?)<\/h2>/s', function ($m) use (&$toc, &$used) {
            $text = html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_HTML5);
            $id = Str::slug(Str::limit($text, 60, '')) ?: 'section';
            $base = $id;
            for ($i = 2; isset($used[$id]); $i++) {
                $id = $base.'-'.$i;
            }
            $used[$id] = true;
            $toc[] = ['id' => $id, 'text' => $text];

            return '<h2 id="'.$id.'">'.$m[1].'</h2>';
        }, $html) ?? $html;
        // Wide tables scroll inside their own frame on small screens.
        $html = str_replace(['<table>', '</table>'], ['<div class="kp-table"><table>', '</table></div>'], $html);

        return ['html' => $html, 'toc' => $toc];
    }

    /** One inline fragment (a source line or a note) as HTML without the wrapping paragraph. */
    public static function inline(string $md): string
    {
        $html = trim((string) self::converter()->convert($md));

        return preg_replace('/^<p>(.*)<\/p>$/s', '$1', $html) ?? $html;
    }

    /**
     * Slugs whose full text contains the phrase, or every word of it.
     *
     * @return list<string>
     */
    public static function matching(string $q): array
    {
        $q = Str::lower(trim($q));
        if ($q === '') {
            return [];
        }
        $words = array_values(array_filter(preg_split('/\s+/', $q) ?: [], fn ($w) => mb_strlen($w) > 2));
        try {
            return KpArticle::query()
                ->where(function ($w) use ($q, $words) {
                    $w->where('search_text', 'like', '%'.$q.'%');
                    if (count($words) > 1) {
                        $w->orWhere(function ($all) use ($words) {
                            foreach ($words as $word) {
                                $all->where('search_text', 'like', '%'.$word.'%');
                            }
                        });
                    }
                })
                ->pluck('slug')->all();
        } catch (QueryException) {
            return [];
        }
    }

    /** "16 October 2026", or the agreed wording when the document carries no date. */
    public static function dateLabel(?string $date): string
    {
        return $date ? Carbon::parse($date)->format('j F Y') : 'Date to be confirmed';
    }
}
