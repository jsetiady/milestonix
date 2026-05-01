import { useState, useCallback } from 'react';
import type {
  DashboardData,
  FilterOptions,
  ActiveFilters,
  ViewMode,
} from '../types';

export const DEFAULT_FILTERS: ActiveFilters = {
  squad: '',
  assignee: '',
  project: '',
  status: '',
  quarter: '',
  business_scope: '',
  show_leave: true,
  task_types: [],
  search: '',
};

// Shared app state - passed as props (no heavy state lib needed for local tool)
export interface AppState {
  data: DashboardData | null;
  filterOptions: FilterOptions | null;
  filters: ActiveFilters;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  expandedEpics: Set<string>;
  expandedMilestones: Set<string>;
  allExpanded: boolean;
}

export const INITIAL_STATE: AppState = {
  data: null,
  filterOptions: null,
  filters: DEFAULT_FILTERS,
  viewMode: 'timeline',
  loading: true,
  error: null,
  syncing: false,
  expandedEpics: new Set(),
  expandedMilestones: new Set(),
  allExpanded: false,
};
