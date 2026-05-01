import type { Leave } from '../../types';
import type { DateColumn } from '../../types';
import { clampToWorkdays } from '../../utils/dates';
import { COL_WIDTH } from './TaskBar';

interface LeaveOverlayProps {
  leave: Leave;
  workdays: DateColumn[];
  rowHeight: number;
}

export function LeaveOverlay({ leave, workdays, rowHeight }: LeaveOverlayProps) {
  const range = clampToWorkdays(leave.start_date, leave.end_date, workdays);
  if (!range) return null;

  const { startIdx, endIdx } = range;
  const left = startIdx * COL_WIDTH;
  const width = (endIdx - startIdx + 1) * COL_WIDTH;

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        left,
        width,
        height: rowHeight,
        backgroundImage:
          'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(217,119,6,0.12) 3px, rgba(217,119,6,0.12) 6px)',
        borderLeft: '1px solid rgba(217,119,6,0.4)',
        borderRight: '1px solid rgba(217,119,6,0.4)',
      }}
      title={`${leave.leave_type}: ${leave.assignee}`}
    />
  );
}
