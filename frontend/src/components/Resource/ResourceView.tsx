import { useMemo, useRef } from 'react';
import type { DashboardData, Task, Leave } from '../../types';
import { buildTimelineRange, parseDate } from '../../utils/dates';
import { assignLanes, getLaneCount } from '../../utils/scheduler';
import { DateHeader } from '../Timeline/DateHeader';
import { TimelineGrid } from '../Timeline/TimelineGrid';
import { TaskBar, COL_WIDTH, ROW_HEIGHT } from '../Timeline/TaskBar';
import { SprintBanner, SPRINT_BANNER_AREA_HEIGHT } from '../Timeline/SprintBanner';
import { LeaveOverlay } from '../Timeline/LeaveOverlay';
import { Avatar } from '../Avatar';
import { getAssigneeColor } from '../../utils/colors';

const LEFT_PANEL_WIDTH = 200;
const ROW_PADDING = 8;

interface ResourceViewProps {
  data: DashboardData;
}

export function ResourceView({ data }: ResourceViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const padStart = new Date(start);
    padStart.setDate(padStart.getDate() - 7);
    const padEnd = new Date(end);
    padEnd.setDate(padEnd.getDate() + 7);
    return buildTimelineRange(padStart, padEnd, data.holidays);
  }, [data]);

  const { workdays } = timelineRange;

  // Group tasks by assignee
  const byAssignee = useMemo(() => {
    const m = new Map<string, Task[]>();
    for (const t of data.tasks) {
      const arr = m.get(t.assignee) ?? [];
      arr.push(t);
      m.set(t.assignee, arr);
    }
    return m;
  }, [data.tasks]);

  const leaveByAssignee = useMemo(() => {
    const m = new Map<string, Leave[]>();
    for (const l of data.leaves) {
      const arr = m.get(l.assignee) ?? [];
      arr.push(l);
      m.set(l.assignee, arr);
    }
    return m;
  }, [data.leaves]);

  // Compute lanes per assignee
  const assigneeData = useMemo(() => {
    return Array.from(byAssignee.entries()).map(([name, tasks]) => {
      const cloned = tasks.map((t) => ({ ...t }));
      assignLanes(cloned, workdays);
      const lanes = getLaneCount(cloned);
      const rowHeight = Math.max(lanes * ROW_HEIGHT, ROW_HEIGHT) + ROW_PADDING * 2;
      return { name, tasks: cloned, leaves: leaveByAssignee.get(name) ?? [], rowHeight, lanes };
    });
  }, [byAssignee, leaveByAssignee, workdays]);

  const gridWidth = workdays.length * COL_WIDTH;
  const totalHeight = assigneeData.reduce((s, a) => s + a.rowHeight, 0);
  const regularSprints = data.sprints.filter((s) => !s.is_drp);
  const drpSprints = data.sprints.filter((s) => s.is_drp);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div
        className="flex-shrink-0 bg-surface-1 border-r border-border overflow-y-auto"
        style={{ width: LEFT_PANEL_WIDTH }}
      >
        <div
          className="sticky top-0 z-10 bg-surface-1 border-b border-border flex items-center px-3"
          style={{ height: 44 }}
        >
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Engineer</span>
        </div>

        {assigneeData.map(({ name, tasks, rowHeight }) => (
          <div
            key={name}
            className="border-b border-border/30 flex flex-col justify-center px-3 gap-1"
            style={{ height: rowHeight }}
          >
            <div className="flex items-center gap-2">
              <Avatar name={name} size="md" />
              <div>
                <div className="text-xs font-medium text-text-primary truncate">{name}</div>
                <div className="text-[10px] text-text-muted">{tasks.length} tasks</div>
              </div>
            </div>
            {/* Workload bar */}
            <div className="h-0.5 rounded-full overflow-hidden bg-surface-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((tasks.length / 5) * 100, 100)}%`,
                  backgroundColor: getAssigneeColor(name),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        <div className="sticky top-0 z-20 bg-surface-0 border-b border-border">
          <DateHeader workdays={workdays} />
          <div
            className="relative overflow-hidden"
            style={{ height: SPRINT_BANNER_AREA_HEIGHT, width: gridWidth }}
          >
            {regularSprints.map((s) => (
              <SprintBanner key={s.id} sprint={s} workdays={workdays} rowIndex={0} />
            ))}
            {drpSprints.map((s) => (
              <SprintBanner key={s.id} sprint={s} workdays={workdays} rowIndex={1} />
            ))}
          </div>
        </div>

        <div className="relative" style={{ width: gridWidth }}>
          <TimelineGrid workdays={workdays} totalHeight={totalHeight} sprintBannerHeight={0} />

          {/* Today marker */}
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

          {assigneeData.map(({ name, tasks, leaves, rowHeight }) => (
            <div
              key={name}
              className="relative border-b border-border/30"
              style={{ height: rowHeight }}
            >
              {/* Leave overlays */}
              {leaves.map((l) => (
                <LeaveOverlay key={l.id} leave={l} workdays={workdays} rowHeight={rowHeight} />
              ))}

              {/* Task bars */}
              <div
                className="relative"
                style={{ height: rowHeight, paddingTop: ROW_PADDING }}
              >
                {tasks.map((t) => (
                  <TaskBar key={t.id} task={t} workdays={workdays} rowOffset={ROW_PADDING} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
