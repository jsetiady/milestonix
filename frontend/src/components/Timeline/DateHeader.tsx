import type { DateColumn } from '../../types';
import { COL_WIDTH } from './TaskBar';

interface DateHeaderProps {
  workdays: DateColumn[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DateHeader({ workdays }: DateHeaderProps) {
  // Group into months for the month label row
  const months: { label: string; count: number }[] = [];
  let currentMonth = '';
  let currentCount = 0;

  for (const day of workdays) {
    const monthKey = day.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (monthKey !== currentMonth) {
      if (currentMonth) months.push({ label: currentMonth.toUpperCase(), count: currentCount });
      currentMonth = monthKey;
      currentCount = 1;
    } else {
      currentCount++;
    }
  }
  if (currentMonth) months.push({ label: currentMonth.toUpperCase(), count: currentCount });

  return (
    <div className="sticky top-0 z-20 bg-surface-1 border-b border-border">
      {/* Month row */}
      <div className="flex" style={{ height: 20 }}>
        {months.map((m, i) => (
          <div
            key={i}
            className="flex items-center pl-2 border-r border-border text-[10px] text-text-muted font-semibold tracking-wider"
            style={{ width: m.count * COL_WIDTH, flexShrink: 0 }}
          >
            {m.label}
          </div>
        ))}
      </div>
      {/* Day number row */}
      <div className="flex" style={{ height: 24 }}>
        {workdays.map((day, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center border-r border-border/50 flex-shrink-0 text-[10px] ${
              day.isToday
                ? 'text-red-500 font-bold'
                : day.isHoliday
                ? 'text-rose-500'
                : 'text-text-muted'
            }`}
            style={{ width: COL_WIDTH }}
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}
