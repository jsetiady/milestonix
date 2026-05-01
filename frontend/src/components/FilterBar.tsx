import type { FilterOptions, ActiveFilters } from '../types';

interface FilterBarProps {
  filterOptions: FilterOptions | null;
  filters: ActiveFilters;
  onFilter: (key: keyof ActiveFilters, value: string | boolean | string[]) => void;
  onReset: () => void;
}

export function FilterBar({ filterOptions, filters, onFilter, onReset }: FilterBarProps) {
  const hasActive =
    filters.squad ||
    filters.assignee ||
    filters.project ||
    filters.status ||
    filters.quarter ||
    filters.business_scope ||
    filters.task_types.length > 0 ||
    !filters.show_leave;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-1 border-b border-border text-xs flex-wrap">
      <Select
        label="Squad"
        value={filters.squad}
        options={filterOptions?.squads ?? []}
        onChange={(v) => onFilter('squad', v)}
      />
      <Select
        label="Engineer"
        value={filters.assignee}
        options={filterOptions?.engineers ?? []}
        onChange={(v) => onFilter('assignee', v)}
      />
      <Select
        label="Status"
        value={filters.status}
        options={filterOptions?.statuses ?? []}
        onChange={(v) => onFilter('status', v)}
      />
      <Select
        label="Project"
        value={filters.project}
        options={filterOptions?.projects ?? []}
        onChange={(v) => onFilter('project', v)}
      />
      <Select
        label="Quarter"
        value={filters.quarter}
        options={filterOptions?.quarters ?? []}
        onChange={(v) => onFilter('quarter', v)}
      />
      <Select
        label="Scope"
        value={filters.business_scope}
        options={filterOptions?.business_scopes ?? []}
        onChange={(v) => onFilter('business_scope', v)}
      />

      <div className="w-px h-4 bg-border mx-1" />

      {/* Leave toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none text-text-muted hover:text-text-secondary">
        <input
          type="checkbox"
          checked={filters.show_leave}
          onChange={(e) => onFilter('show_leave', e.target.checked)}
          className="rounded border-border bg-surface-3 w-3 h-3 accent-indigo-500"
        />
        Leave
      </label>

      {/* Task type multi-select toggles */}
      <div className="flex items-center gap-1">
        {(filterOptions?.task_types ?? []).map((tt) => {
          const active = filters.task_types.includes(tt);
          return (
            <button
              key={tt}
              onClick={() => {
                const next = active
                  ? filters.task_types.filter((x) => x !== tt)
                  : [...filters.task_types, tt];
                onFilter('task_types', next);
              }}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                active
                  ? 'border-accent-indigo text-accent-indigo bg-accent-indigo/10'
                  : 'border-border text-text-muted hover:border-border hover:text-text-secondary'
              }`}
            >
              {tt}
            </button>
          );
        })}
      </div>

      {hasActive && (
        <button
          onClick={onReset}
          className="ml-auto text-text-muted hover:text-text-primary flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-text-muted text-[10px] uppercase tracking-wide">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-surface-3 border rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-accent-indigo appearance-none cursor-pointer ${
          value ? 'border-accent-indigo text-text-primary' : 'border-border text-text-secondary'
        }`}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
