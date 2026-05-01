import { useState, useEffect, useCallback } from 'react';
import type { DashboardData, FilterOptions } from '../types';

const API = '/api';

export function useData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dataRes, filtersRes] = await Promise.all([
        fetch(`${API}/tasks/all`),
        fetch(`${API}/config/filters`),
      ]);
      if (!dataRes.ok) throw new Error(`Data fetch failed: ${dataRes.status}`);
      if (!filtersRes.ok) throw new Error(`Filter fetch failed: ${filtersRes.status}`);
      const [dashboardData, filterData] = await Promise.all([
        dataRes.json(),
        filtersRes.json(),
      ]);
      setData(dashboardData);
      setFilterOptions(filterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/sync`, { method: 'POST' });
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync error');
    } finally {
      setSyncing(false);
    }
  }, [fetchAll]);

  const updateRank = useCallback(
    async (category: 'epics' | 'milestones' | 'tasks', orderedIds: string[]) => {
      await fetch(`${API}/config/rank/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderedIds),
      });
    },
    []
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, filterOptions, loading, error, syncing, fetchAll, runSync, updateRank };
}
