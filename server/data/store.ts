import type { ListEntry } from '../../src/types/index.js';

// In-memory store
const entries = new Map<string, ListEntry>();

export function getAllEntries(): ListEntry[] {
  return Array.from(entries.values());
}

export function getEntry(id: string): ListEntry | undefined {
  return entries.get(id);
}

export function setEntry(entry: ListEntry): void {
  entries.set(entry.id, entry);
}

export function deleteEntry(id: string): boolean {
  return entries.delete(id);
}
