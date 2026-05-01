import type { Sprint } from '../../types';
import type { DateColumn } from '../../types';
import { clampToWorkdays } from '../../utils/dates';
import { COL_WIDTH } from './TaskBar';

interface SprintBannerProps {
  sprint: Sprint;
  workdays: DateColumn[];
  rowIndex: number; // 0 = top banner, 1 = second banner
}

const BANNER_HEIGHT = 22;
const BANNER_GAP = 2;

export function SprintBanner({ sprint, workdays, rowIndex }: SprintBannerProps) {
  const range = clampToWorkdays(sprint.start_date, sprint.end_date, workdays);
  if (!range) return null;

  const { startIdx, endIdx } = range;
  const left = startIdx * COL_WIDTH;
  const width = (endIdx - startIdx + 1) * COL_WIDTH - 1;
  const top = rowIndex * (BANNER_HEIGHT + BANNER_GAP);

  const bgColor = sprint.is_drp ? '#d9770620' : `${sprint.color}20`;
  const borderColor = sprint.is_drp ? '#d97706' : sprint.color;
  const textColor = sprint.is_drp ? '#f59e0b' : '#818cf8';

  return (
    <div
      className="absolute flex items-center overflow-hidden rounded-sm"
      style={{
        left,
        top,
        width,
        height: BANNER_HEIGHT,
        backgroundColor: bgColor,
        borderBottom: `2px solid ${borderColor}`,
      }}
    >
      <span
        className="text-[10px] font-semibold tracking-wider uppercase px-2 truncate"
        style={{ color: textColor }}
      >
        {sprint.label}
      </span>
    </div>
  );
}

export const SPRINT_BANNER_AREA_HEIGHT = (BANNER_HEIGHT + BANNER_GAP) * 2 + 4;
