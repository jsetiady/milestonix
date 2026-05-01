# Data Model

## JSON Structure

### tasks.json

Top-level keys: `tasks` (array), `epics` (array).

#### Task fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Jira issue key (e.g. `QA-001`) |
| `summary` | string | ✓ | Issue title |
| `issue_type` | enum | ✓ | `Task \| Milestone \| Story \| Spike \| Initiative \| Bug \| Epic` |
| `status` | enum | ✓ | `Todo \| In Progress \| In Review \| Done \| Blocked \| Cancelled` |
| `assignee` | string | ✓ | Full name of assignee |
| `squad` | string | ✓ | Team/squad name |
| `project` | string | ✓ | Project name |
| `epic` | string | — | References `epic.id` |
| `epic_name` | string | — | Denormalized epic name for display |
| `start_date` | `YYYY-MM-DD` | ✓ | Task start |
| `end_date` | `YYYY-MM-DD` | ✓ | Task end (inclusive) |
| `last_updated` | ISO 8601 | — | Last sync time |
| `quarter` | string | — | e.g. `Q3 2024` |
| `business_scope` | string | — | `Internal \| External \| Regulatory \| Strategic` |
| `priority` | string | — | `Low \| Medium \| High \| Critical` |
| `blocks` | string[] | — | IDs of tasks this blocks (**milestone grouping key**) |
| `blocked_by` | string[] | — | IDs of tasks blocking this |
| `description` | string | — | Free text |

#### Epic fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique ID |
| `name` | string | ✓ | Display name |
| `project` | string | ✓ | Parent project |
| `start_date` | `YYYY-MM-DD` | ✓ | — |
| `end_date` | `YYYY-MM-DD` | ✓ | — |
| `status` | string | ✓ | — |
| `squad` | string | — | — |
| `quarter` | string | — | — |

---

### leaves.json

```json
{
  "leaves": [
    {
      "id": "LV-001",
      "assignee": "Jordan Doe",
      "leave_type": "Annual Leave",
      "start_date": "2024-07-06",
      "end_date": "2024-07-06",
      "approved": true,
      "notes": ""
    }
  ]
}
```

Leave overlays appear as diagonal-stripe hatching in the timeline row for the assignee.

---

### sprints.json

```json
{
  "sprints": [
    {
      "id": "SPR-111",
      "name": "Sprint 1.11.0",
      "label": "SPRINT 1.11.0 (JULY 1 - JULY 14)",
      "start_date": "2024-07-01",
      "end_date": "2024-07-14",
      "project": "Core Engine",
      "status": "Active",
      "color": "#4F46E5",
      "is_drp": false
    }
  ]
}
```

`is_drp: true` renders in the second banner row in amber/orange. Regular sprints use the first row in indigo.

---

### holidays.json

```json
{
  "holidays": [
    {
      "id": "HOL-001",
      "name": "Public Holiday",
      "date": "2024-07-04",
      "country": "US",
      "applies_to": ["All"]
    }
  ]
}
```

Holiday columns appear with a subtle red background and rotated text label.

---

### rank.json

```json
{
  "epics": { "QA-E01": 1, "QA-E02": 2 },
  "milestones": { "QA-003": 1 },
  "tasks": { "QA-001": 1, "QA-002": 2, "QA-003": 3 },
  "_meta": {
    "last_modified": "2024-07-04T12:00:00Z",
    "version": 1,
    "note": "Rank is managed locally and must never be overwritten by sync"
  }
}
```

---

## Hierarchy Mapping

```
Epic (QA-E01)
  ├── Milestone (QA-003)          ← issue_type = "Milestone"
  │     ├── Task (QA-004)         ← QA-003.blocks includes "QA-004"
  │     └── Task (QA-005)         ← QA-003.blocks includes "QA-005"
  ├── Task (QA-001)               ← direct child of epic, not blocked by milestone
  └── Task (QA-002)
```

### Milestone Logic

1. Find all tasks where `issue_type = "Milestone"` in an epic.
2. For each milestone, resolve child tasks via `milestone.blocks` array.
3. Tasks that appear in a milestone's `blocks` are rendered as children.
4. Tasks in the epic that are NOT in any milestone's `blocks` are rendered as direct children of the epic.
5. Tasks with no `epic` field are rendered at the root level (orphans).

This approach uses Jira's existing "blocks" link type without requiring custom fields.

---

## filter_options.json

Drives the FilterBar dropdowns dynamically. Add/remove options here to update the UI without code changes.

```json
{
  "squads": ["Automation Alpha", "Core Quality"],
  "engineers": ["Alex Rivers", "Sarah Chen"],
  "statuses": ["Todo", "In Progress", "Done"],
  "projects": ["Core Engine"],
  "quarters": ["Q3 2024"],
  "business_scopes": ["Internal", "External"],
  "task_types": ["Task", "Milestone", "Story"],
  "leave_types": ["Annual Leave", "Sick Leave"]
}
```
