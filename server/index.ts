import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import swaggerUi from 'swagger-ui-express';
import { JWT_EXPIRES_IN } from './config.js';
import tokenRouter from './routes/token.js';
import entriesRouter from './routes/entries.js';

const PORT = process.env.PORT ?? 3001;

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDocument = parse(readFileSync(join(__dirname, 'swagger.yaml'), 'utf-8')) as object;

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/token', tokenRouter);
app.use('/entries', entriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI:    http://localhost:${PORT}/docs`);
  console.log(`JWT expires in: ${JWT_EXPIRES_IN}`);
});
