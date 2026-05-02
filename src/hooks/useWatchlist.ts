import { useState, useEffect } from 'react';
import type { ListEntry } from '../types';
import { fetchEntries, createEntry, updateEntry, removeEntry } from '../api/watchlist';

export function useWatchlist() {
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries()
      .then((page) => setEntries(page.entries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addOrUpdate(entry: ListEntry) {
    const exists = entries.some((e) => e.id === entry.id);
    const saved = await (exists ? updateEntry(entry) : createEntry(entry));
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  async function remove(id: string) {
    await removeEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function getEntry(id: string): ListEntry | null {
    return entries.find((e) => e.id === id) ?? null;
  }

  return { entries, loading, addOrUpdate, remove, getEntry };
}
