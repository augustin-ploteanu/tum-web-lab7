import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../index.js';

const router = Router();

//POST /token
router.post('/', (_req, res) => {
  const payload = {
    role: 'ADMIN',
    permissions: ['READ', 'WRITE', 'DELETE'],
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token });
});

export default router;
