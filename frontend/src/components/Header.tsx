import type { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  syncing: boolean;
  onSync: () => void;
  search: string;
  onSearch: (v: string) => void;
}

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'timeline', label: 'Timeline View' },
  { id: 'resource', label: 'Resource View' },
  { id: 'list', label: 'Task List' },
];

export function Header({
  viewMode,
  onViewChange,
  syncing,
  onSync,
  search,
  onSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-11 bg-surface-1 border-b border-border flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <span className="font-bold text-text-primary text-sm leading-tight">
          QA OPS
          <br />
          <span className="text-[10px] font-normal text-text-muted tracking-widest">CENTER</span>
        </span>
      </div>

      {/* View toggle */}
      <div className="flex items-center bg-surface-3 rounded p-0.5 gap-0.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === v.id
                ? 'bg-surface-4 text-text-primary font-medium'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="bg-surface-3 border border-border rounded pl-7 pr-3 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo w-48"
        />
      </div>

      {/* Sync button */}
      <button
        onClick={onSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-3 py-1 bg-surface-3 border border-border rounded text-xs text-text-secondary hover:text-text-primary hover:border-accent-indigo transition-all disabled:opacity-50"
      >
        <svg
          className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {syncing ? 'Syncing…' : 'Sync'}
      </button>

      {/* Settings icon placeholder */}
      <button className="p-1.5 text-text-muted hover:text-text-secondary rounded">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  );
}
