import { useMemo } from 'react';
import type { DashboardData, Task, Epic, ProjectSummary } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { Avatar } from '../Avatar';
import type { Status } from '../../types';

interface ProjectListViewProps {
  data: DashboardData;
}

export function ProjectListView({ data }: ProjectListViewProps) {
  const projects = useMemo<ProjectSummary[]>(() => {
    const projectMap = new Map<string, Task[]>();
    for (const task of data.tasks) {
      const arr = projectMap.get(task.project) ?? [];
      arr.push(task);
      projectMap.set(task.project, arr);
    }

    return Array.from(projectMap.entries()).map(([project, tasks]) => {
      const epics = data.epics.filter((e) => e.project === project);
      const done = tasks.filter((t) => t.status === 'Done').length;
      const active = tasks.filter((t) => t.status === 'In Progress').length;
      const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      const dates = [...tasks.map((t) => t.start_date), ...tasks.map((t) => t.end_date)].sort();
      const assignees = [...new Set(tasks.map((t) => t.assignee))];
      const squads = [...new Set(tasks.map((t) => t.squad))];
      const lastUpdated = tasks
        .map((t) => t.last_updated)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      return {
        project,
        epics,
        total_tasks: tasks.length,
        done_tasks: done,
        active_tasks: active,
        progress,
        start_date: dates[0] ?? '',
        end_date: dates[dates.length - 1] ?? '',
        assignees,
        squads,
        quarter: tasks[0]?.quarter,
        business_scope: tasks[0]?.business_scope,
        last_updated: lastUpdated,
      };
    });
  }, [data]);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="min-w-[900px]">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-3 py-2 text-[10px] text-text-muted uppercase tracking-wider border-b border-border mb-1">
          <span>Project</span>
          <span>Status</span>
          <span>Squad</span>
          <span>Quarter</span>
          <span>Dates</span>
          <span>Tasks</span>
          <span>Progress</span>
          <span>Updated</span>
        </div>

        {/* Epic rows grouped by project */}
        {projects.map((p) => (
          <ProjectSection key={p.project} summary={p} data={data} />
        ))}
      </div>
    </div>
  );
}

function ProjectSection({ summary, data }: { summary: ProjectSummary; data: DashboardData }) {
  const projectTasks = data.tasks.filter((t) => t.project === summary.project);

  return (
    <div className="mb-4">
      {/* Project header row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-3 py-2 bg-surface-2 border border-border rounded-t items-center">
        <div>
          <div className="text-sm font-semibold text-text-primary">{summary.project}</div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {summary.epics.length} epic{summary.epics.length !== 1 ? 's' : ''} ·{' '}
            {summary.total_tasks} tasks
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {projectTasks
            .slice(0, 3)
            .map((t) => (
              <StatusBadge key={t.id} status={t.status as Status} />
            ))}
        </div>
        <div className="text-xs text-text-secondary truncate">
          {summary.squads.slice(0, 2).join(', ')}
        </div>
        <div className="text-xs text-text-muted">{summary.quarter ?? '—'}</div>
        <div className="text-[11px] text-text-muted">
          <span>{summary.start_date}</span>
          <br />
          <span>{summary.end_date}</span>
        </div>
        <div className="text-xs text-text-secondary">
          <span className="text-green-400">{summary.done_tasks}</span>
          <span className="text-text-muted"> / {summary.total_tasks}</span>
          <br />
          <span className="text-blue-400 text-[10px]">{summary.active_tasks} active</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-indigo"
                style={{ width: `${summary.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted w-7 text-right">{summary.progress}%</span>
          </div>
        </div>
        <div className="text-[10px] text-text-muted">
          {summary.last_updated
            ? new Date(summary.last_updated).toLocaleDateString()
            : '—'}
        </div>
      </div>

      {/* Task rows */}
      <div className="border border-t-0 border-border rounded-b divide-y divide-border/40">
        {projectTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const typeColors: Record<string, string> = {
    Task: 'text-blue-400',
    Milestone: 'text-amber-400',
    Story: 'text-indigo-400',
    Spike: 'text-orange-400',
    Initiative: 'text-orange-500',
    Bug: 'text-red-400',
    Epic: 'text-purple-400',
  };

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-3 py-1.5 items-center hover:bg-surface-2/50 transition-colors text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] text-text-muted font-mono flex-shrink-0">{task.id}</span>
        <span className="text-text-secondary truncate">{task.summary}</span>
      </div>
      <StatusBadge status={task.status as Status} />
      <span className="text-text-muted truncate text-[11px]">{task.squad}</span>
      <span className={`text-[11px] ${typeColors[task.issue_type] ?? 'text-text-muted'}`}>
        {task.issue_type}
      </span>
      <div className="text-[10px] text-text-muted">
        <span>{task.start_date}</span>
        <br />
        <span>{task.end_date}</span>
      </div>
      <div className="flex items-center gap-1">
        <Avatar name={task.assignee} size="sm" />
        <span className="text-[10px] text-text-muted truncate">{task.assignee}</span>
      </div>
      <span className="text-text-muted text-[11px]">{task.business_scope ?? '—'}</span>
      <span className="text-[10px] text-text-muted">
        {task.last_updated ? new Date(task.last_updated).toLocaleDateString() : '—'}
      </span>
    </div>
  );
}
