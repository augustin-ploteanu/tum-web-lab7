import { useState, useEffect } from 'react';
import { searchMulti } from '../api/tmdb';
import type { SearchStatus, WatchableItem } from '../types';
import { useDebounce } from './useDebounce';

interface UseSearchResult {
  results: WatchableItem[];
  status: SearchStatus;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function useSearch(query: string): UseSearchResult {
  const [results, setResults] = useState<WatchableItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedQuery = useDebounce(query, 400);

  // Reset to page 1 when the query changes
  useEffect(() => {
    setPageState(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setStatus('idle');
      setError(null);
      setTotalPages(1);
      return;
    }

    let cancelled = false;

    setStatus('loading');
    setError(null);

    searchMulti(debouncedQuery, page)
      .then((data) => {
        if (cancelled) return;
        const watchable = data.results.filter(
          (item): item is WatchableItem =>
            item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(watchable);
        setTotalPages(data.total_pages);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page]);

  function setPage(p: number) {
    setPageState(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { results, status, error, page, totalPages, setPage };
}
