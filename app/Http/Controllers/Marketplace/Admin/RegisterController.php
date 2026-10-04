<?php

namespace App\Http\Controllers\Marketplace\Admin;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Support\Marketplace\Registers;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/** Generic governance register console backed by mkt_records (definitions in Support\Marketplace\Registers). */
class RegisterController extends Controller
{
    private function def(string $register): array
    {
        $def = Registers::get($register);
        abort_unless($def, 404);

        return $def;
    }

    private function rowValue(Record $r, string $key): mixed
    {
        return match ($key) {
            'reference' => $r->reference,
            'status' => $r->status,
            'priority' => $r->priority,
            default => $r->data[$key] ?? null,
        };
    }

    private function tabStatuses(array $def, string $tab): ?array
    {
        if ($tab === 'all') {
            return null;
        }

        return $def['tab_map'][$tab] ?? [$tab];
    }

    public function show(Request $request, string $register): Response
    {
        $def = $this->def($register);
        $all = Record::where('register', $register)->orderBy('id')->get();
        $tab = (string) $request->query('tab', array_key_first($def['tabs']));
        if (! isset($def['tabs'][$tab])) {
            $tab = array_key_first($def['tabs']);
        }
        $q = strtolower(trim((string) $request->query('q', '')));
        $filterValues = collect($def['filters'] ?? [])->mapWithKeys(fn ($l, $k) => [$k => (string) $request->query($k, '')])->filter();

        $rows = $all->filter(function (Record $r) use ($def, $tab, $q, $filterValues) {
            $statuses = $this->tabStatuses($def, $tab);
            if ($statuses !== null && ! in_array($r->status, $statuses, true)) {
                return false;
            }
            foreach ($def['tab_map'][$tab.'_where'] ?? ($tab === 'critical' ? ($def['tab_map']['critical_where'] ?? []) : []) as $k => $v) {
                if ($this->rowValue($r, $k) !== $v) {
                    return false;
                }
            }
            foreach ($filterValues as $k => $v) {
                if ((string) $this->rowValue($r, $k) !== $v) {
                    return false;
                }
            }
            if ($q !== '') {
                $hay = strtolower($r->reference.' '.implode(' ', array_map(fn ($v) => is_scalar($v) ? (string) $v : '', $r->data ?? [])));
                if (! str_contains($hay, $q)) {
                    return false;
                }
            }

            return true;
        });

        $counts = collect($def['tabs'])->mapWithKeys(function ($label, $key) use ($all, $def) {
            $statuses = $this->tabStatuses($def, $key);
            $set = $statuses === null ? $all : $all->whereIn('status', $statuses);
            if ($key === 'critical' && isset($def['tab_map']['critical_where'])) {
                foreach ($def['tab_map']['critical_where'] as $k => $v) {
                    $set = $set->filter(fn ($r) => $this->rowValue($r, $k) === $v);
                }
            }

            return [$key => $set->count()];
        });

        return Inertia::render('Marketplace/Admin/Register', [
            'registerKey' => $register,
            'def' => collect($def)->except(['tab_map'])->all(),
            'rows' => $rows->values()->map(fn (Record $r) => ['id' => $r->id, 'reference' => $r->reference, 'status' => $r->status, 'priority' => $r->priority, ...($r->data ?? [])]),
            'counts' => $counts,
            'kpis' => $this->kpis($def, $all),
            'breakdowns' => collect($def['breakdown'] ?? [])->map(fn ($title, $field) => [
                'title' => $title,
                'items' => $all->groupBy(fn ($r) => (string) ($this->rowValue($r, $field) ?? '—'))->map(fn ($g, $k) => ['label' => str_replace('_', ' ', $k), 'value' => $g->count()])->sortByDesc('value')->values(),
            ])->values(),
            'filterOptions' => collect($def['filters'] ?? [])->map(fn ($label, $key) => [
                'key' => $key, 'label' => $label,
                'options' => $all->map(fn ($r) => (string) ($this->rowValue($r, $key) ?? ''))->filter()->unique()->sort()->values(),
            ])->values(),
            'query' => ['tab' => $tab, 'q' => $request->query('q', ''), ...$filterValues->all()],
            'nav' => ['marketplace' => Registers::nav('marketplace'), 'partners' => Registers::nav('partners')],
        ]);
    }

