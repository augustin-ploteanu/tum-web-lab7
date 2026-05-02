import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ListEntry } from '../../src/types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

function loadFromDisk(): Map<string, ListEntry> {
  if (!existsSync(DB_PATH)) return new Map();
  try {
    const raw = readFileSync(DB_PATH, 'utf-8');
    const arr = JSON.parse(raw) as ListEntry[];
    return new Map(arr.map((e) => [e.id, e]));
  } catch {
    console.warn('[store] Failed to parse db.json, starting fresh.');
    return new Map();
  }
}

function saveToDisk(): void {
  writeFileSync(DB_PATH, JSON.stringify(Array.from(entries.values()), null, 2), 'utf-8');
}

const entries = loadFromDisk();

export function getAllEntries(): ListEntry[] {
  return Array.from(entries.values());
}

export function getEntry(id: string): ListEntry | undefined {
  return entries.get(id);
}

export function setEntry(entry: ListEntry): void {
  entries.set(entry.id, entry);
  saveToDisk();
}

export function deleteEntry(id: string): boolean {
  const deleted = entries.delete(id);
  if (deleted) saveToDisk();
  return deleted;
}

