import { useState, useMemo, useCallback } from 'react';
import type { Task, Epic, ActiveFilters, DashboardData } from '../types';
import { DEFAULT_FILTERS } from '../store/appStore';

export function useFilters(data: DashboardData | null) {
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);

  const setFilter = useCallback(
    (key: keyof ActiveFilters, value: string | boolean | string[]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const filteredData = useMemo(() => {
    if (!data) return data;

    const q = filters.search.toLowerCase().trim();

    const taskMatch = (t: Task): boolean => {
      if (filters.squad && t.squad !== filters.squad) return false;
      if (filters.assignee && t.assignee !== filters.assignee) return false;
      if (filters.project && t.project !== filters.project) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.quarter && t.quarter !== filters.quarter) return false;
      if (filters.business_scope && t.business_scope !== filters.business_scope) return false;
      if (filters.task_types.length && !filters.task_types.includes(t.issue_type)) return false;
      if (q) {
        const haystack = `${t.summary} ${t.assignee} ${t.id} ${t.project}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    };

    return {
      ...data,
      tasks: data.tasks.filter(taskMatch),
      leaves: filters.show_leave ? data.leaves : [],
    };
  }, [data, filters]);

  return { filters, setFilter, resetFilters, filteredData };
}
