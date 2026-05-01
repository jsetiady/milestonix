import type { Task } from '../../types';
import type { DateColumn } from '../../types';
import { Tooltip } from '../Tooltip';
import { clampToWorkdays } from '../../utils/dates';
import { ISSUE_TYPE_BAR_COLORS, ISSUE_TYPE_ICONS } from '../../utils/colors';

const COL_WIDTH = 36; // px per workday column
const ROW_HEIGHT = 28; // px per lane
const BAR_HEIGHT = 20; // px bar height

interface TaskBarProps {
  task: Task;
  workdays: DateColumn[];
  rowOffset?: number; // additional y offset in px
}

export function TaskBar({ task, workdays, rowOffset = 0 }: TaskBarProps) {
  const range = clampToWorkdays(task.start_date, task.end_date, workdays);
  if (!range) return null;

  const { startIdx, endIdx } = range;
  const lane = task._lane ?? 0;

  const left = startIdx * COL_WIDTH;
  const width = Math.max((endIdx - startIdx + 1) * COL_WIDTH - 2, COL_WIDTH - 2);
  const top = rowOffset + lane * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;

  const color = ISSUE_TYPE_BAR_COLORS[task.issue_type as keyof typeof ISSUE_TYPE_BAR_COLORS] ?? '#3b82f6';
  const icon = ISSUE_TYPE_ICONS[task.issue_type as keyof typeof ISSUE_TYPE_ICONS] ?? '▪';
  const isMilestone = task.issue_type === 'Milestone';

  return (
    <Tooltip task={task}>
      <div
        className="absolute flex items-center gap-1 rounded cursor-pointer overflow-hidden group transition-opacity hover:opacity-90"
        style={{
          left,
          top,
          width,
          height: BAR_HEIGHT,
          backgroundColor: color + '33',
          border: `1px solid ${color}99`,
        }}
      >
        <span className="text-[9px] ml-1 flex-shrink-0" style={{ color }}>
          {icon}
        </span>
        {width > 60 && (
          <span
            className="text-[10px] font-medium truncate pr-1 leading-none"
            style={{ color: color }}
          >
            {task.summary}
          </span>
        )}
        {/* Milestone diamond marker */}
        {isMilestone && (
          <div
            className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </Tooltip>
  );
}

export { COL_WIDTH, ROW_HEIGHT };
