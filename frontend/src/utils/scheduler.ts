import type { Task } from '../types';
import type { DateColumn } from '../types';
import { clampToWorkdays } from './dates';

interface ScheduledItem {
  task: Task;
  startIdx: number;
  endIdx: number;
  lane: number;
}

/**
 * Greedy interval scheduling across lanes.
 * Assigns each task to the first lane where it doesn't overlap.
 * Modifies tasks in-place by setting task._lane.
 */
export function assignLanes(tasks: Task[], workdays: DateColumn[]): ScheduledItem[] {
  const scheduled: ScheduledItem[] = [];
  // Each lane tracks the end index of the last item placed in it
  const laneEnds: number[] = [];

  for (const task of tasks) {
    const range = clampToWorkdays(task.start_date, task.end_date, workdays);
    if (!range) continue;

    const { startIdx, endIdx } = range;

    // Find the first lane that ends before this task starts
    let assignedLane = -1;
    for (let l = 0; l < laneEnds.length; l++) {
      if (laneEnds[l] < startIdx) {
        assignedLane = l;
        laneEnds[l] = endIdx;
        break;
      }
    }
    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(endIdx);
    }

    task._lane = assignedLane;
    scheduled.push({ task, startIdx, endIdx, lane: assignedLane });
  }

  return scheduled;
}

export function getLaneCount(tasks: Task[]): number {
  const lanes = tasks.map((t) => t._lane ?? 0);
  return lanes.length ? Math.max(...lanes) + 1 : 1;
}
