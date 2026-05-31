import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './utils/http.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.frontendOrigin === '*' ? true : env.frontendOrigin.split(',').map((origin) => origin.trim()),
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

