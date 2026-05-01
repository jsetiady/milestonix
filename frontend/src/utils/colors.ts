import type { IssueType, Status, Priority } from '../types';

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  Task: 'bg-blue-50 border-blue-300 text-blue-700',
  Milestone: 'bg-amber-50 border-amber-300 text-amber-700',
  Story: 'bg-indigo-50 border-indigo-300 text-indigo-700',
  Spike: 'bg-orange-50 border-orange-300 text-orange-700',
  Initiative: 'bg-orange-50 border-orange-400 text-orange-800',
  Bug: 'bg-red-50 border-red-300 text-red-700',
  Epic: 'bg-purple-50 border-purple-300 text-purple-700',
};

export const ISSUE_TYPE_BAR_COLORS: Record<IssueType, string> = {
  Task: '#3b82f6',
  Milestone: '#f59e0b',
  Story: '#6366f1',
  Spike: '#f97316',
  Initiative: '#ea580c',
  Bug: '#ef4444',
  Epic: '#a855f7',
};

export const STATUS_COLORS: Record<Status, string> = {
  Todo: 'text-slate-500',
  'In Progress': 'text-blue-600',
  'In Review': 'text-purple-600',
  Done: 'text-green-600',
  Blocked: 'text-red-600',
  Cancelled: 'text-slate-400',
};

export const STATUS_DOT_COLORS: Record<Status, string> = {
  Todo: 'bg-slate-500',
  'In Progress': 'bg-blue-500',
  'In Review': 'bg-purple-500',
  Done: 'bg-green-500',
  Blocked: 'bg-red-500',
  Cancelled: 'bg-slate-700',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'text-slate-400',
  Medium: 'text-blue-400',
  High: 'text-amber-400',
  Critical: 'text-red-400',
};

export const ISSUE_TYPE_ICONS: Record<IssueType, string> = {
  Task: '▪',
  Milestone: '◆',
  Story: '≡',
  Spike: '⚡',
  Initiative: '⚡',
  Bug: '●',
  Epic: '⬡',
};

export function getAssigneeColor(name: string): string {
  const colors = [
    '#6366f1', '#f59e0b', '#22c55e', '#ef4444',
    '#3b82f6', '#a855f7', '#f97316', '#14b8a6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getAssigneeInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
