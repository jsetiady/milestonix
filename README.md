# QA Timeline Dashboard — Milestonix

A local-first QA delivery tracking dashboard that visualizes timelines, workload distribution, project status, and risks (leave conflicts, milestone overlaps).

---

## Overview

**QA Ops Center** aggregates delivery data from:
- **Jira** — tasks, milestones, status
- **Google Sheets** — engineer leave records
- **Google Calendar** — sprints, public holidays

The system is **local-first**: all data is stored as JSON files. No database. No external auth.

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd /path/to/milestonix

# Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the API server
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Data Structure

All data lives in `/data/`:

```
data/
├── current/          ← Live working data (GITIGNORED)
│   ├── tasks.json
│   ├── leaves.json
│   ├── sprints.json
│   └── holidays.json
├── archive/          ← Sync snapshots, max 10 (GITIGNORED)
│   └── 20240704T120000Z/
├── config/           ← User preferences (committed)
│   ├── rank.json
│   └── filter_options.json
└── examples/         ← Sample data (committed)
    ├── tasks.json
    ├── leaves.json
    ├── sprints.json
    ├── holidays.json
    ├── rank.json
    └── filter_options.json
```

**Fallback rule**: If `data/current/` is empty, the system automatically loads from `data/examples/`. This means the dashboard works out of the box without any setup.

### tasks.json

```json
{
  "tasks": [
    {
      "id": "QA-001",
      "summary": "Regression Suite Migration",
      "issue_type": "Task",           // Task | Milestone | Story | Spike | Initiative | Bug | Epic
      "status": "In Progress",        // Todo | In Progress | In Review | Done | Blocked | Cancelled
      "assignee": "Sarah Chen",
      "squad": "Integrations Beta",
      "project": "Core Engine",
      "epic": "QA-E01",               // references an epic id
      "start_date": "2024-07-01",     // YYYY-MM-DD
      "end_date": "2024-07-06",
      "blocks": [],                   // IDs of tasks this task blocks (milestone grouping)
      "blocked_by": [],
      "priority": "High",
      "quarter": "Q3 2024",
      "business_scope": "Internal"
    }
  ],
  "epics": [
    {
      "id": "QA-E01",
      "name": "Core Engine Upgrade",
      "project": "Core Engine",
      "start_date": "2024-07-01",
      "end_date": "2024-07-14"
    }
  ]
}
```

### Milestone Grouping Logic

A task with `issue_type = "Milestone"` acts as a container for child tasks. Child tasks are identified via the milestone's `blocks` array: if milestone `QA-003.blocks = ["QA-004", "QA-005"]`, then QA-004 and QA-005 are children of QA-003 in the timeline hierarchy.

---

## Ranking System

Rank is stored in `data/config/rank.json`:

```json
{
  "epics": { "QA-E01": 1, "QA-E02": 2 },
  "milestones": { "QA-003": 1 },
  "tasks": { "QA-001": 1, "QA-002": 2 }
}
```

**Critical invariant**: Rank is **never overwritten by sync**. The sync operation calls `reapply_rank()` after fetching new data, which re-sorts items by their stored rank. New items from Jira are added to the end of their rank list.

### Drag & Drop

In the Timeline View, items can be reordered via drag & drop. The new order is immediately persisted to `rank.json` via `POST /api/config/rank/{category}`.

---

## Sync Flow

```
POST /sync
  ├── Fetch Jira tasks → normalize
  ├── Fetch Google Sheets → leave records
  ├── Fetch Google Calendar → sprints, holidays
  ├── Archive current data (max 10 snapshots)
  ├── Save to data/current/
  └── Reapply rank (rank.json unchanged)
```

**Note**: The current sync implementation uses the existing local data as a mock source. To wire real integrations, replace the `_mock_fetch_*` functions in `backend/routers/sync.py`.

---

## Views

| View | Description |
|------|-------------|
| **Timeline View** | Gantt chart grouped by Epic → Milestone → Task with expand/collapse |
| **Resource View** | Per-engineer workload, all tasks as horizontal bars |
| **Task List** | Filterable table with progress, dates, assignees |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/all` | All tasks, epics, leaves, sprints, holidays |
| POST | `/api/sync` | Run sync from external sources |
| GET | `/api/sync/archives` | List available snapshots |
| GET | `/api/sync/archives/{ts}` | Load a specific snapshot |
| GET | `/api/config/filters` | Filter options |
| GET | `/api/config/rank` | Current rank config |
| POST | `/api/config/rank/{category}` | Update rank for a category |

---

## Git Rules

**Never committed:**
- `data/current/` — live data
- `data/archive/` — sync snapshots

**Always committed:**
- `data/examples/` — sample data for onboarding
- `data/config/` — filter options and rank

---

## Folder Structure

```
milestonix/
├── backend/
│   ├── main.py                   ← FastAPI app entry point
│   ├── requirements.txt
│   ├── models/
│   │   └── task.py               ← Pydantic models
│   ├── routers/
│   │   ├── tasks.py              ← GET /api/tasks/*
│   │   ├── sync.py               ← POST /api/sync
│   │   └── config.py             ← GET/POST /api/config/*
│   └── services/
│       ├── data_service.py       ← JSON file I/O
│       ├── rank_service.py       ← Rank management
│       └── archive_service.py    ← Snapshot management
├── frontend/
│   ├── src/
│   │   ├── App.tsx               ← Root component
│   │   ├── types/index.ts        ← TypeScript interfaces
│   │   ├── hooks/
│   │   │   ├── useData.ts        ← Data fetching
│   │   │   └── useFilters.ts     ← Filter state
│   │   ├── store/appStore.ts     ← Shared state types
│   │   ├── utils/
│   │   │   ├── dates.ts          ← Date utilities, workday calendar
│   │   │   ├── scheduler.ts      ← Greedy lane assignment
│   │   │   └── colors.ts         ← Color mappings
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── FilterBar.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Avatar.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── Timeline/
│   │       │   ├── TimelineView.tsx
│   │       │   ├── DateHeader.tsx
│   │       │   ├── TimelineGrid.tsx
│   │       │   ├── TaskBar.tsx
│   │       │   ├── SprintBanner.tsx
│   │       │   └── LeaveOverlay.tsx
│   │       ├── Resource/
│   │       │   └── ResourceView.tsx
│   │       └── ProjectList/
│   │           └── ProjectListView.tsx
├── data/
│   ├── examples/                 ← Sample data (committed)
│   └── config/                   ← User config (committed)
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   └── frontend.md
└── README.md
```

---

## Assumptions

1. **Weekend exclusion**: Timeline columns show Mon–Fri only. Weekends are skipped entirely.
2. **Milestone grouping**: Uses `blocks` relationship (milestone blocks its child tasks). This matches common Jira "blocks" link usage.
3. **Overlap handling**: Uses greedy interval scheduling — assigns each task to the first available lane with no overlap.
4. **Sync mock**: Real Jira/Google API calls need credentials. The mock re-reads local data, making sync a no-op that still exercises the archive and rank-reapply logic.
5. **Auth**: No auth is implemented — this is a local developer tool.
