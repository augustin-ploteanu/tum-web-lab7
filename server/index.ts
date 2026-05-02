import express from 'express';
import cors from 'cors';
import tokenRouter from './routes/token.js';
import entriesRouter from './routes/entries.js';

export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';
export const JWT_EXPIRES_IN = '1m';
const PORT = process.env.PORT ?? 3001;

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/token', tokenRouter);
app.use('/entries', entriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`JWT expires in: ${JWT_EXPIRES_IN}`);
});
