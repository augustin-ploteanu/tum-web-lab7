import { useState } from 'react';
import { SearchResultCard } from './SearchResultCard';
import { ViewToggle } from './ViewToggle';
import { Pagination } from './Pagination';
import type { ViewMode } from './ViewToggle';
import type { SearchStatus, WatchableItem } from '../types';

interface SearchResultsProps {
  results: WatchableItem[];
  status: SearchStatus;
  error: string | null;
  query: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getEntry: (id: string) => boolean;
  onAddClick: (item: WatchableItem) => void;
}

export function SearchResults({
  results,
  status,
  error,
  query,
  page,
  totalPages,
  onPageChange,
  getEntry,
  onAddClick,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (status === 'idle') {
    return (
      <div className="search-placeholder" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p>Results will appear here</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="search-feedback" aria-live="polite">
        <span className="loader" aria-label="Searching…" role="status" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="search-feedback search-feedback--error" role="alert">
        <p>{error ?? 'An error occurred. Please try again.'}</p>
        {!import.meta.env.VITE_TMDB_API_KEY && (
          <p className="search-feedback__hint">
            Tip: add your TMDB key to <code>.env</code> as{' '}
            <code>VITE_TMDB_API_KEY=your_key_here</code>, then restart the dev
            server.
          </p>
        )}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-feedback" aria-live="polite">
        <p>
          No results found for "<strong>{query}</strong>".
        </p>
      </div>
    );
  }

  return (
    <section className="search-results" aria-label="Search results">
      <div className="search-results__header">
        <p className="search-results__count" aria-live="polite">
          {results.length} result{results.length !== 1 ? 's' : ''} for "
          <strong>{query}</strong>" — page {page} of {totalPages}
        </p>
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
      <div className={`search-results__grid${viewMode === 'list' ? ' search-results__grid--list' : ''}`}>
        {results.map((item) => (
          <SearchResultCard
            key={`${item.media_type}-${item.id}`}
            item={item}
            inList={getEntry(`${item.media_type}-${item.id}`)}
            onAddClick={onAddClick}
            viewMode={viewMode}
          />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </section>
  );
}
