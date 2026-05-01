import React, { useState, useRef } from 'react';
import type { Task } from '../types';
import { STATUS_DOT_COLORS, ISSUE_TYPE_ICONS } from '../utils/colors';

interface TooltipProps {
  task: Task;
  children: React.ReactNode;
}

export function Tooltip({ task, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (e: React.MouseEvent) => {
    timerRef.current = setTimeout(() => {
      setPos({ x: e.clientX + 12, y: e.clientY - 8 });
      setVisible(true);
    }, 300);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  const move = (e: React.MouseEvent) => {
    if (visible) setPos({ x: e.clientX + 12, y: e.clientY - 8 });
  };

  const dotColor = STATUS_DOT_COLORS[task.status as keyof typeof STATUS_DOT_COLORS] ?? 'bg-slate-500';
  const icon = ISSUE_TYPE_ICONS[task.issue_type as keyof typeof ISSUE_TYPE_ICONS] ?? '▪';

  return (
    <>
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseMove={move}
        className="contents"
      >
        {children}
      </div>
      {visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="bg-surface-2 border border-border rounded-lg shadow-2xl p-3 w-72 text-xs">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-text-muted mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-text-muted text-[10px] mb-0.5">{task.id}</div>
                <div className="font-medium text-text-primary leading-tight">{task.summary}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <Row label="Assignee" value={task.assignee} />
              <Row label="Squad" value={task.squad} />
              <Row
                label="Status"
                value={
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {task.status}
                  </span>
                }
              />
              <Row label="Type" value={task.issue_type} />
              <Row label="Priority" value={task.priority ?? '—'} />
              <Row label="Epic" value={task.epic_name ?? task.epic ?? '—'} />
              <Row label="Start" value={task.start_date} />
              <Row label="End" value={task.end_date} />
              {task.last_updated && (
                <Row
                  label="Updated"
                  value={new Date(task.last_updated).toLocaleDateString()}
                  full
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <span className="text-text-muted">{label}: </span>
      <span className="text-text-secondary">{value}</span>
    </div>
  );
}
