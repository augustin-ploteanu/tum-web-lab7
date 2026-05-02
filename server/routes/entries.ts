import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ entries: [], total: 0 });
});

export default router;
