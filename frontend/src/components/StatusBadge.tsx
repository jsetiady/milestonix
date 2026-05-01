import type { Status } from '../types';
import { STATUS_DOT_COLORS } from '../utils/colors';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const dot = STATUS_DOT_COLORS[status] ?? 'bg-slate-500';
  return (
    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      {status}
    </span>
  );
}
