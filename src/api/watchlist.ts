import type { ListEntry } from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3001';

export interface EntriesPage {
  entries: ListEntry[];
  total: number;
  page: number;
  limit: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json() as T;

  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? res.statusText;
    throw new Error(`${res.status}: ${msg}`);
  }

  return data;
}

export function fetchEntries(page = 1, limit = 100): Promise<EntriesPage> {
  return request<EntriesPage>(`/entries?page=${page}&limit=${limit}`);
}

export function createEntry(entry: ListEntry): Promise<ListEntry> {
  return request<ListEntry>('/entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export function updateEntry(entry: ListEntry): Promise<ListEntry> {
  return request<ListEntry>(`/entries/${encodeURIComponent(entry.id)}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  });
}

export function removeEntry(id: string): Promise<void> {
  return request<void>(`/entries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
