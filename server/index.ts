import express from 'express';
import cors from 'cors';
import { JWT_EXPIRES_IN } from './config.js';
import tokenRouter from './routes/token.js';
import entriesRouter from './routes/entries.js';

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