    private function kpis(array $def, Collection $all): array
    {
        return collect($def['kpis'] ?? [])->map(function ($k) use ($all) {
            if (isset($k['value'])) {
                return [...$k, 'display' => $k['value']];
            }
            $metric = $k['metric'];
            $value = match (true) {
                $metric === 'count' => $all->count(),
                str_starts_with($metric, 'status:') => $all->whereIn('status', explode(',', substr($metric, 7)))->count(),
                str_starts_with($metric, 'priority:') => $all->where('priority', substr($metric, 9))->count(),
                str_starts_with($metric, 'field:') => (function () use ($all, $metric) {
                    [$f, $v] = explode('=', substr($metric, 6), 2);

                    return $all->filter(fn ($r) => ($r->data[$f] ?? null) === $v)->count();
                })(),
                str_starts_with($metric, 'sum:') => $all->filter(fn ($r) => ! in_array($r->status, ['resolved', 'remediated'], true))->sum(fn ($r) => (float) ($r->data[substr($metric, 4)] ?? 0)),
                default => 0,
            };

            return [...$k, 'display' => ! empty($k['money']) ? 'R '.number_format($value, 2) : number_format($value)];
        })->all();
    }

    public function action(Request $request, string $register, int $record): RedirectResponse
    {
        $def = $this->def($register);
        $rec = Record::where('register', $register)->findOrFail($record);
        $data = $request->validate(['action' => 'required|string', 'note' => 'nullable|string|max:500']);
        $rule = $def['actions'][$data['action']] ?? null;
        abort_unless($rule && in_array($rec->status, $rule['from'], true), 422, 'This action is not available for the current status.');

        $payload = $rec->data ?? [];
        $payload['history'][] = ['at' => now()->format('d M Y, H:i'), 'by' => $request->user()->name, 'action' => $rule['label'], 'from' => $rec->status, 'to' => $rule['to'], 'note' => $data['note'] ?? null];
        if (! empty($def['bump_version']) && $rule['to'] === 'approved') {
            $payload['version'] = number_format(((float) ($payload['version'] ?? 1.0)) + 0.1, 1);
            $payload['effective'] = now()->format('d M Y');
        }
        $rec->update(['status' => $rule['to'], 'data' => $payload]);

        // Performance console decisions apply to the live partner record (routing).
        if (! empty($def['sync_provider']) && ($partner = Provider::where('kind', 'partner')->where('name', $payload['partner'] ?? '')->first())) {
            $partner->update(['status' => match ($rule['to']) {
                'suspended' => 'suspended',
                'under_review' => 'active_with_conditions',
                default => 'active',
            }]);
        }

        return back()->with('success', "{$rec->reference}: {$rule['label']} recorded.");
    }

    /** Create a record (e.g. New Rule on the Capacity Rule console). */
    public function store(Request $request, string $register): RedirectResponse
    {
        $def = $this->def($register);
        abort_unless(isset($def['create']), 404);
        $rules = collect($def['create']['fields'])->mapWithKeys(fn ($f) => [$f['key'] => array_filter([
            ! empty($f['required']) ? 'required' : 'nullable', 'string', 'max:200', isset($f['options']) ? 'in:'.implode(',', $f['options']) : null,
        ])])->all();
        $data = $request->validate($rules);

        $n = Record::where('register', $register)->count() + 1;
        do {
            $ref = sprintf('%s-%03d', $def['create']['prefix'], $n++);
        } while (Record::where('register', $register)->where('reference', $ref)->exists());

        $priority = $data['priority'] ?? null;
        unset($data['priority']);
        Record::create(['register' => $register, 'reference' => $ref, 'status' => $def['create']['status'], 'priority' => $priority, 'data' => [...$data, 'created_by' => $request->user()->name]]);

        return back()->with('success', "{$ref} created and submitted for approval.");
    }
}
