export type IssueType =
  | 'Task'
  | 'Milestone'
  | 'Story'
  | 'Spike'
  | 'Initiative'
  | 'Bug'
  | 'Epic';

export type Status =
  | 'Todo'
  | 'In Progress'
  | 'In Review'
  | 'Done'
  | 'Blocked'
  | 'Cancelled';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  summary: string;
  issue_type: IssueType;
  status: Status;
  assignee: string;
  squad: string;
  project: string;
  epic?: string;
  epic_name?: string;
  start_date: string;
  end_date: string;
  last_updated?: string;
  quarter?: string;
  business_scope?: string;
  priority?: Priority;
  blocks: string[];
  blocked_by: string[];
  description?: string;
  // Runtime: lane assigned by greedy scheduler for overlap avoidance
  _lane?: number;
}

export interface Epic {
  id: string;
  name: string;
  project: string;
  start_date: string;
  end_date: string;
  status: Status;
  squad?: string;
  quarter?: string;
  // Runtime: resolved tasks
  tasks?: Task[];
}

export interface Leave {
  id: string;
  assignee: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  approved: boolean;
  notes?: string;
}

export interface Sprint {
  id: string;
  name: string;
  label: string;
  start_date: string;
  end_date: string;
  project?: string;
  status: string;
  color: string;
  is_drp?: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  country?: string;
  applies_to: string[];
}

export interface DashboardData {
  tasks: Task[];
  epics: Epic[];
  leaves: Leave[];
  sprints: Sprint[];
  holidays: Holiday[];
}

export interface FilterOptions {
  squads: string[];
  engineers: string[];
  statuses: string[];
  projects: string[];
  quarters: string[];
  business_scopes: string[];
  task_types: string[];
  leave_types: string[];
}

export interface ActiveFilters {
  squad: string;
  assignee: string;
  project: string;
  status: string;
  quarter: string;
  business_scope: string;
  show_leave: boolean;
  task_types: string[];
  search: string;
}

export type ViewMode = 'timeline' | 'resource' | 'list';

// For timeline rendering
export interface DateColumn {
  date: Date;
  label: string;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
}

export interface TimelineRange {
  startDate: Date;
  endDate: Date;
  workdays: DateColumn[];
  totalDays: number;
}

// For project list view
export interface ProjectSummary {
  project: string;
  epics: Epic[];
  total_tasks: number;
  done_tasks: number;
  active_tasks: number;
  progress: number;
  start_date: string;
  end_date: string;
  assignees: string[];
  squads: string[];
  quarter?: string;
  business_scope?: string;
  last_updated?: string;
}
