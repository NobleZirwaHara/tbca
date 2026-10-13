<?php

namespace App\Support\Integrations;

use App\Models\IntegrationEvent;

/**
 * The 90/10 automation measure from section 12 of the implementation guide,
 * computed from the integration ledger.
 *
 *  - Routine straight-through rate: routine task instances completed with no
 *    human intervention / routine task instances attempted.
 *  - Overall automation share: all task instances completed with no human
 *    intervention / all task instances, including human review gates and
 *    exceptions, so hard work cannot drop out of the denominator.
 *  - Human minutes: staff time logged when a person resolves an event. The
 *    guide's human-time share also needs a measured four-week labour
 *    baseline, which the ledger cannot supply on its own.
 *
 * Events recorded while the integration is off ("held") are excluded.
 */
class AutomationCoverage
{
    public static function report(): array
    {
        $rows = IntegrationEvent::query()
            ->whereNotNull('process')
            ->where('status', '!=', 'held')
            ->selectRaw('process, type, status, handled_by, count(*) as n, coalesce(sum(human_minutes), 0) as minutes')
            ->groupBy('process', 'type', 'status', 'handled_by')
            ->get();

        $processes = [];
        foreach (Processes::PROCESSES as $code => $p) {
            $processes[$code] = [
                'code' => $code,
                'name' => $p['name'],
                'humanGate' => $p['human_gate'],
                'instrumented' => Processes::typesFor($code) !== [],
                'tasks' => 0, 'automated' => 0, 'human' => 0, 'open' => 0, 'failed' => 0,
                'routineTasks' => 0, 'routineAutomated' => 0, 'humanMinutes' => 0,
            ];
        }

        foreach ($rows as $r) {
            if (! isset($processes[$r->process])) {
                continue;
            }
            $p = &$processes[$r->process];
            $n = (int) $r->n;
            $automated = $r->status === 'complete' && $r->handled_by === 'automated';
            $routine = Processes::kindOf($r->type) === 'routine';

            $p['tasks'] += $n;
            $p['automated'] += $automated ? $n : 0;
            $p['human'] += $r->handled_by === 'human' ? $n : 0;
            $p['open'] += in_array($r->status, ['pending', 'sent'], true) ? $n : 0;
            $p['failed'] += $r->status === 'failed' ? $n : 0;
            $p['routineTasks'] += $routine ? $n : 0;
            $p['routineAutomated'] += ($routine && $automated) ? $n : 0;
            $p['humanMinutes'] += (int) $r->minutes;
            unset($p);
        }

        $out = array_map(fn ($p) => $p + [
            'straightThrough' => self::ratio($p['routineAutomated'], $p['routineTasks']),
            'automationShare' => self::ratio($p['automated'], $p['tasks']),
        ], array_values($processes));

        $sum = fn (string $k) => array_sum(array_column($out, $k));
        $totals = [
            'tasks' => $sum('tasks'), 'automated' => $sum('automated'), 'human' => $sum('human'), 'open' => $sum('open'),
            'failed' => $sum('failed'), 'routineTasks' => $sum('routineTasks'), 'routineAutomated' => $sum('routineAutomated'),
            'humanMinutes' => $sum('humanMinutes'),
        ];
        $totals['straightThrough'] = self::ratio($totals['routineAutomated'], $totals['routineTasks']);
        $totals['automationShare'] = self::ratio($totals['automated'], $totals['tasks']);

        return [
            'target' => (float) config('zoho.automation_target', 0.9),
            'processes' => $out,
            'totals' => $totals,
            'held' => IntegrationEvent::where('status', 'held')->count(),
        ];
    }

    private static function ratio(int $part, int $whole): ?float
    {
        return $whole > 0 ? round($part / $whole, 4) : null;
    }
}
