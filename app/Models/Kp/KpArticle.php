<?php

namespace App\Models\Kp;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/** One of Kruger Phiri's articles, loaded from the versioned source files by KpArticlesSeeder. */
#[Unguarded]
class KpArticle extends Model
{
    protected $table = 'kp_articles';

    protected function casts(): array
    {
        return [
            'byline' => 'array',
            'published_on' => 'date',
            'themes' => 'array',
            'countries' => 'array',
            'featured' => 'boolean',
            'sources' => 'array',
            'notes' => 'array',
            'source' => 'array',
            'conversion_fixes' => 'array',
        ];
    }
}
