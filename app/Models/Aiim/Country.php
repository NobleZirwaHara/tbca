<?php

namespace App\Models\Aiim;

use App\Support\Platform\Africa;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Country extends Model
{
    /** AU region key => label (canonical register). */
    public const REGIONS = Africa::REGIONS;

    protected $table = 'aiim_countries';

    protected function casts(): array
    {
        return [
            'indicators' => 'array',
            'subregions' => 'array',
            'has_province_pack' => 'boolean',
            'area_km2' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function regionName(): string
    {
        return self::REGIONS[$this->region] ?? ucfirst($this->region);
    }

    /** Flag emoji from the ISO2 code (regional indicator symbols). */
    public function flag(): string
    {
        return implode('', array_map(fn ($c) => mb_chr(0x1F1E6 + ord($c) - 65), str_split(strtoupper($this->iso2))));
    }

    /** Compact list item for selects and the map. */
    public function summary(): array
    {
        return ['slug' => $this->slug, 'name' => $this->name, 'iso2' => $this->iso2, 'region' => $this->region, 'regionName' => $this->regionName(), 'flag' => $this->flag()];
    }

    /** Full cockpit profile: permanent facts plus flagged placeholder indicators. */
    public function profile(): array
    {
        return $this->summary() + [
            'iso3' => $this->iso3,
            'capital' => $this->capital,
            'currencyCode' => $this->currency_code,
            'currencyName' => $this->currency_name,
            'areaKm2' => $this->area_km2,
            'indicators' => $this->indicators ?? [],
            'subregions' => $this->subregions ?? [],
            'hasProvincePack' => $this->has_province_pack,
        ];
    }

    /** All 54 countries for selects, ordered by name. */
    public static function options(): array
    {
        return static::query()->orderBy('name')->get()->map(fn (self $c) => $c->summary())->all();
    }
}
