# Frontend Architecture

## Component Structure

```
App.tsx
├── Header.tsx                  ← view toggle, sync, search
├── FilterBar.tsx               ← dynamic filter dropdowns + task type toggles
└── <view>
    ├── TimelineView.tsx        ← Gantt with expand/collapse hierarchy
    │   ├── DateHeader.tsx      ← sticky month + day header row
    │   ├── TimelineGrid.tsx    ← background column lines, today, holidays
    │   ├── SprintBanner.tsx    ← sprint and DRP banners
    │   ├── TaskBar.tsx         ← individual task bars (absolute positioned)
    │   └── LeaveOverlay.tsx    ← hatching overlay for leave periods
    ├── ResourceView.tsx        ← per-engineer grouping, same bar components
    └── ProjectListView.tsx     ← table view with project/epic sections
```

## Gantt Rendering Logic

### Coordinate System

The timeline uses a flat coordinate system where:
- X = `colIndex * COL_WIDTH` (px)
- Y = `laneIndex * ROW_HEIGHT` (px)
- `COL_WIDTH = 36px` per workday
- `ROW_HEIGHT = 28px` per lane

All task bars are `position: absolute` within their row container. The row container has `position: relative`.

### Workday Calendar

`utils/dates.ts → buildTimelineRange()`:
1. Iterates from `startDate` to `endDate`
2. Skips Saturday (day 6) and Sunday (day 0)
3. Marks holidays from `holidays.json`
4. Marks today
5. Returns `DateColumn[]` — the canonical column index array

All components reference this array. A task's `start_date` and `end_date` are mapped to column indices via `clampToWorkdays()`, which also handles tasks that start before or end after the visible range.

### Lane Assignment (Overlap Avoidance)

`utils/scheduler.ts → assignLanes()`:

```
For each task (in rank order):
  1. Find its [startIdx, endIdx] column range
  2. Scan existing lanes for one where laneEnd < taskStart
  3. If found: assign that lane, update laneEnd
  4. If not found: create a new lane
  5. Set task._lane = assignedLane
```

This is greedy interval scheduling (O(n²) worst case, acceptable for typical sprint sizes of <50 tasks). The lane count determines the row height: `rowHeight = laneCount * ROW_HEIGHT`.

### Expand / Collapse

State is managed in `App.tsx` as two `Set<string>` — one for epic IDs, one for milestone IDs.

`TimelineView.tsx` builds a flat `RowDef[]` array on every render:
1. Iterate epics in rank order
2. For each epic: add epic row
3. If epic is expanded: add milestone rows, then loose task rows
4. If milestone is expanded: add its child task rows

Row heights are computed by running `assignLanes()` per row — collapsed epics show all child tasks as overlapping bars in a single multi-lane row. Expanded rows show individual task rows at single-lane height.

## State Management

No external state library. State is co-located:

| State | Location | Description |
|-------|----------|-------------|
| `data` | `useData` hook | Raw API response |
| `filteredData` | `useFilters` hook | Data after filters applied |
| `filters` | `useFilters` hook | Active filter values |
| `viewMode` | `App.tsx` | `timeline \| resource \| list` |
| `expandedEpics` | `App.tsx` | Set of expanded epic IDs |
| `expandedMilestones` | `App.tsx` | Set of expanded milestone IDs |

## Filter Logic

Filters are applied client-side in `useFilters.ts`. The `filteredData` memo recomputes when either `data` or `filters` changes. All filters are AND-combined. Search is substring match (case-insensitive) across `summary`, `assignee`, `id`, `project`.

## Tooltip

`Tooltip.tsx` wraps any child with `onMouseEnter/Leave/Move` handlers. A 300ms delay prevents flicker during quick mouse movements. The tooltip is rendered via a fixed-position div outside the DOM hierarchy, avoiding overflow clipping.

## Color System

`utils/colors.ts` provides:
- `ISSUE_TYPE_BAR_COLORS` — hex colors for task bars
- `STATUS_DOT_COLORS` — Tailwind classes for status indicators
- `getAssigneeColor(name)` — deterministic color from name hash
- `getAssigneeInitials(name)` — 2-letter initials for avatars
