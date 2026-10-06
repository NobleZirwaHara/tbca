<?php

/*
 * Final Basic / Standard / Premium figures per sprint, keyed by sprint code.
 *
 * Every sprint is normalised to exactly three packages (App\Support\Sprints\Packages).
 * Until the client's Batch 4A-4D workbooks are loaded, missing tiers are derived from
 * the register price (Basic -40%, Premium +50%). To apply the workbook figures, add
 * rows here and re-run the sprint seeders — no code change needed:
 *
 *   'SPR-0001' => [
 *       'basic' => ['zar' => 7500, 'delivery' => '5 days delivery'],
 *       'standard' => ['zar' => 14500, 'delivery' => '7 days delivery'],
 *       'premium' => ['zar' => 24500, 'delivery' => '10 days delivery', 'features' => ['...']],
 *   ],
 *
 * Any package field may be overridden (zar, delivery, description, features, badge).
 */

return [];
