import { useState } from 'react';
import { CATEGORY_LABELS } from '../types';
import { ListEntryCard } from './ListEntryCard';
import { StatsPanel } from './StatsPanel';
import { ViewToggle } from './ViewToggle';
import { Pagination } from './Pagination';
import type { ViewMode } from './ViewToggle';
import type { Category, ListEntry } from '../types';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const PAGE_SIZE = 20;

interface MyListProps {
  entries: ListEntry[];
  onEdit: (entry: ListEntry) => void;
  onRemove: (id: string) => void;
}

type SortKey = 'added' | 'title' | 'grade' | 'episodes';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'added', label: 'Date added' },
  { value: 'title', label: 'Title' },
  { value: 'grade', label: 'Grade' },
  { value: 'episodes', label: 'Episodes watched' },
];

function getTitle(entry: ListEntry) {
  return (entry.item.title ?? entry.item.name ?? '').toLowerCase();
}

function sortEntries(entries: ListEntry[], sort: SortKey, dir: 'asc' | 'desc'): ListEntry[] {
  const mul = dir === 'asc' ? -1 : 1;
  return [...entries].sort((a, b) => {
    switch (sort) {
      case 'added':
        return mul * (a.addedAt - b.addedAt);
      case 'title':
        return mul * getTitle(a).localeCompare(getTitle(b));
      case 'grade':
        return mul * ((a.grade ?? -1) - (b.grade ?? -1));
      case 'episodes': {
        const epsA = a.episodesWatched ?? a.totalEpisodes ?? 0;
        const epsB = b.episodesWatched ?? b.totalEpisodes ?? 0;
        return mul * (epsA - epsB);
      }
    }
  });
}

export function MyList({ entries, onEdit, onRemove }: MyListProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [showStats, setShowStats] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('added');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const categoryEntries =
    activeCategory === 'all'
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? categoryEntries.filter((e) => getTitle(e).includes(query))
    : categoryEntries;

  const sorted = sortEntries(filtered, sort, sortDir);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handlePageChange(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Reset to page 1 when filters change
  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSortChange(value: SortKey) {
    setSort(value);
    setPage(1);
  }

  return (
    <div className="mylist">
      <div className="mylist__header">
        <h1 className="mylist__title">My List</h1>
        <button
          className={`mylist__stats-btn${showStats ? ' mylist__stats-btn--active' : ''}`}
          onClick={() => setShowStats((v) => !v)}
          aria-pressed={showStats}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Stats
        </button>
      </div>

      {showStats && <StatsPanel entries={entries} />}

      <div className="mylist__tabs" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`mylist__tab${cat !== 'all' ? ` mylist__tab--${cat}` : ''}${activeCategory === cat ? ' mylist__tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mylist__controls">
        <div className="mylist__search">
          <svg className="mylist__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="mylist__search-input"
            type="search"
            placeholder="Search in list…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search entries in list"
          />
          {search && (
            <button
              className="mylist__search-clear"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="mylist__sort">
          <label className="mylist__sort-label" htmlFor="list-sort">Sort by</label>
          <select
            id="list-sort"
            className="mylist__sort-select"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className={`mylist__sort-dir${sortDir === 'asc' ? ' mylist__sort-dir--asc' : ''}`}
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            aria-label={sortDir === 'desc' ? 'Sort descending (click for ascending)' : 'Sort ascending (click for descending)'}
            title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="6 12 12 19 18 12" />
            </svg>
          </button>
        </div>
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      <div className="mylist__content" role="tabpanel">
        {visible.length === 0 ? (
          <div className="mylist__empty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
              />
            </svg>
            <p>
              {query
                ? `No results for "${search}" in this category.`
                : activeCategory === 'all'
                ? 'Your list is empty. Search for movies or TV shows to add them.'
                : `No entries in "${CATEGORY_LABELS[activeCategory]}" yet.`}
            </p>
          </div>
        ) : (
          <div className={`mylist__grid${viewMode === 'grid' ? ' mylist__grid--grid' : ''}`}>
            {visible.map((entry) => (
              <ListEntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onRemove={onRemove}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
        <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
      </div>
    </div>
  );
}
