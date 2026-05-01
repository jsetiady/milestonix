# Architecture

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (localhost:5173)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Tailwind CSS               │   │
│  │                                                  │   │
│  │  TimelineView  │  ResourceView  │  ProjectList   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP (proxied via Vite)
                          ▼
┌─────────────────────────────────────────────────────────┐
│            FastAPI Backend (localhost:8000)              │
│                                                         │
│  /api/tasks/all  →  data_service  →  tasks.json        │
│  /api/sync       →  sync logic   →  archive + current  │
│  /api/config/*   →  rank_service →  rank.json          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Local File System                      │
│                                                         │
│  data/current/    ← live working data (gitignored)     │
│  data/archive/    ← sync snapshots (gitignored)        │
│  data/config/     ← rank.json, filter_options.json     │
│  data/examples/   ← sample data (committed)            │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Normal Read Flow
```
Browser
  └─ GET /api/tasks/all
       └─ data_service.get_tasks()         → data/current/tasks.json
                                              (fallback: data/examples/)
       └─ rank_service.reapply_rank()      → sort by rank.json
       └─ return ranked tasks + leaves + sprints + holidays
```

### Sync Flow
```
Browser
  └─ POST /api/sync
       ├─ _mock_fetch_jira()              → (replace with real Jira API)
       ├─ _mock_fetch_leaves()            → (replace with Google Sheets API)
       ├─ _mock_fetch_calendar()          → (replace with Google Calendar API)
       ├─ normalize tasks
       ├─ rank_service.ensure_rank_entry()  ← new items get appended rank
       ├─ archive_service.create_snapshot() ← snapshot before overwrite
       ├─ data_service.save_*(...)          ← overwrite data/current/
       └─ rank.json is NEVER modified here ← invariant preserved
```

### Rank Update Flow
```
User drags item in UI
  └─ POST /api/config/rank/{category}  [ordered_ids]
       └─ rank_service.update_rank()
            └─ write rank.json with new positions
```

## Key Design Decisions

### Local-First, No Database
All data is plain JSON. This means:
- Zero infrastructure to run
- Easy to inspect and edit
- Git-versionable (config layer)
- Portable (copy the folder)

### Rank Separation
Rank is stored separately from task data. When Jira data is updated (tasks change status, dates shift), the display order is preserved. This is the core UX guarantee: engineers curate order once, sync doesn't disturb it.

### Fallback to Examples
When `data/current/` is empty (fresh install), the backend falls back to `data/examples/`. The dashboard is always usable without a sync step.

### Greedy Lane Scheduler
The timeline assigns each task to a "lane" (vertical slot) using greedy interval scheduling. This prevents visual overlap without requiring pre-computed layout. Each row reruns the scheduler independently.

## External Integration Points

To wire real data sources, replace the mock functions in `backend/routers/sync.py`:

| Function | Replace With |
|----------|-------------|
| `_mock_fetch_jira()` | Jira REST API v3 (`/rest/api/3/search`) |
| `_mock_fetch_leaves()` | Google Sheets API v4 |
| `_mock_fetch_calendar()` | Google Calendar API v3 |
