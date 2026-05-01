import type { IssueType, Status, Priority } from '../types';

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  Task: 'bg-blue-500/20 border-blue-500/60 text-blue-300',
  Milestone: 'bg-amber-500/20 border-amber-500/60 text-amber-300',
  Story: 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300',
  Spike: 'bg-orange-500/20 border-orange-500/60 text-orange-300',
  Initiative: 'bg-orange-600/20 border-orange-600/60 text-orange-400',
  Bug: 'bg-red-500/20 border-red-500/60 text-red-300',
  Epic: 'bg-purple-500/20 border-purple-500/60 text-purple-300',
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
  Todo: 'text-slate-400',
  'In Progress': 'text-blue-400',
  'In Review': 'text-purple-400',
  Done: 'text-green-400',
  Blocked: 'text-red-400',
  Cancelled: 'text-slate-600',
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
