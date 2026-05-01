import type { DateColumn } from '../../types';
import { COL_WIDTH } from './TaskBar';

interface TimelineGridProps {
  workdays: DateColumn[];
  totalHeight: number;
  sprintBannerHeight: number;
}

export function TimelineGrid({ workdays, totalHeight, sprintBannerHeight }: TimelineGridProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ top: sprintBannerHeight }}
    >
      {workdays.map((day, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: i * COL_WIDTH,
            width: COL_WIDTH,
            height: totalHeight,
          }}
        >
          {/* Today highlight */}
          {day.isToday && (
            <div
              className="absolute inset-0 bg-red-500/5 border-l-2 border-red-500"
              style={{ zIndex: 2 }}
            />
          )}
          {/* Holiday column */}
          {day.isHoliday && !day.isToday && (
            <div className="absolute inset-0 bg-rose-900/10" />
          )}
          {/* Grid line */}
          <div className="absolute right-0 top-0 bottom-0 border-r border-border/30" />
        </div>
      ))}
    </div>
  );
}
