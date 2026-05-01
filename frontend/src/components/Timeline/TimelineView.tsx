import { useState, useMemo, useRef } from 'react';
import type { DashboardData, Task, Epic, Leave } from '../../types';
import { buildTimelineRange, parseDate } from '../../utils/dates';
import { assignLanes, getLaneCount } from '../../utils/scheduler';
import { DateHeader } from './DateHeader';
import { TimelineGrid } from './TimelineGrid';
import { TaskBar, COL_WIDTH, ROW_HEIGHT } from './TaskBar';
import { SprintBanner, SPRINT_BANNER_AREA_HEIGHT } from './SprintBanner';
import { LeaveOverlay } from './LeaveOverlay';
import { Avatar } from '../Avatar';
import { StatusBadge } from '../StatusBadge';
import { ISSUE_TYPE_ICONS, ISSUE_TYPE_BAR_COLORS } from '../../utils/colors';
import type { Status, IssueType } from '../../types';

const LEFT_PANEL_WIDTH = 240;
const SECTION_HEADER_HEIGHT = 32;

interface TimelineViewProps {
  data: DashboardData;
  expandedEpics: Set<string>;
  expandedMilestones: Set<string>;
  onToggleEpic: (id: string) => void;
  onToggleMilestone: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

interface RowDef {
  type: 'epic' | 'milestone' | 'task';
  item: Epic | Task;
  depth: number;
  tasks?: Task[]; // for epic/milestone summary bars
}

export function TimelineView({
  data,
  expandedEpics,
  expandedMilestones,
  onToggleEpic,
  onToggleMilestone,
  onExpandAll,
  onCollapseAll,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build timeline date range from all tasks + sprints
  const timelineRange = useMemo(() => {
    const allDates = [
      ...data.tasks.map((t) => t.start_date),
      ...data.tasks.map((t) => t.end_date),
      ...data.sprints.map((s) => s.start_date),
      ...data.sprints.map((s) => s.end_date),
    ].filter(Boolean);

    if (!allDates.length) {
      const today = new Date();
      return buildTimelineRange(today, today, data.holidays);
    }

    const sorted = [...allDates].sort();
    const start = parseDate(sorted[0]);
    const end = parseDate(sorted[sorted.length - 1]);

    // Pad by 5 workdays on each side
    const padStart = new Date(start);
    padStart.setDate(padStart.getDate() - 7);
    const padEnd = new Date(end);
    padEnd.setDate(padEnd.getDate() + 7);

    return buildTimelineRange(padStart, padEnd, data.holidays);
  }, [data]);

  const { workdays } = timelineRange;

  // Group tasks by epic → milestone hierarchy
  const taskMap = useMemo(() => {
    const m = new Map<string, Task>();
    data.tasks.forEach((t) => m.set(t.id, t));
    return m;
  }, [data.tasks]);

  // Build rows
  const rows = useMemo<RowDef[]>(() => {
    const result: RowDef[] = [];

    for (const epic of data.epics) {
      const epicTasks = data.tasks.filter((t) => t.epic === epic.id);
      const milestones = epicTasks.filter((t) => t.issue_type === 'Milestone');
      const standaloneTasks = epicTasks.filter((t) => t.issue_type !== 'Milestone');

      result.push({ type: 'epic', item: epic, depth: 0, tasks: epicTasks });

      if (expandedEpics.has(epic.id)) {
        for (const ms of milestones) {
          // Tasks grouped under this milestone via "blocks"
          const msTasks = ms.blocks
            .map((id) => taskMap.get(id))
            .filter((t): t is Task => !!t);

          result.push({
            type: 'milestone',
            item: ms,
            depth: 1,
            tasks: msTasks,
          });

          if (expandedMilestones.has(ms.id)) {
            for (const t of msTasks) {
              result.push({ type: 'task', item: t, depth: 2 });
            }
          }
        }

        // Tasks not under any milestone
        const msTaskIds = new Set(milestones.flatMap((m) => m.blocks));
        const loose = standaloneTasks.filter((t) => !msTaskIds.has(t.id));
        for (const t of loose) {
          result.push({ type: 'task', item: t, depth: 1 });
        }
      }
    }

    // Tasks with no epic
    const epicTaskIds = new Set(data.tasks.filter((t) => t.epic).map((t) => t.id));
    const orphans = data.tasks.filter((t) => !epicTaskIds.has(t.id) && t.issue_type !== 'Milestone');
    for (const t of orphans) {
      result.push({ type: 'task', item: t, depth: 0 });
    }

    return result;
  }, [data, expandedEpics, expandedMilestones, taskMap]);

  // Assign lanes per row
  const rowHeights = useMemo(() => {
    return rows.map((row) => {
      if (row.type === 'task') {
        const t = row.item as Task;
        assignLanes([t], workdays);
        return ROW_HEIGHT;
      }
      // Epic/Milestone: assign lanes to all child tasks
      if (row.tasks && row.tasks.length) {
        assignLanes(row.tasks, workdays);
        const lanes = getLaneCount(row.tasks);
        return Math.max(lanes * ROW_HEIGHT, ROW_HEIGHT);
      }
      return ROW_HEIGHT;
    });
  }, [rows, workdays]);

  // Leave map: assignee → leaves
  const leaveByAssignee = useMemo(() => {
    const m = new Map<string, Leave[]>();
    for (const l of data.leaves) {
      const arr = m.get(l.assignee) ?? [];
      arr.push(l);
      m.set(l.assignee, arr);
    }
    return m;
  }, [data.leaves]);

  // Sprints split: regular vs drp
  const regularSprints = data.sprints.filter((s) => !s.is_drp);
  const drpSprints = data.sprints.filter((s) => s.is_drp);

  const totalHeight = rowHeights.reduce((s, h) => s + h + SECTION_HEADER_HEIGHT, 0);
  const gridWidth = workdays.length * COL_WIDTH;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div
        className="flex-shrink-0 flex flex-col bg-surface-1 border-r border-border overflow-y-auto"
        style={{ width: LEFT_PANEL_WIDTH }}
      >
        {/* Left header */}
        <div
          className="sticky top-0 z-10 bg-surface-1 border-b border-border flex items-center px-3 gap-2"
          style={{ height: 44 }}
        >
          <span className="text-[10px] text-text-muted uppercase tracking-wider flex-1">
            Project / Epic Architecture
          </span>
          <button
            onClick={onExpandAll}
            className="text-[10px] text-text-muted hover:text-text-secondary px-1"
            title="Expand all"
          >
            ⊞
          </button>
          <button
            onClick={onCollapseAll}
            className="text-[10px] text-text-muted hover:text-text-secondary px-1"
            title="Collapse all"
          >
            ⊟
          </button>
        </div>

        {rows.map((row, i) => (
          <LeftPanelRow
            key={`${row.type}-${(row.item as Task | Epic).id}-${i}`}
            row={row}
            height={rowHeights[i]}
            expandedEpics={expandedEpics}
            expandedMilestones={expandedMilestones}
            onToggleEpic={onToggleEpic}
            onToggleMilestone={onToggleMilestone}
          />
        ))}
      </div>

      {/* Right: Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        {/* Sprint banners (sticky under date header) */}
        <div className="sticky top-0 z-20 bg-surface-0 border-b border-border">
          <DateHeader workdays={workdays} />
          <div
            className="relative overflow-hidden"
            style={{ height: SPRINT_BANNER_AREA_HEIGHT, width: gridWidth }}
          >
            {regularSprints.map((s, i) => (
              <SprintBanner key={s.id} sprint={s} workdays={workdays} rowIndex={0} />
            ))}
            {drpSprints.map((s, i) => (
              <SprintBanner key={s.id} sprint={s} workdays={workdays} rowIndex={1} />
            ))}
          </div>
        </div>

        {/* Task rows */}
        <div className="relative" style={{ width: gridWidth }}>
          {/* Background grid */}
          <TimelineGrid
            workdays={workdays}
            totalHeight={totalHeight}
            sprintBannerHeight={0}
          />

          {/* Today vertical marker */}
          {(() => {
            const todayIdx = workdays.findIndex((w) => w.isToday);
            if (todayIdx === -1) return null;
            return (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10 pointer-events-none"
                style={{ left: todayIdx * COL_WIDTH + COL_WIDTH / 2 }}
              />
            );
          })()}

          {/* Rows */}
          {rows.map((row, i) => {
            const rowHeight = rowHeights[i];
            const assignee =
              row.type === 'task'
                ? (row.item as Task).assignee
                : undefined;
            const leaves = assignee ? (leaveByAssignee.get(assignee) ?? []) : [];

            return (
              <div
                key={`row-${i}`}
                className="relative border-b border-border/30"
                style={{ height: rowHeight + SECTION_HEADER_HEIGHT }}
              >
                {/* Section label strip */}
                <div
                  className="flex items-center px-2 border-b border-border/20"
                  style={{ height: SECTION_HEADER_HEIGHT }}
                />

                {/* Leave overlays */}
                {leaves.map((l) => (
                  <LeaveOverlay
                    key={l.id}
                    leave={l}
                    workdays={workdays}
                    rowHeight={rowHeight}
                  />
                ))}

                {/* Bars */}
                <div className="relative" style={{ height: rowHeight }}>
                  {row.type === 'task' ? (
                    <TaskBar task={row.item as Task} workdays={workdays} />
                  ) : (
                    (row.tasks ?? []).map((t) => (
                      <TaskBar key={t.id} task={t} workdays={workdays} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Left panel row ───────────────────────────────────────────────────────────

interface LeftPanelRowProps {
  row: RowDef;
  height: number;
  expandedEpics: Set<string>;
  expandedMilestones: Set<string>;
  onToggleEpic: (id: string) => void;
  onToggleMilestone: (id: string) => void;
}

function LeftPanelRow({
  row,
  height,
  expandedEpics,
  expandedMilestones,
  onToggleEpic,
  onToggleMilestone,
}: LeftPanelRowProps) {
  const item = row.item as Task & Epic;
  const isEpic = row.type === 'epic';
  const isMilestone = row.type === 'milestone';
  const isTask = row.type === 'task';

  const expanded = isEpic
    ? expandedEpics.has(item.id)
    : isMilestone
    ? expandedMilestones.has(item.id)
    : false;

  const hasChildren = isEpic || (isMilestone && (row.tasks?.length ?? 0) > 0);

  const icon = isEpic
    ? '⬡'
    : ISSUE_TYPE_ICONS[(item.issue_type as IssueType) ?? 'Task'] ?? '▪';
  const barColor = isEpic
    ? '#a855f7'
    : ISSUE_TYPE_BAR_COLORS[(item.issue_type as IssueType) ?? 'Task'];

  const handleToggle = () => {
    if (isEpic) onToggleEpic(item.id);
    else if (isMilestone) onToggleMilestone(item.id);
  };

  // Progress for epics/milestones
  const progress =
    !isTask && row.tasks?.length
      ? Math.round(
          (row.tasks.filter((t) => t.status === 'Done').length / row.tasks.length) * 100
        )
      : null;

  return (
    <div
      className="border-b border-border/30 flex flex-col justify-center"
      style={{ height: height + SECTION_HEADER_HEIGHT, paddingLeft: row.depth * 12 + 8 }}
    >
      <div
        className="flex items-center gap-1.5 cursor-pointer group"
        onClick={hasChildren ? handleToggle : undefined}
        style={{ height: SECTION_HEADER_HEIGHT }}
      >
        {hasChildren ? (
          <span className="text-text-muted text-[10px] w-3 flex-shrink-0">
            {expanded ? '▾' : '▸'}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}

        <span className="text-[10px] flex-shrink-0" style={{ color: barColor }}>
          {icon}
        </span>

        <span
          className={`text-xs truncate flex-1 ${
            isEpic ? 'font-semibold text-text-primary' : 'text-text-secondary'
          }`}
        >
          {isEpic ? (item as Epic).name : item.summary}
        </span>

        {isTask && (
          <Avatar name={item.assignee} size="sm" />
        )}
      </div>

      {/* Progress bar for epics/milestones */}
      {progress !== null && (
        <div className="flex items-center gap-1.5 mb-1" style={{ paddingLeft: 16 }}>
          <div className="flex-1 h-0.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-[9px] text-text-muted">{progress}%</span>
        </div>
      )}
    </div>
  );
}
