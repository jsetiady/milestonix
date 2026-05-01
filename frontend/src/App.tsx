import { useState, useCallback } from 'react';
import { useData } from './hooks/useData';
import { useFilters } from './hooks/useFilters';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { TimelineView } from './components/Timeline/TimelineView';
import { ResourceView } from './components/Resource/ResourceView';
import { ProjectListView } from './components/ProjectList/ProjectListView';
import type { ViewMode, DashboardData } from './types';

export default function App() {
  const { data, filterOptions, loading, error, syncing, runSync } = useData();
  const { filters, setFilter, resetFilters, filteredData } = useFilters(data);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  // Expand/collapse state
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(() => new Set());
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(() => new Set());

  const toggleEpic = useCallback((id: string) => {
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!data) return;
    setExpandedEpics(new Set(data.epics.map((e) => e.id)));
    setExpandedMilestones(
      new Set(data.tasks.filter((t) => t.issue_type === 'Milestone').map((t) => t.id))
    );
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedEpics(new Set());
    setExpandedMilestones(new Set());
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center">
        <div className="bg-surface-2 border border-red-300 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 text-sm font-semibold mb-2">Failed to load data</div>
          <div className="text-text-muted text-xs mb-4">{error}</div>
          <p className="text-text-muted text-xs">
            Make sure the backend is running: <br />
            <code className="font-mono text-text-secondary">uvicorn backend.main:app --reload</code>
          </p>
        </div>
      </div>
    );
  }

  const displayData = filteredData ?? data!;

  return (
    <div className="h-screen bg-surface-0 flex flex-col overflow-hidden text-text-primary">
      <Header
        viewMode={viewMode}
        onViewChange={setViewMode}
        syncing={syncing}
        onSync={runSync}
        search={filters.search}
        onSearch={(v) => setFilter('search', v)}
      />
      <FilterBar
        filterOptions={filterOptions}
        filters={filters}
        onFilter={setFilter}
        onReset={resetFilters}
      />

      <main className="flex flex-1 overflow-hidden">
        {viewMode === 'timeline' && (
          <TimelineView
            data={displayData}
            expandedEpics={expandedEpics}
            expandedMilestones={expandedMilestones}
            onToggleEpic={toggleEpic}
            onToggleMilestone={toggleMilestone}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        )}
        {viewMode === 'resource' && <ResourceView data={displayData} />}
        {viewMode === 'list' && <ProjectListView data={displayData} />}
      </main>
    </div>
  );
}
