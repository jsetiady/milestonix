import type { DateColumn, TimelineRange } from '../types';

export function parseDate(dateStr: string): Date {
  // Parse YYYY-MM-DD as local date (not UTC)
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildTimelineRange(
  startDate: Date,
  endDate: Date,
  holidays: { date: string; name: string }[] = []
): TimelineRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));
  const workdays: DateColumn[] = [];

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    if (!isWeekend(cursor)) {
      const iso = formatDate(cursor);
      workdays.push({
        date: new Date(cursor),
        label: String(cursor.getDate()).padStart(2, '0'),
        isToday: isSameDay(cursor, today),
        isHoliday: holidayMap.has(iso),
        holidayName: holidayMap.get(iso),
        dayOfWeek: cursor.getDay(),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    startDate,
    endDate,
    workdays,
    totalDays: workdays.length,
  };
}

/** Returns the column index (0-based) for a given date within workdays. */
export function dateToColIndex(date: Date, workdays: DateColumn[]): number {
  const iso = formatDate(date);
  return workdays.findIndex((w) => formatDate(w.date) === iso);
}

/** Clamp to nearest workday boundary */
export function clampToWorkdays(
  startStr: string,
  endStr: string,
  workdays: DateColumn[]
): { startIdx: number; endIdx: number } | null {
  if (!workdays.length) return null;
  const first = workdays[0].date;
  const last = workdays[workdays.length - 1].date;

  const start = parseDate(startStr);
  const end = parseDate(endStr);

  if (end < first || start > last) return null;

  const clampedStart = start < first ? first : start;
  const clampedEnd = end > last ? last : end;

  // Find nearest workday for start
  let startIdx = -1;
  for (let i = 0; i < workdays.length; i++) {
    if (workdays[i].date >= clampedStart) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;

  // Find nearest workday for end
  let endIdx = -1;
  for (let i = workdays.length - 1; i >= 0; i--) {
    if (workdays[i].date <= clampedEnd) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1 || endIdx < startIdx) return null;

  return { startIdx, endIdx };
}

export function getMonthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}
