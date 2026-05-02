import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ListEntry, WatchableItem } from '../../src/types/index.js';
import { getAllEntries, getEntry, setEntry, deleteEntry } from '../data/store.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// All /entries routes require a valid JWT
router.use(requireAuth);

/** Strip fields from item that aren't needed for list display */
function slimItem(item: WatchableItem): WatchableItem {
  const { id, media_type, title, name, poster_path, release_date, first_air_date } = item;
  return { id, media_type, title, name, poster_path, release_date, first_air_date } as WatchableItem;
}

function slimEntry(entry: ListEntry): ListEntry {
  return { ...entry, item: slimItem(entry.item) };
}

/** GET /entries?page=1&limit=20 */
router.get('/', requirePermission('READ'), (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));

  const all = getAllEntries();
  const start = (page - 1) * limit;
  const entries = all.slice(start, start + limit);

  res.json({ entries, total: all.length, page, limit });
});

/** GET /entries/:id */
router.get('/:id', requirePermission('READ'), (req: Request, res: Response) => {
  const entry = getEntry(req.params['id'] as string);
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.json(entry);
});

/** POST /entries */
router.post('/', requirePermission('WRITE'), (req: Request, res: Response) => {
  const body = req.body as Partial<ListEntry>;
  if (!body.id || !body.item || !body.category) {
    res.status(400).json({ error: 'Missing required fields: id, item, category' });
    return;
  }
  if (getEntry(body.id)) {
    res.status(409).json({ error: 'Entry already exists. Use PUT to update.' });
    return;
  }
  const entry = slimEntry(body as ListEntry);
  setEntry(entry);
  res.status(201).json(entry);
});

/** PUT /entries/:id */
router.put('/:id', requirePermission('WRITE'), (req: Request, res: Response) => {
  const body = req.body as Partial<ListEntry>;
  if (!getEntry(req.params['id'] as string)) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  if (!body.id || !body.item || !body.category) {
    res.status(400).json({ error: 'Missing required fields: id, item, category' });
    return;
  }
  const entry = slimEntry({ ...body, id: req.params['id'] as string } as ListEntry);
  setEntry(entry);
  res.json(entry);
});

/** DELETE /entries/:id */
router.delete('/:id', requirePermission('DELETE'), (req: Request, res: Response) => {
  if (!deleteEntry(req.params['id'] as string)) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.status(204).send();
});

export default router;
