import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ListEntry } from '../../src/types/index.js';
import { getAllEntries, getEntry, setEntry, deleteEntry } from '../data/store.js';

const router = Router();

/** GET /entries?page=1&limit=20 */
router.get('/', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));

  const all = getAllEntries();
  const start = (page - 1) * limit;
  const entries = all.slice(start, start + limit);

  res.json({ entries, total: all.length, page, limit });
});

/** GET /entries/:id */
router.get('/:id', (req: Request, res: Response) => {
  const entry = getEntry(req.params['id'] as string);
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.json(entry);
});

/** POST /entries */
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<ListEntry>;
  if (!body.id || !body.item || !body.category) {
    res.status(400).json({ error: 'Missing required fields: id, item, category' });
    return;
  }
  if (getEntry(body.id)) {
    res.status(409).json({ error: 'Entry already exists. Use PUT to update.' });
    return;
  }
  const entry = body as ListEntry;
  setEntry(entry);
  res.status(201).json(entry);
});

/** PUT /entries/:id */
router.put('/:id', (req: Request, res: Response) => {
  const body = req.body as Partial<ListEntry>;
  if (!getEntry(req.params['id'] as string)) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  if (!body.id || !body.item || !body.category) {
    res.status(400).json({ error: 'Missing required fields: id, item, category' });
    return;
  }
  const entry = { ...body, id: req.params['id'] as string } as ListEntry;
  setEntry(entry);
  res.json(entry);
});

/** DELETE /entries/:id */
router.delete('/:id', (req: Request, res: Response) => {
  if (!deleteEntry(req.params['id'] as string)) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.status(204).send();
});

export default router;
