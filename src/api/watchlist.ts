import type { ListEntry } from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3001';

export interface EntriesPage {
  entries: ListEntry[];
  total: number;
  page: number;
  limit: number;
}

// Token cache — reuses the in-flight promise to avoid duplicate requests
let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  if (tokenPromise) return tokenPromise;

  tokenPromise = fetch(`${BASE_URL}/token`, { method: 'POST' })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch auth token');
      return res.json() as Promise<{ token: string }>;
    })
    .then(({ token }) => {
      cachedToken = token;
      tokenPromise = null;
      // Clear cache just before the 1-minute expiry so next call re-fetches
      setTimeout(() => { cachedToken = null; }, 55_000);
      return token;
    })
    .catch((err) => {
      tokenPromise = null;
      throw err;
    });

  return tokenPromise;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...init?.headers,
    },
  });

  // Token expired mid-session — clear cache and retry once
  if (res.status === 401) {
    cachedToken = null;
    const retryToken = await getToken();
    const retry = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${retryToken}`,
        ...init?.headers,
      },
    });
    if (retry.status === 204) return undefined as T;
    const retryData = await retry.json() as T;
    if (!retry.ok) throw new Error((retryData as { error?: string }).error ?? retry.statusText);
    return retryData;
  }

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
